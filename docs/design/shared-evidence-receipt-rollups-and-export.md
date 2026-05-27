# Shared Evidence Receipt Rollups And Export

Status: Implemented
Doc Type: Implementation Note

## Purpose

This pass turns explicit portal evidence grants and append-only delivery events
into readable receipt summaries for closeout, warranty support, customer
records, and future dispute-support review.

It is not a broad document-management system, legal dispute package engine,
stored PDF system, or file-copying layer.

## Source Records

The rollup derives from canonical records only:

- `portal_evidence_grants`
- `portal_evidence_delivery_events`
- `execution_attachments` metadata already eligible for explicit sharing
  (active Daily Log / Job Note evidence only; internal Work Item evidence is
  excluded from current portal eligibility)
- existing project and portal project scope

No schema changed in this pass.

## Read Model

The shared helper lives in
[apps/web/lib/portal-evidence-grants/receipt-rollup.ts](C:/FloorConnector/apps/web/lib/portal-evidence-grants/receipt-rollup.ts).

It derives:

- active shared evidence count
- viewed item count
- downloaded item count
- acknowledged item count
- revoked item count
- unacknowledged active shared count
- last shared/viewed/downloaded/acknowledged/revoked timestamps
- last customer interaction timestamp
- project receipt status
- contractor proof rows
- customer-safe receipt rows

Receipt statuses:

- `no_shared_evidence`
- `shared_not_viewed`
- `viewed_or_downloaded`
- `partially_acknowledged`
- `fully_acknowledged`
- `revoked_or_changed`

## Contractor Behavior

Project Workspace now shows a customer receipt history summary inside Project
Evidence / Portal Evidence Sharing.

Contractors can open:

`/projects/:projectId/evidence/receipt`

The route is browser print/save HTML over current grants and proof events. It
includes active shared rows and revoked proof history so the contractor can see
what changed over time.

## Portal Behavior

Portal Project Workspace and Closeout Handoff now show customer-safe evidence
receipt status, acknowledgement progress, and last customer activity.

Customers can open:

`/portal/projects/:projectId/evidence/receipt`

The route shows only active customer-visible shared evidence rows. Revoked and
internal-only contractor proof is not exposed as an active portal list.

## Print / Export Boundary

The receipt routes are printable app views. They do not:

- create stored PDFs
- create generated file artifacts
- copy evidence files
- send files to customers
- create delivery proof
- mutate acknowledgement, sharing, project, payment, signature, or closeout
  state
- expose raw storage paths

The print footer and export notice keep this boundary visible.

## Acknowledgement Boundary

Customer acknowledgement means the customer confirmed receipt of access to a
shared file. It is not:

- a signature
- legal delivery certification
- scope approval
- price approval
- schedule approval
- payment-term change

## Non-Goals

- no broad document manager
- no legal dispute package automation
- no stored closeout package versions
- no PDF generation engine
- no file copies
- no portal-only evidence records
- no provider calls
- no email/open-pixel tracking
- no exposure of FieldTrail, Proof Center internals, Daily Log bodies, Job Note
  bodies, internal blockers, raw provider metadata, or raw storage paths

## Future Work

- stored package/version policy after product and retention requirements are
  approved
- broader explicit shareable subject types after a canonical shared-document
  model exists
- customer record bundle export after document-version and storage policy are
  defined
- warranty/service receipt rollups that reference these rows without creating
  warranty-only proof records
