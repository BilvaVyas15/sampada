# Supabase and GitHub Deployment

## Local setup

1. Install Node.js 20 and run `npm ci`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase project settings. Never put a service-role key in this application.
3. The supplied database is assumed to exist already. Do not rerun schema SQL against that database as part of app deployment.
4. Run `npm run dev` and open the local URL printed by Next.js. If port 3000 is occupied, use the URL it prints or stop the existing dev server in its owning terminal.

## Supabase readiness blocker

The checked-in `supabase/schema.sql` policies grant anonymous reads on profiles, assets, lifecycle history, documents, condition logs, and storage objects. They also grant every authenticated user broad writes to application tables. In addition, this SQL file does not contain the claimed checks for valid stage transitions, one pending request, different requester/verifier, mandatory documents, or rejection remarks. It has only the profile-creation, history-verification stage update, and condition-log update triggers. The deployed Supabase project may differ; compare it with the checked-in file in the Dashboard before proceeding.

Middleware and hidden UI controls cannot secure direct Supabase API or Storage requests. Do not deploy real government records or files until the database policies and triggers have been reviewed and corrected by the database owner.

Create staff accounts manually in Supabase Auth with email and password; there is no public registration flow. The profile trigger creates a profile. Assign the intended `role`, `scope_asset_type`, `scope_sector`, and `is_active` through the approved administrative process. Confirm each role with separate accounts before onboarding real users.

## GitHub and deployment

The working copy's `origin` is configured as `https://github.com/BilvaVyas15/sampada.git`. Push reviewed changes to the tracking branch:

```powershell
git push -u origin main
```

The repository's GitHub Actions workflow runs `npm ci`, TypeScript checking, and a production build for pushes to `main` and pull requests. Do not add `.env.local` or any service-role secret to GitHub.

For Vercel, import the GitHub repository, select the Next.js framework preset, and add the two public Supabase variables under Project Settings > Environment Variables for Preview and Production. Redeploy after changing environment variables. Enable Supabase Auth redirect URLs for the deployed app URL and local development URL.

## Current implementation status

The app uses Supabase Auth, profile lookup, and Supabase-backed data operations only. The broader lifecycle workflow and the checked-in database's permissive authorization policies remain release gates; confirm the deployed schema and RLS before using real records.