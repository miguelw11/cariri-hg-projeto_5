# Sistema de Monitoramento de Perdas da Esteira E1

Sistema desenvolvido para monitorar, em tempo real, a movimentação e as perdas de pares de solados durante o processo produtivo da esteira **E1**.

A solução combina:

- contagem automática por sensores;
- registro manual de descartes;
- comunicação principal via Wi-Fi;
- comunicação LoRa como contingência;
- armazenamento local para recuperação de falhas;
- servidor central;
- dashboard de acompanhamento.

---

## Contexto

A empresa possui duas esteiras principais:

- **E1:** etapa de produção/processamento dos pares de solados;
- **E2:** etapa posterior, responsável pela colocação das correias.

O projeto terá como foco inicial a **E1**, por ser a etapa de interesse em relação às perdas do processo.

Antes da entrada na E1, uma funcionária realiza manualmente a triagem dos pares de solados. Produtos considerados inadequados são descartados antes de entrarem na esteira.

Os produtos aprovados passam por um primeiro ponto de contagem e, ao final da E1, por um segundo ponto de contagem.

O sistema permitirá acompanhar:

- descartes realizados antes da E1;
- produtos enviados para a E1;
- produtos que concluíram o processo;
- perdas ocorridas entre os sensores;
- estado dos dispositivos;
- estado dos canais de comunicação.

---

## Objetivo

Desenvolver um sistema capaz de monitorar, registrar e apresentar em tempo real as perdas relacionadas ao processo produtivo da esteira E1.

A solução deverá continuar enviando os dados mesmo em situações de indisponibilidade temporária da rede Wi-Fi, utilizando comunicação LoRa como canal alternativo.

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

Os produtos rejeitados pela funcionária serão registrados por meio de uma aplicação disponível em um totem.

Cada registro deverá possuir, no mínimo:

- motivo;
- quantidade;
- produção;
- data e horário.

A quantidade total recebida pela funcionária não é conhecida inicialmente. Por isso, os descartes da triagem serão tratados como um indicador independente.

---

## Contagem da E1

Dois sensores **E18-D80NK** serão utilizados:

- um no início da E1;
- um no final da E1.

Cada sensor será conectado a um ESP32 responsável por detectar as passagens e transmitir os eventos.

```text
Entrada E1 = eventos válidos do sensor inicial

Saída E1 = eventos válidos do sensor final
```

---

## Perdas da E1

Depois do encerramento da produção:

```text
Perdas E1 = Entrada E1 - Saída E1
```

O sistema não buscará identificar automaticamente o motivo dessas perdas.

---

## Perdas observadas

Os descartes da triagem e as perdas da E1 poderão ser visualizados de forma consolidada:

```text
Perdas observadas =
Descartes da triagem + Perdas E1
```

Como a quantidade originalmente recebida pela funcionária não é conhecida, esse indicador não representa necessariamente todas as perdas de um lote original.

---

## Produção em andamento

Enquanto uma produção estiver ativa, a diferença entre entrada e saída não deverá ser considerada perda definitiva.

```text
Diferença momentânea =
Entrada E1 - Saída E1
```

Produtos ainda podem estar percorrendo a esteira.

A perda da E1 somente será consolidada após o encerramento da produção e a confirmação de que não existem mais produtos em processamento.

---

# Comunicação

O sistema utilizará três níveis de comunicação e segurança dos dados.

## 1. Canal principal — Wi-Fi + MQTT

Em condições normais:

```text
Sensor
   │
   ▼
ESP32
   │
   ▼
Wi-Fi
   │
   ▼
MQTT
   │
   ▼
Notebook
```

Esse será o caminho prioritário dos eventos.

---

## 2. Canal de contingência — LoRa

Caso o ESP32 não consiga transmitir pelo canal principal, ele utilizará LoRa como alternativa.

```text
Sensor
   │
   ▼
ESP32 + LoRa
   │
   ▼
  LoRa
   │
   ▼
Gateway LoRa
   │
   ▼
Notebook
```

O objetivo é manter o acompanhamento em tempo real mesmo durante falhas do Wi-Fi.

Quando a comunicação Wi-Fi/MQTT voltar, o dispositivo retorna automaticamente ao canal principal.

---

## 3. Armazenamento local

Caso Wi-Fi e LoRa estejam indisponíveis simultaneamente, o ESP32 continuará realizando a contagem e armazenará temporariamente os dados localmente.

Quando algum canal voltar a funcionar, os registros pendentes deverão ser sincronizados.

```text
Wi-Fi disponível?
      │
      ├── Sim → enviar por MQTT
      │
      └── Não
           │
           ▼
      LoRa disponível?
           │
           ├── Sim → enviar por LoRa
           │
           └── Não
                │
                ▼
         armazenar localmente
```

---

## Identificação dos eventos

Cada passagem válida deverá gerar um evento com identificador único.

Exemplo:

```json
{
  "event_id": "ENT-00001234",
  "device_id": "sensor-entrada-e1",
  "production_id": 15,
  "timestamp": "2026-10-06T14:32:10"
}
```

O mesmo `event_id` deverá ser mantido independentemente de o evento ser enviado por Wi-Fi, LoRa ou sincronização posterior.

Isso evita que um mesmo produto seja contabilizado duas vezes.

---

# Arquitetura

```text
           SENSOR ENTRADA
              E18-D80NK
                  │
                  ▼
            ESP32 + LoRa
              │       │
              │       └────────── LoRa ────────┐
              │                                │
              └── Wi-Fi / MQTT ─────────┐      │
                                        │      ▼
           SENSOR SAÍDA                 │  Gateway LoRa
              E18-D80NK                 │      │
                  │                     │      │
                  ▼                     │      │
            ESP32 + LoRa                │      │
              │       │                 │      │
              │       └── LoRa ─────────┘      │
              │                                │
              └── Wi-Fi / MQTT ────────────────┤
                                               │
TOTEM ─────────────── HTTP/API ────────────────┤
                                               ▼
                                            NOTEBOOK
                                               │
                        ┌──────────────────────┼─────────────────┐
                        │                      │                 │
                     MQTT Broker            Backend          Banco
                                               │                 │
                                               └───────┬─────────┘
                                                       ▼
                                                   Dashboard
```

---

## Tecnologias previstas

| Componente | Tecnologia |
|---|---|
| Sensor | E18-D80NK |
| Microcontrolador | ESP32 |
| Comunicação principal | Wi-Fi + MQTT |
| Comunicação de contingência | LoRa |
| Armazenamento de contingência | Flash do ESP32 |
| Broker | Eclipse Mosquitto |
| Backend | Python + FastAPI |
| Banco | PostgreSQL |
| Totem | Aplicação Web/PWA |
| Dashboard | Grafana |
| Servidor | Notebook |
| Versionamento | Git |

---

## Totem

O totem será utilizado exclusivamente para registrar os descartes realizados antes da E1.

Fluxo básico:

```text
Registrar descarte
        │
        ▼
Selecionar motivo
        │
        ▼
Informar quantidade
        │
        ▼
Confirmar
```

Caso o totem perca acesso ao servidor, os registros deverão ser mantidos localmente até a comunicação ser restabelecida.

O LoRa será destinado inicialmente aos dispositivos de sensoriamento, não ao totem.

---

## Dashboard

O dashboard deverá apresentar informações como:

- entrada da E1;
- saída da E1;
- diferença momentânea;
- perdas da E1;
- descartes da triagem;
- descartes por motivo;
- perdas observadas;
- aproveitamento da E1;
- histórico de produções;
- estado dos sensores;
- canal de comunicação utilizado;
- estado do gateway LoRa.

Exemplo:

```text
Entrada E1:              1.000
Saída E1:                  970
Perdas E1:                  30
Descartes na triagem:       15
Perdas observadas:          45
Aproveitamento E1:         97%
```

---

# Requisitos

## Requisitos funcionais

➡️ [`docs/funcionais.md`](docs/funcionais.md)

## Requisitos não funcionais

➡️ [`docs/naofuncionais.md`](docs/naofuncionais.md)

---

# Documentação

```text
docs/
│
├── funcionais.md
├── naofuncionais.md
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

### `docs/arquitetura/`

Arquitetura geral, componentes, fluxo de dados, servidor e banco de dados.

### `docs/hardware/`

ESP32, E18-D80NK, módulos LoRa, alimentação, circuitos e montagem.

### `docs/comunicacao/`

MQTT, Wi-Fi, LoRa, sincronização, armazenamento local, fallback e tratamento de duplicidades.

### `docs/testes/`

Testes dos sensores, Wi-Fi, LoRa, recuperação de falhas, sincronização e testes realizados na E1.

---

# Estrutura inicial do repositório

```text
monitoramento-e1/
│
├── README.md
│
├── firmware/
│   ├── sensor-entrada/
│   ├── sensor-saida/
│   └── gateway-lora/
│
├── backend/
├── totem/
├── dashboard/
│
└── docs/
    ├── funcionais.md
    ├── naofuncionais.md
    ├── arquitetura/
    ├── hardware/
    ├── comunicacao/
    ├── testes/
    └── imagens/
```

---

# Equipe

O desenvolvimento será dividido inicialmente em quatro frentes:

### Hardware e IoT

- E18-D80NK;
- ESP32;
- módulos LoRa;
- firmware;
- testes físicos.

### Backend

- MQTT;
- API;
- banco;
- deduplicação;
- sincronização;
- processamento dos eventos.

### Totem

- interface;
- registros de descarte;
- funcionamento offline;
- sincronização.

### Dashboard e integração

- Grafana;
- indicadores;
- monitoramento;
- testes de contingência;
- integração geral.

---

# Etapas previstas

1. Levantamento físico da E1.
2. Testes do E18-D80NK.
3. Contagem local com ESP32.
4. Comunicação Wi-Fi/MQTT.
5. Backend e banco.
6. Totem.
7. Dashboard.
8. Armazenamento local dos eventos.
9. Comunicação LoRa.
10. Gateway LoRa.
11. Lógica de fallback.
12. Deduplicação dos eventos.
13. Testes de queda de Wi-Fi.
14. Testes de queda simultânea Wi-Fi/LoRa.
15. Integração completa.
16. Piloto na empresa.

---

## Status

> Projeto em fase de desenvolvimento e validação do protótipo.

**Residência PNAAT**