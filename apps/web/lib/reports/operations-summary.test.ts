import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveOperationsReportingSummary,
  type ReportsContractInput,
  type ReportsInvoiceInput,
  type ReportsJobInput,
  type ReportsProjectInput
} from "./operations-summary";

function project(
  overrides: Partial<ReportsProjectInput> = {}
): ReportsProjectInput {
  return {
    id: overrides.id ?? "project-1",
    name: overrides.name ?? "Project One",
    status: overrides.status ?? "active",
    commercialReadinessStatus:
      overrides.commercialReadinessStatus ?? "ready_to_schedule",
    customer: overrides.customer ?? { name: "Customer One" }
  };
}

function job(overrides: Partial<ReportsJobInput> = {}): ReportsJobInput {
  return {
    id: overrides.id ?? "job-1",
    projectId: overrides.projectId ?? "project-1",
    dispatchStatus: overrides.dispatchStatus ?? "unscheduled",
    scheduledDate: Object.hasOwn(overrides, "scheduledDate")
      ? overrides.scheduledDate!
      : null,
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    project: overrides.project ?? { name: "Project One" },
    customer: overrides.customer ?? { name: "Customer One" }
  };
}

function contract(
  overrides: Partial<ReportsContractInput> = {}
): ReportsContractInput {
  return {
    id: overrides.id ?? "contract-1",
    projectId: overrides.projectId ?? "project-1",
    referenceNumber: overrides.referenceNumber ?? "CON-001",
    status: overrides.status ?? "sent",
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    project: overrides.project ?? { name: "Project One" },
    customer: overrides.customer ?? { name: "Customer One" }
  };
}

function invoice(
  overrides: Partial<ReportsInvoiceInput> = {}
): ReportsInvoiceInput {
  return {
    id: overrides.id ?? "invoice-1",
    projectId: overrides.projectId ?? "project-1",
    referenceNumber: overrides.referenceNumber ?? "INV-001",
    status: overrides.status ?? "sent",
    dueDate: Object.hasOwn(overrides, "dueDate")
      ? (overrides.dueDate ?? null)
      : "2026-05-01",
    balanceDueAmount: overrides.balanceDueAmount ?? "100.00",
    project: overrides.project ?? { name: "Project One" },
    customer: overrides.customer ?? { name: "Customer One" }
  };
}

function summary(
  overrides: Partial<
    Parameters<typeof deriveOperationsReportingSummary>[0]
  > = {}
) {
  return deriveOperationsReportingSummary({
    todayIso: overrides.todayIso ?? "2026-05-20",
    projects: overrides.projects ?? [],
    jobs: overrides.jobs ?? [],
    jobAssignments: overrides.jobAssignments ?? [],
    scheduleWarnings: overrides.scheduleWarnings ?? [],
    contracts: overrides.contracts ?? [],
    invoices: overrides.invoices ?? [],
    dailyLogs: overrides.dailyLogs ?? [],
    fieldNotes: overrides.fieldNotes ?? [],
    attachments: overrides.attachments ?? [],
    collections: overrides.collections ?? {
      openReceivableAmount: "0.00",
      overdueReceivableAmount: "0.00",
      openInvoiceCount: 0,
      overdueInvoiceCount: 0,
      pendingPaymentAmount: "0.00",
      pendingEventCount: 0,
      failedOrVoidedEventCount: 0
    }
  });
}

void test("computes scheduling and crew metrics", () => {
  const result = summary({
    projects: [project()],
    jobs: [
      job({ id: "unscheduled", dispatchStatus: "unscheduled" }),
      job({
        id: "today",
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-20"
      }),
      job({
        id: "upcoming",
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-25"
      })
    ],
    jobAssignments: [
      {
        id: "assignment-1",
        jobId: "upcoming",
        personId: "person-1",
        vendorId: null
      }
    ],
    scheduleWarnings: [{ jobId: "today", warnings: [{ id: "warning-1" }] }]
  });

  assert.equal(result.counts.unscheduledJobs, 1);
  assert.equal(result.counts.jobsScheduledToday, 1);
  assert.equal(result.counts.upcomingJobs, 1);
  assert.equal(result.counts.jobsMissingCrew, 1);
  assert.equal(result.counts.scheduleWarnings, 1);
  assert.equal(result.lists.jobsNeedingSchedulingOrCrew.length, 2);
});

void test("computes receivable and payment attention metrics", () => {
  const result = summary({
    projects: [project()],
    invoices: [
      invoice({ id: "open", balanceDueAmount: "500.00" }),
      invoice({ id: "paid", status: "paid", balanceDueAmount: "0.00" })
    ],
    collections: {
      openReceivableAmount: "500.00",
      overdueReceivableAmount: "500.00",
      openInvoiceCount: 1,
      overdueInvoiceCount: 1,
      pendingPaymentAmount: "75.00",
      pendingEventCount: 1,
      failedOrVoidedEventCount: 1
    }
  });

  assert.equal(result.counts.openReceivables, 1);
  assert.equal(result.counts.overdueInvoices, 1);
  assert.equal(result.counts.paymentAttention, 2);
  assert.equal(result.amounts.openReceivables, "500.00");
  assert.equal(result.lists.invoicesNeedingCollection.length, 1);
});

void test("flags waiting signatures", () => {
  const result = summary({
    projects: [project()],
    contracts: [
      contract({ id: "sent", status: "sent" }),
      contract({ id: "viewed", status: "viewed" }),
      contract({ id: "signed", status: "signed" })
    ]
  });

  assert.equal(result.counts.contractsWaitingSignature, 2);
  assert.deepEqual(
    result.lists.contractsWaitingSignature.map((item) => item.id),
    ["sent", "viewed"]
  );
});

void test("flags field blockers and missing recent Daily Job Logs", () => {
  const result = summary({
    projects: [project()],
    jobs: [job({ dispatchStatus: "in_progress", scheduledDate: "2026-05-20" })],
    dailyLogs: [
      {
        id: "daily-log-1",
        projectId: "project-1",
        jobId: "job-1",
        logDate: "2026-05-19"
      }
    ],
    fieldNotes: [
      {
        id: "note-1",
        projectId: "project-1",
        dailyLogId: "daily-log-1",
        noteType: "blocker",
        status: "open",
        title: "Moisture issue",
        updatedAt: "2026-05-20T12:00:00.000Z",
        project: { name: "Project One" }
      }
    ]
  });

  assert.equal(result.counts.inProgressJobs, 1);
  assert.equal(result.counts.projectsMissingRecentDailyLogs, 1);
  assert.equal(result.counts.fieldBlockers, 1);
  assert.equal(result.lists.fieldBlockers[0]?.title, "Moisture issue");
});

void test("handles empty state without fake counts", () => {
  const result = summary();

  assert.equal(result.counts.openProjects, 0);
  assert.equal(result.counts.unscheduledJobs, 0);
  assert.equal(result.counts.openReceivables, 0);
  assert.equal(result.lists.projectsNeedingNextMove.length, 0);
  assert.equal(
    result.metrics.every(
      (metric) => metric.value === 0 || metric.value === "0.00"
    ),
    true
  );
});
