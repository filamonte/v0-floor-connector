# UX Recovery Wave

Status: Active for docs-only foundation; implementation streams proposed only
Date: 2026-06-11
Wave: `ux-recovery-wave`

## Purpose

Create the foundation plan for recovering FloorConnector's UX and information
architecture after manual review found broad presentation, navigation, density,
settings, terminology, and responsive issues.

This packet is planning only. It does not implement UI changes, create streams
or worktrees, change routes, change database schema, rename canonical tables, or
claim target-only ideas are implemented.

## Context

The review did not find that FloorConnector lacks a canonical operating model.
The recurring issue is that the current app often presents strong workflow data
in ways that are too dense, inconsistently named, hard to scan on laptop/mobile,
or placed in the wrong workspace.

Recovery should therefore group the 45 findings into root-cause epics and then
execute a small number of high-leverage slices.

## Root-Cause Epics

| Epic                                                       | Root cause                                                                              | Representative findings            |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| A. Workspace Ownership & Content Placement                 | Workspaces show useful data, but ownership and placement are inconsistent.              | 1, 6, 15, 18, 21, 30, 31, 38, 40   |
| B. Navigation Architecture                                 | The app has multiple header, subheader, route, section, and search patterns.            | 8, 14, 18, 22, 23, 24, 37          |
| C. Display, Density & Responsive Architecture              | High-density panels do not degrade cleanly on 14 inch laptops, tablet, or mobile.       | 2, 6, 7, 21, 23, 24, 30, 35        |
| D. Settings & Configuration Architecture                   | Configuration is scattered, over-nested, or placed in operating surfaces.               | 12, 13, 19, 20, 36, 41, 42, 43, 44 |
| E. Sales Lifecycle & Assessment Architecture               | Assessment and sales-stage terminology/persistence boundaries need clearer ownership.   | 1, 3, 4, 34, 38, 39, 45            |
| F. Financial / Invoice Review Architecture                 | Invoice Review tries to be too many things and does not center invoice review.          | 16, 40, 45                         |
| G. Portal & Customer-Facing Organization                   | Portal is promising but needs organization before multi-record customer use grows.      | 28, 29, 31                         |
| H. Naming & Terminology System                             | Naming is inconsistent across workspaces, managers, packets, reports, trails, and jobs. | 5, 9, 39                           |
| I. Scheduling / Calendar Market Blocker                    | Scheduling lacks the calendar view contractors expect for go-to-market trust.           | 27, 35                             |
| J. Support, Operations Monitor & Platform Admin Experience | Support and operational monitoring need clearer homes and lighter admin direction.      | 13, 25, 26                         |
| K. Visual Language & Color System                          | Current color/status language does not scale across many statuses and priorities.       | 17                                 |
| L. Universal Capture / Intent Capture                      | Capture should accept intent and route work, not create disconnected local tasks.       | 34                                 |

The detailed finding-to-epic map lives in
[docs/ux-recovery-findings.md](C:/FloorConnector/docs/ux-recovery-findings.md).
The execution plan lives in
[docs/ux-architecture-recovery-plan.md](C:/FloorConnector/docs/ux-architecture-recovery-plan.md).

## Recommended First Implementation Wave

After this foundation pass and explicit implementation approval, run the first
implementation wave in this order:

1. Navigation shell cleanup
2. Workspace Framework V2 applied to Lead/Sales and Project
3. Settings IA cleanup
4. Display/overlay/mobile/laptop recovery
5. Calendar view MVP
6. Invoice Review cleanup
7. Portal organization cleanup

The goal is fast recovery, not a two-month broad redesign. Each stream should
be bounded, reviewable, and source-record-safe.

## Proposed Codex Stream Breakdown

| Proposed stream                          | Ownership                                                                                                   | Status        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------- |
| `navigation-shell-recovery-v1`           | Unified contractor header/menu/search/navigation shell and route context.                                   | Proposed only |
| `workspace-framework-v2-lead-project-v1` | Workspace Framework V2 applied first to Lead/Sales Opportunity and Project.                                 | Proposed only |
| `settings-ia-recovery-v1`                | Contractor Settings IA, top-of-page account status, Operations Monitor routing, and configuration grouping. | Proposed only |
| `responsive-display-overlay-recovery-v1` | 14 inch laptop, mobile shell, overlays, popups, action hierarchy, and dense workspace scanability.          | Proposed only |
| `schedule-calendar-mvp-v1`               | Calendar view MVP over existing canonical jobs, appointments, assignments, and schedule data.               | Proposed only |
| `invoice-review-recovery-v1`             | Invoice Review architecture cleanup over canonical invoice/payment records.                                 | Proposed only |
| `portal-organization-recovery-v1`        | Portal dashboard/project organization, sorting/filtering posture, and copy/capitalization QA.               | Proposed only |
| `verification-ux-recovery-v1`            | Cross-stream verification, responsive checks, ownership checks, and implementation-vs-target docs review.   | Proposed only |

No branch or worktree is approved by this packet alone.

## Stitch / Figma Design Brief

Generate design references for patterns only. Do not apply generated UI
directly to the app.

Screens and patterns to explore:

- Workspace Framework V2
- Lead or Sales Opportunity Workspace
- Project Workspace
- Settings IA
- Schedule Calendar MVP
- Invoice Review
- Portal organized dashboard
- Overlay, modal, search, and action-menu patterns
- Lighter visual color system with scalable status semantics

Design output should show dense, operational, enterprise SaaS screens rather
than marketing-style composition. It must preserve the operational command
center principle: Dashboard prioritizes, Project diagnoses, owning workspaces
act, Settings owns tenant configuration, Super Admin owns platform policy, and
Portal stays customer-safe.

## Guardrails

- Do not change database schema.
- Do not rename routes.
- Do not rename canonical tables.
- Do not implement broad UI changes in this first pass.
- Do not treat target-only design ideas as implemented.
- Preserve the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Preserve tenant safety, auth/RLS boundaries, portal grants, payment/signature
  state, financial math, readiness gates, and provider boundaries.
- Keep the current app functional.
- This foundation pass is documentation/planning only unless a tiny doc-link
  correction is needed.
- No feature implementation is approved yet.

## Acceptance Criteria

- The 45 findings are grouped into root-cause epics, not tracked as 45
  disconnected bugs.
- The first implementation wave is small enough to execute quickly.
- Proposed streams have clear ownership, non-goals, and verification posture.
- Planning separates target direction from implemented truth.
- Active registries record the wave as docs-only foundation / proposed
  implementation, not as stream/worktree activation.
- No app code, schema, migration, route, generated type, provider, payment,
  signature, scheduling, portal-access, Supabase, or runtime behavior changes
  occur in this pass.

## Validation Plan

For this docs-only foundation commit:

```powershell
pnpm.cmd exec prettier --write docs/review-packets/ux-recovery-wave.md docs/ux-recovery-findings.md docs/ux-architecture-recovery-plan.md docs/chat-handoff.md active-waves.md .codex/active-stream-plan.md
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

No app tests are required because this pass does not touch application code.
