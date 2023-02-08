import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import Tooltip from "rc-tooltip";
import { useRef } from "react";

import { TokenSelector } from "components/organisms/TokenSelector/TokenSelector";

export const Input = ({ error = "", extra = "", currency, suffix = "", className = "", disabled = false, token, setToken, ...rest }) => {
  const suffixStyle = error && typeof error === "string" ? { marginRight: 45 } : {};
  const suffixWrapRef = useRef(null);
  const tokenSelectorWrapRef = useRef(null);

  return (
    <>
      <div className={cn("relative flex", className)}>
        <input
          {...rest}
          disabled={disabled}
          style={
            suffix && suffixWrapRef?.current
              ? { paddingRight: suffixWrapRef?.current.offsetWidth + 8 }
              : token && tokenSelectorWrapRef?.current
              ? { paddingRight: tokenSelectorWrapRef?.current.offsetWidth + 4 }
              : {}
          }
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

          {token && (
            <div className={cn("hidden xs:block", { "mr-7": error })}>
              <TokenSelector ref={tokenSelectorWrapRef} token={token} setToken={setToken} />
            </div>
          )}

          {error && typeof error === "string" ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Tooltip placement="top" trigger={["hover"]} overlayInnerStyle={{ background: "#EF4444" }} overlay={<span>{error}</span>}>
                <ExclamationCircleIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
              </Tooltip>
            </div>
          ) : null}
        </div>
      </div>

      {token && (
        <div className={cn("xs:hidden block", { "mr-7": error })}>
          <TokenSelector border token={token} setToken={setToken} />
        </div>
      )}

      {extra && !error && <p className="text-sm text-white">{extra}</p>}
    </>
  );
};
