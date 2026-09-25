import Phaser from 'phaser'
import { BackgroundMode } from '../../../types/BackgroundMode'

export default class Background extends Phaser.Scene {
  private cloud!: Phaser.Physics.Arcade.Group
  private cloudKey!: string
  private backdropKey!: string

  constructor() {
    super('background')
  }

  create(data: { backgroundMode: BackgroundMode }) {
    const sceneHeight = this.cameras.main.height
    const sceneWidth = this.cameras.main.width

    // set texture of images based on the background mode
    this.cameras.main.setBackgroundColor('#080612')
    if (data.backgroundMode === BackgroundMode.DAY) {
      this.backdropKey = 'backdrop_day'
      this.cloudKey = 'cloud_day'
    } else {
      this.backdropKey = 'backdrop_night'
      this.cloudKey = 'cloud_night'
    }

    // Add backdrop image
    const backdropImage = this.add.image(sceneWidth / 2, sceneHeight / 2, this.backdropKey)
    const scale = Math.max(sceneWidth / backdropImage.width, sceneHeight / backdropImage.height)
    backdropImage.setScale(scale).setScrollFactor(0)

    // Add subtle enchanted celestial mist
    const frames = this.textures.get(this.cloudKey).getFrameNames()
    this.cloud = this.physics.add.group()
    for (let i = 0; i < 16; i++) {
      const x = Phaser.Math.RND.between(-sceneWidth * 0.5, sceneWidth * 1.5)
      const y = Phaser.Math.RND.between(sceneHeight * 0.1, sceneHeight * 0.9)
      const velocity = Phaser.Math.RND.between(8, 18)

      const c = this.cloud
        .get(x, y, this.cloudKey, frames[i % 6])
        .setScale(3)
        .setVelocity(velocity, 0)
        .setAlpha(0.25)
      if (c.setTint) c.setTint(0x442266)
    }
  }

  update(t: number, dt: number) {
    this.physics.world.wrap(this.cloud, 500)
  }
}
