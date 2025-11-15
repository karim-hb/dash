export default {
  solidity: "0.8.19", // Main version for most contracts
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // Exclude old contract interfaces (they're reference-only for existing on-chain contracts)
  // ABIs for these will be created manually or fetched from on-chain
};

