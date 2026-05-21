# Customer Contact Contract Permission Plan

Status: first linked-contact contract permission enforcement pass implemented. Customer-level cleanup guidance implemented. Later contract-view phases still planned.

This document defines the safest next rollout for enforcing stored linked-contact contract permissions in FloorConnector after estimate and change-order decision enforcement.

Current implementation status:
- shared portal permission resolution now supports `can_sign_contracts`
- linked-contact grants now require stored `can_sign_contracts` for portal customer contract sign and decline actions
- contractor-side customer signer options now exclude linked-contact portal users who do not have `can_sign_contracts`
- null-contact customer-level grants still preserve legacy contract behavior
- customer detail now labels customer-level versus linked-contact grants and guides admins to attach legacy customer-level grants to existing related contacts when ready
- contract viewing is unchanged
- contractor countersign is unchanged

This document continues to track later contract permission phases:
- no schema changes in this pass
- no contract-view enforcement in this pass
- no signer-lineage changes in this pass
- no estimate, invoice, payment, or change-order behavior changes in this pass

Cross-reference:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/customer-contact-permission-enforcement-plan.md](C:/FloorConnector/docs/customer-contact-permission-enforcement-plan.md)

## Purpose

FloorConnector already has:
- canonical `contracts`
- canonical `contract_signers`
- canonical `contract_signature_events`
- active portal grant and project-scope validation
- linked-contact stored portal permissions with `can_sign_contracts`

What is not yet enforced is whether a linked contact with portal access is allowed to participate in contract signature actions.

The key safety rule for this phase is:
- `can_sign_contracts` must be additive to the existing signer-routing model
- it must never replace `contract_signers`
- it must never weaken project/customer scoping

## 1. Current Files And Actions Involved

Current contract data and actions:
- `apps/web/lib/contracts/data.ts`
- `apps/web/lib/contracts/actions.ts`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`

Current shared permission helper:
- `apps/web/lib/portal-access/data.ts`

Current contract-specific entry points:
- contractor-side signer option loading:
  - `getContractSignatureActionOptions(...)`
- portal contract scope:
  - `getScopedPortalContract(...)`
- portal customer view/signature actions:
  - `recordCustomerViewedContract(...)`
  - `recordCustomerSignedContract(...)`
  - `recordCustomerDeclinedContract(...)`
- contractor countersign:
  - `countersignContract(...)`

## 2. Existing Contract Signer Routing

Current implemented routing model:
- customer signature authority is assigned through canonical `contract_signers`
- each customer signer row stores `portal_user_id`
- portal sign/decline actions match the authenticated portal user to customer signer rows by `contract_signers.portal_user_id`
- contractor countersign uses `contract_signers.organization_user_id`

Current contractor-side signer selection:
- `getContractSignatureActionOptions(...)` loads active `portal_access_grants` for the contract customer
- it further filters those grants through active `portal_project_access` for the contract project
- the resulting active portal users become customer signer options

Current portal-side sign/decline path:
1. `getScopedPortalContract(...)` validates authenticated user, active customer grant, and active project scope
2. portal action loads canonical `contract_signers`
3. action filters customer signer rows where:
   - `signer_role === "customer"`
   - `portal_user_id === current portal user`
   - signer status still allows the action
4. canonical contract signer and signature-event state is updated

Important current truth:
- signer email is not the final authority check at runtime
- `portal_user_id` on the signer row is the final customer-signer identity check

## 3. How Portal Grant Contact Link Maps To Contract Signers

Current state:
- `portal_access_grants` can now link to canonical `customer_contacts` through `customer_contact_id`
- `contract_signers` still store `portal_user_id`, not `customer_contact_id`

Recommended interpretation:
- the link path should remain:
  - current portal user
  - active portal grant
  - optional `customer_contact_id`
  - stored linked-contact permissions
  - canonical `contract_signers.portal_user_id`

Recommended rule:
- `customer_contact_id` should determine whether stored `can_sign_contracts` applies
- `contract_signers.portal_user_id` should continue determining whether this user is the assigned signer

Why this is safest:
- it avoids creating a second signer identity model
- it preserves the current immutable signer/event history structure
- it keeps `contract_signers` as the action-routing layer and `customer_contact_portal_permissions` as the authority layer

## 4. Whether Signer Email And User Matching Already Exists

Current truth:
- contractor-side signer selection surfaces active portal users with display name and email
- validation of customer signer eligibility currently depends on active portal grant plus project access
- runtime customer sign/decline checks use `portal_user_id`, not raw email

Practical conclusion:
- email is selection/display context only
- authenticated user id and signer assignment are already the canonical runtime match

Recommended enforcement implication:
- do not add email-based contract permission checks
- enforce `can_sign_contracts` against the linked grant/user path, then still require matching `contract_signers.portal_user_id`

## 5. Recommended Enforcement Point

Recommended first enforcement points:
1. contractor-side customer signer option generation in `getContractSignatureActionOptions(...)`
2. portal customer sign action in `recordCustomerSignedContract(...)`
3. portal customer decline action in `recordCustomerDeclinedContract(...)`

Recommended non-first enforcement point:
- `recordCustomerViewedContract(...)`

Reason:
- viewing is more sensitive from a UX standpoint because the portal page already uses signer-state visibility and first-view tracking
- sign and decline are the highest-risk mutating actions and are the safest first contract gates

Recommended shared helper usage:
- extend the existing shared resolver in `apps/web/lib/portal-access/data.ts` to support `canSignContracts`
- keep the resolver layered on top of:
  - active grant
  - customer scope
  - project scope
- let contract code consume that result without rewriting portal access logic

## 6. Linked-Contact Permission Behavior

Recommended linked-contact rules:

### Contractor-side signer options

- if a customer portal grant is linked to `customer_contact_id`, include it in signer options only when `can_sign_contracts = true`
- if linked-contact permission is missing or false, exclude that portal user from signer selection

### Portal sign action

- linked-contact grant must pass:
  - active customer grant
  - active project access
  - stored `can_sign_contracts = true`
  - matching `contract_signers.portal_user_id`
  - existing signer-state transition eligibility

### Portal decline action

- same rules as portal sign:
  - active scope
  - stored `can_sign_contracts = true`
  - matching signer assignment
  - allowed signer-state transition

### Portal view action

Recommended first choice:
- do not enforce `can_sign_contracts` on contract viewing in the first contract pass
- keep current signer-view page behavior unchanged initially

Why:
- the portal contract page already acts as a review surface with signer-state visibility
- gating view at the same time as sign/decline creates a bigger UX and support surface
- first-pass contract enforcement should focus on mutating signature actions

## 7. Null-Contact Compatibility Behavior

Recommended compatibility rule:
- null-contact customer-level grants keep current legacy behavior for this contract phase

That means:
- contractor-side signer options may still include null-contact active portal users
- null-contact grants may still sign or decline if:
  - they are assigned on `contract_signers`
  - their active customer/project scope remains valid

Why this is safest:
- it preserves existing sent-contract workflows
- it avoids breaking already-routed signature requests
- it gives admins time to attach legacy contract-signing portal users to canonical customer contacts

Recommended later cleanup direction:
- after linked-contact contract enforcement is stable, customer detail can highlight contract-signing portal users still on null-contact grants

## 8. Blocked-Action Copy

Recommended contractor-side signer selection copy:
- `Only linked contacts with contract-signing permission appear as selectable customer signers.`

Recommended portal sign blocked copy:
- `This contact is not currently allowed to sign this contract.`

Recommended portal decline blocked copy:
- `This contact is not currently allowed to decline this contract.`

Recommended signer-assignment copy when permission passes but signer routing fails:
- `This contract is only available to assigned customer signers.`

Recommended null-contact explanatory copy:
- `This portal access is still using customer-level behavior until it is linked to a related customer contact.`

Recommended UX rule:
- keep permission-blocked copy separate from signer-assignment copy
- users should understand the difference between:
  - not having contract-signing permission
  - not being the assigned signer

## 9. Should Enforcement Apply To Each Contract Action?

### Viewing contract

Recommended first-pass answer:
- no

Reason:
- keep current portal contract review visibility unchanged
- avoid interfering with signer-state visibility and first-view event recording in the same rollout

### Signing contract

Recommended first-pass answer:
- yes

Rule:
- linked-contact grant must have `can_sign_contracts = true`
- signer assignment must still match

### Declining contract

Recommended first-pass answer:
- yes

Rule:
- use the same `can_sign_contracts` gate as sign
- do not create a separate decline flag

### Contractor countersign

Recommended first-pass answer:
- no

Reason:
- contractor countersign is an organization-user workflow, not a customer-contact portal workflow
- it should remain unchanged

## 10. Rollback And Safety Risks

Primary risks:

### Risk: permission gate bypasses signer routing

Bad outcome:
- a linked contact with permission but no signer assignment can sign

Guardrail:
- signer assignment through `contract_signers.portal_user_id` must remain the final action gate

### Risk: signer options disappear for legacy customers

Bad outcome:
- contractors cannot send contracts because existing customer portal users are on null-contact grants

Guardrail:
- preserve null-contact legacy behavior for now
- only apply the new permission filter to linked-contact grants first

### Risk: contract view becomes unexpectedly blocked

Bad outcome:
- portal users lose visibility into contracts they could previously review

Guardrail:
- do not gate contract viewing in the first contract permission pass

### Risk: countersign flow gets mixed into customer-contact permissions

Bad outcome:
- contractor countersign behavior regresses

Guardrail:
- do not apply `can_sign_contracts` to contractor countersign
- keep countersign on organization-user signer assignment only

### Risk: signed-contract lineage changes

Bad outcome:
- signature events or contract state progression diverge from the current canonical contract chain

Guardrail:
- add permission checks only before the existing mutations
- do not change contract state mutation logic, signer rows, or signature-event writes

## 11. Safest Contract Enforcement Approach

Recommended safest contract enforcement approach:
- extend the shared resolver to support `canSignContracts`
- apply it only to linked-contact grants
- preserve null-contact legacy behavior
- first filter contractor-side customer signer options for linked-contact grants
- then gate portal sign and decline actions
- leave contract viewing and contractor countersign unchanged in the first pass

Why this is safest:
- it protects mutating signature actions first
- it keeps the existing signer-routing model intact
- it avoids breaking review visibility or countersign behavior
- it narrows the rollout to the clearest contract authority boundary

Status:
- Phase 1 complete / implemented

Implemented now:
- the shared resolver supports `canSignContracts`
- linked-contact portal users now require `canSignContracts` for:
  - `recordCustomerSignedContract(...)`
  - `recordCustomerDeclinedContract(...)`
- contractor-side customer signer options now exclude linked-contact portal users without stored contract-signing permission
- null-contact customer-level grants still preserve legacy behavior
- `contract_signers.portal_user_id` remains the final signer-routing authority
- contract viewing and contractor countersign are unchanged

## 12. Safest First Implementation Prompt

Use this prompt for the first contract enforcement build pass:

```text
You are continuing FloorConnector after the contract permission enforcement planning pass.

Read first:
- docs/current-state.md
- docs/workflows.md
- docs/developer-source-of-truth.md
- docs/chat-handoff.md
- docs/floorconnector-ui-build-rules.md
- docs/customer-contact-permission-enforcement-plan.md
- docs/customer-contact-contract-permission-plan.md

Task:
Implement the safest first contract linked-contact permission enforcement pass only from docs/customer-contact-contract-permission-plan.md.

Goal:
Enforce stored `canSignContracts` for linked-contact portal grants without breaking existing contract signer routing.

Scope:
- shared portal permission resolver support for `canSignContracts`
- contractor-side customer signer option filtering
- portal contract sign enforcement
- portal contract decline enforcement
- blocked-action copy
- no contract view enforcement yet
- no contractor countersign changes

Required outcomes:
1. Extend the shared portal permission resolver to support `canSignContracts`.
2. When a customer portal grant is linked to `customer_contact_id`, only include it as a contract signer option if stored `canSignContracts` is true.
3. When a linked-contact portal user attempts to sign or decline a contract, require stored `canSignContracts = true`.
4. Preserve existing `contract_signers.portal_user_id` routing as the final signer-assignment gate.
5. Keep null-contact customer-level grants on legacy behavior in this pass.
6. Do not change contract viewing behavior yet.
7. Do not change contractor countersign behavior.
8. Do not change estimate, invoice, payment, change-order, estimate send, or `portal_project_access` behavior.
9. Do not change signed-contract lineage, signer rows, or signature-event structure.

Files to inspect first:
- apps/web/lib/portal-access/data.ts
- apps/web/lib/contracts/data.ts
- apps/web/lib/contracts/actions.ts
- apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx

Validation:
- run pnpm typecheck
- run pnpm lint

Final response:
- list files changed
- explain linked-contact contract enforcement behavior
- explain null-contact compatibility
- confirm contract viewing and contractor countersign were not changed
- include validation results
```

## Recommendation Summary

Recommended direction in one sentence:

Enforce `canSignContracts` only for linked-contact grants first, keep null-contact grants on legacy contract behavior, and gate signer-option selection plus portal sign/decline without changing contract viewing or contractor countersign yet.
