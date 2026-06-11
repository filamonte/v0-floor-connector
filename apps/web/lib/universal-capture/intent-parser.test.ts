import assert from "node:assert/strict";
import test from "node:test";

import {
  formatCaptureDateTimeForInput,
  parseUniversalCaptureIntent
} from "./intent-parser";

const referenceDate = new Date("2026-04-01T12:00:00");

void test("parses explicit site visit date and time without creating side effects", () => {
  const result = parseUniversalCaptureIntent(
    "set up onsite appointment for 4/10 at 5pm",
    {
      referenceDate,
      hasContext: true
    }
  );

  assert.equal(result.intentType, "site_visit");
  assert.equal(result.recommendedDestination, "appointment_quick_create");
  assert.equal(result.safeAction, "prefill_route");
  assert.equal(result.dateTime?.localDate, "2026-04-10");
  assert.equal(result.dateTime?.localTime, "17:00");
  assert.equal(
    formatCaptureDateTimeForInput(result.dateTime),
    "2026-04-10T17:00"
  );
  assert.deepEqual(result.requiredMissingFields, []);
  assert.equal(result.dateTime?.needsConfirmation, true);
});

void test("requires context before a site visit can be safely routed", () => {
  const result = parseUniversalCaptureIntent(
    "schedule site visit 2026-04-10 at 2pm",
    {
      referenceDate,
      hasContext: false
    }
  );

  assert.equal(result.intentType, "site_visit");
  assert.equal(result.dateTime?.localDate, "2026-04-10");
  assert.equal(result.dateTime?.localTime, "14:00");
  assert.ok(
    result.requiredMissingFields.includes(
      "Select a Sales Opportunity, customer, or project."
    )
  );
});

void test("parses relative site visit timing but marks confirmation required", () => {
  const result = parseUniversalCaptureIntent(
    "schedule site visit tomorrow at 2pm",
    {
      referenceDate,
      hasContext: true
    }
  );

  assert.equal(result.intentType, "site_visit");
  assert.equal(result.dateTime?.localDate, "2026-04-02");
  assert.equal(result.dateTime?.localTime, "14:00");
  assert.equal(result.dateTime?.needsConfirmation, true);
});

void test("recognizes follow-up task intent and keeps it on internal work items", () => {
  const result = parseUniversalCaptureIntent(
    "create follow-up task for next Tuesday",
    {
      referenceDate,
      hasContext: true
    }
  );

  assert.equal(result.intentType, "follow_up");
  assert.equal(result.recommendedDestination, "work_item");
  assert.equal(result.safeAction, "create_internal_work_item");
  assert.equal(result.dateTime?.localDate, "2026-04-07");
});

void test("contract intent routes only and requires approved estimate context", () => {
  const result = parseUniversalCaptureIntent(
    "customer approved estimate, create contract",
    {
      referenceDate,
      hasContext: true
    }
  );

  assert.equal(result.intentType, "contract");
  assert.equal(result.safeAction, "route_only");
  assert.ok(
    result.requiredMissingFields.includes(
      "Open an approved estimate before creating a contract."
    )
  );
});
