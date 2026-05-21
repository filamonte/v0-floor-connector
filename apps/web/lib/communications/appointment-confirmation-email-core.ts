export type AppointmentConfirmationEmailRecipientSource =
  | "portal_access"
  | "customer_contact"
  | "customer";

export type AppointmentConfirmationEmailRecipient = {
  key: string;
  email: string;
  displayName: string | null;
  source: AppointmentConfirmationEmailRecipientSource;
  portalUserId: string | null;
  portalAccessGrantId: string | null;
  customerContactId: string | null;
  contactDisplayName: string | null;
  isPrimaryContact: boolean;
};

export type AppointmentConfirmationEmailRecipientCandidate = Omit<
  AppointmentConfirmationEmailRecipient,
  "key" | "email"
> & {
  email: string | null | undefined;
};

export function normalizeEmail(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase() ?? "";

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function dedupeAppointmentConfirmationEmailRecipients(
  candidates: AppointmentConfirmationEmailRecipientCandidate[]
): AppointmentConfirmationEmailRecipient[] {
  const recipients: AppointmentConfirmationEmailRecipient[] = [];
  const seenEmails = new Set<string>();

  for (const candidate of candidates) {
    const email = normalizeEmail(candidate.email);

    if (!email || seenEmails.has(email)) {
      continue;
    }

    seenEmails.add(email);
    recipients.push({
      ...candidate,
      key: `${candidate.source}:${email}`,
      email
    });
  }

  return recipients;
}

export function selectAppointmentConfirmationEmailRecipient(input: {
  recipients: AppointmentConfirmationEmailRecipient[];
  selectedEmail?: string | null;
}) {
  if (input.recipients.length === 0) {
    throw new Error("Add a customer email or active portal contact before sending this confirmation.");
  }

  const selectedEmail = normalizeEmail(input.selectedEmail);

  if (selectedEmail) {
    const selectedRecipient =
      input.recipients.find((recipient) => recipient.email === selectedEmail) ?? null;

    if (!selectedRecipient) {
      throw new Error("Select a recipient that belongs to this appointment customer/project context.");
    }

    return selectedRecipient;
  }

  return (
    input.recipients.find((recipient) => recipient.source === "portal_access" && recipient.isPrimaryContact) ??
    input.recipients.find((recipient) => recipient.source === "portal_access") ??
    input.recipients.find((recipient) => recipient.isPrimaryContact) ??
    input.recipients[0]
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildAppointmentConfirmationEmailContent(input: {
  subject: string;
  body: string;
}) {
  const lines = input.body.split(/\r?\n/);
  const htmlBody = lines
    .map((line) =>
      line.trim()
        ? `<p>${escapeHtml(line)}</p>`
        : "<br />"
    )
    .join("\n");

  return {
    subject: input.subject.trim(),
    textBody: input.body.trim(),
    htmlBody
  };
}
