# FloorConnector Workflows

This document defines the canonical business workflows in FloorConnector as they exist today, and clarifies the intended near-term workflow direction for the contractor app.

It is an operational workflow document, not a technical architecture document.

Cross-references:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): system design
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): next-phase build order
- [docs/inventory-cost-architecture.md](C:/FloorConnector/docs/inventory-cost-architecture.md): inventory, cost-item, and tax model

This workflow document assumes the supporting configuration model now has two layers:
- super admin defines platform defaults and starter records
- contractor organizations adopt or override within their own tenant-owned settings

## Workflow Principles

- no duplicate data entry across stages
- project-centered operational continuity
- records flow forward rather than being recreated
- status progression should guide next actions

In practical terms:
- a lead should not become a second disconnected customer-like record later
- an approved estimate should feed downstream contract, job, and invoice workflows instead of being re-entered
- downstream financial records should always inherit from immutable approved snapshots rather than live estimate editing rows
- canonical records should stay linked so teams can follow the same job from intake through payment
- the app should guide users toward the next best action instead of presenting every downstream action as equally primary
- a future contractor-facing `Directory` may unify how contact-like records are browsed and managed, but it must remain a view over canonical records rather than a replacement business model

## Canonical Workflow Chain

The current canonical business chain is:

`Auth -> Organization Bootstrap -> Dashboard -> Lead / Opportunity -> Customer -> Project -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment`

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
- future project-scoped takeoff and scope intelligence
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
- contractor admins can invite a customer/contact email to project-scoped portal access from the canonical customer record after a customer and project exist
- invited customers use `/portal/invite?token=...` to sign up or log in, and the invite activates only when the authenticated email matches the contractor-created invite

Current canonical records involved:
- customer
- project
- portal access grant
- portal project access

Current customer-account interpretation:
- the customer is the full canonical customer/account record, not a lightweight contact card
- additional customer contacts may later appear beneath that account in a unified Directory workspace, but the account remains the commercial and financial source of truth
- normal portal onboarding is contractor-initiated from the shared customer/project workflow; customers do not self-register first unless a later customer-led quote/intake surface explicitly supports that path

### Project To Estimate

Implemented flow:
- estimates are created from project context
- estimate authoring is cost-item-first:
  - active `catalog_items` can be added directly
  - reusable systems expand by sqft through shared system logic
  - quick create from the estimate workspace saves a minimal new `catalog_items` record first, then adds it to the estimate
- `catalog_items` are the canonical reusable sellable cost item database; physical stock now belongs in `inventory_items`
- inventory remains optional per organization and never blocks cost item selection in estimates
- item-level tax stays simple:
  - customer tax exemption overrides everything
  - non-taxable cost items produce zero tax
  - otherwise organization or platform financial defaults determine the rate
- estimate line items, totals, tax, and discount handling are live
- `estimate_line_items` is the authoritative pricing-row source; legacy `estimates.content.itemRows` should not be used for new behavior
- estimate edits autosave with validation and stale-write conflict protection
- estimate defaults apply only when the estimate content is initially empty, resolving platform defaults first and contractor overrides second
- estimates move through status progression such as `draft`, `sent`, `approved`, and `rejected`

Current canonical records involved:
- project
- customer context derived through project
- estimate
- estimate line items
- catalog items
- catalog system components

Future workflow guidance:
- Takeoff & Scope Intelligence may become a supporting pre-estimate workflow stage between opportunity/site assessment and estimate authoring
- future inputs may include customer-provided plans/photos, contractor site data, measurements, requirements, and uploaded plan or image files
- takeoff should stay project-scoped and feed estimate creation through reviewed quantities mapped to reusable catalog/cost items
- Takeoff produces quantities. Catalog/cost items define reusable cost, pricing, production, and tax behavior. Estimates define customer-facing pricing and commercial scope.
- takeoff is not a replacement for estimates; the canonical estimate remains the commercial scope record and the customer-facing pricing proposal
- the intended future flow is `Lead / Opportunity -> Customer + Project -> Site Info / Plans / Photos -> Takeoff -> Cost Item Mapping -> Estimate Line Items -> Estimate -> Contract -> Job -> Invoice -> Payment`
- conceptual future objects may include `takeoffs`, `takeoff_documents`, `takeoff_measurements`, `takeoff_scope_items`, and `takeoff_estimate_links`, but these are not existing tables and should not be treated as implemented schema
- raw takeoff measurements should not own pricing; pricing belongs in catalog/cost items and estimate line items
- generated estimate line items should retain future source linkage back to the approved takeoff scope item, the takeoff measurement, and the source document or photo when applicable
- if a takeoff changes after estimate line items have been generated, the future takeoff-estimate link or estimate should be flagged as out of sync until a user reviews it
- AI-assisted measurements, scope suggestions, and cost-item mapping suggestions must remain reviewable and explicitly contractor-approved before they become customer-facing estimate content
- takeoff quantities may eventually inform material requirements, labor estimation, production readiness, and job planning, but there should be no direct takeoff-to-invoice flow

Customer-account guardrail for downstream commercial flows:
- estimate send recipient continuity remains on canonical customer/account fields by default
- the same rule should continue for invoice recipient, contract customer context, payment/billing context, and project ownership unless a later approved customer-contact permission model explicitly changes a specific flow

Implemented approval rules:
- customer-facing estimate approval happens through the portal on the same canonical estimate record
- approval does not execute downstream financial actions automatically
- approval creates an immutable commercial snapshot used for downstream contract, SOV, and invoice lineage

Supporting audit and delivery records involved:
- estimate customer events

### Approved Estimate To Contract

Implemented flow:
- approved estimates can generate canonical contracts
- contract generation reads from approved estimate snapshot data only
- contracts use the shared template foundation
- draft contracts may be lightly edited
- unrestricted editing locks once signature activity begins
- contractor-side send-for-signature and optional countersign workflow now run on the same canonical contract record
- portal customers can now review, sign, and decline the same canonical contract through tenant-safe portal access

Current canonical records involved:
- estimate
- contract
- contract signers
- contract signature events
- shared template reference
- project and customer context carried forward

### Estimate To Change Order

Implemented flow:
- approved estimates establish the first immutable commercial baseline for downstream billing
- later scope changes are captured as canonical change orders on the same project and contract chain
- approved change orders create immutable commercial snapshots of the approved scope adjustment
- approved change-order snapshots can append into SOV or invoice workflows without mutating the approved estimate snapshot

Current canonical records involved:
- estimate commercial snapshots
- change order
- change order commercial snapshots
- change order commercial snapshot items

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
- invoices can be created from project, approved estimate snapshot, selected SOV rows, approved change-order snapshot rows, or job context
- the preferred operational direction is to invoice from completed work where appropriate
- invoice line items, totals, tax, exemption snapshots, retainage, and balance due are live
- each invoice line uses one explicit lineage path only:
  - approved estimate snapshot item
  - selected SOV item
  - approved change-order snapshot item
  - invoice-only adjustment
- direct billing from live `estimate_line_items` is not canonical

Current canonical records involved:
- project
- customer
- optional estimate
- optional job
- invoice
- invoice line items
- schedule of values
- schedule of value items

### Invoice To Payment Recording

Implemented flow:
- payments are recorded directly against canonical invoices
- invoice balances update from recorded payments
- invoice status updates into `partially_paid` and `paid` based on recorded payments
- customer-facing payment workflow foundations now exist on the same canonical invoice and payment chain
- payment request, checkout-start, success, failure, and void events now write immutable payment events instead of introducing a second checkout or portal-payment model
- contractor-side invoice and project workspaces now surface payment continuity and next-step guidance from the same canonical invoice and payment state

Current canonical records involved:
- invoice
- payment
- payment events

### Notifications And Communications

Implemented flow:
- workflow activity now writes immutable notification events on the shared canonical chain
- per-user notifications track in-app read state from those events
- notification deliveries track channel outcomes such as sent, delivered, opened, clicked, and failed
- canonical communication threads and immutable messages now keep record-attached conversation history on the same customer and project chain

Current canonical records involved:
- notification events
- notifications
- notification deliveries
- communication threads
- communication messages

### Financials Module Home

Implemented flow:
- `Financials Home` at `/financials` is now the section entry point for cross-project financial work
- it summarizes the live canonical invoice and payment chain instead of introducing a duplicate dashboard
- it routes users into the existing `Invoices`, `Payments`, and `Progress Billing` managers for the actual work

Current implemented visibility on Financials Home:
- overdue invoices needing follow-up
- recent recorded payments
- open receivables from canonical invoice balances
- purpose-defined quick links to the existing financial workspaces

Defined but not implemented yet:
- `Accounts Receivable` is reserved for deeper receivable management such as aging, collector workflow, and collection-specific queues
- `Accounts Payable` is reserved for payable-side workflow such as bills due, outgoing payments, and vendor obligation management
- these routes currently document intended purpose only and do not add a new data system

### Workforce And Field Execution Support

Implemented flow:
- workforce participants now live on shared canonical people records, with vendors modeling external labor companies and compliance records attaching to either subject type
- auditable time capture now flows through canonical time punch events and derived time cards
- daily execution now flows through canonical daily logs, field notes, and lightweight execution attachments
- project and job workspaces now surface linked labor and field-execution context through those same shared records

Current canonical records involved:
- person
- vendor
- compliance record
- time punch event
- time card
- daily log
- field note

Directory direction note:
- the current `/people` route remains workforce-oriented today
- a future contractor-facing `Directory` may surface workforce, customer-account, vendor, lead, and related-contact entries together at the view layer
- that future direction does not merge workforce `people`, canonical customer accounts, vendors, or leads into one table

## Recommended Contractor Revenue Path

The best current product direction for the contractor revenue workflow is:

1. Lead / Opportunity
2. Contact / customer qualification
3. Site assessment / inspection or customer-provided measurements and requirements
4. Customer
5. Project
6. Future takeoff / scope intelligence where plans, photos, and site data become reviewed quantities
7. Estimate
8. Portal estimate approval and approved snapshot creation
9. Contract
10. Change order when scope changes
11. Job execution / scheduling
12. Invoice
13. Payment and closeout

How this should be interpreted today:
- some of these steps already map cleanly to canonical records in the app
- some are operational stages that still need stronger UX guidance, status handling, or readiness logic
- the system should preserve one continuous path rather than forcing users to decide between disconnected modules

## Intended Workflow Direction

The intended near-term direction is not to invent a new business model. It is to tighten the already-implemented chain so the app behaves more like one guided contractor journey.

### Preferred UX Direction

The preferred contractor journey is:

`Opportunity -> Customer -> Project -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment`

With supporting readiness stages between those records:
- qualification
- site assessment or requirements gathering
- future takeoff and cost item mapping before estimate authoring
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
- customers are canonical customer/account records, not generic contact cards
- estimates define proposed commercial scope
- customer estimate approval is portal-based and writes to the same canonical estimate record
- estimate approval creates an immutable commercial snapshot and does not auto-run contract, SOV, invoice, or payment actions
- Cost Items Database is the reusable item master module behind estimate authoring, systems, and optional inventory
- future catalog/cost item design should treat default markup as internal cost behavior that can be overridden on an estimate and kept out of customer-facing output
- approved estimate snapshots feed downstream contract generation, SOV provisioning, and direct estimate-based invoice lineage
- change orders append approved scope changes through immutable change-order snapshots rather than mutating prior approved scope
- contracts now carry the live customer-facing signature workflow on the same canonical contract record across contractor and portal surfaces
- jobs represent execution
- workforce time and field execution now support the same project-centered operating chain through shared people, vendor, time-card, and daily-log records
- invoices and payments complete the financial path, with invoice rows sourced from approved estimate snapshot items, SOV items, approved change-order snapshot items, or invoice-only adjustments
- notifications and communications now have stored canonical foundations rather than shell-only placeholder behavior
- Financials is now starting to read as one sectioned system:
  - `/financials` is the cross-project control panel
  - `/invoices` remains the billing-record manager
  - `/payments` remains the collections and posted-payment manager
  - `/financials/accounts-receivable` and `/financials/accounts-payable` are present only as structure/spec placeholders in this pass
- `/people` remains the current workforce-oriented route, while a future `Directory` workspace is intended to unify contractor-facing account and contact browsing without changing the canonical data model underneath

That means FloorConnector is already operating on one shared business chain, even though some screens still expose the workflow in a more module-driven way than the intended product direction.
