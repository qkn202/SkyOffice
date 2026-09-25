import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'

import { useAppDispatch, useAppSelector } from '../hooks'
import { setFocused, setShowChat } from '../stores/ChatStore'

const Backdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 60px;
  left: 0;
  height: ${(props) => (props.$isOpen ? '480px' : 'auto')};
  width: ${(props) => (props.$isOpen ? '480px' : 'auto')};
  max-height: 65vh;
  max-width: calc(100vw - 32px);
  z-index: 100;
`

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
`

const FabWrapper = styled.div`
  margin-top: auto;
`

const ChatHeader = styled.div`
  position: relative;
  height: 38px;
  background: #141724;
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px 12px 0px 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 14px;
  color: #fff;

  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title {
    font-size: 14px;
    font-weight: 700;
    color: #ffd875;
    letter-spacing: 0.5px;
  }

  .live-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(42, 19, 64, 0.8);
    border: 1px solid rgba(255, 216, 117, 0.3);
    font-size: 10px;
    font-family: monospace;
    color: #ffd875;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #34d399;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`

const ChatBox = styled.div`
  flex: 1;
  width: 100%;
  height: calc(100% - 38px);
  background: #0f172a;
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-top: none;
  border-radius: 0px 0px 12px 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #0a0312;
    display: block;
  }
`

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #12061c;
  color: #ffd875;
  gap: 12px;
  z-index: 5;
  font-size: 13px;
`

export default function Chat() {
  const [isLoading, setIsLoading] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const dispatch = useAppDispatch()

  const handleClose = () => {
    dispatch(setShowChat(false))
    dispatch(setFocused(false))
  }

  const handleOpen = () => {
    dispatch(setShowChat(true))
    dispatch(setFocused(true))
  }

  const handleReload = () => {
    setIsLoading(true)
    setIframeKey((prev) => prev + 1)
  }

  // Handle ESC key globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showChat) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showChat])

  // Sync key lock when showChat changes
  useEffect(() => {
    if (showChat) {
      dispatch(setFocused(true))
    }
  }, [showChat, dispatch])

  return (
    <Backdrop $isOpen={showChat}>
      <Wrapper>
        {showChat ? (
          <>
            <ChatHeader>
              <div className="title-group">
                <span className="title">Mạng Floo · Chat HPVN</span>
                <span className="live-tag">
                  <span className="live-dot" />
                  Live
                </span>
              </div>
              <div className="actions">
                <Tooltip title="Tải lại Mạng Floo">
                  <IconButton
                    aria-label="reload chat"
                    onClick={handleReload}
                    size="small"
                    sx={{ color: '#ffd875', padding: '4px', '&:hover': { color: '#fff' } }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Đóng chat (ESC)">
                  <IconButton
                    aria-label="close chat"
                    onClick={handleClose}
                    size="small"
                    sx={{ color: '#ffd875', padding: '4px', '&:hover': { color: '#fff' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </ChatHeader>
            <ChatBox>
              {isLoading && (
                <LoadingOverlay>
                  <CircularProgress size={28} sx={{ color: '#ffd875' }} />
                  <span>Đang kết nối Mạng Floo...</span>
                </LoadingOverlay>
              )}
              <iframe
                key={iframeKey}
                src="/api/floo-embed"
                title="Mạng Floo HPVN Shoutbox"
                allow="clipboard-write; autoplay; fullscreen"
                onLoad={() => setIsLoading(false)}
              />
            </ChatBox>
          </>
        ) : (
          <FabWrapper>
            <Tooltip title="Mở Chat Mạng Floo (Nhấn Enter)">
              <Fab
                color="secondary"
                aria-label="showChat"
                onClick={handleOpen}
              >
                <ChatBubbleOutlineIcon />
              </Fab>
            </Tooltip>
          </FabWrapper>
        )}
      </Wrapper>
    </Backdrop>
  )
}
