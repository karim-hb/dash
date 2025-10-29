import { getTrackerState } from './state';
import { TxState, Transaction } from '@/lib/types';

export class BlockMonitor {
  // Track per-address last confirmed nonce (best-effort from included txs)
  private confirmedNonceByAddress: Map<string, number> = new Map();

  async onBlock(block: any): Promise<void> {
    try {
      if (!block || !Array.isArray(block.transactions)) return;
      const state = getTrackerState();

      for (const tx of block.transactions as any[]) {
        if (!tx || !tx.hash || !tx.from) continue;

        // Update confirmed nonce tracker (nonce is hex or number depending on client)
        try {
          const nonceNum = typeof tx.nonce === 'string' ? parseInt(tx.nonce, 16) : Number(tx.nonce);
          if (!isNaN(nonceNum)) {
            const key = tx.from.toLowerCase();
            const prev = this.confirmedNonceByAddress.get(key) ?? -1;
            if (nonceNum > prev) this.confirmedNonceByAddress.set(key, nonceNum);
          }
        } catch {}

        // If this transaction exists in state, mark competitors with same nonce as dropped/replaced
        const included = state.getTx(tx.hash);
        if (included) {
          await this.markCompetingPendingAsReplaced(included);
        }
      }
    } catch (error) {
      console.error('BlockMonitor.onBlock error:', error);
    }
  }

  // Find pending transactions with same from+nonce but different hash and mark them dropped/replaced
  private async markCompetingPendingAsReplaced(includedTx: Transaction): Promise<void> {
    const state = getTrackerState();
    try {
      const snap = await state.snapshot(2000);
      const from = (includedTx.from || '').toLowerCase();
      const nonceHex = includedTx.nonce; // stored as hex string in our types

      for (const tx of snap.txs) {
        if (tx.hash === includedTx.hash) continue;
        if (tx._state !== TxState.PENDING) continue;
        if ((tx.from || '').toLowerCase() !== from) continue;
        if (tx.nonce !== nonceHex) continue;

        // Prefer REPLACED when a definitive on-chain inclusion happens
        tx._state = TxState.REPLACED;
        tx.replaced_by = includedTx.hash;
        tx.drop_reason = 'replaced_onchain';
        if (!tx.state_history) tx.state_history = [];
        tx.state_history.push({ state: TxState.REPLACED, timestamp: Math.floor(Date.now() / 1000), reason: 'replaced_onchain' });
        await state.upsert(tx);
      }
    } catch (error) {
      console.error('BlockMonitor.markCompetingPendingAsReplaced error:', error);
    }
  }

  getAddressConfirmedNonce(address: string): number | undefined {
    return this.confirmedNonceByAddress.get(address.toLowerCase());
  }
}

let monitor: BlockMonitor | null = null;
export function getBlockMonitor(): BlockMonitor {
  if (!monitor) monitor = new BlockMonitor();
  return monitor;
}
