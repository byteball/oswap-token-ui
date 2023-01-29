import Slider from "rc-slider";
import cn from "classnames";

export const NumSlider = ({ className, minLabelValue, ...props }) => {
  const marks =
    minLabelValue !== undefined && minLabelValue !== props.min
      ? {
          [minLabelValue]: {
            label: <Mark />,
          },
        }
      : {};

  return (
    <div className={cn(className, "pb-5")}>
      <Slider allowCross={false} marks={marks} {...props} />
    </div>
  );
};

const Mark = () => (
  <div className="relative flex justify-center cursor-default">
    <div className="w-[2px] h-[28px] mt-[-28px] ml-[15px] opacity-70 bg-primary-gray-light" />
    <span className="bg-primary-gray-light mt-[-3px] text-white ml-[-15px] rounded-lg px-[5px] py-[2px]">min</span>
  </div>
);
