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
- `NGINX_SSL_PORT`
- `VITE_API_URL=/api`

## HTTPS com host customizado (mkcert)

1. Crie a pasta `certs` na raiz do projeto.
2. Gere certificados locais com mkcert:

```bash
mkcert -install
mkcert -key-file certs/codewear.local-key.pem -cert-file certs/codewear.local.pem codewear.local localhost 127.0.0.1 ::1
```

3. Adicione o host local no arquivo de hosts do sistema:

Windows (`C:\Windows\System32\drivers\etc\hosts`):

```text
127.0.0.1 codewear.local
```

## 2) Iniciar tudo

Na raiz do repositorio:

```bash
docker compose up --build -d
```

## 3) Validar os servicos

- Aplicacao via Nginx: `http://localhost:80`
- Aplicacao via Nginx HTTPS: `https://codewear.local`
- API via Nginx: `http://localhost:80/api/products`
- API via Nginx HTTPS: `https://codewear.local/api/products`

Observacao: por seguranca e isolamento de rede, apenas o Nginx fica exposto fora dos containers.

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
