# Project status

Snapshot based on repository inspection at documentation time. Mark anything uncertain as **Needs verification**.

## Completed work

- Full multi-portal product: marketing, customer, agent, support, admin
- Dynamic services, regions, FAQs, blog, legal CMS
- Application lifecycle with invoices, payments, documents, status history
- Better Auth + RBAC permissions
- R2 uploads with signed URLs
- SES email + WhatsApp OTP/notifications scaffolding
- First-party analytics admin dashboard excluding portals
- English-only cleanup (next-intl / Urdu / `[locale]` routes removed)
- Guides CMS removed; `/guides` → `/blog`
- GTM/GA4 load only from marketing layout; production-gated
- Staging/live Hostinger + PM2 deploy scripts
- Webpack build flag for Sentry compatibility

## Partially completed

| Area | Gap |
|------|-----|
| Automated tests | `pnpm test` placeholder only |
| Realtime multi-instance | Default `REALTIME_DRIVER=memory`; Valkey path Needs verification |
| Virus scanning for uploads | Product rules mention hook/queue — wiring Needs verification |
| Twilio SMS | Placeholder env vars |
| Agent verifications admin route | Empty/orphan directory Needs verification |
| `ServiceFeeConfig` | Model exists; public exposure blocked; full admin UX Needs verification |
| GTM console exceptions | Code done; console exception/publish still manual |
| Live deploy of analytics+guides commits | Staging/live may lag GitHub — verify `buildId` |

## Missing / planned

- Comprehensive unit/integration/E2E suite (RBAC, IDOR, uploads, status machine)
- Formal Prisma migrate workflow vs push-only (document per team preference)
- Continuous CI gate beyond local typecheck/lint (Needs verification if GitHub Actions exists)
- Consent banner UI fully productized (settings mention consent modes)

## Technical debt

- `.cursorrules` still mentions next-intl, Urdu, Guides model — partially stale vs code
- Large English catalog `messages/en.ts` (legacy translation key style)
- Dual GTM vs direct GA4 operational guidance historically conflicting; code prefers GTM when set
- Promote-staging-content scripts are powerful and risky if misused
- Windows disk/`ENOSPC` during large builds observed in development

## Known bugs / behaviors

- Historical GA4 reports include admin page titles until date filtered after fix (not “code still broken” once live has marketing-only tags)
- Hard-refresh required after deploy due to caching
- **Needs verification:** any remaining admin nav or homepage section driven purely from stale DB settings JSON

## Security concerns

- Always validate env files never enter git
- Peppers/encryption rotation without migration breaks crypto fields
- Impersonation is Super Admin–only — treat as high risk
- Shared R2 for marketing assets: confirm access policies
- Notification processor secret must stay private

## Performance concerns

- Admin analytics queries over large `ActivityEvent` tables — monitor
- N+1 risks in complex admin lists — follow repository patterns
- SSE + Nginx buffering Needs verification for scale
- First-load JS budget: keep heavy charts (recharts) admin-only

## Recommended next steps (priority)

1. **Verify staging `buildId` is `5c1925c` or newer** — Guides gone; if not, redeploy staging.
2. **Deploy live** with English-only + Guides removal + marketing-only GTM; confirm DebugView.
3. **Publish GTM path exceptions** for admin/portal prefixes (defense in depth).
4. **Add CI:** at least `typecheck` + `lint` on PRs; seed a few RBAC/status unit tests.
5. **Refresh `.cursorrules`** to English-only / no Guides / current stack so agents do not resurrect i18n.

## Related

- [FEATURES.md](./FEATURES.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
