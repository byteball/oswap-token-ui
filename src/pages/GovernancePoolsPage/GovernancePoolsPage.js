import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { Spin, Warning } from "components/atoms";
import { AddPoolModal, WalletModal } from "components/organisms";
import { Whitelist } from "components/organisms/Whitelist/Whitelist";
import { GovernanceLayout } from "components/templates/GovernanceLayout/GovernanceLayout";

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
      <Helmet>
        <title>OSWAP token — Pool whitelist</title>
      </Helmet>

      <WalletModal hideIfHas={true}>
        <div>
          <Warning className="w-auto mb-5 cursor-pointer">Please add your wallet address to access all site features</Warning>
        </div>
      </WalletModal>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="mb-3 text-3xl font-bold leading-tight">Pool whitelist</h2>
          <div className="text-base font-medium text-primary-gray-light">
            Vote for adding or removing pools eligible to receive rewards. Once added, the pool’s share of rewards is voted on{" "}
            <Link to="/governance/shares/stake" className="text-primary">
              here
            </Link>
            .
          </div>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-16 sm:flex-none">
          <AddPoolModal />
        </div>
      </div>
      <div className="mt-5">
        <Whitelist />
      </div>
    </GovernanceLayout>
  );
};
