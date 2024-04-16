// import { TradeType, CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
import { ethers } from "ethers";
import { AlphaRouter, SwapType } from "@uniswap/smart-order-router";
import { Percent, TradeType, CurrencyAmount, Token } from "@uniswap/sdk-core";

// import JSBI from "jsbi";

// export function fromReadableAmount(amount, decimals) {
//   const extraDigits = Math.pow(10, countDecimals(amount));
//   const adjustedAmount = amount * extraDigits;
//   return JSBI.divide(
//     JSBI.multiply(
//       JSBI.BigInt(adjustedAmount),
//       JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
//     ),
//     JSBI.BigInt(extraDigits)
//   );
// }

// export function toReadableAmount(rawAmount, decimals) {
//   return JSBI.divide(
//     JSBI.BigInt(rawAmount),
//     JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
//   ).toString();
// }

function countDecimals(x) {
  if (Math.floor(x) === x) {
    return 0;
  }
  return x.toString().split(".")[1].length || 0;
}
const TM = new Token(
  11155111,
  "0x92Fbd0E76Fa70a13a1D7Eb6B053A6D3fFc20D94e",
  18
);
const TL = new Token(
  11155111,
  "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  18
);
export const createRoute = async () => {
  const tokens = {
    in: TL,
    amountIn: 0.3,
    out: TM,
  };
  console.log("====== creating route =======");

  const url = "https://sepolia.infura.io/v3/5aaa12b0e25846ffac779abc4b3eb2a5";
  provider = new ethers.providers.JsonRpcProvider(url);
  const router = new AlphaRouter({
    chainId: 11155111,
    provider: getProvider(),
  });
  const options = {
    recipient: "0xFf0dE1ECEb20C2Bb5eb6A0F75D6F10365692B379",
    slippageToleranc: new Percent(50, 10_000),
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };
  const route = await router.route(
    CurrencyAmount.fromRawAmount(
      tokens.in,
      fromReadableAmount(tokens.amountIn, tokens.in.decimals).toString()
    ),
    tokens.out,
    TradeType.EXACT_INPUT,
    options
  );
  console.log("====== route =======");
  console.log(route);
  return route;
};
