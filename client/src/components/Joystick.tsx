import React, { useRef, useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'

export interface JoystickMovement {
  isMoving: boolean
  direction: Direction
}

export interface Direction {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
}

interface Props {
  onDirectionChange: (arg: JoystickMovement) => void
  size?: number
}

const BaseCircle = styled.div<{ $size: number }>`
  position: relative;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(32, 24, 58, 0.92) 0%, rgba(14, 10, 28, 0.96) 100%);
  border: 2.5px solid rgba(255, 215, 0, 0.85);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.45),
    inset 0 0 16px rgba(255, 215, 0, 0.18),
    0 8px 32px rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`

const DirectionArrow = styled.span<{ $pos: 'top' | 'bottom' | 'left' | 'right' }>`
  position: absolute;
  font-size: 11px;
  color: rgba(255, 215, 0, 0.65);
  font-weight: 900;
  pointer-events: none;
  user-select: none;
  line-height: 1;

  ${(props) => props.$pos === 'top' && 'top: 6px; left: 50%; transform: translateX(-50%);'}
  ${(props) => props.$pos === 'bottom' && 'bottom: 6px; left: 50%; transform: translateX(-50%);'}
  ${(props) => props.$pos === 'left' && 'left: 6px; top: 50%; transform: translateY(-50%);'}
  ${(props) => props.$pos === 'right' && 'right: 6px; top: 50%; transform: translateY(-50%);'}
`

const StickKnob = styled.div<{ $x: number; $y: number; $stickSize: number; $isDragging: boolean }>`
  position: absolute;
  width: ${(props) => props.$stickSize}px;
  height: ${(props) => props.$stickSize}px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffde8 0%, #ffd700 50%, #c99316 100%);
  border: 2px solid #ffffff;
  box-shadow: 
    0 4px 14px rgba(0, 0, 0, 0.6),
    0 0 12px rgba(255, 215, 0, 0.9),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  transform: translate3d(${(props) => props.$x}px, ${(props) => props.$y}px, 0);
  transition: ${(props) => (props.$isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)')};
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  &::after {
    content: '✦';
    font-size: 13px;
    color: #5c3d06;
    font-weight: 900;
    opacity: 0.85;
  }
`

const JoystickBadge = styled.div`
  margin-top: 6px;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(14, 10, 28, 0.85);
  border: 1px solid rgba(255, 215, 0, 0.5);
  color: #ffd875;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
`

const JoystickItem: React.FC<Props> = ({ onDirectionChange, size = 100 }) => {
  const stickSize = Math.round(size * 0.48)
  const maxDistance = Math.round((size - stickSize) / 2) + 4
  const deadZone = 8

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const baseRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const centerRef = useRef({ x: 0, y: 0 })

  const emitDirection = useCallback(
    (dx: number, dy: number) => {
      const dist = Math.hypot(dx, dy)
      if (dist < deadZone) {
        onDirectionChange({
          isMoving: false,
          direction: { left: false, right: false, up: false, down: false },
        })
        return
      }

      const left = dx < -deadZone
      const right = dx > deadZone
      const up = dy < -deadZone
      const down = dy > deadZone

      onDirectionChange({
        isMoving: true,
        direction: { left, right, up, down },
      })
    },
    [deadZone, onDirectionChange]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!baseRef.current) return
    const rect = baseRef.current.getBoundingClientRect()
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }

    pointerIdRef.current = e.pointerId
    baseRef.current.setPointerCapture(e.pointerId)
    setIsDragging(true)

    const rawDx = e.clientX - centerRef.current.x
    const rawDy = e.clientY - centerRef.current.y
    const dist = Math.hypot(rawDx, rawDy)
    const factor = dist > maxDistance ? maxDistance / dist : 1
    const x = rawDx * factor
    const y = rawDy * factor

    setPosition({ x, y })
    emitDirection(x, y)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || e.pointerId !== pointerIdRef.current) return

    const rawDx = e.clientX - centerRef.current.x
    const rawDy = e.clientY - centerRef.current.y
    const dist = Math.hypot(rawDx, rawDy)
    const factor = dist > maxDistance ? maxDistance / dist : 1
    const x = rawDx * factor
    const y = rawDy * factor

    setPosition({ x, y })
    emitDirection(x, y)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerIdRef.current) return
    if (baseRef.current && pointerIdRef.current !== null) {
      try {
        baseRef.current.releasePointerCapture(pointerIdRef.current)
      } catch {
        // Ignored if pointer was lost
      }
    }
    pointerIdRef.current = null
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    emitDirection(0, 0)
  }

  useEffect(() => {
    return () => {
      // Safety reset on unmount
      onDirectionChange({
        isMoving: false,
        direction: { left: false, right: false, up: false, down: false },
      })
    }
  }, [onDirectionChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <BaseCircle
        ref={baseRef}
        $size={size}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <DirectionArrow $pos="top">▲</DirectionArrow>
        <DirectionArrow $pos="bottom">▼</DirectionArrow>
        <DirectionArrow $pos="left">◀</DirectionArrow>
        <DirectionArrow $pos="right">▶</DirectionArrow>
        <StickKnob
          $x={position.x}
          $y={position.y}
          $stickSize={stickSize}
          $isDragging={isDragging}
        />
      </BaseCircle>
      <JoystickBadge>🕹️ DI CHUYỂN</JoystickBadge>
    </div>
  )
}

export default JoystickItem
