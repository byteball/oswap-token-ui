import { round } from "lodash";

import { Decimal } from "utils";

export const getPercentByChanges = ({ totalUserVP, userVotes, changes }) =>
    Object.entries(userVotes).map(([asset_key, vp]) => ({
        asset_key,
        percent: round(Number(((new Decimal(changes[asset_key] || 0).plus(vp).toNumber()) / totalUserVP) * 100), 4)
    }))
