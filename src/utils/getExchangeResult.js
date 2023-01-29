import appConfig from "appConfig";
import moment from "moment";

import { getCurrentPrice } from "./getCurrentPrice";

const initial_s0 = 1e13;

const reserve_asset = appConfig.RESERVE_ASSET;

const network_fee = reserve_asset === "base" ? 1000 : 0;

const initialState = { coef: 1, s0: initial_s0, supply: 0, reserve: 0 };

export const get_presale_prices = (total = 0) => {
  const tokens = total ? 1 / (1 / initialState.s0 + initialState.coef / total) : 0; // or s
  const final_price = total ? initialState.coef * (initialState.s0 / (initialState.s0 - tokens)) ** 2 : 1;

  const avg_price = tokens ? total / tokens : 0;

  return { final_price, avg_price, cap: final_price * tokens, tokens };
};

const get_reserve_by_state = ({ coef = 1, s0 = initial_s0, supply = 0 }) => (coef * supply * s0) / (s0 - supply);
const get_tokens_by_state = ({ s0 = initial_s0, coef = 1, reserve = 0 }) => (reserve ? 1 / (1 / s0 + coef / reserve) : 0);

const get_appreciation_result = (state, appreciation_rate) => {
  const timestamp = moment.utc().unix();
  const elapsed_time = timestamp - state.last_ts;

  const r = state.reserve;
  const s = state.supply;
  const s0 = state.s0;

  if (s === 0 || elapsed_time === 0) {
    return { new_s0: s0, coef_multiplier: 1 };
  }

  const p = state.coef * (s0 / (s0 - s)) ** 2;

  const new_p = p * (1 + (elapsed_time / appConfig.YEAR) * appreciation_rate);
  const new_s0 = s + 1 / (new_p / r - 1 / s);

  const coef_multiplier = ((s0 / new_s0) * (new_s0 - s)) / (s0 - s); //   < 1

  return {
    new_s0,
    coef_multiplier,
  };
};

export const getAppreciationState = (state, appreciation_rate) => {
  const appr_res = get_appreciation_result(state, appreciation_rate);

  return {
    ...state,
    s0: appr_res.new_s0,
    coef: state.coef * appr_res.coef_multiplier,
    last_ts: moment.utc().unix(),
  };
};

export const getExchangeResult = (tokens_amount, reserve_amount_with_fee, old_state, props) => {
  const state = getAppreciationState(old_state, props.appreciation_rate);
  const reserve_amount = reserve_amount_with_fee - network_fee;

  if ((!tokens_amount && !reserve_amount_with_fee) || (reserve_amount_with_fee < 100000 && !tokens_amount)) {
    const p = getCurrentPrice(state);

    return {
      payout: 0,
      delta_s: 0,
      old_reserve: state.reserve,
      new_reserve: state.reserve,
      delta_reserve: 0,
      old_price: p,
      new_price: p,
      swap_fee: 0,
      arb_profit_tax: 0,
      total_fee: 0,
      fee_percent: 0,
      coef_multiplier: 0,
    };
  }

  const r = state.reserve;
  const s = state.supply;
  const p = state.coef * (state.s0 / (state.s0 - s)) ** 2;

  let new_s,
    net_new_r,
    swap_fee = 0,
    arb_profit_tax = 0,
    gross_new_r = 0,
    delta_s = 0;

  if (tokens_amount) {
    // selling tokens
    new_s = s - tokens_amount;
    net_new_r = get_reserve_by_state({ ...state, supply: new_s });
    swap_fee = props.swap_fee_rate * (r - net_new_r);
  } else {
    // buy
    gross_new_r = r + reserve_amount;
    swap_fee = r ? props.swap_fee_rate * reserve_amount : 0;
    const new_r1 = r + reserve_amount - swap_fee;

    const new_s1 = get_tokens_by_state({ ...state, reserve: new_r1 });
    const new_p1 = getCurrentPrice({ ...state, supply: new_s1 });

    arb_profit_tax = r ? (props.arb_profit_tax_rate * (new_p1 - p) * (new_s1 - s)) / 2 : 0;
    net_new_r = new_r1 - arb_profit_tax;

    new_s = Math.floor(get_tokens_by_state({ ...state, reserve: net_new_r }));
    delta_s = new_s - s;
  }

  const new_p = getCurrentPrice({ ...state, supply: new_s });

  if (tokens_amount) {
    arb_profit_tax = props.arb_profit_tax_rate * Math.abs(((new_p - p) * (new_s - s)) / 2);
  }

  const total_fee = swap_fee + arb_profit_tax;

  let payout, fee_percent;
  if (tokens_amount) {
    gross_new_r = Math.ceil(net_new_r + total_fee);
    payout = r - gross_new_r;
    fee_percent = (total_fee / (r - net_new_r)) * 100;
  } else {
    fee_percent = (total_fee / reserve_amount) * 100;
  }

  const coef_multiplier = gross_new_r / net_new_r;

  const blocked = coef_multiplier < 1 || (tokens_amount ? payout < 0 : reserve_amount ? total_fee >= gross_new_r - r : false);

  return {
    payout,
    delta_s: tokens_amount ? -tokens_amount : delta_s,
    old_reserve: r,
    new_reserve: gross_new_r,
    delta_reserve: gross_new_r - r,
    old_price: p,
    new_price: blocked ? p : new_p,
    swap_fee: swap_fee,
    arb_profit_tax: arb_profit_tax,
    total_fee: total_fee,
    fee_percent: fee_percent,
    coef_multiplier,
    new_s,
    blocked,
  };
};
