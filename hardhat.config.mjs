export default {
  solidity: {
    compilers: [
      { version: "0.8.19" }, // Current contracts (AMM, UniswapV2)
      { version: "0.4.18" }, // Uniswap V1
      { version: "0.5.16" }  // Old Curve pools
    ],
    overrides: {
      "contracts/UniswapV1/*.sol": { version: "0.4.18" },
      "contracts/CurveV1Old/*.sol": { version: "0.5.16" }
    }
  },
};
