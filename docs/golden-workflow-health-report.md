# Golden Workflow Health Report

Status: Active
Doc Type: QA / Verification

## Scope

Verification Golden Workflow V1 adds a developer-facing confidence layer for:

`opportunity -> customer -> project -> estimate -> contract -> signature -> job -> schedule -> invoice -> payment`

This report reflects the current V1 implementation in this branch. It now
includes the first fixture-backed browser proof chain, but it does not claim
that every workflow transition is submitted through production UI forms.

## Coverage Status

| Area                          | Status                     | Current evidence                                                                                                                                                                                                                                                                                              | Remaining gap                                                                                                                |
| ----------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Canonical workflow linkage    | Verified for fixture chain | `e2e/golden-workflow-verification.spec.js` asserts one opportunity/customer/project/estimate/contract/job/invoice/payment chain plus helper unit coverage                                                                                                                                                     | UI-submitted lead conversion and contract generation remain outside this spec                                                |
| Readiness gates               | Partial                    | Golden browser spec asserts no job/standard invoice before signature readiness and allows both after signed readiness; helper wraps domain gates                                                                                                                                                              | Needs focused UI refusal tests for blocked job and blocked invoice creation                                                  |
| Contract progression          | Partial                    | Golden browser spec asserts approved estimate -> contract lineage and contractor workspace visibility; portal contract actions cover customer actions                                                                                                                                                         | Protected UI contract generation from approved estimate remains separate                                                     |
| Signature progression         | Partial                    | Golden browser spec asserts canonical signer/events and signed contract readiness; portal contract actions verify sign/decline/already-signed paths                                                                                                                                                           | Contractor-side onsite signature action remains outside the golden verification suite                                        |
| Job creation enforcement      | Partial                    | Golden browser spec asserts no job exists while blocked and one canonical job exists after readiness; Project cue bridge and schedule handoff verify ready paths                                                                                                                                              | Dedicated UI refusal test for blocked project -> job creation is still missing                                               |
| Invoice creation enforcement  | Partial                    | Golden browser spec asserts no standard invoice exists while blocked and one standard invoice exists after commercial readiness                                                                                                                                                                               | Dedicated UI refusal test for blocked standard invoice is still missing                                                      |
| Payment progression           | Verified for fixture chain | Golden browser spec records canonical payment/payment_event and verifies invoice paid state; webhook reconciliation remains separately covered                                                                                                                                                                | Provider webhook completion is not embedded inside the golden browser spec                                                   |
| Portal continuity             | Partial                    | Golden browser spec optionally compares portal project/contract/invoice routes for the same records when portal auth exists                                                                                                                                                                                   | Comparison is fixture-limited when portal auth state or portal E2E credentials are missing                                   |
| Schedule readiness visibility | Verified for fixture chain | Golden browser spec opens `/schedule` with exact post-signature project/job context; schedule handoff spec covers ready handoffs                                                                                                                                                                              | Deposit/financing readiness variants remain separate                                                                         |
| Project continuity summaries  | Partial                    | Project detail, ProjectPulse, operational workspace, timeline, MessageCenter/Proof/Closeout read models                                                                                                                                                                                                       | Needs health summary generated from live golden fixture records                                                              |
| Operational ownership model   | Verified at helper level   | `apps/web/lib/verification/operational-ownership.test.ts` verifies dashboard prioritization, Project Workspace diagnosis, owning workspace action, Settings tenant configuration, Super Admin platform policy, Portal customer-safe review/action, forbidden ownership absence, and canonical lifecycle order | Route-specific ownership assertions remain distributed across existing protected, portal, settings, and platform-admin specs |

## Verified Workflow Stages

- Existing route spine: `/dashboard`, `/leads`, `/customers`, `/projects`,
  `/estimates`, `/contracts`, `/invoices`, `/payments`, `/jobs`, `/schedule`,
  and `/daily-logs` are covered by the authenticated detail workspace smoke.
- Existing portal spine: portal project, estimate, contract, invoice, and
  change-order visibility are covered when portal fixture/auth prerequisites
  exist.
- Existing payment spine: checkout-start and webhook reconciliation have
  focused E2E coverage with provider-safe local defaults.
- Existing schedule spine: ready project, unscheduled job, already scheduled
  job, and no-mutation-on-load handoffs have focused E2E coverage.
- New V1 helper spine: canonical linkage, readiness bypass detection,
  signature completion, invoice payment gate, portal continuity, and coverage
  confidence now have unit coverage.
- New ownership helper spine: the operational ownership model now has pure
  verification coverage for Dashboard, Project Workspace, owning workspaces,
  Settings, Super Admin, and Portal without adding feature behavior.
- New browser proof chain: `e2e/golden-workflow-verification.spec.js` creates a
  disposable canonical chain, checks blocked pre-signature state, signs the
  contract through canonical signer/event state, creates the post-readiness job
  and standard invoice, records a canonical payment, and verifies contractor
  route continuity. Portal route comparison runs when portal auth/grant
  prerequisites exist; otherwise the spec records a fixture-limited annotation.

## Known Gaps

- The worktree does not contain
  `docs/golden-workflow-playwright-phase-1-fixtures.md`; fixture guidance is
  currently split across the E2E QA doc, auth recovery doc, scripts, and specs.
- The golden browser spec creates canonical fixture records directly instead of
  submitting every production UI form. That keeps the proof stable for V1 but
  leaves UI-submitted lead conversion, contract generation, job creation, and
  standard invoice creation as future coverage.
- Browser negative-path coverage for blocked job creation and blocked standard
  invoice creation is still limited to "no downstream record before readiness"
  assertions, not UI refusal submissions.
- Operational ownership route evidence remains distributed. The new helper
  proves the review contract, but it does not replace protected browser checks
  for dashboard, project, owning workspace, settings, super-admin, or portal
  routes.
- Portal comparison depends on existing portal auth state or portal E2E
  credentials. Without those prerequisites, the spec records the limitation
  instead of counting portal comparison as passed.
- Payment success is proven through canonical `payments` and `payment_events`
  rows in the browser chain; provider webhook completion remains covered by the
  focused webhook spec rather than embedded in the golden browser spec.

## Confidence By Stage

| Stage                      | Confidence | Reason                                                                                                            |
| -------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| Opportunity                | Medium     | Golden browser fixture proves converted opportunity linkage; UI-submitted conversion remains                      |
| Customer                   | Medium     | Customer/People/portal access coverage exists; conversion primary-contact proof needs tightening                  |
| Project                    | High       | Golden browser fixture proves blocked-to-ready readiness sync on one canonical project                            |
| Estimate                   | Medium     | Estimate authoring/approval coverage exists; end-to-end handoff to contract needs browser proof                   |
| Contract                   | Medium     | Contract workspace and portal tests exist; protected generation path needs tighter coverage                       |
| Signature                  | Medium     | Portal signature is covered; onsite signature remains outside golden suite                                        |
| Job                        | Medium     | Ready handoffs covered; blocked creation refusal needs browser coverage                                           |
| Schedule                   | High       | Schedule read model and ready handoff coverage are focused and current                                            |
| Invoice                    | Medium     | Invoice workspace/payment boundaries exist; blocked standard creation needs browser coverage                      |
| Payment                    | High       | Golden browser fixture proves paid invoice state after canonical payment; webhook spec covers provider completion |
| Portal continuity          | Medium     | Real auth/grant coverage exists; side-by-side contractor/portal state comparison remains                          |
| Project continuity summary | Medium     | Multiple read models are covered; live fixture health report generation remains                                   |
| Operational ownership      | Medium     | Pure helper coverage now protects surface responsibilities; route-specific assertions remain distributed          |

## V1 Implementation Notes

- Added `apps/web/lib/verification/workflow-integrity.ts`.
- Added `apps/web/lib/verification/readiness-verification.ts`.
- Added `apps/web/lib/verification/golden-workflow-checks.ts`.
- Added `apps/web/lib/verification/golden-workflow-checks.test.ts`.
- Added `apps/web/lib/verification/operational-ownership.ts`.
- Added `apps/web/lib/verification/operational-ownership.test.ts`.
- Added `e2e/golden-workflow-verification.spec.js`.
- Updated `playwright.config.js` so the new spec runs under
  `chromium-protected`.
- No schema changes, migrations, routes, server actions, provider calls, or
  production workflow behavior changes were introduced.

## Recommended Next Verification Slice

Add focused UI refusal specs for blocked downstream actions:

1. Attempt job creation from a blocked project and assert the existing
   readiness refusal without creating a job.
2. Attempt standard invoice creation from a blocked project without a job and
   assert the commercial-readiness refusal without creating an invoice.
3. Add a UI-submitted approved-estimate -> generated-contract browser path and
   feed that generated record into the golden browser chain.
