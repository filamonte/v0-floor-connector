# Directory Contact Model Plan

Status: planning and architecture audit only.

This document defines the recommended direction for a unified contractor-side `Directory` concept in FloorConnector without changing the current canonical data model in this pass.

This is intentionally a docs-only plan:
- no schema changes in this pass
- no route rename in this pass
- no table merges in this pass
- no auth model changes in this pass

Cross-reference:
- [current-state.md](C:/FloorConnector/docs/current-state.md)
- [workflows.md](C:/FloorConnector/docs/workflows.md)
- [developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [target-ia.md](C:/FloorConnector/docs/target-ia.md)

## Purpose

FloorConnector now needs a unified contractor-facing `Directory` concept instead of treating `People` as only a workforce roster.

The goal is not to erase canonical boundaries. The goal is to let contractor users find and manage contact-like records in one coherent place while preserving the existing production-first model:
- customers remain canonical account and billing recipients
- opportunities remain canonical pre-customer commercial records
- people remain canonical workforce participants
- vendors remain canonical company records
- portal access remains a scoped access layer on canonical customer and project records
- super admin remains platform-only and stays outside contractor organization directories

## 1. Current Implemented Contact-Like Models

The current system already has multiple contact-like records that serve different responsibilities. Directory should read across them, not collapse them blindly.

### Profiles / Auth Users

Current implemented model:
- canonical auth-aligned `users` table
- one row per authenticated application user
- used for contractor logins, portal logins, and platform admin identity

Current responsibility:
- authentication identity
- global user lifecycle
- base person/user identity for authenticated access

Important boundary:
- `users` is not the contractor directory itself
- not every customer contact, lead contact, or vendor contact should become a contractor app user automatically

### Platform User Roles / Super Admins

Current implemented model:
- `platform_user_roles`
- linked to platform-scoped `roles`

Current responsibility:
- super-admin and platform-only authorization
- separate from contractor tenant membership

Important boundary:
- super admins are not contractor directory entries
- they must remain visible only in `/super-admin`

### Memberships / Contractor Users

Current implemented model:
- `company_memberships`
- company-scoped owner/admin/manager/member authorization

Current responsibility:
- contractor-organization access
- tenant membership and role assignment

Important boundary:
- a contractor user is an organization member, not automatically a workforce person, customer contact, or vendor contact
- some contractor users may also map to `people`, but that remains a separate concern

### People

Current implemented model:
- `people`
- optional `membership_user_id`
- optional `vendor_id`
- `person_type` currently covers `employee` and `subcontractor_worker`

Current responsibility:
- workforce participants
- assignable people for jobs, schedule, time, daily logs, punchlists, and field workflows

Important boundary:
- current `/people` is intentionally workforce-only
- it should not become the storage model for all contact types

### Vendors

Current implemented model:
- `vendors`
- vendor company record with optional primary contact fields on the vendor row

Current responsibility:
- external labor companies, suppliers, and other vendor organizations

Important boundary:
- vendors are canonical company records, not person/contact records
- vendor contact handling is still thin today and needs better relationship modeling later

### Customers

Current implemented model:
- `customers`
- canonical customer account records

Current responsibility:
- account, billing, estimate, contract, invoice, project, and portal recipient continuity
- commercial and financial source-of-truth customer context across the connected workflow

Important boundary:
- customers are account-level business entities, not just people
- customer contact details on the customer row represent primary recipient continuity today
- a customer shown in Directory is the full canonical customer/account record, not a lightweight contact card
- commercial and financial workflows must continue to read canonical customer/account fields unless a later approved customer-contact permission model explicitly changes a specific flow

Current commercial and financial continuity that stays on canonical `customers`:
- estimate send recipient context
- invoice recipient context
- contract signer and customer context
- payment and customer billing context
- project owner and customer account continuity

### Opportunities / Leads

Current implemented model:
- `opportunities`
- linked `primary_contact_id`
- current contact/intake support tables already exist:
  - `contacts`
  - `customer_contacts`

Current responsibility:
- canonical pre-customer commercial record
- qualification and intake continuity before a customer/project chain fully exists

Important boundary:
- leads remain opportunities first, not generic address-book entries
- Directory may surface them as contact-like records without redefining the opportunity model

### Portal Access Grants

Current implemented model:
- `portal_access_grants`

Current responsibility:
- customer-anchored portal login access for authenticated users
- active, invited, and revoked access state

Important boundary:
- portal access is an access layer, not a replacement contact table
- a portal user should remain anchored to canonical customer context

### Portal Project Access

Current implemented model:
- `portal_project_access`

Current responsibility:
- project-by-project visibility beneath a customer-scoped portal grant

Important boundary:
- this is scoped project access, not a separate portal customer model

### Existing Shared Contact Foundation Already In Schema

Also important:
- `contacts` already exists as a canonical organization-scoped contact identity layer
- `customer_contacts` already exists as a relationship table linking customer accounts to contacts

This matters because it provides a safer future path for Directory than overloading `people`, `customers`, or `users`.

## 2. Target Directory Concept

Recommended target concept:

`Directory` should be a unified contractor-side read and management surface over multiple canonical record types:
- contractor admins
- employees
- subcontractors
- customers
- additional customer contacts
- leads
- vendors
- vendor contacts
- miscellaneous contacts

Directory should behave as:
- one search and browse surface
- one shared vocabulary for "contact-like" entities
- one place to understand how a record participates in the business

Directory should not behave as:
- one physical table for everything
- one authorization model for everything
- one RLS policy for everything
- one assumption that every record is a user or login

Recommended mental model:
- `Directory` is a unified view layer
- canonical storage remains specialized by domain
- relationship tables connect contact identities to customers, opportunities, vendors, and access grants
- Directory is not the source of a new merged customer/contact table

## 3. Clear Definitions

### Super Admin

FloorConnector platform owner or employee with platform-scoped authority through `platform_user_roles`.

Rules:
- outside contractor organization directories
- visible only in `/super-admin`
- never shown in contractor `Directory`

### Contractor Admin

Authenticated contractor organization member with elevated tenant authority through `company_memberships`.

Rules:
- belongs to a contractor organization
- may also map to a workforce `people` record if the business wants them represented operationally
- appears in Directory as an organization user, not as a platform admin

### Employee

Internal workforce participant stored on `people` with `person_type = employee`.

Rules:
- can be assignable for operations
- may optionally link to an authenticated contractor user via `membership_user_id`
- remains a workforce record first

### Subcontractor

Recommended business definition:
- the external labor company is the `vendor`
- the individual worker is either a `people` record with `person_type = subcontractor_worker` or a future vendor-contact identity, depending on role

Rules:
- keep vendor company and individual worker distinct
- do not use one record to represent both company and worker

### Customer

Canonical customer account record stored in `customers`.

Rules:
- owns relationship, billing, portal, and project continuity
- may expose one primary recipient on the customer row today
- appears in Directory as the full canonical customer/account record, not as a lightweight contact card
- remains the customer/account source of truth for estimates, contracts, invoices, payments, and project ownership
- should not be replaced in commercial workflows by generic contact records

### Additional Customer Contact

A non-primary contact associated with a canonical customer account, intended for communication and optional portal access.

Rules:
- should not require a separate customer record
- should have its own contact identity
- may have its own portal login
- should share the parent customer/project context through relationship and portal grant layers
- does not replace the canonical customer/account record

### Lead

Canonical opportunity record before customer conversion.

Rules:
- remains an `opportunity`
- may appear in Directory through its linked primary contact identity
- should still route into lead/opportunity workflows, not customer workflows

### Vendor

Canonical external company record stored in `vendors`.

Rules:
- represents the outside business entity
- may later have multiple contact identities beneath it

### Vendor Contact

A person/contact associated with a vendor company for procurement, scheduling, billing, or subcontract coordination.

Rules:
- should not be modeled by overloading vendor primary-contact text fields forever
- should stay distinct from workforce `people` unless that individual is truly a subcontractor worker in operational workflows

### Miscellaneous Contact

A tenant-scoped contact identity that does not yet belong cleanly to customer, vendor, or workforce flows.

Examples:
- referral source
- landlord/facility contact
- architect/designer
- property manager
- GC-side coordination contact

Rules:
- should be allowed in Directory later
- should not force premature creation of a customer, vendor, or workforce person record

## 4. Recommended Canonical Data Approach

### What Stays In Existing Tables

Keep these as the primary canonical records:
- `users` for authenticated identity
- `platform_user_roles` for super-admin authorization
- `company_memberships` for contractor organization access
- `people` for workforce people only
- `vendors` for vendor companies
- `customers` for customer accounts
- `opportunities` for leads
- `portal_access_grants` for customer-scoped portal access
- `portal_project_access` for project-scoped portal visibility

Also keep using:
- `contacts` as the reusable contact-identity foundation
- `customer_contacts` as the bridge between customer accounts and contact identities

Customer-specific guardrail:
- Directory may show customer accounts and related customer contacts together, but it must not introduce a duplicate customer/contact source of truth alongside canonical `customers`

### What May Need A New Relationship Table Later

Likely future additions:
- `vendor_contacts`
  - joins a vendor company to one or more contact identities
- `contact_portal_permissions`
  - if portal permissions outgrow safe fields on `portal_access_grants`
- `customer_contact_project_roles`
  - only if project-level contact responsibilities become richer than portal visibility alone
- `directory_contact_labels` or equivalent
  - only if flexible tagging becomes necessary after core flows are stable

Not recommended yet:
- a universal `directory_entities` write table
- merging `people`, `customers`, `vendors`, and `opportunities` into one polymorphic business table

### What Should Be Shown Together In Directory Without Becoming One Physical Table

Directory should unify these record families in one read layer:
- workforce people from `people`
- contractor organization users from `company_memberships` plus `users`
- customer accounts from `customers`
- additional customer contacts from `contacts` plus `customer_contacts`
- lead contacts from `opportunities` plus `contacts`
- vendor companies from `vendors`
- future vendor contacts from `contacts` plus a vendor relationship table
- future miscellaneous contacts from `contacts`

Recommended UI shape:
- one shared list/search experience
- type badges and role badges
- record-source-aware links
- filters by `Workforce`, `Customers`, `Leads`, `Vendors`, `Users`, `Portal`, and later `Misc`

For customer entries specifically:
- Directory should display and edit the pertinent canonical customer/account information needed by commercial and financial workflows
- that includes:
  - name and company
  - email
  - phone
  - billing/contact address
  - service or project address context where appropriate
  - tax exemption status
  - default retainage
  - notes
  - portal access and contact permissions when those flows are implemented
- this should be customer-account editing on canonical `customers`, not a parallel generic-contact editing model

Recommended customer-account workspace shape inside Directory:
- `Overview`
  - canonical customer/account details
  - billing/contact address
  - service or project address context where appropriate
  - tax exemption and retainage defaults
  - notes and account continuity details
- `Contacts`
  - additional customer contacts beneath the canonical customer/account
  - relationship labels, primary-contact designation, and later contact-specific permissions entry points
- `Projects`
  - linked project/account continuity and downstream record visibility
- `Portal Access`
  - customer portal access management for the canonical customer/account and its related contacts
  - invite, activate, revoke, or suspend portal access
  - reset portal credentials or trigger a credential-recovery flow
  - project-scoped access controls
  - per-contact permissions for estimates, contracts, invoices/payments, change orders, and later quote requests
  - main-contact management authority plus contractor-admin override
- `Billing` or `Financial`
  - optional future grouping for customer-specific commercial and financial defaults if the customer workspace grows dense

Preferred naming:
- use `Portal Access` as the tab label
- avoid a broad `Security` tab label by default

Reason:
- `Portal Access` is more precise for contractor users
- `Security` risks blurring customer portal controls with broader platform auth, tenant membership, or system-admin concepts that do not belong on a customer account workspace

## 5. Portal Access Model For Additional Customer Contacts

Recommended model:
- each additional customer contact gets its own auth login
- the login remains a real `users` identity
- access is granted through `portal_access_grants`
- project visibility stays constrained through `portal_project_access`
- the contact shares customer/project context by relationship, not by duplicating customer records
- the contact does not replace the canonical customer/account fields used by core estimate, contract, invoice, payment, or project workflows

Recommended behavior:
- one customer account can have multiple customer contacts
- each contact can have independent portal activation state
- each contact can be granted different project visibility
- each contact can hold different customer-facing permissions

Main contact management recommendation:
- each customer should have one designated main contact in the customer-contact relationship layer
- that main contact should be allowed to manage whether other customer contacts can review/approve/sign/pay within the same customer account context
- contractor admins should retain override authority

Important boundary:
- do not treat portal users as tenant contractor memberships
- do not attach customer contacts to contractor workforce roles
- do not expose full customer-wide access automatically if project scoping should remain explicit
- keep portal credential reset and permission management inside the customer-account `Portal Access` workspace rather than inventing a second detached security-only customer subsystem

## 6. Approval / Action Permission Model

Recommended policy direction:
- additional customer contacts should default to enabled permissions for the main customer-facing commercial flows
- those permissions should be adjustable per contact
- the main contact should be able to enable or disable them
- contractor admins should always be able to manage them

Recommended permission buckets:

### Estimates

Default:
- enabled

Suggested permissions:
- review estimate
- approve estimate
- decline estimate

### Contracts

Default:
- enabled

Suggested permissions:
- review contract
- sign contract
- decline contract

### Invoices / Payments

Default:
- enabled

Suggested permissions:
- review invoice
- initiate payment
- view payment status/history relevant to shared access

### Change Orders

Default:
- enabled

Suggested permissions:
- review change order
- approve change order
- reject change order

### Quote Requests

Default:
- enabled when quote-request workflows exist

Suggested permissions:
- review quote request
- respond to quote request
- supply requested files or notes

Implementation note:
- this should be modeled as customer-contact portal permissions, not as contractor membership permissions
- do not reuse workforce `people` assignment or contractor role matrices for customer-contact approval authority
- do not make estimate, invoice, contract, or payment flows read from generic contacts instead of canonical customer/account fields unless a later approved permission model explicitly updates that flow

## 7. Recommended Route / Navigation Plan

### Should `/people` Become `/directory`?

Yes, but not in this pass.

Recommended direction:
- contractor-facing concept should become `Directory`
- current workforce-only implementation should remain technically stable until Directory read-model work is ready

Important current-state note:
- the app already has a `/directory` alias that points at the current `/people` page
- current copy still describes the page as workforce-only

### Should Legacy `/people` Redirect?

Eventually yes.

Recommended end state:
- `/directory` becomes the canonical contractor route
- `/people` becomes a legacy redirect for compatibility
- workforce-specific subviews can still exist inside Directory as filters or dedicated tabs

### How Labels Should Change

Phase-first recommendation:
- navigation label: `Directory`
- page title: `Directory`
- initial subtitle: explain that this is a unified contact and workforce surface that will expand over time
- workforce-specific text should move into sub-filters such as `Workforce`

Do not do yet:
- do not imply that current `/people` already manages customers, portal contacts, leads, and vendor contacts if the read layer still only shows workforce

## 8. Security / RLS Risks

Primary risks:

### Tenant Boundary Bleed

If Directory reads across many record types through one query layer, it becomes easier to accidentally expose customer, vendor, lead, or portal records across tenants.

Guardrail:
- keep each underlying table on its own RLS-safe source query
- compose tenant-safe application results after scoped reads

### Auth Identity Confusion

If `users`, `company_memberships`, portal grants, and contact identities are blurred together, the app may accidentally treat a portal user like a contractor member or vice versa.

Guardrail:
- keep login identity, tenant membership, and contact relationship as separate concepts

### Super Admin Leakage

If Directory begins from all users instead of tenant-scoped directory sources, super-admin users could appear in contractor views.

Guardrail:
- never source contractor Directory from raw global users
- contractor Directory must remain organization-scoped

### Over-Broad Portal Access

If additional customer contacts are attached directly to customers without project scoping or permission scoping, they may see too much.

Guardrail:
- preserve `portal_access_grants` plus `portal_project_access`
- add per-contact permissions without removing project-level gates

### Workforce / Contact Role Drift

If `people` expands too broadly, field assignment, time tracking, and labor workflows could become polluted with non-workforce contacts.

Guardrail:
- keep `people` operational and workforce-safe
- use contact relationship layers for non-workforce directory entries

## 9. What Not To Do

Do not:
- merge customers, people, vendors, leads, and portal users into one table
- make `users` the Directory table
- treat portal contacts as contractor organization members
- treat customer contacts as workforce people
- turn canonical customers into lightweight contact cards
- treat vendor companies as person/contact records
- move super admins into tenant directories
- weaken project-scoped portal access
- replace customer account continuity with contact-only continuity
- make estimate, invoice, contract, payment, or project-owner flows depend on generic contact rows by default
- overload customer row fields as the forever-home for multiple customer contacts
- overload vendor primary-contact text fields as the forever-home for vendor contact management
- make Directory the source of truth for business entities; it is a cross-entity surface

## 10. Suggested Implementation Phases

### Phase 1: Docs + Wording Rollback / Cleanup

Goal:
- align product language before expanding behavior

Recommended work:
- update active docs to describe `Directory` as the target contractor concept
- keep current implementation truth explicit: workforce-only today
- update navigation copy and route labels only where safe
- remove wording that implies customer contacts must stay outside a future Directory forever

No schema changes.
No route rename required.

### Phase 2: Unified Directory Read-Only View Over Existing Records

Goal:
- build one contractor-facing Directory index over current canonical models

Recommended work:
- add read-model loaders that aggregate:
  - people
  - contractor members
  - customers
  - opportunities/leads
  - vendors
  - customer contacts from `contacts` plus `customer_contacts`
- add filters, badges, and source-aware links
- keep edit flows routed back to canonical surfaces initially

No table merge.
Prefer read-only convergence first.

### Phase 3: Customer Additional Contacts + Portal Access Permissions

Goal:
- support multiple customer contacts with independent portal access and action permissions

Recommended work:
- expose customer contact management cleanly
- allow each contact to have its own login and portal grant
- add per-contact customer-facing permission controls
- allow main contact management plus contractor-admin override

Preserve:
- customer account anchor
- project-scoped portal visibility
- tenant isolation

### Phase 4: Vendor Contacts And Misc Contacts

Goal:
- support non-workforce vendor contacts and general directory entries safely

Recommended work:
- introduce vendor-contact relationship modeling
- add misc contact support on top of shared contact identity
- surface them in Directory with clear category badges

Avoid:
- forcing vendor contacts into `people` unless they are true operational workers

### Phase 5: Route Rename `/people` -> `/directory`

Goal:
- finalize the product vocabulary after the data/read model is real

Recommended work:
- make `/directory` the canonical route
- redirect `/people`
- preserve workforce-specific views inside Directory
- update shared links, breadcrumbs, and search results

## 11. First Implementation Prompt After This Plan

Use this prompt for the first build pass:

```text
You are continuing FloorConnector.

Read first:
- docs/current-state.md
- docs/developer-source-of-truth.md
- docs/floorconnector-ui-build-rules.md
- docs/target-ia.md
- docs/directory-contact-model-plan.md

Task:
Do Phase 1 only from docs/directory-contact-model-plan.md.

Scope:
- docs and wording cleanup only
- no schema changes
- no portal permission implementation
- no route rename
- no new data loaders

Required outcomes:
1. Update active docs that still describe `/people` as permanently workforce-only so they instead describe:
   - current implementation truth: workforce-first today
   - target direction: contractor Directory over multiple canonical record types
2. Audit contractor navigation copy and safe route labels for `Directory` language without changing route behavior.
3. Keep super-admin outside contractor Directory language.
4. Preserve the rule that customer, vendor, opportunity, workforce, membership, and portal models remain distinct canonical records.

Files to consider updating if needed:
- docs/current-state.md
- docs/developer-source-of-truth.md
- docs/chat-handoff.md
- docs/target-ia.md
- apps/web/lib/navigation/navigation-config.ts
- apps/web/app/(app)/people/page.tsx

Guardrails:
- do not build unified Directory data loading yet
- do not rename `/people` to `/directory` yet
- do not change schema
- do not imply that customer contacts already work as a complete multi-contact portal model if they do not

Validation:
- run lint or typecheck only if code is edited

Final response:
- list files changed
- list commands run
- note whether any user-visible labels changed
- summarize any assumptions
```

## Recommended Model Direction Summary

Recommended direction in one sentence:

Build `Directory` as a unified contractor-facing read and management surface over separate canonical models, where customer entries remain the full canonical `customers` account records and related customer contacts remain subordinate relationship records rather than a replacement customer model.
