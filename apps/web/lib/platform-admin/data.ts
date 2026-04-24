import "server-only";

import type {
  PlatformCatalogItemSeed,
  PlatformFinancialDefaults,
  PlatformTemplateSeed,
  PlatformWorkflowDefaults
} from "@floorconnector/types";

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

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
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

  return (Array.isArray(response.data) ? response.data : []) as FeatureFlagRow[];
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
