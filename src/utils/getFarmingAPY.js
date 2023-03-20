import { getCurrentPrice } from "./getCurrentPrice";
import { getAppreciationState } from "./getExchangeResult";

export const getFarmingAPY = ({
  stateVars = {},
  exchangeRates,
  asset_key,
  pool_decimals,
  group_key,
  settings: { appreciation_rate, inflation_rate, stakers_share },
  asset,
  decimals,
}) => {
  let APY = 0;

  const total_lp_tokens = (stateVars[`pool_asset_balance_${asset_key}`] || 0) / 10 ** pool_decimals;

  if (total_lp_tokens) {
    const pool_vps = stateVars[`pool_vps_${group_key}`] || {};
    const gbyteToUSDRate = exchangeRates[`GBYTE_USD`];

    const state = getAppreciationState(stateVars?.state || {}, appreciation_rate);
    const total_normalized_vp = state?.total_normalized_vp || 0;
    const supply = state?.supply || 0;
    const oswap_token_price = getCurrentPrice(state);

    const oswap_token_price_usd = oswap_token_price * gbyteToUSDRate;
    const lp_price_usd = exchangeRates[`${asset}_USD`];

    const total_emissions_per_day = ((1 / 360) * inflation_rate * supply) / 10 ** decimals;
    const total_emissions_per_day_lp = total_emissions_per_day * (1 - stakers_share);

    const daily_pool_income = total_emissions_per_day_lp * (pool_vps[asset_key] / total_normalized_vp);
    const daily_pool_income_usd = daily_pool_income * oswap_token_price_usd;

    const rate_of_return = (1 + daily_pool_income_usd / (total_lp_tokens * lp_price_usd)) ** 360;

    APY = Number((rate_of_return - 1) * 100).toPrecision(6);
  }

  return APY;
};
