# FloorConnector AI-Native Development Architecture

Status: Active
Doc Type: Governance

This document is the operating manual for moving FloorConnector from mostly
sequential AI-assisted development into a coordinated AI-native engineering
organization.

It is a planning and governance document. It does not implement application
features, schema, routes, UI, or runtime behavior.

Use this together with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md)

`docs/launch-scope-and-compressed-build-plan.md` was requested as an optional
input for this first version, but it is not present in this checkout.

## 1. Executive Summary

FloorConnector is ready for an AI-native development operating model because
the product already has the hard prerequisite: one canonical contractor
operating-system spine. The current branch has real multi-tenant auth, shared
records, project-centered workflow continuity, contractor and portal surfaces
over the same data, and clear documentation rules for built versus planned
truth.

The bottleneck is no longer only code generation speed. A single sequential
agent can improve one surface at a time, but FloorConnector's next stage needs
coordinated movement across scheduling, Project Workspace, portal, field,
communications, financials, and QA without breaking canonical integrity. The
constraint becomes orchestration, isolation, verification, and merge discipline.

Sequential single-agent development becomes the bottleneck when:

- related surfaces must advance together, but only one task can safely touch
  shared context at a time
- large capability areas are split into tiny disconnected prompts that lose the
  product through-line
- integration and QA happen after implementation instead of guiding it
- agents repeatedly rediscover the same boundaries, hotspot files, and
  forbidden scopes
- the repo accumulates planning drift because documentation is not treated as
  coordination infrastructure

FloorConnector is structurally suited for parallel AI-assisted engineering
because it is a modular monolith with a shared data model, strong canonical
record rules, source-of-truth docs, existing route and package boundaries, and
clear workflow seams around projects, jobs, invoices, payments, portal grants,
communications, field evidence, and settings. Those boundaries let multiple
agents work in isolated streams if they coordinate around shared files,
migrations, navigation, auth, and verification.

An AI assistant helps with one task. An AI engineering organization defines how
many agents work together: who plans, who implements, who protects
architecture, who verifies, how worktrees are isolated, what can merge first,
and how docs prevent parallel work from becoming entropy.

## 2. Core Development Principles

Canonical integrity over raw speed:

- The canonical lifecycle remains
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- No stream may create duplicate business models for customers, projects, jobs,
  invoices, payments, portal records, schedules, communications, documents, or
  AI memory.
- Speed is only useful if the merged result strengthens the shared operating
  system.

Parallelization with isolation:

- Each stream gets its own worktree and branch.
- Streams avoid shared hotspots unless the orchestrator assigns ownership.
- Long-lived streams should merge small, reviewed slices rather than carrying
  broad drift.

Orchestrated capability waves instead of random tasks:

- Work is organized as capability waves such as Scheduling Capability Wave v1,
  not isolated widgets or page tweaks.
- Each wave has scope, forbidden scope, stream ownership, acceptance criteria,
  QA ownership, and integration order before coding begins.

Verification-first development:

- QA is a first-class stream, not a cleanup step.
- Acceptance criteria are written before implementation.
- Every stream states what was verified, what was not verified, and what
  remains blocked.

Docs-as-coordination infrastructure:

- `docs/current-state.md` remains implemented truth.
- Planning docs define target direction only unless current-state and code
  prove implementation.
- `docs/chat-handoff.md` stays compact and points future agents at current
  coordination docs.
- Major stream decisions, hotspot ownership, and capability-wave plans must be
  written down before parallel execution.

Shared architecture boundaries:

- Business logic should live in shared packages or server-side utilities where
  practical.
- Provider integrations stay behind internal adapters.
- UI surfaces project canonical records; they do not redefine them.

No duplicate business models:

- Portal uses shared records with constrained visibility.
- Scheduling uses canonical jobs, appointments, job assignments, people,
  vendors, projects, and customers.
- Communications attach to canonical records and threads.
- Reporting derives from canonical evidence.
- AI observes, drafts, summarizes, and prepares reviewed actions over
  canonical records; it does not own operational truth.

No disconnected subsystem generation:

- Do not create a schedule-only dispatch system, portal-only customer system,
  AI-only CRM, standalone task app, marketing database, duplicate document
  store, or provider-owned financial truth.

One canonical lifecycle:

- Every stream must explain how its work preserves or strengthens the shared
  lifecycle.

## 3. Development Topology

### Layer 1: Strategic Orchestrator

Responsibilities:

- choose capability waves
- define streams, owners, branch names, and worktree names
- assign protected hotspot ownership
- sequence implementation, QA, docs, and merges
- keep the work tied to the product roadmap and current-state truth
- stop or reshape work that creates duplicate models or disconnected
  subsystems

The orchestrator writes the wave brief before implementation begins.

### Layer 2: Architecture Governance

Responsibilities:

- protect canonical lifecycle integrity
- review schema, RLS, auth, navigation, shared package, integration, and
  server-boundary changes
- approve migration ownership before any schema work begins
- maintain the hotspot file map
- keep target docs from being presented as implemented truth
- confirm cross-stream changes are compatible before merge

Architecture governance is a review function, not a broad feature-building
stream.

### Layer 3: Parallel Build Streams

Responsibilities:

- execute bounded implementation slices in isolated worktrees
- stay inside assigned stream scope
- avoid unrelated refactors
- preserve existing conventions
- update relevant docs for implemented behavior
- report validation, risks, and conflict candidates

Build streams produce mergeable slices, not private long-running rewrites.

### Layer 4: Integration + Verification

Responsibilities:

- run cross-stream regression checks
- verify canonical workflows end to end
- inspect visual, mobile, auth, and portal behavior where relevant
- check docs for built/planned accuracy
- resolve merge conflicts in a controlled order
- decide whether a capability wave is ready for merge, pilot, or another pass

Integration and verification has authority to block merges when evidence is
missing or claims exceed verified behavior.

## 4. Git Worktree Strategy

### Folder Structure

Canonical target structure:

```text
C:\FloorConnector-main
C:\FC-worktrees
  project-workspace
  scheduling
  portal
  field-mobile
  financials
  communications
  reporting
  design-system
  growth-site
  qa-verification
```

`C:\FloorConnector-main` should track the canonical `main` branch and act as
the integration baseline. Stream worktrees should live under `C:\FC-worktrees`.

### Branch Naming

Use `codex/<stream>/<capability-wave>-<slice>` unless the owner requests a
different branch convention.

Examples:

- `codex/scheduling/scheduling-wave-v1-readiness-board`
- `codex/portal/portal-wave-v1-status-window`
- `codex/qa/scheduling-wave-v1-verification`
- `codex/docs/ai-native-dev-architecture`

### Worktree Naming

Worktree folder names should match stream names, not individual task names, for
long-lived streams:

- `C:\FC-worktrees\scheduling`
- `C:\FC-worktrees\portal`
- `C:\FC-worktrees\qa-verification`

Temporary investigation worktrees may include a short suffix:

- `C:\FC-worktrees\scheduling-spike-dnd`
- `C:\FC-worktrees\portal-auth-smoke`

### Stream Isolation

Each stream should:

- work from its assigned worktree only
- keep commits focused to assigned files
- avoid touching shared shell, navigation, middleware, auth, schema,
  migrations, env, package lockfiles, or shared package APIs unless assigned
- report any unavoidable hotspot before editing

### Temporary Vs Long-Lived Worktrees

Long-lived worktrees:

- one per active stream
- reused across a capability wave
- frequently rebased from `main`
- kept clean between slices

Temporary worktrees:

- used for spikes, QA reproduction, or conflict isolation
- deleted after the finding is recorded or the slice is abandoned
- must not become silent alternate sources of truth

### Cleanup Conventions

Before deleting a worktree:

- confirm no uncommitted work is needed
- confirm no branch contains unique work that should be preserved
- record any useful findings in docs or the relevant PR/commit message
- remove the worktree through Git, not by manually deleting folders first

Expected cleanup command shape:

```powershell
git worktree remove C:\FC-worktrees\<name>
git branch -d codex/<stream>/<branch>
```

Use `-D` only after confirming the branch is intentionally abandoned.

### Merge Order

Default merge order inside a capability wave:

1. docs/governance and acceptance criteria
2. shared domain helpers or read models
3. stream implementation slices with low hotspot overlap
4. UI/presentation slices
5. QA/verifier stream updates
6. handoff/current-state updates after implementation is proven

Schema, auth, shared package, and navigation changes must merge before streams
that depend on them, and they require architecture governance approval.

### Rebasing Expectations

Streams should rebase from the latest `main`:

- before starting a new slice
- before opening a PR or asking for merge
- after any upstream hotspot merge that could affect the stream

Rebase conflicts in shared files should be treated as integration events, not
local cleanup. Report them to the orchestrator when they affect another stream.

### Migration Ownership Rules

Only one stream may own migrations at a time.

Migration work requires:

- explicit orchestrator assignment
- architecture governance approval
- RLS impact analysis
- generated/shared type update if applicable
- focused tests or read-only verification
- docs explaining the current-state change

No stream may add migrations opportunistically during a presentation or docs
slice.

### Environment Handling

- `.env.local` at `C:\FloorConnector\.env.local` is the local web app env source
  of truth.
- Do not copy secrets into docs, prompts, commits, or screenshots.
- If per-worktree env files are needed, document the setup and keep secrets out
  of Git.
- Provider-backed AI, email, payment, signature, and remote write modes remain
  off unless explicitly approved for the slice.

### Local Port Handling

- Worktrees running local dev servers must use separate ports.
- Preferred starting point:
  - main/integration: `3000`
  - project-workspace: `3011`
  - scheduling: `3012`
  - portal: `3013`
  - field-mobile: `3014`
  - financials: `3015`
  - communications: `3016`
  - qa-verification: `3020`
- Record the active port in the stream handoff when browser QA is run.
- Do not treat a stale dev server from another worktree as current evidence.

## 5. Build Stream Architecture

Initial stream inventory:

| Stream              | Ownership                                                                                | Allowed scope                                                                                                | Forbidden scope                                                                                  | Merge sensitivity                                                    | Expected outputs                                                              |
| ------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Project Workspace   | Project hub, readiness, source-record continuity, command-center summaries               | Project Workspace read models, project-linked lanes, source-record handoffs, project docs                    | New project model, project-local invoices/jobs/files, duplicate activity truth                   | High because it touches the central operating hub                    | Source-linked workflow improvements, helper tests, current-state/docs updates |
| Scheduling          | CrewBoard, dispatch, readiness, jobs/assignments, schedule UX                            | `/schedule`, schedule read models, canonical job scheduling helpers, advisory conflict/capacity visibility   | Schedule-only records, automatic dispatch, route optimization first, bypassing readiness gates   | High because jobs and readiness are cross-cutting                    | Dispatch-grade slices over canonical jobs, tests, QA notes                    |
| Portal              | Customer-safe portal experience, grants, project visibility, customer actions            | Portal status, shared documents, customer-safe messages, estimate/contract/invoice review clarity            | Portal-only customer/project/commercial copies, contractor-only blocker exposure, auth shortcuts | High because auth/grants and customer visibility are sensitive       | Portal-safe UX, access checks, customer route QA                              |
| Field/Mobile        | Daily logs, job notes, field evidence, mobile work items, foreman flow                   | Mobile-first field surfaces, evidence previews/uploads where scoped, job/daily-log handoffs                  | Offline sync first, customer sharing by default, duplicate issue systems                         | Medium-high because evidence, storage, and portal boundaries matter  | Phone-usable field workflows, storage/access verification, mobile QA          |
| Financials          | AR, invoices, payments, reconciliation, deposits, retainage/progress billing planning    | Financial read models, collections/reconciliation UX, payment event review, invoice/payment docs             | Duplicate ledger, provider retries without policy, accounting sync before adapter design         | High because financial correctness is critical                       | Canonical financial visibility, tests, no mutation unless scoped              |
| Communications      | Record-linked communications, reply triage, delivery context, Copilot handoff boundaries | `/communications`, thread/message read models, customer-visible/internal separation, provider-dark readiness | Free-floating chat, provider auto-sends, AI inbox, duplicate message stores                      | Medium-high because it touches customer context and future providers | Clear queues, source-record links, send-readiness boundaries                  |
| Reporting/Dashboard | Operations reporting and source-linked priorities                                        | `/reports`, dashboard read-only summaries, operations and collections visibility                             | Vanity BI, manual metric truth, analytics warehouse without approval                             | Medium because read-only summaries can drift into truth claims       | Evidence-linked reporting, clear metric provenance                            |
| Design System       | Contractor UI baseline, responsive polish, shared workspace grammar                      | Shared UI components, visual consistency, Graphite/Copper governance, accessibility and responsive fixes     | Broad redesign without stream approval, route behavior changes, schema/workflow changes          | Medium because shared components can affect many routes              | Visual consistency, screenshots, no workflow drift                            |
| Growth/Marketing    | Public acquisition, website/growth planning, copy truthful to implemented core           | Public copy, acquisition planning, source-attribution docs, marketing QA                                     | Website-only CRM, public intake writes without canonical path, overclaimed AI                    | Medium because public claims affect product truth                    | Truthful growth surfaces and docs                                             |
| QA/Verification     | Cross-stream testing, regression, browser QA, docs/status truth                          | Test plans, Playwright/browser smoke, visual checks, route validation, docs consistency                      | Feature implementation unless explicitly assigned, schema/runtime changes                        | Mandatory gate for all waves                                         | Pass/fail evidence, blocker list, merge recommendation                        |

Start with 5-7 active streams. Recommended first active set:

- Project Workspace
- Scheduling
- Portal
- Financial Ops
- Field/Mobile
- Communications
- QA/Verification

Reporting, Design System, and Growth/Marketing should join later or run as
short targeted streams when a wave explicitly needs them.

## 6. Agent Role Definitions

### Orchestrator Agent

Can change:

- capability-wave plans
- stream assignments
- prompt templates
- governance docs
- merge sequencing notes
- docs that coordinate active work

Cannot change:

- app runtime behavior unless explicitly assigned a scoped implementation slice
- schema or migrations without architecture approval
- branch history destructively

Review responsibilities:

- confirm every stream has scope, forbidden scope, acceptance criteria, and
  validation expectations
- stop duplicate-model or disconnected-subsystem drift
- decide merge order

### Architect / Governance Agent

Can change:

- architecture docs
- ADRs/diagrams where needed
- shared-boundary proposals
- hotspot file map
- migration plans before implementation

Cannot change:

- broad feature code without stream assignment
- business behavior by stealth through shared helpers

Review responsibilities:

- approve schema/RLS/auth/server-boundary changes
- review shared package/API changes
- verify canonical lifecycle alignment

### Implementation Agents

Can change:

- assigned stream files
- scoped helpers, components, tests, and docs needed for the slice

Cannot change:

- unassigned streams
- protected hotspots without approval
- schema or migrations unless they own the migration slice
- env, auth, provider config, billing/signature/payment behavior outside scope

Review responsibilities:

- self-report files changed, validation run, risk/conflict candidates, and
  current git status
- keep changes small enough to review

### UX / Design-System Agent

Can change:

- shared presentational components
- route-specific layout and responsive polish in assigned surfaces
- design docs and screenshots

Cannot change:

- data model, server actions, financial/signature/payment logic, auth, RLS, or
  workflow state
- redesign core navigation or shell without orchestrator approval

Review responsibilities:

- preserve Graphite/Copper and existing workspace grammar
- verify mobile/desktop no-overlap behavior where relevant
- avoid hiding missing auth/data/provider blockers with presentation copy

### QA / Verifier Agent

Can change:

- test files
- QA checkpoints
- validation scripts where scoped
- docs that record verification evidence and blockers

Cannot change:

- feature implementation to make tests pass unless explicitly assigned a fix
- schema/runtime behavior as part of verification

Review responsibilities:

- verify acceptance criteria
- distinguish pass, fail, skipped, blocked, and not run
- run `git diff --check` and relevant lint/type/test/browser checks
- check docs claims against code and current-state

### Documentation Agent

Can change:

- planning docs
- current-state/status docs when implementation is proven
- handoff/index docs
- QA checkpoint docs

Cannot change:

- implementation status claims without code evidence
- runtime behavior, schema, or migrations

Review responsibilities:

- keep docs concise and source-faithful
- separate implemented, partial, planned, future, and blocked
- preserve `docs/current-state.md` as implemented truth

## 7. Capability Wave Methodology

A capability wave is a coordinated package of related work that makes one
operational capability meaningfully more useful across its natural surfaces.
It is larger than a widget and smaller than an open-ended product area.

Wave size:

- large enough to create user-visible operational depth
- small enough to merge in several guarded slices
- usually 3-7 stream contributions
- should fit inside a clear review window with one integration owner

Decomposition rules:

- begin with a wave brief
- identify source records and canonical boundaries
- define stream slices by ownership and hotspot risk
- assign QA from the beginning
- avoid splitting dependent changes across streams when they must edit the
  same file
- prefer read-model/helper slices before UI slices

Integration rules:

- shared helpers merge before dependent UI
- schema/migration slices merge alone
- docs update after behavior is proven
- QA/verifier signs off after all stream merges or after a controlled
  integration branch is assembled

Acceptance rules:

- every output links back to canonical records
- no duplicate business model is introduced
- no forbidden hotspot was edited without approval
- typecheck/lint/tests or clearly documented blockers exist
- browser/visual/mobile checks are run where user-facing behavior changes
- docs state current truth without overclaiming

Rollout rules:

- provider-backed behavior stays off unless approved
- risky customer-facing, financial, legal, scheduling, permission, or
  compliance behavior remains review-first
- pilot readiness requires fixture/data availability, auth health, route
  smoke, and rollback/disable posture where relevant

### Example: Scheduling Capability Wave v1

Goal:

- make `/schedule` feel like a dispatch-grade operating surface while staying
  on canonical jobs, appointments, job assignments, people, vendors, projects,
  and customers.

Potential stream split:

- Scheduling Architect: workflow/readiness integrity and canonical helper map
- Scheduling UX: board/calendar/workspace density and mobile ergonomics
- Scheduling Data: queue/read-model improvements and conflict/capacity signals
- Scheduling Mobile: field schedule views and job handoffs
- Scheduling QA: E2E, browser, readiness, and no-mutation checks
- Scheduling Docs: current-state/workflow/status synchronization after proof

Acceptance:

- ready, blocked, scheduled, missing-crew, overdue, and capacity/conflict
  signals are visible from source records
- schedule changes still use existing canonical server actions and readiness
  gates
- no schedule-only records, automatic dispatch, or route optimization are added
  unless separately approved

### Example: Portal Capability Wave v1

Goal:

- make the customer portal clearer and more complete for project status,
  shared documents, action cues, and communication boundaries.

Acceptance:

- portal views remain customer-safe and project-grant scoped
- estimate, contract, invoice, change-order, shared-doc, and payment views act
  on canonical records
- no contractor-only blockers, internal notes, provider diagnostics, or field
  evidence leak into portal without explicit sharing policy

### Example: Financial Operations Capability Wave v1

Goal:

- strengthen collections, reconciliation review, deposit/retainage visibility,
  and payment-event trust over canonical invoices and payments.

Acceptance:

- every financial summary links to invoices, payments, payment events, approved
  estimate snapshots, SOV items, change orders, or invoice-only lineage
- no duplicate ledger or provider-owned payment truth
- provider retries, refunds, disputes, and accounting sync remain out of scope
  unless separately approved

## 8. Merge Governance

Migration approval:

- owned by the architect/governance agent and orchestrator together
- one migration owner at a time
- migration PRs must explain RLS, indexes, tenant isolation, generated types,
  and rollback/forward-fix posture

Protected files and areas:

- `supabase/migrations/**`
- generated/shared database types
- auth helpers, middleware, route protection, and portal grant helpers
- shared environment/config access
- shared navigation and shell files
- shared UI layout primitives used across Manager Pages or Record Workspaces
- shared lifecycle/readiness helpers
- financial calculation helpers
- payment/signature/provider integration adapters
- notification and communication write paths
- package manager files and lockfiles
- `docs/current-state.md`, when implementation truth is being changed

Integration sequencing:

- merge dependency and helper changes first
- merge stream UI changes after helper APIs are stable
- merge QA and docs evidence after implementation is assembled
- avoid merging two hotspot edits into `main` without a deliberate conflict
  plan

Merge conflict policy:

- do not resolve conflicts by deleting another stream's changes unless the
  orchestrator explicitly decides that stream is superseded
- when conflicts appear in current-state, chat-handoff, README, navigation,
  shell, auth, schema, or shared helpers, stop and reconcile meaning rather
  than taking one side mechanically

CI/test expectations:

- minimum local validation for docs-only: formatting/checks where available and
  `git diff --check`
- implementation slices: relevant unit/helper tests, `pnpm --filter
@floorconnector/web typecheck`, lint/build as appropriate, and focused
  browser QA for user-facing route changes
- migration slices: migration validation, type updates, RLS reasoning, and
  targeted DB/helper tests where practical

QA gates:

- acceptance criteria reviewed before merge
- no unresolved P0/P1 regression
- blocked checks are named with exact reason
- protected-route QA distinguishes real auth success from login redirects,
  404s, stale fixtures, and Supabase Auth rate limits

Docs update expectations:

- docs-only governance changes update handoff/index pointers
- implementation changes update current-state or focused status docs only when
  proven
- roadmap/target docs must not imply future behavior is shipped

Forbidden parallel hotspot edits:

- two streams editing migrations simultaneously
- two streams editing shared auth/portal access helpers
- two streams editing financial calculation/payment state helpers
- two streams editing the same shared shell/navigation file
- two streams editing the same route's core data loader
- multiple broad docs rewrites in `current-state`, `Roadmap`, or
  `chat-handoff` without one docs owner

## 9. Verification-First Development

E2E requirements:

- each wave names the critical user workflows before implementation
- protected flows require real saved auth or a documented auth blocker
- portal flows require real portal grants and project access or an expected
  unauthorized result
- payment/signature/provider tests must use approved test adapters or synthetic
  signed events; no live provider mutation without approval

Regression checks:

- canonical lifecycle continuity
- tenant isolation and role access
- readiness gates
- financial totals and lineage
- signature and payment state
- portal visibility
- mobile layout for field/portal/schedule surfaces
- no duplicated records or detached storage

Visual verification:

- user-facing route changes should include desktop and mobile checks where
  practical
- check for horizontal overflow, broken headings, overlapping controls, stale
  loading states, and misleading empty states
- design-system changes should include before/after screenshots or a clear
  route matrix

Workflow verification:

- source records must remain linked through the canonical lifecycle
- actions must route back to existing Manager Pages, Record Workspaces, or
  server-owned workflows
- user-facing copy should describe current capability honestly

Acceptance criteria standards:

- concrete enough for a QA agent to test
- tied to source records and routes
- includes forbidden behavior
- includes docs expectations
- includes validation commands or accepted blockers

Rollout readiness:

- feature is behind existing permissions or settings where needed
- provider-backed behavior has config and failure posture documented
- rollback/disable path exists for risky surfaces
- docs and handoff describe current status

Pilot readiness checks:

- demo or pilot data exists as real canonical records
- auth, portal grants, and provider-safe modes are configured
- no fake protected-route data or local-only persistence
- known caveats are written down before the pilot

## 10. Acceleration Targets

Initial 3-5 day targets:

- 5-7 defined streams
- 4-7 active worktrees, including QA/Verification
- one active capability wave
- one orchestrator prompt template
- one hotspot file map
- one QA gate checklist
- one integration cadence

Expected active worktrees:

- `C:\FloorConnector-main`
- `C:\FC-worktrees\project-workspace`
- `C:\FC-worktrees\scheduling`
- `C:\FC-worktrees\portal`
- `C:\FC-worktrees\field-mobile`
- `C:\FC-worktrees\financials`
- `C:\FC-worktrees\communications`
- `C:\FC-worktrees\qa-verification`

Acceptable merge cadence:

- docs/governance slices can merge same day after review
- implementation slices should merge in small batches after focused validation
- hotspot or migration slices should merge alone
- QA/verifier findings should merge before claiming wave completion

Expected capability-wave throughput:

- start with one wave at a time until the worktree and merge rhythm is proven
- after the first successful wave, run two active waves only if their hotspots
  do not overlap
- target steady-state is multiple streams contributing to one or two waves, not
  many unrelated feature prompts

Contractor pilot readiness targets:

- Scheduling Capability Wave v1 proves the model first
- core demo path remains real-record and provider-safe
- Project Workspace, Scheduling, Portal, Field/Mobile, Communications, and
  Financials each have current caveats documented
- QA/Verification can reproduce pass/blocker evidence without relying on memory

## 11. Immediate Next Steps

1. Create worktree infrastructure.
   - Establish `C:\FloorConnector-main`.
   - Establish `C:\FC-worktrees`.
   - Add initial stream worktrees for Project Workspace, Scheduling, Portal,
     Field/Mobile, Financials, Communications, and QA/Verification.

2. Create stream briefs.
   - Define scope, forbidden scope, hotspots, branch name, port, docs to read,
     and acceptance criteria for each active stream.

3. Set orchestration cadence.
   - One orchestrator owns the active wave.
   - QA joins before implementation.
   - Architecture governance approves any shared or migration-sensitive work.

4. Plan the first capability wave.
   - Start with Scheduling Capability Wave v1.
   - Keep it on canonical jobs, appointments, job assignments, people, vendors,
     projects, customers, and existing readiness gates.

5. Run the first parallel build cycle.
   - Begin with Scheduling Architect, Scheduling UX, Scheduling Data,
     Scheduling Mobile, Scheduling QA, and Scheduling Docs roles.
   - Merge helpers before UI.
   - Verify before current-state claims.

## Orchestrator Prompt Template

Use this prompt shape for each stream:

```text
Chat: [STREAM NAME] Capability Wave

You are working inside the FloorConnector repo.

Current stream:
[STREAM NAME]

Current capability wave:
[CAPABILITY WAVE NAME]

Branch/worktree:
[BRANCH NAME]

You are part of a parallel AI-native development system.

You MUST respect:

- canonical lifecycle integrity
- shared project continuity
- no duplicate business models
- no portal-only copies
- no disconnected subsystems
- no hidden architecture changes
- no unrelated refactors

Before coding:
Read:

- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/chat-handoff.md
- docs/ai-native-development-architecture.md

Then read all docs relevant to this stream.

Current stream scope:
[PASTE SCOPE]

Forbidden scope:
[PASTE FORBIDDEN AREAS]

Current capability-wave goals:
[PASTE GOALS]

Acceptance criteria:
[PASTE ACCEPTANCE]

You are operating in parallel with other agents.
Minimize hotspot collisions.
Avoid touching unrelated files.
Do not broaden the task.

Required output:

1. Docs read
2. Files changed
3. What was implemented
4. Validation run
5. Risks/conflicts noticed
6. Git status

Do not push unless explicitly asked.
```

## Hotspot File Map

These areas require orchestrator awareness before parallel edits:

| Hotspot                                                   | Why sensitive                                                       | Approval owner                           |
| --------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| `supabase/migrations/**`                                  | Schema, RLS, tenant isolation, generated types, merge ordering      | Architect/Governance                     |
| database generated/shared types                           | Breaks build and server contracts across streams                    | Architect/Governance                     |
| auth helpers and middleware                               | Cross-tenant access, route protection, portal/contractor separation | Architect/Governance                     |
| portal grant/access helpers                               | Customer visibility and project access correctness                  | Architect/Governance + Portal            |
| shared shell/navigation                                   | High conflict rate and cross-route visual behavior                  | Orchestrator + Design System             |
| `package.json`, workspace config, lockfiles               | Dependency and install behavior across all streams                  | Orchestrator                             |
| financial calculation helpers                             | Invoice/payment correctness and audit risk                          | Architect/Governance + Financials        |
| payment/signature provider adapters                       | Provider state, idempotency, legal/financial evidence               | Architect/Governance                     |
| readiness/gating helpers                                  | Scheduling and execution safety                                     | Architect/Governance + Scheduling        |
| lifecycle helpers/read models shared by Project Workspace | Cross-surface workflow truth                                        | Architect/Governance + Project Workspace |
| communication write paths                                 | Customer-visible/internal boundary and future provider risk         | Architect/Governance + Communications    |
| notification delivery helpers                             | Provider telemetry and user attention state                         | Architect/Governance                     |
| shared UI layout primitives                               | Many routes can regress visually                                    | Design System + QA                       |
| `docs/current-state.md`                                   | Implemented truth; easy to overclaim                                | Documentation + QA                       |
| `docs/chat-handoff.md`                                    | Session-start guidance; should stay compact                         | Documentation                            |
| `docs/README.md`                                          | Active docs index; should stay navigable                            | Documentation                            |

If a stream must edit a hotspot, it should declare:

- file or area
- reason
- expected blast radius
- dependent streams
- validation plan
- merge order

## QA / Verifier Stream Charter

QA/Verification is mandatory for AI-native development.

Responsibilities:

- own acceptance criteria evidence
- run focused unit/helper/type/lint/browser checks
- perform cross-stream regression checks
- validate docs claims against current code
- record blockers without smoothing them into success
- protect portal, auth, financial, signature, payment, scheduling, and tenant
  boundaries

QA does not wait until the end. It joins wave planning and writes the checks the
implementation streams must satisfy.

For Scheduling Capability Wave v1, QA should verify:

- `/schedule` loads with real contractor auth or reports exact auth blocker
- ready, blocked, scheduled, missing-crew, overdue, and conflict/capacity
  signals come from canonical records
- schedule mutations still use existing server actions and readiness gates
- no schedule-only tables, routes, or local persistence were introduced
- mobile and desktop route checks do not show horizontal overflow or broken
  action panels
- linked Job and Project Workspaces preserve continuity

## First Parallel Build Recommendation

Start with one wave: Scheduling Capability Wave v1.

Do not start with ten waves. Prove the system with one high-value, moderately
risky, visible capability area first.

Recommended first split:

| Agent                | Responsibility                |
| -------------------- | ----------------------------- |
| Scheduling Architect | workflow/readiness integrity  |
| Scheduling UX        | board/calendar/workspace      |
| Scheduling Data      | queue/read-model improvements |
| Scheduling Mobile    | field schedule views          |
| Scheduling QA        | E2E and readiness             |
| Scheduling Docs      | status/docs synchronization   |

The wave is successful only if implementation, integration, QA, and docs all
land without creating duplicate scheduling truth or weakening readiness gates.
