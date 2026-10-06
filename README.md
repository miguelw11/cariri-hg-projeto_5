# Sistema de Monitoramento de Perdas da Esteira E1

Sistema de monitoramento em tempo real destinado ao acompanhamento da produção e das perdas de pares de solados durante o processo produtivo da esteira E1.

O projeto utiliza sensores fotoelétricos E18-D80NK para contabilizar os produtos que entram e saem da esteira, ESP32 para aquisição e transmissão dos eventos, um notebook como servidor central, uma aplicação web para registro manual dos descartes realizados antes da esteira e um dashboard para acompanhamento da produção.

---

## 1. Contexto

Durante a visita técnica à empresa foi identificada a necessidade de melhorar o acompanhamento das perdas ocorridas no processo de produção de calçados.

A empresa possui duas esteiras principais:

- **E1:** etapa relacionada à produção/processamento dos pares de solados;
- **E2:** etapa posterior, onde são colocadas as correias.

O projeto terá como foco inicial exclusivamente a **esteira E1**, uma vez que ela representa o principal ponto de interesse relacionado às perdas observadas no processo.

Antes da entrada na E1, uma funcionária realiza uma triagem manual dos pares de solados. Durante essa etapa, ela avalia visualmente os produtos e descarta aqueles que apresentam defeitos considerados inadequados.

Essa avaliação permanecerá humana, pois os funcionários possuem conhecimento do processo e dos critérios de qualidade necessários para decidir quais defeitos são aceitáveis e quais justificam o descarte.

O sistema não pretende substituir essa avaliação.

A solução será responsável por:

- registrar os descartes realizados na triagem;
- contar os pares enviados para a E1;
- contar os pares que concluíram o processo;
- calcular as perdas ocorridas entre o início e o final da E1;
- armazenar os dados;
- disponibilizar as informações em tempo real em um dashboard.

---

# 2. Problema

Atualmente, existe dificuldade em acompanhar de forma centralizada e em tempo real:

- quantos pares de solados foram enviados para a esteira;
- quantos concluíram o processo;
- quantos foram descartados antes da E1;
- os motivos dos descartes identificados na triagem;
- quantos produtos foram perdidos durante o percurso da E1;
- o histórico dessas informações ao longo das produções.

O acompanhamento das perdas é importante para permitir que a empresa identifique tendências e tenha maior controle sobre o processo produtivo.

---

# 3. Objetivo geral

Desenvolver um sistema de monitoramento em tempo real capaz de registrar descartes realizados antes da esteira E1 e contabilizar automaticamente os pares de solados que entram e saem da esteira, permitindo calcular e visualizar as perdas ocorridas durante o processo produtivo.

---

# 4. Objetivos específicos

O sistema deverá:

1. Contabilizar automaticamente os pares de solados enviados para a E1.
2. Contabilizar automaticamente os pares que chegam ao final da E1.
3. Permitir o registro manual dos descartes realizados durante a triagem anterior à E1.
4. Permitir selecionar o motivo do descarte.
5. Armazenar data e horário dos registros.
6. Manter histórico das produções.
7. Calcular as perdas ocorridas dentro da E1.
8. Apresentar os dados em um dashboard.
9. Atualizar as informações em poucos segundos.
10. Permitir identificar problemas de comunicação com os dispositivos.
11. Manter separadas as perdas da triagem e as perdas ocorridas durante a E1.

---

# 5. Escopo

## 5.1 Dentro do escopo

O MVP contempla:

- esteira E1;
- dois pontos de contagem;
- dois sensores E18-D80NK;
- ESP32;
- comunicação sem fio;
- notebook como servidor;
- banco de dados;
- aplicação web para o totem;
- cadastro dos motivos de descarte;
- dashboard;
- início e encerramento de produções;
- histórico;
- cálculo das perdas;
- monitoramento dos dispositivos.

## 5.2 Fora do escopo inicial

Não fazem parte da primeira versão:

- monitoramento da E2;
- identificação automática de defeitos;
- visão computacional;
- inteligência artificial;
- identificação do motivo das perdas que acontecem dentro da E1;
- rastreamento individual de cada par;
- integração com as máquinas anteriores às esteiras;
- cálculo da quantidade total inicialmente entregue à funcionária;
- automação do processo de descarte;
- intervenção automática na esteira.

---

# 6. Premissas do projeto

O sistema será desenvolvido considerando as seguintes premissas:

### P01 — Quantidade recebida pela funcionária desconhecida

Não existe, inicialmente, uma informação confiável sobre a quantidade de pares que chega até a funcionária responsável pela triagem.

Portanto, o sistema **não calculará a taxa de descarte da triagem em relação ao estoque recebido**.

### P02 — Triagem ocorre antes do primeiro sensor

A funcionária avalia os produtos antes de colocá-los na esteira.

Consequentemente:

- produtos descartados pela funcionária nunca passam pelo sensor inicial;
- apenas produtos aprovados passam a fazer parte da contagem da E1.

### P03 — Perdas dentro da E1 não terão causa identificada

Se um produto for contabilizado pelo sensor de entrada, mas não pelo sensor de saída após o encerramento da produção, ele será considerado uma perda durante o processo da E1.

A primeira versão do sistema não tentará descobrir o motivo dessa perda.

### P04 — Unidade de contagem

A unidade utilizada deverá ser a mesma em todo o sistema.

Para o projeto será adotado:

> **1 unidade = 1 par de solados**

A disposição física dos produtos na esteira deverá garantir que cada par produza apenas um evento de contagem.

Essa premissa deverá ser validada durante os testes na empresa.

---

# 7. Fluxo do processo

```text
                 PRODUTOS DISPONÍVEIS
                         │
                         ▼
                ┌─────────────────┐
                │     TRIAGEM     │
                │   Funcionária   │
                └────────┬────────┘
                         │
                ┌────────┴────────┐
                │                 │
            DESCARTADO        APROVADO
                │                 │
                ▼                 ▼
             TOTEM          SENSOR INICIAL
                │              E18-D80NK
                │                 │
                │                 ▼
                │             ESP32
                │                 │
                │                 ▼
                │          ┌─────────────┐
                │          │ ESTEIRA E1  │
                │          └──────┬──────┘
                │                 │
                │                 ▼
                │           SENSOR FINAL
                │             E18-D80NK
                │                 │
                │                 ▼
                │              ESP32
                │                 │
                └────────┬────────┘
                         │
                         ▼
                    REDE LOCAL
                         │
                         ▼
                     NOTEBOOK
                         │
          ┌──────────────┼───────────────┐
          │              │               │
        MQTT          Backend        Banco de
        Broker           API            Dados
          │                              │
          └──────────────┬───────────────┘
                         │
                         ▼
                     DASHBOARD
```

---

# 8. Regras de negócio

## RN01 — Descartes da triagem

Todos os produtos descartados pela funcionária serão registrados através do totem.

Cada registro deverá possuir, no mínimo:

- produção;
- motivo;
- quantidade;
- data;
- horário.

---

## RN02 — Contagem de entrada

Cada par aprovado pela funcionária deverá passar pelo sensor inicial.

Cada detecção válida incrementará:

```text
Contagem de entrada + 1
```

---

## RN03 — Contagem de saída

Cada par que concluir o processo da E1 deverá passar pelo sensor final.

Cada detecção válida incrementará:

```text
Contagem de saída + 1
```

---

## RN04 — Perdas dentro da E1

Após o encerramento da produção:

```text
Perdas E1 = Contagem de entrada - Contagem de saída
```

Exemplo:

```text
Entrada E1: 500
Saída E1:   486

Perdas E1: 14
```

O sistema não deverá atribuir automaticamente um motivo a essas 14 perdas.

---

## RN05 — Descartes da triagem

Os descartes realizados antes da E1 são calculados através dos registros do totem:

```text
Descartes da triagem =
Soma das quantidades registradas no totem
```

---

## RN06 — Perdas observadas

Para fins de acompanhamento:

```text
Perdas observadas =
Descartes da triagem + Perdas E1
```

Essa informação não representa necessariamente todas as perdas de um lote original, porque a quantidade inicialmente entregue à funcionária não é conhecida.

---

## RN07 — Aproveitamento da E1

É possível medir o aproveitamento específico da esteira:

```text
Aproveitamento E1 =
Saída E1 / Entrada E1 × 100
```

Exemplo:

```text
Entrada: 500
Saída:   475

Aproveitamento E1 = 95%
```

---

# 9. Produção em andamento x produção finalizada

A diferença entre entrada e saída **não poderá ser considerada uma perda enquanto a produção estiver em andamento**.

Exemplo:

```text
Entrada: 500
Saída:   320
```

Não significa que 180 pares foram perdidos.

Eles podem simplesmente ainda estar percorrendo a E1.

Durante a execução, o sistema utilizará o termo:

```text
Diferença momentânea
```

Somente após:

1. interromper a entrada de novos produtos;
2. aguardar os produtos restantes concluírem o percurso;
3. confirmar que a esteira está vazia;
4. encerrar a produção;

a diferença será registrada como:

```text
Perdas E1
```

---

# 10. Sensor utilizado

## E18-D80NK

O projeto utilizará dois sensores:

```text
Sensor 01 → entrada da E1
Sensor 02 → saída da E1
```

O E18-D80NK é um sensor fotoelétrico infravermelho de detecção por reflexão.

Ele possui emissor e receptor no mesmo corpo.

```text
     E18-D80NK
         │
         │