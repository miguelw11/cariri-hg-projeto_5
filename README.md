# Sistema de Monitoramento de Perdas da Esteira E1

Sistema desenvolvido para monitorar, em tempo real, a movimentação e as perdas de pares de solados durante o processo produtivo da esteira **E1**.

A solução combina **sensoriamento automático**, **registro manual de descartes** e **visualização em dashboard**, permitindo acompanhar quantos pares entram na E1, quantos chegam ao final do processo e quantos foram descartados durante a triagem realizada antes da esteira.

---

## Contexto

A empresa possui duas esteiras principais no processo de produção:

- **E1:** etapa de produção/processamento dos pares de solados;
- **E2:** etapa posterior, responsável pela colocação das correias.

O projeto terá como foco inicial a **esteira E1**, por ser a etapa de maior interesse em relação às perdas observadas durante o processo.

Antes da entrada na E1, uma funcionária realiza manualmente a inspeção dos pares de solados. Produtos considerados inadequados são descartados antes de entrarem na esteira.

Os produtos aprovados são colocados na E1 e passam por um primeiro ponto de contagem. Ao final da esteira, um segundo ponto realiza uma nova contagem.

Dessa maneira, o sistema permitirá acompanhar separadamente:

- descartes identificados durante a triagem;
- produtos enviados para a E1;
- produtos que concluíram a E1;
- perdas ocorridas durante o percurso da E1.

---

## Objetivo

Desenvolver um sistema de monitoramento capaz de registrar e apresentar, em tempo real, informações relacionadas à produção e às perdas da esteira E1.

A solução deverá permitir que a empresa acompanhe de forma centralizada os principais indicadores do processo, mantendo também um histórico das produções realizadas.

---

## Funcionamento

O fluxo monitorado será:

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
                                  │
                                  ▼
                              ESTEIRA E1
                                  │
                                  ▼
                             SENSOR FINAL
                                  │
                                  ▼
                         PRODUTO FINALIZADO
```

### Triagem

Antes da E1, a funcionária identifica visualmente produtos inadequados.

Quando houver um descarte, ele será registrado através de uma aplicação disponível em um totem.

O registro conterá informações como:

- motivo do descarte;
- quantidade;
- data;
- horário;
- produção relacionada.

Não é conhecida, inicialmente, a quantidade total de pares recebida pela funcionária. Portanto, os descartes da triagem serão tratados como um indicador independente.

### Entrada da E1

Os pares aprovados passam por um sensor **E18-D80NK**, responsável pela contagem de entrada.

Cada passagem válida representa:

```text
Entrada E1 + 1
```

### Saída da E1

Ao final do processo, outro sensor E18-D80NK realiza a contagem dos pares que concluíram a esteira.

Cada passagem válida representa:

```text
Saída E1 + 1
```

### Perdas durante a E1

Após o encerramento de uma produção, as perdas da esteira serão calculadas através de:

```text
Perdas E1 = Entrada E1 - Saída E1
```

Exemplo:

```text
Entrada E1: 500
Saída E1:   486
Perdas E1:   14
```

O sistema não buscará identificar automaticamente o motivo dessas perdas.

### Perdas observadas

Os descartes da triagem e as perdas da E1 poderão ser apresentados de forma consolidada:

```text
Perdas observadas =
Descartes da triagem + Perdas E1
```

Como não sabemos quantos produtos foram originalmente recebidos pela funcionária, esse indicador não representa necessariamente todas as perdas de um lote inicial.

---

## Produção em andamento

Durante uma produção, a diferença entre os sensores **não deverá ser considerada imediatamente uma perda**.

Por exemplo:

```text
Entrada E1: 500
Saída E1:   350
```

Parte dos 150 pares restantes pode ainda estar percorrendo a esteira.

Durante esse período, o sistema exibirá uma **diferença momentânea**.

A perda da E1 somente será consolidada após o encerramento da alimentação da esteira e a confirmação de que não existem mais produtos em processamento.

---

## Arquitetura

A arquitetura inicial será:

```text
Sensor Entrada ─► ESP32 ───────┐
                               │
Sensor Saída   ─► ESP32 ───────┼──► Rede local
                               │        │
Totem ─────────────────────────┘        ▼
                                    Notebook
                                       │
                          ┌────────────┼────────────┐
                          │            │            │
                         MQTT       Backend       Banco
                          │            │            │
                          └────────────┼────────────┘
                                       │
                                       ▼
                                   Dashboard
```

O **notebook** funcionará como servidor central do sistema.

Os ESP32 serão responsáveis pela leitura dos sensores e pelo envio dos eventos através da rede.

O notebook deverá centralizar inicialmente:

- broker MQTT;
- backend/API;
- banco de dados;
- dashboard.

---

## Tecnologias previstas

| Componente | Tecnologia |
|---|---|
| Sensor | E18-D80NK |
| Microcontrolador | ESP32 |
| Firmware | C++ / Arduino |
| Comunicação | MQTT |
| Broker | Eclipse Mosquitto |
| Backend | Python + FastAPI |
| Banco de dados | PostgreSQL |
| Totem | Aplicação Web/PWA |
| Dashboard | Grafana |
| Servidor | Notebook |
| Versionamento | Git |

As tecnologias podem ser alteradas durante o desenvolvimento caso sejam encontradas alternativas mais adequadas.

---

## Dashboard

O dashboard deverá apresentar informações como:

- produtos enviados para a E1;
- produtos que concluíram a E1;
- diferença momentânea durante a produção;
- perdas da E1 após o encerramento;
- descartes realizados na triagem;
- descartes por motivo;
- aproveitamento da E1;
- histórico de produções;
- situação dos dispositivos.

Exemplo de produção finalizada:

```text
Entrada E1:              1.000
Saída E1:                  970
Perdas E1:                  30
Descartes na triagem:       15
Perdas observadas:          45
Aproveitamento E1:         97%
```

---

## Requisitos

Os requisitos foram separados da documentação principal para facilitar sua manutenção.

### Requisitos funcionais

Definem as funcionalidades que deverão ser oferecidas pelo sistema.

➡️ [`docs/funcionais.md`](docs/funcionais.md)

### Requisitos não funcionais

Definem características de desempenho, disponibilidade, usabilidade, segurança e operação da solução.

➡️ [`docs/naofuncionais.md`](docs/naofuncionais.md)

---

## Documentação

A documentação técnica deverá ser mantida dentro do diretório `docs/`.

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
├── testes/
│   └── README.md
│
└── imagens/
```

### `docs/arquitetura/`

Documentação da arquitetura geral da solução, fluxo de dados, MQTT, backend, banco e comunicação entre os componentes.

### `docs/hardware/`

Documentação relacionada ao ESP32, sensores E18-D80NK, circuitos, alimentação, montagem e instalação.

### `docs/testes/`

Planos de teste, resultados obtidos em bancada e posteriormente os testes realizados na esteira real.

### `docs/imagens/`

Diagramas, fotografias autorizadas, esquemas e demais imagens utilizadas na documentação.

---

## Estrutura inicial do repositório

```text
monitoramento-e1/
│
├── README.md
│
├── firmware/
│   ├── sensor-entrada/
│   └── sensor-saida/
│
├── backend/
│
├── totem/
│
├── dashboard/
│
└── docs/
    ├── funcionais.md
    ├── naofuncionais.md
    ├── arquitetura/
    ├── hardware/
    ├── testes/
    └── imagens/
```

---

## Equipe

A equipe é formada por quatro integrantes.

A divisão inicial poderá seguir quatro frentes:

1. **Hardware e IoT**
   - sensores;
   - ESP32;
   - firmware;
   - comunicação MQTT.

2. **Backend**
   - API;
   - banco de dados;
   - recebimento dos eventos;
   - regras de negócio.

3. **Totem**
   - interface da operadora;
   - registro de descartes;
   - integração com a API.

4. **Dashboard e integração**
   - Grafana;
   - indicadores;
   - visualizações;
   - integração e testes.

As frentes deverão ser desenvolvidas de forma integrada e versionadas no mesmo repositório.

---

## Etapas previstas

1. Levantamento físico da E1.
2. Testes de bancada com o E18-D80NK.
3. Desenvolvimento do firmware do ESP32.
4. Configuração da infraestrutura no notebook.
5. Desenvolvimento do backend e banco de dados.
6. Desenvolvimento do totem.
7. Desenvolvimento do dashboard.
8. Integração dos componentes.
9. Testes do sistema completo.
10. Validação controlada na empresa.
11. Ajustes para instalação piloto.

---

## Status

> Projeto em fase de desenvolvimento e validação do protótipo.

**Residência PNAAT**