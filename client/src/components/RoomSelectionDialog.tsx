import React, { useEffect, useState } from 'react'
import logo from '../images/logo.png'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

import { useAppSelector } from '../hooks'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

const Backdrop = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center;
`

const Wrapper = styled.div`
  box-sizing: border-box;
  width: min(520px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  overflow: auto;
  background: #222639;
  border-radius: 16px;
  padding: 36px 48px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 215, 0, 0.25);

  @media (max-width: 650px) {
    padding: 24px 18px;
  }
`

const Title = styled.h1`
  font-size: 26px;
  color: #ffd700;
  text-align: center;
  font-family: 'Cinzel', serif, Georgia;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: #a0a0c0;
  text-align: center;
  margin: 0 0 20px 0;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 10px 0;
  align-items: center;
  justify-content: center;

  img {
    border-radius: 12px;
    height: 120px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }
`

const EnterButton = styled(Button)`
  && {
    width: 100%;
    max-width: 320px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 700;
    border-radius: 10px;
    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
    text-transform: none;

    &:hover {
      background: linear-gradient(135deg, #6d28d9 0%, #4338ca 100%);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
    }
  }
`

const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(460px, calc(100vw - 32px));
  text-align: center;

  h3 {
    color: #33ac96;
  }
`

const ProgressBar = styled(LinearProgress)`
  width: min(360px, calc(100vw - 48px));
`

export default function RoomSelectionDialog() {
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connectionTimedOut, setConnectionTimedOut] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Chưa kết nối được máy chủ. Vui lòng chờ một chút rồi thử lại.')
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)
  const connectionError = useAppSelector((state) => state.room.lobbyConnectionError)

  useEffect(() => {
    if (lobbyJoined) {
      setConnectionTimedOut(false)
      return
    }
    const timeout = window.setTimeout(() => setConnectionTimedOut(true), 12_000)
    return () => window.clearTimeout(timeout)
  }, [lobbyJoined])

  const handleConnect = async () => {
    const bootstrap = ((window as any).game?.scene?.keys?.bootstrap ||
      phaserGame?.scene?.keys?.bootstrap) as Bootstrap | undefined
    if (!bootstrap?.network) {
      setSnackbarMessage('Đang khởi tạo hệ thống đồ họa và mạng. Vui lòng thử lại sau giây lát…')
      setShowSnackbar(true)
      return
    }
    setConnecting(true)
    try {
      await bootstrap.network.joinOrCreatePublic()
      bootstrap.launchGame()
    } catch (error: any) {
      console.error('Lỗi kết nối phòng công khai:', error)
      setSnackbarMessage(`Lỗi kết nối máy chủ: ${error?.message || 'Chưa thể vào phòng'}`)
      setShowSnackbar(true)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => {
          setShowSnackbar(false)
        }}
      >
        <Alert
          severity="error"
          variant="outlined"
          style={{ background: '#fdeded', color: '#7d4747' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Backdrop>
        <Wrapper>
          <Title>Hogwarts SkyOffice</Title>
          <Subtitle>Không gian học tập & nhập vai thế giới mở Hogwarts</Subtitle>
          <Content>
            <img src={logo} alt="logo" />
            <EnterButton
              variant="contained"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? 'Đang vào phòng…' : 'Vào Đại Sảnh Hogwarts'}
            </EnterButton>
          </Content>
        </Wrapper>
        {!lobbyJoined && (
          <ProgressBarWrapper>
            <h3 role="status">{connectionError || (connectionTimedOut ? 'Máy chủ chưa phản hồi' : 'Đang kết nối máy chủ…')}</h3>
            {connectionTimedOut || connectionError ? (
              <Button size="small" variant="contained" color="secondary" onClick={() => {
                const bootstrap = ((window as any).game?.scene?.keys?.bootstrap ||
                  phaserGame?.scene?.keys?.bootstrap) as Bootstrap | undefined
                bootstrap?.network?.retryLobbyConnection()
              }}>
                Thử kết nối lại
              </Button>
            ) : (
              <ProgressBar color="secondary" />
            )}
          </ProgressBarWrapper>
        )}
      </Backdrop>
    </>
  )
}
