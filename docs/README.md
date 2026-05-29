# Docs

Status: Active
Doc Type: Governance

Product, engineering, rollout, and archive documentation lives here.

Canonical repository notes:

- GitHub repo: `https://github.com/filamonte/v0-floor-connector.git`
- primary branch: `main`
- local workspace root: `C:\FloorConnector`
- local web app env source of truth: `C:\FloorConnector\.env.local`

## Start Here

Use these first for most implementation or documentation tasks:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md):
  primary development guardrails
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md):
  implemented truth on the current branch
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): canonical and
  near-term workflow behavior
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md):
  product and engineering synthesis
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md): compact
  current-session handoff
- [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md):
  parallel worktree, stream, capability-wave, governance, and QA operating
  manual for AI-native development
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md):
  protected-route browser QA recovery

## Local Worktree Dev Tools

`C:\FloorConnector` is the canonical local development source for ignored
tooling state. Active stream worktrees under `C:\FC-worktrees` should link back
to the main repo for `.env.local`, `node_modules`, `.turbo` when present, and
`playwright\.auth` when present. Workspace package `node_modules` folders under
`apps/*` and `packages/*` are also linked when they exist in the canonical repo.
Do not copy `.env.local` or duplicate `node_modules` per worktree.

Use:

```powershell
pnpm devtools:link
```

to verify or create missing links. If a worktree already has an incorrect
ignored local tool directory, use the explicit repair mode:

```powershell
pnpm devtools:link:fix
```

The script intentionally does not share build outputs such as `.next`, `dist`,
`coverage`, or `test-results`, and it does not replace existing real
`.env.local` files.

Use these shared worktree platform commands:

```powershell
pnpm worktree:doctor
pnpm worktree:status
pnpm worktree:reconcile
pnpm worktree:audit
pnpm worktree:create <name>
pnpm worktree:finish <name>
pnpm auth:refresh
pnpm codex:streams
pnpm codex:next
```

`pnpm worktree:doctor` verifies Node, pnpm, Corepack, shared links, developer
tools, and branch health from the current worktree. `pnpm worktree:status`
fetches origin and summarizes all active worktrees. `pnpm worktree:create
<name>` creates `stream/<name>` at `C:\FC-worktrees\<name>`, links shared
tools, and runs the doctor. `pnpm worktree:reconcile` is the standard morning
health check for upstream state, dirty worktrees, missing upstreams, and
branches behind main. `pnpm worktree:audit` verifies the registry and platform
files. `pnpm worktree:finish <name>` safely retires a completed worktree with
interactive confirmation. `pnpm auth:refresh` reruns the shared Playwright auth
setup and relinks the resulting auth state.

Use [active-worktrees.md](C:/FloorConnector/active-worktrees.md) as the local
registry for active parallel streams. Use
[.codex/worktree-rules.md](C:/FloorConnector/.codex/worktree-rules.md) as the
shared Codex operating standard for worktree sessions. Use
[.codex/parallel-development.md](C:/FloorConnector/.codex/parallel-development.md)
for branch, merge, conflict, and daily operating rhythm. Use
[.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)
for the current six-stream production-acceleration model and next prompt order.
Use [docs/architecture-coordination-drift-cleanup.md](C:/FloorConnector/docs/architecture-coordination-drift-cleanup.md)
for the May 29, 2026 registry-drift cleanup checkpoint and merge-risk guardrail.

Node is standardized through `package.json` `engines.node`, `packageManager`,
and `.node-version`. Use Node 20+ and Corepack so every worktree resolves the
same pnpm version.

Daily worktree rhythm:

- Morning: `pnpm worktree:reconcile`
- Before work: `pnpm worktree:doctor`
- After work: `git status --short --branch`, then commit completed slices
- Before merge: `pnpm worktree:doctor` and `pnpm worktree:reconcile`
- After merge: `pnpm worktree:finish <name>` when the stream is retired

## Required Active Docs

For most future work, treat this as the required active documentation set:

- Development guardrails: [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- Implemented truth: [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- Workflow behavior: [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- System synthesis: [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- Roadmap and IA direction: [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
  and [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- Current feature status: [docs/feature-build-status.md](C:/FloorConnector/docs/feature-build-status.md),
  [docs/module-status.md](C:/FloorConnector/docs/module-status.md), and
  [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md)
- Current operating handoff: [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- AI-native development operating model: [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md)
- Documentation rules: [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md)
  and [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)

Other docs are supporting references, focused evidence, planning context, or
archive material. They should not override `current-state.md`, and they should
be archived or removed when they stop serving one of those jobs.

## Implemented Truth And Guardrails

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of
  truth for implemented status
- [docs/feature-build-status.md](C:/FloorConnector/docs/feature-build-status.md):
  investor/demo/dev-friendly feature status inventory over current truth,
  planned depth, and strategic future layers
- [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md):
  concise platform maturity framing
- [docs/module-status.md](C:/FloorConnector/docs/module-status.md): concise
  module status table
- [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md): important depth
  gaps around the implemented core
- [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md):
  stable architecture principles
- [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md):
  canonical record chain and lineage rules
- [docs/financial-architecture.md](C:/FloorConnector/docs/financial-architecture.md):
  financial record and event guardrails
- [docs/portal-architecture.md](C:/FloorConnector/docs/portal-architecture.md):
  portal shared-record guardrails
- [docs/security-threat-model.md](C:/FloorConnector/docs/security-threat-model.md):
  tenant isolation, auth, provider, export/import, and service-role threat model

## Product And Workflow Direction

- [docs/vision.md](C:/FloorConnector/docs/vision.md): long-term product thesis
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): sequencing guidance,
  not implementation truth
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor
  app IA, not current route reality
- [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md):
  future platform expansion direction
- [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md):
  strategic build-priority registry
- [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md):
  build-stage discipline
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md):
  approved user-facing product terms
- [docs/product-language-audit.md](C:/FloorConnector/docs/product-language-audit.md):
  terminology audit history
- [docs/floorconnector-full-capability-audit.md](C:/FloorConnector/docs/floorconnector-full-capability-audit.md):
  repo-truth capability audit
- [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md):
  founder/product-owner build list, completion horizons, immediate build order,
  Core Complete definition, and risk guardrails
- [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md):
  AI-native multi-agent development operating manual covering worktrees, build
  streams, capability waves, merge governance, hotspot ownership, and
  QA/verification coordination
- [docs/future-feature-coverage-map.md](C:/FloorConnector/docs/future-feature-coverage-map.md):
  broad future coverage map
- [docs/contractor-foreman-gap-decision-list.md](C:/FloorConnector/docs/contractor-foreman-gap-decision-list.md):
  owner feature coverage decisions
- [docs/ai-operational-copilot-foundation.md](C:/FloorConnector/docs/ai-operational-copilot-foundation.md):
  implemented deterministic AI Operational Copilot foundation and review-first
  intelligence boundaries

## Operating Core Feature Docs

Current operating-core implementation notes and QA checkpoints live mostly in
[docs/design/](C:/FloorConnector/docs/design). Use them as implementation
history and focused evidence, not as replacements for `current-state.md`.

High-signal operating-core docs:

- [docs/design/operating-core-checkpoint.md](C:/FloorConnector/docs/design/operating-core-checkpoint.md):
  post-expansion checkpoint and next-build recommendation
- [docs/design/next-build-priority-checkpoint.md](C:/FloorConnector/docs/design/next-build-priority-checkpoint.md):
  current next-build priority ranking after operating-core, staging, and Company
  Documents work
- [docs/design/operational-capability-waves-v1-coordination.md](C:/FloorConnector/docs/design/operational-capability-waves-v1-coordination.md):
  planning-only coordination index for Project Workspace, Scheduling,
  Field/Mobile, and Portal Capability Wave v1 sequencing and shared hotspots
- [docs/architecture-coordination-health-report.md](C:/FloorConnector/docs/architecture-coordination-health-report.md):
  architecture coordination audit for active production-acceleration streams,
  canonical workflow health, drift findings, and merge-readiness backlog
- [docs/architecture-coordination-drift-cleanup.md](C:/FloorConnector/docs/architecture-coordination-drift-cleanup.md):
  docs/governance cleanup checkpoint that pins the six active streams,
  paused/legacy stream handling, and registry/tooling merge-risk guardrails
- [docs/design/project-workspace-capability-wave-v1.md](C:/FloorConnector/docs/design/project-workspace-capability-wave-v1.md):
  planning-only Project Workspace Capability Wave v1 maturity plan
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md):
  focused helper and route validation inventory
- [docs/design/crewboard-phase-1.md](C:/FloorConnector/docs/design/crewboard-phase-1.md)
  and
  [docs/design/crewboard-phase-2-dispatch-usability.md](C:/FloorConnector/docs/design/crewboard-phase-2-dispatch-usability.md):
  CrewBoard on `/schedule`
- [docs/design/scheduling-capability-wave-v1.md](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md):
  planning-only Scheduling Capability Wave v1 assessment for CrewBoard
  maturity, derived queues, resource-load visibility, conflict depth, mobile
  queue polish, and QA hardening without new scheduling or dispatch tables
- [docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md](C:/FloorConnector/docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md):
  planning-only drag/drop scheduling and dispatch interaction spec for
  CrewBoard
- [docs/design/crewboard-phase-3a-confirmed-schedule-move.md](C:/FloorConnector/docs/design/crewboard-phase-3a-confirmed-schedule-move.md):
  implemented confirmation-first manual schedule movement on CrewBoard
- [docs/design/crewboard-phase-3a-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3a-qa-checkpoint.md):
  QA checkpoint for confirmed schedule moves, helper coverage, and browser
  caveats
- [docs/design/crewboard-phase-3b-drag-drop-technical-spike.md](C:/FloorConnector/docs/design/crewboard-phase-3b-drag-drop-technical-spike.md):
  planning-only pointer drag/drop technical spike recommending a no-package
  proposed-move slice before any approved `@dnd-kit/core` implementation
- [docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md](C:/FloorConnector/docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md):
  implemented no-package proposed-move helpers, URL-backed prepared target
  state, inert target metadata, and `Prepare move` preview wiring for CrewBoard
- [docs/design/crewboard-phase-3b-a-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3b-a-qa-checkpoint.md):
  QA checkpoint for CrewBoard proposed-move helpers, URL-backed prepared move
  state, inert target metadata, manual flow preservation, and auth-limited
  browser QA
- [docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md):
  final pre-implementation checklist for approved future pointer drag/drop,
  recommending `@dnd-kit/core` only for the implementation slice while keeping
  Move schedule confirmation as the write boundary
- [docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md):
  implemented pointer drag/drop preview layer that prepares the existing Move
  schedule confirmation flow without saving on drop
- [docs/design/crewboard-phase-3b-b-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-qa-checkpoint.md):
  QA checkpoint for the CrewBoard drag/drop preview dependency, client boundary,
  validation stack, and auth-limited browser smoke
- [docs/design/scheduling-capability-wave-v1.md](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md):
  planning-only Scheduling Capability Wave v1 assessment for CrewBoard
  maturity, derived queues, resource-load visibility, conflict depth, mobile
  queue polish, and QA hardening without new scheduling or dispatch tables
- [docs/design/fieldtrail-phase-1-project-execution-timeline.md](C:/FloorConnector/docs/design/fieldtrail-phase-1-project-execution-timeline.md):
  FieldTrail over existing field records
- [docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md](C:/FloorConnector/docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md)
  and
  [docs/design/mobile-field-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-1-qa-checkpoint.md):
  mobile Daily Job Log capture
- [docs/design/mobile-field-phase-2-quick-job-notes-evidence.md](C:/FloorConnector/docs/design/mobile-field-phase-2-quick-job-notes-evidence.md):
  quick Job Notes, blockers, and field evidence capture using existing Daily
  Job Logs
- [docs/design/mobile-field-phase-2-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-2-qa-checkpoint.md):
  QA checkpoint for Mobile Field Phase 2 boundaries, anchors, mobile smoke, and
  protected-route auth limitations
- [docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md](C:/FloorConnector/docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md):
  planning spec for field evidence upload, storage readiness, proof flow, and
  portal/customer boundaries
- [docs/design/mobile-field-phase-3a-evidence-storage-readiness.md](C:/FloorConnector/docs/design/mobile-field-phase-3a-evidence-storage-readiness.md):
  storage readiness audit for private field evidence upload pathing, signed URL
  boundaries, delete/archive policy, and portal-dark implementation sequencing
- [docs/design/mobile-field-phase-3c-evidence-upload-foundation.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-evidence-upload-foundation.md):
  implemented contractor-side field evidence upload foundation using existing
  Daily Job Logs, Job Notes, execution attachments, and the private `documents`
  bucket
- [docs/design/mobile-field-phase-3c-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-qa-checkpoint.md):
  QA checkpoint for private field evidence upload boundaries, validation,
  read-model integration, portal exclusion, and mobile Daily Log smoke
- [docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md):
  planning spec for contractor-only field evidence preview using short-lived
  signed URLs, with portal/customer exclusion and no thumbnails, delete/archive,
  schema, or storage-policy changes
- [docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md):
  implemented contractor-only Daily Log evidence preview/open links using
  one-hour signed URLs resolved by execution attachment id from the private
  `documents` bucket, with portal/customer exclusion and no thumbnails,
  delete/archive, schema, migrations, or storage-policy changes
- [docs/design/mobile-field-phase-3d-a-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-a-qa-checkpoint.md):
  QA checkpoint for contractor-only field evidence preview links, signed URL
  boundaries, Daily Log / Job Note parent validation, portal exclusion, and
  remaining real-evidence browser QA follow-up
- [docs/design/mobile-field-phase-3e-evidence-archive-delete-policy.md](C:/FloorConnector/docs/design/mobile-field-phase-3e-evidence-archive-delete-policy.md):
  field evidence archive/delete policy and current Phase 3E-A implementation
  note, recording metadata archive/restore as implemented while deferring
  storage hard-delete and cleanup jobs until retention, audit, and owner/admin
  delete rules are approved
- [docs/design/field-mobile-capability-wave-v1.md](C:/FloorConnector/docs/design/field-mobile-capability-wave-v1.md):
  planning-only Field/Mobile Capability Wave v1 plan for mobile-first execution
  usability over existing jobs, Daily Logs, Field Notes, execution attachments,
  people, vendors, and time records
- [docs/design/supabase-field-evidence-storage-verification.md](C:/FloorConnector/docs/design/supabase-field-evidence-storage-verification.md):
  read-only Supabase storage readiness verification for field evidence,
  confirming the intended FloorConnector project, relevant remote migrations,
  `public.execution_attachments` with RLS, and storage schema visibility while
  recording that direct live bucket-row/policy-SQL proof still requires
  separately approved read-only SQL inspection
- [docs/design/messagecenter-phase-1-project-communication-timeline.md](C:/FloorConnector/docs/design/messagecenter-phase-1-project-communication-timeline.md):
  MessageCenter over communication and proof records
- [docs/design/projectpulse-phase-1-project-health-summary.md](C:/FloorConnector/docs/design/projectpulse-phase-1-project-health-summary.md):
  ProjectPulse health and Next Move summary
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md):
  CloseoutTrail
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md):
  Proof Center
- [docs/design/warranty-service-phase-1-workspace-depth.md](C:/FloorConnector/docs/design/warranty-service-phase-1-workspace-depth.md)
  and
  [docs/design/warranty-service-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/warranty-service-phase-1-qa-checkpoint.md):
  Service Center and warranty/service continuity
- [docs/design/global-search-hardening.md](C:/FloorConnector/docs/design/global-search-hardening.md):
  shell-level global search hardening

## Portal And Customer Docs

- [docs/portal-architecture.md](C:/FloorConnector/docs/portal-architecture.md):
  portal shared-record architecture
- [docs/design/portal-maturity-phase-1-customer-project-window.md](C:/FloorConnector/docs/design/portal-maturity-phase-1-customer-project-window.md):
  Customer Next Step
- [docs/design/portal-maturity-phase-2-project-status-window.md](C:/FloorConnector/docs/design/portal-maturity-phase-2-project-status-window.md):
  Project Status Window
- [docs/design/portal-maturity-phase-3-project-timeline.md](C:/FloorConnector/docs/design/portal-maturity-phase-3-project-timeline.md):
  Project Timeline
- [docs/design/portal-maturity-phase-4-shared-documents.md](C:/FloorConnector/docs/design/portal-maturity-phase-4-shared-documents.md):
  Shared Documents
- [docs/design/portal-maturity-phase-4-qa-customer-window.md](C:/FloorConnector/docs/design/portal-maturity-phase-4-qa-customer-window.md):
  customer window QA checkpoint
- [docs/design/portal-customer-next-step-qa-checkpoint.md](C:/FloorConnector/docs/design/portal-customer-next-step-qa-checkpoint.md):
  Customer Next Step QA
- [docs/design/portal-capability-wave-v1.md](C:/FloorConnector/docs/design/portal-capability-wave-v1.md):
  planning-only Portal Capability Wave v1 plan for customer-safe project,
  commercial, payment, evidence, and next-action continuity over canonical
  records

## Financial And Reporting Docs

- [docs/financial-architecture.md](C:/FloorConnector/docs/financial-architecture.md):
  financial record/event guardrails
- [docs/design/reporting-phase-1-operations-collections-visibility.md](C:/FloorConnector/docs/design/reporting-phase-1-operations-collections-visibility.md):
  Reports Phase 1
- [docs/design/financial-control-phase-1-collections-payment-attention.md](C:/FloorConnector/docs/design/financial-control-phase-1-collections-payment-attention.md)
  and
  [docs/design/financial-control-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/financial-control-phase-1-qa-checkpoint.md):
  Financial Control
- [docs/design/accounting-readiness-phase-1-export-reconciliation-prep.md](C:/FloorConnector/docs/design/accounting-readiness-phase-1-export-reconciliation-prep.md):
  Accounting Readiness
- [docs/design/accounting-export-prep-phase-1.md](C:/FloorConnector/docs/design/accounting-export-prep-phase-1.md)
  and
  [docs/design/accounting-export-prep-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/accounting-export-prep-phase-1-qa-checkpoint.md):
  Accounting Export Prep
- [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md):
  test-mode SaaS billing runbook
- [docs/saas-billing-live-launch-plan.md](C:/FloorConnector/docs/saas-billing-live-launch-plan.md):
  live SaaS billing planning boundary

## Document, Staging, And Demo Docs

Document and closeout:

- [docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md](C:/FloorConnector/docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md):
  Send Trail
- [docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md):
  delivery proof architecture
- [docs/design/document-engine-phase-1-pdf-export-foundations.md](C:/FloorConnector/docs/design/document-engine-phase-1-pdf-export-foundations.md):
  Document Engine Phase 1
- [docs/design/document-engine-phase-2-plan.md](C:/FloorConnector/docs/design/document-engine-phase-2-plan.md):
  closeout package planning
- [docs/design/document-engine-phase-2a-closeout-package-print-route.md](C:/FloorConnector/docs/design/document-engine-phase-2a-closeout-package-print-route.md):
  contractor closeout package print route
- [docs/design/document-engine-qa-checkpoint.md](C:/FloorConnector/docs/design/document-engine-qa-checkpoint.md):
  Document Engine QA
- [docs/design/business-documents-phase-1-company-library-plan.md](C:/FloorConnector/docs/design/business-documents-phase-1-company-library-plan.md):
  Company Document Library planning
- [docs/design/company-documents-schema-readiness-audit.md](C:/FloorConnector/docs/design/company-documents-schema-readiness-audit.md)
  and
  [docs/design/company-documents-migration-readiness-audit.md](C:/FloorConnector/docs/design/company-documents-migration-readiness-audit.md):
  future Company Documents schema/migration readiness
- [docs/design/company-documents-phase-1a-schema-settings-library.md](C:/FloorConnector/docs/design/company-documents-phase-1a-schema-settings-library.md):
  implemented Company Documents Phase 1A schema and settings library checkpoint
- [docs/design/company-documents-phase-1b-view-print.md](C:/FloorConnector/docs/design/company-documents-phase-1b-view-print.md):
  implemented Company Documents Phase 1B contractor read and print/save view
- [docs/design/company-documents-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/company-documents-phase-1-qa-checkpoint.md):
  focused QA checkpoint for Company Documents Phase 1A and Phase 1B
- [docs/design/company-documents-phase-1c-starter-documents-plan.md](C:/FloorConnector/docs/design/company-documents-phase-1c-starter-documents-plan.md):
  planning-only Company Documents Starter Documents adoption model
- [docs/design/company-documents-phase-1c-a-starter-adoption.md](C:/FloorConnector/docs/design/company-documents-phase-1c-a-starter-adoption.md):
  implemented code-defined Starter Documents preview and draft-copy adoption
- [docs/design/company-documents-starter-adoption-qa-checkpoint.md](C:/FloorConnector/docs/design/company-documents-starter-adoption-qa-checkpoint.md):
  focused QA checkpoint for Company Documents Starter Document adoption

Demo and staging:

- [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md):
  route-based operating-core demo path over real records
- [docs/staging-deployment-readiness-audit.md](C:/FloorConnector/docs/staging-deployment-readiness-audit.md):
  staging deployment readiness audit
- [docs/staging-owner-runbook.md](C:/FloorConnector/docs/staging-owner-runbook.md):
  owner-controlled staging runbook
- [docs/staging-demo-readiness.md](C:/FloorConnector/docs/staging-demo-readiness.md):
  earlier staging/demo readiness runbook
- [docs/demo/staging-demo-data-plan.md](C:/FloorConnector/docs/demo/staging-demo-data-plan.md):
  live workflow readiness plan and no-write inventory checklist
- [docs/demo/staging-demo-seed-script-spec.md](C:/FloorConnector/docs/demo/staging-demo-seed-script-spec.md):
  dry-run specification, Phase 1 no-write seed planner command, and Phase 2A
  read-only target validation command
- [docs/demo/staging-demo-seed-write-mode-design.md](C:/FloorConnector/docs/demo/staging-demo-seed-write-mode-design.md):
  historical/future write-mode gates and refusal rules; not current demo policy
- [docs/design/staging-demo-seed-phase-1-dry-run-script.md](C:/FloorConnector/docs/design/staging-demo-seed-phase-1-dry-run-script.md):
  implemented dry-run seed planner checkpoint
- [docs/design/staging-demo-seed-phase-2a-validate-target-read-only.md](C:/FloorConnector/docs/design/staging-demo-seed-phase-2a-validate-target-read-only.md):
  implemented read-only target validation checkpoint
- [docs/design/staging-demo-seed-phase-2a-qa-checkpoint.md](C:/FloorConnector/docs/design/staging-demo-seed-phase-2a-qa-checkpoint.md):
  QA checkpoint for the read-only target validation mode and preserved no-write
  seed boundaries
- [docs/design/supabase-field-evidence-storage-verification.md](C:/FloorConnector/docs/design/supabase-field-evidence-storage-verification.md):
  read-only storage verification for Mobile Field evidence, with the intended
  Supabase project now visible and live bucket-row/policy-SQL proof still
  requiring separately approved read-only SQL inspection

## Validation And QA

- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md):
  focused operating-core tests and browser caveats
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md):
  local auth state recovery
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md):
  browser QA setup and caveats
- [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md):
  internal QA workflow checklist
- [docs/design/operating-core-runtime-qa-checkpoint.md](C:/FloorConnector/docs/design/operating-core-runtime-qa-checkpoint.md):
  operating-core runtime QA checkpoint
- [docs/design/operating-core-demo-smoke-checkpoint.md](C:/FloorConnector/docs/design/operating-core-demo-smoke-checkpoint.md):
  route-discovery demo smoke checkpoint
- [docs/design/public-demo-readiness-qa.md](C:/FloorConnector/docs/design/public-demo-readiness-qa.md):
  public/demo readiness QA

## Design System And UX

- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md):
  current Graphite/Copper implementation reference
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md):
  mandatory contractor UI build rules
- [docs/ui-system.md](C:/FloorConnector/docs/ui-system.md): contractor UI
  guardrails
- [docs/ui-patterns.md](C:/FloorConnector/docs/ui-patterns.md): implemented
  decision-first UI patterns
- [docs/enterprise-ui-system-audit.md](C:/FloorConnector/docs/enterprise-ui-system-audit.md):
  secured-app route audit and drift watch
- [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md):
  customer/contact/access/review ownership map
- [docs/design/stitch/README.md](C:/FloorConnector/docs/design/stitch/README.md):
  Google Stitch artifact boundary and adoption rules

## AI, Communications, Automation, And Integrations

These are planning/reference docs unless `current-state.md` says a slice is
implemented:

- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md)
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md)
- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md)
- [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md)
- [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md)
- [docs/gatekeeper-system-vision.md](C:/FloorConnector/docs/gatekeeper-system-vision.md)
- [docs/gatekeeper-source-adapters.md](C:/FloorConnector/docs/gatekeeper-source-adapters.md)
- [docs/gatekeeper-controlled-action-bridge.md](C:/FloorConnector/docs/gatekeeper-controlled-action-bridge.md)
- [docs/gatekeeper-controlled-execution-readiness-audit.md](C:/FloorConnector/docs/gatekeeper-controlled-execution-readiness-audit.md)
- [docs/gatekeeper-create-opportunity-controlled-execution-plan.md](C:/FloorConnector/docs/gatekeeper-create-opportunity-controlled-execution-plan.md)
- [docs/gatekeeper-create-opportunity-execution-implementation-plan.md](C:/FloorConnector/docs/gatekeeper-create-opportunity-execution-implementation-plan.md)
- [docs/gatekeeper-phase-1-demo-script.md](C:/FloorConnector/docs/gatekeeper-phase-1-demo-script.md)
- [docs/gatekeeper-schedule-site-assessment-controlled-execution-plan.md](C:/FloorConnector/docs/gatekeeper-schedule-site-assessment-controlled-execution-plan.md)
- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md)
- [docs/ai-marketing-and-onboarding.md](C:/FloorConnector/docs/ai-marketing-and-onboarding.md)
- [docs/design/agentic-operations-docs-ownership-checkpoint.md](C:/FloorConnector/docs/design/agentic-operations-docs-ownership-checkpoint.md):
  checkpoint for the Agentic Operations docs ownership map and guardrails

## AI, Automation, And Agentic Documentation Ownership

Use this map to keep strategic AI direction, implemented truth, deterministic
automation, and lower-level guidance docs from drifting into competing sources
of authority.

| Document                                                                                                                                                                      | Owns                                                                                                                              | Does Not Own                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md)                                                                                        | Long-term strategic AI/agentic direction; canonical-record-first, permissioned, auditable, human-governed future operating layer. | Implemented truth, near-term execution scope, or duplicate AI business models. |
| [docs/current-state.md](C:/FloorConnector/docs/current-state.md)                                                                                                              | Implemented reality only. It may state that full autonomous/agentic AI is not implemented.                                        | Future strategy, roadmap promises, or target behavior as shipped capability.   |
| [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)                                                                                      | Day-to-day implementation guardrails, including compact AI/agentic safety rules.                                                  | Detailed agent families, long-term AI architecture, or roadmap sequencing.     |
| [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)                                                                                                                | Compact session-start orientation and current guardrails.                                                                         | Full strategic ownership or implementation planning.                           |
| [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md)                                                                                                        | Deterministic workflow automation, triggers, reminders, queues, and readiness-driven operational automation.                      | Autonomous AI strategy or AI-owned workflow truth.                             |
| [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md)                                                                                                | Canonical communication infrastructure and record-linked messaging.                                                               | Separate AI message stores or the full AI strategy.                            |
| [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md)                                                                                              | Operational metrics, reporting, and visibility from canonical evidence.                                                           | AI strategy, agent autonomy, or disconnected analytics truth.                  |
| [docs/workflows.md](C:/FloorConnector/docs/workflows.md)                                                                                                                      | Current and near-term business workflow behavior.                                                                                 | Separate AI workflows outside canonical transitions and readiness gates.       |
| [docs/workflow-state-machine.md](C:/FloorConnector/docs/workflow-state-machine.md) and [docs/workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md)                       | Deterministic workflow states, transitions, blockers, gates, and guided journey rules.                                            | Agentic strategy or permission to bypass workflow gates.                       |
| [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md) and [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md) | Sequencing, dependency, and maturity framing.                                                                                     | Detailed AI execution design or implemented-status claims.                     |
| [docs/vision.md](C:/FloorConnector/docs/vision.md)                                                                                                                            | High-level product thesis.                                                                                                        | Detailed agent families, action architecture, or governance requirements.      |
| [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)                                                                                                                          | Sequencing and staged roadmap posture.                                                                                            | Implemented truth or near-term displacement by agentic autonomy.               |
| GateKeeper docs                                                                                                                                                               | GateKeeper memory, source-adapter, review, and controlled-action bridge boundaries.                                               | Umbrella AI strategy or autonomous workflow authority.                         |
| AI-focused workflow docs                                                                                                                                                      | Lower-level AI assistant, guided system, intake, scheduling, onboarding, or follow-up planning.                                   | The umbrella Agentic Operations strategy or current-state truth.               |

## Feature Planning Reference

These docs are useful for future scoped work, but they are not implemented truth
unless `current-state.md` confirms the capability:

- [docs/import-export-readiness.md](C:/FloorConnector/docs/import-export-readiness.md)
- [docs/site-visit-scope-intake-plan.md](C:/FloorConnector/docs/site-visit-scope-intake-plan.md)
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md)
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md)
- [docs/estimate-builder-system-generation-spec.md](C:/FloorConnector/docs/estimate-builder-system-generation-spec.md)
- [docs/inventory-cost-architecture.md](C:/FloorConnector/docs/inventory-cost-architecture.md)
- [docs/equipment-management-plan.md](C:/FloorConnector/docs/equipment-management-plan.md)
- [docs/equipment-maintenance-utilization-plan.md](C:/FloorConnector/docs/equipment-maintenance-utilization-plan.md)
- [docs/clocking-system-plan.md](C:/FloorConnector/docs/clocking-system-plan.md)
- [docs/service-warranty-plan.md](C:/FloorConnector/docs/service-warranty-plan.md)
- [docs/warranty-document-system-plan.md](C:/FloorConnector/docs/warranty-document-system-plan.md)
- [docs/field-operations-architecture-map.md](C:/FloorConnector/docs/field-operations-architecture-map.md)
- [docs/contractor-collaboration-network.md](C:/FloorConnector/docs/contractor-collaboration-network.md)
- [docs/starter-pack-provisioning-plan.md](C:/FloorConnector/docs/starter-pack-provisioning-plan.md)
- [docs/starter-pack-provisioning-execution-readiness.md](C:/FloorConnector/docs/starter-pack-provisioning-execution-readiness.md)
- [docs/starter-pack-provisioning-review.md](C:/FloorConnector/docs/starter-pack-provisioning-review.md)

## Governance And Archive

- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md):
  documentation maintenance and archival rules
- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md):
  metadata, status vocabulary, ADR/diagram rules, and update expectations
- [docs/documentation-audit.md](C:/FloorConnector/docs/documentation-audit.md):
  previous documentation bloat and archive-readiness audit
- [docs/design/documentation-governance-cleanup.md](C:/FloorConnector/docs/design/documentation-governance-cleanup.md):
  latest operating-core/staging docs cleanup checkpoint
- [docs/archive/README.md](C:/FloorConnector/docs/archive/README.md):
  archive index
- [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md): architecture
  decision records
- [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md):
  Mermaid architecture and workflow diagrams
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md):
  AI-assisted development and documentation interpretation rules

Current documentation focus:

- keep `developer-source-of-truth.md` as the primary development entry point
- keep implemented truth in `current-state.md`
- keep workflow guidance in `workflows.md`
- keep long-term direction in `vision.md`, `Roadmap.md`, `target-ia.md`, and
  future-coverage docs
- keep `chat-handoff.md` compact
- keep staging/demo docs grouped under `docs/demo/` plus the owner runbooks
- move clearly superseded planning docs into `docs/archive/` instead of
  deleting them
- remove redundant pointer files and local agent scratch plans that do not
  preserve product, architecture, QA, setup, governance, or repo-operation
  context
