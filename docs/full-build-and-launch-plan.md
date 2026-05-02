# Full Build And Launch Plan

Status: execution roadmap and launch plan for FloorConnector.

This is a planning document only. It does not authorize app code, schema changes, or workflow changes by itself.

Sources:
- [docs/full-platform-feature-map.md](C:/FloorConnector/docs/full-platform-feature-map.md)
- [docs/system-integration-architecture.md](C:/FloorConnector/docs/system-integration-architecture.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md)
- [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)
- [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md)

If this plan conflicts with [docs/current-state.md](C:/FloorConnector/docs/current-state.md), trust `current-state.md` for implemented status.

## Canonical Launch Rule

Every phase must preserve the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Do not create:
- duplicate CRM records
- portal-only copies of canonical records
- mobile-only customer/project records
- website-only lead/customer/project records
- visualizer-only estimate records
- detached payment, contract, reporting, or scheduling systems

Remote intake remains staging before canonical promotion. Websites and the mobile app feed opportunities, not parallel records. Visualizer outputs are supporting evidence until contractor-reviewed.

## Current Status Summary

### Complete Enough To Treat As Implemented

- Supabase auth, tenant bootstrap, memberships, protected contractor app, and role-aware shell.
- Core canonical lifecycle records from opportunities through payments.
- Lead/opportunity intake and opportunity-to-estimate handoff through customer/project creation or linking.
- Customer, project, estimate, contract, change-order, job, invoice, payment, appointment, punchlist, daily-log, people, vendor, time, and compliance foundations.
- Estimate authoring on canonical line items, catalog sourcing, reusable systems, import helpers, autosave, customer send, portal review, approval/rejection, and approved snapshots.
- Contract generation, internal approval/readiness, signer routing, customer portal sign/decline, optional countersign, and immutable signature events on canonical contracts.
- Change orders with portal decision workflow, approved snapshots, and SOV/invoice integration.
- Snapshot-based invoice lineage, retainage-aware balances, tax-aware invoice calculations, and canonical payments/payment events.
- Customer portal shell, Project Workspace, estimate/contract/change-order/invoice review, and payment initiation.
- Directory read-only workspace over canonical customers, related customer contacts, people, vendors, and leads.
- Customer related contacts, linked-contact portal grants, stored customer-contact portal permissions, and first-pass enforcement for estimate/change-order/contract decisions.
- Communication and notification foundations, contractor notifications, and first `/communications` surface.
- Schedule manager foundation over canonical jobs and job assignments.
- Contractor settings and super-admin configuration foundations.
- Cost item/catalog/inventory foundations.

### Partially Built

- Portal permission enforcement is incomplete for view permissions, invoice/payment actions, quote requests, main-contact self-service, and legacy null-contact grant cleanup.
- Project workflow is real but still needs tighter next-best-action guidance, blocker language, and consistent continuity across every major Record Workspace.
- Communications now have a hardened contractor baseline for internal testing: canonical inbox/reply, source filters, selected-thread handling, unsupported-source guidance, and notification triage exist, while broader customer messaging, channel delivery, and workflow communication depth are not complete.
- Automation now has the first manual notification-only runner with `automation_runs` audit/idempotency, but no cron/background execution, provider sending, customer-facing automation, or workflow mutation.
- Reporting basics now exist at `/reports` over canonical records, but accuracy still needs internal validation before contractor beta.
- Tax now has the first `/reports` Sales Tax Summary over canonical invoice tax snapshots, but no filing, remittance, provider integration, cash-basis filing logic, or jurisdictional tax system.
- Portal is usable for major commercial actions, but not yet fully launch-grade across permissions, contact administration, files/status, and support expectations.
- Materials/inventory has a strong item/catalog foundation but not purchasing, consumption, reservation, or operational material planning.
- Super-admin has configuration foundations but not SaaS billing, entitlements, usage, tenant health, or rollout governance depth.

### Not Started

- Full website generator, SEO/service-location page system, custom-domain publishing, and public lead-capture product.
- Customer mobile app and structured remote intake product.
- Visualizer provider integration.
- E-notary.
- External e-sign provider integration.
- Full reports manager and analytics catalog beyond the first internal-beta reports surface.
- Full automation execution engine beyond the first manual notification-only runner.
- Full dispatch optimization.
- SaaS subscription billing and public marketplace behavior.

## Phase A: Core Completion

Current Phase A closeout:
- Phase A is functionally complete enough to enter internal validation.
- The completion report and Phase B readiness gates now live at [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md).
- Phase B implementation should wait until the seed-free manual QA pass has been run and any readiness-gate defects are triaged.

### Goals

Make the current contractor OS and customer portal safe, coherent, and internally testable without expanding into growth products.

Primary outcome:
- a complete-enough connected workflow for internal testing from opportunity through payment, with no known portal/security holes in the core decision actions.

### Required Features

- Finish portal permission enforcement for linked customer-contact grants:
  - estimate view/comment access where applicable
  - contract view access
  - invoice view access
  - payment request/checkout start
  - quote-request placeholder gating only if a quote-request entry point exists
- Preserve null-contact customer-level grant behavior during the compatibility window, with clear admin cleanup language.
- Add customer detail cleanup guidance for customer-level grants that should be linked to related contacts.
- Tighten project workflow polish:
  - project hub next action
  - estimate/contract/invoice/job handoff cards
  - readiness blockers
  - consistent lifecycle vocabulary
  - no duplicate module-local next-action logic
- Establish communication baseline:
  - reliable contractor-side inbox/reply for supported canonical thread types
  - clear unsupported source behavior
  - project/customer/estimate/contract/invoice/change-order context links
  - notification read-state consistency
  - explicit no-automation/no-provider-send guidance during internal testing
- Run the seed-free internal QA workflow checklist before broader beta:
  - [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md)
- Fix high-priority UX inconsistencies that could confuse internal testers.

### Dependencies

- Existing portal access grants and project access foundation.
- Existing `customer_contact_portal_permissions`.
- Existing canonical communication threads/messages.
- Existing project readiness and schedule/payment/contract handoff data.
- Current top-nav contractor UI and shared Record Workspace pattern.

### Acceptance Criteria

- Linked-contact grants enforce stored permissions for all currently available portal decision and billing actions.
- Null-contact grants are still supported and clearly labeled as compatibility behavior.
- A contractor can complete a clean internal test path:
  - create opportunity
  - create/link customer and project
  - create/send/approve estimate
  - generate/send/sign contract
  - create job
  - create invoice
  - initiate/record payment
- The seed-free internal QA checklist can be completed or any skipped items are explicitly recorded:
  - [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md)
- Each major record page points back to the project hub when workflow context matters.
- Communication inbox can be used for supported record-attached conversation review and reply without implying unsupported workflows.
- No new CRM, portal-copy, schedule-copy, or billing-copy model is introduced.

### What Not To Build Yet

- No public website builder.
- No mobile app.
- No visualizer integration.
- No full automation engine.
- No full reports builder.
- No external e-sign, e-notary, accounting sync, or tax provider integration.
- No universal cleanup migration that breaks existing null-contact portal grants.

## Phase B: Internal Beta

Current Phase B checkpoint:
- First Phase B implementation slices are complete for onboarding readiness polish, reporting basics, Sales Tax Summary, and manual notification-only automation.
- The current checkpoint and next recommended validation work live at [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md).
- Recommendation: pause feature expansion and run internal validation before contractor beta.
- Remaining Phase B work is primarily validation and beta operations documentation: seed-free QA, reporting/tax reconciliation, automation duplicate/recipient checks, support/release checklist, onboarding runbook, beta candidate criteria, and bug triage process.

### Goals

Make FloorConnector ready for sustained contractor-style internal usage by the founder/team and trusted internal testers.

Primary outcome:
- a contractor can use the system daily for core sales, project, contract, billing, communication, and basic reporting workflows.

### Required Features

- Contractor usage readiness:
  - onboarding checklist for a new contractor tenant
  - starter org settings review
  - starter template/catalog adoption flow hardening
  - sample-free production-safe empty states
  - core workflow QA scripts
- Automation basics:
  - first safe notification-only automations
  - explicit execution logs
  - no workflow mutation until rule behavior is proven
  - contractor setting controls for enabled categories and recipients
- Reporting basics:
  - reports home or reports module baseline
  - core reports from canonical data:
    - open opportunities
    - estimate pipeline
    - signed/unsigned contracts
    - open invoices
    - payments received
    - schedule readiness
    - job status
  - CSV export where low-risk
- Tax reporting foundation:
  - taxable sales summary
  - exempt sales summary
  - tax collected by date range
  - customer exemption visibility
  - item taxable/non-taxable summary from invoice snapshots
- Support/internal operations:
  - internal issue capture process
  - release checklist
  - data correction policy

### Dependencies

- Phase A portal/security completion.
- Stable canonical invoice/payment/tax snapshot lineage.
- Existing notification and communication foundations.
- Existing super-admin and contractor settings foundation.
- Existing catalog/template seed adoption.

### Acceptance Criteria

- Internal testers can operate a full tenant without needing seed/demo data.
- At least one notification-only automation can execute and log without mutating business records.
- Basic reports read from canonical records, not reporting shadow truth.
- Tax reports reconcile to invoice snapshots and payment/invoice date filters as explicitly defined.
- Contractor setup can be performed using documented onboarding steps.
- Support process exists for bug triage, data correction, and launch readiness review.

### What Not To Build Yet

- No automated estimate generation.
- No external contractor website publishing.
- No custom DNS automation.
- No mobile app.
- No visualizer-to-estimate automation.
- No paid SaaS billing unless needed to manage beta tenants manually.
- No deep jurisdictional tax engine.

## Phase C: External Contractor Beta

### Goals

Open FloorConnector to 3-10 real contractor organizations with a controlled support process and launch-grade portal behavior.

Primary outcome:
- external contractors can run real opportunities, estimates, contracts, invoices, customer portal actions, and payments with active support.

### Required Features

- Portal fully usable:
  - customer portal invite/access flow is understandable
  - portal project access is easy to review
  - estimate/contract/change-order/invoice/payment workflows work end to end
  - blocked permission states are clear
  - mobile browser portal UX is acceptable
- Customer contacts and permissions complete for beta:
  - linked-contact grant management
  - permission enforcement for visible portal actions
  - main-contact management decision documented, even if not self-service yet
  - customer-level legacy grants have cleanup guidance
- Contractor onboarding flow:
  - tenant creation
  - org profile/logo
  - member setup
  - financial/workflow settings
  - templates
  - catalogs
  - portal setup
  - payment settings
- Support process:
  - beta intake checklist
  - known limitations page
  - weekly feedback loop
  - priority bug policy
  - data export/offboarding plan
  - escalation process for portal/payment/security issues
- Operational readiness:
  - production environment checklist
  - backup/recovery expectations
  - audit review for RLS and tenant boundaries
  - payment webhook verification

### Dependencies

- Phase B internal beta stability.
- Reliable payment provider setup and webhook handling.
- Basic reports and tax summaries.
- Launch-ready onboarding documentation.
- Clear support ownership and issue tracking process.

### Acceptance Criteria

- 3-10 contractor tenants can be onboarded without code changes.
- Each beta contractor can run at least one real or pilot workflow from opportunity through payment.
- Customers can use the portal without contractor-side manual database cleanup.
- Portal permissions behave predictably for customer-level and linked-contact grants.
- Critical beta incidents can be triaged and resolved with documented escalation.
- No cross-tenant data exposure is found in testing.

### What Not To Build Yet

- No broad public launch.
- No website generator as a required beta dependency.
- No mobile app as a required beta dependency.
- No visualizer as a required beta dependency.
- No marketplace.
- No e-notary unless a beta contractor explicitly validates the need and legal/provider path.
- No automated DNS provider mutation.

## Phase D: Growth Engine

### Goals

Add the public acquisition layer after the contractor OS and portal are stable enough to absorb inbound work.

Primary outcome:
- contractors can publish lead-capture websites or pages that feed canonical opportunities.

### Required Features

- Website generator:
  - tenant-owned website settings
  - homepage/service page templates
  - brand/logo/contact configuration
  - published preview
  - safe empty/default content
- Lead capture:
  - public quote/request forms
  - server-side public intake API
  - tenant/domain/form-token validation
  - spam/rate-limit baseline
  - contact creation/reuse
  - opportunity creation
  - attribution metadata on opportunity/intake support records
- Custom domain/DNS integration:
  - domain ownership verification
  - DNS instruction UI
  - CNAME/TXT status check
  - Vercel/domain provider mapping process
  - no automatic DNS mutation in V1
- SEO service/location pages:
  - service pages
  - location pages
  - page metadata
  - sitemap/robots basics
  - canonical URLs
  - form attribution to source page

### Dependencies

- Phase C external beta feedback.
- Stable opportunity intake path.
- Domain/DNS architecture from [docs/system-integration-architecture.md](C:/FloorConnector/docs/system-integration-architecture.md).
- Support process for website/domain setup issues.
- A clear policy that website submissions create opportunities, not customers/projects by default.

### Acceptance Criteria

- A contractor can publish at least one branded lead-capture site or landing page.
- A public submission creates/reuses contact identity and creates a canonical opportunity.
- Tenant resolution is verified server-side and cannot be spoofed by changing hidden form fields.
- Custom-domain setup can be completed with documented DNS records and verification.
- Service/location pages produce clean metadata and route attribution into the opportunity intake path.
- No website feature creates a parallel CRM, customer, project, or estimate chain.

### What Not To Build Yet

- No full CMS complexity beyond controlled templates.
- No automated DNS mutation through registrar APIs.
- No AI SEO content generation as a core dependency.
- No automatic estimate creation from website forms.
- No review/reputation management unless validated by beta contractors.
- No marketing analytics warehouse beyond opportunity attribution basics.

## Phase E: Differentiation

### Goals

Add differentiated product layers once the core operating system and growth intake path are stable.

Primary outcome:
- FloorConnector becomes meaningfully different through remote intake, visualizer-assisted scoping, e-notary/legal depth, and materials/inventory operations while preserving the same lifecycle.

### Required Features

- Customer mobile app / remote intake:
  - customer identity and contact capture
  - remote measurement/photo/video intake
  - structured area/surface/prep observations
  - tenant-safe media upload
  - public or tokenized intake flow
  - submitted intake creates or updates opportunity-stage records
  - contractor review and promotion into customer/project/estimate
- Visualizer integration:
  - external provider adapter first
  - secure session launch
  - verified callbacks
  - output assets stored as supporting evidence
  - product/system selections mapped to catalog items only when trusted
  - contractor-reviewed handoff before estimate line items are created
- E-notary:
  - provider selection and legal workflow review
  - adapter boundary
  - canonical contract/event linkage
  - no separate legal-document source of truth
- Inventory/materials:
  - materials module over canonical `catalog_items`, `inventory_items`, and `inventory_transactions`
  - purchasing/receiving baseline
  - job material planning
  - inventory consumption event design
  - no pricing recalculation from stock state

### Dependencies

- Growth Engine intake API and attribution foundation for mobile/public intake reuse.
- Stable media storage rules.
- Stable catalog item/system mappings.
- Stable opportunity promotion flow.
- Provider integration boundary in `packages/integrations`.
- Legal review for e-notary scope and provider requirements.

### Acceptance Criteria

- Customer mobile intake creates opportunity-stage remote-intake context only.
- Contractor can review mobile intake and promote it through the canonical lifecycle.
- Visualizer output is visible as supporting evidence and cannot silently become approved estimate scope.
- E-notary actions attach to canonical contracts/events if implemented.
- Materials workflows extend catalog/inventory foundations and do not create a second item or pricing model.
- Differentiation features do not destabilize beta contractors' core workflow.

### What Not To Build Yet

- No visualizer-driven auto-estimates.
- No separate mobile CRM.
- No standalone customer project system.
- No marketplace material ordering until inventory and vendor workflows prove useful.
- No deep procurement/accounting automation before materials basics work.
- No e-notary without provider/legal validation.

## Launch Gates

### Gate 1: Internal Testing

Entry criteria:
- Phase A complete.
- Core workflow test script exists.
- No known P0 tenant/security/portal bugs.

Required validation:
- founder/team can complete opportunity to payment in a test tenant.
- portal permission matrix passes for customer-level and linked-contact grants.
- payment webhook and portal payment flow are verified in the intended test mode.
- communication baseline and notifications behave predictably.

Exit criteria:
- internal testers can run the system for multiple workflows without manual database intervention.
- known limitations are documented.

### Gate 2: 3-10 Contractor Beta

Entry criteria:
- Phase B complete.
- onboarding checklist ready.
- support process ready.
- production environment checklist complete.

Required validation:
- onboard 3-10 contractors with realistic data.
- each contractor completes at least one real or pilot lifecycle path.
- collect weekly feedback on estimates, contracts, portal, invoices, payments, and scheduling.
- triage all security/payment/portal issues immediately.

Exit criteria:
- at least 3 contractors can use the system repeatedly without critical support intervention.
- no cross-tenant data issues.
- portal customers can complete assigned actions without contractor-side workaround.

### Gate 3: Paid Early Adopters

Entry criteria:
- Phase C stable with repeated contractor use.
- pricing/terms/support expectations defined.
- backup/offboarding/export policy documented.

Required validation:
- convert a small number of beta contractors to paid plans or paid pilots.
- support load is measurable and manageable.
- core reports/tax summaries support basic business review.
- payment and portal workflows are trusted enough for real customer-facing use.

Exit criteria:
- early adopters are paying for the core contractor OS, not only for promised future growth/mobile/visualizer features.
- urgent bug rate is low enough to add growth-engine work.

### Gate 4: Public Launch

Entry criteria:
- Phase D complete enough for lead capture.
- at least a small cohort of paid adopters has succeeded.
- public onboarding, support, and known-limitations materials are ready.

Required validation:
- public website/lead capture reliably creates canonical opportunities.
- custom-domain process is supportable.
- public marketing claims match implemented product.
- sign-up, onboarding, portal, payment, and support paths are documented.

Exit criteria:
- product can accept new contractor interest without bespoke setup for every account.
- growth features feed the canonical lifecycle cleanly.

## Cross-Phase Risks And Controls

### Data Model Drift

Risk:
- new surfaces create duplicate leads, customers, projects, estimates, or visualizer quote records.

Controls:
- opportunity remains the intake root.
- customers/projects are promoted explicitly.
- estimates are contractor-reviewed canonical records.
- provider output is metadata/evidence until reviewed.

### UI Drift

Risk:
- new modules reintroduce inconsistent shells, old page patterns, or module-local dashboards.

Controls:
- use current contractor shell and Record Workspace baseline.
- dashboards remain entry surfaces into canonical records.
- no new module app shell unless explicitly approved.

### Overbuilding Before Validation

Risk:
- mobile, visualizer, marketplace, DNS automation, or website CMS complexity lands before contractor OS value is validated.

Controls:
- finish Phase A-C before Phase D/E.
- use controlled templates before CMS.
- use external visualizer adapter before embedded visualizer.
- defer automatic DNS mutation.

### Portal And Security Mistakes

Risk:
- customer contacts see too much, payment actions bypass permissions, or tenant scope leaks.

Controls:
- all portal actions use server-side scope checks.
- linked-contact permissions enforce all visible actions before external beta.
- null-contact compatibility is labeled and cleanup-guided.
- tenant and project scope remain explicit.

### Custom Domain / DNS Complexity

Risk:
- contractor domains are misconfigured, spoof tenant identity, or create support burden.

Controls:
- V1 uses verification and documented DNS records.
- server validates domain/form token.
- no provider API mutation until process is stable.
- support checklist covers DNS propagation and verification states.

### Visualizer Becomes Estimate Truth Too Early

Risk:
- visualizer selections create unreviewed scope/pricing.

Controls:
- visualizer output attaches to opportunity/project/estimate as evidence.
- catalog mapping is advisory until trusted.
- contractor action is required before estimate line items are created.

## Recommended Next 10 Implementation Prompts

Use these in order. Each prompt should begin by reading `docs/developer-source-of-truth.md`, `docs/current-state.md`, `docs/workflows.md`, `docs/full-platform-feature-map.md`, and this plan.

1. Finish linked-contact portal permission enforcement for invoice view/payment actions and estimate/contract view actions, preserving null-contact compatibility and existing canonical record loaders.
2. Add contractor-admin cleanup guidance for customer-level portal grants, including clear customer detail UI copy and safe filters for grants that should be linked to related customer contacts.
3. Run a project workflow polish pass across project, estimate, contract, invoice, job, and change-order detail pages to standardize next actions, blockers, and project-hub handoff language.
4. Harden the contractor communications baseline: supported source filters, reply behavior, read-state behavior, empty states, and context links without adding unsupported messaging channels.
5. Create an internal workflow QA checklist document and seed-free test script for opportunity to payment, including portal customer actions and linked-contact permission cases.
6. Implement first notification-only automation execution with execution logs and contractor settings, with no workflow record mutation.
7. Build reporting basics from canonical records: pipeline, contracts, invoices, payments, schedule readiness, and job status.
8. Build tax reporting foundation from invoice snapshots: taxable sales, exempt sales, tax collected, customer exemptions, and item taxable/non-taxable summary.
9. Create contractor onboarding checklist and support process docs for internal beta and external beta readiness.
10. Build public intake API architecture for website/mobile submissions rooted in canonical opportunities, including contact reuse, tenant/domain/form-token validation, and media storage plan.

## Immediate Recommended Build Order

The first five build tasks should be:

1. Portal permission enforcement completion.
2. Customer-level grant cleanup guidance.
3. Project workflow polish.
4. Communications baseline hardening.
5. Internal workflow QA checklist and seed-free test script.

This order protects the existing core before adding automation, reporting, growth, mobile, or visualizer work.
