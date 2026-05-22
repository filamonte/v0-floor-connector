# Document Engine Phase 1 - PDF And Export Foundations

Status: Active
Doc Type: Implementation Note

## Purpose

Document Engine Phase 1 strengthens FloorConnector's existing document
print/export foundation without creating a disconnected document-management
system.

The goal is simple: contractors and portal customers can open a print-optimized
estimate, contract, or invoice route and use the browser to print or save a PDF
from the current source record.

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
- [docs/product-language-audit.md](C:/FloorConnector/docs/product-language-audit.md)
- [docs/design/operating-core-checkpoint.md](C:/FloorConnector/docs/design/operating-core-checkpoint.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md)
- [docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md](C:/FloorConnector/docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md)
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md)
- [docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md)
- [docs/document-send-signature-architecture.md](C:/FloorConnector/docs/document-send-signature-architecture.md)
- [docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)

## Existing Data Used

Phase 1 uses the same records already loaded by the existing print routes:

- estimates, estimate line items, customer, project, scope, terms, totals, and
  status
- contracts, rendered contract content, project/customer context, signer
  routing, signer status, sent/signed timestamps, and status
- invoices, invoice line items, totals, retainage, balance due, payments, due
  date, notes, project/customer context, and status
- organization branding already stored on the active contractor account or
  portal-safe contractor brand

Totals are displayed from existing record fields. Document Engine does not
recalculate estimate or invoice math.

## Export Approach Chosen

Chosen approach: HTML print routes plus browser `Print / Save PDF`.

Reason:

- the repo already had contractor and portal `/pdf` routes for estimates,
  contracts, and invoices
- no server PDF binary dependency is needed
- browser print/save avoids platform-specific PDF generation failures
- source-record routes remain easy to review and test
- the artifact is clearly a generated view, not a stored document source of
  truth

This pass adds a small shared utility in `apps/web/lib/document-engine/print.ts`
for print-route links, back links, organization branding, export notices, and
footer copy.

## Document Types Implemented

Implemented in Phase 1:

- contractor estimate print/save route: `/estimates/[estimateId]/pdf`
- contractor contract print/save route: `/contracts/[contractId]/pdf`
- contractor invoice print/save route: `/invoices/[invoiceId]/pdf`
- portal estimate print/save route: `/portal/estimates/[estimateId]/pdf`
- portal contract print/save route: `/portal/contracts/[contractId]/pdf`
- portal invoice print/save route: `/portal/invoices/[invoiceId]/pdf`

The source detail pages link to those routes through the shared Document Engine
href helper.

## UI Affordances Added

- source workspaces continue to use `Print / Save PDF`
- print routes include a shared print button
- print routes now include a visible export notice explaining that printing or
  saving does not send the document or change delivery, signature, payment, or
  approval status
- print route footers now clarify that the view is not delivery proof and does
  not create a separate document record

## Behavior Preserved

This phase does not change:

- estimate editor behavior
- estimate status transitions
- estimate totals, tax, discount, or line calculations
- contract signature workflow
- signer routing or signature events
- invoice totals, tax, discount, retainage, payment, or balance calculations
- checkout, payment recording, provider reconciliation, or payment events
- Send Trail event creation
- Proof Center or CloseoutTrail summary behavior
- portal access or sharing rules
- auth/RLS, tenant boundaries, settings, or platform-admin behavior

Printing/exporting is not delivery proof. It is a generated artifact from the
source record.

## Intentionally Not Implemented

- server-generated PDF binaries
- persisted generated PDF files
- stored document versions
- document storage or file-management workflows
- project proof or customer closeout package generation
- warranty PDF package generation
- provider delivery events for print/export
- automated sending
- delivery retry workflow
- AI document summaries
- e-sign provider PDF packets
- external file storage changes

## Project Proof And Closeout Export

Project proof/closeout export remains a follow-up. Proof Center and
CloseoutTrail have good source-record coverage, but a customer-facing closeout
package needs stronger document generation/version decisions before it should be
implemented.

The safe next step is a design/spec pass for a project proof export that lists:

- Proof Center counts and source records
- CloseoutTrail checklist state
- FieldTrail evidence counts
- Send Trail, Signature Trail, and Payment Trail counts
- warranty/service references
- explicit labels that it is a generated summary, not a new proof source

## Follow-Up Candidates

- project proof summary print route
- closeout package design spec
- stored PDF/version evidence policy
- document template selection for print routes
- export filename/title improvements
- warranty package generation after source-record policy is settled
- provider-send integration that attaches generated artifacts only after send
  and versioning boundaries are explicit

## Browser QA Limitations

Browser QA may be blocked by local Supabase Auth rate limits, stale Playwright
storage state, base-URL mismatch, or stale fixed fixture IDs. If protected
routes cannot be reached, use
[docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
and do not claim browser verification passed.
