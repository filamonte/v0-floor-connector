import assert from "node:assert/strict";
import test from "node:test";

import { deriveProjectOperationalWorkspaceSummary } from "./operational-workspace";

void test("project operational workspace summarizes financial exposure from canonical invoices", () => {
  const summary = deriveProjectOperationalWorkspaceSummary({
    projectId: "project-1",
    todayIsoDate: "2026-05-27",
    readiness: {
      isReadyToSchedule: false,
      blockers: ["deposit_required"],
      depositRequired: true,
      depositSatisfied: false,
      contractStatus: "signed"
    },
    approvedEstimateTotalAmount: "10000.00",
    invoices: [
      {
        id: "invoice-deposit",
        status: "sent",
        workflowRole: "deposit",
        totalAmount: "2500.00",
        balanceDueAmount: "2500.00",
        retainageHeldAmount: "0.00",
        dueDate: "2026-05-20"
      },
      {
        id: "invoice-progress",
        status: "partially_paid",
        workflowRole: "standard",
        totalAmount: "5000.00",
        balanceDueAmount: "1200.00",
        retainageHeldAmount: "500.00",
        dueDate: "2026-05-30"
      }
    ],
    jobs: [],
    changeOrders: [
      { id: "co-1", status: "approved", priceAdjustment: "750.00" }
    ],
    dailyLogs: [],
    fieldNotes: [],
    totalWorkedMinutes: 0,
    progressBillingExposureAmount: "1600.00"
  });

  assert.equal(summary.financial.contractValue, 10000);
  assert.equal(summary.financial.approvedChangeOrderImpact, 750);
  assert.equal(summary.financial.invoicedAmount, 7500);
  assert.equal(summary.financial.paidAmount, 3800);
  assert.equal(summary.financial.outstandingBalance, 3700);
  assert.equal(summary.financial.overdueExposure, 2500);
  assert.equal(summary.financial.unpaidDepositAmount, 2500);
  assert.equal(summary.financial.retainageHeldAmount, 500);
  assert.equal(summary.financial.progressBillingExposure, 1600);
  assert.ok(
    summary.attentionSignals.some(
      (signal) => signal.id === "readiness:deposit_required"
    )
  );
});

void test("project operational workspace prioritizes schedule and field continuity", () => {
  const summary = deriveProjectOperationalWorkspaceSummary({
    projectId: "project-1",
    todayIsoDate: "2026-05-27",
    readiness: {
      isReadyToSchedule: true,
      blockers: [],
      depositRequired: false,
      depositSatisfied: true,
      contractStatus: "signed"
    },
    invoices: [],
    jobs: [
      { id: "job-1", dispatchStatus: "unscheduled" },
      { id: "job-2", dispatchStatus: "scheduled", scheduledDate: "2026-05-30" }
    ],
    jobAssignmentCountsByJobId: new Map([
      ["job-1", 0],
      ["job-2", 1]
    ]),
    changeOrders: [],
    dailyLogs: [
      {
        id: "log-1",
        status: "draft",
        logDate: "2026-05-26",
        summary: "Prep started"
      }
    ],
    fieldNotes: [
      {
        id: "note-1",
        dailyLogId: "log-1",
        noteType: "blocker",
        status: "open",
        title: "Moisture reading needs review"
      }
    ],
    totalWorkedMinutes: 135
  });

  assert.equal(summary.schedule.jobCount, 2);
  assert.equal(summary.schedule.unscheduledJobCount, 1);
  assert.equal(summary.schedule.missingCrewJobCount, 1);
  assert.equal(summary.schedule.nextActionLabel, "Schedule ready work");
  assert.equal(summary.execution.openBlockerCount, 1);
  assert.equal(summary.execution.latestDailyLogHref, "/daily-logs/log-1");
  assert.equal(summary.execution.totalWorkedMinutes, 135);
  assert.ok(
    summary.attentionSignals.some((signal) => signal.source === "FieldTrail")
  );
  assert.ok(
    summary.attentionSignals.some((signal) => signal.source === "CrewBoard")
  );
});
