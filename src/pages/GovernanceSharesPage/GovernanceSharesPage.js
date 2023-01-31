import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";

import { Redirect, Spin } from "components/atoms";
import { Navigation } from "components/molecules";
import { GovernanceLayout } from "components/templates/GovernanceLayout/GovernanceLayout";
import { StakeForm, UnstakeForm, RewardForm, MoveVPForm } from "forms";

import { selectStateVarsLoading } from "store/slices/agentSlice";

export default () => {
  const stateVarsLoading = useSelector(selectStateVarsLoading);

  if (stateVarsLoading) {
    return (
      <GovernanceLayout>
        <Spin className="mt-10" />
      </GovernanceLayout>
    );
  }

  return (
    <GovernanceLayout>
      <h2 className="text-3xl font-bold">Stake OSWAP tokens and vote</h2>
      <div className="text-base font-medium text-primary-gray-light">
        Lock your OSWAP tokens for up to 4 years to participate in governance and receive a share of OSWAP token emissions. Larger locking periods give you more
        voting power (VP) and a larger share of emissions. With larger VP, you have more influence on the distribution of rewards among incentivized pools.
      </div>

      <div className="mt-5">
        <Navigation border direction="horizontal">
          <Navigation.Item href="/governance/shares/stake">Stake</Navigation.Item>
          <Navigation.Item href="/governance/shares/unstake">Unstake</Navigation.Item>
          <Navigation.Item href="/governance/shares/rewards">Rewards</Navigation.Item>
          <Navigation.Item href="/governance/shares/move">Move votes</Navigation.Item>
        </Navigation>
      </div>

      <div className="bg-[#131519]/30 p-3 md:p-5 rounded-lg mt-5">
        <Routes>
          <Route path="stake" element={<StakeForm />} />
          <Route path="unstake" element={<UnstakeForm />} />
          <Route path="rewards" element={<RewardForm />} />
          <Route path="move" element={<MoveVPForm />} />
          <Route path="*" element={<Redirect path="/governance/shares/stake" />} />
        </Routes>
      </div>
    </GovernanceLayout>
  );
};
