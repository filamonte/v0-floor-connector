import "server-only";

import { cache } from "react";
import type {
  CanonicalRecordSubjectType,
  CommunicationChannelKind,
  CommunicationMessageVisibility,
  CommunicationThreadCategory,
  CommunicationThreadStatus,
  DocumentDeliveryChannel,
  DocumentDeliveryEventType,
  DocumentDeliverySubjectType,
  PortalEvidenceDeliveryEventType
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  deriveCommunicationReplyTriage,
  type CommunicationReplyTriageItem,
  type CommunicationReplyTriageMessage,
  type CommunicationReplyTriageThread
} from "./reply-triage";

type CommunicationThreadRow = {
  id: string;
  company_id: string;
  opportunity_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  subject_type: CanonicalRecordSubjectType;
  subject_id: string;
  created_by_user_id: string | null;
  thread_category: CommunicationThreadCategory;
  channel_kind: CommunicationChannelKind;
  thread_status: CommunicationThreadStatus;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_visibility: CommunicationMessageVisibility;
  created_at: string;
  updated_at: string;
};

type CustomerRow = {
  id: string;
  name: string;
  company_name: string | null;
};

type ProjectRow = {
  id: string;
  name: string;
};

type OpportunityRow = {
  id: string;
  title: string;
  prospect_name: string;
};

type AppointmentRow = {
  id: string;
  title: string;
  appointment_type: string;
  starts_at: string;
};

type EstimateRow = {
  id: string;
  reference_number: string;
};

type ContractRow = {
  id: string;
  reference_number: string;
  title: string;
};

type InvoiceRow = {
  id: string;
  reference_number: string;
};

type ChangeOrderRow = {
  id: string;
  reference_number: string;
  title: string;
};

type PaymentRow = {
  id: string;
  invoice_id: string;
  amount: string;
  payment_date: string;
  invoices?:
    | {
        reference_number: string;
      }[]
    | null;
};

type CommunicationNotificationRow = {
  id: string;
  notification_events?: Array<{
    actor_type: "organization_user" | "portal_user" | "provider" | "system";
    occurred_at: string;
    payload: Record<string, unknown> | null;
  }> | null;
};

type ThreadUnreadState = {
  count: number;
  needsResponse: boolean;
  lastUnreadAt: string | null;
};

type CommunicationThreadSummaryRow = Pick<
  CommunicationThreadRow,
  | "id"
  | "project_id"
  | "subject_type"
  | "thread_status"
  | "last_message_at"
  | "last_message_preview"
>;

type CommunicationMessageTriageRow = {
  id: string;
  thread_id: string;
  sender_type: CommunicationReplyTriageMessage["senderType"];
  direction: CommunicationReplyTriageMessage["direction"];
  channel_kind: CommunicationReplyTriageMessage["channelKind"];
  message_kind: CommunicationReplyTriageMessage["messageKind"];
  visibility: CommunicationReplyTriageMessage["visibility"];
  body: string;
  occurred_at: string;
  created_at: string;
};

type DocumentDeliveryContextRow = {
  id: string;
  subject_type: DocumentDeliverySubjectType;
  subject_id: string;
  event_type: DocumentDeliveryEventType;
  channel: DocumentDeliveryChannel;
  recipient_name: string | null;
  recipient_email: string | null;
  provider: string | null;
  created_at: string;
};

type PortalEvidenceDeliveryContextRow = {
  id: string;
  project_id: string;
  portal_evidence_grant_id: string;
  event_type: PortalEvidenceDeliveryEventType;
  actor_kind: "contractor" | "portal_customer" | "system";
  occurred_at: string;
  created_at: string;
};

const RECENT_WINDOW_DAYS = 14;

export type ContractorCommunicationThreadView =
  | "all"
  | "needs_response"
  | "unread"
  | "recent";
export type ContractorCommunicationSourceFilter =
  | "all"
  | CanonicalRecordSubjectType;

export type ContractorCommunicationThreadListFilters = {
  view?: ContractorCommunicationThreadView;
  source?: ContractorCommunicationSourceFilter;
};

export type ContractorCommunicationThreadListItem = {
  id: string;
  threadCategory: CommunicationThreadCategory;
  channelKind: CommunicationChannelKind;
  threadStatus: CommunicationThreadStatus;
  customer: {
    id: string;
    label: string;
    href: string;
  };
  project: {
    id: string;
    label: string;
    href: string;
  };
  subject: {
    type: CanonicalRecordSubjectType;
    id: string;
    label: string;
    href: string;
  };
  subjectSecondaryLink?: {
    label: string;
    href: string;
  } | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageVisibility: CommunicationMessageVisibility;
  unreadCount: number;
  needsResponse: boolean;
  lastUnreadAt: string | null;
  customerReplyNeedsResponse: boolean;
  latestCustomerReplyAt: string | null;
  latestCustomerReplyPreview: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ContractorCommunicationThreadSummary = {
  totalCount: number;
  needsResponseCount: number;
  unreadCount: number;
  recentCount: number;
  linkedProjectCount: number;
  sourceCounts: Record<CanonicalRecordSubjectType, number>;
};

export type ContractorCommunicationContextEvent = {
  id: string;
  kind: "document_delivery" | "shared_evidence";
  sourceType: DocumentDeliverySubjectType | "shared_evidence";
  sourceId: string;
  eventType: string;
  title: string;
  description: string;
  href: string;
  occurredAt: string;
  tone: "neutral" | "positive" | "warning" | "critical";
  audience: "customer" | "internal";
  proofStateLabel: string;
  proofBoundaryLabel: string;
  proofSourceLabel: string;
  needsReview: boolean;
};

type SubjectDescriptor = {
  label: string;
  href: string;
  secondaryLink?: {
    label: string;
    href: string;
  } | null;
};

function getThreadActivityAt(
  row: CommunicationThreadRow,
  lastUnreadAt: string | null
) {
  return lastUnreadAt ?? row.last_message_at ?? row.updated_at;
}

function formatCurrency(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatPaymentDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getDocumentDeliveryEventTone(
  eventType: DocumentDeliveryEventType
): ContractorCommunicationContextEvent["tone"] {
  if (eventType === "failed" || eventType === "bounced") {
    return "critical";
  }

  if (
    eventType === "opened" ||
    eventType === "clicked" ||
    eventType === "viewed"
  ) {
    return "positive";
  }

  return eventType === "send_requested" ? "warning" : "neutral";
}

function getDocumentDeliveryProofStateLabel(
  eventType: DocumentDeliveryEventType
) {
  switch (eventType) {
    case "failed":
    case "bounced":
      return "Needs review";
    case "opened":
    case "clicked":
    case "viewed":
      return "Customer activity";
    case "sent":
    case "delivery_recorded":
      return "Delivery proof available";
    case "send_requested":
      return "Send requested";
    default:
      return "Proof status unknown";
  }
}

function getDocumentDeliveryProofSourceLabel(
  event: Pick<DocumentDeliveryContextRow, "provider" | "channel">
) {
  if (event.provider) {
    return "Provider-derived";
  }

  return event.channel === "email" || event.channel === "portal"
    ? "Customer-facing"
    : "Internal evidence";
}

function getEvidenceDeliveryEventTone(
  eventType: PortalEvidenceDeliveryEventType
): ContractorCommunicationContextEvent["tone"] {
  if (eventType === "revoked") {
    return "warning";
  }

  if (eventType === "acknowledged") {
    return "positive";
  }

  return "neutral";
}

function getEvidenceDeliveryProofStateLabel(
  eventType: PortalEvidenceDeliveryEventType
) {
  switch (eventType) {
    case "acknowledged":
      return "Customer activity";
    case "revoked":
      return "Needs review";
    default:
      return "Proof available";
  }
}

function getDocumentSubjectHref(
  subjectType: DocumentDeliverySubjectType,
  subjectId: string
) {
  switch (subjectType) {
    case "estimate":
      return `/estimates/${subjectId}`;
    case "contract":
      return `/contracts/${subjectId}`;
    case "invoice":
      return `/invoices/${subjectId}`;
    case "warranty_document":
      return `/warranty-documents/${subjectId}`;
  }
}

function getDocumentSubjectLabel(subjectType: DocumentDeliverySubjectType) {
  return subjectType === "warranty_document"
    ? "Warranty document"
    : formatLabel(subjectType);
}

function getThreadIdFromPayload(
  payload: Record<string, unknown> | null | undefined
) {
  return typeof payload?.threadId === "string" ? payload.threadId : null;
}

function getRecentCutoffIso() {
  return new Date(
    Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
}

function isRecentThreadRow(
  thread: Pick<CommunicationThreadRow, "last_message_at">
) {
  return Boolean(
    thread.last_message_at && thread.last_message_at >= getRecentCutoffIso()
  );
}

function mapThreadRowForReplyTriage(
  thread: Pick<
    CommunicationThreadRow,
    "id" | "thread_status" | "last_message_at" | "last_message_preview"
  >
): CommunicationReplyTriageThread {
  return {
    id: thread.id,
    threadStatus: thread.thread_status,
    lastMessageAt: thread.last_message_at,
    lastMessagePreview: thread.last_message_preview
  };
}

function mapMessageRowForReplyTriage(
  row: CommunicationMessageTriageRow
): CommunicationReplyTriageMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderType: row.sender_type,
    direction: row.direction,
    channelKind: row.channel_kind,
    messageKind: row.message_kind,
    visibility: row.visibility,
    body: row.body,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

async function listCommunicationReplyTriageMessages(input: {
  organizationId: string;
  threadIds: string[];
}) {
  if (input.threadIds.length === 0) {
    return [] as CommunicationReplyTriageMessage[];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("communication_messages")
    .select(
      `
        id,
        thread_id,
        sender_type,
        direction,
        channel_kind,
        message_kind,
        visibility,
        body,
        occurred_at,
        created_at
      `
    )
    .eq("company_id", input.organizationId)
    .in("thread_id", input.threadIds)
    .order("occurred_at", { ascending: false })
    .limit(1000);

  if (response.error) {
    throw new Error(
      `Unable to load communication reply triage messages: ${response.error.message}`
    );
  }

  return ((response.data as CommunicationMessageTriageRow[] | null) ?? []).map(
    mapMessageRowForReplyTriage
  );
}

function buildReplyTriageByThreadId(items: CommunicationReplyTriageItem[]) {
  return new Map(items.map((item) => [item.threadId, item]));
}

function buildUnreadByThreadId(rows: CommunicationNotificationRow[]) {
  const unreadByThreadId = new Map<string, ThreadUnreadState>();

  for (const row of rows) {
    const notificationEvent = row.notification_events?.[0] ?? null;
    const threadId = getThreadIdFromPayload(notificationEvent?.payload);

    if (!threadId) {
      continue;
    }

    const current = unreadByThreadId.get(threadId) ?? {
      count: 0,
      needsResponse: false,
      lastUnreadAt: null
    };
    const occurredAt = notificationEvent?.occurred_at ?? null;

    unreadByThreadId.set(threadId, {
      count: current.count + 1,
      needsResponse:
        current.needsResponse ||
        notificationEvent?.actor_type === "portal_user",
      lastUnreadAt:
        !current.lastUnreadAt ||
        (occurredAt && occurredAt > current.lastUnreadAt)
          ? occurredAt
          : current.lastUnreadAt
    });
  }

  return unreadByThreadId;
}

async function listUnreadCommunicationNotificationRows(input: {
  organizationId: string;
  userId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("notifications")
    .select(
      `
        id,
        notification_events (
          actor_type,
          occurred_at,
          payload
        )
      `
    )
    .eq("company_id", input.organizationId)
    .eq("user_id", input.userId)
    .eq("is_read", false)
    .eq("notification_events.category", "communication");

  if (response.error) {
    throw new Error(
      `Unable to load communication notifications: ${response.error.message}`
    );
  }

  return (response.data as CommunicationNotificationRow[] | null) ?? [];
}

function mapCustomerLabel(customer: CustomerRow | undefined) {
  if (!customer) {
    return "Unknown customer";
  }

  return customer.company_name
    ? `${customer.name} - ${customer.company_name}`
    : customer.name;
}

function getSubjectDescriptor(input: {
  thread: CommunicationThreadRow;
  customersById: Map<string, CustomerRow>;
  projectsById: Map<string, ProjectRow>;
  opportunitiesById: Map<string, OpportunityRow>;
  appointmentsById: Map<string, AppointmentRow>;
  estimatesById: Map<string, EstimateRow>;
  contractsById: Map<string, ContractRow>;
  invoicesById: Map<string, InvoiceRow>;
  changeOrdersById: Map<string, ChangeOrderRow>;
  paymentsById: Map<string, PaymentRow>;
}): SubjectDescriptor {
  const { thread } = input;

  switch (thread.subject_type) {
    case "opportunity": {
      const opportunity = input.opportunitiesById.get(thread.subject_id);

      return {
        label: opportunity
          ? `Lead - ${opportunity.title || opportunity.prospect_name}`
          : "Lead",
        href: `/leads/${thread.subject_id}`
      };
    }
    case "appointment": {
      const appointment = input.appointmentsById.get(thread.subject_id);

      return {
        label: appointment
          ? `Appointment - ${appointment.title}`
          : "Appointment",
        href: `/appointments/${thread.subject_id}`
      };
    }
    case "customer": {
      const customer = input.customersById.get(thread.subject_id);

      return {
        label: customer
          ? `Customer - ${mapCustomerLabel(customer)}`
          : "Customer",
        href: `/customers/${thread.subject_id}`
      };
    }
    case "project": {
      const project = input.projectsById.get(thread.subject_id);

      return {
        label: project ? `Project - ${project.name}` : "Project",
        href: `/projects/${thread.subject_id}`
      };
    }
    case "estimate": {
      const estimate = input.estimatesById.get(thread.subject_id);

      return {
        label: estimate ? `Estimate ${estimate.reference_number}` : "Estimate",
        href: `/estimates/${thread.subject_id}`
      };
    }
    case "contract": {
      const contract = input.contractsById.get(thread.subject_id);

      return {
        label: contract ? `Contract ${contract.reference_number}` : "Contract",
        href: `/contracts/${thread.subject_id}`
      };
    }
    case "invoice": {
      const invoice = input.invoicesById.get(thread.subject_id);

      return {
        label: invoice ? `Invoice ${invoice.reference_number}` : "Invoice",
        href: `/invoices/${thread.subject_id}`
      };
    }
    case "change_order": {
      const changeOrder = input.changeOrdersById.get(thread.subject_id);

      return {
        label: changeOrder
          ? `Change order ${changeOrder.reference_number}`
          : "Change order",
        href: `/change-orders/${thread.subject_id}`
      };
    }
    case "payment": {
      const payment = input.paymentsById.get(thread.subject_id);

      return {
        label: payment
          ? `Payment ${formatCurrency(payment.amount)} on ${formatPaymentDate(payment.payment_date)}`
          : "Payment",
        href: "/payments",
        secondaryLink:
          payment?.invoice_id && payment.invoices?.[0]?.reference_number
            ? {
                label: `Invoice ${payment.invoices[0].reference_number}`,
                href: `/invoices/${payment.invoice_id}`
              }
            : null
      };
    }
    default:
      return {
        label: "Record",
        href: "/dashboard"
      };
  }
}

async function loadSubjectRows<T>(
  table: string,
  select: string,
  ids: string[],
  organizationId: string
) {
  if (ids.length === 0) {
    return [] as T[];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from(table)
    .select(select)
    .eq("company_id", organizationId)
    .in("id", ids);

  if (response.error) {
    throw new Error(`Unable to load ${table}: ${response.error.message}`);
  }

  return (response.data as T[] | null) ?? [];
}

const listContractorCommunicationThreadSummaryCached = cache(
  async (): Promise<ContractorCommunicationThreadSummary> => {
    const user = await requireAuthenticatedUser("/communications");
    const organizationContext = await getActiveOrganizationContext(user.id);

    if (!organizationContext) {
      return {
        totalCount: 0,
        needsResponseCount: 0,
        unreadCount: 0,
        recentCount: 0,
        linkedProjectCount: 0,
        sourceCounts: {
          opportunity: 0,
          appointment: 0,
          customer: 0,
          project: 0,
          estimate: 0,
          contract: 0,
          invoice: 0,
          change_order: 0,
          payment: 0
        }
      };
    }

    const organizationId = organizationContext.organization.id;
    const supabase = await getSupabaseServerClient();
    const [threadsResponse, unreadCommunicationNotificationRows] =
      await Promise.all([
        supabase
          .from("communication_threads")
          .select(
            `
            id,
            project_id,
            subject_type,
            thread_status,
            last_message_preview,
            last_message_at
          `
          )
          .eq("company_id", organizationId),
        listUnreadCommunicationNotificationRows({
          organizationId,
          userId: user.id
        })
      ]);

    if (threadsResponse.error) {
      throw new Error(
        `Unable to load communication threads: ${threadsResponse.error.message}`
      );
    }

    const threadRows =
      (threadsResponse.data as CommunicationThreadSummaryRow[] | null) ?? [];
    const unreadByThreadId = buildUnreadByThreadId(
      unreadCommunicationNotificationRows
    );
    const replyTriage = deriveCommunicationReplyTriage({
      threads: threadRows.map((thread) => ({
        id: thread.id,
        threadStatus: thread.thread_status,
        lastMessageAt: thread.last_message_at,
        lastMessagePreview: thread.last_message_preview
      })),
      messages: await listCommunicationReplyTriageMessages({
        organizationId,
        threadIds: threadRows.map((thread) => thread.id)
      })
    });
    const replyTriageByThreadId = buildReplyTriageByThreadId(replyTriage.items);
    const sourceCounts: ContractorCommunicationThreadSummary["sourceCounts"] = {
      opportunity: 0,
      appointment: 0,
      customer: 0,
      project: 0,
      estimate: 0,
      contract: 0,
      invoice: 0,
      change_order: 0,
      payment: 0
    };

    let unreadCount = 0;
    let needsResponseCount = 0;
    let recentCount = 0;

    for (const thread of threadRows) {
      sourceCounts[thread.subject_type] += 1;

      if (isRecentThreadRow(thread)) {
        recentCount += 1;
      }

      const unreadState = unreadByThreadId.get(thread.id);

      if (unreadState?.count) {
        unreadCount += 1;
      }

      if (
        unreadState?.needsResponse ||
        replyTriageByThreadId.get(thread.id)?.needsResponse
      ) {
        needsResponseCount += 1;
      }
    }

    return {
      totalCount: threadRows.length,
      needsResponseCount,
      unreadCount,
      recentCount,
      linkedProjectCount: new Set(
        threadRows
          .map((thread) => thread.project_id)
          .filter((projectId): projectId is string => Boolean(projectId))
      ).size,
      sourceCounts
    };
  }
);

const listContractorCommunicationThreadsCached = cache(
  async (
    view: ContractorCommunicationThreadView,
    source: ContractorCommunicationSourceFilter
  ): Promise<ContractorCommunicationThreadListItem[]> => {
    const user = await requireAuthenticatedUser("/communications");
    const organizationContext = await getActiveOrganizationContext(user.id);

    if (!organizationContext) {
      return [];
    }

    const organizationId = organizationContext.organization.id;
    const supabase = await getSupabaseServerClient();
    const unreadCommunicationNotificationRows =
      await listUnreadCommunicationNotificationRows({
        organizationId,
        userId: user.id
      });
    const unreadByThreadId = buildUnreadByThreadId(
      unreadCommunicationNotificationRows
    );
    const matchingUnreadThreadIds =
      view === "unread" ? [...unreadByThreadId.keys()] : [];

    if (view === "unread" && matchingUnreadThreadIds.length === 0) {
      return [];
    }

    let threadsQuery = supabase
      .from("communication_threads")
      .select(
        `
          id,
          company_id,
          opportunity_id,
          customer_id,
          project_id,
          subject_type,
          subject_id,
          created_by_user_id,
          thread_category,
          channel_kind,
          thread_status,
          last_message_at,
          last_message_preview,
          last_message_visibility,
          created_at,
          updated_at
        `
      )
      .eq("company_id", organizationId);

    if (source !== "all") {
      threadsQuery = threadsQuery.eq("subject_type", source);
    }

    if (view === "recent") {
      threadsQuery = threadsQuery.gte("last_message_at", getRecentCutoffIso());
    }

    if (view === "unread") {
      threadsQuery = threadsQuery.in("id", matchingUnreadThreadIds);
    }

    const threadsResponse = await threadsQuery
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (threadsResponse.error) {
      throw new Error(
        `Unable to load communication threads: ${threadsResponse.error.message}`
      );
    }

    const threadRows =
      (threadsResponse.data as CommunicationThreadRow[] | null) ?? [];

    if (threadRows.length === 0) {
      return [];
    }

    const replyTriage = deriveCommunicationReplyTriage({
      threads: threadRows.map(mapThreadRowForReplyTriage),
      messages: await listCommunicationReplyTriageMessages({
        organizationId,
        threadIds: threadRows.map((thread) => thread.id)
      })
    });
    const replyTriageByThreadId = buildReplyTriageByThreadId(replyTriage.items);

    const customerIds = [
      ...new Set(
        threadRows
          .map((thread) => thread.customer_id)
          .filter((customerId): customerId is string => Boolean(customerId))
      )
    ];
    const projectIds = [
      ...new Set(
        threadRows
          .map((thread) => thread.project_id)
          .filter((projectId): projectId is string => Boolean(projectId))
      )
    ];
    const subjectIdsByType = {
      opportunity: threadRows
        .filter((thread) => thread.subject_type === "opportunity")
        .map((thread) => thread.subject_id),
      appointment: threadRows
        .filter((thread) => thread.subject_type === "appointment")
        .map((thread) => thread.subject_id),
      customer: threadRows
        .filter((thread) => thread.subject_type === "customer")
        .map((thread) => thread.subject_id),
      project: threadRows
        .filter((thread) => thread.subject_type === "project")
        .map((thread) => thread.subject_id),
      estimate: threadRows
        .filter((thread) => thread.subject_type === "estimate")
        .map((thread) => thread.subject_id),
      contract: threadRows
        .filter((thread) => thread.subject_type === "contract")
        .map((thread) => thread.subject_id),
      invoice: threadRows
        .filter((thread) => thread.subject_type === "invoice")
        .map((thread) => thread.subject_id),
      change_order: threadRows
        .filter((thread) => thread.subject_type === "change_order")
        .map((thread) => thread.subject_id),
      payment: threadRows
        .filter((thread) => thread.subject_type === "payment")
        .map((thread) => thread.subject_id)
    };

    const [
      customerRows,
      projectRows,
      opportunityRows,
      appointmentRows,
      estimateRows,
      contractRows,
      invoiceRows,
      changeOrderRows,
      paymentRows
    ] = await Promise.all([
      loadSubjectRows<CustomerRow>(
        "customers",
        "id, name, company_name",
        customerIds,
        organizationId
      ),
      loadSubjectRows<ProjectRow>(
        "projects",
        "id, name",
        projectIds,
        organizationId
      ),
      loadSubjectRows<OpportunityRow>(
        "opportunities",
        "id, title, prospect_name",
        [...new Set(subjectIdsByType.opportunity)],
        organizationId
      ),
      loadSubjectRows<AppointmentRow>(
        "appointments",
        "id, title, appointment_type, starts_at",
        [...new Set(subjectIdsByType.appointment)],
        organizationId
      ),
      loadSubjectRows<EstimateRow>(
        "estimates",
        "id, reference_number",
        [...new Set(subjectIdsByType.estimate)],
        organizationId
      ),
      loadSubjectRows<ContractRow>(
        "contracts",
        "id, reference_number, title",
        [...new Set(subjectIdsByType.contract)],
        organizationId
      ),
      loadSubjectRows<InvoiceRow>(
        "invoices",
        "id, reference_number",
        [...new Set(subjectIdsByType.invoice)],
        organizationId
      ),
      loadSubjectRows<ChangeOrderRow>(
        "change_orders",
        "id, reference_number, title",
        [...new Set(subjectIdsByType.change_order)],
        organizationId
      ),
      subjectIdsByType.payment.length > 0
        ? (async () => {
            const response = await supabase
              .from("payments")
              .select(
                `
                  id,
                  invoice_id,
                  amount,
                  payment_date,
                  invoices (
                    reference_number
                  )
                `
              )
              .eq("company_id", organizationId)
              .in("id", [...new Set(subjectIdsByType.payment)]);

            if (response.error) {
              throw new Error(
                `Unable to load payments: ${response.error.message}`
              );
            }

            return (response.data as PaymentRow[] | null) ?? [];
          })()
        : Promise.resolve([] as PaymentRow[])
    ]);

    const customersById = new Map(customerRows.map((row) => [row.id, row]));
    const projectsById = new Map(projectRows.map((row) => [row.id, row]));
    const opportunitiesById = new Map(
      opportunityRows.map((row) => [row.id, row])
    );
    const appointmentsById = new Map(
      appointmentRows.map((row) => [row.id, row])
    );
    const estimatesById = new Map(estimateRows.map((row) => [row.id, row]));
    const contractsById = new Map(contractRows.map((row) => [row.id, row]));
    const invoicesById = new Map(invoiceRows.map((row) => [row.id, row]));
    const changeOrdersById = new Map(
      changeOrderRows.map((row) => [row.id, row])
    );
    const paymentsById = new Map(paymentRows.map((row) => [row.id, row]));

    return threadRows
      .map((thread) => {
        const customer = thread.customer_id
          ? customersById.get(thread.customer_id)
          : undefined;
        const project = thread.project_id
          ? projectsById.get(thread.project_id)
          : undefined;
        const unreadState = unreadByThreadId.get(thread.id);
        const replyTriageItem = replyTriageByThreadId.get(thread.id);
        const subject = getSubjectDescriptor({
          thread,
          customersById,
          projectsById,
          opportunitiesById,
          appointmentsById,
          estimatesById,
          contractsById,
          invoicesById,
          changeOrdersById,
          paymentsById
        });

        return {
          id: thread.id,
          threadCategory: thread.thread_category,
          channelKind: thread.channel_kind,
          threadStatus: thread.thread_status,
          customer: {
            id: thread.customer_id ?? "",
            label: mapCustomerLabel(customer),
            href: thread.customer_id
              ? `/customers/${thread.customer_id}`
              : subject.href
          },
          project: {
            id: thread.project_id ?? "",
            label: project?.name ?? "Unknown project",
            href: thread.project_id
              ? `/projects/${thread.project_id}`
              : subject.href
          },
          subject: {
            type: thread.subject_type,
            id: thread.subject_id,
            label: subject.label,
            href: subject.href
          },
          subjectSecondaryLink: subject.secondaryLink ?? null,
          lastMessageAt: thread.last_message_at,
          lastMessagePreview: thread.last_message_preview,
          lastMessageVisibility: thread.last_message_visibility,
          unreadCount: unreadState?.count ?? 0,
          needsResponse:
            Boolean(unreadState?.needsResponse) ||
            Boolean(replyTriageItem?.needsResponse),
          lastUnreadAt: unreadState?.lastUnreadAt ?? null,
          customerReplyNeedsResponse: replyTriageItem?.needsResponse ?? false,
          latestCustomerReplyAt: replyTriageItem?.latestCustomerReplyAt ?? null,
          latestCustomerReplyPreview:
            replyTriageItem?.latestCustomerReplyPreview ?? null,
          lastActivityAt: getThreadActivityAt(
            thread,
            replyTriageItem?.latestCustomerReplyAt ??
              unreadState?.lastUnreadAt ??
              null
          ),
          createdAt: thread.created_at,
          updatedAt: thread.updated_at
        } satisfies ContractorCommunicationThreadListItem;
      })
      .filter((thread) =>
        view === "needs_response" ? thread.needsResponse : true
      )
      .sort((left, right) =>
        right.lastActivityAt.localeCompare(left.lastActivityAt)
      );
  }
);

export async function listContractorCommunicationThreadSummary() {
  return listContractorCommunicationThreadSummaryCached();
}

export async function listContractorCommunicationThreads(
  filters: ContractorCommunicationThreadListFilters = {}
) {
  return listContractorCommunicationThreadsCached(
    filters.view ?? "all",
    filters.source ?? "all"
  );
}

export async function listContractorCommunicationContextEvents(): Promise<
  ContractorCommunicationContextEvent[]
> {
  const user = await requireAuthenticatedUser("/communications");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return [];
  }

  const organizationId = organizationContext.organization.id;
  const supabase = await getSupabaseServerClient();
  const [documentDeliveryResponse, evidenceDeliveryResponse] =
    await Promise.all([
      supabase
        .from("document_delivery_events")
        .select(
          `
            id,
            subject_type,
            subject_id,
            event_type,
            channel,
            recipient_name,
            recipient_email,
            provider,
            created_at
          `
        )
        .eq("company_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("portal_evidence_delivery_events")
        .select(
          `
            id,
            project_id,
            portal_evidence_grant_id,
            event_type,
            actor_kind,
            occurred_at,
            created_at
          `
        )
        .eq("company_id", organizationId)
        .order("occurred_at", { ascending: false })
        .limit(12)
    ]);

  if (documentDeliveryResponse.error) {
    throw new Error(
      `Unable to load communication delivery context: ${documentDeliveryResponse.error.message}`
    );
  }

  if (evidenceDeliveryResponse.error) {
    throw new Error(
      `Unable to load shared evidence communication context: ${evidenceDeliveryResponse.error.message}`
    );
  }

  const documentEvents = (
    (documentDeliveryResponse.data as DocumentDeliveryContextRow[] | null) ?? []
  ).map((event): ContractorCommunicationContextEvent => {
    const recipient =
      event.recipient_name ?? event.recipient_email ?? "customer recipient";
    const subjectLabel = getDocumentSubjectLabel(event.subject_type);

    return {
      id: `document:${event.id}`,
      kind: "document_delivery",
      sourceType: event.subject_type,
      sourceId: event.subject_id,
      eventType: event.event_type,
      title: `${subjectLabel} ${formatLabel(event.event_type)}`,
      description: `${formatLabel(event.event_type)} by ${formatLabel(event.channel)} for ${recipient}${event.provider ? ` through ${event.provider}` : ""}.`,
      href: getDocumentSubjectHref(event.subject_type, event.subject_id),
      occurredAt: event.created_at,
      tone: getDocumentDeliveryEventTone(event.event_type),
      audience: "customer",
      proofStateLabel: getDocumentDeliveryProofStateLabel(event.event_type),
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: getDocumentDeliveryProofSourceLabel(event),
      needsReview:
        event.event_type === "failed" || event.event_type === "bounced"
    };
  });

  const evidenceEvents = (
    (evidenceDeliveryResponse.data as
      | PortalEvidenceDeliveryContextRow[]
      | null) ?? []
  ).map(
    (event): ContractorCommunicationContextEvent => ({
      id: `shared-evidence:${event.id}`,
      kind: "shared_evidence",
      sourceType: "shared_evidence",
      sourceId: event.portal_evidence_grant_id,
      eventType: event.event_type,
      title: `Shared evidence ${formatLabel(event.event_type)}`,
      description:
        event.actor_kind === "portal_customer"
          ? `Customer portal ${formatLabel(event.event_type)} activity was recorded for shared evidence.`
          : `Contractor ${formatLabel(event.event_type)} activity was recorded for shared evidence.`,
      href: `/projects/${event.project_id}#project-evidence`,
      occurredAt: event.occurred_at,
      tone: getEvidenceDeliveryEventTone(event.event_type),
      audience:
        event.actor_kind === "portal_customer" ? "customer" : "internal",
      proofStateLabel: getEvidenceDeliveryProofStateLabel(event.event_type),
      proofBoundaryLabel: "Read-only evidence proof",
      proofSourceLabel:
        event.actor_kind === "portal_customer"
          ? "Customer-facing"
          : "Internal evidence",
      needsReview: event.event_type === "revoked"
    })
  );

  return [...documentEvents, ...evidenceEvents].sort((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt)
  );
}
