import fs from 'fs';
import path from 'path';
import { Interface } from 'ethers';

// ABI cache for contract ABIs fetched from Etherscan

interface CachedABI {
  address: string;
  abi: any[];
  timestamp: number;
  source: string; // 'etherscan' | 'manual'
}

export class AbiCache {
  private cache = new Map<string, CachedABI>();
  private cacheFile: string;
  private etherscanApiKey: string | undefined;
  private maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.cacheFile = path.join(process.cwd(), 'src/server/catalog/abi_cache.json');
    this.etherscanApiKey = process.env.ETHERSCAN_API_KEY;
    this.loadCache();
  }

  // Load cache from file
  private loadCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        const cached = JSON.parse(data);
        
        for (const [address, entry] of Object.entries(cached)) {
          this.cache.set(address.toLowerCase(), entry as CachedABI);
        }
        
        console.log(`✅ Loaded ${this.cache.size} cached ABIs`);
      }
    } catch (error) {
      console.error('Failed to load ABI cache:', error);
    }
  }

  // Save cache to file
  private saveCache(): void {
    try {
      const cacheObj: Record<string, CachedABI> = {};
      for (const [address, entry] of this.cache.entries()) {
        cacheObj[address] = entry;
      }
      
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheObj, null, 2));
    } catch (error) {
      console.error('Failed to save ABI cache:', error);
    }
  }

  // Get ABI for contract address
  async getAbi(address: string): Promise<any[] | null> {
    const addr = address.toLowerCase();
    
    // Check cache first
    const cached = this.cache.get(addr);
    if (cached) {
      // Check if cache is still valid
      const age = Date.now() - cached.timestamp;
      if (age < this.maxCacheAge) {
        return cached.abi;
      }
    }

    // Fetch from Etherscan
    if (this.etherscanApiKey) {
      const abi = await this.fetchFromEtherscan(addr);
      if (abi) {
        this.cacheAbi(addr, abi, 'etherscan');
        return abi;
      }
    }

    // Return cached even if old, better than nothing
    if (cached) {
      return cached.abi;
    }

    return null;
  }

  // Fetch ABI from Etherscan API
  private async fetchFromEtherscan(address: string): Promise<any[] | null> {
    if (!this.etherscanApiKey) {
      console.warn('Etherscan API key not configured');
      return null;
    }

    try {
      const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${this.etherscanApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.result) {
        const abi = JSON.parse(data.result);
        console.log(`✅ Fetched ABI for ${address} from Etherscan`);
        return abi;
      } else if (data.message === 'NOTOK' && data.result.includes('rate limit')) {
        console.warn('Etherscan API rate limit reached');
        return null;
      } else {
        console.warn(`Failed to fetch ABI for ${address}: ${data.message}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching ABI from Etherscan for ${address}:`, error);
      return null;
    }
  }

  // Cache ABI
  private cacheAbi(address: string, abi: any[], source: string): void {
    const addr = address.toLowerCase();
    
    this.cache.set(addr, {
      address: addr,
      abi,
      timestamp: Date.now(),
      source
    });

    // Save to file periodically (every 10 new entries)
    if (this.cache.size % 10 === 0) {
      this.saveCache();
    }
  }

  // Manually add ABI to cache
  addAbi(address: string, abi: any[]): void {
    this.cacheAbi(address.toLowerCase(), abi, 'manual');
    this.saveCache();
  }

  // Try to decode function call using cached ABI
  async decodeFunctionCall(address: string, input: string): Promise<{
    name: string;
    args: any[];
    signature: string;
  } | null> {
    const abi = await this.getAbi(address);
    if (!abi) return null;

    try {
      const iface = new Interface(abi);
      const tx = iface.parseTransaction({ data: input });
      
      if (!tx) return null;

      return {
        name: tx.name,
        args: Array.from(tx.args),
        signature: tx.signature
      };
    } catch (error) {
      // ABI doesn't match or parse error
      return null;
    }
  }

  // Get Interface for contract
  async getInterface(address: string): Promise<Interface | null> {
    const abi = await this.getAbi(address);
    if (!abi) return null;

    try {
      return new Interface(abi);
    } catch (error) {
      console.error(`Failed to create Interface for ${address}:`, error);
      return null;
    }
  }

  // Check if address is in cache
  hasAbi(address: string): boolean {
    return this.cache.has(address.toLowerCase());
  }

  // Get cache statistics
  getStats(): {
    total_cached: number;
    etherscan_count: number;
    manual_count: number;
    oldest_entry: number;
    newest_entry: number;
  } {
    let etherscanCount = 0;
    let manualCount = 0;
    let oldest = Date.now();
    let newest = 0;

    for (const entry of this.cache.values()) {
      if (entry.source === 'etherscan') {
        etherscanCount++;
      } else if (entry.source === 'manual') {
        manualCount++;
      }

      if (entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
      if (entry.timestamp > newest) {
        newest = entry.timestamp;
      }
    }

    return {
      total_cached: this.cache.size,
      etherscan_count: etherscanCount,
      manual_count: manualCount,
      oldest_entry: oldest,
      newest_entry: newest
    };
  }

  // Clear old cache entries
  clearOldEntries(maxAge: number = this.maxCacheAge): number {
    const now = Date.now();
    let removed = 0;

    for (const [address, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(address);
        removed++;
      }
    }

    if (removed > 0) {
      this.saveCache();
      console.log(`🗑️ Removed ${removed} old ABI cache entries`);
    }

    return removed;
  }

  // Force save cache
  forceSave(): void {
    this.saveCache();
  }
}

// Global ABI cache instance
let abiCache: AbiCache | null = null;

export function getAbiCache(): AbiCache {
  if (!abiCache) {
    abiCache = new AbiCache();
  }
  return abiCache;
}

// Helper function to fetch and decode function
export async function fetchAndDecode(address: string, input: string): Promise<{
  name: string;
  args: any[];
  signature: string;
} | null> {
  const cache = getAbiCache();
  return await cache.decodeFunctionCall(address, input);
}
