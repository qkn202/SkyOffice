import Phaser from 'phaser'

export const HOUSES = ['GRYFFINDOR', 'SLYTHERIN', 'RAVENCLAW', 'HUFFLEPUFF'] as const
export type House = (typeof HOUSES)[number]

const houseHue: Record<House, number> = {
  GRYFFINDOR: 0.99,
  SLYTHERIN: 0.39,
  RAVENCLAW: 0.59,
  HUFFLEPUFF: 0.12,
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  const l = (max + min) / 2
  let s = 0

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h /= 6
    if (h < 0) h += 1
  }
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number) {
  const k = (n: number) => (n + h * 12) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const value = k(n)
    const color = l - a * Math.max(-1, Math.min(value - 3, 9 - value, 1))
    return Math.round(color * 255)
  }
  return [f(0), f(8), f(4)]
}

/** Build the four House colorways from each existing 52-frame character sheet. */
export function createHouseOutfits(textures: Phaser.Textures.TextureManager) {
  const characters = ['adam', 'ash', 'lucy', 'nancy']
  for (const character of characters) {
    const source = textures.get(character).getSourceImage() as HTMLImageElement
    for (const house of HOUSES) {
      const key = `${character}_${house.toLowerCase()}`
      if (textures.exists(key)) continue

      const canvasTexture = textures.createCanvas(key, source.width, source.height)
      if (!canvasTexture) continue
      const context = canvasTexture.getContext()
      context.drawImage(source, 0, 0)
      const image = context.getImageData(0, 0, source.width, source.height)
      const hue = houseHue[house]

      for (let y = 0; y < image.height; y++) {
        const localY = y % 48
        if (localY < 22 || localY > 43) continue
        for (let x = 0; x < image.width; x++) {
          const localX = x % 32
          if (localX < 9 || localX > 22) continue
          const i = (y * image.width + x) * 4
          const alpha = image.data[i + 3]
          if (alpha < 80) continue

          const [, saturation, lightness] = rgbToHsl(
            image.data[i],
            image.data[i + 1],
            image.data[i + 2]
          )

          // Recolor the existing robe accents and lightly tint the robe cloth.
          // The narrow torso mask avoids changing skin, hair, and the background.
          if (saturation > 0.3) {
            const [r, g, b] = hslToRgb(hue, saturation, lightness)
            image.data[i] = r
            image.data[i + 1] = g
            image.data[i + 2] = b
          } else if (lightness > 0.1 && lightness < 0.43) {
            const blend = 0.18
            const [r, g, b] = hslToRgb(hue, 0.34, lightness)
            image.data[i] = Math.round(image.data[i] * (1 - blend) + r * blend)
            image.data[i + 1] = Math.round(image.data[i + 1] * (1 - blend) + g * blend)
            image.data[i + 2] = Math.round(image.data[i + 2] * (1 - blend) + b * blend)
          }
        }
      }

      context.putImageData(image, 0, 0)
      canvasTexture.refresh()
      for (let frame = 0; frame < 52; frame++) {
        canvasTexture.add(String(frame), 0, frame * 32, 0, 32, 48)
      }
    }
  }
}
