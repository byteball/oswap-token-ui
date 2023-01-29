import { ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const stylesByType = {
  error: "bg-red-800/30 text-white/50",
  warning: "bg-amber-400/20 text-white/50",
};

export const Warning = ({ children, type = "error", className, hideIcon = false }) => {
  return (
    <div className={`p-2 ${stylesByType[type]} rounded-md ${className}`}>
      <div className="flex items-center font-medium">
        {!hideIcon && (
          <div className="flex-shrink-0">
            {type === "error" && <XCircleIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
            {type === "warning" && <ExclamationCircleIcon className="w-5 h-5 mr-2" aria-hidden="true" />}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
