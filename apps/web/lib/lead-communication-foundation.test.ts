import assert from "node:assert/strict";
import test from "node:test";

import {
  appointmentInputSchema,
  appointmentQuickCreateInputSchema
} from "./appointments/schemas";
import { opportunityManualCommunicationInputSchema } from "./communications/schemas";
import { opportunityFollowUpInputSchema } from "./opportunities/schemas";

const opportunityId = "11111111-1111-4111-8111-111111111111";

void test("manual opportunity communication defaults stay explicit and validated", () => {
  const result = opportunityManualCommunicationInputSchema.safeParse({
    opportunityId,
    messageKind: "manual_call",
    visibility: "internal",
    body: "Called the homeowner and left a voicemail."
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.messageKind, "manual_call");
    assert.equal(result.data.visibility, "internal");
    assert.equal(result.data.body, "Called the homeowner and left a voicemail.");
  }
});

void test("manual opportunity communication rejects empty bodies and invalid visibility", () => {
  const result = opportunityManualCommunicationInputSchema.safeParse({
    opportunityId,
    messageKind: "manual_call",
    visibility: "public",
    body: "   "
  });

  assert.equal(result.success, false);
});

void test("opportunity follow-up schema accepts set and clear operations", () => {
  const setResult = opportunityFollowUpInputSchema.safeParse({
    opportunityId,
    nextFollowUpAt: "2026-05-08T09:30",
    nextFollowUpNote: "Call back after photos arrive."
  });
  const clearResult = opportunityFollowUpInputSchema.safeParse({
    opportunityId,
    nextFollowUpAt: "",
    nextFollowUpNote: ""
  });

  assert.equal(setResult.success, true);
  assert.equal(clearResult.success, true);

  if (setResult.success && clearResult.success) {
    assert.equal(setResult.data.nextFollowUpNote, "Call back after photos arrive.");
    assert.equal(clearResult.data.nextFollowUpAt, null);
    assert.equal(clearResult.data.nextFollowUpNote, null);
  }
});

void test("appointment schemas preserve explicit customer visibility and note separation", () => {
  const fullResult = appointmentInputSchema.safeParse({
    opportunityId,
    customerId: "",
    projectId: "",
    assignedPersonId: "",
    title: "Site visit",
    appointmentType: "site_visit",
    startsAt: "2026-05-08T10:00",
    endsAt: "",
    location: "Customer site",
    notes: "Gate code is internal.",
    customerVisible: "on",
    customerNotes: "Meet at the front entrance.",
    internalNotes: "Bring moisture meter.",
    status: "scheduled"
  });
  const quickResult = appointmentQuickCreateInputSchema.safeParse({
    opportunityId,
    customerId: "",
    projectId: "",
    assignedPersonId: "",
    title: "Callback",
    appointmentType: "follow_up",
    startsAt: "2026-05-08T11:00",
    customerVisible: "",
    customerNotes: "",
    internalNotes: "Internal callback prep."
  });

  assert.equal(fullResult.success, true);
  assert.equal(quickResult.success, true);

  if (fullResult.success && quickResult.success) {
    assert.equal(fullResult.data.customerVisible, true);
    assert.equal(fullResult.data.customerNotes, "Meet at the front entrance.");
    assert.equal(fullResult.data.internalNotes, "Bring moisture meter.");
    assert.equal(quickResult.data.customerVisible, false);
    assert.equal(quickResult.data.internalNotes, "Internal callback prep.");
  }
});
