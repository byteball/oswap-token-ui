import { Children, Suspense, cloneElement, useState, memo, useEffect } from "react";
import { TinyLine, Line, G2 } from "@ant-design/plots";
import { isEqual, min, minBy } from "lodash";
import cn from "classnames";
import Tooltip from "rc-tooltip";
import { deepMix } from "@antv/util";
import moment from "moment";

import { Modal, QuestionTooltip } from "components/molecules";
import { Button, Spin } from "components/atoms";

const InfoPanel = ({ children, className = "", loading }) => {
  const [shown, setShown] = useState(children.length <= 4);
  const filteredChildren = children.filter((c) => !!c);

  const otherChildren = filteredChildren.slice(3, filteredChildren.length);

  return (
    <div className={`p-6 bg-primary-gray rounded-xl ${className}`}>
      <div className="grid grid-cols-1 col-span-2">
        {Children.toArray(filteredChildren.slice(0, 3)).map((item, i) => (
          <div key={item.props.name}>
            {cloneElement(item, {
              last: filteredChildren.length - 1 === i,
              loading,
            })}
          </div>
        ))}

        {!shown &&
          Children.toArray(filteredChildren.slice(3, 4)).map((item, i) => (
            <div key={item.props.name + "-prev"} className="flex flex-col">
              <div className="h-[40px] overflow-hidden">
                {cloneElement(item, {
                  last: true,
                  hide: true,
                  loading,
                })}
              </div>
              <Button type="text" className={`self-center mt-3 ${loading ? "opacity-30" : ""}`} onClick={() => setShown((v) => !v)}>
                {shown ? "hide" : "show"} more
              </Button>
            </div>
          ))}

        {shown && filteredChildren.length > 3
          ? Children.toArray(otherChildren).map((item, i) => (
            <div key={item.props.name}>
              {cloneElement(item, {
                last: otherChildren.length - 1 === i,
                loading,
              })}
            </div>
          ))
          : null}
      </div>
    </div>
  );
};

InfoPanel.Item = ({ last = false, name = "", description = "", value = "", prefix = "", suffix = "", hide = false, loading = false }) => (
  <div className={`flex ${loading ? "animate-pulse opacity-30" : ""} flex-col ${last ? "mb-0" : "mb-3"}`}>
    {loading ? (
      <div className="bg-primary-gray-light h-[18px] mb-[6px] w-[3em] rounded-xl"></div>
    ) : (
      <div className="flex items-center space-x-5 text-sm font-medium text-primary-gray-light">
        {name} <QuestionTooltip description={description} />{" "}
      </div>
    )}
    {loading ? (
      <div className={`bg-white h-[23px] w-[10em] mb-[5px] mt-[4px] rounded-xl ${hide ? "opacity-10" : ""}`}></div>
    ) : (
      <div className={`text-2xl text-white ${hide ? "opacity-10" : ""}`}>
        {prefix}
        {value}
        {suffix}
      </div>
    )}
  </div>
);

const ChartPlaceholder = () => <div className="bg-white h-[50px] mb-3 w-[100%] rounded-xl"></div>;

const theme = G2.getTheme("dark");

const Chart = memo(
  ({ lightData = [], name = "", description = "", loading = true, getFullData }) => {
    const [visible, setVisible] = useState(false);
    const [fullData, setFullData] = useState([]);
    const [inited, setInited] = useState(false);

    const minValue = min(lightData);

    const config = {
      height: 50,
      autoFit: true,
      data: lightData.map((v) => v - minValue),
      smooth: true,
      renderer: "canvas",
      color: "#295eff",
      animation: false,
      tooltip: {
        customContent: (_, data) => {
          if (data && data[0]) {
            const { value } = data[0];
            const viewValue = +Number(+value + minValue).toFixed(9);
            return `${viewValue} GBYTE`;
          }
        },
      },
    };

    useEffect(() => {
      if (!inited && visible) {
        setInited(true);
      }
    }, [inited, visible]);

    useEffect(() => {
      if (getFullData && lightData.length && inited) {
        getFullData().then((data) => {
          const sortedData = data.sort(
            (a, b) => moment(a.start_timestamp).valueOf() - moment(b.start_timestamp).valueOf()
          );

          const tickCount = 6;
          const tickInterval = Math.floor(data.length / tickCount);

          let previousYear = null;
          let lastLabelIndex = 0;

          const processedData = sortedData.map((item, index) => {
            const currentDate = moment(item.start_timestamp);
            const currentYear = currentDate.year();

            // Check if the year has changed compared to the previous date
            const yearChanged = currentDate.month() === 0 && currentYear !== previousYear;
            previousYear = currentYear;

            // Format the date label depending on the year change
            const formattedDateLabel = currentDate.format(yearChanged ? "MMM YYYY" : "MMM");

            // Determine whether to show the label on the X axis
            let showLabel = false;

            if (
              index === 0 || // Always show the first label
              index === sortedData.length - 1 || // Always show the last label
              yearChanged ||
              (index > lastLabelIndex + tickInterval && index < sortedData.length - tickCount) 
            ) {
              showLabel = true;
              lastLabelIndex = index;
            }

            return {
              ...item,
              label: formattedDateLabel,
              showLabel,
            };
          });

          setFullData(processedData);
        });
      }
    }, [getFullData, lightData, inited]);

    const minDailyPrice = minBy(fullData, (c) => c.close_price)?.close_price;

    return (
      <div className={cn({ "animate-pulse opacity-30": loading })}>
        {loading ? (
          <div className="bg-primary-gray-light h-[18px] mb-[10px] w-[3em] rounded-xl"></div>
        ) : (
          <div className="flex items-center space-x-5 text-sm font-medium text-primary-gray-light">
            {name} <QuestionTooltip description={description} />{" "}
          </div>
        )}

        {!loading ? (
          <Suspense fallback={ChartPlaceholder}>
            <Tooltip placement="bottom" trigger={["hover"]} overlayClassName="chart-tooltip" overlay={!!getFullData && <span>click to enlarge</span>}>
              <div className="mb-3" onClick={() => setVisible(true)}>
                <TinyLine {...config} state={{ active: { style: { cursor: "pointer" } } }} />
              </div>
            </Tooltip>

            {!!getFullData && (
              <Modal customControllers={[]} width={600} visible={visible} onClose={() => setVisible((v) => !v)}>
                <h2 className="mb-10 text-2xl font-bold text-center text-white">OSWAP token price</h2>
                <Suspense fallback={ChartPlaceholder}>
                  {fullData.length ? (
                    <Line
                      data={fullData}
                      yField="close_price"
                      xField="start_timestamp"
                      renderer="svg"
                      yAxis={{
                        min: minDailyPrice,
                        grid: { line: { style: { stroke: "#30363d" } } },
                        label: { formatter: (v) => `${+Number(v).toFixed(9)}` },
                      }}
                      animation={false}
                      color="#295eff"
                      xAxis={{
                        grid: { line: { style: { stroke: "#30363d" } } },
                        label: {
                          autoHide: false,
                          formatter: (_value, _obj, i) => fullData[i].showLabel ? fullData[i].label : '',
                        }
                      }}
                      theme={deepMix({}, theme, {
                        background: "#24292f",
                        defaultColor: "#fff",
                      })}
                      tooltip={{
                        formatter: ({ close_price, start_timestamp }) => {
                          return {
                            value: `${+Number(close_price).toFixed(9)} GBYTE`,
                            name: "OSWAP",
                            start_timestamp,
                          };
                        },
                      }}
                    />
                  ) : (
                    <div className="pb-10">
                      <Spin />
                    </div>
                  )}
                </Suspense>
              </Modal>
            )}
          </Suspense>
        ) : (
          <ChartPlaceholder />
        )}
      </div>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps.lightData, nextProps.lightData)
);

InfoPanel.Chart = Chart;

export default InfoPanel;
