import assert from "node:assert/strict";
import test from "node:test";

import { buildAppointmentConfirmationPreview } from "./appointment-confirmation-preview";

void test("appointment confirmation preview includes customer-safe appointment fields", () => {
  const preview = buildAppointmentConfirmationPreview({
    title: "Site assessment",
    appointmentType: "site_visit",
    startsAt: "2026-05-08T14:00:00.000Z",
    endsAt: "2026-05-08T15:00:00.000Z",
    status: "scheduled",
    location: "Customer site",
    customerNotes: "Please meet us at the front office.",
    customerName: "Sam Customer",
    projectName: "Warehouse floor",
    organizationName: "FloorConnector QA"
  });

  assert.equal(preview.subject, "Appointment confirmation: Site assessment");
  assert.match(preview.body, /Hi Sam Customer/);
  assert.match(preview.body, /FloorConnector QA has confirmed your site visit appointment/);
  assert.match(preview.body, /Project: Warehouse floor/);
  assert.match(preview.body, /Status: scheduled/);
  assert.match(preview.body, /Location: Customer site/);
  assert.match(preview.body, /Notes: Please meet us at the front office/);
});

void test("appointment confirmation preview excludes internal and legacy appointment notes", () => {
  const preview = buildAppointmentConfirmationPreview({
    title: "Callback",
    appointmentType: "follow_up",
    startsAt: "2026-05-08T16:00:00.000Z",
    endsAt: null,
    status: "scheduled",
    location: null,
    customerNotes: "Customer-safe note.",
    customerName: null,
    projectName: null,
    organizationName: null
  });

  assert.match(preview.body, /Customer-safe note/);
  assert.doesNotMatch(preview.body, /internal/i);
  assert.doesNotMatch(preview.body, /legacy/i);
  assert.doesNotMatch(preview.body, /work item/i);
  assert.doesNotMatch(preview.body, /assignment/i);
});
