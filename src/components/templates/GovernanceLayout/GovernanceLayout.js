import { Cog6ToothIcon, HomeIcon, QueueListIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

import { Navigation } from "components/molecules";
import { Warning } from "components/atoms";

import { selectPresaleParams, selectWalletAddress } from "store/slices/settingsSlice";
import { Outlet } from "react-router-dom";

export const GovernanceLayout = ({ children }) => {
  const walletAddress = useSelector(selectWalletAddress);
  const presaleParams = useSelector(selectPresaleParams);

  const launchDate = moment.utc(presaleParams.launch_date, moment.ISO_8601);
  const isPresale = launchDate.isAfter();

  return (
    <>
      {isPresale && (
        <div className="max-w-6xl pl-2 pr-2 mx-auto mt-5 lg:pl-0 lg:pr-0 md:pl-5 md:pr-5 ">
          <Warning type="warning">
            Governance will be enabled after the initial sale ends. Here you can preview what governance functions will be available to OSWAP token holders.
          </Warning>
        </div>
      )}

      <div className="grid max-w-full grid-cols-8 gap-8 pl-2 pr-2 mx-auto mt-10 mb-5 md:pl-5 md:pr-5 auto-cols-min lg:pl-6 lg:pr-6">
        <div className="col-span-8 lg:col-span-2">
          <div className="p-3 md:p-6 bg-primary-gray rounded-xl">
            <Navigation>
              <Navigation.Item icon={HomeIcon} href="/governance/dashboard">
                Governance
              </Navigation.Item>
              <Navigation.Item icon={ArrowDownTrayIcon} disabled={!walletAddress} href="/governance/shares">
                Stake &amp; vote
              </Navigation.Item>
              <Navigation.Item icon={QueueListIcon} href="/governance/whitelist">
                Pool whitelist
              </Navigation.Item>
              <Navigation.Item icon={Cog6ToothIcon} href="/governance/params">
                Params
              </Navigation.Item>
            </Navigation>
          </div>
        </div>

        <div className="col-span-8 p-3 text-white md:p-6 lg:col-span-6 bg-primary-gray rounded-xl">
          <Suspense fallback="Loading...">
            {children}
            <Outlet />
          </Suspense>
        </div>
      </div>
    </>
  );
};
