import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  canTransitionEstimateStatus,
  compareEstimateStatuses
} from "@floorconnector/domain";
import type {
  EstimateAttachment,
  Estimate as EstimateRecord,
  EstimateLineItem,
  EstimateStatus
} from "@floorconnector/types";

import type { EstimateInput, EstimateLineItemInput } from "./schemas";
import {
  applyEstimateWorkspaceDefaults,
  createEmptyEstimateWorkspaceContent,
  hasMeaningfulEstimateWorkspaceContent,
  normalizeEstimateWorkspaceContent,
  serializeEstimateWorkspaceContent,
  stripHtmlToPlainText
} from "./workspace";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { ensureScheduleOfValuesForEstimate } from "@/lib/financial/sov";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { STORAGE_BUCKET_NAMES } from "@floorconnector/config";
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
  title: string | null;
  status: EstimateStatus;
  estimate_date: string | null;
  expiration_date: string | null;
  project_type: string | null;
  sector: string | null;
  subtotal_amount: string | number;
  taxable_sales_amount: string | number;
  exempt_sales_amount: string | number;
  tax_rate_applied: string | number;
  tax_behavior_applied: "exclusive" | "inclusive" | "none";
  customer_tax_exempt_snapshot: boolean;
  tax_amount: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  notes: string | null;
  content: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        phone: string | null;
        email: string | null;
        is_tax_exempt: boolean;
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
  catalog_item_id: string | null;
  source_type: "manual" | "catalog_item" | "system_component";
  source_system_id: string | null;
  source_component_id: string | null;
  item_type:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system"
    | null;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  base_unit_cost: string | number;
  base_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  unit_price_before_hidden_markup: string | number;
  visible_markup_amount: string | number;
  hidden_markup_amount: string | number;
  unit_price: string | number;
  taxable: boolean;
  group_name: string | null;
  assigned_to: string | null;
  line_total: string | number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type EstimateAttachmentRow = {
  id: string;
  company_id: string;
  estimate_id: string;
  attachment_type: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectEstimateAttachmentRow = EstimateAttachmentRow & {
  estimates?:
    | {
        id: string;
        reference_number: string;
        project_id: string;
      }
    | null;
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

export type EstimateAttachmentListItem = EstimateAttachment & {
  downloadUrl: string | null;
};

export type EstimateDetail = EstimateListItem & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string | null;
    email: string | null;
    isTaxExempt: boolean;
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
  attachments: EstimateAttachmentListItem[];
  workspaceDefaultsApplied: boolean;
};

export type ProjectEstimateAttachmentListItem = {
  id: string;
  estimateId: string;
  estimateReferenceNumber: string;
  fileName: string;
  mimeType: string;
  attachmentType: string;
  storagePath: string;
  downloadUrl: string | null;
  createdAt: string;
};

export class EstimateVersionConflictError extends Error {
  constructor() {
    super("This estimate was updated somewhere else. Refresh to review the latest saved version.");
    this.name = "EstimateVersionConflictError";
  }
}

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
  title,
  status,
  estimate_date,
  expiration_date,
  project_type,
  sector,
  subtotal_amount,
  taxable_sales_amount,
  exempt_sales_amount,
  tax_rate_applied,
  tax_behavior_applied,
  customer_tax_exempt_snapshot,
  tax_amount,
  discount_amount,
  total_amount,
  notes,
  content,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    phone,
    email,
    is_tax_exempt,
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
    (row.title === null || typeof row.title === "string") &&
    typeof row.status === "string" &&
    (row.estimate_date === null || typeof row.estimate_date === "string") &&
    (row.expiration_date === null || typeof row.expiration_date === "string") &&
    (row.project_type === null || typeof row.project_type === "string") &&
    (row.sector === null || typeof row.sector === "string") &&
    (typeof row.subtotal_amount === "string" || typeof row.subtotal_amount === "number") &&
    (typeof row.taxable_sales_amount === "string" ||
      typeof row.taxable_sales_amount === "number") &&
    (typeof row.exempt_sales_amount === "string" ||
      typeof row.exempt_sales_amount === "number") &&
    (typeof row.tax_rate_applied === "string" ||
      typeof row.tax_rate_applied === "number") &&
    typeof row.tax_behavior_applied === "string" &&
    typeof row.customer_tax_exempt_snapshot === "boolean" &&
    (typeof row.tax_amount === "string" || typeof row.tax_amount === "number") &&
    (typeof row.discount_amount === "string" || typeof row.discount_amount === "number") &&
    (typeof row.total_amount === "string" || typeof row.total_amount === "number") &&
    (row.content === null || typeof row.content === "object") &&
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
    (row.catalog_item_id === null || typeof row.catalog_item_id === "string") &&
    typeof row.source_type === "string" &&
    (row.source_system_id === null || typeof row.source_system_id === "string") &&
    (row.source_component_id === null || typeof row.source_component_id === "string") &&
    (row.item_type === null || typeof row.item_type === "string") &&
    typeof row.name === "string" &&
    (typeof row.quantity === "string" || typeof row.quantity === "number") &&
    typeof row.unit === "string" &&
    (typeof row.base_unit_cost === "string" || typeof row.base_unit_cost === "number") &&
    (row.base_unit_price === null ||
      typeof row.base_unit_price === "string" ||
      typeof row.base_unit_price === "number") &&
    (typeof row.markup_percent === "string" || typeof row.markup_percent === "number") &&
    (typeof row.hidden_markup_percent === "string" ||
      typeof row.hidden_markup_percent === "number") &&
    (typeof row.unit_price_before_hidden_markup === "string" ||
      typeof row.unit_price_before_hidden_markup === "number") &&
    (typeof row.visible_markup_amount === "string" ||
      typeof row.visible_markup_amount === "number") &&
    (typeof row.hidden_markup_amount === "string" ||
      typeof row.hidden_markup_amount === "number") &&
    (typeof row.unit_price === "string" || typeof row.unit_price === "number") &&
    typeof row.taxable === "boolean" &&
    (row.group_name === null || typeof row.group_name === "string") &&
    (row.assigned_to === null || typeof row.assigned_to === "string") &&
    (typeof row.line_total === "string" || typeof row.line_total === "number") &&
    typeof row.sort_order === "number" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isEstimateLineItemRowArray(value: unknown): value is EstimateLineItemRow[] {
  return Array.isArray(value) && value.every((row) => isEstimateLineItemRow(row));
}

function isEstimateAttachmentRow(value: unknown): value is EstimateAttachmentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EstimateAttachmentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.estimate_id === "string" &&
    typeof row.attachment_type === "string" &&
    typeof row.storage_path === "string" &&
    typeof row.file_name === "string" &&
    typeof row.mime_type === "string" &&
    (row.file_size_bytes === null || typeof row.file_size_bytes === "number") &&
    (row.caption === null || typeof row.caption === "string") &&
    (row.uploaded_by === null || typeof row.uploaded_by === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isEstimateAttachmentRowArray(value: unknown): value is EstimateAttachmentRow[] {
  return Array.isArray(value) && value.every((row) => isEstimateAttachmentRow(row));
}

function isProjectEstimateAttachmentRowArray(
  value: unknown
): value is ProjectEstimateAttachmentRow[] {
  return (
    Array.isArray(value) &&
    value.every((row) => {
      if (!isEstimateAttachmentRow(row)) {
        return false;
      }

      const candidate = row as ProjectEstimateAttachmentRow;

      return (
        candidate.estimates == null ||
        (typeof candidate.estimates.id === "string" &&
          typeof candidate.estimates.reference_number === "string" &&
          typeof candidate.estimates.project_id === "string")
      );
    })
  );
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
    title: row.title,
    status: row.status,
    estimateDate: row.estimate_date,
    expirationDate: row.expiration_date,
    projectType: row.project_type,
    sector: row.sector,
    subtotalAmount: Number(row.subtotal_amount).toFixed(2),
    taxableSalesAmount: Number(row.taxable_sales_amount).toFixed(2),
    exemptSalesAmount: Number(row.exempt_sales_amount).toFixed(2),
    taxRateApplied: Number(row.tax_rate_applied).toFixed(6),
    taxBehaviorApplied: row.tax_behavior_applied,
    customerTaxExemptSnapshot: row.customer_tax_exempt_snapshot,
    taxAmount: Number(row.tax_amount).toFixed(2),
    discountAmount: Number(row.discount_amount).toFixed(2),
    totalAmount: Number(row.total_amount).toFixed(2),
    notes: row.notes,
    content: normalizeEstimateWorkspaceContent(row.content, row.notes),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEstimateLineItem(row: EstimateLineItemRow): EstimateLineItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    estimateId: row.estimate_id,
    catalogItemId: row.catalog_item_id,
    sourceType: row.source_type,
    sourceSystemId: row.source_system_id,
    sourceComponentId: row.source_component_id,
    itemType: row.item_type,
    name: row.name,
    description: row.description,
    quantity: Number(row.quantity).toFixed(2),
    unit: row.unit,
    baseUnitCost: Number(row.base_unit_cost).toFixed(2),
    baseUnitPrice:
      row.base_unit_price == null ? null : Number(row.base_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    unitPriceBeforeHiddenMarkup: Number(row.unit_price_before_hidden_markup).toFixed(2),
    visibleMarkupAmount: Number(row.visible_markup_amount).toFixed(2),
    hiddenMarkupAmount: Number(row.hidden_markup_amount).toFixed(2),
    unitPrice: Number(row.unit_price).toFixed(2),
    taxable: row.taxable,
    groupName: row.group_name,
    assignedTo: row.assigned_to,
    lineTotal: Number(row.line_total).toFixed(2),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEstimateAttachment(row: EstimateAttachmentRow): EstimateAttachment {
  return {
    id: row.id,
    organizationId: row.company_id,
    estimateId: row.estimate_id,
    attachmentType: row.attachment_type,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    caption: row.caption,
    uploadedByUserId: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function sanitizeEstimateFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
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
        catalog_item_id,
        source_type,
        source_system_id,
        source_component_id,
        item_type,
        name,
        description,
        quantity,
        unit,
        base_unit_cost,
        base_unit_price,
        markup_percent,
        hidden_markup_percent,
        unit_price_before_hidden_markup,
        visible_markup_amount,
        hidden_markup_amount,
        unit_price,
        taxable,
        group_name,
        assigned_to,
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

async function getEstimateAttachments(
  organizationId: string,
  estimateId: string
): Promise<EstimateAttachment[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_attachments")
    .select(
      `
        id,
        company_id,
        estimate_id,
        attachment_type,
        storage_path,
        file_name,
        mime_type,
        file_size_bytes,
        caption,
        uploaded_by,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load estimate attachments: ${response.error.message}`);
  }

  if (!isEstimateAttachmentRowArray(data)) {
    return [];
  }

  return data.map((row) => mapEstimateAttachment(row));
}

async function resolveEstimateAttachmentDownloadUrls(
  attachments: EstimateAttachment[]
): Promise<EstimateAttachmentListItem[]> {
  if (attachments.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const signedUrlEntries = await Promise.all(
    attachments.map(async (attachment) => {
      const response = await supabase.storage
        .from(STORAGE_BUCKET_NAMES.documents)
        .createSignedUrl(attachment.storagePath, 60 * 60);

      return [attachment.id, response.data?.signedUrl ?? null] as const;
    })
  );

  const signedUrlMap = new Map<string, string | null>(signedUrlEntries);

  return attachments.map((attachment) => ({
    ...attachment,
    downloadUrl: signedUrlMap.get(attachment.id) ?? null
  }));
}

export async function listProjectEstimateAttachments(
  projectId: string,
  next = "/projects"
): Promise<ProjectEstimateAttachmentListItem[]> {
  const scope = await requireEstimateScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_attachments")
    .select(
      `
        id,
        company_id,
        estimate_id,
        attachment_type,
        storage_path,
        file_name,
        mime_type,
        file_size_bytes,
        caption,
        uploaded_by,
        created_at,
        updated_at,
        estimates!inner (
          id,
          reference_number,
          project_id
        )
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("estimates.project_id", projectId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load project estimate attachments: ${response.error.message}`);
  }

  if (!isProjectEstimateAttachmentRowArray(data)) {
    return [];
  }

  const signedUrlEntries = await Promise.all(
    data.map(async (attachment) => {
      const signedResponse = await supabase.storage
        .from(STORAGE_BUCKET_NAMES.documents)
        .createSignedUrl(attachment.storage_path, 60 * 60);

      return [attachment.id, signedResponse.data?.signedUrl ?? null] as const;
    })
  );

  const signedUrlMap = new Map<string, string | null>(signedUrlEntries);

  return data.map((attachment) => ({
    id: attachment.id,
    estimateId: attachment.estimate_id,
    estimateReferenceNumber: attachment.estimates?.reference_number ?? "Estimate attachment",
    fileName: attachment.file_name,
    mimeType: attachment.mime_type,
    attachmentType: attachment.attachment_type,
    storagePath: attachment.storage_path,
    downloadUrl: signedUrlMap.get(attachment.id) ?? null,
    createdAt: attachment.created_at
  }));
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

  if (lineItems.length === 0) {
    return;
  }

  const insertResponse = await supabase.from("estimate_line_items").insert(
    lineItems.map((lineItem, index) => ({
      company_id: organizationId,
      estimate_id: estimateId,
      catalog_item_id: lineItem.catalogItemId,
      source_type: lineItem.sourceType,
      source_system_id: lineItem.sourceSystemId,
      source_component_id: lineItem.sourceComponentId,
      item_type: lineItem.itemType,
      name: lineItem.name,
      description: lineItem.description,
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      base_unit_cost: lineItem.baseUnitCost,
      base_unit_price: lineItem.baseUnitPrice,
      markup_percent: lineItem.markupPercent,
      hidden_markup_percent: lineItem.hiddenMarkupPercent,
      unit_price_before_hidden_markup: lineItem.unitPriceBeforeHiddenMarkup,
      visible_markup_amount: lineItem.visibleMarkupAmount,
      hidden_markup_amount: lineItem.hiddenMarkupAmount,
      unit_price: lineItem.unitPrice,
      taxable: lineItem.taxCode === "taxable",
      group_name: lineItem.groupName,
      assigned_to: lineItem.assignedTo,
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

export type NewEstimateAttachmentUploadInput = {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number | null;
  storagePath: string;
  caption?: string | null;
};

export async function syncEstimateAttachments(input: {
  estimateId: string;
  retainedAttachmentIds: string[];
  newAttachments: NewEstimateAttachmentUploadInput[];
}) {
  const scope = await requireEstimateScope(`/estimates/${input.estimateId}/edit`);
  const existingAttachments = await getEstimateAttachments(
    scope.organizationId,
    input.estimateId
  );
  const supabase = await getSupabaseServerClient();
  const retainedIds = new Set(input.retainedAttachmentIds);
  const removedAttachments = existingAttachments.filter(
    (attachment) => !retainedIds.has(attachment.id)
  );

  if (removedAttachments.length > 0) {
    const deleteResponse = await supabase
      .from("estimate_attachments")
      .delete()
      .eq("company_id", scope.organizationId)
      .eq("estimate_id", input.estimateId)
      .in(
        "id",
        removedAttachments.map((attachment) => attachment.id)
      );

    if (deleteResponse.error) {
      throw new Error(
        `Unable to remove estimate attachments: ${deleteResponse.error.message}`
      );
    }
  }

  if (input.newAttachments.length > 0) {
    const insertResponse = await supabase.from("estimate_attachments").insert(
      input.newAttachments.map((attachment) => ({
        company_id: scope.organizationId,
        estimate_id: input.estimateId,
        attachment_type: "file",
        storage_path: attachment.storagePath,
        file_name: attachment.fileName,
        mime_type: attachment.mimeType,
        file_size_bytes: attachment.fileSizeBytes,
        caption: attachment.caption ?? null,
        uploaded_by: scope.userId
      }))
    );

    if (insertResponse.error) {
      throw new Error(
        `Unable to save estimate attachments: ${insertResponse.error.message}`
      );
    }
  }

  return removedAttachments;
}

export async function uploadEstimateAttachmentFiles(input: {
  estimateId: string;
  files: File[];
}) {
  if (input.files.length === 0) {
    return [];
  }

  const scope = await requireEstimateScope(`/estimates/${input.estimateId}/edit`);
  const supabase = await getSupabaseServerClient();
  const uploaded: NewEstimateAttachmentUploadInput[] = [];

  for (const file of input.files) {
    const timestamp = Date.now();
    const safeName = sanitizeEstimateFileName(file.name || "attachment");
    const storagePath = `${scope.organizationId}/estimates/${input.estimateId}/${timestamp}-${safeName}`;
    const uploadResponse = await supabase.storage
      .from(STORAGE_BUCKET_NAMES.documents)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false
      });

    if (uploadResponse.error) {
      throw new Error(`Unable to upload estimate attachment: ${uploadResponse.error.message}`);
    }

    uploaded.push({
      fileName: file.name || safeName,
      mimeType: file.type || "application/octet-stream",
      fileSizeBytes: Number.isFinite(file.size) ? file.size : null,
      storagePath
    });
  }

  return uploaded;
}

export async function deleteEstimateAttachmentFiles(
  storagePaths: string[]
) {
  if (storagePaths.length === 0) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.storage
    .from(STORAGE_BUCKET_NAMES.documents)
    .remove(storagePaths);

  if (response.error) {
    throw new Error(`Unable to delete estimate attachments: ${response.error.message}`);
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
  const [estimate, lineItems, attachments, workflowSettings] = await Promise.all([
    getEstimateRecordById(scope.organizationId, estimateId),
    getEstimateLineItems(scope.organizationId, estimateId),
    getEstimateAttachments(scope.organizationId, estimateId),
    getOrganizationWorkflowSettings(scope.organizationId)
  ]);

  if (!estimate) {
    return null;
  }

  const resolvedAttachments = await resolveEstimateAttachmentDownloadUrls(attachments);
  const mappedEstimate = mapEstimate(estimate);
  const resolvedDefaults = {
    termsHtml: workflowSettings.defaultEstimateTermsHtml,
    inclusionsHtml: workflowSettings.defaultEstimateInclusionsHtml,
    exclusionsHtml: workflowSettings.defaultEstimateExclusionsHtml,
    scopeSummaryHtml: workflowSettings.defaultEstimateScopeSummaryHtml
  };
  const workspaceDefaultsApplied = !hasMeaningfulEstimateWorkspaceContent(
    mappedEstimate.content
  );
  const resolvedContent = applyEstimateWorkspaceDefaults({
    content: mappedEstimate.content ?? createEmptyEstimateWorkspaceContent(),
    defaults: resolvedDefaults
  });

  return {
    ...mappedEstimate,
    content: resolvedContent,
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
          isTaxExempt: estimate.customers.is_tax_exempt,
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
    lineItems,
    attachments: resolvedAttachments,
    workspaceDefaultsApplied
  };
}

export async function createEstimate(input: EstimateInput) {
  const scope = await requireEstimateScope("/estimates");
  const project = await resolveScopedProject(input.projectId, "/estimates");
  const plainNotes = stripHtmlToPlainText(input.content.notesHtml) ?? input.notes;
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .insert({
      company_id: scope.organizationId,
      opportunity_id: input.opportunityId,
      customer_id: project.customerId,
      project_id: project.id,
      title: input.title,
      status: input.status,
      estimate_date: input.estimateDate,
      expiration_date: input.expirationDate,
      project_type: input.projectType,
      sector: input.sector,
      discount_amount: input.discountAmount,
      notes: plainNotes,
      content: serializeEstimateWorkspaceContent(input.content),
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

export async function updateEstimate(
  estimateId: string,
  input: EstimateInput,
  options?: { expectedUpdatedAt?: string | null }
) {
  const scope = await requireEstimateScope(`/estimates/${estimateId}`);
  const currentEstimate = await getEstimateRecordById(scope.organizationId, estimateId);

  if (!currentEstimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (
    options?.expectedUpdatedAt &&
    currentEstimate.updated_at !== options.expectedUpdatedAt
  ) {
    throw new EstimateVersionConflictError();
  }

  const project = await resolveScopedProject(input.projectId, `/estimates/${estimateId}`);
  const plainNotes = stripHtmlToPlainText(input.content.notesHtml) ?? input.notes;
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .update({
      opportunity_id: input.opportunityId,
      customer_id: project.customerId,
      project_id: project.id,
      title: input.title,
      status: input.status,
      estimate_date: input.estimateDate,
      expiration_date: input.expirationDate,
      project_type: input.projectType,
      sector: input.sector,
      discount_amount: input.discountAmount,
      notes: plainNotes,
      content: serializeEstimateWorkspaceContent(input.content),
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
  nextStatus: EstimateStatus,
  options?: { expectedUpdatedAt?: string | null }
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

  if (
    options?.expectedUpdatedAt &&
    currentEstimate.updated_at !== options.expectedUpdatedAt
  ) {
    throw new EstimateVersionConflictError();
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
    title: input.title,
    status: "draft",
    estimateDate: null,
    expirationDate: null,
    projectType: null,
    sector: null,
    discountAmount: "0.00",
    lineItems: [],
    notes: null,
    content: normalizeEstimateWorkspaceContent(null, null)
  });
}
