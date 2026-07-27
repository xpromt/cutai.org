#!/bin/bash
# Run on server: cd /opt/cutai.org && bash setup-server.sh
set -e

echo "=== Starting Docker infra ==="
docker compose -f docker-compose.prod.yml up -d

echo "=== Installing production deps ==="
cd /opt/cutai.org/apps/api
npm install --omit=dev --no-audit --no-fund 2>&1 | tail -3

echo "=== Prisma generate ==="
npx prisma generate 2>&1 | tail -3

echo "=== Prisma migrate ==="
npx prisma migrate deploy 2>&1 | tail -5

echo "=== PM2 start/restart ==="
pm2 startOrReload /opt/cutai.org/ecosystem.config.cjs --env production 2>&1 | tail -5
pm2 save 2>&1 | tail -2

echo "=== Nginx config ==="
cp /opt/cutai.org/nginx-cutai.conf /etc/nginx/snippets/cutai-api.conf 2>/dev/null || true
nginx -t && systemctl reload nginx && echo "Nginx reloaded" || echo "Nginx config needs manual fix"

echo "=== Deploy complete ==="
