#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-/var/www/pakexcise-live}"
PM2_NAME="${2:-pakexcise-live}"
BRANCH="${3:-staging}"

if [[ ! -d "$APP_DIR" ]]; then
  echo "App directory not found: $APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR"

echo "==> Deploying $PM2_NAME from branch $BRANCH in $APP_DIR"

git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

export BUILD_ID="$(git rev-parse --short HEAD)"

echo "==> BUILD_ID=$BUILD_ID"
echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Cleaning previous Next.js build"
rm -rf .next

echo "==> Building"
pnpm build

echo "==> Restarting PM2 process: $PM2_NAME"
pm2 restart "$PM2_NAME" --update-env

# Resolve the real listen port for THIS process (staging is often not :3000).
HEALTH_PORT="$(
  pm2 show "$PM2_NAME" 2>/dev/null \
    | awk -F'│' '/env: PORT|PORT/ { gsub(/[[:space:]]/, "", $3); if ($3 ~ /^[0-9]+$/) { print $3; exit } }'
)"

if [[ -z "${HEALTH_PORT}" ]]; then
  # Fallback: read PORT from app env files without printing secrets.
  HEALTH_PORT="$(
    {
      [[ -f .env.production ]] && grep -E '^PORT=' .env.production || true
      [[ -f .env ]] && grep -E '^PORT=' .env || true
    } | tail -n 1 | cut -d= -f2- | tr -d '[:space:]'
  )"
fi

if [[ -z "${HEALTH_PORT}" ]]; then
  HEALTH_PORT=3000
fi

echo "==> Health check on 127.0.0.1:${HEALTH_PORT}"
sleep 3

HEALTH_JSON="$(curl -fsS "http://127.0.0.1:${HEALTH_PORT}/api/health" || true)"
echo "${HEALTH_JSON}"

if [[ -z "${HEALTH_JSON}" ]]; then
  echo "WARNING: health check failed for $PM2_NAME on port ${HEALTH_PORT}" >&2
  echo "Check: pm2 logs $PM2_NAME --lines 80" >&2
  exit 1
fi

EXPECTED_BUILD_ID="$BUILD_ID"
REPORTED_BUILD_ID="$(printf '%s' "$HEALTH_JSON" | sed -n 's/.*"buildId":"\([^"]*\)".*/\1/p')"

if [[ -n "$REPORTED_BUILD_ID" && "$REPORTED_BUILD_ID" != "$EXPECTED_BUILD_ID" ]]; then
  echo "WARNING: expected buildId=$EXPECTED_BUILD_ID but health returned buildId=$REPORTED_BUILD_ID" >&2
  echo "This usually means the wrong process/port was checked, or PM2 did not pick up the new build." >&2
fi

echo
echo "Deploy complete. Verify:"
echo "  curl -s http://127.0.0.1:${HEALTH_PORT}/api/health"
echo "  pm2 logs $PM2_NAME --lines 50"
echo "  pm2 show $PM2_NAME | sed -n '1,80p'"
