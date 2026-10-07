import { useState, type FormEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  Layers,
  RotateCcw,
  ScanLine,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { FlowChart, ReasonChart } from '../components/Charts';
import { Badge, Empty, Modal, Notice, PageHeading, Panel, Stat } from '../components/ui';
import { ProductionSummary } from './Production';
import { date, dateKey, hourOf, metrics, number, percent } from '../utils/metrics';
import type { HourCount } from '../types';

interface Filters {
  mode: 'range' | 'day';
  from: string;
  to: string;
  shift: string;
  production: string;
  reason: string;
  hourFrom: string;
  hourTo: string;
}
export function Reports() {
  const { data, discards, notify } = useApp();
  const defaultFilters: Filters = {
    mode: 'range',
    from: dateKey(new Date(Date.now() - 7 * 86400000).toISOString()),
    to: dateKey(new Date().toISOString()),
    shift: '',
    production: '',
    reason: '',
    hourFrom: '',
    hourTo: '',
  };
  const [draft, setDraft] = useState(defaultFilters);
  const [filters, setFilters] = useState(defaultFilters);
  const [detailId, setDetailId] = useState<string | null>(null);
  const change = (key: keyof Filters, value: string) =>
    setDraft((old) => ({ ...old, [key]: value }));
  const apply = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.from || !draft.to || (draft.mode === 'range' && draft.from > draft.to)) {
      notify('Informe um intervalo de datas válido.', true);
      return;
    }
    if (draft.hourFrom && draft.hourTo && Number(draft.hourFrom) > Number(draft.hourTo)) {
      notify('A hora inicial precisa ser anterior ou igual à hora final.', true);
      return;
    }
    setFilters({ ...draft, to: draft.mode === 'day' ? draft.from : draft.to });
  };
  const productions = data.productions.filter(
    (p) =>
      p.status === 'closed' &&
      dateKey(p.startedAt) >= filters.from &&
      dateKey(p.startedAt) <= filters.to &&
      (!filters.shift || p.shiftId === filters.shift) &&
      (!filters.production || p.id === filters.production),
  );
  const inHour = (hour: number) =>
    (!filters.hourFrom || hour >= Number(filters.hourFrom)) &&
    (!filters.hourTo || hour <= Number(filters.hourTo));
  const buckets = new Map<number, HourCount>();
  productions.forEach((p) =>
    p.hourly
      .filter((r) => inHour(r.hour))
      .forEach((r) => {
        const old = buckets.get(r.hour) ?? { hour: r.hour, input: 0, output: 0 };
        buckets.set(r.hour, {
          hour: r.hour,
          input: old.input + r.input,
          output: old.output + r.output,
        });
      }),
  );
  const hourly = [...buckets.values()].sort((a, b) => a.hour - b.hour);
  const selectedDiscards = discards.filter(
    (d) =>
      d.status !== 'voided' &&
      productions.some((p) => p.id === d.productionId) &&
      (!filters.reason || d.reasonId === filters.reason) &&
      dateKey(d.createdAt) >= filters.from &&
      dateKey(d.createdAt) <= filters.to &&
      inHour(hourOf(d.createdAt)),
  );
  const totals = productions.reduce(
    (a, p) => ({
      input: a.input + p.input,
      output: a.output + p.output,
      loss: a.loss + p.input - p.output,
    }),
    { input: 0, output: 0, loss: 0 },
  );
  const selectedInput = hourly.reduce((a, r) => a + r.input, 0);
  const selectedOutput = hourly.reduce((a, r) => a + r.output, 0);
  const rejected = selectedDiscards.reduce((a, d) => a + d.quantity, 0);
  const reasonRows = data.reasons
    .map((r) => ({
      name: r.name,
      quantity: selectedDiscards
        .filter((d) => d.reasonId === r.id)
        .reduce((a, d) => a + d.quantity, 0),
    }))
    .filter((r) => r.quantity > 0);
  const detail = productions.find((p) => p.id === detailId);
  const hoursRestricted = filters.hourFrom !== '' || filters.hourTo !== '';
  return (
    <>
      <PageHeading
        eyebrow="HISTÓRICO E INDICADORES"
        title="Relatórios"
        description="Transforme o histórico de produção em uma visão clara da operação."
      />
      <Panel
        title="Filtrar resultados"
        subtitle="A consulta considera produções encerradas, pela data de início."
        action={<Filter size={20} className="muted" />}
      >
        <form onSubmit={apply}>
          <div className="filters-grid">
            <label className="field">
              Período
              <select value={draft.mode} onChange={(e) => change('mode', e.target.value)}>
                <option value="range">Intervalo de datas</option>
                <option value="day">Dia específico</option>
              </select>
            </label>
            <label className="field">
              {draft.mode === 'day' ? 'Dia' : 'Data inicial'}
              <input
                type="date"
                required
                value={draft.from}
                onChange={(e) => change('from', e.target.value)}
              />
            </label>
            {draft.mode === 'range' && (
              <label className="field">
                Data final
                <input
                  type="date"
                  required
                  value={draft.to}
                  onChange={(e) => change('to', e.target.value)}
                />
              </label>
            )}
            <label className="field">
              Turno
              <select value={draft.shift} onChange={(e) => change('shift', e.target.value)}>
                <option value="">Todos os turnos</option>
                {data.shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Produção
              <select
                value={draft.production}
                onChange={(e) => change('production', e.target.value)}
              >
                <option value="">Todas as encerradas</option>
                {data.productions
                  .filter((p) => p.status === 'closed')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field">
              Motivo de descarte
              <select value={draft.reason} onChange={(e) => change('reason', e.target.value)}>
                <option value="">Todos os motivos</option>
                {data.reasons.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Hora inicial
              <select value={draft.hourFrom} onChange={(e) => change('hourFrom', e.target.value)}>
                <option value="">Todas</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')}h
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Hora final
              <select value={draft.hourTo} onChange={(e) => change('hourTo', e.target.value)}>
                <option value="">Todas</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')}h
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setDraft(defaultFilters);
                setFilters(defaultFilters);
              }}
            >
              <RotateCcw size={15} />
              Limpar filtros
            </button>
            <button className="button primary" type="submit">
              <Filter size={16} />
              Aplicar filtros
            </button>
          </div>
        </form>
      </Panel>
      <div className="active-filters">
        <span>Filtros aplicados:</span>
        <Badge tone="blue">
          {filters.from} → {filters.to}
        </Badge>
        <Badge>
          {filters.shift
            ? data.shifts.find((s) => s.id === filters.shift)?.name
            : 'Todos os turnos'}
        </Badge>
        <Badge>{filters.production || 'Todas as encerradas'}</Badge>
        <Badge>
          {filters.reason
            ? data.reasons.find((r) => r.id === filters.reason)?.name
            : 'Todos os motivos'}
        </Badge>
        {hoursRestricted && (
          <Badge>
            {filters.hourFrom || '0'}h–{filters.hourTo || '23'}h
          </Badge>
        )}
      </div>
      {!productions.length ? (
        <Empty
          title="Nenhuma produção neste filtro"
          description="Altere o período ou os filtros para consultar outros ciclos."
        />
      ) : (
        <>
          <div className="stats-grid">
            <Stat
              label="Entrada no horário"
              value={number(selectedInput)}
              note="Eventos nos horários selecionados"
              icon={<ArrowDownToLine size={19} />}
            />
            <Stat
              label="Saída no horário"
              value={number(selectedOutput)}
              note="Eventos nos horários selecionados"
              icon={<ArrowUpFromLine size={19} />}
            />
            <Stat
              label="Perdas consolidadas E1"
              value={number(totals.loss)}
              note="Ciclos completos · não filtradas por hora"
              icon={<Layers size={19} />}
            />
            <Stat
              label="Descartes no filtro"
              value={number(rejected)}
              note="Por motivo, data e hora selecionados"
              icon={<ScanLine size={19} />}
            />
          </div>
          <Notice>
            O filtro de hora afeta o fluxo e os descartes. Perdas E1, aproveitamento e ociosidade
            usam o ciclo completo; o motivo afeta somente os descartes.
          </Notice>
          <div className="dashboard-grid">
            <Panel
              title="Produção por hora"
              subtitle="Somatório dos eventos no intervalo de horas selecionado"
            >
              <FlowChart rows={hourly} />
            </Panel>
            <Panel title="Descartes por motivo" subtitle="Lançamentos das produções selecionadas">
              <ReasonChart rows={reasonRows} />
            </Panel>
          </div>
          <Panel
            title="Produções encerradas"
            subtitle={`${productions.length} ciclos · totais completos por produção`}
            action={
              <Badge tone="blue">
                Aproveitamento geral:{' '}
                {percent(totals.input ? (totals.output / totals.input) * 100 : null)}
              </Badge>
            }
          >
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Produção</th>
                    <th>Data</th>
                    <th>Entrada / saída</th>
                    <th>Perdas E1</th>
                    <th>Aproveitamento</th>
                    <th>Ociosidade</th>
                    <th>
                      <span className="sr-only">Detalhes</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productions.map((p) => {
                    const m = metrics(p, discards);
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          <small>{p.id}</small>
                        </td>
                        <td>{date(p.startedAt)}</td>
                        <td>
                          {number(p.input)} / {number(p.output)}
                        </td>
                        <td>{number(m.loss!)}</td>
                        <td>{percent(m.yield)}</td>
                        <td>
                          {Math.round(m.idleSeconds / 60)}min<small>{m.idleCount} períodos</small>
                        </td>
                        <td>
                          <button className="button table-button" onClick={() => setDetailId(p.id)}>
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
      {detail && (
        <Modal title="Métricas do ciclo completo" onClose={() => setDetailId(null)}>
          <ProductionSummary production={detail} discards={discards} />
        </Modal>
      )}
    </>
  );
}
