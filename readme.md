# FloorConnector

FloorConnector is a production-first multi-tenant SaaS platform for epoxy flooring, concrete polishing, and specialty surface contractors. It is intended to support contractor CRM, estimating, scheduling, billing, document workflows, messaging, operations, and future ecosystem modules on one shared platform foundation.

## Current Phase
The repository is in the foundation phase only.

This means we are setting up:
- repo standards
- package boundaries
- environment scaffolding
- auth and database foundations when explicitly requested
- shared conventions for future modules

This does not mean we should scaffold product features yet.

## Architecture
FloorConnector is being built as a modular monolith.

That means:
- one codebase
- one shared canonical data model
- clear internal package boundaries
- centralized auth and persistence foundations
- modules that can evolve independently without becoming separate systems

The architecture must stay production-first. No fake auth, no fake persistence, no demo shortcuts pretending to be final architecture.

## Platform Surfaces
The platform is expected to support multiple surfaces on one shared foundation:
- marketing site
- contractor app
- customer portal
- super admin

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Stripe
- Postmark
- SignWell
- n8n
- QuickBooks
- CompanyCam
- pnpm
- Turborepo

## Production-First Rules
- Build for real auth and real persistence from the start.
- Use Google sign-in as the primary authentication method, with email/password retained only as a secondary fallback.
- Preserve tenant isolation across every layer.
- Keep business logic in shared packages, not scattered across pages.
- Keep integrations behind adapter boundaries.
- Prefer maintainable foundations over fast throwaway shortcuts.
- Do not introduce future-phase features unless explicitly requested.

## Architecture Principles
- One shared data model: core business entities should be canonical and reused across modules.
- One login per user: auth and identity should stay centralized rather than reimplemented by surface.
- Tenant isolation: every tenant-owned record must preserve organization boundaries and support RLS.
- Module boundaries: packages should own clear responsibilities and avoid cross-cutting duplication.
- Event-ready architecture: design boundaries so domain events, workflows, and automation can be layered in cleanly later.

## Workspace Structure
- `apps/` contains deployable application surfaces.
- `packages/` contains shared UI, domain, auth, config, database, types, and utility code.
- `supabase/` contains database migrations and related Supabase assets.
- `docs/` contains product and engineering documentation.
  Auth setup details live in `docs/auth-setup.md`.

## Local Setup

### Prerequisites
- Node.js 20 or newer
- pnpm 9 or newer
- Git
- Supabase CLI
- Vercel CLI
- Access to a Supabase project
- Access to a Stripe account
- Access to Postmark
- Google OAuth credentials

### Initial Setup
```bash
pnpm install
```

Create a local environment file from the template and fill in the required values for your environment:

```bash
cp .env.example .env.local
```

The root `C:\FloorConnector\.env.local` file is the source of truth for local web app configuration. Do not keep a separate `apps/web/.env.local`, because it can override the root settings and cause confusing runtime mismatches.

For local development, keep public URLs fully qualified and local, for example:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_URL=http://localhost:3000/support
NEXT_PUBLIC_PRIVACY_POLICY_URL=http://localhost:3000/privacy-policy
NEXT_PUBLIC_TERMS_OF_SERVICE_URL=http://localhost:3000/terms-of-service
```

If Next.js starts on a different port such as `3001`, update both values to match the active local port.

### Workspace Commands
```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format
pnpm format:write
```

## Deployment Notes

Before deploying to Vercel, replace the local URL values with your live domains in the Vercel environment settings:

```env
NEXT_PUBLIC_APP_URL=https://app.floorconnector.com
NEXT_PUBLIC_MARKETING_URL=https://www.floorconnector.com
NEXT_PUBLIC_SUPPORT_URL=https://support.floorconnector.com
NEXT_PUBLIC_PRIVACY_POLICY_URL=https://www.floorconnector.com/privacy-policy
NEXT_PUBLIC_TERMS_OF_SERVICE_URL=https://www.floorconnector.com/terms-of-service
```

Keep local `.env.local` values pointed at localhost, and keep deployed values in Vercel pointed at the real production domains. The code should not be changed when moving between local and live environments; only the environment variables should differ.

## What Not To Do
- Do not add fake auth or mock tenant context.
- Do not use localStorage as a substitute for backend persistence.
- Do not create duplicate user, customer, client, or project models in separate modules.
- Do not let integrations leak provider-specific logic throughout the app.
- Do not skip the foundation phase to scaffold CRM, billing, projects, or portal features unless explicitly requested.

## Monorepo Standards
- Use shared packages for domain logic, config, auth, and database access.
- Keep strict TypeScript enabled.
- Keep linting and formatting consistent at the root.
- Add new modules only when they fit the existing boundaries or improve them intentionally.

## Auth Strategy
- Google OAuth is the default and recommended sign-in path.
- Email/password exists as a secondary fallback for users who cannot use Google.
- Identity and session handling remain centralized so every surface shares the same auth foundation.
