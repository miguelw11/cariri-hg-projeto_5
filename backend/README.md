# Backend

Backend central do Sistema de Monitoramento de Perdas da Esteira E1.

Será responsável pelas regras de negócio, API, recepção de eventos MQTT e LoRa, persistência, deduplicação, sincronização, ociosidade, relatórios e atualização do frontend.

## Tecnologia prevista

- Python
- FastAPI
- PostgreSQL
- MQTT
- WebSocket
- comunicação Serial/USB com o gateway LoRa

## Estrutura inicial

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── mqtt/
│   ├── gateway/
│   ├── websocket/
│   ├── database/
│   ├── core/
│   └── utils/
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

## Responsabilidades

### API

Endpoints previstos para:

- produções;
- descartes;
- relatórios;
- dispositivos;
- configurações;
- turnos;
- motivos de descarte.

Os caminhos definitivos ainda serão definidos.

### MQTT

Receberá os eventos transmitidos pelos nós ESP32-S3 através do canal principal Wi-Fi.

### Gateway Serial

Um serviço deverá ler os pacotes recebidos pelo ESP32-S3 gateway através da porta serial/USB e encaminhá-los ao mesmo fluxo de processamento utilizado pelo MQTT.

O backend não deverá possuir regras de negócio diferentes para um evento recebido via MQTT ou LoRa.

### Deduplicação

Todo evento de sensor deverá possuir `event_id`.

Antes de processar o evento:

```text
event_id já existe?
├── sim → ignorar nova contabilização
└── não → persistir e processar
```

### Produção

O backend deverá controlar estados como:

- produção ativa;
- encerramento solicitado;
- produção encerrada.

A modelagem definitiva dos estados ainda deverá ser validada.

### Ociosidade

Durante uma produção ativa, o backend deverá observar os eventos dos sensores.

Quando não houver eventos por um intervalo configurado:

```text
atividade
   ↓
limite sem eventos atingido
   ↓
início da ociosidade
   ↓
novo evento
   ↓
fim da ociosidade
```

A definição exata de quais eventos reiniciam o temporizador deverá ser validada durante o desenvolvimento.

### Relatórios

O backend deverá oferecer consultas capazes de alimentar filtros por:

- dia;
- intervalo;
- turno;
- hora;
- produção;
- motivo de descarte.

A perda definitiva continuará vinculada ao fechamento de uma produção, evitando usar simplesmente `entrada - saída` em janelas horárias independentes.

### WebSocket

Deverá publicar atualizações para o frontend quando ocorrerem mudanças relevantes, como:

- nova contagem;
- novo descarte;
- alteração do estado da produção;
- início/fim de ociosidade;
- mudança de estado de dispositivo.

## Variáveis de ambiente

Exemplo inicial:

```env
DATABASE_URL=
MQTT_HOST=
MQTT_PORT=
SERIAL_PORT=
SERIAL_BAUDRATE=
```

## Testes

Cenários prioritários:

- deduplicação;
- cálculo de perdas;
- fechamento de produção;
- registros de descarte;
- sincronização;
- ociosidade;
- filtros de relatório;
- MQTT;
- gateway serial.

## A definir

- ORM e estratégia de migrations;
- contrato final dos endpoints;
- autenticação e autorização;
- estados definitivos da produção;
- política de logs;
- política de retenção dos dados;
- formato final dos eventos;
- estratégia de ACK MQTT;
- protocolo serial entre gateway e notebook;
- mecanismo de health check;
- comportamento quando o gateway LoRa estiver desconectado;
- política de backup do banco;
- estratégia de deploy no notebook servidor.
