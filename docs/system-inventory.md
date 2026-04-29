# FloorConnector System Inventory

Status: current and future system inventory.

This document is a lightweight inventory of notable product systems. It should be read with [docs/current-state.md](C:/FloorConnector/docs/current-state.md), which remains the source of truth for implemented status.

## Not Built Yet

### Takeoff & Scope Intelligence

Status: Not implemented yet.

Takeoff & Scope Intelligence is a future project-scoped system for turning job plans, photos, and site information into reviewed quantities that can feed the canonical estimate workflow.

Planned capabilities may include:
- on-screen plan, PDF, and image takeoff
- scale calibration
- area, linear, count, and optional volume measurements
- site photo, plan, and project file inputs
- AI-assisted measurement suggestions
- AI-assisted scope suggestions
- cost item/catalog mapping
- estimate line item generation
- source traceability from generated estimate line items back to approved takeoff scope items, takeoff measurements, and source documents or photos when applicable
- out-of-sync review state when takeoff quantities change after estimate generation
- material requirements, labor estimation, production readiness, and job planning inputs after estimate review

Positioning guardrails:
- this is not implemented today
- this is not a separate estimating app
- takeoff must be project-scoped
- takeoff produces quantities
- catalog/cost items define reusable cost, pricing, production, and tax behavior
- estimates define customer-facing pricing and commercial scope
- pricing should live in catalog/cost items and estimates, not directly inside raw takeoff measurements
- generated estimate line items should retain source linkage back to the approved takeoff scope item, measurement, and source file context when this future layer exists
- if takeoff changes after estimate generation, the estimate or takeoff-estimate link should be flagged out of sync for contractor review
- AI-assisted measurements, scope suggestions, and cost-item mappings must be explicitly approved before becoming customer-facing estimate content
- takeoff must not create a direct takeoff-to-invoice workflow
- takeoff must not introduce duplicate project, estimate, catalog, or invoice models
- future implementation must preserve tenant isolation and canonical workflow continuity

Future components:
- project-scoped takeoffs
- takeoff documents
- takeoff measurements
- takeoff scope items
- takeoff-to-estimate links
- cost item/catalog mapping
- estimate line item generation
- source traceability
- out-of-sync review state

These are conceptual only and are not existing tables. Any future implementation must preserve tenant isolation, project ownership, catalog/cost item mapping, human review, and the canonical `opportunity -> customer -> project -> estimate -> contract / job -> invoice -> payment` workflow.

Next dependency:
- catalog/cost item design is the next dependency for this future system, especially reusable cost behavior, markup/profitability handling, production behavior, tax behavior, and estimate-level override rules.
