import assert from "node:assert/strict";
import test from "node:test";

import { getGoldenWorkflowRouteMap } from "./golden-workflow-route-map";

void test("golden workflow route map preserves the approved lead-to-reports order", () => {
  const stages = getGoldenWorkflowRouteMap().map((item) => item.id);

  assert.deepEqual(stages, [
    "lead-opportunity",
    "project",
    "estimate",
    "contract",
    "readiness",
    "schedule",
    "field",
    "closeout",
    "invoice",
    "payment",
    "reports"
  ]);
});

void test("golden workflow route map routes action to owning workspaces", () => {
  const routeMap = getGoldenWorkflowRouteMap();
  const reportsStage = routeMap.at(-1);
  const actionStages = routeMap.filter((item) => item.id !== "reports");

  assert.equal(reportsStage?.owner, "Reports");
  assert.match(
    reportsStage?.handoff ?? "",
    /Summarize portfolio pressure and route back/
  );
  assert.ok(actionStages.every((item) => item.href !== "/reports"));
});
