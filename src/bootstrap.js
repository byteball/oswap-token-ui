import { isEmpty } from "lodash";

import { saveBaseTVL, saveOracleAddress, saveSettings, saveSymbolInfo, updateAgentStateVars, updateCurrentTVL } from "store/slices/agentSlice";
import { store } from "index";

import client from "services/obyte";

import { loadUserBalance } from "store/thunks/loadUserBalance";
import { loadPoolList } from "store/thunks/loadPoolList";
import { updatePresaleStateVars } from "store/slices/presaleSlice";
import { saveExchangeRates, savePresaleParams } from "store/slices/settingsSlice";

import appConfig from "appConfig";

export const bootstrap = async () => {
  console.log("connect");

  const state = store.getState();

  const heartbeat = setInterval(() => {
    client.api.heartbeat();
  }, 10 * 1000);

  await client.justsaying("light/new_aa_to_watch", {
    aa: appConfig.AA_ADDRESS,
  });

  if (state.settings.walletAddress) {
    store.dispatch(loadUserBalance(state.settings.walletAddress));
    await client.justsaying("light/new_address_to_watch", state.settings.walletAddress);
  }

  store.dispatch(loadPoolList());

  const tokenRegistry = await client.api.getOfficialTokenRegistryAddress();

  const [stateVars, { result: oracle }, { result: baseTVL }, { result: currentTVL }] = await Promise.all([
    client.api.getAaStateVars({ address: appConfig.AA_ADDRESS }),
    client.api.executeGetter({ address: appConfig.AA_ADDRESS, getter: "get_oracle" }),
    client.api.executeGetter({ address: appConfig.AA_ADDRESS, getter: "get_base_tvl" }),
    client.api.executeGetter({ address: appConfig.AA_ADDRESS, getter: "get_tvl" }),
  ]);

  const [symbol, decimals] = await Promise.all([
    client.api.getSymbolByAsset(tokenRegistry, stateVars.constants.asset).catch(() => {}),
    client.api.getDecimalsBySymbolOrAsset(tokenRegistry, stateVars.constants.asset).catch(() => 0),
  ]);

  const settings = {
    swap_fee_rate: stateVars.swap_fee || 0.003,
    arb_profit_tax_rate: stateVars.arb_profit_tax || 0.9,
    base_rate: stateVars.base_rate || 0.3,
    inflation_rate: stateVars.inflation_rate || 0.3,
    stakers_share: stateVars.stakers_share || 0.5,
    challenging_period: stateVars.challenging_period || 432000, // 5 days
  };

  store.dispatch(saveSettings(settings));
  store.dispatch(updateAgentStateVars(stateVars));
  store.dispatch(saveOracleAddress(oracle));
  store.dispatch(saveBaseTVL(baseTVL));
  store.dispatch(updateCurrentTVL(currentTVL));
  store.dispatch(saveSymbolInfo({ symbol, decimals, asset: stateVars.constants.asset }));

  let presaleAAAddress = state.settings.presaleAAAddress;
  let presaleParams = state.settings.presaleParams;

  if (!presaleAAAddress) {
    presaleAAAddress = stateVars?.constants?.initial_sale_pool_address;

    if (presaleAAAddress) {
      const presaleAADefinition = await client.api.getDefinition(presaleAAAddress);
      presaleParams = presaleAADefinition[1]?.params;

      store.dispatch(savePresaleParams([presaleAAAddress, presaleParams]));
    } else {
      console.error("Please define an asset");
    }
  }

  if (presaleAAAddress) {
    await client.justsaying("light/new_aa_to_watch", {
      aa: presaleAAAddress,
    });
  }

  const [presaleStateVars] = await Promise.all([client.api.getAaStateVars({ address: presaleAAAddress })]);

  if (presaleAAAddress && presaleStateVars.launch_date !== undefined && presaleStateVars.launch_date !== state.settings.presaleParams.launch_date) {
    presaleParams = {
      ...presaleParams,
      launch_date: presaleStateVars.launch_date,
    };

    store.dispatch(savePresaleParams([presaleAAAddress, presaleParams]));
  }

  store.dispatch(updatePresaleStateVars(presaleStateVars));

  client.subscribe((err, result) => {
    if (err) return null;

    const { body, subject } = result[1];

    if (subject === "joint" && state.settings.walletAddress) {
      store.dispatch(loadUserBalance(state.settings.walletAddress));
    } else if (body && body.aa_address === appConfig.AA_ADDRESS) {
      handleEvent(result);
    } else if (body && body.aa_address === (state.settings.presaleAAAddress || presaleAAAddress)) {
      handlePresaleEvent(result);
    } else {
      console.log("other", err, result);
    }
  });

  const handleEvent = (result) => {
    const { subject, body } = result[1];
    const { aa_address, updatedStateVars } = body;

    if (subject === "light/aa_request") {
    } else if (subject === "light/aa_response") {
      let diff = {};

      if (updatedStateVars) {
        for (let var_name in updatedStateVars[aa_address]) {
          diff[var_name] = updatedStateVars[aa_address][var_name].value;
        }
      }

      if (!isEmpty(diff)) {
        store.dispatch(updateAgentStateVars(diff));
      }
    }
  };

  const handlePresaleEvent = (result) => {
    const { subject, body } = result[1];
    const { aa_address, updatedStateVars } = body;

    if (subject === "light/aa_request") {
    } else if (subject === "light/aa_response") {
      let diff = {};

      if (updatedStateVars) {
        for (let var_name in updatedStateVars[aa_address]) {
          diff[var_name] = updatedStateVars[aa_address][var_name].value;
        }
      }

      if (!isEmpty(diff)) {
        store.dispatch(updatePresaleStateVars(diff));
      }
    }
  };

  client.client.request("hub/get_exchange_rates", null, (err, rates) => {
    if (err) return console.error("hub/get_exchange_rates error");

    store.dispatch(saveExchangeRates(rates));
  });

  const updateRate = setInterval(async () => {
    client.client.request("hub/get_exchange_rates", null, (err, rates) => {
      if (err) return console.error("hub/get_exchange_rates error");

      store.dispatch(saveExchangeRates(rates));

      console.log("rates updated at", new Date());
    });

    const { result: currentTVL } = await client.api.executeGetter({ address: appConfig.AA_ADDRESS, getter: "get_tvl" });
    store.dispatch(updateCurrentTVL(currentTVL));
  }, 10 * 60 * 1000);

  client.client.ws.addEventListener("close", () => {
    clearInterval(heartbeat);
    clearInterval(updateRate);
  });
};
