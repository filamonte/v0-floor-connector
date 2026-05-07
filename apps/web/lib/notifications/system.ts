import "server-only";

import {
  isPostmarkEmailConfigured,
  sendPostmarkEmail,
  type PostmarkEmailResult
} from "@floorconnector/integrations";
import type {
  ChangeOrderEventType,
  InvoiceEventType,
  NotificationActorType,
  NotificationEventCategory,
  NotificationEventSeverity
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { assertOrganizationCanPerformProductionAction } from "@/lib/organizations/activation-guard";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPortalAccessGrantsForCurrentUser } from "@/lib/portal-access/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type NotificationEventInsert = {
  organizationId: string;
  category: NotificationEventCategory;
  severity?: NotificationEventSeverity;
  eventType: string;
  subjectType:
    | "opportunity"
    | "customer"
    | "project"
    | "estimate"
    | "contract"
    | "invoice"
    | "change_order"
    | "payment";
  subjectId: string;
  customerId?: string | null;
  projectId?: string | null;
  actorType: NotificationActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  title: string;
  message: string;
  linkPath: string;
  groupKey?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string;
  recipientUserIds?: string[];
  markReadUserIds?: string[];
};

type NotificationDeliveryInsert = {
  organizationId: string;
  notificationEventId: string;
  recipientEmail: string;
  recipientUserId?: string | null;
  trackingToken?: string | null;
  payload?: Record<string, unknown> | null;
};

type NotificationDeliveryRow = {
  id: string;
  company_id: string;
  notification_event_id: string;
  channel: "in_app" | "email" | "sms";
  provider: string | null;
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "failed";
  recipient_user_id: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  tracking_token: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  payload: Record<string, unknown> | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
  notification_events?:
    | {
        id: string;
        company_id: string;
        event_type: string;
        subject_type: string;
        subject_id: string;
        customer_id: string | null;
        project_id: string | null;
        link_path: string;
      }
    | null;
};

type InvoiceEventInsert = {
  organizationId: string;
  invoiceId: string;
  customerId: string;
  projectId: string;
  eventType: InvoiceEventType;
  actorType: NotificationActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string;
};

type ChangeOrderEventInsert = {
  organizationId: string;
  changeOrderId: string;
  customerId: string;
  projectId: string;
  eventType: ChangeOrderEventType;
  actorType: NotificationActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string;
};

type EstimateNotificationEventInput = {
  organizationId: string;
  estimateId: string;
  customerId: string;
  projectId: string;
  estimateReferenceNumber: string;
  customerName?: string | null;
  eventType:
    | "sent"
    | "opened"
    | "clicked"
    | "viewed"
    | "approved"
    | "rejected"
    | "comment_added";
  actorType: NotificationActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  occurredAt?: string;
  payload?: Record<string, unknown> | null;
  eventNote?: string | null;
};

type ContractNotificationEventInput = {
  organizationId: string;
  contractId: string;
  customerId: string;
  projectId: string;
  contractTitle: string;
  eventType: "sent" | "viewed" | "signed" | "declined";
  actorType: NotificationActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  occurredAt?: string;
  payload?: Record<string, unknown> | null;
};

type InvoiceNotificationEventInput = {
  organizationId: string;
  invoiceId: string;
  customerId: string;
  projectId: string;
  invoiceReferenceNumber: string;
  eventType: InvoiceEventType;
  actorType: NotificationActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  occurredAt?: string;
  payload?: Record<string, unknown> | null;
};

type ChangeOrderNotificationEventInput = {
  organizationId: string;
  changeOrderId: string;
  customerId: string;
  projectId: string;
  changeOrderReferenceNumber: string;
  eventType: ChangeOrderEventType;
  actorType: NotificationActorType;
  actorUserId?: string | null;
  portalUserId?: string | null;
  occurredAt?: string;
  payload?: Record<string, unknown> | null;
};

type SentEmailNotificationInput = {
  organizationId: string;
  notificationEventId: string;
  recipientEmail: string;
  recipientUserId?: string | null;
  trackingToken?: string | null;
  subject: string;
  htmlBody: string;
  textBody: string;
  payload?: Record<string, unknown> | null;
};

type DeliveryTrackingResult = {
  deliveryId: string;
  notificationEventId: string;
  organizationId: string;
  subjectType: string;
  subjectId: string;
  eventType: string;
  customerId: string | null;
  projectId: string | null;
  linkPath: string;
};

function getSubjectLinkPath(
  subjectType: NotificationEventInsert["subjectType"],
  subjectId: string
) {
  switch (subjectType) {
    case "opportunity":
      return `/leads/${subjectId}`;
    case "customer":
      return `/customers/${subjectId}`;
    case "project":
      return `/projects/${subjectId}`;
    case "estimate":
      return `/estimates/${subjectId}`;
    case "contract":
      return `/contracts/${subjectId}`;
    case "invoice":
      return `/invoices/${subjectId}`;
    case "change_order":
      return `/change-orders/${subjectId}`;
    case "payment":
      return "/payments";
    default:
      return "/dashboard";
  }
}

async function listActiveOrganizationMemberIds(organizationId: string) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("company_memberships")
    .select("user_id")
    .eq("company_id", organizationId)
    .eq("membership_status", "active");

  if (response.error) {
    throw new Error(`Unable to resolve notification recipients: ${response.error.message}`);
  }

  return ((response.data as Array<{ user_id?: string }> | null) ?? [])
    .map((row) => row.user_id)
    .filter((value): value is string => typeof value === "string");
}

function dedupe(values: readonly string[]) {
  return [...new Set(values.filter((value) => value.length > 0))];
}

export async function createNotificationEvent(input: NotificationEventInsert) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_events")
    .insert({
      company_id: input.organizationId,
      category: input.category,
      severity: input.severity ?? "neutral",
      event_type: input.eventType,
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      customer_id: input.customerId ?? null,
      project_id: input.projectId ?? null,
      actor_type: input.actorType,
      actor_user_id: input.actorUserId ?? null,
      portal_user_id: input.portalUserId ?? null,
      title: input.title,
      message: input.message,
      link_path: input.linkPath,
      group_key: input.groupKey ?? null,
      payload: input.payload ?? null,
      occurred_at: input.occurredAt ?? new Date().toISOString()
    })
    .select("id")
    .single();
  const data = response.data as { id?: string } | null;

  if (response.error || !data?.id) {
    throw new Error(
      `Unable to create notification event: ${response.error?.message ?? "Insert failed."}`
    );
  }

  const recipientUserIds = dedupe(
    input.recipientUserIds ?? (await listActiveOrganizationMemberIds(input.organizationId))
  );

  if (recipientUserIds.length > 0) {
    const markReadUserIds = new Set(
      dedupe([
        ...(input.markReadUserIds ?? []),
        ...(input.actorType === "organization_user" && input.actorUserId
          ? [input.actorUserId]
          : [])
      ])
    );
    const notificationsResponse = await admin.from("notifications").insert(
      recipientUserIds.map((userId) => ({
        company_id: input.organizationId,
        notification_event_id: data.id,
        user_id: userId,
        is_read: markReadUserIds.has(userId),
        read_at: markReadUserIds.has(userId) ? input.occurredAt ?? new Date().toISOString() : null
      }))
    );

    if (notificationsResponse.error) {
      throw new Error(
        `Unable to fan out notification event: ${notificationsResponse.error.message}`
      );
    }
  }

  return { id: data.id };
}

export async function deleteNotificationEvent(
  organizationId: string,
  notificationEventId: string
) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_events")
    .delete()
    .eq("company_id", organizationId)
    .eq("id", notificationEventId);

  if (response.error) {
    throw new Error(`Unable to delete notification event: ${response.error.message}`);
  }
}

async function createNotificationDelivery(input: NotificationDeliveryInsert) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .insert({
      company_id: input.organizationId,
      notification_event_id: input.notificationEventId,
      channel: "email",
      provider: "postmark",
      status: "pending",
      recipient_user_id: input.recipientUserId ?? null,
      recipient_email: input.recipientEmail,
      tracking_token: input.trackingToken ?? null,
      payload: input.payload ?? null
    })
    .select("id")
    .single();
  const data = response.data as { id?: string } | null;

  if (response.error || !data?.id) {
    throw new Error(
      `Unable to create notification delivery: ${response.error?.message ?? "Insert failed."}`
    );
  }

  return data.id;
}

async function markNotificationDeliverySent(
  deliveryId: string,
  result: PostmarkEmailResult
) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .update({
      provider_message_id: result.messageId,
      status: "sent",
      sent_at: result.submittedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", deliveryId);

  if (response.error) {
    throw new Error(`Unable to mark notification delivery sent: ${response.error.message}`);
  }
}

async function markNotificationDeliveryFailed(deliveryId: string, errorMessage: string) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .update({
      status: "failed",
      error_message: errorMessage,
      failed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", deliveryId);

  if (response.error) {
    throw new Error(`Unable to mark notification delivery failed: ${response.error.message}`);
  }
}

export async function sendTrackedNotificationEmail(input: SentEmailNotificationInput) {
  await assertOrganizationCanPerformProductionAction(input.organizationId);

  if (!isPostmarkEmailConfigured()) {
    throw new Error(
      "Notification email delivery is not configured. Set POSTMARK_SERVER_TOKEN and POSTMARK_FROM_EMAIL before sending notifications."
    );
  }

  const deliveryId = await createNotificationDelivery({
    organizationId: input.organizationId,
    notificationEventId: input.notificationEventId,
    recipientEmail: input.recipientEmail,
    recipientUserId: input.recipientUserId,
    trackingToken: input.trackingToken,
    payload: input.payload
  });

  try {
    const result = await sendPostmarkEmail({
      toEmail: input.recipientEmail,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody
    });
    await markNotificationDeliverySent(deliveryId, result);
    return { deliveryId, result };
  } catch (error) {
    await markNotificationDeliveryFailed(
      deliveryId,
      error instanceof Error ? error.message : "Unknown delivery error."
    );
    throw error;
  }
}

async function getDeliveryByTrackingToken(trackingToken: string) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .select(
      `
        id,
        company_id,
        notification_event_id,
        channel,
        provider,
        status,
        recipient_user_id,
        recipient_email,
        recipient_phone,
        tracking_token,
        provider_message_id,
        error_message,
        payload,
        sent_at,
        delivered_at,
        opened_at,
        clicked_at,
        failed_at,
        created_at,
        updated_at,
        notification_events (
          id,
          company_id,
          event_type,
          subject_type,
          subject_id,
          customer_id,
          project_id,
          link_path
        )
      `
    )
    .eq("tracking_token", trackingToken)
    .maybeSingle();
  const data = response.data as NotificationDeliveryRow | null;

  if (response.error) {
    throw new Error(`Unable to load notification delivery tracking: ${response.error.message}`);
  }

  return data;
}

function mapTrackedDelivery(
  delivery: NotificationDeliveryRow | null
): DeliveryTrackingResult | null {
  if (!delivery?.notification_events) {
    return null;
  }

  return {
    deliveryId: delivery.id,
    notificationEventId: delivery.notification_event_id,
    organizationId: delivery.company_id,
    subjectType: delivery.notification_events.subject_type,
    subjectId: delivery.notification_events.subject_id,
    eventType: delivery.notification_events.event_type,
    customerId: delivery.notification_events.customer_id,
    projectId: delivery.notification_events.project_id,
    linkPath: delivery.notification_events.link_path
  };
}

export async function trackNotificationDeliveryOpened(trackingToken: string) {
  const delivery = await getDeliveryByTrackingToken(trackingToken);

  if (!delivery) {
    return null;
  }

  if (!delivery.opened_at) {
    const admin = getSupabaseAdminClient();
    const nowIso = new Date().toISOString();
    const response = await admin
      .from("notification_deliveries")
      .update({
        status: delivery.clicked_at ? "clicked" : "opened",
        opened_at: nowIso,
        delivered_at: delivery.delivered_at ?? nowIso
      })
      .eq("id", delivery.id);

    if (response.error) {
      throw new Error(`Unable to update notification open tracking: ${response.error.message}`);
    }
  }

  return mapTrackedDelivery(delivery);
}

export async function trackNotificationDeliveryClicked(trackingToken: string) {
  const delivery = await getDeliveryByTrackingToken(trackingToken);

  if (!delivery) {
    return null;
  }

  if (!delivery.clicked_at) {
    const admin = getSupabaseAdminClient();
    const nowIso = new Date().toISOString();
    const response = await admin
      .from("notification_deliveries")
      .update({
        status: "clicked",
        delivered_at: delivery.delivered_at ?? nowIso,
        opened_at: delivery.opened_at ?? nowIso,
        clicked_at: nowIso
      })
      .eq("id", delivery.id);

    if (response.error) {
      throw new Error(`Unable to update notification click tracking: ${response.error.message}`);
    }
  }

  return mapTrackedDelivery(delivery);
}

async function insertInvoiceEvent(input: InvoiceEventInsert) {
  const admin = getSupabaseAdminClient();
  const response = await admin.from("invoice_events").insert({
    company_id: input.organizationId,
    invoice_id: input.invoiceId,
    customer_id: input.customerId,
    project_id: input.projectId,
    event_type: input.eventType,
    actor_type: input.actorType,
    actor_user_id: input.actorUserId ?? null,
    portal_user_id: input.portalUserId ?? null,
    payload: input.payload ?? null,
    occurred_at: input.occurredAt ?? new Date().toISOString()
  });

  if (response.error) {
    throw new Error(`Unable to record invoice event: ${response.error.message}`);
  }
}

async function insertChangeOrderEvent(input: ChangeOrderEventInsert) {
  const admin = getSupabaseAdminClient();
  const response = await admin.from("change_order_events").insert({
    company_id: input.organizationId,
    change_order_id: input.changeOrderId,
    customer_id: input.customerId,
    project_id: input.projectId,
    event_type: input.eventType,
    actor_type: input.actorType,
    actor_user_id: input.actorUserId ?? null,
    portal_user_id: input.portalUserId ?? null,
    payload: input.payload ?? null,
    occurred_at: input.occurredAt ?? new Date().toISOString()
  });

  if (response.error) {
    throw new Error(`Unable to record change-order event: ${response.error.message}`);
  }
}

export async function recordEstimateNotificationEvent(input: EstimateNotificationEventInput) {
  const linkPath = getSubjectLinkPath("estimate", input.estimateId);
  const titlePrefix = `Estimate ${input.estimateReferenceNumber}`;
  const customerName = input.customerName?.trim() ? ` for ${input.customerName.trim()}` : "";

  const eventPresentation = {
    sent: {
      severity: "neutral" as const,
      title: `${titlePrefix} sent`,
      message: `${titlePrefix} was sent to the customer${customerName}.`
    },
    opened: {
      severity: "neutral" as const,
      title: `${titlePrefix} email opened`,
      message: `The customer opened the delivery email for ${input.estimateReferenceNumber}.`
    },
    clicked: {
      severity: "neutral" as const,
      title: `${titlePrefix} link clicked`,
      message: `The customer clicked through from the delivery email for ${input.estimateReferenceNumber}.`
    },
    viewed: {
      severity: "warning" as const,
      title: `${titlePrefix} viewed`,
      message:
        input.actorType === "organization_user"
          ? `${titlePrefix} was marked viewed by your team${customerName}.`
          : `${titlePrefix} was viewed in the portal${customerName}.`
    },
    approved: {
      severity: "neutral" as const,
      title: `${titlePrefix} approved`,
      message:
        input.actorType === "organization_user"
          ? `${titlePrefix} was approved by your team${customerName}.`
          : `${titlePrefix} was approved in the portal${customerName}.`
    },
    rejected: {
      severity: "warning" as const,
      title: `${titlePrefix} rejected`,
      message:
        input.actorType === "organization_user"
          ? `${titlePrefix} was rejected by your team${customerName}.`
          : `${titlePrefix} was rejected in the portal${customerName}.`
    },
    comment_added: {
      severity: "warning" as const,
      title: `${titlePrefix} commented`,
      message: input.eventNote?.trim()
        ? `A customer comment was added to ${input.estimateReferenceNumber}: ${input.eventNote.trim()}`
        : `A customer comment was added to ${input.estimateReferenceNumber}.`
    }
  }[input.eventType];

  return createNotificationEvent({
    organizationId: input.organizationId,
    category: "estimates",
    severity: eventPresentation.severity,
    eventType: `estimate.${input.eventType}`,
    subjectType: "estimate",
    subjectId: input.estimateId,
    customerId: input.customerId,
    projectId: input.projectId,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    portalUserId: input.portalUserId,
    title: eventPresentation.title,
    message: eventPresentation.message,
    linkPath,
    groupKey: `estimate:${input.estimateId}`,
    payload: input.payload,
    occurredAt: input.occurredAt
  });
}

export async function recordContractNotificationEvent(input: ContractNotificationEventInput) {
  const presentation = {
    sent: {
      severity: "neutral" as const,
      title: `${input.contractTitle} sent`,
      message: `${input.contractTitle} was sent for signature.`
    },
    viewed: {
      severity: "warning" as const,
      title: `${input.contractTitle} viewed`,
      message: `${input.contractTitle} was viewed in the portal.`
    },
    signed: {
      severity: "neutral" as const,
      title: `${input.contractTitle} signed`,
      message: `${input.contractTitle} completed its signature workflow.`
    },
    declined: {
      severity: "warning" as const,
      title: `${input.contractTitle} declined`,
      message: `${input.contractTitle} was declined in the portal.`
    }
  }[input.eventType];

  return createNotificationEvent({
    organizationId: input.organizationId,
    category: "contracts",
    severity: presentation.severity,
    eventType: `contract.${input.eventType}`,
    subjectType: "contract",
    subjectId: input.contractId,
    customerId: input.customerId,
    projectId: input.projectId,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    portalUserId: input.portalUserId,
    title: presentation.title,
    message: presentation.message,
    linkPath: getSubjectLinkPath("contract", input.contractId),
    groupKey: `contract:${input.contractId}`,
    payload: input.payload,
    occurredAt: input.occurredAt
  });
}

export async function recordInvoiceNotificationEvent(input: InvoiceNotificationEventInput) {
  await insertInvoiceEvent({
    organizationId: input.organizationId,
    invoiceId: input.invoiceId,
    customerId: input.customerId,
    projectId: input.projectId,
    eventType: input.eventType,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    portalUserId: input.portalUserId,
    payload: input.payload,
    occurredAt: input.occurredAt
  });

  const presentation = {
    sent: {
      category: "invoices" as const,
      severity: "neutral" as const,
      title: `Invoice ${input.invoiceReferenceNumber} sent`,
      message: `Invoice ${input.invoiceReferenceNumber} was sent to the customer.`
    },
    viewed: {
      category: "invoices" as const,
      severity: "warning" as const,
      title: `Invoice ${input.invoiceReferenceNumber} viewed`,
      message: `Invoice ${input.invoiceReferenceNumber} was viewed in the portal.`
    },
    payment_requested: {
      category: "payments" as const,
      severity: "warning" as const,
      title: `Payment requested for ${input.invoiceReferenceNumber}`,
      message: `A payment request was started for invoice ${input.invoiceReferenceNumber}.`
    },
    paid: {
      category: "payments" as const,
      severity: "neutral" as const,
      title: `Invoice ${input.invoiceReferenceNumber} paid`,
      message: `Invoice ${input.invoiceReferenceNumber} received payment.`
    },
    failed: {
      category: "payments" as const,
      severity: "critical" as const,
      title: `Payment failed for ${input.invoiceReferenceNumber}`,
      message: `A payment attempt failed for invoice ${input.invoiceReferenceNumber}.`
    },
    voided: {
      category: "payments" as const,
      severity: "warning" as const,
      title: `Payment voided for ${input.invoiceReferenceNumber}`,
      message: `A payment was voided for invoice ${input.invoiceReferenceNumber}.`
    }
  }[input.eventType];

  return createNotificationEvent({
    organizationId: input.organizationId,
    category: presentation.category,
    severity: presentation.severity,
    eventType: `invoice.${input.eventType}`,
    subjectType: "invoice",
    subjectId: input.invoiceId,
    customerId: input.customerId,
    projectId: input.projectId,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    portalUserId: input.portalUserId,
    title: presentation.title,
    message: presentation.message,
    linkPath: getSubjectLinkPath("invoice", input.invoiceId),
    groupKey: `invoice:${input.invoiceId}`,
    payload: input.payload,
    occurredAt: input.occurredAt
  });
}

export async function recordChangeOrderNotificationEvent(
  input: ChangeOrderNotificationEventInput
) {
  await insertChangeOrderEvent({
    organizationId: input.organizationId,
    changeOrderId: input.changeOrderId,
    customerId: input.customerId,
    projectId: input.projectId,
    eventType: input.eventType,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    portalUserId: input.portalUserId,
    payload: input.payload,
    occurredAt: input.occurredAt
  });

  const presentation = {
    sent: {
      severity: "neutral" as const,
      title: `Change order ${input.changeOrderReferenceNumber} sent`,
      message: `Change order ${input.changeOrderReferenceNumber} was sent to the customer.`
    },
    viewed: {
      severity: "warning" as const,
      title: `Change order ${input.changeOrderReferenceNumber} viewed`,
      message: `Change order ${input.changeOrderReferenceNumber} was viewed in the portal.`
    },
    approved: {
      severity: "neutral" as const,
      title: `Change order ${input.changeOrderReferenceNumber} approved`,
      message: `Change order ${input.changeOrderReferenceNumber} was approved in the portal.`
    },
    rejected: {
      severity: "warning" as const,
      title: `Change order ${input.changeOrderReferenceNumber} rejected`,
      message: `Change order ${input.changeOrderReferenceNumber} was rejected in the portal.`
    }
  }[input.eventType];

  return createNotificationEvent({
    organizationId: input.organizationId,
    category: "change_orders",
    severity: presentation.severity,
    eventType: `change_order.${input.eventType}`,
    subjectType: "change_order",
    subjectId: input.changeOrderId,
    customerId: input.customerId,
    projectId: input.projectId,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    portalUserId: input.portalUserId,
    title: presentation.title,
    message: presentation.message,
    linkPath: getSubjectLinkPath("change_order", input.changeOrderId),
    groupKey: `change_order:${input.changeOrderId}`,
    payload: input.payload,
    occurredAt: input.occurredAt
  });
}

export async function markNotificationRead(notificationId: string) {
  const user = await requireAuthenticatedUser("/dashboard");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("No active organization is available for notification updates.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq("company_id", organizationContext.organization.id)
    .eq("user_id", user.id)
    .eq("id", notificationId);

  if (response.error) {
    throw new Error(`Unable to mark notification as read: ${response.error.message}`);
  }
}

export async function markAllNotificationsRead(next = "/dashboard") {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("No active organization is available for notification updates.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq("company_id", organizationContext.organization.id)
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (response.error) {
    throw new Error(`Unable to mark notifications as read: ${response.error.message}`);
  }
}

type CommunicationNotificationReadRow = {
  id: string;
  notification_events?:
    | Array<{
        payload: Record<string, unknown> | null;
      }>
    | null;
};

function getCommunicationThreadIdFromPayload(payload: Record<string, unknown> | null | undefined) {
  return typeof payload?.threadId === "string" ? payload.threadId : null;
}

async function listUnreadCommunicationNotificationIds(input: {
  next: string;
  threadId?: string;
}) {
  const user = await requireAuthenticatedUser(input.next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("No active organization is available for notification updates.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("notifications")
    .select(
      `
        id,
        notification_events (
          payload
        )
      `
    )
    .eq("company_id", organizationContext.organization.id)
    .eq("user_id", user.id)
    .eq("is_read", false)
    .eq("notification_events.category", "communication");
  const rows = (response.data as CommunicationNotificationReadRow[] | null) ?? [];

  if (response.error) {
    throw new Error(`Unable to load communication notifications: ${response.error.message}`);
  }

  const matchingIds =
    input.threadId == null
      ? rows.map((row) => row.id)
      : rows
          .filter((row) => {
            const payload = row.notification_events?.[0]?.payload;
            return getCommunicationThreadIdFromPayload(payload) === input.threadId;
          })
          .map((row) => row.id);

  return {
    notificationIds: matchingIds,
    organizationId: organizationContext.organization.id,
    userId: user.id
  };
}

async function markNotificationIdsRead(input: {
  organizationId: string;
  userId: string;
  notificationIds: string[];
}) {
  if (input.notificationIds.length === 0) {
    return 0;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq("company_id", input.organizationId)
    .eq("user_id", input.userId)
    .eq("is_read", false)
    .in("id", input.notificationIds)
    .select("id");
  const rows = (response.data as Array<{ id: string }> | null) ?? [];

  if (response.error) {
    throw new Error(`Unable to mark communication notifications as read: ${response.error.message}`);
  }

  return rows.length;
}

export async function markCommunicationThreadNotificationsRead(
  threadId: string,
  next = "/communications"
) {
  const matching = await listUnreadCommunicationNotificationIds({
    next,
    threadId
  });

  return markNotificationIdsRead(matching);
}

export async function markAllCommunicationNotificationsRead(next = "/communications") {
  const matching = await listUnreadCommunicationNotificationIds({ next });

  return markNotificationIdsRead(matching);
}

export async function assertPortalUserCanPostCommunication(input: {
  organizationId: string;
  customerId: string;
  projectId: string;
  next: string;
}) {
  const user = await requireAuthenticatedUser(input.next);
  const activeGrants = (await listPortalAccessGrantsForCurrentUser(input.next)).filter(
    (grant) => grant.status === "active" && grant.customerId === input.customerId
  );

  if (activeGrants.length === 0) {
    throw new Error("No active portal access is available for this communication thread.");
  }

  const supabase = await getSupabaseServerClient();
  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("project_id")
    .in(
      "portal_access_grant_id",
      activeGrants.map((grant) => grant.id)
    )
    .eq("status", "active");

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate portal communication project scope: ${projectAccessResponse.error.message}`
    );
  }

  const hasProjectAccess = ((projectAccessResponse.data as Array<{ project_id?: string }> | null) ?? [])
    .some((row) => row.project_id === input.projectId);

  if (!hasProjectAccess) {
    throw new Error("This communication thread is not available in the current portal scope.");
  }

  return user.id;
}
