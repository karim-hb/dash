import { ethers } from 'ethers';
import { getProvider } from './provider';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
];

type TokenMeta = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string; // formatted
};

const cache = new Map<string, TokenMeta>();

export async function getTokenMetadata(address: string): Promise<TokenMeta> {
  const addr = ethers.getAddress(address);
  const key = addr.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;

  const pv = getProvider();
  const erc20 = new ethers.Contract(addr, ERC20_ABI, pv);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    erc20.name().catch(() => ''),
    erc20.symbol().catch(() => ''),
    erc20.decimals().catch(() => 18),
    erc20.totalSupply().catch(() => 0n),
  ]);

  const meta: TokenMeta = {
    address: addr,
    name: typeof name === 'string' ? name : String(name),
    symbol: typeof symbol === 'string' ? symbol : String(symbol),
    decimals: Number(decimals || 18),
    totalSupply: ethers.formatUnits(totalSupply || 0n, Number(decimals || 18)),
  };
  cache.set(key, meta);
  return meta;
}


