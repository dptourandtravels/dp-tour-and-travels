# 01 — Product Requirements

Condensed from the canonical, signed-off [PRD.md](../PRD.md) — that file is the source of truth for client sign-off; this is the working-reference version for the numbered doc set.

## Problem

DP Tour and Travels runs a car-leasing model between two external parties, brokered by the company:

- **Clients** supply brand-new cars.
- **Dealers** receive those cars for operational use.

The company manages the financial relationship, legal agreements, documentation, and scheduling between both sides for a fixed 5-year term per car.

## Key business rules

- Only brand-new cars, max ~1,500–2,000 km odometer, white-plate/private only, no GPS devices.
- Client is responsible only for insurance during the term; company covers maintenance, servicing, driver, fuel, challans.
- Slot must be booked before physical car delivery — undelivered without a slot is rejected.
- First month's payment retained as a security deposit.
- Client's first payout releases at receipt date + 70 days (2 months + 10 days).
- Missing an installment during the term blacklists the client.

## Roles

| Role | Summary |
|---|---|
| Superadmin | Full RBAC control, all Finance permissions, closes fulfilled requirements, reviews dealer applicants |
| Finance | Records receipt dates, edits payout/collection amounts, processes payments, generates agreements, receives reminders |
| Client | Views own car(s) + payment status, uploads documents, views/downloads agreement |
| Dealer | Views/requests stock, views assigned car + client details, views/downloads own agreement |

## Core modules

1. Car & payment lifecycle (receipt → 70-day payout → GREEN/RED status)
2. Notification system (7/3/0-day Finance reminders, client payout/agreement notices)
3. Agreement generation (shared client/dealer template → preview → PDF → confirm)
4. Public website (landing, T&Cs, live requirement catalogue, dealer application)
5. Client portal, Dealer portal

## Out of scope (not requested)

- Email/SMS notifications beyond password reset (in-app inbox only).
- Multi-currency, multi-country, or non-INR pricing.
- A fifth role or configurable/custom RBAC beyond the four fixed roles.

Full requirement text, field-level detail, and client acceptance/sign-off table: **[PRD.md](../PRD.md)**.
