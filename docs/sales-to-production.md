# Sales To Production Workflow

Status: target sales and commercial workflow design.

This document describes the broader sales, commercial, and readiness workflow FloorConnector is intended to support from first inquiry through production readiness.

It complements:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): implemented and near-term workflow direction
- [docs/workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md): primary guided contractor path
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

Use [docs/workflows.md](C:/FloorConnector/docs/workflows.md) as the canonical current and near-term contractor workflow document. This file is the broader target commercial workflow framing.

## Purpose

This document exists to capture the wider business process around contractor revenue generation so product decisions stay aligned with how specialty surface contractors actually operate.

It is not a claim that every stage below is already fully implemented. For implemented status, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Core Principles

### 1. Single Shared Record Flow

Data should move forward through the same canonical chain:

`opportunity -> customer -> project -> estimate -> contract -> financial readiness -> job / production -> invoice -> payment`

That flow may tighten over time into a more project-centered UX, but the key rule is unchanged:
- no duplicate re-entry of core business data at later stages
- no disconnected contract, billing, or production records

### 2. Project As Operational Root

Once work becomes real enough to deliver, the project should become the operational home for:
- commercial context
- execution readiness
- job planning
- downstream billing context

### 3. Workflow Over Modules

FloorConnector should behave like one connected contractor workflow, not a stack of disconnected modules.

### 4. Financing And Financial Readiness Are Workflow Stages

Financial readiness may include:
- deposit requirements
- financing qualification or approval
- internal commercial approval
- readiness-to-schedule checks

The point is not simply whether an invoice exists. The point is whether sold work is truly ready to move into operations.

## End-To-End Workflow

### 1. Lead Intake

Possible sources:
- website contact form
- inbound phone or email
- inspection request
- manual sales entry
- future estimator or scheduler entry points

Core intake data:
- name
- contact information
- address
- service type
- notes
- source

### 2. Qualification And Customer Creation

Qualified leads become:
- canonical customer records
- optionally linked opportunities if intake started before the customer record existed

Customer becomes the shared relationship record for all future work.

### 3. Opportunity And Site Assessment

Purpose:
- preserve real job context before final scope is priced

May include:
- Measurements such as length x width, direct square footage, direct linear footage, and counts
- photos
- uploaded plans or drawings later
- substrate condition
- prep requirements
- recommended system
- scope notes

Input sources may be:
- on-site inspection
- customer-provided measurements and requirements
- customer-provided plans and photos later
- contractor-uploaded plans, photos, and site information later
- future instant-estimate tooling

Future Takeoff & Scope Intelligence:
- site assessment may feed project-scoped takeoff work before estimate creation
- manual measurements are not takeoff; Takeoff means plan, PDF, or drawing-based measurement
- AI Capture is a future photo, app, or AI-derived input method
- all input methods should feed the same estimate generation engine
- Takeoff and measurements produce quantities. Catalog/cost items define reusable cost, pricing, production, markup, and tax behavior. System Templates map quantities to grouped estimate content. Estimates define customer-facing pricing and commercial scope.
- takeoff should not own pricing, replace the estimate, or bypass the canonical commercial record chain

### 4. Estimate Creation

Estimate creation may eventually support:
- Quick Build, where the contractor selects a System Template, enters minimal measurements, and generates grouped estimate lines for review
- Detailed Build, where the contractor uses multiple rooms/zones, options, conditions, waste factors, optional components, overrides, and review before generation
- custom quote workflows
- system-based pricing
- square-foot pricing
- hybrid estimating
- reusable catalogs and assemblies
- System Templates made from catalog/cost items, formulas, grouping rules, optional components, and required inputs
- manual measurement-driven generation from length x width, direct floor area, direct linear footage, counts, and optional room/zone detail
- catalog/cost item defaults for internal cost, markup, pricing, production behavior, and tax behavior, with estimate-level overrides where the contractor intentionally changes the commercial setup
- takeoff-driven quantity generation from project-scoped plans, PDFs, drawings, photos, and site data
- cost item/catalog mapping from reviewed quantities into grouped estimate line items
- AI-assisted suggestions for measurements, areas, systems, cost-item mappings, and estimate drafts that remain reviewable and user-approved before becoming customer-facing

Current product direction keeps the estimate as the canonical commercial scope record.

In the future flow, Measurements, Takeoff, and AI Capture should produce reviewed quantities and scope items that flow through System Templates and reusable catalog/cost items before generating estimate line items. The estimate remains where the contractor decides what to charge. Human review and approval are required before generated line items become part of a customer-facing estimate.

Example measurement behavior:
- L x W can generate floor square footage.
- `(L x 2) + (W x 2)` can generate perimeter linear footage.
- integrated cove base and vinyl cove base are measured in linear feet and may be generated from perimeter or entered directly.

Pricing behavior:
- catalog/cost item default cost, markup, price, labor, production, and tax behavior are internal
- customer-facing estimate output should show only customer-facing description, quantity, unit price, and total
- markup and cost should not appear on customer-facing estimate output
- contractors should be able to make one-off price overrides on estimate lines or update catalog/cost database defaults for future estimates
- imported estimate lines should preserve their snapshot price, markup, and override behavior
- new lines added from catalog should use current item defaults
- past estimates should not mutate when catalog defaults change

Generated estimate line items should eventually retain source traceability back to the takeoff scope item, takeoff measurement, and source document or photo when applicable. If takeoff quantities change after estimate generation, the system should flag the takeoff-estimate link or estimate as out of sync so users know the estimate may need review.

The target estimate generation path is `Lead / Opportunity -> Customer + Project -> Site Info / Measurements / Plans / Photos -> Measurement, Takeoff, or AI Capture -> System Template -> Catalog/Cost Item Mapping -> Grouped Estimate Line Items -> Estimate -> Contract -> Job -> Invoice -> Payment`.

Takeoff and measurement quantities should eventually help with material requirements, labor estimation, production readiness, and job planning. The financial record path still runs through the canonical estimate workflow; there should be no direct takeoff-to-invoice workflow.

Current implementation note:
- the live estimate workspace is inventory-first, using shared `catalog_items` plus reusable systems/components instead of disconnected manual estimate rows
- canonical pricing truth lives in `estimate_line_items`
- defaults hydrate only when estimate content is initially empty, then stop reapplying automatically after user edits

### 5. Estimate Review

The estimate stage should support:
- draft
- sent
- customer review
- revisions
- approval or rejection

### 6. Contract Generation

Approved estimates should make the work eligible for contract generation.

Contracts should be:
- generated from approved estimates
- merged with project and customer context
- editable while still in draft
- locked after signature activity begins

### 7. Contract Approval And Signature Readiness

This stage may include:
- internal approval requirements
- send readiness
- customer signature
- contractor countersign later where needed

### 8. Financial Readiness

After contract completion, the work may require:
- deposit collection
- financing approval
- internal green-light checks

This is the stage that determines whether work is actually ready for production scheduling.

### 9. Scheduling And Production Readiness

Once work is commercially and financially ready, operations should be able to:
- create or confirm the job/work order
- assign schedule readiness
- move toward crew assignment and production planning later
- prepare a future subcontractor, vendor, or partner-contractor handoff when an external collaborator is needed for scoped work

### 10. Job Execution

Later operational depth should support:
- field execution tracking
- crew workflows
- daily logs
- time tracking
- production visibility
- scoped external partner updates, photos, field notes, and progress signals where a subcontractor, vendor, or partner contractor has been explicitly invited to the project or job

### 11. Invoice, Payment, And Closeout

Billing should stay connected to the same project, customer, estimate, contract, and optional job context.

This stage should support:
- invoice creation
- payment recording
- balance tracking
- retainage-aware and future progress-billing-aware financial behavior

## Configuration Requirements

The broader workflow depends on configuration at two layers.

### Platform / Super Admin

Super admin should define:
- platform starter templates
- platform starter catalogs
- platform starter systems / System Templates
- import or review contractor-created shareable systems
- strip or anonymize cost and markup before promotion
- promote reviewed systems to platform templates
- version platform templates so contractor-owned copies are not silently broken
- global financial defaults
- global workflow defaults
- feature and module policy

### Contractor Organization

Contractor admins should manage:
- organization-owned templates
- organization-owned reusable items
- adoption of platform-seeded System Templates
- organization-owned System Templates
- local editable copies, defaults, and estimate-generation use of System Templates
- optional sharing of contractor-created templates back to the platform for review
- tax defaults
- retainage defaults
- contract workflow defaults
- deposit or readiness preferences
- allowed feature overrides

## What We Avoid

FloorConnector should avoid:
- duplicate data between modules
- disconnected contract and invoice systems
- module-specific template silos
- manual re-entry of estimate or contract data downstream
- contractors depending directly on one mutable global starter record
- a separate takeoff or estimating silo disconnected from project, catalog, and estimate records
- direct takeoff-to-invoice behavior that bypasses reviewed estimate line items and approved commercial scope
- pricing directly inside raw takeoff measurements
- AI-generated customer-facing estimates without contractor approval
- duplicate project, estimate, catalog, invoice, or template models for takeoff or estimating
- takeoff behavior that weakens tenant isolation or breaks canonical workflow continuity
- generated estimate content with no source traceability back to System Template, measurement/takeoff input, and source file or photo where applicable
- silent reuse of generated estimate content after source inputs change without an out-of-sync or needs-review signal
- free-floating contractor chat that is not tied back to canonical project, job, financial, or field records
- external partner access that exposes customer contact data, pricing, files, pipeline, or project history without explicit permissions

## Future Extensions

Future workflow expansion may include:
- richer estimator tooling
- Takeoff & Scope Intelligence for manual/on-screen takeoff, AI-assisted suggestions, cost item mapping, and estimate generation
- online scheduling
- customer portal flows
- full AIA/progress billing workflows
- communications and notifications
- CRM and sales pipeline depth
- deeper production and field execution tooling
- subcontractor handoff from financially ready project/job records
- overflow work sharing and partner contractor collaboration after project, financial, permission, and compliance readiness are clear

External partner access must be scoped and permissioned. Customer contact data, pricing, project files, and billing context should be hidden by default and shared intentionally only where the contractor organization has granted access for a specific project, job, or related record.

## Summary

This workflow is meant to represent how contractors actually move work from inquiry through sale, readiness, production, billing, and collection.

The product should keep strengthening one connected business chain rather than letting each stage become its own isolated subsystem.
