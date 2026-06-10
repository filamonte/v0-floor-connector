# UX Beta Readiness V1

Status: Active for planning and first audit stream
Date: 2026-06-10
Wave: `ux-beta-readiness-v1`

## Purpose

Plan a large UX/UI beta-readiness wave that makes the contractor app feel like
one coherent operating system while preserving FloorConnector's canonical
records, tenant boundaries, and implemented-versus-target truth.

This is not an app-code implementation packet. It records the wave architecture,
tool usage, proposed stream sequence, dependencies, risks, and validation plan.
The first active stream is docs/report only: `ux-architecture-audit-v1`.

## Why This Wave Matters

FloorConnector has deep implemented workflow coverage, but real contractor beta
testing needs the app to be easier to scan, trust, and operate. The current
product direction is clear:

- Dashboard prioritizes attention.
- Owning workspaces act.
- Project diagnoses operational state after sale.
- Settings owns tenant configuration.
- Super Admin owns platform policy.
- Portal stays customer-safe review/action only.

The UX wave should reduce decision fog without creating a new product world,
duplicate dashboards, module-local queues, role-specific data models, or
detached workflow truth.

## Current UX Problems Observed

Preliminary review of the governance docs, active registries, current-state
notes, and route/component map shows these areas need audit attention before
implementation:

- Dashboard, Manager Pages, command centers, and workspaces share many patterns
  but still need a stricter rhythm for "what needs attention" versus "where do
  I act?"
- Several surfaces expose overlapping summaries, readiness cards, AI/copilot
  summaries, communication context, and financial/schedule cues. The audit must
  identify which summaries are truly unique versus repeated.
- Status colors, badges, next-action cards, and readiness labels have strong
  governance in docs, but the route-by-route implementation should be checked
  for semantic drift.
- Opportunity-owned Assessment Package is now implemented, but the visual path
  from Lead/Opportunity to Assessment Package to Estimate needs beta-readiness
  scrutiny.
- Financial Readiness is now payment-schedule based, but its relationship to
  schedule readiness and production readiness needs a clearer cross-surface
  visual map.
- Role-aware dashboard personalization is target direction only. Current UX
  work may prepare presentation structure, but must not imply a personalization
  engine or create role-specific records.
- Mobile assessment and field surfaces need explicit responsive audit because
  they carry field/beta risk.

## Beta-Readiness Criteria

- The contractor app can be explained as one operating command center, not a
  collection of unrelated modules.
- Dashboard answers what needs attention and links to the canonical owning
  record or workspace.
- One primary next action is visible where practical.
- Manager Pages remain global lists and queues, not alternate workflow homes.
- Record Workspaces own record-specific decision making and follow-through.
- Financial, schedule, and production readiness are visually distinct and
  source-record grounded.
- Empty states are honest, actionable, and do not advertise unimplemented
  future features as current capability.
- Status colors and Copper action emphasis follow documented semantics.
- Role-aware-ready structure changes presentation only.
- No app change introduces duplicate models, portal-owned truth, dashboard-owned
  state, module-local queues, fake persistence, or local-only workflow state.

## Design Principles

- Repo docs and current implementation remain the source of truth.
- Use outside tools to improve planning and visual reasoning, not to override
  FloorConnector's operating model.
- Favor dense, scannable enterprise SaaS structure over decorative marketing
  composition.
- Make handoffs obvious: source record, owning workspace, readiness state, and
  next action.
- Keep Graphite/Copper disciplined: Graphite for operational structure, Copper
  for intentional action emphasis.
- Prepare role-aware presentation layers without implementing personalization
  storage or separate role worlds.

## Design-System Rules To Enforce

- Use `docs/design-system-governance.md`,
  `docs/graphite-copper-ui-system.md`, and `docs/ui-patterns.md` as the audit
  standard.
- Copper is action emphasis, not passive status.
- Status colors are semantic and consistent.
- Workspaces use header, status/next action, primary record surface, context
  rail, and secondary details/history.
- Manager Pages use identity, command/search/filter rhythm, compact summaries,
  canonical quick-create, and continuity into full workspaces.
- Empty states use plain English and one useful next action where available.
- Portal and super-admin do not automatically inherit contractor workspace
  density or Copper CTA rules.

## Role-Aware Dashboard Posture

Approved target model:

`Platform Defaults -> Organization Presets -> User Personalization`

Allowed in this wave:

- presentation structure
- filtering posture
- ordering
- queue emphasis
- action priority
- default layout recommendations

Not allowed:

- role-specific data models
- role-specific queues as separate product worlds
- duplicate dashboard records
- module-local work ownership
- claims that personalization is currently implemented unless current-state and
  code prove it

## MCP / Tool Usage Log

| Tool                         | Availability                                                 | Output / Reference                                                                                                                                                                                                               | Decision Impact                                                                       |
| ---------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| GitHub / `gh`                | Available and authenticated                                  | PR #19 merged at `9b26f481`; PR #20 merged at `4e819688`                                                                                                                                                                         | Wave allowed to proceed because both required upstream PRs are merged.                |
| Notion                       | Available                                                    | Planning page created: https://app.notion.com/p/37beeff107fa81f9a769f463cc04125c                                                                                                                                                 | Used as external decision log. Repo packet remains durable source of truth.           |
| Linear                       | Installed but blocked                                        | Initiative creation returned reauthentication requirement                                                                                                                                                                        | Proposed tickets are mirrored in this packet and registries instead of remote Linear. |
| Figma / FigJam               | Available                                                    | UX wave operating model diagram: https://www.figma.com/online-whiteboard/create-diagram/0757ca14-b0fc-466e-8df2-cb316260ab5e?utm_source=codex&utm_content=edit_in_figjam&oai_id=&request_id=7cd9676f-ead6-4afb-b46f-e424144447f7 | Used as stable visual reference for stream architecture only.                         |
| Stitch                       | Partially available                                          | Private project created: `projects/779484556394119641`; design-system creation rejected invalid payload                                                                                                                          | Record as partial availability; no Stitch screen output is implementation input.      |
| v0                           | Not available as callable tool in this session               | Tool discovery surfaced Figma capabilities instead of v0                                                                                                                                                                         | Do not use v0 in this first planning/audit pass.                                      |
| Browser / screenshot tooling | Available through local tooling and Browser plugin discovery | Not used for this main planning packet                                                                                                                                                                                           | First audit stream may use screenshots if authenticated local routes are practical.   |

The Notion Markdown spec fetch returned a validation error, so conservative
plain Markdown was used for the Notion page.

## Stitch / Figma / v0 Usage Plan

- Stitch: later design exploration may cover Contractor Dashboard,
  Lead/Opportunity with Assessment Package, Project Readiness Hub, Schedule /
  Field Command Center, and Invoice / Financials Command Center once screen
  generation or source screenshots are available.
- Figma: keep the FigJam architecture diagram as a reference. Later design work
  may capture actual routes into Figma only after the audit identifies a
  specific surface and authenticated local route is available.
- v0: do not use during this first audit. Use only later for scoped component
  scaffolding after design direction is established.

## Stream Breakdown

| Stream                                | Status                       | Scope                                                                                                                                                                         |
| ------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ux-architecture-audit-v1`            | Active first stream          | Docs/report only. Audit current UI against governance, page type responsibilities, status color semantics, action hierarchy, duplication, and dashboard/workspace boundaries. |
| `ux-design-system-foundation-v1`      | Active implementation stream | Shared tokens/components/patterns for badges, status colors, cards, page headers, action hierarchy, empty states. No domain behavior changes.                                 |
| `dashboard-command-center-cleanup-v1` | Proposed                     | Make Dashboard answer "what needs attention?" with role-aware-ready structure, no duplicate/noisy metric blocks, canonical read models only.                                  |
| `record-workspace-rhythm-v1`          | Proposed                     | Normalize high-impact Lead/Opportunity, Project, Estimate, Contract, Invoice, and Job workspaces around shared page structure.                                                |
| `financial-schedule-readiness-ux-v1`  | Proposed                     | Clean Financials, Invoices, Payments, Schedule, and Field command-center surfaces with distinct readiness lanes and non-duplicative queues.                                   |
| `mobile-field-beta-pass-v1`           | Proposed                     | Improve responsive/mobile layout for Assessment Package capture and field-facing surfaces. No customer self-service, AI, or offline mode.                                     |
| `settings-super-admin-boundary-ux-v1` | Proposed                     | Keep tenant configuration and platform policy blockers routed to their owning admin surfaces without turning operating workspaces into settings panels.                       |

## Dependencies

- PR #19 payment schedule readiness: merged before this wave started.
- PR #20 opportunity assessment package: merged before this wave started.
- `docs/design-system-governance.md`, `docs/graphite-copper-ui-system.md`, and
  `docs/ui-patterns.md` define the UX audit standard.
- `docs/product-operating-model.md` defines target Product + UX posture, but
  `docs/current-state.md` remains implemented truth.
- Existing `ux-governance-beta-cleanup-v1` proposed registry entry should be
  reconciled after audit; do not blindly run both as overlapping implementation
  streams.

## Risks

- External design tools could produce visually attractive patterns that violate
  source-record ownership or design-system governance.
- UX cleanup could accidentally become a broad redesign without a stronger
  page-by-page audit.
- Dashboard cleanup could create a private dashboard worldview instead of
  routing to owning workspaces.
- Role-aware UI could be overclaimed as implemented personalization.
- Financial readiness copy could imply payment-state changes or AIA maturity
  that are not implemented.
- Registry state still shows some completed streams as active/merged pending
  cleanup; the audit should account for current `main`, not stale worktree
  presence.

## Validation Plan

For the main wave planning commit:

```powershell
pnpm.cmd exec prettier --write docs/review-packets/ux-beta-readiness-v1.md active-waves.md active-worktrees.md .codex/active-stream-plan.md
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

For `ux-architecture-audit-v1`:

```powershell
pnpm.cmd exec prettier --write docs/review-packets/ux-architecture-audit-v1.md
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

Browser screenshots are optional for the audit and should be recorded as used,
blocked, or skipped with exact reason.

## Non-Goals

- No app UI changes in `ux-architecture-audit-v1`.
- No schema, migration, RLS, auth, payment, signature, provider, scheduling, or
  financial-state changes.
- No customer self-service implementation.
- No AI automation.
- No v0/Stitch/Figma output applied directly to code.
- No PR creation, merge, or cleanup unless separately approved.
- No dashboard-owned workflow state or role-specific data model.

## Merge Order

Recommended order after audit:

1. `ux-architecture-audit-v1`
2. `ux-design-system-foundation-v1`
3. `dashboard-command-center-cleanup-v1`
4. `record-workspace-rhythm-v1`
5. `financial-schedule-readiness-ux-v1`
6. `mobile-field-beta-pass-v1`
7. `settings-super-admin-boundary-ux-v1`

The audit may revise this order before implementation starts.

## Rollback / Containment Notes

- Planning docs can be reverted without touching runtime code.
- The first stream is docs-only and should not alter app behavior.
- Later implementation streams should be split so shared design-system changes
  land before page-specific changes.
- If external design references conflict with repo governance, discard the
  external reference and keep the repo standard.

## First Stream Authorization

`ux-architecture-audit-v1` is authorized as the first stream by the explicit
wave prompt, after GitHub verification confirmed PR #19 and PR #20 are merged.

Branch:

- `stream/ux-architecture-audit-v1`

Worktree:

- `C:\FC-worktrees\ux-architecture-audit-v1`

Scope:

- docs/report only
- no app UI changes
- no schema/migrations
- no provider, payment, signature, scheduling, portal access, or customer send
  behavior
