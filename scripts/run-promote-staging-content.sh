#!/usr/bin/env bash
# Promote marketing content from staging Neon DB → live Neon DB,
# and sync blog/branding upload files that live outside git.
# Run from /var/www/pakexcise-live after code deploy + prisma db push.
#
# Usage:
#   bash scripts/run-promote-staging-content.sh --dry-run
#   bash scripts/run-promote-staging-content.sh

set -euo pipefail

LIVE_DIR="${LIVE_DIR:-/var/www/pakexcise-live}"
STAGING_DIR="${STAGING_DIR:-/var/www/pakexcise-staging}"
DRY_RUN=0

for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=1
  fi
done

if [[ ! -d "$LIVE_DIR" ]]; then
  echo "Live app dir not found: $LIVE_DIR" >&2
  exit 1
fi
if [[ ! -f "$STAGING_DIR/.env.production" ]]; then
  echo "Staging env not found: $STAGING_DIR/.env.production" >&2
  exit 1
fi

cd "$LIVE_DIR"

# Prefer live .env.production for target DATABASE_URL
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

sync_upload_dir() {
  local label="$1"
  local src="$2"
  local dest="$3"

  if [[ ! -d "$src" ]]; then
    echo "  skip ${label}: source missing (${src})"
    return 0
  fi

  mkdir -p "$dest"

  local count
  count="$(find "$src" -type f ! -name '.gitkeep' | wc -l | tr -d ' ')"
  echo "  ${label}: ${count} file(s) from ${src}"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    find "$src" -type f ! -name '.gitkeep' | sed 's/^/    would copy: /' | head -n 50
    if [[ "$count" -gt 50 ]]; then
      echo "    ... and $((count - 50)) more"
    fi
    return 0
  fi

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude '.gitkeep' "${src}/" "${dest}/"
  else
    find "$src" -type f ! -name '.gitkeep' -print0 \
      | while IFS= read -r -d '' file; do
          rel="${file#"$src"/}"
          mkdir -p "$(dirname "${dest}/${rel}")"
          cp -f "$file" "${dest}/${rel}"
        done
  fi
}

echo "==> Syncing uploaded media (gitignored storage)"
sync_upload_dir "blog-uploads" \
  "${STAGING_DIR}/storage/blog-uploads" \
  "${LIVE_DIR}/storage/blog-uploads"
sync_upload_dir "branding-uploads" \
  "${STAGING_DIR}/storage/branding-uploads" \
  "${LIVE_DIR}/storage/branding-uploads"
sync_upload_dir "legacy-blog-public-uploads" \
  "${STAGING_DIR}/public/blog/uploads" \
  "${LIVE_DIR}/public/blog/uploads"

echo "==> Promoting staging content → live"
echo "    live dir:    $LIVE_DIR"
echo "    staging dir: $STAGING_DIR"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "    mode: dry-run"
  pnpm db:promote-staging-content -- --dry-run
else
  echo "    mode: apply"
  pnpm db:promote-staging-content
  echo "==> Clearing Next.js ISR cache"
  rm -rf .next/cache
  echo "==> Recreating live PM2 process"
  bash scripts/ensure-live-pm2.sh "$LIVE_DIR" 3000
fi
