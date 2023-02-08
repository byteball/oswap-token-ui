import { forwardRef } from "react";

const stylesByType = {
  primary: "text-white bg-primary hover:bg-primary/75",
  default: "text-white bg-primary-gray hover:bg-primary-gray-light",
  danger: "text-white bg-red-700 hover:bg-red-900",
  text: "text-white p-0 m-0 leading-none",
  "text-primary": "text-primary hover:text-primary/75 p-0 m-0",
  light: "text-gray-700 bg-white hover:bg-gray-300",
  metamask: "text-white bg-metamask hover:bg-metamask/75",
  disabled: "cursor-not-allowed bg-primary-gray-light/20 text-white/20 pointer-events-none",
  "text-disabled": "cursor-not-allowed text-white/20 bg-transparent pointer-events-none leading-none",
};

export const Button = forwardRef(
  ({ children, type = "default", icon = null, disabled = false, className = "", target, block, href, forwardedRef, ...rest }, ref) => {
    const commonStyles = `select-none	
    cursor-pointer
    hover:transition-all
    hover:duration-500
    inline-flex
    items-center
    ${type.startsWith("text") ? "px-0" : "px-4"}
    ${type.startsWith("text") ? "py-0" : "py-2"}
    text-base
    border
    border-transparent
    font-medium
    rounded-md
    focus:outline-none
    ${stylesByType[disabled ? (type.startsWith("text") ? "text-disabled" : "disabled") : type]} ${className} ${block ? "w-full justify-center" : ""}
  `;

    if (href !== undefined)
      return (
        <a ref={ref} className={commonStyles} onClick={rest.onClick} href={href} target={target}>
          {icon} {children}
        </a>
      );

    return (
      <button ref={ref} {...rest} disabled={disabled} type="button" className={commonStyles}>
        {icon} {children}
      </button>
    );
  }
);
