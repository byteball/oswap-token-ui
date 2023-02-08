import { Fragment, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Popover, Transition } from "@headlessui/react";
import {
  ArrowsRightLeftIcon,
  Bars3Icon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import cn from "classnames";

import { Button } from "components/atoms";
import { WalletModal } from "components/organisms";

const menuLinks = [
  {
    name: "Buy/Sell",
    href: "/",
    icon: ArrowsRightLeftIcon,
  },
  {
    name: "Farming",
    href: "/farming",
    icon: ClockIcon,
  },
  {
    name: "Governance",
    href: "/governance",
    icon: BuildingLibraryIcon,
  },
  {
    name: "F.A.Q.",
    href: "/faq",
    icon: QuestionMarkCircleIcon,
  },
];

const resources = [
  {
    name: "Oswap",
    description: "Automated token exchange for Obyte",
    href: "https://oswap.io",
  },
  {
    name: "Statistics",
    description: "Oswap stats",
    href: "https://v2-stats.oswap.io",
  },
  {
    name: "Liquidity mining",
    description: "Every 7 days, 100 GB is distributed to liquidity providers on oswap.io.",
    href: "https://liquidity.obyte.org/",
  },
];

const commonLinkClasses = "text-base font-medium text-white hover:text-primary/70";

export const Header = () => {
  const [visibleWalletModal, setVisibleWalletModal] = useState(false);

  return (
    <>
      <Popover className="relative">
        <div className="flex items-center justify-between px-4 py-6 sm:px-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link to="/" className="flex items-center space-x-5">
              <img className="w-auto h-8 sm:h-10" src="https://oswap.io/img/logo.4fab4f31.svg" alt="Oswap token" />

              <span className="font-medium text-white sm:hidden lg:block">
                OSWAP token{" "}
                <sup>
                  <small>Beta</small>
                </sup>
              </span>
            </Link>
          </div>
          <div className="-my-2 -mr-2 md:hidden">
            <Popover.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md bg-primary-gray hover:bg-primary-gray-light/75 hover:white focus:outline-none focus:ring-2 focus:ring-inset">
              <Bars3Icon className="w-6 h-6" aria-hidden="true" />
            </Popover.Button>
          </div>
          <nav className="hidden space-x-10 md:flex">
            {menuLinks.map(({ name, href }) => (
              <NavLink
                key={name}
                to={href}
                end={href === "/"}
                className={({ isActive }) => (isActive ? `${commonLinkClasses} text-primary hover:text-primary` : commonLinkClasses)}
              >
                {name}
              </NavLink>
            ))}
            <Popover className="">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={cn({ "text-gray-300": open }, { "text-white": !open }, "group inline-flex items-center text-base focus:outline-none")}
                  >
                    <span>More</span>
                    <ChevronDownIcon
                      className={cn({ "text-gray-600": open }, { "text-gray-400": !open }, "ml-2 h-5 w-5 group-hover:text-gray-500")}
                      aria-hidden="true"
                    />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute z-10 w-screen max-w-xs px-2 mt-3 transform -translate-x-2/3 left-2/3 sm:px-0">
                      <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5">
                        <div className="relative grid gap-6 px-5 py-6 bg-primary-gray sm:gap-8 sm:p-8">
                          {resources.map((item) => (
                            <a
                              key={item.name}
                              href={item.href}
                              target="_blank"
                              rel="noopener"
                              className="block p-3 -m-3 text-white rounded-md hover:bg-gray-50 hover:text-primary-gray"
                            >
                              <p className="text-base font-medium ">{item.name}</p>
                              <p className="mt-1 text-sm text-primary-gray-light">{item.description}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </nav>
          <div className="items-center justify-end hidden md:flex md:flex-1 lg:w-0">
            <WalletModal>
              <Button>Wallet</Button>
            </WalletModal>
          </div>
        </div>

        <Transition
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel focus className="absolute inset-x-0 top-0 z-20 p-2 transition origin-top-right transform md:hidden">
            <div className="divide-y-2 rounded-lg shadow-lg divide-gray-50 bg-primary-gray ring-1 ring-black ring-opacity-5">
              <div className="px-5 pt-5 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img className="w-auto h-8 mr-3" src="https://oswap.io/img/logo.4fab4f31.svg" alt="Oswap token" />
                    <span className="font-bold text-white">
                      Oswap token{" "}
                      <sup>
                        <small>Beta</small>
                      </sup>
                    </span>
                  </div>
                  <div className="-mr-2">
                    <Popover.Button className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-md hover:bg-primary/75 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                    </Popover.Button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid grid-cols-1 gap-7">
                    {menuLinks.map((solution) => (
                      <a
                        key={solution.name}
                        href={solution.href}
                        className="flex items-center p-3 -m-3 text-white rounded-lg hover:bg-gray-50 hover:text-primary-gray"
                      >
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-white rounded-md bg-primary">
                          <solution.icon className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <div className="ml-4 text-base font-medium">{solution.name}</div>
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="px-5 py-6">
                <div className="grid grid-cols-1 gap-4">
                  {resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.href}
                      target="_blank"
                      rel="noopener"
                      className="text-base font-medium text-gray-400 hover:text-gray-400/75"
                    >
                      {resource.name}
                    </a>
                  ))}
                </div>
                <div className="mt-6">
                  <Button block type="primary" onClick={() => setVisibleWalletModal(true)}>
                    Change wallet
                  </Button>

                  <p className="mt-6 text-base text-center text-gray-400">
                    Don't have our wallet?{" "}
                    <a href="https://obyte.org/#download" target="_blank" rel="noopener" className="text-primary">
                      Download
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>

      <WalletModal visible={visibleWalletModal} onClose={() => setVisibleWalletModal(false)} />
    </>
  );
};
