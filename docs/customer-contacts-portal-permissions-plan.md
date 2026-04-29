# Customer Contacts Portal Permissions Plan

Status: Phase 1 customer-contact foundation implemented on customer detail; later portal-permission phases still planned.

This document defines the recommended next Directory-adjacent phase for customer additional contacts, portal logins, and shared customer/project permissions without replacing canonical customers or weakening tenant/project scope.

This is intentionally a docs-only pass:
- no app code changes in this pass
- no schema changes in this pass
- no portal workflow rewiring in this pass
- no customer/account model replacement in this pass

Cross-reference:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/directory-contact-model-plan.md](C:/FloorConnector/docs/directory-contact-model-plan.md)

## Purpose

FloorConnector already has:
- canonical customer accounts in `customers`
- shared contact identity foundations in `contacts`
- customer-to-contact relationships in `customer_contacts`
- customer-scoped portal access in `portal_access_grants`
- project-scoped portal visibility in `portal_project_access`

What it does not yet have is a contact-specific authority model for customer-facing portal actions.

This next phase should allow:
- one canonical customer account to have multiple related contacts
- each related contact to optionally have its own portal login
- each related contact to share the same customer/project chain only when granted
- each related contact to have default-enabled customer-facing workflow permissions
- the main contact to manage other contact permissions
- contractor admins to override when needed

The system must keep:
- canonical `customers` as the customer/account source of truth
- downstream estimate, contract, change-order, invoice, payment, and project lineage on the same canonical records
- tenant isolation and explicit project scoping

## 1. Current Implemented Foundation

### Contacts and customer contacts

Implemented in schema today:
- `contacts` is a canonical organization-scoped contact identity table
- `customer_contacts` links canonical customers to shared contact identities
- `customer_contacts.is_primary` already exists
- `customer_contacts.relationship_label` already exists

Implemented usage today:
- opportunity/intake flows already create and update shared `contacts`
- opportunity conversion already links primary contacts into `customer_contacts`
- additional customer contacts are now surfaced on customer detail as a customer-account management workflow

Current practical interpretation:
- the schema already supports related customer contacts
- the contractor UI now exposes customer contact management on customer detail, while Directory remains read-only
- primary customer recipient continuity still lives on canonical `customers` fields

### Portal access grants and project access

Implemented in schema today:
- `portal_access_grants`
  - anchored to `customer_id`
  - linked to authenticated `user_id`
  - statuses: `invited`, `active`, `revoked`
- `portal_project_access`
  - anchored beneath `portal_access_grants`
  - linked to explicit `project_id`
  - statuses: `active`, `revoked`

Implemented behavior today:
- contractor-side portal access is managed from customer detail
- a portal grant currently requires an already-authenticated FloorConnector user email
- this pass does not send actual invitation emails automatically
- project access is added explicitly beneath the customer-level grant
- project access is validated to stay inside the same canonical customer

Current practical interpretation:
- the access model is already customer-first and project-scoped
- portal grants are user-based, not contact-based
- there is no dedicated permission layer for estimate approval, contract signing, invoice payment, or change-order review

### Customer detail current portal access management

Implemented on customer detail today:
- create portal grant by email
- set initial status to `invited` or `active`
- revoke/reactivate grant
- add or revoke visible projects beneath a grant
- quick summary of active/invited/revoked portal users

Not implemented on customer detail today:
- no contact-specific portal permission controls
- no contractor-admin override UX beyond the fact that contractor-side admins manage current grant records
- no invite acceptance flow or magic-link flow

### Contract signer routing

Implemented today:
- contract signature routing lives on canonical `contract_signers`
- a customer signer is selected from active portal grants that also have active project access for the contract project
- contract sign/decline actions check current portal user against assigned `contract_signers.portal_user_id`
- optional contractor countersign remains on organization users

Current practical interpretation:
- contract routing already assumes more than one possible customer signer can exist
- signer selection is sourced from portal grants, not from `customer_contacts`
- there is no separate signer authority flag beyond being selected as the signer

### Estimate, invoice/payment, and change-order portal review

Implemented today:
- estimate approve/reject/comment actions use active portal customer + project scope
- change-order approve/reject actions use active portal customer + project scope
- invoice payment request / checkout initiation uses active portal customer + project scope
- portal project/detail loaders use the same canonical estimate, contract, invoice, payment, and change-order records

Current practical interpretation:
- once a portal user has active customer + project scope, portal actions are broadly allowed where the record status allows it
- there is no per-contact action matrix yet
- the current model is effectively "project-visible means action-capable" for these customer-facing workflows

### Main contact vs additional contact today

Implemented today:
- `customer_contacts.is_primary` exists in schema
- customer detail supports setting and changing the main contact from linked `customer_contacts`

Not implemented today:
- no enforced main-contact authority model
- no contact-level authority delegation

### Contractor admin override today

Implemented today:
- contractor-side authenticated organization users manage portal grants and project visibility from the customer page
- RLS and organization scoping keep that management inside tenant boundaries

Not implemented today:
- no explicit override model recorded against contact-level permission decisions
- no audit distinction between customer-managed changes and contractor-admin overrides

## 2. Audit Summary

The current system already has the right structural direction:
- canonical customer account anchor
- shared contact identities
- explicit project scoping
- real authenticated portal users
- shared downstream canonical records

The main missing layer is:
- contact-specific authority beneath an otherwise-valid portal grant

Today, the system can answer:
- does this authenticated user have active access to this customer?
- does this authenticated user have active access to this project?
- is this authenticated user the assigned customer signer for this contract?

Today, the system cannot answer:
- can this specific additional contact approve estimates but not sign contracts?
- can the main contact turn off invoice payment authority for one related contact?
- did a contractor admin override the contact’s own permission setting?
- which portal user is the main contact for customer-account governance?

## 3. Recommended Data Model Approach

### Keep existing canonical anchors

Do not replace or duplicate:
- `customers`
- `projects`
- `portal_access_grants`
- `portal_project_access`
- `contracts`
- `estimates`
- `change_orders`
- `invoices`
- `payments`

Keep these responsibilities:
- `customers` remains the canonical account, billing, project-owner, and workflow continuity record
- `contacts` remains the person/contact identity layer
- `customer_contacts` remains the relationship layer between canonical customer accounts and shared contact identities
- `portal_access_grants` remains the authenticated login/access layer
- `portal_project_access` remains the explicit project scope layer

### Add a customer-contact-to-login bridge instead of replacing grants

Recommended addition:
- extend portal access so a grant can be explicitly tied to a `customer_contact`

Recommended shape:
- each portal login should still remain a real authenticated `users` record
- each portal grant should still remain customer-anchored and user-based
- add a `customer_contact_id` reference on the grant, or add a dedicated bridge table if that proves cleaner for rollout

Preferred first-step recommendation:
- extend `portal_access_grants` with a nullable `customer_contact_id`

Why:
- one grant should map to one authenticated portal user
- one related contact should be the business identity behind that grant
- contractor-side management stays anchored to the customer account
- contract signer selection can later source from contact-linked grants instead of raw customer grants

### Add a customer-contact permission layer

Recommended addition:
- a dedicated customer-contact portal permission record

Preferred table direction:
- `customer_contact_portal_permissions`

Recommended columns:
- `company_id`
- `customer_contact_id`
- optional `portal_access_grant_id`
- permission booleans for major customer-facing action categories
- `managed_by_contact_id` or equivalent audit-friendly metadata when customer-side authority changes another contact
- `overridden_by_user_id` for contractor-admin override audit when applicable
- `created_at`
- `updated_at`

Reason not to overload `portal_access_grants`:
- grant status and project visibility are access concerns
- action authority is a different concern
- combining both into one record will make future auditing and override logic harder

### Preserve customer/project scope as the outer gate

Permission evaluation should stay layered:
1. authenticated user exists
2. portal access grant is active
3. grant belongs to the canonical customer
4. project is explicitly active in `portal_project_access`
5. contact permission allows the requested action
6. record status allows the requested action
7. contract signer routing still requires signer assignment for contract signature

This keeps permission logic additive and safe:
- do not weaken existing project scoping
- do not let action permissions bypass customer/project access
- do not let contact permissions rewrite financial or contract lineage

## 4. Permission Categories

Recommended top-level permission categories:

### Estimate permissions

Permissions:
- view estimates
- comment on estimates
- approve estimates
- reject estimates

Notes:
- current portal behavior already supports all of these once project access exists
- first implementation should explicitly gate approve/reject by contact permission

### Contract permissions

Permissions:
- view contracts
- sign contracts
- decline contracts

Notes:
- contract sign/decline must still require signer assignment
- permission should answer whether the contact is eligible to be chosen as a signer
- actual signing should still flow through `contract_signers`

### Change-order permissions

Permissions:
- view change orders
- approve change orders
- reject change orders

Notes:
- current behavior broadly allows approve/reject once project access exists
- first implementation should make that explicit and configurable

### Invoice and payment permissions

Permissions:
- view invoices
- request payment / start checkout
- view payment status and relevant payment history

Notes:
- "view/pay invoices" from user direction should map to these permissions
- payment-recording by contractor staff remains separate and should not move into customer-contact permissions

### Quote-request permissions

Permissions:
- request new quotes
- submit follow-up notes/files related to quote requests when that workflow exists

Notes:
- this is not fully implemented today
- permission category should still exist now so the model does not need a breaking redesign later

### Contact-management permissions

Permissions:
- manage other customer-contact permissions
- manage other customer-contact portal activation

Notes:
- this is where main-contact authority lives
- this should be distinct from commercial workflow permissions

## 5. Default Permission Behavior

Recommended defaults for additional contacts with portal login:
- estimate review and approval: enabled
- contract review and signature eligibility: enabled
- change-order review and approval: enabled
- invoice review and payment initiation: enabled
- quote request initiation: enabled

Recommended non-default authority:
- manage other contacts: disabled unless the contact is the main contact
- contractor-admin override: always allowed for contractor admins

Why this default is safe enough:
- it matches user direction
- it does not change canonical downstream records
- customer/project scope still gates visibility
- contract signature still requires signer routing

Why this still needs explicit permission records:
- future customers will need restricted contacts
- default-enabled is not the same thing as permanently hardcoded-enabled

## 6. Main-Contact Authority

Recommended rule:
- each canonical customer account should have one designated main contact in `customer_contacts`

Recommended authority:
- the main contact can enable or disable workflow permissions for other contacts on the same customer account
- the main contact can activate or suspend another contact’s portal participation for that same customer account
- the main contact cannot escape project scope; they only manage permissions within already-valid customer/project access boundaries

Important boundary:
- the main contact does not replace contractor admin authority
- the main contact does not become a contractor member
- the main contact does not change canonical customer ownership, project ownership, invoice lineage, payment lineage, or contract lineage

Recommended implementation detail:
- treat "main contact" as a customer-contact relationship concern, not a `users` concern
- only one `customer_contacts.is_primary = true` should exist per customer

Recommended rollout choice:
- if legacy customer row email/phone continues as the canonical primary recipient, the first customer-contact build should backfill or create a matching primary contact relationship before broader permission UX is enabled

## 7. Contractor-Admin Override

Recommended rule:
- contractor admins always retain authority to grant, revoke, reactivate, or narrow customer-contact portal access and permissions

Recommended override behavior:
- contractor admin can:
  - create related contacts
  - create portal-linked contact access
  - change main contact designation
  - disable or re-enable any permission
  - revoke project visibility
  - revoke all portal access

Recommended audit expectation:
- customer-managed permission changes and contractor-admin overrides should be distinguishable in audit/event history

Important boundary:
- contractor-admin override should not bypass tenant scoping or project scoping
- it is an authority override, not a scope override

## 8. Portal Login and Invite Flow

### Current implemented behavior

Today:
- the email must already belong to an authenticated FloorConnector user
- no invitation email is sent automatically
- grant creation can mark a user as `invited` or `active`

### Recommended next-phase flow

Phase 1 invite/login recommendation:
1. contractor admin or authorized main contact creates an additional customer contact
2. portal access is optionally enabled for that contact
3. if an authenticated user already exists for that email, link the grant immediately
4. if no authenticated user exists yet, create a pending invite record/state and send invite email in a later phase
5. once the user authenticates, bind that user to the related customer contact and activate the grant

Recommended implementation order:
- first pass should support "existing authenticated user" cleanly for contact-linked grants
- second pass can add true invite delivery and acceptance UX

Recommended guardrail:
- do not create portal-only duplicate customer/contact records just to support invitations
- invite state should still point back to canonical `contacts` and canonical customer relationships

## 9. Customer Detail / Directory UI Plan

### Customer detail first

The first implementation should stay on the canonical customer detail workspace.

Recommended customer detail sections:
- `Overview`
  - existing canonical customer/account details
- `Contacts`
  - list linked `customer_contacts`
  - show main contact
  - add/edit additional contacts
  - portal login state summary per contact
- `Portal Access`
  - keep current grant and project-visibility management
  - pivot presentation from "portal users by raw email" to "customer contacts with portal access"
  - expose permission toggles per contact

Recommended UI approach:
- reuse the existing customer detail workspace and context-card patterns
- do not invent a new shell or detached security subsystem
- keep customer detail as the canonical customer-account workflow home

Implemented now:
- customer detail shows readiness-only portal status for each related contact
- readiness currently means:
  - email present or missing
  - main-contact or additional-contact state
  - clear notice that contact-linked portal access and permission gating are not enabled yet

### Directory follow-on

After customer detail supports contacts safely:
- surface additional customer contacts in `/directory`
- show badges for:
  - main contact
  - portal enabled
  - restricted permissions
  - active/revoked

Implemented now:
- `/directory` surfaces related customer contacts as read-only `Customer Contact` rows
- those rows route back to the parent customer detail page, where management still lives

Still not implemented:
- portal-enabled or active/revoked customer-contact badges
- restricted-permission badges
- contact-linked portal state on Directory rows
- real contact-linked portal grants or invites
- real permission gating on customer-contact rows

Do not make Directory the write source of truth first.
Directory should follow the canonical customer-account workflows, not replace them.

## 10. Security and RLS Risks

### Risk: contact permission layer bypasses project scope

Bad outcome:
- a contact permission toggle allows actions on projects the contact should not see

Guardrail:
- keep `portal_project_access` as the outer gate for all project-bound portal actions

### Risk: grant is linked to user but not to the intended contact

Bad outcome:
- the wrong related contact appears to own the portal actions

Guardrail:
- require one explicit contact linkage per grant in the next phase
- do not keep long-term raw-email-only portal grants for multi-contact customers

### Risk: main-contact authority mutates canonical customer identity

Bad outcome:
- main-contact controls accidentally rewrite customer account ownership or downstream record lineage

Guardrail:
- main-contact authority must operate only on contact permission and grant-management records

### Risk: raw portal scope remains over-broad

Bad outcome:
- any active portal user can still approve/sign/pay because status logic checks exist before permission checks

Guardrail:
- add explicit permission checks to:
  - estimate approval/rejection
  - contract signer eligibility and customer sign/decline
  - change-order approval/rejection
  - invoice payment request / checkout start

### Risk: contractor/admin vs customer-managed changes are indistinguishable

Bad outcome:
- support and audit cannot explain who changed a contact’s authority

Guardrail:
- add mutation audit metadata and/or notification events for permission changes

### Risk: existing audit tables are incomplete for new actions

Current implementation note:
- portal review auditing is already present, but change-order and payment/contact expansions should be rechecked carefully during implementation
- first implementation should verify that all portal audit/event paths support the expanded action surface consistently

## 11. Recommended Implementation Phases

### Phase 1: Customer contacts foundation on customer detail

Status:
- implemented

Goal:
- expose canonical `customer_contacts` on customer detail before introducing fine-grained portal permissions

Recommended work:
- add customer detail `Contacts` section
- list existing linked contacts
- create/edit additional contacts
- support primary/main-contact designation
- keep canonical customer row as the account source of truth

Implemented now:
- customer detail includes a compact `Contacts` section over canonical `contacts` and `customer_contacts`
- contractor-admin server actions support add, edit, and main-contact designation
- related contacts stay subordinate to the canonical customer account
- canonical `customers.email` still drives estimate, contract, and invoice recipient continuity

Out of scope:
- no new portal permission matrix yet
- no invite-delivery automation yet
- no Directory-wide write experience yet

### Phase 2: Contact-linked portal access

Goal:
- tie portal grants to customer contacts explicitly

Readiness foundation already implemented:
- customer detail and Directory now surface readiness-only signals so contractor admins can see which contacts have email coverage before contact-linked portal access is built

Recommended work:
- extend portal grant model to identify the related `customer_contact`
- show portal status per contact
- keep explicit project visibility beneath each grant
- keep existing contractor-admin customer-page management surface

Out of scope:
- no broad permission toggles yet beyond login/access state

### Phase 3: Contact permission categories and defaults

Goal:
- add explicit per-contact authority for estimates, contracts, change orders, invoices/payments, and quote requests

Recommended work:
- add `customer_contact_portal_permissions`
- apply default-enabled permissions on first portal activation
- gate portal actions through the new permission layer
- preserve contract signer routing as a separate requirement on top of permission

### Phase 4: Main-contact authority and contractor-admin override

Goal:
- let the main contact manage other customer contacts safely

Recommended work:
- add customer-side contact-management rules
- add contractor-admin override behavior and audit
- add mutation tracking for permission changes

### Phase 5: Invite flow and Directory convergence

Goal:
- make customer-contact portal onboarding smoother and expose it in Directory

Recommended work:
- add real invite delivery / acceptance flow
- surface customer contacts and permission state in `/directory`
- preserve customer detail as the canonical write home for account-level portal management

## 12. Recommended First Implementation Phase

Recommended first implementation phase:
- build customer-detail `Contacts` management on top of existing `contacts` and `customer_contacts`
- add explicit primary/main-contact management
- prepare portal grant records to link to those contacts

Why this should come first:
- the schema foundation already exists
- customer detail currently jumps straight from canonical customer row to raw portal grants without a visible related-contact layer
- permission logic will stay hard to reason about until each grant has a clear customer-contact identity behind it

This phase should not yet:
- change estimate, contract, invoice, payment, or change-order lineage
- replace customer-row recipient continuity
- weaken project scoping
- introduce a portal-only contact model

## 13. First Implementation Prompt

Use this prompt for the first build pass:

```text
You are continuing FloorConnector after the customer contacts and portal permissions planning pass.

Read first:
- docs/current-state.md
- docs/workflows.md
- docs/developer-source-of-truth.md
- docs/chat-handoff.md
- docs/floorconnector-ui-build-rules.md
- docs/directory-contact-model-plan.md
- docs/customer-contacts-portal-permissions-plan.md

Task:
Do Phase 1 only from docs/customer-contacts-portal-permissions-plan.md.

Scope:
- customer detail customer-contact foundation only
- no estimate, contract, change-order, invoice, or payment logic changes yet
- no invite-email automation yet
- no Directory-wide write experience yet

Required outcomes:
1. Surface canonical related customer contacts on customer detail.
2. Allow contractor admins to add and edit additional contacts using existing `contacts` and `customer_contacts`.
3. Support one main contact designation per customer account.
4. Keep canonical customer row fields as the account-level billing / recipient source of truth in this phase.
5. Reuse the existing customer detail workspace pattern and shared cards; do not introduce a new shell or detached security page.

Files to inspect first:
- apps/web/app/(app)/customers/[customerId]/page.tsx
- apps/web/lib/contacts/data.ts
- apps/web/lib/customers/data.ts
- apps/web/lib/customers/actions.ts
- apps/web/lib/opportunities/data.ts

Guardrails:
- do not replace canonical customers
- do not create portal-only customer/contact copies
- do not change downstream estimate, contract, invoice, payment, or change-order lineage
- do not weaken tenant or project scoping
- do not add a permission matrix yet

Validation:
- run lint or typecheck only if code is edited

Final response:
- list files changed
- list commands run
- list any env vars required
- summarize assumptions made
```

## 14. Recommendation Summary

Recommended direction in one sentence:

Treat additional customer contacts as canonical related contacts beneath a canonical customer account, give each contact an optional portal login anchored to the existing customer/project access model, and add a separate permission layer for customer-facing actions without changing downstream business-record lineage.
