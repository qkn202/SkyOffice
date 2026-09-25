import React, { useEffect } from 'react'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import phaserGame from '../PhaserGame'
import { HogwartsRoomId } from '../scenes/HogwartsRoomManager'

interface FlooNetworkModalProps {
  onClose: () => void
  currentRoom: HogwartsRoomId
}

interface Destination {
  id: HogwartsRoomId
  name: string
  subtitle: string
  badge: string
  bannerColor: string
  glowColor: string
  description: string
  location: string
}

const DESTINATIONS: Destination[] = [
  {
    id: 'great_hall',
    name: 'Đại Sảnh Đường Hogwarts',
    subtitle: 'The Great Hall',
    badge: '🏰',
    bannerColor: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.45)',
    description: 'Trái tim của lâu đài Hogwarts với 4 dãy bàn tiệc của 4 Nhà, Bục Ban Giám Hiệu và Chiếc Nón Phân Loại.',
    location: 'Tầng trệt · Khu Trung Tâm Lâu Đài',
  },
  {
    id: 'gryffindor',
    name: 'Phòng Sinh Hoạt Chung Gryffindor',
    subtitle: 'Gryffindor Tower',
    badge: '🦁',
    bannerColor: '#a31d27',
    glowColor: 'rgba(163, 29, 39, 0.5)',
    description: 'Tháp cao ấm áp ẩn sau bức tranh Bà Béo, rực rỡ sắc đỏ và vàng kim với lò sưởi đá bập bùng và ghế bành nhung.',
    location: 'Tầng 7 · Tháp Gryffindor',
  },
  {
    id: 'slytherin',
    name: 'Phòng Sinh Hoạt Chung Slytherin',
    subtitle: 'Slytherin Dungeon',
    badge: '🐍',
    bannerColor: '#24734a',
    glowColor: 'rgba(36, 115, 74, 0.5)',
    description: 'Hầm đá cổ kính nằm sâu dưới đáy Hồ Đen, đón ánh sáng lục bảo huyền ảo từ làn nước cùng ghế bọc da Chesterfield sang trọng.',
    location: 'Hầm Ngục Lâu Đài · Dưới Lòng Hồ Đen',
  },
  {
    id: 'ravenclaw',
    name: 'Phòng Sinh Hoạt Chung Ravenclaw',
    subtitle: 'Ravenclaw Tower',
    badge: '🦅',
    bannerColor: '#2563a8',
    glowColor: 'rgba(37, 99, 168, 0.5)',
    description: 'Căn phòng tháp hình tròn thoáng đãng với trần vòm vẽ bản đồ sao, tượng cẩm thạch Rowena Ravenclaw và kho sách ma thuật đồ sộ.',
    location: 'Cánh Tây Lâu Đài · Đỉnh Tháp Ravenclaw',
  },
  {
    id: 'hufflepuff',
    name: 'Phòng Sinh Hoạt Chung Hufflepuff',
    subtitle: 'Hufflepuff Basement',
    badge: '🦡',
    bannerColor: '#b88416',
    glowColor: 'rgba(184, 132, 22, 0.5)',
    description: 'Căn phòng tổ lửng ấm cúng cạnh Bếp ăn, trần vòm gỗ sồi mật ong, ngập tràn hoa lá thảo dược treo trong chậu đồng và ghế bành êm ái.',
    location: 'Tầng Hầm Lâu Đài · Cạnh Bếp Ăn Gia Tinh',
  },
]

export default function FlooNetworkModal({ onClose, currentRoom }: FlooNetworkModalProps) {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleTravel = (targetId: HogwartsRoomId) => {
    const scene = phaserGame.scene.keys.game as any
    if (scene && scene.roomManager) {
      scene.roomManager.switchRoom(targetId, true)
    }
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5200,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(6, 12, 10, 0.86)',
        backdropFilter: 'blur(8px)',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="floo-modal-title"
        style={{
          width: 'min(880px, 96vw)',
          maxHeight: '92vh',
          background: 'linear-gradient(135deg, #0e1e17 0%, #08120e 100%)',
          border: '2px solid #2ed573',
          borderRadius: 16,
          boxShadow: '0 25px 90px rgba(0, 0, 0, 0.9), inset 0 0 60px rgba(46, 213, 115, 0.15)',
          color: '#e4f9ee',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(46, 213, 115, 0.3)',
            background: 'rgba(14, 30, 23, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26, filter: 'drop-shadow(0 0 8px #2ed573)' }}>🔥</span>
            <div>
              <div
                id="floo-modal-title"
                style={{
                  color: '#2ed573',
                  fontSize: 20,
                  fontWeight: 'bold',
                  letterSpacing: '0.04em',
                  textShadow: '0 0 10px rgba(46, 213, 115, 0.4)',
                }}
              >
                Mạng Lưới Lò Sưởi Floo (Floo Network)
              </div>
              <div style={{ color: '#88e7b1', fontSize: 13, marginTop: 2, fontStyle: 'italic' }}>
                Bộ Pháp Thuật · Cục Điều Phối Mạng Lưới Floo Hogwarts
              </div>
            </div>
          </div>
          <IconButton aria-label="Đóng bảng Floo" onClick={onClose} sx={{ color: '#2ed573' }}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Instructions banner */}
        <div
          style={{
            padding: '10px 24px',
            background: 'rgba(20, 48, 36, 0.45)',
            borderBottom: '1px solid rgba(46, 213, 115, 0.2)',
            fontSize: 13,
            color: '#b0f2ce',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <LocalFireDepartmentIcon fontSize="small" sx={{ color: '#2ed573' }} />
          <span>
            Ném một nhúm <strong>Bột Floo</strong> vào ngọn lửa lục bảo và chọn điểm đến để dịch chuyển tức thời!
          </span>
        </div>

        {/* Destination List */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {DESTINATIONS.map((dest) => {
            const isCurrent = currentRoom === dest.id
            return (
              <div
                key={dest.id}
                onClick={() => !isCurrent && handleTravel(dest.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr auto',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: isCurrent ? 'rgba(46, 213, 115, 0.16)' : 'rgba(16, 34, 26, 0.65)',
                  border: isCurrent
                    ? '2px solid #2ed573'
                    : `1px solid ${dest.bannerColor}55`,
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isCurrent ? `0 0 20px ${dest.glowColor}` : 'none',
                }}
              >
                {/* Badge Icon */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: `${dest.bannerColor}25`,
                    border: `2px solid ${dest.bannerColor}`,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 24,
                  }}
                >
                  {dest.badge}
                </div>

                {/* Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span
                      style={{
                        color: isCurrent ? '#2ed573' : '#ffffff',
                        fontSize: 17,
                        fontWeight: 'bold',
                      }}
                    >
                      {dest.name}
                    </span>
                    <span style={{ color: '#88e7b1', fontSize: 13, fontStyle: 'italic' }}>
                      ({dest.subtitle})
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          background: '#2ed573',
                          color: '#08120e',
                          borderRadius: 4,
                          padding: '1px 6px',
                          fontSize: 10,
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        Đang ở đây
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#9bd9ba', fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>
                    {dest.description}
                  </div>
                  <div style={{ color: '#5eb388', fontSize: 11.5, marginTop: 4 }}>
                    📍 {dest.location}
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  {isCurrent ? (
                    <span style={{ color: '#2ed573', fontSize: 13, fontWeight: 'bold' }}>
                      ✓ Vị trí hiện tại
                    </span>
                  ) : (
                    <button
                      style={{
                        background: '#1b4d36',
                        color: '#2ed573',
                        border: '1px solid #2ed573',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      🔥 Dịch chuyển
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
