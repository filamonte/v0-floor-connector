# FloorConnector Vision

FloorConnector is building a vertical operating system for epoxy flooring, concrete polishing, resinous flooring, and other specialty surface contractors.

This document describes the long-term product vision. It is intentionally high-level and should not be treated as the source of truth for what is already implemented.

Related documents:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): what is implemented today
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): current and near-term business workflows
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): next-phase build order

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
- work starts in one intake and qualification flow
- future site data, plans, photos, and takeoff quantities can become reviewed estimate inputs instead of disconnected spreadsheet or drawing artifacts
- approved commercial scope flows into contracts and execution without being recreated
- execution flows into billing without disconnecting from the original scope
- payments, tax-aware billing, retainage, and future progress billing all extend the same shared financial chain
- every team sees the same project context, with the next best action made clear by status and readiness

In short:
- what is sold should flow into what is contracted
- what is contracted should flow into what is scheduled and executed
- what is executed should flow into what is billed and collected

## Long-Term Product Direction

FloorConnector starts with contractor operations, but the long-term direction is broader than job tracking alone.

The platform direction is to become connected business infrastructure across five layers.

### 1. Operational Layer

This is the backbone of the system:
- opportunities and intake
- customers
- projects
- estimates
- contracts
- jobs and execution
- scheduling, crews, and field readiness
- invoices and payments

This layer creates operational continuity from first contact through closeout.

### 2. Financial Layer

Beyond basic invoicing, FloorConnector is intended to support a fuller contractor financial workflow over time:
- tax-aware billing
- retainage handling
- schedule-of-values and progress billing support
- payment collection and reconciliation extensions
- reporting that ties financial activity back to the same customer, project, and job chain

The goal is not generic accounting replacement. It is contractor-specific financial control tied directly to operational records.

### 3. Materials And Production Layer

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

### 4. Customer And Communication Layer

The platform should eventually support the customer-facing parts of the same workflow:
- estimate review and approval
- contract review and signature workflows
- invoice visibility and payment touchpoints
- customer-facing status and communication surfaces
- notifications, tasks, and workflow prompts that help office, ops, and finance teams act on the next step

The purpose is not to create a separate system. Customer interaction can happen through the portal or through contractor-assisted onsite workflows, while still acting on the same canonical records in a controlled way.

### 5. Connected Platform Layer

Over the longer term, FloorConnector can grow beyond internal operations into broader platform infrastructure for the contractor business:
- marketing and lead capture connected to the same downstream revenue records
- service and integration adapters that reduce operational re-entry across systems
- contractor network collaboration, or networked work, where trusted subcontractors, vendors, and partner contractors can participate through scoped project or job access
- materials, purchasing, or marketplace-style extensions only where they reinforce the same canonical workflow chain

This should happen carefully. Expansion only makes sense if it strengthens the contractor operating system instead of fragmenting it.

The contractor network direction is not general contractor chat and not an immediate open marketplace. The practical path is record-based collaboration around canonical projects, jobs, change orders, invoices, daily logs, field notes, and payments. FloorConnector may eventually help contractors make more money through trusted partner work, overflow jobs, specialty subcontractors, and regional coverage, but only where that reinforces the `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` chain.

Early networked-work concepts should stay invite-based:
- invite a known subcontractor, vendor, or partner contractor to a project or job
- define scope, dates, access level, file and photo visibility, communication thread, and whether pricing is visible
- allow limited status updates, photo uploads, field notes, and job progress updates tied to that record

Later concepts may include trusted contractor connections, private referral or overflow work sharing, specialty subcontractor requests, regional partner coverage, and partner performance or compliance signals. A controlled marketplace, vetted network, referral tracking, or platform revenue model belongs much later and should not precede scoped collaboration, permissioning, tenant isolation, and canonical record ownership.

### 6. Administration And Control Layer

As the platform grows, FloorConnector should also mature its administrative infrastructure:
- organization settings and administration
- module controls and entitlements
- platform-level super-admin oversight
- configuration surfaces that govern how workflows, templates, and connected services are exposed to each organization

These layers are important because a vertical operating system eventually needs controlled rollout, organization-aware configuration, and a clean boundary between contractor administration and platform administration.

## How The Platform Expands Beyond Today

The current product already covers the core workflow from intake through payment recording. The long-term expansion is about deepening and connecting that system, not replacing it with unrelated modules.

The expansion path is:
- first, strengthen workflow continuity across the existing operational chain
- then make `Project` the practical operational hub for active work
- then deepen scheduling, materials, execution, notifications, and financial controls
- then add project-scoped Takeoff & Scope Intelligence where plans, photos, and measurements feed catalog-mapped estimate line items
- then extend outward into customer-facing experiences and external integrations
- then consider broader connected platform layers such as marketing attribution, materials ecosystems, contractor network collaboration, or marketplace behavior where they align with the same job lifecycle

That means future platform growth should feel like a widening circle around the same shared contractor workflow, not a collection of disconnected products.

## What This Vision Is Not

This document does not mean all of these layers are already implemented.

It does not replace:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented truth
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for current and near-term workflow behavior
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) for sequencing what gets built next

It also does not imply that every future idea should be built. The product vision should guide decision-making, but each expansion still needs to earn its place by strengthening the shared contractor workflow and canonical data model.

## Vision Summary

FloorConnector is meant to become the operating system specialty surface contractors use to run the business from opportunity to payment, with one connected record chain across sales, operations, and finance.

The long-term opportunity is not just better estimating or better invoicing. It is a system where contractor work, financial activity, customer interaction, and future connected services all reinforce the same underlying project and job lifecycle.
