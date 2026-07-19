# MVP Tech Doc

What's built, what's stubbed, and how to run it. Phase-by-phase detail lives in [plan.md](./plan.md); this is the status snapshot + dev setup.

## Stack

| Layer | Choice |
|---|---|
| Compute | Single Cloudflare Worker |
| Frontend/Backend | React Router v7, SSR on Workers (loaders/actions double as the API) |
| ORM / DB | Drizzle → Cloudflare D1 |
| File storage | Cloudflare R2 |
| Auth | Custom session-cookie auth, Web Crypto password hashing |
| PDF | pdf-lib |
| Scheduled jobs | Cloudflare Cron Trigger (`0 2 * * *`) |
| Email | Cloudflare Email Sending — password reset only |
| Deploy | GitHub → Cloudflare Workers Git integration |

## Status by phase

| Phase | Scope | Status |
|---|---|---|
| 0 | Scaffold, D1 + R2 bindings | Done — R2 binding wired, **account not yet enabled** |
| 1 | Auth & RBAC, bulk CSV account creation | Done — password-reset email **blocked on Workers Paid plan + verified domain** |
| 2 | Car & payment lifecycle, GREEN/RED, audit log | Done |
| 3 | Reminder engine (7/3/0-day, cron) | Done |
| 4 | Agreement generation (preview/PDF/confirm) | Done |
| 5 | Public website (landing, T&Cs, requirements, intake) | Done |
| 6 | Client portal (dashboard, documents, agreement) | Done |
| 7 | Dealer portal (stock, requests, assigned car) | Done — **no dealer-side payment/collection tracking** (scoped out, see plan.md Phase 7 note) |
| 8 | Mobile-responsive pass, PRD sign-off walkthrough | Done |

## Known gaps / deliberately not built

- **R2 not enabled** on the Cloudflare account — works today via `wrangler dev` local simulation only. Once enabled: `wrangler r2 bucket create dp-tour-travels-documents`, redeploy, no code change needed.
- **Email sending** needs Workers Paid plan + a verified sending domain. `forgot-password.tsx` calls it inside a try/catch so it fails quietly (`E_SENDER_NOT_VERIFIED`) rather than breaking the flow.
- **No `dealer_collections` table** — dealer-side money tracking (GREEN/RED for dealer payments) isn't built, even though the reminders code has a spot expecting it. Add as its own pass if needed.
- **No car→dealer assignment history** — `cars.dealerId`/lease dates are columns on `cars`, one active assignment per car. Reassigning overwrites the previous record; nothing preserves history.

## Local dev

```
cd app
npm install
npx wrangler dev
```

- First superadmin account: `node scripts/seed-superadmin.mjs <email> <name> [--remote]` (run from `app/`) — required because normal account creation itself requires being logged in as superadmin.
- D1 migrations: `./app/migrations` (via `migrations_dir` in `wrangler.jsonc`).
- Tests: `agreements.test.ts`, `payments.test.ts`, `reminders.test.ts` in `app/app/lib/`.

## Acceptance

PRD Sections 1–9 walked against the running code as the Phase 8 sign-off checklist (RBAC scoping, audit log on RED↔GREEN, reminder dedup, agreement PDF fields, mobile layout) — see plan.md Phase 8 note for the full walkthrough. No separate formal test-plan doc exists beyond the phase "Verify:" lines and the three test files above.
