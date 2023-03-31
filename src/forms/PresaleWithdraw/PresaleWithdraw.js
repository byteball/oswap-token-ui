import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactGA from "react-ga";

import { Input, Spin } from "components/atoms";
import { QRButton, QuestionTooltip } from "components/molecules";

import { selectSettings, selectStateVars, selectStateVarsLoading, selectTokenInfo } from "store/slices/agentSlice";
import { selectPresaleAddress, selectWalletAddress } from "store/slices/settingsSlice";

import { generateLink, getCountOfDecimals, getExchangeResult } from "utils";

import { selectPresaleStateVars, selectPresaleStateVarsLoading } from "store/slices/presaleSlice";
import { get_presale_prices } from "utils/getExchangeResult";

export const PresaleWithdrawForm = () => {
  const refBtn = useRef(null);

  const [amount, setAmount] = useState({ value: "", valid: true });

  const presaleStateVars = useSelector(selectPresaleStateVars);
  const presaleStateVarsLoading = useSelector(selectPresaleStateVarsLoading);
  const stateVarsLoading = useSelector(selectStateVarsLoading);

  const stateVars = useSelector(selectStateVars);
  const settings = useSelector(selectSettings);
  const { decimals } = useSelector(selectTokenInfo);
  const walletAddress = useSelector(selectWalletAddress);
  const presaleAaAddress = useSelector(selectPresaleAddress);

  if (presaleStateVarsLoading || stateVarsLoading) return <Spin />;

  const maxAmount = walletAddress ? presaleStateVars[`user_${walletAddress}`] : presaleStateVars.total || 0;
  const maxAmountView = +Number((maxAmount || 0) / 10 ** decimals).toPrecision(9)

  const handleChange = (ev) => {
    const value = ev.target.value.trim();

    if (getCountOfDecimals(value) <= 9 && value <= 1e6) {
      setAmount({ value, valid: !isNaN(Number(value)) && Number(value) > 0 && value <= maxAmount / 1e9 });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (amount.valid && amount.value) {
        refBtn.current.click();
      }
    }
  };

  const sendWithdrawEvent = () => {
    ReactGA.event({
      category: "Presale",
      action: "Withdraw",
      label: walletAddress,
    });
  };

  const new_reserve = presaleStateVars.total - (amount.valid ? amount.value * 1e9 : 0);

  const { final_price } = get_presale_prices(new_reserve);
  const newPriceView = +Number(final_price).toPrecision(9);

  const exchangeResult = getExchangeResult(amount.valid ? amount.value * 10 ** decimals : 0, 0, stateVars.state, settings);

  const link = generateLink({
    amount: 1e4,
    aa: presaleAaAddress,
    from_address: walletAddress,
    data: { withdraw: 1, amount: +Number(amount.value * 1e9).toFixed(9) },
    is_single: true
  });

  let error = "";

  if (amount.value) {
    if (maxAmount && amount.value > maxAmount / 1e9) {
      error = `Max amount ${maxAmountView} GBYTE`;
    }
  }

  return (
    <div>
      <div className="mb-2 text-primary-gray-light">
        You can withdraw your GBYTEs if you changed your mind and no longer want to buy OSWAP tokens in the initial sale.
      </div>

      <Input
        placeholder="Amount to withdraw"
        value={amount.value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        error={error}
        suffix="GBYTE"
        extra={
          maxAmount > 0 && (
            <span className="cursor-pointer text-primary-gray-light" onClick={() => setAmount({ value: maxAmountView, valid: true })}>
              max: {maxAmountView} GBYTE
            </span>
          )
        }
      />

      <div className="pt-2 text-white align-middle cursor-default">
        <div className="flex flex-wrap items-center mb-1 font-medium sm:mb-0">
          <div className="mr-1 text-primary-gray-light">
            New price
            <QuestionTooltip description="New initial price of OSWAP token after your withdrawal. Tokens get cheaper if less capital is committed to buying them." />
          </div>
          <span className="w-full sm:w-auto">{newPriceView} GBYTE</span>
        </div>

        <QRButton
          type={exchangeResult.fee_percent < 15 ? "primary" : "danger"}
          ref={refBtn}
          className="mt-4"
          onClick={sendWithdrawEvent}
          href={link}
          disabled={!amount.valid || !amount.value}
        >
          Send {amount.valid && amount.value ? amount.value : ""} GBYTE
        </QRButton>
      </div>
    </div>
  );
};
