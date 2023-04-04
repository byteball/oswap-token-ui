import { createSlice } from "@reduxjs/toolkit";
import { loadPrice7d } from "store/thunks/loadPrice7d";

export const chartSlice = createSlice({
  name: "chart",
  initialState: {
    price7d: [],
  },
  reducers: {},
  extraReducers: {
    [loadPrice7d.fulfilled]: (state, action) => {
      state.price7d = action.payload;
    },
  },
});

export default chartSlice.reducer;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectPrice7d = (state) => state.chart.price7d;
