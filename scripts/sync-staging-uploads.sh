#!/usr/bin/env bash
# DEPRECATED — emergency disk sync only.
# Prefer shared Cloudflare R2 for blog/branding marketing assets on both envs.
# Normal deploys: scripts/deploy-staging.sh / scripts/deploy-live.sh

set -euo pipefail

LIVE_DIR="${LIVE_DIR:-/var/www/pakexcise-live}"
STAGING_DIR="${STAGING_DIR:-/var/www/pakexcise-staging}"
DRY_RUN=0

for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=1
  fi
done

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
  count="$(find "$src" -type f ! -name '.gitkeep' 2>/dev/null | wc -l | tr -d ' ')"
  echo "  ${label}: ${count} file(s)"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    find "$src" -type f ! -name '.gitkeep' 2>/dev/null | sed 's/^/    would copy: /' | head -n 40
    if [[ "${count:-0}" -gt 40 ]]; then
      echo "    ... and $((count - 40)) more"
    fi
    return 0
  fi

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude '.gitkeep' "${src}/" "${dest}/"
  else
    find "$src" -type f ! -name '.gitkeep' -print0 2>/dev/null \
      | while IFS= read -r -d '' file; do
          rel="${file#"$src"/}"
          mkdir -p "$(dirname "${dest}/${rel}")"
          cp -f "$file" "${dest}/${rel}"
        done
  fi
}

echo "==> Syncing uploaded media staging → live"
echo "    from: ${STAGING_DIR}"
echo "    to:   ${LIVE_DIR}"

sync_upload_dir "blog-uploads" \
  "${STAGING_DIR}/storage/blog-uploads" \
  "${LIVE_DIR}/storage/blog-uploads"
sync_upload_dir "branding-uploads" \
  "${STAGING_DIR}/storage/branding-uploads" \
  "${LIVE_DIR}/storage/branding-uploads"
sync_upload_dir "legacy-blog-public-uploads" \
  "${STAGING_DIR}/public/blog/uploads" \
  "${LIVE_DIR}/public/blog/uploads"

echo "==> Upload sync done"
