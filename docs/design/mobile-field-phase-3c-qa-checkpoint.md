# Mobile Field Phase 3C QA Checkpoint

Status: QA Checkpoint
Doc Type: QA

## Purpose

This checkpoint verifies the Mobile Field Phase 3C field evidence upload
foundation after the first real upload path landed. It focuses on storage,
parent validation, portal boundaries, read-model integration, and mobile Daily
Job Log usability.

This pass also made one small contractor-side UI copy hardening change: private
field evidence storage paths are no longer rendered as raw path text on Daily
Log detail. External reference-style rows still keep their existing inert link
behavior. No preview, thumbnail, download, signed URL resolver, delete/archive,
portal exposure, schema, migration, or provider behavior was added.

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
- `docs/design/mobile-field-phase-3c-evidence-upload-foundation.md`
- `docs/design/mobile-field-phase-2-quick-job-notes-evidence.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`

## Files Inspected

- `apps/web/lib/execution-attachments/storage.ts`
- `apps/web/lib/execution-attachments/storage.test.ts`
- `apps/web/lib/execution-attachments/data.ts`
- `apps/web/lib/execution-attachments/schemas.ts`
- `apps/web/components/execution-attachment-form.tsx`
- `apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx`
- `apps/web/components/field-note-form.tsx`
- `apps/web/lib/daily-logs/actions.ts`
- `apps/web/lib/daily-logs/data.ts`
- `apps/web/lib/field-notes/data.ts`
- `apps/web/lib/field-notes/schemas.ts`
- `apps/web/lib/fieldtrail/summary.ts`
- `apps/web/lib/proofcenter/summary.ts`
- `apps/web/lib/closeouttrail/summary.ts`
- `apps/web/lib/servicecenter/summary.ts`
- `apps/web/lib/document-engine/print.ts`
- `apps/web/lib/portal/data.ts`
- `apps/web/app/(portal)/*`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/closeout-package/pdf/page.tsx`
- `supabase/migrations/20260417190000_daily_logs_foundation.sql`
- `supabase/migrations/20260417193000_field_notes_foundation.sql`
- `supabase/migrations/20260417200000_execution_attachments_foundation.sql`
- `supabase/migrations/20260423201000_documents_bucket_and_storage_policies.sql`

## Upload Boundary Findings

Confirmed:

- Upload uses the existing private `documents` bucket through
  `STORAGE_BUCKET_NAMES.documents`.
- Storage paths are generated server-side by
  `buildExecutionAttachmentStoragePath`.
- The first path segment remains the active company id, preserving the existing
  storage policy shape.
- The client submits a file, subject type/id, and caption only; it does not
  provide or control the real storage path.
- `createUploadedExecutionAttachment` uploads the file first and creates the
  `execution_attachments` row only after upload succeeds.
- If metadata creation fails after upload, the server attempts best-effort
  storage cleanup.
- No public URL is created.
- No preview, thumbnail, contractor signed URL resolver, delete/archive action,
  or portal/customer sharing behavior exists in Phase 3C.

The only code change from this checkpoint was presentation hardening: private
non-URL storage paths are no longer printed directly in Daily Log detail rows.

## File Validation Findings

Confirmed:

- Allowed MIME types are constrained to JPG, PNG, WebP, and PDF.
- File size is limited to 10 MB.
- Empty file, empty filename, oversized file, unsupported MIME type, and overly
  long filename cases are rejected by the pure helper.
- Unsafe filename characters and path-like user input are normalized before
  storage path generation.
- Image MIME types infer `photo`; PDF infers `file`.
- Error messages are field-friendly and do not expose bucket or storage policy
  language.

## Parent Validation Findings

Confirmed:

- Upload requires the existing authenticated Daily Log scope.
- Daily Log subjects are loaded server-side and must belong to the active
  organization.
- Job Note subjects are loaded server-side and must belong to the active
  organization.
- Job Note evidence resolves back to the parent Daily Job Log and project
  context before storage path generation.
- Project readiness checks remain in the server subject-resolution path.
- `uploaded_by` is derived from the authenticated server scope.
- Client-provided project, job, or company context is not trusted for the
  actual upload path or metadata row.

## Portal And Security Findings

Confirmed:

- Portal loaders do not query `execution_attachments`, `daily_logs`, or
  `field_notes` for customer-facing evidence.
- Portal signed URL behavior remains limited to existing shared estimate
  attachments after portal access validation.
- FieldTrail, Job Notes, Proof Center, and internal proof language remain absent
  from portal code search except for an existing negative portal timeline test.
- The contractor closeout package summarizes field proof counts and references
  Daily Job Logs; it does not embed private images/files or resolve field
  evidence signed URLs.
- No Send Trail event, delivery proof event, notification, automation, or
  provider call is created by field evidence upload.

## UI And Mobile Findings

Confirmed:

- Daily Log detail renders a Daily Job Log field evidence form with file input,
  caption, allowed-file guidance, and private contractor-workspace copy.
- Job Note cards render the same upload form for note-specific evidence.
- The form is `multipart/form-data`, uses normal browser file input behavior,
  and does not claim preview, thumbnail, progress, or download support.
- Private uploaded objects display as stored contractor field evidence rather
  than raw storage paths after this checkpoint.
- Browser QA used a mobile-ish viewport and found no horizontal overflow on
  `/daily-logs` or the checked Daily Log detail route.

## Tests Run

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/execution-attachments/storage.test.ts`
  - 6 passed.
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/fieldtrail/summary.test.ts`
  - 4 passed.
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/proofcenter/summary.test.ts`
  - 7 passed.
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/closeouttrail/summary.test.ts`
  - 6 passed.

Additional validation is recorded in the final checkpoint response for this
commit.

## Browser QA Checked

Browser QA used saved contractor auth against the local app. No upload was
submitted.

Checked:

- `/daily-logs`
- one discovered `/daily-logs/[dailyLogId]`
- field evidence form visibility
- mobile-ish viewport
- horizontal overflow

The browser smoke did not test actual file submission because this checkpoint
kept QA to safe local/dev read and UI checks.

## Behavior Preserved

- Daily Job Log create/update behavior.
- Job Note create/update behavior.
- Existing `execution_attachments` metadata model.
- Private `documents` bucket usage.
- FieldTrail, Proof Center, CloseoutTrail, Service Center, and Document Engine
  read-model behavior.
- Project readiness enforcement.
- Portal/customer boundary.
- Auth, RLS, tenant, payment, signature, estimate, invoice, settings, and
  platform-admin behavior.

## Follow-Up Candidates

- Mobile Field Phase 3D: contractor-only signed URL resolver by execution
  attachment id with parent Daily Log / Job Note validation.
- Portal-negative tests for any future resolver.
- Optional read-only download/open links after signed URL scope is proven.
- Thumbnail previews only after signed URL and portal-negative coverage exists.
- Delete/archive policy only after retention and proof implications are
  explicitly approved.
