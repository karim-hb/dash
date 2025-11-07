import { ethers } from "ethers";
import { getOraclePrice } from "./oracle";
import tokenList from "./abi/sample.json" assert { type: "json" };

const provider = new ethers.WebSocketProvider("ws://127.0.0.1:8545");
const MAX_TXS = 50;
const MIN_VALUE_USD = 1000; // Minimum transaction value in USD to display
let txs = [];
let ethPrice = 0;

// Transaction pool tracking
interface TrackedTx {
  hash: string;
  firstSeenInPool: number;
  lastSeenInPool: number;
  poolStatus: 'pending' | 'queued' | 'confirmed' | 'dropped' | 'failed';
  confirmedBlock?: number;
  confirmedAt?: number;
  timeToConfirm?: number; // seconds
  receipt?: ethers.TransactionReceipt;
  decoded?: any;
}

const trackedPoolTxs = new Map<string, TrackedTx>();

// Load tokens from sample.json into a map for quick lookup
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {};
if (tokenList && tokenList.tokens) {
  tokenList.tokens.forEach((token: any) => {
    if (token.chainId === 1) { // Ethereum mainnet
      KNOWN_TOKENS[token.address.toLowerCase()] = {
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
      };
    }
  });
}
console.log(`📚 Loaded ${Object.keys(KNOWN_TOKENS).length} tokens from token list`);

// Extended ERC20 ABI for decoding common functions
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

// Common function selectors for quick identification
const FUNCTION_SELECTORS: Record<string, string> = {
  "0xa9059cbb": "transfer(address,uint256)",
  "0x23b872dd": "transferFrom(address,address,uint256)",
  "0x095ea7b3": "approve(address,uint256)",
  "0x70a08231": "balanceOf(address)",
  "0xdd62ed3e": "allowance(address,address)",
  "0x18160ddd": "totalSupply()",
  "0x06fdde03": "name()",
  "0x95d89b41": "symbol()",
  "0x313ce567": "decimals()",
};

// Format USD value properly, handling very small numbers
function formatUSD(value: number): string {
  if (value === 0) return "$0.00";
  
  // For very small values (< 0.01), show more decimal places
  if (value < 0.01 && value > 0) {
    // Find the first significant digit
    const absValue = Math.abs(value);
    const magnitude = Math.floor(Math.log10(absValue));
    const decimals = Math.max(2, Math.abs(magnitude) + 2);
    return `$${value.toFixed(decimals)}`;
  }
  
  // For normal values, show 2 decimal places
  if (value < 1) {
    return `$${value.toFixed(4)}`;
  }
  
  // For larger values, use standard formatting
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Decode transaction data completely
function decodeTransactionData(tx: ethers.TransactionResponse) {
  const result: any = {
    // Basic transaction info
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: ethers.formatEther(tx.value || BigInt(0)),
    gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, "gwei") : null,
    maxFeePerGas: tx.maxFeePerGas ? ethers.formatUnits(tx.maxFeePerGas, "gwei") : null,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? ethers.formatUnits(tx.maxPriorityFeePerGas, "gwei") : null,
    gasLimit: tx.gasLimit.toString(),
    nonce: tx.nonce,
    chainId: tx.chainId.toString(),
    type: tx.type,
    
    // Token info
    token: null,
    decodedData: null,
    functionName: null,
  };

  // Check if this is a token contract
  if (tx.to) {
    const tokenInfo = KNOWN_TOKENS[tx.to.toLowerCase()];
    if (tokenInfo) {
      result.token = tokenInfo;
    }
  }

  // Try to decode transaction data
  if (tx.data && tx.data.length >= 10) {
    const functionSelector = tx.data.slice(0, 10);
    result.functionSelector = functionSelector;
    result.functionName = FUNCTION_SELECTORS[functionSelector] || "Unknown";

    // Try to decode as ERC20 function
    try {
      const iface = new ethers.Interface(ERC20_ABI);
      const decoded = iface.parseTransaction({ data: tx.data });
      
      if (decoded) {
        result.functionName = decoded.name;
        const tokenInfo = result.token || { decimals: 18, symbol: "UNKNOWN", name: "Unknown Token" };
        
        if (decoded.name === "transfer") {
          const [to, amount] = decoded.args;
          const formattedAmount = ethers.formatUnits(amount, tokenInfo.decimals);
          
          result.decodedData = {
            function: "transfer",
            recipient: to,
            amount: formattedAmount,
            amountRaw: amount.toString(),
            tokenSymbol: tokenInfo.symbol,
            tokenName: tokenInfo.name,
            decimals: tokenInfo.decimals,
          };
        } else if (decoded.name === "transferFrom") {
          const [from, to, amount] = decoded.args;
          const formattedAmount = ethers.formatUnits(amount, tokenInfo.decimals);
          
          result.decodedData = {
            function: "transferFrom",
            from: from,
            recipient: to,
            amount: formattedAmount,
            amountRaw: amount.toString(),
            tokenSymbol: tokenInfo.symbol,
            tokenName: tokenInfo.name,
            decimals: tokenInfo.decimals,
          };
        } else if (decoded.name === "approve") {
          const [spender, amount] = decoded.args;
          const formattedAmount = ethers.formatUnits(amount, tokenInfo.decimals);
          
          result.decodedData = {
            function: "approve",
            spender: spender,
            amount: formattedAmount,
            amountRaw: amount.toString(),
            tokenSymbol: tokenInfo.symbol,
            tokenName: tokenInfo.name,
            decimals: tokenInfo.decimals,
          };
        } else {
          result.decodedData = {
            function: decoded.name,
            args: decoded.args.map((arg: any) => arg.toString()),
          };
        }
      }
    } catch (err) {
      // Not a standard ERC20 function, store raw data
      result.decodedData = {
        functionSelector: functionSelector,
        functionName: FUNCTION_SELECTORS[functionSelector] || "Unknown Function",
        rawData: tx.data,
        error: "Could not decode",
      };
    }
  }

  return result;
}

// Get transaction pool status
async function getTxpoolStatus(): Promise<{ pending: number; queued: number } | null> {
  try {
    const result = await provider.send('txpool_status', []);
    if (result) {
      return {
        pending: parseInt(result.pending || '0x0', 16),
        queued: parseInt(result.queued || '0x0', 16)
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Get transaction pool content
async function getTxpoolContent(): Promise<{ pending: Record<string, Record<string, any>>; queued: Record<string, Record<string, any>> } | null> {
  try {
    const result = await provider.send('txpool_content', []);
    if (result) {
      return {
        pending: result.pending || {},
        queued: result.queued || {}
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Monitor transaction pool and track confirmations
async function monitorTransactionPool() {
  try {
    const status = await getTxpoolStatus();
    if (status) {
      console.log(`\n📊 TXPOOL STATUS: ${status.pending} pending, ${status.queued} queued`);
    }

    const content = await getTxpoolContent();
    if (!content) return;

    const currentPoolHashes = new Set<string>();
    const now = Date.now();

    // Process pending transactions
    for (const [sender, txs] of Object.entries(content.pending)) {
      for (const [nonce, tx] of Object.entries(txs)) {
        try {
          // Get transaction hash from txpool data
          // Note: txpool_content may not always include hash, so we'll try to get it
          let txHash: string | null = null;
          if (tx && typeof tx === 'object' && tx.hash) {
            txHash = tx.hash;
          }
          
          if (txHash) {
            currentPoolHashes.add(txHash.toLowerCase());
            
            if (!trackedPoolTxs.has(txHash.toLowerCase())) {
              // New transaction in pool - get full transaction details
              try {
                const fullTx = await provider.getTransaction(txHash);
                if (fullTx) {
                  const decoded = decodeTransactionData(fullTx);
                  const valueEth = Number(decoded.value);
                  const valueUsd = valueEth * ethPrice;
                  
                  // Only track high-value transactions
                  if (valueUsd >= MIN_VALUE_USD) {
                    trackedPoolTxs.set(txHash.toLowerCase(), {
                      hash: txHash,
                      firstSeenInPool: now,
                      lastSeenInPool: now,
                      poolStatus: 'pending',
                      decoded: decoded,
                    });
                    console.log(`\n🆕 NEW TX IN POOL (PENDING): ${txHash.slice(0, 16)}...`);
                    console.log(`   Value: ${decoded.value} ETH (${formatUSD(valueUsd)})`);
                  }
                }
              } catch (err) {
                // Transaction might not be available yet, skip
              }
            } else {
              // Update last seen
              const tracked = trackedPoolTxs.get(txHash.toLowerCase())!;
              tracked.lastSeenInPool = now;
            }
          }
        } catch (err) {
          // Skip this transaction if we can't process it
        }
      }
    }

    // Process queued transactions
    for (const [sender, txs] of Object.entries(content.queued)) {
      for (const [nonce, tx] of Object.entries(txs)) {
        try {
          // Get transaction hash from txpool data
          let txHash: string | null = null;
          if (tx && typeof tx === 'object' && tx.hash) {
            txHash = tx.hash;
          }
          
          if (txHash) {
            currentPoolHashes.add(txHash.toLowerCase());
            
            if (!trackedPoolTxs.has(txHash.toLowerCase())) {
              try {
                const fullTx = await provider.getTransaction(txHash);
                if (fullTx) {
                  const decoded = decodeTransactionData(fullTx);
                  const valueEth = Number(decoded.value);
                  const valueUsd = valueEth * ethPrice;
                  
                  if (valueUsd >= MIN_VALUE_USD) {
                    trackedPoolTxs.set(txHash.toLowerCase(), {
                      hash: txHash,
                      firstSeenInPool: now,
                      lastSeenInPool: now,
                      poolStatus: 'queued',
                      decoded: decoded,
                    });
                    console.log(`\n⏳ NEW TX IN POOL (QUEUED): ${txHash.slice(0, 16)}...`);
                    console.log(`   Value: ${decoded.value} ETH (${formatUSD(valueUsd)})`);
                  }
                }
              } catch (err) {
                // Skip if transaction not available
              }
            } else {
              const tracked = trackedPoolTxs.get(txHash.toLowerCase())!;
              tracked.lastSeenInPool = now;
              if (tracked.poolStatus !== 'queued') {
                tracked.poolStatus = 'queued';
              }
            }
          }
        } catch (err) {
          // Skip this transaction
        }
      }
    }

    // Check for transactions that left the pool
    for (const [hash, tracked] of trackedPoolTxs.entries()) {
      if (!currentPoolHashes.has(hash) && (tracked.poolStatus === 'pending' || tracked.poolStatus === 'queued')) {
        // Transaction left the pool - check if confirmed
        try {
          const tx = await provider.getTransaction(hash);
          if (tx && tx.blockNumber) {
            // Transaction confirmed!
            const receipt = await provider.getTransactionReceipt(hash);
            if (receipt) {
              const confirmedAt = Date.now();
              const timeToConfirm = (confirmedAt - tracked.firstSeenInPool) / 1000;
              
              tracked.poolStatus = receipt.status === 1 ? 'confirmed' : 'failed';
              tracked.confirmedBlock = Number(tx.blockNumber);
              tracked.confirmedAt = confirmedAt;
              tracked.timeToConfirm = timeToConfirm;
              tracked.receipt = receipt;
              
              const statusEmoji = receipt.status === 1 ? '✅' : '❌';
              const statusText = receipt.status === 1 ? 'CONFIRMED' : 'FAILED';
              
              console.log(`\n${statusEmoji} TX ${statusText}: ${hash.slice(0, 16)}...`);
              console.log(`   Block: ${tracked.confirmedBlock}`);
              console.log(`   Time to confirm: ${timeToConfirm.toFixed(2)} seconds`);
              console.log(`   Status: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);
              if (tracked.decoded) {
                console.log(`   Value: ${tracked.decoded.value} ETH`);
              }
            }
          } else {
            // Transaction dropped (not in pool, not confirmed)
            tracked.poolStatus = 'dropped';
            console.log(`\n🗑️ TX DROPPED: ${hash.slice(0, 16)}... (removed from pool)`);
          }
        } catch (err) {
          tracked.poolStatus = 'dropped';
          console.log(`\n🗑️ TX DROPPED: ${hash.slice(0, 16)}... (error checking)`);
        }
      }
    }

    // Clean up old confirmed transactions (older than 1 hour)
    const oneHourAgo = now - 3600000;
    for (const [hash, tracked] of trackedPoolTxs.entries()) {
      if ((tracked.poolStatus === 'confirmed' || tracked.poolStatus === 'failed') && 
          tracked.confirmedAt && tracked.confirmedAt < oneHourAgo) {
        trackedPoolTxs.delete(hash);
      }
    }

  } catch (err) {
    console.error('Error monitoring txpool:', err);
  }
}

// Calculate gas cost in USD
// Formula: gasCost = (gasLimit * gasPriceInGwei) / 1e9 * ethPriceInUSD
// This calculates the MAXIMUM cost (using gasLimit). Actual cost may be lower if transaction uses less gas.
function calculateGasCost(tx: ethers.TransactionResponse): { gasGwei: string; gasEth: number; gasUsd: number } {
  const gasLimit = tx.gasLimit ? Number(tx.gasLimit) : 0;

  // Determine gas price in gwei (1 Gwei = 10^9 Wei = 10^-9 ETH)
  let gasPriceGwei = 0;
  if (tx.maxFeePerGas) {
    // For EIP-1559 transactions, use maxFeePerGas
    gasPriceGwei = parseFloat(ethers.formatUnits(tx.maxFeePerGas, "gwei"));
  } else if (tx.gasPrice) {
    // For legacy transactions, use gasPrice
    gasPriceGwei = parseFloat(ethers.formatUnits(tx.gasPrice, "gwei"));
  }

  // Calculate ETH cost: gasLimit * (gasPriceInGwei / 1e9)
  // Example: 209841 gas * 1.83 Gwei = 209841 * 1.83 * 10^-9 ETH
  const gasEth = (gasLimit * gasPriceGwei) / 1e9;

  // Convert to USD using current ETH price
  const gasUsd = gasEth * ethPrice;
  
  // Debug logging
  console.log("💰 Gas Cost Calculation:");
  console.log(`   Gas Limit: ${gasLimit.toLocaleString()} gas`);
  console.log(`   Gas Price: ${gasPriceGwei.toFixed(2)} Gwei`);
  console.log(`   ETH Cost: ${gasEth.toFixed(8)} ETH`);
  console.log(`   ETH Price: $${ethPrice.toFixed(2)}`);
  console.log(`   USD Cost: $${gasUsd.toFixed(2)}`);
  console.log(`   Note: This is MAXIMUM cost (gasLimit). Actual cost may be lower.`);
  
  return {
    gasGwei: gasPriceGwei.toFixed(2),
    gasEth: parseFloat(gasEth.toFixed(8)),
    gasUsd: parseFloat(gasUsd.toFixed(2)),
  };
}

// Fetch ETH/USD once and refresh every 30 seconds
async function updateEthPrice() {
  const oracle = await getOraclePrice({
    name: "ETH / USD",
    address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    abi: (await import("./abi/ethAbi.json", { assert: { type: "json" } })).default,
  });
  ethPrice = oracle.price || 0;
  console.log(`💵 ETH/USD updated: ${oracle}`);
}
await updateEthPrice();
setInterval(updateEthPrice, 30000);

console.log("🚀 Listening to mempool...");
console.log(`💰 Filter: Only showing transactions with ETH value >= $${MIN_VALUE_USD.toLocaleString()}`);

// Start transaction pool monitoring every 10 seconds
setInterval(monitorTransactionPool, 10000);
console.log("📊 Started transaction pool monitoring (every 10 seconds)");

// Monitor new blocks to detect confirmations faster
provider.on("block", async (blockNumber) => {
  try {
    // Check all tracked transactions when a new block arrives
    for (const [hash, tracked] of trackedPoolTxs.entries()) {
      if (tracked.poolStatus === 'pending' || tracked.poolStatus === 'queued') {
        try {
          const tx = await provider.getTransaction(hash);
          if (tx && tx.blockNumber) {
            // Transaction confirmed in this block!
            const receipt = await provider.getTransactionReceipt(hash);
            if (receipt) {
              const confirmedAt = Date.now();
              const timeToConfirm = (confirmedAt - tracked.firstSeenInPool) / 1000;
              
              tracked.poolStatus = receipt.status === 1 ? 'confirmed' : 'failed';
              tracked.confirmedBlock = Number(tx.blockNumber);
              tracked.confirmedAt = confirmedAt;
              tracked.timeToConfirm = timeToConfirm;
              tracked.receipt = receipt;
              
              const statusEmoji = receipt.status === 1 ? '✅' : '❌';
              const statusText = receipt.status === 1 ? 'CONFIRMED' : 'FAILED';
              
              console.log(`\n${statusEmoji} TX ${statusText} IN BLOCK ${blockNumber}: ${hash.slice(0, 16)}...`);
              console.log(`   Block: ${tracked.confirmedBlock}`);
              console.log(`   Time to confirm: ${timeToConfirm.toFixed(2)} seconds`);
              console.log(`   Status: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);
              if (tracked.decoded) {
                console.log(`   Value: ${tracked.decoded.value} ETH (${formatUSD(Number(tracked.decoded.value) * ethPrice)})`);
              }
              if (receipt.status === 0) {
                console.log(`   ⚠️ Transaction failed! Gas used: ${receipt.gasUsed.toString()}`);
              }
            }
          }
        } catch (err) {
          // Ignore errors for individual transactions
        }
      }
    }
  } catch (err) {
    console.error('Error checking block for confirmations:', err);
  }
});

provider.on("pending", async (txHash) => {
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) return;

    // Decode all transaction data
    const decoded = decodeTransactionData(tx);
    
    // Calculate ETH value in USD
    const valueEth = Number(decoded.value);
    const valueUsd = valueEth * ethPrice;

    // Filter: Only process transactions with value >= $1000
    if (valueUsd < MIN_VALUE_USD) {
      return; // Skip transactions below threshold
    }

    // Calculate gas cost
    const gasCost = calculateGasCost(tx);

    const entry = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || "Contract Creation",
      valueEth: `${valueEth.toFixed(6)} ETH`,
      valueUsd: formatUSD(valueUsd),
      gasPrice: `${gasCost.gasGwei} Gwei`,
      gasEth: `${gasCost.gasEth.toFixed(8)} ETH`,
      gasUsd: formatUSD(gasCost.gasUsd),
      token: decoded.token ? `${decoded.token.symbol} (${decoded.token.name})` : null,
      functionName: decoded.functionName || null,
      tokenTransfer: decoded.decodedData?.function === "transfer" ? {
        recipient: decoded.decodedData.recipient,
        amount: decoded.decodedData.amount,
        symbol: decoded.decodedData.tokenSymbol,
      } : decoded.decodedData?.function === "transferFrom" ? {
        from: decoded.decodedData.from,
        recipient: decoded.decodedData.recipient,
        amount: decoded.decodedData.amount,
        symbol: decoded.decodedData.tokenSymbol,
      } : null,
      timestamp: new Date().toISOString(),
    };

    // Comprehensive logging
    console.log("\n" + "=".repeat(80));
    console.log("📋 TRANSACTION DECODED");
    console.log("=".repeat(80));
    console.log(`Hash:        ${decoded.hash}`);
    console.log(`From:        ${decoded.from}`);
    console.log(`To:          ${decoded.to || "Contract Creation"}`);
    console.log(`ETH Value:   ${decoded.value} ETH (${formatUSD(valueUsd)})`);
    console.log(`Gas Limit:   ${decoded.gasLimit}`);
    console.log(`Gas Price:   ${gasCost.gasGwei} Gwei`);
    console.log(`Gas Cost:    ${gasCost.gasEth.toFixed(8)} ETH (${formatUSD(gasCost.gasUsd)})`);
    
    if (decoded.token) {
      console.log(`\n🪙 TOKEN INFO:`);
      console.log(`  Symbol:    ${decoded.token.symbol}`);
      console.log(`  Name:      ${decoded.token.name}`);
      console.log(`  Decimals:  ${decoded.token.decimals}`);
    }
    
    if (decoded.decodedData) {
      console.log(`\n📝 DECODED DATA:`);
      console.log(`  Function:  ${decoded.functionName || decoded.decodedData.function}`);
      
      if (decoded.decodedData.function === "transfer") {
        console.log(`  Type:      ERC20 Transfer`);
        console.log(`  Recipient: ${decoded.decodedData.recipient}`);
        console.log(`  Amount:    ${decoded.decodedData.amount} ${decoded.decodedData.tokenSymbol}`);
        console.log(`  Raw:       ${decoded.decodedData.amountRaw}`);
      } else if (decoded.decodedData.function === "transferFrom") {
        console.log(`  Type:      ERC20 Transfer From`);
        console.log(`  From:      ${decoded.decodedData.from}`);
        console.log(`  Recipient: ${decoded.decodedData.recipient}`);
        console.log(`  Amount:    ${decoded.decodedData.amount} ${decoded.decodedData.tokenSymbol}`);
        console.log(`  Raw:       ${decoded.decodedData.amountRaw}`);
      } else if (decoded.decodedData.function === "approve") {
        console.log(`  Type:      ERC20 Approval`);
        console.log(`  Spender:   ${decoded.decodedData.spender}`);
        console.log(`  Amount:    ${decoded.decodedData.amount} ${decoded.decodedData.tokenSymbol}`);
        console.log(`  Raw:       ${decoded.decodedData.amountRaw}`);
      } else if (decoded.decodedData.functionSelector) {
        console.log(`  Selector:  ${decoded.decodedData.functionSelector}`);
        console.log(`  Function:  ${decoded.decodedData.functionName}`);
        if (decoded.decodedData.args) {
          console.log(`  Args:      ${decoded.decodedData.args.join(", ")}`);
        }
      }
    } else if (tx.data && tx.data.length > 2) {
      console.log(`\n📝 RAW DATA:`);
      console.log(`  Data:      ${tx.data.slice(0, 66)}...`);
      console.log(`  Length:    ${tx.data.length} bytes`);
    }
    
    console.log("=".repeat(80) + "\n");

    txs.unshift(entry);
    if (txs.length > MAX_TXS) txs.pop();

  } catch (err) {
    console.error("❌ Error processing transaction:", err);
  }
});

provider.on("error", (err) => {
  console.error("❌ WebSocket error:", err.message);
});
