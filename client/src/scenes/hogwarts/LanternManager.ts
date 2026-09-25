import Phaser from 'phaser'
import { phaserEvents, Event } from '../../events/EventCenter'
import type Network from '../../services/Network'

export interface LanternData {
  id: string
  text: string
  color: 'red' | 'gold' | 'green' | 'blue' | 'star'
  visibility: 'public' | 'private' | 'direct'
  senderSessionId: string
  senderName: string
  recipientSessionId?: string
  recipientName?: string
  isAnonymous: boolean
  x: number
  y: number
  createdAt: number
}

const COLOR_TINTS: Record<string, number> = {
  gold: 0xffd700,
  red: 0xff4757,
  green: 0x2ed573,
  blue: 0x3867d6,
  star: 0xfffa65,
}

export class LanternManager {
  private scene: Phaser.Scene
  private network: Network
  private activeLanterns: Map<string, Phaser.GameObjects.Container> = new Map()
  private openDialogContainer: Phaser.GameObjects.Container | null = null
  private ambientTimer?: Phaser.Time.TimerEvent

  constructor(scene: Phaser.Scene, network: Network) {
    this.scene = scene
    this.network = network
  }

  public init() {
    this.ensureTextures()

    // Listen for network lantern releases
    phaserEvents.on(Event.LANTERN_RELEASED, this.handleLanternReleased, this)

    // Spawn occasional ambient floating lanterns across the castle
    this.ambientTimer = this.scene.time.addEvent({
      delay: 7000,
      callback: this.spawnRandomAmbientLantern,
      callbackScope: this,
      loop: true,
    })
  }

  private ensureTextures() {
    if (!this.scene.textures.exists('lantern_sparkle')) {
      const canvas = this.scene.textures.createCanvas('lantern_sparkle', 8, 8)
      if (canvas) {
        const ctx = canvas.getContext()
        ctx.fillStyle = '#fff9d2'
        ctx.beginPath()
        ctx.arc(4, 4, 3, 0, Math.PI * 2)
        ctx.fill()
        canvas.refresh()
      }
    }
  }

  public handleLanternReleased(data: LanternData) {
    this.spawnFloatingLantern(data)
  }

  public spawnFloatingLantern(data: LanternData, isAmbient = false) {
    const startX = data.x ?? 1800
    const startY = data.y ?? 1450
    const textureKey = `lantern_${data.color}` in this.scene.textures.list ? `lantern_${data.color}` : 'lantern_gold'
    const tintColor = COLOR_TINTS[data.color] || 0xffd700

    const container = this.scene.add.container(startX, startY)
    container.setDepth(startY + 50)

    // 1. Warm radial halo glow
    const halo = this.scene.add.image(0, 0, 'light_halo_warm')
    halo.setScale(0.85)
    halo.setTint(tintColor)
    halo.setAlpha(0.65)
    container.add(halo)

    // 2. Glow pulsing tween
    this.scene.tweens.add({
      targets: halo,
      scale: { from: 0.8, to: 1.05 },
      alpha: { from: 0.5, to: 0.8 },
      duration: 1200 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // 3. Lantern sprite
    const sprite = this.scene.add.image(0, 0, textureKey)
    sprite.setOrigin(0.5, 0.5)
    container.add(sprite)

    // 4. Subtle privacy/type badge above lantern
    let badgeChar = '✨'
    if (data.visibility === 'private') badgeChar = '🔒'
    else if (data.visibility === 'direct') badgeChar = '💌'
    else if (data.color === 'star') badgeChar = '⭐'

    const badge = this.scene.add.text(0, -28, badgeChar, {
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5)
    container.add(badge)

    // 5. Interactivity - click to read wish (Option 3)
    if (!isAmbient) {
      sprite.setInteractive({ useHandCursor: true })
      sprite.on('pointerover', () => {
        this.scene.tweens.add({
          targets: [sprite, halo],
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 150,
        })
      })
      sprite.on('pointerout', () => {
        this.scene.tweens.add({
          targets: [sprite, halo],
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 150,
        })
      })
      sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation()
        this.openWishParchment(data, container)
      })
    }

    // 6. Flight animation: sway horizontally and rise up across the Great Hall into the starry sky
    const riseDistance = 900 + Math.random() * 300
    const targetY = startY - riseDistance
    const totalDuration = 32000 + Math.random() * 8000
    const swayAmplitude = 25 + Math.random() * 20
    const swayDuration = 2500 + Math.random() * 1000

    // Horizontal sway tween
    this.scene.tweens.add({
      targets: container,
      x: {
        from: startX - swayAmplitude,
        to: startX + swayAmplitude,
      },
      duration: swayDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Vertical flight & fade tween
    this.scene.tweens.add({
      targets: container,
      y: targetY,
      duration: totalDuration,
      ease: 'Linear',
      onUpdate: (tween) => {
        // Slowly shrink as it ascends into the high sky
        const progress = tween.progress
        const currentScale = 1.0 - progress * 0.45
        sprite.setScale(currentScale)
        halo.setScale(currentScale * 0.85)

        // Fade out in the last 20% of its flight
        if (progress > 0.8) {
          const fadeAlpha = (1.0 - progress) / 0.2
          container.setAlpha(fadeAlpha)
        }
      },
      onComplete: () => {
        container.destroy()
        this.activeLanterns.delete(data.id)
      },
    })

    this.activeLanterns.set(data.id, container)
    return container
  }

  /**
   * Option 3 Wish Viewer: Displays the wish respecting privacy permissions.
   */
  public openWishParchment(data: LanternData, anchorContainer: Phaser.GameObjects.Container) {
    if (this.openDialogContainer) {
      this.openDialogContainer.destroy()
      this.openDialogContainer = null
    }

    const mySessionId = this.network?.mySessionId
    const isAuthor = mySessionId === data.senderSessionId
    const isRecipient = data.visibility === 'direct' && mySessionId === data.recipientSessionId

    let titleText = '🏮 THIÊN ĐĂNG TRUNG THU'
    let titleColor = '#ffd700'
    let fromText = `Từ: ${data.senderName || 'Ẩn danh'}`
    let bodyText = data.text || ''
    let footerNote = ''

    if (data.visibility === 'public') {
      titleText = '🏮 ĐIỀU ƯỚC TRUNG THU'
      titleColor = '#ffda79'
      bodyText = `"${data.text}"`
    } else if (data.visibility === 'private') {
      titleText = '🔒 ĐIỀU ƯỚC BÍ MẬT'
      titleColor = '#e1b12c'
      if (isAuthor) {
        bodyText = `"${data.text}"`
        footerNote = '(Chỉ riêng bạn mới đọc được)'
      } else {
        bodyText = 'Đây là điều ước bí mật,\nchỉ người thả mới có thể đọc!'
        fromText = 'Người gửi: Một phù thủy giấu tên'
      }
    } else if (data.visibility === 'direct') {
      titleText = '💌 TÂM THƯ GỬI BẠN'
      titleColor = '#ff6b81'
      const recipientLabel = data.recipientName || 'bạn hiền'
      fromText = `${data.senderName} ➔ ${recipientLabel}`
      if (isAuthor || isRecipient) {
        bodyText = `"${data.text}"`
        footerNote = isRecipient ? '(Thư gửi riêng cho bạn ✨)' : '(Thư bạn gửi riêng)'
      } else {
        bodyText = `Đèn lồng gửi riêng cho ${recipientLabel}.\nNội dung được giữ bí mật!`
      }
    }

    // Create parchment popup container
    const dialog = this.scene.add.container(anchorContainer.x, anchorContainer.y - 80)
    dialog.setDepth(99999)

    const boxWidth = 260
    const boxHeight = 130

    // Parchment dark glass background
    const bg = this.scene.add.graphics()
    bg.fillStyle(0x16120e, 0.92)
    bg.lineStyle(2, 0xd4af37, 1)
    bg.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 10)
    bg.strokeRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 10)
    dialog.add(bg)

    // Inner gold border line
    const innerBorder = this.scene.add.graphics()
    innerBorder.lineStyle(1, 0x5a4628, 0.8)
    innerBorder.strokeRoundedRect(-boxWidth / 2 + 4, -boxHeight / 2 + 4, boxWidth - 8, boxHeight - 8, 8)
    dialog.add(innerBorder)

    // Title
    const titleObj = this.scene.add.text(0, -boxHeight / 2 + 16, titleText, {
      fontFamily: 'serif, Georgia, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: titleColor,
      align: 'center',
    }).setOrigin(0.5, 0.5)
    dialog.add(titleObj)

    // Sender / Receiver
    const metaObj = this.scene.add.text(0, -boxHeight / 2 + 34, fromText, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#c8b89e',
      align: 'center',
    }).setOrigin(0.5, 0.5)
    dialog.add(metaObj)

    // Wish content body
    const bodyObj = this.scene.add.text(0, 3, bodyText, {
      fontFamily: 'serif, Georgia, sans-serif',
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#f5ede0',
      align: 'center',
      wordWrap: { width: boxWidth - 28 },
    }).setOrigin(0.5, 0.5)
    dialog.add(bodyObj)

    // Footer note if any
    if (footerNote) {
      const footerObj = this.scene.add.text(0, boxHeight / 2 - 14, footerNote, {
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#e056fd',
        align: 'center',
      }).setOrigin(0.5, 0.5)
      dialog.add(footerObj)
    }

    // Close button [x]
    const closeBtn = this.scene.add.text(boxWidth / 2 - 16, -boxHeight / 2 + 14, '✕', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#a08868',
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true })

    closeBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation()
      dialog.destroy()
      if (this.openDialogContainer === dialog) this.openDialogContainer = null
    })
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff4757'))
    closeBtn.on('pointerout', () => closeBtn.setColor('#a08868'))
    dialog.add(closeBtn)

    // Gentle bounce entrance
    dialog.setScale(0.7)
    dialog.setAlpha(0)
    this.scene.tweens.add({
      targets: dialog,
      scale: 1.0,
      alpha: 1.0,
      duration: 200,
      ease: 'Back.easeOut',
    })

    // Follow lantern upward smoothly while open
    const followTimer = this.scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        if (!anchorContainer.active) {
          dialog.destroy()
          followTimer.destroy()
        } else {
          dialog.x = anchorContainer.x
          dialog.y = anchorContainer.y - 80
        }
      },
    })

    // Auto close after 10s
    this.scene.time.delayedCall(10000, () => {
      if (dialog.active) {
        followTimer.destroy()
        this.scene.tweens.add({
          targets: dialog,
          alpha: 0,
          scale: 0.8,
          duration: 250,
          onComplete: () => dialog.destroy(),
        })
      }
    })

    this.openDialogContainer = dialog
  }

  private spawnRandomAmbientLantern() {
    // Only spawn if player is in Hogwarts Great Hall area
    const colors: Array<'gold' | 'red' | 'green' | 'blue' | 'star'> = ['gold', 'red', 'gold', 'star']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const randomX = 1400 + Math.random() * 800
    const randomY = 1600 + Math.random() * 300

    this.spawnFloatingLantern(
      {
        id: `ambient_${Date.now()}_${Math.random()}`,
        text: 'Trung Thu Vui Vẻ!',
        color: randomColor,
        visibility: 'public',
        senderSessionId: 'ambient',
        senderName: 'Lâu Đài Hogwarts',
        isAnonymous: true,
        x: randomX,
        y: randomY,
        createdAt: Date.now(),
      },
      true
    )
  }

  public destroy() {
    phaserEvents.off(Event.LANTERN_RELEASED, this.handleLanternReleased, this)
    this.ambientTimer?.destroy()
    if (this.openDialogContainer) {
      this.openDialogContainer.destroy()
      this.openDialogContainer = null
    }
    this.activeLanterns.forEach((container) => container.destroy())
    this.activeLanterns.clear()
  }
}
