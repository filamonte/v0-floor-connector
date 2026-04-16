# AGENTS.md

## Purpose
This file is the rulebook for Codex and future AI-assisted development in the FloorConnector repository.

FloorConnector is a production-first, multi-tenant SaaS platform for epoxy flooring, concrete polishing, and specialty surface contractors. This repository is the source of truth for the product and must be treated like a long-lived production codebase, not a prototype.

## Canonical Repo
- canonical GitHub repo: `https://github.com/filamonte/v0-floor-connector.git`
- canonical collaboration branch: `main`
- canonical local workspace root: `C:\FloorConnector`
- local web app env source of truth: `C:\FloorConnector\.env.local`

## Current Phase
The project is in an implemented-foundation phase with system-alignment and next operational expansion work ahead.

Allowed work in this phase:
- documentation alignment and repository hygiene
- workflow tightening across existing canonical records
- shared package boundaries
- organization-aware auth, database, and server-boundary work when explicitly requested
- project workspace, scheduling, materials, admin, and integration foundations when explicitly requested
- production-first feature work on already-established canonical entities

Disallowed unless explicitly requested:
- feature work outside the requested scope
- fake dashboards or sample business flows
- placeholder CRM, projects, billing, messaging, or portal implementations
- fake or local-only persistence
- mock authentication flows presented as real architecture

## Core Build Rules
Agents must:
- work in small, testable, reviewable steps
- not skip phases or pull future-phase work into the current task
- preserve existing conventions unless there is a strong reason to change them
- choose the minimum clean change that satisfies the request
- explain assumptions when something is inferred or missing
- always list the files changed
- always list commands the user should run when relevant
- always note required environment variables when they change

## Production-First Rules
Do not:
- invent fake auth
- invent fake persistence
- use mock business data in protected app routes
- use local-only persistence in canonical workflows
- use localStorage as a stand-in for real application state
- add demo seed logic unless explicitly requested
- hardcode tenant context
- bypass server validation for convenience
- introduce temporary shortcuts that would need to be ripped out later

Prefer:
- real interfaces over fake workflows
- Supabase-backed persistence when a canonical workflow requires persistence
- server-validated inputs
- centralized configuration and env access
- shared domain logic in packages instead of inside pages
- forward-compatible abstractions that still stay small

## Canonical Domain Rules
FloorConnector must have one shared canonical data model across modules.

Agents must:
- respect canonical entities once introduced
- avoid creating duplicate business entities in separate modules
- not let one module create its own separate user, client, customer, company, project, job, invoice, or message model when a canonical model already exists
- extend shared entities through well-defined module boundaries instead of copying them
- keep naming consistent across database, domain, API, and UI layers

If a request would create a duplicate model, stop and reshape the change around the shared model.

## Multi-Tenant Rules
Multi-tenant isolation is a hard requirement.

Agents must:
- preserve tenant boundaries in every layer
- assume every major business record belongs to an organization unless explicitly defined otherwise
- prevent cross-tenant reads and writes
- use row level security for tenant-owned tables
- keep tenant checks explicit in server boundaries and database access patterns
- avoid any shortcut that mixes platform-level and tenant-level data without a clear boundary

## Authentication Rules
Authentication must be real and production-oriented.

Rules:
- Google sign-in is the primary auth method
- one login per user across the platform
- authorization is role-based and organization-aware
- auth decisions must not be duplicated independently in each module
- auth and identity logic should remain centralized in shared packages

## Architecture Rules
The architecture is a modular monolith.

Agents must:
- prefer shared architecture over shortcuts
- keep business logic in shared packages
- keep UI components presentational where practical
- validate all external input at server boundaries
- use strict TypeScript
- use Zod for request validation where request schemas are introduced
- keep env access centralized
- keep integrations behind adapter or interface boundaries
- prepare designs so modules can be enabled or disabled cleanly later
- prepare extension points for feature flags without overengineering them now
- avoid introducing new frameworks unless they remove clear complexity

## Integration Rules
All third-party services must be isolated behind adapters, service wrappers, or interface boundaries.

Do not:
- scatter provider-specific SDK logic across routes, pages, and components
- couple business logic directly to Stripe, Postmark, SignWell, QuickBooks, CompanyCam, or n8n APIs

Do:
- place provider integration code in dedicated packages
- keep the application dependent on internal interfaces where possible
- document callback URLs, webhook dependencies, and required env vars

## Data and Database Rules
Rules:
- all schema changes must go through migrations
- never manually patch production schema outside migrations
- RLS is mandatory for tenant-owned tables
- foreign keys and common query paths should be indexed
- primary operational tables should include `created_at` and `updated_at`
- prefer UUID primary keys
- important subscription, document, and compliance events should be auditable
- prefer soft delete for operational records unless compliance or retention requires hard delete

If a task changes database structure, agents must:
- create migration files
- update generated or shared database types when applicable
- explain the RLS impact

## Module Boundary Rules
The platform will support multiple surfaces:
- marketing site
- contractor app
- customer portal
- super admin

Agents must keep these surfaces on a shared foundation and must not fork core business models per surface.

Do not let:
- the customer portal invent its own customer records
- the contractor app invent its own project schema
- admin tooling invent its own user system

One module may project or constrain shared entities, but it must not redefine them.

## Delivery Rules
When implementing:
1. Read the existing repo structure first.
2. Preserve conventions already in place.
3. Make the minimum clean change needed.
4. Do not expand the scope into later-phase feature work unless explicitly requested.
5. If uncertain, choose maintainability over cleverness.

Every completed task response should include:
- files created or updated
- commands to run
- env vars required
- follow-up task dependencies
- assumptions made

## Definition Of Done
A task is done only when:
- code compiles or the reason it could not be verified is clearly stated
- lint passes or the reason it could not be verified is clearly stated
- relevant types are updated
- migrations exist if schema changed
- env vars are documented
- README or docs are updated if setup changed
