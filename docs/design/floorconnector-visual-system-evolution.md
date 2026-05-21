# FloorConnector Visual System Evolution

Status: Active
Doc Type: Design Guidance

## A. Purpose

FloorConnector is adopting the Google Stitch Industrial Contrast direction as visual acceleration and reference input while preserving FloorConnector's canonical workflow, route structure, data model, and implemented guardrails.

This document bridges Stitch design inspiration with FloorConnector's existing Graphite / Copper UI system. It is guidance for future implementation passes, not proof of shipped UI behavior.

## B. Current FloorConnector Baseline To Preserve

Future visual work must preserve:

- top-nav-first contractor shell
- shared Manager Page pattern
- Project Workspace as the workflow and readiness hub
- Quick-Create -> canonical record -> full Workspace
- dashboards as entry surfaces, not separate module worlds
- contractor app and portal as two surfaces on the same canonical records
- no module-local data silos
- no portal-only copies
- no disconnected contract, payment, or workflow models
- project-centered operational continuity
- current chain: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## C. Stitch Concepts Approved For Adoption

Approved Stitch-inspired concepts:

- Graphite / Copper / Industrial Contrast visual posture
- darker enterprise command-center feel
- stronger card hierarchy
- clearer dashboard summary blocks
- high-contrast action areas
- cleaner stat cards and operational cards
- improved empty and action states
- mobile card-first review patterns
- mobile bottom-navigation inspiration where appropriate
- stronger estimate, project, and admin detail composition
- visual hierarchy improvements from Stitch screens

## D. Stitch Concepts Not Approved For Blind Adoption

Do not:

- restore a full-time left sidebar as the primary contractor navigation
- replace the current top-nav-first shell
- implement static Stitch HTML as production UI
- use demo names or demo data from Stitch in app routes
- create parallel dashboards detached from canonical records
- invent new data models to match mockups
- duplicate estimate, contract, invoice, payment, portal, project, schedule, or job models
- create module-specific private workflows
- claim target-only screen concepts are implemented until [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says they are

## E. Proposed Semantic Color Rules

- Graphite / near-black: shell, structure, premium operational background.
- White / off-white: primary readable surfaces and copy.
- Copper / orange: brand accent and primary CTA emphasis.
- Blue: active, current, or information when needed; not a dominant brand replacement unless explicitly approved later.
- Green: complete, success, paid, signed, approved.
- Yellow / amber: readiness, warning, pending, attention.
- Red: blocked, error, failed, void, declined, rejected, destructive.
- Gray / slate: neutral, secondary, disabled, structural metadata.

## F. Recommended Implementation Sequence

1. Design token and shared primitive audit.
2. Dashboard visual refresh using real canonical data.
3. Shared Manager Page, card, stat, and badge polish.
4. Project Workspace visual maturity.
5. Estimate, contract, and invoice review-first detail polish.
6. Super-admin and settings visual alignment.
7. Mobile field, portal, and estimate detail pass.

Phase 2 audit note: the first safe implementation seam is dashboard-scoped rather than app-wide. Use `apps/web/components/dashboard/dashboard-surface-primitives.ts` for dashboard panel/action/divider grammar before extracting broader app primitives.

## G. Validation Rules For Future UI Implementation

Future UI implementation must:

- preserve existing data loaders and server actions unless the task explicitly calls for behavior changes
- preserve tenant isolation and route protection
- preserve existing test hooks where possible
- preserve canonical record handoffs
- update [docs/current-state.md](C:/FloorConnector/docs/current-state.md) only when implementation actually changes
- update [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md) with visual-system adoption status
- run formatting, typecheck, and lint checks where applicable

## H. Phase 10 Adoption Status

Phases 1-10 completed the Stitch-informed visual adoption sequence across the major visible product layers: dashboard, Project Workspace, commercial detail pages, manager/global queues, field execution, portal/customer-facing review, settings, and super-admin.

Future work should now shift to targeted QA, bugfixes, screenshots, commit preparation, and route-specific refinements. Do not treat this status as approval for another broad visual expansion wave, and do not treat the Stitch phase docs as a replacement for [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## I. Header Architecture Rule

Each route should have one dominant page or record identity area after the global app navigation. Command bands should either be that identity area or become supporting summary/action panels inside the page. Avoid stacking global shell chrome, workspace bands, page headers, record command bands, and summary panels as competing headers.

When a page already has an established `DetailPageHeader`, `ContractorWorkspacePage`, portal page header, or settings/admin scope header, lower-level Stitch-informed panels should use compact summary language and lighter visual weight. Preserve the current top-nav-first contractor shell and keep actions, statuses, readiness, signature, payment, and portal context visible without creating a second page crown.
