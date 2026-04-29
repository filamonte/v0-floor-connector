# Estimate Defaults Plan

## Purpose
Plan the next Contractor-Foreman-inspired workflow layer for estimate defaults and starter seed behavior without creating a second template system or touching downstream billing, SOV, invoice, or contract lineage.

This plan covers:
- contractor estimate defaults
- super-admin platform starter defaults
- tenant-owned adoption behavior
- empty-estimate prefilling
- how defaults differ from reusable blocks
- how defaults differ from estimate import

## Current Relevant Files And Helpers

### Docs and workflow guardrails
- [docs/current-state.md](/C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](/C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](/C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](/C:/FloorConnector/docs/chat-handoff.md)
- [docs/floorconnector-ui-build-rules.md](/C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/lead-to-invoice-ux-audit.md](/C:/FloorConnector/docs/lead-to-invoice-ux-audit.md)

### Contractor workflow settings
- [apps/web/app/(app)/settings/workflows/page.tsx](/C:/FloorConnector/apps/web/app/(app)/settings/workflows/page.tsx)
- [apps/web/lib/settings/schemas.ts](/C:/FloorConnector/apps/web/lib/settings/schemas.ts)
- [apps/web/lib/settings/actions.ts](/C:/FloorConnector/apps/web/lib/settings/actions.ts)
- [apps/web/lib/organizations/workflow-settings.ts](/C:/FloorConnector/apps/web/lib/organizations/workflow-settings.ts)

### Super-admin platform defaults
- [apps/web/app/(super-admin)/super-admin/platform/page.tsx](/C:/FloorConnector/apps/web/app/(super-admin)/super-admin/platform/page.tsx)
- [apps/web/lib/platform-admin/data.ts](/C:/FloorConnector/apps/web/lib/platform-admin/data.ts)
- [apps/web/lib/platform-admin/schemas.ts](/C:/FloorConnector/apps/web/lib/platform-admin/schemas.ts)
- [apps/web/lib/platform-admin/actions.ts](/C:/FloorConnector/apps/web/lib/platform-admin/actions.ts)

### Estimate load and workspace behavior
- [apps/web/lib/estimates/data.ts](/C:/FloorConnector/apps/web/lib/estimates/data.ts)
- [apps/web/lib/estimates/workspace.ts](/C:/FloorConnector/apps/web/lib/estimates/workspace.ts)
- [apps/web/components/estimate-form.tsx](/C:/FloorConnector/apps/web/components/estimate-form.tsx)
- [apps/web/components/estimates/reusable-content-inserter.tsx](/C:/FloorConnector/apps/web/components/estimates/reusable-content-inserter.tsx)
- [apps/web/components/catalog-manager/content-block-manager.tsx](/C:/FloorConnector/apps/web/components/catalog-manager/content-block-manager.tsx)

## What Already Exists

### Contractor defaults already supported
The existing contractor workflow settings row already supports:
- `defaultEstimateTermsHtml`
- `defaultEstimateInclusionsHtml`
- `defaultEstimateExclusionsHtml`
- `defaultEstimateScopeSummaryHtml`

Current contractor UI:
- `/settings/workflows` exposes rich-text editors for all four fields
- copy already says these defaults only prefill new estimates when reusable-content areas are empty

### Platform starter defaults already supported
The existing platform workflow defaults row already supports:
- `defaultEstimateTermsHtml`
- `defaultEstimateInclusionsHtml`
- `defaultEstimateExclusionsHtml`
- `defaultEstimateScopeSummaryHtml`

Current super-admin UI:
- `/super-admin/platform` exposes rich-text editors for the same four fields
- copy already says these seed contractor-side starting content only

### Empty-estimate prefilling already supported
Current estimate load behavior:
- [apps/web/lib/estimates/data.ts](/C:/FloorConnector/apps/web/lib/estimates/data.ts) loads organization workflow settings
- it resolves:
  - `termsHtml`
  - `inclusionsHtml`
  - `exclusionsHtml`
  - `scopeSummaryHtml`
- [apps/web/lib/estimates/workspace.ts](/C:/FloorConnector/apps/web/lib/estimates/workspace.ts) applies defaults only when `hasMeaningfulEstimateWorkspaceContent(...)` is false

That means defaults apply only when the estimate workspace is effectively empty.

### Reusable content blocks already differ correctly
Reusable content blocks already exist separately:
- tenant-owned
- insertable on demand
- append into the live estimate workspace

They are not the same as defaults.

### Estimate import already differs correctly
Estimate import from another estimate already exists separately:
- source-specific
- user-triggered
- append-only into the destination estimate
- not the same as defaults

## Important Current Nuance
The current system already avoids a duplicate settings model, but the adoption path is mostly implicit.

What happens now:
1. If an organization has no `organization_workflow_settings` row yet, `getOrganizationWorkflowSettings(...)` falls back to platform workflow defaults.
2. If the contractor later saves workflow settings, `upsertOrganizationWorkflowSettings(...)` writes a tenant-owned row using the resolved current values.
3. That effectively seeds tenant-owned defaults through the existing workflow-settings row.

This is already close to the right architecture:
- platform defines starter defaults
- tenant ends up with tenant-owned workflow settings
- no shared mutable runtime default record is edited by contractors

## Gaps Compared With The CF Workflow

### 1. Default origin is too invisible
Today the estimate workspace does not clearly answer:
- did this text come from platform starter defaults?
- did it come from contractor workflow settings?
- did the user type or edit it already?

CF-style expectation:
- users feel the starter/default source immediately
- users understand what prefills automatically versus what they insert later

### 2. Contractor settings do not clearly explain adoption lifecycle
The settings page lets users edit defaults, but it does not make the platform-starter-to-tenant-owned transition obvious.

### 3. Super-admin starter defaults do not visibly connect to tenant adoption
Platform admins can set starter defaults, but the UI does not clearly show:
- these are starter values
- contractors own their copies after adoption
- platform edits should not feel like live tenant text mutations

### 4. No explicit default notes/context field exists today
There is currently no dedicated estimate default field for:
- project details/context
- estimate notes/context

Supported default fields today are only:
- Scope / SOW summary
- Terms
- Inclusions
- Exclusions

That means “default estimate notes/context” is not currently supported and should stay out of the first implementation pass unless intentionally added later.

### 5. No field-level origin semantics after org row exists
Current fallback is row-level, not field-level.

Implication:
- before an org workflow row exists, platform defaults are the runtime source
- after a row exists, the org row is the runtime source for those fields
- there is no current per-field “inherit platform starter” state once the tenant row exists

This matters for future UX planning.

## Recommended Data / Source-Of-Truth Approach

### Keep the existing settings models
Do not create a second estimate-defaults settings table.

Use the existing models:
- `platform_workflow_defaults`
- `organization_workflow_settings`

### Keep the current semantic split
Platform:
- owns starter defaults
- never acts as mutable shared runtime text for contractor editing

Organization:
- owns tenant-scoped working defaults
- remains the canonical runtime source once adopted

Estimate workspace:
- receives prefills only when the workspace is empty
- never becomes the source of truth for future defaults automatically

Reusable blocks:
- remain separate insertable content

Estimate import:
- remains separate source-specific copy behavior

### Recommended adoption rule
Preserve the current architectural direction:
- platform starter defaults are the initial source
- contractor save/adopt creates or confirms tenant-owned defaults on the existing organization workflow settings row

Do not add a new adoption model.

### Recommended near-term origin rule
For the next implementation layer, origin should be surfaced in UI rather than re-architected first.

Recommended first-pass interpretation:
- if the organization row has never been explicitly customized for estimate defaults, show “Platform starter default”
- if tenant defaults are present and saved, show “Organization default”
- if the estimate workspace already has user-edited content, show “Edited in this estimate” or equivalent non-destructive language

## How Defaults Should Differ From Other Content Systems

### Defaults
- source: platform starter defaults or organization workflow settings
- timing: automatic
- trigger: only when estimate content is initially empty
- behavior: prefill

### Reusable content blocks
- source: tenant-owned content blocks
- timing: on demand
- trigger: explicit user insert
- behavior: append

### Estimate import
- source: one specific prior estimate
- timing: on demand
- trigger: explicit user import
- behavior: append

This distinction should stay extremely explicit in settings and estimate edit UX.

## UI Plan For Contractor Settings

### Route
- `/settings/workflows`

### Recommended improvements
1. Keep the existing workflow-settings page and rich-text fields.
2. Add stronger field-level helper copy:
   - “Prefills empty estimates only”
   - “Does not append into existing estimates”
   - “Separate from reusable content blocks”
3. Add default-origin framing:
   - “Platform starter default”
   - “Organization default”
4. Add a compact explanation panel:
   - defaults prefill only when the estimate starts empty
   - reusable blocks append later
   - importing from another estimate copies from a prior record, not from defaults

### Recommended first-pass scope
UI-only clarity first:
- no schema changes
- no field expansion
- no new settings model

## UI Plan For Super-Admin Starter Defaults

### Route
- `/super-admin/platform`

### Recommended improvements
1. Keep the existing platform workflow defaults section.
2. Make the “starter defaults” language more explicit:
   - platform starter defaults seed tenant-owned workflow defaults
   - they do not behave like shared live runtime text once adopted
3. Add compact contractor-impact copy:
   - “Used only when contractor estimate defaults are still inherited / not yet customized”
   - “Empty estimate prefills only”

### Recommended first-pass scope
Again, UI clarity first:
- no new platform settings model
- no per-tenant override engine
- no shared mutable runtime records

## How Estimate Edit Should Show Default Origin

### Route / surface
- estimate edit workspace

### Recommended UX
Inside estimate edit, add a small default-origin summary near the reusable-content areas.

It should answer:
- where did this default starting content come from?
- is this still default content or has it already been edited in this estimate?

Recommended labels:
- `Platform starter default`
- `Organization default`
- `Edited in this estimate`

### Important limitation
Without adding richer origin metadata, this should remain an informational UI layer based on current load state and settings context, not a hard provenance system.

That is acceptable for the next pass because the main current gap is visibility, not canonical data integrity.

## Recommended Implementation Phases

### Phase 1
Clarify contractor workflow defaults UI using the existing `/settings/workflows` page:
- stronger default-vs-block-vs-import copy
- starter/adoption explanation
- no behavior change

### Phase 2
Clarify super-admin starter defaults UI on `/super-admin/platform`:
- stronger starter-default language
- clearer tenant-owned adoption explanation
- no behavior change

Status:
- super-admin starter-default clarity pass is now implemented on `/super-admin/platform`
- this pass clarifies Scope / SOW, Terms, Inclusions, and Exclusions as platform seed values for organization-owned defaults without changing any data, contractor settings behavior, or estimate prefill behavior

### Phase 3
Show default origin inside estimate edit:
- platform starter default
- organization default
- edited in this estimate

Status:
- estimate-edit default-origin visibility is now implemented in the existing reusable-content areas
- this pass explains empty-estimate prefills, reusable-block append behavior, and estimate-import copy behavior while honestly limiting origin messaging to safe row-level inference from organization defaults versus platform fallback

### Phase 4
If product still wants deeper adoption controls later, evaluate whether field-level inherit/reset is needed on the existing `organization_workflow_settings` model.

Do not do this before the visibility pass.

## Recommended First Implementation Pass
Start with contractor workflow defaults clarity on `/settings/workflows`.

Why this first:
- it uses the existing settings surface
- it does not require schema work
- it directly improves the contractor mental model
- it makes later estimate-edit origin messaging much easier to explain

Status:
- first contractor workflow-defaults clarity pass is now implemented on `/settings/workflows`
- this pass clarified the four supported estimate default fields and their relationship to reusable blocks, estimate import, and platform starter defaults without changing the model or load behavior

## First Implementation Pass Prompt
```text
You are continuing FloorConnector after the estimate defaults plan.

Read first:
- docs/current-state.md
- docs/workflows.md
- docs/developer-source-of-truth.md
- docs/chat-handoff.md
- docs/floorconnector-ui-build-rules.md
- docs/estimate-defaults-plan.md

Task:
Implement the first estimate-defaults clarity pass on contractor settings only.

Goal:
Make contractor estimate defaults feel more explicit and Contractor-Foreman-like without changing the defaults model.

Scope:
- /settings/workflows

Requirements:
1. Reuse the existing workflow settings page and current default fields.
2. Clarify the four supported estimate default fields:
   - Scope / SOW
   - Terms
   - Inclusions
   - Exclusions
3. Add clearer helper copy that distinguishes:
   - defaults prefilling empty estimates only
   - reusable blocks appending on demand
   - estimate import copying from a prior estimate
4. Add compact “starter default vs organization-owned default” explanation.
5. Do not add schema.
6. Do not add a second defaults settings model.
7. Do not add project-details/context defaults in this pass.
8. Do not change estimate load behavior.
9. Do not change billing, SOV, contract, or invoice logic.

Validation:
- Run pnpm typecheck
- Run pnpm lint

Final response:
- List files changed.
- Explain estimate-defaults clarity improvements.
- Confirm no model/load/lineage changes.
- Include validation results.
```
