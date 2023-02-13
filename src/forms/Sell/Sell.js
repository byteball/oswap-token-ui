import { useRef, useState } from "react";
import { isEmpty } from "lodash";
import { useSelector } from "react-redux";

import { EstimatedTranView, SettingsModal } from "components/organisms";
import { QRButton } from "components/molecules";
import { Input, Spin } from "components/atoms";

import { selectSettings, selectStateVars, selectTokenInfo } from "store/slices/agentSlice";
import { selectSlippageTolerance, selectWalletAddress } from "store/slices/settingsSlice";

import { generateLink, getExchangeResult, getCountOfDecimals } from "utils";
import appConfig from "appConfig";

export const SellForm = () => {
  // state
  const [amount, setAmount] = useState({ value: "0.001", valid: true });

  // selectors
  const stateVars = useSelector(selectStateVars);
  const settings = useSelector(selectSettings);
  const { symbol, decimals } = useSelector(selectTokenInfo);
  const walletAddress = useSelector(selectWalletAddress);
  const currentSlippageTolerance = useSelector(selectSlippageTolerance);

  // other hooks
  const refBtn = useRef(null);

  if (isEmpty(stateVars.state)) return <Spin />;

  const exchangeResult = getExchangeResult(amount.valid ? amount.value * 10 ** decimals : 0, 0, stateVars.state, settings);

  const handleChange = (ev) => {
    const value = ev.target.value;

    if (getCountOfDecimals(value) <= 9 && value <= 1e6) {
      setAmount({ value, valid: !isNaN(Number(value)) && Number(value) > 0 && value <= stateVars.state.supply / 1e9 });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (amount.valid && amount.value && !exchangeResult.blocked) {
        refBtn.current.click();
      }
    }
  };

  const maxAmountView = Number(stateVars.state.supply / 10 ** decimals).toPrecision(9);
  const min_reserve_tokens = exchangeResult.payout - (exchangeResult.payout * currentSlippageTolerance) / 100;
  const link = generateLink({
    amount: Math.ceil(amount.value * 1e9),
    asset: stateVars.constants.asset,
    aa: appConfig.AA_ADDRESS,
    from_address: walletAddress,
    data: { min_reserve_tokens },
  });

  let error = "";

  if (amount.value) {
    if (amount.value > stateVars.state.supply / 10 ** decimals) {
      error = `Max amount ${maxAmountView} ${symbol}`;
    }
  }

  return (
    <div className="relative">
      <div className="mb-1 text-primary-gray-light">You send: </div>
      <Input placeholder="Amount" value={amount.value} onChange={handleChange} onKeyDown={handleKeyDown} error={error} suffix={symbol} />

      <div className="pt-2 text-white align-middle cursor-default">
        <div className="flex flex-wrap mb-2 text-lg">
          You get{" "}
          <div className="w-full ml-0 sm:ml-1 sm:w-auto">
            ≈{+Number(exchangeResult.payout / 1e9).toFixed(9)} <small>GBYTE</small>
          </div>
        </div>

        <EstimatedTranView result={exchangeResult} />

        <QRButton
          type={exchangeResult.fee_percent < 15 ? "primary" : "danger"}
          ref={refBtn}
          className="mt-4"
          href={link}
          disabled={!amount.valid || !amount.value || exchangeResult.blocked}
        >
          Send {amount.valid && amount.value ? amount.value : ""} {symbol}
        </QRButton>
        {exchangeResult.fee_percent >= 15 && <div className="pt-1 text-xs text-red-700">You pay too much commission because you change the price too much</div>}
      </div>

      <div className="absolute top-[-18px] right-[-18px]">
        <SettingsModal />
      </div>
    </div>
  );
};
