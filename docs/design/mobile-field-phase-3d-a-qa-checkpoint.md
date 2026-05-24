# Mobile Field Phase 3D-A QA Checkpoint

Status: QA Checkpoint
Doc Type: QA

## Purpose

This checkpoint verifies Mobile Field Phase 3D-A after contractor-only evidence
preview links landed. It focuses on signed URL boundaries, Daily Log / Job Note
parent validation, Daily Log row behavior, portal exclusion, and preservation of
the private `documents` bucket fence.

This is a QA/checkpoint pass only. It does not add thumbnails, delete/archive,
portal/customer exposure, schema, migrations, storage policy changes, public
URLs, AI, notifications, automation, provider behavior, or closeout package file
embedding.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md`
- `docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md`
- `docs/design/mobile-field-phase-3c-evidence-upload-foundation.md`
- `docs/design/mobile-field-phase-3c-qa-checkpoint.md`
- `docs/design/mobile-field-phase-3a-evidence-storage-readiness.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`

## Files Inspected

- `apps/web/lib/execution-attachments/preview.ts`
- `apps/web/lib/execution-attachments/preview.test.ts`
- `apps/web/lib/execution-attachments/storage.ts`
- `apps/web/lib/execution-attachments/data.ts`
- `apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx`
- `apps/web/lib/daily-logs/actions.ts`
- `apps/web/lib/daily-logs/data.ts`
- `apps/web/lib/daily-logs/links.ts`
- `apps/web/lib/field-notes/data.ts`
- `apps/web/lib/fieldtrail/summary.ts`
- `apps/web/lib/proofcenter/summary.ts`
- `apps/web/lib/closeouttrail/summary.ts`
- `apps/web/lib/document-engine/print.ts`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/closeout-package/pdf/page.tsx`
- `apps/web/lib/portal/data.ts`
- `apps/web/app/(portal)/*`

## Signed URL Boundary Findings

Confirmed:

- Signed URLs are generated server-side by execution attachment id through
  `createExecutionAttachmentSignedUrl`.
- The resolver uses the existing authenticated contractor Daily Log scope before
  loading or signing an attachment.
- The signed URL expiry constant is `60 * 60`, matching the documented one-hour
  boundary and existing private `documents` bucket patterns.
- The storage path used for signing is loaded from the scoped database row; it
  is not accepted from the client.
- Private field evidence signing is limited to paths under the active company
  `projects/.../field-evidence/daily-logs/...` prefix.
- External reference rows and non-field-evidence paths are not signed by the
  field evidence resolver.
- Signed URLs are returned during contractor Daily Log server rendering and are
  not stored in database rows.
- No public URL behavior was added.
- No signed URL logging was found in the inspected implementation.

## Access Validation Findings

Confirmed:

- Attachment lookup is scoped by `company_id` from the active organization
  context.
- Daily Log attachment preview validates the parent Daily Job Log still belongs
  to the active organization.
- Job Note attachment preview validates the parent Job Note, then validates its
  parent Daily Job Log and project relationship.
- Wrong-company attachments cannot be loaded by id because the database query
  includes the active company id and the parent validation repeats the
  organization check.
- Preview reads intentionally avoid the upload readiness gate while preserving
  organization, project, Daily Log, and Job Note ownership checks.
- Portal/customer contexts do not import or call the execution attachment
  preview resolver.

## UI Findings

Confirmed:

- Daily Log evidence rows show file name, MIME type, caption, and a safe status
  label.
- Preview action labels map as `Open image`, `Open PDF`, or `Open file`.
- If signing is unavailable, rows show `Preview unavailable`.
- External reference-style rows retain their existing `Open attachment
reference` link behavior.
- Raw private storage paths are not rendered in Daily Log evidence rows.
- The implementation keeps the preview action as a read-only open link and does
  not add thumbnails, archive, delete, or inline private file embedding.

## Portal And Security Findings

Confirmed:

- Portal code search found signed URL behavior only for existing portal estimate
  attachments after portal access validation, not field evidence.
- Portal loaders do not import `execution-attachments/preview` or
  `resolveExecutionAttachmentPreviews`.
- FieldTrail continues to consume field evidence counts and metadata only.
- Proof Center continues to consume field evidence counts through FieldTrail.
- CloseoutTrail continues to use field evidence count/readiness language only.
- The contractor closeout package derives FieldTrail, Proof Center, and
  CloseoutTrail summaries but does not resolve or embed private field evidence
  signed URLs.

## Tests Run

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/execution-attachments/preview.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/execution-attachments/storage.test.ts`

Additional typecheck, lint, formatting, browser QA, and git validation are
recorded in the final checkpoint response for this commit.

## Browser QA Checked

Browser QA used saved contractor auth against the local app. No new files were
uploaded, and no auth refresh was attempted.

Checked:

- `/daily-logs`
- one discovered `/daily-logs/[dailyLogId]`
- mobile-ish viewport
- horizontal overflow
- no raw private storage path visible

The first saved-auth pass loaded `/daily-logs` and one discovered Daily Log
detail without a login redirect and found no horizontal overflow or raw private
storage path text. The discovered local Daily Log did not include uploaded field
evidence rows, so this checkpoint could not confirm a real `Open image`, `Open
PDF`, or `Open file` click against a stored object.

Repeated direct protected-route checks then hit local Supabase Auth
`over_request_rate_limit` and redirected to `/login`, so browser QA should not
be counted as full protected-route coverage. Retry real-object preview QA only
after the local auth cooldown clears and saved contractor auth is healthy.

## Behavior Preserved

- Daily Job Log create/update behavior.
- Job Note create/update behavior.
- Phase 3C upload behavior and file validation.
- Existing `execution_attachments` metadata model.
- Private `documents` bucket usage.
- FieldTrail, Proof Center, CloseoutTrail, Service Center, and Document Engine
  read-model boundaries.
- Project readiness enforcement for upload/mutation paths.
- Portal/customer boundary.
- Auth, RLS, tenant, payment, signature, estimate, invoice, settings, and
  platform-admin behavior.

## Follow-Up Candidates

- Retry browser QA against a Daily Log with real uploaded field evidence and
  confirm the open link resolves through a one-hour signed URL.
- Consider a small resolver route later only if expiring links need refresh
  without a page reload.
- Plan archive/delete separately before adding any destructive field evidence
  controls.
- Keep thumbnails and customer/portal sharing as later approved slices after
  the preview boundary has real-record QA coverage.
