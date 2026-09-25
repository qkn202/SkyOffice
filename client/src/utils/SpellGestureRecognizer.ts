export interface Point {
  x: number
  y: number
}

export interface SpellResult {
  spell: 'LUMOS' | 'INCENDIO' | 'PROTEGO' | 'EXPELLIARMUS' | 'WINGARDIUM' | 'PATRONUS' | 'UNKNOWN'
  incantation: string
  emoji: string
  confidence: number
}

const NUM_POINTS = 32
const SQUARE_SIZE = 120.0

function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

function pathLength(points: Point[]): number {
  let d = 0
  for (let i = 1; i < points.length; i++) {
    d += distance(points[i - 1], points[i])
  }
  return d
}

function resample(points: Point[], n = NUM_POINTS): Point[] {
  if (points.length === 0) return []
  if (points.length === 1) {
    return Array(n).fill({ x: points[0].x, y: points[0].y })
  }
  const totalLen = pathLength(points)
  if (totalLen <= 0) {
    return Array(n).fill({ x: points[0].x, y: points[0].y })
  }

  const interval = totalLen / (n - 1)
  let accumulatedDist = 0.0
  const newPoints: Point[] = [{ x: points[0].x, y: points[0].y }]
  const pts = points.map((p) => ({ x: p.x, y: p.y }))

  for (let i = 1; i < pts.length; i++) {
    const d = distance(pts[i - 1], pts[i])
    if (accumulatedDist + d >= interval) {
      const qx = pts[i - 1].x + ((interval - accumulatedDist) / d) * (pts[i].x - pts[i - 1].x)
      const qy = pts[i - 1].y + ((interval - accumulatedDist) / d) * (pts[i].y - pts[i - 1].y)
      const q = { x: qx, y: qy }
      newPoints.push(q)
      pts.splice(i, 0, q)
      accumulatedDist = 0.0
    } else {
      accumulatedDist += d
    }
  }

  while (newPoints.length < n) {
    newPoints.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y })
  }
  return newPoints.slice(0, n)
}

function boundingBox(points: Point[]) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  return { minX, maxX, minY, maxY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
}

function scaleTo(points: Point[], size = SQUARE_SIZE): Point[] {
  const box = boundingBox(points)
  return points.map((p) => ({
    x: ((p.x - box.minX) / box.width) * size,
    y: ((p.y - box.minY) / box.height) * size,
  }))
}

function centroid(points: Point[]): Point {
  let cx = 0
  let cy = 0
  for (const p of points) {
    cx += p.x
    cy += p.y
  }
  return { x: cx / points.length, y: cy / points.length }
}

function translateTo(points: Point[], toPt: Point = { x: 0, y: 0 }): Point[] {
  const c = centroid(points)
  return points.map((p) => ({
    x: p.x - c.x + toPt.x,
    y: p.y - c.y + toPt.y,
  }))
}

function pathDistance(pts1: Point[], pts2: Point[]): number {
  let d = 0
  const len = Math.min(pts1.length, pts2.length)
  for (let i = 0; i < len; i++) {
    d += distance(pts1[i], pts2[i])
  }
  return d / len
}

function normalizeGesture(points: Point[]): Point[] {
  return translateTo(scaleTo(resample(points, NUM_POINTS), SQUARE_SIZE))
}

// Generate Canonical Geometric Templates for Harry Potter Spells
function buildTemplates(): { spell: SpellResult['spell']; template: Point[]; incantation: string; emoji: string }[] {
  // 1. LUMOS: Circle (Clockwise and Counter-clockwise)
  // A closed circle can start anywhere, including the top shown in the spellbook.
  const circles = Array.from({ length: 16 }, (_, start) =>
    [1, -1].map((direction) => ({
      spell: 'LUMOS' as const,
      template: normalizeGesture(Array.from({ length: 33 }, (_, step) => {
        const angle = start * Math.PI / 8 + direction * step * Math.PI / 16
        return { x: 50 + 40 * Math.cos(angle), y: 50 + 40 * Math.sin(angle) }
      })),
      incantation: 'Lumos!',
      emoji: '✨',
    }))
  ).flat()

  // 2. INCENDIO: Triangle starting from bottom-left -> peak -> bottom-right -> bottom-left (both directions)
  const triangle: Point[] = []
  for (let t = 0; t <= 1; t += 0.1) triangle.push({ x: 20 + 40 * t, y: 100 - 80 * t }) // up to peak
  for (let t = 0; t <= 1; t += 0.1) triangle.push({ x: 60 + 40 * t, y: 20 + 80 * t })  // down to right
  for (let t = 0; t <= 1; t += 0.1) triangle.push({ x: 100 - 80 * t, y: 100 })          // base across

  const incendios = [
    { spell: 'INCENDIO' as const, template: normalizeGesture(triangle), incantation: 'Incendio!', emoji: '🔥' },
    { spell: 'INCENDIO' as const, template: normalizeGesture(triangle.slice().reverse()), incantation: 'Incendio!', emoji: '🔥' },
  ]

  // 3. PROTEGO: Arch / Inverted V / Shield roof (up to peak, then down - both directions)
  const arch: Point[] = []
  for (let t = 0; t <= 1; t += 0.08) arch.push({ x: 20 + 40 * t, y: 100 - 70 * t }) // up to peak
  for (let t = 0; t <= 1; t += 0.08) arch.push({ x: 60 + 40 * t, y: 30 + 70 * t })  // down to right

  const protegos = [
    { spell: 'PROTEGO' as const, template: normalizeGesture(arch), incantation: 'Protego!', emoji: '🛡️' },
    { spell: 'PROTEGO' as const, template: normalizeGesture(arch.slice().reverse()), incantation: 'Protego!', emoji: '🛡️' },
  ]

  // 4. EXPELLIARMUS: Zigzag / Lightning bolt (right -> down-left -> right)
  const zigzag: Point[] = []
  for (let t = 0; t <= 1; t += 0.1) zigzag.push({ x: 20 + 60 * t, y: 20 })
  for (let t = 0; t <= 1; t += 0.1) zigzag.push({ x: 80 - 60 * t, y: 20 + 40 * t })
  for (let t = 0; t <= 1; t += 0.1) zigzag.push({ x: 20 + 60 * t, y: 60 + 40 * t })

  const expelliarmus = [
    { spell: 'EXPELLIARMUS' as const, template: normalizeGesture(zigzag), incantation: 'Expelliarmus!', emoji: '⚡' },
    { spell: 'EXPELLIARMUS' as const, template: normalizeGesture(zigzag.slice().reverse()), incantation: 'Expelliarmus!', emoji: '⚡' },
  ]

  // 5. WINGARDIUM: Swish & flick / Wave (horizontal line with right-end upward flick)
  const wave: Point[] = []
  for (let t = 0; t <= 1; t += 0.08) wave.push({ x: 20 + 60 * t, y: 70 + Math.sin(t * Math.PI) * 10 })
  for (let t = 0; t <= 1; t += 0.1) wave.push({ x: 80 + 20 * t, y: 70 - 50 * t }) // upward flick

  // 6. PATRONUS: Figure 8 / Infinity loop (∞) / Spiral (Vòng vô cực & Xoắn ốc)
  // Supports horizontal infinity, vertical figure-8, 16 starting phase offsets, both directions, and spirals!
  const patronus: { spell: 'PATRONUS'; template: Point[]; incantation: string; emoji: string }[] = []

  // 6a. Horizontal Infinity Loop (16 starting phase angles x 2 directions forward/reverse)
  for (let start = 0; start < 16; start++) {
    const phase = (start / 16) * Math.PI * 2
    for (const dir of [1, -1]) {
      const pts: Point[] = []
      for (let i = 0; i <= 32; i++) {
        const t = phase + dir * (i / 32) * Math.PI * 2
        pts.push({
          x: 60 + 50 * Math.sin(t),
          y: 60 + 35 * Math.sin(t) * Math.cos(t),
        })
      }
      patronus.push({ spell: 'PATRONUS', template: normalizeGesture(pts), incantation: 'Expecto Patronum!', emoji: '🦌' })
    }
  }

  // 6b. Vertical Figure-8 (16 starting phase angles x 2 directions forward/reverse)
  for (let start = 0; start < 16; start++) {
    const phase = (start / 16) * Math.PI * 2
    for (const dir of [1, -1]) {
      const pts: Point[] = []
      for (let i = 0; i <= 32; i++) {
        const t = phase + dir * (i / 32) * Math.PI * 2
        pts.push({
          x: 60 + 35 * Math.sin(t) * Math.cos(t),
          y: 60 + 50 * Math.sin(t),
        })
      }
      patronus.push({ spell: 'PATRONUS', template: normalizeGesture(pts), incantation: 'Expecto Patronum!', emoji: '🦌' })
    }
  }

  // 6c. Natural 2-circle loop (draw one circle, cross over, draw other circle)
  for (const dir of [1, -1]) {
    const pts: Point[] = []
    for (let a = 0; a <= Math.PI * 2; a += 0.2) {
      pts.push({ x: 40 + 25 * Math.cos(a), y: 60 + dir * 25 * Math.sin(a) })
    }
    for (let a = Math.PI; a <= Math.PI * 3; a += 0.2) {
      pts.push({ x: 80 + 25 * Math.cos(a), y: 60 - dir * 25 * Math.sin(a) })
    }
    patronus.push({ spell: 'PATRONUS', template: normalizeGesture(pts), incantation: 'Expecto Patronum!', emoji: '🦌' })
    patronus.push({ spell: 'PATRONUS', template: normalizeGesture(pts.slice().reverse()), incantation: 'Expecto Patronum!', emoji: '🦌' })
  }

  // 6d. Spiral / Vortex (Vòng xoắn ốc triệu hồi thần hộ mệnh)
  for (const dir of [1, -1]) {
    const ptsOut: Point[] = []
    for (let t = 0; t <= Math.PI * 3.5; t += 0.15) {
      const r = 8 + 12 * t
      ptsOut.push({ x: 60 + r * Math.cos(dir * t), y: 60 + r * Math.sin(dir * t) })
    }
    patronus.push({ spell: 'PATRONUS', template: normalizeGesture(ptsOut), incantation: 'Expecto Patronum!', emoji: '🦌' })
    patronus.push({ spell: 'PATRONUS', template: normalizeGesture(ptsOut.slice().reverse()), incantation: 'Expecto Patronum!', emoji: '🦌' })
  }

  return [
    ...circles,
    ...incendios,
    ...protegos,
    ...expelliarmus,
    { spell: 'WINGARDIUM', template: normalizeGesture(wave), incantation: 'Wingardium Leviosa!', emoji: '🪶' },
    ...patronus,
  ]
}

const TEMPLATES = buildTemplates()

export function recognizeSpell(rawPoints: Point[], minDistanceThreshold = 40): SpellResult {
  if (!rawPoints || rawPoints.length < 8) {
    return { spell: 'UNKNOWN', incantation: '', emoji: '', confidence: 0 }
  }

  // Check if stroke has enough physical length
  const totalLen = pathLength(rawPoints)
  if (totalLen < minDistanceThreshold) {
    return { spell: 'UNKNOWN', incantation: '', emoji: '', confidence: 0 }
  }

  const candidate = normalizeGesture(rawPoints)
  let bestDist = Infinity
  let bestMatch = TEMPLATES[0]

  for (const t of TEMPLATES) {
    const d = pathDistance(candidate, t.template)
    if (d < bestDist) {
      bestDist = d
      bestMatch = t
    }
  }

  // Calculate normalized confidence score (0 to 1)
  const maxPossibleDist = 0.5 * Math.sqrt(SQUARE_SIZE * SQUARE_SIZE + SQUARE_SIZE * SQUARE_SIZE)
  const confidence = Math.max(0, Math.min(1, 1 - bestDist / maxPossibleDist))

  // Threshold: at least 68% confidence for valid recognition
  if (confidence >= 0.68) {
    return {
      spell: bestMatch.spell,
      incantation: bestMatch.incantation,
      emoji: bestMatch.emoji,
      confidence,
    }
  }

  return { spell: 'UNKNOWN', incantation: '', emoji: '', confidence }
}
