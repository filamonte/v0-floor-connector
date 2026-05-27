# FloorConnector Vision

Status: Stable
Doc Type: Philosophy

FloorConnector is building a vertical operating system for epoxy flooring, concrete polishing, resinous flooring, and other specialty surface contractors.

This document describes the long-term product vision. It is intentionally high-level and should not be treated as the source of truth for what is already implemented.

Related documents:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): what is implemented today
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): current and near-term business workflows
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity sequencing
- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md): future workflow-connected communication philosophy
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md): canonical reporting and metrics philosophy
- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md): future workflow automation philosophy
- [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md): future operational intelligence strategy
- [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md): future governed AI operating-layer strategy
- [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md): strategic build-priority registry
- [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md): staged build discipline
- [docs/gatekeeper-system-vision.md](C:/FloorConnector/docs/gatekeeper-system-vision.md): GateKeeper operational intelligence and communications doctrine
- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md): long-term AI-assisted operating system direction

## Who FloorConnector Is For

FloorConnector is for specialty surface contractors who need more than a lightweight CRM or disconnected field tool.

Primary users include:

- epoxy flooring contractors
- concrete polishing companies
- resinous flooring installers
- prep-heavy specialty surface teams
- small and mid-sized contractor businesses that need one connected operating system across sales, operations, and finance

These companies often manage high-value projects with real handoffs between estimating, contract approval, scheduling, execution, invoicing, and collections. They need continuity across the whole job, not separate tools that each own a fragment of the process.

## Core Problem

Specialty contractors usually run the business across disconnected systems:

- leads in one tool or inbox
- customers and projects somewhere else
- estimates in a document or spreadsheet workflow
- contracts outside the operational system
- scheduling on a whiteboard, calendar, or separate app
- invoices and payments disconnected from what was actually sold and completed

That fragmentation creates predictable problems:

- duplicate data entry
- scope loss between sales and execution
- weak handoffs between office, field, and finance teams
- billing that drifts away from approved work
- poor visibility into what is blocked, ready, in progress, or collectible

The result is not just inconvenience. It creates operational drag and revenue leakage.

## Product Thesis

The long-term thesis is that specialty surface contractors need a shared system of record and workflow progression, not another isolated point solution.

FloorConnector should unify the contractor revenue path so that:

- public acquisition, contractor-owned website pages, intake, and qualification all feed one canonical workflow instead of separate marketing or CRM databases
- future visual/product/finish selection can start before formal lead intake while still becoming part of the same canonical record chain later
- future site data, plans, photos, and takeoff quantities can become reviewed estimate inputs instead of disconnected spreadsheet or drawing artifacts
- selected finish, system, product, and specification context follows the work from opportunity through closeout instead of staying trapped in a visualizer, catalog, estimate, or document silo
- approved commercial scope flows into contracts and execution without being recreated
- execution flows into billing without disconnecting from the original scope
- payments, tax-aware billing, retainage, and future progress billing all extend the same shared financial chain
- every team sees the same project context, with the next best action made clear by status and readiness

In short:

- what is sold should flow into what is contracted
- what is contracted should flow into what is scheduled and executed
- what is executed should flow into what is billed and collected

The long-term product direction can be described as a company brain: shared canonical data everywhere, no data silos, no fake or parallel records, and project-centered operational memory that makes the whole contractor workflow readable.

The current enterprise UX consolidation direction supports that thesis at the page level: People owns contact/access administration, Customer summarizes the account relationship, Project owns operational state, Estimate/Contract/Invoice own proposal/signature/billing review, and Portal keeps customer-facing review simple. See [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md).

## Contractor Foreman Baseline, Not Destination

Contractor Foreman is useful as a baseline reference because serious contractor operating systems tend to need a common set of capabilities: customers, projects, estimates, contracts, change orders, jobs, invoices, payments, time, field work, documents, equipment, reporting, and integrations.

FloorConnector is not chasing Contractor Foreman feature-for-feature. The product thesis is broader and deeper: a specialty flooring operating system with canonical data continuity, vertical trade intelligence, and a guided/AI-first future over the same shared records.

That means FloorConnector should cover core contractor operations while avoiding generic-module bloat. Equipment, bid/RFP workflows, subcontractors, documents/submittals, warranty/service, weather-aware scheduling, procurement/materials, job costing, and future AI/takeoff depth should extend the existing record chain instead of becoming detached products.

One practical example is task assignment. FloorConnector should not settle for
thin generic tasks when real contractor work needs instructions, measurements,
current-condition photos, job/customer/project context, field follow-up,
completion evidence, and internal discussion in one place. The durable product
concept should be context-rich Work Items connected to canonical records, not a
side checklist or portal-only task system.

The durable rule is still one system of record:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Future AI is an operating layer over that chain. It may draft, summarize, recommend, and prepare, but it must not create AI-only business truth or bypass human approval for risky customer-facing, financial, legal, scheduling, permission, or compliance actions.

GateKeeper is the named future doctrine for that operating layer where communications, operational memory, workflow reinforcement, and human-governed AI assistance become one system layer over the same canonical workflow. GateKeeper is not implemented by this vision document; it is the target direction documented in [docs/gatekeeper-system-vision.md](C:/FloorConnector/docs/gatekeeper-system-vision.md).

## Long-Term Product Direction

FloorConnector starts with contractor operations, but the long-term direction is broader than job tracking alone.

The platform direction is to become connected business infrastructure across the layers below.

### 1. Operational Layer

This is the backbone of the system:

- public acquisition that resolves into canonical opportunities
- opportunities and intake
- customers
- projects
- estimates
- contracts
- jobs and execution
- scheduling, crews, and field readiness
- invoices and payments

This layer creates operational continuity from first public visit or referral through closeout.

### 2. Financial Layer

Beyond basic invoicing, FloorConnector is intended to support a fuller contractor financial workflow over time:

- tax-aware billing
- retainage handling
- schedule-of-values and progress billing support
- payment collection and reconciliation extensions
- reporting that ties financial activity back to the same customer, project, and job chain

The goal is not generic accounting replacement. It is contractor-specific financial control tied directly to operational records.

### 3. Company Brain And Evidence Layer

Long term, FloorConnector should become the readable memory layer for the contractor organization. This is target architecture, not implemented status.

The company brain direction means:

- canonical records remain the source of truth across sales, operations, finance, portal, and field surfaces
- project becomes the practical memory hub for selected finishes, scope decisions, files, communications, delivery proof, signatures, invoices, payments, field evidence, and closeout context
- timelines summarize important canonical events without replacing the records that created those events
- files, photos, spec sheets, product images, visualizer renders, signed documents, markups, field photos, and closeout evidence are shared/linkable assets rather than module-local attachments
- delivery proof for estimates, contracts, invoices, change orders, portal invites, and payment requests is stored as immutable communication/delivery events tied back to canonical records

Future activity timelines should read across the lifecycle: finish selected, estimate sent/viewed/approved, contract sent/signed, invoice sent/paid, payment completed, file uploaded, message received, job scheduled, daily log finalized, and closeout evidence captured.

### 4. Visual Product And Finish Selection Layer

Future visual and product selection should be able to start before lead intake. A customer may choose a finish or system visually before becoming a full opportunity or customer, but those choices should later become real canonical selected-system/spec records when the contractor accepts the work into the shared chain.

Supported future finish families include:

- decorative flake
- metallic epoxy
- decorative quartz
- solid color
- future surface systems

Manufacturer and product metadata should support Torginol-style manufacturer/product records without committing to a specific vendor integration. Useful future metadata includes vendor/manufacturer, product line, product code, product images, spec sheets, and technical notes.

Visual selections should never become fake session-only business truth. They may begin as pre-lead selection context, but once the contractor uses them operationally they should attach to the canonical `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` chain.

### 5. Materials And Production Layer

As the system matures, FloorConnector should expand into the operational inputs behind the work itself:

- reusable materials and item catalogs
- estimating and invoicing consistency through shared catalogs
- System Templates that combine reusable catalog/cost items, formulas, grouping rules, optional components, and required inputs into repeatable estimating systems
- Takeoff & Scope Intelligence that can convert plans, drawings, photos, site information, and reviewed measurements into quantities before estimate generation
- production and field-readiness support
- future purchasing and supply-oriented workflows where they strengthen the core job chain

This expansion matters because specialty surface work depends heavily on scope clarity, materials planning, and prep-sensitive execution.

Takeoff & Scope Intelligence should strengthen the same contractor workflow rather than becoming a separate estimating product. Measurements are manual inputs such as length x width, direct square footage, direct linear footage, and counts. Takeoff means plan, PDF, or drawing-based measurement. AI Capture is a future photo, app, or AI-derived input method. All of these inputs should feed the same estimate generation engine instead of becoming separate estimating silos.

Takeoff and measurements produce quantities. Catalog/cost items define reusable cost, pricing, production, markup, and tax behavior. System Templates map quantities to grouped estimate content. Estimates define customer-facing pricing and commercial scope.

The cost item database/catalog is the pricing and production brain of the system. System Templates should let contractors reuse common flooring systems by bundling catalog/cost items with formulas, required inputs, grouping rules, optional components, and defaults. A contractor should eventually be able to generate a quick estimate from minimal measurements or a detailed estimate from multiple rooms, zones, conditions, waste factors, optional components, and reviewable overrides.

Over time, template and system management should move toward a dedicated Templates & Systems administration area instead of being scattered across estimates, invoices, contracts, and other modules. That future area should govern document templates, System Templates, add-ons/options, and controlled sharing or review settings while keeping the canonical workflow unchanged.

Document templates should cover estimate, invoice, contract, proposal/SOW, and future work order output. Platform defaults should be seeded by super admin and copied into contractor-owned templates for local editing, defaulting, and per-record selection. Contractor local copies should not be silently live-mutated when platform defaults change.

System Templates should represent reusable flooring bundles such as epoxy flake, urethane cement, polishing, garage, and commercial systems. Add-ons should represent optional scope modifiers backed by catalog/cost items, such as cove base, control joints, crack repair, coating removal, moisture mitigation, extra topcoat, mobilization/setup, and labor adjustments. Cove base is a hybrid concept: it is not a full floor system by itself, but it can be a catalog item and optional system/add-on component generated from perimeter or entered directly.

Labor should eventually become an internal catalog/cost item component that supports crew size, production rate, minimum site time, markup, and condition/access multipliers. Near term, labor may remain baked into system pricing. Customer-facing templates should not expose internal cost, markup, margin, private notes, or production math unless deliberately configured for customer-facing language.

Generated estimate line items should eventually retain source traceability back to the takeoff scope item, takeoff measurement, and source document or photo when applicable. If takeoff quantities change after estimate generation, the system should be able to flag the takeoff-estimate link or estimate as out of sync so the contractor knows the customer-facing proposal may need review.

AI-assisted measurement, scope, system, and cost-item mapping suggestions must stay human-in-the-loop. Suggestions should be reviewable and explicitly approved by the contractor before they become estimate content, and raw measurements, takeoff records, or AI Capture outputs should never own pricing or bypass the canonical `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` path.

Future Finish System / System Specification behavior should build on this same direction. Finish systems are not loose estimate line-item descriptions; they represent what is actually sold and installed. Selected systems/specs should flow into estimates, contracts, jobs, portal review, closeout, and warranty context. Once approved or once contract/signature activity begins, selected systems should be snapshotted or locked like financial/document truth. Later changes should move through revision or change-order style workflows instead of silent edits.

### 6. Customer And Communications Layer

The platform should eventually support the customer-facing parts of the same workflow:

- estimate review and approval
- contract review and signature workflows
- invoice visibility and payment touchpoints
- customer-facing status and communication surfaces
- notifications, tasks, and workflow prompts that help office, ops, and finance teams act on the next step

The purpose is not to create a separate system. Customer interaction can happen through the portal or through contractor-assisted onsite workflows, while still acting on the same canonical records in a controlled way.

Future communication depth should include delivery proof across email, SMS, portal, app, and manual logs. Sending estimates, invoices, contracts, change orders, portal invites, and payment requests should create canonical communication/delivery records. Provider telemetry such as queued, sent, delivered, opened, clicked, deferred, bounced, blocked, dropped, and failed is useful signal, but provider data is not the business source of truth. Open and click tracking should help teams understand engagement without being treated as perfect legal certainty.

The durable rule is that communications attach to operational context. FloorConnector should not become a disconnected inbox, Slack clone, or standalone CRM messaging tool. See [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md).

### 7. Public Acquisition And Connected Platform Layer

Over the longer term, FloorConnector can grow beyond internal operations into broader platform infrastructure for contractor-owned acquisition and growth:

- contractor-owned public websites and tenant-owned domains
- landing pages for services, locations, campaigns, and offers
- SEO/service/location pages that publish contractor-owned content
- public forms, website chat, and intake surfaces that create or enrich canonical opportunities
- campaign/source attribution that follows work from visit to opportunity, estimate, contract, invoice, and payment
- AI-assisted content generation for site pages, service copy, project proof, and intake summaries
- later review, reputation, testimonial, before/after gallery, and project-proof workflows that attach back to canonical customers, projects, jobs, and closeout evidence where appropriate
- service and integration adapters that reduce operational re-entry across systems
- contractor network collaboration, or networked work, where trusted subcontractors, vendors, and partner contractors can participate through scoped project or job access
- materials, purchasing, or marketplace-style extensions only where they reinforce the same canonical workflow chain

This should happen carefully. Expansion only makes sense if it strengthens the contractor operating system instead of fragmenting it.

The public acquisition layer should be the public edge of the same contractor operating system, not a separate website builder, CRM, marketing database, or AI knowledge silo. The intended continuity is:

`public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`

Contractor websites, public forms, landing pages, SEO pages, attribution, AI intake, generated marketing content, portals, communications, and operational workflows should all reinforce that same graph.

The contractor network direction is not general contractor chat and not an immediate open marketplace. The practical path is record-based collaboration around canonical projects, jobs, change orders, invoices, daily logs, field notes, and payments. FloorConnector may eventually help contractors make more money through trusted partner work, overflow jobs, specialty subcontractors, and regional coverage, but only where that reinforces the `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` chain.

Early networked-work concepts should stay invite-based:

- invite a known subcontractor, vendor, or partner contractor to a project or job
- define scope, dates, access level, file and photo visibility, communication thread, and whether pricing is visible
- allow limited status updates, photo uploads, field notes, and job progress updates tied to that record

Later concepts may include trusted contractor connections, private referral or overflow work sharing, specialty subcontractor requests, regional partner coverage, and partner performance or compliance signals. A controlled marketplace, vetted network, referral tracking, or platform revenue model belongs much later and should not precede scoped collaboration, permissioning, tenant isolation, and canonical record ownership.

The future Contractor Collaboration Network / Trusted Contractor Network Layer is
the disciplined version of this direction. It should center trusted contractor
collaboration, approved partner networks, Certified FloorConnector Service
Providers, scoped project/job access, and a specialty contractor ecosystem
without duplicate records or a disconnected marketplace. It is target direction
only; it should not be described as implemented until
[docs/current-state.md](C:/FloorConnector/docs/current-state.md) records an
implemented slice. The planning doctrine lives in
[docs/contractor-collaboration-network.md](C:/FloorConnector/docs/contractor-collaboration-network.md).

### 8. Reporting And Metrics Layer

FloorConnector's reporting and metrics should derive from canonical operational records.

Metrics should measure the continuity of the workflow, not create a second reporting truth. The practical metric spine is `lead -> estimate -> contract -> job -> invoice -> payment`, while implementation language should preserve the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Future reporting should cover operational, financial, sales/conversion, production, labor, workflow timing, readiness, communication, and intelligence-ready metrics. Reporting may use projections or summaries for performance later, but those projections must remain downstream of canonical records and auditable back to workflow evidence.

See [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md).

### 9. Automation Layer

FloorConnector's automation should extend the canonical workflow chain.

The long-term automation direction is deterministic operational automation first: evidence-backed cues, safe routing, readiness-aware prompts, user-confirmed prefill, and approval queues before predictive or autonomous behavior. Automation should reinforce project continuity, operational readiness, workflow progression, communications continuity, and financial integrity.

Automation must not become black-box bots, module-local automation engines, disconnected AI agents, or unsafe autonomous financial behavior. See [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md).

### 10. Intelligence Layer

FloorConnector's long-term platform should include an Intelligence Layer over the same canonical records.

This is not just reporting. Reporting is historical and descriptive. Intelligence should become operational, predictive, comparative, workflow-aware, and decision-oriented.

The Intelligence Layer should eventually include:

- Contractor Intelligence: tenant-scoped analytics for close rates, estimator performance, lead sources, profitability, collections, workflow bottlenecks, readiness, labor efficiency, and schedule performance
- Network Intelligence: opt-in anonymized benchmarking for regional pricing, close rates, lead sources, labor efficiency, system popularity, margins, operational timing, and seasonal trends
- Predictive and AI Intelligence: close likelihood, risk forecasting, payment-delay prediction, crew-performance prediction, recommended next actions, and workflow optimization suggestions after clean telemetry exists

The core rule is canonical-first intelligence. Analytics, benchmarks, recommendations, and predictions must derive from the same `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` chain. They must not become duplicate reporting truth, disconnected BI silos, manual metric-entry systems, or AI-only data chains.

This layer changes the long-term positioning: FloorConnector is not only contractor management software; it is moving toward an operational intelligence system for specialty contractors. See [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md).

### 11. Administration And Control Layer

As the platform grows, FloorConnector should also mature its administrative infrastructure:

- organization settings and administration
- module controls and entitlements
- platform-level super-admin oversight
- configuration surfaces that govern how workflows, templates, and connected services are exposed to each organization

These layers are important because a vertical operating system eventually needs controlled rollout, organization-aware configuration, and a clean boundary between contractor administration and platform administration.

### 12. AI-Assisted Operating Layer

The long-term AI direction is to reduce friction across both contractor operations and FloorConnector's own growth, onboarding, support, and activation workflows.

AI should be an operating layer over the shared system, not a parallel product with duplicate records. It may draft, suggest, summarize, prepare, classify, and orchestrate work, but customer commitments, pricing, contracts, billing, scheduling readiness, permissions, and compliance must continue to flow through canonical FloorConnector workflows with human confirmation where risk exists.

The value of AI comes from the connected operational graph. AI can be useful in public acquisition, website content generation, intake qualification, communication drafting, scheduling suggestions, estimating support, and operational summaries because those activities are tied to canonical records. It should not become a disconnected assistant layer with its own lead list, content knowledge base, project memory, communication log, or workflow truth.

Two audiences matter:

- contractor-facing AI helps contractors run their business through the existing lifecycle: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- FloorConnector-facing AI helps FloorConnector market, sell, onboard, support, activate, and retain contractor customers

Long-term AI layers include contractor copilot behavior, unified communications, calendar and scheduling intelligence, website chat and intake, AI receptionist/voice, onboarding and setup assistance, support assistance, operational intelligence, and human escalation/approval queues.

Detailed planning lives in:

- [docs/gatekeeper-system-vision.md](C:/FloorConnector/docs/gatekeeper-system-vision.md)
- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md)
- [docs/ai-marketing-and-onboarding.md](C:/FloorConnector/docs/ai-marketing-and-onboarding.md)

These are target direction docs. They do not mean AI chat, AI receptionist, external calendar sync, or broad AI workflow execution is currently implemented.

### 13. Agentic Operations Layer

The long-term platform direction is AI-native operations over the same
contractor operating system. The future Agentic Operations Layer should allow AI
assistance to observe, recommend, draft, and eventually coordinate approved work
through the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

This layer is not implemented today. It is a target direction for governed AI
that strengthens operational, financial, communication, field, reporting, and
admin workflows without fragmenting them.

The durable rule is that AI must operate through shared records, permissions,
server-owned actions, workflow state, communications, and audit logs. It should
not become a separate chatbot, CRM, scheduler, inbox, payment tool, workflow
engine, or assistant memory store that owns business truth. Detailed doctrine
lives in [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).

## How The Platform Expands Beyond Today

The current product already covers the core workflow from intake through payment recording. The long-term expansion is about deepening and connecting that system, not replacing it with unrelated modules.

The expansion path is:

- first, strengthen workflow continuity across the existing operational chain
- then make `Project` the practical operational hub for active work
- then deepen scheduling, materials, execution, notifications, and financial controls
- then strengthen communications continuity, canonical metrics, and deterministic workflow automation
- then add project-scoped Takeoff & Scope Intelligence where plans, photos, and measurements feed catalog-mapped estimate line items
- then mature the Intelligence Layer from trusted reporting and workflow evidence
- then extend outward into customer-facing experiences and external integrations
- then extend the public acquisition layer through contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign attribution, AI-assisted content generation, and review/reputation/project-proof loops that feed the same canonical opportunity and revenue chain
- then consider broader connected platform layers such as materials ecosystems, contractor network collaboration, or marketplace behavior where they align with the same job lifecycle

That means future platform growth should feel like a widening circle around the same shared contractor workflow, not a collection of disconnected products.

## What This Vision Is Not

This document does not mean all of these layers are already implemented.

It does not replace:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented truth
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for current and near-term workflow behavior
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) for platform maturity sequencing

It also does not imply that every future idea should be built. The product vision should guide decision-making, but each expansion still needs to earn its place by strengthening the shared contractor workflow and canonical data model.

## Vision Summary

FloorConnector is meant to become the operating system specialty surface contractors use to run the business from public acquisition to follow-up, with one connected record chain across sales, operations, finance, customer experience, and growth.

The long-term opportunity is not just better estimating, better invoicing, or a website layer. It is a system where contractor-owned public acquisition, contractor work, financial activity, customer interaction, AI assistance, and future connected services all reinforce the same underlying project and job lifecycle.
