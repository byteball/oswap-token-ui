import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createMigrate, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

import cacheSlice from "./slices/cacheSlice";
import agentSlice from "./slices/agentSlice";
import settingsSlice from "./slices/settingsSlice";
import userWalletSlice from "./slices/userWalletSlice";
import presaleSlice from "./slices/presaleSlice";
import notificationsSlice from "./slices/notificationsSlice";
import chartSlice from "./slices/chartSlice";
import { migrateSettingsToVersion2 } from "./migrations";

import config from "appConfig";

const rootReducer = combineReducers({
  settings: settingsSlice,
  agent: agentSlice,
  userWallet: userWalletSlice,
  cache: cacheSlice,
  presale: presaleSlice,
  notifications: notificationsSlice,
  chart: chartSlice,
});

const migrations = {
  2: migrateSettingsToVersion2,
};

const persistConfig = {
  key: `oswap-token${config.ENVIRONMENT === "testnet" ? "-tn" : ""}`,
  version: 2,
  storage,
  whitelist: ["settings", "cache"],
  migrate: createMigrate(migrations),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const getStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  });

  const persistor = persistStore(store);

  return { store, persistor };
};

export default getStore;

export const getPersist = (state) => state._persist;
