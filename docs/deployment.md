# Supabase and GitHub Deployment

## Local setup

1. Install Node.js 20 and run `npm ci`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase project settings. Never put a service-role key in this application.
3. The supplied database is assumed to exist already. Do not rerun schema SQL against that database as part of app deployment.
4. Run `npm run dev` and open the local URL printed by Next.js. If port 3000 is occupied, use the URL it prints or stop the existing dev server in its owning terminal.

## Supabase readiness blocker

The checked-in `supabase/schema.sql` policies grant anonymous reads on profiles, assets, lifecycle history, documents, condition logs, and storage objects. They also grant every authenticated user broad writes to application tables. In addition, this local SQL file does not contain the brief's claimed checks for valid stage transitions, one pending request, different requester/verifier, mandatory documents, or rejection remarks. It has only the profile-creation, history-verification stage update, and condition-log update triggers. The deployed Supabase project may differ; compare it with the checked-in file in the Dashboard before proceeding.

Middleware and hidden UI controls cannot secure direct Supabase API or Storage requests. Do not deploy real government records or files until the database policies and triggers have been reviewed and corrected by the database owner. The schema was intentionally not changed for this setup task.

Create staff accounts manually in Supabase Auth with email and password; there is no public registration flow. The profile trigger creates a profile. Assign the intended `role`, `scope_asset_type`, `scope_sector`, and `is_active` through the approved administrative process. Follow [Demo Account Setup](demo-accounts.md) for non-production identities, then confirm each role with separate accounts before onboarding real users.

## GitHub and deployment

The working copy's `origin` is configured as `https://github.com/BilvaVyas15/sampada.git`. The remote currently has no branches, and local changes have not been committed or pushed. After reviewing and committing the current worktree, push the branch:

```powershell
git push -u origin main
```

The repository's GitHub Actions workflow runs `npm ci`, TypeScript checking, and a production build for pushes to `main` and pull requests. Do not add `.env.local` or any service-role secret to GitHub.

For Vercel, import the GitHub repository, select the Next.js framework preset, and add the two public Supabase variables under Project Settings > Environment Variables for Preview and Production. Redeploy after changing environment variables. Enable Supabase Auth redirect URLs for the deployed app URL and local development URL.

## Current implementation status

The initial prototype contains mock-backed pages and legacy lifecycle fields that do not match the supplied schema. Authentication setup has been moved toward Supabase sessions and role-aware route gating, but the asset data layer and lifecycle workflow still need conversion to the exact schema before acceptance testing. The CI job intentionally checks type safety and the production build; the existing repository-wide lint baseline has pre-existing failures and should be cleaned up before adding lint as a required CI gate.