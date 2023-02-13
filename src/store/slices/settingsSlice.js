import { createSlice } from "@reduxjs/toolkit";
import moment from "moment";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    walletAddress: undefined,
    exchangeRates: {},
    exchangeRatesUpdatedTs: 0,
    presaleAAAddress: null,
    slippageTolerance: 2,
    presaleParams: {
      buy_freeze_period: 0,
      launch_date: null,
      reserve_asset: "base",
      token_aa: null,
    },
  },
  reducers: {
    changeWallet: (state, action) => {
      state.walletAddress = action.payload;
    },
    saveExchangeRates: (state, action) => {
      state.exchangeRates = action.payload;
      state.exchangeRatesUpdatedTs = moment.utc().unix();
    },
    savePresaleParams: (state, action) => {
      const [address, params] = action.payload;

      state.presaleAAAddress = address;
      state.presaleParams = params;
    },
    setSlippageTolerance: (state, action) => {
      state.slippageTolerance = action.payload;
    },
  },
  extraReducers: {},
});

export const { changeWallet, saveExchangeRates, savePresaleParams, setSlippageTolerance } = settingsSlice.actions;

export default settingsSlice.reducer;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectWalletAddress = (state) => state.settings.walletAddress;
export const selectExchangeRates = (state) => state.settings.exchangeRates;
export const selectPresaleParams = (state) => state.settings.presaleParams;
export const selectPresaleAddress = (state) => state.settings.presaleAAAddress;
export const selectSlippageTolerance = (state) => state.settings.slippageTolerance;
export const selectExchangeRatesUpdatedTs = (state) => state.settings.exchangeRatesUpdatedTs;
