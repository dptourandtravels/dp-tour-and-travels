# Architecture

Single Cloudflare Worker, no separate backend service.

```
Browser
  │
  ▼
Cloudflare Worker (app/workers/app.ts)
  ├─ React Router v7 (SSR)     — app/app/routes/*  (public site + Superadmin/Finance/Client/Dealer portals)
  ├─ Cron Trigger "0 2 * * *"  — app/app/lib/reminders.server.ts (daily 7/3/0-day payment reminders)
  ├─ D1 binding "DB"           — app/app/db/schema.ts (Drizzle ORM)
  ├─ R2 binding "DOCUMENTS"    — client document/photo/agreement-PDF storage
  └─ send_email binding "EMAIL"— password-reset emails only
```

## Why one Worker

Routes, cron, and API logic live in the same deployable unit — no service-to-service calls, no separate REST API. React Router loaders/actions serve as the API layer directly against D1 via Drizzle.

## Request flow

1. Request hits the Worker → React Router matches a route in `app/app/routes/`.
2. Route `loader`/`action` calls `getSessionUser(request)` (`app/app/lib/auth.server.ts`) to resolve the session cookie → user → role.
3. Role gates access: `client.tsx`, `dealer.tsx`, `finance.tsx` are per-role layout routes that redirect unauthenticated/wrong-role users.
4. Data reads/writes go through `app/app/lib/*.server.ts` modules (one per domain: cars, payments, agreements, documents, notifications, requirements, dealer-stock, dealer-applications, intake, audit).
5. Every price edit and GREEN/RED status change writes an `audit_log` row (`app/app/lib/audit.server.ts`).

## Auth

- Custom cookie session (`HttpOnly; SameSite=Lax`), 7-day TTL, session id stored in D1 `sessions` table — no third-party auth provider.
- Passwords hashed with Web Crypto (`app/app/lib/crypto.ts`), not bcrypt/argon2 (no native crypto deps on Workers).
- Role is a column on `users` (`superadmin | finance | client | dealer`), checked per-route, not a separate permissions table.

## Storage

- **D1** — all relational data (users, cars, payments, agreements, notifications, audit log, requirements, applications). See schema in `app/app/db/schema.ts`.
- **R2** — uploaded documents (Aadhaar, PAN, DL, photo, RC, plate photo) and generated agreement PDFs, keyed by `r2Key` on the `documents` table.
- No queue, no KV, no separate cache layer — traffic volume doesn't justify one.

## Background jobs

One Cron Trigger, once daily (`0 2 * * *`), scans `payments` for due dates 7/3/0 days out and inserts `notifications` rows (deduped via `alreadySent` check in `reminders.server.ts`). No job queue — this is the only scheduled job in the system.

## Known infra gaps (see plan.md for detail)

- R2 not yet enabled on the Cloudflare account (works via `wrangler dev` local simulation; needs `wrangler r2 bucket create` once enabled).
- Email sending needs Workers Paid plan + verified domain; the `forgot-password` route currently fails silently (try/catch) without it.
