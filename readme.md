# FloorConnector

FloorConnector is a production-first, multi-tenant vertical SaaS platform for epoxy flooring, concrete polishing, and specialty surface contractors. The repository already contains a real contractor app backed by Supabase, with canonical workflows that carry work from intake through billing on one shared data model.

## Canonical Repo
- Canonical GitHub repo: `https://github.com/filamonte/v0-floor-connector.git`
- Canonical branch: `main`
- Local workspace root: `C:\FloorConnector`
- Local web app env source of truth: `C:\FloorConnector\.env.local`

## Current Status
The repository is beyond pure setup work and already includes live business workflows. The current branch contains a functional contractor-facing system with organization-aware authentication, tenant-scoped persistence, and connected commercial and operational records.

Documentation map:
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md) describes the target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) describes the phased implementation plan
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) is the source of truth for what is implemented today
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md) defines current and near-term business workflows
- [docs/vision.md](C:/FloorConnector/docs/vision.md) describes the longer-term product direction

What is real today:
- `apps/web` is the active Next.js App Router application
- Supabase Auth, organization bootstrap, and membership-aware protected flows are implemented
- the contractor app includes live leads, customers, projects, estimates, contracts, jobs, invoices, and payment recording
- shared templates, tax/retainage scaffolding, and AIA-ready schedule-of-values foundations are implemented
- shared config, domain, types, and Supabase client helpers live in workspace packages
- the homepage is still a lightweight marketing surface compared with the contractor app

Current implemented workflows:
- lead or opportunity intake
- customer management
- project management
- estimate creation, editing, sending, and approval progression
- contract generation from approved estimates
- contract review, pre-sign editing, and signature-lock scaffolding
- job creation and progression
- invoice creation from connected records
- payment recording and invoice balance tracking

Current capabilities are real, but some surfaces are still earlier-stage:
- dashboard is functional but still foundational
- settings, materials, portal, and super-admin surfaces are still limited or placeholder-level
- scheduling, external payments, external e-sign, PDF generation, and richer project workspace features are still future work

## Architecture
FloorConnector is a modular monolith with one shared canonical data model, centralized auth and persistence foundations, and package boundaries intended to survive long-term production use.

This README gives a high-level repository overview only. It should not be treated as the detailed source of truth for target architecture, phased delivery, or current implementation status when the dedicated docs above apply.

Non-negotiables:
- no fake auth
- no fake persistence
- no mock business data in protected app routes
- no local-only persistence in canonical workflows
- if Supabase is required, use Supabase
- no local-only stand-ins for tenant state
- no duplicate business entities across surfaces
- explicit tenant isolation and RLS for tenant-owned data

## Monorepo Structure
Current workspace layout:

- `apps/web` is the active Next.js surface
- `apps/worker` is reserved for background and integration work
- `packages/auth` is reserved for future shared auth abstractions as the auth model is further extracted
- `packages/config` centralizes environment parsing and platform constants
- `packages/database` and `packages/db` hold shared database and Supabase access foundations
- `packages/domain`, `packages/types`, `packages/utils`, and `packages/ui` hold shared cross-app code
- `packages/integrations` is the boundary for third-party providers
- `supabase/` contains Supabase project assets and migration-related work
- `docs/` contains setup and architecture notes
- `scripts/` contains repository utilities

## Local Development

### Prerequisites
- Node.js 20 or newer
- pnpm 9 or newer
- Turbo via the workspace scripts
- Git
- access to a Supabase project for local wiring verification

### Setup
```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

The root `.env.local` is intentionally loaded by `apps/web/next.config.ts`. Do not create a separate `apps/web/.env.local`, because it can override root values and make local auth/debugging harder to reason about.

### Common Commands
```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
supabase db push
pnpm format
pnpm format:write
```

The monorepo is managed by `pnpm` and `turbo`. `pnpm dev` runs the Turbo-driven web app workflow, and current day-to-day product work centers on `apps/web`.

## Current App Behavior
- `/` is the public marketing surface
- `/login`, `/signup`, `/forgot-password`, `/update-password`, and `/auth/callback` are the active auth routes
- `/sign-in` and `/sign-up` remain compatibility aliases to the canonical auth pages
- `/dashboard` is the primary protected landing route
- `/app` redirects into the protected contractor app
- contractor-facing protected routes include `/leads`, `/customers`, `/projects`, `/estimates`, `/contracts`, `/jobs`, `/invoices`, `/materials`, and `/settings`
- `/portal` and `/super-admin` exist as protected surfaces but remain limited compared with the contractor app
- `/api/health`, `/api/health/supabase`, and `/api/health/auth` are available for setup verification

## Supabase In The Current Architecture
Supabase is already wired as the platform foundation for:
- browser, server, route-handler, middleware, and admin client creation
- session exchange and cookie-backed auth flows in `apps/web`
- health checks against Supabase configuration
- canonical database persistence for the implemented contractor workflows
- RLS-backed tenant isolation and org-scoped business records

Today the web app reads:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server-only admin access

The environment package also exposes environment-specific placeholders for development and production values so deployments can stay configuration-driven.

## Planned Authentication Model
Authentication must be designed and validated as one dual-auth system from the beginning:

- Google OAuth is the primary sign-in method
- email/password is a fully supported fallback, not a temporary shortcut
- both methods must resolve into the same shared user/account model
- authorization remains organization-aware and role-based
- auth decisions stay centralized so surfaces do not create their own user systems

Implementation note:
- the current route and session foundation already uses Supabase Auth primitives
- successful auth now defaults to the protected `/dashboard` shell unless a safe `next` path is provided
- the next auth work should formalize the shared account model and provider-linking rules without changing the monorepo shape

See `docs/auth-setup.md` for the short auth architecture note and setup guidance.

## Current System Capabilities Vs Future Work

Implemented today:
- real Supabase-backed authentication and organization membership
- canonical opportunities, customers, projects, estimates, contracts, jobs, invoices, and payments
- estimate and invoice line items
- shared template foundations for estimates, invoices, and contracts
- tax, exemption, retainage, and schedule-of-values scaffolding

Still future or partial:
- project workspace consolidation
- scheduling and calendar operations
- materials and reusable catalog management UI
- richer settings and administration UX
- notifications, tasks, and role-based operational queues
- customer portal workflows
- super-admin and organization/module-control administration
- external integrations such as e-sign, payment gateways, PDF generation, and tax providers

## Environment Notes
For local development, keep public URLs fully qualified and local:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_URL=http://localhost:3000/support
NEXT_PUBLIC_PRIVACY_POLICY_URL=http://localhost:3000/privacy-policy
NEXT_PUBLIC_TERMS_OF_SERVICE_URL=http://localhost:3000/terms-of-service
```

If Next.js runs on another port such as `3001`, update the local URLs to match that active port.

In Vercel, replace localhost values with the live production domains. Moving between local and deployed environments should be an environment-variable change, not a code change.
