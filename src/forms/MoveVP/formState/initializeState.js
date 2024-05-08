import { keyBy, round } from "lodash";

import { getPercentByUserPools } from "./utils/getPercentByUserPools";
import { getChangedGroupKeysByUserPools } from "./utils/getChangedGroupKeysByUserPools";

export const initializeState = ([pools, userVotes]) => {
    const poolsByKey = keyBy(pools, (p) => p.asset_key);
    const totalUserVP = Object.values(userVotes).reduce((acc, current) => acc + Number(current), 0);

    const userPools = Object.entries(userVotes).map(([asset_key, vp]) => ({
        asset_key,
        vp,
        ...poolsByKey[asset_key],
        percent: (vp / totalUserVP) * 100,
        newPercent: round(Number((vp / totalUserVP) * 100), 4),
        percentView: round(Number((vp / totalUserVP) * 100), 4),
    }));

    return {
        poolsByKey, // { asset_key: pool }
        totalUserVP,
        userVotes, // { asset_key: vp }
        userPools, // [{ asset_key, vp, pool, percent, newPercent, percentView }]
        userPoolsPercentSum: getPercentByUserPools(userPools),
        changedGroups: getChangedGroupKeysByUserPools(userPools), // [group_key]
        poolIsAdding: false
    };
}