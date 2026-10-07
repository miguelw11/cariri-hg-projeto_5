import { describe, expect, it } from 'vitest';
import { createDemoState } from '../services/demo';
import { dateKey, hourOf, metrics } from './metrics';
import type { Production } from '../types';
const production: Production = { id: 'p1', name: 'Teste', shiftId: 's1', status: 'active', startedAt: '2026-10-07T07:00:00-03:00', input: 100, output: 90, hourly: [], idlePeriods: [{ start: '2026-10-07T07:10:00-03:00', end: '2026-10-07T07:20:00-03:00' }] };
describe('Indicadores da E1', () => {
  it('não consolida diferença momentânea durante produção ou encerramento solicitado', () => {
    for (const status of ['active', 'closing'] as const) {
      const result = metrics({ ...production, status }, [], Date.parse('2026-10-07T08:00:00-03:00'));
      expect(result.difference).toBe(10);
      expect(result.loss).toBeNull();
      expect(result.observedLoss).toBeNull();
    }
  });
  it('soma triagem somente da produção, excluindo lançamentos desfeitos', () => {
    const result = metrics({ ...production, status: 'closed', endedAt: '2026-10-07T08:00:00-03:00' }, [
      { eventId: 'a', productionId: 'p1', reasonId: 'r', quantity: 3, createdAt: production.startedAt, status: 'pending' },
      { eventId: 'b', productionId: 'p1', reasonId: 'r', quantity: 7, createdAt: production.startedAt, status: 'voided' },
      { eventId: 'c', productionId: 'p2', reasonId: 'r', quantity: 50, createdAt: production.startedAt, status: 'synced' },
    ]);
    expect(result.loss).toBe(10);
    expect(result.rejected).toBe(3);
    expect(result.observedLoss).toBe(13);
    expect(result.yield).toBe(90);
    expect(result.activeSeconds).toBe(3000);
    expect(result.idleSeconds).toBe(600);
    expect(result.longestIdleSeconds).toBe(600);
  });
  it('não divide por zero numa produção recém iniciada', () => {
    const result = metrics({ ...production, input: 0, output: 0, idlePeriods: [] }, [], Date.parse(production.startedAt));
    expect(result.yield).toBeNull();
    expect(result.idlePercent).toBeNull();
    expect(result.elapsedSeconds).toBe(0);
  });
  it('mantém totais demonstrativos compatíveis com seus agrupamentos horários', () => {
    for (const p of createDemoState().productions) {
      expect(p.hourly.reduce((a, r) => a + r.input, 0)).toBe(p.input);
      expect(p.hourly.reduce((a, r) => a + r.output, 0)).toBe(p.output);
      expect(p.idlePeriods.every(i => Date.parse(i.start) >= Date.parse(p.startedAt) && Date.parse(i.end) <= (p.endedAt ? Date.parse(p.endedAt) : Date.now()))).toBe(true);
    }
  });
  it('interpreta data e hora de acordo com São Paulo', () => {
    expect(dateKey('2026-10-08T01:30:00Z')).toBe('2026-10-07');
    expect(hourOf('2026-10-08T01:30:00Z')).toBe(22);
  });
});
