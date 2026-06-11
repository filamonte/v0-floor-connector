import assert from "node:assert/strict";
import test from "node:test";

import { buildScheduleHref } from "./links";

void test("schedule links preserve calendar layout modes", () => {
  assert.equal(
    buildScheduleHref({
      layout: "day",
      date: "2026-05-08"
    }),
    "/schedule?layout=day&date=2026-05-08"
  );
  assert.equal(
    buildScheduleHref({
      layout: "crew",
      view: "scheduled",
      crew: "unassigned"
    }),
    "/schedule?view=scheduled&crew=unassigned&layout=crew"
  );
  assert.equal(
    buildScheduleHref({
      layout: "unscheduled",
      view: "unscheduled"
    }),
    "/schedule?view=unscheduled&layout=unscheduled"
  );
});
