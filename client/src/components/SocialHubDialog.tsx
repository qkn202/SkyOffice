import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import phaserGame from '../PhaserGame'
import type Game from '../scenes/Game'
import type Bootstrap from '../scenes/Bootstrap'
import { useAppSelector } from '../hooks'

const HOUSE_STYLE: Record<string, { title: string; emoji: string; color: string }> = {
  GRYFFINDOR: { title: 'Gryffindor', emoji: '🦁', color: '#a83232' },
  SLYTHERIN: { title: 'Slytherin', emoji: '🐍', color: '#2d8156' },
  RAVENCLAW: { title: 'Ravenclaw', emoji: '🦅', color: '#326eaf' },
  HUFFLEPUFF: { title: 'Hufflepuff', emoji: '🦡', color: '#ad801e' },
}

const EMOTES = [
  { id: 'wave', emoji: '👋', label: 'Vẫy tay' },
  { id: 'clap', emoji: '👏', label: 'Vỗ tay' },
  { id: 'heart', emoji: '❤️', label: 'Thả tim' },
  { id: 'laugh', emoji: '😂', label: 'Cười' },
  { id: 'magic', emoji: '✨', label: 'Phép thuật' },
]

function defaultEventTime() {
  const date = new Date()
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

export default function SocialHubDialog({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'people' | 'events'>('people')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState(defaultEventTime)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [pendingEvent, setPendingEvent] = useState(false)
  const onlineProfiles = useAppSelector((state) => state.social.onlineProfiles)
  const events = useAppSelector((state) => state.social.events)
  const sessionId = useAppSelector((state) => state.user.sessionId)
  const ownProfile = useAppSelector((state) => state.user.hpvnProfile)
  const assignedHouse = useAppSelector((state) => state.user.assignedHouse)
  const currentPlayer = onlineProfiles.find((profile) => profile.sessionId === sessionId)
  const resolvedHouse = (currentPlayer?.house || ownProfile?.house || assignedHouse || '').toUpperCase()
  const houseStyle = HOUSE_STYLE[resolvedHouse]
  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.startsAt - b.startsAt), [events])

  useEffect(() => {
    const handleResult = (event: Event) => {
      const result = (event as CustomEvent<{ ok: boolean; message: string }>).detail
      setPendingEvent(false)
      if (result?.ok) {
        setNotice(result.message)
        setError('')
        setTitle('')
        setDescription('')
        setStartsAt(defaultEventTime())
      } else {
        setError(result?.message || 'Không thể đăng sự kiện trong phòng này.')
        setNotice('')
      }
    }
    window.addEventListener('skyoffice:community-event-result', handleResult)
    return () => window.removeEventListener('skyoffice:community-event-result', handleResult)
  }, [])

  const sendEmote = (emote: string) => {
    const game = phaserGame.scene.keys.game as Game | undefined
    game?.sendSocialEmote(emote)
  }

  const createEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    setError('')
    const timestamp = new Date(startsAt).getTime()
    if (!Number.isFinite(timestamp) || timestamp < Date.now() + 60_000) {
      setError('Chọn thời gian bắt đầu cách hiện tại ít nhất một phút.')
      return
    }
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap | undefined
    bootstrap?.network?.createCommunityEvent(title, description, timestamp)
    setPendingEvent(true)
    setNotice('Đang gửi sự kiện lên bảng…')
  }

  const toggleAttendance = (eventId: string) => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap | undefined
    bootstrap?.network?.toggleCommunityEventAttendance(eventId)
  }

  return (
    <div role="presentation" onClick={onClose} style={overlayStyle}>
      <section role="dialog" aria-modal="true" aria-labelledby="social-hub-title" onClick={(event) => event.stopPropagation()} style={dialogStyle}>
        <header style={headerStyle}>
          <div>
            <div id="social-hub-title" style={{ color: '#fcd777', fontSize: 21, fontWeight: 800 }}>🪄 Kết nối đại sảnh</div>
            <div style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>Gặp gỡ, biểu cảm và hẹn hoạt động trong phòng.</div>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} style={closeStyle}><CloseIcon /></button>
        </header>

        <nav style={tabStyle}>
          <button type="button" onClick={() => setTab('people')} style={tabButtonStyle(tab === 'people')}>Phù thủy trong phòng ({onlineProfiles.length})</button>
          <button type="button" onClick={() => setTab('events')} style={tabButtonStyle(tab === 'events')}>Sự kiện ({events.length})</button>
        </nav>

        {tab === 'people' ? (
          <div style={contentStyle}>
            <article style={{ ...profileCardStyle, borderColor: houseStyle?.color || 'rgba(255,255,255,.14)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ ...avatarStyle, background: houseStyle?.color || '#495064' }}>{houseStyle?.emoji || '🧙'}</div>
              <div>
                <div style={{ fontWeight: 800 }}>{ownProfile?.username || currentPlayer?.name || 'Phù thủy SkyOffice'}</div>
                <div style={{ color: '#c5cad8', fontSize: 12, marginTop: 3 }}>{houseStyle?.title || 'Chưa phân Nhà'} · Hồ sơ của bạn</div>
              </div>
            </article>
            <h3 style={sectionTitleStyle}>Gửi biểu cảm cho người ở gần</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {EMOTES.map((emote) => <button key={emote.id} type="button" title={emote.label} aria-label={emote.label} onClick={() => sendEmote(emote.id)} style={emoteStyle}>{emote.emoji}</button>)}
            </div>
            <h3 style={sectionTitleStyle}>Hồ sơ người chơi</h3>
            {onlineProfiles.length === 0 && <p style={mutedStyle}>Đang tải danh sách người trong phòng…</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
              {onlineProfiles.map((profile) => {
                const style = HOUSE_STYLE[profile.house.toUpperCase()]
                const near = currentPlayer && profile.sessionId !== sessionId && Math.hypot(profile.x - currentPlayer.x, profile.y - currentPlayer.y) <= 320
                return (
                  <article key={profile.sessionId} style={{ ...profileCardStyle, borderColor: style?.color || 'rgba(255,255,255,.14)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ ...avatarStyle, background: style?.color || '#495064' }}>{style?.emoji || '🧙'}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name || 'Phù thủy mới'}{profile.sessionId === sessionId ? ' · Bạn' : ''}</div>
                        <div style={{ color: '#c5cad8', fontSize: 12, marginTop: 3 }}>{style?.title || 'Chưa phân Nhà'}</div>
                      </div>
                    </div>
                    <div style={{ color: near ? '#86efac' : '#aeb6ca', fontSize: 11, marginTop: 10 }}>{profile.sessionId === sessionId ? 'Đang ở Đại Sảnh' : near ? 'Ở gần bạn' : 'Đang ở Đại Sảnh'}</div>
                  </article>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={contentStyle}>
            <form onSubmit={createEvent} style={eventFormStyle}>
              <h3 style={{ ...sectionTitleStyle, marginTop: 0 }}>Tạo hoạt động cho phòng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 9 }}>
                <label htmlFor="community-event-title" style={fieldLabelStyle}>
                  Tên hoạt động
                  <input id="community-event-title" required minLength={4} maxLength={60} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Đêm đố vui ở Đại Sảnh" style={inputStyle} />
                </label>
                <label htmlFor="community-event-starts-at" style={fieldLabelStyle}>
                  Bắt đầu lúc
                  <input id="community-event-starts-at" required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} style={inputStyle} />
                </label>
              </div>
              <label htmlFor="community-event-description" style={{ ...fieldLabelStyle, marginTop: 9 }}>
                Mô tả hoạt động
                <textarea id="community-event-description" required minLength={8} maxLength={180} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Gặp nhau ở đâu, chuẩn bị gì…" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </label>
              <button type="submit" disabled={pendingEvent} style={{ ...primaryButtonStyle, marginTop: 9, opacity: pendingEvent ? .65 : 1 }}>{pendingEvent ? 'Đang gửi…' : 'Đăng sự kiện'}</button>
              {notice && <div role="status" style={{ color: '#86efac', fontSize: 12, marginTop: 8 }}>{notice}</div>}
              {error && <div role="alert" style={{ color: '#fca5a5', fontSize: 12, marginTop: 8 }}>{error}</div>}
            </form>

            <h3 style={sectionTitleStyle}>Sắp diễn ra</h3>
            {sortedEvents.length === 0 && <p style={mutedStyle}>Chưa có sự kiện nào trong phòng. Tạo buổi gặp hoặc chơi game đầu tiên.</p>}
            <div style={{ display: 'grid', gap: 10 }}>
              {sortedEvents.map((event) => (
                <article key={event.id} style={eventCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div style={{ color: '#ffe29a', fontWeight: 800, fontSize: 16 }}>{event.title}</div>
                      <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 5 }}>{new Date(event.startsAt).toLocaleString('vi-VN')} · Tạo bởi {event.createdBy}</div>
                    </div>
                    <button type="button" onClick={() => toggleAttendance(event.id)} style={{ ...primaryButtonStyle, background: event.isAttending ? '#355b4c' : '#493675' }}>{event.isAttending ? 'Đã tham gia' : 'Tham gia'}</button>
                  </div>
                  <p style={{ color: '#d4d8e2', fontSize: 13, lineHeight: 1.45, margin: '10px 0 6px' }}>{event.description}</p>
                  <div style={{ color: '#aeb6ca', fontSize: 11 }}>{event.attendeeCount} người tham gia{event.attendeeNames.length ? `: ${event.attendeeNames.join(', ')}` : ''}</div>
                </article>
              ))}
            </div>
            <p style={{ ...mutedStyle, marginTop: 12 }}>Sự kiện đang được đồng bộ trong phòng và tạm thời chỉ tồn tại khi server còn giữ phòng hoạt động.</p>
          </div>
        )}
      </section>
    </div>
  )
}

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 4100, display: 'grid', placeItems: 'center', padding: 12, background: 'rgba(4,6,13,.84)' }
const dialogStyle: React.CSSProperties = { width: 'min(900px, 100%)', height: 'min(760px, 94vh)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(232,195,101,.55)', borderRadius: 18, background: '#171a27', color: '#f8fafc', boxShadow: '0 24px 90px rgba(0,0,0,.65)' }
const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.12)' }
const closeStyle: React.CSSProperties = { width: 38, height: 38, display: 'grid', placeItems: 'center', border: 0, borderRadius: 10, color: '#fff', background: '#303448', cursor: 'pointer' }
const tabStyle: React.CSSProperties = { display: 'flex', gap: 7, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.1)' }
const tabButtonStyle = (active: boolean): React.CSSProperties => ({ border: `1px solid ${active ? '#d3a94f' : 'rgba(255,255,255,.12)'}`, borderRadius: 9, padding: '8px 11px', color: active ? '#ffe29a' : '#cbd5e1', background: active ? '#30273a' : '#202333', font: 'inherit', fontSize: 12, cursor: 'pointer' })
const contentStyle: React.CSSProperties = { padding: 16, overflowY: 'auto', flex: 1 }
const sectionTitleStyle: React.CSSProperties = { color: '#e8d4a0', fontSize: 14, margin: '0 0 10px' }
const mutedStyle: React.CSSProperties = { color: '#aeb6ca', fontSize: 12, lineHeight: 1.5 }
const emoteStyle: React.CSSProperties = { width: 46, height: 42, borderRadius: 10, border: '1px solid rgba(255,255,255,.16)', background: '#292e40', fontSize: 22, cursor: 'pointer' }
const profileCardStyle: React.CSSProperties = { border: '1px solid', borderRadius: 12, padding: 13, background: '#202333' }
const avatarStyle: React.CSSProperties = { width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 12, fontSize: 23, flexShrink: 0 }
const eventFormStyle: React.CSSProperties = { padding: 13, marginBottom: 16, border: '1px solid rgba(232,195,101,.3)', borderRadius: 12, background: '#202333' }
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid rgba(255,255,255,.16)', background: '#10131d', color: '#fff', padding: '9px 10px', font: 'inherit', fontSize: 13 }
const fieldLabelStyle: React.CSSProperties = { display: 'grid', gap: 6, color: '#e2d4ad', fontSize: 12, fontWeight: 700 }
const eventCardStyle: React.CSSProperties = { padding: 13, borderRadius: 12, border: '1px solid rgba(255,255,255,.13)', background: '#202333' }
const primaryButtonStyle: React.CSSProperties = { border: 0, borderRadius: 8, padding: '9px 12px', color: '#fff', background: '#986b1c', font: 'inherit', fontSize: 12, fontWeight: 800, cursor: 'pointer' }
