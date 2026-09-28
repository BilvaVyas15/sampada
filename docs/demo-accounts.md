# Demo Account Setup

The repository includes local-only demo credentials for development. They do not create Supabase Auth users, do not access Supabase data, and are rejected by production middleware. Do not use them with real records or expose a development server to the public internet.

## Local website demo

Run `npm run dev`, open the local `/login` page, and sign in with one of these accounts. The shared password is `SampadaDemo2026!`.

| Username/email | Demo role |
| --- | --- |
| `admin.demo@sampada.local` | Admin |
| `officer.demo@sampada.local` | Officer |
| `inspector.demo@sampada.local` | Inspector |
| `viewer.demo@sampada.local` | Viewer |

These identities use the existing mock data in browser-local storage. Creating/editing demo assets is local to that browser and will not persist to Supabase. The login page also has a Use account button for each role. This demo path is disabled when `NODE_ENV=production`.

## Real Supabase users

Real Auth accounts must be created manually in the Supabase Dashboard; no Supabase passwords or service-role key are stored in Git, seed SQL, or browser code.

## Create demo users

In Supabase Dashboard, open Authentication > Users > Add user. Create each account with an email in a domain you control, set a temporary password, and confirm the email for local testing. Replace the example `.test` addresses if the dashboard rejects that reserved domain. The `handle_new_user` trigger should create each `profiles` row.

Create five separate users so the maker-checker test uses different identities:

| Demo identity | Example email | Profile role | Scope | Purpose |
| --- | --- | --- | --- | --- |
| Sampada Demo Admin | `admin.demo@example.test` | `admin` | all types, all sectors | Administration and verification |
| Demo Officer A | `officer.a.demo@example.test` | `officer` | road, sector_21 | Submit lifecycle requests |
| Demo Officer B | `officer.b.demo@example.test` | `officer` | all types, all sectors | Verify Officer A's requests |
| Demo Inspector | `inspector.demo@example.test` | `inspector` | road, sector_21 | Record condition and request transitions |
| Demo Viewer | `viewer.demo@example.test` | `viewer` | building, sector_21 | Read-only access check |

Set roles/scopes after creating the users using the approved Supabase SQL Editor session:

```sql
update public.profiles set role = 'admin', scope_asset_type = 'all', scope_sector = 'all', is_active = true where email = 'admin.demo@example.test';
update public.profiles set role = 'officer', scope_asset_type = 'road', scope_sector = 'sector_21', is_active = true where email = 'officer.a.demo@example.test';
update public.profiles set role = 'officer', scope_asset_type = 'all', scope_sector = 'all', is_active = true where email = 'officer.b.demo@example.test';
update public.profiles set role = 'inspector', scope_asset_type = 'road', scope_sector = 'sector_21', is_active = true where email = 'inspector.demo@example.test';
update public.profiles set role = 'viewer', scope_asset_type = 'building', scope_sector = 'sector_21', is_active = true where email = 'viewer.demo@example.test';
```

Use the password set in Supabase Auth to sign in; these example addresses are not pre-created accounts. Never reuse these demo accounts or passwords in production.

## Seed data

Run [`../supabase/seed.sql`](../supabase/seed.sql) once in the Supabase SQL Editor after confirming the project schema. It inserts 14 demo assets and history rows only; it does not create Auth users or upload files. Some lifecycle examples therefore have no document objects and are for tracker/queue demonstration only.

## Acceptance walkthrough

1. Sign in as Officer A and submit a request on an in-scope asset.
2. Sign out, sign in as Officer B, and review the request; the requester must not approve their own row.
3. Sign in as the inspector and confirm stage requests are available but verification is not.
4. Sign in as the viewer and confirm no create, edit, verification, or condition controls are available.
5. Test inactive and missing-profile accounts; both must land on Access restricted.

The current supplied RLS policies do not enforce these scopes and capabilities at the database/storage layer, so this walkthrough is not a security certification. Do not put sensitive records or real credentials into this demo until RLS and Storage policies are corrected by the database owner.