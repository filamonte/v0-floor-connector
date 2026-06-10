# MCP Tool Readiness V1

Status: Ready for review
Date: 2026-06-10
Branch: `stream/mcp-tool-readiness-v1`
Worktree: `C:\FC-worktrees\mcp-tool-readiness-v1`
Wave: `ux-beta-readiness-v1`

## Purpose

Verify external tool readiness, safe usage boundaries, and fallbacks before the
UX Beta Readiness wave starts `dashboard-command-center-cleanup-v1`.

This is a tooling and governance stream only. It does not redesign UI, change
app behavior, change schemas, create migrations, touch Supabase data, create
Stripe resources, create OpenAI API keys, generate websites, generate
assessments, or mutate production/business systems except safe documented
readiness probes.

Repo docs remain the source of truth. Tool output may support planning, but it
does not create product truth, implementation truth, canonical records, queues,
workflow ownership, provider state, or customer-facing behavior.

## Startup And Dependency Checks

- Main checkout `C:\FloorConnector` was on `main...origin/main`, fetched,
  fast-forward pulled, and confirmed even with `origin/main`.
- `pnpm.cmd worktree:doctor` passed in the main checkout before stream
  creation.
- PR #21, `feat: add UX design system foundation`, is merged with merge commit
  `fe6339a60fd3a161eb9f01d6880fbc2ebd93` at `2026-06-10T01:50:03Z`.
- The stream worktree was created at `C:\FC-worktrees\mcp-tool-readiness-v1`
  from `origin/main`.
- The stream branch is even with `origin/main` before this packet.

## Files Read

- `AGENTS.md`
- `docs/agent-governance.md`
- `docs/agent-startup-checklist.md`
- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/product-operating-model.md`
- `docs/design-system-governance.md`
- `docs/graphite-copper-ui-system.md`
- `docs/ui-patterns.md`
- `docs/review-packets/ux-beta-readiness-v1.md`
- `docs/review-packets/ux-design-system-foundation-v1.md`
- `C:\FC-worktrees\ux-architecture-audit-v1\docs\review-packets\ux-architecture-audit-v1.md`
- `active-waves.md`
- `active-worktrees.md`
- `.codex/active-stream-plan.md`

## Tool Readiness Summary

| Tool                          | Intended UX wave use                          | Probe result                                                                                                                                         | Readiness                                        | Allowed use in next UX stream                                                              | Forbidden use                                                                                      |
| ----------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| GitHub CLI / GitHub connector | Repo, PR, status, and review coordination     | Authenticated as `filamonte`; repo reachable; PR #21 confirmed merged; no open PRs found                                                             | Ready                                            | Inspect branches, PRs, checks, and create later PRs only when explicitly requested         | Auto-merge, push, or create PR without explicit prompt                                             |
| Notion                        | External decision log, not source of truth    | Existing UX page fetched and found by search; safe page comment created: `37beeff1-07fa-81a8-857f-001d8722ed7e`                                      | Ready with repo-source-of-truth limit            | Read the existing page and add small progress comments when useful                         | Create duplicate planning pages or treat Notion as implemented truth                               |
| Linear                        | Optional ticket/initiative mirror             | `_list_teams` and `_list_projects` require reauthentication                                                                                          | Blocked                                          | None until reauthenticated                                                                 | Creating or updating issues while blocked                                                          |
| Figma / FigJam                | Visual reference and route capture after auth | Connector reports user is not logged in; prior FigJam link is an online-whiteboard creation URL, not a normal `/board/...` or `/design/...` file URL | Blocked for MCP use                              | Use existing repo-recorded link as a human reference only                                  | Generate, edit, or rely on Figma artifacts until connector login and normal file URL are available |
| Stitch                        | Design reference lookup                       | `projects/779484556394119641` is accessible; owner role confirmed; list projects works; no design systems found for the project                      | Ready for read/reference                         | Read existing private project reference if needed                                          | Generate or apply screens as implementation truth                                                  |
| v0                            | Optional component scaffold only if available | No callable v0 scaffold/generate tool surfaced                                                                                                       | Unavailable                                      | Use repo primitives and docs instead                                                       | Depend on v0 for dashboard cleanup                                                                 |
| Supabase                      | Metadata-only readiness check                 | Project `jcnoraopbwdhshcmplgb` reachable; migrations and public table metadata readable                                                              | Ready for read-only metadata; mutation forbidden | Read metadata only when explicitly needed for a scoped stream                              | Apply migrations, execute SQL mutations, patch production data, or change schema                   |
| Stripe                        | Account readiness awareness only              | Account read works for `acct_1TVeYNBLrrct16go` / `FloorConnector sandbox`; product-list probe failed with `Unknown tool: list_products`              | Partially ready for account metadata             | Read account metadata only if a future billing stream asks for it                          | Create products, prices, checkout sessions, customers, subscriptions, or payment state             |
| OpenAI Platform               | API key setup only when explicitly requested  | Connector exposes key target/setup tools; no setup flow or key creation was run                                                                      | Available but intentionally unused               | None for dashboard cleanup                                                                 | Create API keys or open setup flows in this UX wave                                                |
| B12 Website Generator         | None for internal contractor app UX           | Website generation tool is discoverable                                                                                                              | Not relevant                                     | None                                                                                       | Generate websites or external acquisition surfaces                                                 |
| Assessment Generator          | None for app implementation                   | Assessment document generator is discoverable                                                                                                        | Not relevant                                     | None                                                                                       | Generate assessment widgets, quizzes, or product records                                           |
| Mem                           | Optional personal memory lookup               | Collections and search calls succeeded; no relevant notes found                                                                                      | Ready for read/search; not wave truth            | Read/search only when useful; repo packets remain canonical                                | Write notes or use Mem as project source of truth without explicit request                         |
| Vercel checks                 | CI/check posture awareness                    | PR #21 had a stale failed Vercel check named `v0-floor-connector` pointing at an invite/team target, while `lkjlkjlsdf` succeeded                    | Needs cleanup outside this stream                | Treat the passing app check plus repo validations as higher signal until config is cleaned | Treat stale failed Vercel integration status as product failure without inspection                 |

## Manual Follow-Ups

- Reauthenticate Linear before using it for UX stream ticket mirrors.
- Log in to the Figma connector and provide a normal FigJam `/board/...` or
  Figma `/design/...` file URL if MCP inspection is expected.
- Clean up the stale Vercel `v0-floor-connector` failed check or integration
  target so future PR check status is unambiguous.
- If Stripe product/price metadata is needed later, retest with the exact
  available Stripe connector surface before assuming product listing works.
- Keep OpenAI API key creation out of the UX wave unless a later explicit setup
  prompt authorizes the trusted key flow.

## Supabase Security Advisory Surfaced

The Supabase table metadata probe returned a critical advisory that the
following public tables currently have RLS disabled:

- `public.platform_catalog_system_components`
- `public.platform_catalog_item_seeds`
- `public.platform_financial_defaults`
- `public.role_permissions`
- `public.platform_workflow_defaults`
- `public.platform_user_roles`
- `public.subscription_plans`
- `public.permissions`

No remediation SQL was run. This packet records the advisory because the tool
explicitly required it to be surfaced. Any RLS remediation would need a separate
approved security/database stream with migration review.

## Dashboard Cleanup Readiness Decision

`dashboard-command-center-cleanup-v1` is cleared only with notes.

The next UX stream can proceed if the user explicitly accepts these known
tooling gaps:

- Linear remains unavailable.
- Figma/FigJam MCP use is blocked until login and a normal file URL are
  available.
- The stale failed Vercel check needs cleanup or explicit tolerance.

The dashboard cleanup stream has enough safe support from repo docs, local code
inspection, GitHub, Notion, Stitch read access, and local validation. It should
not depend on Linear, v0, OpenAI Platform, B12, Assessment Generator, Stripe, or
Supabase mutation.

## Recheck After MCP Changes

Recheck date: 2026-06-10

Reason: the user made MCP/tooling changes after the first readiness pass and
asked for a fresh recheck before dashboard cleanup starts.

### What Changed Since Prior Pass

- The branch now has an upstream: `origin/stream/mcp-tool-readiness-v1`.
- PR #22, `docs: verify MCP tooling readiness`, is open from
  `stream/mcp-tool-readiness-v1` into `main`.
- Linear reauthentication is fixed enough for project listing. The connector
  can read the `FloorConnector-Dev` project and the `FloorConnector-Dev` team
  with key `FLO`.
- Figma authentication is fixed. The connector identifies Jeff Filamonte
  (`jfilamonte@gmail.com`) with a View seat on `Jeff Filamonte's team`.
- The prior Figma/FigJam link is still only an
  `online-whiteboard/create-diagram/...` URL, not an inspectable
  `figma.com/board/...` or `figma.com/design/...` file URL.
- Stitch remains callable and lists `projects/779484556394119641`.
- Supabase metadata remains readable and the critical RLS-disabled advisory is
  still present.
- The stale PR #21 Vercel check named `Vercel - v0-floor-connector` is still
  visible as failed, while `Vercel - lkjlkjlsdf` succeeded.

### Updated Tool Readiness Table

| Tool                          | Recheck result                                                                                                                                                                    | Read status                                                 | Write status                                                       | Updated readiness                                             | Fallback / boundary                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| GitHub CLI / GitHub connector | Authenticated as `filamonte`; repo reachable; PR #22 open; PR #21 merged; stale Vercel status still visible on PR #21                                                             | Works                                                       | Not tested in this pass                                            | Ready                                                         | Use for repo/PR/check inspection. Do not auto-merge, push, or create PRs without explicit approval.                          |
| Notion                        | Existing UX wave page fetched with discussions; search found the page; progress comment added with id `37beeff1-07fa-8109-95a1-001d5cdd6a1b`                                      | Works                                                       | Page comments work                                                 | Ready with repo-source-of-truth limit                         | Use as external planning log only. Do not create duplicate pages or make Notion the roadmap source of truth.                 |
| Linear                        | Project listing works. Found project `FloorConnector-Dev` (`6212e79d-0827-463a-b016-b5cb63d9046f`) and team `FloorConnector-Dev` / `FLO` (`8be9bec2-e8db-4bc3-8bc1-2f360e5b9427`) | Works for project/team discovery                            | Not tested; no issue created because no ticket creation was needed | Newly available for later ticket creation with human approval | Repo packets remain execution truth. Do not create Linear-only work or tickets without an explicit ticketing prompt.         |
| Figma / FigJam                | `whoami` works for Jeff Filamonte; prior online-whiteboard link is still not a normal inspectable file URL; repo search found no normal `/board/...` or `/design/...` URL         | Auth works; file inspection not possible without normal URL | Not tested; file creation/editing forbidden                        | Partially fixed                                               | Provide a normal FigJam `/board/...` or Figma `/design/...` URL before expecting MCP inspection. No Figma-only design truth. |
| Stitch                        | `list_projects` works and includes `projects/779484556394119641`, `FloorConnector UX Beta Readiness V1`, owner role, private visibility                                           | Works                                                       | Not tested; mutation forbidden                                     | Ready for read/reference                                      | Use as design reference only; repo design-system governance wins.                                                            |
| v0                            | Tool discovery still did not expose a callable v0 scaffold/generate tool                                                                                                          | No callable app-specific read/generate path found           | Not available                                                      | Still unavailable                                             | Use repo primitives, local code, Figma/Stitch references, and Browser/local screenshots instead.                             |
| Supabase                      | Project `jcnoraopbwdhshcmplgb` reachable; migrations and public table metadata readable; security advisors readable                                                               | Works                                                       | Forbidden and not tested                                           | Ready for metadata only                                       | UX wave should not mutate Supabase. Security remediation needs a separate approved database/security stream.                 |
| Stripe                        | Account metadata still works for `acct_1TVeYNBLrrct16go` / `FloorConnector sandbox`; no product-listing tool surfaced in this recheck                                             | Account metadata works                                      | Forbidden and not tested                                           | Partially ready for account metadata                          | Do not create products, prices, customers, subscriptions, checkout sessions, or payment state.                               |
| OpenAI Platform               | Key setup tools remain discoverable from prior search, but no target-selection or key creation flow was run                                                                       | Not needed for this UX stream                               | Forbidden and not tested                                           | Intentionally unused                                          | Do not create API keys or start setup without explicit trusted key-flow prompt.                                              |
| B12 Website Generator         | Intentionally unused                                                                                                                                                              | Not tested                                                  | Forbidden and not tested                                           | Not relevant                                                  | Do not create websites for internal contractor app UX.                                                                       |
| Assessment Generator          | Intentionally unused                                                                                                                                                              | Not tested                                                  | Forbidden and not tested                                           | Not relevant                                                  | Do not generate assessment artifacts or product widgets.                                                                     |
| Mem                           | Collection and note listing work; no notes or collections returned                                                                                                                | Works                                                       | Not tested; no note created                                        | Ready for read/search; not wave truth                         | Repo packet remains source of truth. Do not write Mem notes without explicit request.                                        |
| Vercel checks                 | PR #21 still shows failed stale `Vercel - v0-floor-connector` invite/team target and successful `Vercel - lkjlkjlsdf`; PR #22 is open                                             | Visible through GitHub                                      | Not applicable                                                     | Needs configuration cleanup                                   | Treat stale failed integration status separately from app validation until cleaned up.                                       |

### Tools Newly Available

- Linear project/team read access is now available.
- Figma account authentication is now available.
- The stream branch now has an upstream and PR #22 is open.

### Tools Still Blocked Or Limited

- Figma/FigJam file inspection still needs a normal `figma.com/board/...` or
  `figma.com/design/...` URL.
- v0 still has no callable scaffold/generate tool in this session.
- Stripe product listing was not available through the exposed connector
  surface in this recheck.
- Vercel still has a stale failed `v0-floor-connector` status on PR #21.
- Supabase has security advisories that are real but out of scope for this UX
  tooling pass.

### Supabase Advisory Recheck

The critical RLS-disabled advisory remains present for:

- `public.platform_catalog_system_components`
- `public.platform_catalog_item_seeds`
- `public.platform_financial_defaults`
- `public.role_permissions`
- `public.platform_workflow_defaults`
- `public.platform_user_roles`
- `public.subscription_plans`
- `public.permissions`

The security advisor also reports additional non-remediated advisory categories,
including RLS-enabled tables with no policies, a security-definer view,
functions with mutable search paths, executable security-definer functions, and
leaked password protection disabled. No SQL, DDL, policy, auth, or data mutation
was run.

### Recheck Decision

`dashboard-command-center-cleanup-v1` is cleared to launch with notes.

Linear and Figma account auth are improved enough that the dashboard cleanup no
longer needs to treat those connectors as fully blocked. The remaining launch
notes are:

- use repo docs and current code as canonical truth;
- use Linear only as a mirrored ticketing aid after explicit ticket creation
  approval;
- provide a normal Figma file URL before expecting MCP design inspection;
- do not rely on v0;
- do not use Supabase, Stripe, OpenAI Platform, B12, Assessment Generator, or
  Mem as implementation sources for dashboard cleanup;
- clean up or explicitly tolerate the stale Vercel `v0-floor-connector` status.

## Usage Rules For Later UX Streams

- Repo docs, current code, and review packets remain canonical.
- External tools may support planning, screenshots, diagrams, and decision logs
  only.
- Tool artifacts must not introduce new product truth, new persistence,
  role-specific data models, duplicate queues, dashboard-owned operational
  state, portal copies, duplicate financial/schedule/readiness truth, or fake
  state.
- Dashboard work must answer "what needs attention?" and route to owning
  workspaces for action.
- Owning workspaces must answer "what do I do about it?" using canonical
  records.
- Any adopted visual pattern from Stitch, Figma, or another tool must be
  adapted to `docs/design-system-governance.md`,
  `docs/graphite-copper-ui-system.md`, and `docs/ui-patterns.md`.

## Explicit Non-Goals

- dashboard cleanup implementation
- full dashboard redesign
- full workspace redesign
- app UI changes
- business logic changes
- schema changes
- migrations
- Supabase mutations
- Stripe resource creation
- OpenAI API key creation
- B12 website generation
- assessment generation
- AI implementation
- AIA implementation
- customer self-service
- provider/customer-facing sends
- PR creation, merge, or push

## Validation Log

To be completed before commit:

```powershell
pnpm.cmd exec prettier --write docs/review-packets/mcp-tool-readiness-v1.md active-waves.md active-worktrees.md .codex/active-stream-plan.md
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```
