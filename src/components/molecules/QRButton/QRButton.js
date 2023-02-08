import { forwardRef, useState } from "react";
import Tooltip from "rc-tooltip";
import QRCode from "qrcode.react";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import cn from "classnames";

import { Button } from "components/atoms";
import { Modal } from "components/molecules";

export const QRButton = forwardRef(
  ({ children, icon, href, text, disabled, className = "", forwardedRef, block = false, type = "default", onClick, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div
        onClick={onClick}
        className={cn("inline-flex flex-nowrap rounded-md shadow-sm isolate items-center", className, {
          "shadow-none": type === "text-primary",
          "pointer-events-none": disabled,
        })}
      >
        <Tooltip
          placement="top"
          trigger={["hover"]}
          overlay={
            <span>
              Send the transaction from <br /> your mobile phone
            </span>
          }
        >
          <span>
            <Button
              disabled={disabled}
              onClick={() => setVisible((v) => !v)}
              className={cn("pr-0 rounded-r-none", { "h-[42px]": type !== "text-primary" })}
              type={type}
              {...rest}
            >
              <QrCodeIcon
                className={cn("h-5 w-5", { "-ml-0.5 mr-3": type !== "text-primary", "mt-[5px]": type === "text-primary" && !text })}
                aria-hidden="true"
              />
            </Button>
          </span>
        </Tooltip>

        <Tooltip
          placement="top"
          trigger={["hover"]}
          overlay={
            <span>
              This will open your Obyte wallet <br /> installed on this computer and <br /> send the transaction
            </span>
          }
        >
          <span>
            <Button
              ref={ref}
              type={type}
              href={href}
              disabled={disabled}
              {...rest}
              className={cn("inline-block", {
                "pl-2 rounded-l-none ": href,
                "leading-none": type !== "text-primary",
                "h-[42px]": !type.startsWith("text"),
                "pl-1": type.startsWith("text"),
              })}
            >
              <span className="overflow-hidden truncate text-ellipsis sm:max-w-full max-w-[140px]">{children}</span>
            </Button>
          </span>
        </Tooltip>

        {href && (
          <Modal
            width={400}
            visible={visible}
            onClose={() => setVisible((v) => !v)}
            customControllers={[]}
            title={
              <span>
                Scan this QR code <br /> with your mobile phone
              </span>
            }
          >
            <div className="flex justify-center">
              <a href={href}>
                <QRCode size={240} className="qr" bgColor="#24292e" fgColor="#fff" renderAs="svg" value={href} />
              </a>
            </div>
            <div className="mt-4 text-xs text-center">
              Install Obyte wallet for{" "}
              <a className="text-primary" target="_blank" rel="noreferrer" href="https://apps.apple.com/us/app/byteball/id1147137332?platform=iphone">
                iOS
              </a>{" "}
              or{" "}
              <a className="text-primary" target="_blank" rel="noreferrer" href="https://play.google.com/store/apps/details?id=org.byteball.wallet">
                Android
              </a>{" "}
              <br /> if you don't have one yet
            </div>
          </Modal>
        )}
      </div>
    );
  }
);
