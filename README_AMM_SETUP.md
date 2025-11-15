# AMM Integration Setup Guide

## Prerequisites

**Important:** Hardhat requires Node.js 22.10.0 or later. The current Node.js version (20.19.5) will cause compilation errors. 

To upgrade Node.js:
```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Or download from https://nodejs.org/
```

## Setup Steps

### 1. Compile Contracts

Once Node.js 22+ is installed:
```bash
npm run compile
```

This will compile:
- Custom AMM contracts (`contracts/AMM/`)
- Uniswap V2 Factory (`contracts/UniswapV2Factory.sol`)

**Note:** Uniswap V1 and Curve V1 Old interfaces are reference-only and don't need compilation. Their ABIs are already created manually in `src/server/abi/`.

### 2. Export ABIs (Optional)

After compilation, export ABIs from artifacts:
```bash
npm run abi:export
```

**Note:** ABIs for Custom AMM, Uniswap V1, and Curve V1 Old are already created manually and ready to use.

### 3. Configure Addresses

Edit `src/server/catalog/amm.json`:

```json
{
  "custom_amm": {
    "factory": "0xYourFactoryAddress"  // Set after deployment
  },
  "uniswap_v1": {
    "factory": "0xc0a47dFe034B400B47cDaD5FecDa2621de6c4d95",
    "exchanges": [
      "0xExchangeAddress1",
      "0xExchangeAddress2"
    ]
  },
  "curve_v1_old": {
    "pools": [
      "0xPoolAddress1",
      "0xPoolAddress2"
    ]
  }
}
```

### 4. Enable Features

Set environment variables in `.env` or export before running:

```bash
# Enable Custom AMM
export ENABLE_AMM_CUSTOM=true

# Enable Uniswap V1
export ENABLE_UNISWAP_V1=true

# Enable Curve V1 Old
export ENABLE_CURVE_V1_OLD=true
```

### 5. Run Historical Backfill

Backfill historical data for enabled protocols:

```bash
# Custom AMM
npm run ingest:amm:historical

# Uniswap V1
npm run ingest:uniswapv1:historical

# Curve V1 Old
npm run ingest:curvev1old:historical
```

### 6. Start Server

Start the server with all indexers:
```bash
npm run server
```

The server will automatically start enabled indexers based on feature flags.

## Error Handling

All errors are logged to `serverError.log` with full context:
- File path
- Function name
- Block number / log index
- Stack trace

Errors will **fail fast** - no fallback or dummy data. Check `serverError.log` for details.

## API Endpoints

Once running, access:
- `/api/amm/custom/pools` - Custom AMM pools
- `/api/amm/custom/stats` - Custom AMM statistics
- `/api/amm/health` - Overall AMM health

## Troubleshooting

1. **Compilation fails**: Upgrade to Node.js 22+
2. **No pools found**: Check `catalog/amm.json` has correct addresses
3. **Indexer not starting**: Verify feature flag is set to `true`
4. **MongoDB errors**: Ensure MongoDB is running and `MONGO_URL` is correct


