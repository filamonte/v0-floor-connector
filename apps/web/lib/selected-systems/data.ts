import "server-only";

import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import type {
  SelectedSystemAreaType,
  SelectedSystemSource,
  SelectedSystemSpecCompletenessStatus,
  SelectedSystemStatus
} from "./constants";
import type { SelectedSystemInput } from "./schemas";

type SelectedSystemScope = {
  userId: string;
  organizationId: string;
};

type SelectedSystemRow = {
  id: string;
  company_id: string;
  floor_system_template_id: string | null;
  finish_product_id: string | null;
  opportunity_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  estimate_id: string | null;
  contract_id: string | null;
  job_id: string | null;
  source: SelectedSystemSource;
  status: SelectedSystemStatus;
  is_primary: boolean;
  area_label: string | null;
  area_type: SelectedSystemAreaType;
  phase_label: string | null;
  option_label: string | null;
  sort_order: number;
  estimated_area_sqft: string | number | null;
  estimated_linear_ft: string | number | null;
  quantity_notes: string | null;
  customer_facing_description: string | null;
  internal_notes: string | null;
  spec_completeness_status: SelectedSystemSpecCompletenessStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  floor_system_template:
    | Array<{ id: string; name: string; status: string }>
    | { id: string; name: string; status: string }
    | null;
  finish_product:
    | Array<{
        id: string;
        manufacturer_name: string;
        product_name: string;
        status: string;
      }>
    | {
        id: string;
        manufacturer_name: string;
        product_name: string;
        status: string;
      }
    | null;
  project:
    | Array<{ id: string; name: string; status: string }>
    | { id: string; name: string; status: string }
    | null;
  customer:
    | Array<{ id: string; name: string; company_name: string | null }>
    | { id: string; name: string; company_name: string | null }
    | null;
  opportunity:
    | Array<{ id: string; title: string; status: string }>
    | { id: string; title: string; status: string }
    | null;
  estimate:
    | Array<{ id: string; reference_number: string; status: string }>
    | { id: string; reference_number: string; status: string }
    | null;
  contract:
    | Array<{ id: string; title: string; status: string }>
    | { id: string; title: string; status: string }
    | null;
  job:
    | Array<{ id: string; dispatch_status: string; scheduled_date: string | null }>
    | { id: string; dispatch_status: string; scheduled_date: string | null }
    | null;
};

type LookupRow = {
  id: string;
  label: string;
  status: string | null;
  meta?: string | null;
};

export type SelectedSystemLookup = LookupRow;

export type SelectedSystem = {
  id: string;
  organizationId: string;
  floorSystemTemplateId: string | null;
  finishProductId: string | null;
  opportunityId: string | null;
  customerId: string | null;
  projectId: string | null;
  estimateId: string | null;
  contractId: string | null;
  jobId: string | null;
  source: SelectedSystemSource;
  status: SelectedSystemStatus;
  isPrimary: boolean;
  areaLabel: string | null;
  areaType: SelectedSystemAreaType;
  phaseLabel: string | null;
  optionLabel: string | null;
  sortOrder: number;
  estimatedAreaSqft: string | null;
  estimatedLinearFt: string | null;
  quantityNotes: string | null;
  customerFacingDescription: string | null;
  internalNotes: string | null;
  specCompletenessStatus: SelectedSystemSpecCompletenessStatus;
  createdAt: string;
  updatedAt: string;
  template: { id: string; name: string; status: string } | null;
  finishProduct: {
    id: string;
    manufacturerName: string;
    productName: string;
    status: string;
  } | null;
  project: { id: string; name: string; status: string } | null;
  customer: { id: string; name: string; companyName: string | null } | null;
  opportunity: { id: string; title: string; status: string } | null;
  estimate: { id: string; referenceNumber: string; status: string } | null;
  contract: { id: string; title: string; status: string } | null;
  job: { id: string; status: string; scheduledDate: string | null } | null;
};

export type SelectedSystemsAdminData = {
  selectedSystems: SelectedSystem[];
  templates: SelectedSystemLookup[];
  finishProducts: SelectedSystemLookup[];
  opportunities: SelectedSystemLookup[];
  customers: SelectedSystemLookup[];
  projects: SelectedSystemLookup[];
  estimates: SelectedSystemLookup[];
  contracts: SelectedSystemLookup[];
  jobs: SelectedSystemLookup[];
};

async function requireSelectedSystemScope(
  next = "/settings/selected-systems"
): Promise<SelectedSystemScope> {
  const scope = await requireOrganizationAdminScope(next);

  return {
    userId: scope.userId,
    organizationId: scope.organizationId
  };
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function formatNumeric(value: string | number | null) {
  return value == null ? null : Number(value).toFixed(2);
}

function mapSelectedSystem(row: SelectedSystemRow): SelectedSystem {
  const template = unwrapOne(row.floor_system_template);
  const finishProduct = unwrapOne(row.finish_product);
  const project = unwrapOne(row.project);
  const customer = unwrapOne(row.customer);
  const opportunity = unwrapOne(row.opportunity);
  const estimate = unwrapOne(row.estimate);
  const contract = unwrapOne(row.contract);
  const job = unwrapOne(row.job);

  return {
    id: row.id,
    organizationId: row.company_id,
    floorSystemTemplateId: row.floor_system_template_id,
    finishProductId: row.finish_product_id,
    opportunityId: row.opportunity_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    contractId: row.contract_id,
    jobId: row.job_id,
    source: row.source,
    status: row.status,
    isPrimary: row.is_primary,
    areaLabel: row.area_label,
    areaType: row.area_type,
    phaseLabel: row.phase_label,
    optionLabel: row.option_label,
    sortOrder: row.sort_order,
    estimatedAreaSqft: formatNumeric(row.estimated_area_sqft),
    estimatedLinearFt: formatNumeric(row.estimated_linear_ft),
    quantityNotes: row.quantity_notes,
    customerFacingDescription: row.customer_facing_description,
    internalNotes: row.internal_notes,
    specCompletenessStatus: row.spec_completeness_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    template: template
      ? { id: template.id, name: template.name, status: template.status }
      : null,
    finishProduct: finishProduct
      ? {
          id: finishProduct.id,
          manufacturerName: finishProduct.manufacturer_name,
          productName: finishProduct.product_name,
          status: finishProduct.status
        }
      : null,
    project: project ? { id: project.id, name: project.name, status: project.status } : null,
    customer: customer
      ? { id: customer.id, name: customer.name, companyName: customer.company_name }
      : null,
    opportunity: opportunity
      ? { id: opportunity.id, title: opportunity.title, status: opportunity.status }
      : null,
    estimate: estimate
      ? {
          id: estimate.id,
          referenceNumber: estimate.reference_number,
          status: estimate.status
        }
      : null,
    contract: contract
      ? { id: contract.id, title: contract.title, status: contract.status }
      : null,
    job: job
      ? { id: job.id, status: job.dispatch_status, scheduledDate: job.scheduled_date }
      : null
  };
}

async function assertBelongsToCompany(
  table:
    | "floor_system_templates"
    | "finish_products"
    | "opportunities"
    | "customers"
    | "projects"
    | "estimates"
    | "contracts"
    | "jobs",
  id: string | null,
  scope: SelectedSystemScope,
  label: string
) {
  if (!id) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from(table)
    .select("id")
    .eq("company_id", scope.organizationId)
    .eq("id", id)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to validate ${label}: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error(`${label} must belong to the active organization.`);
  }
}

async function getSelectedSystemById(
  selectedSystemId: string,
  scope: SelectedSystemScope
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("selected_floor_systems")
    .select(
      `
        *,
        floor_system_template:floor_system_templates!selected_floor_systems_template_company_fkey (id, name, status),
        finish_product:finish_products!selected_floor_systems_finish_product_company_fkey (id, manufacturer_name, product_name, status),
        project:projects!selected_floor_systems_project_company_fkey (id, name, status),
        customer:customers!selected_floor_systems_customer_company_fkey (id, name, company_name),
        opportunity:opportunities!selected_floor_systems_opportunity_company_fkey (id, title, status),
        estimate:estimates!selected_floor_systems_estimate_company_fkey (id, reference_number, status),
        contract:contracts!selected_floor_systems_contract_company_fkey (id, title, status),
        job:jobs!selected_floor_systems_job_company_fkey (id, dispatch_status, scheduled_date)
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("id", selectedSystemId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load selected system: ${response.error.message}`);
  }

  return response.data ? mapSelectedSystem(response.data as SelectedSystemRow) : null;
}

async function unsetOtherProjectPrimaries(input: {
  scope: SelectedSystemScope;
  projectId: string;
  selectedSystemId: string | null;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("selected_floor_systems")
    .update({ is_primary: false, updated_by: input.scope.userId })
    .eq("company_id", input.scope.organizationId)
    .eq("project_id", input.projectId)
    .eq("is_primary", true);

  if (input.selectedSystemId) {
    query = query.neq("id", input.selectedSystemId);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to update project primary selection: ${response.error.message}`);
  }
}

async function listLookupData(scope: SelectedSystemScope) {
  const supabase = await getSupabaseServerClient();
  const [
    templates,
    finishProducts,
    opportunities,
    customers,
    projects,
    estimates,
    contracts,
    jobs
  ] = await Promise.all([
    supabase
      .from("floor_system_templates")
      .select("id, name, status")
      .eq("company_id", scope.organizationId)
      .neq("status", "archived")
      .order("name", { ascending: true }),
    supabase
      .from("finish_products")
      .select("id, manufacturer_name, product_name, status")
      .eq("company_id", scope.organizationId)
      .neq("status", "archived")
      .order("manufacturer_name", { ascending: true })
      .order("product_name", { ascending: true }),
    supabase
      .from("opportunities")
      .select("id, title, status")
      .eq("company_id", scope.organizationId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("customers")
      .select("id, name, company_name")
      .eq("company_id", scope.organizationId)
      .order("name", { ascending: true })
      .limit(200),
    supabase
      .from("projects")
      .select("id, name, status")
      .eq("company_id", scope.organizationId)
      .order("name", { ascending: true })
      .limit(200),
    supabase
      .from("estimates")
      .select("id, reference_number, status")
      .eq("company_id", scope.organizationId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("contracts")
      .select("id, title, status")
      .eq("company_id", scope.organizationId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("jobs")
      .select("id, dispatch_status, scheduled_date")
      .eq("company_id", scope.organizationId)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  for (const [label, response] of [
    ["floor system templates", templates],
    ["finish products", finishProducts],
    ["opportunities", opportunities],
    ["customers", customers],
    ["projects", projects],
    ["estimates", estimates],
    ["contracts", contracts],
    ["jobs", jobs]
  ] as const) {
    if (response.error) {
      throw new Error(`Unable to load ${label}: ${response.error.message}`);
    }
  }

  return {
    templates: ((templates.data ?? []) as Array<{ id: string; name: string; status: string }>).map(
      (row) => ({ id: row.id, label: row.name, status: row.status })
    ),
    finishProducts: (
      (finishProducts.data ?? []) as Array<{
        id: string;
        manufacturer_name: string;
        product_name: string;
        status: string;
      }>
    ).map((row) => ({
      id: row.id,
      label: `${row.manufacturer_name} - ${row.product_name}`,
      status: row.status
    })),
    opportunities: (
      (opportunities.data ?? []) as Array<{ id: string; title: string; status: string }>
    ).map((row) => ({ id: row.id, label: row.title, status: row.status })),
    customers: (
      (customers.data ?? []) as Array<{
        id: string;
        name: string;
        company_name: string | null;
      }>
    ).map((row) => ({
      id: row.id,
      label: row.name,
      status: null,
      meta: row.company_name
    })),
    projects: ((projects.data ?? []) as Array<{ id: string; name: string; status: string }>).map(
      (row) => ({ id: row.id, label: row.name, status: row.status })
    ),
    estimates: (
      (estimates.data ?? []) as Array<{
        id: string;
        reference_number: string;
        status: string;
      }>
    ).map((row) => ({
      id: row.id,
      label: row.reference_number,
      status: row.status
    })),
    contracts: (
      (contracts.data ?? []) as Array<{ id: string; title: string; status: string }>
    ).map((row) => ({ id: row.id, label: row.title, status: row.status })),
    jobs: (
      (jobs.data ?? []) as Array<{
        id: string;
        dispatch_status: string;
        scheduled_date: string | null;
      }>
    ).map((row) => ({
      id: row.id,
      label: `${row.dispatch_status} job`,
      status: row.dispatch_status,
      meta: row.scheduled_date
    }))
  };
}

export async function getSelectedSystemsAdminData(
  next = "/settings/selected-systems"
): Promise<SelectedSystemsAdminData> {
  const scope = await requireSelectedSystemScope(next);
  const supabase = await getSupabaseServerClient();
  const [selectedSystemsResponse, lookupData] = await Promise.all([
    supabase
      .from("selected_floor_systems")
      .select(
        `
          *,
          floor_system_template:floor_system_templates!selected_floor_systems_template_company_fkey (id, name, status),
          finish_product:finish_products!selected_floor_systems_finish_product_company_fkey (id, manufacturer_name, product_name, status),
          project:projects!selected_floor_systems_project_company_fkey (id, name, status),
          customer:customers!selected_floor_systems_customer_company_fkey (id, name, company_name),
          opportunity:opportunities!selected_floor_systems_opportunity_company_fkey (id, title, status),
          estimate:estimates!selected_floor_systems_estimate_company_fkey (id, reference_number, status),
          contract:contracts!selected_floor_systems_contract_company_fkey (id, title, status),
          job:jobs!selected_floor_systems_job_company_fkey (id, dispatch_status, scheduled_date)
        `
      )
      .eq("company_id", scope.organizationId)
      .order("project_id", { ascending: true, nullsFirst: false })
      .order("is_primary", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    listLookupData(scope)
  ]);

  if (selectedSystemsResponse.error) {
    throw new Error(
      `Unable to load selected systems: ${selectedSystemsResponse.error.message}`
    );
  }

  return {
    selectedSystems: ((selectedSystemsResponse.data ?? []) as SelectedSystemRow[]).map(
      mapSelectedSystem
    ),
    ...lookupData
  };
}

export async function upsertSelectedSystem(input: SelectedSystemInput) {
  const scope = await requireSelectedSystemScope();
  const existing = input.selectedSystemId
    ? await getSelectedSystemById(input.selectedSystemId, scope)
    : null;

  if (input.selectedSystemId && !existing) {
    throw new Error("Selected system was not found.");
  }

  await assertBelongsToCompany(
    "floor_system_templates",
    input.floorSystemTemplateId,
    scope,
    "Floor system template"
  );
  await assertBelongsToCompany(
    "finish_products",
    input.finishProductId,
    scope,
    "Finish product"
  );
  await assertBelongsToCompany("opportunities", input.opportunityId, scope, "Opportunity");
  await assertBelongsToCompany("customers", input.customerId, scope, "Customer");
  await assertBelongsToCompany("projects", input.projectId, scope, "Project");
  await assertBelongsToCompany("estimates", input.estimateId, scope, "Estimate");
  await assertBelongsToCompany("contracts", input.contractId, scope, "Contract");
  await assertBelongsToCompany("jobs", input.jobId, scope, "Job");

  if (input.isPrimary && input.projectId) {
    await unsetOtherProjectPrimaries({
      scope,
      projectId: input.projectId,
      selectedSystemId: input.selectedSystemId
    });
  }

  const payload = {
    company_id: scope.organizationId,
    floor_system_template_id: input.floorSystemTemplateId,
    finish_product_id: input.finishProductId,
    opportunity_id: input.opportunityId,
    customer_id: input.customerId,
    project_id: input.projectId,
    estimate_id: input.estimateId,
    contract_id: input.contractId,
    job_id: input.jobId,
    source: input.source,
    status: input.status,
    is_primary: input.isPrimary,
    area_label: input.areaLabel,
    area_type: input.areaType,
    phase_label: input.phaseLabel,
    option_label: input.optionLabel,
    estimated_area_sqft: input.estimatedAreaSqft,
    estimated_linear_ft: input.estimatedLinearFt,
    quantity_notes: input.quantityNotes,
    customer_facing_description: input.customerFacingDescription,
    internal_notes: input.internalNotes,
    spec_completeness_status: input.specCompletenessStatus,
    updated_by: scope.userId
  };
  const supabase = await getSupabaseServerClient();
  const response = input.selectedSystemId
    ? await supabase
        .from("selected_floor_systems")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.selectedSystemId)
        .select(
          `
            *,
            floor_system_template:floor_system_templates!selected_floor_systems_template_company_fkey (id, name, status),
            finish_product:finish_products!selected_floor_systems_finish_product_company_fkey (id, manufacturer_name, product_name, status),
            project:projects!selected_floor_systems_project_company_fkey (id, name, status),
            customer:customers!selected_floor_systems_customer_company_fkey (id, name, company_name),
            opportunity:opportunities!selected_floor_systems_opportunity_company_fkey (id, title, status),
            estimate:estimates!selected_floor_systems_estimate_company_fkey (id, reference_number, status),
            contract:contracts!selected_floor_systems_contract_company_fkey (id, title, status),
            job:jobs!selected_floor_systems_job_company_fkey (id, dispatch_status, scheduled_date)
          `
        )
        .single()
    : await supabase
        .from("selected_floor_systems")
        .insert({ ...payload, created_by: scope.userId })
        .select(
          `
            *,
            floor_system_template:floor_system_templates!selected_floor_systems_template_company_fkey (id, name, status),
            finish_product:finish_products!selected_floor_systems_finish_product_company_fkey (id, manufacturer_name, product_name, status),
            project:projects!selected_floor_systems_project_company_fkey (id, name, status),
            customer:customers!selected_floor_systems_customer_company_fkey (id, name, company_name),
            opportunity:opportunities!selected_floor_systems_opportunity_company_fkey (id, title, status),
            estimate:estimates!selected_floor_systems_estimate_company_fkey (id, reference_number, status),
            contract:contracts!selected_floor_systems_contract_company_fkey (id, title, status),
            job:jobs!selected_floor_systems_job_company_fkey (id, dispatch_status, scheduled_date)
          `
        )
        .single();

  if (response.error) {
    throw new Error(`Unable to save selected system: ${response.error.message}`);
  }

  return mapSelectedSystem(response.data as SelectedSystemRow);
}

export async function changeSelectedSystemStatus(
  selectedSystemId: string,
  status: SelectedSystemStatus
) {
  const scope = await requireSelectedSystemScope();
  const existing = await getSelectedSystemById(selectedSystemId, scope);

  if (!existing) {
    throw new Error("Selected system was not found.");
  }

  return upsertSelectedSystem({
    selectedSystemId: existing.id,
    floorSystemTemplateId: existing.floorSystemTemplateId,
    finishProductId: existing.finishProductId,
    opportunityId: existing.opportunityId,
    customerId: existing.customerId,
    projectId: existing.projectId,
    estimateId: existing.estimateId,
    contractId: existing.contractId,
    jobId: existing.jobId,
    source: existing.source,
    status,
    isPrimary: existing.isPrimary,
    areaLabel: existing.areaLabel,
    areaType: existing.areaType,
    phaseLabel: existing.phaseLabel,
    optionLabel: existing.optionLabel,
    estimatedAreaSqft: existing.estimatedAreaSqft,
    estimatedLinearFt: existing.estimatedLinearFt,
    quantityNotes: existing.quantityNotes,
    customerFacingDescription: existing.customerFacingDescription,
    internalNotes: existing.internalNotes,
    specCompletenessStatus: existing.specCompletenessStatus
  });
}

export async function toggleSelectedSystemPrimary(
  selectedSystemId: string,
  isPrimary: boolean
) {
  const scope = await requireSelectedSystemScope();
  const existing = await getSelectedSystemById(selectedSystemId, scope);

  if (!existing) {
    throw new Error("Selected system was not found.");
  }

  return upsertSelectedSystem({
    selectedSystemId: existing.id,
    floorSystemTemplateId: existing.floorSystemTemplateId,
    finishProductId: existing.finishProductId,
    opportunityId: existing.opportunityId,
    customerId: existing.customerId,
    projectId: existing.projectId,
    estimateId: existing.estimateId,
    contractId: existing.contractId,
    jobId: existing.jobId,
    source: existing.source,
    status: existing.status,
    isPrimary,
    areaLabel: existing.areaLabel,
    areaType: existing.areaType,
    phaseLabel: existing.phaseLabel,
    optionLabel: existing.optionLabel,
    estimatedAreaSqft: existing.estimatedAreaSqft,
    estimatedLinearFt: existing.estimatedLinearFt,
    quantityNotes: existing.quantityNotes,
    customerFacingDescription: existing.customerFacingDescription,
    internalNotes: existing.internalNotes,
    specCompletenessStatus: existing.specCompletenessStatus
  });
}
