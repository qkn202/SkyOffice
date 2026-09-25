import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import { useAppSelector, useAppDispatch } from '../hooks'
import { closeWhiteboardDialog } from '../stores/WhiteboardStore'

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  box-sizing: border-box;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #1e2235;
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #141724;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;

  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 700;
    color: #fbbf24;
  }
`

const WhiteboardWrapper = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #0f172a;
  }
`

const GAME_OPTIONS = [
  { id: 'sketchclash', label: 'SketchClash', icon: '🎨' },
  { id: 'seven-potters', label: '7 Potters', icon: '🧹' },
  { id: 'undercover', label: 'Undercover', icon: '🕵️' },
] as const

type GameId = (typeof GAME_OPTIONS)[number]['id']

function getGameUrl(gameId: GameId): string | null {
  const configuredUrls: Record<GameId, string | undefined> = {
    sketchclash: 'https://sketchclash-game.vercel.app',
    'seven-potters': import.meta.env.VITE_GAME_7_POTTERS_URL,
    undercover: import.meta.env.VITE_GAME_UNDERCOVER_URL,
  }

  const configuredUrl = configuredUrls[gameId]
  if (configuredUrl) return configuredUrl

  // Local source projects can be run beside SkyOffice during development.
  if (import.meta.env.DEV && gameId === 'seven-potters') return 'http://127.0.0.1:3000'
  if (import.meta.env.DEV && gameId === 'undercover') return 'http://127.0.0.1:5174'
  return null
}

export default function WhiteboardDialog() {
  const whiteboardUrl = useAppSelector((state) => state.whiteboard.whiteboardUrl)
  const whiteboardId = useAppSelector((state) => state.whiteboard.whiteboardId)
  const playerId = useAppSelector((state) => state.user.sessionId)
  const playerName = useAppSelector((state) => state.user.playerNameMap.get(state.user.sessionId) || '')
  const playerHouse = useAppSelector((state) => state.user.assignedHouse)
  const dispatch = useAppDispatch()
  const [selectedGame, setSelectedGame] = useState<GameId>('sketchclash')

  const selectedUrl = useMemo(() => {
    if (selectedGame === 'sketchclash') return whiteboardUrl
    const baseUrl = getGameUrl(selectedGame)
    if (!baseUrl) return null

    const url = new URL(baseUrl, window.location.href)
    if (whiteboardId) url.searchParams.set('skyofficeBoard', whiteboardId)
    if (playerId) url.searchParams.set('skyofficePlayer', playerId)
    if (playerName) url.searchParams.set('skyofficeName', playerName)
    if (playerHouse) url.searchParams.set('skyofficeHouse', playerHouse)
    return url.toString()
  }, [selectedGame, whiteboardUrl, whiteboardId, playerId, playerName, playerHouse])

  const selectedLabel = GAME_OPTIONS.find((game) => game.id === selectedGame)?.label || 'Minigame'

  return (
    <Backdrop>
      <Wrapper>
        <HeaderBar>
          <div className="title">
            <span>🎮 Bàn Chơi Minigame: {selectedLabel}</span>
          </div>
          <IconButton
            aria-label="close dialog"
            onClick={() => dispatch(closeWhiteboardDialog())}
            sx={{ color: '#fff', '&:hover': { color: '#fbbf24' } }}
          >
            <CloseIcon />
          </IconButton>
        </HeaderBar>
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#191d2c' }}>
          {GAME_OPTIONS.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => setSelectedGame(game.id)}
              aria-pressed={selectedGame === game.id}
              style={{
                border: selectedGame === game.id ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,.16)',
                background: selectedGame === game.id ? 'rgba(251,191,36,.14)' : 'transparent',
                color: selectedGame === game.id ? '#fbbf24' : '#e2e8f0',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {game.icon} {game.label}
            </button>
          ))}
        </div>
        {selectedUrl ? (
          <WhiteboardWrapper>
            <iframe
              title={`${selectedLabel} game`}
              src={selectedUrl}
              allow="clipboard-write; fullscreen"
            />
          </WhiteboardWrapper>
        ) : (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#e2e8f0', padding: 24, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{selectedLabel} chưa được cấu hình</div>
              <div>Hãy đặt biến môi trường {selectedGame === 'seven-potters' ? 'VITE_GAME_7_POTTERS_URL' : 'VITE_GAME_UNDERCOVER_URL'} thành URL của game.</div>
            </div>
          </div>
        )}
      </Wrapper>
    </Backdrop>
  )
}
