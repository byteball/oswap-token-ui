import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import Countdown from "react-countdown";
import { useSelector } from "react-redux";
import ReactGA from "react-ga";

import { Button } from "components/atoms";
import { QRButton, QuestionTooltip } from "components/molecules";
import { ChangeParamsModal } from "components/organisms/ChangeParamsModal/ChangeParamsModal";
import { ListOfVotersModal } from "components/organisms/ListOfVotersModal/ListOfVotersModal";
import { selectSettings, selectStateVars, selectTokenInfo } from "store/slices/agentSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";

import { convertBigNum, generateLink, getCurrentVpByNormalized } from "utils";
import appConfig from "appConfig";

const viewParams = (name, value) => {
  if (["swap_fee", "arb_profit_tax", "base_rate", "inflation_rate", "stakers_share"].includes(name)) {
    return `${+Number(value * 100).toFixed(4)}%`;
  } else if (name === "challenging_period") {
    return `${+Number(value / (24 * 3600)).toFixed(2)} days`;
  } else if (name === "oracle") {
    return (
      <small>
        <Button
          type="text-primary"
          className="truncate"
          target="_blank"
          rel="noopener"
          href={`https://${appConfig.ENVIRONMENT === "testnet" ? "testnet" : ""}explorer.obyte.org/address/${value}`}
        >
          {`${value.slice(0, 5)}...${value.slice(-5)}`} <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2 mt-[-2px]" aria-hidden="true" />
        </Button>
      </small>
    );
  } else if (name === "base_tvl") {
    return `$${convertBigNum(value, 4)}`;
  }
  return value;
};

export const GovernanceParamItem = ({ name, description, value, leader, votes = [], validator, view_unit, helpText, custom_name, toSmall, toBig }) => {
  const walletAddress = useSelector(selectWalletAddress);
  const { decimals } = useSelector(selectTokenInfo);
  const { challenging_period } = useSelector(selectSettings);
  const stateVars = useSelector(selectStateVars);

  let canChange = false;
  let canChangeTime;
  let canChangeTimeMoment;
  let commitUrl = "#";

  if (leader) {
    canChangeTime = leader.flip_ts + challenging_period;
    canChangeTimeMoment = moment.unix(canChangeTime);
    canChange = moment.utc().isAfter(canChangeTimeMoment);

    if (canChange) {
      commitUrl = generateLink({ amount: 1e4, data: { vote_value: 1, name, value: leader.value }, aa: appConfig.AA_ADDRESS, from_address: walletAddress });
    }
  }

  const sendCommitEvent = () => {
    ReactGA.event({
      category: "Params",
      action: "Commit " + custom_name ? custom_name : name.split("_").join(" "),
      label: walletAddress,
    });
  };

  return (
    <div className="p-6 mt-8 rounded-xl bg-primary-gray-medium">
      <div className="flex flex-col mb-1 font-bold md:text-xl md:flex-row md:justify-between">
        <div className="flex items-center text-lg leading-tight uppercase md:text-xl">
          {custom_name ? custom_name : name.split("_").join(" ")} <QuestionTooltip description={description} />
        </div>
        <div className="max-w-[400px] mt-2 md:mt-0 md:text-right">Current value: {viewParams(name, value)}</div>
      </div>

      {leader !== undefined ? (
        <div className="flex flex-col justify-between font-bold md:items-center md:flex-row text-primary-gray-light">
          {leader !== undefined && (
            <>
              <div>Leader: {viewParams(name, leader.value)}</div>
              {leader.value !== value && (
                <>
                  {canChange ? (
                    <QRButton onClick={sendCommitEvent} type="text-primary" disabled={!walletAddress} href={commitUrl}>
                      commit
                    </QRButton>
                  ) : (
                    <Countdown
                      renderer={({ hours, minutes, seconds, days }) => (
                        <span>
                          {days} days {hours}h {minutes}m {seconds}s
                        </span>
                      )}
                      date={canChangeTimeMoment.toISOString()}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      ) : null}

      {votes.length > 0 ? (
        <div>
          <div className="flex flex-col mt-6">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-primary-gray">
                    <thead className="bg-[#131519]/30">
                      <tr>
                        <th scope="col" className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">
                          Value
                        </th>
                        <th scope="col" className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-white">
                          VPs
                        </th>
                        <th scope="col" className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-white">
                          Support
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#131519]/30">
                      {votes.map(({ value, vp }) => {
                        const votesByValue = getParamVotesByValue(name, value, stateVars);

                        return (
                          <tr key={`${value} ${name}`}>
                            <td className="py-2 pl-4 pr-3 text-sm text-white whitespace-nowrap sm:pl-6">{viewParams(name, value)}</td>
                            <td className="px-2 py-2 text-sm text-white whitespace-nowrap">
                              <ListOfVotersModal votes={votesByValue}>
                                {+Number(getCurrentVpByNormalized(vp) / 10 ** decimals).toPrecision(4)}
                              </ListOfVotersModal>
                            </td>
                            <td className="px-2 py-2 text-sm whitespace-nowrap">
                              <ChangeParamsModal
                                name={name}
                                value={value}
                                disabled={!walletAddress}
                                textBtn="support this value"
                                description={description}
                                validator={validator}
                                toSmall={toSmall}
                                toBig={toBig}
                                view_unit={view_unit}
                                helpText={helpText}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <div className="py-2 pl-4 pr-3 text-sm font-semibold text-left text-white whitespace-nowrap sm:pl-6">
                        <ChangeParamsModal
                          name={name}
                          disabled={!walletAddress}
                          textBtn="suggest another value"
                          description={description}
                          validator={validator}
                          toSmall={toSmall}
                          view_unit={view_unit}
                          helpText={helpText}
                        />
                      </div>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <ChangeParamsModal
            name={name}
            disabled={!walletAddress}
            textBtn="suggest another value"
            description={description}
            validator={validator}
            toSmall={toSmall}
            view_unit={view_unit}
            helpText={helpText}
          />
        </div>
      )}
    </div>
  );
};

export const getParamVotesByValue = (name, value, stateVars) => {
  const votes = [];

  Object.entries(stateVars).forEach(([key, valueObj]) => {
    if (key.startsWith("user_value_votes_") && key.endsWith(name)) {
      if (String(value) === String(valueObj.value)) {
        const address = key.split("_")?.[3];
        votes.push({ vp: valueObj.vp, address });
      }
    }
  });

  return votes;
};
