export type PortalAppointmentSafeRow = {
  id: string;
  company_id: string;
  customer_id: string | null;
  project_id: string | null;
  title: string;
  appointment_type: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  customer_notes: string | null;
  status: string;
  customer_visible?: boolean;
  created_at: string;
  updated_at: string;
  projects?:
    | {
        id: string;
        name: string;
      }
    | null;
};

export type PortalSafeAppointmentListItem = {
  id: string;
  organizationId: string;
  customerId: string | null;
  projectId: string | null;
  projectName: string | null;
  title: string;
  appointmentType: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  customerNotes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function mapPortalSafeAppointment(
  row: PortalAppointmentSafeRow
): PortalSafeAppointmentListItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    projectName: row.projects?.name ?? null,
    title: row.title,
    appointmentType: row.appointment_type,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    customerNotes: row.customer_notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function filterPortalProjectAppointmentRows(
  rows: PortalAppointmentSafeRow[],
  input: {
    projectId: string;
    accessibleProjectIds: string[];
  }
) {
  const accessibleProjectIds = new Set(input.accessibleProjectIds);

  return rows.filter(
    (row) =>
      row.customer_visible === true &&
      row.project_id === input.projectId &&
      accessibleProjectIds.has(row.project_id)
  );
}
