import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { sanitizeId } from '../util'
import { BackgroundMode } from '../../../types/BackgroundMode'
import { House } from '../utils/houseOutfits'

import type Bootstrap from '../scenes/Bootstrap'

export interface IHpvnProfile {
  uid: string
  username: string
  house: string
  userTag?: string
}

export function getInitialBackgroundMode() {
  const currentHour = new Date().getHours()
  return currentHour > 6 && currentHour <= 18 ? BackgroundMode.DAY : BackgroundMode.NIGHT
}

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    backgroundMode: getInitialBackgroundMode(),
    sessionId: '',
    videoConnected: false,
    loggedIn: false,
    currentPlayerName: '',
    playerNameMap: new Map<string, string>(),
    showJoystick: window.innerWidth < 650,
    hpvnProfile: null as null | IHpvnProfile,
    assignedHouse: '' as House | '',
  },
  reducers: {
    toggleBackgroundMode: (state) => {
      const newMode =
        state.backgroundMode === BackgroundMode.DAY ? BackgroundMode.NIGHT : BackgroundMode.DAY

      state.backgroundMode = newMode
      const bootstrap = (window as any).game?.scene?.keys?.bootstrap as Bootstrap | undefined
      bootstrap?.changeBackgroundMode(newMode)
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload
    },
    setVideoConnected: (state, action: PayloadAction<boolean>) => {
      state.videoConnected = action.payload
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.loggedIn = action.payload
    },
    setCurrentPlayerName: (state, action: PayloadAction<string>) => {
      state.currentPlayerName = action.payload
    },
    setPlayerNameMap: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.playerNameMap.set(sanitizeId(action.payload.id), action.payload.name)
    },
    removePlayerNameMap: (state, action: PayloadAction<string>) => {
      state.playerNameMap.delete(sanitizeId(action.payload))
    },
    setShowJoystick: (state, action: PayloadAction<boolean>) => {
      state.showJoystick = action.payload
    },
    setHpvnProfile: (state, action: PayloadAction<IHpvnProfile | null>) => {
      state.hpvnProfile = action.payload
    },
    setAssignedHouse: (state, action: PayloadAction<House | ''>) => {
      state.assignedHouse = action.payload
    },
  },
})

export const {
  toggleBackgroundMode,
  setSessionId,
  setVideoConnected,
  setLoggedIn,
  setCurrentPlayerName,
  setPlayerNameMap,
  removePlayerNameMap,
  setShowJoystick,
  setHpvnProfile,
  setAssignedHouse,
} = userSlice.actions

export default userSlice.reducer
