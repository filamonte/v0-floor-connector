# SaaS Billing Live Launch Plan

Status: Planning / policy draft
Doc Type: Implementation Plan

This plan defines the policy, entitlement map, Customer Portal boundaries, support playbooks, release gates, and next implementation slices required before FloorConnector SaaS billing can move from proven test-mode billing into live billing controls.

This is not a live billing implementation. It does not create live Stripe resources, live charges, Customer Portal sessions, automatic activation, package assignment, entitlement enforcement, contractor-customer payment changes, portal payment changes, RLS changes, tenant-isolation changes, signature changes, invoice state changes, or fake subscription state.

Use with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md)
- [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)

## Stripe References Reviewed

Use official Stripe documentation as the external source of truth when this plan becomes implementation work:

- [Stripe API keys](https://docs.stripe.com/keys): test and live mode keys are separate; live keys must be configured only for approved production work.
- [Stripe Products](https://docs.stripe.com/api/products) and [Stripe Prices](https://docs.stripe.com/api/prices): recurring SaaS billing must use live-mode Product/Price references that are separate from test-mode proof resources.
- [Build subscriptions](https://docs.stripe.com/billing/subscriptions/build-subscriptions): subscription provisioning must be webhook-backed; do not rely on Checkout return URLs as proof of paid access.
- [Subscription statuses](https://docs.stripe.com/billing/subscriptions/overview#subscription-statuses): `incomplete`, `trialing`, `active`, `past_due`, `canceled`, `unpaid`, and `paused` need explicit FloorConnector policy before enforcement.
- [Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal): Portal sessions should be created server-side for the SaaS Stripe Customer only after Portal boundaries are approved.
- [Webhooks](https://docs.stripe.com/webhooks): webhook endpoints, signing secrets, retries, idempotency, and event-mode separation must be treated as production release gates.
- [Smart Retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries): dunning behavior depends on Stripe retry settings and the configured final action after retries are exhausted.
- [Cancel subscriptions](https://docs.stripe.com/billing/subscriptions/cancel): cancellation timing and post-cancel access must be an app policy, not an accidental provider default.

## Current Proven Baseline

Implemented and proven in test mode:

- Billing Operations exists at `/super-admin/billing`.
- Billing Operations can create or discover a test-mode Stripe Product and recurring Price.
- `platform_billing_settings` stores non-secret SaaS billing Product/Price references.
- `/setup/billing` can start FloorConnector SaaS subscription Checkout from the platform price reference when test-mode prerequisites are configured.
- `/api/stripe/saas-billing-webhook` verifies signed SaaS-only Stripe events and records processed ids in `stripe_saas_billing_webhook_events`.
- Signed Stripe test-mode Checkout, subscription, and invoice events reconciled a current `company_subscriptions` row.
- Tenant activation remained manual: the tested tenant stayed `tenant_status = trialing` and `lifecycle_state = trial`.
- Contractor-customer `payments` and `payment_events` remained unchanged.
- Signed wrong-domain events were ignored.
- SaaS billing and contractor-customer invoice payments remain separate Stripe domains.

Implemented code baselines to preserve:

- `/super-admin/billing` is the durable Billing Operations console and currently exposes names-only config health, test-mode Product/Price setup, Checkout/webhook readiness, tenant SaaS subscription references, manual billing evidence, and activation separation.
- `/super-admin/early-access` owns founder setup/readiness review, manual founder billing evidence, and manual activation. It is not the long-term billing command center.
- `/setup/billing` keeps no-charge card setup and FloorConnector SaaS subscription Checkout as separate lanes, with activation copy remaining review-oriented.
- SaaS Checkout is server-side, subscription-mode, metadata-backed, owner/admin gated, and uses the FloorConnector SaaS billing domain.
- SaaS webhooks verify signatures, filter by SaaS metadata/domain/environment, record processed event ids, update safe subscription references/status, and do not auto-activate tenants.
- The activation guard already protects irreversible external actions using `companies.tenant_status` and `companies.lifecycle_state`.
- Current module/feature settings are not billing entitlements and must not become a hidden entitlement model.
- Contractor-customer Stripe payments remain on the separate invoice-payment endpoint and canonical payment rows.

Still not implemented:

- live Stripe Product/Price setup controls
- production webhook endpoint setup inside Stripe Dashboard
- automatic activation
- runtime entitlement enforcement
- Stripe Customer Portal
- dunning, cancellation, refund, rollback, and support workflows
- live launch checklist gating

## Live Billing Policy Decision Map

Recommended launch policy:

- A tenant can be billed only after a platform operator has selected the tenant, confirmed production terms, confirmed the live Product/Price, confirmed the live webhook endpoint, and confirmed support ownership.
- A tenant can be activated only by a platform admin through an explicit manual activation action.
- Payment success, subscription success, Checkout return, `invoice.paid`, `customer.subscription.updated`, or any other Stripe event must not auto-activate tenants in the next live phase.
- Billing status should inform activation and support decisions, not replace them.
- Initial billing-state enforcement should gate only irreversible external-production actions, matching the current activation-guard shape: estimate send, contract send-for-signature, portal/customer payment checkout, and provider-backed external email delivery.
- Internal drafting should remain available for no-subscription, trialing, active, past-due, unpaid, canceled, incomplete, incomplete-expired, paused, manual founder evidence, waived, internal, and demo states unless a future approved policy narrows it.
- Manual founder billing evidence may coexist with Stripe subscription references, but it remains operator evidence only. It is not provider truth, entitlement truth, activation truth, or payment detail storage.
- Trial, pending, and suspended companies keep using `companies.tenant_status` and `companies.lifecycle_state`; no duplicate activation model should be introduced.
- `past_due` should create a support queue and keep internal drafting available during a defined grace period. External-production actions should remain active during the grace period only if the platform approves that policy.
- `unpaid`, `canceled`, and `incomplete_expired` should block irreversible external-production actions until an operator resolves billing, waives the tenant, or reactivates a valid subscription path.
- Grace periods must be explicit before launch. Recommended default: one short operator-reviewed grace period for `past_due`, no automatic grace for `unpaid` or `canceled`.
- Billing failures should route to a platform-admin support playbook before customer-facing lockout copy expands.
- Subscription status should not limit internal drafting by itself in the first entitlement slice.
- Subscription status may become a prerequisite for irreversible external-production actions only through an explicit server-side entitlement helper.
- Manual founder evidence, waivers, internal/demo status, and Stripe subscription state must be visible as separate evidence sources until a future policy defines precedence.

Open policy questions:

- What is the exact `past_due` grace period: none, 3 days, 7 days, or Stripe retry-window aligned?
- Should `past_due` block new external sends immediately, or only after the grace period?
- Should already-scheduled jobs stay visible/executable if SaaS billing becomes `unpaid`?
- Who besides platform admins may grant a waiver, and should waiver require a reason plus expiration?
- Should waiver scope be action-specific, tenant-wide, or both?
- Which support role owns customer contact for billing failures before a broader support console exists?
- What public terms, privacy, cancellation, refund, and billing-support copy must be published before the first live founder charge?
- Should first live tenants use manual founder evidence plus Dashboard-created Stripe subscriptions, or app-created live Checkout only after live controls are built?

## Entitlement Mapping Plan

Initial entitlement principle: do not block internal contractor work immediately for billing state. Gate irreversible external-production actions first, similar to the existing early-access activation guard.

Important distinction: the table below is a policy plan, not implemented runtime behavior. Future enforcement should evaluate billing state and the existing activation guard together.

| Billing state | Internal drafting | Portal access | Estimate send | Contract send-for-signature | Portal checkout/customer payments | Provider-backed email | Scheduling | Data export | Super-admin override |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no subscription | Allowed | Allowed for existing grants | Block until activated and entitled or waived | Block until activated and entitled or waived | Block until activated and entitled or waived | Block until activated and entitled or waived | Allowed if readiness passes | Allowed | Yes |
| trialing | Allowed | Allowed | Allowed only if tenant is manually activated and trial entitlement is approved | Allowed only if tenant is manually activated and trial entitlement is approved | Allowed only if tenant is manually activated and trial entitlement is approved | Allowed only if tenant is manually activated and trial entitlement is approved | Allowed if readiness passes | Allowed | Yes |
| active | Allowed | Allowed | Allowed if activation guard and entitlement helper pass | Allowed if activation guard and entitlement helper pass | Allowed if activation guard and entitlement helper pass | Allowed if activation guard and entitlement helper pass | Allowed if readiness passes | Allowed | Yes |
| past_due | Allowed | Allowed | Open: allow during grace or block after grace | Open: allow during grace or block after grace | Open: allow during grace or block after grace | Open: allow during grace or block after grace | Allowed if readiness passes | Allowed | Yes |
| unpaid | Allowed | Allowed read/review | Block | Block | Block | Block | Allowed for internal planning; no external dispatch messages | Allowed | Yes |
| canceled | Allowed | Allowed read/review | Block unless manually waived | Block unless manually waived | Block unless manually waived | Block unless manually waived | Allowed for internal planning; no external dispatch messages | Allowed | Yes |
| incomplete | Allowed | Allowed read/review | Block | Block | Block | Block | Allowed for internal planning | Allowed | Yes |
| incomplete_expired | Allowed | Allowed read/review | Block | Block | Block | Block | Allowed for internal planning | Allowed | Yes |
| paused | Allowed | Allowed read/review | Block unless manually waived | Block unless manually waived | Block unless manually waived | Block unless manually waived | Allowed for internal planning | Allowed | Yes |
| manual founder evidence | Allowed | Allowed | Allowed only after manual activation and evidence policy approval or waiver | Allowed only after manual activation and evidence policy approval or waiver | Allowed only after manual activation and evidence policy approval or waiver | Allowed only after manual activation and evidence policy approval or waiver | Allowed if readiness passes | Allowed | Yes |
| waived/internal/demo account | Allowed | Allowed | Allowed according to waiver scope | Allowed according to waiver scope | Allowed according to waiver scope | Allowed according to waiver scope | Allowed if readiness passes | Allowed | Yes |

Implementation shape for a future slice:

- Add a shared server-side entitlement helper that consumes `companies`, current `company_subscriptions`, manual founder evidence, and future waiver records.
- Return a clear decision object per action: allowed, blocked, warning-only, source, reason, support message, and override evidence.
- Keep the helper separate from package definitions and read-only package assignment foundations until an explicit package-assignment lifecycle is implemented.
- Start with the same irreversible-action boundaries the activation guard already protects.
- Add tests proving internal drafting stays allowed while external production actions remain blocked for unsafe billing states.
- Log or expose entitlement decisions with safe reason codes only; never expose payment details, webhook payloads, secrets, or raw provider evidence in contractor-facing UI.

## Stripe Customer Portal Boundaries

Stripe Customer Portal should be for FloorConnector SaaS billing only.

Recommended boundaries:

- Only contractor organization owners/admins can open the SaaS billing Customer Portal.
- Entry point should be contractor settings/billing when that settings surface exists, with `/setup/billing` allowed only during onboarding or pending activation.
- Super admins may view readiness and references, but should not impersonate a tenant into Customer Portal in the first slice.
- Customer Portal must not appear in the customer-facing project portal and must not be labeled in a way that sounds like contractor-customer invoice payment.
- Customer Portal must use the FloorConnector SaaS Stripe Customer associated with the contractor tenant, not contractor-customer invoice payment customers.
- The Customer Portal entry label should say "FloorConnector subscription billing" or equivalent, never "customer payments" or "project payments."
- Allowed first actions: update payment method, view invoices, download invoices/receipts.
- Cancellation may be allowed only after a cancellation policy is approved and webhook handling maps the result back into support review and entitlement decisions.
- Plan changes should remain disabled initially; change-plan UX belongs after package assignment, entitlement mapping, and pricing governance are implemented.

Required webhook events for the first Customer Portal slice:

- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.updated` if billing email/customer details are allowed to change

Open Customer Portal questions:

- Is cancellation immediate or end-of-period?
- Should cancellation require the contractor to contact support during founder access?
- What should the in-app return URL be after Customer Portal exits?
- Should portal invoice history include all SaaS invoices or only the current subscription's invoices?
- Should Customer Portal access require the tenant to be active, or can pending/trialing owners update billing before activation?

## Dunning, Rollback, And Support Playbook

Operator playbook:

- `invoice.payment_failed`: Confirm event is SaaS domain, verify idempotency ledger, update subscription status as `past_due`, open support follow-up, and do not mutate contractor-customer invoice payments.
- `past_due`: Notify operator, check Stripe retry settings, confirm grace-period policy, and decide whether to keep or block external-production actions.
- `unpaid`: Block irreversible external-production actions, keep internal drafting available, contact tenant, and document support decision.
- `canceled`: Block irreversible external-production actions unless a waiver exists, preserve data access, and route reactivation through a new Checkout/subscription or manual support path.
- `disputed`: Not part of first launch. If Stripe dispute events are later added, treat them as support-review evidence and do not auto-lock without an approved dispute policy.
- Webhook failure: Treat as operational incident. Check endpoint health, signature secret, recent Stripe delivery attempts, app logs, and `stripe_saas_billing_webhook_events`. Do not manually insert `company_subscriptions` as a shortcut.
- Duplicate webhook: Expected safe path; confirm duplicate result and no second current subscription row.
- Wrong-domain event: Expected ignore path; confirm no `company_subscriptions`, contractor `payments`, or `payment_events` mutation.
- Stripe outage: Pause live billing operations, keep internal drafting available, do not retry charge creation blindly, and document the outage window in support notes.
- Accidental live/test mismatch: Stop immediately, identify whether a live key, test key, live Price, or test Price was used, disable the mismatched control, and verify no live charges or live subscriptions were created unintentionally.
- Refund/cancel founder customer: Use Stripe Dashboard until app refund/cancel controls are explicitly built; record only non-secret support evidence in FloorConnector.
- Manual override/waiver: Require platform-admin access, operator reason, expiration/review date, affected actions, and audit evidence before any runtime waiver is honored.
- Rollback from live launch: Disable live Checkout entry, remove/disable live price reference from app settings, keep webhook endpoint available to receive late provider events, mark affected tenants for manual review, and preserve all provider references/audit rows.
- Post-rollback review: Confirm no contractor-customer `payments`, `payment_events`, invoice status, signature status, portal access, RLS policy, or tenant isolation behavior changed.

## Production Release Gates

Live billing cannot be enabled until all gates below are true:

- live Stripe secret configured in the production environment
- live publishable key configured in the production environment
- live Product/Price created or copied to live mode and reviewed
- live Price reference stored or otherwise configured for the production app
- production `/api/stripe/saas-billing-webhook` endpoint configured in Stripe Dashboard as a live webhook endpoint
- live webhook signing secret configured for the production endpoint
- supported SaaS billing events selected only for the SaaS endpoint
- contractor-customer payment webhook remains separate
- signed webhook proof completed in staging or production preview with test/sandbox resources before live provider mutation
- test-mode replay proof remains preserved
- activation policy approved
- entitlement policy approved
- Customer Portal policy approved
- dunning/cancellation/support playbook approved
- privacy, terms, billing, cancellation, and support copy updated
- backup and rollback plan approved
- first founder tenant selected by id/name in an operator checklist
- support owner and escalation contact selected
- production monitoring/log-review path identified without exposing secrets or raw provider payloads
- no live Checkout/Customer Portal links exposed until the above is reviewed

## Billing Operations Future Implementation Plan

Phase 1: Live-mode readiness indicators only

- Add live names-only readiness rows to `/super-admin/billing`.
- Show live/test separation, configured live Product/Price reference presence, live webhook endpoint checklist status, Customer Portal policy status, entitlement policy status, support playbook status, and blocked next actions.
- No live Stripe mutations.

Phase 2: Live Product/Price sync/create controls

- Add platform-admin controls only after policy approval.
- Prefer discover/sync first; create live Product/Price only behind explicit confirmation and Stripe live key recognition.
- Store only non-secret references in `platform_billing_settings` or a live-aware successor.

Phase 3: Customer Portal session route

- Add an owner/admin-only server route for FloorConnector SaaS Customer Portal sessions.
- Route only from contractor settings/billing or setup/billing.
- Use SaaS customer reference only and never contractor-customer payment customers.

Phase 4: Entitlement enforcement helper

- Add a shared server-side billing entitlement helper.
- Start by applying it to the same irreversible external-production actions already protected by the activation guard.
- Keep internal drafting allowed by default.

Phase 5: Billing failure/support dashboard

- Add support-review rows or a read model for past_due/unpaid/canceled/webhook-failure states.
- Keep raw provider payloads, secrets, signatures, payment details, and PII out of support summaries.

Phase 6: Manual override/waiver controls

- Add explicit platform-admin waiver controls with reason, expiration, affected actions, and audit evidence.
- Waivers should be reviewed before they become runtime inputs.

Phase 7: Live launch checklist gating

- Add an operator checklist that must be complete before exposing live Checkout/Customer Portal controls.
- Checklist should reference the exact tenant, live price, live webhook endpoint, support owner, and rollback plan.

Each phase should update this plan, [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md), [docs/current-state.md](C:/FloorConnector/docs/current-state.md), and [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md) when the implementation boundary changes.

## Recommended Next Prompt

Implement Phase 1 only: add read-only live-mode readiness indicators to `/super-admin/billing` and update the docs. Do not create live Stripe resources, live charges, Customer Portal sessions, automatic activation, entitlement enforcement, contractor-customer payment changes, portal payment changes, RLS changes, tenant-isolation changes, payment/signature/invoice state changes, or fake subscription state.
