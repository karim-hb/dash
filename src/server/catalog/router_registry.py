"""Known DEX router addresses and their metadata"""

_ROUTERS = {
    # Uniswap V2
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D": {
        "name": "UniswapV2Router02",
        "version": "v2"
    },

    # Uniswap V3
    "0xE592427A0AEce92De3Edee1F18E0157C05861564": {
        "name": "UniswapV3Router",
        "version": "v3"
    },
    "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45": {
        "name": "UniswapV3Router",
        "version": "v3"
    },

    # SushiSwap
    "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F": {
        "name": "SushiSwapRouter",
        "version": "v2"
    },

    # 1inch
    "0x1111111254EEB25477B68fb85Ed929f73A960582": {
        "name": "1inchAggregationRouter",
        "version": "agg"
    },

    # 0x
    "0xDef1C0ded9bec7F1a1670819833240f027b25EfF": {
        "name": "0xExchangeProxy",
        "version": "agg"
    },

    # Universal Router
    "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD": {
        "name": "UniswapUniversalRouter",
        "version": "uni"
    },
    "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B": {
        "name": "UniswapUniversalRouter2",
        "version": "uni"
    },
}

_WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
