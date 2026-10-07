# Firmware — Sensor de Saída E1

Firmware do nó responsável pela contagem dos pares que chegam ao final da esteira E1.

Sua lógica deverá permanecer o mais próxima possível do nó de entrada, diferenciando principalmente a identificação e o tipo do evento.

## Hardware previsto

- ESP32-S3 LoRa/Wi-Fi;
- sensor E18-D80NK;
- módulo/adaptador microSD a definir;
- alimentação e circuito de interface a validar.

## Responsabilidades

1. ler o E18-D80NK;
2. detectar uma passagem válida;
3. impedir múltiplas contagens;
4. gerar `event_id`;
5. associar o evento à produção ativa;
6. transmitir via Wi-Fi/MQTT;
7. utilizar LoRa como contingência;
8. armazenar localmente quando necessário;
9. sincronizar eventos pendentes;
10. enviar status.

## A definir

- GPIO do sensor;
- calibração;
- circuito elétrico;
- montagem física;
- estratégia de microSD;
- política de reenvio;
- heartbeats;
- parâmetros LoRa;
- forma de receber/identificar a produção ativa.
