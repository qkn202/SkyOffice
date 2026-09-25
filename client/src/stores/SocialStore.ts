import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type OnlineProfile = {
  sessionId: string
  name: string
  house: string
  texture: string
  x: number
  y: number
}

export type SocialEvent = {
  id: string
  title: string
  description: string
  startsAt: number
  createdBy: string
  attendeeCount: number
  attendeeNames: string[]
  isAttending: boolean
}

const socialSlice = createSlice({
  name: 'social',
  initialState: {
    onlineProfiles: [] as OnlineProfile[],
    events: [] as SocialEvent[],
  },
  reducers: {
    setOnlineProfiles: (state, action: PayloadAction<OnlineProfile[]>) => {
      state.onlineProfiles = action.payload
    },
    setSocialEvents: (state, action: PayloadAction<SocialEvent[]>) => {
      state.events = action.payload
    },
  },
})

export const { setOnlineProfiles, setSocialEvents } = socialSlice.actions
export default socialSlice.reducer
