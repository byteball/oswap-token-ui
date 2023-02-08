import { createRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { estimateOutput, transferEVM2Obyte } from "counterstake-sdk";

import { EstimatedTranView, WalletModal } from "components/organisms";
import { MetaMaskButton, QRButton } from "components/molecules";
import { Input, Spin, Warning } from "components/atoms";

import { selectSettings, selectStateVars, selectStateVarsLoading, selectTokenInfo } from "store/slices/agentSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";
import { selectPresaleStateVarsLoading } from "store/slices/presaleSlice";

import { generateLink, getExchangeResult, getCountOfDecimals } from "utils";

import client from "services/obyte";

import appConfig from "appConfig";

export const BuyForm = () => {
  // state
  const [amount, setAmount] = useState({ value: appConfig.TOKENS[3].initial, valid: true });
  const [token, setToken] = useState({ symbol: "GBYTE", network: "Obyte", decimals: 8, initial: 0.01 });
  const [estimate, setEstimate] = useState();
  const [estimateError, setEstimateError] = useState();
  const [inProcess, setInProcess] = useState(false);

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

    if (getCountOfDecimals(value) <= token.decimals && value <= 1e6) {
      setAmount({ value, valid: !isNaN(Number(value)) && Number(value) > 0 });
    }
  };

  useEffect(() => {
    setAmount({ value: token.initial, valid: true });
  }, [token]);

  const handleKeyDown = (ev) => {
    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      if (amount.valid && amount.value && amount.value >= 0.0001 && !exchangeResult.blocked) {
        btnRef.current.click();
      }
    }
  };

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
  const exchangeResult = getExchangeResult(
    0,
    !isExchange ? (amount.valid ? amount.value * 1e9 : 0) : !estimateError ? fullAmountAfterExchange : 0,
    stateVars.state,
    settings
  );

  const link = generateLink({ amount: Math.ceil(amount.value * 1e9), aa: appConfig.AA_ADDRESS, from_address: walletAddress });

  const buyViaEVM = async () => {
    try {
      setInProcess(true);

      await transferEVM2Obyte({
        amount: Number(amount.value),
        src_network: token.network,
        src_asset: token.symbol,
        dst_network: "Obyte",
        dst_asset: "GBYTE",
        recipient_address: appConfig.AA_ADDRESS,
        data: { to: walletAddress },
        assistant_reward_percent: 1,
        testnet: appConfig.ENVIRONMENT === "testnet",
        obyteClient: client,
        oswap_change_address: walletAddress,
      }).then(() => {
        setInProcess(false);
      });
    } catch (err) {
      console.error("error", err);
      setInProcess(false);
    }
  };

  return (
    <div>
      <div className="mb-1 text-primary-gray-light">You send: </div>
      <Input placeholder="Amount" token={token} setToken={setToken} error={inputError} value={amount.value} onChange={handleChange} onKeyDown={handleKeyDown} />

      <div className="pt-2 text-white align-middle cursor-default">
        <div className="flex flex-wrap mb-2 text-lg">
          You get{" "}
          <div className="w-full ml-0 sm:ml-1 sm:w-auto">
            ≈{+Number(exchangeResult.delta_s / 10 ** decimals).toFixed(decimals)} <small>{symbol}</small>
          </div>
        </div>

        <EstimatedTranView result={exchangeResult} estimate={estimate} tokenAmount={amount.value} tokenNetwork={token.network} tokenSymbol={token.symbol} />

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
            <a href="https://metamask.io/download/" rel="noopener" className="text-primary" target="_blank">
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
            type={exchangeResult.fee_percent < 15 ? "primary" : "danger"}
            className="mt-4"
            href={link}
            disabled={!amount.valid || !amount.value || amount.value < 0.0001 || exchangeResult.blocked}
          >
            Send {amount.valid && amount.value ? amount.value : ""} GBYTE
          </QRButton>
        ) : (
          <MetaMaskButton
            ref={btnRef}
            loading={inProcess}
            type={exchangeResult.fee_percent < 15 ? "primary" : "danger"}
            onClick={buyViaEVM}
            disabled={estimateError || !amount.valid || !amount.value || estimate < 0.0001 || exchangeResult.blocked || !walletAddress || !window.ethereum}
            className="mt-4"
          >
            Send {amount.valid && amount.value ? amount.value : ""} {token.symbol}
          </MetaMaskButton>
        )}

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
