import "server-only";

import { computeCommercialReadiness } from "@floorconnector/domain";
import type {
  CommercialReadinessBlocker,
  CommercialReadinessStatus,
  ContractInternalApprovalStatus,
  ContractPaymentRequirementAmountMode,
  ContractPaymentRequirementDueBasis,
  ContractPaymentScheduleType,
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

type BatchedReadinessOpportunityRow = ReadinessOpportunityRow & {
  project_id: string;
  updated_at: string;
};

type ReadinessEstimateRow = {
  id: string;
  status: EstimateStatus;
  updated_at: string;
};

type BatchedReadinessEstimateRow = ReadinessEstimateRow & {
  project_id: string;
};

type ReadinessContractRow = {
  id: string;
  status: ContractStatus;
  internal_approval_status: ContractInternalApprovalStatus;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
};

type BatchedReadinessContractRow = ReadinessContractRow & {
  project_id: string;
};

type ReadinessInvoiceRow = {
  id: string;
  status: InvoiceStatus;
  workflow_role: InvoiceWorkflowRole;
  total_amount: string;
  balance_due_amount: string;
  updated_at: string;
};

type BatchedReadinessInvoiceRow = ReadinessInvoiceRow & {
  project_id: string;
};

type ReadinessPaymentRow = {
  id: string;
  invoice_id: string;
  amount: string;
  status: "pending" | "recorded" | "void";
};

type ReadinessPaymentEventRow = {
  id: string;
  invoice_id: string;
};

type ReadinessPaymentRequirementRow = {
  id: string;
  contract_id: string;
  project_id: string;
  schedule_type: ContractPaymentScheduleType;
  due_basis: ContractPaymentRequirementDueBasis;
  amount_mode: ContractPaymentRequirementAmountMode;
  amount: string | null;
  percentage: string | null;
  schedule_blocking: boolean;
  linked_invoice_id: string | null;
  sort_order: number;
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
  paymentRequirementRequired?: boolean;
  paymentRequirementSatisfied?: boolean;
  activePaymentRequirementId?: string | null;
  activePaymentRequirementScheduleType?: ContractPaymentScheduleType | null;
  activePaymentRequirementDueBasis?: ContractPaymentRequirementDueBasis | null;
  activePaymentRequirementInvoiceId?: string | null;
  activePaymentRequirementInvoiceStatus?: InvoiceStatus | null;
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

function isReadinessOpportunityRow(
  value: unknown
): value is ReadinessOpportunityRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ReadinessOpportunityRow>;

  return (
    typeof row.id === "string" && typeof row.site_assessment_status === "string"
  );
}

function isReadinessEstimateRowArray(
  value: unknown
): value is ReadinessEstimateRow[] {
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

function isReadinessContractRowArray(
  value: unknown
): value is ReadinessContractRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<ReadinessContractRow>).id === "string" &&
        typeof (row as Partial<ReadinessContractRow>).status === "string" &&
        typeof (row as Partial<ReadinessContractRow>)
          .internal_approval_status === "string" &&
        (typeof (row as Partial<ReadinessContractRow>).signed_at === "string" ||
          (row as Partial<ReadinessContractRow>).signed_at === null) &&
        typeof (row as Partial<ReadinessContractRow>).created_at === "string" &&
        typeof (row as Partial<ReadinessContractRow>).updated_at === "string"
    )
  );
}

function isReadinessInvoiceRowArray(
  value: unknown
): value is ReadinessInvoiceRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<ReadinessInvoiceRow>).id === "string" &&
        typeof (row as Partial<ReadinessInvoiceRow>).status === "string" &&
        typeof (row as Partial<ReadinessInvoiceRow>).workflow_role ===
          "string" &&
        typeof (row as Partial<ReadinessInvoiceRow>).total_amount ===
          "string" &&
        typeof (row as Partial<ReadinessInvoiceRow>).balance_due_amount ===
          "string" &&
        typeof (row as Partial<ReadinessInvoiceRow>).updated_at === "string"
    )
  );
}

function isReadinessPaymentRowArray(
  value: unknown
): value is ReadinessPaymentRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<ReadinessPaymentRow>).id === "string" &&
        typeof (row as Partial<ReadinessPaymentRow>).invoice_id === "string" &&
        typeof (row as Partial<ReadinessPaymentRow>).amount === "string" &&
        typeof (row as Partial<ReadinessPaymentRow>).status === "string"
    )
  );
}

function isReadinessPaymentEventRowArray(
  value: unknown
): value is ReadinessPaymentEventRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<ReadinessPaymentEventRow>).id === "string" &&
        typeof (row as Partial<ReadinessPaymentEventRow>).invoice_id ===
          "string"
    )
  );
}

function isReadinessPaymentRequirementRowArray(
  value: unknown
): value is ReadinessPaymentRequirementRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof (row as Partial<ReadinessPaymentRequirementRow>).id ===
          "string" &&
        typeof (row as Partial<ReadinessPaymentRequirementRow>).contract_id ===
          "string" &&
        typeof (row as Partial<ReadinessPaymentRequirementRow>).project_id ===
          "string" &&
        typeof (row as Partial<ReadinessPaymentRequirementRow>)
          .schedule_type === "string" &&
        typeof (row as Partial<ReadinessPaymentRequirementRow>).due_basis ===
          "string" &&
        typeof (row as Partial<ReadinessPaymentRequirementRow>).amount_mode ===
          "string" &&
        ((row as Partial<ReadinessPaymentRequirementRow>).amount === null ||
          typeof (row as Partial<ReadinessPaymentRequirementRow>).amount ===
            "string") &&
        ((row as Partial<ReadinessPaymentRequirementRow>).percentage === null ||
          typeof (row as Partial<ReadinessPaymentRequirementRow>).percentage ===
            "string") &&
        typeof (row as Partial<ReadinessPaymentRequirementRow>)
          .schedule_blocking === "boolean" &&
        ((row as Partial<ReadinessPaymentRequirementRow>).linked_invoice_id ===
          null ||
          typeof (row as Partial<ReadinessPaymentRequirementRow>)
            .linked_invoice_id === "string") &&
        typeof (row as Partial<ReadinessPaymentRequirementRow>).sort_order ===
          "number"
    )
  );
}

function isBatchedReadinessOpportunityRowArray(
  value: unknown
): value is BatchedReadinessOpportunityRow[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        isReadinessOpportunityRow(row) &&
        typeof (row as Partial<BatchedReadinessOpportunityRow>).project_id ===
          "string" &&
        typeof (row as Partial<BatchedReadinessOpportunityRow>).updated_at ===
          "string"
    )
  );
}

function isBatchedReadinessEstimateRowArray(
  value: unknown
): value is BatchedReadinessEstimateRow[] {
  return (
    isReadinessEstimateRowArray(value) &&
    value.every(
      (row) =>
        typeof (row as Partial<BatchedReadinessEstimateRow>).project_id ===
        "string"
    )
  );
}

function isBatchedReadinessContractRowArray(
  value: unknown
): value is BatchedReadinessContractRow[] {
  return (
    isReadinessContractRowArray(value) &&
    value.every(
      (row) =>
        typeof (row as Partial<BatchedReadinessContractRow>).project_id ===
        "string"
    )
  );
}

function isBatchedReadinessInvoiceRowArray(
  value: unknown
): value is BatchedReadinessInvoiceRow[] {
  return (
    isReadinessInvoiceRowArray(value) &&
    value.every(
      (row) =>
        typeof (row as Partial<BatchedReadinessInvoiceRow>).project_id ===
        "string"
    )
  );
}

function groupReadinessRowsByProjectId<T extends { project_id: string }>(
  rows: T[]
) {
  const grouped = new Map<string, T[]>();

  for (const row of rows) {
    const existing = grouped.get(row.project_id);

    if (existing) {
      existing.push(row);
    } else {
      grouped.set(row.project_id, [row]);
    }
  }

  return grouped;
}

function sumRecordedPaymentsByInvoiceId(payments: ReadinessPaymentRow[]) {
  const totals = new Map<string, number>();

  for (const payment of payments) {
    if (payment.status !== "recorded") {
      continue;
    }

    totals.set(
      payment.invoice_id,
      (totals.get(payment.invoice_id) ?? 0) + Number(payment.amount)
    );
  }

  return totals;
}

function groupPaymentEventsByInvoiceId(
  paymentEvents: ReadinessPaymentEventRow[]
) {
  const grouped = new Map<string, ReadinessPaymentEventRow[]>();

  for (const event of paymentEvents) {
    const existing = grouped.get(event.invoice_id);
    if (existing) {
      existing.push(event);
    } else {
      grouped.set(event.invoice_id, [event]);
    }
  }

  return grouped;
}

function isPaymentRequirementSatisfied(requirement: {
  scheduleBlocking: boolean;
  amountMode: ContractPaymentRequirementAmountMode;
  amount: string | null;
  linkedInvoiceStatus: InvoiceStatus | null;
  linkedInvoiceTotalAmount: string | null;
  linkedInvoiceBalanceDueAmount: string | null;
  linkedInvoiceRecordedPaymentAmount: string | null;
}) {
  if (!requirement.scheduleBlocking || requirement.amountMode === "none") {
    return true;
  }

  if (requirement.linkedInvoiceStatus === "paid") {
    return true;
  }

  const requiredAmount =
    requirement.amount === null ? null : Number(requirement.amount);
  const recordedPaymentAmount =
    requirement.linkedInvoiceRecordedPaymentAmount === null
      ? 0
      : Number(requirement.linkedInvoiceRecordedPaymentAmount);

  if (requiredAmount !== null && requiredAmount > 0) {
    return recordedPaymentAmount >= requiredAmount;
  }

  const invoiceTotal =
    requirement.linkedInvoiceTotalAmount === null
      ? null
      : Number(requirement.linkedInvoiceTotalAmount);
  const invoiceBalance =
    requirement.linkedInvoiceBalanceDueAmount === null
      ? null
      : Number(requirement.linkedInvoiceBalanceDueAmount);

  return invoiceTotal !== null && invoiceTotal > 0 && invoiceBalance !== null
    ? invoiceBalance <= 0
    : false;
}

function buildProjectFinancialReadinessSnapshot(input: {
  project: ReadinessProjectRow;
  opportunity: ReadinessOpportunityRow | null;
  estimates: ReadinessEstimateRow[];
  contracts: ReadinessContractRow[];
  invoices: ReadinessInvoiceRow[];
  paymentRequirements: ReadinessPaymentRequirementRow[];
  payments: ReadinessPaymentRow[];
  paymentEvents: ReadinessPaymentEventRow[];
  workflowSettings: Awaited<ReturnType<typeof getOrganizationWorkflowSettings>>;
}): ProjectFinancialReadinessSnapshot {
  const preferredEstimate =
    input.estimates.find((estimate) => estimate.status === "approved") ??
    input.estimates[0] ??
    null;
  const signedContract =
    input.contracts.find((candidate) => candidate.status === "signed") ?? null;
  const contract = signedContract ?? input.contracts[0] ?? null;
  const depositInvoices = input.invoices.filter(
    (invoice) => invoice.workflow_role === "deposit"
  );
  const paidDepositInvoice = depositInvoices.find(
    (invoice) => invoice.status === "paid"
  );
  const latestDepositInvoice = paidDepositInvoice ?? depositInvoices[0] ?? null;
  const invoicesById = new Map(
    input.invoices.map((invoice) => [invoice.id, invoice])
  );
  const recordedPaymentsByInvoiceId = sumRecordedPaymentsByInvoiceId(
    input.payments
  );
  const paymentEventsByInvoiceId = groupPaymentEventsByInvoiceId(
    input.paymentEvents
  );
  const activePaymentRequirements = contract
    ? input.paymentRequirements
        .filter((requirement) => requirement.contract_id === contract.id)
        .sort((left, right) => left.sort_order - right.sort_order)
    : [];
  const readinessPaymentRequirements = activePaymentRequirements.map(
    (requirement) => {
      const linkedInvoice = requirement.linked_invoice_id
        ? (invoicesById.get(requirement.linked_invoice_id) ?? null)
        : null;

      return {
        id: requirement.id,
        scheduleType: requirement.schedule_type,
        dueBasis: requirement.due_basis,
        amountMode: requirement.amount_mode,
        amount: requirement.amount,
        percentage: requirement.percentage,
        scheduleBlocking: requirement.schedule_blocking,
        linkedInvoiceId: requirement.linked_invoice_id,
        linkedInvoiceStatus: linkedInvoice?.status ?? null,
        linkedInvoiceTotalAmount: linkedInvoice?.total_amount ?? null,
        linkedInvoiceBalanceDueAmount:
          linkedInvoice?.balance_due_amount ?? null,
        linkedInvoiceRecordedPaymentAmount:
          requirement.linked_invoice_id &&
          recordedPaymentsByInvoiceId.has(requirement.linked_invoice_id)
            ? String(
                recordedPaymentsByInvoiceId.get(requirement.linked_invoice_id)
              )
            : "0",
        hasCanonicalPaymentEventEvidence: requirement.linked_invoice_id
          ? (paymentEventsByInvoiceId.get(requirement.linked_invoice_id)
              ?.length ?? 0) > 0
          : false
      };
    }
  );
  const activeBlockingRequirement =
    readinessPaymentRequirements.find(
      (requirement) => requirement.scheduleBlocking
    ) ?? null;
  const activeBlockingRequirementInvoice =
    activeBlockingRequirement?.linkedInvoiceId
      ? (invoicesById.get(activeBlockingRequirement.linkedInvoiceId) ?? null)
      : null;
  const readiness = computeCommercialReadiness({
    estimateStatus: preferredEstimate?.status ?? null,
    siteAssessmentStatus: input.opportunity?.site_assessment_status ?? null,
    hasContract: Boolean(contract),
    contractInternalApprovalStatus: contract?.internal_approval_status ?? null,
    contractStatus: contract?.status ?? null,
    requireContractInternalApproval:
      input.workflowSettings.requireContractInternalApproval,
    requireContractSignatureBeforeJobScheduling:
      input.workflowSettings.requireContractSignatureBeforeJobScheduling,
    requireDepositBeforeJobScheduling:
      input.workflowSettings.requireDepositBeforeJobScheduling,
    requireFinancingApprovalBeforeJobScheduling:
      input.workflowSettings.requireFinancingApprovalBeforeJobScheduling,
    financingStatus: input.project.financing_status,
    depositInvoiceStatus: latestDepositInvoice?.status ?? null,
    depositInvoiceRole: latestDepositInvoice?.workflow_role ?? null,
    paymentRequirements: readinessPaymentRequirements
  });
  const paymentRequirementSatisfied = activeBlockingRequirement
    ? isPaymentRequirementSatisfied(activeBlockingRequirement)
    : true;

  return {
    status: readiness.status,
    blockers: readiness.blockers,
    isReadyToSchedule: readiness.isReadyToSchedule,
    isOperationallyActive:
      Boolean(input.project.operational_activated_at) ||
      signedContract !== null,
    depositRequired:
      activePaymentRequirements.length > 0
        ? Boolean(activeBlockingRequirement)
        : input.workflowSettings.requireDepositBeforeJobScheduling,
    depositSatisfied:
      activePaymentRequirements.length > 0
        ? paymentRequirementSatisfied
        : latestDepositInvoice?.status === "paid",
    financingStatus: input.project.financing_status,
    opportunityId: input.opportunity?.id ?? null,
    siteAssessmentStatus: input.opportunity?.site_assessment_status ?? null,
    estimateId: preferredEstimate?.id ?? null,
    estimateStatus: preferredEstimate?.status ?? null,
    contractId: contract?.id ?? null,
    contractStatus: contract?.status ?? null,
    contractInternalApprovalStatus: contract?.internal_approval_status ?? null,
    contractSignedAt:
      signedContract?.signed_at ??
      signedContract?.updated_at ??
      signedContract?.created_at ??
      null,
    depositInvoiceId: latestDepositInvoice?.id ?? null,
    depositInvoiceStatus: latestDepositInvoice?.status ?? null,
    paymentRequirementRequired: Boolean(activeBlockingRequirement),
    paymentRequirementSatisfied,
    activePaymentRequirementId: activeBlockingRequirement?.id ?? null,
    activePaymentRequirementScheduleType:
      activeBlockingRequirement?.scheduleType ?? null,
    activePaymentRequirementDueBasis:
      activeBlockingRequirement?.dueBasis ?? null,
    activePaymentRequirementInvoiceId:
      activeBlockingRequirement?.linkedInvoiceId ?? null,
    activePaymentRequirementInvoiceStatus:
      activeBlockingRequirementInvoice?.status ?? null
  };
}

export async function getProjectFinancialReadinessSnapshot(input: {
  organizationId: string;
  projectId: string;
}): Promise<ProjectFinancialReadinessSnapshot | null> {
  const supabase = getSupabaseAdminClient();
  const [
    projectResponse,
    opportunityResponse,
    estimatesResponse,
    contractsResponse,
    invoicesResponse,
    paymentRequirementsResponse,
    paymentsResponse,
    paymentEventsResponse,
    workflowSettings
  ] = await Promise.all([
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
      .select(
        "id, status, internal_approval_status, signed_at, created_at, updated_at"
      )
      .eq("company_id", input.organizationId)
      .eq("project_id", input.projectId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("invoices")
      .select(
        "id, status, workflow_role, total_amount, balance_due_amount, updated_at"
      )
      .eq("company_id", input.organizationId)
      .eq("project_id", input.projectId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("contract_payment_requirements")
      .select(
        "id, contract_id, project_id, schedule_type, due_basis, amount_mode, amount, percentage, schedule_blocking, linked_invoice_id, sort_order"
      )
      .eq("company_id", input.organizationId)
      .eq("project_id", input.projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("payments")
      .select("id, invoice_id, amount, status")
      .eq("company_id", input.organizationId)
      .eq("status", "recorded"),
    supabase
      .from("payment_events")
      .select("id, invoice_id")
      .eq("company_id", input.organizationId)
      .in("event_type", [
        "payment_succeeded",
        "payment_requested",
        "checkout_started",
        "provider_sync"
      ]),
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
  const paymentRequirementsData: unknown = paymentRequirementsResponse.data;
  const paymentsData: unknown = paymentsResponse.data;
  const paymentEventsData: unknown = paymentEventsResponse.data;

  if (opportunityResponse.error) {
    throw new Error(
      `Unable to load project opportunity readiness: ${opportunityResponse.error.message}`
    );
  }

  if (estimatesResponse.error) {
    throw new Error(
      `Unable to load project estimates: ${estimatesResponse.error.message}`
    );
  }

  if (contractsResponse.error) {
    throw new Error(
      `Unable to load project contracts: ${contractsResponse.error.message}`
    );
  }

  if (invoicesResponse.error) {
    throw new Error(
      `Unable to load project invoices: ${invoicesResponse.error.message}`
    );
  }

  if (paymentRequirementsResponse.error) {
    throw new Error(
      `Unable to load project contract payment requirements: ${paymentRequirementsResponse.error.message}`
    );
  }

  if (paymentsResponse.error) {
    throw new Error(
      `Unable to load project payments: ${paymentsResponse.error.message}`
    );
  }

  if (paymentEventsResponse.error) {
    throw new Error(
      `Unable to load project payment events: ${paymentEventsResponse.error.message}`
    );
  }

  const opportunity = isReadinessOpportunityRow(opportunityData)
    ? opportunityData
    : null;
  const estimates = isReadinessEstimateRowArray(estimatesData)
    ? estimatesData
    : [];
  const contracts = isReadinessContractRowArray(contractsData)
    ? contractsData
    : [];
  const invoices = isReadinessInvoiceRowArray(invoicesData) ? invoicesData : [];
  const paymentRequirements = isReadinessPaymentRequirementRowArray(
    paymentRequirementsData
  )
    ? paymentRequirementsData
    : [];
  const invoiceIds = new Set(invoices.map((invoice) => invoice.id));
  const payments = isReadinessPaymentRowArray(paymentsData)
    ? paymentsData.filter((payment) => invoiceIds.has(payment.invoice_id))
    : [];
  const paymentEvents = isReadinessPaymentEventRowArray(paymentEventsData)
    ? paymentEventsData.filter((event) => invoiceIds.has(event.invoice_id))
    : [];

  return buildProjectFinancialReadinessSnapshot({
    project: projectData,
    opportunity,
    estimates,
    contracts,
    invoices,
    paymentRequirements,
    payments,
    paymentEvents,
    workflowSettings
  });
}

export async function getDashboardProjectFinancialReadinessSummaries(input: {
  organizationId: string;
  projectIds: string[];
}): Promise<Map<string, ProjectFinancialReadinessSnapshot | null>> {
  const uniqueProjectIds = [...new Set(input.projectIds)].filter(Boolean);
  const snapshots = new Map<string, ProjectFinancialReadinessSnapshot | null>(
    uniqueProjectIds.map((projectId) => [projectId, null])
  );

  if (uniqueProjectIds.length === 0) {
    return snapshots;
  }

  const supabase = getSupabaseAdminClient();
  const [
    projectsResponse,
    opportunitiesResponse,
    estimatesResponse,
    contractsResponse,
    invoicesResponse,
    paymentRequirementsResponse,
    paymentsResponse,
    paymentEventsResponse,
    workflowSettings
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, company_id, financing_status, commercial_readiness_status, ready_to_schedule_at, operational_activated_at"
      )
      .eq("company_id", input.organizationId)
      .in("id", uniqueProjectIds),
    supabase
      .from("opportunities")
      .select("id, project_id, site_assessment_status, updated_at")
      .eq("company_id", input.organizationId)
      .in("project_id", uniqueProjectIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("estimates")
      .select("id, project_id, status, updated_at")
      .eq("company_id", input.organizationId)
      .in("project_id", uniqueProjectIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("contracts")
      .select(
        "id, project_id, status, internal_approval_status, signed_at, created_at, updated_at"
      )
      .eq("company_id", input.organizationId)
      .in("project_id", uniqueProjectIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("invoices")
      .select(
        "id, project_id, status, workflow_role, total_amount, balance_due_amount, updated_at"
      )
      .eq("company_id", input.organizationId)
      .in("project_id", uniqueProjectIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("contract_payment_requirements")
      .select(
        "id, contract_id, project_id, schedule_type, due_basis, amount_mode, amount, percentage, schedule_blocking, linked_invoice_id, sort_order"
      )
      .eq("company_id", input.organizationId)
      .in("project_id", uniqueProjectIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("payments")
      .select("id, invoice_id, amount, status")
      .eq("company_id", input.organizationId)
      .eq("status", "recorded"),
    supabase
      .from("payment_events")
      .select("id, invoice_id")
      .eq("company_id", input.organizationId)
      .in("event_type", [
        "payment_succeeded",
        "payment_requested",
        "checkout_started",
        "provider_sync"
      ]),
    getOrganizationWorkflowSettings(input.organizationId)
  ]);

  if (projectsResponse.error) {
    throw new Error(
      `Unable to load dashboard project readiness states: ${projectsResponse.error.message}`
    );
  }

  if (opportunitiesResponse.error) {
    throw new Error(
      `Unable to load dashboard project opportunity readiness: ${opportunitiesResponse.error.message}`
    );
  }

  if (estimatesResponse.error) {
    throw new Error(
      `Unable to load dashboard project estimates: ${estimatesResponse.error.message}`
    );
  }

  if (contractsResponse.error) {
    throw new Error(
      `Unable to load dashboard project contracts: ${contractsResponse.error.message}`
    );
  }

  if (invoicesResponse.error) {
    throw new Error(
      `Unable to load dashboard project invoices: ${invoicesResponse.error.message}`
    );
  }

  if (paymentRequirementsResponse.error) {
    throw new Error(
      `Unable to load dashboard contract payment requirements: ${paymentRequirementsResponse.error.message}`
    );
  }

  if (paymentsResponse.error) {
    throw new Error(
      `Unable to load dashboard project payments: ${paymentsResponse.error.message}`
    );
  }

  if (paymentEventsResponse.error) {
    throw new Error(
      `Unable to load dashboard project payment events: ${paymentEventsResponse.error.message}`
    );
  }

  const projectsData: unknown = projectsResponse.data;
  const opportunitiesData: unknown = opportunitiesResponse.data;
  const estimatesData: unknown = estimatesResponse.data;
  const contractsData: unknown = contractsResponse.data;
  const invoicesData: unknown = invoicesResponse.data;
  const paymentRequirementsData: unknown = paymentRequirementsResponse.data;
  const paymentsData: unknown = paymentsResponse.data;
  const paymentEventsData: unknown = paymentEventsResponse.data;

  const projects = Array.isArray(projectsData)
    ? projectsData.filter(isReadinessProjectRow)
    : [];
  const opportunities = isBatchedReadinessOpportunityRowArray(opportunitiesData)
    ? opportunitiesData
    : [];
  const estimates = isBatchedReadinessEstimateRowArray(estimatesData)
    ? estimatesData
    : [];
  const contracts = isBatchedReadinessContractRowArray(contractsData)
    ? contractsData
    : [];
  const invoices = isBatchedReadinessInvoiceRowArray(invoicesData)
    ? invoicesData
    : [];
  const paymentRequirements = isReadinessPaymentRequirementRowArray(
    paymentRequirementsData
  )
    ? paymentRequirementsData
    : [];
  const invoiceProjectIdsByInvoiceId = new Map(
    invoices.map((invoice) => [invoice.id, invoice.project_id])
  );
  const payments = isReadinessPaymentRowArray(paymentsData)
    ? paymentsData.filter((payment) =>
        invoiceProjectIdsByInvoiceId.has(payment.invoice_id)
      )
    : [];
  const paymentEvents = isReadinessPaymentEventRowArray(paymentEventsData)
    ? paymentEventsData.filter((event) =>
        invoiceProjectIdsByInvoiceId.has(event.invoice_id)
      )
    : [];

  const opportunitiesByProjectId = groupReadinessRowsByProjectId(opportunities);
  const estimatesByProjectId = groupReadinessRowsByProjectId(estimates);
  const contractsByProjectId = groupReadinessRowsByProjectId(contracts);
  const invoicesByProjectId = groupReadinessRowsByProjectId(invoices);
  const paymentRequirementsByProjectId =
    groupReadinessRowsByProjectId(paymentRequirements);

  for (const project of projects) {
    const projectInvoices = invoicesByProjectId.get(project.id) ?? [];
    const projectInvoiceIds = new Set(
      projectInvoices.map((invoice) => invoice.id)
    );

    snapshots.set(
      project.id,
      buildProjectFinancialReadinessSnapshot({
        project,
        opportunity: opportunitiesByProjectId.get(project.id)?.[0] ?? null,
        estimates: estimatesByProjectId.get(project.id) ?? [],
        contracts: contractsByProjectId.get(project.id) ?? [],
        invoices: projectInvoices,
        paymentRequirements:
          paymentRequirementsByProjectId.get(project.id) ?? [],
        payments: payments.filter((payment) =>
          projectInvoiceIds.has(payment.invoice_id)
        ),
        paymentEvents: paymentEvents.filter((event) =>
          projectInvoiceIds.has(event.invoice_id)
        ),
        workflowSettings
      })
    );
  }

  return snapshots;
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
      ready_to_schedule_at: snapshot.isReadyToSchedule
        ? new Date().toISOString()
        : null,
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
    throw new Error(
      "Project readiness could not be resolved for this operation."
    );
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
    throw new Error(
      "Project readiness could not be resolved for this operation."
    );
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
    throw new Error(
      "Project readiness could not be resolved for this invoice."
    );
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
