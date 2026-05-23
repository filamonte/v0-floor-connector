import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDailyLogCaptureHref,
  buildDailyLogSectionHref,
  findDailyLogForJobDate,
  getDailyLogDateKey,
  isDailyLogDateKey
} from "./links";

void test("daily-log date helpers keep field capture links date-safe", () => {
  assert.equal(
    getDailyLogDateKey(new Date("2026-05-22T15:30:00.000Z")),
    "2026-05-22"
  );
  assert.equal(isDailyLogDateKey("2026-05-22"), true);
  assert.equal(isDailyLogDateKey("05/22/2026"), false);
  assert.equal(isDailyLogDateKey(undefined), false);
});

void test("buildDailyLogCaptureHref opens the existing quick-create sheet with context", () => {
  assert.equal(
    buildDailyLogCaptureHref({
      projectId: "project-1",
      jobId: "job-1",
      logDate: "2026-05-22"
    }),
    "/daily-logs?compose=1&projectId=project-1&jobId=job-1&logDate=2026-05-22#daily-log-create"
  );

  assert.equal(
    buildDailyLogCaptureHref({
      projectId: "project-1",
      logDate: "not-a-date"
    }),
    "/daily-logs?compose=1&projectId=project-1#daily-log-create"
  );
});

void test("buildDailyLogSectionHref points to specific Daily Job Log capture areas", () => {
  assert.equal(
    buildDailyLogSectionHref("log-1", "job-notes"),
    "/daily-logs/log-1#job-notes"
  );
  assert.equal(
    buildDailyLogSectionHref("log-1", "field-evidence"),
    "/daily-logs/log-1#field-evidence"
  );
});

void test("findDailyLogForJobDate selects an existing job-day log without creating duplicates", () => {
  const dailyLogs = [
    { id: "log-1", jobId: "job-1", logDate: "2026-05-21" },
    { id: "log-2", jobId: "job-1", logDate: "2026-05-22" },
    { id: "log-3", jobId: null, logDate: "2026-05-22" }
  ];

  assert.equal(
    findDailyLogForJobDate(dailyLogs, {
      jobId: "job-1",
      logDate: "2026-05-22"
    })?.id,
    "log-2"
  );
  assert.equal(
    findDailyLogForJobDate(dailyLogs, {
      jobId: "job-2",
      logDate: "2026-05-22"
    }),
    null
  );
});
