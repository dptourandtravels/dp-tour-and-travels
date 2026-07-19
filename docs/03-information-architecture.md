# 03 — Information Architecture

Route tree as defined in `app/app/routes.ts` (single React Router config, no separate API surface).

## Public (unauthenticated)

```
/                          home (landing: positioning, T&Cs, requirement catalogue)
/terms                     terms & conditions
/requirements/:id/apply    slot-booking intake form (→ auto-creates client account)
/dealers/apply             dealer eligibility + application form
/login                     sign in
/forgot-password           request reset link
/reset-password/:token     set new password
```

## Client portal (role: client)

```
/client                              dashboard: own cars, payment status
/client/documents/:docType           per-document upload (7 fixed types)
/agreements/:id/download             own agreement PDF
/notifications                       in-app inbox
/logout
```

## Dealer portal (role: dealer)

```
/dealer                    stock view + request form; assigned car + lease + client details
/agreements/:id/download   own agreement PDF
/notifications
/logout
```

## Finance portal (role: finance, + superadmin)

```
/finance                   finance landing
/cars                       car list, payment status, mark paid / edit amount / assign dealer
/cars/new                   register a new car (receipt date → auto payout schedule)
/agreements/new              agreement generation (preview → confirm)
/notifications
```

## Superadmin portal (role: superadmin)

```
/superadmin                          dashboard
/superadmin/users                    list + role/permission edits
/superadmin/users/new                create one account
/superadmin/users/bulk                CSV bulk create
/superadmin/requirements              post/close car requirements
/superadmin/intake                    review client intake applications
/superadmin/dealer-applications       review dealer applications
/superadmin/dealer-stock-requests     review dealer stock requests
```

## Navigation notes

- No shared nav shell across roles — each role has its own layout route (`client.tsx`, `dealer.tsx`, `finance.tsx`, `superadmin/layout.tsx`) that gates access via `requireUser(request, [roles])` and redirects otherwise.
- Superadmin implicitly reaches Finance-only actions where the route allows `["finance", "superadmin"]` — there's no separate Superadmin-only mirror of `/cars` or `/agreements/new`.
- `/notifications` is the single in-app inbox, shared route shape across all authenticated roles, scoped by `userId`.
