import Phaser from 'phaser'

// import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'
import VendingMachine from '../items/VendingMachine'
import '../characters/MyPlayer'
import '../characters/OtherPlayer'
import MyPlayer from '../characters/MyPlayer'
import OtherPlayer from '../characters/OtherPlayer'
import PlayerSelector from '../characters/PlayerSelector'
import Network from '../services/Network'
import { IPlayer } from '../../../types/IOfficeState'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { ItemType } from '../../../types/Items'

import store from '../stores'
import { setFocused, setShowChat } from '../stores/ChatStore'
import { openSortingCeremony, setNearSortingHat } from '../stores/SortingStore'
import { NavKeys, Keyboard } from '../../../types/KeyboardState'
import { phaserEvents, Event } from '../events/EventCenter'
import { WandSpellSystem } from './WandSpellSystem'
import { HogwartsRoomManager, HogwartsRoomId } from './HogwartsRoomManager'
import { HogwartsLightingEffects } from './hogwarts/HogwartsLightingEffects'
import { MidAutumnParadeNPC } from './hogwarts/MidAutumnParadeNPC'
import { LanternManager } from './hogwarts/LanternManager'

export default class Game extends Phaser.Scene {
  network!: Network
  private cursors!: NavKeys
  private keyE!: Phaser.Input.Keyboard.Key
  private keyR!: Phaser.Input.Keyboard.Key
  private map!: Phaser.Tilemaps.Tilemap
  myPlayer!: MyPlayer
  private playerSelector!: PlayerSelector
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayerMap = new Map<string, OtherPlayer>()
  computerMap = new Map<string, Computer>()
  private allChairs: Chair[] = []
  private whiteboardMap = new Map<string, Whiteboard>()
  private lightingEffects!: HogwartsLightingEffects
  private sortingHatNear = false
  private readonly sortingHatPosition = { x: 1850, y: 1240 }
  private wandSpellSystem?: WandSpellSystem
  public roomManager!: HogwartsRoomManager
  private midAutumnParadeNPC?: MidAutumnParadeNPC
  public lanternManager!: LanternManager

  constructor() {
    super('game')
  }

  registerKeys() {
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D') as Keyboard),
    }

    // maybe we can have a dedicated method for adding keys if more keys are needed in the future
    this.keyE = this.input.keyboard.addKey('E')
    this.keyR = this.input.keyboard.addKey('R')
    this.input.keyboard.disableGlobalCapture()
    this.input.keyboard.on('keydown-ENTER', (event) => {
      store.dispatch(setShowChat(true))
      store.dispatch(setFocused(true))
    })
    this.input.keyboard.on('keydown-ESC', (event) => {
      store.dispatch(setShowChat(false))
    })
    this.input.keyboard.on('keydown-T', () => {
      if (this.sortingHatNear && !store.getState().chat.focused) {
        store.dispatch(openSortingCeremony())
      }
    })
    this.input.keyboard.on('keydown-E', () => {
      if (this.sortingHatNear && !store.getState().chat.focused && !this.playerSelector.selectedItem) {
        store.dispatch(openSortingCeremony())
      }
    })
    this.input.keyboard.on('keydown-H', () => {
      if (!store.getState().chat.focused) this.sendWave()
    })
    this.input.keyboard.on('keydown-F', () => {
      if (!store.getState().chat.focused) {
        window.dispatchEvent(new CustomEvent('skyoffice:toggle-floo-modal'))
      }
    })
    this.input.keyboard.on('keydown-L', () => {
      if (!store.getState().chat.focused) {
        window.dispatchEvent(new CustomEvent('skyoffice:toggle-wish-lantern'))
      }
    })
  }

  disableKeys() {
    this.input.keyboard.enabled = false
  }

  enableKeys() {
    this.input.keyboard.enabled = true
  }

  create(data: { network: Network }) {
    if (!data.network) {
      throw new Error('server instance missing')
    } else {
      this.network = data.network
    }

    createCharacterAnims(this.anims)

    // 1. Tấm nền đồ hoạ 2.5D Toàn Cảnh Lâu Đài Hogwarts (Hub & Spoke: 3600 x 2400)
    const mapW = 3600
    const mapH = 2400
    this.physics.world.setBounds(0, 0, mapW, mapH)
    this.cameras.main.setBounds(0, 0, mapW, mapH)
    this.cameras.main.zoom = 1.0

    // 2. Spawn nhân vật ở lối đi trung tâm Đại Sảnh (giữa Nhà Ravenclaw và Gryffindor)
    this.myPlayer = this.add.myPlayer(1800, 1450, 'adam', this.network.mySessionId)
    this.playerSelector = new PlayerSelector(this, 0, 0, 48, 48)

    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    // 3. Khởi tạo nến bay ma thuật và ánh sáng Chiaroscuro Hogwarts (tạo các texture ánh sáng trước)
    this.lightingEffects = new HogwartsLightingEffects(this)
    this.lightingEffects.init()

    // 4. Khởi tạo Quản lý Toàn Cảnh Lâu Đài Hogwarts & 4 Phòng Sinh Hoạt Chung
    this.roomManager = new HogwartsRoomManager(this, this.myPlayer, this.otherPlayerMap, this.network)
    this.roomManager.init('great_hall')

    this.cameras.main.startFollow(this.myPlayer, true, 0.08, 0.08)

    this.physics.add.collider(
      [this.myPlayer, this.myPlayer.playerContainer],
      this.roomManager.collidersGroup
    )

    // 5. Khởi tạo các nhân vật Hogwarts (NPC Giáo sư & Bé Rước Đèn Trung Thu & Quầy Trà Sữa)
    this.setupGreatHallNPCs()
    this.setupSortingHat()
    this.midAutumnParadeNPC = new MidAutumnParadeNPC(this, this.myPlayer)

    this.physics.add.overlap(
      this.playerSelector,
      this.roomManager.chairsGroup,
      this.handleItemSelectorOverlap,
      undefined,
      this
    )

    this.physics.add.overlap(
      this.myPlayer,
      this.otherPlayers,
      this.handlePlayersOverlap,
      undefined,
      this
    )

    // register network event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
    this.network.onItemUserAdded(this.handleItemUserAdded, this)
    this.network.onItemUserRemoved(this.handleItemUserRemoved, this)
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
    this.network.onPlayerEmote(this.handlePlayerEmote, this)

    // Spawn any existing players who were already in the room with a set name
    const currentRoom = this.network?.currentRoom
    if (currentRoom?.state?.players) {
      currentRoom.state.players.forEach((player: IPlayer, key: string) => {
        if (key !== this.network.mySessionId && player.name && player.name !== '') {
          this.handlePlayerJoined(player, key)
        }
      })
    }

    // 7. Khởi tạo hệ thống vung đũa vẽ bùa phép (Wand Gesture Drawing Spell System)
    this.wandSpellSystem = new WandSpellSystem(this, this.myPlayer, this.otherPlayerMap, this.network)
    phaserEvents.on(Event.CAST_SPELL, this.handleSpellCast, this)
    phaserEvents.on(Event.ROOM_CHANGED, this.handleRoomChanged, this)

    // 8. Khởi tạo hệ thống Thả Thiên Đăng Ước Nguyện Trung Thu (Wish Lanterns)
    this.lanternManager = new LanternManager(this, this.network)
    this.lanternManager.init()

    const onRoomChanged = (e: any) => {
      this.updateGreatHallEntitiesVisibility(e.detail?.roomId)
    }
    window.addEventListener('skyoffice:room-changed', onRoomChanged)

    this.events.on('shutdown', () => {
      phaserEvents.off(Event.CAST_SPELL, this.handleSpellCast, this)
      phaserEvents.off(Event.ROOM_CHANGED, this.handleRoomChanged, this)
      window.removeEventListener('skyoffice:room-changed', onRoomChanged)
      this.wandSpellSystem?.destroy()
      this.roomManager?.destroy()
      this.lightingEffects?.destroy()
      this.midAutumnParadeNPC?.destroy()
      this.lanternManager?.destroy()
    })
  }

  sendProximityChat(content: string) {
    const message = content.trim().slice(0, 120)
    if (!message || !this.myPlayer || !this.network) return
    this.myPlayer.updateDialogBubble(message)
    this.network.addChatMessage(message)
  }

  sendWave(fromButton = false) {
    if (!this.myPlayer || !this.network || (!fromButton && store.getState().chat.focused)) return
    this.sendSocialEmote('wave')
  }

  sendSocialEmote(emote: string) {
    const symbols: Record<string, string> = { wave: '👋', clap: '👏', heart: '❤️', laugh: '😂', magic: '✨' }
    if (!this.myPlayer || !this.network || !symbols[emote]) return
    this.myPlayer.showEmote(symbols[emote])
    this.network.sendEmote(emote)
  }

  private handleItemSelectorOverlap(playerSelector, selectionItem) {
    const currentItem = playerSelector.selectedItem as Item
    // currentItem is undefined if nothing was perviously selected
    if (currentItem) {
      // if the selection has not changed, do nothing
      if (currentItem === selectionItem || currentItem.depth >= selectionItem.depth) {
        return
      }
      // if selection changes, clear pervious dialog
      if (this.myPlayer.playerBehavior !== PlayerBehavior.SITTING) currentItem.clearDialogBox()
    }

    // set selected item and set up new dialog
    playerSelector.selectedItem = selectionItem
    selectionItem.onOverlapDialog()
  }

  private addStaticZoneCollider(
    group: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const zone = this.add.zone(x, y, w, h)
    this.physics.add.existing(zone, true)
    group.add(zone)
  }

  findClosestChair(x: number, y: number, maxDist: number = 55): Chair | undefined {
    let closest: Chair | undefined
    let minDist = maxDist
    for (const chair of this.roomManager?.activeChairs || []) {
      const dist = Phaser.Math.Distance.Between(x, y, chair.x, chair.y)
      if (dist < minDist) {
        minDist = dist
        closest = chair
      }
    }
    return closest
  }

  private greatHallEntities: Phaser.GameObjects.GameObject[] = []

  private setupGreatHallNPCs() {
    const addSeatedCharacter = (
      x: number,
      y: number,
      texture: string,
      scale: number = 0.038,
      flipX: boolean = true
    ) => {
      const img = this.add
        .image(x, y, texture)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setFlipX(flipX)
        .setDepth(y)
      this.greatHallEntities.push(img)
      return img
    }

    // High Table Dais (Ban Giám Hiệu Hogwarts ngồi trên ghế danh dự phía sau Bàn Trưởng Sảnh)
    addSeatedCharacter(1887, 1186, 'mcgonagall_seated', 0.038, true)
    addSeatedCharacter(1942, 1211, 'dumbledore_seated', 0.038, true)
    addSeatedCharacter(2017, 1246, 'snape_seated', 0.038, true)
  }

  public updateGreatHallEntitiesVisibility(roomId: HogwartsRoomId) {
    // In continuous castle world, entities are naturally positioned in their rooms
    for (const obj of this.greatHallEntities) {
      if (obj && 'setVisible' in obj) {
        ;(obj as any).setVisible(true)
      }
    }
  }

  // function to add new player to the otherPlayer group
  private handlePlayerJoined(newPlayer: IPlayer, id: string) {
    if (id === this.network.mySessionId || this.otherPlayerMap.has(id)) return
    const houseSuffix = newPlayer.house ? `_${newPlayer.house.toLowerCase()}` : ''
    const texture = `${newPlayer.texture || 'adam'}${houseSuffix}`
    const otherPlayer = this.add.otherPlayer(newPlayer.x, newPlayer.y, texture, id, newPlayer.name)
    otherPlayer.setHouseBadge(newPlayer.house)
    this.otherPlayers.add(otherPlayer)
    this.otherPlayerMap.set(id, otherPlayer)
  }

  // function to remove the player who left from the otherPlayer group
  private handlePlayerLeft(id: string) {
    if (this.otherPlayerMap.has(id)) {
      const otherPlayer = this.otherPlayerMap.get(id)
      if (!otherPlayer) return
      this.otherPlayers.remove(otherPlayer, true, true)
      this.otherPlayerMap.delete(id)
    }
  }

  private handleMyPlayerReady() {
    this.myPlayer.readyToConnect = true
  }

  private handleMyVideoConnected() {
    this.myPlayer.videoConnected = true
  }

  // function to update target position upon receiving player updates
  private handlePlayerUpdated(field: string, value: number | string, id: string) {
    const otherPlayer = this.otherPlayerMap.get(id)
    otherPlayer?.updateOtherPlayer(field, value)
  }

  private handlePlayersOverlap(myPlayer, otherPlayer) {
    if (this.network?.webRTC) {
      otherPlayer.makeCall(myPlayer, this.network.webRTC)
    }
  }

  private handleItemUserAdded(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.addCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.addCurrentUser(playerId)
    }
  }

  private handleItemUserRemoved(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.removeCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.removeCurrentUser(playerId)
    }
  }

  private handleChatMessageAdded(playerId: string, content: string) {
    const otherPlayer = this.otherPlayerMap.get(playerId)
    otherPlayer?.updateDialogBubble(content)
  }

  private handlePlayerEmote(playerId: string, emote: string) {
    const symbols: Record<string, string> = { wave: '👋', clap: '👏', heart: '❤️', laugh: '😂', magic: '✨' }
    if (!symbols[emote]) return
    this.otherPlayerMap.get(playerId)?.showEmote(symbols[emote])
  }

  private handleSpellCast(clientId: string, spell: string, x?: number, y?: number, dir?: string) {
    if (clientId === this.myPlayer?.playerId) return
    this.wandSpellSystem?.executeSpell(spell, clientId, x ?? 0, y ?? 0, dir ?? 'down')
  }

  private handleRoomChanged(clientId: string, roomId: HogwartsRoomId) {
    this.roomManager?.handleOtherPlayerRoomChange(clientId, roomId)
  }

  update(t: number, dt: number) {
    this.wandSpellSystem?.update()
    this.roomManager?.update(t, dt)
    this.midAutumnParadeNPC?.update(dt / 1000)
    if (this.myPlayer && this.network) {
      const nearSortingHat = Phaser.Math.Distance.Between(
        this.myPlayer.x,
        this.myPlayer.y,
        this.sortingHatPosition.x,
        this.sortingHatPosition.y
      ) < 76
      if (nearSortingHat !== this.sortingHatNear) {
        this.sortingHatNear = nearSortingHat
        store.dispatch(setNearSortingHat(nearSortingHat))
      }
      this.playerSelector.update(this.myPlayer, this.cursors)
      if (
        nearSortingHat &&
        this.playerSelector.selectedItem?.itemType === ItemType.CHAIR
      ) {
        this.playerSelector.selectedItem.clearDialogBox()
        this.playerSelector.selectedItem = undefined
      }
      this.myPlayer.update(this.playerSelector, this.cursors, this.keyE, this.keyR, this.network)
    }

    this.lightingEffects?.update(t)
  }

  private setupSortingHat() {
    const { x, y } = this.sortingHatPosition

    // Vòng sáng ma thuật huyền bí quanh Chiếc Nón
    const magicAura = this.add.graphics().setPosition(x, y - 5).setDepth(y + 8)
    magicAura.fillStyle(0xf4d98b, 0.22)
    magicAura.fillCircle(0, 0, 28)
    this.tweens.add({
      targets: magicAura,
      alpha: { from: 0.15, to: 0.4 },
      scaleX: { from: 0.85, to: 1.15 },
      scaleY: { from: 0.85, to: 1.15 },
      yoyo: true,
      repeat: -1,
      duration: 1800,
      ease: 'Sine.easeInOut',
    })

    const hat = this.add.graphics().setPosition(x, y).setDepth(y + 20)
    hat.fillStyle(0x5a3a20, 1)
    hat.beginPath()
    hat.moveTo(-19, -3)
    hat.lineTo(-12, -23)
    hat.lineTo(-3, -16)
    hat.lineTo(10, -31)
    hat.lineTo(12, -12)
    hat.lineTo(22, -4)
    hat.closePath()
    hat.fillPath()
    hat.fillStyle(0x9b6b32, 1)
    hat.fillEllipse(0, -4, 47, 10)
    hat.lineStyle(2, 0x2e2017, 0.9)
    hat.strokeEllipse(0, -4, 47, 10)

    const stool = this.add.graphics().setPosition(x, y + 10).setDepth(y + 15)
    stool.fillStyle(0x65451f, 1)
    stool.fillRoundedRect(-17, 0, 34, 8, 2)
    stool.fillRect(-13, 7, 4, 16)
    stool.fillRect(9, 7, 4, 16)

    // Tương tác trực tiếp bằng click chuột hoặc chạm màn hình vào nón
    const hitZone = this.add
      .zone(x, y + 10, 60, 60)
      .setOrigin(0.5, 0.5)
      .setDepth(5000)
      .setInteractive({ useHandCursor: true })
    hitZone.on('pointerdown', () => {
      store.dispatch(openSortingCeremony())
    })

    const hatText = this.add
      .text(x, y + 31, 'Chiếc Nón Phân Loại', {
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        color: '#f4d98b',
        stroke: '#23180f',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(5000)
      .setInteractive({ useHandCursor: true })
    hatText.on('pointerdown', () => {
      store.dispatch(openSortingCeremony())
    })

    this.greatHallEntities.push(magicAura, hat, stool, hitZone, hatText)
  }
}

