import { Switch as HeadlessSwitch } from "@headlessui/react";
import cn from "classnames";

export const Switch = ({ value, onChange, children }) => (
  <HeadlessSwitch.Group as="div" className="flex items-center">
    <HeadlessSwitch
      checked={value}
      onChange={onChange}
      className={cn(
        value ? "bg-primary" : "bg-gray-200",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          value ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        )}
      />
    </HeadlessSwitch>
    <HeadlessSwitch.Label as="span" className="ml-3">
      <span className="text-base font-medium cursor-pointer text-primary-gray-light">{children}</span>
    </HeadlessSwitch.Label>
  </HeadlessSwitch.Group>
);
