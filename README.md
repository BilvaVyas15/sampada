# Sampada (સંપદા)

Road & Building Asset Lifecycle Management for Gandhinagar district.

## Project status

All application authentication and asset data use Supabase. There are no local demo accounts or browser-backed asset stores. Staff accounts must be created in Supabase Auth and have an active `profiles` row.

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

The app requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `.env.local` is ignored by Git. Never use a service-role key in client or server app configuration. If either variable is missing or invalid, the app displays a configuration page naming it.

The Supabase database is expected to exist already; the application does not run schema SQL on startup. Current limitations and database security gates are tracked in the [Implementation Status report](docs/implementation-status.md).

The optional asset/history seed is [`supabase/seed.sql`](supabase/seed.sql). It does not create Auth users or upload documents. Review the database security notes before running it; execute it yourself in the Supabase SQL Editor.

## Verification commands

```powershell
npm run typecheck
npm run lint
npm run build
```

CI checks type safety and production builds. Run lint locally with `npm run lint`.

## Architecture

- `src/app/`: App Router pages
- `src/components/`: asset, lifecycle, dashboard, and layout UI
- `src/lib/supabase/`: browser and server Supabase clients
- `src/lib/data/`: Supabase-backed asset and profile queries/mutations
- `supabase/schema.sql`: database definition; it is not automatically applied
- `.github/workflows/ci.yml`: GitHub Actions checks for pull requests and `main`

## Security and release status

The supplied SQL currently grants anonymous reads and broad authenticated writes. This does not satisfy the required role, asset-scope, or private-document rules. Middleware and hidden UI controls cannot secure direct Supabase API/Storage access. Do not use real government data or deploy as a production system until database RLS and Storage policies are reviewed and fixed by the database owner. This repository intentionally leaves the database schema unchanged.

GitHub remote setup, Supabase account preparation, and Vercel environment configuration are documented in [docs/deployment.md](docs/deployment.md). The GitHub repository is configured as `origin`.

## Deployment

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` for local use, or in Vercel Project Settings > Environment Variables for Preview and Production. Never configure a service-role key in the app.
2. In Supabase Authentication > URL Configuration, set the deployed Vercel URL as Site URL and add local and deployed callback URLs (for example `http://localhost:3000/**` and `https://YOUR-APP.vercel.app/**`) to Redirect URLs.
3. Import `BilvaVyas15/sampada` into Vercel, keep the Next.js preset and default build command, configure the two variables, then deploy the `main` branch.
4. Post-deploy checklist: open `/api/health` and confirm `{ "ok": true }`; sign in with an Auth user whose profile is active; confirm a missing/inactive profile is signed out; verify scoped inventory; create/update only an authorized test asset; upload and preview a private test file; confirm direct out-of-scope database/storage requests are denied by RLS.

See [deployment details](docs/deployment.md) for the database security release gate. The checked-in schema currently has permissive policies, so do not use real records until the database owner confirms effective RLS and Storage policies.
