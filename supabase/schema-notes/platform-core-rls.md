# Platform Core RLS Pattern

## Scope
This RLS pass establishes the first tenant-isolation pattern for:
- companies
- locations
- company_memberships
- roles
- feature_flags
- company_subscriptions

## Pattern
- RLS is enabled and forced on tenant-owned core tables.
- Access is based on active company membership, not UI filtering.
- Policies use small SQL helper functions so later tables can reuse the same pattern.
- Membership lookups run through `security definer` helpers to avoid recursive RLS problems on `company_memberships`.

## First-Pass Behavior
- Authenticated users can read company-owned records only for companies where they have an active membership.
- Users can also read their own membership rows, which supports future invite and tenant-loading flows.
- Platform-scoped roles and platform-scoped feature flags are intentionally not exposed yet.
- Insert, update, and delete policies are intentionally deferred until role semantics and admin rules are explicit.

## Reuse Pattern For Later Tables
For a future tenant-owned table with `company_id`, the base read policy should usually look like:

```sql
using ((select public.is_active_company_member(company_id)))
```

If a table is user-specific within a company, combine company membership checks with row ownership rules as needed.
