import { isEmpty } from "lodash";
import moment from "moment";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ReactGA from "react-ga";

import { QRButton } from "components/molecules";
import { selectPools, selectSettings, selectStateVars, selectTokenInfo, selectUserData } from "store/slices/agentSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";
import { getAppreciationState } from "utils/getExchangeResult";

import { generateLink } from "utils";
import appConfig from "appConfig";

// TODO: Fix this component from multi group

export const UnstakeForm = () => {
  const userData = useSelector(selectUserData);
  const walletAddress = useSelector(selectWalletAddress);
  const pools = useSelector(selectPools);
  const { symbol, decimals } = useSelector(selectTokenInfo);
  const stateVars = useSelector(selectStateVars);
  const { appreciation_rate, inflation_rate, stakers_share } = useSelector(selectSettings);

  // calc
  const firstVoteAssetKey = Object.keys(userData?.votes)?.[0];
  const firstVotePool = pools.find(({ asset_key }) => asset_key === firstVoteAssetKey);
  const firstVotePoolGroup = firstVotePool?.group_key;
  const momentExpiryTs = userData.expiry_ts ? moment.unix(userData.expiry_ts) : null;
  const link = generateLink({ amount: 1e4, aa: appConfig.AA_ADDRESS, from_address: walletAddress, data: { unstake: 1, group_key: firstVotePoolGroup }, is_single: !walletAddress });
  const isExpired = momentExpiryTs ? momentExpiryTs.isBefore() : false;

  if (isEmpty(userData) || !momentExpiryTs) {
    return <div className="mb-5 text-base font-medium text-primary-gray-light">You don't have any staked tokens</div>;
  }

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

  const sendUnstakeEvent = () => {
    ReactGA.event({
      category: "OSWAP_TOKEN",
      action: "Unstake",
      label: walletAddress,
    });
  };

  const rewardView = Number(reward / 10 ** decimals).toFixed(decimals);

  return (
    <div>
      <Helmet>
        <title>OSWAP token — Unstake oswap token</title>
      </Helmet>

      <div className="mb-5 text-base font-medium text-primary-gray-light">
        {!isExpired ? (
          <>You can unstake on {momentExpiryTs?.format("LL")}.</>
        ) : (
          reward > 0 && (
            <>
              You have ≈{rewardView} {symbol} unclaimed reward,{" "}
              <Link to="/governance/shares/rewards" className="text-primary">
                claim it
              </Link>{" "}
              before unstaking, otherwise you lose it.
            </>
          )
        )}
      </div>

      <QRButton onClick={sendUnstakeEvent} type="primary" href={link} disabled={!isExpired}>
        Unstake
      </QRButton>
    </div>
  );
};
