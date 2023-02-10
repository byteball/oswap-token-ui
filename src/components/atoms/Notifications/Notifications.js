import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, XCircleIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";

import { dismissNotification, selectNotifications } from "store/slices/notificationsSlice";

export const Notifications = () => {
  const notifications = useSelector(selectNotifications);

  return (
    <div className="fixed top-0 right-0 max-w-[100%] w-[350px]">
      {/* Global notification live region, render this permanently at the end of the document */}
      {notifications.length > 0 && notifications.map((obj) => <Notification key={obj.id} {...obj} />)}
    </div>
  );
};

const Notification = ({ id, title = "", description, type = "success" }) => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  return (
    <div aria-live="assertive" className="relative w-[100%] inset-0 flex items-end px-4 py-3 pointer-events-none sm:items-start sm:p-3">
      {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
      <Transition
        show={!!notifications.find((n) => n.id === id)}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="w-full max-w-sm overflow-hidden rounded-lg shadow-xl pointer-events-auto bg-primary-gray ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {type === "success" && <CheckCircleIcon className="w-6 h-6 text-green-400" aria-hidden="true" />}
                {type === "error" && <XCircleIcon className="w-6 h-6 text-red-400" aria-hidden="true" />}
                {type === "info" && <InformationCircleIcon className="w-6 h-6 text-primary" aria-hidden="true" />}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-white">{title}</p>
                {description && <p className="mt-1 text-sm text-primary-gray-light">{description}</p>}
              </div>
              <div className="flex flex-shrink-0 ml-4">
                <button
                  type="button"
                  className="inline-flex text-gray-400 rounded-md hover:text-primary-gray-light focus:outline-none focus:ring-2 "
                  onClick={() => {
                    dispatch(dismissNotification(id));
                  }}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};
