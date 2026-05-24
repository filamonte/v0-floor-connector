# Supabase Field Evidence Storage Verification

Status: Verification
Doc Type: Readiness

## 1. Purpose

This read-only verification checks whether FloorConnector field evidence can
continue to rely on the private Supabase `documents` bucket, storage policies,
and `execution_attachments` boundaries before any archive/delete or
portal-adjacent work is planned.

This pass did not create buckets, change storage policies, run migrations,
execute SQL, upload files, delete files, generate signed URLs against real data,
or change app code, auth/RLS, tenant logic, portal grants, payments,
signatures, settings, provider behavior, or platform-admin behavior.

## 2. Repo Status

Starting status:

```text
## main...origin/main [ahead 1]
d3dc06e6 chore: checkpoint field evidence preview QA
```

The checkpoint commit was pushed successfully:

```text
To https://github.com/filamonte/v0-floor-connector.git
   057dbef3..d3dc06e6  main -> main
```

Post-push status:

```text
## main...origin/main
```

Recent history included:

```text
d3dc06e6 chore: checkpoint field evidence preview QA
057dbef3 feat: add field evidence preview links
e0538cd1 docs: plan field evidence preview flow
4723e64f chore: checkpoint Mobile Field evidence upload QA
935e016e feat: add field evidence upload foundation
```

## 3. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/design/mobile-field-phase-3a-evidence-storage-readiness.md`
- `docs/design/mobile-field-phase-3c-evidence-upload-foundation.md`
- `docs/design/mobile-field-phase-3c-qa-checkpoint.md`
- `docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md`
- `docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md`
- `docs/design/mobile-field-phase-3d-a-qa-checkpoint.md`
- `docs/staging-owner-runbook.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/local-auth-qa-recovery.md`

## 4. Local Code Inspected

- `apps/web/lib/execution-attachments/storage.ts`
- `apps/web/lib/execution-attachments/preview.ts`
- `apps/web/lib/execution-attachments/data.ts`
- `apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx`
- `supabase/migrations/20260417200000_execution_attachments_foundation.sql`
- `supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql`

Supporting searches confirmed no later migration modifies
`execution_attachments` and no later migration modifies the `documents` bucket
or its storage object policies.

## 5. Supabase Organizations And Projects Discovered

Read-only Supabase connector discovery found one visible organization:

```text
FloorConnectoor (cvkfudwshnfsftnnwrro)
```

Project listing returned no visible projects:

```text
projects: []
```

Because no project was visible, this pass did not inspect remote tables,
remote migrations, storage schema metadata, storage objects, bucket rows, logs,
advisors, branches, edge functions, or project settings.

Follow-up remote-only CLI verification later confirmed local CLI visibility for
the app env target without starting local Supabase or mutating remote state:

```text
NEXT_PUBLIC_SUPABASE_URL ref: jcnoraopbwdhshcmplgb
supabase projects list: FloorConnector (jcnoraopbwdhshcmplgb)
CLI org: FloorConnectorPro
Supabase connector projects: []
```

This resolves CLI project visibility for the env target, but it does not verify
remote bucket, policy, migration, storage schema, table data, auth settings, or
RLS posture.

## 6. May 24, 2026 Connector Rerun

Status: **connector-visible project verified; remote storage readiness now
strong enough for archive/delete planning design, not implementation**.

Required repo alignment was completed before the rerun:

```text
## main...origin/main [ahead 1]
d91b4827 docs: verify field evidence storage readiness
```

The ahead commit was pushed:

```text
To https://github.com/filamonte/v0-floor-connector.git
   d3dc06e6..d91b4827  main -> main
```

Post-push status was aligned with `origin/main`, with only local documentation
edits present for this rerun:

```text
## main...origin/main
 M docs/chat-handoff.md
 M docs/design/supabase-field-evidence-storage-verification.md
 M docs/staging-owner-runbook.md
```

Read-only Supabase connector discovery found one organization:

```text
FloorConnectorPro (vercel_icfg_bPg9w8wtRL2GkQoymZwJdDIk)
```

It found one project, which is an unambiguous FloorConnector match:

```text
FloorConnector
ref: jcnoraopbwdhshcmplgb
organization: FloorConnectorPro
region: us-east-1
status: ACTIVE_HEALTHY
database: PostgreSQL 17.6.1.104
created_at: 2026-04-08T19:39:13.039191Z
```

The selected project matches the project ref previously observed from the local
app env target and local Supabase CLI visibility check.

Read-only migration listing for `jcnoraopbwdhshcmplgb` confirmed the remote
project includes the two field-evidence-critical migrations:

```text
20260417200000 execution_attachments_foundation
20260423201000 documents_bucket_and_storage_policies
```

The visible remote migration list also reaches the current local latest
migration:

```text
20260523140000 company_documents_foundation
```

No obvious migration drift was found from the visible migration list for field
evidence storage readiness.

Read-only public table listing confirmed:

```text
public.execution_attachments
rls_enabled: true
rows: 0
```

Read-only storage schema table listing confirmed storage metadata visibility:

```text
storage.objects
storage.buckets
storage.migrations
storage.s3_multipart_uploads
storage.s3_multipart_uploads_parts
storage.buckets_analytics
storage.buckets_vectors
storage.vector_indexes
```

The connector table listing did not inspect bucket rows, storage object rows,
storage policies, real files, signed URLs, auth settings, provider settings, or
RLS policy SQL. It used only metadata/listing connector calls.

Remote warning surfaced by the connector:

- The public schema table listing returned a Supabase advisory that 8 public
  schema tables have RLS disabled:
  `role_permissions`, `platform_catalog_system_components`,
  `platform_workflow_defaults`, `platform_catalog_item_seeds`,
  `platform_user_roles`, `platform_financial_defaults`, `subscription_plans`,
  and `permissions`.
- This warning is not specific to field evidence storage and this rerun did not
  change it. It should remain an owner/security review item before broader
  staging confidence is claimed.

## 7. Storage Verification Result

Local repo verification is positive:

- The `documents` bucket migration creates or updates a private bucket with
  `public = false`.
- `storage.objects` policies for `documents` allow authenticated select,
  insert, update, and delete only when the first storage path segment is a UUID
  and `public.is_active_company_member(first_folder_uuid)` passes.
- Field evidence upload uses the existing `documents` bucket, not a new bucket.
- Field evidence storage paths are server-generated under:

```text
{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/{attachmentId}-{safeFileName}
{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/field-notes/{fieldNoteId}/{attachmentId}-{safeFileName}
```

- Upload accepts only JPG, PNG, WebP, and PDF files up to 10 MB.
- Upload writes the storage object before creating the
  `execution_attachments` metadata row and attempts best-effort cleanup if
  metadata creation fails.
- Signed preview links are resolved by execution attachment id, not by a
  client-provided path.
- Signed preview URLs use the private `documents` bucket and a one-hour expiry.
- Preview signing refuses external references and non-field-evidence paths.
- Daily Log / Job Note parent access is revalidated before preview signing.
- Daily Log UI renders open actions without exposing raw private storage paths.
- Portal loaders and portal routes do not resolve field evidence signed URLs.
- FieldTrail, Proof Center, CloseoutTrail, and the closeout package continue to
  consume metadata/counts only, not private file contents.

Remote Supabase storage verification is now partially confirmed through
connector metadata:

- The intended FloorConnector project is visible to the Supabase connector.
- The selected project ref is `jcnoraopbwdhshcmplgb`.
- The remote migration list includes the `documents` bucket and storage policy
  migration.
- The remote migration list includes the `execution_attachments` foundation
  migration.
- `public.execution_attachments` exists remotely and has RLS enabled.
- The `storage` schema is visible and includes `storage.objects`,
  `storage.buckets`, and `storage.migrations`.
- Bucket row state, storage object policy SQL, and bucket privacy were not
  directly inspected because this pass did not execute SQL or read storage
  object/bucket rows.
- No real storage rows were queried and no signed URLs were generated.

## 8. Documents Bucket And Policy Confidence Level

Confidence from local source: **high**.

The repository has a clear private `documents` bucket migration, organization
first storage policies, server-owned field evidence paths, metadata-first
tenant scoping, and contractor-only signed URL resolution by attachment id.

Confidence in the current remote Supabase state: **moderate**.

The app env, local CLI, and Supabase connector now point to and can see project
`jcnoraopbwdhshcmplgb`. The connector confirms the relevant migrations and
schema/table visibility. Because no SQL was executed, this pass still does not
directly prove the current `documents` bucket row has `public = false` or that
the live storage policy definitions exactly match the migration text.

## 9. Gaps Or Owner Actions

- Owner should treat project visibility for `jcnoraopbwdhshcmplgb` as resolved
  for connector-based metadata checks.
- Before any archive/delete implementation, decide whether migration-list proof
  is enough or whether the owner wants a separately approved read-only SQL pass
  to inspect `storage.buckets` and `pg_policies` for the live `documents`
  bucket and storage policies.
- Review the connector advisory about 8 public schema tables with RLS disabled
  before broad staging or security readiness is claimed.
- Keep archive/delete as a planning/design task until retention, audit, and
  proof-integrity behavior are explicitly approved.

## 10. Behavior Intentionally Not Changed

- No Supabase writes.
- No buckets created.
- No storage policies changed.
- No migrations run.
- No mutating SQL executed.
- No storage rows fetched.
- No files uploaded or deleted.
- No signed URLs generated against real data.
- No app code changed.
- No auth/RLS, tenant logic, portal grants, payments, signatures, settings,
  provider behavior, or platform-admin behavior changed.

## 11. Recommended Next Step

It is reasonable to proceed to **archive/delete planning** for field evidence,
with one boundary: do not implement destructive behavior until the owner accepts
the migration-list/table-metadata confidence level or approves a separate
read-only SQL inspection of the live `documents` bucket row and storage policy
definitions. Portal/customer field evidence exposure remains out of scope.
