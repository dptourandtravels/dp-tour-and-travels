# 10 — Development Phases

Restated from [plan.md](../plan.md) — that file has the full per-phase notes/TODOs; this is the phase-status table for the doc set.

| Phase | Scope | Verify | Status |
|---|---|---|---|
| 0 | Repo scaffold, Wrangler, D1 + R2 bindings, React Router on Workers | `wrangler dev` serves the app, bindings resolve | Done — R2 binding wired, account not yet enabled |
| 1 | Auth & RBAC, self-service reset, bulk CSV account creation | Each role logs in and sees only its own routes | Done — reset email blocked on Workers Paid plan |
| 2 | Car & payment lifecycle, GREEN/RED, audit log | RED→GREEN write produces an audit_log row | Done |
| 3 | Notification & reminder engine (cron, 7/3/0-day) | Payment due in 3 days → cron produces exactly one reminder | Done |
| 4 | Agreement generation (template, preview, PDF, confirm) | Generated PDF opens and matches the 5 fields | Done |
| 5 | Public website (landing, T&Cs, catalogue, intake, dealer apply) | Slot booking creates a client row visible to Superadmin | Done |
| 6 | Client portal (dashboard, document upload, agreement) | — | Done |
| 7 | Dealer portal (stock, requests, assigned car, agreement) | — | Done — dealer money tracking scoped out (see [09](./09-engineering-scope-definition.md)) |
| 8 | Polish & sign-off (mobile-responsive, PRD walkthrough) | Full Sections 1–9 walkthrough | Done |

## Sequencing notes

- Phases were built in order 0→8; each phase's routes/lib modules depend only on earlier phases (e.g. Phase 4 agreements depend on Phase 2's `cars`/`payments`, not on Phase 6/7 portals).
- No phase was partially shipped — each is marked Done in plan.md with its own "Verify:" check, not carried over half-finished.
- Any further phase (e.g. dealer collections, R2 go-live, email go-live) is additive on top of this list, not a rework of it.
