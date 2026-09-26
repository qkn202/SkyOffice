import React, { useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useAppSelector } from '../hooks'
import phaserGame from '../PhaserGame'
import type Game from '../scenes/Game'

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 6000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(14, 10, 6, 0.78);
  backdrop-filter: blur(8px);
  padding: 12px;
`

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1080px;
  height: 90vh;
  background: #fbf4ea;
  border: 3px solid #8a5a3b;
  border-radius: 20px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.75), 0 0 35px rgba(229, 169, 59, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  background: linear-gradient(90deg, #2c1a0e, #3a2211, #2c1a0e);
  border-bottom: 2px solid #8a5a3b;
  color: #fff;

  .title-group {
    display: flex;
    align-items: center;
    gap: 10px;

    .icon {
      font-size: 24px;
    }

    h2 {
      margin: 0;
      font-family: 'Baloo 2', 'Georgia', serif;
      font-size: 17px;
      font-weight: 800;
      color: #ffd875;
      letter-spacing: 0.5px;
    }

    .subtitle {
      font-size: 11px;
      color: #dfba86;
      margin: 0;
    }
  }

  .actions-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

const PopOutLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ef6f8e, #c24c69);
  color: #fff !important;
  text-decoration: none;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(239, 111, 142, 0.4);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 111, 142, 0.5);
  }
`

const IframeContent = styled.iframe`
  width: 100%;
  flex: 1;
  border: 0;
  background: #fbf4ea;
`

export default function BobaTeaShopModal({ onClose }: { onClose: () => void }) {
  const user = useAppSelector((state) => state.user)
  const playerName = user.currentPlayerName || user.hpvnProfile?.username || 'Bạn'
  const house = user.assignedHouse || user.hpvnProfile?.house || 'gryffindor'
  
  const launchUrl = `/tiem-tra-nho/?name=${encodeURIComponent(playerName)}&house=${encodeURIComponent(house)}&v=2`

  // Lắng nghe sự kiện từ Iframe khi Barista giao nước, khách order hoặc viết review
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const game = phaserGame.scene.keys.game as Game | undefined
      if (!game || !game.myPlayer) return

      if (event.data?.type === 'BOBA_DRINK_SERVED') {
        const { drinkName, customerName, earning, tip, isPlayerOrder } = event.data
        if (isPlayerOrder) {
          game.network.addChatMessage(
            `vừa nhận được 1 ly [${drinkName}] béo ngậy do chính mình order tại Tiệm Trà Nhỏ! 🧋😋`
          )
        } else {
          game.network.addChatMessage(
            `vừa tự tay pha xong 1 ly [${drinkName}] cho ${customerName}! 🧋✨ (+${earning + tip} Galleons)`
          )
        }
      } else if (event.data?.type === 'BOBA_ORDER_PLACED') {
        const { drinkName, size, note } = event.data
        game.network.addChatMessage(
          `vừa gọi 1 ly [${drinkName} (${size})] tại Tiệm Trà Nhỏ: "${note || 'Pha ngon giúp tớ nhé!'}" 🧋`
        )
      } else if (event.data?.type === 'BOBA_REVIEW_SUBMITTED') {
        const { rating, drink, comment, tip } = event.data
        game.network.addChatMessage(
          `vừa chấm ${rating}⭐ cho [${drink}] trong Sổ Lưu Niệm: "${comment}" ${tip > 0 ? `(+tip ${tip}G)` : ''} 🌟`
        )
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <HeaderBar>
          <div className="title-group">
            <span className="icon">🧋</span>
            <div>
              <h2>Tiệm Trà Nhỏ Hogwarts · Pha Chế Thủ Công & Lập Menu</h2>
              <p className="subtitle">
                Đang trực ca: <strong>{playerName}</strong> ({house.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="actions-group">
            <PopOutLink href={launchUrl} target="_blank" rel="noopener noreferrer">
              <OpenInNewIcon style={{ fontSize: 15 }} />
              Mở Tab Riêng Toàn Màn Hình ↗
            </PopOutLink>
            <IconButton onClick={onClose} size="small" style={{ color: '#dfba86' }}>
              <CloseIcon />
            </IconButton>
          </div>
        </HeaderBar>

        <IframeContent
          title="Tiệm Trà Nhỏ Hogwarts"
          src={launchUrl}
          allow="autoplay; clipboard-write"
        />
      </ModalContainer>
    </ModalOverlay>
  )
}
