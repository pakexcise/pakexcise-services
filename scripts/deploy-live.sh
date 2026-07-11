#!/usr/bin/env bash
# Deploy code to live / production (pakexcise.com :3000).
# Code + schema only. Does not copy staging CMS, users, or applications.
#
# Production marketing content is owned by Live Admin (or git seeds on this env).
#
# Usage (on VPS as deploy):
#   bash scripts/deploy-live.sh
#
# After first blog setup on live (git-backed images under public/blog/):
#   cd /var/www/pakexcise-live && pnpm db:seed-primary-blog

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/pakexcise-live}"
BRANCH="${BRANCH:-staging}"

bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-app.sh" \
  "$APP_DIR" \
  pakexcise-live \
  "$BRANCH"
