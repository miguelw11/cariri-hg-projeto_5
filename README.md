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
         │ infravermelho
         ▼
     [ SOLADO ]
         │
         │ reflexão
         ▼
     E18-D80NK
```

Quando um objeto entra na região configurada, o sensor altera sua saída digital.

## Características de referência

- alimentação: 5 V DC;
- princípio: infravermelho reflexivo difuso;
- faixa nominal ajustável: aproximadamente 3 a 80 cm;
- saída: NPN;
- saída digital;
- ajuste de distância através de potenciômetro;
- detecção sem contato.

A distância efetiva depende das características da superfície detectada.

---

# 11. Atenção ao E18-D80NK

O sensor não deve ser considerado capaz de medir a distância do objeto.

Ele apenas responde:

```text
Objeto detectado
```

ou:

```text
Objeto não detectado
```

Por ser reflexivo, alguns fatores podem influenciar a detecção:

- cor do solado;
- acabamento;
- brilho;
- textura;
- inclinação;
- distância;
- iluminação;
- velocidade;
- posicionamento.

Por isso, antes da instalação definitiva, deverão ser realizados testes utilizando os próprios pares de solados produzidos pela empresa.

Devem ser testadas diferentes:

- cores;
- superfícies;
- posições;
- velocidades;
- distâncias.

---

# 12. Hardware

## Lista inicial

| Item | Quantidade | Finalidade |
|---|---:|---|
| E18-D80NK | 2 | Contagem de entrada e saída |
| ESP32 DevKit | 2 | Leitura e transmissão dos sensores |
| Fonte 5 V adequada | 2 ou 1 central | Alimentação |
| Protoboard | 2 | Desenvolvimento |
| Jumpers | 1 kit | Conexões |
| Resistores | Kit | Condicionamento de sinais |
| Cabos USB | 2 | Programação dos ESP32 |
| Caixas de proteção | 2 | Proteção da eletrônica |
| Cabos elétricos | Conforme instalação | Alimentação e sinal |
| Suportes para sensores | 2 | Fixação |
| Tablet/tela para totem | 1 | Registro de descartes |
| Suporte para tablet | 1 | Totem |
| Roteador Wi-Fi | 1 opcional | Rede local dedicada |
| Notebook | 1 | Servidor central |

---

# 13. Interface elétrica

A alimentação e a saída do modelo adquirido deverão ser verificadas antes da montagem definitiva.

O E18-D80NK utilizado como referência possui:

```text
Vermelho → +5 V
Verde    → GND
Amarelo  → saída digital
```

Como o ESP32 trabalha com GPIO de 3,3 V, a interface elétrica da saída do sensor deverá ser validada antes da conexão.

Não deverá ser aplicado diretamente um nível de tensão superior ao suportado pelo ESP32.

Dependendo da variante efetivamente adquirida, poderá ser utilizado:

- pull-up para 3,3 V;
- divisor;
- transistor;
- optoacoplador;
- outro circuito de interface.

A conexão definitiva deverá ser definida somente após confirmar eletricamente o modelo adquirido.

---

# 14. ESP32

Cada ponto de contagem terá inicialmente um ESP32.

```text
E18 entrada → ESP32 entrada

E18 saída   → ESP32 saída
```

Essa arquitetura foi escolhida para:

- reduzir cabeamento longo de sinal;
- permitir instalação independente;
- facilitar manutenção;
- permitir expansão;
- possibilitar monitoramento individual dos dispositivos.

---

# 15. Responsabilidade do ESP32

O ESP32 não calculará as perdas.

Sua responsabilidade será:

1. ler o sensor;
2. identificar uma passagem válida;
3. evitar múltiplas contagens da mesma passagem;
4. gerar um evento;
5. transmitir o evento ao servidor.

Fluxo:

```text
Objeto detectado
      ↓
Validar leitura
      ↓
Gerar evento
      ↓
Enviar MQTT
      ↓
Servidor
```

---

# 16. Tratamento de múltiplas leituras

Um mesmo par poderá permanecer por vários milissegundos na frente do sensor.

O sistema não pode interpretar isso como:

```text
1 → 2 → 3 → 4 → 5 pares
```

Deverá existir uma lógica de borda/estado.

Exemplo:

```text
SEM OBJETO
    ↓
OBJETO DETECTADO
    ↓
CONTAR +1
    ↓
aguardar objeto sair
    ↓
SEM OBJETO
```

Somente uma nova transição poderá produzir outra contagem.

---

# 17. Comunicação

Será utilizado inicialmente:

```text
MQTT sobre Wi-Fi
```

Arquitetura:

```text
ESP32 Entrada ──────┐
                    │
ESP32 Saída ────────┼── Wi-Fi ──► MQTT Broker
                    │
Totem ──────────────┘
```

O broker ficará instalado no notebook.

Sugestão:

```text
Eclipse Mosquitto
```

---

# 18. Tópicos MQTT

Estrutura inicial sugerida:

```text
e1/sensor/entrada/event
e1/sensor/saida/event

e1/sensor/entrada/status
e1/sensor/saida/status
```

Exemplo:

```json
{
  "device_id": "sensor-entrada-e1",
  "production_id": 15,
  "event_id": "ENT-000001",
  "timestamp": "2026-10-06T14:32:10"
}
```

O servidor será responsável por transformar cada evento válido em uma contagem.

---

# 19. Evitar eventos duplicados

Cada evento deve possuir um identificador único.

Exemplo:

```text
ENT-000001
ENT-000002
ENT-000003
```

Caso o mesmo evento seja recebido novamente:

```text
ENT-000002
```

o servidor poderá verificar que ele já foi registrado e ignorá-lo.

Isso será importante principalmente se posteriormente for implementada sincronização após falhas de rede.

---

# 20. Servidor central

O servidor será executado em um notebook.

Ele será responsável por hospedar:

```text
Mosquitto
Backend/API
Banco de dados
Dashboard
```

O notebook deverá permanecer:

- ligado;
- conectado à energia;
- conectado à rede;
- com suspensão automática desativada enquanto estiver operando.

---

# 21. Stack proposta

| Camada | Tecnologia |
|---|---|
| Sensores | E18-D80NK |
| Microcontrolador | ESP32 |
| Firmware | Arduino/C++ |
| Comunicação | MQTT |
| Broker | Eclipse Mosquitto |
| Backend | Python + FastAPI |
| Banco | PostgreSQL |
| Totem | Aplicação Web/PWA |
| Dashboard | Grafana |
| Servidor | Notebook |
| Versionamento | Git |
| Repositório | GitHub/GitLab |

---

# 22. Banco de dados

Estrutura inicial sugerida:

## production

```text
id
name
product
started_at
finished_at
status
```

Possíveis estados:

```text
OPEN
FINISHING
CLOSED
```

---

## sensor_event

```text
id
event_id
production_id
sensor_id
event_type
created_at
```

---

## loss_reason

```text
id
name
active
```

Exemplo:

```text
1 | Defeito no material
2 | Corte irregular
3 | Deformação
4 | Outro
```

A lista definitiva deverá ser fornecida/validada pela empresa.

---

## manual_loss

```text
id
production_id
reason_id
quantity
created_at
```

---

## device

```text
id
name
type
last_seen
status
```

---

# 23. Totem de registro

A aplicação da funcionária deverá ser propositalmente simples.

Tela inicial:

```text
┌────────────────────────────┐
│         ESTEIRA E1         │
│                            │
│   REGISTRAR DESCARTE       │
│                            │
└────────────────────────────┘
```

Ao selecionar:

```text
Registrar descarte

Motivo

[ Defeito no material ]
[ Corte irregular     ]
[ Deformação          ]
[ Outro               ]

Quantidade

[-]       1       [+]

[ REGISTRAR ]
```

Após o envio:

```text
✓ Descarte registrado
```

E retornar à tela principal.

---

# 24. Correção de lançamento

Deverá existir uma forma controlada de corrigir um lançamento incorreto.

Exemplo:

```text
Último registro:

2 pares
Defeito no material
14:35

[ DESFAZER ]
```

Idealmente o registro original não deverá simplesmente desaparecer do banco.

Uma futura versão poderá possuir histórico de correções.

---

# 25. Dashboard

O dashboard deverá apresentar pelo menos:

## Produção atual

```text
Enviados para E1
1.250

Finalizados
1.195

Descartados na triagem
32

Diferença momentânea
55
```

Enquanto estiver em andamento, o sistema **não deverá chamar os 55 de perda**.

---

## Produção finalizada

```text
Entrada E1             1.250
Saída E1               1.210
Perdas E1                 40
Descartes na triagem      32
Perdas observadas         72
Aproveitamento E1       96,8%
```

---

# 26. Dashboard — motivos da triagem

Exemplo:

```text
Defeito no material   ███████████  15

Corte irregular       ███████       9

Deformação            █████         6

Outro                 ██            2
```

Somente os descartes realizados na triagem possuirão motivo.

As perdas da E1 serão exibidas simplesmente como:

> Perdas identificadas durante o processo da E1.

---

# 27. Status dos dispositivos

O dashboard também deverá apresentar:

```text
Sensor Entrada E1    ONLINE
Última comunicação: agora

Sensor Saída E1      ONLINE
Última comunicação: agora

Totem                ONLINE

Servidor             ONLINE
```

Caso um dispositivo pare de enviar informações:

```text
⚠ SENSOR DE SAÍDA OFFLINE

Última comunicação:
há 3 minutos
```

Isso evita interpretar uma falha do sensor como ausência de produção.

---

# 28. Operação

## Iniciar produção

Antes de iniciar:

```text
Nova produção

Produto/Modelo:
_________________

[ INICIAR PRODUÇÃO ]
```

Não será obrigatório informar uma quantidade inicial.

---

## Produção em andamento

Enquanto estiver ativa:

- sensor inicial registra entradas;
- sensor final registra saídas;
- funcionária registra descartes;
- dashboard é atualizado.

---

## Encerramento

Quando a alimentação da esteira terminar:

```text
[ FINALIZAR PRODUÇÃO ]
```

O sistema deverá solicitar confirmação:

```text
A entrada de novos produtos foi encerrada
e a E1 está vazia?

[ CANCELAR ]

[ CONFIRMAR ENCERRAMENTO ]
```

Somente então:

```text
Entrada - saída
```

será consolidada como perda da E1.

---

# 29. Tempo real

O requisito de tempo real do projeto será definido como:

> Eventos registrados pelos sensores ou pelo totem devem aparecer no sistema em poucos segundos.

Não há necessidade de processamento em milissegundos para o dashboard.

Exemplo esperado:

```text
14:20:01
Sensor detecta produto

14:20:01
ESP32 publica evento

14:20:01
Servidor registra

14:20:02
Dashboard apresenta nova contagem
```

---

# 30. Funcionamento sem internet

O sistema deverá ser projetado para operar em uma rede local.

Internet externa não deverá ser requisito para:

- contar produtos;
- registrar descartes;
- salvar dados;
- utilizar o dashboard.

Exemplo:

```text
       ROTEADOR / REDE LOCAL

     ┌───────┼────────┐
     │       │        │
   ESP32   ESP32   NOTEBOOK
                      │
                    TABLET
```

O roteador pode operar mesmo sem conexão com a internet.

---

# 31. Falha de comunicação

Uma evolução planejada é permitir que os ESP32 armazenem temporariamente eventos quando a rede não estiver disponível.

```text
Rede disponível
      ↓
publica normalmente


Rede indisponível
      ↓
armazena evento
      ↓
aguarda conexão
      ↓
sincroniza
```

Essa funcionalidade poderá ser implementada após a validação do MVP.

---

# 32. Estrutura sugerida do repositório

```text
monitoramento-e1/
│
├── README.md
│
├── firmware/
│   ├── sensor-entrada/
│   │   └── sensor-entrada.ino
│   │
│   └── sensor-saida/
│       └── sensor-saida.ino
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── mqtt/
│   │
│   └── requirements.txt
│
├── totem/
│   ├── src/
│   └── package.json
│
├── database/
│   ├── migrations/
│   └── schema.sql
│
├── dashboard/
│   └── grafana/
│
├── docs/
│   ├── arquitetura/
│   ├── hardware/
│   ├── testes/
│   └── imagens/
│
└── docker/
    └── docker-compose.yml
```

---

# 33. Desenvolvimento

A equipe é formada por quatro integrantes.

A divisão inicial sugerida é:

## Integrante 1 — Hardware e IoT

Responsabilidades:

- E18-D80NK;
- ESP32;
- circuito;
- calibração;
- firmware;
- MQTT;
- testes de contagem.

---

## Integrante 2 — Backend

Responsabilidades:

- FastAPI;
- Mosquitto;
- comunicação MQTT;
- regras de negócio;
- banco;
- processamento dos eventos;
- API.

---

## Integrante 3 — Totem

Responsabilidades:

- interface;
- usabilidade;
- motivos;
- registro dos descartes;
- integração com a API;
- PWA.

---

## Integrante 4 — Dashboard e integração

Responsabilidades:

- Grafana;
- métricas;
- consultas;
- relatórios;
- monitoramento;
- integração;
- testes do sistema completo.

---

# 34. Plano de desenvolvimento

## Fase 1 — Levantamento

Validar fisicamente:

- local do sensor inicial;
- local do sensor final;
- altura;
- distância;
- largura da E1;
- velocidade;
- forma como os pares passam;
- cores dos solados;
- iluminação;
- disponibilidade de energia;
- Wi-Fi;
- motivos reais utilizados pela funcionária.

---

## Fase 2 — Bancada do E18-D80NK

Montar:

```text
E18-D80NK
    ↓
ESP32
    ↓
Serial Monitor
```

Objetivo:

validar a capacidade de contar corretamente os pares.

---

## Fase 3 — Teste de repetibilidade

Testar:

- 100 passagens;
- velocidades diferentes;
- cores diferentes;
- diferentes distâncias;
- pares próximos;
- diferentes orientações.

Registrar:

```text
Quantidade real:
Quantidade detectada:
Erros:
Precisão:
```

---

## Fase 4 — Infraestrutura

No notebook configurar:

```text
Mosquitto
PostgreSQL
FastAPI
Grafana
```

---

## Fase 5 — Simulador

Antes dos sensores reais estarem integrados, criar:

```text
[ +1 ENTRADA ]

[ +1 SAÍDA ]
```

Assim o backend e o dashboard poderão ser desenvolvidos independentemente do hardware.

---

## Fase 6 — Totem

Criar o fluxo completo de:

```text
Selecionar motivo
      ↓
Informar quantidade
      ↓
Registrar
      ↓
Banco
      ↓
Dashboard
```

---

## Fase 7 — Integração MQTT

Conectar:

```text
E18
 ↓
ESP
 ↓
MQTT
 ↓
Backend
 ↓
PostgreSQL
```

---

## Fase 8 — Dashboard

Criar:

- cards;
- gráficos;
- histórico;
- perdas;
- motivos;
- aproveitamento;
- status dos dispositivos.

---

## Fase 9 — Integração completa

Fluxo final:

```text
Sensor Entrada ─┐
                │
Totem ──────────┼──► Notebook ──► Dashboard
                │
Sensor Saída ───┘
```

---

## Fase 10 — Piloto

Levar o sistema para teste controlado na empresa.

Comparar:

```text
Contagem manual
vs.
Contagem automática
```

antes de confiar nos números para decisões reais.

---

# 35. Cenário de validação

Exemplo:

Antes da E1:

```text
Funcionária descarta:

3 → defeito no material
2 → deformação
```

Totem:

```text
Descartes = 5
```

Depois entram:

```text
100 pares
```

O sensor inicial deverá registrar:

```text
Entrada = 100
```

Durante o teste são retirados quatro pares propositalmente.

Sensor final:

```text
Saída = 96
```

No encerramento:

```text
Entrada E1           100
Saída E1              96
Perdas E1              4

Descartes triagem      5

Perdas observadas      9

Aproveitamento E1     96%
```

---

# 36. Critérios de aceitação do MVP

O MVP será considerado funcional quando conseguir:

- [ ] Detectar a passagem de pares através do E18-D80NK.
- [ ] Evitar múltiplas contagens do mesmo par.
- [ ] Enviar eventos do ESP32 para o notebook.
- [ ] Armazenar eventos no banco.
- [ ] Registrar descartes pelo totem.
- [ ] Registrar motivos.
- [ ] Atualizar o dashboard.
- [ ] Separar descartes da triagem das perdas da E1.
- [ ] Iniciar uma produção.
- [ ] Encerrar uma produção.
- [ ] Calcular corretamente as perdas da E1.
- [ ] Mostrar aproveitamento.
- [ ] Identificar sensores offline.
- [ ] Manter histórico de produções.

---

# 37. Testes

## Teste T01 — Detecção única

Passar um par lentamente pelo sensor.

Resultado esperado:

```text
+1
```

e não múltiplos incrementos.

---

## Teste T02 — 100 passagens

Passar 100 pares.

Esperado:

```text
100 ± margem definida após validação
```

A meta final deve ser definida com a empresa após os testes.

---

## Teste T03 — Diferentes cores

Testar solados:

- claros;
- escuros;
- brilhantes;
- foscos.

---

## Teste T04 — Velocidade

Executar a contagem em diferentes velocidades.

---

## Teste T05 — Sensor offline

Desconectar ESP32.

Dashboard deverá indicar falha de comunicação.

---

## Teste T06 — Produção

Entrada:

```text
100
```

Saída:

```text
96
```

Resultado:

```text
Perdas E1 = 4
```

---

## Teste T07 — Totem

Registrar:

```text
Defeito material = 2
Deformação = 3
```

Resultado:

```text
Descartes triagem = 5
```

---

# 38. Riscos conhecidos

### R01 — E18-D80NK é reflexivo

A capacidade de detecção pode variar de acordo com o material e a cor.

**Mitigação:** testes com produtos reais.

### R02 — Dois pares simultâneos

Se dois pares estiverem no campo de detecção ao mesmo tempo, podem ser contabilizados como uma única passagem.

**Mitigação:** posicionamento ou guia física que organize a passagem.

### R03 — Produto parado

Um produto parado em frente ao sensor não deverá gerar contagens repetidas.

**Mitigação:** lógica de estado no firmware.

### R04 — Wi-Fi

Falha da rede pode impedir transmissão.

**Mitigação:** monitoramento e futura fila offline.

### R05 — Notebook desligado

Sem servidor, os dados não serão processados normalmente.

**Mitigação:** operação com alimentação contínua e futura persistência no ESP32.

### R06 — Erro humano no totem

Quantidade incorreta pode ser registrada.

**Mitigação:** confirmação e função de desfazer.

---

# 39. Evoluções futuras

Após validação do MVP:

- monitoramento da E2;
- mais sensores dentro da E1;
- registro de descartes em diferentes pontos;
- operação offline do ESP32;
- autenticação dos operadores;
- dashboards por turno;
- comparação diária/semanal/mensal;
- alertas automáticos;
- migração do servidor para Raspberry Pi ou mini PC;
- integração com sistemas internos;
- aplicativo móvel;
- identificação de modelos;
- códigos QR;
- relatórios PDF/Excel;
- manutenção preditiva.

---

# 40. Visão geral

A primeira versão deverá responder quatro perguntas principais:

### 1. Quantos pares foram enviados para E1?

Resposta:

```text
Sensor inicial
```

### 2. Quantos terminaram o processo?

Resposta:

```text
Sensor final
```

### 3. Quantos foram descartados antes de entrar?

Resposta:

```text
Totem
```

### 4. Quantos foram perdidos durante a E1?

Resposta:

```text
Sensor inicial - Sensor final
```

O projeto não busca descobrir automaticamente **por que** ocorreu uma perda dentro da E1.

Seu objetivo é permitir que a empresa saiba **que ela ocorreu, em qual produção ocorreu e em qual quantidade**, mantendo paralelamente o registro dos descartes conhecidos realizados durante a triagem.

---

## Status

> Em fase inicial de desenvolvimento e validação da arquitetura.

## Equipe

Equipe de desenvolvimento — Residência PNAAT.