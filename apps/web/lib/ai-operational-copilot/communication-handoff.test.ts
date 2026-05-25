import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAiCopilotCommunicationHandoffHref,
  buildAiCopilotCommunicationPayload,
  parseAiCopilotCommunicationHandoffSearchParams
} from "./communication-handoff";
import type { AiCopilotDraftAction } from "./summary";

const draftAction: AiCopilotDraftAction = {
  id: "project-1:customer-follow-up-draft",
  actionType: "customer_follow_up",
  audience: "customer",
  title: "Customer follow-up",
  subject: "Polished floor: project follow-up",
  draftBody: "Hi Jordan, quick project update.",
  operationalReason: "Communication attention is visible.",
  sourceWorkflowSignals: ["Stage: Execution active", "Source: messagecenter"],
  priority: "high",
  reviewSafetyNote: "Review first."
};

void test("builds and parses Copilot draft communication handoff links", () => {
  const href = buildAiCopilotCommunicationHandoffHref({
    action: draftAction,
    projectId: "project-1",
    projectName: "Polished floor",
    customerId: "customer-1",
    customerName: "Jordan",
    threadId: "thread-1"
  });
  const url = new URL(href, "https://floorconnector.test");
  const parsed = parseAiCopilotCommunicationHandoffSearchParams(
    Object.fromEntries(url.searchParams.entries())
  );

  assert.equal(url.pathname, "/communications");
  assert.equal(url.searchParams.get("source"), "project");
  assert.equal(url.searchParams.get("threadId"), "thread-1");
  assert.deepEqual(parsed, {
    draftId: draftAction.id,
    actionType: "customer_follow_up",
    audience: "customer",
    title: draftAction.title,
    subject: draftAction.subject,
    draftBody: draftAction.draftBody,
    operationalReason: draftAction.operationalReason,
    sourceWorkflowSignals: draftAction.sourceWorkflowSignals,
    projectId: "project-1",
    projectName: "Polished floor",
    customerId: "customer-1",
    customerName: "Jordan"
  });
});

void test("ignores incomplete Copilot handoff query strings", () => {
  assert.equal(
    parseAiCopilotCommunicationHandoffSearchParams({
      copilotDraft: "1",
      copilotDraftId: "draft-1"
    }),
    null
  );
});

void test("builds canonical communication message payload metadata", () => {
  const parsed = parseAiCopilotCommunicationHandoffSearchParams({
    copilotDraft: "1",
    copilotDraftId: draftAction.id,
    copilotActionType: draftAction.actionType,
    copilotAudience: draftAction.audience,
    copilotTitle: draftAction.title,
    copilotSubject: draftAction.subject,
    copilotBody: draftAction.draftBody,
    copilotReason: draftAction.operationalReason,
    copilotSignals: draftAction.sourceWorkflowSignals.join("\n"),
    copilotProjectId: "project-1",
    copilotProjectName: "Polished floor"
  });

  assert.ok(parsed);
  assert.deepEqual(buildAiCopilotCommunicationPayload(parsed), {
    source: "ai_operational_copilot",
    draftId: draftAction.id,
    actionType: "customer_follow_up",
    audience: "customer",
    subject: draftAction.subject,
    projectId: "project-1",
    projectName: "Polished floor",
    customerId: null,
    customerName: null,
    operationalReason: draftAction.operationalReason,
    sourceWorkflowSignals: draftAction.sourceWorkflowSignals
  });
});
