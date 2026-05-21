import "server-only";

import { cache } from "react";
import type {
  ContractInternalApprovalStatus,
  ContractStatus,
  SignatureReadinessStatus
} from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ContractsManagerView =
  | "all"
  | "draft"
  | "sent"
  | "viewed"
  | "signed";

export type ContractsManagerContract = {
  id: string;
  title: string;
  status: ContractStatus;
  internalApprovalStatus: ContractInternalApprovalStatus;
  signatureReadinessStatus: SignatureReadinessStatus;
  customerViewedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  estimate: {
    id: string;
    referenceNumber: string;
  } | null;
  template: {
    id: string;
    name: string;
  } | null;
};

export type ContractQuickCreateApprovedEstimateOption = {
  id: string;
  referenceNumber: string;
  projectName: string | null;
};

export type ContractsManagerReadModel = {
  contracts: ContractsManagerContract[];
  pendingApprovalContracts: ContractsManagerContract[];
  readyToSendContracts: ContractsManagerContract[];
  sentContracts: ContractsManagerContract[];
  viewedContracts: ContractsManagerContract[];
  counts: Record<ContractsManagerView, number> & {
    pendingApproval: number;
    readyToSend: number;
  };
  approvedEstimateCount: number;
};

type ContractsManagerContractRow = {
  id: string;
  title: string;
  status: ContractStatus;
  internal_approval_status: ContractInternalApprovalStatus;
  signature_readiness_status: SignatureReadinessStatus;
  customer_viewed_at: string | null;
  customer_signed_at: string | null;
  contractor_countersigned_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  updated_at: string;
  customers?: {
    id: string;
    name: string;
  } | null;
  projects?: {
    id: string;
    name: string;
  } | null;
  estimates?: {
    id: string;
    reference_number: string;
  } | null;
  document_templates?: {
    id: string;
    name: string;
  } | null;
};

type IdRow = {
  id: string;
};

type ApprovedEstimateOptionRow = {
  id: string;
  reference_number: string;
  projects?: {
    id: string;
    name: string;
  } | null;
};

const contractsManagerViews: ContractsManagerView[] = [
  "all",
  "draft",
  "sent",
  "viewed",
  "signed"
];

const contractsManagerStatuses: Exclude<ContractsManagerView, "all">[] = [
  "draft",
  "sent",
  "viewed",
  "signed"
];

const contractsManagerSelect = `
  id,
  title,
  status,
  internal_approval_status,
  signature_readiness_status,
  customer_viewed_at,
  customer_signed_at,
  contractor_countersigned_at,
  sent_at,
  viewed_at,
  signed_at,
  updated_at,
  customers (
    id,
    name
  ),
  projects (
    id,
    name
  ),
  estimates (
    id,
    reference_number
  ),
  document_templates (
    id,
    name
  )
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function mapContract(
  row: ContractsManagerContractRow
): ContractsManagerContract {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    internalApprovalStatus: row.internal_approval_status,
    signatureReadinessStatus: row.signature_readiness_status,
    customerViewedAt: row.customer_viewed_at,
    customerSignedAt: row.customer_signed_at,
    contractorCountersignedAt: row.contractor_countersigned_at,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    updatedAt: row.updated_at,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name
        }
      : null,
    estimate: row.estimates
      ? {
          id: row.estimates.id,
          referenceNumber: row.estimates.reference_number
        }
      : null,
    template: row.document_templates
      ? {
          id: row.document_templates.id,
          name: row.document_templates.name
        }
      : null
  };
}

async function countContracts(input: {
  organizationId: string;
  status?: ContractStatus;
  internalApprovalStatus?: ContractInternalApprovalStatus;
  signatureReadinessStatus?: SignatureReadinessStatus;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  if (input.status) {
    query = query.eq("status", input.status);
  }

  if (input.internalApprovalStatus) {
    query = query.eq("internal_approval_status", input.internalApprovalStatus);
  }

  if (input.signatureReadinessStatus) {
    query = query.eq(
      "signature_readiness_status",
      input.signatureReadinessStatus
    );
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count contracts: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function countApprovedEstimates(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .select("id", { count: "exact", head: true })
    .eq("company_id", organizationId)
    .eq("status", "approved");

  if (response.error) {
    throw new Error(
      `Unable to count contract-approved estimates: ${response.error.message}`
    );
  }

  return response.count ?? 0;
}

async function findContractRelatedSearchIds(input: {
  organizationId: string;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  const escapedQuery = escapeLikePattern(input.query);
  const [
    customerResponse,
    projectResponse,
    estimateResponse,
    templateResponse
  ] = await Promise.all([
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
      .from("estimates")
      .select("id")
      .eq("company_id", input.organizationId)
      .or(`reference_number.ilike.%${escapedQuery}%`),
    supabase
      .from("document_templates")
      .select("id")
      .eq("company_id", input.organizationId)
      .or(`name.ilike.%${escapedQuery}%`)
  ]);

  if (customerResponse.error) {
    throw new Error(
      `Unable to load contract search customer matches: ${customerResponse.error.message}`
    );
  }

  if (projectResponse.error) {
    throw new Error(
      `Unable to load contract search project matches: ${projectResponse.error.message}`
    );
  }

  if (estimateResponse.error) {
    throw new Error(
      `Unable to load contract search estimate matches: ${estimateResponse.error.message}`
    );
  }

  if (templateResponse.error) {
    throw new Error(
      `Unable to load contract search template matches: ${templateResponse.error.message}`
    );
  }

  return {
    customerIds: Array.isArray(customerResponse.data)
      ? (customerResponse.data as IdRow[]).map((row) => row.id)
      : [],
    projectIds: Array.isArray(projectResponse.data)
      ? (projectResponse.data as IdRow[]).map((row) => row.id)
      : [],
    estimateIds: Array.isArray(estimateResponse.data)
      ? (estimateResponse.data as IdRow[]).map((row) => row.id)
      : [],
    templateIds: Array.isArray(templateResponse.data)
      ? (templateResponse.data as IdRow[]).map((row) => row.id)
      : []
  };
}

async function buildContractSearchPredicates(input: {
  organizationId: string;
  query?: string;
}) {
  const trimmedQuery = input.query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const escapedQuery = escapeLikePattern(trimmedQuery);
  const relatedIds = await findContractRelatedSearchIds({
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
    ...(relatedIds.estimateIds.length > 0
      ? [`estimate_id.in.(${relatedIds.estimateIds.join(",")})`]
      : []),
    ...(relatedIds.templateIds.length > 0
      ? [`template_id.in.(${relatedIds.templateIds.join(",")})`]
      : [])
  ];
}

async function listContractsForManager(input: {
  organizationId: string;
  view?: ContractsManagerView;
  query?: string;
  internalApprovalStatus?: ContractInternalApprovalStatus;
  signatureReadinessStatus?: SignatureReadinessStatus;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = await buildContractSearchPredicates({
    organizationId: input.organizationId,
    query: input.query
  });
  let query = supabase
    .from("contracts")
    .select(contractsManagerSelect)
    .eq("company_id", input.organizationId)
    .order("updated_at", { ascending: false })
    .limit(input.limit);

  if (input.view && input.view !== "all") {
    query = query.eq("status", input.view);
  }

  if (input.internalApprovalStatus) {
    query = query.eq("internal_approval_status", input.internalApprovalStatus);
  }

  if (input.signatureReadinessStatus) {
    query = query.eq(
      "signature_readiness_status",
      input.signatureReadinessStatus
    );
  }

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load contracts manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as ContractsManagerContractRow[]).map(
        mapContract
      )
    : [];
}

export const getContractsManagerReadModel = cache(
  async (input: {
    organizationId: string;
    view?: ContractsManagerView;
    query?: string;
  }): Promise<ContractsManagerReadModel> => {
    const [
      allCount,
      draftCount,
      sentCount,
      viewedCount,
      signedCount,
      pendingApprovalCount,
      readyToSendCount,
      approvedEstimateCount,
      contracts,
      pendingApprovalContracts,
      readyToSendContracts,
      sentContracts,
      viewedContracts
    ] = await Promise.all([
      countContracts({ organizationId: input.organizationId }),
      countContracts({ organizationId: input.organizationId, status: "draft" }),
      countContracts({ organizationId: input.organizationId, status: "sent" }),
      countContracts({
        organizationId: input.organizationId,
        status: "viewed"
      }),
      countContracts({
        organizationId: input.organizationId,
        status: "signed"
      }),
      countContracts({
        organizationId: input.organizationId,
        status: "draft",
        internalApprovalStatus: "pending"
      }),
      countContracts({
        organizationId: input.organizationId,
        status: "draft",
        signatureReadinessStatus: "ready_to_send"
      }),
      countApprovedEstimates(input.organizationId),
      listContractsForManager({
        organizationId: input.organizationId,
        view: input.view,
        query: input.query,
        limit: 20
      }),
      listContractsForManager({
        organizationId: input.organizationId,
        view: "draft",
        internalApprovalStatus: "pending",
        limit: 4
      }),
      listContractsForManager({
        organizationId: input.organizationId,
        view: "draft",
        signatureReadinessStatus: "ready_to_send",
        limit: 4
      }),
      listContractsForManager({
        organizationId: input.organizationId,
        view: "sent",
        limit: 4
      }),
      listContractsForManager({
        organizationId: input.organizationId,
        view: "viewed",
        limit: 4
      })
    ]);

    return {
      contracts,
      pendingApprovalContracts,
      readyToSendContracts,
      sentContracts,
      viewedContracts,
      counts: {
        all: allCount,
        draft: draftCount,
        sent: sentCount,
        viewed: viewedCount,
        signed: signedCount,
        pendingApproval: pendingApprovalCount,
        readyToSend: readyToSendCount
      },
      approvedEstimateCount
    };
  }
);

export const getContractQuickCreateApprovedEstimateOptions = cache(
  async (
    organizationId: string
  ): Promise<ContractQuickCreateApprovedEstimateOption[]> => {
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("estimates")
      .select(
        `
          id,
          reference_number,
          projects (
            id,
            name
          )
        `
      )
      .eq("company_id", organizationId)
      .eq("status", "approved")
      .order("updated_at", { ascending: false });

    if (response.error) {
      throw new Error(
        `Unable to load contract quick-create approved estimates: ${response.error.message}`
      );
    }

    const rows = Array.isArray(response.data)
      ? (response.data as unknown as ApprovedEstimateOptionRow[])
      : [];

    return rows.map((estimate) => ({
      id: estimate.id,
      referenceNumber: estimate.reference_number,
      projectName: estimate.projects?.name ?? null
    }));
  }
);

export function isContractsManagerView(
  value: string | null | undefined
): value is ContractsManagerView {
  return contractsManagerViews.includes(value as ContractsManagerView);
}

export function isContractStatusView(
  value: ContractsManagerView
): value is Exclude<ContractsManagerView, "all"> {
  return contractsManagerStatuses.includes(
    value as Exclude<ContractsManagerView, "all">
  );
}
