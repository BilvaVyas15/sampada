# Implementation Status

Status report for the current branch. `Complete` means implemented and checked in this repository; `Partial` means a working foundation exists but the acceptance workflow is incomplete; `Blocked` means a stated database/security prerequisite conflicts with the supplied files.

| Head | Status | Current state / remaining work |
| --- | --- | --- |
| Framework and deployment | Partial | Next 15.5, strict TypeScript, CI build/typecheck, env example, and GitHub/Vercel setup notes are present. `origin` is configured, but the local worktree is not yet committed or pushed. |
| Supabase session entry | Partial | Publishable-key clients, email/password login, active-profile middleware, and admin/officer create/edit route gates are present. Role accounts still must be created manually in Supabase Auth. |
| Stakeholder identities | Partial | Local demo credentials are removed. Staff Auth accounts and active profiles must be provisioned manually in Supabase. |
| Asset inventory persistence | Partial | Asset data operations now query/write Supabase schema columns only; validate them against the deployed project and complete the broader acceptance workflow. |
| Lifecycle tracker and request wizard | Partial | Canonical 11-stage transition constants exist; detail UI, document-upload sequence, and trigger-aligned writes are not complete. |
| Verification queue / maker-checker | Not complete | No `/verifications` implementation yet. |
| Notifications | Blocked | No notification table/provider is in the supplied schema; persistent stakeholder delivery needs an approved storage/event design and notification channel. |
| Financials, documents, conditions, activity | Not complete | Prototype components exist but are not wired to the supplied schema and private storage paths. |
| Admin user/stage-document pages | Not complete | Routes and update workflows have not been implemented. |
| Database authorization | Blocked | Supplied `supabase/schema.sql` grants anonymous reads and broad authenticated writes, and is missing several claimed lifecycle/document verification guards. This contradicts role/scope/private-file requirements. The schema was not modified. |
| Demo seed | Partial | `supabase/seed.sql` adds 14 schema-shaped assets and sample history; no storage files are seeded. Validate it against the target project before running. |

## Stakeholder notification split

Notifications are not implemented because the supplied schema has no notification table, delivery queue, or configured mail/SMS provider. Once an approved persistence/channel design exists, use these event recipients:

| Event | Recipients | Required content |
| --- | --- | --- |
| Stage request submitted | In-scope admin/officer verifiers, excluding the requester | Asset code, from/to stages, requester, submitted time, document readiness |
| Request verified or rejected | Original requester | Decision, verifier, timestamp, remarks or rejection reason |
| Condition recorded as Poor/Critical | Assigned officer and in-scope admin/officers | Asset, sector, condition, inspector remarks, detail link |
| Account deactivated or profile missing | System administrator through an approved operations channel | User email, denial reason, timestamp |

Keep the verification queue as the authoritative work list. Any email notification is a signal to review the queue, not the verification record itself; never include private document contents in notification messages.

## Required gates before real deployment

1. Have the database owner reconcile the actual deployed schema with `supabase/schema.sql` and enforce role, scope, maker-checker, document, and private-storage policies in Postgres/Storage.
2. Complete and test lifecycle/status mapping and mutations against the deployed tables.
3. Complete and test request/document upload, verification, condition, and role-specific pages using separate Auth users.
4. Configure Supabase Auth redirect URLs and deployment environment variables; commit and push to the configured GitHub `origin` after reviewing the worktree.
5. Clear the existing repository-wide lint failures before requiring lint in CI.