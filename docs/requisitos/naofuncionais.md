# Requisitos Não Funcionais

Este documento apresenta os requisitos não funcionais do Sistema de Monitoramento de Perdas da Esteira E1.

---

# Desempenho

## RNF01 — Atualização em tempo próximo do real

Em condições normais de operação, novos eventos deverão ser apresentados no sistema em poucos segundos.

## RNF02 — Continuidade do tempo real

Uma indisponibilidade do Wi-Fi não deverá, por si só, interromper o envio dos eventos em tempo próximo do real quando o canal LoRa estiver disponível.

## RNF03 — Mensagens compactas

As mensagens transmitidas deverão conter apenas as informações necessárias.

Isso é especialmente importante para comunicação via LoRa.

## RNF04 — Capacidade compatível com a produção

A solução deverá suportar a frequência real de passagem dos pares observada na E1.

Esse requisito deverá ser validado experimentalmente.

---

# Disponibilidade e resiliência

## RNF05 — Canal principal

Wi-Fi/MQTT deverá ser utilizado prioritariamente para comunicação entre os ESP32 e o servidor.

## RNF06 — Canal de contingência

LoRa deverá ser utilizado como canal alternativo quando o Wi-Fi/MQTT estiver indisponível.

## RNF07 — Armazenamento local como última contingência

Caso Wi-Fi e LoRa estejam indisponíveis simultaneamente, os eventos deverão poder ser mantidos localmente até que a comunicação seja restabelecida.

## RNF08 — Recuperação automática

O retorno da comunicação deverá permitir que o sistema retome automaticamente sua operação normal.

## RNF09 — Retorno ao canal prioritário

Após a recuperação do Wi-Fi, os dispositivos deverão voltar automaticamente ao canal principal.

---

# Integridade dos dados

## RNF10 — Persistência antes da confirmação

Um evento não deverá ser removido da fila local antes de sua entrega ser considerada confirmada.

## RNF11 — Idempotência

O processamento de um mesmo `event_id` mais de uma vez deverá produzir o mesmo resultado de uma única execução.

Em outras palavras, o evento deverá ser contabilizado apenas uma vez.

## RNF12 — Independência do canal

A integridade da contagem não deverá depender do canal utilizado para entregar o evento.

O mesmo evento recebido por Wi-Fi ou LoRa deverá representar a mesma passagem física.

## RNF13 — Ordem e consistência

A sincronização de eventos pendentes não deverá alterar incorretamente os resultados finais das produções.

## RNF14 — Persistência no banco

Eventos já armazenados no servidor deverão permanecer disponíveis após reinicializações normais dos serviços.

---

# Comunicação

## RNF15 — Operação sem internet externa

As funções essenciais deverão funcionar dentro da rede local e não depender de acesso à internet.

## RNF16 — Independência do LoRa

O canal LoRa não deverá depender do funcionamento da rede Wi-Fi utilizada pelo sistema.

## RNF17 — Gateway independente dos sensores

Um problema em um dos ESP32 de sensoriamento não deverá impedir o outro ponto de utilizar o gateway LoRa.

## RNF18 — Radiofrequência

Os módulos LoRa utilizados no piloto deverão operar em configuração adequada às normas aplicáveis ao uso de radiofrequência no Brasil.

A definição da frequência e do módulo deverá ser documentada em `docs/hardware/`.

---

# Servidor

## RNF19 — Disponibilidade do notebook

Durante a operação, o notebook deverá permanecer:

- ligado;
- alimentado;
- conectado aos dispositivos necessários;
- com suspensão automática desativada.

## RNF20 — Ponto central

A contingência LoRa não substitui o servidor central.

Caso o notebook esteja indisponível, os eventos deverão permanecer armazenados nos dispositivos até que o servidor volte a funcionar.

---

# Usabilidade

## RNF21 — Simplicidade do totem

O registro de um descarte deverá exigir poucas interações.

## RNF22 — Interface responsiva

O totem deverá funcionar adequadamente em tablets e computadores.

## RNF23 — Clareza do dashboard

O dashboard deverá permitir diferenciar claramente:

- entrada;
- saída;
- descartes da triagem;
- diferença momentânea;
- perdas E1;
- canal utilizado pelos sensores.

## RNF24 — Estado de comunicação visível

O usuário deverá conseguir identificar quando um dispositivo estiver:

```text
Wi-Fi
LoRa
Nuvem
```

---

# Hardware

## RNF25 — Segurança elétrica

Os componentes deverão respeitar os níveis elétricos suportados pelo ESP32.

## RNF26 — Proteção física

Na instalação piloto, os circuitos deverão possuir proteção adequada e não deverão permanecer expostos em protoboards.

## RNF27 — Fixação

Os sensores deverão permanecer fixos durante a operação para evitar alteração da calibração.

## RNF28 — Validação do E18-D80NK

O sensor deverá ser testado com diferentes produtos reais antes da instalação definitiva.

Os testes deverão considerar:

- cor;
- textura;
- posição;
- velocidade;
- distância.

## RNF29 — Validação do LoRa

A comunicação LoRa deverá ser testada no ambiente real da empresa considerando:

- distância;
- paredes;
- equipamentos industriais;
- interferências;
- posição das antenas.

---

# Arquitetura

## RNF30 — Modularidade

Os principais componentes deverão possuir responsabilidades separadas:

```text
Sensores/ESP32 → aquisição
MQTT/LoRa      → transporte
Backend        → processamento
Banco          → persistência
Totem          → registro manual
Dashboard      → visualização
```

## RNF31 — Extensibilidade

A arquitetura deverá permitir futuramente:

- novos sensores;
- outras esteiras;
- novos gateways;
- novas métricas;
- outros dashboards.

## RNF32 — Independência do dashboard

A lógica principal da solução não deverá depender do Grafana.

O dashboard poderá ser substituído futuramente sem exigir alterações significativas no firmware.

---

# Manutenção e desenvolvimento

## RNF33 — Versionamento

O código deverá ser mantido em repositório Git.

## RNF34 — Documentação

Os componentes deverão possuir documentação no diretório `docs/`.

## RNF35 — Testabilidade

Cada componente deverá poder ser testado independentemente.

Exemplos:

- backend com eventos simulados;
- LoRa sem sensores;
- sensores sem dashboard;
- dashboard com dados fictícios.

## RNF36 — Logs

O servidor deverá manter logs suficientes para auxiliar na investigação de falhas de comunicação e sincronização.

---

# Custos

## RNF37 — Baixo custo

A solução deverá priorizar componentes compatíveis com um piloto de baixo ou médio custo.

## RNF38 — Tecnologias abertas

Sempre que possível, deverão ser utilizadas ferramentas gratuitas ou de código aberto.

---

# Confiabilidade

## RNF39 — Tolerância à queda de Wi-Fi

Uma falha temporária no Wi-Fi não deverá resultar automaticamente em perda das contagens.

## RNF40 — Tolerância à falha simultânea de comunicação

Caso Wi-Fi e LoRa falhem ao mesmo tempo, os eventos deverão permanecer localmente até a recuperação de algum canal.

## RNF41 — Não duplicação

A recuperação de uma falha de comunicação não deverá gerar contagens duplicadas.

## RNF42 — Consistência das unidades

Toda a solução deverá utilizar a mesma unidade de contagem definida pelo projeto.

Inicialmente:

```text
1 unidade = 1 par de solados
```

---

# Resumo

| Categoria | Requisitos |
|---|---|
| Desempenho | RNF01–RNF04 |
| Disponibilidade | RNF05–RNF09 |
| Integridade | RNF10–RNF14 |
| Comunicação | RNF15–RNF18 |
| Servidor | RNF19–RNF20 |
| Usabilidade | RNF21–RNF24 |
| Hardware | RNF25–RNF29 |
| Arquitetura | RNF30–RNF32 |
| Manutenção | RNF33–RNF36 |
| Custos | RNF37–RNF38 |
| Confiabilidade | RNF39–RNF42 |
