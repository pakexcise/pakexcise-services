#!/usr/bin/env bash
# DEPRECATED — emergency / recovery only. Not part of normal releases.
#
# Normal releases:
#   bash scripts/deploy-staging.sh
#   bash scripts/deploy-live.sh
# Production CMS: Live Admin (or pnpm db:seed-* on live only).
#
# This script copies staging CMS DB rows + local upload folders to live.
# Prefer shared R2 for marketing images instead of disk sync.
#
# Emergency:
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

echo "WARNING: DEPRECATED emergency content promote. Prefer deploy-live.sh + Live Admin." >&2

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

if [[ "$DRY_RUN" -eq 1 ]]; then
  LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
    bash "$SCRIPT_DIR/sync-staging-uploads.sh" --dry-run
  pnpm db:promote-staging-content -- --dry-run
  exit 0
fi

LIVE_DIR="$LIVE_DIR" STAGING_DIR="$STAGING_DIR" \
  bash "$SCRIPT_DIR/sync-staging-uploads.sh"
pnpm db:promote-staging-content

if [[ "$SKIP_RESTART" -eq 1 ]]; then
  exit 0
fi

rm -rf .next/cache
bash "$SCRIPT_DIR/ensure-live-pm2.sh" "$LIVE_DIR" 3000
