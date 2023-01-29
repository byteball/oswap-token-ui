import { cloneElement, useEffect, useState } from "react";
import obyte from "obyte";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { Button, Input } from "components/atoms";
import { Modal } from "components/molecules";

import { selectWalletAddress } from "store/slices/settingsSlice";
import { changeWalletAddress } from "store/thunks/changeWalletAddress";

export const WalletModal = ({ children, hideIfHas = false, visible: defaultVisible = false, onClose }) => {
  const walletAddress = useSelector(selectWalletAddress);
  const [address, setAddress] = useState({ value: "", valid: true });
  const [visible, setVisible] = useState(defaultVisible);

  useEffect(() => {
    if (walletAddress) {
      setAddress({ value: walletAddress, valid: true });
    }
  }, [walletAddress]);

  useEffect(() => {
    if (visible !== defaultVisible && defaultVisible !== undefined) {
      setVisible(defaultVisible);
    }
  }, [defaultVisible]);

  const dispatch = useDispatch();

  const handleChange = (ev) => {
    const value = ev.target.value;
    const valid = obyte.utils.isValidAddress(value);

    setAddress({ value, valid });
  };

  const handleKeyDown = (ev) => {
    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      save();
    }
  };

  const save = () => {
    if (address.value && address.valid) {
      dispatch(changeWalletAddress(address.value));
      setVisible(false);
      onClose && onClose();
    }
  };

  if (walletAddress && hideIfHas) return null;

  return (
    <>
      {children &&
        cloneElement(children, {
          ...children.props,
          children: walletAddress ? walletAddress.slice(0, 8) + "..." : children.props.children,
          onClick: () => setVisible(true),
        })}

      <Modal
        title="Add wallet"
        visible={visible}
        customControllers={[
          <Button type="primary" block className="mt-5" disabled={!address.value || !address.valid || address.value === walletAddress} onClick={save}>
            Save
          </Button>,
        ]}
        onClose={() => {
          setAddress({ value: walletAddress || "", valid: true });
          setVisible(false);
          onClose && onClose();
        }}
        width={550}
      >
        <div className="container">
          <Helmet>
            <title>OSWAP token — Add wallet</title>
          </Helmet>

          <Input
            placeholder="Obyte wallet address"
            value={address.value}
            onKeyDown={handleKeyDown}
            error={!address.valid ? "The wallet address is invalid, please copy it from your wallet" : null}
            onChange={handleChange}
            extra={
              <div className="mt-1 text-xs">
                <a href="https://obyte.org/#download" className="text-primary" target="_blank" rel="noreferrer">
                  Install Obyte wallet
                </a>{" "}
                if you don't have one yet, and copy/paste your address here.
              </div>
            }
          />
        </div>
      </Modal>
    </>
  );
};
