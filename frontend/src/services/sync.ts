import type { Discard } from '../types';
import { changePendingDiscard, readDiscards } from './storage';
export interface Receipt { eventId: string; accepted: boolean }
export type SendDiscard = (record: Discard) => Promise<Receipt>;
let running = false;
// Pass a backend adapter ONLY after agreeing on explicit idempotent acknowledgements.
// The demo does not call this function and never pretends the backend accepted a record.
export async function syncPending(send: SendDiscard): Promise<{ synced: number; pending: number }> {
  if (running) throw new Error('Sincronização já em andamento.');
  running = true;
  let synced = 0;
  try {
    const records = (await readDiscards()).filter(r => r.status === 'pending');
    for (const record of records) {
      const receipt = await send(record);
      if (!receipt.accepted || receipt.eventId !== record.eventId) throw new Error('Servidor não confirmou o registro esperado.');
      await changePendingDiscard(record.eventId, 'synced');
      synced++;
    }
    return { synced, pending: (await readDiscards()).filter(r => r.status === 'pending').length };
  } finally { running = false; }
}
