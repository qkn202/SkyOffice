import Phaser from 'phaser'
import { recognizeSpell, Point, SpellResult } from '../utils/SpellGestureRecognizer'
import MyPlayer from '../characters/MyPlayer'
import OtherPlayer from '../characters/OtherPlayer'
import Network from '../services/Network'

interface ActiveSpell {
  id: string
  update?: (time: number, delta: number) => void
  destroy: () => void
}

export class WandSpellSystem {
  private scene: Phaser.Scene
  private myPlayer: MyPlayer
  private otherPlayerMap: Map<string, OtherPlayer>
  private network: Network

  private isDrawing = false
  private strokePoints: Point[] = []
  private strokeScreenPoints: { x: number; y: number }[] = []
  private wandGraphics: Phaser.GameObjects.Graphics
  private sparkEmitter?: Phaser.GameObjects.Particles.ParticleEmitter

  // Active Lumos light tracking: playerId -> Light Image
  private lumosMap = new Map<string, Phaser.GameObjects.Image>()
  // Active Protego shield tracking: playerId -> Graphics
  private shieldMap = new Map<string, Phaser.GameObjects.Graphics>()

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

    this.wandGraphics = this.scene.add.graphics()
    this.wandGraphics.setDepth(9999)

    this.initTextures()
    this.initPointerEvents()
  }

  private initTextures() {
    // 1. Tạo texture tia lửa đũa phép (Wand Spark)
    if (!this.scene.textures.exists('wand_spark_trail')) {
      const canvas = this.scene.textures.createCanvas('wand_spark_trail', 16, 16)
      if (canvas) {
        const ctx = canvas.getContext()
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        grad.addColorStop(0.3, 'rgba(255, 220, 100, 0.9)')
        grad.addColorStop(0.7, 'rgba(0, 230, 255, 0.4)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 16, 16)
        canvas.refresh()
      }
    }

    // 2. Tạo texture quả cầu lửa Incendio
    if (!this.scene.textures.exists('wand_fireball')) {
      const canvas = this.scene.textures.createCanvas('wand_fireball', 24, 24)
      if (canvas) {
        const ctx = canvas.getContext()
        const grad = ctx.createRadialGradient(12, 12, 1, 12, 12, 12)
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        grad.addColorStop(0.25, 'rgba(255, 230, 70, 0.95)')
        grad.addColorStop(0.65, 'rgba(255, 80, 20, 0.8)')
        grad.addColorStop(1, 'rgba(200, 20, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 24, 24)
        canvas.refresh()
      }
    }

    // 3. Tạo texture tia sét đỏ Expelliarmus
    if (!this.scene.textures.exists('wand_scarlet_spark')) {
      const canvas = this.scene.textures.createCanvas('wand_scarlet_spark', 20, 20)
      if (canvas) {
        const ctx = canvas.getContext()
        const grad = ctx.createRadialGradient(10, 10, 1, 10, 10, 10)
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        grad.addColorStop(0.3, 'rgba(255, 40, 90, 0.95)')
        grad.addColorStop(0.7, 'rgba(200, 0, 40, 0.5)')
        grad.addColorStop(1, 'rgba(100, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 20, 20)
        canvas.refresh()
      }
    }

    // 4. Tạo texture hào quang bạc Patronus
    if (!this.scene.textures.exists('wand_silver_patronus')) {
      const canvas = this.scene.textures.createCanvas('wand_silver_patronus', 32, 32)
      if (canvas) {
        const ctx = canvas.getContext()
        const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 16)
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        grad.addColorStop(0.3, 'rgba(210, 245, 255, 0.9)')
        grad.addColorStop(0.7, 'rgba(100, 200, 255, 0.4)')
        grad.addColorStop(1, 'rgba(50, 150, 255, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 32, 32)
        canvas.refresh()
      }
    }
  }

  private initPointerEvents() {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Chỉ nhận diện chuột trái hoặc chạm cảm ứng, bỏ qua nếu click trên UI dialog
      if (pointer.button !== 0 && !pointer.isDown) return
      this.startDrawing(pointer)
    })

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDrawing) return
      this.continueDrawing(pointer)
    })

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDrawing) return
      this.endDrawing(pointer)
    })
  }

  private startDrawing(pointer: Phaser.Input.Pointer) {
    this.isDrawing = true
    this.strokePoints = [{ x: pointer.x, y: pointer.y }]
    this.strokeScreenPoints = [{ x: pointer.x, y: pointer.y }]
    this.wandGraphics.clear()
    this.renderWandTrail()
  }

  private continueDrawing(pointer: Phaser.Input.Pointer) {
    const last = this.strokePoints[this.strokePoints.length - 1]
    const dist = Phaser.Math.Distance.Between(last.x, last.y, pointer.x, pointer.y)
    if (dist < 4) return

    this.strokePoints.push({ x: pointer.x, y: pointer.y })
    this.strokeScreenPoints.push({ x: pointer.x, y: pointer.y })
    this.renderWandTrail()
  }

  private renderWandTrail() {
    if (this.strokePoints.length < 2) return

    this.wandGraphics.clear()

    // 1. Lớp hào quang ngoài phát sáng xanh cyan / vàng gold
    this.wandGraphics.lineStyle(8, 0x48dbfb, 0.35)
    this.wandGraphics.beginPath()
    this.wandGraphics.moveTo(this.strokePoints[0].x, this.strokePoints[0].y)
    for (let i = 1; i < this.strokePoints.length; i++) {
      this.wandGraphics.lineTo(this.strokePoints[i].x, this.strokePoints[i].y)
    }
    this.wandGraphics.strokePath()

    // 2. Lớp vệt sáng vàng phép thuật chính
    this.wandGraphics.lineStyle(4, 0xffd32a, 0.85)
    this.wandGraphics.beginPath()
    this.wandGraphics.moveTo(this.strokePoints[0].x, this.strokePoints[0].y)
    for (let i = 1; i < this.strokePoints.length; i++) {
      this.wandGraphics.lineTo(this.strokePoints[i].x, this.strokePoints[i].y)
    }
    this.wandGraphics.strokePath()

    // 3. Lõi trắng tinh khôi ở giữa
    this.wandGraphics.lineStyle(1.8, 0xffffff, 1)
    this.wandGraphics.beginPath()
    this.wandGraphics.moveTo(this.strokePoints[0].x, this.strokePoints[0].y)
    for (let i = 1; i < this.strokePoints.length; i++) {
      this.wandGraphics.lineTo(this.strokePoints[i].x, this.strokePoints[i].y)
    }
    this.wandGraphics.strokePath()

    // Đầu đũa phép (con trỏ hiện tại) tỏa sáng rực rỡ
    const head = this.strokePoints[this.strokePoints.length - 1]
    this.wandGraphics.fillStyle(0xffffff, 1)
    this.wandGraphics.fillCircle(head.x, head.y, 4.5)
    this.wandGraphics.fillStyle(0xffe066, 0.6)
    this.wandGraphics.fillCircle(head.x, head.y, 8)
  }

  private endDrawing(pointer: Phaser.Input.Pointer) {
    this.isDrawing = false

    if (this.strokePoints.length < 6) {
      this.wandGraphics.clear()
      return
    }

    const result = recognizeSpell(this.strokePoints)

    if (result.spell !== 'UNKNOWN') {
      // 1. Hiệu ứng bừng sáng thành công trên nét vẽ
      this.playSuccessStrokeEffect(result)

      // 2. Hiện incantation text trên đầu nhân vật
      this.showIncantationBanner(this.myPlayer, result)

      // 3. Thi triển bùa phép
      const playerFacingDir = this.getPlayerFacingDirection(this.myPlayer)
      this.executeSpell(result.spell, this.myPlayer.playerId, this.myPlayer.x, this.myPlayer.y, playerFacingDir)

      // 4. Gửi qua mạng Colyseus
      this.network.castSpell(result.spell.toLowerCase(), this.myPlayer.x, this.myPlayer.y, playerFacingDir)

      // 5. Dispatch sự kiện ra React UI
      window.dispatchEvent(
        new CustomEvent('skyoffice:spell-cast', {
          detail: { spell: result.spell, incantation: result.incantation, emoji: result.emoji },
        })
      )
    } else {
      // Vẽ không thành công: Xì khói xám nhẹ
      this.playFizzleEffect()
    }
  }

  private playSuccessStrokeEffect(result: SpellResult) {
    // Nét vẽ chuyển thành vàng rực lấp lánh rồi tan biến
    this.scene.tweens.add({
      targets: this.wandGraphics,
      alpha: { from: 1, to: 0 },
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.wandGraphics.clear()
        this.wandGraphics.setAlpha(1)
      },
    })
  }

  private playFizzleEffect() {
    this.wandGraphics.clear()
    this.wandGraphics.lineStyle(3, 0x888888, 0.5)
    this.wandGraphics.beginPath()
    this.wandGraphics.moveTo(this.strokePoints[0].x, this.strokePoints[0].y)
    for (let i = 1; i < this.strokePoints.length; i++) {
      this.wandGraphics.lineTo(this.strokePoints[i].x, this.strokePoints[i].y)
    }
    this.wandGraphics.strokePath()

    this.scene.tweens.add({
      targets: this.wandGraphics,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.wandGraphics.clear()
        this.wandGraphics.setAlpha(1)
      },
    })

    // Hiện text thông báo vẽ lại
    const head = this.strokePoints[this.strokePoints.length - 1]
    const fizzleText = this.scene.add
      .text(head.x, head.y - 12, '💨 Fizzle... Thử lại!', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#b0bec5',
        stroke: '#1c2833',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(10000)

    this.scene.tweens.add({
      targets: fizzleText,
      y: head.y - 30,
      alpha: 0,
      duration: 850,
      onComplete: () => fizzleText.destroy(),
    })
  }

  private showIncantationBanner(player: MyPlayer | OtherPlayer, result: { incantation: string; emoji: string }) {
    const textStr = `${result.emoji} ${result.incantation}`
    const textObj = this.scene.add
      .text(0, -52, textStr, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#fff3b0',
        stroke: '#291807',
        strokeThickness: 3.5,
      })
      .setOrigin(0.5)
      .setDepth(5002)

    player.playerContainer.add(textObj)

    this.scene.tweens.add({
      targets: textObj,
      y: -80,
      alpha: { from: 1, to: 0 },
      duration: 1300,
      ease: 'Sine.easeOut',
      onComplete: () => textObj.destroy(),
    })
  }

  public executeSpell(
    spell: string,
    casterId: string,
    x: number,
    y: number,
    dir: string = 'down'
  ) {
    const normalizedSpell = spell.toUpperCase()
    const targetPlayer = casterId === this.myPlayer.playerId ? this.myPlayer : this.otherPlayerMap.get(casterId)
    if (!targetPlayer) return

    switch (normalizedSpell) {
      case 'LUMOS':
      case 'NOX':
        this.spellLumos(casterId, targetPlayer)
        break

      case 'INCENDIO':
        this.spellIncendio(targetPlayer, dir)
        break

      case 'PROTEGO':
        this.spellProtego(casterId, targetPlayer)
        break

      case 'EXPELLIARMUS':
        this.spellExpelliarmus(targetPlayer, dir)
        break

      case 'WINGARDIUM':
        this.spellWingardium(targetPlayer)
        break

      case 'PATRONUS':
        this.spellPatronus(targetPlayer)
        break
    }
  }

  // 1. LUMOS: Bật / tắt đèn đũa phép tỏa sáng quanh người
  private spellLumos(casterId: string, player: MyPlayer | OtherPlayer) {
    if (this.lumosMap.has(casterId)) {
      // Đang bật -> Tắt (Nox)
      const light = this.lumosMap.get(casterId)
      if (light) {
        this.scene.tweens.add({
          targets: light,
          alpha: 0,
          scale: 0.5,
          duration: 400,
          onComplete: () => {
            light.destroy()
            this.lumosMap.delete(casterId)
          },
        })
      }
      this.showIncantationBanner(player, { incantation: 'Nox...', emoji: '🌑' })
    } else {
      // Đang tắt -> Bật Lumos
      const light = this.scene.add.image(player.x, player.y - 12, 'light_halo_warm')
      light.setBlendMode(Phaser.BlendModes.ADD)
      light.setDepth(3501)
      light.setScale(0)
      light.setAlpha(0)

      this.scene.tweens.add({
        targets: light,
        scale: 2.1,
        alpha: 0.85,
        duration: 500,
        ease: 'Back.easeOut',
      })

      // Hiệu ứng nhịp thở ánh sáng
      this.scene.tweens.add({
        targets: light,
        scale: 2.3,
        alpha: 0.7,
        yoyo: true,
        repeat: -1,
        duration: 1200,
        delay: 500,
      })

      this.lumosMap.set(casterId, light)
    }
  }

  // 2. INCENDIO: Bắn cầu lửa bay theo hướng nhìn và phát nổ
  private spellIncendio(player: MyPlayer | OtherPlayer, dir: string) {
    const { vx, vy } = this.getVelocityFromDir(dir, 320)
    const fireball = this.scene.add.image(player.x, player.y - 14, 'wand_fireball')
    fireball.setBlendMode(Phaser.BlendModes.ADD)
    fireball.setDepth(3502)
    fireball.setScale(1.4)

    // Tạo vệt tàn lửa phía sau
    const trailTimer = this.scene.time.addEvent({
      delay: 50,
      repeat: 8,
      callback: () => {
        if (!fireball.active) return
        const spark = this.scene.add.image(fireball.x, fireball.y, 'wand_fireball')
        spark.setBlendMode(Phaser.BlendModes.ADD)
        spark.setDepth(3501)
        spark.setScale(0.8)
        this.scene.tweens.add({
          targets: spark,
          alpha: 0,
          scale: 0.2,
          duration: 350,
          onComplete: () => spark.destroy(),
        })
      },
    })

    const targetX = player.x + (vx / 320) * 190
    const targetY = player.y + (vy / 320) * 190

    this.scene.tweens.add({
      targets: fireball,
      x: targetX,
      y: targetY,
      duration: 550,
      ease: 'Quad.easeOut',
      onComplete: () => {
        trailTimer.remove()
        this.explodeIncendio(fireball.x, fireball.y)
        fireball.destroy()
      },
    })
  }

  private explodeIncendio(x: number, y: number) {
    // Vòng nổ bừng sáng
    const burst = this.scene.add.image(x, y, 'wand_fireball')
    burst.setBlendMode(Phaser.BlendModes.ADD)
    burst.setDepth(3503)
    this.scene.tweens.add({
      targets: burst,
      scale: 3.5,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.easeOut',
      onComplete: () => burst.destroy(),
    })

    // Bắn ra 8 tia tàn lửa nhỏ
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      const dist = 32 + Math.random() * 20
      const spark = this.scene.add.image(x, y, 'wand_fireball')
      spark.setBlendMode(Phaser.BlendModes.ADD)
      spark.setDepth(3502)
      spark.setScale(0.7)
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      })
    }
  }

  // 3. PROTEGO: Mái vòm khiên chắn năng lượng lấp lánh quanh người
  private spellProtego(casterId: string, player: MyPlayer | OtherPlayer) {
    if (this.shieldMap.has(casterId)) {
      this.shieldMap.get(casterId)?.destroy()
      this.shieldMap.delete(casterId)
    }

    const shieldGfx = this.scene.add.graphics()
    shieldGfx.setDepth(3502)

    const drawShield = (radius: number, alpha: number) => {
      shieldGfx.clear()
      // Viền sáng cyan
      shieldGfx.lineStyle(2.5, 0x00f2fe, alpha)
      shieldGfx.strokeCircle(player.x, player.y - 12, radius)
      // Lớp màng năng lượng
      shieldGfx.fillStyle(0x4facfe, alpha * 0.28)
      shieldGfx.fillCircle(player.x, player.y - 12, radius)
    }

    let currentRadius = 32
    let currentAlpha = 0.95
    drawShield(currentRadius, currentAlpha)

    // Hiệu ứng phập phồng của màng khiên
    const tween = this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 3800,
      onUpdate: (tw) => {
        const progress = tw.getValue() / 100
        const pulse = Math.sin(progress * Math.PI * 8) * 3
        const fade = progress > 0.8 ? (1 - progress) / 0.2 : 1
        drawShield(32 + pulse, 0.95 * fade)
      },
      onComplete: () => {
        shieldGfx.destroy()
        this.shieldMap.delete(casterId)
      },
    })

    this.shieldMap.set(casterId, shieldGfx)
  }

  // 4. EXPELLIARMUS: Tia chớp đỏ xé gió dứt khoát
  private spellExpelliarmus(player: MyPlayer | OtherPlayer, dir: string) {
    const { vx, vy } = this.getVelocityFromDir(dir, 450)
    const beam = this.scene.add.image(player.x, player.y - 14, 'wand_scarlet_spark')
    beam.setBlendMode(Phaser.BlendModes.ADD)
    beam.setDepth(3502)
    beam.setScale(2.0, 1.0)

    const angle = Math.atan2(vy, vx)
    beam.setRotation(angle)

    const targetX = player.x + (vx / 450) * 230
    const targetY = player.y + (vy / 450) * 230

    this.scene.tweens.add({
      targets: beam,
      x: targetX,
      y: targetY,
      duration: 380,
      ease: 'Linear',
      onComplete: () => {
        // Vết nổ tia sét đỏ
        const flare = this.scene.add.image(beam.x, beam.y, 'wand_scarlet_spark')
        flare.setBlendMode(Phaser.BlendModes.ADD)
        flare.setDepth(3503)
        this.scene.tweens.add({
          targets: flare,
          scale: 3.2,
          alpha: 0,
          duration: 300,
          onComplete: () => flare.destroy(),
        })
        beam.destroy()
      },
    })
  }

  // 5. WINGARDIUM: Nhấc bổng nhân vật lơ lửng và lông vũ xoay quanh
  private spellWingardium(player: MyPlayer | OtherPlayer) {
    const initialY = player.y
    const containerInitialY = player.playerContainer.y

    // Bay bổng lên 22px và nhấp nhô
    this.scene.tweens.add({
      targets: player,
      y: initialY - 22,
      duration: 700,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: player,
          y: initialY - 16,
          yoyo: true,
          repeat: 4,
          duration: 650,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            // Hạ cánh nhẹ nhàng
            this.scene.tweens.add({
              targets: player,
              y: initialY,
              duration: 600,
              ease: 'Bounce.easeOut',
            })
          },
        })
      },
    })

    // Container tên và bubble cũng nhấp nhô theo
    this.scene.tweens.add({
      targets: player.playerContainer,
      y: containerInitialY - 22,
      duration: 700,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: player.playerContainer,
          y: containerInitialY - 16,
          yoyo: true,
          repeat: 4,
          duration: 650,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.scene.tweens.add({
              targets: player.playerContainer,
              y: containerInitialY,
              duration: 600,
              ease: 'Bounce.easeOut',
            })
          },
        })
      },
    })
  }

  // 6. PATRONUS: Thần Hộ Mệnh bạc lượn quanh và xua tan bóng tối
  private spellPatronus(player: MyPlayer | OtherPlayer) {
    // Sóng xung kích bạc tỏa tròn
    const ringGfx = this.scene.add.graphics().setDepth(3502)
    this.scene.tweens.addCounter({
      from: 10,
      to: 130,
      duration: 900,
      ease: 'Cubic.easeOut',
      onUpdate: (tw) => {
        const r = tw.getValue()
        const a = 1 - r / 130
        ringGfx.clear()
        ringGfx.lineStyle(3, 0xffffff, a)
        ringGfx.strokeCircle(player.x, player.y - 12, r)
        ringGfx.fillStyle(0xdff9fb, a * 0.2)
        ringGfx.fillCircle(player.x, player.y - 12, r)
      },
      onComplete: () => ringGfx.destroy(),
    })

    // Linh thú thần hộ mệnh ánh bạc lượn quanh theo quỹ đạo xoắn ốc
    const orb = this.scene.add.image(player.x, player.y - 12, 'wand_silver_patronus')
    orb.setBlendMode(Phaser.BlendModes.ADD)
    orb.setDepth(3503)
    orb.setScale(1.6)

    let angle = 0
    let radius = 20
    const orbTimer = this.scene.time.addEvent({
      delay: 30,
      repeat: 65,
      callback: () => {
        angle += 0.22
        radius += 0.8
        orb.setPosition(player.x + Math.cos(angle) * radius, player.y - 12 + Math.sin(angle) * (radius * 0.6))
        
        // Thả hạt bụi sao bạc dọc đường bay
        const trailSpark = this.scene.add.image(orb.x, orb.y, 'wand_silver_patronus')
        trailSpark.setBlendMode(Phaser.BlendModes.ADD)
        trailSpark.setDepth(3502)
        trailSpark.setScale(0.8)
        this.scene.tweens.add({
          targets: trailSpark,
          alpha: 0,
          scale: 0.15,
          duration: 400,
          onComplete: () => trailSpark.destroy(),
        })
      },
    })

    this.scene.time.delayedCall(2200, () => {
      orbTimer.remove()
      this.scene.tweens.add({
        targets: orb,
        scale: 3.5,
        alpha: 0,
        duration: 500,
        onComplete: () => orb.destroy(),
      })
    })
  }

  private getPlayerFacingDirection(player: MyPlayer): string {
    const key = player.anims.currentAnim?.key || ''
    if (key.includes('left')) return 'left'
    if (key.includes('right')) return 'right'
    if (key.includes('up')) return 'up'
    return 'down'
  }

  private getVelocityFromDir(dir: string, speed: number): { vx: number; vy: number } {
    switch (dir) {
      case 'left':
        return { vx: -speed, vy: 0 }
      case 'right':
        return { vx: speed, vy: 0 }
      case 'up':
        return { vx: 0, vy: -speed }
      case 'down':
      default:
        return { vx: 0, vy: speed }
    }
  }

  public update() {
    // Cập nhật vị trí của Lumos light bám theo người chơi
    for (const [id, light] of this.lumosMap.entries()) {
      const player = id === this.myPlayer.playerId ? this.myPlayer : this.otherPlayerMap.get(id)
      if (player && light && light.active) {
        light.setPosition(player.x, player.y - 12)
      }
    }
  }

  public destroy() {
    this.wandGraphics.destroy()
    for (const light of this.lumosMap.values()) light.destroy()
    for (const shield of this.shieldMap.values()) shield.destroy()
    this.lumosMap.clear()
    this.shieldMap.clear()
  }
}
