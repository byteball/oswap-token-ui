import { createSelector, createSlice } from "@reduxjs/toolkit";
import moment from "moment";

import { selectPools } from "./agentSlice";

export const cacheSlice = createSlice({
  name: "cache",
  initialState: {
    symbols: {},
    poolList: {},
  },
  reducers: {
    saveSymbolInCache: (state, action) => {
      const { asset, symbol, decimals } = action.payload;

      state.symbols[asset] = { symbol, updatedAt: moment().unix(), decimals };
    },
    savePoolListInCache: (state, action) => {
      state.poolList = action.payload;
    },
  },
});

export const { saveSymbolInCache, savePoolListInCache } = cacheSlice.actions;

export default cacheSlice.reducer;

export const selectAllPoolList = (state) => state.cache.poolList;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectNotAddedPoolList = createSelector(selectAllPoolList, selectPools, (allPolls, addedPools) => {
  const pools = [];

  Object.entries(allPolls).forEach(([pool_asset, metaData]) => {
    if (!addedPools.find(({ asset }) => asset === pool_asset)) {
      pools.push({ pool_asset, ...metaData });
    }
  });

  return pools;
});
