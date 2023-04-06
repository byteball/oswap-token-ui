import { memo } from "react";
import { useSelector } from "react-redux";

import { InfoPanel } from "components/molecules";

import { selectStateVarsLoading } from "store/slices/agentSlice";
import { selectPresaleStateVars, selectPresaleStateVarsLoading } from "store/slices/presaleSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";

import { get_presale_prices } from "utils/getExchangeResult";

const PRECISION = 7;

export const PresaleInfoPanel = memo(() => {
  const presaleStateVars = useSelector(selectPresaleStateVars);
  const presaleStateVarsLoading = useSelector(selectPresaleStateVarsLoading);
  const stateVarsLoading = useSelector(selectStateVarsLoading);
  const walletAddress = useSelector(selectWalletAddress);

  const reserveView = +Number((presaleStateVars.total || 0) / 10 ** 9).toPrecision(PRECISION);

  const { final_price = 0, cap = 0, avg_price = 0, tokens = 0 } = get_presale_prices(presaleStateVars.total);
  const currentPresalePriceView = +Number(final_price).toPrecision(PRECISION);
  const capView = +Number(cap / 10 ** 9).toPrecision(PRECISION);

  const balance = walletAddress ? presaleStateVars[`user_${walletAddress}`] || 0 : 0;
  const balanceView = +Number(balance / 10 ** 9).toPrecision(PRECISION);

  const userTokensAmount = balance && presaleStateVars.total !== 0 ? tokens * (balance / presaleStateVars.total) : 0;
  const userTokensCost = userTokensAmount ? final_price * userTokensAmount : 0;
  const userTokensCostView = +Number(userTokensCost / 10 ** 9).toPrecision(PRECISION);

  const averageBuyingPriceView = +Number(avg_price).toPrecision(PRECISION);

  return (
    <>
      {!!walletAddress && (
        <InfoPanel loading={presaleStateVarsLoading || stateVarsLoading} className="mb-6">
          <InfoPanel.Item
            name="My investment"
            description="GBYTE amount you deposited for buying the future OSWAP tokens"
            value={balanceView}
            suffix={<small className="text-sm"> GBYTE</small>}
          />

          <InfoPanel.Item
            name="Value of my future tokens"
            description="Expected value of your future OSWAP tokens at the current price (the price might change due to other people investing)"
            value={userTokensCostView}
            suffix={<small className="text-sm"> GBYTE</small>}
          />
        </InfoPanel>
      )}

      <InfoPanel loading={presaleStateVarsLoading || stateVarsLoading}>
        <InfoPanel.Item
          name="RESERVE"
          description="Total GBYTE amount committed to buying OSWAP tokens so far."
          value={reserveView}
          suffix={<small className="text-sm"> GBYTE</small>}
        />
        <InfoPanel.Item
          name="MARKET CAP"
          description="Future market cap of OSWAP tokens. It is estimated at the opening price, however the price can change due to other people investing."
          value={capView}
          suffix={<small className="text-sm"> GBYTE</small>}
        />
        <InfoPanel.Item
          name="OPENING PRICE"
          description="The price of 1 OSWAP token if the initial sale were to stop now. The price will increase if more people join, or decrease if some investors change their minds before the launch."
          value={currentPresalePriceView}
          suffix={<small className="text-sm"> GBYTE</small>}
        />
        <InfoPanel.Item
          name="AVERAGE BUYING PRICE"
          description="Average price of OSWAP tokens bought in the initial sale. All participants of the initial sale get this price. The price is less than the opening price after the initial sale ends."
          value={averageBuyingPriceView}
          suffix={<small className="text-sm"> GBYTE</small>}
        />
      </InfoPanel>
    </>
  );
});
