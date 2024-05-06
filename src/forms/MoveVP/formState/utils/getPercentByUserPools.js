import Big from "big.js";

export const getPercentByUserPools = (userPools = []) => {
    return userPools.reduce((acc, current) => {
        if (Number(current.newPercent) === Number(current.percentView) && !current.isNew) {
            return acc.plus(current.percent); // if percent not changed
        } else {
            return acc.plus(current.newPercent || 0);
        }
    }, Big(0)).toNumber();
}