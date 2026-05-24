# Mobile Field Phase 3A Evidence Storage Readiness

## Purpose

This audit decides whether FloorConnector is ready to implement future field
evidence upload for Daily Job Logs and Job Notes.

This is a planning/audit pass only. It does not implement upload behavior, add
storage buckets, add schema or migrations, change execution attachment behavior,
add file inputs, add signed URL helpers, expose field evidence to portal or
customer users, or add offline mode, GPS/geofencing, AI summaries,
notifications, or automation.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md`
- `docs/design/mobile-field-phase-2-quick-job-notes-evidence.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/warranty-service-phase-1-workspace-depth.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`

## Files Inspected

- `supabase/migrations/20260414143000_projects_foundation.sql`
- `supabase/migrations/20260414173000_jobs_foundation.sql`
- `supabase/migrations/20260417190000_daily_logs_foundation.sql`
- `supabase/migrations/20260417193000_field_notes_foundation.sql`
- `supabase/migrations/20260417200000_execution_attachments_foundation.sql`
- `supabase/migrations/20260423133000_estimate_workspace_foundation.sql`
- `supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql`
- `supabase/migrations/20260423213000_contract_sent_pdf_snapshot_fields.sql`
- `supabase/migrations/20260423223000_catalog_pricing_engine_foundation.sql`
- `apps/web/lib/execution-attachments/schemas.ts`
- `apps/web/lib/execution-attachments/data.ts`
- `apps/web/components/execution-attachment-form.tsx`
- `apps/web/lib/daily-logs/actions.ts`
- `apps/web/lib/fieldtrail/summary.ts`
- `apps/web/lib/proofcenter/summary.ts`
- `apps/web/lib/closeouttrail/summary.ts`
- `apps/web/lib/servicecenter/summary.ts`
- `apps/web/lib/document-engine/print.ts`
- `apps/web/lib/catalogs/data.ts`
- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/contracts/document-rendering.ts`
- `apps/web/lib/contracts/data.ts`
- `apps/web/lib/portal/data.ts`
- `packages/config/src/constants/platform.ts`
- `packages/types/src/index.ts`
- Portal project pages were inspected only for customer-boundary references.

## Current Storage Inventory

Implemented bucket:

- `documents`
  - Created by
    `supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql`.
  - Private bucket: `public = false`.
  - Storage policies allow authenticated active company members to select,
    insert, update, and delete objects when the first storage path folder is a
    UUID and `public.is_active_company_member(first_folder_uuid)` returns true.
  - The policy is organization-first path based. It does not know project,
    Daily Job Log, Job Note, portal grant, field permission, or proof-package
    intent by itself.

Configured bucket constants:

- `packages/config/src/constants/platform.ts` defines several names:
  `organization-assets`, `documents`, `project-files`, `job-photos`,
  `avatars`, `temp-uploads`, and `exports`.
- Only the `documents` bucket is backed by an inspected storage bucket migration
  in the current branch.

Existing upload helpers:

- Estimate attachments use server-side upload to
  `<organizationId>/estimates/<estimateId>/<timestamp>-<safeFileName>` in the
  `documents` bucket.
- Catalog item files use server-side upload to
  `<organizationId>/catalog-items/<catalogItemId>/<timestamp>-<safeFileName>`
  in the `documents` bucket.
- Contract send PDF snapshots upload to
  `<organizationId>/contracts/<contractId>/sent-contract.pdf` with `upsert:
true`.

Existing signed URL helpers:

- Estimate attachments resolve short-lived signed download URLs from the
  private `documents` bucket.
- Catalog item files list an organization/item prefix and resolve one-hour
  signed URLs.
- Contract sent PDF snapshots resolve a one-hour signed URL.
- Portal estimate attachments can resolve signed URLs for estimate attachments
  after portal project/record access is validated.

Existing delete helpers:

- Estimate attachment cleanup removes storage objects after metadata sync; the
  cleanup is best-effort because metadata is treated as authoritative.
- Catalog item delete validates the file path starts with the expected
  organization/catalog-item prefix before removing the storage object.

Readiness judgment:

- The `documents` bucket is the right starting bucket for field evidence because
  it is private, already organization-first, and already used for protected app
  file storage.
- Field evidence should use a dedicated `field-evidence` prefix inside
  `documents` before a separate bucket is considered. A new bucket is not needed
  for Phase 3C unless the owner wants materially different retention, scanning,
  lifecycle, or sharing rules.
- The bucket policy alone is not sufficient for field evidence because active
  membership is broader than the desired workflow checks. Field evidence upload,
  signed URL resolution, and deletion/archive must stay behind contractor-side
  server helpers that validate parent Daily Job Log or Job Note scope.

## Execution Attachment Readiness

Current model:

- `execution_attachments` is a lightweight metadata/reference table.
- `subject_type` is constrained to `daily_log` or `field_note`.
- `attachment_type` is constrained to `photo` or `file`.
- Fields are `company_id`, `subject_type`, `subject_id`, `attachment_type`,
  `storage_path`, `file_name`, `mime_type`, `caption`, `uploaded_by`,
  `created_at`, and `updated_at`.
- RLS allows active company members to select, insert, and update rows by
  `company_id`.

Tenant/project ownership enforcement:

- `createExecutionAttachment` uses the active organization from
  `requireDailyLogScope`.
- For `daily_log` subjects, the server loads the Daily Job Log, verifies the
  organization, and runs `assertProjectReadinessGate` on the Daily Log project.
- For `field_note` subjects, the server loads the Job Note, verifies the
  organization, and runs `assertProjectReadinessGate` on the Job Note project.
- List helpers scope reads by `company_id` plus subject type/id.

Current gaps:

- No storage upload is connected to `execution_attachments`.
- No server-generated field evidence storage path exists.
- No file size/type validation exists for execution attachment uploads.
- No `file_size_bytes` field exists on `execution_attachments`.
- No upload failure cleanup policy exists for execution attachments.
- No delete/archive behavior exists for execution attachments.
- No contractor-side signed URL resolver exists for execution attachments.
- No portal/customer visibility model exists for field evidence.
- No first-class evidence label field exists for before/after/damage/safety or
  closeout-proof semantics.

Metadata-only records are enough for the current implemented behavior, but not
enough for true upload readiness. They can support Phase 3C if upload creates a
private storage object first and then writes the current metadata row. Adding
`file_size_bytes`, label metadata, or archive status should be treated as an
explicit later schema decision rather than smuggled into upload work.

## Storage Path Strategy

Recommended Phase 3C path convention inside the existing private `documents`
bucket:

```text
{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/{attachmentId}-{safeFileName}
{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/field-notes/{fieldNoteId}/{attachmentId}-{safeFileName}
```

Rationale:

- The first segment remains the company UUID required by the current storage
  policies.
- Project context is visible in the path for operation/debugging and aligns
  evidence with the project-centered proof model.
- Daily Job Log remains the owner of field capture.
- Job Note evidence remains nested under its parent Daily Job Log, avoiding a
  standalone field-note file island.
- `attachmentId` in the object key gives the metadata row and storage object a
  durable join point without trusting user-provided names for uniqueness.
- `safeFileName` keeps the original name recognizable after sanitization.

Implementation rules for the later code slice:

- Generate `attachmentId` server-side before upload, or generate a stable object
  key and use the returned row id only after a cleanup-safe transaction plan is
  chosen.
- Sanitize file names with a shared helper similar to current estimate/catalog
  file sanitizers.
- Do not accept raw client-provided storage paths for real upload mode.
- Do not write outside the server-resolved organization/project/Daily Log/Job
  Note prefix.
- Store the resulting storage path in the existing `storage_path` column only
  after upload succeeds.

## Access And Security Strategy

Future upload/view rules:

- Contractor active organization members can upload/view only through
  contractor-side server helpers that validate the parent Daily Job Log or Job
  Note.
- Upload must validate organization, project, Daily Job Log, optional Job Note,
  optional job context, and project readiness.
- The storage object must live in the private `documents` bucket.
- Signed URLs must be generated only by server helpers after the same
  contractor-side parent validation.
- Portal users must not resolve, list, preview, download, or infer field
  evidence by default.
- Public URLs are not allowed.
- Client-provided paths are not trusted for upload, preview, signed URL, delete,
  or archive operations.
- Service role/provider behavior stays unchanged.

Recommended initial file restrictions:

- Allow common images: `image/jpeg`, `image/png`, `image/webp`, `image/heic`,
  and `image/heif` if browser/runtime support is acceptable.
- Allow common field files: `application/pdf`, `text/plain`, and CSV only if the
  use case is clear.
- Start with a conservative per-file size limit such as 10 MB for images and 15
  MB for PDFs/files unless product constraints require otherwise.
- Add a per-submit count limit such as 5 files for the first mobile upload
  slice.

Known limitation:

- The current repo does not show malware scanning, image moderation, EXIF
  stripping, content disarm, or virus scanning for uploaded files. Phase 3C
  should document that limitation in product/admin language and avoid
  customer-facing sharing until deeper file governance exists.

## Upload Flow Recommendation

Recommended next implementation slice: **Phase 3C - Evidence Upload Foundation**.

Phase 3B metadata-only hardening is optional and lower value unless crews need
better reference-only copy before real upload. The inspected storage patterns
are enough to proceed to a narrow upload foundation after this audit, as long as
Phase 3C keeps the first implementation server-owned and contractor-only.

Recommended Phase 3C flow:

1. Add a file input on Daily Job Log detail only, under the existing Field
   Evidence section.
2. Support Job Note evidence only where the current subject model already
   supports `field_note`.
3. Parse uploaded files in a server action.
4. Validate the subject via existing Daily Log / Job Note scope checks and
   `assertProjectReadinessGate`.
5. Validate file count, size, MIME type, and file name.
6. Generate a storage path server-side.
7. Upload to the private `documents` bucket with `upsert: false`.
8. Create the `execution_attachments` metadata row only after upload succeeds.
9. If metadata creation fails after upload, attempt best-effort storage cleanup
   and return a clear error.
10. Revalidate Daily Log, Project, and Job paths using the current action
    pattern.

Prefer server upload for the first slice because existing estimate, catalog, and
contract patterns already use server-side storage operations. Signed upload URLs
can be considered later if large-file UX or direct-to-storage progress becomes
important.

## Preview And Signed URL Plan

Phase 3C should add a contractor-only resolver that:

- Accepts an execution attachment id, not a raw storage path.
- Loads the attachment by `company_id`.
- Validates the parent Daily Job Log or Job Note again.
- Refuses external URLs for upload-created field evidence.
- Creates a short-lived signed URL from the private `documents` bucket.

Recommended expiry:

- Use one-hour signed URLs to match current estimate, catalog, contract, and
  portal estimate attachment patterns.

Preview behavior:

- Start with download/open links for contractor users.
- Add image thumbnails only after the resolver exists and route QA confirms no
  portal exposure.
- Do not generate signed URLs inside portal loaders for field evidence.
- Do not embed private images/files in the closeout package until customer-safe
  sharing and generated package policy are explicitly approved.

## Delete And Archive Policy

Current state:

- Execution attachments have no delete/archive behavior.
- Estimate attachments remove superseded storage objects after metadata sync,
  with best-effort cleanup.
- Catalog item delete checks the allowed prefix before object removal.

Recommendation:

- Do not add hard delete in the first upload foundation unless an owner-approved
  retention rule exists.
- Prefer an archive/status field in a later schema slice if field evidence may
  be used as proof.
- If hard delete is implemented later, it must validate parent scope, remove or
  mark metadata, and remove the storage object only when it is inside the
  expected server-generated field evidence prefix.
- For proof integrity, deleting storage while leaving active metadata is worse
  than refusing deletion. Archive-first is safer for early field proof.

Audit/proof implication:

- Field evidence can become closeout or service proof. Once uploaded, it should
  be treated as operational evidence, not casual scratch storage. Any delete
  action needs clear permissions, audit language, and recovery expectations.

## Test Plan

Future tests should cover:

- Storage path helper creates organization/project/Daily Log/Job Note-scoped
  paths.
- Storage path helper sanitizes file names and never trusts raw client paths.
- File validation accepts allowed image/file MIME types and rejects unsupported
  or oversized files.
- Upload action validates Daily Job Log organization/project readiness.
- Upload action validates Job Note organization/project/Daily Log ownership.
- Metadata is created only after upload succeeds.
- Upload cleanup attempts storage removal when metadata creation fails.
- Signed URL helper validates parent scope before resolving a URL.
- Signed URL helper refuses portal/customer contexts.
- Delete/archive helper, when implemented, refuses paths outside the expected
  prefix.
- FieldTrail counts update from created execution attachments.
- Proof Center field proof counts and Next Move update from created evidence.
- CloseoutTrail field evidence checklist updates from created evidence.
- Portal project loaders do not include execution attachments or field evidence
  signed URLs.
- Mobile Daily Log route smoke covers the evidence form once UI is added.

## Recommended Next Implementation Prompt

```text
Chat: Mobile Field Phase 3C - Evidence Upload Foundation

You are working in the FloorConnector repo.

Goal:
Implement the first contractor-only field evidence upload foundation for Daily
Job Logs and Job Notes using the existing private documents bucket and existing
execution_attachments metadata model.

Use:
- docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md
- docs/design/mobile-field-phase-3a-evidence-storage-readiness.md

Do not add storage buckets.
Do not expose field evidence to portal/customer users.
Do not add offline mode, GPS/geofencing, AI summaries, notifications, or
automation.
Do not add public URLs.
Do not add drag/drop upload.
Do not change Document Engine or closeout package output.

Implement the smallest production-correct upload slice:
- server-generated storage paths under the private documents bucket
- Daily Log / Job Note parent validation
- project readiness gate preservation
- file count/type/size validation
- server-side upload
- metadata row creation only after upload succeeds
- best-effort cleanup if metadata creation fails
- contractor-only signed URL resolver if previews/download links are included
- focused tests for pathing, validation, upload sequencing, and portal negative
  boundaries

Validation:
- focused tests for touched helpers
- typecheck/lint if app code is touched
- git diff --check
- git status --short --branch
```

## What Is Intentionally Not Changed

- No upload behavior was implemented.
- No storage bucket or storage policy was added.
- No schema or migration was added.
- No execution attachment behavior was changed.
- No file input was added.
- No signed URL helper or route was added.
- No portal/customer field evidence exposure was added.
- No offline mode, GPS/geofencing, AI summary, notification, or automation was
  added.
- No app, route, server action, auth, RLS, tenant logic, payment, signature,
  settings, platform-admin, provider, or Document Engine behavior changed.
