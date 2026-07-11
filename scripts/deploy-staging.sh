#!/usr/bin/env bash
# Deploy code to staging (staging.pakexcise.com :3001).
# Code + schema only. Does not copy live data or CMS.
#
# Usage (on VPS as deploy):
#   bash scripts/deploy-staging.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/pakexcise-staging}"
BRANCH="${BRANCH:-staging}"

bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-app.sh" \
  "$APP_DIR" \
  pakexcise-staging \
  "$BRANCH"
