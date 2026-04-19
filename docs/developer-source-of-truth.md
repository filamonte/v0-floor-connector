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
- contracts
- jobs
- invoices and payments
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

`opportunity -> customer -> project -> estimate -> contract -> job -> invoice -> payment`

Important workflow rules:
- projects should become the operational hub over time
- the current contractor app may still use parallel top-level routes during that transition
- contracts, invoices, and estimates must stay connected through the shared canonical model
- templates are shared infrastructure across estimates, contracts, and invoices
- records should flow forward instead of being recreated downstream
- project detail is the primary workflow/readiness hub for the connected contractor flow
- estimate, contract, invoice, and job pages should use one shared record-workspace pattern and point back to the project hub when broader workflow state matters
- invoice detail should be treated as review-first in layout direction, even when edit controls remain available
- the first major contractor workspace UI polish pass is complete enough to stop; remaining issues should be treated as normal iterative polish rather than structural layout-system repair

## Current Preferred Implementation Style

- use canonical shared data only
- do not create module-specific data silos
- keep business logic in shared packages or server-side utilities where practical
- preserve tenant isolation everywhere
- use real Supabase-backed persistence for canonical workflows
- keep current route architecture unless the task explicitly calls for route changes
- prefer small, reviewable changes over broad rewrites
- when refining contractor UI, prefer the shared workspace pattern over one-off page layouts

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
