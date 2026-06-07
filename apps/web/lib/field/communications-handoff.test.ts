import assert from "node:assert/strict";
import test from "node:test";

import type { FieldAssignedWorkJob } from "./assigned-work-read-model";
import { buildFieldCloseoutReadinessSummary } from "./closeout-readiness";
import { buildFieldCommunicationsHandoff } from "./communications-handoff";

const readyReadiness = {
  status: "ready_to_schedule",
  blockers: [],
  isReadyToSchedule: true,
  isOperationallyActive: true,
  depositRequired: false,
  depositSatisfied: true,
  financingStatus: "not_applicable",
  opportunityId: "55555555-5555-4555-8555-555555555555",
  siteAssessmentStatus: "completed",
  estimateId: "66666666-6666-4666-8666-666666666666",
  estimateStatus: "approved",
  contractId: "77777777-7777-4777-8777-777777777777",
  contractStatus: "signed",
  contractInternalApprovalStatus: "approved",
  contractSignedAt: "2026-05-27T15:00:00.000Z",
  depositInvoiceId: null,
  depositInvoiceStatus: null
} satisfies NonNullable<FieldAssignedWorkJob["readiness"]>;

const baseJob = {
  id: "11111111-1111-4111-8111-111111111111",
  dispatchStatus: "in_progress",
  scheduledDate: "2026-05-28",
  scheduledStartAt: "2026-05-28T14:00:00.000Z",
  scheduledEndAt: null,
  scheduleNotes: null,
  updatedAt: "2026-05-28T10:00:00.000Z",
  customer: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Avery Home",
    companyName: null
  },
  project: {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Garage coating"
  },
  assignments: [],
  dailyLogCount: 1,
  latestDailyLog: {
    id: "daily-active",
    logDate: "2026-05-28",
    status: "draft"
  },
  fieldNoteCount: 1,
  openFieldBlockerCount: 0,
  latestOpenFieldBlocker: null,
  executionAttachmentCount: 1,
  latestExecutionAttachment: {
    id: "attachment-latest",
    subjectType: "daily_log",
    subjectId: "daily-active",
    fileName: "after-photo.jpg",
    caption: "After photo"
  },
  timeCardCount: 0,
  openTimeCardCount: 0,
  readiness: readyReadiness
} satisfies FieldAssignedWorkJob;

function getParam(href: string, name: string) {
  return new URL(href, "https://floorconnector.test").searchParams.get(name);
}

void test("field communications handoff routes blockers to internal Communications review", () => {
  const job = {
    ...baseJob,
    openFieldBlockerCount: 1,
    latestOpenFieldBlocker: {
      id: "field-note-blocker",
      dailyLogId: "daily-active",
      title: "Moisture readings need office review",
      noteType: "blocker"
    }
  } satisfies FieldAssignedWorkJob;
  const handoff = buildFieldCommunicationsHandoff({
    job,
    closeoutReadiness: buildFieldCloseoutReadinessSummary(job)
  });

  assert.equal(handoff.status, "needs_office_review");
  assert.equal(handoff.audienceLabel, "Internal review");
  assert.equal(getParam(handoff.handoffHref, "copilotAudience"), "internal");
  assert.equal(
    getParam(handoff.handoffHref, "copilotActionType"),
    "blocker_escalation_summary"
  );
  assert.match(
    getParam(handoff.handoffHref, "copilotBody") ?? "",
    /Moisture readings/
  );
});

void test("field communications handoff prepares closeout update only after proof is ready", () => {
  const job = {
    ...baseJob,
    dispatchStatus: "completed"
  } satisfies FieldAssignedWorkJob;
  const handoff = buildFieldCommunicationsHandoff({
    job,
    closeoutReadiness: buildFieldCloseoutReadinessSummary(job)
  });

  assert.equal(handoff.status, "ready_to_update");
  assert.equal(handoff.handoffActionLabel, "Prepare update");
  assert.equal(
    getParam(handoff.handoffHref, "copilotActionType"),
    "internal_pm_project_summary"
  );
  assert.match(
    getParam(handoff.handoffHref, "copilotSignals") ?? "",
    /Evidence files: 1/
  );
});

void test("field communications handoff monitors incomplete field capture without customer send", () => {
  const job = {
    ...baseJob,
    latestDailyLog: null,
    dailyLogCount: 0,
    fieldNoteCount: 0,
    executionAttachmentCount: 0,
    latestExecutionAttachment: null
  } satisfies FieldAssignedWorkJob;
  const handoff = buildFieldCommunicationsHandoff({
    job,
    closeoutReadiness: buildFieldCloseoutReadinessSummary(job)
  });

  assert.equal(handoff.status, "monitor");
  assert.equal(handoff.handoffActionLabel, "Review in Communications");
  assert.equal(getParam(handoff.handoffHref, "copilotAudience"), "internal");
  assert.equal(
    getParam(handoff.handoffHref, "copilotActionType"),
    "field_progress_update"
  );
});
