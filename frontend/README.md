# Frontend

Aplicação web integrada do Sistema de Monitoramento de Perdas da Esteira E1.

O frontend será responsável pelas interfaces de monitoramento, operação, relatórios, dispositivos, configurações e Totem.

## Tecnologias previstas

- React
- TypeScript
- Vite
- WebSocket
- PWA para o módulo Totem

## Estrutura inicial

```text
frontend/
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── charts/
│   │   ├── cards/
│   │   ├── forms/
│   │   └── layout/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Production/
│   │   ├── Reports/
│   │   ├── Devices/
│   │   ├── Settings/
│   │   └── Totem/
│   ├── services/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   ├── storage.ts
│   │   └── sync.ts
│   ├── hooks/
│   ├── contexts/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
└── vite.config.ts
```

A estrutura poderá ser simplificada no início e expandida conforme as funcionalidades forem implementadas.

## Módulos

### Dashboard

Deverá apresentar em tempo próximo do real:

- entrada da E1;
- saída da E1;
- diferença momentânea;
- perdas consolidadas após encerramento;
- descartes da triagem;
- aproveitamento;
- ociosidade;
- estado dos dispositivos e comunicações.

### Produção

Responsável por:

- iniciar produção;
- acompanhar produção ativa;
- solicitar encerramento;
- confirmar que a E1 está vazia;
- visualizar resultado final.

### Relatórios

Deverá permitir filtros por:

- dia;
- intervalo de datas;
- turno;
- hora;
- produção;
- motivo de descarte.

Métricas previstas:

- entrada e saída;
- produção por hora;
- descartes por motivo;
- aproveitamento;
- tempo ativo;
- tempo ocioso;
- quantidade e duração das ociosidades.

### Dispositivos

Deverá exibir:

- sensor/nó de entrada;
- sensor/nó de saída;
- gateway LoRa;
- última comunicação;
- canal atual: Wi-Fi, LoRa ou Local;
- eventos pendentes de sincronização, quando disponíveis.

### Configurações

Deverá permitir configurar, conforme permissões futuras:

- motivos de descarte;
- turnos;
- limite para detecção de ociosidade;
- parâmetros operacionais que forem definidos posteriormente.

### Totem

Interface simplificada para a funcionária responsável pela triagem.

Fluxo principal:

```text
Registrar descarte
      ↓
Selecionar motivo
      ↓
Informar quantidade
      ↓
Confirmar
```

O Totem não deverá exibir informações administrativas desnecessárias.

## Funcionamento local do Totem

Caso a comunicação com o servidor seja perdida:

1. a interface deverá continuar disponível;
2. o registro será armazenado localmente;
3. cada registro terá identificador único;
4. quando a comunicação voltar, os registros serão sincronizados;
5. o backend deverá impedir duplicações.

A estratégia inicial prevê:

- Service Worker para disponibilização da interface;
- IndexedDB para dados pendentes;
- `storage.ts` para persistência local;
- `sync.ts` para sincronização.

## Serviços

### `api.ts`

Centraliza chamadas HTTP à API.

### `websocket.ts`

Mantém a comunicação em tempo real entre backend e frontend.

### `storage.ts`

Abstrai o armazenamento local, especialmente do Totem.

### `sync.ts`

Coordena a sincronização de registros pendentes.

## Variáveis de ambiente

Exemplo:

```env
VITE_API_URL=
VITE_WS_URL=
```

O arquivo `.env` real não deverá ser versionado.

## A definir

- biblioteca de componentes visuais;
- biblioteca de gráficos;
- estratégia definitiva de autenticação e perfis;
- biblioteca ou implementação utilizada para IndexedDB;
- configuração definitiva da PWA/Service Worker;
- comportamento visual dos estados Wi-Fi, LoRa e Local;
- política de acesso às rotas;
- identidade visual final;
- necessidade de internacionalização;
- formato de exportação de relatórios, caso solicitado.