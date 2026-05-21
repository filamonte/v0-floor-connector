Status: Active
Doc Type: Design Implementation Note

# Google Stitch UI Adoption - Phase 5 Commercial Detail Visual Maturity

## 1. Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/README.md](C:/FloorConnector/docs/README.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/stitch/README.md](C:/FloorConnector/docs/design/stitch/README.md)
- [docs/design/stitch/industrial-contrast-DESIGN.md](C:/FloorConnector/docs/design/stitch/industrial-contrast-DESIGN.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)
- [docs/design/stitch/phase-2-token-dashboard-audit.md](C:/FloorConnector/docs/design/stitch/phase-2-token-dashboard-audit.md)
- [docs/design/stitch/phase-3-dashboard-refresh.md](C:/FloorConnector/docs/design/stitch/phase-3-dashboard-refresh.md)
- [docs/design/stitch/phase-4-project-workspace-visual-maturity.md](C:/FloorConnector/docs/design/stitch/phase-4-project-workspace-visual-maturity.md)

## 2. Files Inspected

- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/edit/page.tsx`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/estimates/workspace.ts`
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/lib/contracts/data.ts`
- `apps/web/lib/contracts/document-rendering.ts`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/lib/invoices/actions.ts`
- `apps/web/lib/invoices/data.ts`
- `apps/web/lib/payments/data.ts`
- `apps/web/components/detail-page-header.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/action-hierarchy.tsx`
- `apps/web/components/document-delivery-history-panel.tsx`
- `apps/web/components/revisions/revision-timeline.tsx`
- `apps/web/components/operational-cues/needs-attention-panel.tsx`
- `apps/web/components/dashboard/dashboard-surface-primitives.ts`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`

## 3. Existing Estimate / Contract / Invoice Sections Preserved

Estimate detail preserved its header, search-parameter notices, next-action bar, estimate workflow bar, state summary, approval next-steps panel, PDF/review content, scope/line/totals review, customer timeline, delivery history, revisions, needs-attention cues, related records, schedule context, conversations, and internal work items.

Contract detail preserved its header actions, search-parameter notices, next-action bar, signature workflow bar, signature state summary, needs-attention cues, ready-to-schedule context, rendered contract content, status actions, signer routing, onsite signature modal, delivery history, revisions, related records, schedule context, and conversations.

Invoice detail preserved its header, search-parameter notices, next-action bar, billing workflow bar, invoice state summary, needs-attention cues, invoice review/editing surfaces, line-item/totals/payment review, payment evidence, delivery history, revisions, related records, schedule context, conversations, and internal work items.

## 4. Visual Changes Made

- Added `CommercialDocumentCommandBand`, a small shared commercial-detail command component for estimate, contract, and invoice review pages.
- Added `commercialDocumentHeaderShellClassName` so the three commercial document headers share the same Graphite/Copper panel shell without changing their existing action controls.
- Added a Graphite command band beneath each existing `DetailPageHeader`, using current page data only:
  - Estimate: customer, project, estimate total, line-item count, subtotal, and status.
  - Contract: customer, project, signature progress, signature state, and display status.
  - Invoice: customer, project, balance due, paid amount, total amount, and status.
- Added a consistent Copper project-hub action in the command band so each commercial document links clearly back to the Project Workspace.
- Left existing `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, document review content, forms, and history panels in place.

## 5. Data / Workflow / Calculation / Payment / Signature Behavior Untouched

This pass did not change schema, migrations, RLS, Supabase query logic, route protection, auth, server actions, estimate status transitions, stale-version protections, contract approval/send/signature/countersign/void behavior, invoice creation/edit/payment recording/checkout/payment-event behavior, invoice tax, discount, retainage, total, balance, payment calculations, job readiness gates, portal grants, tenant scoping, canonical relationships, data loaders, or link/action destinations.

The commercial document pages remain review surfaces supporting the canonical chain:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## 6. Known Follow-Up Opportunities

- Align manager pages and global queues so list-to-detail transitions use the same Graphite/Copper hierarchy.
- Consider a later supporting-history pass for revision, delivery, signature-event, and payment-event panels once list and queue surfaces are aligned.
- If the commercial command band proves useful beyond estimate/contract/invoice, evaluate whether warranty documents or change orders should adopt it in a separate scoped pass.

## 7. Recommended Next Prompt Title

`Google Stitch UI Adoption - Phase 6 Manager Pages and Global Queue Visual Alignment`
