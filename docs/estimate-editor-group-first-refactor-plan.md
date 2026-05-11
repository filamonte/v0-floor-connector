# Estimate Editor Group-First Refactor Plan

Status:
- long-term design and implementation plan
- planning/documentation only
- no code, schema, estimate calculation, invoice, or migration changes

Related docs:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/catalog-to-estimate-invoice-integration-spec.md](C:/FloorConnector/docs/catalog-to-estimate-invoice-integration-spec.md)
- [docs/estimate-catalog-selection-phase-2b-plan.md](C:/FloorConnector/docs/estimate-catalog-selection-phase-2b-plan.md)
- [docs/qa-estimate-catalog-item-insertion.md](C:/FloorConnector/docs/qa-estimate-catalog-item-insertion.md)

## Purpose

The current Estimate Editor works, but the Items workspace is too long and still feels like a collection of estimating tools above a line-item table. The long-term direction should make estimate groups the primary authoring surface:

```text
create/select group -> choose item source -> review/add item -> edit line snapshot in group
```

This keeps FloorConnector's current canonical architecture intact:
- `catalog_items` remains the Cost Items Database / reusable cost item master.
- `estimate_line_items` remains the authoritative estimate row source.
- inserted rows remain editable estimate snapshots, not live-bound catalog rows.
- invoices stay out of scope and continue to prefer approved estimate/SOV/change-order lineage.

## Files Inspected

Mandatory docs inspected:
- `docs/current-state.md`
- `docs/developer-source-of-truth.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/catalog-to-estimate-invoice-integration-spec.md`
- `docs/estimate-catalog-selection-phase-2b-plan.md`
- `docs/qa-estimate-catalog-item-insertion.md`

Estimate Editor and estimate data files inspected:
- `apps/web/components/estimate-form.tsx`
- `apps/web/components/estimates/items-section.tsx`
- `apps/web/components/estimates/estimate-import-chooser.tsx`
- `apps/web/components/estimates/estimate-workspace-shell.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/edit/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/estimates/schemas.ts`
- `apps/web/lib/estimates/workspace.ts`
- `apps/web/lib/catalogs/pricing.ts`
- `apps/web/lib/catalogs/system-expansion.ts`
- `packages/types/src/index.ts`
- `supabase/migrations/20260414163000_estimate_line_items_foundation.sql`
- `supabase/migrations/20260423190000_shared_commercial_engine_foundation.sql`

## Current Behavior Summary

The editor already has partial group support:
- `estimate.content.itemGroups` stores editable UI group definitions with `id`, `label`, and `sortOrder`.
- `estimate_line_items.group_name` stores the persisted group label on the authoritative line item row.
- `EstimateForm` maps line-item `groupName` values back to local group ids for the editor.
- explicit save posts hidden `itemGroupId` / `itemGroupLabel` values and per-line `lineItemGroupName` values.
- `ItemsSection` renders line items grouped by local group id, includes an `Add Group` action, supports inline group rename, and deletes a group by unassigning its rows.
- estimate detail and portal estimate review already group customer-facing rows by line-item group labels.

The editor also already has multiple item sources:
- active non-system catalog items can be inserted through `insertCatalogItemToEstimateAction`.
- catalog insertion is server-owned and accepts only `estimateId` plus `catalogItemId`.
- inserted catalog items default to quantity `1.00` and then become editable estimate line snapshots.
- archived catalog items are visible in the Catalog Items panel but blocked from insertion.
- system catalog items use `insertSystemToEstimateAction`, preview measurements, then expand grouped component lines.
- line items can be imported from another same-organization estimate into draft estimates.
- the current "Add manual item" path Quick-Creates a catalog item, then inserts it into the estimate.

Important limitation:
- current catalog insertion does not accept a target group.
- current system insertion creates its own generated `groupName`.
- current previous-estimate import preserves source `groupName` values.
- current grouping is label-based on line items plus JSON workspace group definitions, not a durable `estimate_item_groups` table.

## Current Grouping Support

Existing support is enough for a UI-first group-first refactor:
- groups can be created, renamed, deleted, displayed, and saved without schema changes.
- line items can be moved between groups by changing the row's group selector.
- customer-facing output already respects `groupName`.

Existing support is not yet enough for a perfect group-targeted insertion flow:
- direct catalog insert has no `groupName` input.
- system insert has no selected destination group input and generates a system-derived group label.
- import-from-estimate has no destination group mode.
- group actions are currently global controls and row-level selectors, not group-row/card actions.

Because this plan is planning-only, the implementation phases below avoid schema changes and recommend reusing existing client-side grouping and explicit save behavior where possible before introducing any new server input.

## Target UX

The target editor should treat groups as estimate sections, not as an afterthought beside a large table.

Recommended primary Items workspace:
- top summary strip remains compact: subtotal, tax, total, save state, and show/hide internal pricing controls.
- main body is a list of group cards or rows.
- each group header shows:
  - group name
  - item count
  - group subtotal
  - primary add action
  - overflow menu for secondary actions
- each group body shows the items in that group, with editable snapshot fields that are already supported today:
  - quantity
  - unit price override
  - taxable toggle
  - assignment
  - group reassignment where needed
- ungrouped items remain visible as a cleanup bucket, but the primary empty state should encourage creating a group first.

Recommended group actions:
- Add item from cost database
- Add custom item
- Add from template/system
- Import from previous estimate
- Rename group
- Duplicate group
- Delete group

Recommended add-item interaction:
- group action opens an Add Item drawer or sheet scoped to that group.
- the drawer uses tabs or segmented source choices:
  - Cost Database
  - Template/System
  - Previous Estimate
  - Custom
- selected source rows preview name, description, unit, price, taxable flag, and source context before insertion.
- after insertion, the drawer closes or stays ready for another item, and the new estimate snapshot appears inside the selected group.

Recommended role for the current Catalog Items panel:
- do not keep it as a permanent full-width panel in the final editor.
- convert it into the Cost Database tab inside the group-scoped Add Item drawer.
- optionally keep a temporary global "Add item" entry during transition, but route the user to select or create a target group before insertion.

This avoids making the Estimate Editor feel like the place to manage the Cost Items Database. Catalog maintenance should remain in `/cost-items-database` and `/settings/catalogs`; the Estimate Editor should use catalog items as insertion sources.

## Snapshot Editing Direction

Users should continue to edit estimate item snapshots after adding. The existing editor already allows quantity, unit price override, taxable toggle, assignment, and group reassignment. The long-term UI should make this feel intentional:
- show source labels such as Cost Database, System, Previous Estimate, or Custom.
- keep catalog source and internal pricing context available to contractor users.
- never mutate the source catalog item when a draft estimate line is edited.
- never silently refresh draft lines from catalog changes.
- keep customer-facing output free of internal cost, markup, hidden markup, margin, and production math.

Future system/template insertion should include a reviewed preview step before creating lines when safe:
- select system/template
- enter measurements or required inputs
- preview generated rows and calculated quantities
- optionally edit safe fields before insertion if implementation supports it
- insert reviewed rows into the selected group as normal estimate line snapshots

## Recommended Phased Implementation

### Phase A: UI-Only Regrouping / Layout Cleanup

Goal:
- make the Items workspace group-first without changing server actions, schemas, calculations, or insertion behavior.

Recommended changes:
- move group cards/list to the top of the Items workspace.
- reduce the always-visible estimating tools area.
- keep `Add Group`, group rename, group delete, and row editing behavior on existing state.
- preserve hidden form serialization for `itemGroups` and per-line `lineItemGroupName`.
- keep existing global catalog/system/import tools available in a compact temporary area.
- rename empty-state copy so users understand groups are estimate sections.

Likely files:
- `apps/web/components/estimates/items-section.tsx`
- `apps/web/components/estimate-form.tsx` only if props/state need light reshaping

Validation:
- create, rename, and delete groups.
- assign existing rows to groups.
- save explicitly and reload to confirm groups and line group labels persist.
- confirm estimate detail and portal review still group rows correctly.
- run `pnpm typecheck` and `pnpm lint`.

### Phase B: Group-Level Add Item Action Using Existing Catalog Insertion

Goal:
- add a group-level "Add item from cost database" action while reusing the existing catalog insertion path.

Lowest-risk path without schema/action changes:
- user clicks `Add item from cost database` on a group.
- UI records the target group id locally.
- user selects an active non-system catalog item in a drawer.
- existing `insertCatalogItemToEstimateAction({ estimateId, catalogItemId })` inserts the row.
- after the server returns the updated line list, the client assigns the newly inserted row to the target group and marks the estimate dirty or triggers the existing persist path.

Tradeoff:
- this may require a follow-up explicit save after insertion to persist `group_name`.
- it preserves the current server action contract and avoids a schema change.

Cleaner later path:
- extend catalog insert input with optional `groupName`.
- server inserts the snapshot with `group_name` in one transaction.
- keep the client from sending pricing fields.

Because this is a long-term plan, the recommended implementation can start with the lowest-risk UI/client assignment path, then evaluate whether the optional `groupName` server input is worth the small action/schema change.

Likely files:
- `apps/web/components/estimates/items-section.tsx`
- `apps/web/components/estimate-form.tsx`
- optional later: `apps/web/lib/estimates/schemas.ts`
- optional later: `apps/web/lib/estimates/actions.ts`
- optional later: `apps/web/lib/estimates/data.ts`

Validation:
- insert an active catalog item from a specific group.
- reload and confirm the item remains in that group.
- confirm archived/system catalog items are still blocked from direct insertion.
- confirm inserted line fields remain editable snapshots.
- confirm same catalog item can be added more than once.

### Phase C: Add Template/System Insertion Into Selected Group

Goal:
- make system/template insertion group-scoped and review-first.

Recommended path:
- move current system preview into the group-scoped Add Item drawer under `Template/System`.
- select a system/template and enter measurements.
- preview generated rows before insertion.
- insert the generated rows into the selected group.

Important design decision:
- current system insertion generates a group name from the system and measurements.
- group-first UX should decide whether system expansion:
  - inserts into the selected existing group, or
  - creates a new system-named group as a child-like estimate section.

Recommended default:
- if the user launches from an existing group, insert generated rows into that group.
- if the user launches from "Add group from system", create a new group label from the system name and measurements.

Likely files:
- `apps/web/components/estimates/items-section.tsx`
- `apps/web/components/estimate-form.tsx`
- optional later: `apps/web/lib/estimates/schemas.ts`
- optional later: `apps/web/lib/estimates/actions.ts`
- optional later: `apps/web/lib/estimates/data.ts`
- `apps/web/lib/catalogs/system-expansion.ts` only if group-name behavior is intentionally extended

Validation:
- preview system from group action.
- insert generated rows and confirm all rows land in the intended group.
- confirm system lineage fields still exist.
- confirm quantities, totals, tax behavior, and customer-facing grouping remain unchanged except for intentional group placement.

### Phase D: Previous Estimate Item Reuse

Goal:
- let users reuse prior estimate items into a selected group instead of preserving only the source estimate's grouping.

Recommended path:
- group action opens `Previous Estimate`.
- user selects a source estimate once.
- UI shows source line items grouped by the source estimate's group labels.
- user can choose:
  - import selected rows into current group, or
  - preserve source grouping and create/match groups in the destination.

Implementation caution:
- current import function imports all importable line items from the source estimate.
- selected-row import and destination-group import may require a new action input shape.
- imported rows must remain new destination `estimate_line_items` snapshots.
- do not refresh imported rows from current catalog defaults unless a future explicit refresh workflow is designed.

Likely files:
- `apps/web/components/estimates/estimate-import-chooser.tsx`
- `apps/web/components/estimates/items-section.tsx`
- `apps/web/components/estimate-form.tsx`
- `apps/web/lib/estimates/schemas.ts`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/estimates/data.ts`

Validation:
- import rows into a selected group.
- import rows while preserving source groups.
- confirm same-organization and draft-destination guards still apply.
- confirm imported line snapshots preserve price, taxability, source lineage, and override behavior.

### Phase E: Larger Design / v0 Pass

Goal:
- turn the Estimate Editor into a cleaner production estimate workspace after the behavior is stable.

Recommended scope:
- group-first visual redesign using the shared contractor workspace language.
- compact sticky estimate summary.
- group cards with dense rows and optional expanded line-detail panels.
- add-item drawer with four source tabs.
- contextual group overflow menus.
- better mobile/tablet behavior for group cards and item editing.
- improved review flow from grouped edit state to customer-facing preview.

Do not start Phase E until Phases A and B have validated the group-first workflow using existing data and insertion behavior.

## Recommendation On Current Catalog Items Panel

Recommendation:
- convert the current Catalog Items panel into an Add Item drawer source, not a permanent full-width editor panel.

Rationale:
- catalog items should be maintained in the Cost Items Database.
- the Estimate Editor should consume reusable cost items as insertion sources.
- permanent catalog browsing makes the editor long and competes with the actual estimate groups.
- group-level actions match contractor workflow better: choose section, then add item.

Transition:
- Phase A can keep the panel visible but move it lower or collapse it.
- Phase B should introduce a group-scoped drawer.
- after group-level insertion is stable, remove the full-width panel or keep only a compact global "Add item" fallback that asks for a target group.

## Risks

- Group persistence drift: local group ids are stored in workspace JSON, while authoritative line rows store `group_name`. Renaming, deleting, and inserting into groups must keep those aligned.
- Double-save complexity: using existing catalog insertion then client-assigning the new row to a group may require a follow-up explicit save.
- Inserted-row detection: if multiple users edit the same draft estimate, client-side "new row" detection needs to avoid assigning the wrong row.
- System grouping ambiguity: system expansion currently creates a generated group label; group-first UX must choose selected group versus new system group intentionally.
- Previous-estimate import scope: selected-row or selected-group import is more complex than the current all-line import.
- UI density: group-first should shorten the editor, not hide critical pricing/tax review states.
- Invoice bleed risk: invoice catalog insertion and invoice line behavior must remain out of scope.
- Calculation risk: phases must not alter pricing, tax, discount, subtotal, total, or approved snapshot formulas.

## What Not To Touch Yet

Do not touch:
- invoices or invoice line insertion
- approved estimate snapshot lineage
- schedule of values
- estimate calculation formulas
- tax calculation behavior
- database schema or migrations
- durable group table design
- catalog item management workflows inside the Estimate Editor
- direct takeoff/AI-generated estimate lines
- customer-facing output beyond preserving existing grouped display
- mock data, local-only persistence, or placeholder estimating flows

## Follow-Up Dependencies

Before implementation, decide:
- whether Phase B may use a two-step client assignment/explicit save or should extend the server action with optional `groupName`.
- whether system insertion from a group should always use the selected group or offer "new system group" as a separate action.
- whether "custom one-off item" should remain catalog-Quick-Create-first or whether a true one-off `manual` source path should be designed separately.
- whether previous-estimate import should support selected rows before destination-group targeting.

## Suggested Validation Commands

For future implementation phases:

```bash
pnpm typecheck
pnpm lint
```

Manual validation should follow the existing QA pattern from `docs/qa-estimate-catalog-item-insertion.md` and add group-specific checks:
- group create/rename/delete persists after reload.
- add catalog item into a selected group.
- add system/template rows into a selected group.
- import prior estimate rows into a selected group.
- edit inserted snapshot quantity, unit price, taxable flag, and assignment.
- confirm estimate detail and portal estimate review group rows correctly.
- confirm no invoice, SOV, payment, or approved snapshot behavior is triggered by draft editing.
