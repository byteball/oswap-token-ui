import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import { forwardRef, Fragment } from "react";

import appConfig from "appConfig";

export const TokenSelector = forwardRef(({ border, token, setToken }, ref) => (
  <Listbox value={token} onChange={setToken}>
    {({ open }) => (
      <>
        <div className="relative" ref={ref}>
          <Listbox.Button
            className={cn("shadow-none text-left bg-transparent rounded-md cursor-default focus:outline-none focus:ring-0 outline-transparent", {
              "block border w-full h-[45px] rounded-lg border-primary-gray-light bg-transparent text-white px-4 text-lg font-normal focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary mt-5":
                border,
              "h-[100%] min-w-[170px] relative w-full py-2 pl-3 pr-10 sm:text-sm": !border,
            })}
          >
            <span className="block text-white truncate">
              {token.symbol} on {token.network}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronUpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-none max-h-60 ring-1 ring-black ring-opacity-0 focus:outline-none sm:text-sm">
              {appConfig.TOKENS.map((token) => (
                <Listbox.Option
                  key={token.symbol + token.network}
                  className={({ active }) => cn(active ? "text-white bg-primary" : "text-gray-900", "relative cursor-default select-none py-2 pl-3 pr-3")}
                  value={token}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={cn(selected ? "font-semibold" : "font-normal", "block truncate")}>
                        {token.symbol} on {token.network}
                      </span>

                      {selected ? (
                        <span className={cn(active ? "text-white" : "text-primary", "absolute inset-y-0 right-0 flex items-center pr-4")}>
                          <CheckIcon className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </>
    )}
  </Listbox>
));
