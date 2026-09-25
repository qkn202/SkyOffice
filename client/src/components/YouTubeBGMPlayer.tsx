import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import Tooltip from '@mui/material/Tooltip'
import Fab from '@mui/material/Fab'
import Slider from '@mui/material/Slider'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

const PRESET_SONGS = [
  {
    title: '🏮 Rước Đèn Tháng Tám & Múa Lân Trung Thu',
    id: 'Mtk33i124sQ',
    desc: 'Nhạc Trung Thu truyền thống, rộn ràng tiếng trống lân',
  },
  {
    title: '🧙‍♂️ Hogwarts Ambient & Hedwig\'s Theme Lofi',
    id: 'WPni755-Krg',
    desc: 'Nhạc phép thuật Harry Potter êm dịu thư giãn',
  },
  {
    title: '🌕 Đêm Trăng Rằm Acoustic / Lofi Chill',
    id: 'jfKfPfyJRdk',
    desc: 'Giai điệu lofi nhẹ nhàng ngắm trăng rằm',
  },
  {
    title: '🥮 Chiếc Đèn Ông Sao — Hợp Ca Tuổi Thơ',
    id: '5qap5aO4i9A',
    desc: 'Bài ca Trung Thu quen thuộc rực rỡ ký ức',
  },
]

const spinAnim = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const pulseAnim = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
`

const MusicFab = styled(Fab)<{ $isPlaying: boolean }>`
  background: ${(props) => (props.$isPlaying ? '#b45309' : '#1e293b')} !important;
  color: #ffd875 !important;
  border: 1.5px solid ${(props) => (props.$isPlaying ? '#fde047' : '#94a3b8')} !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  animation: ${(props) => (props.$isPlaying ? pulseAnim : 'none')} 2s infinite;

  .music-icon {
    animation: ${(props) => (props.$isPlaying ? spinAnim : 'none')} 4s linear infinite;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 6000;
  background: rgba(8, 6, 18, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Panel = styled.div`
  background: linear-gradient(145deg, #181c2e, #111424);
  border: 1.5px solid #ffd875;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  color: #f1f5f9;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.75), 0 0 20px rgba(245, 158, 11, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 216, 117, 0.2);
  background: rgba(255, 216, 117, 0.05);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #ffd875;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 6px;
    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
`

const Content = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const InputGroup = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    background: #0f121d;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 10px 14px;
    color: #f8fafc;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #f59e0b;
    }

    &::placeholder {
      color: #64748b;
    }
  }

  button {
    background: linear-gradient(135deg, #d97706, #b45309);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-weight: 600;
    padding: 0 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      transform: translateY(-1px);
    }
  }
`

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(15, 18, 29, 0.7);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  .play-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border: none;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    transition: all 0.2s;

    &:hover {
      transform: scale(1.08);
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
    }
  }

  .volume-control {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #cbd5e1;
  }
`

const PresetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .section-title {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const PresetItem = styled.button<{ $isActive: boolean }>`
  background: ${(props) => (props.$isActive ? 'rgba(245, 158, 11, 0.15)' : '#0f121d')};
  border: 1px solid ${(props) => (props.$isActive ? '#f59e0b' : '#334155')};
  border-radius: 10px;
  padding: 10px 14px;
  text-align: left;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: #ffd875;
    background: rgba(255, 216, 117, 0.08);
  }

  .song-info {
    display: flex;
    flex-direction: column;
    gap: 3px;

    .name {
      font-size: 13px;
      font-weight: 600;
      color: ${(props) => (props.$isActive ? '#ffd875' : '#f8fafc')};
    }

    .desc {
      font-size: 11px;
      color: #94a3b8;
    }
  }

  .status-tag {
    font-size: 11px;
    font-weight: 700;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
  }
`

const VideoPreviewToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  padding-top: 4px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
`

export default function YouTubeBGMPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [videoId, setVideoId] = useState<string>(() => {
    return localStorage.getItem('skyoffice_bgm_videoid') || PRESET_SONGS[0].id
  })
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    return localStorage.getItem('skyoffice_bgm_playing') === 'true'
  })
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('skyoffice_bgm_volume')
    return saved !== null ? Number(saved) : 60
  })
  const [inputUrl, setInputUrl] = useState('')
  const [showMiniVideo, setShowMiniVideo] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('skyoffice_bgm_videoid', videoId)
  }, [videoId])

  useEffect(() => {
    localStorage.setItem('skyoffice_bgm_volume', String(volume))
  }, [volume])

  useEffect(() => {
    localStorage.setItem('skyoffice_bgm_playing', String(isPlaying))
  }, [isPlaying])

  // Handle postMessage commands to YouTube IFrame
  const sendCommand = (func: string, args: unknown = '') => {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    )
  }

  // Update volume
  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const val = typeof newValue === 'number' ? newValue : newValue[0]
    setVolume(val)
    sendCommand('setVolume', [val])
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      sendCommand('pauseVideo')
      setIsPlaying(false)
    } else {
      sendCommand('playVideo')
      setIsPlaying(true)
    }
  }

  // Load new song
  const playVideoId = (newId: string) => {
    setVideoId(newId)
    setIsPlaying(true)
  }

  // Handle custom URL submit
  const handleApplyUrl = () => {
    const extracted = extractYouTubeId(inputUrl)
    if (extracted) {
      playVideoId(extracted)
      setInputUrl('')
    } else {
      alert('Vui lòng nhập đường link hoặc mã video YouTube hợp lệ (ví dụ: https://www.youtube.com/watch?v=...)')
    }
  }

  return (
    <>
      {/* Hidden / Mini Video IFrame */}
      <div
        style={{
          position: 'fixed',
          bottom: showMiniVideo ? 80 : -9999,
          right: showMiniVideo ? 20 : -9999,
          zIndex: 4999,
          width: showMiniVideo ? 240 : 1,
          height: showMiniVideo ? 135 : 1,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: showMiniVideo ? '0 8px 24px rgba(0,0,0,0.8), 0 0 12px #f59e0b' : 'none',
          border: showMiniVideo ? '2px solid #ffd875' : 'none',
          pointerEvents: showMiniVideo ? 'auto' : 'none',
          background: '#000',
        }}
      >
        <iframe
          ref={iframeRef}
          title="YouTube BGM"
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${
            isPlaying ? '1' : '0'
          }&loop=1&playlist=${videoId}&origin=${window.location.origin}`}
          allow="autoplay; encrypted-media"
          style={{ border: 'none' }}
        />
      </div>

      {/* Floating BGM Button on HUD */}
      <Tooltip title="Nhạc Nền YouTube (BGM Player)">
        <MusicFab
          size="small"
          $isPlaying={isPlaying}
          onClick={() => setIsOpen(true)}
          aria-label="Nhạc nền YouTube"
        >
          <MusicNoteIcon className="music-icon" />
        </MusicFab>
      </Tooltip>

      {/* Music Modal Panel */}
      {isOpen && (
        <ModalOverlay onClick={() => setIsOpen(false)}>
          <Panel onClick={(e) => e.stopPropagation()}>
            <Header>
              <h3>
                🏮 <span>Phù Thủy Jukebox — Nhạc Nền YouTube</span> ✨
              </h3>
              <button className="close-btn" onClick={() => setIsOpen(false)} title="Đóng">
                <CloseIcon fontSize="small" />
              </button>
            </Header>

            <Content>
              {/* Custom YouTube URL input */}
              <InputGroup>
                <input
                  type="text"
                  placeholder="Dán link YouTube (https://www.youtube.com/watch?v=...)"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                />
                <button onClick={handleApplyUrl}>Phát</button>
              </InputGroup>

              {/* Master Control: Play/Pause + Volume */}
              <ControlRow>
                <button
                  className="play-btn"
                  onClick={togglePlay}
                  title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
                >
                  {isPlaying ? <PauseIcon fontSize="medium" /> : <PlayArrowIcon fontSize="medium" />}
                </button>

                <div className="volume-control">
                  {volume === 0 ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                  <Slider
                    value={volume}
                    onChange={handleVolumeChange}
                    min={0}
                    max={100}
                    sx={{
                      color: '#f59e0b',
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#ffd875',
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(245, 158, 11, 0.16)',
                        },
                      },
                    }}
                  />
                  <span style={{ fontSize: 12, minWidth: 32, textAlign: 'right' }}>{volume}%</span>
                </div>
              </ControlRow>

              {/* Preset Songs */}
              <PresetList>
                <div className="section-title">Nhạc Tuyển Chọn Trung Thu & Hogwarts</div>
                {PRESET_SONGS.map((song) => {
                  const isActive = videoId === song.id
                  return (
                    <PresetItem
                      key={song.id}
                      $isActive={isActive}
                      onClick={() => playVideoId(song.id)}
                    >
                      <div className="song-info">
                        <span className="name">{song.title}</span>
                        <span className="desc">{song.desc}</span>
                      </div>
                      {isActive && isPlaying && <span className="status-tag">Đang phát 🎵</span>}
                    </PresetItem>
                  )
                })}
              </PresetList>

              {/* Mini Video Toggle */}
              <VideoPreviewToggle>
                <label>
                  <input
                    type="checkbox"
                    checked={showMiniVideo}
                    onChange={(e) => setShowMiniVideo(e.target.checked)}
                  />
                  <span>Hiện khung video mini ở góc màn hình</span>
                </label>

                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#ffd875', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Mở trên YouTube <OpenInNewIcon fontSize="inherit" />
                </a>
              </VideoPreviewToggle>
            </Content>
          </Panel>
        </ModalOverlay>
      )}
    </>
  )
}
