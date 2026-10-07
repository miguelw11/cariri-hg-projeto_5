# Sistema de Monitoramento de Perdas da Esteira E1
## RAFAEL ESTEVE AQUI

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

Durante uma produção ativa, a diferença entre entrada e saída será apresentada como:

```text
Diferença momentânea
```

Ela não deverá ser considerada perda definitiva enquanto existirem produtos percorrendo a E1.

A perda será consolidada somente após o encerramento da produção e a confirmação de que a esteira não possui mais produtos em processamento.

---

## Detecção de ociosidade

Durante uma produção ativa, o sistema acompanhará o tempo transcorrido desde os últimos eventos dos sensores.

Caso nenhum evento seja registrado durante um intervalo configurado, o sistema poderá classificar o período como **ociosidade da produção**.

Quando um novo evento ocorrer, o período será encerrado e armazenado.

Entre as métricas previstas estão:

- tempo total ativo;
- tempo total ocioso;
- quantidade de períodos ociosos;
- maior período de ociosidade;
- percentual de ociosidade.

O limite utilizado para determinar ociosidade deverá ser configurável.

---

# Comunicação e contingência

A solução possuirá três níveis de comunicação e proteção dos dados.

### 1. Wi-Fi + MQTT

Canal principal utilizado pelos nós de sensoriamento.

```text
Sensor
   ↓
ESP32-S3
   ↓
Wi-Fi / MQTT
   ↓
Servidor
```

### 2. LoRa

Caso o canal principal esteja indisponível, os eventos serão transmitidos através de LoRa.

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

O gateway LoRa ficará conectado diretamente ao notebook utilizado como servidor.

### 3. Local

Caso Wi-Fi e LoRa estejam indisponíveis simultaneamente, os eventos permanecerão armazenados localmente no nó de sensoriamento.

A utilização de cartão microSD está prevista para essa finalidade, mas a implementação definitiva ainda será validada durante o desenvolvimento.

Quando algum canal voltar a ficar disponível, os eventos pendentes deverão ser sincronizados.

Mais detalhes sobre MQTT, LoRa, sincronização e tratamento de falhas estão disponíveis em:

➡️ [`docs/comunicacao/README.md`](docs/comunicacao/README.md)

---

## Identificação e deduplicação

Cada evento deverá possuir um identificador único.

O mesmo identificador será mantido independentemente de o evento chegar através de:

- MQTT;
- LoRa;
- sincronização posterior.

Dessa maneira, o backend poderá impedir que o mesmo evento seja contabilizado mais de uma vez.

---

# Aplicação Web Integrada

A solução utilizará **uma única aplicação web**, dividida em módulos/páginas.

```text
/
├── /dashboard
├── /producao
├── /relatorios
├── /dispositivos
├── /configuracoes
└── /totem
```

### Dashboard

Acompanhamento da produção em tempo real.

### Produção

Início, acompanhamento e encerramento das produções.

### Relatórios

Consulta de métricas e dados históricos.

### Dispositivos

Monitoramento dos sensores, ESP32-S3, gateway e canais de comunicação.

### Configurações

Parâmetros como turnos, motivos de descarte e limite de ociosidade.

### Totem

Interface simplificada utilizada pela funcionária para registrar descartes.

Embora faça parte da mesma aplicação web, o módulo Totem terá comportamento próprio e poderá ser instalado como **PWA** no tablet.

Caso perca a comunicação com o servidor, deverá continuar permitindo registros localmente e realizar a sincronização posteriormente.

Mais detalhes sobre páginas, organização interna, PWA e armazenamento local:

➡️ [`frontend/README.md`](frontend/README.md)

---

# Relatórios e métricas

A aplicação permitirá consultar informações históricas utilizando filtros como:

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

A perda definitiva da E1 continuará sendo calculada por produção encerrada, evitando interpretar incorretamente diferenças entre entrada e saída em intervalos horários isolados.

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

A documentação detalhada da arquitetura está disponível em:

➡️ [`docs/arquitetura/README.md`](docs/arquitetura/README.md)

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

A documentação técnica foi separada por responsabilidade para manter este README focado na visão geral do projeto.

```text
docs/
├── requisitos/
│   ├── funcionais.md
│   └── naofuncionais.md
├── arquitetura/
│   └── README.md
├── hardware/
│   └── README.md
├── comunicacao/
│   └── README.md
├── testes/
│   └── README.md
└── imagens/
    └── README.md
```

Também existem documentações específicas nos principais módulos:

```text
frontend/README.md
backend/README.md
firmware/README.md
database/README.md
```

---

# Estrutura inicial do repositório

```text
monitoramento-e1/
│
├── README.md
│
├── frontend/
│   └── README.md
│
├── backend/
│   └── README.md
│
├── firmware/
│   ├── README.md
│   ├── sensor-entrada/
│   ├── sensor-saida/
│   └── gateway-lora/
│
├── database/
│   └── README.md
│
├── docs/
│   ├── requisitos/
│   ├── arquitetura/
│   ├── hardware/
│   ├── comunicacao/
│   ├── testes/
│   └── imagens/
│
├── .gitignore
├── .env.example
└── docker-compose.yml
```

A estrutura detalhada de cada módulo está documentada no respectivo `README.md`.

---

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
   - Totem;
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