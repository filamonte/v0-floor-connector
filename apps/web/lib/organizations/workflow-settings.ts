import "server-only";

import type { OrganizationWorkflowSettings } from "@floorconnector/types";

import { getPlatformWorkflowDefaults } from "@/lib/platform-admin/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type OrganizationWorkflowSettingsRow = {
  company_id: string;
  approved_estimate_contract_template_id: string | null;
  require_contract_internal_approval: boolean;
  require_contract_signature_before_job_scheduling: boolean;
  require_deposit_before_job_scheduling: boolean;
  require_financing_approval_before_job_scheduling: boolean;
  default_deposit_percentage: string | number;
  default_estimate_terms_html: string | null;
  default_estimate_inclusions_html: string | null;
  default_estimate_exclusions_html: string | null;
  default_estimate_scope_summary_html: string | null;
  next_estimate_number: number | null;
  next_invoice_number: number | null;
  next_change_order_number: number | null;
  next_contract_number: number | null;
  created_at: string;
  updated_at: string;
};

function isOrganizationWorkflowSettingsRow(
  value: unknown
): value is OrganizationWorkflowSettingsRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<OrganizationWorkflowSettingsRow>;

  return (
    typeof row.company_id === "string" &&
    (row.approved_estimate_contract_template_id === null ||
      typeof row.approved_estimate_contract_template_id === "string") &&
    typeof row.require_contract_internal_approval === "boolean" &&
    typeof row.require_contract_signature_before_job_scheduling === "boolean" &&
    typeof row.require_deposit_before_job_scheduling === "boolean" &&
    typeof row.require_financing_approval_before_job_scheduling === "boolean" &&
    (typeof row.default_deposit_percentage === "string" ||
      typeof row.default_deposit_percentage === "number") &&
    (row.default_estimate_terms_html === null ||
      typeof row.default_estimate_terms_html === "string") &&
    (row.default_estimate_inclusions_html === null ||
      typeof row.default_estimate_inclusions_html === "string") &&
    (row.default_estimate_exclusions_html === null ||
      typeof row.default_estimate_exclusions_html === "string") &&
    (row.default_estimate_scope_summary_html === null ||
      typeof row.default_estimate_scope_summary_html === "string") &&
    (row.next_estimate_number === null || typeof row.next_estimate_number === "number") &&
    (row.next_invoice_number === null || typeof row.next_invoice_number === "number") &&
    (row.next_change_order_number === null ||
      typeof row.next_change_order_number === "number") &&
    (row.next_contract_number === null || typeof row.next_contract_number === "number") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function mapOrganizationWorkflowSettings(
  row: OrganizationWorkflowSettingsRow,
  fallback: {
    nextEstimateNumber: number;
    nextInvoiceNumber: number;
    nextChangeOrderNumber: number;
    nextContractNumber: number;
  }
): OrganizationWorkflowSettings {
  return {
    organizationId: row.company_id,
    approvedEstimateContractTemplateId: row.approved_estimate_contract_template_id,
    requireContractInternalApproval: row.require_contract_internal_approval,
    requireContractSignatureBeforeJobScheduling:
      row.require_contract_signature_before_job_scheduling,
    requireDepositBeforeJobScheduling: row.require_deposit_before_job_scheduling,
    requireFinancingApprovalBeforeJobScheduling:
      row.require_financing_approval_before_job_scheduling,
    defaultDepositPercentage: Number(row.default_deposit_percentage).toFixed(2),
    defaultEstimateTermsHtml: row.default_estimate_terms_html,
    defaultEstimateInclusionsHtml: row.default_estimate_inclusions_html,
    defaultEstimateExclusionsHtml: row.default_estimate_exclusions_html,
    defaultEstimateScopeSummaryHtml: row.default_estimate_scope_summary_html,
    nextEstimateNumber: row.next_estimate_number ?? fallback.nextEstimateNumber,
    nextInvoiceNumber: row.next_invoice_number ?? fallback.nextInvoiceNumber,
    nextChangeOrderNumber:
      row.next_change_order_number ?? fallback.nextChangeOrderNumber,
    nextContractNumber: row.next_contract_number ?? fallback.nextContractNumber,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getWorkflowRecordCounts(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const [
    estimateCountResponse,
    invoiceCountResponse,
    changeOrderCountResponse,
    contractCountResponse
  ] = await Promise.all([
    supabase
      .from("estimates")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId),
    supabase
      .from("change_orders")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId),
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
  ]);

  if (estimateCountResponse.error) {
    throw new Error(
      `Unable to inspect estimate numbering state: ${estimateCountResponse.error.message}`
    );
  }

  if (invoiceCountResponse.error) {
    throw new Error(
      `Unable to inspect invoice numbering state: ${invoiceCountResponse.error.message}`
    );
  }

  if (changeOrderCountResponse.error) {
    throw new Error(
      `Unable to inspect change order numbering state: ${changeOrderCountResponse.error.message}`
    );
  }

  if (contractCountResponse.error) {
    throw new Error(
      `Unable to inspect contract numbering state: ${contractCountResponse.error.message}`
    );
  }

  return {
    estimateCount: estimateCountResponse.count ?? 0,
    invoiceCount: invoiceCountResponse.count ?? 0,
    changeOrderCount: changeOrderCountResponse.count ?? 0,
    contractCount: contractCountResponse.count ?? 0
  };
}

export async function getOrganizationWorkflowSettings(
  organizationId: string
): Promise<OrganizationWorkflowSettings> {
  const supabase = await getSupabaseServerClient();
  const platformDefaults = await getPlatformWorkflowDefaults();
  const response = await supabase
    .from("organization_workflow_settings")
    .select(
      `
        company_id,
        approved_estimate_contract_template_id,
        require_contract_internal_approval,
        require_contract_signature_before_job_scheduling,
        require_deposit_before_job_scheduling,
        require_financing_approval_before_job_scheduling,
        default_deposit_percentage,
        default_estimate_terms_html,
        default_estimate_inclusions_html,
        default_estimate_exclusions_html,
        default_estimate_scope_summary_html,
        next_estimate_number,
        next_invoice_number,
        next_change_order_number,
        next_contract_number,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load organization workflow settings: ${response.error.message}`
    );
  }

  if (!isOrganizationWorkflowSettingsRow(data)) {
    return {
      organizationId,
      approvedEstimateContractTemplateId: null,
      requireContractInternalApproval:
        platformDefaults.requireContractInternalApproval,
      requireContractSignatureBeforeJobScheduling:
        platformDefaults.requireContractSignatureBeforeJobScheduling,
      requireDepositBeforeJobScheduling:
        platformDefaults.requireDepositBeforeJobScheduling,
      requireFinancingApprovalBeforeJobScheduling:
        platformDefaults.requireFinancingApprovalBeforeJobScheduling,
      defaultDepositPercentage: platformDefaults.defaultDepositPercentage,
      defaultEstimateTermsHtml: platformDefaults.defaultEstimateTermsHtml,
      defaultEstimateInclusionsHtml: platformDefaults.defaultEstimateInclusionsHtml,
      defaultEstimateExclusionsHtml: platformDefaults.defaultEstimateExclusionsHtml,
      defaultEstimateScopeSummaryHtml:
        platformDefaults.defaultEstimateScopeSummaryHtml,
      nextEstimateNumber: platformDefaults.defaultEstimateStartNumber,
      nextInvoiceNumber: platformDefaults.defaultInvoiceStartNumber,
      nextChangeOrderNumber: platformDefaults.defaultChangeOrderStartNumber,
      nextContractNumber: platformDefaults.defaultContractStartNumber,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    };
  }

  return mapOrganizationWorkflowSettings(data, {
    nextEstimateNumber: platformDefaults.defaultEstimateStartNumber,
    nextInvoiceNumber: platformDefaults.defaultInvoiceStartNumber,
    nextChangeOrderNumber: platformDefaults.defaultChangeOrderStartNumber,
    nextContractNumber: platformDefaults.defaultContractStartNumber
  });
}

export async function upsertOrganizationWorkflowSettings(input: {
  organizationId: string;
  userId: string;
  approvedEstimateContractTemplateId: string | null;
  requireContractInternalApproval: boolean;
  requireContractSignatureBeforeJobScheduling: boolean;
  requireDepositBeforeJobScheduling: boolean;
  requireFinancingApprovalBeforeJobScheduling: boolean;
  defaultDepositPercentage: string;
  defaultEstimateTermsHtml: string | null;
  defaultEstimateInclusionsHtml: string | null;
  defaultEstimateExclusionsHtml: string | null;
  defaultEstimateScopeSummaryHtml: string | null;
  nextEstimateNumber: number;
  nextInvoiceNumber: number;
  nextChangeOrderNumber: number;
  nextContractNumber: number;
}) {
  const supabase = await getSupabaseServerClient();
  const [platformDefaults, currentSettings, recordCounts] = await Promise.all([
    getPlatformWorkflowDefaults(),
    getOrganizationWorkflowSettings(input.organizationId),
    getWorkflowRecordCounts(input.organizationId)
  ]);

  if (
    recordCounts.estimateCount > 0 &&
    input.nextEstimateNumber < currentSettings.nextEstimateNumber
  ) {
    throw new Error(
      "Estimate numbering can only move upward after estimate records already exist."
    );
  }

  if (
    recordCounts.invoiceCount > 0 &&
    input.nextInvoiceNumber < currentSettings.nextInvoiceNumber
  ) {
    throw new Error(
      "Invoice numbering can only move upward after invoice records already exist."
    );
  }

  if (
    recordCounts.changeOrderCount > 0 &&
    input.nextChangeOrderNumber < currentSettings.nextChangeOrderNumber
  ) {
    throw new Error(
      "Change order numbering can only move upward after change order records already exist."
    );
  }

  if (
    recordCounts.contractCount > 0 &&
    input.nextContractNumber < currentSettings.nextContractNumber
  ) {
    throw new Error(
      "Contract numbering can only move upward after contract records already exist."
    );
  }

  const response = await supabase
    .from("organization_workflow_settings")
    .upsert(
      {
        company_id: input.organizationId,
        approved_estimate_contract_template_id: input.approvedEstimateContractTemplateId,
        require_contract_internal_approval: input.requireContractInternalApproval,
        require_contract_signature_before_job_scheduling:
          input.requireContractSignatureBeforeJobScheduling,
        require_deposit_before_job_scheduling:
          input.requireDepositBeforeJobScheduling,
        require_financing_approval_before_job_scheduling:
          input.requireFinancingApprovalBeforeJobScheduling,
        default_deposit_percentage: input.defaultDepositPercentage,
        default_estimate_terms_html: input.defaultEstimateTermsHtml,
        default_estimate_inclusions_html: input.defaultEstimateInclusionsHtml,
        default_estimate_exclusions_html: input.defaultEstimateExclusionsHtml,
        default_estimate_scope_summary_html: input.defaultEstimateScopeSummaryHtml,
        next_estimate_number: input.nextEstimateNumber,
        next_invoice_number: input.nextInvoiceNumber,
        next_change_order_number: input.nextChangeOrderNumber,
        next_contract_number: input.nextContractNumber,
        updated_by: input.userId,
        created_by: input.userId
      },
      {
        onConflict: "company_id"
      }
    )
    .select(
      `
        company_id,
        approved_estimate_contract_template_id,
        require_contract_internal_approval,
        require_contract_signature_before_job_scheduling,
        require_deposit_before_job_scheduling,
        require_financing_approval_before_job_scheduling,
        default_deposit_percentage,
        default_estimate_terms_html,
        default_estimate_inclusions_html,
        default_estimate_exclusions_html,
        default_estimate_scope_summary_html,
        next_estimate_number,
        next_invoice_number,
        next_change_order_number,
        next_contract_number,
        created_at,
        updated_at
      `
    )
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to save organization workflow settings: ${response.error.message}`
    );
  }

  if (!isOrganizationWorkflowSettingsRow(data)) {
    throw new Error("Unexpected response after saving organization workflow settings.");
  }

  return mapOrganizationWorkflowSettings(data, {
    nextEstimateNumber: platformDefaults.defaultEstimateStartNumber,
    nextInvoiceNumber: platformDefaults.defaultInvoiceStartNumber,
    nextChangeOrderNumber: platformDefaults.defaultChangeOrderStartNumber,
    nextContractNumber: platformDefaults.defaultContractStartNumber
  });
}
