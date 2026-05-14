import assert from "node:assert/strict";
import test from "node:test";

import { deleteEstimateGroupDraft } from "./group-draft";

void test("deleteEstimateGroupDraft removes the group and safely unassigns its line items", () => {
  const result = deleteEstimateGroupDraft({
    groupId: "group-2",
    groups: [
      { id: "group-1", label: "Prep", sortOrder: 0 },
      { id: "group-2", label: "Garage", sortOrder: 1 },
      { id: "group-3", label: "Topcoat", sortOrder: 2 }
    ],
    lineItems: [
      { rowKey: "row-1", groupId: "group-2", name: "Broadcast flake" },
      { rowKey: "row-2", groupId: "group-1", name: "Surface prep" }
    ]
  });

  assert.deepEqual(
    result.groups.map((group) => ({
      id: group.id,
      sortOrder: group.sortOrder
    })),
    [
      { id: "group-1", sortOrder: 0 },
      { id: "group-3", sortOrder: 1 }
    ]
  );
  assert.equal(result.lineItems[0]?.groupId, null);
  assert.equal(result.lineItems[1]?.groupId, "group-1");
});
