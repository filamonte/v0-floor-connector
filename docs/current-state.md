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
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md): mandatory UI and module implementation rules

All future UI and module work must follow `docs/floorconnector-ui-build-rules.md` before implementation.
That includes all future module workspace standardization work, which should align to the shared `StandardWorkspaceLayout` and the documented workspace/sidebar rules there.

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
- punchlist items
- appointments
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
- change orders
- schedule of values
- schedule of value items
- jobs
- contracts
- invoices
- invoice line items
- estimate customer events
- notification events
- notifications
- notification deliveries
- communication threads
- communication messages
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
- top-level navigation is now the primary contractor app navigation
- sign out action
- current organization display
- tenant-configurable logo support on the shared organization profile, with contractor-shell brand navigation now returning to `/dashboard`
- organization-aware breadcrumbs
- role-aware navigation visibility
- wider main workspace and calmer dashboard-first shell framing
- flattened shell/header chrome with one shared contractor header system instead of competing stacked header layers
- shared breadcrumb and page-context continuity now live inside the unified top header structure instead of a separate colored band beneath navigation
- the contractor shell and shared manager-page wrappers now use the same warmer charcoal/orange/light-neutral theme direction as the dashboard instead of the older blue-heavy overview styling
- shared contractor manager-page wrapper and command-bar pattern now drive the main overview surfaces
- the always-on left sidebar is no longer the primary navigation pattern
- left-side navigation is now reserved for contextual workspace use where needed inside deeper screens
- the first major contractor workspace UI normalization and polish pass is now complete enough to stop and move on from
- dashboard, projects, leads, invoices, contracts, customers, estimates, appointments, daily logs, time, people, vendors, and jobs now follow the shared contractor manager rhythm closely enough that it should be treated as the active UI baseline
- a first shared universal-create launcher now exists in the shell and dashboard, routing into the existing module quick-create managers so new canonical records can be started broadly without creating a second creation system
- a first real contractor-side global search now exists at the shared shell level:
  - one shared search entry point for contractor users
  - rendered in the shared contractor shell footer instead of the top header
- tenant-safe search across canonical opportunities, customers, projects, appointments, estimates, contracts, invoices, jobs, punchlist items, payments, people, and vendors
  - grouped result sets that route straight into the existing record workspaces or linked invoice workspace for payment activity
- a first real contractor-side notifications layer now exists in the shared shell and dashboard:
  - derived from canonical jobs, invoices, contracts, appointments, punchlists, progress billing, estimate customer activity, and communication activity
  - backed by stored `notification_events`, per-user `notifications`, and channel-aware `notification_deliveries`
  - routes into real downstream workspaces instead of introducing duplicate business records
- shared detail-page/workspace pattern is now implemented across the main contractor record pages:
  - project detail is the reference workflow and readiness hub
  - estimate, contract, invoice, and job detail now broadly follow the same shared page language and point back to the project hub when broader handoff state matters
  - remaining UI issues are now iterative polish items rather than structural layout breaks
- first-login onboarding readiness has been polished without adding schema or new workflow logic:
  - dashboard now shows a lightweight `Start here` setup guide until settings, the first customer, the first project, and the first estimate are present
  - dashboard links now route to the current canonical `/leads` and `/appointments` surfaces
  - first-empty states on leads, customers, projects, and estimates now include direct quick-create actions and clearer "create your first..." guidance
  - quick-create remains the existing canonical-record-first path and still hands off into the full workspace

### Contractor UI System

Implemented contractor UI direction now includes:
- top-nav-first navigation as the default contractor app model
- one flattened shell/header system with breadcrumb and page context folded into the same top header instead of a permanent left-nav-plus-header stack
- thinner command/search strips beneath page identity on manager surfaces
- dashboard as a denser and more curated operational command-center surface with modular queue widgets, stronger quick-create entry, and continuity back into shared records instead of a loose summary page
- dashboard validation polish now promotes canonical attention items, open estimates, unpaid invoices, upcoming appointments, leads, active projects, and today/live jobs near the top of the home board without introducing fake dashboard data
- early module-dashboard direction on top of the same shared manager-page system, with estimates and invoices now reading more like operational entry surfaces than plain lists
- manager pages built around:
  - page identity
  - command bar
  - overview/list workspace
- shared composer-sheet pattern for create flows on the main contractor manager pages instead of permanently open create forms
- quick-create overlays are now the default contractor manager create behavior where appropriate:
  - collect minimum required fields only
  - create the canonical record first
  - route directly into the full record workspace for complete editing
- estimate quick-create now starts from customer/account and project context; optional opportunity selection is treated as upstream continuity, and project-launched handoff derives the customer before creating the estimate
- lead and project estimate handoff links now preserve an existing linked opportunity id when available so Add Estimate can reuse upstream continuity instead of creating duplicate opportunity context
- estimate quick-create now also reuses an existing opportunity already linked to the selected customer project when `/estimates` starts from a customer/project selection without an explicit opportunity, preventing duplicate upstream opportunity context for the same project
- seed-free estimate QA tightened the customer workspace so related contacts and portal access reads degrade safely against older local schema caches, and customer detail now shows connected estimate rows in addition to the estimate count
- the shell and dashboard now expose a shared universal-create launcher that deep-links into those existing quick-create overlays across the canonical workflow

Current contractor UI design notes:
- the dashboard is now the visual reference point for the contractor app shell and manager-surface language
- the dashboard now reads more like a contractor home base than a light summary page:
  - compact priority metrics
  - modular commercial, operations, and finance queues
  - local quick-create studio using canonical short-form create flows
  - stronger black/orange-inspired contractor styling scoped to the dashboard surface
- that dashboard/header direction is now pushed more broadly through the protected contractor app:
  - shared manager-page headers and command bars
  - shared quick-create/composer surfaces
  - shared settings and linked-record cards
  - shared overview/detail typography and surface treatment
- the active contractor-app theme direction is now:
  - charcoal or dark-neutral framing where framing helps
  - orange for actions, emphasis, and UI identity
  - white or light-neutral surfaces for primary reading and work areas
  - tighter, more practical spacing and typography across manager screens
- the contractor header is now also the shared home for global record search, so search should be treated as shell-level continuity into canonical records rather than as a dashboard-only or module-local widget
- overview pages should read as operational manager screens rather than dense admin tables or stacked forms
- deeper record pages may still use contextual side navigation where it helps, but overview navigation should remain top-nav-first
- dashboards should act as entry surfaces into the shared lifecycle, not as separate module worlds
- the current contractor UI direction should now be treated as implemented truth, not as an experimental branch of the product
- the contractor UI normalization phase is now complete enough to stop; future contractor UI work should start from this baseline instead of reopening the core shell and manager-page system
- the contractor-facing app is now coherent enough for broader testing, with remaining issues understood as polish and density work rather than structural UI drift

Current protected routes include:
- `/dashboard`
- `/financials`
- `/leads`
- `/customers`
- `/projects`
- `/estimates`
- `/change-orders`
- `/contracts`
- `/invoices`
- `/payments`
- `/reports`
- `/progress-billing`
- `/schedule`
- `/communications`
- `/appointments`
- `/jobs`
- `/punchlists`
- `/daily-logs`
- `/directory`
- `/people`
- `/vendors`
- `/time`
- `/materials`
- `/settings`

Current route-language note:
- `/people` is still the implemented workforce-oriented route today
- the future contractor-facing direction is a broader `Directory` workspace that can unify customer accounts, related contacts, workforce records, vendors, and other contact-like entries at the view layer
- that future Directory direction does not change the current canonical model in this pass
- `/directory` now exists as a read-only unified contractor-facing view over canonical customers, related customer contacts, people, vendors, and opportunities, while each row still routes into its existing canonical workspace
- the customer, person, vendor, and lead detail pages now include compact Directory-context handoff cards so users can jump back to the read-only index without weakening those canonical detail workspaces as the editing and workflow homes
- Directory customer-contact rows now describe linked portal grants and contact-level permissions as managed on the parent customer detail page instead of presenting portal linkage as future-only

### Module Home Standard

Implemented now:
- major sections can introduce a canonical Module Home route that acts as the control-panel entry point for the domain without creating a second app shell
- `/financials` is now the implemented Financials Home route
- Financials Home is intentionally summary-first and routing-first:
  - overdue invoices
  - recent payments
  - open receivables
  - quick links into invoices, payments, and adjacent financial workspaces
- the route reuses the existing canonical invoice and payment data loaders and does not introduce a new finance data model
- `/reports` now exists as the first internal-beta reporting basics surface
- Reports Home is read-only and intentionally narrow:
  - lead pipeline summary by canonical opportunity status
  - estimate summary by canonical estimate status
  - invoice summary and aging from canonical invoice balances and due dates
  - recent payment activity from canonical payment records
  - project readiness blocker visibility from canonical project readiness fields
  - Sales Tax Summary from canonical invoice tax reporting snapshots
- the route uses server-side tenant-scoped loaders over `opportunities`, `estimates`, `invoices`, `payments`, `projects`, and `invoice_tax_reporting_entries`
- Sales Tax Summary uses invoice issue-date filtering, reports taxable sales, exempt sales, tax collected, invoice count, invoice/payment status context, and customer exemption snapshot visibility, with every row linking back to the canonical invoice
- `/reports` does not create reporting tables, snapshots, exports, charts, mutations, filing workflows, tax-provider integrations, or a separate analytics model

Defined but still foundation-only:
- `/financials/accounts-receivable` exists as a purpose-defined placeholder for future collections, follow-up, aging, and receivable management work
- `/financials/accounts-payable` exists as a purpose-defined placeholder for future vendor-bill and outgoing-payment workflows
- AR and AP are structure/spec routes only in this pass:
  - no new schema
  - no new aging engine
  - no payable-side ledger or reporting engine

Additional protected surfaces beyond the contractor app:
- `/portal` now has a real customer-facing shell and project-centered workspace foundation on top of canonical customer-anchored access control, with branded header navigation returning to `/portal`
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
- customer detail now includes a compact `Contacts` management section over canonical `contacts` and `customer_contacts`
- contractor admins can now add related customer contacts, edit their basic contact details, and designate one main contact from customer detail
- `/directory` now also surfaces those related customer contacts as read-only `Customer Contact` entries that route back to the parent customer detail page
- customer detail and Directory now also show portal-readiness and permission context for related customer contacts:
  - whether the contact has an email
  - whether the contact is the main contact
  - whether a linked-contact portal grant has stored permission flags available for enforced actions
- customer detail portal access now also shows whether an existing grant is still customer-level or linked to one canonical related customer contact
- linked-contact portal grants now also store customer-contact portal permissions and allow contractor-admin editing from customer detail
- linked-contact portal grants now also enforce stored permissions for portal estimate approve/reject, change-order approve/reject, and contract sign/decline actions
- null-contact customer-level grants still continue to use legacy portal behavior during this first enforcement rollout

Current customer-account guardrails:
- `customers` remain the canonical customer/account records for commercial and financial workflows
- customer entries that later appear inside a unified contractor `Directory` should still be those full canonical customer/account records, not lightweight contact cards
- estimate send, invoice recipient, contract customer context, payment/billing context, and project ownership should continue to read canonical customer/account fields by default
- additional customer contacts are related contacts beneath the canonical customer/account and do not replace it
- `customers.email` still remains the account-level estimate, contract, and invoice recipient source of truth in this phase

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
- project creation now supports either selecting an existing canonical customer or creating a new canonical customer inline from the same project flow
- project detail page
- project detail now surfaces linked lead assessment and requirements context when a canonical opportunity is connected
- project commercial-readiness sync foundation derived from contract, invoice, payment, financing, and workflow-setting state
- stored project readiness fields now refresh from upstream opportunity and estimate mutations instead of waiting for later downstream changes to resync them
- project detail now acts as the upstream sales-to-production readiness hub with blocker visibility, next-best-action guidance, and a derived ready-to-schedule handoff state
- project detail next-action guidance now distinguishes draft/sent/rejected/approved estimate states, contract draft/signature states, deposit readiness, pending change orders, job scheduling, completed-work invoicing, and open invoice/payment follow-up using existing canonical records only
- project detail completed-job invoice actions now preserve the canonical `jobId` when handing off to invoice quick-create, and active job follow-up routes through `/jobs?projectId=...` so the project context is not lost
- estimate, contract, and invoice detail pages now point users back to the project readiness hub when the upstream handoff state matters
- the contractor app now has a defined reusable record-workspace direction: header, workflow summary, primary workspace, context rail, and lower-priority secondary sections
- project, estimate, contract, invoice, and job detail now all use that shared workspace pattern closely enough that the first major UI layout-system polish pass is considered complete
- dashboard, leads, estimate detail, and project detail now normalize the phase-one lead-to-invoice CTA vocabulary around `Start estimate`, `Send estimate`, `Approve estimate`, `Generate contract`, `Open progress billing`, and `Create invoice` without changing workflow logic
- project detail now surfaces linked appointments so project-facing visits and customer coordination stay visible on the same operational root without becoming a second scheduler
- project detail now also includes a compact production-schedule context card derived from canonical jobs and job assignments, surfacing scheduled, unscheduled, and in-progress counts plus next schedule continuity while handing calendar work back to `/schedule`
- customer detail now also includes a compact production-schedule context card derived from canonical customer projects, jobs, and job assignments, surfacing customer-level job counts, next scheduled continuity, crew-state visibility, and project-aware handoff back into `/schedule`
- estimate detail now also includes a compact schedule-handoff context card that stays blocked for non-approved estimates and, once approved, derives project-level production counts, next scheduled continuity, and crew-state visibility only from canonical estimate `projectId`, project jobs, and job assignments
- contract detail now also includes a compact schedule-handoff context card derived only from canonical contract `projectId` plus canonical jobs and job assignments, surfacing project-level production counts, next scheduled continuity, and crew-state visibility without changing contract workflow or creating a contract-schedule bridge model
- invoice detail now also includes a compact linked-schedule context card derived only from canonical invoice `projectId` / optional `jobId` links plus canonical jobs and job assignments, surfacing linked-job or project-level production state without changing billing lineage

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
- nullable `portal_access_grants.customer_contact_id` support for optionally linking a grant to one canonical `customer_contacts` row
- tenant-scoped canonical `customer_contact_portal_permissions` foundation attached to linked `customer_contacts`
- organization-scoped canonical `portal_project_access` foundation beneath the customer-level grant
- tenant-safe data access foundation for contractor-side portal access management
- authenticated-user portal access lookup foundation for customer-facing record loaders
- tenant-safe portal record loaders for canonical project, estimate, contract, and invoice review data
- lightweight `portal_record_views` audit foundation for customer-facing record visibility events
- contractor-side portal access management on customer detail for granting, linking, reviewing, revoking, and project-scoping customer portal access
- contractor-side portal invite creation from customer detail now supports pending project-scoped invites for customer/contact emails that do not yet belong to an authenticated FloorConnector user
- `/portal/invite?token=...` validates a hashed invite token, shows customer-safe customer/project context, sends users through the existing login/signup flow, and activates the canonical portal grant only when the authenticated email matches the invite
- customer detail now also shows stored linked-contact permission readiness, including the supported customer-facing permission set
- customer detail now also stores and edits linked-contact portal permissions, with first-pass enforcement active for estimate approve/reject, change-order approve/reject, and contract sign/decline actions
- customer detail now clearly labels customer-level grants versus linked contact grants and provides cleanup guidance for gradually attaching legacy customer-level grants to existing related customer contacts

Starter fields include:
- canonical customer anchor
- authenticated user linkage
- invited email metadata
- hashed invite-token metadata for pending contractor-created invites
- invited, active, and revoked state
- invite expiration and acceptance timestamps
- activation and revocation timestamps
- explicit project visibility beneath the customer grant

Current portal access design notes:
- portal access is anchored to the canonical customer record instead of inventing a separate portal-customer model
- normal contractor workflow now starts customer portal access from a contractor-created customer/project invite, not from customer self-registration before anything is shared
- null `customer_contact_id` still represents the existing customer-level portal grant behavior
- existing customer-level grants are not migrated, revoked, or altered automatically; they continue to work as legacy account-level portal access
- contractor admins can attach an existing customer-level grant to an existing related customer contact from the customer detail Portal Access area when they are ready to use contact-level permissions
- linked-contact grants now identify which canonical related customer contact a login represents without changing project visibility behavior
- linked-contact grants now also show stored permission readiness on customer detail
- linked-contact grants now also persist stored permission flags for estimate visibility/approval, contract signing, change-order approval, invoice view/pay, and quote-request readiness
- project visibility is explicitly granted beneath that customer access instead of exposing all tenant projects automatically
- portal read access now flows through the same canonical project, estimate, contract, and invoice records instead of portal-specific copies
- contractor admins now manage portal access from the canonical customer surface rather than a disconnected portal-contact subsystem
- contact-specific permission gating is now active for linked-contact estimate approval/rejection, change-order approval/rejection, and contract sign/decline actions only
- estimate send lookup, contract viewing, contractor countersign, invoice/payment behavior, and null-contact customer-level grants remain unchanged in this rollout
- a future Directory customer-account workspace may expose dedicated tabs such as `Overview`, `Contacts`, `Projects`, `Portal Access`, and optional `Billing` / `Financial`, but that is a wording and UX direction rather than a current route or schema change
- the customer-facing portal now has a real protected shell, portal home workspace, and project-detail workspace built on that same scoped read layer
- customer-facing estimate, contract, and invoice review pages now exist inside the portal on top of the same tenant-safe canonical record loaders
- portal review remains customer-safe and canonical-record-based in this pass, with contract signing now live on the shared contract record and portal invoice review now able to start customer payment activity on the same canonical invoice and payment chain without introducing a duplicate portal billing model
- portal home and project workspaces now reflect payment-requested, payment-in-progress, partially-paid, and paid outcomes as part of the same shared project workflow guidance

### Change Orders

Implemented:
- organization-scoped canonical change order schema
- change order linkage to the shared project record and optional linkage to the shared contract and invoice records
- contractor-side change-order manager page using the shared manager-page and command-bar pattern
- contractor-side quick-create overlay that captures minimum required fields before routing into the full workspace
- contractor-side change-order detail/workspace page for draft editing, send-for-review, and review-state visibility
- customer-facing portal review page for viewing, approving, and rejecting sent change orders
- immutable approved change-order commercial snapshot creation on approval
- append into schedule-of-values or invoice workflows from approved change-order snapshot lineage
- portal-view audit foundation on the shared `portal_record_views` model using `change_order` as a canonical subject type
- project, invoice, and portal-project continuity sections now surface linked change orders on the same shared workflow chain
- approved change-order snapshots can now create canonical invoice line items or append into canonical SOV rows on the same billing chain

Change order statuses currently implemented:
- `draft`
- `sent`
- `approved`
- `rejected`

Change orders currently link to:
- project
- customer
- optional contract
- optional invoice
- optional applied invoice line item

Current change-order design notes:
- change orders are canonical shared records, not report-only records and not a portal-specific approval object
- change orders extend the existing project, contract, and invoice chain instead of creating a separate scope-change subsystem
- contractor-side quick create captures only the minimum project, title, price-adjustment, and optional linked-record context before handing off to the full change-order workspace
- customer approval and rejection now happen against the same canonical change-order record through the scoped portal surface
- approved change orders create immutable downstream billing lineage instead of mutating prior approved estimate scope
- approved change-order snapshots are append-only and can extend SOV or invoice workflows from the same canonical record chain
- this first version keeps project impact intentionally continuity-based:
  - approved change orders are surfaced through project continuity and downstream billing context
  - deeper schedule, production, and messaging propagation is not implemented yet

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
- this remains the canonical workforce identity foundation, and it now supports first-pass crew assignment on jobs without introducing a separate crew model

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
- daily logs remain project-day narrative execution records even now that durable punchlist items exist on the same broader execution chain
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
- field notes are the canonical execution observation model under daily logs for project-day issues, blockers, and supporting observations
- field note project linkage must match the selected daily log, and optional job linkage must belong to the same project
- optional time card linkage is validated against the same project and log date, and also respects selected person/job linkage when provided
- optional person and time-card linkage now works as the intended bridge between field observations and canonical labor records when execution notes need that context
- field notes stay inside the daily-log workflow, while durable corrective and closeout items can now live on canonical punchlist records without overloading the project-day note stream
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
- contractor-side customer send flow for estimates
- customer-facing portal estimate review and approval or rejection
- immutable approved estimate commercial snapshot creation on approval
- canonical `estimate_customer_events` audit trail for send, view, comment, approval, and rejection activity
- estimate email tracking for sent, opened, clicked, and viewed states tied to portal review links

Estimate statuses currently implemented:
- `draft`
- `sent`
- `approved`
- `rejected`

#### Estimate System (Current Behavior)

Quick reference:
- inventory-first only; new user-facing manual estimate rows are intentionally disabled
- `catalog_items` is the source for reusable estimate items
- `catalog_system_components` drives reusable systems on top of `catalog_items`
- `estimate_line_items` is the only authoritative pricing truth; `estimates.content.itemRows` is legacy-only
- approved estimates create immutable commercial snapshots for downstream contract, SOV, and invoice lineage
- customer approval is canonical portal behavior, not a contractor-side override path
- systems expand by sqft using shared logic before becoming canonical estimate line items
- defaults apply only on initial load when estimate content is effectively empty
- autosave validates before persisting and includes conflict protection against stale overwrites
- estimate attachments use one shared `documents` bucket with organization-first pathing
- global search is shell-level and rendered at the bottom only

### Estimate Line Items

Implemented:
- estimate line item schema
- line-item-based estimate editor
- add/edit/remove line items
- database-calculated subtotal and total logic
- tax and discount support
- approved-estimate-triggered commercial snapshot and schedule-of-values seeding foundation

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
- first-pass scheduling fields on the canonical `jobs` record:
  - `scheduled_date`
  - optional `scheduled_start_at`
  - optional `scheduled_end_at`
  - `schedule_notes`
  - optional `crew_vendor_id`
- first-pass crew assignment through canonical `job_assignments`
- protected server actions for schedule, unschedule, assign crew, unassign crew, list scheduled jobs by date, and list unscheduled jobs
- job detail scheduling workspace for schedule state, assigned crew, and vendor visibility/editing

Job statuses currently implemented:
- `unscheduled`
- `scheduled`
- `in_progress`
- `completed`

Jobs currently link to:
- project
- customer
- optional approved estimate
- optional crew vendor
- optional job assignments to people or vendors

Current job design notes:
- scheduling now extends the canonical job record instead of creating a second dispatch model
- crew assignment now extends the same job through `job_assignments` so time, daily logs, and downstream records can continue pointing at one execution record
- this is intentionally a first scheduling pass only; there is still no route optimization or broader dispatch automation

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
- snapshot-based invoice source system with explicit lineage per invoice line
- invoice creation from approved estimate snapshots, selected SOV rows, approved change-order snapshot rows, or invoice-only adjustments

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
- downstream invoice rows now use one explicit lineage path only: approved estimate snapshot item, selected SOV item, approved change-order snapshot item, or invoice-only adjustment
- downstream billing must not read directly from `estimate_line_items`; those rows remain estimate authoring state only
- contractor-side invoice manager quick create now captures only the minimum project and workflow-role context, creates the canonical draft invoice, and routes into the full invoice workspace for complete editing
- contractor-side project, customer, lead, contract, and daily-log managers now also use quick create overlays that capture only minimum required fields before handing off to the full record workspace
- invoice overview now follows the early module-dashboard direction: summary, actionable queues, and continuity back into the shared project and billing chain
- invoice manager now preserves project, estimate, job, and deposit workflow context in URL-driven handoffs so project/job invoice quick-create stays anchored to the same canonical chain
- a dedicated payments manager page now exists as a finance-side module dashboard:
  - review-first summary of recorded, pending, failed, and open collection activity
  - continuity back into the same canonical invoice, customer, and project chain
  - immutable payment-event visibility without replacing invoice detail as billing truth
- a first contractor-side schedule manager page now exists on top of the canonical job model:
  - review-first summary of unscheduled, today, in-progress, and upcoming work
  - explicit schedule-view and crew-filter state normalization on the same `/schedule` surface
  - optional `projectId` URL filtering for project-scoped schedule handoff, applied directly against canonical `jobs.project_id` while still allowing `q` text search to narrow the same result set
  - optional `projectId` URL filtering on `/jobs`, applied directly against canonical `jobs.project_id` while preserving view, search, and quick-create handoff state
  - compact active-filter banner on `/schedule` for project, search, crew, and selected job/action handoff state, with per-filter clear links that preserve the remaining query context
  - next-actions guidance for jobs that need scheduling, crew assignment, or immediate attention
  - cross-job visibility into crew assignment state using canonical `job_assignments`
  - clearer distinction between unscheduled work, scheduled work, and scheduled jobs that still need crew
  - calendar-oriented planner depth on the same `/schedule` surface:
    - bounded week planner
    - day focus view
    - board layout grouped into operational timing lanes for unscheduled ready work, today, tomorrow, next-seven-day work, later scheduled work, and in-progress jobs
  - scheduled jobs render from the same canonical job scheduling fields without introducing a separate scheduling model
- inline schedule and crew-assignment action panel that reuses the existing job scheduling and assignment server actions
- crew assignment can now be reviewed and unassigned directly from the same `/schedule` action panel, without leaving the canonical job and `job_assignments` chain
- the `/schedule` action panel now blocks crew attachment until the job has a real date commitment and points users back to people, vendors, job, and project workspaces when the next prerequisite is elsewhere
- quick links back into the same canonical job and project workspaces instead of a separate dispatch subsystem

### Appointments

Implemented:
- canonical appointment schema linked to required organization plus optional opportunity, customer, and project continuity
- optional assigned-person linkage to the shared people model
- contractor-side appointments manager/list page using the shared manager-page pattern
- contractor-side quick-create overlay that captures minimum visit or meeting context before routing into the full workspace
- contractor-side appointment detail/workspace page for timing, linked-record continuity, assignment, notes, and status progression
- dashboard shortcut and priority visibility replacing the old appointment-management placeholder
- lead, customer, and project continuity links into the same appointment workflow

Appointment types currently implemented:
- `site_visit`
- `customer_meeting`
- `estimate_appointment`
- `follow_up`
- `internal`

Appointment statuses currently implemented:
- `scheduled`
- `completed`
- `canceled`
- `no_show`

Appointments currently link to:
- optional opportunity
- optional customer
- optional project
- optional assigned person

Current appointment design notes:
- appointments are canonical visit, meeting, and planning-block records, not a second execution scheduler
- jobs remain the execution source of truth for crew scheduling, field delivery, and work-state progression
- appointments may support the same project/customer/opportunity chain, but they should not replace jobs or create schedule-only records

Invoice workflow roles currently implemented:
- `standard`
- `deposit`

### Invoice Line Items

Implemented:
- invoice line item schema
- add/edit/remove line item UI inside invoice create and detail flows
- database-calculated invoice subtotal and total logic
- explicit `lineage_type` support for `estimate_snapshot_item`, `sov_item`, `change_order_snapshot_item`, and `invoice_only_adjustment`

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
- canonical online-payment foundation on `payments`, including pending checkout records for real customer-portal and gateway-backed payment actions
- immutable `payment_events` audit foundation for payment request, checkout, success, failure, void, and provider-sync lifecycle events
- reconciliation-ready gateway/session metadata on canonical `payments` and immutable `payment_events` so future provider callbacks can finalize the same payment chain idempotently
- tenant-safe payment workflow helpers for payment request, checkout start, payment success, payment failure, and payment voiding on the same canonical invoice/payment chain
- successful customer-facing payment workflow events now create or finalize canonical `payments` rows instead of introducing a second checkout or portal-payment model
- verified Stripe webhook/callback handling now finalizes or voids the same canonical pending payment rows idempotently using provider event identifiers and canonical payment references
- project commercial-readiness sync continues to flow from canonical invoice/payment status after successful payment finalization or payment voiding
- contractor-side invoice detail now surfaces online-payment readiness, recent payment-event signals, and customer-facing payment continuity without leaving the canonical invoice workspace
- contractor-side project detail now reflects deposit and invoice payment outcomes more clearly in readiness guidance and linked invoice summaries
- portal invoice review now surfaces customer-safe payment state, recent immutable payment activity, and a real customer-facing checkout-session handoff on the same canonical invoice/payment chain
- portal home and portal project workspaces now carry forward the latest canonical invoice payment progress so payment requests, in-progress checkout, partial payment, and settled outcomes read as part of one connected customer-facing workflow
- contractor and portal payment guidance now distinguish real provider-backed completion, failure, void, pending, partial, and paid outcomes without introducing any separate billing model or checkout record

Payment design notes:
- payment records remain invoice-linked and organization-scoped
- future online payments extend the canonical payment record rather than create a second payment model
- in-progress checkout sessions now attach to canonical `payments` as pending rows rather than a separate pending-payment or checkout-attempt table
- provider-specific transaction references now belong primarily on canonical `payments` and immutable `payment_events`, not on a duplicate portal billing model and not as broad duplicated invoice fields
- provider event identifiers and gateway references are now stored on canonical payment records and immutable payment events in preparation for idempotent webhook processing on the same financial chain
- provider callback processing now stays server-owned, signature-verified, and idempotent so only canonical completed payment states affect invoice paid totals and downstream readiness
- recorded payments on deposit-role invoices can now feed project commercial-readiness status through shared readiness utilities

### Punchlists

Implemented:
- canonical punchlist item schema linked to the shared project record and optional shared job record
- optional assignee linkage to the shared people model
- contractor-side punchlist manager/list page using the shared manager-page pattern
- contractor-side quick-create overlay that captures minimum required closeout context before routing into the full workspace
- contractor-side punchlist detail/workspace page for details, due date, assignee, and status progression
- project and job continuity sections now surface linked punchlist items on the same shared execution chain

Punchlist statuses currently implemented:
- `open`
- `in_progress`
- `resolved`
- `closed`

Punchlists currently link to:
- project
- optional job
- optional assignee person

Current punchlist design notes:
- punchlists are canonical durable closeout records, not dashboard-only artifacts and not a project copy
- punchlists coexist with daily logs and field notes instead of replacing them:
  - daily logs and field notes remain project-day narrative execution records
  - punchlists carry corrective and closeout items that need to survive beyond a single project day
- punchlists stay on the same project/job execution chain instead of becoming a separate field module worldview

### Financial Settings, Tax, And AIA Scaffolding

Implemented:
- organization-level financial settings foundation for default tax rate and tax behavior
- organization-level retainage baseline used to prefill new customer defaults
- customer-level tax exemption and exemption metadata
- customer-level retainage default
- invoice tax reporting view foundation for taxable sales, exempt sales, tax collected, and reporting-period grouping
- schedule-of-values foundation derived from approved estimate commercial snapshots
- contractor-side progress-billing manager and workspace on top of canonical schedule-of-values records
- contractor-side percent-complete review of schedule-of-values items with derived previously billed, current billing, retainage-held, and balance-to-finish math
- canonical progress invoice draft creation and update from real schedule-of-values item state, with invoice line items now optionally linked back to their canonical schedule-of-values rows
- `schedule_of_value_items` lineage support for `estimate_snapshot_item` and `change_order_snapshot_item`
- append-only change-order commercial snapshots that can extend SOV and invoice billing without mutating prior approved scope
- project and invoice continuity links back into the same progress-billing workspace so approved scope, billing review, and invoice continuity stay connected
- Financials Home at `/financials` now serves as the section control panel for cross-project billing visibility without replacing the invoice, payment, or progress-billing managers
- Accounts Receivable and Accounts Payable route definitions now exist as module-home placeholders only

Current design notes:
- external tax providers are not integrated yet, but the organization financial settings model includes extension points for them
- estimate tax is now derived from organization defaults, customer tax-exempt state, and line-item taxable flags; there is no manual estimate tax override path
- estimate and invoice commercial pricing is now server-owned:
  - `catalog_items` is the enforced pricing source of truth
  - stored estimate and invoice line items act as immutable commercial snapshots
  - browser-sent pricing, hidden markup, taxability, and cost code inputs are rejected on save
- approved estimate snapshots are now the canonical downstream financial source for contracts, SOV, and direct estimate-based invoicing
- schedule-of-values records stay linked to approved estimate or approved change-order snapshot items instead of creating disconnected AIA-only source data
- progress billing now uses the existing SOV layer as the contractor-side billing workspace instead of a disconnected pay-app model
- canonical invoices remain the financial source of truth; progress billing prepares or updates those invoices rather than replacing them
- approved change orders append new immutable snapshot lineage; they do not rewrite the approved estimate snapshot or previously billed rows
- percent complete, prior billed, current billed, retainage held, and retainage release still leave room for deeper pay-application and AIA export workflows later

### Notifications And Communications

Implemented:
- immutable `notification_events` stream for cross-module workflow activity
- per-user `notifications` records for in-app unread and read state
- channel-aware `notification_deliveries` ledger for in-app and email delivery tracking, with future SMS support reserved in the same model
- canonical `communication_threads` attached to shared customer, project, and subject records
- immutable `communication_messages` inside canonical threads
- first contractor-side communication review surface at `/communications`
  - review-first queue over canonical threads and unread notifications
  - thread preview and continuity links back to canonical customer, project, estimate, contract, invoice, change-order, and payment records where available
  - selected-thread review now renders a clearer chronological history from canonical `communication_messages`, with actor labels, timestamps, empty-state handling, and compact source-record context on the same thread panel
  - direct thread links now stay explicit: if a requested thread is unavailable in the current filters, the page shows unavailable-thread guidance instead of silently selecting another thread
  - project and customer detail pages now expose compact related-conversation handoff cards derived from canonical thread summaries, with counts, latest-thread preview, and direct links back into `/communications`
  - contract, invoice, change-order, and estimate detail pages now expose the same compact related-conversation handoff pattern from canonical thread summaries, without embedding inbox behavior on those workspaces
  - first safe contractor-side reply composer now exists on existing thread preview/detail only
  - contractor replies reuse the canonical posting helper and write new rows to `communication_messages` on the existing `communication_threads` record
  - reply and triage forms now preserve the all-sources filter safely and explain that replies do not send email/SMS or execute automation
  - first safe contractor-side notification triage now exists for communication unread state
  - contractor users can mark selected-thread or all communication notifications read by updating canonical per-user `notifications` records only

Current design notes:
- notifications are now implemented as stored canonical workflow signals rather than ephemeral shell-only state
- notification deliveries track sent, delivered, opened, clicked, and failed channel outcomes without creating duplicate estimate, invoice, or change-order records
- communication threads stay attached to the same canonical customer/project chain instead of creating module-specific inboxes
- communication messages are immutable and extend shared workflow continuity rather than replacing estimate, contract, invoice, or change-order records
- the contractor communication surface still stays on the same canonical review queue, but selected existing threads can now accept safe contractor replies without introducing a second inbox, portal-specific copy, or new message model
- communication triage on the contractor surface updates only the user's canonical `notifications.is_read` and `read_at` fields for communication-category records; it does not mutate `notification_events`, messages, or add message-local read state
- communication baseline hardening is limited to queue clarity, selected-thread handling, unsupported-source copy, reply validation, and read-state feedback; provider sends and automation execution remain intentionally off
- `/communications` now also supports compact URL-driven queue filtering by status grouping and supported source record type, plus text search across loaded customer, project, source-record, and preview labels from the same canonical thread list
  - status grouping and source-record filtering now shape the server-side communications loader where safe, using the same canonical `communication_threads` foundation plus per-user communication notifications for unread and needs-response queue state
  - supported source filters are currently limited to customer, project, estimate, contract, invoice, change order, and payment; unsupported source queries such as `source=job` now render an explicit help state instead of implying unsupported communication coverage
  - text search currently stays as a client-side fallback over the loaded canonical thread labels and preview text so existing URL search behavior remains unchanged without introducing new indexing, shadow fields, or external search infrastructure

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
- platform-scoped starter catalog item seeds for materials, labor, services, equipment, and systems
- organization-scoped reusable catalog item records
- catalog items now act as the canonical cost item master for commercial pricing and optional inventory tracking
- Cost Items Database now exists as a first-class contractor module with routes for dashboard, items, systems, inventory, and settings
- contractor-side adoption of platform starter items into organization-owned copies
- organization-side editing, defaulting, and archiving of reusable catalog items
- reusable catalog item commercial fields for cost, price, taxable flag, vendor, category, and item status
- optional linked inventory tracking on catalog items through `inventory_items`
- linked inventory tracking now exposes quantity on hand, reorder point, default location, manual adjustments, and recent transaction history from the same cost item workflow
- canonical `catalog_system_components` foundation for system / assembly rows attached to `catalog_items`
- estimate line items can now source directly from shared catalog items and sqft-expanded systems
- organization-scoped reusable `estimate_content_blocks` foundation for scope, inclusion, exclusion, and terms snippets

Current design notes:
- organizations do not depend on one mutable global starter item after adoption
- reusable items stay on the same canonical foundation instead of spawning module-specific catalog silos
- `catalog_items` is the shared commercial and item-master foundation; there is no second cost item model
- inventory is now an optional operational extension of the same catalog item instead of a separate primary inventory workflow
- inventory availability is now controlled through the shared platform / organization feature policy key `inventory_enabled`
- linked inventory rows currently use the default location in the contractor UI, while the schema allows additional locations later without splitting the item master
- item-level tax UX is intentionally simplified to a taxable on or off checkbox, with tax rates remaining in organization and platform financial settings and optional `tax_code_id` retained as advanced infrastructure
- estimate and invoice pricing still snapshot from `catalog_items`; inventory quantity is operational context only and does not drive pricing
- `system` remains the canonical reusable assembly concept, with component rows designed to scale immediately by sqft in estimates
- current catalog management is still foundation-first, but estimate sourcing now runs on the same shared catalog and line-item chain instead of a parallel item-row payload

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
- linked-contact customer-contact portal permissions now enforce estimate, change-order, and contract decision authority in the following limited first-pass ways:
  - estimate approve/reject requires stored `can_approve_estimates`
  - change-order approve/reject requires stored `can_approve_change_orders`
  - contract sign/decline requires stored `can_sign_contracts` for linked-contact grants only
  - contractor-side customer signer options now exclude linked-contact portal users who do not have stored contract-signing permission
  - linked-contact permission enforcement still does not yet apply to estimate view, contract view, invoice/payment, or quote-request actions
  - contractor countersign behavior is unchanged
  - null-contact customer-level grants continue to use legacy behavior in this first pass
- project readiness and portal project continuity now react to canonical signed-contract outcomes so signature completion changes the next visible commercial step instead of staying isolated on the contract page
- contractor project detail now surfaces latest contract signature handoff summary alongside the readiness hub
- portal project workspace now reflects signed-contract completion in project guidance and contract summaries before later payment work is introduced
- future e-sign integrations are expected to attach provider metadata and provider lifecycle events to the same contract foundation rather than creating a separate signed-document silo

## Current Workflow Coverage

The implemented canonical flow currently spans:
- opportunities or leads -> customers -> projects -> estimates -> contracts -> change orders -> jobs -> invoices -> payments

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
- estimate line items are now the authoritative estimate item-row source of truth; `estimates.content.itemRows` remains legacy read/migration-only
- estimate workspace item sourcing is now inventory-first, using active catalog items and sqft-scaled system expansion into canonical estimate line items
- estimate edit now groups item insertion into one clearer estimating-tools cluster: `Add manual item`, `Add from catalog`, and `Import from another estimate`, while keeping manual entry catalog-backed and non-billing-authoritative
- estimate line-item import from another estimate is now live for same-organization source estimates into draft destination estimates only; imported rows are reseeded as new destination `estimate_line_items` and do not create invoice rows, SOV rows, contracts, or payments
- estimate edit and detail now use clearer reusable-content language for scope / SOW, project details, terms, inclusions, and exclusions, and they distinguish insertable content blocks from defaults that only prefill empty estimates
- estimate edit now also uses one shared reusable-content insertion area for scope / SOW, terms, inclusions, and exclusions, reusing the existing content-block system while preserving append behavior into the live estimate
- reusable content import from another estimate is now live for same-organization source estimates into draft destination estimates only; Scope / SOW, Terms, Inclusions, and Exclusions append into the live destination estimate workspace without changing defaults, line items, or downstream billing records
- estimate import now uses one shared source-estimate chooser in the estimating tools area so users pick a source once, then choose `Import line items`, `Import Scope / SOW`, `Import Terms`, `Import Inclusions`, or `Import Exclusions` without changing any import behavior
- estimate workspace edits now use autosave with validation, dirty/error state handling, and stale-write conflict protection
- estimate defaults now hydrate only when the estimate content is initially empty, using platform defaults first and organization overrides second
- contractor workflow settings now explain estimate defaults more explicitly: Scope / SOW, Terms, Inclusions, and Exclusions are organization-owned starting defaults for empty estimates only, while reusable blocks append on demand and estimate import copies from a selected prior estimate
- estimate customer send, email tracking, portal review, and status progression
- estimate detail, customer portal-access setup, portal project visibility, portal estimate approval, and contract quick-create now include compact prerequisite guidance for the current send -> approval -> approved-snapshot -> contract generation path without weakening canonical guards
- estimate create, update, and status transitions now refresh the linked project's stored commercial-readiness fields, including project reassignment during estimate updates
- approved estimate commercial snapshot creation on approval for downstream lineage
- approved-estimate-to-contract generation and pre-sign contract editing
- required internal contract approval and send-readiness gating on draft contracts
- server-side canonical contract signature workflow progression with signer/event updates on the shared contract model
- canonical change-order authoring, send-for-review, and customer portal approval or rejection on the shared project and contract chain
- approved change-order commercial snapshot creation on approval, with append-only downstream SOV and invoice integration
- project-detail readiness hub for the upstream commercial chain with blockers, next action, and ready-to-schedule handoff visibility
- downstream job creation now respects the canonical ready-to-schedule gate instead of relying only on estimate approval
- downstream job reassignment now respects the same canonical ready-to-schedule gate instead of allowing a later project move to bypass the handoff rule
- appointment creation and review on the same lead, customer, and project chain for site visits, estimate meetings, and follow-up coordination
- conversion of approved or project-based work into jobs/work orders
- job progression through execution states
- invoice creation and maintenance from connected project, estimate, and job records
- standard invoice creation without a job now respects the commercial handoff gate instead of bypassing contract-signature and deposit or financing readiness
- snapshot-based invoice lineage across direct estimate billing, SOV billing, approved change-order billing, and invoice-only adjustments
- payment recording with invoice balance and paid-state recalculation
- tax-aware invoice calculation using org defaults and customer exemption state
- retainage-aware invoice balance foundation
- approved-estimate schedule-of-values provisioning from snapshot lineage and progress-billing invoice preparation on the same project, estimate, and invoice chain
- shared template selection and merge-data preparation for estimate, invoice, and contract document workflows
- canonical rendered contract records with revision snapshots and signature-lock scaffolding
- canonical contract signature-state, signer, and immutable signature-event foundation on the shared contract model
- canonical contract signature workflow helpers that keep send, customer signature progression, optional countersign, and readiness sync on the same contract record
- stored notification events, per-user notifications, delivery tracking, and canonical communication thread/message foundations
- shared commercial-readiness foundation fields across opportunities, projects, contracts, invoices, and organization workflow settings
- project commercial-readiness sync from signed-contract, deposit-readiness, financing-status, and recorded-payment state
- shared plain-numeric customer-facing numbering across estimates, invoices, change orders, and contracts using the existing organization and platform workflow settings tables

## What Exists But Is Still Minimal

These surfaces exist but are still foundational rather than production-complete:
- dashboard command-center surface, including modular queue composition and quick-create studio direction
- early module-dashboard pattern on overview pages
- Financials Home control-panel structure, with AR and AP still defined only as placeholders
- payments manager surface on the same shared manager-page system
- first universal-create launcher foundation in the shared shell and dashboard
- broader contractor-app theming consistency is now established through shared shell and manager-page components, but page-level cleanup still remains iterative on some deeper or lower-traffic surfaces
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
  - automation visibility
  - organization admin
  - module controls
- organization-scoped tax behavior and tax rate management
- organization-scoped retainage baseline for new customer creation and lead conversion
- contractor-side workflow defaults for approved-estimate contract template assignment
- stored contractor preferences for internal contract approval, signed-contract readiness, deposit-before-scheduling readiness, and financing-approval readiness
- organization-scoped reusable catalog item management
- `/settings/catalogs` now renders the same contractor cost item settings component used by `/cost-items-database/settings`
- organization member role management
- organization-level feature override storage within the shared platform feature policy model
- first contractor-side automation visibility/settings surface at `/settings/automation`
  - automation readiness dashboard over canonical workflow, notification, communication, payments, contracts, estimates, change orders, projects, and scheduling foundations
  - explicitly shows implemented vs foundation vs planned automation concepts, missing dependencies, safe-next-build guidance, and recent canonical samples without claiming background execution exists
  - stores organization-scoped notification-only automation preferences on the existing `organization_workflow_settings` row
  - now includes a manual, tenant-scoped notification-only runner that can be launched from `/settings/automation`
  - the manual runner supports only customer message received, estimate awaiting approval, contract awaiting signature, and invoice overdue triggers
  - executed runs create canonical `notification_events` and per-user in-app `notifications` only
  - run audit/idempotency is stored in the new tenant-owned `automation_runs` table
  - eligibility preview/debug, static template preview, and compact build-plan summaries remain visible for supported categories
  - saved preference fields are limited to category, manual-enable intent, and intended contractor-role recipients
  - no automation path sends email/SMS, creates queues or cron jobs, posts customer messages, or mutates workflow records

Current design notes:
- this is a contractor organization settings surface, separate from platform super-admin controls
- shared templates remain on one canonical template system across estimates, invoices, and contracts
- contract approval, signature, deposit, and financing readiness preferences are stored canonically now even though deeper enforcement UX is still future work
- automation readiness reads real canonical foundations only, while the manual runner is tenant-scoped and guarded by `automation_runs` idempotency before notification creation
- the notification-template preview on `/settings/automation` is static application copy only; it is not editable, does not save template records, and does not send customer messages
- the automation build plan on `/settings/automation` merges saved preferences, eligibility output, and static template definitions without saving planner rows or mutating canonical records
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
- platform module controls now include the inventory default policy used by the Cost Items Database module
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
- full scheduling/dispatch system
- drag-and-drop rescheduling, dispatch optimization, and deeper crew-calendar coordination
- automated dispatching and external notifications
- Takeoff & Scope Intelligence
- on-screen plan/PDF/image takeoff, scale calibration, plan measurement, AI-assisted takeoff, takeoff-to-cost-item mapping, and automated takeoff-based estimate generation
- takeoff source traceability, takeoff-estimate out-of-sync review state, and takeoff-driven material/labor/production planning
- contractor network collaboration, contractor-to-contractor chat, marketplace behavior, and subcontractor/vendor portal collaboration
- scoped external project/job workrooms for subcontractors, vendors, or partner contractors
- broad module-dashboard coverage across the contractor app
- PDF generation
- external e-sign provider integration
- deeper gateway-backed reconciliation, retry, and provider-sync workflows
- billing/subscriptions
- deeper gateway-backed customer-facing payment completion and reconciliation workflows
- advanced permissions UI
- deeper AIA/pay-application UX, export/reporting forms, and richer SOV draw management
- external tax provider integration
- rich template editing UI
- e-sign integration workflows on top of the canonical contract record

Future-looking note:
- the current vendors, people, compliance, jobs, daily logs, time, communication, notification, and portal access foundations could support future scoped collaboration, but no contractor network, marketplace, open contractor chat, or external subcontractor/vendor collaboration surface is implemented today.
- the current projects, estimates, estimate line items, reusable catalog items, files/attachments foundations, and site-assessment requirements could support a future Takeoff & Scope Intelligence layer, but no on-screen takeoff, AI takeoff, plan measurement, takeoff-to-cost-item mapping, source traceability, out-of-sync review state, or automated estimate generation exists today.
- future takeoff must stay separate from implemented truth: takeoff would produce quantities, catalog/cost items would define reusable cost, pricing, production, and tax behavior, and estimates would define customer-facing pricing and commercial scope.
