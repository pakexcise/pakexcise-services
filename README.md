# PakExcise.com

Private Pakistan vehicle & excise **facilitation** web application.

**Not a government website.** Never imply official Excise & Taxation, MTMIS, NADRA, or government affiliation in UI copy. Always surface the private facilitation disclaimer.

Package name: `pakexcise` (`package.json`). Repository: this monorepo app.

## Main features

- Public marketing site: services, regions/cities, FAQs, blog, track, contact, legal pages
- Customer portal: applications, documents, invoices, payment screenshots, profile
- Agent portal: submit on behalf of customers, commissions, profile
- Support portal: applications, guest leads, notes
- Admin / Super Admin: full CMS, applications workflow, invoices/payments, SEO, redirects, settings, analytics
- First-party activity analytics (admin) + production-only GA4/GTM on **public marketing pages only**
- Notifications (email via AWS SES, WhatsApp Cloud API, in-app)
- Private document storage via Cloudflare R2 signed URLs

## Technology stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js **16.2.7** App Router, React **19.1**, TypeScript strict |
| Styling | Tailwind CSS **v4**, shadcn/ui, Radix UI, Lucide |
| ORM / DB | Prisma **6.6**, Neon PostgreSQL (or local Docker Postgres) |
| Auth | Better Auth **1.2.7** |
| Forms / validation | Zod, React Hook Form |
| Client state | Zustand (only where needed) |
| Themes | next-themes |
| Copy | English-only static module (`messages/en.ts` + `lib/i18n/t.ts`) — **next-intl removed** |
| Storage | Cloudflare R2 |
| Cache / rate limit | Upstash Redis |
| Email | AWS SES (Resend not used; `RESEND_API_KEY` is rejected) |
| Messaging | WhatsApp Cloud API, optional Twilio SMS stub |
| Monitoring | Sentry |
| Package manager | **pnpm 10** (`packageManager: pnpm@10.12.1`) |

## System requirements

- **Node.js** ≥ 20 LTS
- **pnpm** 10 (`corepack enable`)
- Docker optional for local Postgres (`docker compose`)
- Git

## Installation

```bash
git clone <repo-url>
cd PakExciseServices
cp .env.example .env
# Fill secrets — see docs/ENVIRONMENT.md (never commit .env)

pnpm install
```

## Environment setup

1. Copy `.env.example` → `.env` (and typically `.env.local` for local overrides).
2. Run `pnpm env:sync` after editing `.env.local` so `.env` stays aligned (project convention).
3. Validate with `pnpm env:validate` when available.
4. Set `APP_ENV=development` and matching URLs (`http://localhost:3000`).

Required local secrets include (non-exhaustive): `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ENCRYPTION_KEY`, `OTP_PEPPER`, `IP_HASH_PEPPER`, R2 credentials. Full list: [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md).

## Development commands

```bash
pnpm db:setup          # Docker Postgres + prisma db push + seed (if using Docker)
# Or with Neon:
pnpm db:push
pnpm db:seed

pnpm dev               # next dev --webpack (port 3000)
pnpm typecheck
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000).

## Build and production

```bash
pnpm build             # next build --webpack (required: Sentry adds webpack config)
pnpm start             # next start
pnpm analyze           # ANALYZE=true pnpm build
```

VPS deploy: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Testing

```bash
pnpm test              # Placeholder only — no automated suite yet
pnpm typecheck
pnpm lint
```

Manual QA checklists live in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) and [docs/MAINTENANCE.md](./docs/MAINTENANCE.md).

## Project structure (short)

```
app/           # Route groups: (marketing), (customer), (agent), (admin), (support), (auth), api/
components/    # UI (shared, marketing, admin shells, analytics)
features/      # Domain modules + server actions
server/        # Auth, DB, R2, permissions, repositories, security
prisma/        # schema.prisma + seeds
messages/      # English UI copy (en.ts)
config/        # Auth paths, admin nav, env schema, redirects
scripts/       # deploy-*.sh, env sync, content promote
docs/          # Handover documentation
CLAUDE.md      # Instructions for Claude Code
```

## Important product rules

- Service **fees are never shown** on public pages — only on customer invoices (admin-generated).
- CNIC and sensitive fields use **AES-256-GCM** encryption; never store plaintext CNIC.
- Content (services, FAQs, SEO, legal) is **admin/DB managed**, not hardcoded.
- Language: **English only**; legacy `/en` and `/ur` URLs permanently redirect to clean paths.
- Guides CMS **removed**; `/guides` redirects to `/blog`.

## Documentation map

Start here for a new developer or AI agent: [PROJECT_HANDOVER.md](./PROJECT_HANDOVER.md).

| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design |
| [docs/FEATURES.md](./docs/FEATURES.md) | Feature inventory |
| [docs/DATABASE.md](./docs/DATABASE.md) | Prisma models |
| [docs/API.md](./docs/API.md) | HTTP routes + server actions |
| [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) | Env vars |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Staging / live VPS |
| [docs/MAINTENANCE.md](./docs/MAINTENANCE.md) | Day-to-day engineering |
| [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Common failures |
| [docs/PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) | Status & next steps |
| [CLAUDE.md](./CLAUDE.md) | Claude Code permanent rules |

## Basic troubleshooting

| Problem | Fix |
|---------|-----|
| `Turbopack` / webpack error on build | Use `pnpm build` (`next build --webpack`) — already set in `package.json` |
| Env URL mismatches | `APP_ENV` must match `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` origins (see `config/env.schema.ts`) |
| Prisma client out of date | `pnpm db:generate` or `pnpm install` (postinstall generates) |
| Auth cookie issues locally | Use `http://localhost:3000` consistently for auth + app URLs |
| GA4 not loading on staging | Expected — tags load only when `APP_ENV=production` |

More: [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md).

## License

Private — all rights reserved.
