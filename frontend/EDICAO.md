# Onde alterar o frontend manualmente

Para mudar textos, posição dos elementos ou aparência, você mexe principalmente
em **uma página e no CSS**. O restante separa navegação, dados e armazenamento.
Não é necessário editar todos os arquivos para fazer uma alteração visual.

## Arquivos principais

Os caminhos abaixo são relativos à pasta `frontend/`.

| O que alterar | Arquivo |
|---|---|
| Dashboard: números, textos e organização | `src/pages/Dashboard.tsx` |
| Tela de iniciar/encerrar produção | `src/pages/Production.tsx` |
| Relatórios e seus filtros | `src/pages/Reports.tsx` |
| Tela de dispositivos | `src/pages/Devices.tsx` |
| Configurações: motivos e turnos | `src/pages/Settings.tsx` |
| Totem: motivo, quantidade e botão de registro | `src/pages/Totem.tsx` |
| Cores, fontes, espaçamentos, tamanhos e adaptação para tablet/celular | `src/styles.css` |
| Menu lateral, cabeçalho, rodapé e componente da logo | `src/components/Layout.tsx` |
| Imagem da logo | `public/brand/hg-industrial.svg` |
| Botões de modal, cartões de indicadores e avisos compartilhados | `src/components/ui.tsx` |
| Aparência e estrutura dos gráficos | `src/components/Charts.tsx` |

Exemplos:

- Para trocar o título “Registrar descarte”, abra `src/pages/Totem.tsx` e altere o `<h1>`.
- Para trocar o azul, abra `src/styles.css` e altere `--blue` dentro de `:root`.
- Para aumentar os números do Dashboard, procure `.dashboard-stats .stat > strong` no CSS.
- Para aumentar os botões de motivo no Totem, procure `.totem-simple .reason-option`.
- Para renomear um item do menu, altere `links` em `src/components/Layout.tsx`.
- Para usar outra logo, substitua o SVG ou ajuste `src` do `<img>` em `Brand`.

O CSS tem comentários separando logo, Dashboard e Totem. As regras dentro de
`@media` ajustam o tamanho em telas menores. Alterar um componente compartilhado
ou uma regra genérica afeta todas as páginas que o utilizam.

## Quando a mudança for de funcionamento

| O que alterar | Arquivo |
|---|---|
| Rotas e páginas disponíveis | `src/App.tsx` |
| Dados de exemplo: produções, motivos, turnos e dispositivos | `src/services/demo.ts` |
| Preset operacional de ociosidade | `IDLE_LIMIT_SECONDS` em `src/services/demo.ts` |
| Iniciar/encerrar produção, registrar/desfazer descartes, salvar/excluir motivos | `src/contexts/AppContext.tsx` |
| Tipos dos dados | `src/types/index.ts` |
| Fórmulas e formatação de números/datas | `src/utils/metrics.ts` |
| Chamadas HTTP | `src/services/api.ts` |
| Conexão em tempo real | `src/services/websocket.ts` |
| Gravação de descartes no dispositivo | `src/services/storage.ts` |
| Sincronização e confirmação de recebimento | `src/services/sync.ts` |
| Manifest, instalação e cache da PWA | `vite.config.ts` e `public/icons/` |

O preset atual é **120 segundos (2 minutos)**, sem edição pela interface. Se esse
valor operacional mudar, atualize a constante, o backend e os testes/documentação
correspondentes. Alterar a constante sozinha não implementa detecção real de paradas.

A exclusão de motivos usa `deleteDemoReason` em `src/services/demo.ts` para manter
as referências históricas. Não apague manualmente um motivo do array se já houver
descartes associados a ele.

Os exemplos são inicializados uma vez e ficam salvos no navegador. Editar
`demo.ts` não substitui automaticamente a demonstração que já está salva.
Para avaliar novas sementes sem apagar registros existentes, use outro perfil
de navegador. Os motivos/turnos também podem ser alterados pela própria interface.

## Por que há outros arquivos?

- `package.json`: lista bibliotecas e comandos. Edite ao adicionar uma biblioteca ou script.
- `package-lock.json`: gerado pelo npm para fixar versões. Não edite manualmente.
- `node_modules/`: dependências instaladas. Não é código da aplicação e não vai ao GitHub.
- `dist/`: resultado gerado pelo build. Não edite; faça mudanças em `src/`.
- `*.test.ts` / `*.test.tsx`: verificações de regras e telas. Não controlam o visual.
- `tsconfig.json`, `main.tsx` e `index.html`: configuração e entrada da aplicação; raramente precisam mudar.
- `.prettierrc.json`: padrão de indentação. `npm run format` organiza o código automaticamente.

## Conferir suas alterações

```bash
cd frontend
npm run dev
```

O Vite atualiza a página ao salvar arquivos. Depois de mudar comportamento:

```bash
npm test
npm run build
```

Se estiver usando a PWA instalada, um build novo pode oferecer “Atualizar”.
Para desenvolvimento, prefira `npm run dev`, que não ativa o cache da PWA.
