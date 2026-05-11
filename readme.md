# FloorConnector

FloorConnector is a production-first, multi-tenant vertical SaaS platform for epoxy flooring, concrete polishing, and specialty surface contractors. The active product is a Supabase-backed contractor app built on one shared canonical lifecycle and data model:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Current branch highlights include the normalized contractor shell, shared quick-create to full-workspace flow, inventory-first estimating on canonical records, portal and contractor-side onsite contract signing on canonical records, first real contractor-side module dashboards for payments and schedule, and a broader shared contractor theme direction across the shell, manager pages, and quick-create surfaces.

## Repository Shape

- `apps/web`: active Next.js app
- `apps/worker`: reserved background and integration surface
- `packages/*`: shared config, domain, types, UI, database, and integration boundaries
- `supabase/`: migrations and Supabase project assets
- `docs/`: active documentation and archived reference docs

## Run Locally

Prerequisites:
- Node.js 20+
- `pnpm`
- access to the project Supabase environment

Setup:

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Common commands:

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
supabase db push
pnpm platform-admin grant platform@floorconnector.com
```

The local environment source of truth is `C:\FloorConnector\.env.local`.

## Platform Super Admin Bootstrap

Super-admin access is assigned only through `platform_user_roles`; contractor organization `owner`, `admin`, `manager`, or `member` roles do not grant `/super-admin` access.

Use the explicit helper after the target user has signed in once so their canonical `public.users` profile exists:

```bash
pnpm platform-admin grant platform@floorconnector.com
pnpm platform-admin revoke jfilamonte@gmail.com
pnpm platform-admin status jfilamonte@gmail.com
```

You may also set `PLATFORM_SUPER_ADMIN_EMAIL` in `C:\FloorConnector\.env.local` and run `pnpm platform-admin grant` without an email argument. The helper requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` and does not create contractor organizations.

For focused browser regression coverage, set real local credentials for the contractor-only account and the platform account, then run:

```bash
pnpm e2e:super-admin
```

## Production Environment Notes

`FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is required in production for the public `Request Early Access` form. Set it to the existing canonical `companies.id` value for the FloorConnector-owned company that should receive public early-access intake leads. If it is missing in production, public request submission fails gracefully instead of writing to an arbitrary tenant.

Stripe billing readiness still requires valid test-mode `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` values before claiming `/setup/billing` card collection has been verified. The current early-access flow does not create subscriptions or automatic charges.

## Documentation Map

Use these docs together:
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): primary developer entry point and implementation guardrail summary
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth on the current branch
- [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md): concise platform maturity framing
- [docs/module-status.md](C:/FloorConnector/docs/module-status.md): concise module status table
- [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md): important depth gaps without implying the core is missing
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): canonical and near-term workflow behavior
- [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md): stable architecture principles
- [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md): canonical record chain
- [docs/platform-philosophy.md](C:/FloorConnector/docs/platform-philosophy.md): platform philosophy
- [docs/ui-system.md](C:/FloorConnector/docs/ui-system.md): contractor UI system guardrails
- [docs/financial-architecture.md](C:/FloorConnector/docs/financial-architecture.md): financial record and event guardrails
- [docs/portal-architecture.md](C:/FloorConnector/docs/portal-architecture.md): portal shared-record guardrails
- [docs/codex-workflow.md](C:/FloorConnector/docs/codex-workflow.md): planning-first Codex implementation workflow
- [docs/codex-prompt-templates.md](C:/FloorConnector/docs/codex-prompt-templates.md): short reusable prompt templates
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity roadmap
- [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md): clearly future expansion areas
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules
- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md): documentation layers, metadata, ADR/diagram, and AI-readability standards
- [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md): architecture decision records
- [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md): architecture diagrams as code
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md): AI-assisted development guidance

Start with [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md). Then use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented status and [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for canonical and near-term workflow behavior.

Current estimate-system reality is documented in [docs/current-state.md](C:/FloorConnector/docs/current-state.md):
- inventory-first estimate authoring only
- shared `catalog_items` and `catalog_system_components`
- canonical `estimate_line_items` pricing rows
- explicit shared save-state behavior with validation and conflict protection
- one `documents` bucket with organization-first storage paths

## Current UI Direction

The current protected contractor app uses:
- top-nav-first shell architecture
- unified breadcrumb and page-context header continuity
- shared manager-page wrapper and command-bar rhythm
- quick-create -> canonical record -> full workspace flow
- dashboard as the visual reference point for broader contractor surfaces
- charcoal or dark-neutral framing, orange accents, and white or light-neutral working surfaces instead of the older blue-heavy contractor styling

Creation flows must stay context-aware: project-launched creation auto-links to the project, customer-launched creation requires a project selection or creation, and global creation requires both customer and project selection.

Treat [docs/current-state.md](C:/FloorConnector/docs/current-state.md) and [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md) as the source of truth for the active contractor UI baseline.

Older, superseded, exploratory, and historical docs live under [docs/archive/](C:/FloorConnector/docs/archive/). Archived docs are preserved for reference, but they do not override active docs.
