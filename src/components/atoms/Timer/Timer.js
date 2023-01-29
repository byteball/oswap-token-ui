import Countdown from "react-countdown";

const timerRendererDefault = ({ hours, minutes, seconds, days }) => (
  <div className="flex justify-center gap-10 text-primary-gray-light">
    <div>
      <div className="text-6xl text-white">{days}</div>days
    </div>
    <div>
      <div className="text-6xl text-white">{hours}</div>hours
    </div>
    <div>
      <div className="text-6xl text-white">{minutes}</div>minutes
    </div>
    {/* <div>
      <div className="text-6xl text-white">{seconds}</div>seconds
    </div> */}
  </div>
);

export const Timer = ({ onComplete = () => {}, date, renderer }) => (
  <Countdown onComplete={onComplete} date={date} renderer={renderer || timerRendererDefault} />
);
