#!/usr/bin/env bash
# Sets GA4, GTM, and Google Search Console env vars for production live site.
# Usage (on VPS):
#   bash scripts/configure-production-tracking.sh /var/www/pakexcise-live

set -euo pipefail

APP_DIR="${1:-/var/www/pakexcise-live}"

if [[ ! -d "$APP_DIR" ]]; then
  echo "Directory not found: $APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR"

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"

  touch "$file"

  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$file"
  fi
}

remove_key() {
  local file="$1"
  local key="$2"

  [[ -f "$file" ]] || return 0

  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "/^${key}=/d" "$file"
  fi
}

for env_file in .env .env.production; do
  upsert_env "$env_file" "NEXT_PUBLIC_GA4_MEASUREMENT_ID" "G-CSM430BN4H"
  upsert_env "$env_file" "NEXT_PUBLIC_GTM_ID" "GTM-TKJW3C6F"
  upsert_env "$env_file" "GOOGLE_SITE_VERIFICATION" "rf8UK9n5xm8t_yzi2ASScy11e5pfTc0tjQn-swn2KrU"
done

echo "Production tracking env written to .env and .env.production"
echo "  GA4: G-CSM430BN4H"
echo "  GTM: GTM-TKJW3C6F"
echo "  GSC: meta tag verification token set"
echo ""
echo "Staging: leave GA4/GTM/GSC unset (or remove) so analytics only run on pakexcise.com."
