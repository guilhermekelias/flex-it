# Deploy na EC2 com Docker e Nginx

Este projeto usa o container `nginx` do `docker-compose.yml` como gateway publico:

- `/` encaminha para `frontend-production:80`
- `/api/` encaminha para `backend-production:3000`
- PostgreSQL e backend nao precisam expor portas na EC2

## 1. Preparar arquivos na EC2

No servidor:

```bash
sudo mkdir -p /opt/flex-it/env /opt/flex-it/nginx /opt/flex-it/certbot/www /opt/flex-it/certbot/conf
```

Copie estes arquivos do repositorio para a EC2:

```bash
docker-compose.yml -> /opt/flex-it/docker-compose.yml
deploy/nginx/default.conf.template -> /opt/flex-it/nginx/default.conf.template
deploy/nginx/default.https.conf.template -> /opt/flex-it/nginx/default.https.conf.template
deploy/env/compose.production.env.example -> /opt/flex-it/env/compose.production.env
deploy/env/backend.production.env.example -> /opt/flex-it/env/backend.production.env
deploy/env/postgres.production.env.example -> /opt/flex-it/env/postgres.production.env
```

Edite os arquivos `.env` reais antes de subir. Troque senhas, `JWT_SECRET` e `PRODUCTION_SERVER_NAME`.

## 2. Configurar dominio ou DNS da EC2

Se tiver dominio, aponte um registro `A` para o IP publico ou Elastic IP da EC2.

No arquivo `/opt/flex-it/env/compose.production.env`:

```env
PRODUCTION_SERVER_NAME=seu-dominio.com.br
```

No arquivo `/opt/flex-it/env/backend.production.env`:

```env
CORS_ORIGIN=https://seu-dominio.com.br
```

Se ainda for usar apenas HTTP, use `http://...` no `CORS_ORIGIN`.

## 3. Liberar portas na AWS

No Security Group da EC2, libere entrada:

- TCP 80 de `0.0.0.0/0`
- TCP 443 de `0.0.0.0/0`
- SSH 22 apenas para seu IP

## 4. Criar/atualizar tabelas do banco

Na primeira subida, crie o schema do PostgreSQL antes de usar a API:

```bash
cd /opt/flex-it
docker compose --env-file /opt/flex-it/env/compose.production.env up -d postgres-production
docker compose --env-file /opt/flex-it/env/compose.production.env --profile maintenance run --rm backend-migrations
```

Esse comando usa as variaveis de `/opt/flex-it/env/backend.production.env` e registra a migration aplicada na tabela `migrations`.

Para conferir as tabelas:

```bash
docker exec -it flexit-postgres-production psql -U flexit -d flexit -c "\dt"
```

Em deploys futuros, rode o mesmo `backend-migrations` depois de atualizar a imagem do backend e antes de validar a API.

## 5. Subir em HTTP primeiro

Na EC2:

```bash
cd /opt/flex-it
docker compose --env-file /opt/flex-it/env/compose.production.env up -d
docker compose --env-file /opt/flex-it/env/compose.production.env ps
docker logs flexit-nginx-gateway --tail=100
```

Teste:

```bash
curl -I http://seu-dominio.com.br
curl -i http://seu-dominio.com.br/api/
```

## 6. Gerar certificado HTTPS

So rode esta etapa se `PRODUCTION_SERVER_NAME` for um dominio apontando para a EC2.

```bash
docker run --rm \
  -v /opt/flex-it/certbot/www:/var/www/certbot \
  -v /opt/flex-it/certbot/conf:/etc/letsencrypt \
  certbot/certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email seu-email@exemplo.com \
  --agree-tos \
  --no-eff-email \
  -d seu-dominio.com.br
```

Depois troque o template HTTP pelo template HTTPS:

```bash
cp /opt/flex-it/nginx/default.https.conf.template /opt/flex-it/nginx/default.conf.template
docker compose --env-file /opt/flex-it/env/compose.production.env restart nginx
```

Teste:

```bash
curl -I https://seu-dominio.com.br
curl -i https://seu-dominio.com.br/api/
```

## 7. Renovacao do certificado

Rode periodicamente:

```bash
docker run --rm \
  -v /opt/flex-it/certbot/www:/var/www/certbot \
  -v /opt/flex-it/certbot/conf:/etc/letsencrypt \
  certbot/certbot renew --webroot --webroot-path /var/www/certbot

cd /opt/flex-it
docker compose --env-file /opt/flex-it/env/compose.production.env restart nginx
```

## Observacao sobre o frontend

A imagem Docker de producao do frontend deve ser buildada com:

```env
VITE_API_URL=/api
```

Assim o navegador chama o mesmo dominio publico (`/api/...`) e o Nginx encaminha para o backend internamente.
