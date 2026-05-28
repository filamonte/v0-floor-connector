# FloorConnector Build List And Completion Timeline

Status: Active
Doc Type: Roadmap / Planning
Date: 2026-05-27

This document is the founder/product-owner build list and completion timeline
for FloorConnector. It consolidates current implementation truth, partial
foundations, planned depth, and future strategic work into one planning view.

Use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) as the
source of truth for implemented status. Use this document to decide what to
build next, what to defer, and what not to oversell.

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## A. Executive Summary

FloorConnector is in an implemented-foundation stage. It is not a prototype:
the current branch has a real Supabase-backed, multi-tenant operating-system
spine across auth, tenancy, opportunities, customers, projects, estimates,
contracts, change orders, jobs, invoices, payments, portal access, people,
vendors, time, daily logs, field notes, execution attachments, communications
foundations, settings, super-admin, deterministic cues, and controlled demo
readiness.

The honest overall readiness estimate is:

- Controlled founder/investor demo: credible when the demo stays inside
  provider-safe and fixture-known boundaries.
- Early contractor use: conditional for bounded workflows with clear caveats.
- Full daily contractor operating-system replacement: not complete yet.

What FloorConnector already has is the operating-system spine: shared canonical
records, a real contractor app shell, a project-centered workflow hub, real
portal surfaces over shared records, and a connected lead-to-payment backbone.

What it still needs is operational density:

- dispatch-grade scheduling and crew/resource coordination
- communications continuity and provider-backed delivery proof depth
- reporting that helps operators decide what to do next
- portal maturity and customer experience polish
- mobile/field daily-use depth
- financial reconciliation, tax, retainage, progress billing, and accounting depth
- document/PDF/storage/versioning maturity
- integrations behind adapters
- automation and AI maturity after the operational core is dependable
- production/staging monitoring, QA, and provider hardening

The biggest product risk is feature spread before operational depth. The branch
already has the canonical chain; the next work should make the chain feel dense,
daily, and dependable instead of adding detached modules or target-only future
surfaces.

## B. Status Legend

| Status                | Meaning                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Implemented           | Current code/docs prove the capability exists on the current branch.                                                                |
| Partially Implemented | A route, schema, read model, narrow workflow, or foundation exists, but real production depth remains.                              |
| Foundation Built      | The canonical records, route shell, settings, or read-only surface exists; the operational workflow is still early.                 |
| Planned / Not Started | Direction exists in docs, but current-state does not prove implementation.                                                          |
| Future / Strategic    | Long-term platform direction. Do not present as shipped.                                                                            |
| Needs Audit           | Existing docs or routes suggest something exists, but current implementation status needs fresh verification before product claims. |

Priority levels:

| Priority | Meaning                                                              |
| -------- | -------------------------------------------------------------------- |
| P0       | Required for credible contractor daily use and production readiness. |
| P1       | Required for strong commercial launch and sticky operations.         |
| P2       | Important growth and expansion work.                                 |
| P3       | Strategic platform, ecosystem, or long-range work.                   |

## C. Complete Build List By Product Area

### 1. Foundation / Platform

| Item                                  | Current status         | What exists today                                                                                                       | Missing / next slices                                                                 | Priority | Dependencies                                     | Guardrail                                                                                   |
| ------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Auth                                  | Implemented            | Supabase Auth, Google OAuth, email/password, protected routes, callback handling, role-aware redirects.                 | Production auth redirect verification per staging host; broader permission UI depth.  | P0       | Supabase Auth config, Google OAuth callbacks.    | Keep auth centralized; no fake auth.                                                        |
| Tenant/org bootstrap                  | Implemented            | Profile, company, membership bootstrap; setup company path; pending activation path.                                    | Public/staging activation runbook refresh and owner-controlled setup smoke.           | P0       | `companies`, memberships, setup routes.          | Do not create a second tenant/account model.                                                |
| Memberships and roles                 | Partially Implemented  | Owner/admin/manager/member plus platform roles.                                                                         | Broader role-permission UI and project-scoped role enforcement.                       | P0       | Auth, membership RLS, portal grants.             | Do not duplicate authorization per module.                                                  |
| Contractor settings                   | Implemented / ongoing  | Organization settings, financial defaults, workflow guidance, templates, module settings, export/import dry-run.        | Tax, templates/systems, import-write approval, and module governance depth.           | P0       | Settings foundation, catalog/templates.          | Settings govern canonical behavior; they must not bypass server rules.                      |
| Super-admin                           | Implemented foundation | Platform role boundary, early access, billing operations, starter packs, groups, package governance, operations health. | Entitlement enforcement, release gates, remediation workflows, production operations. | P1       | Platform roles, companies, billing settings.     | Platform admin must not bypass tenant boundaries casually.                                  |
| Module controls / entitlements        | Foundation Built       | Module/settings surfaces and platform package governance foundations.                                                   | Real package entitlements, plan gates, trial/demo policy, enforcement decisions.      | P1       | Billing/packages, module registry, roles.        | Subscription state is not activation or entitlement truth until policy is implemented.      |
| Platform defaults vs org-owned copies | Partially Implemented  | Starter packs, copied template/catalog defaults, preferred estimate template foundation.                                | Safer adoption/versioning workflows and rollback/void posture.                        | P1       | Starter pack provisioning, templates/catalogs.   | Platform defaults should copy into tenant-owned records, not live-mutate contractor copies. |
| Environment/deployment readiness      | Partially Implemented  | Local env inventory, staging/demo runbooks, validation commands, provider safety notes.                                 | Vercel project ownership, staging URL, env separation, provider replay proof.         | P0       | Vercel/Supabase/Stripe/Postmark/SignWell config. | Do not infer staging readiness from local env names.                                        |
| Audit and logging foundations         | Partially Implemented  | Payment events, notification deliveries, workflow error events, data export events, GateKeeper execution ledger.        | Unified audit review, provider/webhook monitoring, incident process.                  | P1       | Event streams and platform operations.           | Keep audit events append-only where legal/financial state is involved.                      |

### 2. Contractor App Shell / UX System

| Item                                | Current status        | What exists today                                                                                                                    | Missing / next slices                                                     | Priority | Dependencies                              | Guardrail                                                                    |
| ----------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | -------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| Top-nav shell                       | Implemented           | Top-nav-first protected shell, org branding, breadcrumbs, global search, notifications.                                              | Targeted visual QA on thin/foundation routes.                             | P0       | Auth, navigation config.                  | Do not reopen the left-sidebar/full-shell redesign unless explicitly scoped. |
| Manager-page pattern                | Implemented           | Dashboard, projects, leads, customers, estimates, invoices, contracts, jobs, people, vendors, time, daily logs follow shared rhythm. | Bring remaining utility/foundation routes up opportunistically.           | P0       | Shared UI components.                     | Manager Pages are queues/entry surfaces, not isolated module apps.           |
| Universal create launcher           | Implemented           | Shared shell/dashboard launcher into canonical Quick-Create flows.                                                                   | More coverage where new canonical create flows mature.                    | P0       | Quick-Create actions and context routing. | Create canonical records first, then hand off to full workspace.             |
| Quick-create overlays               | Implemented           | Minimum-field create flows for core records.                                                                                         | Edge-state validation and more consistent empty-state guidance.           | P0       | Canonical create server actions.          | No local-only drafts or fake persistence.                                    |
| Shared detail workspace pattern     | Implemented           | Project, estimate, contract, invoice, job workspaces share record-workspace language.                                                | Continue project-centered continuity and right-rail density cleanup.      | P0       | Project hub and linked record loaders.    | Project detail remains the readiness hub.                                    |
| Design system consistency           | Implemented baseline  | Graphite/Copper UI baseline, decision-first manager/workspace pattern.                                                               | Accessibility, responsive polish, QA snapshots.                           | P1       | Current UI docs and route audit.          | Do not reintroduce blue-heavy detached module chrome.                        |
| Redesign/Stitch/Figma/v0 alignment  | Planned / selective   | Docs and audit references exist; current baseline is accepted.                                                                       | Use system-wide design DNA only when a scoped redesign pass is requested. | P2       | Design governance docs.                   | Redesign must preserve canonical workflows and current product truth.        |
| Accessibility and responsive polish | Partially Implemented | Mobile portal and schedule smoke, responsive field polish.                                                                           | Formal a11y pass, mobile overflow checks, keyboard flows.                 | P1       | Browser QA and component system.          | Polish cannot hide missing data, auth, or provider gaps.                     |

### 3. Leads / Opportunities / Intake

| Item                                      | Current status                | What exists today                                                                                          | Missing / next slices                                                  | Priority | Dependencies                                    | Guardrail                                                           |
| ----------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| Lead intake                               | Implemented                   | Canonical opportunities/leads, create/list/detail/update, early-access public intake to canonical records. | Richer source attribution and public acquisition intake.               | P0       | Opportunities, contacts, customers/projects.    | Prefer `opportunity` as canonical pre-customer record.              |
| Opportunity statuses                      | Implemented                   | New through converted/lost workflow states.                                                                | More pipeline reporting and stage-specific validation.                 | P1       | Opportunity read models.                        | Statuses should guide handoff, not create parallel sales truth.     |
| Site assessment                           | Partially Implemented         | Scheduled/completed date fields, appointments, requirements, Scope Intake fields.                          | Deeper site assessment workspace and measurement-to-estimate handoff.  | P0       | Opportunities, appointments, estimates.         | Appointments are visits/meetings, not duplicate jobs.               |
| Requirements capture                      | Partially Implemented         | Requirements summary and manual measurements/observations.                                                 | Structured scope, photos/files, takeoff source traceability.           | P1       | Opportunity, documents/evidence, estimating.    | Requirements feed estimates; they do not bypass estimate approval.  |
| Lead-to-customer/project/estimate handoff | Implemented                   | Opportunity can create/link customer/project and start estimate.                                           | Continued customer-contact convergence and duplicate warning depth.    | P0       | Contacts/customers/projects/estimates.          | No disconnected pre-sale customer/project models.                   |
| Website/phone/email/AI intake             | Planned / partial foundations | Early-access public request and communication/GateKeeper foundations exist.                                | Public forms, source tracking, provider channels, AI summary/review.   | P2       | Communications, public acquisition, GateKeeper. | No website-only lead store or AI-only CRM.                          |
| Attribution and source tracking           | Planned / foundation          | Opportunity source fields exist.                                                                           | Campaign, landing page, channel, referral, and conversion attribution. | P2       | Public acquisition, reporting.                  | Attribution enriches opportunities; it is not a marketing database. |

### 4. Customers / People / Portal Identity

| Item                      | Current status        | What exists today                                                                                                   | Missing / next slices                                                                 | Priority | Dependencies                                   | Guardrail                                                    |
| ------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Customers                 | Implemented           | Canonical customer/account records, list/detail/update, customer workspace.                                         | Deeper history, account health, and directory cleanup.                                | P0       | Contacts, projects, financials.                | Customers are relationship roots, not generic contact cards. |
| People/contact model      | Partially Implemented | Contacts, customer_contacts, People route, Directory read view.                                                     | Full convergence of customer contacts, workforce, vendors, and user identities in UX. | P0       | Customers, portal grants, people.              | Do not replace customers with people/contact cards.          |
| Portal grants             | Implemented           | Portal access grants, project access, contact-linked permissions, invite acceptance, temporary credential fallback. | Broader customer-admin management and default access policy.                          | P0       | Supabase Auth, portal access records.          | Portal identity is Supabase Auth plus explicit grants.       |
| Pending invites           | Implemented           | Hashed token invite flow, resend/copy-link fallback, provider email when configured.                                | Invite lifecycle dashboards and bounced/failed email follow-up.                       | P1       | Notifications/deliveries, Postmark.            | Do not store raw invite tokens.                              |
| Project-scoped access     | Implemented           | `portal_project_access` controls visible portal projects.                                                           | More granular record-level access policies.                                           | P0       | Portal grants, customer contacts.              | Do not silently grant every contact all projects.            |
| Customer history          | Partially Implemented | Linked projects, estimates, invoices, contacts, portal summaries.                                                   | Timeline/activity and full communication/financial history.                           | P1       | Project and communications timelines.          | History must derive from canonical records.                  |
| Communication preferences | Partially Implemented | Organization-scoped communication preference foundation for email/future SMS categories.                            | Portal preference UI, broader channels, unsubscribe policy.                           | P1       | Communications/provider layer.                 | Preferences govern sends; they do not create a message silo. |
| Future CRM maturity       | Planned               | Strong customer/opportunity/project foundation.                                                                     | Account segmentation, sales stages, relationship health, repeat work.                 | P2       | Reporting, communications, public acquisition. | CRM depth must still feed the canonical lifecycle.           |

### 5. Projects / Operational Hub

| Item                                | Current status        | What exists today                                                                                              | Missing / next slices                                                                | Priority | Dependencies                                    | Guardrail                                                       |
| ----------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------- | ----------------------------------------------- | --------------------------------------------------------------- |
| Project detail as readiness hub     | Implemented           | ProjectPulse, command center, readiness/blockers, linked lanes, Suggested Actions.                             | Stronger source-linked blockers and phase clarity.                                   | P0       | Canonical linked records.                       | Project remains primary workflow/readiness hub.                 |
| Linked commercial/execution records | Implemented           | Estimates, contracts, change orders, jobs, invoices, payments, daily logs, communications, portal access.      | More unified activity and evidence timeline.                                         | P0       | Existing record loaders.                        | Linked lanes are read models, not duplicate records.            |
| Blockers/next actions               | Implemented / ongoing | Readiness gates, deterministic next actions, cue panels.                                                       | Better prioritization and owner responsibility workflows.                            | P0       | Workflow settings, cue rules.                   | Guidance must not bypass server readiness enforcement.          |
| Project timeline/activity           | Partially Implemented | Project Command Timeline and recency summaries.                                                                | Full project/company-brain activity timeline.                                        | P1       | Event/proof/communication sources.              | Timeline summarizes canonical events; it does not replace them. |
| Files/photos/evidence               | Partially Implemented | Daily logs, field notes, execution attachments, portal evidence grants, Proof Center.                          | Shared multi-record file/evidence layer, storage/versioning, closeout package depth. | P1       | Documents bucket, evidence grants, project hub. | Field evidence remains internal until explicitly shared.        |
| Project health                      | Partially Implemented | ProjectPulse health and next move.                                                                             | Deeper health scoring, operational KPIs, risk surfacing.                             | P1       | Reporting and workflow evidence.                | Health must be explainable and source-linked.                   |
| Production readiness                | Partially Implemented | Commercial readiness snapshots, readiness gates, scheduling handoff.                                           | Resource/equipment/material readiness and schedule conflicts.                        | P0       | Jobs, schedule, equipment, materials.           | Readiness gates stay centralized.                               |
| Target sections                     | Planned / partial     | Overview and connected lanes exist; future Takeoff, Finish/System Spec, Files, Activity remain partial/future. | Build one section at a time based on operational value.                              | P1       | Catalog, documents, activity model.             | Do not create project-local copies of record modules.           |

### 6. Estimating / Catalog / Systems

| Item                                     | Current status        | What exists today                                                                           | Missing / next slices                                                                   | Priority | Dependencies                                               | Guardrail                                                                       |
| ---------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Estimate builder                         | Implemented           | Catalog-first Estimate Workspace, statuses, save/conflict behavior, portal review/approval. | Output/display template controls and richer review states.                              | P0       | Catalog items, estimate line items.                        | `estimate_line_items` are authoritative.                                        |
| Estimate line items                      | Implemented           | Canonical line items, groups/sections, snapshots, server-owned pricing.                     | More source traceability and review/compare depth.                                      | P0       | Catalogs, approved snapshots.                              | Do not use `estimates.content.itemRows` for new behavior.                       |
| Reusable catalog items                   | Partially Implemented | `catalog_items`, inline create/edit, archived item blocking, snapshots.                     | Cost, labor, production, markup, inventory, purchasing depth.                           | P0       | Catalog settings, estimate editor.                         | `catalog_items` is the only shared item master.                                 |
| Finish products                          | Foundation Built      | Finish product metadata foundations.                                                        | Product images, spec sheets, selected-system lifecycle, portal/closeout proof.          | P1       | Documents, selected systems.                               | Manufacturer data must not hardcode one vendor dependency.                      |
| Floor system templates                   | Partially Implemented | System expansion and manual measurement generation into editable estimate lines.            | Advanced formulas, optional components, versioning, defaults, takeoff links.            | P0       | Catalog items, system components.                          | Systems generate reviewed estimate content only.                                |
| Selected systems                         | Foundation Built      | Selected-system/admin data-access foundations.                                              | Active sold/installed spec workflow across estimate, contract, job, closeout, warranty. | P1       | Finish products, estimates, documents.                     | Sold specs should snapshot/lock once commercial/legal activity begins.          |
| Proposal view                            | Partially Implemented | Print/save estimate views and portal review.                                                | Stored PDF/versioning, display template switching, SOW modes.                           | P1       | Document engine/templates.                                 | Print views render canonical records; they are not document truth.              |
| Visualizer-to-estimate                   | Planned               | Target direction only.                                                                      | Public/pre-lead selection, claim/handoff, selected system, estimate generation.         | P3       | Public acquisition, selected systems, estimate generation. | No visualizer-only business truth.                                              |
| Advanced assemblies/pricing intelligence | Planned               | Direction in estimating docs.                                                               | Production rates, labor, materials, waste, internal margin, AI suggestions.             | P2       | Catalog/materials/reporting maturity.                      | Internal cost/profitability must stay out of customer-facing output by default. |

### 7. Contracts / E-Sign / Revisions

| Item                          | Current status         | What exists today                                                             | Missing / next slices                                                        | Priority | Dependencies                            | Guardrail                                                      |
| ----------------------------- | ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- | --------------------------------------- | -------------------------------------------------------------- |
| Contract generation           | Implemented            | Contracts from approved estimate/project context.                             | Better document templates/output options.                                    | P0       | Approved estimate snapshots.            | Contracts extend canonical approved scope.                     |
| Templates                     | Partially Implemented  | Shared template references and defaults.                                      | Rich template editor, per-record switching, starter document adoption depth. | P1       | Shared templates/company documents.     | Templates are governed config, not module-specific silos.      |
| Draft edits/internal approval | Implemented            | Draft editing, approval configuration.                                        | More review assignment and approval history depth.                           | P1       | Workflow settings.                      | No legal state shortcuts.                                      |
| Customer portal signing       | Implemented            | Portal sign/decline on shared canonical contract.                             | Provider lifecycle and richer signer UX.                                     | P0       | Portal access, contract signers.        | No portal-only contract copies.                                |
| Optional countersign          | Implemented foundation | Contractor countersign support.                                               | More countersign routing and provider parity.                                | P1       | Contract signer records.                | Signature events remain canonical evidence.                    |
| Signature events              | Implemented            | Immutable contract signature events.                                          | Provider callback reconciliation.                                            | P0       | Contract signer/events.                 | External providers enrich, not replace, canonical contracts.   |
| Revision snapshots            | Partially Implemented  | First-pass `record_revisions` for estimates/invoices/contracts/change orders. | Compare, restore, branch/merge, rollback policy.                             | P1       | Record revision snapshots.              | Revisions attach to active records, not cloned business truth. |
| External e-sign provider      | Planned                | Provider architecture/env notes exist.                                        | SignWell adapter, webhooks, reconciliation, retry/failure handling.          | P1       | Contracts/signers/delivery proof.       | Provider SDK logic belongs behind adapters.                    |
| Delivery proof                | Partially Implemented  | Send Trail and document delivery events for supported sends.                  | Full delivery telemetry and resend/retry lifecycle.                          | P1       | Communications/notifications/providers. | Delivery evidence is not signature truth.                      |

### 8. Change Orders

| Item                         | Current status         | What exists today                                                               | Missing / next slices                                       | Priority | Dependencies                              | Guardrail                                                                |
| ---------------------------- | ---------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| Contractor authoring         | Partially Implemented  | Canonical change orders and manager/workspace foundations.                      | Workspace maturity matching estimates/invoices.             | P0       | Projects, estimate snapshots.             | Change orders extend approved scope; they are not report-only artifacts. |
| Portal review/approval       | Implemented foundation | Portal approve/reject path and E2E coverage.                                    | More customer-safe context and delivery proof.              | P0       | Portal grants, change-order records.      | Portal acts on shared change orders only.                                |
| Invoice impact               | Partially Implemented  | Approved change-order snapshots can feed SOV/invoice lineage.                   | Clearer invoice impact UI and negative adjustment handling. | P0       | Invoice lineage, SOV.                     | Append scope changes; do not rewrite prior approved scope.               |
| Project continuity           | Partially Implemented  | Project lanes and linked summaries.                                             | Production/schedule propagation and closeout context.       | P1       | Project workspace, jobs/schedule.         | Do not create a disconnected change-order workflow.                      |
| Credits/negative adjustments | Planned / Needs Audit  | Invoice-only adjustment lineage exists; full CO credit flow needs verification. | Negative CO/credit/retainage treatment.                     | P1       | Financial rules, invoice lineage.         | Credits must preserve audit and financial truth.                         |
| Accounting treatment         | Planned                | Accounting readiness read-only prep exists.                                     | Export/sync mapping and provider reconciliation.            | P2       | Accounting integration, financial events. | Accounting sync derives from FloorConnector truth.                       |

### 9. Jobs / Scheduling / Dispatch

| Item                       | Current status               | What exists today                                                                                                         | Missing / next slices                                                    | Priority | Dependencies                                   | Guardrail                                                        |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| Jobs/work orders           | Implemented                  | Canonical jobs, Job Workspace, work-orders alias/foundation.                                                              | Work-order document output and job-costing depth.                        | P0       | Projects, approved estimates/contracts.        | Jobs are execution records; do not create duplicate work orders. |
| Ready-to-schedule gate     | Implemented                  | Server readiness gate before job creation/scheduling/execution.                                                           | More resource/material readiness signals.                                | P0       | Project readiness utilities.                   | All execution workflows pass centralized readiness.              |
| First-pass schedule fields | Implemented                  | Canonical job schedule fields and action panel.                                                                           | Rich recurrence/availability calendars.                                  | P0       | Jobs and assignments.                          | Schedule fields stay on canonical jobs.                          |
| Crew assignment            | Implemented foundation       | `job_assignments` to people/vendors; assign/unassign flows.                                                               | Capacity, conflict, qualifications, equipment/resource fit.              | P0       | People/vendors/equipment.                      | Crew assignment extends jobs, not a crew calendar silo.          |
| Schedule manager           | Partially Implemented        | `/schedule` CrewBoard with ready queues, lanes, Attention Desk, date/layout views, selected-job panel, advisory warnings. | Dispatch-grade calendar/board, map/route/day view, conflict enforcement. | P0       | Jobs, assignments, readiness.                  | This is one of the biggest remaining operational gaps.           |
| Drag/drop                  | Partially Implemented        | Pointer drag/drop preview prepares existing Move schedule confirmation.                                                   | Production drag/drop polish and Playwright coverage.                     | P1       | Existing move helpers and confirmation action. | Dropping must not mutate without confirmation.                   |
| Dispatch notifications     | Planned                      | Communication/notification foundations.                                                                                   | Customer/crew notifications, reminders, send policy, preferences.        | P1       | Communications, providers, activation guard.   | No automatic external sends without approved policy.             |
| Mobile schedule execution  | Planned / partial responsive | Responsive schedule surfaces exist.                                                                                       | Foreman/crew route, day sheet, job start/complete, offline tolerance.    | P1       | Mobile field, jobs, time.                      | Mobile execution stays tied to jobs/daily logs/time.             |

### 10. Field Execution / Daily Logs / Field Notes / Evidence

| Item                          | Current status         | What exists today                                                            | Missing / next slices                                                    | Priority | Dependencies                      | Guardrail                                               |
| ----------------------------- | ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- | --------------------------------- | ------------------------------------------------------- |
| Daily logs                    | Implemented foundation | Daily Log Manager/Workspace, project/job/day prefill, mobile capture polish. | Daily closeout, supervisor review, portal-safe summaries.                | P0       | Jobs, projects, time.             | Daily logs are execution records, not generic notes.    |
| Field notes                   | Implemented foundation | Job Notes/blockers/issues linked to Daily Logs.                              | Punch-list-ready observations and issue workflows.                       | P0       | Daily logs, punchlists.           | Do not create duplicate issue/blocker subsystems.       |
| Execution attachments         | Implemented foundation | Private documents bucket, signed previews, archive/restore metadata.         | Shared evidence layer, thumbnails, storage cleanup, retention policy.    | P1       | Storage/RLS, evidence policy.     | Field evidence is internal by default.                  |
| Mobile capture                | Partially Implemented  | Mobile Daily Log/Job Note/evidence polish.                                   | Foreman mode, camera-first flows, offline queue, crew navigation.        | P0       | Field routes, storage, auth.      | Do not use localStorage for business state.             |
| Punch-list-ready observations | Partially Implemented  | Punchlists exist and link to project/job.                                    | Better conversion from field notes to punchlist/work items.              | P1       | Punchlists, work items.           | Punchlists stay on canonical project/job chain.         |
| Customer visibility           | Partially Implemented  | Portal evidence grants for selected execution attachments.                   | Customer-safe field summaries, closeout packages, explicit share review. | P1       | Portal grants, evidence policy.   | Never expose internal Job Notes or blockers by default. |
| Offline tolerance             | Planned                | None as production offline system.                                           | Offline data model, queue/retry/conflict handling.                       | P2       | Mobile field maturity.            | Offline cannot fake persistence or bypass validation.   |
| Production issue workflows    | Planned / foundation   | Field blockers, punchlists, work items.                                      | Durable production issue lifecycle and reporting.                        | P1       | Field notes, work items, reports. | Issues should route to canonical jobs/projects.         |

### 11. Time / Workforce / Vendors / Compliance

| Item                              | Current status        | What exists today                                           | Missing / next slices                                            | Priority | Dependencies                   | Guardrail                                                   |
| --------------------------------- | --------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | -------- | ------------------------------ | ----------------------------------------------------------- |
| People                            | Partially Implemented | People records, assignment foundations, membership linkage. | Employee profiles, skills, roles, directory cleanup.             | P1       | Memberships, time, compliance. | People are not customer accounts or auth users alone.       |
| Vendors                           | Partially Implemented | Vendors and compliance foundations.                         | Subcontractor management, scoped collaboration, vendor bills/AP. | P1       | Vendors, jobs, documents, AP.  | No partner model without scoped permissions.                |
| Compliance                        | Partially Implemented | Compliance records for people/vendors.                      | Expiration reminders, insurance/cert tracking, safety reports.   | P1       | People/vendors/notifications.  | Compliance evidence derives from records, not spreadsheets. |
| Time punch events                 | Partially Implemented | State-aware punch flows and current punch state.            | Corrections, approvals, geofence policy, payroll-safe review.    | P0       | People/jobs/service tickets.   | Time must stay canonical and auditable.                     |
| Time cards                        | Partially Implemented | Derived time cards and labor summaries.                     | Approval workflow, export, payroll integration, overtime policy. | P1       | Time events, reporting.        | Derived cards should not replace punch-event truth.         |
| Labor summaries                   | Partially Implemented | Project/job labor continuity.                               | Job costing, productivity metrics, wage/cost rates.              | P1       | Time, reporting, job costing.  | Internal cost remains internal.                             |
| Payroll export/integration        | Planned               | No full payroll integration.                                | Export mapping, provider adapter, approvals.                     | P2       | Time-card approval.            | Payroll providers are adapters, not source of truth.        |
| Certification/insurance reminders | Planned               | Compliance records exist.                                   | Notification/reminder rules and expiration dashboard.            | P1       | Compliance, notifications.     | Reminders need preference/audit policy.                     |

### 12. Invoices / Payments / Financials

| Item                              | Current status         | What exists today                                                                                     | Missing / next slices                                                       | Priority | Dependencies                                | Guardrail                                                                 |
| --------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| Invoices                          | Implemented            | Canonical invoices, line items, roles, balances, deposit/standard roles, retainage/tax snapshots.     | Invoice editor depth, credits, tax admin, billing edge cases.               | P0       | Approved snapshots, SOV, change orders.     | Invoices are money owed and must have valid lineage.                      |
| Payments                          | Implemented foundation | Payments, payment events, record payments, portal checkout start, webhook reconciliation foundations. | Refunds, disputes, retries, deeper reconciliation execution.                | P0       | Stripe/payment abstraction, invoices.       | Payments are money collected; provider state enriches canonical payments. |
| Portal payment initiation         | Implemented            | Portal invoice review can initiate payment on canonical chain.                                        | Staging/live provider replay proof and customer UX polish.                  | P0       | Portal grants, payment gateway.             | No separate portal billing model.                                         |
| Stripe/provider-backed completion | Partially Implemented  | Stripe webhook/callback handling and provider-isolated tests are documented.                          | Live/staging replay, operational monitoring, reconciliation dashboard.      | P1       | Provider env, webhooks, runbooks.           | Verify signatures and idempotency.                                        |
| Deposit invoices                  | Implemented            | Deposit workflow role and readiness impact.                                                           | Better deposit collection UX and reporting.                                 | P0       | Project readiness, invoices/payments.       | Deposits stay on invoice/payment chain.                                   |
| Retainage                         | Partially Implemented  | Retainage fields and reporting snapshots.                                                             | Retainage release workflow and reporting.                                   | P1       | Invoices, SOV, financial settings.          | Retainage must remain auditable.                                          |
| SOV/AIA scaffolding               | Partially Implemented  | SOV tables, progress billing workspace, percent-complete review, draft invoice creation/update.       | Full AIA G702/G703 export and pay-app UX.                                   | P1       | Estimates, SOV, invoices.                   | Do not create a detached pay-app subsystem.                               |
| AR/collections workspace          | Partially Implemented  | Financials Home, AR workspace, collections command center, deterministic follow-up intelligence.      | Reminder policies, communication handoff, collection notes, live follow-up. | P0       | Communications, invoices/payments.          | No duplicate AR ledger.                                                   |
| Accounting integration            | Planned                | Accounting readiness/export prep read-only surfaces.                                                  | QuickBooks/accounting adapter, sync mapping, reconciliation.                | P2       | Financial event history and export posture. | Accounting sync derives from FloorConnector truth.                        |
| Tax provider integration          | Planned                | Org tax defaults, invoice tax reporting snapshots.                                                    | Tax provider adapter, jurisdiction logic, filing support.                   | P1       | Financial settings, invoices/reports.       | Do not add manual tax overrides that break snapshot truth.                |

### 13. Customer Portal

| Item                   | Current status         | What exists today                                                                 | Missing / next slices                                                    | Priority | Dependencies                   | Guardrail                                                |
| ---------------------- | ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- | ------------------------------ | -------------------------------------------------------- |
| Portal shell           | Implemented            | Protected portal shell, home, project workspace, scoped access.                   | Customer polish, navigation consistency, onboarding help.                | P0       | Portal grants/auth.            | Portal constrains shared records; it does not copy them. |
| Project workspace      | Implemented foundation | Customer-safe project status, next step, timeline, shared docs, closeout handoff. | Richer status, schedule visibility, portal messages.                     | P0       | Project records, grants.       | Do not expose contractor-only readiness internals.       |
| Estimate review        | Implemented            | Portal estimate review/approval/rejection and print/save.                         | Delivery proof and richer comments/questions.                            | P0       | Estimates, portal permissions. | Portal acts on canonical estimates.                      |
| Contract signing       | Implemented            | Portal contract sign/decline on shared contracts.                                 | External provider lifecycle and countersign parity.                      | P0       | Contracts/signers.             | No portal-only signed document.                          |
| Invoice review/payment | Implemented            | Portal invoice review/payment initiation and payment-state visibility.            | Payment UX polish, failure/retry explanations.                           | P0       | Invoices/payments.             | No checkout-copy model.                                  |
| Change order review    | Implemented foundation | Portal approve/reject where permissions allow.                                    | Better customer-safe context and delivery proof.                         | P1       | Change orders, permissions.    | CO decisions update shared records.                      |
| Messaging              | Partially Implemented  | Portal-safe project replies on existing customer-visible threads.                 | Portal inbox, notifications, preferences, provider-backed replies.       | P1       | Communications, portal grants. | Internal notes never exposed.                            |
| Files/photos depth     | Partially Implemented  | Explicit portal evidence grants and shared document rows.                         | Broader file library, closeout package, customer acknowledgements depth. | P1       | Evidence grants, documents.    | Sharing must be explicit and reversible.                 |
| Schedule visibility    | Partially Implemented  | Customer-visible appointments; schedule state explanations.                       | Customer-safe production schedule window.                                | P1       | Jobs/appointments/schedule.    | Do not promise internal crew logistics by default.       |

### 14. Communications / Notifications

| Item                           | Current status         | What exists today                                                                     | Missing / next slices                                                       | Priority | Dependencies                            | Guardrail                                                       |
| ------------------------------ | ---------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- | --------------------------------------- | --------------------------------------------------------------- |
| Communication threads/messages | Implemented foundation | Canonical threads/messages attached to customers/projects/subjects.                   | Broader record coverage, inbox filters, customer/internal threading policy. | P0       | Communications schema, workspaces.      | Threads attach to operational context.                          |
| Notifications/events           | Implemented foundation | Notification events, per-user notifications, delivery ledger.                         | Reminder lifecycle, admin preferences, escalation queues.                   | P1       | Preferences/providers.                  | Notifications should not duplicate workflow records.            |
| Delivery proof                 | Partially Implemented  | Notification deliveries, document delivery events, Send Trail.                        | Provider telemetry lifecycle and retry/resend.                              | P1       | Email/SMS adapters.                     | Provider telemetry is evidence, not business truth.             |
| Unified inbox/workspace        | Partially Implemented  | `/communications` as record-linked communication workspace.                           | Full unified inbox, portal/customer messaging depth, internal discussion.   | P0       | Communication threads/messages.         | Do not create a disconnected chat product.                      |
| Internal discussion            | Partially Implemented  | Internal notes/messages on canonical threads.                                         | Comments, mentions, assignments, per-record discussion polish.              | P1       | Work items, notifications.              | Internal discussion stays tenant-scoped and hidden from portal. |
| Customer continuity            | Partially Implemented  | Customer-visible portal-history messages and replies.                                 | Email/SMS provider-backed continuity and customer inbox.                    | P1       | Preferences/providers/portal.           | Customer communication must map back to records.                |
| Reminders/follow-ups           | Partially Implemented  | Deterministic cues, work-item prefill, appointment confirmation/reminder foundations. | Automated reminder policy, schedules, delivery, retries.                    | P1       | Automation, notifications, preferences. | No autonomous sends without owner-approved rules.               |
| Channel integrations           | Planned / foundation   | Postmark readiness; future SMS/calls/voice docs.                                      | Email, SMS, phone, voicemail, web chat adapters.                            | P2       | Provider adapters, communications.      | Providers are adapters, not source-of-truth inboxes.            |

### 15. Documents / Templates / Business Documents

| Item                         | Current status        | What exists today                                                                          | Missing / next slices                                                 | Priority | Dependencies                         | Guardrail                                                                 |
| ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------- |
| Shared templates             | Partially Implemented | Shared template references and settings.                                                   | Rich editor, defaults, per-record switching, versioning.              | P1       | Settings, document engine.           | Templates should not fragment by module.                                  |
| Company documents            | Partially Implemented | Company Documents Phase 1A/1B and starter adoption foundations are documented/implemented. | Acknowledgements, distribution, storage/versioning, employee docs.    | P1       | Documents/settings.                  | Company docs are a library, not legal advice or AI drafting by default.   |
| Generated business documents | Partially Implemented | Print/save views for estimates/contracts/invoices/warranties/closeout foundations.         | Stored PDF bytes, document packages, version history, delivery retry. | P0       | Document engine, storage, templates. | Rendered documents are derived from canonical records.                    |
| Employee documents           | Planned / foundation  | Company document direction exists.                                                         | Handbooks, agreements, acknowledgements, employee access.             | P2       | People, compliance, company docs.    | Do not expose HR docs without role/permission design.                     |
| Project files                | Partially Implemented | Execution attachments, project evidence, documents bucket.                                 | Multi-record shared file layer and project file manager.              | P1       | Storage, evidence grants.            | Files link to records; they do not own business truth.                    |
| PDF generation               | Partially Implemented | Browser print/save routes.                                                                 | Server/generated PDFs, storage, versions, retrieval.                  | P1       | Document templates/storage.          | Stored PDFs must not replace canonical estimate/invoice/contract records. |
| Delivery history             | Partially Implemented | Send Trail and notification deliveries.                                                    | Full delivery event lifecycle.                                        | P1       | Communications/providers.            | Delivery proof complements source records.                                |
| Versioning and approvals     | Planned / foundation  | Revision snapshots and company docs foundation.                                            | Document versioning, approval flows, retention policy.                | P1       | Revisions, documents.                | Legal/financial versions require immutable evidence.                      |
| Monetization potential       | Future / Strategic    | Document library direction.                                                                | Starter packs, premium templates, legal review policy.                | P3       | Package entitlements, super-admin.   | Do not sell document quality before governance exists.                    |

### 16. Reporting / Analytics / Operational Intelligence

| Item                  | Current status         | What exists today                                                                 | Missing / next slices                                                         | Priority | Dependencies                          | Guardrail                                                          |
| --------------------- | ---------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------- | ------------------------------------- | ------------------------------------------------------------------ |
| Dashboard             | Implemented foundation | Source-record attention groups, deterministic next moves, AI digest when enabled. | Role-specific operator dashboards and stronger drill-through.                 | P0       | Canonical record loaders.             | No fake metrics.                                                   |
| Module dashboards     | Partially Implemented  | Financials, payments, reports, estimates/invoices manager rhythm.                 | More module homes for operations, field, documents.                           | P1       | Manager-page pattern.                 | Module dashboards route back to source records.                    |
| Financial collections | Partially Implemented  | Financials Home, AR workspace, collections command center.                        | Reminder execution, reconciliation, write-side collection workflow.           | P0       | Invoices/payments/communications.     | No duplicate AR ledger.                                            |
| Operational KPIs      | Partially Implemented  | `/reports` Phase 1 operations/collections visibility.                             | Schedule utilization, labor productivity, bottlenecks, project health trends. | P1       | Jobs, time, schedule, daily logs.     | Reporting must be operational decision support, not vanity charts. |
| Sales conversion      | Partially Implemented  | Lead pipeline/estimate summaries.                                                 | Source attribution, conversion funnel, estimator performance.                 | P1       | Opportunities, estimates, contracts.  | Metrics derive from canonical statuses.                            |
| Schedule utilization  | Planned / foundation   | Schedule lanes, advisory warnings, jobs/assignments.                              | Capacity, crew utilization, route/day view reporting.                         | P1       | Schedule, people/vendors.             | Utilization needs clean assignment/time data.                      |
| Labor productivity    | Planned / foundation   | Time/project/job labor summaries.                                                 | Production rates, budget vs actual, job costing.                              | P1       | Time, catalog/materials, job costing. | Do not expose internal wage/cost data accidentally.                |
| Profitability         | Planned                | Foundations in estimates/invoices/payments/catalogs.                              | Job costing, cost rates, materials/AP, margin reporting.                      | P2       | Catalog, time, materials, AP.         | Profitability requires reliable source data first.                 |
| BI/analytics depth    | Future / Strategic     | Strategy docs exist.                                                              | Drillable metrics, exports, benchmarking, forecasting.                        | P2/P3    | Reporting maturity and telemetry.     | No separate BI source of truth.                                    |

### 17. Automation / AI / Agentic Guidance

| Item                                      | Current status                | What exists today                                                                                                    | Missing / next slices                                                                          | Priority | Dependencies                                      | Guardrail                                                                                 |
| ----------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Deterministic cues                        | Partially Implemented         | Cue rules, My Work, Needs Attention, dismiss/snooze, responsibility defaults.                                        | Broader resolve, overrides, delivery/reminder execution.                                       | P1       | Workflow settings, canonical dates/statuses.      | Cues do not mutate business records.                                                      |
| Workflow cue states                       | Implemented foundation        | User-scoped cue suppression states.                                                                                  | Company-level handling and audit.                                                              | P1       | Cue identity model.                               | Cue state is visibility, not assignment truth.                                            |
| Suggested project actions                 | Implemented foundation        | Project Workspace suggestions from canonical context.                                                                | Stronger role assignment and action readiness.                                                 | P1       | Project workspace, cue logic.                     | Suggested actions route to existing workflows.                                            |
| Assistant review-confirm model            | Partially Implemented         | Copilot deterministic drafts, communications handoff, GateKeeper review/execution foundation for create_opportunity. | Broader action queue, policy, audit, low-risk automation catalog.                              | P1       | Communications, GateKeeper, work items.           | Human confirmation before risky actions.                                                  |
| Guided/flexible/manual controls           | Implemented foundation        | Workflow guidance and AI assistance controls.                                                                        | Better per-role setup and demo/preset policy.                                                  | P1       | Settings/workflows.                               | Controls adjust presentation, not hard server rules.                                      |
| AI disable/settings controls              | Implemented foundation        | Org-level controls with deterministic fallback.                                                                      | Provider-backed enhancement policy and observability.                                          | P1       | AI provider facade, settings.                     | Provider-backed AI is off unless explicitly enabled.                                      |
| AI intake/estimating/follow-up/scheduling | Planned / partial foundations | GateKeeper and Copilot foundations; no broad provider AI.                                                            | Provider-backed drafting, intake classification, estimate suggestions, scheduling suggestions. | P2       | Communications, reporting, scheduling, estimates. | AI must not outrun operational maturity.                                                  |
| Autonomous work                           | Future / Strategic            | Doctrine and limited controlled execution ledger.                                                                    | Approval policies, idempotency, rollback, audit, monitoring.                                   | P3       | Mature workflows, automation, reporting.          | No autonomous customer-facing/financial/legal/scheduling actions without approved policy. |

### 18. Marketing / Growth / Websites / SEO

| Item                               | Current status        | What exists today                                         | Missing / next slices                                             | Priority | Dependencies                                  | Guardrail                                              |
| ---------------------------------- | --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------- | -------- | --------------------------------------------- | ------------------------------------------------------ |
| Marketing homepage                 | Partially Implemented | FloorConnector public home and early-access request.      | Public proof, pricing/packages, refined signup.                   | P1       | Public routes, product language.              | Public claims must match implemented truth.            |
| Signup/setup flow                  | Partially Implemented | Signup, setup company, billing setup, pending activation. | Public activation, guided onboarding, migration help.             | P0       | Auth/billing/activation.                      | No fake activation or fake billing state.              |
| Early access activation            | Partially Implemented | Manual platform activation and billing evidence.          | Public self-serve policy, live billing launch, entitlement gates. | P0       | SaaS billing policy, super-admin.             | Stripe success is not activation truth.                |
| Contractor websites                | Planned               | Target direction only.                                    | Tenant domains, page builder, public forms, media, SEO.           | P3       | Public acquisition, attribution, templates.   | No website-only CRM/database.                          |
| Landing pages/attribution          | Planned               | Opportunity source foundations.                           | Campaign tracking and conversion reporting.                       | P2       | Public forms, reporting.                      | Attribution feeds opportunities.                       |
| Website lead capture               | Planned / partial     | Early-access intake exists for FloorConnector.            | Contractor-owned public intake into tenant opportunities.         | P2       | Public edge, tenant routing, auth boundaries. | Public intake writes canonical opportunities.          |
| Generated SEO content              | Future / Strategic    | Vision/docs only.                                         | AI content governance, brand controls, proof sources.             | P3       | Contractor websites and AI policy.            | Generated content cannot invent project proof.         |
| Visualizer-driven pre-lead capture | Future / Strategic    | Selected-system foundations only.                         | Visualizer sessions, claim flow, selected-system handoff.         | P3       | Visualizer/public edge/selected systems.      | Pre-lead choices become canonical only after accepted. |
| Package/pricing pages              | Planned               | Billing/package foundations.                              | Public package marketing and self-serve flow.                     | P2       | Entitlements, SaaS billing.                   | Do not imply live entitlements before enforcement.     |

### 19. Integrations

| Item                           | Current status        | What exists today                                                                 | Missing / next slices                                                               | Priority | Dependencies                      | Guardrail                                                             |
| ------------------------------ | --------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | --------------------------------- | --------------------------------------------------------------------- |
| Stripe/payment abstraction     | Partially Implemented | Payment gateway foundations, Stripe webhook/callback path, local manual provider. | Live/staging replay, refunds/disputes, reconciliation, Customer Portal if approved. | P0       | Payments, provider env.           | Payment provider enriches canonical payment chain.                    |
| E-sign provider                | Planned / foundation  | SignWell env/readiness notes and contract architecture.                           | Adapter, webhook, provider lifecycle, retry/reconcile.                              | P1       | Contracts/signers/delivery proof. | No provider-owned signed contract truth.                              |
| Email/SMS providers            | Partially Implemented | Postmark-backed selected email paths and notification delivery ledger.            | SMS, broader email sends, preferences, bounce handling.                             | P1       | Communications/preferences.       | Provider sends must be activation-gated.                              |
| Accounting                     | Planned               | Export/readiness surfaces.                                                        | QuickBooks/accounting sync adapter and reconciliation.                              | P2       | Financial event history.          | Accounting sync from FloorConnector, not to FloorConnector as source. |
| Tax                            | Planned               | Internal tax settings and reporting snapshots.                                    | Tax provider adapter and jurisdiction handling.                                     | P1       | Invoices/settings/reports.        | Tax outputs must be auditable.                                        |
| Calendar                       | Planned               | Appointments/jobs/schedule foundations.                                           | Google/Outlook adapter, busy blocks, reconciliation.                                | P2       | Schedule ownership policy.        | External calendars mirror/sync; FloorConnector owns schedule.         |
| Supplier/manufacturer catalogs | Planned               | Catalog/finish product foundations.                                               | Product catalog import/sync and versioning.                                         | P2       | Catalogs, materials.              | Vendor data enriches catalog, not replaces it.                        |
| Distributor/purchasing         | Planned               | Vendors/materials/AP placeholders.                                                | POs, receiving, bills/AP, purchasing adapters.                                      | P2       | Materials, vendors, financials.   | Purchasing must attach to jobs/materials/financials.                  |
| External storage               | Planned / partial     | Supabase private documents bucket.                                                | Storage adapters, retention, versioning, signed access policy.                      | P2       | Documents/evidence.               | Do not leak raw storage paths or secrets.                             |
| Webhooks/events                | Partially Implemented | Stripe, SaaS billing, notification/payment events.                                | Unified provider webhook verification/monitoring.                                   | P1       | Provider adapters/audit logs.     | Webhooks must be signature-verified and idempotent.                   |

### 20. Marketplace / Contractor Network / Ecosystem

| Item                               | Current status     | What exists today                                                       | Missing / next slices                                                 | Priority | Dependencies                                           | Guardrail                                                      |
| ---------------------------------- | ------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------- | -------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| Certified service provider concept | Future / Strategic | Doctrine in contractor collaboration/network docs.                      | Criteria, permission model, compliance, platform governance.          | P3       | Operational maturity, compliance, network policy.      | Do not frame as implemented.                                   |
| Contractor-to-contractor network   | Future / Strategic | Future-only invite-based doctrine.                                      | Approved partner graph, project/job-scoped grants, partner identity.  | P3       | Permissions/RLS, communications, schedule, compliance. | No public marketplace or lead resale.                          |
| Project/job scoped access          | Planned / future   | Portal/access patterns and vendors/people foundations could support it. | External collaborator permissions, field access, file sharing, audit. | P3       | Portal/access, People/Vendors, project/job workspaces. | No duplicate jobs/projects for partners.                       |
| Subcontractor/vendor portal        | Future             | Vendors/compliance/job foundations.                                     | Scoped external surfaces and status/photo updates.                    | P3       | Vendor identity, portal-like access.                   | External access hidden from customer/billing truth by default. |
| Marketplace sequencing             | Deferred           | Vision only.                                                            | Network trust, compliance, revenue model, dispute handling.           | P3       | Collaboration network maturity.                        | Ecosystem comes after contractor stickiness.                   |

### 21. Mobile / Field App

| Item                        | Current status        | What exists today                                                 | Missing / next slices                                       | Priority | Dependencies                            | Guardrail                                                           |
| --------------------------- | --------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- | -------- | --------------------------------------- | ------------------------------------------------------------------- |
| Responsive app baseline     | Partially Implemented | Mobile smoke on portal/schedule; field mobile polish.             | Systematic responsive QA and mobile navigation.             | P0       | Browser QA, UI components.              | Responsive web is not offline mobile.                               |
| Mobile-first daily logs     | Partially Implemented | Fast Daily Job Log capture and Job Note/evidence polish.          | Foreman mode, close/submit workflow, review queue.          | P0       | Daily logs/jobs.                        | Stay on Daily Logs/Job Notes until shared field system is approved. |
| Photos/evidence             | Partially Implemented | Contractor-side evidence upload, signed preview, archive/restore. | Camera UX, thumbnails, offline queue, portal-safe review.   | P0       | Storage, execution attachments.         | Internal-only by default.                                           |
| Crew schedule               | Partially Implemented | Responsive CrewBoard foundations.                                 | Crew day view, route/day sheet, field check-in/out.         | P0       | Schedule/jobs/people.                   | No separate crew schedule model.                                    |
| Punch/time                  | Partially Implemented | Time punch, time cards, punchlists, work items.                   | Mobile worker queue, approvals, geofence if approved.       | P1       | People/time/jobs.                       | Field state remains canonical and auditable.                        |
| Offline                     | Planned               | No production offline queue.                                      | Offline data policy, sync conflict handling, retry.         | P2       | Mature mobile workflows.                | Offline cannot bypass server validation.                            |
| Foreman mode                | Planned / partial     | Field work-item view and Daily Log polish.                        | Foreman home, crew assignments, blockers, photos, closeout. | P1       | Jobs, schedule, daily logs, work items. | Foreman mode is a role-aware view over existing records.            |
| Simplified field navigation | Partially Implemented | `/field/work-items` and field-focused surfaces.                   | Dedicated field nav and route hierarchy.                    | P1       | People linkage, auth roles.             | Do not create an employee portal without permission design.         |

### 22. Security / Compliance / Reliability

| Item                   | Current status         | What exists today                                                            | Missing / next slices                              | Priority | Dependencies                           | Guardrail                                                |
| ---------------------- | ---------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- | -------- | -------------------------------------- | -------------------------------------------------------- |
| RLS/tenant isolation   | Implemented foundation | Tenant-owned RLS and scoped server loaders.                                  | Periodic policy audit and second-tenant E2E.       | P0       | Supabase policies/tests.               | Tenant isolation is non-negotiable.                      |
| Role permissions       | Partially Implemented  | Roles and owner/admin gates.                                                 | Broader project/action permissions and UI.         | P0       | Memberships, portal permissions.       | Never infer permissions from UI-only hiding.             |
| Audit logs             | Partially Implemented  | Payment, notification, export, workflow error, GateKeeper ledgers.           | Central audit review and incident workflows.       | P1       | Event tables, platform ops.            | Sensitive payloads/secrets must not be logged.           |
| Financial immutability | Partially Implemented  | Payment events, approved snapshots, line lineage, revisions.                 | Void/credit/refund/dispute policy and audit.       | P0       | Financial architecture.                | Avoid destructive financial mutation.                    |
| Webhook verification   | Partially Implemented  | Stripe payment/SaaS signed webhook routes.                                   | Provider-wide webhook test suite and monitoring.   | P0       | Providers/env.                         | Signature verification and idempotency required.         |
| Backup/recovery        | Needs Audit            | Supabase/Vercel operational docs exist indirectly.                           | Backup/restore runbook and restore drill.          | P0       | Hosting/database provider.             | Production readiness needs recovery proof.               |
| Monitoring/logging     | Foundation Built       | Platform operations read-only surface and workflow error events.             | Sentry/logging, alerting, uptime, provider health. | P0       | Deployment/staging.                    | Do not expose stack traces or secrets.                   |
| Incident process       | Planned                | Security threat model/system risk docs.                                      | Production incident runbook and owner roles.       | P1       | Monitoring, audit logs.                | Incidents require explicit severity and response policy. |
| QA/E2E coverage        | Partially Implemented  | Auth, portal, payments, schedule, dashboard, super-admin specs and runbooks. | Broader regression suite and stable staging smoke. | P0       | Playwright auth fixtures, remote data. | Blockers must be reported honestly.                      |

### 23. Billing / Subscriptions / Packages

| Item                        | Current status        | What exists today                                                                  | Missing / next slices                                           | Priority | Dependencies                      | Guardrail                                                           |
| --------------------------- | --------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------- | --------------------------------- | ------------------------------------------------------------------- |
| Setup/billing flow          | Partially Implemented | No-charge SetupIntent, test-mode SaaS Checkout bridge, pending activation.         | Live billing launch and public self-serve policy.               | P0       | Stripe config, platform settings. | Billing setup does not activate tenant.                             |
| Early access activation     | Partially Implemented | Manual activation, founder billing evidence, platform admin views.                 | Activation gates, onboarding policy, support workflows.         | P0       | Super-admin, company status.      | Manual activation remains owner-reviewed.                           |
| SaaS packages               | Foundation Built      | Platform package/read-only billing operations and product/price setup foundations. | Live packages, package pages, pricing, entitlement enforcement. | P1       | Billing settings, modules.        | Package state does not equal runtime entitlement until implemented. |
| Module entitlements         | Planned / foundation  | Module controls/package governance foundations.                                    | Enforcement helpers, UI gates, billing integration.             | P1       | Packages, auth/roles.             | Entitlements must not fork core models.                             |
| AI as higher-tier feature   | Future / Strategic    | AI settings/foundation exist.                                                      | Package policy and AI provider cost controls.                   | P2       | Entitlements, AI provider.        | AI controls cannot imply autonomous capability.                     |
| Feature-request capture     | Partially Implemented | Early-access feedback through workflow error events.                               | Structured request/vote/backlog capture.                        | P2       | Platform ops, support.            | Feedback is not product truth.                                      |
| Trial/demo/sandbox strategy | Planned               | Staging/demo runbooks and no-write demo policy.                                    | Real demo tenant setup, sandbox/fixture policy, cleanup.        | P1       | Staging, auth, data setup.        | No fake dashboard or demo-only protected data.                      |

## D. Updated Completion Timeline

These horizons are planning windows, not promises. They assume focused product
work on one guarded slice at a time, current team capacity similar to recent
work, and no major provider/security blockers.

| Phase                                                    | Horizon      | Objective                                                        | Major outcomes                                                                                                                           | Included build slices                                                                                                           | Dependencies                                                                     | Definition of done                                                                                              | Readiness impact                                             |
| -------------------------------------------------------- | ------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Phase 0: Source-of-truth audit and planning cleanup      | 0-2 weeks    | Keep the map honest before expanding.                            | Build list, roadmap alignment, active docs linked, demo caveats clear.                                                                   | This doc, roadmap pointer cleanup, handoff update, doc graph alignment.                                                         | Current docs and branch status.                                                  | Product owner can see built/partial/not-built/future without decoding scattered docs.                           | Reduces planning drift and overclaiming.                     |
| Phase 1: Operational Core Completion                     | 2-8 weeks    | Make the existing chain feel like one daily operating system.    | Project Workspace maturity, readiness/source blockers, estimate/catalog/system depth, invoice/CO clarity, production readiness, core QA. | Project Workspace vNext, estimate/catalog/system builder depth, change-order/invoice impact, document readiness, production QA. | Current canonical lifecycle and project hub.                                     | A contractor can run the core lead-to-payment demo with fewer manual leaps and clear blockers.                  | Moves from demo foundation toward bounded contractor beta.   |
| Phase 2: Scheduling / Communications / Reporting Density | 2-4 months   | Add the missing operating nervous system.                        | Dispatch-grade schedule board, record-linked communications center, reporting priorities.                                                | Scheduling Calendar/Board v1, Communications Center v1, Reporting/Operations Dashboard v1, reminder policy design.              | Jobs/assignments, communications, reports, portal grants.                        | Managers can see what is scheduled, waiting, blocked, unanswered, overdue, and collectible.                     | Makes daily office/ops use credible.                         |
| Phase 3: Portal, Mobile, Financial Depth                 | 4-6 months   | Make the system practical for customers, crews, and collections. | Customer portal maturity, mobile field workflow, AR/reconciliation, progress billing, tax.                                               | Portal Maturity v1, Mobile Field Daily Workflow v1, Financial Collections/Reconciliation vNext, AIA/tax depth.                  | Portal access, daily logs/evidence, payment events, SOV.                         | Customers can self-serve core review/pay/status; crews can use field flows daily; finance can reconcile basics. | Raises early commercial launch readiness.                    |
| Phase 4: Integrations and Automation Maturity            | 6-9 months   | Connect providers without creating source-of-truth silos.        | External e-sign, email/SMS delivery proof, accounting/tax/calendar adapters, deterministic automation.                                   | E-sign adapter, provider delivery telemetry, accounting/tax export/sync, calendar sync, automation rules v1.                    | Mature contracts, communications, financials, schedule, preferences.             | Providers enrich canonical records with verified, idempotent, auditable events.                                 | Supports production operations beyond controlled demos.      |
| Phase 5: AI Intelligence and Growth Platform             | 9-12+ months | Scale assistance after the machine is sturdy.                    | AI drafting/summaries, intake support, growth/website foundations, trusted metrics.                                                      | AI assistance controls, AI intake/follow-up, contractor websites/attribution, operational intelligence.                         | Reporting/communications/automation maturity.                                    | AI remains review-first and source-linked; growth feeds canonical opportunities.                                | Differentiates product without fragmenting it.               |
| Phase 6: Ecosystem / Marketplace / Contractor Network    | 12+ months   | Explore platform network effects safely.                         | Approved partner network, scoped collaboration, later marketplace planning.                                                              | Contractor Network docs/design, partner access, compliance, project/job collaboration.                                          | Permissions/RLS, scheduling, communications, compliance, portal/access maturity. | External collaborators can help on scoped records without owning duplicate projects/jobs/financials.            | Long-term ecosystem option, not core-completion requirement. |

## E. Recommended Immediate Build Order

1. Project Workspace Maturity vNext
   - Why it matters: Project is the daily operating home and the best place to
     convert the existing spine into a usable workflow.
   - Build: clearer lifecycle position, source-linked blockers, action lanes,
     activity/proof depth, schedule/field/finance continuity.
   - Do not build: new project model, project-local invoice/job copies, fake
     health scores.
   - Acceptance: source records drive every blocker and next move; users can
     leave and return to the full record workspace.
   - Docs: `current-state`, `workflows`, this doc if scope changes.
   - Inspect: `apps/web/app/(app)/projects`, `apps/web/lib/projects`.

2. Scheduling Calendar/Board v1
   - Why it matters: Scheduling is one of the largest remaining daily-use gaps.
   - Build: dispatch-grade calendar/board over jobs, assignments, readiness,
     day/week/resource views, conflict/capacity warnings.
   - Do not build: schedule-only records, route optimization first, automatic
     dispatch.
   - Acceptance: office users can see ready/blocked/scheduled/missing-crew
     work and confirm changes through existing canonical actions.
   - Docs: `Roadmap`, schedule design docs, `current-state` after implementation.
   - Inspect: `apps/web/app/(app)/schedule`, `apps/web/lib/schedule`.

3. Communications Center v1
   - Why it matters: Follow-up, replies, delivery proof, and customer context
     need one record-linked work surface.
   - Build: stronger queueing, customer-visible/internal separation, reply
     triage, delivery context, source-record handoffs.
   - Do not build: free-floating chat, provider auto-sends, AI inbox.
   - Acceptance: record-linked conversations and waiting-response states are
     clear from `/communications` and key workspaces.
   - Docs: `communications-layer`, `workflows`, `current-state`.
   - Inspect: `apps/web/app/(app)/communications`, `apps/web/lib/communications`.

4. Reporting/Operations Dashboard v1
   - Why it matters: Operators need priorities, not decorative charts.
   - Build: schedule attention, AR, project readiness, field blockers, sales
     conversion, drill-through to source records.
   - Do not build: vanity BI, manual metric entry, duplicated analytics tables
     unless performance requires approved projections later.
   - Acceptance: every metric links back to canonical evidence.
   - Docs: `reporting-and-metrics`, `current-state`.
   - Inspect: `apps/web/app/(app)/reports`, `apps/web/lib/reports`.

5. Portal Maturity v1
   - Why it matters: Customer experience needs to feel coherent, not merely
     functional.
   - Build: portal project status, messaging, schedule visibility, shared
     documents, payment/signature clarity.
   - Do not build: portal-only copies, contractor-only blocker exposure.
   - Acceptance: portal customer can understand status and act on estimate,
     contract, invoice/payment, change order, and shared docs safely.
   - Docs: `portal-architecture`, portal design docs, `current-state`.
   - Inspect: `apps/web/app/(portal)/portal`, `apps/web/lib/portal`.

6. Mobile Field Daily Workflow v1
   - Why it matters: Field adoption depends on daily use from a phone.
   - Build: foreman day view, daily log, blockers, job notes, photos/evidence,
     time punch, work items.
   - Do not build: offline sync first, customer sharing by default, duplicate
     issue systems.
   - Acceptance: a foreman can open today's work, log progress/blockers/photos,
     and hand evidence back to project/closeout.
   - Docs: mobile field design docs, `current-state`.
   - Inspect: daily logs, jobs, field routes, execution attachments.

7. Financial Collections/Reconciliation vNext
   - Why it matters: Contractor cash flow requires trusted collection state.
   - Build: AR actions, payment-event review, failed/pending stale handling,
     reconciliation workflow, deposits/retainage clarity.
   - Do not build: duplicate ledger, provider retries without policy, accounting
     sync before export/reconciliation is clear.
   - Acceptance: finance can identify collectible invoices and review payment
     evidence without leaving canonical records.
   - Docs: `financial-architecture`, `current-state`.
   - Inspect: invoices, payments, financials, payment events.

8. Document/PDF/Delivery Proof vNext
   - Why it matters: Contractors need defensible documents and proof.
   - Build: stored document versions where needed, delivery proof lifecycle,
     closeout package, template switching.
   - Do not build: document records that replace estimates/contracts/invoices.
   - Acceptance: generated docs are versioned evidence over canonical records
     with clear delivery status.
   - Docs: document delivery proof docs, document engine docs.
   - Inspect: templates, document engine, notification deliveries.

9. Workflow Automation Rules v1
   - Why it matters: Repeated follow-up should become deterministic and safe.
   - Build: narrow trigger/action catalog, audit, idempotency, approval gates,
     notification-only or work-item-only first.
   - Do not build: broad autonomous workflow engine or provider sends without
     policy.
   - Acceptance: one or two safe automation categories run with clear audit and
     disable controls.
   - Docs: `automation-layer`, `platform-maturity-model`.
   - Inspect: automation, notifications, work items, cue rules.

10. Module Entitlements and Package Readiness
    - Why it matters: Commercial launch needs packages without runtime drift.
    - Build: package capability map, module gate helpers, read-only readiness
      indicators, activation/billing separation.
    - Do not build: live billing or entitlement mutation without launch policy.
    - Acceptance: product owner can see which features belong to which package
      and what enforcement exists.
    - Docs: paid early access, SaaS billing, this doc.
    - Inspect: super-admin packages, settings modules, billing settings.

11. Estimate/Catalog/System Builder Depth
    - Why it matters: Specialty flooring differentiation depends on systems,
      materials, labor, and production assumptions.
    - Build: templates, optional components, cost/labor fields, reviewable
      generation, selected-system handoff.
    - Do not build: takeoff-to-invoice, manual freeform pricing bypass, customer
      exposure of internal markup.
    - Acceptance: common flooring systems can generate reviewed estimate lines
      from reliable catalog/system inputs.
    - Docs: estimate builder docs, inventory/cost architecture.
    - Inspect: estimates, catalogs, selected systems, materials.

12. Contractor Network Docs/Design Only
    - Why it matters: The concept is strategic, but premature implementation is
      risky.
    - Build: permission model, access categories, anti-marketplace rules,
      sequencing.
    - Do not build: runtime network, public marketplace, partner job copies.
    - Acceptance: future work has a clear no-duplicate-record design.
    - Docs: `contractor-collaboration-network`, `platform-build-registry`.
    - Inspect: docs only unless explicitly widened.

13. AI Assistance Readiness Controls
    - Why it matters: AI should be useful only where records and review paths
      are mature.
    - Build: provider-off/on controls, audit, review-confirm boundaries,
      category toggles, demo-safe mode.
    - Do not build: customer-facing AI, autonomous actions, AI-only records.
    - Acceptance: AI assistance can be enabled safely per category with
      deterministic fallback.
    - Docs: AI/copilot, GateKeeper, platform maturity model.
    - Inspect: workflow settings, AI provider facade, communications handoff.

14. Production QA/Monitoring Hardening
    - Why it matters: Production readiness is more than passing local typecheck.
    - Build: staging smoke, provider health, logging, error monitoring, backup
      and incident runbooks.
    - Do not build: deploy/provider mutation without owner scope.
    - Acceptance: staging/demo status is reproducible and blockers are named.
    - Docs: staging/demo readiness, QA runbooks, security/risk docs.
    - Inspect: scripts, Playwright, deployment/env docs.

15. Investor/Demo Readiness Polish
    - Why it matters: The current story is strong if framed honestly.
    - Build: route rehearsal, fixture-known demo path, copy that distinguishes
      built/foundation/future.
    - Do not build: fake dashboards, demo-only protected data, overstated AI or
      provider claims.
    - Acceptance: demo can show canonical continuity without pretending depth is
      finished.
    - Docs: founder demo, staging demo, feature build status.
    - Inspect: demo runbooks, route smoke, product language.

## F. Completion Definition

FloorConnector should not be called Core Complete until all of these are true:

- Project Workspace feels like the operational home for real daily work.
- The lead-to-payment workflow is coherent and demoable end to end.
- Scheduling board/calendar exists at dispatch-grade v1 over canonical jobs and
  assignments.
- Communications are connected to records, not scattered or provider-owned.
- Reporting shows operational priorities and source-linked evidence.
- Customer portal is usable for customer review, status, documents, messaging,
  signing, payment, and shared evidence.
- Mobile field flow supports daily use for foremen/crews.
- Financial workflows cover deposits, collections, basic reconciliation,
  retainage basics, and progress-billing fundamentals.
- No canonical architecture violations exist: no portal copies, no module-local
  customer/project/job/invoice/payment models, no provider-owned business truth.
- QA, staging/demo runbooks, docs, and current-state status are aligned.

## G. Risks And Tradeoffs

- Feature spread before operational density: the product can look broad while
  still feeling thin in daily contractor use.
- AI before workflow maturity: AI becomes noise or risk if scheduling,
  communications, reporting, and approvals are not dependable.
- Marketplace before contractor stickiness: network effects should wait until
  single-contractor workflows are strong.
- Provider integrations becoming source-of-truth silos: Stripe, SignWell,
  Postmark, calendars, accounting, and tax providers must enrich canonical
  records, not own them.
- Portal copies: customer-facing surfaces must keep acting on shared canonical
  records.
- Scheduling as disconnected dispatch: crew boards, calendars, and route views
  must stay on jobs, assignments, appointments, people, vendors, and equipment.
- Reporting as vanity dashboards: metrics must tell operators what needs
  attention and link back to evidence.
- UI redesign breaking canonical workflows: design work must preserve the
  current Graphite/Copper baseline and project-centered workflow.
- Stale docs overstating implementation: `current-state.md` wins when status
  conflicts arise.

## H. Documentation Updates

This document should be linked from:

- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) as the detailed build
  list and horizon-based timeline.
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md) as a required
  planning reference for next-phase work.
- [docs/README.md](C:/FloorConnector/docs/README.md) under product/workflow
  direction or feature planning.

Only update [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
when implementation changes or a current implemented-status correction is
clearly proven. This document is planning and sequencing, not implemented truth.
