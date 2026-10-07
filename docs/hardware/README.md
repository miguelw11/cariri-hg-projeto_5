# Hardware

Documentação dos componentes físicos da solução.

## Componentes principais previstos

| Item | Quantidade inicial | Finalidade |
|---|---:|---|
| E18-D80NK | 2 | Contagem de entrada e saída |
| ESP32-S3 LoRa/Wi-Fi | 3 | Dois nós + um gateway |
| Adaptador microSD | 2 | Persistência local dos nós |
| microSD | 2 | Armazenamento de contingência |
| Tablet | 1 | Totem |
| Notebook | 1 | Servidor principal |
| Fontes/cabos | A definir | Alimentação |
| Caixas e suportes | A definir | Instalação |

## E18-D80NK

Será necessário validar:

- cores e acabamentos dos solados;
- distância;
- orientação;
- velocidade;
- iluminação;
- passagem de pares próximos;
- possibilidade de dois pares simultâneos.

## ESP32-S3 LoRa/Wi-Fi

Deverá ser escolhida uma placa que permita:

- Wi-Fi;
- comunicação LoRa adequada;
- conexão do E18-D80NK;
- microSD nos nós;
- USB/Serial no gateway.

## microSD

Previsto nos dois nós de sensoriamento.

Antes da escolha definitiva, validar:

- pinos disponíveis;
- compartilhamento do barramento SPI;
- biblioteca;
- filesystem;
- resistência a muitas gravações;
- estratégia de recuperação.

## Instalação

Protoboard será utilizada apenas no desenvolvimento.

Para piloto:

- caixas apropriadas;
- fixação mecânica;
- cabos organizados;
- fontes adequadas;
- proteção dos circuitos.

## A definir

- modelo exato dos ESP32-S3 LoRa/Wi-Fi;
- frequência LoRa;
- antenas;
- adaptador microSD;
- cartões;
- fontes;
- circuito do E18-D80NK;
- conectores;
- caixas;
- suportes;
- comprimento dos cabos;
- necessidade de roteador dedicado;
- homologação/regulamentação do rádio escolhido.
