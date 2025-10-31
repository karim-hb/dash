import { getTrackerState } from './state';
import { TxState, Transaction } from '@/lib/types';

export class BlockMonitor {

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
            await state.recordConfirmedNonce(tx.from, nonceNum);
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
        const updated: Transaction = {
          ...tx,
          _state: TxState.REPLACED,
          replaced_by: includedTx.hash,
          drop_reason: 'replaced_onchain',
        };

        updated.replacement_chain = Array.isArray(tx.replacement_chain)
          ? [...tx.replacement_chain, includedTx.hash]
          : [includedTx.hash];

        await state.upsert(updated);
      }
    } catch (error) {
      console.error('BlockMonitor.markCompetingPendingAsReplaced error:', error);
    }
  }

}

let monitor: BlockMonitor | null = null;
export function getBlockMonitor(): BlockMonitor {
  if (!monitor) monitor = new BlockMonitor();
  return monitor;
}
