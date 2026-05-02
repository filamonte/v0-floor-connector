import "server-only";

import { computeCommercialReadiness } from "@floorconnector/domain";
import type {
  CommercialReadinessBlocker,
  CommercialReadinessStatus,
  ContractInternalApprovalStatus,
  ContractStatus,
  EstimateStatus,
  FinancingStatus,
  InvoiceStatus,
  InvoiceWorkflowRole,
  SiteAssessmentStatus
} from "@floorconnector/types";

import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type ReadinessProjectRow = {
  id: string;
  company_id: string;
  financing_status: FinancingStatus;
  commercial_readiness_status: CommercialReadinessStatus;
  ready_to_schedule_at: string | null;
  operational_activated_at: string | null;
};

type ReadinessOpportunityRow = {
  id: string;
  site_assessment_status: SiteAssessmentStatus;
};

type ReadinessEstimateRow = {
  id: string;
  status: EstimateStatus;
  updated_at: string;
};

type ReadinessContractRow = {
  id: string;
  status: ContractStatus;
  internal_approval_status: ContractInternalApprovalStatus;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ReadinessInvoiceRow = {
  id: string;
  status: InvoiceStatus;
  workflow_role: InvoiceWorkflowRole;
  updated_at: string;
};

export type ProjectFinancialReadinessSnapshot = {
  status: CommercialReadinessStatus;
  blockers: CommercialReadinessBlocker[];
  isReadyToSchedule: boolean;
  isOperationallyActive: boolean;
  depositRequired: boolean;
  depositSatisfied: boolean;
  financingStatus: FinancingStatus;
  opportunityId: string | null;
  siteAssessmentStatus: SiteAssessmentStatus | null;
  estimateId: string | null;
  estimateStatus: EstimateStatus | null;
  contractId: string | null;
  contractStatus: ContractStatus | null;
  contractInternalApprovalStatus: ContractInternalApprovalStatus | null;
  contractSignedAt: string | null;
  depositInvoiceId: string | null;
  depositInvoiceStatus: InvoiceStatus | null;
};

type StandardInvoiceReadinessInput = {
  organizationId: string;
  projectId: string;
  jobId: string | null;
  workflowRole: InvoiceWorkflowRole;
};

function isReadinessProjectRow(value: unknown): value is ReadinessProjectRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ReadinessProjectRow>;
  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.financing_status === "string" &&
    typeof row.commercial_readiness_status === "string" &&
    (row.operational_activated_at === null ||
      typeof row.operational_activated_at === "string")
  );
}

function isReadinessOpportunityRow(value: unknown): value is ReadinessOpportunityRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ReadinessOpportunityRow>;

  return typeof row.id === "string" && typeof row.site_assessment_status === "string";
}

function isReadinessEstimateRowArray(value: unknown): value is ReadinessEstimateRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<ReadinessEstimateRow>).id === "string" &&
        typeof (row as Partial<ReadinessEstimateRow>).status === "string" &&
        typeof (row as Partial<ReadinessEstimateRow>).updated_at === "string"
    )
  );
}

function isReadinessContractRowArray(value: unknown): value is ReadinessContractRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<ReadinessContractRow>).id === "string" &&
        typeof (row as Partial<ReadinessContractRow>).status === "string" &&
        typeof (row as Partial<ReadinessContractRow>).internal_approval_status === "string" &&
        (typeof (row as Partial<ReadinessContractRow>).signed_at === "string" ||
          (row as Partial<ReadinessContractRow>).signed_at === null) &&
        typeof (row as Partial<ReadinessContractRow>).created_at === "string" &&
        typeof (row as Partial<ReadinessContractRow>).updated_at === "string"
    )
  );
}

function isReadinessInvoiceRowArray(value: unknown): value is ReadinessInvoiceRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<ReadinessInvoiceRow>).id === "string" &&
        typeof (row as Partial<ReadinessInvoiceRow>).status === "string" &&
        typeof (row as Partial<ReadinessInvoiceRow>).workflow_role === "string" &&
        typeof (row as Partial<ReadinessInvoiceRow>).updated_at === "string"
    )
  );
}

export async function getProjectFinancialReadinessSnapshot(input: {
  organizationId: string;
  projectId: string;
}): Promise<ProjectFinancialReadinessSnapshot | null> {
  const supabase = getSupabaseAdminClient();
  const [projectResponse, opportunityResponse, estimatesResponse, contractsResponse, invoicesResponse, workflowSettings] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, company_id, financing_status, commercial_readiness_status, ready_to_schedule_at, operational_activated_at"
        )
        .eq("company_id", input.organizationId)
        .eq("id", input.projectId)
        .maybeSingle(),
      supabase
        .from("opportunities")
        .select("id, site_assessment_status")
        .eq("company_id", input.organizationId)
        .eq("project_id", input.projectId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("estimates")
        .select("id, status, updated_at")
        .eq("company_id", input.organizationId)
        .eq("project_id", input.projectId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("contracts")
        .select("id, status, internal_approval_status, signed_at, created_at, updated_at")
        .eq("company_id", input.organizationId)
        .eq("project_id", input.projectId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id, status, workflow_role, updated_at")
        .eq("company_id", input.organizationId)
        .eq("project_id", input.projectId)
        .order("updated_at", { ascending: false }),
      getOrganizationWorkflowSettings(input.organizationId)
    ]);

  const projectData: unknown = projectResponse.data;
  if (projectResponse.error) {
    throw new Error(
      `Unable to load project readiness state: ${projectResponse.error.message}`
    );
  }

  if (!isReadinessProjectRow(projectData)) {
    return null;
  }

  const opportunityData: unknown = opportunityResponse.data;
  const estimatesData: unknown = estimatesResponse.data;
  const contractsData: unknown = contractsResponse.data;
  const invoicesData: unknown = invoicesResponse.data;

  if (opportunityResponse.error) {
    throw new Error(
      `Unable to load project opportunity readiness: ${opportunityResponse.error.message}`
    );
  }

  if (estimatesResponse.error) {
    throw new Error(`Unable to load project estimates: ${estimatesResponse.error.message}`);
  }

  if (contractsResponse.error) {
    throw new Error(`Unable to load project contracts: ${contractsResponse.error.message}`);
  }

  if (invoicesResponse.error) {
    throw new Error(`Unable to load project invoices: ${invoicesResponse.error.message}`);
  }

  const opportunity = isReadinessOpportunityRow(opportunityData) ? opportunityData : null;
  const estimates = isReadinessEstimateRowArray(estimatesData)
    ? estimatesData
    : [];
  const contracts = isReadinessContractRowArray(contractsData)
    ? contractsData
    : [];
  const invoices = isReadinessInvoiceRowArray(invoicesData)
    ? invoicesData
    : [];

  const preferredEstimate =
    estimates.find((estimate) => estimate.status === "approved") ?? estimates[0] ?? null;
  const signedContract = contracts.find((candidate) => candidate.status === "signed") ?? null;
  const contract = signedContract ?? contracts[0] ?? null;
  const depositInvoices = invoices.filter((invoice) => invoice.workflow_role === "deposit");
  const paidDepositInvoice = depositInvoices.find((invoice) => invoice.status === "paid");
  const latestDepositInvoice = paidDepositInvoice ?? depositInvoices[0] ?? null;
  const readiness = computeCommercialReadiness({
    estimateStatus: preferredEstimate?.status ?? null,
    siteAssessmentStatus: opportunity?.site_assessment_status ?? null,
    hasContract: Boolean(contract),
    contractInternalApprovalStatus: contract?.internal_approval_status ?? null,
    contractStatus: contract?.status ?? null,
    requireContractInternalApproval: workflowSettings.requireContractInternalApproval,
    requireContractSignatureBeforeJobScheduling:
      workflowSettings.requireContractSignatureBeforeJobScheduling,
    requireDepositBeforeJobScheduling:
      workflowSettings.requireDepositBeforeJobScheduling,
    requireFinancingApprovalBeforeJobScheduling:
      workflowSettings.requireFinancingApprovalBeforeJobScheduling,
    financingStatus: projectData.financing_status,
    depositInvoiceStatus: latestDepositInvoice?.status ?? null,
    depositInvoiceRole: latestDepositInvoice?.workflow_role ?? null
  });

  return {
    status: readiness.status,
    blockers: readiness.blockers,
    isReadyToSchedule: readiness.isReadyToSchedule,
    isOperationallyActive:
      Boolean(projectData.operational_activated_at) || signedContract !== null,
    depositRequired: workflowSettings.requireDepositBeforeJobScheduling,
    depositSatisfied: latestDepositInvoice?.status === "paid",
    financingStatus: projectData.financing_status,
    opportunityId: opportunity?.id ?? null,
    siteAssessmentStatus: opportunity?.site_assessment_status ?? null,
    estimateId: preferredEstimate?.id ?? null,
    estimateStatus: preferredEstimate?.status ?? null,
    contractId: contract?.id ?? null,
    contractStatus: contract?.status ?? null,
    contractInternalApprovalStatus: contract?.internal_approval_status ?? null,
    contractSignedAt:
      signedContract?.signed_at ?? signedContract?.updated_at ?? signedContract?.created_at ?? null,
    depositInvoiceId: latestDepositInvoice?.id ?? null,
    depositInvoiceStatus: latestDepositInvoice?.status ?? null
  };
}

export async function syncProjectCommercialReadiness(input: {
  organizationId: string;
  projectId: string;
}) {
  const snapshot = await getProjectFinancialReadinessSnapshot(input);

  if (!snapshot) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("projects")
    .update({
      commercial_readiness_status: snapshot.status,
      ready_to_schedule_at: snapshot.isReadyToSchedule ? new Date().toISOString() : null,
      operational_activated_at: snapshot.contractSignedAt
    })
    .eq("company_id", input.organizationId)
    .eq("id", input.projectId)
    .select(
      "id, company_id, financing_status, commercial_readiness_status, ready_to_schedule_at"
    )
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to sync project commercial readiness: ${response.error.message}`
    );
  }

  return snapshot;
}

export async function assertProjectContractSigned(input: {
  organizationId: string;
  projectId: string;
  errorMessage: string;
}) {
  const snapshot = await getProjectFinancialReadinessSnapshot(input);

  if (!snapshot) {
    throw new Error("Project readiness could not be resolved for this operation.");
  }

  if (snapshot.contractStatus === "signed") {
    return snapshot;
  }

  throw new Error(input.errorMessage);
}

export async function assertProjectReadinessGate(input: {
  organizationId: string;
  projectId: string;
  errorMessage: string;
}) {
  const snapshot = await getProjectFinancialReadinessSnapshot(input);

  if (!snapshot) {
    throw new Error("Project readiness could not be resolved for this operation.");
  }

  if (snapshot.isReadyToSchedule) {
    return snapshot;
  }

  throw new Error(input.errorMessage);
}

export async function assertInvoiceCommercialReadiness(
  input: StandardInvoiceReadinessInput
) {
  await assertProjectContractSigned({
    organizationId: input.organizationId,
    projectId: input.projectId,
    errorMessage:
      "Invoices stay downstream of the signed contract. Generate, send, and sign the contract from the project hub before creating an invoice."
  });

  await assertStandardInvoiceCommercialReadiness(input);
}

export async function assertStandardInvoiceCommercialReadiness(
  input: StandardInvoiceReadinessInput
) {
  if (input.workflowRole !== "standard" || input.jobId) {
    return;
  }

  const snapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: input.organizationId,
    projectId: input.projectId
  });

  if (!snapshot) {
    throw new Error("Project readiness could not be resolved for this invoice.");
  }

  if (snapshot.isReadyToSchedule) {
    return;
  }

  throw new Error(
    "Standard invoices must follow the commercial handoff. Complete contract, signature, and deposit or financing readiness from the project hub before creating a standard invoice without a job."
  );
}

// IMPORTANT:
// Any new project/job-attributed execution workflows MUST enforce this gate.
// Do not create execution records without passing assertProjectReadinessGate().