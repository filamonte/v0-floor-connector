import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  canTransitionEstimateStatus,
  compareEstimateStatuses
} from "@floorconnector/domain";
import type {
  Estimate as EstimateRecord,
  EstimateLineItem,
  EstimateStatus
} from "@floorconnector/types";

import type { EstimateInput, EstimateLineItemInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { ensureScheduleOfValuesForEstimate } from "@/lib/financial/sov";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import {
  ensureOpportunityEstimateFlow,
  ensureOpportunityEstimateFlowFromCustomer,
  ensureOpportunityEstimateFlowFromStandalone
} from "@/lib/opportunities/data";
import { getProjectById } from "@/lib/projects/data";
import { syncProjectCommercialReadiness } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type EstimateRow = {
  id: string;
  company_id: string;
  opportunity_id: string;
  customer_id: string;
  project_id: string;
  template_id: string | null;
  reference_number: string;
  status: EstimateStatus;
  subtotal_amount: string | number;
  tax_amount: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        phone: string | null;
        email: string | null;
        address_line_1: string | null;
        address_line_2: string | null;
        city: string | null;
        state_region: string | null;
        postal_code: string | null;
        country_code: string | null;
      }
    | null;
  opportunities?:
    | {
        id: string;
        title: string;
        status: string;
      }
    | null;
  projects?:
    | {
        id: string;
        name: string;
        status: string;
        description: string | null;
        address_line_1: string | null;
        address_line_2: string | null;
        city: string | null;
        state_region: string | null;
        postal_code: string | null;
        country_code: string | null;
      }
    | null;
};

type EstimateLineItemRow = {
  id: string;
  company_id: string;
  estimate_id: string;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  line_total: string | number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type EstimateListItem = EstimateRecord & {
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

export type EstimateDetail = EstimateListItem & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    stateRegion: string | null;
    postalCode: string | null;
    countryCode: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    status: string;
    description: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    stateRegion: string | null;
    postalCode: string | null;
    countryCode: string | null;
  } | null;
  lineItems: EstimateLineItem[];
};

type EstimateScope = {
  userId: string;
  organizationId: string;
};

type IdRow = {
  id: string;
};

const estimateSelect = `
  id,
  company_id,
  opportunity_id,
  customer_id,
  project_id,
  template_id,
  reference_number,
  status,
  subtotal_amount,
  tax_amount,
  discount_amount,
  total_amount,
  notes,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    phone,
    email,
    address_line_1,
    address_line_2,
    city,
    state_region,
    postal_code,
    country_code
  ),
  opportunities (
    id,
    title,
    status
  ),
  projects (
    id,
    name,
    status,
    description,
    address_line_1,
    address_line_2,
    city,
    state_region,
    postal_code,
    country_code
  )
`;

function isEstimateRow(value: unknown): value is EstimateRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EstimateRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.opportunity_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    (row.template_id === null || typeof row.template_id === "string") &&
    typeof row.reference_number === "string" &&
    typeof row.status === "string" &&
    (typeof row.subtotal_amount === "string" || typeof row.subtotal_amount === "number") &&
    (typeof row.tax_amount === "string" || typeof row.tax_amount === "number") &&
    (typeof row.discount_amount === "string" || typeof row.discount_amount === "number") &&
    (typeof row.total_amount === "string" || typeof row.total_amount === "number") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isEstimateRowArray(value: unknown): value is EstimateRow[] {
  return Array.isArray(value) && value.every((row) => isEstimateRow(row));
}

function isEstimateLineItemRow(value: unknown): value is EstimateLineItemRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EstimateLineItemRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.estimate_id === "string" &&
    typeof row.name === "string" &&
    (typeof row.quantity === "string" || typeof row.quantity === "number") &&
    typeof row.unit === "string" &&
    (typeof row.unit_price === "string" || typeof row.unit_price === "number") &&
    (typeof row.line_total === "string" || typeof row.line_total === "number") &&
    typeof row.sort_order === "number" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isEstimateLineItemRowArray(value: unknown): value is EstimateLineItemRow[] {
  return Array.isArray(value) && value.every((row) => isEstimateLineItemRow(row));
}

function isIdRow(value: unknown): value is IdRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  return typeof (value as Partial<IdRow>).id === "string";
}

function mapEstimate(row: EstimateRow): EstimateRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    opportunityId: row.opportunity_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    templateId: row.template_id,
    referenceNumber: row.reference_number,
    status: row.status,
    subtotalAmount: Number(row.subtotal_amount).toFixed(2),
    taxAmount: Number(row.tax_amount).toFixed(2),
    discountAmount: Number(row.discount_amount).toFixed(2),
    totalAmount: Number(row.total_amount).toFixed(2),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEstimateLineItem(row: EstimateLineItemRow): EstimateLineItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    estimateId: row.estimate_id,
    name: row.name,
    description: row.description,
    quantity: Number(row.quantity).toFixed(2),
    unit: row.unit,
    unitPrice: Number(row.unit_price).toFixed(2),
    lineTotal: Number(row.line_total).toFixed(2),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getEstimateScope(next = "/estimates"): Promise<EstimateScope | null> {
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

export async function requireEstimateScope(next = "/estimates") {
  const scope = await getEstimateScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for estimates yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

function sortEstimates(estimates: EstimateListItem[]) {
  return estimates.sort((left, right) => {
    const statusComparison = compareEstimateStatuses(left.status, right.status);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

async function getEstimateRecordById(
  organizationId: string,
  estimateId: string
): Promise<EstimateRow | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .select(estimateSelect)
    .eq("company_id", organizationId)
    .eq("id", estimateId)
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load the estimate: ${error.message}`);
  }

  return isEstimateRow(data) ? data : null;
}

async function getEstimateLineItems(
  organizationId: string,
  estimateId: string
): Promise<EstimateLineItem[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_line_items")
    .select(
      `
        id,
        company_id,
        estimate_id,
        name,
        description,
        quantity,
        unit,
        unit_price,
        line_total,
        sort_order,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load estimate line items: ${error.message}`);
  }

  if (!isEstimateLineItemRowArray(data)) {
    return [];
  }

  return data.map((row) => mapEstimateLineItem(row));
}

async function replaceEstimateLineItems(
  organizationId: string,
  userId: string,
  estimateId: string,
  lineItems: EstimateLineItemInput[]
) {
  const supabase = await getSupabaseServerClient();
  const deleteResponse = await supabase
    .from("estimate_line_items")
    .delete()
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId);

  if (deleteResponse.error) {
    throw new Error(
      `Unable to clear existing estimate line items: ${deleteResponse.error.message}`
    );
  }

  const insertResponse = await supabase.from("estimate_line_items").insert(
    lineItems.map((lineItem, index) => ({
      company_id: organizationId,
      estimate_id: estimateId,
      name: lineItem.name,
      description: lineItem.description,
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      unit_price: lineItem.unitPrice,
      sort_order: index,
      created_by: userId,
      updated_by: userId
    }))
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to save estimate line items: ${insertResponse.error.message}`
    );
  }
}

async function resolveScopedProject(projectId: string, next: string) {
  const project = await getProjectById(projectId, next);

  if (!project || !project.customer) {
    throw new Error("Project not found for this organization.");
  }

  return project;
}

async function syncEstimateProjectReadiness(
  organizationId: string,
  projectIds: Array<string | null | undefined>
) {
  const uniqueProjectIds = [
    ...new Set(projectIds.filter((projectId): projectId is string => Boolean(projectId)))
  ];

  for (const projectId of uniqueProjectIds) {
    await syncProjectCommercialReadiness({
      organizationId,
      projectId
    });
  }
}

export const listEstimates = cache(async (): Promise<EstimateListItem[]> => {
  const scope = await requireEstimateScope("/estimates");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .select(estimateSelect)
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load estimates: ${error.message}`);
  }

  if (!isEstimateRowArray(data)) {
    return [];
  }

  return sortEstimates(
    data.map((row) => ({
      ...mapEstimate(row),
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
    }))
  );
});

export async function getEstimateById(
  estimateId: string,
  next = "/estimates"
): Promise<EstimateDetail | null> {
  const scope = await requireEstimateScope(next);
  const [estimate, lineItems] = await Promise.all([
    getEstimateRecordById(scope.organizationId, estimateId),
    getEstimateLineItems(scope.organizationId, estimateId)
  ]);

  if (!estimate) {
    return null;
  }

  return {
    ...mapEstimate(estimate),
    opportunity: estimate.opportunities
      ? {
          id: estimate.opportunities.id,
          title: estimate.opportunities.title,
          status: estimate.opportunities.status
        }
      : null,
    customer: estimate.customers
      ? {
          id: estimate.customers.id,
          name: estimate.customers.name,
          companyName: estimate.customers.company_name,
          phone: estimate.customers.phone,
          email: estimate.customers.email,
          addressLine1: estimate.customers.address_line_1,
          addressLine2: estimate.customers.address_line_2,
          city: estimate.customers.city,
          stateRegion: estimate.customers.state_region,
          postalCode: estimate.customers.postal_code,
          countryCode: estimate.customers.country_code
        }
      : null,
    project: estimate.projects
      ? {
          id: estimate.projects.id,
          name: estimate.projects.name,
          status: estimate.projects.status,
          description: estimate.projects.description,
          addressLine1: estimate.projects.address_line_1,
          addressLine2: estimate.projects.address_line_2,
          city: estimate.projects.city,
          stateRegion: estimate.projects.state_region,
          postalCode: estimate.projects.postal_code,
          countryCode: estimate.projects.country_code
        }
      : null,
    lineItems
  };
}

export async function createEstimate(input: EstimateInput) {
  const scope = await requireEstimateScope("/estimates");
  const project = await resolveScopedProject(input.projectId, "/estimates");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .insert({
      company_id: scope.organizationId,
      opportunity_id: input.opportunityId,
      customer_id: project.customerId,
      project_id: project.id,
      status: input.status,
      tax_amount: input.taxAmount,
      discount_amount: input.discountAmount,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select("id")
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error || !isIdRow(data)) {
    throw new Error(`Unable to create the estimate: ${error?.message ?? "Unknown error."}`);
  }

  try {
    await replaceEstimateLineItems(
      scope.organizationId,
      scope.userId,
      data.id,
      input.lineItems
    );
  } catch (lineItemError) {
    await supabase
      .from("estimates")
      .delete()
      .eq("company_id", scope.organizationId)
      .eq("id", data.id);

    throw lineItemError;
  }

  const estimate = await getEstimateRecordById(scope.organizationId, data.id);

  if (!estimate) {
    throw new Error("Unexpected estimate response after create.");
  }

  await syncEstimateProjectReadiness(scope.organizationId, [project.id]);

  return mapEstimate(estimate);
}

export async function updateEstimate(estimateId: string, input: EstimateInput) {
  const scope = await requireEstimateScope(`/estimates/${estimateId}`);
  const currentEstimate = await getEstimateRecordById(scope.organizationId, estimateId);

  if (!currentEstimate) {
    throw new Error("Estimate not found for this organization.");
  }

  const project = await resolveScopedProject(input.projectId, `/estimates/${estimateId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .update({
      opportunity_id: input.opportunityId,
      customer_id: project.customerId,
      project_id: project.id,
      status: input.status,
      tax_amount: input.taxAmount,
      discount_amount: input.discountAmount,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", estimateId)
    .select("id")
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to update the estimate: ${error.message}`);
  }

  if (!isIdRow(data)) {
    throw new Error("Estimate not found for this organization.");
  }

  await replaceEstimateLineItems(
    scope.organizationId,
    scope.userId,
    estimateId,
    input.lineItems
  );

  const estimate = await getEstimateRecordById(scope.organizationId, estimateId);

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  await syncEstimateProjectReadiness(scope.organizationId, [
    currentEstimate.project_id,
    project.id
  ]);

  return mapEstimate(estimate);
}

export async function updateEstimateStatus(
  estimateId: string,
  nextStatus: EstimateStatus
) {
  const scope = await requireEstimateScope(`/estimates/${estimateId}`);
  const currentEstimate = await getEstimateRecordById(scope.organizationId, estimateId);

  if (!currentEstimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (!canTransitionEstimateStatus(currentEstimate.status, nextStatus)) {
    throw new Error(
      `Estimate status cannot move from ${currentEstimate.status} to ${nextStatus}.`
    );
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .update({
      status: nextStatus,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", estimateId)
    .select("id")
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to update estimate status: ${error.message}`);
  }

  if (!isIdRow(data)) {
    throw new Error("Estimate not found for this organization.");
  }

  const updatedEstimate = await getEstimateRecordById(scope.organizationId, estimateId);

  if (!updatedEstimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (nextStatus === "approved") {
    await ensureScheduleOfValuesForEstimate(estimateId);
  }

  await syncEstimateProjectReadiness(scope.organizationId, [currentEstimate.project_id]);

  return mapEstimate(updatedEstimate);
}

export async function quickCreateEstimateFromContext(input: {
  creationMode: "opportunity" | "customer" | "standalone";
  opportunityId: string | null;
  customerId: string | null;
  projectId: string | null;
  title: string;
}) {
  let flow;

  if (input.opportunityId) {
    flow = await ensureOpportunityEstimateFlow(input.opportunityId);
  } else {
    switch (input.creationMode) {
      case "opportunity":
        throw new Error("Select an opportunity to start the estimate.");
      case "customer":
        if (!input.customerId) {
          throw new Error("Customer-started estimates need customer continuity.");
        }

        flow = await ensureOpportunityEstimateFlowFromCustomer({
          customerId: input.customerId,
          projectId: input.projectId,
          title: input.title
        });
        break;
      case "standalone":
        if (!input.customerId) {
          throw new Error(
            "Standalone estimates still need a customer so the intake layer can create canonical opportunity continuity."
          );
        }

        flow = await ensureOpportunityEstimateFlowFromStandalone({
          customerId: input.customerId,
          projectId: input.projectId,
          title: input.title
        });
        break;
      default:
        throw new Error("Unsupported estimate creation mode.");
    }
  }

  return createEstimate({
    opportunityId: flow.opportunityId,
    projectId: flow.projectId,
    status: "draft",
    taxAmount: "0.00",
    discountAmount: "0.00",
    lineItems: [
      {
        name: "New scope item",
        description: null,
        quantity: "1.00",
        unit: "each",
        unitPrice: "0.00"
      }
    ],
    notes: null
  });
}
