# Developer Source Of Truth

Status: implementation guardrail document.

Use this file as the short developer-facing summary of what to trust when building in FloorConnector. It does not replace the deeper docs. It exists to reduce prompt drift and keep implementation work aligned with the current branch reality.

Use these docs together:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): doc maintenance and archival rules

## What Is Implemented Now

The current branch already includes a real multi-tenant contractor app with:
- Supabase-backed auth and organization bootstrap
- organization and membership model
- opportunities / leads
- customers
- projects
- estimates and line items
- change orders
- contracts
- contract-signature foundation and customer-facing contract signing on the canonical contract record
- jobs
- invoices and payments
- customer-facing payment foundation on the canonical invoice/payment chain
- people, vendors, and compliance foundations
- time tracking foundations
- daily logs, field notes, and execution attachments
- customer portal access, review, and contract-signature workflows
- shared templates
- reusable catalog foundations
- contractor settings / admin
- super-admin configuration foundations

Treat [docs/current-state.md](C:/FloorConnector/docs/current-state.md) as the source of truth for implemented status.

## What Is Target Architecture Only

These docs describe target direction, not current implementation truth:
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md)
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)

Do not describe target-only capabilities as already implemented unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says they exist on the current branch.

## Current Preferred Business Workflow

The preferred connected business path is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Important workflow rules:
- projects should become the operational hub over time
- the current contractor app may still use parallel top-level routes during that transition
- contracts, invoices, and estimates must stay connected through the shared canonical model
- change orders must extend the same shared project, contract, and invoice chain rather than introducing a separate scope-change model
- customer-facing signature actions now attach to the same canonical contract record used in the contractor app
- customer-facing payment workflow foundations now attach to the same canonical invoice/payment chain used in the contractor app
- templates are shared infrastructure across estimates, contracts, and invoices
- records should flow forward instead of being recreated downstream
- project detail is the primary workflow/readiness hub for the connected contractor flow
- estimate, contract, invoice, and job pages should use one shared record-workspace pattern and point back to the project hub when broader workflow state matters
- invoice detail should be treated as review-first in layout direction, even when edit controls remain available
- the first major contractor workspace UI normalization pass is complete enough to stop; remaining issues should be treated as normal iterative polish rather than structural layout-system repair
- the contractor shell now uses top-level navigation as the primary app navigation, with a wider workspace, shared workspace band, and command-bar-driven manager pages
- dashboard, projects, leads, invoices, contracts, customers, estimates, daily logs, time, people, vendors, and jobs now follow that newer manager-surface direction; avoid reintroducing a full-time left sidebar as the primary navigation model

## Current Contractor UI Guardrails

Treat the current contractor UI direction as implementation guardrail, not loose preference.

Do:
- keep top-level navigation as the primary contractor app navigation
- keep the contractor shell flat and unified: top navigation, thin page band, thin command/search strip, then workspace
- treat the dashboard as the visual reference for contractor manager surfaces
- build manager pages around page identity, command bar, and overview/list workspace
- use shared composer-sheet or modal patterns for create flows on manager pages
- prefer quick-create overlays that capture only minimum required fields, create the canonical record, and then route into the full record workspace
- keep change orders canonical and workflow-linked: contractor authoring, portal approval, and downstream invoice impact must stay on the same shared record chain
- reserve left-side rails for contextual deeper-screen navigation only when they materially help

Do not:
- do not return to a full-time left sidebar as the primary contractor navigation
- do not reintroduce dense stacked-panel dashboards as the main contractor dashboard pattern
- do not leave permanently open create forms on contractor manager pages
- do not let manager pages drift back into mixed old/new command-bar or chrome patterns
- do not treat dashboard and manager pages as separate visual systems
- do not try to complete full record authoring inside a manager-page quick-create overlay
- do not implement change orders as report-only artifacts, detached approvals, or portal-only records

The contractor UI baseline is now established enough that future contractor-page work should start from this system by default rather than reopening normalization decisions page by page.
The normalization phase is complete enough to stop; further contractor-page work should be treated as baseline-preserving feature work or targeted polish unless a real system-level mismatch appears.

## Current Preferred Implementation Style

- use canonical shared data only
- do not create module-specific data silos
- keep business logic in shared packages or server-side utilities where practical
- preserve tenant isolation everywhere
- use real Supabase-backed persistence for canonical workflows
- keep current route architecture unless the task explicitly calls for route changes
- prefer small, reviewable changes over broad rewrites
- when refining contractor UI, prefer the shared workspace pattern over one-off page layouts
- for contractor overview/list pages, prefer the newer top-nav manager pattern: clear page identity, command bar, wide workspace, overview/list-first composition, and contextual secondary navigation only when it truly helps

## Documentation Update Rules

When implementation changes, update docs in the same task when relevant:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented capabilities
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) for phase sequencing changes
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md) for architecture-boundary changes
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md) for target commercial workflow changes
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md) for target contractor app structure changes
- [README.md](C:/FloorConnector/README.md) for setup or high-level capability changes

## Docs To Treat Carefully

Do not casually edit these as if they were status notes:
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md)
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md)

These define target direction or documentation policy and should only change when that direction or policy actually changes.

## Archival Rule

Old docs should be archived, not left in active docs where they can silently compete with current guidance.

Follow [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md):
- keep active docs current
- archive superseded or historical docs under `docs/archive/`
- prefer archiving over deletion when older context may still be useful
