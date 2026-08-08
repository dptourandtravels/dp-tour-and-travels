# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
npm run preview
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Database migrations

Schema lives in `app/db/schema.ts` (Drizzle ORM) and is applied to Cloudflare D1 via `wrangler d1 migrations`. Workflow:

1. Edit `app/db/schema.ts`.
2. `npm run db:generate` — diffs the schema and writes a new `migrations/000N_*.sql` file + updates `migrations/meta/_journal.json`.
3. `npm run db:migrate:local` — applies it to the local D1 used by `npm run dev`.
4. If local D1 ever gets into a conflicting state during development, `npm run db:reset:local` wipes and rebuilds it from the migration files, then reseeds it. This only deletes the local `.wrangler` state on disk — it never touches the remote/production database, so it's always safe to run.
5. Commit the generated migration file + journal update.
6. When ready to ship: `npm run ship` — runs `db:migrate:remote` (applies pending migrations to production D1) **then** `git push` (which triggers Cloudflare's build + deploy). Migrate-before-push is the safe order: Cloudflare's Git integration deploys code but never runs migrations, so pushing code that queries a not-yet-applied column would 500 every request. `npm run db:status` lists whether production has pending migrations.

## Local dev accounts

Local D1 starts empty. `npm run db:seed` (also run automatically by `db:reset:local`) inserts one loginable account per role plus sample cars/payments/requirements so every dashboard renders content. All four share the password `devpass123`:

- `superadmin@dev.local` → `/superadmin`
- `finance@dev.local` → `/finance`
- `client@dev.local` → `/client`
- `dealer@dev.local` → `/dealer`

The seed is idempotent (fixed IDs, delete-then-insert) and refuses `--remote`.

**Once real data exists in production**, avoid destructive migrations (dropping/renaming columns, rebuilding tables) — D1/SQLite's `ALTER TABLE` support is limited. Prefer additive changes (nullable new columns, new tables). A genuinely breaking change should ship as add-new-column → backfill → drop-old across separate deploys, not a single migration that requires a full rebuild.

---

Built with ❤️ using React Router.
