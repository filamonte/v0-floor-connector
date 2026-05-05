# FloorConnector Workflows

This document defines the canonical business workflows in FloorConnector as they exist today, and clarifies the intended near-term workflow direction for the contractor app.

It is an operational workflow document, not a technical architecture document.

Cross-references:
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): primary development entry point and guardrails
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): system design
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): next-phase build order
- [docs/inventory-cost-architecture.md](C:/FloorConnector/docs/inventory-cost-architecture.md): inventory, cost-item, and tax model
- [docs/site-visit-scope-intake-plan.md](C:/FloorConnector/docs/site-visit-scope-intake-plan.md): Scope Intake planning guardrails between site visit and estimate planning

This workflow document assumes the supporting configuration model now has two layers:
- super admin defines platform defaults and starter records
- contractor organizations adopt or override within their own tenant-owned settings

## Workflow Principles

- no duplicate data entry across stages
- project-centered operational continuity
- records flow forward rather than being recreated
- status progression should guide next actions
- shared files, selected finishes/specs, communication history, and delivery proof should attach to canonical records instead of creating module silos

In practical terms:
- a lead should not become a second disconnected customer-like record later
- an approved estimate should feed downstream contract, job, and invoice workflows instead of being re-entered
- downstream financial records should always inherit from immutable approved snapshots rather than live Estimate Editoror rows
- canonical records should stay linked so teams can follow the same job from intake through payment
- the app should guide users toward the next best action instead of presenting every downstream action as equally primary
- future visualizer/product/finish selections may start before lead intake, but once used operationally they should become canonical selected-system/spec context instead of disposable session-only data
- a future contractor-facing `Directory` may unify how contact-like records are browsed and managed, but it must remain a view over canonical records rather than a replacement business model

## Canonical Workflow Chain

The current canonical business lifecycle is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Authentication, organization bootstrap, dashboard entry, site assessment, Scope Intake, financial readiness, and scheduling readiness are supporting access or workflow stages around that lifecycle. They should guide the same records forward rather than creating duplicate records or module-specific silos.

This chain is already real in the current system, even though the user experience is still distributed across multiple module pages instead of being fully project-centered.

Future pre-lead visual/product/finish selection can extend the front of this lifecycle, but it does not replace the canonical implemented chain. The intended future path is visual/product/finish selection context -> opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment, with the selected finish/spec context flowing forward once it becomes operational truth.

## Canonical Records Vs Supporting Workflow Stages

Canonical system records:
- organization
- membership
- opportunity
- customer
- project
- estimate
- contract
- change order
- job
- invoice
- payment
- task
- incident

Supporting workflow stages:
- contact and qualification work
- future pre-lead visual/product/finish selection
- site assessment or inspection
- Scope Intake for structured measurements, observations, requested finish, current conditions, files, logistics, and notes
- customer-provided measurements, photos, and requirements
- future project-scoped takeoff and scope intelligence
- future selected system/spec review
- future shared file/evidence linking
- future delivery proof and communication tracking
- future activity timeline review
- estimate review and approval
- contract send / signature readiness
- deposit or financial readiness checks
- scheduling readiness
- closeout

The key distinction is:
- canonical records are durable business entities stored in the shared system model
- supporting workflow stages are operational checkpoints that move canonical records forward

Estimating terminology:
- Measurements are manual inputs such as length x width, direct square footage, direct linear footage, and counts.
- Takeoff means plan, PDF, or drawing-based measurement.
- AI Capture is a future photo, app, or AI-derived measurement input method.
- Catalog items are the implemented reusable cost item database on `catalog_items`; they define reusable pricing, cost, production, markup, and tax behavior as the foundation evolves.
- Floor system template tables now provide a schema foundation for future reusable estimating systems made from catalog/cost items, formulas, grouping rules, optional components, and required inputs.
- Estimates are customer-facing commercial scope and price.

Boundary rule: Takeoff and measurements produce quantities. Catalog items / cost items define reusable cost, pricing, production, markup, and tax behavior. Future System Template workflows should map quantities to grouped estimate content. Estimates define customer-facing pricing and commercial scope.

Future Templates & Systems administration:
- document templates, System Templates, add-ons/options, and sharing/review settings should eventually live in a dedicated contractor settings/admin area rather than being scattered across estimates, invoices, contracts, and other modules
- document templates should include estimate, invoice, contract, proposal/SOW, and future work order templates
- contractors should have defaults, be able to switch templates per estimate/invoice/contract where the workflow supports it, and be able to create or edit local copies
- super admin may seed platform defaults, but those defaults should be copied into contractor-owned templates instead of live-mutating contractor records
- System Templates should cover reusable floor system bundles such as epoxy flake, urethane cement, polishing, garage, and commercial systems
- add-ons/options should be optional scope modifiers backed by catalog/cost items; examples include integrated cove base, vinyl cove base, control joints, crack repair, coating removal, coal tar epoxy, moisture mitigation, extra topcoat, prevailing wage labor adjustment, and mobilization/setup
- add-ons may be square-foot, linear-foot, count/each, project/flat-price, or later labor/multiplier based
- cove base is a hybrid: not a full floor system by itself, but a catalog item plus optional System Template/add-on component that can be generated from perimeter or entered directly
- customer-facing estimate, invoice, and contract display should default to a clean grouped view while allowing detailed line-item and SOW-plus-price views; custom display templates are a later direction
- internal cost, markup, margin, private notes, and production math should stay internal unless intentionally configured as customer-facing language

Future Visual/Product/Finish Selection:
- a room visualizer or finish selector may start before lead intake
- supported future finish families include decorative flake, metallic epoxy, decorative quartz, solid color, and future surface systems
- manufacturer/product metadata should support Torginol-style vendor, product line, product code, product images, spec sheets, and technical notes without creating a vendor-specific commitment
- selected finish/spec context should become canonical selected-system/spec records later, not fake session-only business truth

Future System Specification / Finish System:
- finish systems are not loose estimate line-item descriptions
- they represent what is actually sold and installed
- selected system/spec context should flow into estimate, contract, job, portal, closeout, and warranty context
- once approved or once contract/signature activity begins, selected systems/specs should be snapshotted or locked like financial/document truth
- later changes should move through revision or change-order style workflows rather than silent edits

Future Shared Files / Evidence:
- product images, room photos, visualizer renders, spec sheets, signed documents, field photos, markups, and closeout evidence should live in a shared file/evidence layer
- files should be linkable to multiple canonical records such as project, opportunity, estimate, contract, job, invoice, payment, change order, daily log, field note, selected system/spec, and finish product
- existing execution attachments remain the current implementation, but the future direction is a shared file/evidence layer rather than module-specific attachment silos

Future Communication / Delivery Proof:
- communication history should cover email, SMS, portal, app, and manual logs where supported
- sending estimates, invoices, contracts, change orders, portal invites, and payment requests should create canonical communication/delivery records
- delivery events should include queued, sent, delivered, opened, clicked, deferred, bounced, blocked, dropped, and failed when provider data supports those states
- provider data is delivery telemetry, not the business source of truth
- FloorConnector should store immutable delivery events tied back to canonical records
- open and click tracking are useful signals, not perfect legal certainty

Future Activity Timeline:
- project, customer, and record timelines should summarize important canonical events across the lifecycle
- timeline entries should be readable memory over canonical records, not replacement source-of-truth rows
- examples include finish selected, estimate sent/viewed/approved, contract sent/signed, invoice sent/paid, payment completed, file uploaded, message received, job scheduled, daily log finalized, and closeout evidence captured

## Financial Workflow Rules

### Billing Trigger Rule

An invoice may only be created when a valid billing trigger exists:
- contract is signed (deposit allowed)
- deposit is required by workflow
- job or work is completed or billable
- approved change order introduces billable scope

Invoices must not be created before contract signature unless explicitly part of a deposit-readiness workflow.

### Invoice Role Clarification

Existing invoice roles clarify billing behavior only; do not introduce new enums for this.

`deposit`:
- used for readiness and pre-execution billing
- tied to contract or financial readiness, not execution

`standard`:
- used for executed or billable work
- tied to job completion or approved scope

### Scope Vs Billing Rule

Approved scope does not automatically equal billable scope.

- estimates define proposed scope
- contracts define committed scope
- invoices define billable scope

Only executed or explicitly billable portions of scope should be invoiced.

### Invoice Source Rule

Every invoice must trace back to real scope:
- project (required)
- and at least one of:
  - job
  - estimate items
  - change order
  - deposit requirement

Invoices must not be freeform or disconnected from canonical records.

### Balance Truth Rule

- invoices are the source of truth for money owed
- payments are the source of truth for money collected

No parallel balance systems should exist on:
- project
- estimate
- contract

All financial reporting must derive from invoices and payments.

### Change Order Billing Rule

Approved change orders extend the same billing chain.

They may:
- add line items to an existing invoice
- or be included in a future invoice

They must not create a separate billing system.

### Readiness Vs Billing Rule

Operational readiness and billing readiness are related but distinct:
- readiness determines whether work or billing can proceed
- billing must still follow valid billing triggers

Examples:
- contract signed -> deposit allowed
- deposit paid -> scheduling allowed
- job complete -> standard invoice allowed

## Project Readiness Gate

Project readiness is a hard server-side gate, not guidance.

Readiness derives from:
- contract status
- financial readiness, including deposit or financing requirements where configured
- organization workflow settings

Project readiness is required before:
- job creation
- scheduling
- job updates that move work into scheduled or execution states
- execution workflows, including daily logs, field notes, execution attachments, punchlist items, and project-attributed time punches

All enforcement happens at the server boundary through the centralized project readiness gate. Module-specific flows must not bypass or reinterpret readiness independently.

When the existing readiness snapshot is clear after contract signature, contractor-facing detail pages may guide the user into the next operational steps:
- create the canonical project job
- schedule that job through the shared schedule surface

This is a Sign -> Schedule -> Execute UI handoff only. It must continue to use the centralized readiness gate and canonical `jobs` scheduling fields rather than introducing a contract-specific scheduling model. When the handoff starts from signed contract or project readiness context and an approved estimate is available, job Quick-Create should preserve that estimate lineage on the canonical job. When exactly one unscheduled canonical job already exists for the project, the `/schedule` handoff may carry `jobId` and `action=schedule` so the existing schedule action panel opens in that job context.

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
- the lead workspace includes lightweight site visit Scope Intake capture for manual measurements and structured observations
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
- contractor admins manage customer contact identity, portal invite state, and project-scoped portal visibility from People after a customer and project exist
- estimate, contract, and invoice workflows may trigger or verify portal access contextually, but they do not own portal identity or permissions management
- invited customers use `/portal/invite?token=...` to sign up or log in, and the invite activates only when the authenticated email matches the contractor-created invite

Current canonical records involved:
- customer
- project
- portal access grant
- portal project access
- optional related customer contact

Current customer-account interpretation:
- the customer is the full canonical customer/account record, not a lightweight contact card
- additional customer contacts sit beneath that account and are managed from People for identity, relationship, and portal access administration, but the account remains the commercial and financial source of truth
- normal portal onboarding is contractor-initiated from the shared customer/project workflow; customers do not self-register first unless a later customer-led quote/intake surface explicitly supports that path

### Project To Estimate

Implemented flow:
- estimates are created from project context
- estimate authoring is cost-item-first:
  - new estimate line items are catalog-first; user-facing manual freeform estimate row creation is disabled
  - `Create new item` saves an organization-scoped `catalog_items` record inline from the Estimate Editoror and then inserts it into the current estimate through the existing catalog insertion flow
  - active non-system `catalog_items` can be added from the Estimate Editoror Catalog Items panel
  - inserted catalog items become editable commercial `estimate_line_items` snapshots rather than live-bound catalog rows
  - catalog-backed estimate item names are clickable for editing from the Estimate Editoror
  - editing from the estimate updates the reusable `catalog_items` row and refreshes only the current estimate line snapshot
  - other estimates that already snapshotted the same catalog item do not silently update
  - approved estimate snapshot editing is blocked
  - archived catalog items remain visible for review where surfaced but are blocked from insertion
  - reusable systems expand through shared system logic from length x width or direct area plus linear footage
- system-generated estimate items still use catalog/system component sources and become canonical estimate line-item snapshots
- `finish_products`, `floor_system_templates`, and `floor_system_template_components` now have a first contractor-side admin/data access layer in `/settings/system-layers`
- `selected_floor_systems` now exists as a tenant-owned schema foundation for chosen or proposed finish/service systems linked to real workflow records
- System Layers remains foundation-only for workflow purposes: it does not yet change active estimate authoring, estimate generation, contract generation, invoice behavior, selected-system server actions/UI, files, activity, or approved snapshot lineage
- selected systems are not public/pre-auth records; no `visualizer_sessions` table or public visualizer handoff exists yet
- `catalog_items` are the canonical reusable sellable cost item database; physical stock now belongs in `inventory_items`
- inventory remains optional per organization and never blocks cost item selection in estimates
- item-level tax stays simple:
  - customer tax exemption overrides everything
  - non-taxable cost items produce zero tax
  - otherwise organization or platform financial defaults determine the rate
- estimate line items, totals, tax, and discount handling are live
- `estimate_line_items` is the authoritative pricing-row source; legacy `estimates.content.itemRows` should not be used for new behavior
- Estimate Editoror edits autosave with validation and stale-write conflict protection
- estimate defaults apply only when the estimate content is initially empty, resolving platform defaults first and contractor overrides second
- estimates move through status progression such as `draft`, `sent`, `approved`, and `rejected`
- this catalog-first estimate authoring behavior does not change schema, downstream invoice behavior, contract behavior, SOV behavior, payment behavior, or approved commercial snapshot lineage

Current canonical records involved:
- project
- customer context derived through project
- estimate
- estimate line items
- catalog items
- catalog system components

Future workflow guidance:
- the intended pre-estimate lead path is `Lead -> Site Visit Appointment -> Scope Intake -> Estimate Plan -> Estimate`
- a future pre-lead visual/product/finish path may precede opportunity creation, but operational use should attach selected finish/spec context to the canonical chain rather than creating a separate visualizer workflow
- Scope Intake should remain a reviewed pre-estimate support stage, not a direct intake-to-invoice or intake-to-customer-price workflow
- Takeoff & Scope Intelligence may become a supporting pre-estimate workflow stage between opportunity/site assessment and estimate authoring
- future inputs may include Measurements, Takeoff, AI Capture, customer-provided plans/photos, contractor site data, requirements, and uploaded plan or image files
- manual measurement-driven estimating should support length x width, direct floor area, direct linear footage, counts, and optional room/zone detail before full takeoff exists and after full takeoff exists
- example measurement formulas include L x W for floor square footage and `(L x 2) + (W x 2)` for perimeter linear footage
- integrated cove base and vinyl cove base are measured in linear feet and may be generated from perimeter or entered directly
- takeoff should stay project-scoped and feed estimate creation through reviewed quantities mapped to System Templates and reusable catalog/cost items
- Takeoff and measurements produce quantities. Catalog/cost items define reusable cost, pricing, production, markup, and tax behavior. Future System Template workflows should map quantities to grouped estimate content. Estimates define customer-facing pricing and commercial scope.
- takeoff is not a replacement for estimates; the canonical estimate remains the commercial scope record and the customer-facing pricing proposal
- the intended future estimate-input flow still feeds the canonical lifecycle: `Opportunity -> Customer -> Project -> Site Info / Measurements / Plans / Photos -> Measurement, Takeoff, or AI Capture -> System Template -> Catalog/Cost Item Mapping -> Grouped Estimate Line Items -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment`
- conceptual future objects may include `takeoffs`, `takeoff_documents`, `takeoff_measurements`, `takeoff_scope_items`, and `takeoff_estimate_links`, but these are not existing tables and should not be treated as implemented schema
- raw takeoff measurements should not own pricing; pricing belongs in catalog/cost items and estimate line items
- generated estimate line items should retain future source linkage back to the approved takeoff scope item, the takeoff measurement, and the source document or photo when applicable
- if a takeoff changes after estimate line items have been generated, the future takeoff-estimate link or estimate should be flagged as out of sync until a user reviews it
- Quick Build should let a contractor select a System Template, enter minimal measurements, and generate grouped estimate lines for review
- Detailed Build should support multiple rooms/zones, options, conditions, waste factors, optional components, overrides, and review before generation
- AI-assisted measurements, area suggestions, system suggestions, scope suggestions, estimate drafts, and cost-item mapping suggestions must remain reviewable and explicitly contractor-approved before they become customer-facing estimate content
- takeoff quantities may eventually inform material requirements, labor estimation, production readiness, and job planning, but there should be no direct takeoff-to-invoice flow
- selected system/spec context should flow into the estimate as reviewed sold-scope context, then into contract, job, portal, closeout, and warranty context without becoming a loose line-item description

Customer-account guardrail for downstream commercial flows:
- estimate send recipient continuity remains on canonical customer/account context with an explicit portal-ready contact selection when existing project access data supports it
- invoice recipient, contract customer context, payment/billing context, and project ownership should continue to use canonical customer/account context, with People remaining the management home for contact identity and access

Implemented approval rules:
- customer-facing estimate approval happens through the portal on the same canonical estimate record
- contractor-side Estimate Review can also record a supported manual/offline approval or rejection decision from draft or sent estimates through the shared estimate status-transition action for cases such as paper signature, verbal customer approval, fake email during testing, non-portal customers, or workflow testing before send-mail and portal delivery are complete
- approval does not execute downstream financial actions automatically
- approval creates an immutable commercial snapshot used for downstream contract, SOV, and invoice lineage

Supporting audit and delivery records involved:
- estimate customer events

Future delivery proof:
- estimate sends should eventually create canonical communication/delivery records with immutable delivery events where provider data supports them
- opened and clicked events should support follow-up decisions, not serve as perfect legal certainty

### Approved Estimate To Contract

Implemented flow:
- approved estimates can generate canonical contracts
- contract generation reads from approved estimate snapshot data only
- contract Quick-Create opens from `/contracts?compose=1`; if contract generation redirects back with an `error` query value, that blocker is displayed inside the composer near the approved estimate selection
- contracts use the shared template foundation
- draft contracts may be lightly edited
- unrestricted editing locks once signature activity begins
- contractor-side send-for-signature and optional countersign workflow now run on the same canonical contract record
- portal customers can now review, sign, and decline the same canonical contract through tenant-safe portal access
- contractor-side onsite signing is implemented for in-person close workflows: when a sent or viewed contract has an eligible unsigned customer signer, the contractor can capture the customer signature on the contractor device
- portal signing and contractor-side onsite signing both update the same canonical `contracts`, `contract_signers`, and `contract_signature_events` records
- onsite signature capture stores canvas/base64 PNG metadata in the canonical signature event payload, marks the customer signer signed, and only completes the contract when all required signers, including any contractor countersigner, are complete
- after signature completion, project commercial-readiness sync runs; deposit invoice/payment follow-through is required only when organization workflow settings require deposit readiness, and it stays on the canonical invoice/payment chain

Current canonical records involved:
- estimate
- contract
- contract signers
- contract signature events
- shared template reference
- project and customer context carried forward

Future selected-system/spec context:
- contract review should inherit selected finish/system/spec context from approved estimate truth
- once contract/signature activity begins, selected systems/specs should be locked or snapshotted
- changes after that point should be handled through revision or change-order style workflows

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
- signed-contract and project-readiness handoffs preserve approved estimate context when creating the canonical job where that lineage is available
- job creation, scheduling, and job updates into scheduled or execution states are blocked unless the project passes the centralized server-side readiness gate
- once contract signature and readiness blockers clear, project detail and signed contract detail can show the direct handoff into job creation and project-filtered scheduling on the existing job chain, including a focused scheduling action panel when a single unscheduled job can be resolved

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
- general-purpose invoice insertion from live `catalog_items` is not implemented or allowed
- limited catalog-backed invoice usage exists only as invoice-only adjustments / manual catalog-backed rows, where the catalog item provides starting snapshot values and cannot bypass approved estimate, SOV, or approved change-order billing lineage

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
- contractor-side Invoice Workspace and Project Workspace now surface payment continuity and next-step guidance from the same canonical invoice and payment state

Current canonical records involved:
- invoice
- payment
- payment events

Future payment-request delivery proof:
- payment requests should create canonical communication/delivery records with immutable events when sent through provider-backed or manual channels
- provider statuses such as queued, sent, delivered, opened, clicked, bounced, blocked, dropped, and failed should remain telemetry tied back to the canonical invoice/payment chain

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

Future communication direction:
- communication and delivery proof should extend across estimates, contracts, invoices, change orders, payment requests, portal invites, customer/contractor messages, app interactions, SMS, email, and manual logs
- delivery attempts/events should be immutable and tied back to canonical records
- provider delivery data enriches FloorConnector records but should not become the business source of truth

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
- daily logs, field notes, execution attachments, punchlist items, and project-attributed time punches require project readiness at the server boundary
- Project Workspace and Job Workspace now surface linked labor and field-execution context through those same shared records

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

1. Future pre-lead visual/product/finish selection where applicable
2. Lead / Opportunity
3. Contact / customer qualification
4. Site assessment / inspection or customer-provided measurements and requirements
5. Customer
6. Project
7. Future takeoff / scope intelligence where plans, photos, and site data become reviewed quantities
8. Estimate
9. Portal estimate approval and approved snapshot creation
10. Contract
11. Change order when scope changes
12. Job execution / scheduling
13. Invoice
14. Payment and closeout

How this should be interpreted today:
- some of these steps already map cleanly to canonical records in the app
- some are operational stages that still need stronger UX guidance or status handling around the implemented readiness gate
- the system should preserve one continuous path rather than forcing users to decide between disconnected modules
- pre-lead visual/product/finish selection is future direction only and does not change the implemented canonical chain

### Employee Lifecycle Workflow

- Onboarding: Create person, assign role, certifications, PTO setup.

- Management: Update profiles, track PTO, certifications.

- Safety: Incident reporting, compliance.

### Subcontractor Onboarding Workflow

- Invite: Create vendor/person, send invite.

- Document upload: Insurance, compliance.

- Validation: Compliance checks.

### Incident Workflow

- Capture: Required from time clock punch-out (entry point), project page, mobile workflows, daily logs. System supports tracking of all incidents, not just OSHA-recordable ones.

- Record: Attach to company/location/project/job/person for multi-establishment and jobsite reporting. Include classification fields: recordable vs non-recordable, days away from work, restricted duty, medical treatment beyond first aid, loss of consciousness, near miss (no injury, potential hazard). Internal severity levels (low, medium, high, critical) are separate from OSHA recordability and used for prioritization and risk tracking. Support OSHA recordkeeping timing: recordable injury/illness within 7 calendar days, fatality flag within 8 hours, hospitalization/amputation/eye loss flag within 24 hours.

- Reporting: Generate OSHA 301 (incident detail), 300 (log), 300A (annual summary) from incident data. OSHA 300/300A include ONLY recordable incidents; non-recordable incidents and near misses are stored but excluded from OSHA logs. /reports is the home for OSHA 300/300A/301 exports.

### Task Lifecycle Workflow

- Create: Attach to any record, assign, due date.

- Track: Status, audit.

- Complete: Close.

### Progress Billing Workflow

- Setup: SOV with % complete.

- Update: Mark complete, billed.

- Generate: G702/G703.

## Intended Workflow Direction

The intended near-term direction is not to invent a new business model. It is to tighten the already-implemented chain so the app behaves more like one guided contractor journey.

### Preferred UX Direction

The preferred contractor journey is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

With supporting readiness stages between those records:
- future pre-lead visual/product/finish selection
- qualification
- site assessment or requirements gathering
- future takeoff and cost item mapping before estimate authoring
- selected system/spec review and snapshot readiness
- approval
- signature readiness
- future delivery proof and communication tracking
- deposit or billing readiness
- scheduling readiness
- closeout

### Project As The Operational Hub

In data-model terms, FloorConnector already uses shared canonical records across modules.

In UX terms, the near-term direction is:
- `Project` should become the operational hub
- estimates, contracts, jobs, invoices, files, selected systems/specs, delivery proof, communication history, and activity should feel like connected parts of one project
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
- Cost Items Database is the reusable item master module backed by canonical `catalog_items`; it is the Phase 1 foundation for estimate authoring, systems, optional inventory, future invoice reuse, and materials planning
- estimate authoring is catalog-first: users either create a new catalog/cost item inline or add an existing active non-system catalog item, and both paths insert a current-estimate `estimate_line_items` snapshot through the catalog insertion flow
- catalog-backed estimate item names are clickable for editing; edits update the reusable catalog item and the current estimate line snapshot only, while other estimates that already snapshotted that item do not silently update
- approved estimate snapshot editing is blocked from the Estimate Editoror
- archived items are blocked from insertion, and systems continue through the existing system expansion flow using catalog/system component sources
- future catalog/cost item design should treat default cost, markup, labor, production, price, and tax behavior as internal cost behavior that can be overridden intentionally on an estimate and kept out of customer-facing output
- customer-facing estimates should show only customer-facing descriptions, quantities, unit prices, and totals; markup and internal cost should not appear on customer-facing estimate output
- one-off estimate-line price overrides should affect that estimate line, while catalog/cost item updates should affect future estimates only
- quick system generation now supports V1 manual measurements inside the existing Estimate Editoror:
  - length x width calculates floor area and perimeter
  - direct area and direct linear footage are accepted when the contractor already knows field quantities
  - area-based system components use sqft, perimeter-based components use LF, and count-based components use count
  - generated lines remain editable canonical estimate line items
- imported estimate lines should preserve their snapshot price, markup, and override behavior; new lines added from catalog should use current item defaults
- past estimates should not mutate when catalog defaults change
- the catalog-first estimate flow does not change schema, downstream invoice behavior, contract behavior, SOV behavior, payment behavior, or approved commercial snapshot lineage
- approved estimate snapshots feed downstream contract generation, SOV provisioning, and direct estimate-based invoice lineage
- change orders append approved scope changes through immutable change-order snapshots rather than mutating prior approved scope
- contracts now carry the live signature workflow on the same canonical contract record across portal and contractor app surfaces; contractor-side onsite capture supports in-person customer signing on the next eligible unsigned customer signer
- after contract signature, deposit follow-through is conditional on organization workflow settings: required deposits use the existing canonical `deposit` invoice/payment chain, while projects with no deposit requirement can proceed toward scheduling readiness after signature and readiness sync
- jobs represent execution
- workforce time and field execution now support the same project-centered operating chain through shared people, vendor, time-card, and daily-log records
- invoices and payments complete the financial path, with invoice rows sourced from approved estimate snapshot items, SOV items, approved change-order snapshot items, or invoice-only adjustments
- invoice catalog insertion is intentionally limited: invoice rows should continue to come from approved commercial lineage or explicit invoice-only adjustments, not free catalog selection as normal invoice scope
- invoice-only manual catalog-backed rows may use `catalog_items` as starting snapshots for explicit adjustments, but they remain invoice-only lineage and do not replace approved commercial billing sources
- notifications and communications now have stored canonical foundations rather than shell-only placeholder behavior
- Financials is now starting to read as one sectioned system:
  - Financials Home (`/financials`) is the cross-project control panel
  - Invoices Manager Page (`/invoices`) remains the billing-record manager
  - Payments Manager Page (`/payments`) remains the collections and posted-payment manager
  - `/financials/accounts-receivable` and `/financials/accounts-payable` are present only as structure/spec placeholders in this pass
- `/people` remains the current workforce-oriented route, while a future `Directory` workspace is intended to unify contractor-facing account and contact browsing without changing the canonical data model underneath

That means FloorConnector is already operating on one shared business chain, even though some screens still expose the workflow in a more module-driven way than the intended product direction.

## CONTEXT-AWARE CREATION RULE

All records must respect origin context:

### Project Context
- Created downstream records are automatically linked to the project and derived customer

### Customer Context
- Customer pre-filled
- Project must be selected or created

### Global Context
- Requires explicit selection of both customer and project

This applies to:
- Contracts
- Estimates
- Invoices
- Jobs

This is required to maintain data integrity and workflow continuity
