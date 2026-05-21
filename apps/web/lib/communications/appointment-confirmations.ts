import "server-only";

import type { CommunicationMessage } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getAppointmentById } from "@/lib/appointments/data";
import {
  createNotificationEvent,
  sendTrackedNotificationEmail
} from "@/lib/notifications/system";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import {
  buildAppointmentConfirmationPreview,
  type AppointmentConfirmationPreview
} from "./appointment-confirmation-preview";
import {
  buildAppointmentConfirmationEmailContent,
  dedupeAppointmentConfirmationEmailRecipients,
  selectAppointmentConfirmationEmailRecipient,
  type AppointmentConfirmationEmailRecipient,
  type AppointmentConfirmationEmailRecipientCandidate
} from "./appointment-confirmation-email-core";
import {
  getOrCreateCommunicationThread,
  listCommunicationMessages,
  listCommunicationThreadsForSubject,
  postCommunicationMessage
} from "./data";

export type AppointmentConfirmationLogInput = {
  appointmentId: string;
  body?: string | null;
};

export type AppointmentConfirmationEmailSendInput = {
  appointmentId: string;
  recipientEmail?: string | null;
  communicationMessageId?: string | null;
  body?: string | null;
};

export type AppointmentConfirmationEmailDelivery = {
  id: string;
  communicationMessageId: string;
  notificationEventId: string;
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "failed";
  provider: string | null;
  recipientEmail: string | null;
  providerMessageId: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CustomerEmailRow = {
  id: string;
  name: string;
  email: string | null;
};

type CustomerContactEmailRow = {
  id: string;
  is_primary: boolean;
  contacts?:
    | {
        display_name: string | null;
        email: string | null;
      }
    | Array<{
        display_name: string | null;
        email: string | null;
      }>
    | null;
};

type PortalGrantEmailRow = {
  id: string;
  customer_contact_id: string | null;
  user_id: string | null;
  invited_email: string | null;
  portal_user?:
    | {
        id: string;
        email: string | null;
        full_name: string | null;
      }
    | Array<{
        id: string;
        email: string | null;
        full_name: string | null;
      }>
    | null;
  customer_contact?:
    | CustomerContactEmailRow
    | CustomerContactEmailRow[]
    | null;
};

type AppointmentConfirmationEmailDeliveryRow = {
  id: string;
  communication_message_id: string | null;
  notification_event_id: string;
  status: AppointmentConfirmationEmailDelivery["status"];
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

async function getCustomerVisibleAppointmentForConfirmation(
  appointmentId: string,
  next = "/appointments"
) {
  const appointment = await getAppointmentById(appointmentId, next);

  if (!appointment) {
    throw new Error("Appointment not found for this organization.");
  }

  if (!appointment.customerVisible) {
    throw new Error("Only explicitly customer-visible appointments can be logged as customer confirmations.");
  }

  if (!appointment.customerId || !appointment.projectId) {
    throw new Error("Customer-visible appointment confirmation logging requires linked customer and project context.");
  }

  return appointment;
}

function unwrapOne<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : value ?? null;
}

async function getAppointmentCustomerForEmail(input: {
  organizationId: string;
  customerId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select("id, name, email")
    .eq("company_id", input.organizationId)
    .eq("id", input.customerId)
    .maybeSingle();
  const row = response.data as CustomerEmailRow | null;

  if (response.error) {
    throw new Error(`Unable to load appointment customer email context: ${response.error.message}`);
  }

  if (!row?.id) {
    throw new Error("Appointment customer was not found for this organization.");
  }

  return row;
}

async function listCustomerContactEmailCandidates(input: {
  organizationId: string;
  customerId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contacts")
    .select(
      `
        id,
        is_primary,
        contacts:contacts!customer_contacts_contact_company_fkey (
          display_name,
          email
        )
      `
    )
    .eq("company_id", input.organizationId)
    .eq("customer_id", input.customerId);
  const rows = (response.data as CustomerContactEmailRow[] | null) ?? [];

  if (response.error) {
    throw new Error(`Unable to load customer contact email recipients: ${response.error.message}`);
  }

  return rows.map((row): AppointmentConfirmationEmailRecipientCandidate => {
    const contact = unwrapOne(row.contacts);

    return {
      email: contact?.email ?? null,
      displayName: contact?.display_name ?? null,
      source: "customer_contact",
      portalUserId: null,
      portalAccessGrantId: null,
      customerContactId: row.id,
      contactDisplayName: contact?.display_name ?? null,
      isPrimaryContact: row.is_primary === true
    };
  });
}

async function listPortalAccessEmailCandidates(input: {
  organizationId: string;
  customerId: string;
  projectId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const grantResponse = await supabase
    .from("portal_access_grants")
    .select(
      `
        id,
        customer_contact_id,
        user_id,
        invited_email,
        portal_user:users!portal_access_grants_user_id_fkey (
          id,
          email,
          full_name
        ),
        customer_contact:customer_contacts!portal_access_grants_company_customer_contact_fkey (
          id,
          is_primary,
          contacts:contacts!customer_contacts_contact_company_fkey (
            display_name,
            email
          )
        )
      `
    )
    .eq("company_id", input.organizationId)
    .eq("customer_id", input.customerId)
    .eq("status", "active");
  const grantRows = (grantResponse.data as PortalGrantEmailRow[] | null) ?? [];

  if (grantResponse.error) {
    throw new Error(`Unable to load appointment portal email recipients: ${grantResponse.error.message}`);
  }

  const grantIds = grantRows
    .map((row) => row.id)
    .filter((value): value is string => typeof value === "string");

  if (grantIds.length === 0) {
    return [];
  }

  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("portal_access_grant_id")
    .in("portal_access_grant_id", grantIds)
    .eq("project_id", input.projectId)
    .eq("status", "active");
  const accessRows =
    (projectAccessResponse.data as Array<{ portal_access_grant_id?: string | null }> | null) ??
    [];

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate appointment portal project access: ${projectAccessResponse.error.message}`
    );
  }

  const activeGrantIds = new Set(
    accessRows
      .map((row) => row.portal_access_grant_id)
      .filter((value): value is string => typeof value === "string")
  );

  return grantRows
    .filter((row) => activeGrantIds.has(row.id))
    .map((row): AppointmentConfirmationEmailRecipientCandidate => {
      const portalUser = unwrapOne(row.portal_user);
      const customerContact = unwrapOne(row.customer_contact);
      const contact = unwrapOne(customerContact?.contacts);
      const email = portalUser?.email ?? contact?.email ?? row.invited_email;
      const displayName = portalUser?.full_name ?? contact?.display_name ?? null;

      return {
        email,
        displayName,
        source: "portal_access",
        portalUserId: portalUser?.id ?? row.user_id ?? null,
        portalAccessGrantId: row.id,
        customerContactId: row.customer_contact_id ?? customerContact?.id ?? null,
        contactDisplayName: contact?.display_name ?? null,
        isPrimaryContact: customerContact?.is_primary === true
      };
    });
}

export async function resolveAppointmentConfirmationEmailRecipients(
  appointmentId: string,
  next = "/appointments"
): Promise<AppointmentConfirmationEmailRecipient[]> {
  const appointment = await getCustomerVisibleAppointmentForConfirmation(appointmentId, next);

  if (!appointment.customerId || !appointment.projectId) {
    throw new Error("Appointment confirmation email requires linked customer and project context.");
  }

  const [customer, portalCandidates, contactCandidates] = await Promise.all([
    getAppointmentCustomerForEmail({
      organizationId: appointment.organizationId,
      customerId: appointment.customerId
    }),
    listPortalAccessEmailCandidates({
      organizationId: appointment.organizationId,
      customerId: appointment.customerId,
      projectId: appointment.projectId
    }),
    listCustomerContactEmailCandidates({
      organizationId: appointment.organizationId,
      customerId: appointment.customerId
    })
  ]);

  return dedupeAppointmentConfirmationEmailRecipients([
    ...portalCandidates,
    ...contactCandidates,
    {
      email: customer.email,
      displayName: customer.name,
      source: "customer",
      portalUserId: null,
      portalAccessGrantId: null,
      customerContactId: null,
      contactDisplayName: null,
      isPrimaryContact: false
    }
  ]);
}

export async function buildAppointmentCustomerConfirmationPreview(
  appointmentId: string,
  next = "/appointments"
): Promise<AppointmentConfirmationPreview> {
  const appointment = await getCustomerVisibleAppointmentForConfirmation(appointmentId, next);
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  return buildAppointmentConfirmationPreview({
    title: appointment.title,
    appointmentType: appointment.appointmentType,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
    status: appointment.status,
    location: appointment.location,
    customerNotes: appointment.customerNotes,
    customerName: appointment.customer?.name ?? null,
    projectName: appointment.project?.name ?? null,
    organizationName: getOrganizationDisplayName(organizationContext)
  });
}

export async function getOrCreateAppointmentCommunicationThread(
  appointmentId: string,
  next = "/appointments"
) {
  const appointment = await getCustomerVisibleAppointmentForConfirmation(appointmentId, next);

  return getOrCreateCommunicationThread(
    {
      organizationId: appointment.organizationId,
      opportunityId: appointment.opportunityId,
      appointmentId: appointment.id,
      customerId: appointment.customerId,
      projectId: appointment.projectId,
      subjectType: "appointment",
      subjectId: appointment.id
    },
    next
  );
}

export async function listAppointmentCommunicationMessages(
  appointmentId: string,
  next = "/appointments"
): Promise<CommunicationMessage[]> {
  const appointment = await getCustomerVisibleAppointmentForConfirmation(appointmentId, next);
  const threads = await listCommunicationThreadsForSubject("appointment", appointment.id);
  const thread = threads.find(
    (candidate) => candidate.organizationId === appointment.organizationId
  );

  if (!thread) {
    return [];
  }

  return listCommunicationMessages(thread.id);
}

export async function listAppointmentConfirmationLogs(
  appointmentId: string,
  next = "/appointments"
): Promise<CommunicationMessage[]> {
  const messages = await listAppointmentCommunicationMessages(appointmentId, next);

  return messages
    .filter((message) => message.messageKind === "appointment_confirmation")
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function createAppointmentConfirmationLog(
  input: AppointmentConfirmationLogInput,
  next = "/appointments"
) {
  const appointment = await getCustomerVisibleAppointmentForConfirmation(
    input.appointmentId,
    next
  );
  const body =
    input.body?.trim() ||
    (
      await buildAppointmentCustomerConfirmationPreview(appointment.id, next)
    ).body;

  if (body.length === 0) {
    throw new Error("Appointment confirmation content cannot be empty.");
  }

  const thread = await getOrCreateAppointmentCommunicationThread(appointment.id, next);

  return postCommunicationMessage(
    {
      threadId: thread.id,
      body,
      messageKind: "appointment_confirmation",
      visibility: "customer_visible",
      deliveryStatus: "logged",
      createNotification: false,
      payload: {
        appointmentId: appointment.id,
        purpose: "appointment_confirmation",
        source: "manual_log"
      }
    },
    next
  );
}

async function getAppointmentConfirmationMessageForSend(input: {
  appointmentId: string;
  communicationMessageId: string | null | undefined;
  previewBody: string;
  body?: string | null;
  next: string;
}) {
  if (!input.communicationMessageId) {
    return createAppointmentConfirmationLog(
      {
        appointmentId: input.appointmentId,
        body: input.body?.trim() || input.previewBody
      },
      input.next
    );
  }

  const logs = await listAppointmentConfirmationLogs(input.appointmentId, input.next);
  const message = logs.find((candidate) => candidate.id === input.communicationMessageId);

  if (!message) {
    throw new Error("Appointment confirmation message was not found for this appointment.");
  }

  if (message.deliveryStatus === "sent") {
    throw new Error("This appointment confirmation message has already been marked sent.");
  }

  return message;
}

function mapAppointmentConfirmationEmailDelivery(
  row: AppointmentConfirmationEmailDeliveryRow
): AppointmentConfirmationEmailDelivery | null {
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

export async function listAppointmentConfirmationEmailDeliveries(
  appointmentId: string,
  next = "/appointments"
): Promise<AppointmentConfirmationEmailDelivery[]> {
  const appointment = await getCustomerVisibleAppointmentForConfirmation(appointmentId, next);
  const logs = await listAppointmentConfirmationLogs(appointment.id, next);
  const messageIds = logs.map((message) => message.id);

  if (messageIds.length === 0) {
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
    .eq("company_id", appointment.organizationId)
    .in("communication_message_id", messageIds)
    .order("created_at", { ascending: false });
  const rows = (response.data as AppointmentConfirmationEmailDeliveryRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load appointment confirmation email delivery history: ${response.error.message}`
    );
  }

  return rows
    .map(mapAppointmentConfirmationEmailDelivery)
    .filter((delivery): delivery is AppointmentConfirmationEmailDelivery => Boolean(delivery));
}

async function markAppointmentConfirmationMessageSent(input: {
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
    .eq("message_kind", "appointment_confirmation")
    .select("id")
    .maybeSingle();
  const row = response.data as { id?: string } | null;

  if (response.error || !row?.id) {
    throw new Error(
      `Unable to mark appointment confirmation sent: ${response.error?.message ?? "Update failed."}`
    );
  }
}

export async function sendAppointmentConfirmationEmail(
  input: AppointmentConfirmationEmailSendInput,
  next = "/appointments"
) {
  const appointment = await getCustomerVisibleAppointmentForConfirmation(
    input.appointmentId,
    next
  );

  if (!appointment.customerId || !appointment.projectId) {
    throw new Error("Appointment confirmation email requires linked customer and project context.");
  }

  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (organizationContext?.organization.id !== appointment.organizationId) {
    throw new Error("No active organization is available for this appointment confirmation email.");
  }

  const [preview, recipients] = await Promise.all([
    buildAppointmentCustomerConfirmationPreview(appointment.id, next),
    resolveAppointmentConfirmationEmailRecipients(appointment.id, next)
  ]);
  const recipient = selectAppointmentConfirmationEmailRecipient({
    recipients,
    selectedEmail: input.recipientEmail
  });

  if (!preview.body.trim()) {
    throw new Error("Appointment confirmation email content cannot be empty.");
  }

  const message = await getAppointmentConfirmationMessageForSend({
    appointmentId: appointment.id,
    communicationMessageId: input.communicationMessageId,
    previewBody: preview.body,
    body: input.body,
    next
  });
  const notificationEvent = await createNotificationEvent({
    organizationId: appointment.organizationId,
    category: "communication",
    severity: "neutral",
    eventType: "appointment.confirmation_email_requested",
    subjectType: "appointment",
    subjectId: appointment.id,
    customerId: appointment.customerId,
    projectId: appointment.projectId,
    actorType: "organization_user",
    actorUserId: user.id,
    title: "Appointment confirmation email requested",
    message: `Appointment confirmation email requested for ${appointment.title}.`,
    linkPath: `/appointments/${appointment.id}`,
    groupKey: `appointment:${appointment.id}:confirmation`,
    payload: {
      appointmentId: appointment.id,
      communicationMessageId: message.id,
      recipientEmail: recipient.email,
      purpose: "appointment_confirmation"
    },
    markReadUserIds: [user.id]
  });
  const emailContent = buildAppointmentConfirmationEmailContent({
    subject: preview.subject,
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
      customerContactId: recipient.customerContactId
    }
  });

  await markAppointmentConfirmationMessageSent({
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
