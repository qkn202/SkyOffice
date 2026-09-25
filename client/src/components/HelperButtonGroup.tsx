import React, { lazy, Suspense, useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ShareIcon from '@mui/icons-material/Share'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import CloseIcon from '@mui/icons-material/Close'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import MapIcon from '@mui/icons-material/Map'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import MenuIcon from '@mui/icons-material/Menu'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

import { BackgroundMode } from '../../../types/BackgroundMode'
import { setShowJoystick, toggleBackgroundMode } from '../stores/UserStore'
import { useAppSelector, useAppDispatch } from '../hooks'
import { getAvatarString, getColorByString } from '../util'
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

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const lanternGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 180, 0, 0.4), inset 0 0 6px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 18px rgba(255, 200, 0, 0.7), inset 0 0 10px rgba(255, 230, 100, 0.5);
  }
`

/* Desktop bottom-right toolbar */
const DesktopBackdrop = styled.div<{ $modalOpen: boolean }>`
  position: fixed;
  z-index: ${(props) => (props.$modalOpen ? 5000 : 'auto')};
  display: flex;
  gap: 10px;
  bottom: 16px;
  right: 16px;
  align-items: flex-end;

  .wrapper-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  @media (max-width: 768px) {
    display: none !important;
  }
`

/* Mobile compact top-right bar */
const MobileTopBar = styled.div`
  display: none;

  @media (max-width: 768px) {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: auto;
  }
`

const MobileTopButton = styled.button<{ $variant?: 'lantern' | 'menu' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: 19px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  ${(props) =>
    props.$variant === 'lantern'
      ? `
    background: linear-gradient(135deg, rgba(62, 36, 12, 0.94), rgba(28, 14, 5, 0.94));
    border-color: rgba(255, 215, 0, 0.65);
    color: #ffd700;
    animation: ${lanternGlow} 2.5s infinite ease-in-out;
  `
      : `
    background: linear-gradient(135deg, rgba(28, 22, 45, 0.94), rgba(15, 11, 26, 0.94));
    border-color: rgba(212, 175, 55, 0.45);
    color: #f5deb3;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  `}

  &:active {
    transform: scale(0.95);
  }
`

/* Mobile Bottom Sheet Modal */
const MobileSheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(4, 2, 10, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 6000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

const MobileSheetContainer = styled.div`
  background: linear-gradient(180deg, #1b162b 0%, #0d0a17 100%);
  border-top: 2px solid rgba(212, 175, 55, 0.45);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.7);
  padding: 14px 18px 30px;
  max-height: 82vh;
  overflow-y: auto;
  animation: ${slideUp} 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  .sheet-handle {
    width: 42px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.25);
    margin: 0 auto 12px;
  }
`

const MobileSheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  h4 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #ffd875;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  span {
    font-size: 11.5px;
    color: #a8a0bc;
  }
`

const MobileSectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #c9ab69;
  margin: 14px 0 8px;
`

const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 400px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
`

const MobileGridCard = styled.button<{ $accent?: string; $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 4px;
  background: ${(props) => (props.$active ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.04)')};
  border: 1px solid ${(props) => (props.$active ? 'rgba(212, 175, 55, 0.5)' : 'rgba(255, 255, 255, 0.08)')};
  border-radius: 14px;
  cursor: pointer;
  color: #fff;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.94);
    background: rgba(255, 255, 255, 0.1);
  }

  .icon-circle {
    width: 42px;
    height: 42px;
    border-radius: 21px;
    display: grid;
    place-items: center;
    background: ${(props) => props.$accent || 'rgba(255, 255, 255, 0.08)'};
    color: #fff;
    font-size: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    color: #e2e0ea;
    text-align: center;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 76px;
  }

  .status-tag {
    font-size: 9.5px;
    font-weight: 700;
    color: ${(props) => (props.$active ? '#86efac' : '#94a3b8')};
    line-height: 1;
  }
`

const Wrapper = styled.div`
  position: relative;
  font-size: 16px;
  color: #eee;
  background: #222639;
  box-shadow: 0px 0px 5px #0000006f;
  border-radius: 16px;
  padding: 15px 35px 15px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .close {
    position: absolute;
    top: 15px;
    right: 15px;
  }

  .tip {
    margin-left: 12px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`

const Title = styled.h3`
  font-size: 24px;
  color: #eee;
  text-align: center;
`

const RoomName = styled.div`
  margin: 10px 20px;
  max-width: 460px;
  max-height: 150px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;

  h3 {
    font-size: 24px;
    color: #eee;
  }
`

const RoomDescription = styled.div`
  margin: 0 20px;
  max-width: 460px;
  max-height: 150px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  font-size: 16px;
  color: #c2c2c2;
  display: flex;
  justify-content: center;
`

const StyledFab = styled(Fab)<{ target?: string }>`
  &:hover {
    color: #1ea2df;
  }
`

export default function HelperButtonGroup() {
  const [showControlGuide, setShowControlGuide] = useState(false)
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const [showHousePoints, setShowHousePoints] = useState(false)
  const [miniGameInvite, setMiniGameInvite] = useState<MiniGameInvite>(null)
  const [showMiniGames, setShowMiniGames] = useState(false)
  const [showSocialHub, setShowSocialHub] = useState(false)
  const [showSpellbook, setShowSpellbook] = useState(false)
  const [showMaraudersMap, setShowMaraudersMap] = useState(false)
  const [showFlooModal, setShowFlooModal] = useState(false)
  const [showWishLantern, setShowWishLantern] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<HogwartsRoomId>('great_hall')

  const showJoystick = useAppSelector((state) => state.user.showJoystick)
  const backgroundMode = useAppSelector((state) => state.user.backgroundMode)
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const roomId = useAppSelector((state) => state.room.roomId)
  const roomName = useAppSelector((state) => state.room.roomName)
  const roomDescription = useAppSelector((state) => state.room.roomDescription)
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

  if (roomJoined && !loggedIn) return null

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

  const isModalOpen =
    showHousePoints ||
    showMiniGames ||
    showSocialHub ||
    showSpellbook ||
    showMaraudersMap ||
    showFlooModal ||
    showWishLantern

  return (
    <>
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

      {/* MOBILE COMPACT TOP BAR: Only 2 sleek buttons on mobile */}
      {roomJoined && (
        <MobileTopBar>
          <MobileTopButton $variant="lantern" onClick={() => setShowWishLantern(true)}>
            <span style={{ fontSize: 16 }}>🏮</span>
            <span>Thả Đèn</span>
          </MobileTopButton>
          <MobileTopButton $variant="menu" onClick={() => setShowMobileMenu(true)}>
            <MenuIcon style={{ fontSize: 18, color: '#ffd875' }} />
            <span>Menu</span>
          </MobileTopButton>
        </MobileTopBar>
      )}

      {/* MOBILE ACTION BOTTOM SHEET DRAWER */}
      {showMobileMenu && (
        <MobileSheetOverlay onClick={() => setShowMobileMenu(false)}>
          <MobileSheetContainer onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <MobileSheetHeader>
              <div className="title-group">
                <h4>
                  <AutoAwesomeIcon style={{ fontSize: 18, color: '#ffd875' }} />
                  Tiện Ích Hogwarts
                </h4>
                <span>{roomName || 'Đại Sảnh Đường'} · {hpvnProfile?.username || currentPlayerName || playerName || 'Phù thủy'}</span>
              </div>
              <IconButton size="small" onClick={() => setShowMobileMenu(false)} style={{ color: '#cbd5e1' }}>
                <CloseIcon />
              </IconButton>
            </MobileSheetHeader>

            <MobileSectionTitle>🏮 Trung Thu & Phép Thuật</MobileSectionTitle>
            <MobileGrid>
              <MobileGridCard
                $accent="linear-gradient(135deg, #b45309, #d97706)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowWishLantern(true)
                }}
              >
                <div className="icon-circle">🏮</div>
                <div className="label">Thả Đèn</div>
                <div className="status-tag">Trung Thu</div>
              </MobileGridCard>

              <MobileGridCard
                $accent="linear-gradient(135deg, #065f46, #059669)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowFlooModal(true)
                }}
              >
                <div className="icon-circle"><LocalFireDepartmentIcon style={{ fontSize: 20 }} /></div>
                <div className="label">Lò Sưởi Floo</div>
                <div className="status-tag">Đổi phòng</div>
              </MobileGridCard>

              <MobileGridCard
                $accent="linear-gradient(135deg, #78350f, #92400e)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowSpellbook(true)
                }}
              >
                <div className="icon-circle"><MenuBookIcon style={{ fontSize: 20 }} /></div>
                <div className="label">Sách Phép</div>
                <div className="status-tag">Vẽ đũa</div>
              </MobileGridCard>

              <MobileGridCard
                $accent="linear-gradient(135deg, #573318, #714620)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowMaraudersMap(true)
                }}
              >
                <div className="icon-circle"><MapIcon style={{ fontSize: 20 }} /></div>
                <div className="label">Bản Đồ</div>
                <div className="status-tag">Đạo Tặc</div>
              </MobileGridCard>
            </MobileGrid>

            <MobileSectionTitle>🎮 Trò Chơi & Kết Nối</MobileSectionTitle>
            <MobileGrid>
              <MobileGridCard
                $accent="linear-gradient(135deg, #1e3a8a, #2563eb)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowSocialHub(true)
                }}
              >
                <div className="icon-circle"><PeopleAltIcon style={{ fontSize: 20 }} /></div>
                <div className="label">Cộng Đồng</div>
                <div className="status-tag">Người chơi</div>
              </MobileGridCard>

              <MobileGridCard
                $accent="linear-gradient(135deg, #4c1d95, #6d28d9)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowMiniGames(true)
                }}
              >
                <div className="icon-circle"><SportsEsportsIcon style={{ fontSize: 20 }} /></div>
                <div className="label">Trò Chơi</div>
                <div className="status-tag">Mini-games</div>
              </MobileGridCard>

              <MobileGridCard
                $accent="linear-gradient(135deg, #854d0e, #ca8a04)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowHousePoints(true)
                }}
              >
                <div className="icon-circle"><EmojiEventsIcon style={{ fontSize: 20 }} /></div>
                <div className="label">Điểm Nhà</div>
                <div className="status-tag">Bảng điểm</div>
              </MobileGridCard>
            </MobileGrid>

            <MobileSectionTitle>⚙️ Điều Khiển & Cài Đặt</MobileSectionTitle>
            <MobileGrid>
              <MobileGridCard
                $active={showJoystick}
                $accent="linear-gradient(135deg, #334155, #475569)"
                onClick={() => dispatch(setShowJoystick(!showJoystick))}
              >
                <div className="icon-circle">
                  {showJoystick ? <VideogameAssetIcon style={{ fontSize: 20 }} /> : <VideogameAssetOffIcon style={{ fontSize: 20 }} />}
                </div>
                <div className="label">Cần Ảo</div>
                <div className="status-tag">{showJoystick ? 'Đang BẬT' : 'Đang TẮT'}</div>
              </MobileGridCard>

              <MobileGridCard
                $accent="linear-gradient(135deg, #334155, #475569)"
                onClick={() => dispatch(toggleBackgroundMode())}
              >
                <div className="icon-circle">
                  {backgroundMode === BackgroundMode.DAY ? <DarkModeIcon style={{ fontSize: 20 }} /> : <LightModeIcon style={{ fontSize: 20 }} />}
                </div>
                <div className="label">Giao Diện</div>
                <div className="status-tag">{backgroundMode === BackgroundMode.DAY ? 'Ban Ngày' : 'Ban Đêm'}</div>
              </MobileGridCard>

              <MobileGridCard
                $accent="linear-gradient(135deg, #334155, #475569)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowRoomInfo(true)
                }}
              >
                <div className="icon-circle"><ShareIcon style={{ fontSize: 20 }} /></div>
                <div className="label">Phòng</div>
                <div className="status-tag">Thông tin</div>
              </MobileGridCard>

              <MobileGridCard
                $accent="linear-gradient(135deg, #334155, #475569)"
                onClick={() => {
                  setShowMobileMenu(false)
                  setShowControlGuide(true)
                }}
              >
                <div className="icon-circle"><HelpOutlineIcon style={{ fontSize: 20 }} /></div>
                <div className="label">Trợ Giúp</div>
                <div className="status-tag">Phím tắt</div>
              </MobileGridCard>
            </MobileGrid>

            <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'center', gap: 18, color: '#94a3b8', fontSize: 12 }}>
              <a href="https://github.com/kevinshen56714/SkyOffice" target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                <GitHubIcon style={{ fontSize: 16 }} /> GitHub
              </a>
              <span>·</span>
              <a href="https://twitter.com/SkyOfficeApp" target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                <TwitterIcon style={{ fontSize: 16 }} /> Twitter
              </a>
            </div>
          </MobileSheetContainer>
        </MobileSheetOverlay>
      )}

      {/* DESKTOP TOOLBAR (Hidden on mobile) */}
      <DesktopBackdrop $modalOpen={isModalOpen}>
        <div className="wrapper-group">
          {roomJoined && (
            <Tooltip title={showJoystick ? 'Tắt cần điều khiển' : 'Bật cần điều khiển'}>
              <StyledFab aria-label={showJoystick ? 'Tắt cần điều khiển' : 'Bật cần điều khiển'} size="small" onClick={() => dispatch(setShowJoystick(!showJoystick))}>
                {showJoystick ? <VideogameAssetOffIcon /> : <VideogameAssetIcon />}
              </StyledFab>
            </Tooltip>
          )}
          {showRoomInfo && (
            <Wrapper>
              <IconButton className="close" onClick={() => setShowRoomInfo(false)} size="small">
                <CloseIcon />
              </IconButton>
              <RoomName>
                <Avatar style={{ background: getColorByString(roomName) }}>
                  {getAvatarString(roomName)}
                </Avatar>
                <h3>{roomName}</h3>
              </RoomName>
              <RoomDescription>
                <ArrowRightIcon /> ID: {roomId}
              </RoomDescription>
              <RoomDescription>
                <ArrowRightIcon /> Mô tả: {roomDescription}
              </RoomDescription>
              <p className="tip">
                <LightbulbIcon />
                Tính năng chia sẻ liên kết sẽ sớm có mặt 😄
              </p>
            </Wrapper>
          )}
          {showControlGuide && (
            <Wrapper>
              <Title>Hướng dẫn điều khiển</Title>
              <IconButton className="close" onClick={() => setShowControlGuide(false)} size="small">
                <CloseIcon />
              </IconButton>
              <ul>
                <li>
                  <strong>Chuột trái (kéo vẽ)</strong> để vung đũa vẽ bùa phép Hogwarts (Lumos, Incendio, Protego, Expelliarmus, Wingardium, Patronus)
                </li>
                <li>
                  <strong>F</strong> để mở Mạng Lưới Lò Sưởi Floo & Di chuyển giữa 4 Phòng Sinh Hoạt Chung
                </li>
                <li>
                  <strong>L</strong> để mở Bảng Thả Thiên Đăng Ước Nguyện Trung Thu (chọn màu đèn, điều ước bí mật hoặc gửi riêng cho bạn bè)
                </li>
                <li>
                  <strong>B</strong> để mở Sách Thần Chú & Cử Chỉ Vung Đũa
                </li>
                <li>
                  <strong>M</strong> để mở Bản Đồ Đạo Tặc Hogwarts
                </li>
                <li>
                  <strong>W, A, S, D hoặc phím mũi tên</strong> để di chuyển
                </li>
                <li>
                  <strong>E</strong> để ngồi xuống hoặc đứng dậy khi cạnh ghế
                </li>
                <li>
                  <strong>Enter</strong> để mở khung chat
                </li>
                <li>
                  <strong>H</strong> để vẫy tay với người ở gần
                </li>
                <li>
                  <strong>Chat gần</strong> để gửi tin nhắn cho người ở trong tầm
                </li>
                <li>
                  <strong>ESC</strong> để đóng chat hoặc đóng bảng thông tin
                </li>
              </ul>
              <p className="tip">
                <LightbulbIcon />
                Nhấn phím L để thả thiên đăng Trung Thu bất cứ lúc nào!
              </p>
            </Wrapper>
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
          {roomJoined && (
            <>
              <Tooltip title="Thông tin phòng">
                <StyledFab
                  size="small"
                  onClick={() => {
                    setShowRoomInfo(!showRoomInfo)
                    setShowControlGuide(false)
                  }}
                >
                  <ShareIcon />
                </StyledFab>
              </Tooltip>
              <Tooltip title="Hướng dẫn điều khiển">
                <StyledFab
                  size="small"
                  onClick={() => {
                    setShowControlGuide(!showControlGuide)
                    setShowRoomInfo(false)
                  }}
                >
                  <HelpOutlineIcon />
                </StyledFab>
              </Tooltip>
            </>
          )}
          <Tooltip title="Mã nguồn SkyOffice">
            <StyledFab
              size="small"
              href="https://github.com/kevinshen56714/SkyOffice"
              target="_blank"
            >
              <GitHubIcon />
            </StyledFab>
          </Tooltip>
          <Tooltip title="Theo dõi SkyOffice trên X">
            <StyledFab size="small" href="https://twitter.com/SkyOfficeApp" target="_blank">
              <TwitterIcon />
            </StyledFab>
          </Tooltip>

          <Tooltip title="Đổi giao diện ngày/đêm">
            <StyledFab size="small" onClick={() => dispatch(toggleBackgroundMode())}>
              {backgroundMode === BackgroundMode.DAY ? <DarkModeIcon /> : <LightModeIcon />}
            </StyledFab>
          </Tooltip>
        </ButtonGroup>
      </DesktopBackdrop>
    </>
  )
}
