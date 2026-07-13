# Claude Code instructions — PakExcise.com

## Purpose

Private Pakistan vehicle/excise **facilitation** SaaS (not a government site). Always keep the private facilitation disclaimer. Never imply government affiliation.

## Stack

Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn/ui, Prisma 6 + Neon Postgres, Better Auth, Zod, RHF, Cloudflare R2, Upstash Redis, AWS SES, WhatsApp Cloud API, Sentry. Package manager: **pnpm**. English-only UI (`messages/en.ts`, `lib/i18n/t.ts`). **No next-intl. No Guides CMS.**

## Important directories

- `app/` — routes (marketing, customer, agent, admin, support, auth, api)
- `features/` — domain logic + server actions
- `server/` — auth, permissions, repositories, R2, security, realtime
- `components/` — UI
- `prisma/` — schema + seeds
- `messages/` — English copy
- `config/` — env schema, admin nav, auth paths
- `scripts/` — deploy + env + content tools
- `docs/` — handover documentation

## Architecture rules

- Server Components by default; `"use client"` only when needed.
- No business logic or raw Prisma in `page.tsx` / UI components.
- Use repositories + server actions + Zod.
- No public service fees/pricing cards; invoices only.
- No locale URL prefixes; do not reintroduce Urdu/RTL/i18n routing.
- Do not recreate Guides; `/guides` redirects to `/blog`.
- GTM/GA4 only via `MarketingAnalytics` on marketing layout; production `APP_ENV` only.

## Coding conventions

- Match existing file patterns before inventing new ones.
- Feature-based folders; keep files focused.
- No `any` / unsafe casts.
- English UI strings via `messages/en.ts` helpers — not hardcoded user-facing copy.
- Admin-managed content from DB fields (English).

## Naming

- Routes: kebab-case URL segments.
- Components: PascalCase files.
- Actions: `*Action` suffix common.
- Repositories: `*-repository.ts`.

## Commands

```bash
pnpm install
pnpm dev                 # webpack
pnpm typecheck
pnpm lint
pnpm build               # webpack
pnpm test                # placeholder
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm env:sync && pnpm env:validate
# VPS: bash scripts/deploy-staging.sh | deploy-live.sh
```

## Do not modify without explicit approval

- Production/staging secrets / `.env*`
- Encryption peppers / `ENCRYPTION_KEY` rotation
- Live DB destructive `db push --accept-data-loss`
- Better Auth core config unless auth task scoped
- Payment verification / fee rules
- Public fee visibility
- Reintroducing multilingual/Guides
- Force-push to `main`/`staging`

## Security requirements

- Server-side RBAC always.
- Zod every mutation/upload.
- No plaintext CNIC/OTP/passwords.
- No PII in logs/analytics.
- Signed R2 URLs only.
- Never commit secrets.

## Database changes

- Edit `prisma/schema.prisma` + app together.
- Prefer additive migrations.
- Document data-loss needs; confirm env before `--accept-data-loss`.

## Testing requirements

Before claiming done: `pnpm typecheck`, `pnpm lint`, and `pnpm build` when feasible. Manual smoke for touched roles/flows. Automated suite not available yet — do not claim test coverage that does not exist.

## Git workflow

- Commit from developer machine, not VPS.
- Prefer staging branch deploy → QA → live.
- Clear conventional commits; no secrets.
- Do not `--no-verify` unless user requests.

## Definition of done

- Implements requested scope only.
- Matches existing patterns.
- Types/lint clean for touched areas.
- No fees on public UI.
- No secrets committed.
- Docs updated if API/env/deploy behavior changed.
- Risk called out (auth, payments, PII, schema).

## Standing instructions

1. **Inspect existing patterns** before adding new abstractions.
2. **Do not expose or commit secrets.**
3. **Do not make unrelated changes** or drive-by refactors.
4. **Explain planned changes** before major/multi-file work; wait for confirmation when risk is high.
5. Prefer updating `docs/` when behavior changes permanently.
