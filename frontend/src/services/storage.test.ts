import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { Discard } from '../types';
import { changePendingDiscard, readDiscards, saveDiscard } from './storage';
import { syncPending } from './sync';
const item = (eventId: string): Discard => ({
  eventId,
  productionId: 'p1',
  reasonId: 'r1',
  quantity: 3,
  createdAt: '2026-10-07T10:00:00Z',
  status: 'pending',
});
describe('Fila persistente do Totem', () => {
  it('preserva UUID, produção, quantidade e horário no armazenamento', async () => {
    await saveDiscard(item('save'));
    expect(await readDiscards()).toContainEqual(item('save'));
    await changePendingDiscard('save', 'voided');
  });
  it('não substitui um evento já persistido com o mesmo UUID', async () => {
    await saveDiscard(item('duplicate'));
    await expect(saveDiscard({ ...item('duplicate'), quantity: 9 })).rejects.toBeDefined();
    expect((await readDiscards()).find((r) => r.eventId === 'duplicate')?.quantity).toBe(3);
    await changePendingDiscard('duplicate', 'voided');
  });
  it('mantém dados até confirmação explícita do evento correto', async () => {
    await saveDiscard(item('ack'));
    await expect(syncPending(async () => ({ eventId: 'wrong', accepted: true }))).rejects.toThrow();
    expect((await readDiscards()).find((r) => r.eventId === 'ack')?.status).toBe('pending');
    await expect(
      syncPending(async () => {
        throw new Error('Servidor indisponível');
      }),
    ).rejects.toThrow();
    expect((await readDiscards()).find((r) => r.eventId === 'ack')?.status).toBe('pending');
    expect(
      await syncPending(async (record) => ({ eventId: record.eventId, accepted: true })),
    ).toEqual({ synced: 1, pending: 0 });
    await expect(changePendingDiscard('ack', 'voided')).rejects.toThrow();
  });
  it('não transmite lançamentos desfeitos e não aceita quantidade inválida', async () => {
    await saveDiscard(item('undo'));
    await changePendingDiscard('undo', 'voided');
    expect(
      await syncPending(async () => {
        throw new Error('Não deveria enviar');
      }),
    ).toEqual({ synced: 0, pending: 0 });
    await expect(saveDiscard({ ...item('invalid'), quantity: 0 })).rejects.toThrow();
    await expect(saveDiscard({ ...item('fraction'), quantity: 1.5 })).rejects.toThrow();
  });
});
