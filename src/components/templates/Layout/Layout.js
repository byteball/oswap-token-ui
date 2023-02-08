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

    unlisten = historyInstance.listen(({ location, action }) => {
      if (action === "PUSH" || action === "POP") {
        const split = location.pathname.split("/");

        if (split.includes("farming") && !(split.includes("all") || split.includes("my"))) {
          historyInstance.replace("/farming/all");
        } else if (split[1] === "governance") {
          if (split[2] === "shares" && !split[3]) {
            historyInstance.replace("/governance/shares/stake");
          } else if (!split[2]) {
            historyInstance.replace("/governance/dashboard");
          }
        }

        if (appConfig.GA_ID) {
          ReactGA.pageview(location.pathname);
        }
      }
    });

    if (appConfig.GA_ID) {
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
