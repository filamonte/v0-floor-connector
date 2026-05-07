# Communications And AI Intake

Status: target direction and planning guardrail only.

This document describes future unified communications, intake, website chat, AI receptionist, and human handoff direction. It does not describe implemented product behavior unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says that behavior exists.

Use this with:

- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md)
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md)

## Principle

FloorConnector should own the canonical communication history for contractor work. Email, SMS, web chat, portal messages, app messages, calls, voicemail, and AI voice are channels or provider integrations. They are not separate sources of truth.

Communications should attach to canonical records where appropriate:

- opportunity
- customer
- project
- estimate
- contract
- change order
- job
- invoice
- payment

The contractor app and portal remain two surfaces on the same canonical records.

## Never Miss A Lead

Long-term intake direction should help contractors avoid losing inbound work across channels.

Target channels:

- website forms
- website AI chat
- SMS
- email
- phone calls
- voicemail
- missed-call text-back
- AI receptionist / voice intake
- human-assisted intake
- contractor manual entry

Intake should resolve into canonical opportunity/customer/project workflows. AI may classify, summarize, and prepare records, but confirmed business truth should live on the shared record chain.

## Website Forms

Target direction:

- website forms collect contact, service, location, timing, notes, and consent context
- submissions create or prepare canonical opportunity intake through approved server-side workflows
- duplicate detection may suggest linking to an existing customer or opportunity

Website forms should not create a separate public-lead model that competes with `opportunities`.

## Website AI Chat

Target direction:

- AI chat can answer fit, service, pricing-range, scheduling, and next-step questions using approved public product knowledge
- AI chat can qualify inquiries and prepare a canonical opportunity draft
- AI chat should collect consent before follow-up messaging where required
- human handoff should be available when the user asks, the conversation is sensitive, or confidence is low

AI chat must not promise pricing, dates, contract terms, financing, or availability that the canonical workflow has not approved.

## SMS And Email

Target direction:

- inbound SMS and email can create or update canonical communication messages
- outbound SMS and email should be sent from approved FloorConnector workflows and recorded back into canonical communication history
- AI can draft replies, summarize threads, classify urgency, and suggest follow-up timing

External email/SMS providers are adapters and delivery channels. Provider payloads and delivery events are telemetry, not business truth.

## Calls, Voicemail, And Missed-Call Text-Back

Target direction:

- calls can be manually logged or provider-captured as canonical communication context
- voicemail summaries can prepare follow-up tasks or opportunity drafts
- missed-call text-back can create a channel response and attach the communication to the appropriate opportunity/customer/project where known

Human confirmation should be required before AI-created call summaries become customer-facing commitments or operational instructions.

## AI Receptionist / Voice

Target direction:

- AI receptionist can answer common questions, collect intake details, identify urgency, summarize calls, and prepare next steps
- it can route callers to a human for urgent, high-value, angry, legally sensitive, payment-related, or unclear situations
- it can prepare callbacks, appointment suggestions, and lead summaries for contractor approval

AI receptionist must not:

- commit to job dates or crew availability without the scheduling workflow
- quote final pricing or discounts
- create contracts, invoices, or payment requests
- bypass consent, recording notice, or opt-out requirements

## Human Handoff

Human escalation should be a first-class planning requirement.

Escalation triggers should include:

- user asks for a human
- low confidence
- pricing, contract, billing, legal, compliance, safety, or payment questions
- customer complaint or cancellation intent
- scheduling conflict or urgent field issue
- uncertain identity or permission boundary

Handoff should include the conversation transcript or summary, current canonical record links, proposed next step, and unresolved questions.

## Customer Communication History

Implemented foundation:

- canonical `communication_threads` can now attach to opportunities as well as downstream customer/project/subject records
- canonical `communication_messages` now have explicit message kind, visibility, and logging/delivery status fields
- manual opportunity communication can be stored before customer/project conversion without creating `lead_activities` or AI-only communication records
- internal visibility remains the safe default for manual lead communication; customer-visible content must be explicitly marked
- portal display of opportunity communication is not implemented yet, and internal messages must remain hidden from customer/portal loaders

Target direction:

- communication threads and messages are the canonical business communication record
- messages can be internal, customer-visible, or both depending on permissions and visibility
- messages should link to the relevant canonical subject record
- provider events can enrich messages with sent, delivered, opened, clicked, bounced, blocked, dropped, or failed status where available

Communication history should not be scattered across module-specific logs.

## Consent, Opt-Out, Quiet Hours, And Recording

Planning considerations before implementation:

- SMS opt-in and opt-out handling
- email unsubscribe or transactional/commercial classification
- quiet hours by recipient location and company policy
- call recording notice and consent
- voicemail transcription retention
- provider payload retention and PII minimization
- customer-contact permissions and portal visibility
- human escalation for sensitive conversations

These controls should be implemented before broad customer-facing AI or provider-backed messaging is enabled.

## What Is Not Implemented

Unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says otherwise, the following remain target direction:

- website AI chat
- AI receptionist / voice
- missed-call text-back
- full provider-backed SMS/email communication sync
- full consent and opt-out automation
- AI customer follow-up automation
- unified inbox across every channel

Existing communication and notification foundations should be treated as the base to extend, not as the full target.
