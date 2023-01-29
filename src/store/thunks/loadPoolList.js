import { createAsyncThunk } from "@reduxjs/toolkit";
import appConfig from "appConfig";

import client from "services/obyte";
import { savePoolListInCache } from "store/slices/cacheSlice";
import { getSymbolByAsset } from "utils/getSymbolByAsset";

export const loadPoolList = createAsyncThunk("loadPoolList", async (_, store) => {
  const pools = {};

  let stateVars = {};

  const gettersPoolsFactoryStateVars = appConfig.POOL_FACTORY_ADDRESSES.split(",").map((address) =>
    client.api.getAaStateVars({ address }).then((vars) => {
      stateVars = { ...stateVars, ...vars };
    })
  );

  await Promise.all(gettersPoolsFactoryStateVars);

  const gettersPoolsData = [];

  Object.entries(stateVars).forEach(([key, { pool_asset, x_asset, y_asset }]) => {
    const address = key.replace("pool_", "");
    pools[pool_asset] = { address };

    gettersPoolsData.push(
      getSymbolByAsset(pool_asset).then(async ([symbol, decimals]) => {
        if (symbol) {
          pools[pool_asset].symbol = symbol;
          pools[pool_asset].decimals = decimals;
        } else {
          const [xSymbol] = await getSymbolByAsset(x_asset);
          const [ySymbol] = await getSymbolByAsset(y_asset);

          if (xSymbol && ySymbol) {
            pools[pool_asset].symbol = `${xSymbol}-${ySymbol}`;
            pools[pool_asset].decimals = 0;
          }
        }
      })
    );
  });

  await Promise.all(gettersPoolsData);

  store.dispatch(savePoolListInCache(pools));
});
