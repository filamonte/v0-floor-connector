# FloorConnector UI Patterns

Status: implemented decision-first UI pattern guide for the current branch.

Use this document with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)

This guide documents current UI behavior. It does not introduce new routes, data models, workflow rules, or permission behavior.

## Decision-First Page Structure

Contractor Record Workspaces should answer three questions quickly:

- What record is this?
- What state is it in?
- What should happen next?

For core workflow records, the preferred top stack is:

1. Existing page header or record identity.
2. `ActionBar` for the truthful next action and current state.
3. `WorkflowBar` when the record participates in a sequence.
4. `ProjectStateSummary` or a compact state summary for schedule, readiness, signature, billing, or execution facts.
5. Primary review or execution content.
6. Secondary context such as history, metadata, links, field notes, time, files, or conversations.

The shared record-workspace rhythm is now also recorded in
`recordWorkspaceRhythmSteps` from `@floorconnector/ui`: record identity, state
and next action, primary work, linked context, then details/history. This is a
presentation contract only. It must not create new ownership, persistence,
queues, or readiness calculations.

Project, Estimate, Contract, Invoice, and Job Workspaces now follow this direction. Project remains the primary workflow/readiness hub. Other record workspaces support their own immediate decision while linking back to the Project Workspace when broader handoff state matters.

Estimates are the contractor app's reference implementation for this pattern. Use the Estimate Workspace to calibrate proposal-first language, commercial context, customer/project continuity, semantic status treatment, connected record rails, internal follow-through, and the separation between customer-facing review content and internal-only operational context.

Workflow guidance is now organization-configurable. Guided/Flexible/Manual preferences may reduce next-best-action and readiness guidance visibility on supported workspaces, starting with Project Workspace, but the shared visual grammar and server-side workflow gates remain intact. AI assistance preferences are separate from workflow guidance and should never be treated as permission for autonomous customer-facing, billing, scheduling, signature, or permission actions.

The Golden Workflow Demo Path in [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md) is the current route-by-route QA spine for this pattern. Demo-path polish should preserve the same Record Workspace language across Project, Estimate, Contract, Invoice, Job, Schedule, and Daily Log surfaces instead of adding route-local visual systems.

## ActionBar Usage

Use `ActionBar` near the top of contractor workflow workspaces when a user needs an operational next step.

Good uses:

- Project readiness or next workflow action.
- Estimate draft/send/approval/revision state.
- Contract draft/send/awaiting/countersign/completed state.
- Invoice draft/payment/settled/void state.
- Job schedule/start/complete/blocked state.

Rules:

- The title and CTA must reflect the action that is actually available.
- Do not show `Send` after a record is already sent.
- Do not show `Sign` on contract detail unless the contractor countersign step is actually available.
- Keep destructive or blocked states visually distinct from normal action states.
- If no action is currently available, show a truthful review or waiting state instead of inventing a CTA.
- Copper is reserved for the primary CTA or intentional action emphasis.

Shared action hierarchy class names now live in `@floorconnector/ui`:

- `primaryActionClassName`
- `secondaryActionClassName`
- `overflowActionClassName`

Use these for primary next actions, secondary actions, and overflow or
low-priority actions when a route does not need the full `ActionBar` primitive.
These classes are presentational only and must not change what action is
available.

## Dashboard Command Center

Dashboard should answer "what needs attention?" before it shows passive
summaries. When action queues are available, they are the primary dashboard
attention layer. Older priority-strip summaries should be fallback or
supporting context, not a second competing command surface.

Rules:

- Keep dashboard cards read-only or routing-only unless the existing canonical
  action already lives there.
- Route next steps to the owning workspace: Project, Schedule, Financials,
  Contract, Invoice, Job, Lead/Opportunity, or Field.
- Use shared `StatusBadge`, action hierarchy classes, and empty-state copy
  primitives for dashboard queue surfaces where practical.
- Do not create dashboard-owned operational state, duplicate queue models,
  role-specific persistence, fake persistence, portal copies, or separate
  financial/schedule/readiness truth.
- Role-aware dashboard presentation may be prepared, but personalization engines
  and saved dashboard-owned queue state remain future work unless explicitly
  scoped.

## WorkflowBar Usage

Use `WorkflowBar` to show conservative progress through an existing workflow sequence. It should never imply a downstream record or completion state that the data does not prove.

Common sequences:

- Project readiness: opportunity/customer/project/commercial readiness/scheduling readiness.
- Estimate workflow: estimate -> contract -> job -> invoice.
- Contract workflow: estimate -> contract -> job -> invoice -> payment.
- Invoice workflow: estimate/contract/job -> invoice -> payment.
- Job execution workflow: job/schedule/crew/field work/closeout.

Rules:

- Mark a step complete only when the current record state or linked record proves it.
- Use current/active state for the present operational focus.
- Use blocked state for real blockers or missing prerequisites.
- Use upcoming/not-started state for future steps.
- Keep descriptions short and operational.
- Do not use green for in-progress, sent, awaiting, viewed, or partially signed states.

## ProjectStateSummary Usage

Use `ProjectStateSummary` for compact state facts that help users decide what to do next. Despite the name, it can summarize a record workspace state when the items are clear and compact.

Good summary items:

- Project readiness, financial readiness, and schedule state.
- Estimate total, tax/discount, line count, and project readiness context.
- Contract status, signer progress, and signature activity state.
- Invoice total, paid amount, balance due, and retainage.
- Job status, schedule, crew, and project context.

Rules:

- Avoid repeating the same status, schedule, or crew fact in multiple top-level summaries.
- Do not make support metadata compete with the primary decision.
- Keep lower-priority history, metadata, and connected-record details below the top stack.

## Right Rails And Context Cards

Record Workspace right rails are supporting surfaces, not parallel pages. Keep always-visible rail cards to the highest-signal context: current state, primary linked records, project/customer handoff, and the next useful gateway.

Rules:

- Show one primary linked record per record type when that is enough for orientation.
- Collapse revision history, metadata, extra downstream records, and lower-frequency operational activity behind `<details>` or move it below the primary content.
- Context cards should use a short label, current status, one key value, one link/action, and an optional short note.
- Do not repeat the same project, customer, payment, schedule, or access fact in multiple visible cards on the same page.
- Invoice payment forms and invoice editing forms should remain accessible, but they should not dominate the billing review unless the user is explicitly in an edit surface.

## Responsive Detail Workspaces

Contractor Record Workspaces must remain usable below desktop widths.

Rules:

- The page itself should not create horizontal overflow at common tablet and phone widths.
- Use `min-w-0` on grid children, cards, headers, form fields, and linked-record blocks that sit inside constrained columns.
- Let record titles, customer/project names, reference numbers, metadata, and action rows wrap safely. Use truncation only when the surrounding container cannot expand the page.
- Right rails should stack below main content on smaller screens and keep secondary details collapsed.
- Forms inside secondary sections should use one-column mobile layouts and should not force desktop input widths.
- Tables are acceptable on manager/list pages when wrapped in an intentional inner scroll container. Detail pages should prefer compact cards, summaries, or collapsed sections over wide tables.
- Portal pages should keep customer review actions visible without requiring horizontal scrolling.

## Status Color Semantics

Use shared status helpers from `@floorconnector/ui` where practical:

- `getStatusTone()`
- `getStatusToneClassName()`
- `getStatusBadgeClassName()`
- `getStatusConnectorClassName()`
- `normalizeStatusLabel()`
- `getReadinessTone()`
- `getReadinessToneClassName()`
- `getReadinessBadgeClassName()`

Semantic colors:

- Neutral / Graphite tones: neutral, draft, not started, metadata, active/current utility states, in-progress workflow states.
- Amber/yellow: waiting, needs action, pending readiness, warning.
- Red: blocked, failed, declined, void, destructive, error.
- Green: complete, approved, paid, signed, finished.
- Financial tone: financial/payment/billing emphasis when the state is not
  overdue, failed, blocked, paid, or settled.
- Production tone: field, production, schedule, crew, or dispatch emphasis when
  the state is not failed, blocked, or complete.

Rules:

- Green means complete or accepted, not merely sent or underway.
- Copper is not a status color.
- Blue is not the default contractor-app accent for active/current/in-progress UI; reserve it for explicitly scoped informational states only.
- Metadata chips should stay neutral unless they are true status indicators.
- Do not invent local color systems when the shared helper can represent the state.

Use `StatusBadge` for compact record statuses and `ReadinessBadge` for
Financial Readiness, Schedule Readiness, Production Readiness, and general
Ready/Attention/Blocked states. Use `ReadinessSummary` only as a compact
presentational summary over readiness labels already derived by the route or
read model; it must not calculate readiness.

Use `RecordWorkspaceSection` for shared record-workspace sections that need a
consistent header, short description, action/meta area, and contained content.
It is a section/surface primitive, not a workflow owner. Project continuity
panels and similar linked-context surfaces should use it before creating
route-local panel shells.

## Empty State Usage

Use `AppEmptyState` for web app empty states and the shared
`getEmptyStateCopy()` variants from `@floorconnector/ui` when the route needs a
standard no-records or blocked/waiting state.

Implemented variants:

- no records yet
- blocked by missing upstream step
- waiting on customer
- waiting on payment
- waiting on signature
- ready but not scheduled

Rules:

- Name what is missing.
- Explain why it matters in operational language.
- Point to the next truthful action or owning workspace.
- Do not use empty states to imply fake persistence, hidden automation, or a
  downstream record that does not exist.

## FloorConnector Visual System Rules

Estimates are the reference baseline for visual and workflow quality across the app. Manager pages, record workspaces, setup, settings, portal, admin, and super-admin should all feel like parts of the same enterprise system even when their audiences differ.

Rules:

- Use the black/graphite, copper/orange, white, and warm-neutral palette as the default visual language.
- Use shared cards, headers, status pills, action hierarchy, workspace layouts, and settings panels before creating route-local styles.
- Do not introduce blue, purple, cyan, teal, indigo, sky, lime, or pink as major visual identity colors. Use green only for real success/approved/paid/active completion states, red for destructive/error/blocked states, amber/copper for warning or brand/action emphasis, and gray/graphite for neutral or read-only states.
- Do not add new major component styles without documenting why existing shared primitives are insufficient.
- Keep secondary sections behind progressive disclosure when they are not the primary job of the page.
- Keep right rails short and supportive; they should not become a second full page.
- Portal pages must be customer-safe, simpler than contractor pages, and free of contractor-only implementation vocabulary.
- Protected pages must be checked while logged in with the correct role. A login page, access-denied page, or unauthenticated redirect is not a successful visual review.

## Copper CTA Rule

Copper is the contractor app's primary action color. Use it sparingly so it keeps its meaning.

Use Copper for:

- Primary create buttons.
- The primary `ActionBar` CTA.
- A single dominant action in a command surface.
- Intentional contractor-app action emphasis.

Do not use Copper for:

- Passive eyebrows.
- Decorative card borders or backgrounds.
- Status badges.
- Repeated secondary links.
- Hover-only emphasis on list rows.

Portal and super-admin do not automatically inherit the contractor Copper CTA rule. Portal uses customer-facing action hierarchy. Super-admin keeps slate/black administrative primary actions.

## Manager And List Pages

Manager Pages are global queues and cross-record work surfaces. They are not alternate workflow homes.

Use the shared Manager Page direction:

- Page identity at the top.
- Command bar for search, filters, and primary create action.
- Compact summary or queue cards where useful.
- Dense but readable list/register rows.
- Semantic status badges.
- Light next-action or continuity cues only when existing loaded data supports them.

Rules:

- Keep primary create actions clear.
- Do not make lists too airy for contractor operations.
- Do not add heavy `ActionBar` or `WorkflowBar` patterns to list pages unless the page naturally supports them.
- Avoid duplicate status emphasis across summary tiles, queue cards, filters, and rows.
- Keep Quick-Create overlays as short canonical-record-first entry points that hand off into the full Record Workspace.
- Preserve the Estimate Manager Page as the reference for operational entry surfaces: compact summary, command/search/filter rhythm, proposal queues, canonical quick create, and continuity into the full Estimate Workspace.

## Portal Differences

Portal users are customers or customer contacts. Portal pages should remain review-first and permission-safe.

Portal should:

- Focus on project-scoped review, approve, sign, pay, and decline actions.
- Use clear customer-safe language.
- Keep primary customer actions obvious.
- Keep secondary return/open links quieter than approve/sign/pay actions.
- Use semantic status styling conservatively.

Portal should not copy:

- Contractor Manager Page command bars.
- Contractor operational ActionBar/WorkflowBar patterns wholesale.
- Universal Create or Quick-Create.
- Contractor-only schedule, crew, readiness, or internal financial controls.

## Customer / Access / Review Ownership

Use [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md) for the current customer/contact/access/review ownership map.

Rules:

- Customer Workspace should lead with account summary, primary contact, linked project history, open invoice state, and recent relationship context.
- People should be the management home for customer contacts, portal grants, temporary credentials, stored contact permissions, and per-contact project visibility.
- Project Workspace may show project-specific customer visibility, but should link to People for management.
- Estimate, Contract, and Invoice Workspaces should keep their primary business review first and collapse internal follow-through forms when they are not the main job.
- Portal pages should avoid internal implementation words such as canonical, provider-backed, workflow state, and contractor-only controls unless the customer needs that distinction to act safely.

## Super-Admin Differences

Super-admin users manage platform defaults and governance. Super-admin pages should feel administrative, dense, and deliberate.

Super-admin should:

- Keep slate/black primary save/admin actions.
- Use neutral cards, borders, and headings.
- Preserve configuration grouping for scanning and auditability.
- Use semantic badges for true platform statuses where safe.

Super-admin should not copy:

- Contractor Copper CTAs.
- Contractor operational next-action framing.
- Project or workflow bars.
- Customer/project/job execution hierarchy.

## Validation Expectations

For UI-only pattern work, use scoped validation:

- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`
- Playwright discovery with `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list`
- Targeted decision-first Playwright smoke tests when practical
- Golden Workflow route smoke through the protected Playwright project when demo-path continuity is touched

Mutation-heavy workflow tests should stay scoped to explicit workflow tasks. UI pattern work should not bypass readiness guards, auth, RLS, server actions, or canonical workflow rules.
