# Send Trail Phase 1 - Document Delivery Proof Visibility

Status: Implemented

Send Trail Phase 1 strengthens read-only document delivery proof visibility on
top of existing document delivery, signature, payment, portal view, and
communication foundations. It does not create a new delivery system, provider
integration, delivery table, route, send action, email automation, or fake event
source.

## Purpose

Send Trail helps contractors answer:

- what documents were sent or requested?
- who was the delivery or request aimed at?
- when was delivery or request evidence recorded?
- did the customer view or act on the record where existing evidence supports
  that?
- which estimate, contract, invoice, warranty document, project, or change
  order owns the evidence?
- where should the contractor open the source record?

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/reporting-phase-1-operations-collections-visibility.md`
- `docs/local-auth-qa-recovery.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/document-delivery-proof-architecture.md`
- `docs/document-send-signature-architecture.md`
- `docs/provider-document-send-architecture.md`

## Existing Data Used

The Send Trail helper accepts existing evidence shapes only:

- `document_delivery_events`
- `contract_signature_events`
- `payment_events`
- `portal_record_views`
- `communication_messages`
- source-record links for estimates, contracts, invoices, warranty documents,
  change orders, and projects

The UI slice uses existing delivery events already loaded by Estimate, Contract,
and Invoice Workspaces. Project Workspace already surfaces Send Trail count,
latest Send Trail context, and source-record links through MessageCenter and
Proof Center.

## Surfaces Changed

Changed:

- Estimate Workspace delivery evidence panel
- Contract Workspace delivery evidence panel
- Invoice Workspace delivery evidence panel

The existing delivery panel is now titled `Send Trail` and includes compact
summary tiles for:

- Send events
- Viewed / acted
- Needs review
- Next Move

Project Workspace was not given another panel. Existing MessageCenter and Proof
Center sections already expose Send Trail activity and counts.

## Send Trail Items Implemented

The pure `apps/web/lib/sendtrail/summary.ts` helper derives UI-friendly items
for:

- estimate sent / requested
- contract sent / signature requested
- invoice sent / payment requested
- change order review requested
- portal view
- notification delivery
- communication message

Each item includes:

- item type
- status tone
- display target
- occurrence time
- source label
- source href
- helper copy

## Attention / Next Move Rules Implemented

The helper uses deterministic rules:

- failed or bounced delivery evidence -> Review send issue
- requested or pending customer action -> Review pending send
- portal/customer view evidence -> Open viewed record
- sent or delivery-recorded evidence -> Open sent record
- no evidence -> Review Send Trail from Communications

These rules do not mutate any record or mark delivery complete.

## Communications Delivery Proof V1

`/communications` now clarifies the existing document-delivery and
shared-evidence context with deterministic read-only labels for proof state,
proof source, and boundary. The workspace can show whether the latest visible
evidence is customer-facing, provider-derived, internal evidence, delivery proof
available, customer activity, send requested, or needs review.

This is a presentation/read-model refinement only. It does not add a route,
schema, provider send, webhook behavior, notification mutation, portal-owned
copy, retry action, or standalone delivery center.

## Communications Delivery Proof V2

`/communications` now groups the same read-only proof context by canonical
source record where existing data safely identifies one. The record grouping
shows compact source-record proof rows with source links, communications review
links, latest proof state, proof counts, proof source and boundary labels,
customer/internal labels, and deterministic review-needed ordering for failed,
bounced, or revoked evidence.

This is still a read-model and presentation slice only. It does not add source
record support beyond existing evidence, create send or resend behavior, change
provider adapters or webhooks, mutate notification events, create portal-owned
state, or add a standalone tracking system.

## Behavior Preserved

This slice preserves:

- schema and migrations
- route paths
- server actions and mutation behavior
- provider send behavior
- email/SMS behavior
- webhook behavior
- payment behavior and payment math
- signature behavior
- estimate and invoice math
- portal grants and Customer Access behavior
- auth, tenant boundaries, RLS, settings, and platform-admin logic

Send Trail reads existing evidence only. It does not send email, retry delivery,
start checkout, create payments, sign or decline records, approve estimates,
approve change orders, generate PDFs, create portal-only copies, or add AI /
automation.

## Intentionally Not Implemented Yet

Phase 1 intentionally does not implement:

- provider retry workflow
- open/click tracking beyond existing data
- new email or SMS provider integrations
- automated reminders
- customer communication templates
- delivery webhooks
- standalone delivery center
- AI follow-up drafting
- PDF generation or stored PDF versioning
- new project panel

## Follow-Up Candidates

Good follow-up slices:

- load portal view evidence into the source-record Send Trail summaries when
  the detail-page loaders can do so without extra route churn
- add change-order Send Trail visibility after the change-order delivery path is
  consistently available
- add provider callback telemetry only after webhook boundaries are explicitly
  designed
- expose a broader delivery center only after source-record visibility has
  stable coverage

## Browser QA Limitations

Protected-route browser QA remains conditional on local Supabase Auth state. If
saved local auth redirects protected routes to `/login` or Supabase Auth rate
limits are active, document the blocked routes honestly and rely on static
validation plus focused Send Trail tests for this read-only visibility slice.
