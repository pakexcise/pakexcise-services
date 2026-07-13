# Project status

Last updated: **2026-07-14** (after live English-only + Guides removal schema sync).

Snapshot from repository + live deploy confirmation. Items still uncertain are marked **Needs verification**.

## Production reality (confirmed)

- Live DB synced with Prisma schema via `prisma db push --accept-data-loss`
- Dropped Urdu `*Ur` columns and **`guides` table** (had 1 row) on live
- PM2: `pakexcise-live` and `pakexcise-staging` online
- App code on GitHub `staging` includes Guides removal, English-only, marketing-only GTM (`cff65df` docs commit; app changes in `5c1925c`)

Verify anytime:

```bash
curl -s https://pakexcise.com/api/health
curl -s https://staging.pakexcise.com/api/health
```

Expect `"env"` matching the host and a current `buildId`.

## Completed work

- Multi-portal product: marketing, customer, agent, support, admin / super admin
- Dynamic services, regions/cities, FAQs, blog, legal CMS, SEO, redirects
- Application lifecycle: documents, invoices, payments, status history, tracking
- Better Auth + RBAC (`server/permissions/`)
- Cloudflare R2 signed uploads; AWS SES; WhatsApp Cloud API scaffolding
- First-party admin analytics (excludes admin/portal paths)
- English-only UI (next-intl / locale routes / Urdu fields removed)
- Guides CMS removed; `/guides` → `/blog`
- GTM/GA4 only via `MarketingAnalytics` on marketing layout; production-gated
- Hostinger VPS + PM2 deploy scripts (`scripts/deploy-*.sh`)
- `next build --webpack` for Sentry webpack compatibility
- Claude Code handover documentation under `docs/`, `CLAUDE.md`, `PROJECT_HANDOVER.md`

## Partially completed

| Area | Gap |
|------|-----|
| Automated tests | `pnpm test` is a placeholder |
| Realtime multi-instance | Default `REALTIME_DRIVER=memory`; Valkey Needs verification |
| Upload virus scanning | Mentioned in product rules; wiring Needs verification |
| Twilio SMS | Env placeholders only |
| Agent verifications admin folder | Orphan / empty — Needs verification |
| `ServiceFeeConfig` model | Exists + blocked from public selects; full admin UX Needs verification |
| GTM **console** path exceptions | App code done; container exceptions still **manual** |
| Consent banner UX | Settings support consent modes; full product UX Needs verification |
| `.cursorrules` vs code | Updated for English-only + no Guides; still prefer `docs/` when unsure |

## Missing / planned

- Real unit / integration / E2E suite (RBAC, IDOR, uploads, status machine)
- Optional formal Prisma migrate history vs ongoing `db push`
- CI gate on PRs (`typecheck` + `lint` minimum) — Needs verification if Actions already exist
- Prefer cleaning legacy settings JSON keys (`guidesEnabled`, etc.) on next admin saves

## Technical debt

- Large key-style English catalog in `messages/en.ts`
- Historical “ga4 only vs GTM” ops notes; **code prefers GTM when `NEXT_PUBLIC_GTM_ID` is set**
- `promote-staging-content-to-live` is powerful and dangerous if misused
- Local Windows builds can hit disk (`ENOSPC`) — clear `.next` when needed

## Known behaviors (not regressions)

- GA4 **historical** reports still show old admin page titles; filter dates after cutover
- Hard-refresh after deploy (CDN/browser cache)
- Deploy can fail if live has **untracked** files under `public/blog/uploads/` that collide with git pull — move/backup then redeploy
- Destructive schema sync on live requires explicit `--accept-data-loss`

## Security watchlist

- Never commit `.env*` secrets
- Do not rotate `ENCRYPTION_KEY` / peppers without a migration plan
- Impersonation = Super Admin only
- Notification process endpoint secret must stay private
- Confirm R2 bucket policies for shared marketing assets

## Performance watchlist

- Admin analytics over large `ActivityEvent` sets
- Keep heavy chart libs admin-only
- SSE + Nginx buffering for `/api/realtime/` — Needs verification at scale

## Recommended next steps (priority)

1. **Smoke-check live:** homepage, `/guides`→`/blog`, no admin Guides, no fees on public service pages, GTM absent on `/admin` (Network tab).  
2. **Publish GTM trigger exceptions** for `/admin`, `/customer`, `/agent`, `/support`, `/login`, `/signup`, `/auth`, `/choose-role`, `/api`.  
3. **Keep `.cursorrules` / `docs/` aligned** when product rules change.  
4. **Add CI** (`pnpm typecheck` + `pnpm lint`) and first RBAC/status tests.  
5. **Confirm staging `buildId`** matches live lineage; redeploy staging if it lagged live.

## Related

- [FEATURES.md](./FEATURES.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [README.md](./README.md) (docs index)
