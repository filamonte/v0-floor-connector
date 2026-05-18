import "server-only";

import { cache } from "react";
import type {
  ChangeOrderStatus,
  ContractStatus,
  InvoiceStatus
} from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ChangeOrdersManagerView =
  | "all"
  | "draft"
  | "sent"
  | "approved"
  | "rejected";

export type ChangeOrdersManagerChangeOrder = {
  id: string;
  title: string;
  status: ChangeOrderStatus;
  priceAdjustment: string;
  appliedInvoiceLineItemId: string | null;
  customerViewedAt: string | null;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  contract: {
    id: string;
    title: string;
  } | null;
  invoice: {
    id: string;
    referenceNumber: string;
  } | null;
};

export type ChangeOrderProjectOption = {
  id: string;
  name: string;
  customerId: string;
  customerName: string | null;
};

export type ChangeOrderContractOption = {
  id: string;
  projectId: string;
  title: string;
  status: ContractStatus;
};

export type ChangeOrderInvoiceOption = {
  id: string;
  projectId: string;
  referenceNumber: string;
  status: InvoiceStatus;
};

export type ChangeOrdersManagerReadModel = {
  changeOrders: ChangeOrdersManagerChangeOrder[];
  counts: Record<ChangeOrdersManagerView, number>;
  projectOptions: ChangeOrderProjectOption[];
  contractOptions: ChangeOrderContractOption[];
  invoiceOptions: ChangeOrderInvoiceOption[];
};

type ChangeOrdersManagerRow = {
  id: string;
  title: string;
  status: ChangeOrderStatus;
  price_adjustment: string | number;
  applied_invoice_line_item_id: string | null;
  customer_viewed_at: string | null;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
  projects?:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
  contracts?:
    | {
        id: string;
        title: string;
      }
    | Array<{
        id: string;
        title: string;
      }>
    | null;
  invoices?:
    | {
        id: string;
        reference_number: string;
      }
    | Array<{
        id: string;
        reference_number: string;
      }>
    | null;
};

type IdRow = {
  id: string;
};

type ProjectOptionRow = {
  id: string;
  customer_id: string;
  name: string;
  customers?:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
};

type ContractOptionRow = {
  id: string;
  project_id: string;
  title: string;
  status: ContractStatus;
};

type InvoiceOptionRow = {
  id: string;
  project_id: string;
  reference_number: string;
  status: InvoiceStatus;
};

const changeOrdersManagerViews: ChangeOrdersManagerView[] = [
  "all",
  "draft",
  "sent",
  "approved",
  "rejected"
];

const changeOrderStatuses: Exclude<ChangeOrdersManagerView, "all">[] = [
  "draft",
  "sent",
  "approved",
  "rejected"
];

const changeOrdersManagerSelect = `
  id,
  title,
  status,
  price_adjustment,
  applied_invoice_line_item_id,
  customer_viewed_at,
  updated_at,
  customers (
    id,
    name
  ),
  projects (
    id,
    name
  ),
  contracts (
    id,
    title
  ),
  invoices (
    id,
    reference_number
  )
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function formatMoneyValue(value: string | number) {
  return Number(value).toFixed(2);
}

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapChangeOrder(
  row: ChangeOrdersManagerRow
): ChangeOrdersManagerChangeOrder {
  const customer = getSingleRelation(row.customers);
  const project = getSingleRelation(row.projects);
  const contract = getSingleRelation(row.contracts);
  const invoice = getSingleRelation(row.invoices);

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priceAdjustment: formatMoneyValue(row.price_adjustment),
    appliedInvoiceLineItemId: row.applied_invoice_line_item_id,
    customerViewedAt: row.customer_viewed_at,
    updatedAt: row.updated_at,
    customer: customer
      ? {
          id: customer.id,
          name: customer.name
        }
      : null,
    project: project
      ? {
          id: project.id,
          name: project.name
        }
      : null,
    contract: contract
      ? {
          id: contract.id,
          title: contract.title
        }
      : null,
    invoice: invoice
      ? {
          id: invoice.id,
          referenceNumber: invoice.reference_number
        }
      : null
  };
}

async function countChangeOrders(input: {
  organizationId: string;
  status?: ChangeOrderStatus;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("change_orders")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  if (input.status) {
    query = query.eq("status", input.status);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count change orders: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function findChangeOrderRelatedSearchIds(input: {
  organizationId: string;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  const escapedQuery = escapeLikePattern(input.query);
  const [customerResponse, projectResponse, contractResponse, invoiceResponse] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`name.ilike.%${escapedQuery}%`),
      supabase
        .from("projects")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`name.ilike.%${escapedQuery}%`),
      supabase
        .from("contracts")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`title.ilike.%${escapedQuery}%`),
      supabase
        .from("invoices")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`reference_number.ilike.%${escapedQuery}%`)
    ]);

  if (customerResponse.error) {
    throw new Error(
      `Unable to load change-order search customer matches: ${customerResponse.error.message}`
    );
  }

  if (projectResponse.error) {
    throw new Error(
      `Unable to load change-order search project matches: ${projectResponse.error.message}`
    );
  }

  if (contractResponse.error) {
    throw new Error(
      `Unable to load change-order search contract matches: ${contractResponse.error.message}`
    );
  }

  if (invoiceResponse.error) {
    throw new Error(
      `Unable to load change-order search invoice matches: ${invoiceResponse.error.message}`
    );
  }

  return {
    customerIds: Array.isArray(customerResponse.data)
      ? (customerResponse.data as IdRow[]).map((row) => row.id)
      : [],
    projectIds: Array.isArray(projectResponse.data)
      ? (projectResponse.data as IdRow[]).map((row) => row.id)
      : [],
    contractIds: Array.isArray(contractResponse.data)
      ? (contractResponse.data as IdRow[]).map((row) => row.id)
      : [],
    invoiceIds: Array.isArray(invoiceResponse.data)
      ? (invoiceResponse.data as IdRow[]).map((row) => row.id)
      : []
  };
}

async function buildChangeOrderSearchPredicates(input: {
  organizationId: string;
  query?: string;
}) {
  const trimmedQuery = input.query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const escapedQuery = escapeLikePattern(trimmedQuery);
  const relatedIds = await findChangeOrderRelatedSearchIds({
    organizationId: input.organizationId,
    query: trimmedQuery
  });

  return [
    `title.ilike.%${escapedQuery}%`,
    ...(relatedIds.customerIds.length > 0
      ? [`customer_id.in.(${relatedIds.customerIds.join(",")})`]
      : []),
    ...(relatedIds.projectIds.length > 0
      ? [`project_id.in.(${relatedIds.projectIds.join(",")})`]
      : []),
    ...(relatedIds.contractIds.length > 0
      ? [`contract_id.in.(${relatedIds.contractIds.join(",")})`]
      : []),
    ...(relatedIds.invoiceIds.length > 0
      ? [`invoice_id.in.(${relatedIds.invoiceIds.join(",")})`]
      : [])
  ];
}

async function listChangeOrdersForManager(input: {
  organizationId: string;
  view?: ChangeOrdersManagerView;
  query?: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = await buildChangeOrderSearchPredicates({
    organizationId: input.organizationId,
    query: input.query
  });
  let query = supabase
    .from("change_orders")
    .select(changeOrdersManagerSelect)
    .eq("company_id", input.organizationId)
    .order("updated_at", { ascending: false })
    .limit(input.limit);

  if (input.view && input.view !== "all") {
    query = query.eq("status", input.view);
  }

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load change orders manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as ChangeOrdersManagerRow[]).map(mapChangeOrder)
    : [];
}

async function listProjectOptionsForManager(
  organizationId: string
): Promise<ChangeOrderProjectOption[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select(
      `
        id,
        customer_id,
        name,
        customers (
          id,
          name
        )
      `
    )
    .eq("company_id", organizationId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load change-order project options: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as unknown as ProjectOptionRow[])
    : [];

  return rows.map((project) => {
    const customer = getSingleRelation(project.customers);

    return {
      id: project.id,
      name: project.name,
      customerId: project.customer_id,
      customerName: customer?.name ?? null
    };
  });
}

async function listContractOptionsForManager(
  organizationId: string
): Promise<ChangeOrderContractOption[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select("id,project_id,title,status")
    .eq("company_id", organizationId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load change-order contract options: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as ContractOptionRow[]).map((contract) => ({
        id: contract.id,
        projectId: contract.project_id,
        title: contract.title,
        status: contract.status
      }))
    : [];
}

async function listInvoiceOptionsForManager(
  organizationId: string
): Promise<ChangeOrderInvoiceOption[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select("id,project_id,reference_number,status")
    .eq("company_id", organizationId)
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load change-order invoice options: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as InvoiceOptionRow[]).map((invoice) => ({
        id: invoice.id,
        projectId: invoice.project_id,
        referenceNumber: invoice.reference_number,
        status: invoice.status
      }))
    : [];
}

async function listChangeOrderQuickCreateOptions(input: {
  organizationId: string;
  enabled: boolean;
}) {
  if (!input.enabled) {
    return {
      projectOptions: [],
      contractOptions: [],
      invoiceOptions: []
    };
  }

  const [projectOptions, contractOptions, invoiceOptions] = await Promise.all([
    listProjectOptionsForManager(input.organizationId),
    listContractOptionsForManager(input.organizationId),
    listInvoiceOptionsForManager(input.organizationId)
  ]);

  return {
    projectOptions,
    contractOptions,
    invoiceOptions
  };
}

export const getChangeOrdersManagerReadModel = cache(
  async (input: {
    organizationId: string;
    view?: ChangeOrdersManagerView;
    query?: string;
    includeQuickCreateOptions?: boolean;
  }): Promise<ChangeOrdersManagerReadModel> => {
    const [
      allCount,
      draftCount,
      sentCount,
      approvedCount,
      rejectedCount,
      changeOrders,
      quickCreateOptions
    ] = await Promise.all([
      countChangeOrders({ organizationId: input.organizationId }),
      countChangeOrders({
        organizationId: input.organizationId,
        status: "draft"
      }),
      countChangeOrders({
        organizationId: input.organizationId,
        status: "sent"
      }),
      countChangeOrders({
        organizationId: input.organizationId,
        status: "approved"
      }),
      countChangeOrders({
        organizationId: input.organizationId,
        status: "rejected"
      }),
      listChangeOrdersForManager({
        organizationId: input.organizationId,
        view: input.view,
        query: input.query,
        limit: 20
      }),
      listChangeOrderQuickCreateOptions({
        organizationId: input.organizationId,
        enabled: input.includeQuickCreateOptions ?? false
      })
    ]);

    return {
      changeOrders,
      counts: {
        all: allCount,
        draft: draftCount,
        sent: sentCount,
        approved: approvedCount,
        rejected: rejectedCount
      },
      projectOptions: quickCreateOptions.projectOptions,
      contractOptions: quickCreateOptions.contractOptions,
      invoiceOptions: quickCreateOptions.invoiceOptions
    };
  }
);

export function isChangeOrdersManagerView(
  value: string | null | undefined
): value is ChangeOrdersManagerView {
  return changeOrdersManagerViews.includes(value as ChangeOrdersManagerView);
}

export function isChangeOrderStatusView(
  value: ChangeOrdersManagerView
): value is Exclude<ChangeOrdersManagerView, "all"> {
  return changeOrderStatuses.includes(
    value as Exclude<ChangeOrdersManagerView, "all">
  );
}
