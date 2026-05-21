# Communications Layer

Status: Planned
Doc Type: Roadmap

This document defines FloorConnector's future communications philosophy. It is strategic architecture guidance only. It does not add messaging routes, notification systems, providers, AI behavior, schema, migrations, APIs, or runtime communication behavior.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md). For current workflow rules, use [docs/workflows.md](C:/FloorConnector/docs/workflows.md).

Related documents:

- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md): future workflow automation philosophy
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md): canonical metric philosophy
- [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md): future operational intelligence strategy
- [docs/gatekeeper-system-vision.md](C:/FloorConnector/docs/gatekeeper-system-vision.md): future operational memory and communications doctrine
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md): broader communications and intake direction

## Purpose

Communications should be workflow-connected, project-connected, canonical-record-connected, and operationally contextual.

FloorConnector should not become a disconnected inbox, chat application, or Slack clone. Messages, notifications, approvals, reminders, portal interactions, and customer replies should attach to the same operational chain that runs the contractor business:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Workflow-Connected Communication

Communication is valuable because it explains and advances work.

Future communication should answer:

- Which customer, project, estimate, contract, job, invoice, payment, or service context is this about?
- What workflow state caused this message?
- What record should the user open next?
- Is the communication internal, customer-facing, portal-originated, provider-delivered, or manually logged?
- Does the communication require a reply, approval, reminder, schedule action, billing follow-up, or no action?

Communication should make workflow state clearer, not create another place where state has to be reconciled.

## Canonical Communication Philosophy

Communication records should be evidence and context around canonical records.

Future communication depth may include:

- email
- SMS
- portal messages
- app messages
- manual phone logs
- voicemail summaries
- website chat and intake
- missed-call follow-up
- provider delivery events
- internal notes

Provider telemetry can enrich communication history, but provider systems are delivery channels, not business truth. FloorConnector should own the canonical communication context and link it to operational records.

## Project-Centered Communication

Project should become the practical communication hub for active work.

Project-centered communication should show:

- sales and estimate context
- contract and signature context
- change-order context
- job and schedule context
- field, daily-log, and punchlist context
- invoice, payment, and collections context
- portal visibility and customer access context
- service, warranty, closeout, and follow-up context where applicable

Global communication surfaces can still exist later, but they should function as queues into project and record context rather than as a separate communication product.

## Internal Communication

Internal operational coordination should attach to the record that caused the coordination need.

Examples:

- estimator follow-up on a sent estimate
- project manager note on contract readiness
- scheduler note on job readiness
- billing owner follow-up on an overdue invoice
- field note requiring project follow-through
- service/warranty note attached to the original project or service ticket

Internal communication should support accountability and continuity without becoming a second task model or hidden workflow state.

## Customer Communication

Customer communication should preserve trust and context.

Future contractor-to-customer communication should connect to:

- estimate review and questions
- contract send, signature, countersign, or decline context
- change-order review
- schedule confirmations
- daily job updates where appropriate
- invoice delivery and payment requests
- service, warranty, or closeout follow-up

Customer-facing communication should be governed by consent, eligibility, activation posture, and human approval where commitments, money, legal state, schedule, permissions, or compliance are involved.

## Portal Communication

The portal is a customer-facing surface over shared records, not a separate customer system.

Portal communication should:

- respect contact-centered portal access
- remain project-scoped where customer visibility is project-scoped
- attach replies and actions to canonical records
- avoid portal-only copies of messages, approvals, contracts, invoices, or payments
- keep customer-safe language distinct from internal contractor notes

Portal activity should be usable as operational context for the contractor without exposing internal-only notes back to the customer.

## Notification Strategy

Notifications should be prompts around workflow evidence, not a separate source of truth.

Useful future notification categories:

- estimate waiting for follow-up
- contract waiting for signature or countersign
- project ready for scheduling
- job missing crew, equipment, or readiness
- invoice overdue or payment failed
- communication delivery failed
- customer replied or portal action occurred
- service/warranty follow-up is due

Notifications should link to canonical workspaces or approved action surfaces. Dismissing a notification should not silently complete business work unless a separate approved workflow says so.

## Activity And Timeline Continuity

Future activity timelines should summarize canonical events and communications without replacing the source records.

Timeline examples:

- estimate sent, viewed, approved, or declined
- contract sent, signed, declined, or countersigned
- invoice sent, viewed, paid, failed, or voided
- payment requested, initiated, succeeded, or failed
- job scheduled, started, blocked, completed, or rescheduled
- customer reply received
- delivery failed
- daily log finalized
- closeout evidence uploaded

Timelines should make the project memory readable. They should not become a separate event truth that competes with contracts, invoices, payments, jobs, or communication records.

## Future Communication Intelligence

Communication intelligence may later help with:

- summarizing threads
- extracting tasks or workflow blockers
- detecting unanswered questions
- drafting customer replies
- identifying stale follow-up
- classifying customer intent
- routing messages to the right record
- preparing approval-ready action suggestions

This intelligence should come after canonical communication context is reliable. AI summaries and classifications are assistance, not source-of-truth communication records.

## Communication Governance

Communication design must preserve:

- tenant isolation
- portal visibility boundaries
- internal vs customer-facing separation
- consent and notification preferences
- provider adapter boundaries
- delivery-proof caveats
- auditability for important customer-facing sends
- human review for risky commitments

Provider delivery statuses such as queued, sent, delivered, opened, clicked, bounced, blocked, deferred, dropped, or failed are useful telemetry. They are not perfect legal certainty and should not silently mutate business truth without a validated workflow.

## What FloorConnector Avoids

FloorConnector should avoid:

- Slack clone behavior
- standalone CRM inbox behavior
- disconnected messaging modules
- portal-only communication copies
- provider-owned communication truth
- internal notes leaking into customer-facing views
- AI-only communication logs
- module-local reminders that do not link to canonical records
- notification systems that imply work is complete when the workflow record is unchanged

## Relationship To Automation Layer

Communication often triggers automation, and automation often prepares communication.

Examples:

- a stale estimate cue prepares a follow-up draft
- a customer reply creates an internal review suggestion
- a failed invoice delivery prompts a billing owner follow-up
- a signed contract triggers a readiness or scheduling reminder

The Automation Layer should use communication as evidence and proposed action context. It should not send or mutate customer-facing communication without the required workflow approval and governance.

## Relationship To Intelligence Layer

Communication is one of the richest future inputs for operational intelligence, but only if it is attached to canonical records.

Future intelligence may measure:

- response time
- unanswered questions
- delivery health
- communication-driven conversion
- collections follow-up effectiveness
- estimate or contract engagement signals
- customer friction by workflow stage

Those metrics must derive from canonical communication and workflow evidence, not provider dashboards or manual scoring systems.

## Summary

The Communications Layer should make FloorConnector's operational memory more complete. It should connect people, messages, reminders, portal actions, and delivery proof back to the work itself so contractors can see what happened, what is waiting, and what action should happen next.
