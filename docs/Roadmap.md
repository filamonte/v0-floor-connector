# FloorConnector Roadmap

Status: phased implementation plan.

This document describes the **phased implementation plan** for FloorConnector.

It tracks delivery sequence and major platform milestones. It should be read alongside:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for implemented status
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target system design
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term Estimate Builder blueprint
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): constrained Estimate Builder V1 scope
- [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md): UI, directory/contact, tax, Estimate Editoror, workflow-guidance, project-address, and configurable-view alignment backlog
- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md): target AI-assisted operating system direction
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

This document is sequencing guidance, not a claim that a later phase is already implemented. If status and plan conflict, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for current reality.

## Canonical Lifecycle Alignment

All roadmap phases extend and refine the same canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

No phase introduces a parallel workflow or replaces this chain. Later phases deepen, connect, and improve clarity within the same system.

Public acquisition extends the front of the same graph rather than creating a separate marketing product:

`public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`

Contractor websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, attribution, AI intake, reviews, galleries, portals, communications, and operational workflows should all reinforce that graph.

## Phase 1

**Current implemented foundation**

Phase 1 established the production-oriented core system. The branch already contains the shared architecture, tenant model, Supabase integration, and first connected business workflows. It does **not** mean every surface is fully polished, but the canonical operational backbone is in place.

Included in Phase 1:

- auth
- organizations and memberships
- opportunities / leads
- customers
- projects
- estimates and estimate line items
- approved estimate snapshots and customer portal approval flow
- shared templates
- change orders and approved change-order snapshots
- contracts
- contract signature foundation, customer-facing portal signing, and contractor-side onsite signing on canonical contracts
- jobs
- invoices and invoice line items
- snapshot-based invoice lineage and schedule-of-values lineage
- payments
- customer-facing payment foundation on canonical invoices and payments
- notifications, notification deliveries, and communications foundations
- people, vendors, and compliance foundations
- time tracking foundations
- daily logs and field-execution foundations
- customer portal access, review, and contract-signature foundations
- tax, retainage, and AIA-ready financial scaffolding

## Phase 2

**Current phase: Phase B validation and foundation hardening**

Current reality:

- first-pass operational depth, schedule, communications, reporting, Sales Tax Summary, manual notification-only automation, onboarding readiness, and contractor UI normalization foundations are implemented on the current branch
- `/schedule` has first-pass planner/board and crew-assignment continuity on canonical jobs and `job_assignments`
- `/communications` has a first contractor-side review surface, URL-driven filtering, safe replies on existing canonical threads, and notification triage without provider sends or automation execution
- `/reports` has narrow read-only internal-beta summaries over canonical records, including Sales Tax Summary

Current focus:

- run and record seed-free Phase B validation before contractor beta
- verify reporting and Sales Tax Summary accuracy against canonical invoices, payments, opportunities, estimates, projects, and tax snapshots
- validate the manual automation runner's duplicate guard and recipient behavior
- complete internal beta support/release checklist, onboarding runbook, beta candidate criteria, and bug triage process
- fix validation-blocking defects without expanding into unrelated feature breadth
- keep contractor admin and super-admin responsibilities clearly separated as more modules plug into settings
- document the future company-brain architecture without treating it as implemented behavior
- preserve the current canonical model while designing product/spec, shared file/evidence, and communication-delivery foundations
- tighten the project hub and readiness story around existing canonical records before adding broader new workflow depth

## Phase C: Operational Depth Systems

Planned focus:

- HR + OSHA / Safety System: Introduce incident entity, extend people, compliance_records, time tracking, projects/jobs for HR and safety management.

- Unified Task System: Define Task as canonical entity attaching to any record for assignable, lifecycle-tracked tasks.

- Progress Billing / AIA System: Extend ScheduleOfValues, invoices for % complete, G702/G703, retainage.

- Website + Lead Ingestion + Marketing Layer: Add the public acquisition layer for contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign/source attribution, and website-generated opportunities. This layer feeds canonical opportunities and must not create a second CRM or marketing-contact database.

- Purchasing + Inventory System: Extend catalog_items, inventory_items for purchase orders, stock tracking.

- Subcontractor System: Extend vendors, people, compliance_records for onboarding and compliance.

- PTO / Workforce Management: Add PTO accrual, requests, approval on people, time tracking.

- Service Layer: Define AI, call intelligence, takeoffs, marketplace, marketing automation, forecasting as read-only enrichments.

- Mobile-First Field Workflows: Ensure all field workflows support mobile for time tracking, incident capture, photos, tasks, daily logs, safety checklists.

- Canonical Entity Cleanup: Clarify entities, remove Deal, ensure EmployeeProfile extends people.

## Company Brain Foundation Sequence

This sequence is future roadmap guidance. It does not mean the product/finish/spec, shared file-link, delivery-event, or activity-timeline layers are implemented today.

Recommended sequence:

- Phase 2 / near term: document target architecture, preserve current canonical records, tighten project hub/readiness, and design the product/spec/file/delivery foundations without creating duplicate records.
- Next foundation slice: product/finish/spec model planning, manufacturer/product metadata planning, and shared file-link model planning. Manufacturer/product metadata should support Torginol-style vendor, product line, product code, product images, spec sheets, and technical notes without hardcoding a vendor commitment.
- Next workflow slice: selected system/spec integration into estimate and contract review, including snapshot/lock behavior once approval or contract/signature activity begins.
- Next communication slice: communication threads/messages plus delivery attempts/events for estimates, contracts, invoices, change orders, payment requests, and portal invites.
- Next memory slice: activity timeline over the project/customer/record chain, rendered as readable memory over canonical records rather than a replacement source of truth.
- Later: visualizer handoff, mobile/offline capture, AI auto-linking/classification, smart change-order detection, and deeper field/material/job-costing workflows.

Guardrails:

- visual/product/finish selection may begin before lead intake, but operational use must eventually attach to canonical records instead of session-only or module-local data
- selected finish/spec data should flow through `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment` without replacing that lifecycle
- finish systems represent what is sold and installed; they should not degrade into loose estimate descriptions
- shared files/evidence should be linkable across projects, opportunities, estimates, contracts, jobs, invoices, payments, change orders, daily logs, field notes, selected systems/specs, and finish products
- delivery telemetry from providers should be stored as immutable delivery events tied to canonical records, while open/click signals remain useful but imperfect evidence

## AI, Communications, Scheduling, And Onboarding Sequence

This sequence is future roadmap guidance. It does not mean AI chat, AI receptionist, full unified inbox, external calendar sync, or broad AI workflow execution is implemented today.

Recommended sequence:

1. Documentation and architecture planning.
   - Use [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md), [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md), [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md), [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md), and [docs/ai-marketing-and-onboarding.md](C:/FloorConnector/docs/ai-marketing-and-onboarding.md) as target planning docs.

2. First vertical slice: lead communication plus appointment scheduling foundation.
   - Extend canonical opportunities, communication threads/messages, and appointments.
   - Keep appointment scheduling attached to the opportunity/customer/project chain.

3. Communication timeline and unified inbox.
   - Expand canonical communication history across website forms, web chat, email, SMS, portal/app messages, calls, voicemail, and manual logs.
   - Keep provider data as telemetry and delivery context, not business truth.

4. External calendar integrations.
   - Start with one-way FloorConnector -> Google/Outlook calendar publishing.
   - Add external busy-block import later.
   - Consider two-way sync only after ownership, reconciliation, permissions, and audit rules are designed.

5. AI-assisted drafting and summaries.
   - Add low-risk drafting, summarization, classification, and next-action recommendations over canonical records.
   - Require human approval before customer-facing sends, schedule changes, pricing, contract, invoice, payment, permission, or compliance actions.

6. Website chat, public intake, and onboarding assistant.
   - Support public Q&A, sales/demo qualification, website-generated opportunity intake, signup/setup guidance, and first-workflow activation without overclaiming target-only capabilities.
   - Keep public AI intake tied to canonical opportunities, communications, appointments, and human-approved workflow actions.

7. AI voice/receptionist.
   - Capture call intake, missed-call follow-up, voicemail summaries, and human handoff after consent, recording, quiet-hours, and escalation rules are designed.

8. Operational intelligence.
   - Summarize readiness, scheduling, communication, collections, activation, and capacity risk across canonical records.

Guardrails:

- AI is an operating layer, not a parallel system.
- Do not introduce AI-only business entities, calendars, communication logs, or workflow chains.
- Communications attach to canonical records.
- FloorConnector owns the canonical schedule; Google/Outlook are adapters.
- Human confirmation is required for risky actions unless a later explicitly approved workflow configures otherwise.

## Phase 3

**Next: project workspace**

Planned focus:

- make project the primary operational workspace
- connect estimates, contracts, jobs, invoices, files, and activity more clearly inside the project context
- make project the future operational memory hub for selected finish/spec context, delivery proof, files/evidence, communication history, and activity timeline views
- align project/service address display with the planned structured address direction while keeping it distinct from customer billing/contact address
- strengthen project-scoped site info, plan/photo/file inputs, and scope summary foundations that can later support Takeoff & Scope Intelligence
- strengthen readiness, blockers, and next-action guidance
- add tasks and richer role-based queue behavior on top of the existing notification foundation
- add file attachments and shared activity foundations where needed

## Phase 4

**Next: deeper scheduling and dispatch**

Planned focus:

- dispatch-grade scheduling and schedule-readiness workflows beyond the current first-pass planner/board foundation
- deeper crew coordination and assignment automation beyond current canonical `job_assignments` review/assignment
- richer calendar, dispatch board, rescheduling, and operational planning controls
- deeper execution planning and operational scheduling on top of the already-implemented time and daily-log foundations

## Phase 5

**Next: materials and reusable catalogs**

Current reality and planned focus:

- reusable catalog foundation already exists on canonical `catalog_items`
- estimate-side catalog insertion has begun: active non-system catalog items can be added to estimate line items as server-owned snapshots, while archived items are blocked and systems still use the existing expansion flow
- deepen reusable item and materials catalog management on top of the existing `catalog_items` foundation
- seeded organization-owned defaults beyond the current starter catalog/settings foundation
- deeper shared catalog support inside estimating, invoicing, contracts, and future execution workflows, with snapshot behavior preserved where commercial records are created
- future invoice catalog usage remains deferred and should stay conservative, favoring approved estimate, SOV, change-order, and invoice-only lineage instead of live catalog billing shortcuts
- richer materials workflows, inventory quantity/reservation/issue/return workflows, and job material planning remain future work
- assemblies/systems still need deeper formula, optional component, versioning, and regeneration policy work beyond the current system expansion foundation
- SOV/progress billing depth remains future work and should continue to use approved commercial snapshot lineage, not live catalog prices
- catalog/cost item behavior that can define reusable cost, markup, pricing, production, and tax defaults while still allowing intentional estimate-level overrides that remain internal in edit mode
- Estimate Builder work in this phase should follow [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md), with current execution constrained by [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md)
- planned manual measurement-driven estimating foundations where length x width, direct floor area, direct linear footage, counts, and optional room/zone detail can produce quantities for reviewed estimate generation
- planned System Template foundations where reusable estimating systems extend `catalog_items` and catalog-backed components with formulas, grouping rules, optional components, and required inputs
- planned Templates & Systems settings/admin area for document templates, System Templates, add-ons/options, and sharing/review settings instead of scattering those controls across estimate, invoice, and contract modules
- planned add-on/option foundations for catalog-backed optional scope modifiers such as integrated cove base, vinyl cove base, control joints, crack repair, coating removal, moisture mitigation, extra topcoat, mobilization/setup, and future labor adjustments
- planned template sharing loop where contractor-created templates/systems/add-ons can be marked shareable, reviewed by super admin, stripped or anonymized for private cost/markup/margin/internal notes, and promoted as platform defaults without silently updating contractor local copies
- planned on-screen Takeoff & Scope Intelligence foundations where project-scoped plan/PDF/drawing measurement can produce quantities, map through System Templates and reusable catalog/cost items, and generate reviewed estimate line items
- planned visual/product/finish selection foundations where pre-lead finish choices can later become canonical selected-system/spec records, with finish families such as decorative flake, metallic epoxy, decorative quartz, solid color, and future surface systems
- planned manufacturer/product metadata foundations for vendor, product line, product code, images, spec sheets, and technical notes, using examples such as Torginol-style product metadata without committing to one vendor
- planned selected-system/spec snapshot behavior so approved or signature-active work does not silently change after estimate or contract truth is established
- richer shared template and document editing capability
- broader document workflow refinement

Takeoff work in this phase would be planned direction only. Manual measurements are not takeoff; they are contractor-entered quantities or dimensions. Takeoff means plan, PDF, or drawing-based measurement. Both input paths should support the canonical estimate workflow and the existing `catalog_items` cost item database instead of becoming separate estimating apps. Takeoff and measurement quantities may eventually inform material requirements, labor estimation, production readiness, and job planning, but they should flow through reviewed estimates before contracts, jobs, invoices, or payments.

Visualizer and selected-finish work in this phase would also be planned direction only. A future room visualizer may start before lead intake, but selected finish/spec data should become canonical selected-system/spec context only when accepted into the shared workflow. It should not become a parallel lead, project, estimate, or product model.

Document-template work in this phase should preserve the existing copied-template model: platform defaults seed contractor-owned templates, contractors can edit local copies and switch templates per estimate, invoice, or contract where supported, and future proposal/SOW or work order templates should extend the same shared template foundation instead of creating module-specific template silos.

## Phase 6

**Next: external integrations**

Planned focus:

- e-sign integration on top of canonical contracts
- deeper payment-provider support, reconciliation, retry, and provider lifecycle tooling on top of canonical payments
- deeper PDF generation, document delivery, and provider lifecycle tooling beyond the current canonical contract PDF snapshot foundation
- delivery attempts/events for estimates, contracts, invoices, change orders, portal invites, and payment requests, including queued, sent, delivered, opened, clicked, deferred, bounced, blocked, dropped, and failed where providers support those states
- external tax provider integration
- accounting and adjacent third-party integrations behind shared adapters

Provider event data should remain delivery telemetry. FloorConnector's canonical records and immutable delivery events remain the business source of truth, and open/click tracking should not be treated as perfect legal certainty.

## Phase 7

**Later: portal, communications, and scoped collaboration expansion**

Planned focus:

- broader customer portal workflows beyond the current access, review, and contract-signature foundation
- richer customer-facing payment self-service and post-review actions beyond the current portal invoice/payment handoff
- record-based communication tied to projects, jobs, change orders, invoices, daily logs, field notes, and other canonical workflow records
- canonical communication/delivery records for estimate sends, contract sends/signature requests, invoice sends, change-order sends, payment requests, portal invites, app messages, SMS, email, and manual logs
- unified intake direction across website forms, website AI chat, SMS, email, calls, voicemail, missed-call text-back, and human-assisted intake, all resolving into canonical opportunity/customer/project workflows
- scoped subcontractor/vendor/project partner collaboration where invited external participants can access only explicitly shared project or job workrooms
- project/job workrooms for limited status updates, photo uploads, field notes, files, and record-tied communication
- shared activity timelines for project, customer, and record workspaces that summarize canonical events without becoming a separate source of truth

This is planned direction only. It does not mean contractor network collaboration, subcontractor portal access, or contractor-to-contractor messaging is currently implemented.

## Phase 8

**Later: broader platform expansion**

Current implemented foundation:

- Super Admin Platform Evolution now includes a read-only `/super-admin/operations` Platform Operations / System Health foundation. It centralizes existing platform health, workflow-error, starter-pack audit/attempt, contractor group audit, membership, and assignment-intent signals for platform admins only. This foundation is observability-only: it does not remediate, retry, fix, resolve, archive, delete, provision, assign, enforce entitlements, change pricing/packages, affect runtime behavior, run AI, schedule background jobs, or trigger automation.
- Super Admin Platform Evolution now includes a read-only `/super-admin/packages` Package / Billing Plan Governance foundation. It summarizes existing company lifecycle, company subscription, linked subscription plan, billing setup reference, and safe Stripe configuration-presence signals for platform admins only. This foundation is observability-only: it does not create subscriptions, call Stripe, charge cards, manage invoices, enforce entitlements, gate modules, change pricing/packages, change contractor permissions, change billing setup, or affect runtime behavior.
- The Packages surface now includes a persisted, read-only Package Definition Catalog backed by `platform_package_definitions` and `platform_package_definition_versions`. This first package-definition schema/read-model slice creates platform-owned package definition/version records with forced RLS, revoked broad client grants, normalized package keys, version uniqueness, safe JSON intent snapshots, and platform-admin-only server reads. It does not add package mutation UI, lifecycle controls, package assignment behavior, billing workflows, Stripe operations, entitlements, module gates, package assignment records, contractor permission changes, or runtime behavior.
- The Packages surface now includes read-only package definition detail inspection at `/super-admin/packages/[packageDefinitionId]`. This detail slice loads one package definition and its versions, derives status counts and caveats, summarizes JSON intent/snapshot presence without raw dumping, and renders safe unknown-id and empty-version states. It does not add package mutation UI, lifecycle mutation controls, package assignment behavior, billing workflows, Stripe operations, subscriptions, entitlements, module gates, contractor permission changes, reporting/export behavior, automation, AI behavior, starter-pack provisioning changes, or runtime behavior.
- The Packages detail surface now includes read-only package definition audit evidence backed by `platform_package_definition_audit_events`. This audit slice adds one conservative package-definition/version audit table with forced RLS, revoked broad client grants, constrained event types, object-only JSON snapshots/metadata, platform-admin-only server reads, and a read-only audit timeline. It does not add package mutation UI, approval/publish controls, package assignment behavior, billing workflows, Stripe operations, subscriptions, entitlements, module gates, reporting/export behavior, contractor permission changes, automation, AI behavior, starter-pack provisioning changes, or runtime behavior.
- The Packages surface now includes read-only contractor package assignment inspection backed by `contractor_package_assignments` and `contractor_package_assignment_audit_events`. This assignment schema/read-model slice adds platform-owned assignment/audit tables with forced RLS, revoked broad client grants, constrained assignment states and audit event types, object-only JSON snapshots, one-active-assignment-per-company protection, platform-admin-only server reads, assignment summary counts, status/event buckets, safe snapshot summaries, assignment readiness/caveats, and read-only empty states. It does not add assignment create/approve/schedule/activate/cancel server actions, package assignment mutation UI, lifecycle mutation controls, billing behavior, Stripe calls, subscriptions, entitlement enforcement, module gates, package activation behavior, contractor permission changes, reporting/export behavior, automation, AI behavior, starter-pack provisioning changes, or runtime behavior.
- The Packages surface now includes read-only contractor package assignment detail inspection at `/super-admin/packages/assignments/[assignmentId]`. This detail slice loads one assignment, linked company/package/version labels when available, matching assignment audit events, lifecycle/timing/supersession/cancellation/archive context, safe snapshot summaries, audit timeline rows, caveats, and safe unavailable states. It does not add assignment create/approve/schedule/activate/cancel server actions, package assignment mutation UI, package assignment activation behavior, billing behavior, Stripe calls, subscriptions, entitlement enforcement, module gates, contractor permission changes, reporting/export behavior, automation, AI behavior, starter-pack provisioning changes, or runtime behavior.
- The Packages assignment detail surface now includes read-only Contractor Package Assignment Activation Readiness. This pure readiness slice evaluates future transition readiness for draft, pending-review, approved, scheduled, active, canceled, superseded, and archived assignment states; surfaces missing company/package/version, package-version validity, missing effective/scheduled date, missing audit evidence, active-conflict, billing/provider intent-only, entitlement/module intent-only, runtime no-op, and unavailable-state caveats; and reports explicit no-action/no-mutation/no-runtime/no-billing/no-entitlement/no-contractor-permission/no-assignment-write flags. It does not add assignment create/approve/schedule/activate/cancel/supersede/archive server actions, package assignment mutation UI, package assignment activation behavior, billing behavior, Stripe calls, subscriptions, entitlement enforcement, module gates, contractor permission changes, reporting/export behavior, automation, AI behavior, starter-pack provisioning changes, or runtime behavior.
- The Packages surface now includes read-only package billing/provider mapping detail inspection at `/super-admin/packages/provider-mappings/[mappingId]`. This detail slice loads one provider mapping, linked assignment/company/package/version labels when available, matching provider mapping audit events, billing/reconciliation state, provider reference labels, safe expected/observed/mapping snapshot summaries, mismatch caveats, audit timeline rows, and safe unavailable states. It does not add Stripe/provider calls, subscription operations, billing execution, provider mutation behavior, package assignment mutation, package lifecycle mutation, entitlement enforcement, module gates, contractor permission changes, reporting/export behavior, automation, AI behavior, starter-pack provisioning changes, or runtime behavior.
- The Packages surface now includes read-only billing/provider support-review detail inspection at `/super-admin/packages/support-reviews/[supportReviewId]`. This detail slice loads one support review, linked provider mapping/assignment/company/package/version labels when available, matching support review events, review status/category/environment, safe provider-reference/reconciliation/webhook/operator/rollback evidence summaries, blocked/escalation caveats, event timeline rows, and safe unavailable states. It also adds read-only support-review detail links from package support-review rows and provider-mapping detail support-review rows when records exist. It does not add corrective-action execution, Stripe/provider calls, subscription operations, billing execution, provider mutation behavior, package assignment mutation, package lifecycle mutation, entitlement enforcement, module gates, contractor permission changes, reporting/export behavior, automation, AI behavior, starter-pack provisioning changes, or runtime behavior.
- The Packages surface still includes the static, read-only Future Package Definition Model planning panel. It defines package-definition dimensions and future boundaries beyond the first persistence/read catalog before billing workflows, entitlements, module gates, package assignment records, or Stripe-backed subscription behavior exist.

Package / Billing Governance planning model:

- Future package definitions should represent product/business packaging: package name, tier, included module families, target segment, lifecycle, default onboarding posture, and migration/grandfathering policy.
- Future billing plans should represent commercial/provider terms separately from product packaging: billing cadence, price basis, trial policy, provider mapping, invoices, subscription operations, and customer notices.
- Future entitlements should represent server-side runtime capability gates and must be enforced at the workflow boundary that owns the protected behavior, not inferred only from package labels or navigation visibility.
- Future module visibility should control navigation or module availability but must not replace server-side entitlement checks for privileged behavior.
- Future usage limits should be modeled only after the product defines counters, support policies, overage behavior, and safe enforcement points.
- Future starter pack defaults can map package selection to onboarding seeds for templates, catalogs, and systems, but starter-pack assignment remains onboarding/provisioning governance and not billing or entitlement enforcement.
- Future contractor group targeting can suggest package fit, starter-pack defaults, rollout cohorts, or migration segments, but contractor groups remain segmentation metadata and not billing plans, tenant roles, entitlements, package assignments, or contractor permissions.
- Future billing provider mapping can link internal billing plans to Stripe products, prices, subscriptions, and invoices, but provider artifacts must not become the product source of truth and must not expose secrets.
- Future trial/early-access status should stay distinct from package definitions and billing plans; activation continues to use existing tenant lifecycle/status fields until a separately scoped model replaces it.
- Future grandfathered/custom contracts need explicit exception handling before any enforcement or subscription migration can safely exist.

Future package lifecycle and approval workflow:

- Future package definitions should move through explicit lifecycle states: `draft`, `internal_review`, `approved`, `published`, `deprecated`, and `archived`.
- `draft` should allow platform operators to assemble package dimensions before any contractor-facing, billing, entitlement, or module behavior exists.
- `internal_review` should require review of package dimensions, billing/provider mapping, module availability, usage limits, starter-pack defaults, contractor group targeting, entitlement mapping, and Stripe/provider mapping.
- `approved` should mean an explicit platform-admin approval has been recorded with actor, timestamp, reason, confirmation text, impacted dimensions, and required snapshots; approval alone should not publish or assign the package.
- `published` should be available only after approval and future schema/RLS, authorization, provider, entitlement, module, migration, browser, and regression QA gates are satisfied.
- `deprecated` should be the normal path for replacing published packages; published package versions should not be destructively edited.
- `archived` should remove a package from future selection while preserving audit/version history for existing assignments, migrations, and support review.
- Future package definitions should be versioned. Published versions should be immutable or snapshotted, with deprecation and migration paths used instead of destructive edits.
- Future grandfathered/custom contractor handling should be modeled before enforcement so custom contracts do not silently inherit standard package changes.
- Future contractor package assignment must be separate from package definition. Assignments should be separately auditable and should not be inferred from contractor groups.
- Future package assignment should not automatically change billing without explicit approval, and a future billing change should not silently change entitlements, module visibility, or runtime access without audit.
- Future approval/audit evidence should include actor, timestamp, before/after snapshot, reason, confirmation text, impacted package dimensions, provider mapping snapshot, entitlement/module mapping snapshot, and rollback/deprecation strategy.
- Future safety constraints: no runtime enforcement until the entitlement model exists; no Stripe mutation until billing workflows exist; no contractor-facing package change until an assignment workflow exists; no module gating until module entitlement mapping exists; no automatic package changes from contractor groups; and no AI/automation package changes.
- Future QA gates should include read-model tests, schema/RLS tests, platform-admin authorization tests, Stripe sandbox tests before any live billing behavior, entitlement no-op tests, migration/versioning tests, browser QA, and regression checks proving no unintended contractor changes.

Contractor package assignment governance:

- Contractor package assignment persistence and read-only inspection now exist, but activation remains future. Contractor package assignment should be the audited link between a company/contractor and an approved/published package definition version. It is not the package definition itself, not a billing subscription, not entitlement enforcement, not module gating, not a contractor group, and not starter-pack provisioning.
- Future assignment lifecycle states should be `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived`.
- `draft` should capture a proposed contractor/company and package version before any assignment is approved, scheduled, activated, billed, or enforced.
- `pending_review` should require review of the current package/billing/entitlement context, pricing/billing impact, module/entitlement impact, starter-pack/onboarding implications, and package-version eligibility.
- `approved` should require explicit platform-admin reason and confirmation text. Approval alone should not activate the assignment, mutate billing, toggle entitlements, gate modules, or change contractor permissions.
- `scheduled` should allow a future effective date when a package change should not take effect immediately. Scheduling should still be audit-only until a separately implemented activation workflow exists.
- `active` should be reached only through a future audited action after package definition, assignment, authorization, billing-separation, entitlement-separation, and QA gates exist.
- `superseded` should preserve prior assignment history when a contractor moves to a replacement package version or a different package.
- `canceled` should preserve reviewed-but-not-activated assignment decisions without provider, entitlement, module, permission, or runtime side effects.
- `archived` should preserve historical assignment evidence for support, audits, migrations, and custom-contract review.
- Future assignment workflow should select the contractor/company, select an approved/published package version, review existing package/billing/entitlement context, review pricing/billing impact, review module/entitlement impact, review starter-pack/onboarding implications, require explicit platform-admin reason and confirmation, schedule an effective date when needed, activate only through an audited action, and preserve full assignment history.
- Future assignment audit evidence should capture actor, timestamp, company id/name, previous package assignment snapshot, new package assignment snapshot, selected package version, reason, confirmation text, effective date, billing impact summary, entitlement/module impact summary, provider mapping snapshot, starter-pack/onboarding implication snapshot, and rollback/supersession strategy.
- Future package assignment must stay separate from billing. Assigning a package should not silently create, update, or cancel a Stripe subscription; billing changes require a separate explicit billing workflow, and any staged billing change must remain independently auditable before provider execution.
- Future package assignment must stay separate from entitlement and module enforcement. Assignment alone should not silently toggle runtime access; entitlement/module gates require a separately implemented model and audit, and future enforcement may consume only explicit effective assignments after approval.
- Future contractor groups may help propose assignments, migration cohorts, or package-fit suggestions, but contractor groups must not auto-change package assignment. Group-driven suggestions should require manual review, stale-context checks, explicit platform-admin reason, and audit evidence.
- Future starter-pack implications should remain onboarding/provisioning context. Package assignment may suggest starter-pack defaults or onboarding review, but it must not auto-provision templates/catalogs, mutate tenant-owned records, or become entitlement/billing enforcement.
- Future migration/change paths should cover package-to-package moves, grandfathered/custom contracts, trial-to-paid package changes, early-access-to-active package changes, upgrades, downgrades, cancellation/suspension, and deprecation of old package versions.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, no-service-role-browser-exposure tests, no unintended billing mutation tests, no unintended entitlement/module runtime mutation tests, Stripe sandbox tests before provider behavior, browser QA, audit evidence verification, and rollback/supersession tests.

Package billing / provider mapping governance:

- The first read-only schema/read-model slice is implemented for provider mapping readiness and reconciliation inspection. It adds `contractor_package_billing_mappings` and `contractor_package_billing_mapping_audit_events`, platform-admin-only read helpers, focused tests, and a read-only `/super-admin/packages` section. No package billing/provider mapping write model, provider sync, Stripe subscription operation, billing mutation, package assignment write, entitlement enforcement, module gating, contractor permission change, or runtime behavior exists today.
- Future billing/provider mapping should connect approved package definitions, package versions, contractor package assignments, billing plans, billing prices, provider products, provider prices, provider customers, subscriptions, subscription items, billing status, trial/early-access status, custom/grandfathered commercial contracts, and payment-method/setup readiness without making provider artifacts the product source of truth.
- Package definitions should remain product packaging. Contractor package assignments should remain platform governance. Billing provider mapping should translate approved commercial terms to provider artifacts. Subscription state should reflect commercial/provider state. Entitlement/module enforcement should remain a separate future runtime layer. Contractor groups may suggest targeting but must not mutate billing. Starter packs/onboarding remain separate from billing.
- The implemented provider mapping readiness states are inspection-only billing and reconciliation states. They can represent not-started, mapped, verified, active, mismatch/support-review, suspended, deprecated, and archived posture, but they do not execute provider behavior.
- Future provider operation lifecycle concepts still need separate design before mutation:
- `draft` should capture proposed internal billing-plan and package-version mapping before any provider object is trusted or created.
- `provider_pending` should represent provider artifact creation, lookup, or import still needing server-side verification.
- `mapped` should mean internal records reference provider product/price/customer/subscription identifiers, but provider state still needs reconciliation.
- `verified` should require provider state, billing plan, price, currency, cadence, trial/discount terms, and package/version context to match expected internal state.
- `active` should be available only after explicit platform-admin approval, sandbox/test-mode validation, server-only provider execution, webhook/reconciliation design, audit evidence, and no-unintended-mutation QA gates exist.
- `deprecated` should preserve a mapping for existing subscriptions or grandfathered/custom contracts while blocking new use.
- `archived` should remove a mapping from future selection while preserving provider references, audit evidence, reconciliation history, and rollback/deprecation context.
- Future billing workflow boundaries: package assignment must not silently create/update/cancel provider subscriptions; billing changes require explicit approval; provider mapping must be verified before billing action; Stripe sandbox validation is required before live billing; provider webhook reconciliation must be designed before trusting provider state; billing failure handling must be separate from package assignment; and subscription cancellation/suspension must be auditable.
- Future audit evidence should include actor, timestamp, package definition/version, contractor/company, assignment id where applicable, provider product id/reference snapshot, provider price id/reference snapshot, subscription id/reference snapshot, billing impact summary, trial/discount/custom terms, approval reason, confirmation text, before/after provider mapping snapshot, reconciliation status, and rollback/deprecation strategy.
- Future Stripe/provider-specific safety: no secret keys in browser; provider calls server-side only; sandbox/test-mode gates before production; idempotency keys for provider mutations; webhook signature verification; no raw provider errors displayed to operators or contractors; provider ids treated as references rather than secrets but still displayed carefully; and no billing mutation without platform-admin approval.
- Future reconciliation should compare expected provider state to observed provider state and classify mismatch/attention-needed, pending webhook, stale provider mapping, failed provider operation, and manual support review states. Automatic destructive correction should not run without explicit approval.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, service-role/server-only tests, Stripe sandbox tests, provider idempotency tests, webhook signature tests, no unintended billing mutation tests, no entitlement/runtime mutation tests, browser QA, audit evidence verification, and reconciliation mismatch tests.

Future package entitlement / module boundary governance:

- This is future-only planning. No entitlement write model, runtime entitlement resolver, module gate, package enforcement, contractor permission change, billing mutation, Stripe/subscription operation, package assignment write, or runtime behavior exists today.
- Future entitlement/module governance should distinguish entitlement, module availability, module visibility, feature access, usage limit, package definition entitlement mapping, contractor package assignment effective entitlements, override, trial/early-access exception, grandfathered/custom contract exception, support override/emergency override, and audit snapshot.
- Package definitions should define intended commercial packaging. Package assignments should link a contractor to a package version. Billing/provider state should handle payment and subscription status. Entitlements should determine runtime capability access only after a separately implemented model exists. Module visibility should control UI exposure but should not replace server-side permission enforcement. Contractor groups are segmentation/proposal inputs, starter packs/onboarding are provisioning defaults, and user preferences are personal defaults; none of those should grant entitlements.
- Future entitlement lifecycle states should be `planned`, `reviewed`, `approved`, `active`, `suspended`, `deprecated`, `revoked`, and `archived`.
- Future module boundary lifecycle states should be `hidden`, `visible_preview`, `visible_enabled`, `enabled_limited`, `enabled_full`, `suspended`, and `deprecated`.
- Future enforcement boundaries: no runtime enforcement until an explicit entitlement model exists; no automatic entitlement changes from billing state alone; no automatic entitlement changes from contractor groups; no automatic entitlement changes from starter-pack assignment; no module gating until module-to-entitlement mapping exists; no contractor-facing permission change without explicit assignment/entitlement audit; and no AI or automation entitlement changes.
- Future entitlement/module audit evidence should capture actor, timestamp, company id/name, package assignment id, entitlement key, module key, previous state, new state, reason, confirmation text, effective date, source of change, package version snapshot, billing/provider snapshot if relevant, override snapshot, and rollback/revoke strategy.
- Future override governance should be platform-admin-only, require explicit reason, include expiration/effective date when temporary, avoid hidden permanent overrides without review, audit emergency/support overrides, and never silently change billing or package assignment.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, no-client-service-role-exposure tests, entitlement no-op tests before runtime rollout, module visibility regression tests, package assignment separation tests, billing/provider separation tests, contractor group separation tests, starter-pack separation tests, browser QA, audit evidence verification, and rollback/revoke tests.

Future package governance audit and evidence model:

- This is future-only planning. No package governance audit/evidence write model, package-definition persistence, package assignment write, billing mutation, Stripe/subscription operation, entitlement enforcement, module gating, contractor permission change, or runtime behavior exists today.
- Future audit/evidence concepts should distinguish package governance audit event, package definition snapshot, package assignment snapshot, billing/provider mapping snapshot, entitlement/module mapping snapshot, operator reason, confirmation phrase, approval actor, approval timestamp, effective date, before/after snapshot, source system, external provider reference snapshot, reconciliation state, and rollback/deprecation/supersession plan.
- Future package governance audit event families should include `package_definition_created`, `package_definition_reviewed`, `package_definition_approved`, `package_definition_published`, `package_definition_deprecated`, `package_definition_archived`, `package_assignment_drafted`, `package_assignment_approved`, `package_assignment_scheduled`, `package_assignment_activated`, `package_assignment_superseded`, `package_assignment_canceled`, `provider_mapping_created`, `provider_mapping_verified`, `provider_mapping_deprecated`, `entitlement_mapping_reviewed`, `entitlement_override_created`, `entitlement_override_expired`, and `billing_reconciliation_reviewed`.
- Future package definition actions should retain actor, timestamp, package/version identity, lifecycle transition, package definition snapshot, changed package dimensions, operator reason, confirmation phrase where required, before/after snapshot, approval metadata, and rollback/deprecation plan.
- Future package assignment actions should retain actor, timestamp, company/contractor identity, selected package version, previous assignment snapshot, new assignment snapshot, effective date, billing/provider impact snapshot, entitlement/module impact snapshot, starter-pack/onboarding implication snapshot, operator reason, confirmation phrase, and supersession/cancellation strategy.
- Future billing/provider mapping actions should retain actor, timestamp, package/version context, provider product/price/customer/subscription reference snapshots, billing impact summary, trial/discount/custom terms, before/after provider mapping snapshot, reconciliation state, approval reason, confirmation phrase, and rollback/deprecation strategy.
- Future entitlement/module mapping and override actions should retain actor, timestamp, package assignment context, entitlement key, module key, previous state, new state, effective/expiration date where applicable, source of change, package version snapshot, billing/provider snapshot if relevant, override snapshot, operator reason, confirmation phrase, and rollback/revoke strategy.
- Future reconciliation actions should retain expected provider state, observed provider state, mismatch classification, source system, external provider reference snapshot, reviewed-by actor, review timestamp, support decision, safe operator-facing summary, and any manual correction/deprecation plan.
- Future immutability/snapshot rules should make published package definitions non-destructively edited, package assignment history append-only or effectively immutable, billing/provider mapping snapshots preserve provider references at approval time, entitlement/module mapping snapshots preserve intended runtime boundaries, and void/deprecation/supersession retain prior evidence instead of erasing it.
- Future security requirements should keep audit writes platform-admin-only and server-side only; prevent client service-role exposure; enable and force RLS on public audit tables; revoke broad anon/authenticated grants unless intentionally exposed; keep security-definer functions away from anon/authenticated execution unless explicitly designed; use safe error messages; avoid raw provider errors or secrets in audit metadata; and treat provider ids as carefully displayed references rather than secrets or product truth.
- Future support/operator use cases should answer why a contractor has a package, why a feature/module is or is not available, why billing differs from package expectation, whether provider state is reconciled, who approved a package/version/assignment, how grandfathered/custom-contract scenarios apply, and what rollback/deprecation path is available.
- Future QA/security gates should include schema/RLS tests, platform-admin authorization tests, no client service-role exposure tests, audit append-only tests, before/after snapshot tests, safe metadata tests, provider reference sanitization tests, no unintended billing mutation tests, no unintended entitlement/module runtime mutation tests, browser QA, audit evidence verification, and support/export readiness tests.

Future package governance reporting / export readiness:

- This is future-only planning. No package governance report read model, export workflow, export button, file generation, downloadable file/link, package governance audit write model, package-definition persistence, package assignment write, billing mutation, Stripe/subscription operation, entitlement enforcement, module gating, contractor permission change, or runtime behavior exists today.
- Future package governance reporting concepts should distinguish package inventory reports, package definition version reports, contractor package assignment reports, billing/provider mapping reports, entitlement/module mapping reports, override reports, package audit trail reports, reconciliation/attention-needed reports, grandfathered/custom contract reports, early-access/trial reports, and support investigation bundles.
- Future export shapes should be separately designed by audience and sensitivity: CSV summary export for tabular operator review, JSON audit bundle for structured evidence, PDF/operator support packet for human investigation, internal support bundle for troubleshooting, contractor-facing export as future-only separate scope, and compliance/legal hold export as future-only separate scope.
- Future report data boundaries should include package definitions and versions, package assignment snapshots, billing/provider mapping snapshots, carefully displayed provider references, entitlement/module snapshots, override snapshots, audit events, approval/reason/confirmation metadata, and reconciliation status. Reports and exports must not include raw secrets, raw provider error payloads, service-role keys, or sensitive payment method data.
- Future reporting use cases should explain what package a contractor is on, why a contractor has or lacks module access, why billing differs from package expectation, how grandfathered/custom contracts apply, whether provider state is reconciled, whether early-access/trial conversion is ready, how package changes evolved over time, and what evidence belongs in an internal support investigation packet.
- Future export safety/security should require platform-admin-only access, server-side-only generation, an explicit export reason, an audited export request, no client service-role exposure, redaction rules, bounded export size, careful provider-reference display, no raw provider errors/secrets, no sensitive payment data, expiring downloadable links if future file storage is used, and separately scoped contractor-facing exports.
- Future retention/legal caveats should treat package governance audit evidence as durable support/compliance context: deprecation, supersession, rollback, or voiding should preserve history; legal-hold/support-investigation exports remain future-only; retention policy must be designed before deletion jobs; and export must never imply permission to mutate records.
- Future QA/security gates should include report read-model tests, export redaction tests, platform-admin authorization tests, no client service-role exposure tests, export audit event tests, file/link expiration tests if file storage is introduced, no unintended billing mutation tests, no unintended entitlement/module runtime mutation tests, browser QA, support bundle content tests, and large export guard tests.

Package Governance Implementation Readiness Matrix:

This matrix is sequencing guidance only beyond the implemented package definition persistence/read-only catalog/detail slices, package-definition audit timeline, lifecycle readiness, contractor package assignment read/detail slices, assignment activation readiness, and provider mapping readiness/read-only reconciliation slice. It does not add server actions, RPCs, mutation UI controls, package assignment writes, billing/provider calls, Stripe subscription operations, entitlement enforcement, module gating, reporting/export behavior, contractor permission changes, or runtime behavior. Current implemented status is limited to read-only `/super-admin/packages` package/billing observability, the persisted Package Definition Catalog, the contractor package assignment read surfaces, the provider mapping readiness section, and the static Future Package Definition Model planning panel.

| Area | Current status and risk | Prerequisites and blockers | Schema/RLS, server, audit considerations | QA/security gates, non-goals, first slice |
|---|---|---|---|---|
| Package definition persistence | Implemented first read-only schema/read-model slice; medium-risk foundation completed without mutation behavior. | Stable package dimensions can now be inspected from `platform_package_definitions` and `platform_package_definition_versions`. Remaining dependencies are audit evidence, lifecycle approvals, assignment, billing/provider mapping, entitlements, and runtime designs. | Implemented tables are platform-scoped, have forced RLS, revoke broad `public`/`anon`/`authenticated` grants, constrain status/key/version/JSON shapes, and are read through platform-admin-only server helpers. | Completed gates in this slice: migration, RLS/grant posture, focused read-model tests, no mutation/action fields, count checks, and browser QA. Non-goals remain assignment, billing, entitlements, module gates, and runtime behavior. |
| Package definition lifecycle / approval | Planned future; blocked until package-definition audit evidence exists; high risk once mutation controls appear. | Requires persisted package definitions, version snapshots, approval reasons, confirmation text, and review states. Blocked by no package governance audit table or lifecycle mutation/readiness model. | Future actions/RPCs need explicit lifecycle transition contracts, no destructive edits to published versions, before/after snapshots, actor/timestamp/reason, and safe operator errors. | Gates: platform-admin authorization, lifecycle transition tests, audit snapshot tests, browser QA, no unintended contractor changes. First slice: approval read model before controls. |
| Contractor package assignment | Implemented read-only schema/read-model/detail/readiness foundation; not ready for runtime; high risk for activation writes. | Approved/published package versions, assignment lifecycle fields, assignment history, and separation from billing and entitlements now have read-only inspection surfaces. Remaining blocker is no assignment mutation workflow. | Implemented schema preserves assignment history, effective dates, supersession/cancel paths, package version references, company references, forced RLS, revoked broad grants, and read-only audit evidence. Future server actions must not mutate billing or entitlements. | Completed gates: schema/RLS, platform-admin read helpers, focused tests, count checks, no mutation fields. Remaining gates: platform-admin auth for writes, no unintended billing, no entitlement/module mutation, no contractor permission changes. |
| Billing / provider mapping | Implemented read-only schema/read-model foundation; critical risk remains for provider mutation. | Package definitions and assignment context now exist for internal reference inspection. Remaining blockers are no provider operation workflow, no webhook/reconciliation action workflow, and no Stripe subscription mutation workflow. | Provider IDs are references, not secrets or product truth. Implemented provider mapping tables have forced RLS, revoke broad `public`/`anon`/`authenticated` grants, constrain provider/environment/state/JSON shapes, and are read through platform-admin-only server helpers. | Completed gates: migration, RLS/grant posture, focused read-model tests, no mutation/action fields, count checks. Remaining gates: Stripe sandbox tests before mutation, provider idempotency tests, webhook signature tests, no billing mutation tests, safe metadata tests. |
| Billing reconciliation | Implemented read-only mismatch/reconciliation inspection foundation; blocked for destructive/provider actions. | Expected/observed provider state summaries, billing/reconciliation states, mismatch summaries, and audit evidence can now be inspected. Remaining blockers are no webhook handling, no support-review action workflow, and no automatic correction workflow. | Implemented reconciliation inspection preserves expected/observed snapshots, mismatch classifications, provider reference snapshots, and audit rows, with no automatic destructive correction. | Completed gates: mismatch read-model tests, safe snapshot summary tests, no unintended subscription changes in code. Remaining gates: webhook signature verification, provider reference sanitization, support-review action tests before any mutation. |
| Entitlement / module boundary model | Planned future; not ready for runtime; medium risk for read model and critical risk for enforcement. | Requires package definition entitlement mapping, assignment effective entitlements, module-to-entitlement mapping, override policy, and audit evidence. Blocked by no entitlement runtime model and no module gate mapping. | Future schema must separate entitlements from package labels, billing status, contractor groups, starter packs, and user preferences. Overrides need platform-admin-only audit, reason, effective/expiration dates, and rollback/revoke strategy. | Gates: entitlement no-op tests, module visibility regression tests, package assignment separation tests, billing separation tests, starter-pack/group separation tests. First slice: entitlement/module mapping read model only. |
| Runtime enforcement | Planned future; not ready for runtime; critical risk. | Requires effective assignments, entitlement/module mapping, override governance, server-side capability checks, and no-op regression proof. Blocked by no entitlement model, no assignment model, and no module gate mapping. | Enforcement must live at server boundaries that own protected behavior; navigation visibility is not sufficient. Runtime decisions need auditable source snapshots and safe failure modes. | Gates: no unintended entitlement/module mutation, no contractor permission changes, server-boundary tests, browser QA, rollback/revoke tests. First slice: no-op enforcement harness only after read models exist. |
| Package governance audit/evidence | Planned future; ready for schema design after package definition shape is stable; medium risk. | Requires event families, snapshot contracts, operator reasons, confirmation phrases, source systems, provider reference snapshot rules, and retention strategy. Blocked by no package governance audit table. | Future audit tables should be append-only or effectively immutable, RLS-protected, server-side only, free of raw secrets/provider errors, and preserve before/after evidence through deprecation/supersession. | Gates: audit append-only tests, before/after snapshot tests, safe metadata tests, forced RLS/grant checks. First slice: audit schema/read model before any governance mutations. |
| Package governance reporting/export | Planned future; blocked until audit/evidence model exists; medium risk for read models and high risk for file export. | Requires audit/evidence records, reporting read models, redaction policy, export reason/audit event, retention policy, and size limits. Blocked by no audit table and no report/export route/action/file generation. | Future export must be platform-admin-only, server-side only, redacted, bounded, audited, and use expiring links if storage is introduced. Contractor-facing exports are separate scope. | Gates: report read-model tests, export redaction tests, export audit event tests, file/link expiration tests, large export guard tests. First slice: reporting read model after audit exists. |
| Contractor-facing package visibility | Planned future; blocked; high risk for customer/operator confusion. | Requires package definitions, active assignment truth, entitlement/module separation, support copy, and contractor-facing disclosure policy. Blocked by no package assignment model and no contractor-facing package visibility design. | Future visibility must read explicit effective assignments and safe commercial labels only. It must not expose provider secrets, raw provider errors, internal pricing notes, or support-only audit payloads. | Gates: contractor-facing browser QA, permission checks, no package mutation/export behavior, no entitlement side effects. First slice: read-only visibility design, no route until assignment model exists. |
| Support/operator review bundle | Planned future; blocked until audit/reporting foundations exist; medium risk. | Requires package, assignment, billing/provider, entitlement/module, override, reconciliation, and audit snapshots. Blocked by no audit/evidence table and no reporting/export behavior. | Bundles should be internal, platform-admin-only, redacted, reasoned, and auditable if generated later. They should explain state without mutating package, billing, entitlement, module, or runtime records. | Gates: support bundle content tests, redaction tests, no export/file generation unless explicitly scoped. First slice: support bundle read-model spec after audit exists. |
| Migration from early-access/read-only state | Planned future; blocked until assignment, audit, and billing separation exist; high risk. | Requires current tenant/package observability, persisted package definitions, assignment migration plan, grandfathered/custom contract handling, billing/provider mapping, and activation policy. Blocked by no package assignment/billing mapping models and no audit evidence. | Future migrations need dry-run/read-model review, before/after snapshots, explicit approval, rollback/supersession strategy, and no silent billing, entitlement, module, or permission changes. | Gates: migration/versioning tests, audit snapshot tests, no unintended billing or entitlement mutation, Stripe sandbox tests before provider behavior. First slice: migration readiness read model only. |

Recommended implementation order:

1. Package definition schema/read model first, because every later package governance area needs a stable product package/version record.
2. Package governance audit/evidence schema second, because lifecycle, assignment, provider mapping, entitlement, override, reconciliation, and export actions all need durable evidence before mutation.
3. Package definition lifecycle/approval controls third, limited to platform-admin-only, audited transitions with immutable/snapshotted published versions.
4. Contractor package assignment schema/read model fourth, with effective dates and history but no billing, entitlement, module, or runtime side effects.
5. Assignment audit/approval fifth, still separated from provider billing and runtime enforcement.
6. Provider mapping detail or assignment-detail integration can follow if needed, still with no Stripe mutation and provider references treated as careful references rather than secrets or product truth.
7. Billing reconciliation action design must remain separate and future-only until webhook, support-review, and no-mutation gates are defined.
8. Entitlement/module mapping read model before runtime enforcement, with explicit separation from billing state, contractor groups, starter packs, and user preferences.
9. Runtime enforcement last, only after assignment, entitlement, override, audit, QA, and rollback/revoke paths exist.
10. Reporting/export only after the audit/evidence model exists, with redaction, export audit, retention, and file/link-expiration design completed first.

Risk classification:

- Low risk: docs-only planning, static planning panels, and read-only read models over existing records.
- Medium risk: schema, RLS, audit tables, append-only evidence, and server-side read models with no mutation behavior.
- High risk: package, assignment, lifecycle, override, reporting/export, or support-bundle mutation actions.
- Critical risk: billing/provider mutation, Stripe subscription create/update/cancel, entitlement/runtime enforcement, module gating, pricing/package enforcement, contractor permission changes, and any automated correction workflow.

Explicit blockers before implementation:

- no package definition mutation/lifecycle approval workflow exists yet
- no package assignment mutation workflow exists yet
- no entitlement runtime model exists yet
- no module gate mapping exists yet
- no provider operation, webhook, support-review action, or Stripe subscription mutation workflow exists yet
- no package governance audit table exists yet
- no Stripe subscription mutation workflow exists yet
- no reconciliation workflow exists yet
- no contractor-facing package export/visibility exists yet

Consolidated future QA/security gates:

- schema/RLS tests, including forced RLS and broad grant checks where public tables exist
- platform-admin authorization tests for every package governance read/write surface
- no client service-role exposure checks
- security-definer execute grant checks if RPCs are added
- browser QA for platform-admin and denied non-platform access
- no unintended billing mutation tests
- no unintended entitlement/module mutation tests
- no unintended contractor permission changes
- Stripe sandbox tests before any provider mutation
- webhook signature verification tests before trusting provider state
- audit snapshot and append-only evidence tests
- reporting/export redaction, audit-event, file/link expiration, and large-export guard tests

Package Definition Persistence Schema / Read-Model:

This first schema/read-model slice is implemented. It creates migrations, tables, RLS/grant posture, server read helpers, pure read-model tests, and read-only `/super-admin/packages` catalog UI for platform package definitions and versions. It does not create server actions, RPCs, mutation UI controls, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, reporting/export behavior, contractor permission changes, starter-pack provisioning behavior, automation, AI behavior, or runtime behavior. Current implemented status is limited to read-only `/super-admin/packages` package/billing observability, the persisted Package Definition Catalog, and the static Future Package Definition Model planning panel.

Implemented package definition persistence concepts:

- `package definition`: the platform-owned product/business package family, such as a sellable FloorConnector plan concept. It is not a contractor assignment, billing subscription, entitlement grant, module gate, or runtime permission.
- `package version`: an immutable or effectively snapshotted version of a package definition used for future approval, assignment, billing/provider mapping, entitlement/module mapping, reporting, and migration review.
- `package key`: a stable machine-readable identifier for the definition; it should be unique, lowercase/slug-like, and independent from display copy.
- display name and commercial summary: operator-facing labels and concise packaging language; these must not store provider secrets, raw pricing payloads, raw Stripe objects, or customer-specific custom contract terms.
- status and lifecycle state: future package lifecycle values should remain separate from contractor tenant lifecycle and subscription status. Draft can be editable; published versions should be immutable or snapshotted; deprecation should replace destructive edits; archive should preserve history.
- intended audience/segment, module visibility intent, usage limit intent, entitlement intent, billing/provider mapping intent, starter-pack default intent, and contractor group targeting intent: planning metadata for future review and read models, not enforcement.
- published snapshot: version-time JSON or structured snapshot preserving product dimensions, commercial summary, and intended boundaries at approval/publication time.
- archived/deprecated state: a non-destructive package state used for historical review, migration, grandfathering, and support.

Implemented first-slice tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `platform_package_definitions` | Store the stable platform package family/key and current high-level lifecycle. | `id`, `package_key`, `display_name`, `description`, `status`, `intended_audience`, `segment_summary`, `created_at`, `updated_at`, `created_by`, `updated_by`, `archived_at`. Unique normalized `package_key`; constrained status values `draft`, `review`, `published`, `deprecated`, `archived`; archive timestamp/status coherence. | Platform-scoped table, not tenant-owned. RLS is enabled and forced. Broad `public`, `anon`, and `authenticated` grants are revoked. Current access is through platform-admin-only server helpers. Read model lists definitions, lifecycle/status counts, version counts, missing-version caveats, and empty states. | No package mutation UI, lifecycle approval controls, contractor assignment, billing subscription, Stripe mapping write, entitlement enforcement, module gate, package pricing enforcement, reporting/export, runtime behavior, or contractor-facing visibility. |
| `platform_package_definition_versions` | Store versioned package-definition intent snapshots for future approval/publication and immutable review. | `id`, `package_definition_id`, `version_number`, `version_label`, `status`, `commercial_summary`, `module_visibility_intent`, `usage_limit_intent`, `entitlement_intent`, `billing_provider_intent`, `starter_pack_default_intent`, `contractor_group_targeting_intent`, `published_snapshot`, `published_at`, `deprecated_at`, `archived_at`, `created_at`, `updated_at`, `created_by`, `updated_by`. Unique `(package_definition_id, version_number)` and per-definition labels. JSON snapshot fields must be objects when present. Publication/deprecation/archive timestamps have status-coherence constraints. | Foreign key to `platform_package_definitions`. Indexed by definition/status/version and created time. RLS/grant posture matches the definitions table. Read model lists versions, lifecycle/publication state, intent snapshot presence, caveats, and empty states. | No lifecycle approval controls in the first schema slice, no assignment write, no billing/provider mutation, no Stripe call, no entitlement/module runtime effect, no reporting/export file generation. |

Deferred or optional future tables, not part of the first schema slice:

- `platform_package_definition_audit_events`, or a broader package governance audit table, should capture package-definition evidence before lifecycle mutation controls exist.
- `package_version_module_intents` may normalize module-visibility planning after module taxonomy stabilizes.
- `package_version_usage_limit_intents` may normalize limits after counters/enforcement locations are known.
- `package_version_entitlement_intents` may normalize entitlement planning after an entitlement model exists.
- `package_version_starter_pack_intents` may link package versions to onboarding/provisioning defaults without making starter packs entitlement or billing grants.
- `package_version_billing_provider_intents` may describe future provider mapping intent, but must not store secrets or create/update/cancel provider artifacts.

Future table-design requirements:

- Timestamps and actor fields should exist on both definition and version records; actor fields should reference the platform operator/user identity pattern chosen for platform-admin auditability.
- JSON snapshot fields are acceptable for early version snapshots when dimensions are still evolving, but must be safe, bounded, provider-secret-free, and tested for stable read-model output.
- Indexes should support package catalog listing, package key lookup, latest-version lookup, lifecycle/status filters, and future migration/review queries.
- RLS should be enabled and forced for public tables; broad `anon`/`authenticated` grants should be revoked unless explicitly exposed through safe policies. Platform-admin access should be enforced server-side, not through navigation visibility.
- Service-role keys must never be exposed to client/browser code. If security-definer RPCs are later introduced, they must use locked `search_path` and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Package definition records must not contain raw provider/billing secrets, raw provider errors, sensitive payment method data, or tenant-owned mutable state.
- Package definition writes must not change tenant-owned records, starter-pack provisioning records, contractor groups, subscriptions, entitlements, module availability, contractor permissions, or runtime behavior.

Implemented read model:

- `buildPlatformPackageDefinitionCatalog(...)` exposes definition lists, version lists, lifecycle/status buckets, summary counts, publication/readiness caveats, missing-version caveats, JSON intent snapshot presence, empty states, and read-only operator summaries.
- `listPlatformPackageDefinitions(...)`, `listPlatformPackageDefinitionVersions(...)`, and `getPlatformPackageDefinitionCatalog(...)` are server-side platform-admin data helpers for the read-only page.
- The read model is safe for browser rendering after serialization and is free of mutation/action descriptors. Later mutation controls require a separate approved slice.

Completed first implementation slice:

1. Added `platform_package_definitions` and `platform_package_definition_versions`.
2. Added shared/platform-admin types needed for the read path.
3. Added platform-admin-only server read helpers and a pure read-model builder.
4. Added a read-only Super Admin catalog section that lists package definitions and versions, with empty states.
5. Added focused pure tests for summary counts, empty state/caveats, lifecycle/status grouping, no mutation/action fields, JSON snapshot assumptions, and migration posture.
6. Kept publish/approval controls, contractor assignments, billing/provider writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export actions, automation, AI behavior, and starter-pack provisioning changes deferred.

Package Definition Audit Evidence Schema / Read-Model Design:

This is future-only audit schema/read-model planning. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package definition mutation actions, package version mutation actions, approval/publish controls, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability and the static Future Package Definition Model planning panel.

Future package definition audit/evidence concepts:

- `package definition audit event`: a future append-only or effectively immutable event describing a lifecycle or content change to a package definition family.
- `package version audit event`: an event describing a version snapshot, review, approval, publication, deprecation, archive, or supersession decision. The first table can represent this through nullable package-version references unless a later split is justified.
- `package definition snapshot` and `package version snapshot`: safe JSON object snapshots of the product package identity, lifecycle state, commercial summary, dimensions, and intended boundaries at the time of the event.
- `before/after snapshot`: paired safe JSON object snapshots used for update, review, approval, publication, deprecation, archive, and supersession evidence.
- `operator reason` and `confirmation phrase`: human-entered evidence for future risky lifecycle decisions; required for approval, publication, deprecation, archive, and supersession actions once mutation controls exist.
- review actor, approval actor, approval timestamp, publication timestamp, deprecation/archive reason, source system, effective version, supersession/deprecation evidence, and immutable published snapshot: future evidence fields used to explain who changed package governance state, why, and what version became effective.

Future package definition audit event families:

- `package_definition_created`
- `package_definition_updated`
- `package_definition_reviewed`
- `package_definition_approved`
- `package_definition_published`
- `package_definition_deprecated`
- `package_definition_archived`
- `package_version_created`
- `package_version_updated`
- `package_version_reviewed`
- `package_version_approved`
- `package_version_published`
- `package_version_deprecated`
- `package_version_archived`

Proposed future audit table:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `platform_package_definition_audit_events` | Store package-definition and package-version audit evidence before lifecycle mutation controls exist. Keep this as one conservative table first unless package-version event volume or retention rules later justify a split such as `platform_package_version_audit_events`. | `id`, `event_type`, `package_definition_id`, `package_definition_version_id`, `actor_user_id`, `reason`, `confirmation_text`, `before_snapshot`, `after_snapshot`, `metadata`, `occurred_at`, `created_at`. Constrain `event_type` to the package-definition and package-version event families above. `package_definition_id` should reference `platform_package_definitions`; `package_definition_version_id` should reference `platform_package_definition_versions` when the event applies to a version. `before_snapshot`, `after_snapshot`, and `metadata` should be JSONB objects with safe size and shape expectations. | Platform-scoped audit table, not tenant-owned. Enable and force RLS if exposed through `public`; revoke broad anon/authenticated grants unless intentionally designed. Access through platform-admin-only server helpers. Index by `package_definition_id`, `package_definition_version_id`, `event_type`, `actor_user_id`, and `occurred_at` for timeline, latest-evidence, and attention-needed reads. | No package creation/update/publish/archive action, no approval control, no contractor assignment write, no billing/provider mutation, no Stripe call, no subscription operation, no entitlement/module runtime effect, no reporting/export file generation, and no contractor-facing package visibility. |

Snapshot and immutability rules:

- Snapshots must be JSON objects; scalar strings, raw provider payloads, arrays as the root value, or unbounded blobs should be rejected by future validation.
- Snapshots must not store secrets, raw provider errors, stack traces, service-role keys, provider secret keys, payment method data, sensitive payment details, or tenant-owned mutable payloads.
- Published version snapshots should preserve the approved commercial/package dimensions, intended module visibility, usage-limit intent, entitlement intent, billing/provider mapping intent, starter-pack default intent, and contractor group targeting intent that were reviewed at approval/publication time.
- Deprecation and archive events must not erase earlier creation, review, approval, or publication evidence.
- Supersession evidence should preserve both old and new package-version references plus the operator reason and effective version context.
- Audit evidence should be append-only or effectively immutable. Correction, void, deprecation, archive, or supersession events should add new evidence instead of rewriting prior history.

Future package definition audit read model:

- A future helper such as `buildPlatformPackageDefinitionAuditTimeline(...)` or `getPlatformPackageDefinitionAuditReadModel(...)` should expose package definition timeline, package version timeline, latest review evidence, latest approval evidence, publication evidence, deprecation/archive evidence, missing evidence caveats, safe operator summaries, and attention-needed rows.
- The read model should call out missing audit evidence for draft, reviewed, approved, published, deprecated, archived, or superseded states without treating missing evidence as proof of mutation.
- Operator summaries should be safe for browser rendering, omit raw snapshots by default when too large or sensitive, and show provider IDs only as careful references if future provider intent snapshots exist.
- Attention-needed rows should identify definitions or versions with missing review, approval, publication, deprecation, archive, supersession, or actor/reason evidence after the audit table exists.

Future schema/RLS/security gates:

- RLS must be enabled and forced for public audit tables; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin access must be server-side only; navigation visibility is not authorization.
- Service-role keys must never be exposed to browser/client code.
- Security-definer RPCs, if later needed for append-only writes, must lock `search_path` and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Audit metadata must be sanitized and bounded. Raw provider/billing secrets, raw provider errors, stack traces, sensitive payment method data, and unsafe payloads must not be stored or displayed.
- Audit writes must not mutate tenant-owned records, package assignment records, subscriptions, billing/provider state, entitlements, module availability, contractor permissions, starter-pack provisioning state, reporting/export files, automation, AI behavior, or runtime behavior.
- Future mutation actions must recompute snapshots server-side. Client-submitted snapshots should never be accepted as authoritative evidence.

Recommended first audit implementation slice:

1. Add a migration for `platform_package_definition_audit_events` after the package definition/version tables exist.
2. Add RLS/grant posture for platform-admin-only server access.
3. Add generated/shared types if the repo pattern requires it.
4. Add platform-admin-only read helpers and a pure audit timeline read-model builder.
5. Add focused pure read-model tests, schema/RLS/grant checks, platform-admin authorization tests, snapshot-safety tests, and browser QA for a read-only audit timeline panel.
6. Keep package definition mutation actions, package version mutation actions, approval/publish controls, package assignment writes, billing/provider mapping writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export actions, automation, AI behavior, and starter-pack provisioning changes deferred.

Package Definition Lifecycle Readiness / Approval Controls Design:

The pure lifecycle readiness read model and read-only detail-panel inspection are implemented. Approval and lifecycle controls remain future-only planning. This slice did not create migrations, tables, RLS policies, grants, server actions, RPCs, reporting/export behavior, billing/provider calls, Stripe subscription operations, package definition mutation actions, package version mutation actions, approval/publish/deprecate/archive controls, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior. Current implemented package governance status includes read-only `/super-admin/packages` package/billing observability, the static Future Package Definition Model planning panel, the persisted read-only package definition catalog/detail foundation, the read-only package definition audit timeline, and the read-only Lifecycle Readiness panel.

Future lifecycle controls:

- `create draft`: future platform-admin action that creates an editable package definition/version draft after package-definition persistence exists.
- `edit draft`: future action that updates draft-only package identity, dimensions, intent snapshots, and caveats before review.
- `submit for internal review`: future action that freezes a review candidate enough to run readiness checks and capture review evidence.
- `request changes`: future action that returns an internal-review package version to draft with review notes and audit evidence.
- `approve package definition`: future action that records platform-admin approval evidence for a package definition/version candidate.
- `publish package version`: future action that marks an approved version as published only after required evidence and readiness checks pass.
- `deprecate package version`: future action that marks a published version unavailable for new use while preserving existing history and assignment migration context.
- `archive package definition/version`: future action that retires draft, review, deprecated, or obsolete package definitions/versions without deleting history.
- `supersede package version`: future action that links an older published version to a newer published replacement while preserving both version snapshots.

Future allowed transitions:

- `draft -> internal_review`
- `internal_review -> draft`
- `internal_review -> approved`
- `approved -> published`
- `published -> deprecated`
- `deprecated -> archived`
- `published -> superseded` by a newer published version
- `draft -> archived`
- `internal_review -> archived`

Future blocked transitions:

- `published -> draft` destructive edit.
- `archived -> published`.
- `deprecated -> active` or `deprecated -> published` without a new reviewed package version.
- `approved -> published` without required audit evidence.
- Publish without required package dimensions, name, key, version, and publication snapshot.
- Publish without approval actor, approval timestamp, operator reason, and confirmation phrase.
- Publish while billing/provider mapping is claimed as active unless a future provider model has verified that mapping.
- Publish while entitlement/module mapping is claimed as enforced unless a future entitlement/module model exists and has passed readiness checks.

Future approval requirements:

- Platform-admin-only actor, checked server-side; navigation visibility is not authorization.
- Explicit operator reason and confirmation phrase for approval, publication, deprecation, archive, and supersession actions.
- Approval actor, approval timestamp, publication timestamp where applicable, and safe before/after snapshots.
- Package definition snapshot and package version snapshot recomputed server-side from persisted records.
- Validation result snapshot that records lifecycle eligibility, required-dimension completeness, and blocker/warning state.
- Dependency caveat snapshot for billing/provider intent, entitlement/module intent, starter-pack intent, contractor group targeting, reporting/export readiness, and runtime boundaries.
- Audit event write in the same transaction as any future lifecycle mutation, so lifecycle state and evidence cannot drift apart.

Future readiness checks:

- Required name, package key, and version are present and safely normalized.
- Package dimensions are complete enough for review: commercial summary, intended audience/segment, module visibility intent, usage limit intent, entitlement intent, billing/provider mapping intent, starter-pack default intent, and contractor group targeting intent.
- Status and lifecycle state are valid for the requested transition.
- No duplicate active package key/version conflict exists.
- Publication snapshot is present, safe, and generated from server-owned data.
- Billing/provider fields are marked intent-only unless a future provider mapping model exists and has verified the mapping.
- Entitlement/module fields are marked intent-only unless a future entitlement/module model exists and has passed readiness checks.
- Starter-pack fields are marked intent-only unless a future assignment/provisioning workflow is explicitly wired and separately audited.
- No runtime enforcement, contractor package assignment, billing/subscription operation, module gate, contractor permission change, reporting/export action, starter-pack provisioning action, automation, or AI behavior is implied by lifecycle readiness.

Implemented lifecycle/readiness read model:

- `buildPlatformPackageDefinitionLifecycleReadiness(...)` exposes future transition readiness, blocking reasons, advisory reasons, missing version/evidence caveats, dependency caveats, safe operator summaries, and explicit no-behavior flags.
- The read model always reports `actionAvailable: false`, `mutationAvailable: false`, `runtimeEffect: false`, `billingEffect: false`, `entitlementEffect: false`, and `packageAssignmentEffect: false`.
- The read model distinguishes blocking issues from advisories: missing required package identity, version dimensions, approval evidence, or publication snapshot can block readiness; intent-only billing/provider, entitlement/module, runtime, and package-assignment caveats warn operators without enabling behavior.
- The read model never treats billing/provider status, Stripe subscription state, entitlement mapping, module visibility, contractor groups, starter-pack defaults, audit evidence, or transition eligibility as proof that runtime enforcement exists.
- The model maps the currently persisted `review` status to the future `internal_review` label for read-only explanation only; it does not add an `approved` schema status or lifecycle mutation path.

Implemented UI readiness and future controls:

- The first lifecycle implementation is a read-only Lifecycle Readiness panel on `/super-admin/packages/[packageDefinitionId]` before any mutation controls.
- Mutation controls should come later one transition at a time, with no bulk publish, no auto approval, no apply-all lifecycle action, and no hidden runtime side effects.
- Future copy must say lifecycle controls affect only package definition/version records and package governance audit evidence. They must not create package assignments, mutate billing/provider state, call Stripe, change subscriptions, enforce entitlements, gate modules, change contractor permissions, run reporting/export, provision starter packs, trigger automation, run AI behavior, or change runtime behavior.

Future schema/RLS/security gates:

- RLS must be enabled and forced for package definition/version and lifecycle/audit tables exposed through `public`; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin access must be server-side only, and service-role keys must never be exposed to browser/client code.
- Lifecycle transition RPCs, if later needed, must lock `search_path`, perform authorization and readiness recomputation server-side, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Future errors should be safe for operators and avoid raw SQL/provider errors, stack traces, secrets, or unbounded metadata.
- Future mutation actions must recompute readiness and snapshots server-side immediately before the transition. Client-submitted snapshots should never be accepted as authoritative.

Recommended next lifecycle implementation slice:

1. Add a read-only lifecycle readiness hardening pass only if needed, such as approval evidence detail summaries or transition-specific caveat copy, without introducing mutation controls.
2. Keep actual lifecycle mutation server actions, approval/publish/deprecate/archive buttons, package assignments, billing/provider writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, reporting/export actions, automation, AI behavior, and starter-pack provisioning changes deferred.
3. Contractor package assignment schema/read-model and read-only assignment detail inspection are now implemented; proceed next to assignment readiness or billing/provider mapping read-only planning only after the assignment inspection surfaces remain stable and reviewable.

Contractor Package Assignment Schema / Read-Model:

This first schema/read-model and assignment-detail inspection slice is implemented. It created the assignment/audit tables, RLS/grant posture, platform-admin-only read helpers, read-only catalog output, and read-only one-assignment detail route, but it does not add server actions, RPCs, assignment writes, reporting/export behavior, billing/provider calls, Stripe subscription operations, package definition mutation actions, approval/schedule/activate/cancel controls, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior.

Contractor package assignment concepts:

- `contractor package assignment`: future audited link between one company/contractor and one approved/published package definition version.
- `company/contractor target`: the existing `companies` record that would receive the assignment; assignment is platform governance, not contractor group membership.
- `package definition reference` and `package version reference`: future references to `platform_package_definitions` and `platform_package_definition_versions`; assignment must not point to an unapproved or unpublished version when active.
- `assignment status` and `lifecycle state`: future operator-facing state used for draft, review, approval, scheduling, activation, supersession, cancellation, and archive history.
- `effective date`: when a future approved/scheduled assignment may become eligible to activate through an audited transition.
- `previous assignment` and `superseding assignment`: optional links that preserve assignment history and package-to-package migration lineage.
- `assignment snapshot`: safe JSON object snapshot of the company, package definition/version, lifecycle state, effective date, prior/superseding assignment references, and commercial/package context at the time of the event.
- `billing impact snapshot`: future intent-only summary of expected billing implications; it is not a provider mutation or subscription truth.
- `entitlement/module impact snapshot`: future intent-only summary of expected runtime/module implications; it is not entitlement enforcement or module gating.
- `starter-pack implication snapshot`: future onboarding/provisioning context only; it must not auto-provision templates/catalogs or mutate tenant-owned records.
- `cancellation/supersession reason`: future operator evidence for why an assignment was canceled, superseded, or archived.
- `grandfathered/custom contract marker`: future commercial exception marker for contractors whose package assignment differs from standard package terms.

Implemented assignment tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `contractor_package_assignments` | Store the package assignment record linking one company/contractor to one package definition version, with lifecycle state, effective dates, history links, and safe intent snapshots for read-only inspection. | `id`, `company_id`, `package_definition_id`, `package_definition_version_id`, `status`, `lifecycle_state`, `effective_at`, `scheduled_for`, `activated_at`, `superseded_at`, `canceled_at`, `archived_at`, `supersedes_assignment_id`, `superseded_by_assignment_id`, `assignment_snapshot`, `billing_impact_snapshot`, `entitlement_module_impact_snapshot`, `starter_pack_implication_snapshot`, `cancellation_reason`, `supersession_reason`, `grandfathered_contract`, `custom_contract_label`, `created_by`, `updated_by`, `created_at`, `updated_at`. Lifecycle/status are constrained to `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived`. Foreign keys link to `companies`, `platform_package_definitions`, `platform_package_definition_versions`, `users`, and assignment self-references. A partial unique index prevents more than one `active` assignment per company unless multi-package support is explicitly designed later. | Platform-admin-only server access. RLS is enabled and forced; broad `public`/`anon`/`authenticated` grants are revoked. Indexes support company/state, package/version, scheduled assignment, active assignment, and supersession reads. | No assignment write action, approval/schedule/activate/cancel control, billing/provider mutation, Stripe call, subscription operation, entitlement/module enforcement, contractor group membership, starter-pack provisioning, contractor-facing visibility, reporting/export behavior, automation, AI suggestion, or runtime effect. |
| `contractor_package_assignment_audit_events` | Store assignment lifecycle evidence, including creation, review, approval, scheduling, activation, supersession, cancellation, and archive history for read-only timelines. | `id`, `contractor_package_assignment_id`, `company_id`, `package_definition_id`, `package_definition_version_id`, `event_type`, `actor_id`, `reason`, `confirmation_text`, `before_snapshot`, `after_snapshot`, `metadata`, `occurred_at`, `created_at`. Event type is constrained to `package_assignment_drafted`, `package_assignment_updated`, `package_assignment_reviewed`, `package_assignment_approved`, `package_assignment_scheduled`, `package_assignment_activated`, `package_assignment_superseded`, `package_assignment_canceled`, and `package_assignment_archived`. Snapshots and metadata must be JSONB objects when present. | Same platform-admin-only, server-side, RLS-forced posture as assignment records. Indexes support assignment timeline, company timeline, package/version timeline, and recent event-type review. | No package assignment mutation by itself, no billing/provider write, no entitlement/module runtime effect, no package definition lifecycle change, no report/export file generation, and no contractor-facing behavior. |

Optional future splits should stay deferred unless query volume, retention, or legal/audit shape justifies them:

- `contractor_package_assignment_transitions`: only if lifecycle transition rows become large or need stricter append-only semantics than the audit event table.
- `contractor_package_assignment_snapshots`: only if snapshots need separate retention/redaction/export handling from audit events.

Future assignment lifecycle states:

- `draft`: future operator is preparing an assignment candidate; no contractor, billing, entitlement, module, or runtime effect.
- `pending_review`: future candidate is ready for review and impact checks.
- `approved`: future candidate has approval evidence but is not yet active.
- `scheduled`: future approved assignment has an effective date but still requires audited activation.
- `active`: future assignment is the current package assignment for a company after audited activation.
- `superseded`: future assignment has been replaced by a newer assignment while preserving history.
- `canceled`: future assignment was stopped before activation or ended through an audited cancellation path.
- `archived`: future assignment is retained for history and should not be reactivated directly.

Future assignment constraints:

- Only approved/published package definition versions can become active assignments.
- At most one active assignment per company should exist unless explicit multi-package support is designed.
- Scheduled assignments must not activate automatically or silently; activation needs a future audited transition.
- Supersession should preserve previous assignment evidence, new assignment evidence, operator reason, effective date, and package version snapshots.
- Cancellation should add evidence and must not erase assignment history.
- Archived assignments should not be reactivated without creating a new assignment.
- Assignment is not billing mutation, Stripe subscription creation/update/cancel, payment collection, entitlement/module enforcement, contractor group membership, starter-pack provisioning, contractor permission change, reporting/export action, automation, AI suggestion, or runtime behavior.

Implemented contractor package assignment read models:

- `buildContractorPackageAssignmentReadModel(...)` and `getContractorPackageAssignmentReadModel(...)` expose assignment summaries, status/event buckets, assignment rows, assignment audit evidence, missing package/version caveats, billing impact caveats, entitlement/module impact caveats, starter-pack implication caveats, read-only operator summaries, and empty states.
- `buildContractorPackageAssignmentDetail(...)` and `getContractorPackageAssignmentDetail(...)` expose one assignment, linked company/package/version labels, lifecycle/status and timing metadata, supersession/cancellation/archive context, safe snapshot summaries, assignment audit timeline rows, assignment activation readiness, missing evidence/company/package/version caveats, and safe unavailable states.
- `buildContractorPackageAssignmentActivationReadiness(...)` exposes future transition readiness for draft to pending review, pending review to draft/approved, approved to scheduled/active, scheduled to active, active to superseded/canceled, and canceled/superseded to archived; every row reports no action, mutation, billing, entitlement, contractor-permission, runtime, or package-assignment-write effect.
- The read model should distinguish no assignment, draft assignment, scheduled assignment, active assignment, superseded assignment, canceled assignment, archived assignment, missing package version, unpublished package version, missing audit evidence, and conflict states.
- Operator summaries should show package label/version, lifecycle state, effective date, approval evidence availability, and caveats without exposing raw JSON snapshots by default.
- Attention-needed rows should identify companies with missing active assignment, multiple active assignments, scheduled assignments past effective date without activation evidence, assignments referencing missing/unpublished package versions, missing approval/audit evidence, or intent snapshots that claim billing/provider or entitlement/module behavior before those future models exist.
- The read model must never treat billing/provider status, Stripe subscription state, contractor groups, starter-pack assignments, module visibility, or entitlement intent as proof of package assignment truth or runtime enforcement.

Future schema/RLS/security gates:

- RLS must be enabled and forced for public assignment/audit tables; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin access must be server-side only; contractor organization owner/admin roles and navigation visibility are not package-assignment authorization.
- Service-role keys must never be exposed to browser/client code.
- Lifecycle/assignment RPCs, if later needed, must lock `search_path`, perform platform-admin authorization and readiness recomputation server-side, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Snapshots must be server-recomputed JSON objects. Client-submitted snapshots should never be accepted as authoritative.
- Snapshots must not store raw provider/billing secrets, raw provider errors, stack traces, service-role keys, sensitive payment method data, or unbounded payloads.
- Assignment creation alone must not mutate tenant-owned records, subscriptions, billing/provider state, entitlements, module availability, contractor permissions, starter-pack provisioning state, reporting/export files, automation, AI behavior, or runtime behavior.

Recommended first assignment implementation slice:

1. Add migrations for `contractor_package_assignments` and `contractor_package_assignment_audit_events` only after package definition/version and package definition audit foundations are implemented.
2. Add RLS/grant posture for platform-admin-only server access and no client service-role exposure.
3. Add generated/shared types if the repo pattern requires it.
4. Add platform-admin-only read helpers and a pure assignment read-model builder.
5. Add focused pure read-model tests for current assignment, history, scheduled changes, supersession chains, missing version caveats, impact caveats, and attention-needed rows.
6. Add a read-only Super Admin assignment inspection panel only.
7. Keep package assignment mutation actions, approval/schedule/activate/cancel controls, billing/provider mapping writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export actions, automation/AI assignment suggestions, and starter-pack provisioning changes deferred.

Contractor Package Assignment Approval / Activation Readiness:

This is implemented as pure read-only approval/activation readiness inspection. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, mutation controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, approval/schedule/activate/cancel/supersede/archive actions, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior. Current implemented status is limited to read-only `/super-admin/packages` package/billing observability, read-only assignment catalog/detail inspection, and the assignment activation readiness panel.

Future contractor package assignment readiness concepts:

- `assignment approval readiness`: future read-model status that decides whether a draft or pending-review assignment has the evidence needed for platform-admin approval.
- `activation readiness`: future read-model status that decides whether an approved or scheduled assignment can become active through an audited transition.
- `effective date readiness`: future check that the assignment has a valid effective date for scheduled activation and that the date is not stale or ambiguous.
- `billing impact readiness`: future caveat summary for expected billing effects; it is not a Stripe call, subscription mutation, invoice, charge, or payment collection action.
- `entitlement/module impact readiness`: future caveat summary for expected runtime/module effects; it is not entitlement enforcement, module gating, or contractor permission behavior.
- `package version validity`: future check that the selected package definition version still exists and is approved/published/active enough for assignment.
- `previous assignment status`: future readback of the company's current or prior package assignment so supersession can be reviewed before activation.
- `supersession readiness`: future check that replacing an active assignment preserves previous assignment evidence and links to the superseding assignment.
- `cancellation readiness`: future check that cancellation has operator reason, target state, effective date if relevant, and safe readback/rollback context.
- `rollback/readback readiness`: future support review state that explains what activation changed and what safe supersession/cancel path would be available later.
- `audit evidence readiness`: future check that approval, scheduling, activation, cancellation, supersession, and archive transitions can write safe audit evidence in the same transaction as the state change.
- `provider mapping readiness`: future caveat for whether billing/provider mapping is verified enough to inform operators; it must not execute provider changes.
- `support review state`: future operator-facing summary for blockers, warnings, impact caveats, missing evidence, and attention-needed rows.

Future assignment approval requirements:

- Platform-admin-only actor, checked server-side; contractor organization roles and navigation visibility are not assignment approval authorization.
- Explicit operator reason and confirmation phrase.
- Approval actor and approval timestamp.
- Company/contractor snapshot recomputed server-side from the selected `companies` record.
- Selected package definition/version snapshot recomputed server-side from future package definition/version records.
- Previous assignment snapshot, when a company already has an active, scheduled, superseded, canceled, or archived assignment.
- Impact summary with billing impact caveat, entitlement/module impact caveat, starter-pack implication caveat, provider mapping caveat, and no-runtime-effect caveat.
- Audit event write in the same transaction as any future approval transition, so assignment state and evidence cannot drift apart.

Future activation requirements:

- Assignment must already be approved.
- Effective date must be valid for immediate or scheduled activation.
- Selected package version must still be published/active and not deprecated, archived, missing, or superseded in a way that blocks activation.
- Previous active assignment must have a future supersession plan before activation can replace it.
- Activation must not silently mutate billing/provider state, create/update/cancel Stripe subscriptions, collect payment, create invoices, enforce entitlements, gate modules, change contractor permissions, provision starter packs, run reporting/export, trigger automation, run AI behavior, or change runtime behavior.
- Activation must write a future activation audit event with before/after snapshots, operator reason/confirmation, effective date, previous assignment link, package version snapshot, and impact caveats.
- Activation must not run from contractor group membership alone. Groups may provide future suggestion context only.
- Activation must not run from AI or automation. Human platform-admin confirmation remains required.

Future allowed transitions:

- `draft -> pending_review`
- `pending_review -> draft`
- `pending_review -> approved`
- `approved -> scheduled`
- `approved -> active`
- `scheduled -> active`
- `active -> superseded`
- `active -> canceled`
- `active -> archived` only after supersession or cancellation evidence exists as appropriate
- `canceled -> archived`
- `superseded -> archived`

Future blocked transitions:

- `draft -> active`
- `pending_review -> active`
- `canceled -> active`
- `archived -> active`
- `active -> draft`
- `active -> approved`
- `scheduled -> active` without a valid effective date.
- `approved -> active` if the selected package version is deprecated, archived, missing, or otherwise not valid for activation.
- Any activation that would create a second active assignment for a company without explicitly designed multi-package support.
- Any transition that would imply Stripe/provider mutation, billing subscription creation/update/cancel, payment collection, or invoice creation.
- Any transition that would imply entitlement/module/runtime enforcement, contractor permission changes, starter-pack provisioning, reporting/export behavior, automation, or AI behavior.

Contractor package assignment approval/readiness read model:

- `buildContractorPackageAssignmentActivationReadiness(...)` exposes assignment state, transition eligibility, blocking issues, warning issues, required future approval inputs, required future activation inputs, impact caveats, missing evidence, and safe operator summaries.
- The read model includes `actionAvailable: false`, `mutationAvailable: false`, `runtimeEffect: false`, `billingEffect: false`, `entitlementEffect: false`, `contractorPermissionEffect: false`, and `packageAssignmentWriteAvailable: false`.
- Blocking issues should include missing company/package/version context, invalid package version, missing required approval evidence, invalid effective date, current active assignment conflicts, missing supersession plan, missing audit evidence path, and any stale snapshot/readback condition.
- Warning issues should include billing/provider impact caveats, entitlement/module impact caveats, starter-pack implication caveats, grandfathered/custom-contract caveats, contractor group suggestion context, support-review needs, and runtime no-op reminders.
- The read model must never treat billing/provider status, Stripe subscription state, contractor groups, starter-pack assignments, module visibility, entitlement intent, or package definition lifecycle readiness as proof that assignment activation or runtime enforcement exists.

UI/control readiness:

- The first assignment readiness implementation is a read-only assignment readiness panel before any mutation controls.
- Mutation controls should come later one transition at a time, with no bulk assignment approval, no bulk activation, no apply-all assignment action, no auto activation, and no hidden runtime side effects.
- Future copy must say assignment controls affect only package assignment records and package assignment audit evidence until future billing/provider, entitlement/module, contractor-facing, reporting/export, and runtime systems are explicitly implemented.
- Approval, schedule, activate, cancel, supersede, and archive controls should require explicit operator reason and confirmation when they are eventually implemented.

Future schema/RLS/security gates:

- RLS must be enabled and forced for assignment/audit tables exposed through `public`; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin access must be server-side only; service-role keys must never be exposed to browser/client code.
- Transition RPCs, if later needed, must lock `search_path`, perform platform-admin authorization and readiness recomputation server-side, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Future errors should be safe for operators and avoid raw SQL/provider errors, stack traces, secrets, or unbounded metadata.
- Future transition actions must recompute readiness and snapshots server-side immediately before approval, scheduling, activation, cancellation, supersession, or archive. Client-submitted snapshots should never be accepted as authoritative.
- Snapshots must not store provider/billing secrets, raw provider errors, service-role keys, sensitive payment method data, or unbounded payloads.

Recommended next approval/activation readiness implementation slice:

1. Harden the read-only assignment readiness panel only if operator copy, caveat ordering, or browser QA exposes a defect.
2. Keep actual approval/schedule/activate/cancel/supersede/archive actions, billing/provider writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export actions, automation/AI assignment suggestions, and starter-pack provisioning changes deferred.
3. Proceed next to billing/provider mapping read-only schema planning or read-only provider mapping inspection only after assignment readiness remains stable and reviewable.

Billing / Provider Mapping Schema Readiness for Package Assignments:

This is future-only schema/read-model readiness planning. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability, the static Future Package Definition Model planning panel, and early-access `/setup/billing` payment-method setup; no package-assignment billing mapping table or provider reconciliation read model exists today.

Future billing/provider mapping concepts:

- `package assignment billing mapping`: future record linking an approved contractor package assignment to expected billing/provider references and billing impact evidence.
- `billing provider`: future provider identifier such as `stripe`, with explicit sandbox/test versus production separation.
- `provider customer reference`: safe provider customer id/reference tied to the contractor/company; it is a reference, not a secret and not a tenant business source of truth.
- `provider product reference`: safe provider product id/reference for the mapped package/commercial product.
- `provider price reference`: safe provider price id/reference for the mapped package price, plan tier, trial, discount, or custom commercial term.
- `provider subscription reference`: safe provider subscription id/reference when a subscription exists in the future provider workflow.
- `provider subscription item reference`: safe provider subscription item id/reference when a provider subscription has item-level package pricing.
- `billing state`: internal future mapping state, separate from contractor package assignment state and runtime entitlement state.
- `reconciliation state`: future read-model status comparing expected provider state to observed provider state.
- `sandbox/test-mode marker`: future marker that prevents test mappings, test subscriptions, or sandbox provider ids from being treated as production state.
- `trial/early-access state`: future commercial caveat that may explain why provider state is absent or delayed without implying package assignment or entitlement truth.
- `grandfathered/custom commercial terms`: future exception context for assignments whose provider mapping differs from standard package pricing.
- `expected provider state`: future server-computed expectation for customer/product/price/subscription/subscription-item references and status.
- `observed provider state`: future provider-read observation from webhook or server-side provider fetch; never client-submitted as authoritative.
- `reconciliation mismatch`: future attention-needed condition when expected and observed provider state diverge.

Proposed future billing/provider mapping tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `contractor_package_billing_mappings` | Store the future internal mapping between a contractor package assignment and billing/provider references, expected provider state, reconciliation state, and safe impact snapshots. | `id`, `company_id`, `package_assignment_id`, `package_definition_id`, `package_definition_version_id`, `billing_provider`, `provider_mode`, `provider_customer_ref`, `provider_product_ref`, `provider_price_ref`, `provider_subscription_ref`, `provider_subscription_item_ref`, `billing_state`, `lifecycle_state`, `reconciliation_state`, `trial_early_access_state`, `grandfathered_contract`, `custom_terms_label`, `expected_provider_state_snapshot`, `observed_provider_state_snapshot`, `billing_impact_snapshot`, `reconciliation_summary`, `last_verified_at`, `verified_by`, `created_by`, `updated_by`, `created_at`, `updated_at`, `archived_at`. Constrain lifecycle/status to `draft`, `provider_pending`, `mapped`, `verified`, `active`, `mismatch_detected`, `suspended`, `deprecated`, and `archived`. Constrain reconciliation to future statuses such as `not_checked`, `pending_verification`, `matched`, `mismatch_detected`, `stale_mapping`, `provider_unavailable`, and `support_review_required`. Candidate foreign keys: `company_id -> companies(id)`, future `package_assignment_id -> contractor_package_assignments(id)`, future package definition/version references, and actor fields to auth/profile user identity. | Platform-admin-only server access. Enable and force RLS if exposed through `public`; revoke broad `anon`/`authenticated` grants unless intentionally designed. Index by `company_id`, `package_assignment_id`, package definition/version ids, `billing_provider`, `provider_mode`, provider reference fields, lifecycle/billing/reconciliation state, and `last_verified_at` for current mapping, mismatch, and support-review reads. | No Stripe/provider call, subscription creation/update/cancel, invoice creation, payment collection, package assignment activation, entitlement/module enforcement, runtime gate, payment-method storage, raw provider error storage, contractor-facing visibility, reporting/export behavior, automation, AI reconciliation, or destructive auto-correction. |
| `contractor_package_billing_mapping_audit_events` | Store future evidence for provider mapping creation, verification, activation, mismatch review, suspension, deprecation, archive, and support-review decisions. | `id`, `billing_mapping_id`, `company_id`, `package_assignment_id`, `event_type`, `actor_user_id`, `reason`, `confirmation_text`, `before_snapshot`, `after_snapshot`, `metadata`, `occurred_at`, `created_at`. Future event families may include `billing_mapping_created`, `billing_mapping_verified`, `billing_mapping_activated`, `billing_mapping_mismatch_reviewed`, `billing_mapping_suspended`, `billing_mapping_deprecated`, `billing_mapping_archived`, and `billing_reconciliation_reviewed`. Snapshots and metadata should be JSONB objects with safe shape/size expectations. | Same platform-admin-only, server-side, RLS-forced posture as mapping records. Index by `billing_mapping_id`, `company_id`, `package_assignment_id`, `event_type`, `actor_user_id`, and `occurred_at` for timelines, latest-evidence checks, and attention-needed rows. | No provider mutation by itself, no subscription operation, no payment collection, no entitlement/module runtime effect, no package assignment write, no report/export file generation, and no contractor-facing behavior. |

Optional future tables should stay deferred unless operational evidence justifies them:

- `contractor_package_billing_reconciliation_events`: only if reconciliation checks become high-volume or need distinct retention from operator audit events.
- `contractor_package_billing_provider_snapshots`: only if provider observations need separate retention, redaction, or export handling from mapping records and audit events.

Future billing/provider mapping lifecycle states:

- `draft`: future mapping candidate is being prepared; no provider state is trusted and no billing mutation exists.
- `provider_pending`: future mapping is waiting for provider references, webhook evidence, or server-side verification.
- `mapped`: future provider references are recorded but not yet verified.
- `verified`: future expected and observed provider state has matched through an approved verification path.
- `active`: future mapping is the current internal provider mapping for an active package assignment, without implying runtime entitlements.
- `mismatch_detected`: future expected and observed provider state diverge and require support review.
- `suspended`: future mapping is temporarily not usable for billing operations or provider trust decisions.
- `deprecated`: future mapping is no longer used for new assignments but is preserved for history.
- `archived`: future mapping is retained for evidence and cannot be reactivated directly.

Future billing/provider mapping constraints:

- Provider references are references only. Internal package definitions, package assignments, audit evidence, and approved commercial terms remain the business source of truth.
- Mapping creation must not create/update/cancel Stripe subscriptions, create invoices, collect payment, or mutate provider state.
- Billing state must not automatically change entitlements, module visibility, runtime access, contractor permissions, starter-pack provisioning, or package assignment activation.
- Provider state must not automatically activate, cancel, supersede, or archive a package assignment.
- Reconciliation mismatch must not silently mutate records or destructively correct provider state; it should create attention-needed/support-review context only.
- Sandbox/test-mode mappings must stay separated from production mappings and must not be treated as live commercial state.
- Archived/deprecated mappings must preserve evidence/history instead of erasing provider references or audit snapshots.
- Mapping is not payment-method storage. Sensitive payment method details remain inside approved provider flows; exposed tables should store only safe references where needed.
- Mapping records, snapshots, and metadata must not store raw secrets, provider tokens, raw provider error payloads, raw card data, bank data, or sensitive payment method details.

Future reconciliation/readiness concepts:

- `expected provider state`: server-computed target state from package assignment, package version, commercial terms, provider references, and audit evidence.
- `observed provider state`: server-side provider observation from webhooks or explicit future provider reads.
- `stale provider mapping`: provider references or snapshots are too old, missing verification, or tied to outdated package/provider terms.
- `pending verification`: mapping has not yet been checked against provider state.
- `mismatch detected`: expected and observed state diverge.
- `support review required`: human platform-admin/support review is needed before any future billing action.
- `webhook dependency`: future trusted provider state requires signed webhook handling and replay/idempotency design before operational use.
- `idempotency requirement`: future provider mutations must use idempotency keys and durable operation records before any provider write.
- `rollback/recovery readiness`: future support path for deprecating, superseding, or correcting mappings without erasing history.
- `no destructive auto-correction`: reconciliation should never cancel subscriptions, change prices, rewrite assignments, or toggle entitlements automatically.

Future billing/provider mapping read model:

- A future helper such as `buildContractorPackageBillingMappingReadModel(...)` or `getContractorPackageBillingProviderReadiness(...)` should expose current provider mapping, provider state summary, reconciliation status, mismatch warnings, billing impact caveats, package assignment linkage, trial/early-access state, sandbox/production separation, safe operator summary, and attention-needed rows.
- Attention-needed rows should identify missing mapping for active/approved assignments, mappings without verified provider references, stale provider mappings, sandbox/production mismatch, provider reference conflicts, expected/observed state mismatches, missing audit evidence, missing webhook support, and custom/grandfathered terms needing review.
- Operator summaries should display provider references carefully, avoid raw provider payloads by default, and never show secrets, tokens, card details, bank details, raw provider errors, stack traces, or unbounded metadata.
- The read model must never treat provider references, Stripe subscription state, payment-method presence, billing state, or reconciliation status as entitlement truth, module gate truth, package assignment activation truth, contractor permission truth, or runtime enforcement.

Future schema/RLS/security gates:

- RLS must be enabled and forced for public mapping/audit tables; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin access must be server-side only; contractor organization owner/admin roles and navigation visibility are not provider-mapping authorization.
- Service-role keys and provider secret keys/tokens must never be exposed to browser/client code.
- Future provider RPCs, if later needed, must lock `search_path`, perform platform-admin authorization and server-side provider/readiness verification, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Provider ids are references, not secrets, but should still be displayed carefully and redacted or abbreviated where useful.
- Raw provider errors should not be stored directly. Store safe normalized error codes/messages and bounded support metadata.
- Client-submitted provider snapshots must not be accepted as authoritative; observed provider state must come from verified server-side provider reads or signed webhook processing.
- Payment method details must not be stored outside approved billing provider flows and safe reference fields already designed for early-access billing setup.

Recommended first billing/provider mapping implementation slice:

1. Add migrations for `contractor_package_billing_mappings` and `contractor_package_billing_mapping_audit_events` only after package definition/version, assignment, and assignment audit foundations exist.
2. Add RLS/grant posture for platform-admin-only server access and no client service-role exposure.
3. Add generated/shared types if the repo pattern requires it.
4. Add platform-admin-only read helpers and a pure provider mapping/reconciliation read-model builder.
5. Add focused pure read-model tests for current mapping, provider reference summaries, sandbox/production separation, reconciliation states, mismatch warnings, billing impact caveats, package assignment linkage, trial/early-access caveats, and attention-needed rows.
6. Add a read-only Super Admin provider readiness panel only.
7. Keep actual Stripe/provider calls, subscription creation/update/cancel, provider mutation controls, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI reconciliation behavior, and starter-pack provisioning changes deferred.

Billing / Provider Mapping Reconciliation Readiness Design:

This is future-only reconciliation/readiness planning. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability, the static Future Package Definition Model planning panel, and early-access `/setup/billing` payment-method setup; no package-assignment billing reconciliation table, provider snapshot table, provider operation, subscription mutation, or reconciliation read model exists today.

Future reconciliation concepts:

- `expected provider state`: future server-computed provider target derived from package assignment, package version, commercial terms, provider mapping references, trial/early-access state, custom/grandfathered terms, and audit evidence.
- `observed provider state`: future provider observation from signed webhook processing or explicit server-side provider reads; it is never client-submitted as authoritative.
- `reconciliation status`: future status describing whether expected and observed provider state has not started, is waiting on provider data, is pending verification, is verified, has mismatch, needs support review, is suspended, or is archived.
- `mismatch category`: future normalized reason for expected/observed divergence, such as missing provider customer, missing subscription, mismatched product/price, stale provider state, duplicate active subscription, orphaned provider subscription, unexpected provider status, invalid environment mix, or unsupported custom contract.
- `stale provider state`: future warning that provider observations are too old, no longer tied to the current mapping, missing webhook evidence, or not trusted for support decisions.
- `pending verification`: future state where provider references exist but have not been compared against expected state through an approved server-side path.
- `webhook dependency`: future requirement that provider-state trust depends on signed webhook verification, replay/idempotency handling, and bounded provider metadata.
- `provider sync attempt`: future evidence of a provider read/write/sync attempt; this planning pass does not implement attempts or provider operations.
- `support review required`: future human review state before any corrective action, provider operation, package assignment change, entitlement change, or runtime consequence.
- `recovery readiness`: future support path for rechecking, superseding, suspending, or deprecating reconciliation state without erasing evidence.
- `rollback readiness`: future support plan for undoing an approved provider operation or mapping correction only through explicit, audited, non-destructive steps.
- `sandbox/test-mode isolation`: future separation that prevents test-mode provider references, snapshots, webhooks, or subscriptions from being interpreted as production commercial state.
- `reconciliation evidence snapshot`: future safe JSON snapshot of expected state, observed state, provider references, mismatch classification, support-review decision, and recovery/rollback caveats.

Future reconciliation statuses:

- `not_started`: no provider reconciliation has been attempted.
- `pending_provider`: provider references, webhook evidence, or provider observations are missing.
- `pending_verification`: provider data exists but has not been checked through the approved server-side verification path.
- `verified`: expected and observed provider state match for the relevant mapping, environment, and timestamp window.
- `mismatch_detected`: expected and observed state diverge and require attention.
- `support_review_required`: a human platform-admin/support review is required before action.
- `suspended`: reconciliation state should not be used for billing trust decisions until reviewed.
- `archived`: reconciliation evidence is retained for history and cannot be reactivated directly.

Future mismatch categories:

- `missing_provider_customer`
- `missing_provider_subscription`
- `mismatched_price`
- `mismatched_product`
- `stale_provider_state`
- `duplicate_active_subscription`
- `orphaned_provider_subscription`
- `unexpected_provider_status`
- `invalid_environment_mix`
- `unsupported_custom_contract`

Future reconciliation constraints:

- Reconciliation must not silently mutate provider state, create/update/cancel Stripe subscriptions, create invoices, collect payment, or change provider products/prices.
- Reconciliation must not silently mutate package assignment state, approval state, activation state, supersession state, or cancellation state.
- Reconciliation must not silently mutate entitlement/module/runtime state, contractor permissions, contractor navigation, starter-pack provisioning, reporting/export, automation, or AI behavior.
- Mismatch detection alone must not suspend contractors, revoke access, change package status, change billing status, or trigger runtime consequences automatically.
- Support review may be required before any corrective action, and corrective action should remain a separate future workflow with explicit approval and audit evidence.
- Sandbox/test-mode provider state must stay isolated from production provider state, including webhook evidence, provider snapshots, subscription references, and reconciliation summaries.
- Provider state is evidence/reference, not the sole source of business truth. Internal package definitions, package assignments, commercial terms, billing mappings, and audit evidence remain governance truth.
- No destructive auto-correction should run without explicit approval, idempotency design, rollback/readback strategy, and preserved before/after evidence.
- Reconciliation evidence should be append-only or effectively immutable; archive, suspension, supersession, or review should not erase prior mismatch evidence.

Proposed future reconciliation tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `contractor_package_billing_reconciliation_events` | Store future append-only reconciliation evidence for expected-vs-observed provider comparisons, mismatch classification, support review, recovery readiness, rollback readiness, and archive decisions. | `id`, `billing_mapping_id`, `company_id`, `package_assignment_id`, `billing_provider`, `provider_mode`, `provider_customer_ref`, `provider_product_ref`, `provider_price_ref`, `provider_subscription_ref`, `provider_subscription_item_ref`, `reconciliation_status`, `mismatch_category`, `expected_provider_state_snapshot`, `observed_provider_state_snapshot`, `evidence_snapshot`, `support_review_required`, `reviewed_by`, `reviewed_at`, `reason`, `created_by`, `occurred_at`, `created_at`. Constrain reconciliation status to `not_started`, `pending_provider`, `pending_verification`, `verified`, `mismatch_detected`, `support_review_required`, `suspended`, and `archived`. Constrain mismatch category to the normalized future categories above, with nullable category when no mismatch exists. Candidate foreign keys include future billing mapping, company, package assignment, and actor references. | Platform-admin/support server-only access. Enable and force RLS if exposed through `public`; revoke broad `anon`/`authenticated` grants unless intentionally designed. Index by `billing_mapping_id`, `company_id`, `package_assignment_id`, `billing_provider`, `provider_mode`, provider reference fields, `reconciliation_status`, `mismatch_category`, `support_review_required`, `reviewed_at`, and `occurred_at` for current status, mismatch, stale verification, and support-review queues. | No provider mutation, subscription creation/update/cancel, payment collection, package assignment activation, entitlement/module/runtime change, contractor-facing behavior, export file generation, automation, AI reconciliation, or destructive auto-correction. |
| `contractor_package_billing_provider_snapshots` | Store future sanitized provider observations used by reconciliation, with expected/observed state kept safe, bounded, and environment-scoped. | `id`, `billing_mapping_id`, `company_id`, `billing_provider`, `provider_mode`, `provider_customer_ref`, `provider_product_ref`, `provider_price_ref`, `provider_subscription_ref`, `provider_subscription_item_ref`, `provider_object_type`, `provider_status`, `observed_provider_state_snapshot`, `normalized_error_code`, `normalized_error_message`, `observed_at`, `source`, `webhook_event_ref`, `created_at`. Provider snapshots must use safe JSON objects, bounded metadata, nullable normalized error fields, and explicit provider mode to separate test from production. | Platform-admin/support server-only access with forced RLS when public. Revoke broad grants unless explicitly exposed. Index by `billing_mapping_id`, `company_id`, `billing_provider`, `provider_mode`, provider references, `provider_object_type`, `provider_status`, `source`, and `observed_at` for latest observation and stale-state detection. | No raw provider payload dumps, raw provider errors, provider secrets/tokens, payment method data, service-role keys, webhook secret storage, subscription mutation, package assignment mutation, entitlement/module/runtime effect, or contractor-facing visibility. |

Optional future tables should stay deferred unless operational evidence justifies them:

- `contractor_package_billing_sync_attempts`: only if provider reads/writes need durable operation attempts, idempotency keys, retry state, and operation-result retention separate from provider snapshots.
- `contractor_package_billing_reconciliation_reviews`: only if support review workflows need distinct assignment, review state, escalation, notes, SLA, or approval metadata separate from append-only reconciliation events.

Future reconciliation read model:

- A future helper such as `buildContractorPackageBillingReconciliationReadModel(...)` or `getContractorPackageProviderReconciliationStatus(...)` should expose current reconciliation state, mismatch summaries, stale verification warnings, provider environment warnings, support-review-needed rows, recovery readiness, rollback readiness, assignment linkage, safe operator summary, and attention-needed rows.
- Attention-needed rows should identify missing provider snapshots, missing provider customer, missing subscription, mismatched product/price, stale provider state, duplicate active subscription, orphaned provider subscription, unexpected provider status, invalid environment mix, unsupported custom contract, missing webhook evidence, missing support review, and archived/suspended mappings that still have active package assignment context.
- Operator summaries should display provider references carefully, show normalized statuses and mismatch categories, and avoid raw provider payloads, raw errors, secrets, tokens, card details, bank details, stack traces, and unbounded metadata.
- The read model must never treat reconciliation status, provider subscription status, payment-method presence, or provider snapshot state as entitlement truth, module gate truth, package assignment activation truth, contractor permission truth, billing mutation approval, or runtime enforcement.

Future reconciliation workflow:

1. Provider snapshot ingestion records a sanitized observed provider state from signed webhook processing or future server-side provider reads only.
2. Expected provider state is recomputed server-side from package assignment, package version, billing mapping, commercial terms, trial/early-access context, custom/grandfathered terms, and audit evidence.
3. Expected and observed state are compared by a deterministic read model that classifies status and mismatch category without mutating provider, assignment, billing, entitlement, module, contractor, or runtime records.
4. Support-review-needed rows are surfaced for platform-admin/support review when mismatch, stale state, invalid environment mix, unsupported custom contract, or missing evidence is present.
5. Approved corrective action remains future-only and must be separately designed with explicit approval, idempotency keys, provider-operation evidence, before/after snapshots, rollback/readback plan, and no hidden side effects.
6. Reconciliation archive/history retention preserves old snapshots, mismatch evidence, support decisions, and supersession/deprecation context.
7. Audit evidence retention must keep operator reasons, confirmation text when required, actor/timestamp, expected/observed snapshots, normalized provider references, and safe metadata.

Future reconciliation schema/RLS/security gates:

- RLS must be enabled and forced for public reconciliation/provider-snapshot tables; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin/support access must be server-side only; contractor organization owner/admin roles and contractor navigation visibility are not reconciliation authorization.
- Service-role keys, provider secret keys/tokens, webhook signing secrets, and raw provider credentials must never be exposed to browser/client code or stored in exposed tables.
- Future reconciliation RPCs, if later needed, must lock `search_path`, perform platform-admin/support authorization, recompute expected state server-side, verify provider snapshots server-side, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Provider ids are references, not secrets, but should still be displayed carefully and redacted or abbreviated where useful.
- Raw provider payloads and raw provider errors should not be exposed directly. Store safe normalized error codes/messages and bounded support metadata only.
- Client-submitted provider snapshots must not be accepted as authoritative; observed provider state must come from signed webhook processing or verified server-side provider reads.
- Webhook-derived state must require signature verification, replay/idempotency handling, environment validation, and safe payload normalization before it can feed reconciliation.

Recommended first reconciliation implementation slice:

1. Add migrations for `contractor_package_billing_reconciliation_events` and `contractor_package_billing_provider_snapshots` only after package definition/version, assignment, assignment audit, billing mapping, and billing mapping audit foundations exist.
2. Add RLS/grant posture for platform-admin/support server-only access and no client service-role exposure.
3. Add generated/shared types if the repo pattern requires it.
4. Add platform-admin-only read helpers and a pure reconciliation read-model builder.
5. Add focused pure read-model tests for expected-vs-observed comparison, reconciliation statuses, mismatch categories, stale verification warnings, sandbox/production isolation, provider reference sanitization, support-review-needed rows, recovery readiness, rollback readiness, and no unintended billing/assignment/entitlement/runtime mutation.
6. Add a read-only Super Admin reconciliation panel only.
7. Keep actual Stripe/provider calls, subscription creation/update/cancel, provider mutation controls, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI reconciliation behavior, and starter-pack provisioning changes deferred.

Billing / Provider Operation Evidence and Idempotency Readiness Design:

This is future-only evidence/idempotency readiness planning. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, background jobs, retries, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability, the static Future Package Definition Model planning panel, and early-access `/setup/billing` payment-method setup; no package-assignment provider operation table, provider operation attempt table, webhook event table, retry queue, provider operation RPC, idempotency layer, Stripe/provider mutation, subscription mutation, or provider-operation read model exists today.

Future provider operation concepts:

- `provider operation request`: future internal server-side request to perform or inspect a provider action after explicit platform-admin/support approval; this planning pass does not create requests.
- `provider operation attempt`: future append-only attempt record for one provider submission, read, webhook ingest, reconciliation check, or retry classification.
- `provider operation evidence`: future safe evidence tying operation intent, actor, package assignment, billing mapping, idempotency key, provider references, request summary, response summary, and reconciliation linkage together.
- `provider response evidence`: future safe provider-result summary, status, reference ids, normalized error fields, timestamps, and bounded metadata; raw payload dumps are out of scope.
- `idempotency key`: future server-generated key used for provider mutation safety so repeated submissions do not create duplicate provider artifacts.
- `operation correlation id`: future internal id that groups request, attempts, provider response evidence, webhook correlation, reconciliation events, support review, and retry/readback state.
- `reconciliation linkage`: future references from provider operations to reconciliation events/provider snapshots so operators can explain how a provider action affected expected-vs-observed state.
- `retry eligibility`: future read-model status describing whether a failed operation can be retried safely with the same idempotency identity or requires a new approved operation.
- `retry suppression`: future safety state that blocks retry due to duplicate risk, environment mismatch, destructive risk, stale evidence, missing approval, unsupported custom contract, or required support review.
- `safe provider error summary`: future normalized provider error code/message/category designed for operators without secrets, stack traces, raw payloads, tokens, card details, or unbounded metadata.
- `provider webhook correlation`: future linkage between signed provider webhooks and operation/correlation ids; webhook replay must be detectable before trusted linkage.
- `operator review state`: future support/platform-admin review status for operation evidence, retry decisions, readback, rollback/recovery, and archive.
- `rollback/recovery evidence`: future safe before/after and readback evidence used to plan recovery without erasing prior attempts or silently mutating provider/package state.
- `environment isolation`: future separation between sandbox/test-mode and production provider operations, references, idempotency keys, webhook evidence, and retry queues.

Future provider operation types:

- `provider_customer_create`
- `provider_subscription_create`
- `provider_subscription_update`
- `provider_subscription_cancel`
- `provider_subscription_suspend`
- `provider_subscription_resume`
- `provider_price_lookup`
- `provider_product_lookup`
- `provider_webhook_ingest`
- `provider_reconciliation_check`

Future provider operation statuses:

- `pending`
- `submitted`
- `provider_acknowledged`
- `provider_completed`
- `provider_failed`
- `retry_pending`
- `retry_suppressed`
- `support_review_required`
- `archived`

Future idempotency constraints:

- Repeated provider mutation requests must not create duplicate provider customers, subscriptions, subscription items, products, prices, invoices, or payment artifacts.
- Retries should preserve the same idempotency identity where the provider operation is the same logical mutation and should require explicit review when a new idempotency identity is needed.
- Provider operation evidence should be append-only or effectively immutable; corrections, retries, archives, and support reviews should add evidence rather than rewrite history.
- Retries should not erase prior failures, provider acknowledgements, response summaries, webhook correlations, reconciliation events, or support review decisions.
- Provider webhook replay must be detectable through provider event references, signature verification, received timestamps, replay/readback flags, and operation correlation where possible.
- Sandbox/test-mode operations, idempotency keys, provider references, webhooks, operation attempts, and retry decisions must stay isolated from production operations.
- No destructive retry loops should run; retry eligibility must be bounded, reviewed, and unable to repeatedly cancel/update/suspend/resume subscriptions without explicit approval.
- Retry suppression may require support review when failure cause, provider acknowledgement, environment, custom contract, duplicate risk, or reconciliation state is ambiguous.

Proposed future provider operation evidence tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `contractor_package_billing_provider_operations` | Store future operation intent/evidence for provider actions tied to package assignments, billing mappings, reconciliation, idempotency, and operator/support review. | `id`, `operation_correlation_id`, `company_id`, `package_assignment_id`, `billing_mapping_id`, `reconciliation_event_id`, `billing_provider`, `provider_mode`, `operation_type`, `operation_status`, `idempotency_key_hash`, `provider_customer_ref`, `provider_product_ref`, `provider_price_ref`, `provider_subscription_ref`, `provider_subscription_item_ref`, `request_evidence_snapshot`, `latest_response_evidence_snapshot`, `safe_error_code`, `safe_error_message`, `safe_error_category`, `retry_eligible`, `retry_suppressed_reason`, `operator_review_state`, `requested_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `archived_at`. Constrain operation types and statuses to the future enums above. Idempotency keys should not be stored raw if avoidable; store a hash/fingerprint plus safe display suffix where useful. | Platform-admin/support server-only access. Enable and force RLS if exposed through `public`; revoke broad `anon`/`authenticated` grants unless intentionally designed. Index by `company_id`, `package_assignment_id`, `billing_mapping_id`, `operation_correlation_id`, `billing_provider`, `provider_mode`, `operation_type`, `operation_status`, `idempotency_key_hash`, provider references, `retry_eligible`, `operator_review_state`, and timestamps for operation timelines, idempotency grouping, retry review, and support queues. | No provider call, Stripe call, subscription creation/update/cancel, automated retry, reconciliation auto-fix, payment collection, package assignment write, entitlement/module/runtime change, contractor-facing behavior, reporting/export file generation, automation, AI retry behavior, or destructive correction. |
| `contractor_package_billing_provider_operation_attempts` | Store future append-only attempt history for submissions, lookups, webhook ingest, reconciliation checks, retries, provider acknowledgements, failures, and support readbacks. | `id`, `provider_operation_id`, `operation_correlation_id`, `attempt_number`, `attempt_status`, `billing_provider`, `provider_mode`, `operation_type`, `idempotency_key_hash`, `request_evidence_snapshot`, `response_evidence_snapshot`, `provider_request_ref`, `provider_response_ref`, `webhook_event_ref`, `reconciliation_event_id`, `safe_error_code`, `safe_error_message`, `safe_error_category`, `submitted_at`, `acknowledged_at`, `completed_at`, `failed_at`, `created_by`, `created_at`. Attempt statuses may reuse operation statuses where useful or a narrower future set such as submitted/acknowledged/completed/failed/retry_suppressed. | Same server-only, platform-admin/support, forced-RLS posture as operations. Index by `provider_operation_id`, `operation_correlation_id`, `attempt_number`, `billing_provider`, `provider_mode`, `operation_type`, `idempotency_key_hash`, provider request/response refs, webhook refs, reconciliation refs, safe error category, and timestamps for attempt history and replay/readback review. | No mutation by itself, no raw provider payload storage, no secrets/tokens/card data, no browser service-role exposure, no automatic retry loop, no entitlement/module/runtime effect, no package assignment write, and no contractor-facing behavior. |

Optional future tables should stay deferred unless operational evidence justifies them:

- `contractor_package_billing_provider_webhook_events`: only if signed webhook ingestion needs durable event storage, replay detection, signature verification evidence, delivery timing, and correlation separate from operation attempts/provider snapshots.
- `contractor_package_billing_provider_retry_queue`: only if future retries become queued operations with explicit approvals, retry windows, suppression reasons, idempotency constraints, and support ownership. It must not imply automation/AI retry behavior.

Future provider operation read model:

- A future helper such as `buildContractorPackageProviderOperationReadModel(...)` or `getContractorPackageProviderOperationEvidence(...)` should expose provider operation timeline, attempt history, idempotency grouping, retry status, webhook correlation, reconciliation linkage, safe operator summaries, support-review-needed rows, and attention-needed rows.
- Attention-needed rows should identify failed operations without review, ambiguous provider acknowledgement, missing webhook correlation, duplicate idempotency key conflict, environment mismatch, retry suppression, stale readback evidence, unsupported custom contract, missing reconciliation linkage, and archived operations still referenced by active mappings.
- Operator summaries should display provider references carefully and show normalized request/response evidence, operation status, retry status, safe error summaries, and support review state without raw provider payloads, secrets, tokens, card details, bank details, stack traces, or unbounded metadata.
- The read model must never treat operation status, provider response evidence, retry eligibility, webhook correlation, or reconciliation linkage as entitlement truth, module gate truth, package assignment activation truth, contractor permission truth, billing mutation approval, or runtime enforcement.

Future provider-operation workflow:

1. Operation request generation creates future server-side operation intent only after package assignment, billing mapping, provider readiness, and support/operator approval prerequisites exist.
2. Idempotency key assignment happens server-side before any provider mutation and is tied to operation type, company, package assignment, billing mapping, provider mode, target provider references, and approved request snapshot.
3. Provider submission remains future-only and must write operation/attempt evidence before and after provider communication.
4. Provider response capture stores safe response evidence, normalized provider references, status, and safe error summary without raw payload dumps or secrets.
5. Retry/review classification determines retry eligibility, retry suppression, and support-review requirements without automatically retrying or mutating records.
6. Webhook correlation links signed provider webhooks to operation/correlation ids and detects replay before trusted linkage.
7. Reconciliation linkage ties completed/failed operations and webhook/readback evidence to future reconciliation events/provider snapshots.
8. Support review records operator reasoning, readback requirements, rollback/recovery caveats, and whether a new approved operation is required.
9. Archival/history retention preserves operation intent, attempts, failures, retries, suppression, webhook correlation, reconciliation linkage, and support review evidence.

Future provider-operation schema/RLS/security gates:

- RLS must be enabled and forced for public operation/attempt tables; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin/support access must be server-side only; contractor organization owner/admin roles and contractor navigation visibility are not provider-operation authorization.
- Service-role keys, provider secret keys/tokens, webhook signing secrets, raw provider credentials, raw card data, bank data, and sensitive payment method details must never be exposed to browser/client code or stored in exposed tables.
- Future provider-operation RPCs, if later needed, must lock `search_path`, perform platform-admin/support authorization, recompute operation readiness server-side, verify idempotency server-side, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- No raw provider payload dumps should be exposed directly. Store safe request/response evidence snapshots, safe normalized error codes/messages/categories, bounded metadata, and carefully displayed provider references only.
- Client-submitted provider evidence must not be accepted as authoritative; request evidence, provider responses, webhook correlation, and reconciliation linkage must be server-generated or server-verified.
- Webhook signature verification is required before trusted provider-operation linkage. Webhook replay handling, environment validation, payload normalization, and safe error handling must be designed before provider webhooks can drive evidence.

Recommended first provider-operation evidence implementation slice:

1. Add migrations for `contractor_package_billing_provider_operations` and `contractor_package_billing_provider_operation_attempts` only after package definition/version, assignment, assignment audit, billing mapping, billing mapping audit, and reconciliation foundations exist.
2. Add RLS/grant posture for platform-admin/support server-only access and no client service-role exposure.
3. Add generated/shared types if the repo pattern requires it.
4. Add platform-admin/support read helpers and a pure provider-operation evidence/idempotency read-model builder.
5. Add focused pure read-model/idempotency tests for operation timelines, attempt history, operation statuses, operation types, idempotency grouping, retry eligibility/suppression, webhook correlation, reconciliation linkage, safe error summaries, sandbox/production isolation, provider reference sanitization, and no unintended billing/assignment/entitlement/runtime mutation.
6. Add a read-only Super Admin provider operation evidence panel only.
7. Keep actual Stripe/provider calls, subscription creation/update/cancel, automated retries, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI retry behavior, and starter-pack provisioning changes deferred.

Billing / Provider Webhook Evidence and Correlation Readiness Design:

This is future-only webhook evidence/correlation readiness planning for package/billing governance. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, background jobs, webhook ingestion, retries, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability, the static Future Package Definition Model planning panel, early-access `/setup/billing` payment-method setup, and the existing canonical invoice/payment Stripe webhook foundation; no package-assignment provider webhook evidence table, webhook correlation table, webhook replay table, package-governance webhook RPC, package-governance webhook read model, subscription mutation, or package-governance webhook-triggered workflow exists today.

Future webhook evidence concepts:

- `provider webhook event`: future durable, append-only evidence row for a provider event related to package assignment billing/provider mapping, provider operations, or reconciliation.
- `provider webhook payload evidence`: future sanitized, bounded payload evidence derived from a verified provider event without exposing raw provider dumps to operators.
- `provider webhook signature verification`: future server-side verification evidence proving whether a provider webhook signature was checked, passed, failed, or could not be trusted.
- `provider webhook correlation id`: future internal correlation id tying webhook receipt, signature evidence, dedupe/replay state, provider references, provider operation linkage, reconciliation linkage, and support review together.
- `provider webhook replay detection`: future ability to detect repeated provider event ids, repeated signatures, repeated received payload fingerprints, or stale replay attempts before trusted linkage.
- `provider webhook deduplication`: future idempotent handling so duplicate provider events do not create duplicate provider operations, duplicate reconciliation events, duplicate assignment impacts, or duplicate support queue rows.
- `provider webhook reconciliation linkage`: future reference from a verified webhook to expected-vs-observed provider reconciliation evidence.
- `provider webhook operation linkage`: future reference from a verified webhook to provider operation/correlation evidence when the webhook confirms, rejects, or updates a known operation.
- `provider webhook support review state`: future human-review status for invalid signatures, duplicate events, mismatches, orphaned provider references, unsupported custom contracts, environment mismatch, or ambiguous linkage.
- `provider webhook archive/history retention`: future retention of received, verified, failed, duplicate, correlated, reviewed, and archived webhook evidence without erasing prior evidence.
- `provider webhook environment isolation`: future separation between sandbox/test-mode and production webhook endpoints, event ids, provider references, operation linkages, reconciliation rows, and support review queues.

Future webhook event categories:

- `customer_created`
- `customer_updated`
- `subscription_created`
- `subscription_updated`
- `subscription_deleted`
- `invoice_paid`
- `invoice_failed`
- `checkout_completed`
- `payment_method_updated`
- `product_updated`
- `price_updated`
- `webhook_signature_invalid`
- `webhook_duplicate_detected`
- `reconciliation_triggered`

Future webhook processing statuses:

- `received`
- `signature_pending`
- `signature_verified`
- `signature_failed`
- `correlated`
- `duplicate_detected`
- `reconciliation_pending`
- `support_review_required`
- `archived`

Future webhook constraints:

- Webhook ingestion alone must not mutate package assignments automatically.
- Webhook ingestion alone must not mutate entitlements, module visibility, module gates, contractor runtime access, or package enforcement.
- Webhook ingestion alone must not mutate contractor permissions, contractor navigation, starter-pack provisioning, reporting/export behavior, automation, or AI behavior.
- Webhook replay must be detectable before any trusted linkage, reconciliation trigger, support queue classification, or future corrective action.
- Duplicate events must not create duplicate provider operations, provider attempts, reconciliation events, package assignment impacts, subscription operations, or support review rows.
- Sandbox/test-mode webhook events, provider references, payload fingerprints, correlation ids, operation linkages, reconciliation rows, and retry/review decisions must remain isolated from production state.
- Webhook evidence should be append-only or effectively immutable; corrections, duplicate markers, correlation updates, support reviews, and archives should add evidence instead of rewriting history.
- Invalid signatures should be retained as safe evidence for security review without trusting the payload for provider state, package assignment, billing, entitlement, module, runtime, or contractor permission decisions.
- Raw provider payloads must not be exposed directly to operators without sanitization/redaction. Safe payload summaries, provider references, event ids, timestamps, and normalized status/error fields should be bounded and display-safe.

Proposed future webhook evidence tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `contractor_package_billing_provider_webhook_events` | Store future append-only provider webhook evidence for package-governance billing/provider mapping, provider operation correlation, replay detection, support review, and reconciliation linkage. | `id`, `webhook_correlation_id`, `company_id`, `billing_provider`, `provider_mode`, `provider_event_id`, `provider_event_type`, `webhook_category`, `processing_status`, `payload_fingerprint`, `signature_verification_status`, `signature_verified_at`, `received_at`, `provider_created_at`, `provider_customer_ref`, `provider_product_ref`, `provider_price_ref`, `provider_subscription_ref`, `provider_subscription_item_ref`, `provider_invoice_ref`, `provider_checkout_ref`, `provider_payment_method_ref`, `payload_evidence_snapshot`, `sanitized_payload_summary`, `safe_error_code`, `safe_error_message`, `safe_error_category`, `duplicate_of_webhook_event_id`, `support_review_state`, `archived_at`, `created_at`, `updated_at`. Constrain webhook categories and processing statuses to the future enums above. Payload evidence must be a JSON object, bounded, sanitized, and safe for server-side review only. | Platform-admin/support server-only access. Enable and force RLS if exposed through `public`; revoke broad `anon`/`authenticated` grants unless intentionally designed. Index by `company_id`, `billing_provider`, `provider_mode`, `provider_event_id`, `webhook_correlation_id`, `webhook_category`, `processing_status`, `signature_verification_status`, `payload_fingerprint`, duplicate references, provider references, support review state, and timestamps for timelines, duplicate checks, replay checks, and support queues. | No webhook route, provider call, Stripe call, subscription creation/update/cancel, package assignment write, entitlement/module/runtime change, contractor permission change, reporting/export file generation, automation, AI webhook handling, or trusted provider-state mutation by itself. |
| `contractor_package_billing_provider_webhook_correlations` | Store future linkage evidence between verified webhooks, provider operations, billing mappings, reconciliation events, package assignments, duplicate/replay findings, and support review. | `id`, `webhook_event_id`, `webhook_correlation_id`, `company_id`, `package_assignment_id`, `billing_mapping_id`, `provider_operation_id`, `provider_operation_attempt_id`, `reconciliation_event_id`, `provider_snapshot_id`, `correlation_status`, `correlation_reason`, `replay_detected`, `duplicate_detected`, `environment_mismatch_detected`, `support_review_state`, `correlated_by`, `correlated_at`, `created_at`, `updated_at`, `archived_at`. Constrain correlation statuses to a future set such as `pending`, `linked_to_operation`, `linked_to_reconciliation`, `duplicate`, `replay_suspected`, `environment_mismatch`, `support_review_required`, and `archived`. | Same server-only, platform-admin/support, forced-RLS posture as webhook events. Index by `webhook_event_id`, `webhook_correlation_id`, `company_id`, package assignment, billing mapping, provider operation, reconciliation event, provider snapshot, correlation status, replay/duplicate flags, support review state, and timestamps. | No automatic corrective action, no provider mutation, no package assignment activation, no billing/subscription mutation, no entitlement/module/runtime enforcement, no contractor-facing behavior, no reporting/export behavior, and no automation/AI handling. |

Optional future tables should stay deferred unless operational evidence justifies them:

- `contractor_package_billing_provider_webhook_failures`: only if invalid signatures, malformed payloads, unsupported event types, environment mismatches, or provider parsing failures require a separate failure queue beyond the event table.
- `contractor_package_billing_provider_webhook_replays`: only if replay detection needs dedicated event history, replay fingerprints, repeated delivery windows, source IP/user-agent context, or support ownership separate from the main webhook event/correlation records.

Future webhook read model:

- A future helper such as `buildContractorPackageProviderWebhookReadModel(...)` or `getContractorPackageProviderWebhookEvidence(...)` should expose webhook timeline, signature verification state, replay/duplicate warnings, operation linkage, reconciliation linkage, support-review-needed rows, environment warnings, safe operator summaries, and attention-needed rows.
- Attention-needed rows should identify signature failures, duplicate/replay detections, missing provider references, orphaned provider events, environment mismatch, stale uncorrelated events, missing operation linkage, missing reconciliation linkage, unsupported custom contract state, and verified webhooks that still require support review.
- Operator summaries should show provider references carefully, signature state, processing status, duplicate/replay state, sanitized payload summary, operation/reconciliation linkage, and support review state without raw provider payload dumps, provider secrets, webhook signing secrets, tokens, card data, bank data, stack traces, or unbounded metadata.
- The read model must never treat webhook event status, provider payload evidence, signature verification, correlation status, or reconciliation linkage as entitlement truth, module gate truth, package assignment activation truth, contractor permission truth, subscription mutation approval, or runtime enforcement.

Future webhook workflow:

1. Webhook receipt remains future-only for package governance and should capture raw request body only long enough for server-side signature verification and safe evidence normalization.
2. Signature verification must run server-side before trusted linkage, and invalid signatures should create safe evidence without trusting provider state.
3. Replay/deduplication checks compare provider event id, payload fingerprint, provider mode, received timestamps, signature evidence, and prior webhook/correlation rows.
4. Provider correlation maps verified webhook references to future provider customer/product/price/subscription/subscription item/invoice/checkout/payment-method references without treating provider state as sole business truth.
5. Operation linkage connects webhooks to future provider operation/attempt evidence when the event confirms, updates, fails, or conflicts with a known operation.
6. Reconciliation linkage creates or references future expected-vs-observed reconciliation evidence without auto-fixing mismatches.
7. Support review classifies invalid signatures, duplicates, replays, orphaned events, environment mismatch, unsupported custom contracts, and ambiguous provider state before any future corrective action.
8. Archival/history retention preserves receipt, signature, replay, duplicate, correlation, support review, and reconciliation evidence.

Future webhook schema/RLS/security gates:

- RLS must be enabled and forced for public webhook/correlation tables; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin/support access must be server-side only; contractor organization owner/admin roles and contractor navigation visibility are not webhook evidence authorization.
- Service-role keys, provider secret keys/tokens, webhook signing secrets, raw provider credentials, raw card data, bank data, and sensitive payment method details must never be exposed to browser/client code or stored in exposed tables.
- Future webhook verification RPCs, if later needed, must lock `search_path`, perform platform-admin/support or trusted server-only authorization as appropriate, verify signatures server-side, enforce replay protection server-side, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- No raw provider payload dumps should be exposed directly to operators. Store safe payload summaries, normalized event categories/statuses, bounded metadata, safe error summaries, and carefully displayed provider references only.
- Signature verification is required before trusted provider-operation or reconciliation linkage.
- Replay protection is required before any webhook-triggered workflow, reconciliation trigger, support queue classification, or future corrective action.
- Client-submitted webhook payloads, signature evidence, provider evidence, operation linkage, and reconciliation linkage must not be accepted as authoritative.

Recommended first webhook evidence implementation slice:

1. Add migrations for `contractor_package_billing_provider_webhook_events` and `contractor_package_billing_provider_webhook_correlations` only after package definition/version, assignment, assignment audit, billing mapping, billing mapping audit, reconciliation, and provider-operation foundations exist.
2. Add RLS/grant posture for platform-admin/support server-only access and no client service-role exposure.
3. Add generated/shared types if the repo pattern requires it.
4. Add platform-admin/support read helpers and a pure webhook evidence/correlation read-model builder.
5. Add focused pure read-model tests for webhook timelines, signature verification state, processing statuses, webhook categories, duplicate/replay warnings, operation linkage, reconciliation linkage, environment isolation, safe payload summaries, provider reference sanitization, support-review-needed rows, and no unintended billing/assignment/entitlement/runtime mutation.
6. Add a read-only Super Admin webhook evidence panel only.
7. Keep actual Stripe/provider webhook ingestion, subscription creation/update/cancel, webhook-triggered reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI webhook handling, and starter-pack provisioning changes deferred.

Billing / Provider Support Review and Manual Resolution Readiness Design:

This is future-only support-review/manual-resolution readiness planning for package/billing governance. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, background jobs, support queues, manual resolution actions, corrective actions, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability, the static Future Package Definition Model planning panel, early-access `/setup/billing` payment-method setup, and the existing canonical invoice/payment Stripe webhook foundation; no package-billing support review table, support review event table, manual resolution proposal table, support-review read model, support-resolution RPC, provider corrective action, subscription mutation, entitlement/module enforcement, or package-governance support workflow exists today.

Future support-review concepts:

- `support review queue`: future read-only/operator queue of package-billing provider mismatches, reconciliation blockers, webhook evidence conflicts, stale mappings, and manual-resolution candidates.
- `manual resolution request`: future human-created or system-classified review item that asks platform-admin/support to evaluate evidence before any corrective action exists.
- `operator review state`: future status for triage, missing evidence, provider confirmation, approval readiness, blocked resolution, resolved review, and archive history.
- `support escalation`: future marker that a mismatch needs billing/provider, security, product, or operations review before a corrective-action proposal can be approved.
- `resolution evidence`: future append-only safe evidence made from reconciliation rows, webhook correlations, provider operation evidence, mapping snapshots, operator notes, and server-verified summaries.
- `corrective-action proposal`: future non-executing proposal that describes a possible provider or internal correction but does not perform the correction.
- `approval requirement`: future explicit approval gate before any corrective action can move to a separate execution path.
- `rollback/recovery evidence`: future before/after/readback context required for recovery planning and post-resolution review.
- `reconciliation dependency`: future linkage to expected-vs-observed reconciliation evidence; support review should not become a substitute provider-state source of truth.
- `webhook/provider linkage`: future references to signed webhook evidence, provider operation attempts, provider snapshots, and provider references used to explain the review.
- `assignment impact review`: future caveat that a proposed resolution may affect package assignment interpretation, but review alone never mutates package assignments.
- `entitlement/runtime impact caveat`: future warning that package/billing mismatches may later affect entitlements/modules/runtime only after separate explicitly approved systems exist.
- `environment isolation`: future separation between sandbox/test-mode reviews and production reviews, evidence, provider references, proposals, approvals, and archives.

Future support-review statuses:

- `pending_review`
- `awaiting_evidence`
- `awaiting_provider_confirmation`
- `approved_for_resolution`
- `resolution_blocked`
- `resolved`
- `archived`

Future resolution categories:

- `provider_state_mismatch`
- `duplicate_provider_subscription`
- `orphaned_provider_subscription`
- `stale_provider_mapping`
- `invalid_environment_mix`
- `unsupported_custom_contract`
- `webhook_replay_issue`
- `missing_provider_customer`
- `missing_provider_subscription`
- `manual_support_override_required`

Future support-review constraints:

- Review queues alone must not mutate provider state, package assignments, entitlements/modules/runtime, billing status, subscriptions, contractor permissions, contractor navigation, starter-pack provisioning, reporting/export behavior, automation, AI behavior, or product behavior.
- Support review alone must not trigger Stripe/provider operations, provider reads, provider writes, webhook replay, subscription creation/update/cancel, invoice creation, payment collection, reconciliation auto-fix, package assignment activation, entitlement enforcement, module gating, or runtime access changes.
- Corrective actions require explicit approval, server-side recomputation, safe evidence, operator reason/confirmation, and a separate future execution path.
- Sandbox/test-mode support reviews, provider references, webhook evidence, reconciliation rows, operation evidence, proposals, approvals, and archives must remain isolated from production reviews.
- Resolution evidence should be append-only or effectively immutable. Corrections, rejected outcomes, manual-review outcomes, escalation notes, provider confirmations, approval decisions, recovery notes, and archive markers add evidence instead of erasing prior rows.
- No destructive auto-fix may run without explicit approved corrective action, idempotency design, rollback/readback strategy, and preserved before/after evidence.
- Provider state is evidence/reference, not the sole source of business truth. Internal package definitions, package assignments, commercial terms, billing mappings, reconciliation evidence, and audit evidence remain governance truth.

Proposed future support-review tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `contractor_package_billing_support_reviews` | Store the future current support-review/readiness row for a package-billing provider mismatch, reconciliation blocker, webhook conflict, provider operation ambiguity, or manual resolution candidate. | `id`, `company_id`, `package_assignment_id`, `billing_mapping_id`, `reconciliation_event_id`, `provider_snapshot_id`, `provider_webhook_event_id`, `provider_webhook_correlation_id`, `provider_operation_id`, `provider_operation_attempt_id`, `billing_provider`, `provider_mode`, `provider_customer_ref`, `provider_product_ref`, `provider_price_ref`, `provider_subscription_ref`, `provider_subscription_item_ref`, `review_status`, `resolution_category`, `priority`, `blocking_issues`, `environment_warnings`, `assignment_impact_summary`, `entitlement_runtime_impact_caveat`, `resolution_evidence_snapshot`, `safe_operator_summary`, `corrective_action_summary`, `approval_required`, `approved_for_resolution_by`, `approved_for_resolution_at`, `approval_reason`, `approval_confirmation_text`, `escalated_to`, `escalated_at`, `resolved_by`, `resolved_at`, `archived_at`, `created_by`, `updated_by`, `created_at`, `updated_at`. Constrain review status to the future support-review statuses above and resolution category to the future resolution categories above. Evidence JSONB must be bounded, sanitized, server-generated or server-verified, and safe for platform-admin/support review. | Platform-admin/support server-only access. Enable and force RLS if exposed through `public`; revoke broad `anon`/`authenticated` grants unless intentionally designed. Index by `company_id`, package assignment, billing mapping, reconciliation event, webhook event/correlation, provider operation/attempt, `billing_provider`, `provider_mode`, provider references, `review_status`, `resolution_category`, `approval_required`, escalation fields, resolved/archive timestamps, and `created_at` for queue, detail, linkage, stale-review, and attention-needed reads. | No provider mutation, Stripe call, subscription create/update/cancel, package assignment write, entitlement/module/runtime change, contractor-facing behavior, reporting/export file generation, automation, AI resolution, webhook replay, reconciliation auto-fix, or destructive correction. |
| `contractor_package_billing_support_review_events` | Store future append-only support-review event history for evidence attachment, status changes, escalation, provider-confirmation notes, corrective-action proposal review, approval readiness, blocked resolution, resolution, rollback/recovery evidence, rejection, and archive history. | `id`, `support_review_id`, `company_id`, `event_type`, `from_review_status`, `to_review_status`, `resolution_category`, `event_reason`, `operator_confirmation_text`, `actor_user_id`, `provider_confirmation_ref`, `reconciliation_event_id`, `provider_webhook_event_id`, `provider_operation_id`, `corrective_action_proposal_id`, `resolution_evidence_snapshot`, `rollback_recovery_snapshot`, `safe_event_summary`, `occurred_at`, `created_at`. Event types should include future values such as `review_opened`, `evidence_attached`, `provider_correlation_reviewed`, `provider_confirmation_requested`, `provider_confirmation_received`, `corrective_action_proposed`, `approval_required`, `approved_for_resolution`, `resolution_blocked`, `resolution_recorded`, `rollback_recovery_evidence_attached`, `review_rejected`, and `review_archived`. | Same platform-admin/support, server-only, forced-RLS posture as support reviews. Index by `support_review_id`, `company_id`, event type, status transition, resolution category, linked reconciliation/webhook/operation/proposal ids, actor, and `occurred_at` for timelines, audit bundles, and queue summaries. | No execution of corrective action, no provider operation, no subscription mutation, no package assignment mutation, no entitlement/module/runtime effect, no reporting/export output, no automation/AI action, and no acceptance of unverified client-submitted evidence as authoritative. |

Optional future tables should stay deferred unless operational evidence justifies them:

- `contractor_package_billing_resolution_proposals`: only if corrective-action proposals need a distinct lifecycle, approval evidence, operation plan, idempotency plan, rollback/readback plan, and execution handoff separate from the support-review row.
- `contractor_package_billing_support_review_assignments`: only if support ownership, escalation teams, SLA clocks, or multi-operator queues need durable assignment history separate from review events.

Future support-review read model:

- A future helper such as `buildContractorPackageBillingSupportReviewReadModel(...)` or `getContractorPackageBillingManualResolutionReadiness(...)` should expose support-review queue, review status, blocking issues, reconciliation linkage, webhook/provider linkage, rollback/recovery readiness, approval readiness, environment warnings, safe operator summaries, and attention-needed rows.
- Attention-needed rows should identify pending reviews, awaiting evidence, awaiting provider confirmation, invalid environment mixes, duplicate provider subscriptions, orphaned provider subscriptions, stale provider mappings, missing provider customers/subscriptions, webhook replay issues, unsupported custom contracts, approval-required reviews, blocked resolutions, and resolved reviews that still need archive/history retention.
- Operator summaries should show provider references carefully, normalized mismatch category, review status, linked reconciliation/webhook/operation evidence, safe evidence summary, approval readiness, environment caveats, assignment impact caveats, and entitlement/runtime caveats without raw provider payloads, raw provider errors, provider secrets, webhook signing secrets, tokens, card data, bank data, stack traces, service-role keys, or unbounded metadata.
- The read model must never treat support-review status, approved-for-resolution status, corrective-action proposal status, provider confirmation, reconciliation linkage, webhook linkage, or operator notes as entitlement truth, module gate truth, package assignment activation truth, subscription mutation approval, contractor permission truth, or runtime enforcement.

Future support-review workflow:

1. Mismatch, stale mapping, duplicate/orphaned subscription, missing provider reference, webhook replay issue, invalid environment mix, unsupported custom contract, or reconciliation evidence is detected by future read models.
2. A support review is opened with safe server-verified evidence and current linkage to billing mapping, reconciliation, webhook, provider operation, package assignment, and company context where available.
3. Evidence is attached through append-only support-review events, including safe reconciliation summaries, webhook correlation, provider operation evidence, provider confirmation notes, rollback/recovery readiness, and environment warnings.
4. Provider correlation is reviewed without treating provider state as sole business truth and without exposing raw provider payloads or secrets.
5. A corrective-action proposal may be created as future-only planning/output; it must not execute provider or internal mutations.
6. Approval may be granted in the future only after explicit operator reason, confirmation, server-side recomputation, and approval evidence.
7. A separate future execution path may perform an approved corrective action with its own idempotency, provider-operation evidence, readback, rollback/recovery, and audit requirements.
8. Archival/history retention preserves rejected, blocked, resolved, manually reviewed, escalated, approved, and archived outcomes.

Future support-review schema/RLS/security gates:

- RLS must be enabled and forced for public support-review tables; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin/support access must be server-side only; contractor organization owner/admin roles, contractor memberships, and contractor navigation visibility are not support-review authorization.
- Service-role keys, provider secret keys/tokens, webhook signing secrets, raw provider credentials, raw card data, bank data, and sensitive payment method details must never be exposed to browser/client code or stored in exposed support-review tables.
- Future support-resolution RPCs, if later needed, must lock `search_path`, perform platform-admin/support authorization, recompute review readiness server-side, verify evidence server-side, require explicit approval before execution, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- No raw provider payload dumps or raw provider errors should be exposed directly. Store safe summaries, normalized categories/statuses, bounded support metadata, and carefully displayed provider references only.
- Client-submitted resolution evidence, provider confirmation, reconciliation evidence, webhook evidence, operation evidence, and rollback/readback evidence must not be accepted as authoritative without server verification.
- Approval is required before any future corrective-action execution. Support review, approval readiness, and approved-for-resolution state still do not execute Stripe/provider operations, subscription mutations, package assignment writes, entitlement/module/runtime changes, reporting/export, automation, or AI behavior by themselves.

Recommended first support-review implementation slice:

1. Add migrations for `contractor_package_billing_support_reviews` and `contractor_package_billing_support_review_events` only after package definition/version, assignment, assignment audit, billing mapping, billing mapping audit, reconciliation, provider-operation, and webhook evidence foundations exist.
2. Add RLS/grant posture for platform-admin/support server-only access and no client service-role exposure.
3. Add generated/shared types if the repo pattern requires it.
4. Add platform-admin/support read helpers and a pure support-review/manual-resolution readiness read-model builder.
5. Add focused pure read-model tests for support-review queue rows, statuses, resolution categories, blocking issues, reconciliation linkage, webhook/provider linkage, rollback/recovery readiness, approval readiness, environment warnings, safe summaries, attention-needed rows, append-only event interpretation, and no unintended billing/provider/assignment/entitlement/runtime mutation.
6. Add a read-only Super Admin support-review panel only.
7. Keep actual Stripe/provider corrective actions, subscription creation/update/cancel, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI support resolution behavior, starter-pack provisioning changes, and any package assignment writes deferred.

Billing / Provider Support Operations Runbook and Operator QA Readiness:

This is future-only support-operations runbook and operator-QA readiness planning for package/billing governance. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, background jobs, support queues, manual resolution actions, corrective execution, QA harnesses, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability, the static Future Package Definition Model planning panel, early-access `/setup/billing` payment-method setup, and the existing canonical invoice/payment Stripe webhook foundation; no support-operations runbook table, operator QA readiness read model, support-resolution RPC, provider corrective action, subscription mutation, entitlement/module enforcement, or package-governance support-operations workflow exists today.

Future support-operations concepts:

- `support operations runbook`: future platform-admin/support instructions for reviewing package-billing support reviews without executing provider or internal corrections.
- `evidence review checklist`: future structured checklist for verifying assignment state, provider mapping, reconciliation evidence, webhook evidence, duplicate/replay signals, environment isolation, expected-vs-observed provider state, rollback/recovery path, operator reason, and approval requirement.
- `provider/reconciliation evidence validation`: future server-verified review of expected-vs-observed provider state, signed webhook evidence, provider operation evidence, and reconciliation linkage before any proposal is trusted.
- `sandbox vs production checklist`: future isolation check that prevents sandbox/test-mode investigations, provider references, evidence, approvals, and archives from mixing with production support reviews.
- `escalation handoff`: future support, billing/provider, security, product, or operations handoff when evidence is incomplete, risky, environment-mixed, custom-contract-related, or blocked.
- `blocked-resolution handling`: future retained state for reviews where evidence, provider confirmation, approval, rollback path, or execution readiness is insufficient.
- `operator decision logging`: future append-only operator decisions, reasons, confirmations, escalation notes, approval handoff notes, and archive notes.
- `approval handoff`: future non-executing handoff package that explains proposal readiness, required approval, evidence status, rollback/recovery readiness, and execution separation.
- `rollback/recovery preparation`: future before/after/readback planning and recovery evidence summary before an approved corrective execution path can exist.
- `environment isolation`: future strict separation of sandbox/test-mode and production investigations, evidence, provider references, approvals, execution handoffs, and archives.
- `support QA readiness`: future QA expectations for runbook/checklist behavior before production support operations are exposed.
- `support review audit trail`: future append-only review and decision history over support reviews, evidence validation, escalation, blocked resolution, approval handoff, and archival outcomes.

Future operator review stages:

- `evidence_collected`
- `evidence_validated`
- `escalation_required`
- `escalation_resolved`
- `corrective_action_proposed`
- `approval_pending`
- `approved_for_execution`
- `execution_deferred`
- `archived`

Future support-operations constraints:

- Runbook review alone must not mutate provider state, package assignments, entitlements/modules/runtime, billing status, subscriptions, contractor permissions, contractor navigation, starter-pack provisioning, reporting/export behavior, automation, AI behavior, or product behavior.
- Support review alone must not trigger Stripe/provider operations, provider reads, provider writes, webhook replay, subscription creation/update/cancel, invoice creation, payment collection, reconciliation auto-fix, package assignment activation, entitlement enforcement, module gating, or runtime access changes.
- Corrective execution requires a separate future execution path with explicit approval, server-side recomputation, verified evidence, idempotency design, rollback/readback planning, and its own audit trail.
- Sandbox/test-mode investigations, provider references, webhook evidence, reconciliation rows, operation evidence, proposals, approvals, QA runs, and archives must remain isolated from production investigations.
- Operator decision evidence should remain append-only. Corrections, rejected outcomes, manual-review outcomes, escalation notes, provider confirmations, approval decisions, recovery notes, blocked states, and archive markers add evidence instead of erasing prior rows.
- Blocked resolutions must be retained with safe reason, missing-evidence summary, escalation state, and future unblock criteria.
- No destructive auto-fix may run without explicit approved corrective execution, preserved before/after evidence, readback evidence, and rollback/recovery plan.
- No AI/automation-generated corrective execution is allowed. Any future automation or AI assistance must remain outside corrective execution unless separately designed, approved, and human-gated.

Future evidence-review checklist expectations:

- Package assignment state verified.
- Provider mapping state verified.
- Reconciliation evidence reviewed.
- Webhook evidence reviewed.
- Duplicate/replay checks reviewed.
- Environment isolation verified.
- Expected vs observed provider state compared.
- Rollback/recovery path documented.
- Operator reason captured.
- Approval requirement identified.

Future escalation workflow:

1. A support review is opened from future mismatch, reconciliation, webhook, provider operation, or manual-resolution evidence.
2. Evidence is collected and validated through server-verified summaries and append-only review events.
3. Escalation is triggered when evidence is incomplete, environment-mixed, custom-contract-related, provider-state ambiguous, security-sensitive, blocked, or risky.
4. Escalation evidence is attached with safe summaries, actor/reason fields, provider/reconciliation references, and no raw provider payloads or secrets.
5. A corrective-action proposal may be reviewed as non-executing planning output only.
6. Approval handoff is prepared with checklist status, rollback/recovery readiness, environment warnings, and unresolved blockers.
7. Any future execution path stays separate and unavailable until explicitly approved in a later implementation.
8. Archival/history retention preserves rejected, blocked, escalated, approval-pending, execution-deferred, resolved, and archived outcomes.

Future operator QA readiness:

- Sandbox-only QA must pass before production support operations are exposed.
- Replay/deduplication QA should prove duplicate webhooks or repeated provider signals do not create duplicate evidence, duplicate proposals, duplicate package assignment changes, or duplicate provider actions.
- Reconciliation mismatch QA should prove expected-vs-observed mismatch categories surface attention-needed rows without mutation.
- Rollback/recovery QA should prove before/after/readback and recovery evidence requirements are visible before approval handoff.
- Invalid signature QA should prove invalid webhook evidence is retained only as safe evidence and never trusted for provider linkage.
- Provider correlation QA should prove provider customer/product/price/subscription references are linked carefully without treating provider state as sole business truth.
- Safe payload-summary QA should prove operator summaries are bounded, sanitized, and useful.
- No-secret/no-raw-provider-payload QA should prove provider secrets, webhook signing secrets, service-role keys, raw provider payload dumps, raw provider errors, stack traces, raw card data, bank data, and unbounded metadata are not exposed.
- No unintended entitlement/runtime mutation QA should prove support operations do not alter entitlements, modules, navigation, permissions, runtime gates, or contractor-facing behavior.
- No unintended package-assignment mutation QA should prove support operations do not create, update, activate, archive, or delete package assignment rows.

Future support-operations schema/RLS/security expectations:

- Support-review evidence tables should remain server-only with platform-admin/support-only access.
- If support-review or support-operations evidence tables live in `public`, RLS must be enabled and forced.
- Broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Future RPCs must lock `search_path`, perform platform-admin/support authorization, recompute readiness server-side, verify evidence server-side, require approval before execution, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- No provider secrets, provider tokens, webhook signing secrets, raw provider credentials, raw provider payload dumps, raw provider errors, raw card data, bank data, service-role keys, stack traces, or unbounded operator metadata blobs should be stored in support evidence exposed to operators.
- No client-submitted evidence, operator metadata, provider confirmation, reconciliation result, webhook linkage, or rollback/readback claim should be authoritative without server verification.

Future support-operations read model:

- A future helper such as `buildBillingSupportOperationsRunbookReadModel(...)` or `getBillingSupportOperatorQAReadiness(...)` should expose support-review queue, checklist readiness, escalation state, rollback/recovery readiness, environment warnings, approval handoff readiness, safe operator summaries, and attention-needed rows.
- Checklist readiness should summarize missing assignment verification, missing provider mapping verification, missing reconciliation evidence, missing webhook evidence, duplicate/replay warnings, environment-mix warnings, missing rollback/recovery plan, missing operator reason, and missing approval requirement.
- Escalation state should distinguish escalation required, escalation pending, escalation resolved, blocked resolution, approval pending, approved-for-execution handoff, execution deferred, and archived outcomes without executing corrections.
- Safe operator summaries should display normalized categories, provider reference labels, current review status, evidence completeness, blocker summary, environment caveats, rollback/recovery readiness, approval handoff readiness, and no-runtime-impact caveats.
- The read model must never treat checklist readiness, escalation state, approval handoff readiness, approved-for-execution stage, or operator decision notes as provider mutation authority, subscription mutation authority, package assignment activation truth, entitlement/module/runtime truth, contractor permission truth, reporting/export authority, automation authority, or AI execution authority.

Recommended first support-operations implementation slice:

1. Add a pure runbook/readiness helper over existing/future support-review evidence after support-review tables and read helpers exist.
2. Add support-review QA/readiness tests for checklist completeness, escalation states, environment isolation, safe summaries, replay/deduplication warnings, invalid-signature handling, rollback/recovery readiness, approval handoff readiness, and no unintended billing/provider/assignment/entitlement/runtime mutation.
3. Add a read-only Super Admin support-operations panel only after the read model is stable.
4. Do not add corrective-action execution controls, Stripe/provider calls, subscription creation/update/cancel, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI support execution behavior, starter-pack provisioning changes, package assignment writes, or contractor permission changes in that first slice.

Billing / Provider Support Operations Release Gate and Production Readiness Checklist:

This is future-only release-gate and production-readiness planning for package/billing governance. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, background jobs, production approval actions, corrective execution, support queue execution, QA automation, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability, the static Future Package Definition Model planning panel, early-access `/setup/billing` payment-method setup, and the existing canonical invoice/payment Stripe webhook foundation; no release-gate table, release-gate event table, release exception table, checklist item table, production readiness read model, support-resolution RPC, provider corrective action, subscription mutation, entitlement/module enforcement, package assignment release workflow, or package-governance production release workflow exists today.

Future release-gate concepts:

- `support-review evidence release gate`: future check that support-review evidence is complete, verified, safely summarized, and linked before any production-readiness review can proceed.
- `runbook checklist completeness`: future check that the support-operations runbook evidence checklist has all required items completed or explicitly excepted.
- `operator QA signoff`: future human operator signoff that QA scenarios and evidence are ready for review; it is not execution approval by itself.
- `sandbox-to-production promotion checklist`: future checklist that proves sandbox/test-mode evidence, provider references, support reviews, runbook decisions, and QA results are isolated before production review.
- `escalation/approval separation`: future boundary that keeps escalation evidence, approval handoff, production approval, and corrective execution as distinct steps.
- `rollback/recovery readiness`: future documented rollback, readback, recovery, and post-correction verification plan before an execution path can exist.
- `security/RLS verification`: future verification that any supporting tables, policies, grants, server-only helpers, and RPCs meet the platform-admin/support access model.
- `provider secret/redaction verification`: future check that provider IDs are displayed safely while secrets, tokens, raw payloads, raw errors, card data, bank data, and service-role keys stay hidden.
- `no-secret/no-raw-payload validation`: future QA gate proving operator summaries are sanitized, bounded, and safe.
- `no-mutation/no-auto-fix verification`: future proof that release-gate review does not mutate provider state, package assignments, entitlements, modules, runtime behavior, billing, subscriptions, reporting/export behavior, automation, or AI behavior.
- `production readiness signoff`: future non-executing signoff that the support-review/runbook/release package is ready for production consideration.
- `release blocker`: future normalized blocker that prevents sandbox verification, production review, production approval, or execution handoff until resolved or explicitly excepted.
- `release exception`: future explicit, reasoned, audited exception for a blocker; it must not execute or imply execution authority.
- `post-release monitoring requirement`: future requirement that any later production execution path includes monitoring, readback, incident response, and support evidence retention.

Future release-gate statuses:

- `not_started`
- `checklist_incomplete`
- `qa_in_progress`
- `blocked`
- `ready_for_sandbox`
- `sandbox_verified`
- `ready_for_production_review`
- `production_approved`
- `production_deferred`
- `archived`

Future release blockers:

- `missing_support_review_evidence`
- `missing_runbook_checklist`
- `missing_operator_signoff`
- `missing_sandbox_validation`
- `missing_rollback_plan`
- `missing_security_verification`
- `missing_rerun_idempotency_proof`
- `raw_provider_payload_exposure`
- `secret_exposure_risk`
- `unresolved_reconciliation_mismatch`
- `unresolved_webhook_replay_risk`
- `entitlement_runtime_side_effect_risk`
- `package_assignment_side_effect_risk`
- `billing_provider_mutation_risk`

Future production readiness checklist:

- Support-review evidence complete.
- Runbook checklist complete.
- Operator QA signoff captured.
- Sandbox scenario tested.
- Sandbox/production separation verified.
- Rollback/recovery plan documented.
- Provider evidence sanitized.
- Provider IDs displayed safely.
- No secrets/raw provider payloads exposed.
- RLS/forced RLS/grant posture verified.
- Security-definer execute grants verified if RPCs exist.
- Idempotency and replay handling verified.
- No unintended package assignment mutation.
- No unintended billing/provider mutation.
- No unintended entitlement/module/runtime mutation.
- Approval handoff points to a separate future execution path.

Future release-gate constraints:

- Release gate alone must not execute corrective actions.
- Release gate alone must not mutate provider state, package assignments, entitlements/modules/runtime, billing status, subscriptions, contractor permissions, contractor navigation, starter-pack provisioning, reporting/export behavior, automation, AI behavior, or product behavior.
- Release gate alone must not call Stripe/provider APIs, replay webhooks, run reconciliation auto-fix, create/update/cancel subscriptions, create invoices, collect payments, activate package assignments, enforce entitlements, gate modules, or change runtime access.
- Production approval must not imply execution. It only confirms release readiness for a separate future execution path.
- Release exceptions must be explicit, reasoned, scoped, audited, and retained in a future implementation; they must not silently bypass evidence, QA, rollback, or security gates.
- No AI/automation-generated production approval is allowed.
- No background job execution may originate from the release gate.

Future schema/read-model concepts, not created in this pass:

- `contractor_package_billing_release_gates`: possible future current-state/readiness row for support-review/manual-resolution/provider package-governance release readiness. Key columns should likely include `id`, optional `company_id`, `support_review_id`, `billing_mapping_id`, `reconciliation_event_id`, `provider_webhook_event_id`, `provider_operation_id`, `provider_mode`, `release_status`, `release_blockers`, `checklist_state`, `sandbox_verification_state`, `production_review_state`, `rollback_recovery_state`, `security_verification_state`, `safe_operator_summary`, `approval_handoff_summary`, `production_approved_by`, `production_approved_at`, `production_deferred_by`, `production_deferred_at`, `production_deferred_reason`, `exception_requested_by`, `exception_requested_at`, `exception_reason`, `created_by`, `updated_by`, `created_at`, and `updated_at`.
- `contractor_package_billing_release_gate_events`: possible future append-only event table for checklist updates, QA signoffs, blockers added or cleared, security verification, sandbox verification, production approval, production deferral, release exception requests, release exception decisions, archive markers, and safe evidence summaries. Key columns should likely include `id`, `release_gate_id`, `event_type`, `from_status`, `to_status`, `blocker_code`, `checklist_item_key`, `actor_user_id`, `reason`, `confirmation_text`, `safe_event_summary`, `evidence_snapshot`, `occurred_at`, and `created_at`.
- Optional future `contractor_package_billing_release_exceptions` should exist only if release exceptions need a distinct approval/audit lifecycle beyond release-gate events.
- Optional future `contractor_package_billing_release_checklist_items` should exist only if checklist items need durable per-item ownership, required/optional status, status history, or assignment beyond a JSONB readiness snapshot.

Future first-slice table expectations:

- Purpose: release-gate rows would summarize readiness and blockers; release-gate events would preserve append-only history.
- Status constraints: `release_status` should be constrained to the future release-gate status list above.
- Blocker constraints: blocker values should be constrained to normalized blocker codes above, whether stored as enum rows, text checks, or validated JSONB arrays.
- Provider reference fields: provider IDs should be references/labels only, never secrets, tokens, raw payloads, raw errors, card data, or bank data.
- Reconciliation/webhook linkage fields: rows should link to future support-review, mapping, reconciliation, webhook, and provider-operation evidence without treating provider state as sole business truth.
- Readiness evidence JSONB: JSONB snapshots should be bounded, sanitized, schema-shaped, and safe to render as operator summaries.
- Operator reason/confirmation fields: production approval, deferral, exception, blocker override, and archive events should carry actor, reason, confirmation text when needed, and timestamp fields.
- Indexing needs: expected indexes include release status, company/support-review references, provider mode, blocker code, production approval/deferral timestamps, event release-gate id, event type, and event occurred time.
- RLS posture: if these future tables live in `public`, enable and force RLS.
- Broad grant posture: revoke broad `anon`/`authenticated` grants unless intentionally exposed through safe policies.
- Server-only boundary: platform-admin/support access must be server-side only; contractor organization roles, contractor memberships, and contractor navigation visibility are not release-gate authorization.
- Expected read-model usage: future helpers should produce safe release-readiness summaries, blocker lists, checklist completion, sandbox/production separation, security verification, rollback/readiness, approval handoff readiness, and attention-needed rows.
- Non-goals: these tables must not execute corrective actions, call Stripe/provider APIs, create/update/cancel subscriptions, mutate package assignments, enforce entitlements, gate modules, change contractor permissions, trigger reporting/export behavior, run automation, run AI behavior, start background jobs, or change runtime behavior.

Future release-gate read model:

- A future helper such as `buildBillingProviderReleaseGateReadModel(...)` or `getBillingProviderProductionReadiness(...)` should expose readiness status, blocker list, checklist completion, sandbox/production separation state, security verification state, rollback/recovery readiness, approval handoff readiness, safe operator summaries, and attention-needed rows.
- Attention-needed rows should identify incomplete support-review evidence, incomplete runbook checklist, missing operator signoff, missing sandbox validation, missing rollback plan, missing security verification, missing idempotency proof, raw payload/secret exposure risk, unresolved reconciliation mismatch, unresolved webhook replay risk, entitlement/runtime side-effect risk, package assignment side-effect risk, and billing/provider mutation risk.
- The read model must never treat production approval, release exception, checklist readiness, sandbox verification, or operator QA signoff as provider mutation authority, subscription mutation authority, package assignment activation truth, entitlement/module/runtime truth, contractor permission truth, reporting/export authority, automation authority, AI execution authority, or background job authority.

Future QA/security gates:

- Docs/readiness tests should prove the planning/readiness text does not overstate implementation.
- Schema/RLS tests should be added when release-gate tables exist.
- Platform-admin/support authorization tests should prove contractor organization roles cannot access release-gate evidence.
- No client service-role exposure tests should verify browser bundles and client routes do not expose privileged keys.
- No raw provider payload tests and no secret exposure tests should verify redaction and safe summaries.
- Idempotency/replay tests and webhook signature tests should prove duplicate/invalid provider evidence cannot create duplicate trust or mutation.
- Sandbox-to-production separation tests should prove test-mode references, evidence, approvals, and archives cannot mix with production reviews.
- No unintended billing mutation tests, no unintended package assignment mutation tests, and no unintended entitlement/module/runtime mutation tests should prove release-gate review is read-only.
- Browser QA should verify the future panel is read-only, bounded, safe, and clear about no corrective execution controls.
- A production-readiness regression checklist should be required before any later execution-capable release.

Recommended first release-gate implementation slice:

1. Add a pure release-readiness helper over support-review/runbook evidence only after support-review and runbook evidence foundations exist.
2. Add release-gate checklist/readiness tests for statuses, blockers, checklist completion, sandbox/production separation, security verification, rollback/recovery readiness, approval handoff readiness, safe summaries, and no unintended billing/provider/assignment/entitlement/runtime mutation.
3. Add a read-only Super Admin release-gate panel only after the read model is stable.
4. Do not add corrective execution controls, Stripe/provider mutation controls, package-assignment mutation controls, production approval actions, release-gate tables, release exception tables, release checklist item tables, subscription creation/update/cancel, reconciliation auto-fix, entitlement/module enforcement, runtime gates, contractor-facing billing/package visibility, reporting/export actions, automation/AI support execution behavior, background jobs, starter-pack provisioning changes, package assignment writes, or contractor permission changes in that first slice.

Planned focus:

- growth and marketing engine through contractor-owned websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign/source attribution, and website-to-revenue continuity
- AI-assisted site/content generation, generated marketing copy, and public intake summaries where accepted outputs remain tied to tenant-owned public surfaces and canonical workflow records
- generated websites and public forms feeding canonical opportunities/leads instead of a separate marketing database
- review/reputation, testimonials, before/after galleries, and project-proof loops tied back to canonical customer/project/job/closeout evidence where appropriate
- FloorConnector-facing AI for public marketing Q&A, sales/demo support, onboarding/setup assistance, support triage, first-project/first-estimate guidance, and migration/import help
- AI Capture and AI-assisted Takeoff & Scope Intelligence suggestions on top of project-scoped plans, photos, site data, measurements, System Templates, catalog mapping, and human-reviewed estimate generation
- contractor-facing AI copilot, communication drafting/summaries, scheduling suggestions, AI receptionist/voice, and operational intelligence on top of canonical records
- contractor network / networked work expansion for trusted partner contractors, specialty subcontractors, vendors, overflow work sharing, and regional coverage
- private referral or overflow work sharing where it extends the same canonical project/job/payment chain
- controlled marketplace or vetted network behavior only after scoped collaboration, permissions, compliance signals, and tenant isolation are designed
- package/billing governance expansion beyond the current read-only foundation, including real package definitions, billing management, plan enforcement, entitlement gating, module gating, subscription operations, and Stripe-backed billing only after explicit design, security, QA, and release guardrails
- platform operations expansion beyond the current read-only foundation, including support operations, alerting, runbook/incident workflows, remediation design, retry policies, escalation queues, and system-health automation only after explicit design, security, QA, and release guardrails
- broader ecosystem expansion

Open marketplace behavior is a later-phase platform direction, not a current implementation target.
AI-assisted takeoff is also a later platform direction, not a current implementation target.
AI Capture may eventually suggest measurements, areas, systems, cost-item mappings, and estimate drafts, but customer-facing estimate content should remain reviewable, manually approved, and auditable.
Contractor website generation, SEO infrastructure, landing-page generation, marketing attribution, public AI intake, and AI-generated website/content workflows are also later platform direction unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says a specific slice is implemented.
The implemented Package / Billing Plan Governance surface now includes package-definition persistence, a read-only catalog, read-only one-definition detail inspection, package-definition audit evidence/timeline inspection, lifecycle readiness inspection, contractor package assignment persistence/read-only inspection, provider mapping readiness/detail inspection, billing/provider support-review evidence readiness/detail inspection, and the read-only package-definition planning panel, but it is not a package mutation system, package assignment activation system, billing-management system, subscription-operations system, Stripe-backed billing system, provider-corrective-action system, entitlement-enforcement system, module-gating system, pricing-enforcement system, contractor-permission system, reporting/export system, automation/AI system, starter-pack provisioning system, or runtime mutation system.
The implemented Operations/System Health surface is a read-only foundation, not an automation, remediation, alerting, incident-management, entitlement, provisioning, or runtime execution system.
