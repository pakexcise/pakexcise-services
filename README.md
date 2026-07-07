# PakExcise.com

Private Pakistan excise facilitation web application (not a government website).

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4, shadcn/ui, Radix UI
- Prisma + Neon PostgreSQL
- Better Auth, Zod, React Hook Form
- Cloudflare R2, Upstash Redis, AWS SES, WhatsApp Cloud API
- next-intl (English + Urdu RTL)

## Prerequisites

- Node.js 20 LTS
- pnpm 10 (`corepack enable`)
- Docker (optional, for local Postgres/Redis)

## Quick start

```bash
cp .env.example .env
# Fill required secrets (see DEPLOYMENT.md)

pnpm install
pnpm db:setup          # Docker Postgres + push + seed
# Or with Neon: pnpm db:push && pnpm db:seed

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm test` | Placeholder (no test suite yet) |
| `pnpm analyze` | Build with bundle analyzer (`ANALYZE=true`) |
| `pnpm db:seed` | Seed services, FAQs, settings |
| `pnpm db:studio` | Prisma Studio |

## Project structure

```
app/           # Routes (marketing, customer, agent, admin, api)
components/    # Shared UI
features/      # Domain modules (applications, invoices, settings, …)
server/        # Auth, DB, R2, permissions, repositories
prisma/        # Schema + seed
i18n/          # EN/UR messages
config/        # App/site config (non-business data)
```

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`. All placeholders are empty — no real secrets in the repo.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup (Neon, R2, Redis, auth, email, analytics, Sentry).

## Production notes

- Business content (services, fees, FAQs, disclaimers) is **admin-managed** in the database.
- Service fees are **never** shown on public pages; only on customer invoices.
- Private files use **signed R2 URLs** (never expose bucket keys publicly).
- Analytics events are **PII-sanitized** before dataLayer/CAPI.
- `robots.txt` blocks `/admin`, `/customer`, `/agent`, `/api`.

## License

Private — all rights reserved.
