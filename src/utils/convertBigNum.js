export const convertBigNum = (num, precision = 4) => {
  let value;
  let letter = "";

  if (num >= 1e9) {
    letter = "b";
    value = +Number(num / 1e9).toPrecision(precision);
  } else if (num >= 1e6) {
    letter = "m";
    value = +Number(num / 1e6).toPrecision(precision);
  } else if (num >= 1e3) {
    letter = "k";
    value = +Number(num / 1e3).toPrecision(precision);
  } else {
    value = +Number(num).toPrecision(precision);
  }

  return `${value}${letter}`;
};
