# Estimate Catalog Selection Phase 2B Plan

Status:
- planning document retained for implementation context
- Phase 2B has since been implemented in the app: active non-system catalog items can be added from the Estimate Editoror Catalog Items panel through server-owned snapshot behavior
- this document does not itself change code, migrations, UI behavior, estimate calculations, invoice behavior, or tests
- invoice catalog insertion remains out of scope

Related docs:
- [docs/catalog-to-estimate-invoice-integration-spec.md](C:/FloorConnector/docs/catalog-to-estimate-invoice-integration-spec.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)

## Goal

Phase 2B turned the Estimate Editoror `Catalog Items` panel into a safe catalog-backed estimate item insertion surface.

The implementation should reuse the existing estimate catalog insertion path wherever possible:

```text
Catalog Items panel
  -> selected active catalog item id
  -> EstimateForm insert handler
  -> insertCatalogItemToEstimateAction
  -> insertCatalogItemToEstimate
  -> buildCatalogItemPricingSnapshot
  -> estimate_line_items snapshot row
  -> reload/sync Estimate Editoror line items
```

It must not make estimate rows live-bound to `catalog_items`. The estimate line item remains the commercial snapshot.

## Pre-Implementation Editor Review

The panel lives in [apps/web/components/estimates/items-section.tsx](C:/FloorConnector/apps/web/components/estimates/items-section.tsx). The notes below describe the pre-implementation state that Phase 2B changed.

Pre-implementation behavior:
- receives `catalogItemsForReview`, which includes the full organization-scoped catalog item list for visibility
- falls back to `visibleCatalogItems` when no review list is provided
- supports search by name plus category, SKU, and cost code
- supports type and category filters
- displays name, type/category, unit, default price, taxable flag, and active/archived status
- selecting a row only sets `selectedCatalogPreviewId`
- preview action was intentionally disabled with `Add to estimate (coming soon)`

The Estimate Editoror already has a separate active catalog insertion flow in the same component:
- `visibleCatalogItems` is passed from [apps/web/components/estimate-form.tsx](C:/FloorConnector/apps/web/components/estimate-form.tsx) as active-only catalog items
- `directCatalogItems` excludes `system` items
- `onAddCatalogItem` inserts the selected active catalog item
- `onQuickAddCatalogItem(catalogItemId)` inserts quick matched active catalog items
- Quick-Created catalog items are created and then inserted through the same server path

This means Phase 2B was not a new estimating engine. It was a safe UI bridge from the visibility panel to the existing insertion path, plus one server-side hardening check.

## Exact Hook Point

The safest hook is the disabled preview action in `ItemsSection`.

Recommended UI hook:
- keep row click as preview-only selection
- enable the preview button only when the selected preview item is:
  - `status === "active"`
  - `itemType !== "system"`
- call a parent-owned insertion callback with only the selected catalog item id
- keep archived and system rows visible but not insertable from this direct-item CTA

Recommended prop shape:

```ts
onAddPreviewCatalogItem: (catalogItemId: string) => void;
```

Equivalent low-change option:
- reuse `onQuickAddCatalogItem(selectedCatalogPreviewItem.id)` directly from the preview button
- only do this after guarding that the selected preview item is active and not a system

The parent hook belongs in `EstimateForm`, beside the existing handlers:
- `insertCatalogItem(catalogItem)`
- `handleAddCatalogItem()`
- `handleQuickAddCatalogItem(catalogItemId)`

The handler should look up the id from active `filteredCatalogItems`, not from the full `catalogInventoryItems`, because `catalogItemsForReview` can include archived items. It should then call the existing `insertCatalogItem(catalogItem)` helper.

## Server Path To Reuse

The existing server action is already the right boundary:
- [apps/web/lib/estimates/actions.ts](C:/FloorConnector/apps/web/lib/estimates/actions.ts) exposes `insertCatalogItemToEstimateAction`
- [apps/web/lib/estimates/schemas.ts](C:/FloorConnector/apps/web/lib/estimates/schemas.ts) accepts only `{ estimateId, catalogItemId }`
- the schema rejects client-owned pricing, row arrays, and override payloads
- [apps/web/lib/estimates/data.ts](C:/FloorConnector/apps/web/lib/estimates/data.ts) loads the catalog item in the current organization and creates the snapshot server-side

Keep that boundary. The client must not send name, description, cost, price, taxable flag, markup, totals, or row arrays when adding from the panel.

## Snapshot Fields

When a catalog item is inserted, the estimate line item should snapshot the same fields already produced by `buildCatalogItemPricingSnapshot` and persisted by the estimate line-item row builder.

Required commercial source and display snapshot:
- `catalogItemId`
- `sourceType = "catalog_item"`
- `sourceSystemId = null`
- `sourceComponentId = null`
- `itemType`
- `name`
- `description`
- `quantity`
- `unit`
- `unitPrice`
- `lineTotal`
- `taxable`

Internal pricing and reporting snapshot:
- `baseUnitCost`
- `baseUnitPrice`
- `markupPercent`
- `hiddenMarkupPercent`
- `unitPriceBeforeHiddenMarkup`
- `visibleMarkupAmount`
- `hiddenMarkupAmount`
- `costCode`
- `taxCodeId`
- `taxRateSnapshot`
- `discountAmount`
- `lineSubtotal`
- `taxAmount`
- `groupName`
- `assignedTo`
- `sortOrder`

Minimum catalog values that must be snapshotted for the user-facing rule:
- name
- description
- unit
- cost
- price
- taxable flag

The existing implementation snapshots these through server-side pricing helpers. Phase 2B should not duplicate that logic in the client.

## Schema Decision

Phase 2B can be code-only.

The existing estimate line-item model already includes catalog reference and snapshot fields:
- `catalog_item_id`
- `source_type`
- `source_system_id`
- `source_component_id`
- `item_type`
- `name`
- `description`
- `quantity`
- `unit`
- `base_unit_cost`
- `base_unit_price`
- `markup_percent`
- `hidden_markup_percent`
- `unit_price_before_hidden_markup`
- `visible_markup_amount`
- `hidden_markup_amount`
- `unit_price`
- `taxable`
- `tax_code_id`
- `tax_rate_snapshot`
- `discount_amount`
- `line_subtotal`
- `tax_amount`
- `cost_code`
- `group_name`
- `assigned_to`
- `line_total`

Relevant existing migrations:
- `20260423190000_shared_commercial_engine_foundation.sql` added catalog/source fields and core pricing snapshot fields to `estimate_line_items`
- `20260424003000_commercial_snapshot_enforcement.sql` added new-row source lineage constraints
- `20260424123000_inventory_cost_tax_foundation.sql` added estimate line tax snapshot fields
- `20260425143000_approved_estimate_snapshot_foundation.sql` carries estimate line snapshots into approved commercial snapshot items

No migration is needed to add catalog item selection from the panel.

A later migration would only be needed if product decides estimate line items must additionally snapshot fields that are not currently stored, such as category label, SKU, manufacturer, vendor, or a dedicated catalog snapshot timestamp. Those are not required for Phase 2B.

## Smallest Safe Implementation Path

This was the recommended implementation path for Phase 2B and now describes the implemented shape at a high level.

1. Keep the panel visibility behavior unchanged.
   - Continue showing active and archived organization-scoped catalog items for review.
   - Continue search and type/category filtering.

2. Add an insert callback for the selected preview item.
   - Enable the current `Add to estimate (coming soon)` button for active non-system items.
   - Rename it to `Add to estimate`.
   - Keep archived items disabled with clear copy such as `Archived items cannot be added`.
   - Keep system items disabled with clear copy such as `Use system expansion to add systems`.

3. Reuse existing estimate insertion logic.
   - In `EstimateForm`, route the preview callback to the same `insertCatalogItem(catalogItem)` helper used by `handleQuickAddCatalogItem`.
   - Look up the id in `filteredCatalogItems`, not `catalogInventoryItems`, so archived items cannot be inserted from the panel.
   - Do not add quantity input in Phase 2B. Current server insertion defaults quantity to `1.00`, and the existing line editor already lets users adjust quantity after insertion.

4. Add server-side active-status enforcement.
   - `insertCatalogItemToEstimate` already rejects missing catalog items and `system` items.
   - It should also reject `catalogItem.status !== "active"` before creating a snapshot.
   - This is code-only hardening and protects direct server-action calls, not just the UI.

5. Leave calculations untouched.
   - The existing snapshot helper and line-item insert path should keep deriving price, tax snapshot, line subtotal, tax amount, and line total.
   - Do not change estimate total formulas.
   - Do not change invoice behavior.

6. Preserve custom and imported line behavior.
   - Do not add catalog uniqueness rules to estimate line items.
   - Do not prevent the same catalog item from being added multiple times.
   - Do not remove existing import-from-estimate or system expansion behavior.

7. Update docs after implementation.
   - `docs/current-state.md` should only be updated after the Phase 2B code lands.
   - `docs/chat-handoff.md` should summarize the exact implementation and validation result.

## Files Likely To Change

Likely code files for Phase 2B implementation:
- [apps/web/components/estimates/items-section.tsx](C:/FloorConnector/apps/web/components/estimates/items-section.tsx)
  - enable the preview CTA for active direct catalog items
  - add or reuse an insertion callback
  - add disabled-state copy for archived/system preview items
- [apps/web/components/estimate-form.tsx](C:/FloorConnector/apps/web/components/estimate-form.tsx)
  - pass the insertion handler into `ItemsSection`
  - reuse `handleQuickAddCatalogItem` or add a small wrapper beside it
- [apps/web/lib/estimates/data.ts](C:/FloorConnector/apps/web/lib/estimates/data.ts)
  - reject archived/inactive catalog items inside `insertCatalogItemToEstimate`

Possible but probably unnecessary:
- [apps/web/lib/estimates/actions.ts](C:/FloorConnector/apps/web/lib/estimates/actions.ts)
  - only if error copy needs to be normalized
- [apps/web/lib/estimates/schemas.ts](C:/FloorConnector/apps/web/lib/estimates/schemas.ts)
  - only if a future implementation accepts quantity; the smallest Phase 2B should not

Documentation likely to update during implementation:
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md), after the code is implemented

## Validation Commands

Run after the implementation slice:

```bash
pnpm typecheck
pnpm lint
```

Recommended optional smoke checks after validation:
- open a draft Estimate Editoror page
- search the Catalog Items panel
- preview an active non-system catalog item
- add it to the estimate
- confirm the inserted line appears with snapshot cost/price/tax fields
- confirm archived items remain visible but cannot be inserted
- confirm system items still use the system expansion flow

## Edge Cases

Archived item selected:
- keep preview visible
- disable insertion
- server should reject insertion if called directly

System item selected:
- keep preview visible
- disable direct insertion
- direct users to the existing system expansion flow

Catalog item updated after insertion:
- no existing estimate line should change automatically
- the inserted line owns its snapshot

Same catalog item added multiple times:
- allowed
- estimate line items do not enforce uniqueness

Dirty estimate before insertion:
- preserve existing behavior where `insertCatalogItem` persists dirty state before calling the insert action
- if the save fails, do not insert the catalog item

Catalog item deleted or unavailable after preview:
- server insert should return an error
- the client should show the existing save error message behavior

Customer tax exempt:
- preserve existing tax calculation behavior
- the catalog taxable flag seeds the line snapshot, while customer exemption continues to affect computed tax

## Risks And Guardrails

Risk: using the full review list for insertion could allow archived items.
- Guardrail: look up insertable items from active `filteredCatalogItems` and harden the server.

Risk: client sends pricing or tax snapshots.
- Guardrail: keep the current `{ estimateId, catalogItemId }` action payload only.

Risk: direct panel insertion duplicates the existing add-from-catalog control.
- Guardrail: Phase 2B should enable the panel without removing the existing insertion control. Later UX cleanup can consolidate duplicate controls after validation.

Risk: systems bypass quantity/formula expansion.
- Guardrail: keep system rows non-insertable from the direct catalog CTA.

Risk: invoices accidentally enter scope.
- Guardrail: do not change invoice UI, invoice data loaders, invoice actions, SOV lineage, or approved snapshot invoice creation.

## Phase 2B Outcome

Phase 2B proceeded as a small code-only implementation.

The repo already had the necessary estimate line-item schema, source lineage fields, snapshot pricing helper, server action, and UI parent handler. Phase 2B bridged the Catalog Items panel CTA into that existing server-owned path and added active-item enforcement on the server. No migration was needed for this phase.
