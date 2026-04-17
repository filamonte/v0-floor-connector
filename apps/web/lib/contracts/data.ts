import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  canTransitionContractStatus,
  compareContractStatuses
} from "@floorconnector/domain";
import type {
  Contract as ContractRecord,
  ContractRevision,
  ContractStatus,
  DocumentTemplate
} from "@floorconnector/types";

import type {
  CreateContractFromEstimateInput,
  UpdateContractDraftInput
} from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getEstimateById, listEstimates } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listDocumentTemplates } from "@/lib/templates/data";
import { prepareContractTemplateContextFromEstimate } from "@/lib/templates/workflows";

type ContractRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  template_id: string | null;
  status: ContractStatus;
  title: string;
  rendered_subject: string | null;
  rendered_content: string;
  generated_from_estimate_reference: string | null;
  signature_provider: string | null;
  signature_provider_reference: string | null;
  signature_started_at: string | null;
  locked_at: string | null;
  edit_lock_reason: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        phone: string | null;
        email: string | null;
      }
    | null;
  projects?:
    | {
        id: string;
        name: string;
        status: string;
      }
    | null;
  estimates?:
    | {
        id: string;
        reference_number: string;
        status: string;
      }
    | null;
  document_templates?:
    | {
        id: string;
        name: string;
        template_type: string;
      }
    | null;
};

type ContractRevisionRow = {
  id: string;
  company_id: string;
  contract_id: string;
  revision_number: number;
  title: string;
  rendered_subject: string | null;
  rendered_content: string;
  edit_summary: string | null;
  created_at: string;
};

type ContractScope = {
  userId: string;
  organizationId: string;
};

export type ContractListItem = ContractRecord & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  estimate: {
    id: string;
    referenceNumber: string;
    status: string;
  } | null;
  template: {
    id: string;
    name: string;
  } | null;
};

export type ContractDetail = ContractListItem & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  revisions: ContractRevision[];
  isEditable: boolean;
};

const contractSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  estimate_id,
  template_id,
  status,
  title,
  rendered_subject,
  rendered_content,
  generated_from_estimate_reference,
  signature_provider,
  signature_provider_reference,
  signature_started_at,
  locked_at,
  edit_lock_reason,
  sent_at,
  viewed_at,
  signed_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    phone,
    email
  ),
  projects (
    id,
    name,
    status
  ),
  estimates (
    id,
    reference_number,
    status
  ),
  document_templates (
    id,
    name,
    template_type
  )
`;

function isContractRow(value: unknown): value is ContractRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContractRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    (row.estimate_id === null || typeof row.estimate_id === "string") &&
    (row.template_id === null || typeof row.template_id === "string") &&
    typeof row.status === "string" &&
    typeof row.title === "string" &&
    (row.rendered_subject === null || typeof row.rendered_subject === "string") &&
    typeof row.rendered_content === "string" &&
    (row.generated_from_estimate_reference === null ||
      typeof row.generated_from_estimate_reference === "string") &&
    (row.signature_provider === null || typeof row.signature_provider === "string") &&
    (row.signature_provider_reference === null ||
      typeof row.signature_provider_reference === "string") &&
    (row.signature_started_at === null || typeof row.signature_started_at === "string") &&
    (row.locked_at === null || typeof row.locked_at === "string") &&
    (row.edit_lock_reason === null || typeof row.edit_lock_reason === "string") &&
    (row.sent_at === null || typeof row.sent_at === "string") &&
    (row.viewed_at === null || typeof row.viewed_at === "string") &&
    (row.signed_at === null || typeof row.signed_at === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isContractRowArray(value: unknown): value is ContractRow[] {
  return Array.isArray(value) && value.every((row) => isContractRow(row));
}

function isContractRevisionRow(value: unknown): value is ContractRevisionRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ContractRevisionRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.contract_id === "string" &&
    typeof row.revision_number === "number" &&
    typeof row.title === "string" &&
    (row.rendered_subject === null || typeof row.rendered_subject === "string") &&
    typeof row.rendered_content === "string" &&
    (row.edit_summary === null || typeof row.edit_summary === "string") &&
    typeof row.created_at === "string"
  );
}

function isContractRevisionRowArray(value: unknown): value is ContractRevisionRow[] {
  return Array.isArray(value) && value.every((row) => isContractRevisionRow(row));
}

function mapContract(row: ContractRow): ContractRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    templateId: row.template_id,
    status: row.status,
    title: row.title,
    renderedSubject: row.rendered_subject,
    renderedContent: row.rendered_content,
    generatedFromEstimateReference: row.generated_from_estimate_reference,
    signatureProvider: row.signature_provider,
    signatureProviderReference: row.signature_provider_reference,
    signatureStartedAt: row.signature_started_at,
    lockedAt: row.locked_at,
    editLockReason: row.edit_lock_reason,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapContractRevision(row: ContractRevisionRow): ContractRevision {
  return {
    id: row.id,
    organizationId: row.company_id,
    contractId: row.contract_id,
    revisionNumber: row.revision_number,
    title: row.title,
    renderedSubject: row.rendered_subject,
    renderedContent: row.rendered_content,
    editSummary: row.edit_summary,
    createdAt: row.created_at
  };
}

function mapContractListItem(row: ContractRow): ContractListItem {
  return {
    ...mapContract(row),
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
          name: row.projects.name,
          status: row.projects.status
        }
      : null,
    estimate: row.estimates
      ? {
          id: row.estimates.id,
          referenceNumber: row.estimates.reference_number,
          status: row.estimates.status
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

function isContractEditable(contract: ContractRecord) {
  return (
    contract.status === "draft" &&
    contract.signatureStartedAt == null &&
    contract.signedAt == null &&
    contract.lockedAt == null
  );
}

async function getContractScope(next = "/contracts"): Promise<ContractScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

export async function requireContractScope(next = "/contracts") {
  const scope = await getContractScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for contracts yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function getContractRecordById(
  organizationId: string,
  contractId: string
): Promise<ContractRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(contractSelect)
    .eq("company_id", organizationId)
    .eq("id", contractId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the contract: ${response.error.message}`);
  }

  return isContractRow(data) ? data : null;
}

async function listContractRevisions(
  organizationId: string,
  contractId: string
): Promise<ContractRevision[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contract_revisions")
    .select(
      `
        id,
        company_id,
        contract_id,
        revision_number,
        title,
        rendered_subject,
        rendered_content,
        edit_summary,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("contract_id", contractId)
    .order("revision_number", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load contract revisions: ${response.error.message}`);
  }

  if (!isContractRevisionRowArray(data)) {
    return [];
  }

  return data.map((row) => mapContractRevision(row));
}

export const listContracts = cache(async (): Promise<ContractListItem[]> => {
  const scope = await requireContractScope("/contracts");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(contractSelect)
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load contracts: ${response.error.message}`);
  }

  if (!isContractRowArray(data)) {
    return [];
  }

  return data
    .map((row) => mapContractListItem(row))
    .sort((left, right) => {
      const statusComparison = compareContractStatuses(left.status, right.status);

      if (statusComparison !== 0) {
        return statusComparison;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
});

export async function getContractById(
  contractId: string,
  next = "/contracts"
): Promise<ContractDetail | null> {
  const scope = await requireContractScope(next);
  const [contract, revisions] = await Promise.all([
    getContractRecordById(scope.organizationId, contractId),
    listContractRevisions(scope.organizationId, contractId)
  ]);

  if (!contract) {
    return null;
  }

  return {
    ...mapContractListItem(contract),
    customer: contract.customers
      ? {
          id: contract.customers.id,
          name: contract.customers.name,
          companyName: contract.customers.company_name,
          phone: contract.customers.phone,
          email: contract.customers.email
        }
      : null,
    revisions,
    isEditable: isContractEditable(mapContract(contract))
  };
}

export const listApprovedEstimatesForContracts = cache(async () => {
  const estimates = await listEstimates();

  return estimates.filter((estimate) => estimate.status === "approved");
});

async function resolveApprovedEstimateForContract(estimateId: string) {
  const estimate = await getEstimateById(estimateId, `/contracts?estimateId=${estimateId}`);

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (estimate.status !== "approved") {
    throw new Error("Contracts can only be generated from approved estimates.");
  }

  if (!estimate.project || !estimate.customer) {
    throw new Error("Approved estimate is missing connected project or customer context.");
  }

  return estimate;
}

export async function createContractFromEstimate(
  input: CreateContractFromEstimateInput
) {
  const scope = await requireContractScope("/contracts");
  const estimate = await resolveApprovedEstimateForContract(input.estimateId);
  const workflowSettings = await getOrganizationWorkflowSettings(scope.organizationId);
  const preferredTemplateId =
    input.templateId ?? workflowSettings.approvedEstimateContractTemplateId ?? null;
  const templateContext = await prepareContractTemplateContextFromEstimate({
    estimateId: input.estimateId,
    templateId: preferredTemplateId,
    next: "/contracts"
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .insert({
      company_id: scope.organizationId,
      customer_id: estimate.customerId,
      project_id: estimate.projectId,
      estimate_id: estimate.id,
      template_id: templateContext.template.id,
      status: "draft",
      title:
        templateContext.renderedSubject ??
        `Contract for ${estimate.project?.name ?? estimate.referenceNumber}`,
      rendered_subject: templateContext.renderedSubject,
      rendered_content: templateContext.renderedBody,
      generated_from_estimate_reference: estimate.referenceNumber,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select("id")
    .single();
  const data: unknown = response.data;

  if (response.error || !data || typeof (data as { id?: unknown }).id !== "string") {
    throw new Error(
      `Unable to generate the contract: ${response.error?.message ?? "Unknown error."}`
    );
  }

  const contract = await getContractRecordById(scope.organizationId, (data as { id: string }).id);

  if (!contract) {
    throw new Error("Unexpected contract response after generation.");
  }

  return mapContract(contract);
}

export async function updateContractDraft(input: UpdateContractDraftInput) {
  const scope = await requireContractScope(`/contracts/${input.contractId}/edit`);
  const currentContract = await getContractRecordById(scope.organizationId, input.contractId);

  if (!currentContract) {
    throw new Error("Contract not found for this organization.");
  }

  if (!isContractEditable(mapContract(currentContract))) {
    throw new Error("This contract is locked and can no longer be edited.");
  }

  const supabase = await getSupabaseServerClient();
  const snapshotResponse = await supabase.rpc("create_contract_revision_snapshot", {
    target_contract_id: input.contractId,
    acting_user_id: scope.userId,
    summary: input.editSummary
  });

  if (snapshotResponse.error) {
    throw new Error(
      `Unable to save contract revision snapshot: ${snapshotResponse.error.message}`
    );
  }

  const response = await supabase
    .from("contracts")
    .update({
      title: input.title,
      rendered_subject: input.renderedSubject,
      rendered_content: input.renderedContent,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.contractId)
    .select("id")
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the contract: ${response.error.message}`);
  }

  if (!data || typeof (data as { id?: unknown }).id !== "string") {
    throw new Error("Contract not found for this organization.");
  }

  const updated = await getContractRecordById(scope.organizationId, input.contractId);

  if (!updated) {
    throw new Error("Contract not found for this organization.");
  }

  return mapContract(updated);
}

export async function updateContractStatus(
  contractId: string,
  nextStatus: ContractStatus
) {
  const scope = await requireContractScope(`/contracts/${contractId}`);
  const currentContract = await getContractRecordById(scope.organizationId, contractId);

  if (!currentContract) {
    throw new Error("Contract not found for this organization.");
  }

  if (!canTransitionContractStatus(currentContract.status, nextStatus)) {
    throw new Error(
      `Contract status cannot move from ${currentContract.status} to ${nextStatus}.`
    );
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .update({
      status: nextStatus,
      edit_lock_reason:
        nextStatus === "sent" || nextStatus === "viewed" || nextStatus === "signed"
          ? "signature_activity_started"
          : nextStatus === "void"
            ? "voided"
            : currentContract.edit_lock_reason,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", contractId)
    .select("id")
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update contract status: ${response.error.message}`);
  }

  if (!data || typeof (data as { id?: unknown }).id !== "string") {
    throw new Error("Contract not found for this organization.");
  }

  const updated = await getContractRecordById(scope.organizationId, contractId);

  if (!updated) {
    throw new Error("Contract not found for this organization.");
  }

  return mapContract(updated);
}

export async function getContractTemplateOptions() {
  const templates = await listDocumentTemplates("contract");

  return templates.filter((template: DocumentTemplate) => template.status === "active");
}
