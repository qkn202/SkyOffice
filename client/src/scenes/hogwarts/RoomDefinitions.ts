import Chair from '../../items/Chair'
import type { HogwartsRoomManager } from '../HogwartsRoomManager'

export type HogwartsRoomId =
  | 'great_hall'
  | 'gryffindor'
  | 'slytherin'
  | 'ravenclaw'
  | 'hufflepuff'

export const HOGWARTS_WORLD_WIDTH = 3600
export const HOGWARTS_WORLD_HEIGHT = 2400

export const GH_OFFSET = { x: 1112, y: 816 }
export const GRY_OFFSET = { x: 540, y: 320 }
export const SLY_OFFSET = { x: 540, y: 1520 }
export const RAV_OFFSET = { x: 2020, y: 320 }
export const HUF_OFFSET = { x: 2020, y: 1520 }

export const ROOM_SPAWNS: Record<HogwartsRoomId, { x: number; y: number }> = {
  great_hall: { x: 1800, y: 1450 },
  gryffindor: { x: 1050, y: 730 },
  slytherin: { x: 1050, y: 1930 },
  ravenclaw: { x: 2530, y: 730 },
  hufflepuff: { x: 2530, y: 1930 },
}

export const ROOM_METADATA: Record<
  HogwartsRoomId,
  { name: string; houseBadge: string; ambientColor: number }
> = {
  great_hall: { name: 'Đại Sảnh Đường Hogwarts', houseBadge: '🏰', ambientColor: 0x090714 },
  gryffindor: { name: 'Tháp Sinh Hoạt Chung Gryffindor', houseBadge: '🦁', ambientColor: 0x1f0b08 },
  slytherin: { name: 'Hầm Ngục Sinh Hoạt Chung Slytherin', houseBadge: '🐍', ambientColor: 0x06140e },
  ravenclaw: { name: 'Tháp Sinh Hoạt Chung Ravenclaw', houseBadge: '🦅', ambientColor: 0x0a1024 },
  hufflepuff: { name: 'Tầng Hầm Sinh Hoạt Chung Hufflepuff', houseBadge: '🦡', ambientColor: 0x181206 },
}

export function getRoomAtPosition(x: number, y: number): HogwartsRoomId {
  if (x < 1450) {
    return y < 1100 ? 'gryffindor' : 'slytherin'
  }
  if (x > 2150) {
    return y < 1100 ? 'ravenclaw' : 'hufflepuff'
  }
  return 'great_hall'
}

/**
 * Checks if a given 2D coordinate is within a polygon using the ray-casting algorithm.
 */
function pointInPolygon(x: number, y: number, poly: [number, number][]): boolean {
  const n = poly.length
  let inside = false
  let p1 = poly[0]
  for (let i = 1; i <= n; i++) {
    const p2 = poly[i % n]
    if (y > Math.min(p1[1], p2[1])) {
      if (y <= Math.max(p1[1], p2[1])) {
        if (x <= Math.max(p1[0], p2[0])) {
          let xinters = p1[0]
          if (p1[1] !== p2[1]) {
            xinters = ((y - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]) + p1[0]
          }
          if (p1[0] === p2[0] || x <= xinters) {
            inside = !inside
          }
        }
      }
    }
    p1 = p2
  }
  return inside
}

// 1. Great Hall Walkable Floor Polygon
const GH_FLOOR_POLY: [number, number][] = [
  [1432, 1073],
  [2155, 1113],
  [2345, 1127],
  [2006, 1373],
  [1894, 1527],
  [1736, 1538],
  [1664, 1362],
  [1268, 1167],
]

function makeCorridorPoly(
  p1: [number, number],
  p2: [number, number],
  width = 190
): [number, number][] {
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  const dist = Math.hypot(dx, dy)
  const nx = -dy / dist
  const ny = dx / dist
  const wHalf = width / 2.0
  return [
    [p1[0] + wHalf * nx, p1[1] + wHalf * ny],
    [p2[0] + wHalf * nx, p2[1] + wHalf * ny],
    [p2[0] - wHalf * nx, p2[1] - wHalf * ny],
    [p1[0] - wHalf * nx, p1[1] - wHalf * ny],
  ]
}

// 2. Corridors
const CORRIDOR_POLYS: [number, number][][] = [
  makeCorridorPoly([1350, 1120], [1120, 720], 190),  // Spoke 1: Gryffindor
  makeCorridorPoly([1700, 1450], [1120, 1690], 190), // Spoke 2: Slytherin
  makeCorridorPoly([2250, 1120], [2280, 720], 190),  // Spoke 3: Ravenclaw
  makeCorridorPoly([1950, 1450], [2280, 1690], 190), // Spoke 4: Hufflepuff
]

// 3. 4 House Common Room Floor Polygons
const HOUSE_ROOM_POLYS: [number, number][][] = [
  // Gryffindor Tower
  [
    [720, 520],
    [1340, 520],
    [1340, 680],
    [1202, 673],
    [1038, 767],
    [720, 680],
  ],
  // Slytherin Dungeon
  [
    [720, 1720],
    [1084, 1602],
    [1156, 1778],
    [1340, 1720],
    [1340, 1880],
    [1080, 2060],
    [720, 1880],
  ],
  // Ravenclaw Tower
  [
    [2260, 520],
    [2820, 520],
    [2820, 680],
    [2560, 770],
    [2375, 727],
    [2185, 713],
  ],
  // Hufflepuff Basement
  [
    [2336, 1613],
    [2820, 1720],
    [2820, 1880],
    [2560, 2060],
    [2260, 1880],
    [2224, 1767],
  ],
]

const ALL_WALKABLE_POLYS: [number, number][][] = [
  GH_FLOOR_POLY,
  ...CORRIDOR_POLYS,
  ...HOUSE_ROOM_POLYS,
]

/**
 * Checks whether the coordinate (x, y) is on an authentic walkable floor of Hogwarts.
 */
export function isWalkablePosition(x: number, y: number): boolean {
  for (const poly of ALL_WALKABLE_POLYS) {
    if (pointInPolygon(x, y, poly)) {
      return true
    }
  }
  return false
}

/**
 * Helper to place a chain of solid physics zone colliders along a wall/rail segment.
 */
function addWallLine(
  m: HogwartsRoomManager,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  step = 22,
  size = 28
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy)
  if (dist === 0) return
  const count = Math.max(1, Math.ceil(dist / step))
  for (let i = 0; i <= count; i++) {
    const t = i / count
    const px = Math.round(x1 + dx * t)
    const py = Math.round(y1 + dy * t)
    m.addStaticZoneCollider(px, py, size, size)
  }
}

export function setupWorldColliders(m: HogwartsRoomManager) {
  // 1. Outer Canvas Boundaries (Safety Perimeter)
  m.addStaticZoneCollider(1800, 70, 3600, 140)    // Top perimeter
  m.addStaticZoneCollider(1800, 2350, 3600, 100)  // Bottom perimeter
  m.addStaticZoneCollider(70, 1200, 140, 2400)    // Left perimeter
  m.addStaticZoneCollider(3530, 1200, 140, 2400)   // Right perimeter

  // 2. Great Hall Interior Tables & Furniture (Hub Origin: 1112, 816)
  const gx = GH_OFFSET.x
  const gy = GH_OFFSET.y

  // High Table Dais (y: 816 + 110 = 926)
  m.addStaticZoneCollider(gx + 688, gy + 110, 1000, 200)

  // Ban Giám Hiệu
  m.addStaticZoneCollider(gx + 670, gy + 365, 60, 20)
  m.addStaticZoneCollider(gx + 730, gy + 395, 60, 20)
  m.addStaticZoneCollider(gx + 790, gy + 425, 60, 20)
  m.addStaticZoneCollider(gx + 850, gy + 455, 60, 20)
  m.addStaticZoneCollider(gx + 910, gy + 485, 60, 20)
  m.addStaticZoneCollider(gx + 970, gy + 515, 60, 20)

  // 4 Dãy Bàn Ăn Học Sinh (Yellow, Blue, Red, Green)
  m.addStaticZoneCollider(gx + 430, gy + 430, 180, 14) // Hufflepuff
  m.addStaticZoneCollider(gx + 560, gy + 495, 180, 14) // Ravenclaw
  m.addStaticZoneCollider(gx + 690, gy + 560, 180, 14) // Gryffindor
  m.addStaticZoneCollider(gx + 820, gy + 625, 180, 14) // Slytherin

  // 3. Great Hall Outer Stone Walls (leaves 4 open doorways connecting to bridges)
  addWallLine(m, 1432, 1073, 2155, 1113) // Top wall between Spoke 1 and Spoke 3
  addWallLine(m, 1268, 1167, 1664, 1362) // West wall between Spoke 1 and Spoke 2
  addWallLine(m, 2345, 1127, 2006, 1373) // East wall between Spoke 3 and Spoke 4
  addWallLine(m, 1736, 1538, 1894, 1527) // South entrance threshold between Spoke 2 and Spoke 4

  // 4. The 4 Grand Bridge Balustrades / Railings (Prevents falling into sky/lake)
  // Spoke 1: Great Hall -> Gryffindor
  addWallLine(m, 1268, 1167, 1038, 767)  // Left rail
  addWallLine(m, 1432, 1073, 1202, 673)  // Right rail

  // Spoke 2: Great Hall -> Slytherin
  addWallLine(m, 1736, 1538, 1156, 1778) // Left rail
  addWallLine(m, 1664, 1362, 1084, 1602) // Right rail

  // Spoke 3: Great Hall -> Ravenclaw
  addWallLine(m, 2155, 1113, 2185, 713)  // Left rail
  addWallLine(m, 2345, 1127, 2375, 727)  // Right rail

  // Spoke 4: Great Hall -> Hufflepuff
  addWallLine(m, 2006, 1373, 2336, 1613) // Left rail
  addWallLine(m, 1894, 1527, 2224, 1767) // Right rail

  // 5. Gryffindor Common Room Walls (leaves open doorway for Spoke 1)
  addWallLine(m, 720, 520, 1340, 520)   // Back wall
  addWallLine(m, 720, 520, 720, 680)    // Left wall
  addWallLine(m, 720, 680, 1038, 767)   // Front-left wall up to bridge left rail
  addWallLine(m, 1202, 673, 1340, 680)  // Front-right wall from bridge right rail
  addWallLine(m, 1340, 520, 1340, 680)  // Right wall
  m.addStaticZoneCollider(1200, 590, 120, 80) // Hearth fireplace

  // 6. Slytherin Common Room Walls (leaves open doorway for Spoke 2)
  addWallLine(m, 720, 1720, 1084, 1602)  // Back-left wall up to bridge right rail
  addWallLine(m, 1156, 1778, 1340, 1720) // Back-right wall from bridge left rail
  addWallLine(m, 720, 1720, 720, 1880)   // Left wall
  addWallLine(m, 720, 1880, 1080, 2060)  // Front-left wall
  addWallLine(m, 1080, 2060, 1340, 1880) // Front-right wall
  addWallLine(m, 1340, 1720, 1340, 1880) // Right wall
  m.addStaticZoneCollider(1200, 1790, 120, 80) // Hearth fireplace

  // 7. Ravenclaw Common Room Walls (leaves open doorway for Spoke 3)
  addWallLine(m, 2260, 520, 2820, 520)  // Back wall
  addWallLine(m, 2260, 520, 2185, 713)  // Left wall up to bridge left rail
  addWallLine(m, 2375, 727, 2560, 770)  // Front-left wall from bridge right rail
  addWallLine(m, 2560, 770, 2820, 680)  // Front-right wall
  addWallLine(m, 2820, 520, 2820, 680)  // Right wall
  m.addStaticZoneCollider(2680, 590, 120, 80) // Statue & library

  // 8. Hufflepuff Common Room Walls (leaves open doorway for Spoke 4)
  addWallLine(m, 2336, 1613, 2820, 1720) // Back-right wall
  addWallLine(m, 2224, 1767, 2260, 1880) // Left wall from bridge right rail
  addWallLine(m, 2260, 1880, 2560, 2060) // Front-left wall
  addWallLine(m, 2560, 2060, 2820, 1880) // Front-right wall
  addWallLine(m, 2820, 1720, 2820, 1880) // Right wall
  m.addStaticZoneCollider(2680, 1790, 120, 80) // Barrel hearth
}

export function setupWorldChairs(m: HogwartsRoomManager) {
  const gx = GH_OFFSET.x
  const gy = GH_OFFSET.y

  // Great Hall Student Tables
  const ghChairs = [
    // Table 1: Hufflepuff
    { x: gx + 380, y: gy + 415, dir: 'down', depth: gy + 415 },
    { x: gx + 440, y: gy + 385, dir: 'down', depth: gy + 415 },
    { x: gx + 500, y: gy + 355, dir: 'down', depth: gy + 415 },
    { x: gx + 360, y: gy + 483, dir: 'up', depth: gy + 450 },
    { x: gx + 420, y: gy + 453, dir: 'up', depth: gy + 450 },
    { x: gx + 480, y: gy + 423, dir: 'up', depth: gy + 450 },
    // Table 2: Ravenclaw
    { x: gx + 510, y: gy + 480, dir: 'down', depth: gy + 480 },
    { x: gx + 570, y: gy + 450, dir: 'down', depth: gy + 480 },
    { x: gx + 630, y: gy + 420, dir: 'down', depth: gy + 480 },
    { x: gx + 490, y: gy + 548, dir: 'up', depth: gy + 515 },
    { x: gx + 550, y: gy + 518, dir: 'up', depth: gy + 515 },
    { x: gx + 610, y: gy + 488, dir: 'up', depth: gy + 515 },
    // Table 3: Gryffindor
    { x: gx + 640, y: gy + 545, dir: 'down', depth: gy + 545 },
    { x: gx + 700, y: gy + 515, dir: 'down', depth: gy + 545 },
    { x: gx + 760, y: gy + 485, dir: 'down', depth: gy + 545 },
    { x: gx + 620, y: gy + 613, dir: 'up', depth: gy + 580 },
    { x: gx + 680, y: gy + 583, dir: 'up', depth: gy + 580 },
    { x: gx + 740, y: gy + 553, dir: 'up', depth: gy + 580 },
    // Table 4: Slytherin
    { x: gx + 770, y: gy + 610, dir: 'down', depth: gy + 610 },
    { x: gx + 830, y: gy + 580, dir: 'down', depth: gy + 610 },
    { x: gx + 890, y: gy + 550, dir: 'down', depth: gy + 610 },
    { x: gx + 750, y: gy + 678, dir: 'up', depth: gy + 645 },
    { x: gx + 810, y: gy + 648, dir: 'up', depth: gy + 645 },
    { x: gx + 870, y: gy + 618, dir: 'up', depth: gy + 645 },
    // High Table Dais
    { x: gx + 705, y: gy + 335, dir: 'down', depth: gy + 335 },
    { x: gx + 945, y: gy + 460, dir: 'down', depth: gy + 460 },
  ]
  ghChairs.forEach((p) => m.addInteractiveChair(p.x, p.y, p.dir, p.depth))

  // Gryffindor Armchairs (Front of Hearth)
  m.addInteractiveChair(1150, 660, 'left', 660)
  m.addInteractiveChair(1250, 660, 'right', 660)

  // Slytherin Leather Chairs (Front of Serpent Hearth)
  m.addInteractiveChair(1150, 1860, 'left', 1860)
  m.addInteractiveChair(1250, 1860, 'right', 1860)

  // Ravenclaw Library Chairs (Front of Bust & Bookshelves)
  m.addInteractiveChair(2620, 660, 'left', 660)
  m.addInteractiveChair(2740, 660, 'right', 660)

  // Hufflepuff Hearth Chairs (Front of Barrel Hearth)
  m.addInteractiveChair(2620, 1860, 'left', 1860)
  m.addInteractiveChair(2740, 1860, 'right', 1860)
}
