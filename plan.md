# DP Tour and Travels — Build Plan

## Stack

| Layer | Choice |
|---|---|
| Domain/DNS/CDN | Cloudflare |
| Compute | Single Cloudflare Worker |
| Frontend | React Router v7 (Remix), SSR on Workers — public pages crawlable, portals behind login |
| Backend/API | Remix loaders/actions (no separate router — Cron's `scheduled` handler sits next to Remix's `fetch` export in the same Worker) |
| ORM | Drizzle (D1) |
| Database | Cloudflare D1 |
| File storage | Cloudflare R2 (documents, photos, agreement PDFs) |
| Auth | Custom session-cookie auth, role column in `users`, Web Crypto password hashing |
| PDF generation | pdf-lib |
| Reminders (7/3/0-day) | Cloudflare Cron Triggers |
| CSV bulk import | In-Worker parsing, no dependency |
| Notifications | In-app only (`notifications` table + inbox), no email/SMS |
| Transactional email | Cloudflare Email Sending (`env.EMAIL`), password-reset links only — everything else stays in-app per the row above |
| CI/CD | GitHub → Cloudflare Workers Git integration |

## Data model (tables)

`users`, `sessions`, `cars`, `car_requirements`, `dealer_applications`, `client_intake_applications`, `payments`, `dealer_collections`, `agreements`, `documents`, `dealer_stock_requests`, `notifications`, `audit_log`.

## Phases

### Phase 0 — Scaffold
- Repo + Wrangler config, D1 + R2 bindings, React Router on Workers boilerplate.
- Verify: `wrangler dev` serves the app, D1 + R2 bindings resolve.

> **TODO:** R2 not enabled on the Cloudflare account yet (needs a card added — dash.cloudflare.com → R2 → Enable). D1 is wired up. Once R2 is enabled, tell Claude to create the bucket and add the `r2_buckets` binding to `app/wrangler.jsonc`.

### Phase 1 — Auth & RBAC
- Superadmin/Finance/Client/Dealer login, self-service password reset.
- Superadmin: create Admin/Finance accounts individually + bulk via CSV (auto-generated passwords).
- Verify: each role logs in and sees only its own routes.

> **TODO:** Password reset emails need Workers Paid plan + a verified sending domain (`send_email` binding is wired in `app/wrangler.jsonc`, call is in `app/app/routes/forgot-password.tsx`, wrapped in try/catch so it fails quietly for now — `E_SENDER_NOT_VERIFIED`). Once you've upgraded and enabled Email Sending on your domain, tell Claude and the try/catch guard can come out.
>
> First superadmin login is bootstrapped via `node scripts/seed-superadmin.mjs <email> <name> [--remote]` (run from `app/`) — account creation itself requires being logged in as a superadmin, so this one-time script seeds the first account directly into D1.

### Phase 2 — Car & Payment Lifecycle
- Finance logs car receipt date; system computes payout due date (+70 days).
- Payout/collection amounts editable by Finance/Superadmin only.
- GREEN/RED status tracking, retroactive update when a RED payment is later collected.
- Audit log on all price edits and status changes.
- Verify: moving a payment RED→GREEN writes an audit_log row.

### Phase 3 — Notification & Reminder Engine
- Cron Trigger scans due dates daily, generates 7-day/3-day/due-date reminders for Finance (both client payouts and dealer collections).
- One-time notifications: payout scheduled, agreement issued.
- Verify: seed a payment due in 3 days, cron run produces exactly one reminder.

### Phase 4 — Agreement Generation Module
- Fixed template, Finance fills variable fields (car, rate, owner, reg. number, Aadhaar UID).
- Preview → PDF download → Confirm → client/dealer notification.
- Shared flow reused for both Client and Dealer agreements.
- Verify: generated PDF opens and matches the 5 fields.

### Phase 5 — Public Website
- Landing page (positioning copy, T&Cs, vehicle requirement catalogue).
- Apply for Dealer page (eligibility shown before form).
- Car requirement / slot booking flow: visitor submits details → accepts T&Cs → client account auto-created → appears on Superadmin dashboard.
- Superadmin manually closes fulfilled requirements.
- Verify: submitting a slot booking creates a client row and shows up for Superadmin to review. - Done

### Phase 6 — Client Portal
- Dashboard: registered cars, registration date, payment status/method.
- Document upload checklist (Aadhaar, PAN, DL, photo, RC, plate photo, signed agreement) to R2.
- Agreement view/download. - Done

> **TODO:** R2 still isn't enabled on the Cloudflare account (`r2_buckets` binding added to `app/wrangler.jsonc`, works today via `wrangler dev`'s local R2 simulation). Once R2 is enabled (dash.cloudflare.com → R2 → Enable), run `wrangler r2 bucket create dp-tour-travels-documents` and redeploy — no code changes needed.
>
> Added a `method` column to `payments` (cash/upi/bank_transfer/cheque) since the client dashboard needed to show it — Finance now picks a method when marking a payment paid (`app/app/routes/cars/list.tsx`).

### Phase 7 — Dealer Portal
- View current/upcoming stock, request cars (saved as demand record).
- Assigned car details: lease dates, first-party (client) details.
- Dealer agreement (same module as Phase 4). - Done

> **TODO:** Scoped to the three bullets above only — no `dealer_collections` table or dealer-side payment/collection tracking yet, even though it's in the data model list above and the Phase 3 reminders code has a TODO expecting it. Add that as its own pass (table + GREEN/RED status + wiring into `runDailyReminders` in `app/app/lib/reminders.server.ts`) if/when dealer money tracking is needed.
>
> Car→dealer assignment is columns on `cars` (`dealerId`, `leaseStartDate`, `leaseEndDate`) — one active assignment per car, no history table. Reassigning a car just overwrites these; nothing preserves the previous dealer/lease record.

### Phase 8 — Polish & Sign-off
- Mobile-responsive pass on public site. - Done
- Full PRD acceptance checklist (Sections 1-9) walkthrough. - Done

> No standalone PRD file exists in this repo, so the "Verify:" line under each phase above served as the acceptance checklist. Walked phases 1-7 against the code: RBAC (`requireUser` scoped correctly on every route, agreements/notifications row-scoped by `user.id`), audit log (RED↔GREEN and price edits logged in `cars.server.ts`), reminder cron (`reminders.test.ts` passes, dedup via `alreadySent`), agreement PDF (all 5 fields render, shared client/dealer flow), Phase 5-7 spot-checks (intake, document upload, dealer stock) — all confirmed working. Public site (`home`, `dealers.apply`, `requirements.$id.apply`, `terms`, `login`) already single-column/fluid Tailwind with no fixed widths — no mobile-responsive changes needed.
