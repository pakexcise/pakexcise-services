# Maintained deployment guide

The canonical deployment documentation is:

→ **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

Also see [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) and [PROJECT_HANDOVER.md](./PROJECT_HANDOVER.md).

Historical checklist content that remains useful (providers):

- Neon PostgreSQL (separate DBs for staging and live)
- Cloudflare R2, Upstash Redis, AWS SES, WhatsApp Cloud API, Turnstile, Sentry
- `APP_ENV=production` gates search indexing + marketing tags
- VPS PM2 apps: `pakexcise-staging` (:3001), `pakexcise-live` (:3000)

**Outdated vs current code (do not follow):**

- next-intl / Urdu RTL smoke tests
- Guides CMS admin editing
- Turbopack-only `pnpm build` (use webpack flag; already in `package.json`)
- “Always install GA4 only via direct gtag and never via GTM” — code prefers GTM when `NEXT_PUBLIC_GTM_ID` is set
