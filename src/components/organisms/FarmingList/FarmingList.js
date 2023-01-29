import { ArrowTopRightOnSquareIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Tooltip from "rc-tooltip";

import { Button, Spin } from "components/atoms";
import { LPDepositModal } from "components/organisms";
import { selectPools, selectSettings, selectStateVars, selectStateVarsLoading, selectTokenInfo } from "store/slices/agentSlice";
import { selectExchangeRates, selectWalletAddress } from "store/slices/settingsSlice";
import { getCurrentPrice } from "utils";
import { getAppreciationState } from "utils/getExchangeResult";

import { selectWalletBalance } from "store/slices/userWalletSlice";

import appConfig from "appConfig";

const MAX_POOLS_ON_PAGE = 10;

export const FarmingList = () => {
  const stateVarsLoading = useSelector(selectStateVarsLoading);
  const pools = useSelector(selectPools);
  const { decimals } = useSelector(selectTokenInfo);
  const stateVars = useSelector(selectStateVars);
  const exchangeRates = useSelector(selectExchangeRates);
  const { appreciation_rate, inflation_rate, stakers_share } = useSelector(selectSettings);
  const walletAddress = useSelector(selectWalletAddress);
  const walletBalance = useSelector(selectWalletBalance);

  const [poolsWithAPY, setPoolsWithAPY] = useState([]);
  const [sortType, setSortType] = useState("apy");

  const [page, setPage] = useState(1);
  const maxPage = Math.ceil(pools.length / MAX_POOLS_ON_PAGE);

  useEffect(() => {
    const poolsWithAPY = [...pools];

    poolsWithAPY.forEach(({ group_key, asset_key, decimals: pool_decimals, asset }, index) => {
      let daily_pool_income_usd = 0;
      let lp_price_usd = 0;
      let daily_pool_income = 0;
      let rate_of_return = 0;
      let oswap_token_price_usd = 0;

      const pool_vps = stateVars[`pool_vps_${group_key}`] || {};
      const state = getAppreciationState(stateVars?.state || {}, appreciation_rate);

      const supply = state?.supply || 0;
      const total_normalized_vp = state?.total_normalized_vp || 0;
      const total_lp_tokens = (stateVars[`pool_asset_balance_${asset_key}`] || 0) / 10 ** pool_decimals;
      const gbyteToUSDRate = exchangeRates[`GBYTE_USD`];

      if (total_lp_tokens) {
        const oswap_token_price = getCurrentPrice(state);

        oswap_token_price_usd = oswap_token_price * gbyteToUSDRate;
        lp_price_usd = exchangeRates[`${asset}_USD`];

        const total_emissions_per_day = ((1 / 360) * inflation_rate * supply) / 10 ** decimals;
        const total_emissions_per_day_lp = total_emissions_per_day * (1 - stakers_share);

        daily_pool_income = total_emissions_per_day_lp * (pool_vps[asset_key] / total_normalized_vp);
        daily_pool_income_usd = daily_pool_income * oswap_token_price_usd;

        rate_of_return = (1 + daily_pool_income_usd / (total_lp_tokens * lp_price_usd)) ** 360;

        poolsWithAPY[index].apy = Number((rate_of_return - 1) * 100).toFixed(4);
      }

      poolsWithAPY[index].total_locked_usd = +Number(total_lp_tokens * lp_price_usd).toFixed(4);
      poolsWithAPY[index].total_locked = +Number(total_lp_tokens).toFixed(pool_decimals);

      if (walletAddress) {
        const wallet_balance = walletBalance?.[asset]?.total || 0;

        poolsWithAPY[index].wallet_balance = +Number(wallet_balance / 10 ** pool_decimals).toFixed(pool_decimals);
        poolsWithAPY[index].wallet_balance_usd = Number((wallet_balance / 10 ** pool_decimals) * lp_price_usd).toFixed(4);
      }
    });

    setPoolsWithAPY(poolsWithAPY);
  }, [pools, stateVars, decimals, appreciation_rate, exchangeRates, stakers_share, inflation_rate, walletAddress]);

  const sortedPoolsWithAPY = useMemo(
    () => poolsWithAPY.sort((a, b) => (sortType === "apy" ? (b.apy || 0) - (a.apy || 0) : (b.total_locked || 0) - (a.total_locked || 0))),
    [sortType, poolsWithAPY]
  );

  if (stateVarsLoading) return <Spin />;

  if (!stateVarsLoading && pools.length === 0)
    return <div className="p-5 bg-primary-gray rounded-xl text-primary-gray-light">Farming pools have not been added yet</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="text-white bg-primary-gray">
          <tr>
            <th scope="col" className="rounded-tl-xl py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 lg:pl-8">
              Pool
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
              <span className="inline-flex items-center cursor-pointer group" onClick={() => setSortType("apy")}>
                APY
                <span
                  className={`flex-none ml-2 text-white/50 bg-[#131519]/60 rounded group-hover:opacity-100 ${
                    sortType === "apy" ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                </span>
              </span>
            </th>

            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
              <span className="inline-flex items-center cursor-pointer group" onClick={() => setSortType("total")}>
                Total deposited
                <span
                  className={`flex-none ml-2 text-white/50 bg-[#131519]/60 rounded group-hover:opacity-100 ${
                    sortType === "total" ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                </span>
              </span>
            </th>
            {walletAddress && (
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
                In my wallet
              </th>
            )}
            <th scope="col" className="relative rounded-tr-xl py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
              <span className="sr-only">Deposit</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y bg-primary-gray/50 divide-gray-200/10">
          {sortedPoolsWithAPY
            .slice(0, page * MAX_POOLS_ON_PAGE)
            .map(
              ({
                asset,
                symbol,
                address,
                decimals: pool_decimals,
                apy = 0,
                total_locked = 0,
                total_locked_usd = 0,
                wallet_balance_usd = 0,
                wallet_balance = 0,
              }) => {
                return (
                  <tr key={asset} className="text-white last:bg-red">
                    <td className="py-4 pl-4 pr-3 text-sm font-medium whitespace-nowrap sm:pl-6 lg:pl-8">
                      <Button
                        type="text-primary"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://${appConfig.ENVIRONMENT === "testnet" ? "v2-testnet" : ""}.oswap.io/#/swap/${address}`}
                        className="flex items-center"
                      >
                        {symbol ? symbol : `${asset.slice(0, 10)}...`}
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" aria-hidden="true" />
                      </Button>
                    </td>

                    <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{apy}%</td>

                    <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {total_locked ? (
                        <Tooltip
                          placement="top"
                          trigger={["hover"]}
                          overlay={
                            <span>
                              {total_locked} {symbol}
                            </span>
                          }
                        >
                          <span className="border-b border-gray-500 border-dotted">${total_locked_usd}</span>
                        </Tooltip>
                      ) : (
                        "-"
                      )}
                    </td>

                    {walletAddress && (
                      <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {wallet_balance ? (
                          <Tooltip
                            placement="top"
                            trigger={["hover"]}
                            overlay={
                              <span>
                                {wallet_balance} {symbol}
                              </span>
                            }
                          >
                            <span className="border-b border-gray-500 border-dotted">${wallet_balance_usd}</span>
                          </Tooltip>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}

                    <td className="relative py-4 pl-3 pr-4 space-x-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6 lg:pr-8">
                      <Button
                        type="text-primary"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://${appConfig.ENVIRONMENT === "testnet" ? "v2-testnet" : ""}.oswap.io/#/add-liquidity/${address}`}
                      >
                        Add liquidity
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" aria-hidden="true" />
                      </Button>
                      <LPDepositModal symbol={symbol} asset={asset} decimals={pool_decimals} />
                    </td>
                  </tr>
                );
              }
            )}
        </tbody>
      </table>
      <div className="w-full">
        {maxPage > page && (
          <div className="flex justify-center mt-5">
            <Button type="default" onClick={() => setPage((p) => p + 1)}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
