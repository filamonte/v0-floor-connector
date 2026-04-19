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
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function mapOrganizationWorkflowSettings(
  row: OrganizationWorkflowSettingsRow
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
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getOrganizationWorkflowSettings(
  organizationId: string
): Promise<OrganizationWorkflowSettings> {
  const supabase = await getSupabaseServerClient();
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
    const platformDefaults = await getPlatformWorkflowDefaults();

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
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    };
  }

  return mapOrganizationWorkflowSettings(data);
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
}) {
  const supabase = await getSupabaseServerClient();
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

  return mapOrganizationWorkflowSettings(data);
}
