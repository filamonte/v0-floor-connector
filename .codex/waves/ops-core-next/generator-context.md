# Wave Generator Context

Generated: 2026-06-01T20:16:34.514Z
Current main commit: b921d9096cba55b5115f38476dd28e60dae0e6ed

## Recent Git Log

```text
b921d909 chore: harden AI wave generation
00407c57 feat: add AI wave generation gate
22fa6927 feat: add agent wave runner v1
c8a7c990 Merge remote-tracking branch 'origin/stream/dispatch-board'
25cc9ad4 Merge remote-tracking branch 'origin/main' into stream/dispatch-board
ae0b2a5c Merge remote-tracking branch 'origin/stream/record-communications'
d3abfdde Merge remote-tracking branch 'origin/stream/project-next-actions'
a0caba7a feat: add schedule dispatch board v1
c53b7d25 feat: add project next actions panel
6de1f484 feat: add record communication continuity panels
03e16bb6 feat: add dashboard action queues
ac96b92a fix: restore dashboard operating metrics
```

## Current Wave

Name: ops-core-next
Goal: Make FloorConnector more operationally useful for field execution and collections follow-up without schema changes.

## Current Wave Streams

- field-execution-command-v1: medium; Make daily logs, open field notes, blockers, and today's job execution easier to act on from existing project/job/daily-log context.; status prepared; validation not_run
- collections-follow-up-context-v1: medium; Extend AR Collections with read-only follow-up context and clearer invoice/customer/project continuity using existing records only.; status prepared; validation not_run
- portal-trust-continuity-v1: medium; Improve customer portal project/invoice/contract continuity so customer-facing state reflects the same operational loop more clearly.; status prepared; validation not_run
- e2e-fixture-refresh-v1: low; Fix stale protected smoke fixture discovery so browser validation proves real detail pages without hard-coded dead IDs.; status prepared; validation not_run

## Product Stride Review

```json
[
  {
    "stream": "field-execution-command-v1",
    "productImpact": "medium",
    "userVisibleImprovement": "yes",
    "canonicalWorkflowAlignment": "yes",
    "operationalValue": "high",
    "riskLevel": "medium",
    "recommendedAction": "needs human review"
  },
  {
    "stream": "collections-follow-up-context-v1",
    "productImpact": "medium",
    "userVisibleImprovement": "yes",
    "canonicalWorkflowAlignment": "yes",
    "operationalValue": "high",
    "riskLevel": "medium",
    "recommendedAction": "needs human review"
  },
  {
    "stream": "portal-trust-continuity-v1",
    "productImpact": "medium",
    "userVisibleImprovement": "yes",
    "canonicalWorkflowAlignment": "yes",
    "operationalValue": "high",
    "riskLevel": "medium",
    "recommendedAction": "needs human review"
  },
  {
    "stream": "e2e-fixture-refresh-v1",
    "productImpact": "low",
    "userVisibleImprovement": "yes",
    "canonicalWorkflowAlignment": "needs review",
    "operationalValue": "high",
    "riskLevel": "low",
    "recommendedAction": "needs human review"
  }
]
```

## Current Run Report

# Agent Wave Run Report

Wave: ops-core-next
Generated: 2026-06-01T20:14:50.865Z
Base: origin/main
Base commit: 00407c57cadb6d04cc5d154204711b3e4a4c0219

## Goal

Make FloorConnector more operationally useful for field execution and collections follow-up without schema changes.

## Stream Summary

| Stream                           | Risk   | Status   | Validation | Merge check | Latest commit |
| -------------------------------- | ------ | -------- | ---------- | ----------- | ------------- |
| field-execution-command-v1       | medium | prepared | not_run    | not_run     | c8a7c9909835  |
| collections-follow-up-context-v1 | medium | prepared | not_run    | not_run     | c8a7c9909835  |
| portal-trust-continuity-v1       | medium | prepared | not_run    | not_run     | c8a7c9909835  |
| e2e-fixture-refresh-v1           | low    | prepared | not_run    | not_run     | c8a7c9909835  |

## Per-Stream Status

### field-execution-command-v1

- Branch: stream/field-execution-command-v1
- Worktree: C:/FC-worktrees/field-execution-command
- Product outcome: Make daily logs, open field notes, blockers, and today's job execution easier to act on from existing project/job/daily-log context.
- Status: prepared
- Latest commit: c8a7c99098351c89d0c4895cdd5425f073ecd12d
- Validation: not_run
- Merge check: not_run

Commits:

```text
(none)
```

Changed files:

- (none recorded)

Validation results:

- Not run

### collections-follow-up-context-v1

- Branch: stream/collections-follow-up-context-v1
- Worktree: C:/FC-worktrees/collections-follow-up-context
- Product outcome: Extend AR Collections with read-only follow-up context and clearer invoice/customer/project continuity using existing records only.
- Status: prepared
- Latest commit: c8a7c99098351c89d0c4895cdd5425f073ecd12d
- Validation: not_run
- Merge check: not_run

Commits:

```text
(none)
```

Changed files:

- (none recorded)

Validation results:

- Not run

### portal-trust-continuity-v1

- Branch: stream/portal-trust-continuity-v1
- Worktree: C:/FC-worktrees/portal-trust-continuity
- Product outcome: Improve customer portal project/invoice/contract continuity so customer-facing state reflects the same operational loop more clearly.
- Status: prepared
- Latest commit: c8a7c99098351c89d0c4895cdd5425f073ecd12d
- Validation: not_run
- Merge check: not_run

Commits:

```text
(none)
```

Changed files:

- (none recorded)

Validation results:

- Not run

### e2e-fixture-refresh-v1

- Branch: stream/e2e-fixture-refresh-v1
- Worktree: C:/FC-worktrees/e2e-fixture-refresh
- Product outcome: Fix stale protected smoke fixture discovery so browser validation proves real detail pages without hard-coded dead IDs.
- Status: prepared
- Latest commit: c8a7c99098351c89d0c4895cdd5425f073ecd12d
- Validation: not_run
- Merge check: not_run

Commits:

```text
(none)
```

Changed files:

- (none recorded)

Validation results:

- Not run

## Dry Merge Results

- Not run

## Product Stride Review

| Stream                           | Product impact | User-visible improvement | Canonical workflow alignment | Operational value | Risk level | Recommended action |
| -------------------------------- | -------------- | ------------------------ | ---------------------------- | ----------------- | ---------- | ------------------ |
| field-execution-command-v1       | medium         | yes                      | yes                          | high              | medium     | needs human review |
| collections-follow-up-context-v1 | medium         | yes                      | yes                          | high              | medium     | needs human review |
| portal-trust-continuity-v1       | medium         | yes                      | yes                          | high              | medium     | needs human review |
| e2e-fixture-refresh-v1           | low            | yes                      | needs review                 | high              | low        | needs human review |

## Next Prompt Proposals

- C:\FloorConnector\.codex\waves\ops-core-next\next-wave-proposal.md

## AI Next-Wave Generation

- Status: manual_ai_required
- Mode: template_fallback
- Proposed wave: ops-core-next-ai-proposed
- Review: C:\FloorConnector\.codex\waves\ops-core-next\ai-next-wave-review.md
- Schema validation: passed

Next proposed-wave command:

```powershell
pnpm fc:wave:approve --wave ops-core-next-ai-proposed --proposal
pnpm fc:wave:prepare --wave ops-core-next-ai-proposed
```

## Merge Recommendation

Human review required before approval. Do not merge until validation and product-stride concerns are resolved.

## Approval Checklist

- Review every stream diff against its prompt and expected files.
- Confirm no schema, migration, auth, RLS, payment math, provider, env, or route-protection change slipped in.
- Confirm validation results are acceptable.
- Confirm dry merge checks are acceptable.
- Confirm next-wave prompts are present.
- Run `pnpm fc:wave:approve --wave ops-core-next` only after human

[excerpt truncated]

## Explicit Generator Instruction

Generate an outcome-based next wave that materially advances FloorConnector. Avoid cosmetic-only crumbs. Prefer 3 to 5 bounded streams that connect to the canonical contractor workflow.

## Relevant Doc Excerpts

### docs/developer-source-of-truth.md

# Developer Source Of Truth

Status: Stable
Doc Type: Governance

## PURPOSE

This file is the primary entry point for all development.

You must:

- Read this file first
- Follow all rules strictly
- Do not rely on prior chat context

---

## CORE RULES (NON-NEGOTIABLE)

- Do NOT break schema, workflows, calculations, or financial logic
- Project is the core operational object
- No duplicate records across core entities
- Canonical lifecycle must remain intact

Opportunity -> Customer -> Project -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment

Lead and intake language may appear in older or broader planning docs, but implementation work should treat `opportunity` as the canonical pre-customer commercial record unless a task explicitly scopes otherwise.

---

## Financial Guardrails

- Invoices require valid billing triggers.
- Invoices must be tied to real scope; no freeform or disconnected billing.
- Approved scope is not automatically billable.
- Invoices are money owed; payments are money collected.
- Change orders extend the same financial chain.

---

## CONTEXT-AWARE CREATION (REQUIRED)

- Project context → auto-linked
- Customer context → must attach/select project
- Global context → must select customer + project

Applies to:

- estimates
- jobs
- invoices
- contracts

---

## NAMING CONVENTIONS (REQUIRED)

Use consistent page terminology across the system:

- `/<resource>` routes = `<Resource> Manager Page`
- Record detail pages = `<Resource> Workspace`
- Focused editing surfaces = `<Resource> Editor`
- Top-level create flows = `<Resource> Quick-Create`
- Nested create flows = `Inline <Resource> Quick-Create`

Do not introduce alternate naming such as:

- page
- screen
- edit page
- form

Consistency here is required for:

- developer communication
- Codex prompts
- documentation alignment

---

## SYSTEM MAP

Core:

- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/platform-maturity.md
- docs/module-status.md
- docs/known-gaps.md
- docs/workflows.md
- docs/Roadmap.md
- docs/architecture-principles.md
- docs/canonical-lifecycle.md
- docs/adr/README.md

UI:

- docs/ui-system.md
- docs/floorconnector-ui-build-rules.md
- docs/v0-ui-cleanup-brief-header-project-estimate.md

Execution:

- docs/chat-handoff.md
- docs/ai/README.md
- docs/documentation-standards.md

---

## HOW TO WORK

1. Read this file
2. Read current-state.md + workflows.md
3. Follow rules strictly
4. Ask if anything is unclear

---

## ACTIVE DIRECTION

- Improve UI clarity (no system logic changes)
- Treat Estimates as the contractor app's UI/workflow reference pattern for proposal-first record workspaces
- Treat Guided/Flexible/Manual workflow guidance as configurable presentation, not a data-model or enforcement escape hatch
- Treat the Golden Workflow Demo Path as the repeatable QA spine through the existing canonical chain, not as permission for demo-only records or disconnected shortcuts
- Treat [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md) as the ownership and density guide for customer/contact/access/review surfaces: People owns access management through a filtered access console with one selected management panel, Customer owns account summary, Project owns operational state, Estimate/Contract/Invoice own their immediate business review, Portal stays customer-safe, and record right rails must stay supportive instead of becoming a second full page
- Treat [docs/enterprise-ui-system-audit.md](C:/FloorConnector/docs/enterprise-ui-system-audit.md) as the latest route-by-route visual audit and drift-watch note. Future UI work must preserve the Estimate-led Graphite/Copper/neutral visual system and must not count protected route QA unless the correct authenticated role actually loaded the secured page.
- Treat portal/customer Golden Workflow QA as a real-auth, real-grant smoke path. Portal checks must use a valid portal customer session backed by canonical `portal_access_grants` and `portal_project_access`; `/login`, accidental 404s, access-denied pages, or missing fixtures are not successful portal QA unless intentionally asserted as the expected unauthorized result
- Treat customer portal access as contact-centered for new contractor-created invites: the customer account is the business relationship, the customer contact is the person, Supabase Auth proves identity, `portal_access_grants` authorize access, and `portal_project_access` scopes visible project

[excerpt truncated]

### docs/current-state.md

# Current State

Status: Active
Doc Type: Current Truth

This document summarizes the current implemented architecture and feature foundation in the FloorConnector monorepo.

## How To Use This Doc

Use this document when you need current branch reality. For concise status maps, see [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md), and [docs/system-status-review.md](C:/FloorConnector/docs/system-status-review.md). For current risk framing, use [docs/system-risk-register.md](C:/FloorConnector/docs/system-risk-register.md). For workflow rules, use [docs/workflows.md](C:/FloorConnector/docs/workflows.md). For future direction, use [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) and [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md).

Use [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md) as the primary developer entry point. Use this document for implemented truth after that first orientation.

Use these docs together:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): primary development entry point and implementation guardrails
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth and current branch reality
- [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md): concise maturity framing
- [docs/module-status.md](C:/FloorConnector/docs/module-status.md): concise module status map
- [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md): important depth gaps around the implemented core
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity roadmap
- [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md): future expansion direction
- [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md): stable architecture principles
- [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md): canonical lifecycle and lineage rules
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/site-visit-scope-intake-plan.md](C:/FloorConnector/docs/site-visit-scope-intake-plan.md): Scope Intake planning guardrails between site visit and estimate planning
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term Estimate Builder blueprint
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): constrained Estimate Builder V1 scope
- [docs/estimate-builder-system-generation-spec.md](C:/FloorConnector/docs/estimate-builder-system-generation-spec.md): future system-generation planning detail
- [docs/starter-pack-provisioning-plan.md](C:/FloorConnector/docs/starter-pack-provisioning-plan.md): starter-pack provisioning safety model, execution guardrails, and future void planning
- [docs/starter-pack-provisioning-execution-readiness.md](C:/FloorConnector/docs/starter-pack-provisioning-execution-readiness.md): starter-pack provisioning execution readiness, field mapping, lineage, and void-readiness notes
- [docs/starter-pack-provisioning-review.md](C:/FloorConnector/docs/starter-pack-provisioning-review.md): consolidated architecture/operator readiness review before any real void action
- [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md): future/planned UI, directory/contact, tax, Estimate Editor, project-address, and workflow-guidance alignment backlog
- [docs/ui-patterns.md](C:/FloorConnector/docs/ui-patterns.md): implemented decision-first UI patterns for contractor workspaces, Manager Pages, status color semantics, and portal/super-admin differences
- [docs/enterprise-ui-system-audit.md](C:/FloorConnector/docs/enterprise-ui-system-audit.md): latest enterprise visual-system route audit, drift sources, and authenticated QA rules
- [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md): repeatable Phase 1 route-by-route demo and QA spine for the existing canonical workflow
- [docs/found

[excerpt truncated]

### docs/workflows.md

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
  and customers rather than schedule-local records. Its schedule board read
  model derives daily/weekly operating lanes, ready-to-schedule jobs,
  readiness-review items, crew gaps, and advisory schedule warnings from
  canonical jobs and `job_assignments` without creating a second dispatch source
  of truth.
- Reports is the current company-level operations/collections visibility
  surface on `/reports`; it summarizes source records and routes users back to
  Project Workspace, CrewBoard, Invoice Workspace, and Contract Workspace.
- future visualizer/product/finish selections may start before lead intake, but once used operationally they should become canonical selected-system/spec context instead of disposable session-only data
- a future contractor-facing `Directory` may unify how contact-like records are browsed and managed, but it must remain a view over canonical records rather than a replacement business model

## Canonical Workflow Chain

The current canonical business lifecycle is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Authentication, organization bootstrap, dashboard entry, site assessment, Scope Intake, financial readiness, and scheduling readiness are supporting access or workflow stages around that lifecycle. They should guide the same re

[excerpt truncated]

### docs/Roadmap.md

# FloorConnector Roadmap

Status: Active
Doc Type: Roadmap

This roadmap frames FloorConnector around platform maturity, not early startup build timing. It is sequencing guidance only.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md). For the founder/product-owner build list, immediate build order, and horizon-based completion timeline, use [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md). For concise maturity status, use [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), and [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md). For strategic sequencing, use [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md) and [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md). For strategic layer doctrine, use [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md), [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md), [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md), [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md), and [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).

## Roadmap Principles

- No roadmap section claims implementation by itself.
- No roadmap section introduces a parallel workflow.
- Future work must preserve the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

- Public acquisition, communications, integrations, AI, marketplace, reporting, and materials work must attach to the same canonical system.
- Communications must attach to operational context rather than become a disconnected inbox or chat product.
- Reporting and metrics must derive from canonical records rather than duplicate reporting truth.
- Automation must extend the canonical workflow chain through deterministic evidence, readiness awareness, and approval boundaries before autonomous behavior.
- Intelligence work must be canonical-first: no duplicate reporting truth, disconnected BI silo, manual metric-entry chain, or AI-only operational truth.
- GateKeeper communications, operational memory, workflow reinforcement, and AI assistance are future platform layers over canonical records, not standalone products.
- Dates, week counts, and early-build timing are intentionally omitted.

## Strategic Build Stack

Current recommended build-order discipline:

| Tier   | Focus                                         |
| ------ | --------------------------------------------- |
| Tier 1 | Operational Core Completion                   |
| Tier 2 | Scheduling And Communications                 |
| Tier 3 | Reporting And Workflow Automation             |
| Tier 4 | Intelligence Layer                            |
| Tier 5 | Predictive AI And Agentic Assistance          |
| Tier 6 | Governed Autonomy, Ecosystem, And Marketplace |

Use [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md) as the living strategic coordination map for major planned systems, priorities, dependencies, maturity, status, and rationale. Use [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md) to prevent foundation-level systems from being treated as ready for intelligence, predictive, or autonomous behavior too early.

Use [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md)
when a prompt needs the complete product-area build list, realistic completion
horizons, and next 10-15 build slices. Its current sequencing keeps Phase 0 as
source-of-truth cleanup, Phase 1 as operational core completion, Phase 2 as
scheduling/communications/reporting density, Phase 3 as portal/mobile/financial
depth, Phase 4 as integrations and automation maturity, Phase 5 as AI/growth
platform work, and Phase 6 as ecosystem/network planning.

## Feature Coverage Direction

FloorConnector should use Contractor Foreman as a baseline reference for common contractor-system coverage, not as the destination. The product should cover core contractor operating needs while going deeper for specialty flooring, resinous flooring, polished concrete, epoxy, coatings, and other surface

[excerpt truncated]

### docs/target-ia.md

# Contractor App Target Information Architecture

Status: Planned
Doc Type: Roadmap

This is target contractor app information architecture.

This document defines the **target information architecture** for the contractor app.

It is intended to guide future navigation, workspace structure, and route decisions without forcing an immediate refactor of the current application. It should be read alongside:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for what is implemented today
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity roadmap
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

This document describes the intended contractor app structure over time. It should not be read as the current route map or current implementation truth.

## Purpose

The contractor app is intended to become more **project-centered** over time while still supporting global lists, queues, and financial work areas.

This document exists to answer:

- what the contractor app top-level navigation should become
- what each top-level area is responsible for
- how projects act as the operational root in UX terms
- which standalone routes should still exist even in a project-centered system

## IA Principles

### 1. Project Is The Operational Root

Projects should become the main workspace for work delivery. Operational records such as estimates, jobs, files, daily execution, and invoices should feel connected to the project rather than like isolated modules.

That also means project detail should be the primary workflow and readiness hub in page-structure terms, while related record pages support that hub rather than competing with it as parallel workflow homes.

### 2. Customers Are Relationship Roots, Not Execution Roots

Customers remain important top-level records for CRM and account management, but operational execution should flow through projects.

### 3. Global Views Still Matter

Even in a project-centered system, some workflows are best handled through cross-project queues, global lists, and financial reporting surfaces.

### 4. Navigation Should Emphasize Major Work Areas

Top-level navigation should represent durable business domains, not every downstream record type.

### 5. Module Architecture Should Stay Compatible

This target IA should remain compatible with future organization-level module enable/disable controls. A module can be disabled without changing the underlying shared data model.

## Target Contractor App Top-Level Navigation

The target top-level contractor app navigation should be:

- Dashboard
- Growth, when the public acquisition layer becomes a durable contractor surface
- Customers
- Projects
- Financials
- People
- Field
- Documents
- Communications
- AI Assistant, if implemented as a durable top-level operating surface later
- Settings

This does **not** mean every section is fully implemented today. It defines the intended structure as the contractor app grows.

Future AI should also appear contextually inside Record Workspaces, communication threads, scheduling surfaces, and onboarding/support flows. A top-level AI Assistant may be useful for cross-record questions and approval queues, but contextual AI should remain the primary operating pattern for record-specific work.

## Future IA Coverage Notes

The target IA should leave room for future contractor operating depth without creating disconnected top-level silos.

- Field may eventually include inspections, punchlists, richer service/warranty, field checklists, closeout, and mobile-first capture. The first internal service ticket manager now exists at `/service-tickets`; the broader service/warranty architecture is planned in [docs/service-warranty-plan.md](C:/FloorConnector/docs/service-warranty-plan.md).
- Financials may eventually include purchase orders, bills/expenses, accounts payable, job costing, budget vs actual, retainage release depth, and earned value.
- Reports currently exists at `/reports` as a read-only operations and
  collections visibility route. It may remain a cross-project reporting
  workspace or be grouped with Financials/Operations as the IA matures, but the
  curren

[excerpt truncated]

### docs/chat-handoff.md

# Chat Handoff

Status: Active
Doc Type: Operational

This is a compact handoff for future Codex sessions. It is not a competing
source of truth. Use it to orient quickly, then verify implementation truth in
`docs/current-state.md`.

Use [docs/feature-build-status.md](C:/FloorConnector/docs/feature-build-status.md)
as an important planning reference when a task needs investor/demo/dev-friendly
feature inventory, status categories, or built-versus-planned boundaries.

Use [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md)
when a task needs the founder/product-owner build list, realistic completion
horizons, next build order, or Core Complete definition. It is planning
guidance over current truth, not a replacement for `docs/current-state.md`.

Use [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md)
when a task involves parallel agents, worktrees, stream ownership, capability
waves, hotspot governance, merge sequencing, or QA/verification coordination.

## Required First Reads

Read these before implementation or documentation work:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md)
- [docs/feature-build-status.md](C:/FloorConnector/docs/feature-build-status.md)
- [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/README.md](C:/FloorConnector/docs/README.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)

## Current Operating Core Snapshot

FloorConnector is a production-first SaaS operating system for specialty
flooring contractors. The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The current branch has real Supabase-backed auth, tenancy, opportunities,
customers, projects, estimates, contracts, change orders, jobs, invoices,
payments, portal access, workforce/time/field foundations, settings,
super-admin foundations, and normalized contractor UI patterns.

Current operating-core surfaces include:

- Command Center dashboard with source-record attention groups and deterministic
  next moves.
- Project Workspace as the main continuity hub with ProjectPulse, FieldTrail,
  MessageCenter, CloseoutTrail, Proof Center, Project Command Timeline, Send
  Trail context, service/warranty continuity, customer access, and closeout
  package handoff.
- Project Command Timeline derives a compact needs-attention / ready-to-move /
  recent-movement rail from existing canonical project, opportunity, estimate,
  contract/signature, invoice/payment, job/schedule, Daily Log, field blocker,
  proof readiness, MessageCenter, and portal visibility signals. It is
  read-only presentation, not an activity source of truth or action executor.
- Project Workspace command-center polish adds a compact status/timeline/
  Copilot/action-lane map near the top and places Project Command Timeline
  before Copilot so the page reads as current status, what happened, what it
  means, and where to act. This is UI hierarchy over existing read models only.
- Project Workspace Maturity v1 further tightens `/projects/[projectId]` as the
  operational hub: the command summary names the current lifecycle position, a
  Readiness + Blockers panel links blockers back to canonical source records,
  and connected lanes split invoices, payments, field/Daily Logs, and
  time/labor while staying read-only over existing project, readiness, payment,
  job, Daily Log, field-note, and time-card records.
- Project Workspace Maturity v2 adds a shared
  `apps/web/lib/projects/operational-workspace.ts` read model and a project
  Operational Intelligence section. It derives one attention/continuity view
  over canonical readiness, invoices/payments, retainage, progress billing,
  CrewBoard jobs/assignments, Daily Logs, field blockers, change orders, and

[excerpt truncated]

### docs/system-overview.md

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

## Feature Coverage Direction

FloorConnector's implemented backbone already covers the core canonical chain from opportunity through payment, with workforce, field, portal, settings, super-admin, deterministic cues, and import/export foundations around it. The next product direction is not to copy Contractor Foreman feature-for-feature, but to cover serious contractor operating needs and then go deeper for specialty flooring and surface contractors.

Planned deeper contractor operations include equipment management, real time-card/clocking depth, bid/RFP management, subcontractor management, document/submittal/spec-sheet workflows, service/warranty, weather-aware schedule guidance, inspections/checklists, punchlists, takeoff/plans, procurement/materials/POs, bills/AP, job costing, budget vs actual, reporting, mobile field depth, and accounting integrations.

Another planned layer is Universal Capture + Assistant Action: an operating
surface for capturing callbacks, reminders, follow-ups, site-visit intent,
estimate scheduling needs, and route/geographic grouping intent from anywhere,
then resolving that intent into canonical records or approved handoffs. It is
not implemented today and must not become a duplicate task app, AI-only
scheduler, or second customer/project/opportunity system.

Future platform expansion may also include a trusted cross-contractor
collaboration layer where vetted or certified FloorConnector contractors can be
granted explicit project/job-scoped access for execution support. That direction
is not implemented today and must extend the canonical project/job chain rather
than create duplicate projects, duplicate jobs, a public marketplace, or
partner-owned copies of the same business records.

Those layers must preserve the data-management philosophy:

- one canonical lifecycle
- no duplicate business models
- no module-local silos
- no portal-only copies
- project-centered operational continuity
- workflow stages extend canonica

[excerpt truncated]
