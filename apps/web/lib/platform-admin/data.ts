import "server-only";

import type {
  PlatformCatalogItemSeed,
  PlatformFinancialDefaults,
  PlatformTemplateSeed,
  PlatformWorkflowDefaults
} from "@floorconnector/types";

import { INVENTORY_ENABLED_FEATURE_POLICY } from "@/lib/organizations/module-settings";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type PlatformTemplateSeedRow = {
  id: string;
  template_type: "estimate" | "invoice" | "contract";
  seed_key: string;
  name: string;
  description: string | null;
  subject_template: string | null;
  body_template: string;
  schema_version: number;
  is_default: boolean;
  is_active: boolean;
  merge_field_manifest: unknown;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type PlatformFinancialDefaultsRow = {
  config_key: string;
  default_tax_rate: string | number;
  default_tax_behavior: "exclusive" | "inclusive" | "none";
  default_retainage_percentage: string | number;
  created_at: string;
  updated_at: string;
};

type PlatformWorkflowDefaultsRow = {
  config_key: string;
  approved_estimate_contract_seed_id: string | null;
  require_contract_internal_approval: boolean;
  require_contract_signature_before_job_scheduling: boolean;
  require_deposit_before_job_scheduling: boolean;
  require_financing_approval_before_job_scheduling: boolean;
  default_deposit_percentage: string | number;
  default_estimate_terms_html: string | null;
  default_estimate_inclusions_html: string | null;
  default_estimate_exclusions_html: string | null;
  default_estimate_scope_summary_html: string | null;
  default_estimate_start_number: number;
  default_invoice_start_number: number;
  default_change_order_start_number: number;
  default_contract_start_number: number;
  created_at: string;
  updated_at: string;
};

type PlatformCatalogItemSeedRow = {
  id: string;
  item_type:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  seed_key: string;
  name: string;
  description: string | null;
  internal_notes: string | null;
  unit: string;
  default_unit_cost: string | number;
  default_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  taxable: boolean;
  vendor_id: string | null;
  category: string | null;
  cost_code: string | null;
  sku: string | null;
  photo_storage_path: string | null;
  is_active: boolean;
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FeatureFlagRow = {
  id: string;
  company_id: string | null;
  key: string;
  name: string;
  description: string | null;
  module_key: string | null;
  surface: string | null;
  enabled: boolean;
  updated_at: string;
};

type PlatformAdminAssignmentRow = {
  id: string;
  user_id: string;
  users:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
  roles:
    | {
        id: string;
        key: string;
        name: string;
      }
    | null;
};

type PlatformRoleRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

type PermissionRow = {
  id: string;
  key: string;
  name: string;
  module_key: string;
};

type TenantRow = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  tenant_status: string;
  lifecycle_state: string;
  created_at: string;
  organization_workflow_settings:
    | Array<{
        next_estimate_number: number | null;
        next_invoice_number: number | null;
        next_change_order_number: number | null;
        next_contract_number: number | null;
      }>
    | null;
  company_subscriptions:
    | Array<{
        id: string;
        status: string;
        lifecycle_state: string;
        subscription_plans:
          | {
              id: string;
              key: string;
              name: string;
            }
          | null;
      }>
    | null;
};

type EarlyAccessTenantRow = {
  id: string;
  slug: string;
  legal_name: string;
  display_name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  primary_trade: string | null;
  brand_accent_color: string | null;
  time_zone: string | null;
  tenant_status: string;
  lifecycle_state: string;
  stripe_payment_method_id: string | null;
  created_at: string;
};

type EarlyAccessFeedbackRow = {
  organization_id: string;
  user_id: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type MembershipActivityRow = {
  company_id: string;
  last_active_at: string | null;
  users:
    | {
        last_sign_in_at: string | null;
      }
    | Array<{
        last_sign_in_at: string | null;
      }>
    | null;
};

type TenantActivityCounts = {
  projectCount: number;
  estimateCount: number;
  contractCount: number;
  invoiceCount: number;
};

const tenantResetDeletableTables = [
  { name: "notification_deliveries", label: "notification deliveries" },
  { name: "notifications", label: "notifications" },
  { name: "notification_events", label: "notification events" },
  { name: "communication_messages", label: "communication messages" },
  { name: "communication_threads", label: "communication threads" },
  { name: "invoice_events", label: "invoice events" },
  { name: "payment_events", label: "payment events" },
  { name: "payments", label: "payments" },
  { name: "invoice_line_items", label: "invoice line items" },
  { name: "change_order_commercial_snapshot_items", label: "change order snapshot items" },
  { name: "change_order_commercial_snapshots", label: "change order snapshots" },
  { name: "change_order_events", label: "change order events" },
  { name: "change_orders", label: "change orders" },
  { name: "contract_signature_events", label: "contract signature events" },
  { name: "contract_signers", label: "contract signers" },
  { name: "contract_revisions", label: "contract revisions" },
  { name: "contracts", label: "contracts" },
  { name: "invoices", label: "invoices" },
  { name: "job_assignments", label: "job assignments" },
  { name: "jobs", label: "jobs" },
  { name: "schedule_of_value_items", label: "schedule of value items" },
  { name: "schedule_of_values", label: "schedules of value" },
  { name: "estimate_customer_events", label: "estimate customer events" },
  { name: "estimate_attachments", label: "estimate attachments" },
  { name: "estimate_content_blocks", label: "estimate content blocks" },
  { name: "estimate_commercial_snapshot_items", label: "estimate snapshot items" },
  { name: "estimate_commercial_snapshots", label: "estimate snapshots" },
  { name: "estimate_line_items", label: "estimate line items" },
  { name: "estimates", label: "estimates" },
  { name: "portal_record_views", label: "portal record views" },
  { name: "portal_project_access", label: "portal project access" },
  { name: "daily_logs", label: "daily logs" },
  { name: "field_notes", label: "field notes" },
  { name: "execution_attachments", label: "execution attachments" },
  { name: "punchlist_items", label: "punchlist items" },
  { name: "projects", label: "projects" }
] as const;

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function aggregateCompanyCounts(rows: unknown) {
  const counts = new Map<string, number>();

  if (!Array.isArray(rows)) {
    return counts;
  }

  for (const row of rows) {
    const companyId =
      row && typeof row === "object" && typeof (row as { company_id?: unknown }).company_id === "string"
        ? (row as { company_id: string }).company_id
        : null;

    if (companyId) {
      counts.set(companyId, (counts.get(companyId) ?? 0) + 1);
    }
  }

  return counts;
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getLatestIso(left: string | null, right: string | null) {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return right > left ? right : left;
}

function aggregateCompanyRecentActivity(rows: unknown) {
  const activity = new Map<
    string,
    {
      lastActivityAt: string | null;
      hasLoggedInRecently: boolean;
    }
  >();
  const recentCutoffIso = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  if (!Array.isArray(rows)) {
    return activity;
  }

  for (const row of rows as MembershipActivityRow[]) {
    if (!row?.company_id) {
      continue;
    }

    const user = firstRelation(row.users);
    const lastActivityAt = getLatestIso(
      row.last_active_at,
      user?.last_sign_in_at ?? null
    );
    const current = activity.get(row.company_id) ?? {
      lastActivityAt: null,
      hasLoggedInRecently: false
    };
    const latestActivityAt = getLatestIso(current.lastActivityAt, lastActivityAt);

    activity.set(row.company_id, {
      lastActivityAt: latestActivityAt,
      hasLoggedInRecently:
        current.hasLoggedInRecently ||
        Boolean(latestActivityAt && latestActivityAt >= recentCutoffIso)
    });
  }

  return activity;
}

function getFeedbackEmail(metadata: Record<string, unknown> | null) {
  const email = metadata?.email;
  return typeof email === "string" && email.trim().length > 0 ? email : null;
}

function aggregateEarlyAccessFeedback(rows: unknown) {
  const feedback = new Map<
    string,
    {
      feedbackCount: number;
      recentFeedback: Array<{
        message: string;
        email: string | null;
        createdAt: string;
      }>;
    }
  >();

  if (!Array.isArray(rows)) {
    return feedback;
  }

  for (const row of rows as EarlyAccessFeedbackRow[]) {
    if (!row?.organization_id) {
      continue;
    }

    const current = feedback.get(row.organization_id) ?? {
      feedbackCount: 0,
      recentFeedback: []
    };

    current.feedbackCount += 1;

    if (current.recentFeedback.length < 3) {
      current.recentFeedback.push({
        message: row.message,
        email: getFeedbackEmail(row.metadata),
        createdAt: row.created_at
      });
    }

    feedback.set(row.organization_id, current);
  }

  return feedback;
}

function getExactCount(count: number | null) {
  return typeof count === "number" ? count : 0;
}

function hasCompletedCompanyProfile(row: EarlyAccessTenantRow) {
  return [
    row.logo_url,
    row.phone,
    row.email,
    row.website_url,
    row.primary_trade,
    row.brand_accent_color,
    row.time_zone
  ].some((value) => Boolean(value?.trim()));
}

async function getCompanyRecordCount(tableName: string, companyId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (response.error) {
    throw new Error(`Unable to inspect ${tableName} for reset.`);
  }

  return getExactCount(response.count);
}

async function deleteCompanyRecords(tableName: string, label: string, companyId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase.from(tableName).delete().eq("company_id", companyId);

  if (response.error) {
    throw new Error(`Reset could not clear ${label} for this company.`);
  }
}

function mapPlatformTemplateSeed(row: PlatformTemplateSeedRow): PlatformTemplateSeed {
  return {
    id: row.id,
    templateType: row.template_type,
    seedKey: row.seed_key,
    name: row.name,
    description: row.description,
    subjectTemplate: row.subject_template,
    bodyTemplate: row.body_template,
    schemaVersion: row.schema_version,
    isDefault: row.is_default,
    isActive: row.is_active,
    mergeFieldManifest: normalizeStringArray(row.merge_field_manifest),
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPlatformCatalogItemSeed(
  row: PlatformCatalogItemSeedRow
): PlatformCatalogItemSeed {
  return {
    id: row.id,
    itemType: row.item_type,
    seedKey: row.seed_key,
    name: row.name,
    description: row.description,
    internalNotes: row.internal_notes,
    unit: row.unit,
    defaultUnitCost: Number(row.default_unit_cost).toFixed(2),
    defaultUnitPrice:
      row.default_unit_price == null ? null : Number(row.default_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    taxable: row.taxable,
    vendorId: row.vendor_id,
    category: row.category,
    costCode: row.cost_code,
    sku: row.sku,
    photoStoragePath: row.photo_storage_path,
    isActive: row.is_active,
    isDefault: row.is_default,
    metadata: row.metadata ?? {},
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listPlatformTemplateSeedsAdmin() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_template_seeds")
    .select("*")
    .order("template_type", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load platform template seeds: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data) ? (response.data as PlatformTemplateSeedRow[]) : [];
  return rows.map(mapPlatformTemplateSeed);
}

export async function updatePlatformTemplateSeed(input: {
  seedId: string;
  name: string;
  description: string | null;
  subjectTemplate: string | null;
  bodyTemplate: string;
  isDefault: boolean;
  isActive: boolean;
}) {
  const supabase = getSupabaseAdminClient();
  const currentResponse = await supabase
    .from("platform_template_seeds")
    .select("*")
    .eq("id", input.seedId)
    .maybeSingle();

  if (currentResponse.error || !currentResponse.data) {
    throw new Error(
      `Unable to load platform template seed: ${currentResponse.error?.message ?? "Not found."}`
    );
  }

  const current = currentResponse.data as PlatformTemplateSeedRow;

  if (input.isDefault) {
    const clearResponse = await supabase
      .from("platform_template_seeds")
      .update({ is_default: false })
      .eq("template_type", current.template_type)
      .eq("is_default", true)
      .neq("id", input.seedId);

    if (clearResponse.error) {
      throw new Error(
        `Unable to clear platform template defaults: ${clearResponse.error.message}`
      );
    }
  }

  const response = await supabase
    .from("platform_template_seeds")
    .update({
      name: input.name,
      description: input.description,
      subject_template: input.subjectTemplate,
      body_template: input.bodyTemplate,
      is_default: input.isDefault,
      is_active: input.isActive
    })
    .eq("id", input.seedId)
    .select("*")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to update platform template seed: ${response.error.message}`
    );
  }

  return mapPlatformTemplateSeed(response.data as PlatformTemplateSeedRow);
}

export async function getPlatformFinancialDefaults(): Promise<PlatformFinancialDefaults> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_financial_defaults")
    .select("*")
    .eq("config_key", "default")
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load platform financial defaults: ${response.error.message}`
    );
  }

  const row = response.data as PlatformFinancialDefaultsRow | null;

  if (!row) {
    return {
      defaultTaxRate: "0.000000",
      defaultTaxBehavior: "exclusive",
      defaultRetainagePercentage: "0.00",
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    };
  }

  return {
    defaultTaxRate: Number(row.default_tax_rate).toFixed(6),
    defaultTaxBehavior: row.default_tax_behavior,
    defaultRetainagePercentage: Number(row.default_retainage_percentage).toFixed(2),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function upsertPlatformFinancialDefaults(input: {
  userId: string;
  defaultTaxRate: string;
  defaultTaxBehavior: "exclusive" | "inclusive" | "none";
  defaultRetainagePercentage: string;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_financial_defaults")
    .upsert(
      {
        config_key: "default",
        default_tax_rate: input.defaultTaxRate,
        default_tax_behavior: input.defaultTaxBehavior,
        default_retainage_percentage: input.defaultRetainagePercentage,
        created_by: input.userId,
        updated_by: input.userId
      },
      { onConflict: "config_key" }
    )
    .select("*")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to save platform financial defaults: ${response.error.message}`
    );
  }

  return getPlatformFinancialDefaults();
}

export async function getPlatformWorkflowDefaults(): Promise<PlatformWorkflowDefaults> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_workflow_defaults")
    .select("*")
    .eq("config_key", "default")
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load platform workflow defaults: ${response.error.message}`
    );
  }

  const row = response.data as PlatformWorkflowDefaultsRow | null;

  if (!row) {
    return {
      approvedEstimateContractSeedId: null,
      requireContractInternalApproval: false,
      requireContractSignatureBeforeJobScheduling: true,
      requireDepositBeforeJobScheduling: false,
      requireFinancingApprovalBeforeJobScheduling: false,
      defaultDepositPercentage: "0.00",
      defaultEstimateTermsHtml: null,
      defaultEstimateInclusionsHtml: null,
      defaultEstimateExclusionsHtml: null,
      defaultEstimateScopeSummaryHtml: null,
      defaultEstimateStartNumber: 3350,
      defaultInvoiceStartNumber: 3350,
      defaultChangeOrderStartNumber: 3350,
      defaultContractStartNumber: 3350,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    };
  }

  return {
    approvedEstimateContractSeedId: row.approved_estimate_contract_seed_id,
    requireContractInternalApproval: row.require_contract_internal_approval,
    requireContractSignatureBeforeJobScheduling:
      row.require_contract_signature_before_job_scheduling,
    requireDepositBeforeJobScheduling:
      row.require_deposit_before_job_scheduling,
    requireFinancingApprovalBeforeJobScheduling:
      row.require_financing_approval_before_job_scheduling,
    defaultDepositPercentage: Number(row.default_deposit_percentage).toFixed(2),
    defaultEstimateTermsHtml: row.default_estimate_terms_html,
    defaultEstimateInclusionsHtml: row.default_estimate_inclusions_html,
    defaultEstimateExclusionsHtml: row.default_estimate_exclusions_html,
    defaultEstimateScopeSummaryHtml: row.default_estimate_scope_summary_html,
    defaultEstimateStartNumber: row.default_estimate_start_number,
    defaultInvoiceStartNumber: row.default_invoice_start_number,
    defaultChangeOrderStartNumber: row.default_change_order_start_number,
    defaultContractStartNumber: row.default_contract_start_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function upsertPlatformWorkflowDefaults(input: {
  userId: string;
  approvedEstimateContractSeedId: string | null;
  requireContractInternalApproval: boolean;
  requireContractSignatureBeforeJobScheduling: boolean;
  requireDepositBeforeJobScheduling: boolean;
  requireFinancingApprovalBeforeJobScheduling: boolean;
  defaultDepositPercentage: string;
  defaultEstimateTermsHtml: string | null;
  defaultEstimateInclusionsHtml: string | null;
  defaultEstimateExclusionsHtml: string | null;
  defaultEstimateScopeSummaryHtml: string | null;
  defaultEstimateStartNumber: number;
  defaultInvoiceStartNumber: number;
  defaultChangeOrderStartNumber: number;
  defaultContractStartNumber: number;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_workflow_defaults")
    .upsert(
      {
        config_key: "default",
        approved_estimate_contract_seed_id: input.approvedEstimateContractSeedId,
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
        default_estimate_start_number: input.defaultEstimateStartNumber,
        default_invoice_start_number: input.defaultInvoiceStartNumber,
        default_change_order_start_number: input.defaultChangeOrderStartNumber,
        default_contract_start_number: input.defaultContractStartNumber,
        created_by: input.userId,
        updated_by: input.userId
      },
      { onConflict: "config_key" }
    )
    .select("*")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to save platform workflow defaults: ${response.error.message}`
    );
  }

  return getPlatformWorkflowDefaults();
}

export async function listPlatformCatalogItemSeeds() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_catalog_item_seeds")
    .select("*")
    .order("item_type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load platform catalog item seeds: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as PlatformCatalogItemSeedRow[])
    : [];
  return rows.map(mapPlatformCatalogItemSeed);
}

export async function upsertPlatformCatalogItemSeed(input: {
  seedId?: string | null;
  itemType:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  seedKey: string;
  name: string;
  description: string | null;
  internalNotes: string | null;
  unit: string;
  defaultUnitCost: string;
  defaultUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  taxable: boolean;
  vendorId: string | null;
  category: string | null;
  costCode: string | null;
  sku: string | null;
  photoStoragePath: string | null;
  isActive: boolean;
  isDefault: boolean;
}) {
  const supabase = getSupabaseAdminClient();

  if (input.isDefault) {
    const clearResponse = await supabase
      .from("platform_catalog_item_seeds")
      .update({ is_default: false })
      .eq("item_type", input.itemType)
      .eq("is_default", true);

    if (clearResponse.error) {
      throw new Error(
        `Unable to clear platform catalog defaults: ${clearResponse.error.message}`
      );
    }
  }

  const payload = {
    item_type: input.itemType,
    seed_key: input.seedKey,
    name: input.name,
    description: input.description,
    internal_notes: input.internalNotes,
    unit: input.unit,
    default_unit_cost: input.defaultUnitCost,
    default_unit_price: input.defaultUnitPrice,
    markup_percent: input.markupPercent,
    hidden_markup_percent: input.hiddenMarkupPercent,
    taxable: input.taxable,
    vendor_id: input.vendorId,
    category: input.category,
    cost_code: input.costCode,
    sku: input.sku,
    photo_storage_path: input.photoStoragePath,
    is_active: input.isActive,
    is_default: input.isDefault
  };

  const response = input.seedId
    ? await supabase
        .from("platform_catalog_item_seeds")
        .update(payload)
        .eq("id", input.seedId)
        .select("*")
        .single()
    : await supabase
        .from("platform_catalog_item_seeds")
        .insert(payload)
        .select("*")
        .single();

  if (response.error) {
    throw new Error(
      `Unable to save platform catalog seed: ${response.error.message}`
    );
  }

  return mapPlatformCatalogItemSeed(response.data as PlatformCatalogItemSeedRow);
}

export async function listPlatformFeaturePolicies() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("feature_flags")
    .select("*")
    .is("company_id", null)
    .order("surface", { ascending: true })
    .order("key", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load platform feature policies: ${response.error.message}`
    );
  }

  const policies = (Array.isArray(response.data) ? response.data : []) as FeatureFlagRow[];

  if (!policies.some((policy) => policy.key === INVENTORY_ENABLED_FEATURE_POLICY.key)) {
    policies.push({
      id: INVENTORY_ENABLED_FEATURE_POLICY.key,
      company_id: null,
      key: INVENTORY_ENABLED_FEATURE_POLICY.key,
      name: INVENTORY_ENABLED_FEATURE_POLICY.name,
      description: INVENTORY_ENABLED_FEATURE_POLICY.description,
      module_key: INVENTORY_ENABLED_FEATURE_POLICY.moduleKey,
      surface: INVENTORY_ENABLED_FEATURE_POLICY.surface,
      enabled: false,
      updated_at: new Date(0).toISOString()
    });
  }

  return policies;
}

export async function upsertPlatformFeaturePolicy(input: {
  key: string;
  name: string;
  description: string | null;
  moduleKey: string | null;
  surface: string | null;
  enabled: boolean;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const existingResponse = await supabase
    .from("feature_flags")
    .select("id")
    .is("company_id", null)
    .eq("key", input.key)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to load platform feature policy: ${existingResponse.error.message}`
    );
  }

  const payload = {
    key: input.key,
    name: input.name,
    description: input.description,
    module_key: input.moduleKey,
    surface: input.surface,
    enabled: input.enabled,
    updated_by: input.userId
  };

  const response = existingResponse.data
    ? await supabase
        .from("feature_flags")
        .update(payload)
        .eq("id", existingResponse.data.id)
    : await supabase.from("feature_flags").insert({
        company_id: null,
        ...payload,
        created_by: input.userId
      });

  if (response.error) {
    throw new Error(
      `Unable to save platform feature policy: ${response.error.message}`
    );
  }

  return listPlatformFeaturePolicies();
}

export async function listPlatformAdmins() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_user_roles")
    .select(
      `
        id,
        user_id,
        users (
          id,
          email,
          full_name
        ),
        roles (
          id,
          key,
          name
        )
      `
    )
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load platform admins: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []).map((row) => {
    const record = row as {
      id: string;
      user_id: string;
      users:
        | Array<{
            id: string;
            email: string;
            full_name: string | null;
          }>
        | null;
      roles:
        | Array<{
            id: string;
            key: string;
            name: string;
          }>
        | null;
    };

    return {
      id: record.id,
      user_id: record.user_id,
      users: Array.isArray(record.users) ? (record.users[0] ?? null) : null,
      roles: Array.isArray(record.roles) ? (record.roles[0] ?? null) : null
    } satisfies PlatformAdminAssignmentRow;
  });
}

export async function assignPlatformAdminByEmail(input: {
  email: string;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const userResponse = await supabase
    .from("users")
    .select("id, email")
    .ilike("email", input.email)
    .maybeSingle();

  if (userResponse.error || !userResponse.data) {
    throw new Error(
      `Unable to find a canonical user for ${input.email}. They need to sign in first.`
    );
  }

  const roleResponse = await supabase
    .from("roles")
    .select("id")
    .is("company_id", null)
    .eq("scope", "platform")
    .eq("key", "platform_admin")
    .maybeSingle();

  const roleData = roleResponse.data as { id?: string } | null;

  if (roleResponse.error || !roleData?.id) {
    throw new Error(
      `Unable to resolve the platform admin role: ${roleResponse.error?.message ?? "Missing role."}`
    );
  }

  const insertResponse = await supabase.from("platform_user_roles").upsert(
    {
      user_id: userResponse.data.id,
      role_id: roleData.id,
      created_by: input.userId,
      updated_by: input.userId
    },
    {
      onConflict: "user_id,role_id"
    }
  );

  if (insertResponse.error) {
    throw new Error(
      `Unable to assign platform admin access: ${insertResponse.error.message}`
    );
  }

  return listPlatformAdmins();
}

export async function listPlatformRolesAndPermissions() {
  const supabase = getSupabaseAdminClient();
  const [rolesResponse, permissionsResponse] = await Promise.all([
    supabase
      .from("roles")
      .select("id, key, name, description")
      .is("company_id", null)
      .eq("scope", "platform")
      .order("name", { ascending: true }),
    supabase
      .from("permissions")
      .select("id, key, name, module_key")
      .order("module_key", { ascending: true })
      .order("key", { ascending: true })
  ]);

  if (rolesResponse.error) {
    throw new Error(`Unable to load platform roles: ${rolesResponse.error.message}`);
  }

  if (permissionsResponse.error) {
    throw new Error(
      `Unable to load platform permissions: ${permissionsResponse.error.message}`
    );
  }

  return {
    roles: (Array.isArray(rolesResponse.data) ? rolesResponse.data : []) as PlatformRoleRow[],
    permissions: (Array.isArray(permissionsResponse.data)
      ? permissionsResponse.data
      : []) as PermissionRow[]
  };
}

export async function listTenantsForPlatformAdmin() {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .select(
      `
        id,
        slug,
        legal_name,
        display_name,
        tenant_status,
        lifecycle_state,
        created_at,
        organization_workflow_settings (
          next_estimate_number,
          next_invoice_number,
          next_change_order_number,
          next_contract_number
        ),
        company_subscriptions (
          id,
          status,
          lifecycle_state,
          subscription_plans (
            id,
            key,
            name
          )
        )
      `
    )
    .order("created_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load platform tenants: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []).map((row) => {
    const record = row as {
      id: string;
      slug: string;
      legal_name: string;
      display_name: string;
      tenant_status: string;
      lifecycle_state: string;
      created_at: string;
      organization_workflow_settings:
        | Array<{
            next_estimate_number: number | null;
            next_invoice_number: number | null;
            next_change_order_number: number | null;
            next_contract_number: number | null;
          }>
        | null;
      company_subscriptions:
        | Array<{
            id: string;
            status: string;
            lifecycle_state: string;
            subscription_plans:
              | Array<{
                  id: string;
                  key: string;
                  name: string;
                }>
              | null;
          }>
        | null;
    };

    return {
      id: record.id,
      slug: record.slug,
      legal_name: record.legal_name,
      display_name: record.display_name,
      tenant_status: record.tenant_status,
      lifecycle_state: record.lifecycle_state,
      created_at: record.created_at,
      organization_workflow_settings: Array.isArray(record.organization_workflow_settings)
        ? record.organization_workflow_settings
        : null,
      company_subscriptions: Array.isArray(record.company_subscriptions)
        ? record.company_subscriptions.map((subscription) => ({
            id: subscription.id,
            status: subscription.status,
            lifecycle_state: subscription.lifecycle_state,
            subscription_plans: Array.isArray(subscription.subscription_plans)
              ? (subscription.subscription_plans[0] ?? null)
              : null
          }))
        : null
    } satisfies TenantRow;
  });
}

export async function listEarlyAccessTenantsForPlatformAdmin() {
  const supabase = getSupabaseAdminClient();
  const [
    tenantsResponse,
    projectsResponse,
    estimatesResponse,
    contractsResponse,
    invoicesResponse,
    membershipsResponse,
    feedbackResponse
  ] = await Promise.all([
      supabase
        .from("companies")
        .select(
          "id, slug, legal_name, display_name, logo_url, phone, email, website_url, primary_trade, brand_accent_color, time_zone, tenant_status, lifecycle_state, stripe_payment_method_id, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("company_id"),
      supabase.from("estimates").select("company_id"),
      supabase.from("contracts").select("company_id"),
      supabase.from("invoices").select("company_id"),
      supabase
        .from("company_memberships")
        .select(
          `
            company_id,
            last_active_at,
            users!company_memberships_user_id_fkey (
              last_sign_in_at
            )
          `
        )
        .eq("membership_status", "active"),
      supabase
        .from("workflow_error_events")
        .select("organization_id, user_id, message, metadata, created_at")
        .eq("action", "early_access.feedback")
        .order("created_at", { ascending: false })
    ]);

  if (tenantsResponse.error) {
    throw new Error(
      `Unable to load early-access tenants: ${tenantsResponse.error.message}`
    );
  }

  if (projectsResponse.error) {
    throw new Error(
      `Unable to load early-access project counts: ${projectsResponse.error.message}`
    );
  }

  if (estimatesResponse.error) {
    throw new Error(
      `Unable to load early-access estimate counts: ${estimatesResponse.error.message}`
    );
  }

  if (contractsResponse.error) {
    throw new Error(
      `Unable to load early-access contract counts: ${contractsResponse.error.message}`
    );
  }

  if (invoicesResponse.error) {
    throw new Error(
      `Unable to load early-access invoice counts: ${invoicesResponse.error.message}`
    );
  }

  if (membershipsResponse.error) {
    throw new Error(
      `Unable to load early-access login signals: ${membershipsResponse.error.message}`
    );
  }

  if (feedbackResponse.error) {
    throw new Error(
      `Unable to load early-access feedback signals: ${feedbackResponse.error.message}`
    );
  }

  const projectCounts = aggregateCompanyCounts(projectsResponse.data);
  const estimateCounts = aggregateCompanyCounts(estimatesResponse.data);
  const contractCounts = aggregateCompanyCounts(contractsResponse.data);
  const invoiceCounts = aggregateCompanyCounts(invoicesResponse.data);
  const recentActivity = aggregateCompanyRecentActivity(membershipsResponse.data);
  const feedbackByCompany = aggregateEarlyAccessFeedback(feedbackResponse.data);

  return ((Array.isArray(tenantsResponse.data) ? tenantsResponse.data : []) as EarlyAccessTenantRow[]).map(
    (tenant) => {
      const activitySignals = recentActivity.get(tenant.id) ?? {
        hasLoggedInRecently: false,
        lastActivityAt: null
      };
      const feedback = feedbackByCompany.get(tenant.id) ?? {
        feedbackCount: 0,
        recentFeedback: []
      };
      const activity: TenantActivityCounts = {
        projectCount: projectCounts.get(tenant.id) ?? 0,
        estimateCount: estimateCounts.get(tenant.id) ?? 0,
        contractCount: contractCounts.get(tenant.id) ?? 0,
        invoiceCount: invoiceCounts.get(tenant.id) ?? 0
      };

      return {
        id: tenant.id,
        slug: tenant.slug,
        legalName: tenant.legal_name,
        displayName: tenant.display_name,
        tenantStatus: tenant.tenant_status,
        lifecycleState: tenant.lifecycle_state,
        createdAt: tenant.created_at,
        hasCompanyProfile: hasCompletedCompanyProfile(tenant),
        hasPaymentMethod: Boolean(tenant.stripe_payment_method_id),
        guardedExternalActionsLocked:
          tenant.tenant_status !== "active" || tenant.lifecycle_state !== "active",
        activity,
        hasFeedback: feedback.feedbackCount > 0,
        feedbackCount: feedback.feedbackCount,
        recentFeedback: feedback.recentFeedback,
        hasLoggedInRecently: activitySignals.hasLoggedInRecently,
        lastActivityAt: activitySignals.lastActivityAt,
        hasReachedEstimate: activity.estimateCount > 0,
        hasReachedContract: activity.contractCount > 0,
        reachedFirstWorkflowStep: activity.projectCount > 0,
        reachedEstimateStage: activity.projectCount > 0 && activity.estimateCount > 0,
        reachedContractStage:
          activity.projectCount > 0 &&
          activity.estimateCount > 0 &&
          activity.contractCount > 0
      };
    }
  );
}

export async function updateTenantPlatformStatus(input: {
  companyId: string;
  tenantStatus: string;
  lifecycleState: string;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .update({
      tenant_status: input.tenantStatus,
      lifecycle_state: input.lifecycleState
    })
    .eq("id", input.companyId);

  if (response.error) {
    throw new Error(`Unable to update tenant status: ${response.error.message}`);
  }
}

export const updateCompanyTenantStatus = updateTenantPlatformStatus;

export async function resetEarlyAccessTenantOnboardingState(input: {
  companyId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const [tenantResponse, projectCount, estimateCount, contractCount, invoiceCount] =
    await Promise.all([
      supabase
        .from("companies")
        .select("id, display_name")
        .eq("id", input.companyId)
        .maybeSingle(),
      getCompanyRecordCount("projects", input.companyId),
      getCompanyRecordCount("estimates", input.companyId),
      getCompanyRecordCount("contracts", input.companyId),
      getCompanyRecordCount("invoices", input.companyId)
    ]);

  if (tenantResponse.error) {
    throw new Error("Unable to load the selected company for reset.");
  }

  if (!tenantResponse.data) {
    throw new Error("Select a valid early-access company before resetting onboarding.");
  }

  const [estimateSystemSnapshotCount, contractSystemSnapshotCount] = await Promise.all([
    getCompanyRecordCount("estimate_system_snapshots", input.companyId),
    getCompanyRecordCount("contract_system_snapshots", input.companyId)
  ]);

  if (estimateSystemSnapshotCount > 0 || contractSystemSnapshotCount > 0) {
    throw new Error(
      "Reset is blocked because this company has binding system snapshots. Use a clean QA tenant or create a targeted migration-backed repair plan before deleting those records."
    );
  }

  for (const table of tenantResetDeletableTables) {
    await deleteCompanyRecords(table.name, table.label, input.companyId);
  }

  const companyResponse = await supabase
    .from("companies")
    .update({
      tenant_status: "trialing",
      lifecycle_state: "trial",
      stripe_payment_method_id: null
    })
    .eq("id", input.companyId);

  if (companyResponse.error) {
    throw new Error("Reset cleared workflow records but could not reset company setup.");
  }

  return {
    companyId: input.companyId,
    projectCount,
    estimateCount,
    contractCount,
    invoiceCount
  };
}

export async function upsertTenantWorkflowNumberingByPlatformAdmin(input: {
  companyId: string;
  userId: string;
  nextEstimateNumber: number;
  nextInvoiceNumber: number;
  nextChangeOrderNumber: number;
  nextContractNumber: number;
}) {
  const supabase = getSupabaseAdminClient();
  const [
    platformDefaults,
    estimateCountResponse,
    invoiceCountResponse,
    changeOrderCountResponse,
    contractCountResponse,
    currentSettingsResponse
  ] =
    await Promise.all([
      getPlatformWorkflowDefaults(),
      supabase
        .from("estimates")
        .select("id", { count: "exact", head: true })
        .eq("company_id", input.companyId),
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("company_id", input.companyId),
      supabase
        .from("change_orders")
        .select("id", { count: "exact", head: true })
        .eq("company_id", input.companyId),
      supabase
        .from("contracts")
        .select("id", { count: "exact", head: true })
        .eq("company_id", input.companyId),
      supabase
        .from("organization_workflow_settings")
        .select(
          "next_estimate_number, next_invoice_number, next_change_order_number, next_contract_number"
        )
        .eq("company_id", input.companyId)
        .maybeSingle()
    ]);

  if (estimateCountResponse.error) {
    throw new Error(
      `Unable to inspect tenant estimate numbering state: ${estimateCountResponse.error.message}`
    );
  }

  if (invoiceCountResponse.error) {
    throw new Error(
      `Unable to inspect tenant invoice numbering state: ${invoiceCountResponse.error.message}`
    );
  }

  if (changeOrderCountResponse.error) {
    throw new Error(
      `Unable to inspect tenant change order numbering state: ${changeOrderCountResponse.error.message}`
    );
  }

  if (contractCountResponse.error) {
    throw new Error(
      `Unable to inspect tenant contract numbering state: ${contractCountResponse.error.message}`
    );
  }

  const currentSettings = currentSettingsResponse.data as
    | {
        next_estimate_number?: number | null;
        next_invoice_number?: number | null;
        next_change_order_number?: number | null;
        next_contract_number?: number | null;
      }
    | null;

  const currentEstimateNumber =
    currentSettings?.next_estimate_number ?? platformDefaults.defaultEstimateStartNumber;
  const currentInvoiceNumber =
    currentSettings?.next_invoice_number ?? platformDefaults.defaultInvoiceStartNumber;
  const currentChangeOrderNumber =
    currentSettings?.next_change_order_number ??
    platformDefaults.defaultChangeOrderStartNumber;
  const currentContractNumber =
    currentSettings?.next_contract_number ??
    platformDefaults.defaultContractStartNumber;

  if (
    (estimateCountResponse.count ?? 0) > 0 &&
    input.nextEstimateNumber < currentEstimateNumber
  ) {
    throw new Error(
      "Estimate numbering can only move upward after the contractor already has estimate records."
    );
  }

  if (
    (invoiceCountResponse.count ?? 0) > 0 &&
    input.nextInvoiceNumber < currentInvoiceNumber
  ) {
    throw new Error(
      "Invoice numbering can only move upward after the contractor already has invoice records."
    );
  }

  if (
    (changeOrderCountResponse.count ?? 0) > 0 &&
    input.nextChangeOrderNumber < currentChangeOrderNumber
  ) {
    throw new Error(
      "Change order numbering can only move upward after the contractor already has change order records."
    );
  }

  if (
    (contractCountResponse.count ?? 0) > 0 &&
    input.nextContractNumber < currentContractNumber
  ) {
    throw new Error(
      "Contract numbering can only move upward after the contractor already has contract records."
    );
  }

  const response = await supabase
    .from("organization_workflow_settings")
    .upsert(
      {
        company_id: input.companyId,
        next_estimate_number: input.nextEstimateNumber,
        next_invoice_number: input.nextInvoiceNumber,
        next_change_order_number: input.nextChangeOrderNumber,
        next_contract_number: input.nextContractNumber,
        created_by: input.userId,
        updated_by: input.userId
      },
      { onConflict: "company_id" }
    )
    .select("company_id")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to save tenant workflow numbering: ${response.error.message}`
    );
  }
}
