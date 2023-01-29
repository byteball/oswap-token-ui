import { QuestionTooltip } from "components/molecules";

export const EstimatedTranView = ({ result: { fee_percent, new_price, old_price, swap_fee, arb_profit_tax, total_fee } }) => {
  const feePercentView = Number(fee_percent).toFixed(2);
  const swapFeeView = Number(swap_fee / 1e9).toPrecision(4);
  const arbProfitTaxView = Number(arb_profit_tax / 1e9).toPrecision(4);
  const totalFeeView = Number(total_fee / 1e9).toPrecision(4);

  const newPriceView = Number(new_price).toPrecision(9);
  const priceDiffer = ((new_price - old_price) / old_price) * 100;
  const priceDifferView = Number(priceDiffer).toPrecision(4);

  let priceDifferColorClassName = "text-white";

  if (Math.abs(priceDiffer) > 15) {
    priceDifferColorClassName = "text-red-500";
  } else if (Math.abs(priceDiffer) > 5) {
    priceDifferColorClassName = "text-amber-300";
  }

  let feeDifferColorClassName = "text-white";

  if (Math.abs(fee_percent) > 15) {
    feeDifferColorClassName = "text-red-500";
  } else if (Math.abs(fee_percent) > 10) {
    feeDifferColorClassName = "text-amber-300";
  }

  const feeDescription = (
    <span>
      Swap fee: {swapFeeView} GBYTE <br />
      Arb profit tax: {arbProfitTaxView} GBYTE <br />
      Total fee: {totalFeeView} GBYTE <br />
    </span>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center mb-1 font-medium sm:mb-0">
        <div className="mr-1 text-primary-gray-light">
          New price
          <QuestionTooltip description="New price of OSWAP token after you buy/sell" />
        </div>
        <span className={`${priceDifferColorClassName} w-full sm:w-auto`}>
          {newPriceView} GBYTE{" "}
          {priceDiffer ? (
            <>
              ({priceDifferView > 0 ? "+" : ""}
              {priceDifferView}%)
            </>
          ) : null}
        </span>
      </div>
      <div className="flex flex-wrap font-medium">
        <div className="mr-1 text-primary-gray-light">
          Total fee
          <QuestionTooltip description={feeDescription} />
        </div>{" "}
        <span className={`${feeDifferColorClassName} w-full sm:w-auto`}>{feePercentView}%</span>
      </div>
    </div>
  );
};
