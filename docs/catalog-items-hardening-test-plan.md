# Catalog Items Hardening Test Plan

Status: documented test plan because the repo does not currently have an automated unit/integration test harness.

This plan covers the existing canonical `catalog_items` model. It does not introduce a second cost item table and does not change estimate or invoice calculations.

## Scope

Primary code and schema under test:
- `apps/web/lib/catalogs/data.ts`
- `apps/web/lib/settings/actions.ts`
- `apps/web/lib/settings/schemas.ts`
- `supabase/migrations/20260416143000_modular_settings_platform_admin_foundation.sql`
- `supabase/migrations/20260424123000_inventory_cost_tax_foundation.sql`
- `supabase/migrations/20260424150000_catalog_item_linked_inventory.sql`

## Existing Behavior To Preserve

- `catalog_items` remains the canonical reusable cost item database.
- All catalog item reads and writes are organization-scoped by `company_id`.
- RLS policies require active company membership for select, insert, update, and delete.
- Server helpers prevent duplicate normalized catalog item names and SKUs inside one organization.
- Normalization trims whitespace, collapses repeated whitespace, and lowercases text.
- The same normalized catalog item name may exist in different organizations.
- Catalog item lifecycle uses `status = 'active' | 'archived'`.
- Archived catalog items cannot be saved as the default item.
- Estimate and invoice line items continue to snapshot selected item data; catalog updates must not mutate historical estimate or invoice rows.

## Automated Test Targets For Future Harness

When a test runner is added, add focused tests instead of broad UI tests.

### Duplicate Normalized Names Within One Organization

Setup:
- Mock or seed one organization with one existing `catalog_items` row named `Epoxy Kit`.

Action:
- Call `upsertOrganizationCatalogItem` or the server action path with name ` epoxy   kit ` for the same organization.

Expected:
- The write is rejected with `A cost item with this name already exists for the organization.`
- No second row is inserted.

### Same Normalized Name Across Different Organizations

Setup:
- Seed organization A with `Epoxy Kit`.
- Seed organization B with no matching item.

Action:
- Save ` epoxy   kit ` for organization B.

Expected:
- The write succeeds because duplicate prevention is scoped to `company_id`.
- The organization B row has its own `company_id`.

### Organization-Scoped Reads

Setup:
- Seed catalog items for organization A and organization B.
- Authenticate as a user whose active organization is organization A.

Action:
- Call `listCatalogItems`.

Expected:
- Only organization A items are returned.
- No organization B item ids, names, pricing, SKU, or tax fields are visible.

### Organization-Scoped Updates

Setup:
- Authenticate as a user in organization A.
- Prepare a catalog item id that belongs to organization B.

Action:
- Attempt to update the organization B item through `upsertOrganizationCatalogItem`.

Expected:
- No organization B row is updated.
- The helper returns an error from the scoped update/select path.

### Archived Item Rules

Setup:
- Prepare an existing active catalog item.

Action:
- Save it with `status = 'archived'` and `isDefault = true`.

Expected:
- Validation rejects the input with `Archived catalog items cannot be the default.`

Action:
- Save it with `status = 'archived'` and `isDefault = false`.

Expected:
- The row is archived without changing estimate or invoice line item snapshots.

## Manual SQL Checks

Run the read-only duplicate report in:

`scripts/catalog-items-duplicate-normalized-name-report.sql`

Expected:
- The first result set returns duplicate normalized names grouped by organization.
- The second result set returns the affected row details for cleanup planning.
- The script does not update, delete, or archive any rows.

## Deferred Test Harness Recommendation

If/when automated testing is introduced, prefer a small integration-test layer around server data helpers and a disposable Supabase database. Avoid browser-driven tests for duplicate catalog item rules unless the UI itself is being changed.
