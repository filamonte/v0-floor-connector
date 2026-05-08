# FloorConnector Roadmap

Status: phased implementation plan.

This document describes the **phased implementation plan** for FloorConnector.

It tracks delivery sequence and major platform milestones. It should be read alongside:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for implemented status
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target system design
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term Estimate Builder blueprint
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): constrained Estimate Builder V1 scope
- [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md): UI, directory/contact, tax, Estimate Editoror, workflow-guidance, project-address, and configurable-view alignment backlog
- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md): target AI-assisted operating system direction
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

This document is sequencing guidance, not a claim that a later phase is already implemented. If status and plan conflict, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for current reality.

## Canonical Lifecycle Alignment

All roadmap phases extend and refine the same canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

No phase introduces a parallel workflow or replaces this chain. Later phases deepen, connect, and improve clarity within the same system.

Public acquisition extends the front of the same graph rather than creating a separate marketing product:

`public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`

Contractor websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, attribution, AI intake, reviews, galleries, portals, communications, and operational workflows should all reinforce that graph.

## Phase 1

**Current implemented foundation**

Phase 1 established the production-oriented core system. The branch already contains the shared architecture, tenant model, Supabase integration, and first connected business workflows. It does **not** mean every surface is fully polished, but the canonical operational backbone is in place.

Included in Phase 1:

- auth
- organizations and memberships
- opportunities / leads
- customers
- projects
- estimates and estimate line items
- approved estimate snapshots and customer portal approval flow
- shared templates
- change orders and approved change-order snapshots
- contracts
- contract signature foundation, customer-facing portal signing, and contractor-side onsite signing on canonical contracts
- jobs
- invoices and invoice line items
- snapshot-based invoice lineage and schedule-of-values lineage
- payments
- customer-facing payment foundation on canonical invoices and payments
- notifications, notification deliveries, and communications foundations
- people, vendors, and compliance foundations
- time tracking foundations
- daily logs and field-execution foundations
- customer portal access, review, and contract-signature foundations
- tax, retainage, and AIA-ready financial scaffolding

## Phase 2

**Current phase: Phase B validation and foundation hardening**

Current reality:

- first-pass operational depth, schedule, communications, reporting, Sales Tax Summary, manual notification-only automation, onboarding readiness, and contractor UI normalization foundations are implemented on the current branch
- `/schedule` has first-pass planner/board and crew-assignment continuity on canonical jobs and `job_assignments`
- `/communications` has a first contractor-side review surface, URL-driven filtering, safe replies on existing canonical threads, and notification triage without provider sends or automation execution
- `/reports` has narrow read-only internal-beta summaries over canonical records, including Sales Tax Summary

Current focus:

- run and record seed-free Phase B validation before contractor beta
- verify reporting and Sales Tax Summary accuracy against canonical invoices, payments, opportunities, estimates, projects, and tax snapshots
- validate the manual automation runner's duplicate guard and recipient behavior
- complete internal beta support/release checklist, onboarding runbook, beta candidate criteria, and bug triage process
- fix validation-blocking defects without expanding into unrelated feature breadth
- keep contractor admin and super-admin responsibilities clearly separated as more modules plug into settings
- document the future company-brain architecture without treating it as implemented behavior
- preserve the current canonical model while designing product/spec, shared file/evidence, and communication-delivery foundations
- tighten the project hub and readiness story around existing canonical records before adding broader new workflow depth

## Phase C: Operational Depth Systems

Planned focus:

- HR + OSHA / Safety System: Introduce incident entity, extend people, compliance_records, time tracking, projects/jobs for HR and safety management.

- Unified Task System: Define Task as canonical entity attaching to any record for assignable, lifecycle-tracked tasks.

- Progress Billing / AIA System: Extend ScheduleOfValues, invoices for % complete, G702/G703, retainage.

- Website + Lead Ingestion + Marketing Layer: Add the public acquisition layer for contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign/source attribution, and website-generated opportunities. This layer feeds canonical opportunities and must not create a second CRM or marketing-contact database.

- Purchasing + Inventory System: Extend catalog_items, inventory_items for purchase orders, stock tracking.

- Subcontractor System: Extend vendors, people, compliance_records for onboarding and compliance.

- PTO / Workforce Management: Add PTO accrual, requests, approval on people, time tracking.

- Service Layer: Define AI, call intelligence, takeoffs, marketplace, marketing automation, forecasting as read-only enrichments.

- Mobile-First Field Workflows: Ensure all field workflows support mobile for time tracking, incident capture, photos, tasks, daily logs, safety checklists.

- Canonical Entity Cleanup: Clarify entities, remove Deal, ensure EmployeeProfile extends people.

## Company Brain Foundation Sequence

This sequence is future roadmap guidance. It does not mean the product/finish/spec, shared file-link, delivery-event, or activity-timeline layers are implemented today.

Recommended sequence:

- Phase 2 / near term: document target architecture, preserve current canonical records, tighten project hub/readiness, and design the product/spec/file/delivery foundations without creating duplicate records.
- Next foundation slice: product/finish/spec model planning, manufacturer/product metadata planning, and shared file-link model planning. Manufacturer/product metadata should support Torginol-style vendor, product line, product code, product images, spec sheets, and technical notes without hardcoding a vendor commitment.
- Next workflow slice: selected system/spec integration into estimate and contract review, including snapshot/lock behavior once approval or contract/signature activity begins.
- Next communication slice: communication threads/messages plus delivery attempts/events for estimates, contracts, invoices, change orders, payment requests, and portal invites.
- Next memory slice: activity timeline over the project/customer/record chain, rendered as readable memory over canonical records rather than a replacement source of truth.
- Later: visualizer handoff, mobile/offline capture, AI auto-linking/classification, smart change-order detection, and deeper field/material/job-costing workflows.

Guardrails:

- visual/product/finish selection may begin before lead intake, but operational use must eventually attach to canonical records instead of session-only or module-local data
- selected finish/spec data should flow through `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` without replacing that lifecycle
- finish systems represent what is sold and installed; they should not degrade into loose estimate descriptions
- shared files/evidence should be linkable across projects, opportunities, estimates, contracts, jobs, invoices, payments, change orders, daily logs, field notes, selected systems/specs, and finish products
- delivery telemetry from providers should be stored as immutable delivery events tied to canonical records, while open/click signals remain useful but imperfect evidence

## AI, Communications, Scheduling, And Onboarding Sequence

This sequence is future roadmap guidance. It does not mean AI chat, AI receptionist, full unified inbox, external calendar sync, or broad AI workflow execution is implemented today.

Recommended sequence:

1. Documentation and architecture planning.
   - Use [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md), [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md), [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md), [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md), and [docs/ai-marketing-and-onboarding.md](C:/FloorConnector/docs/ai-marketing-and-onboarding.md) as target planning docs.

2. First vertical slice: lead communication plus appointment scheduling foundation.
   - Extend canonical opportunities, communication threads/messages, and appointments.
   - Keep appointment scheduling attached to the opportunity/customer/project chain.

3. Communication timeline and unified inbox.
   - Expand canonical communication history across website forms, web chat, email, SMS, portal/app messages, calls, voicemail, and manual logs.
   - Keep provider data as telemetry and delivery context, not business truth.

4. External calendar integrations.
   - Start with one-way FloorConnector -> Google/Outlook calendar publishing.
   - Add external busy-block import later.
   - Consider two-way sync only after ownership, reconciliation, permissions, and audit rules are designed.

5. AI-assisted drafting and summaries.
   - Add low-risk drafting, summarization, classification, and next-action recommendations over canonical records.
   - Require human approval before customer-facing sends, schedule changes, pricing, contract, invoice, payment, permission, or compliance actions.

6. Website chat, public intake, and onboarding assistant.
   - Support public Q&A, sales/demo qualification, website-generated opportunity intake, signup/setup guidance, and first-workflow activation without overclaiming target-only capabilities.
   - Keep public AI intake tied to canonical opportunities, communications, appointments, and human-approved workflow actions.

7. AI voice/receptionist.
   - Capture call intake, missed-call follow-up, voicemail summaries, and human handoff after consent, recording, quiet-hours, and escalation rules are designed.

8. Operational intelligence.
   - Summarize readiness, scheduling, communication, collections, activation, and capacity risk across canonical records.

Guardrails:

- AI is an operating layer, not a parallel system.
- Do not introduce AI-only business entities, calendars, communication logs, or workflow chains.
- Communications attach to canonical records.
- FloorConnector owns the canonical schedule; Google/Outlook are adapters.
- Human confirmation is required for risky actions unless a later explicitly approved workflow configures otherwise.

## Phase 3

**Next: project workspace**

Planned focus:

- make project the primary operational workspace
- connect estimates, contracts, jobs, invoices, files, and activity more clearly inside the project context
- make project the future operational memory hub for selected finish/spec context, delivery proof, files/evidence, communication history, and activity timeline views
- align project/service address display with the planned structured address direction while keeping it distinct from customer billing/contact address
- strengthen project-scoped site info, plan/photo/file inputs, and scope summary foundations that can later support Takeoff & Scope Intelligence
- strengthen readiness, blockers, and next-action guidance
- add tasks and richer role-based queue behavior on top of the existing notification foundation
- add file attachments and shared activity foundations where needed

## Phase 4

**Next: deeper scheduling and dispatch**

Planned focus:

- dispatch-grade scheduling and schedule-readiness workflows beyond the current first-pass planner/board foundation
- deeper crew coordination and assignment automation beyond current canonical `job_assignments` review/assignment
- richer calendar, dispatch board, rescheduling, and operational planning controls
- deeper execution planning and operational scheduling on top of the already-implemented time and daily-log foundations

## Phase 5

**Next: materials and reusable catalogs**

Current reality and planned focus:

- reusable catalog foundation already exists on canonical `catalog_items`
- estimate-side catalog insertion has begun: active non-system catalog items can be added to estimate line items as server-owned snapshots, while archived items are blocked and systems still use the existing expansion flow
- deepen reusable item and materials catalog management on top of the existing `catalog_items` foundation
- seeded organization-owned defaults beyond the current starter catalog/settings foundation
- deeper shared catalog support inside estimating, invoicing, contracts, and future execution workflows, with snapshot behavior preserved where commercial records are created
- future invoice catalog usage remains deferred and should stay conservative, favoring approved estimate, SOV, change-order, and invoice-only lineage instead of live catalog billing shortcuts
- richer materials workflows, inventory quantity/reservation/issue/return workflows, and job material planning remain future work
- assemblies/systems still need deeper formula, optional component, versioning, and regeneration policy work beyond the current system expansion foundation
- SOV/progress billing depth remains future work and should continue to use approved commercial snapshot lineage, not live catalog prices
- catalog/cost item behavior that can define reusable cost, markup, pricing, production, and tax defaults while still allowing intentional estimate-level overrides that remain internal in edit mode
- Estimate Builder work in this phase should follow [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md), with current execution constrained by [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md)
- planned manual measurement-driven estimating foundations where length x width, direct floor area, direct linear footage, counts, and optional room/zone detail can produce quantities for reviewed estimate generation
- planned System Template foundations where reusable estimating systems extend `catalog_items` and catalog-backed components with formulas, grouping rules, optional components, and required inputs
- planned Templates & Systems settings/admin area for document templates, System Templates, add-ons/options, and sharing/review settings instead of scattering those controls across estimate, invoice, and contract modules
- planned add-on/option foundations for catalog-backed optional scope modifiers such as integrated cove base, vinyl cove base, control joints, crack repair, coating removal, moisture mitigation, extra topcoat, mobilization/setup, and future labor adjustments
- planned template sharing loop where contractor-created templates/systems/add-ons can be marked shareable, reviewed by super admin, stripped or anonymized for private cost/markup/margin/internal notes, and promoted as platform defaults without silently updating contractor local copies
- planned on-screen Takeoff & Scope Intelligence foundations where project-scoped plan/PDF/drawing measurement can produce quantities, map through System Templates and reusable catalog/cost items, and generate reviewed estimate line items
- planned visual/product/finish selection foundations where pre-lead finish choices can later become canonical selected-system/spec records, with finish families such as decorative flake, metallic epoxy, decorative quartz, solid color, and future surface systems
- planned manufacturer/product metadata foundations for vendor, product line, product code, images, spec sheets, and technical notes, using examples such as Torginol-style product metadata without committing to one vendor
- planned selected-system/spec snapshot behavior so approved or signature-active work does not silently change after estimate or contract truth is established
- richer shared template and document editing capability
- broader document workflow refinement

Takeoff work in this phase would be planned direction only. Manual measurements are not takeoff; they are contractor-entered quantities or dimensions. Takeoff means plan, PDF, or drawing-based measurement. Both input paths should support the canonical estimate workflow and the existing `catalog_items` cost item database instead of becoming separate estimating apps. Takeoff and measurement quantities may eventually inform material requirements, labor estimation, production readiness, and job planning, but they should flow through reviewed estimates before contracts, jobs, invoices, or payments.

Visualizer and selected-finish work in this phase would also be planned direction only. A future room visualizer may start before lead intake, but selected finish/spec data should become canonical selected-system/spec context only when accepted into the shared workflow. It should not become a parallel lead, project, estimate, or product model.

Document-template work in this phase should preserve the existing copied-template model: platform defaults seed contractor-owned templates, contractors can edit local copies and switch templates per estimate, invoice, or contract where supported, and future proposal/SOW or work order templates should extend the same shared template foundation instead of creating module-specific template silos.

## Phase 6

**Next: external integrations**

Planned focus:

- e-sign integration on top of canonical contracts
- deeper payment-provider support, reconciliation, retry, and provider lifecycle tooling on top of canonical payments
- deeper PDF generation, document delivery, and provider lifecycle tooling beyond the current canonical contract PDF snapshot foundation
- delivery attempts/events for estimates, contracts, invoices, change orders, portal invites, and payment requests, including queued, sent, delivered, opened, clicked, deferred, bounced, blocked, dropped, and failed where providers support those states
- external tax provider integration
- accounting and adjacent third-party integrations behind shared adapters

Provider event data should remain delivery telemetry. FloorConnector's canonical records and immutable delivery events remain the business source of truth, and open/click tracking should not be treated as perfect legal certainty.

## Phase 7

**Later: portal, communications, and scoped collaboration expansion**

Planned focus:

- broader customer portal workflows beyond the current access, review, and contract-signature foundation
- richer customer-facing payment self-service and post-review actions beyond the current portal invoice/payment handoff
- record-based communication tied to projects, jobs, change orders, invoices, daily logs, field notes, and other canonical workflow records
- canonical communication/delivery records for estimate sends, contract sends/signature requests, invoice sends, change-order sends, payment requests, portal invites, app messages, SMS, email, and manual logs
- unified intake direction across website forms, website AI chat, SMS, email, calls, voicemail, missed-call text-back, and human-assisted intake, all resolving into canonical opportunity/customer/project workflows
- scoped subcontractor/vendor/project partner collaboration where invited external participants can access only explicitly shared project or job workrooms
- project/job workrooms for limited status updates, photo uploads, field notes, files, and record-tied communication
- shared activity timelines for project, customer, and record workspaces that summarize canonical events without becoming a separate source of truth

This is planned direction only. It does not mean contractor network collaboration, subcontractor portal access, or contractor-to-contractor messaging is currently implemented.

## Phase 8

**Later: broader platform expansion**

Planned focus:

- growth and marketing engine through contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign/source attribution, and website-to-revenue continuity
- AI-assisted site/content generation, generated marketing copy, and public intake summaries where accepted outputs remain tied to tenant-owned public surfaces and canonical workflow records
- generated websites and public forms feeding canonical opportunities/leads instead of a separate marketing database
- review/reputation, testimonials, before/after galleries, and project-proof loops tied back to canonical customer/project/job/closeout evidence where appropriate
- FloorConnector-facing AI for public marketing Q&A, sales/demo support, onboarding/setup assistance, support triage, first-project/first-estimate guidance, and migration/import help
- AI Capture and AI-assisted Takeoff & Scope Intelligence suggestions on top of project-scoped plans, photos, site data, measurements, System Templates, catalog mapping, and human-reviewed estimate generation
- contractor-facing AI copilot, communication drafting/summaries, scheduling suggestions, AI receptionist/voice, and operational intelligence on top of canonical records
- contractor network / networked work expansion for trusted partner contractors, specialty subcontractors, vendors, overflow work sharing, and regional coverage
- private referral or overflow work sharing where it extends the same canonical project/job/payment chain
- controlled marketplace or vetted network behavior only after scoped collaboration, permissions, compliance signals, and tenant isolation are designed
- broader ecosystem expansion

Open marketplace behavior is a later-phase platform direction, not a current implementation target.
AI-assisted takeoff is also a later platform direction, not a current implementation target.
AI Capture may eventually suggest measurements, areas, systems, cost-item mappings, and estimate drafts, but customer-facing estimate content should remain reviewable, manually approved, and auditable.
Contractor website generation, SEO infrastructure, landing-page generation, marketing attribution, public AI intake, and AI-generated website/content workflows are also later platform direction unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says a specific slice is implemented.
