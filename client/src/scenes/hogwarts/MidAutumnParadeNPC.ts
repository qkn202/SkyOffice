import Phaser from 'phaser'
import MyPlayer from '../../characters/MyPlayer'

export const PARADE_WAYPOINTS = [
  { x: 1800, y: 1620 }, // Cửa vào chính giữa Đại Sảnh
  { x: 1500, y: 1620 }, // Rẽ sang góc Tây Nam (gần bàn Hufflepuff)
  { x: 1450, y: 1450 }, // Hành lang phía Tây cạnh bàn Hufflepuff
  { x: 1480, y: 1300 }, // Góc Tây Bắc gần dãy bàn Ravenclaw
  { x: 1680, y: 1260 }, // Đi ngang trước Bàn Giáo Sư
  { x: 1850, y: 1260 }, // Đi ngang qua Chiếc Nón Phân Loại & Dumbledore
  { x: 2040, y: 1260 }, // Góc Đông Bắc trước bàn Gryffindor / Slytherin
  { x: 2080, y: 1420 }, // Dọc hành lang phía Đông cạnh bàn Slytherin
  { x: 2060, y: 1620 }, // Góc Đông Nam
  { x: 1800, y: 1620 }, // Hoàn tất 1 vòng Đại Sảnh và bắt đầu vòng mới
]

const CHANT_MESSAGES = [
  '🥁 Cắc tùng cắc tùng, cheng cheng tùng dinh dinh! 🦁',
  '🏮 Đoàn Lân Sư Rồng chúc các phù thủy Hogwarts Tết Trung Thu rực rỡ! 🌕',
  '🥮 Lân thích ăn Bánh Nướng Bánh Dẻo nhất nè! Lại gần [E] để chia quà nha! 😋',
  '✨ Vèo! Lân bay lên cao chúc phúc 4 Nhà Gryffindor, Slytherin, Ravenclaw, Hufflepuff! 🌟',
  '🌕 Trăng rằm tháng Tám sáng vằng vặc trên bầu trời phép thuật! 🏮',
  '🦁 Mau theo chân Đoàn Lân và Ông Địa đi phá cỗ Trung Thu khắp Hogwarts nào! 🏃',
]

type LionDirection = 'left' | 'right' | 'down' | 'up'

export class MidAutumnParadeNPC {
  scene: Phaser.Scene
  myPlayer: MyPlayer
  container: Phaser.GameObjects.Container

  // Lion Troupe Entities
  lionGlow: Phaser.GameObjects.Graphics
  lionHead: Phaser.GameObjects.Image
  lionBodyMid: Phaser.GameObjects.Image
  lionBodyRear: Phaser.GameObjects.Image
  lionTail: Phaser.GameObjects.Image
  paws: Phaser.GameObjects.Image[] = []
  ongDia: Phaser.GameObjects.Image
  starLantern: Phaser.GameObjects.Image

  nameTag: Phaser.GameObjects.Container
  dialogBubble: Phaser.GameObjects.Container
  dialogText: Phaser.GameObjects.Text
  interactPrompt: Phaser.GameObjects.Container

  currentWaypointIdx = 0
  speed = 78 // pixels per second (lively procession speed)
  isPaused = false
  pauseTimer = 0
  isCelebrating = false

  currentDir: LionDirection = 'down'

  chatTimer = 1.5 // Show initial drum chant quickly
  chatIndex = 0
  sparkleTimer = 0

  // Player Lantern Buff
  playerHasLantern = false
  playerLanternSprite?: Phaser.GameObjects.Image
  playerLanternGlow?: Phaser.GameObjects.Graphics
  playerBuffTimer = 0

  constructor(scene: Phaser.Scene, myPlayer: MyPlayer) {
    this.scene = scene
    this.myPlayer = myPlayer

    const startPos = PARADE_WAYPOINTS[0]

    // Create Root Container
    this.container = this.scene.add.container(startPos.x, startPos.y)

    // Warm festive golden aura on the floor beneath the Lion
    this.lionGlow = this.scene.add.graphics()
    this.lionGlow.fillStyle(0xffa500, 0.22)
    this.lionGlow.fillCircle(0, 0, 48)
    this.lionGlow.fillStyle(0xffd700, 0.3)
    this.lionGlow.fillCircle(0, 0, 32)
    this.container.add(this.lionGlow)

    // 4 Dancer Paws (Chân Lân)
    for (let i = 0; i < 4; i++) {
      const paw = this.scene.add.image(0, 0, 'lion_paw')
      paw.setOrigin(0.5, 0.8)
      paw.setScale(0.9)
      this.paws.push(paw)
      this.container.add(paw)
    }

    // Lion Tail (Đuôi Lân)
    this.lionTail = this.scene.add.image(0, 0, 'lion_tail')
    this.lionTail.setOrigin(0.2, 0.5)
    this.container.add(this.lionTail)

    // Lion Body Rear (Lưng Lân)
    this.lionBodyRear = this.scene.add.image(0, 0, 'lion_body_rear')
    this.lionBodyRear.setOrigin(0.5, 0.6)
    this.container.add(this.lionBodyRear)

    // Lion Body Mid (Thân Lân)
    this.lionBodyMid = this.scene.add.image(0, 0, 'lion_body_mid')
    this.lionBodyMid.setOrigin(0.5, 0.6)
    this.container.add(this.lionBodyMid)

    // Lion Head (Đầu Lân)
    this.lionHead = this.scene.add.image(0, 0, 'lion_head_front')
    this.lionHead.setOrigin(0.5, 0.7)
    this.container.add(this.lionHead)

    // Ông Địa (Laughing Buddha with Palm Fan) leading alongside
    this.ongDia = this.scene.add.image(28, 4, 'ong_dia')
    this.ongDia.setOrigin(0.5, 0.85)
    this.ongDia.setScale(0.9)
    this.container.add(this.ongDia)

    // Festive Star Lantern hanging near Ông Địa / Lion
    this.starLantern = this.scene.add.image(42, -10, 'lantern_star')
    this.starLantern.setOrigin(0.5, 0.8)
    this.starLantern.setScale(0.8)
    this.container.add(this.starLantern)

    // Name Tag (🦁 Đoàn Lân Sư Rồng Trung Thu)
    this.nameTag = this.scene.add.container(0, -56)
    const nameBg = this.scene.add.graphics()
    nameBg.fillStyle(0x181c2e, 0.88)
    nameBg.fillRoundedRect(-92, -11, 184, 22, 6)
    nameBg.lineStyle(1.5, 0xffd875, 0.95)
    nameBg.strokeRoundedRect(-92, -11, 184, 22, 6)

    const nameText = this.scene.add.text(0, 0, '🦁 Đoàn Lân Sư Rồng Trung Thu', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd875',
    })
    nameText.setOrigin(0.5, 0.5)
    this.nameTag.add([nameBg, nameText])
    this.container.add(this.nameTag)

    // Chat / Chant Speech Bubble
    this.dialogBubble = this.scene.add.container(0, -90)
    this.dialogBubble.setAlpha(0)
    this.dialogText = this.scene.add.text(0, 0, '', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: 240 },
      align: 'center',
    })
    this.dialogText.setOrigin(0.5, 0.5)
    this.dialogBubble.add(this.dialogText)
    this.container.add(this.dialogBubble)

    // Interaction Prompt ([E] Thưởng Lộc & Nhận Quà Trung Thu)
    this.interactPrompt = this.scene.add.container(0, 32)
    this.interactPrompt.setAlpha(0)
    const promptBg = this.scene.add.graphics()
    promptBg.fillStyle(0xd97706, 0.95)
    promptBg.fillRoundedRect(-100, -11, 200, 22, 11)
    promptBg.lineStyle(1.5, 0xfef08a, 1)
    promptBg.strokeRoundedRect(-100, -11, 200, 22, 11)

    const promptText = this.scene.add.text(0, 0, '✨ [E] Thưởng Lộc & Nhận Quà', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    })
    promptText.setOrigin(0.5, 0.5)
    this.interactPrompt.add([promptBg, promptText])
    this.container.add(this.interactPrompt)

    // Click on Lion / Troupe to interact
    const hitZone = this.scene.add
      .zone(0, -5, 80, 70)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
    this.container.add(hitZone)

    hitZone.on('pointerdown', () => {
      this.handlePlayerInteraction()
    })

    // Setup input listener for 'E' key
    this.scene.input.keyboard?.on('keydown-E', () => {
      const dist = Phaser.Math.Distance.Between(
        this.container.x,
        this.container.y,
        this.myPlayer.x,
        this.myPlayer.y
      )
      if (dist < 85) {
        this.handlePlayerInteraction()
      }
    })
  }

  showChant(message: string, duration = 4500) {
    this.dialogText.setText(message)
    const bounds = this.dialogText.getBounds()
    const paddingX = 14
    const paddingY = 8

    const oldBg = this.dialogBubble.getByName('dialogBg')
    if (oldBg) oldBg.destroy()

    const bg = this.scene.add.graphics()
    bg.setName('dialogBg')
    bg.fillStyle(0x141829, 0.94)
    bg.fillRoundedRect(
      -bounds.width / 2 - paddingX,
      -bounds.height / 2 - paddingY,
      bounds.width + paddingX * 2,
      bounds.height + paddingY * 2,
      8
    )
    bg.lineStyle(1.5, 0xf59e0b, 0.95)
    bg.strokeRoundedRect(
      -bounds.width / 2 - paddingX,
      -bounds.height / 2 - paddingY,
      bounds.width + paddingX * 2,
      bounds.height + paddingY * 2,
      8
    )

    // Pointer down
    bg.fillStyle(0x141829, 0.94)
    bg.fillTriangle(
      -6, bounds.height / 2 + paddingY,
      6, bounds.height / 2 + paddingY,
      0, bounds.height / 2 + paddingY + 6
    )

    this.dialogBubble.addAt(bg, 0)

    this.scene.tweens.killTweensOf(this.dialogBubble)
    this.dialogBubble.setAlpha(1).setScale(0.9)
    this.scene.tweens.add({
      targets: this.dialogBubble,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut',
    })

    this.scene.time.delayedCall(duration, () => {
      this.scene.tweens.add({
        targets: this.dialogBubble,
        alpha: 0,
        scale: 0.9,
        duration: 250,
      })
    })
  }

  handlePlayerInteraction() {
    this.isPaused = true
    this.isCelebrating = true
    this.pauseTimer = 4.0

    // Lion bows and performs celebratory leap!
    this.showChant('🦁 Cắc Tùng Cắc Tùng! Lân cúi đầu chúc mừng bạn một mùa Tết Trung Thu rực rỡ! 🥮 Tặng bạn Đèn Ông Sao may mắn nè! ✨', 5500)

    // Give player the Star Lantern & Speed Buff
    this.activatePlayerLanternBuff()

    // Spawn festive fireworks, red envelopes, emojis & golden sparkles
    const emojis = ['🏮', '🥮', '⭐', '🦁', '✨', '🎉', '🧧']
    for (let i = 0; i < 22; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        const px = this.container.x + Phaser.Math.Between(-40, 40)
        const py = this.container.y + Phaser.Math.Between(-35, 25)
        const spark = this.scene.add.text(px, py, emojis[Phaser.Math.Between(0, emojis.length - 1)], {
          fontSize: '15px',
        })
        spark.setDepth(5000)
        this.scene.tweens.add({
          targets: spark,
          y: py - 45 - Phaser.Math.Between(0, 20),
          x: px + Phaser.Math.Between(-20, 20),
          alpha: 0,
          scale: 1.5,
          duration: 1000,
          ease: 'Cubic.easeOut',
          onComplete: () => spark.destroy(),
        })
      })
    }
  }

  activatePlayerLanternBuff() {
    this.playerHasLantern = true
    this.playerBuffTimer = 60 // 60s buff

    if (!this.playerLanternSprite) {
      this.playerLanternGlow = this.scene.add.graphics()
      this.playerLanternGlow.fillStyle(0xffd700, 0.25)
      this.playerLanternGlow.fillCircle(0, 0, 28)

      this.playerLanternSprite = this.scene.add.image(this.myPlayer.x + 14, this.myPlayer.y - 12, 'lantern_star')
      this.playerLanternSprite.setScale(0.8)
    }
    this.playerLanternSprite.setVisible(true)
    this.playerLanternGlow?.setVisible(true)
  }

  update(dt: number) {
    const time = this.scene.time.now

    // Drum beat frequency
    const drumBeat = Math.sin(time * 0.012)
    const headBob = Math.abs(drumBeat) * -6
    const headShake = Math.sin(time * 0.008) * 0.1

    // Update Troupe Layout based on Direction
    if (this.currentDir === 'right') {
      this.lionHead.setTexture('lion_head_side').setFlipX(false).setPosition(0, -6 + headBob)
      this.lionHead.setRotation(headShake)

      this.lionBodyMid.setPosition(-20, -4 + Math.sin(time * 0.012 - 0.7) * 3).setFlipX(false)
      this.lionBodyRear.setPosition(-40, -5 + Math.sin(time * 0.012 - 1.4) * 3).setFlipX(false)
      this.lionTail.setPosition(-56, -6).setFlipX(false).setRotation(Math.sin(time * 0.018) * 0.35)

      // Paws
      this.paws[0].setPosition(-4, 12 + Math.max(0, Math.sin(time * 0.012)) * -4)
      this.paws[1].setPosition(-16, 12 + Math.max(0, Math.sin(time * 0.012 + Math.PI)) * -4)
      this.paws[2].setPosition(-32, 12 + Math.max(0, Math.sin(time * 0.012 + 0.6)) * -4)
      this.paws[3].setPosition(-44, 12 + Math.max(0, Math.sin(time * 0.012 + Math.PI + 0.6)) * -4)

      // Ông Địa walks in front cheerfully waving fan
      this.ongDia.setPosition(26, 4 + Math.sin(time * 0.01) * 3).setFlipX(false)
      this.ongDia.setRotation(Math.sin(time * 0.006) * 0.1)

      this.starLantern.setPosition(38, -12 + Math.sin(time * 0.008) * 3)

    } else if (this.currentDir === 'left') {
      this.lionHead.setTexture('lion_head_side').setFlipX(true).setPosition(0, -6 + headBob)
      this.lionHead.setRotation(-headShake)

      this.lionBodyMid.setPosition(20, -4 + Math.sin(time * 0.012 - 0.7) * 3).setFlipX(true)
      this.lionBodyRear.setPosition(40, -5 + Math.sin(time * 0.012 - 1.4) * 3).setFlipX(true)
      this.lionTail.setPosition(56, -6).setFlipX(true).setRotation(-Math.sin(time * 0.018) * 0.35)

      // Paws
      this.paws[0].setPosition(4, 12 + Math.max(0, Math.sin(time * 0.012)) * -4)
      this.paws[1].setPosition(16, 12 + Math.max(0, Math.sin(time * 0.012 + Math.PI)) * -4)
      this.paws[2].setPosition(32, 12 + Math.max(0, Math.sin(time * 0.012 + 0.6)) * -4)
      this.paws[3].setPosition(44, 12 + Math.max(0, Math.sin(time * 0.012 + Math.PI + 0.6)) * -4)

      this.ongDia.setPosition(-26, 4 + Math.sin(time * 0.01) * 3).setFlipX(true)
      this.ongDia.setRotation(-Math.sin(time * 0.006) * 0.1)

      this.starLantern.setPosition(-38, -12 + Math.sin(time * 0.008) * 3)

    } else if (this.currentDir === 'down') {
      this.lionHead.setTexture('lion_head_front').setFlipX(false).setPosition(0, -2 + headBob)
      this.lionHead.setRotation(headShake)

      this.lionBodyMid.setPosition(0, -18 + Math.sin(time * 0.012 - 0.7) * 2).setFlipX(false)
      this.lionBodyRear.setPosition(0, -32 + Math.sin(time * 0.012 - 1.4) * 2).setFlipX(false)
      this.lionTail.setPosition(10, -42).setRotation(Math.sin(time * 0.018) * 0.4)

      // Paws
      this.paws[0].setPosition(-14, 10 + Math.max(0, Math.sin(time * 0.012)) * -3)
      this.paws[1].setPosition(14, 10 + Math.max(0, Math.sin(time * 0.012 + Math.PI)) * -3)
      this.paws[2].setPosition(-12, -8 + Math.max(0, Math.sin(time * 0.012 + 0.6)) * -3)
      this.paws[3].setPosition(12, -8 + Math.max(0, Math.sin(time * 0.012 + Math.PI + 0.6)) * -3)

      this.ongDia.setPosition(24, 12 + Math.sin(time * 0.01) * 3).setFlipX(false)
      this.ongDia.setRotation(Math.sin(time * 0.006) * 0.1)

      this.starLantern.setPosition(36, -4 + Math.sin(time * 0.008) * 3)

    } else { // 'up'
      this.lionHead.setTexture('lion_head_back').setFlipX(false).setPosition(0, -16 + headBob)
      this.lionHead.setRotation(headShake)

      this.lionBodyMid.setPosition(0, -2 + Math.sin(time * 0.012 - 0.7) * 2).setFlipX(false)
      this.lionBodyRear.setPosition(0, 14 + Math.sin(time * 0.012 - 1.4) * 2).setFlipX(false)
      this.lionTail.setPosition(10, 26).setRotation(Math.sin(time * 0.018) * 0.4)

      // Paws
      this.paws[0].setPosition(-14, 0 + Math.max(0, Math.sin(time * 0.012)) * -3)
      this.paws[1].setPosition(14, 0 + Math.max(0, Math.sin(time * 0.012 + Math.PI)) * -3)
      this.paws[2].setPosition(-12, 16 + Math.max(0, Math.sin(time * 0.012 + 0.6)) * -3)
      this.paws[3].setPosition(12, 16 + Math.max(0, Math.sin(time * 0.012 + Math.PI + 0.6)) * -3)

      this.ongDia.setPosition(24, -20 + Math.sin(time * 0.01) * 3).setFlipX(false)
      this.ongDia.setRotation(Math.sin(time * 0.006) * 0.1)

      this.starLantern.setPosition(36, -30 + Math.sin(time * 0.008) * 3)
    }

    // Aura pulse
    this.lionGlow.setAlpha(0.25 + 0.12 * Math.sin(time * 0.007))

    // Handle Paused state / Celebration trick
    if (this.isPaused) {
      this.pauseTimer -= dt
      if (this.isCelebrating) {
        // Dramatic Lion Dance Leap & Bow trick!
        this.lionHead.y -= 16
        this.lionHead.setRotation(Math.sin(time * 0.03) * 0.22)
        this.ongDia.y -= 8
      }
      if (this.pauseTimer <= 0) {
        this.isPaused = false
        this.isCelebrating = false
      }
    } else {
      // Move along waypoints
      const target = PARADE_WAYPOINTS[this.currentWaypointIdx]
      const dist = Phaser.Math.Distance.Between(this.container.x, this.container.y, target.x, target.y)

      if (dist < 10) {
        // Next waypoint
        this.currentWaypointIdx = (this.currentWaypointIdx + 1) % PARADE_WAYPOINTS.length
      } else {
        const moveDist = this.speed * dt
        const angle = Phaser.Math.Angle.Between(this.container.x, this.container.y, target.x, target.y)

        const vx = Math.cos(angle) * moveDist
        const vy = Math.sin(angle) * moveDist

        this.container.x += vx
        this.container.y += vy

        // Determine orientation
        const absX = Math.abs(vx)
        const absY = Math.abs(vy)

        if (absX > absY) {
          this.currentDir = vx > 0 ? 'right' : 'left'
        } else {
          this.currentDir = vy > 0 ? 'down' : 'up'
        }
      }

      // Sparkle dust trail behind the Lion
      this.sparkleTimer += dt
      if (this.sparkleTimer > 0.18) {
        this.sparkleTimer = 0
        const spark = this.scene.add.circle(
          this.container.x + Phaser.Math.Between(-15, 15),
          this.container.y + Phaser.Math.Between(-5, 10),
          Phaser.Math.Between(1, 2.5),
          Phaser.Math.RND.pick([0xffd700, 0xff5722, 0xff1493, 0xffffff])
        )
        spark.setDepth(this.container.y - 1)
        this.scene.tweens.add({
          targets: spark,
          y: spark.y + 12,
          alpha: 0,
          scale: 0.2,
          duration: 500,
          onComplete: () => spark.destroy(),
        })
      }
    }

    // Dynamic depth sorting based on y
    this.container.setDepth(this.container.y)

    // Chat Chants timer
    this.chatTimer -= dt
    if (this.chatTimer <= 0) {
      this.chatTimer = Phaser.Math.Between(8, 12)
      this.showChant(CHANT_MESSAGES[this.chatIndex])
      this.chatIndex = (this.chatIndex + 1) % CHANT_MESSAGES.length
    }

    // Check distance to player for interaction prompt
    if (this.myPlayer) {
      const distToPlayer = Phaser.Math.Distance.Between(
        this.container.x,
        this.container.y,
        this.myPlayer.x,
        this.myPlayer.y
      )

      if (distToPlayer < 85) {
        this.interactPrompt.setAlpha(1)
      } else {
        this.interactPrompt.setAlpha(0)
      }

      // Update Player's Floating Star Lantern if active
      if (this.playerHasLantern && this.playerLanternSprite && this.playerLanternGlow) {
        this.playerBuffTimer -= dt
        if (this.playerBuffTimer <= 0) {
          this.playerHasLantern = false
          this.playerLanternSprite.setVisible(false)
          this.playerLanternGlow.setVisible(false)
        } else {
          // Floating gracefully beside player
          const playerBob = Math.sin(time * 0.008) * 3
          const targetX = this.myPlayer.x + (this.myPlayer.anims.currentAnim?.key.includes('left') ? 14 : -14)
          const targetY = this.myPlayer.y - 14 + playerBob

          this.playerLanternSprite.setPosition(targetX, targetY)
          this.playerLanternSprite.setDepth(this.myPlayer.y + 5)

          this.playerLanternGlow.setPosition(targetX, targetY - 4)
          this.playerLanternGlow.setDepth(this.myPlayer.y + 4)
        }
      }
    }
  }

  destroy() {
    this.playerLanternSprite?.destroy()
    this.playerLanternGlow?.destroy()
    this.container.destroy()
  }
}
