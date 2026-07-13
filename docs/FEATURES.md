# Features

Status values: **complete** | **partial** | **planned** | **deprecated**.  
“Complete” means primary UI + actions + repositories exist in repo — not a claim of zero bugs.

**Live (Jul 2026):** English-only + Guides removal are on production (schema drop via `--accept-data-loss`). See [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## Public marketing

| Feature | Status | Main files / routes | Business rules / notes |
|---------|--------|---------------------|------------------------|
| Homepage CMS sections | complete | `app/(marketing)/page.tsx`, `features/home-page/` | Sections/limits from DB settings |
| Services catalog | complete | `/services`, `/services/[slug]`, `features/services/` | No public fees |
| Regions & cities | complete | `/regions`, `features/regions/`, `features/cities/` | Plate formats on province pages |
| FAQs | complete | `/faqs`, `features/faqs/` | English DB fields only |
| Blog | complete | `/blog`, `features/blog/` | Feature-flaggable via settings |
| Track application | complete | `/track`, `features/customer/actions/track-application.ts` | Tracking ID |
| Contact + inquiries | complete | `/contact`, `features/contact-inquiries/` | Turnstile/rate limits — Needs verification on all envs |
| Guest service request | complete | `/request/[serviceSlug]`, `features/guest-leads/` | Guest lead pipeline |
| Apply wizard | complete | `/apply/[serviceSlug]`, `features/applications/` | Auth required (customer or approved agent) |
| Legal pages | complete | `/privacy-policy`, `/terms-and-conditions`, etc., `features/legal-pages/` | Legacy `/privacy` etc. redirect |
| About / how-it-works / documents | complete | marketing pages + CMS settings | |
| Agents marketing / register | complete | `/agents`, `/agent-register` | |
| Reviews page | complete | `/reviews` | Feature flag `reviewsEnabled` |
| Guides CMS | **deprecated / removed** | redirects `/guides` → `/blog` | No Prisma `Guide` model |

## Customer portal

| Feature | Status | Main files | Rules |
|---------|--------|------------|-------|
| Dashboard & applications | complete | `app/(customer)/`, `features/customer/` | Own applications only |
| Documents upload/view | complete | `features/documents/`, `/api/documents/*` | Signed URLs |
| Invoice view / PDF | complete | `features/invoices/`, `/api/invoices/*` | After invoice sent |
| Payment screenshot | complete | `features/payments/` | Only after `INVOICE_SENT` |
| Profile | complete | customer profile actions | |

## Agent portal

| Feature | Status | Main files | Rules |
|---------|--------|------------|-------|
| Dashboard & applications | complete | `app/(agent)/`, `features/agents/` | Approved/active agent |
| New application for customer | complete | agent applications new | |
| Commissions | complete | commissions UI + actions | Facilitation fee from non-official invoice lines |
| Profile / payout method | complete | agent profile actions | |

## Support portal

| Feature | Status | Main files | Rules |
|---------|--------|------------|-------|
| Applications read/notes | complete | `app/(support)/` | No payment verify / no fee set |
| Guest leads | complete | support guest-leads pages | |

## Admin / Super Admin

| Feature | Status | Main files | Rules |
|---------|--------|------------|-------|
| Applications workflow | complete | `/admin/applications`, `features/applications/` | Status notes; proof for COMPLETED when required |
| Invoices & payment verify | complete | invoice/payment actions | Official vs facilitation fee lines |
| Services / categories / availability | complete | `features/services/`, service-categories | Slug change → redirect |
| Regions / cities / plate formats | complete | regions/cities admin | |
| Checklist & document requirements | complete | admin checklist/doc-req pages | |
| FAQs / categories | complete | faq admin | |
| Blog / categories | complete | blog admin | |
| Legal pages | complete | legal-pages admin | Super Admin for some |
| Homepage / contact page CMS | complete | home-page, contact-page admin | |
| Social links | complete | `features/social/` | |
| SEO meta | complete | `features/seo/` | |
| Redirects | complete | `features/redirects/` | |
| Customers / agents / payouts | complete | admin agents/customers | |
| Payment methods | complete | payment-methods admin | |
| Users & permissions | complete | `features/admin/users/` | Super Admin |
| Site / system settings | complete | settings admin | Super Admin for site settings |
| Audit logs | complete | audit-logs admin | Append-only; Super Admin can’t delete logs (product rule) |
| First-party analytics | complete | `/admin/analytics`, `server/repositories/admin-analytics-repository.ts` | Excludes admin/portal page views |
| Impersonation | complete | `features/admin/impersonation/` | Super Admin |
| Agent verifications route folder | **partial** | `app/(admin)/admin/agent-verifications/` empty of pages — Needs verification | Orphan |
| Guides admin | **deprecated** | removed | |

## Platform / cross-cutting

| Feature | Status | Main files | Limitations |
|---------|--------|------------|-------------|
| Better Auth (email/phone OTP, Google OAuth) | complete | `server/auth/`, `features/auth/` | Needs verification: every provider enabled per env |
| RBAC + admin grants | complete | `server/permissions/` | Client checks UX-only |
| R2 uploads | complete | `server/r2/`, upload APIs | Virus scan “hook” — Needs verification if wired |
| Notifications email/WhatsApp/in-app | complete | `features/notifications/`, `/api/notifications/*` | Channel completeness Needs verification per env |
| Realtime SSE | partial | `/api/realtime/stream`, `server/realtime/` | Memory driver default; multi-instance Valkey Needs verification |
| Rate limiting | complete | Upstash | Fails closed/open behavior Needs verification without Redis |
| Marketing pixels | complete | `MarketingAnalytics` | **`APP_ENV=production` only**; marketing layout only (no admin) |
| English-only UI | complete | `messages/en.ts`, `lib/i18n/t.ts` | Urdu removed; legacy `/en`/`/ur` redirects remain |
| Automated tests | planned | `pnpm test` placeholder | No suite |

## Important business rules (global)

1. Never show service fees on public marketing pages.
2. Never store CNIC/OTP/passwords in plaintext.
3. Never expose private R2 object keys without authz.
4. Never send PII to analytics pixels.
5. Application status changes require notes; respect status machine.
6. PakExcise is a **private facilitation** service — keep disclaimer visible.
7. No `/en` or `/ur` locale prefixes in new URLs.
8. Guides CMS must not be reintroduced without an explicit product decision.

## Known limitations

- No automated end-to-end / RBAC test suite in CI yet.
- `ServiceFeeConfig` Prisma model exists with “admin-only” comment; runtime fees primarily via invoices — **Needs verification** of whether fee config UI is fully used.
- Root `DEPLOYMENT.md` historically mentioned Urdu/guides/Turbopack — superseded by this docs package.
- Production GTM container exceptions for admin paths are **manual console work** (see PROJECT_STATUS).
