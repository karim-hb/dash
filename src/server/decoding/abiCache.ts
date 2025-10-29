import fs from 'fs';
import path from 'path';
import { getConfig } from '@/lib/config';

export class AbiCache {
  private memoryCache: Map<string, any[]> = new Map(); // address -> ABI
  private dir: string;

  constructor(cacheDir: string = path.join(process.cwd(), 'src/server/catalog/abis')) {
    this.dir = cacheDir;
    try { fs.mkdirSync(this.dir, { recursive: true }); } catch {}
  }

  private filePath(address: string): string {
    return path.join(this.dir, `${address.toLowerCase()}.json`);
  }

  get(address: string): any[] | null {
    const key = address.toLowerCase();
    if (this.memoryCache.has(key)) return this.memoryCache.get(key)!;
    const fp = this.filePath(key);
    if (fs.existsSync(fp)) {
      try {
        const abi = JSON.parse(fs.readFileSync(fp, 'utf8'));
        this.memoryCache.set(key, abi);
        return abi;
      } catch {}
    }
    return null;
  }

  set(address: string, abi: any[]): void {
    const key = address.toLowerCase();
    this.memoryCache.set(key, abi);
    try {
      fs.writeFileSync(this.filePath(key), JSON.stringify(abi, null, 2));
    } catch {}
  }

  async fetchFromEtherscan(address: string): Promise<any[] | null> {
    try {
      const { ETHERSCAN_API_KEY, ETHERSCAN_BASE_URL } = getConfig();
      const base = ETHERSCAN_BASE_URL || 'https://api.etherscan.io';
      const url = new URL('/api', base);
      url.searchParams.set('module', 'contract');
      url.searchParams.set('action', 'getabi');
      url.searchParams.set('address', address);
      if (ETHERSCAN_API_KEY) url.searchParams.set('apikey', ETHERSCAN_API_KEY);

      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.status === '1' && data.result) {
        const abi = JSON.parse(data.result);
        if (Array.isArray(abi)) {
          this.set(address, abi);
          return abi;
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}

let cache: AbiCache | null = null;
export function getAbiCache(): AbiCache {
  if (!cache) cache = new AbiCache();
  return cache;
}
