# Arquitetura

Documentação da arquitetura lógica e física da solução.

## Visão geral

```text
E18 Entrada → ESP32-S3 ──Wi-Fi/MQTT──┐
                     └──LoRa──────┐   │
                                  ▼   │
E18 Saída   → ESP32-S3 ──Wi-Fi───┼───┤
                     └──LoRa──────┘   │
                                  Gateway
                                     │ USB/Serial
                                     ▼
                                  Notebook
                                     │
                       Backend + PostgreSQL
                                     │
                              Aplicação Web
```

## Camadas

### Aquisição

E18-D80NK + ESP32-S3.

### Transporte

- Wi-Fi/MQTT: principal;
- LoRa: contingência;
- Local: última camada de persistência.

### Processamento

Backend FastAPI.

### Persistência

PostgreSQL.

### Apresentação

Aplicação web integrada:

- Dashboard;
- Produção;
- Relatórios;
- Dispositivos;
- Configurações;
- Totem/PWA.

## Princípios

- eventos identificados de forma única;
- backend idempotente;
- regras de negócio fora do firmware;
- módulos desacoplados;
- operação essencial sem internet externa;
- possibilidade de expansão para outras linhas.

## A definir

- diagrama definitivo de implantação;
- autenticação e perfis;
- topologia da rede local;
- forma como os nós conhecem a produção ativa;
- protocolo de sincronização;
- implantação/execução dos serviços no notebook;
- estratégia futura de alta disponibilidade do servidor.
