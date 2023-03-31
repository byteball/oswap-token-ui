import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactGA from "react-ga";

import { Button, Input } from "components/atoms";
import { Modal, QRButton } from "components/molecules";

import { selectWalletBalance } from "store/slices/userWalletSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";

import { generateLink, getCountOfDecimals } from "utils";

import appConfig from "appConfig";

export const LPDepositModal = ({ symbol, asset, decimals }) => {
  //state
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState({ value: "", valid: true });

  // selectors
  const userBalance = useSelector(selectWalletBalance);
  const walletAddress = useSelector(selectWalletAddress);

  // other hooks
  const btnRef = useRef();

  useEffect(() => {
    const tokenBalance = userBalance[asset]?.total || 0;
    const tokenBalanceView = +Number(tokenBalance / 10 ** decimals).toFixed(decimals);

    if (tokenBalance && visible) {
      setAmount({ value: tokenBalanceView, valid: true });
    }
  }, [asset, userBalance, visible]);

  // calc
  const disabled = !amount.value || !amount.valid;
  const symbolView = symbol ? symbol : `${asset.slice(0, 10)}...`;
  const link = generateLink({ aa: appConfig.AA_ADDRESS, asset, amount: amount.value * 10 ** decimals, data: { deposit: 1 }, from_address: walletAddress, is_single: !walletAddress });

  // handlers
  const handleChange = (ev) => {
    const value = ev.target.value.trim();

    if (getCountOfDecimals(value) <= decimals && value <= 1e6) {
      setAmount({ value, valid: !isNaN(Number(value)) && Number(value) > 0 });
    }
  };

  const handleKeyDown = (ev) => {
    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      if (!disabled) {
        btnRef.current.click();
      }
    }
  };

  const sendDepositEvent = () => {
    ReactGA.event({
      category: "Farming",
      action: "Deposit",
      label: walletAddress,
    });
  };

  return (
    <>
      <Button type="light" onClick={() => setVisible(true)}>
        Deposit
      </Button>

      <Modal customControllers={[]} visible={visible} width={600} onClose={() => setVisible(false)} title={`Deposit ${symbolView}`}>
        <Input placeholder="Amount" value={amount.value} suffix={symbolView} onChange={handleChange} onKeyDown={handleKeyDown} />

        <QRButton onClick={sendDepositEvent} ref={btnRef} type="primary" disabled={disabled} className="mt-5" href={link}>
          Deposit
        </QRButton>
      </Modal>
    </>
  );
};
