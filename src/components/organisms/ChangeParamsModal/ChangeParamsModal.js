import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import ReactGA from "react-ga";

import { Button, Input } from "components/atoms";
import { Modal, QRButton } from "components/molecules";

import { selectWalletAddress } from "store/slices/settingsSlice";

import { generateLink, getCountOfDecimals } from "utils";

import appConfig from "appConfig";

export const ChangeParamsModal = ({ textBtn, name, disabled = false, validator, view_unit, value: defaultValue, helpText, toSmall, toBig }) => {
  // selectors
  const walletAddress = useSelector(selectWalletAddress);

  // state
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState({ value: "", valid: true });

  // calc
  const nameView = name.split("_").join(" ");
  const url = generateLink({ amount: 1e4, data: { vote_value: 1, name, value: toSmall(value.value) }, aa: appConfig.AA_ADDRESS, from_address: walletAddress, is_single: true });

  // others hooks
  const btnRef = useRef();

  // handles
  const handleChangeValue = (ev) => {
    const value = ev.target.value.trim();

    if (view_unit !== "%" || getCountOfDecimals(value) <= 4) {
      setValue({ value, valid: validator(toSmall(value)) });
    }
  };

  const handleKeyDown = (ev) => {
    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      if (value.value && value.valid) {
        btnRef.current.click();
      }
    }
  };

  const sendChangeParamEvent = () => {
    ReactGA.event({
      category: "Params",
      action: "Change " + nameView,
      label: walletAddress,
    });
  };

  // effects

  useEffect(() => {
    if (defaultValue) {
      setValue({ value: toBig(defaultValue), valid: true });
    }
  }, [defaultValue, toBig]);

  return (
    <div>
      <Button disabled={disabled} type="text-primary" onClick={() => setVisible(true)}>
        {textBtn}
      </Button>

      <Modal customControllers={[]} visible={visible} width={600} onClose={() => setVisible(false)} title={`Change ${nameView}`}>
        <Helmet>
          <title>OSWAP token — Change {nameView}</title>
        </Helmet>

        <div className="mb-5">
          <Input
            disabled={defaultValue !== undefined}
            value={value.value}
            error={value.value && !value.valid ? helpText : undefined}
            suffix={view_unit}
            placeholder={nameView}
            onChange={handleChangeValue}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <QRButton onClick={sendChangeParamEvent} ref={btnRef} href={url} block={true} disabled={!value.value || !value.valid} type="primary">
            Vote
          </QRButton>
        </div>
      </Modal>
    </div>
  );
};
