# Customer Contact Portal Access Implementation Plan

Status: Phase A implemented, stored permission phases implemented, and customer-level cleanup guidance implemented. Later invoice/payment and broader enforcement phases still planned.

This document defines the safest next implementation phase for customer-contact portal access in FloorConnector after customer contacts became manageable on customer detail and visible in `/directory`.

Current cleanup pass:
- no schema changes
- no automatic grant migration
- no customer-level grant revocation or alteration
- no estimate send-recipient changes
- no `portal_project_access` behavior changes
- no invoice/payment behavior changes

Cross-reference:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/directory-contact-model-plan.md](C:/FloorConnector/docs/directory-contact-model-plan.md)
- [docs/customer-contacts-portal-permissions-plan.md](C:/FloorConnector/docs/customer-contacts-portal-permissions-plan.md)

## Purpose

FloorConnector already has the right foundation pieces:
- canonical `customers`
- canonical `contacts`
- `customer_contacts` relationship rows
- customer-scoped `portal_access_grants`
- project-scoped `portal_project_access`
- portal review flows on canonical estimates, contracts, change orders, invoices, and payments

What it does not yet have is a safe way to say:
- which related customer contact a portal login represents
- which customer-facing actions that contact may take
- when a main contact changed another contact's authority
- when a contractor admin overrode customer-managed authority

The next implementation phase should add that missing layer without:
- duplicating customers
- creating portal-only customer copies
- weakening customer/project scope
- changing lineage on contracts, estimates, change orders, invoices, or payments
- breaking existing customer-level portal access

## 1. Current Implemented Foundation

### Customer contacts

Implemented today:
- `contacts` is the canonical organization-scoped contact identity layer
- `customer_contacts` links canonical customers to shared contacts
- `customer_contacts.is_primary` is the main-contact flag
- customer detail already manages those linked contacts
- `/directory` already shows those linked contacts read-only under the parent customer account

Current guardrail:
- `customers.email` still remains the account-level estimate, contract, and invoice recipient source of truth

### Portal access grants

Implemented today:
- `portal_access_grants` is customer-scoped and user-scoped
- grant statuses are `invited`, `active`, and `revoked`
- `portal_project_access` sits beneath a grant and explicitly scopes project visibility
- project access is validated to stay inside the same canonical customer
- customer detail already manages raw portal grants and grant-to-project visibility

Current guardrail:
- grants are tied to authenticated `users`, not to `customer_contacts`

### Portal user lookup

Implemented today:
- portal access creation resolves users by email through `lookup_portal_user_by_email`
- grant creation currently requires the email to already belong to an authenticated FloorConnector user
- no real invite-delivery flow exists yet

### Portal action behavior

Implemented today:
- estimate portal access checks active customer grant + active project access
- change-order portal access checks active customer grant + active project access
- invoice payment request and checkout checks active customer grant + active project access
- contract portal access checks active customer grant + active project access
- contract signing then adds signer assignment through `contract_signers.portal_user_id`

Current practical result:
- today the model is mostly "project-visible means action-capable"
- contracts are the only portal workflow with an extra assignment gate

## 2. Audit Summary

The live system already has the correct outer access model:
1. authenticated user
2. active customer grant
3. active project visibility
4. canonical record action

The missing layer is contact-specific authority inside that already-valid outer scope.

That means the safest extension is:
- keep the current grant and project-scope model intact
- add contact identity to the grant
- add a separate small permission layer for actions

The unsafe alternative would be:
- overloading `customers`
- turning `customer_contacts` into the full portal grant record
- or stuffing action permissions directly into every workflow table

Those would blur identity, scope, and action authority in ways that are harder to audit and migrate.

## 3. Recommended Data Model Approach

### 3.1 Keep the existing canonical anchor

Do not replace:
- `customers`
- `contacts`
- `customer_contacts`
- `portal_access_grants`
- `portal_project_access`

Keep responsibilities separate:
- `customers`: canonical account, billing, and downstream workflow continuity
- `contacts`: person/contact identity
- `customer_contacts`: relationship and main-contact governance
- `portal_access_grants`: login/access layer
- `portal_project_access`: explicit project scope

### 3.2 Add an optional customer-contact link to portal grants

Recommendation:
- add nullable `customer_contact_id` to `portal_access_grants`

Preferred over `contact_id` directly because:
- the business relationship is not just the raw contact
- `customer_contact_id` anchors the grant to one specific customer-contact relationship row
- it preserves the customer-specific main-contact meaning and avoids ambiguity if the same contact is ever linked elsewhere

Why this is the best fit:
- one grant still maps to one authenticated portal user
- one grant can now map to one related customer contact identity
- existing customer-level grants can continue to coexist while contact-linked rollout happens gradually
- current customer/project scope logic stays intact

Recommended guardrail:
- keep `customer_contact_id` nullable for coexistence and migration
- do not require immediate backfill for every existing grant in the first rollout

### 3.3 Put permissions in a separate small relationship table

Recommendation:
- do not store action permissions on `customer_contacts`
- do not store action permissions directly on `portal_access_grants`
- add a small table such as `customer_contact_portal_permissions`

Recommended shape:
- `company_id`
- `customer_contact_id`
- optional `portal_access_grant_id`
- `can_view_estimates`
- `can_approve_estimates`
- `can_view_contracts`
- `can_sign_contracts`
- `can_view_change_orders`
- `can_approve_change_orders`
- `can_view_invoices`
- `can_pay_invoices`
- `can_request_quotes`
- `can_manage_contact_permissions`
- `can_manage_contact_portal_access`
- audit fields for who last changed the record
- timestamps

Why not `customer_contacts`:
- `customer_contacts` should stay about relationship identity, labels, and main-contact designation
- permission churn is a separate concern from basic contact management

Why not `portal_access_grants`:
- grant lifecycle and project visibility are already enough responsibility for one table
- mixing grant status with action permissions will make override and audit logic harder

## 4. Main-Contact Authority

Recommendation:
- keep main-contact authority rooted in `customer_contacts.is_primary`
- main contact may manage permissions and contact-level portal participation for other contacts on the same customer account
- main contact does not gain contractor membership
- main contact does not change customer ownership, project ownership, or downstream record lineage

Recommended rules:
- only one `customer_contacts.is_primary = true` per customer
- main contact may manage only contacts linked to the same canonical customer
- main contact authority applies only inside already-valid customer/project scope
- if the main contact lacks portal login, contractor admins still remain the sole managers until that login exists

## 5. Contractor-Admin Override

Recommendation:
- contractor admins always retain override authority

Admins must always be able to:
- create or link customer contacts
- create or revoke contact-linked portal access
- change main-contact designation
- change any permission flag
- revoke project visibility
- fully revoke portal access

Important boundary:
- override is authority override, not scope override
- admins still must not bypass tenant boundaries or project/customer scoping rules

Recommended audit requirement:
- track whether the latest permission change came from:
  - contractor admin
  - main contact
  - system migration/default seeding

## 6. Existing Customer-Level Grants: Coexistence and Migration

Recommendation:
- do not hard-migrate or break current grants first
- support coexistence before enforcement

Recommended coexistence model:
- existing grants with `customer_contact_id = null` continue to work exactly as they do today
- new contact-linked grants populate `customer_contact_id`
- customer detail portal UI can begin surfacing:
  - legacy customer-level portal grant
  - contact-linked portal grant

Recommended migration path:
1. add nullable `customer_contact_id`
2. surface legacy-vs-contact-linked state in contractor UI
3. allow admins to attach a legacy grant to an existing `customer_contact`
4. seed default permission rows only when a grant becomes contact-linked
5. later, add stricter gating only for contact-linked actions
6. only after a stable migration period, consider whether legacy null-contact grants need a managed transition

Why this is safest:
- existing portal users keep working
- no immediate signer, invoice, or estimate regression
- contractor admins can clean up gradually customer by customer

## 7. Exact Permission Flags Needed First

Recommended first flags:

### Estimate
- `can_view_estimates`
- `can_approve_estimates`

### Contract
- `can_view_contracts`
- `can_sign_contracts`

### Change order
- `can_view_change_orders`
- `can_approve_change_orders`

### Invoice and payment
- `can_view_invoices`
- `can_pay_invoices`

### Future quote-request groundwork
- `can_request_quotes`

### Contact governance
- `can_manage_contact_permissions`
- `can_manage_contact_portal_access`

Why these first:
- they match the live portal actions already present
- they match user direction
- they avoid premature flag sprawl

Not needed in the first pass:
- separate decline flags
- separate comment flags
- file-upload-specific flags
- project-role modeling beyond portal project visibility

Those can safely derive from the primary action flags for now:
- if you can approve, you can also reject/decline in the same flow
- if you can view, you can read the record and related status context

## 8. Which Portal Actions Must Check Permissions First

Recommended first permission-gated actions:

### Estimates
- `approveEstimateFromPortal`
- `rejectEstimateFromPortal`

View access can remain outer-scope-only in the first pass if needed, but decision actions should gate first.

### Contracts
- signer-option creation on contractor side should only offer contacts with `can_sign_contracts`
- `recordCustomerSignedContract`
- `recordCustomerDeclinedContract`

Important rule:
- contract permission does not replace signer routing
- a contact must both:
  - have `can_sign_contracts`
  - be explicitly assigned on `contract_signers`

### Change orders
- `approveChangeOrderFromPortal`
- `rejectChangeOrderFromPortal`

### Invoices and payments
- customer payment request event creation
- checkout preparation
- checkout start

Recommended first gate points:
- `recordInvoiceCustomerPaymentRequest`
- `prepareInvoiceCheckout`
- `startInvoiceCheckout`

Outer scope that should remain unchanged:
- record loaders and project visibility checks
- tenant-safe access to canonical record summaries

## 9. Customer Detail Portal UI Direction

Recommendation:
- keep the canonical customer detail page as the write home
- do not move this first into `/directory`

Customer detail should evolve in this order:
1. keep `Contacts` as the relationship-management home
2. keep `Portal Access` as the access-management home
3. pivot portal UI from raw-email-first grants toward contact-linked grants
4. clearly distinguish:
   - legacy customer-level portal access
   - contact-linked portal access
   - readiness-only status
   - permission state

Recommended presentation model later:
- per contact:
  - email readiness
  - main/additional status
  - portal login state
  - visible project count
  - permission summary

Directory should remain:
- read-only visibility
- link-back to customer detail
- no write-source role in the first implementation pass

## 10. Safest First Implementation Pass

Recommended first implementation pass:
- add nullable `customer_contact_id` to `portal_access_grants`
- update customer detail portal UI so contractor admins can attach a grant to an existing related customer contact
- keep existing raw grant/project behavior working
- do not enforce action permissions yet
- optionally seed a default permission row when a grant becomes contact-linked, but do not gate workflows with it yet

Why this should come first:
- it introduces identity before authority
- it preserves all existing live portal behavior
- it makes later permission checks explainable
- it gives contract signer routing a safer future source than "any active project-scoped portal user"

This first pass should not yet:
- change estimate send lookup
- change current customer-level portal access behavior
- gate portal actions by new permission flags
- auto-invite new users
- migrate every legacy grant automatically

## 11. Phase Plan

### Phase A: Contact-link portal grants

Goal:
- give each future portal login a clear customer-contact identity

Work:
- add nullable `customer_contact_id` to `portal_access_grants`
- update customer detail portal UI to link grants to related contacts
- show legacy vs contact-linked grant state

Status:
- implemented

Implemented now:
- `portal_access_grants.customer_contact_id` optionally links to canonical `customer_contacts`
- existing grants with `customer_contact_id = null` still behave as customer-level grants
- customer detail portal access UI can create grants as either customer-level or contact-linked
- customer detail portal access UI can attach an existing grant to an existing related customer contact
- customer detail grant cards now show customer-level vs linked-contact state plus linked contact name/email when present
- `portal_project_access` behavior remains unchanged
- no portal permission gating or estimate-send lookup changes were introduced in this phase

### Phase B: Permission records and default seeding

Goal:
- establish explicit per-contact authority without changing live actions yet

Work:
- add `customer_contact_portal_permissions`
- seed default-enabled permission rows for contact-linked grants
- expose permission summary on customer detail

Status:
- stored permission records and customer-detail editing implemented

Implemented now:
- customer detail shows stored permission readiness for linked contact grants
- customer detail allows contractor admins to edit stored linked-contact permission flags
- estimate approve/reject, change-order approve/reject, and contract sign/decline enforcement now use the stored permission flags for linked-contact grants

Still not implemented in Phase B:
- main-contact self-service permission management
- invoice/payment enforcement
- quote-request enforcement

### Phase C: Enforcement on action entry points

Goal:
- make action authority explicit and safe

Work:
- gate estimate decisions
- gate contract signer eligibility and portal sign/decline
- gate change-order decisions
- gate invoice payment request and checkout actions

### Phase D: Main-contact self-service plus admin override audit

Goal:
- let customer-side governance happen safely

Work:
- allow main-contact-managed permission changes
- preserve contractor-admin override
- add audit/event history for permission changes

### Phase E: Invite flow and legacy cleanup

Goal:
- finish onboarding ergonomics and reduce null-contact legacy grants

Work:
- add true invite flow
- support claim/accept behavior
- help admins attach or migrate old grants to linked contacts

## 12. Direct Answers To The Audit Questions

### Should `portal_access_grants` get an optional customer-contact link?

Yes.

Recommendation:
- add nullable `customer_contact_id`
- prefer `customer_contact_id` over raw `contact_id`

### Should permissions live on `portal_access_grants`, `customer_contacts`, or a new small table?

A new small table.

Recommendation:
- keep relationship data on `customer_contacts`
- keep login/scope lifecycle on `portal_access_grants`
- keep action permissions on `customer_contact_portal_permissions`

### How should main-contact authority work?

Recommendation:
- derive it from `customer_contacts.is_primary`
- main contact may manage other contacts within the same customer account
- main contact cannot bypass project scope or rewrite canonical lineage

### How should contractor-admin override work?

Recommendation:
- always allowed
- clearly auditable
- cannot bypass tenant or project scope

### How should existing customer-level portal grants migrate or coexist?

Recommendation:
- coexist first
- keep null-contact legacy grants working
- let admins attach them to related contacts gradually
- do not break current portal behavior during rollout

### What exact permission flags are needed first?

Recommendation:
- `can_view_estimates`
- `can_approve_estimates`
- `can_view_contracts`
- `can_sign_contracts`
- `can_view_change_orders`
- `can_approve_change_orders`
- `can_view_invoices`
- `can_pay_invoices`
- `can_request_quotes`
- `can_manage_contact_permissions`
- `can_manage_contact_portal_access`

### Which portal actions must check permissions first?

Recommendation:
- estimate approve/reject
- contract signer eligibility and customer sign/decline
- change-order approve/reject
- invoice payment request / checkout start

### What is the safest first implementation pass?

Recommendation:
- contact-link portal grants first
- permission records second
- action gating third

## 13. First Implementation Prompt

Use this prompt for the next build pass:

```text
You are continuing FloorConnector after the customer-contact portal access implementation audit.

Read first:
- docs/current-state.md
- docs/workflows.md
- docs/developer-source-of-truth.md
- docs/chat-handoff.md
- docs/floorconnector-ui-build-rules.md
- docs/directory-contact-model-plan.md
- docs/customer-contacts-portal-permissions-plan.md
- docs/customer-contact-portal-access-implementation-plan.md

Task:
Do the first implementation pass only from docs/customer-contact-portal-access-implementation-plan.md.

Goal:
Link portal grants to canonical customer contacts without changing portal permission gating yet.

Scope:
- portal access schema and helpers
- customer detail portal access UI
- existing contacts/customer_contacts model
- no portal action-permission enforcement yet

Required outcomes:
1. Extend `portal_access_grants` with nullable `customer_contact_id` linked to canonical `customer_contacts`.
2. Keep existing customer-level portal grants working when `customer_contact_id` is null.
3. On customer detail, let contractor admins create or update a portal grant against an existing related customer contact.
4. Clearly show whether a portal grant is:
   - legacy customer-level
   - contact-linked
5. Keep `portal_project_access` behavior unchanged.
6. Keep existing estimate, contract, change-order, invoice, and payment portal behavior unchanged in this pass.
7. Do not change `customers.email` send-recipient logic.
8. Do not add invite-email delivery yet.
9. Reuse the existing customer detail workspace and card patterns.

Files to inspect first:
- apps/web/lib/portal-access/data.ts
- apps/web/lib/portal-access/actions.ts
- apps/web/app/(app)/customers/[customerId]/page.tsx
- apps/web/lib/contacts/data.ts
- supabase/migrations

Guardrails:
- no duplicate customer or portal-user model
- no portal-only customer copies
- no weakening customer/project scope
- no estimate send-recipient change
- no financial, contract, invoice, payment, or change-order lineage changes
- no new permission gating in the customer-level cleanup pass

Validation:
- run pnpm typecheck
- run pnpm lint

Final response:
- list files changed
- explain how grants now link to customer contacts
- confirm no portal permission or send-logic changes
- include validation results
```

## 14. Customer-Level Grant Cleanup Guidance

Status:
- implemented

Implemented now:
- customer detail Portal Access clearly labels each grant as either `Customer-level grant` or `Linked contact grant`
- customer-level grants explain that the access still works as legacy account-level portal access
- customer-level grants explain that contact-level permissions require linking the grant to an existing related customer contact
- the existing grant identity form allows a contractor admin to attach an existing customer-level grant to an existing related customer contact
- the attach path does not create contacts automatically

Guardrails preserved:
- no schema changes
- no automatic migration of existing grants
- no revocation or mutation of customer-level grants unless a contractor admin explicitly submits the existing attach/update form
- no estimate send lookup changes
- no `portal_project_access` changes
- no invoice/payment behavior changes
- null-contact customer-level grants preserve legacy behavior

## 15. Recommendation Summary

Recommended direction in one sentence:

Keep the current customer-scoped grant and project-scoped portal model intact, add a nullable `customer_contact_id` to identify which related contact a login represents, and add action permissions in a separate small table before gating estimate, contract, change-order, and invoice-payment actions.
