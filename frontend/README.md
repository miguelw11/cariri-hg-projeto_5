# Frontend

## Versão implementada — demonstração interativa

O frontend já possui as seis páginas em **React + TypeScript + Vite**. A identidade
provisória utiliza azul `#0D5683`, prata `#BFC4C8` e fundo `#F5F7FA`, com marca em
texto, componentes compartilhados, layouts para computador/tablet/celular,
transições discretas e suporte a movimento reduzido. Ícones e recursos são locais:
a operação não depende de fontes ou scripts de CDN.

### Executar

Requer Node.js 20.19+ ou 22.12+ (validado com Node.js 24) e npm.

```bash
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`. O Vite mostra a porta efetiva se 5173 estiver ocupada.

```bash
npm test         # regras críticas de métricas e armazenamento/sincronização
npm run build   # checagem TypeScript + build + geração da PWA
npm run preview # servir o build localmente
```

### O que funciona nesta etapa

| Rota | Comportamento |
|---|---|
| `/dashboard` | Indicadores da produção ativa ou última encerrada, fluxo horário, motivos, ociosidade e dispositivos de exemplo. |
| `/producao` | Iniciar ciclo, simular contagem, solicitar encerramento, confirmar esteira vazia, consultar histórico e detalhes. |
| `/relatorios` | Filtrar ciclos encerrados por dia/intervalo, turno e produção; filtrar eventos e descartes por hora e descartes por motivo. |
| `/dispositivos` | Estados estáticos exemplificando Wi-Fi, LoRa e gateway USB, última comunicação e pendências. |
| `/configuracoes` | Cadastrar/editar/ativar/desativar motivos, cadastrar/editar turnos, configurar limite de ociosidade. |
| `/totem` | Selecionar motivo, quantidade, revisar e gravar descarte em IndexedDB; desfazer lançamento local pendente preservando histórico. |

Produções, motivos, turnos, exemplos iniciais e parâmetros ficam em `localStorage`.
Novos descartes ficam em **IndexedDB**, com UUID, produção, motivo, quantidade e
horário. Após recarregar, eles continuam disponíveis. Alterações ficam no navegador,
não são compartilhadas entre dispositivos. Descartes locais refletem nos indicadores
da mesma aplicação; as sementes de demonstração são identificadas como exemplos.

**Esta versão é demonstrativa:** não há API, sensores, autenticação, sincronização
automática real ou processamento real de ociosidade. Informar URLs no `.env` não
transforma a demonstração em aplicação conectada. Registros novos não são marcados
como sincronizados por estarem online. O limite de ociosidade é editável, mas a
detecção definitiva será feita pelo backend. Use um único dispositivo/aba para
avaliar os fluxos de produção: controle concorrente definitivo dependerá do servidor.

### PWA e funcionamento local

O build gera manifest, ícones provisórios e Service Worker com cache dos recursos
da interface. `/totem` é a rota inicial quando instalado. A instalação e o uso de
Service Worker requerem **HTTPS ou localhost**. Acessar a aplicação via HTTP pelo
IP de um notebook não garante PWA no tablet; a implantação na rede local precisará
de HTTPS confiável. Nenhum conteúdo de API é armazenado em cache como confirmação
de um lançamento.

Abra o build online ao menos uma vez e aguarde o Service Worker assumir o controle
antes de avaliar a navegação offline. O modo de desenvolvimento não habilita o
Service Worker. Atualizações oferecem um aviso para que a operadora conclua o
lançamento antes de recarregar. Se IndexedDB não estiver disponível, o Totem bloqueia
novos registros e informa o erro. Limpar os dados do site apaga registros locais:
esta etapa não oferece backup no servidor.

### Organização e decisões

- `src/components/`: layout, marca provisória, indicadores, gráficos, modal e avisos.
- `src/pages/`: os seis módulos, cada um com suas interações.
- `src/contexts/AppContext.tsx`: estado e operações da demonstração.
- `src/services/demo.ts`: exemplos coerentes com os totais e agrupamentos horários.
- `src/services/`: base HTTP/WebSocket, IndexedDB e sincronização por confirmação.
- `src/utils/metrics.ts`: métricas para apresentação, com distinção entre diferença e perda consolidada.
- `src/styles.css`: cores, componentes, pontos de adaptação e efeitos de 180–200 ms.

Bibliotecas escolhidas: React Router para rotas, Lucide para ícones e
vite-plugin-pwa/Workbox para geração do cache da interface. Os gráficos são
componentes próprios leves, sem uma biblioteca adicional. Datas são apresentadas
em português, com fuso `America/Sao_Paulo`; instantes novos são armazenados em ISO.

As rotas usam History API. Ao servir `dist/` fora do Vite, configure retorno para
`index.html` nas rotas da aplicação, preservando os recursos estáticos e as rotas
da API. A aplicação está configurada para a raiz do domínio.

Leia `INTEGRACAO.md` para contratos pendentes, conexão com o backend e verificações
manuais recomendadas. A documentação original de planejamento está preservada abaixo.

---

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
