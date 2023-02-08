import { isEmpty } from "lodash";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import moment from "moment";
import { Link } from "react-router-dom";

import { Button, Spin, Warning } from "components/atoms";
import { WalletModal, Dashboard } from "components/organisms";

import { GovernanceLayout } from "components/templates/GovernanceLayout/GovernanceLayout";
import { selectSettings, selectStateVars, selectStateVarsLoading, selectTokenInfo, selectUserData } from "store/slices/agentSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";
import { selectWalletBalance } from "store/slices/userWalletSlice";
import { generateLink, getActualVpByNormalized } from "utils";
import { getAppreciationState } from "utils/getExchangeResult";

import appConfig from "appConfig";

export default () => {
  // selectors
  const stateVars = useSelector(selectStateVars);
  const walletAddress = useSelector(selectWalletAddress);
  const userData = useSelector(selectUserData);
  const { symbol, decimals, asset } = useSelector(selectTokenInfo);
  const userBalance = useSelector(selectWalletBalance);
  const { appreciation_rate, inflation_rate, stakers_share } = useSelector(selectSettings);

  const stateVarsLoading = useSelector(selectStateVarsLoading);

  if (isEmpty(stateVars) || isEmpty(userData) || stateVarsLoading) {
    return (
      <GovernanceLayout>
        <Spin className="mt-12" />
      </GovernanceLayout>
    );
  }

  const ts = moment().unix();

  // balances
  const tokenWalletBalance = userBalance?.[asset]?.total || 0;
  const tokenWalletBalanceView = tokenWalletBalance / 10 ** decimals;

  const lockedBalance = userData.balance || 0;
  const lockedBalanceView = lockedBalance / 10 ** decimals;

  const expiryTsMoment = userData?.expiry_ts ? moment.unix(userData?.expiry_ts) : null;
  const isExpired = expiryTsMoment ? expiryTsMoment.isBefore() : false;

  // VP
  const userActualVotingPower = userData?.normalized_vp ? getActualVpByNormalized(userData?.normalized_vp) : 0;
  const userActualVotingPowerView = userActualVotingPower / 10 ** decimals;
  const percentOfMaximumVotingPower = userActualVotingPower ? (100 - ((userData?.balance - userActualVotingPower) / userData?.balance) * 100).toFixed(2) : 100;

  // rewards
  const appreciationState = getAppreciationState(stateVars.state, appreciation_rate);

  const total_new_emissions =
    appreciationState.total_normalized_vp || 0
      ? ((ts - (appreciationState.last_emissions_ts || 0)) / appConfig.YEAR) * inflation_rate * (appreciationState.supply || 0)
      : 0;

  appreciationState.last_emissions_ts = ts;

  appreciationState.stakers_emissions = (appreciationState.stakers_emissions || 0) + stakers_share * total_new_emissions;

  const newEmissionsSincePrevVisit = appreciationState.stakers_emissions - (userData.last_stakers_emissions || 0);

  const reward =
    appreciationState.total_normalized_vp !== 0 ? (newEmissionsSincePrevVisit * (userData.normalized_vp || 0)) / appreciationState.total_normalized_vp : 0;

  const rewardView = reward / 10 ** decimals;

  const stakeAPY =
    stateVars?.state?.total_normalized_vp && userData?.balance
      ? ((inflation_rate * stakers_share * stateVars?.state?.supply * (userData?.normalized_vp || 0)) /
          ((userData?.balance || 0) * stateVars?.state?.total_normalized_vp)) *
        100
      : 0;

  const stakeAPYView = +stakeAPY.toFixed(4);

  // links
  const withdrawStakingLink = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS,
    from_address: walletAddress,
    data: { unstake: 1, group_key: "g1" }, // TODO: fix it
  });

  return (
    <GovernanceLayout>
      <Helmet>
        <title>OSWAP token — OSWAP token governance</title>
      </Helmet>

      <h2 className="mb-3 text-3xl font-bold leading-tight">OSWAP token governance</h2>

      <div className="text-base font-medium text-primary-gray-light">
        Lock your OSWAP tokens for up to 4 years to participate in governance and receive a share of OSWAP token emissions. Larger locking periods give you more
        voting power (VP) and a larger share of emissions. With larger VP, you have more influence on the distribution of rewards among incentivized pools.
      </div>

      {!walletAddress ? (
        <WalletModal hideIfHas={true}>
          <div>
            <Warning className="w-auto mt-5 cursor-pointer">Please add your wallet address to display your data</Warning>
          </div>
        </WalletModal>
      ) : (
        <Dashboard>
          <Dashboard.Item
            title="Locked balance"
            value={lockedBalanceView}
            currency={symbol}
            extraValue={
              isExpired ? (
                <Button type="text-primary" className="leading-none text-[14px]" href={withdrawStakingLink}>
                  unstake
                </Button>
              ) : (
                !!expiryTsMoment && <span className="text-[14px]">Locked until: {expiryTsMoment?.format("LL")}</span>
              )
            }
          />

          <Dashboard.Item
            title="Unclaimed rewards"
            value={rewardView}
            currency={symbol}
            extraValue={
              <div className="space-x-2">
                {reward > 0 && (
                  <Link className="leading-none text-[14px] text-primary font-medium" to="/governance/shares/rewards">
                    claim now
                  </Link>
                )}

                {reward > 0 && (
                  <Link className="leading-none text-[14px] text-primary font-medium" to="/governance/shares/stake?stake_reward=1">
                    claim and restake
                  </Link>
                )}
              </div>
            }
          />

          <Dashboard.Item
            title="Wallet balance"
            value={tokenWalletBalanceView}
            currency={symbol}
            extraValue={
              <WalletModal>
                <Button type="text-primary" className="leading-none text-[14px]">
                  Wallet
                </Button>
              </WalletModal>
            }
          />

          <Dashboard.Item
            title="Voting power"
            value={userActualVotingPowerView}
            currency={symbol}
            extraValue={
              userActualVotingPower ? (
                <span className="text-[14px]">
                  {percentOfMaximumVotingPower}% of the maximum VP available <br /> with your locked balance
                </span>
              ) : null
            }
          />

          <Dashboard.Item title="Staking APY" value={stakeAPYView} currency="%" />
        </Dashboard>
      )}
    </GovernanceLayout>
  );
};
