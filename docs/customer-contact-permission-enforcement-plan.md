# Customer Contact Permission Enforcement Plan

Status: linked-contact enforcement is implemented for estimate decisions, change-order decisions, and contract sign/decline actions. Later portal-permission enforcement phases still planned.

This document defines the safest rollout for enforcing stored customer-contact portal permissions in FloorConnector after Phase B schema and customer-detail UI work.

Current implementation status:
- one shared linked-contact portal permission resolver is now implemented
- linked-contact grants now enforce:
  - estimate approve/reject through `can_approve_estimates`
  - change-order approve/reject through `can_approve_change_orders`
  - contract sign/decline through `can_sign_contracts`
- null-contact customer-level grants still preserve legacy portal behavior
- customer detail now labels customer-level grants and linked-contact grants, with guidance for attaching legacy customer-level grants to existing related contacts when ready
- `contract_signers` remains the final signer-routing authority
- invoice/payment behavior is unchanged
- estimate send-recipient behavior is unchanged

This document continues to track the remaining later enforcement phases:
- no additional schema changes in this pass
- no contract-view enforcement changes in this pass
- no invoice/payment enforcement changes in this pass
- no estimate send-recipient changes in this pass
- no payment-chain changes in this pass

Cross-reference:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/directory-contact-model-plan.md](C:/FloorConnector/docs/directory-contact-model-plan.md)
- [docs/customer-contacts-portal-permissions-plan.md](C:/FloorConnector/docs/customer-contacts-portal-permissions-plan.md)
- [docs/customer-contact-portal-access-implementation-plan.md](C:/FloorConnector/docs/customer-contact-portal-access-implementation-plan.md)
- [docs/customer-contact-permissions-schema-plan.md](C:/FloorConnector/docs/customer-contact-permissions-schema-plan.md)

## Purpose

FloorConnector now has:
- canonical `customer_contacts`
- optional `portal_access_grants.customer_contact_id`
- tenant-scoped `customer_contact_portal_permissions`
- contractor-admin UI on customer detail to edit stored linked-contact permissions

What it does not yet have is runtime enforcement for those stored permissions on portal actions.

The goal of the next phase is to add enforcement safely by:
- continuing to trust canonical customer, project, estimate, contract, change-order, invoice, and payment records
- continuing to use the current customer-grant and project-scope checks as the outer gate
- enforcing stored permissions only when a portal grant is linked to a canonical `customer_contact`
- preserving existing null-contact customer-level grants during the first rollout

## 1. Current Portal Access And Action Files

Current access and permission storage foundation:
- `apps/web/lib/portal-access/data.ts`
- `apps/web/lib/portal-access/actions.ts`
- `apps/web/lib/portal-access/schemas.ts`

Current portal action and scope files:
- `apps/web/lib/estimates/data.ts`
- `apps/web/lib/estimates/actions.ts`
- `apps/web/lib/contracts/data.ts`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/lib/change-orders/data.ts`
- `apps/web/lib/change-orders/actions.ts`
- `apps/web/lib/invoices/data.ts`
- `apps/web/lib/invoices/actions.ts`

Current scope helper entry points:
- `getScopedPortalEstimate(...)` in `apps/web/lib/estimates/data.ts`
- `getScopedPortalContract(...)` in `apps/web/lib/contracts/data.ts`
- `getScopedPortalChangeOrder(...)` in `apps/web/lib/change-orders/data.ts`
- `getScopedPortalInvoice(...)` in `apps/web/lib/invoices/data.ts`

Current live portal decision/action entry points:
- estimates:
  - `recordPortalViewedEstimate(...)`
  - `addEstimatePortalComment(...)`
  - `approveEstimateFromPortal(...)`
  - `rejectEstimateFromPortal(...)`
- contracts:
  - `getContractSignatureActionOptions(...)`
  - `recordCustomerViewedContract(...)`
  - `recordCustomerSignedContract(...)`
  - `recordCustomerDeclinedContract(...)`
- change orders:
  - `recordPortalViewedChangeOrder(...)`
  - `approveChangeOrderFromPortal(...)`
  - `rejectChangeOrderFromPortal(...)`
- invoices and payments:
  - `recordInvoiceCustomerPaymentRequest(...)`
  - `ensurePendingPortalInvoicePayment(...)`
  - `startInvoiceCheckout(...)`

Current practical behavior:
- portal scope is already customer-scoped through `portal_access_grants`
- project visibility is already scoped through `portal_project_access`
- most decision actions currently rely on "active customer grant + active project access + record status"
- contracts already have one extra gate: assigned `contract_signers.portal_user_id`

## 2. Enforcement Direction

Recommended rule layering for future enforcement:
1. authenticated portal user exists
2. active portal grant exists
3. portal grant belongs to the canonical customer
4. active project scope exists for the relevant project
5. if `portal_access_grants.customer_contact_id` is present, load `customer_contact_portal_permissions`
6. require the relevant stored permission flag for the requested action
7. keep record-status and workflow-state checks exactly where they already exist
8. keep any action-specific gate, such as contract signer assignment, on top of permission enforcement

Recommended enforcement source of truth:
- when `customer_contact_id` is linked, enforcement must use canonical `customer_contact_portal_permissions`
- when `customer_contact_id` is `null`, preserve current customer-level grant behavior during the first rollout

## 3. Enforcement Matrix Per Action

### 3.1 Estimate review access

Current behavior:
- portal estimate loading and view recording are granted by current portal scope helpers

Recommended linked-contact rule:
- linked-contact grant requires `can_view_estimates = true` for portal estimate detail access and explicit view-event writes

Recommended null-contact compatibility:
- null-contact customer-level grants keep current estimate review behavior in the first rollout

Recommended first-pass safety choice:
- do not gate estimate comments before estimate view is stable under the new rule
- if estimate comments remain live in the first enforcement pass, treat them as view-adjacent and require `can_view_estimates`

### 3.2 Estimate approval action

Current live entry points:
- `approveEstimateFromPortal(...)`
- `rejectEstimateFromPortal(...)`

Recommended linked-contact rule:
- require `can_approve_estimates = true`

Recommended null-contact compatibility:
- preserve current behavior for null-contact grants in the first rollout

Reason this is a strong first enforcement target:
- estimate approval and rejection are discrete decision actions
- the current code already has status checks
- gating these actions is lower risk than changing broader portal page visibility first

### 3.3 Contract review and sign action

Current live entry points:
- `recordCustomerViewedContract(...)`
- `recordCustomerSignedContract(...)`
- `recordCustomerDeclinedContract(...)`
- contractor-side signer chooser in `getContractSignatureActionOptions(...)`

Recommended linked-contact rules:
- contract review requires `can_sign_contracts = true` if the current portal user is an assigned signer
- customer sign and decline require:
  - `can_sign_contracts = true`
  - matching `contract_signers.portal_user_id`
  - existing signer-state transition eligibility
- contractor-side signer options should exclude linked contacts that do not have `can_sign_contracts = true`

Recommended null-contact compatibility:
- null-contact grants remain eligible under current behavior during the first rollout
- signer routing remains the canonical final gate either way

Important safety note:
- signer assignment must remain required
- permission alone must never authorize contract signing without signer assignment

### 3.4 Change-order review and approval action

Current live entry points:
- `recordPortalViewedChangeOrder(...)`
- `approveChangeOrderFromPortal(...)`
- `rejectChangeOrderFromPortal(...)`

Recommended linked-contact rules:
- change-order review requires `can_view_estimates` only if a separate review flag is intentionally not introduced
- change-order approve and reject require `can_approve_change_orders = true`

Recommended null-contact compatibility:
- null-contact grants keep current behavior in the first rollout

Recommended simplification:
- use `can_approve_change_orders` as the decision gate
- do not add a separate reject flag

### 3.5 Invoice review and payment action

Current live entry points:
- `recordInvoiceCustomerPaymentRequest(...)`
- `ensurePendingPortalInvoicePayment(...)`
- `startInvoiceCheckout(...)`

Recommended linked-contact rules:
- invoice visibility and invoice detail access require `can_view_pay_invoices = true`
- payment request, pending-payment preparation, and checkout start require `can_view_pay_invoices = true`

Recommended null-contact compatibility:
- null-contact grants keep current behavior in the first rollout

Important safety note:
- this phase should not change any gateway or payment-record lineage
- enforcement should stop the action before payment-event or payment-row mutation when blocked

### 3.6 Future quote request action

Current state:
- quote-request workflow is not fully implemented yet

Recommended future rule:
- quote-request entry points should require `can_request_quotes = true`

Recommended planning note:
- store and enforce quote-request permission through the same linked-contact permission resolver
- do not create a parallel quote-request contact model later

## 4. Compatibility Behavior For Null-Contact Grants

Recommended first-rollout compatibility:
- keep all existing null-contact customer-level grants working exactly as they work today
- do not require a stored permission row for null-contact grants
- do not block portal actions for null-contact grants in the first enforcement pass

Why this is the safest choice:
- it avoids breaking existing active customer portal users
- it gives contractor admins time to attach legacy grants to canonical customer contacts
- it avoids mixing data-migration cleanup with new runtime enforcement

Recommended UI copy for this compatibility window:
- `Customer-level grant`
- `This access still uses the existing customer-level portal behavior. Contact-level stored permissions apply only after the grant is linked to a related customer contact.`

Recommended later cleanup direction:
- after linked-contact enforcement is stable, customer detail can highlight remaining null-contact grants for admin cleanup
- a later phase can decide whether universal enforcement should require contact linkage

## 5. Linked-Contact Permission Rules

Recommended linked-contact rules by stored flag:
- `can_view_estimates`
  - estimate detail access
  - estimate review visibility
  - estimate comment access if comments remain available
- `can_approve_estimates`
  - estimate approve
  - estimate reject
- `can_sign_contracts`
  - contractor-side customer signer eligibility
  - customer contract sign
  - customer contract decline
- `can_approve_change_orders`
  - change-order approve
  - change-order reject
- `can_view_pay_invoices`
  - invoice detail visibility
  - payment request initiation
  - pending checkout preparation
  - checkout start
- `can_request_quotes`
  - future quote-request entry points

Recommended no-op rule for now:
- do not enforce main-contact governance flags in the portal runtime yet
- those remain for later customer-managed permission administration phases

Recommended missing-row behavior:
- linked-contact grants should normally already have seeded permission rows
- if a linked grant is missing its permission row unexpectedly, fail closed for linked-contact enforcement and show clear blocked copy

Reason:
- a missing permission row on a linked grant is a data-integrity problem, not a safe signal to allow the action

## 6. Contractor-Admin Override And Main-Contact Authority

Recommended first enforcement rollout:
- contractor-admin override remains management-side only
- main-contact authority remains management-side only
- neither concept should bypass runtime tenant, customer, project, or signer scope

Recommended enforcement interpretation:
- runtime portal checks consume the stored row that already reflects the latest managed state
- runtime enforcement does not need to know whether the row was last changed by contractor admin or main contact
- runtime UI can still surface management-source metadata later

Recommended later extension:
- customer-facing self-service management should update the same canonical stored rows
- runtime gate logic should stay unchanged when that management surface arrives

## 7. Blocked-Action UI Copy

Recommended blocked copy should be explicit, calm, and action-specific.

Estimate blocked copy:
- `This contact does not currently have permission to review this estimate.`
- `This contact does not currently have permission to approve or reject this estimate.`

Contract blocked copy:
- `This contact is not currently allowed to sign this contract.`
- `This contract is only available to assigned signers with contract-signing permission.`

Change-order blocked copy:
- `This contact does not currently have permission to approve or reject this change order.`

Invoice and payment blocked copy:
- `This contact does not currently have permission to view this invoice.`
- `This contact does not currently have permission to request or start payment for this invoice.`

Null-contact explanatory copy:
- `This portal access is still using customer-level behavior until it is linked to a related customer contact.`

Recommended contractor-side admin copy on customer detail:
- `Stored permissions are enforced only for linked-contact portal grants.`
- `Customer-level grants continue to use the legacy customer-level portal behavior during this rollout.`

Recommended UX rule:
- blocked portal pages should explain whether the user lacks review access or action authority
- avoid generic `Unauthorized` or `Not found` copy when tenant/customer/project scope is valid but permission is blocked

## 8. Implementation Phases

### Phase C1: Shared permission resolver and non-mutating read gates

Goal:
- add one shared resolver for linked-contact permission evaluation without changing record lineage

Recommended work:
- centralize linked-grant permission lookup in `apps/web/lib/portal-access/data.ts`
- expose helper(s) that return:
  - grant type: customer-level vs linked-contact
  - linked `customer_contact_id`
  - stored permission row if present
  - compatibility mode outcome
- wire that helper into portal estimate, contract, change-order, and invoice scope loaders

Recommended safety choice:
- start with read-only or pre-action checks and explicit blocked copy before mutating actions

### Phase C2: First mutating enforcement pass

Goal:
- gate the smallest, clearest high-risk decision actions first

Recommended first targets:
- `approveEstimateFromPortal(...)`
- `rejectEstimateFromPortal(...)`
- `approveChangeOrderFromPortal(...)`
- `rejectChangeOrderFromPortal(...)`

Why these first:
- they are discrete customer decisions
- they already depend on clear record status checks
- they do not involve signer assignment or payment gateway state

### Phase C3: Contract signer eligibility and sign/decline enforcement

Goal:
- align signer routing and customer sign actions with stored permissions

Recommended work:
- filter contractor-side signer options by `can_sign_contracts`
- gate `recordCustomerSignedContract(...)`
- gate `recordCustomerDeclinedContract(...)`
- preserve contract signer assignment as the final authority check

### Phase C4: Invoice review and payment enforcement

Goal:
- gate customer-facing billing visibility and payment-start actions

Recommended work:
- gate invoice detail access
- gate `recordInvoiceCustomerPaymentRequest(...)`
- gate `ensurePendingPortalInvoicePayment(...)`
- gate `startInvoiceCheckout(...)`

Reason this comes later:
- invoice and payment flows are more sensitive
- they touch gateway-preparation and payment-event creation
- we should land estimate and change-order action enforcement first

### Phase C5: Quote request enforcement

Goal:
- enforce `can_request_quotes` when that workflow ships

Recommended work:
- reuse the same linked-contact permission resolver
- keep quote requests on canonical customer/project chains

## 9. Safest First Enforcement Pass

Recommended safest first enforcement pass:
- add one shared linked-contact permission resolver
- enforce stored permissions only for linked-contact grants
- preserve current behavior for null-contact customer-level grants
- gate estimate approve/reject and change-order approve/reject first
- show explicit blocked copy on those actions
- leave contract and invoice/payment enforcement for the next pass

Why this is the safest first pass:
- it introduces the least payment and signer risk
- it keeps existing customer-level grants working
- it proves the linked-contact permission model on clear decision actions first
- it avoids mixing gateway, signer, and compatibility changes into one rollout

Status:
- implemented

Implemented now:
- one shared linked-contact portal permission resolver sits on top of the existing customer grant + project-scope checks
- linked-contact grants enforce `can_approve_estimates` on:
  - `approveEstimateFromPortal(...)`
  - `rejectEstimateFromPortal(...)`
- linked-contact grants enforce `can_approve_change_orders` on:
  - `approveChangeOrderFromPortal(...)`
  - `rejectChangeOrderFromPortal(...)`
- blocked decision attempts now return explicit portal error copy for those actions
- null-contact customer-level grants still preserve legacy behavior during this rollout
- estimate view, contract view, invoice/payment, and quote-request actions are still not enforced by stored contact permissions

## 10. Rollback And Safety Notes

Recommended rollback posture:
- because null-contact grants remain on legacy behavior, the rollout can be narrowed or disabled for linked-contact grants without breaking all portal access
- keep enforcement logic isolated in shared permission helpers so the gate can be removed or relaxed without touching canonical workflow mutations deeply

Recommended operational safety notes:
- do not change `portal_project_access` semantics
- do not change estimate send lookup
- do not change contract signer lineage
- do not change invoice or payment record lineage
- do not change payment gateway handoff behavior
- do not add universal enforcement for null-contact grants until admins have had time to attach legacy grants to related contacts

Recommended integrity checks before enforcement:
- confirm linked-contact grants consistently have seeded permission rows
- confirm customer-detail UI continues to distinguish customer-level vs linked-contact grants clearly
- confirm blocked UI states are tenant-safe and customer/project-safe

## 11. First Implementation Prompt

Use this prompt for the first enforcement build pass:

```text
You are continuing FloorConnector after the customer-contact permission enforcement planning pass.

Read first:
- docs/current-state.md
- docs/workflows.md
- docs/developer-source-of-truth.md
- docs/chat-handoff.md
- docs/floorconnector-ui-build-rules.md
- docs/customer-contact-portal-access-implementation-plan.md
- docs/customer-contact-permissions-schema-plan.md
- docs/customer-contact-permission-enforcement-plan.md

Task:
Implement the safest first enforcement pass only from docs/customer-contact-permission-enforcement-plan.md.

Goal:
Enforce stored linked-contact portal permissions on the first decision actions without changing legacy customer-level grants yet.

Scope:
- shared linked-contact permission resolver
- portal estimate decision enforcement
- portal change-order decision enforcement
- portal contract sign/decline enforcement
- blocked-action UI messaging
- no contract-view enforcement yet
- no invoice/payment enforcement yet

Required outcomes:
1. Add one shared helper that resolves whether the current portal grant is:
   - customer-level/null-contact
   - linked-contact with stored permissions
2. When a grant is linked to `customer_contact_id`, enforce stored permissions from canonical `customer_contact_portal_permissions`.
3. Keep null-contact customer-level grants working with current behavior in this first rollout.
4. Gate:
   - `approveEstimateFromPortal`
   - `rejectEstimateFromPortal`
   - `approveChangeOrderFromPortal`
   - `rejectChangeOrderFromPortal`
5. Show clear blocked copy for linked contacts that lack the required permission.
6. Do not change estimate send lookup.
7. Do not change contract signer behavior yet.
8. Do not change invoice/payment behavior yet.
9. Do not change `portal_project_access` behavior.
10. Keep tenant/customer/project scoping explicit and safe.

Files to inspect first:
- apps/web/lib/portal-access/data.ts
- apps/web/lib/estimates/data.ts
- apps/web/lib/estimates/actions.ts
- apps/web/lib/change-orders/data.ts
- apps/web/lib/change-orders/actions.ts

Validation:
- run pnpm typecheck
- run pnpm lint

Final response:
- list files changed
- explain the linked-contact enforcement behavior
- explain null-contact compatibility
- confirm contract and invoice/payment actions were not changed
- include validation results
```

## Recommendation Summary

Recommended direction in one sentence:

Enforce stored portal permissions only for linked customer-contact grants first, keep null-contact customer-level grants on current behavior during rollout, and start with estimate and change-order decision actions before expanding into contract signer and invoice/payment enforcement.
