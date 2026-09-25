import React, { useEffect, useState } from 'react'
import logo from '../images/logo.png'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { CustomRoomTable } from './CustomRoomTable'
import { CreateRoomForm } from './CreateRoomForm'
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

const CustomRoomWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;

  .tip {
    font-size: 18px;
  }
`

const TitleWrapper = styled.div`
  display: grid;
  width: 100%;

  .back-button {
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
    align-self: center;
  }

  h1 {
    grid-column: 1;
    grid-row: 1;
    justify-self: center;
    align-self: center;
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
  const [showCustomRoom, setShowCustomRoom] = useState(false)
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false)
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
          // overwrites the dark theme on render
          style={{ background: '#fdeded', color: '#7d4747' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Backdrop>
        <Wrapper>
          {showCreateRoomForm ? (
            <CustomRoomWrapper>
              <TitleWrapper>
                <IconButton className="back-button" onClick={() => setShowCreateRoomForm(false)}>
                  <ArrowBackIcon />
                </IconButton>
                <Title>Tạo phòng riêng</Title>
              </TitleWrapper>
              <CreateRoomForm />
            </CustomRoomWrapper>
          ) : showCustomRoom ? (
            <CustomRoomWrapper>
              <TitleWrapper>
                <IconButton className="back-button" onClick={() => setShowCustomRoom(false)}>
                  <ArrowBackIcon />
                </IconButton>
                <Title>
                  Phòng riêng
                  <Tooltip
                    title="Danh sách phòng được cập nhật trực tiếp, không cần tải lại."
                    placement="top"
                  >
                    <IconButton>
                      <HelpOutlineIcon className="tip" />
                    </IconButton>
                  </Tooltip>
                </Title>
              </TitleWrapper>
              <CustomRoomTable />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowCreateRoomForm(true)}
              >
                Tạo phòng mới
              </Button>
            </CustomRoomWrapper>
          ) : (
            <>
              <Title>Hogwarts SkyOffice</Title>
              <Content>
                <img src={logo} alt="logo" />
                <Button variant="contained" color="secondary" onClick={handleConnect} disabled={connecting}>
                  {connecting ? 'Đang vào phòng…' : 'Vào Đại Sảnh công khai'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => (lobbyJoined ? setShowCustomRoom(true) : setShowSnackbar(true))}
                >
                  Tạo hoặc tìm phòng riêng
                </Button>
              </Content>
            </>
          )}
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
