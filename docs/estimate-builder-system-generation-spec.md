# Estimate Builder System Generation Spec

Status:
- planning and implementation design only
- no code, migrations, routes, UI, or tests are implemented by this document
- intended as a future development blueprint for estimate builder work

Related docs:
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-lived master build plan
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): constrained V1 execution scope

## Purpose

Design the future estimate builder flow for FloorConnector estimates, including:
- catalog and cost item based line creation
- system-template based estimate generation
- quick measurement-driven estimate generation
- detailed measurement-driven estimate generation
- future takeoff and AI input compatibility
- safe override behavior
- grouped customer-facing estimate output

This spec must preserve the canonical FloorConnector workflow:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Estimate generation is an upstream commercial workflow. It must not create contracts, jobs, invoices, payments, or downstream billing records directly.

## Product Goal

The estimate builder should let contractors generate estimates quickly from reusable systems and measurements while still supporting detailed, controlled estimating for jobs that need more precision.

The experience should emulate familiar contractor estimating software patterns:
- choose a known scope or system
- enter measurements
- review calculated quantities
- generate estimate lines
- adjust scope and price before sending

FloorConnector should improve this pattern through:
- canonical customer, project, and estimate continuity
- source traceability from catalog items, systems, imports, takeoff, and future AI capture
- strict separation between internal cost data and customer-facing commercial output
- tenant-aware catalog and template ownership
- estimate snapshots that preserve pricing at the moment lines are created or approved
- workflow continuity from estimate to contract, change order, job, invoice, and payment

The builder should support fast field estimating without becoming a disconnected estimating silo.

## Core Terminology

### Measurement

Manual quantity input entered by a user, such as:
- length and width
- direct square footage
- direct linear footage
- counts
- room or zone dimensions

This is measurement-driven estimating, not takeoff.

### Takeoff

Plan, PDF, drawing, or blueprint based measurement. Takeoff may later produce quantities that can feed the estimate builder, but it should remain traceable as a distinct source.

### AI Capture

Future photo, mobile app, sensor, or AI-derived measurement input. AI capture may later produce estimate draft suggestions, but customer-facing output must require user approval.

### Catalog / Cost Item

A reusable internal pricing, cost, production, unit, and tax behavior record. Catalog items are the reusable estimating building blocks.

### System Template

A reusable bundle of catalog or cost items plus input schema, formulas, grouping rules, optional components, and estimate output rules.

Examples include epoxy flake systems, urethane cement systems, polishing systems, garage systems, and commercial systems.

### Add-on / Option

An optional scope modifier backed by catalog/cost items. Add-ons and options may be sqft based, lf based, each/count based, project/flat price based, or labor/multiplier based later.

Examples include integrated cove base, vinyl cove base, control joints, crack repair, coating removal, coal tar epoxy, moisture mitigation, extra topcoat, prevailing wage labor adjustment, and mobilization/setup.

Integrated cove base and vinyl cove base are hybrid components: they are not full floor systems by themselves. They can be catalog items, optional system components, or add-ons generated from perimeter or entered directly.

### Estimate

The customer-facing commercial scope and pricing record attached to the canonical project workflow.

## Entry Points

Expected future entry points:

### Project Detail -> Create / Generate Estimate

Primary project-context path. The user starts from an existing project and creates or opens an estimate for that project.

Rules:
- preserve the existing project, customer, organization, and opportunity lineage
- do not create a disconnected estimate
- guide the user toward quick build, detailed build, catalog item insertion, or import

### Estimate Detail / Edit -> Add From Catalog

Adds one or more catalog items manually into an editable estimate.

Rules:
- use current catalog defaults at insertion time
- snapshot price, cost, markup, tax, and unit behavior onto the estimate line
- allow later line editing without mutating the source catalog item by default

### Estimate Detail / Edit -> Generate From System

Uses a system template to create grouped estimate lines from user-provided inputs.

Rules:
- require user review of calculated quantities before line creation
- preserve source system and component traceability
- keep generated groups editable after creation

### Estimate Detail / Edit -> Import / Clone From Existing Estimate

Imports lines or grouped content from another same-organization estimate.

Rules:
- source estimate must belong to the same organization
- imported lines become new destination estimate lines
- imported snapshots and overrides should be preserved as destination line snapshots
- source estimate must not be mutated

### Future Takeoff Workspace -> Generate Estimate

Creates estimate draft lines from plan, PDF, or drawing-based takeoff quantities.

Rules:
- takeoff quantities must remain traceable to the takeoff source
- user must review generated estimate lines before customer-facing output
- takeoff does not bypass canonical estimate approval, contract, job, invoice, or payment flow

### Future AI Capture / App Flow -> Generate Estimate Draft

Creates suggested estimate draft lines from future photo, app, or AI-derived measurements.

Rules:
- AI output is a draft source only
- user approval is required before generated lines become customer-facing estimate content
- all AI-originated lines must be traceable as `ai_capture`

## Builder Modes

### Quick Build

Quick Build is optimized for speed and should support the minimum inputs needed to generate useful estimate lines.

Expected flow:
1. choose a system template
2. enter minimal measurements
3. preview calculated quantities
4. generate grouped estimate lines
5. optionally edit quantities, descriptions, optional components, and prices

Supported minimal measurements:
- length plus width
- direct area
- direct linear footage
- counts

Quick Build should stay focused. It should avoid advanced zone management, condition matrices, or heavy pricing controls unless the user switches to Detailed Build.

### Detailed Build

Detailed Build is optimized for controlled estimating when the job needs more precision.

Expected capabilities:
- multiple rooms or zones
- optional components
- site conditions
- waste factors
- perimeter adjustments
- direct quantity overrides
- price overrides
- review before generation

Detailed Build should still generate normal estimate lines attached to the canonical estimate. It should not create a second estimating model.

## Measurement Logic

### Standard Formulas

Floor area:

`floor area = length x width`

Perimeter linear footage:

`perimeter linear footage = (length x 2) + (width x 2)`

### Cove Base Logic

Integrated cove base and vinyl cove base may use perimeter linear footage.

Examples:
- integrated cove base quantity = calculated perimeter linear footage
- vinyl cove base quantity = calculated perimeter linear footage
- user may override with direct cove linear footage when field conditions differ

### Direct Quantity Inputs

The user may alternatively enter:
- direct square footage
- direct linear footage
- direct counts

Direct input should be supported when the contractor already knows the quantity or when the shape cannot be represented by simple length and width.

### Multiple Rooms / Zones

Future Detailed Build should support multiple rooms or zones, where each room or zone can contribute:
- area
- perimeter
- component-specific quantities
- condition modifiers
- waste factors

Total generated quantities should be aggregated for preview while preserving enough detail for later review.

### Irregular Shapes

Before full takeoff exists, irregular shapes may be represented through:
- direct area
- direct perimeter
- multiple rectangular zones
- manual quantity overrides

This should be considered measurement-driven estimating, not takeoff.

## System Template Behavior

A system template conceptually includes:
- name
- description
- required inputs
- optional inputs
- formula rules
- cost item mappings
- grouping rules
- optional components
- default-on and default-off components
- waste factors
- production and labor hints
- customer-facing group label
- internal notes

System templates should be reusable estimating recipes, not customer-specific records.

They should map measurements, intake, and future takeoff quantities to catalog/cost items and grouped estimate output.

### Template Inputs

Required inputs define the minimum data needed to generate a system.

Examples:
- area
- length and width
- perimeter
- direct cove linear footage
- count

Optional inputs define conditional or additive work.

Examples:
- crack repair linear footage
- moisture mitigation area
- termination detail linear footage
- number of drains
- number of steps
- integrated or vinyl cove base linear footage
- coating removal area
- control joint linear footage
- mobilization/setup flat-price selection

Optional inputs may be exposed as add-ons/options when they represent optional scope modifiers instead of required system scope.

### Formula Rules

Formula rules convert measurements into component quantities.

Examples:
- surface prep quantity = area
- epoxy flake system quantity = area
- integrated cove base quantity = perimeter
- crack repair quantity = direct crack repair linear footage

Formula output should be visible in preview before generated lines are created.

### Cost Item Mappings

Each generated component should map to a catalog or cost item where applicable.

The mapping should define:
- source catalog item
- unit
- quantity formula
- default inclusion state
- customer-facing line description
- internal estimating notes

### Grouping Rules

System templates should define how generated lines appear together in the estimate.

Grouping should support:
- system-level customer-facing header
- ordered component lines
- optional component placement
- future collapsed group totals

### Example System Template

Name:

`Epoxy Flake Floor + Integrated Cove Base`

Inputs:
- area or length / width
- perimeter or direct cove linear footage

Components:
- surface prep, quantity = area
- epoxy flake system, quantity = area
- integrated cove base, quantity = perimeter
- optional crack repair, quantity = direct linear footage

Output group:

`Epoxy Flake System with Integrated Cove Base`

Customer-facing output may show the commercial scope and price, but it must not show internal cost, markup, margin, or production assumptions.

## Catalog / Cost Item Behavior

Catalog and cost items provide reusable estimating defaults, including:
- cost per unit
- default price per unit or markup-derived price
- markup and default margin behavior
- labor hours per unit
- production rates
- tax behavior
- unit
- default customer-facing description
- internal notes

Catalog items are internal source records. Estimate lines created from catalog items must snapshot relevant values at creation time.

Labor should eventually be modeled as an internal catalog/cost item component with crew size, production rate, minimum site time, markup, and condition/access multipliers. Near term, labor may remain baked into system pricing where that keeps the implementation smaller and safer.

Customer-facing output must never show:
- cost
- markup
- margin
- internal production assumptions
- internal notes
- production rates unless intentionally converted into customer-facing scope language

Add-ons/options should also be catalog-backed so optional scope, pricing, and source traceability stay on the same cost item foundation.

## Estimate Line Creation And Snapshots

Generated or inserted estimate lines should behave as commercial estimate rows with traceable source metadata.

Required behavior:
- line references catalog item where applicable
- line snapshots price, cost, markup, tax behavior, unit, and customer-facing description at creation time
- line has a `source_type`
- line has a source reference where applicable
- generated lines preserve traceability to system template and component when generated from a system
- future catalog updates do not mutate existing estimate line pricing
- imported lines preserve overrides and snapshots
- new lines from catalog use current catalog defaults

Recommended `source_type` values:
- `manual`
- `catalog`
- `system`
- `imported`
- `takeoff`
- `ai_capture`

Possible source references:
- catalog item id
- system template id
- system template version id
- system component id
- source estimate id
- source estimate line id
- takeoff id
- takeoff measurement id
- AI capture session id
- AI capture item id

### Snapshot Principle

Estimate lines represent what the contractor intended at the time of estimate creation or edit. They must not behave as live projections of mutable catalog or template data.

When catalog defaults change:
- existing estimate lines remain unchanged
- future inserted lines use the new defaults
- users may later choose to refresh or compare lines as a deliberate action

## Override Rules

Contractors can override price per estimate line.

Override behavior:
- price override marks the line as custom priced
- custom price should remain visible in edit mode
- customer-facing estimate shows only the resulting price, not the fact that internal pricing was overridden
- user can choose a one-off override or update the catalog item for future use, if permissions allow

Cost and markup behavior:
- cost and markup editing should be internal and edit-mode only
- direct markup editing may be permission-gated or deferred until a future decision
- customer-facing estimate must never expose cost, markup, margin, or internal pricing logic

Quantity behavior:
- users can edit generated quantities
- quantity overrides should be traceable
- line should distinguish formula-derived quantity from manually overridden quantity where practical

Out-of-sync behavior:
- if system inputs change after generation, related generated lines should eventually be marked out-of-sync or needing review
- out-of-sync lines should not silently recalculate and overwrite reviewed pricing
- regeneration policy should be explicit before implementation

## Customer-Facing Display Templates

Estimate, invoice, contract, and SOW output should eventually support flexible display templates without changing the underlying canonical records.

Display direction:
- clean grouped customer view should be the default
- detailed line-item view should be available
- SOW plus price view should be available
- contractors should be able to switch display templates per estimate, invoice, or contract
- custom templates can be supported later
- internal cost, markup, margin, private notes, and production math must stay hidden unless intentionally configured as customer-facing scope language

Display templates are document-output behavior. They should not create a second estimate, invoice, contract, or pricing model.

## UI State Model

Suggested high-level states:
- `idle`
- `selecting_source`
- `selecting_system`
- `entering_quick_measurements`
- `entering_detailed_measurements`
- `reviewing_generated_lines`
- `generated`
- `editing_lines`
- `out_of_sync`
- `error`

### Important Transitions

Select system:

`selecting_source -> selecting_system -> entering_quick_measurements`

or:

`selecting_source -> selecting_system -> entering_detailed_measurements`

Preview:

`entering_quick_measurements -> reviewing_generated_lines`

`entering_detailed_measurements -> reviewing_generated_lines`

Generate:

`reviewing_generated_lines -> generated -> editing_lines`

Edit input after generation:

`generated -> out_of_sync`

or:

`editing_lines -> out_of_sync`

Override price:

`editing_lines -> editing_lines`

with custom price flag set on the affected line.

Regenerate:

Future policy must decide whether regeneration:
- replaces generated draft lines
- creates a reviewed update
- versions generated line groups
- preserves manually edited lines and appends differences

## Component Blueprint

Suggested future components:
- `EstimateBuilderShell`
- `EstimateSourceSelector`
- `CatalogItemPicker`
- `SystemTemplatePicker`
- `QuickMeasurementForm`
- `DetailedMeasurementBuilder`
- `MeasurementPreview`
- `GeneratedLinePreview`
- `EstimateLineEditor`
- `PriceOverrideControl`
- `SystemGroupSummary`
- `EstimateGenerationReviewModal`
- `EstimateGenerationReviewSheet`
- `OutOfSyncBanner`

These names are implementation guidance only. They are not implemented by this document.

## Interaction Details

Expected user behavior:
- user can add single catalog items manually
- user can generate grouped lines from a system
- user can import or clone lines from another same-organization estimate
- generated groups should be editable after creation
- quantities can be edited
- unit prices can be overridden
- optional system components can be toggled
- detailed mode can add and remove rooms or zones
- quick mode should stay minimal and fast
- calculated quantities are always shown before generating lines

### Add Single Catalog Item

The user selects a catalog item and adds it to the estimate.

Expected behavior:
- insert a new estimate line
- use current catalog defaults
- snapshot source values
- allow quantity and price editing

### Generate From System

The user selects a system template, enters measurements, previews component quantities, then generates lines.

Expected behavior:
- show all generated components before creation
- distinguish default-on and optional components
- allow optional components to be toggled
- create grouped estimate lines after confirmation

### Import / Clone

The user selects another same-organization estimate and imports eligible lines or groups.

Expected behavior:
- source estimate remains unchanged
- destination estimate receives new lines
- imported snapshots and overrides are preserved
- imported source should remain traceable

### Detailed Rooms / Zones

Detailed mode should let users add and remove rooms or zones.

Expected behavior:
- each room or zone can have its own measurement inputs
- totals are aggregated for preview
- generated group still writes to the canonical estimate

## Customer-Facing Grouping

Expected customer-facing estimate display:
- grouped system header
- line descriptions
- quantity
- unit
- unit price
- total
- no internal cost
- no markup
- no margin
- no internal production assumptions

Example group:

Group header:

`Epoxy Flake System with Integrated Cove Base`

Lines:
- surface preparation
- epoxy flake flooring system
- integrated cove base
- crack repair, if selected

Future customer-facing options may include:
- collapse detailed system lines into a grouped total
- show line-level detail internally while hiding it externally
- show allowances or alternates
- present optional add-ons separately

Even if customer-facing output is collapsed later, internal line detail should remain available for cost, margin, production planning, reporting, and auditability.

## Future Integrations

### Templates & Systems Administration

System Template and add-on/option management should eventually live in a dedicated Templates & Systems settings/admin area rather than inside the estimate editor alone.

That future area should manage:
- document templates for estimates, invoices, contracts, proposal/SOW output, and future work orders
- System Templates for reusable floor-system bundles
- add-ons/options backed by catalog/cost items
- sharing and review settings

Contractors should have defaults and local editable copies. Super admin can seed platform defaults, but platform defaults should be copied into contractor-owned templates and systems rather than live-mutating adopted local records.

The sharing loop should let contractors mark templates, systems, or add-ons as shareable. Super admin can review, import, anonymize or strip private pricing data, and promote approved versions into platform defaults for other contractors to adopt. Costs, markup, margin, private notes, internal pricing, and production assumptions should be stripped/anonymized or explicitly reviewed before promotion. Promoted platform versions must not silently update existing contractor local copies.

### Takeoff And Scope Intelligence

Takeoff can later provide measurement sources for estimate generation.

Required compatibility:
- preserve takeoff source references
- allow user review before customer-facing output
- support plan-derived quantities without bypassing the estimate builder

### AI Capture / Mobile App Inputs

AI capture can later provide draft quantities or suggested system matches.

Required compatibility:
- mark source as `ai_capture`
- require user approval
- preserve AI source session references
- never send AI suggestions directly to customer-facing output without review

### Materials Planning

Generated estimate lines should eventually feed material planning.

Required compatibility:
- catalog items should carry unit and production hints
- system templates should preserve component detail
- grouped customer output should not destroy internal component data

### Labor Estimation

Catalog items and systems may provide labor hours per unit or production rates.

Required compatibility:
- labor assumptions stay internal
- generated lines can support later labor planning
- line snapshots preserve assumptions used at estimate time

### Production Readiness

Approved estimate content should eventually help prepare jobs.

Required compatibility:
- estimate approval should preserve immutable snapshots
- production planning should use approved estimate or change order lineage
- job planning should not depend on mutable draft builder state

### Reporting / Margin Analysis

Internal cost snapshots and customer-facing price snapshots should support reporting.

Required compatibility:
- preserve cost and price at estimate line creation
- preserve approved estimate snapshots
- keep source metadata for catalog, system, imported, takeoff, and AI analysis

## Guardrails

Do not allow:
- direct measurement-to-invoice flow
- direct takeoff-to-invoice flow
- direct AI-capture-to-invoice flow
- a separate estimating silo outside canonical estimate records
- customer exposure of cost, markup, margin, or internal production assumptions
- duplicate catalog or system template models per module
- scattered module-specific document-template, System Template, or add-on/option management
- generated estimate lines that are detached from the canonical project and estimate chain
- cross-tenant estimate import, catalog access, system generation, takeoff access, or AI capture access
- AI suggestions to become customer-facing output without user approval
- promoted platform defaults that silently mutate contractor-owned local copies

Required safeguards:
- all generated estimate lines stay tied to the canonical project and estimate chain
- tenant isolation must be preserved at every source lookup and write
- source traceability must be preserved for generated and imported lines
- generated lines should be reviewable before customer-facing use
- downstream contract, job, invoice, and payment workflows should depend on approved estimate and change order lineage, not draft generation state

## Open Questions / Future Decisions

Future implementation should decide:
- whether internal users can edit markup directly or only edit price
- whether regenerated system lines replace or version existing generated lines
- whether grouped customer-facing output can hide detailed internal lines
- how system templates are versioned
- how contractor-created templates are shared, promoted, or standardized by super admin
- how default shareable settings are configured for contractor templates, systems, and add-ons/options
- how cost, markup, margin, private notes, internal pricing, and production assumptions are stripped or reviewed before promotion
- how detailed irregular geometry inputs will be represented before full takeoff exists
- how source records should store formula input snapshots
- whether out-of-sync state lives on individual lines, generated groups, or the estimate builder session
- whether system templates can be organization-owned, platform-owned, or both
- how permissions should govern catalog updates from a one-off estimate override

## Implementation Notes For Future Work

Future implementation should likely proceed in small phases:
1. catalog item insertion and estimate line snapshots
2. system template model and manual system generation
3. quick measurement-driven generation
4. detailed room and zone builder
5. add-ons/options management
6. import and clone improvements
7. takeoff source compatibility
8. AI capture draft compatibility
9. customer-facing grouped output controls
10. broader Templates & Systems administration and sharing review

Each phase should include:
- tenant-aware server validation
- canonical estimate lineage checks
- source snapshot behavior
- customer-facing/internal data separation
- migration and RLS design if schema changes are introduced
- documentation updates for env vars only if new integrations require them

## Planning-Only Summary

This document is a spec and planning blueprint only. It does not implement the estimate builder, system templates, measurements, takeoff, AI capture, UI components, routes, migrations, tests, or customer-facing estimate rendering changes.
