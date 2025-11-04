import BigNumber from 'bignumber.js';
import { Decimal } from 'decimal.js-light';
import _ from 'lodash';

// Configure BigNumber for high precision
BigNumber.config({
  DECIMAL_PLACES: 18,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-18, 20]
});

// Configure Decimal.js for financial calculations
Decimal.set({ precision: 50, rounding: Decimal.ROUND_DOWN });

/**
 * Precise AMM calculation utilities using BigNumber for financial accuracy
 */
export class AmmMath {
  /**
   * Calculate price from sqrtPriceX96 (Uniswap V3 format)
   */
  static sqrtPriceX96ToPrice(sqrtPriceX96: string | BigNumber): BigNumber {
    const sqrtPrice = new BigNumber(sqrtPriceX96);
    return sqrtPrice.pow(2).div(new BigNumber(2).pow(192));
  }

  /**
   * Calculate tick from price
   */
  static priceToTick(price: string | number | BigNumber): number {
    const priceBN = new BigNumber(price);
    const tick = priceBN.ln().div(new BigNumber(Math.log(1.0001)));
    return Math.floor(tick.toNumber());
  }

  /**
   * Calculate price from tick
   */
  static tickToPrice(tick: number): BigNumber {
    return new BigNumber(1.0001).pow(tick);
  }

  /**
   * Calculate liquidity from token amounts and price range
   */
  static calculateLiquidity(
    amount0: string | BigNumber,
    amount1: string | BigNumber,
    priceLower: string | BigNumber,
    priceUpper: string | BigNumber,
    currentPrice: string | BigNumber
  ): BigNumber {
    const amt0 = new BigNumber(amount0);
    const amt1 = new BigNumber(amount1);
    const pLower = new BigNumber(priceLower);
    const pUpper = new BigNumber(priceUpper);
    const pCurrent = new BigNumber(currentPrice);

    if (pCurrent.lt(pLower)) {
      // Current price < lower price
      return amt0.mul(pLower).mul(pUpper).sqrt();
    } else if (pCurrent.gt(pUpper)) {
      // Current price > upper price
      return amt1.mul(pUpper.sqrt());
    } else {
      // Current price within range
      const sqrtCurrent = pCurrent.sqrt();
      const sqrtLower = pLower.sqrt();
      const sqrtUpper = pUpper.sqrt();

      const liquidity0 = amt0.mul(sqrtCurrent).mul(sqrtUpper).div(sqrtUpper.minus(sqrtCurrent));
      const liquidity1 = amt1.div(sqrtCurrent.minus(sqrtLower));

      return BigNumber.min(liquidity0, liquidity1);
    }
  }

  /**
   * Calculate impermanent loss
   */
  static calculateImpermanentLoss(
    priceRatioInitial: string | number | BigNumber,
    priceRatioFinal: string | number | BigNumber
  ): BigNumber {
    const r = new BigNumber(priceRatioFinal).div(new BigNumber(priceRatioInitial));
    const sqrtR = r.sqrt();

    // IL = 2*sqrt(r)/(1+r) - 1
    const numerator = new BigNumber(2).mul(sqrtR);
    const denominator = new BigNumber(1).plus(r);
    const ratio = numerator.div(denominator);

    return ratio.minus(1);
  }

  /**
   * Calculate volume-weighted average price (VWAP)
   */
  static calculateVWAP(trades: Array<{ price: string | number; volume: string | number }>): BigNumber {
    if (trades.length === 0) return new BigNumber(0);

    let totalVolume = new BigNumber(0);
    let totalVolumePrice = new BigNumber(0);

    for (const trade of trades) {
      const volume = new BigNumber(trade.volume);
      const price = new BigNumber(trade.price);
      const volumePrice = volume.mul(price);

      totalVolume = totalVolume.plus(volume);
      totalVolumePrice = totalVolumePrice.plus(volumePrice);
    }

    return totalVolume.isZero() ? new BigNumber(0) : totalVolumePrice.div(totalVolume);
  }

  /**
   * Calculate volatility (standard deviation of returns)
   */
  static calculateVolatility(prices: Array<string | number>): BigNumber {
    if (prices.length < 2) return new BigNumber(0);

    // Calculate returns
    const returns: BigNumber[] = [];
    for (let i = 1; i < prices.length; i++) {
      const current = new BigNumber(prices[i]);
      const previous = new BigNumber(prices[i - 1]);
      const returnRate = current.minus(previous).div(previous);
      returns.push(returnRate);
    }

    // Calculate mean
    const mean = returns.reduce((sum, ret) => sum.plus(ret), new BigNumber(0)).div(returns.length);

    // Calculate variance
    const variance = returns.reduce((sum, ret) => {
      return sum.plus(ret.minus(mean).pow(2));
    }, new BigNumber(0)).div(returns.length - 1);

    // Return standard deviation (volatility)
    return variance.sqrt();
  }

  /**
   * Format BigNumber for display with appropriate precision
   */
  static formatBigNumber(value: BigNumber | string | number, decimals: number = 4): string {
    const bn = new BigNumber(value);

    if (bn.isZero()) return '0';

    // For very small numbers
    if (bn.lt(new BigNumber(0.0001))) {
      return bn.toExponential(2);
    }

    // For large numbers
    if (bn.gte(new BigNumber(1000000))) {
      return bn.toFixed(0);
    }

    // For normal numbers
    return bn.toFixed(decimals).replace(/\.?0+$/, '');
  }

  /**
   * Format USD values with appropriate scaling
   */
  static formatUSD(value: BigNumber | string | number): string {
    const bn = new BigNumber(value);

    if (bn.gte(1000000000)) { // Billions
      return `$${(bn.div(1000000000)).toFixed(2)}B`;
    } else if (bn.gte(1000000)) { // Millions
      return `$${(bn.div(1000000)).toFixed(2)}M`;
    } else if (bn.gte(1000)) { // Thousands
      return `$${(bn.div(1000)).toFixed(2)}K`;
    } else {
      return `$${bn.toFixed(2)}`;
    }
  }

  /**
   * Safe division with zero check
   */
  static safeDiv(a: BigNumber | string | number, b: BigNumber | string | number): BigNumber {
    const divisor = new BigNumber(b);
    if (divisor.isZero()) return new BigNumber(0);
    return new BigNumber(a).div(divisor);
  }

  /**
   * Calculate percentage change
   */
  static percentageChange(oldValue: BigNumber | string | number, newValue: BigNumber | string | number): BigNumber {
    const oldBN = new BigNumber(oldValue);
    if (oldBN.isZero()) return new BigNumber(0);

    const newBN = new BigNumber(newValue);
    return newBN.minus(oldBN).div(oldBN).mul(100);
  }
}

/**
 * Data processing utilities for AMM analytics
 */
export class AmmDataUtils {
  /**
   * Group events by time intervals (for charts)
   */
  static groupEventsByInterval<T extends { timestamp: string | Date }>(
    events: T[],
    intervalMinutes: number = 60
  ): Array<{ timestamp: Date; events: T[]; count: number }> {
    const grouped = _.groupBy(events, (event) => {
      const date = new Date(event.timestamp);
      const interval = Math.floor(date.getTime() / (intervalMinutes * 60 * 1000));
      return interval;
    });

    return _.map(grouped, (events, intervalKey) => ({
      timestamp: new Date(parseInt(intervalKey) * intervalMinutes * 60 * 1000),
      events,
      count: events.length
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Calculate volume metrics from events
   */
  static calculateVolumeMetrics(events: Array<{ volumeUSD?: number; feeUSD?: number }>) {
    const volumes = events.map(e => new BigNumber(e.volumeUSD || 0));
    const fees = events.map(e => new BigNumber(e.feeUSD || 0));

    const totalVolume = volumes.reduce((sum, vol) => sum.plus(vol), new BigNumber(0));
    const totalFees = fees.reduce((sum, fee) => sum.plus(fee), new BigNumber(0));

    return {
      totalVolume: totalVolume.toString(),
      totalFees: totalFees.toString(),
      averageVolume: volumes.length > 0 ? totalVolume.div(volumes.length) : new BigNumber(0),
      volumeCount: volumes.length
    };
  }

  /**
   * Filter and sort pools by various criteria
   */
  static filterAndSortPools(
    pools: any[],
    filters: {
      minVolume24h?: number;
      minLiquidity?: number;
      protocol?: string;
      sortBy?: 'volume24h' | 'liquidity' | 'feeTier';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ) {
    let filtered = [...pools];

    // Apply filters
    if (filters.minVolume24h) {
      filtered = filtered.filter(p => (p.volume24hUSD || 0) >= filters.minVolume24h!);
    }

    if (filters.minLiquidity) {
      filtered = filtered.filter(p => (p.liquidityUSD || 0) >= filters.minLiquidity!);
    }

    if (filters.protocol) {
      filtered = filtered.filter(p => p.protocol === filters.protocol);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'volume24h';
    const sortOrder = filters.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortBy) {
        case 'volume24h':
          aVal = a.volume24hUSD || 0;
          bVal = b.volume24hUSD || 0;
          break;
        case 'liquidity':
          aVal = a.liquidityUSD || 0;
          bVal = b.liquidityUSD || 0;
          break;
        case 'feeTier':
          aVal = a.feeTier || 0;
          bVal = b.feeTier || 0;
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }

  /**
   * Calculate pool efficiency metrics
   */
  static calculatePoolEfficiency(
    pool: {
      volume24hUSD?: number;
      liquidityUSD?: number;
      feeTier?: number;
    }
  ) {
    const volume = new BigNumber(pool.volume24hUSD || 0);
    const liquidity = new BigNumber(pool.liquidityUSD || 0);
    const feeTier = new BigNumber(pool.feeTier || 0).div(10000); // Convert to decimal

    // Utilization rate = Volume / (2 * Liquidity) * 100
    const utilization = liquidity.isZero() ? new BigNumber(0) :
      volume.div(liquidity.mul(2)).mul(100);

    // Annualized fee yield = (feeTier * utilization * 365) / 100
    const annualFeeYield = feeTier.mul(utilization).mul(365).div(100);

    return {
      utilization: utilization.toString(),
      annualFeeYield: annualFeeYield.toString(),
      efficiency: utilization.gt(50) ? 'high' : utilization.gt(20) ? 'medium' : 'low'
    };
  }
}

/**
 * Export commonly used BigNumber utilities
 */
export { BigNumber };
export default { AmmMath, AmmDataUtils };
