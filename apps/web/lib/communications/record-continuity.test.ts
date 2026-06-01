import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRecordCommunicationContinuityItems,
  buildRecordCommunicationHref,
  deriveRecordCommunicationContinuitySummary,
  filterRecordCommunicationContinuityThreads,
  filterProjectCommunicationContinuityThreads,
  type RecordCommunicationContinuityThread
} from "./record-continuity";

function buildThread(
  overrides: Partial<RecordCommunicationContinuityThread> = {}
): RecordCommunicationContinuityThread {
  return {
    id: overrides.id ?? "thread-1",
    organizationId: overrides.organizationId ?? "org-1",
    projectId: Object.prototype.hasOwnProperty.call(overrides, "projectId")
      ? (overrides.projectId ?? null)
      : "project-1",
    subjectType: overrides.subjectType ?? "project",
    subjectId: overrides.subjectId ?? "project-1",
    lastMessageAt: overrides.lastMessageAt ?? "2026-05-27T15:00:00.000Z",
    lastMessagePreview:
      overrides.lastMessagePreview ?? "Customer asked about closeout timing.",
    lastMessageVisibility:
      overrides.lastMessageVisibility ?? "customer_visible",
    threadStatus: overrides.threadStatus ?? "open",
    updatedAt: overrides.updatedAt ?? "2026-05-27T15:30:00.000Z"
  };
}

void test("project communication continuity keeps only threads linked to the project", () => {
  const projectThreads = filterProjectCommunicationContinuityThreads({
    projectId: "project-1",
    threads: [
      buildThread({ id: "project-thread", projectId: "project-1" }),
      buildThread({
        id: "invoice-thread",
        projectId: "project-1",
        subjectType: "invoice"
      }),
      buildThread({ id: "other-project-thread", projectId: "project-2" }),
      buildThread({ id: "customer-only-thread", projectId: null })
    ]
  });

  assert.deepEqual(
    projectThreads.map((thread) => thread.id),
    ["project-thread", "invoice-thread"]
  );
});

void test("record communication continuity preserves subject type for deep links", () => {
  const summary = deriveRecordCommunicationContinuitySummary({
    source: "project",
    threads: [
      buildThread({
        id: "invoice-thread",
        subjectType: "invoice",
        lastMessageAt: "2026-05-28T13:00:00.000Z",
        updatedAt: "2026-05-28T13:30:00.000Z"
      }),
      buildThread({
        id: "project-thread",
        subjectType: "project",
        lastMessageAt: null,
        updatedAt: "2026-05-28T14:00:00.000Z"
      })
    ]
  });

  assert.equal(summary.threadCount, 2);
  assert.equal(summary.latestThread?.id, "invoice-thread");
  assert.equal(
    summary.communicationsHref,
    "/communications?source=invoice&threadId=invoice-thread"
  );
});

void test("record communication continuity derives deterministic counts without inventing boundary state", () => {
  const summary = deriveRecordCommunicationContinuitySummary({
    source: "project",
    threads: [
      buildThread({
        id: "customer-visible-thread",
        lastMessageVisibility: "customer_visible",
        threadStatus: "open"
      }),
      buildThread({
        id: "internal-thread",
        lastMessageVisibility: "internal",
        threadStatus: "closed"
      }),
      buildThread({
        id: "closed-customer-visible-thread",
        lastMessageVisibility: "customer_visible",
        threadStatus: "waiting_on_contractor"
      })
    ]
  });

  assert.equal(summary.customerVisibleCount, 2);
  assert.equal(summary.internalCount, 1);
  assert.equal(summary.openCount, 1);
  assert.equal(summary.threadCount, 3);
});

void test("record communication continuity zero-state links to the source queue only", () => {
  const summary = deriveRecordCommunicationContinuitySummary({
    source: "project",
    threads: []
  });

  assert.equal(summary.threadCount, 0);
  assert.equal(summary.latestThread, null);
  assert.equal(summary.latestActivityAt, null);
  assert.equal(summary.latestPreview, "No preview stored yet.");
  assert.equal(summary.communicationsHref, "/communications?source=project");
});

void test("record communication continuity filters to the exact customer and tenant", () => {
  const threads = filterRecordCommunicationContinuityThreads({
    target: {
      organizationId: "org-1",
      source: "customer",
      subjectId: "customer-1"
    },
    threads: [
      buildThread({
        id: "matching-customer-thread",
        organizationId: "org-1",
        subjectType: "customer",
        subjectId: "customer-1",
        projectId: null
      }),
      buildThread({
        id: "other-customer-thread",
        organizationId: "org-1",
        subjectType: "customer",
        subjectId: "customer-2",
        projectId: null
      }),
      buildThread({
        id: "other-tenant-thread",
        organizationId: "org-2",
        subjectType: "customer",
        subjectId: "customer-1",
        projectId: null
      })
    ]
  });

  assert.deepEqual(
    threads.map((thread) => thread.id),
    ["matching-customer-thread"]
  );
});

void test("record communication continuity supports invoice and contract subjects only when linked", () => {
  const invoiceThreads = filterRecordCommunicationContinuityThreads({
    target: {
      organizationId: "org-1",
      source: "invoice",
      subjectId: "invoice-1"
    },
    threads: [
      buildThread({
        id: "invoice-thread",
        subjectType: "invoice",
        subjectId: "invoice-1"
      }),
      buildThread({
        id: "contract-thread",
        subjectType: "contract",
        subjectId: "contract-1"
      })
    ]
  });
  const contractThreads = filterRecordCommunicationContinuityThreads({
    target: {
      organizationId: "org-1",
      source: "contract",
      subjectId: "contract-1"
    },
    threads: [
      buildThread({
        id: "invoice-thread",
        subjectType: "invoice",
        subjectId: "invoice-1"
      }),
      buildThread({
        id: "contract-thread",
        subjectType: "contract",
        subjectId: "contract-1"
      })
    ]
  });

  assert.deepEqual(
    invoiceThreads.map((thread) => thread.id),
    ["invoice-thread"]
  );
  assert.deepEqual(
    contractThreads.map((thread) => thread.id),
    ["contract-thread"]
  );
});

void test("record communication continuity item list exposes recent snippets and status signals", () => {
  const items = buildRecordCommunicationContinuityItems([
    buildThread({
      id: "older-thread",
      subjectType: "project",
      subjectId: "project-1",
      lastMessageAt: "2026-05-27T15:00:00.000Z",
      lastMessageVisibility: "internal",
      threadStatus: "open"
    }),
    buildThread({
      id: "needs-response-thread",
      subjectType: "invoice",
      subjectId: "invoice-1",
      lastMessageAt: "2026-05-28T15:00:00.000Z",
      lastMessagePreview: "The customer replied from the portal.",
      lastMessageVisibility: "customer_visible",
      threadStatus: "waiting_on_contractor"
    })
  ]);

  assert.equal(items[0]?.id, "needs-response-thread");
  assert.equal(items[0]?.sourceLabel, "invoice");
  assert.equal(items[0]?.statusLabel, "Needs response");
  assert.equal(items[0]?.boundaryLabel, "Customer-visible");
  assert.equal(items[0]?.snippet, "The customer replied from the portal.");
  assert.equal(
    items[0]?.href,
    "/communications?source=invoice&threadId=needs-response-thread"
  );
});

void test("record communication href does not imply unsupported job subjects", () => {
  assert.equal(
    buildRecordCommunicationHref({ source: "project", threadId: "thread-1" }),
    "/communications?source=project&threadId=thread-1"
  );
});
