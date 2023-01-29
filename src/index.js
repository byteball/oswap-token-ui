import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import ReactGA from "react-ga";

// eslint-disable-next-line no-unused-vars
import client from "services/obyte";
import appConfig from "appConfig";

import AppRouter from "./AppRouter";

import getStore from "./store";

import "./index.css";

export const { store, persistor } = getStore();

const root = ReactDOM.createRoot(document.getElementById("root"));

if (appConfig.GA_ID) {
  ReactGA.initialize(appConfig.GA_ID);
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <PersistGate loading={null} persistor={persistor}>
          <AppRouter />
        </PersistGate>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
