# 12 — Testing Strategy

## What exists today

Unit tests via Node's built-in `node:test`, run with `npm test` (→ `node --test app/**/*.test.ts`), colocated next to the module they cover:

| File | Covers |
|---|---|
| `app/app/lib/payments.test.ts` | `computeDueDate` (receipt + 70 days), `computeStatus` (green/red/paid-overdue) |
| `app/app/lib/reminders.test.ts` | `daysUntilDue` (calendar-day math, ignoring time-of-day), `reminderTypeForDaysUntilDue` (7/3/0-day threshold mapping, null off-threshold) |
| `app/app/lib/agreements.test.ts` | `renderAgreementPdf` produces a valid PDF containing all 5 required fields |

These are pure-function tests on the business-rule core (date math, status logic, PDF rendering) — no D1/R2 mocking, no route-level HTTP tests.

## What's not covered (and why that's an acceptable MVP tradeoff)

- **No route/integration tests** (loaders/actions, auth gating, form validation). Coverage instead comes from the phase-by-phase manual "Verify:" checks in [plan.md](../plan.md) and the Phase 8 full PRD walkthrough — acceptable for a single-team MVP without CI-blocking test infra, but the first thing to add if the team grows or regressions start slipping through.
- **No end-to-end/browser tests** — no Playwright/Cypress setup. Public-site and portal flows were verified manually per phase.
- **No load/performance testing** — not requested, and Workers' request-scoped model means this isn't a capacity-planning concern at MVP scale.

## Testing philosophy going forward

- Keep testing the deterministic core (date math, status transitions, PDF/CSV generation) as pure functions — cheapest tests, highest signal, no infra needed.
- Add a route-level test only when a bug actually escapes through the auth/validation layer — don't scaffold a full integration-test harness speculatively.
- The audit log (`audit_log` table) is the closest thing to a regression net for the payment lifecycle in production — it's what you'd check first if a GREEN/RED status looks wrong.

## Running tests

```
cd app
npm test
```
