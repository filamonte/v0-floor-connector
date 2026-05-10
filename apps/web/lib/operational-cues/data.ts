import "server-only";

import { cache } from "react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  deriveOperationalCues,
  filterOperationalCuesForProject,
  filterOperationalCuesForSubject,
  groupOperationalCuesBySubject,
  type OperationalCueContractSource,
  type OperationalCueEstimateSource,
  type OperationalCueInvoiceSource,
  type OperationalCueJobSource
} from "./derive";
import {
  ensureDefaultOperationalCueRules,
  listOperationalCueRules
} from "./rules";
import {
  listOrganizationResponsibilityDefaults,
  toOperationalCueResponsibilityDefaults
} from "./responsibility-defaults";

type SupabaseRelation<T> = T | T[] | null;

type EstimateCueRow = {
  id: string;
  company_id: string;
  project_id: string | null;
  reference_number: string;
  status: string;
  sent_at: string | null;
  updated_at: string;
  customers: SupabaseRelation<{ name: string | null }>;
  projects: SupabaseRelation<{ id: string | null; name: string | null }>;
};

type ContractCueRow = {
  id: string;
  company_id: string;
  project_id: string | null;
  title: string;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  customer_viewed_at: string | null;
  updated_at: string;
  customers: SupabaseRelation<{ name: string | null }>;
  projects: SupabaseRelation<{ id: string | null; name: string | null }>;
};

type InvoiceCueRow = {
  id: string;
  company_id: string;
  project_id: string | null;
  reference_number: string;
  status: string;
  workflow_role: string | null;
  issue_date: string | null;
  due_date: string | null;
  balance_due_amount: string | number;
  updated_at: string;
  customers: SupabaseRelation<{ name: string | null }>;
  projects: SupabaseRelation<{ id: string | null; name: string | null }>;
};

type JobCueRow = {
  id: string;
  company_id: string;
  project_id: string | null;
  dispatch_status: string;
  scheduled_date: string | null;
  scheduled_start_at: string | null;
  crew_vendor_id: string | null;
  updated_at: string;
  customers: SupabaseRelation<{ name: string | null }>;
  projects: SupabaseRelation<{
    name: string | null;
    id: string | null;
    commercial_readiness_status: string | null;
    ready_to_schedule_at: string | null;
  }>;
};

type JobAssignmentCountRow = {
  job_id: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function isEstimateCueRow(value: unknown): value is EstimateCueRow {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.company_id === "string" &&
    (value.project_id === null || typeof value.project_id === "string") &&
    typeof value.reference_number === "string" &&
    typeof value.status === "string" &&
    (value.sent_at === null || typeof value.sent_at === "string") &&
    typeof value.updated_at === "string"
  );
}

function isContractCueRow(value: unknown): value is ContractCueRow {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.company_id === "string" &&
    (value.project_id === null || typeof value.project_id === "string") &&
    typeof value.title === "string" &&
    typeof value.status === "string" &&
    (value.sent_at === null || typeof value.sent_at === "string") &&
    (value.viewed_at === null || typeof value.viewed_at === "string") &&
    (value.customer_viewed_at === null ||
      typeof value.customer_viewed_at === "string") &&
    typeof value.updated_at === "string"
  );
}

function isInvoiceCueRow(value: unknown): value is InvoiceCueRow {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.company_id === "string" &&
    (value.project_id === null || typeof value.project_id === "string") &&
    typeof value.reference_number === "string" &&
    typeof value.status === "string" &&
    (value.workflow_role === null || typeof value.workflow_role === "string") &&
    (value.issue_date === null || typeof value.issue_date === "string") &&
    (value.due_date === null || typeof value.due_date === "string") &&
    (typeof value.balance_due_amount === "string" ||
      typeof value.balance_due_amount === "number") &&
    typeof value.updated_at === "string"
  );
}

function isJobCueRow(value: unknown): value is JobCueRow {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.company_id === "string" &&
    (value.project_id === null || typeof value.project_id === "string") &&
    typeof value.dispatch_status === "string" &&
    (value.scheduled_date === null || typeof value.scheduled_date === "string") &&
    (value.scheduled_start_at === null ||
      typeof value.scheduled_start_at === "string") &&
    (value.crew_vendor_id === null || typeof value.crew_vendor_id === "string") &&
    typeof value.updated_at === "string"
  );
}

function isJobAssignmentCountRow(value: unknown): value is JobAssignmentCountRow {
  return isObject(value) && typeof value.job_id === "string";
}

function mapEstimateRow(row: EstimateCueRow): OperationalCueEstimateSource {
  const project = firstRelation(row.projects);

  return {
    id: row.id,
    organizationId: row.company_id,
    referenceNumber: row.reference_number,
    status: row.status,
    sentAt: row.sent_at,
    updatedAt: row.updated_at,
    customer: firstRelation(row.customers),
    project: project ? { id: project.id ?? row.project_id, name: project.name } : null
  };
}

function mapContractRow(row: ContractCueRow): OperationalCueContractSource {
  const project = firstRelation(row.projects);

  return {
    id: row.id,
    organizationId: row.company_id,
    title: row.title,
    status: row.status,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    customerViewedAt: row.customer_viewed_at,
    updatedAt: row.updated_at,
    customer: firstRelation(row.customers),
    project: project ? { id: project.id ?? row.project_id, name: project.name } : null
  };
}

function mapInvoiceRow(row: InvoiceCueRow): OperationalCueInvoiceSource {
  const project = firstRelation(row.projects);

  return {
    id: row.id,
    organizationId: row.company_id,
    referenceNumber: row.reference_number,
    status: row.status,
    workflowRole: row.workflow_role,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    balanceDueAmount: row.balance_due_amount,
    updatedAt: row.updated_at,
    customer: firstRelation(row.customers),
    project: project ? { id: project.id ?? row.project_id, name: project.name } : null
  };
}

function mapJobRow(
  row: JobCueRow,
  assignmentCountsByJobId: Map<string, number>
): OperationalCueJobSource {
  const project = firstRelation(row.projects);

  return {
    id: row.id,
    organizationId: row.company_id,
    dispatchStatus: row.dispatch_status,
    scheduledDate: row.scheduled_date,
    scheduledStartAt: row.scheduled_start_at,
    crewVendorId: row.crew_vendor_id,
    updatedAt: row.updated_at,
    assignmentCount: assignmentCountsByJobId.get(row.id) ?? 0,
    projectReadinessStatus: project?.commercial_readiness_status ?? null,
    projectReadyToScheduleAt: project?.ready_to_schedule_at ?? null,
    customer: firstRelation(row.customers),
    project: project ? { ...project, id: project.id ?? row.project_id } : null
  };
}

type CueQueryScope =
  | { kind: "dashboard" }
  | { kind: "subject"; subjectType: "estimate" | "contract" | "invoice" | "job"; subjectId: string }
  | { kind: "project"; projectId: string };

function appliesToSubject(
  scope: CueQueryScope,
  subjectType: "estimate" | "contract" | "invoice" | "job"
) {
  return scope.kind === "dashboard" || scope.kind === "project" || scope.subjectType === subjectType;
}

async function loadOperationalCues(input: {
  organizationId: string;
  scope: CueQueryScope;
}) {
  await ensureDefaultOperationalCueRules({
    organizationId: input.organizationId
  });

  const supabase = await getSupabaseServerClient();
  const [rules, responsibilityDefaults] = await Promise.all([
    listOperationalCueRules(input.organizationId),
    listOrganizationResponsibilityDefaults(input.organizationId)
  ]);

  const estimateRows: OperationalCueEstimateSource[] = [];
  const contractRows: OperationalCueContractSource[] = [];
  const invoiceRows: OperationalCueInvoiceSource[] = [];
  const jobRows: OperationalCueJobSource[] = [];

  if (appliesToSubject(input.scope, "estimate")) {
    let query = supabase
      .from("estimates")
      .select(
        "id, company_id, project_id, reference_number, status, sent_at, updated_at, customers(name), projects(id, name)"
      )
      .eq("company_id", input.organizationId)
      .in("status", ["sent"])
      .order("updated_at", { ascending: false });

    if (input.scope.kind === "subject") {
      query = query.eq("id", input.scope.subjectId);
    } else if (input.scope.kind === "project") {
      query = query.eq("project_id", input.scope.projectId);
    } else {
      query = query.limit(50);
    }

    const response = await query;
    if (response.error) {
      throw new Error(`Unable to load estimate operational cues: ${response.error.message}`);
    }

    estimateRows.push(
      ...(Array.isArray(response.data) ? (response.data as unknown[]) : [])
        .filter(isEstimateCueRow)
        .map(mapEstimateRow)
    );
  }

  if (appliesToSubject(input.scope, "contract")) {
    let query = supabase
      .from("contracts")
      .select(
        "id, company_id, project_id, title, status, sent_at, viewed_at, customer_viewed_at, updated_at, customers(name), projects(id, name)"
      )
      .eq("company_id", input.organizationId)
      .in("status", ["sent", "viewed"])
      .order("updated_at", { ascending: false });

    if (input.scope.kind === "subject") {
      query = query.eq("id", input.scope.subjectId);
    } else if (input.scope.kind === "project") {
      query = query.eq("project_id", input.scope.projectId);
    } else {
      query = query.limit(50);
    }

    const response = await query;
    if (response.error) {
      throw new Error(`Unable to load contract operational cues: ${response.error.message}`);
    }

    contractRows.push(
      ...(Array.isArray(response.data) ? (response.data as unknown[]) : [])
        .filter(isContractCueRow)
        .map(mapContractRow)
    );
  }

  if (appliesToSubject(input.scope, "invoice")) {
    let query = supabase
      .from("invoices")
      .select(
        "id, company_id, project_id, reference_number, status, workflow_role, issue_date, due_date, balance_due_amount, updated_at, customers(name), projects(id, name)"
      )
      .eq("company_id", input.organizationId)
      .not("status", "in", '("paid","void")')
      .order("updated_at", { ascending: false });

    if (input.scope.kind === "subject") {
      query = query.eq("id", input.scope.subjectId);
    } else if (input.scope.kind === "project") {
      query = query.eq("project_id", input.scope.projectId);
    } else {
      query = query.limit(75);
    }

    const response = await query;
    if (response.error) {
      throw new Error(`Unable to load invoice operational cues: ${response.error.message}`);
    }

    invoiceRows.push(
      ...(Array.isArray(response.data) ? (response.data as unknown[]) : [])
        .filter(isInvoiceCueRow)
        .map(mapInvoiceRow)
    );
  }

  if (appliesToSubject(input.scope, "job")) {
    let query = supabase
      .from("jobs")
      .select(
        "id, company_id, project_id, dispatch_status, scheduled_date, scheduled_start_at, crew_vendor_id, updated_at, customers(name), projects(id, name, commercial_readiness_status, ready_to_schedule_at)"
      )
      .eq("company_id", input.organizationId)
      .in("dispatch_status", ["unscheduled", "scheduled"])
      .order("updated_at", { ascending: false });

    if (input.scope.kind === "subject") {
      query = query.eq("id", input.scope.subjectId);
    } else if (input.scope.kind === "project") {
      query = query.eq("project_id", input.scope.projectId);
    } else {
      query = query.limit(75);
    }

    const response = await query;
    if (response.error) {
      throw new Error(`Unable to load job operational cues: ${response.error.message}`);
    }

    const rawJobRows: unknown[] = Array.isArray(response.data)
      ? response.data
      : [];
    const validJobRows = rawJobRows.filter(isJobCueRow);
    const jobIds = validJobRows.map((job) => job.id);
    const assignmentsResponse =
      jobIds.length > 0
        ? await supabase
            .from("job_assignments")
            .select("job_id")
            .eq("company_id", input.organizationId)
            .in("job_id", jobIds)
        : null;

    if (assignmentsResponse?.error) {
      throw new Error(
        `Unable to load job assignment operational cues: ${assignmentsResponse.error.message}`
      );
    }

    const assignmentCountsByJobId = new Map<string, number>();
    const rawAssignmentRows: unknown[] = Array.isArray(assignmentsResponse?.data)
      ? assignmentsResponse.data
      : [];
    const assignmentRows = rawAssignmentRows.filter(isJobAssignmentCountRow);

    for (const assignment of assignmentRows) {
      assignmentCountsByJobId.set(
        assignment.job_id,
        (assignmentCountsByJobId.get(assignment.job_id) ?? 0) + 1
      );
    }

    jobRows.push(...validJobRows.map((job) => mapJobRow(job, assignmentCountsByJobId)));
  }

  return {
    cues: deriveOperationalCues({
      organizationId: input.organizationId,
      now: new Date(),
      rules,
      responsibilityDefaults:
        toOperationalCueResponsibilityDefaults(responsibilityDefaults),
      estimates: estimateRows,
      contracts: contractRows,
      invoices: invoiceRows,
      jobs: jobRows
    }),
    rules
  };
}

export const getOperationalCueDashboard = cache(
  async (input: { organizationId: string }) => {
    const { cues, rules } = await loadOperationalCues({
      organizationId: input.organizationId,
      scope: { kind: "dashboard" }
    });

    return {
      cues,
      groups: groupOperationalCuesBySubject(cues),
      rules
    };
  }
);

export const getOperationalCuesForSubject = cache(
  async (input: {
    organizationId: string;
    subjectType: "estimate" | "contract" | "invoice" | "job";
    subjectId: string;
  }) => {
    const { cues } = await loadOperationalCues({
      organizationId: input.organizationId,
      scope: {
        kind: "subject",
        subjectType: input.subjectType,
        subjectId: input.subjectId
      }
    });

    return filterOperationalCuesForSubject(cues, input);
  }
);

export const getOperationalCuesForProject = cache(
  async (input: { organizationId: string; projectId: string }) => {
    const { cues } = await loadOperationalCues({
      organizationId: input.organizationId,
      scope: { kind: "project", projectId: input.projectId }
    });

    return filterOperationalCuesForProject(cues, {
      projectId: input.projectId
    });
  }
);
