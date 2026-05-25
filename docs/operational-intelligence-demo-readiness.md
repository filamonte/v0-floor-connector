# Operational Intelligence Demo Readiness

Status: Active
Doc Type: Demo / QA

This checklist is the concise demo path for the recent operational
intelligence, scheduling, communications, collections, field, and portal-safe
status stack.

It is not a feature plan, schema plan, broad docs rewrite, or authorization for
new demo data. Use it with
[docs/current-state.md](C:/FloorConnector/docs/current-state.md),
[docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md),
[docs/workflows.md](C:/FloorConnector/docs/workflows.md),
[docs/operational-intelligence-stack-audit.md](C:/FloorConnector/docs/operational-intelligence-stack-audit.md),
[docs/ai-operational-copilot-foundation.md](C:/FloorConnector/docs/ai-operational-copilot-foundation.md),
[docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md),
and
[docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md).

## Demo Story

FloorConnector now has a connected operating loop:

`contractor command center -> project intelligence -> schedule / field / AR action surfaces -> communications handoff -> customer portal clarity`

The demo should show FloorConnector as one contractor operating system over the
canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Do not present this as autonomous AI, provider-backed AI, a messaging product,
a dispatch optimizer, or a customer-facing internal operations feed.

## Preconditions

- Use real saved/staging auth and remote Supabase-backed records.
- Use one coherent sample project with customer, contract/signature, invoice or
  payment, schedule/job, daily-log/field, communication, and portal context
  where possible.
- For the strongest current rehearsal, prefer one golden-path project that also
  includes estimate, contract, and invoice document-readiness coverage plus at
  least one document-specific customer-bound communications handoff. If that
  data is missing, record it as a sample-data gap rather than treating the
  feature as failed.
- Use a portal customer session backed by real `portal_access_grants` and
  `portal_project_access` before showing `/portal`.
- Keep the QA organization workflow guidance set to Guided for the main
  walkthrough.
- Enable deterministic AI suggestions, AI summaries, AI drafting, and dashboard
  digest visibility when the demo should show Copilot/draft affordances.
- Keep provider-backed AI disabled unless a separate approved provider demo is
  intentionally configured.
- Keep AI form prefill and work-item recommendations disabled unless a separate
  approved slice changes that boundary.
- Confirm `/settings/workflows` shows the intended controls before the demo.
- Keep `docs/feature-build-status.md` unrelated and untracked unless a later
  task intentionally handles that doc.

## Recommended Route

| Step | Route                                            | What It Proves                                                                                                                                                                                        | Demo Notes                                                                                                                                                                                                             |
| ---- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `/dashboard`                                     | The contractor starts from a command center that groups high-signal operating attention.                                                                                                              | Show AI Operational Digest if enabled. Say it routes to source records and does not create tasks, messages, or AI truth.                                                                                               |
| 2    | `/projects`                                      | Projects remain the operating root, while global pages still act as queues.                                                                                                                           | Open a real project from the list rather than relying on stale IDs.                                                                                                                                                    |
| 3    | `/projects/[projectId]`                          | Project Workspace explains state through the command-center map, ProjectPulse, Project Command Timeline, Copilot, FieldTrail, MessageCenter, CloseoutTrail, Proof Center, and source-record handoffs. | Show current status first, then timeline as a derived read model over canonical records, then Copilot as deterministic review-first synthesis. Use draft actions only as editable handoffs, not sends.                 |
| 4    | `/schedule`                                      | CrewBoard shows ready-to-schedule, today/tomorrow/this-week, in-progress, missing-crew, and readiness-review work from canonical jobs and assignments.                                                | Do not claim full dispatch automation, route optimization, or automatic scheduling.                                                                                                                                    |
| 5    | `/financials/accounts-receivable`                | Collections Follow-Up Intelligence explains collectible/payment follow-up items from canonical invoices, payments, and payment events.                                                                | Show canonical invoice/project/customer links and optional review-first draft handoffs. Avoid pressure language.                                                                                                       |
| 6    | `/communications` with a Copilot handoff query   | Copilot drafts can land in the existing communications review surface with customer send-readiness status.                                                                                            | Show intended audience, related canonical record, readiness/missing requirements, and the no-automatic-send boundary. No provider send, notification, thread auto-create, or customer email/SMS happens automatically. |
| 7    | `/daily-logs` and one `/daily-logs/[dailyLogId]` | Field execution continuity stays on Daily Logs, Job Notes, field evidence, labor/time, and project/job handoffs.                                                                                      | Show mobile-friendly scanning if useful. Do not claim offline/native mobile or customer-facing field evidence.                                                                                                         |
| 8    | `/portal` and one `/portal/projects/[projectId]` | The customer sees safe project status explanations from the same canonical records.                                                                                                                   | Confirm the portal does not expose Copilot, AR pressure, FieldTrail, internal blockers, internal Job Notes, readiness machinery, or raw evidence internals.                                                            |
| 9    | `/settings/workflows`                            | AI/workflow controls are explicit and organization-scoped.                                                                                                                                            | Show Guided mode, deterministic AI controls, dashboard digest/drafting toggles, and provider-backed AI disabled unless intentionally configured.                                                                       |

## Demo Script

1. Open the dashboard and say: "The company starts from operating attention,
   not passive charts."
2. Open the project and say: "This is the continuity hub. The intelligence is
   derived from project, commercial, schedule, field, communication, proof, and
   payment records already in the system."
3. Open CrewBoard and say: "Scheduling uses canonical jobs and assignments. The
   board helps decide what is ready or needs review."
4. Open Accounts Receivable and say: "Collections guidance comes from invoices,
   payments, and payment events. It prepares follow-up, but does not send or
   mutate payment state."
5. Open Communications with a draft handoff and say: "The draft is a
   review-first starting point. Send readiness explains whether the message is
   customer-safe enough to prepare, and a person edits through the existing
   communications surface. Nothing sends automatically."
6. Open Daily Logs and say: "Field execution stays attached to the same
   project/job chain."
7. Open the portal and say: "The customer sees the same project chain through a
   safe window, without internal operations language."
8. Open workflow settings and say: "The owner controls guidance and AI
   assistance. Provider-backed AI is optional and remains off unless configured."

## What Each Stop Should Prove

- Dashboard proves the company has a source-record command center.
- Project Workspace proves the product has a project-centered intelligence hub
  and derived command timeline over the connected lifecycle.
- Schedule proves dispatch visibility stays on canonical jobs, appointments,
  and assignments.
- Accounts Receivable proves collections intelligence is deterministic and
  payment-record grounded.
- Communications proves AI drafts hand off to human review with customer
  send-readiness checks instead of sending.
- Daily Logs prove field execution remains connected to project/job truth.
- Portal proves customer-facing status is canonical and safe.
- Workflow Settings prove the assistance layer is governed and optional.

## QA Org Settings

For the cleanest QA walkthrough state:

- workflow guidance mode: Guided
- AI suggestions: enabled
- AI summaries: enabled
- AI drafting: enabled
- AI dashboard digest: enabled
- provider-backed AI enhancement: disabled unless intentionally configured
- AI form prefill: disabled unless intentionally scoped
- AI work-item recommendations: disabled unless intentionally scoped
- required confirmation before AI actions: enabled

If these controls are off, the app should still load and route through canonical
records. The demo should then describe the disabled-state behavior instead of
pretending draft or digest surfaces are missing by mistake.

## QA Smoke Checklist

Before a live demo, check:

- `/dashboard` loads with contractor auth and no runtime/hydration errors.
- AI Operational Digest appears when dashboard digest controls are enabled.
- `/projects` loads and has at least one suitable project link.
- The selected Project Workspace shows the command-center map, ProjectPulse,
  Project Command Timeline, and, when controls allow, AI Operational Copilot
  with review-first draft actions.
- The Project Command Timeline renders needs-attention, ready-to-move, and
  recent movement from canonical estimates, contracts, invoices, payments,
  schedule, Daily Logs, field blockers, proof/document readiness, communication,
  and portal visibility where the sample project has those records.
- `/schedule` loads and shows CrewBoard queues/readiness review.
- `/financials/accounts-receivable` loads and contains collections/payment
  follow-up context without horizontal overflow.
- A Copilot or AR draft handoff opens `/communications` with customer
  send-readiness context, review/missing-requirement copy, and no automatic
  send.
- `/daily-logs` loads and at least one Daily Log detail route is available for
  field continuity, if the environment has a valid daily log.
- `/portal` loads with portal customer auth.
- A portal project workspace renders a customer-safe status explanation and
  links only to portal-safe routes.
- Portal home and the portal project workspace show the customer next action,
  shared estimate/contract/invoice cues, print/review/sign/pay affordances, and
  mobile-safe stacking without exposing contractor-only intelligence or
  provider metadata.
- `/settings/workflows` shows the intended workflow/AI controls.

Suggested commands for this docs-only checklist:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check "docs/operational-intelligence-demo-readiness.md" "docs/chat-handoff.md"
git diff --check
git status --short --branch
```

For a route-level rehearsal, use the existing saved-auth Playwright and manual
QA guidance in [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
and
[docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md).

## Known Limitations

- No autonomous AI is implemented.
- No live provider-backed AI is used unless separately configured through an
  approved provider path.
- Copilot summaries and draft actions are deterministic assistance over
  canonical records, not source-of-truth records.
- Draft handoffs do not send email/SMS, create notifications, create new
  communication threads, or create customer-facing messages automatically.
- CrewBoard is not full route optimization, automatic dispatch, or broad
  external calendar sync.
- Collections Follow-Up Intelligence does not send reminders, pressure
  customers, mutate payments, retry failed payments, or create collection
  events.
- Daily Log and field evidence visibility remains contractor-side unless a
  separate approved customer-sharing slice is implemented.
- Portal status explanations are customer-safe and intentionally omit internal
  Copilot, AR, blocker, field-note, readiness, assignment, provider, and raw
  evidence details.
- Documents and PDFs remain browser print/save or route-rendered outputs where
  currently implemented; full stored document/version management remains future
  depth.
- Broad external e-sign, accounting sync, tax integration, customer messaging,
  and automated reminders remain future work unless current-state records a
  later implementation.

## Do Not Claim

- Do not claim autonomous AI, agentic operations, or automatic task execution.
- Do not claim live model/provider AI unless the environment is explicitly
  configured and approved for that demo.
- Do not claim automatic customer sending, reminders, collections, or
  scheduling.
- Do not claim customer-facing internal blockers, Copilot, AR urgency,
  FieldTrail, Job Notes, Proof Center internals, or readiness machinery.
- Do not claim duplicate portal records, portal-only project state, or a
  customer-facing copy of contractor operations.
- Do not claim drag/drop dispatch as fully production-ready unless a separate
  QA pass proves the exact interaction being shown.
- Do not claim full calendar/resource optimization.
- Do not claim stored generated PDFs, full document management, provider e-sign
  depth, accounting sync, live billing launch, or tax filing integration.

## Guardrails To Mention

- "Everything shown starts from canonical records."
- "The customer portal is a safe view into shared records, not a duplicate
  customer system."
- "AI here is deterministic and review-first; it explains and drafts, but a
  person acts."
- "The communications handoff is a review surface, not an automatic send."
- "Collections and scheduling surfaces organize attention; they do not mutate
  money or schedule commitments without the existing explicit actions."
- "Provider-backed AI, external sends, live billing, and deeper integrations
  are governed expansion layers, not hidden demo behavior."

## Demo Gap Notes

Use this checklist to choose the next feature from observed friction, not from
guesswork. Good next-slice candidates should come from a real rehearsal note,
such as:

- a document/PDF generation gap that prevents a clean handoff
- a communications/customer-send gap that blocks the review-first message story
- a data/fixture gap that prevents showing the connected route chain
- a missing document-specific customer-bound handoff for estimate, contract, or
  invoice send-readiness
- a project-timeline data gap where the selected project is valid but lacks the
  linked records needed to show the full command-center story
- a mobile field evidence QA gap that prevents showing real uploaded evidence
- a scheduling interaction gap that confuses the CrewBoard story

Do not create demo-only shortcuts to cover those gaps. Record the gap and pick
one guarded implementation slice.

Current recommended data step:

- Run `pnpm demo:data:inventory` to review the no-write golden-path readiness
  checklist, current QA signals, and known missing real-record coverage.
- FloorConnector demos and QA use remote Supabase-backed canonical records.
  Missing coverage should be created through real app workflows and verified in
  the live environment, not through fake/demo database inserts.
- Treat any remote write-capable data setup as a separate owner-confirmed task
  after read-only target validation, explicit tenant allowlist, idempotency, and
  cleanup policy. It is not current demo policy.
