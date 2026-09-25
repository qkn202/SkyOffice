import React, { useEffect, useRef } from 'react'

/**
 * YouTube Video ID: LIÊN KHÚC VUI TRUNG THU - NHÀ MỨT GỪNG
 * https://www.youtube.com/watch?v=jpS-9VuxnDA
 */
export const YOUTUBE_VIDEO_ID = 'jpS-9VuxnDA'

export default function BackgroundMusic() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
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

    const startAudio = () => {
      sendCommand('unMute')
      sendCommand('setVolume', [100])
      sendCommand('playVideo')
    }

    // Tự động thử phát ngay khi iframe nạp
    const timeouts = [600, 1200, 2000, 3500, 5000].map((delay) =>
      setTimeout(startAudio, delay)
    )

    // Bắt mọi tương tác người dùng (click, bấm phím di chuyển, chạm) để mở khóa âm thanh ngay lập tức
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
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: 240,
        height: 135,
        opacity: 0.01, // Giữ kích thước hợp lệ trong viewport để Chrome không chặn audio stream
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
  )
}
