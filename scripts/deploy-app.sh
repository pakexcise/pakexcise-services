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

if [[ "$PM2_NAME" == "pakexcise-staging" ]]; then
  # Staging must never share live :3000. Recreate the process on :3001.
  bash scripts/ensure-staging-pm2.sh "$APP_DIR" 3001
  exit 0
fi

# Live: recreate on :3000 so a broken ~18MB process cannot keep serving stale builds.
bash scripts/ensure-live-pm2.sh "$APP_DIR" 3000

echo
echo "Deploy complete. Verify:"
echo "  curl -s http://127.0.0.1:3000/api/health"
echo "  pm2 logs $PM2_NAME --lines 50"
