import React, { useState } from 'react'
import logo from '../images/logo.png'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

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
  width: min(650px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  overflow: auto;
  background: #222639;
  border-radius: 16px;
  padding: 36px 60px;
  box-shadow: 0px 0px 5px #0000006f;

  @media (max-width: 650px) {
    padding: 24px 18px;
  }
`

const Title = styled.h1`
  font-size: 24px;
  color: #eee;
  text-align: center;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
  align-items: center;
  justify-content: center;

  @media (max-width: 650px) {
    flex-direction: column;
    gap: 18px;
  }

  img {
    border-radius: 8px;
    height: 120px;
  }
`

export default function RoomSelectionDialog() {
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Chưa kết nối được máy chủ. Vui lòng chờ một chút rồi thử lại.')

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
          // overwrites the dark theme on render
          style={{ background: '#fdeded', color: '#7d4747' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Backdrop>
        <Wrapper>
          <Title>Hogwarts SkyOffice</Title>
          <Content>
            <img src={logo} alt="logo" />
            <Button variant="contained" color="secondary" onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Đang vào Đại Sảnh…' : 'Vào Đại Sảnh chung'}
            </Button>
          </Content>
        </Wrapper>
      </Backdrop>
    </>
  )
}
