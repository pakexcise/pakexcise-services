# Analytics (GA4 / GTM)

PakExcise sends marketing analytics **only on public pages** when `APP_ENV=production`.

## IDs (production)

| Service | ID | Where set |
|---------|-----|-----------|
| GA4 | `G-CSM430BN4H` | `.env.production` → `NEXT_PUBLIC_GA4_MEASUREMENT_ID` |
| GTM | `GTM-TKJW3C6F` | `.env.production` → `NEXT_PUBLIC_GTM_ID` (optional) |

Set on VPS:

```bash
bash scripts/configure-production-tracking.sh /var/www/pakexcise-live
pnpm build
pm2 restart pakexcise-live
```

`NEXT_PUBLIC_*` values are inlined at **build time**. After changing them, rebuild and redeploy.

## How tracking works

1. **`MarketingAnalytics`** (marketing layout only) injects:
   - **Direct GA4 gtag** when `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set — primary path to GA4
   - **GTM** when `NEXT_PUBLIC_GTM_ID` is set — optional; do **not** rely on GTM alone
2. **`AnalyticsProvider`** sends manual `page_view` events with:
   - `traffic_channel`, `traffic_platform`, `traffic_medium`
   - `page_type: public`
3. Custom events (`view_service`, `click_whatsapp`, etc.) go to GA4 via gtag and to `dataLayer` for GTM.

Automatic GA4 page views are **disabled** (`send_page_view: false`) so SPA navigation is counted once with traffic context.

## Why GA4 Realtime was empty (fixed)

Previously, when both GTM and GA4 env vars were set, the app loaded **GTM only** and skipped direct gtag. The GTM container had **no tags**, so nothing reached GA4.

Fix: GA4 gtag always loads when the measurement ID is set. GTM is supplementary.

## GTM container rules

If you use GTM (`GTM-TKJW3C6F`):

- **Do not** add a second **Google Analytics: GA4 Configuration** tag for the same measurement ID — that would double-count page views.
- Use GTM only for extra tags (Ads conversions, Floodlight, etc.) or Custom Event triggers that read `dataLayer` events the app already pushes.
- Until GTM is configured, GA4 still works via direct gtag.

## GA4 custom dimensions

Register these in GA4 Admin → Custom definitions (event scope):

| Dimension | Event parameter |
|-----------|-----------------|
| Placement | `placement` |
| Traffic Channel | `traffic_channel` |
| Traffic Platform | `traffic_platform` |

## Who is tracked

| Visitor | Public marketing pages (`/`, `/services`, …) | Dashboard routes (`/admin`, `/customer`, …) |
|---------|-----------------------------------------------|---------------------------------------------|
| Guest | Yes — page views + events | No scripts loaded |
| Customer (logged in) | Yes | No scripts loaded |
| Admin / Support / Agent (logged in) | **No** — staff QA excluded | No scripts loaded |
| Impersonation session | **No** | No scripts loaded |

Dashboard routes never mount `MarketingAnalytics`. Staff browsing public pages while logged in are excluded via session role check.

## Events sent to GA4

| Event | When | Key parameters |
|-------|------|----------------|
| `page_view` | Each public marketing navigation | `page_path`, `traffic_channel`, `traffic_platform` |
| `click_whatsapp` | WhatsApp button / FAB click | `placement` (e.g. `fab`, `header_desktop`) |
| `click_social_link` | Footer/header social icon | `platform` |
| `view_service` | Service detail page view | `service_slug` |
| `start_application` | Apply flow started | `service_slug`, `step` |
| `complete_step` | Apply wizard step completed | `service_slug`, `step` |
| `submit_application` | Application submitted | `service_slug` |
| `invoice_viewed` | Customer invoice view | `application_id` (no PII) |
| `payment_uploaded` | Payment screenshot uploaded | `application_id` |
| `application_completed` | Application marked complete | `application_id`, `service_slug` |

In GA4: **Reports → Engagement → Events** (or mark key events in Admin → Events).

## Consent (admin → Settings → Tracking)

| Mode | Behavior |
|------|----------|
| `implied` (default) | Tracks unless user sets `localStorage["pakexcise.analytics.consent"] = "denied"` |
| `explicit` | Requires `"granted"` before page views — needs a consent UI |
| `disabled` | No client page views |

Scripts load regardless of consent; page_view pushes respect consent. Default `implied` is fine for production unless you add a banner.

## Verify on live

1. Open https://pakexcise.com in Chrome (not `/admin`).
2. DevTools → Network → filter `gtag` — expect `gtag/js?id=G-CSM430BN4H`.
3. DevTools → Network → filter `collect` or `google-analytics.com/g/collect` — expect hits after navigation.
4. GA4 → **Reports → Realtime** — active user within ~30 seconds.
5. Optional: GA4 → **Admin → DebugView** with [Tag Assistant](https://tagassistant.google.com/) linked to your browser.

Staging (`APP_ENV=staging`) intentionally does **not** load GA4/GTM.

## Admin / portals

`/admin`, `/customer`, `/agent`, `/support`, and auth routes **never** load GA4 or GTM.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| No `gtag/js` on homepage | Check `APP_ENV=production`, measurement ID in `.env.production`, rebuild |
| GTM loads but GA4 empty | Ensure direct gtag fix is deployed; do not depend on empty GTM |
| Realtime 0 after deploy | Hard refresh; disable ad blockers; wait 1–2 minutes |
| Events missing dimensions | Register custom dimensions in GA4 (see above) |

See also [ENVIRONMENT.md](./ENVIRONMENT.md) and [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
