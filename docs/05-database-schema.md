# 05 — Database Schema

Source of truth: `app/app/db/schema.ts` (Drizzle, target: Cloudflare D1 / SQLite). Migrations in `app/migrations/0000`–`0008`. This doc is a readable mirror of that file — if they disagree, the schema.ts + migrations are authoritative.

## Entity relationship overview

```
users ──< sessions
users ──< password_reset_tokens
users ──< cars (client_id)          users ──< cars (dealer_id, nullable)
cars ──< payments
cars ──< agreements                  users ──< agreements (party_user_id, issued_by_user_id)
users ──< notifications
users ──< documents
car_requirements ──< client_intake_applications ──> users (client_user_id)
users ──< dealer_stock_requests
dealer_applications (standalone — no FK to users; pre-account)
audit_log ──> users (actor_user_id, nullable)
```

## Tables

### `users`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| email | text | unique |
| name | text | |
| role | text enum | `superadmin \| finance \| client \| dealer` |
| password_hash | text | Web Crypto hash, not bcrypt |
| created_at | timestamp | |

### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | text PK | random hex, doubles as the cookie value |
| user_id | text FK → users | |
| expires_at | timestamp | 7-day TTL from creation |

### `password_reset_tokens`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| user_id | text FK → users | |
| token_hash | text | unique, hashed not raw |
| expires_at | timestamp | |
| used_at | timestamp, nullable | set on redemption, prevents reuse |

### `cars`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| client_id | text FK → users | owner |
| make, model | text | |
| registration_number | text | unique |
| receipt_date | timestamp | drives payout due-date calc (+70 days) |
| dealer_id | text FK → users, nullable | current assignment only, no history |
| lease_start_date, lease_end_date | timestamp, nullable | |
| created_at | timestamp | |

### `payments`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| car_id | text FK → cars | |
| amount | integer | editable by finance/superadmin only (app-level, not a DB constraint) |
| due_date | timestamp | receipt_date + 70 days |
| status | text enum | `green \| red` |
| method | text enum, nullable | `cash \| upi \| bank_transfer \| cheque`, set when marked paid |
| paid_at | timestamp, nullable | |
| created_at | timestamp | |

### `audit_log`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| entity_type, entity_id | text | generic pointer, no FK (polymorphic) |
| action | text | e.g. `status_change`, `amount_edit` |
| actor_user_id | text FK → users, nullable | |
| before_value, after_value | text, nullable | JSON-stringified snapshot |
| created_at | timestamp | |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| user_id | text FK → users | recipient |
| type | text enum | `reminder_7day \| reminder_3day \| reminder_due \| payout_scheduled \| agreement_issued \| car_assigned` |
| entity_type, entity_id | text | what the notification is about |
| message | text | |
| read_at | timestamp, nullable | |
| created_at | timestamp | |

### `agreements`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| car_id | text FK → cars | |
| party_user_id | text FK → users | recipient (client or dealer) |
| car_description, registration_number, owner_name, aadhaar_uid | text | the 5 PRD fields (rate is separate below) |
| rate | integer | |
| issued_by_user_id | text FK → users | Finance/Superadmin who confirmed it |
| created_at | timestamp | |

### `car_requirements`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| title, description, color | text | description/color nullable |
| quantity | integer, nullable | |
| status | text enum | `open \| closed` |
| created_at | timestamp | |
| closed_at | timestamp, nullable | |

### `client_intake_applications`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| car_requirement_id | text FK → car_requirements | |
| client_user_id | text FK → users | account auto-created on submit |
| name, email, phone, car_make, car_model, message | text | message nullable |
| accepted_terms_at | timestamp | required, not nullable — proof of T&C acceptance |
| created_at | timestamp | |

### `dealer_applications`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| name, email, phone, message | text | message nullable |
| created_at | timestamp | |

No `user_id` — these are pre-account leads reviewed manually by Superadmin, not auto-provisioned like client intake.

### `dealer_stock_requests`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| dealer_id | text FK → users | |
| car_make, car_model | text | |
| quantity | integer | default 1 |
| message | text, nullable | |
| status | text enum | reuses `carRequirementStatuses` (`open \| closed`) |
| created_at | timestamp | |

### `documents`
| Column | Type | Notes |
|---|---|---|
| id | text PK | |
| client_id | text FK → users | |
| doc_type | text enum | `aadhaar \| pan \| dl \| photo \| rc \| plate_photo \| signed_agreement` |
| file_name | text | |
| r2_key | text | pointer into R2 bucket `dp-tour-travels-documents` |
| uploaded_at | timestamp | |

Unique index `documents_client_doc_type_unique` on `(client_id, doc_type)` — one file per doc type per client; re-upload overwrites the row (app logic), not additive versioning.

## Deliberate non-features

- No soft-delete columns anywhere — deletes aren't part of any workflow in the PRD.
- No `dealer_collections` table yet (dealer-side payment tracking) — see [09-engineering-scope-definition.md](./09-engineering-scope-definition.md).
- No assignment-history table for `cars.dealer_id` — reassignment overwrites in place.
