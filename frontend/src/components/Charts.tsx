import type { HourCount } from '../types';
import { number } from '../utils/metrics';

export function FlowChart({ rows }: { rows: HourCount[] }) {
  const max = Math.max(1, ...rows.flatMap(r => [r.input, r.output]));
  if (!rows.length) return <p className="chart-empty">Nenhum evento no intervalo selecionado.</p>;
  return <div className="flow-chart"><div className="chart-legend"><span><i className="legend-input"/>Entrada</span><span><i className="legend-output"/>Saída</span><span className="muted">pares / hora</span></div><div className="chart-layout"><div className="chart-axis"><span>{number(max)}</span><span>{number(Math.round(max / 2))}</span><span>0</span></div><div className="chart-bars">{rows.map(r => <div className="chart-group" key={r.hour}><div className="bar-pair"><div className="bar input-bar" style={{ height: `${r.input / max * 100}%` }} title={`Entrada: ${number(r.input)} pares`}><span>{number(r.input)}</span></div><div className="bar output-bar" style={{ height: `${r.output / max * 100}%` }} title={`Saída: ${number(r.output)} pares`}><span>{number(r.output)}</span></div></div><span className="chart-hour">{String(r.hour).padStart(2, '0')}h</span><span className="sr-only">Entrada: {r.input}; saída: {r.output} pares.</span></div>)}</div></div></div>;
}
export function ReasonChart({ rows }: { rows: { name: string; quantity: number }[] }) {
  const total = rows.reduce((a, r) => a + r.quantity, 0);
  return <div className="reason-chart">{rows.length ? rows.map((r, index) => <div key={r.name} className="reason-row"><div><span>{r.name}</span><strong>{number(r.quantity)} <small>pares</small></strong></div><div className="progress-track"><div style={{ width: `${total ? r.quantity / total * 100 : 0}%`, opacity: 1 - index * .12 }}/></div></div>) : <p className="muted">Nenhum descarte registrado.</p>}</div>;
}
