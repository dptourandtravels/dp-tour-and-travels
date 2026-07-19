# 08 — Scoring Engine Spec

**N/A for this product.** Nothing in [PRD.md](../PRD.md) or [plan.md](../plan.md) describes a scoring, ranking, matching, or risk-model engine — DP Tour and Travels is a car-leasing/payment-lifecycle platform, not a product with an underwriting, credit, or recommendation component. This file is a placeholder so the doc-set numbering stays intact; no engine exists to spec.

## Closest analog in this codebase

The nearest thing to a "rules engine" is the deterministic payment-status logic in `app/app/lib/payments.ts` / `reminders.server.ts`:

- Payout due date = `receiptDate + 70 days` (fixed offset, not a formula with inputs/weights).
- Status is binary (`green`/`red`) based on whether payment was collected by the due date — a date comparison, not a score.
- Reminder cadence (7/3/0 days) is a fixed schedule, not a computed priority/urgency score.

None of these involve weighting, thresholds tuned against data, or multiple input factors — they're fixed business rules, which is why they're documented as workflows in [05-database-schema.md](./05-database-schema.md) and [System Design.md](../System%20Design.md) rather than as a scoring spec.

## If a real scoring need shows up later

Before building one: name the specific decision it should drive (e.g. "rank dealer applicants by risk," "prioritize which client to pay first when funds are short"), the inputs available, and who consumes the output — then this file is the place to spec it. Don't add a scoring engine speculatively; the PRD has no request for one.
