import { Client, Room } from 'colyseus.js'
import { IComputer, IOfficeState, IPlayer, IWhiteboard } from '../../../types/IOfficeState'
import { Message } from '../../../types/Messages'
import { IRoomData, RoomType } from '../../../types/Rooms'
import { ItemType } from '../../../types/Items'
import WebRTC from '../web/WebRTC'
import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { setSessionId, setPlayerNameMap, removePlayerNameMap } from '../stores/UserStore'
import {
  setLobbyJoined,
  setLobbyConnectionError,
  setConnectionLost,
  setReconnecting,
  setJoinedRoomData,
  setAvailableRooms,
  addAvailableRooms,
  removeAvailableRooms,
} from '../stores/RoomStore'
import {
  pushChatMessage,
  pushPlayerJoinedMessage,
  pushPlayerLeftMessage,
} from '../stores/ChatStore'
import { setWhiteboardUrls } from '../stores/WhiteboardStore'
import { setOnlineProfiles, setSocialEvents, type OnlineProfile, type SocialEvent } from '../stores/SocialStore'

export default class Network {
  private client: Client
  private room?: Room<IOfficeState>
  private lobby!: Room
  webRTC?: WebRTC
  private lastOnlineProfileSyncAt = 0
  private lobbyConnecting = false
  private lobbyRetryTimer?: number
  private lobbyRetryAttempt = 0
  private intentionalLeave = false

  mySessionId!: string

  get currentRoom(): Room<IOfficeState> | undefined {
    return this.room
  }

  constructor() {
    const urlParams = new URLSearchParams(window.location.search)
    const customServer = urlParams.get('server')
    const protocol = window.location.protocol.replace('http', 'ws')
    const host =
      !window.location.hostname || window.location.hostname === '0.0.0.0'
        ? 'localhost'
        : window.location.hostname

    const isVercel = window.location.hostname.includes('vercel.app')
    const defaultVercelEndpoint = 'wss://rapid-word-centuries-levy.trycloudflare.com'

    const endpoint =
      customServer ||
      import.meta.env.VITE_SERVER_URL ||
      (isVercel ? defaultVercelEndpoint : `${protocol}//${host}:2567`)

    this.client = new Client(endpoint)
    void this.connectLobby()

    phaserEvents.on(Event.MY_PLAYER_NAME_CHANGE, this.updatePlayerName, this)
    phaserEvents.on(Event.MY_PLAYER_TEXTURE_CHANGE, this.updatePlayer, this)
    phaserEvents.on(Event.PLAYER_DISCONNECTED, this.playerStreamDisconnect, this)
  }

  retryLobbyConnection() {
    window.clearTimeout(this.lobbyRetryTimer)
    this.lobbyRetryTimer = undefined
    void this.connectLobby()
  }

  private scheduleLobbyRetry() {
    if (this.room || this.lobbyRetryTimer !== undefined) return
    const delay = Math.min(1000 * 2 ** Math.min(this.lobbyRetryAttempt++, 4), 10_000)
    this.lobbyRetryTimer = window.setTimeout(() => {
      this.lobbyRetryTimer = undefined
      void this.connectLobby()
    }, delay)
  }

  private async connectLobby() {
    if (this.room || this.lobbyConnecting || store.getState().room.lobbyJoined) return
    this.lobbyConnecting = true
    try {
      await this.joinLobbyRoom()
      this.lobbyRetryAttempt = 0
      store.dispatch(setLobbyConnectionError(''))
      store.dispatch(setLobbyJoined(true))
    } catch (error) {
      store.dispatch(setLobbyJoined(false))
      store.dispatch(setLobbyConnectionError('Chưa kết nối được máy chủ. Hệ thống đang tự thử lại…'))
      this.scheduleLobbyRetry()
    } finally {
      this.lobbyConnecting = false
    }
  }

  /**
   * method to join Colyseus' built-in LobbyRoom, which automatically notifies
   * connected clients whenever rooms with "realtime listing" have updates
   */
  async joinLobbyRoom() {
    this.lobby = await this.client.joinOrCreate(RoomType.LOBBY)

    this.lobby.onLeave(() => {
      store.dispatch(setLobbyJoined(false))
      if (this.room) return // Leaving the lobby to enter a game is intentional.
      store.dispatch(setAvailableRooms([]))
      store.dispatch(setLobbyConnectionError('Mất kết nối máy chủ. Hệ thống đang tự thử lại…'))
      this.scheduleLobbyRetry()
    })

    this.lobby.onMessage('rooms', (rooms) => {
      store.dispatch(setAvailableRooms(rooms))
    })

    this.lobby.onMessage('+', ([roomId, room]) => {
      store.dispatch(addAvailableRooms({ roomId, room }))
    })

    this.lobby.onMessage('-', (roomId) => {
      store.dispatch(removeAvailableRooms(roomId))
    })
  }

  // method to join the public lobby
  async joinOrCreatePublic() {
    this.room = await this.client.joinOrCreate(RoomType.PUBLIC)
    this.initialize()
  }

  // method to join a custom room
  async joinCustomById(roomId: string, password: string | null) {
    this.room = await this.client.joinById(roomId, { password })
    this.initialize()
  }

  // method to create a custom room
  async createCustom(roomData: IRoomData) {
    const { name, description, password, autoDispose } = roomData
    this.room = await this.client.create(RoomType.CUSTOM, {
      name,
      description,
      password,
      autoDispose,
    })
    this.initialize()
  }

  // set up all network listeners before the game starts
  initialize() {
    if (!this.room) return

    window.clearTimeout(this.lobbyRetryTimer)
    this.lobbyRetryTimer = undefined
    store.dispatch(setConnectionLost(false))
    store.dispatch(setReconnecting({ isReconnecting: false }))
    const roomId = this.room.id
    const sessionId = this.room.sessionId

    this.room.onLeave(async (code) => {
      console.warn(`[Network] Room left with code ${code}. Attempting automatic reconnect...`)
      if (this.intentionalLeave) {
        store.dispatch(setConnectionLost(true))
        return
      }

      store.dispatch(setReconnecting({ isReconnecting: true, attempt: 1 }))

      // Automatically retry reconnecting with backoff (up to 8 attempts over ~25s)
      for (let attempt = 1; attempt <= 8; attempt++) {
        try {
          store.dispatch(setReconnecting({ isReconnecting: true, attempt }))
          const delay = Math.min(1000 + (attempt - 1) * 500, 4000)
          await new Promise((r) => setTimeout(r, delay))
          const reconnectedRoom = await this.client.reconnect(roomId, sessionId)
          this.room = reconnectedRoom as Room<IOfficeState>
          this.initialize()
          store.dispatch(setReconnecting({ isReconnecting: false }))
          store.dispatch(setConnectionLost(false))
          console.log('[Network] Successfully reconnected to room!')
          return
        } catch (e) {
          console.warn(`[Network] Reconnect attempt ${attempt} failed:`, e)
        }
      }

      store.dispatch(setReconnecting({ isReconnecting: false }))
      store.dispatch(setConnectionLost(true))
    })
    void this.lobby.leave().catch(() => {})
    this.mySessionId = this.room.sessionId
    store.dispatch(setSessionId(this.room.sessionId))
    // WebRTC disabled for pure text & multiplayer mode
    // this.webRTC = new WebRTC(this.mySessionId, this)

    // new instance added to the players MapSchema
    this.room.state.players.onAdd = (player: IPlayer, key: string) => {
      // If player already has a name when added (joined before us or already named):
      if (key !== this.mySessionId && player.name && player.name !== '') {
        phaserEvents.emit(Event.PLAYER_JOINED, player, key)
        store.dispatch(setPlayerNameMap({ id: key, name: player.name }))
      }

      // track changes on every child object inside the players MapSchema
      player.onChange = (changes) => {
        changes.forEach((change) => {
          const { field, value } = change
          if (key === this.mySessionId) return
          phaserEvents.emit(Event.PLAYER_UPDATED, field, value, key)

          // when a new player finished setting up player name
          if (field === 'name' && value !== '') {
            phaserEvents.emit(Event.PLAYER_JOINED, player, key)
            store.dispatch(setPlayerNameMap({ id: key, name: value }))
            store.dispatch(pushPlayerJoinedMessage(value))
          }
        })
        this.syncOnlineProfiles()
      }
      this.syncOnlineProfiles(true)
    }

    this.room.state.players.forEach((player: IPlayer, key: string) => {
      this.room?.state.players.onAdd?.(player, key)
    })

    // an instance removed from the players MapSchema
    this.room.state.players.onRemove = (player: IPlayer, key: string) => {
      phaserEvents.emit(Event.PLAYER_LEFT, key)
      this.webRTC?.deleteVideoStream(key)
      this.webRTC?.deleteOnCalledVideoStream(key)
      store.dispatch(pushPlayerLeftMessage(player.name))
      store.dispatch(removePlayerNameMap(key))
      this.syncOnlineProfiles(true)
    }

    // new instance added to the computers MapSchema
    this.room.state.computers.onAdd = (computer: IComputer, key: string) => {
      // track changes on every child object's connectedUser
      computer.connectedUser.onAdd = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_ADDED, item, key, ItemType.COMPUTER)
      }
      computer.connectedUser.onRemove = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_REMOVED, item, key, ItemType.COMPUTER)
      }
    }

    // new instance added to the whiteboards MapSchema
    this.room.state.whiteboards.onAdd = (whiteboard: IWhiteboard, key: string) => {
      store.dispatch(
        setWhiteboardUrls({
          whiteboardId: key,
          roomId: whiteboard.roomId,
        })
      )
      // track changes on every child object's connectedUser
      whiteboard.connectedUser.onAdd = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_ADDED, item, key, ItemType.WHITEBOARD)
      }
      whiteboard.connectedUser.onRemove = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_REMOVED, item, key, ItemType.WHITEBOARD)
      }
    }

    // new instance added to the chatMessages ArraySchema
    this.room.state.chatMessages.onAdd = (item, index) => {
      store.dispatch(pushChatMessage(item))
    }

    // when the server sends room data
    this.room.onMessage(Message.SEND_ROOM_DATA, (content) => {
      store.dispatch(setJoinedRoomData(content))
    })

    // when a user sends a message
    this.room.onMessage(Message.ADD_CHAT_MESSAGE, ({ clientId, content }) => {
      phaserEvents.emit(Event.UPDATE_DIALOG_BUBBLE, clientId, content)
    })

    this.room.onMessage(Message.PLAYER_EMOTE, ({ clientId, emote }) => {
      phaserEvents.emit(Event.PLAYER_EMOTE, clientId, emote)
    })

    this.room.onMessage(Message.CAST_SPELL, ({ clientId, spell, x, y, dir }) => {
      phaserEvents.emit(Event.CAST_SPELL, clientId, spell, x, y, dir)
    })

    this.room.onMessage(Message.CHANGE_ROOM, ({ clientId, roomId }) => {
      phaserEvents.emit(Event.ROOM_CHANGED, clientId, roomId)
    })

    this.room.onMessage(Message.LANTERN_RELEASED, (lantern) => {
      phaserEvents.emit(Event.LANTERN_RELEASED, lantern)
      window.dispatchEvent(new CustomEvent('skyoffice:lantern-released', { detail: lantern }))
    })

    this.room.onMessage(Message.MINIGAME_INVITE, (invite) => {
      window.dispatchEvent(new CustomEvent('skyoffice:minigame-invite', { detail: invite }))
    })

    this.room.onMessage(Message.MINIGAME_READY_STATE, (state) => {
      window.dispatchEvent(new CustomEvent('skyoffice:minigame-ready-state', { detail: state }))
    })

    this.room.onMessage(Message.MINIGAME_START, (state) => {
      window.dispatchEvent(new CustomEvent('skyoffice:minigame-start', { detail: state }))
    })

    this.room.onMessage(Message.MINIGAME_CANCEL, () => {
      window.dispatchEvent(new CustomEvent('skyoffice:minigame-cancel'))
    })

    this.room.onMessage(Message.COMMUNITY_EVENT_SNAPSHOT, (snapshot: { events: SocialEvent[] }) => {
      store.dispatch(setSocialEvents(snapshot.events || []))
    })

    this.room.onMessage(Message.COMMUNITY_EVENT_RESULT, (result) => {
      window.dispatchEvent(new CustomEvent('skyoffice:community-event-result', { detail: result }))
    })

    this.syncOnlineProfiles()
    this.room.send(Message.REQUEST_SOCIAL_STATE)

    // when a peer disconnects with myPeer
    this.room.onMessage(Message.DISCONNECT_STREAM, (clientId: string) => {
      this.webRTC?.deleteOnCalledVideoStream(clientId)
    })

    // when a computer user stops sharing screen
    this.room.onMessage(Message.STOP_SCREEN_SHARE, (clientId: string) => {
      const computerState = store.getState().computer
      computerState.shareScreenManager?.onUserLeft(clientId)
    })
  }

  // method to register event listener and call back function when a item user added
  onChatMessageAdded(callback: (playerId: string, content: string) => void, context?: any) {
    phaserEvents.on(Event.UPDATE_DIALOG_BUBBLE, callback, context)
  }

  onPlayerEmote(callback: (playerId: string, emote: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_EMOTE, callback, context)
  }

  inviteMiniGame(gameId: 'seven-potters' | 'undercover-hogwarts', roomCode: string) {
    this.room?.send(Message.MINIGAME_INVITE, { gameId, roomCode })
  }

  setMiniGameReady(ready: boolean) {
    this.room?.send(Message.MINIGAME_READY, { ready })
  }

  startMiniGame() {
    this.room?.send(Message.MINIGAME_START)
  }

  cancelMiniGameLobby() {
    this.room?.send(Message.MINIGAME_CANCEL)
  }

  createCommunityEvent(title: string, description: string, startsAt: number) {
    this.room?.send(Message.COMMUNITY_EVENT_CREATE, { title, description, startsAt })
  }

  toggleCommunityEventAttendance(eventId: string) {
    this.room?.send(Message.COMMUNITY_EVENT_RSVP, { eventId })
  }

  releaseLantern(data: {
    text: string
    color?: string
    visibility?: 'public' | 'private' | 'direct'
    recipientSessionId?: string
    recipientName?: string
    isAnonymous?: boolean
    x?: number
    y?: number
  }) {
    this.room?.send(Message.RELEASE_LANTERN, data)
  }

  private syncOnlineProfiles(force = false) {
    if (!this.room) return
    const now = Date.now()
    if (!force && now - this.lastOnlineProfileSyncAt < 1000) return
    this.lastOnlineProfileSyncAt = now
    const profiles: OnlineProfile[] = []
    this.room.state.players.forEach((player, sessionId) => {
      profiles.push({
        sessionId,
        name: player.name || 'Phù thủy mới',
        house: player.house || '',
        texture: player.texture || 'adam',
        x: player.x,
        y: player.y,
      })
    })
    store.dispatch(setOnlineProfiles(profiles))
  }

  // method to register event listener and call back function when a item user added
  onItemUserAdded(
    callback: (playerId: string, key: string, itemType: ItemType) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ITEM_USER_ADDED, callback, context)
  }

  // method to register event listener and call back function when a item user removed
  onItemUserRemoved(
    callback: (playerId: string, key: string, itemType: ItemType) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ITEM_USER_REMOVED, callback, context)
  }

  // method to register event listener and call back function when a player joined
  onPlayerJoined(callback: (Player: IPlayer, key: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_JOINED, callback, context)
  }

  // method to register event listener and call back function when a player left
  onPlayerLeft(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_LEFT, callback, context)
  }

  // method to register event listener and call back function when myPlayer is ready to connect
  onMyPlayerReady(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_READY, callback, context)
  }

  // method to register event listener and call back function when my video is connected
  onMyPlayerVideoConnected(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_VIDEO_CONNECTED, callback, context)
  }

  // method to register event listener and call back function when a player updated
  onPlayerUpdated(
    callback: (field: string, value: number | string, key: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_UPDATED, callback, context)
  }

  // method to send player updates to Colyseus server
  updatePlayer(currentX: number, currentY: number, currentAnim: string) {
    this.room?.send(Message.UPDATE_PLAYER, { x: currentX, y: currentY, anim: currentAnim })
  }

  // method to send player name to Colyseus server
  updatePlayerName(currentName: string) {
    this.room?.send(Message.UPDATE_PLAYER_NAME, { name: currentName })
  }

  updatePlayerAppearance(house: string, texture: string) {
    this.room?.send(Message.UPDATE_PLAYER_APPEARANCE, { house, texture })
  }

  // method to send ready-to-connect signal to Colyseus server
  readyToConnect() {
    this.room?.send(Message.READY_TO_CONNECT)
    phaserEvents.emit(Event.MY_PLAYER_READY)
  }

  // method to send ready-to-connect signal to Colyseus server
  videoConnected() {
    this.room?.send(Message.VIDEO_CONNECTED)
    phaserEvents.emit(Event.MY_PLAYER_VIDEO_CONNECTED)
  }

  // method to send stream-disconnection signal to Colyseus server
  playerStreamDisconnect(id: string) {
    this.room?.send(Message.DISCONNECT_STREAM, { clientId: id })
    this.webRTC?.deleteVideoStream(id)
  }

  connectToComputer(id: string) {
    this.room?.send(Message.CONNECT_TO_COMPUTER, { computerId: id })
  }

  disconnectFromComputer(id: string) {
    this.room?.send(Message.DISCONNECT_FROM_COMPUTER, { computerId: id })
  }

  connectToWhiteboard(id: string) {
    this.room?.send(Message.CONNECT_TO_WHITEBOARD, { whiteboardId: id })
  }

  disconnectFromWhiteboard(id: string) {
    this.room?.send(Message.DISCONNECT_FROM_WHITEBOARD, { whiteboardId: id })
  }

  onStopScreenShare(id: string) {
    this.room?.send(Message.STOP_SCREEN_SHARE, { computerId: id })
  }

  addChatMessage(content: string) {
    this.room?.send(Message.ADD_CHAT_MESSAGE, { content })
  }

  sendEmote(emote: string) {
    this.room?.send(Message.PLAYER_EMOTE, { emote })
  }

  castSpell(spell: string, x?: number, y?: number, dir?: string) {
    this.room?.send(Message.CAST_SPELL, { spell, x, y, dir })
  }

  changeRoom(roomId: string) {
    this.room?.send(Message.CHANGE_ROOM, { roomId })
  }
}
