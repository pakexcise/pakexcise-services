# Deployment

Authoritative ops notes for Hostinger VPS + PM2. Root `DEPLOYMENT.md` redirects here for the maintained copy.

## Hosting

| Environment | Path | PM2 process | Port | URL |
|-------------|------|-------------|------|-----|
| Staging | `/var/www/pakexcise-staging` | `pakexcise-staging` | 3001 | https://staging.pakexcise.com |
| Live | `/var/www/pakexcise-live` | `pakexcise-live` | 3000 | https://pakexcise.com |

- SSH: `deploy@93.127.213.11` (Hostinger VPS; update this doc if the IP changes).
- Process manager: PM2 (`ecosystem.config.cjs`, `scripts/ensure-*-pm2.sh`).
- Reverse proxy: Nginx (or Hostinger equivalent) — SSE for `/api/realtime/` may need buffering off — **Needs verification** of live Nginx snippets.
- Databases: separate Neon projects/branches per environment (do not share production DB with staging).

## Package / build process

Locally and on VPS:

```bash
pnpm install --frozen-lockfile
pnpm build    # = next build --webpack
pnpm start    # or PM2
```

Sentry wraps Next config with webpack; Turbopack default build **fails** without `--webpack` (already set in `package.json`).

`BUILD_ID` is set from `git rev-parse --short HEAD` during deploy unless overridden.

## Deploy scripts

| Script | Action |
|--------|--------|
| `scripts/deploy-staging.sh` | Deploy staging branch into staging dir |
| `scripts/deploy-live.sh` | Deploy branch (default `staging`) into live dir |
| `scripts/deploy-app.sh` | Shared: fetch, checkout, pull, install, clean `.next`, build, `.env.production`→`.env`, `prisma db push`, PM2 recreate |

Typical staging deploy:

```bash
ssh deploy@YOUR_VPS
cd /var/www/pakexcise-staging
# ensure login shell has nvm/pnpm on PATH
bash scripts/deploy-staging.sh
```

Typical live deploy (after staging QA):

```bash
cd /var/www/pakexcise-live
bash scripts/deploy-live.sh
```

**Do not** commit on the VPS. Commit/push from developer machines; VPS only `git pull` via deploy script.

## Environment configuration on VPS

- Keep `.env.production` per app directory with correct `APP_ENV`, URLs, DB, R2, SES, WhatsApp, analytics.
- Deploy script copies `.env.production` → `.env` before Prisma.
- Staging: `APP_ENV=staging`, `NEXT_PUBLIC_APP_URL=https://staging.pakexcise.com`
- Live: `APP_ENV=production`, `NEXT_PUBLIC_APP_URL=https://pakexcise.com`

## Database migration process

Deploy runs:

```bash
pnpm exec prisma db push
```

If Prisma refuses due to data loss (dropped columns/tables):

1. Confirm you are on the correct directory (staging vs live).
2. Review schema diff.
3. Explicitly run:

```bash
pnpm exec prisma db push --accept-data-loss
pm2 restart pakexcise-staging   # or pakexcise-live
```

Additive changes usually need no extra flag.

## Git branch model (current practice)

Observed: **`staging` branch** is what VPS deploys for both staging and (by default) live scripts.  

**Needs verification:** whether production-only branches/tags are used sometimes.

## Verification checklist

After deploy:

- [ ] `curl -s https://staging.pakexcise.com/api/health` (or live) returns `"status":"ok"` and expected `buildId` / `env`
- [ ] Homepage loads; disclaimer visible
- [ ] `/login` works; admin login for staff
- [ ] Public service page loads; **no fees** shown
- [ ] Customer apply flow smoke (staging) if DB allows
- [ ] `/guides` redirects to `/blog`
- [ ] Admin Guides menu **absent** after Guides removal deploy
- [ ] On **live** only: Network tab shows GTM/gtag on `/` and **not** on `/admin`
- [ ] Hard-refresh (Ctrl+Shift+R) to avoid CDN/browser cache
- [ ] PM2: `pm2 status`, `pm2 logs pakexcise-staging --lines 50`

## Rollback

1. On VPS app dir: `git fetch` and `git checkout <previous_sha>` (or reset to previous known good), then rebuild:

```bash
pnpm install --frozen-lockfile
pnpm build
pm2 restart pakexcise-staging   # or live
```

2. Or re-run deploy after reverting the bad commit on GitHub and pushing.

3. Database rollback is **not** automatic with `db push`. Prefer Neon restore/branch for schema/data mistakes.

## Content promote (optional / recovery)

`pnpm db:promote-staging-content` / `scripts/promote-staging-content-to-live.ts` can copy CMS content. **Not** the normal release path (see older ops notes). Prefer Live Admin edits + seeds.

## Live cutover notes (English-only + Guides removal)

Observed successful steps on `/var/www/pakexcise-live`:

1. If `git pull` fails on untracked upload collision, move the file aside first, e.g.  
   `public/blog/uploads/*.webp` → `~/live-upload-backup/`
2. Re-run `bash scripts/deploy-live.sh` (or finish pull/build manually).
3. When Prisma refuses to drop Urdu columns / `guides` table:

```bash
pnpm exec prisma db push --accept-data-loss
pm2 restart pakexcise-live
```

4. Confirm health + hard-refresh https://pakexcise.com.

This permanently deletes Urdu column data and Guides rows on that environment’s DB.

## Common deployment problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| Deploy “Already up to date” but UI old | Commit never pushed from laptop | Push from PC, then redeploy |
| `untracked working tree file would be overwritten` | Server-local upload under `public/` | Move/backup file, then pull/deploy |
| Turbopack/webpack error | Old build script | Ensure `build` uses `--webpack` |
| Prisma data loss stop | Schema dropped columns/tables | Explicit `--accept-data-loss` on correct env only |
| `pnpm: command not found` | Non-login SSH shell | `source ~/.nvm/nvm.sh` or `bash -lc '…'` |
| Health `buildId` wrong | Stale build / wrong dir | Confirm path + `git rev-parse HEAD` |
| Broken pipe / SSH | Network | Retry; use screen/tmux for long builds |
| GA4 still seeing admin | Historical report and/or GTM exceptions missing | App excludes admin; publish GTM exceptions; filter dates |
| Staging/live shows old Guides | Old SHA | Redeploy from `staging` after Guides removal commits |

## Related

- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [PROJECT_STATUS.md](./PROJECT_STATUS.md)
