import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

import cacheSlice from "./slices/cacheSlice";
import agentSlice from "./slices/agentSlice";
import settingsSlice from "./slices/settingsSlice";
import userWalletSlice from "./slices/userWalletSlice";
import presaleSlice from "./slices/presaleSlice";
import notificationsSlice from "./slices/notificationsSlice";

import config from "appConfig";

const rootReducer = combineReducers({
  settings: settingsSlice,
  agent: agentSlice,
  userWallet: userWalletSlice,
  cache: cacheSlice,
  presale: presaleSlice,
  notifications: notificationsSlice,
});

const persistConfig = {
  key: `oswap-token${config.ENVIRONMENT === "testnet" ? "-tn" : ""}`,
  version: 1,
  storage,
  whitelist: ["settings", "cache"],
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
