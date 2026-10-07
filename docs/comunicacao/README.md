# Comunicação

Documentação dos canais de comunicação e dos mecanismos de contingência.

## Prioridade

```text
1. Wi-Fi + MQTT
2. LoRa
3. Local
```

## Wi-Fi + MQTT

Canal principal.

Os nós deverão publicar eventos e receber confirmação suficiente para saber se o dado pode ser considerado entregue.

## LoRa

Canal de contingência para manter envio próximo do tempo real quando o Wi-Fi falhar.

```text
Nó → LoRa → Gateway ESP32-S3 → USB/Serial → Notebook
```

## Local

Caso Wi-Fi e LoRa falhem, os nós deverão persistir eventos localmente.

A solução prevista é microSD, ainda sujeita a validação.

## Deduplicação

O mesmo evento poderá chegar por:

- MQTT;
- LoRa;
- sincronização local.

O backend deverá usar `event_id` para processá-lo apenas uma vez.

## Totem

O Totem não utilizará LoRa inicialmente.

Em falha de Wi-Fi:

```text
Totem → IndexedDB/local → sincronização posterior
```

## Contrato preliminar do evento

```json
{
  "event_id": "ENT-000001",
  "device_id": "sensor-entrada-e1",
  "production_id": 1,
  "timestamp": "...",
  "type": "passage"
}
```

## A definir

- tópicos MQTT;
- QoS;
- keep-alive;
- ACK;
- payload definitivo;
- compactação do payload LoRa;
- frequência;
- parâmetros LoRa;
- protocolo serial;
- baud rate;
- formato de heartbeat;
- sincronização de relógio;
- timeout para alternar Wi-Fi → LoRa;
- timeout para estado Local;
- política de retorno LoRa → Wi-Fi.
