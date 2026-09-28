# Sampada (સંપદા)

Road & Building Asset Lifecycle Management for Gandhinagar district.

## Project status

This repository is an in-progress prototype, not a production-ready government system. The initial UI contains legacy mock-backed data paths and lifecycle fields that still need to be replaced with the supplied Supabase schema. Supabase email/password login, active-profile route checks, and role-aware navigation are being established. Public registration is disabled. Local demo credentials are development-only and do not authenticate to Supabase.

## Stack

- Next.js 15 App Router, React 19, strict TypeScript
- Tailwind CSS 4, Lucide icons, Recharts
- Supabase Auth, Postgres, and Storage through `@supabase/ssr`

## Local development

Requirements: Node.js 20 and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
# Set the Supabase URL and publishable key in .env.local
npm run dev
```

The app reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `.env.local` is ignored by Git. Never use a service-role key in client or server app configuration. For local UI access, use the demo accounts documented in [Demo Account Setup](docs/demo-accounts.md); they use browser-local sample data only.

The supplied Supabase database is assumed to exist; this project does not run schema SQL on startup. Review [deployment setup](docs/deployment.md) before connecting data or deploying. Demo identities and manual provisioning steps are in [Demo Account Setup](docs/demo-accounts.md); implementation gaps are tracked in the [Implementation Status report](docs/implementation-status.md).

The optional demo asset/history seed is [`supabase/seed.sql`](supabase/seed.sql). It does not create Auth users or upload documents. Review the schema security blocker before running it against any non-demo database.

## Verification commands

```powershell
npm run typecheck
npm run lint
npm run build
```

The current repository-wide lint baseline has errors in pre-existing prototype files. CI currently gates on typechecking and production builds; lint should be added after that baseline is repaired.

## Architecture

- `src/app/`: App Router pages
- `src/components/`: asset, lifecycle, dashboard, and layout UI
- `src/lib/supabase/`: browser and server Supabase clients
- `src/lib/data/`: legacy data service, pending migration to schema-aligned queries
- `supabase/schema.sql`: supplied database definition; it is not automatically applied
- `.github/workflows/ci.yml`: GitHub Actions checks for pull requests and `main`

## Security and release status

The supplied SQL currently grants anonymous reads and broad authenticated writes. This does not satisfy the required role, asset-scope, or private-document rules. Middleware and hidden UI controls cannot secure direct Supabase API/Storage access. Do not use real government data or deploy as a production system until database RLS and Storage policies are reviewed and fixed by the database owner. This repository intentionally leaves the database schema unchanged.

GitHub remote setup, Supabase account preparation, and Vercel environment configuration are documented in [docs/deployment.md](docs/deployment.md). The GitHub repository is configured as `origin`; local changes have not been committed or pushed yet.
