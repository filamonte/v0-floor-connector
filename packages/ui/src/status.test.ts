import assert from "node:assert/strict";
import test from "node:test";

import {
  getEmptyStateCopy,
  getReadinessBadgeClassName,
  getReadinessTone,
  getStatusTone,
  normalizeStatusLabel,
  readinessToneClasses,
  statusToneClasses
} from "./index";

void test("status mapping keeps common workflow states semantic", () => {
  assert.equal(getStatusTone("draft"), "neutral");
  assert.equal(getStatusTone("sent"), "warning");
  assert.equal(getStatusTone("viewed"), "info");
  assert.equal(getStatusTone("approved"), "success");
  assert.equal(getStatusTone("rejected"), "danger");
  assert.equal(getStatusTone("signed"), "success");
  assert.equal(getStatusTone("void"), "danger");
  assert.equal(getStatusTone("paid"), "success");
  assert.equal(getStatusTone("partially paid"), "warning");
  assert.equal(getStatusTone("overdue"), "danger");
  assert.equal(getStatusTone("ready"), "success");
  assert.equal(getStatusTone("blocked"), "danger");
  assert.equal(getStatusTone("scheduled"), "info");
  assert.equal(getStatusTone("in progress"), "info");
  assert.equal(getStatusTone("completed"), "success");
  assert.equal(getStatusTone("needs attention"), "warning");
});

void test("readiness mapping separates financial and production lanes without changing calculations", () => {
  assert.equal(getReadinessTone("financial readiness"), "financial");
  assert.equal(getReadinessTone("payment required"), "financial");
  assert.equal(getReadinessTone("schedule readiness"), "production");
  assert.equal(getReadinessTone("field dispatch"), "production");
  assert.equal(getReadinessTone("ready"), "ready");
  assert.equal(getReadinessTone("needs attention"), "attention");
  assert.equal(getReadinessTone("blocked"), "blocked");
  assert.equal(getReadinessTone("current"), "informational");
  assert.equal(getReadinessTone("draft"), "neutral");
});

void test("badge class helpers resolve through the governed tone maps", () => {
  assert.equal(getReadinessBadgeClassName("ready"), readinessToneClasses.ready);
  assert.equal(
    getReadinessBadgeClassName("payment failed"),
    readinessToneClasses.blocked
  );
  assert.equal(
    getReadinessBadgeClassName("scheduled"),
    readinessToneClasses.production
  );
  assert.equal(
    statusToneClasses.success,
    statusToneClasses[getStatusTone("paid")]
  );
});

void test("empty-state copy variants keep canonical handoff language", () => {
  assert.match(getEmptyStateCopy("noRecords").description, /canonical record/);
  assert.match(
    getEmptyStateCopy("waitingOnPayment").description,
    /invoice and payment records/
  );
  assert.match(
    getEmptyStateCopy("readyNotScheduled").description,
    /schedule or job workspace/
  );
});

void test("status labels normalize route-local formatting", () => {
  assert.equal(normalizeStatusLabel("Partially-Paid"), "partially_paid");
  assert.equal(normalizeStatusLabel("ready to schedule"), "ready to schedule");
});
