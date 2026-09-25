import React, { lazy, Suspense } from 'react'
import styled from 'styled-components'

import { useAppSelector } from './hooks'

import RoomSelectionDialog from './components/RoomSelectionDialog'
const ComputerDialog = lazy(() => import('./components/ComputerDialog'))
const WhiteboardDialog = lazy(() => import('./components/WhiteboardDialog'))
const LoginDialog = lazy(() => import('./components/LoginDialog'))
const SortingCeremony = lazy(() => import('./components/SortingCeremony'))
import Chat from './components/Chat'
import HelperButtonGroup from './components/HelperButtonGroup'
import MobileVirtualJoystick from './components/MobileVirtualJoystick'
import ProximityChat from './components/ProximityChat'

const Backdrop = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`

function App() {
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const computerDialogOpen = useAppSelector((state) => state.computer.computerDialogOpen)
  const whiteboardDialogOpen = useAppSelector((state) => state.whiteboard.whiteboardDialogOpen)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const connectionLost = useAppSelector((state) => state.room.connectionLost)

  let ui: JSX.Element
  if (loggedIn) {
    if (computerDialogOpen) {
      /* Render ComputerDialog if user is using a computer. */
      ui = <ComputerDialog />
    } else if (whiteboardDialogOpen) {
      /* Render WhiteboardDialog if user is using a whiteboard. */
      ui = <WhiteboardDialog />
    } else {
      ui = (
        /* Render Chat or VideoConnectionDialog if no dialogs are opened. */
        <>
          <Chat />
          <ProximityChat />
          <MobileVirtualJoystick />
        </>
      )
    }
  } else if (roomJoined) {
    /* Render LoginDialog if not logged in but selected a room. */
    ui = <LoginDialog />
  } else {
    /* Render RoomSelectionDialog if yet selected a room. */
    ui = <RoomSelectionDialog />
  }

  return (
    <Backdrop>
      <Suspense fallback={<div role="status" style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'grid', placeItems: 'center', color: '#ffd875', background: 'rgba(9, 7, 20, 0.55)' }}>Đang tải…</div>}>
        {ui}
      </Suspense>
      {loggedIn && (
        <Suspense fallback={null}>
          <SortingCeremony />
        </Suspense>
      )}
      {/* Render HelperButtonGroup if no dialogs are opened. */}
      {!computerDialogOpen && !whiteboardDialogOpen && <HelperButtonGroup />}
      {connectionLost && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="connection-lost-title" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(9, 7, 20, 0.85)', color: '#fff' }}>
          <section style={{ maxWidth: 420, padding: 24, borderRadius: 16, background: '#222639', textAlign: 'center' }}>
            <h2 id="connection-lost-title">Kết nối tới phòng đã ngắt</h2>
            <p>Hãy kết nối lại để trở về màn chọn phòng.</p>
            <button autoFocus onClick={() => window.location.reload()} style={{ padding: '10px 18px', borderRadius: 8, cursor: 'pointer' }}>Kết nối lại</button>
          </section>
        </div>
      )}
    </Backdrop>
  )
}

export default App
