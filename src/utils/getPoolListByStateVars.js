export const getPoolListByStateVars = (state, symbols, list) => {
  const pools = [];

  Object.entries(state).forEach(([key, value]) => {
    if (key.startsWith("pool_") && !key.startsWith("pool_vps") && !key.startsWith("pool_asset_balance_")) {
      // eslint-disable-next-line no-unused-vars
      const [_, asset] = key.split("_");

      const g = Number(value.group_key.replace("g", ""));
      const a = Number(value.asset_key.replace("a", ""));

      const votes_vp = state[`wl_votes_${asset}`];

      const index = (g - 1) * 30 + a;

      pools.push({
        ...value,
        asset,
        votes_vp,
        index,
        symbol: list[asset]?.symbol || false,
        decimals: list[asset]?.decimals || 0,
        address: list[asset]?.address,
      });
    }
  });

  return pools.sort((pool1, pool2) => {
    return pool1.index - pool2.index;
  });
};
