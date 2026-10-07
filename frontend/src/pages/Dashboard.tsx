import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, Layers, ScanLine } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Badge, Empty, PageHeading, Panel, Stat } from '../components/ui';
import { FlowChart } from '../components/Charts';
import { date, duration, metrics, number, percent, time } from '../utils/metrics';

export function Dashboard() {
  const { data, active, discards } = useApp();
  const production = active ?? data.productions[0];

  if (!production) {
    return (
      <>
        <PageHeading eyebrow="ESTEIRA E1" title="Dashboard" description="Acompanhe a produção." />
        <Empty
          title="Nenhuma produção iniciada"
          description="Inicie uma produção para acompanhar os números."
        >
          <Link to="/producao" className="button primary">
            Iniciar produção
            <ArrowRight size={17} />
          </Link>
        </Empty>
      </>
    );
  }

  const m = metrics(production, discards);
  const closed = production.status === 'closed';
  const reasons = data.reasons
    .map((r) => ({
      id: r.id,
      name: r.name,
      quantity: discards
        .filter(
          (d) => d.productionId === production.id && d.reasonId === r.id && d.status !== 'voided',
        )
        .reduce((a, d) => a + d.quantity, 0),
    }))
    .filter((r) => r.quantity > 0);

  return (
    <>
      <PageHeading
        eyebrow="ESTEIRA E1"
        title="Dashboard"
        description="Acompanhe a produção."
        action={
          <Link to="/producao" className="button secondary">
            Ver produção
            <ArrowRight size={17} />
          </Link>
        }
      />
      <section className="current-production" aria-label="Produção selecionada">
        <div>
          <span>{closed ? 'Última produção' : 'Produção atual'}</span>
          <h2>{production.name}</h2>
          <p>
            {date(production.startedAt)} ·{' '}
            {data.shifts.find((s) => s.id === production.shiftId)?.name} · Início{' '}
            {time(production.startedAt)}
          </p>
        </div>
        <Badge tone={closed ? 'neutral' : production.status === 'closing' ? 'warning' : 'success'}>
          {closed ? 'Encerrada' : production.status === 'closing' ? 'Encerrando' : 'Em produção'}
        </Badge>
      </section>
      <div className="stats-grid dashboard-stats">
        <Stat
          label="Entrada"
          value={number(production.input)}
          note="Pares que entraram na E1"
          icon={<ArrowDownToLine size={20} />}
          accent
        />
        <Stat
          label="Saída"
          value={number(production.output)}
          note="Pares que saíram da E1"
          icon={<ArrowUpFromLine size={20} />}
        />
        <Stat
          label={closed ? 'Perdas na E1' : 'Diferença atual'}
          value={number(closed ? m.loss! : m.difference)}
          note={closed ? 'Após o encerramento' : 'Ainda não é perda definitiva'}
          icon={<Layers size={20} />}
        />
        <Stat
          label="Descartes"
          value={number(m.rejected)}
          note="Pares descartados na triagem"
          icon={<ScanLine size={20} />}
        />
      </div>
      {!closed && (
        <p className="dashboard-explanation">
          A diferença entre entrada e saída só será considerada perda depois de encerrar a produção
          e confirmar que a esteira está vazia.
        </p>
      )}
      <div className="dashboard-grid dashboard-simple">
        <Panel title="Produção por hora" subtitle="Entrada e saída">
          <FlowChart rows={[...production.hourly].sort((a, b) => a.hour - b.hour)} />
        </Panel>
        <Panel title="Resumo">
          <dl className="simple-summary">
            <div>
              <dt>Aproveitamento{!closed && <small>Parcial</small>}</dt>
              <dd>{percent(m.yield)}</dd>
            </div>
            <div>
              <dt>Tempo em atividade</dt>
              <dd>{duration(m.activeSeconds)}</dd>
            </div>
            <div>
              <dt>Tempo parado</dt>
              <dd>{duration(m.idleSeconds)}</dd>
            </div>
            <div>
              <dt>Paradas</dt>
              <dd>{m.idleCount}</dd>
            </div>
          </dl>
          <Link className="panel-link" to="/relatorios">
            Ver relatórios
            <ArrowRight size={16} />
          </Link>
        </Panel>
      </div>
      <Panel
        title="Descartes da triagem"
        action={
          <Link className="button secondary" to="/totem">
            Registrar descarte
            <ArrowRight size={16} />
          </Link>
        }
      >
        {reasons.length ? (
          <ul className="discard-summary">
            {reasons.map((r) => (
              <li key={r.id}>
                <span>{r.name}</span>
                <strong>
                  {number(r.quantity)} <small>pares</small>
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nenhum descarte nesta produção.</p>
        )}
      </Panel>
    </>
  );
}
