import { describe, expect, it } from 'vitest';
import { createDemoState, deleteDemoReason, IDLE_LIMIT_SECONDS } from './demo';
import { metrics } from '../utils/metrics';

describe('Exclusão de motivos', () => {
  it('retira o motivo do cadastro e do Totem sem alterar os registros ou os totais', () => {
    const original = createDemoState();
    const production = original.productions[0];
    const before = metrics(production, original.seedDiscards);
    const updated = deleteDemoReason(original, 'surface', '2026-10-07T12:00:00Z');

    expect(updated.reasons.filter((r) => !r.deletedAt).some((r) => r.id === 'surface')).toBe(false);
    expect(
      updated.reasons.filter((r) => r.active && !r.deletedAt).some((r) => r.id === 'surface'),
    ).toBe(false);
    expect(updated.reasons.find((r) => r.id === 'surface')?.name).toBe('Defeito na superfície');
    expect(updated.seedDiscards).toEqual(original.seedDiscards);
    expect(metrics(production, updated.seedDiscards).rejected).toBe(before.rejected);
    expect(original.reasons.find((r) => r.id === 'surface')?.active).toBe(true);
  });

  it('não exclui novamente um motivo já excluído ou um identificador desconhecido', () => {
    const updated = deleteDemoReason(createDemoState(), 'surface');
    expect(() => deleteDemoReason(updated, 'surface')).toThrow('Motivo não encontrado');
    expect(() => deleteDemoReason(updated, 'unknown')).toThrow('Motivo não encontrado');
  });

  it('inicia a demonstração com o limite operacional predefinido', () => {
    expect(createDemoState().idleLimitSeconds).toBe(IDLE_LIMIT_SECONDS);
    expect(IDLE_LIMIT_SECONDS).toBe(120);
  });
});
