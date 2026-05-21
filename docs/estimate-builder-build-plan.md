# Estimate Builder Build Plan

Status:
- long-lived master build plan
- planning blueprint only
- no code, routes, migrations, schemas, UI, tests, or seed data are implemented by this document

## Purpose

The Estimate Builder is the future pricing and scope engine for FloorConnector. It connects manual measurements, future takeoff, future AI Capture, System Templates, catalog/cost items, estimate line items, and the downstream contract, job, invoice, and payment workflow.

The builder must strengthen the canonical FloorConnector workflow:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

It should help contractors create fast, consistent, traceable estimates without creating a separate estimating silo or bypassing the approved estimate as the commercial source of truth.

## Core Terminology

### Measurements

Measurements are manual inputs entered by a contractor or user. Examples include length x width, direct square footage, direct linear footage, counts, and rooms or zones.

Measurements are not takeoff.

### Takeoff

Takeoff is plan, PDF, or drawing-based measurement using scaled project plans. Takeoff may eventually produce reviewed quantities that feed estimate generation, but it is a distinct source type from manual measurements.

### AI Capture

AI Capture is a future app, photo, or AI-derived measurement, surface detection, condition detection, or plan interpretation input. AI Capture may suggest quantities, systems, mappings, or draft estimate content, but customer-facing estimate content must require human review and approval.

### Catalog / Cost Items

Catalog/cost items are reusable internal records for cost, markup, price, labor, production, unit, and tax behavior. They are the reusable estimating building blocks used by manual catalog insertion and System Template generation.

### System Templates

System Templates are reusable estimating systems made of catalog/cost items, formulas, grouping rules, required inputs, optional components, and output rules. They map quantities into grouped estimate content.

Examples include epoxy flake systems, urethane cement systems, polishing systems, garage systems, and commercial systems.

### Add-ons / Options

Add-ons and options are optional scope modifiers backed by catalog/cost items. They should extend a selected system or estimate scope without becoming separate floor systems or disconnected pricing records.

Examples include integrated cove base, vinyl cove base, control joints, crack repair, coating removal, coal tar epoxy, moisture mitigation, extra topcoat, prevailing wage labor adjustment, and mobilization/setup.

Add-ons may be sqft based, lf based, each/count based, project/flat price based, or labor/multiplier based later.

Integrated cove base and vinyl cove base are hybrid add-ons: they are catalog items and optional system/add-on components, not full floor systems by themselves. They can be generated from perimeter or entered directly when the contractor knows the field quantity.

### Estimate

An estimate is the customer-facing commercial scope and pricing record in the canonical workflow. It is the proposed commercial scope that later feeds approval, contract generation, job handoff, invoice lineage, and payment flow.

Measurements and takeoff produce quantities. Catalog/cost items define reusable cost, pricing, production, markup, and tax behavior. System templates map quantities to grouped estimate content. Estimates define customer-facing pricing and commercial scope.

## Full Target Workflow

The full target Estimate Builder workflow is:

`Opportunity -> Customer -> Project -> Site Info / Measurements / Plans / Photos -> Measurement, Takeoff, or AI Capture -> System Template -> Catalog/Cost Item Mapping -> Grouped Estimate Line Items -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment`

Rules:
- measurement, takeoff, and AI Capture are input sources, not downstream commercial records
- there is no direct measurement-to-invoice path
- there is no direct takeoff-to-invoice path
- there is no direct AI Capture-to-invoice path
- the estimate remains the canonical commercial scope record
- downstream contracts, jobs, invoices, and payments continue to flow from approved estimate and change-order lineage

## Full Feature Set

The complete system vision includes:
- manual catalog item add
- quick measurement-driven generation
- detailed measurement-driven generation
- System Templates
- add-ons/options backed by catalog/cost items
- platform-seeded templates
- contractor-owned templates
- contractor settings defaults
- document templates for estimate, invoice, contract, proposal/SOW, and future work order output
- flexible display templates, including grouped customer view, detailed line-item view, and SOW plus price view
- super-admin review and promotion of shareable contractor templates
- source traceability from generated lines back to source measurements, templates, takeoff records, or AI Capture inputs
- price, cost, markup, tax, unit, and description snapshots on estimate line creation
- one-off estimate line overrides
- future takeoff integration
- future AI Capture and app integration
- future materials, labor, and production planning handoff
- future margin, reporting, and estimated-vs-actual analysis potential

## Phased Roadmap

### Phase 1: Investor Demo / V1

Phase 1 is the constrained first execution slice documented in [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md).

Included direction:
- catalog/cost item V1
- manual add from catalog
- simple System Templates
- Quick Build from length x width or direct area, linear footage, and counts
- grouped estimate lines
- price override
- snapshot pricing
- preserve existing estimate -> contract -> job -> invoice -> payment flow

### Phase 2: Detailed Builder

Phase 2 expands measurement-driven estimating for more precise jobs:
- multiple rooms and zones
- optional components
- waste factors
- perimeter adjustments
- condition-based options
- deeper review before generation

### Phase 3: System Template Management

Phase 3 introduces durable Templates & Systems administration:
- contractor-owned System Templates in a dedicated future settings/admin area
- platform-seeded System Templates copied into contractor-owned templates on adoption
- contractor defaults
- versioning
- template copy and adoption behavior
- super-admin starter systems
- add-ons/options management for catalog-backed optional scope modifiers
- document-template defaults for estimate, invoice, contract, proposal/SOW, and future work order output

### Phase 4: Template Sharing / Ecosystem

Phase 4 introduces controlled template sharing:
- contractor opt-in shareable templates, systems, and add-ons/options, with default opt-in configurable in settings
- anonymize, strip, or explicitly review cost, markup, margin, private notes, internal pricing, and production assumptions before promotion
- super-admin import, review, and promotion
- promoted platform templates/defaults that other contractors may adopt into local copies
- no silent updates to contractor copies

### Phase 5: Takeoff Integration

Phase 5 introduces plan-based takeoff:
- plan, PDF, and image uploads
- scaled takeoff
- area, linear, and count measurement extraction
- selected work areas
- mapped System Templates
- estimate generation from approved takeoff quantities

### Phase 6: AI Capture / AI Takeoff

Phase 6 introduces AI-assisted inputs:
- AI plan interpretation
- AI photo and app measurement capture
- system suggestions
- cost item mapping suggestions
- estimate draft generation
- human review and approval before customer-facing content

### Phase 7: Production + Intelligence

Phase 7 uses approved estimate content and source snapshots for operations and analysis:
- materials requirements
- labor estimates
- production readiness
- job planning
- reporting and margin analysis
- estimated-vs-actual feedback loops

## Data Model Direction

This section is conceptual only. Do not claim these objects exist unless current code, migrations, and [docs/current-state.md](C:/FloorConnector/docs/current-state.md) confirm they exist.

Conceptual future objects may include:
- `catalog_items` / reusable catalog items
- `system_templates`
- `system_template_items`
- `estimate_line_items` source fields and snapshots
- `takeoffs`
- `takeoff_documents`
- `takeoff_measurements`
- `takeoff_scope_items`
- `takeoff_estimate_links`

V1 should reuse existing tables, shared packages, and established patterns when possible. It should avoid duplicating current catalog, estimate, template, customer, project, or workflow models.

Any future schema work must use migrations, preserve RLS for tenant-owned tables, keep organization boundaries explicit, and document RLS impact.

## Templates & Systems Administration Direction

The long-term product direction is a dedicated Templates & Systems settings/admin area rather than scattering template and system management across estimates, invoices, contracts, and other modules.

That future area should manage:
- document templates
- System Templates
- add-ons/options
- sharing and review settings

Document templates should cover estimate templates, invoice templates, contract templates, proposal/SOW templates, and future work order templates. Contractors should have defaults, be able to switch templates per estimate, invoice, or contract, and be able to create and edit local copies. Super admin may seed platform defaults, but platform defaults should be copied into contractor-owned templates rather than live-mutating contractor records.

System Templates should map measurements, intake, and future takeoff quantities to catalog/cost items and grouped estimate output.

The sharing loop should let contractors mark templates, systems, and add-ons as shareable. Super admin can review, import, and promote approved versions into platform defaults for other contractors to adopt. No promoted version should silently update a contractor's existing local copy.

## Pricing And Override Rules

Pricing rules:
- cost and markup are internal
- customer-facing estimates show description, quantity, unit, unit price, and total
- customer-facing estimates must not expose internal cost, markup, margin, production assumptions, or internal notes
- one-off estimate line price overrides are allowed
- contractors can also update catalog/cost items for future estimates when permissions allow
- imported or cloned lines preserve snapshots and overrides
- new catalog-added lines use current catalog defaults
- catalog changes do not mutate past estimate pricing
- generated lines should retain source traceability

Customer-facing display template direction:
- clean grouped customer view should be the default
- detailed line-item view should be available
- SOW plus price view should be available
- contractors should eventually switch display templates per estimate, invoice, or contract
- custom templates can be supported later through the Templates & Systems area

Snapshot rules:
- estimate lines represent the contractor's intent at the time of line creation or edit
- generated or imported lines should preserve the relevant source price, cost, markup, tax behavior, unit, and description snapshots
- refreshing from catalog or template defaults should be a deliberate future action, not a silent mutation

## Measurement Logic

V1 measurement-driven estimating should support simple formulas:
- `area = length x width`
- `perimeter = (length x 2) + (width x 2)`
- direct area input
- direct linear footage input
- counts where applicable

Integrated cove base and vinyl cove base use linear footage. They may use calculated perimeter linear footage or direct linear footage when the contractor already knows the field quantity.

Future rooms and zones can aggregate area and perimeter across multiple spaces. This remains measurement-driven estimating, not takeoff.

## Labor Direction

Labor should eventually become an internal catalog/cost item component that can support crew size, production rate, minimum site time, markup, and condition/access multipliers.

Near term, labor may remain baked into system pricing where that is the smallest safe implementation path. Customer-facing templates should not expose cost, markup, margin, internal production math, or private pricing notes unless a contractor intentionally configures customer-facing scope language.

## UI Architecture

This is planning-level UI architecture only. These components are not implemented by this document.

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
- `OutOfSyncBanner`

The UI should support review before generation, editable generated lines, internal-only pricing controls, customer-facing output separation, and source traceability.

## Guardrails

Do not allow:
- a separate estimating silo
- duplicate catalog, template, estimate, customer, project, invoice, or takeoff-specific commercial models
- module-specific template, System Template, or add-on/option silos outside the future Templates & Systems administration direction
- pricing directly inside raw measurements or raw takeoff measurements
- direct takeoff-to-invoice behavior
- direct measurement-to-invoice behavior
- customer exposure of internal cost, markup, margin, or production assumptions
- AI suggestions to become customer-facing estimate content without approval
- cross-tenant catalog, template, takeoff, AI Capture, estimate, or import access
- silent recalculation that overwrites reviewed generated lines or past estimate pricing
- silent platform updates that mutate contractor-owned template, system, or add-on copies after adoption

Required safeguards:
- preserve tenant isolation
- preserve canonical workflow continuity
- preserve source traceability
- keep measurements, takeoff, and AI Capture as quantity sources
- map generated content through System Templates and catalog/cost items
- keep the estimate as the canonical customer-facing commercial scope record
- flag out-of-sync generated content when source measurements or templates change after generation
