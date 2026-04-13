# Monitor Backend (Node.js + PostgreSQL)

Backend para monitoramento histórico de métricas de banco de dados.

## Stack
- Node.js + Express
- PostgreSQL
- node-cron para agendamento
- Docker + Docker Compose

## Executar com Docker
```bash
docker compose up --build
```

## Endpoints
- `GET /health`
- `GET /api/config`
- `POST /api/config`
- `GET /api/metrics/disk-space?limit=100`
- `GET /api/metrics/sessions?limit=100`
- `GET /api/metrics/high-cpu-queries?limit=100`

## Cron
O scheduler roda em `0 * * * *` (hora cheia) e valida as regras da tabela `app_config`:
- `cron_interval_days`
- `cron_days_of_week`
- `cron_hour`

Quando as condições batem, ele executa uma coleta simulada via cliente Teradata e persiste as métricas no Postgres.
