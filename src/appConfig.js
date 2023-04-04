export default {
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT,
  AA_ADDRESS: process.env.REACT_APP_AA_ADDRESS,
  POOL_FACTORY_ADDRESSES: process.env.REACT_APP_POOL_FACTORY_ADDRESSES,
  GA_ID: process.env.REACT_APP_GA_ID,
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  RESERVE_ASSET: "base",
  COMMON_TS: 1657843200, // from AA Fri Jul 15 2022 00:00:00 GMT+0000
  YEAR: 360 * 24 * 3600,
  TOKENS: [
    { symbol: "GBYTE", network: "Obyte", decimals: 9, initial: 10 },
    { symbol: "GBYTE", network: "Ethereum", decimals: 9, initial: 10 },
    { symbol: "GBYTE", network: "Polygon", decimals: 9, initial: 10 },
    { symbol: "GBYTE", network: "BSC", decimals: 9, initial: 10 },
    { symbol: "ETH", network: "Ethereum", decimals: 8, initial: 0.1 },
    { symbol: "USDC", network: "Ethereum", decimals: 4, initial: 100 },
    { symbol: "WBTC", network: "Ethereum", decimals: 4, initial: 0.01 },
  ],
};
