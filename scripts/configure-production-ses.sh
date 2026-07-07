#!/usr/bin/env bash
# Cleans legacy Resend vars and ensures AWS SES vars exist in app .env files.
# Usage (on VPS, from app directory):
#   export AWS_ACCESS_KEY_ID='...'
#   export AWS_SECRET_ACCESS_KEY='...'
#   bash scripts/configure-production-ses.sh /var/www/pakexcise-live production

set -euo pipefail

APP_DIR="${1:-/var/www/pakexcise-live}"
APP_ENV_VALUE="${2:-production}"

if [[ "$APP_ENV_VALUE" == "staging" ]]; then
  SITE_URL="https://staging.pakexcise.com"
elif [[ "$APP_ENV_VALUE" == "production" ]]; then
  SITE_URL="https://pakexcise.com"
else
  SITE_URL="http://localhost:3000"
fi

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

strip_legacy_resend() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  sed -i '/^RESEND_/d' "$file"
  sed -i '/^NEXT_PUBLIC_RESEND_/d' "$file"
  echo "Cleaned legacy Resend vars in $file"
}

for env_file in .env .env.production; do
  strip_legacy_resend "$env_file"
  upsert_env "$env_file" "APP_ENV" "$APP_ENV_VALUE"
  upsert_env "$env_file" "NEXT_PUBLIC_APP_URL" "$SITE_URL"
  upsert_env "$env_file" "BETTER_AUTH_URL" "$SITE_URL"
  upsert_env "$env_file" "AWS_SES_REGION" "us-east-1"
  upsert_env "$env_file" "SES_FROM_EMAIL" "noreply@pakexcise.com"
  upsert_env "$env_file" "SES_REPLY_TO_EMAIL" "info@pakexcise.com"
done

if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
  echo "ERROR: Export AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY before running." >&2
  exit 1
fi

for env_file in .env .env.production; do
  upsert_env "$env_file" "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID"
  upsert_env "$env_file" "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY"
done

echo "SES configuration written to .env and .env.production"
echo "Site URL: $SITE_URL"
echo "Verify (values hidden):"
grep -E '^(APP_ENV|NEXT_PUBLIC_APP_URL|BETTER_AUTH_URL|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_SES_REGION|SES_FROM_EMAIL|RESEND_)' .env .env.production 2>/dev/null | sed 's/=.*/=***/' || true
