import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScheduleFieldHandoffPacket,
  buildScheduleFieldHandoffSummaries
} from "./field-handoff-read-model";

const baseJob = {
  id: "11111111-1111-4111-8111-111111111111",
  projectId: "22222222-2222-4222-8222-222222222222",
  scheduledDate: "2026-05-28",
  dispatchStatus: "scheduled",
  assignmentCount: 1
};

void test("schedule field handoff marks crew and scheduled-day Daily Log continuity", () => {
  const handoffs = buildScheduleFieldHandoffSummaries({
    todayDateKey: "2026-05-28",
    jobs: [baseJob],
    dailyLogs: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        jobId: baseJob.id,
        logDate: "2026-05-28",
        status: "draft",
        updatedAt: "2026-05-28T12:00:00.000Z"
      }
    ],
    fieldNotes: [],
    timeCards: []
  });

  const handoff = handoffs.get(baseJob.id);

  assert.ok(handoff);
  assert.equal(handoff.hasCrewAssigned, true);
  assert.equal(handoff.dailyLog?.id, "33333333-3333-4333-8333-333333333333");
  assert.equal(
    handoff.dailyLogHref,
    "/daily-logs/33333333-3333-4333-8333-333333333333"
  );
  assert.equal(handoff.label, "Field handoff active");
  assert.equal(handoff.tone, "ready");
});

void test("schedule field handoff reports missing crew and missing Daily Log without creating state", () => {
  const handoffs = buildScheduleFieldHandoffSummaries({
    todayDateKey: "2026-05-28",
    jobs: [
      {
        ...baseJob,
        assignmentCount: 0,
        scheduledDate: "2026-05-29"
      }
    ],
    dailyLogs: [],
    fieldNotes: [],
    timeCards: []
  });

  const handoff = handoffs.get(baseJob.id);

  assert.ok(handoff);
  assert.equal(handoff.hasCrewAssigned, false);
  assert.equal(handoff.dailyLog, null);
  assert.equal(
    handoff.dailyLogHref,
    `/daily-logs?compose=1&projectId=${baseJob.projectId}&jobId=${baseJob.id}&logDate=2026-05-29#daily-log-create`
  );
  assert.equal(handoff.label, "Crew missing");
  assert.equal(handoff.tone, "warning");
});

void test("schedule field handoff derives blocker and time-card state from canonical rows", () => {
  const handoffs = buildScheduleFieldHandoffSummaries({
    todayDateKey: "2026-05-28",
    jobs: [baseJob],
    dailyLogs: [
      {
        id: "daily-log-1",
        jobId: baseJob.id,
        logDate: "2026-05-27",
        status: "submitted",
        updatedAt: "2026-05-27T21:00:00.000Z"
      },
      {
        id: "daily-log-2",
        jobId: baseJob.id,
        logDate: "2026-05-28",
        status: "draft",
        updatedAt: "2026-05-28T13:00:00.000Z"
      }
    ],
    fieldNotes: [
      {
        id: "note-1",
        jobId: baseJob.id,
        noteType: "blocker",
        status: "open",
        updatedAt: "2026-05-28T14:00:00.000Z"
      },
      {
        id: "note-2",
        jobId: baseJob.id,
        noteType: "observation",
        status: "open",
        updatedAt: "2026-05-28T15:00:00.000Z"
      },
      {
        id: "note-3",
        jobId: baseJob.id,
        noteType: "issue",
        status: "closed",
        updatedAt: "2026-05-28T16:00:00.000Z"
      }
    ],
    timeCards: [
      {
        id: "time-card-1",
        jobId: baseJob.id,
        workDate: "2026-05-28",
        status: "open",
        updatedAt: "2026-05-28T17:00:00.000Z"
      },
      {
        id: "time-card-2",
        jobId: baseJob.id,
        workDate: "2026-05-27",
        status: "completed",
        updatedAt: "2026-05-27T20:00:00.000Z"
      }
    ]
  });

  const handoff = handoffs.get(baseJob.id);

  assert.ok(handoff);
  assert.equal(handoff.latestDailyLog?.id, "daily-log-2");
  assert.equal(handoff.openBlockerCount, 1);
  assert.equal(handoff.fieldNoteCount, 3);
  assert.equal(handoff.targetDateTimeCardCount, 1);
  assert.equal(handoff.openTimeCardCount, 1);
  assert.equal(handoff.latestFieldActivityAt, "2026-05-28T17:00:00.000Z");
  assert.equal(handoff.label, "Blockers open");
  assert.equal(
    handoff.blockerHref,
    "/daily-logs/daily-log-2?noteType=blocker#job-notes"
  );
});

void test("schedule field handoff packet derives job project crew owner and source context", () => {
  const handoffs = buildScheduleFieldHandoffSummaries({
    todayDateKey: "2026-05-28",
    jobs: [baseJob],
    dailyLogs: [
      {
        id: "daily-log-1",
        jobId: baseJob.id,
        logDate: "2026-05-28",
        status: "draft",
        updatedAt: "2026-05-28T13:00:00.000Z"
      }
    ],
    fieldNotes: [],
    timeCards: []
  });
  const packet = buildScheduleFieldHandoffPacket({
    job: {
      ...baseJob,
      scheduledStartAt: "2026-05-28T13:00:00.000Z",
      scheduledEndAt: "2026-05-28T15:00:00.000Z",
      scheduleNotes: "Protect storefront entry and stage materials at bay 2.",
      crewSummary: ["Install crew"],
      title: "Warehouse coating",
      customerName: "Acme Floors",
      projectName: "Warehouse floor",
      project: {
        id: baseJob.projectId,
        name: "Warehouse floor",
        onsiteRepPersonId: "person-onsite",
        relationshipOwnerPersonId: "person-relationship",
        followUpOwnerPersonId: "person-follow-up"
      },
      estimate: {
        id: "estimate-1",
        referenceNumber: "EST-1001",
        status: "approved"
      }
    },
    handoff: handoffs.get(baseJob.id) ?? null,
    readiness: {
      isReadyToSchedule: true,
      blockers: [],
      estimateId: "estimate-1",
      estimateStatus: "approved",
      contractId: "contract-1",
      contractStatus: "signed",
      contractSignedAt: "2026-05-27T10:00:00.000Z"
    },
    warnings: [],
    people: [
      { id: "person-onsite", displayName: "Jordan Onsite" },
      { id: "person-relationship", displayName: "Riley Relationship" },
      { id: "person-follow-up", displayName: "Taylor Follow-up" }
    ]
  });

  assert.equal(packet.title, "Warehouse coating");
  assert.equal(packet.crewLabel, "Install crew");
  assert.equal(packet.scope.customerLabel, "Acme Floors");
  assert.equal(packet.scope.projectLabel, "Warehouse floor");
  assert.equal(packet.scope.estimateLabel, "Estimate EST-1001 · approved");
  assert.equal(packet.scope.contractLabel, "Contract · signed");
  assert.equal(
    packet.scope.scheduleNotesLabel,
    "Protect storefront entry and stage materials at bay 2."
  );
  assert.equal(packet.readiness.label, "Ready for field handoff");
  assert.equal(packet.readiness.warningLabel, "No schedule warnings");
  assert.deepEqual(
    packet.owners.map((owner) => owner.value),
    ["Jordan Onsite", "Riley Relationship", "Taylor Follow-up"]
  );
  assert.deepEqual(
    packet.links.map((link) => link.label),
    ["Job", "Project", "Estimate", "Contract", "Daily Log"]
  );
  assert.deepEqual(
    packet.executionChecklist.map((item) => [item.id, item.status]),
    [
      ["scope", "complete"],
      ["estimate", "complete"],
      ["contract", "complete"],
      ["readiness", "complete"],
      ["schedule_notes", "complete"],
      ["daily_log", "complete"],
      ["field_blockers", "complete"]
    ]
  );
});

void test("schedule field handoff packet reports missing estimate contract and owners truthfully", () => {
  const packet = buildScheduleFieldHandoffPacket({
    job: {
      ...baseJob,
      assignmentCount: 0,
      scheduledDate: null,
      title: "Warehouse coating",
      customerName: null,
      projectName: null,
      project: {
        id: baseJob.projectId,
        name: "Warehouse floor",
        onsiteRepPersonId: null,
        relationshipOwnerPersonId: "missing-person",
        followUpOwnerPersonId: null
      },
      estimate: null
    },
    handoff: null,
    readiness: null,
    warnings: [],
    people: []
  });

  assert.equal(packet.crewLabel, "No crew assigned");
  assert.equal(packet.scope.customerLabel, "No customer linked.");
  assert.equal(packet.scope.estimateLabel, "No estimate scope summary linked.");
  assert.equal(packet.scope.contractLabel, "No contract context linked.");
  assert.equal(packet.scope.scheduleNotesLabel, "No schedule notes captured.");
  assert.equal(packet.readiness.label, "Readiness not loaded");
  assert.equal(packet.fieldNotes.dailyLogLabel, "No Daily Log yet.");
  assert.deepEqual(
    packet.owners.map((owner) => owner.value),
    ["Not captured yet", "Person not available", "Not captured yet"]
  );
});

void test("schedule field handoff packet maps readiness blockers and warning summary without cross-project inference", () => {
  const packet = buildScheduleFieldHandoffPacket({
    job: {
      ...baseJob,
      title: "Warehouse coating",
      projectName: "Warehouse floor",
      estimate: null
    },
    handoff: null,
    readiness: {
      isReadyToSchedule: false,
      blockers: ["contract_signature_required"],
      estimateId: "estimate-for-this-job",
      estimateStatus: "approved",
      contractId: null,
      contractStatus: null,
      contractSignedAt: null
    },
    warnings: [
      {
        id: `${baseJob.id}:overlap`,
        jobId: baseJob.id,
        kind: "overlap",
        label: "Schedule overlap",
        detail: "Install crew overlaps with another job.",
        relatedJobIds: ["other-job"]
      }
    ],
    people: []
  });

  assert.equal(packet.readiness.label, "Readiness blocked");
  assert.equal(packet.readiness.detail, "contract signature required");
  assert.equal(packet.readiness.warningLabel, "Readiness blocked +1");
  assert.equal(packet.scope.estimateLabel, "Estimate context · approved");
  assert.equal(packet.scope.contractLabel, "No contract context linked.");
  assert.equal(
    packet.links.some((link) => link.href.includes("other-job")),
    false
  );
  assert.deepEqual(
    packet.executionChecklist.map((item) => [item.id, item.status]),
    [
      ["scope", "missing"],
      ["estimate", "complete"],
      ["contract", "missing"],
      ["readiness", "attention"],
      ["schedule_notes", "attention"],
      ["daily_log", "attention"],
      ["field_blockers", "complete"]
    ]
  );
});
