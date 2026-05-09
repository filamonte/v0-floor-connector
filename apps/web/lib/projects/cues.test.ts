import assert from "node:assert/strict";
import test from "node:test";

import { buildProjectCues, selectHighestPriorityProjectCues } from "./cues";

const project = {
  id: "project-1",
  name: "Garage floor"
};

function readiness(overrides: Record<string, unknown>) {
  return {
    status: "ready_to_schedule",
    blockers: [],
    isReadyToSchedule: true,
    isOperationallyActive: false,
    depositRequired: false,
    depositSatisfied: true,
    financingStatus: "not_applicable",
    opportunityId: null,
    siteAssessmentStatus: null,
    estimateId: null,
    estimateStatus: null,
    contractId: null,
    contractStatus: null,
    contractInternalApprovalStatus: null,
    contractSignedAt: null,
    depositInvoiceId: null,
    depositInvoiceStatus: null,
    ...overrides
  } as unknown as NonNullable<Parameters<typeof buildProjectCues>[0]["readinessSnapshot"]>;
}

void test("project cues link approved estimates into existing contract generation", () => {
  const cues = buildProjectCues({
    project,
    readinessSnapshot: null,
    estimates: [
      {
        id: "estimate-1",
        status: "approved",
        referenceNumber: "EST-100",
        updatedAt: "2026-05-01T10:00:00.000Z"
      }
    ],
    contracts: [],
    invoices: [],
    jobs: []
  });

  assert.equal(cues[0]?.id, "project-1:approved-estimate-missing-contract");
  assert.equal(cues[0]?.href, "/contracts?estimateId=estimate-1");
  assert.equal(cues[0]?.actionLabel, "Generate contract");
  assert.equal(
    cues[0]?.workItemBridge?.href,
    "/projects/project-1?workItemCue=approved_estimate_missing_contract#work-items"
  );
  assert.equal(cues[0]?.workItemBridge?.sourceType, "estimate");
  assert.equal(cues[0]?.workItemBridge?.sourceId, "estimate-1");
});

void test("project cues link ready signed work into canonical job quick-create", () => {
  const cues = buildProjectCues({
    project,
    readinessSnapshot: readiness({
      status: "ready_to_schedule",
      isReadyToSchedule: true,
      estimateId: "estimate-1",
      contractId: "contract-1",
      contractStatus: "signed"
    }),
    estimates: [
      {
        id: "estimate-1",
        status: "approved",
        referenceNumber: "EST-100"
      }
    ],
    contracts: [
      {
        id: "contract-1",
        status: "signed",
        estimateId: "estimate-1",
        title: "Garage contract"
      }
    ],
    invoices: [],
    jobs: []
  });

  const cue = cues.find((item) => item.id === "project-1:signed-contract-no-job");

  assert.ok(cue);
  assert.equal(
    cue.href,
    "/jobs?projectId=project-1&compose=1&estimateId=estimate-1&contractId=contract-1"
  );
  assert.equal(cue.actionLabel, "Create job");
  assert.equal(cue.workItemBridge?.cue, "signed_contract_no_job");
  assert.equal(cue.workItemBridge?.sourceType, "contract");
});

void test("project cues link ready unscheduled jobs into existing schedule action", () => {
  const cues = buildProjectCues({
    project,
    readinessSnapshot: readiness({
      status: "ready_to_schedule",
      isReadyToSchedule: true
    }),
    estimates: [],
    contracts: [],
    invoices: [],
    jobs: [
      {
        id: "job-1",
        dispatchStatus: "unscheduled"
      }
    ]
  });

  const cue = cues.find((item) => item.id === "project-1:ready-unscheduled-jobs");

  assert.ok(cue);
  assert.equal(
    cue.href,
    "/schedule?projectId=project-1&view=unscheduled&action=schedule&jobId=job-1"
  );
  assert.equal(cue.workItemBridge?.cue, "ready_unscheduled_jobs");
  assert.equal(cue.workItemBridge?.sourceType, "job");
  assert.equal(cue.workItemBridge?.sourceId, "job-1");
});

void test("project cue preview keeps the highest-priority cues first", () => {
  const cues = selectHighestPriorityProjectCues(
    buildProjectCues({
      project,
      readinessSnapshot: readiness({
        status: "waiting_on_deposit",
        blockers: ["deposit_required"],
        isReadyToSchedule: true,
        estimateId: "estimate-1",
        contractId: "contract-1",
        depositRequired: true,
        depositSatisfied: false,
        depositInvoiceId: "invoice-1",
        depositInvoiceStatus: "sent"
      }),
      estimates: [],
      contracts: [],
      invoices: [
        {
          id: "invoice-1",
          status: "sent",
          workflowRole: "deposit",
          balanceDueAmount: "500.00",
          referenceNumber: "INV-100"
        }
      ],
      jobs: [
        {
          id: "job-1",
          dispatchStatus: "unscheduled"
        }
      ],
      fieldNotes: [
        {
          id: "note-1",
          dailyLogId: "daily-log-1",
          noteType: "blocker",
          status: "open",
          title: "Moisture issue"
        }
      ]
    }),
    2
  );

  assert.deepEqual(
    cues.map((cue) => cue.id),
    ["project-1:deposit-invoice-unpaid", "project-1:open-blocker-field-notes"]
  );
});
