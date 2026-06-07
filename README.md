# CodeWear - Guia Rapido de DevOps

Este repositorio usa Docker Compose com 4 servicos:
- MySQL (db)
- Backend (Node + Express)
- Frontend (Vite)
- Nginx (proxy reverso)

## 1) Configurar ambiente

1. Copie `.env.example` para `.env`.
2. Ajuste os valores somente se necessario.

Principais variaveis:
- `DB_PASSWORD`
- `BACKEND_PORT`
- `FRONTEND_PORT`
- `NGINX_PORT`
- `VITE_API_URL=/api`

## 2) Iniciar tudo

Na raiz do repositorio:

```bash
docker compose up --build -d
```

## 3) Validar os servicos

- Aplicacao via Nginx: `http://localhost:80`
- API via Nginx: `http://localhost:80/api/products`
- Backend direto (opcional): `http://localhost:3000/products`

Ver containers em execucao:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
```

## 4) Parar os servicos

```bash
docker compose down
```

Para remover tambem o volume do MySQL:

```bash
docker compose down -v
```
