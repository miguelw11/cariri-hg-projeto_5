# Requisitos Funcionais

Este documento apresenta os requisitos funcionais do Sistema de Monitoramento de Perdas da Esteira E1.

---

# Gestão da produção

## RF01 — Iniciar produção

O sistema deverá permitir iniciar uma nova produção, registrando data, horário e status.

## RF02 — Encerrar produção

O sistema deverá permitir encerrar uma produção após a confirmação de que não existem mais produtos percorrendo a E1.

## RF03 — Associar informações à produção ativa

Eventos dos sensores e registros realizados no Totem deverão ser associados à produção ativa.

---

# Sensoriamento

## RF04 — Contabilizar entrada

O sistema deverá registrar cada passagem válida identificada pelo sensor localizado no início da E1.

## RF05 — Contabilizar saída

O sistema deverá registrar cada passagem válida identificada pelo sensor localizado ao final da E1.

## RF06 — Evitar múltiplas contagens físicas

Um mesmo produto não deverá gerar vários eventos enquanto permanecer diante do sensor.

## RF07 — Gerar identificador único

Cada evento deverá possuir um `event_id` único, independentemente do canal utilizado para sua transmissão.

---

# Comunicação Wi-Fi/MQTT

## RF08 — Utilizar Wi-Fi como canal principal

Em condições normais, os eventos deverão ser enviados através de Wi-Fi.

## RF09 — Transmitir eventos por MQTT

Os eventos dos sensores deverão ser publicados para o servidor através de MQTT.

## RF10 — Confirmar recebimento

O sistema deverá possuir mecanismo para determinar se o evento foi recebido pelo servidor.

---

# Comunicação LoRa

## RF11 — Detectar indisponibilidade do canal principal

Os nós deverão identificar quando não conseguirem transmitir normalmente através de Wi-Fi/MQTT.

## RF12 — Utilizar LoRa como contingência

Quando o canal principal estiver indisponível, os eventos deverão ser transmitidos através de LoRa.

## RF13 — Receber eventos pelo gateway

O gateway ESP32-S3 deverá receber os eventos LoRa transmitidos pelos pontos de sensoriamento.

## RF14 — Encaminhar dados pela serial

O gateway deverá enviar os eventos recebidos ao servidor principal através da conexão USB/Serial.

## RF15 — Retornar automaticamente ao Wi-Fi

Quando o canal principal estiver novamente disponível, os dispositivos deverão voltar a utilizá-lo prioritariamente.

## RF16 — Registrar canal utilizado

O sistema deverá permitir identificar se o evento foi recebido através de Wi-Fi/MQTT, LoRa ou sincronização local.

---

# Armazenamento local

## RF17 — Armazenar eventos pendentes

Caso Wi-Fi e LoRa estejam indisponíveis, os eventos deverão ser armazenados localmente.

## RF18 — Sincronizar eventos pendentes

Quando um canal voltar a ficar disponível, os dados ainda não enviados deverão ser sincronizados.

## RF19 — Remover somente eventos confirmados

Eventos locais somente deverão ser marcados como sincronizados após confirmação do servidor.

---

# Deduplicação

## RF20 — Identificar eventos já processados

O backend deverá verificar o `event_id` antes de processar um evento.

## RF21 — Evitar duplicidade entre canais

Um mesmo evento recebido por Wi-Fi, LoRa ou sincronização posterior deverá ser contabilizado apenas uma vez.

---

# Totem

## RF22 — Disponibilizar módulo Totem

A aplicação web deverá possuir uma página específica destinada ao registro de descartes.

## RF23 — Registrar descarte

A funcionária deverá poder registrar uma ocorrência de descarte.

## RF24 — Selecionar motivo

O sistema deverá permitir selecionar um motivo previamente cadastrado.

## RF25 — Informar quantidade

O sistema deverá permitir informar a quantidade descartada.

## RF26 — Registrar data e horário

Data e horário deverão ser associados automaticamente ao registro.

## RF27 — Associar descarte à produção

O descarte deverá ser associado à produção ativa.

## RF28 — Permitir correção

O sistema deverá fornecer uma forma controlada de corrigir ou desfazer um lançamento incorreto.

## RF29 — Operar localmente no Totem

Quando não houver comunicação com o servidor, o Totem deverá permitir continuar realizando registros.

## RF30 — Sincronizar Totem

Os registros mantidos localmente deverão ser sincronizados automaticamente quando a comunicação retornar.

## RF31 — Evitar duplicidade do Totem

A sincronização de um registro já recebido não deverá produzir duplicações no banco.

---

# Cálculos

## RF32 — Calcular descartes da triagem

```text
Descartes da triagem =
Soma das quantidades registradas no Totem
```

## RF33 — Calcular diferença momentânea

Durante a produção:

```text
Diferença momentânea =
Entrada E1 - Saída E1
```

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

# Ociosidade

## RF37 — Monitorar atividade da produção

O sistema deverá acompanhar os eventos dos sensores durante uma produção ativa.

## RF38 — Detectar início de ociosidade

Caso nenhum evento seja registrado durante um intervalo configurado, o sistema deverá iniciar um período de ociosidade.

## RF39 — Detectar fim da ociosidade

A ocorrência de um novo evento deverá encerrar o período de ociosidade atual.

## RF40 — Registrar períodos de ociosidade

O sistema deverá armazenar início, fim e duração dos períodos ociosos.

## RF41 — Configurar limite de ociosidade

O sistema deverá permitir configurar o tempo necessário sem atividade para considerar a produção ociosa.

---

# Aplicação web

## RF42 — Disponibilizar Dashboard

A aplicação deverá possuir uma página destinada ao acompanhamento em tempo real da produção.

## RF43 — Disponibilizar página de Produção

A aplicação deverá possuir uma página para gerenciamento das produções.

## RF44 — Disponibilizar página de Relatórios

A aplicação deverá possuir uma área destinada à consulta de métricas e informações históricas.

## RF45 — Disponibilizar página de Dispositivos

A aplicação deverá permitir acompanhar o estado dos dispositivos e canais de comunicação.

## RF46 — Disponibilizar página de Configurações

A aplicação deverá possuir uma área para parâmetros do sistema.

## RF47 — Compartilhar backend

Os diferentes módulos da aplicação deverão utilizar o mesmo backend e banco de dados.

---

# Dashboard

## RF48 — Exibir produção atual

O dashboard deverá apresentar:

- entrada;
- saída;
- diferença momentânea;
- descartes da triagem;
- status da produção;
- ociosidade atual.

## RF49 — Exibir produção encerrada

O dashboard deverá apresentar:

- entrada total;
- saída total;
- perdas E1;
- descartes;
- perdas observadas;
- aproveitamento;
- tempo de ociosidade.

## RF50 — Exibir descartes por motivo

Os descartes deverão poder ser visualizados agrupados pelos motivos cadastrados.

## RF51 — Atualizar informações em tempo próximo do real

Novos eventos recebidos deverão refletir na aplicação sem necessidade de recarregar manualmente toda a página.

---

# Relatórios

## RF52 — Consultar histórico

O sistema deverá permitir consultar produções encerradas.

## RF53 — Filtrar por dia

Os relatórios deverão poder ser filtrados por dia.

## RF54 — Filtrar por intervalo

Os relatórios deverão permitir definir intervalo de datas.

## RF55 — Filtrar por turno

Os relatórios deverão permitir filtro por turno.

## RF56 — Filtrar por hora

Os relatórios deverão permitir análise por hora ou intervalo de horas.

## RF57 — Filtrar por produção

O sistema deverá permitir selecionar uma produção específica.

## RF58 — Filtrar descartes por motivo

Os relatórios deverão permitir analisar descartes de acordo com o motivo.

## RF59 — Exibir produção por hora

O sistema deverá disponibilizar métricas relacionadas ao fluxo de produção ao longo das horas.

## RF60 — Exibir métricas de ociosidade

Os relatórios deverão permitir consultar:

- tempo ativo;
- tempo ocioso;
- percentual de ociosidade;
- quantidade de períodos ociosos;
- maior período de ociosidade.

---

# Turnos

## RF61 — Cadastrar turnos

O sistema deverá permitir configurar os turnos utilizados pela empresa.

## RF62 — Definir horário dos turnos

Cada turno deverá possuir horário de início e término.

## RF63 — Utilizar turnos nos relatórios

Os turnos cadastrados deverão poder ser utilizados como filtro nos relatórios.

---

# Monitoramento dos dispositivos

## RF64 — Exibir status dos sensores

O sistema deverá indicar o estado dos sensores de entrada e saída.

## RF65 — Registrar última comunicação

O sistema deverá registrar a última comunicação conhecida de cada dispositivo.

## RF66 — Exibir canal atual

O sistema deverá permitir identificar se o nó está utilizando:

```text
Wi-Fi
LoRa
Local
```

## RF67 — Monitorar gateway LoRa

O sistema deverá indicar o estado do gateway conectado ao servidor.

## RF68 — Informar eventos pendentes

O sistema deverá permitir identificar quando existirem eventos aguardando sincronização local.

---

# Configurações

## RF69 — Gerenciar motivos de descarte

O sistema deverá permitir cadastrar, editar, ativar e desativar motivos.

## RF70 — Gerenciar parâmetros operacionais

O sistema deverá permitir configurar parâmetros como o limite utilizado para detecção de ociosidade.

---

# Resumo

| Categoria | Requisitos |
|---|---|
| Produção | RF01–RF03 |
| Sensoriamento | RF04–RF07 |
| Wi-Fi/MQTT | RF08–RF10 |
| LoRa | RF11–RF16 |
| Armazenamento local | RF17–RF19 |
| Deduplicação | RF20–RF21 |
| Totem | RF22–RF31 |
| Cálculos | RF32–RF36 |
| Ociosidade | RF37–RF41 |
| Aplicação Web | RF42–RF47 |
| Dashboard | RF48–RF51 |
| Relatórios | RF52–RF60 |
| Turnos | RF61–RF63 |
| Dispositivos | RF64–RF68 |
| Configurações | RF69–RF70 |