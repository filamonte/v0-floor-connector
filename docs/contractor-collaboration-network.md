# Contractor Collaboration Network

Status: Planned
Doc Type: Roadmap

This document describes future Contractor Collaboration Network / Trusted
Contractor Network direction. It is target planning only. It does not add
schema, migrations, routes, UI, server actions, RLS policies, product behavior,
provider integrations, or runtime collaboration behavior.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md).
For workflow rules, use [docs/workflows.md](C:/FloorConnector/docs/workflows.md).

Related documents:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md):
  canonical implementation guardrails
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md):
  target commercial and production workflow direction
- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md):
  future record-connected communications doctrine
- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md):
  future workflow automation doctrine
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md):
  future canonical metrics doctrine
- [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md):
  strategic sequencing registry
- [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md):
  staged build discipline

## Status And Purpose

The Contractor Collaboration Network is a future platform direction for extending
FloorConnector from a single-organization contractor operating system into a
trusted contractor collaboration network.

The intended layer would let vetted or certified contractor organizations work
together through controlled, project-scoped collaboration while preserving the
same canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

This should only be built after the operational core, Project Workspace,
scheduling, communications, permissions, RLS posture, and compliance foundations
are mature enough to support cross-organization access safely.

## Product Thesis

FloorConnector can eventually support cross-contractor collaboration because the
product already centers work around canonical projects, jobs, execution records,
financial records, and field evidence. The network thesis is not to create a
separate marketplace. It is to let trusted contractor partners participate in
specific work through scoped access to the owning contractor's records.

Preferred language:

- trusted contractor network
- approved partner graph
- project-scoped collaboration
- shared operational visibility
- canonical-record-safe collaboration
- vetted or certified service provider
- Certified FloorConnector Service Provider

Avoid language and product drift such as:

- public marketplace
- bidding exchange
- lead resale
- subcontractor clone system
- gig labor platform

Construction collaboration and Common Data Environment patterns are useful
references because they emphasize a single source of truth, controlled access,
project-level collaboration, auditability, and reduced duplicate or outdated
information. FloorConnector should adapt those principles for specialty
flooring, resinous, concrete polishing, and surface contractors rather than
building a generic GC-centric or BIM-centric collaboration product.

## Core Use Cases

Future use cases may include:

- Contractor A maintains an approved list of vetted FloorConnector contractors.
- Contractor A invites Contractor B to collaborate on a specific project or job.
- Contractor B sees only scoped project, job, and work context granted to them
  inside their own FloorConnector experience.
- Contractor B can contribute permitted execution updates, field notes,
  files/photos, schedule coordination, or communications depending on granted
  access.
- Contractor A remains the owner of the project, customer, commercial, and
  financial chain unless a later formal multi-party commercial model is
  intentionally designed.
- Contractor B does not receive or create duplicate project, job, customer,
  contract, invoice, or payment records.
- Future overflow labor requests can route only to approved and vetted partners.
- Future specialty crew requests can be created from real project or job
  readiness context.
- Future compliance checks can use existing people, vendor, and compliance
  concepts before access is granted.
- Future performance metrics can derive from actual collaboration outcomes, not
  detached ratings.

## Architecture Principles

The collaboration layer must preserve these guardrails:

- one canonical project owner
- one canonical job or work order record
- scoped access grants instead of cloned records
- collaboration views project the owning contractor's shared records into the
  invited contractor's workspace
- no duplicate estimate, contract, invoice, or payment models
- no portal-only or network-only copies
- no public bidding marketplace in early phases
- no unaudited field updates from external partners
- all cross-organization visibility is explicit, tenant-safe, permissioned,
  auditable, and revocable
- external contractor access respects the existing lifecycle chain and project
  readiness rules
- financial authority remains with the owning contractor unless a later formal
  multi-party billing model is designed

The network layer should borrow the collaboration discipline of a single source
of truth and controlled project access without importing marketplace chaos,
price-race behavior, or disconnected subcontractor silos.

## Conceptual Model

These are conceptual planning names only. They are not implemented schema names
and should not be treated as migration instructions.

Possible future concepts:

- network provider profile
- certification or vetting status
- contractor specialties
- service regions
- partner relationship or approved contractor list
- project collaboration grant
- job collaboration grant
- collaboration role or permission set
- collaboration activity or audit event
- compliance snapshot at time of grant
- optional future availability or capacity signal

If implementation begins later, schema design must go through migrations, RLS
review, authorization review, and current-state documentation updates.

## Permission Model Direction

Likely future permission categories:

- view project summary
- view job or work order
- view schedule
- view files and photos
- upload field evidence
- add field notes
- participate in project communications
- view assigned tasks or punch items
- update assigned execution status
- view limited customer-facing context
- no financial access by default
- no estimate, contract, invoice, or payment mutation by default
- no customer-wide access by default
- no tenant-wide access by default

Access should be least-privilege, record-scoped, time-aware where useful,
revocable, and auditable. Customer contact data, pricing, files, pipeline, and
payment history should remain hidden unless intentionally granted for the exact
project, job, or record context.

## UX Direction

Likely future surfaces:

- Platform or super-admin vetting and certification management
- Contractor settings: approved partners
- People/Vendors integration: link external partner company to a FloorConnector
  network identity
- Project Workspace: invite approved partner
- Job Workspace or Schedule: grant scoped collaboration
- Partner dashboard: Shared with us or Partner work
- Communications: project-scoped contractor-to-contractor threads
- Compliance: insurance and certification readiness before granting access
- Activity timeline: cross-contractor updates clearly attributed

The invited contractor's experience should feel like scoped operational work in
their own FloorConnector environment, not a cloned project, detached portal, or
separate subcontractor app.

## Phased Rollout

This sequence is future direction only and should come after operational core
maturity, scheduling maturity, communications maturity, and stronger permissions
/ RLS review.

| Phase   | Direction                                                                     |
| ------- | ----------------------------------------------------------------------------- |
| Phase 0 | Documentation and guardrails only.                                            |
| Phase 1 | Certified provider profile and vetted/approved partner list.                  |
| Phase 2 | Project/job-scoped read-only collaboration grants.                            |
| Phase 3 | Scoped field contribution: notes/photos/status updates.                       |
| Phase 4 | Contractor-to-contractor communication and task coordination.                 |
| Phase 5 | Overflow/specialty crew requests to approved partners only.                   |
| Phase 6 | Availability/capacity signals, performance history, and ecosystem extensions. |

Manufacturer, distributor, and certification participation belongs only where it
reinforces the canonical project chain, such as compliance readiness, product
certification, installed-system context, materials support, or approved partner
qualification.

## Risks And Anti-Patterns

This layer must not drift into:

- HomeAdvisor/Angi-style lead resale
- price-race marketplace behavior
- external partner work that bypasses project readiness
- external partner mutation of owner financial records
- contractor-owned copies of the same project
- broad tenant-to-tenant visibility
- network effects before the single-organization workflow is sticky
- public marketplace behavior before permissions, compliance, ownership, and
  tenant isolation are proven
- descriptions that imply this is built before implementation exists and
  [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says so

The crown jewel is cross-contractor collaboration without cloning the business
record.

## Relationship To Existing FloorConnector Layers

Project as operational hub:

- The owning contractor's Project Workspace remains the source of operational
  truth. Collaboration grants should expose scoped views of that project rather
  than create partner-owned project copies.

People/Vendors:

- External partners may relate to people, vendors, subcontractor, and partner
  identity concepts, but they must not create duplicate contractor, customer, or
  project records.

Compliance records:

- Insurance, certification, safety, and compliance readiness can become grant
  prerequisites or visible readiness context.

Jobs and scheduling:

- Collaboration should attach to canonical jobs, job assignments, schedule
  context, and readiness rules. It must not create a separate dispatch system.

Daily logs, field notes, and execution attachments:

- Partner contributions should be attributed field evidence on the shared
  execution chain, not detached external reports.

Communications Layer:

- Contractor-to-contractor communication should be project-scoped and
  record-linked. It should not become a free-floating contractor chat product.

Automation Layer:

- Future automation may prepare collaboration invites, compliance checks,
  readiness reminders, or partner handoff prompts, but accepted actions must use
  approved server-side workflows and human review where risk exists.

Reporting and metrics:

- Metrics should derive from actual collaboration outcomes such as response time,
  field completion, compliance readiness, schedule reliability, and closeout
  quality. Detached ratings should not become business truth.

Super-admin and contractor settings:

- Platform controls may manage certification/vetting. Contractor settings may
  manage approved partners and collaboration defaults.

Customer portal:

- Customer portal access and contractor network access are separate access
  models. The customer portal is customer-facing project access; contractor
  collaboration is cross-organization operational access. Neither should copy or
  redefine the other's records.
