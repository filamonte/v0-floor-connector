import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAppointmentCueWorkItemPrefill,
  buildOpportunityFollowUpWorkItemPrefill
} from "./prefill";
import { workItemCreateSchema } from "./schemas";

const opportunityId = "11111111-1111-4111-8111-111111111111";
const appointmentId = "22222222-2222-4222-8222-222222222222";

void test("opportunity follow-up cue prefill creates a source-locked work item draft", () => {
  const prefill = buildOpportunityFollowUpWorkItemPrefill({
    opportunityId,
    title: "Garage flake floor",
    status: "contacted",
    contactName: "Taylor Customer",
    companyName: "Taylor Homes",
    customerName: null,
    nextFollowUpAt: "2026-05-06T14:00:00.000Z",
    nextFollowUpNote: "Call after customer reviews photos.",
    lastCommunicationAt: "2026-05-05T13:00:00.000Z",
    nowIso: "2026-05-07T12:00:00.000Z"
  });

  assert.equal(prefill.kind, "lead_follow_up");
  assert.equal(prefill.priority, "high");
  assert.equal(prefill.dueAt, "2026-05-06T14:00:00.000Z");
  assert.equal(
    prefill.dedupeKey,
    "opportunity:11111111-1111-4111-8111-111111111111:lead_follow_up:2026-05-06"
  );
  assert.match(prefill.title, /Garage flake floor/);
  assert.match(prefill.description ?? "", /Call after customer reviews photos/);

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: "",
    sourceType: "opportunity",
    sourceId: opportunityId,
    customerId: "",
    projectId: "",
    linkPath: `/leads/${opportunityId}`,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("appointment cue prefill creates confirmation prep for scheduled appointments", () => {
  const prefill = buildAppointmentCueWorkItemPrefill({
    appointmentId,
    title: "Site assessment",
    appointmentType: "site_visit",
    status: "scheduled",
    startsAt: "2026-05-08T15:00:00.000Z",
    customerName: "Taylor Customer",
    opportunityTitle: "Garage flake floor",
    assignedPersonId: "33333333-3333-4333-8333-333333333333",
    cue: "confirmation_prep"
  });

  assert.equal(prefill.kind, "appointment_confirmation_prep");
  assert.equal(prefill.priority, "normal");
  assert.equal(prefill.assignedPersonId, "33333333-3333-4333-8333-333333333333");
  assert.equal(prefill.dueAt, "2026-05-08T15:00:00.000Z");
  assert.match(prefill.title, /Confirm appointment/);

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: prefill.assignedPersonId,
    sourceType: "appointment",
    sourceId: appointmentId,
    customerId: "",
    projectId: "",
    linkPath: `/appointments/${appointmentId}`,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("appointment cue prefill creates high-priority follow-up for no-show appointments", () => {
  const prefill = buildAppointmentCueWorkItemPrefill({
    appointmentId,
    title: "Estimate meeting",
    appointmentType: "estimate_appointment",
    status: "no_show",
    startsAt: "2026-05-07T15:00:00.000Z",
    cue: "appointment_follow_up"
  });

  assert.equal(prefill.kind, "appointment_follow_up");
  assert.equal(prefill.priority, "high");
  assert.equal(
    prefill.dedupeKey,
    "appointment:22222222-2222-4222-8222-222222222222:appointment_follow_up:no_show:2026-05-07"
  );
  assert.match(prefill.description ?? "", /Status: no show/);
});
