# Requisitos Não Funcionais

Este documento apresenta os requisitos não funcionais do Sistema de Monitoramento de Perdas da Esteira E1.

---

# Desempenho

## RNF01 — Atualização em tempo próximo do real

Em condições normais, novos eventos deverão aparecer na aplicação em poucos segundos.

## RNF02 — Continuidade durante falha de Wi-Fi

Uma indisponibilidade do Wi-Fi não deverá interromper o envio em tempo próximo do real enquanto LoRa estiver disponível.

## RNF03 — Mensagens compactas

As mensagens utilizadas pelos dispositivos deverão conter apenas os dados necessários ao processamento.

## RNF04 — Capacidade compatível com a produção

O sistema deverá suportar a frequência real de passagem observada na E1.

A capacidade deverá ser validada experimentalmente.

---

# Disponibilidade

## RNF05 — Canal principal

Wi-Fi/MQTT deverá ser utilizado prioritariamente.

## RNF06 — Canal de contingência

LoRa deverá ser utilizado quando o canal principal estiver indisponível.

## RNF07 — Armazenamento local

Caso os dois canais estejam indisponíveis, os eventos deverão permanecer armazenados localmente.

## RNF08 — Recuperação automática

O retorno dos canais deverá permitir retomada automática do funcionamento normal.

## RNF09 — Retorno ao canal prioritário

Após a recuperação do Wi-Fi, o sistema deverá retornar automaticamente ao canal principal.

---

# Integridade

## RNF10 — Persistência até confirmação

Um evento não deverá ser descartado localmente antes de sua entrega ser confirmada.

## RNF11 — Idempotência

O processamento repetido do mesmo `event_id` não deverá gerar contagens adicionais.

## RNF12 — Independência do canal

A contagem deverá produzir o mesmo resultado independentemente do canal utilizado.

## RNF13 — Persistência no banco

Dados já registrados deverão permanecer disponíveis após reinicializações normais.

---

# Comunicação

## RNF14 — Operação sem internet externa

As funções essenciais deverão operar dentro da infraestrutura local.

## RNF15 — Independência do LoRa

A operação LoRa não deverá depender da rede Wi-Fi.

## RNF16 — Gateway via serial

O gateway LoRa deverá possuir comunicação direta com o servidor principal através de USB/Serial.

## RNF17 — Radiofrequência

Os dispositivos utilizados no piloto deverão respeitar as regulamentações aplicáveis ao uso de radiofrequência.

---

# Servidor

## RNF18 — Disponibilidade do notebook

Durante a operação, o notebook deverá permanecer ligado, alimentado e sem suspensão automática.

## RNF19 — Servidor central

A indisponibilidade do notebook não deverá ser confundida com perda de produção.

Os nós deverão preservar localmente os eventos ainda não entregues.

---

# Aplicação web

## RNF20 — Aplicação integrada

Dashboard, Produção, Relatórios, Dispositivos, Configurações e Totem deverão fazer parte de uma única aplicação web.

## RNF21 — Modularidade da interface

Cada módulo deverá possuir responsabilidades e interface adequadas ao seu contexto de utilização.

## RNF22 — Navegação independente

Cada módulo deverá possuir rota própria dentro da aplicação.

## RNF23 — Backend compartilhado

Todos os módulos deverão utilizar a mesma API e fonte central de dados.

## RNF24 — Responsividade

A aplicação deverá funcionar adequadamente em computadores e tablets compatíveis com o projeto.

---

# Totem

## RNF25 — Simplicidade

O registro de descartes deverá exigir poucas interações.

## RNF26 — PWA

O módulo Totem deverá ser projetado para permitir instalação e funcionamento semelhante a uma aplicação no tablet.

## RNF27 — Funcionamento local

Após os recursos necessários terem sido carregados, uma indisponibilidade temporária do servidor/rede não deverá impedir a realização de novos registros no Totem.

## RNF28 — Persistência local do Totem

Registros ainda não sincronizados deverão permanecer disponíveis no dispositivo.

## RNF29 — Estado de conexão visível

O Totem deverá informar claramente estados como:

```text
Conectado
Modo Local
Sincronizando
```

---

# Usabilidade

## RNF30 — Clareza do Dashboard

Entrada, saída, descartes, perdas, ociosidade e situação da produção deverão ser facilmente diferenciados.

## RNF31 — Diferença momentânea

A aplicação não deverá apresentar a diferença momentânea de uma produção ativa como perda definitiva.

## RNF32 — Clareza dos relatórios

Filtros ativos e intervalos utilizados deverão permanecer visíveis durante a análise dos relatórios.

---

# Hardware

## RNF33 — Segurança elétrica

Os níveis elétricos dos sensores deverão ser compatíveis com os ESP32-S3 utilizados.

## RNF34 — Proteção física

Na instalação piloto, os componentes não deverão permanecer expostos em protoboards.

## RNF35 — Fixação

Os sensores deverão permanecer posicionados de maneira estável.

## RNF36 — Validação do E18-D80NK

O sensor deverá ser testado com produtos reais considerando:

- cores;
- textura;
- distância;
- posicionamento;
- velocidade.

## RNF37 — Validação do LoRa

A comunicação deverá ser testada no ambiente real considerando obstáculos e interferências.

## RNF38 — Armazenamento removível

Caso seja adotado microSD, a escolha do adaptador, filesystem e mecanismo de gravação deverá ser validada antes da instalação definitiva.

---

# Ociosidade

## RNF39 — Configurabilidade

O limite utilizado para determinar o início da ociosidade não deverá ficar fixo diretamente no código.

## RNF40 — Consistência temporal

Os dispositivos e servidor deverão utilizar referências temporais adequadas para permitir análises por hora, turno e duração.

---

# Relatórios

## RNF41 — Desempenho das consultas

As consultas de métricas deverão possuir desempenho adequado para uso interativo nos volumes de dados esperados para o piloto.

## RNF42 — Consistência dos filtros

Filtros diferentes aplicados sobre o mesmo conjunto de dados deverão produzir resultados coerentes entre si.

## RNF43 — Perda definitiva por produção

Relatórios horários não deverão calcular simplesmente `entrada - saída` como perda definitiva quando os eventos puderem atravessar intervalos diferentes.

---

# Arquitetura

## RNF44 — Modularidade

Os componentes deverão possuir responsabilidades separadas:

```text
Sensores/ESP32-S3 → aquisição
MQTT/LoRa         → transporte
Gateway           → recepção LoRa
Backend           → processamento
Banco             → persistência
Frontend          → interação e visualização
```

## RNF45 — Extensibilidade

A arquitetura deverá permitir inclusão futura de:

- outras esteiras;
- novos dispositivos;
- novos indicadores;
- novos relatórios.

## RNF46 — Independência do frontend

As regras principais de negócio não deverão depender diretamente da interface web.

---

# Manutenção

## RNF47 — Versionamento

Código e documentação deverão ser mantidos utilizando Git.

## RNF48 — Organização do repositório

Frontend, backend, firmware, banco de dados e documentação deverão permanecer organizados em diretórios separados.

## RNF49 — Documentação

Os componentes deverão possuir documentação suficiente para configuração e manutenção.

## RNF50 — Testabilidade

Cada camada deverá poder ser testada de forma independente.

---

# Confiabilidade

## RNF51 — Tolerância à queda do Wi-Fi

Uma falha temporária do Wi-Fi não deverá causar perda das contagens.

## RNF52 — Tolerância à falha Wi-Fi + LoRa

Se ambos os canais falharem, os eventos deverão permanecer localmente até sincronização posterior.

## RNF53 — Não duplicação

Recuperações de conexão não deverão gerar eventos duplicados.

## RNF54 — Consistência da unidade

Toda a solução deverá utilizar a mesma unidade de contagem.

Inicialmente:

```text
1 unidade = 1 par de solados
```

---

# Custos

## RNF55 — Baixo custo

A solução deverá priorizar componentes compatíveis com um piloto de baixo ou médio custo.

## RNF56 — Tecnologias abertas

Sempre que possível deverão ser utilizadas ferramentas gratuitas ou de código aberto.