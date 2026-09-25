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

export function setupWorldColliders(m: HogwartsRoomManager) {
  // 1. Outer Castle Boundaries
  m.addStaticZoneCollider(1800, 70, 3600, 140)    // Top perimeter
  m.addStaticZoneCollider(1800, 2350, 3600, 100)  // Bottom perimeter
  m.addStaticZoneCollider(70, 1200, 140, 2400)    // Left perimeter
  m.addStaticZoneCollider(3530, 1200, 140, 2400)   // Right perimeter

  // 2. Great Hall Interior Walls & Tables (Hub Origin: 1112, 816)
  const gx = GH_OFFSET.x
  const gy = GH_OFFSET.y

  // High Table Dais (y: 816 + 110 = 926)
  m.addStaticZoneCollider(gx + 688, gy + 110, 1000, 200)

  // Middle pillars along left & right walls (leaving open corridors at top & bottom)
  m.addStaticZoneCollider(gx + 80, gy + 480, 80, 160)   // West middle wall
  m.addStaticZoneCollider(gx + 1290, gy + 480, 80, 160) // East middle wall

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

  // 3. Gryffindor Hearth & Walls (Top-Left Wing: 540, 320)
  m.addStaticZoneCollider(1200, 590, 140, 100)

  // 4. Slytherin Serpent Hearth & Walls (Bottom-Left Wing: 540, 1520)
  m.addStaticZoneCollider(1200, 1790, 140, 100)

  // 5. Ravenclaw Statue & Walls (Top-Right Wing: 2020, 320)
  m.addStaticZoneCollider(2680, 590, 140, 100)

  // 6. Hufflepuff Barrel Hearth & Walls (Bottom-Right Wing: 2020, 1520)
  m.addStaticZoneCollider(2680, 1790, 140, 100)
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

  // Gryffindor Armchairs
  m.addInteractiveChair(1230, 780, 'left', 780)
  m.addInteractiveChair(1320, 820, 'up', 820)

  // Slytherin Leather Chairs
  m.addInteractiveChair(1230, 1980, 'left', 1980)
  m.addInteractiveChair(1320, 2020, 'up', 2020)

  // Ravenclaw Library Chairs
  m.addInteractiveChair(2350, 780, 'right', 780)
  m.addInteractiveChair(2260, 820, 'up', 820)

  // Hufflepuff Hearth Chairs
  m.addInteractiveChair(2350, 1980, 'right', 1980)
  m.addInteractiveChair(2260, 2020, 'up', 2020)
}
