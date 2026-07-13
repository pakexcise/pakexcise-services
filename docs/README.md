# Documentation index

PakExcise.com handover package for humans and Claude Code.

**Live cutover (Jul 2026):** English-only schema + Guides removal applied on live with `prisma db push --accept-data-loss`. Staging and live PM2 apps online. Prefer this package over stale notes in `.cursorrules` when they conflict (next-intl / Urdu / Guides).

## Start here

| Order | Doc | Use for |
|------:|-----|---------|
| 1 | [PROJECT_HANDOVER.md](../PROJECT_HANDOVER.md) | First-day orientation |
| 2 | [CLAUDE.md](../CLAUDE.md) | Permanent agent rules |
| 3 | [README.md](../README.md) | Install & commands |
| 4 | [ARCHITECTURE.md](./ARCHITECTURE.md) | System design |
| 5 | [FEATURES.md](./FEATURES.md) | What exists |
| 6 | [DATABASE.md](./DATABASE.md) | Prisma / data |
| 7 | [API.md](./API.md) | HTTP + server actions |
| 8 | [ENVIRONMENT.md](./ENVIRONMENT.md) | Env vars (no secrets) |
| 9 | [DEPLOYMENT.md](./DEPLOYMENT.md) | Staging / live VPS |
| 10 | [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Done / next / debt |
| 11 | [MAINTENANCE.md](./MAINTENANCE.md) | Day-to-day engineering |
| 12 | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Failures & diagnostics |

Root [DEPLOYMENT.md](../DEPLOYMENT.md) points here.

## Environments (current)

| Env | Path | PM2 | Port | URL |
|-----|------|-----|------|-----|
| Staging | `/var/www/pakexcise-staging` | `pakexcise-staging` | 3001 | https://staging.pakexcise.com |
| Live | `/var/www/pakexcise-live` | `pakexcise-live` | 3000 | https://pakexcise.com |

Git branch used for deploys: **`staging`** (default in deploy scripts).

## Non‑negotiable product rules

1. Private facilitation only — never government affiliation.  
2. No public service fees (invoices only).  
3. English-only product UI; no `/en` or `/ur` routes.  
4. Guides CMS must not return (`/guides` → `/blog`).  
5. GTM/GA4 only on marketing pages and only when `APP_ENV=production`.  
6. Never commit secrets.
