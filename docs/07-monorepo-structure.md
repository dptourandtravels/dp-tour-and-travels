# 07 — Repository Structure

Named "monorepo-structure" in the original doc-set template, but this isn't a monorepo — it's one deployable app in one Cloudflare Worker, no workspaces/packages split. Documenting the actual repo layout instead.

```
DP Tour and Travells/
├── PRD.md, plan.md                  — canonical requirements + build plan
├── Architecture.md, System Design.md, MVP Tech Doc.md   — root-level narrative docs
├── docs/                            — this numbered doc set
└── app/                             — the entire application
    ├── wrangler.jsonc                — Worker config: D1/R2/email bindings, cron trigger
    ├── workers/app.ts                — Worker entrypoint (React Router request handler + scheduled handler)
    ├── react-router.config.ts, vite.config.ts
    ├── drizzle.config.ts             — Drizzle Kit config for migrations
    ├── migrations/                   — D1 SQL migrations (0000–0008), applied via wrangler
    ├── scripts/seed-superadmin.mjs   — one-time bootstrap for the first superadmin account
    └── app/
        ├── routes.ts                 — route config (see docs/03-information-architecture.md)
        ├── routes/                   — one file per route, loader+action colocated with the page
        ├── db/schema.ts              — Drizzle table definitions (see docs/05-database-schema.md)
        ├── lib/                      — domain logic, one *.server.ts module per domain
        │   (auth, cars, payments, agreements, reminders, notifications, documents,
        │    requirements, dealer-stock, dealer-applications, intake, audit, crypto)
        ├── lib/*.test.ts             — node:test unit tests alongside the modules they cover
        ├── components/               — shared UI
        └── root.tsx, entry.server.tsx, app.css
```

## Why a single package, not a monorepo

- One deployable (one Worker), one team, no shared library consumed by a second app or service — a workspace split (Turborepo/pnpm workspaces/Nx) would add tooling with nothing to divide.
- React Router's loader/action model already colocates "frontend" and "API" per route; there's no separate backend package to split out.
- Revisit only if a second deployable appears (e.g., a separate mobile client or a second Worker) that needs to share `lib/` — until then, one `app/` package is the right size.
