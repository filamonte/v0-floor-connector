# FloorConnector

FloorConnector is a production-first, multi-tenant vertical SaaS platform for epoxy flooring, concrete polishing, and specialty surface contractors. The active product is a Supabase-backed contractor app built on one shared canonical data model.

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
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): short implementation guardrail summary for developers

Start with [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented status. Use the other docs for target design, phased planning, workflow direction, and documentation process.

Older, superseded, exploratory, and historical docs live under [docs/archive/](C:/FloorConnector/docs/archive/). Archived docs are preserved for reference, but they do not override active docs.
