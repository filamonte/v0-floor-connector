import "server-only";

import type {
  Appointment,
  CommunicationPreference,
  CommunicationMessage,
  CommunicationPreferenceStatus,
  NotificationDeliveryStatus
} from "@floorconnector/types";

import { getAppointmentById } from "@/lib/appointments/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  createNotificationEvent,
  sendTrackedNotificationEmail
} from "@/lib/notifications/system";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import {
  filterAppointmentReminderEmailRecipientsByPreference,
  getAppointmentReminderReadinessBlockers,
  isSuccessfulAppointmentReminderDeliveryStatus,
  type AppointmentReminderPreferenceSnapshot
} from "./appointment-reminder-core";
import {
  buildAppointmentReminderPreview,
  type AppointmentReminderPreview
} from "./appointment-reminder-preview";
import {
  buildAppointmentConfirmationEmailContent,
  selectAppointmentConfirmationEmailRecipient,
  type AppointmentConfirmationEmailRecipient
} from "./appointment-confirmation-email-core";
import {
  getOrCreateAppointmentCommunicationThread,
  listAppointmentCommunicationMessages,
  resolveAppointmentConfirmationEmailRecipients
} from "./appointment-confirmations";
import { listCommunicationPreferencesForContext } from "./communication-preferences";
import { postCommunicationMessage } from "./data";

export type AppointmentReminderEmailRecipient =
  AppointmentConfirmationEmailRecipient & {
    preferenceStatus: CommunicationPreferenceStatus | "default_allowed";
  };

export type AppointmentReminderReadiness = {
  appointmentId: string;
  ready: boolean;
  blockers: string[];
  recipients: AppointmentReminderEmailRecipient[];
  preview: AppointmentReminderPreview | null;
};

export type AppointmentReminderEmailSendInput = {
  appointmentId: string;
  recipientEmail?: string | null;
  communicationMessageId?: string | null;
  body?: string | null;
};

export type AppointmentReminderEmailDelivery = {
  id: string;
  communicationMessageId: string;
  notificationEventId: string;
  status: NotificationDeliveryStatus;
  provider: string | null;
  recipientEmail: string | null;
  providerMessageId: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AppointmentReminderEmailDeliveryRow = {
  id: string;
  communication_message_id: string | null;
  notification_event_id: string;
  status: NotificationDeliveryStatus;
  provider: string | null;
  recipient_email: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
};

function getOrganizationDisplayName(
  organizationContext: Awaited<ReturnType<typeof getActiveOrganizationContext>>
) {
  return (
    organizationContext?.organization.displayName?.trim() ||
    organizationContext?.organization.legalName?.trim() ||
    "your contractor"
  );
}

function preferenceStatusForRecipient(input: {
  recipient: AppointmentConfirmationEmailRecipient;
  customerId: string;
  preferences: CommunicationPreference[];
}): CommunicationPreferenceStatus | "default_allowed" {
  const customerPreference =
    input.preferences.find(
      (preference) =>
        preference.subjectType === "customer" &&
        preference.subjectId === input.customerId
    ) ?? null;
  const contactPreference =
    input.recipient.customerContactId
      ? input.preferences.find(
          (preference) =>
            preference.subjectType === "customer_contact" &&
            preference.subjectId === input.recipient.customerContactId
        ) ?? null
      : null;

  return contactPreference?.status ?? customerPreference?.status ?? "default_allowed";
}

function toPreferenceSnapshots(
  preferences: CommunicationPreference[]
): AppointmentReminderPreferenceSnapshot[] {
  return preferences.map((preference) => ({
    subjectType: preference.subjectType,
    subjectId: preference.subjectId,
    status: preference.status
  }));
}

function canAttemptRecipientResolution(appointment: Appointment) {
  return (
    appointment.customerVisible &&
    Boolean(appointment.customerId) &&
    Boolean(appointment.projectId) &&
    !["canceled", "completed", "no_show"].includes(appointment.status)
  );
}

async function loadReminderPreferences(input: {
  appointment: Appointment;
  recipients: AppointmentConfirmationEmailRecipient[];
  next: string;
}) {
  if (!input.appointment.customerId) {
    return [];
  }

  return listCommunicationPreferencesForContext({
    subjectIds: [
      {
        subjectType: "customer",
        subjectId: input.appointment.customerId
      },
      ...input.recipients.map((recipient) => ({
        subjectType: "customer_contact" as const,
        subjectId: recipient.customerContactId
      }))
    ],
    channel: "email",
    messageCategory: "appointment_reminder",
    next: input.next
  });
}

export async function resolveAppointmentReminderEmailRecipients(
  appointmentId: string,
  next = "/appointments"
): Promise<AppointmentReminderEmailRecipient[]> {
  const appointment = await getAppointmentById(appointmentId, next);

  if (!appointment || !canAttemptRecipientResolution(appointment) || !appointment.customerId) {
    return [];
  }

  const candidates = await resolveAppointmentConfirmationEmailRecipients(appointment.id, next);
  const preferences = await loadReminderPreferences({
    appointment,
    recipients: candidates,
    next
  });
  const filteredRecipients = filterAppointmentReminderEmailRecipientsByPreference({
    customerId: appointment.customerId,
    recipients: candidates,
    preferences: toPreferenceSnapshots(preferences)
  });

  return filteredRecipients.map((recipient) => ({
    ...recipient,
    preferenceStatus: preferenceStatusForRecipient({
      recipient,
      customerId: appointment.customerId as string,
      preferences
    })
  }));
}

export async function buildAppointmentCustomerReminderPreview(
  appointmentId: string,
  next = "/appointments"
): Promise<AppointmentReminderPreview> {
  const appointment = await getAppointmentById(appointmentId, next);

  if (!appointment) {
    throw new Error("Appointment not found for this organization.");
  }

  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  return buildAppointmentReminderPreview({
    title: appointment.title,
    appointmentType: appointment.appointmentType,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
    location: appointment.location,
    customerNotes: appointment.customerNotes,
    customerName: appointment.customer?.name ?? null,
    projectName: appointment.project?.name ?? null,
    organizationName: getOrganizationDisplayName(organizationContext)
  });
}

export async function getAppointmentReminderReadiness(
  appointmentId: string,
  next = "/appointments"
): Promise<AppointmentReminderReadiness> {
  const appointment = await getAppointmentById(appointmentId, next);

  if (!appointment) {
    throw new Error("Appointment not found for this organization.");
  }

  const recipients = await resolveAppointmentReminderEmailRecipients(appointment.id, next);
  const blockers = getAppointmentReminderReadinessBlockers({
    customerVisible: appointment.customerVisible,
    customerId: appointment.customerId,
    projectId: appointment.projectId,
    startsAt: appointment.startsAt,
    status: appointment.status,
    eligibleRecipientCount: recipients.length
  });
  const preview =
    blockers.length === 0
      ? await buildAppointmentCustomerReminderPreview(appointment.id, next)
      : null;

  return {
    appointmentId: appointment.id,
    ready: blockers.length === 0,
    blockers,
    recipients,
    preview
  };
}

export async function listAppointmentReminderLogs(
  appointmentId: string,
  next = "/appointments"
): Promise<CommunicationMessage[]> {
  const messages = await listAppointmentCommunicationMessages(appointmentId, next);

  return messages
    .filter((message) => message.messageKind === "appointment_reminder")
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function createAppointmentReminderLog(
  input: {
    appointmentId: string;
    body?: string | null;
  },
  next = "/appointments"
) {
  const readiness = await getAppointmentReminderReadiness(input.appointmentId, next);

  if (!readiness.ready || !readiness.preview) {
    throw new Error(
      readiness.blockers.length > 0
        ? `Appointment reminder is not ready: ${readiness.blockers.join(" ")}`
        : "Appointment reminder is not ready."
    );
  }

  const body = input.body?.trim() || readiness.preview.body;

  if (body.length === 0) {
    throw new Error("Appointment reminder content cannot be empty.");
  }

  const appointment = await getAppointmentById(input.appointmentId, next);

  if (!appointment) {
    throw new Error("Appointment not found for this organization.");
  }

  const thread = await getOrCreateAppointmentCommunicationThread(appointment.id, next);

  return postCommunicationMessage(
    {
      threadId: thread.id,
      body,
      messageKind: "appointment_reminder",
      visibility: "customer_visible",
      deliveryStatus: "logged",
      createNotification: false,
      payload: {
        appointmentId: appointment.id,
        purpose: "appointment_reminder",
        source: "manual_email_reminder"
      }
    },
    next
  );
}

async function getAppointmentReminderMessageForSend(input: {
  appointmentId: string;
  communicationMessageId: string | null | undefined;
  previewBody: string;
  body?: string | null;
  next: string;
}) {
  if (!input.communicationMessageId) {
    return createAppointmentReminderLog(
      {
        appointmentId: input.appointmentId,
        body: input.body?.trim() || input.previewBody
      },
      input.next
    );
  }

  const logs = await listAppointmentReminderLogs(input.appointmentId, input.next);
  const message = logs.find((candidate) => candidate.id === input.communicationMessageId);

  if (!message) {
    throw new Error("Appointment reminder message was not found for this appointment.");
  }

  if (message.deliveryStatus === "sent") {
    throw new Error("This appointment reminder message has already been marked sent.");
  }

  return message;
}

function mapAppointmentReminderEmailDelivery(
  row: AppointmentReminderEmailDeliveryRow
): AppointmentReminderEmailDelivery | null {
  if (!row.communication_message_id) {
    return null;
  }

  return {
    id: row.id,
    communicationMessageId: row.communication_message_id,
    notificationEventId: row.notification_event_id,
    status: row.status,
    provider: row.provider,
    recipientEmail: row.recipient_email,
    providerMessageId: row.provider_message_id,
    errorMessage: row.error_message,
    sentAt: row.sent_at,
    failedAt: row.failed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function listAppointmentReminderDeliveriesForMessages(input: {
  organizationId: string;
  communicationMessageIds: string[];
}) {
  if (input.communicationMessageIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("notification_deliveries")
    .select(
      `
        id,
        communication_message_id,
        notification_event_id,
        status,
        provider,
        recipient_email,
        provider_message_id,
        error_message,
        sent_at,
        failed_at,
        created_at,
        updated_at
      `
    )
    .eq("company_id", input.organizationId)
    .in("communication_message_id", input.communicationMessageIds)
    .order("created_at", { ascending: false });
  const rows = (response.data as AppointmentReminderEmailDeliveryRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load appointment reminder email delivery history: ${response.error.message}`
    );
  }

  return rows
    .map(mapAppointmentReminderEmailDelivery)
    .filter((delivery): delivery is AppointmentReminderEmailDelivery => Boolean(delivery));
}

export async function listAppointmentReminderEmailDeliveries(
  appointmentId: string,
  next = "/appointments"
): Promise<AppointmentReminderEmailDelivery[]> {
  const appointment = await getAppointmentById(appointmentId, next);

  if (!appointment) {
    throw new Error("Appointment not found for this organization.");
  }

  const logs = await listAppointmentReminderLogs(appointment.id, next);

  return listAppointmentReminderDeliveriesForMessages({
    organizationId: appointment.organizationId,
    communicationMessageIds: logs.map((message) => message.id)
  });
}

async function assertNoSuccessfulAppointmentReminderEmail(input: {
  organizationId: string;
  appointmentId: string;
  recipientEmail: string;
  next: string;
}) {
  const logs = await listAppointmentReminderLogs(input.appointmentId, input.next);
  const deliveries = await listAppointmentReminderDeliveriesForMessages({
    organizationId: input.organizationId,
    communicationMessageIds: logs.map((message) => message.id)
  });
  const alreadySent = deliveries.some(
    (delivery) =>
      delivery.recipientEmail?.toLowerCase() === input.recipientEmail.toLowerCase() &&
      isSuccessfulAppointmentReminderDeliveryStatus(delivery.status)
  );

  if (alreadySent) {
    throw new Error(
      "An appointment reminder email has already been sent to this recipient for this appointment."
    );
  }
}

async function markAppointmentReminderMessageSent(input: {
  organizationId: string;
  communicationMessageId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("communication_messages")
    .update({
      delivery_status: "sent"
    })
    .eq("company_id", input.organizationId)
    .eq("id", input.communicationMessageId)
    .eq("message_kind", "appointment_reminder")
    .select("id")
    .maybeSingle();
  const row = response.data as { id?: string } | null;

  if (response.error || !row?.id) {
    throw new Error(
      `Unable to mark appointment reminder sent: ${response.error?.message ?? "Update failed."}`
    );
  }
}

export async function sendAppointmentReminderEmail(
  input: AppointmentReminderEmailSendInput,
  next = "/appointments"
) {
  const appointment = await getAppointmentById(input.appointmentId, next);

  if (!appointment) {
    throw new Error("Appointment not found for this organization.");
  }

  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (organizationContext?.organization.id !== appointment.organizationId) {
    throw new Error("No active organization is available for this appointment reminder email.");
  }

  const readiness = await getAppointmentReminderReadiness(appointment.id, next);

  if (!readiness.ready || !readiness.preview) {
    throw new Error(
      readiness.blockers.length > 0
        ? `Appointment reminder is not ready: ${readiness.blockers.join(" ")}`
        : "Appointment reminder is not ready."
    );
  }

  const selectedRecipient = selectAppointmentConfirmationEmailRecipient({
    recipients: readiness.recipients,
    selectedEmail: input.recipientEmail
  });
  const recipient =
    readiness.recipients.find((candidate) => candidate.email === selectedRecipient.email) ??
    selectedRecipient;

  if (!readiness.preview.body.trim()) {
    throw new Error("Appointment reminder email content cannot be empty.");
  }

  await assertNoSuccessfulAppointmentReminderEmail({
    organizationId: appointment.organizationId,
    appointmentId: appointment.id,
    recipientEmail: recipient.email,
    next
  });

  const message = await getAppointmentReminderMessageForSend({
    appointmentId: appointment.id,
    communicationMessageId: input.communicationMessageId,
    previewBody: readiness.preview.body,
    body: input.body,
    next
  });
  const notificationEvent = await createNotificationEvent({
    organizationId: appointment.organizationId,
    category: "communication",
    severity: "neutral",
    eventType: "appointment.reminder_email_requested",
    subjectType: "appointment",
    subjectId: appointment.id,
    customerId: appointment.customerId,
    projectId: appointment.projectId,
    actorType: "organization_user",
    actorUserId: user.id,
    title: "Appointment reminder email requested",
    message: `Appointment reminder email requested for ${appointment.title}.`,
    linkPath: `/appointments/${appointment.id}`,
    groupKey: `appointment:${appointment.id}:reminder:${recipient.email}`,
    payload: {
      appointmentId: appointment.id,
      communicationMessageId: message.id,
      recipientEmail: recipient.email,
      purpose: "appointment_reminder"
    },
    markReadUserIds: [user.id]
  });
  const emailContent = buildAppointmentConfirmationEmailContent({
    subject: readiness.preview.subject,
    body: message.body
  });
  const delivery = await sendTrackedNotificationEmail({
    organizationId: appointment.organizationId,
    notificationEventId: notificationEvent.id,
    communicationMessageId: message.id,
    recipientEmail: recipient.email,
    recipientUserId: recipient.portalUserId,
    subject: emailContent.subject,
    htmlBody: emailContent.htmlBody,
    textBody: emailContent.textBody,
    payload: {
      subjectType: "appointment",
      subjectId: appointment.id,
      appointmentId: appointment.id,
      communicationMessageId: message.id,
      customerId: appointment.customerId,
      projectId: appointment.projectId,
      recipientSource: recipient.source,
      portalAccessGrantId: recipient.portalAccessGrantId,
      customerContactId: recipient.customerContactId,
      messageCategory: "appointment_reminder",
      preferenceStatus: "preferenceStatus" in recipient ? recipient.preferenceStatus : null
    }
  });

  await markAppointmentReminderMessageSent({
    organizationId: appointment.organizationId,
    communicationMessageId: message.id
  });

  return {
    communicationMessageId: message.id,
    notificationEventId: notificationEvent.id,
    deliveryId: delivery.deliveryId,
    recipient
  };
}
