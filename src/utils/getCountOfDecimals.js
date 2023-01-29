export const getCountOfDecimals = (x) => {
  return ~(x + "").indexOf(".") ? (x + "").split(".")[1].length : 0;
};
