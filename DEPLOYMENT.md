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

Public measurement IDs can be set in **Admin → Settings → Social & tracking** (DB) or via env fallback:

- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID` or admin GA4 field
- [ ] `NEXT_PUBLIC_GTM_ID` or admin GTM field
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` (server, secret)
- [ ] `NEXT_PUBLIC_TIKTOK_PIXEL_ID` + `TIKTOK_EVENTS_API_ACCESS_TOKEN` (server, secret)

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
