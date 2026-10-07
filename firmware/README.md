# Firmware

Firmwares utilizados pelos dispositivos ESP32-S3 do projeto.

## Dispositivos previstos

```text
firmware/
├── sensor-entrada/
├── sensor-saida/
└── gateway-lora/
```

### Nó de entrada

Responsável por contar os pares que entram na E1.

### Nó de saída

Responsável por contar os pares que concluem a E1.

### Gateway LoRa

Responsável por receber mensagens LoRa dos nós e encaminhá-las ao servidor através de USB/Serial.

## Hierarquia de comunicação dos nós

```text
Wi-Fi/MQTT
    ↓ falhou
LoRa
    ↓ falhou
Local
```

O armazenamento local servirá como última camada de proteção.

## Evento

Todo evento deverá possuir identificador único e dados suficientes para que o backend determine sua origem e produção.

Contrato conceitual:

```json
{
  "event_id": "ENT-000001",
  "device_id": "sensor-entrada-e1",
  "production_id": 1,
  "timestamp": "...",
  "type": "passage"
}
```

O contrato definitivo será documentado em `docs/comunicacao/README.md`.

## Reutilização de código

Como os nós de entrada e saída terão comportamento semelhante, deverá ser avaliada a criação de código/biblioteca compartilhada para:

- Wi-Fi;
- MQTT;
- LoRa;
- geração de IDs;
- persistência local;
- sincronização;
- watchdog/status.

## A definir

- framework de desenvolvimento: Arduino ou ESP-IDF;
- modelo exato do ESP32-S3 LoRa/Wi-Fi;
- frequência e parâmetros LoRa;
- biblioteca LoRa;
- estratégia de microSD;
- filesystem;
- formato do log local;
- mecanismo de ACK;
- sincronização de relógio;
- gerenciamento de configuração de rede;
- atualização de firmware.
