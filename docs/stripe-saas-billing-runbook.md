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
2. Start the app locally.
3. Start Stripe CLI forwarding in a separate terminal:

```bash
stripe listen --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed --forward-to localhost:3000/api/stripe/saas-billing-webhook
```

4. Copy only the signing secret into `STRIPE_WEBHOOK_SECRET` in the local env
   source of truth. Do not paste it into tickets or chat.
5. Restart the app so the env value is loaded.
6. Use contractor owner/admin auth on `/setup/billing` only when test-mode
   checkout is explicitly safe. Do not use live keys.
7. After checkout returns, use platform-admin auth on `/super-admin/early-access`
   to confirm Stripe SaaS billing references/status appear separately from
   manual founder billing evidence.
8. Confirm tenant activation remains manual. The webhook must not mark the
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
  test keys and `STRIPE_FOUNDER_PLAN_PRICE_ID`.
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
