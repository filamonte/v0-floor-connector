# Paid Early Access Plan

Status: Phase 2.5 Billing Operations test plan setup implemented; webhook replay still blocked until test-mode webhook secret is configured; live billing launch deferred
Doc Type: Implementation Plan

This plan prepares Phase 2: Paid Early Access Infrastructure. It documents the current implemented onboarding and billing setup state, the safe next implementation path, and the boundaries that must stay intact before any live billing or activation workflow is released.

Use this with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)
- [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md)

## Current Implemented State

Implemented today:

- public early-access CTAs route users into `/signup?next=/setup/company`
- `/setup/company` updates the existing `companies` organization row and primary `locations` row
- `/setup/billing` is a no-charge billing setup shell
- `/setup/billing` creates or reuses a Stripe customer only when Stripe is configured, creates a SetupIntent, collects a future payment method through Stripe Elements, and stores only safe Stripe references on `companies`
- `/setup/billing` does not create a subscription, charge a card, or store raw card data
- `/setup/billing` also exposes a FloorConnector SaaS founder subscription checkout launcher only when matching Stripe test-mode keys and either an app-managed platform price reference or `STRIPE_FOUNDER_PLAN_PRICE_ID` are configured
- SaaS subscription checkout is server-side, uses Stripe Checkout Sessions in `subscription` mode, attaches `company_id`, `billing_domain=floorconnector_saas`, and environment metadata to the Checkout Session and Subscription, and returns to `/setup/billing`
- `/api/stripe/saas-billing-webhook` verifies the Stripe signature with `STRIPE_WEBHOOK_SECRET`, processes only events marked `billing_domain=floorconnector_saas`, and reconciles subscription references/status onto `companies` / `company_subscriptions`
- SaaS webhook reconciliation covers `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`
- checkout return copy stays pending/review-oriented; webhook-confirmed subscription status may appear in super admin after reconciliation, but it does not activate the tenant, create contractor-customer invoice payments, or change portal payment state
- `/super-admin/billing` is the durable Billing Operations console for SaaS configuration health, founder/default plan reference status, test-mode Product/Price setup, Checkout readiness, webhook health, tenant subscription references, manual evidence, and activation separation
- `/setup/pending-activation` displays the existing `companies.tenant_status` and `companies.lifecycle_state`
- pending and trial organizations can enter the contractor app and create canonical records, but irreversible external actions remain guarded
- the activation guard blocks external sends, provider-backed email delivery, and portal checkout/payment processing for pending or trial organizations
- `/super-admin/early-access` gives platform admins a minimal read/activation surface over existing company lifecycle fields and canonical workflow counts
- `/super-admin/early-access` now groups tenants into operator buckets for pending setup, pending activation, active founder access, and suspended/blocked state without adding a duplicate activation model
- `/super-admin/early-access` shows honest billing setup labels based on saved SetupIntent payment-method references only; it does not imply paid subscription status
- `/super-admin/early-access` links to `/super-admin/billing` and remains focused on founder readiness, workflow progress, and manual activation decisions rather than owning the long-term billing operating model
- `/super-admin/early-access` now lets platform admins record founder billing evidence on the canonical `companies` row:
  - founder plan label
  - expected monthly amount
  - evidence status
  - collection method
  - external reference
  - evidence received timestamp
  - follow-up timestamp
  - platform-only notes
- founder billing evidence is manual/operator-entered only; it does not charge a card, activate a tenant, or verify provider state
- `/super-admin/early-access` displays stored Stripe customer/subscription/status references separately from manual founder evidence and activation controls
- `/super-admin/packages` and related package/provider routes are read-only governance and inspection surfaces only

Latest local SaaS billing QA result:

- 2026-05-14 names-only env check found `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` present but mode-unknown from local value format, no app-managed platform billing price reference, `STRIPE_FOUNDER_PLAN_PRICE_ID` missing, and `STRIPE_WEBHOOK_SECRET` missing
- because that configuration cannot safely prove test-mode Product/Price setup, subscription Checkout, Checkout completion, or signed webhook replay, no Product/Price action, Checkout Session, Stripe CLI forwarding, or webhook replay was run
- Billing Operations can create or discover the test-mode FloorConnector SaaS Product and recurring Price only after `STRIPE_SECRET_KEY` is clearly test-mode from the `sk_test_` prefix, then store only non-secret references in `platform_billing_settings`
- SaaS billing unit coverage and manual fallback QA remain the current proof until an operator configures the missing test-mode names and reruns [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md)

Partially implemented:

- platform-admin activation exists as an explicit manual action over `companies.tenant_status` and `companies.lifecycle_state`
- Billing Operations can report existing billing readiness/status and next actions, and can create/discover a test-mode Stripe SaaS Product/recurring Price with a test-mode key; it cannot create live Stripe resources, create Checkout sessions from super admin, write env files, create customers/subscriptions/payment links, or activate tenants
- early-access feedback is captured through existing `workflow_error_events` rows; founder billing notes/follow-up are implemented only for billing evidence and are not a general tenant CRM notes system
- package and provider governance has read-only inspection foundations, but assignment activation, entitlement enforcement, and provider reconciliation workflows are not implemented

Not implemented today:

- live paid subscription creation
- Stripe customer portal for FloorConnector subscription management
- automatic activation after payment
- entitlement or module enforcement
- contractor-facing plan change flows
- package assignment activation workflows
- provider reconciliation mutation or corrective actions
- live billing runbooks or production release gates

## Phase 2 Current-State Audit

Implemented today:

- real company onboarding uses existing `companies` and `locations`
- no-charge billing setup uses Stripe SetupIntent and stores only safe references on `companies`
- pending activation lets founder users enter the real contractor app while external production actions remain locked
- platform admins can review early-access tenant operating state from canonical records in `/super-admin/early-access`
- platform admins can record manual founder billing evidence on `companies` without changing activation state
- activation remains a human platform-admin action and does not create billing provider resources

Partially implemented:

- billing readiness can identify saved payment-method references, but it cannot prove paid subscription state
- founder billing follow-up can be recorded on `companies`; broader tenant success notes remain future work
- package/provider governance can inspect current records and future mapping readiness, but cannot mutate packages, assignments, subscriptions, or entitlements

Not implemented:

- live app-created Stripe Billing subscriptions
- public/live webhook release runbook and rollback gates
- app-created Stripe Payment Links or SaaS invoices
- automatic tenant activation from payment or SetupIntent state
- cancellation, past-due, renewal, dunning, or entitlement mapping
- public self-serve launch or uncontrolled paid signup

Recommended Phase 2 implementation choices:

- keep activation on the existing company lifecycle fields
- use `/super-admin/billing` as the durable operator cockpit for SaaS billing readiness, subscription references, webhook health, and manual billing evidence
- use `/super-admin/early-access` for founder setup, activation, feedback, and follow-up triage
- treat saved payment-method references as "billing setup known" only
- treat founder billing evidence as platform-admin manual evidence on `companies`; do not treat it as subscription truth
- use manual founder invoices/payment links outside the app for the first controlled cohort unless the test-mode Stripe Billing bridge is explicitly configured and reviewed

Deferred future billing/subscription choices:

- live Stripe Billing Checkout Session creation
- Stripe Customer Portal setup and self-service subscription management
- webhook signature verification, idempotent event storage, and provider-event reconciliation
- subscription lifecycle mapping to package assignment, entitlement, cancellation, past-due, and rollback behavior
- platform-admin billing runbook and release gates before any live provider mutation

## Phase 2 Objective

Phase 2 should convert early access from "safe setup and manual activation" into a controlled paid-access path without weakening the contractor app architecture.

The recommended Phase 2 path is:

1. keep `/setup/company`, `/setup/billing`, and `/setup/pending-activation` as the contractor onboarding spine
2. decide whether the first paid cohort uses manual founder invoices/payment links or Stripe Billing subscriptions
3. keep platform-admin activation explicit and human-confirmed until webhook, reconciliation, and rollback behavior are proven
4. use existing `companies.tenant_status` and `companies.lifecycle_state` for activation status
5. store provider identifiers only where the existing package/billing governance model expects them
6. keep all Stripe/provider calls server-side and never expose secret keys or raw provider payloads to the browser

## Billing Strategy Options

### Option A: Manual Founder Invoice Or Payment Link

This is the lowest-risk first paid cohort path.

Use when:

- early-access sales volume is low
- pricing is still founder-led or custom
- the team wants manual review before activating each tenant
- Stripe subscription automation is not ready for production release

Expected behavior:

- platform operator collects payment outside the app through a controlled Stripe dashboard invoice or Payment Link
- operator records only non-secret evidence and activates the tenant through `/super-admin/early-access`
- no app-side subscription creation, cancellation, renewal, webhook provisioning, or entitlement enforcement is added yet

Current manual evidence workflow:

1. Platform operator arranges founder billing outside the app, such as a Stripe Dashboard invoice or Payment Link.
2. Operator records non-secret evidence on `/super-admin/early-access`.
3. Operator may set the founder plan label, expected monthly amount, collection method, external reference, evidence timestamp, follow-up timestamp, and notes.
4. Operator separately decides whether to mark the tenant active.
5. Activation remains a distinct platform-admin action over `companies.tenant_status` and `companies.lifecycle_state`.

Do not store raw card data, API keys, webhook payloads, provider secrets, or customer payment details in founder billing evidence fields.

### Option B: Stripe Billing Subscription

This is the intended scalable SaaS billing path, but it needs stronger release gates.

Use when:

- product/price definitions are settled enough for repeatable plans
- webhooks are verified in test mode
- subscription status and package assignment mapping have audit evidence
- activation and rollback steps are documented

Expected behavior:

- server-side code creates Stripe Checkout Sessions in subscription mode from configured Stripe Prices
- webhook handling verifies signatures and records provider events before activation decisions
- provider ids are stored as references, not business truth
- package assignment, lifecycle state, and entitlements are reconciled through explicit server-side workflows
- failed, incomplete, canceled, trialing, active, and past-due states are represented without mutating canonical contractor workflow records incorrectly

## Required Environment Variable Names

Existing setup/billing env names:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_FOUNDER_PLAN_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET` for signed SaaS billing webhook verification and existing Stripe payment webhook verification
- `STRIPE_CONNECT_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_BASE`

Existing early-access env name:

- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`

Portal/customer QA env names remain documented in [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md).

Do not print env values in logs, docs, tests, or final reports.

## Phase 2 Implementation Map

Recommended first Phase 2 slice:

- keep the paid-access readiness checklist and founder billing evidence in the super-admin workflow
- keep the existing `/setup/billing` SetupIntent behavior unchanged unless the paid strategy explicitly changes it
- add explicit Phase 2 operator runbook docs for founder activation
- add tests proving pending/trial activation guards still block irreversible external sends and portal checkout
- verify `/super-admin/early-access` activation still uses existing `companies.tenant_status` and `companies.lifecycle_state`
- verify `/super-admin/packages` remains read-only unless a dedicated package-assignment mutation phase is approved

Recommended second Phase 2 slice, only after strategy approval:

- if using Stripe Billing subscriptions, implement server-side Checkout Session creation with configured Price ids, webhook verification, idempotent event handling, and no automatic activation until the release gate says so

Implemented Phase 2.2 slice:

- server-side `/api/stripe/create-saas-subscription-checkout` creates Stripe Checkout Sessions in `subscription` mode only when Stripe is configured in test mode and `STRIPE_FOUNDER_PLAN_PRICE_ID` is present
- checkout requires the authenticated contractor organization's owner/admin role and uses the active organization context
- checkout reuses or creates the Stripe customer reference stored on `companies.stripe_customer_id`
- checkout metadata marks the billing domain as FloorConnector SaaS through `billing_domain=floorconnector_saas`
- subscription checkout is separated from contractor-customer invoice payments and does not call the portal/customer payment route
- `/setup/billing` shows subscription checkout as a separate founder SaaS billing bridge beside the no-charge SetupIntent card setup
- `/super-admin/early-access` shows stored Stripe customer/subscription/status references separately from founder billing evidence
- no webhook subscription-status mutation is implemented in this slice

Implemented Phase 2.3 slice:

- `/api/stripe/saas-billing-webhook` is a separate signed webhook route from the contractor-customer invoice payment webhook route
- the route reads the raw request body, verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`, and rejects unsigned or invalid events before parsing trusted state
- the SaaS webhook core ignores events without `billing_domain=floorconnector_saas`, without a valid `company_id`, or with a mismatched environment marker
- subscription state reconciliation updates existing safe Stripe references on `companies` and `company_subscriptions`, including subscription status, subscription id, price id, checkout session id, current period end, last event id, and last webhook time
- processed event ids are recorded in the SaaS-only `stripe_saas_billing_webhook_events` idempotency ledger without storing raw provider payloads, signatures, secrets, card data, or customer payment details
- `invoice.paid` and `invoice.payment_failed` are treated as SaaS billing status signals only; they do not create or update canonical contractor invoice payments or `payment_events`
- platform-admin activation remains separate and manual
- [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md) now documents test-mode endpoint setup, Stripe CLI forwarding/replay command patterns, metadata requirements, schema/state inspection queries, and recovery boundaries for the SaaS webhook domain

Implemented Phase 2.4 slice:

- `/super-admin/billing` provides a platform-admin-only Billing Operations home that is not framed around early access
- the console shows names-only Stripe SaaS configuration health for `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_FOUNDER_PLAN_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET`
- the console reports Checkout readiness, webhook endpoint status, supported SaaS webhook events, tenant subscription references/status, current period end, last webhook reference/time, and manual activation next actions
- the console keeps manual founder billing evidence separate from Stripe webhook status and tenant activation
- the console links operators back to the tenant-facing `/setup/billing` path but does not create Checkout sessions from super admin
- `/super-admin/early-access` now points to Billing Operations for durable billing work while staying focused on founder readiness and manual activation
- no schema, Stripe resource creation, live charge, provider mutation, automatic activation, contractor-customer payment behavior, portal payment behavior, RLS, or tenant-isolation behavior changed

Implemented Phase 2.5 slice:

- `platform_billing_settings` stores platform-admin-controlled non-secret SaaS billing settings, including plan label, Stripe Product id, Stripe Price id, currency, amount, interval, mode, and sync timestamps
- RLS is enabled and forced on `platform_billing_settings`, broad `public` / `anon` / `authenticated` grants are revoked, and the app uses server-side platform-admin/service-role access only
- `/super-admin/billing` can create or discover the FloorConnector Founder Access test-mode Product and recurring Price only when `STRIPE_SECRET_KEY` is safely identified as test-mode from the `sk_test_` prefix; unknown or live-mode keys keep the action blocked
- the Product/Price setup action attaches `billing_domain=floorconnector_saas`, `environment=test`, and `managed_by=floorconnector` metadata and uses idempotency keys for POST retries
- the action does not create live Stripe resources, customers, subscriptions, Checkout Sessions, payment links, invoices, webhook endpoints, charges, tenant activation, contractor-customer invoice payments, portal payment state, package assignments, or entitlements
- SaaS Checkout now prefers `platform_billing_settings.stripe_price_id` and falls back to `STRIPE_FOUNDER_PLAN_PRICE_ID` for compatibility
- `/setup/billing` reports whether the SaaS plan reference is managed by Billing Operations, configured by env, or unavailable

## Production Readiness Gates

Before live paid access:

- test-mode Stripe keys are configured and verified locally
- local test-mode recovery uses `sk_test_` for `STRIPE_SECRET_KEY` and `pk_test_` for `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; any other configured prefix remains unknown/operator-review
- either `platform_billing_settings.stripe_price_id` or `STRIPE_FOUNDER_PLAN_PRICE_ID` is configured before Checkout creation
- the matching test-mode `STRIPE_WEBHOOK_SECRET` is configured before webhook replay
- live keys are never used in local QA
- webhook signature verification is covered
- no test attempts create live charges
- no subscription, invoice, payment, customer, Checkout, Payment Link, or live provider state is mutated without an explicit app workflow and release gate
- no service-role key or Stripe secret reaches the browser
- pending/trial activation guards are covered by tests
- platform-admin activation requires an explicit human action
- manual rollback and support escalation steps are documented
- portal payment smoke still stops before irreversible checkout during QA unless an existing safe test-mode payment spec explicitly covers completion

Future Stripe Billing bridge plan:

- keep using Stripe Checkout Sessions in subscription mode with configured Stripe Price ids
- use Stripe Customer Portal for self-service subscription management only after the Billing bridge is approved
- store Stripe ids as references and reconcile them through server-side workflows
- verify webhook signatures and idempotently store provider events before any lifecycle decision
- map future subscription statuses such as `trialing`, `active`, `past_due`, `canceled`, and `unpaid` into explicit internal review states
- consider webhook events such as `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`
- do not auto-activate tenants from provider events until a separate release gate approves that behavior

## Non-Negotiable Boundaries

Paid early access must not:

- create a duplicate tenant activation model
- create a duplicate subscription, invoice, payment, or customer model
- treat Stripe as the source of truth for contractor workflow records
- auto-send customer communications
- auto-activate tenants without a documented release gate
- weaken tenant isolation, RLS, portal grants, signature history, or payment audit behavior
- bypass the canonical lifecycle: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- expose secret values, provider raw payloads, or service-role credentials

## Current Decision

This Phase 2.3 batch implements a test-mode-safe signed Stripe webhook reconciliation bridge for FloorConnector SaaS subscriptions. It does not implement automatic activation, entitlement enforcement, Stripe Customer Portal, public live billing launch, refunds, disputes, cancellation self-service, or package/module gating. Manual founder billing evidence and platform-admin activation remain separate controls.

Enterprise UX consolidation note: the customer/contact/access/review cleanup does not change paid early-access billing, Stripe setup, checkout, tenant activation, entitlement, webhook, or portal payment behavior. Portal invoice copy may become simpler for customers, but the checkout and activation guards above remain unchanged.

The recommended next prompt is either a Stripe SaaS Billing live test-mode replay slice using the runbook above, or a return to product data hygiene through lead/customer primary contact normalization. Any live billing launch, activation automation, entitlement enforcement, or Stripe Customer Portal work still requires a separate approved release gate.
