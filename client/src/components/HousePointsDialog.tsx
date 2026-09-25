import React, { useCallback, useEffect, useMemo, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { getFlooFirebase } from '../services/flooFirebase'
import { useAppSelector } from '../hooks'

const HOUSE_OPTIONS = [
  { id: 'GRYFFINDOR', label: 'Gryffindor', badge: '🦁', color: '#a31d27' },
  { id: 'SLYTHERIN', label: 'Slytherin', badge: '🐍', color: '#24734a' },
  { id: 'RAVENCLAW', label: 'Ravenclaw', badge: '🦅', color: '#2563a8' },
  { id: 'HUFFLEPUFF', label: 'Hufflepuff', badge: '🦡', color: '#b88416' },
] as const

type HouseId = (typeof HOUSE_OPTIONS)[number]['id']
type HouseTotal = { house: HouseId; points: number }
type PointsSummary = {
  weekKey: string
  houses: HouseTotal[]
  canGrant: boolean
  remainingManualPoints: number
  maxPointsPerGrant: number
  galleonBalance: number
}

function getApiBaseUrl() {
  const configured = import.meta.env.VITE_SERVER_URL as string | undefined
  if (configured) {
    const httpUrl = configured.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:')
    return new URL(httpUrl).origin
  }
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
  return `${protocol}//${window.location.hostname}:2567`
}

export default function HousePointsDialog({ onClose }: { onClose: () => void }) {
  const assignedHouse = useAppSelector((state) => state.user.assignedHouse)
  const profileHouse = useAppSelector((state) => state.user.hpvnProfile?.house || '')
  const initialHouse = useMemo(() => {
    const value = (assignedHouse || profileHouse).toUpperCase()
    return HOUSE_OPTIONS.find((house) => house.id === value)?.id || 'GRYFFINDOR'
  }, [assignedHouse, profileHouse])

  const [summary, setSummary] = useState<PointsSummary | null>(null)
  const [house, setHouse] = useState<HouseId>(initialHouse)
  const [points, setPoints] = useState(5)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const { auth } = getFlooFirebase()
    const user = auth.currentUser
    if (!user) throw new Error('Hãy đăng nhập tài khoản HPVN để xem hoặc cấp điểm.')
    const token = await user.getIdToken()
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Không thể kết nối dịch vụ điểm Nhà.')
    return payload
  }, [])

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSummary(await request('/api/house-points'))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải bảng điểm Nhà.')
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  const handleGrant = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      await request('/api/house-points/manual', {
        method: 'POST',
        body: JSON.stringify({
          house,
          points,
          reason,
          requestId: crypto.randomUUID(),
        }),
      })
      setReason('')
      setNotice(`Đã cộng ${points} điểm cho Nhà ${HOUSE_OPTIONS.find((item) => item.id === house)?.label}.`)
      await loadSummary()
    } catch (grantError) {
      setError(grantError instanceof Error ? grantError.message : 'Không thể cấp điểm.')
    } finally {
      setSubmitting(false)
    }
  }

  const totals = new Map((summary?.houses || []).map((item) => [item.house, item.points]))
  const highest = Math.max(0, ...Array.from(totals.values()))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'grid', placeItems: 'center', background: 'rgba(5,8,15,.78)', padding: 16 }}>
      <section role="dialog" aria-modal="true" aria-labelledby="house-points-title" style={{ width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#171b29', border: '1px solid rgba(255,215,0,.45)', borderRadius: 18, color: '#f8fafc', boxShadow: '0 20px 70px rgba(0,0,0,.55)' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
          <div>
          <div id="house-points-title" style={{ color: '#fbbf24', fontSize: 20, fontWeight: 800 }}>🏆 Điểm thi đua các Nhà</div>
            <div style={{ color: '#aab2c5', fontSize: 13, marginTop: 4 }}>Tuần bắt đầu {summary?.weekKey || '—'} · Đổi mới vào 00:00 thứ Hai (giờ Việt Nam)</div>
            <div style={{ color: '#fcd34d', fontSize: 13, fontWeight: 700, marginTop: 4 }}>🪙 Số dư: {(summary?.galleonBalance || 0).toLocaleString()} Galleon</div>
          </div>
          <IconButton aria-label="Đóng bảng điểm Nhà" onClick={onClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </header>

        <div style={{ padding: 20 }}>
          {loading && <div role="status" style={{ color: '#cbd5e1', marginBottom: 14 }}>Đang tải bảng điểm…</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 10 }}>
            {HOUSE_OPTIONS.map((item) => {
              const total = totals.get(item.id) || 0
              const leading = total > 0 && total === highest
              return (
                <div key={item.id} style={{ border: `1px solid ${leading ? item.color : 'rgba(255,255,255,.13)'}`, background: leading ? `${item.color}30` : '#202536', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 14, color: '#cbd5e1' }}>{item.badge} {item.label}{leading ? ' · Dẫn đầu' : ''}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{total.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500, color: '#aab2c5' }}>điểm</span></div>
                </div>
              )
            })}
          </div>

          {summary?.canGrant && (
            <form onSubmit={handleGrant} style={{ marginTop: 22, padding: 16, borderRadius: 12, border: '1px solid rgba(251,191,36,.35)', background: '#201f25' }}>
              <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: 6 }}>Cấp điểm Nhà bằng tay</div>
              <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 12 }}>Bạn còn {summary.remainingManualPoints} điểm cấp trong tuần; tối đa {summary.maxPointsPerGrant} điểm mỗi lần.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(110px, 130px)', gap: 10 }}>
                <label style={{ display: 'grid', gap: 5, fontSize: 13 }}>Nhà nhận điểm
                  <select value={house} onChange={(event) => setHouse(event.target.value as HouseId)} style={inputStyle}>
                    {HOUSE_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.badge} {item.label}</option>)}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 5, fontSize: 13 }}>Số điểm
                  <input type="number" min={1} max={summary.maxPointsPerGrant} value={points} onChange={(event) => setPoints(Number(event.target.value))} style={inputStyle} />
                </label>
              </div>
              <label style={{ display: 'grid', gap: 5, fontSize: 13, marginTop: 10 }}>Lý do (10–240 ký tự)
                <textarea required minLength={10} maxLength={240} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ví dụ: hỗ trợ thành viên mới hoàn thành nhiệm vụ…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </label>
              <button type="submit" disabled={submitting || !reason.trim() || points < 1 || points > summary.maxPointsPerGrant || summary.remainingManualPoints < points} style={{ marginTop: 12, border: 0, borderRadius: 9, padding: '10px 16px', background: '#b7791f', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: submitting ? .65 : 1 }}>
                {submitting ? 'Đang lưu…' : 'Cộng điểm và ghi lịch sử'}
              </button>
            </form>
          )}
          {!loading && summary && !summary.canGrant && <p style={{ marginTop: 18, color: '#aab2c5', fontSize: 13 }}>Bảng điểm được cập nhật từ backend. Chỉ tài khoản được quản trị viên chỉ định mới có quyền cấp điểm.</p>}
          {notice && <p role="status" style={{ color: '#86efac', marginBottom: 0 }}>{notice}</p>}
          {error && <p role="alert" style={{ color: '#fca5a5', marginBottom: 0 }}>{error}</p>}
        </div>
      </section>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,.2)',
  background: '#111522',
  color: '#f8fafc',
  padding: '9px 10px',
  font: 'inherit',
}
