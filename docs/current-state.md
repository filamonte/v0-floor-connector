# Current State

This document summarizes the current implemented architecture and feature foundation in the FloorConnector monorepo.

## Repository Shape

- Monorepo managed with `pnpm` and `turbo`
- Active product surface: `apps/web`
- Background/integration app reserved: `apps/worker`
- Shared packages currently used for config, types, domain logic, UI, database access, and integrations
- Supabase migrations live in `supabase/migrations`

## Current Architecture

FloorConnector is currently implemented as a modular monolith on a shared multi-tenant foundation.

Core architectural characteristics:
- Next.js App Router in `apps/web`
- Supabase for authentication, database access, and row-level-security-backed tenant isolation
- shared canonical business entities across modules
- organization-aware authorization and membership-based access
- server actions plus server-side data utilities for protected business workflows

Current shared canonical model includes:
- users/profile extension
- organizations
- memberships
- organization financial settings
- platform template seeds
- document templates
- customers
- projects
- estimates
- estimate line items
- schedule of values
- schedule of value items
- jobs
- contracts
- invoices
- invoice line items
- payments

## Authentication

Authentication is real and already implemented with Supabase Auth.

Implemented auth capabilities:
- Google OAuth
- email/password signup
- email/password login
- sign out
- auth callback handling
- middleware-backed protected route enforcement
- authenticated redirect handling

Current auth routes:
- `/login`
- `/signup`
- `/forgot-password`
- `/update-password`
- `/auth/callback`

Compatibility aliases still exist:
- `/sign-in`
- `/sign-up`

Protected post-auth landing:
- `/dashboard`

## Multi-Tenant Foundation

Tenant isolation is already part of the working system.

Implemented tenant foundation:
- authenticated users bootstrap into the app data model on first entry
- first-time users receive:
  - profile record
  - organization/company record
  - owner membership
- repeat logins do not duplicate profile/org/membership records
- tenant-owned tables use Supabase RLS
- protected app queries are scoped to the active organization membership

Membership roles currently supported:
- `owner`
- `admin`
- `manager`
- `member`

## Protected App Shell

The protected contractor app shell is implemented and organization-aware.

Current shell behavior:
- shared protected layout for authenticated app routes
- top navigation
- sign out action
- current organization display
- organization-aware breadcrumbs
- role-aware navigation visibility

Current protected routes include:
- `/dashboard`
- `/leads`
- `/customers`
- `/projects`
- `/estimates`
- `/contracts`
- `/invoices`
- `/jobs`
- `/settings`

## Business Objects Implemented

### Leads / Opportunities

Implemented:
- organization-scoped opportunity schema
- create/list/read/update flows
- protected leads list page
- lead detail page
- canonical lead-to-estimate conversion flow that creates or links the downstream customer and project records as needed

Opportunity statuses currently implemented:
- `new`
- `contacted`
- `qualified`
- `site_assessment_scheduled`
- `site_assessment_complete`
- `estimating`
- `proposal_sent`
- `won`
- `lost`
- `converted`

Opportunities currently link to:
- optional customer
- optional project

Current opportunity design notes:
- opportunities are the canonical pre-project commercial record
- the protected leads surface now starts the contractor revenue path before a full project exists
- starting the estimate flow from an opportunity creates or links the canonical customer and project chain instead of introducing duplicate intake-specific entities

### Customers

Implemented:
- organization-scoped customer schema
- create/list/read/update flows
- protected customers list page
- customer detail page

Starter fields include:
- name
- company name
- phone
- email
- address fields
- tax exemption status and metadata
- default retainage percentage
- notes
- timestamps

### Projects

Implemented:
- organization-scoped project schema
- create/list/read/update flows
- project-to-customer relationship
- protected projects list page
- project detail page

Starter fields include:
- name
- customer
- status
- description
- location fields
- timestamps

### Estimates

Implemented:
- organization-scoped estimate schema
- create/list/read/update flows
- project-to-estimate relationship
- customer derived from project
- proposal-style estimate detail page
- dedicated estimate edit page
- status transition actions

Estimate statuses currently implemented:
- `draft`
- `sent`
- `approved`
- `rejected`

### Estimate Line Items

Implemented:
- estimate line item schema
- line-item-based estimate editor
- add/edit/remove line items
- database-calculated subtotal and total logic
- tax and discount support
- approved-estimate-triggered schedule-of-values seeding foundation

Estimate totals are currently derived from:
- line item totals
- tax amount
- discount amount

### Jobs

Implemented:
- organization-scoped jobs/work orders schema
- create/list/read/update flows
- protected jobs list page
- job detail page
- create-job flow from project
- create-job flow from approved estimate

Job statuses currently implemented:
- `unscheduled`
- `scheduled`
- `in_progress`
- `completed`
- `canceled`

Jobs currently link to:
- project
- customer
- optional approved estimate

### Invoices

Implemented:
- organization-scoped invoice schema
- create/list/read/update flows
- protected invoices list page
- invoice detail page
- create-invoice flow from project
- create-invoice flow from approved estimate
- create-invoice flow from job
- line-item-based invoice editor
- invoice-linked payment recording foundation
- org financial setting aware tax and retainage scaffolding
- reporting-ready taxable/exempt/tax-collected foundations
- shared template reference foundation

Invoice statuses currently implemented:
- `draft`
- `sent`
- `partially_paid`
- `paid`
- `void`

Invoices currently link to:
- project
- customer
- optional approved estimate
- optional job

Current invoice design notes:
- invoices remain canonical financial records rather than an isolated module model
- customer and project context stay linked through existing shared entities
- `billing_model` is included so future AIA/progress billing can extend the same canonical invoice header without replacing v1
- invoice tax, exemption, and retainage values are snapshotted on the invoice so later customer/org setting changes do not break reporting history

### Invoice Line Items

Implemented:
- invoice line item schema
- add/edit/remove line item UI inside invoice create and detail flows
- database-calculated invoice subtotal and total logic

Invoice totals are currently derived from:
- line item totals
- org tax defaults plus customer exemption snapshots
- discount amount
- retainage held amount

### Payments

Implemented:
- canonical payment schema linked directly to invoices
- basic payment recording flow from invoice detail
- automatic invoice balance due updates from recorded payments
- automatic `partially_paid` and `paid` invoice status handling

Payment design notes:
- payment records remain invoice-linked and organization-scoped
- future online payments should extend the canonical payment record rather than create a second payment model

### Financial Settings, Tax, And AIA Scaffolding

Implemented:
- organization-level financial settings foundation for default tax rate and tax behavior
- customer-level tax exemption and exemption metadata
- customer-level retainage default
- invoice tax reporting view foundation for taxable sales, exempt sales, tax collected, and reporting-period grouping
- schedule-of-values foundation derived from approved estimate line items

Current design notes:
- external tax providers are not integrated yet, but the organization financial settings model includes extension points for them
- schedule-of-values records stay linked to approved estimate items instead of creating disconnected AIA-only source data
- percent complete, prior billed, current billed, retainage held, and retainage release are scaffolded in the SOV layer for future pay-application workflows

### Shared Templates

Implemented:
- shared organization-scoped `document_templates` foundation for estimate, invoice, and contract workflows
- platform-managed template seed definitions that can be copied into contractor organizations as editable tenant-owned templates
- shared merge-data preparation utilities for organization, customer, project, estimate, invoice, and contract-generation contexts
- default-template resolution helpers for estimate, invoice, and contract workflows

Current design notes:
- organization templates are editable copies and do not stay coupled to a mutable global platform template record
- estimate and invoice records now support optional shared template references instead of module-specific template models
- contract template generation is shared through the same template and merge-data foundation

### Contracts

Implemented:
- organization-scoped contract schema
- contract generation from approved estimate and project context
- protected contracts list page
- contractor-side contract detail/review page
- lightweight draft contract editing flow
- shared-template-backed rendered contract content
- canonical contract status lifecycle scaffolding
- contract revision snapshot foundation for pre-sign edits
- signature-started lock behavior scaffold

Contract statuses currently implemented:
- `draft`
- `sent`
- `viewed`
- `signed`
- `void`

Contracts currently link to:
- project
- customer
- optional approved estimate
- shared document template

Current contract design notes:
- contracts are canonical records, not detached documents
- contract rendering is generated from the shared template system and canonical merge data
- signed contracts remain connected to the same estimate and project context used for downstream billing workflows
- contract content may be lightly edited while still in draft
- once signature activity begins, unrestricted editing is locked on the canonical contract record
- future e-sign integrations are expected to attach provider metadata and signature lifecycle events to the same contract record rather than creating a separate signed-document silo

## Current Workflow Coverage

The current implemented workflow foundation supports:
- user authentication into a protected contractor app
- automatic first-user tenant bootstrap
- customer management
- project management
- estimate authoring with line items and totals
- estimate proposal review and status progression
- conversion of approved or project-based work into jobs/work orders
- invoice creation and maintenance from connected project, estimate, and job records
- invoice line-item-based totals
- payment recording with invoice balance and paid-state recalculation
- tax-aware invoice calculation using org defaults and customer exemption state
- retainage-aware invoice balance foundation
- approved estimate item seeding for future AIA/progress billing
- shared template selection and merge-data preparation for estimate, invoice, and contract document workflows
- approved-estimate-to-contract generation with canonical rendered contract records
- pre-sign contract editing with audit-friendly revision snapshots and signature-lock enforcement

## What Exists But Is Still Minimal

These surfaces exist but are still foundational rather than production-complete:
- dashboard
- settings
- jobs/work-order execution UX
- proposal review/share UX
- project workspace structure

## What Is Not Implemented Yet

Not implemented yet:
- full scheduling/calendar system
- crew assignment
- notifications
- PDF generation
- e-signature
- external payment gateway flows
- billing/subscriptions
- advanced permissions UI
- customer portal workflows
- super admin workflows
- organization-level module enable/disable system
- payments in FloorConnector itself
- full AIA/progress billing UX
- external tax provider integration
- rich template editing UI
- e-sign integration workflows on top of the canonical contract record

## Directional Notes

The current implementation is moving toward:
- `Project` as the operational root
- broader company-management coverage than simple CRM
- organization-level module control
- one shared canonical platform model across contractor app, portal, and admin surfaces
