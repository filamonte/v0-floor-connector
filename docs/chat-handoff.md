# Chat Handoff

Status: Active
Doc Type: Operational

This is a compact operational handoff for the current branch. It is not a competing source of truth.

## Required First Read

Before doing implementation or documentation work, read [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md).

Then use:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented truth
- [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md) for maturity framing
- [docs/module-status.md](C:/FloorConnector/docs/module-status.md) for concise module status
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for workflow rules
- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md) for doc maintenance rules
- [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md) for settled architecture decisions
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md) for AI-readable boundaries

## What FloorConnector Is

FloorConnector is a production-first SaaS operating system for specialty flooring contractors. It is built around one connected contractor workflow, not disconnected modules:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Current Branch Reality

The current branch has a real operational foundation: auth, tenancy, opportunities/leads, customers, projects, estimates, contracts, change orders, jobs, invoices, payments, portal foundations, workforce/time/field foundations, settings, super admin, and normalized contractor UI patterns.

It is best understood as a platform operating-system foundation with evolving UX depth, reporting depth, automation depth, integration depth, and AI depth. It is not an early prototype.

## Current Active Focus

Current work should generally preserve the implemented operational core while tightening:
- project-centered continuity
- workflow/readiness guidance
- scheduling and dispatch depth
- materials/catalog/document depth
- financial/reporting/integration depth
- communications, automation, and AI assistance as layers on canonical records

## Non-Negotiable Guardrails

- `docs/current-state.md` owns implemented truth.
- Preserve the canonical lifecycle exactly.
- Do not create duplicate business models.
- Do not create portal-only copies of canonical records.
- Do not create module-local silos.
- Contractor app and portal act on the same canonical records.
- Quick create must create canonical records first and route into full workspaces.
- Financial, payment, and signature events extend canonical records and preserve history.
- Top-nav-first contractor shell remains the current UI baseline.
- Roadmap, vision, and target IA docs are future direction unless current-state says otherwise.

## Immediate Documentation / AI Warnings

- Do not read roadmap phases as date-based timelines or week-count build plans.
- Treat `Foundation` as "canonical structure exists, deeper workflow depth remains future."
- Treat target IA routes as target direction, not current route reality.
- Do not use historical handoff entries as current implementation truth.
- If docs conflict, update the non-current-state doc or add a caveat.

## Where To Read Next

- Governance: [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md), [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)
- Architecture principles: [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md), [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md), [docs/platform-philosophy.md](C:/FloorConnector/docs/platform-philosophy.md)
- Current truth: [docs/current-state.md](C:/FloorConnector/docs/current-state.md), [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md)
- Operational architecture: [docs/workflows.md](C:/FloorConnector/docs/workflows.md), [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md), [docs/ui-system.md](C:/FloorConnector/docs/ui-system.md), [docs/financial-architecture.md](C:/FloorConnector/docs/financial-architecture.md), [docs/portal-architecture.md](C:/FloorConnector/docs/portal-architecture.md)
- Future direction: [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md), [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md), [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md)
- ADRs: [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md)
- Diagrams: [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md)
- AI guidance: [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md)
