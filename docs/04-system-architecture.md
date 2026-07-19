# 04 — System Architecture

Full detail lives in [Architecture.md](../Architecture.md) at the repo root — this is the pointer for the numbered doc set, plus the deployment view that file doesn't cover.

## Summary

Single Cloudflare Worker. React Router v7 (SSR) serves both the public site and all four role portals; the same loaders/actions that render pages also act as the API layer against D1 via Drizzle. One Cron Trigger runs the daily reminder scan. See [Architecture.md](../Architecture.md) for the request-flow diagram, auth mechanism, and storage breakdown.

## Deployment view

```
GitHub (main branch)
      │  push
      ▼
Cloudflare Workers Git integration  →  builds (react-router build) → deploys Worker
      │
      ▼
Worker "app"  ── D1 "dp-tour-travels-db"
              ── R2 "dp-tour-travels-documents"   (not yet enabled on account)
              ── send_email "EMAIL"                (needs Workers Paid plan + verified domain)
              ── Cron "0 2 * * *"
```

- No staging environment defined in `wrangler.jsonc` — one environment (production), migrations applied via `wrangler d1 migrations apply`.
- `compatibility_flags: ["nodejs_compat"]` is required for Drizzle/pdf-lib to run on Workers.
- Observability: `observability.enabled` + `upload_source_maps` on, giving Workers Logs/traces with readable stack traces — no separate APM.

## Environments & config

See [11-environment-and-devops.md](./11-environment-and-devops.md) for bindings, secrets, and local dev setup.
