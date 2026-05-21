# Founder Contractor Testing Readiness

Status: Active
Doc Type: QA / Readiness
Date: 2026-05-20

This document is the controlled-testing readiness checkpoint for inviting a
trusted founder contractor into FloorConnector. It is grounded in implemented
truth from [docs/current-state.md](C:/FloorConnector/docs/current-state.md) and
the operating workflow docs. It is not a roadmap promise, demo seed plan, or
permission to bypass auth, portal access, payment, signature, activation, or
provider-send guardrails.

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

FloorConnector is close to being useful for a guided founder-contractor pilot.
The core operating chain is no longer a set of isolated forms: sales, project
continuity, commercial documents, portal review/sign/pay, job/schedule, time,
equipment readiness, service/warranty, warranty documents, and document delivery
proof now all attach to canonical records.

The current recommendation is **conditional no-go for an unassisted external
pilot** until the production build is green and the pilot fixture/auth path is
rehearsed end to end. It is reasonable to run an **internal founder-guided
rehearsal** after the build blocker is fixed, using controlled data and clearly
documented prerequisites.

The main reason to pause is QA trust, not product absence: the system has enough
depth that weak fixtures, stale portal grants, missing provider config, or a
broken production build would create false product feedback.

## Ready For Controlled Testing

These areas are ready to include in a controlled, founder-guided rehearsal when
fixture data exists:

- Dashboard Operational Cockpit as a read-only command center over canonical
  records.
- Lead/opportunity intake through customer, project, and estimate handoff.
- Customer and Project Workspaces as account and continuity hubs.
- Estimate detail/editor, portal review/approval, print/save, delivery history,
  and provider-backed review email.
- Contract detail, signature readiness, portal review/sign/decline,
  print/save, manual delivery proof, and provider-backed send-for-signature
  email through the existing contract signing workflow.
- Change-order manager/detail and portal approval where fixture data exists.
- Invoice detail, portal review/payment, print/save, delivery history, and
  provider-backed review/payment email that does not start checkout.
- Payments manager and payment-event truth for payment review.
- Jobs, Schedule, Daily Logs, and job handoffs from the canonical project/job
  chain.
- Time clocking, crew clock-in, derived time-card review, exception visibility,
  and service/warranty time attribution.
- Equipment registry, job equipment requirements, assignments, and advisory
  readiness warnings on job, schedule, project, and dashboard surfaces.
- Service tickets tied to customer/project/original job context.
- Service jobs created as canonical jobs through service-ticket context.
- Warranty templates, canonical warranty documents, print/save, internal signer
  management, delivery proof, provider-backed warranty review/sign email, and
  portal warranty review/sign/decline.
- Portal project, estimate, contract, invoice, payment-action, and warranty
  document review surfaces through scoped access.
- Settings for templates, workflow/guidance, organization, and related
  operating configuration.
- Super-admin billing and early-access review where platform-admin auth exists.

## Not Ready Yet

These should be stated plainly during founder testing:

- Public self-serve contractor onboarding and unassisted production rollout.
- Provider callbacks for delivered/opened/clicked/bounced delivery
  reconciliation.
- Resend/retry orchestration for provider-backed sends.
- Stored generated PDFs or versioned document file storage.
- Portal service-ticket request intake or customer-visible service-ticket
  status.
- Portal-visible delivery proof.
- External e-sign provider integration or provider-owned signature truth.
- Payroll export, GPS verification, overtime/pay-period policy, and admin time
  correction events.
- Job costing, AP/bills, manufacturer claims, warranty billing automation, and
  service labor cost reporting.
- Dispatch-grade schedule board, auto-rescheduling, route optimization, or
  equipment capacity automation.
- Full material reservation, issue, return, purchasing, or inventory execution.
- Autonomous AI actions.

## Current Readiness Risks

- The most recent production build check compiles successfully but fails during
  Next page-data collection with `Cannot find module for page: /_document`.
  Do not invite a contractor until `pnpm.cmd --filter @floorconnector/web build`
  is green.
- The working tree is heavily dirty with unrelated `.tmp.driveupload` churn and
  financial/dashboard files modified outside this readiness pass. Keep pilot
  validation results tied to the exact branch/worktree state.
- Portal testing requires real portal customer auth, active portal grants,
  project visibility, and linked shared records. Login, access denied, or empty
  portal pages are not successful portal QA unless denial is the expected test.
- Provider-backed sends require the existing Postmark/activation guard path. A
  missing provider config should produce honest failed/no-send evidence, not a
  fake sent state.
- Payment QA must use safe test/local payment configuration and should not click
  live checkout during a contractor pilot.
- Service/warranty, equipment, and clocking need fixture records that resemble a
  real post-install workflow; otherwise the surfaces will look empty even when
  the implementation exists.

## Routes To Test

- `/dashboard`
- `/leads` and `/leads/[leadId]`
- `/customers` and `/customers/[customerId]`
- `/projects` and `/projects/[projectId]`
- `/estimates`, `/estimates/[estimateId]`, `/estimates/[estimateId]/edit`, and
  `/estimates/[estimateId]/pdf`
- `/contracts`, `/contracts/[contractId]`, `/contracts/[contractId]/edit`, and
  `/contracts/[contractId]/pdf`
- `/change-orders` and `/change-orders/[changeOrderId]`
- `/invoices`, `/invoices/[invoiceId]`, `/invoices/[invoiceId]/edit`, and
  `/invoices/[invoiceId]/pdf`
- `/payments`
- `/jobs` and `/jobs/[jobId]`
- `/schedule`
- `/daily-logs` and `/daily-logs/[dailyLogId]`
- `/time` and `/time-cards/[timeCardId]`
- `/equipment` and `/equipment/[equipmentId]`
- `/service-tickets` and `/service-tickets/[ticketId]`
- `/warranty-documents/[warrantyDocumentId]` and
  `/warranty-documents/[warrantyDocumentId]/print`
- `/portal`, `/portal/projects/[projectId]`, portal estimate/contract/change
  order/invoice/warranty routes, and portal print/save routes.
- `/settings`, `/settings/templates`, `/settings/workflows`, and relevant
  organization/configuration settings.
- `/super-admin/billing` and `/super-admin/early-access` with platform-admin
  auth only.

## Required Env And Config Prerequisites

Use names only in logs and reports. Do not print secret values.

- Local app env source: `C:/FloorConnector/.env.local`
- Contractor auth: `FLOORCONNECTOR_E2E_EMAIL`,
  `FLOORCONNECTOR_E2E_PASSWORD`, `PLAYWRIGHT_STORAGE_STATE`
- Portal customer auth: `FLOORCONNECTOR_PORTAL_E2E_EMAIL`,
  `FLOORCONNECTOR_PORTAL_E2E_PASSWORD`,
  `PLAYWRIGHT_PORTAL_STORAGE_STATE`
- Platform admin auth: `FLOORCONNECTOR_PLATFORM_E2E_EMAIL`,
  `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`
- Portal fixture paths: `FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH`,
  `FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH`,
  `FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH`,
  `FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH`
- Contractor fixture paths: `FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH`,
  `FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH`,
  `FLOORCONNECTOR_E2E_CUSTOMER_DETAIL_PATH`
- Portal fixture repair: `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1` only for
  explicit local/dev fixture creation or repair.
- Payment testing: local/test payment gateway configuration only; do not use
  live payment credentials in pilot rehearsal.
- Provider send testing: existing Postmark config and activation guard, or
  expected blocked/no-send evidence if provider config is intentionally absent.

## Fixture Prerequisites

The strongest pilot fixture has one connected customer/project chain with:

- one lead/opportunity and primary customer contact
- one customer and one active project
- one estimate linked to the project and visible in the portal
- one contract linked to the project, with an eligible customer signer
- one open invoice linked to the project/customer
- one payment history surface, with test-mode payment behavior only
- one job linked to the project and visible on the schedule
- one daily log or field record where available
- one equipment asset, one job equipment requirement, and one assignment or
  missing-assignment warning
- one worker/person eligible for clocking and manager review
- one service ticket linked to customer/project/original job
- one canonical service job linked to the service ticket
- one warranty document tied to the project/service ticket with a customer signer
- one portal customer user whose email matches expected signer/contact records
  and has project-scoped access

## Manual Pilot Test Script

1. Sign in as a contractor owner/admin/manager and open `/dashboard`.
2. Confirm dashboard items link to real record workspaces and do not imply
   dashboard-owned state.
3. Review `/leads`, open a lead, and confirm the opportunity can be understood
   as the start of the customer/project/estimate chain.
4. Open the linked customer and project. Confirm Project Workspace is the
   continuity hub.
5. Open an estimate, review/edit line-item context, send the portal review link
   if provider testing is in scope, and confirm delivery history records honest
   sent or failed evidence.
6. Switch to portal auth and review/approve the estimate when that test is in
   scope.
7. Open the contract, confirm signer/readiness state, send for signature, and
   confirm delivery history is separate from signature history.
8. Sign or decline the contract through the portal only with a safe portal test
   account.
9. Open the invoice, send the portal review/payment link if provider testing is
   in scope, and confirm email send does not start checkout or mutate payment
   state.
10. Exercise portal invoice review/payment only under safe local/test payment
    configuration.
11. Open `/jobs` and `/schedule`, confirm job readiness, schedule handoff, crew
    context, and linked project continuity.
12. Open equipment registry/detail, then the job/schedule/project surfaces that
    show equipment requirements, assignments, or advisory warnings.
13. Open `/time`, clock a worker or crew against a project/job, review recent
    punch events, then inspect the derived time-card review surface.
14. Create or inspect a service ticket, link/create its service job, and confirm
    service work stays on canonical customer/project/job context.
15. Create or inspect a warranty document, review signer state, delivery
    history, print/save, provider-backed review/sign email, and portal
    warranty sign/decline.
16. Return to Project, Customer, and Job Workspaces to verify service/warranty
    continuity panels make the loop understandable.
17. Review Settings templates/workflow guidance for contractor setup clarity.
18. Review Super Admin billing/early-access only with platform-admin auth and no
    accidental activation or live billing actions.
19. Record friction by workflow owner, fixture dependency, and severity. Do not
    convert every comment into an automatic feature commitment.

## High-Risk Workflows

- Portal auth, grants, and signer-email matching.
- Contract signature readiness and signature-event ownership.
- Invoice payment boundary and checkout start.
- Provider-backed send activation/config handling and failed/no-send evidence.
- Warranty portal review/signing with project-scoped access.
- Time clocking state transitions and time-card rebuild/review behavior.
- Equipment readiness warnings staying advisory.
- Service job creation staying on canonical jobs rather than a detached service
  calendar.
- Root marketing build/prerender path.

## Test Coverage Snapshot

Covered areas found during this readiness pass include:

- provider-backed send helpers for warranty documents, estimates, invoices, and
  contracts
- document delivery schema and migration guardrails
- warranty document rendering, schemas, migrations, generic signature
  foundation, delivery events, continuity, and portal signer email checks
- service-ticket schema and linked service-job migrations
- equipment readiness derivation and assignment/readiness migration guardrails
- time transitions, exceptions, review-state migration, and
  service/warranty-time migration guardrails
- portal estimate, contract, change-order, invoice/payment, and golden-path E2E
  coverage where fixture/auth is configured
- dashboard, project/detail workspace, schedule handoff, customer detail, and
  people/access E2E smoke coverage

Missing or fixture-dependent areas:

- browser smoke coverage for portal warranty review/signing with real fixture
  data
- browser smoke coverage for service-ticket detail and service-job handoff
- browser smoke coverage for equipment warnings across Job/Schedule/Project
  with stable fixture data
- browser smoke coverage for `/time` clocking and manager review over a stable
  worker/project/job fixture
- provider-send browser smoke across all document workspaces
- full end-to-end contractor pilot script across one connected project fixture

## Go / No-Go Recommendation

**No-go for unassisted external contractor testing today** until:

- `pnpm.cmd --filter @floorconnector/web build` is green.
- Contractor, portal, and platform-admin storage states are refreshed.
- Portal fixture validation passes or records exact missing prerequisites.
- One connected pilot fixture is selected and rehearsed.
- Provider-send mode is decided: configured Postmark test path or expected
  guarded no-send evidence.
- Payment mode is decided: safe local/test only, with no live checkout.

**Conditional go for internal founder-guided rehearsal** once the build is
green. Keep the facilitator in the loop, avoid live payment/provider surprises,
and capture friction as testing evidence rather than immediate scope expansion.

## Owner Actions Before Inviting Contractors

- Fix the current production build blocker and rerun validation.
- Choose the single pilot org/project/customer chain.
- Confirm `.env.local` has the required auth, portal, payment, and provider
  prerequisites for the intended test mode.
- Run the manual script once internally with screen sharing off.
- Decide what is explicitly out of bounds for the first contractor session.
- Prepare a feedback capture sheet organized by workflow, severity, and
  whether the issue is product, fixture, copy, performance, or missing future
  depth.

## Recommended Validation Commands

```powershell
pnpm.cmd typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd --filter @floorconnector/web build
git diff --check
pnpm.cmd e2e:auth
pnpm.cmd e2e:portal-fixture
pnpm.cmd e2e:portal-auth
pnpm.cmd e2e:portal
pnpm.cmd e2e:payments
pnpm.cmd exec playwright test e2e/dashboard-ui.spec.js --project=chromium-protected
pnpm.cmd exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected
pnpm.cmd exec playwright test e2e/project-detail-ui.spec.js --project=chromium-protected
pnpm.cmd exec playwright test e2e/schedule-ready-handoff.spec.js --project=chromium-protected
```

Run the focused Node test groups for document delivery/send, warranty
documents, service tickets, equipment, and time when working locally. Treat
missing auth/fixture prerequisites as blocked, not passed.
