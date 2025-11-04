import Web3 from 'web3-proxy';
import { getConfig } from '@/lib/config';
import { logErrorWithConsole, logWarningWithConsole } from '../utils/errorLogger';

let proxyWeb3: Web3 | null = null;
let proxyUrl: string | null = null;

/**
 * Initialize Web3.js proxy provider
 * This creates a Web3.js instance that can be used as a proxy layer
 */
export function initWeb3Proxy(): Web3 | null {
  try {
    const cfg = getConfig();
    const rpcUrl = cfg.EXECUTION_WS_URL;
    
    // Only use web3-proxy if EXECUTION_WS_URL is configured
    if (!rpcUrl) {
      return null;
    }

    // Create Web3.js instance
    const provider = rpcUrl.startsWith('ws') || rpcUrl.startsWith('wss')
      ? new Web3.providers.WebsocketProvider(rpcUrl, {
          reconnect: {
            auto: true,
            delay: 5000,
            maxAttempts: 10,
            onTimeout: false
          }
        })
      : new Web3.providers.HttpProvider(rpcUrl);

    proxyWeb3 = new Web3(provider);
    proxyUrl = rpcUrl;
    
    console.log(`✅ Web3.js proxy initialized for ${rpcUrl}`);
    return proxyWeb3;
  } catch (error) {
    logWarningWithConsole(error, 'Web3.js proxy initialization');
    return null;
  }
}

/**
 * Get Web3.js proxy instance
 */
export function getWeb3Proxy(): Web3 | null {
  if (!proxyWeb3 && !proxyUrl) {
    return initWeb3Proxy();
  }
  return proxyWeb3;
}

/**
 * Check if Web3.js proxy is available
 */
export function isWeb3ProxyAvailable(): boolean {
  return proxyWeb3 !== null;
}

/**
 * Get proxy URL
 */
export function getProxyUrl(): string | null {
  return proxyUrl;
}

