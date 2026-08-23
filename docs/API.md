# API and server actions

Mutations are primarily **Server Actions** (`"use server"` under `features/`). HTTP **Route Handlers** live under `app/api/`.

Auth is server-enforced via Better Auth session + `server/permissions/guards.ts`.

## HTTP routes

### Health & auth

| Method | Route | Purpose | Auth | Impl |
|--------|-------|---------|------|------|
| GET | `/api/health` | Health JSON (`status`, `env`, `buildId`) | Public | `app/api/health/route.ts` |
| GET/POST | `/api/auth/[...all]` | Better Auth catch-all | Session/cookie per Better Auth | `app/api/auth/[...all]/route.ts` |
| GET | `/api/auth/error` | Redirect auth errors to login | Public | `app/api/auth/error/route.ts` |

### Uploads & files

| Method | Route | Purpose | Auth | Impl |
|--------|-------|---------|------|------|
| POST | `/api/upload/presign` | R2 presigned upload | Logged-in user | `app/api/upload/presign/route.ts` |
| POST | `/api/documents/[id]/upload` | Document bytes | Ownership/role | `app/api/documents/[id]/upload/route.ts` |
| GET | `/api/documents/[id]/signed-url` | Temporary signed URL | Ownership/role | `…/signed-url/route.ts` |
| GET | `/api/documents/[id]/content` | Stream/proxy content | Ownership/role | `…/content/route.ts` |
| POST | `/api/payments/[id]/upload` | Payment screenshot | Customer ownership | payments upload |
| GET | `/api/payments/[id]/screenshot-url` | Screenshot signed URL | Authorized | |
| GET | `/api/payments/[id]/content` | Screenshot content | Authorized | |
| POST | `/api/commissions/[id]/upload` | Commission proof | Agent/admin | |
| GET | `/api/commissions/[id]/content` | Proof content | Authorized | |
| GET | `/api/commissions/[id]/proof` | Proof URL/helper | Authorized | |
| GET | `/api/invoices/[id]/pdf-url` | Invoice PDF signed URL | Authorized | |
| GET | `/api/invoices/[id]/payment-methods/[methodId]/qr` | Payment QR | Authorized | |
| POST | `/api/admin/blog/upload` | Blog image upload | `content:manage` | |
| POST | `/api/admin/branding/upload` | Branding asset | `settings:manage` | |
| POST/DELETE | `/api/admin/payment-methods/[id]/qr-upload` | QR manage | `payment-method:manage` | |
| GET | `/api/admin/payment-methods/[id]/qr-content` | QR content | permission | |
| POST/DELETE | `/api/admin/regions/plate-formats/[id]/image-upload` | Plate image | `region:manage` | |
| GET | `/api/blog/images/[filename]` | Public blog image | Public | |
| GET | `/api/branding/images/[filename]` | Public branding | Public | |
| GET | `/api/regions/plate-formats/[id]/image` | Public plate image | Public | |

### Applications / notifications / admin / realtime

| Method | Route | Purpose | Auth | Impl |
|--------|-------|---------|------|------|
| GET | `/api/applications/[id]/snapshot` | App snapshot JSON | Authorized | `app/api/applications/[id]/snapshot/route.ts` |
| GET | `/api/notifications/in-app` | List in-app | Logged-in | |
| PATCH | `/api/notifications/in-app/[id]/read` | Mark read | Owner | |
| POST | `/api/notifications/in-app/read-all` | Mark all read | Owner | |
| GET/POST | `/api/notifications/process` | Drain notification queue | Shared secret (`NOTIFICATION_DISPATCH_SECRET`) | |
| GET/POST | `/api/reviews/google/sync` | Import Google reviews via Places API (New) or GBP (one-way) | Shared secret (`GOOGLE_REVIEW_SYNC_SECRET`) | `app/api/reviews/google/sync/route.ts` |
| GET | `/api/realtime/stream` | SSE notifications | Logged-in + access check | |
| GET | `/api/realtime/applications` | Poll app events `?since=` | Role-filtered | |
| GET | `/api/admin/nav-badges` | Admin nav badge counts | Admin portal | |
| GET | `/api/debug/homepage` | Homepage diagnostics | `HOMEPAGE_DEBUG_SECRET` | |

### Webhooks

**None implemented** as provider webhook receivers. Closest workers: `/api/notifications/process`, debug homepage.

### Typical responses / errors

Handlers commonly return:

- `401` unauthenticated
- `403` forbidden / wrong role / ownership failure
- `404` missing resource
- `400` validation (Zod)
- `429` rate limited (where Upstash configured)

Exact JSON shapes vary by route — inspect the route file when integrating. **Needs verification** for a fully uniform error envelope.

## Server actions (grouped)

All under `features/**` with `"use server"`. Validate with Zod schemas in `lib/validations/*`.

### Auth & eligibility

- `features/auth/actions/*` — role select, OTP send, phone/CNIC link, eligibility checks

### Applications

- `submitApplicationAction`, draft save, service change, document upload request/confirm — `features/applications/actions/*`
- Admin status transitions, notes, bulk assign, completion proof — `features/applications/actions.ts`
- Super Admin create/update/delete — `features/applications/admin/actions/application-admin-actions.ts`
- Track by ID — `features/customer/actions/track-application.ts`

### Documents / payments / invoices

- Document approve/reject/delete/presign — `features/documents/actions.ts`
- Payment verify/reject + screenshot flow — `features/payments/actions.ts`
- Invoice create/send/update — `features/invoices/actions.ts`

### Agents / customers

- Agent approve/reject, commissions — `features/admin/agents/actions.ts`
- Agent profile/payout/receipt — `features/agents/actions/*`
- Customer profile — `features/customer/actions/profile.ts`

### Admin CMS CRUD

Services, categories, regions, cities, FAQs, blog, social, redirects, SEO, legal pages, payment methods, settings, home/contact page settings, users — under respective `features/*/admin/actions/`.

### Tracking & impersonation

- `recordActivity` — `features/tracking/actions/record-activity.ts` (drops non-public page_views)
- Impersonation — `features/admin/impersonation/actions.ts` (`requireSuperAdmin`)

## Auth patterns on actions/routes

| Helper | File |
|--------|------|
| `requireUser` / `requireRole` / `requirePermission` | `server/permissions/guards.ts` |
| `requireSuperAdmin` | same |
| `requireApprovedAgent` / `requireApplyAccess` | same |
| `assertApplicationOwnership` | same |
| `enforcePermissionAccess` | `server/permissions/permission-access.ts` (pages) |
| `getCurrentUser` | `server/auth/current-user.ts` |

Permission catalog: `server/permissions/roles.ts`.

## Related

- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Env secrets for workers: [ENVIRONMENT.md](./ENVIRONMENT.md)
