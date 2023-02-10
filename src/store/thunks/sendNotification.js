import { createAsyncThunk } from "@reduxjs/toolkit";

import { dismissNotification } from "store/slices/notificationsSlice";

export const sendNotification = createAsyncThunk("sendNotification", async (notificationObject, { dispatch }) => {
  if (notificationObject) {
    const id = new Date().getTime();

    setTimeout(() => {
      dispatch(dismissNotification(id));
    }, notificationObject.dismissAfter || 3000);

    return {
      id,
      ...notificationObject,
    };
  }
});
