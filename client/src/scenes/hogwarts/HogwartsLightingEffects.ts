import Phaser from 'phaser'

export interface FloatingCandleData {
  sprite: Phaser.GameObjects.Image
  baseY: number
  phase: number
  speed: number
  amp: number
}

export class HogwartsLightingEffects {
  private scene: Phaser.Scene
  public floatingCandles: FloatingCandleData[] = []
  public flooLight?: Phaser.GameObjects.Image
  private fxObjects: Phaser.GameObjects.GameObject[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  public init() {
    this.ensureTextures()
    this.setupChiaroscuroLighting()
    this.setupFloatingCandles()
  }

  private ensureTextures() {
    // 1. Tạo texture Nến Bay Ma Thuật
    if (!this.scene.textures.exists('hogwarts_floating_candle')) {
      const canvas = this.scene.textures.createCanvas('hogwarts_floating_candle', 16, 28)
      if (canvas) {
        const ctx = canvas.getContext()
        ctx.fillStyle = '#f8f2e4'
        ctx.fillRect(6, 10, 4, 16)
        ctx.fillStyle = '#d4c8b0'
        ctx.fillRect(6, 10, 1, 16)
        ctx.fillStyle = '#b8aa90'
        ctx.fillRect(9, 10, 1, 16)
        ctx.fillStyle = '#22150c'
        ctx.fillRect(7, 8, 2, 2)
        const grad = ctx.createRadialGradient(8, 6, 1, 8, 6, 7)
        grad.addColorStop(0, 'rgba(255, 255, 220, 1)')
        grad.addColorStop(0.3, 'rgba(255, 200, 40, 0.9)')
        grad.addColorStop(0.7, 'rgba(255, 90, 15, 0.4)')
        grad.addColorStop(1, 'rgba(255, 50, 0, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(8, 6, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(7, 5, 2, 3)
        canvas.refresh()
      }
    }

    // 2. Tạo texture quầng sáng vàng ấm (Warm Light Halo)
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

    // 3. Tạo texture quầng sáng xanh lục bảo Lò sưởi Floo
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

  private setupChiaroscuroLighting() {
    const mapW = 3600
    const mapH = 2400
    const gx = 1112
    const gy = 816

    const darkness = this.scene.add.rectangle(mapW / 2, mapH / 2, mapW, mapH, 0x090714, 0.15)
    darkness.setDepth(3500)
    this.fxObjects.push(darkness)

    const torchCoords = [
      [gx + 360, gy + 260], [gx + 460, gy + 240], [gx + 600, gy + 220], [gx + 800, gy + 220], [gx + 980, gy + 220], [gx + 1160, gy + 240],
      [gx + 140, gy + 520], [gx + 220, gy + 420], [gx + 300, gy + 340],
      [gx + 1280, gy + 460], [gx + 1320, gy + 600]
    ]
    torchCoords.forEach(([tx, ty]) => {
      const halo = this.scene.add.image(tx, ty, 'light_halo_warm')
      halo.setBlendMode(Phaser.BlendModes.ADD)
      halo.setDepth(3501)
      halo.setScale(1.2)
      halo.setAlpha(0.55)
      this.fxObjects.push(halo)
    })

    const daisGlow = this.scene.add.image(gx + 790, gy + 480, 'light_halo_warm')
    daisGlow.setBlendMode(Phaser.BlendModes.ADD)
    daisGlow.setDepth(3501)
    daisGlow.setScale(2.8, 1.4)
    daisGlow.setAlpha(0.5)
    this.fxObjects.push(daisGlow)

    this.flooLight = this.scene.add.image(gx + 800, gy + 460, 'light_halo_floo')
    this.flooLight.setBlendMode(Phaser.BlendModes.ADD)
    this.flooLight.setDepth(3502)
    this.flooLight.setScale(2.2)
    this.flooLight.setAlpha(0.65)
    this.fxObjects.push(this.flooLight)
  }

  private setupFloatingCandles() {
    const gx = 1112
    const gy = 816
    const candleCoords: [number, number][] = []
    for (let x = 380; x <= 980; x += 45) {
      candleCoords.push([gx + x, gy + 145 + ((x * 7) % 40)])
      if (x % 90 === 0) {
        candleCoords.push([gx + x + 20, gy + 185 + ((x * 3) % 40)])
      }
    }

    candleCoords.forEach(([cx, cy], i) => {
      const sprite = this.scene.add.image(cx, cy, 'hogwarts_floating_candle')
      sprite.setDepth(4500)
      sprite.setScale(1.1)
      this.fxObjects.push(sprite)

      if (i % 3 === 0) {
        const cGlow = this.scene.add.image(cx, cy + 18, 'light_halo_warm')
        cGlow.setBlendMode(Phaser.BlendModes.ADD)
        cGlow.setDepth(3501)
        cGlow.setScale(0.75)
        cGlow.setAlpha(0.3)
        this.fxObjects.push(cGlow)
      }

      this.floatingCandles.push({
        sprite,
        baseY: cy,
        phase: (i * 0.45) % (Math.PI * 2),
        speed: 0.85 + (i % 5) * 0.1,
        amp: 4 + (i % 4) * 1.5,
      })
    })
  }

  public update(t: number) {
    if (this.floatingCandles.length > 0) {
      for (let i = 0; i < this.floatingCandles.length; i++) {
        const c = this.floatingCandles[i]
        c.sprite.y = c.baseY + Math.sin(t * 0.0025 * c.speed + c.phase) * c.amp
      }
    }
    if (this.flooLight && this.flooLight.active) {
      this.flooLight.setAlpha(0.4 + Math.sin(t * 0.004) * 0.15)
    }
  }

  public destroy() {
    for (const obj of this.fxObjects) obj.destroy()
    this.fxObjects = []
    this.floatingCandles = []
    this.flooLight = undefined
  }
}
