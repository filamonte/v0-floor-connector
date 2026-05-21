import "server-only";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type GlobalSearchGroupKey =
  | "opportunity"
  | "customer"
  | "project"
  | "appointment"
  | "estimate"
  | "contract"
  | "invoice"
  | "job"
  | "punchlist"
  | "payment"
  | "person"
  | "vendor";

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchGroupKey;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  score: number;
};

export type GlobalSearchGroup = {
  key: GlobalSearchGroupKey;
  label: string;
  results: GlobalSearchResult[];
};

type NameRelation = { name: string; company_name: string | null };
type ProjectRelation = { id: string; name: string };
type EstimateRelation = { reference_number: string };
type JobRelation = { id: string };
type OpportunityRelation = { id: string; title: string };
type PersonRelation = { id: string; display_name: string };
type PunchlistProjectRelation = { id: string; name: string };
type PunchlistJobRelation = { id: string; dispatch_status: string | null };
type PunchlistAssigneeRelation = { id: string; display_name: string };
type VendorRelation = { id: string; name: string };
type PaymentCustomerRelation = {
  id: string;
  name: string;
  company_name: string | null;
};
type PaymentInvoiceRelation = {
  id: string;
  reference_number: string;
  customers: PaymentCustomerRelation | PaymentCustomerRelation[] | null;
  projects: ProjectRelation | ProjectRelation[] | null;
};

type OpportunitySearchRow = {
  id: string;
  title: string;
  prospect_name: string;
  prospect_company_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  updated_at: string;
  customers: NameRelation | NameRelation[] | null;
  projects: ProjectRelation | ProjectRelation[] | null;
};

type CustomerSearchRow = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state_region: string | null;
  updated_at: string;
};

type ProjectSearchRow = {
  id: string;
  name: string;
  status: string;
  updated_at: string;
  customers: NameRelation | NameRelation[] | null;
};

type AppointmentSearchRow = {
  id: string;
  title: string;
  appointment_type: string;
  starts_at: string;
  location: string | null;
  status: string;
  opportunities: OpportunityRelation | OpportunityRelation[] | null;
  customers: NameRelation | NameRelation[] | null;
  projects: ProjectRelation | ProjectRelation[] | null;
  assigned_person: PersonRelation | PersonRelation[] | null;
};

type EstimateSearchRow = {
  id: string;
  reference_number: string;
  status: string;
  total_amount: string | number;
  updated_at: string;
  customers: NameRelation | NameRelation[] | null;
  projects: ProjectRelation | ProjectRelation[] | null;
};

type ContractSearchRow = {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  customers: NameRelation | NameRelation[] | null;
  projects: ProjectRelation | ProjectRelation[] | null;
  estimates: EstimateRelation | EstimateRelation[] | null;
};

type InvoiceSearchRow = {
  id: string;
  reference_number: string;
  status: string;
  total_amount: string | number;
  balance_due_amount: string | number;
  due_date: string | null;
  updated_at: string;
  customers: NameRelation | NameRelation[] | null;
  projects: ProjectRelation | ProjectRelation[] | null;
  jobs: JobRelation | JobRelation[] | null;
};

type JobSearchRow = {
  id: string;
  dispatch_status: string;
  scheduled_date: string | null;
  updated_at: string;
  customers: NameRelation | NameRelation[] | null;
  projects: ProjectRelation | ProjectRelation[] | null;
  estimates: EstimateRelation | EstimateRelation[] | null;
};

type PunchlistSearchRow = {
  id: string;
  title: string;
  details: string | null;
  due_date: string | null;
  status: string;
  updated_at: string;
  projects: PunchlistProjectRelation | PunchlistProjectRelation[] | null;
  jobs: PunchlistJobRelation | PunchlistJobRelation[] | null;
  assignee: PunchlistAssigneeRelation | PunchlistAssigneeRelation[] | null;
};

type PaymentSearchRow = {
  id: string;
  amount: string | number;
  status: string;
  payment_date: string;
  payment_method: string;
  payment_source: string;
  payer_email: string | null;
  reference: string | null;
  created_at: string;
  invoices: PaymentInvoiceRelation | PaymentInvoiceRelation[] | null;
};

type PersonSearchRow = {
  id: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  trade: string | null;
  is_active: boolean;
  updated_at: string;
  vendors: VendorRelation | VendorRelation[] | null;
};

type VendorSearchRow = {
  id: string;
  name: string;
  vendor_type: string;
  primary_contact_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  updated_at: string;
};

const groupLabels: Record<GlobalSearchGroupKey, string> = {
  opportunity: "Leads / opportunities",
  customer: "Customers",
  project: "Projects",
  appointment: "Appointments",
  estimate: "Estimates",
  contract: "Contracts",
  invoice: "Invoices",
  job: "Jobs",
  punchlist: "Punchlists",
  payment: "Payments",
  person: "People (workforce)",
  vendor: "Vendors"
};

const perGroupLimit = 5;
const perEntityCandidateLimit = 50;
const relatedCandidateLimit = 50;

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function buildSearchText(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function getSearchVariants(query: string) {
  const underscoredQuery = query.replace(/\s+/g, "_");

  return Array.from(new Set([query, underscoredQuery]))
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildIlikePredicates(columns: string[], query: string) {
  return getSearchVariants(query).flatMap((variant) => {
    const escapedQuery = escapeLikePattern(variant);

    return columns.map((column) => `${column}.ilike.%${escapedQuery}%`);
  });
}

function buildInPredicate(column: string, values: string[]) {
  return values.length > 0 ? [`${column}.in.(${values.join(",")})`] : [];
}

function applySearchPredicates<T extends { or: (filters: string) => T }>(
  query: T,
  predicates: string[]
) {
  return predicates.length > 0 ? query.or(predicates.join(",")) : query;
}

async function findRelatedIdsForSearch(input: {
  table:
    | "customers"
    | "projects"
    | "opportunities"
    | "vendors"
    | "people"
    | "estimates"
    | "invoices";
  organizationId: string;
  query: string;
  columns: string[];
}) {
  const supabase = await getSupabaseServerClient();
  const predicates = buildIlikePredicates(input.columns, input.query);
  const response = await supabase
    .from(input.table)
    .select("id")
    .eq("company_id", input.organizationId)
    .or(predicates.join(","))
    .limit(relatedCandidateLimit);

  if (response.error) {
    throw new Error(
      `Unable to load global search related ${input.table}: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as Array<{ id: string }>).map((row) => row.id)
    : [];
}

function firstRelated<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function notNull<T>(value: T | null): value is T {
  return value !== null;
}

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function scoreMatch({
  title,
  subtitle,
  meta,
  tokens
}: {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  tokens: string[];
}) {
  const titleText = normalizeText(title);
  const subtitleText = normalizeText(subtitle);
  const metaText = normalizeText(meta);
  const searchable = `${titleText} ${subtitleText} ${metaText}`.trim();

  if (!searchable) {
    return null;
  }

  if (!tokens.every((token) => searchable.includes(token))) {
    return null;
  }

  return tokens.reduce((score, token) => {
    if (titleText.startsWith(token)) {
      return score + 12;
    }

    if (titleText.includes(token)) {
      return score + 8;
    }

    if (subtitleText.includes(token)) {
      return score + 5;
    }

    return score + 3;
  }, 0);
}

function sortAndTrim(results: GlobalSearchResult[]) {
  return results
    .sort(
      (left, right) =>
        right.score - left.score || left.title.localeCompare(right.title)
    )
    .slice(0, perGroupLimit);
}

export async function searchGlobalRecords(rawQuery: string) {
  const query = rawQuery.trim();

  if (query.length < 2) {
    return {
      query,
      totalCount: 0,
      groups: [] as GlobalSearchGroup[]
    };
  }

  const user = await requireAuthenticatedUser("/dashboard");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return {
      query,
      totalCount: 0,
      groups: [] as GlobalSearchGroup[]
    };
  }

  const organizationId = organizationContext.organization.id;
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const supabase = await getSupabaseServerClient();
  const [
    matchingCustomerIds,
    matchingProjectIds,
    matchingOpportunityIds,
    matchingVendorIds,
    matchingPersonIds,
    matchingEstimateIds
  ] = await Promise.all([
    findRelatedIdsForSearch({
      table: "customers",
      organizationId,
      query,
      columns: [
        "name",
        "company_name",
        "email",
        "phone",
        "city",
        "state_region"
      ]
    }),
    findRelatedIdsForSearch({
      table: "projects",
      organizationId,
      query,
      columns: ["name", "status"]
    }),
    findRelatedIdsForSearch({
      table: "opportunities",
      organizationId,
      query,
      columns: [
        "title",
        "prospect_name",
        "prospect_company_name",
        "email",
        "phone",
        "status"
      ]
    }),
    findRelatedIdsForSearch({
      table: "vendors",
      organizationId,
      query,
      columns: ["name", "vendor_type", "primary_contact_name", "email", "phone"]
    }),
    findRelatedIdsForSearch({
      table: "people",
      organizationId,
      query,
      columns: [
        "display_name",
        "first_name",
        "last_name",
        "email",
        "phone",
        "job_title",
        "trade"
      ]
    }),
    findRelatedIdsForSearch({
      table: "estimates",
      organizationId,
      query,
      columns: ["reference_number", "status"]
    })
  ]);

  const opportunityPredicates = [
    ...buildIlikePredicates(
      [
        "title",
        "prospect_name",
        "prospect_company_name",
        "email",
        "phone",
        "status"
      ],
      query
    ),
    ...buildInPredicate("customer_id", matchingCustomerIds),
    ...buildInPredicate("project_id", matchingProjectIds)
  ];
  const customerPredicates = buildIlikePredicates(
    ["name", "company_name", "email", "phone", "city", "state_region"],
    query
  );
  const projectPredicates = [
    ...buildIlikePredicates(["name", "status"], query),
    ...buildInPredicate("customer_id", matchingCustomerIds)
  ];
  const appointmentPredicates = [
    ...buildIlikePredicates(
      ["title", "appointment_type", "location", "status"],
      query
    ),
    ...buildInPredicate("opportunity_id", matchingOpportunityIds),
    ...buildInPredicate("customer_id", matchingCustomerIds),
    ...buildInPredicate("project_id", matchingProjectIds),
    ...buildInPredicate("assigned_person_id", matchingPersonIds)
  ];
  const estimatePredicates = [
    ...buildIlikePredicates(["reference_number", "status"], query),
    ...buildInPredicate("customer_id", matchingCustomerIds),
    ...buildInPredicate("project_id", matchingProjectIds)
  ];
  const contractPredicates = [
    ...buildIlikePredicates(["title", "status"], query),
    ...buildInPredicate("customer_id", matchingCustomerIds),
    ...buildInPredicate("project_id", matchingProjectIds),
    ...buildInPredicate("estimate_id", matchingEstimateIds)
  ];
  const invoicePredicates = [
    ...buildIlikePredicates(["reference_number", "status", "due_date"], query),
    ...buildInPredicate("customer_id", matchingCustomerIds),
    ...buildInPredicate("project_id", matchingProjectIds),
    ...buildInPredicate("estimate_id", matchingEstimateIds)
  ];
  const jobPredicates = [
    ...buildIlikePredicates(["dispatch_status", "scheduled_date"], query),
    ...buildInPredicate("customer_id", matchingCustomerIds),
    ...buildInPredicate("project_id", matchingProjectIds),
    ...buildInPredicate("estimate_id", matchingEstimateIds)
  ];
  const punchlistPredicates = [
    ...buildIlikePredicates(["title", "details", "status", "due_date"], query),
    ...buildInPredicate("project_id", matchingProjectIds),
    ...buildInPredicate("assignee_person_id", matchingPersonIds)
  ];
  const paymentPredicates: string[] = [];
  const peoplePredicates = [
    ...buildIlikePredicates(
      [
        "display_name",
        "first_name",
        "last_name",
        "email",
        "phone",
        "job_title",
        "trade"
      ],
      query
    ),
    ...buildInPredicate("vendor_id", matchingVendorIds)
  ];
  const vendorPredicates = buildIlikePredicates(
    ["name", "vendor_type", "primary_contact_name", "email", "phone"],
    query
  );

  const [
    opportunitiesResponse,
    customersResponse,
    projectsResponse,
    appointmentsResponse,
    estimatesResponse,
    contractsResponse,
    invoicesResponse,
    jobsResponse,
    punchlistsResponse,
    paymentsResponse,
    peopleResponse,
    vendorsResponse
  ] = await Promise.all([
    applySearchPredicates(
      supabase
        .from("opportunities")
        .select(
          "id,title,prospect_name,prospect_company_name,email,phone,status,updated_at,customers(name,company_name),projects(id,name)"
        )
        .eq("company_id", organizationId),
      opportunityPredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("customers")
        .select("id,name,company_name,email,phone,city,state_region,updated_at")
        .eq("company_id", organizationId),
      customerPredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("projects")
        .select("id,name,status,updated_at,customers(name,company_name)")
        .eq("company_id", organizationId),
      projectPredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("appointments")
        .select(
          "id,title,appointment_type,starts_at,location,status,opportunities(id,title),customers(name,company_name),projects(id,name),assigned_person:people!appointments_assigned_person_id_fkey(id,display_name)"
        )
        .eq("company_id", organizationId),
      appointmentPredicates
    )
      .order("starts_at", { ascending: true })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("estimates")
        .select(
          "id,reference_number,status,total_amount,updated_at,customers(name,company_name),projects(id,name)"
        )
        .eq("company_id", organizationId),
      estimatePredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("contracts")
        .select(
          "id,title,status,updated_at,customers(name,company_name),projects(id,name),estimates(reference_number)"
        )
        .eq("company_id", organizationId),
      contractPredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("invoices")
        .select(
          "id,reference_number,status,total_amount,balance_due_amount,due_date,updated_at,customers(name,company_name),projects(id,name),jobs(id)"
        )
        .eq("company_id", organizationId),
      invoicePredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("jobs")
        .select(
          "id,dispatch_status,scheduled_date,updated_at,customers(name,company_name),projects(id,name),estimates(reference_number)"
        )
        .eq("company_id", organizationId),
      jobPredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("punchlist_items")
        .select(
          "id,title,details,due_date,status,updated_at,projects(id,name),jobs(id,dispatch_status),assignee:people!punchlist_items_assignee_person_id_fkey(id,display_name)"
        )
        .eq("company_id", organizationId),
      punchlistPredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("payments")
        .select(
          "id,amount,status,payment_date,payment_method,payment_source,payer_email,reference,created_at,invoices(id,reference_number,customers(id,name,company_name),projects(id,name))"
        )
        .eq("company_id", organizationId),
      paymentPredicates
    )
      .order("created_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("people")
        .select(
          "id,display_name,first_name,last_name,email,phone,job_title,trade,is_active,updated_at,vendors(id,name)"
        )
        .eq("company_id", organizationId),
      peoplePredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit),
    applySearchPredicates(
      supabase
        .from("vendors")
        .select(
          "id,name,vendor_type,primary_contact_name,email,phone,is_active,updated_at"
        )
        .eq("company_id", organizationId),
      vendorPredicates
    )
      .order("updated_at", { ascending: false })
      .limit(perEntityCandidateLimit)
  ]);

  const responses = [
    opportunitiesResponse,
    customersResponse,
    projectsResponse,
    appointmentsResponse,
    estimatesResponse,
    contractsResponse,
    invoicesResponse,
    jobsResponse,
    punchlistsResponse,
    paymentsResponse,
    peopleResponse,
    vendorsResponse
  ];
  const failedResponse = responses.find((response) => response.error);

  if (failedResponse?.error) {
    throw new Error(
      `Unable to search contractor records: ${failedResponse.error.message}`
    );
  }

  const opportunityRows = (opportunitiesResponse.data ??
    []) as unknown as OpportunitySearchRow[];
  const customerRows = (customersResponse.data ?? []) as CustomerSearchRow[];
  const projectRows = (projectsResponse.data ??
    []) as unknown as ProjectSearchRow[];
  const appointmentRows = (appointmentsResponse.data ??
    []) as unknown as AppointmentSearchRow[];
  const estimateRows = (estimatesResponse.data ??
    []) as unknown as EstimateSearchRow[];
  const contractRows = (contractsResponse.data ??
    []) as unknown as ContractSearchRow[];
  const invoiceRows = (invoicesResponse.data ??
    []) as unknown as InvoiceSearchRow[];
  const jobRows = (jobsResponse.data ?? []) as unknown as JobSearchRow[];
  const punchlistRows = (punchlistsResponse.data ??
    []) as unknown as PunchlistSearchRow[];
  const paymentRows = (paymentsResponse.data ??
    []) as unknown as PaymentSearchRow[];
  const personRows = (peopleResponse.data ??
    []) as unknown as PersonSearchRow[];
  const vendorRows = (vendorsResponse.data ?? []) as VendorSearchRow[];

  const opportunityResults = sortAndTrim(
    opportunityRows
      .map((row): GlobalSearchResult | null => {
        const customer = firstRelated(row.customers);
        const project = firstRelated(row.projects);
        const title = row.title || row.prospect_name;
        const subtitle =
          customer?.name ??
          row.prospect_company_name ??
          project?.name ??
          "Opportunity record";
        const meta = `${labelize(row.status)} · ${formatDate(row.updated_at)}`;
        const score = scoreMatch({
          title,
          subtitle,
          meta: buildSearchText(
            meta,
            row.prospect_name,
            row.prospect_company_name,
            row.email,
            row.phone,
            project?.name
          ),
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "opportunity" as const,
          title,
          subtitle,
          meta,
          href: `/leads/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const customerResults = sortAndTrim(
    customerRows
      .map((row): GlobalSearchResult | null => {
        const subtitle =
          row.company_name ??
          (buildSearchText(row.city, row.state_region) || "Customer account");
        const meta =
          buildSearchText(row.email, row.phone) || formatDate(row.updated_at);
        const score = scoreMatch({
          title: row.name,
          subtitle,
          meta: buildSearchText(
            meta,
            row.company_name,
            row.city,
            row.state_region
          ),
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "customer" as const,
          title: row.name,
          subtitle,
          meta,
          href: `/customers/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const projectResults = sortAndTrim(
    projectRows
      .map((row): GlobalSearchResult | null => {
        const customer = firstRelated(row.customers);
        const subtitle =
          customer?.name ?? customer?.company_name ?? "Project workspace";
        const meta = `${labelize(row.status)} · ${formatDate(row.updated_at)}`;
        const score = scoreMatch({
          title: row.name,
          subtitle,
          meta: buildSearchText(meta, customer?.company_name),
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "project" as const,
          title: row.name,
          subtitle,
          meta,
          href: `/projects/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const appointmentResults = sortAndTrim(
    appointmentRows
      .map((row): GlobalSearchResult | null => {
        const opportunity = firstRelated(row.opportunities);
        const customer = firstRelated(row.customers);
        const project = firstRelated(row.projects);
        const assignedPerson = firstRelated(row.assigned_person);
        const subtitle =
          project?.name ??
          customer?.name ??
          opportunity?.title ??
          "Internal appointment";
        const meta = buildSearchText(
          labelize(row.status),
          labelize(row.appointment_type),
          formatDate(row.starts_at),
          row.location,
          assignedPerson?.display_name
        );
        const score = scoreMatch({
          title: row.title,
          subtitle,
          meta,
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "appointment" as const,
          title: row.title,
          subtitle,
          meta,
          href: `/appointments/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const estimateResults = sortAndTrim(
    estimateRows
      .map((row): GlobalSearchResult | null => {
        const customer = firstRelated(row.customers);
        const project = firstRelated(row.projects);
        const subtitle = `${customer?.name ?? "Unknown customer"} · ${project?.name ?? "Unknown project"}`;
        const meta = `${labelize(row.status)} · ${formatCurrency(row.total_amount)}`;
        const score = scoreMatch({
          title: row.reference_number,
          subtitle,
          meta,
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "estimate" as const,
          title: row.reference_number,
          subtitle,
          meta,
          href: `/estimates/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const contractResults = sortAndTrim(
    contractRows
      .map((row): GlobalSearchResult | null => {
        const customer = firstRelated(row.customers);
        const project = firstRelated(row.projects);
        const estimate = firstRelated(row.estimates);
        const subtitle = `${customer?.name ?? "Unknown customer"} · ${project?.name ?? "Unknown project"}`;
        const meta =
          buildSearchText(labelize(row.status), estimate?.reference_number) ||
          formatDate(row.updated_at);
        const score = scoreMatch({
          title: row.title,
          subtitle,
          meta,
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "contract" as const,
          title: row.title,
          subtitle,
          meta,
          href: `/contracts/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const invoiceResults = sortAndTrim(
    invoiceRows
      .map((row): GlobalSearchResult | null => {
        const customer = firstRelated(row.customers);
        const project = firstRelated(row.projects);
        const job = firstRelated(row.jobs);
        const subtitle = `${customer?.name ?? "Unknown customer"} · ${project?.name ?? "Unknown project"}`;
        const meta = `${labelize(row.status)} · ${formatCurrency(row.balance_due_amount)} due`;
        const score = scoreMatch({
          title: row.reference_number,
          subtitle,
          meta: buildSearchText(meta, row.due_date, job?.id),
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "invoice" as const,
          title: row.reference_number,
          subtitle,
          meta,
          href: `/invoices/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const jobResults = sortAndTrim(
    jobRows
      .map((row): GlobalSearchResult | null => {
        const customer = firstRelated(row.customers);
        const project = firstRelated(row.projects);
        const estimate = firstRelated(row.estimates);
        const title = project?.name ?? `Job ${row.id.slice(0, 8)}`;
        const subtitle = `${customer?.name ?? "Unknown customer"} · ${estimate?.reference_number ?? "Job record"}`;
        const meta = buildSearchText(
          labelize(row.dispatch_status),
          row.scheduled_date ? formatDate(row.scheduled_date) : "No schedule"
        );
        const score = scoreMatch({
          title,
          subtitle,
          meta,
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "job" as const,
          title,
          subtitle,
          meta,
          href: `/jobs/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const punchlistResults = sortAndTrim(
    punchlistRows
      .map((row): GlobalSearchResult | null => {
        const project = firstRelated(row.projects);
        const job = firstRelated(row.jobs);
        const assignee = firstRelated(row.assignee);
        const subtitle = `${project?.name ?? "Unknown project"} | ${assignee?.display_name ?? "Unassigned"}`;
        const meta = buildSearchText(
          labelize(row.status),
          row.due_date ? `Due ${formatDate(row.due_date)}` : "No due date",
          job?.id ? `Job ${job.id.slice(0, 8)}` : "Project-level item"
        );
        const score = scoreMatch({
          title: row.title,
          subtitle,
          meta: buildSearchText(meta, row.details),
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "punchlist" as const,
          title: row.title,
          subtitle,
          meta,
          href: `/punchlists/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const paymentResults = sortAndTrim(
    paymentRows
      .map((row): GlobalSearchResult | null => {
        const invoice = firstRelated(row.invoices);
        const customer = firstRelated(invoice?.customers);
        const project = firstRelated(invoice?.projects);
        const invoiceRef = invoice?.reference_number ?? "Payment activity";
        const subtitle = `${customer?.name ?? "Unknown customer"} · ${project?.name ?? "Invoice chain"}`;
        const meta = `${labelize(row.status)} · ${formatCurrency(row.amount)} · ${labelize(row.payment_source)}`;
        const score = scoreMatch({
          title: invoiceRef,
          subtitle,
          meta: buildSearchText(
            meta,
            row.reference,
            row.payment_method,
            row.payer_email,
            row.payment_date
          ),
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "payment" as const,
          title: invoiceRef,
          subtitle,
          meta,
          href: invoice?.id ? `/invoices/${invoice.id}` : "/payments",
          score
        };
      })
      .filter(notNull)
  );

  const personResults = sortAndTrim(
    personRows
      .map((row): GlobalSearchResult | null => {
        const vendor = firstRelated(row.vendors);
        const subtitle =
          buildSearchText(row.job_title, row.trade, vendor?.name) ||
          "Workforce person";
        const meta = buildSearchText(
          row.email,
          row.phone,
          row.is_active ? "Active" : "Inactive"
        );
        const score = scoreMatch({
          title: row.display_name,
          subtitle,
          meta: buildSearchText(meta, row.first_name, row.last_name),
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "person" as const,
          title: row.display_name,
          subtitle,
          meta,
          href: `/people/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const vendorResults = sortAndTrim(
    vendorRows
      .map((row): GlobalSearchResult | null => {
        const subtitle = row.primary_contact_name ?? row.vendor_type;
        const meta = buildSearchText(
          row.email,
          row.phone,
          row.is_active ? "Active" : "Inactive"
        );
        const score = scoreMatch({
          title: row.name,
          subtitle,
          meta: buildSearchText(meta, row.vendor_type),
          tokens
        });

        if (score === null) {
          return null;
        }

        return {
          id: row.id,
          type: "vendor" as const,
          title: row.name,
          subtitle,
          meta,
          href: `/vendors/${row.id}`,
          score
        };
      })
      .filter(notNull)
  );

  const groups = [
    {
      key: "opportunity",
      label: groupLabels.opportunity,
      results: opportunityResults
    },
    { key: "customer", label: groupLabels.customer, results: customerResults },
    { key: "project", label: groupLabels.project, results: projectResults },
    {
      key: "appointment",
      label: groupLabels.appointment,
      results: appointmentResults
    },
    { key: "estimate", label: groupLabels.estimate, results: estimateResults },
    { key: "contract", label: groupLabels.contract, results: contractResults },
    { key: "invoice", label: groupLabels.invoice, results: invoiceResults },
    { key: "job", label: groupLabels.job, results: jobResults },
    {
      key: "punchlist",
      label: groupLabels.punchlist,
      results: punchlistResults
    },
    { key: "payment", label: groupLabels.payment, results: paymentResults },
    { key: "person", label: groupLabels.person, results: personResults },
    { key: "vendor", label: groupLabels.vendor, results: vendorResults }
  ].filter((group): group is GlobalSearchGroup => group.results.length > 0);

  return {
    query,
    totalCount: groups.reduce((sum, group) => sum + group.results.length, 0),
    groups
  };
}
