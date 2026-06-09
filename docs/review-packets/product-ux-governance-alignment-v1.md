# Product UX Governance Alignment V1 Review Packet

Status: Active
Doc Type: Review Packet

## Stream

- Stream: `product-ux-governance-alignment-v1`
- Branch: `stream/product-ux-governance-alignment-v1`
- Worktree: `C:\FC-worktrees\product-ux-governance-alignment-v1`
- Type: docs-only Product + UX governance alignment
- Lifecycle status: Active

## Purpose

Align active documentation around the target FloorConnector product operating
model, design-system governance, and commercial-finance readiness posture
without changing app code, schema, migrations, Supabase, routes, UI components,
server actions, packages, tests, or runtime configuration.

## Ownership Area

Product / UX governance owns:

- target operating model from lead through closeout
- Assessment Package first-class knowledge-capture doctrine
- pre-sale versus sold-work boundary
- Project creation timing as target direction
- payment schedule, Financial Readiness, and Production Readiness doctrine
- AIA / progress billing posture as required future commercial-finance maturity
- design-system governance, page type responsibilities, action hierarchy, and
  color semantics

## Dependencies

- `docs/current-state.md` for implemented truth
- `docs/workflows.md` and `docs/sales-to-production.md` for current and target
  workflow framing
- `docs/graphite-copper-ui-system.md` and `docs/ui-patterns.md` for existing
  UI doctrine
- `active-worktrees.md`, `active-waves.md`, and
  `.codex/active-stream-plan.md` for stream registry truth

## Explicit Non-Goals

- no product feature implementation
- no app code, route, component, server-action, package, test, or runtime-config
  changes
- no schema, migration, generated type, RLS, Supabase, or provider changes
- no Stripe, payment, invoice math, signature, scheduling, portal, auth, or
  tenant behavior changes
- no Notion, Linear, Figma, Stitch, Supabase, Stripe, GitHub PR, or external
  resource creation

## Drift Review

Findings:

- Current implemented truth still has Project-attached Assessment Packages.
  Target direction now wants Opportunity/Assessment to own more pre-sale work
  before Project creation.
- Existing docs mention deposit readiness heavily; the target model now frames
  Financial Readiness around configurable contract payment schedules.
- Existing docs mention SOV, retainage, and progress billing scaffolding, but
  full AIA-style pay applications and export maturity remain future depth.
- UI rules existed in `graphite-copper-ui-system.md` and `ui-patterns.md`, but
  page type responsibilities and dashboard/workspace governance needed one
  concise governance source.

## Acceptance Criteria

- New product operating model doc exists and distinguishes target direction
  from current implementation.
- New design-system governance doc exists and centralizes UX rules.
- Existing active docs link to the new docs where relevant.
- Current-state remains implemented truth and does not overclaim target-only
  behavior.
- AIA / progress billing is documented as required future maturity while
  preserving canonical invoice/payment/SOV/retainage continuity.
- Active stream registries record the docs-only stream.
- Validation confirms docs formatting and no app/schema changes.

## Validation Plan

Run:

```powershell
pnpm.cmd exec prettier --write <changed markdown files>
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

Do not run app tests unless a later task broadens scope.

## Review Correction

Review found an active-doc conflict around Project-owned Assessment Package
wording. `docs/guided-project-capture-vision.md` and `docs/target-ia.md`
still described future Assessment Package ownership as Project-first, which
competed with the new Opportunity-first target operating model.

Correction made:

- `docs/guided-project-capture-vision.md` now frames Guided Project Capture as
  Opportunity-first Assessment Package capture before Project creation, while
  preserving current Project-attached implementation truth where
  `docs/current-state.md` records it.
- `docs/target-ia.md` now separates pre-sale Opportunity/Assessment queues from
  Project workspace continuity after the work becomes operational.
- `docs/chat-handoff.md` received the matching continuity correction so future
  runs do not reintroduce Project-first target wording.

Rebase:

- Branch rebased onto current `origin/main`.
- Rebase conflict in `docs/current-state.md` was resolved by preserving the
  new implemented Area / Space foundation note from `origin/main` and retaining
  the target operating-model caveat from this stream.

Validation rerun:

```powershell
pnpm.cmd exec prettier --write docs/guided-project-capture-vision.md docs/target-ia.md docs/review-packets/product-ux-governance-alignment-v1.md docs/chat-handoff.md
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

## Second Review Correction

Second review found the corrected four docs were aligned, but remaining active
docs still used future-facing Project-owned Assessment wording in system
overview, roadmap, vision, and sales-to-production references.

Correction made:

- `docs/system-overview.md` now describes Guided Project Capture as
  Opportunity-first Assessment Package capture before Project creation, with
  Project workspaces later surfacing linked assessment, area, and space context
  after the work becomes operational.
- `docs/Roadmap.md` now frames Assessment Package maturity as
  Opportunity-first pre-estimate workflow and keeps Project creation/handoff as
  later operational continuity.
- `docs/vision.md` now describes Assessment Package as pre-estimate knowledge
  capture before Project exists, with Project continuity after sold-work
  handoff.
- `docs/sales-to-production.md` now removes the older "belongs to the Project"
  target wording and keeps Assessment Package as the pre-estimate knowledge
  layer.
- Active capability and stream registry references now use Assessment Package
  depth, canonical Assessment Package, or Project continuity wording where they
  guide future work, while older review packets and merged-stream notes may
  still describe the already-implemented Project-attached foundation.

Validation rerun:

```powershell
pnpm.cmd exec prettier --write docs/system-overview.md docs/Roadmap.md docs/vision.md docs/sales-to-production.md docs/review-packets/product-ux-governance-alignment-v1.md
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```
