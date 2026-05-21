Status: Active
Doc Type: Product Language Audit

# Product Language Phase 1 Audit

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/chat-handoff.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Files Inspected

- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/payments/page.tsx`
- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/settings/layout.tsx`
- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/app/(super-admin)/super-admin/layout.tsx`
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/lib/navigation/navigation-config.ts`
- `apps/web/lib/settings/navigation.ts`
- `apps/web/components/cost-items-database/workspace-page.tsx`
- `apps/web/components/cost-items-database/settings-content.tsx`
- `docs/README.md`
- `docs/chat-handoff.md`
- `docs/graphite-copper-ui-system.md`

## Technical Terms Found In UI

- `Project readiness`, `readiness gates`, and `readiness chain` appeared in
  project, contract, invoice, and dashboard copy.
- `Workflow cues`, `project cues`, and `signature/collection cues` appeared in
  dashboard, project, contract, invoice, and settings copy.
- `Operational cockpit` appeared as the dashboard operating summary.
- `Cost Items Database` appeared in navigation and the cost-item workspace.
- `Payment activity/events/evidence` and `Signature Events` appeared in
  commercial document review surfaces.
- `Settings`, `Module controls`, `Platform defaults`, and `Super Admin`
  appeared as visible admin/control labels.
- `Tenant` and `canonical` appeared in some admin/settings copy. Phase 1 left
  several lower-priority occurrences because they are admin-facing and describe
  current architecture boundaries.

## Terms Changed In This Pass

- `Operational cockpit` became `Command Center` on the dashboard.
- Prominent project and My Work `cues` became `Next Move suggestions`.
- Prominent project readiness contexts became `GateKeeper`.
- Commercial/deposit/payment readiness labels became `Ready Check` where the
  label was user-facing and did not alter stored status semantics.
- `Cost Items Database` became `Cost Library` in navigation and the workspace
  title/support copy. The route remains `/cost-items-database`.
- Invoice settled payment review became `Payment Trail`.
- Contract signature history became `Signature Trail`.
- Portal/project visibility copy adopted `Customer Access`.
- Contractor settings shell/navigation adopted `Company Controls`.
- Super-admin shell adopted `Platform Control Room`.
- Super-admin defaults/module labels adopted `Starter Settings` and
  `Feature Controls`.

## Terms Intentionally Left Unchanged

- Route paths such as `/settings`, `/super-admin`, `/cost-items-database`,
  `/payments`, `/contracts`, `/invoices`, and `/projects`.
- Internal imports, file paths, types, helper names, database enums, server
  actions, form field names, hidden inputs, and test ids.
- Payment/signature provider event labels where exact provider or audit meaning
  matters.
- Customer-facing portal payment copy that already reads clearly and should not
  be over-branded.
- Developer docs and current-state architecture terms where the technical term
  is the correct source-of-truth language.

## Recommended Follow-Up Passes

1. Audit lower-priority settings/admin copy for remaining `tenant` and
   `canonical` wording that can safely become `company` or `project record`.
2. Review portal project and customer-access surfaces for a customer-safe
   `Customer Access` / `Shared Projects` pass.
3. Consider a focused `Version History`, `Send Trail`, and `Field Trail` pass
   only after verifying current event/history components.
4. Keep future passes copy-only unless a separate implementation task explicitly
   authorizes code or model changes.
