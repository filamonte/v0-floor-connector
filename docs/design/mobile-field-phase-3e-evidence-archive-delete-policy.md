# Mobile Field Phase 3E Evidence Archive/Delete Policy

Status: Implemented
Doc Type: Design
Date: 2026-05-24

## Purpose

Define the archive/delete policy for contractor-side field evidence before any
implementation work begins.

This is a planning pass only. It does not implement archive/delete behavior,
change schema, add migrations, change storage policies, delete objects, add UI
controls, alter signed URL behavior, expose field evidence to portal/customer
users, add thumbnails, add AI summaries, or add notifications/automation.

The recommendation is metadata archive first, storage hard-delete later. In
contractor terms: hide bad or duplicate evidence without shredding the receipt.

## Phase 3E-A Implementation Note

Implemented on 2026-05-24 as metadata archive/restore only.

Implemented behavior:

- Added migration
  `20260524190000_execution_attachments_archive_metadata.sql`.
- Added `archived_at`, `archived_by`, `archive_reason`, `restored_at`,
  `restored_by`, and `restore_reason` metadata to `execution_attachments`.
- Default execution attachment list helpers exclude archived evidence.
- An explicit `includeArchived` option supports contractor-side archived review
  where needed.
- Daily Log detail shows active field evidence by default and shows archived
  evidence in a separate archived section with restore controls.
- Owner/admin/manager users can archive or restore evidence from Daily Log
  detail.
- Archived evidence is hidden from active FieldTrail / Proof Center /
  CloseoutTrail-style counts because shared list helpers are active-only by
  default.
- Signed URL creation remains attachment-id based and active-only by default.

Still not implemented:

- No storage object deletion.
- No storage policy changes.
- No hard-delete.
- No storage cleanup job.
- No portal/customer exposure.
- No thumbnails, AI summaries, notifications, automation, or provider behavior.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md](C:/FloorConnector/docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md)
- [docs/design/mobile-field-phase-3a-evidence-storage-readiness.md](C:/FloorConnector/docs/design/mobile-field-phase-3a-evidence-storage-readiness.md)
- [docs/design/mobile-field-phase-3c-evidence-upload-foundation.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-evidence-upload-foundation.md)
- [docs/design/mobile-field-phase-3c-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-qa-checkpoint.md)
- [docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md)
- [docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md)
- [docs/design/mobile-field-phase-3d-a-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-a-qa-checkpoint.md)
- [docs/design/supabase-field-evidence-storage-verification.md](C:/FloorConnector/docs/design/supabase-field-evidence-storage-verification.md)
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md)
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md)
- [docs/design/warranty-service-phase-1-workspace-depth.md](C:/FloorConnector/docs/design/warranty-service-phase-1-workspace-depth.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)

## Files Inspected

- [apps/web/lib/execution-attachments/storage.ts](C:/FloorConnector/apps/web/lib/execution-attachments/storage.ts)
- [apps/web/lib/execution-attachments/preview.ts](C:/FloorConnector/apps/web/lib/execution-attachments/preview.ts)
- [apps/web/lib/execution-attachments/data.ts](C:/FloorConnector/apps/web/lib/execution-attachments/data.ts)
- [apps/web/lib/execution-attachments/schemas.ts](C:/FloorConnector/apps/web/lib/execution-attachments/schemas.ts)
- [apps/web/lib/execution-attachments/storage.test.ts](C:/FloorConnector/apps/web/lib/execution-attachments/storage.test.ts)
- [apps/web/lib/execution-attachments/preview.test.ts](C:/FloorConnector/apps/web/lib/execution-attachments/preview.test.ts)
- [apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx](<C:/FloorConnector/apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx>)
- [apps/web/lib/fieldtrail/summary.ts](C:/FloorConnector/apps/web/lib/fieldtrail/summary.ts)
- [apps/web/lib/proofcenter/summary.ts](C:/FloorConnector/apps/web/lib/proofcenter/summary.ts)
- [apps/web/lib/closeouttrail/summary.ts](C:/FloorConnector/apps/web/lib/closeouttrail/summary.ts)
- [apps/web/lib/servicecenter/summary.ts](C:/FloorConnector/apps/web/lib/servicecenter/summary.ts)
- [apps/web/lib/document-engine/print.ts](C:/FloorConnector/apps/web/lib/document-engine/print.ts)
- [apps/web/lib/company-documents/data.ts](C:/FloorConnector/apps/web/lib/company-documents/data.ts)
- [apps/web/lib/company-documents/actions.ts](C:/FloorConnector/apps/web/lib/company-documents/actions.ts)
- [apps/web/lib/catalogs/data.ts](C:/FloorConnector/apps/web/lib/catalogs/data.ts)
- [apps/web/lib/estimates/data.ts](C:/FloorConnector/apps/web/lib/estimates/data.ts)
- [packages/types/src/index.ts](C:/FloorConnector/packages/types/src/index.ts)
- [supabase/migrations/20260417200000_execution_attachments_foundation.sql](C:/FloorConnector/supabase/migrations/20260417200000_execution_attachments_foundation.sql)
- [supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql](C:/FloorConnector/supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql)
- [supabase/migrations/20260523140000_company_documents_foundation.sql](C:/FloorConnector/supabase/migrations/20260523140000_company_documents_foundation.sql)
- [supabase/migrations/20260423223000_catalog_pricing_engine_foundation.sql](C:/FloorConnector/supabase/migrations/20260423223000_catalog_pricing_engine_foundation.sql)
- [supabase/migrations/20260423133000_estimate_workspace_foundation.sql](C:/FloorConnector/supabase/migrations/20260423133000_estimate_workspace_foundation.sql)

## Existing Attachment Lifecycle

Field evidence currently uses the existing `execution_attachments` table as
lightweight metadata for files attached to a `daily_log` or `field_note`.

Current upload behavior:

- Validates JPG, PNG, WebP, and PDF uploads at 10 MB or less.
- Generates storage paths under the private `documents` bucket:
  - `{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/{attachmentId}-{safeFileName}`
  - `{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/field-notes/{fieldNoteId}/{attachmentId}-{safeFileName}`
- Uploads the object first, then inserts the `execution_attachments` metadata
  row.
- Removes the uploaded object only as a best-effort rollback when metadata
  creation fails.
- Lists attachments by subject and renders them on Daily Log detail.
- Resolves one-hour signed URLs by attachment id after contractor-side parent
  validation.

Current schema shape:

- `execution_attachments` has `id`, `company_id`, `subject_type`,
  `subject_id`, `attachment_type`, `storage_path`, `file_name`, `mime_type`,
  `caption`, `uploaded_by`, `created_at`, and `updated_at`.
- There is no `archived_at`, `archived_by`, `deleted_at`, `deleted_by`,
  status, archive reason, deletion reason, or attachment event model.
- RLS exists for select/insert/update by active company membership. There is no
  delete policy on `execution_attachments`.

Related repo precedents:

- Company Documents uses `status = 'archived'` plus `archived_at` and
  manager-only update scope. Restore returns archived documents to draft. It
  stores metadata/content only and does not delete storage objects.
- Catalog item files support hard object deletion from the private `documents`
  bucket, but the code first verifies the file path starts with the expected
  organization/item prefix and clears the active photo pointer afterward.
- Estimate attachments can hard-delete metadata rows and later remove storage
  objects. That pattern is not the safest first model for field evidence because
  field evidence is proof/audit context tied to disputes, closeout, and
  warranty/service review.

## Archive vs Delete Recommendation

Phase 3E should separate "hide from normal evidence rows" from "delete the
storage object."

Recommended policy:

- Phase 3E-A: archive metadata only and leave the storage object untouched.
- Phase 3E-B: consider owner/admin permanent object deletion later, behind a
  stronger retention/audit policy and explicit confirmation.
- Phase 3E-C: consider a cleanup job only after retention windows, object
  lifecycle rules, and legal discovery expectations are defined.

Do not hard-delete storage objects in the first implementation slice. Field
evidence may become the practical proof for progress, damage disputes, customer
questions, warranty/service handoff, change-order support, or payment
follow-up. A duplicate or bad upload needs to disappear from normal contractor
workflows, but the system should not immediately destroy the underlying receipt.

The first implementation should therefore archive metadata and hide archived
items from default Daily Log rows, FieldTrail counts, Proof Center proof counts,
and CloseoutTrail readiness. It should preserve enough metadata to explain who
archived the item and when.

## Schema Implications

The current schema does not support archive/delete safely.

Phase 3E-A should include a future migration that adds archive metadata to
`execution_attachments`, likely:

- `archived_at timestamptz`
- `archived_by uuid references public.users(id) on delete set null`
- optional `archive_reason text`

Recommended indexes/checks:

- Add an index that keeps active subject reads efficient, such as
  `(company_id, subject_type, subject_id, created_at desc) where archived_at is null`,
  or update query planning based on measured usage.
- Keep restore simple by clearing `archived_at`, `archived_by`, and optional
  `archive_reason`.

Do not use hard delete or storage deletion to represent ordinary "remove this
from the row" behavior. Do not reuse `updated_at` alone as an archive signal. Do
not add a generic string status unless the team wants a broader future lifecycle
than archive/restore.

Permanent deletion, if approved later, should add separate metadata such as
`deleted_at`, `deleted_by`, and `delete_reason`, or move to a dedicated
lifecycle event model. It should not overload `archived_at`.

## Storage Cleanup Strategy

Recommended sequencing:

1. Phase 3E-A - Archive metadata only:
   - Update the `execution_attachments` row.
   - Leave `documents` bucket object in place.
   - Hide archived rows from default contractor evidence views and proof counts.
   - Do not sign archived evidence by default.

2. Phase 3E-B - Owner/admin hard-delete policy, if ever approved:
   - Require explicit owner/admin scope and a clear confirmation step.
   - Revalidate the Daily Log / Job Note parent chain.
   - Verify the storage path starts with the expected organization/project
     field-evidence prefix before calling storage remove.
   - Decide whether the metadata row remains as deleted evidence metadata or is
     hard-deleted after the object removal succeeds.
   - Record an audit/event entry before or during deletion.

3. Phase 3E-C - Cleanup job:
   - Only after retention windows are approved.
   - Never clean up active or merely archived evidence without a retention
     rule.
   - Emit reviewable logs/events and avoid deleting outside the field-evidence
     prefix.

The current `documents` bucket migration includes a storage object delete policy
for company members, but app-level field evidence behavior should be stricter
than broad membership. The application should gate permanent deletion to
owner/admin only if the later slice ever permits it.

## Permission Rules

Recommended Phase 3E-A permissions:

- Owner/admin/manager can archive field evidence.
- Owner/admin/manager can restore archived field evidence.
- Field users should not permanently delete evidence.
- Field users may get a later "request removal" or "archive my mistaken upload"
  path only if owner approves the operational risk.
- Portal/customer users must have no field evidence archive, restore, delete,
  preview, or raw path access.

Recommended later hard-delete permission:

- Owner/admin only.
- Manager delete should stay blocked unless owner explicitly approves it.
- The action should require confirmation copy that makes clear the object may
  no longer be recoverable.

The server boundary should enforce permission, organization scope, subject
scope, and parent Daily Log / Job Note validation. UI hiding is not sufficient.

## UI Rules

Phase 3E-A UI should stay modest:

- Add row-level contractor actions only after schema and server actions exist.
- Default evidence rows should show active evidence only.
- Archived evidence should be available only behind an explicit "show archived"
  or separate archived review section.
- Archived rows should display who archived them and when, when available.
- Restore should be explicit and should return the evidence to normal Daily Log
  / Job Note rows.
- Confirmation copy should use contractor language, for example:
  "Archive this evidence? It will be hidden from normal field evidence and proof
  counts, but the stored file will be kept for record review."
- Permanent delete copy, if later approved, should be separate:
  "Permanently delete this stored file? This cannot be used for normal proof
  review afterward."

UI must not show raw storage paths. Preview links should continue to be
generated by server action from attachment id only. Archived evidence should not
receive signed URLs from default rows.

## FieldTrail / Proof Center / CloseoutTrail Impact

Archived evidence should not count as active proof by default.

FieldTrail:

- Exclude archived evidence from default attachment counts and photo counts.
- Keep timeline note/daily log counts independent from archived evidence.
- If archived review is later added, make it separate from active proof counts.

Proof Center:

- Exclude archived evidence from active `evidenceItems`.
- Treat a project with only archived evidence as missing active field evidence.
- Do not expose archived field evidence to customer-facing or portal proof
  surfaces.

CloseoutTrail:

- Exclude archived evidence from closeout checklist satisfaction.
- A project with completed jobs and only archived field evidence should still
  need active field evidence review.
- Closeout packages should continue to avoid embedding private field evidence
  files unless a separate approved file-embedding slice exists.

Service Center / warranty context:

- Archived field evidence may be relevant for internal review, but should not
  count as active proof/context unless an archived-evidence review mode is
  explicitly added.
- Warranty/service workflows should continue to use Proof Center and
  CloseoutTrail context rather than owning field evidence directly.

Document Engine:

- No change in Phase 3E planning. Do not add field evidence files to print/PDF
  output as part of archive/delete policy.

## Audit/Event Needs

Archive and restore should eventually create a durable lifecycle signal.

Minimum Phase 3E-A audit shape:

- Store `archived_at` and `archived_by` on `execution_attachments`.
- Optionally store `archive_reason`.
- Restore clears archive fields and updates `updated_at`.

Future stronger model:

- Add an `execution_attachment_events` table or reuse a shared future evidence
  event model.
- Events could include `uploaded`, `archived`, `restored`,
  `delete_requested`, and `deleted`.
- Events should include `company_id`, `execution_attachment_id`, actor, event
  type, timestamp, and optional reason.

Do not add the event model in this planning pass. If hard-delete is ever
allowed, do not ship it without durable event/audit coverage.

## Test Plan

Future Phase 3E-A tests should cover:

- Archived Daily Log evidence is hidden from default Daily Log evidence rows.
- Archived Job Note evidence is hidden from default Job Note evidence rows.
- Archived evidence is excluded from FieldTrail attachment/photo counts.
- Archived evidence is excluded from Proof Center evidence counts.
- Archived evidence does not satisfy CloseoutTrail field evidence readiness.
- Restore returns evidence to default Daily Log / Job Note rows and counts.
- Archive and restore require owner/admin/manager scope.
- Field users cannot permanently delete evidence.
- Portal/customer routes still cannot list, preview, archive, restore, or delete
  field evidence.
- Signed URL creation refuses archived evidence by default.
- Storage `remove` is not called during metadata archive or restore.
- The storage path prefix guard exists before any later permanent delete call.

Validation for the planning pass itself is docs-only: focused Prettier and
`git diff --check`.

## Recommended Next Implementation Prompt

Title: `Mobile Field Phase 3E-A - Evidence Archive Metadata`

Prompt:

```text
Implement Mobile Field Phase 3E-A: contractor-side field evidence metadata
archive and restore.

This is not storage deletion. Do not hard-delete storage objects. Do not change
storage policies. Do not expose field evidence to portal/customer users. Do not
add thumbnails, AI summaries, notifications, automation, or closeout package
file embedding.

Add a migration for `execution_attachments` archive metadata, update generated
types as needed, add owner/admin/manager archive and restore server actions,
filter archived evidence from default Daily Log rows and active proof counts,
preserve contractor-only signed URL boundaries, and add focused tests proving
archived evidence is hidden from active rows/counts and does not call storage
delete.
```

## What Is Intentionally Not Implemented Yet

- No archive/delete app code.
- No schema or migration.
- No storage policy change.
- No storage object deletion.
- No signed URL behavior change.
- No UI controls.
- No portal/customer exposure.
- No thumbnails.
- No AI summaries.
- No notifications or automation.
- No event table.
- No cleanup job.
- No closeout package file embedding.
- No direct SQL inspection of the live `documents` bucket row or policy SQL.
