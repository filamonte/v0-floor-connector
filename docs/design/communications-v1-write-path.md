# Communications V1 Write Path

Status: Implemented
Doc Type: Implementation Note

## Purpose

Communications v1 write path adds a controlled contractor-side way to save
record-linked messages without turning Communications into a generic inbox,
email/SMS product, or portal chat system.

## Source Tables

The slice uses existing canonical tables only:

- `communication_threads`
- `communication_messages`
- `notifications` for contractor unread triage

No schema or migration was added.

## Implemented Behavior

Contractor users can now:

- reply on an existing selected thread in `/communications`
- choose `internal` or `customer_visible` visibility for non-Copilot replies
- create or reuse a project-scoped thread from Project Workspace MessageCenter
- create or reuse a customer-scoped thread from Customer Workspace
- save one canonical `communication_messages` row per submitted message

The write policy lives in
[apps/web/lib/communications/write-policy.ts](C:/FloorConnector/apps/web/lib/communications/write-policy.ts).
It maps contractor internal notes to `direction = internal`,
`channel_kind = internal_note`, and `visibility = internal`. It maps contractor
customer-visible messages to `direction = outbound`, `channel_kind = portal`,
and `visibility = customer_visible`.

## Boundary

Customer-visible means stored FloorConnector communication history. It does not
mean email, SMS, provider delivery, legal acceptance, or delivery proof.

Internal notes remain contractor-only and must not be exposed through portal
loaders.

## Portal Reply Boundary

The existing database/RLS model supports portal users inserting
customer-visible project-scoped messages on eligible non-opportunity,
non-appointment threads, but this slice does not add a portal reply UI. Portal
chat expansion remains future work so the customer-facing experience can be
designed around explicit project access, customer-safe copy, unread handling,
and notification expectations.

## Non-Goals

- no provider-backed email or SMS send
- no provider sync or callbacks
- no delivery proof or notification delivery rows
- no portal-only message copies
- no duplicate thread/message tables
- no automation or reminders
- no AI-generated message sending
- no internal-note exposure in portal

## Future Work

- portal-safe reply UI after customer-facing message history rules are designed
- provider-backed email/SMS send through notification adapters
- delivery receipts and retry lifecycle
- richer thread status controls
- communication response-time metrics
- AI drafting as review-first composer assistance only
