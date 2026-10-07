# Firmware — Sensor de Entrada E1

Firmware do nó responsável pela contagem dos pares que entram na esteira E1.

## Hardware previsto

- ESP32-S3 LoRa/Wi-Fi;
- sensor E18-D80NK;
- módulo/adaptador microSD a definir;
- alimentação e circuito de interface a validar.

## Responsabilidades

1. ler o E18-D80NK;
2. detectar uma passagem válida;
3. impedir múltiplas contagens do mesmo par;
4. gerar `event_id`;
5. associar o evento à produção ativa;
6. transmitir via Wi-Fi/MQTT;
7. utilizar LoRa quando o canal principal falhar;
8. persistir localmente quando os dois canais falharem;
9. sincronizar eventos pendentes posteriormente;
10. enviar informações de status.

## Lógica de contagem

A detecção deverá trabalhar por transição de estado:

```text
SEM OBJETO
   ↓
OBJETO DETECTADO
   ↓
GERAR 1 EVENTO
   ↓
aguardar saída do objeto
   ↓
SEM OBJETO
```

O tempo de debounce/filtro deverá ser definido por testes físicos.

## A definir

- GPIO do E18-D80NK;
- circuito elétrico definitivo;
- distância/calibração do sensor;
- orientação física do sensor;
- pinos do microSD;
- estratégia de compartilhamento SPI, se necessária;
- formato de persistência;
- limite de eventos locais;
- política de reenvio;
- identificação definitiva do dispositivo;
- intervalo dos heartbeats/status.
