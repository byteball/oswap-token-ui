import { isEmpty } from "lodash";
import { useReducer } from "react";
import { useSelector } from "react-redux";
import cn from "classnames";
import { CheckCircleIcon, PlusIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ReactGA from "react-ga";
import Tooltip from "rc-tooltip";

import { Button, Input, Select, Warning } from "components/atoms";
import { QRButton } from "components/molecules";

import { selectPools, selectUserData } from "store/slices/agentSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";

import { generateLink, getCountOfDecimals } from "utils";

import client from "services/obyte";

import appConfig from "appConfig";

import { initializeState, reducer } from "./formState";
import { getChangesObjectByFormState } from "./formState/utils/getChangesObjectByFormState";

export const MoveVPForm = () => {
  const { votes: userVotes = {} } = useSelector(selectUserData);

  const pools = useSelector(selectPools);
  const walletAddress = useSelector(selectWalletAddress);

  const [formState, dispatchFormState] = useReducer(reducer, [pools, userVotes], initializeState);

  const notVotedPools = pools.filter(({ asset_key }) => !(asset_key in userVotes));
  const showGroups = Math.ceil(pools.length / 30) > 2;

  const changePercent = (value, asset_key) => {
    if (getCountOfDecimals(value) <= 4 && !isNaN(Number(value)) && Number(value) <= 1e3 && Number(value) >= 0) {
      dispatchFormState({ type: "CHANGE_PERCENT", payload: { asset_key, value: String(value).trim() } })
    }
  };

  const changeAddedPool = (asset_key, old_asset_key) => {
    dispatchFormState({ type: "SELECT_NEW_POOL", payload: { asset_key, old_asset_key } });
  };

  const removePool = (asset_key) => {
    dispatchFormState({ type: "REMOVE_NEW_POOL", payload: { asset_key } });
  };

  const sendMoveEvent = () => {
    ReactGA.event({
      category: "OSWAP_TOKEN",
      action: "Move",
      label: walletAddress,
    });
  };

  const changes = getChangesObjectByFormState(formState);

  const disabled = formState.changedGroups.length < 1 || formState.changedGroups.length > 2 || formState.poolIsAdding || formState.userPoolsPercentSum <= 99.9999 || formState.userPoolsPercentSum >= 100.0001 || changes === false;

  // // Check working
  // useEffect(() => {
  //   (async () => {
  //     const data = await client.api.dryRunAa({
  //       address: appConfig.AA_ADDRESS, trigger: {
  //         address: "3Y24IXW57546PQAPQ2SXYEPEDNX4KC6Y",
  //         outputs: { 'base': 1e4 },
  //         data: { changes, vote_shares: 1, group_key1: formState.changedGroups[0], group_key2: formState.changedGroups[1] }
  //       }
  //     });

  //     if (!disabled) {
  //       console.log('NEW: dry run', formState.changedGroups, data[0], changes, Object.values(changes).reduce((acc, current) => acc + Number(current), 0));
  //     }
  //   })();


  // }, [formState, disabled]);

  if (isEmpty(formState.userPools)) {
    return <div className="mb-5 text-base font-medium text-primary-gray-light">You don't have any staked tokens</div>;
  }

  const link = generateLink({
    amount: 1e4,
    from_address: walletAddress,
    aa: appConfig.AA_ADDRESS,
    data: { changes, vote_shares: 1, group_key1: formState.changedGroups[0], group_key2: formState.changedGroups[1] },
    is_single: !walletAddress
  });

  // console.log("NEW PERCENT LIST", getPercentByChanges({ totalUserVP: formState.totalUserVP, userVotes, changes }));

  const autoFill = (asset_key) => {
    dispatchFormState({ type: "AUTO_FILL", payload: { asset_key } });
  }

  return (
    <div>
      {showGroups && (
        <Warning className="mb-5" type="warning">
          Your changes can only affect up to 2 groups per transaction. The group is indicated in parentheses after the pool name.
        </Warning>
      )}

      <div className="items-center hidden grid-cols-6 gap-4 mb-4 sm:grid lg:grid-cols-7 text-primary-gray-light">
        <div className="col-span-2 text-left">Pool</div>
        <div className="col-span-2">Current share</div>
        <div className="col-span-2">New share</div>
        <div className="hidden lg:block lg:col-span-1">Change</div>
      </div>

      {formState.userPools.map(({ asset_key, percentView, newPercent, group_key, symbol, isNew }) => {
        const change = !isNew ? newPercent - percentView : 0;

        return (
          <div key={`vote_${asset_key}_${group_key}`} className="grid items-center grid-cols-2 gap-4 mb-4 sm:grid-cols-6 lg:grid-cols-7">
            {isNew
              ? <Select value={asset_key} onChange={(value) => changeAddedPool(value, asset_key)} className="col-span-2">
                {notVotedPools?.filter(({ blacklisted }) => !blacklisted).map(({ symbol, asset_key, group_key }) => (
                  <Select.Option
                    key={asset_key}
                    disabled={formState.userPools.find(({ asset_key: a }) => a === asset_key)}
                    value={asset_key}
                  >
                    {`${symbol} ${showGroups ? `(${group_key.toUpperCase()})` : ""}`}
                  </Select.Option>
                ))}
              </Select> :
              <div className="col-span-2 text-left break-all">
                {symbol} {showGroups && `(${group_key.toUpperCase()})`}
              </div>}

            <Input value={percentView || 0} className="col-span-2" suffix="%" disabled={true} />

            <Input
              value={newPercent || ""}
              className="col-span-2"
              error={newPercent > 100 && "Max value is 100."}
              onChange={(ev) => changePercent(ev.target.value, asset_key)}
              suffix={<span>{(!newPercent && asset_key && formState.userPoolsPercentSum < 100) ? <Button type="text-primary" onClick={() => autoFill(asset_key)}>auto fill</Button> : null} %</span>}
            />

            {isNew ?
              <div className="w-[50px] relative flex items-center">
                <Tooltip className="inline-block ml-2" overlay="Remove pool">
                  <span className="inline ml-2 mr-2 font-medium text-white cursor-pointer" onClick={() => removePool(asset_key)}>
                    <XMarkIcon width={20} />{" "}
                  </span>
                </Tooltip>
              </div>
              : newPercent <= 100 && (
                <div className={cn("col-span-1 hidden lg:block", { "text-green-500": change > 0, "text-red-500": change < 0 })}>
                  {change !== 0 && `${change > 0 ? "+" : "-"}${+Number(Math.abs(change)).toFixed(8)}%`}
                </div>
              )}
          </div>
        );
      })}

      <div className="grid items-center grid-cols-2 gap-3 mb-3 sm:grid-cols-6 lg:grid-cols-7">
        <div className="col-span-4">
          <Button
            type="text"
            onClick={() => dispatchFormState({ type: "ADD_EMPTY_POOL" })}
            icon={<PlusIcon style={{ width: 20, height: 20 }} />}
            disabled={formState.poolIsAdding || formState.userPools.length >= pools.length}
          >
            Add a pool
          </Button>
        </div>
        <div className="flex items-center col-span-3 space-x-2 text-primary-gray-light">
          <span>SUM: {(formState.userPoolsPercentSum > 100 - 1e-4 && formState.userPoolsPercentSum < 100 + 1e-4) ? 100 : +Number(formState.userPoolsPercentSum).toFixed(5)}%</span>{" "}
          {(formState.userPoolsPercentSum >= 100 - 1e-4 && formState.userPoolsPercentSum <= 100 + 1e-4) ? (
            <CheckCircleIcon className="w-[1em] inline text-green-500" />
          ) : (
            <Tooltip placement="top" trigger={["hover"]} overlayClassName="max-w-[250px]" overlay="The total percentage should be 100">
              <XCircleIcon className="w-[1em] inline text-red-500" />
            </Tooltip>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2">{formState.changedGroups.length > 2 && <Warning>More than two groups have been affected by your changes</Warning>}</div>

      <QRButton onClick={sendMoveEvent} href={link} disabled={disabled} type="primary" className="mt-5">
        Move
      </QRButton>
    </div>
  );
};
