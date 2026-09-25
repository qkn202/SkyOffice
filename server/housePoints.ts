import { createHash } from 'crypto'
import type { Express, Request, Response } from 'express'
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const HOUSES = ['GRYFFINDOR', 'SLYTHERIN', 'RAVENCLAW', 'HUFFLEPUFF'] as const
const MAX_POINTS_PER_GRANT = 10
const DEFAULT_WEEKLY_GRANTOR_CAP = 100
const DEFAULT_WEEKLY_GALLEON_REWARD = 100
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'hpvnn-archive'

type House = (typeof HOUSES)[number]

function housePointsConfigured() {
  return process.env.HOUSE_POINTS_ENABLED === 'true' && Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_USE_APPLICATION_DEFAULT === 'true' ||
    process.env.K_SERVICE ||
    process.env.GAE_APPLICATION
  )
}

function getWeekKey(now = new Date()): string {
  // Competition weeks roll over at Monday 00:00 in Vietnam (UTC+7).
  const local = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const day = local.getUTCDay() || 7
  local.setUTCDate(local.getUTCDate() - day + 1)
  return [local.getUTCFullYear(), String(local.getUTCMonth() + 1).padStart(2, '0'), String(local.getUTCDate()).padStart(2, '0')].join('-')
}

function getPreviousWeekKey(weekKey: string): string {
  const monday = new Date(`${weekKey}T00:00:00.000Z`)
  monday.setUTCDate(monday.getUTCDate() - 7)
  return [monday.getUTCFullYear(), String(monday.getUTCMonth() + 1).padStart(2, '0'), String(monday.getUTCDate()).padStart(2, '0')].join('-')
}

function getFirebaseApp() {
  if (!housePointsConfigured()) throw new Error('House points are disabled or unconfigured.')
  const existing = getApps().find((app) => app.name === 'skyoffice-house-points')
  if (existing) return existing
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  const credential = serviceAccountJson
    ? cert(JSON.parse(serviceAccountJson))
    : applicationDefault()
  return initializeApp({ credential, projectId: PROJECT_ID }, 'skyoffice-house-points')
}

async function getReadyFirebaseApp() {
  const app = getFirebaseApp()
  // Reject missing/invalid credentials before Firestore starts its background transport.
  await app.options.credential!.getAccessToken()
  return app
}

function getGrantorUids(): Set<string> {
  return new Set((process.env.HOUSE_POINT_GRANTOR_UIDS || '').split(',').map((uid) => uid.trim()).filter(Boolean))
}

function getWeeklyGrantorCap(): number {
  const configured = Number(process.env.HOUSE_POINT_WEEKLY_GRANTOR_CAP)
  return Number.isSafeInteger(configured) && configured > 0 ? configured : DEFAULT_WEEKLY_GRANTOR_CAP
}

function getWeeklyGalleonReward(): number {
  const configured = Number(process.env.WEEKLY_GALLEON_REWARD_PER_MEMBER)
  return Number.isSafeInteger(configured) && configured >= 0 ? configured : DEFAULT_WEEKLY_GALLEON_REWARD
}

function grantorCounterId(uid: string, weekKey: string): string {
  return createHash('sha256').update(`${weekKey}:${uid}`).digest('hex')
}

async function snapshotWeeklyMembers(weekKey: string) {
  const db = getFirestore(await getReadyFirebaseApp())
  const marker = db.collection('house_point_weekly_rosters').doc(weekKey)
  const markerSnapshot = await marker.get()
  if (markerSnapshot.get('status') === 'COMPLETE') return

  const users = await db.collection('shout_users').get()
  const members = users.docs.flatMap((user) => {
    const house = typeof user.get('house') === 'string' ? user.get('house').toUpperCase() : ''
    return HOUSES.includes(house as House) ? [{ uid: user.id, house: house as House }] : []
  })

  for (let start = 0; start < members.length; start += 450) {
    const batch = db.batch()
    for (const member of members.slice(start, start + 450)) {
      const id = createHash('sha256').update(`${weekKey}:${member.uid}`).digest('hex')
      batch.set(db.collection('house_point_weekly_members').doc(id), { ...member, weekKey })
    }
    await batch.commit()
  }

  await marker.set({ weekKey, status: 'COMPLETE', memberCount: members.length, capturedAt: FieldValue.serverTimestamp() })
}

async function settleWeeklyHouseReward(weekKey: string) {
  const db = getFirestore(await getReadyFirebaseApp())
  const settlements = db.collection('house_point_weekly_settlements')
  const settlementRef = settlements.doc(weekKey)
  const existing = await settlementRef.get()
  if (existing.get('status') === 'COMPLETE' || existing.get('status') === 'NO_WINNER') return

  const roster = await db.collection('house_point_weekly_rosters').doc(weekKey).get()
  if (roster.get('status') !== 'COMPLETE') return

  const houseTotals = await Promise.all(HOUSES.map(async (house) => {
    const total = await db.collection('house_point_weekly_totals').doc(`${weekKey}_${house}`).get()
    return { house, points: Number(total.get('points') || 0) }
  }))
  const highest = Math.max(0, ...houseTotals.map((item) => item.points))
  if (highest === 0) {
    await settlementRef.set({ weekKey, status: 'NO_WINNER', houses: [], points: 0, settledAt: FieldValue.serverTimestamp() })
    return
  }

  const winningHouses = houseTotals.filter((item) => item.points === highest).map((item) => item.house)
  await settlementRef.set({ weekKey, status: 'PAYING', houses: winningHouses, points: highest, rewardPerMember: getWeeklyGalleonReward(), startedAt: FieldValue.serverTimestamp() }, { merge: true })

  const memberDocs = await db.collection('house_point_weekly_members').where('weekKey', '==', weekKey).get()
  const winners = memberDocs.docs.filter((member) => winningHouses.includes(member.get('house')))
  const reward = getWeeklyGalleonReward()
  if (reward > 0) {
    for (const member of winners) {
      const uid = String(member.get('uid'))
      const house = member.get('house') as House
      const paymentId = createHash('sha256').update(`${weekKey}:${uid}`).digest('hex')
      const paymentRef = db.collection('galleon_ledger').doc(paymentId)
      const walletRef = db.collection('galleon_wallets').doc(uid)
      await db.runTransaction(async (transaction) => {
        const [payment, wallet] = await Promise.all([transaction.get(paymentRef), transaction.get(walletRef)])
        if (payment.exists) return
        transaction.create(paymentRef, {
          uid,
          house,
          amount: reward,
          source: 'WEEKLY_HOUSE_WIN',
          weekKey,
          createdAt: FieldValue.serverTimestamp(),
        })
        transaction.set(walletRef, {
          uid,
          balance: Number(wallet.get('balance') || 0) + reward,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true })
      })
    }
  }

  await settlementRef.set({ status: 'COMPLETE', houses: winningHouses, points: highest, rewardPerMember: reward, paidMemberCount: reward > 0 ? winners.length : 0, settledAt: FieldValue.serverTimestamp() }, { merge: true })
}

function startWeeklyHouseJobs() {
  let running = false
  const run = async () => {
    if (running) return
    running = true
    try {
      const currentWeek = getWeekKey()
      await snapshotWeeklyMembers(currentWeek)
      await settleWeeklyHouseReward(getPreviousWeekKey(currentWeek))
    } catch (error) {
      console.error('[HousePoints] Weekly roster/payout job failed:', error)
    } finally {
      running = false
    }
  }

  void run()
  setInterval(() => void run(), 60_000)
}

async function verifyUser(req: Request): Promise<string | null> {
  const authorization = req.header('authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  if (!match) return null
  const decoded = await getAuth(await getReadyFirebaseApp()).verifyIdToken(match[1])
  return decoded.uid
}

function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message })
}

export function registerHousePointRoutes(app: Express) {
  app.use('/api/house-points', (_req, res, next) => {
    if (!housePointsConfigured()) {
      return sendError(res, 503, 'Điểm Nhà đang tạm tắt hoặc chưa được cấu hình. Bạn vẫn có thể chơi và trò chuyện bình thường.')
    }
    next()
  })
  app.get('/api/house-points', async (req, res) => {
    try {
      const uid = await verifyUser(req)
      if (!uid) return sendError(res, 401, 'Hãy đăng nhập để xem điểm Nhà.')

      const db = getFirestore(getFirebaseApp())
      const weekKey = getWeekKey()
      const grantors = getGrantorUids()
      const cap = getWeeklyGrantorCap()
      const totals = await Promise.all(HOUSES.map(async (house) => {
        const snapshot = await db.collection('house_point_weekly_totals').doc(`${weekKey}_${house}`).get()
        return { house, points: Number(snapshot.get('points') || 0) }
      }))

      let remainingManualPoints = 0
      if (grantors.has(uid)) {
        const counter = await db.collection('house_point_grantor_caps').doc(grantorCounterId(uid, weekKey)).get()
        remainingManualPoints = Math.max(0, cap - Number(counter.get('points') || 0))
      }
      const wallet = await db.collection('galleon_wallets').doc(uid).get()

      return res.json({
        weekKey,
        houses: totals,
        canGrant: grantors.has(uid),
        remainingManualPoints,
        maxPointsPerGrant: MAX_POINTS_PER_GRANT,
        galleonBalance: Number(wallet.get('balance') || 0),
      })
    } catch (error) {
      console.error('[HousePoints] Could not load weekly points:', error)
      return sendError(res, 503, 'Dịch vụ điểm Nhà chưa được cấu hình đầy đủ.')
    }
  })

  app.post('/api/house-points/manual', async (req, res) => {
    try {
      const uid = await verifyUser(req)
      if (!uid) return sendError(res, 401, 'Hãy đăng nhập lại trước khi cấp điểm.')
      if (!getGrantorUids().has(uid)) return sendError(res, 403, 'Tài khoản này chưa được cấp quyền cho điểm.')

      const house = typeof req.body?.house === 'string' ? req.body.house.toUpperCase() : ''
      const points = Number(req.body?.points)
      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : ''
      const requestId = typeof req.body?.requestId === 'string' ? req.body.requestId : ''

      if (!HOUSES.includes(house as House)) return sendError(res, 400, 'Nhà không hợp lệ.')
      if (!Number.isSafeInteger(points) || points < 1 || points > MAX_POINTS_PER_GRANT) {
        return sendError(res, 400, `Mỗi lần chỉ được cấp từ 1 đến ${MAX_POINTS_PER_GRANT} điểm.`)
      }
      if (reason.length < 10 || reason.length > 240) {
        return sendError(res, 400, 'Lý do cần dài từ 10 đến 240 ký tự.')
      }
      if (!/^[0-9a-f-]{36}$/i.test(requestId)) return sendError(res, 400, 'Mã giao dịch không hợp lệ.')

      const db = getFirestore(getFirebaseApp())
      const weekKey = getWeekKey()
      const eventId = `${weekKey}_${requestId}`
      const events = db.collection('house_point_events')
      const eventRef = events.doc(eventId)
      const counterRef = db.collection('house_point_grantor_caps').doc(grantorCounterId(uid, weekKey))
      const totalRef = db.collection('house_point_weekly_totals').doc(`${weekKey}_${house}`)
      const weeklyCap = getWeeklyGrantorCap()

      const result = await db.runTransaction(async (transaction) => {
        const [event, counter, total] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(counterRef),
          transaction.get(totalRef),
        ])
        if (event.exists) return { duplicate: true }

        const usedByGrantor = Number(counter.get('points') || 0)
        if (usedByGrantor + points > weeklyCap) {
          throw new Error('WEEKLY_GRANT_LIMIT')
        }

        transaction.create(eventRef, {
          source: 'MANUAL',
          house,
          points,
          reason,
          actorUid: uid,
          weekKey,
          createdAt: FieldValue.serverTimestamp(),
        })
        transaction.set(counterRef, {
          uid,
          weekKey,
          points: usedByGrantor + points,
          updatedAt: FieldValue.serverTimestamp(),
        })
        transaction.set(totalRef, {
          house,
          weekKey,
          points: Number(total.get('points') || 0) + points,
          updatedAt: FieldValue.serverTimestamp(),
        })
        return { duplicate: false }
      })

      if (result.duplicate) return res.json({ ok: true, duplicate: true, weekKey })
      return res.status(201).json({ ok: true, duplicate: false, weekKey })
    } catch (error) {
      if (error instanceof Error && error.message === 'WEEKLY_GRANT_LIMIT') {
        return sendError(res, 409, 'Bạn đã dùng hết hạn mức cấp điểm trong tuần này.')
      }
      console.error('[HousePoints] Could not record manual award:', error)
      return sendError(res, 503, 'Không thể lưu điểm Nhà. Kiểm tra cấu hình backend rồi thử lại.')
    }
  })

  if (housePointsConfigured() && process.env.HOUSE_POINT_WEEKLY_JOBS_ENABLED === 'true') {
    startWeeklyHouseJobs()
  } else {
    console.log('[HousePoints] Weekly jobs disabled; gameplay is available without Firebase Admin.')
  }
}
