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

import client from "services/obyte";

import appConfig from "appConfig";

export const MoveVPForm = () => {
  const { votes: userVotes = {} } = useSelector(selectUserData);
  
  const pools = useSelector(selectPools);
  const walletAddress = useSelector(selectWalletAddress);

  const [addedPools, setNewPools] = useState([]);
  const [initialPools, setInitialPools] = useState([]);

  const [changedGroups, setChangedGroups] = useState([]);
  const [currentPercentSum, setCurrentPercentSum] = useState(0);

  const poolsByKey = useMemo(() => keyBy(pools, (p) => p.asset_key), [pools]); // all OSWAP pools 
  const totalUserVP = Object.values(userVotes).reduce((acc, current) => acc + Number(current), 0);
  const notVotedPools = pools.filter(({ asset_key }) => !(asset_key in userVotes));

  const showGroups = Math.ceil(pools.length / 30) > 2;

  useEffect(() => {
    const percentSum = [...initialPools, ...addedPools].reduce((acc, current) => {
      if (Number(current.newPercent) === Number(current.percentView) && !current.isNew) {
        return acc + current.percent; // if percent not changed
      } else {
        return acc + Number(current.newPercent);
      }
    }, 0);

    setCurrentPercentSum(percentSum);
  }, [initialPools, addedPools]);


  // init pools arrays
  useEffect(() => {
    const initialPools = Object.entries(userVotes).map(([asset_key, vp]) => ({
      asset_key,
      vp,
      ...poolsByKey[asset_key],
      percent: (vp / totalUserVP) * 100,
      newPercent: round(Number((vp / totalUserVP) * 100), 4),
      percentView: round(Number((vp / totalUserVP) * 100), 4),
    }));

    setInitialPools(initialPools);
    setNewPools([]);
  }, [userVotes]);

  // update changedGroups when addedPools or initialPools changed 
  // It's necessary to check if the user has changed more than 2 groups
  useEffect(() => {
    const groups = [];

    [...addedPools, ...initialPools].forEach(({ newPercent, percentView, group_key, isNew }) => {
      if (Number(newPercent) !== Number(percentView)) {
        if (!groups.includes(group_key) && !(Number(newPercent) === 0 && isNew)) {
          groups.push(group_key);
        }
      }
    });

    setChangedGroups(groups);
  }, [addedPools, initialPools]);

  const changePercentInInitialPool = (value, index) => {
    if (getCountOfDecimals(value) <= 4 && !isNaN(Number(value)) && Number(value) <= 1e3 && Number(value) >= 0) {
      const v = [...initialPools];
      v[index].newPercent = String(value).trim();
      setInitialPools(v);
    }
  };

  const changeAddedPool = (asset_key, index) => {
    const cloneOfAddedPool = [...addedPools];

    cloneOfAddedPool[index] = { ...cloneOfAddedPool[index], ...poolsByKey[asset_key], newPercent: cloneOfAddedPool[index].newPercent || "" };

    setNewPools(cloneOfAddedPool);
  };

  const changePercentInAddedPool = (value, index) => {
    if (getCountOfDecimals(value) <= 4 && !isNaN(Number(value)) && Number(value) <= 1e3 && Number(value) >= 0) {
      const np = [...addedPools];
      np[index].newPercent = String(value).trim();
      setNewPools(np);
    }
  };

  const removePool = (index) => {
    const cloneAddedPools = [...addedPools];

    remove(cloneAddedPools, (_, i) => index === i);

    setNewPools(cloneAddedPools);
  };

  const sendMoveEvent = () => {
    ReactGA.event({
      category: "OSWAP_TOKEN",
      action: "Move",
      label: walletAddress,
    });
  };

  const changes = {};
  let noAssetKey = false;
  let changesRoundingError = 0;
  let canModified = false;

  // generate changes object
  [...initialPools, ...addedPools].forEach(({ asset_key, percentView = 0, newPercent = 0, vp = 0, isNew = false }) => {
    if (!asset_key) noAssetKey = true;

    if (Number(newPercent) !== Number(percentView)) { // if percent changed
      if (Number(newPercent || 0) === 0 && !isNew) { // remove all user votes from the pool
        changes[asset_key] = -vp;
      } else {
        let change = 0;

        if (!isNew) { // change user votes in the pool
          change = Number((newPercent / 100) * totalUserVP - vp);
        } else if (isNew) { // add user votes to this pool first time
          change = Number((newPercent / 100) * totalUserVP);
        }

        changes[asset_key] = round(change, 8);
        changesRoundingError += change - round(change, 8);
      }
    }
  });

  const roundingError = Object.values(changes).reduce((acc, current) => acc + Number(current), 0); // sum of changes ----> 0
  const roundingErrorPercent = (Math.abs(roundingError) / totalUserVP) * 100;

  const poolWhichWillBeModifiedForDecreaseRoundingError = Object.entries(changes).find(([_key, diff]) => roundingError > 0 ? Math.abs(roundingError) <= diff && diff < 0 : Math.abs(roundingError) <= diff && diff > 0)?.[0];

  if (poolWhichWillBeModifiedForDecreaseRoundingError && roundingErrorPercent <= 1e-4) {

    console.log("LOG: roundingError", poolWhichWillBeModifiedForDecreaseRoundingError, roundingError, `${roundingErrorPercent}%`, changes);
    canModified = true;
    if (roundingError > 0) {
      changes[poolWhichWillBeModifiedForDecreaseRoundingError] = changes[poolWhichWillBeModifiedForDecreaseRoundingError] - Math.abs(roundingError);
    } else {
      changes[poolWhichWillBeModifiedForDecreaseRoundingError] = changes[poolWhichWillBeModifiedForDecreaseRoundingError] + Math.abs(roundingError);
    }
  } else {
    console.log("LOG: can't modify", roundingErrorPercent);
  }

  const disabled =
    changedGroups.length < 1 || changedGroups.length > 2 || noAssetKey || !canModified || Math.abs(currentPercentSum) <= 99.999 //|| roundingErrorPercent >= 1e-4;

  // Check working
  useEffect(() => {
    (async () => {
      const data = await client.api.dryRunAa({
        address: appConfig.AA_ADDRESS, trigger: {
          address: "3Y24IXW57546PQAPQ2SXYEPEDNX4KC6Y",
          outputs: { 'base': 1e4 },
          data: { changes, vote_shares: 1, group_key1: changedGroups[0], group_key2: changedGroups[1] }
        }
      });

      // if (!disabled) {
        console.log('data', changedGroups, data[0].bounced, changes, Object.values(changes).reduce((acc, current) => acc + Number(current), 0));
      // }
    })();


  }, [initialPools, addedPools, changedGroups, disabled]);

  if (isEmpty(userVotes)) {
    return <div className="mb-5 text-base font-medium text-primary-gray-light">You don't have any staked tokens</div>;
  }

  const link = generateLink({
    amount: 1e4,
    from_address: walletAddress,
    aa: appConfig.AA_ADDRESS,
    data: { changes, vote_shares: 1, group_key1: changedGroups[0], group_key2: changedGroups[1] },
    is_single: !walletAddress
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
        <div className="col-span-2">Current share</div>
        <div className="col-span-2">New share</div>
        <div className="hidden lg:block lg:col-span-1">Change</div>
      </div>

      {initialPools.map(({ asset_key, percentView, newPercent, group_key, symbol }, index) => {
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
              onChange={(ev) => changePercentInInitialPool(ev.target.value, index)}
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

      {addedPools.length > 0 &&
        addedPools?.map(({ asset_key, newPercent }, index) => (
          <div key={`${asset_key}-${index}`} className="grid items-center grid-cols-2 gap-3 mb-3 sm:grid-cols-6 lg:grid-cols-7">
            <Select value={asset_key} onChange={(value) => changeAddedPool(value, index)} className="col-span-2">
              {notVotedPools?.filter(({ blacklisted }) => !blacklisted).map(({ symbol, asset_key, group_key }) => (
                <Select.Option
                  key={asset_key}
                  disabled={addedPools.find(({ asset_key: a }) => a === asset_key) && addedPools[index].asset_key !== asset_key}
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
              onChange={(ev) => changePercentInAddedPool(ev.target.value, index)}
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
            disabled={addedPools.length >= notVotedPools.length}
          >
            Add a pool
          </Button>
        </div>
        <div className="flex items-center col-span-3 space-x-2 text-primary-gray-light">
          <span>SUM: {(currentPercentSum >= 100 - 1e-4 && currentPercentSum <= 100 + 1e-4) ? 100 : +Number(currentPercentSum).toFixed(6)}%</span>{" "}
          {(currentPercentSum >= 100 - 1e-4 && currentPercentSum <= 100 + 1e-4) ? (
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
