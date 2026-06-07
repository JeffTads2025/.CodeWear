# CodeWear - DevOps Quick Start

This repository uses Docker Compose with 4 services:
- MySQL (db)
- Backend (Node + Express)
- Frontend (Vite)
- Nginx (reverse proxy)

## 1) Configure environment

1. Copy `.env.example` to `.env`.
2. Adjust values only if needed.

Default key values:
- `DB_PASSWORD`
- `BACKEND_PORT`
- `FRONTEND_PORT`
- `NGINX_PORT`
- `VITE_API_URL=/api`

## 2) Start everything

From repository root:

```bash
docker compose up --build -d
```

## 3) Validate services

- App via Nginx: `http://localhost:80`
- API via Nginx: `http://localhost:80/api/products`
- Backend direct (optional): `http://localhost:3000/products`

Check running containers:

```bash
docker compose ps
```

Check logs:

```bash
docker compose logs -f
```

## 4) Stop services

```bash
docker compose down
```

To also remove MySQL data volume:

```bash
docker compose down -v
```
