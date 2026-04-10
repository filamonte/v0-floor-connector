# Platform Core Foundation

## Migration Naming Convention
Use:

`YYYYMMDDHHMMSS_descriptive_name.sql`

Example:

`20260409233000_platform_core_foundation.sql`

This keeps migrations ordered, reviewable, and safe for future team work.

## Scope
This foundation migration establishes only the platform skeleton:
- canonical users
- companies
- multiple company locations
- memberships
- roles and permissions
- feature flags
- subscription plans and company subscriptions

It intentionally does not create:
- CRM tables
- deals or leads
- jobs or projects
- billing artifacts beyond subscription skeleton
- messaging, compliance, or document workflow tables
- RLS policies

## Design Notes
- `public.users.id` is the same UUID as `auth.users.id` to preserve one canonical application user per authenticated person.
- `company_id` appears on tenant-owned records from the start.
- role scope is explicit and limited to `platform` or `company`; inheritance is intentionally deferred.
- lifecycle and retention timestamps are included early so trial, grace, lockout, suspension, backup, and restoration logic can be layered in without schema churn.
- foreign keys are indexed where they are likely to become common join and policy paths.
