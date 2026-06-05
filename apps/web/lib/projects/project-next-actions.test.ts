import assert from "node:assert/strict";
import test from "node:test";

import { buildProjectNextActions } from "./project-next-actions";

const project = {
  id: "project-1",
  name: "Garage floor"
};

function readiness(overrides: Record<string, unknown>) {
  return {
    isReadyToSchedule: true,
    blockers: [],
    depositRequired: false,
    depositSatisfied: true,
    depositInvoiceId: null,
    ...overrides
  };
}

void test("project next actions route approved estimates without contracts to contract generation", () => {
  const summary = buildProjectNextActions({
    project,
    todayIsoDate: "2026-06-01",
    readinessSnapshot: readiness({ isReadyToSchedule: false }),
    estimates: [
      {
        id: "estimate-1",
        status: "approved",
        referenceNumber: "EST-100",
        updatedAt: "2026-05-20T12:00:00.000Z"
      }
    ],
    contracts: [],
    invoices: [],
    jobs: []
  });

  assert.equal(summary.headline.id, "project-1:approved-estimate-no-contract");
  assert.equal(summary.headline.owningWorkspace, "Contract Workspace");
  assert.equal(
    summary.headline.primaryHref,
    "/contracts?estimateId=estimate-1"
  );
  assert.equal(summary.headline.primaryActionLabel, "Generate contract");
});

void test("project next actions route ready projects without jobs to canonical job creation", () => {
  const summary = buildProjectNextActions({
    project,
    todayIsoDate: "2026-06-01",
    readinessSnapshot: readiness({ isReadyToSchedule: true }),
    estimates: [{ id: "estimate-1", status: "approved" }],
    contracts: [{ id: "contract-1", status: "signed", signedAt: "2026-05-29" }],
    invoices: [],
    jobs: []
  });

  assert.equal(summary.headline.id, "project-1:ready-no-job");
  assert.equal(summary.headline.owningWorkspace, "Jobs Manager");
  assert.equal(
    summary.headline.primaryHref,
    "/jobs?projectId=project-1&compose=1&estimateId=estimate-1&contractId=contract-1"
  );
  assert.equal(summary.headline.primaryActionLabel, "Create job");
});

void test("project next actions route unscheduled jobs to CrewBoard handoff", () => {
  const summary = buildProjectNextActions({
    project,
    todayIsoDate: "2026-06-01",
    readinessSnapshot: readiness({ isReadyToSchedule: true }),
    estimates: [],
    contracts: [],
    invoices: [],
    jobs: [{ id: "job-1", dispatchStatus: "unscheduled" }]
  });

  assert.equal(summary.headline.id, "project-1:unscheduled-job");
  assert.equal(summary.headline.owningWorkspace, "CrewBoard");
  assert.equal(
    summary.headline.primaryHref,
    "/schedule?projectId=project-1&view=unscheduled&action=schedule&jobId=job-1"
  );
  assert.equal(summary.headline.primaryActionLabel, "Open CrewBoard");
});

void test("project next actions surface open invoice AR handoff", () => {
  const summary = buildProjectNextActions({
    project,
    todayIsoDate: "2026-06-01",
    readinessSnapshot: readiness({ isReadyToSchedule: true }),
    estimates: [],
    contracts: [],
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        workflowRole: "standard",
        referenceNumber: "INV-100",
        balanceDueAmount: "750.00"
      }
    ],
    jobs: [
      { id: "job-1", dispatchStatus: "scheduled", scheduledDate: "2026-06-03" }
    ]
  });

  assert.equal(summary.headline.id, "project-1:open-ar");
  assert.equal(summary.headline.owningWorkspace, "Invoice Workspace");
  assert.equal(summary.headline.primaryHref, "/invoices/invoice-1");
  assert.equal(
    summary.headline.secondaryHref,
    "/financials/accounts-receivable"
  );
});

void test("project next actions prioritize open blocker field notes", () => {
  const summary = buildProjectNextActions({
    project,
    todayIsoDate: "2026-06-01",
    readinessSnapshot: readiness({ isReadyToSchedule: true }),
    estimates: [],
    contracts: [],
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        workflowRole: "standard",
        balanceDueAmount: "500.00"
      }
    ],
    jobs: [{ id: "job-1", dispatchStatus: "unscheduled" }],
    fieldNotes: [
      {
        id: "note-1",
        dailyLogId: "daily-log-1",
        noteType: "blocker",
        status: "open",
        title: "Moisture issue"
      }
    ]
  });

  assert.equal(summary.headline.id, "project-1:open-field-blocker");
  assert.equal(summary.headline.owningWorkspace, "Daily Log / FieldTrail");
  assert.equal(
    summary.headline.primaryHref,
    "/daily-logs/daily-log-1#job-notes"
  );
  assert.ok(
    summary.actions.some((action) => action.id === "project-1:open-ar")
  );
});

void test("project next actions route multi-invoice AR review to Accounts Receivable", () => {
  const summary = buildProjectNextActions({
    project,
    todayIsoDate: "2026-06-01",
    readinessSnapshot: readiness({ isReadyToSchedule: true }),
    estimates: [],
    contracts: [],
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        workflowRole: "standard",
        referenceNumber: "INV-100",
        balanceDueAmount: "750.00"
      },
      {
        id: "invoice-2",
        status: "sent",
        workflowRole: "standard",
        referenceNumber: "INV-101",
        balanceDueAmount: "250.00"
      }
    ],
    jobs: [
      { id: "job-1", dispatchStatus: "scheduled", scheduledDate: "2026-06-03" }
    ]
  });

  assert.equal(summary.headline.id, "project-1:open-ar");
  assert.equal(summary.headline.owningWorkspace, "Accounts Receivable");
  assert.equal(summary.headline.primaryHref, "/financials/accounts-receivable");
  assert.equal(summary.headline.secondaryHref, "/invoices/invoice-1");
});
