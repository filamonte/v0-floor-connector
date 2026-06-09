# Product Operating Model

Status: Active
Doc Type: Product Governance

This document defines the official target operating model for FloorConnector
product and UX decisions. It is product governance, not implemented truth. When
implementation status matters, use
[docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Purpose

FloorConnector is a specialty contractor operating system. The contractor app,
portal, super-admin, future public acquisition surfaces, future AI assistance,
and integrations are surfaces around one shared record chain, not separate
products with separate business truth.

This operating model clarifies:

- the pre-sale versus sold-work boundary
- when `Project` should exist in the target workflow
- how Assessment Packages become first-class knowledge capture
- how payment schedules govern Financial Readiness
- how Production Readiness differs from commercial readiness
- how future AIA / progress billing fits the canonical financial chain
- how AI and external tools support planning without owning truth

## Target Workflow

The target business workflow for a brand-new customer is:

```text
Lead
-> Opportunity
-> Assessment Package
-> Estimate
-> Estimate Approval
-> Contract
-> Contract Signature
-> Financial Readiness
-> Project Creation
-> Schedule
-> Production Readiness
-> Job Start
-> Change Orders, if required
-> Completion
-> Final Billing / Payment
-> Warranty
-> Review Request
-> Closeout
```

This is target operating-model direction. Current implementation may still
create or use `Project` earlier where
[docs/current-state.md](C:/FloorConnector/docs/current-state.md) records it.
Do not describe this full target sequence as implemented until current-state
and code confirm it.

## Canonical Record Ownership

The canonical implementation chain remains:

```text
opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment
```

Target stage ownership:

| Stage                | Canonical owner                                                                                                             | Operating rule                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Lead                 | Opportunity or intake context                                                                                               | Do not create a separate CRM-like lead model when Opportunity can own the work.        |
| Opportunity          | `opportunity`                                                                                                               | Owns pre-sale commercial intent before sold work exists.                               |
| Assessment Package   | Canonical assessment context linked to Opportunity first in target design, and to Project when the work becomes operational | Collect once, reuse downstream. Do not make it an Estimate or field-only record.       |
| Estimate             | `estimate`                                                                                                                  | Customer-facing commercial scope and price generated from reviewed Assessment context. |
| Contract             | `contract`                                                                                                                  | Legal/commercial commitment generated from approved estimate context.                  |
| Financial Readiness  | Contract payment requirements plus canonical invoice/payment evidence                                                       | Calculated from payment schedule requirements, not hardcoded to deposit paid.          |
| Project              | `project`                                                                                                                   | Operational root after work is real enough to operate.                                 |
| Schedule / Job Start | `job`, appointments, assignments                                                                                            | Production work must respect readiness, crew, material, equipment, and site blockers.  |
| Billing / Payment    | `invoice`, `payment`, SOV / retainage lineage where applicable                                                              | Billing extends the same estimate/contract/project financial chain.                    |

## Pre-Sale Boundary

A Project should not automatically exist for every lead or opportunity in the
target model.

Opportunity is the pre-sale commercial container. It can hold qualification,
site-assessment needs, customer intent, follow-up ownership, appointment
context, and the Assessment Package while the contractor decides whether the
work is worth estimating.

Project becomes the operational root after sale, generally after estimate
approval and contract progression. The exact implementation sequence may phase
in over multiple waves, but the product direction is clear: Project should
represent real work that is ready enough to operate, not every inquiry.

## Assessment Package

Assessment Package is first-class knowledge capture between Opportunity and
Estimate.

It is the shared context layer for:

- onsite sales representatives or inspectors
- office estimators
- owner review
- future customer self-service
- future AI-assisted assessment, estimating, financing, scheduling, risk
  detection, and production planning

Assessment Package may include site access, photos, measurements, areas,
substrate condition, moisture or crack observations, product preference,
customer goals, budget/financing signals, production risks, scope assumptions,
and estimator handoff notes.

Assessment Package is not:

- a separate CRM
- an Estimate
- a pricing engine
- a project-only silo
- a portal-owned copy
- an AI-only memory store

The target is Opportunity-owned pre-sale capture that becomes Project-owned
operational memory when a Project is created. Existing implementation may
already attach Assessment Packages to Projects; preserve that truth in
current-state and treat Opportunity-first ownership as a future alignment
direction until implemented.

## Danek Flooring Reference Workflow

Danek Flooring is the practical reference workflow for this model:

1. A new inquiry becomes an Opportunity, not automatically a Project.
2. Sales or inspection collects site facts in an Assessment Package: surface
   type, size, condition, photos, access, prep concerns, customer goals, and
   preferred system.
3. The estimator reviews the Assessment Package and creates an Estimate from
   that context.
4. The customer approves the Estimate.
5. Contract generation and signature move the work toward commitment.
6. Financial Readiness checks the contract's payment schedule, which may be
   deposit before scheduling, 50/50, net 30, due on completion, milestone
   billing, or future AIA/progress billing.
7. Project creation marks the work as operational.
8. Scheduling waits for required financial, material, labor, equipment, and
   site readiness.
9. Production starts only when blockers are visible and resolved or accepted.
10. Change Orders, billing, warranty, review request, and closeout stay on the
    same canonical chain.

## Future Self-Service Assessment

Customer self-service should extend the same Assessment Package, not create a
portal-only intake model.

Future homeowner-assisted capture may collect photos, dimensions, room/area
selection, product preference, timing, and budget signals before estimator
review. AI may help classify and summarize that input, but a human remains the
approval boundary before pricing, contract, financing, scheduling, production,
or customer commitments.

## Payment Schedules And Financial Readiness

Financial Readiness is not hardcoded to "deposit paid."

Financial Readiness should be calculated from contract payment requirements and
canonical invoice/payment evidence. The same contractor may need different
terms across residential, commercial, and repeat-customer work.

Payment schedules must support:

- net 30
- due on completion
- 50/50
- one-third at contract, one-third at mobilization, remainder at completion
- deposit before scheduling
- milestone billing
- future progress billing / AIA billing

Payment schedule is contract/business policy. Financial Readiness is the
workflow stage that asks whether the required terms for the next operational
move have been satisfied.

## Production Readiness

Production Readiness is the operational gate before job start. It includes:

- agreed scope
- required payment terms satisfied when required before production
- materials ordered or available
- labor available
- tooling and equipment available
- schedule readiness
- known site conditions and blockers

Production Readiness must not be reduced to a financial flag. A project can be
financially ready but operationally blocked by materials, labor, equipment, site
access, moisture, unresolved scope, or schedule constraints.

## AIA / Progress Billing

Full AIA / progress billing support is required future commercial-finance
maturity for real contractor adoption, especially commercial contractors. It is
not optional nice-to-have depth.

Current-state may confirm scaffolding such as Schedule of Values, retainage,
invoice foundations, payment foundations, and progress-invoice continuity. That
does not mean full contractor-ready AIA billing is implemented.

Future AIA maturity includes:

- formal pay applications
- continuation sheets
- percent-complete billing workflow
- billing periods
- GC / architect / owner approval workflow
- retainage release
- document generation or export
- accounting and reconciliation support

AIA billing must extend the same canonical financial chain:

```text
estimate / contract scope
-> Schedule of Values
-> pay application / progress invoice
-> payment
-> retainage tracking / release
```

Do not introduce a separate AIA-only billing module, detached pay application
records that bypass invoices/payments, spreadsheet shadow models, or an
invoice-replacement billing record.

## External Tool Posture

External planning and design tools support the repository source of truth; they
do not replace it.

- Notion may support product planning, decision logs, beta-readiness notes, and
  Danek workflow audit notes.
- Linear may support implementation waves, tickets, dependencies, blockers, and
  acceptance criteria.
- Stitch, Figma, and v0 may support design exploration, design-system
  validation, UI mockups, and implementation acceleration after UX governance is
  defined.
- Supabase is for future approved schema/data work only, never docs-only
  alignment streams.
- Stripe is for future approved payment integration or reconciliation work, not
  this docs-only operating-model alignment.

Repo docs remain authoritative for product decisions, implemented truth, and
governance.

## AI Posture

AI assists and accelerates. AI does not replace canonical records.

AI may summarize, classify, draft, recommend, detect risk, or prepare handoffs.
It must not create parallel business truth, bypass human approval, create
customer-facing commitments, mutate pricing, mutate contracts, schedule work,
change financial state, or expose portal-only copies without an approved,
reviewed workflow.

Human review remains required where business, legal, financial, production,
permission, or customer-experience risk exists.

## Anti-Silo Rules

- No data silos.
- One canonical shared data model.
- Contractor app and portal are two surfaces on the same records.
- No portal-only copies.
- No module-local duplicate records.
- No duplicate financial chains.
- No detached signed-contract system.
- No detached checkout/payment model.
- No separate AIA-only billing silo.
- Quick-Create must create canonical records first.
- Records flow forward, not recreated downstream.
- Project/shared record continuity beats module completeness.
- Contractor Settings and Super Admin remain separate.
- Dashboards are entry/prioritization surfaces, not separate product worlds.
- Target-only capabilities must not be described as implemented.
