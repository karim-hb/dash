import { config } from '@/lib/config';

export async function startBalancerV2Indexer(): Promise<void> {
  if (!config.ENABLE_BALANCER) return;
  // Placeholder: implement Vault pool discovery and getPoolTokens in phase 2
}


