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

Document roles:

- `docs/developer-source-of-truth.md`: primary entry point for day-to-day development guardrails
- `docs/documentation-standards.md`: doc layers, metadata, status vocabulary, ADR/diagram rules, and update expectations
- `docs/documentation-governance.md`: documentation system rules, archival policy, and doc update expectations
- `docs/platform-maturity.md`: concise platform maturity framing
- `docs/module-status.md`: concise module status table
- `docs/known-gaps.md`: important depth gaps around the implemented core
- `docs/architecture-principles.md`: stable platform architecture principles
- `docs/canonical-lifecycle.md`: canonical record chain and lineage rules
- `docs/platform-philosophy.md`: stable product/engineering philosophy
- `docs/ui-system.md`: current contractor UI guardrails
- `docs/graphite-copper-ui-system.md`: implementation reference for the current Graphite / Copper enterprise UI system across contractor, portal, super-admin, and settings surfaces
- `docs/enterprise-ui-system-audit.md`: secured-app route audit, Phase 1-4 polish history, drift watch list, and authenticated visual QA rules
- `docs/floorconnector-ui-build-rules.md`: mandatory contractor UI build rules, including the accepted Graphite & Copper visual foundation and shell/workspace guardrails
- `docs/design-system-comprehensive-prompt.md`: Graphite & Copper visual reference for targeted future UI work
- `docs/design-system-implementation-status.md`, `docs/graphite-copper-implementation.md`, and `docs/quick-reference-graphite-copper.md`: post-v0 visual-system status and quick token references
- `docs/financial-architecture.md`: financial record/event guardrails
- `docs/portal-architecture.md`: portal shared-record guardrails
- `docs/Architecture.md`: target system design
- `docs/Roadmap.md`: platform maturity roadmap
- `docs/future-platform-expansion.md`: future platform expansion direction
- `docs/current-state.md`: source of truth for implemented status
- `docs/workflows.md`: canonical business workflows and near-term workflow direction
- `docs/site-visit-scope-intake-plan.md`: planning guardrails for the lead site visit Scope Intake stage between appointment capture and estimate planning
- `docs/vision.md`: long-term product direction and platform thesis
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

- `docs/developer-source-of-truth.md` -> what every development session reads first
- `docs/current-state.md` -> what is implemented today
- `docs/platform-maturity.md` and `docs/module-status.md` -> concise current status
- `docs/workflows.md` -> how the implemented and near-term business workflows are intended to operate
- `docs/Roadmap.md` -> future platform maturity sequencing
- `docs/Architecture.md` -> target system design
- `docs/vision.md` -> where the product is intended to expand over time
- `docs/adr/` -> settled architecture decisions
- `docs/diagrams/` -> architecture diagrams as code
- `docs/ai/` -> AI-readable implementation boundaries

Current documentation focus:

- keep `developer-source-of-truth.md` as the primary development entry point
- keep implemented truth in `current-state.md`
- keep workflow guidance in `workflows.md`
- keep long-term product direction out of current-state and inside `vision.md`
- keep platform-level defaults and contractor-level administration documented as separate concerns
- move antiquated planning docs into `docs/archive/` instead of deleting them
- use `docs/documentation-governance.md` as the rulebook for future doc cleanup and archival decisions
