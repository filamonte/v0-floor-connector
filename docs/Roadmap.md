# FloorConnector Roadmap

Status: Active
Doc Type: Roadmap

This roadmap frames FloorConnector around platform maturity, not early startup build timing. It is sequencing guidance only.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md). For concise maturity status, use [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), and [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md).

## Roadmap Principles

- No roadmap section claims implementation by itself.
- No roadmap section introduces a parallel workflow.
- Future work must preserve the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

- Public acquisition, communications, integrations, AI, marketplace, reporting, and materials work must attach to the same canonical system.
- Dates, week counts, and early-build timing are intentionally omitted.

## 1. Operational Core: Substantially Implemented

The operational core is already real on the current branch. Current-state owns the exact details, but the implemented foundation includes:

- Supabase-backed auth and tenancy
- opportunities/leads, customers, and projects
- estimates, line items, catalog-backed authoring, and approved snapshots
- contracts, portal signing, contractor onsite signing, and signature events
- change orders
- jobs, readiness gates, scheduling foundations, and field execution foundations
- invoices, invoice line items, payments, payment events, and portal payment foundations
- portal access and project-scoped customer surfaces
- people, vendors, compliance, time, daily logs, field notes, and execution attachments
- settings and super-admin foundations
- normalized contractor UI shell, Manager Pages, Quick-Create, and Record Workspace patterns

This does not mean every surface is production-complete. It means the platform has a connected operating-system foundation rather than an unstarted product.

## 2. Workflow Tightening And Operational Entry Surfaces

Next maturity focus:

- strengthen project as the operational hub
- keep global Manager Pages as queues and work surfaces
- improve readiness, blockers, and next-best-action guidance
- deepen module dashboards without turning them into separate module apps
- continue context-aware creation and canonical full-workspace handoff
- preserve top-nav-first contractor shell and current UI baseline

## 3. Scheduling And Dispatch Expansion

Current status: Foundation.

Future depth:

- dispatch-grade schedule board/calendar behavior
- drag-and-drop rescheduling
- crew/resource coordination
- capacity and conflict detection
- route optimization where appropriate
- external calendar adapters after ownership/reconciliation boundaries are designed
- AI scheduling suggestions only with human approval for risky actions

Scheduling must stay on canonical jobs, appointments, and job assignments. Do not invent a disconnected dispatch subsystem.

## 4. Materials, Catalog, And Document Depth

Current status: Foundation.

Future depth:

- richer materials and inventory workflows
- purchasing, reservation, issue, return, and job material planning
- deeper reusable catalog/cost item management
- advanced System Templates, formulas, optional components, and versioning
- richer document-template and output controls
- shared file/evidence layer with multi-record links
- Takeoff & Scope Intelligence as project-scoped, human-reviewed estimate input

Catalog, materials, systems, takeoff, and documents must feed canonical estimates, contracts, jobs, invoices, and closeout evidence rather than become separate estimating or file silos.

## 5. Financial, Reporting, And Integration Expansion

Current status: Active core with foundation-level depth in several areas.

Future depth:

- broader Sales Tax Summary/reporting and analytics
- AIA/progress billing UX, exports, and draw-management depth
- deeper payment reconciliation, retries, refunds, disputes, and provider sync
- subscription/billing governance only after explicit security and release gates
- paid early-access infrastructure should follow [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md); the current Phase 2.2 foundation covers founder setup/activation visibility, platform-admin-entered billing evidence, and a test-mode-only FloorConnector SaaS subscription Checkout Session bridge, while live Stripe Billing, webhook reconciliation, entitlement enforcement, public self-serve launch, and provider mutation remain separate approved phases
- external e-sign provider integration on canonical contracts
- tax and accounting adapters
- package/billing governance beyond current read-only foundations

Financial work must preserve canonical invoices, payments, line-item lineage, approved snapshots, and append-only/effectively immutable event history.

## 6. Communications, Automation, And AI Assistance

Current status: Foundation for communications/notifications and a closed deterministic Operational Intelligence / Intelligent Follow-Up foundation; broad AI remains planned.

Planning reference: [docs/ai/intelligent-follow-up-engine.md](C:/FloorConnector/docs/ai/intelligent-follow-up-engine.md) defines the follow-up intelligence model, starting from deterministic evidence-backed cues over canonical records before AI summaries, drafts, or controlled automation.

Implemented deterministic foundation:
- operational cue derivation from canonical estimates, contracts, invoices, jobs, projects, and organization rule settings
- record and project workspace cue surfaces with safe canonical workflow routing
- user-confirmed work-item prefill for approved cue contexts only
- user-scoped dismiss/snooze through `workflow_cue_states`
- admin-facing built-in cue-rule guidance at `/settings/operational-intelligence`
- dashboard awareness surfaces without cue mutation controls

Deferred:
- company-scoped cue resolve or mark-handled
- dashboard dismiss/snooze controls
- AI summaries and draft assistance
- autonomous or provider-backed AI actions
- controlled automation beyond existing guarded notification-only foundations

Future depth:

- provider-backed customer messaging and delivery proof
- broader unified communications across website, email, SMS, portal, app, manual logs, calls, and voice where scoped
- manual and later controlled automation over canonical records
- AI drafting, summaries, classification, scheduling suggestions, project summaries, collections assistance, onboarding help, and support triage
- human approval queues for customer-facing, commercial, legal, billing, scheduling, permission, or compliance actions

AI is an operating layer over canonical records, not a parallel system with its own business truth.

## 7. Ecosystem And Marketplace Expansion

Current status: Planned / Deferred.

Future direction:

- contractor-owned websites and public acquisition surfaces
- marketing/lead capture depth
- review/reputation/testimonial/gallery workflows
- distributor/manufacturer/product ecosystems
- scoped subcontractor/vendor/partner collaboration
- invite-based networked work before any broader marketplace behavior
- controlled marketplace behavior only after permissions, compliance, ownership, and tenant isolation are designed

These layers must reinforce the same lifecycle and must not create a second CRM, website database, marketplace truth, or AI memory system.

## Cross-Cutting Governance

Every future roadmap item must consider:

- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)
- [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md)
- [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md)
- [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md)
- [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md)
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md)

Architecture-impacting roadmap changes should create or update ADRs and diagrams in the same change set.
