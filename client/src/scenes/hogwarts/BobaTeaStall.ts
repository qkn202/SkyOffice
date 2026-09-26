import Phaser from 'phaser'
import MyPlayer from '../../characters/MyPlayer'

export class BobaTeaStall {
  scene: Phaser.Scene
  myPlayer: MyPlayer
  container: Phaser.GameObjects.Container

  stallBase: Phaser.GameObjects.Graphics
  canopy: Phaser.GameObjects.Graphics
  barista: Phaser.GameObjects.Graphics
  signboard: Phaser.GameObjects.Container
  speechBubble: Phaser.GameObjects.Container
  speechText: Phaser.GameObjects.Text
  steamAura: Phaser.GameObjects.Graphics
  hitZone: Phaser.GameObjects.Zone

  isPlayerNear = false
  animTimer = 0
  chatTimer = 0
  currentChatIdx = 0

  readonly x = 1500
  readonly y = 1180

  readonly CHAT_PROMPTS = [
    '🧋 Phù thủy ơi, thử ngay Trà Sữa Mật Ong Hufflepuff béo ngậy nha!',
    '🦁 Hồng trà Gryffindor sôi động bùng nổ năng lượng!',
    '🐍 Trà Ô Long Slytherin thêm thạch ánh trăng cực cuốn!',
    '🦅 Lục trà Ravenclaw thơm ngát tinh thông trí tuệ!',
    '✨ Nhấn vào quầy hoặc bấm [E] để vào ca pha chế kiếm Galleon!',
  ]

  constructor(scene: Phaser.Scene, myPlayer: MyPlayer) {
    this.scene = scene
    this.myPlayer = myPlayer

    this.container = this.scene.add.container(this.x, this.y).setDepth(this.y + 10)

    // 1. Warm Golden Magical Light Halo on the Floor
    const halo = this.scene.add.graphics()
    halo.fillStyle(0xffbe3b, 0.2)
    halo.fillEllipse(0, 25, 130, 45)
    this.container.add(halo)

    // 2. Wooden Stall Counter & Framework
    this.stallBase = this.scene.add.graphics()
    this.drawStallCounter()
    this.container.add(this.stallBase)

    // 3. Cute NPC Barista Witch
    this.barista = this.scene.add.graphics()
    this.drawBaristaWitch()
    this.container.add(this.barista)

    // 4. Striped Canopy / Awning Roof
    this.canopy = this.scene.add.graphics()
    this.drawCanopy()
    this.container.add(this.canopy)

    // 5. Magical Steam / Bubbling Smoke from Boba Jars
    this.steamAura = this.scene.add.graphics()
    this.container.add(this.steamAura)

    // 6. Glowing Signboard
    this.signboard = this.createSignboard()
    this.container.add(this.signboard)

    // 7. Interactive Speech Bubble
    const { bubble, text } = this.createSpeechBubble()
    this.speechBubble = bubble
    this.speechText = text
    this.container.add(this.speechBubble)

    // 8. Hit Zone for Mouse Click / Mobile Tap
    this.hitZone = this.scene.add
      .zone(0, -10, 140, 110)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
    this.hitZone.on('pointerdown', () => {
      this.openShopModal()
    })
    this.container.add(this.hitZone)

    // Key E trigger when standing nearby
    this.scene.input.keyboard.on('keydown-E', () => {
      if (this.isPlayerNear) {
        this.openShopModal()
      }
    })
  }

  private drawStallCounter() {
    const g = this.stallBase
    g.clear()

    // Shadow
    g.fillStyle(0x1a120b, 0.4)
    g.fillRoundedRect(-58, 20, 116, 12, 4)

    // Main Oak Wooden Cart Body
    g.fillStyle(0x54361e, 1)
    g.fillRoundedRect(-52, -5, 104, 34, 4)
    g.lineStyle(2, 0x331f10, 1)
    g.strokeRoundedRect(-52, -5, 104, 34, 4)

    // Wood Planks Detailing
    g.lineStyle(1, 0x3f2714, 0.8)
    g.lineBetween(-52, 6, 52, 6)
    g.lineBetween(-52, 17, 52, 17)

    // Countertop Slab (Polished Mahogany)
    g.fillStyle(0x784a27, 1)
    g.fillRoundedRect(-56, -11, 112, 10, 3)
    g.lineStyle(1.5, 0x9c6537, 1)
    g.strokeRoundedRect(-56, -11, 112, 10, 3)

    // 4 Glass Tea Dispensers on the Counter (Gryffindor Red, Slytherin Green, Ravenclaw Blue, Hufflepuff Gold)
    const jars = [
      { x: -38, col: 0xd63031, tea: 'Hồng Trà' },
      { x: -18, col: 0x00b894, tea: 'Ô Long' },
      { x: 18, col: 0x0984e3, tea: 'Lục Trà' },
      { x: 38, col: 0xfdcb6e, tea: 'Trà Sữa' },
    ]
    jars.forEach((j) => {
      // Glass container
      g.fillStyle(0x2d3436, 0.4)
      g.fillRoundedRect(j.x - 7, -26, 14, 16, 2)
      // Glowing liquid
      g.fillStyle(j.col, 0.85)
      g.fillRoundedRect(j.x - 6, -22, 12, 11, 2)
      // Metallic Spigot & Lid
      g.fillStyle(0xdfe6e9, 0.9)
      g.fillRect(j.x - 5, -28, 10, 3)
      g.fillRect(j.x - 2, -10, 4, 3)
    })

    // Magical Boba Shaker Bottle in Center
    g.fillStyle(0xb2bec3, 0.95)
    g.fillRoundedRect(-6, -23, 12, 13, 3)
    g.fillStyle(0x636e72, 1)
    g.fillRect(-4, -26, 8, 3)

    // Two Wooden Support Pillars for Canopy
    g.fillStyle(0x54361e, 1)
    g.fillRect(-50, -68, 6, 60)
    g.fillRect(44, -68, 6, 60)
  }

  private drawBaristaWitch() {
    const g = this.barista
    g.clear()

    // NPC stands behind the counter (-15 px above base)
    const bx = 0
    const by = -28

    // Cute Wizard Hat
    g.fillStyle(0x2c1f4a, 1)
    g.beginPath()
    g.moveTo(bx - 14, by - 12)
    g.lineTo(bx + 14, by - 12)
    g.lineTo(bx + 4, by - 36)
    g.lineTo(bx - 2, by - 37)
    g.closePath()
    g.fillPath()

    // Hat Brim
    g.fillStyle(0x1e1534, 1)
    g.fillEllipse(bx, by - 12, 34, 9)

    // Hat Gold Buckle
    g.fillStyle(0xf1c40f, 1)
    g.fillRect(bx - 4, by - 16, 8, 4)

    // Cute Face
    g.fillStyle(0xffdfba, 1)
    g.fillCircle(bx, by - 5, 9)

    // Cheeks & Eyes
    g.fillStyle(0xff7675, 0.6)
    g.fillCircle(bx - 5, by - 4, 2.5)
    g.fillCircle(bx + 5, by - 4, 2.5)
    g.fillStyle(0x2d3436, 1)
    g.fillCircle(bx - 3, by - 6, 1.5)
    g.fillCircle(bx + 3, by - 6, 1.5)

    // Apron (Emerald Green with gold teacup icon)
    g.fillStyle(0x16a085, 1)
    g.fillRoundedRect(bx - 10, by + 3, 20, 16, 2)
    g.fillStyle(0xf39c12, 1)
    g.fillCircle(bx, by + 10, 3)
  }

  private drawCanopy() {
    const g = this.canopy
    g.clear()

    const cy = -68
    // Striped Awning Roof: Crimson & Gold Wizarding stripes
    const stripes = [
      { x1: -58, x2: -36, col: 0x8b1822 },
      { x1: -36, x2: -14, col: 0xe5a93b },
      { x1: -14, x2: 8, col: 0x8b1822 },
      { x1: 8, x2: 30, col: 0xe5a93b },
      { x1: 30, x2: 52, col: 0x8b1822 },
    ]

    stripes.forEach((s) => {
      g.fillStyle(s.col, 1)
      g.beginPath()
      g.moveTo(s.x1, cy)
      g.lineTo(s.x2, cy)
      g.lineTo(s.x2 + 4, cy + 18)
      g.lineTo(s.x1 + 4, cy + 18)
      g.closePath()
      g.fillPath()

      // Scalloped fringe
      g.fillCircle((s.x1 + s.x2) / 2 + 2, cy + 18, 6)
    })

    // Roof Top Trim
    g.fillStyle(0x422915, 1)
    g.fillRoundedRect(-60, cy - 4, 118, 5, 2)
  }

  private createSignboard(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, -82)

    // Hanging sign board
    const bg = this.scene.add.graphics()
    bg.fillStyle(0x1f140e, 0.95)
    bg.fillRoundedRect(-76, -11, 152, 22, 6)
    bg.lineStyle(1.5, 0xf1c40f, 0.9)
    bg.strokeRoundedRect(-76, -11, 152, 22, 6)

    const text = this.scene.add
      .text(0, 0, '🧋 TIỆM TRÀ SỮA PHÉP THUẬT', {
        fontFamily: 'Georgia, serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffdf7a',
      })
      .setOrigin(0.5, 0.5)

    container.add([bg, text])

    // Gentle floating sway tween
    this.scene.tweens.add({
      targets: container,
      y: '-=3',
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    return container
  }

  private createSpeechBubble(): {
    bubble: Phaser.GameObjects.Container
    text: Phaser.GameObjects.Text
  } {
    const container = this.scene.add.container(0, -118).setAlpha(0).setScale(0.85)

    const bg = this.scene.add.graphics()
    bg.fillStyle(0x1a120c, 0.94)
    bg.fillRoundedRect(-125, -16, 250, 32, 8)
    bg.lineStyle(1.5, 0xf39c12, 0.85)
    bg.strokeRoundedRect(-125, -16, 250, 32, 8)

    // Little pointer triangle
    bg.beginPath()
    bg.moveTo(-8, 16)
    bg.lineTo(8, 16)
    bg.lineTo(0, 24)
    bg.closePath()
    bg.fillPath()

    const label = this.scene.add
      .text(0, 0, this.CHAT_PROMPTS[0], {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#fff5dc',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    container.add([bg, label])

    return { bubble: container, text: label }
  }

  public openShopModal() {
    window.dispatchEvent(new CustomEvent('skyoffice:toggle-boba-shop'))
  }

  public update(dt: number) {
    if (!this.myPlayer) return

    // 1. Check proximity with player
    const dist = Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, this.x, this.y)
    const isNear = dist < 95

    if (isNear !== this.isPlayerNear) {
      this.isPlayerNear = isNear
      if (isNear) {
        this.speechText.setText(this.CHAT_PROMPTS[this.currentChatIdx])
        this.scene.tweens.add({
          targets: this.speechBubble,
          alpha: 1,
          scale: 1,
          duration: 250,
          ease: 'Back.easeOut',
        })
      } else {
        this.scene.tweens.add({
          targets: this.speechBubble,
          alpha: 0,
          scale: 0.85,
          duration: 200,
          ease: 'Sine.easeIn',
        })
      }
    }

    // 2. Cycle speech bubbles when player is near
    if (this.isPlayerNear) {
      this.chatTimer += dt
      if (this.chatTimer > 4.5) {
        this.chatTimer = 0
        this.currentChatIdx = (this.currentChatIdx + 1) % this.CHAT_PROMPTS.length
        this.speechText.setText(this.CHAT_PROMPTS[this.currentChatIdx])
      }
    }

    // 3. Ambient Magical Steam Bubbles & Shaker wobble
    this.animTimer += dt * 3
    this.steamAura.clear()
    const steamY = -28 + Math.sin(this.animTimer) * 4
    this.steamAura.fillStyle(0xffeaa7, 0.45 + Math.sin(this.animTimer * 1.5) * 0.25)
    this.steamAura.fillCircle(-6, steamY, 2.5)
    this.steamAura.fillCircle(0, steamY - 6, 3.5)
    this.steamAura.fillCircle(6, steamY - 2, 2.5)
  }

  public destroy() {
    this.container.destroy(true)
  }
}
