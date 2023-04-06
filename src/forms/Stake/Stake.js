import { useEffect, useRef, useState } from "react";
import { isInteger } from "lodash";
import { useSelector } from "react-redux";
import moment from "moment";
import { Helmet } from "react-helmet-async";
import ReactGA from "react-ga";
import { useLocation } from "react-router-dom";

import { Input, NumSlider, Switch } from "components/atoms";
import { QRButton } from "components/molecules";
import { DistributionList } from "components/organisms";

import { selectPools, selectSettings, selectStateVars, selectTokenInfo, selectUserData } from "store/slices/agentSlice";
import { selectPresaleAddress, selectWalletAddress } from "store/slices/settingsSlice";
import { selectPresaleStateVars } from "store/slices/presaleSlice";
import { selectWalletBalance } from "store/slices/userWalletSlice";

import { generateLink, getCountOfDecimals } from "utils";
import appConfig from "appConfig";

const YEAR = 31104000; // 360 * 24 * 3600;
const MAX_TERM = 4 * 360; // in days

export const StakeForm = () => {
  // states
  const [distributions, setDistributions] = useState([]);
  const [amount, setAmount] = useState({ value: "", valid: true });
  const [term, setTerm] = useState({ value: MAX_TERM, valid: true });
  const [presaleFunds, setPresaleFunds] = useState(false);
  const [stakeReward, setStakeReward] = useState(false);

  // selectors
  const stateVars = useSelector(selectStateVars);
  const walletAddress = useSelector(selectWalletAddress);
  const { symbol, decimals, asset } = useSelector(selectTokenInfo);
  const pools = useSelector(selectPools);
  const userData = useSelector(selectUserData);
  const presaleStateVars = useSelector(selectPresaleStateVars);
  const userBalance = useSelector(selectWalletBalance);
  const { inflation_rate, stakers_share } = useSelector(selectSettings);
  const minTerm = userData?.expiry_ts ? Math.abs(moment.utc().diff(moment.unix(userData?.expiry_ts), "days")) + 1 : 14;
  const presaleAaAddress = useSelector(selectPresaleAddress);

  const location = useLocation();

  useEffect(() => {
    setTerm({ value: MAX_TERM, valid: true });
  }, [minTerm]);

  useEffect(() => {
    if (presaleFunds) {
      setStakeReward(false);
    }
  }, [presaleFunds]);

  // other hooks
  const btnRef = useRef(null);

  useEffect(() => {
    if (pools.length >= 1) {
      const distributions = (pools.length !== 1 ? ["a1", "a2"] : ["a1"]).map((key, index) => {
        const data = pools.find(({ asset_key }) => asset_key === key);

        return {
          ...data,
          percent: pools.length === 1 ? 100 : 50,
        };
      });

      setDistributions(distributions);
    }
  }, [pools]);

  // calc
  const tokenBalance = userBalance?.[asset]?.total || 0;
  const tokenBalanceView = Number(tokenBalance / 10 ** decimals).toFixed(decimals);

  const percentages = {};
  distributions.forEach(({ asset_key, percent }) => (percentages[asset_key] = Number(percent)));
  const distributionSum = distributions.reduce((acc, current) => acc + Number(current.percent), 0);
  const group_key = distributions.length > 0 ? distributions[0].group_key : false;

  const link = generateLink({
    amount: presaleFunds || (stakeReward && (!amount.valid || Number(amount.value) === 0)) ? 1e4 : Math.ceil(amount.value * 10 ** decimals),
    asset: presaleFunds || (stakeReward && (!amount.valid || Number(amount.value) === 0)) ? "base" : stateVars.constants.asset,
    aa: presaleFunds ? presaleAaAddress : appConfig.AA_ADDRESS,
    from_address: walletAddress,
    data: {
      term: !presaleFunds ? term.value : undefined,
      stake: 1,
      group_key,
      percentages,
      to: presaleFunds ? walletAddress : undefined,
      stake_reward: stakeReward ? 1 : undefined,
    },
    is_single: !walletAddress
  });
  const disabled =
    (!stakeReward && (!amount.valid || !amount.value) && !presaleFunds) ||
    !term.valid ||
    !term.value ||
    Number(distributionSum) !== 100 ||
    distributions.find((d) => !d.asset);

  const userPresaleBalance = presaleStateVars[`user_${walletAddress}`] || 0;
  const userPresaleBalanceView = +Number(userPresaleBalance / 10 ** decimals).toFixed(decimals);

  const userPresaleTokenBalance = presaleStateVars.total ? (userPresaleBalance / (presaleStateVars.total)) * presaleStateVars.tokens : 0;
  const userPresaleTokenBalanceView = +Number(userPresaleTokenBalance / 10 ** decimals).toFixed(decimals);

  const ts = moment.utc().unix();
  let btnLabel = "";
  let reward = 0;

  const new_state = { ...stateVars.state };

  const total_new_emissions = new_state.total_normalized_vp ? ((ts - new_state.last_emissions_ts) / YEAR) * inflation_rate * new_state.supply : 0;

  new_state.last_emissions_ts = ts;
  new_state.stakers_emissions = new_state.stakers_emissions + stakers_share * total_new_emissions;
  new_state.lp_emissions = new_state.lp_emissions + (1 - stakers_share) * total_new_emissions;

  const new_emissions_since_prev_visit = new_state.stakers_emissions - userData.last_stakers_emissions;

  if (userData.normalized_vp && new_state.total_normalized_vp) {
    reward = (new_emissions_since_prev_visit * userData.normalized_vp) / new_state.total_normalized_vp;
  }

  const userRewardBalanceView = +Number((reward || 0) / 10 ** decimals).toFixed(decimals);

  if (presaleFunds) {
    btnLabel += `Send the initial sale funds`;
  } else if (stakeReward && (!amount.value || !amount.valid)) {
    btnLabel += `Stake rewards`;
  } else if (!disabled) {
    btnLabel += `Send ${amount.value} ${symbol}`;
  } else {
    btnLabel = "Send";
  }

  const newBalance =
    (userData?.balance || 0) + ((stakeReward ? reward || 0 : 0) + (presaleFunds ? userPresaleTokenBalance : 0) + (!presaleFunds ? amount.value : 0) * 10 ** decimals || 0);
  const final_voting_power = newBalance / 256;
  const newNormalizedVP = final_voting_power * 4 ** (term.value / 360 + (moment.utc().unix() - appConfig.COMMON_TS) / YEAR);

  const diffUserVp = newNormalizedVP - userData.normalized_vp;

  const stakeAPY =
    stateVars?.state?.total_normalized_vp && newBalance
      ? ((((inflation_rate * stakers_share * stateVars?.state?.supply) / newBalance) * (newNormalizedVP || 0)) /
          (stateVars?.state?.total_normalized_vp + diffUserVp)) *
        100
      : 0;

  const newVPView = +Number(newNormalizedVP / 4 ** ((moment.utc().unix() - appConfig.COMMON_TS) / appConfig.YEAR) / 10 ** decimals).toFixed(decimals);

  // handles
  const handleChange = (ev) => {
    const value = ev.target.value.trim();

    if (getCountOfDecimals(value) <= 9 && value <= 1e6) {
      setAmount({ value, valid: !isNaN(Number(value)) && Number(value) > 0 });
    }
  };

  const handleChangeTerm = (value) => {
    if (isInteger(Number(value)) && value <= 1e6 && value >= minTerm) {
      setTerm({ value, valid: !isNaN(Number(value)) && Number(value) >= minTerm && value <= 4 * 360 });
    }
  };

  const handleKeyDown = (ev) => {
    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      if (!disabled && btnRef.current) {
        btnRef.current.click();
      }
    }
  };

  const fillMaxAmount = () => {
    if (tokenBalance) {
      setAmount({ value: tokenBalanceView, valid: true });
    }
  };

  const sendStakeEvent = () => {
    ReactGA.event({
      category: "OSWAP_TOKEN",
      action: "Stake",
      label: walletAddress,
    });
  };

  let termView = term.value || 0;
  const termDateView = moment.utc().add(termView, 'd')?.format("LL");

  if (termView >= 360) {
    const years = Math.trunc(termView / 360);
    const days = termView - years * 360;

    termView = `${years} year${years > 1 ? "s" : ""} ${days || ""} ${days > 0 ? "day" : ""}${days > 1 ? "s" : ""}`;
  } else {
    termView = `${termView} day${termView > 1 ? "s" : ""}`;
  }

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    if (search.get("stake_reward")) {
      if (reward && reward > 0) {
        setStakeReward(true);
      }
    }
  }, [location]);

  return (
    <div>
      <Helmet>
        <title>OSWAP token — Stake and vote</title>
      </Helmet>

      <div className="mb-5 text-base font-medium text-primary-gray-light">
        Lock more OSWAP tokens and decide how your newly added voting power is to be distributed among pools. This affects the share of rewards they receive.
      </div>

      {userPresaleBalance ? (
        <div className="mb-5">
          <Switch value={presaleFunds} onChange={setPresaleFunds}>
            Spend the initial sale funds ({userPresaleBalanceView} GBYTE = {userPresaleTokenBalanceView} {symbol})
          </Switch>
        </div>
      ) : null}

      {!presaleFunds && (
        <>
          {userData.reward >= 0 ? (
            <div className="mb-5">
              <Switch value={stakeReward} onChange={setStakeReward}>
                Stake the accrued reward ({userRewardBalanceView} {symbol})
              </Switch>
            </div>
          ) : null}

          <div className="mb-5">
            <Input
              placeholder="Amount"
              onKeyDown={handleKeyDown}
              suffix={symbol}
              value={amount.value}
              onChange={handleChange}
              extra={
                tokenBalance > 0 && (
                  <span className="cursor-pointer text-primary-gray-light" onClick={fillMaxAmount}>
                    max: {tokenBalanceView} {symbol}
                  </span>
                )
              }
            />
          </div>
        </>
      )}

      <div className="mb-2 text-primary-gray-light">VP distribution</div>
      <DistributionList distributions={distributions} setDistributions={setDistributions} />

      {!presaleFunds && (
        <div className="mb-5">
          <NumSlider minLabelValue={minTerm} className="mt-5" onChange={handleChangeTerm} value={term.value} min={14} max={MAX_TERM} />
          <small>Locking term: {termView} — until {termDateView} {!!userData?.normalized_vp && '(this applies to the previously locked tokens too)'}</small>
        </div>
      )}

      <div className="mb-2">
        <div>
          <b>New VP: </b>
          {newVPView}
        </div>
      </div>

      <div className="mb-5">
        <div>
          <b>New APY: </b>
          {+Number(stakeAPY).toFixed(2)}%
        </div>
      </div>

      <QRButton ref={btnRef} onClick={sendStakeEvent} type="primary" className="mt-2 mb-2" href={link} disabled={disabled}>
        {btnLabel}
      </QRButton>
    </div>
  );
};
