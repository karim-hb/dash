import { ethers } from "ethers";
import EthAbi from "./abi/ethAbi.json" assert { type: "json" };
import BtcEthAbi from "./abi/btcEth.json" assert { type: "json" };
import BtcUsdAbi from "./abi/btcAbi.json" assert { type: "json" };
import EthBtcAbi from "./abi/ethBtc.json" assert { type: "json" };
import UsdtEthAbi from "./abi/usdtEth.json" assert { type: "json" };
import UsdtUsdAbi from "./abi/usdtUsd.json" assert { type: "json" };

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const tokens = [
  {
    name: "ETH / USD",
    address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    abi: EthAbi,
  },
  {
    name: "BTC / USD",
    address: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
    abi: BtcUsdAbi,
  },
  {
    name: "BTC / ETH",
    address: "0xdeb288F737066589598e9214E782fa5A8eD689e8",
    abi: BtcEthAbi,
  },
  {
    name: "ETH / BTC",
    address: "0xAc559F25B1619171CbC396a50854A3240b6A4e99",
    abi: EthBtcAbi,
  },
  {
    name: "USDT / ETH",
    address: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
    abi: UsdtEthAbi,
  },
  {
    name: "USDT / USD",
    address: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
    abi: UsdtUsdAbi,
  },
];

// Fetch latest on-chain oracle price
export async function getOraclePrice(token) {
  const contract = new ethers.Contract(token.address, token.abi, provider);

  try {
    const result = await contract.latestRoundData();
    const decimals = await contract.decimals();
    
    // Use ethers.formatUnits for safe BigInt conversion
    // formatUnits handles BigInt values properly
    const price = parseFloat(ethers.formatUnits(result.answer, decimals));
    
    // Convert updatedAt to number (handle BigInt if needed)
    const updatedAtTimestamp = typeof result.updatedAt === 'bigint'
      ? Number(result.updatedAt.toString())
      : Number(result.updatedAt);
    const updatedAt = new Date(updatedAtTimestamp * 1000);

    return {
      name: token.name,
      price,
      updatedAt: updatedAt.toISOString(),
    };
  } catch (err) {
    console.error(`⚠️ Error fetching ${token.name}: ${err.message}`);
    return { name: token.name, price: null, updatedAt: null };
  }
}

// Fetch all tokens
export async function getAllOraclePrices() {
  const results = await Promise.all(tokens.map((t) => getOraclePrice(t)));
  return results;
}

// If run directly
if (process.argv[1].endsWith("oracle-prices.js")) {
  const data = await getAllOraclePrices();
  console.table(
    data.map((d) => ({
      Pair: d.name,
      Price: d.price?.toFixed(2),
      "Last Update": d.updatedAt,
    }))
  );
}
