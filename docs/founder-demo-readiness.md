# Founder Demo Readiness

Status: Active
Doc Type: QA / Demo

This document is the rehearsal script for showing FloorConnector to prospective early-access contractors. It packages the current implemented app into one reliable operating story without creating demo-only records, fake auth, stored PDFs, live billing launch, or a parallel workflow.

Read this with [docs/current-state.md](C:/FloorConnector/docs/current-state.md), [docs/workflows.md](C:/FloorConnector/docs/workflows.md), [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md), [docs/founder-prospect-demo-script.md](C:/FloorConnector/docs/founder-prospect-demo-script.md), [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md), [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md), and [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md).

## Demo Story

FloorConnector is one connected operating path for specialty flooring contractors:

`setup -> lead -> customer/project -> estimate -> contract -> invoice/payment -> schedule/job -> portal -> print/save documents`

The demo should feel like a contractor can start with a real prospect, keep the commercial and operational chain connected, bring the customer into the portal, and leave with customer-facing estimate, contract, and invoice documents that can be printed or saved from the browser.

For the first external conversations, use [docs/founder-prospect-demo-script.md](C:/FloorConnector/docs/founder-prospect-demo-script.md). That script defines who to invite first, what to show in 20-minute and 45-minute demos, what caveats to state plainly, how to collect feedback, and how to decide the next build slice from actual founder-prospect friction.

## Baselines To Preserve

- Use real Supabase auth and the configured local E2E accounts.
- Use existing contractor, portal customer, and platform-admin roles.
- Keep the canonical lifecycle intact: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Do not seed demo-only records during the walkthrough.
- Do not bypass readiness gates, tenant scope, portal access scope, payment state, signature state, or activation controls.
- Keep SaaS billing separate from contractor-customer invoice payments.
- Treat print/save documents as browser-rendered views of existing records, not stored PDF files or a document source of truth.

## Controlled Founder Prospect Mode

For the first one or two external founder-prospect demos, this rehearsal path is an operating script, not a product-build checklist. Pair it with [docs/founder-prospect-demo-script.md](C:/FloorConnector/docs/founder-prospect-demo-script.md) and [docs/founder-prospect-feedback.md](C:/FloorConnector/docs/founder-prospect-feedback.md).

Before the call:

- Choose a trusted prospect who fits the founder profile and will give direct feedback.
- Rehearse the 20-minute path first; use the 45-minute path only when the prospect has time and fit is strong.
- Confirm contractor, platform-admin, and portal customer sessions only for the roles being shown.
- Confirm the known project/estimate/contract/invoice/job and portal fixture routes.
- Keep the do-not-click list visible to the operator.
- Prepare a private notes surface for feedback, blockers, and next-slice signals.

During the call:

- Show the connected workflow, not every setting.
- Narrate caveats as controlled gates: live billing, activation, AI, document storage, scheduling depth, reporting, import/export, and support are intentionally bounded.
- Stop before live Stripe, customer payment checkout, activation, external sends, temporary credentials, invite-token copy, payment mutation, or signature mutation.

After the call:

- Complete the feedback worksheet the same day.
- Mark missing capabilities as prospect friction only, not automatic build commitments.
- Recommend one next build slice from the approved list: estimate/catalog/materials depth, scheduling/dispatch depth, manager/mobile polish, import/export readiness, reporting/dashboard depth, live billing readiness controls, or onboarding/marketing polish.

## Role And Env Assumptions

Names only; do not print values in demo notes, chat, logs, or screenshots.

- Contractor auth: `FLOORCONNECTOR_E2E_EMAIL`, `FLOORCONNECTOR_E2E_PASSWORD`, `PLAYWRIGHT_STORAGE_STATE`
- Portal customer auth: `FLOORCONNECTOR_PORTAL_E2E_EMAIL`, `FLOORCONNECTOR_PORTAL_E2E_PASSWORD`, `PLAYWRIGHT_PORTAL_STORAGE_STATE`
- Platform admin auth: `FLOORCONNECTOR_PLATFORM_E2E_EMAIL`, `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`
- Portal fixture paths: `FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH`, `FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH`, `FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH`, `FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH`
- Contractor fixture paths: `FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH`, `FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH`, `FLOORCONNECTOR_E2E_CUSTOMER_DETAIL_PATH`
- SaaS billing test-mode setup: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_FOUNDER_PLAN_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`

## Route Order

1. `/setup/company`
   - Proves the contractor can establish the company profile used by the operating app and branded customer-facing documents.
2. `/setup/billing`
   - Proves paid early-access setup is separated from tenant activation and contractor-customer payments.
3. `/setup/pending-activation`
   - Proves the contractor can keep building real records while external customer-facing actions stay guarded until activation.
4. `/dashboard?fresh=true`
   - Proves the app opens as an operating command center, not a pile of disconnected modules.
5. `/leads`
   - Proves opportunity intake can move into the sales-to-production chain.
6. `/customers`
   - Proves customer accounts and contact details remain the commercial anchor.
7. `/projects` and one project detail route
   - Proves Project is the operational hub, with connected record lanes and readiness context.
8. `/estimates` and one estimate detail route
   - Proves proposal review, customer/project context, editor handoff, and downstream contract/invoice/job continuity.
9. `/estimates/[estimateId]/pdf`
   - Proves the estimate can become a calm customer-facing print/save deliverable.
10. `/contracts` and one contract detail route
    - Proves approved-estimate context, signer readiness, and contract review.
11. `/contracts/[contractId]/pdf`
    - Proves the contract can be printed or saved without creating a separate document model.
12. `/invoices` and `/payments`
    - Proves billing and collections stay tied to invoices, customers, projects, and payment history.
13. `/invoices/[invoiceId]/pdf`
    - Proves invoice review can become a customer-facing print/save document.
14. `/jobs` and `/schedule`
    - Proves signed/ready work can move into job and scheduling follow-through.
15. `/people`
    - Proves customer portal access is contact-centered and managed from People instead of scattered across every record.
16. `/portal`
    - Proves the customer can review project, estimate, contract, invoice, and print/save routes with scoped access.
17. `/portal/estimates/[estimateId]/pdf`, `/portal/contracts/[contractId]/pdf`, `/portal/invoices/[invoiceId]/pdf`
    - Proves portal print/save documents use safe contractor organization branding.
18. `/super-admin/billing`
    - Proves platform operators can review SaaS billing configuration health, Checkout readiness, webhook health, subscription references, manual billing evidence, and activation separation without live billing mutation.
19. `/super-admin/early-access`
    - Proves platform operators can review early-access tenant readiness and activation evidence without automatic activation or live billing mutation.

## Records Needed

- One contractor organization with company display name and, where available, branding/contact fields.
- One lead/opportunity with customer and project handoff context.
- One customer account with a real linked contact.
- One project connected to that customer.
- One estimate linked to the project.
- One contract generated from or linked to that project/estimate.
- One invoice linked to the project/customer, ideally with a visible balance/payment state.
- One job linked to the project.
- One portal customer account with a contact-centered portal grant and project visibility.
- Portal-visible estimate, contract, and invoice records for the granted project.
- One platform-admin account with access to `/super-admin/billing` and `/super-admin/early-access`.

## What Each Screen Should Prove

- Setup screens prove onboarding is real but activation remains controlled.
- Dashboard proves the contractor has a high-level operating command center.
- Leads prove sales intake flows into the same customer/project chain.
- Customers and People prove account/contact/access ownership is intentional.
- Project proves operational continuity across commercial, billing, schedule, field, and portal context.
- Estimate proves proposal review and authoring are connected to downstream work.
- Contract proves signature status lives on the same shared contract record.
- Invoice and Payments prove money owed and money collected stay connected.
- Jobs and Schedule prove operational execution starts from ready project/job context.
- Portal proves the customer sees only scoped, customer-safe records.
- Print/save routes prove customer-facing documents are presentable today through browser print/save.
- Super admin proves billing operations and early-access activation are visible and operator-controlled.

## Do Not Click Without Explicit Test Scope

- Live Stripe Checkout or Stripe Customer Portal links.
- Customer-facing invoice payment checkout unless the run is explicitly configured for safe test-mode payment QA.
- `/super-admin/early-access` activation actions unless the target tenant and evidence are intentionally selected.
- `DEV / TEST ONLY` reset controls outside a local/test rehearsal.
- Temporary portal credential generation unless demonstrating a support recovery path for a safe test contact.
- Raw invite-link copy actions in a shared call where the link could be exposed.

## Safe Prospect Language

- "These documents are browser print/save views of the live record today; stored PDF versioning is a later document-management layer."
- "Early-access billing setup is intentionally separated from activation so a founder tenant can be reviewed before external customer actions are unlocked."
- "Portal access is scoped to the customer contact and visible projects, not a separate customer database."
- "Payments and signatures stay on the same invoice and contract records; we are not demoing a fake payment or signature system."
- "Scheduling is good enough to show project-to-job handoff and work planning; deeper dispatch-grade scheduling is a future expansion."

## Fallback Paths

- If portal email send is unavailable, use the app-managed portal invite or temporary credential support only with a safe test contact. Do not reveal raw invite tokens in shared materials.
- If a portal linked record is missing, use `pnpm e2e:portal-fixture` to identify the missing fixture by prerequisite name, then repair the dev/test fixture only when write mode is intentionally enabled.
- If protected routes redirect to `/login`, refresh contractor storage state with `pnpm e2e:auth` using the same `PLAYWRIGHT_BASE_URL`.
- If platform admin is denied, confirm the platform role with the documented platform-admin grant/status commands before the demo.
- If Stripe test-mode setup is incomplete, show `/setup/billing` readiness and explain that live billing launch is intentionally gated.
- If the Stripe key prefixes are not safely recognizable as test mode (`sk_test_` for `STRIPE_SECRET_KEY`, `pk_test_` for `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), the app-managed platform billing price reference is missing, or the SaaS webhook signing secret is not configured, do not run Product/Price setup, subscription Checkout, or Stripe CLI replay during the demo; state that the billing bridge is implemented but awaiting operator test-mode replay.
- If a local development run shows Next.js development tooling in the viewport, use a production-style demo run rather than treating development chrome as part of the product. The app's own `DEV MODE / Reset session` helper is opt-in for local QA through `FLOORCONNECTOR_SHOW_DEV_QA_TOOLS=1` and should stay off for founder-demo screenshots.

## Print/Save Document Steps

1. Open the estimate detail route and click `Print / save PDF`.
2. Confirm the print view shows contractor branding, customer/project context, line items, totals, and a calm footer.
3. Open the browser print dialog only if the prospect asks to see browser save-as-PDF behavior.
4. Repeat for contract and invoice.
5. Switch to the portal customer session and repeat the estimate, contract, and invoice print/save routes from customer scope.

## Super Admin Billing And Early-Access Steps

1. Sign in with platform-admin auth.
2. Open `/super-admin/billing`.
3. Explain names-only Stripe configuration health, Checkout readiness, webhook status, subscription references, manual billing evidence, and manual activation boundary.
4. Open `/super-admin/early-access`.
5. Explain the tenant buckets, setup progress, and manual activation boundary.
6. Do not activate or reset a tenant unless the run is explicitly scoped as a local/test operator rehearsal.

## QA Commands

```bash
pnpm typecheck
pnpm lint
git diff --check
pnpm e2e:auth
pnpm e2e:super-admin
pnpm exec playwright test e2e/customer-detail-ui.spec.js --project=chromium-protected
pnpm exec playwright test e2e/people-directory-access.spec.js --project=chromium-protected
pnpm exec playwright test e2e/project-detail-ui.spec.js --project=chromium-protected
pnpm exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected
pnpm exec playwright test e2e/schedule-ready-handoff.spec.js --project=chromium-protected
pnpm exec playwright test e2e/estimate-document-pdf-delivery.spec.js --project=chromium-protected
pnpm e2e:portal-fixture
pnpm e2e:portal-auth
pnpm e2e:portal
pnpm exec tsx --test apps/web/lib/platform-admin/billing-operations-core.test.ts apps/web/lib/platform-admin/stripe-test-plan-setup.test.ts apps/web/lib/onboarding/saas-billing-checkout-core.test.ts apps/web/lib/onboarding/saas-billing-webhook-core.test.ts
```

Run shared-webServer Playwright commands sequentially unless each command uses an isolated base URL and port.

## Current Limitations To State Honestly

- Print/save documents are browser HTML renderings, not stored generated PDF bytes.
- No stored document versioning or full document management system is implemented.
- Live SaaS billing launch, automatic activation, entitlement enforcement, and Stripe Customer Portal are deferred.
- Customer-facing external sends and payment processing remain activation-guarded where applicable.
- Scheduling is a good-enough command surface, not a full dispatch board.
- Direct one-off invoice shortcuts remain intentionally out of scope.

## Latest Dry Run Notes

Date: 2026-05-14

Screenshot package:

```text
C:\Users\veron\AppData\Local\Temp\floorconnector-founder-demo-final-dry-run-2026-05-14T10-47-41-629Z
```

Coverage captured:

- contractor setup, billing, pending activation, dashboard, lead, customer, project, estimate, contract, invoice, payment, job, schedule, and People/access routes
- linked lead, customer, project, estimate, contract, invoice, and job workspaces where fixture data was available
- contractor estimate, contract, and invoice print/save routes
- portal home, project, estimate review, contract review, invoice review, all three portal print/save routes, and platform-admin billing/early-access routes

Dry-run results:

- all captured routes loaded with authenticated storage states and no 404s
- `/setup/billing` rendered the safe billing-unavailable state while the local Stripe SetupIntent endpoint returned a background 500 in the dry-run console; keep live Checkout and payment setup out of founder demos unless test-mode Stripe is explicitly configured
- 2026-05-15 Stripe SaaS replay prep found Stripe key prefixes not safely recognizable as test mode, no app-managed platform billing Product/Price reference, `STRIPE_FOUNDER_PLAN_PRICE_ID` missing, and `STRIPE_WEBHOOK_SECRET` blank locally, so no Product/Price action, Checkout Session, Stripe CLI forwarding, or webhook replay was started; Billing Operations explains the blocked state by safe prefix and keeps billing in the caveated demo lane until test-mode credentials, app-managed price reference, and webhook signing secret are ready
- the 2026-05-15 authenticated follow-up refreshed platform-admin state and confirmed `/super-admin/billing`, `/super-admin/early-access`, `/setup/billing`, and `/setup/pending-activation` load against the running local app; checkout/replay remains blocked until the Stripe test-mode prerequisites above are fixed
- the guarded retry for SaaS billing repeated the credentials-first stop before Stripe mutation: Product/Price setup was not attempted because the secret key prefix was still not safely recognizable as `sk_test_`, and Checkout/replay stayed blocked by the missing webhook secret and missing platform price reference
- after the env fix, Billing Operations and Stripe test Checkout can be shown as working in test mode: the Product/Price reference is stored, `/setup/billing` sees Billing Operations as the plan source, and test Checkout returns to FloorConnector; do not claim webhook-confirmed subscription status yet because reconciliation is blocked until an active `subscription_plans` row exists
- the follow-up recheck confirmed Billing Operations/setup pages still load authenticated with the test-mode env prefix gate and Product/Price reference ready; do not run another test Checkout in demo rehearsal until the canonical SaaS subscription plan row exists, because the webhook cannot create `company_subscriptions` without it
- the SaaS billing closeout seeded the canonical `founder-default` plan catalog row and completed signed Stripe test-mode webhook reconciliation: Billing Operations can now show reconciled subscription status/current period evidence while activation remains manual and contractor-customer payments stay untouched
- no protected route stopped at `/login` during the main dry run
- no Checkout, activation, reset, temporary credential, payment, signature, or invite-copy action was clicked
- small copy cleanup removed visible internal `canonical` / `provider-backed` wording from the lead workspace, customer workspace summary, and customer-facing print footer language
- the local app `DEV MODE / Reset session` helper is now hidden by default unless `FLOORCONNECTOR_SHOW_DEV_QA_TOOLS=1` is set

Remaining rehearsal notes:

- run the first prospect demo from a clean production-style browser session so local development indicators do not appear on screen
- keep the `Send Feedback` entry visible for early-access demos unless the specific call needs a cleaner presentation
- use the portal fixture path for customer-side proof and stop before customer payment checkout unless the run is explicitly scoped for safe test-mode payment QA
