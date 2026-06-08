# Visual UX Review Contractor Usability V1

Status: Review packet / merge-readiness recommendation
Doc type: Integration review packet
Review date: 2026-06-08
Wave: `visual-ux-review-contractor-usability-v1`

This packet reviews the completed local stream slices for the Visual UX Review
Contractor Usability V1 wave. It does not approve merges, open PRs, start
another wave, change schemas or migrations, modify production code on `main`, or
grant Jeff approval.

## Executive Summary

The wave is locally complete and structurally aligned with the approved UX/IA
ownership model. All five worktrees exist, are clean, and still contain the
requested committed slice. The implementation work improves contractor
understandability, workspace density, manager page ownership clarity, and
customer-safe portal language without adding schema, migration, provider,
payment, customer-send, or duplicate-model paths.

Merge approval should wait. Each stream is now `1 / 1` against `origin/main`
because the live-status packet has already landed on `main`, and implementation
validation evidence was not recorded locally for every stream. The recommended
state is ready after rebase plus targeted validation rerun.

## Streams Completed

| Stream                                | Worktree | Branch                                       | Status | Ahead/behind vs `origin/main` | Merge readiness                               |
| ------------------------------------- | -------- | -------------------------------------------- | ------ | ----------------------------- | --------------------------------------------- |
| `golden-workflow-usability-review-v1` | Exists   | `stream/golden-workflow-usability-review-v1` | Clean  | `1 / 1`                       | Ready after rebase and validation rerun       |
| `workspace-density-polish-v1`         | Exists   | `stream/workspace-density-polish-v1`         | Clean  | `1 / 1`                       | Ready after rebase and validation rerun       |
| `manager-page-ownership-polish-v1`    | Exists   | `stream/manager-page-ownership-polish-v1`    | Clean  | `1 / 1`                       | Ready after rebase and validation rerun       |
| `portal-customer-clarity-polish-v1`   | Exists   | `stream/portal-customer-clarity-polish-v1`   | Clean  | `1 / 1`                       | Ready after rebase and validation rerun       |
| `verification-ux-ia-ownership-v1`     | Exists   | `stream/verification-ux-ia-ownership-v1`     | Clean  | `1 / 1`                       | Ready after rebase and final validation rerun |

## Commits By Stream

- `golden-workflow-usability-review-v1`: `57964f52 feat: clarify golden workflow usability`
- `workspace-density-polish-v1`: `1f5ca9d9 feat: polish workspace density`
- `manager-page-ownership-polish-v1`: `fa27c637 feat: polish manager page ownership`
- `portal-customer-clarity-polish-v1`: `6c2a2b23 feat: polish portal customer clarity`
- `verification-ux-ia-ownership-v1`: `3b65b997 test: protect ux ia ownership`

## Files Changed By Stream

### `golden-workflow-usability-review-v1`

- `apps/web/app/(app)/reports/page.tsx`
- `apps/web/lib/workflow-usability/golden-workflow-route-map.test.ts`
- `apps/web/lib/workflow-usability/golden-workflow-route-map.ts`
- `docs/current-state.md`
- `docs/review-packets/golden-workflow-usability-review-v1.md`

### `workspace-density-polish-v1`

- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/reports/page.tsx`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/components/detail-panel.tsx`

### `manager-page-ownership-polish-v1`

- `apps/web/app/(app)/communications/page.tsx`
- `apps/web/app/(app)/field/work-items/page.tsx`
- `apps/web/app/(app)/financials/accounts-receivable/page.tsx`
- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/app/(app)/payments/page.tsx`
- `apps/web/app/(app)/projects/page.tsx`
- `apps/web/app/(app)/reports/page.tsx`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`

### `portal-customer-clarity-polish-v1`

- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/components/portal-project-summary-panel.tsx`
- `apps/web/lib/portal/closeout-handoff.ts`
- `apps/web/lib/portal/next-step.test.ts`
- `apps/web/lib/portal/next-step.ts`
- `apps/web/lib/portal/project-status-window.test.ts`
- `apps/web/lib/portal/project-status-window.ts`
- `apps/web/lib/portal/shared-documents.test.ts`
- `apps/web/lib/portal/shared-documents.ts`
- `apps/web/lib/portal/status-explanation.test.ts`
- `apps/web/lib/portal/status-explanation.ts`
- `e2e/portal-golden-path.spec.js`
- `e2e/portal-invite-acceptance.spec.js`

### `verification-ux-ia-ownership-v1`

- `apps/web/lib/verification/ux-ia-ownership.test.ts`
- `apps/web/lib/verification/ux-ia-ownership.ts`
- `docs/golden-workflow-health-report.md`
- `docs/golden-workflow-verification-matrix.md`

## Capabilities And Polish Added

- Golden workflow: adds a pure lead-to-cash route map and a Reports section that
  shows which surface owns each stage from lead/opportunity through payment and
  reports.
- Workspace density: adds a `DetailPanel` collapsed state and collapses lower
  priority Project Workspace sections such as Coordination, Readiness /
  Financial, and Field Signal; Financials, Reports, and Schedule receive
  hierarchy and density cleanup.
- Manager page ownership: adds ownership copy to Dashboard and shared contractor
  workspace pages so users can distinguish what the page owns, where action
  happens, and where configuration belongs.
- Portal customer clarity: simplifies portal wording, changes invoice action
  language from payment-forward wording to review-first wording, and keeps
  internal/provider/blocker terminology out of customer-facing helper output.
- Verification: adds a pure UX/IA ownership verification helper and tests that
  require the four implementation commits, protect ownership boundaries, and
  catch schema/migration drift paths.

## Workflow Clarity Improvements

The wave improves the route-level explanation of the contractor path:

`lead/opportunity -> project -> estimate -> contract -> readiness -> schedule -> field -> closeout -> invoice -> payment -> reports`

Reports now summarizes and routes instead of owning operating action. Project
remains the diagnostic hub. Field, Financials, Communications, and Portal retain
distinct action or review roles.

## User-Facing Changes

- Contractor users get clearer ownership labels on manager surfaces.
- Dashboard explicitly frames itself as prioritization, not workflow ownership.
- Reports provides a compact end-to-end workflow map.
- Project Workspace reduces secondary-section density by collapsing supporting
  panels.
- Portal users see simpler customer-safe wording such as "Your Portal," "What
  you can see," and "Review invoice."

## Docs Updated

- `docs/current-state.md` is updated by the golden workflow stream with a small
  implemented-truth note.
- `docs/review-packets/golden-workflow-usability-review-v1.md` records the
  golden workflow stream findings and validation plan.
- `docs/golden-workflow-health-report.md` and
  `docs/golden-workflow-verification-matrix.md` are updated by the verification
  stream.
- `docs/review-packets/visual-ux-review-contractor-usability-v1-live-status.md`
  now records the live status source for this review.

## Validation Evidence

| Stream                                | Focused evidence found                                                                                                             | Validation evidence status                                                                           | Rerun before merge                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `golden-workflow-usability-review-v1` | `golden-workflow-route-map.test.ts` covers approved stage order and Reports summarize-and-route boundary                           | Test file and validation plan exist; executed results not recorded locally                           | Yes                                                                       |
| `workspace-density-polish-v1`         | No focused test file added                                                                                                         | Presentation/layout polish only, but executed typecheck/lint/preflight evidence not recorded locally | Yes                                                                       |
| `manager-page-ownership-polish-v1`    | No focused test file added                                                                                                         | Ownership copy is visible in changed pages/components; executed validation not recorded locally      | Yes                                                                       |
| `portal-customer-clarity-polish-v1`   | Portal helper tests plus portal E2E specs changed                                                                                  | Focused tests exist for customer-safe invoice/status wording; executed results not recorded locally  | Yes                                                                       |
| `verification-ux-ia-ownership-v1`     | `ux-ia-ownership.test.ts` covers implementation commits, ownership areas, schema drift, forbidden boundaries, and partial coverage | Prior verification reported focused test, typecheck, lint, fast preflight, and diff checks passed    | Yes, after rebasing and after implementation streams are staged for merge |

## Validation Gaps

- Implementation stream validation output was not found as executed result in
  local commit metadata or docs during this review.
- Workspace density and manager page ownership did not add focused tests. That
  is acceptable for small UI/copy polish, but typecheck, lint, fast preflight,
  and route/browser smoke should be rerun before merge approval.
- All streams are behind current `origin/main` by the live-status docs commit.
  Rebase or equivalent current-main integration should happen before merge
  validation.

## Governance Review

Pass with caveats.

- No schema or migration paths were changed.
- No provider behavior, payment behavior, financial math, signature behavior,
  customer-facing sends, or portal-owned state paths were introduced by the
  changed-path review.
- The active registries still describe the wave as approved or not started.
  This is stale relative to the inspected local commits and should be updated
  only during the controlled merge or lifecycle update step approved by Jeff.
- No PR, merge, cleanup, next-wave launch, or production-code change from `main`
  is authorized by this packet.

## Ownership Review

| Area              | Finding                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard         | Preserved as prioritization only; ownership banner says Dashboard surfaces attention and routes action elsewhere.                       |
| Project           | Preserved as diagnostic; Project copy routes execution, financial, schedule, and communications action to owning workspaces.            |
| Field             | Preserved as execution owner through Schedule, Daily Logs, jobs, assignments, field notes, evidence, people, vendors, and time context. |
| Financials        | Preserved as billing, AR, collections, payment evidence, and invoice-to-payment continuity owner over canonical financial records.      |
| Communications    | Preserved as record-linked conversation review, reply triage, history boundary, and message continuity owner.                           |
| Portal            | Preserved as customer-safe shared-record review/action surface; copy avoids internal/provider/blocker language.                         |
| Reports           | Preserved as read-only summarize-and-route owner review; it does not execute operating actions.                                         |
| Settings          | Preserved as configuration owner through Settings links for workflow and financial defaults.                                            |
| Schema and models | No schema, migration, generated DB type, package DB, or duplicate business-model paths were changed.                                    |

## Duplicate Summary And Dashboard Sprawl Review

Pass.

- Dashboard did not gain workflow mutation or separate action state.
- Reports gained a route map, but the map routes users back to owning
  workspaces instead of becoming an action owner.
- Manager pages gained ownership language rather than duplicate command-center
  models.
- Settings links were framed as configuration handoffs, not operational-page
  configuration editing.
- Project Workspace density changes collapse supporting context instead of
  adding more top-level summary blocks.

## UX / IA Review

Pass with validation caveats.

- Golden workflow understandability improves through an explicit lead-to-cash
  route map.
- Next-step language improves by clarifying ownership and replacing portal
  payment-forward copy with review-first customer-safe copy.
- Workspace density improves through collapsible secondary detail panels.
- Manager page ownership clarity improves through consistent Owns / Act here /
  Configure in Settings framing.
- Portal customer-safe clarity improves through simpler visible copy and helper
  tests that reject internal terminology.
- Cross-linking to owning workspaces improves through Reports route-map
  handoffs and manager-page ownership copy.

Remaining clarity risks:

- Collapsed Project Workspace sections should be browser-smoked after rebase to
  confirm no important readiness or field context becomes too hidden for mobile
  users.
- Manager-page ownership banners add copy density; route smoke should confirm
  they help scanning rather than crowding the first viewport.
- Portal E2E specs changed, but protected portal route execution evidence should
  be rerun with healthy auth before merge.

## Merge Order Recommendation

The approved merge order remains correct:

1. `golden-workflow-usability-review-v1`
2. `workspace-density-polish-v1`
3. `manager-page-ownership-polish-v1`
4. `portal-customer-clarity-polish-v1`
5. `verification-ux-ia-ownership-v1`

Verification should merge last after the four implementation streams are
rebased/current and after focused validation is rerun.

## Risks And Follow-Ups

- Rebase risk: all stream branches are currently behind `origin/main` by at
  least the live-status docs commit; this packet will add another docs commit on
  `main`, so every stream will need current-main integration before merge.
- Validation risk: implementation validation evidence is incomplete in local
  docs/commit metadata.
- UX risk: collapsed density and ownership banners should receive route/browser
  smoke before merge because the changes affect first-pass comprehension.
- Registry risk: active registry lifecycle status is stale and should be
  reconciled during the approved merge/lifecycle step, not by this review packet.

## Next Recommended Wave Options

No next wave is approved by this packet.

If Jeff approves this wave after validation and merge review, candidate options
remain:

- `owner-operations-reporting-v1` continuation or deeper owner review, if UX
  validation finds the current reporting/route ownership understandable.
- `workforce-and-labor-visibility-v1`, if Field/People ownership is clear after
  this wave.
- `document-proof-closeout-package-v1`, if portal and project closeout hierarchy
  remains customer-safe.
- `guided-project-capture-v1`, if the team is ready for a larger pre-estimate
  capture flow after UX baseline stabilization.

## Jeff Decision Options

Jeff may choose one of:

1. Approve merge after each stream is rebased and validation is rerun.
2. Request correction on any stream before validation rerun.
3. Rerun validation first and review the fresh evidence before deciding.
4. Defer one stream while preserving the approved merge order for the rest.
5. Continue planning the next wave only after this wave is merged or explicitly
   deferred.

No Jeff approval is granted by this packet.
