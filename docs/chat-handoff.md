## REQUIRED FIRST STEP

Before doing anything, developers must read:

docs/developer-source-of-truth.md

`docs/developer-source-of-truth.md` defines:
- system rules
- canonical lifecycle
- workflow constraints
- implementation guardrails

Do not proceed without it. This chat handoff is only a launcher and compact operational orientation; it is not a competing source of truth.

# Chat Handoff

Status: compact operational handoff for the current branch.

Use this file for fast orientation after reading [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md). For exact implemented truth, defer to [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

For stronger implementation control on new tasks, also use:
- [docs/product-brain.md](C:/FloorConnector/docs/product-brain.md)
- [docs/decisions.md](C:/FloorConnector/docs/decisions.md)
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md)
- [docs/codex-workflow.md](C:/FloorConnector/docs/codex-workflow.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md)
- [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)
- [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md)
- [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- [docs/local-qa-auth-session-note.md](C:/FloorConnector/docs/local-qa-auth-session-note.md)
- [docs/qa-estimate-send-approval-contract-prerequisites.md](C:/FloorConnector/docs/qa-estimate-send-approval-contract-prerequisites.md)

## Platform Super Admin Access Cleanup

Super-admin authorization now stays strictly on the platform role assignment layer:
- `/super-admin` and nested routes require a `platform_user_roles` assignment to the existing platform `platform_admin` role.
- Contractor organization roles (`owner`, `admin`, `manager`, `member`) do not imply super-admin access.
- The old first-visitor bootstrap behavior in the super-admin access helper was removed; visiting `/super-admin` no longer grants platform access when no assignments exist.
- First platform admin setup is explicit through `pnpm platform-admin grant <email>` or `PLATFORM_SUPER_ADMIN_EMAIL` plus `pnpm platform-admin grant`.
- `jfilamonte@gmail.com` is intended to remain a normal contractor owner/test account, not a platform operator. Use `pnpm platform-admin revoke jfilamonte@gmail.com` and `pnpm platform-admin status jfilamonte@gmail.com` to verify it has no platform role while retaining contractor membership.
- The helper requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; it does not create contractor organizations or memberships.
- `platform@floorconnector.com` is the intended local platform operator account, but it must sign up or log in through the normal Supabase Auth flow once before the grant script can find it in `public.users`.
- Focused Playwright coverage now lives in `e2e/super-admin-access.spec.js` with the `chromium-super-admin-access` project and `pnpm e2e:super-admin`. It uses contractor auth from `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD` and platform auth from `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` / `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`.

Manual QA checklist:
- Sign in as the configured platform admin and open `/super-admin`; confirm the platform admin surface loads.
- Sign in as `jfilamonte@gmail.com` or another contractor-only owner and open `/super-admin`; confirm it redirects to `/dashboard?error=Platform+admin+access+is+required.`.
- As the contractor-only account, open normal contractor routes such as `/dashboard`, `/projects`, and `/settings`; confirm contractor access still works.
- Run `pnpm platform-admin status jfilamonte@gmail.com` and confirm `Platform roles: none`.

Latest verification note:
- `platform@floorconnector.com` now exists as a real auth/canonical user and `pnpm platform-admin status platform@floorconnector.com` confirms `Platform roles: platform_admin`.
- After real login, the existing auth bootstrap may also create a normal contractor owner membership for the platform account; that membership is not required for `/super-admin` and does not grant platform access.
- `pnpm platform-admin status jfilamonte@gmail.com` confirms `Platform roles: none` and contractor membership `jfilamonte: owner (active)`.
- `.env.local` includes the local-only dual-account Playwright variables for `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD` and `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` / `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`.
- `jfilamonte@gmail.com` completed the real `/setup/company` flow through the app UI during verification so contractor route-continuity checks can reach `/dashboard`, `/projects`, and `/settings`.
- `pnpm e2e:super-admin` passes and generates both local auth storage states through the real login flow.

## Early Access Build Complete

Final early-access onboarding/demo status is documented here for the next session. This is the current operational summary; defer to [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for full implemented truth and [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for canonical workflow rules.

## Stripe Verification Blocked

- `.env.local` currently has blank `STRIPE_SECRET_KEY`.
- `.env.local` currently has blank `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Required values must be Stripe test-mode keys:
  - `sk_test_...`
  - `pk_test_...`
- After adding keys, restart the dev server.
- Rerun `/setup/billing`.
- Verify test card `4242 4242 4242 4242`.
- Verify declined card `4000 0000 0000 9995`.
- Verify no charge and no subscription.
- Verify `companies.stripe_customer_id`.
- Verify `companies.stripe_payment_method_id`.

## Pricing And Activation Readiness Copy

Completed a minimal pricing + activation-readiness layer without adding billing automation, schema, duplicate account models, or subscription creation.

Files changed in this pass:
- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/components/platform-admin/activate-company-form.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/data.ts`
- `docs/chat-handoff.md`

Behavior:
- The public homepage now includes a pricing section with early-access positioning:
  - `Starter / Early Access`
  - `Pro / Coming Soon`
  - `Enterprise / Contact Us`
- Homepage pricing copy explicitly says early access is limited, there is no charge during onboarding, pricing is confirmed before activation, and the current flow does not create charges or subscriptions automatically.
- `/super-admin/early-access` now shows derived activation readiness from existing records only:
  - company profile started from existing `companies` profile fields
  - payment method saved from `companies.stripe_payment_method_id`
  - estimate stage reached from canonical estimate counts
  - guarded external actions locked until `companies.tenant_status = active` and `companies.lifecycle_state = active`
- `Mark active` confirmation now warns that active unlocks guarded production actions, while billing or subscription setup remains a separate operator action unless already implemented.
- Dashboard active-state copy now shows calm `Account active` status. If no payment method exists, it prompts the user to add a billing method. If a payment method exists, it shows `Billing method saved`.

Guardrail status:
- Activation still uses the existing `companies.tenant_status` and `companies.lifecycle_state` fields.
- Activation does not create a Stripe charge.
- Activation does not create a Stripe subscription.
- Activation does not create or update a duplicate billing, company, account, or tenant model.
- The existing SetupIntent-only `/setup/billing` path remains the only card-readiness shell.

Remaining Stripe test-card blocker:
- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` still need valid Stripe test-mode values in `C:/FloorConnector/.env.local`.
- Restart the dev server after adding keys.
- Verify `/setup/billing` with a Stripe test card before claiming payment-method collection is fully tested.
- Do not claim subscriptions, recurring billing, plan enforcement, or automatic charging are implemented.

## Early Access Intake And Feedback Capture

Completed a minimal early-access intake + feedback layer using existing canonical data only. No tables, schemas, analytics system, sandbox/demo mode, billing logic, activation logic, or canonical lifecycle behavior were added or changed.

Files changed in this pass:
- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/components/early-access-request-form.tsx`
- `apps/web/components/early-access-help-button.tsx`
- `apps/web/lib/early-access/actions.ts`
- `apps/web/lib/early-access/intake.ts`
- `apps/web/lib/early-access/feedback-actions.ts`
- `apps/web/lib/early-access/feedback.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `packages/config/src/env/server.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:
- `/` now includes an optional `Request Early Access` form alongside `Start Free Trial`.
- Public request fields are name, email, company name, trade/service type, and short note.
- Requests write to existing canonical records:
  - `contacts` with `contact_kind = general_inquiry`
  - `opportunities` with `source = early_access` and `source_detail = homepage_request`
- Production public intake must set `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` to the existing canonical company that owns public intake leads.
- If `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is missing in production, the public form returns user-friendly fallback copy and does not write to an arbitrary tenant.
- Non-production fallback uses the oldest existing company only so local/manual QA can submit without adding a setup table.
- Protected contractor routes now show a floating `Send Feedback` entry.
- The feedback entry opens a modal with message and optional email.
- Feedback writes to the existing tenant-scoped `workflow_error_events` table with `action = early_access.feedback`, `subject_type = company`, and `subject_id = companies.id`.
- `/super-admin/early-access` now shows:
  - feedback captured / no feedback indicator
  - recent-feedback link per company
  - recent-feedback panel on the same page
  - recent-login signal derived from `company_memberships.last_active_at` and `users.last_sign_in_at`
  - reached-estimate and reached-contract flags derived from existing estimate/contract counts

Known gap:
- There is still no purpose-built company-level feedback/internal-note table. Feedback uses `workflow_error_events` because it is the only existing tenant-scoped company-level internal signal store that does not require a project/customer communication thread or daily-log field note.
- Public pre-auth intake is tenant-owned because `opportunities` are tenant-owned. Production must configure the intake company explicitly with `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`.

## Early Access Production Readiness

Completed the production-readiness closeout for early-access intake and feedback without adding product features, schema, billing logic, activation logic, analytics, or sandbox/demo mode.

Operational truth:
- Public early-access intake storage remains existing `contacts` plus `opportunities`.
- Feedback storage remains existing tenant-scoped `workflow_error_events` rows with `action = early_access.feedback`.
- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is required in production and should point to the canonical company that owns public intake leads.
- Missing production intake company configuration returns user-facing fallback copy instead of selecting a tenant implicitly.
- `.env.example` and `README.md` document the required production intake company env var.

Remaining Stripe test-key blocker:
- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` still need valid Stripe test-mode values in `C:/FloorConnector/.env.local` or the deployment environment.
- Restart the app after setting Stripe keys.
- Verify `/setup/billing` with a Stripe test card before claiming billing-method collection is fully tested.

What not to claim yet:
- Do not claim subscriptions, recurring billing, plan enforcement, or automatic charging are implemented.
- Do not claim Stripe card setup is fully verified until valid test keys are configured and a test card is saved through `/setup/billing`.
- Do not claim pending/trial tenants can send customer-facing estimates/contracts, process checkout payments, or use provider-backed email delivery before activation.
- Do not claim fake demo data, sandbox/demo mode, analytics funnels, AI takeoff, full dispatch optimization, accounting integrations, external e-sign provider integration, or full payment reconciliation are implemented.

## Early Access Launch Checklist

Use this as the final operator checklist before opening early access in production. It is a deployment checklist only; it does not introduce a new workflow, schema, billing system, analytics layer, sandbox mode, or activation model.

Required env vars:
- `NEXT_PUBLIC_APP_URL`: production app URL used by auth redirects and setup links.
- `NEXT_PUBLIC_MARKETING_URL`: production marketing URL when different from the app URL.
- `NEXT_PUBLIC_SUPABASE_URL`: active production Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: active production Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only production service role key; never expose in browser code.
- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`: required in production for public `Request Early Access`; must point to the existing canonical `companies.id` that owns public intake leads.
- `STRIPE_SECRET_KEY`: Stripe test-mode secret key for billing-method readiness verification.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: matching Stripe test-mode publishable key for Stripe Elements.
- `STRIPE_WEBHOOK_SECRET`: configure before relying on webhook-backed payment events.

Supabase migration status:
- Confirm the production Supabase project is linked to the intended environment before applying migrations.
- Run `supabase migration list` and verify local migration files and remote migration history match the intended release.
- Apply pending migrations through the normal migration flow before launch; do not patch production schema manually.
- Confirm the production database includes the existing canonical tables used by early access: `companies`, `company_memberships`, `users`, `contacts`, `opportunities`, `workflow_error_events`, estimates/contracts/jobs/invoices, and the current Stripe reference fields on `companies`.
- Confirm RLS remains enabled for tenant-owned tables and public intake still writes only through the server-side intake action.

Stripe test-mode verification steps:
- Set valid matching test-mode values for `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Restart or redeploy the app after setting Stripe env vars.
- Create a real early-access signup and complete `/setup/company`.
- Visit `/setup/billing` and confirm Stripe Elements renders.
- Save a billing method with a Stripe test card such as `4242 4242 4242 4242`.
- Confirm no charge or subscription is created.
- Confirm the active company row stores only Stripe reference fields such as `stripe_customer_id` and `stripe_payment_method_id`.
- Confirm dashboard copy shows `Billing method saved` after setup.

Production intake company ID setup:
- Create or identify the canonical FloorConnector-owned company that will own public early-access intake leads.
- Set `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` to that exact `companies.id`.
- Submit one public `Request Early Access` form from `/`.
- Confirm it creates an existing `contacts` row and existing `opportunities` row with `source = early_access` and `source_detail = homepage_request` under that company.
- If the env var is missing in production, the form should fail gracefully with fallback copy and must not write to any arbitrary tenant.

First test signup path:
- Open `/`.
- Click `Start Free Trial`.
- Confirm the route is `/signup?next=/setup/company`.
- Sign up with a real test user through the implemented Supabase auth flow.
- Complete `/setup/company`.
- Visit `/setup/billing` and either save a Stripe test billing method or confirm the billing-later fallback is clear.
- Continue to `/setup/pending-activation`.
- Enter `/dashboard` and confirm the user can create internal canonical records while guarded external actions remain locked.

Super-admin monitoring path:
- Open `/super-admin/early-access` as a platform admin.
- Confirm the new company appears with tenant status, lifecycle state, company-profile readiness, saved-payment-method status, and project/estimate/contract/invoice counts.
- Confirm light signals derive from existing data only: recent login, reached estimate, reached contract, and feedback presence.
- Confirm recent feedback appears when users submit the protected `Send Feedback` modal.
- Use this page for early-access review before activation.

Activation rules:
- Activation uses only existing `companies.tenant_status` and `companies.lifecycle_state`.
- Marking active unlocks guarded production actions for that company.
- Activation does not create a Stripe charge.
- Activation does not create a Stripe subscription.
- Activation does not create a duplicate billing, account, company, or tenant model.
- Billing/subscription follow-through remains a separate operator action unless later explicitly implemented.

What is intentionally gated before activation:
- Estimate customer sends.
- Contract send-for-signature.
- Customer-facing checkout/payment processing.
- Provider-backed notification email delivery.

What remains available while pending/trial:
- Company setup.
- Dashboard access.
- Internal projects, opportunities, customers, estimates, contracts, jobs, invoices, and related review surfaces, subject to existing workflow and readiness gates.
- In-app feedback capture through existing `workflow_error_events`.
- Super-admin monitoring and operator review.

What not to claim yet:
- Do not claim live subscription billing, recurring billing, plan enforcement, automatic charging, or automatic plan provisioning.
- Do not claim Stripe card setup is fully verified until the test-mode keys are present and a test card has been saved through `/setup/billing`.
- Do not claim pending/trial tenants can send customer-facing estimates/contracts, process checkout payments, or use provider-backed email delivery.
- Do not claim fake demo data, sandbox/demo mode, analytics funnels, AI takeoff, full dispatch optimization, accounting integrations, external e-sign provider integration, full payment reconciliation, or every target architecture item is implemented.

Rollback / disable notes:
- If `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is wrong, remove or correct it immediately; public intake should fail gracefully when missing in production rather than writing to the wrong tenant.
- If intake was submitted to the wrong company, do not bulk-delete blindly; identify the created `contacts` and `opportunities` rows by `source = early_access`, `source_detail = homepage_request`, timestamp, and submitted email/company details, then plan a targeted data correction.
- If Stripe keys are missing, mixed live/test, or incorrect, clear or replace `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, redeploy/restart, and use the billing-later path until test-mode verification passes.
- If Stripe setup behaves unexpectedly, do not mark card collection as verified and do not activate companies based on billing readiness until the issue is resolved.
- If external sends or payment processing must remain disabled for a company, keep `companies.tenant_status` / `companies.lifecycle_state` in pending/trial states and do not mark the company active.
- If launch confidence drops, keep homepage `Start Free Trial` available only if onboarding is intended to remain open; otherwise route interested users through the public `Request Early Access` path after confirming intake env is correct.

## Early Access Readiness Verification - 2026-05-06

Verification-only pass against the linked Supabase project and a local production-mode web server at `http://localhost:3020`. No app code, schema, migrations, workflow logic, billing logic, or activation logic was changed.

Checks run:
- `supabase migration list` connected to the linked remote database and showed local/remote migration history aligned through `20260505194642`.
- `README.md` and `.env.example` document `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`, `STRIPE_SECRET_KEY`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- `.env.local` check: `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` missing, `STRIPE_SECRET_KEY` blank, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` blank, `FLOORCONNECTOR_E2E_EMAIL` present, and `FLOORCONNECTOR_E2E_PASSWORD` present.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production-mode server was started with `NODE_ENV=production`, `PORT=3020`, and `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` intentionally absent.
- Public homepage `/` loaded successfully.
- Public `Request Early Access` form failed gracefully while the intake company ID was missing, showing the configured user-facing fallback instead of writing to an arbitrary tenant.
- Homepage `Start Free Trial` href resolves to `/signup?next=%2Fsetup%2Fcompany`.
- Unauthenticated `/setup/company`, `/setup/billing`, `/setup/pending-activation`, and `/super-admin/early-access` redirected to `/login`.
- `pnpm e2e:auth` passed against `http://localhost:3020` and refreshed `playwright/.auth/local-user.json`.
- Authenticated platform-admin check loaded `/super-admin/early-access`.
- Read-only tenant check for the authenticated QA company showed `tenant_status = trialing`, `lifecycle_state = trial`, a missing saved Stripe payment method, recent activity present, and existing estimates, contracts, jobs, and invoices.
- Authenticated trial user could open internal workflow routes: `/setup/company`, `/projects`, `/estimates`, `/contracts`, `/jobs`, and `/invoices`.
- Authenticated trial user saw `/setup/pending-activation` copy confirming internal records remain available while external sends, customer-facing payment processing, and provider-backed emails stay locked until activation.
- Trial estimate detail verified the `Send estimate` action is disabled with early-access lock copy.
- Trial contract detail verified the `Send for signature` action is disabled with early-access lock copy.
- Trial portal invoice detail verified checkout/payment processing is locked during early access.

Pass/fail summary:
- Passed: migrations aligned on the linked remote database, env docs present, homepage load, missing-intake fallback, signup CTA href, setup-route protection, unauthenticated super-admin protection, platform-admin early-access page load, internal trial workflow access, estimate-send lock, contract-send lock, portal checkout/payment lock, typecheck, lint, and build.
- Blocked for launch claims: production/staging env values are not ready locally because `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is missing and both Stripe keys are blank in `.env.local`.

Exact remaining blockers:
- Set `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` in production/staging before accepting public early-access intake; missing production config correctly fails closed.
- Set matching Stripe test-mode `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, then verify `/setup/billing` with a Stripe test card before claiming billing-method collection is fully tested.
- Do not claim subscriptions, automatic charges, live billing, or pending/trial external sends/payments are available.

## Investor Demo Script

Use this script for an investor or customer-facing walkthrough. Keep the language grounded in implemented truth: this is a real early-access product on canonical records, not a fake demo environment, and not a live subscription-billing system.

### 1. Opening pitch

Say:
"FloorConnector is an operating system for specialty surface contractors. The core idea is simple: keep the whole contractor journey connected from opportunity to customer, project, estimate, contract, job, invoice, and payment, so work does not fracture across spreadsheets, inboxes, disconnected estimating tools, and billing systems."

Emphasize:
- FloorConnector is built for epoxy flooring, concrete polishing, and specialty surface contractors.
- The product is not trying to be a generic CRM or generic project-management app.
- The strongest current story is continuity: records move forward instead of being recreated.
- Early access is real product access with activation guardrails.

Do not say:
- Do not say every future module is production-complete.
- Do not say billing subscriptions are live.
- Do not say external sends and payment processing are available before activation.

### 2. Homepage talking points

Open `/`.

Talk through:
- The homepage positions FloorConnector around "lead to payment" continuity.
- The workflow visual should be described as the product spine: Lead / Project / Estimate / Contract / Job / Invoice / Payment in public-facing language, with the internal canonical lifecycle still anchored on `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- The platform section separates implemented foundations from planned layers.
- The comparison section is positioning-focused and should not be represented as an exhaustive competitor audit.
- The pricing section is intentionally early-access-oriented:
  - `Starter / Early Access`
  - `Pro / Coming Soon`
  - `Enterprise / Contact Us`
- Pricing is subject to confirmation before activation.
- No charge is created during onboarding.
- The current flow does not create subscriptions automatically.

Click:
- `Start Free Trial`

Expected route:
- `/signup?next=/setup/company`

### 3. Signup/onboarding talking points

On signup/login:
- Authentication is real Supabase-backed auth.
- Users sign up or log in through the existing auth system.
- There is no fake demo account layer and no sandbox-only persistence.
- First access bootstraps the user into the existing organization/company and membership model.
- The `next=/setup/company` handoff preserves the intended onboarding route.

If asked whether this can support real users:
- Yes, early users enter the real contractor app and create real canonical records.
- Activation guardrails block irreversible external production actions until the operator marks the company active.

### 4. Company setup talking points

On `/setup/company`:
- Company setup writes to the existing `companies` organization record.
- Primary address setup writes through the existing primary `locations` record.
- There is no `company_registration` table or duplicate tenant model.
- Optional profile/brand details are progressive; they improve readiness and app identity but do not create a separate onboarding model.
- This is the first proof point that FloorConnector treats onboarding as part of the real product foundation, not a parallel trial system.

Key fields to mention:
- legal/display company identity
- phone/email/website
- primary trade
- brand/accent direction
- time zone
- primary location/address

### 5. Billing setup caveat

On `/setup/billing`:
- This is payment-method readiness only.
- When Stripe test keys are configured, the route uses Stripe SetupIntent / Elements to save a billing method.
- It does not create a charge.
- It does not create a subscription.
- It stores Stripe customer/payment method references on the existing `companies` row.
- If Stripe keys are missing or setup fails, the user can continue with a safe billing-later path.

Required caveat:
"We can collect a billing method for readiness once Stripe test keys are configured and verified, but early access still requires operator confirmation before activation. This is not automatic subscription billing."

### 6. Pending activation explanation

On `/setup/pending-activation`:
- This page uses the existing `companies.tenant_status` and `companies.lifecycle_state`.
- It lets early users enter the real dashboard.
- It explains that users can create internal records while external production actions remain locked.
- Activation is not a new account model; it is a status/lifecycle transition on the existing company record.

Say:
"Pending activation is the boundary between safe product exploration and production external actions. It lets a contractor start building their real workflow without accidentally sending customer-facing documents or processing payments before review."

### 7. Dashboard/Start Here walkthrough

On `/dashboard`:
- The dashboard is the contractor command center, not a separate analytics product.
- It derives from existing canonical records.
- The Start Here guide points a new company into the first practical workflow:
  - create or review a project
  - create an estimate
  - generate a contract from approved estimate context
  - continue into job or invoice when the workflow is ready
- The guide is dismissible for normal users, but `/dashboard?fresh=true` can force it visible in non-production for demos or QA.
- If the company is active, dashboard copy shows `Account active`.
- If no billing method exists, it prompts for billing method setup.
- If a billing method exists, it shows `Billing method saved`.

Demo note:
- Use the dashboard to show that FloorConnector already has real queues and manager entries for projects, estimates, contracts, jobs, invoices, payments, scheduling, people, vendors, and settings foundations.
- Do not oversell planned/deeper modules as complete.

### 8. Project workspace workflow strip explanation

Open a Project Workspace.

Explain:
- Project is the operational hub.
- The top workflow strip communicates where the job is in the handoff.
- The strip derives from existing records:
  - estimate exists / approved estimate exists
  - contract exists / signed contract exists
  - job exists
  - invoice exists
  - payment activity exists
- The strip is a clarity layer, not a second workflow engine.
- It does not create data or bypass readiness gates.

Say:
"This is the product direction in one screen: the contractor should instantly know what has happened, what is blocked, and what comes next, without jumping between disconnected modules."

### 9. Project -> Estimate -> Contract flow

Walkthrough:
1. From project context, create or open an estimate.
2. Explain that estimates stay linked to the project and derived customer.
3. Explain that estimate line items are canonical estimate rows and the catalog/cost-item foundation feeds estimating without becoming a fake invoice source.
4. Once an estimate is approved, generate the contract from the approved estimate context.
5. Open the Contract Workspace and explain that portal signing and contractor-side onsite signing operate on the same canonical contract record.

Important boundaries:
- Approved estimate does not automatically create invoice, job, payment, or subscription records.
- Contract generation uses the existing estimate/project/customer chain.
- Sending externally may be locked while the tenant is pending/trial.

### 10. Super-admin early-access monitoring

Open `/super-admin/early-access` as a platform admin.

Explain:
- This is platform-admin-only onboarding visibility.
- It reads existing `companies` and canonical workflow counts.
- It shows:
  - company profile readiness
  - saved payment method presence
  - project/estimate/contract/invoice activity counts
  - first workflow progress
  - estimate-stage progress
  - guarded external actions lock/unlock state
- `Mark active` uses the existing company lifecycle/status fields.
- Activation unlocks guarded production actions.
- Activation does not create a subscription or charge.
- The development-only reset is for non-production QA only and is not a demo/sandbox product feature.

### 11. What is intentionally gated

While a company is pending/trial, the activation guard blocks irreversible external production actions, including:
- estimate customer sends
- contract send-for-signature
- customer-facing checkout/payment processing
- provider-backed notification email delivery

Internal work remains available:
- company setup
- dashboard access
- projects
- estimates
- contracts
- invoices
- jobs
- scheduling/review surfaces, subject to existing workflow gates
- settings and admin foundations where the user has permission

### 12. What is planned/coming soon

Frame these as direction, not current production claims:
- deeper scheduling/dispatch controls
- advanced reporting
- AI-assisted estimating / takeoff
- richer mobile field workflows
- deeper communications and delivery proof
- materials and inventory depth
- external e-sign provider integration
- accounting integrations
- subscription billing and plan enforcement
- deeper payment reconciliation
- broader module-dashboard coverage

### 13. What not to claim yet

Do not claim:
- live subscription billing
- automatic plan provisioning
- automatic charges during onboarding
- Stripe card setup fully verified until test keys and test-card flow are confirmed
- pending/trial tenants can send customer-facing estimates/contracts or process checkout payments
- provider-backed email/SMS delivery is enabled for early-access tenants
- fake demo data or sandbox demo mode exists
- AI takeoff is implemented
- full dispatch optimization is implemented
- accounting integrations are implemented
- external e-sign provider integration is implemented
- full payment reconciliation is complete
- every target architecture document is implemented

## Early User Trial Script

Use this for a contractor tester. The tone should be practical: ask them to try the real workflow, notice where the next action is clear or confusing, and report what feels missing.

### What to try first

Ask the tester to:
1. Start at `/`.
2. Use `Start Free Trial`.
3. Sign up or log in with a real test account.
4. Complete `/setup/company`.
5. Visit `/setup/billing`.
6. Continue through billing setup or use the billing-later fallback if Stripe is not configured.
7. Enter the dashboard from `/setup/pending-activation`.
8. Use the Start Here guide on `/dashboard`.
9. Create or open a project.
10. Create the first estimate from project context.
11. Review the Project Workspace workflow strip and next-step panel.
12. Generate or review a contract when an approved estimate is available.
13. Browse the Managers for Projects, Estimates, Contracts, Jobs, Invoices, Payments, Schedule, People, Vendors, and Settings.

Focus questions:
- Did you know what to do next?
- Did the Project Workspace make the workflow stage obvious?
- Did the dashboard feel like a useful home base?
- Did any locked action explain why it was locked?
- Did any route feel like a separate silo instead of one connected workflow?

### What actions are locked

Tell testers:
- Early access lets you create real internal records.
- External production actions remain locked until the company is active.
- Locked actions include:
  - sending estimates to customers
  - sending contracts for signature
  - customer-facing checkout/payment processing
  - provider-backed notification email delivery
- Billing setup is no-charge payment-method readiness only.
- Activation is operator-reviewed and separate from subscription billing.

### How to ask for help

Ask testers to use:
- the in-app `Need help?` support entry on protected contractor routes
- direct support/contact instructions provided by the operator running the test
- screenshots or screen recordings when a workflow is confusing

Ask them to include:
- route or page name
- record type they were working on
- expected next step
- what they clicked
- what happened
- whether the issue blocked work or was just unclear

### What feedback we want

Prioritize feedback on:
- first five minutes after signup
- company setup clarity
- billing setup trust/caveats
- pending activation explanation
- dashboard Start Here usefulness
- project workflow strip clarity
- project-to-estimate handoff
- estimate-to-contract handoff
- locked-action messaging
- terminology that feels too technical
- places where the app feels disconnected or too dense

De-prioritize for this trial:
- requests for full dispatch optimization
- requests for AI takeoff
- requests for accounting sync
- requests for native mobile apps
- requests for subscription plan changes

Those are valid product inputs, but they are not the purpose of the first early-user continuity test.

What is implemented:
- public investor-ready entry at `/` with the primary early-access CTA routing to `/signup?next=/setup/company`
- real signup/login through the existing auth system, with no fake auth or demo-only account flow
- `/setup/company`, writing company setup onto the existing `companies` organization record and primary `locations` row
- `/setup/billing`, using Stripe SetupIntent/Elements only for no-charge payment-method setup when Stripe keys are configured
- `/setup/pending-activation`, showing existing tenant lifecycle/status and allowing entry into the real contractor app
- dashboard early-access guidance, including Start Here guidance into the canonical Project -> Estimate -> Contract path
- protected contractor-route `Send Feedback` early-access entry
- setup-page dashboard escape hatch with `Finish setup to unlock full access`
- shared activation guard for pending/trial organizations
- `/super-admin/early-access` platform-admin view over existing `companies` plus canonical project/estimate/contract/invoice counts
- non-production `DEV MODE` session-reset control
- non-production `/dashboard?fresh=true` clean first-user simulation
- non-production platform-admin onboarding reset for selected early-access test tenants

What is intentionally gated:
- estimate customer sends
- contract send-for-signature
- customer-facing checkout/payment processing
- provider-backed notification email delivery
- activation to full access, which still uses existing `companies.tenant_status` and `companies.lifecycle_state`

How to run the investor demo:
1. Visit `/`.
2. Click `Start Free Trial`.
3. Confirm the route goes to `/signup?next=/setup/company`.
4. Sign up or log in with a real test user.
5. Complete `/setup/company`.
6. Visit `/setup/billing`.
7. If Stripe test keys are configured, save a test billing method; if keys are missing, use the safe billing-later fallback.
8. Continue to `/setup/pending-activation`.
9. Click `Enter Dashboard`.
10. Use Start Here to create or review the real Project -> Estimate -> Contract path.
11. As a platform admin, open `/super-admin/early-access` to review the tenant and mark active only when appropriate.

How to test a clean onboarding flow:
- Use a real early-access test user and tenant.
- In non-production, sign in as a platform admin and open `/super-admin/early-access`.
- Use `Reset onboarding state` only on the selected test company.
- Sign out or use `Reset session`, then start again from `/` or `/signup?next=/setup/company`.
- Confirm setup, dashboard, Start Here, and early-access lock copy still appear without stale local dismissal/session state.

How to use `/dashboard?fresh=true`:
- Works only in non-production.
- Forces the existing Start Here onboarding guide visible.
- Ignores the Start Here localStorage dismissal for that view.
- Does not create fake records, change tenant data, bypass auth, or bypass canonical record reads.

How to use `/super-admin/early-access`:
- Requires platform-admin access.
- Shows existing company status/lifecycle, saved-payment-method presence, and project/estimate/contract/invoice activity counts.
- Derives first workflow, estimate-stage, and contract-stage badges from canonical record counts only.
- `Mark active` confirms first and sets the existing company lifecycle/status to active.
- The dev reset button appears only when `NODE_ENV !== production`.

How dev-only reset works:
- The action is platform-admin-only and server-guarded to non-production.
- It is clearly labeled `DEV / TEST ONLY`.
- It scopes every delete/update to the selected `company_id`.
- It clears onboarding workflow test records for projects, estimates, contracts, invoices, and dependent workflow rows.
- It clears `companies.stripe_payment_method_id`.
- It does not clear `companies.stripe_customer_id`, to avoid duplicate/orphaned Stripe customer assumptions.
- It resets `companies.tenant_status = trialing` and `companies.lifecycle_state = trial`.
- It fails safely before deleting anything if `estimate_system_snapshots` or `contract_system_snapshots` exist, because those binding snapshot records intentionally block lightweight deletion.

Stripe test-key blocker:
- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` still need real Stripe test-mode values in `C:/FloorConnector/.env.local`.
- Restart the dev server after adding keys.
- Verify `/setup/billing` with a Stripe test card before claiming payment-method collection has been fully tested.
- Missing keys should show the safe `Stripe not configured`/billing-later path; test keys should show `Stripe test mode active`.

What not to claim yet:
- Do not claim subscriptions, plans, recurring billing, or charging are implemented.
- Do not claim Stripe card setup is fully verified until test keys are present and a test card is saved through `/setup/billing`.
- Do not claim pending/trial tenants can send externally or process customer-facing payments.
- Do not claim provider-backed email delivery is enabled for early-access tenants.
- Do not claim sandbox/demo mode exists.
- Do not claim fake demo data exists.
- Do not claim advanced dispatch, AI takeoff, external e-sign provider integration, accounting integrations, full payment reconciliation, or full subscription billing are complete.

## Early Access QA Reset Workflow

Added a development-only QA reliability layer for repeatedly testing early-access onboarding without adding schema, sandbox/demo mode, analytics, new business models, billing logic changes, or canonical workflow changes.

Files changed in this pass:
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/components/dev-qa-tools.tsx`
- `apps/web/components/platform-admin/reset-onboarding-state-form.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/lib/onboarding/billing-setup.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior:
- `/super-admin/early-access` shows a clearly labeled `DEV / TEST ONLY` reset action only when `NODE_ENV !== production`.
- The reset remains platform-admin-only, scopes every delete/update by the selected company id, clears project/estimate/contract/invoice onboarding workflow test records plus dependent workflow rows, clears `companies.stripe_payment_method_id`, and resets `companies.tenant_status = trialing` / `companies.lifecycle_state = trial`.
- The reset does not clear `companies.stripe_customer_id`; retaining it avoids creating orphaned or duplicate Stripe customer assumptions during repeated QA.
- The reset fails safely before deleting anything if the company has `estimate_system_snapshots` or `contract_system_snapshots`, because those insert-only binding records intentionally block lightweight deletion.
- Contractor app routes in non-production show a subtle `DEV MODE` badge with `Reset session`, which clears browser local/session storage, signs out through the existing auth action, and returns to `/login`.
- `/dashboard?fresh=true` in non-production forces the existing Start Here guide visible and ignores its localStorage dismissal without creating fake records.
- `/setup/billing` in non-production shows whether Stripe is in test mode, missing, mixed, or live-key configuration.

Validation:
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `git diff --check` passed with existing LF-to-CRLF warnings only.
- Manual destructive reset was not executed against live tenant data during implementation.

## Early Access Onboarding Visibility

Added a thin platform-admin visibility layer for onboarding users without adding analytics tables, duplicate tenant models, billing logic, sandbox mode, or canonical workflow changes.

Files changed in this pass:
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `apps/web/lib/settings/navigation.ts`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:
- Platform admins now have `/super-admin/early-access` for cross-tenant onboarding visibility. This intentionally lives under super admin rather than contractor `/settings` so tenant data is not exposed to regular organization admins.
- The view lists existing `companies` records with company name, created date, tenant status, lifecycle state, payment-method presence derived from `companies.stripe_payment_method_id`, and canonical project/estimate/contract/invoice counts.
- The view derives onboarding progress from existing records only:
  - `Reached first workflow step`: at least one project.
  - `Reached estimate stage`: at least one project and at least one estimate.
  - `Reached contract stage`: at least one project, at least one estimate, and at least one contract.
- The operational "aha moment" remains data-derived: a company has reached the first meaningful product workflow once it has at least one project and at least one estimate. Contract generation is visible as the next stage, not a required tracking row.
- Platform admins can mark a company active from the early-access view using the existing `companies.tenant_status = active` and `companies.lifecycle_state = active` path.
- Dashboard recovery now redirects users with no completed company profile fields to `/setup/company`.
- If Stripe is configured and the company has no saved payment method, the dashboard early-access banner gently points to `/setup/billing`; if Stripe is not configured, billing remains non-blocking.
- Start Here remains the existing dashboard guide, but it is forced visible for zero-project companies and biases to the estimate step once a project exists and no estimate exists.

Guardrail status:
- The existing shared activation guard is unchanged. It still blocks irreversible production actions such as external sends and payment processing while allowing internal project, estimate, contract, invoice, job, scheduling, setup, and review workflows.

## Early Access Safety + Support Layer

Completed a lightweight first-user safety/support pass without adding schema, analytics, sandbox/demo mode, business models, billing logic, or core workflow changes.

Files changed in this pass:
- `apps/web/components/early-access-help-button.tsx`
- `apps/web/components/setup-escape-banner.tsx`
- `apps/web/components/platform-admin/activate-company-form.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/components/settings-feedback.tsx`
- `apps/web/components/stripe/setup-intent-form.tsx`
- `apps/web/components/estimates/estimate-records-panel.tsx`
- `apps/web/components/invoices/invoice-records-panel.tsx`
- `apps/web/app/error.tsx`
- `apps/web/app/api/stripe/create-setup-intent/route.ts`
- `apps/web/app/api/stripe/save-payment-method/route.ts`
- `apps/web/app/(app)/setup/company/page.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(super-admin)/super-admin/early-access/page.tsx`
- `apps/web/lib/onboarding/actions.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:
- Protected contractor routes now show a small bottom-right `Need help?` entry that opens a simple early-access support panel with email support and a walkthrough placeholder link.
- `/setup/company`, `/setup/billing`, and `/setup/pending-activation` now include a dashboard escape hatch banner: `Finish setup to unlock full access`.
- `/setup/billing` no longer traps users when Stripe is configured but setup fails; Stripe/network/SetupIntent failures show human-readable copy, a retry action, and `Continue and add billing later`.
- Global app errors no longer render raw error messages.
- Settings-style feedback masks technical-looking raw errors before display.
- Projects, estimates, contracts, and invoices first-empty states now carry clearer canonical workflow guidance and primary first-action paths where the workflow can safely provide one.
- `/super-admin/early-access` now confirms before `Mark active` and returns `Company activated` on success.

Validation still required for this pass:
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Browser QA for empty states, setup escape behavior, the Stripe-missing-key path, and super-admin activation confirmation.

## Early Access Demo Readiness

What is ready to show:
- Public homepage at `/` with the early-access CTA and lead-to-payment positioning.
- Real signup entry from `Start Free Trial` into `/signup?next=/setup/company`.
- Early-access setup routes: `/setup/company`, `/setup/billing`, and `/setup/pending-activation`.
- Dashboard entry at `/dashboard`, including `Start Here` guidance into the canonical Project -> Estimate -> Contract path.
- Platform-admin visibility at `/super-admin/early-access`, including company status, saved-payment-method presence, project/estimate/contract/invoice counts, workflow-stage badges, and mark-active control.

Exact investor demo flow:
1. Visit `/`.
2. Click `Start Free Trial`.
3. Complete signup and land at `/setup/company`.
4. Save company basics, then continue to `/setup/billing`.
5. If Stripe is configured, save a billing method; if Stripe is not configured, use the billing fallback to continue.
6. Continue to `/setup/pending-activation`.
7. Click `Enter Dashboard` to reach `/dashboard`.
8. Use `Start Here`.
9. Follow Project -> Estimate -> Contract through the existing Quick-Create and workspace flow.
10. Visit `/super-admin/early-access` as a platform admin to review the tenant, activity counts, workflow-stage badges, and activation control.

Exact early-user signup flow:
1. User visits `/`.
2. User clicks `Start Free Trial`.
3. User creates an account at `/signup?next=/setup/company`.
4. User completes `/setup/company`.
5. User visits `/setup/billing`.
6. User either saves a billing method through Stripe SetupIntent or continues through the safe billing fallback when Stripe is unavailable.
7. User lands on `/setup/pending-activation`.
8. User clicks `Enter Dashboard`.
9. User uses `/dashboard` and `Start Here` to create real internal records.
10. Operator reviews the tenant at `/super-admin/early-access` and marks active only after review.

What is intentionally gated:
- Estimate customer sends.
- Contract send-for-signature.
- Customer-facing checkout/payment processing.
- Provider-backed notification email delivery.
- Activation uses existing `companies.tenant_status` and `companies.lifecycle_state`; no duplicate activation model, sandbox mode, or demo tenant model exists.

What still needs Stripe test keys:
- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must be filled in `C:/FloorConnector/.env.local`.
- The dev server must be restarted after filling keys.
- `/setup/billing` must be verified with a Stripe test card before claiming the live card setup path is verified.

What NOT to claim yet:
- Do not claim subscriptions or billing plans are implemented.
- Do not claim Stripe card collection has been fully verified until test keys are present and a test card has been saved through `/setup/billing`.
- Do not claim external sends, payment processing, or provider-backed email are available for pending/trial tenants.
- Do not claim advanced dispatch, full reporting, AI takeoff, mobile field app, external e-sign, accounting integrations, or full payment reconciliation are complete.

Operator Checklist:
- Fill Stripe test keys in `.env.local`.
- Restart dev server.
- Verify `/setup/billing` with test card.
- Use `/super-admin/early-access` to monitor users.
- Mark active only after review.

## Marketing / Onboarding / Early-Access QA Polish

Completed a focused QA + UX polish pass across public marketing, signup entry, early-access setup, billing fallback, pending activation, and dashboard setup guidance.

Files changed in this pass:
- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/app/(app)/setup/company/page.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `apps/web/components/stripe/setup-intent-form.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior:
- Public homepage copy was tightened around the lead-to-payment workflow without changing routes or adding new product claims.
- Company setup copy now reads as customer-facing setup instead of implementation notes.
- `/setup/billing` still uses Stripe SetupIntent only and does not charge, subscribe, store raw card data, or create duplicate billing records.
- If Stripe keys are blank or card collection fails, billing setup now gives a clear `Continue to activation` path with billing-later copy instead of trapping early-access users.
- `/setup/pending-activation` now reinforces that the workspace is ready while external sends, payment processing, and provider-backed emails remain locked until activation.
- Dashboard early-access banner now includes both `Finish setup` and `View activation status`.
- Start Here copy now directly names the expected project -> estimate -> contract path.

Validation:
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- Browser smoke on `http://localhost:3001` confirmed `/` -> `Start Free Trial` -> `/signup?next=/setup/company`.
- Authenticated browser QA confirmed `/setup/company` survives refresh, `/setup/billing` shows the Stripe-unconfigured fallback and can continue to `/setup/pending-activation`, pending activation enters `/dashboard`, and dashboard shows both setup and activation links.
- Authenticated browser QA confirmed `/projects?compose=1`, `/estimates?compose=1`, and `/contracts?compose=1` composer anchors are reachable with no console errors.
- Authenticated browser QA created real internal project `65ada272-cca5-4270-97ae-ae7e6bd56c43`, draft estimate `86f6dad2-fc4f-4d00-b2d9-1d55f39cee62`, and generated contract `261df341-32a9-435c-91cf-e7c94bb77e38` from an existing approved estimate.
- Stripe test-card entry was not exercised because `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are blank in `C:/FloorConnector/.env.local`.

## Early Access Activation Guard

Implemented a minimal shared activation guard for irreversible production actions while keeping early-access users able to explore and create real canonical records.

Files changed:
- `apps/web/lib/organizations/activation-guard.ts`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/lib/invoices/actions.ts`
- `apps/web/lib/notifications/system.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Guarded actions:
- customer-facing checkout/payment processing through `requestPortalInvoicePaymentAction`
- estimate customer send through `sendEstimateToCustomerAction`
- contract send-for-signature through `sendContractForSignatureAction`
- provider-backed notification email delivery through `sendTrackedNotificationEmail`

Not guarded:
- `/setup/company`
- `/setup/billing` SetupIntent card collection
- `/setup/pending-activation`
- `/dashboard`
- internal project, estimate, contract, invoice, job, scheduling, setup, review, and draft/generation records
- contractor-side onsite signature capture and portal review/signature actions once a record has already been externally sent

Behavior:
- The shared helper reads existing `companies.tenant_status` and `companies.lifecycle_state`; no sandbox/demo mode and no duplicate activation/account/billing/company model was added.
- Pending/trial organizations receive: `This action is locked during early access. Your account must be activated before sending externally or processing payments.`
- Active/approved production states are allowed through the shared helper.

Validation:
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Hosted Supabase verification found two current companies; both are `tenant_status = trialing` and `lifecycle_state = trial`.
- Direct server-helper verification against hosted Supabase confirmed company `865f87c3-376e-4d89-8d2c-ed4132264719` is blocked with the exact early-access lock message.
- Direct server-helper verification confirmed `active/active` and `approved/approved` organization states are allowed.
- Browser verification on `http://localhost:3001/dashboard` confirmed the pending/trial E2E user can still enter the dashboard.
- Browser verification on `http://localhost:3001/projects?compose=1` created real canonical project `Activation Guard QA 1778022703327` at `/projects/8b9ec527-d7cc-4765-9df4-5f1d3c3d553c`, confirming internal record creation remains available during early access.
- The estimate send UI was inspected on `/estimates/ebe9f26c-06f9-4fcf-8d16-8dfaa6f3cb2e`; the send button was disabled by existing estimate prerequisites, so the guard was verified through the shared server helper rather than forcing around existing workflow validation.
- No active tenant exists in the current hosted verification data, so active-org behavior was verified through the helper's active/approved state assertion instead of a live active-user browser session.

## Early Access UX Messaging Polish

Polished the user-facing early-access messaging around locked production actions without changing schema, adding sandbox/demo mode, or changing the activation guard decision rules.

Files changed:
- `apps/web/components/early-access-lock-notice.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/components/contract-status-actions.tsx`
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/lib/organizations/activation-guard.ts`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Behavior:
- Dashboard now shows a `Status: Early access` banner for pending/trial organizations with the copy: `You can explore the real system and create records now. External sends and payment processing unlock after activation.`
- The banner links to `/setup/pending-activation`.
- Estimate send, contract send-for-signature, and portal checkout/payment surfaces now share the same visible lock copy:
  - `Locked during early access`
  - `You can keep building real records. Sending externally and processing payments unlock after activation.`
- The guarded UI buttons are disabled for pending/trial organizations, while the server-side activation guard remains the final enforcement boundary.
- `/setup/pending-activation` now clearly says early-access users may enter the dashboard, create real projects/customers/estimates/contracts/invoices/jobs/scheduling records, and wait for activation before external sends or customer-facing payment processing.
- Start Here remains optional, dismissible through localStorage preference only, and derived from real canonical project/estimate/contract/invoice/job counts.

Validation:
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Browser check on `http://localhost:3001/dashboard` confirmed the early-access banner, message, and activation-status link render.
- Browser check on `http://localhost:3001/setup/pending-activation` confirmed dashboard entry, real-record creation copy, and external-send/payment lock copy render.
- Browser check on `http://localhost:3001/estimates/ebe9f26c-06f9-4fcf-8d16-8dfaa6f3cb2e` confirmed the guarded estimate-send UI shows the shared lock copy and the send button is disabled.

## Early Access Onboarding Verification Pass

Verification date: 2026-05-05.

Important Supabase note:
- This repo uses the hosted/linked Supabase project for verification. Do not use local Supabase for this workflow.
- `supabase db push --linked` reported the remote database is up to date.
- Remote `companies` columns confirmed: `stripe_customer_id` and `stripe_payment_method_id` exist.

Commands run:
- `supabase db push --linked`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

Command results:
- Remote Supabase push passed.
- Typecheck passed.
- Lint passed.
- Build passed.

Browser routes checked against `http://localhost:3001`:
- `/` rendered and `Start Free Trial` links route to `/signup?next=%2Fsetup%2Fcompany`.
- `/setup/company` saved and reloaded the canonical company profile and primary location values for the authenticated E2E tenant. The company count stayed at `2` before and after save, so no duplicate organization/company record was created.
- `/setup/billing` rendered the intended no-charge billing setup shell and Stripe fallback state.
- `/setup/pending-activation` rendered the early-access state with `tenant_status = trialing`, `lifecycle_state = trial`, and an `Enter Dashboard` link.
- `/dashboard` loaded after `Enter Dashboard` and rendered canonical dashboard queues.

Stripe verification result:
- Live card verification could not be completed in this session because `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are present but blank in `C:/FloorConnector/.env.local`.
- With those env vars blank, `/setup/billing` correctly shows the Stripe-not-configured fallback and does not render a Payment Element.
- The active E2E company currently has `stripe_customer_id = null` and `stripe_payment_method_id = null`.
- Because the card flow could not run, Stripe dashboard confirmation remains pending: no customer/payment-method/no-charge/no-subscription dashboard check was completed.

Dashboard Start Here note:
- The authenticated E2E tenant already has canonical records (`projects = 4`, `estimates = 8`, `contracts = 3`, `invoices = 3`, `jobs = 6`), so `Start Here` was not visible and dismiss-click behavior was not exercised in that tenant state.
- Source behavior still derives the card from real canonical counts and hides it when no incomplete step remains.

Activation guardrail finding:
- Pending users can enter the real contractor dashboard and explore real canonical records.
- Current code has workflow-specific guards, readiness checks, and payment/checkout validation, but this pass did not find a centralized server-side activation guard that blocks production-risk actions solely because `tenant_status/lifecycle_state` are still pending/trial.
- Smallest safe follow-up before implementation: add a narrow shared server-side assertion such as `assertActivatedForProductionAction` that reads the active organization context and gates only external sends, customer-facing checkout/payment processing, and other irreversible production actions. Do not add sandbox/demo mode, new billing/account/company models, or duplicate lifecycle state.

## Stripe SetupIntent Card Collection

Real no-charge billing-method collection is now implemented on `/setup/billing` using Stripe Elements and SetupIntent only.

Files changed:
- `apps/web/app/api/stripe/create-setup-intent/route.ts`
- `apps/web/app/api/stripe/save-payment-method/route.ts`
- `apps/web/components/stripe/setup-intent-form.tsx`
- `apps/web/lib/onboarding/billing-setup.ts`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/lib/organizations/active-context.ts`
- `apps/web/package.json`
- `packages/types/src/index.ts`
- `pnpm-lock.yaml`
- `supabase/migrations/20260505194642_organization_stripe_payment_method_refs.sql`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:
- `/setup/billing` now renders Stripe Elements when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` are configured.
- The setup route creates or reuses a Stripe customer for the active organization, creates a SetupIntent with automatic payment methods, and returns only the client secret.
- The client confirms the SetupIntent with `redirect: "if_required"` and does not create a charge or subscription.
- After confirmation, the app server retrieves and verifies the SetupIntent belongs to the active organization's Stripe customer, stores only `companies.stripe_payment_method_id`, and sets the Stripe customer's default payment method.
- Stripe remains the source of truth for payment methods; no raw card data, duplicate billing model, subscription table, or fake card storage was added.
- If Stripe is not configured or SetupIntent/confirmation fails, the billing page shows a fallback/error state and lets early-access users continue to pending activation with billing-later copy.

Validation note:
- The required validation for this slice is `pnpm typecheck`, `pnpm lint`, and `pnpm build`, plus manual Stripe test-card verification with `4242 4242 4242 4242` after the migration is applied and real Stripe test keys are present.

## Stripe Test-Mode Billing Verification Attempt

Verification date: 2026-05-05.

Scope:
- Final test-mode verification for `/setup/billing`.
- No implementation changes, schema changes, subscriptions, charges, sandbox/demo mode, or duplicate billing/account/company models were added.

Pre-checks:
- `.env.local` contains `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, but both values are currently blank.
- Because both Stripe values are blank, the live Payment Element and card-confirmation path could not be exercised in this environment.
- Linked Supabase DB columns exist on `public.companies`: `stripe_customer_id`, `stripe_payment_method_id`.
- Linked Supabase DB values before/after this attempt remain `null` for both Stripe reference columns on the two current companies, because the card flow could not run without keys.

Commands run:
- `supabase db query --linked "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'companies' and column_name in ('stripe_customer_id', 'stripe_payment_method_id') order by column_name;"`
- `supabase db query --linked "select id, stripe_customer_id, stripe_payment_method_id from public.companies order by created_at asc;"`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

Command results:
- Linked DB column check passed.
- Linked DB record check confirmed both current company rows have no saved Stripe references yet.
- Typecheck passed.
- Lint passed.
- Build passed.

Browser route checked:
- `http://localhost:3001/setup/billing`

Browser results with current blank Stripe config:
- Billing page rendered the `Add your billing method` shell.
- Early-access no-charge copy rendered.
- Safe Stripe-not-configured fallback rendered.
- Stripe Payment Element did not render, as expected with blank keys.
- Continue-to-activation now remains available with billing-later copy when Stripe config is blank.

Stripe dashboard / API result:
- Not verified in this session because Stripe test keys are blank in `.env.local`.
- No customer/payment-method/no-charge/no-subscription dashboard confirmation could be completed from this environment.

Remaining launch blocker:
- Add real Stripe test-mode values for `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `C:/FloorConnector/.env.local`, restart the dev server, and rerun the `/setup/billing` card test with `4242 4242 4242 4242`.

## Public Homepage And Early Access Onboarding

Investor-ready marketing and early-access setup are now implemented without adding fake demo records, sandbox-only flows, duplicate company models, or duplicate billing models.

Follow-up company profile extension implemented:
- Added `supabase/migrations/20260505192527_company_profile_onboarding_fields.sql` to extend the existing canonical `companies` row with nullable `phone`, `email`, `website_url`, `primary_trade`, `brand_accent_color`, and `time_zone` fields.
- `/setup/company` now saves those fields through the existing organization setup action alongside legal/display name, logo URL/reference, and primary location.
- `/settings/organization` can maintain the same canonical organization profile fields after onboarding.
- The shared organization brand link can use the stored brand accent color where company identity is already rendered.
- No company-registration table, onboarding profile table, duplicate company record, sandbox model, or primary-location behavior change was added.
- Logo upload remains deferred; the current implementation stores only a hosted logo URL or storage reference.

Files changed:
- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/lib/auth/paths.ts`
- `apps/web/lib/onboarding/actions.ts`
- `apps/web/lib/onboarding/company-setup.ts`
- `apps/web/lib/onboarding/billing-setup.ts`
- `apps/web/app/(app)/setup/company/page.tsx`
- `apps/web/app/(app)/setup/billing/page.tsx`
- `apps/web/app/(app)/setup/pending-activation/page.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/projects/page.tsx`
- `apps/web/components/estimates/estimate-records-panel.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/components/invoices/invoice-records-panel.tsx`
- `apps/web/app/(app)/settings/organization/page.tsx`
- `apps/web/components/organization-brand-link.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/components/protected-app-top-nav.tsx`
- `apps/web/components/protected-surface-header.tsx`
- `apps/web/lib/organizations/active-context.ts`
- `apps/web/lib/organizations/admin.ts`
- `apps/web/lib/settings/actions.ts`
- `apps/web/lib/settings/schemas.ts`
- `packages/types/src/index.ts`
- `supabase/migrations/20260505192527_company_profile_onboarding_fields.sql`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:
- Public `/` is now a premium black/white/warm-orange SaaS homepage with hero CTA to `/signup?next=/setup/company`, lifecycle visual, problem framing, canonical-record differentiation, grouped feature sections, careful competitor positioning, planned/coming-soon section, and early-access CTA.
- `/setup/company` is a protected owner/admin setup step that writes to existing `companies` fields and the existing primary `locations` address row, creating the primary location if needed.
- Company setup now stores the deferred contact/profile fields on `companies`: phone, email, website URL, primary trade/service type, brand accent color, and time zone.
- `/setup/billing` is a no-charge billing setup shell. It checks Stripe env readiness, stores Stripe customer/payment-method references on the existing `companies` organization row, and collects the card through Stripe Elements and SetupIntent only. It does not create subscriptions, charge, or fake card collection.
- `/setup/pending-activation` reuses existing `companies.tenant_status` and `companies.lifecycle_state` and lets early-access users enter `/dashboard`.
- Dashboard `Start here` is now optional, dismissible, localStorage-backed preference only, and derives completion from real projects, estimates, contracts, invoices, and jobs.
- Empty-state copy was tightened for projects, estimates, contracts, and invoices around the canonical workflow.

Deferred:
- Logo upload/storage UI remains deferred; use the logo URL/reference field for now.
- Deeper billing, subscription activation, plan selection, reconciliation, and retry workflows remain deferred.
- No new admin activation model was added because super-admin tenant lifecycle controls already exist.

Validation status:
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Company profile extension validation: `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed after adding the canonical `companies` fields and setup/settings wiring.
- `supabase db push --local --dry-run` could not run because local Supabase Postgres was not reachable on `127.0.0.1:54322`; `supabase status` also could not inspect local containers because Docker was not available/running in this session.
- Browser save/reload verification for `/setup/company` remains blocked until `20260505192527_company_profile_onboarding_fields.sql` is applied to the database used by the local dev server.
- Browser smoke via Playwright against `http://localhost:3000` confirmed `/` renders and the primary `Start Free Trial` CTA points to `/signup?next=%2Fsetup%2Fcompany`.
- Browser smoke with saved authenticated state confirmed `/setup/company`, `/setup/billing`, `/setup/pending-activation`, and `/dashboard` load.
- Browser smoke confirmed `Enter Dashboard` on `/setup/pending-activation` reaches `/dashboard`.
- Dashboard Start Here was not visible for the current authenticated tenant because the completion conditions were already satisfied, so dismiss-click behavior was not exercised against this tenant state.

## System Layers First Migration Slice

Schema-only first slice implemented for future product/spec and floor system template foundations.

Migration:
- `supabase/migrations/20260505120000_system_layers_first_slice.sql`

Tables added:
- `finish_products`
- `floor_system_templates`
- `floor_system_template_components`

What changed:
- Added tenant-owned product/spec metadata foundation with `company_id`, `created_by`, `updated_by`, generated normalized lookup fields, CHECK constraints, useful indexes, update triggers, RLS enable/force RLS, and membership-based RLS policies.
- Added tenant-owned floor system template and component foundation.
- `floor_system_template_components.catalog_item_id` is required and same-company enforced through composite FK to `catalog_items(company_id, id)`.
- `floor_system_template_components.finish_product_id` is optional product/spec proof metadata and uses column-scoped `on delete set null (finish_product_id)`.

Deferred:
- no selected systems
- no visualizer sessions
- no estimate or contract snapshots
- no shared files/file links
- no communication delivery proof
- no activity timeline
- no seed/demo data
- no app UI, routes, APIs, server actions, tests, or product behavior

Validation:
- targeted migration grep checks passed for forbidden later-slice tables and `organization_id`
- `git diff --check` passed for the migration and touched docs
- `pnpm typecheck` passed
- `pnpm lint` passed
- `supabase db lint` was attempted, but the local Supabase Postgres service was not running on `127.0.0.1:54322`

## System Layers Second Migration Slice

Schema-only second slice implemented for selected system/spec workflow foundations.

Migration:
- `supabase/migrations/20260505140921_selected_floor_systems_foundation.sql`

Table added:
- `selected_floor_systems`

What changed:
- Added tenant-owned selected floor system/spec foundation with required `company_id`.
- Rows require at least one real canonical workflow anchor: opportunity, customer, project, estimate, contract, or job.
- Same-company composite FKs are enforced for existing canonical workflow links plus `floor_system_templates` and `finish_products`.
- Supports multiple systems per project, area/room/phase/option labels, alternates/options, quantity notes, customer-facing/internal notes, source/status/spec-completeness checks, metadata, and created/updated user tracking.
- Only one row per `company_id + project_id` can have `is_primary = true`.
- RLS is enabled and forced with active company membership policies through `public.is_active_company_member(company_id)`.
- Update trigger calls `public.set_updated_at()` without a `WHEN` clause.

Deferred:
- no UI
- no selected-system server actions
- no estimate or contract integration
- no `visualizer_sessions` or public/pre-auth visualizer handoff
- no estimate or contract system snapshots
- no shared files or `file_links`
- no message delivery proof
- no activity timeline
- no changes to current Estimate Editoror or estimate builder behavior

## System Snapshot Migration Slice

Schema-only snapshot slice implemented for future selected-system/spec proof at customer-facing estimate and contract review/signature boundaries.

Migration:
- `supabase/migrations/20260505173600_system_snapshot_foundation.sql`

Tables added:
- `estimate_system_snapshots`
- `contract_system_snapshots`

What changed:
- Added tenant-owned estimate and contract system snapshot tables with required `company_id`.
- `estimate_system_snapshots` uses same-company composite FKs to `estimates` and `selected_floor_systems`.
- `contract_system_snapshots` uses same-company composite FKs to `contracts` and `selected_floor_systems`, plus an optional same-company link to `estimate_system_snapshots`.
- Both tables preserve frozen customer/contract-facing selected-system proof metadata, including system/product/spec fields, area/phase/option labels, quantities, customer-facing description, technical notes, `component_snapshot_json`, and `metadata`.
- `component_snapshot_json` is constrained to a JSON array; `metadata` is constrained to a JSON object.
- Snapshot status values are `active`, `superseded`, `retracted`, `void`, and `amended`; normal delete/soft-delete behavior was not added.
- Partial unique active indexes prevent duplicate active snapshots for the same estimate/contract plus selected system.
- RLS is enabled and forced with active company membership policies through `public.is_active_company_member(company_id)`.
- Update triggers call `public.set_updated_at()` without a `WHEN` clause.
- A database trigger blocks DELETE and restricts UPDATE to `snapshot_status`, `metadata`, `updated_by`, and `updated_at`.

Deferred:
- no UI
- no server actions
- no estimate workflow writes
- no contract workflow writes
- no Estimate Builder integration
- no contract generation integration
- no creation/update of selected systems from estimates or contracts
- no `visualizer_sessions`
- no files or `file_links`
- no message delivery proof
- no activity events
- no seed/demo data
- no current product behavior changes

## System Layers Admin/Data Access Layer

Implemented the first admin/data access layer for the already-created first-slice system tables. This is an admin foundation only and does not add downstream workflow behavior.

Files changed:
- `apps/web/lib/system-layers/constants.ts`
- `apps/web/lib/system-layers/schemas.ts`
- `apps/web/lib/system-layers/data.ts`
- `apps/web/lib/system-layers/actions.ts`
- `apps/web/app/(app)/settings/system-layers/page.tsx`
- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/lib/settings/navigation.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:
- `/settings/system-layers` now lists, creates, edits, and archives tenant-owned `finish_products`.
- `/settings/system-layers` now lists, creates, edits, and archives tenant-owned `floor_system_templates`.
- Template components can be added, removed, reordered, and edited from the same settings surface.
- Server actions validate required fields, allowed status progression, service/finish family values, component quantity basis, JSON formula metadata, and tenant-owned linked records.
- Component writes require a same-company `catalog_items` row and optionally validate a same-company `finish_products` row.
- Component save normalizes `sort_order` to contiguous ordering and increments the parent template version on structural component changes.
- Template service/finish family structural changes increment `template_version`.

Still not added:
- no `visualizer_sessions`
- no estimate integration
- no contract integration
- no snapshots
- no files or file links
- no message delivery attempts/events
- no activity events
- no downstream workflow logic

## Selected Systems Admin/Data Access Layer

Implemented the first admin/data access layer for the already-created `selected_floor_systems` table. This is validation of the selected-system foundation only and does not add downstream workflow behavior.

Files changed:
- `apps/web/lib/selected-systems/constants.ts`
- `apps/web/lib/selected-systems/schemas.ts`
- `apps/web/lib/selected-systems/data.ts`
- `apps/web/lib/selected-systems/actions.ts`
- `apps/web/app/(app)/settings/selected-systems/page.tsx`
- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/lib/settings/navigation.ts`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:
- `/settings/selected-systems` now lists tenant-owned selected floor systems.
- Admin users can create and edit selected systems against existing same-company floor system templates, finish products, and real workflow anchors.
- Server actions validate selected-system check values for status, source, area type, and spec-completeness status.
- Server actions validate nonnegative estimated area and linear-foot quantities.
- Same-company validation is enforced for linked opportunity, customer, project, estimate, contract, job, floor system template, and finish product records.
- Selected systems require at least one real workflow anchor; the create form requires a project by default for the validation slice.
- Project-primary validation is enforced in the data layer: when a selected system is saved as primary for a project, other primary rows for that company/project are unset first.
- Admin users can change status, retract, void, and toggle project-primary state without touching downstream records.

Still not added:
- no estimate integration
- no contract integration
- no job integration
- no snapshots
- no `visualizer_sessions`
- no files or file links
- no message delivery attempts/events
- no activity events
- no customer-facing UI
- no changes to current Estimate Editoror or estimate builder behavior

## Post-Sign Ready-To-Schedule Handoff

Implemented a UI/workflow handoff from signed contract readiness into existing job and schedule foundations. No schema, RLS, auth, route architecture, or duplicate scheduling model was added.

Files changed:
- `apps/web/components/ready-to-schedule-action-panel.tsx`
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Behavior changed:
- Contract detail now shows a ready-to-schedule action panel only when the contract is fully signed and the existing project readiness snapshot is ready to schedule.
- Project detail now shows the same panel whenever the existing project readiness snapshot is ready to schedule.
- The panel routes to existing canonical job Quick-Create with project context, preserves approved estimate context where available, and links to the existing project-filtered `/schedule` surface.
- When exactly one unscheduled canonical job exists for the project, the ready-to-schedule panel now includes `jobId` with `action=schedule`, and `/schedule` can also infer that single project job from older `projectId + action=schedule` links so the existing schedule action panel opens immediately.
- Job Quick-Create now accepts the URL `estimateId` context from readiness handoffs and passes it into the existing canonical job create action; server-side job creation still validates the approved estimate/project relationship and the centralized readiness gate.
- Scheduling remains on canonical `jobs` and the centralized project readiness gate remains the enforcement point.

## People-Centered Portal Access Refactor

Focused refactor completed to make People the intended management home for customer-contact identity and portal access administration. No schema, RLS, auth, backend route, data-model, financial calculation, signature state-machine, payment-logic, or workflow-table changes were made.

Follow-up workflow recipient cleanup:
- Estimate send now exposes a shared `Send to contact` selector when active project-scoped portal access already provides eligible customer/contact recipients, preferring the main related contact or the only available recipient.
- Estimate send no longer presents recipient/access setup as estimate-owned management; if no eligible contact exists, the estimate page points users back to People.
- Contract send now uses the same `Send to contact` selector copy for eligible portal signers while preserving the existing signer routing and permission guards.
- Invoice send/status workflow remains on the existing canonical invoice status transition, with copy and server comments clarifying that recipient identity and portal access are managed from People rather than the invoice page.
- The stale manual-estimate Playwright resolver was updated to locate a real estimate detail page that actually exposes the current manual decision UI before running the mutation test.

Files changed:
- `apps/web/app/(app)/people/page.tsx`
- `apps/web/components/people-portal-access-panel.tsx`
- `apps/web/components/customer-contact-form.tsx`
- `apps/web/components/portal-access-grant-form.tsx`
- `apps/web/components/portal-project-access-form.tsx`
- `apps/web/lib/contacts/actions.ts`
- `apps/web/lib/portal-access/actions.ts`
- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/customers/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/components/estimate-form.tsx`
- `apps/web/components/send-to-contact-select.tsx`
- `apps/web/components/contract-status-actions.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/components/invoice-form.tsx`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/estimates/schemas.ts`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/lib/contracts/data.ts`
- `apps/web/lib/invoices/actions.ts`
- `e2e/estimate-manual-approval-action.spec.js`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/developer-source-of-truth.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`

Behavior changed:
- `/people` now loads related customer contacts, portal grants, stored contact-permission readiness, and project visibility using existing canonical loaders.
- Added a People customer-access panel for contact edit/create, main-contact selection, portal invite/access ensure, grant contact-linking, stored permission editing, revoke/reactivate, and project visibility using existing actions and existing canonical tables.
- Existing contact and portal-access server actions now accept an optional safe `returnTo` path for `/people` so the same actions can be hosted from People without duplicating action logic.
- Estimate and contract send surfaces now frame portal access as contact/access readiness, use contact-selection copy where eligible existing access data supports it, and point management back to People instead of making estimate/contract pages feel like access ownership surfaces.
- Customer surfaces now describe People as the portal access administration home while retaining contextual access visibility.

Existing risky access paths found:
- Customer detail was still the full portal access management surface: invite creation, grant linking, stored permission editing, revoke/reactivate, and project visibility were all presented there.
- `/people` copy and implementation were workforce-only and explicitly excluded customer recipient contacts, which conflicted with the new product direction.
- Invoice send is still an invoice status transition rather than a full contact-recipient picker; copy and server comments now make the customer/account fallback explicit.

Validation so far:
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with LF-to-CRLF working-copy warnings only.
- Previous Playwright attempt: `pnpm exec playwright test e2e/estimate-manual-approval-action.spec.js --project=chromium-protected` ran auth setup successfully but failed because the stale resolver selected an estimate detail page without the current manual decision UI. The resolver has since been updated to search candidate details for the active decision UI before running the mutation.

Deferred items:
- A deeper removal of duplicate customer-detail portal management controls can be done in a follow-up if the team wants Customer Detail to become read-only/context-only for access.
- A fuller invoice recipient picker is deferred until invoice sending grows a dedicated recipient-selection action; People remains the management home in the meantime.

## Decision-First UI Refactor Final Documentation Phase 14

Phase 14 completed as documentation and safe cleanup for the implemented decision-first UI refactor. No UI redesign, backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made.

Docs changed:
- `docs/current-state.md`
- `docs/ui-patterns.md`
- `docs/chat-handoff.md`
- `packages/ui/README.md`

Cleanup performed:
- Updated `docs/current-state.md` only where implemented UI behavior materially changed, replacing the stale latest UI direction note that still described unresolved clarity gaps.
- Created `docs/ui-patterns.md` as the current pattern guide for decision-first page structure, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, status color semantics, the orange CTA rule, Manager/List Page guidance, and portal/super-admin differences.
- Added `packages/ui/README.md` to document exported decision-first components, shared status helpers, theme exports, and package guardrails.
- Added this final Phase 1-14 summary to `docs/chat-handoff.md`.
- No docs or components were removed; the export/reference inventory did not show a clearly obsolete component that was safe to delete.

Validation:
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings.
- `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` passed and listed 19 tests.
- Targeted decision-first primitive Playwright test passed: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/ui-primitives.spec.js --project=chromium-public`.
- Protected detail smoke tests were not rerun in Phase 14 because localhost was not running and this phase changed documentation/package docs only; the Phase 13 authenticated targeted run remains the latest protected decision-first smoke evidence.

Final Phase 1-14 summary:
- Phase 1 established shared `@floorconnector/ui` foundation pieces: theme constants, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, `SecondarySection`, and shared semantic status helpers.
- Phase 2 added contractor layout section wrappers for core workflow, execution, and support sections.
- Phase 3 captured the pre-refactor audit in `docs/ui-refactor-audit.md`.
- Phases 4-9 refactored the main contractor decision surfaces: dashboard, Project Workspace, Estimate Workspace, Invoice Workspace, Job Workspace, and Contract Workspace.
- Phase 10 cleaned up Projects, Estimates, Invoices, Jobs, Contracts, and Customers Manager Pages without changing their actions, filters, search, quick-create, or workflows.
- Phase 11 polished shared contractor UI components so cards, badges, headings, list rows, and orange CTA usage are more consistent.
- Phase 12 audited and then safely cleaned up portal/super-admin UI consistency without copying contractor ActionBar/WorkflowBar patterns or touching access/permission/workflow behavior.
- Phase 13 added targeted Playwright smoke coverage for shared primitives, dashboard PriorityStrip, and project/estimate/invoice/job/contract decision-first fixtures.
- Phase 14 documented the implemented UI baseline and package exports.

Deferred items:
- No broad visual snapshot suite was added.
- No mutation workflow tests were added for approve/send/sign/schedule/payment flows.
- No portal/super-admin structural redesign was started.
- No target IA or architecture docs were changed because their guidance was not materially stale.

## UI Refactor Testing Expansion Phase 13

Phase 13 completed as a tests-only expansion for the decision-first UI system. No UI redesign, backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made.

Files changed:
- `e2e/ui-primitives.spec.js`
- `e2e/detail-workspace-ui.spec.js`
- `e2e/dashboard-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Tests added or updated:
- Added isolated public Playwright coverage for shared UI primitives: `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`, including console error capture.
- Added authenticated dashboard smoke coverage for the PriorityStrip surface.
- Added authenticated project detail and estimate detail smoke coverage for decision-first regions.
- Added authenticated invoice detail smoke coverage for:
  - `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`
  - `/invoices/c9131b30-dea7-45a5-b476-8ba2bf3fc502`
  - `/invoices/894d1e3a-c3f2-4572-869b-545f00aef027`
- Added authenticated job detail smoke coverage for:
  - `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`
  - `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4`
  - `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80`
- Added authenticated contract detail smoke coverage for:
  - draft `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8`
  - sent `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
  - signed `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4`
- Updated dashboard smoke coverage to assert the projects navigation entry is visible without relying on a brittle broad-text click.
- Updated Playwright project matching so public primitive tests stay public and protected decision-first smoke tests run only under authenticated protected coverage.

Fixtures required:
- Invoice, job, and contract fixtures listed above.
- Project detail fallback: `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`, overrideable with `FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH`.
- Estimate detail fallback: `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`, overrideable with `FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH`.
- Authenticated Playwright storage from `e2e/auth.setup.js` using the existing `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD` credentials.

Validation:
- `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` passed; 19 tests listed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e:auth` passed.
- Targeted Phase 13 Playwright run passed: `PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/ui-primitives.spec.js e2e/dashboard-ui.spec.js e2e/project-detail-ui.spec.js e2e/detail-workspace-ui.spec.js --project=chromium-public --project=chromium-protected --no-deps` reported 14 passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings.

Deferred coverage:
- Mutation workflows remain intentionally out of scope: approve/send/sign/schedule/unschedule/payment actions were not exercised.
- Portal and super-admin test expansion remains deferred.
- Visual snapshot and style-only assertions remain deferred; Phase 13 uses resilient role/text checks and console/error capture.

## Portal And Super-Admin UI Consistency Cleanup Phase 12B

Phase 12B completed as a UI-only cleanup limited to the `safe now` items from [docs/portal-superadmin-ui-audit.md](C:/FloorConnector/docs/portal-superadmin-ui-audit.md).

Files changed:
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/app/(super-admin)/super-admin/layout.tsx`
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/platform/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/app/(super-admin)/super-admin/catalogs/page.tsx`
- `apps/web/app/(super-admin)/super-admin/modules/page.tsx`
- `apps/web/app/(super-admin)/super-admin/admin/page.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/portal-review-ui.tsx`
- `apps/web/components/settings-nav.tsx`
- `apps/web/components/settings-overview-card.tsx`
- `apps/web/components/settings-section-card.tsx`
- `apps/web/components/settings-surface-layout.tsx`
- `docs/chat-handoff.md`

Exact cleanup:
- Added neutral visual variants to shared settings shell/card/nav components and applied them only to the super-admin surface, preserving the existing warm defaults for contractor settings.
- Added a neutral `DetailPanel` variant and applied it to super-admin configuration panels where dense admin forms benefit from flatter card chrome.
- Added small shared portal review UI helpers for hero panels, state panels, inset panels, action boxes, secondary links, document panels, and status badges.
- Reduced portal hero/state card radius, glass/shadow weight, gradient panel usage, and passive brand-accent section labels on portal home, project, estimate, contract, invoice, and change-order review surfaces.
- Replaced several neutral portal status pills with shared semantic status badge styling while keeping metadata chips neutral.
- Quieted portal secondary return/review links so approve/sign/pay actions remain the clearest customer CTAs.

QA results:
- authenticated Playwright smoke QA used `playwright/.auth/local-user.json` against `http://localhost:3000`
- `/portal` loaded with status 200, stayed on `/portal`, rendered `Customer Portal`, and produced no console errors, page errors, or 500 responses
- `/super-admin` loaded with status 200, stayed on `/super-admin`, rendered `Platform Admin`, and produced no console errors, page errors, or 500 responses

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- portal visual language/density decisions remain deferred beyond this safe cleanup
- deeper portal semantic color policy remains deferred beyond conservative shared badge use
- no contractor ActionBar/WorkflowBar pattern was copied into portal or super-admin
- no auth, portal access, record loader, super-admin permission, route, schema, backend, RLS, server-action, or workflow changes were made

## Portal And Super-Admin UI Consistency Audit Phase 12A

Audit-only Phase 12A completed. No application implementation changes were made.

Files changed:
- `docs/portal-superadmin-ui-audit.md`
- `docs/chat-handoff.md`

Audit summary:
- Portal is correctly customer-facing and project-scoped, but uses repeated large rounded/glassy cards, gradients, passive brand-accent eyebrows, and neutral status chips that make some review/sign/pay states harder to scan.
- Portal primary actions are generally clear (`Approve`, `Sign`, `Continue to checkout`), but secondary return/open links often use pill styling similar to status chips.
- Super-admin should not copy contractor orange CTA behavior; its slate/black primary save/admin actions fit platform governance.
- Super-admin still carries older settings beige/orange shell chrome through shared settings components such as `SettingsSurfaceLayout`, `SettingsOverviewCard`, and `SettingsSectionCard`.
- Shared semantic status helper adoption is a safe candidate where statuses are truly statuses; metadata chips should stay neutral.
- Contractor patterns that should not be copied directly: Manager Page command bars, Quick-Create/universal-create behavior, contractor operational ActionBar/WorkflowBar assumptions, project-readiness/crew/schedule internals, and orange contractor CTA language.

Recommended phases:
- safe now: neutralize super-admin settings shell chrome, normalize portal/super-admin card radius and border language, apply shared status helpers where purely presentational, and quiet secondary portal links.
- needs design decision: portal softness/density, portal semantic color policy, and whether super-admin remains settings-shell based or gets a dedicated platform-admin shell later.
- defer: portal access/auth/RLS/sign/pay/approval workflow changes, super-admin permissions/tenant lifecycle/module-policy/data-loader changes, route changes, and blanket ActionBar/WorkflowBar rollout.

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no auth, portal access, record loader, super-admin permission, route, schema, backend, RLS, workflow logic, or application UI implementation changes were made

## Decision-First UI Refactor Phase 11

Global component polish completed as a UI-only shared contractor-component pass. Scope stayed on shared contractor UI primitives and small consistency fixes affecting the already-refactored contractor pages.

Files changed:
- `apps/web/components/app-empty-state.tsx`
- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/detail-page-header.tsx`
- `apps/web/components/linked-record-card.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/universal-create-menu.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/workspace-composer-sheet.tsx`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/components/secondary-section.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- Shared workflow/detail primitives already used `rounded-lg` shells and semantic status helpers.
- `ManagerDashboardCard` already had shared status badge support from the manager-page cleanup.
- Remaining reusable drift was concentrated in warm beige/orange shell chrome: manager headers, command bars, empty states, linked record cards, detail headers, quick-create sheets, and the universal-create menu.
- Orange appeared in several passive eyebrow/header/link treatments, not only primary CTAs.

Exact polish made:
- Neutralized shared contractor manager headers, command bars, empty states, linked record cards, detail headers, quick-create sheet chrome, and universal-create menu panels to white/gray system surfaces.
- Kept orange on actual primary create/CTA buttons; removed orange from passive eyebrows, menu group labels, back links, empty-state chrome, and hover-only card emphasis.
- Standardized shared contractor cards and rows around `rounded-lg`, `#e2e5e9` borders, white backgrounds, `#f8fafc` hover/empty surfaces, and gray secondary text.
- Aligned `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, and `SecondarySection` typography/colors with the black/gray decision-first system.
- Removed the heavier primary-section shadow so shared workflow sections feel more consistent with ActionBar/WorkflowBar/summary cards.
- Preserved existing component props, links, forms, conditionals, and status-helper behavior.

QA results:
- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/dashboard` loaded with status 200 and no console errors, page errors, or 500 responses
- `/projects` and project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` loaded with status 200 and no console errors, page errors, or 500 responses
- `/estimates` and estimate detail `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e` loaded with status 200 and no console errors, page errors, or 500 responses
- `/invoices` and invoice detail `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7` loaded with status 200 and no console errors, page errors, or 500 responses
- `/jobs` and job detail `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886` loaded with status 200 and no console errors, page errors, or 500 responses
- `/contracts` and contract detail `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8` loaded with status 200 and no console errors, page errors, or 500 responses
- `/customers` loaded with status 200; opened customer detail `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d` from the customer list path with status 200 and no console errors, page errors, or 500 responses

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no portal, super-admin, settings, new page layouts, or broader app-shell navigation polish was attempted
- no mutation QA was performed because this phase was visual/component-only
- no backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made

## Decision-First UI Refactor Phase 10C

Customers list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/customers` only.

Files changed:
- `apps/web/app/(app)/customers/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- Customers manager preserved existing search, `New customer` quick-create link, success/error messages, queue card links, recent-record customer links, empty-state create path, `WorkspaceComposerSheet`, `CustomerQuickCreateForm`, and `quickCreateCustomerAction`.
- Existing loaded customer, project, and financial-settings data only was used; no invoice/balance data was introduced because the page does not currently load customer balance context.
- No new filters, server actions, routes, data fetches, workflow states, or mutation paths were introduced.

Exact UI changes:
- Customers summary tiles were normalized to the same compact neutral-card treatment used by the other decision-first manager pages.
- Customer queue cards now use semantic badges for action-oriented records such as missing contact/address and project-linked customers.
- A linked-project count map now supports existing-data project continuity cues without changing data loading.
- Recent customer rows now include a `Continuity` column that shows next cues from existing contact/address/project-link data: add direct contact, add address, linked project count, or ready for first project.
- Financial defaults now use the shared semantic badge helper for taxable/tax-exempt display, with retainage kept secondary.
- The primary `New customer` action, search behavior, quick-create overlay, and empty-state create path remain unchanged.

QA results:
- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/customers` loaded with status 200, `New customer` was visible, customer detail links were present, continuity cues rendered, and no console errors or bad responses were captured
- opened customer detail from the list candidate `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d`; it loaded authenticated with status 200 and no console errors or bad responses

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no customer detail, portal, super-admin, settings, or other manager page changes were made
- no backend, schema, auth, RLS, server-action, data-model, route, workflow, balance logic, portal-access logic, or customer-create behavior changes were made
- no mutation QA was performed for customer creation or customer editing in this UI-only phase

## Decision-First UI Refactor Phase 10B

Invoices, Jobs, and Contracts list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/invoices`, `/jobs`, `/contracts`, and the invoice records panel used by the Invoices manager.

Files changed:
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(app)/jobs/page.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/components/invoices/invoice-records-panel.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- Invoices manager preserved existing search, invoice status filters, context hidden inputs, rows-per-view control, `New invoice` quick-create link, queue card links, paid-context links, scoped-context clear link, `WorkspaceComposerSheet`, `InvoiceQuickCreateForm`, and `quickCreateInvoiceAction`.
- Jobs manager preserved existing search, job view filters, project scoping, `New job` quick-create link, queue card links, recent-record job links, empty states, `WorkspaceComposerSheet`, `JobQuickCreateForm`, and `quickCreateJobAction`.
- Contracts manager preserved existing search, status filters, `New contract` quick-create link, snapshot-repair estimate link, queue card links, recent-record contract links, empty states, `WorkspaceComposerSheet`, `ContractQuickCreateForm`, and `quickCreateContractFromEstimateAction`.
- Existing loaded data only was used for continuity cues; no new data fetches, filters, server actions, routes, workflow states, or mutation paths were introduced.

Exact UI changes:
- Invoices manager summary, command filters, billing posture, scoped-context notice, paid queue, and invoice records panel were neutralized to reduce passive beige/orange noise while leaving `New invoice` as the clear primary action.
- Invoice records now use shared `getStatusBadgeClassName()` status badges and show a light continuity cue such as finish billing detail, collect payment, settled, or voided from existing status/due-date data.
- Invoice queue cards now use semantic invoice status badges and balance-focused continuity copy while preserving existing balance-due calculations.
- Jobs manager summary tiles were normalized to the same compact neutral-card treatment used by the other decision-first manager pages.
- Jobs queue cards now show semantic dispatch-status badges; the recent records table now uses shared status badges and a `Schedule / crew` column with cues for scheduling, crew vendor, crew assignments, active work, or closeout from existing job/assignment data.
- Contracts manager summary tiles were normalized to the compact neutral-card treatment.
- Contract queue cards and recent records now use shared status badges and signature-readiness cues derived from existing status, readiness, customer signature, contractor countersign, and signed timestamps.
- Contracts keep green/completed styling limited to `signed` records; sent/viewed/readiness states remain warning/neutral/info rather than completed.

QA results:
- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/invoices` loaded with status 200, `New invoice` was visible, a real invoice detail/edit link was present, continuity cues rendered, and no console errors were captured
- `/jobs` loaded with status 200, `New job` was visible, real job detail links were present, schedule/crew cues rendered, and no console errors were captured
- `/contracts` loaded with status 200, `New contract` was visible, real contract detail links were present, signature cues rendered, and no console errors were captured
- opened invoice detail from the list candidate `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`; it loaded authenticated with status 200 and no console errors
- opened job detail from the list candidate `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`; it loaded authenticated with status 200 and no console errors
- opened contract detail from the list candidate `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8`; it loaded authenticated with status 200 and no console errors
- note: the initially running dev server had stale dynamic chunks that produced 404 console noise for jobs/contracts; restarting the local dev server cleared the stale chunk state, and the final QA run had no console errors or bad responses

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed after removing one obsolete invoice helper
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no customers, portal, super-admin, settings, or detail-page refactors were made
- no backend, schema, auth, RLS, server-action, data-model, route, workflow, balance logic, scheduling logic, crew logic, or signature logic changes were made
- no mutation QA was performed for invoice creation, job creation, contract generation, scheduling, crew assignment, payment, send, sign, or countersign flows in this UI-only phase

## Decision-First UI Refactor Phase 10A

Projects and Estimates list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/projects`, `/estimates`, and the estimate records panel used by the Estimates manager.

Files changed:
- `apps/web/app/(app)/projects/page.tsx`
- `apps/web/app/(app)/estimates/page.tsx`
- `apps/web/components/estimates/estimate-records-panel.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- Projects manager preserved existing search form, status filters, `New project` quick-create link, queue-card links, recent-record detail links, empty-state create link, `WorkspaceComposerSheet`, `ProjectQuickCreateForm`, and `quickCreateProjectAction`.
- Estimates manager preserved existing search form, status filters, rows-per-view control, `Add estimate` quick-create link, estimate detail/edit links, queue cards, status breakdown links, empty-state create path, `WorkspaceComposerSheet`, `EstimateQuickCreateForm`, `quickCreateEstimateAction`, and inline customer quick-create action.
- Existing loaded data only was used for continuity cues; no new data fetches, actions, filters, routes, or workflow states were introduced.

Exact UI changes:
- Projects manager summary tiles were lightly normalized with the same compact rounded neutral-card treatment used by the decision-first manager direction.
- Projects workflow queue cards now show semantic status/finance badges through the existing `ManagerDashboardCard` status-badge path and use existing project readiness/status fields for concise continuity cues.
- Projects recent records now use shared `getStatusBadgeClassName()` status badges and replace the plain commercial-state column with a clearer continuity column derived from existing readiness/status fields.
- Estimates summary tiles and status breakdown were neutralized to reduce passive beige/orange noise while leaving the orange `Add estimate` action as the primary create CTA.
- Estimates status breakdown now uses shared status badge classes for draft/sent/approved/rejected scan consistency.
- Estimate records panel now uses shared status badge classes, neutral table chrome, tighter hover/divider treatment, and a light `Next:` continuity line derived from existing estimate status/customer-view fields.

QA results:
- authenticated Playwright browser QA ran against `http://localhost:3001` using `playwright/.auth/local-user.json`
- `/projects` loaded authenticated, `New project` quick-create entry was visible, real project detail links were present, and no browser console errors were captured
- opened real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` from the list-link set; it loaded authenticated with expected project-detail content and no browser console errors
- `/estimates` loaded authenticated, `Add estimate` quick-create entry was visible, estimate records/detail links were present, new `Next:` continuity copy rendered in row link text, and no browser console errors were captured
- opened real estimate detail `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e` from the list-link set; it loaded authenticated with expected estimate-detail content and no browser console errors

Validation:
- `pnpm typecheck` passed after aligning the project continuity helper with the real `CommercialReadinessStatus` enum (`not_ready`, not `not_started`)
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no customer, invoice, job, contract, portal, super-admin, route, workflow, backend, schema, auth, RLS, server-action, or data-model changes were made
- no deeper list-page IA expansion, new ActionBar, new filters, new queues, or mutation QA was added in this phase

## Decision-First UI Refactor Phase 9.1

Contract Detail sent/awaiting fixture setup and QA completed through existing contractor UI/server actions only. No direct contract-state writes or readiness/signer guard bypasses were used.

Files changed:
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `docs/chat-handoff.md`

Fixture setup:
- started from draft contract `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
- used the existing Customer Workspace Portal Access invite form for customer `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d`
- scoped the existing active local QA login email to project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` through the normal customer-level portal access path
- returned to Contract Detail, selected the now-eligible customer portal signer through the existing send-for-signature form, and submitted `Send for signature`
- stopped before any customer signature, onsite signature, decline, or contractor countersign action

Sent fixture:
- sent/awaiting contract: `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
- state verified: `sent`, `Awaiting customer`, `0/1 signed`, locked because signature activity has started

Exact UI/QA results:
- authenticated Playwright auth setup passed against `http://localhost:3000`
- draft fixture `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8` loaded with no console errors, kept draft send readiness visible, showed no standalone `Sign` action, kept signer routing and recent signature events visible, and had no green/emerald styling
- sent fixture `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` loaded with no console errors, showed `Await customer signature`, showed no `Send for signature`, showed no standalone `Sign`, showed no contractor countersign action, kept onsite customer signature available as the valid unsigned-customer path, kept sent PDF snapshot visible, kept signer routing and recent signature events visible, and had no green/emerald styling before full signature completion
- signed fixture `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4` loaded with no console errors, showed `Signature complete`, kept signer routing and recent signature events visible, showed no send/sign/countersign controls, and was the only tested state with green completed styling
- WorkflowBar remained conservative: the sent fixture showed contract progress as `0/1 signed`, job as not created, invoice as not linked, and payment as not collected
- small UI-only follow-up made during QA: Contract Detail WorkflowBar no longer marks the upstream Estimate step complete/green until the contract itself is fully signed, satisfying the no-green-before-signed rule

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- portal customer sign/decline mutation testing remains intentionally unexercised for this pass
- contractor countersign mutation testing remains deferred because this fixture was sent without a required contractor countersigner
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 9

Contract Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the Contract Review workspace and the contract detail action component used by that workspace.

Files changed:
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/components/contract-status-actions.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- actions/forms preserved: draft edit link, internal approval status updates, send-for-signature customer signer selection, optional contractor countersigner selection, contractor countersign, onsite customer signature modal, void action, and sent PDF snapshot link
- links preserved: contracts manager, source estimate, project readiness hub, customer/project context, project schedule, linked jobs, linked invoices, related conversations, and generated/sent PDF context
- conditional states preserved: draft send readiness, internal approval blockers, signature lock/editability, sent/viewed awaiting customer, declined, void, signed/completed, customer signer routing, optional contractor countersign, signature events/history, and deposit/project-readiness follow-through

Exact UI changes:
- replaced the old agreement identity/next-action summary band with `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`
- made the top `ActionBar` choose the truthful next signature step: edit/review draft readiness, send for signature, await customer, contractor countersign, signature complete, declined, or void
- added a conservative `WorkflowBar` for `Estimate -> Contract -> Job -> Invoice -> Payment`, with green completion only when the existing linked records prove completion
- added a compact `Signature state` summary for contract status, signer progress, signature mode, and edit lock state
- wrapped the agreement body in `PrimarySection` so contract content is the primary review surface
- kept workflow actions, signer routing, schedule handoff, connected workflow links, related conversations, editability/lock details, revisions, and recent signature events visible below the document as supporting context
- changed pre-completion contract action styling so internal approval and contractor countersign states no longer use green; green is reserved for fully signed/completed contract state

QA results:
- authenticated Playwright auth setup passed against `http://localhost:3000`
- draft contract `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` loaded with no console errors, showed the new `ActionBar`, `Contract workflow`, `Signature state`, and `Contract content`, kept `Edit draft`, draft-only send readiness, workflow actions, signer routing, schedule handoff, connected workflow links, and recent signature events visible, and showed no standalone `Sign` action
- signed contract `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4` loaded with no console errors, showed `Signature complete`, conservative downstream workflow state from real linked jobs/invoices/payments, signer progress `1/1 signed`, locked edit state, sent PDF snapshot, signer routing, connected workflow, and recent signature events, with no send, edit, void, sign, or countersign controls visible
- the contracts manager showed 3 visible contracts total: 2 draft ready-to-send contracts and 1 signed contract; it showed 0 sent and 0 viewed contracts
- sent/awaiting browser QA was not exercised because no sent/viewed contract exists locally, and both available draft contracts lacked an eligible customer signer for a safe UI-only send action

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- sent/viewed awaiting-customer Contract Detail QA remains pending until a real sent/viewed contract fixture exists or a safe eligible customer signer is available through normal UI setup
- customer portal sign/decline and contractor countersign mutation testing were not performed in this UI-only pass
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8

Job Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the Job Workspace only.

Files changed:
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- actions/forms preserved: `updateJobAction` status progression, `scheduleJobAction`, `unscheduleJobAction`, `assignCrewAction`, and `unassignCrewAction`
- links preserved: jobs manager, project hub, customer workspace, linked estimate, linked invoice, invoice creation from completed uninvoiced jobs, time cards, punchlists, and daily logs
- conditional states preserved: job dispatch status progression, completed-job invoice handoff, operational blockers for unscheduled/unassigned/uninvoiced-completed jobs, schedule edit visibility, unschedule visibility, crew assignment rows, and empty states for punchlists/daily logs

Exact UI changes:
- replaced the old top summary band with `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`
- made the top story execution-first: current job action, schedule state, crew state, dispatch status, and project context
- promoted `Schedule and crew` to the first primary working section, with schedule save/unschedule and crew assign/unassign controls kept together
- moved project/customer/estimate/invoice context into secondary connected-record areas and removed estimate total emphasis from the job page
- moved job notes into the side rail and kept daily logs, time, punchlists, and connected records visible but secondary
- removed duplicate status/schedule/crew summaries from the side rail

QA results:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright auth setup passed against `http://localhost:3000`
- authenticated `/jobs` browser QA reached the Jobs Manager Page with no console errors, but the local contractor account currently has 0 jobs, so unscheduled/scheduled/in-progress/completed Job Workspace QA could not be exercised without creating or mutating data

Deferred items:
- browser QA on real unscheduled, scheduled, in-progress, and completed Job Workspace records remains pending until local QA data includes jobs
- no mutation testing of schedule, unschedule, crew assignment, crew unassignment, status progression, or invoice creation was performed in this UI-only pass
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8.1

Job Detail QA fixture setup and verification completed against the preferred `24 Investor Way` QA chain using existing contractor-app UI and server actions only.

Files changed:
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Exact UI change:
- tightened the Job Workspace unschedule visibility guard so `Unschedule job` renders only for `scheduled` jobs, not `unscheduled`, `in_progress`, or `completed` jobs

QA fixtures created or used:
- unscheduled job: `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`
- scheduled job: `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4`
- in-progress job: `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80`
- project: `/projects/6922a413-1350-496c-89d9-6b03dcbad0f1`

Exact QA results:
- authenticated Playwright auth setup passed against `http://localhost:3000`
- the unscheduled, scheduled, and in-progress Job Workspace pages all loaded as authenticated protected pages with no browser console errors
- `ActionBar` truthfulness verified: unscheduled shows `Mark scheduled`, scheduled shows `Start work`, in-progress shows `Mark complete`
- `WorkflowBar` did not overstate downstream completion for unscheduled or scheduled jobs, and did not claim field work complete for the in-progress job
- `ProjectStateSummary` showed schedule, crew, status, and project context on each fixture
- schedule visibility verified: unscheduled keeps schedule entry visible without `Unschedule job`; scheduled keeps `Unschedule job`; in-progress hides `Unschedule job`
- crew visibility verified: `Add assignment` remains visible; no assignable person or vendor options were available for the tested in-progress fixture, so no `Unassign` control was expected
- project, customer, daily execution context, time, and invoice context remained visible on all three fixture detail pages

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- completed-job fixture QA was not created in this pass; the safe existing UI path was stopped at in-progress
- crew unassignment was not exercised because no assignable crew/person/vendor options were available in the existing assignment UI
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8.2

Job Detail polish and regression review completed against the existing Phase 8.1 fixtures. No new job fixtures were created.

Files changed:
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:
- changed the schedule form heading to `Set schedule` for unscheduled jobs and `Update schedule` for scheduled or in-progress jobs
- kept unscheduled schedule entry as an explicit `Save schedule` action instead of showing an initial `Saved` state before any schedule exists
- kept the existing schedule save action wiring unchanged for all statuses where schedule updates remain visible
- reduced crew-assignment emphasis when no assignable crew members or labor-provider vendors exist by replacing the empty assignment form/button with a quiet setup note
- preserved the full existing crew assignment form and `assignCrewAction` path when assignable people or labor-provider vendors are available
- left estimate and invoice context in the secondary connected-record area and kept estimate totals out of the job page

QA results:
- authenticated Playwright auth setup passed against `http://localhost:3000`
- unscheduled fixture `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886` loaded with no console errors, showed `Mark scheduled`, showed `Set schedule` with `Save schedule`, did not show `Unschedule job` or `Start work`, kept the conservative workflow/state summary visible, and showed the softened no-crew-options note
- scheduled fixture `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4` loaded with no console errors, showed `Start work`, showed `Update schedule`, showed exactly one `Unschedule job`, kept the WorkflowBar conservative, and showed the softened no-crew-options note
- in-progress fixture `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80` loaded with no console errors, showed `Mark complete`, showed `Update schedule`, did not show `Unschedule job`, marked execution as in progress without claiming field work complete, and showed the softened no-crew-options note
- all three fixtures kept Job Workspace, Job execution workflow, Job execution state, Schedule and crew, Connected Records, Daily Execution Context, and Labor and Time context visible
- browser QA required refreshing the Playwright storage state before individual fixture checks because the local Supabase session rotated during repeated scratch-script page loads; this did not require any app change or data mutation

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- completed-job fixture QA remains deferred
- crew assignment and unassignment were not mutation-tested because the existing QA organization has no assignable people or labor-provider vendors available
- no Contract Detail work was started
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Contractor UI Cleanup Pass

Focused shared-component UI cleanup completed after the Project Detail decision-first refactor. This was UI-only polish, not a new feature phase or page-layout refactor.

Files changed:
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/components/secondary-section.tsx`
- `apps/web/components/linked-record-card.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `docs/chat-handoff.md`

Exact UI cleanup made:
- standardized the new decision-first shells on neutral `8px` radius cards with consistent neutral borders
- changed `WorkflowBar` current/in-progress styling from amber to blue, matching the status-color rule
- split `ProjectStateSummary` tones so active/current can be blue while needs-action/readiness blockers use yellow
- kept non-clickable `ActionBar` next-action labels neutral instead of brand-colored
- removed decorative warm gradients/borders from contractor linked record cards
- calmed contractor manager dashboard cards by neutralizing eyebrow labels, badges, hover states, and secondary action buttons
- updated project detail readiness warning mapping to use the new `needsAction` state summary tone

Behavior preserved:
- no project detail actions, links, forms, guards, server actions, readiness calculations, data loaders, workflow behavior, auth, RLS, route architecture, schema, backend, or data model changed
- dashboard, estimates, invoices, jobs, contracts, portal, super-admin, and list pages were not refactored into new layouts
- the completed Project Detail structure remains intact: `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and core Estimate/Contract/Job/Invoice workflow grouping remain in place

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright QA passed after restarting a stale dev server that was serving a bad client chunk
  - login completed through `/login` using root `.env.local` E2E credentials without printing credential values
  - checked `/dashboard`, real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`, `/estimates`, and `/invoices`
  - project detail rendered the decision-first stack: Project Workspace, Project readiness workflow, Project state summary, Core Workflow, Estimate, Contract, Job, and Invoice
  - project estimate and invoice links remained visible and did not break authentication during interaction checks
  - no browser console errors were captured on the passing QA run
  - screenshots were saved under `test-results/ui-cleanup-*.png`

Intentionally deferred cleanup:
- no `DetailPanel`, portal, or super-admin card restyling in this pass because those shared surfaces cross the contractor-only scope
- no dashboard, estimate, invoice, job, contract, or list-page layout refactors
- no mutation testing of create/save actions; this pass only verified visibility, navigation/auth continuity, and rendering stability

## Contractor UI System Hardening Pass

Focused post-cleanup hardening completed before the Dashboard phase. This was a UI-only and test-infra-only pass scoped to shared contractor UI components, Project Detail, and protected Playwright setup.

Files changed:
- `packages/ui/src/status.ts`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/index.ts`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `e2e/auth.setup.js`
- `e2e/project-detail-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Exact hardening made:
- added one shared `@floorconnector/ui` status presentation helper for status tone mapping and status badge/connector classes
- centralized semantic status colors for gray neutral/draft/not-started, blue active/current/in-progress, yellow needs-action/waiting/readiness-warning, red blocked/error/failed, and green complete/approved/paid/signed
- updated `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, project detail badges, and contractor manager-card badges to use shared status presentation instead of local status-color strings
- preserved orange for primary CTAs only; project follow-up warning actions now render as neutral secondary actions
- removed the remaining passive `brand-*` current-state styling from project readiness stage cards by routing those through the shared status helper
- made `PrimarySection` slightly stronger than secondary/support sections with neutral border weight and a minimal shadow so the Project Detail core workflow has subtle priority
- inspected Project Detail next-action cases without changing business logic; no misleading display/link target was found that required workflow changes
- fixed `e2e/auth.setup.js` to load root `.env.local`, scope to the email/password form, and click `Log in with email` instead of the Google OAuth submit button
- added `e2e/project-detail-ui.spec.js` to smoke-test the Project Detail `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and `Core Workflow`

Behavior preserved:
- no backend, schema, auth logic, RLS, route architecture, server action, data loading, readiness calculation, workflow behavior, forms, permissions, or guards changed
- no dashboard, estimate, invoice, job, contract, portal, super-admin, or list-page layout refactor was started
- Project Detail remains the decision-first workflow/readiness hub with `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and core Estimate/Contract/Job/Invoice grouping intact

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- Playwright auth setup passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
- protected Playwright Project Detail smoke test passed under the `chromium-protected` project
- authenticated browser QA passed for `/dashboard` and real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
- browser QA verified `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` are visible on Project Detail
- safe navigation QA clicked the visible `Review contract` project action and landed on `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` without redirecting to login
- no browser console errors were captured during the passing QA checks

Intentionally deferred:
- no further global card system changes outside the requested shared components
- no portal/super-admin consistency pass
- no Dashboard phase work or other page-level layout refactors
- no mutation testing of create/save/payment/signature actions

## Decision-First UI Refactor Phase 5

Dashboard decision-center refactor completed as a UI-only contractor-app change. Scope stayed on the contractor dashboard surface and dashboard smoke QA; no estimate, invoice, job, contract, portal, super-admin, or list-page layout refactor was started.

Files changed:
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/dashboard/priority-strip.tsx`
- `e2e/dashboard-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Inventory before editing:
- visible actions and links included Universal Create, top shortcuts to Projects, Schedule manager, Payments manager, and Cost items database, metric links to Leads, Estimates, Schedule, and Appointments, queue links into attention items, leads, estimates, contracts, projects, jobs, appointments, invoices, payments, and project context links, plus onboarding links to Settings, Customers quick-create, Projects quick-create, and Estimates quick-create
- metrics included leads needing follow-up, estimates awaiting action, jobs needing schedule, appointments today, jobs today/live, role, active projects, open receivables, scheduled appointments, unscheduled jobs, open punchlists, ready progress-billing workspaces, customer count, estimate count, and open receivables
- conditional sections included high-signal attention, onboarding setup guide, commercial queues, operations queues, finance queues, empty states, top shortcut metrics, and quick-create access
- existing data loaders and server actions remained the same: customer, opportunity, estimate, approved-estimate, project, contract, job, appointment, punchlist, invoice, payment, notification, progress-billing, financial settings, workflow settings, and quick-create actions for lead/customer/project/estimate/contract/job/invoice/change order

Exact UI changes:
- added dashboard-only `PriorityStrip` at the top of the dashboard content, derived from existing notification, receivables, estimate, and job queues
- reordered the visible dashboard structure to Priority Strip -> Key Metrics -> Onboarding when needed -> Work Queues
- renamed the metric grid treatment to a clearer key-metrics section: `Pipeline and execution snapshot`
- kept Universal Create in the header as the single orange primary create CTA
- normalized passive dashboard header, onboarding, queue cards, and queue badges toward neutral-first styling
- routed dashboard queue badges and onboarding status badges through the shared `@floorconnector/ui` status helper
- preserved all existing dashboard data sources, links, quick-create action wiring, search, queue filtering, and empty states
- added a protected Playwright dashboard smoke test for the decision-center headings, Universal Create visibility, Projects navigation, and console-error check

Behavior preserved:
- no backend, schema, auth logic, RLS, route architecture, server action, data model, workflow behavior, guards, or data loading changed
- quick-create access remains visible from the dashboard header
- existing dashboard actions and links remain visible where their original conditions apply

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright dashboard smoke QA passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
  - login completed through the existing setup project using root `.env.local` E2E credentials without printing credential values
  - `/dashboard` rendered the new `Decide what needs attention first` priority strip and `Pipeline and execution snapshot` key metrics section
  - Universal Create remained visible
  - the dashboard Projects navigation path worked and landed on `/projects`
  - no browser console errors were captured during the passing dashboard QA run

Intentionally deferred:
- no mutation testing of create/save actions
- no dashboard data-loader or priority algorithm changes beyond existing loaded data
- no refactor of dashboard placeholders or non-rendered quick-create prop plumbing
- no estimates, invoices, jobs, contracts, portal, super-admin, or list-page layout changes

## Phase 5 Dashboard Polish Review

Focused dashboard-only review and polish completed after the Phase 5 decision-center refactor. This remained UI-only and did not expand into other contractor pages or downstream record workspaces.

Files changed:
- `apps/web/components/dashboard/priority-strip.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `docs/chat-handoff.md`

Exact polish made:
- reviewed the Phase 5 dashboard diff for action placement, priority-strip usefulness, metric placement, queue grouping, and passive color noise
- removed the orange CTA from `PriorityStrip` so Universal Create remains the clear primary orange dashboard CTA
- changed `PriorityStrip` count pills from status-colored badges to neutral count markers, reducing duplicate status emphasis above the queues
- kept all PriorityStrip cards clickable to their existing queue/workspace destinations and preserved their action-label guidance as neutral text
- adjusted the priority strip grid to four neutral priority lanes on wide screens so it reads as a compact triage strip instead of a duplicate queue panel
- added a quiet `Work queues` heading before the queue grids so the dashboard clearly transitions from priority and metrics into follow-up lists

Behavior preserved:
- all dashboard data loaders, quick-create server actions, links, filters, search behavior, empty states, and queue destinations were preserved
- no backend, schema, auth, RLS, server action, data model, route, workflow behavior, estimates, invoices, jobs, contracts, portal, super-admin, or list-page behavior changed

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright dashboard QA passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
  - login completed through the existing setup project using root `.env.local` E2E credentials without printing credential values
  - `/dashboard` rendered the priority strip and key metrics
  - Universal Create remained visible
  - the dashboard Projects navigation path worked and landed on `/projects`
  - no browser console errors were captured during the passing dashboard QA run

Deferred:
- no mutation testing of quick-create actions
- no visual polish outside the dashboard
- no additional dashboard data prioritization rules beyond the existing loaded queues

## Decision-First UI Refactor Phase 6

Estimate Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the estimate detail page and preserved the existing editor, estimate calculations, catalog/system insertion, approval states, server actions, and workflow guards.

Files changed:
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- visible actions included Back to estimates, Back to edit, Generate contract for approved estimates, Open project workspace, the preferred next-action link, approved-estimate contract/SOV/snapshot recovery actions, Send estimate, Manage customer portal access, Open customer, Review linked lead, manual estimate status actions, connected project/contract/job/invoice links, schedule links, and communication links
- links included estimates list, estimate editor, project workspace, contracts, invoices, jobs, schedule, customers, leads, and related communications where records exist
- readiness and blocker messages included estimate status meaning, project readiness status, active project blockers, send prerequisites, missing customer email blocker copy, approval/contract-generation snapshot recovery guidance, schedule approval blockers, and customer timeline events
- related-record sections included readonly line items, scope/SOW, reusable terms/inclusions/exclusions, notes, workflow actions, customer timeline, connected workflow, production schedule/schedule handoff, and related conversations
- server actions/forms preserved on the page were `sendEstimateToCustomerAction`, `EstimateStatusActions`, `quickCreateContractFromEstimateAction`, `openOrCreateScheduleOfValuesAction`, and `rebuildApprovedEstimateSnapshotAction`
- conditional rendering preserved approved-only next steps, draft/rejected send actions, customer email prerequisites, manual decision actions, customer/lead blockers, schedule handoff copy, linked downstream records, and empty downstream workflow messaging

Exact UI behavior changed:
- replaced the older top summary band with the shared `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` directly under the estimate header
- made the ActionBar the dominant next-action surface and moved Back to edit/Open project workspace into neutral secondary actions
- added an Estimate -> Contract -> Job -> Invoice WorkflowBar derived from existing linked records and statuses only
- added an Estimate state summary for status, total/subtotal, tax/discount, line item count, and project readiness/blockers
- moved readonly line items ahead of customer/project/support context so the proposal body is the primary workspace
- removed the duplicate lower Pricing Snapshot panel because subtotal, discount, tax, and total are preserved in the state summary and document header
- switched connected workflow badges to the shared status badge helper for consistent neutral/status-only color usage

Behavior preserved:
- no backend, schema, auth, RLS, server action, data model, route architecture, estimate calculation, tax, discount, line item, catalog/system generation, approval, approved-snapshot, or workflow behavior changed
- estimate editor functionality and save behavior were not refactored
- no dashboard, invoice, job, contract, portal, super-admin, or list-page layout work was started

Validation:
- `pnpm typecheck` passed after correcting display-only status assumptions in the new WorkflowBar/state summary mapping
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright auth setup passed against `http://localhost:3007` using root `.env.local` E2E credentials without printing credential values
- authenticated browser QA passed on real estimate `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`
  - verified `Estimate workflow`, `Estimate state summary`, and `Line items` render on the detail page
  - verified navigation from estimate detail to `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
  - verified draft estimate line-item add through existing catalog quick-add, then remove/save returned the editor to `Saved`
  - no browser console errors were captured during the passing QA run
  - screenshot saved at `test-results/estimate-detail-phase-6.png`

Deferred:
- no test file was added in this phase because the existing protected QA flow covered the required real estimate detail and editor smoke checks without introducing a new framework or broad test surface
- no deeper estimate editor layout refactor; this phase kept edits to the estimate detail page
- no mutation testing of send/approval/contract-generation actions beyond visibility and navigation checks

## Phase 6 Estimate Detail Polish Review

Focused estimate-detail-only review and polish completed after the Phase 6 decision-first refactor. This remained UI-only and did not expand into the estimate edit layout, dashboard, invoices, jobs, contracts, portal, super-admin, or list pages.

Files changed:
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:
- reviewed the Phase 6 estimate detail diff for ActionBar placement, WorkflowBar state accuracy, summary duplication, totals/line-item hierarchy, and preserved links/actions
- changed draft estimate ActionBar guidance from approval-oriented copy to `Review and send estimate`, linking to the existing estimate editor instead of the manual decision anchor
- clarified sent estimate ActionBar copy as `Record customer decision`, keeping manual approval/rejection framed for offline/non-portal decisions only
- clarified rejected estimate ActionBar copy as `Revise or resend estimate`, linking to the existing editor
- tightened WorkflowBar downstream state display so Job only becomes current when linked jobs exist or the primary contract is signed, and Invoice only becomes current when linked invoices exist or completed linked jobs justify billing review
- kept downstream WorkflowBar descriptions conservative: unsigned or missing contract now reads as after signed contract/readiness rather than implying scheduling is already ready
- removed the duplicate Status card from `ProjectStateSummary`; status remains visible in the ActionBar, while the summary now focuses on total, tax/discount, line items, and project readiness

Behavior preserved:
- existing estimate detail data loading, send actions, manual decision actions, linked record links, project navigation, approved-estimate next-step panel, readiness messages, line item display, forms, guards, editor handoff, and catalog/system workflow behavior were preserved
- no backend, schema, auth, RLS, server action, data model, route, estimate calculation, tax, discount, approval, catalog, system, or workflow behavior changed

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- `pnpm e2e:auth` passed against `http://localhost:3007` using the root `.env.local` E2E credentials and `playwright/.auth/local-user.json`
- authenticated Playwright QA passed on draft estimate `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`
  - verified ActionBar, WorkflowBar, ProjectStateSummary, totals, and line items render
  - verified draft WorkflowBar keeps Contract after approval, Job after signed contract/readiness, and Invoice after production/billing trigger
  - verified navigation from estimate detail to the linked project still works
  - verified draft editor quick-add from catalog, remove, and save flow still works
- authenticated Playwright QA passed on approved estimate `/estimates/72acf60d-4486-4774-a3dd-2f86f0b1f912`
  - verified approved ActionBar renders one of the existing downstream next actions
  - verified the approved estimate edit surface still shows approved/next-step context
  - no browser console errors were captured during the passing QA run

Deferred:
- no new permanent Playwright spec was added during this polish pass because the existing protected auth setup plus targeted one-off browser QA covered the required draft and approved estimate checks
- no estimate editor visual refactor was attempted
- no mutation testing of send, approval, rejection, contract generation, SOV, or deposit actions beyond existing visibility/navigation checks

## Decision-First UI Refactor Phase 7

Invoice Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the invoice detail page and preserved the existing invoice editor, calculations, line items, tax, retainage, balances, payment recording form/action wiring, statuses, server actions, and workflow guards.

Files changed:
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- visible actions included Back to invoices, Record payment, Open progress billing workspace for AIA progress invoices, Open project readiness hub, continuity links to progress billing or project workspace, the payment recording form, the invoice edit/progress-source panel, linked schedule/job actions, connected-record links, and related-conversation actions
- links included invoices list, project readiness hub, progress billing workspace, customer, estimate, job, schedule, change orders, and related communications where records exist
- readiness and blocker messages included resolved route error/message banners, online payment readiness copy, customer payment/progress copy, recent payment signal copy, void-invoice payment blocking copy, progress billing missing-workspace copy, project readiness metadata, and schedule/job/crew context notices
- related-record sections included invoice review/continuity, line items, billing notes, latest payment activity, totals and billing math, billing configuration, payment recording, edit/progress source, production schedule, connected records, invoice metadata, and related conversations
- server actions/forms preserved on the page were `recordInvoicePaymentAction` through `InvoicePaymentForm` and `updateInvoiceAction` through `InvoiceForm`
- conditional rendering preserved void/draft/sent/partially-paid/paid next-action handling, payment-event messaging, payment recording visibility for non-void invoices, progress-billing workspace handoff, linked job versus project schedule context, connected records, and paid/partially-paid status derivation inside the existing invoice form

Exact UI behavior changed:
- replaced the older top identity/summary band with shared `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` directly below the invoice header
- made the ActionBar the dominant billing next-action surface; sent/partially-paid/open invoices still point at existing payment recording, paid invoices point back to the project hub, void invoices stay review-only, and draft invoices now point to the existing invoice-editing section instead of implying payment collection
- added an Estimate -> Contract -> Job -> Invoice -> Payment WorkflowBar derived only from existing linked records, project readiness snapshot, invoice status, payments, and balance state
- added an Invoice state summary for total, paid, balance due, and retainage held when present, making balance due unmistakable near the top
- moved line items ahead of continuity/support context so billing scope is the primary workspace
- reduced duplicate status/totals emphasis by removing the former invoice identity/current billing state block
- neutralized passive progress-billing and lineage styling so orange remains reserved for the primary CTA
- kept payment activity visible below line items and billing notes as secondary review context

Behavior preserved:
- no backend, schema, auth, RLS, server action, data model, route architecture, invoice calculation, tax, retainage, balance, payment recording, line item, status, readiness, or workflow behavior changed
- no dashboard, estimate, job, contract, portal, super-admin, or list-page layout work was started

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed after removing dead display helpers made obsolete by the top-stack replacement
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- `pnpm e2e:auth` passed against `http://localhost:3000` using the root `.env.local` E2E credentials and `playwright/.auth/local-user.json`
- authenticated browser QA logged in through the app login page and checked `/invoices`, but the authenticated E2E account currently has zero invoice records: Draft 0, Sent 0, Open balance 0, Paid 0, Void 0
- authenticated browser QA also checked real project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`; no invoice detail links were present on that project
- no browser console errors were captured while checking the authenticated invoice manager/create surface

Deferred:
- no permanent Playwright spec was added during initial implementation because fixture coverage was added later through real authenticated QA invoices

## Phase 7 Invoice Detail Fixture Polish

Focused invoice-detail-only review and polish completed against the new real QA fixtures:
- unpaid: `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`
- partial: `/invoices/c9131b30-dea7-45a5-b476-8ba2bf3fc502`
- paid: `/invoices/894d1e3a-c3f2-4572-869b-545f00aef027`

Files changed:
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:
- verified the ActionBar remains truthful for sent/unpaid, partially paid, and paid invoice states
- preserved the `Record payment` primary CTA and existing payment form for unpaid and partially paid invoices
- removed misleading payment-recording prompts from settled/paid invoices by replacing the form area with a secondary `Payment Activity` review state
- changed the paid/settled payment readiness label to `Payment settled`
- kept the WorkflowBar conservative by marking Payment complete only when `invoice.status` is `paid`
- renamed the lower support totals panel from `Totals and billing math` to `Detailed billing math` so the top balance summary remains the primary financial focus
- preserved line items as the primary billing workspace and payment activity as secondary review context

Behavior preserved:
- no backend, schema, auth, RLS, server action, data model, route, invoice calculation, tax, retainage, balance, status, line item, payment recording, or workflow behavior changed
- no dashboard, estimates, jobs, contracts, portal, super-admin, list pages, invoice editor, or payment-provider behavior changed

QA results:
- unpaid fixture showed sent invoice state, ActionBar `Record the next payment`, visible `Record payment` link and form, balance due `$594.59`, Payment step `No payment recorded`, and no console errors
- partial fixture showed partially paid invoice state, ActionBar `Collect the remaining deposit balance`, visible `Record payment` link and form, balance due `$394.59`, Payment step `1 recorded payment`, and no console errors
- paid fixture showed paid invoice state, ActionBar `Billing review is current`, no `Record payment` link or form, balance due `$0.00`, settled payment activity copy, Payment step `1 recorded payment`, and no console errors

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred:
- no broader invoice list/editor, dashboard, estimate, job, contract, portal, or super-admin cleanup was attempted
- no permanent Playwright spec was added in this polish pass; coverage remained targeted authenticated browser QA on the three real invoice fixtures

## Snapshot

FloorConnector is a production-first specialty-contractor operating system built on one shared canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Latest Contract Generation Fix

- `/contracts?compose=1` now opens the contract Quick-Create composer consistently, preserves `estimateId` selection context, and displays decoded `error` query blockers inside the composer.
- The missing approved-snapshot blocker now points users back to the estimate recovery path: rebuild the approval snapshot from the approved estimate, then generate the contract again.
- Contract-generation guardrails were not weakened: generation still reads only approved estimate snapshots and still refuses approved estimates with missing snapshot lineage.
- Approval normally creates the required immutable snapshot through the database trigger `snapshot_estimate_on_approval`, which calls `create_estimate_commercial_snapshot` when an estimate status becomes `approved`.
- If an already-approved estimate is missing its approved snapshot, treat it as old/bad data or an environment that missed the snapshot migration. The Estimate Workspace and Estimate Editor now show a warning and expose `Rebuild Approval Snapshot`, which calls the canonical `create_estimate_commercial_snapshot` path only for an approved estimate with no existing snapshot.
- Data-repair note: old approved estimates may need this rebuild action before contract generation. Do not patch a fake snapshot, do not toggle status manually, and do not generate contracts from mutable/current estimate data.
- Backend mismatch fixed after QA: the affected estimate `d5f508a6-61f6-459c-8982-88ef45714472` did have `estimate_commercial_snapshots` row `714f5d9c-407d-45ed-adfc-62e9e4553138` with two `estimate_commercial_snapshot_items`; contract generation was misclassifying it as missing because Supabase returned numeric snapshot fields as JavaScript numbers while the contract snapshot guards only accepted strings.
- Contract generation now accepts string or number numeric values from `estimate_commercial_snapshots` and `estimate_commercial_snapshot_items`, then normalizes them to strings for contract rendering. The rebuild action also verifies the same contract-generation snapshot header and item query before reporting success.
- Follow-up response-shape mismatch fixed after the snapshot guard passed: contract creation inserts and requests `{ id }`, then reloads the full contract record before redirecting. The reload query omitted top-level `contracts.reference_number` even though `isContractRow` requires it, so the helper returned `null` and surfaced `Unexpected contract response after generation`. Contract reloads now use the canonical `contractSelect`, including `reference_number`.
- `workflow_error_events` is now the lightweight tenant-scoped workflow failure log. Contract generation failures are recorded with action `contract.generate_from_estimate`, subject `estimate`, safe metadata, and user context when available. Organization owners/admins can review recent events from `/settings/admin`.
- Approved snapshot rebuild failures are recorded as `estimate.rebuild_approval_snapshot` with safe estimate context only when the recovery action fails.
- Validation run for this fix: `pnpm typecheck` and `pnpm lint` passed. Playwright spec discovery passed with `PLAYWRIGHT_SKIP_WEB_SERVER=1`; a headless `/contracts?compose=1&estimateId=<id>&error=<encoded message>` check reached the local app but redirected to `/login` because no saved contractor auth state or E2E credentials were available in this session.

Current stage:
- Phase B first-pass foundations are now implemented for onboarding readiness polish, reporting basics, Sales Tax Summary, and manual notification-only automation
- Inventory / Cost Item Database Phase 1 audit is recorded in [docs/inventory-cost-item-database-plan.md](C:/FloorConnector/docs/inventory-cost-item-database-plan.md). The safe implementation decision is to keep `catalog_items` as the canonical reusable cost item database, with optional stock tracking through linked `inventory_items` and audited `inventory_transactions`; no new `contractor_cost_items` table was added.
- Catalog item hardening follow-up is documented in [docs/catalog-items-hardening-test-plan.md](C:/FloorConnector/docs/catalog-items-hardening-test-plan.md), and a read-only duplicate-name report lives at [scripts/catalog-items-duplicate-normalized-name-report.sql](C:/FloorConnector/scripts/catalog-items-duplicate-normalized-name-report.sql). No automated test harness exists yet, so no new framework was introduced.
- Cost Items Database UI was safely tightened on the existing catalog item grid: rows now surface type/category, unit, default cost, default price behavior, taxable state, active/archived state, and the default item marker; duplicate name/SKU save errors now return clearer organization-scoped guidance.
- Documentation is now aligned that `catalog_items` is the canonical cost item database and Phase 1 inventory/cost item foundation; deeper estimate/invoice integration is intentionally deferred to future workflow work and should preserve snapshot lineage.
- Catalog-to-estimate/invoice integration is now designed in [docs/catalog-to-estimate-invoice-integration-spec.md](C:/FloorConnector/docs/catalog-to-estimate-invoice-integration-spec.md). It is planning plus current-status alignment: catalog items provide reusable defaults, estimate and invoice line items must snapshot selected values, custom one-off lines remain valid, invoice billing should continue to prefer approved estimate/SOV/change-order lineage, and direct catalog use in invoices is limited to explicit invoice-only manual catalog-backed adjustments.
- Estimate Editor includes a `Catalog Items` panel on the Items workspace. It lists organization-scoped `catalog_items`, supports name search plus type/category filters, shows unit, default price, taxable state, and active/archived status, and previews selected items before insertion.
- Estimate Catalog Selection Phase 2B is now implemented from the Estimate Editoror Catalog Items panel. Active non-system catalog items can be previewed and added to estimates through the existing `insertCatalogItemToEstimateAction` path, creating server-owned estimate line-item snapshots. Archived items remain visible for review but are disabled in the panel and rejected server-side; systems still use the existing system expansion flow. No migrations, invoice behavior, or estimate calculation formulas were changed.
- Phase 2B estimate catalog insertion QA checklist now lives at [docs/qa-estimate-catalog-item-insertion.md](C:/FloorConnector/docs/qa-estimate-catalog-item-insertion.md). It covers active insertion, archived blocking, system-flow preservation, snapshot fields, quantity default, editability, catalog-change immutability, custom one-off items, totals, and `pnpm typecheck` / `pnpm lint`.
- Documentation alignment after catalog-to-estimate work is complete across current-state, developer source of truth, roadmap, workflows, and supporting catalog docs. Current truth: `catalog_items` remains canonical, estimate catalog insertion is implemented for active non-system items with server-owned snapshots, the manual QA checklist exists, and invoice catalog usage is intentionally limited to explicit invoice-only manual catalog-backed adjustments rather than free catalog insertion as normal invoice scope.
- current recommendation is to pause feature expansion and run internal validation before contractor beta; use [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- contractor UI system is stabilized and normalized
- contractor app and portal both run on shared canonical records
- the product now has its implemented financial engine and notification foundation in place
- remaining Phase B gaps are support/release checklist, onboarding runbook, beta candidate criteria, bug triage process, and recorded validation results
- `/people` is still the implemented workforce-oriented route today, while `/directory` now provides the first read-only contractor-facing account/contact workspace over canonical records
- customer, person, vendor, and lead detail pages now include compact Directory-context handoff cards so users can jump back to the read-only index while those canonical record pages remain the editing/workflow homes
- customer detail now also includes a compact related-contacts management section over canonical `contacts` and `customer_contacts`, with contractor-admin add/edit/main-contact controls while canonical `customers.email` still drives estimate/contract/invoice recipient continuity
- `/directory` now also shows related customer contacts as read-only `Customer Contact` rows that point back to the parent customer detail workspace for management
- customer detail now also supports contact-linked portal grants on canonical `portal_access_grants.customer_contact_id`, while null-contact grants still remain valid customer-level access; Directory remains read-only
- customer detail now also stores and edits linked-contact portal permissions on canonical `customer_contact_portal_permissions`
- customer detail now clearly labels customer-level versus linked-contact portal grants and guides admins to attach legacy customer-level grants to existing related contacts when they are ready
- linked-contact grants now enforce stored permissions for portal estimate approve/reject, change-order approve/reject, and contract sign/decline actions
- contractor-side customer signer options now filter out linked-contact portal users when `canSignContracts` is off
- contractor-side onsite contract signing is implemented and verified on the same canonical contract/signature system as portal signing; QA passed contractor UI send, signer routing, onsite canvas signature, canonical `signer_signed` event, signed contract status, and project readiness sync
- verified onsite signing QA record: contract `c6e12b54-985d-4d2c-9618-5e54657e06f9`, estimate `f11c2eae-338d-4b08-8781-fcdb81b918be`, customer signer `7e3cf4ef-cf79-4801-b775-6eaa1b588abe`, project `cbb32597-59c6-424b-9c3c-77f2b40ba0d0`, organization `29230b6a-a870-4b85-8b7d-4bfed4c8dfad`; validation passed with `pnpm typecheck`, `pnpm lint`, and `git diff --check` reporting CRLF warnings only
- deposit follow-through after signature is conditional on organization workflow settings: required deposits use the existing canonical deposit invoice/payment chain, and no deposit invoice is created when deposit readiness is not required
- null-contact customer-level grants still keep legacy behavior, and contract view/countersign, invoice/payment, estimate send, and broader portal view behavior are unchanged
- seed-free internal QA workflow checklist now lives at [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md) for repeatable Phase A manual testing
- local browser QA auth/session setup now lives at [docs/local-qa-auth-session-note.md](C:/FloorConnector/docs/local-qa-auth-session-note.md); use it when protected routes redirect to `/login` from an expired local Supabase session
- estimate send, portal approval, and contract-generation QA prerequisites now live at [docs/qa-estimate-send-approval-contract-prerequisites.md](C:/FloorConnector/docs/qa-estimate-send-approval-contract-prerequisites.md); use it to prepare customer email, portal project access, portal approval, and approved snapshot lineage without bypassing canonical guards
- contractor-initiated portal invites are now implemented on top of canonical `portal_access_grants` and `portal_project_access`: customer detail can create a pending project-scoped invite for a customer/contact email, show a one-time local invite URL, and `/portal/invite?token=...` validates the hashed token before existing login/signup activates the grant for a matching authenticated email
- Phase B validation created a fresh lead -> customer -> project -> draft estimate chain and dedicated customer contacts for portal QA. The previous blocker that portal grants required an already-authenticated portal user is addressed by the contractor-initiated invite/account-bootstrap flow.
- Follow-up portal QA confirmed `jfilamonte@gmail.com` is the contractor owner/admin identity and `filamontej@gmail.com` is the clean customer portal identity. `filamontej@gmail.com` was added as a related contact through the customer UI. The customer-page render blocker was fixed by removing the ambiguous stored-permission relationship embed, and the contractor UI now creates a pending linked-contact portal grant for `filamontej@gmail.com`, creates active project access for the Phase B project, and displays the one-time local invite URL after creation. Do not store raw invite tokens in docs. Resume with clean-session invite acceptance as `filamontej@gmail.com`, portal isolation, estimate send, portal approval, approved snapshot verification, and contract generation.
- internal QA integrity pass tightened context preservation: `/jobs?projectId=...` now actually filters canonical jobs, project completed-job invoice actions carry the `jobId` into invoice Quick-Create, `/invoices` preserves project/estimate/job/deposit context through filters, and Directory copy now reflects implemented linked-contact portal permissions
- Phase A completion report and Phase B readiness checklist now live at [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)
- contractor onboarding readiness polish is now live: dashboard shows a lightweight `Start here` guide for settings, first customer, first project, and first estimate; leads/customers/projects/estimates empty states include direct Quick-Create actions; no schema, model, or lifecycle logic changed
- Phase B progress checkpoint now lives at [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md), and recommends internal validation before more feature breadth
- Phase B internal validation runbook now lives at [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md), with ordered passes for core workflow, portal permissions, reports, Sales Tax Summary, automation runner, communications, and onboarding/empty states

## New Systems Summary

Added systems:

- Incident + OSHA System

- HR System

- Task System

- Progress Billing

- Marketing + Lead Ingestion

- Purchasing + Inventory

- Subcontractor System

- PTO / Workforce Management

- Service Layer

- Mobile-First Requirements

## Architectural Risks

- Duplicate models: Ensure no separate employee or subcontractor entities.

- Silo systems: All extend canonical entities.

- Data ownership: Service layer read-only.

## Built Now

Implemented on the current branch:
- auth, tenant bootstrap, organization-aware access control
- leads, customers, projects, estimates
- first read-only `/directory` workspace over canonical customers, related customer contacts, workforce people, vendors, and leads, with each row routing back into the existing canonical detail page
- canonical `customers` remain the customer/account source of truth for estimate send, invoice recipient, contract customer context, payment/billing context, and project ownership; a future `Directory` view must not replace that with a generic contact model
- customer detail now surfaces canonical related customer contacts beneath the customer account, with contractor-admin add/edit/main-contact management on top of `contacts` and `customer_contacts`
- customer estimate send, portal review, approval, rejection, and estimate email tracking
- approved estimate commercial snapshots as the downstream commercial baseline
- canonical contracts with signer routing, portal signature actions, and contractor-side onsite signature capture
- canonical change orders with contractor + portal workflow, immutable approved snapshots, and SOV or invoice integration
- server-side Project Readiness Gate is implemented
- jobs, scheduling, and execution workflows are blocked until readiness conditions are met
- canonical jobs with first-pass scheduling fields and crew assignment foundation
- canonical appointments for site visits, estimate meetings, follow-up visits, and internal coordination on the same lead/customer/project chain
- invoices, payments, immutable payment events, and portal payment initiation
- snapshot-based invoice lineage across approved estimate snapshots, SOV rows, approved change-order snapshots, and invoice-only adjustments
- real contractor-side progress billing / schedule-of-values workflow on the canonical approved-estimate snapshot and invoice chain
- first read-only `/reports` surface for internal beta reporting basics:
  - lead pipeline, estimate status, invoice summary/aging, recent payment activity, and project readiness blockers
  - server-side tenant-scoped summaries over canonical `opportunities`, `estimates`, `invoices`, `payments`, and `projects`
  - Sales Tax Summary over canonical `invoice_tax_reporting_entries` / invoice tax snapshots, using invoice issue-date filtering, taxable sales, exempt sales, tax collected, invoice/payment status context, and customer exemption snapshot visibility
  - no reporting tables, exports, BI layer, mutations, tax filing, or tax-provider integration
- notification events, notifications, notification deliveries, and canonical communication threads/messages
- first shared universal-create launcher in the contractor shell and dashboard, routed through canonical Quick-Create flows
- first-login dashboard setup guidance and first-record empty-state actions for the lead -> customer -> project -> estimate startup path
- first real contractor-side global search in the protected header, grouped across canonical records and routing into the existing workspaces
- first real contractor-side notifications layer in the shared shell and dashboard, backed by stored canonical notification records and routing into real downstream workspaces
- seed-free internal QA workflow checklist for opportunity -> payment testing, linked-contact permission checks, communications checks, schedule filter checks, and canonical lineage regression watchlist
- first contractor-side communications surface at `/communications`, reading canonical threads/messages and stored unread notifications with a small safe reply composer plus safe read-triage on canonical per-user communication notifications
- `/communications` now also supports URL-driven filtering for status groups and supported source record types, plus text search over the loaded canonical thread labels and preview text
  - status and source filters now shape the server-side communications loader where safe, while text search remains the safe client-side fallback so URL behavior stays unchanged
  - supported source filters are currently customer, project, estimate, contract, invoice, change order, and payment only; unsupported queries such as `source=job` now show a small help state so job communications are not implied
  - selected threads now show a clearer chronological canonical message history with actor labels, timestamps, compact source context, and a stronger empty state
  - direct thread links now show unavailable-thread guidance when the requested thread is not visible in the current queue instead of silently falling back to another thread
  - reply and notification triage forms now handle the all-sources view safely and clarify that replies do not send email/SMS or trigger automation
- project and customer detail pages now include compact communication-context handoff cards that summarize canonical related threads and deep-link back into `/communications`
- project detail now also includes a compact production-schedule handoff card derived from canonical jobs and job assignments, surfacing schedule counts and next scheduled continuity while leaving scheduling actions in `/schedule`
- project detail next-action guidance now reads more like the operating hub: it uses existing estimate, contract, change-order, job, invoice/payment, and readiness state to surface the next supported action plus clearer blocker copy
- customer detail now also includes a compact production-schedule handoff card derived from canonical customer projects, jobs, and job assignments, surfacing customer-level schedule counts, next scheduled continuity, and project-aware handoff back into `/schedule`
- estimate detail now also includes a compact schedule-handoff card that stays blocked for draft/sent/rejected estimates and, once approved, derives project-level production counts, next scheduled continuity, and crew-state visibility only from canonical estimate `projectId`, project jobs, and job_assignments
- contract detail now also includes a compact schedule-handoff card derived only from canonical contract `projectId` plus canonical jobs and job_assignments, surfacing project-level production counts, next scheduled continuity, and crew-state visibility without introducing a contract/schedule bridge model
- invoice detail now also includes a compact linked-schedule handoff card derived only from canonical invoice `projectId` / optional `jobId` links plus canonical jobs and job assignments, so billed work can be read against current production state without introducing a billing-schedule bridge model
- phase-one lead-to-invoice CTA normalization is now live on dashboard, leads, estimate detail, and project detail; prefer the canonical labels `Start estimate`, `Send estimate`, `Approve estimate`, `Generate contract`, `Open progress billing`, and `Create invoice` in follow-up passes
- contractor-side Estimate Review now intentionally supports manual/offline customer decisions from draft or sent estimates through the shared estimate status-transition action: `Record customer approval` and `Record rejection` are for paper signature, verbal approval, fake email during testing, non-portal customers, and workflow testing before send-mail and portal delivery are complete; this is not a duplicate approval model
- phase-two estimate-builder UI polish is now live on Estimate Editoror: the existing item-entry area is grouped into one clearer estimating-tools cluster, catalog insertion is more visible, manual item wording now clearly means catalog-backed estimate items, and import-from-another-estimate now supports real line-item import for same-organization source estimates into draft destination estimates only
- reusable estimate-content UI polish is now live across Estimate Editoror/detail and the existing defaults/block surfaces: scope / SOW, project details, terms, inclusions, and exclusions now read more clearly as reusable estimating content, defaults are framed as empty-state starting content only, and project-detail/content import is still called out honestly as later work
- reusable-content insertion is now unified inside Estimate Editoror with one shared inserter for Scope / SOW, Terms, Inclusion, and Exclusion blocks; it still uses the current content-block system, still appends into the active estimate, and still does not implement estimate-import or project-details import
- reusable-content import from another estimate is now also live for draft destination estimates only; Scope / SOW, Terms, Inclusions, and Exclusions append into the active estimate from same-organization source estimates only, while project-details/context import still remains out of scope
- estimate import UX now uses one shared source-estimate chooser in the estimating tools area; users pick a source once and then choose line-item or reusable-content import actions from the same compact panel, while all import guardrails and append-only behavior stay unchanged
- `/settings/workflows` now explains estimate defaults more clearly: Scope / SOW, Terms, Inclusions, and Exclusions are starting defaults for empty estimates only, reusable blocks still append on demand, estimate import still copies from a selected prior estimate, and contractor settings are framed as organization-owned defaults even when they began from platform starter defaults
- `/schedule` now also accepts an optional `projectId` query for project-detail handoff, filtering the same canonical jobs list by `jobs.project_id` while keeping existing `q`, crew, view, and action behavior intact
- `/schedule` now also shows a compact active-filter banner for project, search, crew, and selected job/action handoff state, with clear links that drop only that filter while preserving the rest of the current query context
- `/jobs` now also accepts and applies an optional `projectId` query, preserving project-scoped job handoff across status filters, search, and Quick-Create
- `/invoices` now preserves project, estimate, job, and deposit workflow query context across invoice filters/search so invoice creation from project or completed-job context stays tied to the same canonical source
- contract, invoice, change-order, and estimate detail pages now include the same compact communication-context handoff cards over canonical thread summaries
- first contractor-side automation readiness surface at `/settings/automation`, documenting automation concepts against real canonical settings, notifications, communications, scheduling, contracts, estimates, change orders, and payment foundations with readiness summary, missing dependencies, safe-next-build guidance, and recent canonical samples
- `/settings/automation` now saves notification-only automation preferences on the existing organization workflow settings row and includes a manual tenant-scoped runner:
  - supported triggers are customer message received, estimate awaiting approval, contract awaiting signature, and invoice overdue
  - eligible runs create canonical `notification_events` and per-user in-app `notifications`
  - `automation_runs` stores the audit/idempotency ledger for executed, blocked, skipped, and failed outcomes
  - no email/SMS/provider send, customer-facing message, queue/cron, or workflow mutation is performed
- `/settings/automation` now also shows a read-only eligibility preview/debug view so saved preferences can be compared against sample canonical event or record context
- `/settings/automation` now also shows static preview-only notification copy templates for supported future automation categories
  - intended recipients, trigger source, sample subject/body copy, and required canonical context fields are visible for planning
  - templates are not editable, not saved separately, and do not send anything
- `/settings/automation` now also shows a compact read-only automation build plan per category
  - each plan combines saved future preferences, one eligibility sample, and the static preview template definition
  - the plan does not save planner output or mutate canonical workflow records
- contractor dashboard now works as a denser command-center surface with operational metrics, modular queues, dashboard-local Quick-Create, and shortcuts back into shared Manager Pages
- Phase B validation found and fixed CF-parity blockers on dashboard and estimates:
  - contractor dashboard now promotes canonical open estimates, unpaid/overdue invoices, upcoming appointments, leads, active projects, and today/live jobs higher in the board
  - Estimates Manager Page (`/estimates`) now reads more like a CF-style estimating module landing page with recent client responses, pending approval, status breakdown, draft/approved/revision queues, and a denser estimate register
  - Add Estimate now starts from customer/account, then existing-or-new project, then estimate basics, with optional linked opportunity as upstream context only
  - project-launched estimate creation now derives the customer/project context before submit, linked lead/project handoffs preserve existing opportunity context, and create validation errors render inside the Add Estimate sheet instead of on the background page
  - direct `/estimates` creation with an existing customer project now reuses an opportunity already linked to that project when present, instead of creating duplicate upstream opportunity context
  - seed-free estimate QA fixed customer-detail blockers from older schema caches around related contacts/contact permissions and now shows connected estimates on the Customer Workspace
- contractor shell/header now carry breadcrumb and page-context continuity inside the unified top header instead of a separate blue-style page band
- shared contractor shell, Manager Page wrappers, Quick-Create surfaces, and common overview cards now broadly follow the newer black/gray/orange/white contractor theme instead of the older blue-heavy manager styling
- first real contractor-side module dashboards for payments and schedule on top of the shared Manager Page system
- the schedule manager now includes review-first summary metrics, next actions, crew-state continuity, and a real week/day/board calendar-planner layer on the same canonical jobs
- the board layout now groups the filtered canonical job set into operational timing lanes: unscheduled ready work, today, tomorrow, next 7 days, later scheduled, and in progress
- the `/schedule` action panel can now review and unassign crew directly on canonical `job_assignments`, and it blocks crew attachment until the job has a real schedule commitment
- first real contractor-side punchlist system on the shared project/job execution chain
- people, vendors, compliance, time tracking, daily logs, field notes, execution attachments
- contractor settings and super-admin foundations
- Cost Items Database Phase 1 foundation is present on the current branch:
  - `catalog_items` is the organization-scoped reusable cost item master for materials, labor, equipment, subcontractors, other items, and systems
  - no duplicate cost item table should be created; future workflows should extend or snapshot canonical `catalog_items`
  - `inventory_items` is optional stock tracking linked to catalog items where needed
  - `inventory_transactions` records auditable quantity movements
  - `/cost-items-database`, `/cost-items-database/items`, `/cost-items-database/inventory`, `/cost-items-database/systems`, and `/settings/catalogs` are the implemented contractor/admin surfaces
  - estimate and invoice calculations were intentionally left unchanged; line items continue to snapshot selected item data and historical estimates/invoices must not mutate when catalog items change
  - duplicate normalized catalog item name hardening is currently covered by server-helper checks plus a documented test plan and read-only duplicate report script, not automated tests
  - the existing item grid is the safe admin surface for catalog management; it now includes clearer reusable-cost-item empty-state copy without wiring the database into new estimate or invoice behavior

Current Directory-direction reminder:
- a future `Directory` workspace should unify contractor-facing account and contact browsing over canonical records
- customer entries in that future Directory remain full canonical customer/account records
- additional customer contacts remain related contacts beneath the canonical customer/account
- workforce people remain operational `people` records
- vendors remain vendor/company records, with vendor contacts as later related-contact work
- super admin remains platform-only and outside contractor Directory

## Stable Baseline

Treat these as current implementation guardrails:
- top-nav-first contractor shell
- shared Manager Page pattern
- shared Record Workspace pattern for detail pages; do not invent new page structures
- reuse existing context-card patterns and make every workflow page answer "What do I do next?"
- dashboard/header visual direction is now the styling reference point for the broader contractor app
- black/gray/orange/white contractor theme across shared shell and Manager Page surfaces; orange is the default primary action/active accent, blue is not a default contractor-app accent, and green/emerald is reserved for semantic statuses
- global search now lives at the shell level instead of as a dashboard placeholder
- punchlists are now real canonical execution records, not a dashboard placeholder
- appointments are now real canonical coordination records, not a dashboard placeholder
- progress billing / SOV is now real contractor-side billing workflow, not a dashboard placeholder
- Quick-Create -> canonical record -> full workspace
- project detail as the main readiness and continuity hub
- contractor and portal as two surfaces on the same system

## Product Direction

FloorConnector is not a collection of module apps.

Direction now locked in:
- one shared lifecycle system
- continuity over module silos
- dashboards are entry surfaces, not separate product worlds
- Quick-Create should be available broadly, but must always create canonical records

## Not Built Yet

Still intentionally not implemented:
- full dispatch-grade scheduling system
- deeper dispatch automation
- a fully finished page-by-page contractor reskin on every lower-traffic surface
- deeper AIA/pay-app export and reporting workflows beyond the current canonical progress-billing surface
- broader contractor-side send/reply UX on top of the canonical thread/message foundation
- broader contractor-side communications workflow depth beyond the first safe reply composer on `/communications`
- broader automation workflows beyond the first manual notification-only runner
- broader reporting / analytics beyond the first read-only `/reports` basics surface
- broad redesign work

## Next Build Phase

Primary focus for the next phase:
- run and record seed-free Phase B validation from [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- reporting and Sales Tax Summary accuracy checks
- manual automation duplicate-guard and recipient validation
- internal beta support/release checklist
- contractor onboarding runbook and beta candidate criteria

Goal:
- prove the current foundation before contractor beta, then fix only validation-blocking defects before adding more breadth

## Estimate Editoror Group-First Planning

Long-term Estimate Editoror workflow planning now lives at [docs/estimate-editor-group-first-refactor-plan.md](C:/FloorConnector/docs/estimate-editor-group-first-refactor-plan.md). This is planning only: no code, schema, invoice behavior, or estimate calculations changed. Current findings: the editor already has workspace `itemGroups`, line-level `group_name`, grouped customer-facing output, catalog insertion, system expansion, and previous-estimate import; however, catalog/system/import insertion does not yet target a selected group directly. Recommended direction is to make groups the primary authoring surface, move the permanent Catalog Items panel into a group-scoped Add Item drawer, and phase work through UI-only regrouping, group-level catalog add, group-level system/template add, previous-estimate reuse, and a later larger design/v0 pass.

## v0 UI Cleanup Brief

The next header/project/estimate UI cleanup brief now lives at [docs/v0-ui-cleanup-brief-header-project-estimate.md](C:/FloorConnector/docs/v0-ui-cleanup-brief-header-project-estimate.md). This is design/documentation only: no code, schema, estimate calculation, invoice behavior, catalog insertion behavior, or workflow changes. The brief covers responsive top-nav overflow while preserving the top-nav-first shell, searchable project Quick-Create customer selection, project detail contextual workspace navigation with financing status in readiness/financial context, context-aware estimate creation, long-term group-first Estimate Editoror direction, input formatting guidance, a ready-to-use v0 prompt, non-goals, and follow-up Codex implementation phases after design approval.

## Header Rollback Note

The attempted Phase 1 header/navigation implementation was rolled back because the result was not acceptable. The rollback removed the new inline primary-tabs/overflow behavior in `apps/web/components/protected-app-top-nav.tsx` and removed the added `Customers` item from `apps/web/lib/navigation/navigation-config.ts`, restoring the prior header menu behavior as closely as possible.

The rollback intentionally preserved the non-header Phase 1 improvements: project detail sectioning and readiness/financial placement, project Quick-Create searchable customer picker and validation-preservation, estimate Quick-Create context cleanup and create-new handoff, country combobox, phone helper copy, and `ZIP / postal code` labels. No schema, workflow, estimate calculation, invoice logic, or catalog behavior changed.

## v0 Visual Redesign Implementation Pass

The protected contractor app has a visual-only CF-inspired v0 pass implemented across the shared app shell, shared Manager Page primitives, leads/opportunities, estimates, invoices, Quick-Create sheets, and shared record/workspace chrome. The pass keeps the top-nav-first architecture, uses the grouped header menu instead of a permanent global sidebar, widens the working canvas, and moves the active visual language toward black/dark-gray framing, orange primary actions, white work surfaces, warm-neutral borders, flatter panels, denser registers, and calmer table/list styling.

Behavior intentionally unchanged: routes, data loading, auth, permissions, create/update actions, opportunity/customer/project/estimate/invoice workflow rules, estimate calculations, invoice calculations, catalog insertion logic, schemas, migrations, and persistence. Existing Quick-Create flows still create canonical records first and hand off into full workspaces.

Non-visual follow-up items discovered: several lower-traffic Manager Pages still contain older blue-accent utility styling and should be visually normalized in a separate scoped pass; no new behavior should be added to close that gap.

## Visual Bugfix Review Follow-Ups

Latest v0/CF-inspired visual review pass stayed visual/UI-only. No schema, migration, auth, workflow, estimate calculation, invoice calculation, or catalog insertion behavior was changed.

Directory visual audit completed:
- `/directory` render path was traced to `apps/web/app/(app)/directory/page.tsx`, `apps/web/components/contractor-workspace-page.tsx`, `apps/web/components/workspace-command-bar.tsx`, and the empty-state fallback in `apps/web/components/app-empty-state.tsx`.
- `/directory` now opts into the shared workspace header's dark FloorConnector/CF-inspired header tone, keeps the page read-only, and uses existing customer, related-contact, workforce, vendor, and opportunity data only.
- Confirmed stale accent cleanup in the active Directory render path: `AppEmptyState` no longer uses the older `brand-*` empty-state accent when Directory filters return no records.
- Directory search, filters, summary panels, helper panels, status badges, and register rows were visually tightened with warm neutral, black/gray, and orange accents. No routes, actions, permissions, data loading, workflows, or canonical models changed.

Confirmed non-visual follow-up:
- Invoice creation can still be blocked by the existing commercial-readiness guard when the project does not have the required signed-contract and deposit/financing readiness state. This is expected business behavior, not a visual regression. Next validation should use a project that has completed the signed-contract/readiness prerequisites, then verify deposit, completed-job, approved-estimate, and approved-change-order invoice creation paths end to end.

Confirmed behavior issue addressed in this pass:
- Change-order invoice Quick-Create context could be lost when entering `/invoices` with only `changeOrderId` or while moving through invoice manager filters. The UI now resolves the change order's project context and preserves `changeOrderId` across the invoice create sheet and manager links.

## Account Menu / Profile Settings Follow-Up

Profile / Account Settings surface added:
- `/settings/profile` now provides a protected personal account settings surface using the existing Supabase auth user, canonical `public.users` profile extension, and active organization membership context.
- The top-right account menu now links to `Profile / Account settings` while preserving Organization settings, Settings home, and the existing sign-out action.
- The profile page is read-only because this pass found the canonical profile table and self-update RLS, but no existing app-level personal profile update action/helper wired for safe editing.
- Existing organization settings remain admin-gated; the settings layout can render the personal profile page for active members, and admin-only settings pages continue to require organization owner/admin scope.

Confirmed non-visual follow-up:
- Add an explicit personal profile update action only after the intended editable fields, validation rules, and auth/profile sync behavior are approved.

## Black / Gray / Orange Palette Direction

Visual-only contractor-app palette update completed:
- FloorConnector's preferred contractor-app palette is black / gray / orange / white.
- Shared brand tokens now point to the warm orange action palette instead of green/teal, so existing `brand-*` buttons, links, checkboxes, and focus rings resolve to the approved accent direction.
- Shared shell, workspace/sidebar chrome, settings navigation, empty states, and manager headings were normalized away from prior dark-green and bluish heading values.
- Blue remains disallowed as a default contractor-app accent. Green/emerald remains allowed only for semantic success, approved, paid, or completed statuses.
- This pass was visual-only: no workflow, route, schema, auth, permission, estimate, invoice, catalog, calculation, or persistence behavior changed.

## System-Wide Palette Standardization

Visual-only system-wide palette standardization completed:
- Official contractor-app palette is black / gray / orange / white.
- Shared contractor shell, top navigation, workspace/page wrappers, command bars, manager cards, tables/registers, composer sheets, settings surfaces, forms, inputs, empty states, and document rendering styles were audited for stale blue/green/teal/violet utility accents.
- Confirmed non-semantic blue, sky, cyan, indigo, teal, violet, navy, and blue-tinted neutral accents were removed from the protected app/shared contractor component scan.
- Orange is the default primary action, active, highlight, and focus accent. Near-black/dark gray drives chrome and strong headings. White/off-white and warm gray drive work surfaces, borders, and dividers.
- Green/emerald is reserved for semantic success, approved, paid, or completed states. Red/rose remains destructive/error/blocked. Amber remains warning/pending/prerequisite-needed.
- This pass was visual-only: no workflow, route, schema, auth, permission, estimate, invoice, catalog, calculation, or persistence behavior changed.

## Decision-First UI Refactor Phases 1-3

Decision-first UI refactor foundation is started from `plan/refactor-decision-first-ui-1.md`. The prompt referenced `docs/refactor-decision-first-ui-1.md`, but that exact path was not present; the matching plan was found under `plan/`.

Completed in this staged subset:
- Phase 1 foundation components only: shared theme constants, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, and `SecondarySection` were added to `@floorconnector/ui`.
- Phase 2 section layout components: contractor app wrappers `CoreWorkflowSection`, `ExecutionSection`, and `SupportSection` were added under `apps/web/components/layout`.
- Phase 3 UI audit: [docs/ui-refactor-audit.md](C:/FloorConnector/docs/ui-refactor-audit.md) records decision-first anti-patterns and page-level risks before visual implementation.

Behavior preserved:
- no major pages were refactored
- no server actions, forms, permissions, workflows, routes, schema, auth, RLS, Supabase policies, data models, calculations, estimate behavior, invoice behavior, contract behavior, job behavior, or portal/super-admin behavior changed
- project detail remains the primary workflow/readiness hub
- the contractor top-nav-first shell and shared Manager Page direction remain intact

Validation for this subset passed:
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check` with exit code 0; it reported only the usual LF-to-CRLF working-copy warning on `packages/ui/src/index.ts`

Follow-up risk:
- Phase 4 should be handled as its own careful project-detail pass because that page carries the densest readiness and workflow sequencing. Preserve all existing project links/actions and server-side readiness logic when adding `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`.

## Decision-First UI Refactor Phase 4

Project Detail refactor completed as a UI-only contractor-app change in `apps/web/app/(app)/projects/[projectId]/page.tsx`.

Files changed:
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- visible actions included Create Estimate, Generate contract when an approved estimate exists without a contract, Create appointment, Create deposit invoice when deposit is required and unsatisfied, Create invoice for completed uninvoiced jobs, primary next-action links, secondary next-action links, follow-up action queue links, financing-status save, project edit save, empty-state create links for appointments, punchlists, daily logs, and change orders, plus schedule handoff actions
- links included projects back link, estimates, contracts, appointments, jobs, punchlists, daily logs, change orders, progress billing, invoices, payments, leads, customers, time cards, schedule, and communications
- readiness and blocker messages included project readiness status, ready-to-schedule date, active blocker list, readiness-stage details, `nextAction.blockerCopy`, deposit/financing/readiness copy, scheduling handoff copy, and the financing form note
- related-record sections included estimates, contracts, appointments, estimate attachments, contract PDFs, jobs, punchlists, daily logs, change orders, progress billing, invoices, payments, field/time signal, project context, project continuity, production schedule, and related conversations
- server actions/forms used on the page remained `updateProjectAction` through the financing-status mini form and the existing `ProjectForm`
- conditional rendering included status/readiness badges, approved-estimate contract generation, deposit invoice creation, completed-job invoice creation, blocker/no-blocker state, readiness stages, empty states, schedule focus, related-record lists, and sidebar continuity cards

Exact UI behavior changed:
- `ActionBar` now appears directly under the existing project page header and carries the current primary next action, secondary action, readiness status, blocker copy, and customer/location meta
- `WorkflowBar` now appears below `ActionBar`, mapping the existing readiness-stage data into the project readiness workflow without changing readiness logic
- `ProjectStateSummary` now appears near the top, summarizing project, readiness, financial, and schedule state from existing computed values
- a new `CoreWorkflowSection` appears before the older readiness/execution/support content and prioritizes Estimate, Contract, Job, and Invoice cards with existing links/actions
- the former duplicate top overview/next-action stack was replaced by the new decision-first top stack
- the former Connected Workflow section was narrowed to Coordination appointments because estimate/contract/job/invoice continuity is now covered in the core workflow section
- Documents now uses `SupportSection`; Operations Hub now uses `ExecutionSection`

Behavior preserved:
- no data loading, server actions, forms, route architecture, permissions, readiness calculations, links, workflow guards, schema, auth, RLS, Supabase policy, estimates, contracts, jobs, invoices, portal, super-admin, dashboard, or global list pages changed
- project detail remains the primary workflow/readiness hub
- existing project detail actions and links remain visible where their original conditions apply

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed after removing dead code from the replaced overview stack
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- browser QA attempted against real project `/projects/cbb32597-59c6-424b-9c3c-77f2b40ba0d0` on `localhost:3000` using `playwright/.auth/local-user.json`, but the saved contractor auth session was stale and redirected to `/login?next=%2Fpeople`; no local `FLOORCONNECTOR_E2E_EMAIL` or `FLOORCONNECTOR_E2E_PASSWORD` values were present in `.env.local`, so authenticated project-detail browser QA is intentionally deferred until a fresh real contractor session is available

Intentionally deferred project-detail polish:
- no deeper visual tuning of lower support panels
- no click-through mutation testing of create/save actions without a fresh authenticated QA session
- no dashboard, estimates, invoices, jobs, contracts, portal, super-admin, or list-page changes

## Decision-First UI Refactor Phases 1-4 Review Pass

Full review and refinement pass completed for the Phase 1-4 decision-first UI work. This was a UI-only QA/refinement pass, not a new feature phase.

Files changed:
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `docs/chat-handoff.md`

Exact UI improvements made:
- Project header actions remain visible, but the duplicate orange `Create Estimate` header CTA was changed to a neutral secondary action so the `ActionBar` owns the dominant next action.
- Duplicate project/readiness status badges were removed from the project header because the same information is now present in `ActionBar` and `ProjectStateSummary`.
- `ActionBar`'s non-clickable next-action label now uses neutral styling instead of orange, preserving orange for the primary CTA.
- `WorkflowBar` current-step styling now uses amber status styling instead of orange primary-action styling.
- `ProjectStateSummary` active tone now uses amber status styling instead of orange primary-action styling.
- Project detail section overview eyebrow styling was neutralized to reduce decorative orange.
- The empty job card's create link now preserves the existing project-scoped jobs handoff path (`/jobs?projectId=...`) instead of introducing a broader query shape.

Behavior preserved:
- existing project detail actions and links remain visible where their original conditions apply
- no data loading, server actions, forms, permissions, route architecture, workflow guards, readiness calculations, schema, auth, RLS, Supabase policy, backend, dashboard, estimates, invoices, jobs, contracts, portal, super-admin, or list pages changed
- project detail remains the primary workflow/readiness hub

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed after removing one unused readiness badge helper made obsolete by the header cleanup
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright QA passed on real project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
  - login was completed through the app `/login` page using `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD` from root `.env.local`
  - project detail rendered `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `Core Workflow`, and the expected execution/support sections
  - `Create Estimate` navigated to the existing estimate manager context URL with project/customer/opportunity context preserved
  - the ActionBar `Review contract` link navigated from project detail to `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
  - no browser console errors were captured during the pass
  - screenshot saved locally at `test-results/project-detail-review-pass.png`

Follow-up risks:
- lower project support panels can still receive normal iterative visual polish later, but no structural issue was found in this review
- `e2e/auth.setup.js` currently clicks the first submit button on `/login`, which is the Google flow; protected QA used a focused Playwright login path that targets the email/password submit button instead

## Post Visual System Audit

Documentation + functionality checkpoint completed in [docs/post-visual-system-audit.md](C:/FloorConnector/docs/post-visual-system-audit.md). The audit confirms the canonical lifecycle, `catalog_items` source-of-truth rule, estimate catalog snapshot insertion, invoice readiness guardrails, read-only `/settings/profile`, account menu wiring, and visual/layout passes remain aligned with the current implementation. Audit-only changes were made; no app code, schema, workflow, auth, permission, estimate, invoice, catalog, calculation, styling, or data behavior changed in this pass.

Confirmed follow-up from that audit has now been completed: stale current-state wording around estimate creation context was corrected, and invoice catalog wording now distinguishes implemented invoice-only manual catalog-backed adjustments from forbidden normal-scope catalog-to-invoice billing.

## Audit Documentation Corrections

Post-audit documentation corrections are complete. [docs/current-state.md](C:/FloorConnector/docs/current-state.md) now reflects the implemented estimate creation behavior: project-launched estimates pre-populate and lock the project and derived customer, global estimate creation requires customer plus project selection or creation, and validation preserves entered values. Invoice catalog language was clarified across current-state, developer source of truth, workflows, and the catalog-to-estimate/invoice spec: `catalog_items` remains canonical, estimate catalog insertion is implemented, invoice catalog usage is limited to explicit invoice-only manual catalog-backed adjustments, and free catalog insertion as normal invoice scope remains disallowed.

## Playwright E2E Browser QA Path

Focused Playwright browser QA infrastructure was added for protected contractor flows, starting with Phase B estimate-editor group-targeted catalog insertion. This is test infrastructure only: no app behavior, schema, auth/RLS, workflow, estimate calculation, invoice behavior, or catalog insertion logic changed.

- Playwright config now lives at [playwright.config.js](C:/FloorConnector/playwright.config.js).
- Auth setup lives at [e2e/auth.setup.js](C:/FloorConnector/e2e/auth.setup.js) and uses a real local contractor account through the normal `/login` flow. The setup project requires `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD`, saves `playwright/.auth/local-user.json`, and the protected Playwright project reuses that storage state for contractor app specs.
- The focused estimate spec lives at [e2e/estimate-group-catalog-insertion.spec.js](C:/FloorConnector/e2e/estimate-group-catalog-insertion.spec.js). It requires a safe draft estimate id/path and active non-system catalog item names supplied via environment variables.
- The manual estimate approval spec lives at [e2e/estimate-manual-approval-action.spec.js](C:/FloorConnector/e2e/estimate-manual-approval-action.spec.js). It uses the protected project and shared authenticated storage state, then records a real manual approval through the canonical estimate status-transition path.
- Minimal non-user-facing test ids were added to the Estimate Editoror group, group add-item, catalog search/select/add, catalog preview, and line-item row surfaces so browser QA can use DOM selectors instead of fragile coordinate clicks.
- Running instructions live at [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md).

Dependency repair / validation status:
- The previous install issue was caused by stale running FloorConnector dev-server processes locking native `next` and `turbo` files while pnpm tried to reconcile `node_modules`.
- The local dependency tree was repaired by stopping only those FloorConnector dev-server process trees, removing workspace `node_modules` artifacts, and rerunning `pnpm install --config.offline=false --reporter=append-only`.
- Playwright is installed (`pnpm exec playwright --version` reports 1.59.1), and Chromium was installed with `pnpm exec playwright install chromium`.
- Validation now passes: `pnpm typecheck`, `pnpm lint`, and `git diff --check` all complete successfully. `git diff --check` reports line-ending warnings only.
- Playwright spec discovery works with the web server disabled: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` lists the setup project, unauthenticated fixture tests, and protected estimate specs.
- Authenticated e2e execution still requires local-only setup: `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD`, plus spec-specific data such as `FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID` or path, active non-system catalog item names, or `FLOORCONNECTOR_E2E_MANUAL_APPROVAL_ESTIMATE_PATH`.

## Final Documentation Review

Final pre-next-phase documentation consistency review completed. Reviewed, in order: `docs/chat-handoff.md`, `docs/developer-source-of-truth.md`, `docs/current-state.md`, `docs/workflows.md`, `docs/Roadmap.md`, `docs/system-overview.md`, `docs/sales-to-production.md`, `docs/target-ia.md`, `docs/vision.md`, and `README.md`, with `docs/documentation-governance.md` checked for archival rules.

Corrections made were documentation-only:
- `docs/reporting-basics-plan.md` now clearly says the first `/reports` basics surface is implemented and that the plan is retained as guardrail/context, not an unstarted build plan.
- `docs/Roadmap.md` now identifies the current Phase B focus as validation and foundation hardening instead of implying first-pass scheduling, communications, reporting, and automation UI are still future work.
- `docs/system-overview.md` now distinguishes implemented first-pass `/communications`, `/schedule`, `/reports`, and Sales Tax Summary foundations from deeper target-only communication, dispatch, and analytics work.

Known remaining doc risks:
- several detailed implementation plans remain active because they still provide useful guardrails; they should be archived only after the next validation pass confirms they no longer prevent drift.
- no broad link rewrite was done; active source-of-truth docs still use absolute `C:/FloorConnector/...` links by convention.
- the next build phase should remain validation-first: run and record seed-free Phase B validation before adding feature breadth.

## System Rules

Keep these short rules in mind:
- no duplicate business models
- no portal-only copies of shared records
- no module-local silos
- workflow, lifecycle, creation-logic, or canonical-relationship changes must update relevant docs in the same change set, as applicable: `docs/developer-source-of-truth.md`, `docs/current-state.md`, and/or `docs/workflows.md`
- dashboards must point back into the shared chain
- Quick-Create must hand off into full workspaces
- project / shared record continuity stays more important than module completeness
