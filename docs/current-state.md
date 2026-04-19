# Current State

Status: implemented truth on the current working branch.

This document summarizes the current implemented architecture and feature foundation in the FloorConnector monorepo.

Use these docs together:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth and current branch reality
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

If this document conflicts with a planning, target-design, or historical document, trust this document for implemented status.

## Repository Shape

- Monorepo managed with `pnpm` and `turbo`
- Active product surface: `apps/web`
- Background/integration app reserved: `apps/worker`
- Shared packages currently used for config, types, domain logic, UI, database access, and integrations
- Supabase migrations live in `supabase/migrations`

## Current Architecture

FloorConnector is currently implemented as a modular monolith on a shared multi-tenant foundation.

Core architectural characteristics:
- Next.js App Router in `apps/web`
- Supabase for authentication, database access, and row-level-security-backed tenant isolation
- shared canonical business entities across modules
- organization-aware authorization and membership-based access
- server actions plus server-side data utilities for protected business workflows

Current shared canonical model includes:
- users/profile extension
- organizations
- memberships
- platform user roles
- people
- vendors
- compliance records
- time punch events
- time cards
- daily logs
- opportunities
- platform financial defaults
- platform workflow defaults
- organization financial settings
- organization workflow settings
- platform template seeds
- platform catalog item seeds
- document templates
- catalog items
- customers
- projects
- estimates
- estimate line items
- schedule of values
- schedule of value items
- jobs
- contracts
- invoices
- invoice line items
- payments

## Authentication

Authentication is real and already implemented with Supabase Auth.

Implemented auth capabilities:
- Google OAuth
- email/password signup
- email/password login
- sign out
- auth callback handling
- middleware-backed protected route enforcement
- authenticated redirect handling

Current auth routes:
- `/login`
- `/signup`
- `/forgot-password`
- `/update-password`
- `/auth/callback`

Compatibility aliases still exist:
- `/sign-in`
- `/sign-up`

Protected post-auth landing:
- `/dashboard`

## Multi-Tenant Foundation

Tenant isolation is already part of the working system.

Implemented tenant foundation:
- authenticated users bootstrap into the app data model on first entry
- first-time users receive:
  - profile record
  - organization/company record
  - owner membership
- repeat logins do not duplicate profile/org/membership records
- tenant-owned tables use Supabase RLS
- protected app queries are scoped to the active organization membership

Membership roles currently supported:
- `owner`
- `admin`
- `manager`
- `member`

## Protected App Shell

The protected contractor app shell is implemented and organization-aware.

Current shell behavior:
- shared protected layout for authenticated app routes
- top navigation
- sign out action
- current organization display
- organization-aware breadcrumbs
- role-aware navigation visibility
- the first major contractor workspace UI polish pass is now complete enough to stop and move on from
- shared detail-page/workspace pattern is now implemented across the main contractor record pages:
  - project detail is the reference workflow and readiness hub
  - estimate, contract, invoice, and job detail now broadly follow the same shared page language and point back to the project hub when broader handoff state matters
  - remaining UI issues are now iterative polish items rather than structural layout breaks

Current protected routes include:
- `/dashboard`
- `/leads`
- `/customers`
- `/projects`
- `/estimates`
- `/contracts`
- `/invoices`
- `/jobs`
- `/daily-logs`
- `/people`
- `/vendors`
- `/time`
- `/materials`
- `/settings`

Additional protected surfaces beyond the contractor app:
- `/portal` now has a real customer-facing shell and project-centered workspace foundation on top of canonical customer-anchored access control
- `/super-admin` now has a real modular configuration foundation

## Business Objects Implemented

### Leads / Opportunities

Implemented:
- organization-scoped opportunity schema
- create/list/read/update flows
- protected leads list page
- lead detail page
- site assessment scheduled/completed date capture on the canonical opportunity record
- requirements-summary capture on the canonical opportunity record
- canonical lead-to-estimate conversion flow that creates or links the downstream customer and project records as needed

Opportunity statuses currently implemented:
- `new`
- `contacted`
- `qualified`
- `site_assessment_scheduled`
- `site_assessment_complete`
- `estimating`
- `proposal_sent`
- `won`
- `lost`
- `converted`

Opportunities currently link to:
- optional customer
- optional project

Current opportunity design notes:
- opportunities are the canonical pre-project commercial record
- the protected leads surface now starts the contractor revenue path before a full project exists
- starting the estimate flow from an opportunity creates or links the canonical customer and project chain instead of introducing duplicate intake-specific entities
- site-assessment status and timestamps now live on the canonical opportunity record as upstream commercial-readiness foundation data
- requirements capture now lives on the same canonical opportunity and can seed project estimating context during handoff
- linked project readiness now refreshes when opportunity assessment state or requirements capture changes on an opportunity that is already connected to a project

### Customers

Implemented:
- organization-scoped customer schema
- create/list/read/update flows
- protected customers list page
- customer detail page

Starter fields include:
- name
- company name
- phone
- email
- address fields
- tax exemption status and metadata
- default retainage percentage
- notes
- timestamps

### Projects

Implemented:
- organization-scoped project schema
- create/list/read/update flows
- project-to-customer relationship
- protected projects list page
- project detail page
- project detail now surfaces linked lead assessment and requirements context when a canonical opportunity is connected
- project commercial-readiness sync foundation derived from contract, invoice, payment, financing, and workflow-setting state
- stored project readiness fields now refresh from upstream opportunity and estimate mutations instead of waiting for later downstream changes to resync them
- project detail now acts as the upstream sales-to-production readiness hub with blocker visibility, next-best-action guidance, and a derived ready-to-schedule handoff state
- estimate, contract, and invoice detail pages now point users back to the project readiness hub when the upstream handoff state matters
- the contractor app now has a defined reusable record-workspace direction: header, workflow summary, primary workspace, context rail, and lower-priority secondary sections
- project, estimate, contract, invoice, and job detail now all use that shared workspace pattern closely enough that the first major UI layout-system polish pass is considered complete

Starter fields include:
- name
- customer
- status
- commercial readiness status
- financing status
- ready-to-schedule timestamp foundation
- description
- location fields
- timestamps

### Portal Access

Implemented:
- organization-scoped canonical `portal_access_grants` foundation
- organization-scoped canonical `portal_project_access` foundation beneath the customer-level grant
- tenant-safe data access foundation for contractor-side portal access management
- authenticated-user portal access lookup foundation for customer-facing record loaders
- tenant-safe portal record loaders for canonical project, estimate, contract, and invoice review data
- lightweight `portal_record_views` audit foundation for customer-facing record visibility events
- contractor-side portal access management on customer detail for granting, reviewing, revoking, and project-scoping customer portal access

Starter fields include:
- canonical customer anchor
- authenticated user linkage
- invited email metadata
- invited, active, and revoked state
- activation and revocation timestamps
- explicit project visibility beneath the customer grant

Current portal access design notes:
- portal access is anchored to the canonical customer record instead of inventing a separate portal-customer model
- project visibility is explicitly granted beneath that customer access instead of exposing all tenant projects automatically
- portal read access now flows through the same canonical project, estimate, contract, and invoice records instead of portal-specific copies
- contractor admins now manage portal access from the canonical customer surface rather than a disconnected portal-contact subsystem
- the customer-facing portal now has a real protected shell, portal home workspace, and project-detail workspace built on that same scoped read layer
- customer-facing estimate, contract, and invoice review pages now exist inside the portal on top of the same tenant-safe canonical record loaders
- portal review remains read-first and customer-safe in this pass, with later signature and payment actions still intentionally out of scope

### People

Implemented:
- organization-scoped workforce person foundation
- shared canonical `people` model for internal employees and vendor-linked subcontractor workers
- tenant-safe list/read/create/update data access foundation
- optional linked application user foundation for workforce people who also have a platform login
- protected people list/create page
- protected person detail/edit page
- basic compliance visibility on people surfaces

Starter fields include:
- display name
- first and last name
- email
- phone
- person type
- job title
- trade
- classification
- vendor linkage for subcontractor workers
- assignable flag foundation
- active/inactive state
- notes
- timestamps

Current people design notes:
- employees and subcontractor workers now share one canonical people foundation instead of parallel employee and subcontractor person tables
- subcontractor workers link to vendor companies through `people.vendor_id`
- people surfaces now use the same protected CRUD pattern as other canonical admin records, with organization-member linkage and labor-provider vendor selection available in the form flow
- this is a workforce identity foundation only; crews, time, payroll, and scheduling still remain future work

### Vendors

Implemented:
- organization-scoped vendor and subcontractor company foundation
- tenant-safe list/read/create/update data access foundation
- labor-provider flag foundation for future subcontract labor assignment and time attribution
- protected vendors list/create page
- protected vendor detail/edit page
- basic linked-worker and compliance visibility on vendor surfaces

Starter fields include:
- name
- vendor type
- labor-provider flag
- primary contact name
- email
- phone
- address fields
- tax identifier last four
- active/inactive state
- notes
- timestamps

Current vendor design notes:
- vendor companies remain separate from people records
- subcontract labor can now be modeled as vendor company plus vendor-linked workforce people
- vendor detail now shows linked workforce people from the shared people model instead of inventing a vendor-specific worker table
- this is a canonical external company foundation, not a separate payroll or accounts-payable subsystem

### Compliance Records

Implemented:
- organization-scoped shared compliance and credential foundation
- shared canonical `compliance_records` model attachable to either workforce people or vendor companies
- tenant-safe list/read/create/update data access foundation
- future document-linkage hook on the compliance record without introducing a separate compliance-file subsystem yet

Supported record categories currently include:
- `license`
- `insurance`
- `certification`
- `training`
- `background_check`
- `other`

Starter fields include:
- subject type
- subject id
- name
- issuing authority
- reference number
- issued on
- expires on
- status
- optional future document file id hook
- notes
- timestamps

Compliance statuses currently implemented:
- `valid`
- `expiring`
- `expired`
- `missing_information`

Current compliance design notes:
- people and vendors are now the only canonical compliance attachment points for workforce participants and external companies
- insurance, certification, license, and training records extend the same shared compliance model instead of separate per-category silos
- subject existence is validated against the canonical people and vendors foundations in the tenant-scoped server data layer
- this is a shared tracking foundation only; alerts, renewal workflows, OCR, and jurisdiction-specific rule engines are not implemented yet

### Time Tracking

Implemented:
- organization-scoped canonical `time_punch_events` foundation
- organization-scoped derived `time_cards` foundation
- tenant-safe list/read/create data access foundation for time punches and derived time cards
- centralized time-card derivation utility built from punch events
- active-person validation and project or job consistency enforcement in the server data layer
- future-ready location capture hooks on punch events
- protected time capture page with punch-in, punch-out, break-start, and break-end actions
- current punch-state visibility for open sessions
- protected time-card review list and detail flow
- project and job detail pages now surface basic linked labor and time context
- project/date time-card query helpers now support field-execution labor continuity without duplicating time persistence

Supported punch event types currently include:
- `punch_in`
- `punch_out`
- `break_start`
- `break_end`

Starter attribution and location fields include:
- person
- project
- optional job
- occurred at
- source
- latitude
- longitude
- accuracy meters
- location capture method
- optional geofence snapshot
- optional superseded event linkage

Current time tracking design notes:
- punch events are the canonical source of truth for workforce time capture
- time cards are derived operational summaries and not the authoritative audit source
- punch recording currently enforces active-person constraints before time can be captured
- when a job is supplied, it must belong to the selected project; if only a job is supplied, the project attribution is normalized from the job
- contractor-side time capture remains intentionally minimal and operational, focused on auditable event capture and review rather than payroll, scheduling, or daily field reporting
- geofencing, background location tracking, payroll, and approval workflows are not implemented yet

### Daily Logs

Implemented:
- organization-scoped canonical `daily_logs` foundation
- project-level daily execution record with optional dominant job linkage
- tenant-safe list/read/create/update data access foundation
- project/date uniqueness foundation so one canonical log exists per project per day
- practical execution-summary fields for work completed, planned next, blockers, safety notes, and weather snapshot starter fields
- derived daily-log labor summary utilities built from canonical `time_cards` by project/date
- protected daily-log list/create page
- protected daily-log detail/edit page using the shared contractor workspace pattern
- project and job detail surfaces now show linked daily execution context where useful
- lightweight execution-attachment visibility on the daily-log detail workflow

Daily log statuses currently implemented:
- `draft`
- `finalized`

Starter fields currently include:
- project
- optional job
- log date
- summary
- work completed
- work planned next
- delays or blockers
- safety notes
- weather summary
- weather conditions
- temperature high and low
- created by / updated by
- timestamps

Current daily log design notes:
- daily logs are project-centered execution records and not a separate field-report subsystem
- one canonical daily log currently exists per project and date, with optional job context when one job dominates the day
- job linkage is validated against the selected project in the tenant-scoped server data layer
- labor continuity now reads through canonical time cards for the same project and log date instead of persisting a second daily-log labor-entry model
- contractor-side daily-log UX now keeps create, review, editing, and note entry on the same protected workflow instead of splitting execution observations into separate modules
- daily-log execution attachments are now lightweight subject-scoped references for photos or files, not a full document-management system

### Field Notes

Implemented:
- organization-scoped canonical `field_notes` foundation
- field notes now require a canonical parent `daily_log`
- tenant-safe list/read/create/update data access foundation
- optional linkage to project-related execution context such as job, workforce person, and time card
- structured note type and simple status foundation for blockers, issues, and punch-list-ready observations without separate subsystem tables
- field-note create and edit UX inside the daily-log detail workflow
- field-note attachment visibility and add-attachment flow inside the same daily-log workflow

Supported field note types currently include:
- `general`
- `labor`
- `material`
- `equipment`
- `blocker`
- `issue`
- `punch_list`

Field note statuses currently implemented:
- `open`
- `noted`
- `resolved`

Field note visibility currently implemented:
- `internal`

Starter fields currently include:
- daily log
- project
- optional job
- optional person
- optional time card
- note type
- title
- body
- status
- visibility
- created by / updated by
- timestamps

Current field note design notes:
- field notes are the canonical execution observation model under daily logs and should absorb issue, blocker, and punch-list-ready scaffolding instead of spawning separate tables
- field note project linkage must match the selected daily log, and optional job linkage must belong to the same project
- optional time card linkage is validated against the same project and log date, and also respects selected person/job linkage when provided
- optional person and time-card linkage now works as the intended bridge between field observations and canonical labor records when execution notes need that context
- field notes currently stay inside the daily-log workflow rather than branching into standalone issue, blocker, or punch-list surfaces
- field-note attachments use the same shared execution-attachment foundation as daily-log attachments instead of spawning note-specific file models
- customer-facing field note visibility and broader execution workflows remain future work

### Execution Attachments

Implemented:
- organization-scoped canonical `execution_attachments` foundation
- shared attachment linkage limited to:
  - `daily_log`
  - `field_note`
- tenant-safe list/create data access foundation
- protected daily-log and field-note attachment visibility inside the daily-log workspace

Supported attachment subject types currently include:
- `daily_log`
- `field_note`

Supported attachment types currently include:
- `photo`
- `file`

Starter fields currently include:
- subject type
- subject id
- attachment type
- storage path / file reference
- file name
- mime type
- optional caption
- uploaded by
- timestamps

Current execution attachment design notes:
- execution attachments are lightweight subject-scoped references for field evidence and context, not a full managed file subsystem
- attachments currently hang directly off canonical daily logs or field notes instead of separate issue, blocker, or punch-list entities
- customer-facing sharing, markup, and broad file-management workflows are not implemented in this pass

Financing statuses currently implemented:
- `not_applicable`
- `offered`
- `prequalified`
- `pending`
- `approved`
- `declined`

### Estimates

Implemented:
- organization-scoped estimate schema
- create/list/read/update flows
- project-to-estimate relationship
- customer derived from project
- proposal-style estimate detail page
- dedicated estimate edit page
- status transition actions
- estimate detail now surfaces project-level readiness context and a clearer preferred next action instead of implying older parallel downstream shortcuts

Estimate statuses currently implemented:
- `draft`
- `sent`
- `approved`
- `rejected`

### Estimate Line Items

Implemented:
- estimate line item schema
- line-item-based estimate editor
- add/edit/remove line items
- database-calculated subtotal and total logic
- tax and discount support
- approved-estimate-triggered schedule-of-values seeding foundation

Estimate totals are currently derived from:
- line item totals
- tax amount
- discount amount

### Jobs

Implemented:
- organization-scoped jobs/work orders schema
- create/list/read/update flows
- protected jobs list page
- job detail page
- create-job flow from project
- create-job flow from approved estimate
- create-job enforcement now requires the connected project to be ready to schedule before downstream work can be created
- job reassignment now applies the same ready-to-schedule gate before an existing job can be moved onto a different project

Job statuses currently implemented:
- `unscheduled`
- `scheduled`
- `in_progress`
- `completed`
- `canceled`

Jobs currently link to:
- project
- customer
- optional approved estimate

### Invoices

Implemented:
- organization-scoped invoice schema
- create/list/read/update flows
- protected invoices list page
- invoice detail page
- create-invoice flow from project
- create-invoice flow from approved estimate
- create-invoice flow from job
- line-item-based invoice editor
- invoice-linked payment recording foundation
- org financial setting aware tax and retainage scaffolding
- reporting-ready taxable/exempt/tax-collected foundations
- shared template reference foundation
- canonical invoice workflow roles for standard billing and upstream deposit-readiness requests

Invoice statuses currently implemented:
- `draft`
- `sent`
- `partially_paid`
- `paid`
- `void`

Invoices currently link to:
- project
- customer
- optional approved estimate
- optional job

Current invoice design notes:
- invoices remain canonical financial records rather than an isolated module model
- customer and project context stay linked through existing shared entities
- `billing_model` is included so future AIA/progress billing can extend the same canonical invoice header without replacing v1
- `workflow_role` is now included so deposit-readiness and standard invoicing can extend the same canonical invoice record
- deposit requests stay on the same canonical invoice and payment chain rather than becoming a separate deposit model
- standard invoices without downstream job context are now blocked until the project completes contract, signature, and deposit or financing readiness through the commercial handoff
- invoice tax, exemption, and retainage values are snapshotted on the invoice so later customer/org setting changes do not break reporting history

Invoice workflow roles currently implemented:
- `standard`
- `deposit`

### Invoice Line Items

Implemented:
- invoice line item schema
- add/edit/remove line item UI inside invoice create and detail flows
- database-calculated invoice subtotal and total logic

Invoice totals are currently derived from:
- line item totals
- org tax defaults plus customer exemption snapshots
- discount amount
- retainage held amount

### Payments

Implemented:
- canonical payment schema linked directly to invoices
- basic payment recording flow from invoice detail
- automatic invoice balance due updates from recorded payments
- automatic `partially_paid` and `paid` invoice status handling
- canonical online-payment foundation on `payments` for future customer-portal and gateway-backed payment actions
- immutable `payment_events` audit foundation for payment request, checkout, success, failure, void, and provider-sync lifecycle events
- tenant-safe payment workflow helpers for payment request, checkout start, payment success, payment failure, and payment voiding on the same canonical invoice/payment chain
- successful customer-facing payment workflow events now create or finalize canonical `payments` rows instead of introducing a second checkout or portal-payment model
- project commercial-readiness sync continues to flow from canonical invoice/payment status after successful payment finalization or payment voiding
- contractor-side invoice detail now surfaces online-payment readiness, recent payment-event signals, and customer-facing payment continuity without leaving the canonical invoice workspace
- contractor-side project detail now reflects deposit and invoice payment outcomes more clearly in readiness guidance and linked invoice summaries

Payment design notes:
- payment records remain invoice-linked and organization-scoped
- future online payments extend the canonical payment record rather than create a second payment model
- provider-specific transaction references now belong primarily on canonical `payments` and immutable `payment_events`, not on a duplicate portal billing model and not as broad duplicated invoice fields
- recorded payments on deposit-role invoices can now feed project commercial-readiness status through shared readiness utilities

### Financial Settings, Tax, And AIA Scaffolding

Implemented:
- organization-level financial settings foundation for default tax rate and tax behavior
- organization-level retainage baseline used to prefill new customer defaults
- customer-level tax exemption and exemption metadata
- customer-level retainage default
- invoice tax reporting view foundation for taxable sales, exempt sales, tax collected, and reporting-period grouping
- schedule-of-values foundation derived from approved estimate line items

Current design notes:
- external tax providers are not integrated yet, but the organization financial settings model includes extension points for them
- schedule-of-values records stay linked to approved estimate items instead of creating disconnected AIA-only source data
- percent complete, prior billed, current billed, retainage held, and retainage release are scaffolded in the SOV layer for future pay-application workflows

### Shared Templates

Implemented:
- shared organization-scoped `document_templates` foundation for estimate, invoice, and contract workflows
- platform-managed template seed definitions that can be copied into contractor organizations as editable tenant-owned templates
- contractor-side settings UI for adopting, editing, archiving, and defaulting organization-owned estimate, invoice, and contract templates
- shared merge-data preparation utilities for organization, customer, project, estimate, invoice, and contract-generation contexts
- default-template resolution helpers for estimate, invoice, and contract workflows

Current design notes:
- organization templates are editable copies and do not stay coupled to a mutable global platform template record
- estimate and invoice records now support optional shared template references instead of module-specific template models
- contract template generation is shared through the same template and merge-data foundation

### Catalogs And Reusable Items

Implemented:
- platform-scoped starter catalog item seeds for materials, services, and systems
- organization-scoped reusable catalog item records
- contractor-side adoption of platform starter items into organization-owned copies
- organization-side editing, defaulting, and archiving of reusable catalog items

Current design notes:
- organizations do not depend on one mutable global starter item after adoption
- reusable items stay on the same canonical foundation instead of spawning module-specific catalog silos
- current catalog management is foundation-first and intended to support later estimate, invoice, and execution reuse

### Contracts

Implemented:
- organization-scoped contract schema
- contract generation from approved estimate and project context
- organization-scoped approved-estimate contract template assignment in contractor settings
- protected contracts list page
- contractor-side contract detail/review page
- lightweight draft contract editing flow
- shared-template-backed rendered contract content
- canonical contract status lifecycle scaffolding
- contract revision snapshot foundation for pre-sign edits
- signature-started lock behavior scaffold
- internal approval actions and send-readiness enforcement on canonical contract drafts
- canonical contract signature-state foundation fields on the existing `contracts` record
- supporting `contract_signers` workflow foundation for signer-role modeling
- supporting immutable `contract_signature_events` audit foundation for signature lifecycle history
- tenant-safe server-side signature workflow helpers for send, customer-viewed, customer-signed, customer-declined, optional contractor countersign, and signature void/completion state updates on the same canonical contract

Contract statuses currently implemented:
- `draft`
- `sent`
- `viewed`
- `signed`
- `void`

Contracts currently link to:
- project
- customer
- optional approved estimate
- shared document template

Current contract design notes:
- contracts are canonical records, not detached documents
- contract rendering is generated from the shared template system and canonical merge data
- contractor organizations can now set an approved-estimate contract template preference without forking a separate contract-template silo
- signed contracts remain connected to the same estimate and project context used for downstream billing workflows
- contract content may be lightly edited while still in draft
- once signature activity begins, unrestricted editing is locked on the canonical contract record
- contract internal-approval status and signature-readiness status now live on the canonical contract record as upstream commercial-readiness foundation data
- when internal approval is required, draft edits reset the contract back to pending approval before send
- contractor-side send progression is now blocked until required internal approval is complete
- contract signature foundation now extends the same canonical contract record with customer-view, customer-sign, countersign, decline, and void timestamps instead of creating a second signed-document model
- signer-role routing now lives in supporting `contract_signers` rows, while the canonical `contracts` row remains the business-truth record for workflow and readiness
- immutable signature history now lives in supporting `contract_signature_events` rows attached to the same contract
- send-for-signature now creates signer routing and immutable signature-request events instead of relying only on manual status changes
- customer view, sign, decline, and optional contractor countersign now progress through signer-state validation and immutable signature events before the canonical contract reaches final `signed` state
- contractor-side contract detail now includes explicit send-for-signature controls with customer portal signer selection and optional contractor countersigner assignment
- contractor-side contract detail now surfaces canonical signature-state timestamps, signer routing/status visibility, and recent immutable signature events inside the existing contract workspace
- contractor-side countersign now has a dedicated workspace action when the signed customer contract is waiting on the assigned organization signer
- portal contract review now supports customer-facing signature-state visibility, signer visibility, and customer sign/decline actions on the same canonical contract record through tenant-safe portal scope
- project readiness and portal project continuity now react to canonical signed-contract outcomes so signature completion changes the next visible commercial step instead of staying isolated on the contract page
- contractor project detail now surfaces latest contract signature handoff summary alongside the readiness hub
- portal project workspace now reflects signed-contract completion in project guidance and contract summaries before later payment work is introduced
- future e-sign integrations are expected to attach provider metadata and provider lifecycle events to the same contract foundation rather than creating a separate signed-document silo

## Current Workflow Coverage

The implemented canonical flow currently spans:
- opportunities or leads -> customers -> projects -> estimates -> contracts -> jobs -> invoices -> payments

The current implemented workflow foundation supports:
- user authentication into a protected contractor app
- automatic first-user tenant bootstrap
- lead and opportunity intake
- site assessment scheduling/completion capture on the canonical opportunity
- requirements capture on the canonical opportunity before estimate handoff
- canonical lead-to-estimate handoff through customer and project creation/linking
- seeding project estimating context from opportunity requirements when the estimate flow starts
- customer management
- project management
- estimate authoring with line items and totals
- estimate proposal review and status progression
- estimate create, update, and status transitions now refresh the linked project's stored commercial-readiness fields, including project reassignment during estimate updates
- approved-estimate-to-contract generation and pre-sign contract editing
- required internal contract approval and send-readiness gating on draft contracts
- server-side canonical contract signature workflow progression with signer/event updates on the shared contract model
- project-detail readiness hub for the upstream commercial chain with blockers, next action, and ready-to-schedule handoff visibility
- downstream job creation now respects the canonical ready-to-schedule gate instead of relying only on estimate approval
- downstream job reassignment now respects the same canonical ready-to-schedule gate instead of allowing a later project move to bypass the handoff rule
- conversion of approved or project-based work into jobs/work orders
- job progression through execution states
- invoice creation and maintenance from connected project, estimate, and job records
- standard invoice creation without a job now respects the commercial handoff gate instead of bypassing contract-signature and deposit or financing readiness
- invoice line-item-based totals
- payment recording with invoice balance and paid-state recalculation
- tax-aware invoice calculation using org defaults and customer exemption state
- retainage-aware invoice balance foundation
- approved estimate item seeding for future AIA/progress billing
- shared template selection and merge-data preparation for estimate, invoice, and contract document workflows
- canonical rendered contract records with revision snapshots and signature-lock scaffolding
- canonical contract signature-state, signer, and immutable signature-event foundation on the shared contract model
- canonical contract signature workflow helpers that keep send, customer signature progression, optional countersign, and readiness sync on the same contract record
- shared commercial-readiness foundation fields across opportunities, projects, contracts, invoices, and organization workflow settings
- project commercial-readiness sync from signed-contract, deposit-readiness, financing-status, and recorded-payment state

## What Exists But Is Still Minimal

These surfaces exist but are still foundational rather than production-complete:
- dashboard
- materials
- jobs/work-order execution UX
- proposal review/share UX
- project workspace structure
- customer portal review workflows

### Contractor Settings / Admin

Implemented:
- modular contractor-side organization settings surface with sections for:
  - organization profile/settings
  - document templates
  - catalogs/master data
  - financial defaults
  - workflow defaults
  - organization admin
  - module controls
- organization-scoped tax behavior and tax rate management
- organization-scoped retainage baseline for new customer creation and lead conversion
- contractor-side workflow defaults for approved-estimate contract template assignment
- stored contractor preferences for internal contract approval, signed-contract readiness, deposit-before-scheduling readiness, and financing-approval readiness
- organization-scoped reusable catalog item management
- organization member role management
- organization-level feature override storage within the shared platform feature policy model

Current design notes:
- this is a contractor organization settings surface, separate from platform super-admin controls
- shared templates remain on one canonical template system across estimates, invoices, and contracts
- contract approval, signature, deposit, and financing readiness preferences are stored canonically now even though deeper enforcement UX is still future work
- contractor organizations adopt platform defaults into tenant-owned copies or tenant-scoped settings where applicable

### Super Admin

Implemented:
- modular super-admin surface with sections for:
  - overview
  - platform defaults
  - starter templates
  - starter catalogs
  - module controls
  - platform admin and tenant oversight
- platform-level financial defaults
- platform-level workflow defaults
- platform-owned starter template management
- platform-owned starter catalog seed management
- platform-level feature policy management
- platform admin assignment foundation
- tenant lifecycle/status administration foundation

Current design notes:
- super admin is the source of truth for platform-wide defaults and system controls
- contractor organizations remain isolated and own their copies after adoption
- platform admin uses a separate platform-role assignment layer instead of piggybacking on tenant membership roles
- platform workflow defaults now include signature-readiness and financing-readiness baselines that tenant workflow settings can inherit
- the super-admin surface is now implemented as a real configuration foundation, but deeper enforcement, entitlements, and broader platform governance workflows are still future work

## What Is Not Implemented Yet

Not implemented yet:
- full scheduling/calendar system
- crew assignment
- notifications
- PDF generation
- e-signature
- external payment gateway flows
- billing/subscriptions
- customer-facing online payment actions
- advanced permissions UI
- full AIA/progress billing UX
- external tax provider integration
- rich template editing UI
- e-sign integration workflows on top of the canonical contract record
