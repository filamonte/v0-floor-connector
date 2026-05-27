# Shared Evidence Delivery Proof + Customer Acknowledgement

Status: Implemented
Doc Type: Implementation Note

## Purpose

This pass adds auditable proof around explicitly shared project evidence. It
answers when selected evidence was shared, viewed in the portal, opened through
the safe signed URL route, acknowledged by the customer, and revoked.

It is not a broad document-management system, legal delivery certification,
email tracking system, or file-copying layer.

## Event Model

The canonical proof table is `portal_evidence_delivery_events`, added by
`supabase/migrations/20260527173000_portal_evidence_delivery_events.sql`.

The table is scoped by:

- `company_id`
- `project_id`
- `portal_evidence_grant_id`
- optional `portal_access_grant_id`

Supported `event_type` values are:

- `shared`
- `viewed`
- `downloaded`
- `acknowledged`
- `revoked`

Supported `actor_kind` values are:

- `contractor`
- `portal_customer`
- `system`

The table is append-only. Forced RLS is enabled, update/delete triggers reject
mutation, and no broad client insert/update/delete policy is created. Server
utilities validate grant state and portal project scope before writing events.

## Behavior

Contractor actions:

- sharing an eligible execution attachment records `shared`
- revoking an active share records `revoked`
- contractor Project Workspace shows delivery proof summaries per shared or
  revoked item

Portal actions:

- loading active shared evidence for a project-scoped portal user records a
  one-time `viewed` event for that grant/access scope
- opening the shared file route records `downloaded` only after access
  validation and successful signed URL issuance
- acknowledging receipt records an idempotent `acknowledged` event

Revoked grants are hidden from the portal and cannot receive new customer
viewed/downloaded/acknowledged events.

## Customer-Safe Boundary

Portal users see only customer-safe shared evidence metadata and derived proof
status. They do not see raw storage paths, internal Daily Log or Job Note
bodies, FieldTrail, Proof Center internals, unshared evidence counts, archived
evidence, provider payloads, or contractor-only labels.

Acknowledgement copy is intentionally limited: it confirms receipt of access to
the shared file and does not change project scope, price, schedule, payment
terms, or signature state.

## Storage Boundary

Files remain in the private `documents` bucket. Portal links point to the
server route:

`/portal/projects/:projectId/evidence/:grantId/download`

That route validates active portal project access, active grant state,
attachment project scope, active/unarchived evidence state, and private field
evidence storage before issuing a short-lived signed URL. The signed URL is not
persisted.

## Non-Goals

- no automatic exposure of unshared evidence
- no archived evidence exposure
- no file copies or portal-only file records
- no broader subject types beyond `execution_attachment`
- no email/open-pixel tracking
- no provider calls
- no legal delivery certification
- no source attachment mutation for customer activity
- no destructive storage actions
- no generated closeout package proof

## Future Work

- broader explicit sharing subjects after a canonical shared-document model is
  approved
- delivery proof rollups for generated closeout packages
- customer-facing receipt export if product/legal requirements are defined
- richer contractor proof reporting without exposing internal field context
