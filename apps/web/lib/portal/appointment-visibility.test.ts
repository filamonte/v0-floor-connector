import assert from "node:assert/strict";
import test from "node:test";

import {
  filterPortalProjectAppointmentRows,
  mapPortalSafeAppointment,
  type PortalAppointmentSafeRow
} from "./appointment-visibility";

const baseAppointmentRow = {
  id: "11111111-1111-4111-8111-111111111111",
  company_id: "22222222-2222-4222-8222-222222222222",
  customer_id: "33333333-3333-4333-8333-333333333333",
  project_id: "44444444-4444-4444-8444-444444444444",
  title: "Site assessment",
  appointment_type: "site_assessment",
  starts_at: "2026-05-08T14:00:00.000Z",
  ends_at: "2026-05-08T15:00:00.000Z",
  location: "Customer site",
  customer_notes: "Please meet us at the front office.",
  status: "scheduled",
  customer_visible: true,
  created_at: "2026-05-01T12:00:00.000Z",
  updated_at: "2026-05-01T12:00:00.000Z",
  projects: {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Warehouse floor"
  }
} satisfies PortalAppointmentSafeRow;

void test("portal appointment filter keeps customer-visible appointments for accessible projects", () => {
  const rows = filterPortalProjectAppointmentRows([baseAppointmentRow], {
    projectId: baseAppointmentRow.project_id,
    accessibleProjectIds: [baseAppointmentRow.project_id]
  });

  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, baseAppointmentRow.id);
});

void test("portal appointment filter excludes hidden and inaccessible appointments", () => {
  const rows = filterPortalProjectAppointmentRows(
    [
      {
        ...baseAppointmentRow,
        id: "55555555-5555-4555-8555-555555555555",
        customer_visible: false
      },
      {
        ...baseAppointmentRow,
        id: "66666666-6666-4666-8666-666666666666",
        project_id: "77777777-7777-4777-8777-777777777777"
      }
    ],
    {
      projectId: baseAppointmentRow.project_id,
      accessibleProjectIds: [baseAppointmentRow.project_id]
    }
  );

  assert.equal(rows.length, 0);
});

void test("portal appointment mapper exposes only customer-safe fields", () => {
  const mapped = mapPortalSafeAppointment({
    ...baseAppointmentRow,
    notes: "Legacy contractor note",
    internal_notes: "Bring moisture meter",
    assigned_person_id: "88888888-8888-4888-8888-888888888888"
  } as PortalAppointmentSafeRow);

  assert.equal(mapped.customerNotes, baseAppointmentRow.customer_notes);
  assert.equal(mapped.projectName, "Warehouse floor");
  assert.equal("notes" in mapped, false);
  assert.equal("internalNotes" in mapped, false);
  assert.equal("internal_notes" in mapped, false);
  assert.equal("assignedPersonId" in mapped, false);
  assert.equal("assigned_person_id" in mapped, false);
});
