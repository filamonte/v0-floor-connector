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

### Estimate

An estimate is the customer-facing commercial scope and pricing record in the canonical workflow. It is the proposed commercial scope that later feeds approval, contract generation, job handoff, invoice lineage, and payment flow.

Measurements and takeoff produce quantities. Catalog/cost items define reusable cost, pricing, production, markup, and tax behavior. System templates map quantities to grouped estimate content. Estimates define customer-facing pricing and commercial scope.

## Full Target Workflow

The full target Estimate Builder workflow is:

`Lead / Opportunity -> Customer + Project -> Site Info / Measurements / Plans / Photos -> Measurement, Takeoff, or AI Capture -> System Template -> Catalog/Cost Item Mapping -> Grouped Estimate Line Items -> Estimate -> Contract -> Job -> Invoice -> Payment`

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
- platform-seeded templates
- contractor-owned templates
- contractor settings defaults
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

Phase 3 introduces durable template management:
- contractor-owned System Templates in settings
- platform-seeded System Templates
- contractor defaults
- versioning
- template copy and adoption behavior
- super-admin starter systems

### Phase 4: Template Sharing / Ecosystem

Phase 4 introduces controlled template sharing:
- contractor opt-in shareable templates
- anonymize and strip cost and markup before review
- super-admin import, review, and promotion
- promoted platform templates
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
- pricing directly inside raw measurements or raw takeoff measurements
- direct takeoff-to-invoice behavior
- direct measurement-to-invoice behavior
- customer exposure of internal cost, markup, margin, or production assumptions
- AI suggestions to become customer-facing estimate content without approval
- cross-tenant catalog, template, takeoff, AI Capture, estimate, or import access
- silent recalculation that overwrites reviewed generated lines or past estimate pricing

Required safeguards:
- preserve tenant isolation
- preserve canonical workflow continuity
- preserve source traceability
- keep measurements, takeoff, and AI Capture as quantity sources
- map generated content through System Templates and catalog/cost items
- keep the estimate as the canonical customer-facing commercial scope record
- flag out-of-sync generated content when source measurements or templates change after generation
