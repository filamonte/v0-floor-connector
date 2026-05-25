# Documentation Audit

Status: Active
Doc Type: Governance / Audit

Date: 2026-05-18

This docs-only audit reviews documentation size, overlap, truth ownership, and archive readiness after the feature-coverage direction update.

## Active Docs Inspected

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/floorconnector-full-capability-audit.md](C:/FloorConnector/docs/floorconnector-full-capability-audit.md)
- [docs/contractor-test-plan.md](C:/FloorConnector/docs/contractor-test-plan.md)
- [docs/ai-guided-system-plan.md](C:/FloorConnector/docs/ai-guided-system-plan.md)
- [docs/aia-progress-billing-plan.md](C:/FloorConnector/docs/aia-progress-billing-plan.md)
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md)
- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)
- [docs/README.md](C:/FloorConnector/docs/README.md)
- [docs/archive/README.md](C:/FloorConnector/docs/archive/README.md)
- [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md)
- [docs/module-status.md](C:/FloorConnector/docs/module-status.md)
- [docs/full-platform-feature-map.md](C:/FloorConnector/docs/full-platform-feature-map.md)
- [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md)
- Keyword-related docs covering Contractor Foreman, feature gaps, platform expansion, materials, procurement, equipment, warranty, time tracking, documents, communications, reporting, takeoffs, AI, archive, governance, current truth, and known gaps were scanned with `rg`.

Note: `docs/enterprise-ux-redesign-plan.md` was requested but is not present in this workspace. The current design-system/governance equivalents are [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md), [docs/enterprise-ui-system-audit.md](C:/FloorConnector/docs/enterprise-ui-system-audit.md), and [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md).

## Large Active Docs

The largest active docs currently inspected by file size are:

| Doc                                            | Approximate size | Audit note                                                                                                                                                                                     |
| ---------------------------------------------- | ---------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/current-state.md`                        |           224 KB | Too large but still the implemented-truth anchor. Do not add broad future planning here. Future work should split concise status summaries around it.                                          |
| `docs/workflows.md`                            |           166 KB | Mixes current rules, workflow philosophy, and future workflow direction. Still valuable, but should eventually be split into current workflow rules plus future workflow/reference appendices. |
| `docs/performance-audit.md`                    |            75 KB | High-use operational performance history. Should be compacted after the current read-model wave stabilizes.                                                                                    |
| `docs/chat-handoff.md`                         |            69 KB | Useful operational handoff, but no longer compact. Add only short latest checkpoints until a dedicated compaction/archive pass is approved.                                                    |
| `docs/spec-schema-system-layers.md`            |            65 KB | Detailed spec/reference material. Keep active only while system-layer planning is active; otherwise move to a reference or archive path later.                                                 |
| `docs/starter-pack-provisioning-plan.md`       |            61 KB | Deep planning/history. Consider splitting stable rules from historical phase log.                                                                                                              |
| `docs/e2e-browser-qa.md`                       |            52 KB | Useful QA history. Consider compact command reference plus archived historical runs.                                                                                                           |
| `docs/contractor-groups-plan.md`               |            49 KB | Very detailed platform planning/QA history. Consider reference/archive split after group governance stabilizes.                                                                                |
| `docs/developer-source-of-truth.md`            |            42 KB | Important first-read guardrail. It should remain active but should not absorb feature encyclopedia content.                                                                                    |
| `docs/floorconnector-full-capability-audit.md` |            40 KB | Valuable repo-truth status report. Keep active as an audit artifact, but avoid making it a rolling handoff log.                                                                                |

## Docs Mixing Too Many Responsibilities

- `docs/current-state.md`: implemented truth plus extensive feature narrative and historical checkpoint material.
- `docs/workflows.md`: operational rules plus target workflow philosophy and future concept detail.
- `docs/chat-handoff.md`: current handoff plus long chronological implementation history.
- `docs/Roadmap.md`: concise today, but at risk of becoming a feature encyclopedia if broad coverage is added there.
- `docs/full-platform-feature-map.md`: useful broad map, but its status metadata is non-standard and overlaps with the new feature coverage map.

## Docs That Duplicate Each Other

- `docs/full-platform-feature-map.md`, `docs/floorconnector-full-capability-audit.md`, `docs/module-status.md`, and `docs/known-gaps.md` all cover capability status at different levels.
- `docs/vision.md`, `docs/future-platform-expansion.md`, `docs/Roadmap.md`, and `docs/target-ia.md` all cover future direction.
- `docs/documentation-governance.md`, `docs/documentation-standards.md`, `docs/README.md`, and `docs/archive/README.md` all cover documentation usage from different angles.

These overlaps are acceptable if each doc keeps a distinct job:

- Current truth: `current-state.md`, `module-status.md`, `known-gaps.md`, `floorconnector-full-capability-audit.md`.
- Direction: `vision.md`, `Roadmap.md`, `target-ia.md`, `future-feature-coverage-map.md`.
- Governance: `documentation-governance.md`, `documentation-standards.md`, `docs/README.md`, `archive/README.md`.

## Stale Or Risky Implementation Claims Found

- No single active doc was moved in this pass because the risky areas are mostly bloat and overlap, not one clearly obsolete source.
- `docs/full-platform-feature-map.md` uses a non-standard status line and should be normalized or archived in a future doc cleanup. It remains useful as a broad status map, but [docs/floorconnector-full-capability-audit.md](C:/FloorConnector/docs/floorconnector-full-capability-audit.md) is stronger repo-truth evidence.
- `docs/system-completion-audit.md` is already identified by the full capability audit as convergence planning rather than current proof. It should be reviewed in a future archive pass before being used for current status.
- Target docs are generally labeled clearly, but their breadth can still be overread as implemented capability. `docs/README.md` now reinforces the distinction.

## Planning-Only Docs That Should Stay Clearly Labeled

- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/future-platform-expansion.md`
- `docs/future-feature-coverage-map.md`
- `docs/contractor-foreman-gap-decision-list.md`
- `docs/ai-guided-system-plan.md`
- `docs/aia-progress-billing-plan.md`
- `docs/full-build-and-launch-plan.md`
- `docs/*-plan.md` files unless their contents explicitly describe implemented branch reality and point back to current-state.

## Docs That Should Remain Active

- `docs/developer-source-of-truth.md`: first-read development guardrails.
- `docs/current-state.md`: implemented truth, even though it needs future compaction.
- `docs/workflows.md`: current workflow and near-term operational rules.
- `docs/system-overview.md`: non-technical synthesis and anti-drift overview.
- `docs/Roadmap.md`: sequencing guidance without dates.
- `docs/target-ia.md`: target navigation and workspace structure.
- `docs/vision.md`: product philosophy.
- `docs/graphite-copper-ui-system.md`: accepted UI implementation reference.
- `docs/floorconnector-full-capability-audit.md`: repo-truth capability audit.
- `docs/module-status.md` and `docs/known-gaps.md`: concise status and gap references.
- `docs/documentation-governance.md`, `docs/documentation-standards.md`, and `docs/README.md`: documentation operating system.

## Docs That Should Be Split

- Split `docs/current-state.md` into a concise current truth doc plus reference appendices only after a dedicated compaction prompt.
- Split `docs/workflows.md` into current workflow rules and future workflow expansions.
- Split `docs/chat-handoff.md` into current compact handoff plus archived historical checkpoints.
- Split `docs/performance-audit.md` into current performance posture plus archived implementation history after profiling/index work stabilizes.

## Docs That Should Be Archived Or Reviewed For Archive

Recommended future archive/relabel review:

- `docs/system-completion-audit.md`: likely historical/convergence planning now that `floorconnector-full-capability-audit.md` exists.
- `docs/full-build-and-launch-plan.md`: likely roadmap/reference; review before treating as active execution truth.
- Older narrow planning docs whose implementation has shipped and whose durable rules now live in `current-state.md`, `workflows.md`, or dedicated architecture docs.
- Very large phase-history docs once their stable decisions are summarized in active docs.

No archive moves were performed in this pass. The safer cleanup was to create focused feature-coverage docs and update the doc index/governance so future compaction can move historical material without breaking heavily linked active docs.

## Recommended Archive Moves

1. Review and possibly move `docs/system-completion-audit.md` to `docs/archive/historical/` or keep a pointer stub if active docs still link to it.
2. Review older `*-plan.md` files where implementation is complete and move phase-history content to `docs/archive/superseded/`.
3. Compact `docs/chat-handoff.md` into a current handoff plus `docs/archive/historical/chat-handoff-YYYY-MM.md`.
4. Compact `docs/performance-audit.md` into current performance posture plus archived implementation chronology.

## Recommended New Doc Index Structure

Use this hierarchy in `docs/README.md`:

1. Required first read and implemented truth.
2. Current status maps and audits.
3. Product direction and feature coverage.
4. Workflow and system architecture.
5. Design system and UX.
6. AI guidance and planning.
7. QA, staging, and operations.
8. Archive and historical reference.

## Recommended Source-Of-Truth Hierarchy

1. `docs/developer-source-of-truth.md` for development guardrails.
2. `docs/current-state.md` for implemented truth.
3. `docs/module-status.md`, `docs/known-gaps.md`, and `docs/floorconnector-full-capability-audit.md` for concise/current capability status.
4. `docs/workflows.md` and `docs/system-overview.md` for current workflow and synthesis.
5. `docs/Roadmap.md`, `docs/vision.md`, `docs/target-ia.md`, `docs/future-feature-coverage-map.md`, and `docs/contractor-foreman-gap-decision-list.md` for future direction.
6. `docs/archive/` for preserved historical, superseded, or exploratory context.

## Cleanup Actions Completed In This Pass

- Created a focused Contractor Foreman decision list instead of expanding `current-state.md` or `Roadmap.md` into a feature encyclopedia.
- Created a future feature coverage map to hold broad product coverage.
- Added a documentation audit to identify bloat, overlap, active docs, split candidates, and archive candidates.
- Updated the documentation index and governance standards to reinforce current-truth versus target-direction boundaries.
- Kept `chat-handoff.md` compact by adding only a short checkpoint.

## Follow-Up Cleanup Actions

May 25, 2026 docs cleanup:

- `docs/README.md` now names the required active docs set explicitly so
  supporting references and phase notes do not compete with current truth.
- Redundant archive pointer files were removed where active stubs already point
  directly to the canonical archived documents.
- A local Codex image-path troubleshooting plan was removed from
  `docs/superpowers/plans/` because it was closed operator scratch context, not
  product, architecture, QA, setup, governance, or repo-operation guidance.

## Follow-Up Cleanup Prompt

Recommended next cleanup prompt after implementation priorities allow it:

```text
Chat: FloorConnector Documentation Compaction And Archive Move

Goal:
Compact active docs that have grown into history logs, move superseded/historical content into docs/archive, and leave pointer stubs only where needed.

Start with:
- docs/chat-handoff.md
- docs/performance-audit.md
- docs/system-completion-audit.md
- docs/full-build-and-launch-plan.md
- the largest completed phase planning docs

Rules:
- Docs only.
- Preserve historical content.
- Keep current-state as implemented truth.
- Do not change application code.
- Update docs/README.md and docs/archive/README.md.
```
