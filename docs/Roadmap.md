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
- The Packages surface now includes a static, read-only Future Package Definition Model planning panel. It defines future package-definition dimensions before real package tables, package-definition persistence, billing workflows, entitlements, module gates, package assignment records, or Stripe-backed subscription behavior exist.

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

Future contractor package assignment governance:

- Future contractor package assignment should be the audited link between a company/contractor and an approved/published package definition version. It is not the package definition itself, not a billing subscription, not entitlement enforcement, not module gating, not a contractor group, and not starter-pack provisioning.
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

Future package billing / provider mapping governance:

- This is future-only planning. No package billing/provider mapping write model, provider sync, Stripe subscription operation, billing mutation, package assignment write, entitlement enforcement, module gating, contractor permission change, or runtime behavior exists today.
- Future billing/provider mapping should connect approved package definitions, package versions, contractor package assignments, billing plans, billing prices, provider products, provider prices, provider customers, subscriptions, subscription items, billing status, trial/early-access status, custom/grandfathered commercial contracts, and payment-method/setup readiness without making provider artifacts the product source of truth.
- Package definitions should remain product packaging. Contractor package assignments should remain platform governance. Billing provider mapping should translate approved commercial terms to provider artifacts. Subscription state should reflect commercial/provider state. Entitlement/module enforcement should remain a separate future runtime layer. Contractor groups may suggest targeting but must not mutate billing. Starter packs/onboarding remain separate from billing.
- Future provider mapping lifecycle states should be `draft`, `provider_pending`, `mapped`, `verified`, `active`, `deprecated`, and `archived`.
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

This matrix is sequencing guidance only. It does not add schema, migrations, RLS/grants, server actions, RPCs, UI controls, package assignment writes, billing/provider calls, Stripe subscription operations, entitlement enforcement, module gating, reporting/export behavior, contractor permission changes, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability and the static Future Package Definition Model planning panel.

| Area | Current status and risk | Prerequisites and blockers | Schema/RLS, server, audit considerations | QA/security gates, non-goals, first slice |
|---|---|---|---|---|
| Package definition persistence | Planned future; ready for schema design; medium risk. | Requires final package dimensions, lifecycle states, versioning rules, and product/business naming. Blocked by no package definition persistence today. | Future tables need tenant-safe platform scope, forced RLS where exposed, revoked broad grants, immutable published-version snapshots, and package-definition audit evidence. Server actions must remain platform-admin-only. | Gates: schema/RLS, grant, platform-admin auth, no client service-role exposure, snapshot tests. Non-goals: assignment, billing, entitlements, module gates. First slice: schema/read-model design only. |
| Package definition lifecycle / approval | Planned future; blocked until package definitions and audit evidence exist; high risk once mutation controls appear. | Requires persisted package definitions, version snapshots, approval reasons, confirmation text, and review states. Blocked by no package definition table or package governance audit table. | Future actions/RPCs need explicit lifecycle transition contracts, no destructive edits to published versions, before/after snapshots, actor/timestamp/reason, and safe operator errors. | Gates: platform-admin authorization, lifecycle transition tests, audit snapshot tests, browser QA, no unintended contractor changes. First slice: approval read model before controls. |
| Contractor package assignment | Planned future; not ready for runtime; medium risk for schema/read model and high risk for activation writes. | Requires approved/published package versions, assignment lifecycle, assignment history, and separation from billing and entitlements. Blocked by no package assignment table. | Future schema should preserve assignment history, effective dates, supersession/cancel paths, package version snapshot, and company references under RLS. Server actions must not mutate billing or entitlements. | Gates: schema/RLS, platform-admin auth, no unintended billing, no entitlement/module mutation, no contractor permission changes. First slice: assignment schema/read model only. |
| Billing / provider mapping | Planned future; blocked until package definitions and assignment context exist; critical risk for provider mutation. | Requires package versions, commercial billing terms, provider reference model, sandbox policy, webhook/reconciliation design, and audit evidence. Blocked by no billing provider mapping table and no Stripe subscription mutation workflow. | Provider IDs are references, not secrets or product truth. Future provider calls must be server-side only with no client service-role exposure, safe error display, idempotency keys, and provider snapshot audit metadata. | Gates: Stripe sandbox tests before mutation, provider idempotency tests, webhook signature tests, no billing mutation tests, safe metadata tests. First slice: provider mapping read model, no Stripe calls. |
| Billing reconciliation | Planned future; blocked; critical risk if it trusts provider state or auto-corrects records. | Requires billing/provider mapping records, expected provider state, observed provider state, webhook handling, and support review states. Blocked by no reconciliation workflow. | Future reconciliation should preserve expected/observed snapshots, mismatch classifications, provider reference snapshots, manual review decisions, and no automatic destructive correction without approval. | Gates: reconciliation mismatch tests, webhook signature verification, provider reference sanitization, no unintended subscription changes. First slice: reconciliation design/read model only. |
| Entitlement / module boundary model | Planned future; not ready for runtime; medium risk for read model and critical risk for enforcement. | Requires package definition entitlement mapping, assignment effective entitlements, module-to-entitlement mapping, override policy, and audit evidence. Blocked by no entitlement runtime model and no module gate mapping. | Future schema must separate entitlements from package labels, billing status, contractor groups, starter packs, and user preferences. Overrides need platform-admin-only audit, reason, effective/expiration dates, and rollback/revoke strategy. | Gates: entitlement no-op tests, module visibility regression tests, package assignment separation tests, billing separation tests, starter-pack/group separation tests. First slice: entitlement/module mapping read model only. |
| Runtime enforcement | Planned future; not ready for runtime; critical risk. | Requires effective assignments, entitlement/module mapping, override governance, server-side capability checks, and no-op regression proof. Blocked by no entitlement model, no assignment model, and no module gate mapping. | Enforcement must live at server boundaries that own protected behavior; navigation visibility is not sufficient. Runtime decisions need auditable source snapshots and safe failure modes. | Gates: no unintended entitlement/module mutation, no contractor permission changes, server-boundary tests, browser QA, rollback/revoke tests. First slice: no-op enforcement harness only after read models exist. |
| Package governance audit/evidence | Planned future; ready for schema design after package definition shape is stable; medium risk. | Requires event families, snapshot contracts, operator reasons, confirmation phrases, source systems, provider reference snapshot rules, and retention strategy. Blocked by no package governance audit table. | Future audit tables should be append-only or effectively immutable, RLS-protected, server-side only, free of raw secrets/provider errors, and preserve before/after evidence through deprecation/supersession. | Gates: audit append-only tests, before/after snapshot tests, safe metadata tests, forced RLS/grant checks. First slice: audit schema/read model before any governance mutations. |
| Package governance reporting/export | Planned future; blocked until audit/evidence model exists; medium risk for read models and high risk for file export. | Requires audit/evidence records, reporting read models, redaction policy, export reason/audit event, retention policy, and size limits. Blocked by no audit table and no report/export route/action/file generation. | Future export must be platform-admin-only, server-side only, redacted, bounded, audited, and use expiring links if storage is introduced. Contractor-facing exports are separate scope. | Gates: report read-model tests, export redaction tests, export audit event tests, file/link expiration tests, large export guard tests. First slice: reporting read model after audit exists. |
| Contractor-facing package visibility | Planned future; blocked; high risk for customer/operator confusion. | Requires package definitions, active assignment truth, entitlement/module separation, support copy, and contractor-facing disclosure policy. Blocked by no package assignment model and no contractor-facing package visibility design. | Future visibility must read explicit effective assignments and safe commercial labels only. It must not expose provider secrets, raw provider errors, internal pricing notes, or support-only audit payloads. | Gates: contractor-facing browser QA, permission checks, no package mutation/export behavior, no entitlement side effects. First slice: read-only visibility design, no route until assignment model exists. |
| Support/operator review bundle | Planned future; blocked until audit/reporting foundations exist; medium risk. | Requires package, assignment, billing/provider, entitlement/module, override, reconciliation, and audit snapshots. Blocked by no audit/evidence table and no reporting/export behavior. | Bundles should be internal, platform-admin-only, redacted, reasoned, and auditable if generated later. They should explain state without mutating package, billing, entitlement, module, or runtime records. | Gates: support bundle content tests, redaction tests, no export/file generation unless explicitly scoped. First slice: support bundle read-model spec after audit exists. |
| Migration from early-access/read-only state | Planned future; blocked until definition, assignment, audit, and billing separation exist; high risk. | Requires current tenant/package observability, package definitions, assignment migration plan, grandfathered/custom contract handling, billing/provider mapping, and activation policy. Blocked by no real package definition/assignment/billing mapping models. | Future migrations need dry-run/read-model review, before/after snapshots, explicit approval, rollback/supersession strategy, and no silent billing, entitlement, module, or permission changes. | Gates: migration/versioning tests, audit snapshot tests, no unintended billing or entitlement mutation, Stripe sandbox tests before provider behavior. First slice: migration readiness read model only. |

Recommended implementation order:

1. Package definition schema/read model first, because every later package governance area needs a stable product package/version record.
2. Package governance audit/evidence schema second, because lifecycle, assignment, provider mapping, entitlement, override, reconciliation, and export actions all need durable evidence before mutation.
3. Package definition lifecycle/approval controls third, limited to platform-admin-only, audited transitions with immutable/snapshotted published versions.
4. Contractor package assignment schema/read model fourth, with effective dates and history but no billing, entitlement, module, or runtime side effects.
5. Assignment audit/approval fifth, still separated from provider billing and runtime enforcement.
6. Billing/provider mapping read model before any Stripe mutation, with provider references treated as careful references rather than secrets or product truth.
7. Billing reconciliation design/read model before trusting provider state or handling subscription mismatch corrections.
8. Entitlement/module mapping read model before runtime enforcement, with explicit separation from billing state, contractor groups, starter packs, and user preferences.
9. Runtime enforcement last, only after assignment, entitlement, override, audit, QA, and rollback/revoke paths exist.
10. Reporting/export only after the audit/evidence model exists, with redaction, export audit, retention, and file/link-expiration design completed first.

Risk classification:

- Low risk: docs-only planning, static planning panels, and read-only read models over existing records.
- Medium risk: schema, RLS, audit tables, append-only evidence, and server-side read models with no mutation behavior.
- High risk: package, assignment, lifecycle, override, reporting/export, or support-bundle mutation actions.
- Critical risk: billing/provider mutation, Stripe subscription create/update/cancel, entitlement/runtime enforcement, module gating, pricing/package enforcement, contractor permission changes, and any automated correction workflow.

Explicit blockers before implementation:

- no package definition persistence exists yet
- no package assignment table exists yet
- no entitlement runtime model exists yet
- no module gate mapping exists yet
- no billing provider mapping table exists yet
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

Package Definition Persistence Schema / Read-Model Design:

This is future-only schema/read-model planning. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, billing/provider calls, Stripe subscription operations, package assignment writes, entitlement enforcement, module gating, reporting/export behavior, contractor permission changes, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability and the static Future Package Definition Model planning panel.

Future package definition persistence concepts:

- `package definition`: the platform-owned product/business package family, such as a sellable FloorConnector plan concept. It is not a contractor assignment, billing subscription, entitlement grant, module gate, or runtime permission.
- `package version`: an immutable or effectively snapshotted version of a package definition used for future approval, assignment, billing/provider mapping, entitlement/module mapping, reporting, and migration review.
- `package key`: a stable machine-readable identifier for the definition; it should be unique, lowercase/slug-like, and independent from display copy.
- display name and commercial summary: operator-facing labels and concise packaging language; these must not store provider secrets, raw pricing payloads, raw Stripe objects, or customer-specific custom contract terms.
- status and lifecycle state: future package lifecycle values should remain separate from contractor tenant lifecycle and subscription status. Draft can be editable; published versions should be immutable or snapshotted; deprecation should replace destructive edits; archive should preserve history.
- intended audience/segment, module visibility intent, usage limit intent, entitlement intent, billing/provider mapping intent, starter-pack default intent, and contractor group targeting intent: planning metadata for future review and read models, not enforcement.
- published snapshot: version-time JSON or structured snapshot preserving product dimensions, commercial summary, and intended boundaries at approval/publication time.
- archived/deprecated state: a non-destructive package state used for historical review, migration, grandfathering, and support.

Proposed future first-slice tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `platform_package_definitions` | Store the stable platform package family/key and current high-level lifecycle. | `id`, `package_key`, `display_name`, `status`, `lifecycle_state`, `intended_audience`, `commercial_summary`, `created_at`, `updated_at`, `created_by`, `updated_by`. Unique `package_key`; constrained status/lifecycle values such as `draft`, `internal_review`, `approved`, `published`, `deprecated`, `archived`. | Platform-scoped table, not tenant-owned. Enable and force RLS if exposed through `public`; revoke broad anon/authenticated grants unless intentionally designed. Access through platform-admin-only server helpers. Read model lists definitions and latest/version counts. | No contractor assignment, billing subscription, Stripe mapping write, entitlement enforcement, module gate, package pricing enforcement, or contractor-facing visibility. |
| `platform_package_definition_versions` | Store versioned package-definition snapshots for future approval/publication and immutable review. | `id`, `package_definition_id`, `version_number`, `status`, `lifecycle_state`, `display_name_snapshot`, `commercial_summary_snapshot`, `dimension_snapshot`, `module_visibility_intent_snapshot`, `usage_limit_intent_snapshot`, `entitlement_intent_snapshot`, `billing_provider_mapping_intent_snapshot`, `starter_pack_default_intent_snapshot`, `contractor_group_targeting_intent_snapshot`, `published_at`, `published_by`, `deprecated_at`, `archived_at`, `created_at`, `updated_at`, `created_by`, `updated_by`. Unique `(package_definition_id, version_number)`. Published versions should be immutable or effectively snapshotted. | Foreign key to `platform_package_definitions`. Index by definition, status/lifecycle, publication timestamps, and version number. RLS/grant posture matches the definitions table. Read model lists versions, publication state, caveats, dependency status, and audit evidence availability. | No lifecycle approval controls in the first schema slice, no assignment write, no billing/provider mutation, no Stripe call, no entitlement/module runtime effect, no reporting/export file generation. |

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

Future read model:

- A future helper such as `buildPlatformPackageDefinitionCatalog(...)` or `getPlatformPackageDefinitionReadModel(...)` should expose definition list, version list, lifecycle state, publication status, intended package dimensions, dependency/caveat status, audit evidence availability, and read-only operator summaries.
- The read model should be platform-admin-only, server-side, safe for browser rendering after serialization, and free of mutation/action descriptors unless a later approved slice explicitly adds controls.
- Dependency/caveat status should call out missing audit table, missing assignment model, missing billing/provider mapping, missing entitlement/module model, missing runtime enforcement, and missing reporting/export support without treating those gaps as current product failures.

Recommended first implementation slice:

1. Add a migration for `platform_package_definitions` and `platform_package_definition_versions` only.
2. Add generated/shared types if the repo pattern requires it.
3. Add platform-admin-only server read helpers and a pure read-model builder.
4. Add a read-only Super Admin catalog view or panel that lists package definitions and versions.
5. Add focused pure tests, schema/RLS/grant checks, platform-admin authorization tests, and browser QA.
6. Keep publish/approval controls, contractor assignments, billing/provider writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, contractor-facing package visibility, reporting/export actions, automation, AI behavior, and starter-pack provisioning changes deferred.

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

Package Definition Lifecycle Controls / Approval Readiness Design:

This is future-only lifecycle/readiness planning. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package definition mutation actions, package version mutation actions, approval/publish/deprecate/archive controls, package assignment writes, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability and the static Future Package Definition Model planning panel.

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

Future lifecycle/readiness read model:

- A future helper such as `buildPlatformPackageLifecycleReadiness(...)` or `getPlatformPackageApprovalReadModel(...)` should expose lifecycle state, transition eligibility, blocking issues, warning issues, required approval inputs, missing evidence, dependency caveats, and safe operator summaries.
- The read model should include `actionAvailable` only when the corresponding implementation exists. Planning-only rows should use explicit copy such as "future action" or "not implemented" rather than implying clickable controls.
- The read model should distinguish blocking issues from warnings: missing required package identity or approval evidence blocks publication; intent-only billing, entitlement, starter-pack, or contractor group caveats warn operators unless a future model is explicitly required for the transition.
- The read model should never treat billing/provider status, Stripe subscription state, entitlement mapping, module visibility, contractor groups, or starter-pack defaults as proof that runtime enforcement exists.

Future UI/control readiness:

- The first lifecycle implementation should be a read-only lifecycle readiness panel or catalog column before any mutation controls.
- Mutation controls should come later one transition at a time, with no bulk publish, no auto approval, no apply-all lifecycle action, and no hidden runtime side effects.
- Future copy must say lifecycle controls affect only package definition/version records and package governance audit evidence. They must not create package assignments, mutate billing/provider state, call Stripe, change subscriptions, enforce entitlements, gate modules, change contractor permissions, run reporting/export, provision starter packs, trigger automation, run AI behavior, or change runtime behavior.

Future schema/RLS/security gates:

- RLS must be enabled and forced for package definition/version and lifecycle/audit tables exposed through `public`; broad `anon`/`authenticated` grants must be revoked unless intentionally exposed through safe policies.
- Platform-admin access must be server-side only, and service-role keys must never be exposed to browser/client code.
- Lifecycle transition RPCs, if later needed, must lock `search_path`, perform authorization and readiness recomputation server-side, and revoke execute from `anon`, `authenticated`, and `public` unless explicitly designed.
- Future errors should be safe for operators and avoid raw SQL/provider errors, stack traces, secrets, or unbounded metadata.
- Future mutation actions must recompute readiness and snapshots server-side immediately before the transition. Client-submitted snapshots should never be accepted as authoritative.

Recommended first lifecycle implementation slice:

1. Add a pure lifecycle/readiness helper after package definition/version and audit foundations exist or are mocked in a pure test harness.
2. Add tests for allowed transitions, blocked transitions, missing evidence, intent-only dependency caveats, and `actionAvailable` staying false until controls exist.
3. Add a read-only Super Admin lifecycle readiness panel or catalog section.
4. Keep actual lifecycle mutation server actions, approval/publish/deprecate/archive buttons, package assignments, billing/provider writes, Stripe calls, subscription operations, entitlement/module enforcement, runtime gates, reporting/export actions, automation, AI behavior, and starter-pack provisioning changes deferred.

Contractor Package Assignment Schema / Read-Model Design:

This is future-only schema/read-model planning. It does not create migrations, tables, RLS policies, grants, server actions, RPCs, routes, UI controls, reporting/export behavior, billing/provider calls, Stripe subscription operations, package assignment writes, package definition mutation actions, approval/schedule/activate/cancel controls, entitlement enforcement, module gating, contractor permission changes, starter-pack provisioning changes, automation, AI behavior, or runtime behavior. Current implemented status remains limited to read-only `/super-admin/packages` package/billing observability and the static Future Package Definition Model planning panel; no package assignment table or assignment read model exists today.

Future contractor package assignment concepts:

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

Proposed future assignment tables:

| Table | Purpose | Key columns and constraints | Security/read-model posture | Non-goals |
|---|---|---|---|---|
| `contractor_package_assignments` | Store the future package assignment record linking one company/contractor to one package definition version, with lifecycle state, effective dates, history links, and safe intent snapshots. | `id`, `company_id`, `package_definition_id`, `package_definition_version_id`, `status`, `lifecycle_state`, `effective_at`, `scheduled_for`, `activated_at`, `superseded_at`, `canceled_at`, `archived_at`, `previous_assignment_id`, `superseding_assignment_id`, `assignment_snapshot`, `billing_impact_snapshot`, `entitlement_module_impact_snapshot`, `starter_pack_implication_snapshot`, `cancellation_reason`, `supersession_reason`, `grandfathered_contract`, `custom_contract_label`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`. Constrain lifecycle/status to `draft`, `pending_review`, `approved`, `scheduled`, `active`, `superseded`, `canceled`, and `archived`. Candidate foreign keys: `company_id -> companies(id)`, `package_definition_id -> platform_package_definitions(id)`, `package_definition_version_id -> platform_package_definition_versions(id)`, actor fields to auth/profile user identity, self-references for previous/superseding assignments. A future partial unique index should allow at most one `active` assignment per company unless multi-package support is explicitly designed. | Platform-admin-only server access. Enable and force RLS if exposed through `public`; revoke broad `anon`/`authenticated` grants unless intentionally designed. Index by `company_id`, `package_definition_id`, `package_definition_version_id`, `status/lifecycle_state`, `effective_at`, `scheduled_for`, and history self-references for current assignment, scheduled-change, and supersession-chain reads. | No assignment write action, approval/schedule/activate/cancel control, billing/provider mutation, Stripe call, subscription operation, entitlement/module enforcement, contractor group membership, starter-pack provisioning, contractor-facing visibility, reporting/export behavior, automation, AI suggestion, or runtime effect. |
| `contractor_package_assignment_audit_events` | Store future assignment lifecycle evidence, including creation, review, approval, scheduling, activation, supersession, cancellation, and archive history. | `id`, `assignment_id`, `company_id`, `event_type`, `actor_user_id`, `reason`, `confirmation_text`, `before_snapshot`, `after_snapshot`, `metadata`, `occurred_at`, `created_at`. Constrain `event_type` to future assignment event families such as `package_assignment_drafted`, `package_assignment_reviewed`, `package_assignment_approved`, `package_assignment_scheduled`, `package_assignment_activated`, `package_assignment_superseded`, `package_assignment_canceled`, and `package_assignment_archived`. Snapshots and metadata should be JSONB objects with safe shape/size expectations. | Same platform-admin-only, server-side, RLS-forced posture as assignment records. Index by `assignment_id`, `company_id`, `event_type`, `actor_user_id`, and `occurred_at` for timelines, latest-evidence checks, and attention-needed rows. | No package assignment mutation by itself, no billing/provider write, no entitlement/module runtime effect, no package definition lifecycle change, no report/export file generation, and no contractor-facing behavior. |

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

Future contractor package assignment read model:

- A future helper such as `buildContractorPackageAssignmentReadModel(...)` or `getContractorPackageAssignmentReadModel(...)` should expose current assignment by company, assignment history, scheduled changes, supersession chain, missing package/version caveats, billing impact caveats, entitlement/module impact caveats, starter-pack implication caveats, read-only operator summaries, and attention-needed rows.
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
The implemented Package / Billing Plan Governance surface now includes a read-only package-definition planning panel, but it is not a package-definition persistence system, billing-management system, subscription-operations system, Stripe-backed billing system, entitlement-enforcement system, module-gating system, pricing-enforcement system, contractor-permission system, or runtime mutation system.
The implemented Operations/System Health surface is a read-only foundation, not an automation, remediation, alerting, incident-management, entitlement, provisioning, or runtime execution system.
