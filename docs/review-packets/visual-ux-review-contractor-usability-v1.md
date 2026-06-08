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

The wave is locally complete, rebased onto current `origin/main`, and
structurally aligned with the approved UX/IA ownership model. All five
worktrees exist, are clean, and still contain the requested committed slice. The
implementation work improves contractor understandability, workspace density,
manager page ownership clarity, and customer-safe portal language without adding
schema, migration, provider, payment, customer-send, or duplicate-model paths.

The current evidence supports controlled merge approval in the recommended
order. Implementation streams were rebased and validated, verification was
rebased after the implementation streams, the verification helper was updated to
the rebased implementation heads, and the verification stream was revalidated.

## Streams Completed

| Stream                                | Worktree | Branch                                       | Status | Ahead/behind at validation time | Merge readiness                              |
| ------------------------------------- | -------- | -------------------------------------------- | ------ | ------------------------------- | -------------------------------------------- |
| `golden-workflow-usability-review-v1` | Exists   | `stream/golden-workflow-usability-review-v1` | Clean  | `1 / 0`                         | Merge-ready after validation rerun           |
| `workspace-density-polish-v1`         | Exists   | `stream/workspace-density-polish-v1`         | Clean  | `1 / 0`                         | Merge-ready after validation rerun           |
| `manager-page-ownership-polish-v1`    | Exists   | `stream/manager-page-ownership-polish-v1`    | Clean  | `1 / 0`                         | Merge-ready after validation rerun           |
| `portal-customer-clarity-polish-v1`   | Exists   | `stream/portal-customer-clarity-polish-v1`   | Clean  | `1 / 0`                         | Merge-ready after validation rerun           |
| `verification-ux-ia-ownership-v1`     | Exists   | `stream/verification-ux-ia-ownership-v1`     | Clean  | `2 / 0`                         | Merge-ready last after implementation merges |

## Commits By Stream

- `golden-workflow-usability-review-v1`: `a952ebf6 feat: clarify golden workflow usability`
- `workspace-density-polish-v1`: `797483ff feat: polish workspace density`
- `manager-page-ownership-polish-v1`: `2b3549df feat: polish manager page ownership`
- `portal-customer-clarity-polish-v1`: `cad90b36 feat: polish portal customer clarity`
- `verification-ux-ia-ownership-v1`: `f1bc5c4b test: update ux ia ownership verification`

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

| Stream                                | Focused evidence found                                                                                   | Validation evidence status                                                                                                                                                                                    | Rerun before merge |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `golden-workflow-usability-review-v1` | `golden-workflow-route-map.test.ts` covers approved stage order and Reports summarize-and-route boundary | Focused route-map test passed, 2 tests; web typecheck passed; web lint passed; fast preflight passed; `git diff --check` passed                                                                               | Complete           |
| `workspace-density-polish-v1`         | No focused test file exists for this UI/copy/layout polish stream                                        | Web typecheck passed; web lint passed; fast preflight passed; `git diff --check` passed                                                                                                                       | Complete           |
| `manager-page-ownership-polish-v1`    | No focused test file exists for this UI/copy ownership-label stream                                      | Web typecheck passed; web lint passed; fast preflight passed; `git diff --check` passed                                                                                                                       | Complete           |
| `portal-customer-clarity-polish-v1`   | Portal helper tests and changed portal E2E specs                                                         | Portal helper tests passed, 31 tests; changed portal E2E specs passed, 11 passed and 1 negative-fixture case skipped; web typecheck passed; web lint passed; fast preflight passed; `git diff --check` passed | Complete           |
| `verification-ux-ia-ownership-v1`     | `ux-ia-ownership.test.ts`, `operational-ownership.test.ts`, and `golden-workflow-checks.test.ts`         | Focused verification tests passed, 14 tests; web typecheck passed; web lint passed; fast preflight passed; `git diff --check` passed                                                                          | Complete           |

## Validation Gaps

- Workspace density and manager page ownership did not add focused tests. That
  remains acceptable for small UI/copy polish because typecheck, lint, fast
  preflight, and diff checks passed after rebase.
- Contractor-side browser smoke for the density and ownership-banner pages was
  not rerun in this pass. The portal-focused Playwright specs were rerun and
  passed.

## Governance Review

Pass.

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

Pass.

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

Remaining caveats:

- Collapsed Project Workspace sections and manager-page ownership banners were
  not browser-smoked in this pass. Typecheck, lint, fast preflight, and diff
  checks passed for those streams.
- Portal E2E coverage was rerun with the changed portal specs and passed.

## Merge Order Recommendation

The approved merge order remains correct:

1. `golden-workflow-usability-review-v1`
2. `workspace-density-polish-v1`
3. `manager-page-ownership-polish-v1`
4. `portal-customer-clarity-polish-v1`
5. `verification-ux-ia-ownership-v1`

Verification should merge last after the four implementation streams land so the
verification helper's rebased implementation heads remain accurate.

## Risks And Follow-Ups

- Rebase risk: packet commits on `main` can make the streams behind `main` by
  one or more docs-only commits unless Jeff refreshes stream ancestry
  immediately before controlled merge.
- UX risk: collapsed density and ownership banners did not receive
  contractor-side browser smoke in this pass.
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

1. Approve controlled merges in the recommended order.
2. Request correction on any stream before validation rerun.
3. Rerun validation first and review the fresh evidence before deciding.
4. Defer one stream while preserving the approved merge order for the rest.
5. Continue planning the next wave only after this wave is merged or explicitly
   deferred.

No Jeff approval is granted by this packet.
