# Database

## Technology

- **PostgreSQL** (Neon in staging/live; Docker Compose optional locally)
- **Prisma ORM** `6.6.0`
- Schema: `prisma/schema.prisma`
- Client generate: `pnpm db:generate` / `postinstall`

Connection:

- `DATABASE_URL` — pooled (Neon pooler / PgBouncer) for app queries
- `DIRECT_URL` — direct host for migrations / `db push`

## Migrations vs push

This project commonly uses **`prisma db push`** on deploy (`scripts/deploy-app.sh`), not a strict checked-in migration history workflow for every change.

**Needs verification:** whether a formal `prisma/migrations` history is maintained on all environments.

```bash
pnpm db:push              # sync schema (dev)
pnpm db:migrate           # prisma migrate dev (when using migrations)
```

Destructive schema changes on shared DBs (dropping columns/tables such as Urdu fields or `guides`) require:

```bash
pnpm exec prisma db push --accept-data-loss
```

Use only with explicit intent per environment.

## Soft delete

Models with `deletedAt`: **User**, **Region**, **City**, **Service**, **RegionNumberPlateFormat** (see schema).

Helper: `activeOnly()` in `server/repositories/base/repository.ts`.

## Important enums

### `UserRole`

`CUSTOMER` | `AGENT` | `SUPPORT` | `ADMIN` | `SUPER_ADMIN`

### `ApplicationStatus`

`DRAFT` | `SUBMITTED` | `REVIEW` | `DOCS_REQUIRED` | `INVOICE_SENT` | `PAYMENT_UPLOADED` | `PAYMENT_VERIFIED` | `IN_PROGRESS` | `AT_OFFICE` | `COMPLETED` | `REJECTED` | `CANCELLED`

Transition rules: `features/applications/status-machine.ts`.

## Core models and relationships (summary)

| Model | Purpose | Notable fields / relations |
|-------|---------|----------------------------|
| User | Accounts | role, cnicEncrypted/cnicHash, status |
| Account / Session / Verification | Better Auth | |
| AgentProfile | Agent metadata | commissions |
| Region / City | Geography | soft delete |
| ServiceCategory / Service | Catalog | parent/sub services, regions M2M |
| ServiceFeeConfig | Optional fee config | **Do not expose publicly** |
| ServiceFormField | Dynamic form | isEncrypted, FieldType incl. CNIC |
| DocumentRequirement / ChecklistItem | Doc checklist | |
| Application | Case | trackingId, status, customer/agent |
| ApplicationFieldValue | Answers | valuePlain / valueEncrypted |
| Document | Uploads | R2 keys, type, status |
| Invoice / InvoiceLineItem | Billing | isOfficialFee flag |
| Payment / PaymentMethod | Payments | screenshots, verification |
| StatusHistory | Append-only status | note required by product rules |
| Notification | Outbound notices | |
| AuditLog | Admin audit | append-only |
| AnalyticsAttribution | UTM attribution on applications | |
| ActivityEvent | First-party analytics | |
| FAQ / FaqCategory | FAQs | |
| SocialLink | Footer/header social | |
| Setting | JSON settings bags | branding, tracking, features |
| SeoMeta | SEO per page/entity | FKs to service/region/city/blog/legal |
| Redirect | 301 map | |
| BlogPost / BlogCategory | Blog | |
| LegalPage | Policies | |
| GuestLead / ContactInquiry | Leads | |
| RegionPlateFormatSection / RegionNumberPlateFormat | Plate examples | |
| Review | Public reviews content | |
| AgentCommission | Agent payouts | |
| AdminPermissionGrant | Extra admin permissions | |

**Removed:** Guide content type (no `Guide` model). Legacy `/guides` URLs redirect at Next layer.

## Indexes (product expectation)

Schema includes indexes for trackingId, application status/time, service/region slugs, etc. Inspect `schema.prisma` for the authoritative list.

## Seed data

Canonical seed: `prisma/seed.ts` via `pnpm db:seed`.

Related scripts (see `package.json`):

| Script | Purpose |
|--------|---------|
| `pnpm db:setup` | Docker + push + seed |
| `pnpm db:seed-faqs` | FAQs |
| `pnpm db:seed-service-faqs` | Service FAQs |
| `pnpm db:seed-blog-categories` | Blog categories |
| `pnpm db:seed-primary-blog` | Primary posts |
| `pnpm db:seed-legal` | Legal pages |
| Legal/about update scripts | Content refreshers |

Seeds use marketing/legal defaults from `features/*` and `prisma/seed-*.ts`.

## Backup and restoration

**Needs verification** for exact Neon/Hostinger backup SLAs.

Recommended:

1. Use Neon branching / PITR for staging and production databases.
2. Never restore production backups into staging without scrubbing PII.
3. R2: separate or shared bucket policies documented in root ops notes — confirm before changing (`DEPLOYMENT.md` historically noted shared marketing R2 assets).

## Safe database-change procedure

1. Change `prisma/schema.prisma`.
2. Locally: `pnpm db:generate` then `pnpm db:push` (or `db:migrate`) against **local/dev** DB.
3. Update repositories, validators, seeds, and admin forms.
4. Run `pnpm typecheck` and smoke the affected flows.
5. Commit schema + app changes together.
6. Staging: deploy (`scripts/deploy-staging.sh` runs `prisma db push`). If Prisma warns about data loss, pause and confirm.
7. Verify staging data and app.
8. Live: deploy only after staging OK. Prefer additive changes; schedule destructive drops explicitly.

### When `--accept-data-loss` is required

Examples already used historically:

- Dropping Urdu `*Ur` columns after English-only cleanup
- Dropping `guides` table / `SeoMeta.guideId`

Always confirm which environment DB you are targeting (`.env.production` copied to `.env` on VPS by deploy script).

## Encryption keys

`ENCRYPTION_KEY`, `OTP_PEPPER`, `IP_HASH_PEPPER` must not be rotated casually — rotating without re-encrypt/re-hash invalidates CNIC ciphertext and OTP hashes.

See [ENVIRONMENT.md](./ENVIRONMENT.md).
