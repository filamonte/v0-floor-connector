# Security Threat Model

Status: Active
Doc Type: Security / Planning

This document captures the current security threat model for FloorConnector as a production-first, multi-tenant SaaS platform. It is a planning and review artifact only. It does not authorize schema changes, provider changes, billing changes, portal-access changes, or runtime behavior by itself.

Use with:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/auth-setup.md](C:/FloorConnector/docs/auth-setup.md)
- [docs/system-risk-register.md](C:/FloorConnector/docs/system-risk-register.md)
- [docs/system-integration-architecture.md](C:/FloorConnector/docs/system-integration-architecture.md)
- [supabase/schema-notes/platform-core-rls.md](C:/FloorConnector/supabase/schema-notes/platform-core-rls.md)

## Scope

In scope:

- Contractor web app, customer portal, and super-admin surfaces in `apps/web`
- Supabase Auth, Postgres, Storage, RLS, and service-role usage
- Canonical tenant-owned business records across the lifecycle
- Portal grants, project access, signatures, payments, exports, imports, and provider webhooks
- Current and planned integration boundaries documented in this repository

Out of scope for this document:

- Penetration-test results
- Full compliance mapping for SOC 2, HIPAA, PCI DSS, or state privacy laws
- Provider-specific security attestations
- Detailed incident response runbooks

## Security Objectives

FloorConnector security work should protect these outcomes:

- Tenant isolation: users can access only records owned by organizations they are authorized to use.
- Canonical record integrity: business state changes happen through validated workflows, not duplicated or bypassed models.
- Identity integrity: authentication is centralized and user identity is not forked per module or surface.
- Portal least privilege: customer contacts see and act only on explicitly shared records.
- Provider integrity: Stripe, email, signature, and future integration callbacks are verified before state changes.
- Secret containment: API keys, service-role keys, webhook secrets, tokens, and raw provider credentials stay out of logs, exports, docs, and client bundles.
- Auditability: commercially important actions remain attributable and reconstructable.
- Availability: public intake, portal actions, and protected workflows resist abuse without weakening tenant boundaries.

## Primary Assets

| Asset                                                          | Security requirement                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Supabase Auth identities                                       | One canonical authenticated user per person; provider choice must not create parallel authorization models.  |
| Organization and membership records                            | Organization-aware role checks before tenant-owned reads or writes.                                          |
| Platform user roles                                            | Separate from contractor organization roles; platform admin access must be explicit and auditable.           |
| Canonical lifecycle records                                    | Tenant-owned by organization and protected by RLS plus server-side authorization.                            |
| Portal grants and project access                               | Scoped to the customer contact and project; never treated as contractor membership.                          |
| Contracts, signature events, invoices, payments, and revisions | Preserve workflow integrity and immutable evidence where implemented.                                        |
| Documents, attachments, exports, and import batches            | Avoid leaking tokens, secrets, raw provider payloads, internal cost, or cross-tenant data.                   |
| Service-role key and provider secrets                          | Server-only, centralized env access; never exposed to browser code or stored in docs.                        |
| Webhook endpoints                                              | Verify signatures, handle replay/idempotency, and avoid automatic tenant activation without approved policy. |

## Trust Boundaries

| Boundary                                       | Threats                                                                               | Required controls                                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Browser to Next.js server actions/routes       | Input tampering, CSRF-like workflow abuse, privilege escalation through hidden fields | Server-side validation, authenticated session checks, tenant resolution from server-side membership, safe redirect handling          |
| Next.js server to Supabase with user session   | Broken RLS, incorrect tenant filter, overbroad select/update                          | RLS enabled and forced for tenant-owned tables, explicit `company_id` scoping, least-privilege queries                               |
| Next.js server to Supabase service-role client | Tenant bypass, accidental broad writes, secret exposure                               | Admin client only in narrow server utilities, explicit authorization before service-role operations, no client import paths          |
| Contractor app to customer portal              | Portal-only customer access becoming contractor access                                | Portal grants and project access separate from memberships; portal actions scoped to shared records                                  |
| Public intake to canonical records             | Spam, tenant spoofing, mass assignment, fake downstream records                       | Server-side tenant/domain/form validation, rate limiting, bot checks, intake-level writes only                                       |
| Provider webhooks to internal state            | Forged callbacks, replay, out-of-order events, raw payload leakage                    | Signature verification, idempotency ledgers, event ordering rules, payload minimization                                              |
| Super-admin to tenant operations               | Global operator accidentally changing tenant-owned business truth                     | Platform roles separate from memberships, read-only posture where possible, auditable operational actions                            |
| Export/import boundary                         | Sensitive field leakage, unsafe import writes, cross-tenant duplicate signals         | Exclude secrets/tokens/raw provider fields, dry-run before writes, tenant-scoped duplicate checks, explicit approval before mutation |

## Threat Scenarios

| ID  | Scenario                                                                                                               | Impact   | Likelihood | Current posture                                                               | Required next control                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| T1  | Authenticated contractor reads another organization's records through a missing tenant filter.                         | Critical | Medium     | RLS is a stated mandatory pattern and many tenant-owned tables force RLS.     | Continue RLS review for every new tenant table; add regression tests for cross-tenant denial on critical workflows. |
| T2  | Server action trusts a submitted `companyId` or record id without re-resolving membership.                             | Critical | Medium     | Architecture rules require server-side tenant checks.                         | Audit high-risk mutations for membership resolution and Zod validation before expanding workflows.                  |
| T3  | Service-role client is used in a broad helper that bypasses tenant authorization.                                      | Critical | Medium     | Admin client exists for server use; docs require centralized env access.      | Keep service-role usage isolated and document each allowed use case with caller authorization expectations.         |
| T4  | Customer portal contact accesses a project, estimate, contract, invoice, or print view outside their grant.            | Critical | Medium     | Portal model uses grants and project access rather than duplicate records.    | Add route-level portal access tests for all shared record views and portal-scoped print routes.                     |
| T5  | Platform admin role is confused with contractor owner/admin membership.                                                | High     | Low        | Auth docs separate `platform_user_roles` from organization membership roles.  | Keep super-admin checks centralized; test contractor owner cannot reach `/super-admin`.                             |
| T6  | Stripe or future provider webhook is forged or replayed to mutate payment, subscription, or activation state.          | Critical | Medium     | Billing docs call out signed webhook reconciliation and replay boundaries.    | Maintain signature verification and idempotency ledgers; keep live activation behind explicit policy gates.         |
| T7  | Export includes secrets, tokens, raw provider payloads, internal cost, or portal invite material.                      | High     | Medium     | Export docs and UI copy exclude sensitive fields.                             | Keep export schemas allowlisted and add tests for excluded fields before broadening exports.                        |
| T8  | Import workflow mutates canonical customers or contacts from untrusted CSV data before operator approval.              | High     | Medium     | Current import is dry-run/read-only and no-mutation.                          | Preserve explicit approval, create/link-only first phase, audit evidence, and rollback planning before write work.  |
| T9  | Public intake endpoint lets an attacker spoof another contractor tenant or create downstream customer/project records. | High     | Medium     | Public intake architecture is planning-only and requires server validation.   | Implement tenant resolution, rate limiting, spam checks, and intake-only writes before launch.                      |
| T10 | Stored documents or attachment paths expose cross-tenant files.                                                        | High     | Medium     | Shared documents bucket uses organization-first paths per current-state docs. | Keep storage policies tenant-aware and avoid guessable public object access for tenant files.                       |
| T11 | Redirect or callback handling sends users to attacker-controlled locations.                                            | High     | Low        | Auth docs state only safe internal `next` paths are honored.                  | Keep redirect validation centralized and test external/protocol-relative rejection.                                 |
| T12 | Logs, support notes, docs, screenshots, or chat include provider secrets or raw payloads.                              | High     | Medium     | Docs and UI copy repeatedly warn not to paste secrets.                        | Redact logs by default; keep operational docs free of live secrets and use provider dashboards for secret handling. |

## STRIDE Summary

| Category               | Main FloorConnector risk                                                                            | Baseline mitigation                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Spoofing               | Fake user, portal contact, public intake submitter, or webhook sender                               | Supabase Auth, portal grants, webhook signatures, server-side tenant resolution |
| Tampering              | Hidden form fields or API payloads altering records outside allowed workflow                        | Zod validation, server actions, canonical workflow checks, RLS                  |
| Repudiation            | Commercially important actions lack actor or event evidence                                         | Payment/signature events, revision snapshots, audit-oriented records            |
| Information disclosure | Cross-tenant records, sensitive exports, leaked service keys, exposed attachments                   | RLS, allowlisted exports, server-only env access, tenant-safe storage           |
| Denial of service      | Public intake spam, webhook floods, expensive cross-tenant queries                                  | Rate limits, idempotency, scoped queries, provider replay controls              |
| Elevation of privilege | Contractor role becomes platform admin, portal contact gains contractor access, service-role bypass | Separate role layers, explicit checks, narrow admin-client usage                |

## Current Gaps And Review Backlog

These are security follow-up tasks, not approvals to implement broad features:

1. Create a repeatable RLS review checklist for every new migration that adds a tenant-owned table.
2. Add focused cross-tenant denial tests for high-value records: projects, estimates, contracts, invoices, payments, portal grants, and documents.
3. Inventory all service-role client call sites and document the caller authorization contract for each.
4. Add security regression cases for safe redirects and `/super-admin` access denial from contractor-only accounts.
5. Keep export schemas allowlisted and add tests that sensitive fields stay excluded.
6. Before public intake launch, define rate limiting, spam checks, tenant/domain validation, and intake-only write constraints.
7. Before live SaaS billing launch, finish webhook replay, idempotency, manual activation, and rollback policy gates.
8. Before import writes, complete row-decision approval, write audit, rollback, and duplicate-resolution controls.

## Operating Rules

- Do not add tenant-owned persistence without RLS, indexes for common access paths, and explicit `company_id` ownership unless the record is clearly platform-level.
- Do not add protected mutations that trust client-supplied tenant context.
- Do not expose service-role keys, provider secrets, webhook secrets, or raw provider payloads to browser code, exports, logs, docs, or support notes.
- Do not let portal permissions become contractor authorization.
- Do not let super-admin tooling bypass tenant workflow truth without a named operational policy and audit trail.
- Do not ship public intake, live billing activation, import writes, or external automation execution without abuse, replay, and tenant-boundary controls.
