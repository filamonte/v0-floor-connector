import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  canTransitionEstimateStatus,
  compareEstimateStatuses
} from "@floorconnector/domain";
import {
  isPostmarkEmailConfigured,
  sendPostmarkEmail
} from "@floorconnector/integrations";
import type {
  CatalogItem,
  DocumentDeliveryChannel,
  DocumentDeliveryEventType,
  EstimateAttachment,
  EstimateCustomerEvent,
  Estimate as EstimateRecord,
  EstimateLineItem,
  EstimateStatus,
  EstimateCustomerEventActorType,
  EstimateCustomerEventType
} from "@floorconnector/types";

import { estimateLineItemInputSchema } from "./schemas";
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
import { getAppOrigin } from "@/lib/auth/urls";
import { listCatalogItems } from "@/lib/catalogs/data";
import {
  buildCatalogItemPricingSnapshot,
  calculateLineTotal,
  formatMoneyValue,
  parseNumericValue
} from "@/lib/catalogs/pricing";
import { buildExpandedSystemLineItemSnapshots } from "@/lib/catalogs/system-expansion";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationProductionActionLockState } from "@/lib/organizations/activation-guard";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import {
  listPortalAccessGrantsForCurrentUser,
  resolvePortalScopedPermissionForCurrentUser
} from "@/lib/portal-access/data";
import { STORAGE_BUCKET_NAMES } from "@floorconnector/config";
import {
  ensureOpportunityEstimateFlow,
  ensureOpportunityEstimateFlowFromCustomer,
  ensureOpportunityEstimateFlowFromStandalone
} from "@/lib/opportunities/data";
import { getProjectById } from "@/lib/projects/data";
import { syncProjectCommercialReadiness } from "@/lib/projects/readiness";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getCurrentUserPreferredEstimateTemplate,
  resolvePreferredEstimateTemplateForCreate
} from "@/lib/user-preferences/estimate-template-preference";
import { buildEstimatePortalEmailContent } from "./email";
import {
  createNotificationEvent,
  recordEstimateNotificationEvent,
  trackNotificationDeliveryClicked,
  trackNotificationDeliveryOpened
} from "@/lib/notifications/system";
import {
  createRecordRevision,
  ensureInitialRecordRevision
} from "@/lib/revisions/data";
import { buildEstimateRevisionSnapshot } from "@/lib/revisions/snapshots";
import type {
  EstimatePortalCommentInput,
  EstimatePortalDecisionInput,
  EstimateSendToCustomerInput
} from "./schemas";

type EstimateRow = {
  id: string;
  company_id: string;
  opportunity_id: string;
  customer_id: string;
  project_id: string;
  estimate_writer_person_id: string | null;
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
  sent_at: string | null;
  sent_by: string | null;
  customer_viewed_at: string | null;
  approved_at: string | null;
  approved_by_portal_user_id: string | null;
  rejected_at: string | null;
  rejected_by_portal_user_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
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
  } | null;
  opportunities?: {
    id: string;
    title: string;
    status: string;
  } | null;
  projects?: {
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
    relationship_owner_person_id: string | null;
    sales_credit_owner_person_id: string | null;
  } | null;
};

type EstimateLineItemRow = {
  id: string;
  company_id: string;
  estimate_id: string;
  catalog_item_id: string | null;
  tax_code_id: string | null;
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
  tax_rate_snapshot: string | number;
  discount_amount: string | number;
  line_subtotal: string | number;
  tax_amount: string | number;
  cost_code: string | null;
  group_name: string | null;
  assigned_to: string | null;
  line_total: string | number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type EstimateCustomerEventRow = {
  id: string;
  company_id: string;
  estimate_id: string;
  customer_id: string;
  project_id: string;
  event_type: EstimateCustomerEventType;
  actor_type: EstimateCustomerEventActorType;
  organization_user_id: string | null;
  portal_user_id: string | null;
  event_note: string | null;
  email_recipient: string | null;
  email_tracking_token: string | null;
  email_opened_at: string | null;
  email_clicked_at: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
};

type EstimatePortalScope = {
  userId: string;
  estimate: EstimateRow;
};

export type EstimatePortalRecipient = {
  portalAccessGrantId: string;
  portalUserId: string;
  email: string;
  fullName: string | null;
  customerContactId: string | null;
  contactDisplayName: string | null;
  contactEmail: string | null;
  isPrimaryContact: boolean;
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

type CatalogItemSourceRow = {
  id: string;
  company_id: string;
  item_type:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  name: string;
  description: string | null;
  unit: string;
  default_unit_cost: string | number;
  default_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  taxable: boolean;
  tax_code_id: string | null;
  cost_code: string | null;
  status: "active" | "archived";
};

type CatalogSystemComponentSourceRow = {
  id: string;
  company_id: string;
  system_catalog_item_id: string;
  component_catalog_item_id: string;
  quantity_per_unit: string | number;
  basis_unit: string;
  component_item_name: string | null;
  component_item_description: string | null;
  component_item_unit: string | null;
};

type ProjectEstimateAttachmentRow = EstimateAttachmentRow & {
  estimates?: {
    id: string;
    reference_number: string;
    project_id: string;
  } | null;
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
    relationshipOwnerPersonId: string | null;
    salesCreditOwnerPersonId: string | null;
  } | null;
  lineItems: EstimateLineItem[];
  attachments: EstimateAttachmentListItem[];
  workspaceDefaultsApplied: boolean;
  estimateDefaultsSource: "organization" | "platform_fallback";
};

export type EstimateCustomerEventListItem = EstimateCustomerEvent;

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
    super(
      "This estimate was updated somewhere else. Refresh to review the latest saved version."
    );
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

type NotificationDeliveryRow = {
  id: string;
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "failed";
};

type SortOrderRow = {
  sort_order: number;
};

const estimateSelect = `
  id,
  company_id,
  opportunity_id,
  customer_id,
  project_id,
  estimate_writer_person_id,
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
  sent_at,
  sent_by,
  customer_viewed_at,
  approved_at,
  approved_by_portal_user_id,
  rejected_at,
  rejected_by_portal_user_id,
  created_by,
  updated_by,
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
    country_code,
    relationship_owner_person_id,
    sales_credit_owner_person_id
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
    (row.estimate_writer_person_id === null ||
      typeof row.estimate_writer_person_id === "string") &&
    (row.template_id === null || typeof row.template_id === "string") &&
    typeof row.reference_number === "string" &&
    (row.title === null || typeof row.title === "string") &&
    typeof row.status === "string" &&
    (row.estimate_date === null || typeof row.estimate_date === "string") &&
    (row.expiration_date === null || typeof row.expiration_date === "string") &&
    (row.project_type === null || typeof row.project_type === "string") &&
    (row.sector === null || typeof row.sector === "string") &&
    (typeof row.subtotal_amount === "string" ||
      typeof row.subtotal_amount === "number") &&
    (typeof row.taxable_sales_amount === "string" ||
      typeof row.taxable_sales_amount === "number") &&
    (typeof row.exempt_sales_amount === "string" ||
      typeof row.exempt_sales_amount === "number") &&
    (typeof row.tax_rate_applied === "string" ||
      typeof row.tax_rate_applied === "number") &&
    typeof row.tax_behavior_applied === "string" &&
    typeof row.customer_tax_exempt_snapshot === "boolean" &&
    (typeof row.tax_amount === "string" ||
      typeof row.tax_amount === "number") &&
    (typeof row.discount_amount === "string" ||
      typeof row.discount_amount === "number") &&
    (typeof row.total_amount === "string" ||
      typeof row.total_amount === "number") &&
    (row.content === null || typeof row.content === "object") &&
    (row.sent_at === null || typeof row.sent_at === "string") &&
    (row.sent_by === null || typeof row.sent_by === "string") &&
    (row.customer_viewed_at === null ||
      typeof row.customer_viewed_at === "string") &&
    (row.approved_at === null || typeof row.approved_at === "string") &&
    (row.approved_by_portal_user_id === null ||
      typeof row.approved_by_portal_user_id === "string") &&
    (row.rejected_at === null || typeof row.rejected_at === "string") &&
    (row.rejected_by_portal_user_id === null ||
      typeof row.rejected_by_portal_user_id === "string") &&
    (row.created_by === null || typeof row.created_by === "string") &&
    (row.updated_by === null || typeof row.updated_by === "string") &&
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
    (row.tax_code_id === null || typeof row.tax_code_id === "string") &&
    typeof row.source_type === "string" &&
    (row.source_system_id === null ||
      typeof row.source_system_id === "string") &&
    (row.source_component_id === null ||
      typeof row.source_component_id === "string") &&
    (row.item_type === null || typeof row.item_type === "string") &&
    typeof row.name === "string" &&
    (typeof row.quantity === "string" || typeof row.quantity === "number") &&
    typeof row.unit === "string" &&
    (typeof row.base_unit_cost === "string" ||
      typeof row.base_unit_cost === "number") &&
    (row.base_unit_price === null ||
      typeof row.base_unit_price === "string" ||
      typeof row.base_unit_price === "number") &&
    (typeof row.markup_percent === "string" ||
      typeof row.markup_percent === "number") &&
    (typeof row.hidden_markup_percent === "string" ||
      typeof row.hidden_markup_percent === "number") &&
    (typeof row.unit_price_before_hidden_markup === "string" ||
      typeof row.unit_price_before_hidden_markup === "number") &&
    (typeof row.visible_markup_amount === "string" ||
      typeof row.visible_markup_amount === "number") &&
    (typeof row.hidden_markup_amount === "string" ||
      typeof row.hidden_markup_amount === "number") &&
    (typeof row.unit_price === "string" ||
      typeof row.unit_price === "number") &&
    typeof row.taxable === "boolean" &&
    (typeof row.tax_rate_snapshot === "string" ||
      typeof row.tax_rate_snapshot === "number") &&
    (typeof row.discount_amount === "string" ||
      typeof row.discount_amount === "number") &&
    (typeof row.line_subtotal === "string" ||
      typeof row.line_subtotal === "number") &&
    (typeof row.tax_amount === "string" ||
      typeof row.tax_amount === "number") &&
    (row.cost_code === null || typeof row.cost_code === "string") &&
    (row.group_name === null || typeof row.group_name === "string") &&
    (row.assigned_to === null || typeof row.assigned_to === "string") &&
    (typeof row.line_total === "string" ||
      typeof row.line_total === "number") &&
    typeof row.sort_order === "number" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isEstimateLineItemRowArray(
  value: unknown
): value is EstimateLineItemRow[] {
  return (
    Array.isArray(value) && value.every((row) => isEstimateLineItemRow(row))
  );
}

function isEstimateAttachmentRow(
  value: unknown
): value is EstimateAttachmentRow {
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

function isEstimateAttachmentRowArray(
  value: unknown
): value is EstimateAttachmentRow[] {
  return (
    Array.isArray(value) && value.every((row) => isEstimateAttachmentRow(row))
  );
}

function isEstimateCustomerEventRow(
  value: unknown
): value is EstimateCustomerEventRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EstimateCustomerEventRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.estimate_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.event_type === "string" &&
    typeof row.actor_type === "string" &&
    (row.organization_user_id === null ||
      typeof row.organization_user_id === "string") &&
    (row.portal_user_id === null || typeof row.portal_user_id === "string") &&
    (row.event_note === null || typeof row.event_note === "string") &&
    (row.email_recipient === null || typeof row.email_recipient === "string") &&
    (row.email_tracking_token === null ||
      typeof row.email_tracking_token === "string") &&
    (row.email_opened_at === null || typeof row.email_opened_at === "string") &&
    (row.email_clicked_at === null ||
      typeof row.email_clicked_at === "string") &&
    (row.payload === null || typeof row.payload === "object") &&
    typeof row.occurred_at === "string" &&
    typeof row.created_at === "string"
  );
}

function isEstimateCustomerEventRowArray(
  value: unknown
): value is EstimateCustomerEventRow[] {
  return (
    Array.isArray(value) &&
    value.every((row) => isEstimateCustomerEventRow(row))
  );
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

function isSortOrderRow(value: unknown): value is SortOrderRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  return typeof (value as Partial<SortOrderRow>).sort_order === "number";
}

function mapEstimate(row: EstimateRow): EstimateRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    opportunityId: row.opportunity_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateWriterPersonId: row.estimate_writer_person_id,
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
    sentAt: row.sent_at,
    sentByUserId: row.sent_by,
    customerViewedAt: row.customer_viewed_at,
    approvedAt: row.approved_at,
    approvedByPortalUserId: row.approved_by_portal_user_id,
    rejectedAt: row.rejected_at,
    rejectedByPortalUserId: row.rejected_by_portal_user_id,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEstimateCustomerEvent(
  row: EstimateCustomerEventRow
): EstimateCustomerEventListItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    estimateId: row.estimate_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    eventType: row.event_type,
    actorType: row.actor_type,
    organizationUserId: row.organization_user_id,
    portalUserId: row.portal_user_id,
    eventNote: row.event_note,
    emailRecipient: row.email_recipient,
    emailTrackingToken: row.email_tracking_token,
    emailOpenedAt: row.email_opened_at,
    emailClickedAt: row.email_clicked_at,
    payload: row.payload,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapEstimateLineItem(row: EstimateLineItemRow): EstimateLineItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    estimateId: row.estimate_id,
    catalogItemId: row.catalog_item_id,
    taxCodeId: row.tax_code_id,
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
      row.base_unit_price == null
        ? null
        : Number(row.base_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    unitPriceBeforeHiddenMarkup: Number(
      row.unit_price_before_hidden_markup
    ).toFixed(2),
    visibleMarkupAmount: Number(row.visible_markup_amount).toFixed(2),
    hiddenMarkupAmount: Number(row.hidden_markup_amount).toFixed(2),
    unitPrice: Number(row.unit_price).toFixed(2),
    taxable: row.taxable,
    taxRateSnapshot: Number(row.tax_rate_snapshot).toFixed(6),
    discountAmount: Number(row.discount_amount).toFixed(2),
    lineSubtotal: Number(row.line_subtotal).toFixed(2),
    taxAmount: Number(row.tax_amount).toFixed(2),
    costCode: row.cost_code,
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

function mapCatalogItemSource(row: CatalogItemSourceRow): CatalogItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType: row.item_type,
    name: row.name,
    description: row.description,
    internalNotes: null,
    unit: row.unit,
    defaultUnitCost: Number(row.default_unit_cost).toFixed(2),
    defaultUnitPrice:
      row.default_unit_price == null
        ? null
        : Number(row.default_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    taxable: row.taxable,
    taxCodeId: row.tax_code_id,
    vendorId: null,
    category: null,
    costCode: row.cost_code,
    sku: null,
    photoStoragePath: null,
    status: row.status,
    isDefault: false,
    metadata: {},
    sortOrder: 0,
    createdAt: "",
    updatedAt: ""
  };
}

function sanitizeEstimateFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

async function getEstimateScope(
  next = "/estimates"
): Promise<EstimateScope | null> {
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

async function createEstimateRecordRevision(input: {
  estimateId: string;
  revisionKind: Parameters<typeof createRecordRevision>[0]["revisionKind"];
  revisionReason: string;
  createdByUserId: string | null;
  ensureInitial?: boolean;
  next?: string;
}) {
  const estimate = await getEstimateById(
    input.estimateId,
    input.next ?? `/estimates/${input.estimateId}`
  );

  if (!estimate) {
    return null;
  }

  const payload = {
    organizationId: estimate.organizationId,
    subjectType: "estimate" as const,
    subjectId: estimate.id,
    revisionKind: input.revisionKind,
    revisionReason: input.revisionReason,
    snapshot: buildEstimateRevisionSnapshot(estimate),
    createdByUserId: input.createdByUserId
  };

  return input.ensureInitial
    ? ensureInitialRecordRevision(payload)
    : createRecordRevision(payload);
}

export async function listEstimatePortalRecipients(input: {
  organizationId: string;
  customerId: string;
  projectId: string;
}): Promise<EstimatePortalRecipient[]> {
  const supabase = await getSupabaseServerClient();
  const grantResponse = await supabase
    .from("portal_access_grants")
    .select(
      `
        id,
        customer_contact_id,
        user_id,
        portal_user:users!portal_access_grants_user_id_fkey (
          id,
          email,
          full_name
        ),
        customer_contact:customer_contacts!portal_access_grants_company_customer_contact_fkey (
          id,
          is_primary,
          contacts:contacts!customer_contacts_contact_company_fkey (
            display_name,
            email
          )
        )
      `
    )
    .eq("company_id", input.organizationId)
    .eq("customer_id", input.customerId)
    .eq("status", "active");
  const grantRows =
    (grantResponse.data as Array<{
      id?: string;
      user_id?: string | null;
      customer_contact_id?: string | null;
      portal_user?:
        | {
            id?: string;
            email?: string | null;
            full_name?: string | null;
          }
        | Array<{
            id?: string;
            email?: string | null;
            full_name?: string | null;
          }>
        | null;
      customer_contact?:
        | {
            id?: string;
            is_primary?: boolean;
            contacts?:
              | {
                  display_name?: string | null;
                  email?: string | null;
                }
              | Array<{
                  display_name?: string | null;
                  email?: string | null;
                }>
              | null;
          }
        | Array<{
            id?: string;
            is_primary?: boolean;
            contacts?:
              | {
                  display_name?: string | null;
                  email?: string | null;
                }
              | Array<{
                  display_name?: string | null;
                  email?: string | null;
                }>
              | null;
          }>
        | null;
    }> | null) ?? [];

  if (grantResponse.error) {
    throw new Error(
      `Unable to load active portal recipients for the estimate: ${grantResponse.error.message}`
    );
  }

  if (grantRows.length === 0) {
    return [];
  }

  const grantIds = grantRows
    .map((row) => row.id)
    .filter((value): value is string => typeof value === "string");

  if (grantIds.length === 0) {
    return [];
  }

  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("portal_access_grant_id")
    .in("portal_access_grant_id", grantIds)
    .eq("project_id", input.projectId)
    .eq("status", "active");
  const accessRows =
    (projectAccessResponse.data as Array<{
      portal_access_grant_id?: string | null;
    }> | null) ?? [];

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate project-scoped portal access for the estimate: ${projectAccessResponse.error.message}`
    );
  }

  const activeGrantIds = new Set(
    accessRows
      .map((row) => row.portal_access_grant_id)
      .filter((value): value is string => typeof value === "string")
  );

  return grantRows
    .filter((row) => typeof row.id === "string" && activeGrantIds.has(row.id))
    .map((row) => {
      const portalAccessGrantId = row.id;
      const portalUser = Array.isArray(row.portal_user)
        ? (row.portal_user[0] ?? null)
        : (row.portal_user ?? null);
      const customerContact = Array.isArray(row.customer_contact)
        ? (row.customer_contact[0] ?? null)
        : (row.customer_contact ?? null);
      const contact = Array.isArray(customerContact?.contacts)
        ? (customerContact?.contacts[0] ?? null)
        : (customerContact?.contacts ?? null);

      if (!portalAccessGrantId || !portalUser?.id || !portalUser.email) {
        return null;
      }

      return {
        portalAccessGrantId,
        portalUserId: portalUser.id,
        email: portalUser.email,
        fullName: portalUser.full_name ?? null,
        customerContactId: row.customer_contact_id ?? null,
        contactDisplayName: contact?.display_name ?? null,
        contactEmail: contact?.email ?? null,
        isPrimaryContact: customerContact?.is_primary === true
      } satisfies EstimatePortalRecipient;
    })
    .filter((value): value is EstimatePortalRecipient => value !== null);
}

function resolveEstimatePortalRecipient(input: {
  customerEmail: string;
  customerName: string | null;
  selectedPortalUserId?: string | null;
  portalRecipients: EstimatePortalRecipient[];
}) {
  if (input.selectedPortalUserId) {
    const selectedRecipient =
      input.portalRecipients.find(
        (recipient) => recipient.portalUserId === input.selectedPortalUserId
      ) ?? null;

    if (!selectedRecipient) {
      throw new Error(
        "Select an active contact with project portal access before sending this estimate."
      );
    }

    return selectedRecipient;
  }

  const primaryContactRecipient =
    input.portalRecipients.find((recipient) => recipient.isPrimaryContact) ??
    null;

  if (primaryContactRecipient) {
    return primaryContactRecipient;
  }

  const normalizedCustomerEmail = input.customerEmail.trim().toLowerCase();
  const exactMatch =
    input.portalRecipients.find(
      (recipient) =>
        recipient.email.trim().toLowerCase() === normalizedCustomerEmail
    ) ?? null;

  if (exactMatch) {
    return exactMatch;
  }

  if (input.portalRecipients.length === 1) {
    return input.portalRecipients[0];
  }

  throw new Error(
    "Customer portal access is required before sending this estimate. Select one active contact for this project, or manage the customer's primary contact and project access from People."
  );
}

async function insertEstimateCustomerEvent(input: {
  organizationId: string;
  estimateId: string;
  customerId: string;
  projectId: string;
  eventType: EstimateCustomerEventType;
  actorType: EstimateCustomerEventActorType;
  organizationUserId?: string | null;
  portalUserId?: string | null;
  eventNote?: string | null;
  emailRecipient?: string | null;
  emailTrackingToken?: string | null;
  payload?: Record<string, unknown> | null;
  occurredAt?: string;
  useAdminClient?: boolean;
}) {
  const supabase = input.useAdminClient
    ? getSupabaseAdminClient()
    : await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_customer_events")
    .insert({
      company_id: input.organizationId,
      estimate_id: input.estimateId,
      customer_id: input.customerId,
      project_id: input.projectId,
      event_type: input.eventType,
      actor_type: input.actorType,
      organization_user_id: input.organizationUserId ?? null,
      portal_user_id: input.portalUserId ?? null,
      event_note: input.eventNote ?? null,
      email_recipient: input.emailRecipient ?? null,
      email_tracking_token: input.emailTrackingToken ?? null,
      payload: input.payload ?? null,
      occurred_at: input.occurredAt ?? new Date().toISOString()
    })
    .select(
      `
        id,
        company_id,
        estimate_id,
        customer_id,
        project_id,
        event_type,
        actor_type,
        organization_user_id,
        portal_user_id,
        event_note,
        email_recipient,
        email_tracking_token,
        email_opened_at,
        email_clicked_at,
        payload,
        occurred_at,
        created_at
      `
    )
    .maybeSingle();
  const row = response.data as EstimateCustomerEventRow | null;

  if (response.error || !row) {
    throw new Error(
      `Unable to record the estimate customer event: ${response.error?.message ?? "Insert failed."}`
    );
  }

  return mapEstimateCustomerEvent(row);
}

function getNotificationDeliveryErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown delivery error.";
}

async function createEstimateNotificationDelivery(input: {
  organizationId: string;
  notificationEventId: string;
  recipientEmail: string;
  recipientUserId: string | null;
  trackingToken: string;
  payload: Record<string, unknown>;
}) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .insert({
      company_id: input.organizationId,
      notification_event_id: input.notificationEventId,
      channel: "email",
      provider: "postmark",
      status: "pending",
      recipient_user_id: input.recipientUserId,
      recipient_email: input.recipientEmail,
      tracking_token: input.trackingToken,
      payload: input.payload
    })
    .select("id, status")
    .single();
  const data = response.data as NotificationDeliveryRow | null;

  if (response.error || !data?.id) {
    throw new Error(
      `Unable to create estimate notification delivery: ${response.error?.message ?? "Insert failed."}`
    );
  }

  return data.id;
}

async function markEstimateNotificationDeliverySent(input: {
  deliveryId: string;
  providerMessageId: string;
  sentAt: string | null;
}) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .update({
      provider_message_id: input.providerMessageId,
      status: "sent",
      sent_at: input.sentAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", input.deliveryId);

  if (response.error) {
    throw new Error(
      `Unable to mark estimate notification delivery sent: ${response.error.message}`
    );
  }
}

async function markEstimateNotificationDeliveryFailed(input: {
  deliveryId: string;
  errorMessage: string;
}) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("notification_deliveries")
    .update({
      status: "failed",
      error_message: input.errorMessage,
      failed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", input.deliveryId);

  if (response.error) {
    throw new Error(
      `Unable to mark estimate notification delivery failed: ${response.error.message}`
    );
  }
}

async function insertEstimateDeliveryEvent(input: {
  scope: EstimateScope;
  estimateId: string;
  eventType: DocumentDeliveryEventType;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientRole: string | null;
  channel: DocumentDeliveryChannel;
  provider?: string | null;
  providerMessageId?: string | null;
  relatedNotificationEventId?: string | null;
  eventNote?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase.from("document_delivery_events").insert({
    company_id: input.scope.organizationId,
    subject_type: "estimate",
    subject_id: input.estimateId,
    event_type: input.eventType,
    recipient_name: input.recipientName,
    recipient_email: input.recipientEmail,
    recipient_role: input.recipientRole,
    channel: input.channel,
    provider: input.provider ?? null,
    provider_message_id: input.providerMessageId ?? null,
    related_notification_event_id: input.relatedNotificationEventId ?? null,
    event_note: input.eventNote ?? null,
    metadata: input.metadata ?? {},
    created_by: input.scope.userId
  });

  if (response.error) {
    throw new Error(
      `Unable to record estimate delivery evidence: ${response.error.message}`
    );
  }
}

async function getEstimateCustomerEventByTrackingToken(
  token: string
): Promise<EstimateCustomerEventRow | null> {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("estimate_customer_events")
    .select(
      `
        id,
        company_id,
        estimate_id,
        customer_id,
        project_id,
        event_type,
        actor_type,
        organization_user_id,
        portal_user_id,
        event_note,
        email_recipient,
        email_tracking_token,
        email_opened_at,
        email_clicked_at,
        payload,
        occurred_at,
        created_at
      `
    )
    .eq("email_tracking_token", token)
    .eq("event_type", "sent")
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to resolve estimate email tracking token: ${response.error.message}`
    );
  }

  const row = response.data as EstimateCustomerEventRow | null;
  return row && isEstimateCustomerEventRow(row) ? row : null;
}

async function getScopedPortalEstimate(
  estimateId: string,
  next: string
): Promise<EstimatePortalScope> {
  const user = await requireAuthenticatedUser(next);
  const activeGrants = (
    await listPortalAccessGrantsForCurrentUser(next)
  ).filter((grant) => grant.status === "active");

  if (activeGrants.length === 0) {
    throw new Error("No active portal access is available for this estimate.");
  }

  const accessibleCustomerIds = new Set(
    activeGrants.map((grant) => grant.customerId)
  );
  const supabase = await getSupabaseServerClient();
  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("project_id")
    .in(
      "portal_access_grant_id",
      activeGrants.map((grant) => grant.id)
    )
    .eq("status", "active");

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to validate portal project scope for the estimate: ${projectAccessResponse.error.message}`
    );
  }

  const accessibleProjectIds = new Set(
    (
      (projectAccessResponse.data as Array<{ project_id?: string }> | null) ??
      []
    )
      .map((row) => row.project_id)
      .filter((value): value is string => typeof value === "string")
  );
  const response = await supabase
    .from("estimates")
    .select(estimateSelect)
    .eq("id", estimateId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load the portal estimate: ${response.error.message}`
    );
  }

  const estimate = response.data as EstimateRow | null;

  if (!estimate) {
    throw new Error("Estimate not found for this portal user.");
  }

  if (
    !accessibleCustomerIds.has(estimate.customer_id) ||
    !accessibleProjectIds.has(estimate.project_id)
  ) {
    throw new Error(
      "This estimate is not available in the current portal scope."
    );
  }

  return {
    userId: user.id,
    estimate
  };
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
        tax_code_id,
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
        tax_rate_snapshot,
        discount_amount,
        line_subtotal,
        tax_amount,
        cost_code,
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
    throw new Error(
      `Unable to load estimate attachments: ${response.error.message}`
    );
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

export async function listEstimateCustomerEvents(
  estimateId: string,
  next = `/estimates/${estimateId}`
): Promise<EstimateCustomerEventListItem[]> {
  const scope = await requireEstimateScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_customer_events")
    .select(
      `
        id,
        company_id,
        estimate_id,
        customer_id,
        project_id,
        event_type,
        actor_type,
        organization_user_id,
        portal_user_id,
        event_note,
        email_recipient,
        email_tracking_token,
        email_opened_at,
        email_clicked_at,
        payload,
        occurred_at,
        created_at
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("estimate_id", estimateId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });
  const rows = (response.data as EstimateCustomerEventRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load estimate customer history: ${response.error.message}`
    );
  }

  if (!isEstimateCustomerEventRowArray(rows)) {
    return [];
  }

  return rows.map((row) => mapEstimateCustomerEvent(row));
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
    throw new Error(
      `Unable to load project estimate attachments: ${response.error.message}`
    );
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
    estimateReferenceNumber:
      attachment.estimates?.reference_number ?? "Estimate attachment",
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
  const seededLineItems = await seedEstimateLineItemsFromSources(
    organizationId,
    lineItems
  );
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

  if (seededLineItems.length === 0) {
    return;
  }

  const insertResponse = await supabase.from("estimate_line_items").insert(
    await buildEstimateLineInsertRows({
      organizationId,
      userId,
      estimateId,
      lineItems: seededLineItems,
      sortOrderStart: 0
    })
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to save estimate line items: ${insertResponse.error.message}`
    );
  }
}

async function getNextEstimateLineItemSortOrder(
  organizationId: string,
  estimateId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_line_items")
    .select("sort_order")
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to determine the next estimate line item position: ${response.error.message}`
    );
  }

  return isSortOrderRow(data) ? data.sort_order + 1 : 0;
}

async function appendEstimateLineItemSnapshots(
  organizationId: string,
  userId: string,
  estimateId: string,
  lineItems: Awaited<ReturnType<typeof seedEstimateLineItemsFromSources>>
) {
  if (lineItems.length === 0) {
    throw new Error(
      "Estimate insertion requires at least one canonical line item snapshot."
    );
  }

  const sortOrderStart = await getNextEstimateLineItemSortOrder(
    organizationId,
    estimateId
  );
  const supabase = await getSupabaseServerClient();
  const insertResponse = await supabase.from("estimate_line_items").insert(
    await buildEstimateLineInsertRows({
      organizationId,
      userId,
      estimateId,
      lineItems,
      sortOrderStart
    })
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to append estimate line items: ${insertResponse.error.message}`
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
    ...new Set(
      projectIds.filter((projectId): projectId is string => Boolean(projectId))
    )
  ];

  for (const projectId of uniqueProjectIds) {
    await syncProjectCommercialReadiness({
      organizationId,
      projectId
    });
  }
}

async function loadCatalogItemsForEstimateSources(
  organizationId: string,
  catalogItemIds: string[]
) {
  if (catalogItemIds.length === 0) {
    return new Map<string, CatalogItem>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("catalog_items")
    .select(
      `
        id,
        company_id,
        item_type,
        name,
        description,
        unit,
        default_unit_cost,
        default_unit_price,
        markup_percent,
        hidden_markup_percent,
        taxable,
        tax_code_id,
        cost_code,
        status
      `
    )
    .eq("company_id", organizationId)
    .in("id", catalogItemIds);

  if (response.error) {
    throw new Error(
      `Unable to load estimate pricing sources: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as CatalogItemSourceRow[])
    : [];

  return new Map(
    rows.map((row) => [row.id, mapCatalogItemSource(row)] as const)
  );
}

async function loadSystemComponentsForEstimateSources(
  organizationId: string,
  componentIds: string[]
) {
  if (componentIds.length === 0) {
    return new Map<string, CatalogSystemComponentSourceRow>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("catalog_system_components")
    .select(
      `
        id,
        company_id,
        system_catalog_item_id,
        component_catalog_item_id,
        quantity_per_unit,
        basis_unit,
        component_items:catalog_items!catalog_system_components_component_company_fkey (
          name,
          description,
          unit
        )
      `
    )
    .eq("company_id", organizationId)
    .in("id", componentIds);

  if (response.error) {
    throw new Error(
      `Unable to load system estimate sources: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as Array<
        Omit<
          CatalogSystemComponentSourceRow,
          | "component_item_name"
          | "component_item_description"
          | "component_item_unit"
        > & {
          component_items?:
            | { name: string; description: string | null; unit: string }
            | Array<{ name: string; description: string | null; unit: string }>
            | null;
        }
      >)
    : [];

  return new Map(
    rows.map((row) => {
      const componentItem = Array.isArray(row.component_items)
        ? row.component_items[0]
        : row.component_items;

      return [
        row.id,
        {
          id: row.id,
          company_id: row.company_id,
          system_catalog_item_id: row.system_catalog_item_id,
          component_catalog_item_id: row.component_catalog_item_id,
          quantity_per_unit: row.quantity_per_unit,
          basis_unit: row.basis_unit,
          component_item_name: componentItem?.name ?? null,
          component_item_description: componentItem?.description ?? null,
          component_item_unit: componentItem?.unit ?? null
        } satisfies CatalogSystemComponentSourceRow
      ] as const;
    })
  );
}

export async function seedEstimateLineItemsFromSources(
  organizationId: string,
  lineItems: EstimateLineItemInput[]
) {
  const catalogItemIds = [
    ...new Set(
      lineItems.flatMap(
        (lineItem) => [lineItem.catalogItemId].filter(Boolean) as string[]
      )
    )
  ];
  const componentIds = [
    ...new Set(
      lineItems.flatMap((lineItem) =>
        lineItem.sourceType === "system_component" && lineItem.sourceComponentId
          ? [lineItem.sourceComponentId]
          : []
      )
    )
  ];
  const [catalogItemsById, systemComponentsById] = await Promise.all([
    loadCatalogItemsForEstimateSources(organizationId, catalogItemIds),
    loadSystemComponentsForEstimateSources(organizationId, componentIds)
  ]);

  return lineItems.map((lineItem) => {
    if (!lineItem.catalogItemId) {
      throw new Error("Estimate rows must include a catalog item source.");
    }

    const catalogItem = catalogItemsById.get(lineItem.catalogItemId);

    if (!catalogItem) {
      throw new Error(
        "Estimate row pricing source was not found in this organization."
      );
    }

    if (lineItem.sourceType === "catalog_item") {
      return applyEstimateLineTaxableOverride(
        applyEstimateLineUnitPriceOverride(
          buildCatalogItemPricingSnapshot({
            catalogItem,
            quantity: lineItem.quantity,
            sourceType: "catalog_item",
            groupName: lineItem.groupName,
            assignedTo: lineItem.assignedTo
          }),
          lineItem.unitPriceOverride
        ),
        lineItem.taxableOverride
      );
    }

    if (!lineItem.sourceSystemId || !lineItem.sourceComponentId) {
      throw new Error(
        "System-derived estimate rows must include system lineage."
      );
    }

    const component = systemComponentsById.get(lineItem.sourceComponentId);

    if (!component) {
      throw new Error(
        "System component source was not found for this estimate row."
      );
    }

    if (
      component.system_catalog_item_id !== lineItem.sourceSystemId ||
      component.component_catalog_item_id !== lineItem.catalogItemId
    ) {
      throw new Error(
        "System-derived estimate row lineage does not match its catalog source."
      );
    }

    return applyEstimateLineTaxableOverride(
      applyEstimateLineUnitPriceOverride(
        buildCatalogItemPricingSnapshot({
          catalogItem,
          quantity: lineItem.quantity,
          sourceType: "system_component",
          sourceSystemId: lineItem.sourceSystemId,
          sourceComponentId: lineItem.sourceComponentId,
          groupName: lineItem.groupName,
          assignedTo: lineItem.assignedTo,
          name: component.component_item_name,
          description: component.component_item_description,
          unit: component.component_item_unit
        }),
        lineItem.unitPriceOverride
      ),
      lineItem.taxableOverride
    );
  });
}

function applyEstimateLineUnitPriceOverride(
  snapshot: ReturnType<typeof buildCatalogItemPricingSnapshot>,
  unitPriceOverride?: string | null
) {
  if (unitPriceOverride == null || unitPriceOverride.trim().length === 0) {
    return snapshot;
  }

  const unitPrice = formatMoneyValue(parseNumericValue(unitPriceOverride));
  const lineTotal = formatMoneyValue(
    calculateLineTotal(snapshot.quantity, unitPrice)
  );

  return {
    ...snapshot,
    unitPrice,
    lineTotal
  };
}

function applyEstimateLineTaxableOverride(
  snapshot: ReturnType<typeof buildCatalogItemPricingSnapshot>,
  taxableOverride?: boolean
) {
  if (taxableOverride == null || taxableOverride === snapshot.taxable) {
    return snapshot;
  }

  return {
    ...snapshot,
    taxable: taxableOverride,
    taxCodeId: taxableOverride ? snapshot.taxCodeId : null
  };
}

type EstimateLineItemSeed = Awaited<
  ReturnType<typeof seedEstimateLineItemsFromSources>
>[number];

async function getEstimateTaxSnapshotContext(
  organizationId: string,
  estimateId: string
) {
  const estimate = await getEstimateRecordById(organizationId, estimateId);

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  return {
    fallbackRate: Number(estimate.tax_rate_applied).toFixed(6),
    taxBehavior: estimate.tax_behavior_applied,
    customerTaxExempt: estimate.customer_tax_exempt_snapshot
  };
}

async function listTaxCodeRatesById(
  organizationId: string,
  taxCodeIds: string[]
) {
  if (taxCodeIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("tax_codes")
    .select("id, rate")
    .eq("company_id", organizationId)
    .in("id", taxCodeIds);

  if (response.error) {
    throw new Error(
      `Unable to load tax code snapshots: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as Array<{ id: string; rate: string | number }>)
    : [];

  return new Map(
    rows.map((row) => [row.id, Number(row.rate).toFixed(6)] as const)
  );
}

async function buildEstimateLineInsertRows(input: {
  organizationId: string;
  userId: string;
  estimateId: string;
  lineItems: EstimateLineItemSeed[];
  sortOrderStart: number;
}) {
  const taxContext = await getEstimateTaxSnapshotContext(
    input.organizationId,
    input.estimateId
  );
  const taxCodeRatesById = await listTaxCodeRatesById(input.organizationId, [
    ...new Set(
      input.lineItems.flatMap((lineItem) =>
        lineItem.taxCodeId ? [lineItem.taxCodeId] : []
      )
    )
  ]);

  return input.lineItems.map((lineItem, index) => {
    const lineSubtotal = formatMoneyValue(
      calculateLineTotal(lineItem.quantity, lineItem.unitPrice)
    );
    const taxRateSnapshot = lineItem.taxCodeId
      ? (taxCodeRatesById.get(lineItem.taxCodeId) ?? taxContext.fallbackRate)
      : !lineItem.taxable ||
          taxContext.customerTaxExempt ||
          taxContext.taxBehavior === "none"
        ? "0.000000"
        : taxContext.fallbackRate;
    const taxAmount = formatMoneyValue(
      calculateLineTotal(lineSubtotal, taxRateSnapshot)
    );

    return {
      company_id: input.organizationId,
      estimate_id: input.estimateId,
      catalog_item_id: lineItem.catalogItemId,
      tax_code_id: lineItem.taxCodeId,
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
      taxable: lineItem.taxable,
      tax_rate_snapshot: taxRateSnapshot,
      discount_amount: "0.00",
      line_subtotal: lineSubtotal,
      tax_amount: taxAmount,
      cost_code: lineItem.costCode,
      group_name: lineItem.groupName,
      assigned_to: lineItem.assignedTo,
      sort_order: input.sortOrderStart + index,
      created_by: input.userId,
      updated_by: input.userId
    };
  });
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
  const scope = await requireEstimateScope(
    `/estimates/${input.estimateId}/edit`
  );
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

  const scope = await requireEstimateScope(
    `/estimates/${input.estimateId}/edit`
  );
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
      throw new Error(
        `Unable to upload estimate attachment: ${uploadResponse.error.message}`
      );
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

export async function deleteEstimateAttachmentFiles(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.storage
    .from(STORAGE_BUCKET_NAMES.documents)
    .remove(storagePaths);

  if (response.error) {
    throw new Error(
      `Unable to delete estimate attachments: ${response.error.message}`
    );
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

export const listEstimatesByProjectIds = cache(
  async (
    projectIds: string[],
    next = "/estimates"
  ): Promise<EstimateListItem[]> => {
    const scope = await requireEstimateScope(next);
    const scopedProjectIds = [...new Set(projectIds.filter(Boolean))];

    if (scopedProjectIds.length === 0) {
      return [];
    }

    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("estimates")
      .select(estimateSelect)
      .eq("company_id", scope.organizationId)
      .in("project_id", scopedProjectIds)
      .order("updated_at", { ascending: false });
    const data: unknown = response.data;
    const error = response.error;

    if (error) {
      throw new Error(`Unable to load customer estimates: ${error.message}`);
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
  }
);

export async function getEstimateById(
  estimateId: string,
  next = "/estimates"
): Promise<EstimateDetail | null> {
  const scope = await requireEstimateScope(next);
  const [estimate, lineItems, attachments, workflowSettings] =
    await Promise.all([
      getEstimateRecordById(scope.organizationId, estimateId),
      getEstimateLineItems(scope.organizationId, estimateId),
      getEstimateAttachments(scope.organizationId, estimateId),
      getOrganizationWorkflowSettings(scope.organizationId)
    ]);

  if (!estimate) {
    return null;
  }

  const resolvedAttachments =
    await resolveEstimateAttachmentDownloadUrls(attachments);
  const mappedEstimate = mapEstimate(estimate);
  const resolvedDefaults = {
    termsHtml: workflowSettings.defaultEstimateTermsHtml,
    inclusionsHtml: workflowSettings.defaultEstimateInclusionsHtml,
    exclusionsHtml: workflowSettings.defaultEstimateExclusionsHtml,
    scopeSummaryHtml: workflowSettings.defaultEstimateScopeSummaryHtml
  };
  const estimateDefaultsSource =
    workflowSettings.createdAt === new Date(0).toISOString()
      ? "platform_fallback"
      : "organization";
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
          countryCode: estimate.projects.country_code,
          relationshipOwnerPersonId:
            estimate.projects.relationship_owner_person_id,
          salesCreditOwnerPersonId:
            estimate.projects.sales_credit_owner_person_id
        }
      : null,
    lineItems,
    attachments: resolvedAttachments,
    workspaceDefaultsApplied,
    estimateDefaultsSource
  };
}

export async function createEstimate(
  input: EstimateInput & { templateId?: string | null }
) {
  const scope = await requireEstimateScope("/estimates");
  const project = await resolveScopedProject(input.projectId, "/estimates");
  const plainNotes =
    stripHtmlToPlainText(input.content.notesHtml) ?? input.notes;
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .insert({
      company_id: scope.organizationId,
      opportunity_id: input.opportunityId,
      customer_id: project.customerId,
      project_id: project.id,
      template_id: input.templateId ?? null,
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
    throw new Error(
      `Unable to create the estimate: ${error?.message ?? "Unknown error."}`
    );
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

  await createEstimateRecordRevision({
    estimateId: data.id,
    revisionKind: "created",
    revisionReason: "Estimate created.",
    createdByUserId: scope.userId,
    ensureInitial: true,
    next: "/estimates"
  });

  return mapEstimate(estimate);
}

export async function updateEstimate(
  estimateId: string,
  input: EstimateInput,
  options?: { expectedUpdatedAt?: string | null }
) {
  const scope = await requireEstimateScope(`/estimates/${estimateId}`);
  const currentEstimate = await getEstimateRecordById(
    scope.organizationId,
    estimateId
  );

  if (!currentEstimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (
    options?.expectedUpdatedAt &&
    currentEstimate.updated_at !== options.expectedUpdatedAt
  ) {
    throw new EstimateVersionConflictError();
  }

  const project = await resolveScopedProject(
    input.projectId,
    `/estimates/${estimateId}`
  );
  const plainNotes =
    stripHtmlToPlainText(input.content.notesHtml) ?? input.notes;
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

  const estimate = await getEstimateRecordById(
    scope.organizationId,
    estimateId
  );

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  await syncEstimateProjectReadiness(scope.organizationId, [
    currentEstimate.project_id,
    project.id
  ]);

  await createEstimateRecordRevision({
    estimateId,
    revisionKind: "edited",
    revisionReason: "Estimate details or line items updated.",
    createdByUserId: scope.userId,
    next: `/estimates/${estimateId}`
  });

  return mapEstimate(estimate);
}

export async function updateEstimateStatus(
  estimateId: string,
  nextStatus: EstimateStatus,
  options?: {
    expectedUpdatedAt?: string | null;
    manualDecisionEventNote?: string | null;
  }
) {
  const scope = await requireEstimateScope(`/estimates/${estimateId}`);
  const currentEstimate = await getEstimateRecordById(
    scope.organizationId,
    estimateId
  );

  if (!currentEstimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (!canTransitionEstimateStatus(currentEstimate.status, nextStatus)) {
    throw new Error(
      `Estimate status cannot move from ${currentEstimate.status} to ${nextStatus}.`
    );
  }

  if (nextStatus === "sent") {
    throw new Error(
      "Use Send to customer so FloorConnector can record the portal delivery event and email tracking."
    );
  }

  if (
    options?.expectedUpdatedAt &&
    currentEstimate.updated_at !== options.expectedUpdatedAt
  ) {
    throw new EstimateVersionConflictError();
  }

  if (nextStatus === "approved" && !options?.manualDecisionEventNote?.trim()) {
    throw new Error(
      "Manual approval evidence is required before approving an estimate outside the portal."
    );
  }

  const nowIso = new Date().toISOString();
  const updatePayload =
    nextStatus === "approved"
      ? {
          status: nextStatus,
          customer_viewed_at: currentEstimate.customer_viewed_at ?? nowIso,
          approved_at: nowIso,
          approved_by_portal_user_id: null,
          rejected_at: null,
          rejected_by_portal_user_id: null,
          updated_by: scope.userId
        }
      : nextStatus === "rejected"
        ? {
            status: nextStatus,
            customer_viewed_at: currentEstimate.customer_viewed_at ?? nowIso,
            approved_at: null,
            approved_by_portal_user_id: null,
            rejected_at: nowIso,
            rejected_by_portal_user_id: null,
            updated_by: scope.userId
          }
        : {
            status: nextStatus,
            updated_by: scope.userId
          };

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .update(updatePayload)
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

  const updatedEstimate = await getEstimateRecordById(
    scope.organizationId,
    estimateId
  );

  if (!updatedEstimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (
    (nextStatus === "approved" || nextStatus === "rejected") &&
    !currentEstimate.customer_viewed_at
  ) {
    await insertEstimateCustomerEvent({
      organizationId: updatedEstimate.company_id,
      estimateId: updatedEstimate.id,
      customerId: updatedEstimate.customer_id,
      projectId: updatedEstimate.project_id,
      eventType: "viewed",
      actorType: "organization_user",
      organizationUserId: scope.userId,
      occurredAt: nowIso
    });
    await recordEstimateNotificationEvent({
      organizationId: updatedEstimate.company_id,
      estimateId: updatedEstimate.id,
      customerId: updatedEstimate.customer_id,
      projectId: updatedEstimate.project_id,
      estimateReferenceNumber: updatedEstimate.reference_number,
      customerName: updatedEstimate.customers?.name ?? null,
      eventType: "viewed",
      actorType: "organization_user",
      actorUserId: scope.userId,
      occurredAt: nowIso
    });
  }

  if (nextStatus === "approved" || nextStatus === "rejected") {
    await insertEstimateCustomerEvent({
      organizationId: updatedEstimate.company_id,
      estimateId: updatedEstimate.id,
      customerId: updatedEstimate.customer_id,
      projectId: updatedEstimate.project_id,
      eventType: nextStatus,
      actorType: "organization_user",
      organizationUserId: scope.userId,
      occurredAt: nowIso,
      eventNote: options?.manualDecisionEventNote ?? null
    });
    await recordEstimateNotificationEvent({
      organizationId: updatedEstimate.company_id,
      estimateId: updatedEstimate.id,
      customerId: updatedEstimate.customer_id,
      projectId: updatedEstimate.project_id,
      estimateReferenceNumber: updatedEstimate.reference_number,
      customerName: updatedEstimate.customers?.name ?? null,
      eventType: nextStatus,
      actorType: "organization_user",
      actorUserId: scope.userId,
      occurredAt: nowIso,
      eventNote: options?.manualDecisionEventNote ?? null
    });
  }

  await syncEstimateProjectReadiness(scope.organizationId, [
    currentEstimate.project_id
  ]);

  await createEstimateRecordRevision({
    estimateId,
    revisionKind: "status_change",
    revisionReason: `Estimate marked ${nextStatus}.`,
    createdByUserId: scope.userId,
    next: `/estimates/${estimateId}`
  });

  return mapEstimate(updatedEstimate);
}

async function loadLatestEstimateCommercialSnapshotSummary(
  organizationId: string,
  estimateId: string
): Promise<{
  id: string;
  snapshot_version: number;
  created_at: string;
} | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimate_commercial_snapshots")
    .select("id, snapshot_version, created_at")
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("snapshot_version", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load approved estimate snapshot state: ${response.error.message}`
    );
  }

  const data: unknown = response.data;

  if (
    data &&
    typeof data === "object" &&
    "id" in data &&
    "snapshot_version" in data &&
    "created_at" in data &&
    typeof data.id === "string" &&
    typeof data.snapshot_version === "number" &&
    typeof data.created_at === "string"
  ) {
    return data as { id: string; snapshot_version: number; created_at: string };
  }

  return null;
}

async function verifyApprovedEstimateSnapshotForContractGeneration(
  organizationId: string,
  estimateId: string
): Promise<{
  id: string;
  snapshot_version: number;
  created_at: string;
  itemCount: number;
} | null> {
  const supabase = await getSupabaseServerClient();
  const snapshotResponse = await supabase
    .from("estimate_commercial_snapshots")
    .select(
      `
        id,
        company_id,
        estimate_id,
        customer_id,
        project_id,
        snapshot_version,
        estimate_reference_number,
        subtotal_amount,
        taxable_sales_amount,
        exempt_sales_amount,
        tax_amount,
        discount_amount,
        total_amount,
        scope_summary_html,
        inclusions_html,
        exclusions_html,
        terms_html,
        content_snapshot,
        customer_name_snapshot,
        customer_company_name_snapshot,
        customer_email_snapshot,
        customer_phone_snapshot,
        customer_address_line_1_snapshot,
        customer_address_line_2_snapshot,
        customer_city_snapshot,
        customer_state_region_snapshot,
        customer_postal_code_snapshot,
        customer_country_code_snapshot,
        service_address_line_1_snapshot,
        service_address_line_2_snapshot,
        service_city_snapshot,
        service_state_region_snapshot,
        service_postal_code_snapshot,
        service_country_code_snapshot,
        project_name_snapshot,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("estimate_id", estimateId)
    .order("snapshot_version", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapshotResponse.error) {
    throw new Error(
      `Unable to verify approved estimate snapshot for contract generation: ${snapshotResponse.error.message}`
    );
  }

  const snapshotData = snapshotResponse.data as {
    id?: unknown;
    company_id?: unknown;
    estimate_id?: unknown;
    customer_id?: unknown;
    project_id?: unknown;
    snapshot_version?: unknown;
    estimate_reference_number?: unknown;
    customer_name_snapshot?: unknown;
    project_name_snapshot?: unknown;
    created_at?: unknown;
  } | null;

  if (!snapshotData) {
    return null;
  }

  if (
    typeof snapshotData.id !== "string" ||
    typeof snapshotData.company_id !== "string" ||
    typeof snapshotData.estimate_id !== "string" ||
    typeof snapshotData.customer_id !== "string" ||
    typeof snapshotData.project_id !== "string" ||
    typeof snapshotData.snapshot_version !== "number" ||
    typeof snapshotData.estimate_reference_number !== "string" ||
    typeof snapshotData.customer_name_snapshot !== "string" ||
    typeof snapshotData.project_name_snapshot !== "string" ||
    typeof snapshotData.created_at !== "string"
  ) {
    throw new Error(
      "Approved estimate snapshot exists but is not readable for contract generation."
    );
  }

  const snapshotItemsResponse = await supabase
    .from("estimate_commercial_snapshot_items")
    .select(
      `
        id,
        company_id,
        estimate_commercial_snapshot_id,
        name,
        description,
        quantity,
        unit,
        line_total,
        sort_order,
        created_at
      `
    )
    .eq("company_id", organizationId)
    .eq("estimate_commercial_snapshot_id", snapshotData.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (snapshotItemsResponse.error) {
    throw new Error(
      `Unable to verify approved estimate snapshot items for contract generation: ${snapshotItemsResponse.error.message}`
    );
  }

  if (!Array.isArray(snapshotItemsResponse.data)) {
    throw new Error(
      "Approved estimate snapshot items exist in an unreadable shape for contract generation."
    );
  }

  return {
    id: snapshotData.id,
    snapshot_version: snapshotData.snapshot_version,
    created_at: snapshotData.created_at,
    itemCount: snapshotItemsResponse.data.length
  };
}

export async function rebuildApprovedEstimateCommercialSnapshot(
  estimateId: string
) {
  const scope = await requireEstimateScope(`/estimates/${estimateId}`);
  const currentEstimate = await getEstimateRecordById(
    scope.organizationId,
    estimateId
  );

  if (!currentEstimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (currentEstimate.status !== "approved") {
    throw new Error("Only approved estimates can rebuild approval snapshots.");
  }

  const existingSnapshot = await loadLatestEstimateCommercialSnapshotSummary(
    scope.organizationId,
    estimateId
  );

  if (existingSnapshot) {
    const verifiedSnapshot =
      await verifyApprovedEstimateSnapshotForContractGeneration(
        scope.organizationId,
        estimateId
      );

    if (!verifiedSnapshot) {
      throw new Error(
        "Snapshot rebuild completed but no approved snapshot was found. Contact support."
      );
    }

    return {
      estimate: mapEstimate(currentEstimate),
      snapshotId: verifiedSnapshot.id,
      snapshotVersion: verifiedSnapshot.snapshot_version,
      created: false
    };
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("create_estimate_commercial_snapshot", {
    target_estimate_id: estimateId,
    acting_user_id: scope.userId
  });

  if (response.error) {
    throw new Error(
      `Unable to rebuild the approved estimate snapshot: ${response.error.message}`
    );
  }

  const rebuiltSnapshot =
    await verifyApprovedEstimateSnapshotForContractGeneration(
      scope.organizationId,
      estimateId
    );

  if (!rebuiltSnapshot) {
    throw new Error(
      "Snapshot rebuild completed but no approved snapshot was found. Contact support."
    );
  }

  return {
    estimate: mapEstimate(currentEstimate),
    snapshotId: rebuiltSnapshot.id,
    snapshotVersion: rebuiltSnapshot.snapshot_version,
    created: true
  };
}

export async function sendEstimateToCustomer(
  input: EstimateSendToCustomerInput
) {
  const scope = await requireEstimateScope(`/estimates/${input.estimateId}`);
  const estimate = await getEstimateRecordById(
    scope.organizationId,
    input.estimateId
  );
  const organizationContext = await getActiveOrganizationContext(scope.userId);

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (estimate.status !== "draft" && estimate.status !== "rejected") {
    throw new Error(
      "Only draft or rejected estimates can be sent for customer review."
    );
  }

  if (!estimate.projects?.id || !estimate.customers?.id) {
    throw new Error(
      "Estimate must stay linked to a real customer and project before sending."
    );
  }

  if (!estimate.customers.email?.trim()) {
    throw new Error(
      "Canonical customer.email is required before sending the estimate. Update the customer account email and retry."
    );
  }

  const portalRecipients = await listEstimatePortalRecipients({
    organizationId: scope.organizationId,
    customerId: estimate.customer_id,
    projectId: estimate.project_id
  });

  if (portalRecipients.length === 0) {
    throw new Error(
      "An active customer portal user with access to this project is required before sending the estimate."
    );
  }

  const portalRecipient = resolveEstimatePortalRecipient({
    customerEmail: estimate.customers.email,
    customerName: estimate.customers.name,
    selectedPortalUserId: input.portalUserId,
    portalRecipients
  });
  const nowIso = new Date().toISOString();
  const trackingToken = crypto.randomUUID();
  const appOrigin = getAppOrigin();
  const trackedPortalLink = new URL("/api/estimates/track/click", appOrigin);
  trackedPortalLink.searchParams.set("token", trackingToken);
  trackedPortalLink.searchParams.set("estimateId", estimate.id);
  const trackedOpenPixelUrl = new URL("/api/estimates/track/open", appOrigin);
  trackedOpenPixelUrl.searchParams.set("token", trackingToken);
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  const revertEstimateToRejected = estimate.status === "rejected";
  const deliveryPayload = {
    subjectType: "estimate",
    subjectId: estimate.id,
    portalPath: `/portal/estimates/${estimate.id}`,
    portalUserId: portalRecipient.portalUserId,
    portalAccessGrantId: portalRecipient.portalAccessGrantId,
    customerContactId: portalRecipient.customerContactId,
    estimateReferenceNumber: estimate.reference_number,
    customerName: estimate.customers.name,
    trackingToken
  };
  const notificationEvent = await createNotificationEvent({
    organizationId: scope.organizationId,
    category: "estimates",
    severity: "neutral",
    eventType: "estimate.email_send_requested",
    subjectType: "estimate",
    subjectId: estimate.id,
    customerId: estimate.customer_id,
    projectId: estimate.project_id,
    actorType: "organization_user",
    actorUserId: scope.userId,
    title: `Estimate ${estimate.reference_number} email requested`,
    message: `Estimate ${estimate.reference_number} review email was requested for the customer.`,
    linkPath: `/estimates/${estimate.id}`,
    groupKey: `estimate:${estimate.id}`,
    payload: deliveryPayload,
    occurredAt: nowIso
  });
  const deliveryId = await createEstimateNotificationDelivery({
    organizationId: scope.organizationId,
    notificationEventId: notificationEvent.id,
    recipientEmail: portalRecipient.email,
    recipientUserId: portalRecipient.portalUserId,
    trackingToken,
    payload: deliveryPayload
  });
  await insertEstimateDeliveryEvent({
    scope,
    estimateId: estimate.id,
    eventType: "send_requested",
    recipientName: portalRecipient.fullName ?? estimate.customers.name,
    recipientEmail: portalRecipient.email,
    recipientRole: "customer",
    channel: "email",
    provider: "postmark",
    relatedNotificationEventId: notificationEvent.id,
    eventNote: "Provider-backed estimate review email was requested.",
    metadata: {
      source: "contractor_app_provider_send",
      evidenceOnly: true,
      providerSend: true,
      notificationDeliveryId: deliveryId,
      approvalMutation: false,
      statusMutation: false
    }
  });

  const lockState = await getOrganizationProductionActionLockState(
    scope.organizationId
  );

  if (lockState.isLocked) {
    const errorMessage = "Provider-backed email is locked during early access.";

    await markEstimateNotificationDeliveryFailed({
      deliveryId,
      errorMessage
    });
    await insertEstimateDeliveryEvent({
      scope,
      estimateId: estimate.id,
      eventType: "failed",
      recipientName: portalRecipient.fullName ?? estimate.customers.name,
      recipientEmail: portalRecipient.email,
      recipientRole: "customer",
      channel: "email",
      provider: "postmark",
      relatedNotificationEventId: notificationEvent.id,
      eventNote: errorMessage,
      metadata: {
        source: "contractor_app_provider_send",
        evidenceOnly: true,
        providerSend: false,
        notificationDeliveryId: deliveryId,
        failureReason: "activation_locked"
      }
    });

    const currentEstimate = await getEstimateById(
      estimate.id,
      `/estimates/${estimate.id}`
    );

    if (!currentEstimate) {
      throw new Error(
        "Estimate not found after recording failed delivery evidence."
      );
    }

    return {
      estimate: currentEstimate,
      message:
        "Estimate email was not sent because provider-backed sends are locked during early access. Failed delivery evidence was recorded."
    };
  }

  if (!isPostmarkEmailConfigured()) {
    const errorMessage =
      "Postmark email delivery is not configured for this environment.";

    await markEstimateNotificationDeliveryFailed({
      deliveryId,
      errorMessage
    });
    await insertEstimateDeliveryEvent({
      scope,
      estimateId: estimate.id,
      eventType: "failed",
      recipientName: portalRecipient.fullName ?? estimate.customers.name,
      recipientEmail: portalRecipient.email,
      recipientRole: "customer",
      channel: "email",
      provider: "postmark",
      relatedNotificationEventId: notificationEvent.id,
      eventNote: errorMessage,
      metadata: {
        source: "contractor_app_provider_send",
        evidenceOnly: true,
        providerSend: false,
        notificationDeliveryId: deliveryId,
        failureReason: "not_configured"
      }
    });

    const currentEstimate = await getEstimateById(
      estimate.id,
      `/estimates/${estimate.id}`
    );

    if (!currentEstimate) {
      throw new Error(
        "Estimate not found after recording failed delivery evidence."
      );
    }

    return {
      estimate: currentEstimate,
      message:
        "Estimate email was not sent because Postmark email delivery is not configured. Failed delivery evidence was recorded."
    };
  }

  const emailContent = buildEstimatePortalEmailContent({
    recipientName: portalRecipient.fullName ?? estimate.customers.name,
    organizationName:
      organizationContext?.organization.displayName ??
      organizationContext?.organization.legalName ??
      "FloorConnector",
    estimateReferenceNumber: estimate.reference_number,
    estimateTitle: estimate.title,
    projectName: estimate.projects?.name ?? null,
    trackedPortalLink: trackedPortalLink.toString(),
    trackedOpenPixelUrl: trackedOpenPixelUrl.toString()
  });

  try {
    const result = await sendPostmarkEmail({
      toEmail: portalRecipient.email,
      subject: emailContent.subject,
      htmlBody: emailContent.htmlBody,
      textBody: emailContent.textBody
    });

    await markEstimateNotificationDeliverySent({
      deliveryId,
      providerMessageId: result.messageId,
      sentAt: result.submittedAt
    });
    await insertEstimateDeliveryEvent({
      scope,
      estimateId: estimate.id,
      eventType: "sent",
      recipientName: portalRecipient.fullName ?? estimate.customers.name,
      recipientEmail: portalRecipient.email,
      recipientRole: "customer",
      channel: "email",
      provider: "postmark",
      providerMessageId: result.messageId,
      relatedNotificationEventId: notificationEvent.id,
      eventNote: "Postmark accepted the estimate review email.",
      metadata: {
        source: "contractor_app_provider_send",
        evidenceOnly: true,
        providerSend: true,
        notificationDeliveryId: deliveryId,
        submittedAt: result.submittedAt,
        to: result.to
      }
    });
  } catch (error) {
    const errorMessage = getNotificationDeliveryErrorMessage(error);

    await markEstimateNotificationDeliveryFailed({
      deliveryId,
      errorMessage
    });
    await insertEstimateDeliveryEvent({
      scope,
      estimateId: estimate.id,
      eventType: "failed",
      recipientName: portalRecipient.fullName ?? estimate.customers.name,
      recipientEmail: portalRecipient.email,
      recipientRole: "customer",
      channel: "email",
      provider: "postmark",
      relatedNotificationEventId: notificationEvent.id,
      eventNote: errorMessage,
      metadata: {
        source: "contractor_app_provider_send",
        evidenceOnly: true,
        providerSend: true,
        notificationDeliveryId: deliveryId,
        failureReason: "provider_failed"
      }
    });

    const currentEstimate = await getEstimateById(
      estimate.id,
      `/estimates/${estimate.id}`
    );

    if (!currentEstimate) {
      throw new Error(
        "Estimate not found after recording failed delivery evidence."
      );
    }

    return {
      estimate: currentEstimate,
      message:
        "The provider email send failed. Failed delivery evidence was recorded."
    };
  }

  const sentEvent = await insertEstimateCustomerEvent({
    organizationId: scope.organizationId,
    estimateId: estimate.id,
    customerId: estimate.customer_id,
    projectId: estimate.project_id,
    eventType: "sent",
    actorType: "organization_user",
    organizationUserId: scope.userId,
    emailRecipient: portalRecipient.email,
    emailTrackingToken: trackingToken,
    payload: deliveryPayload,
    occurredAt: nowIso
  });

  const updateResponse = await supabase
    .from("estimates")
    .update({
      status: "sent",
      sent_at: nowIso,
      sent_by: scope.userId,
      customer_viewed_at: null,
      approved_at: null,
      approved_by_portal_user_id: null,
      rejected_at: null,
      rejected_by_portal_user_id: null,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", estimate.id)
    .select("id")
    .maybeSingle();

  if (updateResponse.error || !isIdRow(updateResponse.data)) {
    await admin
      .from("estimate_customer_events")
      .delete()
      .eq("company_id", scope.organizationId)
      .eq("id", sentEvent.id);

    await supabase
      .from("estimates")
      .update({
        status: revertEstimateToRejected ? "rejected" : "draft",
        sent_at: estimate.sent_at,
        sent_by: estimate.sent_by,
        customer_viewed_at: estimate.customer_viewed_at,
        approved_at: estimate.approved_at,
        approved_by_portal_user_id: estimate.approved_by_portal_user_id,
        rejected_at: estimate.rejected_at,
        rejected_by_portal_user_id: estimate.rejected_by_portal_user_id,
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("id", estimate.id);

    throw new Error(
      `Unable to mark the estimate as sent after provider acceptance: ${updateResponse.error?.message ?? "Update failed."}`
    );
  }

  const updatedEstimate = await getEstimateById(
    estimate.id,
    `/estimates/${estimate.id}`
  );

  if (!updatedEstimate) {
    throw new Error("Estimate not found after sending it to the customer.");
  }

  await syncEstimateProjectReadiness(scope.organizationId, [
    estimate.project_id
  ]);

  await createEstimateRecordRevision({
    estimateId: estimate.id,
    revisionKind: "sent",
    revisionReason: "Estimate sent to the customer for review.",
    createdByUserId: scope.userId,
    next: `/estimates/${estimate.id}`
  });

  return {
    estimate: updatedEstimate,
    message: `Estimate review email sent to ${portalRecipient.email}.`
  };
}

export async function recordPortalViewedEstimate(
  estimateId: string,
  next = "/portal"
) {
  const scope = await getScopedPortalEstimate(estimateId, next);

  if (scope.estimate.status !== "sent" || scope.estimate.customer_viewed_at) {
    return mapEstimate(scope.estimate);
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("estimates")
    .update({
      customer_viewed_at: nowIso
    })
    .eq("company_id", scope.estimate.company_id)
    .eq("id", scope.estimate.id);

  if (response.error) {
    throw new Error(
      `Unable to record the portal estimate review: ${response.error.message}`
    );
  }

  await insertEstimateCustomerEvent({
    organizationId: scope.estimate.company_id,
    estimateId: scope.estimate.id,
    customerId: scope.estimate.customer_id,
    projectId: scope.estimate.project_id,
    eventType: "viewed",
    actorType: "portal_user",
    portalUserId: scope.userId,
    occurredAt: nowIso,
    useAdminClient: true
  });
  await recordEstimateNotificationEvent({
    organizationId: scope.estimate.company_id,
    estimateId: scope.estimate.id,
    customerId: scope.estimate.customer_id,
    projectId: scope.estimate.project_id,
    estimateReferenceNumber: scope.estimate.reference_number,
    customerName: scope.estimate.customers?.name ?? null,
    eventType: "viewed",
    actorType: "portal_user",
    portalUserId: scope.userId,
    occurredAt: nowIso
  });

  const refreshed = await getScopedPortalEstimate(estimateId, next);
  return mapEstimate(refreshed.estimate);
}

export async function addEstimatePortalComment(
  input: EstimatePortalCommentInput,
  next = "/portal"
) {
  const scope = await getScopedPortalEstimate(input.estimateId, next);

  if (scope.estimate.status === "draft") {
    throw new Error(
      "This estimate is not currently open for customer comments."
    );
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();

  if (!scope.estimate.customer_viewed_at) {
    const viewedResponse = await admin
      .from("estimates")
      .update({
        customer_viewed_at: nowIso
      })
      .eq("company_id", scope.estimate.company_id)
      .eq("id", scope.estimate.id);

    if (viewedResponse.error) {
      throw new Error(
        `Unable to record the portal estimate view state: ${viewedResponse.error.message}`
      );
    }

    await insertEstimateCustomerEvent({
      organizationId: scope.estimate.company_id,
      estimateId: scope.estimate.id,
      customerId: scope.estimate.customer_id,
      projectId: scope.estimate.project_id,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: scope.userId,
      occurredAt: nowIso,
      useAdminClient: true
    });
    await recordEstimateNotificationEvent({
      organizationId: scope.estimate.company_id,
      estimateId: scope.estimate.id,
      customerId: scope.estimate.customer_id,
      projectId: scope.estimate.project_id,
      estimateReferenceNumber: scope.estimate.reference_number,
      customerName: scope.estimate.customers?.name ?? null,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: scope.userId,
      occurredAt: nowIso
    });
  }

  await insertEstimateCustomerEvent({
    organizationId: scope.estimate.company_id,
    estimateId: scope.estimate.id,
    customerId: scope.estimate.customer_id,
    projectId: scope.estimate.project_id,
    eventType: "comment_added",
    actorType: "portal_user",
    portalUserId: scope.userId,
    eventNote: input.comment,
    occurredAt: nowIso,
    useAdminClient: true
  });
  await recordEstimateNotificationEvent({
    organizationId: scope.estimate.company_id,
    estimateId: scope.estimate.id,
    customerId: scope.estimate.customer_id,
    projectId: scope.estimate.project_id,
    estimateReferenceNumber: scope.estimate.reference_number,
    customerName: scope.estimate.customers?.name ?? null,
    eventType: "comment_added",
    actorType: "portal_user",
    portalUserId: scope.userId,
    occurredAt: nowIso,
    eventNote: input.comment
  });

  const refreshed = await getScopedPortalEstimate(input.estimateId, next);
  return mapEstimate(refreshed.estimate);
}

export async function approveEstimateFromPortal(
  input: EstimatePortalDecisionInput,
  next = "/portal"
) {
  const scope = await getScopedPortalEstimate(input.estimateId, next);
  const permission = await resolvePortalScopedPermissionForCurrentUser({
    customerId: scope.estimate.customer_id,
    projectId: scope.estimate.project_id,
    permission: "canApproveEstimates",
    next
  });

  if (!permission.allowed) {
    throw new Error(
      "This contact does not currently have permission to approve or reject this estimate."
    );
  }

  if (scope.estimate.status !== "sent") {
    throw new Error("Only sent estimates can be approved from the portal.");
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("estimates")
    .update({
      status: "approved",
      customer_viewed_at: scope.estimate.customer_viewed_at ?? nowIso,
      approved_at: nowIso,
      approved_by_portal_user_id: scope.userId,
      rejected_at: null,
      rejected_by_portal_user_id: null,
      updated_by: scope.userId
    })
    .eq("company_id", scope.estimate.company_id)
    .eq("id", scope.estimate.id)
    .select(estimateSelect)
    .maybeSingle();
  const updatedRow = response.data as EstimateRow | null;

  if (response.error || !updatedRow) {
    throw new Error(
      `Unable to approve the estimate: ${response.error?.message ?? "Update failed."}`
    );
  }

  if (!scope.estimate.customer_viewed_at) {
    await insertEstimateCustomerEvent({
      organizationId: updatedRow.company_id,
      estimateId: updatedRow.id,
      customerId: updatedRow.customer_id,
      projectId: updatedRow.project_id,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: scope.userId,
      occurredAt: nowIso,
      useAdminClient: true
    });
    await recordEstimateNotificationEvent({
      organizationId: updatedRow.company_id,
      estimateId: updatedRow.id,
      customerId: updatedRow.customer_id,
      projectId: updatedRow.project_id,
      estimateReferenceNumber: updatedRow.reference_number,
      customerName: updatedRow.customers?.name ?? null,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: scope.userId,
      occurredAt: nowIso
    });
  }

  await insertEstimateCustomerEvent({
    organizationId: updatedRow.company_id,
    estimateId: updatedRow.id,
    customerId: updatedRow.customer_id,
    projectId: updatedRow.project_id,
    eventType: "approved",
    actorType: "portal_user",
    portalUserId: scope.userId,
    eventNote: input.decisionNote,
    occurredAt: nowIso,
    useAdminClient: true
  });
  await recordEstimateNotificationEvent({
    organizationId: updatedRow.company_id,
    estimateId: updatedRow.id,
    customerId: updatedRow.customer_id,
    projectId: updatedRow.project_id,
    estimateReferenceNumber: updatedRow.reference_number,
    customerName: updatedRow.customers?.name ?? null,
    eventType: "approved",
    actorType: "portal_user",
    portalUserId: scope.userId,
    occurredAt: nowIso,
    eventNote: input.decisionNote
  });

  await syncEstimateProjectReadiness(updatedRow.company_id, [
    updatedRow.project_id
  ]);

  const refreshed = await getScopedPortalEstimate(input.estimateId, next);
  return mapEstimate(refreshed.estimate);
}

export async function rejectEstimateFromPortal(
  input: EstimatePortalDecisionInput,
  next = "/portal"
) {
  const scope = await getScopedPortalEstimate(input.estimateId, next);
  const permission = await resolvePortalScopedPermissionForCurrentUser({
    customerId: scope.estimate.customer_id,
    projectId: scope.estimate.project_id,
    permission: "canApproveEstimates",
    next
  });

  if (!permission.allowed) {
    throw new Error(
      "This contact does not currently have permission to approve or reject this estimate."
    );
  }

  if (scope.estimate.status !== "sent") {
    throw new Error("Only sent estimates can be rejected from the portal.");
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("estimates")
    .update({
      status: "rejected",
      customer_viewed_at: scope.estimate.customer_viewed_at ?? nowIso,
      rejected_at: nowIso,
      rejected_by_portal_user_id: scope.userId,
      approved_at: null,
      approved_by_portal_user_id: null,
      updated_by: scope.userId
    })
    .eq("company_id", scope.estimate.company_id)
    .eq("id", scope.estimate.id)
    .select(estimateSelect)
    .maybeSingle();
  const updatedRow = response.data as EstimateRow | null;

  if (response.error || !updatedRow) {
    throw new Error(
      `Unable to reject the estimate: ${response.error?.message ?? "Update failed."}`
    );
  }

  if (!scope.estimate.customer_viewed_at) {
    await insertEstimateCustomerEvent({
      organizationId: updatedRow.company_id,
      estimateId: updatedRow.id,
      customerId: updatedRow.customer_id,
      projectId: updatedRow.project_id,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: scope.userId,
      occurredAt: nowIso,
      useAdminClient: true
    });
    await recordEstimateNotificationEvent({
      organizationId: updatedRow.company_id,
      estimateId: updatedRow.id,
      customerId: updatedRow.customer_id,
      projectId: updatedRow.project_id,
      estimateReferenceNumber: updatedRow.reference_number,
      customerName: updatedRow.customers?.name ?? null,
      eventType: "viewed",
      actorType: "portal_user",
      portalUserId: scope.userId,
      occurredAt: nowIso
    });
  }

  await insertEstimateCustomerEvent({
    organizationId: updatedRow.company_id,
    estimateId: updatedRow.id,
    customerId: updatedRow.customer_id,
    projectId: updatedRow.project_id,
    eventType: "rejected",
    actorType: "portal_user",
    portalUserId: scope.userId,
    eventNote: input.decisionNote,
    occurredAt: nowIso,
    useAdminClient: true
  });
  await recordEstimateNotificationEvent({
    organizationId: updatedRow.company_id,
    estimateId: updatedRow.id,
    customerId: updatedRow.customer_id,
    projectId: updatedRow.project_id,
    estimateReferenceNumber: updatedRow.reference_number,
    customerName: updatedRow.customers?.name ?? null,
    eventType: "rejected",
    actorType: "portal_user",
    portalUserId: scope.userId,
    occurredAt: nowIso,
    eventNote: input.decisionNote
  });

  await syncEstimateProjectReadiness(updatedRow.company_id, [
    updatedRow.project_id
  ]);

  const refreshed = await getScopedPortalEstimate(input.estimateId, next);
  return mapEstimate(refreshed.estimate);
}

export async function trackEstimateEmailOpened(trackingToken: string) {
  const event = await getEstimateCustomerEventByTrackingToken(trackingToken);
  const delivery = await trackNotificationDeliveryOpened(trackingToken);

  if (!event || event.email_opened_at) {
    return delivery;
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("estimate_customer_events")
    .update({
      email_opened_at: nowIso
    })
    .eq("id", event.id)
    .eq("company_id", event.company_id);

  if (response.error) {
    throw new Error(
      `Unable to record the estimate email open event: ${response.error.message}`
    );
  }

  await recordEstimateNotificationEvent({
    organizationId: event.company_id,
    estimateId: event.estimate_id,
    customerId: event.customer_id,
    projectId: event.project_id,
    estimateReferenceNumber:
      typeof event.payload?.estimateReferenceNumber === "string"
        ? event.payload.estimateReferenceNumber
        : "estimate",
    customerName:
      typeof event.payload?.customerName === "string"
        ? event.payload.customerName
        : null,
    eventType: "opened",
    actorType: "system",
    occurredAt: nowIso,
    payload: {
      trackingToken
    }
  });

  return delivery;
}

export async function trackEstimateEmailClicked(trackingToken: string) {
  const event = await getEstimateCustomerEventByTrackingToken(trackingToken);
  const delivery = await trackNotificationDeliveryClicked(trackingToken);

  if (!event || event.email_clicked_at) {
    return event
      ? {
          estimateId: event.estimate_id,
          portalPath:
            typeof event.payload?.portalPath === "string"
              ? event.payload.portalPath
              : `/portal/estimates/${event.estimate_id}`
        }
      : null;
  }

  const nowIso = new Date().toISOString();
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("estimate_customer_events")
    .update({
      email_clicked_at: nowIso
    })
    .eq("id", event.id)
    .eq("company_id", event.company_id);

  if (response.error) {
    throw new Error(
      `Unable to record the estimate email click event: ${response.error.message}`
    );
  }

  await recordEstimateNotificationEvent({
    organizationId: event.company_id,
    estimateId: event.estimate_id,
    customerId: event.customer_id,
    projectId: event.project_id,
    estimateReferenceNumber:
      typeof event.payload?.estimateReferenceNumber === "string"
        ? event.payload.estimateReferenceNumber
        : "estimate",
    customerName:
      typeof event.payload?.customerName === "string"
        ? event.payload.customerName
        : null,
    eventType: "clicked",
    actorType: "system",
    occurredAt: nowIso,
    payload: {
      trackingToken,
      deliveryId: delivery?.deliveryId ?? null
    }
  });

  return {
    estimateId: event.estimate_id,
    portalPath:
      typeof event.payload?.portalPath === "string"
        ? event.payload.portalPath
        : `/portal/estimates/${event.estimate_id}`
  };
}

export async function quickCreateEstimateFromContext(input: {
  creationMode: "opportunity" | "customer" | "standalone";
  opportunityId: string | null;
  customerId: string | null;
  projectId: string | null;
  projectName: string | null;
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
          throw new Error(
            "Customer-started estimates need customer continuity."
          );
        }

        flow = await ensureOpportunityEstimateFlowFromCustomer({
          customerId: input.customerId,
          projectId: input.projectId,
          projectName: input.projectName,
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
          projectName: input.projectName,
          title: input.title
        });
        break;
      default:
        throw new Error("Unsupported estimate creation mode.");
    }
  }

  const preferredTemplate =
    await getCurrentUserPreferredEstimateTemplate("/estimates");

  return createEstimate({
    opportunityId: flow.opportunityId,
    projectId: flow.projectId,
    templateId: resolvePreferredEstimateTemplateForCreate(preferredTemplate),
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

export async function insertCatalogItemToEstimate(input: {
  estimateId: string;
  catalogItemId: string;
  groupName?: string | null;
}) {
  const scope = await requireEstimateScope(
    `/estimates/${input.estimateId}/edit`
  );
  const estimate = await getEstimateRecordById(
    scope.organizationId,
    input.estimateId
  );

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  const catalogItemsById = await loadCatalogItemsForEstimateSources(
    scope.organizationId,
    [input.catalogItemId]
  );
  const catalogItem = catalogItemsById.get(input.catalogItemId);

  if (!catalogItem) {
    throw new Error(
      "The selected catalog item could not be found in active inventory."
    );
  }

  if (catalogItem.status !== "active") {
    throw new Error("Archived catalog items cannot be added to estimates.");
  }

  if (catalogItem.itemType === "system") {
    throw new Error(
      "Systems must be inserted through the canonical system expansion flow."
    );
  }

  const lineItemSnapshot = buildCatalogItemPricingSnapshot({
    catalogItem,
    quantity: "1.00",
    sourceType: "catalog_item",
    groupName: input.groupName ?? null
  });

  await appendEstimateLineItemSnapshots(
    scope.organizationId,
    scope.userId,
    input.estimateId,
    [lineItemSnapshot]
  );

  const updatedEstimate = await getEstimateById(
    input.estimateId,
    `/estimates/${input.estimateId}/edit`
  );

  if (!updatedEstimate) {
    throw new Error("Estimate not found after inserting the catalog item.");
  }

  await createEstimateRecordRevision({
    estimateId: input.estimateId,
    revisionKind: "edited",
    revisionReason: "Estimate line items updated.",
    createdByUserId: scope.userId,
    next: `/estimates/${input.estimateId}/edit`
  });

  return updatedEstimate;
}

export async function updateCatalogItemFromEstimateLine(input: {
  estimateId: string;
  estimateLineItemId: string;
  catalogItemId: string;
  name: string;
  description: string | null;
  unit: string;
  defaultUnitPrice: string;
  taxable: boolean;
}) {
  const scope = await requireEstimateScope(
    `/estimates/${input.estimateId}/edit`
  );
  const estimate = await getEstimateRecordById(
    scope.organizationId,
    input.estimateId
  );

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (estimate.status === "approved") {
    throw new Error("Approved estimates cannot edit catalog item snapshots.");
  }

  const supabase = await getSupabaseServerClient();
  const lineItemResponse = await supabase
    .from("estimate_line_items")
    .select("*")
    .eq("company_id", scope.organizationId)
    .eq("estimate_id", input.estimateId)
    .eq("id", input.estimateLineItemId)
    .eq("catalog_item_id", input.catalogItemId)
    .maybeSingle();

  if (lineItemResponse.error) {
    throw new Error(
      `Unable to load estimate line item: ${lineItemResponse.error.message}`
    );
  }

  if (!lineItemResponse.data) {
    throw new Error("Estimate line item not found for this estimate.");
  }

  const catalogUpdateResponse = await supabase
    .from("catalog_items")
    .update({
      name: input.name,
      description: input.description,
      unit: input.unit,
      default_unit_price: input.defaultUnitPrice,
      taxable: input.taxable,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.catalogItemId)
    .select("*")
    .single();

  if (catalogUpdateResponse.error) {
    throw new Error(
      `Unable to update catalog item: ${catalogUpdateResponse.error.message}`
    );
  }

  const catalogItemsById = await loadCatalogItemsForEstimateSources(
    scope.organizationId,
    [input.catalogItemId]
  );
  const catalogItem = catalogItemsById.get(input.catalogItemId);

  if (!catalogItem) {
    throw new Error(
      "Updated catalog item could not be loaded for estimate snapshot."
    );
  }

  const currentLineItem = lineItemResponse.data as EstimateLineItemRow;
  const snapshot = buildCatalogItemPricingSnapshot({
    catalogItem,
    quantity: currentLineItem.quantity,
    sourceType:
      currentLineItem.source_type === "system_component"
        ? "system_component"
        : "catalog_item",
    sourceSystemId: currentLineItem.source_system_id,
    sourceComponentId: currentLineItem.source_component_id,
    groupName: currentLineItem.group_name,
    assignedTo: currentLineItem.assigned_to
  });
  const [snapshotRow] = await buildEstimateLineInsertRows({
    organizationId: scope.organizationId,
    userId: scope.userId,
    estimateId: input.estimateId,
    lineItems: [snapshot],
    sortOrderStart: currentLineItem.sort_order
  });

  if (!snapshotRow) {
    throw new Error("Unable to rebuild estimate snapshot from catalog item.");
  }

  const lineItemUpdatePayload: Partial<typeof snapshotRow> = { ...snapshotRow };
  delete lineItemUpdatePayload.company_id;
  delete lineItemUpdatePayload.estimate_id;
  delete lineItemUpdatePayload.created_by;
  const lineItemUpdateResponse = await supabase
    .from("estimate_line_items")
    .update(lineItemUpdatePayload)
    .eq("company_id", scope.organizationId)
    .eq("estimate_id", input.estimateId)
    .eq("id", input.estimateLineItemId);

  if (lineItemUpdateResponse.error) {
    throw new Error(
      `Unable to update estimate line item snapshot: ${lineItemUpdateResponse.error.message}`
    );
  }

  const estimateUpdateResponse = await supabase
    .from("estimates")
    .update({ updated_by: scope.userId })
    .eq("company_id", scope.organizationId)
    .eq("id", input.estimateId);

  if (estimateUpdateResponse.error) {
    throw new Error(
      `Unable to refresh estimate totals: ${estimateUpdateResponse.error.message}`
    );
  }

  const updatedEstimate = await getEstimateById(
    input.estimateId,
    `/estimates/${input.estimateId}/edit`
  );

  if (!updatedEstimate) {
    throw new Error("Estimate not found after updating the catalog item.");
  }

  await createEstimateRecordRevision({
    estimateId: input.estimateId,
    revisionKind: "edited",
    revisionReason: "Estimate catalog-backed line item updated.",
    createdByUserId: scope.userId,
    next: `/estimates/${input.estimateId}/edit`
  });

  return updatedEstimate;
}

export async function insertSystemToEstimate(input: {
  estimateId: string;
  systemCatalogItemId: string;
  squareFootage: string;
  linearFootage?: string | null;
  count?: string | null;
  groupName?: string | null;
}) {
  const scope = await requireEstimateScope(
    `/estimates/${input.estimateId}/edit`
  );
  const estimate = await getEstimateRecordById(
    scope.organizationId,
    input.estimateId
  );

  if (!estimate) {
    throw new Error("Estimate not found for this organization.");
  }

  if (estimate.status === "approved") {
    throw new Error("Approved estimates cannot insert system line items.");
  }

  const catalogItems = await listCatalogItems();
  const systemCatalogItem = catalogItems.find(
    (item) =>
      item.id === input.systemCatalogItemId &&
      item.itemType === "system" &&
      item.status === "active"
  );

  if (!systemCatalogItem) {
    throw new Error(
      "The selected system could not be found in active inventory."
    );
  }

  const squareFootage = Number(input.squareFootage);
  const linearFootage = Number(input.linearFootage ?? 0);
  const count = Number(input.count ?? 1);
  const groupName =
    input.groupName?.trim() ||
    `${systemCatalogItem.name} (${squareFootage.toFixed(2)} sqft / ${linearFootage.toFixed(2)} lf)`;
  const lineItemSnapshots = buildExpandedSystemLineItemSnapshots({
    systemCatalogItem,
    catalogItems,
    squareFootage,
    perimeter: linearFootage,
    count,
    groupName
  });

  if (lineItemSnapshots.length === 0) {
    throw new Error(
      "This system has no active components available to insert."
    );
  }

  await appendEstimateLineItemSnapshots(
    scope.organizationId,
    scope.userId,
    input.estimateId,
    lineItemSnapshots
  );

  const updatedEstimate = await getEstimateById(
    input.estimateId,
    `/estimates/${input.estimateId}/edit`
  );

  if (!updatedEstimate) {
    throw new Error("Estimate not found after inserting the expanded system.");
  }

  await createEstimateRecordRevision({
    estimateId: input.estimateId,
    revisionKind: "edited",
    revisionReason: "Estimate system line items inserted.",
    createdByUserId: scope.userId,
    next: `/estimates/${input.estimateId}/edit`
  });

  return updatedEstimate;
}

export async function importEstimateLineItemsFromEstimate(input: {
  destinationEstimateId: string;
  sourceEstimateId: string;
}) {
  const scope = await requireEstimateScope(
    `/estimates/${input.destinationEstimateId}/edit`
  );
  const destinationEstimate = await getEstimateRecordById(
    scope.organizationId,
    input.destinationEstimateId
  );

  if (!destinationEstimate) {
    throw new Error("Destination estimate not found for this organization.");
  }

  if (destinationEstimate.status !== "draft") {
    throw new Error(
      "Only draft estimates can import line items from another estimate."
    );
  }

  if (input.sourceEstimateId === input.destinationEstimateId) {
    throw new Error("Choose a different estimate to import from.");
  }

  const sourceEstimate = await getEstimateRecordById(
    scope.organizationId,
    input.sourceEstimateId
  );

  if (!sourceEstimate) {
    throw new Error("Source estimate not found for this organization.");
  }

  const sourceLineItems = await getEstimateLineItems(
    scope.organizationId,
    input.sourceEstimateId
  );

  if (sourceLineItems.length === 0) {
    throw new Error(
      `${sourceEstimate.reference_number} has no line items to import yet.`
    );
  }

  const importableLineItems = sourceLineItems
    .filter(
      (lineItem) =>
        Boolean(lineItem.catalogItemId) &&
        (lineItem.sourceType === "catalog_item" ||
          lineItem.sourceType === "system_component")
    )
    .map((lineItem, index) => ({
      rowKey: `import-${index + 1}`,
      catalogItemId: lineItem.catalogItemId,
      sourceType: lineItem.sourceType,
      sourceSystemId: lineItem.sourceSystemId,
      sourceComponentId: lineItem.sourceComponentId,
      quantity: lineItem.quantity,
      unitPriceOverride: lineItem.unitPrice,
      taxableOverride: lineItem.taxable,
      assignedTo: lineItem.assignedTo,
      groupName: lineItem.groupName
    }));

  if (importableLineItems.length === 0) {
    throw new Error(
      `${sourceEstimate.reference_number} has no canonical estimate items available to import.`
    );
  }

  const parsedImportLineItems = estimateLineItemInputSchema
    .array()
    .safeParse(importableLineItems);

  if (!parsedImportLineItems.success) {
    throw new Error(
      `${sourceEstimate.reference_number} contains line items that can no longer be imported safely.`
    );
  }

  const seededLineItems = await seedEstimateLineItemsFromSources(
    scope.organizationId,
    parsedImportLineItems.data
  );

  await appendEstimateLineItemSnapshots(
    scope.organizationId,
    scope.userId,
    input.destinationEstimateId,
    seededLineItems
  );

  const updatedEstimate = await getEstimateById(
    input.destinationEstimateId,
    `/estimates/${input.destinationEstimateId}/edit`
  );

  if (!updatedEstimate) {
    throw new Error("Estimate not found after importing line items.");
  }

  await createEstimateRecordRevision({
    estimateId: input.destinationEstimateId,
    revisionKind: "edited",
    revisionReason: `Estimate line items imported from ${sourceEstimate.reference_number}.`,
    createdByUserId: scope.userId,
    next: `/estimates/${input.destinationEstimateId}/edit`
  });

  return {
    estimate: updatedEstimate,
    importedCount: seededLineItems.length,
    sourceEstimateReferenceNumber: sourceEstimate.reference_number
  };
}

export async function importEstimateReusableContentFromEstimate(input: {
  destinationEstimateId: string;
  sourceEstimateId: string;
  section: "scope" | "terms" | "inclusions" | "exclusions";
}) {
  const scope = await requireEstimateScope(
    `/estimates/${input.destinationEstimateId}/edit`
  );
  const destinationEstimate = await getEstimateRecordById(
    scope.organizationId,
    input.destinationEstimateId
  );

  if (!destinationEstimate) {
    throw new Error("Destination estimate not found for this organization.");
  }

  if (destinationEstimate.status !== "draft") {
    throw new Error(
      "Only draft estimates can import reusable content from another estimate."
    );
  }

  if (input.sourceEstimateId === input.destinationEstimateId) {
    throw new Error("Choose a different estimate to import from.");
  }

  const sourceEstimate = await getEstimateRecordById(
    scope.organizationId,
    input.sourceEstimateId
  );

  if (!sourceEstimate) {
    throw new Error("Source estimate not found for this organization.");
  }

  const sourceContent = normalizeEstimateWorkspaceContent(
    sourceEstimate.content,
    sourceEstimate.notes
  );

  switch (input.section) {
    case "scope":
      if (
        !sourceContent.scopeSummaryHtml &&
        sourceContent.scopeItems.length === 0
      ) {
        throw new Error(
          `${sourceEstimate.reference_number} has no reusable scope / SOW to import.`
        );
      }
      break;
    case "terms":
      if (!sourceContent.termsHtml) {
        throw new Error(
          `${sourceEstimate.reference_number} has no reusable terms to import.`
        );
      }
      break;
    case "inclusions":
      if (!sourceContent.inclusionsHtml) {
        throw new Error(
          `${sourceEstimate.reference_number} has no reusable inclusions to import.`
        );
      }
      break;
    case "exclusions":
      if (!sourceContent.exclusionsHtml) {
        throw new Error(
          `${sourceEstimate.reference_number} has no reusable exclusions to import.`
        );
      }
      break;
    default:
      throw new Error("Unsupported reusable content import section.");
  }

  return {
    sourceEstimateReferenceNumber: sourceEstimate.reference_number,
    section: input.section,
    content: {
      scopeSummaryHtml: sourceContent.scopeSummaryHtml,
      scopeItems: sourceContent.scopeItems,
      termsHtml: sourceContent.termsHtml,
      inclusionsHtml: sourceContent.inclusionsHtml,
      exclusionsHtml: sourceContent.exclusionsHtml
    }
  };
}
