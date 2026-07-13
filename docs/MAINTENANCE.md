# Maintenance

## Update dependencies safely

1. Read changelogs for Next, Prisma, Better Auth, Sentry.
2. Update on a branch: `pnpm update <pkg>` or intentional version bumps in `package.json`.
3. `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm build`.
4. Smoke auth, apply wizard, admin CRUD, upload.
5. Deploy staging first.

Avoid jumping major Prisma/Next versions without a dedicated migration plan.

## Add a new feature

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) and similar feature under `features/`.
2. Prefer new code in `features/<domain>/` + repository methods — not `page.tsx` Prisma.
3. Add Zod schemas under `lib/validations/`.
4. Enforce RBAC with `requirePermission` / portal guards.
5. Add English strings to `messages/en.ts` (no hardcoded UI copy).
6. If public page: SEO via `generateMetadata` / SeoMeta pattern.
7. Never expose fees publicly or log PII.
8. Document API changes in [API.md](./API.md) if HTTP surface changes.

## Fix a bug

1. Reproduce on staging or local with matching `APP_ENV`/DB.
2. Prefer root-cause in repository/action/status machine over UI patch.
3. Add regression notes to TROUBLESHOOTING if recurring.
4. Ship via staging → live.

## Change the database

Follow [DATABASE.md](./DATABASE.md) safe-change procedure. Never rotate `ENCRYPTION_KEY` / peppers casually.

## Change an API / server action

1. Keep Zod as the boundary.
2. Preserve ownership checks (`assertApplicationOwnership`).
3. Update callers (components) and docs.
4. Watch rate limiting and upload size/MIME validation.

## Change frontend components

1. Server Components by default; mark client only when needed.
2. Match existing shadcn/Tailwind patterns.
3. Keep disclaimer/branding rules.
4. RTL/Urdu: **not supported** — do not reintroduce without product decision.

## Test changes

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Manual:

- Public browse + language cookie gone/English
- Login each role you touched
- Status transition if applications touched
- Upload/signed URL if documents touched
- Admin CRUD if CMS touched

Automated tests: **not yet** (`pnpm test` placeholder).

## Review security-sensitive changes

Checklist before merge:

- [ ] No secrets in git
- [ ] Zod on every mutation
- [ ] Server-side RBAC (not only UI hide)
- [ ] No IDOR (resource belongs to user/agent)
- [ ] No plaintext CNIC/OTP
- [ ] No PII in analytics/logs
- [ ] R2 URLs signed + short TTL
- [ ] CSRF/session assumptions unchanged for Better Auth cookies

## Deploy changes

1. Commit on feature/staging branch from **local machine**.
2. `git push origin staging` (or PR into staging).
3. VPS: `bash scripts/deploy-staging.sh`.
4. QA staging.
5. VPS live: `bash scripts/deploy-live.sh`.

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Roll back a failed change

1. Revert git commit / redeploy previous SHA.
2. DB: Neon restore if schema/data wrong — `db push` will not undo data.
3. Communicate status if live payments/applications affected.

## Regular maintenance checklist

Weekly / monthly (ops):

- [ ] PM2 status / memory / restart counts
- [ ] Sentry error triage
- [ ] Neon storage / connections
- [ ] R2 bucket growth
- [ ] SES bounce/complaint metrics
- [ ] WhatsApp template & token validity
- [ ] Review admin audit logs for anomalies
- [ ] Confirm backups / Neon PITR
- [ ] Dependency CVEs (pnpm audit — interpret carefully)

## English copy & settings JSON

Legacy DB JSON may still contain keys like `guidesEnabled`. Schemas often `.strip()` unknown keys — still clean up in Admin UI saves when convenient.
