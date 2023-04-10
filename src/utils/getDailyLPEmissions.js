const { getCurrentPrice } = require("./getCurrentPrice");
const { getAppreciationState } = require("./getExchangeResult");

export const getDailyLPEmissions = ({ stateVars, exchangeRates, settings: { appreciation_rate, inflation_rate, stakers_share }, decimals}) => {
	const gbyteToUSDRate = exchangeRates[`GBYTE_USD`];

	const state = getAppreciationState(stateVars?.state || {}, appreciation_rate);
	const supply = state?.supply || 0;
	const oswapTokenPrice = getCurrentPrice(state);

	const oswapTokenPriceUsd = oswapTokenPrice * gbyteToUSDRate;

	const totalEmissionsPerDay = ((1 / 360) * inflation_rate * supply) / 10 ** decimals;
	const totalEmissionsPerDayLp = totalEmissionsPerDay * (1 - stakers_share);

	return { oswap: totalEmissionsPerDayLp, usd: totalEmissionsPerDayLp * oswapTokenPriceUsd }
}