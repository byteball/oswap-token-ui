import { isEmpty } from "lodash";
import moment from "moment";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ReactGA from "react-ga";

import { QRButton } from "components/molecules";

import { selectSettings, selectStateVars, selectTokenInfo, selectUserData } from "store/slices/agentSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";
import { getAppreciationState } from "utils/getExchangeResult";

import appConfig from "appConfig";
import { generateLink } from "utils";

export const RewardForm = () => {
  // selectors
  const userData = useSelector(selectUserData);
  const walletAddress = useSelector(selectWalletAddress);
  const { symbol, decimals } = useSelector(selectTokenInfo);
  const stateVars = useSelector(selectStateVars);
  const { appreciation_rate, inflation_rate, stakers_share } = useSelector(selectSettings);

  if (isEmpty(userData)) {
    return <div className="mb-5 text-base font-medium text-primary-gray-light">You don't have staked tokens</div>;
  }

  // calc
  const ts = moment().unix();
  let reward = 0;

  const new_state = { ...getAppreciationState(stateVars.state, appreciation_rate) };

  const total_new_emissions = new_state.total_normalized_vp ? ((ts - new_state.last_emissions_ts) / appConfig.YEAR) * inflation_rate * new_state.supply : 0;

  new_state.last_emissions_ts = ts;
  new_state.stakers_emissions = new_state.stakers_emissions + stakers_share * total_new_emissions;
  new_state.lp_emissions = new_state.lp_emissions + (1 - stakers_share) * total_new_emissions;

  const new_emissions_since_prev_visit = new_state.stakers_emissions - userData.last_stakers_emissions;

  if (userData.normalized_vp && new_state.total_normalized_vp) {
    reward = (new_emissions_since_prev_visit * userData.normalized_vp) / new_state.total_normalized_vp;
  }

  const rewardView = Number(reward / 10 ** decimals).toFixed(decimals);

  const link = generateLink({ amount: 1e4, aa: appConfig.AA_ADDRESS, from_address: walletAddress, data: { withdraw_staking_reward: 1 }, is_single: !walletAddress });

  const sendRewardEvent = () => {
    ReactGA.event({
      category: "OSWAP_TOKEN",
      action: "Reward",
      label: walletAddress,
    });
  };

  return (
    <div>
      <Helmet>
        <title>OSWAP token — Staking reward</title>
      </Helmet>

      <div className="mb-5 text-base font-medium text-primary-gray-light">
        Withdraw the reward accrued for locking your OSWAP tokens. If you'd like to re-stake the reward tokens, use the{" "}
        <Link className="text-primary" to="/governance/shares/stake">
          “Stake” tab
        </Link>
        .
      </div>

      <div className="mb-5">
        <b>
          You get ≈{rewardView} {symbol}
        </b>
      </div>

      <QRButton type="primary" onClick={sendRewardEvent} href={link} disabled={reward <= 0}>
        Withdraw rewards
      </QRButton>
    </div>
  );
};
