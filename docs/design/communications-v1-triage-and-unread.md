# Communications V1 Triage And Unread

Status: Implemented
Doc Type: Implementation Note

## Purpose

Communication Reply Triage v1 makes portal customer replies visible as
contractor work without building a notification automation system, provider send
pipeline, or generic inbox.

## Source Tables

The slice uses existing canonical tables only:

- `communication_threads`
- `communication_messages`
- existing `notifications` for stored per-user notification read state

No schema or migration was added.

## Behavior

The shared helper lives in
`apps/web/lib/communications/reply-triage.ts`.

It derives needs-response state when:

- a customer-visible portal reply is inbound from a portal user
- the reply is later than any contractor customer-visible response on the same
  thread
- or the thread status already indicates `waiting_on_contractor` and message
  history is unavailable in the current read window

A contractor customer-visible response clears the derived needs-response state.
Internal notes do not clear it.

`/communications` now uses this state for the Needs response lane, follow-up
intelligence, and thread badges. Project MessageCenter highlights the latest
portal customer reply needing follow-up and routes back to the canonical thread
inside `/communications`.

## Boundaries

- Existing notification buttons still mark stored `notifications` rows read.
- Derived reply triage does not mutate message bodies or history.
- No notification events are created for portal replies in this slice.
- No email, SMS, provider delivery, reminder, task, or automation is created.
- Portal users do not see contractor triage state.
- Internal notes remain contractor-only.

## Future Work

- persisted reviewed/handled state for threads or messages after a narrow
  schema design
- notification center integration for portal replies
- provider-backed alerts after explicit delivery policy
- response-time metrics and reporting
- assignment and reminders
- review-first AI drafting over unanswered customer replies
