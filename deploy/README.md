# Deploy na EC2 com Docker, Nginx e HTTPS

Este projeto usa o container `nginx` do Compose como gateway publico:

- `/` encaminha para `frontend-production:80`
- `/api/` encaminha para `backend-production:3000`
- PostgreSQL e backend nao expoem portas na EC2
- HTTP porta `80` serve o desafio do Let's Encrypt e depois redireciona para HTTPS
- HTTPS porta `443` serve frontend e API via proxy reverso

## 1. Pre-requisitos

Antes de emitir o certificado:

- Tenha um dominio real, por exemplo `flex-it.online`.
- Crie um registro DNS `A` apontando esse dominio para o IP publico ou Elastic IP da EC2.
- No Security Group da EC2, libere entrada TCP `80` e `443` para `0.0.0.0/0`.
- Se usar IPv6 no DNS, libere tambem `::/0` para `80` e `443`.
- Mantenha SSH `22` liberado apenas para o seu IP.
- Nao exponha `3000` nem `5432`; backend e banco devem ficar somente na rede Docker.

Registros recomendados na Hostinger:

| Type | Name | Points to |
| --- | --- | --- |
| A | @ | 18.225.250.255 |
| CNAME | www | flex-it.online |

Remova registros `A`, `AAAA`, `CNAME` ou `ALIAS` conflitantes para `@` e `www`. Se a EC2 nao tiver Elastic IP, esse IP pode mudar quando a instancia for parada e iniciada; para producao, prefira associar um Elastic IP antes de configurar o DNS e emitir o certificado.

Para conferir o DNS na EC2:

```bash
DOMAIN=flex-it.online
dig +short "$DOMAIN"
curl -4 ifconfig.me
```

O IP retornado pelo `dig` deve ser o mesmo IP publico da EC2. Se `dig` nao estiver instalado, use:

```bash
nslookup "$DOMAIN"
```

Use um dominio seu para Let's Encrypt. Nao conte com o hostname publico `ec2-...amazonaws.com` para o certificado de producao.

### Sobre o DNS publico automatico da EC2

O valor abaixo e o hostname publico automatico da AWS:

```env
PRODUCTION_SERVER_NAME=ec2-18-225-250-255.us-east-2.compute.amazonaws.com
```

Ele pode ser usado para testar o ambiente em HTTP. Para esse teste, deixe o backend assim:

```env
CORS_ORIGIN=http://ec2-18-225-250-255.us-east-2.compute.amazonaws.com
```

Para HTTPS com Let's Encrypt, a recomendacao segura e usar um dominio proprio, como `flex-it.online`, apontando para o IP publico ou Elastic IP da EC2:

```env
PRODUCTION_SERVER_NAME=flex-it.online
CORS_ORIGIN=https://flex-it.online
```

O hostname `ec2-...compute.amazonaws.com` pertence a AWS, pode mudar quando a instancia muda de IP e pode ser recusado por politicas da autoridade certificadora. O fluxo de Certbot deste guia assume um dominio que voce controla.

## 2. Preparar arquivos na EC2

No servidor:

```bash
sudo mkdir -p /opt/flex-it/env /opt/flex-it/nginx /opt/flex-it/certbot/www /opt/flex-it/certbot/conf
```

Copie estes arquivos do repositorio para a EC2:

```bash
docker-compose.production.yml -> /opt/flex-it/docker-compose.yml
deploy/nginx/default.conf.template -> /opt/flex-it/nginx/default.conf.template
deploy/nginx/default.https.conf.template -> /opt/flex-it/nginx/default.https.conf.template
deploy/env/compose.production.env.example -> /opt/flex-it/env/compose.production.env
deploy/env/backend.production.env.example -> /opt/flex-it/env/backend.production.env
deploy/env/postgres.production.env.example -> /opt/flex-it/env/postgres.production.env
```

Edite os arquivos reais antes de subir:

```bash
sudo nano /opt/flex-it/env/compose.production.env
sudo nano /opt/flex-it/env/backend.production.env
sudo nano /opt/flex-it/env/postgres.production.env
```

Valores importantes em `/opt/flex-it/env/compose.production.env`:

```env
PRODUCTION_SERVER_NAME=flex-it.online
PRODUCTION_SERVER_ALIASES=www.flex-it.online
CERTBOT_EMAIL=seu-email@exemplo.com
CLIENT_MAX_BODY_SIZE=25m
```

Valores importantes em `/opt/flex-it/env/backend.production.env`:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://flex-it.online
DB_HOST=postgres-production
DB_PORT=5432
DB_USERNAME=flexit
DB_PASSWORD=troque_esta_senha
DB_DATABASE=flexit
DB_SYNCHRONIZE=false
DB_SSL=false
JWT_SECRET=troque_por_uma_chave_longa_e_aleatoria
JWT_EXPIRES_IN=1h
```

Se voce ainda precisar testar o app inteiro em HTTP antes do certificado, use temporariamente:

```env
CORS_ORIGIN=http://flex-it.online,https://flex-it.online
```

Depois que HTTPS estiver funcionando, volte para apenas `https://flex-it.online`.

## 3. Subir banco e migrations

Na primeira subida, crie o schema do PostgreSQL antes de usar a API:

```bash
cd /opt/flex-it
docker compose --env-file /opt/flex-it/env/compose.production.env up -d postgres-production
docker compose --env-file /opt/flex-it/env/compose.production.env --profile maintenance run --rm backend-migrations
```

Para conferir as tabelas:

```bash
docker exec -it flexit-postgres-production psql -U flexit -d flexit -c "\dt"
```

Em deploys futuros, rode `backend-migrations` depois de atualizar a imagem do backend e antes de validar a API.

## 4. Subir primeiro em HTTP

O primeiro start deve usar `default.conf.template`, que serve HTTP e o caminho do desafio ACME.

```bash
cd /opt/flex-it
docker compose --env-file /opt/flex-it/env/compose.production.env up -d
docker compose --env-file /opt/flex-it/env/compose.production.env ps
docker logs flexit-nginx-gateway --tail=100
```

Teste:

```bash
set -a
. /opt/flex-it/env/compose.production.env
set +a

curl -I "http://$PRODUCTION_SERVER_NAME"
curl -i "http://$PRODUCTION_SERVER_NAME/api/"
```

O segundo comando deve chegar no backend e retornar `Hello World!`.

## 5. Emitir certificado Let's Encrypt

So rode esta etapa depois que:

- `PRODUCTION_SERVER_NAME` for um dominio real.
- O DNS apontar para o IP publico da EC2.
- A porta `80` estiver acessivel pela internet.
- O Nginx HTTP estiver rodando.

```bash
cd /opt/flex-it
set -a
. /opt/flex-it/env/compose.production.env
set +a

CERTBOT_DOMAIN_ARGS="-d $PRODUCTION_SERVER_NAME"
for DOMAIN_ALIAS in $PRODUCTION_SERVER_ALIASES; do
  CERTBOT_DOMAIN_ARGS="$CERTBOT_DOMAIN_ARGS -d $DOMAIN_ALIAS"
done

docker compose --env-file /opt/flex-it/env/compose.production.env --profile maintenance run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$CERTBOT_EMAIL" \
  --agree-tos \
  --no-eff-email \
  $CERTBOT_DOMAIN_ARGS
```

Se o certificado for emitido com sucesso, troque o template ativo para HTTPS:

```bash
sudo cp /opt/flex-it/nginx/default.https.conf.template /opt/flex-it/nginx/default.conf.template
docker compose --env-file /opt/flex-it/env/compose.production.env up -d --force-recreate nginx
docker compose --env-file /opt/flex-it/env/compose.production.env exec -T nginx nginx -t
```

## 6. Testar HTTPS e redirect

```bash
set -a
. /opt/flex-it/env/compose.production.env
set +a

curl -I "http://$PRODUCTION_SERVER_NAME"
curl -I "https://$PRODUCTION_SERVER_NAME"
curl -i "https://$PRODUCTION_SERVER_NAME/api/"
```

Resultados esperados:

- `http://...` retorna `301` com `Location: https://...`
- `https://...` retorna `200` ou a pagina do frontend
- `https://.../api/` chega no backend e retorna `Hello World!`

Para testar login/API pelo navegador, a imagem do frontend deve ter sido buildada com:

```env
VITE_API_URL=/api
```

Assim o navegador chama o mesmo dominio publico (`/api/...`) e o Nginx encaminha para o backend internamente.

## 7. Renovacao automatica

Teste a renovacao com dry-run:

```bash
cd /opt/flex-it
docker compose --env-file /opt/flex-it/env/compose.production.env --profile maintenance run --rm certbot renew \
  --webroot \
  --webroot-path /var/www/certbot \
  --dry-run
```

Se passar, crie um cron no host para renovar e recarregar o Nginx:

```bash
sudo tee /etc/cron.d/flexit-certbot-renew >/dev/null <<'EOF'
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
17 3,15 * * * root cd /opt/flex-it && docker compose --env-file /opt/flex-it/env/compose.production.env --profile maintenance run --rm certbot renew --webroot --webroot-path /var/www/certbot --quiet >> /var/log/flexit-certbot-renew.log 2>&1 && docker compose --env-file /opt/flex-it/env/compose.production.env exec -T nginx nginx -s reload >> /var/log/flexit-certbot-renew.log 2>&1
EOF

sudo chmod 644 /etc/cron.d/flexit-certbot-renew
```

Conferir o cron:

```bash
sudo cat /etc/cron.d/flexit-certbot-renew
sudo tail -f /var/log/flexit-certbot-renew.log
```
