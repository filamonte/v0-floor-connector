# Lead To Invoice UX Audit

Status: UX and implementation audit for the current Lead -> Estimate -> Approval -> Contract / SOV / Invoice workflow.

This audit compares the current FloorConnector workflow against the Contractor Foreman reference flow and applies the current UI standardization guardrails in [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md).

Reference inputs:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)

External UX references:
- [Contractor Foreman: Create estimate from lead](https://kb.contractorforeman.com/knowledge-base/how-do-i-create-an-estimate-from-the-lead-record/)
- [Contractor Foreman: Create estimate and add estimate items](https://kb.contractorforeman.com/knowledge-base/adding-estimate-and-estimate-items/)
- [Contractor Foreman: Link estimate to opportunity](https://kb.contractorforeman.com/knowledge-base/how-do-i-create-an-estimate-and-link-it-to-the-opportunity-record/)
- [Contractor Foreman: Create progress billing invoices](https://kb.contractorforeman.com/knowledge-base/how-do-i-create-progress-billing-invoices/)
- [Contractor Foreman: Add a new invoice](https://kb.contractorforeman.com/knowledge-base/adding-a-new-invoice/?seq_no=2)

## Guardrail Summary

This audit assumes:
- no duplicate data models
- no estimate_line_items as downstream billing truth
- approved estimates seed snapshot and SOV lineage
- contracts remain canonical even though Contractor Foreman lacks a first-class contract stage
- portal and contractor use the same canonical records
- financial mutations remain append-only and auditable
- no one-off UI patterns
- CF feel on a better FloorConnector system

## Executive Summary

FloorConnector already has the stronger architecture:
- one canonical opportunity -> customer -> project -> estimate -> contract -> SOV -> invoice chain
- portal approval on the same estimate record
- approved snapshot lineage instead of live estimate rows as billing truth
- canonical contracts instead of skipping straight from estimate to invoice
- manual downstream confirmation after approval, which is safer than auto-running financial side effects

The current UX gap is not missing architecture. The gap is workflow compression and handoff clarity.

Contractor Foreman feels faster in the narrow sales flow because:
- lead-to-estimate is obvious from list and detail views
- estimating exposes item insertion modes more directly
- import and reuse actions are grouped as estimating tools
- invoice creation and SOV billing are surfaced from the project financial workflow in a simple order

FloorConnector is safer and more canonical, but it still makes users work harder than needed to answer:
"What do I do next?"

## Current FloorConnector Flow

### 1. Dashboard to lead creation

Current routes:
- `/dashboard`
- Leads Manager Page (`/leads`)
- `/leads/[leadId]`

Current behavior:
- Dashboard is a Manager Page-style command center with Quick-Create actions for opportunities, estimates, contracts, invoices, jobs, and more.
- Leads manager uses the shared Manager Page pattern with queue summaries, funnel metrics, search, and Quick-Create.
- Lead Quick-Create creates the canonical opportunity first, then routes into fuller workflow later.

What works:
- Strong Manager Page baseline.
- Canonical opportunity creation already follows the Quick-Create -> real record -> deeper workspace pattern.
- Dashboard and leads are on the shared contractor UI system instead of becoming separate mini-apps.

CF-inspired gap:
- Contractor Foreman makes lead-to-estimate action feel more immediate from list rows and options menus.
- FloorConnector leads manager is informative, but the next action is stronger on lead detail than on the list surface.

### 2. Lead to estimate creation

Current routes:
- `/leads/[leadId]`
- Estimates Manager Page (`/estimates?projectId=...`)
- server handoff via `startEstimateFromOpportunityAction`

Current behavior:
- Lead detail has a primary `Start estimate` action.
- If a project already exists, the action routes into `/estimates?projectId=...`.
- If not, the action creates or links the downstream chain first, then moves into estimating.
- The page explicitly frames the lead as the pre-project commercial context and estimate as the primary operational handoff.

What works:
- Better than CF architecturally because the handoff preserves one canonical customer/project chain.
- Readiness copy already explains whether assessment and requirements are complete enough to estimate.

CF-inspired gap:
- Contractor Foreman exposes `Create Estimate` from the lead row or opportunity menu directly.
- FloorConnector still requires more context switching than necessary from list -> detail -> estimate.

### 3. Estimate builder usability

Current routes:
- Estimates Manager Page (`/estimates`)
- `/estimates/[estimateId]`
- `/estimates/[estimateId]/edit`

Current behavior:
- Estimate detail is review-first.
- Estimate Editor uses `EstimateWorkspaceShell` with sections for items, details, terms, scope, bidding, and files.
- Approved estimates surface `EstimateApprovalNextStepsPanel` for contract, SOV, and invoice follow-on work.
- Autosave, stale-write protection, and shared workflow guidance already exist.

What works:
- Stronger than CF in canonical continuity.
- Shared Record Workspace pattern is real.
- Approval next steps stay on the same estimate chain instead of fragmenting the workflow.

CF-inspired gap:
- Contractor Foreman makes estimate building feel like one obvious tool area with simpler insertion choices.
- FloorConnector has the structure, but the estimating workspace still feels split between "good architecture" and "discoverable operations."

### 4. Manual estimate item creation

Current behavior:
- Estimate items are inventory-first.
- Manual freeform rows are intentionally not the canonical direction.
- Pricing is treated as a commercial snapshot from catalog items or system expansion.
- Quantity, grouping, and assignment remain editable after insertion.

What works:
- This is safer than CF for pricing consistency and downstream lineage.

Gap:
- Users coming from CF may expect an explicit "manual item" path inside estimating.
- FloorConnector currently supports ad hoc estimating by quick-creating a catalog item inside the estimate, but that is not framed as clearly as CF's manual entry mode.

Recommendation:
- Do not add disconnected manual estimate rows.
- Reframe the existing Quick-Create item path as the sanctioned "manual one-off item" workflow.

### 5. Catalog / cost database item insertion

Current routes and components:
- `/estimates/[estimateId]/edit`
- `ItemsSection`
- `/cost-items-database`

Current behavior:
- Search active inventory or systems.
- Add catalog item directly.
- Quick matches support low-friction insertion.
- Systems can be previewed by sqft and then expanded into line items using server-side expansion logic.

What works:
- Better than CF in architectural safety.
- Systems expansion is stronger than a flat cost item import story.

Gap:
- CF presents import language very plainly: import from cost items database.
- FloorConnector uses inventory-first language that is correct internally, but less obviously aligned to estimating muscle memory.

### 6. Creating a reusable catalog item on the fly while estimating

Current behavior:
- `Create New Item` inside `ItemsSection`
- lightweight fields
- `Create and Add`
- tenant-owned reusable item created immediately

What works:
- This is one of FloorConnector's strongest current estimating UX moves.
- It preserves the canonical item master instead of creating hidden estimate-only rows.

Gap:
- It is present, but not emphasized enough as the sanctioned fast path for one-off items.
- The naming still reads slightly like inventory administration rather than estimator flow.

### 7. Importing from another estimate

Current status:
- No clear current estimate-workspace action for importing sections or items from another estimate.
- Contractor Foreman explicitly supports importing from another estimate or template.

Gap:
- This is a meaningful CF-inspired workflow gap.

Risk:
- This is architecture-sensitive because importing must preserve approved-snapshot rules and avoid estimate-to-estimate shadow lineage confusion.

### 8. Importing reusable estimate content

Content types requested:
- scope / SOW
- project details
- terms
- inclusions
- exclusions

Current behavior:
- Reusable content blocks already exist for scope, terms, inclusions, and exclusions.
- Contractor settings already expose default estimate terms, inclusions, and exclusions.
- Estimate Editor page already offers reusable scope and reusable terms/inclusions/exclusions buttons.

What works:
- Stronger than CF structurally because reusable content is canonical and tenant-scoped.
- Shared content blocks avoid a second template system.

Gaps:
- Reuse exists, but the affordance is fragmented.
- There is no single "Import reusable content" action model inside the Estimate Workspace.
- Project-details import is not currently framed as an explicit estimating tool.

### 9. Estimate defaults from contractor settings

Current routes:
- `/settings/workflows`
- `/settings/templates`

Current behavior:
- Organization workflow settings include:
  - approved-estimate contract template
  - default estimate terms
  - default inclusions
  - default exclusions
- Estimate defaults hydrate only when content is initially empty.

What works:
- Strong and safe.
- Better than CF because defaults are explicit, tenant-scoped, and designed not to silently overwrite user work later.

Gap:
- Defaults are configured well, but their origin is not surfaced clearly enough inside the Estimate Workspace.

### 10. Super-admin seeded starter defaults

Current routes:
- `/super-admin/platform`
- `/super-admin/templates`
- `/super-admin/catalogs`

Current behavior:
- Platform starter templates and starter catalog items seed future tenant adoption.
- Organizations adopt editable copies.
- Platform workflow defaults can assign the approved-estimate contract starter template.

What works:
- Much better than CF architecturally.
- No shared mutable tenant records.

Gap:
- The handoff from platform default -> organization adoption -> Estimate Workspace effect is still too invisible from the contractor user's perspective.

### 11. Manual contractor approval

Current behavior:
- Contractor-side status buttons are intentionally disabled for estimate approval.
- Approval is not a contractor-side override shortcut.
- Manual downstream actions exist after approval, but approval itself is portal-based.

What works:
- Correct for canonical auditability.

Gap:
- If the business needs a true internal approval mode later, it must be modeled separately from customer approval.
- Today, "manual contractor approval" is effectively absent by design, which is correct architecturally but should be called out clearly in UX copy.

### 12. Customer / portal approval

Current routes:
- contractor review at `/estimates/[estimateId]`
- portal review at `/portal/estimates/[estimateId]`

Current behavior:
- Contractor sends estimate to customer through the portal.
- Portal records viewed, approved, rejected, and commented states on the same estimate.
- Contractor workspace tracks the customer timeline.

What works:
- Better than CF because approval is canonical, auditable, and shared across portal and contractor surfaces.

Gap:
- The contractor-side "waiting on customer" state is clear, but the next exact downstream step after approval is still stronger in the approval panel than in the overall estimate detail experience.

### 13. Contract generation after approval

Current routes:
- Contracts Manager Page (`/contracts`)
- Contracts Manager Page (`/contracts?estimateId=...`)
- approval next-step actions on approved estimate

Current behavior:
- Contract generation is explicit and manual after estimate approval.
- Contract generation uses approved snapshot data only.
- Existing contracts are detected and linked.

What works:
- Better than CF because contract is a first-class canonical record.
- Excellent architecture guardrail.

Gap:
- This is one of the strongest current downstream actions, but it still lives as a separate manager entry and approval panel action rather than a more unified "approved estimate handoff" flow.

### 14. Schedule of Values handoff

Current routes:
- `/progress-billing`
- `/progress-billing/[scheduleOfValuesId]`

Current behavior:
- Approved estimate items seed SOV foundation.
- Approval panel opens or recovers SOV.
- Progress billing workspaces are listable and tied to project, estimate, customer, and invoice continuity.

What works:
- Better than CF because SOV exists on canonical estimate snapshot lineage rather than becoming an isolated billing mechanism.

Gap:
- The SOV handoff is strong for architecture, but weaker in discoverability.
- The user must understand "progress billing workspace" rather than seeing a simpler "approved scope -> billable schedule" story first.

### 15. Invoice creation and billing handoff

Current routes:
- Invoices Manager Page (`/invoices`)
- project readiness links into Invoices Manager Page (`/invoices`)
- progress billing workspace -> invoice creation

Current behavior:
- Standard invoices can be created from project, estimate, job, SOV, approved change-order snapshot, or invoice-only adjustment.
- Progress billing invoices must come through SOV lineage.
- Project detail already pushes deposit invoice and standard invoice next steps.

What works:
- Better than CF because invoice lineage is explicit and auditable.
- Strong separation between estimate review, SOV structure, and invoice record truth.

Gap:
- Contractor Foreman exposes simpler invoice entry wording from project financials and invoice module.
- FloorConnector has the same capability family, but users still need to infer whether the next move is:
  - create deposit invoice
  - create standard invoice
  - open progress billing
  - open existing invoice

## CF-Inspired UX Gaps

1. Lead list handoff is weaker than lead detail handoff.
2. Estimate entry modes are not grouped under one obvious estimating tool model.
3. "Import from another estimate" is a major missing workflow.
4. Reusable scope / terms / inclusions / exclusions exist, but not under one unified import/reuse surface.
5. Cost database insertion is present but not expressed in CF-familiar estimating language.
6. On-the-fly item creation is good, but not positioned clearly enough as the sanctioned manual item path.
7. Approved-estimate downstream actions are split across detail, edit, project readiness, contracts, and progress billing.
8. SOV handoff is correct but not simple enough in language.
9. Invoice handoff from approved scope is safe but can still feel choice-heavy.
10. Dashboard-to-lead-to-estimate flow is operationally good, but not yet as direct as CF's narrow happy path.

## What FloorConnector Already Does Better Than CF

1. One shared lifecycle instead of separate module truth.
2. Canonical contracts instead of skipping from estimate to invoice.
3. Portal and contractor operate on the same estimate and invoice records.
4. Approved estimate snapshots protect downstream billing truth.
5. SOV and progress billing extend canonical invoice behavior instead of replacing it.
6. Downstream financial mutations are append-only and auditable.
7. Reusable content blocks avoid ad hoc copied text silos.
8. Platform starter defaults seed tenant-owned copies safely.
9. Inventory-first and system-expansion estimating is more scalable than loose manual rows.
10. Project readiness already provides stronger "workflow gate" logic than CF's looser module handoffs.

## Where UI Is Inconsistent

1. Lead manager is a Manager Page, but lead detail still reads more like a legacy polished detail surface than the stronger shared Record Workspace baseline.
2. Estimate detail is review-first while Estimate Editoror is workspace-first; the jump is powerful but not yet perfectly unified.
3. Approved estimate next steps appear in multiple places:
   - estimate detail
   - Estimate Editoror approval panel
   - project readiness
   - contracts manager
   - progress billing manager
4. Reusable content is split across:
   - contractor workflow defaults
   - content-block management
   - Estimate Editoror section-level buttons
5. Item insertion terminology mixes inventory, catalog, systems, and estimating language in ways that may be correct internally but feel less direct externally.

## Where Next-Step Handoff Is Weak

1. `/dashboard` -> `/leads` is good, but dashboard does not yet push a stronger "start from lead, then estimate" commercial path.
2. `/leads` list does not make `Start estimate` feel as immediate as CF.
3. `/estimates/[estimateId]` explains status well, but the next step after approval still depends on the user recognizing several downstream modules.
4. `/progress-billing` is logically right, but semantically farther from the user mental model than "bill approved scope."
5. Invoices Manager Page (`/invoices`) is strong operationally, but not yet explicit enough about when the user should come from standard invoicing versus SOV billing versus deposit collection.

## Safe UI-Only Changes

These can be implemented without changing canonical models or downstream logic.

1. Add stronger lead-row and lead-card primary actions that deep-link into the existing estimate handoff.
2. Standardize estimate-related CTA wording across dashboard, leads, lead detail, project readiness, estimate detail, and Estimate Editoror.
3. Add one shared "Add to estimate" tool group in Estimate Editoror:
   - add reusable item
   - create and add item
   - expand system
   - import reusable content
4. Add one shared "After approval" summary strip on estimate detail and Estimate Editoror that mirrors the same ordered handoff:
   - contract
   - SOV
   - invoice
5. Reframe Quick-Create item as "Create one-off reusable item" to make the sanctioned path obvious.
6. Surface default-origin messaging inside Estimate Editoror:
   - contractor defaults applied
   - platform starter adopted into org copy
7. Group reusable scope / terms / inclusions / exclusions under one visible "Insert reusable content" pattern while keeping the current sections.
8. Improve project readiness labels so invoice choices are more specific:
   - create deposit invoice
   - open progress billing
   - create standard invoice
9. Add better empty-state copy in progress billing that explains the approved estimate -> SOV -> invoice chain plainly.
10. Make estimate manager and lead manager queue cards point more explicitly to the next action instead of only the current state.

## Architecture-Sensitive Changes

These are high-value but require careful implementation.

1. Import from another estimate.
Reason:
- must avoid cloning downstream financial lineage
- should import editable estimating content only
- must not imply estimate_line_items are billing truth

2. Support a sanctioned "manual estimate item" story without freeform disconnected rows.
Reason:
- should likely create a minimal reusable catalog item first
- must preserve canonical item-master behavior

3. Add project-details import into estimate authoring.
Reason:
- should pull from canonical project and opportunity context
- must not create copied shadow records

4. Add a unified approved-estimate handoff model across estimate detail, edit, and project readiness.
Reason:
- should reuse existing panels and canonical actions
- must not create duplicate contract/SOV/invoice orchestration logic in multiple places

5. Add stronger invoice path selection.
Reason:
- deposit, standard, and progress-billing entry must stay distinct
- billing lineage rules must remain explicit

## Recommended Implementation Phases

### Phase 1: Handoff clarity only

Goal:
- make the current workflow easier to understand without changing behavior

Scope:
- CTA copy normalization
- stronger queue action labels
- better empty states
- approved-estimate downstream summary strip

### Phase 2: Estimating action consolidation

Goal:
- make Estimate Editoror feel like one tool area

Scope:
- grouped add-item actions
- grouped reusable-content actions
- clearer sanctioned one-off item creation language

### Phase 3: Lead and project workflow tightening

Goal:
- reduce context switching before and after estimate approval

Scope:
- stronger lead-list estimate entry
- better project readiness action ordering
- clearer invoice-path labeling

### Phase 4: Reuse and import depth

Goal:
- close key CF workflow gaps safely

Scope:
- import from another estimate
- import canonical project/opportunity context into estimate content areas

### Phase 5: Downstream billing guidance polish

Goal:
- make contract / SOV / invoice differences obvious without weakening architecture

Scope:
- unified handoff descriptions
- stronger progress-billing language
- better estimate-based invoice and deposit invoice explanations

## First 5 Codex Implementation Passes

These are intentionally small and ordered.

### Pass 1

Normalize handoff copy and CTA ordering on:
- `/dashboard`
- `/leads`
- `/leads/[leadId]`
- `/estimates/[estimateId]`
- `/projects/[projectId]`

Outcome:
- stronger "What do I do next?" continuity without changing workflow logic

### Pass 2

Refactor Estimate Editoror action grouping inside the existing shared Estimate Workspace:
- consolidate add-item actions
- make `Create and Add` read as sanctioned one-off reusable item creation
- standardize labels for catalog item vs system expansion

Outcome:
- CF-like speed without adding one-off UI patterns

### Pass 3

Add a unified reusable-content insertion surface inside Estimate Editoror using existing content blocks:
- scope
- terms
- inclusions
- exclusions

Outcome:
- existing reuse becomes obvious and estimator-friendly

### Pass 4

Align approved-estimate downstream guidance across:
- estimate detail
- Estimate Editoror approval panel
- project readiness

Outcome:
- one ordered downstream story:
  - generate contract
  - open or recover SOV
  - create invoice from the right billing path

### Pass 5

Design and implement safe import-from-estimate behavior for estimate authoring only.

Rules:
- import estimating content, not billing truth
- no cloned downstream records
- no snapshot reuse as editable source of billing

Outcome:
- closes a major CF usability gap without breaking canonical lineage

## Top Recommended Changes

1. Add stronger estimate-entry actions on the leads manager so list-level handoff feels as direct as CF.
2. Normalize `Start estimate`, `Generate contract`, `Open progress billing`, and `Create invoice` labels across the whole workflow.
3. Group estimate insertion actions under one obvious estimating tool cluster in the existing items section.
4. Reframe quick catalog creation as the official one-off manual item workflow.
5. Add one visible reusable-content insert pattern for scope, terms, inclusions, and exclusions.
6. Surface default origin inside Estimate Editoror so users understand contractor defaults versus platform starter seeds.
7. Unify approved-estimate downstream guidance across estimate detail, Estimate Editoror, and project readiness.
8. Make progress billing read more clearly as "approved scope billing" before exposing deeper SOV language.
9. Tighten invoice-path guidance so deposit, standard, and SOV billing are easier to distinguish.
10. Add safe import-from-another-estimate as the first major estimating-depth workflow after UI-only cleanup.

## Final Assessment

FloorConnector does not need a new workflow model here.

It needs:
- stronger reuse of the existing Manager Page and Record Workspace patterns
- tighter next-step guidance
- clearer estimating tools
- safer CF-inspired speed improvements layered on top of the already-better canonical system

The right direction remains:

CF feel on a better FloorConnector system.
