import React, { FormEvent, useState } from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setFocused } from '../stores/ChatStore'
import phaserGame from '../PhaserGame'
import type Game from '../scenes/Game'

const Bar = styled.form`
  position: fixed;
  z-index: 110;
  left: 82px;
  bottom: 16px;
  display: flex;
  gap: 8px;
  width: min(380px, calc(100vw - 112px));
  padding: 7px;
  border: 1px solid rgba(231, 200, 117, 0.6);
  border-radius: 999px;
  background: rgba(16, 19, 30, 0.94);
  box-shadow: 0 5px 20px #0008;

  input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    padding: 7px 10px;
    color: #f6f0e4;
    background: transparent;
    font: inherit;
  }
  input::placeholder { color: #b6b2c0; }

  button {
    flex: 0 0 auto;
    border: 0;
    border-radius: 999px;
    padding: 7px 12px;
    color: #201a22;
    background: #e7c875;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
  button.wave {
    padding-inline: 10px;
    color: #f6e4b3;
    border: 1px solid #e7c87566;
    background: #ffffff10;
    font-size: 18px;
  }

  @media (max-width: 650px) {
    left: 12px;
    bottom: 16px;
    width: calc(100vw - 24px);
  }
`

export default function ProximityChat() {
  const [message, setMessage] = useState('')
  const showChat = useAppSelector((state) => state.chat.showChat)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const dispatch = useAppDispatch()

  if (!roomJoined || showChat) return null

  const getGame = () => phaserGame.scene.keys.game as Game | undefined
  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = message.trim()
    if (!content) return
    getGame()?.sendProximityChat(content)
    setMessage('')
  }

  return (
    <Bar onSubmit={sendMessage} aria-label="Nearby chat">
      <input
        aria-label="Chat with nearby players"
        maxLength={120}
        placeholder="Nhắn người ở gần…"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onFocus={() => dispatch(setFocused(true))}
        onBlur={() => dispatch(setFocused(false))}
      />
      <button
        className="wave"
        type="button"
        aria-label="Wave at nearby players"
        title="Vẫy tay (H)"
        onClick={() => getGame()?.sendWave(true)}
      >
        👋
      </button>
      <button type="submit">Gửi</button>
    </Bar>
  )
}
