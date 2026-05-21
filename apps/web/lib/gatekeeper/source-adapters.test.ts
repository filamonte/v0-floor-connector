import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildGateKeeperAdapterResult,
  gateKeeperSourceChannels,
  gateKeeperSourceFamilies,
  type GateKeeperNormalizedSourceEvent
} from "./source-adapters";

const sourceAdapters = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/source-adapters.ts"),
  "utf8"
);
const manualSourceAdapter = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/manual-source-adapter.ts"),
  "utf8"
);

void test("GateKeeper source families stay provider-neutral", () => {
  assert.deepEqual(
    [...gateKeeperSourceFamilies],
    [
      "manual_simulation",
      "inbound_phone_call",
      "outbound_phone_call",
      "voicemail",
      "call_recording",
      "transcription",
      "web_chat",
      "sms",
      "email",
      "portal_message",
      "internal_note",
      "ai_voice_agent_session",
      "support_assistant_session"
    ]
  );
  assert.doesNotMatch(
    gateKeeperSourceFamilies.join(" "),
    /twilio|telnyx|retell|vapi|openai|postmark|sendgrid/i
  );
});

void test("GateKeeper source channels remain normalized and not vendor-required", () => {
  assert.ok(gateKeeperSourceChannels.includes("phone"));
  assert.ok(gateKeeperSourceChannels.includes("web_chat"));
  assert.ok(gateKeeperSourceChannels.includes("voice_agent"));
  assert.doesNotMatch(
    gateKeeperSourceChannels.join(" "),
    /twilio|telnyx|retell|vapi|openai|postmark|sendgrid/i
  );
});

void test("GateKeeper adapter result is artifacts and suggestions only", () => {
  const event: GateKeeperNormalizedSourceEvent = {
    organizationId: "company-1",
    sourceFamily: "voicemail",
    sourceChannel: "phone",
    direction: "inbound",
    rawText: "Caller asked for a callback.",
    occurredAt: "2026-05-19T20:00:00.000Z",
    providerMetadata: {
      providerEventId: "demo-provider-event"
    },
    idempotencyKey: "voicemail:demo-provider-event",
    suggestedArtifacts: [
      {
        artifactType: "call_summary",
        contentText: "Caller asked for a callback."
      }
    ],
    suggestedActions: [
      {
        suggestionType: "send_followup_later",
        title: "Review voicemail callback",
        proposedPayload: {
          reviewOnly: true
        }
      }
    ]
  };
  const result = buildGateKeeperAdapterResult(event);

  assert.equal(result.communicationThreadHint.shouldCreateOrReuse, false);
  assert.equal(result.artifacts.length, 1);
  assert.equal(result.suggestions.length, 1);
  assert.equal(result.execution.allowed, false);
});

void test("GateKeeper source adapter types do not import provider SDKs or mutate records", () => {
  assert.doesNotMatch(
    sourceAdapters,
    /from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark/i
  );
  assert.doesNotMatch(
    sourceAdapters,
    /createGateKeeperArtifact|createGateKeeperActionSuggestion|createOpportunity|createProject|createWorkItem|sendEmail|sendSms|fetch\(/i
  );
  assert.doesNotMatch(
    manualSourceAdapter,
    /from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(|createOpportunity|createProject|createWorkItem|sendEmail|sendSms/i
  );
});
