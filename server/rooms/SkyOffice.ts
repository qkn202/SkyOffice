import bcrypt from 'bcrypt'
import { Room, Client, ServerError } from 'colyseus'
import { Dispatcher } from '@colyseus/command'
import { Player, OfficeState, Computer, Whiteboard } from './schema/OfficeState'
import { Message } from '../../types/Messages'
import { IRoomData } from '../../types/Rooms'
import { whiteboardRoomIds } from './schema/OfficeState'
import PlayerUpdateCommand from './commands/PlayerUpdateCommand'
import PlayerUpdateNameCommand from './commands/PlayerUpdateNameCommand'
import {
  ComputerAddUserCommand,
  ComputerRemoveUserCommand,
} from './commands/ComputerUpdateArrayCommand'
import {
  WhiteboardAddUserCommand,
  WhiteboardRemoveUserCommand,
} from './commands/WhiteboardUpdateArrayCommand'
import ChatMessageUpdateCommand from './commands/ChatMessageUpdateCommand'

type CommunityEvent = {
  id: string
  title: string
  description: string
  startsAt: number
  createdBy: string
  attendeeIds: Set<string>
}

type MiniGameLobby = {
  gameId: 'seven-potters' | 'undercover-hogwarts'
  roomCode: string
  hostSessionId: string
  invitedBy: string
  readySessionIds: Set<string>
}

export class SkyOffice extends Room<OfficeState> {
  private dispatcher = new Dispatcher(this)
  private emoteCooldowns = new Map<string, number>()
  private minigameInviteCooldowns = new Map<string, number>()
  private communityEventCooldowns = new Map<string, number>()
  private miniGameLobby: MiniGameLobby | null = null
  private communityEvents: CommunityEvent[] = []
  private name: string
  private description: string
  private password: string | null = null

  async onCreate(options: IRoomData) {
    const { name, description, password, autoDispose } = options
    this.name = name
    this.description = description
    this.autoDispose = autoDispose

    let hasPassword = false
    if (password) {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(password, salt)
      hasPassword = true
    }
    this.setMetadata({ name, description, hasPassword })

    this.setState(new OfficeState())

    // HARD-CODED: Add 5 computers in a room
    for (let i = 0; i < 5; i++) {
      this.state.computers.set(String(i), new Computer())
    }

    // HARD-CODED: Add 3 whiteboards in a room
    for (let i = 0; i < 3; i++) {
      this.state.whiteboards.set(String(i), new Whiteboard())
    }

    // when a player connect to a computer, add to the computer connectedUser array
    this.onMessage(Message.CONNECT_TO_COMPUTER, (client, message: { computerId: string }) => {
      this.dispatcher.dispatch(new ComputerAddUserCommand(), {
        client,
        computerId: message.computerId,
      })
    })

    // when a player disconnect from a computer, remove from the computer connectedUser array
    this.onMessage(Message.DISCONNECT_FROM_COMPUTER, (client, message: { computerId: string }) => {
      this.dispatcher.dispatch(new ComputerRemoveUserCommand(), {
        client,
        computerId: message.computerId,
      })
    })

    // when a player stop sharing screen
    this.onMessage(Message.STOP_SCREEN_SHARE, (client, message: { computerId: string }) => {
      const computer = this.state.computers.get(message.computerId)
      computer.connectedUser.forEach((id) => {
        this.clients.forEach((cli) => {
          if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
            cli.send(Message.STOP_SCREEN_SHARE, client.sessionId)
          }
        })
      })
    })

    // when a player connect to a whiteboard, add to the whiteboard connectedUser array
    this.onMessage(Message.CONNECT_TO_WHITEBOARD, (client, message: { whiteboardId: string }) => {
      this.dispatcher.dispatch(new WhiteboardAddUserCommand(), {
        client,
        whiteboardId: message.whiteboardId,
      })
    })

    // when a player disconnect from a whiteboard, remove from the whiteboard connectedUser array
    this.onMessage(
      Message.DISCONNECT_FROM_WHITEBOARD,
      (client, message: { whiteboardId: string }) => {
        this.dispatcher.dispatch(new WhiteboardRemoveUserCommand(), {
          client,
          whiteboardId: message.whiteboardId,
        })
      }
    )

    // when receiving updatePlayer message, call the PlayerUpdateCommand
    this.onMessage(
      Message.UPDATE_PLAYER,
      (client, message: { x: number; y: number; anim: string }) => {
        this.dispatcher.dispatch(new PlayerUpdateCommand(), {
          client,
          x: message.x,
          y: message.y,
          anim: message.anim,
        })
      }
    )

    this.onMessage(
      Message.UPDATE_PLAYER_APPEARANCE,
      (client, message: { house: string; texture: string }) => {
        const player = this.state.players.get(client.sessionId)
        if (!player) return

        const validHouses = ['GRYFFINDOR', 'SLYTHERIN', 'RAVENCLAW', 'HUFFLEPUFF', '']
        const validTextures = ['adam', 'ash', 'lucy', 'nancy']
        if (!validHouses.includes(message.house) || !validTextures.includes(message.texture)) return

        player.house = message.house
        player.texture = message.texture
      }
    )

    // when receiving updatePlayerName message, call the PlayerUpdateNameCommand
    this.onMessage(Message.UPDATE_PLAYER_NAME, (client, message: { name: string }) => {
      this.dispatcher.dispatch(new PlayerUpdateNameCommand(), {
        client,
        name: message.name,
      })
    })

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.READY_TO_CONNECT, (client) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.readyToConnect = true
    })

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.VIDEO_CONNECTED, (client) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.videoConnected = true
    })

    // when a player disconnect a stream, broadcast the signal to the other player connected to the stream
    this.onMessage(Message.DISCONNECT_STREAM, (client, message: { clientId: string }) => {
      this.clients.forEach((cli) => {
        if (cli.sessionId === message.clientId) {
          cli.send(Message.DISCONNECT_STREAM, client.sessionId)
        }
      })
    })

    // when a player send a chat message, update the message array and broadcast to all connected clients except the sender
    this.onMessage(Message.ADD_CHAT_MESSAGE, (client, message: { content: string }) => {
      const player = this.state.players.get(client.sessionId)
      const content = typeof message?.content === 'string' ? message.content.trim().slice(0, 120) : ''
      if (!player || !content) return

      // update the message array (so that players join later can also see the message)
      this.dispatcher.dispatch(new ChatMessageUpdateCommand(), {
        client,
        content,
      })

      // Nearby players see the message bubble; distant players do not.
      const radiusSquared = 320 * 320
      this.clients.forEach((recipient) => {
        if (recipient.sessionId === client.sessionId) return
        const nearbyPlayer = this.state.players.get(recipient.sessionId)
        if (!nearbyPlayer) return
        const dx = nearbyPlayer.x - player.x
        const dy = nearbyPlayer.y - player.y
        if (dx * dx + dy * dy <= radiusSquared) {
          recipient.send(Message.ADD_CHAT_MESSAGE, { clientId: client.sessionId, content })
        }
      })
    })

    this.onMessage(Message.PLAYER_EMOTE, (client, message: { emote: string }) => {
      const emotes: Record<string, string> = {
        wave: '👋',
        clap: '👏',
        heart: '❤️',
        laugh: '😂',
        magic: '✨',
      }
      if (!message?.emote || !emotes[message.emote] || !this.state.players.has(client.sessionId)) return
      const now = Date.now()
      const lastEmoteAt = this.emoteCooldowns.get(client.sessionId) || 0
      if (now - lastEmoteAt < 900) return
      this.emoteCooldowns.set(client.sessionId, now)
      this.broadcast(Message.PLAYER_EMOTE, { clientId: client.sessionId, emote: message.emote })
    })

    this.onMessage(
      Message.CAST_SPELL,
      (client, message: { spell: string; x?: number; y?: number; dir?: string }) => {
        const validSpells = [
          'lumos',
          'nox',
          'wingardium',
          'patronus',
          'incendio',
          'protego',
          'expelliarmus',
        ]
        if (!message?.spell || !validSpells.includes(message.spell) || !this.state.players.has(client.sessionId)) return
        this.broadcast(Message.CAST_SPELL, {
          clientId: client.sessionId,
          spell: message.spell,
          x: message.x,
          y: message.y,
          dir: message.dir,
        })
      }
    )

    this.onMessage(Message.CHANGE_ROOM, (client, message: { roomId: string }) => {
      const player = this.state.players.get(client.sessionId)
      if (!player || !message?.roomId) return
      this.broadcast(Message.CHANGE_ROOM, {
        clientId: client.sessionId,
        roomId: message.roomId,
      })
    })

    this.onMessage(
      Message.MINIGAME_INVITE,
      (client, message: { gameId?: string; roomCode?: string }) => {
        if (!this.state.players.has(client.sessionId)) return
        const gameId = message?.gameId
        if (gameId !== 'seven-potters' && gameId !== 'undercover-hogwarts') return

        const now = Date.now()
        const lastInviteAt = this.minigameInviteCooldowns.get(client.sessionId) || 0
        if (now - lastInviteAt < 5000) return
        this.minigameInviteCooldowns.set(client.sessionId, now)

        const rawRoomCode = typeof message.roomCode === 'string' ? message.roomCode.trim().toUpperCase() : ''
        const roomCode = /^[A-Z0-9]{3,8}$/.test(rawRoomCode) ? rawRoomCode : ''
        const player = this.state.players.get(client.sessionId)
        this.miniGameLobby = {
          gameId,
          roomCode,
          hostSessionId: client.sessionId,
          invitedBy: player?.name || 'Một phù thủy',
          readySessionIds: new Set([client.sessionId]),
        }
        this.publishMiniGameLobby()
      }
    )

    this.onMessage(Message.MINIGAME_READY, (client, message: { ready?: boolean }) => {
      const lobby = this.miniGameLobby
      if (!lobby || !this.state.players.has(client.sessionId)) return
      if (message?.ready) lobby.readySessionIds.add(client.sessionId)
      else lobby.readySessionIds.delete(client.sessionId)
      this.publishMiniGameReadyState()
    })

    this.onMessage(Message.MINIGAME_START, (client) => {
      const lobby = this.miniGameLobby
      if (!lobby || lobby.hostSessionId !== client.sessionId || lobby.readySessionIds.size < 2) return
      this.broadcast(Message.MINIGAME_START, {
        gameId: lobby.gameId,
        roomCode: lobby.roomCode,
      })
    })

    this.onMessage(Message.MINIGAME_CANCEL, (client) => {
      if (!this.miniGameLobby || this.miniGameLobby.hostSessionId !== client.sessionId) return
      this.miniGameLobby = null
      this.broadcast(Message.MINIGAME_CANCEL)
    })

    this.onMessage(
      Message.COMMUNITY_EVENT_CREATE,
      (client, message: { title?: string; description?: string; startsAt?: number }) => {
        const player = this.state.players.get(client.sessionId)
        if (!player) return
        const now = Date.now()
        const lastCreatedAt = this.communityEventCooldowns.get(client.sessionId) || 0
        if (now - lastCreatedAt < 30_000) {
          client.send(Message.COMMUNITY_EVENT_RESULT, { ok: false, message: 'Chờ 30 giây giữa các lần đăng sự kiện.' })
          return
        }

        const title = typeof message?.title === 'string' ? message.title.trim().slice(0, 60) : ''
        const description = typeof message?.description === 'string' ? message.description.trim().slice(0, 180) : ''
        const startsAt = Number(message?.startsAt)
        if (title.length < 4 || description.length < 8) {
          client.send(Message.COMMUNITY_EVENT_RESULT, { ok: false, message: 'Tên cần 4 ký tự và mô tả cần 8 ký tự trở lên.' })
          return
        }
        if (!Number.isSafeInteger(startsAt) || startsAt < now + 60_000 || startsAt > now + 90 * 24 * 60 * 60 * 1000) {
          client.send(Message.COMMUNITY_EVENT_RESULT, { ok: false, message: 'Thời gian phải từ một phút tới 90 ngày kể từ bây giờ.' })
          return
        }

        this.communityEvents = this.communityEvents.filter((event) => event.startsAt > now - 24 * 60 * 60 * 1000)
        if (this.communityEvents.length >= 12) {
          client.send(Message.COMMUNITY_EVENT_RESULT, { ok: false, message: 'Bảng sự kiện đã đủ 12 hoạt động.' })
          return
        }
        this.communityEventCooldowns.set(client.sessionId, now)
        const event: CommunityEvent = {
          id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          title,
          description,
          startsAt,
          createdBy: player.name || 'Một phù thủy',
          attendeeIds: new Set([client.sessionId]),
        }
        this.communityEvents.push(event)
        this.publishCommunityEvents()
        client.send(Message.COMMUNITY_EVENT_RESULT, { ok: true, message: 'Đã đăng sự kiện.' })
      }
    )

    this.onMessage(Message.COMMUNITY_EVENT_RSVP, (client, message: { eventId?: string }) => {
      const event = this.communityEvents.find((item) => item.id === message?.eventId)
      if (!event || !this.state.players.has(client.sessionId)) return
      if (event.attendeeIds.has(client.sessionId)) event.attendeeIds.delete(client.sessionId)
      else event.attendeeIds.add(client.sessionId)
      this.publishCommunityEvents()
    })

    this.onMessage(Message.REQUEST_SOCIAL_STATE, (client) => {
      this.sendCommunityEvents(client)
      if (this.miniGameLobby) {
        const invite = this.getMiniGameLobbyPayload(client.sessionId)
        if (invite) client.send(Message.MINIGAME_INVITE, invite)
      }
    })
  }

  async onAuth(client: Client, options: { password: string | null }) {
    if (this.password) {
      const validPassword = await bcrypt.compare(options.password, this.password)
      if (!validPassword) {
        throw new ServerError(403, 'Password is incorrect!')
      }
    }
    return true
  }

  onJoin(client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player())
    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
      description: this.description,
    })
  }

  onLeave(client: Client, consented: boolean) {
    this.emoteCooldowns.delete(client.sessionId)
    this.minigameInviteCooldowns.delete(client.sessionId)
    this.communityEventCooldowns.delete(client.sessionId)
    this.miniGameLobby?.readySessionIds.delete(client.sessionId)
    if (this.miniGameLobby?.hostSessionId === client.sessionId) {
      this.miniGameLobby = null
      this.broadcast(Message.MINIGAME_CANCEL)
    } else if (this.miniGameLobby) {
      this.publishMiniGameReadyState()
    }
    this.communityEvents.forEach((event) => event.attendeeIds.delete(client.sessionId))
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId)
    }
    this.state.computers.forEach((computer) => {
      if (computer.connectedUser.has(client.sessionId)) {
        computer.connectedUser.delete(client.sessionId)
      }
    })
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboard.connectedUser.has(client.sessionId)) {
        whiteboard.connectedUser.delete(client.sessionId)
      }
    })
    this.publishCommunityEvents()
  }

  private getMiniGameLobbyPayload(sessionId: string) {
    const lobby = this.miniGameLobby
    if (!lobby) return null
    const readyPlayers = Array.from(lobby.readySessionIds).map((id) => this.state.players.get(id)?.name || 'Phù thủy')
    return {
      gameId: lobby.gameId,
      roomCode: lobby.roomCode,
      invitedBy: lobby.invitedBy,
      isHost: lobby.hostSessionId === sessionId,
      readyPlayers,
      readySessionIds: Array.from(lobby.readySessionIds),
    }
  }

  private publishMiniGameLobby() {
    this.clients.forEach((client) => {
      const invite = this.getMiniGameLobbyPayload(client.sessionId)
      if (invite) client.send(Message.MINIGAME_INVITE, invite)
    })
  }

  private publishMiniGameReadyState() {
    const lobby = this.miniGameLobby
    if (!lobby) return
    const state = {
      gameId: lobby.gameId,
      roomCode: lobby.roomCode,
      readyPlayers: Array.from(lobby.readySessionIds).map((id) => this.state.players.get(id)?.name || 'Phù thủy'),
      readySessionIds: Array.from(lobby.readySessionIds),
    }
    this.broadcast(Message.MINIGAME_READY_STATE, state)
  }

  private publishCommunityEvents() {
    const now = Date.now()
    this.communityEvents = this.communityEvents.filter((event) => event.startsAt > now - 24 * 60 * 60 * 1000)
    this.clients.forEach((client) => {
      this.sendCommunityEvents(client)
    })
  }

  private sendCommunityEvents(client: Client) {
    this.communityEvents = this.communityEvents.filter((event) => event.startsAt > Date.now() - 24 * 60 * 60 * 1000)
    const events = this.communityEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      createdBy: event.createdBy,
      attendeeCount: event.attendeeIds.size,
      attendeeNames: Array.from(event.attendeeIds).map((id) => this.state.players.get(id)?.name || 'Phù thủy'),
      isAttending: event.attendeeIds.has(client.sessionId),
    }))
    client.send(Message.COMMUNITY_EVENT_SNAPSHOT, { events })
  }

  onDispose() {
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboardRoomIds.has(whiteboard.roomId)) whiteboardRoomIds.delete(whiteboard.roomId)
    })

    console.log('room', this.roomId, 'disposing...')
    this.dispatcher.stop()
  }
}
