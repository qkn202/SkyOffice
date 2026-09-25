import React, { useRef, useState, useEffect } from 'react'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import RefreshIcon from '@mui/icons-material/Refresh'
import { recognizeSpell, Point } from '../utils/SpellGestureRecognizer'

interface SpellbookModalProps {
  onClose: () => void
}

interface SpellInfo {
  id: string
  name: string
  latin: string
  glyph: string
  strokeName: string
  strokeDesc: string
  svgPath: string
  color: string
  glowColor: string
  effect: string
}

const SPELLS: SpellInfo[] = [
  {
    id: 'LUMOS',
    name: 'Bùa Thắp Sáng / Dập Tắt',
    latin: 'Lumos / Nox',
    glyph: '○',
    strokeName: 'Vòng tròn khép kín',
    strokeDesc: 'Bắt đầu từ đỉnh, vẽ một vòng cung tròn khép kín theo chiều kim đồng hồ.',
    svgPath: 'M 50 18 A 32 32 0 1 1 49.9 18 Z',
    color: '#fffa65',
    glowColor: 'rgba(255, 250, 101, 0.45)',
    effect: 'Tỏa hào quang ấm áp xua tan bóng tối Đại Sảnh. Vẽ lại để hô "Nox" dập tắt.',
  },
  {
    id: 'INCENDIO',
    name: 'Bùa Phóng Lửa',
    latin: 'Incendio!',
    glyph: '△',
    strokeName: 'Tam giác rực lửa',
    strokeDesc: 'Bắt đầu từ góc đáy trái, vẽ lên đỉnh, xuống đáy phải, rồi nối ngang sang đáy trái.',
    svgPath: 'M 20 80 L 50 20 L 80 80 Z',
    color: '#ff4757',
    glowColor: 'rgba(255, 71, 87, 0.45)',
    effect: 'Phóng quả cầu lửa bay theo hướng nhìn của bạn và nổ tung thành luồng lửa ấm.',
  },
  {
    id: 'PROTEGO',
    name: 'Bùa Khiên Hộ Thân',
    latin: 'Protego!',
    glyph: '⌃',
    strokeName: 'Mái vòm bảo hộ',
    strokeDesc: 'Bắt đầu từ trái dưới, vuốt xiên lên đỉnh nhọn rồi vuốt xiên xuống bên phải (chữ V ngược).',
    svgPath: 'M 18 78 L 50 22 L 82 78',
    color: '#2ed573',
    glowColor: 'rgba(46, 213, 115, 0.45)',
    effect: 'Tạo vòng khiên lục bảo xoay tròn quanh cơ thể bảo vệ pháp sư trong 4.5 giây.',
  },
  {
    id: 'EXPELLIARMUS',
    name: 'Bùa Giải Giới',
    latin: 'Expelliarmus!',
    glyph: '⚡',
    strokeName: 'Tia sét Z',
    strokeDesc: 'Kéo ngang sang phải, chém chéo xuống góc trái dưới, rồi kéo ngang tiếp sang phải.',
    svgPath: 'M 22 25 L 78 25 L 22 75 L 78 75',
    color: '#ff3838',
    glowColor: 'rgba(255, 56, 56, 0.45)',
    effect: 'Bắn chùm tia sét đỏ Scarlet rực lửa xé toạc không gian về phía trước.',
  },
  {
    id: 'WINGARDIUM',
    name: 'Bùa Bay Lơ Lửng',
    latin: 'Wingardium Leviosa!',
    glyph: '〰️',
    strokeName: 'Vẫy & Gõ (Swish & Flick)',
    strokeDesc: 'Vẽ nét lượn sóng từ trái sang phải, uốn lượn mềm mại nhịp nhàng.',
    svgPath: 'M 16 52 Q 33 26 50 52 T 84 52',
    color: '#eccc68',
    glowColor: 'rgba(236, 204, 104, 0.45)',
    effect: 'Nâng cơ thể bạn bay bổng lơ lửng trên không trung cùng đàn lông vũ vàng óng.',
  },
  {
    id: 'PATRONUS',
    name: 'Bùa Hộ Mệnh',
    latin: 'Expecto Patronum!',
    glyph: '∞',
    strokeName: 'Vòng vô cực số 8 / Xoắn ốc',
    strokeDesc: 'Vẽ biểu tượng vô cực ∞, số 8 hoặc vòng xoáy ốc uốn lượn liên tục.',
    svgPath: 'M 50 50 C 35 25 15 25 15 50 C 15 75 35 75 50 50 C 65 25 85 25 85 50 C 85 75 65 75 50 50 Z',
    color: '#70a1ff',
    glowColor: 'rgba(112, 161, 255, 0.45)',
    effect: 'Triệu hồi Thần Hộ Mệnh bạch ngân lượn quanh pháp sư tỏa ngút ngàn sương bạc.',
  },
]

export default function SpellbookModal({ onClose }: SpellbookModalProps) {
  const [selectedSpell, setSelectedSpell] = useState<SpellInfo>(SPELLS[0])
  const [practiceFeedback, setPracticeFeedback] = useState<string>('Vẽ thử cử chỉ vào khung bên dưới để luyện tập!')
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const strokePointsRef = useRef<Point[]>([])

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const clearPracticeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    strokePointsRef.current = []
    setPracticeFeedback('Khung vẽ đã xoá. Hãy thử vẽ cử chỉ đũa phép!')
    setIsSuccess(null)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    isDrawingRef.current = true
    strokePointsRef.current = [{ x, y }]

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#ffd32a'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = '#ffeaa7'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    strokePointsRef.current.push({ x, y })

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false

    const points = strokePointsRef.current
    if (points.length < 5) {
      setPracticeFeedback('Nét vẽ quá ngắn, hãy vung đũa dứt khoát hơn!')
      setIsSuccess(false)
      return
    }

    const result = recognizeSpell(points)
    if (result.spell !== 'UNKNOWN') {
      const matched = SPELLS.find((s) => s.id === result.spell)
      const percent = Math.round(result.confidence * 100)
      setPracticeFeedback(`✨ Xuất sắc! Nhận diện bùa ${result.emoji} ${result.incantation} (Độ khớp: ${percent}%)`)
      setIsSuccess(true)
      if (matched) {
        setSelectedSpell(matched)
      }
    } else {
      setPracticeFeedback('💨 Cử chỉ chưa đúng hình dáng. Hãy quan sát hình mẫu và vẽ lại!')
      setIsSuccess(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5100,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(9, 7, 16, 0.82)',
        backdropFilter: 'blur(6px)',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spellbook-title"
        style={{
          width: 'min(940px, 96vw)',
          maxHeight: '92vh',
          background: 'linear-gradient(135deg, #1f1812 0%, #15100c 100%)',
          border: '2px solid #b8860b',
          borderRadius: 18,
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85), inset 0 0 60px rgba(184, 134, 11, 0.12)',
          color: '#f5ecd5',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Georgia, Cambria, serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(184, 134, 11, 0.35)',
            background: 'rgba(30, 22, 14, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26 }}>📜</span>
            <div>
              <div
                id="spellbook-title"
                style={{
                  color: '#ffd700',
                  fontSize: 20,
                  fontWeight: 'bold',
                  letterSpacing: '0.04em',
                  textShadow: '0 2px 8px rgba(255, 215, 0, 0.35)',
                }}
              >
                Sách Thần Chú Tiêu Chuẩn & Cử Chỉ Đũa Phép
              </div>
              <div style={{ color: '#d4af37', fontSize: 13, marginTop: 2, fontStyle: 'italic' }}>
                The Standard Book of Spells · Học viện Pháp thuật Hogwarts
              </div>
            </div>
          </div>
          <IconButton aria-label="Đóng sách thần chú" onClick={onClose} sx={{ color: '#d4af37' }}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Content Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* Left Column: Spell List */}
          <div
            style={{
              padding: '16px',
              borderRight: '1px solid rgba(184, 134, 11, 0.25)',
              background: 'rgba(20, 14, 10, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#bfa15f',
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              Danh mục 6 bùa phép nhập môn:
            </div>
            {SPELLS.map((spell) => {
              const isSelected = selectedSpell.id === spell.id
              return (
                <div
                  key={spell.id}
                  onClick={() => setSelectedSpell(spell)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(184, 134, 11, 0.25)' : 'rgba(35, 25, 18, 0.45)',
                    border: isSelected ? `1.5px solid ${spell.color}` : '1px solid rgba(184, 134, 11, 0.2)',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 0 16px ${spell.glowColor}` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: `1px solid ${spell.color}`,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 18,
                      color: spell.color,
                      fontWeight: 'bold',
                    }}
                  >
                    {spell.glyph}
                  </div>
                  <div>
                    <div style={{ color: isSelected ? '#ffffff' : '#f3e5ab', fontWeight: 600, fontSize: 15 }}>
                      {spell.latin}
                    </div>
                    <div style={{ color: '#a69076', fontSize: 12, marginTop: 2 }}>{spell.name}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Selected Spell Details & Practice Pad */}
          <div
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: 'radial-gradient(ellipse at top, rgba(40, 28, 18, 0.6) 0%, rgba(18, 12, 8, 0.9) 100%)',
              overflowY: 'auto',
            }}
          >
            {/* Spell Overview Card */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr',
                gap: 18,
                alignItems: 'center',
                padding: 16,
                borderRadius: 12,
                background: 'rgba(25, 18, 12, 0.7)',
                border: `1px solid ${selectedSpell.color}60`,
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 25px ${selectedSpell.glowColor}`,
              }}
            >
              {/* Rune SVG Icon */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 12,
                  background: 'rgba(12, 8, 5, 0.85)',
                  border: `2px dashed ${selectedSpell.color}`,
                  display: 'grid',
                  placeItems: 'center',
                  padding: 8,
                }}
              >
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <path
                    d={selectedSpell.svgPath}
                    fill="none"
                    stroke={selectedSpell.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: `drop-shadow(0 0 8px ${selectedSpell.color})`,
                    }}
                  />
                </svg>
              </div>

              {/* Text Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <h3
                    style={{
                      margin: 0,
                      color: selectedSpell.color,
                      fontSize: 22,
                      fontWeight: 'bold',
                      textShadow: `0 0 12px ${selectedSpell.color}80`,
                    }}
                  >
                    {selectedSpell.latin}
                  </h3>
                  <span style={{ color: '#d4af37', fontSize: 14 }}>({selectedSpell.glyph})</span>
                </div>
                <div style={{ color: '#ecdcb9', fontSize: 14, marginTop: 4, fontWeight: 500 }}>
                  {selectedSpell.name}
                </div>
                <div style={{ color: '#cfba9b', fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>
                  <strong style={{ color: '#f5ecd5' }}>Cử chỉ đũa:</strong> {selectedSpell.strokeDesc}
                </div>
                <div style={{ color: '#a2907d', fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
                  <strong style={{ color: '#d4af37' }}>Phép lực:</strong> {selectedSpell.effect}
                </div>
              </div>
            </div>

            {/* Practice Pad Section */}
            <div
              style={{
                borderRadius: 12,
                background: 'rgba(20, 14, 10, 0.8)',
                border: '1px solid rgba(184, 134, 11, 0.3)',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffd700', fontSize: 14, fontWeight: 'bold' }}>
                  <AutoFixHighIcon fontSize="small" /> Bàn Luyện Tập Vung Đũa (Practice Pad)
                </div>
                <button
                  onClick={clearPracticeCanvas}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(60, 42, 28, 0.6)',
                    border: '1px solid rgba(184, 134, 11, 0.4)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    color: '#d4af37',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshIcon fontSize="small" /> Xoá nét
                </button>
              </div>

              {/* Interactive Canvas */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 160,
                  background: '#0d0906',
                  borderRadius: 10,
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8)',
                  cursor: 'crosshair',
                  touchAction: 'none',
                }}
              >
                {/* Background watermarked rune */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    opacity: 0.15,
                    pointerEvents: 'none',
                  }}
                >
                  <svg viewBox="0 0 100 100" style={{ width: 100, height: 100 }}>
                    <path
                      d={selectedSpell.svgPath}
                      fill="none"
                      stroke={selectedSpell.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <canvas
                  ref={canvasRef}
                  width={560}
                  height={160}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>

              {/* Real-time Feedback Banner */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background:
                    isSuccess === true
                      ? 'rgba(46, 213, 115, 0.15)'
                      : isSuccess === false
                      ? 'rgba(255, 71, 87, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                  border:
                    isSuccess === true
                      ? '1px solid rgba(46, 213, 115, 0.4)'
                      : isSuccess === false
                      ? '1px solid rgba(255, 71, 87, 0.4)'
                      : '1px solid rgba(184, 134, 11, 0.2)',
                  color: isSuccess === true ? '#2ed573' : isSuccess === false ? '#ff6b81' : '#ecdcb9',
                }}
              >
                {practiceFeedback}
              </div>
            </div>

            {/* In-Game Usage Tip */}
            <div
              style={{
                fontSize: 12,
                color: '#bfa15f',
                background: 'rgba(30, 20, 12, 0.4)',
                padding: '10px 14px',
                borderRadius: 8,
                borderLeft: '3px solid #b8860b',
                lineHeight: 1.5,
              }}
            >
              💡 <strong>Mẹo Đại Sảnh:</strong> Bạn có thể nhấp giữ chuột trái và vẽ trực tiếp lên bất kỳ điểm nào trên màn hình chơi game để thi triển phép thuật tức thì! Mọi người chơi khác trong phòng sẽ đồng thời nhìn thấy luồng hào quang của bạn!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
