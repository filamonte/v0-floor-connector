# GateKeeper Source Adapters

Status: Partially Implemented
Doc Type: Architecture

## Purpose

GateKeeper source adapters define how future communication, voice, AI, transcription, chat, email, SMS, portal, and support/onboarding sources may enter FloorConnector without becoming separate systems of record.

The adapter boundary exists because GateKeeper must extend the canonical FloorConnector workflow, not create provider-shaped side systems. Providers may capture events, recordings, transcripts, messages, summaries, or assistant output, but FloorConnector remains responsible for canonical communication history, operational memory, review state, and workflow truth.

Adapters should feed the existing spine:

- `communication_threads`
- `communication_messages`
- `gatekeeper_artifacts`
- `gatekeeper_action_suggestions`

Adapters must not own leads, customers, projects, jobs, schedules, invoices, tasks, contracts, or workflow state.

## Supported Future Source Families

GateKeeper should eventually normalize these source families:

- manual simulation
- inbound phone call
- outbound phone call
- voicemail
- call recording
- transcription
- web chat
- SMS
- email
- portal message
- internal note
- AI voice agent session
- FloorConnector onboarding/support assistant session

These names are source families, not vendor names. A Twilio call, Telnyx call, Retell session, Vapi session, OpenAI transcript, website chat event, Postmark email event, or portal message should all normalize into provider-neutral shapes before touching GateKeeper memory.

## Provider-Neutral Ingestion Contract

Future adapters should normalize provider events into a payload with this conceptual shape:

```ts
type GateKeeperNormalizedSourceEvent = {
  organizationId: string;
  sourceFamily: string;
  sourceChannel: string;
  direction: "inbound" | "outbound" | "internal" | "system" | "bidirectional";
  participantHints?: {
    displayName?: string | null;
    phone?: string | null;
    email?: string | null;
    externalParticipantId?: string | null;
  };
  subjectType?: string | null;
  subjectId?: string | null;
  rawText?: string | null;
  summaryText?: string | null;
  transcriptText?: string | null;
  recordingReference?: string | null;
  occurredAt: string;
  providerMetadata?: Record<string, unknown>;
  idempotencyKey: string;
  confidence?: number | null;
  suggestedArtifacts?: Array<{
    artifactType: string;
    contentText?: string | null;
    content?: Record<string, unknown>;
    confidence?: number | null;
  }>;
  suggestedActions?: Array<{
    suggestionType: string;
    title: string;
    rationale?: string | null;
    proposedPayload?: Record<string, unknown>;
  }>;
};
```

The TypeScript contract lives in `apps/web/lib/gatekeeper/source-adapters.ts`. The first concrete implementation is the manual simulation adapter in `apps/web/lib/gatekeeper/manual-source-adapter.ts`.

The manual adapter is provider-free and deterministic. It normalizes human-entered call/chat/voicemail/internal-note summaries into the same source-event shape before the existing manual seed path creates optional provider-neutral communication evidence, GateKeeper artifacts, and GateKeeper action suggestions for review. It does not call providers, call AI, create webhooks, send messages, mutate canonical business records, or execute suggestions.

## Mapping Rules

### Communication Threads

Adapters may create or reuse a `communication_threads` record only when the event has enough canonical subject context to attach safely.

Allowed direction:

- use existing subject links when available
- attach to opportunity, customer, project, estimate, contract, invoice, change order, payment, appointment, job, person, or vendor only when the current schema and helper path safely support that subject
- keep provider identifiers in metadata or future idempotency records, not in provider-specific thread columns

Disallowed direction:

- do not invent a customer, opportunity, project, job, appointment, or schedule just to create a thread
- do not create a provider-owned conversation model
- do not create a separate voice/chat inbox outside canonical communications

### Communication Messages

Adapters may create `communication_messages` only as provider-neutral communication evidence.

Mapping guidance:

- source family maps to provider-neutral `channel_kind`
- direction maps to provider-neutral `direction`
- source system maps to provider-neutral `source_kind`
- raw or summarized text maps to message body where safe
- provider event details stay in metadata/payload
- customer-visible communication must stay explicitly controlled by visibility rules

Adapter-created messages should not imply that a reply was sent, a customer was contacted, or a workflow state changed unless a separate deterministic send/execution path actually did that work.

### GateKeeper Artifacts

Adapters may propose `gatekeeper_artifacts` such as:

- `call_summary`
- `transcript_placeholder`
- `extracted_requirement`
- `extracted_commitment`
- `risk_signal`
- `workflow_observation`
- `onboarding_note`

Artifacts are memory proposals and review evidence. They do not mutate canonical records.

### GateKeeper Action Suggestions

Adapters may propose `gatekeeper_action_suggestions` such as:

- `create_opportunity`
- `update_opportunity`
- `schedule_site_assessment`
- `create_task_later`
- `send_followup_later`
- `update_project_notes`
- `flag_estimate_review`
- `flag_invoice_review`
- `flag_contract_review`

Suggestions are review items only. Approval means the suggestion was reviewed, not executed.

## Idempotency And Replay

Future provider ingestion must be idempotent.

Rules:

- provider event IDs should normalize into stable idempotency keys
- idempotency keys should include source family and provider/environment context
- replayed webhook/event delivery must not duplicate communication messages, artifacts, or suggestions
- deterministic normalization should run before persistence
- provider retries should be safe even when a previous attempt partially completed
- idempotency state should be tenant-scoped

Future implementation may need an idempotency ledger if provider replays cannot be safely resolved from existing communication/message/artifact records. That ledger should be provider-neutral and should not become a duplicate provider event store.

## Human Governance

Adapters may identify, extract, summarize, and propose.

Adapters must not execute.

The review queue remains the first human-governed layer:

- artifacts can be accepted, rejected, or dismissed
- suggestions can be approved for review, rejected, dismissed, or superseded
- approved suggestions do not create canonical records
- execution requires a separate future explicit capability
- risky customer-facing, financial, legal, scheduling, permission, compliance, or contract actions require human approval and deterministic server actions

## Provider Metadata Rules

Provider metadata belongs in structured metadata/payload fields unless a future repeated cross-provider query need justifies a normalized column.

Rules:

- normalize common concepts first: source family, channel, direction, occurrence time, idempotency key, participant hints, subject link, text, transcript, recording reference, confidence
- keep vendor-specific payloads bounded and sanitized
- do not store secrets, tokens, raw credentials, or unsafe provider dumps
- do not add Twilio/Telnyx/Retell/Vapi/OpenAI/Postmark-specific columns to the core communication or GateKeeper tables without a later architectural reason
- avoid provider lock-in by keeping adapters behind internal contracts

## Security And Privacy Boundaries

Future source adapters must account for:

- call recording consent
- customer data minimization
- transcript access controls
- tenant isolation and same-company checks
- portal visibility restrictions
- explicit internal versus customer-visible message state
- retention controls for recordings and transcripts
- auditability for ingestion, review, and later execution
- least-privilege provider keys
- provider webhook signature verification before ingestion
- safe error handling that does not expose raw provider payloads or secrets

Recordings and transcripts are sensitive operational data. Adapter implementations should store references and summaries conservatively and should not expose raw content to the portal unless a future customer-visible policy explicitly allows it.

## Future Adapter Types

Planned adapter families:

- manual simulation adapter: implemented as the first provider-neutral pattern
- Twilio/Telnyx telephony adapter
- Retell/Vapi voice-agent adapter
- OpenAI transcription/summarization adapter
- website chat adapter
- email adapter
- portal-message adapter
- internal-note adapter
- FloorConnector support/onboarding assistant adapter

Except for the manual simulation adapter, these are future adapters only. This document does not authorize SDK installation, credentials, network calls, webhook routes, provider calls, transcription, AI runtime behavior, or message sending.

## Anti-Drift Rules

GateKeeper source adapters must never create:

- provider-owned lead records
- provider-owned scheduling records
- duplicate customer/contact models
- duplicate CRM activity tables
- provider-specific communication silos
- AI-owned canonical truth
- direct execution from provider webhooks
- autonomous dispatch from source events
- portal-only communication copies

Provider systems are adapters, telemetry sources, and capture surfaces. FloorConnector remains the operating system.

## Implementation Sequencing

Recommended future slices:

1. Source adapter contract/types: implemented as provider-neutral planning interfaces
2. Manual source adapter formalization: implemented as the first deterministic, provider-free adapter
3. Idempotent ingestion utility
4. Internal note adapter
5. Subject timeline surface for customer/project continuity
6. Website chat capture
7. Voicemail/transcript placeholder adapter
8. Telephony provider adapter
9. Voice AI adapter
10. Controlled execution bridge

The controlled execution bridge should come last. GateKeeper should keep proving capture, memory, review, idempotency, privacy, and human governance before it gains tools that mutate canonical workflow records or contact customers.
