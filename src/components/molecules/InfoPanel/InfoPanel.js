import { Children, Suspense, cloneElement, useState, memo, useEffect } from "react";
import { TinyLine, Line, G2 } from "@ant-design/plots";
import { isEqual, min } from "lodash";
import cn from "classnames";
import Tooltip from "rc-tooltip";
import { deepMix } from "@antv/util";

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
          setFullData(data);
        });
      }
    }, [getFullData, lightData, inited]);

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
            <Tooltip placement="bottom" trigger={["hover"]} overlay={!!getFullData && <span>click to enlarge</span>}>
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
                        min: 1,
                        grid: { line: { style: { stroke: "#30363d" } } },
                      }}
                      animation={false}
                      color="#295eff"
                      xAxis={{ grid: { line: { style: { stroke: "#30363d" } } } }}
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
