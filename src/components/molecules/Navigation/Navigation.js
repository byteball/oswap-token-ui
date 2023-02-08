import cn from "classnames";
import { Children, cloneElement } from "react";
import { NavLink } from "react-router-dom";

const Navigation = ({ direction = "vertical", children, border = false }) => {
  return (
    <nav
      className={cn(
        "navigation",
        { "flex items-center space-x-2": direction === "horizontal" },
        { "space-y-2": direction !== "horizontal" },
        { "border-xl border-b-2 border-[#1F2327]/50 navigation-border space-x-8 max-w-full overflow-x-auto overflow-hidden": border }
      )}
    >
      {Children.toArray(children).map((item, i) => (
        <div key={item.props.href}>
          {cloneElement(item, {
            border,
          })}
        </div>
      ))}
    </nav>
  );
};

Navigation.Item = ({ href, icon: Icon, children, disabled, border = false, end = false }) => {
  return (
    <NavLink
      key={href}
      to={href}
      end={end}
      className={cn(
        { "flex items-center px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-gray-50 hover:text-gray-900 group select-none": !border },
        { "pointer-events-none opacity-20 cursor-not-allowed": disabled },
        { "flex items-center pb-2 text-base font-medium text-white tab group hover:bg-transparent hover:text-primary": border }
      )}
    >
      {Icon && <Icon className={"flex-shrink-0 -ml-1 mr-3 h-6 w-6"} aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </NavLink>
  );
};

export default Navigation;
