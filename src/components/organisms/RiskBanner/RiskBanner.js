import { XMarkIcon } from "@heroicons/react/24/outline";

export const RiskBanner = () => {
  return (
    <div className="relative bg-primary">
      <div className="px-3 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="pr-16 sm:px-16 sm:text-center">
          <p className="font-medium text-white">
            <span>This project is in beta! Use at your own risk.</span>
          </p>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-start pt-1 pr-1 sm:items-start sm:pt-1 sm:pr-2">
          <button type="button" className="flex p-2 rounded-md focus:outline-none focus:ring-2">
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="w-6 h-6 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
