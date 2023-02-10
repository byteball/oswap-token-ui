import { createSlice } from "@reduxjs/toolkit";
import { sendNotification } from "store/thunks/sendNotification";

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
  },
  reducers: {
    dismissNotification: (state, action) => {
      state.list = state.list.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.list = [];
    },
  },
  extraReducers: {
    [sendNotification.fulfilled]: (state, action) => {
      if (action.payload) {
        state.list.push(action.payload);
      }
    },
  },
});

export const { saveNotification, dismissNotification, clearNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectNotifications = (state) => state.notifications.list;
