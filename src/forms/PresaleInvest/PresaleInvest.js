import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactGA from "react-ga";

import { Input, Spin } from "components/atoms";
import { QRButton, QuestionTooltip } from "components/molecules";

import { selectSettings, selectStateVarsLoading, selectTokenInfo } from "store/slices/agentSlice";
import { selectPresaleAddress, selectWalletAddress } from "store/slices/settingsSlice";

import { generateLink, getCountOfDecimals } from "utils";

import { selectPresaleStateVars, selectPresaleStateVarsLoading } from "store/slices/presaleSlice";
import { get_presale_prices } from "utils/getExchangeResult";

export const PresaleInvestForm = ({ frozen }) => {
  const btnRef = useRef(null);

  const [amount, setAmount] = useState({ value: "0.1", valid: true });

  const presaleStateVars = useSelector(selectPresaleStateVars);
  const presaleStateVarsLoading = useSelector(selectPresaleStateVarsLoading);
  const stateVarsLoading = useSelector(selectStateVarsLoading);
  const walletAddress = useSelector(selectWalletAddress);
  const { symbol, decimals } = useSelector(selectTokenInfo);
  const presaleAaAddress = useSelector(selectPresaleAddress);
  const { inflation_rate, stakers_share } = useSelector(selectSettings);

  if (presaleStateVarsLoading || stateVarsLoading) return <Spin />;

  const handleChange = (ev) => {
    const value = ev.target.value;

    if (getCountOfDecimals(value) <= 9 && value <= 1e6) {
      setAmount({ value, valid: !isNaN(Number(value)) && Number(value) > 0 });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (amount.valid && amount.value) {
        btnRef.current.click();
      }
    }
  };

  const sendInvestEvent = () => {
    ReactGA.event({
      category: "Presale",
      action: "Invest",
      label: walletAddress,
    });
  };

  const new_reserve = (presaleStateVars.total || 0) + (amount.valid ? amount.value * 1e9 - 1e4 : 0);

  const { final_price = 1, tokens = 0 } = get_presale_prices(new_reserve || 0);
  const youGet = amount.valid ? Math.floor(((amount.value * 1e9) / new_reserve) * tokens) : 0;

  const tokensCost = +Number((final_price * youGet) / 1e9).toPrecision(9);

  const newPriceView = +Number(final_price).toPrecision(9);

  const stakeEmissionRate = +(inflation_rate * 100 * stakers_share).toFixed(2);

  const link = generateLink({ amount: Math.ceil(amount.value * 1e9), aa: presaleAaAddress, from_address: walletAddress });

  return (
    <div>
      <div className="text-primary-gray-light">
        <p className="mb-2">
          Add funds to participate in the initial sale of OSWAP tokens. You will receive OSWAP tokens locked in governance for 4 years (the maximum locking
          period).
        </p>

        <p className="mb-2">
          With the locked tokens, you’ll be entitled to receive emissions of new OSWAP tokens ({stakeEmissionRate}% per year) and vote in governance decisions,
          including deciding which Oswap pools should be incentivized with OSWAP token emissions and in what proportions.
        </p>

        <p className="mb-2">
          The price of OSWAP tokens depends on the total capital committed by all investors to buying them. If you change your mind, you can withdraw before the
          presale ends.
        </p>

        <p className="mb-2">You can add funds here up to 1 day before the presale ends.</p>
      </div>

      <Input placeholder="Amount" suffix="GBYTE" value={amount.value} onChange={handleChange} onKeyDown={handleKeyDown} />

      <div className="pt-2 text-white align-middle cursor-default">
        <div className="flex flex-wrap mb-2 text-lg">
          You get* :
          <div className="w-full ml-0 sm:ml-1 sm:w-auto">
            ≈{+Number(youGet / 10 ** decimals).toFixed(decimals)} <small>{symbol}</small>
          </div>
        </div>

        <div className="flex flex-wrap items-center mb-1 font-medium sm:mb-0">
          <div className="mr-1 text-primary-gray-light">
            New price
            <QuestionTooltip description="New initial price of OSWAP token after your investment is added. With more invested capital, the price gets higher." />
          </div>
          <span className={`w-full sm:w-auto`}>{newPriceView} GBYTE</span>
        </div>

        <div className="flex flex-wrap font-medium">
          <div className="mr-1 text-primary-gray-light">
            Tokens value
            <QuestionTooltip description="The value of your future OSWAP tokens (number of tokens multiplied by their initial price after the launch)" />
          </div>{" "}
          <span className={`w-full sm:w-auto`}>{tokensCost} GBYTE</span>
        </div>

        <div className="flex flex-wrap font-medium">
          <div className="mr-1 text-primary-gray-light">
            Locking term
            <QuestionTooltip description="Your tokens will be locked in governance for 4 years. You won’t be able to sell them before the term expires." />
          </div>{" "}
          <span className={`w-full sm:w-auto`}>4 years</span>
        </div>

        <QRButton ref={btnRef} onClick={sendInvestEvent} type="primary" className="mt-4" href={link} disabled={!amount.valid || !amount.value || frozen}>
          Send {amount.valid && amount.value ? amount.value : ""} GBYTE
        </QRButton>

        <div>
          <p className="mt-3 text-xs leading-1 text-primary-gray-light">
            *If no one else buys after you. You’ll know a more accurate price closer to the end of the presale.
          </p>
        </div>
      </div>
    </div>
  );
};
