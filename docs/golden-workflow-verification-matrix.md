# Golden Workflow Verification Matrix

Status: Active
Doc Type: QA / Verification

## Purpose

This matrix defines Verification Golden Workflow V1 for the implemented
FloorConnector operating core. It is a confidence layer over the existing
canonical lifecycle, not a new business workflow.

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Verification spine for this V1:

`opportunity -> customer -> project -> estimate -> contract -> signature -> job -> schedule -> invoice -> payment`

## Verification Rules

- Verification must use canonical records and existing workflow logic.
- Readiness evidence must come from existing readiness utilities or pure
  read-model helpers that wrap those utilities.
- Portal checks prove scoped visibility over shared records, not portal copies.
- Payment checks prove invoice/payment/event continuity, not checkout-only
  state.
- Schedule checks prove readiness-aware job visibility and handoff, not a
  separate dispatch model.
- Missing fixture, missing auth, redirect to `/login`, 404, access denied, or
  Supabase Auth rate limit is blocked/skipped evidence unless the denial is the
  expected assertion.

## Operational Ownership Model Checks

Operational Command Center verification also protects the current surface
ownership model:

| Surface           | Must verify                         | Must not own                                                                         | Verification evidence                                                                 |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Dashboard         | Prioritizes source-record attention | Source of truth, workflow mutation, tenant configuration, platform policy            | Pure ownership helper plus dashboard route/read-model smoke evidence                  |
| Project Workspace | Diagnoses linked-record state       | Source of truth, workflow mutation, tenant configuration, platform policy            | Pure ownership helper plus Project Workspace command-center/readiness evidence        |
| Owning Workspace  | Acts on its source record           | Duplicate record model, portal-owned state, platform policy                          | Pure ownership helper plus focused record workspace/action coverage                   |
| Settings          | Owns tenant configuration           | Workflow mutation, source-record ownership, platform policy                          | Pure ownership helper plus settings/operational-intelligence configuration coverage   |
| Super Admin       | Owns platform policy                | Tenant source-record ownership, contractor workflow mutation, portal-owned state     | Pure ownership helper plus platform-admin read/write authorization coverage           |
| Portal            | Customer-safe review/action only    | Contractor internal truth, tenant configuration, platform policy, portal-owned state | Pure ownership helper plus portal auth/grant/project-access and customer-safe reviews |

The helper for this matrix is
`apps/web/lib/verification/operational-ownership.ts`. It does not query the
database, write state, create routes, create authorization policy, or replace
the underlying route-level tests. It makes ownership drift reviewable by
requiring each surface to prove its bounded job and the absence of forbidden
ownership responsibilities.

## Matrix

| Stage                      | Required inputs                                                                      | Expected outputs                                                         | Readiness gates                                                                                   | Failure conditions                                                                           | Verification owner                     | Existing coverage                                                                                                                                                                                              | Missing coverage                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Opportunity                | Tenant-scoped opportunity with source/contact context                                | Converted or linked opportunity points to customer/project path          | Opportunity must not become a duplicate customer/project model                                    | Opportunity lacks customer/project continuity after conversion                               | Protected E2E + read-model unit checks | GateKeeper opportunity preflight/execution tests; manager route smoke; `e2e/golden-workflow-verification.spec.js` fixture asserts converted opportunity -> customer/project linkage                            | UI-submitted Lead -> Customer -> Project conversion remains separate                              |
| Customer                   | Canonical customer account and primary contact when person details exist             | Customer Workspace and People show same relationship                     | Portal access must use contact/grant/project access records                                       | Customer email/phone treated as portal identity proof by itself                              | Protected E2E + portal access tests    | Customer detail UI, People directory access, portal fixture validation                                                                                                                                         | Conversion-specific primary-contact assertion in golden path                                      |
| Project                    | Project linked to customer and opportunity where applicable                          | Project Workspace is continuity hub                                      | Project readiness derives from approved estimate, contract, signature, deposit/financing settings | Project points to wrong customer or stores stale readiness                                   | Protected E2E + verification helpers   | Project detail UI, ProjectPulse, operational workspace tests; golden browser spec verifies blocked pre-signature state then signed ready-to-schedule state on the same project                                 | Deposit/financing readiness variations remain outside golden browser V1                           |
| Estimate                   | Canonical estimate linked to project/customer/opportunity                            | Approved estimate enables contract generation                            | Estimate must be approved before downstream commercial handoff                                    | Draft/unapproved estimate creates contract/job/invoice handoff                               | Unit + protected E2E                   | Manual approval action, estimate editor/catalog tests, document readiness; golden browser spec asserts approved estimate -> contract lineage                                                                   | UI-submitted contract generation from approved estimate remains separate                          |
| Contract                   | Contract generated from approved estimate/project/customer context                   | Contract retains estimate/project/customer lineage and signature state   | Internal approval when configured; signature readiness before scheduling where required           | Contract detached from estimate/project or sent while locked/blocked                         | Unit + portal/protected E2E            | Contract workspace smoke, portal contract actions, domain signature tests; golden browser spec asserts estimate/project/customer contract lineage and contractor workspace visibility                          | Protected UI generation flow from approved estimate remains separate                              |
| Signature                  | Contract signer records and signature events on same contract                        | Customer/onsite signature progresses signer and contract state           | Required signers complete before signed state                                                     | Portal-only signature copy, missing signer event, decline/sign actions mutating wrong record | Portal E2E + unit                      | `e2e/portal-contract-actions.spec.js`, `packages/domain/src/document-signers.test.ts`, golden browser spec fixture writes canonical signer/events then asserts signed state                                    | Contractor-side onsite signature regression remains separate                                      |
| Job                        | Canonical job linked to ready project/customer/estimate                              | Job can be created only when readiness allows                            | `assertProjectReadinessGate` for execution workflows                                              | Job exists before ready-to-schedule, wrong project/customer link                             | Unit + protected E2E                   | Project cue bridge and schedule-ready handoff fixtures; golden browser spec asserts no job exists before signature readiness and one canonical job exists after readiness                                      | Dedicated UI refusal test for blocked project -> job creation remains                             |
| Schedule                   | Job schedule fields and CrewBoard read model                                         | Ready unscheduled jobs are schedulable; blocked jobs stay blocked        | Project readiness must remain authoritative in schedule board                                     | Schedule action opens for readiness-blocked job or mutates on load                           | Protected E2E + schedule unit tests    | `e2e/schedule-ready-handoff.spec.js`, schedule read-model tests; golden browser spec opens `/schedule` for the post-signature job and asserts exact job context                                                | Deposit/financing readiness variants remain separate                                              |
| Invoice                    | Canonical invoice linked to project/customer/estimate/job where applicable           | Standard invoice follows signed/ready commercial handoff or job context  | `assertInvoiceCommercialReadiness`; invoice payment gate                                          | Standard invoice without job while readiness blocked; invoice rows lack lineage              | Unit + protected E2E                   | Invoice detail smoke, document readiness, payment boundary tests; golden browser spec asserts no standard invoice exists before readiness and one standard invoice exists after readiness                      | Dedicated UI refusal test for blocked standard invoice creation remains                           |
| Payment                    | Canonical payment/payment_events linked to invoice                                   | Payment state affects invoice lifecycle and portal/contractor visibility | Sent invoice with balance before checkout/request; webhook signature for provider events          | Checkout/session evidence treated as paid; payment linked to wrong invoice                   | Portal/payment E2E + unit              | Portal checkout-start, invoice boundary, Stripe webhook reconciliation, payment reconciliation core; golden browser spec records canonical payment/payment_event and verifies paid invoice state               | Provider webhook completion inside the golden browser spec remains separate                       |
| Portal continuity          | Active grant and project access for customer contact                                 | Portal project/estimate/contract/invoice views show same records         | Supabase Auth identity plus portal grants/project access                                          | Login page counted as portal pass; portal-only copies; overbroad customer account access     | Portal E2E + fixture script            | Portal golden path, portal actions, portal fixture validation; golden browser spec optionally grants portal access for the same project/contract/invoice and compares canonical routes when portal auth exists | Portal comparison is fixture-limited when portal auth state or portal E2E credentials are missing |
| Project continuity summary | ProjectPulse, Project Workspace lanes, MessageCenter, Proof/Payment/Signature trails | Project summarizes current lifecycle state without owning source truth   | Read-only derived visibility only                                                                 | Summary contradicts source records or hides blockers                                         | Unit + protected E2E                   | Project detail UI, ProjectPulse, operational workspace, timeline tests                                                                                                                                         | Golden workflow health route/report generated from live fixture records                           |

## Verification Helper Ownership

The V1 helper layer lives in `apps/web/lib/verification/`:

- `workflow-integrity.ts` checks canonical record linkage across the golden
  chain and portal visibility.
- `readiness-verification.ts` wraps existing domain readiness/signature/payment
  gates into a pure read-model verification summary.
- `golden-workflow-checks.ts` combines workflow, readiness, and coverage
  evidence into a developer-facing health summary.
- `operational-ownership.ts` checks that dashboard, Project Workspace, focused
  owning workspaces, Settings, Super Admin, and Portal preserve their bounded
  responsibilities while keeping the canonical lifecycle order intact.

These helpers do not query the database, write state, create records, bypass
RLS, create routes, or replace server-side workflow guards.

## Sales To Production Readiness V1 Verification

The `sales-to-production-readiness-v1` wave adds a verification-only helper at
`apps/web/lib/verification/sales-to-production-readiness.ts`. It composes the
existing canonical workflow, readiness, and operational ownership helpers, then
adds wave-specific boundary evidence for:

- sales readiness from opportunity and site assessment inputs;
- no duplicate customer/project creation during estimate handoff;
- estimate-to-contract readiness on canonical estimate, contract, and project
  data;
- contract/signature readiness without duplicate signature models;
- deposit and financial readiness on canonical invoice/payment state;
- schedule handoff to Field ownership over canonical jobs;
- Project Workspace diagnosis, Settings configuration ownership, and
  customer-safe portal boundaries.

| Verification area              | Automated evidence                                                                                                                                          | Manual / code-review check                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Sales readiness                | `sales-to-production-readiness.test.ts` requires opportunity and site assessment to stay upstream readiness inputs and forbids customer/project duplication | Confirm candidate stream only strengthens lead/opportunity readiness display and does not add dashboard sprawl     |
| Estimate / contract readiness  | Helper coverage requires canonical estimate/contract/project boundaries and contract/signature readiness ownership                                          | Confirm estimate candidate routes Settings workflow-default review back to Settings and does not mutate settings   |
| Deposit / financial readiness  | Helper coverage wraps `verifyReadinessContinuity` and catches deposit/readiness bypass before job, schedule, or standard invoice handoff                    | Confirm no financial math, detached invoice/payment state, provider call, or payment-state mutation was introduced |
| Schedule handoff               | Helper coverage requires Field execution ownership and canonical job scheduling boundaries                                                                  | Confirm schedule candidate points blocked work back to source records and does not add dispatch tables/automation  |
| Project / Settings / Portal IA | Helper coverage composes `verifyOperationalOwnership` and requires Project diagnosis, Settings configuration, and portal customer-safe boundaries           | Confirm no portal behavior changes and no customer-visible internal readiness language                             |

This helper is intentionally pure verification. It does not import
implementation-stream-only helpers, query data, add routes, add schema,
exercise provider behavior, or perform feature work.

## UX IA Ownership V1 Verification

The `visual-ux-review-contractor-usability-v1` wave adds a verification-only
helper at `apps/web/lib/verification/ux-ia-ownership.ts`. It protects the
approved post-implementation UX / IA ownership boundaries after the four
implementation streams complete:

- Dashboard prioritizes attention and routes users to owning workspaces.
- Project diagnoses project state and routes action back to source records.
- Field owns execution through canonical jobs, schedule, Daily Logs, field
  notes, evidence, and related execution records.
- Financials owns billing, collections, invoice, payment, and payment-event
  action.
- Communications owns record-linked conversation review and communication
  action.
- Portal remains customer-safe review/action over scoped canonical records.
- Reports summarizes and routes without owning operating action.
- Settings owns tenant configuration and operational preferences.
- The wave has no schema, migration, generated database type, duplicate-model,
  or local-only persistence drift.

| Verification area                   | Automated evidence                                                                                                                 | Manual / code-review check                                                                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Implementation evidence             | `ux-ia-ownership.test.ts` requires the four expected implementation commits and reviews their changed-path lists                   | Confirm reviewed commits match the stream closeout evidence before integration review                                                            |
| Dashboard / Project / Reports       | Helper coverage blocks dashboard-owned action state, Project action ownership drift, and Reports-owned action state                | Confirm route copy and hierarchy still send action to the owning workspace                                                                       |
| Field / Financials / Communications | Helper coverage protects canonical execution, invoice/payment/event, and communication thread/message ownership                    | Confirm no duplicate dispatch, field, invoice, payment, inbox, message, provider, or automation models were introduced                           |
| Portal / Settings                   | Helper coverage protects customer-safe portal review/action and Settings configuration ownership                                   | Confirm no contractor-only readiness language leaks to portal and no operational route mutates configuration                                     |
| Schema / model drift                | Helper coverage fails on migration, database-package, generated database type, duplicate-model, or local-only persistence evidence | Confirm the implementation commits did not touch `supabase/migrations`, provider behavior, financial math, payment state, or portal access rules |

This helper is intentionally pure verification. It does not query data, add
routes, add schema, add migrations, change UI behavior, loosen route tests, call
providers, or perform feature work.

## Mobile Field Closeout V1 Verification

The `mobile-field-capture-closeout-v1` wave adds a verification-only helper at
`apps/web/lib/verification/mobile-field-closeout-workflow.ts`. It protects the
approved field-capture and closeout boundaries after the implementation streams
complete:

- quick capture stays on canonical Daily Logs and field notes / Job Notes;
- blocker and issue capture stays on field-note types;
- field evidence stays on existing execution attachments;
- closeout readiness derives from jobs, Daily Logs, field notes, and execution
  attachments;
- Communications receives review-first internal handoff context only and owns
  conversation action;
- Financials remains the owner of billing/collection action;
- Portal behavior remains unchanged and no portal-only field copies are added;
- schema and migrations remain unchanged.

| Verification area        | Automated evidence                                                                                                      | Manual / code-review check                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Field capture            | `mobile-field-closeout-workflow.test.ts` requires Daily Logs, field notes, blockers, and evidence to use canonical rows | Confirm Field UI links back to existing Daily Log / Job Note / evidence anchors               |
| Closeout readiness       | Helper coverage blocks duplicate closeout, issue, and punch-list models                                                 | Confirm readiness is advisory and does not mutate invoice, payment, or billing state          |
| Communications handoff   | Helper coverage requires review-first drafts and no autonomous customer sends                                           | Confirm `/communications` links are internal review handoffs, not provider/customer sends     |
| Ownership / portal / SQL | Helper coverage protects Field, Project, Financials, Portal, and schema boundaries                                      | Confirm no portal behavior, schema, migration, customer-facing send, or duplicate model drift |

## Existing Test Surface

- `playwright.config.js` defines setup, protected, portal, payment, and
  platform-admin projects with one worker and provider-safe payment defaults.
- `e2e/detail-workspace-ui.spec.js` verifies the authenticated route spine and
  core Project/Estimate/Contract/Invoice/Job workspace landmarks.
- `e2e/project-ai-cue-work-item-bridge.spec.js` verifies readiness-derived
  project cues and job/schedule handoffs without creating work items until
  the existing form is submitted.
- `e2e/schedule-ready-handoff.spec.js` verifies ready-to-schedule URL handoffs,
  dashboard queues, schedule panels, and no mutation on load.
- `e2e/golden-workflow-verification.spec.js` creates a disposable canonical
  chain and verifies protected browser continuity from converted opportunity
  through paid invoice, with optional same-record portal comparison when portal
  auth prerequisites exist.
- `e2e/portal-golden-path.spec.js` verifies authenticated portal project and
  customer-safe record visibility.
- `e2e/portal-contract-actions.spec.js` verifies portal signature actions on
  disposable canonical contracts.
- `e2e/portal-invoice-boundary.spec.js`,
  `e2e/portal-invoice-checkout-start.spec.js`, and
  `e2e/stripe-webhook-reconciliation.spec.js` verify payment boundaries,
  checkout-start, and webhook reconciliation.
- `apps/web/lib/verification/golden-workflow-checks.test.ts` verifies the V1
  pure helper layer for continuity, readiness bypass detection, signature
  completion, invoice/payment gates, portal linkage, and health confidence.
- `apps/web/lib/verification/operational-ownership.test.ts` verifies the
  operational ownership model, including dashboard/portal source-of-truth drift,
  partial settings evidence, and canonical lifecycle order drift.
- `apps/web/lib/verification/sales-to-production-readiness.test.ts` verifies
  the approved sales-to-production wave boundaries across canonical workflow
  continuity, readiness gates, operational ownership, no duplicate models,
  deposit readiness, schedule handoff, Settings ownership, and portal
  customer-safe boundaries.
- `apps/web/lib/verification/mobile-field-closeout-workflow.test.ts` verifies
  the approved mobile field closeout wave boundaries across canonical Daily
  Logs, field notes, execution attachments, closeout readiness, Communications
  review handoff, ownership, portal safety, and schema/migration drift.
- `apps/web/lib/verification/ux-ia-ownership.test.ts` verifies the approved
  visual UX review wave boundaries across Dashboard prioritization, Project
  diagnosis, Field execution, Financials billing/collections action,
  Communications conversation action, Portal customer safety, Reports
  summarize-and-route behavior, Settings configuration ownership, required
  implementation commit evidence, no duplicate models, and no schema/migration
  drift.

## Fixture And Auth Notes

The requested `docs/golden-workflow-playwright-phase-1-fixtures.md` file is not
present in this worktree. Current fixture truth is distributed across
`docs/e2e-browser-qa.md`, `docs/local-auth-qa-recovery.md`,
`scripts/portal-e2e-fixture.mjs`, `scripts/e2e-second-tenant-fixture.mjs`, and
the fixture setup embedded in the focused E2E specs.

Fixture writes remain guarded by explicit env flags and must create canonical
dev/test records only.
