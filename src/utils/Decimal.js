import Decimal from "decimal.js";

Decimal.set({
    precision: 15, // double precision is 15.95 https://en.wikipedia.org/wiki/IEEE_754
    rounding: Decimal.ROUND_HALF_EVEN,
    maxE: 308, // double overflows between 1.7e308 and 1.8e308
    minE: -324, // double underflows between 2e-324 and 3e-324
    toExpNeg: -7, // default, same as for js number
    toExpPos: 21, // default, same as for js number
});


export default Decimal;
