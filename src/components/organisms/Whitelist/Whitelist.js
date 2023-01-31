import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { useState } from "react";
import Countdown from "react-countdown";
import { useSelector } from "react-redux";
import ReactGA from "react-ga";

import { Button } from "components/atoms";
import { QRButton, QuestionTooltip } from "components/molecules";

import { selectPools, selectSettings, selectStateVars, selectTokenInfo, selectWaitingPools, selectWalletVotes } from "store/slices/agentSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";

import { ListOfVotersModal } from "../ListOfVotersModal/ListOfVotersModal";

import { generateLink } from "utils";
import appConfig from "appConfig";

const POOLS_PER_PAGE = 5;

export const Whitelist = () => {
  const pools = useSelector(selectPools);
  const waitingPools = useSelector(selectWaitingPools);
  const [page, setPage] = useState(1);

  const listedOrWaitingPools = [...pools, ...waitingPools];
  const maxPage = Math.ceil(listedOrWaitingPools.length / POOLS_PER_PAGE);

  if (listedOrWaitingPools.length === 0) return "The whitelist is empty, please add the first pool.";

  return (
    <div>
      <div className="mt-8 -mx-4 overflow-hidden ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
        {listedOrWaitingPools.slice(0, page * POOLS_PER_PAGE).map(({ symbol, asset, ...rest }) => (
          <PoolViewItem key={asset} symbol={symbol} asset={asset} {...rest} />
        ))}
      </div>

      {maxPage > page && (
        <div className="flex justify-center mt-2">
          <Button type="default" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

const PoolViewItem = ({ address, symbol, asset, decimals: pool_decimals, waiting, blacklisted, votes_vp, vp, asset_key, group_key, ...rest }) => {
  const walletAddress = useSelector(selectWalletAddress);
  const walletVotes = useSelector(selectWalletVotes);
  const { decimals } = useSelector(selectTokenInfo);
  const { challenging_period } = useSelector(selectSettings);
  const stateVars = useSelector(selectStateVars);

  const walletVoteVP = walletVotes[asset] || 0;
  const totalVp = vp || votes_vp?.vp;

  let status = "VOTING";
  let futureStatus = totalVp >= 0 ? "WHITELISTED" : "BLACKLISTED";

  let flipTsISO;
  let flipTsExpired = false;

  if (!waiting) {
    if (blacklisted) {
      status = "BLACKLISTED";
    } else {
      status = "WHITELISTED";
    }
  }

  const flipTs = rest.flip_ts || votes_vp?.flip_ts;
  const momentFlipTs = flipTs ? moment.unix(flipTs + challenging_period) : null;

  flipTsExpired = momentFlipTs ? momentFlipTs.isBefore() : false;
  flipTsISO = momentFlipTs?.toISOString();

  const whitelistedUrl = generateLink({ amount: 1e4, data: { vote_whitelist: 1, pool_asset: asset }, aa: appConfig.AA_ADDRESS, from_address: walletAddress });
  const blacklistedUrl = generateLink({ amount: 1e4, data: { vote_blacklist: 1, pool_asset: asset }, aa: appConfig.AA_ADDRESS, from_address: walletAddress });
  const commitUrl = totalVp >= 0 ? whitelistedUrl : blacklistedUrl;

  const shareOfEmission = stateVars?.state?.total_normalized_vp
    ? Number((stateVars?.[`pool_vps_${group_key}`]?.[asset_key] / stateVars?.state?.total_normalized_vp) * 100).toFixed(4)
    : 0;

  const votesByValue = [];
  Object.entries(stateVars).forEach(([key, vp]) => {
    if (key.startsWith("user_wl_votes_") && key.endsWith(asset) && vp !== 0) {
      const address = key.split("_")?.[3];
      votesByValue.push({ vp, address });
    }
  });

  const sendCommitEvent = () => {
    ReactGA.event({
      category: "Whitelist",
      action: "Commit",
      label: walletAddress,
    });
  };

  const sendVoteForEvent = () => {
    ReactGA.event({
      category: "Whitelist",
      action: "Vote for",
      label: walletAddress,
    });
  };

  const sendVoteAgainstEvent = () => {
    ReactGA.event({
      category: "Whitelist",
      action: "Vote against",
      label: walletAddress,
    });
  };

  return (
    <div className="rounded-lg bg-[#131519]/30 p-5 mb-5">
      <div className="">
        <div className="md:flex md:justify-between">
          <div>
            <a
              target="_blank"
              rel="noreferrer"
              className="flex items-center mb-3 text-xl text-primary md:mb-0"
              href={`https://${appConfig.ENVIRONMENT === "testnet" ? "v2-testnet" : ""}.oswap.io/#/swap/${address}`}
            >
              {symbol || `${asset.slice(0, 13)}...`} <ArrowTopRightOnSquareIcon className="w-[1em] h-[1em] ml-2 mt-[-2px]" aria-hidden="true" />
            </a>
          </div>
          <div className="text-xl">
            <b className="md:hidden">Status:</b> {status}
          </div>
        </div>

        <div className="pt-2 max-w-[600px]">
          {flipTsISO && status !== futureStatus ? (
            <div className="text-primary-light">
              {!flipTsExpired ? (
                <div className="text-yellow-500">
                  Will become {futureStatus} in{" "}
                  <Countdown
                    date={flipTsISO}
                    autoStart
                    renderer={({ hours, minutes, days }) => (
                      <span className="">
                        {days} days {hours}h {minutes}m
                      </span>
                    )}
                  />{" "}
                  unless the balance of for and against votes changes
                </div>
              ) : (
                <div className="flex items-center">
                  Voting has ended.{" "}
                  <QRButton text type="text-primary" onClick={sendCommitEvent} href={commitUrl} className="mt-0 ml-1 mr-1 leading-none text-primary">
                    Commit
                  </QRButton>{" "}
                  to change the status to {futureStatus}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="md:flex md:justify-between">
          <div className="flex space-x-1">
            <b>Total VP:</b> <ListOfVotersModal votes={votesByValue}>{Number(totalVp / 10 ** decimals).toFixed(decimals)}</ListOfVotersModal>{" "}
            {totalVp < 0 && <QuestionTooltip className="mt-[3px]" description={"Negative VP means votes against whitelisting the pool"} />}
          </div>

          {status === "WHITELISTED" && (
            <div className="text-primary-light">
              <b>Share of emissions:</b> {shareOfEmission}%
            </div>
          )}
        </div>

        {!!walletVoteVP && (
          <div className="mb-2">
            <b>My VP:</b> {Number((walletVoteVP || 0) / 10 ** decimals).toFixed(decimals)}{" "}
            {walletVoteVP < 0 && <QuestionTooltip className="mt-[-2px]" description={"Negative VP means votes against whitelisting the pool"} />}
          </div>
        )}

        <div className="flex mt-2 space-x-4">
          <QRButton href={whitelistedUrl} onClick={sendVoteForEvent} type="text-primary">
            vote for
          </QRButton>

          <QRButton href={blacklistedUrl} onClick={sendVoteAgainstEvent} type="text-primary">
            vote against
          </QRButton>
        </div>
      </div>
    </div>
  );
};
