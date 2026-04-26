import "server-only";

import { cache } from "react";

import { resolveDocumentTemplateReference } from "@/lib/templates/data";
import { getEstimateById } from "@/lib/estimates/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RelatedContractRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

type RelatedInvoiceRow = {
  id: string;
  reference_number: string;
  billing_model: string;
  workflow_role: string;
  status: string;
  created_at: string;
};

type RelatedScheduleOfValuesRow = {
  id: string;
  created_at: string;
};

type EstimateSnapshotChecklistRow = {
  id: string;
  customer_name_snapshot: string;
  customer_email_snapshot: string | null;
  service_address_line_1_snapshot: string | null;
  service_address_line_2_snapshot: string | null;
  service_city_snapshot: string | null;
  service_state_region_snapshot: string | null;
  service_postal_code_snapshot: string | null;
  service_country_code_snapshot: string | null;
  terms_html: string | null;
  snapshot_version: number;
  created_at: string;
};

export type EstimateApprovalChecklistKey =
  | "customer_name"
  | "customer_email"
  | "service_address"
  | "contract_template"
  | "estimate_terms";

export type EstimateApprovalChecklistItem = {
  key: EstimateApprovalChecklistKey;
  label: string;
  ready: boolean;
  detail: string;
};

export type EstimateApprovalOrchestrationState = {
  estimateId: string;
  estimateReferenceNumber: string;
  projectId: string;
  estimateStatus: string;
  approvedSnapshot: {
    id: string | null;
    snapshotVersion: number | null;
  };
  contract: {
    existingContract: {
      id: string;
      title: string;
      status: string;
    } | null;
    canCreate: boolean;
    requiresConfirmation: true;
    checklist: EstimateApprovalChecklistItem[];
    missingItems: EstimateApprovalChecklistKey[];
    template: {
      id: string;
      name: string;
    } | null;
    snapshotMissing: boolean;
  };
  scheduleOfValues: {
    exists: boolean;
    scheduleOfValuesId: string | null;
  };
  invoice: {
    existingInvoice: {
      id: string;
      referenceNumber: string;
      status: string;
      workflowRole: string;
    } | null;
    canCreate: boolean;
    label: string;
    safetySummary: string;
  };
  existingRecords: {
    contracts: Array<{
      id: string;
      title: string;
      status: string;
    }>;
    invoices: Array<{
      id: string;
      referenceNumber: string;
      status: string;
      workflowRole: string;
      billingModel: string;
    }>;
  };
};

function hasMeaningfulText(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function hasMeaningfulHtml(value: string | null | undefined) {
  return Boolean(value && value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 0);
}

function hasServiceAddress(snapshot: EstimateSnapshotChecklistRow | null) {
  if (!snapshot) {
    return false;
  }

  return [
    snapshot.service_address_line_1_snapshot,
    snapshot.service_address_line_2_snapshot,
    snapshot.service_city_snapshot,
    snapshot.service_state_region_snapshot,
    snapshot.service_postal_code_snapshot,
    snapshot.service_country_code_snapshot
  ].some((value) => hasMeaningfulText(value));
}

async function loadLatestEstimateSnapshot(
  organizationId: string,
  estimateId: string
): Promise<EstimateSnapshotChecklistRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_commercial_snapshots")
    .select(
      `
        id,
        customer_name_snapshot,
        customer_email_snapshot,
        service_address_line_1_snapshot,
        service_address_line_2_snapshot,
        service_city_snapshot,
        service_state_region_snapshot,
        service_postal_code_snapshot,
        service_country_code_snapshot,
        terms_html,
        snapshot_version,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("snapshot_version", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load approval orchestration snapshot state: ${response.error.message}`
    );
  }

  const data = response.data as EstimateSnapshotChecklistRow | null;
  return data && typeof data.id === "string" ? data : null;
}

async function loadRelatedContracts(organizationId: string, estimateId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select("id, title, status, created_at")
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("created_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load related contracts: ${response.error.message}`);
  }

  return Array.isArray(response.data) ? (response.data as RelatedContractRow[]) : [];
}

async function loadRelatedInvoices(organizationId: string, estimateId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select("id, reference_number, billing_model, workflow_role, status, created_at")
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("created_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load related invoices: ${response.error.message}`);
  }

  return Array.isArray(response.data) ? (response.data as RelatedInvoiceRow[]) : [];
}

async function loadScheduleOfValues(
  organizationId: string,
  estimateId: string
): Promise<RelatedScheduleOfValuesRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("schedule_of_values")
    .select("id, created_at")
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load schedule-of-values state: ${response.error.message}`);
  }

  const data = response.data as RelatedScheduleOfValuesRow | null;
  return data && typeof data.id === "string" ? data : null;
}

async function resolveContractTemplate(
  estimateId: string
): Promise<{ id: string; name: string } | null> {
  try {
    const template = await resolveDocumentTemplateReference({
      templateType: "contract",
      next: `/contracts?estimateId=${estimateId}`
    });

    return template ? { id: template.id, name: template.name } : null;
  } catch {
    return null;
  }
}

export const resolveEstimateApprovalOrchestration = cache(
  async (
    estimateId: string,
    next = `/estimates/${estimateId}`
  ): Promise<EstimateApprovalOrchestrationState | null> => {
    const estimate = await getEstimateById(estimateId, next);

    if (!estimate) {
      return null;
    }

    const [snapshot, relatedContracts, relatedInvoices, scheduleOfValues, template] =
      await Promise.all([
        loadLatestEstimateSnapshot(estimate.organizationId, estimate.id),
        loadRelatedContracts(estimate.organizationId, estimate.id),
        loadRelatedInvoices(estimate.organizationId, estimate.id),
        loadScheduleOfValues(estimate.organizationId, estimate.id),
        resolveContractTemplate(estimate.id)
      ]);

    const checklist: EstimateApprovalChecklistItem[] = [
      {
        key: "customer_name",
        label: "Customer name",
        ready: hasMeaningfulText(snapshot?.customer_name_snapshot ?? null),
        detail: "A customer name must exist on the approved estimate snapshot."
      },
      {
        key: "customer_email",
        label: "Customer email",
        ready: hasMeaningfulText(snapshot?.customer_email_snapshot ?? null),
        detail: "Customer email is required before the contract workflow can move forward."
      },
      {
        key: "service_address",
        label: "Service address",
        ready: hasServiceAddress(snapshot),
        detail: "The approved estimate snapshot must include a real service address."
      },
      {
        key: "contract_template",
        label: "Contract template",
        ready: Boolean(template),
        detail: "A valid contract template must resolve before generation."
      },
      {
        key: "estimate_terms",
        label: "Estimate terms",
        ready: hasMeaningfulHtml(snapshot?.terms_html ?? null),
        detail: "Approved estimate terms must be present before generating the contract."
      }
    ];
    const missingItems = checklist
      .filter((item) => !item.ready)
      .map((item) => item.key);
    const existingContract = relatedContracts[0] ?? null;
    const existingInvoice =
      relatedInvoices.find(
        (invoice) =>
          invoice.billing_model === "estimate_derived" && invoice.workflow_role === "standard"
      ) ?? null;

    return {
      estimateId: estimate.id,
      estimateReferenceNumber: estimate.referenceNumber,
      projectId: estimate.projectId,
      estimateStatus: estimate.status,
      approvedSnapshot: {
        id: snapshot?.id ?? null,
        snapshotVersion: snapshot?.snapshot_version ?? null
      },
      contract: {
        existingContract: existingContract
          ? {
              id: existingContract.id,
              title: existingContract.title,
              status: existingContract.status
            }
          : null,
        canCreate: Boolean(snapshot) && missingItems.length === 0,
        requiresConfirmation: true,
        checklist,
        missingItems,
        template,
        snapshotMissing: !snapshot
      },
      scheduleOfValues: {
        exists: Boolean(scheduleOfValues),
        scheduleOfValuesId: scheduleOfValues?.id ?? null
      },
      invoice: {
        existingInvoice: existingInvoice
          ? {
              id: existingInvoice.id,
              referenceNumber: existingInvoice.reference_number,
              status: existingInvoice.status,
              workflowRole: existingInvoice.workflow_role
            }
          : null,
        canCreate: estimate.status === "approved",
        label: "Generate Estimate-Based Invoice (Full Amount)",
        safetySummary:
          "Uses the existing estimate-based invoice path. No automatic downstream action will run."
      },
      existingRecords: {
        contracts: relatedContracts.map((contract) => ({
          id: contract.id,
          title: contract.title,
          status: contract.status
        })),
        invoices: relatedInvoices.map((invoice) => ({
          id: invoice.id,
          referenceNumber: invoice.reference_number,
          status: invoice.status,
          workflowRole: invoice.workflow_role,
          billingModel: invoice.billing_model
        }))
      }
    };
  }
);

export async function resolveCustomerEstimateApprovalOrchestration(
  estimateId: string
) {
  const orchestration = await resolveEstimateApprovalOrchestration(
    estimateId,
    `/portal/estimates/${estimateId}`
  );

  if (!orchestration) {
    throw new Error("Estimate approval orchestration could not be resolved.");
  }

  return {
    estimateId: orchestration.estimateId,
    approvedSnapshot: orchestration.approvedSnapshot,
    contract: orchestration.contract,
    scheduleOfValues: orchestration.scheduleOfValues,
    invoice: orchestration.invoice,
    existingRecords: orchestration.existingRecords
  };
}
