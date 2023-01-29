import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useSelector } from "react-redux";
import cn from "classnames";
import { Helmet } from "react-helmet-async";

import { Button } from "components/atoms";
import { Modal } from "components/molecules";

import { selectTokenInfo } from "store/slices/agentSlice";
import appConfig from "appConfig";

const MAX_VOTES_ON_PAGE = 5;

export const ListOfVotersModal = ({ children, votes = [] }) => {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);

  const { decimals } = useSelector(selectTokenInfo);

  const maxPages = Math.ceil(votes.length / MAX_VOTES_ON_PAGE);

  if (votes.length === 0) return <div>{children}</div>;

  return (
    <>
      <Button type="text-primary" onClick={() => setVisible(true)}>
        {children}
      </Button>

      <Modal visible={visible} width={550} customControllers={[]} onClose={() => setVisible(false)}>
        <Helmet>
          <title>OSWAP token — List of voters</title>
        </Helmet>

        <h2 className="mb-5 text-3xl font-bold">List of voters</h2>

        <div>
          <div className="flex justify-between py-1 font-bold">
            <div>Address</div>
            <div>VP</div>
          </div>

          {votes.slice(0, 5 * page).map(({ address, vp }) => (
            <div key={address} className="flex justify-between py-1">
              <Button
                type="text-primary"
                target="_blank"
                rel="noreferrer"
                href={`https://${appConfig.ENVIRONMENT === "testnet" ? "testnet" : ""}explorer.obyte.org/address/${address}`}
              >
                {address.slice(0, 12)}...{address.slice(26, 32)} <ArrowTopRightOnSquareIcon className="w-[1em] h-[1em] ml-2 mt-[-2px]" aria-hidden="true" />
              </Button>
              <div className={cn({ "text-red-500": vp < 0, "text-green-500": vp > 0 })}>{Number(vp / 10 ** decimals).toFixed(decimals)}</div>
            </div>
          ))}

          {votes.length > 5 && page < maxPages && (
            <div className="flex justify-center">
              <Button onClick={() => setPage((page) => page + 1)}>Load mote</Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
