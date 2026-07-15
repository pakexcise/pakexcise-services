# Environment variables

**Never commit real secrets.** Use `.env.example` placeholders only.  
This file lists names and purpose — **no live values**.

Canonical example file: `.env.example`  
Validation: `config/env.schema.ts` via `pnpm env:validate` / server boot paths.

## App identity

| Variable | Required | Purpose | Source |
|----------|----------|---------|--------|
| `APP_ENV` | **Yes** | `development` \| `staging` \| `production` | Ops config |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public origin (must match env) | Ops |
| `BETTER_AUTH_URL` | **Yes** | Auth base URL (same origin rules) | Ops |
| `NEXT_PUBLIC_APP_NAME` | Optional | Display name | Ops |

`config/env.schema.ts` enforces URL origins:

- development → `http://localhost:3000`
- staging → `https://staging.pakexcise.com`
- production → `https://pakexcise.com`

## Database

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | Pooled Postgres URL |
| `DIRECT_URL` | **Yes** | Direct Postgres URL (migrate/push) |
| `SOURCE_DATABASE_URL` | Optional | Promote-script source — Needs verification usage |

## Auth & cryptography

| Variable | Required | Purpose |
|----------|----------|---------|
| `BETTER_AUTH_SECRET` | **Yes** | Better Auth secret |
| `ENCRYPTION_KEY` | **Yes** | AES-256-GCM key (32-byte base64) |
| `OTP_PEPPER` | **Yes** | OTP hashing pepper |
| `IP_HASH_PEPPER` | **Yes** | IP hash pepper |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `META_APP_ID` / `META_APP_SECRET` | Optional | Meta OAuth (may differ from WhatsApp app) |

## Storage (R2)

| Variable | Required | Purpose |
|----------|----------|---------|
| `R2_ACCOUNT_ID` | **Yes** (schema) | Cloudflare account |
| `R2_ACCESS_KEY_ID` | **Yes** | API key |
| `R2_SECRET_ACCESS_KEY` | **Yes** | API secret |
| `R2_BUCKET_NAME` | **Yes** | Bucket |
| `R2_PUBLIC_URL` | Optional | Public CDN base for allowlisted marketing assets |

## Redis

| Variable | Required | Purpose |
|----------|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Required for public review submission | Rate limits / cache |
| `UPSTASH_REDIS_REST_TOKEN` | Required for public review submission | |

Without Redis, rate limiting behavior may degrade — **Needs verification** of fail-open vs fail-closed.

## Email (Brevo + AWS SES fallback)

| Variable | Required | Purpose |
|----------|----------|---------|
| `BREVO_API_KEY` | **Yes** on staging/production | Primary transactional email (Brevo API) |
| `BREVO_FROM_EMAIL` | **Yes** when Brevo is used | Verified sender in Brevo |
| `BREVO_FROM_NAME` | Optional | From display name (default `PakExcise.com`) |
| `BREVO_REPLY_TO_EMAIL` | Optional | Reply-to (default `info@pakexcise.com`) |
| `AWS_ACCESS_KEY_ID` or `AWS_SES_ACCESS_KEY_ID` | **Yes** on staging/production | SES fallback when Brevo fails or quota is exceeded |
| `AWS_SECRET_ACCESS_KEY` or `AWS_SES_SECRET_ACCESS_KEY` | **Yes** staging/production | |
| `AWS_SES_REGION` | Recommended | Default `us-east-1` in example |
| `SES_FROM_EMAIL` | Recommended | SES from identity |
| `SES_REPLY_TO_EMAIL` | Optional | SES reply-to |
| `SES_SANDBOX_FORWARD_TO` | Staging sandbox only | Forward OTP while SES sandbox |

Delivery order: **Brevo first** → on timeout, API outage, rate limit, or credit/quota errors → **AWS SES**.

Verify locally or on VPS:

```bash
pnpm email:verify-brevo you@example.com
pnpm email:verify-ses you@example.com
```

`RESEND_API_KEY` must **not** be set (schema forbids).

## WhatsApp / SMS

| Variable | Required | Purpose |
|----------|----------|---------|
| `WHATSAPP_*` | Optional/env-dependent | Cloud API OTP + templates |
| `WHATSAPP_DEV_FALLBACK_ON_ERROR` | Dev helper | Log OTP locally on Meta failure |
| `TWILIO_*` | Optional | SMS fallback placeholder |

## Notifications worker

| Variable | Required | Purpose |
|----------|----------|---------|
| `NOTIFICATION_DISPATCH_SECRET` | Recommended for prod | Authenticates `/api/notifications/process` |
| `NOTIFICATION_RECIPIENT_PEPPER` | Recommended | Hashing for recipient privacy |

## Google Business Profile reviews

One-way import only (`GET`/`POST` `/api/reviews/google/sync`). Website reviews are **not** posted to Google.

| Variable | Required | Purpose |
|----------|----------|---------|
| `GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID` | For sync | GBP account ID from API |
| `GOOGLE_BUSINESS_PROFILE_LOCATION_ID` | For sync | GBP location ID from API |
| `GOOGLE_BUSINESS_PROFILE_CLIENT_ID` | For sync | OAuth client ID |
| `GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET` | For sync | OAuth client secret |
| `GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN` | For sync | Offline refresh token for a manager user |
| `GOOGLE_REVIEW_SYNC_SECRET` | Recommended | Bearer/query secret for the sync route |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | Optional | “Review us on Google” CTA |

Schedule sync with VPS cron or QStash, e.g. every 6 hours:

`Authorization: Bearer $GOOGLE_REVIEW_SYNC_SECRET` → `POST https://staging.pakexcise.com/api/reviews/google/sync`

Reference only (not substitutes for API IDs): Business Profile ID `8066285004634443548`.

## Turnstile / bot

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Required for public review submission | Client widget |
| `TURNSTILE_SECRET_KEY` | Required for public review submission | Server verification |

Guest reviews fail closed in production when Turnstile is not configured. They are also
protected by an IP rate limit, a honeypot field, minimum form-completion time, duplicate
detection, and mandatory admin moderation.

Run `pnpm db:seed-reviews` to create or refresh unpublished review drafts for every
active service. Existing moderation and publication states are preserved.

## Analytics (production only)

Loaded only when `APP_ENV=production` (`lib/analytics/production-tracking.ts`) and only on marketing layout.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Optional | Direct gtag if **no** GTM |
| `NEXT_PUBLIC_GTM_ID` | Optional | Prefer GTM when set |
| `NEXT_PUBLIC_META_PIXEL_ID` / `META_CAPI_ACCESS_TOKEN` | Optional | Meta |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` / `TIKTOK_EVENTS_API_ACCESS_TOKEN` | Optional | TikTok |
| `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` | Optional | Meta tags (production indexing) |

## Sentry

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Enables client/server init |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Optional | Upload/source maps on build |

## Realtime / ops

| Variable | Required | Purpose |
|----------|----------|---------|
| `REALTIME_DRIVER` | Optional | `memory` (default single instance) or valkey — Needs verification |
| `BUILD_ID` | Optional | Override Next build id |
| `PORT` | Optional | PM2/Node listen port |
| `HOMEPAGE_DEBUG_SECRET` | Optional | `/api/debug/homepage` |
| `ANALYZE` | Optional | Bundle analyzer |
| `CI` | Optional | CI detection |

## Development vs production differences

| Concern | Development | Staging | Production |
|---------|-------------|---------|------------|
| `APP_ENV` | `development` | `staging` | `production` |
| Indexing / GA4/GTM | Off | Off (no search indexing helper) | On when IDs set |
| Email (Brevo + SES) | Optional locally | Brevo + SES required by schema | Brevo + SES required |
| URLs | localhost | staging.pakexcise.com | pakexcise.com |
| Debug OTP WhatsApp | May fallback to console | Prefer real Meta | Real Meta |

## Sync habit

Project scripts:

```bash
pnpm env:sync
pnpm env:validate
```

VPS deploy copies `.env.production` → `.env` before `prisma db push` (`scripts/deploy-app.sh`).
