import type { DemoState, Device, Production } from '../types';
import { dateKey } from '../utils/metrics';

// Preset operacional. Não é editável pelas telas; o backend deverá usar o mesmo valor.
export const IDLE_LIMIT_SECONDS = 120;

export function deleteDemoReason(
  state: DemoState,
  id: string,
  deletedAt = new Date().toISOString(),
): DemoState {
  const reason = state.reasons.find((r) => r.id === id && !r.deletedAt);
  if (!reason) throw new Error('Motivo não encontrado.');
  // Preserve the name and ID so historical records remain readable.
  return {
    ...state,
    reasons: state.reasons.map((r) => (r.id === id ? { ...r, active: false, deletedAt } : r)),
  };
}

const at = (day: string, hour: string) => `${day}T${hour}:00-03:00`;
export function createDemoState(): DemoState {
  const today = dateKey(new Date().toISOString());
  const yesterday = dateKey(new Date(Date.now() - 86400000).toISOString());
  const previous = dateKey(new Date(Date.now() - 172800000).toISOString());
  const make = (
    id: string,
    day: string,
    name: string,
    status: Production['status'],
    values: number[],
  ): Production => ({
    id,
    name,
    shiftId: 'morning',
    status,
    startedAt:
      status === 'active' ? new Date(Date.now() - 4 * 3600000).toISOString() : at(day, '07:00'),
    endedAt: status === 'closed' ? at(day, '11:00') : undefined,
    input: values.slice(0, 4).reduce((a, b) => a + b, 0),
    output: values.slice(4).reduce((a, b) => a + b, 0),
    hourly: values.slice(0, 4).map((input, i) => ({ hour: 7 + i, input, output: values[i + 4] })),
    idlePeriods: [
      { start: at(day, '09:12'), end: at(day, '09:24') },
      { start: at(day, '10:18'), end: at(day, '10:23') },
    ],
  });
  const active = make(
    'E1-DEMO-003',
    today,
    'Produção E1 · demonstração',
    'active',
    [620, 710, 580, 650, 590, 690, 550, 618],
  );
  // Active demo buckets/idle periods follow its actual start, rather than future clock times.
  const started = Date.parse(active.startedAt);
  active.hourly = active.hourly.map((row, i) => ({
    ...row,
    hour: Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        hourCycle: 'h23',
      }).format(new Date(started + i * 3600000)),
    ),
  }));
  active.idlePeriods = [
    {
      start: new Date(started + 7200000).toISOString(),
      end: new Date(started + 7920000).toISOString(),
    },
    {
      start: new Date(started + 10800000).toISOString(),
      end: new Date(started + 11100000).toISOString(),
    },
  ];
  return {
    version: 1,
    productions: [
      active,
      make(
        'E1-DEMO-002',
        yesterday,
        'Produção E1 · lote 002',
        'closed',
        [650, 740, 700, 610, 645, 732, 688, 600],
      ),
      make(
        'E1-DEMO-001',
        previous,
        'Produção E1 · lote 001',
        'closed',
        [700, 800, 650, 690, 695, 789, 641, 680],
      ),
    ],
    reasons: [
      { id: 'surface', name: 'Defeito na superfície', active: true },
      { id: 'shape', name: 'Deformação', active: true },
      { id: 'color', name: 'Variação de cor', active: true },
      { id: 'other', name: 'Outros', active: true },
    ],
    shifts: [
      { id: 'morning', name: '1º turno', start: '07:00', end: '15:00' },
      { id: 'afternoon', name: '2º turno', start: '15:00', end: '23:00' },
    ],
    idleLimitSeconds: IDLE_LIMIT_SECONDS,
    seedDiscards: [
      {
        eventId: 'seed-1',
        productionId: active.id,
        reasonId: 'surface',
        quantity: 18,
        createdAt: new Date(started + 600000).toISOString(),
        status: 'synced',
      },
      {
        eventId: 'seed-2',
        productionId: active.id,
        reasonId: 'shape',
        quantity: 11,
        createdAt: new Date(started + 900000).toISOString(),
        status: 'synced',
      },
      {
        eventId: 'seed-3',
        productionId: active.id,
        reasonId: 'color',
        quantity: 7,
        createdAt: new Date(started + 1200000).toISOString(),
        status: 'synced',
      },
      {
        eventId: 'seed-4',
        productionId: 'E1-DEMO-002',
        reasonId: 'surface',
        quantity: 24,
        createdAt: at(yesterday, '08:20'),
        status: 'synced',
      },
      {
        eventId: 'seed-5',
        productionId: 'E1-DEMO-001',
        reasonId: 'shape',
        quantity: 16,
        createdAt: at(previous, '09:40'),
        status: 'synced',
      },
    ],
  };
}
export function demoDevices(): Device[] {
  const now = Date.now();
  return [
    {
      id: 'E1-IN',
      name: 'Sensor de entrada',
      role: 'ESP32-S3 · início da esteira',
      channel: 'Wi-Fi',
      state: 'online',
      lastSeen: new Date(now - 8000).toISOString(),
      pending: 0,
    },
    {
      id: 'E1-OUT',
      name: 'Sensor de saída',
      role: 'ESP32-S3 · final da esteira',
      channel: 'LoRa',
      state: 'contingency',
      lastSeen: new Date(now - 14000).toISOString(),
      pending: 3,
    },
    {
      id: 'E1-GW',
      name: 'Gateway LoRa',
      role: 'ESP32-S3 · conexão com o servidor',
      channel: 'USB',
      state: 'online',
      lastSeen: new Date(now - 6000).toISOString(),
      pending: 0,
    },
  ];
}
