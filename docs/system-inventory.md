# FloorConnector System Inventory

Status: current and future system inventory.

This document is a lightweight inventory of notable product systems. It should be read with [docs/current-state.md](C:/FloorConnector/docs/current-state.md), which remains the source of truth for implemented status.

## Not Built Yet

### Site Visit Scope Intake

Status: Lightweight lead-workspace intake is implemented; deeper estimate-feed behavior is planned.

[docs/site-visit-scope-intake-plan.md](C:/FloorConnector/docs/site-visit-scope-intake-plan.md) defines the planning guardrails for Scope Intake as the structured step between a site visit appointment and estimate planning.

Implemented today:
- lead workspace capture for manual measurement rows
- derived measurement units for area, linear, and count inputs
- structured observations with type and severity
- linked intake file fields as supporting evidence

Planned direction:
- clearer lead workspace sections for Overview, Contact / Address, Site Visit, Scope Intake, Estimate Plan, and Notes / Activity
- reviewed handoff from intake into system template selection, SOW generation, estimate draft lines, and labor/material planning
- no direct Scope Intake to invoice behavior

### UI, Directory, Tax, Estimate Editor, Workflow Guidance, And Project Address Alignment

Status: Planning backlog; not an implementation plan by itself.

[docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md) captures system-level improvements identified from product review before broader demo/investor polish and deeper feature expansion.

Planned alignment areas:
- contractor UI color, contrast, section hierarchy, status color, table/card, and action-hierarchy polish
- uniform module-page defaults across header/title, primary actions, workflow guidance, filters/search, and list/card/table content
- shared directory/contact direction that avoids duplicate person, customer, vendor, portal-user, and project-contact models
- estimate editor navigation, review/send actions, internal markup controls, and line taxable-toggle planning
- contractor tax settings/rates direction, item default taxability, line-level taxable override, and customer/project tax applicability context
- context-aware workflow guidance with complete, current, blocked, and future visual states
- structured project/service address display distinct from customer billing/contact address
- later configurable dashboard and module data views after strong defaults are standardized

Priority grouping:
- Now / demo polish: estimate editor navigation/review actions, project service-address display, line taxable-toggle planning, and UI consistency audit
- Next / system alignment: directory/contact unification plan, tax settings/rates model, and uniform module-page polish
- Later / platform depth: customizable dashboard/module views, USPS or other address verification, and advanced permissions/portal directory management

This backlog is intentionally planning-only until specific implementation tasks are requested.

### Templates & Systems Administration

Status: Dedicated module not implemented yet.

FloorConnector has implemented shared document-template and reusable catalog foundations, but a dedicated Templates & Systems settings/admin area is planned future direction. That area should eventually manage document templates, System Templates, add-ons/options, and sharing/review settings without scattering those controls across estimates, invoices, contracts, and other modules.

Planned document template scope:
- estimate templates
- invoice templates
- contract templates
- proposal/SOW templates
- future work order templates

Planned document template rules:
- contractors have defaults
- contractors can switch supported templates per estimate, invoice, or contract
- contractors can create and edit local copies
- super admin can seed platform defaults
- platform defaults are copied into contractor-owned templates and do not live-mutate contractor copies

Planned System Template scope:
- epoxy flake systems
- urethane cement systems
- polishing systems
- garage systems
- commercial systems

System Templates should map measurements, intake, and future takeoff quantities to catalog/cost items and grouped estimate output.

Planned add-ons/options:
- integrated cove base
- vinyl cove base
- control joints
- crack repair
- coating removal
- coal tar epoxy
- moisture mitigation
- extra topcoat
- prevailing wage labor adjustment
- mobilization/setup

Add-ons may be square-foot based, linear-foot based, each/count based, project/flat-price based, or labor/multiplier based later. Cove base should be treated as a hybrid: not a full floor system by itself, but a catalog item plus optional system/add-on component that can be selected, generated from perimeter, or entered directly.

Planned sharing loop:
- contractor can mark templates, systems, or add-ons shareable
- default sharing opt-in behavior should be configurable in settings
- super admin can review, import, and promote selected submissions
- costs, markup, margin, private notes, internal pricing, and production math should be stripped, anonymized, or explicitly reviewed before promotion
- promoted versions become platform defaults for other contractors to adopt
- contractor local copies are never silently updated by promoted platform versions

Labor direction:
- labor should eventually be an internal catalog/cost item component
- long-term labor modeling may include crew size, production rate, minimum site time, markup, and condition/access multipliers
- near-term labor may remain baked into system pricing
- customer-facing templates should not expose cost, markup, margin, private notes, or internal production math unless intentionally configured as customer-facing language

Display-template direction:
- clean grouped customer view should be the default
- detailed line-item view should be available
- SOW plus price view should be available
- contractors should be able to switch supported display templates per estimate, invoice, or contract
- custom templates are a later direction

### Takeoff & Scope Intelligence

Status: Not implemented yet.

Takeoff & Scope Intelligence is a future project-scoped system for turning job plans, PDFs, drawings, photos, site information, and reviewed quantities into estimate-generation inputs for the canonical estimate workflow.

Related Estimate Builder planning docs:
- [docs/site-visit-scope-intake-plan.md](C:/FloorConnector/docs/site-visit-scope-intake-plan.md): pre-estimate Scope Intake planning guardrails
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term master build plan
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): constrained V1 execution slice
- [docs/estimate-builder-system-generation-spec.md](C:/FloorConnector/docs/estimate-builder-system-generation-spec.md): system-generation planning detail

Terminology:
- Measurements are manual inputs such as length x width, direct square footage, direct linear footage, and counts.
- Takeoff means plan, PDF, or drawing-based measurement.
- AI Capture is a future photo, app, or AI-derived measurement input method.
- System Templates are reusable estimating systems made from catalog/cost items, formulas, grouping rules, optional components, and required inputs.
- Catalog/Cost Items define reusable pricing, cost, production, markup, and tax behavior.
- Estimates are customer-facing commercial scope and price.

Planned capabilities may include:
- manual measurement-driven estimate generation from length x width, direct floor area, direct linear footage, counts, and optional room/zone detail
- Quick Build: select a System Template, enter minimal measurements, and generate grouped estimate lines for review
- Detailed Build: multiple rooms/zones, options, conditions, waste factors, optional components, overrides, and review before generation
- on-screen plan, PDF, and image takeoff
- scale calibration
- area, linear, count, and optional volume measurements
- site photo, plan, and project file inputs
- AI Capture and AI-assisted measurement suggestions
- AI-assisted scope suggestions
- AI-assisted system, cost-item mapping, and estimate-draft suggestions
- System Template selection and formula-driven quantity mapping
- cost item/catalog mapping
- estimate line item generation
- source traceability from generated estimate line items back to approved takeoff scope items, takeoff measurements, and source documents or photos when applicable
- out-of-sync review state when takeoff quantities change after estimate generation
- material requirements, labor estimation, production readiness, and job planning inputs after estimate review

Positioning guardrails:
- this is not implemented today
- this is not a separate estimating app
- takeoff must be project-scoped
- manual measurements are not takeoff
- Takeoff and measurements produce quantities
- catalog/cost items define reusable cost, pricing, production, markup, and tax behavior
- System Templates map quantities to grouped estimate content
- estimates define customer-facing pricing and commercial scope
- pricing should live in catalog/cost items and estimates, not directly inside raw takeoff measurements
- customer-facing estimate output should not expose internal cost or markup
- generated estimate line items should retain source linkage back to the approved takeoff scope item, measurement, and source file context when this future layer exists
- if takeoff, measurement, AI Capture, or source inputs change after estimate generation, the estimate or estimate-generation link should be flagged out of sync for contractor review
- AI-assisted measurements, areas, systems, scope suggestions, cost-item mappings, and estimate drafts must be explicitly approved before becoming customer-facing estimate content
- takeoff must not create a direct takeoff-to-invoice workflow
- takeoff must not introduce duplicate project, estimate, catalog, invoice, or template models
- future implementation must preserve tenant isolation and canonical workflow continuity

Future components:
- project-scoped takeoffs
- manual measurement inputs
- AI Capture inputs
- takeoff documents
- takeoff measurements
- takeoff scope items
- System Templates
- takeoff-to-estimate links
- cost item/catalog mapping
- estimate line item generation
- source traceability
- out-of-sync review state

These are conceptual only and are not existing tables. Any future implementation must preserve tenant isolation, project ownership, catalog/cost item mapping, System Template mapping, human review, and the canonical `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` workflow.

Next dependency:
- catalog/cost item design is the next dependency for this future system, especially reusable cost behavior, markup/profitability handling, production behavior, tax behavior, System Templates, and estimate-level override rules.
