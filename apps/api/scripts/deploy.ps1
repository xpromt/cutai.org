# cutai.org deploy script (run from repo root)
# Usage:   .\apps\api\scripts\deploy.ps1
# Prereq:  SSH key set up for root@167.86.72.69
#          Docker compose with Postgres+Redis running locally for build tests

param(
  [string]$Server = "root@167.86.72.69",
  [string]$RemoteRoot = "/opt/cutai.org",
  [string]$PgPort = "5436",
  [string]$RedisPort = "6383",
  [string]$ApiPort = "3002"
)

Write-Host "=== cutai.org deploy ===" -ForegroundColor Cyan

# ---- 1. Build everything ----
Write-Host "`n[1/5] Building all packages..." -ForegroundColor Yellow
npm run build --workspaces --if-present
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed" -ForegroundColor Red; exit 1 }

# ---- 2. Run tests ----
Write-Host "`n[2/5] Running tests..." -ForegroundColor Yellow
npm run test --workspaces --if-present
if ($LASTEXITCODE -ne 0) { Write-Host "Tests failed" -ForegroundColor Red; exit 1 }

# ---- 3. Copy frontend ----
Write-Host "`n[3/5] Deploying frontend..." -ForegroundColor Yellow
ssh $Server "mkdir -p $RemoteRoot/apps/web/dist"
scp -r apps/web/dist/* "${Server}:${RemoteRoot}/apps/web/dist/"

# ---- 4. Copy API + packages ----
Write-Host "`n[4/5] Deploying API + worker..." -ForegroundColor Yellow
ssh $Server "mkdir -p $RemoteRoot/apps/api/dist $RemoteRoot/apps/api/assets/fonts $RemoteRoot/apps/api/prisma/migrations $RemoteRoot/packages/slop-rules/dist $RemoteRoot/node_modules"

# API built files
scp -r apps/api/dist/* "${Server}:${RemoteRoot}/apps/api/dist/"
scp apps/api/package.json "${Server}:${RemoteRoot}/apps/api/"
scp apps/api/.env.example "${Server}:${RemoteRoot}/apps/api/.env" 2>$null

# Prisma schema + migrations
scp apps/api/prisma/schema.prisma "${Server}:${RemoteRoot}/apps/api/prisma/"
scp -r apps/api/prisma/migrations/* "${Server}:${RemoteRoot}/apps/api/prisma/migrations/"

# Fonts
scp -r apps/api/assets/fonts/* "${Server}:${RemoteRoot}/apps/api/assets/fonts/"

# slop-rules shared package
scp -r packages/slop-rules/dist/* "${Server}:${RemoteRoot}/packages/slop-rules/dist/"
scp packages/slop-rules/package.json "${Server}:${RemoteRoot}/packages/slop-rules/"

# Root package.json (workspaces reference)
scp package.json "${Server}:${RemoteRoot}/"

# PM2 ecosystem + nginx config
scp apps/api/scripts/ecosystem.config.cjs "${Server}:${RemoteRoot}/"
scp apps/api/scripts/nginx-cutai.conf "${Server}:${RemoteRoot}/"

# ---- 5. Server-side setup ----
Write-Host "`n[5/5] Running server setup..." -ForegroundColor Yellow

Write-Host "  Installing production deps..." -ForegroundColor Gray
ssh $Server "cd $RemoteRoot/apps/api && npm install --omit=dev --no-audit --no-fund 2>&1 | tail -3"

Write-Host "  Generating Prisma client..." -ForegroundColor Gray
ssh $Server "cd $RemoteRoot/apps/api && npx prisma generate --no-hints 2>&1 | tail -3"

Write-Host "  Applying database migrations..." -ForegroundColor Gray
ssh $Server "cd $RemoteRoot/apps/api && npx prisma migrate deploy 2>&1 | tail -5"

Write-Host "  Starting PM2 processes..." -ForegroundColor Gray
ssh $Server "pm2 startOrReload $RemoteRoot/ecosystem.config.cjs --env production 2>&1 | tail -5 && pm2 save 2>&1 | tail -2"

Write-Host "  Setting up nginx..." -ForegroundColor Gray
ssh $Server "cp $RemoteRoot/nginx-cutai.conf /etc/nginx/snippets/cutai-api.conf 2>&1; nginx -t 2>&1 && systemctl reload nginx 2>&1 && echo 'Nginx reloaded' || echo 'Nginx config needs manual update'"

Write-Host "`n=== Deploy complete ===" -ForegroundColor Green
Write-Host "Frontend: https://cutai.org"
Write-Host "API:      https://cutai.org/api/health"
Write-Host "PM2:      ssh $Server pm2 list"
