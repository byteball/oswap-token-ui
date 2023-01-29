import { Children, cloneElement, useState } from "react";

import { QuestionTooltip } from "components/molecules";
import { Button } from "components/atoms";

const InfoPanel = ({ children, className = "", loading }) => {
  const [shown, setShown] = useState(false);
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

InfoPanel.Item = ({ last = false, name = "", description = "", value, prefix = "", suffix = "", hide = false, loading = false }) => (
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

export default InfoPanel;
