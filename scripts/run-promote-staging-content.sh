#!/usr/bin/env bash
# Promote marketing content from staging Neon DB → live Neon DB,
# and sync blog/branding upload files that live outside git.
#
# Prefer the full one-command promote:
#   bash scripts/promote-staging-to-live.sh
#
# Content/media only:
#   bash scripts/run-promote-staging-content.sh
#   bash scripts/run-promote-staging-content.sh --dry-run
#   bash scripts/run-promote-staging-content.sh --skip-restart

set -euo pipefail

LIVE_DIR="${LIVE_DIR:-/var/www/pakexcise-live}"
STAGING_DIR="${STAGING_DIR:-/var/www/pakexcise-staging}"
DRY_RUN=0
SKIP_RESTART=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --skip-restart) SKIP_RESTART=1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d "$LIVE_DIR" ]]; then
  echo "Live app dir not found: $LIVE_DIR" >&2
  exit 1
fi
if [[ ! -f "$STAGING_DIR/.env.production" ]]; then
  echo "Staging env not found: $STAGING_DIR/.env.production" >&2
  exit 1
fi

cd "$LIVE_DIR"

if [[ -f .env.production ]]; then
  cp .env.production .env
fi

SOURCE_DATABASE_URL="$(
  grep -E '^DATABASE_URL=' "$STAGING_DIR/.env.production" \
    | tail -n 1 \
    | cut -d= -f2- \
    | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
)"

if [[ -z "$SOURCE_DATABASE_URL" ]]; then
  echo "Could not read DATABASE_URL from $STAGING_DIR/.env.production" >&2
  exit 1
fi

export SOURCE_DATABASE_URL

# Media first so DB paths resolve immediately after promote.
if [[ "$DRY_RUN" -eq 1 ]]; then
  LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
    bash "$SCRIPT_DIR/sync-staging-uploads.sh" --dry-run
else
  LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
    bash "$SCRIPT_DIR/sync-staging-uploads.sh"
fi

echo "==> Promoting staging CMS → live DB"
echo "    live dir:    $LIVE_DIR"
echo "    staging dir: $STAGING_DIR"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "    mode: dry-run"
  pnpm db:promote-staging-content -- --dry-run
  exit 0
fi

echo "    mode: apply"
pnpm db:promote-staging-content

if [[ "$SKIP_RESTART" -eq 1 ]]; then
  echo "==> Skipping PM2 restart (--skip-restart)"
  exit 0
fi

echo "==> Clearing Next.js ISR cache"
rm -rf .next/cache
echo "==> Recreating live PM2 process"
bash "$SCRIPT_DIR/ensure-live-pm2.sh" "$LIVE_DIR" 3000
