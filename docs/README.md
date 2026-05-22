# Docs

Status: Active
Doc Type: Governance

Product, engineering, and rollout documentation lives here.

Canonical repository notes:

- GitHub repo: `https://github.com/filamonte/v0-floor-connector.git`
- primary branch: `main`
- local workspace root: `C:\FloorConnector`
- local web app env source of truth: `C:\FloorConnector\.env.local`

Current foundation priorities to document as the repo grows:

- Google-first authentication with email/password fallback
- package ownership and shared boundaries
- Supabase migration and RLS workflow
- environment setup and operational checks
- modular contractor settings and super-admin boundaries
- platform defaults versus organization-owned copies and overrides
- future Templates & Systems administration for document templates, System Templates, add-ons/options, and sharing/review controls
- future UI, directory/contact, tax, Estimate Editor, workflow-guidance, and project-address alignment before broader demo/investor polish

Environment notes:

- Local `.env.local` files should use valid localhost URLs including `http://`.
- Vercel environment variables should use the live production domains including `https://`.
- Moving from local to live should be an environment-variable change, not a code change.

Available setup guides:

- `docs/auth-setup.md` for the planned shared auth model, Google-first plus email/password support, redirect URL expectations, and local auth verification routes.
- `docs/local-auth-qa-recovery.md` for recovering local protected-route browser QA when Supabase Auth rate limits, stale Playwright storage state, or stale fixed fixture IDs block detail-route verification.

Document roles:

- `docs/developer-source-of-truth.md`: primary entry point for day-to-day development guardrails
- `docs/documentation-standards.md`: doc layers, metadata, status vocabulary, ADR/diagram rules, and update expectations
- `docs/documentation-governance.md`: documentation system rules, archival policy, and doc update expectations
- `docs/documentation-audit.md`: latest documentation bloat, overlap, active-doc, split, and archive-readiness audit
- `docs/platform-maturity.md`: concise platform maturity framing
- `docs/module-status.md`: concise module status table
- `docs/known-gaps.md`: important depth gaps around the implemented core
- `docs/architecture-principles.md`: stable platform architecture principles
- `docs/canonical-lifecycle.md`: canonical record chain and lineage rules
- `docs/platform-philosophy.md`: stable product/engineering philosophy
- `docs/ui-system.md`: current contractor UI guardrails
- `docs/graphite-copper-ui-system.md`: implementation reference for the current Graphite / Copper enterprise UI system across contractor, portal, super-admin, and settings surfaces
- `docs/design/stitch/README.md`: Google Stitch artifact boundary and adoption rules; design reference only, not implemented status
- `docs/design/stitch/industrial-contrast-DESIGN.md`: curated Stitch Industrial Contrast / Graphite + Copper design summary; design reference only, not implemented status
- `docs/design/floorconnector-visual-system-evolution.md`: bridge between Stitch inspiration and FloorConnector's canonical UI/workflow guardrails; design guidance only, not implemented status
- `docs/design/stitch/phase-2-token-dashboard-audit.md` through `docs/design/stitch/phase-10-visual-qa-sweep-and-consolidation.md`: Stitch adoption phase logs and QA evidence; implementation history/reference only, not product capability truth
- `docs/design/crewboard-phase-1.md`: implementation note for the first CrewBoard scheduling workspace on the existing `/schedule` route
- `docs/design/crewboard-phase-2-dispatch-usability.md`: implementation note for CrewBoard dispatch usability, date navigation, schedule warnings, and schedule detail on the existing `/schedule` route
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`: implementation note for the first FieldTrail project/job execution timeline over existing daily logs, field notes, execution attachments, time cards, and jobs
- `docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md`: implementation note for the first mobile-focused Daily Job Log capture slice over existing Daily Logs, Job Notes, jobs, CrewBoard, and FieldTrail
- `docs/design/mobile-field-phase-1-qa-checkpoint.md`: focused QA checkpoint for Mobile Field Phase 1 Daily Job Log capture, route checks, helper tests, and preserved field behavior
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`: implementation note for the first MessageCenter project communication timeline over existing communication threads/messages, Send Trail, Signature Trail, Payment Trail, and Customer Access context
- `docs/design/projectpulse-phase-1-project-health-summary.md`: implementation note for the first ProjectPulse project health and Next Move summary over existing readiness, scheduling, field, communication, billing, payment, and signature signals
- `docs/design/project-workspace-os-consolidation-qa.md`: consolidation QA note for Project Workspace copy, hierarchy, browser QA, and Next Move terminology after CrewBoard, FieldTrail, MessageCenter, and ProjectPulse
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`: implementation note for the first CloseoutTrail project closeout readiness and proof section over existing project, job, field, change-order, contract, invoice, payment, warranty/service, and Customer Access signals
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`: implementation note for the first Proof Center project document and evidence index over existing commercial, customer-action, billing, field, warranty, service, and Customer Access records
- `docs/design/warranty-service-phase-1-workspace-depth.md`: implementation note for the first Service Center summary and Warranty/Service workspace-depth pass over existing service tickets, warranty documents, project proof, closeout, and service-job records
- `docs/design/warranty-service-phase-1-qa-checkpoint.md`: focused QA checkpoint for Warranty Service Phase 1 Service Center continuity, browser-QA caveats, preserved behavior, and follow-up candidates
- `docs/design/portal-maturity-phase-1-customer-project-window.md`: portal maturity audit and implementation note for the read-only customer Project Workspace Customer Next Step helper
- `docs/design/reporting-phase-1-operations-collections-visibility.md`: implementation note for the first read-only Reports operations and collections visibility workspace over existing project, job, contract, field, invoice, payment, closeout, and proof signals
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`: implementation note for the first Send Trail document delivery proof visibility pass over existing document delivery, signature, payment, portal view, and communication evidence
- `docs/design/operating-core-checkpoint.md`: post Trail Systems checkpoint for current-state, roadmap, workflow, language, validation, and next-build recommendation after the operating-core expansion
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`: implementation note for the first shared Document Engine print/save PDF foundation over existing estimate, contract, and invoice source records
- `docs/design/document-engine-phase-2-plan.md`: planning note for the next
  Document Engine path, recommending a contractor-side Project Closeout Package
  HTML/print route before stored PDFs, portal downloads, or server PDF
  generation
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`: implementation note for the contractor-side Project Closeout Package print/save route generated from current project source records
- `docs/design/document-engine-qa-checkpoint.md`: focused QA checkpoint for Document Engine print/export routes, Project Closeout Package coverage, source-record boundaries, and validation evidence
- `docs/operating-core-validation-checklist.md`: focused validation inventory for recent operating-core summary helpers, routes, and browser QA caveats
- `docs/design/project-workspace-lifecycle-qa.md`: lifecycle QA note for the Project Workspace operating loop after CrewBoard, FieldTrail, MessageCenter, ProjectPulse, and CloseoutTrail
- `docs/enterprise-ui-system-audit.md`: secured-app route audit, Phase 1-4 polish history, drift watch list, and authenticated visual QA rules
- `docs/floorconnector-ui-build-rules.md`: mandatory contractor UI build rules, including the accepted Graphite & Copper visual foundation and shell/workspace guardrails
- `docs/design-system-comprehensive-prompt.md`: Graphite & Copper visual reference for targeted future UI work
- `docs/design-system-implementation-status.md`, `docs/graphite-copper-implementation.md`, and `docs/quick-reference-graphite-copper.md`: post-v0 visual-system status and quick token references
- `docs/financial-architecture.md`: financial record/event guardrails
- `docs/portal-architecture.md`: portal shared-record guardrails
- `docs/Architecture.md`: target system design
- `docs/Roadmap.md`: platform maturity roadmap
- `docs/platform-build-registry.md`: strategic build-priority registry for major planned platform systems
- `docs/platform-maturity-model.md`: build-stage discipline from foundation through autonomous maturity
- `docs/future-platform-expansion.md`: future platform expansion direction
- `docs/communications-layer.md`: future workflow-connected communication philosophy
- `docs/reporting-and-metrics.md`: canonical reporting and metrics philosophy
- `docs/automation-layer.md`: future deterministic workflow automation philosophy
- `docs/intelligence-layer.md`: future Contractor Intelligence, Network Intelligence, and Predictive/AI Intelligence strategy
- `docs/contractor-collaboration-network.md`: future trusted contractor
  collaboration network and approved partner/project-scoped access planning
- `docs/contractor-foreman-gap-decision-list.md`: owner feature coverage decisions from the Contractor Foreman baseline comparison
- `docs/future-feature-coverage-map.md`: broad future feature coverage map by operating area
- `docs/field-operations-architecture-map.md`: planning map for clocking, equipment, service/warranty, documents, daily logs, jobs, schedule, people, vendors, dashboard guidance, and future job costing
- `docs/clocking-system-plan.md`: planning for the real clocking/time-card workflow before GPS, payroll export, or job costing
- `docs/equipment-maintenance-utilization-plan.md`: planning for equipment maintenance, utilization, rental-return, and costing inputs after the registry and assignment/readiness foundations
- `docs/service-warranty-plan.md`: planning for service/warranty tickets as post-installation project/job continuity
- `docs/warranty-document-system-plan.md`: planning for seeded/custom warranty templates, PDF generation, send/review/signature, and canonical attachment
- `docs/current-state.md`: source of truth for implemented status
- `docs/workflows.md`: canonical business workflows and near-term workflow direction
- `docs/staging-demo-readiness.md`: staging/demo readiness runbook for env ownership, provider setup checklists, demo modes, and go/no-go gates
- `docs/site-visit-scope-intake-plan.md`: planning guardrails for the lead site visit Scope Intake stage between appointment capture and estimate planning
- `docs/vision.md`: long-term product direction and platform thesis
- `docs/gatekeeper-system-vision.md`: target GateKeeper operational intelligence and communications doctrine; planning only, not implemented status
- `docs/gatekeeper-source-adapters.md`: provider-neutral GateKeeper source adapter boundary for future manual, phone, voice, transcription, chat, SMS/email, portal, internal-note, and support/onboarding sources
- `docs/gatekeeper-controlled-action-bridge.md`: planning boundary for future review-approved GateKeeper suggestions becoming explicit, audited canonical actions
- `docs/gatekeeper-controlled-execution-readiness-audit.md`: audit of whether GateKeeper is ready for first controlled execution, recommending `create_opportunity` as the first candidate only after missing safety layers are planned
- `docs/gatekeeper-create-opportunity-controlled-execution-plan.md`: detailed non-mutating plan for the future `create_opportunity` controlled execution bridge, including draft mapping, duplicate checks, audit/linkage, and canonical owner boundaries
- `docs/gatekeeper-create-opportunity-execution-implementation-plan.md`: refreshed implementation-ready plan for the first future real `create_opportunity` execution service using the actual ledger/request path and Opportunities-owned creation boundary
- `docs/gatekeeper-phase-1-demo-script.md`: QA/demo runbook for the implemented GateKeeper Phase 1 path from manual/demo source through controlled `create_opportunity` execution and result linkage
- `docs/ai-assisted-operating-system.md`: target AI-assisted operating system strategy across contractor and FloorConnector-facing AI
- `docs/ai-contractor-workflows.md`: target contractor-side AI copilot, drafting, summaries, scheduling suggestions, and approval queues
- `docs/communications-and-ai-intake.md`: target unified communications, website AI chat/intake, AI receptionist, voice, missed-call, consent, and human handoff direction
- `docs/calendar-and-scheduling-intelligence.md`: target calendar, schedule, resource, external calendar sync, and AI scheduling direction
- `docs/ai-marketing-and-onboarding.md`: target FloorConnector-facing marketing, sales, onboarding, setup, support, activation, and import AI direction
- `docs/target-ia.md`: target contractor app navigation and workspace structure
- `docs/workflow-spec.md`: primary contractor workflow definition
- `docs/workflow-state-machine.md`: stages, blockers, and transition guidance
- `docs/system-inventory.md`: implemented/foundation/planned system inventory, including current template/catalog foundations and planned Templates & Systems administration
- `docs/security-threat-model.md`: security threat model for tenant isolation, auth, portal access, provider webhooks, exports/imports, and service-role boundaries
- `docs/starter-pack-provisioning-plan.md`: planning-only safety spec for future starter-pack provisioning approval, audit, conflict handling, idempotency, and void strategy
- `docs/starter-pack-provisioning-execution-readiness.md`: readiness review for starter-pack provisioning execution field mappings, lineage, transaction/RPC feasibility, and void-readiness foundations
- `docs/starter-pack-provisioning-review.md`: consolidated architecture/operator readiness review for the implemented starter-pack provisioning lifecycle before any real void action
- `docs/contractor-groups-plan.md`: planning/read-model guardrails for platform-owned contractor groups, assignment audit/history, and future non-enforcing segmentation use
- `docs/ui-data-model-alignment-backlog.md`: planning backlog for contractor UI consistency, module-page patterns, directory/contact direction, Estimate Editor polish, tax model alignment, workflow guidance, project address display, and later configurable module/dashboard views
- `docs/estimate-builder-build-plan.md`: long-lived Estimate Builder master blueprint
- `docs/estimate-builder-v1-scope.md`: constrained Estimate Builder V1 execution scope
- `docs/estimate-builder-system-generation-spec.md`: planning spec for future system-based estimate generation
- `docs/figma-redesign-brief.md`: exploratory workflow-first design brief for future Figma work
- `docs/archive/README.md`: archive index for historical planning/reference docs
- `docs/adr/README.md`: architecture decision record index
- `docs/diagrams/README.md`: Mermaid architecture and workflow diagrams
- `docs/ai/README.md`: AI-assisted development and documentation interpretation rules
- `docs/opportunity-model.md`: archived pointer to the historical opportunity planning doc
- `docs/opportunity-implementation-plan.md`: archived pointer to the historical opportunity rollout plan

## Documentation Layers

### Codex First Reads

Read these first for most implementation or documentation tasks:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/chat-handoff.md`

### Current Implementation Truth

- `docs/current-state.md` owns implemented truth.
- `docs/module-status.md`, `docs/platform-maturity.md`, `docs/known-gaps.md`, and `docs/floorconnector-full-capability-audit.md` provide concise status, maturity, gap, and audit views.

### Product Direction And Feature Coverage

- `docs/vision.md` describes long-term product philosophy.
- `docs/Roadmap.md` describes sequencing guidance without dates.
- `docs/platform-build-registry.md` tracks major planned systems, priorities, dependencies, maturity, and strategic rationale.
- `docs/platform-maturity-model.md` defines stage discipline so foundation systems are not treated as ready for intelligence, predictive AI, or autonomous behavior too early.
- `docs/target-ia.md` describes target contractor app IA and must not be read as route reality.
- `docs/future-platform-expansion.md` describes platform expansion direction.
- `docs/communications-layer.md` defines communication as workflow-connected, project-connected, and canonical-record-connected.
- `docs/reporting-and-metrics.md` defines canonical reporting and metrics as the foundation for dashboards, intelligence, benchmarking, and prediction.
- `docs/automation-layer.md` defines deterministic, readiness-aware, approval-governed automation as an extension of the canonical workflow chain.
- `docs/intelligence-layer.md` defines the future canonical-first Intelligence Layer, including tenant-scoped analytics, opt-in network benchmarking, and later predictive/AI intelligence.
- `docs/contractor-collaboration-network.md` defines future trusted
  contractor collaboration, approved partner relationships, and
  project/job-scoped access planning without duplicate jobs/projects or public
  marketplace behavior.
- `docs/gatekeeper-system-vision.md` describes GateKeeper as the future operational memory, communications, AI guidance, and continuity layer over canonical records.
- `docs/gatekeeper-source-adapters.md` defines the future provider-neutral ingestion boundary for GateKeeper source events before any vendor-specific adapter is implemented.
- `docs/gatekeeper-controlled-action-bridge.md` defines the future safety boundary between reviewable suggestions and explicit canonical workflow execution.
- `docs/gatekeeper-controlled-execution-readiness-audit.md` audits the first controlled execution candidate and records the missing safety layer before any real GateKeeper execution is built.
- `docs/gatekeeper-create-opportunity-controlled-execution-plan.md` defines the future `create_opportunity` execution contract and keeps the first real bridge owned by the canonical Opportunities workflow.
- `docs/gatekeeper-create-opportunity-execution-implementation-plan.md` refreshes the first real `create_opportunity` execution implementation plan after the ledger-backed draft, preflight, duplicate preview, and `execution_requested` state were implemented.
- `docs/gatekeeper-phase-1-demo-script.md` documents the repeatable QA/demo path for the implemented GateKeeper Phase 1 create-opportunity loop.
- `docs/gatekeeper-schedule-site-assessment-controlled-execution-plan.md` defines the planning-only controlled execution path for future `schedule_site_assessment`, recommending an Opportunities-owned site-assessment state update before appointment/job scheduling.
- `docs/contractor-foreman-gap-decision-list.md` records owner decisions from the Contractor Foreman baseline comparison.
- `docs/future-feature-coverage-map.md` is the broad future coverage map so roadmap/current-state do not become feature encyclopedias.
- `docs/product-language.md` defines the approved user-facing product terms that sit on top of the existing canonical architecture without renaming routes, schema, or internal models.
- `docs/design/operating-core-checkpoint.md` records the latest post-expansion
  audit and next-build recommendation.
- `docs/design/document-engine-phase-1-pdf-export-foundations.md` records the
  first shared Document Engine print/export foundation.
- `docs/design/document-engine-phase-2-plan.md` records the recommended next
  Document Engine sequence: Project Closeout Package print route first, portal
  downloads second, persisted artifact/version policy later.
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md` records
  the implemented contractor-side closeout package print route and its
  export-vs-delivery-proof boundary.
- `docs/design/document-engine-qa-checkpoint.md` records the focused
  post-Phase 2A print/export QA evidence and remaining portal/browser
  limitations.

### Workflow And System Architecture

- `docs/workflows.md` defines current and near-term workflow rules.
- `docs/system-overview.md` is a synthesis for product/engineering alignment.
- `docs/Architecture.md`, `docs/architecture-principles.md`, `docs/canonical-lifecycle.md`, `docs/financial-architecture.md`, and `docs/portal-architecture.md` define architecture and record-ownership guardrails.

### Design System And UX

- `docs/graphite-copper-ui-system.md` is the current protected-app, portal, super-admin, and settings UI implementation reference.
- `docs/design/stitch/README.md`, `docs/design/stitch/industrial-contrast-DESIGN.md`, and `docs/design/floorconnector-visual-system-evolution.md` document the Stitch Industrial Contrast adoption boundary and future visual-system direction. They are design guidance/reference docs, not implemented status docs.
- `docs/design/stitch/phase-2-token-dashboard-audit.md` through `docs/design/stitch/phase-10-visual-qa-sweep-and-consolidation.md` record the bounded Stitch adoption implementation and QA history. Use them as handoff evidence, not as replacements for `docs/current-state.md`.
- `docs/enterprise-ui-system-audit.md` records the secured-app visual audit and drift watch list.
- `docs/floorconnector-ui-build-rules.md` contains mandatory UI build rules.
- `docs/product-language.md` and `docs/product-language-audit.md` govern product naming and terminology. They are UX copy guidance, not schema, route, or domain-model rename instructions.
- `docs/design/operating-core-checkpoint.md` and `docs/operating-core-validation-checklist.md` capture the current operating-core audit, validation inventory, and recommended next build direction after CrewBoard, FieldTrail, MessageCenter, ProjectPulse, CloseoutTrail, Proof Center, Reports, and Send Trail.
- `docs/design/document-engine-phase-1-pdf-export-foundations.md` captures the current print/save PDF boundary for source-record document exports.
- `docs/design/document-engine-phase-2-plan.md` captures the planning boundary
  for closeout packages, portal downloads, storage, versioning, and future PDF
  generation.
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
  captures the implemented contractor-only closeout package print route.
- `docs/design/document-engine-qa-checkpoint.md` captures the focused
  Document Engine print route QA checkpoint after Phase 1, Phase 2A, and
  Project Workspace browser QA maintenance.
- `docs/design/mobile-field-phase-1-qa-checkpoint.md` captures the focused
  Mobile Field Phase 1 QA checkpoint for Daily Job Log capture, helper tests,
  browser route evidence, and skipped protected detail checks.

### AI Guidance And Planning

- `docs/ai/README.md` and `docs/ai/*.md` define AI-readable boundaries.
- `docs/gatekeeper-system-vision.md` is the first-class doctrine document for future GateKeeper communications, operational memory, workflow reinforcement, human approval queues, and multi-agent direction.
- `docs/gatekeeper-source-adapters.md` is the planning contract for future GateKeeper source ingestion and adapter anti-drift rules.
- `docs/gatekeeper-controlled-action-bridge.md` is the planning contract for future non-autonomous, audited suggestion execution handoffs.
- `docs/gatekeeper-controlled-execution-readiness-audit.md` is the current audit checkpoint for deciding whether `create_opportunity` can become the first controlled execution bridge after more safety planning.
- `docs/gatekeeper-create-opportunity-controlled-execution-plan.md` is the current non-mutating plan for the first future controlled execution candidate.
- `docs/gatekeeper-create-opportunity-execution-implementation-plan.md` is the current implementation-ready plan for the first future real `create_opportunity` controlled execution slice.
- `docs/gatekeeper-phase-1-demo-script.md` is the current QA/demo script for proving the Phase 1 controlled `create_opportunity` path end to end.
- `docs/gatekeeper-schedule-site-assessment-controlled-execution-plan.md` is the current planning note for the next controlled action candidate; it is documentation-only and does not add scheduling execution.
- `docs/ai-guided-system-plan.md` captures deterministic guidance to future AI boundaries.
- Future AI docs are planning/reference only unless `current-state.md` says otherwise.

### Governance And Archive

- `docs/documentation-standards.md` defines metadata, status vocabulary, and update triggers.
- `docs/documentation-governance.md` defines archival policy and documentation maintenance rules.
- `docs/documentation-audit.md` records the latest doc cleanup findings and recommended compaction/archive moves.
- `docs/archive/README.md` indexes preserved historical, superseded, and exploratory docs.
- `docs/adr/` stores architecture decisions.
- `docs/diagrams/` stores Mermaid architecture/workflow diagrams.

Current documentation focus:

- keep `developer-source-of-truth.md` as the primary development entry point
- keep implemented truth in `current-state.md`
- keep workflow guidance in `workflows.md`
- keep long-term product direction out of current-state and inside `vision.md`, `Roadmap.md`, `target-ia.md`, `future-platform-expansion.md`, `contractor-foreman-gap-decision-list.md`, and `future-feature-coverage-map.md`
- keep platform-level defaults and contractor-level administration documented as separate concerns
- move antiquated planning docs into `docs/archive/` instead of deleting them
- use `docs/documentation-governance.md` as the rulebook for future doc cleanup and archival decisions
- treat target/feature coverage docs as direction only, not current implementation proof
