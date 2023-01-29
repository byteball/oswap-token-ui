import { createAsyncThunk } from "@reduxjs/toolkit";

import client from "services/obyte";

import { changeWallet } from "store/slices/settingsSlice";
import { loadUserBalance } from "./loadUserBalance";

export const changeWalletAddress = createAsyncThunk("changeWalletAddress", async (walletAddress, { dispatch }) => {
  dispatch(loadUserBalance(walletAddress));
  dispatch(changeWallet(walletAddress));

  await client.justsaying("light/new_address_to_watch", walletAddress);

  return walletAddress;
});
