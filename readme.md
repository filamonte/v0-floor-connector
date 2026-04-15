# FloorConnector

FloorConnector is a production-first, multi-tenant SaaS platform for epoxy flooring, concrete polishing, and specialty surface contractors. This repository is the shared foundation for future contractor app, customer portal, marketing site, and super admin surfaces.

## Canonical Repo
- Canonical GitHub repo: `https://github.com/filamonte/v0-floor-connector.git`
- Canonical branch: `main`
- Local workspace root: `C:\FloorConnector`
- Local web app env source of truth: `C:\FloorConnector\.env.local`

## Current Status
The repository is still in the foundation phase.

Documentation map:
- [docs/architecture.md](C:/FloorConnector/docs/architecture.md) describes the target platform architecture
- [docs/roadmap.md](C:/FloorConnector/docs/roadmap.md) describes the phased implementation plan
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) is the source of truth for what is implemented today

What is real today:
- `apps/web` is the active Next.js App Router application
- the homepage is a placeholder marketing surface
- `/login` and `/signup` are the canonical auth entry routes
- `/dashboard` is the default protected post-login landing route
- protected `app`, `portal`, and `super-admin` routes already rely on Supabase-backed session checks
- shared config and Supabase client helpers live in workspace packages
- health endpoints exist to verify app and Supabase wiring

What is not in scope yet:
- product feature modules
- business workflows
- finalized shared auth/account domain modeling beyond the current foundation

## Architecture
FloorConnector is a modular monolith with one shared canonical data model, centralized auth and persistence foundations, and package boundaries intended to survive long-term production use.

This README gives a high-level repository overview only. It should not be treated as the detailed source of truth for target architecture, phased delivery, or current implementation status when the dedicated docs above apply.

Non-negotiables:
- no fake auth
- no fake persistence
- no local-only stand-ins for tenant state
- no duplicate business entities across surfaces
- explicit tenant isolation and RLS for tenant-owned data

## Monorepo Structure
Current workspace layout:

- `apps/web` is the active Next.js surface
- `apps/worker` is reserved for background and integration work
- `packages/auth` is reserved for shared auth abstractions as the auth model is formalized
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
- Git
- access to a Supabase project for local wiring verification

### Setup
```bash
pnpm install
Copy-Item .env.example .env.local
```

The root `.env.local` is intentionally loaded by `apps/web/next.config.ts`. Do not create a separate `apps/web/.env.local`, because it can override root values and make local auth/debugging harder to reason about.

### Common Commands
```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
pnpm format:write
```

`pnpm dev` runs Turbo with `--filter=@floorconnector/web`, so local development currently centers on `apps/web`.

## Current App Behavior
- `/` is a placeholder public marketing page
- `/login`, `/signup`, `/forgot-password`, `/update-password`, and `/auth/callback` are the active auth routes
- `/sign-in` and `/sign-up` remain compatibility aliases to the canonical auth pages
- `/dashboard`, `/app`, `/portal`, and `/super-admin` are protected by middleware and server-side session checks
- `/api/health`, `/api/health/supabase`, and `/api/health/auth` are available for setup verification

These routes exist to support the current foundation work. This task does not expand or redesign them.

## Supabase In The Current Architecture
Supabase is already wired as the platform foundation for:
- browser, server, route-handler, middleware, and admin client creation
- session exchange and cookie-backed auth flows in `apps/web`
- health checks against Supabase configuration
- future database, RLS, and shared auth/account work

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
