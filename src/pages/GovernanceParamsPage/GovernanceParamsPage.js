import { isInteger } from "lodash";
import { useSelector } from "react-redux";
import obyte from "obyte";
import { Helmet } from "react-helmet-async";

import { Spin, Warning } from "components/atoms";
import { WalletModal } from "components/organisms/WalletModal/WalletModal";
import { GovernanceLayout } from "components/templates/GovernanceLayout/GovernanceLayout";

import { selectGovernance, selectStateVarsLoading } from "store/slices/agentSlice";

import { GovernanceParamItem } from "./GovernanceParamItem";

export const params = {
  swap_fee: {
    description: "Fee charged when buying and selling OSWAP token",
    initValue: 0.003,
    validate: (value) => Number(value) >= 0 && Number(value) < 1,
    view_unit: "%",
    helpText: "The value of the swap fee parameter must be positive and less than 100.",
    toBig: (value) => value * 100,
    toSmall: (value) => value / 100,
  },
  arb_profit_tax: {
    description:
      "Additional fee charged when buying and selling OSWAP token. The fee is a percentage of the implied arbitrageuer profit from price difference with another market.",
    initValue: 0.9,
    validate: (value) => Number(value) >= 0,
    view_unit: "%",
    helpText: "The value of the arb profit tax parameter must be greater than or equal to 0.",
    toBig: (value) => value * 100,
    toSmall: (value) => value / 100,
  },
  base_rate: {
    custom_name: "BASE APPRECIATION RATE",
    description:
      "Yearly appreciation rate of OSWAP token if the actual TVL of all Oswap pools is equal to the base TVL. If the actual TVL is different from the base TVL, the actual appreciation rate is scaled proportionally.",
    initValue: 0.3,
    validate: (value) => Number(value) >= 0,
    view_unit: "%",
    helpText: "The value of the base rate parameter must be greater than or equal to 0.",
    toBig: (value) => value * 100,
    toSmall: (value) => value / 100,
  },
  inflation_rate: {
    description: "Yearly inflation rate due to emissions of OSWAP tokens to LPs and governance participants (stakers).",
    initValue: 0.3,
    validate: (value) => Number(value) >= 0,
    view_unit: "%",
    helpText: "The value of the inflation rate parameter must be greater than or equal to 0.",
    toBig: (value) => value * 100,
    toSmall: (value) => value / 100,
  },
  stakers_share: {
    description:
      "Share of emissions that is directed to stakers locking OSWAP tokens in governance. The rest goes to LPs who deposit LP tokens of the incentivized pools.",
    initValue: 0.5,
    validate: (value) => Number(value) >= 0 && Number(value) <= 1,
    view_unit: "%",
    helpText: "The value of the stakers share parameter must be positive and less than or equal 100.",
    toBig: (value) => value * 100,
    toSmall: (value) => value / 100,
  },
  base_tvl: {
    description: "The TVL of all Oswap pools that yields the appreciation rate of OSWAP token equal to Base Appreciation Rate",
    initValue: 1000000,
    validate: (value) => Number(value) > 0,
    view_unit: "$",
    helpText: "The value of the base tvl parameter must be greater than or equal to 0.",
    toBig: (value) => value * 100,
    toSmall: (value) => value / 100,
  },
  oracle: {
    description: "Address of the oracle that tracks and periodically posts the total TVL of all Oswap pools combined",
    initValue: "KMCA3VLWKLO3AWSSDA3LQIKI3OQEN7TV",
    validate: (value) => obyte.utils.isValidAddress(value),
    helpText: "Address isn't valid",
    toBig: (value) => value,
    toSmall: (value) => value,
  },
  challenging_period: {
    description:
      "Challenging period that is used for most governance decisions. If a governance proposal is not overtaken by voting power by any competing proposal within this period, the proposal is deemed accepted. Only two governance decisions don’t pass this way and require a majority approval: changing the challenging period itself and paying out a portion of the reserves to a management team that undertakes to use the funds to promote Oswap and its token.",
    initValue: 432000, // 5 days
    validate: (value) => Number(value) > 0 && isInteger(Number(value)),
    view_unit: "days",
    helpText: "The value of the period_length parameter must be integer greater than or equal to 0.",
    toBig: (value) => (value / 24) * 3600,
    toSmall: (value) => value,
  },
};

export default () => {
  const actualParams = useSelector(selectGovernance);
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
        <title>OSWAP token — Change params</title>
      </Helmet>

      <WalletModal hideIfHas={true}>
        <div>
          <Warning className="w-auto mb-5 cursor-pointer">Please add your wallet address to access all site features</Warning>
        </div>
      </WalletModal>

      <h2 className="mb-3 text-3xl font-bold leading-tight">Change params</h2>
      <div className="text-base font-medium text-primary-gray-light">Vote to change the parameters of OSWAP token.</div>

      {Object.entries(actualParams).map(([name, { description, value, leader, votes, view_unit, custom_name }]) => (
        <GovernanceParamItem
          key={name}
          name={name}
          value={value}
          votes={votes}
          leader={leader}
          description={description}
          validator={params[name].validate}
          toSmall={params[name].toSmall}
          toBig={params[name].toBig}
          helpText={params[name].helpText}
          view_unit={view_unit}
          custom_name={custom_name}
        />
      ))}
    </GovernanceLayout>
  );
};
