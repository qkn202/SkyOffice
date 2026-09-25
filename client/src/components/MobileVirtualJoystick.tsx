import React from 'react'
import styled from 'styled-components'
import JoystickItem, { JoystickMovement } from './Joystick'

import phaserGame from '../PhaserGame'
import type Game from '../scenes/Game'
import { useAppSelector } from '../hooks'

const Container = styled.div`
  position: fixed;
  bottom: 22px;
  left: 20px;
  z-index: 2500;
  pointer-events: auto;
  touch-action: none;

  @media (min-width: 769px) {
    bottom: 28px;
    left: 28px;
  }
`

export default function MobileVirtualJoystick() {
  const showJoystick = useAppSelector((state) => state.user.showJoystick)
  const game = phaserGame.scene.keys.game as Game | undefined

  if (!showJoystick) return null

  const handleMovement = (movement: JoystickMovement) => {
    game?.myPlayer?.handleJoystickMovement(movement)
  }

  return (
    <Container>
      <JoystickItem onDirectionChange={handleMovement} size={102} />
    </Container>
  )
}
