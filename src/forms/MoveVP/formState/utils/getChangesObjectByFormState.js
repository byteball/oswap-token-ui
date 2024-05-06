import { round } from "lodash";

export const getChangesObjectByFormState = ({ userPools, totalUserVP }) => {
  const changes = {};
  let changesRoundingError = 0;
  let canModified = false;

  // generate changes object
  userPools.forEach(({ asset_key, percentView = 0, newPercent = 0, vp = 0, isNew = false }) => {
    if (Number(newPercent) !== Number(percentView)) { // if percent changed
      if (Number(newPercent || 0) === 0 && !isNew) { // remove all user votes from the pool
        changes[asset_key] = -vp;
      } else {
        let change = 0;

        if (!isNew) { // change user votes in the pool
          change = Number((newPercent / 100) * totalUserVP - vp);
        } else if (isNew) { // add user votes to this pool first time
          change = Number((newPercent / 100) * totalUserVP);
        }

        changes[asset_key] = round(change, 8);
        changesRoundingError += change - round(change, 8);
      }
    }
  });

  const roundingError = Object.values(changes).reduce((acc, current) => acc + Number(current), 0); // sum of changes ----> 0
  const roundingErrorPercent = (Math.abs(roundingError) / totalUserVP) * 100;

  const poolWhichWillBeModifiedForDecreaseRoundingError = Object.entries(changes).find(([_key, diff]) => roundingError > 0 ? Math.abs(roundingError) <= diff && diff < 0 : Math.abs(roundingError) <= diff && diff > 0)?.[0];

  if (poolWhichWillBeModifiedForDecreaseRoundingError && roundingErrorPercent <= 1e-4) {

    console.log("LOG: roundingError", poolWhichWillBeModifiedForDecreaseRoundingError, roundingError, `${roundingErrorPercent}%`, changes);
    canModified = true;
    if (roundingError > 0) {
      changes[poolWhichWillBeModifiedForDecreaseRoundingError] = changes[poolWhichWillBeModifiedForDecreaseRoundingError] - Math.abs(roundingError);
    } else {
      changes[poolWhichWillBeModifiedForDecreaseRoundingError] = changes[poolWhichWillBeModifiedForDecreaseRoundingError] + Math.abs(roundingError);
    }
  } else {
    console.log("LOG: can't modify", roundingErrorPercent);
  }

  return changes;
}