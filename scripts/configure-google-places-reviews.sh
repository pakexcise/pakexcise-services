#!/usr/bin/env bash
# Upsert Google Places review sync env on staging and/or live.
# Run ON the VPS as deploy user.
#
# Usage:
#   export GOOGLE_PLACES_API_KEY='your-key-from-google-cloud'
#   bash scripts/configure-google-places-reviews.sh
#   bash scripts/configure-google-places-reviews.sh staging
#   bash scripts/configure-google-places-reviews.sh live
set -euo pipefail

TARGET="${1:-both}"
REVIEW_URL="${NEXT_PUBLIC_GOOGLE_REVIEW_URL:-https://g.page/r/CUXUBUQC06mJEBM/review}"
SEARCH_QUERY="${GOOGLE_PLACES_SEARCH_QUERY:-PakExcise}"

if [[ -z "${GOOGLE_PLACES_API_KEY:-}" ]]; then
  echo "Set GOOGLE_PLACES_API_KEY first, e.g.:" >&2
  echo "  export GOOGLE_PLACES_API_KEY='AIza...'" >&2
  exit 1
fi

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"

  if [[ ! -f "$file" ]]; then
    echo "Missing env file: $file" >&2
    exit 1
  }

  if grep -q "^${key}=" "$file"; then
    # Escape sed special chars in value
    local escaped
    escaped="$(printf '%s' "$value" | sed -e 's/[\\/&]/\\&/g')"
    sed -i "s|^${key}=.*|${key}=${escaped}|" "$file"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$file"
  fi
}

configure_app() {
  local app_dir="$1"
  local pm2_name="$2"
  local env_file="${app_dir}/.env.production"

  echo "==> Configuring $pm2_name ($env_file)"

  local sync_secret
  sync_secret="$(grep -E '^GOOGLE_REVIEW_SYNC_SECRET=.' "$env_file" 2>/dev/null | cut -d= -f2- || true)"
  if [[ -z "$sync_secret" ]]; then
    sync_secret="$(openssl rand -hex 32)"
    echo "    Generated GOOGLE_REVIEW_SYNC_SECRET"
  else
    echo "    Keeping existing GOOGLE_REVIEW_SYNC_SECRET"
  fi

  upsert_env "$env_file" "GOOGLE_PLACES_API_KEY" "$GOOGLE_PLACES_API_KEY"
  upsert_env "$env_file" "GOOGLE_PLACES_SEARCH_QUERY" "$SEARCH_QUERY"
  upsert_env "$env_file" "GOOGLE_REVIEW_SYNC_SECRET" "$sync_secret"
  upsert_env "$env_file" "NEXT_PUBLIC_GOOGLE_REVIEW_URL" "$REVIEW_URL"

  cp "$env_file" "${app_dir}/.env"

  echo "    Building (NEXT_PUBLIC_* requires rebuild)..."
  (
    cd "$app_dir"
    source ~/.nvm/nvm.sh 2>/dev/null || true
    pnpm build
  )

  echo "    Restarting $pm2_name"
  pm2 restart "$pm2_name"

  echo "    Done: $pm2_name"
}

case "$TARGET" in
  staging)
    configure_app /var/www/pakexcise-staging pakexcise-staging
    ;;
  live|production|main)
    configure_app /var/www/pakexcise-live pakexcise-live
    ;;
  both)
    configure_app /var/www/pakexcise-staging pakexcise-staging
    configure_app /var/www/pakexcise-live pakexcise-live
    ;;
  *)
    echo "Usage: $0 [staging|live|both]" >&2
    exit 1
    ;;
esac

echo
echo "Next: Admin → Customer reviews → Sync Google reviews"
echo "Or: curl -X POST -H \"Authorization: Bearer \$GOOGLE_REVIEW_SYNC_SECRET\" https://staging.pakexcise.com/api/reviews/google/sync"
