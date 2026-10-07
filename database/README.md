# Banco de Dados

Documentação estrutural do PostgreSQL utilizado pelo projeto.

Este diretório representa a evolução do schema do banco. A configuração de conexão utilizada pelo backend permanece em `backend/app/database/`.

## Estrutura

```text
database/
├── migrations/
├── seeds/
├── schema.sql
└── README.md
```

## Entidades previstas

A modelagem ainda será refinada, mas inicialmente deverá contemplar conceitos como:

- `production`;
- `sensor_event`;
- `manual_loss`;
- `loss_reason`;
- `device`;
- `idle_period`;
- `shift`.

## Responsabilidades

### `migrations/`

Alterações versionadas da estrutura do banco.

### `seeds/`

Dados iniciais úteis para desenvolvimento ou configuração.

Exemplos:

- motivos padrão de descarte;
- dispositivos conhecidos;
- configurações iniciais de teste.

### `schema.sql`

Pode ser utilizado como referência consolidada do schema, caso essa abordagem permaneça no projeto.

## Regras importantes

- `event_id` de eventos de sensor deverá possuir restrição capaz de impedir duplicidade;
- registros sincronizados pelo Totem também deverão possuir identificador único;
- horários deverão ser armazenados de forma consistente;
- produções encerradas deverão preservar seu histórico;
- correções de registros não deverão comprometer rastreabilidade.

## A definir

- ORM utilizado pelo backend;
- ferramenta de migrations;
- nomes e tipos finais das tabelas;
- relacionamentos;
- índices;
- política de exclusão;
- retenção histórica;
- auditoria de alterações;
- backup;
- timezone adotado no banco.
