import Tooltip from "rc-tooltip";

import { Button } from "components/atoms";
import { MetaMaskIcon } from "components/icons";

export const MetaMaskButton = ({ children, icon, href, disabled, ...rest }) => (
  <Tooltip
    placement="top"
    trigger={["hover"]}
    overlay={
      <span>
        Send the transaction from <br /> your metamsk
      </span>
    }
  >
    <Button disabled={disabled} {...rest} type="metamask">
      <span className="w-5 h-5 mr-2">
        <MetaMaskIcon className={disabled ? "grayscale opacity-20" : ""} />{" "}
      </span>{" "}
      {children}
    </Button>
  </Tooltip>
);
