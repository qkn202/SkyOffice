import Phaser from 'phaser'
import Network from '../services/Network'
import { BackgroundMode } from '../../../types/BackgroundMode'
import store from '../stores'
import { setRoomJoined } from '../stores/RoomStore'
import { createHouseOutfits } from '../utils/houseOutfits'

export default class Bootstrap extends Phaser.Scene {
  private preloadComplete = false
  network!: Network

  constructor() {
    super('bootstrap')
  }

  preload() {
    this.load.atlas(
      'cloud_day',
      'assets/background/cloud_day.png',
      'assets/background/cloud_day.json'
    )
    this.load.image('backdrop_day', 'assets/background/backdrop_day.png?v=mid_autumn_v1')
    this.load.atlas(
      'cloud_night',
      'assets/background/cloud_night.png',
      'assets/background/cloud_night.json'
    )
    this.load.image('backdrop_night', 'assets/background/backdrop_night.png?v=mid_autumn_v1')
    this.load.image('sun_moon', 'assets/background/sun_moon.png')

    this.load.tilemapTiledJSON('tilemap', 'assets/map/map.json')
    this.load.image('hogwarts_castle_world', 'assets/map/v2/hogwarts_castle_world.png?v=luxurious_rooms_20260926_1')
    this.load.image('great_hall_25d', 'assets/map/v2/great_hall_25d.png?v=luxurious_rooms_20260926_1')
    this.load.image('gryffindor_common_room_25d', 'assets/map/v2/gryffindor_common_room_25d.png?v=luxurious_rooms_20260926_1')
    this.load.image('slytherin_common_room_25d', 'assets/map/v2/slytherin_common_room_25d.png?v=luxurious_rooms_20260926_1')
    this.load.image('ravenclaw_common_room_25d', 'assets/map/v2/ravenclaw_common_room_25d.png?v=luxurious_rooms_20260926_1')
    this.load.image('hufflepuff_common_room_25d', 'assets/map/v2/hufflepuff_common_room_25d.png?v=luxurious_rooms_20260926_1')
    this.load.image('high_table_fg', 'assets/map/v2/high_table_fg.png')
    this.load.image('table_yellow_fg', 'assets/map/v2/table_yellow_fg.png')
    this.load.image('table_blue_fg', 'assets/map/v2/table_blue_fg.png')
    this.load.image('table_red_fg', 'assets/map/v2/table_red_fg.png')
    this.load.image('table_green_fg', 'assets/map/v2/table_green_fg.png')
    this.load.image('dumbledore_seated', 'assets/npc/v3/dumbledore_seated.png')
    this.load.image('mcgonagall_seated', 'assets/npc/v3/mcgonagall_seated.png')
    this.load.image('snape_seated', 'assets/npc/v3/snape_seated.png')
    this.load.spritesheet('tiles_wall', 'assets/map/FloorAndGround.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.image('lantern_star', 'assets/items/lantern_star.png')
    this.load.image('lantern_red', 'assets/items/lantern_red.png')
    this.load.image('lantern_gold', 'assets/items/lantern_gold.png')
    this.load.image('lantern_green', 'assets/items/lantern_green.png')
    this.load.image('lantern_blue', 'assets/items/lantern_blue.png')
    this.load.image('lion_head_front', 'assets/npc/lion/lion_head_front.png')
    this.load.image('lion_head_side', 'assets/npc/lion/lion_head_side.png')
    this.load.image('lion_head_back', 'assets/npc/lion/lion_head_back.png')
    this.load.image('lion_body_mid', 'assets/npc/lion/lion_body_mid.png')
    this.load.image('lion_body_rear', 'assets/npc/lion/lion_body_rear.png')
    this.load.image('lion_tail', 'assets/npc/lion/lion_tail.png')
    this.load.image('lion_paw', 'assets/npc/lion/lion_paw.png')
    this.load.image('ong_dia', 'assets/npc/lion/ong_dia.png')
    this.load.spritesheet('chairs', 'assets/items/chair.png', {
      frameWidth: 32,
      frameHeight: 64,
    })
    this.load.spritesheet('computers', 'assets/items/computer.png', {
      frameWidth: 96,
      frameHeight: 64,
    })
    this.load.spritesheet('whiteboards', 'assets/items/whiteboard.png', {
      frameWidth: 64,
      frameHeight: 64,
    })
    this.load.spritesheet('vendingmachines', 'assets/items/vendingmachine.png', {
      frameWidth: 48,
      frameHeight: 72,
    })
    this.load.spritesheet('office', 'assets/tileset/Modern_Office_Black_Shadow.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('basement', 'assets/tileset/Basement.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('generic', 'assets/tileset/Generic.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    const charV = 'chibi_v6'
    this.load.spritesheet('adam', `assets/character/adam.png?v=${charV}`, {
      frameWidth: 32,
      frameHeight: 48,
    })
    this.load.spritesheet('ash', `assets/character/ash.png?v=${charV}`, {
      frameWidth: 32,
      frameHeight: 48,
    })
    this.load.spritesheet('lucy', `assets/character/lucy.png?v=${charV}`, {
      frameWidth: 32,
      frameHeight: 48,
    })
    this.load.spritesheet('nancy', `assets/character/nancy.png?v=${charV}`, {
      frameWidth: 32,
      frameHeight: 48,
    })

    this.load.on('complete', () => {
      createHouseOutfits(this.textures)
      this.preloadComplete = true
      this.launchBackground(store.getState().user.backgroundMode)
    })
  }

  init() {
    this.network = new Network()
  }

  private launchBackground(backgroundMode: BackgroundMode) {
    this.scene.launch('background', { backgroundMode })
  }

  launchGame() {
    if (!this.preloadComplete) {
      this.load.once('complete', () => {
        this.launchGame()
      })
      return
    }
    this.network.webRTC?.checkPreviousPermission()
    this.scene.launch('game', {
      network: this.network,
    })

    // update Redux state
    store.dispatch(setRoomJoined(true))
  }

  changeBackgroundMode(backgroundMode: BackgroundMode) {
    this.scene.stop('background')
    this.launchBackground(backgroundMode)
  }
}
