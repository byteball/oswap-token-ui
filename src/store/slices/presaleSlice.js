import { createSlice } from "@reduxjs/toolkit";

export const presaleSlice = createSlice({
  name: "presale",
  initialState: {
    stateVars: {},
    loading: true,
  },
  reducers: {
    updatePresaleStateVars: (state, action) => {
      state.stateVars = { ...state.stateVars, ...action.payload };
      state.loading = false;
    },
  },
  extraReducers: {},
});

export const { updatePresaleStateVars } = presaleSlice.actions;

export default presaleSlice.reducer;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectPresaleStateVars = (state) => state.presale.stateVars;
export const selectPresaleStateVarsLoading = (state) => state.presale.loading;
