import assert from "node:assert/strict";
import test from "node:test";

import type { FieldAssignedWorkJob } from "./assigned-work-read-model";
import { buildFieldCloseoutReadinessSummary } from "./closeout-readiness";

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

void test("closeout readiness blocks unresolved field blockers before billing awareness", () => {
  const summary = buildFieldCloseoutReadinessSummary({
    ...baseJob,
    openFieldBlockerCount: 1,
    latestOpenFieldBlocker: {
      id: "field-note-blocker",
      dailyLogId: "daily-active",
      title: "Material shortage stopped coating",
      noteType: "blocker"
    }
  });

  assert.equal(summary.status, "blocked");
  assert.equal(summary.billingReadinessLabel, "Not ready to bill");
  assert.equal(summary.primaryActionHref, "/daily-logs/daily-active#job-notes");
  assert.ok(
    summary.signals.some(
      (signal) => signal.key === "field_blockers" && signal.status === "blocked"
    )
  );
});

void test("closeout readiness names missing canonical field evidence", () => {
  const summary = buildFieldCloseoutReadinessSummary({
    ...baseJob,
    latestDailyLog: null,
    dailyLogCount: 0,
    fieldNoteCount: 0,
    executionAttachmentCount: 0,
    latestExecutionAttachment: null
  });

  assert.equal(summary.status, "needs_evidence");
  assert.equal(summary.officeHandoffLabel, "Needs field capture");
  assert.equal(summary.primaryActionLabel, "Start Daily Log");
  assert.deepEqual(
    summary.signals
      .filter((signal) => signal.status === "missing")
      .map((signal) => signal.key),
    ["daily_log", "field_notes", "execution_evidence", "completion_handoff"]
  );
});

void test("closeout readiness stays advisory while execution remains active", () => {
  const summary = buildFieldCloseoutReadinessSummary(baseJob);

  assert.equal(summary.status, "in_progress");
  assert.equal(summary.billingReadinessLabel, "Wait for completion");
  assert.equal(summary.primaryActionHref, `/jobs/${baseJob.id}`);
});

void test("closeout readiness allows office review after completion and proof", () => {
  const summary = buildFieldCloseoutReadinessSummary({
    ...baseJob,
    dispatchStatus: "completed"
  });

  assert.equal(summary.status, "ready_for_review");
  assert.equal(summary.officeHandoffLabel, "Ready for office review");
  assert.equal(summary.billingReadinessLabel, "Review before billing");
  assert.equal(summary.primaryActionHref, `/projects/${baseJob.project.id}`);
});
