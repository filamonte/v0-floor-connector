# Document Engine Phase 2A - Closeout Package Print Route

Status: Implemented
Doc Type: Implementation Note

## Purpose

Document Engine Phase 2A adds a contractor-side Project Closeout Package
print/save route generated from current project source records.

The package gives contractors a practical closeout packet they can print or save
from the browser without creating stored PDFs, generated artifact records, a
document-management subsystem, delivery proof, or a customer-facing package.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/design/operating-core-checkpoint.md](C:/FloorConnector/docs/design/operating-core-checkpoint.md)
- [docs/design/document-engine-phase-1-pdf-export-foundations.md](C:/FloorConnector/docs/design/document-engine-phase-1-pdf-export-foundations.md)
- [docs/design/document-engine-phase-2-plan.md](C:/FloorConnector/docs/design/document-engine-phase-2-plan.md)
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md)
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md)
- [docs/design/fieldtrail-phase-1-project-execution-timeline.md](C:/FloorConnector/docs/design/fieldtrail-phase-1-project-execution-timeline.md)
- [docs/design/messagecenter-phase-1-project-communication-timeline.md](C:/FloorConnector/docs/design/messagecenter-phase-1-project-communication-timeline.md)
- [docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md](C:/FloorConnector/docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)

## Existing Data Used

The print route renders from existing project source records and summary
helpers:

- project and customer context
- estimates
- contracts and Signature Trail context
- change orders
- jobs
- invoices and Payment Trail context
- Daily Job Logs
- Job Notes
- execution attachments
- FieldTrail summary
- MessageCenter summary
- Send Trail, Signature Trail, and Payment Trail counts/items where already
  loaded by MessageCenter
- CloseoutTrail checklist
- Proof Center evidence index
- warranty documents and service tickets linked to the project
- Customer Access count from existing portal access records

No new project, document, proof, warranty, payment, signature, closeout, storage,
or artifact records were added.

## Route Implemented

Implemented contractor route:

```text
/projects/[projectId]/closeout-package/pdf
```

The route:

- requires existing protected contractor auth and organization context
- uses existing tenant-safe loaders
- renders browser-printable HTML through the existing customer document print
  view
- includes a clear export notice that printing/saving does not send the package,
  create delivery proof, or change project/payment/signature/closeout state
- remains contractor-side only

## Package Sections Included

The package includes:

- Cover / project summary
- ProjectPulse summary
- CloseoutTrail checklist
- Proof Center index
- Commercial record summary
- Billing summary
- Field summary
- Communication and send summary
- Warranty/service handoff

Source references use human-readable labels, statuses, dates, amounts, and route
references. The package avoids raw internal IDs where user-facing reference
numbers or labels are available.

## Project Workspace Affordance Added

Project Workspace now includes a `Print Closeout Package` action immediately
after CloseoutTrail and before Proof Center.

That placement keeps the affordance close to closeout/proof context without
adding another global command header or unrelated project action.

## Behavior Preserved

This slice preserves:

- schema and migrations
- existing route behavior
- server actions and write behavior
- stored PDF/storage behavior
- provider send behavior
- Send Trail event creation
- estimate and invoice math
- payment, checkout, and payment-event behavior
- contract signature behavior
- portal grants and Customer Access behavior
- auth, tenant boundaries, RLS, settings, and platform-admin logic

The only new route is a contractor-side read-only print/export rendering.

## Send Trail / Export Distinction

The closeout package may display Send Trail evidence already connected to the
project, but printing or saving the package does not create Send Trail proof.

Send Trail remains document send, delivery, and request history. A closeout
package print/export is a generated artifact view from current records, not
delivery evidence.

## Intentionally Not Implemented Yet

- stored closeout package artifacts
- generated artifact records
- portal closeout package downloads
- signed or short-lived stored file URLs for generated packages
- server-side PDF generation
- PDF persistence/versioning
- automated delivery
- provider retry workflow
- warranty PDF packet generation
- customer closeout package approval
- AI-generated closeout summary
- customer-facing closeout route

## Follow-Up Candidates

- Phase 2B portal-safe closeout package view after customer visibility policy is
  explicit.
- Persisted artifact/version policy only after source revision and customer-send
  requirements are settled.
- Server-side PDF generation only if stored artifacts or provider attachments
  require stable PDF bytes.
- Additional print-specific layout polish after authenticated browser QA is
  available on representative project records.

## Browser QA Limitations

Protected-route browser QA depends on local Supabase Auth state. If local auth
is rate limited, storage state is stale, or the available project fixtures do
not belong to the active local organization, use
[docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
and document the blockage honestly.
