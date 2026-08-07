import { settingsInitialState } from "./slices/settingsSlice";

export const migrateSettingsToVersion2 = (state) => ({
  settings: {
    ...settingsInitialState,
    walletAddress: state?.settings?.walletAddress,
  },
  _persist: state?._persist,
});
