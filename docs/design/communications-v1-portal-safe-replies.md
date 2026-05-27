# Communications V1 Portal-Safe Replies

Status: Implemented
Doc Type: Implementation Note

## Purpose

Portal-Safe Replies v1 closes the basic communication loop without creating a
portal inbox or external delivery system. Customers can reply from the portal
Project Workspace only when a contractor has already created a
customer-visible, project-scoped communication thread.

## Source Tables

The slice uses existing canonical tables only:

- `communication_threads`
- `communication_messages`
- `portal_access_grants`
- `portal_project_access`

No schema or migration was added.

## Behavior

The portal Project Workspace now shows a Project Communication section. It
loads only customer-visible messages from eligible project/customer threads and
shows a small reply form for active conversations.

Submitting a reply writes one canonical `communication_messages` row:

- `sender_type = portal_user`
- `visibility = customer_visible`
- `direction = inbound`
- `channel_kind = portal`
- `message_kind = customer_message`
- `delivery_status = logged`

The canonical thread summary is updated, so contractor `/communications` and
Project MessageCenter pick up the reply through existing read models.

## Access Boundary

Portal replies require:

- authenticated portal user
- active portal access grant for the customer
- active project visibility through `portal_project_access`
- thread customer/project match
- non-opportunity, non-appointment thread
- existing customer-visible communication history

Portal users cannot set privileged message fields such as visibility,
direction, channel, kind, or delivery status.

## Non-Goals

- no portal-only message copies
- no generic portal inbox
- no email or SMS send
- no provider sync, webhook, or delivery proof event
- no notification event creation
- no internal note visibility
- no automation/reminder engine
- no customer-visible FieldTrail, Proof Center, Daily Log, Job Note, or provider
  metadata exposure

## Future Work

- provider-backed customer messaging after explicit delivery policy
- notification handling for customer replies
- portal unread/read state
- broader customer conversation list if product scope calls for it
- response-time metrics and communication reporting
- review-first AI drafting over canonical threads
