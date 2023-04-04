import { createAsyncThunk } from "@reduxjs/toolkit";

import { BackendService } from "services/backend";

export const loadPrice7d = createAsyncThunk("loadPrice7d", () => {
  return BackendService.getPrice7d();
});
