# Integração do frontend HG Industrial

## Estado atual

A aplicação opera com dados demonstrativos. `AppContext` é o ponto de substituição
do estado local por consultas/mutações reais. Nenhum endpoint foi inventado ou
acionado. A base HTTP e o cliente WebSocket estão disponíveis para adaptação.

## Responsabilidades do servidor

- Controlar a produção ativa, transições e concorrência de início/encerramento.
- Exigir a confirmação de esteira vazia antes de consolidar perdas da E1.
- Deduplicar eventos de sensores e descartes por identificador.
- Detectar ociosidade com o preset operacional de 120 segundos e persistir intervalos.
- Calcular métricas e consultar o histórico central; o frontend apenas apresenta.
- Aplicar permissões, validação, auditoria e política de correção de registros.
- Informar o estado real de nós, gateway, canais e eventos pendentes.

## Dados e contratos a acordar

Os tipos em `src/types/index.ts` descrevem a necessidade da interface, não um
contrato definitivo de FastAPI. Validar com a equipe responsável:

| Área | Contrato necessário |
|---|---|
| Produção | Listagem, produção ativa, início, solicitação/cancelamento de fechamento, confirmação de esteira vazia, resultado consolidado. |
| Descartes | UUID estável, produção, motivo, quantidade, horário original, resposta de recebimento idempotente, política de correção/cancelamento. |
| Relatórios | Semântica das datas, fuso, turnos (inclusive noturnos), horas, agrupamentos, paginação e métricas definitivas por produção completa. |
| Dispositivos | Status, canal, último evento/heartbeat, número de pendências e limites de expiração. |
| Configurações | Motivos com estado ativo/excluído, turnos, preset de ociosidade, validações e permissões. |
| WebSocket | Formato e versão das mensagens, tipo do evento, sequência/revisão, retomada/reconsulta após reconexão. |

Definir autenticação, CORS e autorização por rota antes de uso operacional. URLs
devem ser locais à infraestrutura quando a operação exigir independência da internet.
No acesso HTTPS, a API e o WebSocket também precisam de HTTPS/WSS compatíveis.

A ociosidade não é editável por funcionários. O backend deve adotar o mesmo preset
de **120 segundos** e não expor um controle de edição pela aplicação. Esse valor
precisará de validação no piloto. A exclusão de motivos deve preservar o nome/ID
para lançamentos históricos, impedindo novos registros com o motivo excluído.
Na demonstração, `deletedAt` implementa essa exclusão: motivos excluídos saem do
cadastro e do Totem, mas continuam disponíveis nas consultas históricas.

## HTTP e tempo real

`api.ts` usa `VITE_API_URL`, tempo limite de 15 segundos, cabeçalhos JSON e erros
HTTP explícitos. O adaptador deverá validar respostas em tempo de execução antes
de atualizar o estado: tipos TypeScript não validam JSON recebido pela rede.

`websocket.ts` oferece conexão, reconexão com espera crescente de até 30 segundos
e limpeza ao desmontar. Não está conectado na demonstração. Após reconexão,
reconsultar um snapshot do backend para recuperar eventos perdidos e verificar
sequência/revisão. O canal WebSocket sozinho não deve ser a fonte definitiva dos
totais. Mensagens devem ser validadas e mensagens malformadas tratadas pela integração.

## Totem e sincronização

`storage.ts` grava apenas ao concluir a transação IndexedDB. UUIDs duplicados são
rejeitados no armazenamento. Desfazer um lançamento pendente conserva o evento
como `voided`, retirando-o dos indicadores e da fila de envio.

`sync.ts` recebe um adaptador `SendDiscard`. Ele envia os registros pendentes
sequencialmente e só muda o estado para `synced` quando a resposta confirma
`accepted: true` e o **mesmo `eventId`**. Exceções, timeout ou confirmação de outro
identificador mantêm o registro pendente. A resposta idempotente do backend para
um evento já aceito também deverá reconhecer o UUID original. Os dados confirmados
continuam no histórico local.

Ao integrar:

1. Consultar e guardar snapshot da produção ativa e dos motivos antes do uso local.
2. Ligar `syncPending` ao adaptador real e a uma checagem de disponibilidade da API;
   `navigator.onLine` não prova que o servidor está acessível.
3. Informar na interface os estados Conectado, Modo Local e Sincronizando,
   pendências e falhas reais; atualizar a lista após cada sincronização.
4. Implementar retries sem recriar UUID ou mudar a produção/horário original.
5. Impedir desfazer enquanto o evento estiver sendo enviado. O bloqueio em memória
   de `sync.ts` só protege esta aba: coordenar múltiplas abas com Web Locks ou
   mecanismo equivalente, e manter deduplicação autoritativa no backend.
6. Tratar descartes registrados offline cujo ciclo foi encerrado em outro posto;
   não reassociar silenciosamente à próxima produção.
7. Implementar correção controlada dos lançamentos já sincronizados pela API,
   com autorização/auditoria. O desfazer atual só trata pendentes locais.
8. Planejar retenção, exportação/backup e proteção contra limpeza/evicção dos dados
   locais antes de uso operacional. IndexedDB não substitui o banco do servidor.

## Semântica dos relatórios demonstrativos

- Seleção de produção pela data de início em São Paulo, apenas ciclos encerrados.
- Filtros de turno e produção selecionam ciclos completos.
- Filtro de hora restringe fluxo e descartes; motivo restringe apenas descartes.
- Perdas E1, aproveitamento e ociosidade permanecem vinculados ao ciclo completo.
- Quantidade original recebida na triagem é desconhecida; descartes são um indicador
  independente. Perdas observadas não devem ser rotuladas como percentual do lote original.

O agrupamento demonstrativo usa horas do dia. Para ciclos que cruzem múltiplos dias,
o backend deverá fornecer buckets com data e hora, e a interface deverá adaptar o
eixo do gráfico. Filtros de turno usam o turno atribuído à produção; isso também
precisa ser acordado para ciclos que atravessem turnos.

## Verificações manuais antes do piloto

- Abrir diretamente cada uma das seis rotas, inclusive depois de recarregar.
- Avaliar computador, tablet em ambas as orientações e celular; tabelas têm rolagem própria.
- Navegar com teclado, usar modais por Tab/Escape e avaliar movimento reduzido.
- Solicitar encerramento: confirmação deve ficar bloqueada sem marcar esteira vazia.
- Iniciar novo ciclo: contagens começam zeradas, aproveitamento aparece como “—”.
- Registrar e desfazer descarte, recarregar e verificar persistência e indicadores.
- Desativar ou excluir motivo: impedir novos registros, preservar nomes e totais
  dos lançamentos anteriores. Testar também após recarregar a aplicação.
- Verificar que a ociosidade é apenas informativa, sem campo para editar o preset.
- No Totem, selecionar motivo e quantidade e registrar em uma única ação; verificar
  que múltiplos cliques durante a gravação não geram lançamentos repetidos.
- Validar filtros sem resultados e evitar perda definitiva derivada de fluxo horário.
- Servir build em HTTPS/localhost, instalar PWA, carregar recursos, fechar/reabrir
  offline, registrar e recarregar. Aguardar controle do Service Worker antes do teste.
- Com backend real, simular timeout, ACK inválido, reenvio de UUID, indisponibilidade
  do servidor com Wi-Fi ativo e retomada automática sem duplicação.

Os testes automatizados de métricas e fila local não substituem a avaliação visual
ou a validação em tablet com hardware/API reais.
