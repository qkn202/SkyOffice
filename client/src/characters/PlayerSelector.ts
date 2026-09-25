import Phaser from 'phaser'
import MyPlayer from './MyPlayer'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import Item from '../items/Item'
import { NavKeys } from '../../../types/KeyboardState'
export default class PlayerSelector extends Phaser.GameObjects.Zone {
  selectedItem?: Item

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y, width, height)

    scene.physics.add.existing(this)
  }

  update(player: MyPlayer, cursors: NavKeys) {
    if (!cursors) {
      return
    }

    // no need to update player selection while sitting
    if (player.playerBehavior === PlayerBehavior.SITTING) {
      return
    }

    // update player selection box position so that it's always in front of the player
    const { x, y } = player
    let joystickLeft = false
    let joystickRight = false
    let joystickUp = false
    let joystickDown = false
    if (player.joystickMovement?.isMoving) {
      joystickLeft = player.joystickMovement?.direction.left
      joystickRight = player.joystickMovement?.direction.right
      joystickUp = player.joystickMovement?.direction.up
      joystickDown = player.joystickMovement?.direction.down
    }
    let dir = 'down'
    if (player.anims?.currentAnim?.key) {
      const parts = player.anims.currentAnim.key.split('_')
      const lastPart = parts[parts.length - 1]
      if (['left', 'right', 'up', 'down'].includes(lastPart)) {
        dir = lastPart
      }
    }

    if (cursors.left?.isDown || cursors.A?.isDown || joystickLeft) {
      dir = 'left'
    } else if (cursors.right?.isDown || cursors.D?.isDown || joystickRight) {
      dir = 'right'
    } else if (cursors.up?.isDown || cursors.W?.isDown || joystickUp) {
      dir = 'up'
    } else if (cursors.down?.isDown || cursors.S?.isDown || joystickDown) {
      dir = 'down'
    }

    const offset = 28
    let targetX = x
    let targetY = y
    if (dir === 'left') {
      targetX = x - offset
    } else if (dir === 'right') {
      targetX = x + offset
    } else if (dir === 'up') {
      targetY = y - offset
    } else {
      targetY = y + offset
    }

    this.setPosition(targetX, targetY)
    if (this.body) {
      ;(this.body as Phaser.Physics.Arcade.Body).reset(targetX, targetY)
    }

    // Direct proximity check to chairs for 100% reliable 2.5D interaction
    const gameScene = this.scene as any
    const nearbyChair = gameScene.findClosestChair?.(targetX, targetY, 52)

    if (nearbyChair) {
      if (this.selectedItem !== nearbyChair) {
        if (this.selectedItem) {
          this.selectedItem.clearDialogBox()
        }
        this.selectedItem = nearbyChair
        nearbyChair.onOverlapDialog()
      }
    } else {
      if (this.selectedItem) {
        this.selectedItem.clearDialogBox()
        this.selectedItem = undefined
      }
    }
  }
}
