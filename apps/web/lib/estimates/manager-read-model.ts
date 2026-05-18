import "server-only";

import { cache } from "react";
import type { EstimateStatus } from "@floorconnector/types";

import type { PerspectiveView } from "@/lib/perspectives/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type EstimatesManagerView = "all" | EstimateStatus;

export type EstimatesManagerEstimate = {
  id: string;
  referenceNumber: string;
  title: string | null;
  status: EstimateStatus;
  estimateDate: string | null;
  totalAmount: string;
  sentByUserId: string | null;
  customerViewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  updatedAt: string;
  opportunity: {
    id: string;
    title: string;
    status: string;
  } | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
};

export type EstimateQuickCreateOpportunityOption = {
  id: string;
  title: string;
  customerId: string | null;
  contactName: string;
  customerName: string | null;
  jobType: string | null;
  siteName: string | null;
  status: string;
};

export type EstimateQuickCreateCustomerOption = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
};

export type EstimateQuickCreateProjectOption = {
  id: string;
  customerId: string;
  name: string;
  status: string;
};

export type EstimateQuickCreateOptions = {
  opportunities: EstimateQuickCreateOpportunityOption[];
  customers: EstimateQuickCreateCustomerOption[];
  projects: EstimateQuickCreateProjectOption[];
};

export type EstimatesManagerReadModel = {
  estimates: EstimatesManagerEstimate[];
  draftQueue: EstimatesManagerEstimate[];
  followUpQueue: EstimatesManagerEstimate[];
  approvedQueue: EstimatesManagerEstimate[];
  revisionQueue: EstimatesManagerEstimate[];
  recentClientResponses: EstimatesManagerEstimate[];
  counts: Record<EstimatesManagerView, number>;
  pipelineValue: string;
};

type EstimatesManagerEstimateRow = {
  id: string;
  reference_number: string;
  title: string | null;
  status: EstimateStatus;
  estimate_date: string | null;
  total_amount: string | number;
  sent_by: string | null;
  customer_viewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  updated_at: string;
  opportunities?: {
    id: string;
    title: string;
    status: string;
  } | null;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
  projects?: {
    id: string;
    name: string;
  } | null;
};

type EstimateAmountRow = {
  total_amount: string | number;
};

type IdRow = {
  id: string;
};

type EstimateQuickCreateOpportunityRow = {
  id: string;
  title: string;
  primary_contact_id: string | null;
  customer_id: string | null;
  job_type: string | null;
  site_name: string | null;
  prospect_name: string;
  status: string;
  customers?: {
    id: string;
    name: string;
    company_name: string | null;
  } | null;
};

type EstimateQuickCreateContactRow = {
  id: string;
  display_name: string | null;
};

type EstimateQuickCreateCustomerRow = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
};

type EstimateQuickCreateProjectRow = {
  id: string;
  customer_id: string;
  name: string;
  status: string;
};

const estimateStatuses: EstimateStatus[] = [
  "draft",
  "sent",
  "approved",
  "rejected"
];

const estimatesManagerSelect = `
  id,
  reference_number,
  title,
  status,
  estimate_date,
  total_amount,
  sent_by,
  customer_viewed_at,
  approved_at,
  rejected_at,
  created_by,
  updated_by,
  updated_at,
  opportunities (
    id,
    title,
    status
  ),
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name
  )
`;

const quickCreateOpportunitySelect = `
  id,
  title,
  primary_contact_id,
  customer_id,
  job_type,
  site_name,
  prospect_name,
  status,
  customers (
    id,
    name,
    company_name
  )
`;

const quickCreateCustomerSelect = `
  id,
  name,
  company_name,
  email,
  phone
`;

const quickCreateProjectSelect = `
  id,
  customer_id,
  name,
  status
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function getPerspectivePredicates(input: {
  perspective: PerspectiveView;
  userId: string;
}) {
  if (input.perspective === "company") {
    return [];
  }

  return [
    `created_by.eq.${input.userId}`,
    `updated_by.eq.${input.userId}`,
    `sent_by.eq.${input.userId}`
  ];
}

function applyPerspectiveFilter<
  T extends {
    or: (filters: string) => T;
  }
>(query: T, input: { perspective: PerspectiveView; userId: string }) {
  const predicates = getPerspectivePredicates(input);

  return predicates.length > 0 ? query.or(predicates.join(",")) : query;
}

function mapEstimate(
  row: EstimatesManagerEstimateRow
): EstimatesManagerEstimate {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    title: row.title,
    status: row.status,
    estimateDate: row.estimate_date,
    totalAmount: Number(row.total_amount).toFixed(2),
    sentByUserId: row.sent_by,
    customerViewedAt: row.customer_viewed_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    updatedAt: row.updated_at,
    opportunity: row.opportunities
      ? {
          id: row.opportunities.id,
          title: row.opportunities.title,
          status: row.opportunities.status
        }
      : null,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name
        }
      : null
  };
}

async function findEstimateRelatedSearchIds(input: {
  organizationId: string;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  const escapedQuery = escapeLikePattern(input.query);
  const [customerResponse, projectResponse, opportunityResponse] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(
          `name.ilike.%${escapedQuery}%,company_name.ilike.%${escapedQuery}%`
        ),
      supabase
        .from("projects")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`name.ilike.%${escapedQuery}%`),
      supabase
        .from("opportunities")
        .select("id")
        .eq("company_id", input.organizationId)
        .or(`title.ilike.%${escapedQuery}%`)
    ]);

  if (customerResponse.error) {
    throw new Error(
      `Unable to load estimate search customer matches: ${customerResponse.error.message}`
    );
  }

  if (projectResponse.error) {
    throw new Error(
      `Unable to load estimate search project matches: ${projectResponse.error.message}`
    );
  }

  if (opportunityResponse.error) {
    throw new Error(
      `Unable to load estimate search opportunity matches: ${opportunityResponse.error.message}`
    );
  }

  return {
    customerIds: Array.isArray(customerResponse.data)
      ? (customerResponse.data as IdRow[]).map((row) => row.id)
      : [],
    projectIds: Array.isArray(projectResponse.data)
      ? (projectResponse.data as IdRow[]).map((row) => row.id)
      : [],
    opportunityIds: Array.isArray(opportunityResponse.data)
      ? (opportunityResponse.data as IdRow[]).map((row) => row.id)
      : []
  };
}

async function buildEstimateSearchPredicates(input: {
  organizationId: string;
  query?: string;
}) {
  const trimmedQuery = input.query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const escapedQuery = escapeLikePattern(trimmedQuery);
  const relatedIds = await findEstimateRelatedSearchIds({
    organizationId: input.organizationId,
    query: trimmedQuery
  });
  const exactStatusMatches = estimateStatuses.filter((status) =>
    status.includes(trimmedQuery.toLowerCase())
  );

  return [
    `reference_number.ilike.%${escapedQuery}%`,
    `title.ilike.%${escapedQuery}%`,
    ...exactStatusMatches.map((status) => `status.eq.${status}`),
    ...(relatedIds.customerIds.length > 0
      ? [`customer_id.in.(${relatedIds.customerIds.join(",")})`]
      : []),
    ...(relatedIds.projectIds.length > 0
      ? [`project_id.in.(${relatedIds.projectIds.join(",")})`]
      : []),
    ...(relatedIds.opportunityIds.length > 0
      ? [`opportunity_id.in.(${relatedIds.opportunityIds.join(",")})`]
      : [])
  ];
}

async function countEstimates(input: {
  organizationId: string;
  perspective: PerspectiveView;
  userId: string;
  status?: EstimateStatus;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("estimates")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  query = applyPerspectiveFilter(query, input);

  if (input.status) {
    query = query.eq("status", input.status);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count estimates: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function sumEstimatePipelineValue(input: {
  organizationId: string;
  perspective: PerspectiveView;
  userId: string;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("estimates")
    .select("total_amount")
    .eq("company_id", input.organizationId);

  query = applyPerspectiveFilter(query, input);

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load estimate pipeline value inputs: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as EstimateAmountRow[])
    : [];

  return rows
    .reduce((sum, row) => sum + Number(row.total_amount), 0)
    .toFixed(2);
}

async function listEstimatesForManager(input: {
  organizationId: string;
  perspective: PerspectiveView;
  userId: string;
  query?: string;
  status?: EstimatesManagerView;
  responseOnly?: boolean;
  limit?: number;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = await buildEstimateSearchPredicates({
    organizationId: input.organizationId,
    query: input.query
  });

  let query = supabase
    .from("estimates")
    .select(estimatesManagerSelect)
    .eq("company_id", input.organizationId)
    .order("updated_at", { ascending: false });

  query = applyPerspectiveFilter(query, input);

  if (input.status && input.status !== "all") {
    query = query.eq("status", input.status);
  }

  if (input.responseOnly) {
    query = query.or(
      "approved_at.not.is.null,rejected_at.not.is.null,customer_viewed_at.not.is.null"
    );
  }

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  if (input.limit) {
    query = query.limit(input.limit);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load estimates manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as EstimatesManagerEstimateRow[]).map(
        mapEstimate
      )
    : [];
}

export const getEstimatesManagerReadModel = cache(
  async (input: {
    organizationId: string;
    userId: string;
    perspective: PerspectiveView;
    query?: string;
    status?: EstimatesManagerView;
  }): Promise<EstimatesManagerReadModel> => {
    const [
      allCount,
      draftCount,
      sentCount,
      approvedCount,
      rejectedCount,
      pipelineValue,
      estimates,
      draftQueue,
      followUpQueue,
      approvedQueue,
      revisionQueue,
      recentClientResponses
    ] = await Promise.all([
      countEstimates({
        organizationId: input.organizationId,
        perspective: input.perspective,
        userId: input.userId
      }),
      countEstimates({ ...input, status: "draft" }),
      countEstimates({ ...input, status: "sent" }),
      countEstimates({ ...input, status: "approved" }),
      countEstimates({ ...input, status: "rejected" }),
      sumEstimatePipelineValue(input),
      listEstimatesForManager({
        ...input,
        status: input.status,
        query: input.query
      }),
      listEstimatesForManager({ ...input, status: "draft", limit: 4 }),
      listEstimatesForManager({ ...input, status: "sent", limit: 4 }),
      listEstimatesForManager({ ...input, status: "approved", limit: 4 }),
      listEstimatesForManager({ ...input, status: "rejected", limit: 4 }),
      listEstimatesForManager({ ...input, responseOnly: true })
    ]);

    return {
      estimates,
      draftQueue,
      followUpQueue,
      approvedQueue,
      revisionQueue,
      recentClientResponses: recentClientResponses
        .sort((left, right) => {
          const leftDate =
            left.approvedAt ??
            left.rejectedAt ??
            left.customerViewedAt ??
            left.updatedAt;
          const rightDate =
            right.approvedAt ??
            right.rejectedAt ??
            right.customerViewedAt ??
            right.updatedAt;

          return rightDate.localeCompare(leftDate);
        })
        .slice(0, 5),
      counts: {
        all: allCount,
        draft: draftCount,
        sent: sentCount,
        approved: approvedCount,
        rejected: rejectedCount
      },
      pipelineValue
    };
  }
);

export const getEstimateQuickCreateOptions = cache(
  async (organizationId: string): Promise<EstimateQuickCreateOptions> => {
    const supabase = await getSupabaseServerClient();
    const [opportunitiesResponse, customersResponse, projectsResponse] =
      await Promise.all([
        supabase
          .from("opportunities")
          .select(quickCreateOpportunitySelect)
          .eq("company_id", organizationId)
          .order("updated_at", { ascending: false }),
        supabase
          .from("customers")
          .select(quickCreateCustomerSelect)
          .eq("company_id", organizationId)
          .order("name", { ascending: true }),
        supabase
          .from("projects")
          .select(quickCreateProjectSelect)
          .eq("company_id", organizationId)
          .order("updated_at", { ascending: false })
      ]);

    if (opportunitiesResponse.error) {
      throw new Error(
        `Unable to load estimate quick-create opportunities: ${opportunitiesResponse.error.message}`
      );
    }

    if (customersResponse.error) {
      throw new Error(
        `Unable to load estimate quick-create customers: ${customersResponse.error.message}`
      );
    }

    if (projectsResponse.error) {
      throw new Error(
        `Unable to load estimate quick-create projects: ${projectsResponse.error.message}`
      );
    }

    const opportunities = Array.isArray(opportunitiesResponse.data)
      ? (opportunitiesResponse.data as unknown as EstimateQuickCreateOpportunityRow[])
      : [];
    const customers = Array.isArray(customersResponse.data)
      ? (customersResponse.data as EstimateQuickCreateCustomerRow[])
      : [];
    const projects = Array.isArray(projectsResponse.data)
      ? (projectsResponse.data as EstimateQuickCreateProjectRow[])
      : [];
    const contactIds = [
      ...new Set(
        opportunities
          .map((opportunity) => opportunity.primary_contact_id)
          .filter((contactId): contactId is string => Boolean(contactId))
      )
    ];
    const contactsResponse =
      contactIds.length > 0
        ? await supabase
            .from("contacts")
            .select("id, display_name")
            .eq("company_id", organizationId)
            .in("id", contactIds)
        : null;

    if (contactsResponse?.error) {
      throw new Error(
        `Unable to load estimate quick-create contact labels: ${contactsResponse.error.message}`
      );
    }

    const contactsById = new Map(
      Array.isArray(contactsResponse?.data)
        ? (contactsResponse.data as EstimateQuickCreateContactRow[]).map(
            (contact) => [contact.id, contact]
          )
        : []
    );

    return {
      opportunities: opportunities.map((opportunity) => ({
        id: opportunity.id,
        title: opportunity.title,
        customerId: opportunity.customer_id,
        contactName:
          (opportunity.primary_contact_id
            ? contactsById.get(opportunity.primary_contact_id)?.display_name
            : null) ?? opportunity.prospect_name,
        customerName: opportunity.customers?.name ?? null,
        jobType: opportunity.job_type,
        siteName: opportunity.site_name,
        status: opportunity.status
      })),
      customers: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        companyName: customer.company_name,
        email: customer.email,
        phone: customer.phone
      })),
      projects: projects.map((project) => ({
        id: project.id,
        customerId: project.customer_id,
        name: project.name,
        status: project.status
      }))
    };
  }
);

export function isEstimatesManagerView(
  value: string | null | undefined
): value is EstimatesManagerView {
  return (
    value === "all" ||
    value === "draft" ||
    value === "sent" ||
    value === "approved" ||
    value === "rejected"
  );
}
