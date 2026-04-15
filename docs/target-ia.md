# Contractor App Target Information Architecture

This document defines the **target information architecture** for the contractor app.

It is intended to guide future navigation, workspace structure, and route decisions without forcing an immediate refactor of the current application. It should be read alongside:
- [docs/architecture.md](C:/FloorConnector/docs/architecture.md): target platform architecture
- [docs/roadmap.md](C:/FloorConnector/docs/roadmap.md): phased implementation plan
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for what is implemented today

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

People should support staffing and accountability, not project execution alone.

## Field

Field should group execution-oriented workflows that happen during delivery.

This area should eventually include:
- jobs/work orders
- schedule
- daily logs
- inspections
- punch lists
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
- templates later
- shared company documents later

Documents should support both project-level and organization-level retrieval.

## Communications

Communications should be the cross-channel messaging and interaction layer.

This area should eventually include:
- internal communication
- customer communication
- estimate/invoice delivery history
- portal communications later
- activity notifications later

Communications should group conversation flows rather than scattering them across modules.

## Settings

Settings should be the organization administration area.

This area should include:
- company profile
- roles and permissions
- module enable/disable
- integrations
- financial defaults
- templates
- automation settings later
- terminology/workflow defaults later

Settings should remain administrative, not operational.

## Project As The Operational Root

In UX terms, a project should become the primary record that organizes delivery work.

Target project workspace sections:
- Overview
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
