# Communications Capability Wave v1

Status: Planning-only
Doc Type: Design / Communications Planning

## 1. Status And Intent

This document is a planning doc only. It defines a narrow, implementation-safe
Communications Wave v1 for market-readiness planning. It is not implementation
truth, does not change current status, and does not authorize schema, route,
provider-send, portal-message, AI, automation, or UI behavior changes by itself.

Communications Wave v1 should make the current communications foundation feel
more like the record-linked nervous system of the contractor workflow while
preserving the canonical FloorConnector lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The first safe implementation work should strengthen review, continuity, and
source-record handoffs over existing `communication_threads`,
`communication_messages`, `notifications`, `notification_events`,
`notification_deliveries`, `document_delivery_events`, and related read models.
It must not create duplicate message/thread models or add provider-backed send
behavior.

## 2. Source Docs Read

Read first:

- `docs/developer-source-of-truth.md`

Then read:

- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/sales-to-production.md`
- `docs/ai-native-development-architecture.md`
- `docs/floorconnector-build-list-and-completion-timeline.md`
- `active-waves.md`
- `docs/design/operational-capability-waves-v1-coordination.md`
- `docs/design/project-workspace-capability-wave-v1.md`
- `docs/design/scheduling-capability-wave-v1.md`
- `docs/design/field-mobile-capability-wave-v1.md`
- `docs/design/portal-capability-wave-v1.md`

Communication-specific docs surfaced by search and read:

- `docs/communications-layer.md`
- `docs/communications-and-ai-intake.md`
- `docs/document-delivery-proof-architecture.md`
- `docs/design/communications-v1-record-linked-workspace.md`
- `docs/design/communications-v1-write-path.md`
- `docs/design/communications-v1-portal-safe-replies.md`
- `docs/design/communications-v1-triage-and-unread.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`

## 3. Current Implemented Baseline

Based on the docs and inspected code, the current branch already has a real
communications foundation, not a broad provider-backed unified inbox.

Implemented foundations confirmed:

- `/communications` exists at `apps/web/app/(app)/communications/page.tsx`.
- Contractor communications read models exist in
  `apps/web/lib/communications/contractor-data.ts` and
  `apps/web/lib/communications/workspace-summary.ts`.
- Canonical communication write policy lives in
  `apps/web/lib/communications/write-policy.ts`.
- Contractor message and triage actions live in
  `apps/web/lib/communications/actions.ts`.
- Reply triage is derived in `apps/web/lib/communications/reply-triage.ts`
  from canonical message history and thread state.
- Customer send-readiness copy for review-first handoffs lives in
  `apps/web/lib/communications/send-readiness.ts`.
- Portal project communication summaries and access-safe reply checks live in
  `apps/web/lib/communications/portal-project-summary.ts` and
  `apps/web/lib/communications/portal-project-data.ts`.
- Project MessageCenter derives project communication, Send Trail, Signature
  Trail, Payment Trail, and customer-access context in
  `apps/web/lib/messagecenter/summary.ts` and
  `apps/web/lib/messagecenter/data.ts`.
- Contractor notification read-state lives in `apps/web/lib/notifications/data.ts`
  and `apps/web/lib/notifications/system.ts`.
- The canonical communication tables were introduced by
  `supabase/migrations/20260426210000_notifications_communications_foundation.sql`.
- Document delivery context exists through `document_delivery_events` and is
  surfaced through Send Trail and MessageCenter; it remains evidence over
  canonical documents, not message truth.
- Portal evidence proof context exists through `portal_evidence_delivery_events`
  and related read models; it is not portal-owned message state.

Current behavior confirmed by docs/code:

- Contractor users can review canonical record-linked communication threads on
  `/communications`.
- Contractor users can save internal notes or customer-visible portal-history
  messages to canonical threads.
- Portal customers can reply only to existing customer-visible, project-scoped
  threads when portal access and project visibility allow it.
- Contractor-side reply triage derives needs-response state for inbound portal
  customer replies until a later contractor customer-visible response exists.
- Existing notification read-state is separate from derived reply triage.
- Communication workspace lanes currently group customer, project, commercial,
  finance, closeout/evidence, and internal context from existing records.
- Project, customer, estimate, contract, change-order, invoice, and job
  workspaces now expose compact communication-continuity handoffs back into
  `/communications` where existing project or subject-linked thread summaries
  support that context. These panels do not create record-local inboxes or new
  write paths.
- Some bounded provider-backed email paths already exist elsewhere for document
  and appointment workflows, with provider attempt evidence handled through the
  notification/delivery boundary. This plan does not change or expand those
  sends.

Current baseline is not:

- a generic inbox;
- a provider email or SMS sync product;
- a portal-owned chat system;
- a separate AI inbox;
- a replacement for document delivery, signature, payment, or portal access
  truth.

## 4. Product Goal

Make communications the record-linked nervous system of the contractor workflow.

The communications surface should help office users answer:

- Which customer, project, estimate, contract, change order, job, invoice, or
  payment is this communication about?
- Which customer-visible reply needs contractor follow-up?
- Which internal notes stay contractor-only?
- Which notification, delivery, portal evidence, payment, or signature context
  explains why this thread matters?
- Which canonical workspace should the user open next?

The goal is continuity and review, not a new message product.

## 5. Wave v1 Scope

Wave v1 should stay narrow and implementation-safe:

- Communication continuity over existing canonical records.
- Record-linked thread/message visibility from the existing
  `communication_threads` and `communication_messages` foundation.
- Notification/event review that keeps notification read-state separate from
  reply follow-up state.
- Customer-safe communication boundaries for contractor internal notes,
  customer-visible history, and portal replies.
- Project/customer context links where current read models already support
  them.
- Inbox/list polish if it stays on the existing `/communications` route and
  existing read models.
- Clear handoffs from `/communications` and Project MessageCenter back to
  canonical source records.
- Read-only delivery and evidence context where `document_delivery_events`,
  `notification_events`, `notification_deliveries`, and
  `portal_evidence_delivery_events` are already available.

## 6. Out Of Scope

Wave v1 explicitly excludes:

- new duplicate message or thread tables;
- provider-backed send changes;
- autonomous replies;
- portal-owned messages;
- broad inbox redesign;
- schema or migrations unless separately approved;
- external email/SMS provider integration;
- generic portal inbox;
- provider sync, callbacks, retries, or delivery automation;
- notification automation or reminder creation;
- AI-generated message sending;
- customer-facing exposure of internal notes, FieldTrail, Proof Center, Daily
  Log bodies, Job Notes, Work Item bodies, provider diagnostics, or unshared
  evidence;
- treating notification read-state as reply resolution;
- treating provider telemetry as business truth.

## 7. Proposed Decomposition

Recommended future implementation slices:

1. Communications read-model audit
   - Confirm every list, badge, lane, and follow-up count still derives from
     canonical threads, messages, notifications, delivery events, portal
     evidence events, and source-record links.
   - Document any stale assumptions before UI work.

2. Communications overview/list polish
   - Tighten `/communications` lane labels, filters, selected-thread context,
     empty states, and source-record links over the existing read models.
   - Keep the route and write behavior unchanged.

3. Record-linked communication continuity panel
   - Improve compact project/customer/source-record continuity where existing
     MessageCenter and related conversation cards already support it.
   - Do not add a new activity table or message-copy layer.

4. Notification/event visibility pass
   - Clarify the distinction between unread notification read-state, reply
     triage, document delivery context, and portal evidence context.
   - Keep notification triage on existing notification rows only.

5. Customer-safe reply boundary review
   - Re-audit contractor internal notes, customer-visible messages, and portal
     replies for access and visibility safety.
   - Preserve the existing portal rule: replies only on eligible
     customer-visible project threads.

6. QA/test hardening
   - Add or improve focused tests for read-model derivation and write-policy
     boundaries only when a future implementation slice changes code.
   - Add protected browser smoke only after saved auth and fixtures are healthy.

## 8. Hotspot Map

Confirmed route and page hotspots:

- `apps/web/app/(app)/communications/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`

Confirmed communications helpers:

- `apps/web/lib/communications/actions.ts`
- `apps/web/lib/communications/data.ts`
- `apps/web/lib/communications/contractor-data.ts`
- `apps/web/lib/communications/workspace-summary.ts`
- `apps/web/lib/communications/reply-triage.ts`
- `apps/web/lib/communications/send-readiness.ts`
- `apps/web/lib/communications/write-policy.ts`
- `apps/web/lib/communications/portal-project-data.ts`
- `apps/web/lib/communications/portal-project-summary.ts`
- `apps/web/lib/communications/schemas.ts`
- `apps/web/lib/communications/appointment-confirmations.ts`
- `apps/web/lib/communications/appointment-reminders.ts`
- `apps/web/lib/communications/communication-preferences.ts`

Confirmed notification and provider-attempt helpers:

- `apps/web/lib/notifications/data.ts`
- `apps/web/lib/notifications/system.ts`
- `apps/web/lib/notifications/types.ts`
- `packages/integrations/src/communications/postmark.ts`

Confirmed project communication and delivery context helpers:

- `apps/web/lib/messagecenter/data.ts`
- `apps/web/lib/messagecenter/summary.ts`
- `apps/web/lib/sendtrail/summary.ts`
- `apps/web/lib/document-delivery/data.ts`
- `apps/web/lib/document-delivery/actions.ts`
- `apps/web/components/communication-reply-form.tsx`
- `apps/web/components/communication-notification-triage-form.tsx`
- `apps/web/components/contractor-notifications-center.tsx`
- `apps/web/components/document-delivery-history-panel.tsx`

Confirmed tests:

- `apps/web/lib/communications/workspace-summary.test.ts`
- `apps/web/lib/communications/reply-triage.test.ts`
- `apps/web/lib/communications/send-readiness.test.ts`
- `apps/web/lib/communications/write-policy.test.ts`
- `apps/web/lib/communications/portal-project-summary.test.ts`
- `apps/web/lib/messagecenter/summary.test.ts`
- `apps/web/lib/sendtrail/summary.test.ts`
- `apps/web/lib/document-delivery/provider-send-regression.test.ts`
- `e2e/estimate-document-pdf-delivery.spec.js`

Confirmed migrations and tables relevant to planning:

- `supabase/migrations/20260426210000_notifications_communications_foundation.sql`
- `supabase/migrations/20260426223000_automation_notification_preferences.sql`
- `supabase/migrations/20260520110000_document_delivery_events.sql`
- `supabase/migrations/20260520125000_document_delivery_events_estimates_invoices.sql`
- `supabase/migrations/20260520130000_document_delivery_events_contracts.sql`
- `supabase/migrations/20260527173000_portal_evidence_delivery_events.sql`
- `supabase/migrations/20260527174500_harden_portal_evidence_delivery_event_functions.sql`

## 9. Cross-Stream Coordination

Project Workspace:

- Project Workspace remains the readiness and continuity hub.
- Communications should improve MessageCenter and source-record handoffs only
  through existing project-linked records and read models.
- Do not create a project-owned message table or activity truth.

Portal:

- Portal remains customer-safe and project-grant scoped.
- Portal replies must stay on existing eligible customer-visible project
  threads and canonical messages.
- Do not add a portal inbox, portal-owned message state, or portal-only copies.

Scheduling:

- Scheduling remains owned by canonical `jobs`, appointments, and
  `job_assignments`.
- Communications can show schedule-related conversation context only when it is
  already tied to canonical records.
- Do not create appointment, schedule, reminder, or dispatch state from
  communications.

Field/Mobile:

- Field/Mobile remains on canonical jobs, Daily Logs, Field Notes, execution
  attachments, Work Items, people, vendors, and time records.
- Communications must not expose internal field notes, Daily Log bodies, Work
  Item bodies, or unshared field evidence to customers.
- Field follow-up messages should remain record-linked and customer-safe before
  any future send workflow is considered.

Financials:

- Invoice/payment communication context should link to canonical invoices,
  payments, payment events, Send Trail, and Accounts Receivable handoffs.
- Provider payment truth remains in payments and payment events, not messages.
- Do not add collections send automation, payment reminders, retry workflows, or
  duplicate financial follow-up state.

QA:

- QA should verify built-versus-planned boundaries, notification/read-state
  separation, portal visibility safety, and no provider-send expansion.
- Auth, fixture, or Supabase rate-limit blockers should be reported directly
  rather than counted as successful protected-route QA.

## 10. Acceptance Criteria For Implementation Readiness

Communications Wave v1 is safe to implement when:

- Current communications read models and write paths have been audited against
  the current branch.
- The first slice has one owner for `/communications/page.tsx` if that file is
  touched.
- Every proposed UI count, badge, lane, and CTA names its canonical source.
- Internal notes, customer-visible history, and portal replies have explicit
  visibility rules.
- Notification read-state remains separate from derived reply triage.
- Provider-backed send behavior remains unchanged and out of scope.
- No schema, migrations, RLS, route, package, dependency, provider, or
  automation changes are included without a separate approved slice.
- Project Workspace, Portal, Scheduling, Field/Mobile, Financials, and QA
  coordination risks are documented before implementation.
- Relevant helper tests and protected-route smoke targets are identified before
  code changes.

## 11. Validation Plan

For this planning-only pass:

- Prettier check or write for changed Markdown files if available.
- `git diff --check`
- `git diff --cached --check` before commit.

For a future implementation slice:

- Focused helper tests for touched code, likely:
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/communications/workspace-summary.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/communications/reply-triage.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/communications/send-readiness.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/communications/write-policy.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/communications/portal-project-summary.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/messagecenter/summary.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- Protected `/communications`, Project Workspace, Customer Workspace, and
  portal Project Workspace browser smoke when saved auth and fixtures are
  healthy.
- 390px mobile smoke if `/communications` or portal/project communication UI is
  changed.
- Explicit no-change checks for schema, migrations, provider sends, notification
  automation, portal-owned state, and package files.

## 12. Recommended First Implementation Slice

Recommended first code slice: communications read-model audit plus
overview/list polish over existing data.

Keep it small:

- audit `apps/web/lib/communications/contractor-data.ts`,
  `apps/web/lib/communications/workspace-summary.ts`,
  `apps/web/lib/communications/reply-triage.ts`, and
  `apps/web/app/(app)/communications/page.tsx`;
- make only presentation or copy changes that clarify existing queues, source
  links, customer-visible/internal separation, and notification versus reply
  triage;
- keep all writes on existing actions and tables;
- do not add schema, migrations, provider sends, notification events, portal
  message state, route changes, or broad redesign;
- validate with focused communications helper tests, typecheck/lint, and
  authenticated `/communications` smoke when available.

This is the safest first slice because it improves daily follow-up clarity
without changing communication ownership, portal access, provider delivery,
automation, or canonical workflow state.
