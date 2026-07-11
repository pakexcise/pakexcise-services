# PakExcise.com — Deployment Checklist

Use this checklist before going live. `.env.example` lists every variable; fill values in your host's secret manager.

## 1. Database (Neon PostgreSQL)

- [ ] Create Neon project (production + staging)
- [ ] Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in env
- [ ] Run `pnpm db:push` or `pnpm db:migrate` on deploy
- [ ] Run `pnpm db:seed` once on empty DB (or import admin-managed content)
- [ ] Enable Neon backups / point-in-time recovery

## 2. Authentication (Better Auth)

- [ ] Generate `BETTER_AUTH_SECRET` (32+ random bytes)
- [ ] Set `BETTER_AUTH_URL` to production URL (`https://your-domain.com`)
- [ ] Configure Google OAuth redirect URIs if used
- [ ] Set `ENCRYPTION_KEY` (32-byte base64) for sensitive field encryption
- [ ] Set `OTP_PEPPER`, `IP_HASH_PEPPER`, `NOTIFICATION_RECIPIENT_PEPPER`

## 3. Cloudflare R2 (private documents)

- [ ] Create private bucket (no public access)
- [ ] Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
- [ ] Do **not** expose `R2_PUBLIC_URL` for customer documents
- [ ] Verify signed URL expiry (view: 1h, proof: 24h)

## 4. Upstash Redis

- [ ] Create Redis database
- [ ] Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- [ ] Required for rate limiting (forms, track, auth, uploads) and notification queue

## 5. Email (AWS SES)

- [ ] Verify `pakexcise.com` in AWS SES (region: `us-east-1`)
- [ ] Create IAM user with `ses:SendEmail` (scoped to verified domain/addresses)
- [ ] Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SES_REGION=us-east-1`
- [ ] Set `SES_FROM_EMAIL=noreply@pakexcise.com`, `SES_REPLY_TO_EMAIL=info@pakexcise.com`
- [ ] Request production access in SES if still in sandbox
- [ ] Mailbox `info@pakexcise.com` remains on Hostinger for inbound mail

## 6. WhatsApp Cloud API

- [ ] Create Meta app → WhatsApp → API Setup
- [ ] Set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`
- [ ] Create OTP template `pakexcise_otp` (authentication mode for production)
- [ ] Set `WHATSAPP_DEV_FALLBACK_ON_ERROR=false` in production

## 7. SMS fallback (Twilio) — optional

- [ ] Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- [ ] Enable `smsFallbackEnabled` in admin → Settings → Feature flags

## 8. Analytics & pixels

GA4, GTM, and Google Search Console load **only when `APP_ENV=production`** (not on staging).

On the live VPS, run:

```bash
bash scripts/configure-production-tracking.sh /var/www/pakexcise-live
cp .env.production .env
```

Production values:

- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-CSM430BN4H`
- [ ] `NEXT_PUBLIC_GTM_ID=GTM-TKJW3C6F`
- [ ] `GOOGLE_SITE_VERIFICATION` (HTML meta tag for Search Console)

Optional overrides in **Admin → Settings → Social & tracking** (DB). Env vars are used when admin fields are empty.

**GTM note:** GA4 is installed directly via `gtag.js` in the site layout. Do **not** add a second GA4 Configuration tag inside GTM for the same measurement ID (avoids double-counting). Use GTM for future tags (Meta, TikTok, etc.).

**Google Search Console:** After deploy, submit `https://pakexcise.com/sitemap.xml` and link the GA4 property in GSC admin.

Other pixels (env or admin):

- [ ] `NEXT_PUBLIC_META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` (server, secret)
- [ ] `NEXT_PUBLIC_TIKTOK_PIXEL_ID` + `TIKTOK_EVENTS_API_ACCESS_TOKEN` (server, secret)

Internal activity events (signup, WhatsApp clicks, applications) are stored in PostgreSQL (`activity_events`) — not sent to GA4.

**GA4 custom dimensions (register once in Admin → Data display → Custom definitions):**

| Event parameter | Scope | Example values |
|-----------------|-------|----------------|
| `traffic_channel` | Event | social, ai, search, paid, direct |
| `traffic_platform` | Event | facebook, chatgpt, google, tiktok |
| `placement` | Event | fab, header_desktop, home_hero_whatsapp |

After 24–48 hours, build GA4 Explorations filtered by `traffic_channel = ai` or `traffic_platform = chatgpt` to analyze AI referral traffic.

**UTM links for social posts:** use `?utm_source=facebook&utm_medium=social&utm_campaign=post_name` (or `utm_source=chatgpt&utm_medium=ai` for AI tool listings).

## 9. Cloudflare Turnstile

- [ ] Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` on public forms

## 10. Sentry

- [ ] Create Sentry project
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` (client + server)
- [ ] Set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` for source maps upload (CI)
- [ ] Sentry only activates when DSN is present

## 11. App host (Vercel / similar)

- [ ] Set `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- [ ] Set `REALTIME_DRIVER=memory` on a single PM2 instance (use `valkey` when running multiple app instances with Redis pub/sub)
- [ ] Node 20 runtime
- [ ] Build: `pnpm build`
- [ ] Start: `pnpm start`
- [ ] Schedule cron/QStash to `POST /api/notifications/process` with `NOTIFICATION_DISPATCH_SECRET`

### Nginx SSE (real-time stream)

Customer/agent dashboards use Server-Sent Events at `/api/realtime/stream`. Disable buffering for that route or connections may stall:

```nginx
location /api/realtime/ {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Connection "";
  proxy_buffering off;
  proxy_cache off;
  proxy_read_timeout 3600s;
  add_header Cache-Control "no-cache, no-transform";
}
```

## 12. Security verification

- [ ] `robots.txt` disallows `/admin/`, `/customer/`, `/agent/`, `/api/`
- [ ] Sitemap excludes private routes (only public marketing + published content)
- [ ] CSP / security headers applied via `proxy.ts`
- [ ] No service fees on public pages
- [ ] Admin settings disclaimer visible on marketing layout
- [ ] RBAC enforced server-side on all actions

## 13. Post-deploy smoke test

- [ ] Home, services, FAQs load from DB
- [ ] Submit test application (customer flow)
- [ ] Admin status transition + audit log entry
- [ ] Invoice generate + customer PDF download (signed URL)
- [ ] Payment screenshot upload
- [ ] Track page (rate limited)
- [ ] Urdu RTL layout + dark mode
- [ ] `pnpm typecheck && pnpm lint && pnpm build` pass in CI
- [ ] `GET /api/health` shows `email.configured: true` and expected `buildId`
- [ ] Signup sends OTP to the user's inbox (not Resend sandbox / dev console)

## VPS deploy (Hostinger / PM2)

Run from the app directory on the server (`/var/www/pakexcise-live` or `/var/www/pakexcise-staging`).

### Environment file location

Next.js loads `.env.production` and `.env` from the **app root**, not your home directory.

Required for email (remove all `RESEND_*` variables):

```env
APP_ENV=production
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_REGION=us-east-1
SES_FROM_EMAIL=noreply@pakexcise.com
SES_REPLY_TO_EMAIL=info@pakexcise.com
```

Optional dedicated SES IAM keys (if R2 uses different credentials):

```env
AWS_SES_ACCESS_KEY_ID=...
AWS_SES_SECRET_ACCESS_KEY=...
```

### Clean deploy script

```bash
bash scripts/deploy-app.sh /var/www/pakexcise-live pakexcise-live staging
bash scripts/deploy-app.sh /var/www/pakexcise-staging pakexcise-staging staging
```

### Promote staging → live (code + marketing content)

Live and staging use **separate Neon databases**. Deploying code does not copy blog/SEO/CMS content.

**Never** dump/restore the whole staging DB onto live (that would wipe customers, applications, invoices, payments).

Safe promote:

1. Deploy latest `staging` branch code to live
2. Sync schema (`prisma db push` — stop if Prisma warns about data loss)
3. Copy marketing content from staging DB → live DB with `pnpm db:promote-staging-content`
4. Clear ISR cache and recreate the live PM2 process

```bash
# On the VPS as deploy user

# 1) Code deploy (build + ensure-live-pm2 on :3000)
cd /var/www/pakexcise-live
git fetch origin staging
git reset --hard origin/staging
bash scripts/deploy-app.sh /var/www/pakexcise-live pakexcise-live staging

# 2) Schema (additive only)
pnpm exec prisma db push

# 3) Content promote (dry-run first)
SOURCE_DATABASE_URL="$(grep ^DATABASE_URL= /var/www/pakexcise-staging/.env.production | cut -d= -f2- | tr -d '\"')" \
  pnpm db:promote-staging-content -- --dry-run

SOURCE_DATABASE_URL="$(grep ^DATABASE_URL= /var/www/pakexcise-staging/.env.production | cut -d= -f2- | tr -d '\"')" \
  pnpm db:promote-staging-content

# Or use the wrapper (apply also clears ISR + recreates PM2):
#   bash scripts/run-promote-staging-content.sh --dry-run
#   bash scripts/run-promote-staging-content.sh

# 4) Clear ISR + verify
rm -rf .next/cache
bash scripts/ensure-live-pm2.sh
curl -s http://127.0.0.1:3000/api/health
pm2 list
```

What the promote script syncs (by slug / pageKey):

- Blog categories + posts (live posts not in staging are removed)
- Guides, legal pages, FAQs, social links, reviews
- Redirects (merge upsert; live-only redirects kept)
- SEO meta (rewrites `staging.pakexcise.com` → `pakexcise.com` in canonicals)
- Regions, cities, services, form fields, document requirements (keeps live IDs)
- Allowlisted settings only: home/contact page, public UI, forms, branding, business, SEO defaults

What it never touches:

- Users, sessions, agents, applications, documents, invoices, payments
- Audit logs, analytics, guest leads, contact inquiries
- Payment / tracking / feature-flag settings (env-specific)

Verify after promote:

- [ ] Health `buildId` matches `git rev-parse --short HEAD`
- [ ] Live PM2 memory is hundreds of MB (not ~10–20MB)
- [ ] `https://pakexcise.com/blog` matches staging featured article
- [ ] Canonicals use `pakexcise.com` (not staging host)
- [ ] Live admin still shows real customers/applications

Manual equivalent:

```bash
cd /var/www/pakexcise-live
git pull origin staging
export BUILD_ID="$(git rev-parse --short HEAD)"
pnpm install
rm -rf .next
pnpm build
pm2 restart pakexcise-live --update-env
curl -s http://127.0.0.1:3000/api/health
```

### After deploy

- Hard refresh the browser (`Ctrl+Shift+R`) if you see **Failed to find Server Action** — that means stale client JS from a previous build.
- PM2 logs should **not** contain `[email:sandbox-forward]` or `onboarding@resend.dev` after SES migration.
- If OTP still fails, check PM2 logs for `[email:ses] delivery failed` and verify SES production access (sandbox only sends to verified addresses).
- Test SES directly on the server:

```bash
cd /var/www/pakexcise-live
node scripts/verify-ses.mjs your@email.com
```

## 14. Manual QA areas (no automated tests yet)

- Status history notes on every transition
- IDOR: customer cannot access other users' applications
- Agent module disabled flag returns 404 for `/agent`
- Maintenance mode shows public banner only

## Bundle analysis

```bash
pnpm analyze
```

Opens webpack bundle report in browser after build.
