# Staging Demo Readiness

Status: Active
Doc Type: Operations / Demo

This runbook prepares FloorConnector for controlled staging and demo rehearsal. It maps environment ownership, provider setup, demo modes, and the safe tour route without deploying, calling providers, changing schema, or changing product behavior.

Read this with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)
- [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md)
- [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md)
- [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md)
- [docs/saas-billing-live-launch-plan.md](C:/FloorConnector/docs/saas-billing-live-launch-plan.md)

## Current Recommendation

- Controlled internal demo: GO when the local validation gates remain green and the demo uses test/provider-isolated boundaries.
- Public early-access intake: CONDITIONAL until staging URLs, email posture, activation guard behavior, and `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` are configured on the target host.
- Live provider billing, payment, or signature replay: NO-GO until Stripe, Postmark, SignWell, and staging webhook settings are verified on the actual staging host.

This document does not authorize live Stripe sessions, live charges, live subscriptions, live SignWell replay, production email sends, tenant activation, schema changes, RLS changes, or new demo data.

## Recent Verified Baseline

The most recent controlled readiness pass reported:

- latest schedule helper cleanup commit pushed: `188ee49a Refactor schedule handoff test helpers`
- branch aligned with `main...origin/main`
- working tree clean
- Supabase local and remote migration histories aligned by migration list and dry-run push
- validation passed for typecheck, lint, build, payments E2E, portal E2E, protected dashboard/schedule/detail specs, public marketing/login smoke, and super-admin suite on rerun

Treat this as a baseline to refresh before staging or a live demo, not a permanent guarantee.

## Hard Guardrails

- Do not print secret values in docs, chat, screenshots, logs, or tickets.
- Do not deploy from this runbook unless the owner explicitly asks.
- Do not call live Stripe, Postmark, SignWell, Vercel, or Supabase mutation paths from a demo-prep pass.
- Do not create Stripe sessions, charges, webhooks, products, prices, subscriptions, customers, payment links, or invoices unless the run is explicitly scoped for provider test-mode QA.
- Do not send real email during a demo unless email behavior is the explicit rehearsal target.
- Do not create schema migrations, weaken RLS, loosen auth, change portal grants, or alter tenant boundaries.
- Do not change payment semantics, invoice math, estimate math, signature behavior, webhook behavior, or readiness gates.
- Do not seed fake dashboard or demo-only state.

## Env Var Inventory

Observed status means names-only status from local `.env.local` at the time of this pass. It does not prove the value is valid, safe for staging, or configured on Vercel.

### App And Public URLs

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Canonical app origin for auth callbacks, links, checkout returns, and customer actions | Vercel env, local `.env.local` | Yes | Yes | Yes | Yes | Confirm name exists and `/api/health/auth` reports expected callback origins | Present by name | Must match the active app host exactly. |
| `NEXT_PUBLIC_MARKETING_URL` | Public marketing/home origin | Vercel env, local `.env.local` | Helpful | Yes | Yes | No | Confirm name exists and marketing links use the intended origin | Present by name | Required for clean public/staging navigation. |
| `NEXT_PUBLIC_APP_NAME` | Public app display name | Vercel env, local `.env.local` | Optional | Optional | Optional | No | Confirm name exists or app default is acceptable | Present by name | Defaults exist, but explicit staging value is clearer. |
| `NEXT_PUBLIC_SUPPORT_URL` | Support/help destination | Vercel env, local `.env.local` | Optional | Helpful | Helpful | No | Confirm link target is safe for demo | Present by name | Missing value can leave support links generic. |
| `NEXT_PUBLIC_PRIVACY_POLICY_URL` | Privacy policy link | Vercel env, local `.env.local` | Optional | Helpful | Yes | Yes | Confirm public link loads | Present by name | Needed before broader public intake. |
| `NEXT_PUBLIC_TERMS_OF_SERVICE_URL` | Terms link | Vercel env, local `.env.local` | Optional | Helpful | Yes | Yes | Confirm public link loads | Present by name | Needed before broader public intake. |
| `APP_ENV` | App environment marker for billing metadata and runtime posture | Vercel env, local `.env.local` | Helpful | Yes | Yes | Yes | Confirm name exists and is one of `local`, `development`, `staging`, `production`, or `test` | Missing by name | Suspicious for staging because SaaS billing metadata falls back to `NODE_ENV` or `development`. |
| `NODE_ENV` | Framework/runtime environment | Runtime/platform managed | Yes | Yes | Yes | Yes | Confirm build/runtime sets it without printing value | Missing by name in `.env.local` | Usually platform managed; avoid manual production drift. |

### Supabase

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL | Supabase dashboard, Vercel env, local `.env.local` | Yes | Yes | Yes | Yes | Confirm `/api/health/supabase` and auth smoke without printing value | Present by name | Must point to the intended staging Supabase project. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase anon key | Supabase dashboard, Vercel env, local `.env.local` | Yes | Yes | Yes | Yes | Confirm name exists; do not paste key into docs | Present by name | Required for browser auth/client flows. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Legacy or alternate publishable key name seen locally | Local env / migration compatibility | Optional | Unknown | Unknown | Unknown | Search code usage before relying on it | Present by name | Not part of current public env schema; treat as compatibility only. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin/service role for fixtures, admin operations, and protected server workflows | Supabase dashboard, local `.env.local`, Vercel server env only if needed | Yes for E2E/admin | Yes for server-only admin paths if required | Yes for server-only intake if required | Yes for server-only operations | Confirm name exists only in server/runtime env; never expose to browser | Present by name | Must stay server-only. Do not use from client code. |
| `SUPABASE_SERVICE_ROLE_KEY_DEV` / `SUPABASE_SERVICE_ROLE_KEY_PROD` | Environment-specific service role names in schema | Vercel/Supabase env governance | Optional | Optional | Optional | Optional | Confirm only if an environment-split deployment uses them | In `.env.example`, not local observed | Prefer one explicit staging convention before launch. |
| `DATABASE_URL` / `DIRECT_URL` | Database connection strings for Prisma or direct DB tooling if used | Supabase connection settings / Vercel env | Optional today | Unknown | Unknown | Unknown | Confirm only by name where tooling requires it | In `.env.example`, not local observed | Do not add unless the deployment path needs it. |

### Auth And OAuth

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Google OAuth provider configuration | Google Cloud / Supabase Auth provider settings / local env if used | Yes for Google auth setup | Yes | Yes | Yes | Confirm Supabase Auth provider and redirect URL setup; do not print value | Present by name | Staging host must be allowed in OAuth redirect configuration. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Google Cloud / Supabase Auth provider settings / server-only env if used | Yes for Google auth setup | Yes | Yes | Yes | Confirm configured by name only | Present by name | Secret must never be exposed client-side. |
| `PLATFORM_SUPER_ADMIN_EMAIL` | Local operator helper target for platform admin grants | Local env / operator notes | Optional | Helpful | No | No | Confirm platform role with `pnpm platform-admin status <email>` when needed | In `.env.example`, not local observed | Does not grant access by itself. |
| `PLAYWRIGHT_STORAGE_STATE` | Contractor auth state path override | Local/E2E only | Optional | No | No | No | Confirm file path exists only locally and is not tracked | Missing by name | Defaults to `playwright/.auth/local-user.json`. |
| `PLAYWRIGHT_PORTAL_STORAGE_STATE` | Portal auth state path override | Local/E2E only | Optional | No | No | No | Confirm file path exists only locally and is not tracked | Missing by name | Defaults are configured in Playwright. |

### Stripe Contractor Payment Gateway

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser Stripe key for Elements/Checkout surfaces | Stripe dashboard, Vercel env, local `.env.local` | Yes for test-mode payment QA | Conditional | Conditional | Yes | Confirm prefix only: `pk_test_` for test, `pk_live_` for live | Present by name, safe prefix test | Test prefix is good for local QA; staging must choose test vs live intentionally. |
| `STRIPE_SECRET_KEY` | Server Stripe API key | Stripe dashboard, Vercel server env, local `.env.local` | Yes for test-mode QA | Conditional | Conditional | Yes | Confirm prefix only: `sk_test_` for test, `sk_live_` for live | Present by name, safe prefix test | Never call live Stripe from demo prep. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for SaaS billing and contractor payment webhook verification | Stripe CLI or Stripe Dashboard webhook endpoint | Yes for webhook QA | Yes if webhook smoke is in scope | Yes if payment/billing flows exposed | Yes | Confirm name exists and endpoint-specific source is documented | Present by name | Existing local value presence does not prove staging endpoint wiring. |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Future/Connect webhook signing secret | Stripe dashboard | No today | No today | No today | Future | Confirm only if Connect is implemented | Missing by name | Missing is acceptable unless Connect work is explicitly scoped. |
| `FLOORCONNECTOR_E2E_PAYMENT_GATEWAY` | Non-production provider-isolated portal checkout override | Local/E2E only | Optional, Playwright defaults to `local_manual` | No | No | No | Confirm Playwright config default and never set in production | Missing by name in `.env.local` | Playwright supplies `local_manual`; do not configure in production. |

### Stripe SaaS Billing / Subscription

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `STRIPE_FOUNDER_PLAN_PRICE_ID` | Env fallback for FloorConnector SaaS founder subscription price | Stripe dashboard / Vercel server env | Optional if app-managed price exists | Conditional | Conditional | Yes | Confirm either this name exists or `platform_billing_settings.stripe_price_id` is configured | Missing by name | Not fatal if app-managed price reference exists; otherwise SaaS Checkout is unavailable. |
| `STRIPE_PRICE_ID_BASE` | Legacy/base plan price name | Stripe dashboard / Vercel env | No today | Unknown | Unknown | Future | Confirm code path before relying on it | Missing by name | Do not treat as current SaaS price unless a route uses it. |
| `APP_ENV` | Metadata environment marker for SaaS Checkout and webhook filtering | Vercel env, local `.env.local` | Helpful | Yes | Yes | Yes | Confirm name exists and matches staging/prod intent | Missing by name | Configure explicitly before staging SaaS billing rehearsal. |

### Postmark / Email

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POSTMARK_SERVER_TOKEN` | Server token for provider-backed email | Postmark / Vercel server env | Optional | Conditional | Yes if public intake emails send | Yes | Confirm token configured by name; do not send without explicit email QA scope | Present by name | Presence does not prove domain/sender status. |
| `POSTMARK_FROM_EMAIL` | Default sender | Postmark / Vercel env | Optional | Conditional | Yes | Yes | Confirm sender/domain verified in Postmark | Present by name | Demo should avoid real sends unless staging-safe. |
| `POSTMARK_NOREPLY_EMAIL` | No-reply sender | Postmark / Vercel env | Optional | Helpful | Helpful | Yes | Confirm sender/domain verified | Present by name | Current server schema uses `POSTMARK_FROM_EMAIL`; keep aliases documented. |
| `POSTMARK_SUPPORT_EMAIL` | Support sender/contact | Postmark / Vercel env | Optional | Helpful | Helpful | Yes | Confirm mailbox/link works | Present by name | Useful for customer-facing support copy. |
| `POSTMARK_BILLING_EMAIL` | Billing sender/contact | Postmark / Vercel env | Optional | Helpful | Helpful | Yes | Confirm mailbox/link works | Present by name | Useful for billing communications. |
| `POSTMARK_MESSAGE_STREAM` / `POSTMARK_BROADCAST_STREAM` | Postmark stream selection | Postmark / Vercel env | Optional | Optional | Optional | Yes if stream-specific sending is used | Confirm only if provider email scope needs it | In `.env.example`, not local observed | Missing is acceptable until stream policy is used. |

### SignWell / E-Sign

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SIGNWELL_API_KEY` | SignWell provider API key | SignWell / Vercel server env | Optional | Conditional | Conditional | Yes | Confirm name only; do not call provider in demo prep | Present by name | Presence does not prove provider/test-mode posture. |
| `SIGNWELL_WEBHOOK_SECRET` | SignWell webhook verification secret | SignWell webhook settings / Vercel server env | Optional | Yes if provider replay is in scope | Yes if live signature provider is exposed | Yes | Confirm name exists and endpoint source is documented | Missing by name | Live/provider signature replay remains no-go until configured. |

### Early Access / Activation

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` | Company/tenant that receives public early-access intake leads | Vercel server env / operator-selected company id | Optional locally | Yes if public intake route is shown | Yes | No | Confirm configured by name and points to intended staging tenant without printing id in public notes | Missing by name | In production, missing value blocks public request capture with fallback copy. |
| `FLOORCONNECTOR_SHOW_DEV_QA_TOOLS` | Local-only visual QA helper toggle | Local env only | Optional | No | No | No | Confirm absent/off for demos | Missing by name | Keep off for customer/investor screenshots. |

### Vercel / Deployment

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `VERCEL_URL` | Platform-provided deployment URL | Vercel runtime | No | Helpful | Helpful | Helpful | Confirm in Vercel dashboard/runtime, not local | Missing by name locally | Not a replacement for explicit `NEXT_PUBLIC_APP_URL`. |
| `NEXT_PUBLIC_VERCEL_URL` | Optional public Vercel URL alias if adopted | Vercel env | No | Optional | Optional | Optional | Confirm code uses it before configuring | Missing by name | Current code does not require this name. |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Product analytics if enabled | PostHog / Vercel env | Optional | Optional | Optional | Optional | Confirm data collection posture before demos | In `.env.example`, not local observed | Do not enable analytics without owner approval. |
| `NEXT_PUBLIC_SENTRY_DSN` | Error reporting if enabled | Sentry / Vercel env | Optional | Optional | Optional | Optional | Confirm DSN and sampling policy | In `.env.example`, not local observed | Good for staging, but not a blocker for controlled demo. |

### E2E Only

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE` | Enables fixture creation/repair helpers | Local/E2E only | Conditional | No | No | No | Confirm off unless intentionally seeding disposable fixtures | Present by name | Never configure in production. |
| `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD` | Contractor E2E login | Local/E2E only | Yes for protected specs | No | No | No | Confirm names only; auth setup succeeds | Present by name | Do not expose in screenshots or docs. |
| `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` / `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD` | Platform-admin E2E login | Local/E2E only | Yes for super-admin specs | No | No | No | Confirm names only; role exists | Present by name | Keep separate from contractor test user. |
| `FLOORCONNECTOR_PORTAL_E2E_EMAIL` / `FLOORCONNECTOR_PORTAL_E2E_PASSWORD` | Portal customer E2E login | Local/E2E only | Yes for portal specs | No | No | No | Confirm names only; portal auth setup succeeds | Present by name | Must map to a real portal customer account and grants. |
| `FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH` and related portal/detail path vars | Optional fixture route overrides for demo/QA | Local/E2E only | Optional | No | No | No | Confirm routes load if configured | Missing by name | Missing is acceptable when specs discover fixtures directly. |

### Local-Only / Future Integration Names

| Env var | Purpose | Owner / configure in | Local dev | Controlled staging demo | Public intake | Live provider action | Safe verification | Observed status | Impact / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `APP_SECRET`, `SESSION_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET`, `INTERNAL_API_TOKEN` | Security/runtime internals for future server operations | Vercel env / operator | As needed | As needed | As needed | As needed | Confirm only if route requires it | In `.env.example`, not local observed | Configure only when the implementing feature requires it. |
| `QUICKBOOKS_*`, `COMPANYCAM_*`, `N8N_*` | Future integrations | Provider dashboards / Vercel env | No today | No today | No today | Future | Confirm no demo route depends on them | In `.env.example`, not local observed | Do not imply implemented integration behavior. |

## Provider Setup Checklists

### Vercel

- Discovery status as of the latest staging setup check:
  - no local `.vercel/project.json` exists
  - no root `vercel.json` exists
  - the Vercel connector can see the `FloorConnectorPro` team, slug `floor-connector-pro`, id `team_YagR2wrTSaYjQqCLBlbzfopb`
  - the connector reports no projects under that team
  - no staging deployment URL is discoverable from this workspace yet
  - if a Vercel project already exists elsewhere, the active Vercel account likely lacks access to that project/team; switch the Vercel CLI/connector to the owning account or invite the current account to the correct team before repeating project discovery
- Connect the Vercel project to `https://github.com/filamonte/v0-floor-connector.git`.
- Decide whether staging uses a protected preview deployment, a stable staging domain, or both.
- Keep production, preview, and staging env vars separated.
- Configure `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_MARKETING_URL`, and explicit `APP_ENV=staging` for staging.
- Confirm monorepo root/build command expectations before deploying. Current package scripts expose `pnpm build`, `pnpm --filter @floorconnector/web typecheck`, and `pnpm --filter @floorconnector/web lint`.
- Recommended first Vercel project setup:
  - Project name: `floorconnector` or `floorconnector-staging`
  - Team: `FloorConnectorPro`
  - Git repository: `filamonte/v0-floor-connector`
  - Framework preset: Next.js
  - Install command: `pnpm install --frozen-lockfile`
  - Build command: `pnpm --filter @floorconnector/web build`
  - Development command, if Vercel asks: `pnpm --filter @floorconnector/web dev`
  - Output directory: leave as Vercel/Next.js default unless the first build log proves it needs an explicit path
  - Node version: use a Node 20+ runtime; the repo declares `node >=20.0.0`
  - Root directory: prefer `apps/web` if Vercel's monorepo detection keeps workspace package resolution intact; if workspace package resolution fails, switch to repo root and keep the filtered web build command
  - Do not add a `vercel.json` until a failed build or owner deployment preference proves the setting should live in the repo
- Decide deployment protection before sharing a staging link externally.
- After deploy, smoke public home, `/login`, `/signup?next=/setup/company`, `/api/health`, `/api/health/auth`, contractor dashboard, portal home, and super-admin access with the intended accounts.

### Supabase

- Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only service-role key names for the target environment.
- Keep the service role key server-only. Never expose it to browser env or screenshots.
- Configure Supabase Auth Site URL and redirect URLs for the staging/public host, including `/auth/callback` and `/update-password`.
- Align Google OAuth callback URLs with the staging host.
- Run `supabase migration list` and `supabase db push --dry-run` before staging rehearsal when CLI access is available.
- Confirm RLS remains enabled and no staging shortcut bypasses tenant isolation.
- Confirm contractor, platform admin, and portal customer demo users exist.
- Confirm portal customer grants point to the intended demo project.
- Choose the existing company id for `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` before enabling public intake.

### Stripe Contractor Payment Gateway

- Decide test vs live key posture before exposing any payment action.
- Use test keys for controlled staging unless the owner explicitly approves live mode.
- Configure the contractor payment webhook endpoint for the staging host only when webhook smoke is in scope.
- Configure an endpoint-specific `STRIPE_WEBHOOK_SECRET`; Stripe CLI and Dashboard endpoints produce different secrets.
- Treat provider-isolated local QA as proof of app boundary behavior, not proof that Stripe Dashboard forwarding is configured.
- Treat synthetic webhook E2E as proof of signature/idempotency/business logic, not proof that Stripe can reach the staging host.
- Do not click customer payment checkout in a demo unless the run is explicitly scoped for safe test-mode payment QA.

### Stripe SaaS Billing / Subscription

- Confirm whether staging uses the app-managed `platform_billing_settings.stripe_price_id` or env fallback `STRIPE_FOUNDER_PLAN_PRICE_ID`.
- Keep test-mode Product/Price references separate from future live Product/Price references.
- Configure `APP_ENV=staging` before SaaS Checkout/webhook staging rehearsal so metadata does not default to development.
- Configure SaaS webhook endpoint `/api/stripe/saas-billing-webhook` and endpoint-specific `STRIPE_WEBHOOK_SECRET` only when replay is intentionally in scope.
- Do not demo live subscription checkout until price reference, webhook endpoint, webhook secret, and supported event list are reviewed.
- Keep tenant activation manual. Stripe success does not activate a tenant.

### Postmark / Email

- Configure `POSTMARK_SERVER_TOKEN` and the sender/from names in the staging server env only if provider-backed email is in scope.
- Confirm sender domain/signature status in Postmark before sending real email.
- Decide whether staging demo should send real emails or use copy-link fallback.
- Use staging-safe recipients and avoid broad email deliverability or reputation experiments during a customer/investor demo.
- Keep provider-backed email behind activation guard expectations.

### SignWell / E-Sign

- Configure `SIGNWELL_API_KEY` and `SIGNWELL_WEBHOOK_SECRET` only for an explicit provider e-sign test lane.
- Confirm the SignWell webhook endpoint URL and signing secret for the staging host before replay.
- Do not claim live provider-signature replay readiness while `SIGNWELL_WEBHOOK_SECRET` is missing.
- Distinguish the implemented canonical contract/signature foundation from external SignWell provider integration.
- Do not call SignWell APIs during general staging/demo prep.

### Early Access / Activation

- Configure `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` before public request capture is enabled on a production-like host.
- Smoke `/signup?next=/setup/company`, `/setup/company`, `/setup/billing`, and `/setup/pending-activation`.
- Smoke `/super-admin/early-access` with a platform-admin account.
- Keep activation manual and operator-reviewed.
- Leave public intake caveated until app/public URLs, email posture, activation guard, and demo tenant ownership are confirmed.

## Demo Modes

### Mode 1: Controlled Internal Demo

Recommendation: GO when local validation passes.

Safe to show:

- public homepage and login/signup entry points
- setup company, billing setup, and pending activation copy
- contractor dashboard, project readiness, jobs, and schedule handoffs
- project, estimate, contract, invoice, job, and schedule workspaces
- portal review pages with scoped portal customer auth
- provider-isolated payment boundary and synthetic webhook coverage as QA proof
- super-admin billing and early-access views as names-only/operator-controlled surfaces

Do not click:

- live Stripe checkout, payment links, Customer Portal, or subscription checkout
- live SignWell provider signature actions
- provider email send actions unless email is the explicit test
- activation actions unless the target tenant and evidence are selected for a local/test operator rehearsal

### Mode 2: Public Early-Access Intake

Recommendation: CONDITIONAL.

Required before public use:

- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` configured for the target staging/production company
- explicit `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_MARKETING_URL`, and `APP_ENV`
- Supabase Auth redirect URLs and Google OAuth callbacks aligned to the public host
- Postmark sender/domain posture decided
- activation guard reviewed on the staging host
- setup and pending-activation routes smoked with a real test user

### Mode 3: Live Provider Billing / Signature / Payment Replay

Recommendation: NO-GO until provider configuration is verified.

Required before changing this status:

- Stripe key mode decision documented
- Stripe webhook endpoint and endpoint-specific signing secret configured for the staging host
- SaaS price reference configured through `platform_billing_settings` or `STRIPE_FOUNDER_PLAN_PRICE_ID`
- Stripe CLI or Dashboard test webhook path intentionally replayed
- contractor payment webhook and SaaS billing webhook kept separate
- `SIGNWELL_WEBHOOK_SECRET` and endpoint verified
- Postmark sender/domain confidence established
- owner-approved final provider smoke plan

## Demo Route Script

| Step | Click / open | What to say | What it proves | Do not click | Posture |
| --- | --- | --- | --- | --- | --- |
| 1 | Public home | "FloorConnector is a connected operating system for specialty flooring contractors." | Public positioning and early-access entry are coherent. | Do not submit public intake unless target company/email posture is configured. | Real public route, intake conditional. |
| 2 | `/login` or `/signup?next=/setup/company` | "One auth foundation routes each role to the right surface." | Real Supabase auth and safe post-login routing. | Do not expose credentials. | Real auth. |
| 3 | `/setup/company` | "Company setup writes to the contractor organization profile." | Onboarding uses canonical company/location records. | Do not create throwaway public data unless scoped. | Real setup path. |
| 4 | `/setup/billing` and `/setup/pending-activation` | "Billing setup and activation are intentionally separated." | Tenant can prepare work while external actions stay guarded. | Do not start live Checkout. | Test/provider caveated. |
| 5 | `/dashboard` | "The dashboard shows operational handoffs, not fake metrics." | Dashboard reads canonical opportunities, projects, jobs, invoices, and cues. | Do not treat missing fixtures as product failure without checking auth/data. | Real canonical data. |
| 6 | Dashboard `Projects ready for job creation` | "A ready project with no job routes into canonical job creation." | Ready project/no-job handoff is fixture-backed. | Do not create a job unless demo scope allows it. | Fixture-backed. |
| 7 | Dashboard `Jobs needing scheduling` | "An existing unscheduled job opens the Schedule action panel." | Existing job/schedule handoff is fixture-backed. | Do not imply dispatch automation. | Fixture-backed. |
| 8 | Project detail readiness hub | "Project is the continuity hub across commercial, billing, job, schedule, and portal context." | Canonical lifecycle stays project-centered. | Do not bypass readiness blockers. | Real protected route. |
| 9 | Job workspace schedule context | "Jobs keep schedule and crew context tied to the project." | `/jobs` and job detail use canonical jobs/job assignments. | Do not imply route optimization or full dispatch board. | Real protected route. |
| 10 | Contract workspace / portal contract review | "Signature status stays on the shared contract record." | Contractor and portal act on the same contract. | Do not click live external signature provider actions. | Real canonical record, provider caveated. |
| 11 | Invoice/payment visibility | "Invoice balance and payment events stay tied to canonical invoice/payment rows." | Billing visibility exists without fake payment state. | Do not start live customer checkout. | Real canonical record, provider-isolated QA available. |
| 12 | `/portal` | "The customer portal is scoped access to shared records, not a separate database." | Portal grants and customer-safe views work. | Do not count login/access-denied screens as successful portal QA. | Real portal auth/grants. |
| 13 | Portal estimate, contract, invoice, and change-order review | "Customers can review the work package from their side." | Portal review routes use canonical estimates/contracts/invoices/change orders. | Do not mutate signature/payment state unless scoped. | Real portal routes. |
| 14 | `/super-admin/early-access` | "Platform operators review activation evidence manually." | Tenant activation is visible and controlled. | Do not activate a tenant unless explicitly scoped. | Real platform-admin route. |
| 15 | `/super-admin/billing` | "Billing Operations shows names-only configuration health and replay readiness." | SaaS billing status is operator-owned and separate from contractor payments. | Do not create live Stripe resources. | Real platform-admin route, test-mode only. |

## Validation Commands

Required before a staging/demo handoff:

```bash
pnpm --filter @floorconnector/web typecheck
pnpm --filter @floorconnector/web lint
pnpm build
git diff --check
```

Recommended before a longer rehearsal when time allows:

```bash
pnpm e2e:payments
pnpm e2e:portal
pnpm exec playwright test e2e/dashboard-ui.spec.js e2e/schedule-ready-handoff.spec.js --project=chromium-protected
pnpm exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected
pnpm e2e:super-admin
```

Recommended Supabase checks when the CLI is configured and network access is intentional:

```bash
supabase migration list
supabase db push --dry-run
```

Do not run mutating `supabase db push` from demo prep unless the owner explicitly approves the specific migration operation.

## Known Limitations

- Local env names do not prove staging env values or provider dashboard settings.
- Vercel staging/preview posture still needs an explicit domain, protection, and env separation decision.
- `APP_ENV` is missing locally by name; configure it explicitly for staging.
- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` is missing locally by name; public early-access intake should stay conditional until configured on the target host.
- `SIGNWELL_WEBHOOK_SECRET` is missing locally by name; provider signature replay remains no-go.
- `STRIPE_FOUNDER_PLAN_PRICE_ID` is missing locally by name; this is acceptable only if the app-managed platform billing price reference is configured and verified for the target environment.
- Provider-isolated checkout QA and synthetic webhook QA do not prove live Stripe Dashboard endpoint delivery.
- Scheduling is a good-enough canonical job/schedule handoff, not a full dispatch system.
- Print/save document routes are browser-rendered views, not stored generated PDF bytes.

## Owner Action List

1. Choose staging URL strategy in Vercel and configure `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_MARKETING_URL`, and `APP_ENV=staging`.
2. Confirm Supabase Auth Site URL, redirect URLs, and Google OAuth callbacks for the staging host.
3. Choose the staging company id for `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`.
4. Decide whether staging email sends are allowed; if yes, verify Postmark sender/domain status.
5. Decide whether Stripe staging demo remains provider-isolated or uses intentional test-mode Dashboard/CLI webhook smoke.
6. Confirm SaaS founder price source: app-managed platform price reference or `STRIPE_FOUNDER_PLAN_PRICE_ID`.
7. Configure `SIGNWELL_WEBHOOK_SECRET` only when external e-sign provider replay is explicitly in scope.
8. Run the required validation commands and, when staging network access is available, Supabase migration list and dry-run.
9. Rehearse the demo route with the exact accounts and fixture routes planned for the meeting.

## Go / No-Go Gates

GO for controlled internal demo when:

- local validation passes
- auth states and fixture routes are known
- demo stays inside provider-isolated/test boundaries
- no live provider mutation buttons are clicked

CONDITIONAL for public early-access intake when:

- staging/public URL env values are configured
- early-access intake company id is configured
- email posture is decided
- setup and activation guard routes are smoked

NO-GO for live provider billing/payment/signature replay until:

- Stripe endpoint, key mode, price reference, and webhook secret are verified
- SignWell webhook secret and endpoint are verified
- Postmark sender/domain confidence is established
- provider-specific smoke tests are intentionally scoped and run
