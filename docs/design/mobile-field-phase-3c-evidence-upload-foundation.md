# Mobile Field Phase 3C Evidence Upload Foundation

Status: Implemented
Doc Type: Implementation Note

## Purpose

Mobile Field Phase 3C adds the first contractor-side upload foundation for field
evidence on Daily Job Logs and Job Notes. The slice connects a normal file input
to the existing `execution_attachments` metadata model and the existing private
`documents` bucket.

This is intentionally narrow. It does not add a new document-management system,
new storage bucket, schema migration, public URL, portal/customer sharing,
preview/thumbnail behavior, delete/archive behavior, offline mode,
GPS/geofencing, AI summaries, notifications, automation, or provider behavior.

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
- `docs/design/mobile-field-phase-3a-evidence-storage-readiness.md`
- `docs/design/mobile-field-phase-2-quick-job-notes-evidence.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/warranty-service-phase-1-workspace-depth.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`

## Existing Data And Storage Used

Phase 3C reuses:

- Daily Job Logs
- Job Notes
- `execution_attachments`
- Project/job context already resolved by Daily Log and Job Note helpers
- the private Supabase `documents` bucket
- existing active organization scope and project readiness enforcement

No schema or migration was added. The current `execution_attachments` fields are
enough for this first slice: subject type/id, attachment type, storage path,
file name, MIME type, caption, uploader, and timestamps.

## Storage Path Strategy Implemented

Uploaded field evidence now uses server-generated paths inside the private
`documents` bucket:

```text
{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/{attachmentId}-{safeFileName}
{companyId}/projects/{projectId}/field-evidence/daily-logs/{dailyLogId}/field-notes/{fieldNoteId}/{attachmentId}-{safeFileName}
```

The path intentionally starts with the company UUID, not `companies/`, because
the existing `documents` storage policy validates active membership from the
first path segment. The server generates the attachment id and sanitized file
name; the client does not provide or control the storage path.

## File Validation Behavior

The upload helper accepts:

- `image/jpeg`
- `image/png`
- `image/webp`
- `application/pdf`

Files must have a name, must be non-empty, and must be 10 MB or smaller. Images
are stored as `photo` attachments; PDFs are stored as `file` attachments. User
errors stay field-friendly, such as asking the user to choose a JPG, PNG, WebP,
or PDF.

## Server Action Behavior

The Daily Log action now:

1. Reads the selected Daily Log or Job Note subject from the form.
2. Requires the existing authenticated active organization scope.
3. Validates the subject belongs to the active organization.
4. Preserves the existing project readiness gate before field evidence can be
   added.
5. Validates file name, MIME type, and size.
6. Generates the storage path server-side.
7. Uploads the file to the private `documents` bucket with `upsert: false`.
8. Creates the `execution_attachments` row only after upload succeeds.
9. Attempts best-effort storage cleanup if metadata creation fails.
10. Revalidates Daily Log, Project, and linked Job paths, then returns to the
    Daily Log `#field-evidence` section.

## UI Changes

`ExecutionAttachmentForm` now presents:

- one file input for field evidence
- one optional caption input
- guidance for JPG, PNG, WebP, or PDF files up to 10 MB
- private contractor-workspace copy

The form is still rendered only from Daily Log detail: directly under Field
Evidence for Daily Job Log evidence and under individual Job Notes for
note-specific evidence.

## Portal And Customer Boundary

Phase 3C remains contractor-only. It does not add portal loaders, portal signed
URLs, customer-facing download links, closeout-package image embedding, public
URLs, or customer-safe sharing rules.

Future customer sharing still requires a separate Customer Access design and
negative portal tests.

## Behavior Preserved

- Daily Log creation and editing behavior
- Job Note creation and editing behavior
- existing `execution_attachments` listing and counts
- FieldTrail, Proof Center, CloseoutTrail, and Service Center read models
- project readiness enforcement
- private `documents` bucket policies
- portal/customer boundaries
- payment, signature, estimate, invoice, settings, and platform-admin behavior

## What Is Intentionally Not Implemented Yet

- No new storage bucket.
- No schema migration.
- No upload progress.
- No drag/drop upload.
- No camera-specific API.
- No thumbnails or previews.
- No contractor-side signed URL resolver for field evidence.
- No delete/archive behavior.
- No file-size metadata field.
- No before/after/damage/safety/closeout-proof label field.
- No portal/customer field evidence visibility.
- No closeout package embedded images/files.
- No AI, automation, notifications, provider calls, GPS/geofencing, or offline
  queue.

## Follow-Up Candidates

Recommended next slice: **Mobile Field Phase 3D - Evidence Preview And Download
QA**.

That slice should add a contractor-only signed URL resolver by attachment id,
validate the parent Daily Log or Job Note before resolving URLs, add simple
download/open links for uploaded private objects, and include portal-negative
tests. Thumbnail previews and delete/archive should remain separate decisions.
