import { Fragment, cloneElement } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "components/atoms";

export const Modal = ({
  children,
  title,
  width,
  height,
  textOk = "Save",
  secondModal = false,
  textCancel = "Cancel",
  customControllers,
  onClose: customOnClose,
  onOk = () => {},
  visible,
}) => {
  const onClose = async () => {
    customOnClose();
  };

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog as="div" className={`relative ${secondModal ? 'z-50' : 'z-10'}`} initialFocus={null} onClose={onClose}>
        <Transition.Child
          as={"div"}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative px-4 pt-5 pb-4 text-left transition-all transform shadow-xl rounded-xl bg-primary-gray sm:my-8 sm:w-full sm:p-6`}
                style={{ width, height }}
              >
                <div>
                  <div className="text-left">
                    <Dialog.Title as="h3" className="text-2xl font-medium text-center text-white uppercase">
                      {title}
                    </Dialog.Title>
                    <div className="mt-5 text-white">{children}</div>
                  </div>
                </div>

                {!customControllers ? (
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <Button block type="primary" onClick={onOk}>
                      {textOk}
                    </Button>
                    {textCancel && (
                      <Button block type="light" onClick={onClose}>
                        Cancel
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {customControllers[0] &&
                      cloneElement(customControllers[0], {
                        onClick: () => {
                          if (!customControllers[0].props.disabled) {
                            customControllers[0].props.onClick();
                            onClose();
                          }
                        },
                      })}
                    {customControllers[1] &&
                      cloneElement(customControllers[1], {
                        onClick: () => {
                          if (!customControllers[1].props.disabled) {
                            customControllers[1].props.onClick();
                            onClose();
                          }
                        },
                      })}
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
