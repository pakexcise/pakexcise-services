#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-/var/www/pakexcise-live}"
PM2_NAME="${2:-pakexcise-live}"
BRANCH="${3:-staging}"
STAGING_DIR="${STAGING_DIR:-/var/www/pakexcise-staging}"
# Live deploys auto-promote CMS + uploads from staging unless skipped.
SKIP_CONTENT_PROMOTE="${SKIP_CONTENT_PROMOTE:-0}"

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

# Live: promote marketing content + uploads from staging automatically.
if [[ "$SKIP_CONTENT_PROMOTE" != "1" ]]; then
  if [[ -d "$STAGING_DIR" && -f "$STAGING_DIR/.env.production" ]]; then
    echo "==> Auto-promoting staging CMS + uploads → live"
    if [[ -f .env.production ]]; then
      cp .env.production .env
    fi
    echo "==> Schema sync (additive)"
    pnpm exec prisma db push
    LIVE_DIR="$APP_DIR" STAGING_DIR="$STAGING_DIR" \
      bash scripts/run-promote-staging-content.sh --skip-restart
  else
    echo "WARNING: staging dir missing ($STAGING_DIR) — skipped content/media promote." >&2
    echo "         Run: bash scripts/promote-staging-to-live.sh" >&2
  fi
else
  echo "==> Skipping content promote (SKIP_CONTENT_PROMOTE=1)"
fi

# Live: recreate on :3000 so a broken ~18MB process cannot keep serving stale builds.
rm -rf .next/cache
bash scripts/ensure-live-pm2.sh "$APP_DIR" 3000

echo
echo "Deploy complete. Verify:"
echo "  curl -s http://127.0.0.1:3000/api/health"
echo "  https://pakexcise.com/blog"
echo "  pm2 logs $PM2_NAME --lines 50"
