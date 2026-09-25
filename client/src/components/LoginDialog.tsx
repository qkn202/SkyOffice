import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'
import { useAppSelector, useAppDispatch } from '../hooks'
import { setAssignedHouse, setCurrentPlayerName, setLoggedIn, setHpvnProfile } from '../stores/UserStore'
import { getAvatarString, getColorByString } from '../util'
import { getHouseBadge } from '../utils/houseBadge'
import {
  signInHPVN,
  signOutHPVN,
  fetchFlooUserProfile,
  FlooUserProfile,
} from '../services/flooFirebase'

import phaserGame from '../PhaserGame'
import type Game from '../scenes/Game'
import { HOUSES } from '../utils/houseOutfits'

const Wrapper = styled.form`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1e2235;
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 16px;
  padding: 30px 48px;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.6);
  max-width: 95vw;
  max-height: 92vh;
  overflow-y: auto;
  color: #eee;

  @media (max-width: 650px) {
    box-sizing: border-box;
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
    max-height: calc(100dvh - 24px);
    padding: 22px 18px;
  }
`

const Title = styled.p`
  margin: 5px;
  font-size: 20px;
  color: #ffd875;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.5px;
`

const RoomName = styled.div`
  max-width: 500px;
  max-height: 120px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;

  h3 {
    font-size: 22px;
    color: #eee;
  }
`

const RoomDescription = styled.div`
  max-width: 500px;
  max-height: 150px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  font-size: 14px;
  color: #c2c2c2;
  display: flex;
  justify-content: center;
  margin-top: 4px;
`

const SubTitle = styled.h3`
  width: 100%;
  font-size: 15px;
  color: #ffd875;
  text-align: center;
  margin-bottom: 10px;
`

const Content = styled.div`
  display: flex;
  width: 100%;
  margin: 24px 0 20px 0;
  gap: 36px;
  align-items: flex-start;

  @media (max-width: 650px) {
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .carousel-wrapper {
    position: relative;
    width: 172px;
  }

  .swiper {
    width: 172px;
    height: 236px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 215, 0, 0.35);
    background: linear-gradient(180deg, #2b3048 0%, #1a1e32 100%);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .swiper-slide {
    width: 172px;
    height: 236px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
    user-select: none;
  }

  .swiper-slide img {
    display: block;
    width: 95px;
    height: 136px;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
    transition: transform 0.25s ease;
  }

  .char-title {
    color: #ffd700;
    font-size: 14px;
    font-weight: 700;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    letter-spacing: 0.3px;
  }

  .char-subtitle {
    font-size: 11px;
    font-weight: 500;
    margin-top: 2px;
    opacity: 0.95;
  }

  .char-counter {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 10px;
    font-weight: 600;
    color: #ffd875;
    background: rgba(0, 0, 0, 0.6);
    padding: 2px 7px;
    border-radius: 10px;
    border: 1px solid rgba(255, 215, 0, 0.25);
    z-index: 10;
  }
`

const NavArrowButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 45%;
  ${(props) => (props.$direction === 'left' ? 'left: -14px;' : 'right: -14px;')}
  transform: translateY(-50%);
  z-index: 30;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #181c2e;
  border: 1.5px solid #ffd875;
  color: #ffd875;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px rgba(255, 216, 117, 0.4);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: #ffd875;
    color: #141724;
    transform: translateY(-50%) scale(1.15);
    box-shadow: 0 0 16px rgba(255, 216, 117, 0.8);
  }

  &:active {
    transform: translateY(-50%) scale(0.92);
  }
`

const ThumbnailRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  width: 172px;
`

const ThumbItem = styled.button<{ $active: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${(props) => (props.$active ? 'rgba(255, 216, 117, 0.25)' : 'rgba(255, 255, 255, 0.05)')};
  border: 1.5px solid ${(props) => (props.$active ? '#ffd875' : 'rgba(255, 255, 255, 0.15)')};
  padding: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${(props) => (props.$active ? '0 0 10px rgba(255, 216, 117, 0.5)' : 'none')};

  &:hover {
    border-color: #ffd875;
    transform: translateY(-2px);
  }

  img {
    width: 22px;
    height: 28px;
    object-fit: contain;
  }
`

const Right = styled.div`
  width: min(320px, 100%);
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
  background: #141724;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  gap: 4px;
`

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${(props) => (props.$active ? 'rgba(255, 216, 117, 0.15)' : 'transparent')};
  color: ${(props) => (props.$active ? '#ffd875' : '#94a3b8')};
  border: ${(props) =>
    props.$active ? '1px solid rgba(255, 216, 117, 0.4)' : '1px solid transparent'};

  &:hover {
    color: #fff;
  }
`

const HpvnProfileCard = styled.div<{ $houseColor: string }>`
  background: rgba(20, 23, 36, 0.9);
  border: 1px solid ${(props) => props.$houseColor || '#ffd875'};
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .badge-tag {
    font-size: 20px;
  }

  .name {
    font-size: 16px;
    font-weight: 700;
    color: #ffd875;
  }

  .house-title {
    font-size: 12px;
    font-weight: 600;
    color: ${(props) => props.$houseColor || '#ffd875'};
  }

  .tag {
    font-size: 11px;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.06);
    padding: 2px 6px;
    border-radius: 4px;
    width: fit-content;
  }
`

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`

const avatars = [
  {
    name: 'adam',
    title: 'Adam',
    subtitle: 'Nam sinh · Gryffindor',
    badge: '🦁',
    color: '#ff6b6b',
    img: Adam,
  },
  {
    name: 'ash',
    title: 'Ash',
    subtitle: 'Nam sinh · Slytherin',
    badge: '🐍',
    color: '#2ecc71',
    img: Ash,
  },
  {
    name: 'lucy',
    title: 'Lucy',
    subtitle: 'Nữ sinh · Ravenclaw',
    badge: '🦅',
    color: '#4dabf7',
    img: Lucy,
  },
  {
    name: 'nancy',
    title: 'Nancy',
    subtitle: 'Nữ sinh · Hufflepuff',
    badge: '🦡',
    color: '#ffd43b',
    img: Nancy,
  },
]

export default function LoginDialog() {
  const [loginMode, setLoginMode] = useState<'hpvn' | 'guest'>('hpvn')
  const [name, setName] = useState<string>('')
  const [avatarIndex, setAvatarIndex] = useState<number>(0)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const [nameFieldEmpty, setNameFieldEmpty] = useState<boolean>(false)

  const handlePrevAvatar = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev()
    } else {
      setAvatarIndex((prev) => (prev > 0 ? prev - 1 : avatars.length - 1))
    }
  }

  const handleNextAvatar = () => {
    if (swiperInstance) {
      swiperInstance.slideNext()
    } else {
      setAvatarIndex((prev) => (prev < avatars.length - 1 ? prev + 1 : 0))
    }
  }

  // HPVN auth states
  const [hpvnAccount, setHpvnAccount] = useState<string>('')
  const [hpvnPassword, setHpvnPassword] = useState<string>('')
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [activeProfile, setActiveProfile] = useState<FlooUserProfile | null>(null)

  const dispatch = useAppDispatch()
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const roomName = useAppSelector((state) => state.room.roomName)
  const roomDescription = useAppSelector((state) => state.room.roomDescription)
  const game = phaserGame.scene.keys.game as Game

  // Restore saved login profile on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hpvn_skyoffice_profile')
      if (saved) {
        const parsed: FlooUserProfile = JSON.parse(saved)
        if (parsed && parsed.username) {
          setActiveProfile(parsed)
          setName(parsed.username)
          setLoginMode('hpvn')
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved HPVN profile', e)
    }
  }, [])

  const handleHpvnLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const acc = hpvnAccount.trim()
    if (!acc || !hpvnPassword) {
      setAuthError('Vui lòng nhập tài khoản và mật khẩu HPVN!')
      return
    }

    setIsAuthenticating(true)
    setAuthError(null)

    try {
      const user = await signInHPVN(acc, hpvnPassword)
      const profile = await fetchFlooUserProfile(user.uid)
      const fullProfile: FlooUserProfile = profile || {
        uid: user.uid,
        username: user.displayName || acc,
        house: 'NONE',
      }

      setActiveProfile(fullProfile)
      setName(fullProfile.username)
      localStorage.setItem('hpvn_skyoffice_profile', JSON.stringify(fullProfile))
      setHpvnPassword('')
    } catch (err: any) {
      console.error('HPVN Login error:', err)
      let msg = err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!'
      if (msg.includes('auth/invalid-credential') || msg.includes('401') || msg.includes('Sai account')) {
        msg = 'Sai tài khoản hoặc mật khẩu HPVN!'
      }
      setAuthError(msg)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleHpvnSignOut = async () => {
    try {
      await signOutHPVN()
    } catch {}
    setActiveProfile(null)
    setName('')
    localStorage.removeItem('hpvn_skyoffice_profile')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let finalName = name.trim()
    if (loginMode === 'hpvn' && activeProfile) {
      const houseInfo = getHouseBadge(activeProfile.house)
      finalName = `[${houseInfo.badge}] ${activeProfile.username}`
    }

    if (!finalName) {
      setNameFieldEmpty(true)
      return
    }

    if (roomJoined) {
      console.log('Join SkyOffice! Name:', finalName, 'Avatar:', avatars[avatarIndex].name)
      dispatch(setCurrentPlayerName(finalName))
      game.registerKeys()
      game.myPlayer.setPlayerName(finalName)
      game.myPlayer.setPlayerTexture(avatars[avatarIndex].name)
      const house = HOUSES.find((candidate) => candidate === activeProfile?.house.toUpperCase()) || ''
      dispatch(setAssignedHouse(house))
      if (house) game.myPlayer.setHouse(house, game.network)
      else game.network.updatePlayerAppearance('', avatars[avatarIndex].name)
      game.network.readyToConnect()

      if (activeProfile) {
        dispatch(
          setHpvnProfile({
            uid: activeProfile.uid,
            username: activeProfile.username,
            house: activeProfile.house,
            userTag: activeProfile.userTag,
          })
        )
      }
      dispatch(setLoggedIn(true))
    }
  }

  const houseStyle = activeProfile ? getHouseBadge(activeProfile.house) : null

  return (
    <Wrapper onSubmit={handleSubmit}>
      <Title>Hogwarts SkyOffice</Title>
      <RoomName>
        <Avatar style={{ background: getColorByString(roomName) }}>
          {getAvatarString(roomName)}
        </Avatar>
        <h3>{roomName}</h3>
      </RoomName>
      <RoomDescription>
        <ArrowRightIcon /> {roomDescription}
      </RoomDescription>

      <Content>
        <Left>
          <SubTitle>Chọn Ngoại Hình</SubTitle>
          <div className="carousel-wrapper">
            <NavArrowButton
              type="button"
              $direction="left"
              onClick={handlePrevAvatar}
              aria-label="Ngoại hình trước"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </NavArrowButton>

            <NavArrowButton
              type="button"
              $direction="right"
              onClick={handleNextAvatar}
              aria-label="Ngoại hình tiếp theo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </NavArrowButton>

            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => {
                setAvatarIndex(swiper.activeIndex)
              }}
            >
              {avatars.map((avatar, idx) => (
                <SwiperSlide key={avatar.name}>
                  <div className="char-counter">{idx + 1}/{avatars.length}</div>
                  <img src={avatar.img} alt={avatar.name} />
                  <div className="char-title">
                    <span>{avatar.badge}</span>
                    <span>{avatar.title}</span>
                  </div>
                  <div className="char-subtitle" style={{ color: avatar.color }}>
                    {avatar.subtitle}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <ThumbnailRow>
            {avatars.map((avatar, idx) => (
              <ThumbItem
                key={avatar.name}
                type="button"
                $active={avatarIndex === idx}
                onClick={() => {
                  setAvatarIndex(idx)
                  swiperInstance?.slideTo(idx)
                }}
                title={`${avatar.title} (${avatar.subtitle})`}
              >
                <img src={avatar.img} alt={avatar.name} />
              </ThumbItem>
            ))}
          </ThumbnailRow>
        </Left>

        <Right>
          <TabContainer>
            <TabButton
              type="button"
              $active={loginMode === 'hpvn'}
              onClick={() => setLoginMode('hpvn')}
            >
              <WhatshotIcon fontSize="small" />
              Tài Khoản HPVN
            </TabButton>
            <TabButton
              type="button"
              $active={loginMode === 'guest'}
              onClick={() => setLoginMode('guest')}
            >
              <PersonIcon fontSize="small" />
              Vào Tự Do (Khách)
            </TabButton>
          </TabContainer>

          {loginMode === 'hpvn' ? (
            activeProfile ? (
              <HpvnProfileCard $houseColor={houseStyle?.color || '#ffd875'}>
                <div className="header">
                  <div className="badge-tag">{houseStyle?.badge}</div>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={handleHpvnSignOut}
                    startIcon={<LogoutIcon fontSize="small" />}
                    sx={{ textTransform: 'none', color: '#94a3b8', fontSize: '11px' }}
                  >
                    Đổi tài khoản
                  </Button>
                </div>
                <div className="name">{activeProfile.username}</div>
                <div className="house-title">
                  Nhà {houseStyle?.name} · {houseStyle?.badge}
                </div>
                {activeProfile.userTag && (
                  <div className="tag">{activeProfile.userTag}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#34d399', marginTop: '4px' }}>
                  <CheckCircleIcon fontSize="inherit" /> Đã kết nối Mạng Floo HPVN
                </div>
              </HpvnProfileCard>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tài khoản hoặc Email HPVN"
                  variant="outlined"
                  color="secondary"
                  value={hpvnAccount}
                  onChange={(e) => setHpvnAccount(e.target.value)}
                  sx={{ input: { color: '#fff' } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  label="Mật khẩu HPVN"
                  variant="outlined"
                  color="secondary"
                  value={hpvnPassword}
                  onChange={(e) => setHpvnPassword(e.target.value)}
                  sx={{ input: { color: '#fff' } }}
                />
                {authError && (
                  <Alert severity="error" sx={{ py: 0, px: 1, fontSize: '12px' }}>
                    {authError}
                  </Alert>
                )}
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleHpvnLogin}
                  disabled={isAuthenticating}
                  sx={{ textTransform: 'none', borderColor: '#ffd875', color: '#ffd875', '&:hover': { borderColor: '#fff', color: '#fff' } }}
                >
                  {isAuthenticating ? (
                    <CircularProgress size={20} sx={{ color: '#ffd875' }} />
                  ) : (
                    'Xác Thực Tài Khoản'
                  )}
                </Button>
              </div>
            )
          ) : (
            <TextField
              autoFocus
              fullWidth
              label="Tên hiển thị"
              variant="outlined"
              color="secondary"
              error={nameFieldEmpty}
              helperText={nameFieldEmpty && 'Vui lòng nhập tên của bạn'}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setNameFieldEmpty(false)
              }}
              sx={{ input: { color: '#fff' } }}
            />
          )}
        </Right>
      </Content>

      <Bottom>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          type="submit"
          disabled={loginMode === 'hpvn' && !activeProfile && !name}
          sx={{
            px: 4,
            py: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
          }}
        >
          {activeProfile ? `Tham Gia Với Tư Cách ${activeProfile.username}` : 'Tham Gia Phòng'}
        </Button>
      </Bottom>
    </Wrapper>
  )
}
