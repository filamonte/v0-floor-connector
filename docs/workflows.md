# FloorConnector Workflows

Status: Active
Doc Type: Operational

This document defines the canonical business workflows in FloorConnector as they exist today, and clarifies the intended near-term workflow direction for the contractor app.

It is an operational workflow document, not a technical architecture document.

Cross-references:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): primary development entry point and guardrails
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): system design
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity sequencing
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
- public acquisition, contractor websites, forms, attribution, portals, communications, and future AI intake should feed the same canonical workflow graph instead of creating marketing, website, portal, or AI silos

In practical terms:

- a lead should not become a second disconnected customer-like record later
- a website form, public AI chat, landing page conversion, campaign source, review/reputation signal, or gallery/project-proof interaction should not become a disconnected marketing record later
- an approved estimate should feed downstream contract, job, and invoice workflows instead of being re-entered
- downstream financial records should always inherit from immutable approved snapshots rather than live Estimate Editor rows
- canonical records should stay linked so teams can follow the same job from intake through payment
- record-level revision snapshots should attach to canonical records instead of cloning estimates, invoices, contracts, or change orders
- the app should guide users toward the next best action instead of presenting every downstream action as equally primary
- Project Workspace is now the clearest operating hub in the implemented app:
  ProjectPulse, FieldTrail, MessageCenter, CloseoutTrail, and Proof Center are
  visibility layers over the same canonical project chain, not separate
  subsystems or duplicate business records.
- CrewBoard is the current scheduling visibility/action surface on `/schedule`;
  it uses canonical jobs, appointments, assignments, people, vendors, projects,
  and customers rather than schedule-local records.
- Reports is the current company-level operations/collections visibility
  surface on `/reports`; it summarizes source records and routes users back to
  Project Workspace, CrewBoard, Invoice Workspace, and Contract Workspace.
- future visualizer/product/finish selections may start before lead intake, but once used operationally they should become canonical selected-system/spec context instead of disposable session-only data
- a future contractor-facing `Directory` may unify how contact-like records are browsed and managed, but it must remain a view over canonical records rather than a replacement business model

## Canonical Workflow Chain

The current canonical business lifecycle is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Authentication, organization bootstrap, dashboard entry, site assessment, Scope Intake, financial readiness, and scheduling readiness are supporting access or workflow stages around that lifecycle. They should guide the same records forward rather than creating duplicate records or module-specific silos.

This chain is already real in the current system, even though the user experience is still distributed across multiple module pages instead of being fully project-centered.

Future pre-lead visual/product/finish selection can extend the front of this lifecycle, but it does not replace the canonical implemented chain. The intended future path is visual/product/finish selection context -> opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment, with the selected finish/spec context flowing forward once it becomes operational truth.

Future public acquisition can also extend the front of this lifecycle. The intended broader direction is:

`public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`

Contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, website AI intake, campaign/source attribution, reviews/testimonials, before/after galleries, portals, communications, and operational workflows should all reinforce that same graph. They are not separate systems and should not introduce duplicate lead, customer, contact, project, website, portal, marketing, or AI knowledge models.

Future Agentic Operations Layer note: AI may eventually participate in workflow
stages as an observer, recommender, drafter, or approved action participant. AI
must act through canonical transitions, readiness gates, permissions, and audit
controls. It must never skip project readiness, contract signature, invoice or
payment controls, tenant isolation, or event/audit requirements. AI suggestions
and approved AI-prepared actions should be treated as workflow participants, not
as separate workflows. See [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).

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

- future public acquisition through contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign attribution, and website AI intake
- contact and qualification work
- future pre-lead visual/product/finish selection
- site assessment or inspection
- Scope Intake for structured measurements, observations, requested finish, current conditions, files, logistics, and notes
- customer-provided measurements, photos, and requirements
- future project-scoped takeoff and scope intelligence
- future selected system/spec review
- future shared file/evidence linking
- implemented first delivery-proof and communication visibility through Send
  Trail, MessageCenter, Signature Trail, Payment Trail, and Customer Access
  context over existing records
- implemented first project-level activity visibility through FieldTrail,
  MessageCenter, CloseoutTrail, Proof Center, and ProjectPulse; broader
  full-record activity timelines remain future depth
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

Implemented good-enough document delivery:

- contractor estimate, contract, and invoice workspaces expose customer-facing `Print / save PDF` actions
- portal estimate, contract, and invoice review pages expose customer-safe `Print / save PDF` actions
- these routes render the existing canonical estimate, contract, and invoice data for browser print/save; portal print views use safe contractor organization branding after portal access is scoped; they do not create a second document source of truth, portal-only copies, financial mutations, signature mutations, payment mutations, or stored PDF versioning
- the existing sent-contract PDF snapshot foundation remains separate workflow evidence for contract send behavior; the print/save views are current renderings of canonical records

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
- public website forms, website AI chat, campaign inquiries, reviews/reputation follow-up, and public intake should resolve into canonical communication and opportunity workflows where communication history is needed
- sending estimates, invoices, contracts, change orders, portal invites, and payment requests should create canonical communication/delivery records
- delivery events should include queued, sent, delivered, opened, clicked, deferred, bounced, blocked, dropped, and failed when provider data supports those states
- provider data is delivery telemetry, not the business source of truth
- FloorConnector should store immutable delivery events tied back to canonical records
- open and click tracking are useful signals, not perfect legal certainty

Implemented communication and delivery visibility:

- Project Workspace MessageCenter summarizes existing project communication
  threads/messages, document delivery events, signature events, payment events,
  and Customer Access context.
- Estimate, Contract, and Invoice Workspaces expose existing document delivery
  evidence as Send Trail.
- Project Workspace Proof Center references Send Trail, Signature Trail,
  Payment Trail, Customer Access, field evidence, and source records as a
  project proof index.
- These layers are read-only visibility over current records. They do not add
  provider retry workflow, automated reminders, new message/delivery tables,
  portal-only copies, AI summaries, or customer-facing field sharing.

Future Activity Timeline:

- project, customer, and record timelines should summarize important canonical events across the lifecycle
- timeline entries should be readable memory over canonical records, not replacement source-of-truth rows
- examples include finish selected, estimate sent/viewed/approved, contract sent/signed, invoice sent/paid, payment completed, file uploaded, message received, job scheduled, daily log finalized, and closeout evidence captured

Implemented Revision Timeline:

- `record_revisions` now provides first-pass immutable snapshots for estimates, invoices, contracts, and change orders
- supported record workspaces show a secondary revision timeline with revision number, current marker, kind, reason, timestamp, actor id when available, and compact snapshot summary
- revisions are attached to the active canonical record and are not downstream business records
- compare, restore, branching, merging, and rollback are intentionally deferred
- approved-estimate commercial snapshots, change-order commercial snapshots, contract signature events, payment events, and notification events remain their specialized workflow evidence

Implemented Perspective Views:

- estimates, invoices, and leads support first-pass `My Work` / `Company` perspectives through `?view=my` and `?view=company`
- company view keeps the existing organization-scoped queue behavior
- personal view uses only safe existing ownership or assignment cues: estimate/invoice creator, updater, sender where available, and lead appointment assignment through linked people membership
- perspective filters do not introduce permissions, saved views, AI prioritization, or separate record models

## Financial Workflow Rules

## Import / Export Workflow

Implemented export-first foundation:

- Contractor organization owners/admins can open `/settings/export` and download tenant-scoped module exports for customers, customer contacts, projects, estimates, estimate line items, invoices, invoice line items, payments, jobs, and job assignments.
- Exports are read-only views over canonical FloorConnector records. They do not create snapshots, alternate data models, reporting tables, backup records, import records, or workflow mutations.
- CSV exports are intended for contractor-readable tabular review. JSON manifests include tenant metadata, export timestamp, schema version, field definitions, relationship notes, row count, and rows.
- Export scope comes from the authenticated active organization membership and explicit `company_id` filters. Portal customers, unauthenticated users, contractor members without owner/admin permissions, and platform-only billing data are not part of tenant export access.
- Payment exports preserve canonical invoice/payment relationships but exclude card/bank details, gateway references, raw provider payloads, webhook data, Checkout URLs, Stripe secrets, and payment secrets.
- Export history records metadata only in `data_export_events`: who requested the export, tenant, module, format, status, approximate row count, schema version, filename, and a safe failure summary if needed. It does not store exported rows, files, raw SQL, provider payloads, tokens, or payment details.
- Portal access export is not implemented yet. Future portal access exports may include safe grant/project-access metadata only, never invite tokens, token hashes, raw invite links, sessions, temporary passwords, or auth secrets.
- Customer/contact import now starts with a validation-only CSV dry run on `/settings/export`. The dry run parses uploaded CSV text for the request, suggests column mappings, validates required customer/contact fields, performs tenant-scoped duplicate checks against existing customers/customer contacts, and shows row-level results without storing the file or writing canonical records.
- Successful dry runs can be saved as tenant-scoped import review batches in `data_import_batches` / `data_import_rows`. The review shell at `/settings/export/imports/[batchId]` shows normalized preview rows, validation status, duplicate notes, proposed decisions, and disabled future-approval messaging only.
- Import remains no-mutation. Future write-import work still requires executable row-decision editing, audit completion evidence, rollback/undo plan, duplicate-resolution choices, backups, scoped permissions, and explicit approval before any canonical record writes.
- The planned first write-import workflow should build on the saved import batches, allow only create-new-customer, create-new-contact-under-existing-customer, and link-existing-contact-to-customer decisions at first, and keep update/merge behavior deferred until field-level diffs and rollback rules are approved.
- Import approval must state that it will not create portal access, auth users, emails, invoices, payments, estimates, jobs, contracts, change orders, opportunities, or projects.

This workflow preserves the canonical lifecycle and exists to support data portability without weakening tenant isolation or creating detached data truth.

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

This is a Sign -> Schedule -> Execute UI handoff only. It must continue to use the centralized readiness gate and canonical `jobs` scheduling fields rather than introducing a contract-specific scheduling model. When the handoff starts from signed contract or project readiness context and an approved estimate is available, job Quick-Create should preserve that estimate lineage on the canonical job. When exactly one unscheduled canonical job already exists for the project, the `/schedule` handoff may carry `jobId` and `action=schedule` so the existing schedule action panel opens in that job context. `/schedule` is the cross-project scheduling receiver: it shows the command-center summary, Ready work queue, Scheduled timeline, and selected job action panel over canonical jobs/job assignments, not a schedule-only record set.

## Configurable Workflow Guidance

FloorConnector now stores organization-owned guidance preferences on the existing `organization_workflow_settings` row. These preferences tune how much coaching the contractor app shows; they do not change the canonical lifecycle, tenant isolation, readiness enforcement, financial rules, signature history, portal access, or payment truth.

Implemented guidance modes:

- Guided: default mode with next-best-action and readiness guidance visible.
- Flexible: guidance remains available but can be made less forceful.
- Manual: next-best-action prompts can be reduced for teams that want less hand-holding.

Workflow guidance and AI assistance are separate settings groups. Disabling guidance does not enable AI, and enabling AI-assistance intent flags does not permit autonomous actions. Any future AI-prepared customer-facing, commercial, legal, billing, scheduling, permission, or compliance action must still require human confirmation and must route through canonical server-side workflows.

Project Workspace is the first high-value surface wired to these preferences: next-best-action and readiness guidance panels can be shown or reduced according to organization settings, while the underlying readiness gate still runs through the centralized server-side project readiness helpers. The command-center summary and connected-record lanes stay factual and visible as project state/context even when coaching panels are reduced.

One-off/direct invoice shortcuts are still planned only. A future shortcut may allow a contractor to start a simple invoice path, but it must still create or use canonical customer and project context and write canonical invoice/payment records. There is no disconnected invoice model and no active direct-invoice shortcut in this phase.

## Current Implemented Workflows

The current app already supports the following live workflows:

### Auth And Org Entry

Implemented flow:

- user signs in with Google or email/password
- first access bootstraps profile, organization, and owner membership when needed
- public early-access CTAs can send users to `/signup?next=/setup/company`
- `/setup/company` updates the existing organization/company record and primary location record; it does not create a separate registration model
- company setup stores the organization-owned legal/display name, logo URL/reference, contact details, website, primary trade/service type, brand accent color, and time zone on `companies`; primary address remains on the existing primary `locations` row
- logo upload remains deferred; setup accepts only a hosted logo URL or storage reference
- `/setup/billing` is a billing setup shell with two separated lanes: no-charge Stripe Elements/SetupIntent payment-method setup, and a FloorConnector SaaS subscription Checkout Session launcher that is available only with matching Stripe test-mode keys plus `STRIPE_FOUNDER_PLAN_PRICE_ID`
- SetupIntent payment-method setup stores Stripe customer and payment-method references on the existing organization row, does not store raw card data, and does not create subscriptions or charges
- SaaS subscription checkout requires contractor owner/admin access, uses `billing_domain=floorconnector_saas` metadata, returns to `/setup/billing`, and does not activate the tenant or touch contractor-customer invoice/payment/portal checkout records
- if Stripe is not configured or card collection fails, `/setup/billing` keeps the user moving to pending activation with clear billing-later copy instead of trapping them on setup
- `/setup/pending-activation` shows the existing tenant status/lifecycle state and lets early-access users enter the real contractor app with guardrails
- user lands in the protected contractor app and can sample the real system through canonical records
- pending/trial organizations may create and review real internal canonical records, but the shared activation guard blocks irreversible external production actions until the organization is activated
- `/super-admin/early-access` is the platform-admin operating view for controlled founder tenants. It groups companies into pending setup, pending activation, active founder access, and suspended/blocked buckets from existing company/profile/billing-reference state, shows SetupIntent payment-method references as billing setup evidence only, displays stored Stripe SaaS customer/subscription/status references separately, and keeps activation manual.
- non-production QA can use `/dashboard?fresh=true` to force the existing Start Here onboarding prompts visible without creating fake records or changing tenant data
- non-production platform admins can reset a selected early-access tenant from `/super-admin/early-access`; this is a development-only utility over existing company and workflow records, not a sandbox/demo mode
- `/super-admin` access is not inherited from contractor organization ownership or administration. It requires an explicit platform role assignment in `platform_user_roles`; contractor owner/admin/member test accounts remain contractor-scoped unless separately granted a platform role.
- `/super-admin/groups` includes contractor group assignment proposal readiness for platform operators. Proposal rows display readiness labels, explanations, reason codes, evidence, caveats, manual-apply impact, and starter-pack targeting context, and a server-readiness utility can recompute one organization/group proposal from current server data for manual-apply eligibility and blocker reporting. Eligible proposed rows expose a single-row expandable manual assignment form that requires an operator reason, exact `ASSIGN GROUP MANUALLY` confirmation, and complete submitted proposal context for stale-detection before invoking the audited proposal apply server action. The server action remains the source of truth: it requires platform-admin access, server-side recomputation, high/medium confidence, ready-for-review status, active non-future contractor group status/type, and no existing membership before calling the existing audited metadata RPC for exactly one membership/audit write; already-assigned recomputation returns a no-duplicate readback. The assignment audit metadata stores safe proposal-review evidence, including a scalar proposal fingerprint, and live QA has verified one deliberate proposal apply, one membership row, one assignment audit row, metadata persistence, no repeat eligible form after assignment, membership cleanup, and unchanged template/catalog/provisioning counts. There is no bulk apply, no Apply all, no auto assign, no proposal dismissal/approval state, no starter-pack provisioning, no entitlement/pricing/permission behavior, and no contractor runtime effect.
- `/super-admin/packages` provides read-only Package / Billing Plan Governance observability for platform admins. The flow is inspection only: the page loads existing company lifecycle/status, company subscription, linked subscription-plan, saved billing-reference, and safe Stripe configuration-presence signals; shows Package / Billing Overview, Contractor Plan State, Billing Setup Readiness, Early-Access / Activation Status, Not Yet Governed / Future Package Controls, a planning-only Future Package Definition Model, a persisted Package Definition Catalog backed by `platform_package_definitions` and `platform_package_definition_versions`, a read-only Contractor Package Assignments section backed by `contractor_package_assignments` and `contractor_package_assignment_audit_events`, and a read-only Billing / Provider Mapping Readiness section backed by `contractor_package_billing_mappings` and `contractor_package_billing_mapping_audit_events`; and keeps missing-plan, billing-readiness, missing-definition, missing-version, missing-assignment, missing-package-reference, missing-provider-mapping, mismatch, and missing-audit-evidence caveats user-safe. The persisted package-definition tables are platform-owned catalog/read-model infrastructure only: they can store stable package keys, display labels, lifecycle/status, intended audience/segment summaries, version numbers/labels, safe JSON intent snapshots, and publication/deprecation/archive timestamps. The persisted contractor assignment tables are platform-owned assignment-inspection infrastructure only: they can store company/package/version references, planned assignment lifecycle/timing state, safe assignment/billing/entitlement/starter-pack snapshot summaries, supersession/cancellation context, and assignment audit evidence, but they are not activation workflows, billing subscriptions, entitlement grants, module permissions, contractor groups, starter-pack provisioning actions, or runtime resolvers. The persisted provider mapping tables are platform-owned reconciliation-inspection infrastructure only: they can store internal assignment/company/package references, provider/environment reference labels, billing/reconciliation states, safe expected/observed/mapping JSON summaries, mismatch summaries, verification timestamps, and provider mapping audit evidence, but they are not Stripe calls, provider sync, subscription operations, billing execution, entitlement grants, module gates, package assignment writes, or runtime resolvers. The static planning model remains read-only/planning-only and separates package definitions, billing plans, plan tiers, module visibility, usage limits, entitlements, feature flags, provider mapping, trial/early-access status, grandfathered/custom contracts, contractor groups, and starter-pack assignments before any package lifecycle/change workflow exists. The page has no forms, no page-scoped mutation buttons or inputs, no package create/edit/publish/archive controls, no package assignment create/approve/schedule/activate/cancel controls, no package/plan-change, billing update, subscription create/update/cancel, Stripe sync, provider API, payment collection, entitlement, module-gating, pricing/package enforcement, activation-toggle, or contractor-permission controls. Future package mutation workflows, assignment activation workflows, billing/subscription operations, provider mutation, entitlement/module enforcement, module gating, and runtime behavior remain future design work and are not implied by the current read-only page.
- `/super-admin/packages/[packageDefinitionId]` provides read-only inspection for one persisted platform package definition, its versions, audit evidence, and lifecycle readiness for future transition controls. The flow is inspection only: it loads the selected package definition, matching version rows, and matching `platform_package_definition_audit_events`; summarizes definition metadata, version lifecycle/status counts, audit event-type counts, future transition readiness, no-version, no-published-version, missing-audit-evidence, intent-only dependency, and unavailable-state caveats; and summarizes JSON intent/snapshot/metadata presence without raw database/provider dumps. Unknown ids render a safe unavailable state. The Lifecycle Readiness section evaluates future transition states such as `draft -> internal_review`, `internal_review -> draft`, `internal_review -> approved`, approved evidence to published, published to deprecated/superseded, deprecated to archived, draft to archived, and internal review to archived. Eligibility is explanatory only: every readiness output keeps action, mutation, billing, entitlement, runtime, and package-assignment effects false. The detail view has no forms, no package create/edit/approve/publish/deprecate/archive controls, no lifecycle or approval mutation controls, no package assignment behavior, no billing/Stripe/subscription behavior, no entitlement/module/runtime behavior, no contractor permission changes, no starter-pack provisioning changes, and no server action wired from the surface.
- `/super-admin/packages/assignments/[assignmentId]` provides read-only inspection for one persisted contractor package assignment and its audit evidence. The flow is inspection only: it loads the selected assignment, linked company/package/version labels when present, and matching `contractor_package_assignment_audit_events`; summarizes lifecycle/status, effective/scheduled/activated/canceled/superseded/archive timing, supersession and cancellation context, safe assignment/billing/entitlement-module/starter-pack snapshot presence, no-audit-evidence, missing-package/version, canceled/superseded/archived, and unavailable-state caveats. Unknown ids render a safe unavailable state. The detail view has no forms, no assignment create/approve/schedule/activate/cancel controls, no package assignment activation behavior, no package mutation controls, no billing/Stripe/subscription behavior, no entitlement/module/runtime behavior, no contractor permission changes, no reporting/export behavior, no automation/AI behavior, no starter-pack provisioning changes, and no server action wired from the surface.
- `/super-admin/packages/provider-mappings/[mappingId]` provides read-only inspection for one persisted package billing/provider mapping and its audit evidence. The flow is inspection only: it loads the selected mapping, linked assignment/company/package/version labels when present, and matching `contractor_package_billing_mapping_audit_events`; summarizes billing/reconciliation state, provider reference labels, expected/observed/mapping snapshot presence, mismatch caveats, no-audit-evidence, archived/unavailable-state caveats, and safe operator guidance. Unknown ids render a safe unavailable state. Provider references are inspection references only and are not business truth, payment-method storage, raw provider payloads, secrets, or billing execution instructions. The detail view has no forms, no Stripe/provider call controls, no subscription/billing execution controls, no package assignment mutation controls, no package lifecycle controls, no entitlement/module/runtime behavior, no contractor permission changes, no reporting/export behavior, no automation/AI behavior, no starter-pack provisioning changes, and no server action wired from the surface.
- `/super-admin/packages/support-reviews/[supportReviewId]` provides read-only inspection for one persisted billing/provider support review and its event evidence. The flow is inspection only: it loads the selected support review, linked provider mapping/assignment/company/package/version labels when present, and matching `contractor_package_billing_support_review_events`; summarizes review status/category/environment, provider-reference/reconciliation/webhook/operator/rollback evidence presence, blocked/escalation caveats, no-event-evidence, archived/unavailable-state caveats, and safe operator guidance. Unknown ids render a safe unavailable state. Support review rows on `/super-admin/packages` and provider mapping detail link to this detail route only when rows exist. No support-review records are seeded by the current workflow, so populated support-review detail QA remains blocked in empty environments until real rows exist. Support review evidence is inspection evidence only and is not corrective-action authority, provider truth, payment-method storage, raw provider payloads, secrets, or billing execution instructions. The detail view has no forms, no support-review mutation controls, no corrective-action execution controls, no Stripe/provider call controls, no subscription/billing execution controls, no package assignment mutation controls, no package lifecycle controls, no entitlement/module/runtime behavior, no contractor permission changes, no reporting/export behavior, no automation/AI behavior, no starter-pack provisioning changes, and no server action wired from the surface.
- `/super-admin/operations` provides read-only Platform Operations / System Health observability for platform admins. The flow is inspection only: the page loads existing platform health, workflow-error, starter-pack run/attempt, contractor group audit, membership, and assignment-intent signals; shows Platform Health Summary, Recent Operational Activity, Attention Needed, Audit Sources, and Not Yet Monitored / Future Operations; and keeps source-unavailable caveats user-safe. Operational summaries are sanitized and capped before display. The page has no forms, no page-scoped buttons or inputs, no remediation/retry/fix/resolve/archive/delete/provision/assign/entitlement/runtime/sync/backfill controls, and no server action wired from the surface. Future support operations, alerting, runbook, incident, remediation, retry, escalation, and system-health automation workflows remain future design work and are not implied by the current read-only page.

Future Package Lifecycle and Approval Workflow concept:

- Package-definition persistence, read-only catalog visibility, and read-only one-definition detail inspection now exist as platform-owned infrastructure, but package lifecycle mutation is not implemented. This remains a planning boundary for future package review, approval, publishing, versioning controls, assignment, billing, entitlement, and module work.
- Future package lifecycle states should be `draft`, `internal_review`, `approved`, `published`, `deprecated`, and `archived`.
- Future package review should validate package dimensions, billing/provider mapping, module availability, usage limits, starter-pack defaults, contractor group targeting, entitlement mapping, and Stripe/provider mapping before approval.
- Future publishing should require explicit platform-admin approval and should only publish approved package versions after schema/RLS, authorization, provider, entitlement, module, migration, browser, and regression QA gates pass.
- Future published package definitions should be immutable or snapshotted. Replacements should use new versions, deprecation, archive, grandfathering, custom-contract exceptions, and explicit migration paths rather than destructive edits.
- Future contractor package assignment should be a separate auditable workflow from package definition. Assignment must not be inferred from contractor groups, and a package assignment should not silently mutate billing, entitlements, modules, permissions, or runtime behavior.
- Future approval/audit evidence should capture actor, timestamp, before/after snapshot, reason, confirmation text, impacted package dimensions, provider mapping snapshot, entitlement/module mapping snapshot, and rollback/deprecation strategy.
- Future safety constraints: no runtime enforcement until entitlement modeling exists; no Stripe mutation until billing workflows exist; no contractor-facing package change until assignment workflows exist; no module gating until module entitlement mapping exists; no automatic package changes from contractor groups; and no AI or automation package changes.
- Future QA gates should include read-model tests, schema/RLS tests, platform-admin authorization tests, Stripe sandbox tests before live billing, entitlement no-op tests, migration/versioning tests, browser QA, and regression checks proving no unintended contractor changes.

Future Contractor Package Assignment Governance concept:

- Contractor package assignment persistence and read-only inspection now exist as a platform-owned schema/read-model foundation. The activation workflow is not implemented. The implemented foundation is an inspection boundary for a future audited link between a company/contractor and an approved/published package definition version.
- Package assignment is distinct from package definition, billing subscription, entitlement enforcement, module visibility/gating, contractor groups, and starter-pack provisioning.
- Future assignment lifecycle states should be `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived`.
- Future assignment workflow should select a contractor/company, select an approved or published package version, review current package/billing/entitlement context, review pricing/billing impact, review module/entitlement impact, review starter-pack/onboarding implications, require explicit platform-admin reason and confirmation, schedule an effective date when needed, activate only through a future audited action, and preserve assignment history.
- Future audit evidence should capture actor, timestamp, company id/name, previous package assignment snapshot, new package assignment snapshot, selected package version, reason, confirmation text, effective date, billing impact summary, entitlement/module impact summary, provider mapping snapshot, starter-pack/onboarding implication snapshot, and rollback/supersession strategy.
- Future package assignment must not silently create, update, or cancel Stripe subscriptions. Billing changes require a separate explicit billing workflow; provider subscription state must remain independently auditable.
- Future package assignment must not silently toggle runtime access. Entitlement and module gates require a separate implemented model and audit, and future enforcement may consume only explicit effective assignments after approval.
- Contractor groups may help propose package assignments, rollout cohorts, or migration segments in the future, but groups must not auto-change package assignment. Group-driven suggestions require manual review, stale-context checks, explicit platform-admin reason, and audit.
- Starter-pack implications remain onboarding/provisioning context only. Package assignment may suggest starter-pack defaults or onboarding review, but it must not auto-provision templates/catalogs, mutate tenant-owned records, or become billing/entitlement enforcement.
- Future change paths should cover package-to-package moves, grandfathered/custom contracts, trial-to-paid package changes, early-access-to-active package changes, upgrades, downgrades, cancellation/suspension, and deprecation of old package versions.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, no-service-role-browser-exposure tests, no unintended billing mutation tests, no unintended entitlement/module runtime mutation tests, Stripe sandbox tests before provider behavior, browser QA, audit evidence verification, and rollback/supersession tests.

Future Package Billing / Provider Mapping Governance concept:

- The first schema/read-model workflow is implemented as `contractor_package_billing_mappings`, `contractor_package_billing_mapping_audit_events`, platform-admin-only read helpers, and a read-only provider mapping/reconciliation section on `/super-admin/packages`. It remains an inspection boundary for future package billing/provider mapping, provider verification, provider reconciliation, and billing approval before any Stripe-backed subscription behavior exists.
- Package definitions remain product packaging; contractor package assignments remain platform governance; billing provider mapping connects approved commercial terms to provider artifacts; subscription state reflects provider/commercial state; entitlement/module enforcement remains a separate future runtime layer.
- Future mapping concepts should distinguish package definition, package version, contractor package assignment, billing plan, billing price, provider product, provider price, provider customer, subscription, subscription item, billing status, trial/early-access status, custom/grandfathered commercial contract, and payment-method/setup readiness.
- The implemented read-only provider mapping foundation constrains billing provider, provider environment, billing state, reconciliation state, safe JSON snapshot shape, mismatch summaries, archive evidence, and audit event types. Provider states visible today are inspection states only and do not execute provider behavior.
- Future package assignment should not silently create, update, or cancel provider subscriptions. Billing changes require a separate explicit platform-admin approval workflow, and provider mapping must be verified before any billing action.
- Future Stripe/provider behavior must stay server-side, use sandbox/test-mode gates before production, verify webhook signatures, use idempotency keys for provider mutations, avoid exposing secret keys or raw provider errors, and treat provider ids as carefully displayed references rather than product truth.
- Future reconciliation should compare expected provider state with observed provider state and identify mismatch/attention-needed, pending webhook, stale provider mapping, failed provider operation, and manual support review states. Automatic destructive correction should require explicit approval.
- Future audit evidence should capture actor, timestamp, package definition/version, contractor/company, assignment id where applicable, provider product/price/customer/subscription reference snapshots, billing impact summary, trial/discount/custom terms, approval reason, confirmation text, before/after provider mapping snapshot, reconciliation status, and rollback/deprecation strategy.
- Current provider mapping audit evidence is read-only and limited to safe event rows, reasons, before/after/metadata object summaries, timestamps, and linkage references. It does not add provider operations, webhook processing, retry behavior, support-review actions, release gates, report exports, or mutation controls.
- Contractor groups may suggest targeting or rollout cohorts but must not mutate billing. Starter packs/onboarding remain separate from billing and must not create provider subscriptions, provider products, provider prices, or billing-state changes.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, service-role/server-only tests, Stripe sandbox tests, provider idempotency tests, webhook signature tests, no unintended billing mutation tests, no entitlement/runtime mutation tests, browser QA, audit evidence verification, and reconciliation mismatch tests.

Future Package Entitlement / Module Boundary Governance concept:

- This workflow is not implemented. It is a planning boundary for future entitlements, module availability, module visibility, feature access, usage limits, entitlement overrides, exception handling, and audit before any runtime gate exists.
- Future concepts should distinguish entitlement, module availability, module visibility, feature access, usage limit, package definition entitlement mapping, contractor package assignment effective entitlements, override, trial/early-access exception, grandfathered/custom contract exception, support override/emergency override, and audit snapshot.
- Package definitions describe intended commercial packaging. Contractor package assignments link a contractor to a package version. Billing/provider state handles payment/subscription status. Entitlements determine runtime capability access only after a separately implemented model exists. Module visibility is UI exposure and does not replace server-side enforcement.
- Contractor groups remain segmentation/proposal inputs, not entitlement grants. Starter packs/onboarding remain provisioning defaults, not entitlement grants. User preferences remain personal defaults, not entitlement grants.
- Future entitlement lifecycle states should be `planned`, `reviewed`, `approved`, `active`, `suspended`, `deprecated`, `revoked`, and `archived`.
- Future module boundary lifecycle states should be `hidden`, `visible_preview`, `visible_enabled`, `enabled_limited`, `enabled_full`, `suspended`, and `deprecated`.
- Future enforcement boundaries: no runtime enforcement until an explicit entitlement model exists; no automatic entitlement changes from billing state alone; no automatic entitlement changes from contractor groups; no automatic entitlement changes from starter-pack assignment; no module gating until module-to-entitlement mapping exists; no contractor-facing permission change without explicit assignment/entitlement audit; and no AI or automation entitlement changes.
- Future audit evidence should include actor, timestamp, company id/name, package assignment id, entitlement key, module key, previous state, new state, reason, confirmation text, effective date, source of change, package version snapshot, billing/provider snapshot if relevant, override snapshot, and rollback/revoke strategy.
- Future override governance should be platform-admin-only, require explicit reason, use expiration/effective dates for temporary access, prevent hidden permanent overrides without review, audit emergency/support overrides, and never silently change billing or package assignment.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, no client service-role exposure, entitlement no-op tests before runtime rollout, module visibility regression tests, package assignment separation tests, billing/provider separation tests, contractor group separation tests, starter-pack separation tests, browser QA, audit evidence verification, and rollback/revoke tests.

Future Package Governance Audit and Evidence Model concept:

- This workflow is not implemented. It is a planning boundary for future audit events, evidence snapshots, approval metadata, safe support review, and package-governance traceability now that the first package-definition schema/read-only catalog foundation exists. There is still no package governance audit write model, UI mutation, billing, Stripe, subscription, entitlement, module, or runtime behavior.
- Future audit/evidence concepts should distinguish package governance audit event, package definition snapshot, package assignment snapshot, billing/provider mapping snapshot, entitlement/module mapping snapshot, operator reason, confirmation phrase, approval actor, approval timestamp, effective date, before/after snapshot, source system, external provider reference snapshot, reconciliation state, and rollback/deprecation/supersession plan.
- Future audit event families should include `package_definition_created`, `package_definition_reviewed`, `package_definition_approved`, `package_definition_published`, `package_definition_deprecated`, `package_definition_archived`, `package_assignment_drafted`, `package_assignment_approved`, `package_assignment_scheduled`, `package_assignment_activated`, `package_assignment_superseded`, `package_assignment_canceled`, `provider_mapping_created`, `provider_mapping_verified`, `provider_mapping_deprecated`, `entitlement_mapping_reviewed`, `entitlement_override_created`, `entitlement_override_expired`, and `billing_reconciliation_reviewed`.
- Future required evidence should vary by action type: package definition actions need package/version and lifecycle snapshots; package assignment actions need company, previous/new assignment, package version, effective date, and impact snapshots; billing/provider actions need provider reference and reconciliation snapshots; entitlement/module actions need intended runtime boundary snapshots; override actions need reason, duration, source, and revoke strategy; reconciliation actions need expected versus observed provider state and review outcome.
- Future immutability rules should preserve published package definition versions, assignment history, provider reference snapshots, entitlement/module boundary snapshots, operator reasons, confirmation text, and deprecation/supersession evidence. Void, rollback, deprecation, and supersession should not erase prior audit evidence.
- Future security requirements should keep package governance audit writes platform-admin-only, server-side only, RLS-protected, forced where public tables are used, and free of client service-role exposure. Raw provider errors, secrets, stack traces, and unsafe payloads should not be stored or displayed in audit metadata; provider ids are references, not secrets, but still need careful display.
- Future support/operator workflows should use the evidence model to explain why a contractor has a package, why a feature/module is or is not available, why billing differs from package expectation, whether provider state is reconciled, who approved a package/version/assignment, how grandfathered/custom contracts apply, and what rollback/deprecation path is available.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, no client service-role exposure tests, audit append-only tests, before/after snapshot tests, safe metadata tests, provider reference sanitization tests, no unintended billing mutation tests, no unintended entitlement/module runtime mutation tests, browser QA, audit evidence verification, and support/export readiness tests.
- This future audit/evidence workflow must not itself create packages, assign packages, mutate billing, call Stripe, create/update/cancel subscriptions, enforce entitlements, gate modules, change contractor permissions, provision starter packs, run automation, run AI behavior, or change runtime behavior.

Future Package Governance Reporting / Export Readiness concept:

- This workflow is not implemented. It is a planning boundary for future package governance reports, export shapes, support bundles, evidence packets, redaction, retention, and export auditability before any report route, UI export button, server action, file generation, schema, package mutation, billing, Stripe, subscription, entitlement, module, or runtime behavior exists.
- Future report concepts should include package inventory, package definition versions, contractor package assignments, billing/provider mappings, entitlement/module mappings, overrides, package audit trails, reconciliation/attention-needed queues, grandfathered/custom contracts, early-access/trial readiness, and support investigation bundles.
- Future export shapes should separate CSV summary exports, JSON audit bundles, PDF/operator support packets, internal support bundles, contractor-facing exports as separately scoped future work, and compliance/legal hold exports as separately scoped future work.
- Future report data boundaries should use package definitions and versions, assignment snapshots, billing/provider mapping snapshots, carefully displayed provider references, entitlement/module snapshots, override snapshots, audit events, approval/reason/confirmation metadata, and reconciliation status. They must exclude raw secrets, raw provider error payloads, service-role keys, and sensitive payment method data.
- Future operator workflows should use reports to explain package assignment, module access or absence, billing-versus-package mismatches, grandfathered/custom contracts, provider reconciliation, early-access/trial conversion readiness, package changes over time, and the evidence needed for an internal support investigation.
- Future export safety should be platform-admin-only and server-side only, require an explicit export reason, audit the export request, prevent client service-role exposure, apply redaction rules, bound export size, avoid raw provider errors/secrets and sensitive payment data, and use expiring download links if file storage is introduced later.
- Future retention/legal handling should preserve package governance audit evidence through deprecation, supersession, rollback, voiding, legal hold, and support investigation scenarios. Export readiness must not imply permission to mutate package, billing, entitlement, module, contractor permission, or runtime records.
- Future QA/security gates should include report read-model tests, export redaction tests, platform-admin authorization tests, no client service-role exposure tests, export audit event tests, file/link expiration tests if applicable, no unintended billing mutation tests, no unintended entitlement/module runtime mutation tests, browser QA, support bundle content tests, and large export guard tests.
- This future reporting/export readiness workflow must not itself create packages, assign packages, mutate billing, call Stripe, create/update/cancel subscriptions, enforce entitlements, gate modules, change contractor permissions, generate files, expose export links, run automation, run AI behavior, or change runtime behavior.

Package Governance Implementation Readiness sequencing:

- This sequencing is planning-only beyond the implemented package definition schema/read-only catalog/detail foundation, the implemented package definition audit evidence schema/read-only timeline foundation, the implemented pure lifecycle readiness/read-only transition inspection panel, the implemented contractor package assignment schema/read-model/detail foundation, the implemented assignment activation readiness inspection panel, and the implemented provider mapping schema/read-only reconciliation inspection foundation. It consolidates package lifecycle/approval, contractor assignment, billing/provider mapping, entitlement/module boundary, audit/evidence, and reporting/export plans before any package mutation, server action, RPC, billing call, Stripe call, subscription write, package assignment write, entitlement enforcement, module gate, runtime behavior, export behavior, contractor permission change, automation, AI behavior, or starter-pack provisioning change exists.
- The package definition schema/read-model slice, package definition audit-evidence/read-model slice, read-only lifecycle readiness slice, contractor package assignment schema/read-model/detail slices, assignment activation readiness slice, and provider mapping schema/read-only reconciliation slice are implemented. The recommended remaining order is provider mapping detail/assignment-detail integration or entitlement/module mapping read model before runtime enforcement, runtime enforcement last, and reporting/export only after audit evidence and redaction/export boundaries are separately scoped.
- Risk should be classified before each slice: docs and read-only read models are low risk; schema/RLS/audit/read-model foundations are medium risk; mutation actions are high risk; billing/provider mutation, Stripe subscription operations, runtime entitlement enforcement, module gating, pricing/package enforcement, contractor permission changes, and automated correction workflows are critical risk.
- Explicit blockers remain: no package mutation workflow, package assignment mutation workflow, entitlement runtime model, module gate mapping, Stripe subscription mutation workflow, provider operation/webhook/retry workflow, destructive reconciliation workflow, or contractor-facing package export/visibility model exists today. Package definition, assignment, and provider mapping audit evidence exists only as read-only evidence, not billing/provider mutation, entitlement/module mutation, reconciliation action, or export behavior.
- Every future implementation slice needs the relevant QA/security gates before release: schema/RLS tests, forced RLS and grant checks, platform-admin authorization tests, no client service-role exposure checks, security-definer execute grant checks when RPCs are added, browser QA, no unintended billing/subscription mutation tests, no unintended entitlement/module mutation tests, no unintended contractor permission changes, Stripe sandbox tests before provider mutation, webhook signature verification before trusting provider state, audit snapshot tests, and reporting/export redaction tests where applicable.

Package Definition Persistence Schema / Read-Model:

- This first schema/read-model workflow is implemented as platform package definition and package version persistence plus platform-admin-only read-only catalog output. It does not add lifecycle approval controls, contractor assignment, billing/provider mapping writes, Stripe calls, subscription operations, entitlement enforcement, module gates, reporting/export behavior, contractor permission changes, or runtime behavior.
- Package definition records represent product/business packaging only: package key, display name, intended audience/segment, status/lifecycle, and high-level package identity. A package definition is not a contractor package assignment, billing subscription, entitlement grant, module permission, contractor group, or starter-pack provisioning action.
- Package version records preserve version number/label, lifecycle/publication status, commercial summary, intended module visibility, usage limit, entitlement, billing/provider, starter-pack default, contractor group targeting, and published snapshots as safe JSON intent snapshots. Deprecated and archived states preserve history instead of erasing it.
- The implemented first slice is limited to `platform_package_definitions`, `platform_package_definition_versions`, shared/platform-admin types, platform-admin-only server read helpers, a pure `buildPlatformPackageDefinitionCatalog(...)` read model, focused tests, and read-only `/super-admin/packages` catalog output. Audit events, normalized intent mapping tables, approval controls, assignment tables, provider mapping tables, entitlement tables, runtime gates, and exports remain deferred.
- The read model exposes definition lists, version lists, lifecycle/publication state, summary counts, missing-version caveats, safe JSON intent snapshot presence, empty states, and read-only operator summaries.
- Schema/security posture: RLS is enabled and forced on both public tables; broad `public`, `anon`, and `authenticated` grants are revoked; server reads use the platform-admin/server boundary; JSON snapshot fields must be objects when present; package keys are normalized; version numbers/labels are unique per definition; and records must not contain raw provider/billing secrets, raw provider errors, sensitive payment method data, service-role keys, tenant-owned mutable state, or raw provider payloads.
- Package definition reads/writes in this slice do not change tenant-owned records, starter-pack provisioning records, contractor groups, subscriptions, entitlements, module availability, contractor permissions, reporting/export behavior, automation, AI behavior, or runtime behavior.

Package Definition Audit Evidence Schema / Read-Model:

- This schema/read-model workflow is implemented as one conservative `platform_package_definition_audit_events` table plus platform-admin-only read-only audit timeline output on the package definition detail route. It does not add package definition writes, package version writes, approval/publish controls, contractor assignment, billing/provider mapping writes, Stripe calls, subscription operations, entitlement enforcement, module gates, reporting/export behavior, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior.
- Package definition audit events preserve package definition id, optional version id, constrained event type, optional actor, reason, confirmation text, before snapshot, after snapshot, metadata, occurred-at, and created-at evidence. Package-version event types require a version reference.
- Snapshot and metadata fields must be JSON objects when present and must not store secrets, raw provider errors, stack traces, service-role keys, provider secret keys, sensitive payment method data, or tenant-owned mutable payloads. Deprecation, archive, correction, and supersession should add evidence instead of erasing earlier creation, review, approval, or publication evidence.
- The implemented read model `buildPlatformPackageDefinitionAuditTimeline(...)` exposes event ordering, event-type counts, missing-evidence caveats, safe snapshot/metadata key summaries, read-only operator guidance, and explicit no-behavior flags. It summarizes top-level JSON keys instead of dumping raw values.
- Schema/security posture: RLS is enabled and forced on the public audit table; broad `public`, `anon`, and `authenticated` grants are revoked; server reads use the platform-admin/server boundary; no browser write path, security-definer RPC, client service-role exposure, package mutation action, or package lifecycle action was added.

Future Package Definition Lifecycle Controls / Approval Readiness concept:

- A pure read-only lifecycle readiness model and detail-page panel are implemented for inspection only. Lifecycle mutation is not implemented. This remains a planning boundary for future package definition/version lifecycle controls before any package mutation action, approval/publish/deprecate/archive control, contractor assignment, billing/provider mapping write, Stripe call, subscription operation, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, or runtime behavior exists.
- Future lifecycle controls should cover create draft, edit draft, submit for internal review, request changes, approve package definition, publish package version, deprecate package version, archive package definition/version, and supersede package version.
- Future allowed transitions should include `draft -> internal_review`, `internal_review -> draft`, `internal_review -> approved`, `approved -> published`, `published -> deprecated`, `deprecated -> archived`, `published -> superseded` by a newer published version, `draft -> archived`, and `internal_review -> archived`.
- Future blocked transitions should include destructive `published -> draft`, `archived -> published`, `deprecated -> active/published` without a new reviewed version, `approved -> published` without audit evidence, publish without required package dimensions, publish without approval actor/reason/confirmation, publish while billing/provider mapping is claimed active without a future verified provider model, and publish while entitlement/module mapping is claimed enforced without a future entitlement/module model.
- Future approval requirements should be platform-admin-only and should capture explicit reason, confirmation phrase, approval actor, approval timestamp, package definition snapshot, package version snapshot, validation result snapshot, dependency caveat snapshot, before/after snapshots, and an audit event written in the same transaction as any future lifecycle state change.
- Future readiness checks should verify required name/key/version, dimension completeness, valid lifecycle state, duplicate active key/version conflicts, publication snapshot presence, billing/provider intent-only boundaries, entitlement/module intent-only boundaries, starter-pack intent-only boundaries, and no implied runtime enforcement.
- The implemented read model `buildPlatformPackageDefinitionLifecycleReadiness(...)` exposes future transition eligibility, blocking reasons, advisory reasons, missing version/evidence caveats, intent-only billing/provider and entitlement/module caveats, safe operator guidance, and explicit no-behavior flags. It maps the currently persisted `review` status to the future `internal_review` lifecycle label for read-only explanation and does not introduce a new schema status.
- UI readiness now starts with a read-only Lifecycle Readiness panel on the package detail route. Mutation controls should come later one transition at a time, with no bulk publish, no auto approval, no runtime/package assignment/billing side effects, and copy that lifecycle controls affect only package definition/version records plus audit evidence.
- Future schema/security posture should require forced RLS where public lifecycle/audit tables are used, revoked broad anon/authenticated grants unless intentionally exposed, platform-admin-only server access, no client service-role exposure, safe error messages, server-side readiness recomputation, and no authoritative client-submitted snapshots.
- The first lifecycle implementation added only the pure lifecycle/readiness helper, focused tests for allowed and blocked transitions, missing evidence and dependency caveats, and a read-only readiness UI panel. Actual lifecycle mutation server actions, approval/publish/deprecate/archive buttons, package assignments, billing/provider writes, Stripe calls, subscriptions, entitlement/module enforcement, runtime gates, reporting/export, automation, AI behavior, and starter-pack provisioning changes stay deferred.

Contractor Package Assignment Schema / Read-Model:

- This schema/read-model workflow is implemented as `contractor_package_assignments`, `contractor_package_assignment_audit_events`, platform-admin-only read helpers, a read-only assignment catalog section, and a read-only one-assignment detail route. It is still a boundary before any package assignment write, approval/schedule/activate/cancel control, billing/provider mapping write, Stripe call, subscription operation, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, or runtime behavior exists.
- Contractor package assignments link one company/contractor to package definition/version references with assignment status, lifecycle state, effective date, supersession/cancellation/archive context, assignment snapshot, billing impact snapshot, entitlement/module impact snapshot, starter-pack implication snapshot, cancellation/supersession reason, and grandfathered/custom contract marker.
- The implemented first-slice tables are `contractor_package_assignments` and `contractor_package_assignment_audit_events`. Optional splits such as `contractor_package_assignment_transitions` or `contractor_package_assignment_snapshots` remain deferred unless query volume, retention, or audit/export shape later justifies them.
- Future assignment lifecycle states should be `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived`.
- Future assignment constraints should require only approved/published package versions to become active, at most one active assignment per company unless multi-package support is explicitly designed, audited activation for scheduled assignments, preserved supersession and cancellation evidence, and no direct reactivation of archived assignments.
- Future assignment remains separate from package definition, billing subscriptions, Stripe/provider operations, entitlement/module enforcement, contractor groups, starter-pack provisioning, contractor permissions, reporting/export, automation, AI suggestions, and runtime behavior.
- The implemented read models `buildContractorPackageAssignmentReadModel(...)`, `getContractorPackageAssignmentReadModel(...)`, `buildContractorPackageAssignmentDetail(...)`, `getContractorPackageAssignmentDetail(...)`, and `buildContractorPackageAssignmentActivationReadiness(...)` expose assignment summaries, lifecycle/status grouping, assignment history/timeline evidence, scheduled/effective/activation/cancellation/supersession/archive context, future transition readiness, missing company/package/version caveats, package-version validity caveats, active-conflict caveats, billing impact caveats, entitlement/module impact caveats, starter-pack implication caveats, safe snapshot summaries, empty/unavailable states, and read-only operator summaries.
- Future attention-needed rows should identify missing active assignments, multiple active assignments, scheduled assignments past effective date without activation evidence, assignments referencing missing or unpublished package versions, missing audit evidence, and intent snapshots that imply billing/provider or entitlement/module behavior before those future models exist.
- Future schema/security posture should require forced RLS where public assignment/audit tables are used, revoked broad anon/authenticated grants unless intentionally exposed, platform-admin-only server access, no client service-role exposure, locked `search_path` and revoked execute grants for future assignment RPCs, server-recomputed snapshots, safe metadata, and no authoritative client-submitted snapshots.
- The first assignment implementation added assignment and assignment-audit migrations, RLS/grant posture, shared types, platform-admin-only read helpers, pure assignment read-model/detail tests, a read-only Super Admin assignment inspection panel, and a read-only assignment detail route only. Package assignment mutation actions, approval/schedule/activate/cancel controls, billing/provider writes, Stripe calls, subscriptions, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export, automation/AI assignment suggestions, and starter-pack provisioning changes stay deferred.

Contractor Package Assignment Approval / Activation Readiness:

- This workflow is implemented as a pure read-only readiness model and assignment-detail inspection panel. It remains a planning boundary before any package assignment write, approval/schedule/activate/cancel/supersede/archive action, billing/provider mapping write, Stripe call, subscription operation, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, or runtime behavior exists.
- The implemented readiness model includes assignment approval readiness, activation readiness, effective date readiness, billing impact readiness, entitlement/module impact readiness, package version validity, previous assignment status, supersession readiness, cancellation readiness, audit evidence readiness, provider mapping caveats, and support review guidance.
- Future assignment approval should be platform-admin-only and should capture explicit operator reason, confirmation phrase, approval actor, approval timestamp, company/contractor snapshot, selected package definition/version snapshot, previous assignment snapshot, impact summary, billing impact caveat, entitlement/module impact caveat, starter-pack implication caveat, provider mapping caveat, and an audit event written in the same transaction as approval.
- Future activation should require an approved assignment, valid effective date, selected package version still published/active, previous active assignment supersession plan when applicable, and an activation audit event. Activation must not silently mutate billing/provider state, create/update/cancel Stripe subscriptions, collect payment, create invoices, enforce entitlements, gate modules, change contractor permissions, provision starter packs, run reporting/export, trigger automation, run AI behavior, or change runtime behavior.
- Future activation must not run from contractor group membership alone. Contractor groups may provide suggestion context only. AI or automation must not approve, schedule, activate, cancel, supersede, or archive assignments.
- Future allowed assignment readiness transitions should include `draft -> pending_review`, `pending_review -> draft`, `pending_review -> approved`, `approved -> scheduled`, `approved -> active`, `scheduled -> active`, `active -> superseded`, `active -> canceled`, `active -> archived` only after supersession/cancel evidence exists, `canceled -> archived`, and `superseded -> archived`.
- Future blocked transitions should include `draft -> active`, `pending_review -> active`, `canceled -> active`, `archived -> active`, `active -> draft`, `active -> approved`, `scheduled -> active` without a valid effective date, `approved -> active` with a deprecated/archived/missing package version, any activation that would create a second active assignment without explicit multi-package support, any transition implying billing/Stripe/subscription mutation, and any transition implying entitlement/module/runtime enforcement.
- The implemented pure read model `buildContractorPackageAssignmentActivationReadiness(...)` exposes assignment state, transition eligibility, blocking issues, warning issues, required future approval/activation inputs, impact caveats, missing evidence, safe operator summary, and explicit no-behavior flags including `actionAvailable: false`.
- The implemented UI readiness panel is read-only. Mutation controls should come later one transition at a time, with no bulk approval, no bulk activation, no auto activation, no apply-all assignment action, and clear copy that assignment controls affect only package assignment records and audit evidence until future billing/provider, entitlement/module, contractor-facing, reporting/export, and runtime systems are explicitly implemented.
- Future security posture should require forced RLS where public assignment/audit tables are used, revoked broad anon/authenticated grants unless intentionally exposed, platform-admin-only server access, no client service-role exposure, locked `search_path` and revoked execute grants for future transition RPCs, safe errors, server-side readiness recomputation, no authoritative client-submitted snapshots, and no provider/billing secrets in snapshots.
- The first readiness implementation added a pure assignment readiness helper, tests for allowed/blocked transitions and missing evidence, effective-date and package-version blockers, active assignment conflicts, billing/provider and entitlement/module caveats, and a read-only Super Admin assignment readiness panel only. Actual approval/schedule/activate/cancel/supersede/archive actions, billing/provider writes, Stripe calls, subscriptions, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export, automation/AI assignment suggestions, and starter-pack provisioning changes stay deferred.

Future Billing / Provider Mapping Schema Readiness for Package Assignments concept:

- This workflow is not implemented. It is a planning boundary for future package-assignment billing/provider mapping schema and read models before any provider call, Stripe call, subscription creation/update/cancel, package assignment write, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, or runtime behavior exists.
- Future mapping concepts should include package assignment billing mapping, billing provider, provider customer/product/price/subscription/subscription-item references, billing state, reconciliation state, sandbox/test-mode marker, trial/early-access state, grandfathered/custom commercial terms, expected provider state, observed provider state, and reconciliation mismatch.
- Future first-slice tables should likely be `contractor_package_billing_mappings` and `contractor_package_billing_mapping_audit_events`. Optional future tables such as `contractor_package_billing_reconciliation_events` or `contractor_package_billing_provider_snapshots` should stay deferred unless volume, retention, reconciliation, or support/export shape later justifies them.
- Future mapping lifecycle states should be `draft`, `provider_pending`, `mapped`, `verified`, `active`, `mismatch_detected`, `suspended`, `deprecated`, and `archived`.
- Future mapping constraints should treat provider ids as references rather than source-of-truth business objects, avoid billing mutation from mapping creation alone, avoid automatic entitlement/module/runtime changes from billing state, avoid automatic package assignment activation from provider state, prevent reconciliation mismatch from silently mutating records, separate sandbox/test-mode mappings from production mappings, preserve archived/deprecated evidence, avoid payment-method storage, and prohibit raw secrets or sensitive payment data in mapping records.
- Future reconciliation/readiness concepts should distinguish expected provider state from observed provider state, stale provider mappings, pending verification, mismatch detected, support review required, webhook dependency, idempotency requirement, rollback/recovery readiness, and no destructive auto-correction.
- Future read models such as `buildContractorPackageBillingMappingReadModel(...)` or `getContractorPackageBillingProviderReadiness(...)` should expose current provider mapping, provider state summary, reconciliation status, mismatch warnings, billing impact caveats, package assignment linkage, trial/early-access state, sandbox/production separation, safe operator summary, and attention-needed rows.
- Future attention-needed rows should identify missing mapping for active/approved assignments, unverified provider references, stale provider mappings, sandbox/production mismatch, provider reference conflicts, expected/observed state mismatches, missing audit evidence, missing webhook support, and custom/grandfathered terms needing review.
- Future security posture should require forced RLS where public mapping/audit tables are used, revoked broad anon/authenticated grants unless intentionally exposed, platform-admin-only server access, no client service-role exposure, locked `search_path` and revoked execute grants for future provider RPCs, no provider secret/token storage in exposed tables, careful provider reference display, no raw provider errors stored directly, no authoritative client-submitted provider snapshots, and no payment method details outside approved billing provider flows.
- Future first provider-mapping implementation should add mapping and mapping-audit migrations, RLS/grant posture, generated/shared types if needed, platform-admin-only read helpers, pure reconciliation/read-model tests, and a read-only Super Admin provider readiness panel only. Actual Stripe/provider calls, subscription creation/update/cancel, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export, automation/AI reconciliation behavior, and starter-pack provisioning changes should stay deferred.

Future Billing / Provider Mapping Reconciliation Readiness concept:

- This workflow is not implemented. It is a planning boundary for future expected-vs-observed provider reconciliation before any Stripe/provider call, subscription creation/update/cancel, provider mutation, package assignment write, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, or runtime behavior exists.
- Future reconciliation concepts should include expected provider state, observed provider state, reconciliation status, mismatch category, stale provider state, pending verification, webhook dependency, provider sync attempt, support review required, recovery readiness, rollback readiness, sandbox/test-mode isolation, and reconciliation evidence snapshot.
- Future reconciliation statuses should be `not_started`, `pending_provider`, `pending_verification`, `verified`, `mismatch_detected`, `support_review_required`, `suspended`, and `archived`.
- Future mismatch categories should include `missing_provider_customer`, `missing_provider_subscription`, `mismatched_price`, `mismatched_product`, `stale_provider_state`, `duplicate_active_subscription`, `orphaned_provider_subscription`, `unexpected_provider_status`, `invalid_environment_mix`, and `unsupported_custom_contract`.
- Future first-slice reconciliation tables should likely be `contractor_package_billing_reconciliation_events` and `contractor_package_billing_provider_snapshots`. Optional future tables such as `contractor_package_billing_sync_attempts` or `contractor_package_billing_reconciliation_reviews` should stay deferred unless provider-operation evidence, retry/idempotency state, support review queues, or retention needs justify them.
- Future reconciliation constraints should prohibit silent provider mutation, silent package assignment mutation, silent entitlement/module/runtime mutation, automatic contractor suspension from mismatch detection alone, cross-use of sandbox and production provider state, and destructive auto-correction without explicit approval. Provider state should remain evidence/reference, not the sole source of business truth.
- Future reconciliation workflow should ingest sanitized provider snapshots from signed webhooks or server-side provider reads, recompute expected provider state server-side, compare expected and observed state, classify mismatch, surface support-review-needed rows, keep approved corrective action future-only, and retain append-only audit evidence/history.
- Future read models such as `buildContractorPackageBillingReconciliationReadModel(...)` or `getContractorPackageProviderReconciliationStatus(...)` should expose current reconciliation state, mismatch summaries, stale verification warnings, provider environment warnings, support-review-needed rows, recovery readiness, rollback readiness, assignment linkage, safe operator summary, and attention-needed rows.
- Future security posture should require forced RLS where public reconciliation/provider-snapshot tables are used, revoked broad anon/authenticated grants unless intentionally exposed, platform-admin/support server-only access, no client service-role exposure, locked `search_path` and revoked execute grants for future reconciliation RPCs, no provider secret/token storage, careful provider-reference display, no raw provider payload/error dumps exposed directly, and no authoritative client-submitted provider snapshots.
- Future first reconciliation implementation should add reconciliation event and provider snapshot migrations, RLS/grant posture, generated/shared types if needed, platform-admin-only read helpers, pure reconciliation/read-model tests, and a read-only Super Admin reconciliation panel only. Actual Stripe/provider calls, subscription creation/update/cancel, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export, automation/AI reconciliation behavior, and starter-pack provisioning changes should stay deferred.

Future Billing / Provider Operation Evidence and Idempotency Readiness concept:

- This workflow is not implemented. It is a planning boundary for future provider operation evidence, attempt history, idempotency, webhook correlation, retry review, and support readback before any Stripe/provider call, subscription creation/update/cancel, provider mutation, package assignment write, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, background job, or runtime behavior exists.
- Future provider operation concepts should include provider operation request, provider operation attempt, provider operation evidence, provider response evidence, idempotency key, operation correlation id, reconciliation linkage, retry eligibility, retry suppression, safe provider error summary, provider webhook correlation, operator review state, rollback/recovery evidence, and sandbox/production environment isolation.
- Future provider operation types should include `provider_customer_create`, `provider_subscription_create`, `provider_subscription_update`, `provider_subscription_cancel`, `provider_subscription_suspend`, `provider_subscription_resume`, `provider_price_lookup`, `provider_product_lookup`, `provider_webhook_ingest`, and `provider_reconciliation_check`.
- Future provider operation statuses should include `pending`, `submitted`, `provider_acknowledged`, `provider_completed`, `provider_failed`, `retry_pending`, `retry_suppressed`, `support_review_required`, and `archived`.
- Future first-slice operation/evidence tables should likely be `contractor_package_billing_provider_operations` and `contractor_package_billing_provider_operation_attempts`. Optional future tables such as `contractor_package_billing_provider_webhook_events` or `contractor_package_billing_provider_retry_queue` should stay deferred unless signed webhook retention, replay detection, retry scheduling, idempotency state, or support ownership needs justify them.
- Future idempotency constraints should prevent duplicate provider artifacts from repeated provider mutation requests, preserve the same idempotency identity for true retries, retain append-only evidence, preserve prior failures, detect webhook replay, isolate sandbox/test-mode from production, prevent destructive retry loops, and require support review when retry suppression is ambiguous.
- Future provider-operation workflow should generate operation requests server-side, assign idempotency keys server-side, submit to providers only in a later explicit implementation, capture safe provider responses, classify retry/review state, correlate signed webhooks, link to reconciliation, require support review for ambiguous/destructive cases, and retain history.
- Future read models such as `buildContractorPackageProviderOperationReadModel(...)` or `getContractorPackageProviderOperationEvidence(...)` should expose provider operation timeline, attempt history, idempotency grouping, retry status, webhook correlation, reconciliation linkage, safe operator summaries, support-review-needed rows, and attention-needed rows.
- Future security posture should require forced RLS where public operation/attempt tables are used, revoked broad anon/authenticated grants unless intentionally exposed, platform-admin/support server-only access, no client service-role exposure, locked `search_path` and revoked execute grants for future provider-operation RPCs, no provider secret/token storage, no raw provider payload dumps exposed directly, safe provider error summaries only, no authoritative client-submitted provider evidence, and webhook signature verification before trusted linkage.
- Future first provider-operation evidence implementation should add operation and attempt migrations, RLS/grant posture, generated/shared types if needed, platform-admin/support read helpers, pure read-model/idempotency tests, and a read-only Super Admin provider operation evidence panel only. Actual Stripe/provider calls, subscription creation/update/cancel, automated retries, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export, automation/AI retry behavior, and starter-pack provisioning changes should stay deferred.

Future Billing / Provider Webhook Evidence and Correlation Readiness concept:

- This package-governance workflow is not implemented. It is a planning boundary for future signed provider webhook evidence, replay detection, deduplication, operation linkage, reconciliation linkage, support review, and safe payload summaries before any package-governance Stripe/provider webhook ingestion, subscription creation/update/cancel, provider mutation, package assignment write, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, background job, or runtime behavior exists.
- The existing canonical invoice/payment Stripe webhook foundation is separate from this future package-governance webhook evidence layer; this concept does not change current payment webhook handling or payment-event behavior.
- Future webhook concepts should include provider webhook event, provider webhook payload evidence, provider webhook signature verification, provider webhook correlation id, provider webhook replay detection, provider webhook deduplication, provider webhook reconciliation linkage, provider webhook operation linkage, provider webhook support review state, provider webhook archive/history retention, and provider webhook environment isolation.
- Future webhook event categories should include `customer_created`, `customer_updated`, `subscription_created`, `subscription_updated`, `subscription_deleted`, `invoice_paid`, `invoice_failed`, `checkout_completed`, `payment_method_updated`, `product_updated`, `price_updated`, `webhook_signature_invalid`, `webhook_duplicate_detected`, and `reconciliation_triggered`.
- Future webhook processing statuses should include `received`, `signature_pending`, `signature_verified`, `signature_failed`, `correlated`, `duplicate_detected`, `reconciliation_pending`, `support_review_required`, and `archived`.
- Future first-slice webhook evidence tables should likely be `contractor_package_billing_provider_webhook_events` and `contractor_package_billing_provider_webhook_correlations`. Optional future tables such as `contractor_package_billing_provider_webhook_failures` or `contractor_package_billing_provider_webhook_replays` should stay deferred unless invalid-signature review, malformed payloads, replay evidence, repeated delivery windows, or support ownership needs justify them.
- Future webhook constraints should prohibit automatic package assignment mutation, entitlement/module/runtime mutation, contractor permission mutation, duplicate provider operations from duplicate events, sandbox/production event mixing, and raw provider payload exposure. Invalid signatures should be retained as safe evidence but must not be trusted for provider state.
- Future webhook workflow should receive provider events, verify signatures server-side, check replay/deduplication, correlate provider references, link to future provider operations, link to future reconciliation evidence, surface support-review-needed rows, and preserve append-only archive/history evidence without auto-fix behavior.
- Future read models such as `buildContractorPackageProviderWebhookReadModel(...)` or `getContractorPackageProviderWebhookEvidence(...)` should expose webhook timeline, signature verification state, replay/duplicate warnings, operation/reconciliation linkage, support-review-needed rows, environment warnings, safe operator summaries, and attention-needed rows.
- Future security posture should require forced RLS where public webhook/correlation tables are used, revoked broad anon/authenticated grants unless intentionally exposed, platform-admin/support server-only access, no client service-role exposure, locked `search_path` and revoked execute grants for future webhook verification RPCs, no provider secret/token storage, no raw provider payload dumps exposed directly, safe payload summaries only, signature verification before trusted linkage, and replay protection before webhook-triggered workflows.
- Future first webhook evidence implementation should add webhook event and correlation migrations, RLS/grant posture, generated/shared types if needed, platform-admin/support read helpers, pure webhook evidence/read-model tests, and a read-only Super Admin webhook evidence panel only. Actual Stripe/provider webhook ingestion, subscription creation/update/cancel, webhook-triggered reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export, automation/AI webhook handling, and starter-pack provisioning changes should stay deferred.

Future Billing / Provider Support Review and Manual Resolution Readiness concept:

- The first read-only support-review evidence foundation is implemented as `contractor_package_billing_support_reviews`, `contractor_package_billing_support_review_events`, platform-admin-only read helpers, a pure support-review read model, a read-only `/super-admin/packages` support-review readiness section, and a read-only support-review summary on provider mapping detail. It is still a boundary before any support queue execution, manual resolution action, corrective-action execution, Stripe/provider operation, subscription creation/update/cancel, package assignment write, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, background job, or runtime behavior exists.
- Future support-review statuses should be `pending_review`, `awaiting_evidence`, `awaiting_provider_confirmation`, `approved_for_resolution`, `resolution_blocked`, `resolved`, and `archived`.
- Future resolution categories should include `provider_state_mismatch`, `duplicate_provider_subscription`, `orphaned_provider_subscription`, `stale_provider_mapping`, `invalid_environment_mix`, `unsupported_custom_contract`, `webhook_replay_issue`, `missing_provider_customer`, `missing_provider_subscription`, and `manual_support_override_required`.
- The first-slice support-review tables are `contractor_package_billing_support_reviews` and `contractor_package_billing_support_review_events`. Optional future tables such as `contractor_package_billing_resolution_proposals` or `contractor_package_billing_support_review_assignments` stay deferred unless corrective-action proposal lifecycles, support ownership, escalation teams, SLA clocks, or multi-operator queues justify them.
- Future support-review constraints should prohibit review queues alone from mutating provider state, package assignments, entitlements/modules/runtime, billing status, subscriptions, contractor permissions, contractor navigation, starter-pack provisioning, reporting/export behavior, automation, AI behavior, or product behavior. Support review alone must not trigger Stripe/provider operations, subscription mutations, reconciliation auto-fix, webhook replay, or package assignment activation.
- Future corrective actions require explicit approval, operator reason/confirmation, server-side recomputation, append-only evidence, and a separate execution path. Sandbox/test-mode reviews must stay isolated from production reviews, and no destructive auto-fix may run without approved corrective action, idempotency design, rollback/readback strategy, and before/after evidence.
- Future support-review workflow should detect mismatch/reconciliation evidence, open a support review, attach server-verified evidence, review provider/webhook/reconciliation correlation, optionally create a non-executing corrective-action proposal, grant approval only in a future explicit step, hand off to a separate future execution path only after approval, and retain archive/history for rejected, blocked, resolved, escalated, and manually reviewed outcomes.
- The implemented read models `buildContractorPackageBillingSupportReviewReadModel(...)` and `buildContractorPackageBillingSupportReviewDetail(...)` expose review status/category/environment labels, support-review rows/detail, event evidence rows, blocked/escalation/attention caveats, safe evidence summaries, linked reference labels when available, safe unavailable states, and no-behavior flags. Future read models may deepen support-review queues, reconciliation linkage, webhook/provider linkage, rollback/recovery readiness, approval readiness, environment warnings, and operator summaries without adding execution behavior in this slice.
- Future attention-needed rows should identify pending reviews, awaiting evidence, awaiting provider confirmation, invalid environment mixes, duplicate provider subscriptions, orphaned provider subscriptions, stale provider mappings, missing provider customers/subscriptions, webhook replay issues, unsupported custom contracts, approval-required reviews, blocked resolutions, and resolved reviews needing archive/history retention.
- Future security posture should require forced RLS where public support-review tables are used, revoked broad anon/authenticated grants unless intentionally exposed, platform-admin/support server-only access, no client service-role exposure, locked `search_path` and revoked execute grants for future support-resolution RPCs, no provider secret/token storage, no raw provider payload/error dumps exposed directly, safe summaries only, no authoritative client-submitted resolution evidence without server verification, and approval before any future corrective-action execution.
- The first support-review implementation added support-review and support-review-event migrations, RLS/grant posture, shared types, platform-admin read helpers, pure support-review/readiness tests, and read-only Super Admin support-review panels only. Actual Stripe/provider corrective actions, subscription creation/update/cancel, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI support resolution behavior, starter-pack provisioning changes, and package assignment writes remain deferred.

Future Billing / Provider Support Operations Runbook and Operator QA Readiness concept:

- This package-governance workflow is not implemented. It is a planning boundary for a future support operations runbook, evidence review checklist, provider/reconciliation evidence validation, sandbox-vs-production checklist, escalation handoff, blocked-resolution handling, operator decision logging, approval handoff, rollback/recovery preparation, environment isolation, support QA readiness, and support review audit trail before any support-operations mutation, support queue execution, manual resolution action, Stripe/provider operation, subscription creation/update/cancel, package assignment write, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, background job, or runtime behavior exists.
- Future operator review stages should be `evidence_collected`, `evidence_validated`, `escalation_required`, `escalation_resolved`, `corrective_action_proposed`, `approval_pending`, `approved_for_execution`, `execution_deferred`, and `archived`.
- Future runbook constraints should prohibit runbook review alone from mutating provider state, package assignments, entitlements/modules/runtime, billing status, subscriptions, contractor permissions, contractor navigation, starter-pack provisioning, reporting/export behavior, automation, AI behavior, or product behavior. Support review alone must not trigger Stripe/provider operations, subscription mutations, reconciliation auto-fix, webhook replay, package assignment activation, or corrective execution.
- Future corrective execution requires a separate execution path with explicit approval, server-side recomputation, verified evidence, idempotency design, rollback/readback planning, and a separate audit trail. Sandbox/test-mode investigations must stay isolated from production investigations, operator decision evidence must remain append-only, blocked resolutions must be retained, destructive auto-fix is disallowed without approved corrective execution, and AI/automation-generated corrective execution is out of scope.
- Future evidence-review checklist should verify package assignment state, provider mapping state, reconciliation evidence, webhook evidence, duplicate/replay checks, environment isolation, expected-vs-observed provider state, rollback/recovery path, operator reason, and approval requirement.
- Future escalation workflow should open a support review, validate evidence, trigger escalation when needed, attach escalation evidence, review any non-executing corrective-action proposal, prepare approval handoff, keep the execution path separate, and retain archive/history for blocked, rejected, escalated, deferred, approved, resolved, and archived outcomes.
- Future operator QA readiness should cover sandbox-only QA before production, replay/deduplication QA, reconciliation mismatch QA, rollback/recovery QA, invalid signature QA, provider correlation QA, safe payload-summary QA, no-secret/no-raw-provider-payload QA, no unintended entitlement/runtime mutation QA, and no unintended package-assignment mutation QA.
- Future security posture should keep support-review evidence tables server-only with platform-admin/support-only access, forced RLS if public tables are used, revoked broad anon/authenticated grants, locked `search_path` and revoked execute grants for future RPCs, no provider secrets/tokens/raw payload dumps, no unbounded operator metadata blobs, and no authoritative client-submitted evidence without server verification.
- Future read models such as `buildBillingSupportOperationsRunbookReadModel(...)` or `getBillingSupportOperatorQAReadiness(...)` should expose support-review queue, checklist readiness, escalation state, rollback/recovery readiness, environment warnings, approval handoff readiness, safe operator summaries, and attention-needed rows without granting provider mutation authority, subscription mutation authority, package assignment truth, entitlement/module/runtime truth, reporting/export authority, automation authority, or AI execution authority.
- Future first support-operations implementation should add a pure runbook/readiness helper, support-review QA/readiness tests, and a read-only Super Admin support-operations panel only after the support-review evidence foundation exists. Actual Stripe/provider corrective actions, subscription creation/update/cancel, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI support execution behavior, starter-pack provisioning changes, package assignment writes, and contractor permission changes should stay deferred.

Future Billing / Provider Support Operations Release Gate and Production Readiness Checklist concept:

- This package-governance workflow is not implemented. It is a planning boundary for a future support-review evidence release gate, runbook checklist completeness, operator QA signoff, sandbox-to-production promotion checklist, escalation/approval separation, rollback/recovery readiness, security/RLS verification, provider secret/redaction verification, no-secret/no-raw-payload validation, no-mutation/no-auto-fix verification, production readiness signoff, release blockers, release exceptions, and post-release monitoring requirements before any production approval action, corrective execution, Stripe/provider operation, subscription creation/update/cancel, package assignment write, entitlement enforcement, module gate, reporting/export behavior, contractor permission change, starter-pack provisioning change, automation, AI behavior, background job, or runtime behavior exists.
- Future release-gate statuses should be `not_started`, `checklist_incomplete`, `qa_in_progress`, `blocked`, `ready_for_sandbox`, `sandbox_verified`, `ready_for_production_review`, `production_approved`, `production_deferred`, and `archived`.
- Future release blockers should include `missing_support_review_evidence`, `missing_runbook_checklist`, `missing_operator_signoff`, `missing_sandbox_validation`, `missing_rollback_plan`, `missing_security_verification`, `missing_rerun_idempotency_proof`, `raw_provider_payload_exposure`, `secret_exposure_risk`, `unresolved_reconciliation_mismatch`, `unresolved_webhook_replay_risk`, `entitlement_runtime_side_effect_risk`, `package_assignment_side_effect_risk`, and `billing_provider_mutation_risk`.
- Future production readiness checklist should verify support-review evidence, runbook checklist completion, operator QA signoff, sandbox scenario testing, sandbox/production separation, rollback/recovery plan, sanitized provider evidence, safely displayed provider IDs, no exposed secrets/raw provider payloads, RLS/forced RLS/grant posture, security-definer execute grants if RPCs exist, idempotency/replay handling, no unintended package assignment mutation, no unintended billing/provider mutation, no unintended entitlement/module/runtime mutation, and approval handoff to a separate future execution path.
- Future release-gate constraints should prohibit release-gate review alone from executing corrective actions, mutating provider state, mutating package assignments, mutating entitlements/modules/runtime, calling Stripe/provider APIs, replaying webhooks, running reconciliation auto-fix, creating/updating/canceling subscriptions, creating invoices, collecting payments, enforcing entitlements, gating modules, changing contractor permissions, triggering reporting/export behavior, running automation, running AI behavior, or starting background jobs. Production approval is readiness signoff only and must not imply execution.
- Future release exceptions must be explicit, reasoned, scoped, audited, retained, and unable to silently bypass evidence, QA, rollback, or security gates. No AI/automation-generated production approval and no background-job execution may originate from the release gate.
- Future first-slice release-gate tables could be `contractor_package_billing_release_gates` and `contractor_package_billing_release_gate_events`. Optional future tables such as `contractor_package_billing_release_exceptions` or `contractor_package_billing_release_checklist_items` should stay deferred unless exceptions or checklist ownership need their own durable lifecycle. These tables are not implemented today.
- Future read models such as `buildBillingProviderReleaseGateReadModel(...)` or `getBillingProviderProductionReadiness(...)` should expose readiness status, blocker list, checklist completion, sandbox/production separation state, security verification state, rollback/recovery readiness, approval handoff readiness, safe operator summaries, and attention-needed rows without granting provider mutation authority, subscription mutation authority, package assignment truth, entitlement/module/runtime truth, reporting/export authority, automation authority, AI execution authority, or background job authority.
- Future QA/security gates should include docs/readiness tests, schema/RLS tests when tables exist, platform-admin/support authorization tests, no client service-role exposure tests, no raw provider payload tests, no secret exposure tests, idempotency/replay tests, webhook signature tests, sandbox-to-production separation tests, no unintended billing mutation tests, no unintended package assignment mutation tests, no unintended entitlement/module/runtime mutation tests, browser QA, and a production-readiness regression checklist.
- Future first release-gate implementation should add a pure readiness helper, release-gate checklist/readiness tests, and a read-only Super Admin release-gate panel only after support-review/runbook evidence foundations exist. Actual release-gate tables, actual production approval actions, Stripe/provider corrective actions, subscription creation/update/cancel, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI support execution behavior, background jobs, package assignment writes, starter-pack provisioning changes, and contractor permission changes should stay deferred.

Current canonical records involved:

- profile
- organization
- membership
- location
- company subscription lifecycle, when present

### Lead / Opportunity Intake

Implemented flow:

- contractor creates an opportunity in `/leads`
- opportunity can be reviewed and updated
- opportunity can store a next follow-up timestamp and optional internal follow-up note, and the lead workspace can set, update, or clear that internal follow-up context
- manual opportunity communication can be logged from the lead workspace on canonical `communication_threads` / `communication_messages` before customer/project conversion, with explicit internal versus customer-visible message visibility
- dashboard and the lead manager now use an internal follow-up queue/read model over `opportunities.next_follow_up_at` and opportunity communication recency, surfacing overdue, due-today, upcoming, and no-follow-up lead states without sending reminders or auto-generating work items
- lead-linked sales appointments, site assessments, and callbacks use canonical `appointments`; they can appear on internal `/schedule` and dashboard appointment views without becoming jobs or creating a second schedule model
- appointment workspaces now show a contractor-only Customer Confirmation panel that previews editable customer-safe confirmation copy, explains eligibility blockers, lists eligible email recipients, can manually log a customer-visible `appointment_confirmation` communication message, and can manually send an email confirmation after explicit contractor confirmation; this does not schedule reminders, mutate appointment status, or expose portal confirmation actions
- provider-backed appointment confirmation email is wired to that explicit contractor action: the send path reuses the customer-safe preview, creates or reuses the canonical appointment confirmation message, sends through the existing Postmark-backed notification email path, links the provider attempt through `notification_deliveries.communication_message_id`, and marks the message `sent` only after provider success
- failed appointment confirmation email attempts should remain delivery audit records and must not mark the communication message sent or mutate appointment status/notes
- communication preferences now provide an organization-scoped foundation for customer-facing communication eligibility; appointment reminder readiness and manual email reminder sends evaluate customer and customer-contact email preferences, and customer detail lets contractor admins manage email appointment-reminder preferences while still exposing no portal preference controls or SMS controls
- manual appointment reminder email sending uses customer-safe appointment fields only, creates or reuses canonical appointment reminder communication messages, sends through the existing Postmark-backed notification email path, records provider attempts through `notification_deliveries.communication_message_id`, and marks the communication message `sent` only after provider success
- appointment reminder sending suppresses hidden, canceled, no-show, completed, missing-context, missing-time, no-recipient, opted-out/suppressed-recipient, and same-recipient duplicate-success cases; it does not schedule reminders, automate sends, mutate appointment status/notes, or expose portal reminder actions
- appointment workspaces now expose the manual reminder path in a separate contractor-only Customer Reminder panel with readiness blockers, editable customer-safe reminder copy, preference-filtered recipient selection, a customer preference-management link when no eligible recipient remains, explicit send action, and recent reminder delivery history
- internal appointment dashboard visibility can highlight today/tomorrow appointments and recent canceled/no-show appointment records that may need contractor follow-up; dashboard reminder-send UI is not implemented
- lead workspaces can now show opportunity-linked internal `work_items`, explicitly create manual or lead-follow-up work items tied to the current opportunity, and complete or dismiss those linked items without changing the opportunity follow-up fields automatically
- appointment workspaces can now show appointment-linked internal `work_items`, explicitly create manual appointment prep or appointment follow-up work items tied to the current appointment, and complete or dismiss those linked items without changing appointment status, schedule fields, customer-visible appointment notes, or portal visibility
- dashboard lead follow-up cues and lead-manager follow-up rows can now bridge into prefilled opportunity-linked work-item creation, but the contractor must still confirm the form; no work item is auto-generated from follow-up state
- dashboard appointment cues can now bridge into prefilled appointment-linked prep or follow-up work-item creation, but the contractor must still confirm the form; no work item is auto-generated from appointment status
- project workspaces now show deterministic project guidance cues from existing project context only, including approved estimates missing contracts, unpaid deposit invoices, open blocker field notes, signed ready projects without jobs, and ready projects with unscheduled jobs; canonical next-step cues keep their existing contract, invoice, job Quick-Create, or schedule workflow links for human confirmation, while only open blocker field-note coordination can prefill the existing internal work-item form for manual submission
- estimate and invoice workspaces can bridge selected record-level Needs Attention cues into cue-to-work-item prefill: stale sent-estimate cues prefill estimate-linked follow-up work, and past-due invoice cues prefill invoice-linked collection follow-up. These are source-locked drafts only; no work item exists until the contractor submits the existing form.
- dashboard can preview the highest-priority project cues and now points users back to the project cue panel while preserving existing workflow links; the preview remains an entry point back into project-centered canonical workflows rather than a separate AI dashboard, task queue, or automation surface
- the lead workspace includes lightweight site visit Scope Intake capture for manual measurements and structured observations
- starting the estimate path creates or links the downstream customer and project records as needed

Current canonical records involved:

- opportunity
- optional linked customer
- optional linked project
- communication threads/messages for manual lead communication
- communication threads/messages for manually logged appointment confirmations where explicitly created
- appointments for lead-linked visits, meetings, and callbacks
- optional internal work items for contractor-owned follow-through, when explicitly created through work-item utilities or contractor-side work-item UI

### Customer To Project

Implemented flow:

- customer records are managed in the protected app
- projects are created under canonical customers
- project detail acts as the current bridge into estimating and downstream work
- contractor admins manage customer contact identity, portal invite state, and project-scoped portal visibility from the customer account, with People remaining the cross-customer administration view
- when lead, customer, project inline-customer, or estimate-start flows capture the first customer person, that person should be created or linked as the primary canonical `customer_contacts` relationship for the customer account when sufficient details exist
- estimate, contract, and invoice workflows may trigger or verify portal access contextually, but they do not own portal identity or permissions management
- new contractor-created portal invites require selecting the customer contact who will authenticate through Supabase Auth; legacy null-contact grants remain compatibility records
- invited customers use `/portal/invite?token=...` to sign up or log in, and the invite activates only when the authenticated email matches the contractor-created invite
- portal invite creation and resend use FloorConnector app-managed invite links, do not send Supabase Auth admin invites, and send branded provider-backed email only when email delivery is configured and the organization is allowed to send externally
- when provider email is activation-locked or not configured, the contractor UI shows truthful no-send status and preserves a fresh copy-link fallback rather than claiming delivery
- customer password setup normally happens through Supabase-backed signup, login, forgot-password, and update-password routes; invite links preserve a safe return path so the customer can authenticate and then accept the pending contact-level grant
- customer contact project visibility is explicit per contact; People shows customer contacts against shared projects, and any "same as primary" behavior must be an intentional copy-access action rather than silent inheritance
- Project detail can show which customer contacts currently have active portal visibility for that project, while People/customer-contact administration remains the management home
- contractor-side temporary portal credentials are implemented as a support-only owner/admin fallback, not the normal onboarding path; the action stays server-only, uses Supabase Auth Admin APIs, avoids storing or logging raw passwords, shows generated values once, and forces password change after login
- portal-bound auth returns do not run contractor tenant bootstrap for portal-only customers; contractor workspace bootstrap remains for contractor app users
- portal customers can see read-only, project-linked appointments only when a contractor explicitly marks the canonical appointment `customer_visible = true`
- customer-facing appointment display uses customer-safe fields only: appointment title/type, date/time, status, location, and `customer_notes`; it does not expose internal notes, legacy appointment notes, assignment internals, or internal communication
- portal appointment display does not include appointment confirmation actions, email-send actions, or communication-message display yet, even when a contractor logs or later sends a customer-visible appointment confirmation internally

Current canonical records involved:

- customer
- project
- appointments for customer-visible project appointments
- portal access grant
- portal project access
- optional related customer contact

Current customer-account interpretation:

- the customer is the full canonical customer/account record, not a lightweight contact card
- additional customer contacts sit beneath that account and are managed from the customer account and People for identity, relationship, and portal access administration, but the account remains the commercial and financial source of truth
- customer-level email and phone stay as account/commercial fallback fields; they should not be the only place a captured customer person lives once a customer/contact intake flow has enough person detail to create or link a primary contact
- normal portal onboarding is contractor-initiated from the shared customer/project workflow; customers do not self-register first unless a later customer-led quote/intake surface explicitly supports that path
- the current portal identity architecture is mapped in [docs/portal-identity-review.md](C:/FloorConnector/docs/portal-identity-review.md)

### Project To Estimate

Implemented flow:

- estimates are created from project context
- estimate authoring is cost-item-first:
  - new estimate line items are catalog-first; user-facing manual freeform estimate row creation is disabled
  - `Create new item` saves an organization-scoped `catalog_items` record inline from the Estimate Editor and then inserts it into the current estimate through the existing catalog insertion flow
  - active non-system `catalog_items` can be added from the Estimate Editor Catalog Items panel
  - inserted catalog items become editable commercial `estimate_line_items` snapshots rather than live-bound catalog rows
  - catalog-backed estimate item names are clickable for editing from the Estimate Editor
  - editing from the estimate updates the reusable `catalog_items` row and refreshes only the current estimate line snapshot
  - other estimates that already snapshotted the same catalog item do not silently update
  - approved estimate snapshot editing is blocked
  - archived catalog items remain visible for review where surfaced but are blocked from insertion
  - reusable systems expand through shared system logic from length x width or direct area plus linear footage
- system-generated estimate items still use catalog/system component sources and become canonical estimate line-item snapshots
- `finish_products`, `floor_system_templates`, and `floor_system_template_components` now have a first contractor-side admin/data access layer in `/settings/system-layers`
- `selected_floor_systems` now has a first contractor-side admin/data access layer in `/settings/selected-systems` for chosen or proposed finish/service systems linked to real workflow records
- `estimate_system_snapshots` and `contract_system_snapshots` now exist as schema foundation only for future selected-system/spec proof at customer-facing estimate and contract review/signature boundaries
- System Layers remains foundation-only for workflow purposes: it does not yet change active estimate authoring, estimate generation, contract generation, invoice behavior, files, activity, or approved snapshot lineage
- no estimate UI, contract UI, server action, Estimate Builder path, or contract generation path writes system snapshots yet
- no visualizer, files/file links, message delivery, or activity layer was added with the system snapshot foundation
- selected systems are not public/pre-auth records; no `visualizer_sessions` table or public visualizer handoff exists yet
- `catalog_items` are the canonical reusable sellable cost item database; physical stock now belongs in `inventory_items`
- inventory remains optional per organization and never blocks cost item selection in estimates
- item-level tax stays simple:
  - customer tax exemption overrides everything
  - non-taxable cost items produce zero tax
  - otherwise organization or platform financial defaults determine the rate
- estimate line items, totals, tax, and discount handling are live
- `estimate_line_items` is the authoritative pricing-row source; legacy `estimates.content.itemRows` should not be used for new behavior
- Estimate Editor edits use explicit shared save-state behavior with validation and stale-write conflict protection
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
- manual/offline approval requires approver, approval method, approval date/time, and supporting notes/evidence before the status transition is recorded; this evidence is written into the existing estimate customer-event trail instead of a separate approval model
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
- contractor-side send-for-signature and optional countersign workflow now run on the same canonical contract record; send-for-signature is blocked by the activation guard while the organization is pending/trial
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
- once contract/signature activity begins, selected systems/specs should be locked or snapshotted through the shared `contract_system_snapshots` foundation after a future integration slice
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
- customer-facing checkout/payment processing is blocked by the activation guard while the contractor organization that owns the invoice is pending/trial
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
- opportunity-linked communication threads/messages now support pre-conversion lead communication without a separate lead-activity model
- manual communication logs must default internal unless a contractor deliberately marks the message customer-visible in a future UI
- provider-backed notification email delivery is blocked by the activation guard while the organization is pending/trial; internal in-app notifications and communication review remain available
- internal work items now provide a small contractor-only action layer for ownership, due date, assignment, completion, and dismissal; dashboard, lead workspace, and appointment workspace UI can list and act on manually created work items, and linked work items can point back to canonical records without replacing notification events, per-user notifications, automation runs, workflow error events, opportunity follow-up fields, or appointment statuses

Current canonical records involved:

- notification events
- notifications
- notification deliveries
- communication threads
- communication messages
- work items

Future communication direction:

- communication and delivery proof should extend across estimates, contracts, invoices, change orders, payment requests, portal invites, customer/contractor messages, app interactions, SMS, email, and manual logs
- delivery attempts/events should be immutable and tied back to canonical records
- provider delivery data enriches FloorConnector records but should not become the business source of truth

### Financials Module Home

Implemented flow:

- `Financials Home` at `/financials` is now the section entry point for cross-project financial work
- it summarizes the live canonical invoice and payment chain instead of introducing a duplicate dashboard
- it routes users into the existing `Invoices`, `Payments`, `Progress Billing`, and Accounts Receivable workspaces for the actual record-level work
- `Accounts Receivable` at `/financials/accounts-receivable` is now a read-only collections workspace built from canonical invoices, payments, and immutable payment events

Current implemented visibility on Financials Home:

- open receivables from canonical invoice balances
- overdue receivable amount and overdue invoices needing follow-up
- pending checkout/payment totals
- posted payment totals
- failed, voided, or in-progress payment events needing reconciliation attention
- collection-opportunity links to the canonical Invoice Workspace

Current implemented visibility on Accounts Receivable:

- invoice aging buckets derived from invoice due dates and balances
- collection queue for open balances with customer/project/estimate/job continuity where linked
- pending canonical payments and checkout-provider status where stored
- failed, voided, and checkout-started payment events tied back to invoices

Current implemented record-level reconciliation visibility:

- Invoice Workspace shows a read-only payment evidence timeline from immutable payment events on the canonical invoice/payment chain
- payment evidence is classified into plain-language settled, pending, failed, voided, informational, and needs-review states without mutating invoice or payment state
- provider references are displayed only as compact stored identifiers such as gateway provider/status, provider event id, checkout session, payment intent, method summary, or payment reference
- Payments Manager includes a read-only payment evidence review section and reconciliation attention queue, both linking back to canonical Invoice Workspaces for any follow-through

Defined but not implemented yet:

- `Accounts Payable` is reserved for payable-side workflow such as bills due, outgoing payments, and vendor obligation management
- collector assignment, collection-note history, retries, refunds, disputes, provider sync execution, and accounting export/sync remain future work
- these routes and evidence surfaces do not add a new data system, reconciliation table, AR ledger, accounting subsystem, provider-operation workflow, or money-movement action

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

1. Future public acquisition through contractor-owned websites, SEO/service/location pages, landing pages, public forms, AI intake, attribution, reviews, galleries, or project proof where applicable
2. Future pre-lead visual/product/finish selection where applicable
3. Lead / Opportunity
4. Contact / customer qualification
5. Site assessment / inspection or customer-provided measurements and requirements
6. Customer
7. Project
8. Future takeoff / scope intelligence where plans, photos, and site data become reviewed quantities
9. Estimate
10. Portal estimate approval and approved snapshot creation
11. Contract
12. Change order when scope changes
13. Job execution / scheduling
14. Invoice
15. Payment and closeout

How this should be interpreted today:

- some of these steps already map cleanly to canonical records in the app
- some are operational stages that still need stronger UX guidance or status handling around the implemented readiness gate
- the system should preserve one continuous path rather than forcing users to decide between disconnected modules
- pre-lead visual/product/finish selection is future direction only and does not change the implemented canonical chain
- contractor-owned websites, public acquisition pages, SEO infrastructure, marketing attribution, public AI intake, generated website/content workflows, reviews, and galleries are future direction only unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says a specific slice is implemented

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

- Create: Internal contractor work items can be manually created and optionally linked to a canonical source record. The current contractor UI supports explicit creation from a lead workspace against the current opportunity, from an appointment workspace against the current appointment, from a project workspace against the current project or selected project-level human follow-up context such as open blocker field notes, and from estimate or invoice workspaces against the current record. Selected deterministic estimate/invoice operational cues can prefill source-locked work-item context, but the user must submit the form.

- Track: Work items store internal ownership, due date, priority, status, assigned person, source link, and safe metadata on `work_items`. Dashboard work-item visibility prefers the current user's linked active `people` record when available and falls back to open company work items when needed.

- Complete: Open work items can be completed or dismissed from the dashboard, lead workspace, appointment workspace, project workspace, estimate workspace, or invoice workspace. Completed/dismissed work items are not reopened in V1.

Boundary:

- Work items do not replace canonical opportunity follow-up fields, appointment statuses, notification events, automation runs, workflow error events, or the main lifecycle.
- Work items are internal-only and are not exposed to portal/customer users.
- No automated work-item generation, reminder delivery, provider send, autonomous AI action, or generic workflow engine is implemented.

### Operational Intelligence / My Work Cue Workflow

Implemented flow:

- Organization cue rules are persisted in `organization_operational_cue_rules`; cue instances are not persisted as business records.
- Cue response state is persisted in `workflow_cue_states` for deterministic cue identities. Absence of a row means active/visible; V1 exposes user-scoped dismiss and snooze only on contextual record/project cue surfaces.
- Organization responsibility defaults are persisted in `organization_responsibility_role_defaults`; they map the starter role strategies to active assignable People records, not directly to users and not to copied workflow records.
- Default rules are ensured server-side for `estimate_sent_followup`, `contract_sent_unsigned`, `contract_viewed_unsigned`, `invoice_overdue`, `deposit_invoice_unpaid`, `job_ready_unscheduled`, and `job_scheduled_missing_crew`.
- Contractor owners/admins can tune the built-in My Work cue rules at `/settings/operational-intelligence` by changing enabled state, threshold days, and urgency, and can configure company-level responsibility defaults for estimator, project manager, billing owner, and scheduler.
- Contractor owners/admins can tune workflow guidance and AI assistance controls at `/settings/workflows`. AI summaries, draft actions, dashboard digest visibility, and future provider-backed enhancement are stored in the existing organization workflow guidance preferences and do not create AI-only workflow records.
- Active organization members can read saved cue rules for derived My Work visibility, but manager/member settings navigation hides this admin route and cue-rule writes are blocked by owner/admin server action authorization plus owner/admin RLS policies.
- Active organization members can read saved responsibility defaults for cue display. Responsibility-default writes and clears are blocked by owner/admin server action authorization plus owner/admin RLS policies.
- Dashboard `My Work` derives grouped estimate, contract, invoice, and job cues from canonical records plus enabled organization rules, then applies any matching user-scoped cue suppression before display.
- Dashboard `My Work` has display-only queue modes:
  - Company shows all derived attention items visible to the organization and remains the safety net.
  - Mine shows cues resolved to the current app user or the current user's linked active Person.
  - Unresolved shows cues whose responsibility resolution is `strategy_only`, `organization_queue`, or `record_owner_unavailable`.
- Derived cue results include user-facing explanation/source fields so `My Work` and record-level panels can show which canonical date/status triggered the cue, which threshold was used, and whether a conservative fallback timestamp was used.
- Derived cue results include read-only responsible role strategy fields for the starter role set: `estimator`, `project_manager`, `billing_owner`, and `scheduler`. Current cue mapping is estimate follow-up -> estimator, contract signature follow-up -> project manager, invoice/deposit follow-up -> billing owner, and job schedule/crew follow-up -> scheduler.
- Derived cue results include a responsibility resolution object for display and future filtering. Starter strategies first resolve through organization responsibility defaults when a mapped person is active and assignable; if that person has `people.membership_user_id`, the linked app user id is derived for future filtering. Without a mapping, starter strategies fall back to the role label. `organization` resolves to the organization queue, and legacy `record_owner` resolves to an unavailable record-owner fallback.
- Project, estimate, contract, invoice, and job detail workspaces show compact `Needs Attention` panels using the same derived cue results and explanation/source details. Estimate, contract, invoice, and job detail panels filter to the current canonical record; project detail aggregates linked child-record cues by project id. Project Workspace guidance separates canonical workflow actions from human follow-up so users can distinguish existing record handoffs from user-confirmed work-item drafts. Project detail also shows an `Operational command center`, compact `Connected record lanes`, and a linked-record recency summary from existing canonical timestamps/statuses so the driving record, blockers, attached records, project-specific access, and recent linked-record changes are easier to scan without introducing a separate activity feed. Supported cues can be dismissed or snoozed for the current user from these contextual surfaces only.
- Cue rows link back to the canonical estimate, contract, invoice, job, or schedule action rather than creating a separate task surface. In record workspace contexts only, stale sent-estimate and past-due invoice cues can also open the existing internal work-item form with source-locked prefill; dashboard cues remain awareness and workflow-link surfaces in this pass.
- Disabled rules are suppressed during derivation; threshold and urgency changes affect the query-time cue results without persisting cue instances. Dismissed or snoozed rows suppress only matching fingerprints, so a material cue change reappears and expired snoozes become visible again.
- Company cue visibility remains organization-wide even when cues resolve to a responsible person or linked app user, and unresolved cues remain visible in Company. My Work queue modes do not add permissions or persisted selection. Project-level overrides and record-level overrides are deferred. `sales_owner` and `field_lead` are intentionally deferred.

Current canonical records involved:

- organization operational cue rules
- organization responsibility role defaults
- people
- estimates
- contracts
- invoices
- jobs
- projects
- job assignments

Boundary:

- Operational cues do not create or update estimates, contracts, invoices, jobs, projects, customers, payments, notifications, work items, automation runs, or communication records. Cue-to-work-item prefill only prepares the existing work-item form for user-confirmed submission. Cue-state controls only write response/visibility state.
- No `operational_cues` table, persisted cue instance lifecycle, task subsystem, project-level override, record-level override, dashboard cue mutation control, notification delivery, AI behavior, custom expression builder, or standalone task-management subsystem is implemented. Broad resolve remains deferred.
- Responsible role defaults and My Work queue modes are display/resolution metadata, not assignment state. Operational cues do not assign work to a person or user, create task records, or persist cue lifecycle state as business truth.
- Record-level Needs Attention panels are contextual views over derived cues only; they do not create separate workflow state or compete with project readiness/next-action guidance.
- Where a canonical timestamp is unavailable, derivation uses the existing conservative timestamp fallback documented in the cue reason/explanation instead of adding broad timing fields in this pass.

### Progress Billing Workflow

- Setup: SOV with % complete.

- Update: Mark complete, billed.

- Generate: G702/G703.

## Intended Workflow Direction

The intended near-term direction is not to invent a new business model. It is to tighten the already-implemented chain so the app behaves more like one guided contractor journey.

### Preferred UX Direction

The preferred contractor journey is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Customer/contact/access/review ownership is documented in [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md). In workflow terms, People owns contact identity, portal grants, temporary credential support, and project visibility administration through a focused access console; Customer Workspace summarizes the account relationship and links to People with customer context; Project Workspace summarizes project-specific visibility and readiness; Estimate, Contract, and Invoice Workspaces stay focused on proposal, signature, and billing review respectively; Portal pages stay customer-safe and action-oriented.

Record Workspace right rails should stay short and supportive. Primary project/customer/record context may stay visible, while revision history, metadata, extra linked records, manual payment entry, invoice editing, and lower-frequency operational context should be collapsed or linked unless that material is the current page's main job.

With supporting readiness stages between those records:

- future public acquisition
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
- current Project Workspace command-center, lane, and recency breadcrumbs are derived from existing linked records, timestamps, statuses, and project-specific portal visibility only; a full project activity/event timeline remains future work

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
- approved estimate snapshot editing is blocked from the Estimate Editor
- archived items are blocked from insertion, and systems continue through the existing system expansion flow using catalog/system component sources
- future catalog/cost item design should treat default cost, markup, labor, production, price, and tax behavior as internal cost behavior that can be overridden intentionally on an estimate and kept out of customer-facing output
- customer-facing estimates should show only customer-facing descriptions, quantities, unit prices, and totals; markup and internal cost should not appear on customer-facing estimate output
- one-off estimate-line price overrides should affect that estimate line, while catalog/cost item updates should affect future estimates only
- quick system generation now supports V1 manual measurements inside the existing Estimate Editor:
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
  - `/financials/accounts-receivable` is the read-only collections and payment-event review lens over canonical invoices/payments/payment events
  - `/financials/accounts-payable` is present only as a structure/spec placeholder in this pass
- `/people` remains the current workforce-oriented route, while a future `Directory` workspace is intended to unify contractor-facing account and contact browsing without changing the canonical data model underneath

That means FloorConnector is already operating on one shared business chain, even though some screens still expose the workflow in a more module-driven way than the intended product direction.

## Golden Workflow Demo Path

The Phase 1 demo spine is documented in [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md). It is the repeatable QA path through the existing implemented surfaces:

`dashboard -> lead/opportunity -> customer -> project -> estimate -> contract -> invoice/payment -> job -> schedule -> daily log`

Interpretation rules:

- the demo path uses the canonical lifecycle `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- Project Workspace remains the continuity hub and should be reopened between major stages to confirm the current next action and readiness state
- Estimate Workspace remains the proposal-first UI/workflow reference point
- contract signature, invoice/payment, schedule, and daily-log steps must act on existing canonical records and linked project/customer context
- Guided mode is the primary demo mode; Flexible and Manual checks may reduce coaching but must not hide financial, payment, signature, portal, readiness, or security truth
- a missing detail fixture, missing portal/customer session, or redirect to `/login` must be reported as skipped/blocked rather than treated as successful QA
- one-off/direct invoice behavior remains a planned follow-up and is not part of the Phase 1 demo path

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
