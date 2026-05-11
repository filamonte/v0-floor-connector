# Documentation Standards

Status: Stable
Doc Type: Governance

FloorConnector documentation is part of the product architecture. It exists to keep humans, Codex, v0, ChatGPT, and future agents aligned with the same canonical system.

Use [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md) for maintenance policy and [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented truth.

## Documentation Layers

| Layer | Purpose | Primary docs |
|---|---|---|
| Governance | How docs are maintained, reviewed, archived, and read by AI tools. | `documentation-governance.md`, `documentation-standards.md`, `archive/README.md` |
| Architecture / Philosophy | Stable principles that should rarely change. | `vision.md`, `architecture-principles.md`, `canonical-lifecycle.md`, `platform-philosophy.md` |
| Current Truth | What exists today and what remains foundation-level. | `current-state.md`, `platform-maturity.md`, `module-status.md`, `known-gaps.md` |
| Operational Architecture | How implemented and near-term workflows should operate. | `workflows.md`, `system-overview.md`, `ui-system.md`, `financial-architecture.md`, `portal-architecture.md` |
| Target / Future | Sequencing and target direction only. | `Roadmap.md`, `target-ia.md`, `future-platform-expansion.md` |
| ADR | Settled architecture decisions and consequences. | `adr/README.md`, `adr/*.md` |
| Diagrams | Architecture and workflow diagrams as code. | `diagrams/README.md`, `diagrams/*.md` |
| AI Guidance | Rules for AI-assisted development and prompt generation. | `ai/README.md`, `ai/*.md` |

## Metadata Standard

Major active docs should begin with:

```md
# Title

Status: Stable | Active | Planned | Deprecated | Archived
Doc Type: Philosophy | Current Truth | Operational | Roadmap | ADR | Governance | Historical | AI Guidance
```

Use the closest truthful values. Archived docs may keep older content after a short archive note.

## Status Vocabulary

- Stable: implemented and trusted as a current baseline, or settled as a durable principle.
- Active: implemented and usable, still evolving.
- Foundation: canonical structure exists but deeper workflow depth remains future work.
- Planned: not implemented yet but intended.
- Deferred: intentionally postponed.
- Archived: historical only.

Do not use "planned", "target", "future", or "foundation" as softer ways to imply a feature is finished.

## Implemented Vs Planned Rules

- `docs/current-state.md` owns implemented reality.
- Roadmap, vision, target IA, diagrams, and future expansion docs must not override `current-state.md`.
- Planning docs may describe desired systems only when clearly labeled as planned, target, future, or deferred.
- If current-state and any other doc conflict, update the other doc or add an explicit caveat.
- Do not turn future architectural language into implementation claims.

## Concise Linked Docs

Each doc should have one job. Link outward instead of retelling the whole platform.

Avoid:
- repeating the canonical lifecycle in long prose when a link is enough
- copying implementation inventories across many docs
- embedding historical handoff notes in active architecture docs
- using investor or marketing copy as engineering truth

Prefer:
- short purpose sections
- tables for status and ownership
- links to the authoritative doc for details
- explicit current/future labels

## AI-Readability Rules

AI-facing docs must be unambiguous:
- Say "implemented" only when the current branch supports it.
- Say "foundation" when the route/schema/read model exists but full workflow depth does not.
- Say "planned", "target", or "future" for direction.
- Say "not implemented" for missing behavior.
- Preserve canonical names and routes.
- Do not describe target IA as current route reality.

## ADR Requirement

Create or update an ADR when a change affects:
- canonical lifecycle semantics
- shared data model boundaries
- portal/contractor record ownership
- financial/payment/signature history
- tenant isolation or authorization boundaries
- contractor shell/navigation architecture
- universal create or workspace patterns
- integration ownership or provider source-of-truth boundaries

Use [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md) for format and index.

## Diagram Requirement

Update diagrams when a change affects:
- system context
- containers or major runtime boundaries
- lifecycle flow
- portal/contractor shared-record flow
- financial, signature, or integration record ownership

Use Mermaid in Markdown. Keep diagrams simple enough to review in code.

## Update Triggers

| Change type | Required documentation consideration |
|---|---|
| Schema or migration | Update `current-state.md`, `module-status.md`, and ADR/diagrams if the relationship or architecture changes. |
| Workflow or lifecycle behavior | Update `workflows.md`, `current-state.md`, and an ADR if semantics change. |
| UI shell, navigation, or workspace pattern | Update `ui-system.md`; add ADR if the shell or major pattern changes. |
| Financial, payment, tax, retainage, or SOV behavior | Update `financial-architecture.md` and `current-state.md`; add ADR for event/model changes. |
| Portal behavior | Update `portal-architecture.md` and `current-state.md`. |
| Roadmap-only planning | Update `Roadmap.md` or `future-platform-expansion.md`; do not add current-state claims. |
| Superseded doc | Add a deprecation note or move to `docs/archive/`; update `docs/archive/README.md`. |

## CI And Check Expectations

This pass defines written standards only. Do not add documentation CI scripts unless a future task explicitly scopes them.

Lightweight checks for docs changes:
- run `git diff --check`
- search for stale implementation claims related to the edited area
- verify new links point to real files
- verify Mermaid fences are valid Markdown fences
- confirm no app code, schema, migrations, package config, or env files changed during docs-only work

