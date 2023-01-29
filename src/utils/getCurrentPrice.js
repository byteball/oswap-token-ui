export const getCurrentPrice = ({ coef, s0, supply }) => {
  return coef * (s0 / (s0 - supply)) ** 2;
};
