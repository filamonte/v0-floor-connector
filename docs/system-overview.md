# FloorConnector System Overview

Status: Active
Doc Type: Operational

This is a synthesis overview of the currently implemented system and the next logical layers ahead.

This document is designed to do three jobs at once:

- explain FloorConnector clearly to non-technical readers, including investors and advisors
- align product and engineering teams around what the system actually is today
- prevent documentation drift by restating the core architectural rules in one place

This document is a synthesis, not the implementation source of truth. When exact implementation status matters, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Section 1 -- Product Overview

FloorConnector is one operating system for specialty flooring contractors, especially epoxy flooring, concrete polishing, and related surface-work businesses. It connects public acquisition, sales, contracts, billing, payments, workforce tracking, and field execution into one continuous workflow instead of forcing teams to manage the same job across disconnected tools.

It is built for contractor organizations that need one system to carry work from commercial intake through customer approval, billing, payment, workforce tracking, and field execution.

Why this is different is simple: most contractor software splits the same project across separate systems. Websites, forms, campaigns, and attribution live in one place. Leads live in another. Proposals in another. Contracts and signatures in another. Invoices and payments in another. Field execution and labor records somewhere else. Customers often experience the same project through PDFs, email threads, and isolated portals that are not connected back to the operating system.

FloorConnector is designed to replace that fragmentation with one shared system. The public acquisition layer feeds the same opportunity graph. The contractor creates the work once. The system holds the truth. The customer interacts with that same work through the portal. The system updates in place. The contractor continues from the updated truth instead of reconciling copies, sync gaps, marketing databases, website records, portal copies, or module-specific records.

That is the core product idea: one connected contractor workflow, not a collection of separate software modules. The target public-acquisition continuity is:

`public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`

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
- use explicit shared save-state behavior, inline estimate-title editing, and persisted status progression in the estimate workspace
- use Estimates as the UI/workflow reference pattern for proposal-first workspaces, with shared header rhythm, next-action guidance, workflow summary, context rail, connected records, and internal follow-through carried into project, contract, invoice, and job workspaces
- review first-pass immutable revision snapshots on estimates, invoices, contracts, and change orders without cloning those business records
- switch estimates, invoices, and leads between `My Work` and `Company` operational perspectives where safe ownership or assignment cues exist
- move approved commercial scope into downstream contract, job, and invoice workflows

In practical terms, the commercial path is already live. Contractors can start with lead intake, move into project and estimate work, and carry that scope forward without recreating records in each stage.

### Contract Signature Workflow

What users can do now:

- generate canonical contracts from approved estimate and project context
- edit contracts while they are still in draft
- require internal approval before send when configured
- send contracts through the canonical signature workflow
- let customers review, sign, or decline from the portal
- capture onsite customer signatures from the contractor app on eligible sent contracts
- support optional contractor countersign
- review signer routing and immutable signature history on the same contract chain

The important point is that portal signing and contractor-side onsite signing are two interaction surfaces on the same canonical signature system. FloorConnector does not create a separate signed-contract system.

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
- use the Project Workspace command-center summary and connected-record lanes to see customer context, blockers, estimate/contract/change-order/billing/job/field/access signals, and links to the focused record workspaces without duplicating those modules
- use estimate, contract, invoice, and job detail pages as connected workspaces
- configure workflow guidance intensity separately from AI assistance intent, with Project Workspace respecting next-best-action and readiness-guidance visibility while server-side readiness gates remain unchanged
- rely on server-side readiness enforcement before scheduling and execution workflows proceed
- manage organization-level settings and admin foundations
- export core tenant-scoped business records from `/settings/export` as CSV or JSON manifests for data portability, with sensitive tokens, provider payloads, payment secrets, and auth material excluded; export history stores metadata only and never stores downloaded file contents
- run a validation-only customer/contact CSV import dry run from `/settings/export`, with column mapping, required-field checks, tenant-scoped duplicate signals, and no canonical record writes or stored upload
- save dry-run results into tenant-scoped import review batches and open `/settings/export/imports/[batchId]` for read-only row review; import batches store normalized preview/audit metadata only and still do not create or change canonical records
- use the import write-safety plan as the boundary for future customer/contact import writes: editable row decisions, explicit owner/admin approval, create/link-only first phase, dedicated import audit completion evidence, and created-only rollback before mutation
- use super-admin configuration foundations at the platform layer

The contractor app is no longer just a data shell. It supports connected operating workflows across commercial, billing, and execution contexts.

Shared estimate attachments and related documents now live in one tenant-safe `documents` storage bucket using organization-first paths rather than module-specific buckets.

Good-enough document delivery is implemented as customer-facing print/save views on the shared records. Contractor routes `/estimates/:id/pdf`, `/contracts/:id/pdf`, and `/invoices/:id/pdf`, plus portal-scoped equivalents, render canonical estimate, contract, and invoice data for browser print/save. Portal print views use safe contractor organization branding after portal record access has already been scoped. These views are not a separate document model, do not store new PDFs as source-of-truth records, and do not mutate payment or signature state.

### Customer Portal

What customers can do now:

- access only the projects explicitly shared with their customer-contact portal grant
- use a real portal shell and portal home workspace
- open project-centered portal workspaces
- review shared estimates
- review and act on shared contracts
- review shared invoices
- initiate payment and see payment-state continuity

The portal is not a duplicate product with duplicate records. It is a customer-facing surface on top of the same canonical records used by the contractor app. Supabase Auth proves the portal user's identity, while FloorConnector portal grants and project access records authorize what that customer contact can see.

The current enterprise UX consolidation map is documented in [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md): People owns contact/access administration through a focused portal access console, Customer Workspace owns customer account summary, Project Workspace owns operational state and project-specific visibility, Estimate/Contract/Invoice Workspaces own their immediate business review, and Portal keeps customer-facing screens simple and action-oriented.

The right-rail consolidation pass keeps contractor record workspaces from becoming two full pages side by side: primary context stays visible, while extra linked records, metadata, revision history, manual payment entry, invoice editing, and lower-frequency activity are collapsed or linked.

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

The current `/schedule` surface is good-enough for early scheduling work: it summarizes unscheduled, today, upcoming, in-progress, and blocked/not-ready work; separates a Ready work queue from a Scheduled timeline; and opens a selected job action panel for schedule/reschedule context and crew assignment. It remains backed by canonical jobs and job assignments rather than a separate dispatch model.

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

The implemented revision layer reinforces that rule. Revision snapshots are immutable evidence attached to the active canonical estimate, invoice, contract, or change order. They provide timeline visibility and future compare/restore hooks, but they are not cloned records and they do not replace specialized approval, signature, payment, or commercial snapshot evidence.

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
- onsite signature events can mark the customer signer signed and complete the contract when all required signers are complete
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
- proceeds toward scheduling readiness after signature according to organization workflow settings, including any configured deposit requirement
- continues into execution and downstream work using the same project chain

That is the practical value of the system:

`contractor creates -> system holds -> customer acts -> system updates -> contractor continues`

### Contractor Flow

The implemented contractor-side lifecycle can be summarized as:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

In practical terms:

- a contractor starts with opportunity or lead intake
- the system creates or links the canonical customer and project
- the first customer person captured during intake is created or linked as the primary customer contact on the canonical customer account when sufficient person detail exists
- estimating happens on that shared project chain
- approved scope feeds the canonical contract
- signature happens on that same contract
- billing happens on canonical invoices tied to the same project and estimate context
- payment lands on canonical payments tied to those invoices
- execution continues through jobs, daily logs, field notes, time cards, and related records on the same project chain

The Phase 1 Golden Workflow Demo Path makes this loop testable through current routes: `/dashboard`, `/leads`, `/customers`, `/projects`, `/estimates`, `/contracts`, `/invoices`, `/payments`, `/jobs`, `/schedule`, and `/daily-logs`, with detail workspaces opened where fixture data exists. The demo path is documented in [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md) and should be treated as route-by-route QA over the existing canonical workflow, not a separate demo environment.

### Customer Flow

The implemented customer-side chain can be summarized as:

`portal -> project -> contract -> sign -> invoice -> pay`

One simple visual summary of the shared customer-facing operating chain is:

`Opportunity -> Customer -> Project -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment`

In practical terms:

- the customer enters through project-scoped portal access
- contact-centered portal invites can be delivered by branded provider email when configuration and activation guard allow it, with app invite copy-link fallback when delivery is locked or unavailable
- app-managed invite links guide unauthenticated contacts into Supabase-backed signup, sign-in, or password reset, then return to invite acceptance so the grant activates only after the invited email is authenticated
- portal-only customer auth returns do not bootstrap a contractor company membership; the portal account remains authorized by explicit portal grants and project access
- the portal shows only the projects explicitly shared with that customer
- project sharing is explicit per customer contact, so contacts under the same repeat/commercial customer account may see different project sets
- People/Directory is the management home for customer contacts and portal access; Project Workspace can show project-specific contact visibility without becoming the global identity-management surface
- customer account email/phone fields remain compatibility and commercial fallback fields; portal identity and project visibility should flow through canonical customer contacts
- temporary portal credentials are a support-only owner/admin fallback backed by server-side Supabase Auth Admin APIs; the raw password is shown once, never stored in FloorConnector tables, and must be changed before portal continuation
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
- incidents
- tasks

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

### Operational Core And Public Edge

The target architecture should distinguish the operational core from the public edge without splitting the product into two systems.

Operational Core:

- auth, organization membership, tenant isolation, permissions, and admin controls
- canonical workflows, records, readiness gates, contracts, payments, scheduling, communications, and AI orchestration
- server-validated actions that move `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Public Edge Layer:

- contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, and media delivery
- campaign/source attribution, public intake, future public AI interactions, and review/reputation/project-proof experiences
- edge caching, CDN/media delivery, and publishing mechanics where they help public traffic scale independently from protected operational workflows

The public edge should scale for website traffic and acquisition needs, while the operational core remains the source of truth for workflow state, money, permissions, and customer commitments. Public website visits, forms, chat, attribution, AI intake, reviews, galleries, and generated content should feed or read from the canonical graph through controlled boundaries. They should not become a second CRM, a second project system, a disconnected website database, or a separate AI knowledge silo.

### Signatures Extend Canonical Contracts

Signature workflow extends the contract through:

- canonical status and timestamp fields on contracts
- supporting contract signer records
- immutable contract signature events

Portal signing and contractor-side onsite signing both act on those same records. Onsite canvas signatures are stored as signature-event payload metadata, not as a separate signed-document model.

### Payments Extend Canonical Invoices And Payments

Payment workflow extends the billing chain through:

- canonical invoices
- canonical payments
- immutable payment events
- gateway/session metadata on canonical payments

There is no separate checkout-payment model and no separate portal billing model.

## Section 5 -- What Is Not Built Yet

The right way to describe the current product is not "unfinished in general." The operating backbone is implemented: the shared commercial, contract, billing, payment, portal, workforce, and field-execution chain is real. The remaining items below are intentionally not yet built or are only partially implemented as later-depth layers.

Early-access operations are controlled rather than public self-serve. Founder onboarding uses the real company/setup path, no-charge SetupIntent billing setup where configured, a test-mode-only FloorConnector SaaS subscription Checkout Session bridge where explicitly configured, signed SaaS-only Stripe webhook reconciliation for `billing_domain=floorconnector_saas`, manual platform-admin activation, and `/super-admin/early-access` operating buckets for pending setup, pending activation, active founder access, and suspended/blocked tenants. The same surface records platform-admin-entered founder billing evidence on `companies` for plan label, expected amount, collection method, external reference, evidence timestamp, follow-up timestamp, and notes, while displaying stored Stripe customer/subscription references separately. These buckets, evidence fields, test-mode checkout references, and webhook-reconciled subscription status references are derived from or attached to existing company/subscription records and do not create live charges, entitlements, automatic activation, contractor-customer invoice payments, or a second tenant model.

### Not Built Yet

These are still later layers:

#### Communications

- broader send/reply workflows beyond the current safe contractor reply composer
- provider-backed customer messaging and delivery
- job, daily-log, field-note, and broader source coverage beyond the currently supported canonical thread filters
- richer notification and conversation workflows

#### Scheduling And Dispatch

- full dispatch-grade scheduling workflows beyond the current good-enough `/schedule` command center
- drag-and-drop rescheduling, route optimization, and deeper crew-calendar coordination
- broader crew assignment automation beyond the current canonical `job_assignments` review/assignment foundation
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

- broader reporting beyond the current read-only `/reports` basics and Sales Tax Summary
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

2. Scheduling and dispatch depth

- dispatch-grade scheduling workflows beyond the current planner/board foundation
- deeper crew coordination on canonical jobs and `job_assignments`
- route optimization, drag-and-drop rescheduling, and operational automation

3. Materials, reusable catalogs, and richer shared document tooling

- deepen reusable operational content on the same canonical system

4. External integrations

- deeper e-sign provider integration
- deeper payment-provider and reconciliation tooling
- deeper stored PDF/version management, provider delivery, and document-management workflows beyond current canonical print/save views and the contract send snapshot foundation
- tax and accounting adapters

5. Broader portal and communication expansion

- richer customer-facing workflows
- communication layers on top of the same shared records

6. Public acquisition and growth layer

- contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign/source attribution, and generated marketing content
- website-generated opportunities feeding the canonical commercial path instead of a separate lead database
- review, reputation, testimonial, before/after gallery, and project-proof loops tied back to canonical customer/project/job/closeout evidence where appropriate

7. AI-assisted operating layers

- contractor-facing AI copilot, communication drafting, scheduling suggestions, project summaries, collections assistance, and action approval queues on top of canonical records
- FloorConnector-facing AI for marketing Q&A, demo support, onboarding/setup guidance, support triage, first-workflow activation, and migration/import help
- contractor-facing public AI for website chat, intake qualification, service/location content support, AI receptionist/voice, and operational intelligence only after consent, provider, handoff, schedule, permission, and workflow safety rules are designed

This is a sequence of next layers, not speculation about a different product direction.

## Section 6A -- Future AI, Communications, And Scheduling Layers

This section is target direction only. It does not claim AI chat, AI receptionist, broad AI execution, full unified inbox, or external calendar sync is implemented.

AI should become an operating layer around the current core, not a parallel system. It can draft, suggest, summarize, classify, prepare, and orchestrate work, but accepted actions must route through canonical FloorConnector records and approved server-side workflows.

Future communications should extend the current communication foundations into website forms, website AI chat, SMS, email, calls, voicemail, missed-call text-back, AI receptionist, portal messages, app messages, and manual logs. Website and campaign context should resolve into canonical opportunities and source attribution instead of a separate marketing contact database. FloorConnector communication records remain the business source of truth; providers deliver or enrich messages.

Future scheduling should extend the current `/schedule`, job, appointment, and job-assignment foundations into company calendars, user calendars, crew/resource calendars, PTO/holidays, equipment reservations, external busy-block import, conflict detection, and AI schedule suggestions. FloorConnector owns the canonical schedule; Google Calendar and Outlook/Microsoft 365 are adapters.

Future AI must preserve:

- the canonical lifecycle: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- tenant isolation and permissions
- readiness gates and validated server-side actions
- human confirmation for risky customer-facing, commercial, legal, billing, scheduling, permission, or compliance actions

Planning docs:

- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md)
- [docs/ai-marketing-and-onboarding.md](C:/FloorConnector/docs/ai-marketing-and-onboarding.md)

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
- adding public websites, marketing attribution, scheduling, messaging, or reporting as disconnected modules instead of extensions of the shared opportunity/project/revenue chain
- creating a separate marketing contact database, website lead store, portal-only customer copy, or AI-only knowledge silo
- describing target capabilities as if they are already fully implemented

### The Discipline Going Forward

The operating rule should remain:

- one canonical shared data model
- one connected workflow chain
- one system with multiple surfaces
- no duplicate business records per module

Future features should extend the canonical record chain rather than introduce parallel models. That means:

- no portal copies
- no website/public-acquisition copies
- no second signed-contract model
- no separate checkout-payment model
- no disconnected field-execution silo

That discipline is what keeps FloorConnector credible both as a product and as an implementation strategy.

## Section 8 -- HR And Safety Direction

This section is foundation/target framing, not a claim that a complete HR system is implemented. Use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for the exact current people, vendor, compliance, time, daily-log, field-note, and reporting foundations.

Future HR and safety depth should extend canonical people and project records with:

- Employee profiles: employment type, role/trade, pay type, certifications via compliance_records, PTO/sick tracking, onboarding status.

- OSHA / Safety: Introduces incident entity attached to project/job/person, representing OSHA Form 301-level detail. Not all incidents are OSHA-recordable; system supports internal tracking of all incidents. Incidents include classification fields to determine recordability: recordable vs non-recordable, days away from work, restricted duty, medical treatment beyond first aid, loss of consciousness, near miss (no injury, potential hazard). Internal severity levels (low, medium, high, critical) are separate from OSHA recordability and used for prioritization and risk tracking. Incidents support OSHA recordkeeping timing: recordable injury/illness entered within 7 calendar days, fatality reporting flag within 8 hours, hospitalization, amputation, or eye loss reporting flag within 24 hours. Incident creation from time clock punch-out (required entry point), project pages, mobile workflows, daily logs. Incident records support company/location/project/job/person context for multi-establishment and jobsite reporting needs. OSHA reports (301 incident detail, 300 log, 300A annual summary) are generated from incident data, not stored as separate canonical forms; reports include ONLY recordable incidents, while non-recordable incidents and near misses are stored but excluded from OSHA logs. /reports is the reporting home for OSHA 300/300A/301 exports.

- Safety Dashboard: Visualization and work queue only, not a data owner. Visualizes incidents (including near misses), severity (low, medium, high, critical), trends, compliance gaps from incidents, compliance_records, projects, people.

## Section 9 -- Future Service Layer

The service layer is target direction. Future service-layer capabilities should provide read-only enrichment over canonical data:

- AI: Estimates, forecasting, takeoffs.

- Call Intelligence: Conversations to opportunities.

- Takeoffs: Measurement to estimate input.

- Marketplace: Supplier/distributor integration.

- Marketing Automation: Campaign/source attribution, generated content, public intake enrichment, and follow-up suggestions over canonical opportunities and customers, not a separate marketing database.

- Benchmarking / Forecasting.

These systems read from canonical data without owning or duplicating records.

## Section 10 -- Mobile-First Field Workflow Direction

Current field foundations should continue moving toward mobile-first UX. Future depth should support:

- Time tracking

- Incident capture

- Photos / attachments

- Tasks

- Daily logs

- Safety checklists
