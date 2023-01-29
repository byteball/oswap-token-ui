import { Children, cloneElement } from "react";
import cn from "classnames";

const Tabs = ({ children, onChange, value }) => (
  <div className="mb-4">
    <nav className="grid grid-cols-2 overflow-hidden rounded-xl" aria-label="Tabs">
      {Children.toArray(children).map((tab, i) => (
        <div key={String(tab.props.value)}>
          {cloneElement(tab, {
            current: tab.props.value === value,
            onChange,
          })}
        </div>
      ))}
    </nav>
  </div>
);

const Item = ({ children, value, current, onChange }) => (
  <div
    key={value}
    onClick={() => onChange(value)}
    className={cn(
      { "bg-primary-gray-light text-white": current },
      { "text-white bg-primary-gray": !current },
      "px-3 py-3 text-md uppercase  text-center cursor-pointer hover:bg-primary-gray-light/75"
    )}
  >
    {children}
  </div>
);

Tabs.Item = Item;

export default Tabs;
