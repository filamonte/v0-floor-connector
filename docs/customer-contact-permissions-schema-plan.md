# Customer Contact Permissions Schema Plan

Status: schema + UI phase implemented. Estimate, change-order, and contract decision enforcement implemented for linked-contact grants; invoice/payment and broader enforcement still planned.

This document defines the recommended Phase B schema and customer-detail UI plan for storing per-contact portal permissions in FloorConnector before any portal-action enforcement is added.

Current implementation status:
- schema and customer-detail UI are now implemented
- linked-contact permission enforcement is implemented for estimate approve/reject, change-order approve/reject, and contract sign/decline
- customer-level grants remain legacy account-level access until explicitly attached to an existing related customer contact
- estimate send-recipient behavior is unchanged

Cross-reference:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/directory-contact-model-plan.md](C:/FloorConnector/docs/directory-contact-model-plan.md)
- [docs/customer-contacts-portal-permissions-plan.md](C:/FloorConnector/docs/customer-contacts-portal-permissions-plan.md)
- [docs/customer-contact-portal-access-implementation-plan.md](C:/FloorConnector/docs/customer-contact-portal-access-implementation-plan.md)

## Purpose

FloorConnector now has:
- canonical `customers`
- canonical `contacts`
- canonical `customer_contacts`
- customer-scoped `portal_access_grants`
- project-scoped `portal_project_access`
- optional `portal_access_grants.customer_contact_id`
- visibility-only future permission readiness on linked contact grants

What it still lacks is stored customer-contact permission state that can later support:
- explicit per-contact authority for customer-facing portal actions
- main-contact-managed permission changes
- contractor-admin override
- clean backward compatibility with null-contact customer-level grants
- future action enforcement without changing canonical customer/account continuity

The goal of this phase is to store authority cleanly before enforcing authority anywhere.

## 1. Recommended Table And Field Design

Recommendation:
- add a new table: `customer_contact_portal_permissions`

Recommended table purpose:
- one canonical stored permission record per linked `customer_contact`
- optional direct link to the currently active linked portal grant
- tenant-safe storage of default and customized customer-facing portal authority
- clear separation between:
  - relationship identity
  - login/access lifecycle
  - project visibility
  - action authority

Recommended columns:
- `id uuid primary key default extensions.gen_random_uuid()`
- `company_id uuid not null references public.companies(id) on delete cascade`
- `customer_contact_id uuid not null`
- `portal_access_grant_id uuid null`
- `can_view_estimates boolean not null default true`
- `can_approve_estimates boolean not null default true`
- `can_sign_contracts boolean not null default true`
- `can_approve_change_orders boolean not null default true`
- `can_view_invoices boolean not null default true`
- `can_pay_invoices boolean not null default true`
- `can_request_quotes boolean not null default true`
- `can_manage_contact_permissions boolean not null default false`
- `can_manage_contact_portal_access boolean not null default false`
- `last_managed_by_user_id uuid null references public.users(id) on delete set null`
- `last_managed_by_customer_contact_id uuid null`
- `last_override_by_user_id uuid null references public.users(id) on delete set null`
- `management_source text not null default 'system_default'`
- `created_at timestamptz not null default timezone('utc', now())`
- `updated_at timestamptz not null default timezone('utc', now())`

Recommended constraints:
- foreign key `(company_id, customer_contact_id)` -> `customer_contacts(company_id, id)`
- foreign key `(company_id, portal_access_grant_id)` -> `portal_access_grants(company_id, id)`
- foreign key `(company_id, last_managed_by_customer_contact_id)` -> `customer_contacts(company_id, id)`
- unique `(company_id, customer_contact_id)`

Recommended indexes:
- `(company_id, customer_contact_id)`
- `(company_id, portal_access_grant_id)` where `portal_access_grant_id is not null`
- `(company_id, can_manage_contact_permissions)` if management queries need it later

Recommended `management_source` enum-like values:
- `system_default`
- `contractor_admin`
- `main_contact`
- `migration`

Why one row per `customer_contact`:
- permissions are conceptually about the related contact’s authority within the customer account
- a linked portal grant may be revoked/recreated later without losing the contact’s stored authority model
- this preserves continuity if the same contact later reconnects to a new user/grant

Why keep optional `portal_access_grant_id`:
- helpful for current linked-login traceability
- supports future admin UI joins without forcing permission identity to live on the grant
- still safe to leave null while a contact is not yet linked to an active portal grant

## 2. Where Permissions Should Attach

Recommendation:
- permissions should attach to `customer_contacts` through a new `customer_contact_portal_permissions` table
- permissions should not live directly on `portal_access_grants`
- permissions should not live directly on `customer_contacts`

Why not `portal_access_grants`:
- `portal_access_grants` already owns login/access lifecycle
- `portal_project_access` already owns project scope
- mixing access status, project visibility, and action authority into one record will make future override and audit logic harder
- null-contact grants must remain backward-compatible, and putting permissions on grants would blur how legacy grants should behave

Why not `customer_contacts`:
- `customer_contacts` should stay focused on relationship identity, primary/main-contact designation, and basic customer-contact linkage
- permission churn is operational governance, not base relationship structure

Recommended attachment model:
- authority record belongs to one `customer_contact`
- optional reference to one current linked `portal_access_grant`
- portal enforcement later can resolve:
  - current user -> linked portal grant
  - linked portal grant -> linked `customer_contact`
  - linked `customer_contact` -> stored permission record

## 3. Default Values

Recommended default-enabled permissions for linked customer contacts:
- `can_view_estimates = true`
- `can_approve_estimates = true`
- `can_sign_contracts = true`
- `can_approve_change_orders = true`
- `can_view_invoices = true`
- `can_pay_invoices = true`
- `can_request_quotes = true`

Recommended non-default governance permissions:
- `can_manage_contact_permissions = false`
- `can_manage_contact_portal_access = false`

Recommended main-contact default behavior:
- when a linked `customer_contact` is the current main contact, seed:
  - `can_manage_contact_permissions = true`
  - `can_manage_contact_portal_access = true`

Recommended reseeding rule:
- seed only when a permission row is first created
- do not silently overwrite customized rows later just because main-contact status changes

Reason:
- default-enabled matches the current intended commercial/customer workflow direction
- governance permissions are more sensitive and should not be broadly auto-enabled

## 4. Main-Contact Management Rules

Recommendation:
- main-contact authority is derived from `customer_contacts.is_primary`
- authority applies only after that main contact has:
  - a linked `portal_access_grants.customer_contact_id`
  - an active portal grant
  - active project access for the relevant project when the action is project-bound

Recommended main-contact powers:
- adjust stored permission flags for other contacts on the same canonical customer
- enable or disable another contact’s portal participation within that customer account
- manage only contacts linked to the same canonical customer

Recommended main-contact limits:
- cannot bypass tenant scope
- cannot bypass project scope
- cannot rewrite canonical `customers` recipient continuity
- cannot rewrite downstream estimate, contract, invoice, payment, or change-order lineage
- cannot manage contacts from another customer account
- cannot manage contractor-member permissions

Recommended stored behavior:
- customer-managed mutations should write:
  - `last_managed_by_customer_contact_id`
  - `management_source = 'main_contact'`
- if a customer-contact manager loses main-contact status later, the stored rows remain but future management actions must re-check live `is_primary`

## 5. Contractor-Admin Override Rules

Recommendation:
- contractor admins always retain override authority

Recommended override powers:
- create or update permission rows
- change any stored permission flag
- attach or detach linked contact grants
- revoke or reactivate linked portal access
- change main-contact designation through the existing customer-contact workflow

Recommended limits:
- override does not bypass tenant scope
- override does not bypass customer scope
- override does not bypass project visibility requirements
- override does not change `customers.email` send-recipient continuity

Recommended stored audit behavior:
- contractor-admin changes should write:
  - `last_managed_by_user_id`
  - `last_override_by_user_id`
  - `management_source = 'contractor_admin'`

Recommended precedence:
- latest stored row values win
- management metadata explains who last changed authority
- future UI should display whether the current state is still defaulted or has been explicitly changed

## 6. Customer Detail UI Plan

Recommendation:
- keep customer detail as the canonical write home
- reuse the existing `Portal Access` card structure
- do not move write controls into `/directory`
- do not introduce a detached security or permissions page

Recommended customer detail UI evolution:

### 6.1 Linked-contact grant summary

For each linked-contact grant, show:
- linked contact name
- linked contact email
- customer-level vs linked-contact grant label
- visible project count
- stored permission summary
- management state:
  - defaulted
  - customized by contractor admin
  - customized by main contact

### 6.2 Null-contact grant summary

For each null-contact customer-level grant, show:
- customer-level grant label
- note that stored contact permissions do not apply until the grant is attached to one canonical related customer contact
- existing invite/revoke/project visibility controls unchanged

### 6.3 Stored-permission editor

First stored-permission UI should support contractor admins only.

Recommended fields:
- checkbox: view estimates
- checkbox: approve estimates
- checkbox: sign contracts
- checkbox: approve change orders
- checkbox: view invoices
- checkbox: pay invoices
- checkbox: request new quote
- checkbox: manage contact permissions
- checkbox: manage contact portal access

Recommended UI copy:
- explicit note that permissions are stored and visible
- explicit note that portal-action enforcement is still not active in the schema/UI-only pass

Recommended UI guardrails:
- show edit controls only for linked-contact grants
- show read-only explanation for null-contact grants
- preserve existing create/revoke/reactivate/project visibility flows

UI implementation plan checks:
- reuse the existing customer detail Record Workspace pattern
- do not add a new shell or layout wrapper
- preserve settings/work/super-admin boundaries
- keep pricing, estimate, invoice, and portal business logic untouched in the schema/UI-only implementation pass

## 7. Migration And Backward Compatibility Plan

Recommendation:
- keep backward compatibility first
- do not migrate existing null-contact grants in the initial schema/UI pass
- do not create permission rows for null-contact grants

Recommended rollout:
1. add `customer_contact_portal_permissions`
2. create rows only for linked-contact grants
3. seed rows when:
   - a new linked-contact grant is created, or
   - an existing null-contact grant is attached to a `customer_contact`
4. keep existing null-contact grants fully functional without stored permission rows
5. surface clear UI distinctions:
   - `Customer-level grant`
   - `Linked-contact grant with stored permissions`
6. delay any legacy cleanup or forced migration until after enforcement is stable

Recommended compatibility rule:
- absence of a permission row must not break current portal access
- during the schema/UI-only pass, no runtime logic should depend on the presence of permission rows

Recommended later migration option:
- once customers have had time to attach legacy grants to contacts, a guided admin cleanup flow can highlight remaining customer-level grants that lack stored per-contact permissions

## 8. Future Enforcement Map

Recommendation:
- enforcement should remain a later dedicated phase
- current map should guide where gates will be added first

### Estimates

Future enforcement points:
- `approveEstimateFromPortal`
- `rejectEstimateFromPortal`

Required checks later:
1. authenticated user
2. active linked grant
3. active project visibility
4. stored `can_approve_estimates = true`
5. record status allows approval/rejection

### Contracts

Future enforcement points:
- contractor-side signer selection list
- `recordCustomerSignedContract`
- `recordCustomerDeclinedContract`

Required checks later:
1. authenticated user
2. active linked grant
3. active project visibility
4. stored `can_sign_contracts = true`
5. explicit `contract_signers` assignment still required

### Change orders

Future enforcement points:
- `approveChangeOrderFromPortal`
- `rejectChangeOrderFromPortal`

Required checks later:
1. authenticated user
2. active linked grant
3. active project visibility
4. stored `can_approve_change_orders = true`
5. record status allows decision

### Invoices And Payments

Future enforcement points:
- invoice payment request creation
- checkout preparation
- checkout start

Required checks later:
1. authenticated user
2. active linked grant
3. active project visibility
4. stored `can_view_invoices = true` for invoice visibility expansion if added later
5. stored `can_pay_invoices = true` for payment-start actions

### Quote requests

Current state:
- quote-request workflow is not fully implemented yet

Preparation recommendation:
- store `can_request_quotes` now anyway
- later quote-request entry points should check that flag before allowing customer-requested estimating flows

### Null-contact customer-level grants during future enforcement

Recommendation:
- null-contact grants continue under legacy behavior during the first enforcement rollout
- enforcement should initially apply only when a grant is linked to a `customer_contact`
- a later cleanup phase can decide whether null-contact grants must be attached before full enforcement is universal

Reason:
- this avoids breaking existing customer access unexpectedly
- it gives contractor admins time to link older grants cleanly

## 9. First Implementation Prompt For Schema + UI Only

Use this prompt for the first build pass:

```text
You are continuing FloorConnector after the stored customer-contact portal permissions planning pass.

Read first:
- docs/current-state.md
- docs/workflows.md
- docs/developer-source-of-truth.md
- docs/chat-handoff.md
- docs/floorconnector-ui-build-rules.md
- docs/directory-contact-model-plan.md
- docs/customer-contacts-portal-permissions-plan.md
- docs/customer-contact-portal-access-implementation-plan.md
- docs/customer-contact-permissions-schema-plan.md

Task:
Do the first Phase B implementation pass only from docs/customer-contact-permissions-schema-plan.md.

Goal:
Add stored customer-contact portal permission records and customer-detail management UI without enforcing those permissions yet.

Scope:
- schema and migration for `customer_contact_portal_permissions`
- shared portal-permission data helpers
- customer detail portal-permission summary and edit UI
- linked-contact grants only
- no portal action enforcement yet

Required outcomes:
1. Add a canonical `customer_contact_portal_permissions` table scoped by tenant and customer contact.
2. Keep permissions attached to canonical `customer_contacts`, not to raw contacts and not directly to customer records.
3. Store the first permission set:
   - view estimates
   - approve estimates
   - sign contracts
   - approve change orders
   - view invoices
   - pay invoices
   - request quotes
   - manage contact permissions
   - manage contact portal access
4. Seed default-enabled permission rows only when a portal grant is linked to a customer contact.
5. Keep null `portal_access_grants.customer_contact_id` grants working as customer-level grants with no required permission row.
6. On customer detail, show stored permission state for linked-contact grants and read-only explanatory state for customer-level grants.
7. Preserve existing invite/revoke/reactivate/project access behavior.
8. Do not add permission gating yet.
9. Do not change estimate send lookup.
10. Do not change portal estimate/contract/invoice/change-order/payment behavior yet.
11. Reuse the existing customer detail workspace and shared cards.

Files to inspect first:
- supabase/migrations
- apps/web/lib/portal-access/data.ts
- apps/web/lib/portal-access/actions.ts
- apps/web/app/(app)/customers/[customerId]/page.tsx
- apps/web/lib/contacts/data.ts
- packages/types/src/index.ts

Guardrails:
- no duplicate portal/customer/contact models
- no weakening customer/project scope
- no portal-only customer copies
- no downstream commercial or financial lineage changes
- no enforcement yet

Validation:
- run pnpm typecheck
- run pnpm lint

Final response:
- list files changed
- explain the stored permission model
- explain null-contact backward compatibility
- confirm no permission enforcement or send-logic changes
- include validation results
```

## Recommendation Summary

Recommended direction in one sentence:

Store customer-facing portal authority in a new tenant-scoped `customer_contact_portal_permissions` table keyed primarily by canonical `customer_contacts`, keep null-contact customer-level grants working without forced permission rows, and add enforcement later only after stored permission state and admin UI are stable.

## 10. Phase Status

Implemented now:
- tenant-scoped `customer_contact_portal_permissions` exists
- linked-contact grants seed and reuse stored permission rows
- contractor admins can view and edit stored linked-contact permission flags from customer detail
- null-contact customer-level grants continue working without requiring permission rows
- stored permission UI now explains which linked-contact actions are enforced now and which stored flags remain future-only

Still not implemented:
- invoice/payment, quote-request, estimate-view, and contract-view portal action enforcement
- main-contact self-service permission management
- contractor-admin versus main-contact audit surfacing in the UI
- estimate send-recipient changes
