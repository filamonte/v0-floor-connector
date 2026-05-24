# Mobile Field Phase 3D-A Evidence Preview Rows

Status: Implemented
Doc Type: Implementation Note

## Purpose

Mobile Field Phase 3D-A adds contractor-only read/preview access for uploaded
field evidence on Daily Job Logs and Job Notes. It lets authenticated contractor
users open private uploaded evidence through short-lived signed URLs without
showing raw storage paths or exposing field evidence to portal/customer
surfaces.

This is a narrow preview foundation. It does not add thumbnails, delete/archive,
portal/customer access, public URLs, schema, migrations, storage policy changes,
AI summaries, notifications, automation, or closeout package file embedding.

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
- `docs/design/mobile-field-phase-3c-qa-checkpoint.md`
- `docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`

## Existing Data And Storage Used

Phase 3D-A reuses:

- Daily Job Logs
- Job Notes
- `execution_attachments`
- the existing private Supabase `documents` bucket
- the Phase 3C server-generated field evidence storage paths
- existing active organization scope and contractor route protection

No schema, migration, bucket, or storage policy was added.

## Signed URL Approach Implemented

`apps/web/lib/execution-attachments/preview.ts` now owns pure preview display
mapping and the one-hour signed URL expiry constant.

`apps/web/lib/execution-attachments/data.ts` now has a contractor-side signed
URL helper that:

1. requires the existing authenticated Daily Log scope;
2. loads the attachment by attachment id scoped to the active organization;
3. validates the attachment's Daily Log or Job Note parent still belongs to the
   active organization and project chain;
4. refuses non-private field evidence storage paths;
5. creates a one-hour signed URL from the private `documents` bucket;
6. returns `null` when preview signing is unavailable.

The client never provides a raw storage path for signing. Signed URLs are not
stored in the database and are resolved only during contractor Daily Log server
rendering.

## Daily Log UI Changes

Daily Log evidence rows now keep file name, MIME type, caption, and status
visible while rendering a safe preview action when a signed URL is available:

- image evidence: `Open image`
- PDF evidence: `Open PDF`
- other file evidence: `Open file`
- unavailable signing: `Preview unavailable`

The rows still avoid raw private storage path display. Existing external
reference-style rows keep their existing inert reference-link behavior.

## Security And Portal Boundary

Phase 3D-A remains contractor-only:

- no portal route imports the execution attachment preview helper;
- portal loaders still do not resolve field evidence signed URLs;
- no public URL is created;
- no signed URL is persisted;
- no closeout package embeds private field evidence files;
- no customer-facing sharing rule was added.

## Tests Run

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/execution-attachments/storage.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/execution-attachments/preview.test.ts`

Additional typecheck, lint, formatting, browser QA, and git validation are
recorded in the final implementation response for this commit.

## Behavior Preserved

- Daily Job Log create/update behavior
- Job Note create/update behavior
- Phase 3C upload behavior and file validation
- existing `execution_attachments` metadata model
- private `documents` bucket usage
- FieldTrail, Proof Center, CloseoutTrail, Service Center, and Document Engine
  read-model boundaries
- project readiness enforcement for upload/mutation paths
- portal/customer boundary
- auth, RLS, tenant, payment, signature, estimate, invoice, settings, and
  platform-admin behavior

## What Is Intentionally Not Implemented Yet

- No thumbnails.
- No delete/archive.
- No portal/customer evidence access.
- No public URLs.
- No schema or migrations.
- No storage policy changes.
- No signed URLs stored in the database.
- No closeout package private image/file embedding.
- No FieldTrail, Proof Center, or CloseoutTrail preview panels.
- No AI, automation, notifications, provider calls, GPS/geofencing, or offline
  queue.

## Follow-Up Candidates

- Add browser/manual QA coverage against a Daily Log with real uploaded evidence
  when saved contractor auth and local data are available.
- Add a tiny resolver route later if expiring links need refresh without a page
  reload.
- Plan archive/delete separately with proof retention and audit expectations
  before any destructive control is introduced.
