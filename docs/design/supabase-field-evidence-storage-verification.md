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

## 6. Storage Verification Result

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

Remote Supabase verification is blocked:

- No FloorConnector Supabase project was visible to the connector.
- Remote `storage.objects` schema visibility could not be checked.
- Remote migration application state could not be checked.
- Remote bucket existence, privacy, and policy state could not be checked.
- No real storage rows were queried and no signed URLs were generated.

## 7. Documents Bucket And Policy Confidence Level

Confidence from local source: **high**.

The repository has a clear private `documents` bucket migration, organization
first storage policies, server-owned field evidence paths, metadata-first
tenant scoping, and contractor-only signed URL resolution by attachment id.

Confidence in the current remote Supabase state: **not verified**.

The Supabase connector currently cannot see any projects, so the remote bucket,
policy, and migration state remain an owner/account-access verification item.

## 8. Gaps Or Owner Actions

- Owner must resolve Supabase project visibility for the intended
  FloorConnector project before remote storage readiness can be verified.
- After the project is visible, run a read-only follow-up that lists migrations
  and table/schema metadata for the selected project.
- Confirm the remote migration list includes
  `20260423201000_documents_bucket_and_storage_policies.sql`.
- Confirm the remote migration list includes
  `20260417200000_execution_attachments_foundation.sql`.
- If supported by the connector, confirm storage schema/table metadata is
  visible without reading `storage.objects` rows.
- Do not proceed to delete/archive behavior until remote bucket and policy
  posture is verified or the owner explicitly accepts the remote-unknown risk.

## 9. Behavior Intentionally Not Changed

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

## 10. Recommended Next Step

Keep Mobile Field paused on archive/delete. The next useful action is owner
access resolution for Supabase project visibility, followed by a second
read-only remote verification against the exact FloorConnector project. If the
project remains invisible, treat archive/delete and portal-adjacent field
evidence work as blocked by remote storage uncertainty.
