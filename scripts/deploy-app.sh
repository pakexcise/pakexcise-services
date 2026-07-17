#!/usr/bin/env bash
# Core deploy: git pull → install → build → schema push → PM2 recreate.
# Used by deploy-staging.sh and deploy-live.sh.
#
# Deploys CODE only. Never copies CMS content, uploads, users, or applications
# between environments.

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

export BUILD_ID
BUILD_ID="$(git rev-parse --short HEAD)"

echo "==> BUILD_ID=$BUILD_ID"
echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Cleaning previous Next.js build"
rm -rf .next

echo "==> Building"
pnpm build

echo "==> Schema sync (additive — stop if Prisma warns about data loss)"
if [[ -f .env.production ]]; then
  cp .env.production .env
fi
pnpm exec prisma db push

echo "==> Sync path redirects cache (Edge proxy)"
pnpm exec tsx scripts/sync-path-redirects.ts || echo "WARN: path redirect cache sync failed (continuing)"

rm -rf .next/cache

if [[ "$PM2_NAME" == "pakexcise-staging" ]]; then
  bash scripts/ensure-staging-pm2.sh "$APP_DIR" 3001
  HEALTH_PORT=3001
  PUBLIC_HINT="https://staging.pakexcise.com"
else
  bash scripts/ensure-live-pm2.sh "$APP_DIR" 3000
  HEALTH_PORT=3000
  PUBLIC_HINT="https://pakexcise.com"
fi

echo
echo "Deploy complete ($PM2_NAME)."
echo "  curl -s http://127.0.0.1:${HEALTH_PORT}/api/health"
echo "  ${PUBLIC_HINT}"
echo "  pm2 logs $PM2_NAME --lines 50"
echo
echo "Note: marketing content is per-environment (Live Admin / seeds)."
echo "      Do not copy staging CMS to live for normal releases."
