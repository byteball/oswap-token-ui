import { Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { Redirect } from "components/atoms";
import { Navigation } from "components/molecules";
import { MyFarmingList } from "components/organisms/MyFarmingList/MyFarmingList";
import { FarmingList } from "components/organisms/FarmingList/FarmingList";

import { selectWalletAddress } from "store/slices/settingsSlice";

export default () => {
  const walletAddress = useSelector(selectWalletAddress);
  const location = useLocation();

  if (location.pathname.replaceAll("/", "") === "farming") {
    return <Redirect path="/farming/all" />
  }

  return (
    <div>
      <Helmet>
        <title>OSWAP token — Farming</title>
      </Helmet>
      <div className="p-6 m-auto">
        <h2 className="mb-2 text-3xl font-bold text-white">Farming</h2>
        <div className="max-w-3xl mb-5 text-base font-medium text-primary-gray-light">
          Here are incentivized pools. Deposit your LP tokens here to receive additional rewards in OSWAP tokens. You can withdraw your accrued rewards and LP
          tokens at any time.
        </div>

        <div className="mb-5">
          <Navigation border direction="horizontal">
            <Navigation.Item href="/farming/all">All pools</Navigation.Item>
            {walletAddress && <Navigation.Item href="/farming/my">My pools</Navigation.Item>}
          </Navigation>
        </div>

        <div className="text-white">
          <Routes>
            <Route path="all" element={<FarmingList />} />
            {walletAddress && <Route path="my" element={<MyFarmingList />} />}
          </Routes>
        </div>
      </div>
    </div>
  );
};
