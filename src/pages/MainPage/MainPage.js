import { useState } from "react";
import moment from "moment";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";

import { PresaleInvestForm, PresaleWithdrawForm, SellForm, BuyForm } from "forms";
import { MainInfoPanel, PresaleInfoPanel } from "components/organisms";
import { Timer, Warning } from "components/atoms";
import { Tabs } from "components/molecules";

import { selectPresaleParams } from "store/slices/settingsSlice";

export default () => {
  const [currentTab, setCurrentTab] = useState("buy");
  const presaleParams = useSelector(selectPresaleParams);

  const lunchDate = moment.utc(presaleParams.launch_date, moment.ISO_8601);
  const startOfFreezePeriod = moment.utc(presaleParams.launch_date, moment.ISO_8601).subtract(presaleParams.buy_freeze_period, "days");

  const isPresale = lunchDate.isAfter();
  const isFrozen = startOfFreezePeriod.isBefore();

  return (
    <div>
      <Helmet>{isPresale ? <title>OSWAP token — Presale</title> : <title>OSWAP token — {currentTab === "buy" ? "Buy" : "Sell"} token</title>}</Helmet>

      <h1 className="mt-5 text-4xl font-bold tracking-tight text-center text-white sm:text-5xl lg:text-6xl">OSWAP token</h1>
      <h2 className="mt-3 text-2xl text-center text-primary-gray-light">Governance token of Oswap DEX</h2>

      {!isPresale ? (
        <div className="grid max-w-4xl grid-cols-6 gap-4 pl-5 pr-5 mx-auto mt-10 mb-5 lg:pl-0 lg:pr-0 rounded-xl">
          <div className="col-span-6 lg:col-span-4">
            <Tabs value={currentTab} onChange={setCurrentTab}>
              <Tabs.Item value="buy">Buy</Tabs.Item>
              <Tabs.Item value="sell">Sell</Tabs.Item>
            </Tabs>

            <div className="p-6 mt-6 bg-primary-gray rounded-xl">{currentTab === "buy" ? <BuyForm /> : <SellForm />}</div>
          </div>

          <div className="col-span-6 lg:col-span-2 lg:pl-2">
            <MainInfoPanel />
          </div>
        </div>
      ) : (
        <div>
          {isFrozen ? (
            <>
              <h2 className="mt-5 text-xl font-bold text-center uppercase text-primary">freeze period ends in</h2>
              <div className="mt-3 font-bold text-center text-white uppercase">
                <Timer date={lunchDate.toISOString()} />
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-5 text-xl font-bold text-center uppercase text-primary">PRESALE WILL END IN</h2>
              <div className="mt-3 font-bold text-center text-white uppercase">
                <Timer onComplete={() => window.location.reload()} date={startOfFreezePeriod.toISOString()} />
              </div>
            </>
          )}

          <div>
            <div className="grid max-w-4xl grid-cols-6 gap-4 pl-5 pr-5 mx-auto mt-10 mb-5 lg:pl-0 lg:pr-0 rounded-xl">
              <div className="col-span-6 lg:col-span-4">
                <Tabs value={currentTab} onChange={setCurrentTab}>
                  <Tabs.Item value="buy">Invest</Tabs.Item>
                  <Tabs.Item value="sell">Withdraw</Tabs.Item>
                </Tabs>

                <div className="p-6 mt-6 text-white bg-primary-gray rounded-xl">
                  {isFrozen && currentTab === "buy" && (
                    <Warning type="warning" className="mb-4">
                      Investment ended 1 day before the launch day
                    </Warning>
                  )}

                  {currentTab === "buy" ? <PresaleInvestForm frozen={isFrozen} /> : <PresaleWithdrawForm />}
                </div>
              </div>

              <div className="col-span-6 lg:col-span-2 lg:pl-2">
                <PresaleInfoPanel />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
