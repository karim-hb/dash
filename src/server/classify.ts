import fs from 'fs';
import path from 'path';
import { Transaction } from '@/lib/types';
import { logErrorWithConsole } from './utils/errorLogger';

// Classification result
export interface Classification {
  category: string;
  protocol: string;
  version: string;
  confidence: number;
}

// Router registry (loaded from JSON)
let ROUTERS: Record<string, any> = {};

// Load router registries
function loadRouters(): void {
  if (Object.keys(ROUTERS).length > 0) return;

  try {
    // Load router registry (normalize into flat address -> metadata map)
    const routerPath = path.join(process.cwd(), 'src/server/catalog/router_registry.json');
    if (fs.existsSync(routerPath)) {
      const routerData = JSON.parse(fs.readFileSync(routerPath, 'utf8'));
      if (routerData && routerData.routers && typeof routerData.routers === 'object') {
        Object.assign(ROUTERS, routerData.routers);
      }
    }

    // Load extended router registry (same shape)
    const extRouterPath = path.join(process.cwd(), 'src/server/catalog/router_registry.ext.json');
    if (fs.existsSync(extRouterPath)) {
      const extRouterData = JSON.parse(fs.readFileSync(extRouterPath, 'utf8'));
      if (extRouterData && extRouterData.routers && typeof extRouterData.routers === 'object') {
        Object.assign(ROUTERS, extRouterData.routers);
      }
    }

    console.log(`✅ Loaded ${Object.keys(ROUTERS).length} router entries`);
  } catch (error) {
    logErrorWithConsole(error, 'Router registry loading');

  }
}

// Classify transaction
export function classifyTx(tx: Transaction): Classification {
  loadRouters();

  const toAddr = tx.to?.toLowerCase();
  const input = tx.input;

  // Default classification
  const result: Classification = {
    category: 'generic',
    protocol: 'unknown',
    version: '',
    confidence: 0.1
  };

  if (!toAddr) return result;

  // Check router registry
  const routerInfo = ROUTERS[toAddr];
  if (routerInfo) {
    result.category = 'dex';
    result.protocol = routerInfo.name || 'DEX';
    result.version = routerInfo.version || '';
    result.confidence = 0.9;
    return result;
  }

  // Check for ERC-20 patterns
  if (input && input.startsWith('0xa9059cbb')) { // transfer
    result.category = 'erc20';
    result.protocol = 'ERC-20';
    result.version = '';
    result.confidence = 0.8;
    return result;
  }

  if (input && (input.startsWith('0x095ea7b3') || input.startsWith('0x23b872dd'))) { // approve/transferFrom
    result.category = 'erc20';
    result.protocol = 'ERC-20';
    result.version = '';
    result.confidence = 0.8;
    return result;
  }

  // Check for ETH transfers
  if ((!input || input === '0x') && tx.value && BigInt(tx.value) > 0) {
    result.category = 'eth_transfer';
    result.protocol = 'ETH';
    result.version = '';
    result.confidence = 0.9;
    return result;
  }

  // Check protocols registry for bridges, aggregators, etc.
  try {
    const protocolsPath = path.join(process.cwd(), 'src/server/catalog/protocols.json');
    if (fs.existsSync(protocolsPath)) {
      const protocolsData = JSON.parse(fs.readFileSync(protocolsPath, 'utf8'));

      for (const [category, protocols] of Object.entries(protocolsData)) {
        if (Array.isArray(protocols)) {
          for (const protocol of protocols) {
            if (protocol.addresses && protocol.addresses.includes(toAddr)) {
              result.category = category;
              result.protocol = protocol.name;
              result.version = '';
              result.confidence = 0.8;
              return result;
            }
          }
        }
      }
    }
  } catch (error) {
    logErrorWithConsole(error, 'Protocol classification');
  }

  // Check for NFT patterns (ERC-721/1155)
  if (input && (input.includes('70a08231') || input.includes('6352211e'))) { // balanceOf/supportsInterface
    result.category = 'erc721';
    result.protocol = 'NFT';
    result.version = '';
    result.confidence = 0.7;
    return result;
  }

  return result;
}

// Convert classification to category key
export function categoryKey(classification: Classification): string {
  const { category, protocol, version } = classification;

  if (category === 'dex') {
    return `${category}:${protocol.toLowerCase().replace(/\s+/g, '-')}`;
  }

  if (category === 'erc20') {
    return 'erc20:transfer';
  }

  if (category === 'eth_transfer') {
    return 'eth_transfer:transfer';
  }

  if (category === 'erc721' || category === 'erc1155') {
    return `${category}:transfer`;
  }

  return `${category}:call`;
}

// Get router info for address
export function getRouterInfo(address: string): any | null {
  loadRouters();
  return ROUTERS[address.toLowerCase()] || null;
}

// Export routers for other modules
export { ROUTERS };
