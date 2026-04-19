import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { compareOpportunityStatuses } from "@floorconnector/domain";
import type {
  Opportunity as OpportunityRecord,
  SiteAssessmentStatus
} from "@floorconnector/types";

import type { OpportunityInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { syncProjectCommercialReadiness } from "@/lib/projects/readiness";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type OpportunityRow = {
  id: string;
  company_id: string;
  customer_id: string | null;
  project_id: string | null;
  status: OpportunityRecord["status"];
  title: string;
  source: string | null;
  service_type: string | null;
  prospect_name: string;
  prospect_company_name: string | null;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
  notes: string | null;
  site_assessment_status: SiteAssessmentStatus;
  site_assessment_scheduled_at: string | null;
  site_assessment_completed_at: string | null;
  requirements_summary: string | null;
  qualified_at: string | null;
  converted_at: string | null;
  lost_at: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
      }
    | null;
  projects?:
    | {
        id: string;
        name: string;
        status: string;
      }
    | null;
};

type OpportunityScope = {
  userId: string;
  organizationId: string;
};

type IdRow = {
  id: string;
};

export type OpportunityListItem = OpportunityRecord & {
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
};

const opportunitySelect = `
  id,
  company_id,
  customer_id,
  project_id,
  status,
  title,
  source,
  service_type,
  prospect_name,
  prospect_company_name,
  email,
  phone,
  address_line_1,
  address_line_2,
  city,
  state_region,
  postal_code,
  country_code,
  notes,
  site_assessment_status,
  site_assessment_scheduled_at,
  site_assessment_completed_at,
  requirements_summary,
  qualified_at,
  converted_at,
  lost_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name
  ),
  projects (
    id,
    name,
    status
  )
`;

function isOpportunityRow(value: unknown): value is OpportunityRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<OpportunityRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    (row.customer_id === null || typeof row.customer_id === "string") &&
    (row.project_id === null || typeof row.project_id === "string") &&
    typeof row.status === "string" &&
    typeof row.title === "string" &&
    typeof row.prospect_name === "string" &&
    typeof row.site_assessment_status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isOpportunityRowArray(value: unknown): value is OpportunityRow[] {
  return Array.isArray(value) && value.every((row) => isOpportunityRow(row));
}

function isIdRow(value: unknown): value is IdRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  return typeof (value as Partial<IdRow>).id === "string";
}

function mapOpportunity(row: OpportunityRow): OpportunityRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    status: row.status,
    title: row.title,
    source: row.source,
    serviceType: row.service_type,
    prospectName: row.prospect_name,
    prospectCompanyName: row.prospect_company_name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    notes: row.notes,
    siteAssessmentStatus: row.site_assessment_status,
    siteAssessmentScheduledAt: row.site_assessment_scheduled_at,
    siteAssessmentCompletedAt: row.site_assessment_completed_at,
    requirementsSummary: row.requirements_summary,
    qualifiedAt: row.qualified_at,
    convertedAt: row.converted_at,
    lostAt: row.lost_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toStoredAssessmentTimestamp(date: string | null) {
  return date ? `${date}T12:00:00.000Z` : null;
}

function resolveSiteAssessmentState(
  status: OpportunityRecord["status"],
  input: {
    siteAssessmentScheduledOn: string | null;
    siteAssessmentCompletedOn: string | null;
    requirementsSummary: string | null;
  },
  current?: Pick<
    OpportunityRecord,
    | "siteAssessmentStatus"
    | "siteAssessmentScheduledAt"
    | "siteAssessmentCompletedAt"
    | "requirementsSummary"
  >
) {
  const scheduledAt =
    toStoredAssessmentTimestamp(input.siteAssessmentScheduledOn) ??
    current?.siteAssessmentScheduledAt ??
    null;
  const completedAt =
    toStoredAssessmentTimestamp(input.siteAssessmentCompletedOn) ??
    current?.siteAssessmentCompletedAt ??
    null;

  if (completedAt || status === "site_assessment_complete") {
    return {
      siteAssessmentStatus: "completed" as const,
      siteAssessmentScheduledAt: scheduledAt ?? completedAt,
      siteAssessmentCompletedAt: completedAt ?? scheduledAt
    };
  }

  if (scheduledAt || status === "site_assessment_scheduled") {
    return {
      siteAssessmentStatus: "scheduled" as const,
      siteAssessmentScheduledAt: scheduledAt,
      siteAssessmentCompletedAt: null
    };
  }

  return {
    siteAssessmentStatus: "pending" as const,
    siteAssessmentScheduledAt: null,
    siteAssessmentCompletedAt: null
  };
}

function mapOpportunityListItem(row: OpportunityRow): OpportunityListItem {
  return {
    ...mapOpportunity(row),
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
      : null
  };
}

async function getOpportunityScope(next = "/leads"): Promise<OpportunityScope | null> {
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

export async function requireOpportunityScope(next = "/leads") {
  const scope = await getOpportunityScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for leads yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

function sortOpportunities(opportunities: OpportunityListItem[]) {
  return opportunities.sort((left, right) => {
    const statusComparison = compareOpportunityStatuses(left.status, right.status);

    if (statusComparison !== 0) {
      return statusComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export const listOpportunities = cache(async (): Promise<OpportunityListItem[]> => {
  const scope = await requireOpportunityScope("/leads");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .select(opportunitySelect)
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load leads: ${error.message}`);
  }

  if (!isOpportunityRowArray(data)) {
    return [];
  }

  return sortOpportunities(data.map(mapOpportunityListItem));
});

export async function getOpportunityById(opportunityId: string, next = "/leads") {
  const scope = await requireOpportunityScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .select(opportunitySelect)
    .eq("company_id", scope.organizationId)
    .eq("id", opportunityId)
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load the lead: ${error.message}`);
  }

  if (!isOpportunityRow(data)) {
    return null;
  }

  return mapOpportunityListItem(data);
}

export async function createOpportunity(input: OpportunityInput) {
  const scope = await requireOpportunityScope("/leads");
  const supabase = await getSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const siteAssessmentState = resolveSiteAssessmentState(input.status, input);
  const response = await supabase
    .from("opportunities")
    .insert({
      company_id: scope.organizationId,
      status: input.status,
      title: input.title,
      source: input.source,
      service_type: input.serviceType,
      prospect_name: input.prospectName,
      prospect_company_name: input.prospectCompanyName,
      email: input.email,
      phone: input.phone,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      notes: input.notes,
      site_assessment_status: siteAssessmentState.siteAssessmentStatus,
      site_assessment_scheduled_at: siteAssessmentState.siteAssessmentScheduledAt,
      site_assessment_completed_at: siteAssessmentState.siteAssessmentCompletedAt,
      requirements_summary: input.requirementsSummary,
      qualified_at: input.status === "qualified" ? nowIso : null,
      lost_at: input.status === "lost" ? nowIso : null,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(opportunitySelect)
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to create the lead: ${error.message}`);
  }

  if (!isOpportunityRow(data)) {
    throw new Error("Unexpected lead response after create.");
  }

  return mapOpportunityListItem(data);
}

export async function updateOpportunity(opportunityId: string, input: OpportunityInput) {
  const scope = await requireOpportunityScope(`/leads/${opportunityId}`);
  const currentOpportunity = await getOpportunityById(opportunityId, `/leads/${opportunityId}`);

  if (!currentOpportunity) {
    throw new Error("Lead not found for this organization.");
  }

  const supabase = await getSupabaseServerClient();
  const siteAssessmentState = resolveSiteAssessmentState(
    input.status,
    input,
    currentOpportunity
  );
  const qualifiedAt =
    input.status === "qualified" && !currentOpportunity.qualifiedAt
      ? new Date().toISOString()
      : input.status === "lost"
        ? currentOpportunity.qualifiedAt
        : currentOpportunity.qualifiedAt;
  const lostAt =
    input.status === "lost"
      ? currentOpportunity.lostAt ?? new Date().toISOString()
      : null;

  const response = await supabase
    .from("opportunities")
    .update({
      status: input.status,
      title: input.title,
      source: input.source,
      service_type: input.serviceType,
      prospect_name: input.prospectName,
      prospect_company_name: input.prospectCompanyName,
      email: input.email,
      phone: input.phone,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      notes: input.notes,
      site_assessment_status: siteAssessmentState.siteAssessmentStatus,
      site_assessment_scheduled_at: siteAssessmentState.siteAssessmentScheduledAt,
      site_assessment_completed_at: siteAssessmentState.siteAssessmentCompletedAt,
      requirements_summary: input.requirementsSummary,
      qualified_at: qualifiedAt,
      lost_at: lostAt,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", opportunityId)
    .select(opportunitySelect)
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to update the lead: ${error.message}`);
  }

  if (!isOpportunityRow(data)) {
    throw new Error("Lead not found for this organization.");
  }

  if (data.project_id) {
    await syncProjectCommercialReadiness({
      organizationId: scope.organizationId,
      projectId: data.project_id
    });
  }

  return mapOpportunityListItem(data);
}

export async function getOpportunityByProjectId(
  projectId: string,
  next = "/projects"
) {
  const scope = await requireOpportunityScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("opportunities")
    .select(opportunitySelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load the project lead context: ${error.message}`);
  }

  if (!isOpportunityRow(data)) {
    return null;
  }

  return mapOpportunityListItem(data);
}

export async function ensureOpportunityEstimateFlow(opportunityId: string) {
  const scope = await requireOpportunityScope(`/leads/${opportunityId}`);
  const opportunity = await getOpportunityById(opportunityId, `/leads/${opportunityId}`);

  if (!opportunity) {
    throw new Error("Lead not found for this organization.");
  }

  const supabase = await getSupabaseServerClient();
  let customerId = opportunity.customerId;
  let projectId = opportunity.projectId;

  if (!customerId) {
    const financialSettings = await getOrganizationFinancialSettings(scope.organizationId);
    const customerResponse = await supabase
      .from("customers")
      .insert({
        company_id: scope.organizationId,
        name: opportunity.prospectName,
        company_name: opportunity.prospectCompanyName,
        phone: opportunity.phone,
        email: opportunity.email,
        address_line_1: opportunity.addressLine1,
        address_line_2: opportunity.addressLine2,
        city: opportunity.city,
        state_region: opportunity.stateRegion,
        postal_code: opportunity.postalCode,
        country_code: opportunity.countryCode,
        notes: opportunity.notes,
        is_tax_exempt: false,
        retainage_percentage_default: financialSettings.defaultRetainagePercentage,
        created_by: scope.userId,
        updated_by: scope.userId
      })
      .select("id")
      .single();

    const customerData: unknown = customerResponse.data;

    if (customerResponse.error || !isIdRow(customerData)) {
      throw new Error(
        `Unable to create a customer from this lead: ${customerResponse.error?.message ?? "Unknown error."}`
      );
    }

    customerId = customerData.id;
  }

  if (!projectId) {
    const projectResponse = await supabase
      .from("projects")
      .insert({
        company_id: scope.organizationId,
        customer_id: customerId,
        name: opportunity.title,
        status: "estimating",
        description: opportunity.requirementsSummary ?? opportunity.notes,
        address_line_1: opportunity.addressLine1,
        address_line_2: opportunity.addressLine2,
        city: opportunity.city,
        state_region: opportunity.stateRegion,
        postal_code: opportunity.postalCode,
        country_code: opportunity.countryCode,
        created_by: scope.userId,
        updated_by: scope.userId
      })
      .select("id")
      .single();

    const projectData: unknown = projectResponse.data;

    if (projectResponse.error || !isIdRow(projectData)) {
      throw new Error(
        `Unable to create a project from this lead: ${projectResponse.error?.message ?? "Unknown error."}`
      );
    }

    projectId = projectData.id;
  } else if (opportunity.requirementsSummary || opportunity.notes) {
    const projectSeedResponse = await supabase
      .from("projects")
      .update({
        description: opportunity.requirementsSummary ?? opportunity.notes,
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("id", projectId)
      .is("description", null);

    if (projectSeedResponse.error) {
      throw new Error(
        `Unable to carry assessment context into the project: ${projectSeedResponse.error.message}`
      );
    }
  }

  if (!customerId || !projectId) {
    throw new Error("Lead could not be linked to the canonical customer and project chain.");
  }

  const conversionTimestamp = opportunity.convertedAt ?? new Date().toISOString();
  const updateResponse = await supabase
    .from("opportunities")
    .update({
      customer_id: customerId,
      project_id: projectId,
      status: "estimating",
      site_assessment_status:
        opportunity.siteAssessmentStatus === "pending"
          ? "completed"
          : opportunity.siteAssessmentStatus,
      site_assessment_completed_at:
        opportunity.siteAssessmentCompletedAt ??
        opportunity.siteAssessmentScheduledAt ??
        new Date().toISOString(),
      qualified_at: opportunity.qualifiedAt ?? new Date().toISOString(),
      converted_at: conversionTimestamp,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", opportunity.id);

  if (updateResponse.error) {
    throw new Error(`Unable to prepare the estimate flow: ${updateResponse.error.message}`);
  }

  await syncProjectCommercialReadiness({
    organizationId: scope.organizationId,
    projectId
  });

  return {
    opportunityId: opportunity.id,
    customerId,
    projectId
  };
}
