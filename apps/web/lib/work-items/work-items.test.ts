import assert from "node:assert/strict";
import test from "node:test";

import type { WorkItem } from "@floorconnector/types";

import {
  filterDashboardWorkItems,
  selectDashboardWorkItemQueue
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
