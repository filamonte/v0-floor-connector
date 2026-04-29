# FloorConnector System Inventory

Status: current and future system inventory.

This document is a lightweight inventory of notable product systems. It should be read with [docs/current-state.md](C:/FloorConnector/docs/current-state.md), which remains the source of truth for implemented status.

## Not Built Yet

### Takeoff & Scope Intelligence

Status: Not implemented yet.

Takeoff & Scope Intelligence is a future project-scoped system for turning job plans, PDFs, drawings, photos, site information, and reviewed quantities into estimate-generation inputs for the canonical estimate workflow.

Related Estimate Builder planning docs:
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
