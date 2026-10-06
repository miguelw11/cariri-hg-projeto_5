# Requisitos Funcionais

Este documento apresenta os requisitos funcionais do Sistema de Monitoramento de Perdas da Esteira E1.

Os requisitos descrevem **o que o sistema deverá fazer**.

---

## RF01 — Iniciar produção

O sistema deverá permitir iniciar uma nova produção.

O registro deverá possuir, no mínimo:

- identificador;
- data e horário de início;
- status da produção.

Informações adicionais, como modelo ou produto, poderão ser informadas quando disponíveis.

---

## RF02 — Encerrar produção

O sistema deverá permitir encerrar uma produção em andamento.

O encerramento deverá ocorrer somente após a confirmação de que a alimentação da E1 foi interrompida e que não existem mais produtos percorrendo a esteira.

---

## RF03 — Contabilizar entrada de produtos

O sistema deverá registrar automaticamente cada passagem válida identificada pelo sensor localizado no início da E1.

Cada detecção válida deverá incrementar a contagem de entrada da produção ativa.

---

## RF04 — Contabilizar saída de produtos

O sistema deverá registrar automaticamente cada passagem válida identificada pelo sensor localizado ao final da E1.

Cada detecção válida deverá incrementar a contagem de saída da produção ativa.

---

## RF05 — Evitar múltiplas contagens da mesma passagem

O sistema deverá impedir que a permanência de um mesmo par de solados diante do sensor gere múltiplos registros.

Uma nova contagem deverá ocorrer somente após a finalização da passagem anterior.

---

## RF06 — Associar eventos à produção ativa

Os eventos recebidos dos sensores deverão ser associados à produção que estiver ativa no momento da detecção.

---

## RF07 — Registrar descarte da triagem

O sistema deverá permitir que a funcionária responsável pela triagem registre um descarte através do totem.

---

## RF08 — Informar motivo do descarte

Ao registrar um descarte, o sistema deverá permitir selecionar um motivo previamente cadastrado.

Exemplos poderão incluir:

- defeito no material;
- corte irregular;
- deformação;
- outro.

A lista definitiva deverá ser validada com a empresa.

---

## RF09 — Informar quantidade descartada

O sistema deverá permitir informar a quantidade de pares relacionada ao registro de descarte.

---

## RF10 — Registrar automaticamente data e horário do descarte

Ao realizar um registro pelo totem, o sistema deverá armazenar automaticamente a data e o horário da operação.

---

## RF11 — Associar descarte à produção ativa

Os descartes realizados no totem deverão ser associados à produção que estiver ativa no momento do registro.

---

## RF12 — Permitir correção de registro

O sistema deverá disponibilizar uma forma controlada de corrigir ou desfazer um registro de descarte realizado incorretamente.

---

## RF13 — Calcular descartes da triagem

O sistema deverá calcular a quantidade total de descartes da triagem através da soma dos registros realizados no totem.

```text
Descartes da triagem =
Soma das quantidades registradas
```

---

## RF14 — Exibir diferença momentânea

Durante uma produção em andamento, o sistema deverá calcular e exibir a diferença entre as contagens de entrada e saída.

```text
Diferença momentânea =
Entrada E1 - Saída E1
```

Essa diferença não deverá ser classificada como perda definitiva enquanto a produção estiver ativa.

---

## RF15 — Calcular perdas da E1

Após o encerramento da produção, o sistema deverá calcular as perdas ocorridas durante o processo da E1.

```text
Perdas E1 =
Entrada E1 - Saída E1
```

O sistema não deverá atribuir automaticamente um motivo às perdas calculadas entre os sensores.

---

## RF16 — Calcular perdas observadas

Após o encerramento da produção, o sistema deverá permitir visualizar o total de perdas observadas.

```text
Perdas observadas =
Descartes da triagem + Perdas E1
```

Esse indicador não deverá ser tratado como perda de um lote original, pois a quantidade inicialmente recebida na triagem não é conhecida.

---

## RF17 — Calcular aproveitamento da E1

O sistema deverá calcular o percentual de produtos que entraram na E1 e chegaram ao final do processo.

```text
Aproveitamento E1 =
(Saída E1 / Entrada E1) × 100
```

---

## RF18 — Exibir indicadores da produção atual

O dashboard deverá apresentar, no mínimo:

- contagem de entrada;
- contagem de saída;
- descartes registrados na triagem;
- diferença momentânea;
- status da produção.

---

## RF19 — Exibir resultado de produção finalizada

Após o encerramento, o dashboard deverá apresentar, no mínimo:

- total enviado para a E1;
- total finalizado;
- perdas da E1;
- descartes da triagem;
- perdas observadas;
- aproveitamento da E1.

---

## RF20 — Exibir descartes por motivo

O dashboard deverá apresentar a distribuição dos descartes registrados na triagem de acordo com seus respectivos motivos.

---

## RF21 — Manter histórico de produções

O sistema deverá armazenar as produções realizadas para permitir consultas posteriores.

---

## RF22 — Consultar produção anterior

O usuário deverá ser capaz de consultar os indicadores de uma produção já encerrada.

---

## RF23 — Registrar eventos dos sensores

O sistema deverá armazenar os eventos individuais enviados pelos sensores.

Cada evento deverá possuir informações suficientes para identificar, no mínimo:

- dispositivo;
- produção;
- tipo de evento;
- data e horário.

---

## RF24 — Identificar eventos duplicados

O sistema deverá possuir mecanismo para evitar que o mesmo evento enviado mais de uma vez seja contabilizado repetidamente.

---

## RF25 — Monitorar dispositivos

O sistema deverá armazenar informações de comunicação dos dispositivos utilizados na solução.

---

## RF26 — Exibir status dos sensores

O dashboard deverá indicar o estado dos sensores de entrada e saída.

Exemplos:

```text
ONLINE
OFFLINE
```

---

## RF27 — Informar última comunicação

O sistema deverá permitir consultar quando ocorreu a última comunicação recebida de cada dispositivo monitorado.

---

## RF28 — Alertar indisponibilidade de sensor

Caso um sensor deixe de se comunicar por um período configurado, o sistema deverá indicar sua indisponibilidade.

---

## RF29 — Permitir cadastro de motivos

O sistema deverá permitir manter uma relação de motivos utilizados nos registros de descarte.

Os motivos poderão ser ativados ou desativados conforme necessidade da empresa.

---

## RF30 — Atualizar dashboard durante a produção

As informações recebidas dos sensores ou registradas no totem deverão ser refletidas no dashboard enquanto a produção estiver acontecendo.

---

# Resumo

Os requisitos funcionais podem ser agrupados em cinco áreas:

| Área | Requisitos |
|---|---|
| Produção | RF01, RF02, RF06 |
| Sensoriamento | RF03, RF04, RF05, RF23, RF24 |
| Totem | RF07 a RF13, RF29 |
| Indicadores e dashboard | RF14 a RF22, RF30 |
| Monitoramento | RF25 a RF28 |

Os requisitos poderão ser revisados durante os testes e a validação da solução com a empresa.