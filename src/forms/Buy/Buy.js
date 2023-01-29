import { createRef, useState } from "react";
import { useSelector } from "react-redux";

import { EstimatedTranView } from "components/organisms";
import { QRButton } from "components/molecules";
import { Input, Spin } from "components/atoms";

import { selectSettings, selectStateVars, selectStateVarsLoading, selectTokenInfo } from "store/slices/agentSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";
import { selectPresaleStateVarsLoading } from "store/slices/presaleSlice";

import { generateLink, getExchangeResult, getCountOfDecimals } from "utils";

import appConfig from "appConfig";

export const BuyForm = () => {
  // state
  const [amount, setAmount] = useState({ value: "0.0001", valid: true });

  // selectors
  const stateVars = useSelector(selectStateVars);
  const settings = useSelector(selectSettings);
  const walletAddress = useSelector(selectWalletAddress);
  const presaleStateVarsLoading = useSelector(selectPresaleStateVarsLoading);
  const stateVarsLoading = useSelector(selectStateVarsLoading);
  const { symbol, decimals } = useSelector(selectTokenInfo);

  // other hooks
  const btnRef = createRef(null);

  // handlers
  const handleChange = (ev) => {
    const value = ev.target.value;

    if (getCountOfDecimals(value) <= 9 && value <= 1e6) {
      setAmount({ value, valid: !isNaN(Number(value)) && Number(value) > 0 });
    }
  };

  const handleKeyDown = (ev) => {
    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      if (amount.valid && amount.value && amount.value >= 0.0001 && !exchangeResult.blocked) {
        btnRef.current.click();
      }
    }
  };

  if (presaleStateVarsLoading || stateVarsLoading) return <Spin />;

  const exchangeResult = getExchangeResult(0, amount.valid ? amount.value * 1e9 : 0, stateVars.state, settings);

  const link = generateLink({ amount: Math.ceil(amount.value * 1e9), aa: appConfig.AA_ADDRESS, from_address: walletAddress });

  return (
    <div>
      <Input
        placeholder="Amount"
        suffix="GBYTE"
        error={amount.value && amount.valid && amount.value < 0.0001 ? "Min amount 0.0001" : null}
        value={amount.value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      <div className="pt-2 text-white align-middle cursor-default">
        <div className="flex flex-wrap mb-2 text-lg">
          You get{" "}
          <div className="w-full ml-0 sm:ml-1 sm:w-auto">
            ≈{+Number(exchangeResult.delta_s / 10 ** decimals).toFixed(decimals)} <small>{symbol}</small>
          </div>
        </div>

        <EstimatedTranView result={exchangeResult} />

        <QRButton
          ref={btnRef}
          type={exchangeResult.fee_percent < 15 ? "primary" : "danger"}
          className="mt-4"
          href={link}
          disabled={!amount.valid || !amount.value || amount.value < 0.0001 || exchangeResult.blocked}
        >
          Send {amount.valid && amount.value ? amount.value : ""} GBYTE
        </QRButton>

        {exchangeResult.fee_percent >= 15 && exchangeResult.fee_percent < 100 ? (
          <div className="pt-1 text-xs text-red-700">You pay a large commission because you change the price too much</div>
        ) : null}
        {exchangeResult.fee_percent >= 100 ? (
          <div className="pt-1 text-xs text-red-700">The fee would be above 100% because you change the price too much</div>
        ) : null}
      </div>
    </div>
  );
};
