import { ethers } from 'ethers';
import { getConfig } from '@/lib/config';
import { getWeb3Proxy, isWeb3ProxyAvailable, getProxyUrl } from './web3Proxy';

let sharedProvider: ethers.providers.Provider | null = null;

export function getProvider(): ethers.providers.Provider {
  if (sharedProvider) return sharedProvider;
  
  const cfg = getConfig();
  const url = cfg.EXECUTION_WS_URL;
  
  // Try to use Web3.js proxy if available - use the same URL that Web3.js is using
  if (isWeb3ProxyAvailable()) {
    const proxyUrl = getProxyUrl();
    if (proxyUrl) {
      console.log(`📡 Using Web3.js proxy provider at ${proxyUrl}`);
      // Use the same URL that Web3.js is using, but through ethers
      sharedProvider = proxyUrl.startsWith('ws') || proxyUrl.startsWith('wss')
        ? new ethers.providers.WebSocketProvider(proxyUrl)
        : new ethers.providers.JsonRpcProvider(proxyUrl);
      return sharedProvider;
    }
  }
  
  // Fallback to standard ethers.js provider
  sharedProvider = url.startsWith('ws')
    ? new ethers.providers.WebSocketProvider(url)
    : new ethers.providers.JsonRpcProvider(url);
  return sharedProvider;
}


