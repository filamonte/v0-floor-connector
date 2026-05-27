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

Portal customers can now:

- view customer-visible project conversations on the portal Project Workspace
- reply only to existing customer-visible, project-scoped threads
- save one canonical portal-originated `communication_messages` row per reply

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

The portal reply path is intentionally narrow. It uses the existing
database/RLS model plus server-side validation to require:

- authenticated portal user
- active portal access grant for the thread customer
- active project visibility for the thread project
- non-opportunity, non-appointment project/customer thread
- existing customer-visible messages before a reply form appears
- non-empty bounded body text

Portal users cannot choose visibility, direction, channel, message kind, or
delivery status. Server policy maps their replies to customer-visible inbound
portal messages with logged delivery status. The action suppresses provider
sends, notification events, document-delivery events, and portal-only copies.

## Non-Goals

- no provider-backed email or SMS send
- no provider sync or callbacks
- no delivery proof or notification delivery rows
- no portal-only message copies
- no duplicate thread/message tables
- no automation or reminders
- no AI-generated message sending
- no internal-note exposure in portal
- no generic portal inbox

## Future Work

- portal-safe reply UI after customer-facing message history rules are designed
- provider-backed email/SMS send through notification adapters
- delivery receipts and retry lifecycle
- richer thread status controls
- communication response-time metrics
- AI drafting as review-first composer assistance only
