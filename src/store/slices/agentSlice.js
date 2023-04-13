import { createSelector, createSlice } from "@reduxjs/toolkit";
import { differenceBy } from "lodash";

import { selectWalletAddress } from "./settingsSlice";
import { params } from "pages/GovernanceParamsPage/GovernanceParamsPage";

import { getPoolListByStateVars } from "utils";

export const agentSlice = createSlice({
  name: "agent",
  initialState: {
    stateVars: {
      state: {
        coef: 1,
        s0: 1e12,
        supply: 0,
        reserve: 0,
        total_normalized_vp: 0,
        stakers_emissions: 0,
        lp_emissions: 0,
      },
    },
    loading: true,
    oracleAddress: null,
    baseTVL: 0,
    currentTVL: 0,
    assetSymbol: null,
    assetDecimals: 0,
    settings: {},
  },
  reducers: {
    updateAgentStateVars: (state, action) => {
      state.stateVars = { ...state.stateVars, ...action.payload };
      state.loading = false;
    },
    saveOracleAddress: (state, action) => {
      state.oracleAddress = action.payload;
    },
    saveBaseTVL: (state, action) => {
      state.baseTVL = action.payload;
    },
    updateCurrentTVL: (state, action) => {
      state.currentTVL = action.payload;
    },
    saveSymbolInfo: (state, action) => {
      state.assetSymbol = action.payload.symbol;
      state.assetDecimals = action.payload.decimals;
      state.asset = action.payload.asset;
    },
    saveSettings: (state, action) => {
      state.settings = action.payload;
    },
  },
  extraReducers: {},
});

export const { updateAgentStateVars, saveOracleAddress, updateCurrentTVL, saveBaseTVL, saveSymbolInfo, saveSettings } = agentSlice.actions;

export default agentSlice.reducer;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectStateVars = (state) => state.agent.stateVars;
export const selectStateVarsLoading = (state) => state.agent.loading;
export const selectTVLs = (state) => ({ base: state.agent.baseTVL, current: state.agent.currentTVL });

export const selectSettings = createSelector(
  [selectStateVars, selectTVLs, (state) => state.agent.settings],
  (state, { current, base }, currentSettings = {}) => {
    const actualSettings = { appreciation_rate: (currentSettings.base_rate * current) / base };

    Object.entries(currentSettings).forEach(([name, value]) => {
      actualSettings[name] = state[name] || value || params[name]?.initValue;
    });

    return actualSettings;
  }
);

export const selectTokenInfo = (state) => ({ symbol: state.agent.assetSymbol, decimals: state.agent.assetDecimals, asset: state.agent.asset });

export const selectPools = createSelector([selectStateVars, (state) => state.cache.symbols, (state) => state.cache.poolList], getPoolListByStateVars);

export const selectWalletVotes = createSelector(selectStateVars, selectWalletAddress, (stateVars, walletAddress) => {
  const votes = {};
  if (!walletAddress) return votes;

  Object.entries(stateVars).forEach(([key, value]) => {
    if (key.startsWith(`user_wl_votes_${walletAddress}`)) {
      const split = key.split("_");
      const pool = split[4];
      votes[pool] = value;
    }
  });

  return votes;
});

export const selectGovernance = createSelector(selectStateVars, (stateVars) => {
  const actualParams = {};
  const votes = {};

  Object.entries(stateVars).forEach(([key, value]) => {
    if (key.startsWith("value_votes_")) {
      const keySplit = key.split("_");
      const param_value = keySplit.slice(keySplit.length - 1).join("");
      const name = keySplit.slice(2, keySplit.length - 1).join("_");

      if (!votes[name]) votes[name] = [];

      if (Number(value) > 0) {
        votes[name].push({ value: param_value, vp: value });
      }
    }
  });

  Object.entries(params).forEach(([name, { initValue, ...other }]) => {
    if (!(name in actualParams)) actualParams[name] = {};

    const value = stateVars[name] || initValue;

    const leader = stateVars[`leader_${name}`];

    actualParams[name] = { ...other, ...actualParams[name], leader, value, votes: votes[name] || [] };
  });

  return actualParams;
});

export const selectUserData = createSelector(selectStateVars, selectWalletAddress, (stateVars, wallet) => {
  const obj = stateVars[`user_${wallet}`] ?? {};
  const votes = stateVars[`votes_${wallet}`] ?? {};

  const deposits = [];

  if (wallet) {
    Object.entries(stateVars).forEach(([key, value]) => {
      if (key.startsWith(`lp_${wallet}_`)) {
        // eslint-disable-next-line no-unused-vars
        const [_, __, asset_key] = key.split("_");
        deposits.push({ asset_key, ...value });
      }
    });
  }

  return {
    ...obj,
    votes,
    deposits,
  };
});

export const selectWaitingPools = createSelector(
  selectStateVars,
  (state) => state.cache.poolList,
  selectPools,
  (stateVars, poolList, pools) => {
    const votedPools = [];

    Object.entries(stateVars).forEach(([key, value]) => {
      if (key.startsWith(`wl_votes_`)) {
        const asset = key.split("_")?.[2];
        const poolInCache = poolList[asset] || {};

        votedPools.push({ asset, symbol: poolInCache.symbol, decimals: poolInCache.decimals, address: poolInCache.address, waiting: true, ...value });
      }
    });

    return differenceBy(votedPools.sort((a, b) => a.flip_ts - b.flip_ts), pools, (obj) => obj.asset);
  }
);
