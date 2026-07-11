#!/usr/bin/env bash
# One-command: promote staging → live (code + schema + CMS + uploads).
#
# Copies marketing content and images from staging. Does NOT copy users,
# applications, invoices, payments, documents, or audit data.
#
# Usage (on VPS as deploy):
#   bash scripts/promote-staging-to-live.sh
#   bash scripts/promote-staging-to-live.sh --dry-run
#   SKIP_BUILD=1 bash scripts/promote-staging-to-live.sh   # content+media only

set -euo pipefail

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

echo "=============================================="
echo " Promote staging → live"
echo "=============================================="
echo " live:    $LIVE_DIR"
echo " staging: $STAGING_DIR"
echo " branch:  $BRANCH"
echo " dry-run: $DRY_RUN"
echo "=============================================="

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "==> DRY RUN: media + DB promote only (no git/build/pm2)"
  LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
    bash "$SCRIPT_DIR/sync-staging-uploads.sh" --dry-run
  LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
    bash "$SCRIPT_DIR/run-promote-staging-content.sh" --dry-run --skip-restart
  echo
  echo "Dry run complete. Re-run without --dry-run to apply."
  exit 0
fi

cd "$LIVE_DIR"

if [[ "$SKIP_BUILD" != "1" ]]; then
  echo "==> 1/5 Fetch + build live from $BRANCH"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"
  export BUILD_ID
  BUILD_ID="$(git rev-parse --short HEAD)"
  echo "    BUILD_ID=$BUILD_ID"
  pnpm install --frozen-lockfile
  rm -rf .next
  pnpm build
else
  echo "==> 1/5 Skipping git/build (SKIP_BUILD=1)"
  export BUILD_ID
  BUILD_ID="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
fi

echo "==> 2/5 Schema sync (additive)"
if [[ -f .env.production ]]; then
  cp .env.production .env
fi
pnpm exec prisma db push

echo "==> 3/5 Sync uploads (blog/branding images)"
LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
  bash "$SCRIPT_DIR/sync-staging-uploads.sh"

echo "==> 4/5 Promote CMS content (no users/apps)"
LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
  bash "$SCRIPT_DIR/run-promote-staging-content.sh" --skip-restart

echo "==> 5/5 Clear ISR cache + recreate live PM2"
rm -rf .next/cache
bash "$SCRIPT_DIR/ensure-live-pm2.sh" "$LIVE_DIR" 3000

echo
echo "=============================================="
echo " Promote complete"
echo "=============================================="
echo " Verify:"
echo "   curl -s http://127.0.0.1:3000/api/health"
echo "   https://pakexcise.com/blog  (images + featured post)"
echo "   Live admin still shows real customers/applications"
echo "=============================================="
