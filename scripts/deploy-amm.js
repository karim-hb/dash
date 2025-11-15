#!/usr/bin/env node
/**
 * Deploy Custom AMM contracts to local network
 * Usage: npx hardhat run scripts/deploy-amm.js --network local
 */

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AMM contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy AMMFactory
  console.log("\n📦 Deploying AMMFactory...");
  const AMMFactory = await hre.ethers.getContractFactory("AMMFactory");
  const factory = await AMMFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ AMMFactory deployed to:", factoryAddress);

  // Deploy AMMRouter (requires WETH address - using zero address for local testing)
  const WETH = process.env.WETH_ADDRESS || "0x0000000000000000000000000000000000000000";
  console.log("\n📦 Deploying AMMRouter with WETH:", WETH);
  const AMMRouter = await hre.ethers.getContractFactory("AMMRouter");
  const router = await AMMRouter.deploy(factoryAddress, WETH);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ AMMRouter deployed to:", routerAddress);

  console.log("\n📋 Deployment Summary:");
  console.log("Factory:", factoryAddress);
  console.log("Router:", routerAddress);
  console.log("\n💡 Update src/server/catalog/amm.json with factory address:");
  console.log(`  "custom_amm": { "factory": "${factoryAddress}" }`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });


