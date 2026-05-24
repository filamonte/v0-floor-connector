# Mobile Field Phase 3D Evidence Preview Signed URL Plan

Status: Planned
Doc Type: Design

## Purpose

Plan the next Mobile Field slice for contractor-only field evidence preview
using short-lived signed URLs. This is a planning document only. It does not
implement previews, signed URL helpers, thumbnails, delete/archive behavior,
storage policy changes, schema changes, migrations, portal sharing, AI,
notifications, or automation.

Phase 3D should let contractor users inspect evidence that Phase 3C already
uploads while preserving the private `documents` bucket boundary and keeping
customer/portal surfaces dark for internal field evidence.

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
- [docs/design/fieldtrail-phase-1-project-execution-timeline.md](C:/FloorConnector/docs/design/fieldtrail-phase-1-project-execution-timeline.md)
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md)
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)

## Files Inspected

- [apps/web/lib/execution-attachments/storage.ts](C:/FloorConnector/apps/web/lib/execution-attachments/storage.ts)
- [apps/web/lib/execution-attachments/storage.test.ts](C:/FloorConnector/apps/web/lib/execution-attachments/storage.test.ts)
- [apps/web/lib/execution-attachments/data.ts](C:/FloorConnector/apps/web/lib/execution-attachments/data.ts)
- [apps/web/lib/execution-attachments/schemas.ts](C:/FloorConnector/apps/web/lib/execution-attachments/schemas.ts)
- [apps/web/components/execution-attachment-form.tsx](C:/FloorConnector/apps/web/components/execution-attachment-form.tsx)
- [apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx](<C:/FloorConnector/apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx>)
- [apps/web/lib/fieldtrail/summary.ts](C:/FloorConnector/apps/web/lib/fieldtrail/summary.ts)
- [apps/web/lib/proofcenter/summary.ts](C:/FloorConnector/apps/web/lib/proofcenter/summary.ts)
- [apps/web/lib/closeouttrail/summary.ts](C:/FloorConnector/apps/web/lib/closeouttrail/summary.ts)
- [apps/web/lib/document-engine/print.ts](C:/FloorConnector/apps/web/lib/document-engine/print.ts)
- [apps/web/app/(app)/projects/[projectId]/page.tsx](<C:/FloorConnector/apps/web/app/(app)/projects/[projectId]/page.tsx>)
- [apps/web/app/(app)/projects/[projectId]/closeout-package/pdf/page.tsx](<C:/FloorConnector/apps/web/app/(app)/projects/[projectId]/closeout-package/pdf/page.tsx>)
- [apps/web/lib/estimates/data.ts](C:/FloorConnector/apps/web/lib/estimates/data.ts)
- [apps/web/lib/contracts/data.ts](C:/FloorConnector/apps/web/lib/contracts/data.ts)
- [apps/web/lib/catalogs/data.ts](C:/FloorConnector/apps/web/lib/catalogs/data.ts)
- [apps/web/lib/portal/data.ts](C:/FloorConnector/apps/web/lib/portal/data.ts)
- [packages/config/src/constants/platform.ts](C:/FloorConnector/packages/config/src/constants/platform.ts)
- [supabase/migrations/20260417200000_execution_attachments_foundation.sql](C:/FloorConnector/supabase/migrations/20260417200000_execution_attachments_foundation.sql)
- [supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql](C:/FloorConnector/supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql)

## Existing Uploaded Evidence Model

Phase 3C uses the existing `execution_attachments` table instead of creating a
new field evidence file model. Each record is tenant-scoped by `company_id`,
attached to either a `daily_log` or `field_note` subject, and stores
`attachment_type`, `storage_path`, `file_name`, `mime_type`, optional `caption`,
`uploaded_by`, and timestamps.

Uploads use the existing private `documents` bucket. The implemented storage
path helper generates paths from server-owned IDs:

```text
{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/{attachmentId}-{safeFileName}
{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/field-notes/{fieldNoteId}/{attachmentId}-{safeFileName}
```

Supported upload MIME types are:

- `image/jpeg`
- `image/png`
- `image/webp`
- `application/pdf`

The current file size limit is 10 MB. Image MIME types infer `photo`; PDF
infers `file`.

The current Daily Log detail UI can add a file and caption, then renders stored
evidence rows with file name, MIME type, attachment type, caption, date, and
contractor-facing stored-evidence status text. It intentionally does not show a
raw private storage path, signed URL, preview, thumbnail, delete/archive action,
or customer-facing link.

FieldTrail, Proof Center, CloseoutTrail, and the closeout package route consume
existing attachment metadata and counts. They do not embed private files.

## Signed URL Strategy

Phase 3D should add a contractor-only signed URL resolver that accepts an
attachment id, not a client-supplied storage path. The resolver should load the
attachment from `execution_attachments`, scope it to the active organization,
validate that the parent Daily Log or Job Note remains accessible to the active
contractor context, and only then call Supabase Storage against the private
`documents` bucket.

Existing repo patterns for estimates, contracts, catalog photos, and
portal-shared estimate attachments use `createSignedUrl(..., 60 * 60)` on the
private `documents` bucket after the relevant record access check. Phase 3D
should reuse that one-hour expiration unless a narrower user experience problem
appears during implementation.

Recommended first approach:

- Add a server-side execution attachment signed URL read helper.
- Resolve URLs during the Daily Log detail server render for the attachments
  already loaded on that page.
- Return URLs only for stored field evidence records in the private `documents`
  bucket.
- Keep externally referenced attachment rows on their existing reference-link
  behavior.
- Never persist signed URLs in the database.
- Never expose signed URLs to portal loaders or customer routes.
- Never accept or log a client-provided storage path.

If the current upload parent resolver is too mutation/readiness-gate oriented
for preview reads, extract a read-only parent scope validator that preserves
company, project, Daily Log, and Job Note access checks without changing upload
behavior.

## Preview UI Strategy

Initial Phase 3D preview should stay modest and read-only:

- Show image previews for `image/jpeg`, `image/png`, and `image/webp` when a
  signed URL is available.
- Show an `Open PDF` or `Open file` link for `application/pdf`.
- Keep file name, MIME type or friendly type, caption, and created date visible.
- Keep unsupported or externally referenced rows on a safe fallback state.
- Do not show raw `storage_path`.
- Do not generate thumbnails.
- Do not embed private evidence in FieldTrail, Proof Center, CloseoutTrail, the
  project closeout package, or portal pages in this slice.

The safest first UI target is the existing Daily Log detail Field Evidence
section because it already has the parent context, attachment list, and upload
form. Field Note evidence rows on the Daily Log detail can use the same
read-only preview mapping when attached to notes that belong to that Daily Log.

## Security Rules

- Contractor app only; portal/customer users cannot resolve field evidence
  signed URLs.
- Attachment access must be validated by active organization membership.
- The attachment parent must be a Daily Log or Job Note visible to the active
  contractor context.
- The resolver must derive `company_id`, parent IDs, and storage path from the
  database, not from client input.
- Signed URLs must point only to the private `documents` bucket.
- Public URLs remain disallowed.
- Signed URLs must not be stored in database rows, sent to provider APIs, or
  included in application logs.
- Portal project pages, portal shared documents, portal print routes, and
  customer timelines must not receive field evidence signed URLs.
- The contractor closeout package can continue counting field evidence but must
  not embed private images/files in Phase 3D.

## Performance And Expiration Decisions

Use 60-minute signed URLs for Phase 3D-A to match current repository patterns.
Resolve only the attachments already needed for the current Daily Log page
render, rather than pre-signing project-wide FieldTrail or Proof Center
evidence.

Signed URLs should be refreshed by reloading the contractor page. Do not store
URLs in `execution_attachments`, localStorage, or separate cache tables. If
future UX needs long-lived preview sessions, add a tiny resolver route or server
action later with the same attachment-id and parent-access validation.

## Delete And Archive Boundary

Delete/archive remains out of scope for Phase 3D. Future work should design
archive-first behavior before storage deletion because field evidence may
support proof, closeout readiness, warranty/service context, or dispute
history.

Future delete/archive planning should answer:

- whether contractor users archive metadata first and defer object deletion;
- whether storage deletion is allowed only for recently uploaded mistakes;
- how proof counts, FieldTrail history, and closeout artifacts represent
  archived evidence;
- what audit trail is required before any hard delete.

## Test Plan

Future Phase 3D implementation should add focused tests for:

- preview kind mapping from MIME type to image, PDF, or fallback;
- signed URL resolver refuses client-provided storage paths;
- wrong-company attachment access is denied;
- invalid or inaccessible Daily Log / Job Note parents are denied;
- externally referenced attachment rows do not attempt private bucket signing;
- unsupported MIME rows render a safe fallback;
- portal modules do not import or expose the field evidence resolver;
- Daily Log detail maps image/PDF preview state without showing raw
  `storage_path`.

If FieldTrail, Proof Center, or CloseoutTrail are touched later, tests should
confirm they continue to consume counts/metadata only.

## Future Implementation Slices

Recommended sequence:

1. **Phase 3D-A: Contractor Signed URL Preview Rows**
   Add a server-side execution attachment signed URL helper, render read-only
   image/PDF preview rows on Daily Log detail, and test access and MIME mapping.
2. **Phase 3D-B: Preview Polish**
   Improve image sizing, empty/error states, and mobile layout after the access
   boundary is proven.
3. **Phase 3D-C: Archive/Delete Design**
   Plan proof-aware archive/delete behavior before adding any destructive UI.
4. **Phase 3D-D: QA Checkpoint**
   Run static tests, protected contractor browser QA, mobile viewport checks,
   and portal-negative checks.

## What Is Intentionally Not Implemented Yet

- Signed URL helper or resolver
- Preview rows or image/PDF rendering
- Thumbnail generation
- Delete/archive behavior
- Storage policy changes
- Schema changes or migrations
- New buckets
- Portal/customer evidence sharing
- Closeout package private image/file embedding
- FieldTrail/Proof Center/CloseoutTrail preview panels
- Offline mode
- GPS/geofencing
- AI summaries
- Notifications or automation
