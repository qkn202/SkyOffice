import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sortingSlice = createSlice({
  name: 'sorting',
  initialState: { nearHat: false, ceremonyOpen: false },
  reducers: {
    setNearSortingHat: (state, action: PayloadAction<boolean>) => {
      state.nearHat = action.payload
    },
    openSortingCeremony: (state) => {
      if (state.nearHat) state.ceremonyOpen = true
    },
    closeSortingCeremony: (state) => {
      state.ceremonyOpen = false
    },
  },
})

export const { setNearSortingHat, openSortingCeremony, closeSortingCeremony } = sortingSlice.actions
export default sortingSlice.reducer
