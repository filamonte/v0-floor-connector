# FloorConnector

FloorConnector is a production-first, multi-tenant vertical SaaS platform for epoxy flooring, concrete polishing, and specialty surface contractors. The active product is a Supabase-backed contractor app built on one shared canonical lifecycle and data model:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Current branch highlights include the normalized contractor shell, shared quick-create to full-workspace flow, contractor and portal continuity on canonical records, first real contractor-side module dashboards for payments and schedule, and a broader shared contractor theme direction across the shell, manager pages, and quick-create surfaces.

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
```

The local environment source of truth is `C:\FloorConnector\.env.local`.

## Documentation Map

Use these docs together:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth on the current branch
- [docs/product-brain.md](C:/FloorConnector/docs/product-brain.md): high-signal product memory and anti-drift rules
- [docs/decisions.md](C:/FloorConnector/docs/decisions.md): current branch decisions worth preserving
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md): practical build-order guidance for future work
- [docs/codex-workflow.md](C:/FloorConnector/docs/codex-workflow.md): planning-first Codex implementation workflow
- [docs/codex-prompt-templates.md](C:/FloorConnector/docs/codex-prompt-templates.md): short reusable prompt templates
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): short implementation guardrail summary for developers

Start with [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented status. Use the other docs for target design, phased planning, workflow direction, and documentation process.

## Current UI Direction

The current protected contractor app uses:
- top-nav-first shell architecture
- unified breadcrumb and page-context header continuity
- shared manager-page wrapper and command-bar rhythm
- quick-create -> canonical record -> full workspace flow
- dashboard as the visual reference point for broader contractor surfaces
- charcoal or dark-neutral framing, orange accents, and white or light-neutral working surfaces instead of the older blue-heavy contractor styling

Treat [docs/current-state.md](C:/FloorConnector/docs/current-state.md) and [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md) as the source of truth for the active contractor UI baseline.

Older, superseded, exploratory, and historical docs live under [docs/archive/](C:/FloorConnector/docs/archive/). Archived docs are preserved for reference, but they do not override active docs.
