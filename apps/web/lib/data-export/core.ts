export type ExportFormat = "csv" | "json";

export type ExportModuleKey =
  | "customers"
  | "customer_contacts"
  | "projects"
  | "estimates"
  | "estimate_line_items"
  | "invoices"
  | "invoice_line_items"
  | "payments"
  | "jobs"
  | "job_assignments";

export type ExportFieldDefinition = {
  key: string;
  label: string;
  source: string;
  meaning: string;
  piiOrSecurityNote: string;
  relationshipKey?: boolean;
  formats: readonly ExportFormat[];
};

export type ExportModuleDefinition = {
  key: ExportModuleKey;
  label: string;
  description: string;
  sourceModel: string;
  fields: readonly ExportFieldDefinition[];
};

export type ExportOrganizationMetadata = {
  id: string;
  displayName: string;
  slug: string;
};

export type ExportBuildInput = {
  module: ExportModuleDefinition;
  organization: ExportOrganizationMetadata;
  rows: Array<Record<string, unknown>>;
  exportedAt: string;
  schemaVersion?: string;
};

export const EXPORT_SCHEMA_VERSION = "2026-05-15.export.v1";
const MAX_ERROR_SUMMARY_LENGTH = 240;

export const exportModuleDefinitions: readonly ExportModuleDefinition[] = [
  {
    key: "customers",
    label: "Customers",
    description: "Customer account records, safe contact fields, addresses, and tax flags.",
    sourceModel: "customers",
    fields: [
      field("customer_id", "Customer ID", "customers.id", "Stable customer record id.", "Identifier only.", true),
      field("customer_name", "Customer name", "customers.name", "Primary customer account label.", "May identify a person or business."),
      field("company_name", "Company name", "customers.company_name", "Optional company or business name.", "May identify a business contact."),
      field("email", "Email", "customers.email", "Customer account email fallback.", "PII. Export only for tenant owner/admin data portability."),
      field("phone", "Phone", "customers.phone", "Customer account phone fallback.", "PII. Export only for tenant owner/admin data portability."),
      field("address_line_1", "Address line 1", "customers.address_line_1", "Customer mailing or job contact address.", "PII/location data."),
      field("address_line_2", "Address line 2", "customers.address_line_2", "Additional address context.", "PII/location data."),
      field("city", "City", "customers.city", "Customer address city.", "Location data."),
      field("state_region", "State/region", "customers.state_region", "Customer address state or region.", "Location data."),
      field("postal_code", "Postal code", "customers.postal_code", "Customer address postal code.", "Location data."),
      field("country_code", "Country", "customers.country_code", "Customer address country code.", "Location data."),
      field("is_tax_exempt", "Tax exempt", "customers.is_tax_exempt", "Stored customer tax exemption flag.", "Commercial/accounting data."),
      field("tax_exemption_reason", "Tax exemption reason", "customers.tax_exemption_reason", "Stored tax exemption explanation.", "Commercial/accounting data."),
      field("tax_exemption_expires_on", "Tax exemption expires", "customers.tax_exemption_expires_on", "Stored exemption expiration date.", "Commercial/accounting data."),
      field("created_at", "Created at", "customers.created_at", "Record creation timestamp.", "Operational metadata."),
      field("updated_at", "Updated at", "customers.updated_at", "Record update timestamp.", "Operational metadata.")
    ]
  },
  {
    key: "customer_contacts",
    label: "Customer contacts",
    description: "Contact identities linked to customer accounts through customer_contacts.",
    sourceModel: "customer_contacts + contacts",
    fields: [
      field("customer_contact_id", "Customer contact link ID", "customer_contacts.id", "Stable customer-contact relationship id.", "Identifier only.", true),
      field("customer_id", "Customer ID", "customer_contacts.customer_id", "Related customer account id.", "Identifier only.", true),
      field("customer_name", "Customer name", "customers.name", "Related customer account label.", "May identify a person or business."),
      field("contact_id", "Contact ID", "contacts.id", "Stable contact identity id.", "Identifier only.", true),
      field("display_name", "Contact name", "contacts.display_name", "Contact display name.", "PII."),
      field("company_name", "Contact company", "contacts.company_name", "Optional contact company.", "May identify a business contact."),
      field("email", "Email", "contacts.email", "Contact email.", "PII."),
      field("phone", "Phone", "contacts.phone", "Contact phone.", "PII."),
      field("contact_kind", "Contact kind", "contacts.contact_kind", "Contact classification.", "Operational metadata."),
      field("relationship_label", "Relationship", "customer_contacts.relationship_label", "Relationship to customer account.", "Operational metadata."),
      field("is_primary", "Primary contact", "customer_contacts.is_primary", "Whether this is the primary customer contact.", "Operational metadata."),
      field("created_at", "Created at", "customer_contacts.created_at", "Relationship creation timestamp.", "Operational metadata."),
      field("updated_at", "Updated at", "customer_contacts.updated_at", "Relationship update timestamp.", "Operational metadata.")
    ]
  },
  {
    key: "projects",
    label: "Projects",
    description: "Project records with customer links, readiness state, status, and job address.",
    sourceModel: "projects",
    fields: [
      field("project_id", "Project ID", "projects.id", "Stable project id.", "Identifier only.", true),
      field("project_name", "Project name", "projects.name", "Project label.", "May include customer or location context."),
      field("customer_id", "Customer ID", "projects.customer_id", "Related customer id.", "Identifier only.", true),
      field("customer_name", "Customer name", "customers.name", "Related customer label.", "May identify a person or business."),
      field("status", "Status", "projects.status", "Current project status.", "Operational metadata."),
      field("commercial_readiness_status", "Commercial readiness", "projects.commercial_readiness_status", "Commercial readiness state.", "Operational metadata."),
      field("financing_status", "Financing status", "projects.financing_status", "Stored financing readiness state.", "Commercial metadata."),
      field("ready_to_schedule_at", "Ready to schedule at", "projects.ready_to_schedule_at", "Readiness timestamp when present.", "Operational metadata."),
      field("address_line_1", "Address line 1", "projects.address_line_1", "Project address.", "PII/location data."),
      field("city", "City", "projects.city", "Project city.", "Location data."),
      field("state_region", "State/region", "projects.state_region", "Project state or region.", "Location data."),
      field("postal_code", "Postal code", "projects.postal_code", "Project postal code.", "Location data."),
      field("created_at", "Created at", "projects.created_at", "Record creation timestamp.", "Operational metadata."),
      field("updated_at", "Updated at", "projects.updated_at", "Record update timestamp.", "Operational metadata.")
    ]
  },
  {
    key: "estimates",
    label: "Estimates summary",
    description: "Estimate headers, stored statuses, dates, and stored commercial totals.",
    sourceModel: "estimates",
    fields: [
      field("estimate_id", "Estimate ID", "estimates.id", "Stable estimate id.", "Identifier only.", true),
      field("reference_number", "Reference number", "estimates.reference_number", "Human-readable estimate number.", "Commercial metadata."),
      field("title", "Title", "estimates.title", "Estimate title.", "May include customer/project context."),
      field("customer_id", "Customer ID", "estimates.customer_id", "Related customer id.", "Identifier only.", true),
      field("customer_name", "Customer name", "customers.name", "Related customer label.", "May identify a person or business."),
      field("project_id", "Project ID", "estimates.project_id", "Related project id.", "Identifier only.", true),
      field("project_name", "Project name", "projects.name", "Related project label.", "May include location context."),
      field("status", "Status", "estimates.status", "Current estimate status.", "Commercial metadata."),
      field("estimate_date", "Estimate date", "estimates.estimate_date", "Stored estimate date.", "Commercial metadata."),
      field("subtotal_amount", "Subtotal", "estimates.subtotal_amount", "Stored estimate subtotal.", "Commercial amount."),
      field("tax_amount", "Tax", "estimates.tax_amount", "Stored estimate tax.", "Commercial amount."),
      field("discount_amount", "Discount", "estimates.discount_amount", "Stored estimate discount.", "Commercial amount."),
      field("total_amount", "Total", "estimates.total_amount", "Stored estimate total.", "Commercial amount."),
      field("sent_at", "Sent at", "estimates.sent_at", "Customer send timestamp when present.", "Workflow metadata."),
      field("approved_at", "Approved at", "estimates.approved_at", "Approval timestamp when present.", "Workflow metadata."),
      field("created_at", "Created at", "estimates.created_at", "Record creation timestamp.", "Operational metadata."),
      field("updated_at", "Updated at", "estimates.updated_at", "Record update timestamp.", "Operational metadata.")
    ]
  },
  {
    key: "estimate_line_items",
    label: "Estimate line items",
    description: "Customer-facing estimate line snapshots without internal cost or markup fields.",
    sourceModel: "estimate_line_items",
    fields: [
      field("line_item_id", "Line item ID", "estimate_line_items.id", "Stable estimate line id.", "Identifier only.", true),
      field("estimate_id", "Estimate ID", "estimate_line_items.estimate_id", "Related estimate id.", "Identifier only.", true),
      field("group_name", "Group", "estimate_line_items.group_name", "Estimate group/section label.", "Commercial metadata."),
      field("name", "Name", "estimate_line_items.name", "Line item name.", "Commercial scope."),
      field("description", "Description", "estimate_line_items.description", "Line item description.", "Commercial scope."),
      field("quantity", "Quantity", "estimate_line_items.quantity", "Stored quantity.", "Commercial quantity."),
      field("unit", "Unit", "estimate_line_items.unit", "Stored unit.", "Commercial quantity."),
      field("unit_price", "Unit price", "estimate_line_items.unit_price", "Stored customer-facing unit price.", "Commercial amount."),
      field("taxable", "Taxable", "estimate_line_items.taxable", "Stored taxable flag.", "Commercial/tax metadata."),
      field("line_subtotal", "Line subtotal", "estimate_line_items.line_subtotal", "Stored line subtotal.", "Commercial amount."),
      field("tax_amount", "Tax", "estimate_line_items.tax_amount", "Stored line tax amount.", "Commercial amount."),
      field("line_total", "Line total", "estimate_line_items.line_total", "Stored line total.", "Commercial amount."),
      field("sort_order", "Sort order", "estimate_line_items.sort_order", "Display/order position.", "Operational metadata.")
    ]
  },
  {
    key: "invoices",
    label: "Invoices summary",
    description: "Invoice headers, workflow role, dates, status, and stored commercial totals.",
    sourceModel: "invoices",
    fields: [
      field("invoice_id", "Invoice ID", "invoices.id", "Stable invoice id.", "Identifier only.", true),
      field("reference_number", "Reference number", "invoices.reference_number", "Human-readable invoice number.", "Commercial metadata."),
      field("customer_id", "Customer ID", "invoices.customer_id", "Related customer id.", "Identifier only.", true),
      field("customer_name", "Customer name", "customers.name", "Related customer label.", "May identify a person or business."),
      field("project_id", "Project ID", "invoices.project_id", "Related project id.", "Identifier only.", true),
      field("project_name", "Project name", "projects.name", "Related project label.", "May include location context."),
      field("estimate_id", "Estimate ID", "invoices.estimate_id", "Related estimate id when present.", "Identifier only.", true),
      field("job_id", "Job ID", "invoices.job_id", "Related job id when present.", "Identifier only.", true),
      field("workflow_role", "Workflow role", "invoices.workflow_role", "Invoice role such as deposit or standard.", "Commercial metadata."),
      field("status", "Status", "invoices.status", "Current invoice status.", "Commercial metadata."),
      field("issue_date", "Issue date", "invoices.issue_date", "Invoice issue date.", "Commercial metadata."),
      field("due_date", "Due date", "invoices.due_date", "Invoice due date.", "Commercial metadata."),
      field("subtotal_amount", "Subtotal", "invoices.subtotal_amount", "Stored invoice subtotal.", "Commercial amount."),
      field("tax_amount", "Tax", "invoices.tax_amount", "Stored invoice tax.", "Commercial amount."),
      field("discount_amount", "Discount", "invoices.discount_amount", "Stored invoice discount.", "Commercial amount."),
      field("retainage_held_amount", "Retainage held", "invoices.retainage_held_amount", "Stored retainage held.", "Commercial amount."),
      field("total_amount", "Total", "invoices.total_amount", "Stored invoice total.", "Commercial amount."),
      field("balance_due_amount", "Balance due", "invoices.balance_due_amount", "Stored balance due.", "Commercial amount."),
      field("created_at", "Created at", "invoices.created_at", "Record creation timestamp.", "Operational metadata."),
      field("updated_at", "Updated at", "invoices.updated_at", "Record update timestamp.", "Operational metadata.")
    ]
  },
  {
    key: "invoice_line_items",
    label: "Invoice line items",
    description: "Customer-facing invoice line records without internal cost or provider payment details.",
    sourceModel: "invoice_line_items",
    fields: [
      field("line_item_id", "Line item ID", "invoice_line_items.id", "Stable invoice line id.", "Identifier only.", true),
      field("invoice_id", "Invoice ID", "invoice_line_items.invoice_id", "Related invoice id.", "Identifier only.", true),
      field("lineage_type", "Lineage type", "invoice_line_items.lineage_type", "Source lineage classification.", "Commercial lineage metadata."),
      field("name", "Name", "invoice_line_items.name", "Line item name.", "Commercial scope."),
      field("description", "Description", "invoice_line_items.description", "Line item description.", "Commercial scope."),
      field("quantity", "Quantity", "invoice_line_items.quantity", "Stored quantity.", "Commercial quantity."),
      field("unit", "Unit", "invoice_line_items.unit", "Stored unit.", "Commercial quantity."),
      field("unit_price", "Unit price", "invoice_line_items.unit_price", "Stored customer-facing unit price.", "Commercial amount."),
      field("taxable", "Taxable", "invoice_line_items.taxable", "Stored taxable flag.", "Commercial/tax metadata."),
      field("line_subtotal", "Line subtotal", "invoice_line_items.line_subtotal", "Stored line subtotal.", "Commercial amount."),
      field("tax_amount", "Tax", "invoice_line_items.tax_amount", "Stored line tax amount.", "Commercial amount."),
      field("line_total", "Line total", "invoice_line_items.line_total", "Stored line total.", "Commercial amount."),
      field("sort_order", "Sort order", "invoice_line_items.sort_order", "Display/order position.", "Operational metadata.")
    ]
  },
  {
    key: "payments",
    label: "Payments summary",
    description: "Canonical payment records without card, bank, gateway, or raw provider payload details.",
    sourceModel: "payments",
    fields: [
      field("payment_id", "Payment ID", "payments.id", "Stable payment id.", "Identifier only.", true),
      field("invoice_id", "Invoice ID", "payments.invoice_id", "Related invoice id.", "Identifier only.", true),
      field("invoice_reference", "Invoice reference", "invoices.reference_number", "Related invoice number.", "Commercial metadata."),
      field("customer_name", "Customer name", "customers.name", "Related customer label.", "May identify a person or business."),
      field("project_name", "Project name", "projects.name", "Related project label.", "May include location context."),
      field("amount", "Amount", "payments.amount", "Stored payment amount.", "Commercial amount."),
      field("payment_date", "Payment date", "payments.payment_date", "Stored payment date.", "Commercial metadata."),
      field("payment_method", "Payment method", "payments.payment_method", "High-level payment method label.", "No card/bank details."),
      field("payment_source", "Payment source", "payments.payment_source", "Payment source classification.", "Commercial metadata."),
      field("recorded_via", "Recorded via", "payments.recorded_via", "Manual or provider-backed recording source.", "Operational metadata."),
      field("reference", "Reference", "payments.reference", "Contractor-entered safe reference.", "May contain customer-entered text; review before sharing externally."),
      field("status", "Status", "payments.status", "Current payment status.", "Commercial metadata."),
      field("created_at", "Created at", "payments.created_at", "Record creation timestamp.", "Operational metadata."),
      field("updated_at", "Updated at", "payments.updated_at", "Record update timestamp.", "Operational metadata.")
    ]
  },
  {
    key: "jobs",
    label: "Jobs summary",
    description: "Canonical job records, scheduling state, and project/customer links.",
    sourceModel: "jobs",
    fields: [
      field("job_id", "Job ID", "jobs.id", "Stable job id.", "Identifier only.", true),
      field("customer_id", "Customer ID", "jobs.customer_id", "Related customer id.", "Identifier only.", true),
      field("customer_name", "Customer name", "customers.name", "Related customer label.", "May identify a person or business."),
      field("project_id", "Project ID", "jobs.project_id", "Related project id.", "Identifier only.", true),
      field("project_name", "Project name", "projects.name", "Related project label.", "May include location context."),
      field("estimate_id", "Estimate ID", "jobs.estimate_id", "Related estimate id when present.", "Identifier only.", true),
      field("dispatch_status", "Dispatch status", "jobs.dispatch_status", "Current job dispatch status.", "Operational metadata."),
      field("scheduled_date", "Scheduled date", "jobs.scheduled_date", "Stored scheduled date.", "Operational metadata."),
      field("scheduled_start_at", "Scheduled start", "jobs.scheduled_start_at", "Stored scheduled start timestamp.", "Operational metadata."),
      field("scheduled_end_at", "Scheduled end", "jobs.scheduled_end_at", "Stored scheduled end timestamp.", "Operational metadata."),
      field("crew_vendor_id", "Crew vendor ID", "jobs.crew_vendor_id", "Assigned crew/vendor id when present.", "Identifier only.", true),
      field("created_at", "Created at", "jobs.created_at", "Record creation timestamp.", "Operational metadata."),
      field("updated_at", "Updated at", "jobs.updated_at", "Record update timestamp.", "Operational metadata.")
    ]
  },
  {
    key: "job_assignments",
    label: "Job assignments",
    description: "Job assignment rows linking jobs to people or vendor crews.",
    sourceModel: "job_assignments",
    fields: [
      field("assignment_id", "Assignment ID", "job_assignments.id", "Stable job assignment id.", "Identifier only.", true),
      field("job_id", "Job ID", "job_assignments.job_id", "Related job id.", "Identifier only.", true),
      field("person_id", "Person ID", "job_assignments.person_id", "Assigned person id when present.", "Identifier only.", true),
      field("person_name", "Person name", "people.display_name", "Assigned workforce person label.", "PII/workforce data."),
      field("vendor_id", "Vendor ID", "job_assignments.vendor_id", "Assigned vendor id when present.", "Identifier only.", true),
      field("vendor_name", "Vendor name", "vendors.name", "Assigned vendor/crew label.", "Business contact data."),
      field("role", "Role", "job_assignments.role", "Assignment role.", "Operational metadata."),
      field("assigned_start_at", "Assigned start", "job_assignments.assigned_start_at", "Assignment start timestamp.", "Operational metadata."),
      field("assigned_end_at", "Assigned end", "job_assignments.assigned_end_at", "Assignment end timestamp.", "Operational metadata."),
      field("created_at", "Created at", "job_assignments.created_at", "Record creation timestamp.", "Operational metadata."),
      field("updated_at", "Updated at", "job_assignments.updated_at", "Record update timestamp.", "Operational metadata.")
    ]
  }
] as const;

export function getExportModuleDefinition(key: string) {
  return exportModuleDefinitions.find((definition) => definition.key === key) ?? null;
}

export function isExportFormat(value: string | null): value is ExportFormat {
  return value === "csv" || value === "json";
}

export function serializeCsv(input: Pick<ExportBuildInput, "module" | "rows">) {
  const header = input.module.fields.map((fieldDefinition) => fieldDefinition.label);
  const keys = input.module.fields.map((fieldDefinition) => fieldDefinition.key);
  const lines = [
    header.map(escapeCsvCell).join(","),
    ...input.rows.map((row) => keys.map((key) => escapeCsvCell(row[key])).join(","))
  ];

  return `${lines.join("\r\n")}\r\n`;
}

export function buildJsonManifest(input: ExportBuildInput) {
  return {
    schemaVersion: input.schemaVersion ?? EXPORT_SCHEMA_VERSION,
    exportedAt: input.exportedAt,
    organization: input.organization,
    module: {
      key: input.module.key,
      label: input.module.label,
      sourceModel: input.module.sourceModel,
      fields: input.module.fields.map((fieldDefinition) => ({
        key: fieldDefinition.key,
        label: fieldDefinition.label,
        source: fieldDefinition.source,
        meaning: fieldDefinition.meaning,
        piiOrSecurityNote: fieldDefinition.piiOrSecurityNote,
        relationshipKey: fieldDefinition.relationshipKey ?? false
      }))
    },
    rowCount: input.rows.length,
    rows: input.rows
  };
}

export function buildExportFilename(input: {
  organizationSlug: string;
  moduleKey: ExportModuleKey;
  format: ExportFormat;
  exportedAt: string;
}) {
  const datePart = input.exportedAt.slice(0, 10);
  const slug = input.organizationSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "floorconnector";

  return `${slug}-${input.moduleKey}-${datePart}.${input.format}`;
}

export function summarizeExportError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "Export failed.";
  const safeMessage = rawMessage
    .replace(/sk_(test|live)_[A-Za-z0-9_]+/g, "[redacted-stripe-key]")
    .replace(/pk_(test|live)_[A-Za-z0-9_]+/g, "[redacted-stripe-key]")
    .replace(/whsec_[A-Za-z0-9_]+/g, "[redacted-webhook-secret]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/token=[^&\s]+/gi, "token=[redacted]")
    .replace(/password=[^&\s]+/gi, "password=[redacted]")
    .replace(/\s+/g, " ")
    .trim();

  return (safeMessage || "Export failed.").slice(0, MAX_ERROR_SUMMARY_LENGTH);
}

export function buildExportRequestContext(input: {
  source?: "settings_export";
  route: string;
}) {
  return {
    source: input.source ?? "settings_export",
    route: input.route
  };
}

function field(
  key: string,
  label: string,
  source: string,
  meaning: string,
  piiOrSecurityNote: string,
  relationshipKey = false
): ExportFieldDefinition {
  return {
    key,
    label,
    source,
    meaning,
    piiOrSecurityNote,
    relationshipKey,
    formats: ["csv", "json"]
  };
}

function escapeCsvCell(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  let normalized: string;

  if (typeof value === "string") {
    normalized = value;
  } else if (typeof value === "number" || typeof value === "boolean") {
    normalized = String(value);
  } else {
    normalized = JSON.stringify(value);
  }

  if (/[",\r\n]/.test(normalized)) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }

  return normalized;
}
