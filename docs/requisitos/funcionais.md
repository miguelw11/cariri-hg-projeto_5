# Requisitos Funcionais

Este documento apresenta os requisitos funcionais do Sistema de Monitoramento de Perdas da Esteira E1.

---

# Gestão da produção

## RF01 — Iniciar produção

O sistema deverá permitir iniciar uma nova produção, registrando data, horário e status.

## RF02 — Encerrar produção

O sistema deverá permitir encerrar uma produção após a confirmação de que não existem mais produtos percorrendo a E1.

## RF03 — Associar informações à produção ativa

Eventos dos sensores e registros realizados no totem deverão ser associados à produção ativa.

---

# Sensoriamento

## RF04 — Contabilizar entrada

O sistema deverá registrar cada passagem válida identificada pelo sensor localizado no início da E1.

## RF05 — Contabilizar saída

O sistema deverá registrar cada passagem válida identificada pelo sensor localizado ao final da E1.

## RF06 — Evitar múltiplas contagens físicas

Um mesmo produto não deverá gerar vários eventos enquanto permanecer diante do sensor.

## RF07 — Gerar identificador único

Cada evento deverá possuir um `event_id` único.

O identificador deverá permanecer o mesmo independentemente do meio utilizado para a transmissão.

---

# Comunicação Wi-Fi/MQTT

## RF08 — Utilizar Wi-Fi como canal principal

Em condições normais, os eventos deverão ser enviados pelo ESP32 utilizando Wi-Fi.

## RF09 — Transmitir eventos por MQTT

Os eventos deverão ser publicados para o servidor através do protocolo MQTT.

## RF10 — Confirmar recebimento

O sistema deverá ser capaz de determinar se o evento foi recebido pelo servidor.

---

# Comunicação LoRa

## RF11 — Detectar indisponibilidade do canal principal

O ESP32 deverá detectar quando não conseguir transmitir normalmente os dados utilizando Wi-Fi/MQTT.

## RF12 — Ativar fallback LoRa

Quando o canal principal estiver indisponível, o dispositivo deverá tentar enviar os eventos através da comunicação LoRa.

## RF13 — Receber dados via LoRa

A solução deverá possuir um gateway/receptor LoRa capaz de receber as mensagens enviadas pelos sensores.

## RF14 — Encaminhar evento LoRa ao backend

Eventos recebidos pelo gateway deverão ser encaminhados ao backend do sistema.

## RF15 — Retornar automaticamente ao Wi-Fi

Quando o canal principal voltar a funcionar, o ESP32 deverá retornar ao uso prioritário de Wi-Fi/MQTT.

## RF16 — Registrar utilização do fallback

O sistema deverá registrar quando um evento tiver sido enviado utilizando LoRa.

---

# Persistência local

## RF17 — Armazenar eventos pendentes

Caso Wi-Fi e LoRa estejam indisponíveis, o ESP32 deverá manter localmente os eventos ainda não entregues.

## RF18 — Sincronizar eventos pendentes

Quando algum canal de comunicação voltar a ficar disponível, os eventos pendentes deverão ser transmitidos.

## RF19 — Remover evento confirmado

Um evento deverá ser removido da fila local somente após a confirmação de que foi recebido pelo servidor.

---

# Deduplicação

## RF20 — Identificar eventos já processados

O backend deverá verificar o `event_id` antes de registrar uma nova contagem.

## RF21 — Evitar contagem duplicada entre Wi-Fi e LoRa

Caso o mesmo evento seja recebido pelos dois canais, ele deverá ser contabilizado apenas uma vez.

## RF22 — Evitar duplicidade durante sincronização

Eventos enviados novamente após recuperação de comunicação não deverão gerar novas contagens caso já tenham sido processados.

---

# Totem

## RF23 — Registrar descarte

O sistema deverá permitir registrar os descartes realizados durante a triagem.

## RF24 — Selecionar motivo

A funcionária deverá selecionar um motivo previamente cadastrado.

## RF25 — Informar quantidade

O sistema deverá permitir informar a quantidade descartada.

## RF26 — Registrar data e horário

Data e horário deverão ser registrados automaticamente.

## RF27 — Associar descarte à produção

O descarte deverá ser associado à produção ativa.

## RF28 — Permitir correção

O sistema deverá oferecer uma forma controlada de corrigir um lançamento incorreto.

## RF29 — Armazenar registro offline no totem

Caso o totem perca conexão com o servidor, o registro deverá permanecer armazenado localmente.

## RF30 — Sincronizar registros do totem

Os registros pendentes deverão ser transmitidos quando a comunicação voltar.

## RF31 — Evitar duplicidade no totem

Um registro sincronizado mais de uma vez não deverá produzir duplicações no banco.

---

# Cálculos

## RF32 — Calcular descartes da triagem

```text
Descartes da triagem =
Soma das quantidades registradas no totem
```

## RF33 — Calcular diferença momentânea

```text
Diferença momentânea =
Entrada E1 - Saída E1
```

Enquanto a produção estiver ativa, essa diferença não deverá ser considerada perda definitiva.

## RF34 — Calcular perdas da E1

Após o encerramento:

```text
Perdas E1 =
Entrada E1 - Saída E1
```

## RF35 — Calcular perdas observadas

```text
Perdas observadas =
Descartes da triagem + Perdas E1
```

## RF36 — Calcular aproveitamento

```text
Aproveitamento E1 =
(Saída E1 / Entrada E1) × 100
```

---

# Dashboard

## RF37 — Exibir produção atual

O dashboard deverá apresentar:

- entrada;
- saída;
- diferença momentânea;
- descartes da triagem;
- status da produção.

## RF38 — Exibir produção encerrada

O dashboard deverá apresentar:

- entrada total;
- saída total;
- perdas E1;
- descartes;
- perdas observadas;
- aproveitamento.

## RF39 — Exibir descartes por motivo

O dashboard deverá apresentar os descartes agrupados pelos motivos registrados no totem.

## RF40 — Manter histórico

O sistema deverá permitir consultar produções anteriormente encerradas.

---

# Monitoramento

## RF41 — Monitorar sensor de entrada

O sistema deverá indicar o estado do dispositivo responsável pela entrada.

## RF42 — Monitorar sensor de saída

O sistema deverá indicar o estado do dispositivo responsável pela saída.

## RF43 — Registrar última comunicação

O sistema deverá armazenar quando ocorreu a última comunicação de cada dispositivo.

## RF44 — Exibir canal de comunicação

O sistema deverá permitir identificar se o dispositivo está utilizando:

```text
Wi-Fi
LoRa
Offline
```

## RF45 — Monitorar gateway LoRa

O sistema deverá indicar se o gateway LoRa está disponível.

## RF46 — Alertar indisponibilidade total

Caso um dispositivo não consiga se comunicar por Wi-Fi nem LoRa, o sistema deverá apresentar seu estado como indisponível.

## RF47 — Informar sincronização pendente

O sistema deverá permitir identificar quando existirem eventos ainda armazenados localmente aguardando sincronização.

---

# Cadastros

## RF48 — Gerenciar motivos de descarte

O sistema deverá permitir cadastrar, ativar e desativar motivos apresentados no totem.

---

# Resumo

| Categoria | Requisitos |
|---|---|
| Produção | RF01–RF03 |
| Sensoriamento | RF04–RF07 |
| Wi-Fi/MQTT | RF08–RF10 |
| LoRa | RF11–RF16 |
| Persistência | RF17–RF19 |
| Deduplicação | RF20–RF22 |
| Totem | RF23–RF31 |
| Cálculos | RF32–RF36 |
| Dashboard | RF37–RF40 |
| Monitoramento | RF41–RF47 |
| Cadastros | RF48 |

Os requisitos poderão ser refinados durante os testes de bancada e a validação na empresa.