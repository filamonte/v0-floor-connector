import assert from "node:assert/strict";
import test from "node:test";

import { buildDashboardActionQueues } from "./action-queues";
import type { ProjectCue } from "@/lib/projects/cues";

const baseProjectCue = {
  projectId: "project-1",
  projectName: "Library Renovation",
  priority: "high",
  sortOrder: 10
} satisfies Partial<ProjectCue>;

void test("dashboard action queues surface approved estimate without contract", () => {
  const queues = buildDashboardActionQueues({
    today: "2026-06-01",
    projectCues: [
      {
        ...baseProjectCue,
        id: "project-1:approved-estimate-missing-contract",
        title: "Approved estimate needs a contract",
        description:
          "Approved scope exists, but no canonical contract has been generated yet.",
        href: "/contracts?estimateId=estimate-1",
        actionLabel: "Generate contract",
        reason: "Estimate EST-100 is approved."
      } satisfies ProjectCue
    ],
    readyProjectsWithoutJobs: [],
    jobsNeedingScheduling: [],
    openInvoices: [],
    overdueInvoices: [],
    jobsTodayOrInProgress: []
  });

  const needsContract = queues.find((queue) => queue.key === "needs-contract");

  assert.equal(needsContract?.items.length, 1);
  assert.equal(needsContract?.items[0]?.title, "Library Renovation");
  assert.equal(
    needsContract?.items[0]?.recommendedActionLabel,
    "Generate or review contract"
  );
  assert.equal(
    needsContract?.items[0]?.href,
    "/contracts?estimateId=estimate-1"
  );
});

void test("dashboard action queues surface open invoice in Open AR", () => {
  const queues = buildDashboardActionQueues({
    today: "2026-06-01",
    projectCues: [],
    readyProjectsWithoutJobs: [],
    jobsNeedingScheduling: [],
    openInvoices: [
      {
        id: "invoice-1",
        customerId: "customer-1",
        projectId: "project-1",
        referenceNumber: "INV-100",
        workflowRole: "final",
        status: "sent",
        dueDate: "2026-06-15",
        balanceDueAmount: "1250.00",
        updatedAt: "2026-05-30T12:00:00.000Z",
        customer: { id: "customer-1", name: "Acme", companyName: null },
        project: { id: "project-1", name: "Library Renovation" }
      }
    ],
    overdueInvoices: [],
    jobsTodayOrInProgress: []
  });

  const openAr = queues.find((queue) => queue.key === "open-ar");

  assert.equal(openAr?.items.length, 1);
  assert.equal(openAr?.items[0]?.title, "INV-100");
  assert.equal(
    openAr?.items[0]?.reason,
    "Invoice is open with remaining balance."
  );
  assert.equal(openAr?.items[0]?.recommendedActionLabel, "Review invoice");
  assert.equal(openAr?.items[0]?.href, "/invoices/invoice-1");
});

void test("dashboard action queues surface job scheduled today", () => {
  const queues = buildDashboardActionQueues({
    today: "2026-06-01",
    projectCues: [],
    readyProjectsWithoutJobs: [],
    jobsNeedingScheduling: [],
    openInvoices: [],
    overdueInvoices: [],
    jobsTodayOrInProgress: [
      {
        id: "job-1",
        customerId: "customer-1",
        projectId: "project-1",
        estimateId: null,
        dispatchStatus: "scheduled",
        scheduledDate: "2026-06-01",
        scheduledStartAt: "2026-06-01T13:00:00.000Z",
        updatedAt: "2026-05-30T12:00:00.000Z",
        customer: { id: "customer-1", name: "Acme", companyName: null },
        project: { id: "project-1", name: "Library Renovation" },
        estimate: null
      }
    ]
  });

  const todaysWork = queues.find((queue) => queue.key === "todays-work");

  assert.equal(todaysWork?.items.length, 1);
  assert.equal(todaysWork?.items[0]?.title, "Library Renovation");
  assert.equal(todaysWork?.items[0]?.reason, "Job is scheduled today.");
  assert.equal(todaysWork?.items[0]?.recommendedActionLabel, "Review schedule");
  assert.equal(todaysWork?.items[0]?.href, "/jobs/job-1");
});

void test("dashboard action queues surface open blocker field note cue", () => {
  const queues = buildDashboardActionQueues({
    today: "2026-06-01",
    projectCues: [
      {
        ...baseProjectCue,
        id: "project-1:open-blocker-field-notes",
        title: "Open blocker field notes need review",
        description:
          "Field blockers are still open on daily logs for this project.",
        href: "/daily-logs/daily-log-1",
        actionLabel: "Open daily log",
        reason: "Concrete moisture issue is still open."
      } satisfies ProjectCue
    ],
    readyProjectsWithoutJobs: [],
    jobsNeedingScheduling: [],
    openInvoices: [],
    overdueInvoices: [],
    jobsTodayOrInProgress: []
  });

  const blockers = queues.find((queue) => queue.key === "open-blockers");

  assert.equal(blockers?.items.length, 1);
  assert.equal(blockers?.items[0]?.title, "Library Renovation");
  assert.equal(
    blockers?.items[0]?.reason,
    "Field blockers are still open on daily logs for this project."
  );
  assert.equal(blockers?.items[0]?.recommendedActionLabel, "Review blocker");
  assert.equal(blockers?.items[0]?.href, "/daily-logs/daily-log-1");
});
