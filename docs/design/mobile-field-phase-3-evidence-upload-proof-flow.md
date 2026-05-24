# Mobile Field Phase 3 Evidence Upload And Proof Flow

## Purpose

This planning pass defines the safest future path for mobile field evidence
upload and proof flow. It is intentionally documentation-only: no upload
behavior, storage bucket, schema, migration, route, server action, auth, RLS,
tenant logic, portal exposure, notification, automation, or provider behavior
was changed.

Phase 3 should keep field evidence anchored to the existing operating core:
Daily Job Logs, Job Notes, execution attachments, FieldTrail, Proof Center,
CloseoutTrail, Service Center, and Document Engine. It should not create a
detached file manager, dispatch subsystem, customer sharing lane, or local-only
field capture model.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md`
- `docs/design/mobile-field-phase-1-qa-checkpoint.md`
- `docs/design/mobile-field-phase-2-quick-job-notes-evidence.md`
- `docs/design/mobile-field-phase-2-qa-checkpoint.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/warranty-service-phase-1-workspace-depth.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Files Inspected

- `apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx`
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/components/execution-attachment-form.tsx`
- `apps/web/components/field-note-form.tsx`
- `apps/web/lib/execution-attachments/schemas.ts`
- `apps/web/lib/execution-attachments/data.ts`
- `apps/web/lib/daily-logs/actions.ts`
- `apps/web/lib/daily-logs/schemas.ts`
- `apps/web/lib/field-notes/schemas.ts`
- `apps/web/lib/field-notes/data.ts`
- `apps/web/lib/fieldtrail/summary.ts`
- `apps/web/lib/proofcenter/summary.ts`
- `apps/web/lib/closeouttrail/summary.ts`
- `apps/web/lib/servicecenter/summary.ts`
- `apps/web/lib/document-engine/print.ts`
- `packages/config/src/constants/platform.ts`
- `apps/web/lib/catalogs/data.ts`
- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/portal/data.ts`
- `supabase/migrations/20260417190000_daily_logs_foundation.sql`
- `supabase/migrations/20260417193000_field_notes_foundation.sql`
- `supabase/migrations/20260417200000_execution_attachments_foundation.sql`
- `supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql`
- Portal project pages were inspected only as boundary references.

## Existing Execution Attachment Model

`execution_attachments` is the current canonical lightweight field attachment
linkage. It is deliberately narrower than a full managed file subsystem.

Current parent model:

- `subject_type` is constrained to `daily_log` or `field_note`.
- `subject_id` points to the selected Daily Job Log or Job Note.
- There is no direct project, job, customer, invoice, portal, or document-engine
  parent in this slice.
- Server-side validation resolves the parent record, checks organization scope,
  and keeps project readiness gates authoritative before insert.

Current fields:

- `company_id`
- `subject_type`
- `subject_id`
- `attachment_type`: `photo` or `file`
- `storage_path`
- `file_name`
- `mime_type`
- `caption`
- `uploaded_by`
- `created_at`
- `updated_at`

Current scoping:

- Daily Logs are organization-scoped, project-rooted records with optional job
  context and one canonical log per project/date.
- Job Notes are organization-scoped, Daily Job Log-owned records with project,
  optional job/person/time-card context, and internal-only visibility.
- Execution attachments inherit their usable scope from the selected Daily Job
  Log or Job Note and carry the same `company_id`.

Current UI behavior:

- Daily Log detail renders a `Job Notes` section and a `Field Evidence` section.
- Job Notes can display evidence attached to individual `field_note` subjects.
- Field Evidence can display evidence attached directly to the `daily_log`
  subject.
- `ExecutionAttachmentForm` is metadata/reference-only. It collects attachment
  type, file name, MIME type, storage path, and caption. It does not render a
  file input and does not upload bytes.
- Daily Log and Job Workspaces route users to the existing Daily Log anchors for
  Job Notes and field evidence.

Current limitations:

- There is no field evidence upload helper.
- There is no field evidence file picker, camera capture, progress state,
  thumbnail generation, or private download URL resolver.
- `attachment_type` supports only broad `photo` and `file`; it does not encode
  before/after/damage/safety/closeout labels.
- `storage_path` is required but is currently a lightweight reference, not proof
  that a managed field-evidence object exists.
- There is no delete/archive behavior specific to execution attachments.
- RLS grants are active-member scoped; the server layer must continue to enforce
  tighter field workflow, project, and readiness constraints.

## Evidence Capture Scope

Phase 3 should include:

- Mobile-friendly evidence add flow under Daily Job Log detail.
- Optional evidence attached to Job Notes because the current subject model
  already supports `field_note`.
- Evidence capture that reuses Daily Log, Job Note, project, job, and
  organization context.
- Evidence notes/captions.
- Existing metadata reuse for file name, MIME type, storage path, attachment
  type, uploaded user, and timestamps.
- User-facing evidence labels for:
  - photo
  - file
  - before photo
  - after photo
  - damage/issue
  - safety
  - closeout proof

The label model needs a deliberate implementation choice. The current database
enum only supports `photo` and `file`; before/after/damage/safety/closeout proof
should either be captured as future metadata or temporarily represented through
caption/note context only after an explicit design decision. Phase 3 should not
silently overload `attachment_type`.

Phase 3 should not include:

- Offline queue
- Camera capture APIs beyond normal browser file input
- Photo markup or annotation
- AI analysis, AI summaries, or image classification
- Customer sharing
- Public links
- GPS, geotagging, or geofencing
- Background upload
- Notifications or automation
- A new document management system
- Portal/customer exposure of internal field evidence

## Storage Strategy

The repo has a private Supabase `documents` bucket with organization-first
pathing and active-member storage policies. Existing estimate/catalog flows use
that bucket with server-side upload and short-lived signed URL patterns.

That is useful evidence, but it is not enough to treat field evidence upload as
ready. `execution_attachments` currently stores a `storage_path` reference and
does not own upload, signed URL, retention, delete/archive, preview, or file-size
rules. Field evidence also has stronger privacy and portal-boundary concerns
than generic internal references.

Recommended strategy: run **Mobile Field Phase 3A - Evidence Storage Readiness
Audit** before implementation.

The audit should decide:

- Whether field evidence reuses the existing private `documents` bucket or needs
  a more specific bucket later.
- The exact organization-first storage path convention, likely under
  `<company_id>/field-evidence/daily-logs/<daily_log_id>/...` or an equivalent
  project/daily-log-rooted path.
- Whether paths must include project/job/date context for operability without
  weakening tenant isolation.
- File type and size limits for photos and documents.
- Signed URL creation rules, expiry, and where URLs may be resolved.
- Delete/archive behavior and whether removing metadata also removes storage
  objects.
- How portal loaders are prevented from resolving or exposing internal evidence
  objects.

Do not implement storage until this audit is complete.

## Security And Access Rules

Future implementation should preserve these rules:

- Contractor organization members with appropriate field permissions can upload
  and view field evidence.
- Upload must require a valid organization, Daily Job Log or Job Note parent,
  project scope, and readiness gate.
- Field Note evidence remains internal-only while `field_note_visibility` is
  constrained to `internal`.
- Portal users cannot list, view, download, preview, or infer internal field
  evidence.
- Service role/provider behavior remains unchanged.
- No public URLs.
- Signed URLs are allowed only after a confirmed private storage pattern and only
  from contractor-side server loaders/actions.
- Storage paths must be organization-first and must not be guessable public
  access paths.
- Field evidence must not bypass server validation or rely on client-provided
  tenant/project context alone.

## UI/UX Plan

Future UI should be centered on Daily Job Log detail:

- Keep the `Field Evidence` section under Daily Job Log detail.
- Add a mobile-first evidence form with a normal browser file input, large tap
  targets, attachment type, optional label, and caption.
- Keep optional Job Note evidence under each Job Note where the current subject
  model already supports it.
- Preserve Job Workspace quick actions that deep-link to the Daily Log evidence
  anchor rather than creating a detached job upload surface.
- Show thumbnail previews only after a safe signed URL resolver exists.
- Show upload progress only if the selected server/client upload pattern can do
  it without leaking storage details.
- Defer desktop drag/drop upload until the mobile path, storage policy, and
  signed URL rules are proven.
- Defer delete/archive controls until storage-object retention and metadata
  behavior are designed together.
- Empty state copy should stay operational, for example: "No field evidence
  attached yet."

## FieldTrail, Proof Center, And CloseoutTrail Integration

The current read models already treat execution attachments as field proof:

- FieldTrail counts total attachments and photo attachments across Daily Logs
  and Job Notes.
- Proof Center includes field evidence as `field_proof` and can direct users to
  FieldTrail when field history exists without evidence.
- CloseoutTrail includes field evidence in closeout checklist state and
  highlights.
- Service Center can reference project proof/context counts without becoming an
  evidence owner.

Phase 3 should keep that integration read-model-first:

- Uploading evidence should make existing FieldTrail counts more useful.
- Proof Center should continue indexing field proof through existing attachment
  counts.
- CloseoutTrail should continue seeing field evidence as closeout readiness
  context.
- Service Center should reference proof context; it should not own field evidence
  upload.
- Document Engine closeout packages may include evidence counts and internal
  record references. They should not embed private images/files or expose signed
  URLs unless a later explicit customer-safe sharing slice approves that.

## Portal And Customer Boundary

Phase 3 must not expose internal field evidence to customers.

The portal currently focuses on customer-safe shared documents, timeline, next
steps, invoices, estimates, contracts, change orders, appointments, and issued
warranty documents. Internal FieldTrail, Job Notes, and field evidence remain
contractor-side.

Future customer sharing requires a separate Customer Access design covering:

- Explicit per-record or per-package sharing rules.
- Customer-safe labels and redaction.
- Signed URL expiry and auditability.
- Portal loader tests proving unshared evidence is inaccessible.
- Closeout package/customer download rules.

Until that exists, field evidence is internal contractor proof only.

## Test Plan

Future implementation should include focused tests for:

- Upload input validation for file name, MIME type, size, and count.
- Allowed file types and rejected file types.
- Organization, project, job, Daily Job Log, and Job Note scoping.
- Project readiness gate behavior before upload.
- Metadata insert after successful upload.
- Storage upload failure cleanup or refusal behavior.
- Signed URL resolution for contractor-side evidence previews.
- FieldTrail attachment/photo count updates.
- Proof Center field proof count and next-move behavior.
- CloseoutTrail field evidence checklist behavior.
- Portal/customer loaders cannot access internal field evidence.
- Mobile Daily Log route smoke after evidence UI is added.

## Implementation Slices

Recommended sequence:

1. **Phase 3A: Evidence Storage Readiness Audit**  
   Documentation and code inspection only. Confirm bucket, pathing, upload
   helper, signed URL, file limit, delete/archive, and portal exclusion strategy.

2. **Phase 3B: Metadata UX Hardening**  
   If useful before real upload, improve the existing metadata-only
   `ExecutionAttachmentForm` copy/validation and label guidance without changing
   storage behavior.

3. **Phase 3C: Evidence Upload Foundation**  
   Add the actual upload path using the approved storage strategy, preserving
   Daily Log and Job Note subjects.

4. **Phase 3D: Preview, Thumbnail, And QA**  
   Add contractor-side previews, optional thumbnails, mobile smoke coverage, and
   portal-negative tests after storage and signed URLs are stable.

This sequence keeps the first production code slice small and prevents storage
or portal leakage from being discovered after the UI already promises uploads.

## Recommended Next Prompt

```text
Chat: Mobile Field Phase 3A - Evidence Storage Readiness Audit

You are working in the FloorConnector repo.

Goal:
Perform a docs-only storage readiness audit for Mobile Field Phase 3 evidence
upload.

Do not implement upload behavior.
Do not add storage buckets.
Do not add schema or migrations.
Do not change execution attachment behavior.
Do not expose field evidence to portal/customer users.
Do not create signed URL routes.
Do not change auth, RLS, tenant logic, providers, notifications, or automation.

Read:
- docs/current-state.md
- docs/chat-handoff.md
- docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md
- supabase/migrations/20260417200000_execution_attachments_foundation.sql
- supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql
- apps/web/lib/execution-attachments/*
- apps/web/lib/estimates/data.ts
- apps/web/lib/catalogs/data.ts
- apps/web/lib/portal/data.ts
- packages/config/src/constants/platform.ts

Inspect existing storage upload, signed URL, delete, and portal exposure
patterns. Then document the recommended field evidence bucket/pathing/signed URL
strategy, required tests, and implementation gate.

Create:
- docs/design/mobile-field-phase-3a-evidence-storage-readiness-audit.md

Validation:
- focused Prettier write/check on touched docs
- git diff --check
- git status --short --branch
```

## What Is Intentionally Not Implemented Yet

- No upload behavior.
- No storage bucket or storage policy change.
- No schema or migration.
- No execution attachment model change.
- No file input, drag/drop, camera capture, preview, thumbnail, or progress UI.
- No signed URL route or resolver for field evidence.
- No delete/archive behavior.
- No portal/customer field evidence exposure.
- No offline mode, GPS/geofencing, AI summary, notification, or automation.
- No app behavior, auth, RLS, tenant logic, payments, signatures, settings,
  platform-admin, provider, or Document Engine behavior changed.
