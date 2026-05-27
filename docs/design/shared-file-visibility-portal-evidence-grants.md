# Shared File Visibility + Portal Evidence Grants

Status: Implemented
Doc Type: Implementation Note

## Purpose

This pass adds the first explicit customer-visible evidence policy layer. It
lets authorized contractor users share selected project field evidence to the
customer portal while keeping all execution attachments internal by default.

It is not a full document-management product, shared file library, stored
closeout package, or customer-facing FieldTrail.

## Implemented Model

The canonical sharing record is `portal_evidence_grants`, added by
`supabase/migrations/20260527160000_portal_evidence_grants.sql`.

The table stores:

- `company_id`
- `project_id`
- `subject_type`
- `subject_id`
- `status`
- optional customer-safe title and note
- `shared_by` / `shared_at`
- `revoked_by` / `revoked_at`
- timestamps

The initial supported subject type is:

- `execution_attachment`

No files are copied. No storage object is duplicated. The grant points back to
the canonical execution attachment metadata row.

## Visibility Rules

Default state:

- execution attachments are contractor-only
- archived evidence is not eligible for new portal sharing
- field-note body, Daily Log internals, Job Notes internals, raw storage paths,
  and contractor-only labels remain hidden

Shared state:

- an owner/admin/manager can explicitly share an active eligible execution
  attachment from the contractor Project Workspace
- the portal shows only explicitly shared, non-archived evidence for projects
  the portal user can already access through active `portal_project_access`
- the portal sees customer-safe metadata, customer-safe note/title, shared date,
  and a short-lived signed file URL when storage signing succeeds

Revoked state:

- revoking the grant updates the same grant row to `revoked`
- revoked evidence disappears from the portal
- the contractor Project Workspace keeps the revoked status visible for audit
  continuity

## Storage Boundary

Files remain in the private `documents` bucket. Portal routes never receive raw
storage paths. Portal file access is resolved server-side only after:

- authenticated portal access exists
- project-scoped portal visibility includes the project
- an active `portal_evidence_grants` row exists
- the execution attachment is active, project-scoped, and stored under the
  private field-evidence path

Signed URLs are short-lived and are not persisted.

## UI Behavior

Contractor Project Workspace:

- Project Evidence now includes a Portal Evidence Sharing area
- rows show `Internal only`, `Shared with customer`, `Revoked`, or archived
  ineligibility
- sharing requires an explicit row action with customer-facing title/note
- revocation is explicit

Portal Project Workspace:

- Shared Project Evidence shows only explicitly shared evidence
- customer copy avoids internal contractor terminology
- empty state explains that unshared proof stays hidden

## Non-Goals

- no broad shared document/file system
- no portal-only file records
- no automatic sharing of execution attachments
- no customer-facing FieldTrail or Proof Center
- no Daily Log body, Job Note body, field-note body, or internal blocker
  exposure
- no stored closeout package or generated PDF package
- no destructive storage delete
- no provider calls
- no AI summaries or automation
- no support for estimate/contract/invoice/change-order subjects because those
  are already portal-visible through their canonical review routes

## Future Work

Future slices can consider:

- a broader shared file/evidence subject model after versioning and storage
  policy are approved
- shared file thumbnails or previews
- delivery proof for shared evidence
- customer acknowledgement of shared evidence
- stored closeout package versions
- explicit sharing for future shared document records when that canonical model
  exists
