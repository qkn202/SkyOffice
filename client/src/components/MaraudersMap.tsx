import React, { useEffect, useState, useRef } from 'react'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import phaserGame from '../PhaserGame'
import store from '../stores'
import { HogwartsRoomId } from '../scenes/HogwartsRoomManager'

interface MaraudersMapProps {
  onClose: () => void
}

interface EntityPos {
  id: string
  name: string
  role?: string
  x: number
  y: number
  dir?: string
  isMe?: boolean
  house?: string
  color: string
  room?: HogwartsRoomId
}

const NPC_LIST: EntityPos[] = [
  {
    id: 'dumbledore',
    name: 'Albus Dumbledore',
    role: 'Hiệu trưởng',
    x: 830,
    y: 395,
    color: '#9353d3',
    room: 'great_hall',
  },
  {
    id: 'mcgonagall',
    name: 'Minerva McGonagall',
    role: 'Phó Hiệu trưởng',
    x: 775,
    y: 370,
    color: '#a31d27',
    room: 'great_hall',
  },
  {
    id: 'snape',
    name: 'Severus Snape',
    role: 'Chủ nhiệm Slytherin',
    x: 905,
    y: 430,
    color: '#24734a',
    room: 'great_hall',
  },
  {
    id: 'sorting_hat',
    name: 'Chiếc Nón Phân Loại',
    role: 'Bảo vật Hogwarts',
    x: 800,
    y: 455,
    color: '#b8860b',
    room: 'great_hall',
  },
]

const ROOM_TABS: { id: HogwartsRoomId; label: string; badge: string; color: string }[] = [
  { id: 'great_hall', label: 'Đại Sảnh Đường', badge: '🏰', color: '#b8860b' },
  { id: 'gryffindor', label: 'Tháp Gryffindor', badge: '🦁', color: '#a31d27' },
  { id: 'slytherin', label: 'Hầm Slytherin', badge: '🐍', color: '#24734a' },
  { id: 'ravenclaw', label: 'Tháp Ravenclaw', badge: '🦅', color: '#2563a8' },
  { id: 'hufflepuff', label: 'Tầng Hầm Hufflepuff', badge: '🦡', color: '#b88416' },
]

export default function MaraudersMap({ onClose }: MaraudersMapProps) {
  const [entities, setEntities] = useState<EntityPos[]>([])
  const [mischiefManaged, setMischiefManaged] = useState(false)
  const [activeRoomTab, setActiveRoomTab] = useState<HogwartsRoomId>('great_hall')
  const [playerCurrentRoom, setPlayerCurrentRoom] = useState<HogwartsRoomId>('great_hall')
  const animFrameRef = useRef<number>()

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseWithAnimation()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Poll live positions from Phaser Game scene
  useEffect(() => {
    const getPlayerNameStr = (player: any, defaultVal: string): string => {
      try {
        if (!player) return defaultVal
        if (typeof player.displayName === 'string' && player.displayName) return player.displayName
        if (typeof player.playerName === 'string' && player.playerName) return player.playerName
        if (typeof player.playerName?.text === 'string' && player.playerName.text) return player.playerName.text
        if (typeof player.name === 'string' && player.name) return player.name
        return defaultVal
      } catch {
        return defaultVal
      }
    }

    const pollPositions = () => {
      const scene = phaserGame.scene.keys.game as any
      if (scene) {
        const curRoom: HogwartsRoomId = scene.roomManager?.currentRoomId || 'great_hall'
        setPlayerCurrentRoom(curRoom)

        const currentEntities: EntityPos[] = [...NPC_LIST]

        // 1. My Player
        if (scene.myPlayer) {
          const house = typeof scene.myPlayer.house === 'string' && scene.myPlayer.house ? scene.myPlayer.house : 'GRYFFINDOR'
          const reduxName = store.getState().user.currentPlayerName || store.getState().user.hpvnProfile?.username
          const myName = reduxName || getPlayerNameStr(scene.myPlayer, 'Bạn (Pháp sư)')
          currentEntities.push({
            id: 'my-player',
            name: String(myName),
            role: 'Chủ nhân Bản đồ',
            x: Number(scene.myPlayer.x) || 600,
            y: Number(scene.myPlayer.y) || 580,
            dir: typeof scene.myPlayer.anims?.currentAnim?.key === 'string' ? scene.myPlayer.anims.currentAnim.key : undefined,
            isMe: true,
            house,
            color: '#b8860b',
            room: curRoom,
          })
        }

        // 2. Other Players
        if (scene.otherPlayerMap) {
          scene.otherPlayerMap.forEach((player: any, id: string) => {
            const house = player.house || ''
            const otherName = getPlayerNameStr(player, 'Phù thuỷ')
            const otherRoom: HogwartsRoomId = scene.roomManager?.playerRooms?.get(id) || 'great_hall'
            currentEntities.push({
              id,
              name: otherName,
              role: house ? `Nhà ${house}` : 'Học sinh',
              x: player.x,
              y: player.y,
              dir: player.anims?.currentAnim?.key,
              isMe: false,
              house,
              color:
                house === 'GRYFFINDOR'
                  ? '#a31d27'
                  : house === 'SLYTHERIN'
                  ? '#24734a'
                  : house === 'RAVENCLAW'
                  ? '#2563a8'
                  : house === 'HUFFLEPUFF'
                  ? '#b88416'
                  : '#4a3b32',
              room: otherRoom,
            })
          })
        }

        setEntities(currentEntities)
      }
      animFrameRef.current = requestAnimationFrame(pollPositions)
    }

    // Initialize active tab to current room
    const scene = phaserGame.scene.keys.game as any
    if (scene?.roomManager?.currentRoomId) {
      setActiveRoomTab(scene.roomManager.currentRoomId)
    }

    animFrameRef.current = requestAnimationFrame(pollPositions)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  const handleCloseWithAnimation = () => {
    setMischiefManaged(true)
    setTimeout(() => {
      onClose()
    }, 600)
  }

  const handleFlooTeleport = (roomId: HogwartsRoomId) => {
    const scene = phaserGame.scene.keys.game as any
    if (scene?.roomManager) {
      scene.roomManager.switchRoom(roomId, true)
    }
    handleCloseWithAnimation()
  }

  // Great Hall coordinate mapping: 1376 x 768 -> Map Canvas scale
  const mapWidth = 1376
  const mapHeight = 768

  const visibleEntities = entities.filter((ent) => (ent.room || 'great_hall') === activeRoomTab)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5100,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(10, 8, 6, 0.88)',
        backdropFilter: 'blur(8px)',
        padding: 16,
        opacity: mischiefManaged ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseWithAnimation()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="marauder-title"
        style={{
          position: 'relative',
          width: 'min(1100px, 98vw)',
          height: 'min(730px, 94vh)',
          background: 'linear-gradient(135deg, #dfd0b5 0%, #c9b48c 50%, #ba9f73 100%)',
          borderRadius: 8,
          border: '12px solid #5a3d28',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.95), inset 0 0 100px rgba(78, 48, 24, 0.45)',
          color: '#2a1a0c',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '"Hoefler Text", Georgia, "Times New Roman", serif',
        }}
      >
        {/* Parchment Texture Noise Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 50%, transparent 60%, rgba(60, 36, 16, 0.35) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Header Ribbon */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '12px 20px',
            borderBottom: '2px solid #6b4c30',
            background: 'rgba(235, 222, 196, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              id="marauder-title"
              style={{
                fontSize: 21,
                fontWeight: 'bold',
                letterSpacing: '0.08em',
                color: '#3a2010',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🐾</span> BẢN ĐỒ ĐẠO TẶC · THE MARAUDER'S MAP <span>🐾</span>
            </div>
            <div style={{ fontSize: 12.5, fontStyle: 'italic', color: '#6e4524', marginTop: 2 }}>
              "Messrs Moony, Wormtail, Padfoot, and Prongs are proud to present the live floor plan of Hogwarts"
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleCloseWithAnimation}
              style={{
                background: '#4a2c14',
                color: '#f4ebd8',
                border: '1px solid #7c532b',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 13,
                fontFamily: 'inherit',
                fontStyle: 'italic',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              }}
            >
              ✨ "Mischief Managed" (Phá đám xong)
            </button>
            <IconButton aria-label="Đóng bản đồ" onClick={handleCloseWithAnimation} sx={{ color: '#4a2c14' }}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        {/* 5 Hogwarts Room Selection Tabs */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            gap: 6,
            padding: '8px 16px',
            background: 'rgba(215, 198, 168, 0.85)',
            borderBottom: '1px solid #7c532b',
            overflowX: 'auto',
          }}
        >
          {ROOM_TABS.map((tab) => {
            const isTabActive = activeRoomTab === tab.id
            const isPlayerHere = playerCurrentRoom === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveRoomTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: isTabActive ? `2px solid ${tab.color}` : '1px solid rgba(120, 80, 40, 0.4)',
                  background: isTabActive ? 'rgba(74, 44, 20, 0.85)' : 'rgba(235, 222, 196, 0.65)',
                  color: isTabActive ? '#fff3d1' : '#4a2c14',
                  fontWeight: isTabActive ? 'bold' : 'normal',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.badge}</span>
                <span>{tab.label}</span>
                {isPlayerHere && (
                  <span
                    style={{
                      background: '#2ed573',
                      color: '#08120e',
                      borderRadius: 10,
                      padding: '1px 6px',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  >
                    Bạn ở đây
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Map Canvas Floor Plan Area */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            zIndex: 2,
            overflow: 'hidden',
            margin: '8px 16px',
            border: '2px dashed #735034',
            borderRadius: 6,
            background: 'rgba(224, 210, 183, 0.7)',
            boxShadow: 'inset 0 0 40px rgba(92, 59, 30, 0.25)',
          }}
        >
          {/* Architectural Blueprint Vector Lines based on active tab */}
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* Outer Chamber Walls */}
            <rect x="50" y="120" width="1276" height="620" fill="none" stroke="#593b22" strokeWidth="4" strokeDasharray="8 4" />

            {activeRoomTab === 'great_hall' && (
              <>
                {/* High Table Dais (Bục Ban Giám Hiệu) */}
                <path d="M 640 330 L 1000 510 L 980 540 L 620 360 Z" fill="rgba(100, 60, 25, 0.12)" stroke="#6b4626" strokeWidth="3" />
                <text x="810" y="440" fill="#6b4626" fontSize="18" fontStyle="italic" fontWeight="bold">
                  Bục Ban Giám Hiệu (High Table)
                </text>
                {/* 4 Dãy Bàn Ăn */}
                <rect x="330" y="380" width="230" height="90" fill="rgba(184, 132, 22, 0.15)" stroke="#7a5518" strokeWidth="2" rx="6" />
                <text x="445" y="432" fill="#5c3f10" fontSize="16" fontWeight="bold" textAnchor="middle">🦡 Dãy Bàn Hufflepuff</text>
                <rect x="460" y="450" width="230" height="90" fill="rgba(37, 99, 168, 0.15)" stroke="#2b4c73" strokeWidth="2" rx="6" />
                <text x="575" y="502" fill="#1b395e" fontSize="16" fontWeight="bold" textAnchor="middle">🦅 Dãy Bàn Ravenclaw</text>
                <rect x="590" y="515" width="230" height="90" fill="rgba(163, 29, 39, 0.15)" stroke="#6e1e24" strokeWidth="2" rx="6" />
                <text x="705" y="567" fill="#54171b" fontSize="16" fontWeight="bold" textAnchor="middle">🦁 Dãy Bàn Gryffindor</text>
                <rect x="720" y="580" width="230" height="90" fill="rgba(36, 115, 74, 0.15)" stroke="#1d5437" strokeWidth="2" rx="6" />
                <text x="835" y="632" fill="#143b27" fontSize="16" fontWeight="bold" textAnchor="middle">🐍 Dãy Bàn Slytherin</text>
                <rect x="760" y="430" width="80" height="50" fill="rgba(46, 213, 115, 0.18)" stroke="#1a5336" strokeWidth="2" rx="4" />
                <text x="800" y="460" fill="#144d2d" fontSize="12" fontWeight="bold" textAnchor="middle">🔥 Lò Sưởi Floo</text>
                <circle cx="800" cy="455" r="16" fill="rgba(184, 134, 11, 0.3)" stroke="#7a5518" strokeWidth="2" />
                <text x="800" y="483" fill="#5c3f10" fontSize="12" fontWeight="bold" textAnchor="middle">🎩 Nón Phân Loại</text>
                <text x="688" y="725" fill="#5a3d28" fontSize="15" fontStyle="italic" fontWeight="bold" textAnchor="middle">🚪 Lối Vào Đại Sảnh Đường</text>
              </>
            )}

            {activeRoomTab === 'gryffindor' && (
              <>
                {/* Gryffindor Tower Blueprint */}
                <circle cx="688" cy="500" r="300" fill="none" stroke="#7a1c22" strokeWidth="2" strokeDasharray="6 4" />
                <rect x="120" y="420" width="180" height="240" fill="rgba(163, 29, 39, 0.15)" stroke="#7a1c22" strokeWidth="3" rx="8" />
                <text x="210" y="540" fill="#7a1c22" fontSize="16" fontWeight="bold" textAnchor="middle">🔥 Lò Sưởi Đá Lớn</text>
                <circle cx="900" cy="400" r="45" fill="rgba(212, 175, 55, 0.2)" stroke="#9c7a28" strokeWidth="3" />
                <text x="900" y="405" fill="#5c4412" fontSize="13" fontWeight="bold" textAnchor="middle">🖼️ Cửa Bà Béo</text>
                <rect x="420" y="640" width="160" height="70" fill="rgba(163, 29, 39, 0.2)" stroke="#7a1c22" strokeWidth="2" rx="6" />
                <text x="500" y="680" fill="#7a1c22" fontSize="14" fontWeight="bold" textAnchor="middle">Sofa Nhung Đỏ</text>
                <rect x="1100" y="460" width="180" height="260" fill="rgba(80, 50, 20, 0.15)" stroke="#5c3d18" strokeWidth="2" rx="4" />
                <text x="1190" y="590" fill="#5c3d18" fontSize="14" fontWeight="bold" textAnchor="middle">📚 Tủ Sách Ma Thuật</text>
                <text x="688" y="240" fill="#7a1c22" fontSize="18" fontStyle="italic" fontWeight="bold" textAnchor="middle">🦁 Tháp Sinh Hoạt Chung Gryffindor</text>
              </>
            )}

            {activeRoomTab === 'slytherin' && (
              <>
                {/* Slytherin Dungeon Blueprint */}
                <path d="M 450 420 Q 690 340 930 420 L 930 460 Q 690 380 450 460 Z" fill="rgba(36, 115, 74, 0.25)" stroke="#1d5c3b" strokeWidth="3" />
                <text x="690" y="410" fill="#14422a" fontSize="16" fontWeight="bold" textAnchor="middle">🌊 Cửa Sổ Vòm Nhìn Đáy Hồ Đen (Black Lake)</text>
                <rect x="1080" y="460" width="200" height="200" fill="rgba(36, 115, 74, 0.2)" stroke="#1d5c3b" strokeWidth="3" rx="8" />
                <text x="1180" y="565" fill="#14422a" fontSize="16" fontWeight="bold" textAnchor="middle">🐍 Lò Sưởi Rắn Lục</text>
                <rect x="780" y="580" width="180" height="80" fill="rgba(36, 115, 74, 0.2)" stroke="#1d5c3b" strokeWidth="2" rx="6" />
                <text x="870" y="625" fill="#14422a" fontSize="14" fontWeight="bold" textAnchor="middle">Sofa Da Chesterfield</text>
                <path d="M 120 720 L 260 580 L 300 620 L 160 760 Z" fill="rgba(60, 60, 60, 0.2)" stroke="#3a3a3a" strokeWidth="2" />
                <text x="210" y="670" fill="#333333" fontSize="13" fontWeight="bold" textAnchor="middle">Cầu Thang Hầm Đá</text>
                <text x="690" y="240" fill="#1d5c3b" fontSize="18" fontStyle="italic" fontWeight="bold" textAnchor="middle">🐍 Hầm Ngục Sinh Hoạt Chung Slytherin</text>
              </>
            )}

            {activeRoomTab === 'ravenclaw' && (
              <>
                {/* Ravenclaw Tower Blueprint */}
                <circle cx="688" cy="460" r="280" fill="none" stroke="#2563a8" strokeWidth="2" strokeDasharray="6 4" />
                <circle cx="688" cy="460" r="140" fill="rgba(37, 99, 168, 0.12)" stroke="#2563a8" strokeWidth="2" />
                <text x="688" y="465" fill="#1a477b" fontSize="15" fontWeight="bold" textAnchor="middle">⭐ Thảm Bản Đồ Sao Vàng</text>
                <circle cx="1220" cy="500" r="40" fill="rgba(180, 200, 230, 0.3)" stroke="#2563a8" strokeWidth="2" />
                <text x="1220" y="505" fill="#1a477b" fontSize="12" fontWeight="bold" textAnchor="middle">🗽 Rowena</text>
                <rect x="70" y="640" width="120" height="140" fill="rgba(148, 107, 45, 0.2)" stroke="#7a5518" strokeWidth="2" rx="6" />
                <text x="130" y="715" fill="#5c3f10" fontSize="13" fontWeight="bold" textAnchor="middle">🔥 Lò Sưởi Đồng</text>
                <text x="688" y="220" fill="#1a477b" fontSize="18" fontStyle="italic" fontWeight="bold" textAnchor="middle">🦅 Tháp Sinh Hoạt Chung Ravenclaw</text>
              </>
            )}

            {activeRoomTab === 'hufflepuff' && (
              <>
                {/* Hufflepuff Basement Blueprint */}
                <path d="M 200 480 Q 688 280 1176 480 L 1176 720 Q 688 780 200 720 Z" fill="rgba(184, 132, 22, 0.08)" stroke="#8c6514" strokeWidth="2" />
                <rect x="180" y="500" width="160" height="180" fill="rgba(184, 132, 22, 0.2)" stroke="#8c6514" strokeWidth="3" rx="8" />
                <text x="260" y="595" fill="#6e4f0f" fontSize="14" fontWeight="bold" textAnchor="middle">🔥 Lò Sưởi Tổ Lửng</text>
                <circle cx="980" cy="560" r="45" fill="rgba(120, 80, 30, 0.25)" stroke="#6b4626" strokeWidth="3" />
                <text x="980" y="565" fill="#54361e" fontSize="13" fontWeight="bold" textAnchor="middle">🚪 Cửa Thùng Gỗ</text>
                <circle cx="500" cy="620" r="28" fill="rgba(184, 132, 22, 0.3)" stroke="#8c6514" strokeWidth="2" />
                <text x="500" y="625" fill="#6e4f0f" fontSize="11" fontWeight="bold" textAnchor="middle">Ghế Vàng</text>
                <circle cx="410" cy="740" r="32" fill="rgba(180, 110, 50, 0.25)" stroke="#8c5020" strokeWidth="2" />
                <text x="410" y="745" fill="#6e380f" fontSize="11" fontWeight="bold" textAnchor="middle">Bàn Đồng</text>
                <text x="688" y="240" fill="#6e4f0f" fontSize="18" fontStyle="italic" fontWeight="bold" textAnchor="middle">🦡 Tầng Hầm Sinh Hoạt Chung Hufflepuff</text>
              </>
            )}
          </svg>

          {/* Live Footprints and Name Banners for Entities in this room */}
          {visibleEntities.map((ent) => {
            const leftPct = (ent.x / mapWidth) * 100
            const topPct = (ent.y / mapHeight) * 100

            return (
              <div
                key={ent.id}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  transition: 'left 0.2s linear, top 0.2s linear',
                }}
              >
                {/* Vintage Footprints Icon with pulsation */}
                <div
                  style={{
                    fontSize: ent.isMe ? 22 : 18,
                    filter: ent.isMe ? 'drop-shadow(0 0 6px #d4af37)' : 'drop-shadow(0 0 3px rgba(60, 36, 16, 0.6))',
                    animation: 'walk-pulse 1.2s infinite alternate',
                  }}
                >
                  👣
                </div>

                {/* Marauder's Parchment Name Tag */}
                <div
                  style={{
                    marginTop: 2,
                    background: ent.isMe ? 'rgba(60, 38, 18, 0.95)' : 'rgba(240, 230, 210, 0.92)',
                    color: ent.isMe ? '#fffa65' : '#2b1b0e',
                    border: `1.5px solid ${ent.color}`,
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {String(ent.name || 'Pháp sư')}
                  {ent.role && (
                    <span style={{ marginLeft: 4, opacity: 0.75, fontSize: 9.5, fontStyle: 'italic' }}>
                      ({String(ent.role)})
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Ribbon with Floo Teleport Option */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '8px 20px',
            borderTop: '1px solid #735034',
            background: 'rgba(235, 222, 196, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            color: '#4e3018',
            fontStyle: 'italic',
          }}
        >
          <div>
            ✨ <em>"I solemnly swear that I am up to no good"</em> (Tôi trang trọng thề tôi là kẻ làm trò mờ ám)
          </div>

          {activeRoomTab !== playerCurrentRoom ? (
            <button
              onClick={() => handleFlooTeleport(activeRoomTab)}
              style={{
                background: '#1b4d36',
                color: '#2ed573',
                border: '1px solid #2ed573',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12.5,
                fontWeight: 'bold',
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🔥 Đi tới phòng này (Dùng Bột Floo)
            </button>
          ) : (
            <div>Nhấn <strong>[ESC]</strong> để gập bản đồ</div>
          )}
        </div>
      </div>
    </div>
  )
}
