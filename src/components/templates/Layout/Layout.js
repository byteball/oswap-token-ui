import { useLocation } from "react-router-dom";
import ReactGA from "react-ga";
import { useEffect } from "react";

import { Footer } from "components/organisms";
import { Header } from "components/organisms";

import { historyInstance } from "historyInstance";
import appConfig from "appConfig";

export const Layout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    let unlisten;

    if (appConfig.GA_ID) {
      unlisten = historyInstance.listen(({ location, action }) => {
        if (action === "PUSH" || action === "POP") {
          ReactGA.pageview(location.pathname);
        }
      });

      ReactGA.pageview(location.pathname);
    }

    return () => {
      unlisten && unlisten();
    };
  }, []);

  return (
    <div className="antialiased">
      <div className="container mx-auto" style={{ minHeight: "calc(100vh - 88px)" }}>
        <Header />
        {children}
      </div>

      <Footer />
    </div>
  );
};