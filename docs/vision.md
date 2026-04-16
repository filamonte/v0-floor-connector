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
- production and field-readiness support
- future purchasing and supply-oriented workflows where they strengthen the core job chain

This expansion matters because specialty surface work depends heavily on scope clarity, materials planning, and prep-sensitive execution.

### 4. Customer And Communication Layer

The platform should eventually support the customer-facing parts of the same workflow:
- estimate review and approval
- contract review and signature workflows
- invoice visibility and payment touchpoints
- customer-facing status and communication surfaces
- notifications, tasks, and workflow prompts that help office, ops, and finance teams act on the next step

The purpose is not to create a separate system. It is to project the same canonical records outward in a controlled way.

### 5. Connected Platform Layer

Over the longer term, FloorConnector can grow beyond internal operations into broader platform infrastructure for the contractor business:
- marketing and lead capture connected to the same downstream revenue records
- service and integration adapters that reduce operational re-entry across systems
- materials, purchasing, or marketplace-style extensions only where they reinforce the same canonical workflow chain

This should happen carefully. Expansion only makes sense if it strengthens the contractor operating system instead of fragmenting it.

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
- then extend outward into customer-facing experiences and external integrations
- then consider broader connected platform layers such as marketing attribution, materials ecosystems, or marketplace behavior where they align with the same job lifecycle

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
