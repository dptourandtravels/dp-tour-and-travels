# 06 — API Contracts

There is no separate REST/JSON API. Every route in `app/app/routes/` exports a `loader` (GET, reads) and/or `action` (POST, writes) per React Router v7 convention — that pair *is* the API contract for that URL. Forms post `application/x-www-form-urlencoded` or `multipart/form-data`; multi-purpose routes multiplex on a hidden `intent` field. All contracts below are enforced server-side by `requireUser(request, [roles])`.

## Auth

| Route | Method | Body | Response |
|---|---|---|---|
| `/login` | POST | `email`, `password` | 401 `{error}` on failure; else `Set-Cookie` + redirect to role dashboard |
| `/logout` | POST | — | clears session cookie, redirect to `/login` |
| `/forgot-password` | POST | `email` | sends reset link (best-effort — silently no-ops if email isn't configured) |
| `/reset-password/:token` | POST | `password` | consumes token (`used_at`), sets new password hash |

## Cars & payments (`finance`, `superadmin`)

**`POST /cars/new`**
Body: `clientEmail`, `clientName`, `make`, `model`, `registrationNumber`, `receiptDate`, `amount`
Effect: creates/reuses the client user, inserts `cars` row, inserts first `payments` row due at `receiptDate + 70d`.

**`POST /cars` (list route, intent-based)**
| intent | Fields | Effect |
|---|---|---|
| `mark_paid` | `paymentId`, `method` | status → `green`, `method` + `paidAt` set, audit_log row |
| `edit_amount` | `paymentId`, `amount` | updates `payments.amount`, audit_log row (before/after) |
| `assign_dealer` | `carId`, `dealerId`, `leaseStartDate`, `leaseEndDate` | sets dealer + lease columns on `cars` |

## Agreements (`finance`, `superadmin`)

**`POST /agreements/new`**
Body: `intent` (`preview` default or `confirm`), `carId`, `rate`, `aadhaarUid`, `party` (`client`|`dealer`)
- 400 if `carId`/`rate`/`aadhaarUid` missing or rate ≤ 0.
- 400 if car not found, or `party=dealer` with no dealer assigned to that car.
- `preview` (default): returns `{ preview: { carId, party, fields, pdfBase64 } }` — no DB write.
- `confirm`: persists `agreements` row, inserts `agreement_issued` notification, returns `{ confirmed: true }`.

**`GET /agreements/:id/download`** — streams the agreement PDF; scoped to the logged-in party or Finance/Superadmin.

## Superadmin

| Route | Method | Body | Effect |
|---|---|---|---|
| `/superadmin/users/new` | POST | `email`, `name`, `role` | creates account, auto-generated password |
| `/superadmin/users/bulk` | POST | `csv` (file) | one account per CSV row, auto-generated passwords |
| `/superadmin/users` | POST | `userId`, `role` | updates a user's role |
| `/superadmin/requirements` | POST | `intent` (`close` or create), `title`, `description`, `color`, `quantity` / `id` | creates or closes a `car_requirements` row |
| `/superadmin/intake` | GET | — | lists client intake applications |
| `/superadmin/dealer-applications` | GET | — | lists dealer applications |
| `/superadmin/dealer-stock-requests` | GET | — | lists dealer stock requests |

## Client (`client`)

| Route | Method | Body | Effect |
|---|---|---|---|
| `/client` | GET | — | own cars + payment status |
| `/client/documents/:docType` | POST | `docType`, `file` | uploads to R2, upserts `documents` row (unique per client+docType) |

## Dealer (`dealer`)

| Route | Method | Body | Effect |
|---|---|---|---|
| `/dealer` | GET | — | stock view + assigned car/lease/client details |
| `/dealer` | POST | `carMake`, `carModel`, `quantity`, `message` | inserts `dealer_stock_requests` row |

## Public

| Route | Method | Body | Effect |
|---|---|---|---|
| `/requirements/:id/apply` | POST | `name`, `email`, `phone`, `carMake`, `carModel`, `message`, `acceptTerms` | rejects if `acceptTerms` isn't `"on"`; else auto-creates `client` user + `client_intake_applications` row |
| `/dealers/apply` | POST | `name`, `email`, `phone`, `message` | inserts `dealer_applications` row |

## Conventions

- Success shapes are route-specific plain objects (`data({...})`), not a wrapped envelope like `{data, error}` uniformly — check the individual route for its return shape.
- Validation errors return `data({ error: "..." }, { status: 400 })`; auth failures redirect (via `requireUser` throwing a `redirect`), not JSON 401/403, except `/login` which returns 401 inline for the form to render.
- No API versioning — this is server-rendered form/loader traffic, not a public/external API surface.
