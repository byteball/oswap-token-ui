import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactGA from "react-ga";
import { estimateOutput, transferEVM2Obyte } from "counterstake-sdk";

import { Input, Spin, Warning } from "components/atoms";
import { WalletModal } from "components/organisms";
import { MetaMaskButton, QRButton, QuestionTooltip } from "components/molecules";

import { selectSettings, selectStateVarsLoading, selectTokenInfo } from "store/slices/agentSlice";
import { selectPresaleAddress, selectWalletAddress } from "store/slices/settingsSlice";

import { selectPresaleStateVars, selectPresaleStateVarsLoading } from "store/slices/presaleSlice";

import { generateLink, getCountOfDecimals } from "utils";
import { get_presale_prices } from "utils/getExchangeResult";

import client from "services/obyte";
import appConfig from "appConfig";

export const PresaleInvestForm = ({ frozen, buyFreezePeriod }) => {
  const btnRef = useRef(null);

  const [amount, setAmount] = useState({ value: "0.1", valid: true });
  const [token, setToken] = useState({ symbol: "GBYTE", network: "Obyte", decimals: 8, initial: 0.01 });
  const [estimate, setEstimate] = useState();
  const [estimateError, setEstimateError] = useState();
  const [inProcess, setInProcess] = useState(false);

  const presaleStateVars = useSelector(selectPresaleStateVars);
  const presaleStateVarsLoading = useSelector(selectPresaleStateVarsLoading);
  const stateVarsLoading = useSelector(selectStateVarsLoading);
  const walletAddress = useSelector(selectWalletAddress);
  const { symbol, decimals } = useSelector(selectTokenInfo);
  const presaleAaAddress = useSelector(selectPresaleAddress);
  const { inflation_rate, stakers_share } = useSelector(selectSettings);

  const handleChange = (ev) => {
    const value = ev.target.value;

    if (getCountOfDecimals(value) <= token.decimals && value <= 1e6) {
      setAmount({ value, valid: !isNaN(Number(value)) && Number(value) > 0 });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (amount.valid && amount.value && !frozen) {
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

  useEffect(() => {
    setAmount({ value: token.initial, valid: true });
  }, [token]);

  useEffect(() => {
    if (token && token.network !== "Obyte" && amount.value && amount.valid && Number(amount.value) > 0) {
      setInProcess(true);
      estimateOutput({
        amount: Number(amount.value),
        src_network: token.network,
        src_asset: token.symbol,
        dst_network: "Obyte",
        dst_asset: "GBYTE",
        recipient_address: walletAddress,
        assistant_reward_percent: 1.0,
        testnet: appConfig.ENVIRONMENT === "testnet",
        obyteClient: client,
      })
        .then((est) => {
          if (est && typeof est === "number" && est > 0) {
            setEstimate(est);
            setEstimateError();
          } else {
            setEstimate(0);
            setEstimateError("Not working");
          }

          setInProcess(false);
        })
        .catch((e) => {
          setEstimate(0);
          setInProcess(false);
          setEstimateError(e.message);
          console.log("estimateOutput error", e);
        });
    } else if (estimate) {
      setEstimate(0);
    }
  }, [token, amount]);

  if (presaleStateVarsLoading || stateVarsLoading) return <Spin />;

  let inputError = null;
  const isExchange = token.network !== "Obyte" || token.symbol !== "GBYTE";

  if (amount.value && amount.valid) {
    const resultAmount = !isExchange ? amount.value : estimate;

    if (!estimateError) {
      if (resultAmount < 0.0001) {
        inputError = `Min amount ${isExchange && `after the exchange`}: 0.0001`;
        if (isExchange) {
          inputError += `, now ${estimate}`;
        }
      }
    }
  }

  const fullAmountAfterExchange = estimate * 1e9;

  const new_reserve =
    (presaleStateVars.total || 0) +
    (token.network === "Obyte" && token.symbol === "GBYTE" ? (amount.valid ? amount.value * 1e9 - 1e4 : 0) : !estimateError ? fullAmountAfterExchange : 0);

  const { final_price = 1, tokens = 0 } = get_presale_prices(new_reserve || 0);
  const youGet = amount.valid && new_reserve ? Math.floor(((amount.value * 1e9) / new_reserve) * tokens) : 0;

  const tokensCost = +Number((final_price * youGet) / 1e9).toPrecision(9);

  const newPriceView = +Number(final_price).toPrecision(9);

  const stakeEmissionRate = +(inflation_rate * 100 * stakers_share).toFixed(2);

  const link = generateLink({ amount: Math.ceil(amount.value * 1e9), aa: presaleAaAddress, from_address: walletAddress });

  const buyViaEVM = async () => {
    try {
      setInProcess(true);

      await transferEVM2Obyte({
        amount: Number(amount.value),
        src_network: token.network,
        src_asset: token.symbol,
        dst_network: "Obyte",
        dst_asset: "GBYTE",
        recipient_address: presaleAaAddress,
        data: { to: walletAddress },
        assistant_reward_percent: 1,
        testnet: appConfig.ENVIRONMENT === "testnet",
        obyteClient: client,
        oswap_change_address: walletAddress,
      }).then(() => {
        setInProcess(false);
        sendInvestEvent();
      });
    } catch (err) {
      console.error("error", err);
      setInProcess(false);
    }
  };

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

        <p className="mb-2">You can add funds here up to {buyFreezePeriod} day before the presale ends.</p>
      </div>

      <div className="mb-1 text-primary-gray-light">You send: </div>
      <Input token={token} setToken={setToken} placeholder="Amount" error={inputError} value={amount.value} onChange={handleChange} onKeyDown={handleKeyDown} />

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

        {token.network !== "Obyte" && (
          <WalletModal hideIfHas={true}>
            <div>
              <Warning className="w-auto mt-4 cursor-pointer">Please add your wallet address</Warning>
            </div>
          </WalletModal>
        )}

        {!window.ethereum && token.network !== "Obyte" && (
          <Warning type="error" className="w-auto mt-4">
            Please add{" "}
            <a href="https://metamask.io/download/" rel="noreferrer" className="text-primary" target="_blank">
              metamask
            </a>{" "}
            to your browser
          </Warning>
        )}

        {estimateError && token.network !== "Obyte" && (
          <Warning type="error" className="w-auto mt-4">
            <div className="first-letter:uppercase">{estimateError}</div>
          </Warning>
        )}

        {token.network === "Obyte" ? (
          <QRButton
            ref={btnRef}
            type="primary"
            className="mt-4"
            href={link}
            onClick={sendInvestEvent}
            disabled={!amount.valid || !amount.value || amount.value < 0.0001}
          >
            Send {amount.valid && amount.value ? amount.value : ""} GBYTE
          </QRButton>
        ) : (
          <MetaMaskButton
            ref={btnRef}
            loading={inProcess}
            type="primary"
            onClick={buyViaEVM}
            disabled={estimateError || !amount.valid || !amount.value || estimate < 0.0001 || !walletAddress || !window.ethereum || frozen}
            className="mt-4"
          >
            Send {amount.valid && amount.value ? amount.value : ""} {token.symbol}
          </MetaMaskButton>
        )}

        <div>
          <p className="mt-3 text-xs leading-1 text-primary-gray-light">
            *If no one else buys after you. You’ll know a more accurate price closer to the end of the presale.
          </p>
        </div>
      </div>
    </div>
  );
};
