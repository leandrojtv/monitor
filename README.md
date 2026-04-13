# Monitor App (Backend + Frontend)

Aplicação de monitoramento de banco de dados com backend Node.js/PostgreSQL e frontend React/Vite.

## Stack
- **Backend:** Node.js + Express + PostgreSQL + node-cron
- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios + Lucide React + Recharts
- **Infra:** Docker + Docker Compose

## Estrutura
- `src/` → backend
- `frontend/` → frontend

## Executar tudo com Docker
```bash
docker compose up --build
```

- Backend: `http://localhost:38080`
- Frontend: `http://localhost:5173`

## Rotas backend
- `GET /health`
- `GET /api/config`
- `POST /api/config`
- `GET /api/metrics/dashboard`
- `GET /api/metrics/disk-space?limit=100`
- `GET /api/metrics/sessions?limit=100`
- `GET /api/metrics/high-cpu-queries?limit=100`

## Frontend
- Rotas:
  - `/dashboard`
  - `/configuracoes`
- Sidebar responsiva com navegação principal.
- Tema dark moderno com glassmorphism sutil e bordas arredondadas.
- Axios configurado para consumir backend via `VITE_API_URL`.


## Guia Docker completo
- Consulte `REDMED.md` para passo a passo completo (clone via Git + subida com Docker).
