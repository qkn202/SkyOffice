import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import phaserGame from '../PhaserGame'

type InteractType = 'stand' | 'chair' | 'computer' | 'whiteboard' | null

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 24px rgba(255, 215, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.6);
  }
  100% {
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.5);
  }
`

const Container = styled.div`
  position: fixed;
  bottom: 112px;
  right: 16px;
  z-index: 2500;
  pointer-events: auto;
  touch-action: manipulation;

  @media (min-width: 769px) {
    display: none;
  }
`

const ActionButton = styled.button<{ $type: InteractType }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 30px;
  background: ${(props) =>
    props.$type === 'stand'
      ? 'linear-gradient(135deg, #c0392b 0%, #8e1b1b 100%)'
      : props.$type === 'computer'
      ? 'linear-gradient(135deg, #2980b9 0%, #1a5276 100%)'
      : props.$type === 'whiteboard'
      ? 'linear-gradient(135deg, #27ae60 0%, #196f3d 100%)'
      : 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)'};
  border: 2px solid #ffd700;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  animation: ${pulseGlow} 2s infinite ease-in-out;
  transition: transform 0.1s ease;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  &:active {
    transform: scale(0.92);
  }

  .icon {
    font-size: 20px;
  }

  .label {
    letter-spacing: 0.3px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  }
`

export default function MobileActionPad() {
  const [interactType, setInteractType] = useState<InteractType>(null)

  useEffect(() => {
    const handleInteractChange = (e: Event) => {
      const detail = (e as CustomEvent<InteractType>).detail
      setInteractType(detail)
    }

    window.addEventListener('skyoffice:interact-changed', handleInteractChange)
    return () => {
      window.removeEventListener('skyoffice:interact-changed', handleInteractChange)
    }
  }, [])

  if (!interactType) return null

  const getDetails = () => {
    switch (interactType) {
      case 'stand':
        return { icon: '⬆️', label: 'Đứng dậy' }
      case 'chair':
        return { icon: '🪑', label: 'Ngồi ghế' }
      case 'computer':
        return { icon: '💻', label: 'Mở máy tính' }
      case 'whiteboard':
        return { icon: '📋', label: 'Mở bảng' }
      default:
        return { icon: '⚡', label: 'Tương tác' }
    }
  }

  const { icon, label } = getDetails()

  const handleTrigger = () => {
    const game = phaserGame.scene.keys.game as any
    game?.myPlayer?.triggerAction()
  }

  return (
    <Container>
      <ActionButton $type={interactType} onClick={handleTrigger} aria-label={label}>
        <span className="icon">{icon}</span>
        <span className="label">{label}</span>
      </ActionButton>
    </Container>
  )
}
