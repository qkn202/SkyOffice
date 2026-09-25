import Phaser from 'phaser'
import PlayerSelector from './PlayerSelector'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { sittingShiftData } from './Player'
import Player from './Player'
import Network from '../services/Network'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'

import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { pushPlayerJoinedMessage, setShowChat, setFocused } from '../stores/ChatStore'
import { ItemType } from '../../../types/Items'
import { NavKeys } from '../../../types/KeyboardState'
import { JoystickMovement } from '../components/Joystick'
import { openURL } from '../utils/helpers'

export default class MyPlayer extends Player {
  private playContainerBody: Phaser.Physics.Arcade.Body
  private chairOnSit?: Chair
  private baseCharacterTexture: string
  private house = ''
  public joystickMovement?: JoystickMovement
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame)
    this.baseCharacterTexture = texture
    this.playContainerBody = this.playerContainer.body as Phaser.Physics.Arcade.Body
  }

  setPlayerName(name: string) {
    this.setPlayerDisplayName(name)
    phaserEvents.emit(Event.MY_PLAYER_NAME_CHANGE, name)
    store.dispatch(pushPlayerJoinedMessage(name))
  }

  setPlayerTexture(texture: string) {
    this.baseCharacterTexture = texture
    this.applyHouseTexture()
    phaserEvents.emit(Event.MY_PLAYER_TEXTURE_CHANGE, this.x, this.y, this.anims.currentAnim.key)
  }

  setHouse(house: string, network: Network) {
    this.house = house.toUpperCase()
    this.setHouseBadge(this.house)
    this.applyHouseTexture()
    network.updatePlayerAppearance(this.house, this.baseCharacterTexture)
    network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
  }

  private applyHouseTexture() {
    const suffix = this.house ? `_${this.house.toLowerCase()}` : ''
    this.playerTexture = `${this.baseCharacterTexture}${suffix}`
    this.setTexture(this.playerTexture)

    const currentKey = this.anims.currentAnim?.key || ''
    const action = currentKey.match(/(idle|run|sit)_(right|up|left|down)$/)?.[0] || 'idle_down'
    this.anims.play(`${this.playerTexture}_${action}`, true)
  }

  handleJoystickMovement(movement: JoystickMovement) {
    this.joystickMovement = movement
  }

  update(
    playerSelector: PlayerSelector,
    cursors: NavKeys,
    keyE: Phaser.Input.Keyboard.Key,
    keyR: Phaser.Input.Keyboard.Key,
    network: Network
  ) {
    if (!cursors) return

    const item = playerSelector.selectedItem
    const isJustDownE = Phaser.Input.Keyboard.JustDown(keyE)
    const isJustDownR = Phaser.Input.Keyboard.JustDown(keyR)

    if (
      isJustDownR ||
      (isJustDownE &&
        (item?.itemType === ItemType.WHITEBOARD || item?.itemType === ItemType.VENDINGMACHINE))
    ) {
      switch (item?.itemType) {
        case ItemType.COMPUTER:
          const computer = item as Computer
          computer.openDialog(this.playerId, network)
          break
        case ItemType.WHITEBOARD:
          const whiteboard = item as Whiteboard
          whiteboard.openDialog(network)
          break
        case ItemType.VENDINGMACHINE:
          store.dispatch(setShowChat(true))
          store.dispatch(setFocused(true))
          break
      }
    }

    switch (this.playerBehavior) {
      case PlayerBehavior.IDLE:
        // if press E in front of selected chair
        if (isJustDownE && item?.itemType === ItemType.CHAIR) {
          const chairItem = item as Chair
          /**
           * move player to the chair and play sit animation
           * a delay is called to wait for player movement (from previous velocity) to end
           * as the player tends to move one more frame before sitting down causing player
           * not sitting at the center of the chair
           */
          this.scene.time.addEvent({
            delay: 10,
            callback: () => {
              // update character velocity and position
              this.setVelocity(0, 0)
              if (chairItem.itemDirection) {
                this.setPosition(
                  chairItem.x + sittingShiftData[chairItem.itemDirection][0],
                  chairItem.y + sittingShiftData[chairItem.itemDirection][1]
                ).setDepth(chairItem.depth + sittingShiftData[chairItem.itemDirection][2])
                // also update playerNameContainer velocity and position
                this.playContainerBody.setVelocity(0, 0)
                this.playerContainer.setPosition(
                  chairItem.x + sittingShiftData[chairItem.itemDirection][0],
                  chairItem.y + sittingShiftData[chairItem.itemDirection][1] - 30
                )
              }

              this.play(`${this.playerTexture}_sit_${chairItem.itemDirection}`, true)
              playerSelector.selectedItem = undefined
              if (chairItem.itemDirection === 'up') {
                playerSelector.setPosition(this.x, this.y - this.height)
              } else {
                playerSelector.setPosition(0, 0)
              }
              // send new location and anim to server
              network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
            },
            loop: false,
          })
          // set up new dialog as player sits down
          chairItem.clearDialogBox()
          chairItem.setDialogBox('Press E to leave')
          this.chairOnSit = chairItem
          this.playerBehavior = PlayerBehavior.SITTING
          return
        }

        const speed = 200
        let vx = 0
        let vy = 0

        let joystickLeft = false
        let joystickRight = false
        let joystickUp = false
        let joystickDown = false

        if (this.joystickMovement?.isMoving) {
          joystickLeft = this.joystickMovement.direction.left
          joystickRight = this.joystickMovement.direction.right
          joystickUp = this.joystickMovement.direction.up
          joystickDown = this.joystickMovement.direction.down
        }

        if (cursors.left?.isDown || cursors.A?.isDown || joystickLeft) vx -= speed
        if (cursors.right?.isDown || cursors.D?.isDown || joystickRight) vx += speed
        if (cursors.up?.isDown || cursors.W?.isDown || joystickUp) {
          vy -= speed
          this.setDepth(this.y) //change player.depth if player.y changes
        }
        if (cursors.down?.isDown || cursors.S?.isDown || joystickDown) {
          vy += speed
          this.setDepth(this.y) //change player.depth if player.y changes
        }
        // update character velocity
        this.setVelocity(vx, vy)
        this.body.velocity.setLength(speed)
        // also update playerNameContainer velocity
        this.playContainerBody.setVelocity(vx, vy)
        this.playContainerBody.velocity.setLength(speed)

        // update animation according to velocity and send new location and anim to server
        if (vx !== 0 || vy !== 0) network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
        if (vx > 0) {
          this.play(`${this.playerTexture}_run_right`, true)
        } else if (vx < 0) {
          this.play(`${this.playerTexture}_run_left`, true)
        } else if (vy > 0) {
          this.play(`${this.playerTexture}_run_down`, true)
        } else if (vy < 0) {
          this.play(`${this.playerTexture}_run_up`, true)
        } else {
          const direction =
            this.anims.currentAnim.key.match(/_(right|up|left|down)$/)?.[1] || 'down'
          const newAnim = `${this.playerTexture}_idle_${direction}`
          // this prevents idle animation keeps getting called
          if (this.anims.currentAnim.key !== newAnim) {
            this.play(newAnim, true)
            // send new location and anim to server
            network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
          }
        }
        break

      case PlayerBehavior.SITTING:
        // back to idle if player press E or movement key while sitting
        const hasMovement =
          cursors.left?.isDown ||
          cursors.right?.isDown ||
          cursors.up?.isDown ||
          cursors.down?.isDown ||
          cursors.A?.isDown ||
          cursors.D?.isDown ||
          cursors.W?.isDown ||
          cursors.S?.isDown ||
          this.joystickMovement?.isMoving
        if (isJustDownE || hasMovement) {
          const direction =
            this.anims.currentAnim.key.match(/_(right|up|left|down)$/)?.[1] || 'down'
          this.play(`${this.playerTexture}_idle_${direction}`, true)
          this.playerBehavior = PlayerBehavior.IDLE
          this.chairOnSit?.clearDialogBox()
          this.chairOnSit = undefined
          playerSelector.setPosition(this.x, this.y)
          playerSelector.update(this, cursors)
          network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
        }
        break
    }
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer(x: number, y: number, texture: string, id: string, frame?: string | number): MyPlayer
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    const sprite = new MyPlayer(this.scene, x, y, texture, id, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    const collisionScale = [0.5, 0.2]
    sprite.body
      .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1])
      )

    return sprite
  }
)
