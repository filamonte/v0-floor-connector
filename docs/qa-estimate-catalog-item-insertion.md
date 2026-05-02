# QA Estimate Catalog Item Insertion

Status:
- focused QA checklist for Phase 2B estimate catalog item insertion
- no code, migrations, invoice behavior, or estimate calculation formulas are changed by this document

Related docs:
- [docs/estimate-catalog-selection-phase-2b-plan.md](C:/FloorConnector/docs/estimate-catalog-selection-phase-2b-plan.md)
- [docs/catalog-to-estimate-invoice-integration-spec.md](C:/FloorConnector/docs/catalog-to-estimate-invoice-integration-spec.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)

## Purpose

Use this checklist to verify that active `catalog_items` can be added to estimate line items from the Estimate Editoror Catalog Items panel while preserving snapshot behavior.

The expected behavior is:
- active non-system catalog items can be inserted
- archived catalog items remain visible but blocked
- system items continue through the existing system expansion flow
- inserted estimate line items snapshot catalog values and do not live-bind to later catalog edits
- invoice behavior is untouched

## Prerequisites

- A contractor user can access an organization with at least one draft estimate.
- The organization has at least:
  - one active non-system catalog item
  - one archived catalog item
  - one system catalog item, if systems are enabled in the test data
- The draft estimate is safe to edit during QA.

## Checklist

### Catalog Panel Visibility

- [ ] Open a draft Estimate Editoror page.
- [ ] Navigate to the Items workspace.
- [ ] Confirm the Catalog Items panel is visible.
- [ ] Confirm search by name still filters catalog rows.
- [ ] Confirm type/category filters still filter catalog rows.
- [ ] Confirm rows show name, type/category, unit, default price, taxable flag, and active/archived status.
- [ ] Select a catalog row and confirm the preview updates without immediately changing estimate line items.

### Active Catalog Item Insertion

- [ ] Select an active non-system catalog item.
- [ ] Confirm the preview action is enabled and labeled for adding to the estimate.
- [ ] Click the add action.
- [ ] Confirm the UI shows progress feedback while the item is being added.
- [ ] Confirm success feedback appears after insertion.
- [ ] Confirm a new estimate line item appears in the estimate items table.
- [ ] Confirm adding the same active catalog item a second time is allowed when needed.

### Archived Catalog Item Blocking

- [ ] Select an archived catalog item in the Catalog Items panel.
- [ ] Confirm the archived item remains visible for review.
- [ ] Confirm the add action is disabled or clearly blocked.
- [ ] Confirm the blocked copy explains archived items cannot be added.
- [ ] Confirm no estimate line item is created from the archived item.
- [ ] If server-action testing is available, attempt direct insertion with the archived catalog item id and confirm the server rejects it.

### System Catalog Item Behavior

- [ ] Select a system catalog item in the Catalog Items panel.
- [ ] Confirm the system item remains visible for preview.
- [ ] Confirm the direct add action is disabled or redirects users toward the existing system expansion flow.
- [ ] Confirm no direct single-line estimate item is created from the system preview action.
- [ ] Confirm the existing system expansion flow still works independently for system item generation.

### Inserted Snapshot Fields

After adding an active non-system catalog item, verify the inserted estimate line item snapshots:

- [ ] catalog item reference, where visible or inspectable
- [ ] item name
- [ ] description
- [ ] unit
- [ ] unit price/default price
- [ ] taxable flag
- [ ] supported internal cost/snapshot fields where visible or inspectable
- [ ] source type or lineage indicates catalog-backed estimate item where visible or inspectable

### Quantity And Editing

- [ ] Confirm the inserted line quantity defaults to `1.00`.
- [ ] Edit the inserted line quantity.
- [ ] Confirm the line total updates according to existing estimate behavior.
- [ ] Edit the inserted line unit price override, if the editor allows it.
- [ ] Confirm the line remains editable after insertion.
- [ ] Confirm normal group/assignment edits still work for the inserted line.

### Snapshot Immutability

- [ ] Add an active catalog item to a draft estimate.
- [ ] Record the inserted estimate line name, description, unit, price, and taxable flag.
- [ ] Change the source catalog item name, description, unit, price, or taxable flag in the catalog/admin surface.
- [ ] Return to the estimate.
- [ ] Confirm the existing estimate line item did not silently change.
- [ ] Confirm adding the catalog item again after the catalog edit uses the current catalog values for the new line only.

### Custom One-Off Line Items

- [ ] Confirm the existing custom/manual one-off estimate line item path still works as implemented.
- [ ] Confirm custom one-off line items do not require selecting a catalog item.
- [ ] Confirm custom one-off line items can still be edited after creation.
- [ ] Confirm custom one-off line items still participate in totals according to existing estimate behavior.

### Estimate Totals

- [ ] Capture the estimate subtotal, taxable subtotal, exempt subtotal, tax, discount, and total before adding a catalog item.
- [ ] Add an active catalog item from the Catalog Items panel.
- [ ] Confirm subtotal and total changes match the inserted line quantity and unit price.
- [ ] Confirm taxable/exempt totals follow the inserted line taxable snapshot and current customer tax exemption state.
- [ ] Confirm changing quantity or unit price on the inserted line updates totals according to existing estimate behavior.
- [ ] Confirm no invoice, schedule-of-values, payment, or approved snapshot behavior is triggered by the insert.

### Validation Commands

- [ ] Run `pnpm typecheck` and confirm it passes.
- [ ] Run `pnpm lint` and confirm it passes.

## Pass Criteria

Phase 2B passes QA when:
- active non-system catalog items insert into draft estimates from the Catalog Items panel
- archived catalog items are visible but blocked in the UI and rejected server-side
- system items still use the existing system expansion flow
- inserted estimate line items are snapshots, not live-bound catalog rows
- quantity defaults to `1.00`
- inserted lines remain editable through existing estimate line editing controls
- custom one-off estimate items still work
- estimate totals remain correct under existing formulas
- `pnpm typecheck` and `pnpm lint` pass

## Failure Notes

Record any failure with:
- estimate id
- catalog item id and status
- user/organization context
- before/after line item values
- before/after estimate totals
- exact UI action taken
- validation command output, if applicable
