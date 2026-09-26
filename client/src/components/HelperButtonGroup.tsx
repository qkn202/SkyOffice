import React, { lazy, Suspense, useEffect, useState } from 'react'
import styled from 'styled-components'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import MapIcon from '@mui/icons-material/Map'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'

import { setShowJoystick } from '../stores/UserStore'
import { useAppSelector, useAppDispatch } from '../hooks'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'
import { HogwartsRoomId } from '../scenes/HogwartsRoomManager'
import store from '../stores'

const HousePointsDialog = lazy(() => import('./HousePointsDialog'))
const MiniGamesDialog = lazy(() => import('./MiniGamesDialog'))
const SocialHubDialog = lazy(() => import('./SocialHubDialog'))
const SpellbookModal = lazy(() => import('./SpellbookModal'))
const MaraudersMap = lazy(() => import('./MaraudersMap'))
const FlooNetworkModal = lazy(() => import('./FlooNetworkModal'))
const WishLanternModal = lazy(() => import('./WishLanternModal'))

type MiniGameId = 'seven-potters' | 'undercover-hogwarts'
type MiniGameInvite = { gameId: MiniGameId; roomCode: string; invitedBy: string; isHost: boolean; readyPlayers: string[]; readySessionIds: string[] } | null

const Backdrop = styled.div<{ $modalOpen: boolean }>`
  position: fixed;
  z-index: ${(props) => (props.$modalOpen ? 5000 : 2400)};
  display: flex;
  gap: 8px;
  bottom: 16px;
  right: 16px;
  align-items: flex-end;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  .wrapper-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 650px) {
    right: 10px;
    bottom: 16px;
    gap: 6px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;

  @media (max-width: 650px) {
    flex-wrap: wrap-reverse;
    justify-content: flex-end;
    gap: 6px;
    max-width: 216px;
  }
`

const StyledFab = styled(Fab)<{ target?: string }>`
  touch-action: manipulation;
  cursor: pointer;

  &:hover {
    color: #1ea2df;
  }

  @media (max-width: 650px) {
    width: 40px !important;
    height: 40px !important;
    min-height: 40px !important;
  }
`

export default function HelperButtonGroup() {
  const [showHousePoints, setShowHousePoints] = useState(false)
  const [miniGameInvite, setMiniGameInvite] = useState<MiniGameInvite>(null)
  const [showMiniGames, setShowMiniGames] = useState(false)
  const [showSocialHub, setShowSocialHub] = useState(false)
  const [showSpellbook, setShowSpellbook] = useState(false)
  const [showMaraudersMap, setShowMaraudersMap] = useState(false)
  const [showFlooModal, setShowFlooModal] = useState(false)
  const [showWishLantern, setShowWishLantern] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<HogwartsRoomId>('great_hall')
  const showJoystick = useAppSelector((state) => state.user.showJoystick)
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const sessionId = useAppSelector((state) => state.user.sessionId)
  const hpvnProfile = useAppSelector((state) => state.user.hpvnProfile)
  const assignedHouse = useAppSelector((state) => state.user.assignedHouse)
  const currentPlayerName = useAppSelector((state) => state.user.currentPlayerName)
  const playerName = useAppSelector((state) => state.user.playerNameMap.get(sessionId))
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleInvite = (event: Event) => {
      const invite = (event as CustomEvent<MiniGameInvite>).detail
      if (!invite || (invite.gameId !== 'seven-potters' && invite.gameId !== 'undercover-hogwarts')) return
      setMiniGameInvite(invite)
      setShowMiniGames(true)
    }
    const handleReadyState = (event: Event) => {
      const readyState = (event as CustomEvent<{ gameId: MiniGameId; roomCode: string; readyPlayers: string[]; readySessionIds: string[] }>).detail
      setMiniGameInvite((current) => current ? { ...current, ...readyState } : current)
    }
    const handleCancel = () => {
      setMiniGameInvite(null)
      setShowMiniGames(false)
    }
    window.addEventListener('skyoffice:minigame-invite', handleInvite)
    window.addEventListener('skyoffice:minigame-ready-state', handleReadyState)
    window.addEventListener('skyoffice:minigame-cancel', handleCancel)

    const handleRoomChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.roomId) setCurrentRoom(detail.roomId)
    }
    const handleToggleFloo = () => setShowFlooModal((prev) => !prev)
    const handleToggleWishLantern = () => setShowWishLantern((prev) => !prev)
    window.addEventListener('skyoffice:room-changed', handleRoomChanged)
    window.addEventListener('skyoffice:toggle-floo-modal', handleToggleFloo)
    window.addEventListener('skyoffice:toggle-wish-lantern', handleToggleWishLantern)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if typing in chat or any input field
      const target = e.target as HTMLElement | null
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        Boolean(target?.isContentEditable)
      if (isInput || store.getState().chat.focused) return

      if (e.key === 'm' || e.key === 'M') {
        setShowMaraudersMap((prev) => !prev)
      } else if (e.key === 'b' || e.key === 'B') {
        setShowSpellbook((prev) => !prev)
      } else if (e.key === 'f' || e.key === 'F') {
        setShowFlooModal((prev) => !prev)
      } else if (e.key === 'l' || e.key === 'L') {
        setShowWishLantern((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('skyoffice:minigame-invite', handleInvite)
      window.removeEventListener('skyoffice:minigame-ready-state', handleReadyState)
      window.removeEventListener('skyoffice:minigame-cancel', handleCancel)
      window.removeEventListener('skyoffice:room-changed', handleRoomChanged)
      window.removeEventListener('skyoffice:toggle-floo-modal', handleToggleFloo)
      window.removeEventListener('skyoffice:toggle-wish-lantern', handleToggleWishLantern)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Chỉ hiển thị toolbar khi đã vào phòng và đã đăng nhập hoàn tất.
  if (!roomJoined || !loggedIn) return null

  const inviteMiniGame = (gameId: MiniGameId, roomCode: string) => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap | undefined
    bootstrap?.network?.inviteMiniGame(gameId, roomCode)
  }

  const setMiniGameReady = (ready: boolean) => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap | undefined
    bootstrap?.network?.setMiniGameReady(ready)
  }

  const startMiniGame = () => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap | undefined
    bootstrap?.network?.startMiniGame()
  }

  const cancelMiniGameLobby = () => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap | undefined
    bootstrap?.network?.cancelMiniGameLobby()
  }

  return (
    <Backdrop
      $modalOpen={
        showHousePoints ||
        showMiniGames ||
        showSocialHub ||
        showSpellbook ||
        showMaraudersMap ||
        showFlooModal ||
        showWishLantern
      }
    >
      <Suspense fallback={<div role="status" style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'grid', placeItems: 'center', color: '#ffd875', background: 'rgba(9, 7, 20, 0.55)' }}>Đang mở tính năng…</div>}>
        {showHousePoints && <HousePointsDialog onClose={() => setShowHousePoints(false)} />}
        {showSpellbook && <SpellbookModal onClose={() => setShowSpellbook(false)} />}
        {showMaraudersMap && <MaraudersMap onClose={() => setShowMaraudersMap(false)} />}
        {showFlooModal && (
          <FlooNetworkModal
            currentRoom={currentRoom}
            onClose={() => setShowFlooModal(false)}
          />
        )}
        {showWishLantern && <WishLanternModal onClose={() => setShowWishLantern(false)} />}
        {showMiniGames && (
          <MiniGamesDialog
            invite={miniGameInvite}
            playerName={hpvnProfile?.username || currentPlayerName || playerName || 'Phù thủy SkyOffice'}
            house={(hpvnProfile?.house || assignedHouse || '').toUpperCase()}
            onClose={() => {
              setShowMiniGames(false)
              setMiniGameInvite(null)
            }}
            onInvite={inviteMiniGame}
            onSetReady={setMiniGameReady}
            onStart={startMiniGame}
            onCancel={cancelMiniGameLobby}
            sessionId={sessionId}
          />
        )}
        {showSocialHub && <SocialHubDialog onClose={() => setShowSocialHub(false)} />}
      </Suspense>
      <div className="wrapper-group">
        {roomJoined && (
          <Tooltip title={showJoystick ? 'Tắt cần điều khiển' : 'Bật cần điều khiển'}>
            <StyledFab aria-label={showJoystick ? 'Tắt cần điều khiển' : 'Bật cần điều khiển'} size="small" onClick={() => dispatch(setShowJoystick(!showJoystick))}>
              {showJoystick ? <VideogameAssetOffIcon /> : <VideogameAssetIcon />}
            </StyledFab>
          </Tooltip>
        )}
      </div>
      <ButtonGroup>
        {roomJoined && (
          <Tooltip title="Thả Thiên Đăng Ước Nguyện Trung Thu (Phím L)">
            <StyledFab
              id="wish-lantern-button"
              aria-label="Thả Thiên Đăng Ước Nguyện Trung Thu"
              size="small"
              style={{ background: '#3b250e', color: '#ffd700', border: '1px solid #d4af37' }}
              onClick={() => setShowWishLantern(true)}
            >
              <span style={{ fontSize: 18 }}>🏮</span>
            </StyledFab>
          </Tooltip>
        )}
        {roomJoined && (
          <Tooltip title="Mạng Lưới Lò Sưởi Floo (Phím F)">
            <StyledFab
              size="small"
              style={{ background: '#0e2a1b', color: '#2ed573', border: '1px solid #2ed573' }}
              onClick={() => setShowFlooModal(true)}
            >
              <LocalFireDepartmentIcon />
            </StyledFab>
          </Tooltip>
        )}
        {roomJoined && (
          <Tooltip title="Sách Thần Chú & Cử Chỉ Vung Đũa (Phím B)">
            <StyledFab
              size="small"
              style={{ background: '#3b2413', color: '#ffd700', border: '1px solid #d4af37' }}
              onClick={() => setShowSpellbook(true)}
            >
              <MenuBookIcon />
            </StyledFab>
          </Tooltip>
        )}
        {roomJoined && (
          <Tooltip title="Bản Đồ Đạo Tặc Hogwarts (Phím M)">
            <StyledFab
              size="small"
              style={{ background: '#452b17', color: '#f3e5ab', border: '1px solid #ba9f73' }}
              onClick={() => setShowMaraudersMap(true)}
            >
              <MapIcon />
            </StyledFab>
          </Tooltip>
        )}
        {roomJoined && (
          <Tooltip title="Người chơi, biểu cảm và sự kiện">
            <StyledFab size="small" onClick={() => setShowSocialHub(true)}>
              <PeopleAltIcon />
            </StyledFab>
          </Tooltip>
        )}
        {roomJoined && (
          <Tooltip title="Cổng trò chơi đại sảnh">
            <StyledFab size="small" onClick={() => setShowMiniGames(true)}>
              <SportsEsportsIcon />
            </StyledFab>
          </Tooltip>
        )}
        {roomJoined && loggedIn && (
          <Tooltip title="Bảng điểm Nhà">
            <StyledFab size="small" onClick={() => setShowHousePoints(true)}>
              <EmojiEventsIcon />
            </StyledFab>
          </Tooltip>
        )}
      </ButtonGroup>
    </Backdrop>
  )
}
