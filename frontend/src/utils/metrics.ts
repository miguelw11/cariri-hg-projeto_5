import type { Discard, Production } from '../types';

export const number = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
export const percent = (value: number | null) => value === null ? '—' : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
export const date = (value: string) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
export const time = (value: string) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
export const dateKey = (value: string) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date(value));
export const hourOf = (value: string) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hourCycle: 'h23' }).format(new Date(value)));
export const duration = (seconds: number) => {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}min` : `${minutes}min`;
};
export function metrics(p: Production, discards: Discard[], now = Date.now()) {
  const rejected = discards.filter(d => d.productionId === p.id && d.status !== 'voided').reduce((a, d) => a + d.quantity, 0);
  const elapsedSeconds = Math.max(0, ((p.endedAt ? Date.parse(p.endedAt) : now) - Date.parse(p.startedAt)) / 1000);
  const idleLengths = p.idlePeriods.map(i => Math.max(0, (Date.parse(i.end) - Date.parse(i.start)) / 1000));
  const idleSeconds = idleLengths.reduce((a, b) => a + b, 0);
  const loss = p.status === 'closed' ? p.input - p.output : null;
  return {
    rejected, difference: p.input - p.output, loss,
    observedLoss: loss === null ? null : loss + rejected,
    yield: p.input === 0 ? null : p.output / p.input * 100,
    elapsedSeconds, idleSeconds, activeSeconds: Math.max(0, elapsedSeconds - idleSeconds),
    idlePercent: elapsedSeconds === 0 ? null : idleSeconds / elapsedSeconds * 100,
    idleCount: idleLengths.length, longestIdleSeconds: Math.max(0, ...idleLengths),
  };
}
