import { useState } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import ReactGA from "react-ga";

import { Button, Select } from "components/atoms";
import { Modal } from "components/molecules";

import { selectWalletAddress } from "store/slices/settingsSlice";
import { selectNotAddedPoolList } from "store/slices/cacheSlice";

import { generateLink } from "utils";
import appConfig from "appConfig";

export const AddPoolModal = () => {
  const walletAddress = useSelector(selectWalletAddress);
  const [pool, setPool] = useState(null);
  const [visible, setVisible] = useState(false);

  const notAddedPoolList = useSelector(selectNotAddedPoolList);

  const handleChange = (pool) => {
    setPool(pool);
  };

  const whitelistedUrl = generateLink({ amount: 1e4, data: { vote_whitelist: 1, pool_asset: pool }, aa: appConfig.AA_ADDRESS, from_address: walletAddress });

  const sendAddPoolEvent = () => {
    ReactGA.event({
      category: "Whitelist",
      action: "Add pool",
      label: walletAddress,
    });
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible((v) => !v)} disabled={!walletAddress}>
        Add pool
      </Button>
      <Modal
        title="Add pool"
        visible={visible}
        onClose={() => setVisible((v) => !v)}
        customControllers={[
          <Button type="primary" onClick={sendAddPoolEvent} block className="mt-5" href={whitelistedUrl} disabled={!pool}>
            Whitelist
          </Button>,
        ]}
        width={550}
      >
        <Helmet>
          <title>OSWAP token — Add pool</title>
        </Helmet>

        <div className="container">
          <Select value={pool} className="mb-5" onChange={handleChange} placeholder="Select a pool">
            {notAddedPoolList.map(({ address, symbol, pool_asset }) => (
              <Select.Option key={pool_asset} value={pool_asset}>
                {`${symbol ?? pool_asset.slice(0, 9) + "..."} (${address})`}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
    </>
  );
};
