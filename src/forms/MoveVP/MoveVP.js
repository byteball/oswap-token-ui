import { isEmpty, keyBy, remove, round } from "lodash";
import { useEffect, useMemo, useState } from "react";
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
import appConfig from "appConfig";

export const MoveVPForm = () => {
  const { votes } = useSelector(selectUserData);
  const pools = useSelector(selectPools);
  const walletAddress = useSelector(selectWalletAddress);

  const [newPools, setNewPools] = useState([]);
  const [mVotes, setMVotes] = useState([]);
  const [changedGroups, setChangedGroups] = useState([]);

  const poolsByKey = useMemo(() => keyBy(pools, (p) => p.asset_key), [pools]);
  const votesVpSum = Object.values(votes).reduce((acc, current) => acc + Number(current), 0);
  const notVotedPools = pools.filter(({ asset_key }) => !(asset_key in votes));

  const showGroups = Math.ceil(pools.length / 30) > 2;

  const currentPercentSum = [...mVotes, ...newPools].reduce((acc, current) => {
    if (Number(current.newPercent) === Number(current.percentView) && !current.isNew) {
      return acc + Number(current.percentView);
    } else {
      return acc + Number(current.newPercent);
    }
  }, 0);

  useEffect(() => {
    const mVotes = Object.entries(votes || {}).map(([asset_key, vp]) => ({
      asset_key,
      vp,
      percent: (vp / votesVpSum) * 100,
      newPercent: round(Number((vp / votesVpSum) * 100), 4),
      percentView: round(Number((vp / votesVpSum) * 100), 4),
      ...poolsByKey[asset_key],
    }));

    setMVotes(mVotes);
    setNewPools([]);
  }, [votes]);

  useEffect(() => {
    const groups = [];

    [...newPools, ...mVotes].forEach(({ newPercent, percentView, group_key, isNew }) => {
      if (Number(newPercent) !== Number(percentView)) {
        if (!groups.includes(group_key) && !(Number(newPercent) === 0 && isNew)) {
          groups.push(group_key);
        }
      }
    });

    setChangedGroups(groups);
  }, [newPools, mVotes]);

  const changePercent = (value, index) => {
    if (getCountOfDecimals(value) <= 4 && !isNaN(Number(value)) && Number(value) <= 1e3 && Number(value) >= 0) {
      const v = [...mVotes];
      v[index].newPercent = value;
      setMVotes(v);
    }
  };

  const changeNewPool = (asset_key, index) => {
    const n = [...newPools];

    n[index] = { ...n[index], ...poolsByKey[asset_key], newPercent: n[index].newPercent || "" };

    setNewPools(n);
  };

  const changePercentInNewPool = (value, index) => {
    if (getCountOfDecimals(value) <= 4 && !isNaN(Number(value)) && Number(value) <= 1e3 && Number(value) >= 0) {
      const np = [...newPools];
      np[index].newPercent = value;
      setNewPools(np);
    }
  };

  const removePool = (index) => {
    const np = [...newPools];

    remove(np, (_, i) => index === i);

    setNewPools(np);
  };

  const sendMoveEvent = () => {
    ReactGA.event({
      category: "OSWAP_TOKEN",
      action: "Move",
      label: walletAddress,
    });
  };

  if (isEmpty(votes)) {
    return <div className="mb-5 text-base font-medium text-primary-gray-light">You don't have any staked tokens</div>;
  }

  const changes = {};
  let change = 0;
  let noAssetKey = false;

  [...mVotes, ...newPools].forEach(({ asset_key, percentView = 0, newPercent = 0, vp = 0, isNew = false }) => {
    if (!asset_key) noAssetKey = true;

    if (Number(newPercent) !== Number(percentView)) {
      if (Number(newPercent || 0) === 0 && !isNew) {
        change = vp - (percentView / 100) * votesVpSum;
        changes[asset_key] = -vp;
      } else if (!isNew) {
        const roundingChange = vp - (percentView / 100) * votesVpSum;

        changes[asset_key] = (newPercent / 100) * votesVpSum + roundingChange - vp;
      } else if (isNew) {
        changes[asset_key] = (newPercent / 100) * votesVpSum;
      }
    }
  });

  const disabled =
    changedGroups.length < 1 || changedGroups.length > 2 || currentPercentSum > 100 * (1 + 1 / 9e6) || currentPercentSum <= 100 * (1 - 1 / 1e9) || noAssetKey;

  let roundingError = Object.values(changes).reduce((acc, current) => acc + Number(current), 0);

  if (roundingError !== 0) {
    Object.entries(changes).forEach(([key, diff]) => {
      if (roundingError !== 0) {
        if (votes[key] !== Math.abs(diff)) {
          if (diff < 0 || change > 0) {
            changes[key] -= roundingError;
            roundingError = 0;
          }
        }
      }
    });
  }

  const link = generateLink({
    amount: 1e4,
    from_address: walletAddress,
    aa: appConfig.AA_ADDRESS,
    data: { changes, vote_shares: 1, group_key1: changedGroups[0], group_key2: changedGroups[1] },
  });

  return (
    <div>
      {showGroups && (
        <Warning className="mb-5" type="warning">
          Your changes can only affect up to 2 groups per transaction. The group is indicated in parentheses after the pool name.
        </Warning>
      )}

      <div className="items-center hidden grid-cols-6 gap-4 mb-4 sm:grid lg:grid-cols-7 text-primary-gray-light">
        <div className="col-span-2 text-left">Pool</div>
        <div className="col-span-2 ">Current share</div>
        <div className="col-span-2">New share</div>
        <div className="hidden lg:block lg:col-span-1">Change</div>
      </div>

      {mVotes.map(({ asset_key, percentView, newPercent, group_key, symbol }, index) => {
        const change = newPercent - percentView;

        return (
          <div key={`vote_${asset_key}_${group_key}`} className="grid items-center grid-cols-2 gap-4 mb-4 sm:grid-cols-6 lg:grid-cols-7">
            <div className="col-span-2 text-left break-all">
              {symbol} {showGroups && `(${group_key.toUpperCase()})`}
            </div>

            <Input value={percentView} className="col-span-2" suffix="%" disabled={true} />

            <Input
              value={newPercent}
              className="col-span-2"
              error={newPercent > 100 && "Max value is 100."}
              onChange={(ev) => changePercent(ev.target.value, index)}
              suffix="%"
            />

            {newPercent <= 100 && (
              <div className={cn("col-span-1 hidden lg:block", { "text-green-500": change > 0, "text-red-500": change < 0 })}>
                {change !== 0 && `${change > 0 ? "+" : "-"}${+Number(Math.abs(change)).toFixed(4)}%`}
              </div>
            )}
          </div>
        );
      })}

      {newPools.length > 0 &&
        newPools?.map(({ asset_key, newPercent }, index) => (
          <div key={`${asset_key}-${index}`} className="grid items-center grid-cols-2 gap-3 mb-3 sm:grid-cols-6 lg:grid-cols-7">
            <Select value={asset_key} onChange={(value) => changeNewPool(value, index)} className="col-span-2">
              {notVotedPools.map(({ symbol, asset_key, group_key }) => (
                <Select.Option
                  key={asset_key}
                  disabled={newPools.find(({ asset_key: a }) => a === asset_key) && newPools[index].asset_key !== asset_key}
                  value={asset_key}
                >
                  {`${symbol} ${showGroups ? `(${group_key.toUpperCase()})` : ""}`}
                </Select.Option>
              ))}
            </Select>

            <Input value={0} className="col-span-2" suffix="%" disabled={true} />

            <Input
              value={newPercent}
              className="col-span-1 lg:col-span-2"
              error={newPercent > 100 && "Max value is 100."}
              onChange={(ev) => changePercentInNewPool(ev.target.value, index)}
              suffix="%"
            />

            <div className="w-[50px] relative flex items-center">
              <Tooltip className="inline-block ml-2" overlay="Remove pool">
                <span className="inline ml-2 mr-2 font-medium text-white cursor-pointer" onClick={() => removePool(index)}>
                  <XMarkIcon width={20} />{" "}
                </span>
              </Tooltip>
            </div>
          </div>
        ))}

      <div className="grid items-center grid-cols-2 gap-3 mb-3 sm:grid-cols-6 lg:grid-cols-7">
        <div className="col-span-4">
          <Button
            type="text"
            onClick={() => setNewPools((n) => [...n, { vp: 0, newPercent: "", isNew: true }])}
            icon={<PlusIcon style={{ width: 20, height: 20 }} />}
            disabled={newPools.length >= notVotedPools.length}
          >
            Add a pool
          </Button>
        </div>
        <div className="flex items-center col-span-3 space-x-2 text-primary-gray-light">
          <span>SUM: {+Number(currentPercentSum).toFixed(9)}%</span>{" "}
          {currentPercentSum === 100 ? (
            <CheckCircleIcon className="w-[1em] inline text-green-500" />
          ) : (
            <Tooltip placement="top" trigger={["hover"]} overlayClassName="max-w-[250px]" overlay="The total percentage should be 100">
              <XCircleIcon className="w-[1em] inline text-red-500" />
            </Tooltip>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2">{changedGroups.length > 2 && <Warning>More than two groups have been affected by your changes</Warning>}</div>

      <QRButton onClick={sendMoveEvent} href={link} disabled={disabled} type="primary" className="mt-5">
        Move
      </QRButton>
    </div>
  );
};
