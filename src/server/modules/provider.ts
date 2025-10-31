import { ethers } from 'ethers';
import { getConfig } from '@/lib/config';

let sharedProvider: ethers.Provider | null = null;

export function getProvider(): ethers.Provider {
  if (sharedProvider) return sharedProvider;
  const cfg = getConfig();
  const url = cfg.EXECUTION_WS_URL;
  sharedProvider = url.startsWith('ws')
    ? new ethers.WebSocketProvider(url)
    : new ethers.JsonRpcProvider(url);
  return sharedProvider;
}


