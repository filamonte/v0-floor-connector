# Sales To Production Workflow

Status: Planned
Doc Type: Operational

This document describes the broader sales, commercial, and readiness workflow FloorConnector is intended to support from first inquiry through production readiness.

It complements:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity roadmap
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

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Public acquisition extends the front of this chain. Contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, AI intake, campaign attribution, reviews, galleries, portals, communications, and operational workflows should all reinforce one shared workflow graph:

`public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`

Financial readiness, scheduling readiness, production readiness, and similar checkpoints are supporting workflow stages operating on the same canonical record chain. They do not introduce new record types, replace the lifecycle, become replacement records, or create a separate module-owned lifecycle.

That flow may tighten over time into a more project-centered UX, but the key rule is unchanged:

- no duplicate re-entry of core business data at later stages
- no disconnected contract, billing, or production records
- no duplicate marketing/contact database, website lead store, or disconnected public website system
- no visualizer-only, file-only, communication-only, or module-local records presented as business truth when the same context belongs on the shared chain

Future pre-lead visual/product/finish selection may happen before a formal opportunity exists. That should extend the lifecycle concept, not replace it: selected finish/spec context can begin early, then attach to `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` when the contractor accepts it into the operational workflow.

### 2. Project As Operational Root

Once work becomes real enough to deliver, the project should become the operational home for:

- commercial context
- execution readiness
- job planning
- downstream billing context
- selected finish/spec context
- shared files, evidence, communication history, delivery proof, and activity timeline views

Near-term UI ownership for customer/contact/access/review workflows is captured in [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md). Customer account pages should not become execution or access-management corridors; People owns contacts/access, Project owns project-specific operational state, and record workspaces stay focused on their immediate proposal, signature, or billing job.

### 3. Workflow Over Modules

FloorConnector should behave like one connected contractor workflow, not a stack of disconnected modules.

That includes files, product selections, spec sheets, visualizer renders, delivery events, and communication history. These should be linkable across canonical records instead of trapped in module-specific silos.

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

- contractor-owned website contact form
- tenant-owned domain pages
- SEO/service/location pages
- landing pages
- campaign/ad/referral links with source attribution
- public forms
- website AI chat
- AI receptionist / phone intake
- human-assisted intake
- AI-assisted qualification
- inbound phone or email
- inspection request
- manual sales entry
- future estimator or scheduler entry points
- future room visualizer or product/finish selection entry points

Core intake data:

- name
- contact information
- address
- service type
- notes
- source
- campaign/source attribution where known
- selected finish/system/spec context when a future pre-lead visual or product selection exists

Target acquisition continuity:

`SEO/ad/campaign -> visit -> lead form or AI intake -> opportunity -> estimate -> contract -> revenue`

Website-generated opportunities should enter the canonical workflow. They should not create a second CRM, separate marketing-contact database, disconnected website lead table, or portal-only customer copy.

Future visual/product/finish selection:

- a customer can choose a finish/system visually before becoming a full lead or customer
- supported future finish families include decorative flake, metallic epoxy, decorative quartz, solid color, and future surface systems
- manufacturer/product metadata should support Torginol-style vendor, product line, product code, product image, spec sheet, and technical note fields without hardcoding a vendor dependency
- visual selections should later become canonical selected-system/spec records when they are used operationally, not disposable session-only data

Future AI intake direction:

- website AI chat, AI receptionist/voice, missed-call text-back, website forms, email, SMS, and human-assisted intake should all resolve into canonical opportunity workflows with source context where available
- AI may classify the source, summarize the inquiry, identify missing qualification fields, and prepare follow-up or appointment suggestions
- AI may help generate or maintain contractor-owned service/location/landing-page content later, but accepted intake and customer commitments must still flow through canonical records
- AI should not create AI-only lead/customer/project records, separate marketing knowledge stores, disconnected website content truth, or customer-facing commitments without human confirmation and validated workflows

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
- visualizer renders, product images, finish samples, spec sheets, and product technical notes later
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
- future pre-lead visualizer/product selection handoff

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

Display-template behavior:

- clean grouped customer-facing output should be the default
- detailed line-item output should be available when the contractor wants transparency or itemized presentation
- SOW plus price output should be available when the contractor wants a concise proposal format
- contractors should be able to switch supported display templates per estimate, invoice, or contract
- custom output templates can be supported later through the shared document-template foundation

Generated estimate line items should eventually retain source traceability back to the takeoff scope item, takeoff measurement, and source document or photo when applicable. If takeoff quantities change after estimate generation, the system should flag the takeoff-estimate link or estimate as out of sync so users know the estimate may need review.

The target estimate generation path still feeds the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Site info, measurements, plans, photos, Measurement, Takeoff, AI Capture, System Templates, Catalog/Cost Item Mapping, and grouped estimate line items are supporting estimate-input stages. They operate within the same project and estimate workflow; they do not create a parallel lifecycle or replace the canonical chain.

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
- informed by the selected finish/system/spec context that represents what is being sold and installed

Future selected-system/spec behavior:

- finish systems are not loose estimate line-item descriptions
- selected systems/specs represent the actual sold and installed surface system
- selected system/spec context should flow into estimate, contract, job, portal review, closeout, and warranty context
- once approved or once contract/signature activity begins, selected systems should be snapshotted or locked like financial/document truth
- later changes should move through revision or change-order style workflows instead of silent edits

### 7. Contract Approval And Signature Readiness

This stage may include:

- internal approval requirements
- send readiness
- customer signature through portal signing or contractor-assisted onsite signing
- contractor countersign later where needed

Current implementation note:

- contractor-side onsite signing supports in-person close workflows and acts on the same canonical contract, signer, and signature-event records as portal signing
- onsite signing can satisfy signature readiness only when all required signers are complete; financial readiness after signature remains conditional on organization deposit or financing settings

### 8. Financial Readiness

After contract completion, the work may require:

- deposit collection
- financing approval
- internal green-light checks

This is the stage that determines whether work is actually ready for production scheduling.

If deposit readiness is required, deposit invoicing and payment collection should use the existing canonical invoice/payment chain with the `deposit` workflow role. If deposits are not required, signature completion can allow the project to proceed toward scheduling readiness.

### 9. Scheduling And Production Readiness

Once work is commercially and financially ready, operations should be able to:

- create or confirm the job/work order
- assign schedule readiness
- move toward crew assignment and production planning later
- prepare a future subcontractor, vendor, or partner-contractor handoff when an external collaborator is needed for scoped work
- invite an approved partner contractor for execution support only through
  explicit project/job-scoped collaboration after readiness, permissions, and
  compliance checks are satisfied

Target appointment scheduling from lead/opportunity:

- lead or opportunity intake should support scheduling a sales appointment or site assessment before a full project exists
- the appointment should attach to the canonical opportunity and later preserve customer/project links when the workflow advances
- AI may suggest appointment windows based on availability, location, external busy blocks, and contractor preferences, but the committed appointment should be confirmed through canonical scheduling workflows

### 10. Job Execution

Later operational depth should support:

- field execution tracking
- crew workflows
- daily logs
- time tracking
- production visibility
- scoped external partner updates, photos, field notes, and progress signals where a subcontractor, vendor, or partner contractor has been explicitly invited to the project or job

Future approved partner collaboration should support execution help without
moving ownership of the canonical commercial or financial chain. The owning
contractor remains responsible for customer, project, estimate, contract,
invoice, and payment truth unless a later multi-party commercial model is
intentionally designed.

### 11. Invoice, Payment, And Closeout

Billing should stay connected to the same project, customer, estimate, contract, and optional job context.

This stage should support:

- invoice creation
- payment recording
- balance tracking
- retainage-aware and future progress-billing-aware financial behavior
- closeout evidence, selected finish/spec references, warranty context, and payment-request delivery proof tied back to canonical records

## Future Agentic Operations Extension

The future Agentic Operations Layer may assist the sales-to-production path by
preparing intake summaries, qualification questions, onsite visit options,
estimate drafts, payment follow-up, scheduling coordination, customer replies,
and field/admin documentation.

All AI assistance must preserve the single shared record flow:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

AI can reduce admin labor by summarizing, drafting, recommending, and preparing
reviewable actions. It must not introduce duplicate operational records,
AI-only leads, AI-only customer/project/invoice/payment truth, disconnected
assistant memory, or customer-facing commitments outside approved workflows.

## Shared Files, Delivery Proof, And Activity Memory

This is target architecture only.

Future shared file/evidence behavior should support:

- product images
- room photos
- visualizer renders
- spec sheets
- signed documents
- field photos
- markups
- closeout evidence

Files should be linkable to multiple canonical records, including project, opportunity, estimate, contract, job, invoice, payment, change order, daily log, field note, selected system/spec, and finish product. Existing execution attachments remain the current implementation; the long-term direction is a shared file/evidence layer rather than module-specific attachment silos.

Future communication and delivery proof behavior should support customer and contractor communications across email, SMS, portal, app, and manual logs. Sending estimates, invoices, contracts, change orders, portal invites, and payment requests should create canonical communication/delivery records.

Delivery events should include queued, sent, delivered, opened, clicked, deferred, bounced, blocked, dropped, and failed when provider data supports those states. Provider data is delivery telemetry, not the business source of truth. FloorConnector should store immutable delivery events tied back to canonical records. Open and click tracking are useful signals, not perfect legal certainty.

Future activity timelines should summarize important lifecycle events such as finish selected, estimate sent/viewed/approved, contract sent/signed, invoice sent/paid, payment completed, file uploaded, message received, job scheduled, daily log finalized, and closeout evidence captured. The activity timeline is a readable company-brain layer over canonical records, not a replacement source of truth.

## Configuration Requirements

The broader workflow depends on configuration at two layers.

### Platform / Super Admin

Super admin should define:

- platform starter document templates for estimates, invoices, contracts, proposals/SOW, and future work orders
- platform starter catalogs
- platform starter systems / System Templates
- platform starter add-ons/options where they are broadly useful
- import or review contractor-created shareable document templates, systems, and add-ons
- strip, anonymize, or explicitly review cost, markup, margin, private notes, internal pricing, and production assumptions before promotion
- promote reviewed systems, add-ons, or document templates to platform defaults
- version platform defaults so contractor-owned copies are not silently broken
- global financial defaults
- global workflow defaults
- feature and module policy

### Contractor Organization

Contractor admins should manage:

- organization-owned document templates
- organization-owned reusable items
- adoption of platform-seeded System Templates
- organization-owned System Templates
- local editable copies, defaults, and estimate-generation use of System Templates
- add-ons/options backed by catalog items
- optional sharing of contractor-created templates, systems, or add-ons back to the platform for review, with default opt-in behavior configurable in settings
- tax defaults
- retainage defaults
- contract workflow defaults
- deposit or readiness preferences
- allowed feature overrides

Templates & Systems direction:

- these controls should eventually live in a dedicated Templates & Systems settings/admin area instead of being scattered across estimate, invoice, contract, and catalog surfaces
- platform defaults should be copied into contractor-owned templates or systems on adoption
- promoted platform versions should become available for other contractors to adopt, but should not silently update existing contractor local copies

## What We Avoid

FloorConnector should avoid:

- duplicate data between modules
- duplicate marketing/contact databases, public website lead stores, or disconnected contractor website systems
- disconnected contract and invoice systems
- module-specific template silos
- module-specific file, attachment, product-selection, delivery-proof, or communication silos
- manual re-entry of estimate or contract data downstream
- contractors depending directly on one mutable global starter record
- visualizer selections that never become canonical selected-system/spec context once used operationally
- treating finish systems as loose text descriptions once they represent sold and installed scope
- silent edits to selected systems after approval or signature activity begins
- a separate takeoff or estimating silo disconnected from project, catalog, and estimate records
- direct takeoff-to-invoice behavior that bypasses reviewed estimate line items and approved commercial scope
- pricing directly inside raw takeoff measurements
- AI-generated customer-facing estimates without contractor approval
- AI-only leads, customers, estimates, projects, calendars, or communication logs
- AI-only website knowledge silos that diverge from canonical services, project proof, customer communication, or workflow history
- AI-generated customer commitments, scheduling commitments, contract actions, invoices, payment requests, or permission changes without approved workflow confirmation
- duplicate project, estimate, catalog, invoice, or template models for takeoff or estimating
- takeoff behavior that weakens tenant isolation or breaks canonical workflow continuity
- generated estimate content with no source traceability back to System Template, measurement/takeoff input, and source file or photo where applicable
- silent reuse of generated estimate content after source inputs change without an out-of-sync or needs-review signal
- free-floating contractor chat that is not tied back to canonical project, job, financial, or field records
- provider telemetry treated as the legal/business source of truth instead of immutable FloorConnector delivery events
- external partner access that exposes customer contact data, pricing, files, pipeline, or project history without explicit permissions

## Future Extensions

Future workflow expansion may include:

- richer estimator tooling
- contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign/source attribution, generated marketing content, and website-to-revenue continuity
- review/reputation, testimonials, before/after galleries, and project-proof surfaces tied back to canonical project/job/closeout evidence where appropriate
- pre-lead visualizer handoff into canonical opportunity/customer/project workflows
- product/finish/spec management for decorative flake, metallic epoxy, decorative quartz, solid color, and future surface systems
- shared file/evidence layer with multi-record links
- Takeoff & Scope Intelligence for manual/on-screen takeoff, AI-assisted suggestions, cost item mapping, and estimate generation
- online scheduling
- customer portal flows
- full AIA/progress billing workflows
- communications, notifications, delivery attempts, and immutable delivery events
- activity timelines over the project/customer/record chain
- CRM and sales pipeline depth
- deeper production and field execution tooling
- subcontractor handoff from financially ready project/job records
- overflow work sharing and partner contractor collaboration after project, financial, permission, and compliance readiness are clear

External partner access must be scoped and permissioned. Customer contact data, pricing, project files, and billing context should be hidden by default and shared intentionally only where the contractor organization has granted access for a specific project, job, or related record.

## Summary

This workflow is meant to represent how contractors actually move work from inquiry through sale, readiness, production, billing, and collection.

The product should keep strengthening one connected business chain rather than letting each stage become its own isolated subsystem.
