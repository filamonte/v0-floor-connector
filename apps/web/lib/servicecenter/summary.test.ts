import assert from "node:assert/strict";
import test from "node:test";

import { deriveServiceCenterSummary } from "./summary";

const openTicket = {
  id: "ticket-1",
  title: "Coating peeling near dock",
  status: "open",
  priority: "normal",
  ticketType: "service",
  projectId: "project-1",
  jobId: "job-1",
  warrantyStartDate: null,
  warrantyEndDate: null,
  warrantyBasis: null
};

const warrantyDocument = {
  id: "warranty-1",
  title: "Project warranty",
  status: "issued",
  warrantyStartDate: "2026-05-01",
  warrantyEndDate: "2027-05-01",
  warrantyBasis: "Installed system warranty",
  signatureSummary: {
    signerCount: 2,
    requestedSignerCount: 1,
    signedSignerCount: 0
  }
};

void test("service center summary falls back when no tickets or coverage exist", () => {
  const summary = deriveServiceCenterSummary({
    tickets: [],
    warrantyDocuments: [],
    serviceJobs: [],
    serviceCenterHref: "/service-tickets?projectId=project-1",
    proofContextCount: 0,
    closeoutReady: false
  });

  assert.equal(summary.openTicketCount, 0);
  assert.equal(summary.coverageLabel, "Warranty handoff not recorded");
  assert.equal(summary.nextMove.label, "Open Service Center");
  assert.equal(summary.nextMove.href, "/service-tickets?projectId=project-1");
  assert.deepEqual(summary.warnings, [
    "Warranty handoff has not been added yet."
  ]);
});

void test("service center summary prioritizes high-priority open tickets", () => {
  const summary = deriveServiceCenterSummary({
    tickets: [
      {
        ...openTicket,
        id: "ticket-urgent",
        title: "Urgent warranty callback",
        priority: "urgent"
      },
      openTicket
    ],
    warrantyDocuments: [warrantyDocument],
    serviceJobs: []
  });

  assert.equal(summary.openTicketCount, 2);
  assert.equal(summary.nextMove.label, "Review high-priority ticket");
  assert.equal(summary.nextMove.href, "/service-tickets/ticket-urgent");
  assert.equal(summary.coverageLabel, "Warranty handoff documented");
});

void test("service center summary sends unscheduled service jobs to CrewBoard", () => {
  const summary = deriveServiceCenterSummary({
    tickets: [{ ...openTicket, status: "resolved" }],
    warrantyDocuments: [],
    serviceJobs: [
      {
        id: "job-1",
        dispatchStatus: "unscheduled",
        scheduledDate: null
      }
    ]
  });

  assert.equal(summary.openTicketCount, 0);
  assert.equal(summary.closedTicketCount, 1);
  assert.equal(summary.nextMove.label, "Schedule service job");
  assert.equal(
    summary.nextMove.href,
    "/schedule?jobId=job-1&action=schedule#schedule-action"
  );
});

void test("service center summary tracks proof and warranty signature context", () => {
  const summary = deriveServiceCenterSummary({
    tickets: [{ ...openTicket, status: "closed" }],
    warrantyDocuments: [warrantyDocument],
    serviceJobs: [],
    closeoutPackageHref: "/projects/project-1/closeout-package/pdf",
    proofContextCount: 4,
    closeoutReady: true
  });

  assert.equal(summary.requestedSignatureCount, 1);
  assert.equal(summary.signedSignatureCount, 0);
  assert.equal(summary.evidenceContextLabel, "4 proof/context items available");
  assert.equal(summary.nextMove.label, "Review warranty signature");
  assert.equal(summary.highlights.length, 3);
});
