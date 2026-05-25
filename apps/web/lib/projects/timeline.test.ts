import assert from "node:assert/strict";
import test from "node:test";

import { deriveProjectCommandTimeline } from "./timeline";

const project = {
  id: "project-1",
  name: "Warehouse floor",
  status: "active",
  createdAt: "2026-05-20T10:00:00.000Z",
  updatedAt: "2026-05-24T10:00:00.000Z"
};

void test("project command timeline returns a minimal project item", () => {
  const timeline = deriveProjectCommandTimeline({ project });

  assert.equal(timeline.items.length, 1);
  assert.equal(timeline.items[0]?.title, "Project opened");
  assert.equal(timeline.items[0]?.href, "/projects/project-1");
  assert.equal(timeline.needsAttention.length, 0);
});

void test("project command timeline derives canonical estimate contract invoice job sequence", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    estimates: [
      {
        id: "estimate-1",
        referenceNumber: "EST-100",
        status: "approved",
        totalAmount: "12000",
        updatedAt: "2026-05-21T10:00:00.000Z"
      }
    ],
    contracts: [
      {
        id: "contract-1",
        title: "Warehouse contract",
        status: "signed",
        signedAt: "2026-05-22T10:00:00.000Z"
      }
    ],
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-100",
        status: "paid",
        balanceDueAmount: "0",
        updatedAt: "2026-05-23T10:00:00.000Z"
      }
    ],
    jobs: [
      {
        id: "job-1",
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-24",
        updatedAt: "2026-05-24T10:00:00.000Z"
      }
    ]
  });

  assert.ok(timeline.items.some((item) => item.title === "Estimate approved"));
  assert.ok(timeline.items.some((item) => item.title === "Contract signed"));
  assert.ok(timeline.items.some((item) => item.title === "Invoice paid"));
  assert.ok(timeline.items.some((item) => item.title === "Job scheduled"));
});

void test("project command timeline prioritizes unsigned contract attention", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    contracts: [
      {
        id: "contract-1",
        title: "Warehouse contract",
        status: "sent",
        sentAt: "2026-05-22T10:00:00.000Z"
      }
    ]
  });

  assert.equal(
    timeline.needsAttention[0]?.title,
    "Contract awaiting signature"
  );
  assert.equal(timeline.needsAttention[0]?.href, "/contracts/contract-1");
  assert.equal(timeline.needsAttention[0]?.tone, "attention");
});

void test("project command timeline surfaces unpaid deposit attention", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-DEP",
        workflowRole: "deposit",
        status: "sent",
        balanceDueAmount: "1500.00",
        updatedAt: "2026-05-23T10:00:00.000Z"
      }
    ]
  });

  assert.equal(
    timeline.needsAttention[0]?.title,
    "Deposit needs payment follow-up"
  );
  assert.equal(timeline.needsAttention[0]?.href, "/invoices/invoice-1");
});

void test("project command timeline includes ready-to-schedule item", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    readyToSchedule: true,
    scheduleHref:
      "/schedule?projectId=project-1&view=unscheduled&action=schedule"
  });

  assert.equal(timeline.readyToMove[0]?.title, "Ready to move into scheduling");
  assert.equal(
    timeline.readyToMove[0]?.nextActionHref,
    "/schedule?projectId=project-1&view=unscheduled&action=schedule"
  );
});

void test("project command timeline includes scheduled and in-progress job items", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    jobs: [
      {
        id: "job-1",
        dispatchStatus: "in_progress",
        scheduledDate: "2026-05-25",
        updatedAt: "2026-05-25T10:00:00.000Z"
      }
    ]
  });

  assert.equal(timeline.readyToMove[0]?.title, "Job in progress");
  assert.equal(timeline.readyToMove[0]?.href, "/jobs/job-1");
});

void test("project command timeline surfaces open blocker field notes", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    fieldNotes: [
      {
        id: "note-1",
        dailyLogId: "daily-log-1",
        noteType: "blocker",
        status: "open",
        title: "Moisture reading failed",
        updatedAt: "2026-05-24T12:00:00.000Z"
      }
    ]
  });

  assert.equal(timeline.needsAttention[0]?.title, "Open field blocker");
  assert.equal(
    timeline.needsAttention[0]?.href,
    "/daily-logs/daily-log-1#job-notes"
  );
  assert.equal(timeline.needsAttention[0]?.customerSafe, false);
});

void test("project command timeline includes document readiness gaps", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    documentReadiness: {
      label: "Document readiness needs review",
      detail: "Signed contract proof is missing.",
      href: "#proofcenter",
      tone: "missing",
      missingCount: 1
    }
  });

  assert.equal(
    timeline.needsAttention[0]?.id,
    "document-readiness:project-proof"
  );
  assert.equal(timeline.needsAttention[0]?.sourceLabel, "Proof Center");
});

void test("project command timeline sorts attention before recent non-attention", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        balanceDueAmount: "500.00",
        updatedAt: "2026-05-21T10:00:00.000Z"
      }
    ],
    dailyLogs: [
      {
        id: "daily-log-1",
        logDate: "2026-05-25",
        status: "draft",
        updatedAt: "2026-05-25T10:00:00.000Z"
      }
    ]
  });

  assert.equal(timeline.items[0]?.category, "invoice");
  assert.equal(timeline.recentMovement[0]?.category, "field");
});

void test("project command timeline links back to canonical workspaces", () => {
  const timeline = deriveProjectCommandTimeline({
    project,
    estimates: [{ id: "estimate-1", status: "approved" }],
    contracts: [{ id: "contract-1", status: "sent" }],
    invoices: [{ id: "invoice-1", status: "sent", balanceDueAmount: "10" }],
    jobs: [{ id: "job-1", dispatchStatus: "scheduled" }]
  });

  const hrefs = new Set(timeline.items.map((item) => item.href));

  assert.ok(hrefs.has("/estimates/estimate-1"));
  assert.ok(hrefs.has("/contracts/contract-1"));
  assert.ok(hrefs.has("/invoices/invoice-1"));
  assert.ok(hrefs.has("/jobs/job-1"));
});
