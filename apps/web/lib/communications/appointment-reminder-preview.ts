export type AppointmentReminderPreviewInput = {
  title: string;
  appointmentType: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  customerNotes: string | null;
  customerName?: string | null;
  projectName?: string | null;
  organizationName?: string | null;
};

export type AppointmentReminderPreview = {
  subject: string;
  body: string;
};

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function compactLines(lines: Array<string | null | undefined>) {
  return lines
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export function buildAppointmentReminderPreview(
  input: AppointmentReminderPreviewInput
): AppointmentReminderPreview {
  const appointmentLabel = labelize(input.appointmentType);
  const organizationName = input.organizationName?.trim() || "your contractor";
  const startsAt = formatDateTime(input.startsAt);
  const endsAt = input.endsAt ? formatDateTime(input.endsAt) : null;
  const subject = `Appointment reminder: ${input.title}`;
  const body = compactLines([
    `Hi${input.customerName ? ` ${input.customerName}` : ""},`,
    "",
    `This is a reminder for your ${appointmentLabel} appointment with ${organizationName}.`,
    `Appointment: ${input.title}`,
    input.projectName ? `Project: ${input.projectName}` : null,
    endsAt ? `Time: ${startsAt} - ${endsAt}` : `Time: ${startsAt}`,
    input.location ? `Location: ${input.location}` : null,
    input.customerNotes ? `Notes: ${input.customerNotes}` : null
  ]);

  return {
    subject,
    body
  };
}
