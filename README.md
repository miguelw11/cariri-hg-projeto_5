# Sistema de Monitoramento de Perdas da Esteira E1

Sistema desenvolvido para monitorar, em tempo real, a movimentação e as perdas de pares de solados durante o processo produtivo da esteira **E1**.

A solução integra sensoriamento automático, registro manual de descartes, comunicação redundante, armazenamento local e uma **aplicação web única**, responsável pelo monitoramento, operação, relatórios e registro dos descartes realizados antes da esteira.

---

## Contexto

A empresa possui duas esteiras principais:

- **E1:** etapa de produção/processamento dos pares de solados;
- **E2:** etapa posterior, responsável pela colocação das correias.

O projeto terá como foco inicial a **esteira E1**, por ser a etapa de interesse em relação às perdas observadas durante o processo.

Antes da entrada na E1, uma funcionária realiza manualmente a triagem dos pares de solados. Produtos considerados inadequados são descartados antes de entrarem na esteira.

Os produtos aprovados passam por um primeiro ponto de contagem e, após percorrerem a E1, passam por um segundo ponto de contagem.

O sistema permitirá acompanhar:

- descartes realizados na triagem;
- produtos enviados para a E1;
- produtos que concluíram a E1;
- perdas identificadas durante o percurso;
- aproveitamento da E1;
- períodos de ociosidade;
- estado dos dispositivos;
- estado dos canais de comunicação;
- métricas e relatórios históricos.

---

## Objetivo

Desenvolver um sistema capaz de monitorar, registrar e apresentar em tempo real os dados relacionados à produção e às perdas da esteira E1.

A solução deverá continuar transmitindo os eventos dos sensores mesmo durante falhas temporárias do Wi-Fi, utilizando LoRa como canal de contingência e armazenamento local como última camada de proteção.

---

## Funcionamento

```text
                PRODUTOS DISPONÍVEIS
                        │
                        ▼
                    TRIAGEM
                  Funcionária
                        │
              ┌─────────┴─────────┐
              │                   │
          DESCARTADO           APROVADO
              │                   │
              ▼                   ▼
            TOTEM           SENSOR INICIAL
                              E18-D80NK
                                  │
                                  ▼
                              ESTEIRA E1
                                  │
                                  ▼
                             SENSOR FINAL
                              E18-D80NK
                                  │
                                  ▼
                         PRODUTO FINALIZADO
```

### Triagem

Os produtos rejeitados pela funcionária serão registrados através do módulo **Totem** da aplicação web.

Cada registro deverá conter, no mínimo:

- motivo;
- quantidade;
- produção;
- data e horário.

A quantidade total originalmente recebida pela funcionária não é conhecida. Portanto, os descartes da triagem serão tratados como um indicador independente.

### Contagem da E1

Serão utilizados dois sensores **E18-D80NK**:

- um no início da E1;
- um no final da E1.

Cada sensor será associado a um ESP32-S3 com Wi-Fi e LoRa.

```text
Entrada E1 = eventos válidos do sensor inicial

Saída E1 = eventos válidos do sensor final
```

### Perdas da E1

Após o encerramento da produção:

```text
Perdas E1 = Entrada E1 - Saída E1
```

O sistema não tentará identificar automaticamente o motivo dessas perdas.

### Perdas observadas

```text
Perdas observadas =
Descartes da triagem + Perdas E1
```

Esse valor não representa necessariamente as perdas de um lote original, pois a quantidade inicialmente recebida pela funcionária não é conhecida.

---

## Produção em andamento

Durante uma produção ativa, a diferença entre entrada e saída será apresentada apenas como:

```text
Diferença momentânea
```

Ela não deverá ser considerada perda definitiva enquanto existirem produtos percorrendo a E1.

A perda será consolidada somente após o encerramento da produção e a confirmação de que a esteira não possui mais produtos em processamento.

---

## Detecção de ociosidade

Durante uma produção ativa, o sistema deverá acompanhar o tempo transcorrido desde os últimos eventos dos sensores.

Caso nenhum evento seja registrado durante um intervalo configurado, o sistema poderá classificar o período como **ociosidade da produção**.

Quando um novo evento ocorrer, o período de ociosidade será encerrado e registrado.

Esses dados poderão ser utilizados para calcular métricas como:

- tempo total ativo;
- tempo total ocioso;
- quantidade de períodos ociosos;
- maior período de ociosidade;
- percentual de ociosidade.

O tempo limite utilizado para determinar ociosidade deverá ser configurável.

---

# Comunicação e contingência

A solução possuirá três níveis.

## 1. Wi-Fi + MQTT

Canal principal de comunicação.

```text
Sensor
   ↓
ESP32-S3
   ↓
Wi-Fi
   ↓
MQTT
   ↓
Servidor
```

## 2. LoRa

Quando o canal principal estiver indisponível, os eventos serão transmitidos através de LoRa.

```text
Sensor
   ↓
ESP32-S3
   ↓
LoRa
   ↓
ESP32-S3 Gateway
   ↓
USB / Serial
   ↓
Servidor
```

O gateway ficará conectado fisicamente ao notebook utilizado como servidor principal.

## 3. Local

Caso Wi-Fi e LoRa estejam indisponíveis simultaneamente, os eventos deverão permanecer armazenados localmente no nó de sensoriamento.

A utilização de cartão microSD está prevista para essa finalidade, mas o mecanismo definitivo de armazenamento ainda será validado durante o desenvolvimento.

Quando algum canal voltar a ficar disponível, os registros pendentes deverão ser sincronizados.

---

## Identificação e deduplicação

Cada evento deverá possuir um identificador único.

O mesmo identificador será mantido independentemente de o evento chegar através de:

- MQTT;
- LoRa;
- sincronização posterior.

O backend deverá verificar esse identificador para impedir contagens duplicadas.

---

# Aplicação Web Integrada

A solução utilizará **uma única aplicação web**, dividida em módulos/páginas.

Exemplo inicial:

```text
/
├── /dashboard
├── /producao
├── /relatorios
├── /dispositivos
├── /configuracoes
└── /totem
```

Embora façam parte da mesma aplicação, cada área possuirá uma finalidade diferente.

### Dashboard

Acompanhamento da produção em tempo real.

### Produção

Início, acompanhamento e encerramento das produções.

### Relatórios

Consulta de métricas e dados históricos.

### Dispositivos

Monitoramento dos sensores, ESP32-S3, gateway e canais de comunicação.

### Configurações

Parâmetros do sistema, como turnos, motivos de descarte e limite de ociosidade.

### Totem

Interface simplificada utilizada pela funcionária para registrar descartes.

A página do totem poderá ser instalada como **PWA**, permitindo uma experiência semelhante a um aplicativo independente.

---

## Funcionamento local do Totem

Caso o tablet perca comunicação com o servidor, o módulo Totem deverá continuar permitindo registros.

Os dados serão armazenados localmente no dispositivo e sincronizados quando a comunicação for restabelecida.

Exemplo:

```text
Wi-Fi disponível
      ↓
Totem → API → Banco

Wi-Fi indisponível
      ↓
Totem → armazenamento local
      ↓
Wi-Fi retorna
      ↓
Sincronização → API → Banco
```

O LoRa será utilizado inicialmente apenas pelos pontos de sensoriamento.

---

# Relatórios e métricas

A aplicação deverá permitir consultar informações históricas utilizando filtros como:

- dia;
- intervalo de datas;
- turno;
- hora;
- produção;
- motivo de descarte.

Entre as métricas previstas estão:

- entrada de produtos;
- saída de produtos;
- produção por hora;
- descartes por motivo;
- aproveitamento da E1;
- tempo ativo;
- tempo ocioso;
- quantidade de períodos ociosos;
- histórico das produções.

A perda definitiva da E1 continuará sendo calculada por produção encerrada.

---

# Arquitetura

```text
E18-D80NK                         E18-D80NK
 Entrada                             Saída
    │                                  │
    ▼                                  ▼
ESP32-S3                          ESP32-S3
Wi-Fi + LoRa                      Wi-Fi + LoRa
    │  │                              │  │
    │  └────────── LoRa ──────┐       │  │
    │                         │       │  │
    └──── MQTT ──────┐        │       └──┤
                     │        ▼          │
                     │   Gateway LoRa    │
                     │     ESP32-S3      │
                     │        │          │
                     │     USB/Serial    │
                     │        │          │
                     └────────┼──────────┘
                              ▼
                           NOTEBOOK
                              │
              ┌───────────────┼────────────────┐
              │               │                │
          MQTT Broker      Backend/API     PostgreSQL
                              │                │
                              └───────┬────────┘
                                      ▼
                             Aplicação Web
                                      │
            ┌────────┬────────┬───────┼────────┐
            ▼        ▼        ▼       ▼        ▼
        Dashboard Produção Relatórios Totem Dispositivos
```

---

## Tecnologias previstas

| Componente | Tecnologia |
|---|---|
| Sensor | E18-D80NK |
| Microcontroladores | ESP32-S3 LoRa/Wi-Fi |
| Comunicação principal | Wi-Fi + MQTT |
| Contingência | LoRa |
| Armazenamento local | microSD / mecanismo a definir |
| Gateway | ESP32-S3 LoRa via USB/Serial |
| Backend | Python + FastAPI |
| Banco | PostgreSQL |
| Frontend | React + Vite |
| Tempo real Web | WebSocket |
| Totem | Módulo Web/PWA |
| Dashboard | Aplicação própria |
| Servidor | Notebook |
| Versionamento | Git |

---

# Requisitos

## Requisitos funcionais

➡️ [`docs/requisitos/funcionais.md`](docs/requisitos/funcionais.md)

## Requisitos não funcionais

➡️ [`docs/requisitos/naofuncionais.md`](docs/requisitos/naofuncionais.md)

---

# Documentação

```text
docs/
│
├── requisitos/
│   ├── funcionais.md
│   └── naofuncionais.md
│
├── arquitetura/
│   └── README.md
│
├── hardware/
│   └── README.md
│
├── comunicacao/
│   └── README.md
│
├── testes/
│   └── README.md
│
└── imagens/
```

---

# Estrutura inicial do repositório

A estrutura abaixo representa uma organização inicial do projeto. Ela poderá ser ajustada conforme o desenvolvimento evoluir.

```text
monitoramento-e1/
│
├── README.md
│
├── frontend/
│   ├── public/
│   │   ├── icons/
│   │   └── manifest.webmanifest
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   ├── cards/
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Production/
│   │   │   ├── Reports/
│   │   │   ├── Devices/
│   │   │   ├── Settings/
│   │   │   └── Totem/
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── websocket.ts
│   │   │   ├── storage.ts
│   │   │   └── sync.ts
│   │   │
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── routes/
│   │   │   └── index.tsx
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── production.py
│   │   │   ├── losses.py
│   │   │   ├── reports.py
│   │   │   ├── devices.py
│   │   │   └── settings.py
│   │   │
│   │   ├── models/
│   │   │   ├── production.py
│   │   │   ├── sensor_event.py
│   │   │   ├── manual_loss.py
│   │   │   ├── device.py
│   │   │   ├── idle_period.py
│   │   │   └── shift.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── production.py
│   │   │   ├── sensor_event.py
│   │   │   ├── loss.py
│   │   │   └── report.py
│   │   │
│   │   ├── services/
│   │   │   ├── production_service.py
│   │   │   ├── loss_service.py
│   │   │   ├── report_service.py
│   │   │   ├── idle_service.py
│   │   │   └── sync_service.py
│   │   │
│   │   ├── mqtt/
│   │   │   ├── client.py
│   │   │   └── handlers.py
│   │   │
│   │   ├── gateway/
│   │   │   └── serial_reader.py
│   │   │
│   │   ├── websocket/
│   │   │   └── manager.py
│   │   │
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── session.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   │
│   │   └── utils/
│   │
│   ├── tests/
│   │   ├── test_production.py
│   │   ├── test_events.py
│   │   ├── test_reports.py
│   │   └── test_sync.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── firmware/
│   ├── sensor-entrada/
│   │   ├── src/
│   │   └── README.md
│   │
│   ├── sensor-saida/
│   │   ├── src/
│   │   └── README.md
│   │
│   └── gateway-lora/
│       ├── src/
│       └── README.md
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── schema.sql
│   └── README.md
│
├── docs/
│   ├── requisitos/
│   │   ├── funcionais.md
│   │   └── naofuncionais.md
│   │
│   ├── arquitetura/
│   │   └── README.md
│   │
│   ├── hardware/
│   │   └── README.md
│   │
│   ├── comunicacao/
│   │   └── README.md
│   │
│   ├── testes/
│   │   └── README.md
│   │
│   └── imagens/
│
├── .gitignore
├── .env.example
└── docker-compose.yml
```

---

## Organização do Frontend

O diretório `frontend/` concentra toda a **Aplicação Web Integrada**.

### `pages/`

Contém as páginas principais:

- `Dashboard/` — monitoramento da produção em tempo real;
- `Production/` — início, acompanhamento e encerramento das produções;
- `Reports/` — métricas, gráficos e filtros;
- `Devices/` — sensores, ESP32-S3, gateway e canais de comunicação;
- `Settings/` — configurações do sistema;
- `Totem/` — registro dos descartes realizados na triagem.

### `components/`

Contém elementos reutilizáveis entre as páginas, como:

- cards de indicadores;
- gráficos;
- formulários;
- tabelas;
- menus;
- indicadores de status;
- componentes de filtros.

### `services/`

Centraliza a comunicação e persistência utilizadas pelo frontend.

#### `api.ts`

Responsável pelas requisições HTTP feitas ao backend.

Exemplo:

```text
Frontend
   ↓
api.ts
   ↓
FastAPI
```

#### `websocket.ts`

Responsável pelas atualizações em tempo real recebidas do backend.

Será utilizado principalmente em páginas como:

```text
/dashboard
/dispositivos
/producao
```

#### `storage.ts`

Responsável pelo armazenamento local no navegador.

Será especialmente importante para o módulo Totem quando houver indisponibilidade temporária da comunicação com o servidor.

Inicialmente, o armazenamento poderá utilizar tecnologias como `IndexedDB`.

Exemplo:

```text
Funcionária registra descarte
          ↓
Servidor indisponível
          ↓
storage.ts
          ↓
IndexedDB
```

#### `sync.ts`

Responsável por sincronizar registros locais que ainda não foram enviados ao servidor.

Fluxo esperado:

```text
Registro local
     ↓
Wi-Fi retorna
     ↓
sync.ts
     ↓
API
     ↓
Backend
     ↓
PostgreSQL
```

Cada registro deverá possuir um identificador único para impedir duplicações durante a sincronização.

---

## PWA

O módulo Totem deverá ser preparado para funcionar como uma **Progressive Web App (PWA)**.

O arquivo:

```text
public/manifest.webmanifest
```

será responsável por configurações relacionadas à instalação da aplicação no dispositivo, como:

- nome da aplicação;
- ícones;
- modo de exibição;
- página inicial.

Exemplo de uso:

```text
Tablet

[ Monitoramento E1 ]
        ↓
abre diretamente
        ↓
/totem
```

A aplicação também deverá possuir suporte a Service Worker para permitir o carregamento da interface mesmo durante indisponibilidades temporárias da rede.

A configuração da PWA poderá ser realizada através do próprio Vite e de ferramentas compatíveis com ele.

---

## `hooks/`

Armazena hooks reutilizáveis da aplicação React.

Exemplos futuros:

```text
useProduction()
useDevices()
useWebSocket()
useConnectionStatus()
```

---

## `contexts/`

Responsável por estados que precisam ser compartilhados entre diferentes páginas.

Exemplos:

- produção ativa;
- estado da conexão;
- informações do usuário;
- configurações gerais.

---

## `routes/`

Centraliza as rotas da aplicação.

Exemplo:

```text
/dashboard
/producao
/relatorios
/dispositivos
/configuracoes
/totem
```

---

## Organização do Backend

O diretório `backend/` concentra as regras de negócio, APIs e integração entre os diferentes componentes do projeto.

### `api/`

Contém os endpoints disponibilizados pelo FastAPI.

Exemplos:

```text
/api/production
/api/losses
/api/reports
/api/devices
/api/settings
```

---

### `models/`

Representa as entidades armazenadas no banco de dados.

Exemplos:

- produção;
- evento de sensor;
- descarte;
- dispositivo;
- período de ociosidade;
- turno.

---

### `schemas/`

Define as estruturas utilizadas para entrada e saída de dados da API.

Essa separação evita utilizar diretamente os modelos do banco como contrato da API.

---

### `services/`

Concentra as principais regras de negócio do sistema.

Exemplos:

- cálculo das perdas;
- cálculo do aproveitamento;
- encerramento da produção;
- detecção de ociosidade;
- geração de métricas;
- sincronização de eventos;
- tratamento de registros pendentes.

---

### `mqtt/`

Responsável pela comunicação com os ESP32-S3 através do canal principal.

Fluxo:

```text
ESP32-S3
   ↓
MQTT
   ↓
mqtt/handlers.py
   ↓
services/
   ↓
PostgreSQL
```

---

### `gateway/`

Responsável pela comunicação com o ESP32-S3 utilizado como gateway LoRa.

O gateway ficará conectado ao notebook através de USB/Serial.

Fluxo:

```text
ESP32-S3 Sensor
      ↓
     LoRa
      ↓
ESP32-S3 Gateway
      ↓
USB / Serial
      ↓
serial_reader.py
      ↓
Backend
```

O backend deverá tratar eventos provenientes do MQTT e do gateway de forma equivalente.

---

### `websocket/`

Responsável pela comunicação em tempo real entre backend e aplicação web.

Exemplo:

```text
Sensor registra passagem
        ↓
Backend processa
        ↓
WebSocket
        ↓
Dashboard atualiza
```

---

### `database/`

Contém a configuração utilizada pelo backend para acessar o PostgreSQL.

```text
connection.py
session.py
```

Esse diretório não substitui o diretório `database/` localizado na raiz do projeto.

O diretório da raiz concentra elementos estruturais do banco, como:

- migrations;
- seeds;
- schema.

---

### `core/`

Contém configurações gerais do backend.

Exemplos:

- variáveis de ambiente;
- configuração da aplicação;
- logging;
- parâmetros gerais.

---

## Testes automatizados

O diretório:

```text
backend/tests/
```

será utilizado para testes automatizados.

Inicialmente poderão existir:

```text
test_production.py
test_events.py
test_reports.py
test_sync.py
```

Entre os cenários importantes estão:

- cálculo correto das perdas;
- deduplicação de eventos;
- sincronização após falha;
- filtros dos relatórios;
- encerramento de produção;
- cálculo da ociosidade.

---

## Variáveis de ambiente

Frontend e backend deverão possuir arquivos:

```text
.env.example
```

contendo apenas os nomes das configurações necessárias, sem informações sensíveis.

Exemplo no backend:

```text
DATABASE_URL=
MQTT_HOST=
MQTT_PORT=
SERIAL_PORT=
```

Exemplo no frontend:

```text
VITE_API_URL=
VITE_WS_URL=
```

Os arquivos `.env` reais não deverão ser versionados.

---

## Docker Compose

O arquivo:

```text
docker-compose.yml
```

fica previsto para facilitar a configuração do ambiente local.

Ele poderá ser utilizado posteriormente para iniciar serviços como:

```text
PostgreSQL
Mosquitto
Backend
```

O uso de Docker **não será obrigatório nas primeiras etapas do desenvolvimento**.

A equipe poderá iniciar os componentes diretamente no notebook e adotar Docker quando a infraestrutura estiver mais estável.

---

## Criação das pastas

A estrutura apresentada representa o formato desejado do projeto, mas não existe necessidade de criar todas as pastas vazias imediatamente.

A recomendação é iniciar com os diretórios necessários para cada etapa e expandir conforme as funcionalidades forem implementadas.

Por exemplo:

```text
frontend/
├── src/
│   ├── pages/
│   ├── components/
│   └── services/
└── package.json

backend/
├── app/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── database/
└── requirements.txt
```

As demais estruturas deverão ser adicionadas conforme o projeto evoluir.

# Equipe

O desenvolvimento será dividido inicialmente em quatro frentes:

1. **Hardware e IoT**
   - E18-D80NK;
   - ESP32-S3;
   - LoRa;
   - armazenamento local;
   - firmware.

2. **Backend e comunicação**
   - MQTT;
   - gateway serial;
   - FastAPI;
   - deduplicação;
   - sincronização;
   - regras de negócio.

3. **Frontend**
   - aplicação web;
   - dashboard;
   - produção;
   - totem;
   - dispositivos.

4. **Dados, relatórios e integração**
   - PostgreSQL;
   - métricas;
   - filtros;
   - ociosidade;
   - relatórios;
   - testes.

---

## Status

> Projeto em fase de desenvolvimento e validação do protótipo.

**Residência PNAAT**