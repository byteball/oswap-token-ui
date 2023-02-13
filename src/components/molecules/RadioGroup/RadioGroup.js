import { RadioGroup } from "@headlessui/react";
import cn from "classnames";

const CustomRadioGroup = ({ children, value, setValue }) => {
  return (
    <RadioGroup value={value} onChange={setValue} className="w-full">
      <div className="grid max-w-full grid-flow-col gap-2">{children}</div>
    </RadioGroup>
  );
};

CustomRadioGroup.Item = ({ value, disabled, children = "" }) => (
  <RadioGroup.Option
    key={value}
    value={value}
    className={({ active, checked }) =>
      cn(
        !disabled ? "cursor-pointer focus:outline-none" : "opacity-25 cursor-not-allowed",
        { "ring-0": active },
        checked ? "bg-primary border-transparent text-white hover:bg-primary" : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
        "border h-[45px] rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase flex-1"
      )
    }
    disabled={disabled}
  >
    <RadioGroup.Label as="span">{children}</RadioGroup.Label>
  </RadioGroup.Option>
);

export default CustomRadioGroup;
