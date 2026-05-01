# Inventory / Cost Item Database Phase 1 Plan

Status: Phase 1 audit and implementation alignment.

This document records the safe Phase 1 foundation for the Inventory / Cost Item Database system. It should be read with:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/inventory-cost-architecture.md](C:/FloorConnector/docs/inventory-cost-architecture.md)

## Decision

Do not introduce a new `contractor_cost_items` table.

The current codebase already uses `catalog_items` as the canonical reusable cost item database. Phase 1 should preserve that model and treat `inventory_items` as an optional operational stock extension linked back to catalog items.

Canonical mapping:
- `catalog_items`: reusable cost items, sellable item master, estimate insertion source, and system component source.
- `inventory_items`: optional stock tracking for catalog-backed or standalone inventory rows.
- `inventory_transactions`: auditable stock movement records.
- `catalog_system_components`: reusable systems/packages built from catalog items.
- `estimate_line_items`: editable estimate pricing snapshots.
- `invoice_line_items`: billing snapshots sourced from approved estimate snapshots, SOV rows, change-order snapshots, or invoice-only adjustments.

## Phase 1 Audit

### Products / Catalog

Implemented foundation:
- Organization-scoped `catalog_items`.
- Item types: `material`, `labor`, `service`, `equipment`, `subcontractor`, `other`, and `system`.
- Unit field: `unit`.
- Cost and price fields: `default_unit_cost`, `default_unit_price`.
- Internal markup fields: `markup_percent`, `hidden_markup_percent`.
- Taxable flag: `taxable`.
- Optional tax-code reference: `tax_code_id`.
- SKU/code support: `sku` and `cost_code`.
- Optional vendor reference: `vendor_id`.
- Description and internal notes.
- Active/archive status through existing `document_template_status`.
- Created/updated audit fields.
- Organization-scoped duplicate checks for normalized name and SKU in server helpers, with database indexes where migration conditions allow.

The existing type name `subcontractor` is preserved instead of renaming to `subcontract`, because changing the enum would affect existing UI, seed data, and workflow code.

### Inventory

Implemented foundation:
- Organization-scoped `inventory_items`.
- Optional `catalog_item_id` link to the canonical cost item.
- Location field with current UI using `default`.
- Quantity-on-hand, reorder point, default unit cost, taxable flag, status, and audit fields.
- Organization-scoped `inventory_transactions` for stock movements.
- Transaction types: `purchase`, `adjustment`, `job_usage`, `return`, `waste`, and `transfer`.
- Inventory enablement is controlled by the organization/platform feature policy key `inventory_enabled`.

Inventory remains operational context only. It does not drive estimate or invoice calculations in Phase 1.

### Estimates

Implemented foundation:
- `estimate_line_items` is the authoritative estimate item-row table.
- Estimate authoring can insert active non-system catalog items from the estimate editor Catalog Items panel.
- Inserted catalog items are written through server-owned snapshot behavior onto `estimate_line_items`.
- Archived catalog items can remain visible for review but are blocked from insertion.
- Estimate systems expand from `catalog_system_components` into normal estimate line items.
- Line items snapshot customer-facing quantity, unit, unit price, line subtotal/total, taxability/tax fields, and source metadata.
- Existing estimate calculations are preserved.

Phase 1 boundary:
- Do not change estimate calculations.
- Do not make historical estimates recalculate when catalog items change.
- Do not replace current estimate insertion behavior with a separate cost-item model or picker silo.

### Invoices

Implemented foundation:
- `invoice_line_items` stores invoice pricing snapshots.
- Invoice rows follow explicit lineage from approved estimate snapshots, SOV rows, approved change-order snapshots, or invoice-only adjustments.
- Invoice tax, retainage, balance, and payment recalculation logic already exists.

Phase 1 boundary:
- Do not change invoice calculations.
- Do not wire inventory consumption to invoices.
- Do not use live catalog or estimate rows as billing truth.

### Tax

Implemented foundation:
- Organization financial settings define default tax behavior and rates.
- Customers carry tax exemption state.
- Catalog items carry a simple `taxable` flag.
- Optional `tax_codes` exist as advanced organization-scoped infrastructure.
- Estimate and invoice rows carry tax snapshot fields.

Effective tax priority remains:
1. customer exemption,
2. item taxable flag,
3. organization/platform financial defaults.

## Phase 1 Implementation Status

Already implemented in the current branch:
- Cost item foundation on `catalog_items`.
- Optional linked inventory foundation on `inventory_items`.
- Inventory transaction audit foundation.
- Tax-code foundation.
- Server-side catalog/inventory helpers in `apps/web/lib/catalogs/data.ts`.
- Cost Items Database data loader in `apps/web/lib/cost-items-database/module-data.ts`.
- Contractor workspace routes:
  - `/cost-items-database`
  - `/cost-items-database/items`
  - `/cost-items-database/inventory`
  - `/cost-items-database/systems`
  - `/cost-items-database/settings` redirecting to `/settings/catalogs`
- Settings surface at `/settings/catalogs`.
- Shared TypeScript interfaces in `packages/types/src/index.ts`.

No new migration is required for this pass because the Phase 1 schema already exists in:
- `supabase/migrations/20260424123000_inventory_cost_tax_foundation.sql`
- `supabase/migrations/20260424150000_catalog_item_linked_inventory.sql`

## Safety Boundaries

Phase 1 intentionally does not:
- add a second cost item table,
- change estimate calculations,
- change invoice calculations,
- automatically consume inventory from estimates or invoices,
- mutate historical estimate or invoice snapshots after catalog updates,
- introduce manufacturer fields until product/vendor modeling is explicitly scoped,
- add new import/export workflows beyond settings placeholders,
- change customer-facing estimate or invoice output.

## Next Safe Tasks

Recommended follow-up tasks:
- Add a cleanup/reporting script for any pre-existing duplicate `catalog_items.normalized_name` rows before enforcing a guaranteed unique index in every environment.
- Decide whether `manufacturer` belongs on `catalog_items`, `vendors`, or a future vendor-product extension before adding schema.
- Add focused tests around duplicate item handling, organization scoping, and inventory transaction quantity updates.
- Continue QA and hardening for estimate catalog insertion only through existing `catalog_items` and line-item snapshot behavior.
- Later, design inventory consumption from job usage with explicit user confirmation and `inventory_transactions`.
