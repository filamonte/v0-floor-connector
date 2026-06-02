import assert from "node:assert/strict";
import test from "node:test";

import { derivePortalProjectTimeline } from "./project-timeline";

void test("project timeline creates action item for contracts requiring signature review", () => {
  const timeline = derivePortalProjectTimeline({
    contracts: [
      {
        id: "contract-1",
        title: "Project contract",
        status: "sent",
        sentAt: "2026-05-20T10:00:00.000Z"
      }
    ]
  });

  assert.equal(timeline.timelineItems[0]?.label, "Contract ready for review");
  assert.equal(timeline.timelineItems[0]?.source, "contract");
  assert.equal(timeline.timelineItems[0]?.customerActionRequired, true);
  assert.equal(timeline.timelineItems[0]?.href, "/portal/contracts/contract-1");
});

void test("project timeline creates action item for invoices due", () => {
  const timeline = derivePortalProjectTimeline({
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-1001",
        workflowRole: "standard",
        status: "sent",
        balanceDueAmount: "500.00",
        latestPaymentEventType: "payment_requested",
        latestPaymentEventAt: "2026-05-21T10:00:00.000Z"
      }
    ]
  });

  assert.equal(timeline.timelineItems[0]?.label, "Invoice ready for payment");
  assert.equal(timeline.timelineItems[0]?.source, "invoice");
  assert.equal(timeline.timelineItems[0]?.tone, "attention");
  assert.equal(timeline.timelineItems[0]?.customerActionRequired, true);
});

void test("project timeline creates action item for pending change orders", () => {
  const timeline = derivePortalProjectTimeline({
    changeOrders: [
      {
        id: "change-order-1",
        title: "Added prep",
        status: "sent",
        sentAt: "2026-05-22T10:00:00.000Z"
      }
    ]
  });

  assert.equal(
    timeline.timelineItems[0]?.label,
    "Change order ready for review"
  );
  assert.equal(timeline.timelineItems[0]?.source, "change_order");
  assert.equal(timeline.timelineItems[0]?.customerActionRequired, true);
});

void test("project timeline creates completed item for approved estimates", () => {
  const timeline = derivePortalProjectTimeline({
    estimates: [
      {
        id: "estimate-1",
        referenceNumber: "EST-1001",
        status: "approved",
        updatedAt: "2026-05-23T10:00:00.000Z"
      }
    ]
  });

  assert.equal(timeline.timelineItems[0]?.label, "Estimate approved");
  assert.equal(timeline.timelineItems[0]?.tone, "complete");
  assert.equal(timeline.timelineItems[0]?.customerActionRequired, undefined);
});

void test("project timeline sorts mixed records by customer-safe timeline date", () => {
  const timeline = derivePortalProjectTimeline({
    project: {
      id: "project-1",
      name: "Shop floor",
      status: "active",
      createdAt: "2026-05-18T10:00:00.000Z"
    },
    estimates: [
      {
        id: "estimate-1",
        status: "approved",
        updatedAt: "2026-05-19T10:00:00.000Z"
      }
    ],
    contracts: [
      {
        id: "contract-1",
        status: "sent",
        sentAt: "2026-05-20T10:00:00.000Z"
      }
    ],
    changeOrders: [
      {
        id: "change-order-1",
        status: "sent",
        sentAt: "2026-05-21T10:00:00.000Z"
      }
    ],
    invoices: [
      {
        id: "invoice-1",
        status: "paid",
        balanceDueAmount: "0",
        latestPaymentEventType: "payment_succeeded",
        latestPaymentEventAt: "2026-05-22T10:00:00.000Z"
      }
    ],
    sharedEvidence: [
      {
        grantId: "grant-1",
        title: "Closeout photo",
        sourceCategory: "Project photo",
        sharedAt: "2026-05-23T10:00:00.000Z",
        href: "/portal/projects/project-1/evidence/grant-1/download"
      }
    ]
  });

  assert.deepEqual(
    timeline.timelineItems.map((item) => item.source),
    ["evidence", "invoice", "change_order", "contract", "estimate", "project"]
  );
});

void test("project timeline includes only explicitly portal-shared evidence", () => {
  const timeline = derivePortalProjectTimeline({
    sharedEvidence: [
      {
        key: "execution-attachment:attachment-1",
        grantId: "grant-1",
        title: "Finished floor photo",
        sourceCategory: "Project photo",
        sharedAt: "2026-05-24T10:00:00.000Z",
        href: "/portal/projects/project-1/evidence/grant-1/download",
        deliveryProof: {
          acknowledgedAt: "2026-05-24T11:00:00.000Z",
          statusLabel: "Acknowledged"
        }
      }
    ]
  });

  assert.equal(timeline.timelineItems[0]?.label, "Project evidence shared");
  assert.equal(timeline.timelineItems[0]?.source, "evidence");
  assert.equal(timeline.timelineItems[0]?.tone, "complete");
  assert.equal(
    timeline.timelineItems[0]?.href,
    "/portal/projects/project-1/evidence/grant-1/download"
  );
  assert.match(
    timeline.timelineItems[0]?.description ?? "",
    /explicitly shared in this portal/
  );
});

void test("project timeline returns safe empty state for empty data", () => {
  const timeline = derivePortalProjectTimeline({});

  assert.equal(timeline.timelineItems.length, 0);
  assert.match(timeline.emptyStateMessage, /No timeline activity yet/);
});

void test("project timeline ignores unexpected internal-only fields", () => {
  const timeline = derivePortalProjectTimeline({
    project: {
      id: "project-1",
      name: "Shop floor",
      status: "active",
      createdAt: "2026-05-18T10:00:00.000Z",
      jobNotes: [
        {
          body: "Internal job note"
        }
      ],
      proofEvidence: [
        {
          label: "Internal proof item"
        }
      ],
      sharedEvidence: [
        {
          title: "Unshared crew photo"
        }
      ]
    } as never
  });
  const renderedText = timeline.timelineItems
    .map((item) => `${item.label} ${item.description}`)
    .join(" ");

  assert.equal(timeline.timelineItems.length, 1);
  assert.doesNotMatch(
    renderedText,
    /Job Notes|Proof Center|internal proof|crew photo/i
  );
});

void test("project timeline uses deterministic customer-safe appointment labels", () => {
  const timeline = derivePortalProjectTimeline({
    appointments: [
      {
        id: "appointment-1",
        title: "Internal crew queue follow-up",
        appointmentType: "site_visit",
        status: "scheduled",
        updatedAt: "2026-05-25T10:00:00.000Z"
      }
    ]
  });

  const renderedText = timeline.timelineItems
    .map((item) => `${item.label} ${item.description}`)
    .join(" ");

  assert.equal(timeline.timelineItems[0]?.label, "Appointment shared");
  assert.match(renderedText, /site visit appointment/i);
  assert.doesNotMatch(renderedText, /internal|crew queue|follow-up/i);
});
