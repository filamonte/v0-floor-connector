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

Eligibility note: `execution_attachments` now also supports internal
`work_item` subjects. Those rows are contractor-only and are not eligible for
current portal evidence grants. Current sharing remains limited to eligible
active Daily Log / Job Note field evidence.

## Visibility Rules

Default state:

- execution attachments are contractor-only
- Work Item execution attachments are contractor-only and not shareable through
  this policy layer
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

## Delivery Proof Extension

Shared Evidence Delivery Proof + Customer Acknowledgement v1 extends active
portal evidence grants with an append-only proof table:
`portal_evidence_delivery_events`.

Supported event types are:

- `shared`
- `viewed`
- `downloaded`
- `acknowledged`
- `revoked`

The proof table does not copy files or mutate source `execution_attachments`.
It records contractor share/revoke events, a portal viewed event when active
shared evidence is shown in a scoped portal project, a downloaded event when
the safe signed URL route successfully issues a short-lived URL, and an
idempotent customer acknowledgement event. Revoked grants cannot receive new
customer viewed/downloaded/acknowledged events.

Acknowledgement means the customer confirmed receipt of access to the shared
file. It is not a signature, legal delivery certification, scope approval,
price approval, schedule approval, or payment-term change.

## Receipt Rollup Extension

Shared Evidence Receipt Rollups + Customer Record Export v1 now derives
project-level receipt status from the same grants and delivery events. The
rollup reports active shared evidence, viewed/downloaded/acknowledged/revoked
counts, outstanding acknowledgements, last customer interaction, contractor
proof rows, and customer-safe receipt rows. Contractor Project Workspace and
Portal Project Workspace both link to browser print/save receipt views. These
views are generated from current canonical grant/event rows only; they do not
store PDFs, copy files, create portal-only records, or certify legal delivery.

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
- no email/open-pixel tracking or claim of legal delivery certainty

## Future Work

Future slices can consider:

- a broader shared file/evidence subject model after versioning and storage
  policy are approved
- shared file thumbnails or previews
- richer delivery proof reporting and export once legal/product requirements
  are approved
- stored closeout package versions
- explicit sharing for future shared document records when that canonical model
  exists
