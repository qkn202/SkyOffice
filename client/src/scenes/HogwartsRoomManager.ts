import Phaser from 'phaser'
import Chair from '../items/Chair'
import MyPlayer from '../characters/MyPlayer'
import OtherPlayer from '../characters/OtherPlayer'
import Network from '../services/Network'
import {
  HogwartsRoomId,
  HOGWARTS_WORLD_WIDTH,
  HOGWARTS_WORLD_HEIGHT,
  GH_OFFSET,
  ROOM_SPAWNS,
  ROOM_METADATA,
  getRoomAtPosition,
  setupWorldColliders,
  setupWorldChairs,
} from './hogwarts/RoomDefinitions'

export type { HogwartsRoomId }

export class HogwartsRoomManager {
  public scene: Phaser.Scene
  public myPlayer: MyPlayer
  public otherPlayerMap: Map<string, OtherPlayer>
  public network: Network
  public currentRoomId: HogwartsRoomId = 'great_hall'

  public bgImage!: Phaser.GameObjects.Image
  public collidersGroup!: Phaser.Physics.Arcade.StaticGroup
  public chairsGroup!: Phaser.Physics.Arcade.StaticGroup
  public activeChairs: Chair[] = []

  // Interactive Overlays & Lighting
  public roomFXObjects: Phaser.GameObjects.GameObject[] = []
  public flooLight?: Phaser.GameObjects.Image
  public hearthLights: Phaser.GameObjects.Image[] = []

  private isTeleporting: boolean = false
  private roomBannerText?: Phaser.GameObjects.Text
  private lastAnnouncedRoom: HogwartsRoomId = 'great_hall'

  constructor(
    scene: Phaser.Scene,
    myPlayer: MyPlayer,
    otherPlayerMap: Map<string, OtherPlayer>,
    network: Network
  ) {
    this.scene = scene
    this.myPlayer = myPlayer
    this.otherPlayerMap = otherPlayerMap
    this.network = network

    this.collidersGroup = this.scene.physics.add.staticGroup()
    this.chairsGroup = this.scene.physics.add.staticGroup({ classType: Chair })
  }

  public init(initialRoom: HogwartsRoomId = 'great_hall') {
    // 1. Tấm nền đồ hoạ 2.5D Toàn Cảnh Lâu Đài Hogwarts (Hub & Spoke: 3600 x 2400)
    this.bgImage = this.scene.add
      .image(0, 0, 'hogwarts_castle_world')
      .setOrigin(0, 0)
      .setDisplaySize(HOGWARTS_WORLD_WIDTH, HOGWARTS_WORLD_HEIGHT)
      .setDepth(-1000)

    // 2. Thiết lập ranh giới vật lý & bàn ghế xuyên suốt 5 khu vực
    setupWorldColliders(this)
    setupWorldChairs(this)

    // 3. Ánh sáng ma thuật & lò sưởi 4 Nhà
    this.setupAtmosphericLighting()

    // 4. Khởi tạo trạng thái phòng ban đầu
    this.currentRoomId = initialRoom
    this.lastAnnouncedRoom = initialRoom
    const meta = ROOM_METADATA[initialRoom]
    window.dispatchEvent(
      new CustomEvent('skyoffice:room-changed', {
        detail: { roomId: initialRoom, name: meta.name, badge: meta.houseBadge },
      })
    )
  }

  private ensureLightingTextures() {
    if (!this.scene.textures.exists('light_halo_warm')) {
      const haloCanvas = this.scene.textures.createCanvas('light_halo_warm', 128, 128)
      if (haloCanvas) {
        const ctx = haloCanvas.getContext()
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
        grad.addColorStop(0, 'rgba(255, 205, 85, 0.5)')
        grad.addColorStop(0.4, 'rgba(255, 140, 30, 0.25)')
        grad.addColorStop(0.8, 'rgba(200, 80, 10, 0.08)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 128, 128)
        haloCanvas.refresh()
      }
    }

    if (!this.scene.textures.exists('light_halo_floo')) {
      const flooCanvas = this.scene.textures.createCanvas('light_halo_floo', 160, 160)
      if (flooCanvas) {
        const ctx = flooCanvas.getContext()
        const grad = ctx.createRadialGradient(80, 80, 0, 80, 80, 80)
        grad.addColorStop(0, 'rgba(50, 255, 130, 0.65)')
        grad.addColorStop(0.35, 'rgba(25, 210, 95, 0.4)')
        grad.addColorStop(0.7, 'rgba(10, 150, 65, 0.15)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 160, 160)
        flooCanvas.refresh()
      }
    }
  }

  private setupAtmosphericLighting() {
    this.ensureLightingTextures()

    // 1. Lò Sưởi Floo Đại Sảnh
    this.flooLight = this.scene.add
      .image(GH_OFFSET.x + 800, GH_OFFSET.y + 460, 'light_halo_floo')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3502)
      .setScale(2.2)
      .setAlpha(0.65)
    this.roomFXObjects.push(this.flooLight)

    // 2. Lò sưởi Tháp Gryffindor (Ánh lửa ấm áp)
    const gryLight = this.scene.add
      .image(1200, 590, 'light_halo_warm')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3501)
      .setScale(2.2, 1.8)
      .setAlpha(0.7)
    this.hearthLights.push(gryLight)

    // 3. Lò sưởi Hầm Slytherin (Ánh sáng xanh ngọc lục bảo)
    const slyLight = this.scene.add
      .image(1200, 1790, 'light_halo_floo')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3501)
      .setScale(2.2, 1.8)
      .setAlpha(0.55)
    this.hearthLights.push(slyLight)

    // 4. Đèn vòm Tháp Ravenclaw (Ánh sáng xanh thiên văn)
    const ravLight = this.scene.add
      .image(2680, 590, 'light_halo_warm')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3501)
      .setScale(2.2, 1.8)
      .setAlpha(0.5)
    this.hearthLights.push(ravLight)

    // 5. Đèn vòm Tầng Hầm Hufflepuff (Ánh sáng vàng mật ong)
    const hufLight = this.scene.add
      .image(2680, 1790, 'light_halo_warm')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3501)
      .setScale(2.2, 1.8)
      .setAlpha(0.65)
    this.hearthLights.push(hufLight)

    this.roomFXObjects.push(...this.hearthLights)
  }

  public addStaticZoneCollider(x: number, y: number, w: number, h: number) {
    const zone = this.scene.add.zone(x, y, w, h)
    this.scene.physics.add.existing(zone, true)
    this.collidersGroup.add(zone)
  }

  public addInteractiveChair(x: number, y: number, dir: string, depth: number) {
    const chair = this.chairsGroup.get(x, y, 'chairs', 0) as Chair
    if (!chair) return
    chair.itemDirection = dir
    chair.setAlpha(0.001)
    chair.setDepth(depth)
    if (chair.body) {
      chair.body.setSize(44, 44)
      chair.refreshBody()
    }
    this.activeChairs.push(chair)
  }

  public getFlooPortalPosition(): { x: number; y: number } {
    return { x: GH_OFFSET.x + 800, y: GH_OFFSET.y + 460 }
  }

  public switchRoom(targetRoomId: HogwartsRoomId, playAnimation: boolean = true) {
    if (this.isTeleporting) return
    const spawn = ROOM_SPAWNS[targetRoomId] || ROOM_SPAWNS.great_hall

    if (!playAnimation) {
      this.myPlayer.setPosition(spawn.x, spawn.y)
      if (this.myPlayer.playerContainer) {
        this.myPlayer.playerContainer.setPosition(spawn.x, spawn.y - 30)
      }
      this.onRoomChanged(targetRoomId)
      return
    }

    this.isTeleporting = true
    this.scene.cameras.main.fade(280, 6, 15, 12, false, (_cam: any, progress: number) => {
      if (progress >= 1) {
        this.myPlayer.setPosition(spawn.x, spawn.y)
        if (this.myPlayer.playerContainer) {
          this.myPlayer.playerContainer.setPosition(spawn.x, spawn.y - 30)
        }
        this.onRoomChanged(targetRoomId)
        this.scene.cameras.main.fadeIn(300, 6, 15, 12)
        this.scene.time.delayedCall(400, () => {
          this.isTeleporting = false
        })
      }
    })
  }

  private onRoomChanged(newRoom: HogwartsRoomId) {
    this.currentRoomId = newRoom
    const meta = ROOM_METADATA[newRoom]

    this.network.changeRoom(newRoom)
    window.dispatchEvent(
      new CustomEvent('skyoffice:room-changed', {
        detail: { roomId: newRoom, name: meta.name, badge: meta.houseBadge },
      })
    )

    this.showRoomAnnouncement(`${meta.houseBadge} ${meta.name}`)
  }

  private showRoomAnnouncement(text: string) {
    if (this.roomBannerText) {
      this.roomBannerText.destroy()
    }

    const { x, y } = this.myPlayer
    this.roomBannerText = this.scene.add
      .text(x, y - 55, text, {
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#fdf3c6',
        backgroundColor: '#120d09d8',
        padding: { x: 10, y: 4 },
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(9999)

    this.scene.tweens.add({
      targets: this.roomBannerText,
      y: '-=20',
      alpha: { from: 1, to: 0 },
      duration: 2500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.roomBannerText?.destroy()
        this.roomBannerText = undefined
      },
    })
  }

  public handleOtherPlayerRoomChange(_clientId: string, _roomId: HogwartsRoomId) {
    // In continuous world mode, all players are in the same seamless castle space
  }

  public update(t: number, _dt: number) {
    if (!this.myPlayer) return

    // 1. Phát hiện tự động khu vực phòng theo toạ độ đi bộ
    const currentPosRoom = getRoomAtPosition(this.myPlayer.x, this.myPlayer.y)
    if (currentPosRoom !== this.lastAnnouncedRoom) {
      this.lastAnnouncedRoom = currentPosRoom
      this.onRoomChanged(currentPosRoom)
    }

    // 2. Nhịp thở ngọn lửa Floo
    if (this.flooLight && this.flooLight.active) {
      this.flooLight.setAlpha(0.45 + Math.sin(t * 0.005) * 0.18)
    }

    // 3. Nhịp bập bùng ngọn lửa các lò sưởi
    for (const h of this.hearthLights) {
      if (h && h.active) {
        h.setAlpha(0.55 + Math.sin(t * 0.006) * 0.15)
      }
    }
  }

  public destroy() {
    if (this.bgImage) this.bgImage.destroy()
    for (const obj of this.roomFXObjects) obj.destroy()
    this.collidersGroup.destroy(true)
    this.chairsGroup.destroy(true)
  }
}
