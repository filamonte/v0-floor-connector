# Estimate Import Plan

Status:
- line-item import from another estimate is now implemented for same-organization source estimates into `draft` destination estimates only
- reusable content import from another estimate is now also implemented for same-organization source estimates into `draft` destination estimates only
- project-details/context import and broader import tooling remain future work

## Purpose
Plan the first real "import from another estimate" feature without breaking canonical estimate snapshots, SOV lineage, contract generation, or invoice rules.

This plan assumes the current FloorConnector guardrails remain in force:
- imported rows become new line items on the destination estimate
- imported content appends into the destination Estimate Workspace
- no downstream billing, SOV, contract, or invoice records are created by import
- no source estimate is mutated
- no customer or project continuity is reassigned through import

## Current Relevant Files And Helpers

### Docs and guardrails
- [docs/current-state.md](/C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](/C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](/C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](/C:/FloorConnector/docs/chat-handoff.md)
- [docs/floorconnector-ui-build-rules.md](/C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/lead-to-invoice-ux-audit.md](/C:/FloorConnector/docs/lead-to-invoice-ux-audit.md)

### Estimate schema and workspace content
- [apps/web/lib/estimates/schemas.ts](/C:/FloorConnector/apps/web/lib/estimates/schemas.ts)
  - `estimateWorkspaceContentInputSchema`
  - `estimateLineItemInputSchema`
  - `estimateInputSchema`
- [apps/web/lib/estimates/workspace.ts](/C:/FloorConnector/apps/web/lib/estimates/workspace.ts)
  - `normalizeEstimateWorkspaceContent(...)`
  - `hasMeaningfulEstimateWorkspaceContent(...)`
  - `applyEstimateWorkspaceDefaults(...)`
  - defaults only hydrate empty Estimate Workspaces

### Estimate loading and persistence
- [apps/web/lib/estimates/data.ts](/C:/FloorConnector/apps/web/lib/estimates/data.ts)
  - `getEstimateById(...)`
  - `updateEstimate(...)`
  - `replaceEstimateLineItems(...)`
  - `appendEstimateLineItemSnapshots(...)`
  - `seedEstimateLineItemsFromSources(...)`
  - `buildEstimateLineInsertRows(...)`
  - `insertCatalogItemToEstimate(...)`
  - `insertSystemToEstimate(...)`
- [apps/web/lib/estimates/actions.ts](/C:/FloorConnector/apps/web/lib/estimates/actions.ts)
  - estimate form parsing and autosave actions
  - `insertCatalogItemToEstimateAction(...)`
  - `insertSystemToEstimateAction(...)`
  - `openOrCreateScheduleOfValuesAction(...)`

### Estimate Editor UI
- [apps/web/app/(app)/estimates/[estimateId]/edit/page.tsx](/C:/FloorConnector/apps/web/app/(app)/estimates/[estimateId]/edit/page.tsx)
- [apps/web/components/estimate-form.tsx](/C:/FloorConnector/apps/web/components/estimate-form.tsx)
- [apps/web/components/estimates/items-section.tsx](/C:/FloorConnector/apps/web/components/estimates/items-section.tsx)
- [apps/web/components/estimates/reusable-content-inserter.tsx](/C:/FloorConnector/apps/web/components/estimates/reusable-content-inserter.tsx)
- [apps/web/components/estimates/scope-of-work.tsx](/C:/FloorConnector/apps/web/components/estimates/scope-of-work.tsx)
- [apps/web/components/estimates/terms-editor.tsx](/C:/FloorConnector/apps/web/components/estimates/terms-editor.tsx)

### Reusable content and defaults
- [apps/web/components/catalog-manager/content-block-manager.tsx](/C:/FloorConnector/apps/web/components/catalog-manager/content-block-manager.tsx)
- [apps/web/app/(app)/settings/workflows/page.tsx](/C:/FloorConnector/apps/web/app/(app)/settings/workflows/page.tsx)
- [apps/web/app/(super-admin)/super-admin/platform/page.tsx](/C:/FloorConnector/apps/web/app/(super-admin)/super-admin/platform/page.tsx)

### Approval, SOV, and downstream lineage
- [apps/web/lib/estimates/approval-orchestration.ts](/C:/FloorConnector/apps/web/lib/estimates/approval-orchestration.ts)
  - approved estimate snapshot and contract readiness depend on approved estimate content
- [apps/web/lib/progress-billing/data.ts](/C:/FloorConnector/apps/web/lib/progress-billing/data.ts)
  - progress billing rows require `estimate_snapshot_item` or `change_order_snapshot_item` lineage

## Current System Facts That Shape The Import Design
- `estimate_line_items` are the live estimating rows and are seeded from canonical source records.
- `estimateLineItemInputSchema` requires every imported row to reference a `catalogItemId`.
- system-derived estimate rows also require `sourceSystemId` and `sourceComponentId`.
- estimate content fields already exist for:
  - `scopeSummaryHtml`
  - `scopeItems`
  - `termsHtml`
  - `inclusionsHtml`
  - `exclusionsHtml`
  - `notesHtml`
- reusable content blocks already append into the current Estimate Workspace.
- workflow defaults only prefill when the destination estimate content is effectively empty.
- approved estimate downstream workflows depend on immutable approved snapshot lineage, not on the live Estimate Editoror rows.
- progress billing explicitly requires source estimate snapshot lineage and cannot bill from imported live rows alone.

## Safest Import Rules

### Source estimate eligibility
The source estimate should:
- belong to the same organization
- remain read-only during import
- be selectable regardless of status for content preview, but import should prefer draft, sent, approved, or rejected estimates from the same tenant
- never be allowed to cross tenant boundaries

### Destination estimate eligibility
The destination estimate should:
- belong to the same organization
- stay attached to its existing opportunity, customer, and project
- only allow import when the estimate is still editable in the current workflow

Recommended first-pass rule:
- allow import into `draft` estimates only

Reason:
- current `updateEstimate(...)` does not itself block approved Estimate Editors
- import is a bulk workspace mutation, so the feature should add a stricter import-specific rule instead of assuming the edit surface already protects approved records
- limiting first pass to `draft` keeps import clearly upstream of customer approval, contract generation, SOV creation, and invoice creation

### Imported line-item rule
Imported estimate rows must:
- become fresh destination `estimate_line_items`
- be reseeded through the existing canonical source path, not copied as downstream financial truth
- preserve their source catalog item linkage
- preserve system component lineage only if the source row already has valid system lineage and the helper path supports reseeding it safely
- receive new destination sort order positions
- receive new destination row keys in the editor state

They must not:
- copy snapshot ids
- copy SOV ids
- copy invoice lineage
- copy downstream billing state
- rewrite destination customer, project, tax profile, or approval state

## Exactly What Can Be Imported Now

### Line items: yes, with limits
Can import now:
- catalog-backed estimate rows that already have valid `catalogItemId`
- system-component estimate rows only if they still satisfy the current `sourceSystemId` and `sourceComponentId` requirements
- quantities
- group names
- assignment labels if they are plain estimate-row metadata

Should be imported as:
- a new batch of destination estimate line items appended after existing rows
- live estimate rows only, using the same source reseeding logic as existing estimate insertion

### Reusable estimate content: yes
Can import now by appending into destination content fields:
- `Scope / SOW`
  - `scopeSummaryHtml`
  - `scopeItems`
- `Terms`
  - `termsHtml`
- `Inclusions`
  - `inclusionsHtml`
- `Exclusions`
  - `exclusionsHtml`

Recommended import behavior:
- append content into the destination estimate, never overwrite by default
- keep section-by-section selection so the user can import only what they want
- if the source section is empty, disable that section in the import preview

### Project details/context: partially, only where safe
Can import now:
- estimate-specific descriptive context that already lives inside the Estimate Workspace and does not reassign continuity
- safe examples: `projectType`, `sector`, estimate-level notes, and display-only scope context if already modeled on the estimate

Should remain out of first pass:
- project identity
- customer identity
- service address reassignment
- opportunity linkage
- anything that would effectively "move" the destination estimate into the source project/customer continuity

Recommended first-pass rule:
- do not import project details/context automatically
- optionally support a later narrow checkbox group for safe estimate-local fields after the core line-item/content path is stable

## Out Of Scope For First Implementation
- cross-organization import
- import into approved estimates
- import into sent estimates
- import into rejected estimates
- project reassignment
- customer reassignment
- opportunity reassignment
- service-address replacement
- invoice creation
- SOV creation
- contract generation
- payment or billing mutations
- change-order lineage
- source estimate mutation
- import of attachments
- import of comments, customer events, or approval events
- import of portal recipients
- import of project-details fields beyond a very small safe estimate-local subset
- any schema change unless implementation proves current helpers cannot represent the import action cleanly

## Proposed Source Estimate Selection UX

### Placement
Use the existing Estimate Editoror item/tool cluster. Do not create a new page or layout.

Recommended UI:
- keep `Import from another estimate` inside the existing estimate builder insertion tool cluster
- open a lightweight in-place selector or existing-pattern panel within the current Estimate Editoror Workspace
- do not introduce a new full-page chooser flow

### Selection flow
1. User clicks `Import from another estimate`.
2. User searches or selects another estimate from the same organization.
3. UI shows a compact source summary:
   - estimate reference
   - title
   - customer name
   - project name
   - status
   - updated date
4. UI shows import choices:
   - line items
   - Scope / SOW
   - Terms
   - Inclusions
   - Exclusions
   - project details/context
5. UI shows a short safety summary:
   - imports create new estimate rows only
   - no invoices or SOV rows are created
   - source estimate stays unchanged
6. User confirms import.

Current implemented UX:
- one shared source-estimate chooser now lives in the estimating tools area
- the user selects a source estimate once, then can run:
  - `Import line items`
  - `Import Scope / SOW`
  - `Import Terms`
  - `Import Inclusions`
  - `Import Exclusions`
- reusable-content block insertion still stays in the existing reusable-content area

### Filtering recommendations
Recommended first-pass source list filters:
- same organization only
- exclude the current estimate
- sort by most recently updated
- support search by reference number, title, customer, or project

Optional UI nicety for later:
- "recent estimates" shortcut group

## Proposed Line Item Import Behavior

### Server behavior
Recommended first implementation seam:
- new dedicated server action for estimate-to-estimate import
- server action loads the source estimate within tenant scope
- server action loads source line items
- server action transforms source line items into fresh `EstimateLineItemInput[]`
- server action calls the same canonical seeding and append path used by current insert actions

Recommended helper direction:
- reuse `appendEstimateLineItemSnapshots(...)`
- reuse `seedEstimateLineItemsFromSources(...)`
- avoid any direct copy of `estimate_line_items` database rows

### Field mapping
Import these source row fields into a fresh destination input:
- `catalogItemId`
- `sourceType`
- `sourceSystemId`
- `sourceComponentId`
- `quantity`
- `assignedTo`
- `groupName`

Do not import:
- source row database id
- source estimate id
- source row sort order as authoritative truth
- approved snapshot item ids
- SOV lineage ids
- invoice lineage ids

### Append behavior
Recommended first-pass behavior:
- append imported rows after existing destination rows
- do not replace current destination line items
- return the refreshed destination line-item list to the editor, matching current insert action behavior

## Proposed Reusable Content Import Behavior

### Shared rules
- import operates on existing Estimate Workspace content only
- import appends into the destination estimate
- defaults continue to apply only to empty estimates before import, never as part of the import action
- the destination keeps its current content unless the user chooses a section to append

### Section behavior
Scope / SOW:
- append `scopeSummaryHtml`
- append `scopeItems` as new destination scope items with fresh local ids and sort order

Terms:
- append `termsHtml`

Inclusions:
- append `inclusionsHtml`

Exclusions:
- append `exclusionsHtml`

Project details/context:
- leave out of first pass unless implementation limits it to a clearly safe estimate-local subset

### Formatting rule
When appending rich text:
- preserve HTML structure where possible
- insert a consistent separator between non-empty destination and source content
- avoid double separators when either side is empty

## Validation And Error Handling

### Validation rules
- destination estimate must exist in the current organization
- source estimate must exist in the current organization
- source estimate id cannot equal destination estimate id
- destination status must be import-eligible
- at least one import section must be selected
- line-item imports must resolve to valid `EstimateLineItemInput[]`
- every imported line item must still resolve to an active canonical source path or fail clearly

### Recommended error cases
- source estimate not found
- source estimate belongs to another organization
- source estimate has no importable line items or content in the selected sections
- destination estimate is not editable for import
- one or more source rows no longer resolve to a valid catalog item or system component
- optimistic concurrency conflict if destination changed during import

### Recommended response behavior
- fail the import as a unit on server validation errors
- return human-readable estimating language
- do not partially create invoices, SOV items, or snapshots under any failure mode

## Architecture Risks

### Risk: copying the wrong truth layer
If import copies approved snapshot rows, SOV rows, or invoice rows, the platform would violate the canonical lineage model.

Mitigation:
- only import through live Estimate Editoror inputs and canonical source seeding helpers

### Risk: importing stale or deleted source references
Older estimates may reference catalog items or system components that no longer resolve cleanly.

Mitigation:
- validate every source row through the current seeding helpers
- block import with a precise row-level error summary when a source cannot be reseeded

### Risk: accidental continuity reassignment
Project/customer fields from the source estimate could make the destination estimate appear to move across continuity.

Mitigation:
- keep customer/project/opportunity continuity out of scope
- treat project details/context as opt-in later work only

### Risk: approved-estimate mutation
Import into approved estimates could silently desync the live editor from downstream approved snapshot expectations.

Mitigation:
- first pass allows import into `draft` estimates only

### Risk: UX implying downstream billing behavior
If the UI says "copy estimate items" without context, users may assume billing or SOV is also copied.

Mitigation:
- state explicitly that import creates new estimate rows only
- state explicitly that billing and SOV still happen later through approval and billing workflows

## Recommended Implementation Phases

### Phase 1
Add a disabled but fully specified `Import from another estimate` action inside the existing estimate tool cluster with the final copy and safety language.

### Phase 2
Implement source estimate search/select inside the existing Estimate Editoror Workspace using same-tenant estimates only.

### Phase 3
Implemented: line-item import only:
- draft destination estimates only
- append-only behavior
- catalog-backed and valid system-component rows only

### Phase 4
Implemented: reusable content import:
- Scope / SOW
- Terms
- Inclusions
- Exclusions

### Phase 5
Evaluate a narrow estimate-local project-context import subset only if product still wants it and the field list is explicitly approved.

## Recommended First Implementation Pass
Build the real server-safe line-item import path first, not project-details import.

Why this first:
- it unlocks the biggest estimating speed gain
- it can reuse existing canonical line-item seeding helpers
- it stays clearly upstream of approval, SOV, contract, and invoice lineage
- it avoids schema work if current helpers are sufficient

## First Implementation Pass Prompt
```text
You are continuing FloorConnector after the estimate import plan.

Read first:
- docs/current-state.md
- docs/workflows.md
- docs/developer-source-of-truth.md
- docs/chat-handoff.md
- docs/floorconnector-ui-build-rules.md
- docs/estimate-import-plan.md

Task:
Implement the first real estimate-to-estimate line-item import pass only.

Goal:
Allow importing line items from another estimate into a draft destination estimate, using canonical estimate source seeding and append-only destination behavior.

Scope:
- existing Estimate Editoror page/tool cluster
- estimate import server action/helpers
- no new page layouts

Requirements:
1. Reuse the existing Estimate Editoror structure and item insertion tool cluster.
2. Add a real `Import from another estimate` flow for line items only.
3. Same organization only.
4. Exclude the current estimate from source selection.
5. Destination estimate must be `draft`.
6. Imported rows must become new destination estimate line items.
7. Reuse canonical source reseeding helpers; do not directly clone downstream financial truth.
8. Do not import reusable content yet.
9. Do not import project details/context yet.
10. Do not create invoice rows, SOV rows, contracts, or snapshots.
11. Do not mutate the source estimate.
12. Do not change estimate line-item schema unless implementation proves it is required.

Validation:
- Run pnpm typecheck
- Run pnpm lint

Final response:
- List files changed.
- Explain line-item import behavior.
- Confirm no schema/model/lineage changes.
- Include validation results.
```
