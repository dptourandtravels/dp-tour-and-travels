# 11 — Environment & DevOps

## Bindings (`app/wrangler.jsonc`)

| Binding | Type | Name | Status |
|---|---|---|---|
| `DB` | D1 | `dp-tour-travels-db` | live |
| `DOCUMENTS` | R2 | `dp-tour-travels-documents` | wired, **account not yet enabled** (works via `wrangler dev` local simulation) |
| `EMAIL` | send_email | — | wired, **needs Workers Paid plan + verified sending domain** |
| cron trigger | Cron | `0 2 * * *` | live — daily reminder scan |

`compatibility_flags: ["nodejs_compat"]` is required (Drizzle/pdf-lib depend on it). `observability.enabled` + `upload_source_maps` are on for readable Workers Logs.

## Environments

One environment only — production. No `env.staging`/`env.preview` block in `wrangler.jsonc`. Local dev uses `wrangler dev`'s simulated D1/R2, which is separate from the deployed D1 database.

## Scripts (`app/package.json`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `react-router dev` | local dev server |
| `build` | `react-router build` | production build |
| `deploy` | `npm run build && wrangler deploy` | build + deploy to Cloudflare |
| `preview` | `npm run build && vite preview` | preview a production build locally |
| `typecheck` | `wrangler types && react-router typegen && tsc -b` | generate binding/route types, then typecheck |
| `test` | `node --test app/**/*.test.ts` | run unit tests |
| `postinstall` | `wrangler types` | keeps `worker-configuration.d.ts` in sync after install |

## CI/CD

GitHub → Cloudflare Workers Git integration: push to the connected branch triggers a build + deploy on Cloudflare's side. No separate GitHub Actions workflow — Cloudflare's own Git integration is the deploy path (see plan.md's stack table).

## Database migrations

Drizzle Kit config: `app/drizzle.config.ts`. Migrations live in `app/migrations/0000`–`0008` (`migrations_dir` in `wrangler.jsonc`). Apply with:

```
wrangler d1 migrations apply dp-tour-travels-db --remote   # production
wrangler d1 migrations apply dp-tour-travels-db            # local
```

## Bootstrap

First superadmin account must be seeded directly (normal account creation requires being logged in as superadmin already):

```
cd app
node scripts/seed-superadmin.mjs <email> <name> [--remote]
```

## Secrets

No app-level secrets beyond what the bindings above manage (D1/R2/email are bindings, not API keys) — password hashing uses Web Crypto with no external key material. If a future integration needs a secret, use `wrangler secret put`, not a `.env` committed to the repo.

## Rollout order for the two pending gaps

1. **R2**: enable on the Cloudflare dashboard (requires a card) → `wrangler r2 bucket create dp-tour-travels-documents` → redeploy. No code change.
2. **Email**: upgrade to Workers Paid → verify a sending domain → remove the try/catch guard in `forgot-password.tsx` (`app/app/routes/forgot-password.tsx`).
