#!/usr/bin/env bash
# Deploy with automatic rollback to the previous commit if deploy or health check fails.
# Wraps deploy-app.sh. On failure: checks out the previous commit, reinstalls, rebuilds,
# and restarts PM2 — code only. The database is never auto-reverted (see docs/DEPLOYMENT.md).
#
# Usage: deploy-with-rollback.sh <APP_DIR> <PM2_NAME> <BRANCH>
set -uo pipefail

APP_DIR="${1:?APP_DIR required}"
PM2_NAME="${2:?PM2_NAME required}"
BRANCH="${3:?BRANCH required}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$APP_DIR"
PREV_SHA="$(git rev-parse HEAD)"
echo "==> Previous known-good commit: $PREV_SHA"

if bash "$SCRIPT_DIR/deploy-app.sh" "$APP_DIR" "$PM2_NAME" "$BRANCH"; then
  echo "==> Deploy succeeded."
  exit 0
fi

echo "==> DEPLOY FAILED. Rolling back $PM2_NAME to $PREV_SHA (code only; DB not reverted)." >&2
cd "$APP_DIR"
git checkout "$PREV_SHA"
pnpm install --frozen-lockfile
rm -rf .next
pnpm build

if [[ "$PM2_NAME" == "pakexcise-staging" ]]; then
  bash "$SCRIPT_DIR/ensure-staging-pm2.sh" "$APP_DIR" 3001
else
  bash "$SCRIPT_DIR/ensure-live-pm2.sh" "$APP_DIR" 3000
fi

echo "==> Rollback complete. $PM2_NAME is back on $PREV_SHA." >&2
echo "==> NOTE: if the failed deploy included a schema change, the DB was NOT rolled back." >&2
echo "    Review docs/DEPLOYMENT.md > Rollback for manual DB recovery if needed." >&2
exit 1
