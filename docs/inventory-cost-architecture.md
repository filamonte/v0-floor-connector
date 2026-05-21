# Inventory And Cost Architecture

This document defines the canonical FloorConnector architecture for inventory, cost items, taxes, and commercial line-item snapshots.

## Canonical Mapping

FloorConnector already has a live reusable sellable item model in `catalog_items`.

For the current codebase, the canonical mapping is:

- `catalog_items`: reusable cost item database, sellable item master, and estimating source of truth
- `inventory_items`: optional stock-tracking extension attached to a `catalog_items` record
- `inventory_transactions`: auditable stock movement history for the linked inventory record
- `catalog_system_components`: canonical systems, packages, and component rows used by the live reusable system workflow
- `tax_codes`: organization-scoped tax definitions
- `estimate_line_items` and `invoice_line_items`: immutable snapshot rows

This preserves one shared commercial model instead of introducing a second parallel cost item entity beside the existing catalog path.

## Inventory Vs Cost Items

Inventory now belongs to the same item lifecycle, but it remains operationally distinct from commercial pricing snapshots:

- `catalog_items` carries the reusable sellable and estimating item definition
- linked `inventory_items` rows carry optional quantity-on-hand, reorder-point, and location data for that same item
- `inventory_transactions` remain the auditable quantity-change history for the linked inventory row
- the organization and platform feature policy key `inventory_enabled` controls whether inventory UI is active without deleting stored inventory data

Examples:

- `catalog_items`: Polyaspartic Clear Coat with SKU, vendor, unit cost, unit price, markup, tax behavior, photo, and notes
- linked `inventory_items`: quantity on hand, reorder point, and location for that same catalog item
- linked `inventory_transactions`: manual adjustments and future stock movement history

Inventory records must never replace estimate or invoice lines directly. Commercial records snapshot customer-facing pricing from `catalog_items`, while linked inventory tracks stock and quantity movement.

## Duplicate Prevention

Organization-scoped duplicate prevention uses canonical normalization:

- trim leading and trailing whitespace
- collapse repeated internal whitespace
- lowercase for comparison

This is stored through generated `normalized_name` and `normalized_sku` columns and enforced with organization-scoped unique indexes where applicable.

Examples treated as duplicates:

- `Epoxy Kit`
- ` epoxy kit `
- `epoxy   kit`

## Inventory Rules

`inventory_items` are organization-scoped optional extensions and soft-retained through `status` instead of destructive deletion.

Key behavior:

- `catalog_item_id` links inventory to the canonical cost item master
- one catalog item can have zero or more inventory rows across locations
- the current contractor UI uses a single `default` location
- `current_quantity` exists for operational reads
- quantity continuity should flow through `inventory_transactions`
- stock adjustments must leave an audit trail
- quantity changes should use `inventory_transactions` instead of directly editing `current_quantity`
- enabling inventory tracking from the cost item drawer creates the linked inventory row when needed

Supported transaction types:

- `purchase`
- `adjustment`
- `job_usage`
- `return`
- `waste`
- `transfer`

## Cost Item Rules

`catalog_items` are the canonical cost item database for FloorConnector.

Key behavior:

- reusable organization-scoped sellable templates
- unique normalized name per organization
- unique normalized SKU per organization when present
- optional linked inventory tracking through `inventory_items`
- default tax-code linkage through `tax_code_id`
- active/inactive lifecycle through `status`
- internal cost and markup remain contractor-only data

Customer-facing estimate and invoice output must show:

- name
- description
- quantity
- unit price
- tax
- total

Customer-facing output must not expose:

- internal cost
- markup
- margin
- inventory composition
- component-level cost structure

Pricing rule:

- estimate line items snapshot pricing from `catalog_items`
- invoice line items copy estimate snapshots
- inventory quantity is operational only and does not recompute commercial pricing

## Cost Components

FloorConnector currently treats reusable systems and packages through `catalog_system_components`.

`cost_item_components` exist as deeper internal cost-modeling foundation, but the live systems and package workflow should continue to use `catalog_system_components` unless a later pass explicitly reshapes that architecture.

Supported component types:

- `inventory`
- `labor`
- `equipment`
- `subcontractor`
- `fee`
- `other`

This allows square-foot and unit-based flooring work to model underlying cost inputs while keeping customer-facing output clean.

## Tax Snapshots

Taxes are organization-scoped through financial defaults and optional `tax_codes`, but estimate and invoice rows must snapshot the effective line behavior.

Effective tax priority is:

1. customer tax exemption on `customers.is_tax_exempt`
2. item-level taxable flag on `catalog_items.taxable`
3. organization or platform default tax rate from financial settings

The normal cost item UI should stay simple:

- item-level tax is a taxable checkbox
- tax rates live in contractor and super-admin settings
- `tax_code_id` remains optional advanced infrastructure instead of the default item workflow

Line snapshots now carry foundation fields for:

- `tax_code_id`
- `tax_rate_snapshot`
- `discount_amount`
- `line_subtotal`
- `tax_amount`

Invoice rows also carry:

- `estimate_line_item_id`

That lineage is for traceability only. Invoice rows must remain copied snapshots, not live references back to estimate rows.

## Inventory Consumption Guidance

Recommended workflow:

1. estimate creation does not consume inventory
2. estimate approval may support reservation later
3. job start, completion, or admin-confirmed usage consumes inventory
4. every inventory reduction writes `inventory_transactions`

This keeps stock movement auditable and avoids silent quantity drift.

Current implemented boundary:

- manual inventory adjustments are recorded from the cost item drawer
- estimates still source from `catalog_items`
- invoices still copy estimate snapshots
- no automatic inventory decrement happens from estimates or invoices in this phase

## FloorConnector-Specific Units

Common units the model should support cleanly:

- `sq ft`
- `linear ft`
- `each`
- `gallon`
- `pound`
- `kit`
- `hour`
- `day`

This is especially important for epoxy and concrete-coating workflows where reusable systems, material usage per square foot, and contractor margin visibility all need to coexist in one commercial chain.
