import "server-only";

import { cache } from "react";
import type { CanonicalRecordSubjectType } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CommunicationThreadRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  subject_type: CanonicalRecordSubjectType;
  subject_id: string;
  created_by_user_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
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
  notification_events?:
    | Array<{
        actor_type: "organization_user" | "portal_user" | "provider" | "system";
        occurred_at: string;
        payload: Record<string, unknown> | null;
      }>
    | null;
};

type ThreadUnreadState = {
  count: number;
  needsResponse: boolean;
  lastUnreadAt: string | null;
};

type CommunicationThreadSummaryRow = Pick<
  CommunicationThreadRow,
  "id" | "project_id" | "subject_type" | "last_message_at"
>;

const RECENT_WINDOW_DAYS = 14;

export type ContractorCommunicationThreadView = "all" | "needs_response" | "unread" | "recent";
export type ContractorCommunicationSourceFilter = "all" | CanonicalRecordSubjectType;

export type ContractorCommunicationThreadListFilters = {
  view?: ContractorCommunicationThreadView;
  source?: ContractorCommunicationSourceFilter;
};

export type ContractorCommunicationThreadListItem = {
  id: string;
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
  unreadCount: number;
  needsResponse: boolean;
  lastUnreadAt: string | null;
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

type SubjectDescriptor = {
  label: string;
  href: string;
  secondaryLink?: {
    label: string;
    href: string;
  } | null;
};

function getThreadActivityAt(row: CommunicationThreadRow, lastUnreadAt: string | null) {
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

function getThreadIdFromPayload(payload: Record<string, unknown> | null | undefined) {
  return typeof payload?.threadId === "string" ? payload.threadId : null;
}

function getRecentCutoffIso() {
  return new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function isRecentThreadRow(thread: Pick<CommunicationThreadRow, "last_message_at">) {
  return Boolean(thread.last_message_at && thread.last_message_at >= getRecentCutoffIso());
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
      needsResponse: current.needsResponse || notificationEvent?.actor_type === "portal_user",
      lastUnreadAt:
        !current.lastUnreadAt || (occurredAt && occurredAt > current.lastUnreadAt)
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
    throw new Error(`Unable to load communication notifications: ${response.error.message}`);
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
  estimatesById: Map<string, EstimateRow>;
  contractsById: Map<string, ContractRow>;
  invoicesById: Map<string, InvoiceRow>;
  changeOrdersById: Map<string, ChangeOrderRow>;
  paymentsById: Map<string, PaymentRow>;
}): SubjectDescriptor {
  const { thread } = input;

  switch (thread.subject_type) {
    case "customer": {
      const customer = input.customersById.get(thread.subject_id);

      return {
        label: customer ? `Customer - ${mapCustomerLabel(customer)}` : "Customer",
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

  return ((response.data as T[] | null) ?? []);
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
    const [threadsResponse, unreadCommunicationNotificationRows] = await Promise.all([
      supabase
        .from("communication_threads")
        .select(
          `
            id,
            project_id,
            subject_type,
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
      throw new Error(`Unable to load communication threads: ${threadsResponse.error.message}`);
    }

    const threadRows = (threadsResponse.data as CommunicationThreadSummaryRow[] | null) ?? [];
    const unreadByThreadId = buildUnreadByThreadId(unreadCommunicationNotificationRows);
    const sourceCounts: ContractorCommunicationThreadSummary["sourceCounts"] = {
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

      if (unreadState?.needsResponse) {
        needsResponseCount += 1;
      }
    }

    return {
      totalCount: threadRows.length,
      needsResponseCount,
      unreadCount,
      recentCount,
      linkedProjectCount: new Set(threadRows.map((thread) => thread.project_id)).size,
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
    const unreadCommunicationNotificationRows = await listUnreadCommunicationNotificationRows({
      organizationId,
      userId: user.id
    });
    const unreadByThreadId = buildUnreadByThreadId(unreadCommunicationNotificationRows);
    const matchingUnreadThreadIds =
      view === "needs_response"
        ? [...unreadByThreadId.entries()]
            .filter(([, state]) => state.needsResponse)
            .map(([threadId]) => threadId)
        : view === "unread"
          ? [...unreadByThreadId.keys()]
          : [];

    if ((view === "needs_response" || view === "unread") && matchingUnreadThreadIds.length === 0) {
      return [];
    }

    let threadsQuery = supabase
      .from("communication_threads")
      .select(
        `
          id,
          company_id,
          customer_id,
          project_id,
          subject_type,
          subject_id,
          created_by_user_id,
          last_message_at,
          last_message_preview,
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

    if (view === "needs_response" || view === "unread") {
      threadsQuery = threadsQuery.in("id", matchingUnreadThreadIds);
    }

    const threadsResponse = await threadsQuery
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (threadsResponse.error) {
      throw new Error(`Unable to load communication threads: ${threadsResponse.error.message}`);
    }

    const threadRows = (threadsResponse.data as CommunicationThreadRow[] | null) ?? [];

    if (threadRows.length === 0) {
      return [];
    }

    const customerIds = [...new Set(threadRows.map((thread) => thread.customer_id))];
    const projectIds = [...new Set(threadRows.map((thread) => thread.project_id))];
    const subjectIdsByType = {
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
      estimateRows,
      contractRows,
      invoiceRows,
      changeOrderRows,
      paymentRows,
    ] = await Promise.all([
      loadSubjectRows<CustomerRow>("customers", "id, name, company_name", customerIds, organizationId),
      loadSubjectRows<ProjectRow>("projects", "id, name", projectIds, organizationId),
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
              throw new Error(`Unable to load payments: ${response.error.message}`);
            }

            return (response.data as PaymentRow[] | null) ?? [];
          })()
        : Promise.resolve([] as PaymentRow[])
    ]);

    const customersById = new Map(customerRows.map((row) => [row.id, row]));
    const projectsById = new Map(projectRows.map((row) => [row.id, row]));
    const estimatesById = new Map(estimateRows.map((row) => [row.id, row]));
    const contractsById = new Map(contractRows.map((row) => [row.id, row]));
    const invoicesById = new Map(invoiceRows.map((row) => [row.id, row]));
    const changeOrdersById = new Map(changeOrderRows.map((row) => [row.id, row]));
    const paymentsById = new Map(paymentRows.map((row) => [row.id, row]));

    return threadRows
      .map((thread) => {
        const customer = customersById.get(thread.customer_id);
        const project = projectsById.get(thread.project_id);
        const unreadState = unreadByThreadId.get(thread.id);
        const subject = getSubjectDescriptor({
          thread,
          customersById,
          projectsById,
          estimatesById,
          contractsById,
          invoicesById,
          changeOrdersById,
          paymentsById
        });

        return {
          id: thread.id,
          customer: {
            id: thread.customer_id,
            label: mapCustomerLabel(customer),
            href: `/customers/${thread.customer_id}`
          },
          project: {
            id: thread.project_id,
            label: project?.name ?? "Unknown project",
            href: `/projects/${thread.project_id}`
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
          unreadCount: unreadState?.count ?? 0,
          needsResponse: unreadState?.needsResponse ?? false,
          lastUnreadAt: unreadState?.lastUnreadAt ?? null,
          lastActivityAt: getThreadActivityAt(thread, unreadState?.lastUnreadAt ?? null),
          createdAt: thread.created_at,
          updatedAt: thread.updated_at
        } satisfies ContractorCommunicationThreadListItem;
      })
      .sort((left, right) => right.lastActivityAt.localeCompare(left.lastActivityAt));
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
