import React, { useEffect, useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'

type GameId = 'seven-potters' | 'undercover-hogwarts'
type Invite = { gameId: GameId; roomCode: string; invitedBy: string; isHost: boolean; readyPlayers: string[]; readySessionIds: string[] } | null

const GAMES: { id: GameId; title: string; icon: string; description: string }[] = [
  {
    id: 'seven-potters',
    title: 'Bảy Potter',
    icon: '🧹',
    description: 'Phối hợp bay thoát khỏi cuộc truy đuổi trên không.',
  },
  {
    id: 'undercover-hogwarts',
    title: 'Undercover Hogwarts',
    icon: '🕵️',
    description: 'Đọc vị thân phận bí mật qua những gợi ý.',
  },
]

function getGameUrl(gameId: GameId, roomCode: string, playerName: string, house: string) {
  const configuredUrl = gameId === 'seven-potters'
    ? import.meta.env.VITE_SEVEN_POTTERS_URL
    : import.meta.env.VITE_UNDERCOVER_URL
  const fallbackUrl = gameId === 'seven-potters' ? 'http://127.0.0.1:3000' : 'http://127.0.0.1:5175'
  const url = new URL(configuredUrl || fallbackUrl)
  url.searchParams.set('skyofficePlayer', '1')
  url.searchParams.set('skyofficeName', playerName.slice(0, 32))
  if (house) url.searchParams.set('skyofficeHouse', house)
  else url.searchParams.delete('skyofficeHouse')
  if (roomCode) url.searchParams.set('room', roomCode.toUpperCase())
  else url.searchParams.delete('room')
  return url.toString()
}

export default function MiniGamesDialog({
  invite,
  playerName,
  house,
  onClose,
  onInvite,
  onSetReady,
  onStart,
  onCancel,
  sessionId,
}: {
  invite: Invite
  playerName: string
  house: string
  onClose: () => void
  onInvite: (gameId: GameId, roomCode: string) => void
  onSetReady: (ready: boolean) => void
  onStart: () => void
  onCancel: () => void
  sessionId: string
}) {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(invite?.gameId || 'seven-potters')
  const [roomCode, setRoomCode] = useState(invite?.roomCode || '')
  const [launched, setLaunched] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!invite) return
    setSelectedGame(invite.gameId)
    setRoomCode(invite.roomCode)
    setLaunched(false)
    setNotice(`${invite.invitedBy} mời bạn chơi ${GAMES.find((game) => game.id === invite.gameId)?.title || 'mini game'}.`)
  }, [invite?.gameId, invite?.roomCode, invite?.invitedBy])

  useEffect(() => {
    const handleStart = (event: Event) => {
      const state = (event as CustomEvent<{ gameId: GameId; roomCode: string }>).detail
      if (!state || state.gameId !== selectedGame) return
      setRoomCode(state.roomCode || '')
      setLaunched(true)
      setNotice('Game đã mở cho nhóm. Mọi người cần dùng cùng mã phòng để vào chung một ván.')
    }
    window.addEventListener('skyoffice:minigame-start', handleStart)
    return () => window.removeEventListener('skyoffice:minigame-start', handleStart)
  }, [selectedGame])

  const launchUrl = useMemo(() => selectedGame
    ? getGameUrl(selectedGame, roomCode.trim(), playerName || 'Phù thủy SkyOffice', house)
    : '', [selectedGame, roomCode, playerName, house])

  const handleInvite = () => {
    if (!selectedGame) return
    const cleanCode = roomCode.trim().toUpperCase()
    const validCode = selectedGame === 'undercover-hogwarts' ? /^[A-Z0-9]{4}$/.test(cleanCode) : /^[A-Z0-9]{3,8}$/.test(cleanCode)
    if (cleanCode && !validCode) {
      setNotice(selectedGame === 'undercover-hogwarts' ? 'Mã Undercover cần đúng 4 chữ cái hoặc chữ số.' : 'Mã Bảy Potter cần gồm 3–8 chữ cái hoặc chữ số.')
      return
    }
    onInvite(selectedGame, cleanCode)
    setNotice('Đã gửi lời mời tới mọi người trong phòng. Họ có thể tự vào game khi sẵn sàng.')
  }

  const handleLaunch = () => {
    const cleanCode = roomCode.trim().toUpperCase()
    const validCode = selectedGame === 'undercover-hogwarts' ? /^[A-Z0-9]{4}$/.test(cleanCode) : /^[A-Z0-9]{3,8}$/.test(cleanCode)
    if (cleanCode && !validCode) {
      setNotice(selectedGame === 'undercover-hogwarts' ? 'Mã Undercover cần đúng 4 chữ cái hoặc chữ số.' : 'Mã Bảy Potter cần gồm 3–8 chữ cái hoặc chữ số.')
      return
    }
    setRoomCode(cleanCode)
    setLaunched(true)
    setNotice('Game đang mở trong cổng. Đóng cổng này để quay lại đại sảnh.')
  }

  return (
    <div role="presentation" onClick={onClose} style={overlayStyle}>
      <section role="dialog" aria-modal="true" aria-labelledby="minigame-title" onClick={(event) => event.stopPropagation()} style={dialogStyle}>
        <header style={headerStyle}>
          <div>
            <div id="minigame-title" style={{ color: '#fcd777', fontSize: 21, fontWeight: 800 }}>🪄 Cổng trò chơi đại sảnh</div>
            <div style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>Chọn game và mở đúng phòng chơi cho cả nhóm.</div>
          </div>
          <button type="button" aria-label="Quay lại đại sảnh" onClick={onClose} style={closeButtonStyle}><CloseIcon /></button>
        </header>

        {launched && selectedGame ? (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 16px', color: '#e2e8f0', fontSize: 13 }}>
              <span>{GAMES.find((game) => game.id === selectedGame)?.title}{roomCode ? ` · Phòng ${roomCode}` : ''}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={launchUrl} target="_blank" rel="noreferrer" style={smallButtonStyle}>Mở tab riêng ↗</a>
                <button type="button" onClick={() => setLaunched(false)} style={smallButtonStyle}>Quay lại chọn game</button>
              </div>
            </div>
            <iframe title={GAMES.find((game) => game.id === selectedGame)?.title} src={launchUrl} style={{ border: 0, width: '100%', flex: 1, minHeight: 'min(460px, 60vh)', background: '#100e18' }} allow="fullscreen; autoplay; clipboard-read; clipboard-write" />
          </div>
        ) : (
          <div style={{ padding: 18, overflowY: 'auto' }}>
            {notice && <div role="status" style={noticeStyle}>{notice}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {GAMES.map((game) => {
                const selected = selectedGame === game.id
                return (
                  <button key={game.id} type="button" disabled={Boolean(invite)} onClick={() => setSelectedGame(game.id)} style={{ ...gameCardStyle, borderColor: selected ? '#e8c365' : 'rgba(255,255,255,.15)', background: selected ? 'rgba(157,105,25,.22)' : '#202333', opacity: invite ? .7 : 1 }}>
                    <span style={{ fontSize: 30 }}>{game.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>{game.title}</span>
                    <span style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.45 }}>{game.description}</span>
                  </button>
                )
              })}
            </div>

            <label style={{ display: 'grid', gap: 6, color: '#e2e8f0', fontSize: 13, marginTop: 16 }}>
              Mã phòng trong game
              <input aria-label="Mã phòng trong game" value={roomCode} maxLength={8} disabled={Boolean(invite)} onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder={selectedGame === 'undercover-hogwarts' ? 'Nhập mã 4 ký tự' : 'Nhập mã phòng'} style={inputStyle} />
            </label>
            <p style={{ color: '#aeb6ca', fontSize: 12, lineHeight: 1.5, margin: '10px 0 14px' }}>
              Để chơi cùng một ván, chủ nhóm tạo phòng trong game trước rồi nhập mã ở đây. Sau đó mời cả phòng, chờ mọi người sẵn sàng và mở game cho nhóm. Để trống mã thì mỗi người sẽ cần tự vào cùng một phòng trong game. Tên và Nhà được chuyển sang game.
            </p>
            {invite && (
              <div style={{ ...noticeStyle, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <strong>{invite.readySessionIds.length} người sẵn sàng:</strong> {invite.readyPlayers.join(', ')}
                  {!invite.readySessionIds.includes(sessionId) && <div style={{ marginTop: 4 }}>{invite.invitedBy} đang chờ nhóm.</div>}
                </div>
                {invite.isHost ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" disabled={invite.readySessionIds.length < 2} onClick={onStart} style={{ ...actionButtonStyle, background: invite.readySessionIds.length < 2 ? '#4b4f5c' : '#287451', opacity: invite.readySessionIds.length < 2 ? .7 : 1 }}>Mở game cho nhóm</button>
                    <button type="button" onClick={onCancel} style={{ ...actionButtonStyle, background: '#5b3138' }}>Hủy lời mời</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => onSetReady(!invite.readySessionIds.includes(sessionId))} style={{ ...actionButtonStyle, background: invite.readySessionIds.includes(sessionId) ? '#355b4c' : '#483274' }}>{invite.readySessionIds.includes(sessionId) ? 'Đã sẵn sàng ✓' : 'Tôi sẵn sàng'}</button>
                )}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {!invite && <button type="button" disabled={!selectedGame} onClick={handleInvite} style={{ ...actionButtonStyle, background: '#483274' }}>Mời cả phòng SkyOffice</button>}
              {!invite && <button type="button" disabled={!selectedGame} onClick={handleLaunch} style={{ ...actionButtonStyle, background: '#986b1c' }}>Vào game một mình</button>}
              {selectedGame && <a href={launchUrl} target="_blank" rel="noreferrer" style={{ ...actionButtonStyle, background: '#34394b', textDecoration: 'none' }}>Mở tab riêng ↗</a>}
            </div>
            <p style={{ color: '#7f879a', fontSize: 11, margin: '12px 0 0' }}>Game chưa khởi chạy? Kiểm tra địa chỉ local hoặc cấu hình URL game khi triển khai.</p>
          </div>
        )}
      </section>
    </div>
  )
}

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 4000, display: 'grid', placeItems: 'center', background: 'rgba(4,6,13,.84)', padding: 12 }
const dialogStyle: React.CSSProperties = { width: 'min(1100px, 100%)', height: 'min(820px, 94vh)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#171a27', border: '1px solid rgba(232,195,101,.55)', borderRadius: 18, color: '#f8fafc', boxShadow: '0 24px 90px rgba(0,0,0,.65)' }
const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.12)' }
const closeButtonStyle: React.CSSProperties = { display: 'grid', placeItems: 'center', width: 38, height: 38, border: 0, borderRadius: 10, color: '#fff', background: '#303448', cursor: 'pointer' }
const gameCardStyle: React.CSSProperties = { display: 'grid', gap: 8, justifyItems: 'start', textAlign: 'left', padding: 16, border: '1px solid', borderRadius: 13, color: '#f8fafc', cursor: 'pointer' }
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', borderRadius: 9, border: '1px solid rgba(255,255,255,.2)', background: '#10131d', color: '#fff', padding: '10px 12px', font: 'inherit' }
const noticeStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 9, marginBottom: 12, background: 'rgba(45,35,70,.65)', color: '#e9dcff', fontSize: 13 }
const actionButtonStyle: React.CSSProperties = { border: 0, borderRadius: 9, padding: '10px 14px', color: '#fff', font: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }
const smallButtonStyle: React.CSSProperties = { border: '1px solid rgba(255,255,255,.2)', borderRadius: 7, padding: '7px 9px', color: '#e2e8f0', background: '#292e40', font: 'inherit', fontSize: 11, textDecoration: 'none', cursor: 'pointer' }
