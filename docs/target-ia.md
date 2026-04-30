# Contractor App Target Information Architecture

Status: target contractor app information architecture.

This document defines the **target information architecture** for the contractor app.

It is intended to guide future navigation, workspace structure, and route decisions without forcing an immediate refactor of the current application. It should be read alongside:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for what is implemented today
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

This document describes the intended contractor app structure over time. It should not be read as the current route map or current implementation truth.

## Purpose

The contractor app is intended to become more **project-centered** over time while still supporting global lists, queues, and financial work areas.

This document exists to answer:
- what the contractor app top-level navigation should become
- what each top-level area is responsible for
- how projects act as the operational root in UX terms
- which standalone routes should still exist even in a project-centered system

## IA Principles

### 1. Project Is The Operational Root

Projects should become the main workspace for work delivery. Operational records such as estimates, jobs, files, daily execution, and invoices should feel connected to the project rather than like isolated modules.

That also means project detail should be the primary workflow and readiness hub in page-structure terms, while related record pages support that hub rather than competing with it as parallel workflow homes.

### 2. Customers Are Relationship Roots, Not Execution Roots

Customers remain important top-level records for CRM and account management, but operational execution should flow through projects.

### 3. Global Views Still Matter

Even in a project-centered system, some workflows are best handled through cross-project queues, global lists, and financial reporting surfaces.

### 4. Navigation Should Emphasize Major Work Areas

Top-level navigation should represent durable business domains, not every downstream record type.

### 5. Module Architecture Should Stay Compatible

This target IA should remain compatible with future organization-level module enable/disable controls. A module can be disabled without changing the underlying shared data model.

## Target Contractor App Top-Level Navigation

The target top-level contractor app navigation should be:
- Dashboard
- Customers
- Projects
- Financials
- People
- Field
- Documents
- Communications
- Settings

This does **not** mean every section is fully implemented today. It defines the intended structure as the contractor app grows.

## Top-Level Areas

## Dashboard

Dashboard should be the high-level operating overview for the contractor organization.

It should eventually include:
- company-wide activity summary
- upcoming work
- overdue financial items
- estimate and approval pipeline summary
- jobs requiring scheduling or action
- unresolved operational issues
- role-aware task prioritization

Dashboard is not the operational root. It is the summary and prioritization surface.

## Customers

Customers should hold account and relationship context.

This area should include:
- customer list
- customer detail
- customer contact and address information
- linked project history
- linked estimate and invoice history
- customer notes and communications later

Customers should answer:
- who the customer is
- what work has been done for them
- what open opportunities or balances exist

Customers should not become the main execution workspace.

## Projects

Projects should be the primary operational root of the contractor app.

This area should include:
- project list
- project detail
- project workspace sections
- project status and health
- linked estimates, jobs, invoices, files, and activity
- future takeoff status, generated quantities, linked estimate context, and scope summary

Projects should answer:
- what work is being delivered
- what stage it is in
- what execution records and financial records are attached to it

## Financials

Financials should be the cross-project finance area.

This area should include:
- global estimate list and approval queues
- invoices
- payments
- retainage and AIA billing later
- change-order financial effects later
- reporting and collections views later

Financials is where users work across many projects at once, especially for accounting, approvals, and collections.

## People

People should be the cross-organization workforce and relationship management area.

This area should include:
- employees
- subcontractors/vendors
- roles and assignments later
- certifications and compliance later
- time cards later
- internal directory
- future scoped subcontractor/vendor collaboration profiles where project or job workspace access may be granted intentionally

People should support staffing and accountability, not project execution alone.

## Field

Field should group execution-oriented workflows that happen during delivery.

This area should eventually include:
- jobs/work orders
- schedule
- daily logs
- inspections
- punch lists
- scoped subcontractor/vendor job collaboration later
- service tickets or warranty later
- mobile-friendly execution tools later

Field is different from Projects because it is the cross-project execution work area for crews and operations staff.

## Documents

Documents should be the organization-wide document and file system.

This area should include:
- project files
- estimate and invoice attachments
- photos
- forms/checklists later
- document output and attachments
- shared company documents later

Documents should support both project-level and organization-level retrieval.

## Communications

Communications should be the cross-channel messaging and interaction layer.

This area should eventually include:
- internal communication tied to canonical records
- customer communication tied to canonical records
- subcontractor, vendor, and project partner communication tied to canonical records later
- estimate/invoice delivery history
- portal communications later
- activity notifications later

Communications should group conversation flows rather than scattering them across modules. Future communication should be record-based over free-floating chat, with threads attached to projects, jobs, change orders, invoices, daily logs, field notes, or other canonical records.

## Settings

Settings should be the organization administration area.

This area should include:
- company profile
- roles and permissions
- module enable/disable
- integrations
- financial defaults
- Templates & Systems administration later
- reusable catalogs and starter items
- automation settings later
- terminology/workflow defaults later

Settings should remain administrative, not operational.

The future Templates & Systems area under Settings should manage:
- document templates for estimates, invoices, contracts, proposals/SOW, and future work orders
- System Templates for reusable floor systems such as epoxy flake, urethane cement, polishing, garage, and commercial systems
- add-ons/options backed by catalog/cost items
- sharing and review settings for contractor-created templates, systems, and add-ons
- contractor defaults and local copies adopted from platform defaults

Templates & Systems should not become a separate estimating or document silo. Estimates, invoices, contracts, jobs, and payments still move through the canonical workflow. The settings area governs reusable configuration; record workspaces use those configurations.

Important boundary:
- contractor `Settings` is tenant-scoped organization administration
- platform-wide defaults and rollout policy belong in the separate super-admin surface

## Project As The Operational Root

In UX terms, a project should become the primary record that organizes delivery work.

Target project workspace sections:
- Overview
- Takeoff & Scope later
- Estimate
- Scope
- Jobs / Work Orders
- Schedule
- Change Orders
- Invoices
- Files
- Notes
- Activity

Additional sections can be added later, but this is the intended core workspace shape.

### Project Workspace Responsibilities

### Overview

Summary of project health, stage, customer, location, assigned people, and current blockers.

### Takeoff & Scope

Future project-scoped workspace for uploaded plans, photos, site information, manual Measurements, Takeoff status, AI Capture inputs, generated quantities, System Template selection, cost item/catalog mapping, linked estimate handoff, source traceability, out-of-sync review state, and scope summary.

This does not require a route change now. Takeoff should remain a supporting project workflow that feeds canonical estimate line items instead of becoming a separate estimating app.

This workspace should keep the boundary clear: Measurements are manual inputs such as length x width, direct square footage, direct linear footage, and counts. Takeoff means plan, PDF, or drawing-based measurement. AI Capture is a future photo, app, or AI-derived measurement input method. Takeoff and measurements produce quantities. Catalog/cost items define reusable cost, pricing, production, markup, and tax behavior. System Templates map quantities to grouped estimate content. Estimates define customer-facing pricing and commercial scope.

Quick Build should support selecting a System Template, entering minimal measurements, and generating grouped estimate lines for review. Detailed Build should support multiple rooms/zones, options, conditions, waste factors, optional components, overrides, and review before generation. AI-assisted suggestions and generated line items should remain reviewable and explicitly approved before they are exposed to the customer.

### Estimate

Estimate proposal, line items, approval state, and estimate-to-job conversion path.

### Scope

Operational scope details, assumptions, exclusions, notes, and execution-specific detail.

### Jobs / Work Orders

Execution records derived from approved work or direct operational planning.

### Schedule

Planned work timing, calendar view, and later crew allocation.

### Change Orders

Changes to approved scope and downstream financial/operational impacts.

### Invoices

Project-linked financial billing records and collections status.

### Files

Project-specific documents, photos, and supporting records.

### Notes

Persistent project notes that do not fit better in financial or execution records.

### Activity

Audit-style timeline of important system and workflow events.

## Standalone Global Routes That Should Still Exist

Even in a project-centered system, these should still exist as global list pages or work queues:
- `/customers`
- `/projects`
- `/estimates`
- `/jobs`
- `/invoices`
- `/documents`
- `/people`

These routes are still useful because users often need:
- cross-project filtering
- approval queues
- global finance review
- cross-project scheduling
- operational work queues
- list-based search and reporting

The important distinction is:
- project pages are the primary operational workspace
- standalone routes are the global queue and management surfaces

## Route Strategy Guidance

The current route structure does not need an immediate full refactor.

Practical direction:
- keep current standalone routes for direct access and incremental development
- increase project-centric linking between records
- evolve project detail into a richer project workspace over time
- treat global list routes as queue/reporting surfaces rather than the final operational home for every object
- apply one shared record-detail layout language across project, estimate, contract, invoice, and job pages so the contractor app feels like one connected workspace system

## Shared Record Workspace Pattern

Target contractor record pages should converge on the same structural pattern:
- header band: title, status, primary action, secondary actions
- workflow summary band: readiness, blockers, next best action
- primary workspace: the main review or execution surface for that record
- context rail: connected records and compact supporting metadata
- secondary sections: lower-priority editing, history, labor, files, or related modules

Page-role guidance inside that shared pattern:
- project detail is the authoritative workflow and readiness hub
- estimate and contract detail support document review and workflow progression, then point back to the project hub for broader handoff state
- invoice detail should be structured as review-first billing workspace, not primarily as a top-heavy edit form
- job detail should use the same shared page language rather than a separate ad hoc detail pattern

Current implementation note:
- the first major contractor workspace UI polish pass is now complete enough to stop
- project, estimate, contract, invoice, and job detail pages now broadly follow this shared pattern on the current branch
- further layout work should be treated as incremental polish unless a future structural break is introduced

This means a route like `/jobs` can continue to exist while the long-term UX emphasizes jobs inside project workspaces.

## Relationship To Module Enable/Disable

This target IA should remain compatible with future organization-level module control.

Examples:
- a company might disable `Communications` or `Field`
- `Financials` may be partially enabled depending on plan or setup
- modules can disappear from top-level navigation while canonical data still stays shared

Module toggles should affect:
- navigation visibility
- route access
- settings visibility
- organization capabilities

They should **not** create duplicate models or parallel architecture.

## Current Implementation Note

Today the contractor app still includes parallel top-level routes such as:
- `/customers`
- `/projects`
- `/estimates`
- `/jobs`

That is acceptable for the current phase. This document defines the target direction so future implementation decisions can move toward a more project-centered contractor experience without discarding the existing foundation.
