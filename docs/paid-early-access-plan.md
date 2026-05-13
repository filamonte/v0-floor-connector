# Paid Early Access Plan

Status: Phase 2.2 test-mode Stripe Billing checkout foundation implemented; live billing deferred
Doc Type: Implementation Plan

This plan prepares Phase 2: Paid Early Access Infrastructure. It documents the current implemented onboarding and billing setup state, the safe next implementation path, and the boundaries that must stay intact before any live billing or activation workflow is released.

Use this with:
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)

## Current Implemented State

Implemented today:
- public early-access CTAs route users into `/signup?next=/setup/company`
- `/setup/company` updates the existing `companies` organization row and primary `locations` row
- `/setup/billing` is a no-charge billing setup shell
- `/setup/billing` creates or reuses a Stripe customer only when Stripe is configured, creates a SetupIntent, collects a future payment method through Stripe Elements, and stores only safe Stripe references on `companies`
- `/setup/billing` does not create a subscription, charge a card, or store raw card data
- `/setup/billing` also exposes a FloorConnector SaaS founder subscription checkout launcher only when matching Stripe test-mode keys and `STRIPE_FOUNDER_PLAN_PRICE_ID` are configured
- SaaS subscription checkout is server-side, uses Stripe Checkout Sessions in `subscription` mode, attaches `company_id`, `billing_domain=floorconnector_saas`, and environment metadata to the Checkout Session and Subscription, and returns to `/setup/billing`
- checkout return copy stays pending/review-oriented; it does not activate the tenant, create contractor-customer invoice payments, or claim webhook-confirmed subscription truth
- `/setup/pending-activation` displays the existing `companies.tenant_status` and `companies.lifecycle_state`
- pending and trial organizations can enter the contractor app and create canonical records, but irreversible external actions remain guarded
- the activation guard blocks external sends, provider-backed email delivery, and portal checkout/payment processing for pending or trial organizations
- `/super-admin/early-access` gives platform admins a minimal read/activation surface over existing company lifecycle fields and canonical workflow counts
- `/super-admin/early-access` now groups tenants into operator buckets for pending setup, pending activation, active founder access, and suspended/blocked state without adding a duplicate activation model
- `/super-admin/early-access` shows honest billing setup labels based on saved SetupIntent payment-method references only; it does not imply paid subscription status
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

Partially implemented:
- platform-admin activation exists as an explicit manual action over `companies.tenant_status` and `companies.lifecycle_state`
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
- webhook-confirmed Stripe subscription reconciliation
- app-created Stripe Payment Links or SaaS invoices
- automatic tenant activation from payment or SetupIntent state
- cancellation, past-due, renewal, dunning, or entitlement mapping
- public self-serve launch or uncontrolled paid signup

Recommended Phase 2 implementation choices:
- keep activation on the existing company lifecycle fields
- use `/super-admin/early-access` as the operator cockpit for founder setup, activation, feedback, and follow-up triage
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
- `STRIPE_WEBHOOK_SECRET`
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

## Production Readiness Gates

Before live paid access:
- test-mode Stripe keys are configured and verified locally
- live keys are never used in local QA
- webhook signature verification is covered
- no test attempts create live charges
- no subscription, invoice, or payment provider state is mutated without an explicit app workflow
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

This Phase 2.2 batch implements a test-mode-only Stripe Billing Checkout Session bridge for FloorConnector SaaS subscriptions. It does not implement live billing, automatic activation, entitlement enforcement, Stripe Customer Portal, or webhook-confirmed subscription reconciliation. Manual founder billing evidence and platform-admin activation remain separate controls.

The recommended next prompt is Phase 2.3: implement signed Stripe webhook handling for the `floorconnector_saas` billing domain, idempotently map subscription status into existing subscription references, and keep activation manual until a separate release gate approves automation.
