import React, { Suspense } from "react";
import { useSelector } from "react-redux";
import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";

import { Layout } from "components/templates";
import { GovernanceLayout } from "components/templates/GovernanceLayout/GovernanceLayout";
import { Spin } from "components/atoms";
import GovernancePoolsPage from "pages/GovernancePoolsPage/GovernancePoolsPage";

import { selectWalletAddress } from "store/slices/settingsSlice";

import { historyInstance } from "./historyInstance";

const MainPage = React.lazy(() => import("pages/MainPage/MainPage"));
const FaqPage = React.lazy(() => import("pages/FaqPage/FaqPage"));
const FarmingPage = React.lazy(() => import("pages/FarmingPage/FarmingPage"));

const GovernanceSharesPage = React.lazy(() => import("pages/GovernanceSharesPage/GovernanceSharesPage"));
const GovernanceDashboardPage = React.lazy(() => import("pages/GovernanceDashboardPage/GovernanceDashboardPage"));
const GovernanceParamsPage = React.lazy(() => import("pages/GovernanceParamsPage/GovernanceParamsPage"));

const AppRouter = () => {
  const walletAddress = useSelector(selectWalletAddress);

  return (
    <HistoryRouter history={historyInstance}>
      <Layout>
        <Suspense fallback={<Spin />}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/farming/*" element={<FarmingPage />} />
          </Routes>
        </Suspense>

        <Suspense
          fallback={
            <GovernanceLayout>
              <Spin className="mt-10" />
            </GovernanceLayout>
          }
        >
          <Routes>
            <Route path="/governance">
              <Route path="/governance/dashboard" element={<GovernanceDashboardPage />} />

              {walletAddress && (
                <>
                  <Route path="/governance/shares/*" element={<GovernanceSharesPage />} />
                  <Route path="/governance/params" element={<GovernanceParamsPage />} />
                  <Route path="/governance/whitelist" element={<GovernancePoolsPage />} />
                </>
              )}
            </Route>
          </Routes>
        </Suspense>
      </Layout>
    </HistoryRouter>
  );
};

export default AppRouter;
