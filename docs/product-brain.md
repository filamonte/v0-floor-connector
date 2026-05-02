# FloorConnector Product Brain

Status: high-signal product and implementation memory for future Codex sessions.

Read this with:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)

If this file conflicts with [docs/current-state.md](C:/FloorConnector/docs/current-state.md), trust current-state for implemented reality.

## What FloorConnector Is

FloorConnector is a production-first contractor operating system for epoxy flooring, concrete polishing, and specialty surface contractors.

It is not a collection of disconnected modules.
It is one shared multi-tenant system that should help contractors run the business from sales through execution and payment on a single canonical chain.

## Canonical Workflow

The canonical connected workflow is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Supporting records such as appointments, punchlists, time, daily logs, and progress billing must strengthen this chain, not compete with it.

## Operational Root

`Project` remains the operational root.

Interpretation:
- projects should be the main contractor workspace for connected delivery work
- global routes can still exist as cross-project manager surfaces and queues
- downstream records should point back to project continuity instead of becoming separate workflow homes

## Non-Negotiable Continuity

Do not break these:
- tenant isolation
- shared canonical records across contractor app and portal
- estimate -> contract -> invoice continuity
- approved-estimate -> SOV -> invoice continuity for progress billing
- job as the canonical execution scheduling record
- project/job chain for punchlists, daily execution, and time support
- opportunity/customer/project continuity for appointments

## Current UI Direction

The active contractor UI baseline is already established:
- top-nav-first contractor shell
- flattened unified header with breadcrumb and page context
- dashboard as the visual reference point for manager surfaces
- shared manager-page wrapper and command-bar rhythm
- quick-create -> canonical record -> full workspace
- black/near-black framing, gray secondary chrome, orange emphasis, and light-neutral work surfaces

Do not reintroduce:
- blue-heavy contractor chrome
- always-on left-nav as the primary app model
- permanently open create forms on manager pages
- module-specific visual systems

## Module Behavior Rules

Modules are work surfaces, not separate products.

Modules should:
- use shared canonical entities
- expose cross-project queues or manager surfaces where helpful
- link back into project and record workspaces
- use shared quick-create and shared workspace language where practical

Modules must not:
- invent duplicate business models
- create shadow workflow records
- turn dashboards into separate product worlds
- hide continuity behind module-local summaries

## Drift To Avoid

Future work should avoid:
- building target-direction ideas as if they are already implemented
- adding disconnected scheduling, billing, CRM, or portal subsystems
- creating placeholder pages that look real but are not canonical
- broadening small tasks into platform redesigns
- building out of order when the current branch still needs workflow coherence or workspace quality first

## Placeholder Vs Real Features

When touching a surface that used to be a placeholder:
- inspect the current branch first
- do not assume it is still missing
- if it is now real, extend the current implementation instead of replacing it
- if it is still missing, connect the new feature to canonical records on day one

## Implementation Bias

Prefer:
- small, reviewable changes
- continuity over module completeness
- workflow coherence over adding another route
- shared wrappers/components over one-off page hacks
- real persistence and real server validation for canonical workflows

## Documentation Expectations

When branch truth materially changes:
- update [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- update [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md) when implementation guardrails shift
- update [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md) when fast-start orientation should change
- update [README.md](C:/FloorConnector/README.md) if the documentation map or repo onboarding changed

Keep active docs short, current, and non-competing.
