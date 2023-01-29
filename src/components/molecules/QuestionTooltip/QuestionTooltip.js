import Tooltip from "rc-tooltip";
import { QuestionMarkIcon } from "components/icons";

export const QuestionTooltip = ({ description, className = "" }) => {
  if (!description) return null;

  return (
    <Tooltip placement="top" trigger={["hover"]} overlayClassName="max-w-[250px]" overlay={description}>
      <QuestionMarkIcon className={`inline ml-1 opacity-60 ${className}`} />
    </Tooltip>
  );
};
