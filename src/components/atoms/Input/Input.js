import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import Tooltip from "rc-tooltip";
import { useRef } from "react";

export const Input = ({ error = "", extra = "", currency, suffix = "", className = "", disabled = false, ...rest }) => {
  const suffixStyle = error && typeof error === "string" ? { marginRight: 45 } : {};
  const suffixWrapRef = useRef(null);

  return (
    <>
      <div className={cn("relative flex", className)}>
        <input
          {...rest}
          disabled={disabled}
          style={suffix && suffixWrapRef?.current ? { paddingRight: suffixWrapRef?.current.offsetWidth + 8 } : {}}
          className={cn(
            "block border w-full h-[45px] rounded-lg border-primary-gray-light bg-transparent text-white px-4 text-lg font-normal focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary",
            { "border-red-500 focus:border-red-500 focus:ring-red-500": error, "cursor-not-allowed bg-primary-gray-light/40 text-white/40": disabled }
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center h-[45px]" ref={suffixWrapRef}>
          {suffix ? (
            <div
              className={cn(
                "text-gray-500 truncate",
                { "pr-1": currency },
                { "pr-5": !currency },
                { "pr-0": error && typeof error === "string" },
                { "text-red-500": error }
              )}
              style={suffixStyle}
            >
              {suffix}
            </div>
          ) : null}
          {/* {currency && <div className={`${error ? "mr-7" : ""}`}>
          <select
            className="w-auto h-full py-0 pl-2 text-gray-500 bg-transparent border-transparent active:outline-none focus:outline-none focus:ring-0 focus:ring-transparent pr-7 sm:text-sm focus:border-transparent"
          >
            <option>Obyte</option>
            <option>Ethereum</option>
            <option>BSC</option>
            <option>Polygon</option>
          </select>
        </div>} */}
          {error && typeof error === "string" ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Tooltip placement="top" trigger={["hover"]} overlayInnerStyle={{ background: "#EF4444" }} overlay={<span>{error}</span>}>
                <ExclamationCircleIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
              </Tooltip>
            </div>
          ) : null}
        </div>
      </div>

      {extra && !error && <p className="text-sm text-white">{extra}</p>}
    </>
  );
};
