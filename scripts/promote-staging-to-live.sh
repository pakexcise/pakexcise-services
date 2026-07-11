#!/usr/bin/env bash
# DEPRECATED — emergency / recovery only.
#
# Prefer: bash scripts/deploy-live.sh
# Production content: Live Admin or pnpm db:seed-primary-blog on live.
#
# This script still exists for rare recovery (copies CMS + local uploads).
# Do not use for normal staging → live releases.

set -euo pipefail

echo "WARNING: DEPRECATED. Use scripts/deploy-live.sh for normal live deploys." >&2
echo "         Production CMS belongs in Live Admin (or git seeds on live)." >&2

LIVE_DIR="${LIVE_DIR:-/var/www/pakexcise-live}"
STAGING_DIR="${STAGING_DIR:-/var/www/pakexcise-staging}"
BRANCH="${BRANCH:-staging}"
DRY_RUN=0
SKIP_BUILD="${SKIP_BUILD:-0}"

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d "$LIVE_DIR" ]]; then
  echo "Live app dir not found: $LIVE_DIR" >&2
  exit 1
fi
if [[ ! -d "$STAGING_DIR" ]]; then
  echo "Staging app dir not found: $STAGING_DIR" >&2
  exit 1
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
    bash "$SCRIPT_DIR/sync-staging-uploads.sh" --dry-run
  LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
    bash "$SCRIPT_DIR/run-promote-staging-content.sh" --dry-run --skip-restart
  exit 0
fi

cd "$LIVE_DIR"

if [[ "$SKIP_BUILD" != "1" ]]; then
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"
  export BUILD_ID
  BUILD_ID="$(git rev-parse --short HEAD)"
  pnpm install --frozen-lockfile
  rm -rf .next
  pnpm build
fi

if [[ -f .env.production ]]; then
  cp .env.production .env
fi
pnpm exec prisma db push

LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
  bash "$SCRIPT_DIR/run-promote-staging-content.sh" --skip-restart

rm -rf .next/cache
bash "$SCRIPT_DIR/ensure-live-pm2.sh" "$LIVE_DIR" 3000
