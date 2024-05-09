import { remove, round } from "lodash";

import { getChangedGroupKeysByUserPools } from "./utils/getChangedGroupKeysByUserPools";
import { getPercentByUserPools } from "./utils/getPercentByUserPools";
import { Decimal } from "utils";

export const reducer = (state, action) => {
    const { type, payload } = action;

    switch (type) {
        case 'CHANGE_PERCENT': {
            const userPools = [...state.userPools];
            const index = userPools.findIndex((pool) => pool.asset_key === payload.asset_key);

            userPools[index].newPercent = payload.value ? payload.value : null;

            return {
                ...state,
                userPools,
                userPoolsPercentSum: getPercentByUserPools(userPools),
                changedGroups: getChangedGroupKeysByUserPools(userPools)
            }
        };

        case 'ADD_EMPTY_POOL':
            return {
                ...state,
                poolIsAdding: true,
                userPools: [
                    ...state.userPools, {
                        vp: 0,
                        newPercent: "",
                        isNew: true,
                    }]
            };

        case 'SELECT_NEW_POOL': {
            const userPools = [...state.userPools];
            const { old_asset_key, asset_key } = payload;

            if (old_asset_key) { // just change
                const index = userPools.findIndex((pool) => pool.asset_key === old_asset_key);
                userPools[index] = { ...state.poolsByKey[asset_key], newPercent: userPools[index].newPercent || "", vp: 0, isNew: true }
            } else { // never been selected
                userPools[userPools.length - 1] = { ...state.poolsByKey[payload.asset_key], newPercent: userPools[userPools.length - 1].newPercent || "", vp: 0, isNew: true }
            }

            return {
                ...state,
                userPools,
                poolIsAdding: !old_asset_key ? false : state.poolIsAdding,
                changedGroups: getChangedGroupKeysByUserPools(userPools),
            }
        }

        case 'REMOVE_NEW_POOL': {
            const { asset_key } = payload;
            const index = state.userPools.findIndex((pool) => pool.asset_key === asset_key);
            const userPools = [...state.userPools];

            remove(userPools, (_, i) => index === i);

            return {
                ...state,
                userPools,
                poolIsAdding: !asset_key ? false : state.poolIsAdding,
                changedGroups: getChangedGroupKeysByUserPools(userPools),
                userPoolsPercentSum: getPercentByUserPools(userPools),
            }
        }

        case 'AUTO_FILL': {
            const { asset_key, current } = payload;
            const userPools = [...state.userPools];
            const index = userPools.findIndex((pool) => pool.asset_key === asset_key);

            if (index >= 0) {
                userPools[index].newPercent = !current
                    ? round(state.userPoolsPercentSum < 100 ? new Decimal(100).minus(state.userPoolsPercentSum).toNumber() : 0, 4)
                    : round(new Decimal(current).plus(new Decimal(100).minus(state.userPoolsPercentSum)).toNumber(), 4);

                return {
                    ...state,
                    userPools,
                    userPoolsPercentSum: getPercentByUserPools(userPools),
                    changedGroups: getChangedGroupKeysByUserPools(userPools)
                }
            } else {
                return state;
            }

        }

        default:
            return state;
    }
};

