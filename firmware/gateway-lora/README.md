# Firmware — Gateway LoRa

Firmware do ESP32-S3 responsável por receber eventos LoRa dos nós de entrada e saída e encaminhá-los ao notebook servidor através de USB/Serial.

## Fluxo

```text
Nó entrada ──LoRa──┐
                   ├──► Gateway ──USB/Serial──► Notebook
Nó saída ────LoRa──┘
```

## Responsabilidades

- permanecer em recepção LoRa;
- validar minimamente o pacote recebido;
- encaminhar o pacote pela serial;
- preservar o `event_id`;
- informar ao servidor a origem LoRa;
- disponibilizar informações de status do gateway.

O gateway não deverá calcular perdas nem alterar as regras de negócio.

## Armazenamento

Inicialmente, não está previsto microSD no gateway.

Os próprios nós de sensoriamento serão responsáveis por manter eventos pendentes quando não conseguirem entregá-los.

Essa decisão poderá ser revista após os testes de confiabilidade.

## A definir

- modelo exato da placa;
- frequência e parâmetros LoRa;
- protocolo serial;
- baud rate;
- formato do pacote;
- mecanismo de confirmação entre notebook e gateway;
- necessidade de buffer temporário no gateway;
- watchdog;
- comportamento em caso de desconexão USB.
