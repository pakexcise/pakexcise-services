#!/usr/bin/env bash
# Recreate pakexcise-staging on a dedicated PORT and verify health.
# Usage (on VPS as deploy user):
#   cd /var/www/pakexcise-staging
#   bash scripts/ensure-staging-pm2.sh
#   bash scripts/ensure-staging-pm2.sh /var/www/pakexcise-staging 3001

set -euo pipefail

APP_DIR="${1:-/var/www/pakexcise-staging}"
PORT="${2:-3001}"
PM2_NAME="pakexcise-staging"

if [[ ! -d "$APP_DIR" ]]; then
  echo "App directory not found: $APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR"

if [[ ! -d .next ]]; then
  echo "Missing .next build in $APP_DIR. Run deploy first." >&2
  exit 1
fi

BUILD_ID="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo "==> Ensuring $PM2_NAME"
echo "    dir=$APP_DIR"
echo "    port=$PORT"
echo "    git=$BUILD_ID"

touch .env.production
if grep -qE '^PORT=' .env.production; then
  sed -i "s/^PORT=.*/PORT=${PORT}/" .env.production
else
  printf '\nPORT=%s\n' "$PORT" >> .env.production
fi

if grep -qE '^NODE_ENV=' .env.production; then
  sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env.production
else
  printf '\nNODE_ENV=production\n' >> .env.production
fi

cp .env.production .env

if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
fi

pm2 delete "$PM2_NAME" >/dev/null 2>&1 || true

# Prefer ecosystem when present (sets NODE_ENV + PORT cleanly).
if [[ -f "$APP_DIR/ecosystem.config.cjs" ]]; then
  pm2 start "$APP_DIR/ecosystem.config.cjs" --only "$PM2_NAME" --update-env
else
  NODE_ENV=production PORT="$PORT" BUILD_ID="$BUILD_ID" pm2 start ./node_modules/next/dist/bin/next \
    --name "$PM2_NAME" \
    --cwd "$APP_DIR" \
    --time \
    --node-args="--enable-source-maps" \
    -- start -p "$PORT"
fi

# Force env into the running process definition.
pm2 restart "$PM2_NAME" --update-env

sleep 5

echo "==> PM2 process"
pm2 show "$PM2_NAME" | sed -n '1,120p'

echo "==> Listening sockets"
(ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null || true) | grep -E ":(3000|3001|${PORT})\\b" || true

echo "==> Health"
HEALTH_JSON="$(curl -fsS --max-time 10 "http://127.0.0.1:${PORT}/api/health" || true)"
echo "${HEALTH_JSON:-"(no response)"}"

if [[ -z "${HEALTH_JSON}" ]]; then
  echo
  echo "FAILED: staging did not answer on :${PORT}" >&2
  pm2 logs "$PM2_NAME" --lines 100 --nostream >&2 || true
  exit 1
fi

REPORTED_BUILD_ID="$(printf '%s' "$HEALTH_JSON" | sed -n 's/.*"buildId":"\([^"]*\)".*/\1/p')"
echo "==> Reported buildId=${REPORTED_BUILD_ID}"

MEM_MB="$(
  pm2 jlist \
    | node -e '
        const name = process.argv[1];
        const list = JSON.parse(require("fs").readFileSync(0, "utf8"));
        const app = list.find((p) => p.name === name);
        if (!app) process.exit(0);
        process.stdout.write(String(Math.round((app.monit?.memory || 0) / 1024 / 1024)));
      ' "$PM2_NAME" 2>/dev/null || true
)"

if [[ -n "${MEM_MB}" ]]; then
  echo "==> Memory: ${MEM_MB}mb"
fi

pm2 save

echo
echo "OK: staging answers on http://127.0.0.1:${PORT}/api/health"
echo "Hard-refresh https://staging.pakexcise.com/admin/dashboard (Ctrl+Shift+R)"
