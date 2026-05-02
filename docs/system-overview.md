# FloorConnector System Overview

Status: synthesis overview of the currently implemented system and the next logical layers ahead.

This document is designed to do three jobs at once:
- explain FloorConnector clearly to non-technical readers, including investors and advisors
- align product and engineering teams around what the system actually is today
- prevent documentation drift by restating the core architectural rules in one place

This document is a synthesis, not the implementation source of truth. When exact implementation status matters, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Section 1 -- Product Overview

FloorConnector is one operating system for specialty flooring contractors, especially epoxy flooring, concrete polishing, and related surface-work businesses. It connects sales, contracts, billing, payments, workforce tracking, and field execution into one continuous workflow instead of forcing teams to manage the same job across disconnected tools.

It is built for contractor organizations that need one system to carry work from commercial intake through customer approval, billing, payment, workforce tracking, and field execution.

Why this is different is simple: most contractor software splits the same project across separate systems. Leads live in one place. Proposals in another. Contracts and signatures in another. Invoices and payments in another. Field execution and labor records somewhere else. Customers often experience the same project through PDFs, email threads, and isolated portals that are not connected back to the operating system.

FloorConnector is designed to replace that fragmentation with one shared system. The contractor creates the work once. The system holds the truth. The customer interacts with that same work through the portal. The system updates in place. The contractor continues from the updated truth instead of reconciling copies, sync gaps, or module-specific records.

That is the core product idea: one connected contractor workflow, not a collection of separate software modules.

## Section 2 -- What Is Built (Implemented System)

The current branch already contains a real multi-tenant contractor app, a real customer portal foundation, and a connected commercial-to-payment workflow built on canonical shared records.

### Commercial Flow

What users can do now:
- create and manage opportunities and leads
- create and manage customers
- create and manage projects
- build estimates through an inventory-first workspace backed by shared `catalog_items`, reusable systems, and canonical `estimate_line_items`
- expand reusable systems by sqft into estimate pricing rows through shared logic
- use derived estimate tax behavior driven by organization defaults, customer exemption state, and item-level taxability
- use autosave, inline estimate-title editing, and persisted status progression in the estimate workspace
- move approved commercial scope into downstream contract, job, and invoice workflows

In practical terms, the commercial path is already live. Contractors can start with lead intake, move into project and estimate work, and carry that scope forward without recreating records in each stage.

### Contract Signature Workflow

What users can do now:
- generate canonical contracts from approved estimate and project context
- edit contracts while they are still in draft
- require internal approval before send when configured
- send contracts through the canonical signature workflow
- let customers review, sign, or decline from the portal
- support optional contractor countersign
- review signer routing and immutable signature history on the same contract chain

The important point is that signature workflow extends the canonical contract. FloorConnector does not create a separate signed-contract system.

### Invoice And Payment Workflow

What users can do now:
- create and manage canonical invoices with line items
- record contractor-side payments directly against invoices
- automatically recalculate invoice balance and paid state
- let portal customers review invoices on the same shared billing record
- let customers initiate payment from the portal
- create real checkout sessions on the canonical payment chain
- complete provider-backed payments through verified webhook handling
- write immutable payment events for request, checkout, success, failure, void, and provider sync states
- reflect payment progress across contractor invoice/project pages and portal invoice/project/home pages

This is not just payment intent capture. Gateway-backed completion now lands on the same canonical invoice and payment chain.

### Contractor-Side System

What contractor teams can do now:
- work inside a protected multi-tenant app shell
- navigate organization-aware modules
- use project detail as the main readiness and workflow hub
- use estimate, contract, invoice, and job detail pages as connected workspaces
- rely on server-side readiness enforcement before scheduling and execution workflows proceed
- manage organization-level settings and admin foundations
- use super-admin configuration foundations at the platform layer

The contractor app is no longer just a data shell. It supports connected operating workflows across commercial, billing, and execution contexts.

Shared estimate attachments and related documents now live in one tenant-safe `documents` storage bucket using organization-first paths rather than module-specific buckets.

### Customer Portal

What customers can do now:
- access only the projects explicitly shared with them
- use a real portal shell and portal home workspace
- open project-centered portal workspaces
- review shared estimates
- review and act on shared contracts
- review shared invoices
- initiate payment and see payment-state continuity

The portal is not a duplicate product with duplicate records. It is a customer-facing surface on top of the same canonical records used by the contractor app.

### Workforce And Time

What teams can do now:
- manage canonical people records
- manage vendors and vendor-linked subcontract labor foundations
- manage compliance records on people and vendors
- record canonical time punch events
- review derived time cards
- review current punch state
- connect labor/time continuity back to projects and jobs

This is a real workforce and time foundation, even though deeper scheduling, dispatch, and payroll layers are still later work.

### Field Execution

What teams can do now:
- create and manage canonical daily logs
- create and manage canonical field notes attached to daily logs
- attach lightweight execution files and photos
- review project-centered execution continuity
- use labor summaries derived from time cards
- review project and job execution context from the same shared system
- block scheduling and execution workflows until the project satisfies readiness requirements

Field execution is therefore part of the same operating chain. It is not a disconnected field-reporting silo.

## Section 3 -- How The System Works (End-to-End Flow)

The clearest way to understand FloorConnector is this loop:

`contractor -> system -> customer -> system -> contractor`

That loop is one of the central product ideas. It explains why FloorConnector is more than a contractor app plus a portal: the contractor creates and manages canonical records, the system holds the truth, the customer acts on those same records, the system updates state, and the contractor continues from the updated truth.

Canonical lifecycle callout:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The system operates on this same canonical lifecycle. Contractor actions, customer interactions, portal access, signatures, payments, and execution workflows extend the same record chain; they must not create parallel systems.

### Step 1: Contractor -> System

The contractor creates and manages the canonical records:
- leads and opportunities
- customers
- projects
- estimates
- contracts
- invoices
- workforce and execution records

The contractor is not building parallel versions of the same project in multiple modules. The system stores one connected set of records.

### Step 2: System Holds The Truth

Once those records exist, the system becomes the source of truth for the workflow:
- approved estimates feed contracts
- contracts carry signature state
- invoices carry billing state
- payments update invoice balance and project continuity
- time and field execution stay attached to the same project chain

This matters because the system is not passing around snapshots, exports, or portal copies. It is holding the active business record.

### Step 3: Customer -> System

The customer enters through the portal and acts on those same records:
- opens the shared project
- reviews the shared contract
- signs or declines the shared contract
- reviews the shared invoice
- starts and completes payment on the shared invoice/payment chain

The customer is not acting on a second portal-specific version of the contract or invoice. The action happens on the same canonical record set.

### Step 4: System Updates State

After the customer acts, the system updates the canonical workflow state:
- contract signature status changes
- signer routing advances
- payment events are written
- payments finalize
- invoice balance and paid state recalculate
- project and portal guidance update from the new truth

This update happens in the shared system, not in a disconnected customer-facing tool.

### Step 5: Contractor Continues From Updated Truth

The contractor then continues operating from the updated state:
- sees the contract is now signed
- sees the invoice is now paid or partially paid
- sees payment failures or voids if they occur
- sees readiness and next-step guidance change
- continues into execution and downstream work using the same project chain

That is the practical value of the system:

`contractor creates -> system holds -> customer acts -> system updates -> contractor continues`

### Contractor Flow

The implemented contractor-side lifecycle can be summarized as:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

In practical terms:
- a contractor starts with opportunity or lead intake
- the system creates or links the canonical customer and project
- estimating happens on that shared project chain
- approved scope feeds the canonical contract
- signature happens on that same contract
- billing happens on canonical invoices tied to the same project and estimate context
- payment lands on canonical payments tied to those invoices
- execution continues through jobs, daily logs, field notes, time cards, and related records on the same project chain

### Customer Flow

The implemented customer-side chain can be summarized as:

`portal -> project -> contract -> sign -> invoice -> pay`

One simple visual summary of the shared customer-facing operating chain is:

`Opportunity -> Customer -> Project -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment`

In practical terms:
- the customer enters through project-scoped portal access
- the portal shows only the projects explicitly shared with that customer
- inside each project, the customer can open the connected contract and invoice records
- contract actions happen on the same canonical contract the contractor uses
- payment actions happen on the same canonical invoice/payment chain the contractor uses

## Section 4 -- Architecture Principles

FloorConnector is built on a few disciplined principles that define how the product should continue to grow.

### One Canonical Shared Data Model

Major business records exist once and are reused across the system.

That includes:
- opportunities
- customers
- projects
- estimates
- contracts
- invoices
- payments
- people
- vendors
- time records
- daily logs
- field notes

This is the product's central rule. If the same customer, project, contract, invoice, or payment starts appearing in multiple module-specific forms, the system is drifting in the wrong direction.

### Modular Monolith

FloorConnector is implemented as a modular monolith:
- one codebase
- one shared tenant model
- one shared database foundation
- shared packages for domain logic, types, UI, database access, and integrations

This gives the product clean module boundaries without fragmenting the source of truth.

### Contractor App And Portal Are Two Surfaces On The Same System

The contractor app and the portal are not two separate systems.

They are two surfaces on the same underlying records:
- contractors manage the records
- customers review and act on those records
- the system updates shared state
- contractors continue from the updated state

The portal constrains visibility. It does not redefine the business objects.

### Signatures Extend Canonical Contracts

Signature workflow extends the contract through:
- canonical status and timestamp fields on contracts
- supporting contract signer records
- immutable contract signature events

There is no separate signed-contract system.

### Payments Extend Canonical Invoices And Payments

Payment workflow extends the billing chain through:
- canonical invoices
- canonical payments
- immutable payment events
- gateway/session metadata on canonical payments

There is no separate checkout-payment model and no separate portal billing model.

## Section 5 -- What Is Not Built Yet

The right way to describe the current product is not "unfinished in general." The operating backbone is implemented: the shared commercial, contract, billing, payment, portal, workforce, and field-execution chain is real. The remaining items below are intentionally not yet built or are only partially implemented as later-depth layers.

### Not Built Yet

These are still later layers:

#### Communications
- internal messaging
- contractor-to-customer messaging
- broader notification and conversation workflows

#### Scheduling And Dispatch
- full scheduling calendar workflows
- crew assignment
- dispatch boards
- deeper operational scheduling controls

#### Deeper Payment Features
- refunds
- disputes
- subscriptions
- broader billing-center style self-service
- deeper reconciliation and retry tooling
- broader accounting integrations

#### Deeper E-Sign Features
- external e-sign provider integration
- richer provider lifecycle tooling
- deeper provider-driven signature workflows on top of the current canonical contract flow

#### Advanced Reporting And Analytics
- broader reporting
- cross-module analytics
- management dashboards
- higher-level business intelligence views

### What This Means

The product already has a connected operating core. What remains is not "basic functionality" in a vague sense. What remains is deeper workflow depth, automation, reporting, and adjacent layers around the core system.

## Section 6 -- What Comes Next

The next layers should follow the current roadmap direction in a disciplined order:

1. Project-centered workflow tightening
- strengthen project as the operational hub
- tighten readiness, blockers, and next-best-action guidance
- keep reducing page-to-page friction

2. Scheduling and dispatch foundations
- scheduling workflows
- crew assignment
- calendar and board views

3. Materials, reusable catalogs, and richer shared document tooling
- deepen reusable operational content on the same canonical system

4. External integrations
- deeper e-sign provider integration
- deeper payment-provider and reconciliation tooling
- PDF and document delivery
- tax and accounting adapters

5. Broader portal and communication expansion
- richer customer-facing workflows
- communication layers on top of the same shared records

This is a sequence of next layers, not speculation about a different product direction.

## Section 7 -- Reality Check (Anti-Drift Section)

This section exists to keep the system honest as it grows.

### What Is True Today

- no major module-specific data silos exist in the implemented core workflow
- contractor and portal surfaces use the same canonical commercial and financial records
- contract-signature workflow extends canonical contracts instead of replacing them
- payment workflow extends canonical invoices and payments instead of replacing them
- there is no portal-specific copy of contracts or invoices
- there is no separate signed-contract system
- there is no separate checkout-payment model
- there is no disconnected field-execution silo outside the shared project chain
- portal, contractor app, and workflow continuity are aligned enough to describe FloorConnector as one connected operating system

### Why This Matters

This is the main product difference versus many disconnected contractor software stacks.

In many systems:
- the portal is a copy
- the signature tool is a side system
- the payment tool is a side system
- the field tool is a side system
- the contractor team has to manually translate state back into operations

In FloorConnector, the goal is the opposite:
- the contractor creates the canonical records
- the customer acts on those same records
- the system updates those records
- the contractor keeps going from the updated truth

That is the anti-silo value proposition in practical terms.

### Where Future Drift Could Happen

The biggest drift risks are still:
- introducing portal-specific copies of commercial or billing records
- letting provider integrations become separate source-of-truth models
- adding scheduling, messaging, or reporting as disconnected modules instead of extensions of the shared project chain
- describing target capabilities as if they are already fully implemented

### The Discipline Going Forward

The operating rule should remain:
- one canonical shared data model
- one connected workflow chain
- one system with multiple surfaces
- no duplicate business records per module

Future features should extend the canonical record chain rather than introduce parallel models. That means:
- no portal copies
- no second signed-contract model
- no separate checkout-payment model
- no disconnected field-execution silo

That discipline is what keeps FloorConnector credible both as a product and as an implementation strategy.
