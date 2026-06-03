import assert from "node:assert/strict";
import test from "node:test";

import type { WorkItem } from "@floorconnector/types";

import { executionAttachmentSubjectTypeSchema } from "../execution-attachments/schemas";
import {
  buildContextRichWorkItemPreview,
  buildEstimateWorkQueue,
  canActOnAssignedWorkItem,
  filterDashboardWorkItems,
  getEstimateWorkItemType,
  getWorkItemCompletionNote,
  getWorkItemFieldState,
  groupMobileAssignedWorkItems,
  isEstimateWorkItem,
  selectAssignedWorkItems,
  selectBlockedWorkItems,
  selectDashboardWorkItemQueue,
  selectOpenWorkItemsByJob,
  selectOpenWorkItemsByProject,
  selectOverdueWorkItems
} from "./read-model";
import { workItemCreateSchema } from "./schemas";

const baseWorkItem = {
  id: "11111111-1111-4111-8111-111111111111",
  organizationId: "22222222-2222-4222-8222-222222222222",
  title: "Call back lead",
  description: null,
  status: "open",
  priority: "normal",
  kind: "manual",
  dueAt: null,
  assignedPersonId: null,
  sourceType: null,
  sourceId: null,
  customerId: null,
  projectId: null,
  linkPath: null,
  visibility: "internal",
  dedupeKey: null,
  metadata: {},
  createdByUserId: null,
  updatedByUserId: null,
  completedByUserId: null,
  completedAt: null,
  dismissedAt: null,
  createdAt: "2026-05-07T10:00:00.000Z",
  updatedAt: "2026-05-07T10:00:00.000Z"
} satisfies WorkItem;

void test("work item create schema accepts valid internal source-linked input", () => {
  const result = workItemCreateSchema.safeParse({
    title: "Confirm appointment details",
    description: "Review customer-visible notes before confirming.",
    priority: "high",
    kind: "appointment_confirmation_prep",
    dueAt: "2026-05-08T15:00:00.000Z",
    assignedPersonId: "33333333-3333-4333-8333-333333333333",
    sourceType: "appointment",
    sourceId: "44444444-4444-4444-8444-444444444444",
    customerId: "",
    projectId: "",
    linkPath: "/appointments/44444444-4444-4444-8444-444444444444",
    visibility: "internal",
    dedupeKey: "",
    metadata: { reason: "customer_visible_review" }
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.visibility, "internal");
    assert.equal(result.data.dueAt, "2026-05-08T15:00:00.000Z");
    assert.equal(result.data.customerId, null);
  }
});

void test("work item create schema accepts appointment follow-up source context", () => {
  const result = workItemCreateSchema.safeParse({
    title: "Follow up after no-show",
    description: "Call the customer and decide whether to reschedule.",
    priority: "normal",
    kind: "appointment_follow_up",
    dueAt: "",
    assignedPersonId: "",
    sourceType: "appointment",
    sourceId: "55555555-5555-4555-8555-555555555555",
    customerId: "66666666-6666-4666-8666-666666666666",
    projectId: "77777777-7777-4777-8777-777777777777",
    linkPath: "/appointments/55555555-5555-4555-8555-555555555555",
    visibility: "internal",
    metadata: {}
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.kind, "appointment_follow_up");
    assert.equal(result.data.sourceType, "appointment");
    assert.equal(result.data.dueAt, null);
  }
});

void test("work item create schema accepts context-rich assignment metadata", () => {
  const result = workItemCreateSchema.safeParse({
    title: "Inspect garage coating failure",
    description:
      "Confirm moisture issue, photograph cracks through the Daily Job Log, and check current coating failure.",
    priority: "urgent",
    kind: "manual",
    dueAt: "2026-05-08T15:00:00.000Z",
    assignedPersonId: "33333333-3333-4333-8333-333333333333",
    sourceType: "job",
    sourceId: "44444444-4444-4444-8444-444444444444",
    customerId: "66666666-6666-4666-8666-666666666666",
    projectId: "77777777-7777-4777-8777-777777777777",
    linkPath: "/jobs/44444444-4444-4444-8444-444444444444",
    visibility: "internal",
    metadata: {
      measurementNotes: "Measure west wall and capture crack lengths."
    }
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.sourceType, "job");
    assert.equal(result.data.visibility, "internal");
    assert.equal(
      result.data.metadata.measurementNotes,
      "Measure west wall and capture crack lengths."
    );
  }
});

void test("work item create schema accepts manual universal capture input without a source record", () => {
  const result = workItemCreateSchema.safeParse({
    title: "Call Sue Friday about garage coating",
    description:
      "Existing customer asked about new garage coating. Capture context first, then decide whether this becomes an opportunity or appointment.",
    priority: "normal",
    kind: "manual",
    dueAt: "2026-05-29T15:00:00.000Z",
    assignedPersonId: "",
    sourceType: null,
    sourceId: "",
    customerId: "",
    projectId: "",
    linkPath: "",
    visibility: "internal",
    dedupeKey: "",
    metadata: {
      captureSource: "manual_universal_capture",
      captureDestination: "work_item",
      captureVersion: 1
    }
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.sourceType, null);
    assert.equal(result.data.sourceId, null);
    assert.equal(result.data.customerId, null);
    assert.equal(result.data.projectId, null);
    assert.equal(result.data.linkPath, null);
    assert.equal(
      result.data.metadata.captureSource,
      "manual_universal_capture"
    );
  }
});

void test("execution attachment subject schema accepts Work Item evidence subjects", () => {
  assert.equal(
    executionAttachmentSubjectTypeSchema.safeParse("work_item").success,
    true
  );
});

void test("work item create schema rejects invalid constrained values", () => {
  const result = workItemCreateSchema.safeParse({
    title: "Bad work item",
    priority: "medium",
    kind: "automation_magic",
    dueAt: "",
    assignedPersonId: "",
    sourceType: "lead",
    sourceId: "",
    visibility: "customer_visible",
    metadata: {}
  });

  assert.equal(result.success, false);
});

void test("work item create schema requires source type and id together", () => {
  const result = workItemCreateSchema.safeParse({
    title: "Broken source",
    priority: "normal",
    kind: "manual",
    dueAt: "",
    assignedPersonId: "",
    sourceType: "opportunity",
    sourceId: "",
    visibility: "internal",
    metadata: {}
  });

  assert.equal(result.success, false);
});

void test("dashboard work item helper returns open assigned items in due order", () => {
  const workItems: WorkItem[] = [
    {
      ...baseWorkItem,
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      title: "Later urgent",
      priority: "urgent",
      dueAt: "2026-05-09T12:00:00.000Z",
      assignedPersonId: "person-1",
      createdAt: "2026-05-07T09:00:00.000Z"
    },
    {
      ...baseWorkItem,
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      title: "Soon normal",
      priority: "normal",
      dueAt: "2026-05-08T12:00:00.000Z",
      assignedPersonId: "person-1",
      createdAt: "2026-05-07T08:00:00.000Z"
    },
    {
      ...baseWorkItem,
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      title: "Other person's work",
      priority: "urgent",
      dueAt: "2026-05-07T12:00:00.000Z",
      assignedPersonId: "person-2"
    },
    {
      ...baseWorkItem,
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      title: "Completed work",
      status: "completed",
      priority: "urgent",
      dueAt: "2026-05-07T12:00:00.000Z",
      assignedPersonId: "person-1",
      completedByUserId: "user-1",
      completedAt: "2026-05-07T11:00:00.000Z"
    }
  ];

  const items = filterDashboardWorkItems({
    workItems,
    assignedPersonId: "person-1",
    limit: 5
  });

  assert.deepEqual(
    items.map((item) => item.title),
    ["Soon normal", "Later urgent"]
  );
});

void test("dashboard work item selector falls back to company items when assigned queue is empty", () => {
  const companyItem: WorkItem = {
    ...baseWorkItem,
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    title: "Company follow-up"
  };

  const selected = selectDashboardWorkItemQueue({
    assignedPersonId: "person-1",
    assignedItems: [],
    companyItems: [companyItem]
  });

  assert.equal(selected.mode, "company_fallback");
  assert.deepEqual(
    selected.items.map((item) => item.title),
    ["Company follow-up"]
  );
});

void test("dashboard work item selector prefers assigned items when available", () => {
  const assignedItem: WorkItem = {
    ...baseWorkItem,
    id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    title: "Assigned follow-up",
    assignedPersonId: "person-1"
  };
  const companyItem: WorkItem = {
    ...baseWorkItem,
    id: "99999999-9999-4999-8999-999999999999",
    title: "Company follow-up"
  };

  const selected = selectDashboardWorkItemQueue({
    assignedPersonId: "person-1",
    assignedItems: [assignedItem],
    companyItems: [companyItem]
  });

  assert.equal(selected.mode, "assigned");
  assert.deepEqual(
    selected.items.map((item) => item.title),
    ["Assigned follow-up"]
  );
});

void test("context-rich work item preview surfaces instructions measurements and due state", () => {
  const preview = buildContextRichWorkItemPreview(
    {
      ...baseWorkItem,
      title: "Inspect garage coating failure",
      description: "Confirm moisture issue and photograph cracks.",
      priority: "urgent",
      dueAt: "2026-05-08T12:00:00.000Z",
      assignedPersonId: "person-1",
      sourceType: "job",
      sourceId: "job-1",
      customerId: "customer-1",
      projectId: "project-1",
      metadata: {
        measurementNotes: "Measure west wall and note crack lengths."
      }
    },
    "2026-05-09T12:00:00.000Z"
  );

  assert.equal(
    preview.instructionsSummary,
    "Confirm moisture issue and photograph cracks."
  );
  assert.equal(
    preview.measurementNotes,
    "Measure west wall and note crack lengths."
  );
  assert.equal(preview.dueState, "overdue");
  assert.equal(preview.attachmentCount, null);
});

void test("estimate work queue groups source-linked estimate handoff items by metadata", () => {
  const workItems: WorkItem[] = [
    {
      ...baseWorkItem,
      id: "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
      title: "Generate estimate",
      kind: "estimate_follow_up",
      sourceType: "opportunity",
      sourceId: "opportunity-1",
      assignedPersonId: "person-1",
      dueAt: "2026-05-08T12:00:00.000Z",
      metadata: {
        estimateWork: true,
        estimateWorkType: "generate_estimate"
      }
    },
    {
      ...baseWorkItem,
      id: "b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2",
      title: "Review estimate",
      kind: "estimate_follow_up",
      sourceType: "estimate",
      sourceId: "estimate-1",
      assignedPersonId: "person-1",
      dueAt: "2026-05-09T12:00:00.000Z",
      metadata: {
        estimateWork: true,
        estimateWorkType: "review_estimate",
        estimateWorkStatus: "ready_for_review"
      }
    },
    {
      ...baseWorkItem,
      id: "c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3",
      title: "Request missing info",
      kind: "estimate_follow_up",
      sourceType: "opportunity",
      sourceId: "opportunity-1",
      assignedPersonId: "person-2",
      dueAt: "2026-05-07T12:00:00.000Z",
      metadata: {
        estimateWork: true,
        estimateWorkType: "request_missing_info",
        fieldState: "blocked",
        blockerReason: "Missing moisture reading."
      }
    },
    {
      ...baseWorkItem,
      id: "d4d4d4d4-d4d4-4d4d-8d4d-d4d4d4d4d4d4",
      title: "Follow up customer",
      kind: "estimate_follow_up",
      sourceType: "estimate",
      sourceId: "estimate-1",
      dueAt: "2026-05-06T12:00:00.000Z",
      metadata: {
        estimateWork: true,
        estimateWorkType: "follow_up_customer"
      }
    },
    {
      ...baseWorkItem,
      id: "e5e5e5e5-e5e5-4e5e-8e5e-e5e5e5e5e5e5",
      title: "Invoice follow-up",
      kind: "invoice_follow_up",
      sourceType: "invoice",
      sourceId: "invoice-1"
    }
  ];

  const queue = buildEstimateWorkQueue({
    workItems,
    currentPersonId: "person-1",
    nowIso: "2026-05-10T12:00:00.000Z"
  });

  assert.equal(getEstimateWorkItemType(workItems[0]), "generate_estimate");
  assert.equal(isEstimateWorkItem(workItems[4]), false);
  assert.deepEqual(
    queue.assigned.map((item) => item.title),
    ["Generate estimate", "Review estimate"]
  );
  assert.deepEqual(
    queue.waitingOnMe.map((item) => item.title),
    ["Generate estimate", "Review estimate"]
  );
  assert.deepEqual(
    queue.readyForReview.map((item) => item.title),
    ["Review estimate"]
  );
  assert.deepEqual(
    queue.blocked.map((item) => item.title),
    ["Request missing info"]
  );
  assert.deepEqual(
    queue.followUpsDue.map((item) => item.title),
    ["Follow up customer"]
  );
});

void test("work item read model filters by project job assignee overdue and blocked context", () => {
  const workItems: WorkItem[] = [
    {
      ...baseWorkItem,
      id: "12121212-1212-4121-8121-121212121212",
      title: "Project job item",
      dueAt: "2026-05-08T12:00:00.000Z",
      assignedPersonId: "person-1",
      sourceType: "job",
      sourceId: "job-1",
      projectId: "project-1"
    },
    {
      ...baseWorkItem,
      id: "23232323-2323-4232-8232-232323232323",
      title: "Blocked project item",
      dueAt: "2026-05-10T12:00:00.000Z",
      sourceType: "project",
      sourceId: "project-1",
      projectId: "project-1",
      metadata: {
        blockerReason: "Waiting on moisture reading."
      }
    },
    {
      ...baseWorkItem,
      id: "34343434-3434-4343-8343-343434343434",
      title: "Other project item",
      dueAt: "2026-05-07T12:00:00.000Z",
      assignedPersonId: "person-2",
      sourceType: "project",
      sourceId: "project-2",
      projectId: "project-2"
    },
    {
      ...baseWorkItem,
      id: "45454545-4545-4454-8454-454545454545",
      title: "Completed project item",
      status: "completed",
      dueAt: "2026-05-06T12:00:00.000Z",
      assignedPersonId: "person-1",
      sourceType: "job",
      sourceId: "job-1",
      projectId: "project-1"
    }
  ];

  assert.deepEqual(
    selectOpenWorkItemsByProject({ workItems, projectId: "project-1" }).map(
      (item) => item.title
    ),
    ["Project job item", "Blocked project item"]
  );
  assert.deepEqual(
    selectOpenWorkItemsByJob({ workItems, jobId: "job-1" }).map(
      (item) => item.title
    ),
    ["Project job item"]
  );
  assert.deepEqual(
    selectAssignedWorkItems({ workItems, assignedPersonId: "person-1" }).map(
      (item) => item.title
    ),
    ["Project job item"]
  );
  assert.deepEqual(
    selectOverdueWorkItems({
      workItems,
      nowIso: "2026-05-09T12:00:00.000Z"
    }).map((item) => item.title),
    ["Other project item", "Project job item"]
  );
  assert.deepEqual(
    selectBlockedWorkItems({ workItems }).map((item) => item.title),
    ["Blocked project item"]
  );
});

void test("mobile assigned work item helper groups blocked overdue today upcoming and completed items", () => {
  const workItems: WorkItem[] = [
    {
      ...baseWorkItem,
      id: "56565656-5656-4565-8565-565656565656",
      title: "Blocked item",
      dueAt: "2026-05-28T12:00:00.000Z",
      metadata: { fieldState: "blocked", blockerReason: "Need access." }
    },
    {
      ...baseWorkItem,
      id: "67676767-6767-4676-8676-676767676767",
      title: "Overdue item",
      dueAt: "2026-05-26T12:00:00.000Z"
    },
    {
      ...baseWorkItem,
      id: "78787878-7878-4787-8787-787878787878",
      title: "Today item",
      dueAt: "2026-05-27T18:00:00.000Z"
    },
    {
      ...baseWorkItem,
      id: "89898989-8989-4898-8898-898989898989",
      title: "Upcoming item",
      dueAt: "2026-05-29T12:00:00.000Z"
    },
    {
      ...baseWorkItem,
      id: "90909090-9090-4909-8909-909090909090",
      title: "Completed item",
      status: "completed",
      completedAt: "2026-05-27T11:00:00.000Z",
      metadata: { completionNote: "Measured west wall." }
    }
  ];

  const groups = groupMobileAssignedWorkItems({
    workItems,
    nowIso: "2026-05-27T12:00:00.000Z"
  });

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(groups).map(([key, items]) => [
        key,
        items.map((item) => item.title)
      ])
    ),
    {
      blocked: ["Blocked item"],
      overdue: ["Overdue item"],
      today: ["Today item"],
      upcoming: ["Upcoming item"],
      completed: ["Completed item"]
    }
  );
});

void test("mobile field state and completion helpers preserve assignment context metadata", () => {
  assert.equal(
    getWorkItemFieldState({
      ...baseWorkItem,
      metadata: { fieldState: "in_progress" }
    }),
    "in_progress"
  );
  assert.equal(
    getWorkItemFieldState({
      ...baseWorkItem,
      metadata: { blocked: true }
    }),
    "blocked"
  );
  assert.equal(
    getWorkItemFieldState({
      ...baseWorkItem,
      status: "completed",
      metadata: { fieldState: "in_progress" }
    }),
    "completed"
  );
  assert.equal(
    getWorkItemCompletionNote({
      ...baseWorkItem,
      metadata: { completionNote: "Photographed crack repair." }
    }),
    "Photographed crack repair."
  );
});

void test("assigned work item action policy allows assignee or elevated roles only", () => {
  const assignedWorkItem: WorkItem = {
    ...baseWorkItem,
    assignedPersonId: "person-1"
  };

  assert.equal(
    canActOnAssignedWorkItem({
      workItem: assignedWorkItem,
      currentPersonId: "person-1",
      membershipRole: "member"
    }),
    true
  );
  assert.equal(
    canActOnAssignedWorkItem({
      workItem: assignedWorkItem,
      currentPersonId: "person-2",
      membershipRole: "member"
    }),
    false
  );
  assert.equal(
    canActOnAssignedWorkItem({
      workItem: assignedWorkItem,
      currentPersonId: null,
      membershipRole: "manager"
    }),
    true
  );
});
