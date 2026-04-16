# FloorConnector Workflows

This document defines the canonical business workflows in FloorConnector as they exist today, and clarifies the intended near-term workflow direction for the contractor app.

It is an operational workflow document, not a technical architecture document.

Cross-references:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): system design
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): next-phase build order

## Workflow Principles

- no duplicate data entry across stages
- project-centered operational continuity
- records flow forward rather than being recreated
- status progression should guide next actions

In practical terms:
- a lead should not become a second disconnected customer-like record later
- an approved estimate should feed downstream contract, job, and invoice workflows instead of being re-entered
- canonical records should stay linked so teams can follow the same job from intake through payment
- the app should guide users toward the next best action instead of presenting every downstream action as equally primary

## Canonical Workflow Chain

The current canonical business chain is:

`Auth -> Organization Bootstrap -> Dashboard -> Lead / Opportunity -> Customer + Project -> Estimate -> Contract -> Job -> Invoice -> Payment`

This chain is already real in the current system, even though the user experience is still distributed across multiple module pages instead of being fully project-centered.

## Canonical Records Vs Supporting Workflow Stages

Canonical system records:
- organization
- membership
- opportunity
- customer
- project
- estimate
- contract
- job
- invoice
- payment

Supporting workflow stages:
- contact and qualification work
- site assessment or inspection
- customer-provided measurements, photos, and requirements
- estimate review and approval
- contract send / signature readiness
- deposit or financial readiness checks
- scheduling readiness
- closeout

The key distinction is:
- canonical records are durable business entities stored in the shared system model
- supporting workflow stages are operational checkpoints that move canonical records forward

## Current Implemented Workflows

The current app already supports the following live workflows:

### Auth And Org Entry

Implemented flow:
- user signs in with Google or email/password
- first access bootstraps profile, organization, and owner membership when needed
- user lands in the protected contractor app

Current canonical records involved:
- profile
- organization
- membership

### Lead / Opportunity Intake

Implemented flow:
- contractor creates an opportunity in `/leads`
- opportunity can be reviewed and updated
- starting the estimate path creates or links the downstream customer and project records as needed

Current canonical records involved:
- opportunity
- optional linked customer
- optional linked project

### Customer To Project

Implemented flow:
- customer records are managed in the protected app
- projects are created under canonical customers
- project detail acts as the current bridge into estimating and downstream work

Current canonical records involved:
- customer
- project

### Project To Estimate

Implemented flow:
- estimates are created from project context
- estimate line items, totals, tax, and discount handling are live
- estimates move through status progression such as `draft`, `sent`, `approved`, and `rejected`

Current canonical records involved:
- project
- customer context derived through project
- estimate
- estimate line items

### Approved Estimate To Contract

Implemented flow:
- approved estimates can generate canonical contracts
- contracts use the shared template foundation
- draft contracts may be lightly edited
- unrestricted editing locks once signature activity begins

Current canonical records involved:
- estimate
- contract
- shared template reference
- project and customer context carried forward

### Approved Estimate To Job

Implemented flow:
- approved estimates can create jobs
- jobs track operational execution states such as `unscheduled`, `scheduled`, `in_progress`, and `completed`
- job detail provides progression-oriented actions

Current canonical records involved:
- project
- customer
- optional estimate
- job

### Completed Job To Invoice

Implemented flow:
- invoices can be created from project, approved estimate, or job context
- the preferred operational direction is to invoice from completed work where appropriate
- invoice line items, totals, tax, exemption snapshots, retainage, and balance due are live

Current canonical records involved:
- project
- customer
- optional estimate
- optional job
- invoice
- invoice line items

### Invoice To Payment Recording

Implemented flow:
- payments are recorded directly against canonical invoices
- invoice balances update from recorded payments
- invoice status updates into `partially_paid` and `paid` based on recorded payments

Current canonical records involved:
- invoice
- payment

## Recommended Contractor Revenue Path

The best current product direction for the contractor revenue workflow is:

1. Lead / Opportunity
2. Contact / customer qualification
3. Site assessment / inspection or customer-provided measurements and requirements
4. Estimate
5. Estimate approval
6. Contract
7. Contract approval / signature readiness
8. Invoice / deposit or financial readiness where applicable
9. Job execution / scheduling
10. Payment and closeout

How this should be interpreted today:
- some of these steps already map cleanly to canonical records in the app
- some are operational stages that still need stronger UX guidance, status handling, or readiness logic
- the system should preserve one continuous path rather than forcing users to decide between disconnected modules

## Intended Workflow Direction

The intended near-term direction is not to invent a new business model. It is to tighten the already-implemented chain so the app behaves more like one guided contractor journey.

### Preferred UX Direction

The preferred contractor journey is:

`Opportunity -> Customer / Project -> Estimate -> Contract -> Job -> Invoice -> Payment`

With supporting readiness stages between those records:
- qualification
- site assessment or requirements gathering
- approval
- signature readiness
- deposit or billing readiness
- scheduling readiness
- closeout

### Project As The Operational Hub

In data-model terms, FloorConnector already uses shared canonical records across modules.

In UX terms, the near-term direction is:
- `Project` should become the operational hub
- estimates, contracts, jobs, invoices, files, and activity should feel like connected parts of one project
- standalone module routes should continue to exist as global queues and work surfaces, not as separate mental models

### Workflow Tightening Still Needed

Areas where the current implementation is real but still needs workflow tightening:
- stronger next-best-action guidance so users do not have to choose from too many equal-weight downstream actions
- clearer readiness and blocker messaging between estimate approval, contract progress, job readiness, and invoice readiness
- more project-centered continuity in navigation and page structure
- better handling of operational stages such as site assessment, deposit readiness, and scheduling readiness without duplicating core records

## Current Practical Interpretation

Today, the app should be understood this way:
- opportunities start the commercial path before a full project exists
- customers and projects anchor the operational path
- estimates define proposed commercial scope
- approved estimates feed downstream contract and job creation
- jobs represent execution
- invoices and payments complete the financial path

That means FloorConnector is already operating on one shared business chain, even though some screens still expose the workflow in a more module-driven way than the intended product direction.
