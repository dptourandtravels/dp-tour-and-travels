# System Design

Companion to [Architecture.md](./Architecture.md) (infra shape) and [PRD.md](./PRD.md) (requirements). This covers the core workflows and data model — how the pieces from the PRD actually get implemented.

## Entities (D1 tables, `app/app/db/schema.ts`)

| Table | Purpose |
|---|---|
| `users` | All four roles (`superadmin`, `finance`, `client`, `dealer`) in one table, `role` column |
| `sessions` | Cookie session store |
| `password_reset_tokens` | Self-service reset flow |
| `cars` | One row per car; `client_id` (owner), optional `dealer_id`/lease dates once assigned |
| `payments` | Payout schedule + status per car |
| `audit_log` | Generic before/after log, keyed by `entity_type`/`entity_id` |
| `notifications` | In-app inbox, typed (`reminder_7day`, `reminder_3day`, `reminder_due`, `payout_scheduled`, `agreement_issued`, `car_assigned`) |
| `agreements` | Generated agreement records (client or dealer, same shape) |
| `car_requirements` | Public demand catalogue ("need 50 Brezza") |
| `client_intake_applications` | Slot-booking submissions against a requirement |
| `dealer_applications` | "Apply for Dealer" submissions |
| `dealer_stock_requests` | Dealer requesting cars from stock |
| `documents` | Client document uploads, one row per (client, doc type), R2-backed |

## Workflow 1 — Car & payment lifecycle

1. Finance records `cars.receiptDate`.
2. Payout due date = `receiptDate + 70 days` (not stored — computed, see `app/app/lib/payments.ts`).
3. A `payments` row is created with `status = red` (outstanding) and the computed `dueDate`.
4. Finance flips a payment to `green` when paid; every flip writes an `audit_log` row (before/after status).
5. A RED payment can be marked GREEN retroactively at any time — no separate "reopen" step, it's the same status update.
6. Payout amount and dealer-collection amount are editable only by `finance`/`superadmin`; edits are also audited.

## Workflow 2 — Reminders

Cron (`0 2 * * *`) → `app/app/lib/reminders.server.ts` scans `payments.dueDate` for rows 7/3/0 days out, inserts one `notifications` row per (payment, milestone) if not already sent (`alreadySent` guard prevents duplicates on re-run). Covers both client payouts and dealer collections in the same scan.

## Workflow 3 — Agreement generation

Shared flow for both Client and Dealer agreements (`app/app/lib/agreements.server.ts`, route `agreements.new.tsx`):

1. Finance fills 5 fields: car description, registration number, owner name, Aadhaar UID, rate.
2. Server renders a preview; PDF is generated on demand via `pdf-lib` (`agreements.$id.download.tsx`).
3. "Confirm" persists the `agreements` row and inserts an `agreement_issued` notification for the party (`partyUserId`).

## Workflow 4 — Public intake → client account

1. Visitor picks a row in the public `car_requirements` table, submits name/phone/car details on `requirements.$id.apply.tsx`.
2. Accepting T&Cs is required before submit (`acceptedTermsAt` timestamp on the row).
3. On submit: a `users` row (role `client`) is auto-created, plus a `client_intake_applications` row linking to the requirement.
4. Superadmin reviews/contacts applicants from the dashboard; closes the `car_requirements` row (`status = closed`) once demand is filled — closed rows drop off the public list.

## Workflow 5 — Dealer stock request → assignment

1. Dealer submits a `dealer_stock_requests` row (make/model/qty) from their portal.
2. Superadmin/Finance assigns a car by setting `cars.dealerId` + `leaseStartDate`/`leaseEndDate` directly on the car row.
3. No assignment-history table — reassigning a car overwrites the previous dealer/lease values (flagged as a gap in plan.md Phase 7, not built since it wasn't requested).

## Document upload

Client uploads one file per `docType` (7 fixed types) → stored in R2, one `documents` row per (client, docType) enforced by a unique index — re-uploading a type replaces the row, not additive versioning.

## Auth & access control

Role check happens per top-level layout route (`client.tsx`, `dealer.tsx`, `finance.tsx`), not a central permissions table — matches the PRD's four fixed roles with no plan for a fifth. Superadmin implicitly has Finance's permissions by role-check design (see `auth.server.ts`), not a separate grant.
