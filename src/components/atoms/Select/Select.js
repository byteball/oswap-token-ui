import { Children, cloneElement, useState } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { isArray } from "lodash";
import cn from "classnames";

const Select = ({ label, placeholder, children, value, onChange, className = "" }) => {
  const [query, setQuery] = useState("");

  const filteredChildren =
    query === ""
      ? children
      : children.filter((item) => {
          return item.props.children.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox as="div" className={className} value={value} onChange={onChange}>
      {label && <Combobox.Label className="block text-sm font-medium primary-gray-light">{label}</Combobox.Label>}
      <div className="relative">
        <Combobox.Input
          className="w-full py-2 pl-3 pr-10 h-[45px] text-lg bg-transparent border rounded-lg shadow-sm border-primary-gray-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-lg"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(asset) => (isArray(children) ? children.find((item) => item.props?.value === asset)?.props?.children : children?.props?.children)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2 rounded-r-lg focus:outline-none">
          <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        <Combobox.Options className="absolute z-20 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-md">
          {filteredChildren.length > 0 ? (
            Children.toArray(filteredChildren).map((item, i) => cloneElement(item))
          ) : (
            <span className="py-2 pl-3 mb-1 text-primary-gray-light pr-9 text-md">No value</span>
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

const Option = ({ value, children, disabled = false }) => (
  <Combobox.Option
    value={value}
    disabled={disabled}
    className={({ active, selected }) =>
      cn(
        "relative cursor-pointer select-none py-2 pl-3 pr-9",
        { "bg-primary text-white": active || selected },
        { "text-gray-900/20": !active && !selected && disabled },
        { "text-gray-900": !active && !selected && !disabled }
      )
    }
  >
    {({ active, selected }) => (
      <>
        <span className={cn("block truncate", { "font-semibold": selected })}>{children}</span>

        {selected && (
          <span
            className={cn("absolute inset-y-0 right-0 flex items-center pr-4", { "text-white": active || selected }, { "text-primary": !active && !selected })}
          >
            <CheckIcon className="w-5 h-5" aria-hidden="true" />
          </span>
        )}
      </>
    )}
  </Combobox.Option>
);

Select.Option = Option;

export default Select;
