import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type Game from '../scenes/Game'

interface WhiteboardState {
  whiteboardDialogOpen: boolean
  whiteboardId: null | string
  whiteboardUrl: null | string
  urls: Map<string, string>
}

const initialState: WhiteboardState = {
  whiteboardDialogOpen: false,
  whiteboardId: null,
  whiteboardUrl: null,
  urls: new Map(),
}

export const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    openWhiteboardDialog: (state, action: PayloadAction<string>) => {
      state.whiteboardDialogOpen = true
      state.whiteboardId = action.payload
      state.whiteboardUrl = 'https://sketchclash-game.vercel.app'
      const game = (window as any).game?.scene?.keys?.game as Game | undefined
      game?.disableKeys()
    },
    closeWhiteboardDialog: (state) => {
      const game = (window as any).game?.scene?.keys?.game as Game | undefined
      game?.enableKeys()
      if (state.whiteboardId && game?.network) {
        game.network.disconnectFromWhiteboard(state.whiteboardId)
      }
      state.whiteboardDialogOpen = false
      state.whiteboardId = null
      state.whiteboardUrl = null
    },
    setWhiteboardUrls: (state, action: PayloadAction<{ whiteboardId: string; roomId: string }>) => {
      state.urls.set(
        action.payload.whiteboardId,
        'https://sketchclash-game.vercel.app'
      )
    },
  },
})

export const { openWhiteboardDialog, closeWhiteboardDialog, setWhiteboardUrls } =
  whiteboardSlice.actions

export default whiteboardSlice.reducer
