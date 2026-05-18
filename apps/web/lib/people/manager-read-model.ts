import "server-only";

import { cache } from "react";
import type {
  CustomerContactPortalPermissionListItem,
  PortalProjectAccessListItem
} from "@/lib/portal-access/data";
import type { Person as PersonRecord } from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type PeopleManagerView =
  | "all"
  | "employees"
  | "subcontractors"
  | "active";

export type PeopleManagerPerson = {
  id: string;
  personType: PersonRecord["personType"];
  displayName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  trade: string | null;
  isActive: boolean;
  vendor: {
    id: string;
    name: string;
  } | null;
};

export type PeopleManagerVendorOption = {
  id: string;
  name: string;
  isLaborProvider: boolean;
};

export type PeopleManagerMemberOption = {
  userId: string;
  label: string;
};

export type PeopleManagerAccessProject = {
  id: string;
  customerId: string;
  name: string;
  status: string;
};

export type PeopleManagerReadModel = {
  people: PeopleManagerPerson[];
  counts: Record<PeopleManagerView, number>;
  complianceCountByPersonId: Map<string, number>;
  vendorOptions: PeopleManagerVendorOption[];
  memberOptions: PeopleManagerMemberOption[];
  portalPermissionsByCustomerContactId: Map<
    string,
    CustomerContactPortalPermissionListItem
  >;
  portalProjectAccessByGrantId: Map<string, PortalProjectAccessListItem[]>;
  projectsByCustomerId: Map<string, PeopleManagerAccessProject[]>;
};

type PeopleManagerPersonRow = {
  id: string;
  person_type: PersonRecord["personType"];
  display_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  trade: string | null;
  is_active: boolean;
  vendor_id: string | null;
  vendors?:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
};

type CompliancePersonCountRow = {
  subject_id: string;
};

type VendorOptionRow = {
  id: string;
  name: string;
  is_labor_provider: boolean;
};

type MemberOptionRow = {
  user_id: string;
  invitation_email: string | null;
  member_user:
    | Array<{
        id: string;
        email: string;
        full_name: string | null;
      }>
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
};

type PortalProjectAccessRow = {
  id: string;
  company_id: string;
  portal_access_grant_id: string;
  project_id: string;
  status: "active" | "revoked";
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  projects?:
    | {
        id: string;
        customer_id: string;
        name: string;
        status: string;
      }
    | Array<{
        id: string;
        customer_id: string;
        name: string;
        status: string;
      }>
    | null;
};

type PortalPermissionRow = {
  id: string;
  company_id: string;
  customer_contact_id: string;
  portal_access_grant_id: string | null;
  can_view_estimates: boolean;
  can_approve_estimates: boolean;
  can_sign_contracts: boolean;
  can_approve_change_orders: boolean;
  can_view_pay_invoices: boolean;
  can_request_quotes: boolean;
  management_source:
    | "system_default"
    | "contractor_admin"
    | "main_contact"
    | "migration";
  created_at: string;
  updated_at: string;
};

type AccessProjectRow = {
  id: string;
  customer_id: string;
  name: string;
  status: string;
};

const peopleManagerViews: PeopleManagerView[] = [
  "all",
  "employees",
  "subcontractors",
  "active"
];

const peopleManagerSelect = `
  id,
  person_type,
  display_name,
  email,
  phone,
  job_title,
  trade,
  is_active,
  vendor_id,
  vendors (
    id,
    name
  )
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapPerson(row: PeopleManagerPersonRow): PeopleManagerPerson {
  const vendor = getSingleRelation(row.vendors);

  return {
    id: row.id,
    personType: row.person_type,
    displayName: row.display_name,
    email: row.email,
    phone: row.phone,
    jobTitle: row.job_title,
    trade: row.trade,
    isActive: row.is_active,
    vendor: vendor
      ? {
          id: vendor.id,
          name: vendor.name
        }
      : null
  };
}

async function countPeople(input: {
  organizationId: string;
  view?: PeopleManagerView;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("people")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  if (input.view === "employees") {
    query = query.eq("person_type", "employee");
  }

  if (input.view === "subcontractors") {
    query = query.eq("person_type", "subcontractor_worker");
  }

  if (input.view === "active") {
    query = query.eq("is_active", true);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count people: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function findVendorIdsForPeopleSearch(input: {
  organizationId: string;
  query: string;
}) {
  const supabase = await getSupabaseServerClient();
  const escapedQuery = escapeLikePattern(input.query);
  const response = await supabase
    .from("vendors")
    .select("id")
    .eq("company_id", input.organizationId)
    .or(`name.ilike.%${escapedQuery}%`);

  if (response.error) {
    throw new Error(
      `Unable to load people search vendor matches: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as Array<{ id: string }>).map((row) => row.id)
    : [];
}

async function buildPeopleSearchPredicates(input: {
  organizationId: string;
  query?: string;
}) {
  const trimmedQuery = input.query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const escapedQuery = escapeLikePattern(trimmedQuery);
  const normalizedQuery = trimmedQuery.toLowerCase();
  const vendorIds = await findVendorIdsForPeopleSearch({
    organizationId: input.organizationId,
    query: trimmedQuery
  });

  return [
    `display_name.ilike.%${escapedQuery}%`,
    `email.ilike.%${escapedQuery}%`,
    `phone.ilike.%${escapedQuery}%`,
    `job_title.ilike.%${escapedQuery}%`,
    `trade.ilike.%${escapedQuery}%`,
    ...(normalizedQuery.includes("employee")
      ? ["person_type.eq.employee"]
      : []),
    ...(normalizedQuery.includes("subcontractor")
      ? ["person_type.eq.subcontractor_worker"]
      : []),
    ...(vendorIds.length > 0 ? [`vendor_id.in.(${vendorIds.join(",")})`] : [])
  ];
}

async function listPeopleForManager(input: {
  organizationId: string;
  view?: PeopleManagerView;
  query?: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = await buildPeopleSearchPredicates({
    organizationId: input.organizationId,
    query: input.query
  });
  let query = supabase
    .from("people")
    .select(peopleManagerSelect)
    .eq("company_id", input.organizationId)
    .order("display_name", { ascending: true })
    .limit(input.limit);

  if (input.view === "employees") {
    query = query.eq("person_type", "employee");
  }

  if (input.view === "subcontractors") {
    query = query.eq("person_type", "subcontractor_worker");
  }

  if (input.view === "active") {
    query = query.eq("is_active", true);
  }

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load people manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as PeopleManagerPersonRow[]).map(mapPerson)
    : [];
}

async function getComplianceCountByPersonId(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("compliance_records")
    .select("subject_id")
    .eq("company_id", organizationId)
    .eq("subject_type", "person");

  if (response.error) {
    throw new Error(
      `Unable to load people compliance count inputs: ${response.error.message}`
    );
  }

  const countByPersonId = new Map<string, number>();
  const rows = Array.isArray(response.data)
    ? (response.data as unknown as CompliancePersonCountRow[])
    : [];

  for (const row of rows) {
    countByPersonId.set(
      row.subject_id,
      (countByPersonId.get(row.subject_id) ?? 0) + 1
    );
  }

  return countByPersonId;
}

async function listPersonComposerVendorOptions(
  organizationId: string
): Promise<PeopleManagerVendorOption[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .select("id,name,is_labor_provider")
    .eq("company_id", organizationId)
    .eq("is_labor_provider", true)
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load people composer vendor options: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as VendorOptionRow[]).map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        isLaborProvider: vendor.is_labor_provider
      }))
    : [];
}

async function listPersonComposerMemberOptions(
  organizationId: string
): Promise<PeopleManagerMemberOption[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("company_memberships")
    .select(
      `
        user_id,
        invitation_email,
        member_user:users!company_memberships_user_id_fkey (
          id,
          email,
          full_name
        )
      `
    )
    .eq("company_id", organizationId)
    .order("membership_role", { ascending: true })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load people composer member options: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as unknown as MemberOptionRow[])
    : [];

  return rows.map((member) => {
    const user = getSingleRelation(member.member_user);

    return {
      userId: member.user_id,
      label: user?.full_name
        ? `${user.full_name} (${user.email})`
        : (user?.email ?? member.invitation_email ?? member.user_id)
    };
  });
}

async function listPersonComposerOptions(input: {
  organizationId: string;
  enabled: boolean;
}) {
  if (!input.enabled) {
    return {
      vendorOptions: [],
      memberOptions: []
    };
  }

  const [vendorOptions, memberOptions] = await Promise.all([
    listPersonComposerVendorOptions(input.organizationId),
    listPersonComposerMemberOptions(input.organizationId)
  ]);

  return {
    vendorOptions,
    memberOptions
  };
}

function isMissingCustomerContactPortalPermissionsTable(
  error: {
    message?: string;
  } | null
) {
  const message = error?.message ?? "";

  return (
    message.includes("customer_contact_portal_permissions") &&
    (/schema cache/i.test(message) || /does not exist/i.test(message))
  );
}

function mapPortalProjectAccess(
  row: PortalProjectAccessRow
): PortalProjectAccessListItem {
  const project = getSingleRelation(row.projects);

  return {
    id: row.id,
    organizationId: row.company_id,
    portalAccessGrantId: row.portal_access_grant_id,
    projectId: row.project_id,
    status: row.status,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    project: project
      ? {
          id: project.id,
          customerId: project.customer_id,
          name: project.name,
          status: project.status
        }
      : null
  };
}

function mapPortalPermission(
  row: PortalPermissionRow
): CustomerContactPortalPermissionListItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerContactId: row.customer_contact_id,
    portalAccessGrantId: row.portal_access_grant_id,
    canViewEstimates: row.can_view_estimates,
    canApproveEstimates: row.can_approve_estimates,
    canSignContracts: row.can_sign_contracts,
    canApproveChangeOrders: row.can_approve_change_orders,
    canViewPayInvoices: row.can_view_pay_invoices,
    canRequestQuotes: row.can_request_quotes,
    managementSource: row.management_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function listPortalProjectAccessForPeople(
  organizationId: string
): Promise<Map<string, PortalProjectAccessListItem[]>> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_project_access")
    .select(
      `
        id,
        company_id,
        portal_access_grant_id,
        project_id,
        status,
        revoked_at,
        created_at,
        updated_at,
        projects (
          id,
          customer_id,
          name,
          status
        )
      `
    )
    .eq("company_id", organizationId)
    .order("created_at", { ascending: false });

  if (response.error) {
    throw new Error(
      `Unable to load people portal project visibility: ${response.error.message}`
    );
  }

  const accessByGrantId = new Map<string, PortalProjectAccessListItem[]>();
  const rows = Array.isArray(response.data)
    ? (response.data as unknown as PortalProjectAccessRow[])
    : [];

  for (const row of rows) {
    const access = mapPortalProjectAccess(row);
    const existing = accessByGrantId.get(access.portalAccessGrantId) ?? [];
    existing.push(access);
    accessByGrantId.set(access.portalAccessGrantId, existing);
  }

  return accessByGrantId;
}

async function listPortalPermissionsForPeople(
  organizationId: string
): Promise<Map<string, CustomerContactPortalPermissionListItem>> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customer_contact_portal_permissions")
    .select(
      `
        id,
        company_id,
        customer_contact_id,
        portal_access_grant_id,
        can_view_estimates,
        can_approve_estimates,
        can_sign_contracts,
        can_approve_change_orders,
        can_view_pay_invoices,
        can_request_quotes,
        management_source,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .order("created_at", { ascending: true });

  if (response.error) {
    if (isMissingCustomerContactPortalPermissionsTable(response.error)) {
      return new Map();
    }

    throw new Error(
      `Unable to load people portal permission records: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as unknown as PortalPermissionRow[])
    : [];

  return new Map(
    rows.map((permission) => {
      const mapped = mapPortalPermission(permission);
      return [mapped.customerContactId, mapped];
    })
  );
}

async function listAccessProjectsForPeople(
  organizationId: string
): Promise<Map<string, PeopleManagerAccessProject[]>> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id,customer_id,name,status")
    .eq("company_id", organizationId)
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load people portal project options: ${response.error.message}`
    );
  }

  const projectsByCustomerId = new Map<string, PeopleManagerAccessProject[]>();
  const rows = Array.isArray(response.data)
    ? (response.data as unknown as AccessProjectRow[])
    : [];

  for (const project of rows) {
    const mapped = {
      id: project.id,
      customerId: project.customer_id,
      name: project.name,
      status: project.status
    };
    const existing = projectsByCustomerId.get(mapped.customerId) ?? [];
    existing.push(mapped);
    projectsByCustomerId.set(mapped.customerId, existing);
  }

  return projectsByCustomerId;
}

export const getPeopleManagerReadModel = cache(
  async (input: {
    organizationId: string;
    view?: PeopleManagerView;
    query?: string;
    includeComposerOptions?: boolean;
  }): Promise<PeopleManagerReadModel> => {
    const [
      allCount,
      employeeCount,
      subcontractorCount,
      activeCount,
      people,
      complianceCountByPersonId,
      composerOptions,
      portalPermissionsByCustomerContactId,
      portalProjectAccessByGrantId,
      projectsByCustomerId
    ] = await Promise.all([
      countPeople({ organizationId: input.organizationId }),
      countPeople({ organizationId: input.organizationId, view: "employees" }),
      countPeople({
        organizationId: input.organizationId,
        view: "subcontractors"
      }),
      countPeople({ organizationId: input.organizationId, view: "active" }),
      listPeopleForManager({
        organizationId: input.organizationId,
        view: input.view,
        query: input.query,
        limit: 20
      }),
      getComplianceCountByPersonId(input.organizationId),
      listPersonComposerOptions({
        organizationId: input.organizationId,
        enabled: input.includeComposerOptions ?? false
      }),
      listPortalPermissionsForPeople(input.organizationId),
      listPortalProjectAccessForPeople(input.organizationId),
      listAccessProjectsForPeople(input.organizationId)
    ]);

    return {
      people,
      counts: {
        all: allCount,
        employees: employeeCount,
        subcontractors: subcontractorCount,
        active: activeCount
      },
      complianceCountByPersonId,
      vendorOptions: composerOptions.vendorOptions,
      memberOptions: composerOptions.memberOptions,
      portalPermissionsByCustomerContactId,
      portalProjectAccessByGrantId,
      projectsByCustomerId
    };
  }
);

export function isPeopleManagerView(
  value: string | null | undefined
): value is PeopleManagerView {
  return peopleManagerViews.includes(value as PeopleManagerView);
}
