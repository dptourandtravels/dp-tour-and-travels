# 02 — User Stories & Acceptance Criteria

Derived from [01-product-requirements.md](./01-product-requirements.md). Grouped by role; each story maps to the route(s) that implement it (see [03-information-architecture.md](./03-information-architecture.md)).

## Superadmin

**Create Admin/Finance accounts, individually or in bulk.**
- AC: creating a single account (`/superadmin/users/new`) requires email, name, role; password is auto-generated.
- AC: bulk CSV upload (`/superadmin/users/bulk`) creates one account per row with an auto-generated password each.
- AC: only `superadmin` can reach either route (enforced by `requireUser`).

**Manage requirement postings.**
- AC: creating a requirement (`/superadmin/requirements`) needs title, quantity; color/description optional.
- AC: closing a requirement (`intent=close`) removes it from the public catalogue immediately.

**Review intake & applications.**
- AC: every client intake submission and dealer application appears on the relevant superadmin list (`/superadmin/intake`, `/superadmin/dealer-applications`) for review/contact.

## Finance

**Log car receipt and track payout.**
- AC: submitting a new car (`/cars/new`) with `receiptDate` creates a `payments` row due at receipt date + 70 days, status `red`.
- AC: `finance`/`superadmin` can edit the payout amount (`intent=edit_amount`) before it's paid.

**Mark payments paid.**
- AC: `intent=mark_paid` with a `method` (cash/upi/bank_transfer/cheque) flips the payment to `green` and writes an audit_log row (before/after).
- AC: a `red` payment can be marked `green` at any later date — no separate "reopen" action needed.

**Generate agreements.**
- AC: `/agreements/new` requires carId, rate, aadhaarUid, and party (client/dealer); rate must be a positive number.
- AC: preview renders a downloadable PDF before commit; `intent=confirm` persists the agreement and notifies the recipient.
- AC: choosing `party=dealer` for a car with no assigned dealer returns an error, not a partial agreement.

**Assign a car to a dealer.**
- AC: `intent=assign_dealer` sets `dealerId`, `leaseStartDate`, `leaseEndDate` on the car; no history of the previous assignment is kept (known gap, see [09](./09-engineering-scope-definition.md)).

## Client

**View my cars and payment status.**
- AC: `/client` lists only cars where `clientId` matches the logged-in user.
- AC: each car shows registration date, payment status (GREEN/RED), and method once paid.

**Upload required documents.**
- AC: `/client/documents/:docType` accepts one file per fixed doc type (aadhaar, pan, dl, photo, rc, plate_photo, signed_agreement).
- AC: re-uploading a doc type replaces the existing file (unique index on client+docType), not an additional version.

**View/download my agreement.**
- AC: agreement PDF download is scoped to the logged-in client's own agreement only.

## Dealer

**View stock and request cars.**
- AC: `/dealer` submission requires carMake, carModel, quantity ≥ 1; saved as a `dealer_stock_requests` row tied to the dealer.

**View my assigned car.**
- AC: once `cars.dealerId` matches the logged-in dealer, lease dates and client (first-party) details are visible on their dashboard.

## Public visitor

**Apply for a car requirement (slot booking).**
- AC: `/requirements/:id/apply` requires name, email, phone, carMake, carModel, and `acceptTerms=on` — submitting without accepting terms is rejected.
- AC: on success, a `client` user is auto-created plus a `client_intake_applications` row.

**Apply to become a dealer.**
- AC: `/dealers/apply` shows eligibility requirements before the form; submission requires name, email, phone.
