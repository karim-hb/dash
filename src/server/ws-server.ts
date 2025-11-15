import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

async function main() {
  const id = await provider.getNetwork();
  console.log("Chain ID:", id.chainId);
}

main();
