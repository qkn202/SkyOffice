import Phaser from 'phaser'

const directions = [
  { name: 'idle_right', start: 0, end: 5, rate: 9, repeat: -1 },
  { name: 'idle_up', start: 6, end: 11, rate: 9, repeat: -1 },
  { name: 'idle_left', start: 12, end: 17, rate: 9, repeat: -1 },
  { name: 'idle_down', start: 18, end: 23, rate: 9, repeat: -1 },
  { name: 'run_right', start: 24, end: 29, rate: 15, repeat: -1 },
  { name: 'run_up', start: 30, end: 35, rate: 15, repeat: -1 },
  { name: 'run_left', start: 36, end: 41, rate: 15, repeat: -1 },
  { name: 'run_down', start: 42, end: 47, rate: 15, repeat: -1 },
  { name: 'sit_down', start: 48, end: 48, rate: 15, repeat: 0 },
  { name: 'sit_left', start: 49, end: 49, rate: 15, repeat: 0 },
  { name: 'sit_right', start: 50, end: 50, rate: 15, repeat: 0 },
  { name: 'sit_up', start: 51, end: 51, rate: 15, repeat: 0 },
]

export const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
  const characters = ['adam', 'ash', 'lucy', 'nancy']
  const houses = ['', '_gryffindor', '_slytherin', '_ravenclaw', '_hufflepuff']

  characters.forEach((character) => {
    houses.forEach((house) => {
      const texture = `${character}${house}`
      directions.forEach(({ name, start, end, rate, repeat }) => {
        const key = `${texture}_${name}`
        if (anims.exists(key)) return
        anims.create({
          key,
          frames: anims.generateFrameNumbers(texture, { start, end }),
          repeat,
          frameRate: rate,
        })
      })
    })
  })
}
