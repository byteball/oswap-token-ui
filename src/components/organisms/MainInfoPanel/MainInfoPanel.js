import { memo } from "react";
import { useSelector } from "react-redux";

import { InfoPanel } from "components/molecules";

import { selectSettings, selectStateVars, selectStateVarsLoading, selectTokenInfo, selectTVLs } from "store/slices/agentSlice";
import { convertBigNum, getCurrentPrice } from "utils";
import { getAppreciationState, getExchangeResult } from "utils/getExchangeResult";

const PRECISION = 6;

export const MainInfoPanel = memo(() => {
  const stateVars = useSelector(selectStateVars);
  const TVLs = useSelector(selectTVLs);
  const settings = useSelector(selectSettings);

  const { symbol = "", decimals = 0 } = useSelector(selectTokenInfo);

  const { state: old_state } = stateVars;
  const stateVarsLoading = useSelector(selectStateVarsLoading);
  const appreciationRate = (settings.base_rate * TVLs.current) / TVLs.base;
  const appreciationRateView = +Number(appreciationRate * 100).toPrecision(PRECISION);

  const state = getAppreciationState(old_state, appreciationRate);
  const supplyView = Number(state.supply / 10 ** decimals).toPrecision(PRECISION);

  const baseTVLView = convertBigNum(TVLs.base, PRECISION);
  const currentTVLView = convertBigNum(TVLs.current, PRECISION);
  const currentPrice = getCurrentPrice(state);
  const currentPriceView = Number(currentPrice).toPrecision(PRECISION);
  const stakedBalance = old_state?.total_staked_balance ?? 0;
  const notStakedBalance = old_state?.supply ? old_state?.supply - stakedBalance : 0;
  const dryRunExchangeResult = getExchangeResult(notStakedBalance, 0, stateVars.state, settings);
  const floorPice = Number(dryRunExchangeResult.new_price).toPrecision(PRECISION);
  const stakedInPercent = state.supply ? Number((stakedBalance / state.supply) * 100).toPrecision(PRECISION) : 0;

  return (
    <InfoPanel loading={stateVarsLoading}>
      <InfoPanel.Item name="CURRENT PRICE" value={currentPriceView} suffix={<small className="text-sm"> GBYTE</small>} />
      <InfoPanel.Item
        name="APPRECIATION RATE"
        description={<span>Current yearly appreciation rate of OSWAP token</span>}
        value={appreciationRateView}
        suffix="%"
      />
      <InfoPanel.Item name="OSWAP TVL" description="Total value locked in all Oswap pools" value={currentTVLView} prefix="$" />
      <InfoPanel.Item
        name="TARGET APPRECIATION/TVL"
        value={
          <span>
            {+(settings.base_rate * 100).toFixed(2)}% / ${baseTVLView}
          </span>
        }
        description="Target appreciation rate of OSWAP token and the TVL when it is to be reached. If the actual TVL is smaller or larger than the target, the appreciation rate is scaled proportionally."
      />
      <InfoPanel.Item name="SUPPLY" value={supplyView} suffix={<small className="text-sm"> {symbol}</small>} />
      <InfoPanel.Item name="SHARE OF LOCKED TOKENS" value={stakedInPercent} suffix={"%"} />
      <InfoPanel.Item
        name="FLOOR PRICE"
        description="The price of OSWAP token if all freely circulating OSWAP tokens were sold (and the supply became equal to the locked supply)."
        value={floorPice}
        suffix={<small className="text-sm"> {symbol}</small>}
      />
    </InfoPanel>
  );
});
