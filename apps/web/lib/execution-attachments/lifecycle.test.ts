import assert from "node:assert/strict";
import test from "node:test";

import {
  filterActiveExecutionAttachments,
  isExecutionAttachmentArchived,
  partitionExecutionAttachmentsByArchiveState
} from "./lifecycle";

const attachments = [
  { id: "active-1", archivedAt: null },
  { id: "archived-1", archivedAt: "2026-05-24T19:00:00.000Z" },
  { id: "active-2", archivedAt: null }
];

void test("isExecutionAttachmentArchived treats archived_at as the lifecycle signal", () => {
  assert.equal(isExecutionAttachmentArchived(attachments[0]), false);
  assert.equal(isExecutionAttachmentArchived(attachments[1]), true);
});

void test("filterActiveExecutionAttachments keeps active proof rows only", () => {
  assert.deepEqual(
    filterActiveExecutionAttachments(attachments).map(
      (attachment) => attachment.id
    ),
    ["active-1", "active-2"]
  );
});

void test("partitionExecutionAttachmentsByArchiveState separates active and archived rows", () => {
  const partitioned = partitionExecutionAttachmentsByArchiveState(attachments);

  assert.deepEqual(
    partitioned.active.map((attachment) => attachment.id),
    ["active-1", "active-2"]
  );
  assert.deepEqual(
    partitioned.archived.map((attachment) => attachment.id),
    ["archived-1"]
  );
});
