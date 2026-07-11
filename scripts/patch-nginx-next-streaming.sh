#!/usr/bin/env bash
# Ensure nginx does not buffer Next.js RSC streams (fixes infinite loading shells).
# Usage: sudo bash scripts/patch-nginx-next-streaming.sh

set -euo pipefail

SITE_FILE="${1:-/etc/nginx/sites-enabled/staging.pakexcise.com}"

if [[ ! -f "$SITE_FILE" ]]; then
  echo "Nginx site file not found: $SITE_FILE" >&2
  exit 1
fi

if grep -q "proxy_buffering off" "$SITE_FILE"; then
  echo "Streaming proxy settings already present in $SITE_FILE"
else
  python3 - <<'PY' "$SITE_FILE"
import pathlib, sys
path = pathlib.Path(sys.argv[1])
text = path.read_text()
needle = "proxy_pass http://127.0.0.1:3001;"
snippet = """proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 60s;"""
if needle not in text:
    raise SystemExit(f"Could not find proxy_pass for :3001 in {path}")
path.write_text(text.replace(needle, snippet, 1))
print(f"Patched {path}")
PY
fi

nginx -t
systemctl reload nginx
echo "Nginx reloaded."
