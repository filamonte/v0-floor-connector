# Architecture Coordination Health Report

Status: Active
Doc Type: Audit
Date: 2026-05-28

## Scope

This report reviews the current Architecture Coordination stream and adjacent
active production-acceleration branches for canonical workflow integrity,
project-centric alignment, shared workspace consistency, and cross-stream drift.

Primary sources read:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/sales-to-production.md`
- `docs/vision.md`
- `docs/ai-native-development-architecture.md`
- `active-waves.md`
- `active-worktrees.md`
- `docs/design/operational-capability-waves-v1-coordination.md`
- `docs/design/project-workspace-capability-wave-v1.md`
- `docs/design/scheduling-capability-wave-v1.md`
- `docs/design/field-mobile-capability-wave-v1.md`
- `docs/design/portal-capability-wave-v1.md`
- `docs/operational-intelligence-stack-audit.md`

Branches reviewed against `main`:

- `stream/project-workspace`
- `stream/scheduling`
- `stream/communications`
- `stream/financials`
- `stream/qa-verification`
- `stream/project-readiness-panel`
- `origin/stream/portal`
- `origin/stream/field-mobile`

Current branch at review time: `stream/architecture-coordination`.
The branch has no upstream configured. `stream/architecture-coordination`,
`main`, `origin/main`, `stream/verification`, and
`stream/financials-reporting` point at `aa657d30`.

## Architecture Health Scores

| Area                         | Score |
| ---------------------------- | ----- |
| Canonical Workflow Integrity | 8/10  |
| Project-Centric Alignment    | 8/10  |
| Shared Workspace Consistency | 7/10  |
| Scheduling Alignment         | 8/10  |
| Communications Alignment     | 8/10  |
| Financial Alignment          | 7/10  |
| UX Consistency               | 7/10  |
| AI Readiness                 | 8/10  |

## Executive Summary

The product architecture is mostly holding. The active implementation branches
reviewed here generally extend existing canonical records rather than creating
duplicate customers, projects, jobs, schedules, communications, invoices,
payments, or portal copies. Project Workspace remains the intended operational
hub, CrewBoard continues to sit on canonical `jobs` and `job_assignments`,
Communications remains record-linked, and Financials continues to read from
canonical invoices, payments, and payment events.

The main risk is not a new product silo. The main risk is coordination drift:
several side branches carry broad changes to worktree governance files,
including deletions of the six-stream coordination scripts and registry
metadata. Those changes conflict with the active six-stream operating model in
`active-worktrees.md` and should not merge as incidental baggage beside feature
work.

No critical schema, RLS, auth, payment, signature, or provider mutation drift
was found in the reviewed branches.

## Drift Findings

### Critical

1. Coordination tooling drift appears in multiple non-architecture branches.

   `stream/financials`, `stream/qa-verification`, `stream/project-readiness-panel`,
   `origin/stream/portal`, and `origin/stream/field-mobile` all carry deletions
   of `.codex/active-stream-plan.md`, `.codex/prompt-templates/*`,
   `scripts/codex-next.ps1`, `scripts/codex-streams.ps1`, and the related
   `package.json` scripts. Several also rewrite `active-worktrees.md` from the
   six-stream model back to a broader all-active model.

   Impact: this would weaken the architecture coordination layer if merged
   accidentally with feature work. It also makes the branches harder to review
   because runtime changes and stream-governance changes are mixed.

2. Financial stream ownership is split.

   The active registry says `financials-reporting` is the production stream and
   `financials` is legacy/superseded, but the material Financials implementation
   work is currently on `stream/financials`. `stream/financials-reporting` points
   at `main`.

   Impact: financial work may bypass the intended merge priority and review
   ownership unless it is moved, cherry-picked, or explicitly reclassified.

### High

1. Downstream Portal and Field/Mobile branches are ahead of main even though the
   current coordination sequence marks Portal and Field/Mobile as paused or
   downstream.

   The code changes are mostly customer-safe or canonical-record aligned, but
   their branch-level registry edits imply those streams are active before the
   Project Workspace and Scheduling sequence is reconciled.

   Impact: the product surfaces may remain safe, but merge order becomes
   ambiguous and increases the chance of portal/field copy claiming readiness
   before contractor-side truth lands.

2. Scheduling componentization has improved boundaries but `/schedule/page.tsx`
   remains a large hotspot.

   `stream/scheduling` extracts a presentational CrewBoard component and adds
   field-handoff read models without adding schedule tables or write paths.
   However, the route remains large and should keep a single owner during the
   current wave.

   Impact: not an architecture violation, but a high merge-conflict risk.

3. Project Workspace has strong continuity extraction but remains a central
   hotspot.

   `stream/project-workspace` extracts field/communication, proof/evidence, and
   production hub sections from the project detail route. This is aligned with
   the Project-as-hub rule, but the branch changes the primary hub page
   substantially.

   Impact: safe direction, but should merge before Scheduling, Field/Mobile, and
   Portal copy that depends on project continuity language.

### Medium

1. Communications adds project thread visibility to Job Workspace.

   This keeps communications on canonical `communication_threads` and avoids a
   job-local inbox, but `listCommunicationThreadsForProject` is a broader
   project-thread read than the job context alone. Keep contractor-only display
   language explicit and do not reuse it in portal views.

2. Financials surfaces are read-only but increasingly cockpit-like.

   The Financials Home and AR views stay on canonical financial records and do
   not introduce a ledger. Keep wording clear that these are visibility and
   review lanes, not accounting-system truth or automated collections.

3. Field/Mobile assigned-job cards improve mobile continuity but should remain
   downstream.

   The field branch routes to jobs, projects, Daily Logs, Job Notes, time, and
   existing field evidence. That is aligned, but it should not merge before the
   project/schedule handoff semantics it depends on are stable.

## Area Review

### Project Workspace

Status: healthy direction with high hotspot sensitivity.

The Project Workspace branches reinforce the operational hub model by extracting
read-only continuity sections and preserving existing ProjectPulse, FieldTrail,
MessageCenter, CloseoutTrail, Proof Center, Project Command Timeline, and
operational intelligence layers. No duplicate project model or project-local
invoice/job/file truth was found.

Required guardrail: merge Project Workspace continuity work before downstream
Portal and Field/Mobile claims that depend on project readiness or customer-safe
project status.

### Shared Record Workspaces

Status: generally aligned.

Estimate, Contract, Invoice, Job, Change Order, and Project workspaces continue
to use shared language around source records, next actions, and linked record
continuity. Job Workspace communication additions point to shared project
threads rather than introducing job-local messages.

Open consistency gap: action hierarchy and right-rail density should continue to
be monitored as new continuity panels are added. The system should avoid
turning every record page into a second Project Workspace.

### Scheduling

Status: aligned.

Scheduling changes stay on CrewBoard, canonical jobs, job assignments, advisory
warnings, and existing schedule actions. Field handoff visibility appears
derived from existing schedule/job/field records. No schedule-only records,
dispatch tables, route optimizer, automatic dispatch, or readiness bypass was
found in the reviewed diff.

Open gap: `/schedule/page.tsx` remains a coordination hotspot and should not be
edited concurrently by multiple streams.

### Communications

Status: aligned.

Communications remains the record-linked workspace and does not become a
provider inbox, CRM, or portal-owned message product. New record continuity
helpers and Job Workspace conversation cards route back to canonical threads and
the communications workspace.

Open gap: project-wide communication context on Job Workspace is useful but
needs careful copy so users understand it is project context, not job-local
message ownership.

### Financials

Status: product-aligned, coordination-unclear.

The Financials work keeps Accounts Receivable and Financials Home read-only over
canonical invoices, payments, payment events, progress-billing signals, and
project/customer handoffs. No duplicate ledger, provider retry system, or
payment mutation path was found.

Open gap: the implementation sits on `stream/financials` while governance says
active work should be on `stream/financials-reporting`.

### Portal

Status: product-safe but sequencing-sensitive.

Portal branch changes mainly improve action anchors and customer action
hierarchy on existing estimate, contract, invoice, and change-order review
pages. These act on canonical records and do not introduce portal-only business
state.

Open gap: the branch also carries broad worktree registry/tooling changes and
should not merge before those are removed or explicitly approved.

### Verification

Status: useful QA direction with governance drift.

The QA branch adds golden workflow verification docs, fixture scripts, and a
Playwright phase-0 spec. That supports readiness, but it also carries broad
deletions of the stream coordination scripts. The QA work should be reviewed on
its own merits after removing unrelated governance-tooling deletions.

### AI Readiness

Status: aligned.

The reviewed docs and code continue to frame AI as deterministic, review-first,
provider-dark unless explicitly enabled, and grounded in canonical records. No
AI-only business model, autonomous send, autonomous scheduling, autonomous
payment, or AI-owned operational truth was found in this pass.

## Recommended Fixes

### Critical

1. Strip unrelated worktree-governance deletions from feature branches before
   merge.

   Affected branches: `stream/financials`, `stream/qa-verification`,
   `stream/project-readiness-panel`, `origin/stream/portal`,
   `origin/stream/field-mobile`.

2. Resolve Financials stream ownership.

   Either move the Financials implementation commits onto
   `stream/financials-reporting`, or update `active-worktrees.md` and merge
   order deliberately to make `stream/financials` the active financial stream
   again. Do not let both branches imply ownership.

3. Keep Architecture Coordination as the owner of stream registry/tooling
   changes.

   Non-architecture feature branches should not modify `.codex/active-stream-plan.md`,
   `.codex/prompt-templates/*`, worktree scripts, or active stream registry
   semantics unless explicitly assigned.

### High

1. Merge or reconcile Project Workspace before downstream Portal and
   Field/Mobile maturity work.

2. Assign single-file ownership for `apps/web/app/(app)/schedule/page.tsx`
   during Scheduling Wave work.

3. Keep QA/Verification changes focused on tests, fixtures, evidence docs, and
   validation scripts. Do not combine QA additions with stream governance
   deletion.

4. Add a pre-merge checklist item: "No unintended stream registry/tooling
   changes."

### Medium

1. Continue extracting Project and Schedule components to reduce hotspot size.

2. Normalize continuity vocabulary across Project, Schedule, Communications, and
   Financials: `attention`, `ready`, `blocked`, `follow-up`, and
   `source record`.

3. Re-check portal customer-safe copy after Project Workspace and Scheduling
   merge, especially around schedule, field, and payment status language.

4. Add focused smoke coverage for cross-surface handoffs:
   Project -> Schedule, Job -> Communications, AR -> Invoice/Project, Portal
   Project -> review/sign/pay pages.

## Architecture Coordination Backlog

Ranked backlog:

1. Clean active stream branches of unrelated governance/tooling drift.
2. Decide Financials stream ownership and update the branch registry if needed.
3. Create an architecture merge checklist for every stream: canonical records,
   no duplicate models, no unrelated protected-file edits, validation evidence.
4. Merge Project Workspace hub changes before downstream customer/field
   projections.
5. Re-run Scheduling branch review after Project Workspace merge and confirm
   project-to-schedule handoff semantics.
6. Re-run Portal branch review after contractor-side project/schedule truth is
   stable.
7. Keep Field/Mobile assigned work behind canonical schedule/job/daily-log
   continuity.
8. Add a small "source record coverage" note to Financials and Communications
   wave docs so cockpit-like summaries stay auditable to canonical records.
9. Keep `docs/current-state.md` updates until implementation evidence is merged
   or ready to merge; avoid branch-local overclaims.
10. Retire or explicitly preserve legacy streams such as `project-readiness-panel`
    and `qa-verification` after their useful commits are merged or superseded.

## Validation Notes

This was a docs-only architecture review. No runtime code, schema, migrations,
auth, RLS, payment, signature, portal access, provider adapter, or environment
behavior was changed by this report.

Recommended validation for this docs-only change:

- `pnpm.cmd exec prettier --check docs/architecture-coordination-health-report.md docs/README.md`
- `git diff --check`
- `git diff --cached --check`
