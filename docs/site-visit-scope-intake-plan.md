# Site Visit Scope Intake Plan

Status: planning and workflow-alignment document.

This document defines the intended role of Scope Intake in the FloorConnector lead-to-estimate workflow. It does not authorize new schema, routes, AI workflows, takeoff tooling, estimate generation, or invoice behavior by itself.

Use this with:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): canonical workflow direction
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term Estimate Builder blueprint
- [docs/system-inventory.md](C:/FloorConnector/docs/system-inventory.md): current and future system inventory

## Purpose

Scope Intake is the structured capture step that happens around a lead site visit or inspection. Its job is to record what the contractor saw, measured, photographed, and learned before estimating begins.

Scope Intake should help estimators avoid re-entry, preserve site context, and prepare a cleaner handoff into the estimate plan and estimate editor. It is not the customer-facing commercial quote, and it is not a replacement for the estimate.

The intended workflow placement is:

`Lead -> Site Visit Appointment -> Scope Intake -> Estimate Plan -> Estimate`

## Terminology Boundaries

### Appointment

An Appointment is the calendar record for a visit, meeting, inspection, follow-up, or coordination block. Site visit appointments stay linked to the same opportunity, customer, and project chain where available.

Appointments answer: when is the visit, who is involved, and what calendar/workflow status does it have?

### Scope Intake

Scope Intake is the structured pre-estimate record of site conditions, measurements, observations, requested finish, logistics, files, and notes captured from or around the site visit.

Scope Intake answers: what did we learn at the site that should inform estimating?

### Measurements

Measurements are manual quantity inputs such as room or area labels, direct square footage, linear footage, counts, length x width, cove base linear footage, and similar contractor-entered quantities.

Measurements are not takeoff.

### Takeoff

Takeoff means plan, PDF, drawing, or scaled-image measurement. Takeoff is a future project-scoped system that may produce reviewed quantities for estimate generation.

Takeoff answers: what quantities were derived from plans, drawings, PDFs, or calibrated visual sources?

### AI Capture

AI Capture is a future app, photo, plan, or AI-derived input source. It may suggest measurements, conditions, systems, cost-item mappings, scope language, or draft estimate content.

AI Capture suggestions must remain reviewable and user-approved before they affect customer-facing estimate content.

## Lead Workspace Placement

The lead workspace should eventually organize the pre-estimate journey into these left-side contextual sections:

- Overview
- Contact / Address
- Site Visit
- Scope Intake
- Estimate Plan
- Notes / Activity

The Site Visit section should focus on appointment state, scheduled/completed dates, and visit workflow guidance.

The Scope Intake section should focus on structured field capture for measurements, observations, requested finish, site conditions, removal, repairs, files, logistics, and estimator notes.

The Estimate Plan section should eventually help translate reviewed intake into an estimating approach before the contractor enters or generates customer-facing estimate lines.

## Dynamic Scope Factors

Scope Intake should capture or support factors that materially change epoxy flooring, concrete polishing, and specialty surface estimating:

- system type
- removal
- existing floor type
- cove base
- cracks
- joints
- moisture
- access
- phasing
- labor
- add-ons

These factors should help shape estimator review, system template selection, SOW language, and later material/labor planning. They should not directly create invoices or bypass estimate review.

## Intake Fields

Scope Intake should support structured capture for:

- measurements
- requested finish
- current conditions
- removal
- repairs
- cove base
- photos/files
- logistics
- notes

Measurements should support room or area labels, measurement type, value, derived unit, quantity, capture method, and notes.

Observations should support type, severity, title, and detail so field conditions can be scanned and prioritized before estimate authoring.

Photos and files should remain linked intake evidence rather than unstructured notes whenever possible.

## Future Estimate Feed

Scope Intake should eventually feed:

- system template selection
- SOW generation
- estimate draft lines
- labor/material planning

The feed should be review-first. Intake may suggest or prefill estimate planning decisions, but the contractor must be able to inspect, modify, or reject those suggestions before they become customer-facing estimate content.

Possible future handoff behavior:
- choose a likely system template from requested finish, system type, conditions, and measurements
- draft SOW language from reviewed conditions, removal, repairs, cove base, joints, moisture, logistics, and phasing
- generate draft estimate lines through System Templates and catalog/cost item mapping
- prepare material and labor assumptions after the estimate is reviewed

## Guardrails

- Scope Intake is not Takeoff.
- No direct intake-to-invoice behavior.
- Estimate remains the canonical commercial scope.
- AI suggestions require review.
- Contractors can still create blank/manual estimates.

Additional implementation guardrails:
- Scope Intake must not create a separate estimating silo.
- Intake, measurements, Takeoff, and AI Capture should feed the same canonical estimate workflow.
- Pricing belongs in catalog/cost items and estimate line items, not raw intake records.
- Customer-facing output should come from reviewed estimate content, not unreviewed intake or AI suggestions.
- Future generated estimate lines should preserve source traceability back to intake, measurement, takeoff, file, or AI Capture context where applicable.
