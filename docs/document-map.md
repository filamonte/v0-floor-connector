# Document Map

Status: Active
Doc Type: Governance

This is the primary navigation map for FloorConnector documentation. It tells
agents and humans where knowledge belongs, which documents are authoritative,
which documents are planning direction, and which documents should be treated as
historical evidence.

This document is navigation and governance. It does not implement product
behavior, approve Waves, create Streams, change schema, or override
[docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented
truth.

## Documentation Backbone

Use this discoverable backbone for most sessions:

1. [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md): current
   operating handoff and latest durable session state.
2. [docs/document-map.md](C:/FloorConnector/docs/document-map.md): where
   documentation authority lives.
3. [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md):
   implementation guardrails.
4. [docs/current-state.md](C:/FloorConnector/docs/current-state.md): current
   branch implementation truth.
5. [docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md):
   capability maturity and Program/Wave/Stream progress model.
6. [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): product sequencing and
   maturity direction.

The backbone rule is bidirectional: when one of these docs changes in a way that
affects another, update or explicitly preserve the cross-link in the same docs
task.

## Authority Tiers

| Tier | Name                | Authority                                                   |
| ---- | ------------------- | ----------------------------------------------------------- |
| 1    | Authoritative Truth | Highest authority for implemented truth and core progress.  |
| 2    | Planning            | Delivery sequencing, active Waves, Streams, and portfolios. |
| 3    | Architecture        | System structure, ownership models, and technical doctrine. |
| 4    | Vision              | Strategic direction and target future shape.                |
| 5    | Governance          | Process, safety, documentation, and agent operating rules.  |
| 6    | Archive             | Historical context only.                                    |

If tiers conflict, prefer the lower tier number. `docs/current-state.md` remains
the highest authority for implemented behavior.

## Tier 1: Authoritative Truth

| Document                                                                                 | Purpose                                                                   | Authority Level                 | Owner                                       | Review Frequency                               |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| [docs/current-state.md](C:/FloorConnector/docs/current-state.md)                         | Current branch implementation truth.                                      | Highest                         | Architecture Coordination                   | Every implementation merge.                    |
| [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md) | Developer guardrails and canonical implementation rules.                  | Highest                         | Architecture Coordination                   | Monthly and after guardrail-impacting changes. |
| [docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)             | Capability maturity and Capability -> Program -> Wave -> Stream registry. | Highest for capability progress | Product Council + Architecture Coordination | Every Wave review packet and quarterly.        |
| [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md)                 | Concise platform maturity framing.                                        | Current status summary          | Product Council                             | Monthly or after major merge.                  |
| [docs/module-status.md](C:/FloorConnector/docs/module-status.md)                         | Concise module status map.                                                | Current status summary          | Architecture Coordination                   | Monthly or after module-impacting merge.       |
| [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md)                               | Important current gaps around implemented foundations.                    | Current gap summary             | Product Council                             | Monthly or after gap-closing merge.            |
| [docs/system-status-review.md](C:/FloorConnector/docs/system-status-review.md)           | System status review over current implementation.                         | Current status evidence         | Architecture Coordination                   | Quarterly or after major release review.       |
| [docs/system-risk-register.md](C:/FloorConnector/docs/system-risk-register.md)           | Current risk framing.                                                     | Current risk register           | Architecture Coordination                   | Monthly or risk-triggered.                     |

## Tier 2: Planning

| Document                                                                                                                                 | Purpose                                                                 | Authority Level               | Owner                                       | Review Frequency                                |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------- | ------------------------------------------- | ----------------------------------------------- |
| [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)                                                                                     | Platform maturity sequencing and future product direction.              | Planning                      | Product Council                             | Quarterly and after portfolio decisions.        |
| [active-waves.md](C:/FloorConnector/active-waves.md)                                                                                     | Active and recently completed Wave registry.                            | Active execution registry     | Architecture Coordination                   | Every Wave launch, merge, or cleanup.           |
| [.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)                                                           | Active stream plan, prompt order, and stream status.                    | Active execution registry     | Architecture Coordination                   | Every stream lifecycle change.                  |
| [active-worktrees.md](C:/FloorConnector/active-worktrees.md)                                                                             | Local worktree registry.                                                | Local execution registry      | Architecture Coordination                   | Every worktree create, merge, or retire.        |
| [docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md)                                                           | Program layer above governed Waves and Streams.                         | Planning governance           | Product Council + Architecture Coordination | Quarterly and before portfolio recommendations. |
| [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md)                                                     | Strategic coordination map for planned systems.                         | Planning                      | Product Council                             | Quarterly.                                      |
| [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md)                                                     | Staged maturity discipline for platform systems.                        | Planning                      | Product Council                             | Quarterly.                                      |
| [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md) | Founder/product-owner build list and horizon planning.                  | Planning                      | Product Council                             | Monthly or after build-order decisions.         |
| [docs/review-packets/](C:/FloorConnector/docs/review-packets)                                                                            | Wave plans, live status, review packets, and portfolio recommendations. | Evidence and planning packets | Architecture Coordination                   | Per Wave.                                       |

## Tier 3: Architecture

| Document                                                                                                   | Purpose                                                              | Authority Level       | Owner                     | Review Frequency                             |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------- | ------------------------- | -------------------------------------------- |
| [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)                                       | Product and engineering synthesis of current system and next layers. | Synthesis             | Architecture Coordination | Quarterly or after major architecture merge. |
| [docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md)               | Operational command-center architecture and ownership model.         | Architecture          | Architecture Coordination | Quarterly and before command-center Waves.   |
| [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md) | Parallel AI development architecture and operating model.            | Architecture          | AI Development Operations | Quarterly or tooling-governance changes.     |
| [docs/workflows.md](C:/FloorConnector/docs/workflows.md)                                                   | Canonical and near-term workflow behavior.                           | Workflow architecture | Architecture Coordination | Monthly or after workflow-impacting merge.   |
| [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md)                       | Stable architecture principles.                                      | Architecture          | Architecture Coordination | Quarterly.                                   |
| [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md)                               | Canonical record chain and lineage rules.                            | Architecture          | Architecture Coordination | Quarterly or schema-impacting planning.      |
| [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md)                                             | Target platform architecture.                                        | Target architecture   | Architecture Coordination | Quarterly; authority review recommended.     |
| [docs/financial-architecture.md](C:/FloorConnector/docs/financial-architecture.md)                         | Financial record and event guardrails.                               | Domain architecture   | Finance Architecture      | Quarterly or financial workflow changes.     |
| [docs/portal-architecture.md](C:/FloorConnector/docs/portal-architecture.md)                               | Portal shared-record guardrails.                                     | Domain architecture   | Portal Architecture       | Quarterly or portal access changes.          |
| [docs/field-operations-architecture-map.md](C:/FloorConnector/docs/field-operations-architecture-map.md)   | Field operations architecture map.                                   | Domain architecture   | Field Operations Product  | Quarterly or field workflow changes.         |
| [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md)                                                 | Architecture decision record index.                                  | Architecture evidence | Architecture Coordination | When ADRs are added or superseded.           |
| [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md)                                       | Architecture diagram index.                                          | Architecture evidence | Architecture Coordination | When diagrams are added or superseded.       |

## Tier 4: Vision

| Document                                                                                                       | Purpose                                                | Authority Level    | Owner                                  | Review Frequency |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------ | -------------------------------------- | ---------------- |
| [docs/vision.md](C:/FloorConnector/docs/vision.md)                                                             | Long-term product vision.                              | Strategic          | Product Council                        | Quarterly.       |
| [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)                                   | Target sales and commercial workflow direction.        | Strategic workflow | Product Council                        | Quarterly.       |
| [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)                                                       | Target contractor app information architecture.        | Strategic IA       | UX Architecture                        | Quarterly.       |
| [docs/contractor-success-platform.md](C:/FloorConnector/docs/contractor-success-platform.md)                   | Future Specialty Contractor Success Platform strategy. | Strategic          | Product Council                        | Quarterly.       |
| [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md)                       | Future platform expansion direction.                   | Strategic          | Product Council                        | Quarterly.       |
| [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md)                                 | Future workflow-connected communication philosophy.    | Strategic          | Communications Product                 | Quarterly.       |
| [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md)                                         | Future workflow automation philosophy.                 | Strategic          | Automation Product                     | Quarterly.       |
| [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md)                                     | Future operational intelligence strategy.              | Strategic          | Product Council                        | Quarterly.       |
| [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md)                         | Future governed AI operating-layer strategy.           | Strategic          | AI Product + Architecture Coordination | Quarterly.       |
| [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md)                               | Canonical reporting and metrics philosophy.            | Strategic          | Product Council                        | Quarterly.       |
| [docs/future-feature-coverage-map.md](C:/FloorConnector/docs/future-feature-coverage-map.md)                   | Future feature coverage map.                           | Strategic          | Product Council                        | Quarterly.       |
| [docs/contractor-foreman-gap-decision-list.md](C:/FloorConnector/docs/contractor-foreman-gap-decision-list.md) | Contractor Foreman gap decision reference.             | Strategic          | Product Council                        | Quarterly.       |

## Tier 5: Governance

| Document                                                                                             | Purpose                                                                      | Authority Level          | Owner                                  | Review Frequency                     |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------ | -------------------------------------- | ------------------------------------ |
| [AGENTS.md](C:/FloorConnector/AGENTS.md)                                                             | Repository-level AI agent rulebook.                                          | Highest agent governance | Architecture Coordination              | Monthly or agent-policy changes.     |
| [docs/agent-governance.md](C:/FloorConnector/docs/agent-governance.md)                               | AI instruction hierarchy and agent operating governance.                     | Agent governance         | Architecture Coordination              | Monthly.                             |
| [docs/agent-startup-checklist.md](C:/FloorConnector/docs/agent-startup-checklist.md)                 | Required pre-change startup checklist.                                       | Agent governance         | Architecture Coordination              | Monthly or startup-process changes.  |
| [docs/autonomous-run-governance.md](C:/FloorConnector/docs/autonomous-run-governance.md)             | Safe autonomous work and human approval boundaries.                          | Agent governance         | Architecture Coordination              | Monthly or automation changes.       |
| [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md)               | Documentation maintenance, lifecycle, and archive rules.                     | Documentation governance | Documentation Governance               | Quarterly.                           |
| [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)                 | Documentation metadata and AI-readability standards.                         | Documentation standards  | Documentation Governance               | Quarterly.                           |
| [docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md) | Stream, Wave, verification, and merge governance.                            | Development governance   | Architecture Coordination              | Monthly and after conveyor changes.  |
| [docs/automation-tooling-baseline.md](C:/FloorConnector/docs/automation-tooling-baseline.md)         | Automation tooling readiness and command baseline.                           | Tooling governance       | AI Development Operations              | Monthly or tooling changes.          |
| [.codex/worktree-rules.md](C:/FloorConnector/.codex/worktree-rules.md)                               | Codex worktree operating standard.                                           | Worktree governance      | Architecture Coordination              | Monthly or worktree-tooling changes. |
| [docs/ai-diagnostics.md](C:/FloorConnector/docs/ai-diagnostics.md)                                   | Troubleshooting for repo, branch, worktree, validation, and conflict issues. | Operational governance   | AI Development Operations              | Monthly.                             |
| [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md)                                             | AI documentation index.                                                      | Governance index         | AI Product + Architecture Coordination | Quarterly.                           |
| [docs/README.md](C:/FloorConnector/docs/README.md)                                                   | General documentation entry point and tooling reference.                     | Documentation index      | Documentation Governance               | Quarterly.                           |
| [docs/archive/README.md](C:/FloorConnector/docs/archive/README.md)                                   | Archive rules and archive index.                                             | Archive governance       | Documentation Governance               | Quarterly and after archive moves.   |

## Tier 6: Archive

| Document                                                                                     | Purpose                                                                          | Authority Level | Owner                     | Review Frequency                                 |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------- | ------------------------- | ------------------------------------------------ |
| [docs/archive/](C:/FloorConnector/docs/archive)                                              | Historical, superseded, and exploratory documents.                               | Historical only | Documentation Governance  | Quarterly archive review.                        |
| Completed review packets under [docs/review-packets/](C:/FloorConnector/docs/review-packets) | Historical merge/readiness evidence after a Wave is closed.                      | Evidence only   | Architecture Coordination | Archive review after the evidence is superseded. |
| Completed checkpoint docs under `docs/design/`                                               | Historical checkpoint evidence when replaced by current-state or review packets. | Evidence only   | Documentation Governance  | Quarterly archive review.                        |

## Lifecycle States

| State           | Meaning                                                        | Allowed transitions                                   |
| --------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| `Draft`         | Working proposal or incomplete planning document.              | Draft -> Active; Draft -> Archived.                   |
| `Active`        | Current working reference for planning, governance, or status. | Active -> Authoritative; Active -> Deprecated.        |
| `Authoritative` | Highest authority for its tier or domain.                      | Authoritative -> Active; Authoritative -> Deprecated. |
| `Deprecated`    | Still present but replaced by another document.                | Deprecated -> Archived; Deprecated -> Active.         |
| `Archived`      | Historical context only; not active guidance.                  | Archived -> Active only after explicit owner review.  |

Lifecycle responsibilities:

- Document owners set lifecycle state.
- Architecture Coordination resolves authority conflicts.
- Documentation Governance runs quarterly document and archive reviews.
- Jeff or Product Council confirms strategic or product-priority changes.
- Agents may recommend archive candidates but must not archive automatically
  without explicit approval.

## Ownership Model

Every active document should have:

- owner
- purpose
- authority level
- review trigger
- archive trigger

Core ownership examples:

| Document                                                                                 | Owner                                       | Purpose                                    | Authority                | Review Trigger                          | Archive Trigger                                                    |
| ---------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------ | ------------------------ | --------------------------------------- | ------------------------------------------------------------------ |
| [docs/current-state.md](C:/FloorConnector/docs/current-state.md)                         | Architecture Coordination                   | Implemented truth.                         | Highest                  | Every implementation merge.             | Never archive unless replaced by a new implemented-truth document. |
| [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md) | Architecture Coordination                   | Developer guardrails.                      | Highest                  | Guardrail-impacting changes.            | Replacement guardrail document approved.                           |
| [docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)             | Product Council + Architecture Coordination | Capability maturity and progress.          | Highest for capabilities | Wave review packet or quarterly review. | Replacement registry approved.                                     |
| [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)                                     | Product Council                             | Product sequencing.                        | Planning                 | Portfolio decision or quarterly review. | Replacement roadmap approved.                                      |
| [docs/vision.md](C:/FloorConnector/docs/vision.md)                                       | Product Council                             | Long-term vision.                          | Strategic                | Quarterly strategy review.              | Vision replaced or strategy abandoned.                             |
| [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md)   | Documentation Governance                    | Documentation lifecycle and archive rules. | Governance               | Quarterly document review.              | Replacement governance doc approved.                               |

## Health Audit

Current findings:

| Finding                                                                                        | Risk                                                                          | Recommendation                                                                                               |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `docs/chat-handoff.md` carries both live handoff and long chronological wave history.          | It can become a second status inventory and obscure the latest durable state. | Keep it active, but compact older history into review packets or archive only after explicit approval.       |
| `docs/README.md` is a broad index while this file is now the tiered authority map.             | New sessions may start in the wrong index and miss authority tiers.           | Keep `docs/README.md` as the general docs entry point, but make it point to this document for map/authority. |
| `docs/documentation-governance.md` and `docs/documentation-standards.md` overlap.              | Governance and writing standards may drift.                                   | Treat governance as lifecycle/authority rules and standards as formatting/AI-readability rules.              |
| `docs/Roadmap.md`, `docs/program-architecture.md`, and this registry all discuss Programs.     | Planning authority could blur.                                                | Roadmap owns sequencing, Program Architecture owns Program structure, Capability Registry owns maturity.     |
| `docs/ai-native-development-architecture.md` includes older operating examples.                | Historical examples may be mistaken for current stream authorization.         | Keep active for architecture doctrine; refresh or split old examples in a later docs cleanup.                |
| Many checkpoint and design docs remain marked `Active` after their slice landed.               | Old evidence can compete with implemented truth.                              | Run a quarterly metadata normalization and archive-candidate review.                                         |
| Review packets are authoritative evidence during review, then historical evidence after merge. | Old review packets can look like current direction.                           | Keep packets, but classify closed packets as evidence and link current truth back to `current-state.md`.     |
| Several feature-specific docs under `docs/design/` lack obvious owner/review cadence.          | Orphaned planning docs may drift.                                             | Assign owners during documentation review or mark as archive candidates.                                     |
| Cross-linking between core truth, roadmap, registry, map, and handoff was incomplete.          | Agents may miss the intended reading path.                                    | This task establishes the backbone links.                                                                    |

## Archive Review

No archive actions are approved by this document. These are recommendations for
owner review only.

| Archive Candidate                                                                                                                       | Reason                                                                                         | Replacement                                                                        | Risk                                                        | Recommendation                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| Older history sections inside [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)                                            | The file is long and mixes live handoff with old Wave records.                                 | Closed Wave review packets and `active-waves.md`.                                  | Losing quick session context if compacted too aggressively. | Compact after explicit approval; do not archive the whole file. |
| Stale stream examples inside [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md) | Active registry state has moved beyond older examples.                                         | `active-waves.md`, `active-worktrees.md`, and `.codex/active-stream-plan.md`.      | Removing useful doctrine by accident.                       | Refresh examples or split historical examples later.            |
| Completed `docs/design/*-qa-checkpoint.md` files                                                                                        | Many are evidence of completed checks rather than active guidance.                             | Review packets, current-state, and archive checkpoint folders.                     | Losing audit trail.                                         | Batch-review and move only after owner approval.                |
| Older `docs/review-packets/next-portfolio-recommendation-v*.md` files                                                                   | Superseded by the latest recommendation and capability registry.                               | Latest portfolio recommendation and this registry.                                 | Losing portfolio decision history.                          | Mark historical or move after explicit archive review.          |
| `docs/architecture-coordination-health-report.md` and related drift-cleanup docs                                                        | Checkpoint/hygiene records can compete with current governance.                                | `docs/document-map.md`, `docs/documentation-governance.md`, and active registries. | Losing drift evidence.                                      | Archive or relabel as historical after owner review.            |
| `docs/Architecture.md` relative to system and operational architecture docs                                                             | Authority boundary is unclear between target architecture, overview, and operational doctrine. | `docs/system-overview.md`, `docs/operational-architecture-v1.md`, and ADRs.        | Accidentally removing useful target architecture.           | Run authority review; do not archive automatically.             |
| Older phase/build/system inventory docs                                                                                                 | Some may be historical planning rather than active direction.                                  | Roadmap, platform build registry, capability registry.                             | Removing context for future planning.                       | Identify exact candidates in quarterly archive review.          |

## Cross-Link Review

Backbone link expectations:

- `docs/current-state.md` links to `docs/developer-source-of-truth.md`,
  `docs/capability-registry.md`, `docs/Roadmap.md`, and this map.
- `docs/developer-source-of-truth.md` links to this map, current-state,
  capability registry, roadmap, and chat handoff.
- `docs/capability-registry.md` links to current-state, roadmap, document map,
  developer source of truth, and chat handoff.
- `docs/Roadmap.md` links to current-state, program architecture, capability
  registry, and this map.
- `docs/document-map.md` links across the full backbone.
- `docs/chat-handoff.md` links to this map, current-state, developer source of
  truth, capability registry, and roadmap.

## Quarterly Reviews

Run these reviews every quarter or after a major platform direction change:

- Capability Review: maturity scores, dependencies, success metrics, and next
  candidate Waves.
- Program Review: Program health, Wave candidates, and Program-to-Capability
  fit.
- Documentation Review: ownership, tiering, lifecycle states, metadata, and
  cross-links.
- Archive Review: archive candidates, replacements, risk, and explicit owner
  decisions.
