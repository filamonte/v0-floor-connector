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
- customers
- projects
- estimates
- estimate line items
- jobs

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
- `/customers`
- `/projects`
- `/estimates`
- `/jobs`
- `/settings`

## Business Objects Implemented

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

## Current Workflow Coverage

The current implemented workflow foundation supports:
- user authentication into a protected contractor app
- automatic first-user tenant bootstrap
- customer management
- project management
- estimate authoring with line items and totals
- estimate proposal review and status progression
- conversion of approved or project-based work into jobs/work orders

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
- billing/subscriptions
- advanced permissions UI
- customer portal workflows
- super admin workflows
- organization-level module enable/disable system
- invoices/payments in FloorConnector itself

## Directional Notes

The current implementation is moving toward:
- `Project` as the operational root
- broader company-management coverage than simple CRM
- organization-level module control
- one shared canonical platform model across contractor app, portal, and admin surfaces
