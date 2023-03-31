import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import Tooltip from "rc-tooltip";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import ReactGA from "react-ga";

import { Button, Spin } from "components/atoms";
import { QRButton } from "components/molecules";

import { selectPools, selectSettings, selectStateVars, selectStateVarsLoading, selectTokenInfo, selectUserData } from "store/slices/agentSlice";
import { selectExchangeRates, selectWalletAddress } from "store/slices/settingsSlice";

import { generateLink, getCurrentPrice } from "utils";
import { getAppreciationState } from "utils/getExchangeResult";

import appConfig from "appConfig";

const POOLS_PER_PAGE = 5;

export const MyFarmingList = () => {
  const userData = useSelector(selectUserData);
  const stateVars = useSelector(selectStateVars);
  const walletAddress = useSelector(selectWalletAddress);
  const pools = useSelector(selectPools);
  const { inflation_rate, stakers_share } = useSelector(selectSettings);
  const stateVarsLoading = useSelector(selectStateVarsLoading);
  const exchangeRates = useSelector(selectExchangeRates);
  const { appreciation_rate } = useSelector(selectSettings);
  const { symbol: oswap_symbol, decimals: oswap_decimals } = useSelector(selectTokenInfo);

  const [page, setPage] = useState(1);

  const [depositsWithData, loading] = useLoadDepositMeta(userData.deposits, pools, page);

  const maxPage = Math.ceil(pools?.length / POOLS_PER_PAGE);
  const timestamp = moment.utc().unix();
  const year = 360 * 24 * 3600;

  if (loading || stateVarsLoading) return <Spin />;

  if (!loading && depositsWithData.length === 0)
    return <div className="p-5 bg-primary-gray rounded-xl text-primary-gray-light">You don't have any farming pools</div>;

  const sendRewardEvent = () => {
    ReactGA.event({
      category: "Farming",
      action: "Reward",
      label: walletAddress,
    });
  };

  const sendWithdrawEvent = () => {
    ReactGA.event({
      category: "Farming",
      action: "Withdraw",
      label: walletAddress,
    });
  };

  return (
    <div>
      {depositsWithData.map(
        ({ symbol, asset, asset_key, address, group_key, balance, decimals, reward, received_emissions, last_pool_emissions, last_lp_emissions }) => {
          const withdrawUrl = generateLink({ amount: 1e4, from_address: walletAddress, aa: appConfig.AA_ADDRESS, data: { pool_asset: asset, withdraw: 1 }, is_single: true });
          const withdrawRewardUrl = generateLink({
            amount: 1e4,
            from_address: walletAddress,
            aa: appConfig.AA_ADDRESS,
            data: { pool_asset: asset, withdraw_lp_reward: 1 },
            is_single: true
          });

          const total_new_emissions = stateVars?.state?.total_normalized_vp
            ? ((timestamp - stateVars?.state?.last_emissions_ts) / year) * inflation_rate * stateVars?.state?.supply
            : 0;

          const lp_emissions = stateVars?.state?.lp_emissions + (1 - stakers_share) * total_new_emissions;

          const pool_vps = stateVars[`pool_vps_${group_key}`] || {};

          const total_normalized_vp = stateVars?.state?.total_normalized_vp;

          const total_lp_balance = stateVars[`pool_asset_balance_${asset_key}`] || 0;

          const pool_share = pool_vps[asset_key] / total_normalized_vp;

          const new_total_lp_emissions_since_prev_visit = lp_emissions - last_lp_emissions;

          const new_received_emissions = received_emissions + new_total_lp_emissions_since_prev_visit * pool_share;

          const new_emissions_since_prev_visit = new_received_emissions - last_pool_emissions;

          const added_reward = new_emissions_since_prev_visit * (balance / total_lp_balance);

          const expected_reward = reward + added_reward;

          const expected_reward_view = Math.floor(expected_reward) / 10 ** oswap_decimals;

          // APY
          let APY = 0;
          let daily_pool_income_usd = 0;
          let lp_price_usd = 0;
          let daily_pool_income = 0;
          let rate_of_return = 0;
          let oswap_token_price_usd = 0;

          const state = getAppreciationState(stateVars?.state || {}, appreciation_rate);

          const supply = state?.supply || 0;
          const total_lp_tokens = (stateVars[`pool_asset_balance_${asset_key}`] || 0) / 10 ** decimals;
          const gbyteToUSDRate = exchangeRates[`GBYTE_USD`];

          if (total_lp_tokens) {
            const oswap_token_price = getCurrentPrice(state);

            oswap_token_price_usd = oswap_token_price * gbyteToUSDRate;
            lp_price_usd = exchangeRates[`${asset}_USD`];

            const total_emissions_per_day = ((1 / 360) * inflation_rate * supply) / 10 ** oswap_decimals;
            const total_emissions_per_day_lp = total_emissions_per_day * (1 - stakers_share);

            daily_pool_income = total_emissions_per_day_lp * (pool_vps[asset_key] / total_normalized_vp);
            daily_pool_income_usd = daily_pool_income * oswap_token_price_usd;

            rate_of_return = (1 + daily_pool_income_usd / (total_lp_tokens * lp_price_usd)) ** 360;

            APY = Number((rate_of_return - 1) * 100).toFixed(4);
          }

          return (
            <div key={asset} className="items-center p-5 mt-2 mb-5 md:justify-between md:flex rounded-xl bg-primary-gray last:mb-2">
              <div>
                <div className="mb-3">
                  <Button
                    className="text-xl"
                    type="text-primary"
                    href={`https://${appConfig.ENVIRONMENT === "testnet" ? "v2-testnet" : ""}.oswap.io/#/swap/${address}`}
                    target="_blank"
                    rel="noopener"
                  >
                    {symbol} <ArrowTopRightOnSquareIcon className="w-[1em] h-[1em] ml-2 mt-[-2px]" aria-hidden="true" />
                  </Button>
                </div>

                <div>
                  Balance: {balance / 10 ** decimals} {symbol || asset.slice(0, 9) + "..."}
                </div>

                <div>
                  Accumulated reward:{" "}
                  <Tooltip
                    placement="right"
                    trigger={["hover"]}
                    overlay={
                      <span>
                        {expected_reward_view} {oswap_symbol}
                      </span>
                    }
                  >
                    <span>${Number(oswap_token_price_usd * expected_reward_view).toPrecision(4)}</span>
                  </Tooltip>
                </div>

                {APY ? (
                  <Tooltip placement="right" trigger={["hover"]} overlay={<span>≈${+daily_pool_income_usd.toPrecision(4)} / day</span>}>
                    <span> APY: {APY}%</span>
                  </Tooltip>
                ) : null}
              </div>

              <div className="flex flex-wrap mt-5 md:mt-0 md:flex-col md:items-end">
                <div className="mb-2 mr-4 md:mr-0">
                  <QRButton onClick={sendRewardEvent} type="light" href={withdrawRewardUrl}>
                    Get reward
                  </QRButton>
                </div>

                <div className="md:mt-3">
                  <QRButton onClick={sendWithdrawEvent} type="light" href={withdrawUrl}>
                    Withdraw
                  </QRButton>
                </div>
              </div>
            </div>
          );
        }
      )}

      {maxPage - 1 > page && (
        <div className="flex justify-center mt-5">
          <Button type="text" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

const useLoadDepositMeta = (deposits, pools, page = 1) => {
  const [depositsWithData, setDepositsWithData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const updateDeposits = async (deposits, page) => {
      const newDeposits = deposits.slice(0, POOLS_PER_PAGE * page);

      newDeposits.forEach(({ asset_key }, index) => {
        const pool = pools.find((p) => p.asset_key === asset_key);

        newDeposits[index] = {
          ...newDeposits[index],
          ...pool,
        };
      });

      setDepositsWithData(newDeposits);
      setLoading(false);
    };

    updateDeposits(deposits, page);
  }, [deposits, page, pools]);

  return [depositsWithData, loading];
};
