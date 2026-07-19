# 09 — Engineering Scope Definition

What's in the MVP build, what's explicitly out, and the known gaps carried forward. Cross-check against [plan.md](../plan.md) phases and [MVP Tech Doc.md](../MVP%20Tech%20Doc.md) status table.

## In scope (built)

- Four-role auth (Superadmin/Finance/Client/Dealer), self-service password reset, bulk CSV account creation.
- Car & payment lifecycle: receipt date → +70-day payout → GREEN/RED status, editable amounts, audit log on every change.
- Daily cron reminders (7/3/0-day) for both client payouts and dealer collections.
- Agreement generation (shared client/dealer flow): fixed template, 5 fields, preview, PDF download, confirm + notify.
- Public site: landing page, T&Cs, live requirement catalogue, slot-booking intake (auto-creates client), dealer application page.
- Client portal: dashboard, 7-type document upload to R2, agreement view/download.
- Dealer portal: stock view, stock requests, assigned car + lease + client details, dealer agreement.
- Mobile-responsive public pages.

## Explicitly out of scope

- Email/SMS notifications beyond password-reset (in-app inbox is the only notification channel by design, per plan.md's stack table).
- A fifth role or a configurable permissions matrix — RBAC is four fixed roles with a hardcoded per-route allow-list, not an admin-editable permission system.
- Multi-tenancy — one company, one Worker, one D1 database.

## Known gaps (built differently than the ideal, tracked for follow-up)

| Gap | Why it's there | Where to pick it up |
|---|---|---|
| R2 not enabled on the Cloudflare account | Card not yet added to the account; binding is wired and works under `wrangler dev` simulation | `wrangler r2 bucket create dp-tour-travels-documents` once enabled, no code change |
| Password-reset email silently no-ops | Needs Workers Paid plan + verified sending domain | Remove the try/catch guard in `forgot-password.tsx` once upgraded |
| No `dealer_collections` table | Scoped out of Phase 7 — PRD's dealer-side money tracking wasn't built | New table + GREEN/RED wiring into `reminders.server.ts`'s `runDailyReminders` |
| No car→dealer assignment history | `cars.dealerId`/lease dates are plain columns, overwritten on reassignment | Add a history table only if audit of past assignments is actually needed |

## Definition of done (per plan.md)

Each phase's "Verify:" line was the acceptance bar — a single concrete check (e.g. "moving a payment RED→GREEN writes an audit_log row"), not a formal test-plan sign-off document. Phase 8 walked all of Sections 1–9 of the PRD against the running code as the final acceptance pass.
