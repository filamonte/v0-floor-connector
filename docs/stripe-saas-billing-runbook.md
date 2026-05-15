# Stripe SaaS Billing Webhook Runbook

Status: Test-mode operator runbook
Doc Type: Operations

This runbook covers FloorConnector SaaS subscription billing only. It does not
cover contractor-customer invoice payments, portal checkout, canonical invoice
payment rows, or `payment_events`.

Use with:

- [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)

## Latest Local QA Status

Date: 2026-05-14

Names-only local env readiness check:

- `STRIPE_SECRET_KEY`: present, mode unknown from the local value format
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: present, mode unknown from the local value format
- app-managed platform billing price reference: missing
- `STRIPE_FOUNDER_PLAN_PRICE_ID`: missing env fallback
- `STRIPE_WEBHOOK_SECRET`: missing

Because the Stripe key prefixes are not safely recognizable as test mode, the
platform billing price reference is missing, and the SaaS webhook signing secret
is missing, local Product/Price setup, SaaS Checkout creation, Checkout
completion, and Stripe CLI webhook replay were not started in this pass. The
safe result is to keep `/setup/billing` in its unavailable/review state, run the
checkout/webhook unit coverage, and complete the replay only after an operator
configures recognizable Stripe test-mode values and a signed webhook source in
the local env source of truth.

Billing Operations now also supports a platform-admin-only test-mode Product /
recurring Price setup action. If `STRIPE_SECRET_KEY` is clearly test mode, use
`/super-admin/billing` to create or discover the FloorConnector SaaS test Product
and recurring Price, then store only the non-secret Product and Price references
in `platform_billing_settings`. The app does not write `.env.local`; the env
fallback `STRIPE_FOUNDER_PLAN_PRICE_ID` remains supported for compatibility.
`STRIPE_WEBHOOK_SECRET` still must be configured from Stripe CLI or the Stripe
Dashboard endpoint before webhook replay.

The recovery UI now classifies credential readiness by safe prefix only:
`STRIPE_SECRET_KEY` must start with `sk_test_` for Product/Price setup,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must start with `pk_test_` for local test
Checkout, live prefixes are refused for this phase, and any other configured
value is shown as configured but mode-not-verified. Stripe webhook signing
secrets remain env/provider-managed; Billing Operations shows the endpoint and
CLI template but never stores webhook secrets in the database.

Database inspection during this pass showed no SaaS billing reconciliation rows
yet: `stripe_saas_billing_webhook_events` count `0`,
`company_subscriptions` count `0`, and `platform_billing_settings` had no stored
Stripe Product or Price reference. Existing contractor invoice/payment counts
were inspected only as a no-mutation baseline; no contractor-customer payment
webhook was invoked.

## Domain Boundary

FloorConnector has two separate Stripe domains:

1. FloorConnector SaaS billing
   - Webhook endpoint: `/api/stripe/saas-billing-webhook`
   - Metadata gate: `billing_domain=floorconnector_saas`
   - Reconciles safe Stripe references onto `companies` and
     `company_subscriptions`
   - Records processed event ids in `stripe_saas_billing_webhook_events`
   - Never auto-activates tenants

2. Contractor-customer invoice payments
   - Webhook endpoint: `/api/payments/stripe/webhook`
   - Owns canonical invoice payment finalization
   - Must not be used for FloorConnector SaaS subscription events

Do not mix these domains. SaaS billing webhook tests must not create or update
contractor invoice payments, portal payment state, payment ledger rows, or
`payment_events`.

## Billing Operations Console

Durable SaaS billing operations live at `/super-admin/billing`. Early access is
a commercial phase; Billing is the long-term operating home for:

- Stripe configuration health by env name only
- founder/default SaaS plan reference status from platform settings and env fallback
- test-mode-only Product/recurring Price create-or-discover control
- Checkout readiness and the tenant-facing `/setup/billing` entry point
- signed SaaS webhook endpoint health
- tenant subscription/reference status from existing company and subscription rows
- manual founder billing evidence shown separately from Stripe reconciliation
- manual activation/entitlement separation

The console may create or reuse Stripe Products and recurring Prices only with a
test-mode Stripe secret key that is recognizable from the `sk_test_` prefix. It
does not create live Stripe resources, Checkout Sessions, Customer Portal
sessions, customers, subscriptions, invoices, payment links, live charges,
webhook endpoints, or tenant activation. Use it before running the local replay
steps and after replay to confirm status; use `/super-admin/early-access` for
founder readiness and manual activation review.

## Required Environment Variable Names

Configure names only. Never paste or print values in tickets, logs, docs, chat,
or screenshots.

```text
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_FOUNDER_PLAN_PRICE_ID
STRIPE_WEBHOOK_SECRET
```

`STRIPE_WEBHOOK_SECRET` must match the signing secret for the webhook source
being tested. Stripe CLI forwarding and a Dashboard-managed endpoint produce
different signing secrets.

`STRIPE_FOUNDER_PLAN_PRICE_ID` is now an env fallback. If
`platform_billing_settings.stripe_price_id` exists, SaaS Checkout prefers that
app-managed non-secret reference before the env value.

Prefix expectations for this test-mode recovery path:

- `STRIPE_SECRET_KEY` must start with `sk_test_`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must start with `pk_test_`
- `sk_live_` and `pk_live_` are live mode and are refused for local replay
- any other configured value is treated as unknown until the operator corrects
  env and restarts the app

## Supported Events

The SaaS webhook route handles only these event types after signature
verification and SaaS metadata validation:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

Events without `billing_domain=floorconnector_saas`, without a valid
`company_id`, or with an unexpected `environment` marker are ignored safely.

## Required Checkout Metadata

Subscription Checkout must carry this metadata:

```text
billing_domain=floorconnector_saas
company_id=<company uuid>
environment=<current app environment>
```

The app-created Checkout bridge attaches this metadata to the Checkout Session
and subscription data. Manual Stripe Dashboard test objects should only be used
when they include the same SaaS billing domain metadata and a real company id.

## Local Test-Mode Webhook Setup

1. Confirm local app env names are configured with Stripe test-mode values.
   If both the platform billing settings price reference and
   `STRIPE_FOUNDER_PLAN_PRICE_ID` are missing, stop before creating Checkout
   Sessions. If `STRIPE_WEBHOOK_SECRET` is blank, stop before forwarding events.
2. If the price reference is missing and `STRIPE_SECRET_KEY` is clearly
   `sk_test_`, use `/super-admin/billing` to create or discover the test
   founder Product and recurring Price. Store only the non-secret references in
   the app. If the key is live or unknown, leave the action blocked and fix env.
3. Start the app locally.
4. Start Stripe CLI forwarding in a separate terminal:

```bash
stripe listen --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed --forward-to localhost:3000/api/stripe/saas-billing-webhook
```

5. Copy only the signing secret into `STRIPE_WEBHOOK_SECRET` in the local env
   source of truth. Do not paste it into tickets or chat.
6. Restart the app so the env value is loaded.
7. Use contractor owner/admin auth on `/setup/billing` only when test-mode
   checkout is explicitly safe. Do not use live keys.
8. After checkout returns, use platform-admin auth on `/super-admin/billing` to
   confirm Stripe SaaS billing references/status appear separately from manual
   founder billing evidence.
9. Confirm tenant activation remains manual. The webhook must not mark the
   company active.

Do not print Checkout Session URLs. Do not print raw webhook payloads. Do not
click live Checkout.

## Stripe Dashboard Endpoint Setup

For test-mode Dashboard endpoint verification:

1. Create a test-mode webhook endpoint in Stripe Workbench.
2. Endpoint URL should be the deployed app URL plus:

```text
/api/stripe/saas-billing-webhook
```

3. Select only the supported SaaS billing events listed above.
4. Store the endpoint signing secret in `STRIPE_WEBHOOK_SECRET` for the matching
   environment.
5. Keep the contractor invoice payment endpoint separate:

```text
/api/payments/stripe/webhook
```

Do not point SaaS subscription events at the contractor invoice payment webhook.

## Test-Mode Replay

Safe replay options:

- Prefer the app-created Checkout test flow when the operator has confirmed
  test keys and either a platform billing settings price reference or
  `STRIPE_FOUNDER_PLAN_PRICE_ID`.
- Use Stripe CLI event forwarding for local route verification.
- Use `stripe trigger <event>` for supported event types only when the generated
  test object can carry or be paired with the required SaaS metadata.
- Use Stripe event resend only for known safe test-mode events that already
  belong to the SaaS billing domain.

Useful command patterns:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

For a previously delivered safe test event, resend to a Dashboard endpoint:

```bash
stripe events resend <event_id> --webhook-endpoint=<endpoint_id>
```

Do not paste event ids that expose customer context into chat. Do not replay
live-mode events until a separate live billing release gate approves it.

## Verification Queries

Inspect schema/state with operator-approved database access. Do not print
customer payment data or secrets.

Confirm migration:

```sql
select version
from supabase_migrations.schema_migrations
where version = '20260513213239';
```

Confirm SaaS idempotency ledger:

```sql
select id, company_id, stripe_event_id, event_type, processing_result, received_at
from public.stripe_saas_billing_webhook_events
order by received_at desc
limit 10;
```

Confirm current SaaS subscription state:

```sql
select company_id, status, lifecycle_state, stripe_customer_id,
       stripe_subscription_id, stripe_price_id, stripe_checkout_session_id,
       current_period_end, stripe_last_event_id,
       stripe_last_webhook_received_at
from public.company_subscriptions
where is_current = true
order by stripe_last_webhook_received_at desc nulls last
limit 10;
```

Confirm activation stayed manual:

```sql
select id, display_name, tenant_status, lifecycle_state, stripe_customer_id
from public.companies
order by created_at desc
limit 10;
```

## Expected Outcomes

- Signed SaaS webhook events with correct metadata update safe Stripe references
  and subscription status fields.
- Duplicate Stripe event ids return success without duplicate ledger writes.
- Wrong-domain events are ignored.
- Missing or invalid signatures are rejected.
- Super admin shows Stripe SaaS billing state separately from manual founder
  billing evidence.
- Tenant activation remains a platform-admin decision.

## Recovery Notes

- If `/super-admin/billing` says a key is configured but mode could not be
  verified, replace the local value with the expected test prefix and restart
  the app. Do not attempt Product/Price setup with unknown keys.
- If Product/Price setup is blocked only by missing webhook secret, it is still
  safe to create/discover the test Product/Price when `STRIPE_SECRET_KEY` is
  `sk_test_`; webhook replay remains blocked until `STRIPE_WEBHOOK_SECRET` is
  configured and the app is restarted.
- If signature verification fails, confirm the route uses the raw request body
  and the endpoint secret matches the source of the event.
- If events are ignored, confirm metadata includes
  `billing_domain=floorconnector_saas`, `company_id`, and the expected
  `environment`.
- If a duplicate event is replayed, inspect
  `stripe_saas_billing_webhook_events` before retrying.
- If the webhook cannot write state, verify migration `20260513213239` is
  applied and the ledger table exists.
- If a tenant was activated unexpectedly, stop testing and inspect platform
  admin actions first; the SaaS webhook is not supposed to activate tenants.

## What Not To Do

- Do not use live Stripe keys for local QA.
- Do not create live charges, live subscriptions, live customers, or live
  payment links during closeout.
- Do not point SaaS billing events at `/api/payments/stripe/webhook`.
- Do not store raw webhook payloads, card details, signing secrets, Stripe keys,
  or Checkout URLs.
- Do not auto-activate tenants from provider events.
- Do not mutate contractor-customer invoices, payments, portal payments, or
  `payment_events` from SaaS billing reconciliation.
