# Customer-Safe Closeout Package + Portal Handoff

Status: Implemented
Doc Type: Implementation Note

## Purpose

This pass adds a customer-safe closeout handoff to the portal Project Workspace.
It gives customers one trustworthy place to understand what is done, what still
needs action, what documents are available for their records, what payment
status is visible, and whether warranty handoff documents are available.

It is not a document-management product, stored packet system, field-proof
sharing system, or portal copy of contractor operations.

## Source Records Used

The handoff derives only from records already available through project-scoped
portal access:

- project summary and project status
- estimates and existing portal estimate review/print routes
- contracts and existing portal contract review/print routes
- change orders and existing portal change-order review routes
- invoices plus customer-safe payment event status
- customer-safe schedule context already loaded by the portal project route
- portal-visible warranty documents and warranty print routes

The shared read model lives in
[apps/web/lib/portal/closeout-handoff.ts](C:/FloorConnector/apps/web/lib/portal/closeout-handoff.ts).

## Implemented Behavior

The portal Project Workspace now includes a `Closeout Handoff` section with:

- overall closeout status
- next customer action
- contract, change-order, payment, and warranty progress
- customer-safe document package rows
- invoice/payment status in customer-safe language
- warranty/service handoff status where portal-visible warranty documents exist
- clear boundary copy explaining that contractor-only evidence remains internal

Focused tests live in
[apps/web/lib/portal/closeout-handoff.test.ts](C:/FloorConnector/apps/web/lib/portal/closeout-handoff.test.ts).

## Customer-Safe Boundary

The portal closeout handoff may show customer-safe commercial records, payment
state, scoped schedule context, and issued portal-visible warranty documents.

It does not show:

- FieldTrail
- Proof Center
- Daily Job Log details
- Job Notes
- execution attachments or field photos
- internal blockers/readiness notes
- contractor-only proof trails
- service-ticket internal notes, labor, billing, or crew details
- raw provider metadata or diagnostics

Field proof remains richer on the contractor Project Workspace than in the
portal. Customer-facing field evidence needs a future explicit visibility model
before any file/photo sharing is added.

## Non-Goals

- no portal-only project, document, payment, warranty, or closeout records
- no automatic sharing of execution attachments
- no stored PDFs or generated package artifacts
- no closeout package download route
- no delivery proof mutation
- no provider calls
- no schema, migrations, storage policy changes, or auth changes
- no payment, signature, estimate, invoice, change-order, warranty, service, or
  schedule mutation
- no portal service request workflow

## Future Work

Future closeout depth should wait for explicit product and security decisions
around:

- shared-file visibility and customer-safe file grants
- stored package/version policy
- delivery proof for generated closeout packages
- portal-safe warranty/service status beyond warranty documents
- service request intake without creating portal-only support records
- customer-visible field evidence where specific files are intentionally shared
