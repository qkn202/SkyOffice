import React, { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import phaserGame from '../PhaserGame'
import type Bootstrap from '../scenes/Bootstrap'
import type Game from '../scenes/Game'
import { useAppSelector } from '../hooks'

interface WishLanternModalProps {
  onClose: () => void
}

type LanternColor = 'gold' | 'red' | 'green' | 'blue' | 'star'
type VisibilityMode = 'public' | 'private' | 'direct'

const LANTERN_OPTIONS: { id: LanternColor; name: string; desc: string; icon: string; border: string; glow: string }[] = [
  {
    id: 'gold',
    name: 'Vàng Thịnh Vượng',
    desc: 'May mắn, tài lộc & phú quý',
    icon: '🟡',
    border: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.4)',
  },
  {
    id: 'red',
    name: 'Đỏ Cát Tường',
    desc: 'Hỷ khí, rực rỡ & bình an',
    icon: '🔴',
    border: '#ff4757',
    glow: 'rgba(255, 71, 87, 0.4)',
  },
  {
    id: 'green',
    name: 'Lục Bình An',
    desc: 'Sức khỏe, an lành & tươi mới',
    icon: '🟢',
    border: '#2ed573',
    glow: 'rgba(46, 213, 115, 0.4)',
  },
  {
    id: 'blue',
    name: 'Lam Thông Tuệ',
    desc: 'Trí tuệ, tĩnh lặng & uyên bác',
    icon: '🔵',
    border: '#3867d6',
    glow: 'rgba(56, 103, 214, 0.4)',
  },
  {
    id: 'star',
    name: 'Sao Nguyện Ước',
    desc: 'Ước mơ tỏa sáng giữa trời đêm',
    icon: '⭐',
    border: '#fffa65',
    glow: 'rgba(255, 250, 101, 0.45)',
  },
]

const QUICK_WISHES = [
  '🌕 Chúc mọi người Trung Thu ấm áp, đoàn viên và ngập tràn niềm vui!',
  '🧙‍♂️ Ước nguyện năm nay đạt điểm Xuất Sắc tất cả các môn ở Hogwarts!',
  '💖 Cầu mong gia đình và bạn bè luôn dồi dào sức khỏe, hạnh phúc!',
  '✨ Chúc SkyOffice luôn là nơi gắn kết những điều kỳ diệu và bình an!',
]

export default function WishLanternModal({ onClose }: WishLanternModalProps) {
  const [selectedColor, setSelectedColor] = useState<LanternColor>('gold')
  const [wishText, setWishText] = useState('')
  const [visibility, setVisibility] = useState<VisibilityMode>('public')
  const [selectedRecipientId, setSelectedRecipientId] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedNotice, setSubmittedNotice] = useState('')

  const onlineProfiles = useAppSelector((state) => state.social?.onlineProfiles || [])
  const mySessionId = useAppSelector((state) => state.user?.sessionId || '')

  // Filter out self for friend recipient selection
  const otherPlayers = (onlineProfiles || []).filter((p) => p && p.sessionId !== mySessionId)

  const handleRelease = () => {
    const trimmedText = wishText.trim()
    if (!trimmedText) return

    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap | undefined
    const game = phaserGame.scene.keys.game as Game | undefined

    if (!bootstrap?.network) return

    setIsSubmitting(true)

    // Find player position
    const posX = game?.myPlayer?.x ?? 1800
    const posY = game?.myPlayer?.y ?? 1450

    // Selected recipient
    const recipient = otherPlayers.find((p) => p.sessionId === selectedRecipientId)

    bootstrap.network.releaseLantern({
      text: trimmedText,
      color: selectedColor,
      visibility,
      recipientSessionId: visibility === 'direct' ? selectedRecipientId : undefined,
      recipientName: visibility === 'direct' ? recipient?.name : undefined,
      isAnonymous,
      x: posX,
      y: posY,
    })

    setSubmittedNotice('🏮 Thiên đăng của bạn đã được thắp sáng và bay vào trời đêm Hogwarts!')

    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 6000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(7, 5, 12, 0.78)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        id="wish-lantern-modal"
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '92vh',
          background: 'linear-gradient(170deg, #1b130e 0%, #261a12 50%, #150f0b 100%)',
          border: '2px solid #d4af37',
          borderRadius: 16,
          boxShadow: '0 0 35px rgba(212, 175, 55, 0.35), 0 20px 40px rgba(0, 0, 0, 0.8)',
          color: '#f5ede0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          animation: 'fadeInScale 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(212, 175, 55, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🏮</span>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#ffd700',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Thả Thiên Đăng Ước Nguyện Trung Thu 🌕
              </div>
              <div style={{ fontSize: 12, color: '#c8b89e', marginTop: 2 }}>
                Gửi gắm tâm nguyện bay cao cùng vầng trăng rằm Hogwarts
              </div>
            </div>
          </div>
          <IconButton aria-label="Đóng" onClick={onClose} sx={{ color: '#d4af37' }}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* Step 1: Chọn màu đèn lồng */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#d4af37',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}
            >
              1. Chọn Thiên Đăng Của Bạn:
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: 8,
              }}
            >
              {LANTERN_OPTIONS.map((opt) => {
                const isSelected = selectedColor === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedColor(opt.id)}
                    style={{
                      background: isSelected
                        ? 'rgba(212, 175, 55, 0.22)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${isSelected ? opt.border : 'rgba(212, 175, 55, 0.2)'}`,
                      borderRadius: 10,
                      padding: '10px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 14px ${opt.glow}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{opt.icon}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isSelected ? opt.border : '#e2d4c0',
                        textAlign: 'center',
                      }}
                    >
                      {opt.name}
                    </span>
                    <span style={{ fontSize: 9.5, color: '#9e8f7a', textAlign: 'center' }}>
                      {opt.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Viết lời chúc */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#d4af37',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                2. Lời Chúc / Điều Ước:
              </label>
              <span
                style={{
                  fontSize: 11,
                  color: wishText.length >= 140 ? '#ff4757' : '#9e8f7a',
                }}
              >
                {wishText.length}/150 ký tự
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={150}
              placeholder="Nhập điều ước đêm trăng rằm hoặc lời chúc đến bạn bè..."
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(10, 8, 14, 0.65)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: 8,
                padding: '10px 12px',
                color: '#fff9ea',
                fontSize: 13.5,
                lineHeight: 1.5,
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#ffd700')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(212, 175, 55, 0.4)')}
            />

            {/* Quick Suggestions */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: '#bfa15f', marginBottom: 5 }}>
                💡 Gợi ý lời chúc nhanh (bấm để chọn):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_WISHES.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWishText(w)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: 14,
                      padding: '4px 10px',
                      color: '#dcd2bf',
                      fontSize: 11,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'rgba(212, 175, 55, 0.15)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.04)')
                    }
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Chế độ hiển thị (CÁCH 3) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#d4af37',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}
            >
              3. Chế Độ Hiển Thị Lời Chúc:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {/* Public */}
              <div
                onClick={() => setVisibility('public')}
                style={{
                  background:
                    visibility === 'public'
                      ? 'rgba(255, 215, 0, 0.18)'
                      : 'rgba(255, 255, 255, 0.03)',
                  border: `1.5px solid ${
                    visibility === 'public' ? '#ffd700' : 'rgba(212, 175, 55, 0.25)'
                  }`,
                  borderRadius: 10,
                  padding: '12px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>🌐</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ffd700' }}>
                    Công Khai
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: '#c5b69f', lineHeight: 1.35 }}>
                  Mọi người trong phòng khi bấm vào đèn đều đọc được.
                </div>
              </div>

              {/* Private */}
              <div
                onClick={() => setVisibility('private')}
                style={{
                  background:
                    visibility === 'private'
                      ? 'rgba(225, 177, 44, 0.18)'
                      : 'rgba(255, 255, 255, 0.03)',
                  border: `1.5px solid ${
                    visibility === 'private' ? '#e1b12c' : 'rgba(212, 175, 55, 0.25)'
                  }`,
                  borderRadius: 10,
                  padding: '12px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#e1b12c' }}>
                    Điều Ước Bí Mật
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: '#c5b69f', lineHeight: 1.35 }}>
                  Chỉ riêng bạn đọc được. Người khác chỉ thấy đèn bay & ổ khóa.
                </div>
              </div>

              {/* Direct */}
              <div
                onClick={() => setVisibility('direct')}
                style={{
                  background:
                    visibility === 'direct'
                      ? 'rgba(255, 107, 129, 0.18)'
                      : 'rgba(255, 255, 255, 0.03)',
                  border: `1.5px solid ${
                    visibility === 'direct' ? '#ff6b81' : 'rgba(212, 175, 55, 0.25)'
                  }`,
                  borderRadius: 10,
                  padding: '12px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>💌</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ff6b81' }}>
                    Gửi Riêng
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: '#c5b69f', lineHeight: 1.35 }}>
                  Chỉ bạn và người bạn chọn đọc được thư.
                </div>
              </div>
            </div>

            {/* Recipient dropdown if 'direct' */}
            {visibility === 'direct' && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 14px',
                  background: 'rgba(255, 107, 129, 0.08)',
                  border: '1px dashed #ff6b81',
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#ff6b81',
                    marginBottom: 6,
                  }}
                >
                  Chọn người bạn muốn gửi thiên đăng:
                </div>
                {otherPlayers.length > 0 ? (
                  <select
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#16110d',
                      border: '1px solid #ff6b81',
                      borderRadius: 6,
                      padding: '8px 10px',
                      color: '#ffffff',
                      fontSize: 12.5,
                      outline: 'none',
                    }}
                  >
                    <option value="">-- Chọn một người chơi trong phòng --</option>
                    {otherPlayers.map((p) => (
                      <option key={p.sessionId} value={p.sessionId}>
                        {p.name || 'Phù thủy'} {p.house ? `(${p.house})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ fontSize: 11, color: '#e8bbbb' }}>
                    ⚠️ Hiện chưa có người chơi khác trong phòng. Bạn có thể chọn chế độ <b>Công Khai</b> hoặc <b>Điều Ước Bí Mật</b> nhé!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Anonymous toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="anonymous-check"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#d4af37' }}
            />
            <label
              htmlFor="anonymous-check"
              style={{ fontSize: 12.5, color: '#c8b89e', cursor: 'pointer' }}
            >
              Thả ẩn danh (Hiển thị người gửi là <i>'Ẩn danh'</i>)
            </label>
          </div>

          {/* Notice Feedback */}
          {submittedNotice && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(46, 213, 115, 0.2)',
                border: '1px solid #2ed573',
                borderRadius: 8,
                color: '#2ed573',
                fontSize: 13,
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {submittedNotice}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            background: 'rgba(20, 14, 10, 0.6)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: '1px solid rgba(212, 175, 55, 0.3)',
              background: 'transparent',
              color: '#c2b39f',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            disabled={!wishText.trim() || isSubmitting || (visibility === 'direct' && !selectedRecipientId && otherPlayers.length > 0)}
            onClick={handleRelease}
            style={{
              padding: '9px 24px',
              borderRadius: 8,
              border: 'none',
              background:
                !wishText.trim() || isSubmitting || (visibility === 'direct' && !selectedRecipientId && otherPlayers.length > 0)
                  ? 'rgba(100, 80, 50, 0.3)'
                  : 'linear-gradient(135deg, #d4af37 0%, #f39c12 100%)',
              color:
                !wishText.trim() || isSubmitting || (visibility === 'direct' && !selectedRecipientId && otherPlayers.length > 0)
                  ? '#7a6a55'
                  : '#1a1005',
              fontSize: 13.5,
              fontWeight: 700,
              cursor:
                !wishText.trim() || isSubmitting || (visibility === 'direct' && !selectedRecipientId && otherPlayers.length > 0)
                  ? 'not-allowed'
                  : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow:
                !wishText.trim() || isSubmitting
                  ? 'none'
                  : '0 0 16px rgba(243, 156, 18, 0.45)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🏮</span>
            <span>{isSubmitting ? 'Đang Thả Đèn…' : 'Thắp Lửa & Thả Đèn'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
