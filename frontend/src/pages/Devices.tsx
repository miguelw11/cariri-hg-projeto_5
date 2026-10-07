import { Cable, Clock3, Database, Radio, Wifi } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Badge, Notice, PageHeading, Panel } from '../components/ui';
import { date, number, time } from '../utils/metrics';
export function Devices() {
  const { devices } = useApp();
  return (
    <>
      <PageHeading
        eyebrow="INFRAESTRUTURA E COMUNICAÇÃO"
        title="Dispositivos"
        description="Acompanhe os pontos de contagem e os canais de contingência."
      />
      <Notice>
        Estados demonstrativos fixos. A conexão real e a última comunicação serão informadas pelo
        backend.
      </Notice>
      <div className="device-grid">
        {devices.map((d) => (
          <Panel
            key={d.id}
            title={d.name}
            subtitle={d.role}
            action={
              <span className="device-card-icon">
                {d.channel === 'Wi-Fi' ? <Wifi /> : d.channel === 'USB' ? <Cable /> : <Radio />}
              </span>
            }
          >
            <Badge
              tone={
                d.state === 'contingency' ? 'warning' : d.state === 'offline' ? 'danger' : 'success'
              }
            >
              {d.state === 'contingency'
                ? 'Em contingência'
                : d.state === 'offline'
                  ? 'Sem comunicação'
                  : 'Operacional'}
            </Badge>
            <dl className="device-details">
              <div>
                <dt>Identificador</dt>
                <dd>{d.id}</dd>
              </div>
              <div>
                <dt>Canal atual</dt>
                <dd>{d.channel}</dd>
              </div>
              <div>
                <dt>
                  <Clock3 size={15} />
                  Última comunicação
                </dt>
                <dd>
                  {time(d.lastSeen)}
                  <small>{date(d.lastSeen)}</small>
                </dd>
              </div>
              <div>
                <dt>
                  <Database size={15} />
                  Eventos pendentes
                </dt>
                <dd>{number(d.pending)}</dd>
              </div>
            </dl>
            {d.state === 'contingency' && (
              <p className="device-warning">
                O exemplo indica uso de LoRa enquanto o canal principal está indisponível.
              </p>
            )}
          </Panel>
        ))}
      </div>
      <Panel
        title="Como os canais se complementam"
        subtitle="A contagem usa o mesmo identificador de evento em todos os caminhos."
      >
        <div className="channels-grid">
          <div>
            <span className="channel-step">01</span>
            <Wifi />
            <h3>Wi-Fi + MQTT</h3>
            <p>Canal principal para envio dos eventos dos sensores.</p>
          </div>
          <div>
            <span className="channel-step">02</span>
            <Radio />
            <h3>LoRa</h3>
            <p>Contingência pelo gateway conectado ao servidor via USB.</p>
          </div>
          <div>
            <span className="channel-step">03</span>
            <Database />
            <h3>Local</h3>
            <p>Preserva eventos no nó até algum canal voltar a ficar disponível.</p>
          </div>
        </div>
      </Panel>
    </>
  );
}
