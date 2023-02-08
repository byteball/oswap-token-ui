import moment from "moment";

import appConfig from "appConfig";

export const getActualVpByNormalized = (normalized_vp) => {
  return normalized_vp / 4 ** ((moment.utc().unix() - appConfig.COMMON_TS) / appConfig.YEAR);
};
