import assert from "node:assert/strict";
import test from "node:test";

import { getAppointmentConfirmationEligibility } from "./appointment-confirmation-eligibility";

void test("appointment confirmation eligibility identifies missing customer visibility", () => {
  const result = getAppointmentConfirmationEligibility({
    customerVisible: false,
    customerId: "customer-1",
    projectId: "project-1",
    startsAt: "2026-05-08T14:00:00.000Z",
    title: "Site assessment"
  });

  assert.equal(result.eligible, false);
  assert.deepEqual(result.blockers, ["Mark this appointment customer-visible."]);
});

void test("appointment confirmation eligibility identifies missing customer and project context", () => {
  const result = getAppointmentConfirmationEligibility({
    customerVisible: true,
    customerId: null,
    projectId: null,
    startsAt: "2026-05-08T14:00:00.000Z",
    title: "Site assessment"
  });

  assert.equal(result.eligible, false);
  assert.deepEqual(result.blockers, [
    "Link a customer to this appointment.",
    "Link a project to this appointment."
  ]);
});

void test("appointment confirmation eligibility accepts a customer-visible linked appointment", () => {
  const result = getAppointmentConfirmationEligibility({
    customerVisible: true,
    customerId: "customer-1",
    projectId: "project-1",
    startsAt: "2026-05-08T14:00:00.000Z",
    title: "Site assessment"
  });

  assert.equal(result.eligible, true);
  assert.deepEqual(result.blockers, []);
});
