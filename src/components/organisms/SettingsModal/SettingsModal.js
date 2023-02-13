import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";

import { Input } from "components/atoms";
import { Modal, QuestionTooltip, RadioGroup } from "components/molecules";

import { selectSlippageTolerance, setSlippageTolerance } from "store/slices/settingsSlice";
import { getCountOfDecimals } from "utils";

export const SettingsModal = () => {
  const currentSlippageTolerance = useSelector(selectSlippageTolerance);

  const [visible, setVisible] = useState(false);
  const [inputSlippageTolerance, setInputSlippageTolerance] = useState({ value: currentSlippageTolerance, valid: true });

  const dispatch = useDispatch();

  const handleChange = (ev) => {
    const value = String(ev.target.value).trim();

    if (value === ".") {
      setInputSlippageTolerance({ value: "0.", valid: true });
    } else if (getCountOfDecimals(value) <= 4 && value <= 100 && !isNaN(Number(value))) {
      setInputSlippageTolerance({ value, valid: !isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100 });
    }
  };

  useEffect(() => {
    if (inputSlippageTolerance.valid) {
      if (inputSlippageTolerance.value === "") {
        dispatch(setSlippageTolerance(0));
      } else {
        dispatch(setSlippageTolerance(Number(inputSlippageTolerance.value)));
      }
    }
  }, [inputSlippageTolerance]);

  const handleKeyDown = (ev) => {
    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      setVisible(false);
    }
  };

  return (
    <>
      <Cog8ToothIcon
        onClick={() => setVisible((v) => !v)}
        className="w-[2em] h-[2em] p-1 stroke-primary-gray-light/70 cursor-pointer hover:stroke-primary-gray-light/40"
      />

      <Modal title="Settings" width={750} customControllers={[]} visible={visible} onClose={() => setVisible(false)}>
        <div className="mb-2 text-base text-primary-gray-light">
          Slippage tolerance{" "}
          <QuestionTooltip description="Your transaction will be bounced if the amount of received tokens changes unfavorably by more than this percentage." />
        </div>

        <div className="grid grid-cols-1 space-x-0 space-y-4 md:space-y-0 md:space-x-4 md:grid-cols-4">
          <div className="md:col-span-3">
            <RadioGroup value={Number(inputSlippageTolerance.value)} setValue={(value) => setInputSlippageTolerance({ value, valid: true })}>
              <RadioGroup.Item value={1}>1%</RadioGroup.Item>
              <RadioGroup.Item value={2}>2%</RadioGroup.Item>
              <RadioGroup.Item value={5}>5%</RadioGroup.Item>
              <RadioGroup.Item value={100}>Unlimited</RadioGroup.Item>
            </RadioGroup>
          </div>

          <div className="md:col-span-1">
            <Input
              value={inputSlippageTolerance.value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              error={!inputSlippageTolerance.valid ? "Max value: 100%" : false}
              suffix="%"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
