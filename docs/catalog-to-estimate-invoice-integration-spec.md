# Catalog To Estimate And Invoice Integration Spec

Status:
- living design and implementation alignment note
- this document does not itself change code, migrations, routes, UI, tests, or behavior
- estimate-side active catalog item insertion is now partially implemented through the estimate editor Catalog Items panel
- invoice catalog insertion remains design-only and intentionally deferred

Related docs:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): canonical workflow behavior
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): implementation guardrails
- [docs/inventory-cost-item-database-plan.md](C:/FloorConnector/docs/inventory-cost-item-database-plan.md): Phase 1 cost item foundation

## Purpose

This document designs how the canonical `catalog_items` cost item database should integrate with estimate and invoice line items in future implementation work.

It preserves the current FloorConnector workflow:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The core rule is simple:

`catalog_items` provide reusable defaults. Estimate and invoice line items store immutable snapshots.

Future changes to a catalog item must not retroactively change historical estimates, approved estimate snapshots, contracts, schedule of values, change orders, invoices, payments, reports, or tax records.

## Current Baseline

Implemented today:
- `catalog_items` is the canonical organization-scoped reusable cost item database.
- `estimate_line_items` is the authoritative estimate row table.
- the estimate editor can add active non-system catalog items to `estimate_line_items` using server-owned snapshot behavior.
- archived catalog items can be visible for review but are blocked from estimate insertion.
- system catalog items continue through the existing system expansion flow.
- `invoice_line_items` stores billing snapshots.
- invoices use explicit lineage from approved estimate snapshots, selected schedule-of-values rows, approved change-order snapshots, or invoice-only adjustments.
- organization and customer tax settings already participate in estimate and invoice tax behavior.
- catalog items can carry default cost, default price, unit, taxable flag, category/type, SKU/code, and optional inventory links.

This spec does not change that baseline. It should be read as design guidance plus current-status alignment; invoice catalog insertion is not implemented.

## Design Principles

- One canonical cost item model: use `catalog_items`; do not create `contractor_cost_items` or module-specific catalog tables.
- Snapshot on use: line items copy the selected catalog values needed for commercial history.
- No retroactive mutation: changing a catalog item only affects future selections unless a user explicitly refreshes a draft line in a future reviewed workflow.
- Custom items remain possible: estimates and invoices can have one-off lines without a catalog item.
- Catalog uniqueness does not become line uniqueness: duplicate catalog names are blocked per organization, but duplicate estimate and invoice lines are allowed.
- Tenant isolation is mandatory at selection, snapshot, update, import, approval, invoicing, and reporting boundaries.
- Invoices must continue to prefer approved commercial lineage over live draft estimate or live catalog rows.

## Selection Behavior

### Estimate Editor

The estimate editor now exposes a first safe catalog item selection path for active non-system catalog items through the Catalog Items panel. The richer selection behavior below remains partly implemented and partly future work.

Recommended user flow:
1. User opens a draft estimate from project or estimate context.
2. User chooses `Add from catalog` or an equivalent catalog-backed action.
3. The picker searches active, organization-owned `catalog_items`.
4. The user can filter by item type, category, system/add-on grouping, taxable state, and optionally SKU/code.
5. The user selects one or more items.
6. The editor previews name, description, unit, default price, taxable flag, and internal cost where appropriate for contractor-only users.
7. The user enters quantity in a future richer picker, or accepts the current `1.00` default and edits quantity after insertion.
8. The system writes normal `estimate_line_items` rows with catalog snapshots.

Search should match:
- item name
- normalized name
- SKU
- cost code
- category
- description

Default filters:
- active items only
- current organization only
- item types that make sense for estimate authoring, including materials, labor, services, equipment, subcontractors, other items, systems, and add-ons/options where supported

Archived catalog items may remain visible for review in implemented estimate catalog visibility surfaces, but they should be blocked from new insertion. If a draft estimate already contains a snapshot from an archived item, the line remains valid and editable as a historical/customized snapshot.

### Invoice Editor

Invoice behavior should stay more conservative than estimate behavior because invoices are downstream billing records.

Preferred paths:
- invoice from approved estimate snapshot item
- invoice from selected schedule-of-values item
- invoice from approved change-order snapshot item
- invoice-only adjustment

Future direct catalog selection in invoices should be limited to invoice-only adjustments, not a replacement for approved estimate or SOV lineage.

Recommended user flow for invoice-only catalog-backed adjustment:
1. User opens an editable invoice.
2. User chooses `Add invoice-only adjustment`.
3. User optionally selects a catalog item as a starting default.
4. The system snapshots catalog values into a normal `invoice_line_items` row with `lineage_type = invoice_only` or the existing invoice-only equivalent.
5. The line remains an invoice snapshot and is not tied to live catalog updates.

The invoice picker should clearly distinguish:
- billable approved scope from estimate/SOV/change-order lineage
- invoice-only adjustments that may optionally start from a catalog item

Direct catalog selection should not allow bypassing approval gates for normal project scope.

## Snapshot Model

When a catalog item is selected for an estimate or invoice line, the system should copy the current catalog values into line-item snapshot fields.

Minimum snapshot values:
- name
- description
- unit
- cost
- price
- taxable flag

Recommended additional snapshot values where already supported or introduced later:
- catalog item id as source reference
- SKU/code
- item type
- category
- tax code id if advanced tax handling is active
- markup percent or hidden markup percent, if the workflow supports internal cost/margin analysis
- source system/component id when generated from a system
- snapshot timestamp or line created timestamp
- source label for deleted or archived catalog items

The source catalog item id is useful for traceability, reporting, and future "refresh from catalog" comparison. It must not mean the line is live-bound to the catalog item.

### Estimate Snapshot Flow

```text
catalog_items
  -> user selects item in draft estimate
  -> estimate_line_items copies catalog defaults
  -> user may edit quantity, description, taxable flag, or price
  -> estimate totals derive from estimate_line_items snapshots
  -> estimate approval creates approved commercial snapshot
```

### Invoice Snapshot Flow

```text
approved estimate snapshot / SOV / approved change-order snapshot
  -> invoice creation selects billable source rows
  -> invoice_line_items copy approved source snapshot values
  -> invoice totals derive from invoice_line_items snapshots
```

Optional invoice-only catalog-backed adjustment:

```text
catalog_items
  -> user selects item as invoice-only adjustment default
  -> invoice_line_items copies catalog defaults
  -> line remains invoice-only snapshot
```

## Example Lifecycle

Example item:
- catalog item: `Epoxy Flake Broadcast`
- unit: `sqft`
- default cost: `$2.25`
- default price: `$5.75`
- taxable: `true`

Lifecycle:
1. Contractor updates `Epoxy Flake Broadcast` in `catalog_items`.
2. Estimator opens a draft estimate for a project.
3. Estimator selects the catalog item and enters `1,000 sqft`.
4. The estimate line snapshots:
   - name: `Epoxy Flake Broadcast`
   - description: current catalog description
   - unit: `sqft`
   - cost: `$2.25`
   - price: `$5.75`
   - taxable: `true`
5. Estimator overrides the line price to `$5.50`.
6. The catalog item remains unchanged.
7. Customer approves the estimate.
8. Approval creates immutable approved estimate snapshot items using the estimate line values, including the override.
9. Later, the contractor changes the catalog item default price to `$6.10`.
10. The approved estimate snapshot remains at `$5.50`.
11. An invoice is created from the approved estimate snapshot or SOV.
12. The invoice line snapshots the approved source values, not the current catalog item price.
13. Reports, tax summaries, and payment balances use the invoice snapshot values.

## Custom Items

Users must be able to create one-off estimate and invoice lines without selecting a catalog item.

Custom estimate line behavior:
- `catalog_item_id` or source catalog reference may be null.
- user supplies name, description, unit, quantity, price, and taxable flag.
- cost may be optional or internal depending on permissions.
- the line participates in totals exactly like catalog-backed lines.
- the line does not create or update a catalog item unless a separate explicit "save as catalog item" workflow is later designed.

Custom invoice line behavior:
- custom rows should remain invoice-only adjustments unless they originate from approved commercial lineage.
- custom rows must not imply approved scope if they were not created from approved estimate, SOV, or change-order snapshots.
- custom invoice rows participate in invoice totals and tax according to the same invoice tax rules.

Custom lines should not be treated as data-quality errors. They are needed for allowances, credits, fees, mobilization, corrections, and job-specific exceptions.

## Duplicate Prevention

Catalog behavior:
- `catalog_items.normalized_name` should remain unique per organization where enforcement is available.
- SKU/code uniqueness should follow existing organization-scoped rules.
- the same normalized catalog item name may exist in different organizations.

Line-item behavior:
- estimate line items do not enforce unique names.
- invoice line items do not enforce unique names.
- the same catalog item may appear multiple times on the same estimate or invoice when needed.
- the same custom item name may appear multiple times.

Rationale:
- estimates often need repeated items by area, phase, room, alternate, add-on, or system group.
- invoices may need repeated billable rows across SOV draws, credits, retainage context, or adjustments.
- duplicate prevention belongs in the reusable item master, not in commercial line snapshots.

## Tax Behavior

Catalog items should provide the default item taxable flag at selection time.

Effective tax priority should remain:
1. customer exemption state
2. line taxable snapshot
3. organization or platform financial defaults and rates

Estimate behavior:
- when a catalog item is inserted, copy `catalog_items.taxable` to the estimate line taxable snapshot.
- if the customer is tax exempt, calculated tax should be zero even when the line is taxable.
- if the line snapshot is non-taxable, calculated tax should be zero.
- otherwise, use the applicable organization/platform tax settings already defined by the estimate tax workflow.

Invoice behavior:
- invoice rows should snapshot taxability from their approved source lineage or invoice-only line.
- customer exemption should be snapshotted or evaluated according to existing invoice tax behavior.
- invoice tax reporting should use invoice tax snapshots, not live catalog values.

Catalog tax changes:
- changing a catalog item's taxable flag affects future inserted lines only.
- existing draft lines should not silently change.
- approved estimates and invoices must never change because a catalog item taxable flag changed later.

Future advanced tax-code behavior should preserve the same rule: copy the relevant tax-code reference or tax behavior at line creation, then calculate and report from line/invoice snapshots.

## Pricing Behavior

### Default Price

Catalog item default price should be the starting unit price for a new catalog-backed estimate line or invoice-only adjustment.

Once inserted:
- the line owns its unit price snapshot.
- totals derive from the line snapshot and quantity.
- catalog default changes do not recalculate the line.

### Manual Override

Users should be able to override unit price on draft estimate lines and invoice-only adjustment lines where permissions allow.

Override behavior:
- override changes the line snapshot only.
- override does not mutate `catalog_items`.
- customer-facing output shows the resulting unit price and total, not internal override mechanics.
- internal edit mode may show that price differs from current catalog default if a future comparison feature is added.

### Cost And Markup

Default cost should snapshot for internal reporting, margin analysis, and future production planning. It should not appear in customer-facing estimate or invoice output.

Future markup strategies may include:
- fixed default price from catalog item
- markup percent applied to default cost
- hidden markup percent for internal profitability
- organization-level fallback markup by item type or category
- estimate-level override
- permission-gated item-level margin controls

These strategies should be documented and implemented later without changing the snapshot principle.

## Systems And Assemblies

Systems should remain catalog-backed assemblies, not a separate estimating model.

Future system selection flow:

```text
catalog_items item with type/system behavior
  -> catalog_system_components
  -> user enters measurements
  -> generated estimate line preview
  -> estimate_line_items snapshots each generated component
```

Generated component lines should snapshot:
- component catalog item name
- component description
- unit
- calculated quantity
- cost
- price
- taxable flag
- source system reference
- source component reference
- generated group label

System changes should not mutate existing generated estimate lines. Future regeneration should be explicit, reviewable, and careful around manual edits.

## Square-Foot Pricing

Square-foot pricing should use catalog and system defaults as inputs, but estimate lines remain snapshots.

Recommended behavior:
- user enters area through length x width or direct square footage.
- system calculates quantity.
- catalog item or system component provides default unit price.
- estimate line snapshots quantity, unit, price, cost, taxable flag, and source metadata.

If area changes later, the user should review recalculated quantities before overwriting generated lines. Silent recalculation risks changing customer-facing pricing without intent.

## Inventory Linkage

Inventory should remain optional operational context.

Near-term rule:
- selecting a catalog item for an estimate or invoice must not automatically consume inventory.
- inventory quantity must not drive estimate or invoice price.
- inventory availability may be shown later as informational context when adding material items.

Future inventory behavior should happen through explicit operational events, such as:
- reserve materials for job
- issue materials to job
- record waste
- return unused materials

Those events should write `inventory_transactions` and should not rewrite commercial estimate or invoice line snapshots.

## Schedule Of Values Integration

Schedule of values should continue to derive from approved estimate snapshot lineage.

Recommended flow:

```text
estimate_line_items
  -> approved estimate snapshot items
  -> schedule_of_value_items
  -> invoice_line_items
```

Catalog items may help explain the original source of estimate lines, but SOV and progress billing should use approved commercial snapshot data.

SOV rows should not read current catalog item pricing when preparing invoices.

## Data Flow Diagrams

### Catalog To Estimate To Invoice

```text
catalog_items
  reusable defaults:
  name, description, unit, cost, price, taxable
        |
        | select in draft estimate
        v
estimate_line_items
  editable commercial snapshots
        |
        | customer approval
        v
approved estimate snapshot items
  immutable commercial baseline
        |
        | contract / SOV / direct invoice lineage
        v
invoice_line_items
  billing snapshots
        |
        | payment and tax reporting
        v
payments + invoice_tax_reporting_entries
```

### Invoice-Only Adjustment

```text
catalog_items or custom user input
        |
        | optional starting default
        v
invoice_line_items
  lineage_type: invoice-only adjustment
        |
        v
invoice totals, tax snapshots, balance
```

### Custom Estimate Item

```text
custom user input
        |
        | no catalog item required
        v
estimate_line_items
  source: custom/manual
        |
        v
approved estimate snapshot if estimate is approved
```

## Edge Cases

### Catalog Item Archived After Use

Existing estimate and invoice lines remain valid. Archived items are hidden from new selection by default but can remain visible as source labels on historical lines.

### Catalog Item Deleted Later

Prefer archive over hard delete. If deletion is ever allowed, historical lines must still retain name, description, unit, cost, price, and taxable snapshots.

### Catalog Item Renamed After Estimate Approval

Approved estimate snapshots and invoice lines keep the old snapshotted name. New estimates use the new catalog name.

### Catalog Price Changes While Draft Estimate Is Open

Existing draft lines should not silently change. A future UI may show "catalog default changed" and offer an explicit refresh action for draft lines only.

### Same Catalog Item Added Twice

Allowed. The user may need separate rows for phases, rooms, alternates, or grouped systems.

### Customer Tax Exempt After Estimate Creation

Use existing tax behavior. Future implementation should be explicit about whether draft estimates recalculate exemption from current customer state while approved snapshots and invoices preserve their own tax snapshots.

### Invoice Created After Catalog Update

If invoicing from approved estimate/SOV/change-order lineage, invoice rows use approved source snapshot values, not the updated catalog item.

### Custom Invoice Credit

Allowed as invoice-only adjustment. It should not create a catalog item and should not imply approved estimate scope.

### Cross-Organization Catalog Access

Never allowed. Catalog search, source references, line creation, imports, and reports must be organization-scoped.

### Imported Estimate Lines

Imported lines should preserve their source line snapshots and become new destination estimate lines. They should not refresh from current catalog defaults unless the user explicitly chooses that later.

## Risks

- Live-binding risk: accidentally recalculating historical estimates or invoices from mutable catalog records would corrupt commercial history.
- Billing bypass risk: direct catalog-to-invoice behavior could bypass approved estimate, SOV, or change-order lineage if not limited to invoice-only adjustments.
- Tax drift risk: reading live catalog taxable flags in reports could change historical tax interpretation.
- UI ambiguity risk: users may not understand the difference between catalog defaults, draft estimate lines, approved snapshots, and invoice rows.
- Duplicate model risk: introducing a second cost item table would split reporting, permissions, inventory, and estimate logic.
- Inventory coupling risk: using stock availability to drive pricing or billing would mix operational planning with commercial records.
- Override opacity risk: allowing manual price overrides without internal visibility could make margin reporting confusing.

## Recommended Phase 2 Implementation Steps

1. Confirm existing line snapshot fields.
   - Audit `estimate_line_items`, approved estimate snapshot items, `invoice_line_items`, SOV items, and change-order snapshot items.
   - Document which required snapshot fields already exist and which would need later migration.

2. Harden estimate catalog insertion without changing calculations.
   - Ensure active organization-scoped catalog selection copies name, description, unit, cost, price, and taxable flag into `estimate_line_items`.
   - Keep existing estimate totals unchanged.

3. Add explicit source metadata where missing.
   - Prefer nullable references and snapshot fields over live joins.
   - Preserve custom lines with null catalog reference.

4. Improve estimate picker UX in the existing editor.
   - Search by name, SKU, cost code, category, and description.
   - Filter by type/category and active status.
   - Show internal cost only to authorized contractor users.

5. Add draft-only refresh comparison later.
   - Show when current catalog defaults differ from a draft estimate line.
   - Require explicit user action to refresh.
   - Never refresh approved snapshots or invoices.

6. Design invoice-only catalog-backed adjustments separately.
   - Keep approved estimate/SOV/change-order lineage as the preferred invoice path.
   - Allow catalog selection only as a starting default for invoice-only rows if product scope requires it.

7. Add focused tests around snapshot behavior.
   - catalog update does not change existing estimate lines.
   - catalog update does not change approved snapshots.
   - catalog update does not change invoice lines.
   - custom lines work without catalog references.
   - duplicate line names are allowed.

8. Extend systems and assemblies incrementally.
   - Generate normal estimate lines from catalog-backed components.
   - Snapshot component values and group metadata.
   - Defer advanced formulas and regeneration policy until separately scoped.

9. Keep inventory informational until job material workflows are scoped.
   - Do not consume inventory from estimate or invoice creation.
   - Use explicit future inventory transaction workflows.

10. Update docs after each implementation slice.
   - Keep [docs/current-state.md](C:/FloorConnector/docs/current-state.md) aligned with implemented truth.
   - Keep this spec as planning guidance until replaced by implemented behavior.

## Non-Goals

This spec does not design or implement:
- a new cost item table
- schema migrations
- changed estimate calculations
- changed invoice calculations
- direct catalog-to-invoice billing for normal project scope
- automatic inventory consumption
- customer-facing cost, markup, margin, or internal pricing output
- full System Template versioning
- takeoff or AI-generated estimate lines
- SOV recalculation from live catalog items

## Planning-Only Summary

`catalog_items` should act as the reusable source of item defaults. Estimate and invoice line items should act as immutable commercial snapshots. Custom lines remain valid. Catalog duplicate prevention stays in the item master, not in line items. Invoices should continue to rely on approved snapshot lineage, with direct catalog selection limited to carefully scoped invoice-only adjustments if implemented later.
