# E2E Browser QA

Status:

- local Playwright browser QA setup for protected FloorConnector contractor flows
- test infrastructure only; no schema, workflow, auth, RLS, estimate calculation, invoice, or catalog behavior changes

## Purpose

Use this path when the in-app browser or coordinate-based automation cannot reliably click inside dense editor surfaces such as the Estimate Editor. The current focused spec covers Phase B group-targeted catalog insertion in the Estimate Editor.

## Setup

Install dependencies after pulling this change:

```bash
pnpm install
```

Install Playwright browsers if they are not already present:

```bash
pnpm exec playwright install chromium
```

Start or allow Playwright to reuse the local dev server:

```bash
pnpm dev
```

The Playwright config defaults to:

```text
PLAYWRIGHT_BASE_URL=http://localhost:3001
PLAYWRIGHT_STORAGE_STATE=playwright/.auth/local-user.json
```

Playwright starts the web app with the port parsed from `PLAYWRIGHT_BASE_URL`.
With the default base URL, the webServer command starts `@floorconnector/web` on
port `3001`. If `PLAYWRIGHT_BASE_URL` is changed to `http://localhost:3000`,
Playwright starts or reuses port `3000` instead.

If your local Next dev server is already running on `localhost:3000`, set the base URL explicitly for auth and smoke commands:

```bash
$env:PLAYWRIGHT_BASE_URL="http://localhost:3000"
$env:PLAYWRIGHT_SKIP_WEB_SERVER="1"
pnpm e2e:auth
```

To check which local port is listening on Windows:

```bash
netstat -ano | Select-String ":3000|:3001"
```

If Playwright times out waiting for `localhost:3001` while the app is on `localhost:3000`, that is a local dev-server/base-URL mismatch. Rerun with `PLAYWRIGHT_BASE_URL=http://localhost:3000` or stop the stray server and let Playwright start its configured server.

Use `PLAYWRIGHT_SKIP_WEB_SERVER=1` only when an already-running server is
listening on the exact `PLAYWRIGHT_BASE_URL`. If the variable is set and that
server is not running, auth setup and protected specs will fail with connection
refused. Do not run multiple Playwright commands in parallel unless each uses a
separate base URL/port; the shared webServer is intended for one command at a
time.

Responsive UX consolidation checks now include mobile-width page-overflow
assertions in the customer detail, People access, detail workspace, and portal
golden-path specs. These checks assert page-level fit; manager/detail tables may
still use intentional inner scroll regions when the route needs register-style
data.

Project detail smoke coverage now also asserts the Project Workspace hub layer:
`Operational command center`, `Connected record lanes`, and the lane labels for
Sales / Estimate, Contract / Signature, Change Orders, Billing / Payments,
Job / Schedule, Field / Daily Logs, and Customer Access.

Document delivery smoke coverage lives in:

```bash
pnpm exec playwright test e2e/estimate-document-pdf-delivery.spec.js --project=chromium-protected
```

The spec verifies protected estimate, contract, and invoice `/pdf` routes render
customer-facing print/save views and that the detail workspaces expose
`Print / save PDF` actions. These routes are browser print/save renderings of
canonical records; the test should not require stored PDF files, separate
document records, payment mutation, or signature mutation.

Portal golden-path smoke also checks shared estimate, contract, and invoice
print routes when portal fixture records exist. Those portal print views should
show contractor organization branding rather than generic contractor copy while
preserving portal access scoping and avoiding payment/signature mutations.

If protected storage state redirects to `/login`, refresh it with
`pnpm e2e:auth` using the same `PLAYWRIGHT_BASE_URL` as the protected smoke
command. Common causes are a missing storage-state file, stale cookies, a
server running on a different port than the storage state was created against,
or an account that has not completed the real company setup gate.

Full lint can be slow on cold local caches because the repo uses type-aware
ESLint. When investigating a local timeout, first run targeted lint against the
touched files, then rerun `pnpm lint` once system load and dev-server processes
are quiet. Do not suppress lint failures; document the exact file/rule if full
lint remains blocked.

The public `chromium-public` project also includes the marketing entry-point regression spec:

```bash
pnpm exec playwright test --project=chromium-public e2e/marketing-login.spec.js
```

That spec verifies the public homepage exposes `Log in -> /login` and preserves `Start early access -> /signup?next=/setup/company`.

Data Export QA lives in:

```bash
pnpm exec playwright test e2e/data-export.spec.js --project=chromium-protected
pnpm exec playwright test e2e/data-export.spec.js --project=chromium-portal
```

The protected project verifies an authenticated contractor owner/admin can open
`/settings/export`, receive tenant-scoped CSV responses, and see recent export
history when the audit-table migration is present. It also verifies the
validation-only customer/contact CSV import dry-run panel can parse a small CSV
and return row-level dry-run results, save a read-only import review batch, open
the batch review route, and verify the customer export row count does not change.
If the active QA database has not applied `data_export_events` or
`data_import_batches` yet, the page shows the matching pending-migration notice
while keeping safe export/dry-run behavior usable. The portal project verifies a
portal customer cannot open the contractor Data Export route, see the import
dry-run UI, or open an import batch review route. Do not print downloaded export
contents or uploaded CSV contents in tickets, docs, chats, or test summaries.
Exports may contain customer PII and commercial data even though they exclude
tokens, secrets, raw provider payloads, payment secrets, and raw invite links.
The linked QA database was verified on May 15, 2026 with
`20260515204452_data_export_events` applied; apply
`20260515220057_data_import_batches` plus
`20260515221606_data_import_batch_grant_hardening` before expecting saved import
review batches to persist there with the intended grant posture.

Future import-write QA should not reuse the dry-run smoke as proof of mutation.
Before any import execution action is added, tests must cover editable row
decisions, approval confirmation, create/link-only write scope, no
portal/auth/email/payment/job creation, created-record audit evidence, rollback
eligibility, and portal customer exclusion.

Stripe Billing checkout QA must stay test-mode only. To verify the `/setup/billing`
subscription launcher, configure names-only prerequisites locally, restart the dev
server, and use contractor owner/admin auth:

```text
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_FOUNDER_PLAN_PRICE_ID
```

`STRIPE_FOUNDER_PLAN_PRICE_ID` is an env fallback. If
`platform_billing_settings.stripe_price_id` exists, SaaS Checkout prefers that
platform-admin-managed non-secret price reference.

Do not use live keys for local QA. Do not print checkout URLs, because Stripe
Checkout Session URLs can contain session tokens. Checkout return should land on
`/setup/billing`, leave activation manual, and leave contractor-customer invoice
payment records untouched.

Platform-admin Billing Operations QA should open `/super-admin/billing` to
confirm names-only Stripe configuration health, Checkout readiness, webhook
health, tenant subscription/reference status, platform price-reference status,
and activation separation. The page includes a test-mode-only Product/Price
create-or-discover action that must remain disabled/refused unless
`STRIPE_SECRET_KEY` is clearly test-mode from the `sk_test_` prefix. Unknown
keys should show as configured but mode-not-verified, and live keys should stay
blocked. The smoke is covered by `pnpm e2e:super-admin`; do not click live
Checkout or paste secret values while exercising the page.

Current local status from the 2026-05-15 replay prep: `STRIPE_SECRET_KEY` and
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` were present but mode-unknown from local
value format, the app-managed platform billing Product/Price reference was
missing, `STRIPE_FOUNDER_PLAN_PRICE_ID` was missing, and
`STRIPE_WEBHOOK_SECRET` was blank. That is an expected stop condition: do not run Product/Price setup,
create a Checkout Session, click a Checkout URL, or forward webhook events until
recognizable test-mode values and the missing names are configured and the app
is restarted. For this recovery path, `STRIPE_SECRET_KEY` should start with
`sk_test_`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` should start with `pk_test_`,
and `STRIPE_WEBHOOK_SECRET` should come from Stripe CLI or the matching Stripe
Dashboard webhook endpoint.

The authenticated 2026-05-15 follow-up refreshed platform-admin state with the
local Playwright setup and confirmed `/super-admin/billing`,
`/super-admin/early-access`, `/setup/billing`, and
`/setup/pending-activation` loaded against `localhost:3000` without falling to
`/login`. The checkout/replay stop condition remained in force, so no Stripe
resource, Checkout, webhook forwarding, webhook replay, activation, or
contractor-customer payment action was invoked.

A subsequent guarded retry repeated the route checks with existing contractor
and platform-admin storage states and confirmed the same four routes load
authenticated. Keep treating Product/Price setup as blocked until
`STRIPE_SECRET_KEY` is safely recognizable as `sk_test_`; keep Checkout and
webhook replay blocked until the publishable key, platform price reference, and
matching webhook secret are configured and the app is restarted.

The post-env-fix proof run confirmed those env and Product/Price prerequisites
can pass and that test-mode Checkout can return to `/setup/billing`. It did not
complete webhook reconciliation: local Stripe CLI listener processes were
present but did not forward the Checkout events, and signed replay of real
Stripe test-mode SaaS events returned the app's safe missing-plan error because
`subscription_plans` was empty. Before rerunning the webhook closeout, seed or
configure an active canonical SaaS subscription plan and keep the
contractor-payment counts check in place.

The follow-up recheck confirmed `/super-admin/billing`,
`/super-admin/early-access`, `/setup/billing`, and
`/setup/pending-activation` still load with authenticated platform-admin and
contractor storage states on the active local app port. It also confirmed a
signed wrong-domain webhook event is ignored without changing SaaS subscription,
contractor payment, or payment-event row counts. Repeat Checkout remained
skipped until an active canonical SaaS subscription plan exists.

The replay closeout seeded the active `founder-default` SaaS plan catalog row,
then replayed signed real Stripe test-mode SaaS events through the local
webhook. Expected sanitized proof is: at least one active `subscription_plans`
row, processed rows in `stripe_saas_billing_webhook_events`, one current
`company_subscriptions` row with status/current period evidence, unchanged
contractor `payments` and `payment_events` counts, and unchanged manual tenant
activation state. Duplicate replay should return duplicate without adding a
second current subscription row.

Live billing QA remains out of scope until
[docs/saas-billing-live-launch-plan.md](C:/FloorConnector/docs/saas-billing-live-launch-plan.md)
release gates are approved. Do not use live keys, create live Product/Price
resources, create live Checkout sessions, open Stripe Customer Portal, test
dunning/cancellation controls, or assert live entitlement behavior from the
test-mode proof.

Stripe SaaS billing webhook QA must also stay test-mode only. Configure
`STRIPE_WEBHOOK_SECRET` for the `/api/stripe/saas-billing-webhook` endpoint
signing secret, send only signed Stripe test events with
`billing_domain=floorconnector_saas` plus a valid `company_id`, and verify
`/super-admin/billing` shows the reconciled subscription references/status
without marking the tenant active. Do not print raw webhook payloads, endpoint
signing secrets, Checkout Session URLs, customer payment details, or Stripe keys.
The contractor-customer payment webhook remains
`/api/payments/stripe/webhook`; SaaS billing webhook QA must not create or update
canonical invoice payments or `payment_events`.
Use [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md)
for the Stripe CLI forwarding/replay command patterns, Dashboard endpoint setup,
required metadata, and safe database inspection queries.

## Auth Strategy

Protected contractor specs use the shared `chromium-protected` Playwright project. That project depends on the `setup` project, which logs in through the real local `/login` route and saves storage state before protected tests run.

Preferred local path:

1. Provide a real local contractor test account.
2. Do not hardcode credentials in the repo.
3. Do not bypass Supabase Auth, RLS, middleware, or organization membership checks.

Required local environment variables:

```text
FLOORCONNECTOR_E2E_EMAIL
FLOORCONNECTOR_E2E_PASSWORD
```

To create or refresh the saved auth state directly:

```bash
$env:FLOORCONNECTOR_E2E_EMAIL="contractor-test@example.com"
$env:FLOORCONNECTOR_E2E_PASSWORD="your-local-test-password"
pnpm e2e:auth:setup
```

The generated file defaults to:

```text
.playwright/.auth/contractor.json
```

That file is local-only and should not be committed. The legacy
`playwright/.auth/local-user.json` path is still reused when it already exists,
but new contractor auth setup should use `.playwright/.auth/contractor.json`
unless `PLAYWRIGHT_STORAGE_STATE` points somewhere else.

Running protected specs through `pnpm e2e` also runs the setup project first.
If a valid storage state already exists, protected specs reuse it. If no
storage state exists but `FLOORCONNECTOR_E2E_EMAIL` and
`FLOORCONNECTOR_E2E_PASSWORD` are present, the setup project generates one
through the real `/login` flow. If neither storage state nor credentials are
available, the authenticated route smoke skips with a clear prerequisite
message instead of treating `/login` as successful QA.

If a protected smoke reaches `/login`, the saved storage state is missing, stale, or rejected for the current app URL. Refresh it with `pnpm e2e:auth` using the same `PLAYWRIGHT_BASE_URL` as the smoke run. Do not count the login page as successful protected QA.

If Supabase Auth returns `AuthApiError: Request rate limit reached`, stop
retrying auth setup and use [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
for the cooldown, base-URL, storage-state, and fixture-selection recovery
checklist. Repeated login attempts can extend the local QA blocker without
proving anything about the protected route implementation.

If you already have a saved storage-state file, point Playwright to it:

```bash
$env:PLAYWRIGHT_STORAGE_STATE="C:\path\to\local-user.json"
```

To run the focused authenticated contractor smoke used by Codex browser checks:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://localhost:3001"
pnpm.cmd e2e:smoke:auth
```

If you already have a local dev server on another port, keep auth setup and the
smoke on the same origin:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://localhost:3000"
$env:PLAYWRIGHT_SKIP_WEB_SERVER="1"
pnpm.cmd e2e:auth:setup
pnpm.cmd e2e:smoke:auth
```

Codex should prefer this order for authenticated browser smoke:

1. Reuse `PLAYWRIGHT_STORAGE_STATE` if it points to an existing contractor
   state.
2. Reuse `.playwright/.auth/contractor.json` when present.
3. Reuse legacy `playwright/.auth/local-user.json` when present.
4. If no state exists and credentials are configured, run
   `pnpm.cmd e2e:auth:setup`.
5. If neither state nor credentials exist, report the blocked smoke honestly;
   do not patch cookies, hardcode credentials, weaken auth, or bypass RLS.

## Super Admin Access Regression QA

The super-admin access spec uses two real authenticated states:

- contractor-only owner state from `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD`
- platform-admin state from `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` / `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`

The intended local platform operator is:

```text
platform@floorconnector.com
```

That account must be created through the normal Supabase Auth signup/login flow first so `public.users` exists. Then grant platform access explicitly:

```bash
pnpm platform-admin grant platform@floorconnector.com
pnpm platform-admin status platform@floorconnector.com
pnpm platform-admin status jfilamonte@gmail.com
```

The existing first-entry auth bootstrap can create a normal contractor owner membership for the platform account after login. That bootstrap membership is not required for `/super-admin`; the access check must still come from `platform_user_roles`.

Required local environment variables:

```text
FLOORCONNECTOR_E2E_EMAIL
FLOORCONNECTOR_E2E_PASSWORD
FLOORCONNECTOR_PLATFORM_E2E_EMAIL
FLOORCONNECTOR_PLATFORM_E2E_PASSWORD
```

To run only the focused access regression:

```bash
pnpm e2e:super-admin
```

The generated local-only storage files are:

```text
playwright/.auth/local-user.json
playwright/.auth/platform-admin.json
```

The spec verifies:

- platform-admin auth setup lands the platform account on `/super-admin` after a normal login when no `next` is supplied
- platform-admin user can load `/super-admin`
- contractor-only owner is redirected from `/super-admin` to `/dashboard?error=Platform+admin+access+is+required.`
- contractor-only owner can still load `/dashboard`, `/projects`, and `/settings`

Contractor route-continuity checks assume the contractor E2E account has completed the real `/setup/company` gate. If the account redirects to `/setup/company`, complete that form through the app UI and rerun `pnpm e2e:super-admin`; do not patch storage state manually.

## Portal Customer Auth And Golden Path Smoke

Portal/customer QA uses a separate customer session because portal users are not contractor organization members. The portal smoke path must authenticate a real Supabase Auth user whose portal access is backed by canonical `portal_access_grants` and `portal_project_access` rows. Do not count `/login`, an accidental 404, an access-denied page, or a missing shared project as successful portal QA unless the test is intentionally checking unauthorized access.

Portal invite QA should distinguish pending invite records from Auth delivery. The current app-managed portal invite creates or reuses canonical contact-linked portal access records and may return a fresh `/portal/invite?token=...` copy-link fallback, but it does not create a Supabase Auth user or call Supabase admin invite. Branded provider email is attempted only when Postmark delivery is configured and activation guard allows external sends; otherwise the UI should show truthful no-send status. New contractor-created invites should select a `customer_contacts` row; null-contact grants are legacy compatibility records. The unauthenticated invite page should show customer-safe context plus signup, sign-in, and password-reset actions that preserve the invite return path and use the invited contact email.

Contractor-side portal access QA should verify contact-scoped project access rather than customer-account blanket access: People should open as a portal access console with filters, compact contact/grant rows, and no repeated full management panels by default; Manage access should open one selected contact/grant panel with invite status, temporary login help, stored permissions, and project visibility. Copy-from-primary-contact should remain an explicit operator action, and Project Workspace should show which customer contacts can currently see that project. Do not treat an inherited-looking access state as correct unless it is backed by explicit `portal_project_access` rows for that contact's active grant.

Primary-contact intake QA should verify that creating a customer directly, creating a project with an inline new customer, or converting an opportunity into the customer/project/estimate chain creates or links a primary `customer_contacts` row when person details are present. Confirm Customer Workspace and People show the contact as a related/primary customer contact; do not use customer-level email/phone alone as proof that portal access will work.

Temporary credential QA should treat the contractor action as a support fallback, not normal onboarding. Validate that only owner/admin users can create or reset the temporary portal login, the generated password is shown once, no raw password is stored in FloorConnector tables or logs, Supabase Auth `app_metadata` drives the password-change requirement, and password login redirects to `/update-password` before portal continuation. The local portal fixture helper may still create or update the E2E portal Auth user in explicit write mode for fixture repair.

Phase 1.2 adds a stable portal customer fixture helper. The helper validates by default and only writes when the operator explicitly enables local E2E fixture writes. It creates or repairs the portal Supabase Auth user/password plus canonical customer, contact, customer-contact, project, opportunity, catalog item, portal grant, project visibility, estimate, contract, invoice, and signer rows for the contractor E2E organization; it does not create portal-only records, fake signatures, fake payments, or checkout success.

Required local environment variables for generating the portal storage state:

```text
FLOORCONNECTOR_PORTAL_E2E_EMAIL
FLOORCONNECTOR_PORTAL_E2E_PASSWORD
```

Required environment variables for validating or writing the portal fixture:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
FLOORCONNECTOR_E2E_EMAIL
FLOORCONNECTOR_PORTAL_E2E_EMAIL
```

Write mode also requires:

```text
FLOORCONNECTOR_PORTAL_E2E_PASSWORD
FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1
```

Optional local overrides for stable portal fixture routes:

```text
PLAYWRIGHT_PORTAL_STORAGE_STATE
FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH
FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH
FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH
FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH
FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH
FLOORCONNECTOR_E2E_PORTAL_UNAUTHORIZED_PROJECT_PATH
```

To validate the current fixture state without mutating data:

```bash
pnpm e2e:portal-fixture
```

Validation mode prints missing prerequisite env var names together when required setup is absent. It should stop before any data writes and must not print secret values.

To create or repair the local/dev E2E fixture, use write mode deliberately:

```bash
$env:FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE="1"
pnpm e2e:portal-fixture -- --write
```

The fixture helper prints only non-secret route outputs, such as `FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH`, that can be copied into `.env.local` when deterministic portal routes are preferred. It must not print passwords, service-role keys, tokens, invite tokens, or storage-state contents.

To create or refresh the portal customer storage state:

```bash
pnpm e2e:portal-auth
```

The generated file defaults to:

```text
playwright/.auth/portal-user.json
```

That file is local-only and should not be committed. If the portal credential variables are missing, `pnpm e2e:portal-auth` skips with the missing prerequisite instead of creating fake auth state.

The local Phase 3 authenticated portal closeout on May 16, 2026 used this sequence successfully:

```bash
pnpm e2e:portal-fixture
pnpm e2e:portal-auth
```

That run validated the canonical portal fixture and created `playwright/.auth/portal-user.json` from real portal E2E credentials. Do not fake the storage state; when credentials, grants, or shared records are absent, document the missing prerequisite instead.

Run the portal golden-path smoke:

```bash
pnpm e2e:portal
```

The smoke spec covers:

- `/portal` authenticated customer workspace
- a portal-authenticated customer redirected back to `/portal` instead of being bootstrapped into the contractor dashboard when they have portal access but no contractor membership
- first granted `/portal/projects/[projectId]` workspace discovered from the portal home, or `FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH`
- `/portal/estimates/[estimateId]` when a shared estimate link or route override exists
- `/portal/contracts/[contractId]` when a shared contract link or route override exists
- `/portal/invoices/[invoiceId]` when a shared invoice link or route override exists, without clicking checkout or attempting payment
- `/portal/change-orders/[changeOrderId]` when a shared sent change-order link or route override exists, without approving or rejecting the record
- an intentional unauthorized-project 404 only when `FLOORCONNECTOR_E2E_PORTAL_UNAUTHORIZED_PROJECT_PATH` is configured
- unauthenticated `/portal/invite?token=...` account-onboarding copy when a pending invite fixture can be prepared with `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1`

Fixture requirements:

- the portal user must be a real authenticated user
- the portal user should be created through Supabase Auth or by the local fixture helper in explicit write mode
- invite acceptance should occur after signup/sign-in/password reset returns to `/portal/invite?token=...`
- the canonical `public.users` profile must exist for that portal auth account
- portal-only authentication should not create a contractor company owner membership for the portal customer
- portal-only customers with active portal grants and no contractor membership should be returned to `/portal` if they try to open contractor workspace routes
- the fixture customer/contact must remain canonical contractor-owned records
- the portal user must have an active customer-anchored portal access grant
- at least one active project access row is required for project workspace smoke
- estimate, contract, and invoice checks require records linked from that granted project or explicit route overrides
- change-order checks require a sent canonical `change_orders` record linked to that granted project or an explicit route override
- the invoice smoke only loads the review page and stops before any irreversible external charge boundary
- the change-order smoke only loads the review page and verifies decision controls; it does not approve, reject, invoice, or otherwise mutate the change-order decision state

Portal change-order decision action coverage lives in:

```bash
pnpm exec playwright test e2e/portal-change-order-actions.spec.js --project=chromium-portal
```

This focused spec creates or resets disposable canonical `change_orders` records on the same E2E portal customer/project chain and leaves the stable golden review fixture untouched. It verifies portal approval and rejection through the real customer-facing forms, confirms canonical DB state after each decision, resets the disposable records back to `sent`, verifies an already-approved disposable record does not expose decision actions, and verifies a change order on the unauthorized boundary project is not visible to the portal customer.

Portal estimate decision action coverage lives in:

```bash
pnpm exec playwright test e2e/portal-estimate-actions.spec.js --project=chromium-portal
```

This focused spec creates or resets disposable canonical `estimates` records with simple valid line items and explicit fixture totals on the same E2E portal customer/project chain. It leaves the stable golden estimate review fixture untouched, verifies portal approval and rejection through the real customer-facing forms, confirms canonical DB status/timestamp/user state after each decision, confirms fixture math remains unchanged, resets disposable estimates back to `sent`, verifies an already-approved disposable estimate does not expose decision actions, and verifies an estimate on the unauthorized boundary project is not visible to the portal customer.

Portal contract signature action coverage lives in:

```bash
pnpm exec playwright test e2e/portal-contract-actions.spec.js --project=chromium-portal
```

This focused spec creates or resets disposable canonical `contracts` and `contract_signers` rows on the same E2E portal customer/project chain. It leaves the stable golden contract review fixture untouched, verifies portal customer signing and decline through the real customer-facing forms, confirms canonical `contracts` state, `contract_signers` state, and appended `contract_signature_events`, resets disposable contracts and signers back to `sent`/`pending`, verifies an already-signed disposable contract does not expose signature actions, and verifies a contract on the unauthorized boundary project is not visible to the portal customer. Signature events are immutable by design, so the spec verifies event counts increase rather than deleting event history.

## Payment And Portal Payment QA

The payment QA slice is intentionally split into portal review/start boundaries and synthetic webhook reconciliation. It uses disposable canonical invoices/payments and never calls live Stripe.

Coverage map:

- Portal invoice review boundary: open, paid, and unauthorized-project invoice review; verifies render does not create payments or payment events.
- Portal checkout-start boundary: submits the real portal start-payment form through the `local_manual` gateway and verifies pending payment/request events without provider completion.
- Synthetic Stripe webhook matrix: signed local payloads for `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `payment_intent.payment_failed`, and `payment_intent.canceled`.
- Negative webhook coverage: invalid signature, missing metadata, wrong/unknown `payment_id`, unsupported event type, same-tenant cross-invoice mismatch, and cross-tenant mismatch using the Tenant B fixture.

Useful package scripts:

```bash
pnpm e2e:payments:portal
pnpm e2e:payments:webhook
pnpm e2e:payments
```

Fixture and auth order:

```bash
pnpm e2e:portal-fixture
pnpm e2e:portal-auth
FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1 pnpm e2e:second-tenant-fixture:write
pnpm e2e:second-tenant-fixture
pnpm e2e:payments
pnpm e2e:portal
```

Required env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FLOORCONNECTOR_E2E_EMAIL`
- `FLOORCONNECTOR_PORTAL_E2E_EMAIL`
- `STRIPE_WEBHOOK_SECRET` for synthetic webhook tests; Playwright supplies a local default when it is not already configured
- `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1` only for write-gated fixture reset commands
- `FLOORCONNECTOR_E2E_PAYMENT_GATEWAY=local_manual` is configured by Playwright for checkout-start coverage

Not covered by this payment QA slice:

- live Stripe Checkout
- real charges
- Stripe CLI forwarding
- refunds
- disputes
- subscriptions or SaaS billing webhooks
- provider settlement or payout reconciliation

Troubleshooting:

- If port `3001` is already in use, stop the stale local dev server or set `PLAYWRIGHT_BASE_URL` / `PLAYWRIGHT_SKIP_WEB_SERVER` according to the run you are performing.
- If portal auth is missing, rerun `pnpm e2e:portal-fixture` and `pnpm e2e:portal-auth`; do not treat an unauthenticated `/login` redirect as portal coverage.
- If the cross-tenant webhook test skips, run `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1 pnpm e2e:second-tenant-fixture:write`, then `pnpm e2e:second-tenant-fixture`.
- If a Playwright dev-server run fails before reaching the changed surface, rerun the focused script once before classifying it as an app regression.
- If generated build output appears stale, remove `.next` only as local generated output cleanup, then rerun the focused command.

Portal invoice payment-boundary coverage lives in:

```bash
pnpm e2e:payments:portal
```

This focused spec creates or resets disposable canonical `invoices`, `invoice_line_items`, and, for paid-state coverage, canonical recorded `payments` plus `payment_events`. It leaves the stable golden invoice review fixture untouched, verifies an open invoice can render without creating new payments or payment events, verifies a paid invoice renders safe payment state and payment activity without showing checkout, verifies invoice totals and balance remain unchanged, and verifies an invoice on the unauthorized boundary project is not visible to the portal customer. The spec intentionally does not click the checkout CTA, create checkout sessions, call Stripe, complete payment, or exercise webhook behavior.

Portal invoice checkout-start provider-isolated coverage lives in:

```bash
pnpm exec playwright test e2e/portal-invoice-checkout-start.spec.js --project=chromium-portal
```

This focused spec uses the existing `local_manual` payment gateway adapter through the non-production-only `FLOORCONNECTOR_E2E_PAYMENT_GATEWAY=local_manual` override configured by Playwright. It creates or resets one disposable canonical invoice and line item, temporarily activates the E2E organization so the real production-action guard allows the portal checkout-start form, restores the organization activation state afterward, submits the real portal payment-start form, and verifies the canonical pending `payments` row plus `payment_requested` and `checkout_started` events. It also verifies invoice total, balance, and status remain unchanged, no `payment_succeeded` event is written, no checkout completion is simulated, and no Stripe/provider network path is used. This is checkout-start boundary coverage only; webhook reconciliation and payment completion remain out of scope.

Synthetic Stripe webhook reconciliation coverage lives in:

```bash
pnpm e2e:payments:webhook
```

This focused spec uses a local `STRIPE_WEBHOOK_SECRET` supplied by Playwright when one is not already configured, creates or resets disposable canonical invoices plus pending canonical `payments` rows, signs synthetic Stripe payloads with the same HMAC header shape used by Stripe, and posts them to `/api/payments/stripe/webhook`. It verifies the real webhook route accepts a `checkout.session.completed` payload, finalizes the pending payment through canonical reconciliation, writes one provider `payment_succeeded` event, updates invoice balance/status through canonical payment state, and treats an exact duplicate provider event as idempotent without creating another payment or event. It also verifies a synthetic `checkout.session.expired` payload voids the pending canonical payment, writes one provider `payment_voided` event, leaves the invoice status and balance unchanged, writes no success event, and treats duplicate expired delivery as idempotent. It verifies a synthetic `checkout.session.async_payment_failed` payload records one provider `payment_failed` event, attaches checkout and PaymentIntent failure references to the pending canonical payment, leaves invoice status and balance unchanged, writes no success event, and treats duplicate async-failure delivery as idempotent. It verifies a synthetic `payment_intent.payment_failed` payload records one provider `payment_failed` event, attaches the PaymentIntent failure status to the pending canonical payment, leaves the invoice status and balance unchanged, writes no success event, and treats duplicate failure delivery as idempotent. It verifies a synthetic `payment_intent.canceled` payload voids the pending canonical payment, writes one provider `payment_voided` event, leaves invoice status and balance unchanged, writes no success event, and treats duplicate canceled delivery as idempotent. Negative coverage verifies invalid signatures are rejected before mutation, signed missing-metadata events are ignored without mutation, signed events with an explicit unknown `payment_id` are ignored without fallback payment creation, signed same-tenant cross-invoice events using a real payment from a different invoice are ignored without mutating either invoice/payment pair, and signed unsupported event types are ignored without invoice/payment/payment-event changes. It does not call Stripe, create a Checkout Session, create a charge, fake a production bypass, or exercise SaaS subscription webhooks.

Cross-tenant mismatched-reference webhook coverage uses the disposable tenant B fixture seam:

```bash
pnpm e2e:second-tenant-fixture
FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1 pnpm e2e:second-tenant-fixture:write
```

The helper creates or resets a service-role-only E2E company/customer/project/invoice/payment chain using these stable identifiers: company slug `e2e-stripe-webhook-tenant-b`, company name `E2E Stripe Webhook Tenant B`, customer email `e2e-stripe-webhook-tenant-b@example.invalid`, project name `E2E Stripe Webhook Tenant B Project`, and invoice reference `E2E-STRIPE-WEBHOOK-TENANT-B-INVOICE`. It prints tenant B organization, customer, project, invoice, line-item, and payment ids plus the contractor E2E user's active tenant A organization id for the cross-tenant webhook assertion. The helper is dry-run by default, write-gated by `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1`, refuses production-marked environments, does not create tenant B memberships, does not make tenant B active/default for UI auth, and leaves stable golden fixtures untouched.

The webhook reconciliation spec now consumes this fixture seam for cross-tenant integrity coverage. It combines tenant A's real organization/invoice ids with tenant B's real pending payment id in one signed synthetic `checkout.session.completed` payload, expects the safe `missing_canonical_payment` response, and verifies tenant A and tenant B invoice/payment/payment-event state remain unchanged. If tenant B is missing, the test skips with the write-gated fixture command as the prerequisite instead of creating tenant records inside the webhook spec.

## Estimate Group Catalog Insertion QA

Required test data:

- an authenticated contractor user
- a safe draft estimate that can be edited during QA
- at least two active non-system catalog items
- optionally a third active non-system catalog item for the global fallback check

Set the draft estimate and catalog item names:

```bash
$env:FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID="estimate-uuid"
$env:FLOORCONNECTOR_E2E_GROUP_A_CATALOG_ITEM="Vinyl Cove Base"
$env:FLOORCONNECTOR_E2E_GROUP_B_CATALOG_ITEM="Mobilization or Setup"
$env:FLOORCONNECTOR_E2E_GLOBAL_CATALOG_ITEM="Surface Prep / Grind"
pnpm e2e -- e2e/estimate-group-catalog-insertion.spec.js
```

Instead of an estimate id, a path may be supplied:

```bash
$env:FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_PATH="/estimates/estimate-uuid/edit"
```

## What The Focused Spec Verifies

- protected Estimate Editor loads with real auth
- a draft estimate can create new groups through the existing UI
- group-level `Add Item` opens the existing add-item tools
- active non-system catalog item quick-add inserts into the selected group
- a second group can receive a different active non-system catalog item
- renaming a group keeps the inserted item in that group
- optional global add flow inserts without selected group into the existing ungrouped fallback

## What It Does Not Do

- it does not seed fake data
- it does not create users, organizations, catalog items, or draft estimates
- it does not bypass auth, permissions, RLS, or middleware
- it does not test invoice behavior
- it does not test estimate calculations beyond confirming the inserted rows render in the expected group

## Troubleshooting

If the test redirects to `/login`, refresh the saved auth state:

```bash
pnpm e2e:auth
```

If no catalog quick match appears, confirm the environment variable matches an active non-system catalog item name available to the organization.

If the test should use an already running dev server and never start one:

```bash
$env:PLAYWRIGHT_SKIP_WEB_SERVER="1"
pnpm e2e -- e2e/estimate-group-catalog-insertion.spec.js
```

## Manual Estimate Approval QA

The manual approval spec uses the same protected project and shared authenticated storage state. It is a real action against a real draft or sent estimate and will mark that estimate approved through the canonical status-transition path.

```bash
$env:FLOORCONNECTOR_E2E_MANUAL_APPROVAL_ESTIMATE_PATH="/estimates/estimate-uuid"
$env:PLAYWRIGHT_SKIP_WEB_SERVER="1"
pnpm exec playwright test e2e/estimate-manual-approval-action.spec.js
```

## Project AI Cue Bridge QA

The project AI cue bridge spec uses the same protected project and shared authenticated storage state. It verifies that project guidance cues can open the existing internal work-item form with source-locked defaults without submitting the form. The same spec also covers the dashboard preview contract and a small accessibility/readability guard for cue priority text and contextual action names.

The protected regression command is:

```bash
pnpm exec playwright test e2e/project-ai-cue-work-item-bridge.spec.js --project=chromium-protected
```

The approved-estimate-missing-contract regression first accepts an explicit project path:

```bash
$env:FLOORCONNECTOR_E2E_ESTIMATE_CUE_BRIDGE_PATH="/projects/project-uuid"
pnpm exec playwright test e2e/project-ai-cue-work-item-bridge.spec.js --project=chromium-protected
```

The signed-ready-no-job regression also accepts an explicit project path:

```bash
$env:FLOORCONNECTOR_E2E_SIGNED_READY_NO_JOB_CUE_BRIDGE_PATH="/projects/project-uuid"
pnpm exec playwright test e2e/project-ai-cue-work-item-bridge.spec.js --project=chromium-protected
```

The ready-project-with-unscheduled-job regression also accepts an explicit project path:

```bash
$env:FLOORCONNECTOR_E2E_UNSCHEDULED_JOB_CUE_BRIDGE_PATH="/projects/project-uuid"
pnpm exec playwright test e2e/project-ai-cue-work-item-bridge.spec.js --project=chromium-protected
```

The ready-to-schedule already-scheduled-job handoff regression also accepts an explicit project path:

```bash
$env:FLOORCONNECTOR_E2E_SCHEDULED_JOB_HANDOFF_PATH="/projects/project-uuid"
pnpm exec playwright test e2e/project-ai-cue-work-item-bridge.spec.js --project=chromium-protected
```

The open-blocker-field-note regression also accepts an explicit project path:

```bash
$env:FLOORCONNECTOR_E2E_FIELD_NOTE_CUE_BRIDGE_PATH="/projects/project-uuid"
pnpm exec playwright test e2e/project-ai-cue-work-item-bridge.spec.js --project=chromium-protected
```

If no path is provided, the fixture-backed cue and handoff regressions create or reuse small canonical E2E fixtures for the contractor test organization:

- approved-estimate cue: one customer, one project, one opportunity, and one approved estimate with no generated contract
- signed-ready-no-job cue: one customer, one project, one opportunity, one approved estimate, and one signed contract with no linked jobs
- ready-project-with-unscheduled-job cue: one customer, one project, one opportunity, one approved estimate, one signed contract, and exactly one unscheduled job
- ready-to-schedule already-scheduled-job handoff: one customer, one project, one opportunity, one approved estimate, one signed contract, and one scheduled job with no unscheduled jobs
- dashboard ready-project-without-job handoff: one disposable `[E2E] Dashboard Ready No Job ...` project, one customer, one opportunity, one approved estimate, and one signed contract with no linked jobs
- dashboard existing-unscheduled-job handoff: one disposable `[E2E] Dashboard Unscheduled Job Project ...` project, one customer, one opportunity, one approved estimate, one signed contract, and one canonical unscheduled job with no schedule date/time
- open-blocker-field-note cue: one customer, one ready project, one opportunity, one approved estimate, one signed contract, one daily log, and one open blocker field note

The project cue bridge spec verifies:

- unpaid deposit invoice, approved-estimate-missing-contract, signed-ready-no-job, ready-unscheduled-job, and open blocker/issue field-note bridge behavior
- ready-to-schedule Project Detail handoff copy and routes for no-job, one-unscheduled-job, and already-scheduled-job states
- dashboard project guidance preview routes back to Project Detail / `#project-guidance-cues`
- dashboard preview does not expose cue-level `Create work item`
- contextual dashboard actions preserve canonical workflow links
- Project Detail cue actions expose readable priority text and contextual accessible names
- opening a cue bridge does not create a work item until the existing form is submitted

Because Project Workspace guidance is organization-configurable, cue specs that
assert `#project-guidance-cues` preserve the current organization workflow
guidance preferences, force Guided presentation for the run, and restore the
previous preferences afterward. Stable route smoke should keep asserting
non-negotiable project facts instead of depending on optional guidance panels.

This requires the local-only service role key already used for E2E fixture setup:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
FLOORCONNECTOR_E2E_EMAIL
```

The fixture does not add schema, migrations, duplicate task models, external AI calls, or autonomous work-item creation.

## Schedule Ready Handoff QA

The schedule ready handoff spec uses the same protected project and shared authenticated storage state. It verifies that Project Detail ready-to-schedule handoff URLs land on `/schedule` with the expected project/job context and do not save or mutate schedule data merely from loading the URL.

The spec also asserts the good-enough scheduling landmarks so `/schedule` remains understandable as a contractor scheduling surface: `Scheduling command center`, `Ready work queue`, `Scheduled timeline`, and `Selected job action panel`.

It also includes dashboard coverage for the `Projects ready for job creation` and `Jobs needing scheduling` queues, proving a ready project with no canonical job links to job creation while an existing canonical unscheduled job links into the Schedule selected-job action panel.

The protected regression command is:

```bash
pnpm exec playwright test e2e/schedule-ready-handoff.spec.js --project=chromium-protected
```

The spec reuses the same local fixture shapes and optional project-path overrides documented above:

```text
FLOORCONNECTOR_E2E_UNSCHEDULED_JOB_CUE_BRIDGE_PATH
FLOORCONNECTOR_E2E_SCHEDULED_JOB_HANDOFF_PATH
```

It verifies:

- `/schedule?projectId={projectId}&jobId={jobId}&view=unscheduled&action=schedule` opens the existing schedule composer for that exact unscheduled job
- `/dashboard` shows a fixture-backed ready project without a job in `Projects ready for job creation` and exposes `/jobs?projectId={projectId}&compose=1&estimateId={estimateId}&contractId={contractId}`
- `/dashboard` shows a fixture-backed existing unscheduled job in `Jobs needing scheduling`, exposes `/schedule?projectId={projectId}&view=unscheduled&action=schedule&jobId={jobId}#schedule-action`, and opens the Schedule selected-job action panel with unscheduled-job copy visible
- `/schedule?projectId={projectId}&view=unscheduled&action=schedule` still uses the exact-one unscheduled job fallback when the project has exactly one unscheduled job
- `/schedule?projectId={projectId}` stays project-scoped for already scheduled jobs without opening job creation, work-item creation, or schedule mutation surfaces
- the intentional submit-path regression uses a disposable `[E2E] Schedule Submit Path ...` fixture, schedules that one canonical job through the existing `/schedule` composer, verifies the saved schedule persists after reload, confirms no duplicate jobs or work items were created, and resets that fixture job back to unscheduled after the assertions

## Golden Workflow Browser Verification QA

The golden workflow verification spec is the first browser-level proof chain
for the canonical lifecycle:

```text
Opportunity -> Customer -> Project -> Estimate -> Contract -> Signature -> Job -> Schedule -> Invoice -> Payment
```

Run it through the protected project:

```bash
pnpm exec playwright test e2e/golden-workflow-verification.spec.js --project=chromium-protected
```

The spec creates a disposable `[E2E] Golden Browser Workflow ...` canonical
fixture chain for the contractor E2E organization. It asserts:

- converted opportunity, customer, project, estimate, and contract ids stay
  linked
- no job or standard invoice exists while the contract is still out for
  signature
- signing state is represented by the canonical contract, signer, and signature
  event rows
- the same project becomes ready to schedule and carries one canonical job into
  `/schedule`
- a standard invoice is created only after commercial readiness in the fixture
  chain
- a canonical payment plus `payment_succeeded` event updates the invoice to
  paid and remains visible from contractor routes

Portal comparison is opportunistic inside the same protected run. When
`FLOORCONNECTOR_PORTAL_E2E_EMAIL` plus either `playwright/.auth/portal-user.json`
or portal E2E credentials are available, the spec creates canonical portal
grant/project-access rows for the same customer contact and checks the same
project, contract, and invoice ids through portal routes. If portal auth is not
available, the spec records a fixture-limited annotation instead of counting
unauthenticated portal navigation as a pass.

This spec is a verification layer over existing records. It does not add
schema, routes, server actions, portal-only copies, fake production shortcuts,
provider calls, or duplicate workflow logic. It also does not yet submit every
production UI form; UI refusal coverage for blocked job creation and blocked
standard invoice creation remains a follow-up.

## Golden Workflow Demo Path QA

The Golden Workflow Demo Path is documented in [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md). Protected route checks must use the same authenticated contractor storage-state setup described above.

The founder-demo rehearsal script is documented in [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md). Use it when QA needs to prove the full showable path from setup and early-access billing through contractor workflow, portal review, print/save documents, and super-admin early-access oversight. For the first controlled external demos, pair that QA spine with [docs/founder-prospect-demo-script.md](C:/FloorConnector/docs/founder-prospect-demo-script.md) so prospect selection, caveats, feedback capture, and next-slice decisions are handled consistently.

Focused smoke command:

```bash
pnpm exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected
```

Customer detail has a dedicated protected smoke for the contact-centered portal access surface:

```bash
pnpm exec playwright test e2e/customer-detail-ui.spec.js --project=chromium-protected
```

The customer detail smoke discovers a real customer from `/customers` unless
`FLOORCONNECTOR_E2E_CUSTOMER_DETAIL_PATH` is configured. It verifies the
Customer Workspace renders past the loading shell, shows Contacts and Portal
Access, exposes the People handoff for access management, and inspects invite
email delivery status when the selected customer fixture has a pending/active
portal invite block.

The protected smoke coverage verifies:

- manager routes in the demo spine load authenticated instead of stopping at `/login`
- core Project, Estimate, Contract, Invoice, and Job Workspaces still render their decision-first regions
- Project, Estimate, Contract, and Invoice Workspaces remain stable after right-rail consolidation, even when secondary linked records, metadata, revision history, manual payment entry, or invoice editing are behind progressive disclosure
- Customer Workspace renders contact-centered portal access without stalling on `Preparing your workspace`
- Schedule submit coverage fills the required date/time fields before expecting the dirty-save button to enable; a disabled `Save schedule` button before input remains expected saved-state behavior.
- route checks do not seed fake data or create demo-only workflow state

Run shared-webServer Playwright commands sequentially unless each command uses a
separate `PLAYWRIGHT_BASE_URL`/port. Parallel commands can race on the managed
Next dev port and produce environment failures that are not app regressions.

For full manual QA, pair that smoke run with the route-by-route checklist in `docs/golden-workflow-demo-path.md` and record missing fixtures, missing portal/customer auth, or skipped detail routes explicitly.

Founder-demo QA should additionally open `/setup/company`, `/setup/billing`, `/setup/pending-activation`, `/dashboard?fresh=true`, `/people`, `/portal`, the protected and portal print/save document routes for estimate/contract/invoice where fixture data exists, `/super-admin/billing`, and `/super-admin/early-access` with platform-admin auth. Do not click live Checkout, customer payment checkout, activation, reset, temporary credential generation, or raw invite-link copy actions unless the run is explicitly scoped for that safe test action.

## Phase 2 Visual Route Matrix

The authenticated visual route-matrix harness is:

```bash
pnpm exec node scripts/visual-audit-phase2.cjs
```

It expects a local app at `PLAYWRIGHT_BASE_URL` or `http://localhost:3001`, uses `playwright/.auth/local-user.json` for contractor/setup routes, `playwright/.auth/platform-admin.json` for super-admin routes, and `playwright/.auth/portal-user.json` for portal routes when available. The script writes `tmp-visual-audit-phase2/route-audit.json` plus selected screenshots, records redirects/missing storage states as blocked rather than successful route checks, and checks first heading text, console/page errors, interactive count, and page-level horizontal overflow.

If `playwright/.auth/portal-user.json` is missing, portal routes must be reported as blocked unless `pnpm e2e:portal-auth` has been run with real portal fixture credentials. Do not count unauthenticated `/login` redirects as successful protected or portal QA.

## Phase 3 Focused Portal / Materials Visual Audit

Use the focused Phase 3 harness when closing portal-authenticated QA, setup overflow, or materials-route evidence:

```bash
pnpm exec node scripts/visual-audit-phase3.cjs
```

The script expects the same local app and storage-state files as the Phase 2 harness. It writes `tmp-visual-audit-phase3/route-audit.json` and screenshots for desktop setup, `/materials`, and authenticated portal routes. Each row records requested route, final path after navigation, auth state, viewport, screenshot path, first `h1`, console errors, page errors, horizontal overflow, redirects, and blocked prerequisites.

`/materials` is intentionally audited as an alias. The route server-redirects to `/cost-items-database/items`, and the harness records both the requested route and final route instead of treating the navigation as a failed DOM evaluation.

The May 16, 2026 Phase 4 closeout extended the stable portal fixture with a sent canonical change-order record. The focused visual run checked 16 of 16 rows with 0 blocked prerequisites, 0 missing headings, 0 console/page errors, and 0 page-level horizontal overflow, including desktop screenshot plus mobile DOM smoke for `/portal/change-orders/[changeOrderId]`.
