# Post Visual System Audit

Date: 2026-05-01

Status: review checkpoint after recent catalog, estimate, profile/account, palette, and layout work. This audit changed documentation only and did not change app code, schema, routes, workflows, auth, permissions, estimates, invoices, catalog behavior, calculations, UI styling, or data.

## Docs Reviewed

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/catalog-to-estimate-invoice-integration-spec.md](C:/FloorConnector/docs/catalog-to-estimate-invoice-integration-spec.md)
- [docs/estimate-catalog-selection-phase-2b-plan.md](C:/FloorConnector/docs/estimate-catalog-selection-phase-2b-plan.md)
- [docs/qa-estimate-catalog-item-insertion.md](C:/FloorConnector/docs/qa-estimate-catalog-item-insertion.md)
- [docs/estimate-editor-group-first-refactor-plan.md](C:/FloorConnector/docs/estimate-editor-group-first-refactor-plan.md)
- [docs/v0-ui-cleanup-brief-header-project-estimate.md](C:/FloorConnector/docs/v0-ui-cleanup-brief-header-project-estimate.md)
- [docs/inventory-cost-item-database-plan.md](C:/FloorConnector/docs/inventory-cost-item-database-plan.md)
- Recently changed design/guardrail docs from the current diff: [docs/decisions.md](C:/FloorConnector/docs/decisions.md), [docs/product-brain.md](C:/FloorConnector/docs/product-brain.md), [docs/figma-redesign-brief.md](C:/FloorConnector/docs/figma-redesign-brief.md), and [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md)

## Implementation Areas Inspected

- Protected app shell and account menu: [apps/web/components/contractor-app-shell.tsx](C:/FloorConnector/apps/web/components/contractor-app-shell.tsx), [apps/web/components/protected-app-top-nav.tsx](C:/FloorConnector/apps/web/components/protected-app-top-nav.tsx), [apps/web/lib/auth/actions.ts](C:/FloorConnector/apps/web/lib/auth/actions.ts)
- Profile settings: [apps/web/app/(app)/settings/profile/page.tsx](C:/FloorConnector/apps/web/app/(app)/settings/profile/page.tsx), [apps/web/lib/settings/navigation.ts](C:/FloorConnector/apps/web/lib/settings/navigation.ts)
- Leads/opportunities: [apps/web/app/(app)/leads/page.tsx](C:/FloorConnector/apps/web/app/(app)/leads/page.tsx), [apps/web/app/(app)/leads/[leadId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/leads/[leadId]/page.tsx), [apps/web/components/opportunity-quick-create-form.tsx](C:/FloorConnector/apps/web/components/opportunity-quick-create-form.tsx), [apps/web/lib/opportunities/actions.ts](C:/FloorConnector/apps/web/lib/opportunities/actions.ts), [apps/web/lib/opportunities/data.ts](C:/FloorConnector/apps/web/lib/opportunities/data.ts)
- Projects: [apps/web/app/(app)/projects/page.tsx](C:/FloorConnector/apps/web/app/(app)/projects/page.tsx), [apps/web/app/(app)/projects/[projectId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/projects/[projectId]/page.tsx), [apps/web/components/project-quick-create-form.tsx](C:/FloorConnector/apps/web/components/project-quick-create-form.tsx), [apps/web/components/customer-picker-field.tsx](C:/FloorConnector/apps/web/components/customer-picker-field.tsx), [apps/web/lib/projects/actions.ts](C:/FloorConnector/apps/web/lib/projects/actions.ts), [apps/web/lib/projects/data.ts](C:/FloorConnector/apps/web/lib/projects/data.ts)
- Estimates and catalog insertion: [apps/web/app/(app)/estimates/page.tsx](C:/FloorConnector/apps/web/app/(app)/estimates/page.tsx), [apps/web/components/estimate-quick-create-form.tsx](C:/FloorConnector/apps/web/components/estimate-quick-create-form.tsx), [apps/web/components/estimate-form.tsx](C:/FloorConnector/apps/web/components/estimate-form.tsx), [apps/web/components/estimates/items-section.tsx](C:/FloorConnector/apps/web/components/estimates/items-section.tsx), [apps/web/lib/estimates/actions.ts](C:/FloorConnector/apps/web/lib/estimates/actions.ts), [apps/web/lib/estimates/data.ts](C:/FloorConnector/apps/web/lib/estimates/data.ts), [apps/web/lib/estimates/schemas.ts](C:/FloorConnector/apps/web/lib/estimates/schemas.ts)
- Invoices: [apps/web/app/(app)/invoices/page.tsx](C:/FloorConnector/apps/web/app/(app)/invoices/page.tsx), [apps/web/app/(app)/invoices/[invoiceId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/invoices/[invoiceId]/page.tsx), [apps/web/components/invoice-quick-create-form.tsx](C:/FloorConnector/apps/web/components/invoice-quick-create-form.tsx), [apps/web/components/invoice-form.tsx](C:/FloorConnector/apps/web/components/invoice-form.tsx), [apps/web/lib/invoices/actions.ts](C:/FloorConnector/apps/web/lib/invoices/actions.ts), [apps/web/lib/invoices/data.ts](C:/FloorConnector/apps/web/lib/invoices/data.ts), [apps/web/lib/invoices/schemas.ts](C:/FloorConnector/apps/web/lib/invoices/schemas.ts)
- Catalog / cost items: [apps/web/lib/catalogs/data.ts](C:/FloorConnector/apps/web/lib/catalogs/data.ts), [apps/web/components/cost-items-database](C:/FloorConnector/apps/web/components/cost-items-database), [scripts/catalog-items-duplicate-normalized-name-report.sql](C:/FloorConnector/scripts/catalog-items-duplicate-normalized-name-report.sql), [docs/catalog-items-hardening-test-plan.md](C:/FloorConnector/docs/catalog-items-hardening-test-plan.md)
- Shared visual/settings surfaces: [apps/web/components/settings-section-card.tsx](C:/FloorConnector/apps/web/components/settings-section-card.tsx), [apps/web/components/contractor-workspace-page.tsx](C:/FloorConnector/apps/web/components/contractor-workspace-page.tsx), [apps/web/components/workspace-command-bar.tsx](C:/FloorConnector/apps/web/components/workspace-command-bar.tsx)

## Confirmed Current Truths

- The docs consistently define the canonical lifecycle as `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- `catalog_items` remains the canonical reusable cost item database. No `contractor_cost_items` table or module-specific cost item model was found in active app code.
- `inventory_items` is an optional operational stock extension linked to catalog items; it is not a duplicate sellable cost item master.
- Estimate catalog insertion is implemented through `insertCatalogItemToEstimateAction`, which accepts only `estimateId` and `catalogItemId`, rejects client-owned pricing payloads, rejects archived/inactive items, rejects `system` items, and creates server-owned `estimate_line_items` snapshots.
- The estimate editor group-first refactor is still planning, not fully implemented. Current code has item groups and grouped output, but catalog/system/import insertion is not yet a fully group-scoped Add Item drawer workflow.
- Invoice creation remains guarded by billing source and commercial readiness checks. Quick create requires project context plus deposit, job, approved estimate, or approved change-order source; standard job invoices require completed work.
- Invoice rows continue to use explicit lineage paths: approved estimate snapshot item, selected SOV item, approved change-order snapshot item, or invoice-only adjustment.
- `/settings/profile` exists, is protected, reads existing Supabase auth and `public.users` profile data, shows current organization context, and is read-only because no app-level personal profile update action is wired.
- The account menu exists in the protected top nav, links to Profile / Account settings, Organization settings, Settings home, and uses the existing `signOutAction`.
- Current UI docs agree that the contractor app direction is top-nav-first, CF-inspired in workflow/density, and visually black / gray / orange / white, with blue avoided as default chrome and green reserved for semantic status.
- Recent visual and layout passes are documented as visual-only and should not be treated as workflow, data, or backend changes.

## Doc Inconsistencies Found

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) still ends with a `UI DIRECTION UPDATE (LATEST)` section that lists "Estimate creation not consistently context-aware" as an identified issue. That appears stale relative to the later docs and implementation, where estimate quick create preserves project/customer context and global creation requires customer plus project or new project name.
- Invoice catalog wording is slightly inconsistent. Several docs say invoice catalog insertion is deferred or not implemented, while [apps/web/components/invoice-form.tsx](C:/FloorConnector/apps/web/components/invoice-form.tsx) and [apps/web/lib/invoices/data.ts](C:/FloorConnector/apps/web/lib/invoices/data.ts) support catalog-backed rows only as `invoice_only_adjustment` / `manual_catalog_item` snapshots. This is not free catalog-to-invoice billing for normal project scope, but docs should be clarified so "deferred invoice catalog insertion" means "no normal-scope catalog billing shortcut; only explicit invoice-only catalog adjustments exist if enabled by the current invoice editor."

## Functional Risks Found

- The invoice-only manual catalog item path is real enough that QA should verify it separately from approved estimate/SOV/change-order invoice creation. The risk is documentation and user understanding, not an observed calculation change in this audit.
- Commercial readiness can block invoice creation by design. A smoke test that uses a project without signed-contract/deposit/completed-job/approved-source prerequisites may look like a broken create flow even when guards are operating correctly.
- The audit did not submit create/update forms, sign out, send estimates, approve portal actions, or mutate records. End-to-end behavior still needs a seed-free manual QA pass with safe local/dev data.

## Visual Risks Found

- The docs now clearly require the black / gray / orange / white palette and top-nav-first app shell. This audit did not perform a pixel-level visual review, but no route/action removal was found in the inspected shared shell and manager components.
- The older design docs remain useful as planning references, but future UI work should continue treating v0/CF material as interaction and density guidance only, not as permission to add CF-only backend features or duplicate module models.

## Recommended Next Steps

### Must Fix Before More UI Work

- Clarify the stale `Estimate creation not consistently context-aware` note in [docs/current-state.md](C:/FloorConnector/docs/current-state.md), or move that section into historical context.
- Clarify invoice catalog language across current-state/workflows/spec docs so the implemented invoice-only manual catalog adjustment path is distinguished from forbidden normal-scope catalog-to-invoice billing.
- Run the Phase B/internal validation flow against safe local/dev data before assuming invoice create, estimate send/approval, and catalog insertion are production-ready.

### Safe Later Polish

- Add focused QA coverage or manual checklist entries for invoice-only catalog adjustments, including quantity > 0, lineage type, tax snapshot, and no approved-scope bypass.
- Add editable personal profile settings only after the intended profile fields, validation, auth metadata sync, and server action contract are approved.
- Continue incremental visual/layout polish on lower-traffic manager pages while preserving the locked black / gray / orange / white system.

### Do Not Touch Yet

- Do not add a second cost item model or cost item table.
- Do not add normal-scope free catalog insertion into invoices.
- Do not implement group-first estimate insertion server changes, durable estimate group tables, System Templates, QuickBooks, PTO, certificates, licenses, exports, takeoff, AI Capture, or new backend systems without a separate scoped task.
- Do not change estimate, invoice, catalog, tax, SOV, payment, or approved snapshot calculations as part of visual or documentation cleanup.
