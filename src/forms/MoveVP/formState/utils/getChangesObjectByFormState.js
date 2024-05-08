import { Decimal } from "utils";

export const getChangesObjectByFormState = ({ userPools, totalUserVP }) => { // formState object
  const changes = {}; // object winch will be sended to AA

  // generate changes object
  userPools.forEach(({ asset_key, percentView = 0, newPercent: sNewPercent = 0, vp = 0, isNew = false }) => {
    const newPercent = sNewPercent ? Number(sNewPercent) : 0;

    if (newPercent !== percentView) { // if percent changed
      if (!newPercent && !isNew) { // remove all user votes from the pool
        changes[asset_key] = -vp;
      } else {
        let change = 0;

        if (!isNew) { // change user votes in the pool
          change = new Decimal(newPercent).dividedBy(100).mul(totalUserVP).minus(vp).toNumber();
        } else if (isNew) { // add user votes to this pool first time
          change = new Decimal(newPercent).dividedBy(100).mul(totalUserVP).toNumber();
        }
        
        changes[asset_key] = change;
      }
    }
  });


  let roundingError = (Object.values(changes).reduce((acc, current) => acc.plus(current), new Decimal(0)))  // sum of changes ----> 0

  const roundingErrorPercent = roundingError.abs().div(totalUserVP).mul(100).toNumber();
  roundingError = roundingError.toNumber();

  if (roundingErrorPercent < 0.00005) { // if rounding error less than 0.00005% we just modif one pool
    console.log("NEW: SMALL ROUNDING ERROR", roundingErrorPercent, roundingError)
    const poolWhichWillBeModifiedForDecreaseRoundingError = Object.entries(changes).find(([_key, diff]) => {
      if (roundingError > 0) {
        return Math.abs(roundingError) <= Math.abs(diff) && diff > 0
      } else {
        return Math.abs(roundingError) <= Math.abs(diff) && diff < 0
      }
    })?.[0];

    if (poolWhichWillBeModifiedForDecreaseRoundingError) {
      changes[poolWhichWillBeModifiedForDecreaseRoundingError] = changes[poolWhichWillBeModifiedForDecreaseRoundingError] - roundingError;
    } else {
      console.error('NEW: can\'t found ')
    }

  } else if (Math.abs(roundingErrorPercent) < 1e-4) {
    console.log('NEW: BIG ROUNDING ERROR', roundingErrorPercent, roundingError)
    const changesCount = Object.keys(changes).length;
    const roundingErrorFraction = new Decimal(roundingError).div(changesCount);
    let maxChangeAssetKey = null;

    for (const asset_key in changes) {
      changes[asset_key] = new Decimal(changes[asset_key]).minus(roundingErrorFraction).toNumber()

      if (maxChangeAssetKey === null || Math.abs(changes[asset_key]) > Math.abs(changes[maxChangeAssetKey])) {
        maxChangeAssetKey = asset_key;
      }
    }

    const finalRoundingError = (Object.values(changes).reduce((acc, current) => acc.add(current), new Decimal(0))).toNumber()
    console.log('NEW: finalRoundingError', finalRoundingError);
    changes[maxChangeAssetKey] = new Decimal(changes[maxChangeAssetKey]).minus(finalRoundingError).toNumber();
  }

  return changes;
}