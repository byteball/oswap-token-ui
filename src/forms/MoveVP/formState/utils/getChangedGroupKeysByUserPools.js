export const getChangedGroupKeysByUserPools = (userPools) => {
    const changedGroups = [];

    userPools.forEach(({ newPercent, percentView, group_key, isNew }) => {
        if (Number(newPercent) !== Number(percentView)) {
          if (!changedGroups.includes(group_key) && !(Number(newPercent) === 0 && isNew)) {
            changedGroups.push(group_key);
          }
        }
      });
  
    return changedGroups;
}
