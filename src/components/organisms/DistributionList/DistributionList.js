import { CheckCircleIcon, PlusIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Input, Select } from "components/atoms";
import { isNaN } from "lodash";
import Tooltip from "rc-tooltip";
import { useSelector } from "react-redux";

import { selectPools } from "store/slices/agentSlice";
import { getCountOfDecimals } from "utils";

export const DistributionList = ({ distributions, setDistributions }) => {
  // selectors
  const pools = useSelector(selectPools);

  // calc
  const distributionSum = distributions.reduce((acc, current) => acc + Number(current.percent), 0);
  const firstGroupKey = distributions.length > 0 ? distributions[0].group_key : null;
  const maxPercent = 100 - distributionSum;

  // handles
  const handleChangePercent = (ev, index) => {
    const value = String(ev.target.value).trim();
    if (getCountOfDecimals(value) <= 9 && !isNaN(Number(value)) && Number(value) < 1e3) {
      const newArray = [...distributions];
      newArray[index].percent = value;
      setDistributions(newArray);
    }
  };

  const handleChangePool = (asset, index) => {
    const newArray = [...distributions];
    const poolsData = pools.find((data) => asset === data.asset);
    newArray[index] = { ...newArray[index], ...poolsData };
    setDistributions(newArray);
  };

  const removeDistribution = (asset) => {
    setDistributions((distributions) => distributions.filter((d) => d.asset !== asset));
  };

  return (
    <div className="mb-5">
      {distributions.length > 0 ? (
        <div>
          {distributions.map(({ percent, asset, blacklisted }, index) => (
            <div key={"list" + asset} className="grid items-center grid-cols-5 gap-2 mb-4">
              <div className="col-span-5 md:col-span-2">
                <Select value={asset} key={`select-${asset}`} placeholder="Select a pool" onChange={(v) => handleChangePool(v, index)} className="md:mr-3">
                  {pools.filter(({ blacklisted }) => !blacklisted).map(({ symbol, asset, group_key }) => {
                    const assetInAnotherField = distributions.find((ds) => ds.asset === asset);

                    return (
                      <Select.Option
                        key={"pool-d-" + asset + group_key}
                        value={asset}
                        disabled={(firstGroupKey ? firstGroupKey !== group_key : false) || (!!assetInAnotherField && distributions[index].asset !== asset)}
                      >
                        {`${symbol || asset.slice(0, 13) + "..."} (${group_key.toUpperCase()})`}
                      </Select.Option>
                    );
                  })}
                </Select>
              </div>

              <div className="col-span-3 md:col-span-2">
                <Input
                  value={percent || ""}
                  suffix="%"
                  error={percent !== undefined && (percent || 0) > 100 ? "Maximum number of percent 100" : false}
                  onChange={(ev) => handleChangePercent(ev, index)}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <div className="w-[50px] relative flex items-center">
                  <Tooltip className="inline-block ml-2" overlay="Remove pool">
                    <span className="inline ml-2 mr-2 font-medium text-white cursor-pointer" onClick={() => removeDistribution(asset)}>
                      <XMarkIcon width={20} />{" "}
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid items-center grid-cols-5 gap-2 mb-4">
        <div className="flex items-center col-span-5 md:col-span-2">
          <Button
            type="text"
            onClick={() => setDistributions((d) => [...d, { percent: +Number(maxPercent).toFixed(9) }])}
            icon={<PlusIcon style={{ width: 20, height: 20 }} />}
          >
            Add a pool
          </Button>
        </div>
        <div className="col-span-3 md:col-span-3">
          <div className="flex items-center col-span-3 space-x-2 text-primary-gray-light">
            <span>SUM: {+Number(distributionSum).toFixed(9)}%</span>{" "}
            {distributionSum === 100 ? (
              <CheckCircleIcon className="w-[1em] inline text-green-500" />
            ) : (
              <Tooltip placement="top" trigger={["hover"]} overlayClassName="max-w-[250px]" overlay="The total percentage should be 100">
                <XCircleIcon className="w-[1em] inline text-red-500" />
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
