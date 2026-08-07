import { migrateSettingsToVersion2 } from "./migrations";
import { settingsInitialState } from "./slices/settingsSlice";

test("version 2 migration preserves only the wallet address", () => {
  const migratedState = migrateSettingsToVersion2({
    settings: {
      walletAddress: "WALLET_ADDRESS",
      presaleAAAddress: "PRESALE_ADDRESS",
      slippageTolerance: 10,
    },
    cache: {
      symbols: { asset: "OSWAP" },
    },
    _persist: {
      version: 1,
      rehydrated: true,
    },
  });

  expect(migratedState).toEqual({
    settings: {
      ...settingsInitialState,
      walletAddress: "WALLET_ADDRESS",
    },
    _persist: {
      version: 1,
      rehydrated: true,
    },
  });
  expect(migratedState).not.toHaveProperty("cache");
});
