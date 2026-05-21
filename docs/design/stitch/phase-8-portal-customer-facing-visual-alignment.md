# Google Stitch UI Adoption - Phase 8 Portal and Customer-Facing Visual Alignment

## 1. Docs read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/stitch/README.md`
- `docs/design/stitch/industrial-contrast-DESIGN.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/design/stitch/phase-2-token-dashboard-audit.md`
- `docs/design/stitch/phase-3-dashboard-refresh.md`
- `docs/design/stitch/phase-4-project-workspace-visual-maturity.md`
- `docs/design/stitch/phase-5-commercial-detail-visual-maturity.md`
- `docs/design/stitch/phase-6-manager-pages-global-queue-visual-alignment.md`
- `docs/design/stitch/phase-7-field-schedule-execution-visual-alignment.md`

## 2. Files inspected

- `apps/web/app/(portal)/portal/layout.tsx`
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/app/(portal)/portal/invite/page.tsx`
- `apps/web/components/portal-review-ui.tsx`
- `apps/web/components/detail-page-header.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/workspace-summary-band.tsx`
- `apps/web/lib/portal/data.ts`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/lib/contracts/data.ts`
- `apps/web/lib/invoices/actions.ts`
- `apps/web/lib/payments/*`

## 3. Portal/customer-facing surfaces reviewed

- Portal shell and home surface.
- Portal Project Workspace.
- Portal estimate review and decision actions.
- Portal contract review, signature state, sign, and decline actions.
- Portal invoice review, payment state, checkout handoff, and payment activity.
- Portal change-order review and approve/reject actions.
- Portal invite/access activation page.
- Shared portal cards, badges, panels, action boxes, and secondary links.

## 4. Shared portal primitives found or missing

Existing shared portal primitives already lived in `apps/web/components/portal-review-ui.tsx`:

- `PortalStatusBadge`
- `PortalSecondaryLink`
- `portalHeroPanelClassName`
- `portalStatePanelClassName`
- `portalInsetPanelClassName`
- `portalMetricPanelClassName`
- `portalReviewCardClassName`
- `portalDocumentPanelClassName`
- `portalActionBoxClassName`

This pass added customer-facing review primitives rather than importing contractor-only command bands:

- `PortalTrustStrip` for the Graphite/Copper customer-safe continuity band.
- `portalSummaryItemClassName` for consistent portal summary cards.
- `portalSummaryLabelClassName` for consistent portal summary labels.

The portal still does not need a broad standalone design system. The current shared helper is enough for bounded portal review surfaces.

## 5. Visual changes made

- Portal shell now uses a softened Graphite structural backdrop and customer-safe navigation band.
- Portal Home now includes a `PortalTrustStrip` that explains project-scoped access and avoids implying portal-only copies.
- Portal Project Workspace now includes a `PortalTrustStrip` that frames estimates, contracts, change orders, warranties, and invoices as one live project chain.
- Portal estimate review now includes a Graphite/Copper trust band for scope, status, project context, and total amount.
- Portal contract review now includes a trust band for live signature state, project context, and customer signer progress.
- Portal invoice review now includes a trust band for balance due, project context, payment state, and live billing continuity.
- Portal change-order review now includes a trust band for the live scope decision, price adjustment, status, and linked project context.
- Portal summary bands on the high-impact portal pages now share the same customer-facing summary card and label treatment.
- Estimate review now uses `PortalSecondaryLink` for the project return action to align with the rest of the portal review surfaces.

## 6. Portal access/signature/payment/workflow behavior explicitly untouched

This pass did not change:

- Portal route structure.
- Portal grants or portal project access enforcement.
- Authenticated email or invite matching behavior.
- Invite token handling or hashing.
- Portal data loaders.
- Server actions.
- Contract sign, decline, countersign, or signature-event behavior.
- Invoice checkout, payment request, payment-event, or webhook behavior.
- Change-order approval or rejection behavior.
- Estimate totals, invoice totals, tax, discount, retainage, balance, or payment calculations.
- Schema, migrations, RLS, tenant scoping, route protection, auth, payments, signatures, workflow gates, or canonical data relationships.

## 7. Portal surfaces still needing follow-up

- Portal warranty-document review and print surfaces can adopt the same `PortalTrustStrip` pattern in a later warranty/customer-document pass.
- Portal invite can be visually aligned further if a future access-flow pass targets signup/sign-in activation specifically.
- Portal document PDF/print routes should remain print-first and were intentionally left alone.
- Deeper customer communication, messaging, broad schedule visibility, and self-service request flows remain future target concepts unless recorded in `docs/current-state.md`.

## 8. Recommended next prompt title

`Google Stitch UI Adoption - Phase 9 Settings Super Admin and Platform Control Visual Alignment`
