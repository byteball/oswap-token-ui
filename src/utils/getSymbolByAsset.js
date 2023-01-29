import moment from "moment";

import client from "services/obyte";

import { store } from "index";
import { saveSymbolInCache } from "store/slices/cacheSlice";

export const getSymbolByAsset = async (asset) => {
  const state = store.getState();
  let decimals = 0;

  if (
    asset in state.cache.symbols &&
    moment().unix() - state.cache.symbols[asset].updatedAt <= (state.cache.symbols[asset].symbols ? 14 * 24 * 3600 : 4 * 3600)
  ) {
    return [state.cache.symbols[asset].symbol, state.cache.symbols[asset].decimals];
  } else {
    const tokenRegistry = client.api.getOfficialTokenRegistryAddress();
    let symbol = await client.api.getSymbolByAsset(tokenRegistry, asset);

    if (symbol === asset.replace(/[+=]/, "").substr(0, 6)) {
      symbol = null;
    } else {
      decimals = await client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset);
    }

    store.dispatch(saveSymbolInCache({ symbol, asset, decimals }));

    return [symbol, decimals];
  }
};
