import React, { useEffect, useRef } from 'react'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import { useAppDispatch, useAppSelector } from '../hooks'
import { toggleBgmMuted } from '../stores/UserStore'
import store from '../stores'

/**
 * YouTube Video ID: LIÊN KHÚC VUI TRUNG THU - NHÀ MỨT GỪNG
 * https://www.youtube.com/watch?v=jpS-9VuxnDA
 */
export const YOUTUBE_VIDEO_ID = 'jpS-9VuxnDA'

export default function BackgroundMusic() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const bgmMuted = useAppSelector((state) => state.user.bgmMuted)
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const dispatch = useAppDispatch()

  const sendCommand = (func: string, args: unknown = '') => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      )
    } catch (e) {
      // ignore cross-origin error
    }
  }

  // Phản ứng khi trạng thái bgmMuted thay đổi từ nút bấm hoặc phím tắt
  useEffect(() => {
    if (bgmMuted) {
      sendCommand('mute')
      sendCommand('pauseVideo')
    } else {
      sendCommand('unMute')
      sendCommand('setVolume', [100])
      sendCommand('playVideo')
    }
  }, [bgmMuted])

  useEffect(() => {
    const startAudio = () => {
      // Nếu người dùng đã chủ động tắt nhạc thì không tự mở lại
      if (store.getState().user.bgmMuted) return
      sendCommand('unMute')
      sendCommand('setVolume', [100])
      sendCommand('playVideo')
    }

    // Tự động thử phát ngay khi iframe nạp
    const timeouts = [600, 1200, 2000, 3500, 5000].map((delay) =>
      setTimeout(startAudio, delay)
    )

    // Bắt tương tác người dùng ban đầu để mở khóa âm thanh trình duyệt
    window.addEventListener('click', startAudio, { capture: true, passive: true })
    window.addEventListener('keydown', startAudio, { capture: true, passive: true })
    window.addEventListener('pointerdown', startAudio, { capture: true, passive: true })
    window.addEventListener('touchstart', startAudio, { capture: true, passive: true })

    return () => {
      timeouts.forEach(clearTimeout)
      window.removeEventListener('click', startAudio, { capture: true })
      window.removeEventListener('keydown', startAudio, { capture: true })
      window.removeEventListener('pointerdown', startAudio, { capture: true })
      window.removeEventListener('touchstart', startAudio, { capture: true })
    }
  }, [])

  return (
    <>
      {/* Nút bật/tắt nhạc nền ở góc trên bên phải khi ở màn hình đăng nhập/chọn phòng */}
      {!loggedIn && (
        <button
          type="button"
          onClick={() => dispatch(toggleBgmMuted())}
          title={bgmMuted ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
          aria-label={bgmMuted ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
          style={{
            position: 'fixed',
            top: 14,
            right: 14,
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 20,
            background: bgmMuted ? 'rgba(35, 20, 30, 0.92)' : 'rgba(28, 22, 45, 0.92)',
            border: bgmMuted ? '1px solid rgba(239, 68, 68, 0.55)' : '1px solid rgba(255, 215, 0, 0.65)',
            color: bgmMuted ? '#ef4444' : '#ffd700',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            transition: 'all 0.2s ease',
          }}
        >
          {bgmMuted ? <VolumeOffIcon style={{ fontSize: 18 }} /> : <VolumeUpIcon style={{ fontSize: 18 }} />}
          <span>{bgmMuted ? 'Bật Nhạc' : 'Tắt Nhạc'}</span>
        </button>
      )}

      {/* Hidden YouTube IFrame */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: 240,
          height: 135,
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'hidden',
        }}
      >
        <iframe
          ref={iframeRef}
          id="yt-bgm-active-iframe"
          title="SkyOffice BGM"
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?enablejsapi=1&autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1`}
          allow="autoplay; encrypted-media"
          style={{ border: 'none' }}
        />
      </div>
    </>
  )
}
