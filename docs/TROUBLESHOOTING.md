# Troubleshooting

## Diagnostic commands

```bash
# Local
pnpm typecheck
pnpm lint
pnpm build
pnpm env:validate
pnpm exec prisma validate
pnpm exec prisma db push   # careful

# VPS
cd /var/www/pakexcise-staging   # or pakexcise-live
git rev-parse --short HEAD
curl -s http://127.0.0.1:3001/api/health   # staging
curl -s http://127.0.0.1:3000/api/health   # live
pm2 status
pm2 logs pakexcise-staging --lines 80
```

## Known / historical issues

| Issue | Notes |
|-------|--------|
| Turbopack vs webpack on `next build` | Fixed by `build: next build --webpack` |
| English-only cleanup incomplete on remote | Needed commit+push; staging showed old language switcher until deploy of cleanup |
| Guides still on staging after “commit” on VPS | Commit must happen on laptop; VPS was clean of changes |
| Prisma stop on drop `*Ur` / `guides` | Use `--accept-data-loss` intentionally per env |
| Disk full (`ENOSPC`) during local webpack build | Clear `.next` cache |
| GA4 admin contamination | Tags now marketing-only + production-only; live deploy required; history remains |

## Common setup problems

| Problem | Solution |
|---------|----------|
| `APP_ENV` URL mismatch | Align `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` with schema origins |
| Prisma P1001 connection | Check `DATABASE_URL`, Neon IP allow, SSL params |
| `ENCRYPTION_KEY` invalid | Must be 32-byte base64 suitable for AES-256-GCM |
| Google OAuth redirect mismatch | Console origins must include env URL |
| SES email not sending | Verify domain/identity; check sandbox forward on staging |
| WhatsApp OTP fails for test numbers | Meta test recipients; enable `WHATSAPP_DEV_FALLBACK_ON_ERROR` locally only |

## Build failures

| Error | Fix |
|-------|-----|
| Turbopack + webpack config | Ensure `--webpack` on build |
| Typed routes `string` not assignable to `Route` | Cast dynamic hrefs `as Route` or use literal paths |
| Stale `.next/types` missing deleted pages | `rm -rf .next` then rebuild |
| Sentry auth during build | Optional; token missing usually warns, confirm CI needs |
| Out of disk on Windows | Delete `.next`, free space |

## Database problems

| Problem | Fix |
|---------|-----|
| Client out of sync with schema | `pnpm db:generate` |
| Unexpected data loss warnings | Read warnings; backup; then accept only if intended |
| Seed fails | Check required settings tables / unique constraints; run targeted seed scripts |
| Soft-deleted rows still appear | Ensure queries use `activeOnly` / `deletedAt: null` |

## Authentication problems

| Problem | Fix |
|---------|------|
| Infinite redirect to login | Cookie Secure/SameSite on HTTPS; URL must match |
| Session not found after login | `BETTER_AUTH_URL` vs site URL mismatch |
| Admin 2FA assert fails | Complete 2FA enrollment for ADMIN/SUPER_ADMIN |
| Role stuck at choose-role | `selectAccountRole` / `needsRoleChoice` paths |

## Deployment problems

See [DEPLOYMENT.md](./DEPLOYMENT.md) common table. Most frequent: **code not pushed**, **pnpm PATH**, **Prisma data-loss halt**, **wrong app directory**.

## Analytics verification

**Public live page:** Network shows `gtm.js` or `gtag/js`.  
**Admin live page:** neither script.  
**Staging:** usually no marketing tags (`APP_ENV≠production`).

GA4 historical reports still show past admin titles — filter date after fix deploy.

## Recommended mindset

1. Confirm **git SHA** on server matches GitHub.
2. Confirm **which env DB** `.env` points to.
3. Prefer logs (`pm2 logs`, Sentry) over guessing.
4. Reproduce locally with matching `APP_ENV` when possible.
