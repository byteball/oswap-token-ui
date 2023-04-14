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

  let blacklisted = [];
  let whitelisted = [];

  pools.forEach((p) => {
    if (p?.blacklisted) {
      blacklisted.push(p);
    } else {
      whitelisted.push(p);
    }
  });

  blacklisted = blacklisted.sort(sortPool);
  whitelisted = whitelisted.sort(sortPool);

  return [...whitelisted, ...blacklisted];
};

const sortPool = (a, b) => {
  if (!a.symbol || !b.symbol) return -1;

  if (a.symbol.toLowerCase() < b.symbol.toLowerCase()) {
    return -1;
  }

  if (a.symbol.toLowerCase() > b.symbol.toLowerCase()) {
    return 1;
  }

  return 0;
}