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

Project, Estimate, Contract, Invoice, and Job Workspaces now follow this direction. Project remains the primary workflow/readiness hub. Other record workspaces support their own immediate decision while linking back to the Project Workspace when broader handoff state matters.

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

## Status Color Semantics

Use shared status helpers from `@floorconnector/ui` where practical:
- `getStatusTone()`
- `getStatusToneClassName()`
- `getStatusBadgeClassName()`
- `getStatusConnectorClassName()`
- `normalizeStatusLabel()`

Semantic colors:
- Neutral / Graphite tones: neutral, draft, not started, metadata, active/current utility states, in-progress workflow states.
- Amber/yellow: waiting, needs action, pending readiness, warning.
- Red: blocked, failed, declined, void, destructive, error.
- Green: complete, approved, paid, signed, finished.

Rules:
- Green means complete or accepted, not merely sent or underway.
- Copper is not a status color.
- Blue is not the default contractor-app accent for active/current/in-progress UI; reserve it for explicitly scoped informational states only.
- Metadata chips should stay neutral unless they are true status indicators.
- Do not invent local color systems when the shared helper can represent the state.

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

Mutation-heavy workflow tests should stay scoped to explicit workflow tasks. UI pattern work should not bypass readiness guards, auth, RLS, server actions, or canonical workflow rules.
