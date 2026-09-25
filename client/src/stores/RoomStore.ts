import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const roomSlice = createSlice({
  name: 'room',
  initialState: {
    connectionLost: false,
    isReconnecting: false,
    reconnectAttempt: 0,
    roomJoined: false,
    roomId: '',
    roomName: '',
    roomDescription: '',
  },
  reducers: {
    setConnectionLost: (state, action: PayloadAction<boolean>) => {
      state.connectionLost = action.payload
    },
    setReconnecting: (
      state,
      action: PayloadAction<{ isReconnecting: boolean; attempt?: number }>
    ) => {
      state.isReconnecting = action.payload.isReconnecting
      state.reconnectAttempt = action.payload.attempt || 0
    },
    setRoomJoined: (state, action: PayloadAction<boolean>) => {
      state.roomJoined = action.payload
    },
    setJoinedRoomData: (
      state,
      action: PayloadAction<{ id: string; name: string; description: string }>
    ) => {
      state.roomId = action.payload.id
      state.roomName = action.payload.name
      state.roomDescription = action.payload.description
    },
  },
})

export const {
  setConnectionLost,
  setReconnecting,
  setRoomJoined,
  setJoinedRoomData,
} = roomSlice.actions

export default roomSlice.reducer
