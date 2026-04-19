# Documentation Governance

Status: documentation maintenance and archival rules.

This document defines how documentation should be maintained in the FloorConnector repository so active docs stay trustworthy, older context is preserved safely, and future drift is reduced.

Use these docs together:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth and current branch reality
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

This file governs how docs are maintained. It is not a product-source-of-truth file for implementation status or roadmap sequencing.

## Purpose

FloorConnector now has enough implemented product surface that the repository needs one clear documentation system rather than a loose collection of notes.

This governance file exists to define:
- which docs are primary source-of-truth docs
- which docs are supplementary planning or design docs
- when a doc should be marked exploratory, superseded, or historical
- how docs should be archived without deleting useful context
- what documentation updates are required as part of normal feature delivery

## Documentation Status Model

Every documentation file should fit one of these states.

### Active

Use this when a doc is part of the current documentation system and should be read as current guidance.

Examples:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)

### Exploratory

Use this when a doc is still useful, but it is not source-of-truth product or implementation guidance. Exploratory docs are often design briefs, future concept docs, or scoped planning notes.

Examples:
- [docs/figma-redesign-brief.md](C:/FloorConnector/docs/figma-redesign-brief.md)

Rule:
- exploratory docs should say clearly that they are exploratory and should point back to the active source-of-truth docs they depend on

### Superseded

Use this when a doc used to be an active planning or implementation doc, but the system has now moved past it and a newer active doc set should be used instead.

Examples:
- historical opportunity planning docs now preserved under `docs/archive/superseded/`

Rule:
- superseded docs should be archived, not silently left beside active docs as if they still describe the current branch

### Historical

Use this when a doc is preserved mainly for historical context, repo memory, or old drafts that may still be worth referencing.

Examples:
- old vision draft backups

Rule:
- historical docs should be archived and clearly labeled so they are not confused with current guidance

### Scratch Or Transitional

Use this for short-lived planning notes, migration notes, or temporary decision docs that are only useful during a narrow slice of work.

Rule:
- if they remain useful after the work is done, archive them
- if they are pure noise and provide no meaningful context, they may be removed

## Primary Documentation Set

These are the docs that should remain primary and current.

### Repository Entry

- [README.md](C:/FloorConnector/README.md)
  - repo overview
  - setup
  - current high-level capabilities
  - links to deeper docs

### Source Of Truth For Implemented Reality

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
  - what is actually implemented on the current branch

### Source Of Truth For Forward Build Sequence

- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
  - what gets built next
  - major phase ordering

### Source Of Truth For Workflow Direction

- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
  - current and near-term business workflow chain

- [docs/workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md)
  - more detailed product/workflow guidance for implementation

- [docs/workflow-state-machine.md](C:/FloorConnector/docs/workflow-state-machine.md)
  - stage, blocker, and transition planning

### Source Of Truth For Target Design And Scope

- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md)
  - target system architecture

- [docs/vision.md](C:/FloorConnector/docs/vision.md)
  - long-term product direction

- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
  - target contractor app information architecture

### Documentation System Meta

- [docs/README.md](C:/FloorConnector/docs/README.md)
  - docs index and map

- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md)
  - rules for keeping the docs system coherent

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
  - short implementation guardrail summary for day-to-day development work

## Supplementary Docs

These docs are still useful, but they are not primary truth for current implementation status.

- [docs/auth-setup.md](C:/FloorConnector/docs/auth-setup.md)
  - supplementary auth setup and configuration note

- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)
  - broader business-flow framing beyond the tighter workflow docs

- [docs/figma-redesign-brief.md](C:/FloorConnector/docs/figma-redesign-brief.md)
  - exploratory design brief for future visual work

## Archive Strategy

Archive layout:
- `docs/archive/`
- `docs/archive/superseded/`
- `docs/archive/exploratory/`
- `docs/archive/historical/`

### What Goes In `superseded`

Move docs here when:
- they used to be active planning docs
- the feature is now implemented or the plan has been replaced
- leaving the file in the main docs surface would mislead future contributors

### What Goes In `exploratory`

Move docs here when:
- they represent design exploration, speculative planning, or one-off research
- they are still useful reference, but should not be treated as current implementation guidance

### What Goes In `historical`

Move docs here when:
- they are old drafts, backups, or older product/architecture context
- they may be useful for historical reference but not current execution

## Archiving Rules

When archiving a doc:
1. prefer preserving the original content
2. add a short note at the top explaining why it was archived
3. if the old path was already linked elsewhere, keep a short pointer/stub file at the original path when helpful
4. update [docs/README.md](C:/FloorConnector/docs/README.md) so contributors can tell what is active and what is archived

## How To Decide Whether A Doc Should Stay Active

Keep a doc active if it:
- describes current implementation truth
- describes the current plan forward
- defines a still-current workflow, architecture, or repo rule
- is part of the standing source-of-truth doc set

Archive or relabel a doc if it:
- says a feature is not implemented when it now exists
- reflects an older product model that has been replaced
- duplicates a stronger current doc
- is useful only as historical or exploratory context

## Required Doc Maintenance During Feature Work

Feature work should update docs whenever the change affects:
- current implemented capabilities
- the roadmap or next phase ordering
- workflow guidance
- architecture boundaries
- setup or environment assumptions
- admin/settings or module-control behavior

## Documentation Definition Of Done

A feature is not fully done until documentation has been considered.

At minimum, every meaningful feature or architecture task should answer:
- does [docs/current-state.md](C:/FloorConnector/docs/current-state.md) need updating?
- does [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) need updating?
- do [docs/workflows.md](C:/FloorConnector/docs/workflows.md) or [docs/workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md) need updating?
- does [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md) need updating?
- does [README.md](C:/FloorConnector/README.md) need updating?
- should any older planning docs now be archived or relabeled?

If the answer is yes to any of these, the doc updates are part of the same task, not optional cleanup for later.

## Recommended Ongoing Cleanup

Good future hygiene moves:
- keep root README as the canonical repo entrypoint
- avoid leaving stale planning docs in the main `docs/` directory once they are superseded
- keep archive notes short and explicit
- periodically review older exploratory docs so they do not quietly become misleading
