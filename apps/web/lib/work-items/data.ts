import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  CustomerId,
  MembershipRole,
  OrganizationId,
  PersonId,
  ProfileId,
  ProjectId,
  WorkItem,
  WorkItemKind,
  WorkItemPriority,
  WorkItemSourceType,
  WorkItemStatus,
  WorkItemVisibility
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import {
  canActOnAssignedWorkItem,
  filterDashboardWorkItems,
  sortWorkItemsForQueue,
  type WorkItemFieldState
} from "./read-model";
import type {
  WorkItemAssignmentInput,
  WorkItemCreateInput,
  WorkItemUpdateInput
} from "./schemas";

type WorkItemScope = {
  userId: ProfileId;
  organizationId: OrganizationId;
  membershipRole: MembershipRole;
};

type WorkItemRow = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  kind: WorkItemKind;
  due_at: string | null;
  assigned_person_id: string | null;
  source_type: WorkItemSourceType | null;
  source_id: string | null;
  customer_id: string | null;
  project_id: string | null;
  link_path: string | null;
  visibility: WorkItemVisibility;
  dedupe_key: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  updated_by: string | null;
  completed_by: string | null;
  completed_at: string | null;
  dismissed_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_person?: WorkItemPersonRelation | WorkItemPersonRelation[] | null;
  customers?: WorkItemCustomerRelation | WorkItemCustomerRelation[] | null;
  projects?: WorkItemProjectRelation | WorkItemProjectRelation[] | null;
};

type WorkItemPersonRelation = {
  id: string;
  display_name: string;
  is_active: boolean;
  is_assignable: boolean;
  membership_user_id: string | null;
};

type WorkItemCustomerRelation = {
  id: string;
  name: string;
  company_name: string | null;
};

type WorkItemProjectRelation = {
  id: string;
  name: string;
  status: string;
};

type SourceTable =
  | "opportunities"
  | "appointments"
  | "customers"
  | "projects"
  | "estimates"
  | "contracts"
  | "change_orders"
  | "jobs"
  | "invoices"
  | "payments"
  | "communication_threads"
  | "notification_events"
  | "workflow_error_events";

type SourceConfig = {
  table: SourceTable;
  organizationColumn: "company_id" | "organization_id";
  linkPath: (id: string) => string;
};

export type WorkItemListItem = WorkItem & {
  assignedPerson: {
    id: PersonId;
    displayName: string;
    isActive: boolean;
    isAssignable: boolean;
    membershipUserId: ProfileId | null;
  } | null;
  createdByPerson: {
    id: PersonId;
    displayName: string;
    isActive: boolean;
    isAssignable: boolean;
    membershipUserId: ProfileId | null;
  } | null;
  customer: {
    id: CustomerId;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: ProjectId;
    name: string;
    status: string;
  } | null;
};

export type CurrentUserWorkItemPerson = {
  id: PersonId;
  displayName: string;
  isActive: boolean;
  isAssignable: boolean;
  membershipUserId: ProfileId | null;
};

const workItemSelect = `
  id,
  company_id,
  title,
  description,
  status,
  priority,
  kind,
  due_at,
  assigned_person_id,
  source_type,
  source_id,
  customer_id,
  project_id,
  link_path,
  visibility,
  dedupe_key,
  metadata,
  created_by,
  updated_by,
  completed_by,
  completed_at,
  dismissed_at,
  created_at,
  updated_at,
  assigned_person:people!work_items_assigned_person_company_fkey (
    id,
    display_name,
    is_active,
    is_assignable,
    membership_user_id
  ),
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

const sourceConfigs: Record<WorkItemSourceType, SourceConfig> = {
  opportunity: {
    table: "opportunities",
    organizationColumn: "company_id",
    linkPath: (id) => `/leads/${id}`
  },
  appointment: {
    table: "appointments",
    organizationColumn: "company_id",
    linkPath: (id) => `/appointments/${id}`
  },
  customer: {
    table: "customers",
    organizationColumn: "company_id",
    linkPath: (id) => `/customers/${id}`
  },
  project: {
    table: "projects",
    organizationColumn: "company_id",
    linkPath: (id) => `/projects/${id}`
  },
  estimate: {
    table: "estimates",
    organizationColumn: "company_id",
    linkPath: (id) => `/estimates/${id}`
  },
  contract: {
    table: "contracts",
    organizationColumn: "company_id",
    linkPath: (id) => `/contracts/${id}`
  },
  change_order: {
    table: "change_orders",
    organizationColumn: "company_id",
    linkPath: (id) => `/change-orders/${id}`
  },
  job: {
    table: "jobs",
    organizationColumn: "company_id",
    linkPath: (id) => `/jobs/${id}`
  },
  invoice: {
    table: "invoices",
    organizationColumn: "company_id",
    linkPath: (id) => `/invoices/${id}`
  },
  payment: {
    table: "payments",
    organizationColumn: "company_id",
    linkPath: () => "/payments"
  },
  communication_thread: {
    table: "communication_threads",
    organizationColumn: "company_id",
    linkPath: (id) => `/communications?threadId=${id}`
  },
  notification_event: {
    table: "notification_events",
    organizationColumn: "company_id",
    linkPath: () => "/dashboard"
  },
  workflow_error_event: {
    table: "workflow_error_events",
    organizationColumn: "organization_id",
    linkPath: () => "/settings/admin"
  }
};

async function getWorkItemScope(
  next = "/dashboard"
): Promise<WorkItemScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    membershipRole: organizationContext.membership.role
  };
}

export async function requireWorkItemScope(next = "/dashboard") {
  const scope = await getWorkItemScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for internal work items yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

function mapWorkItem(row: WorkItemRow): WorkItemListItem {
  const assignedPerson = unwrapOne(row.assigned_person);
  const customer = unwrapOne(row.customers);
  const project = unwrapOne(row.projects);

  return {
    id: row.id,
    organizationId: row.company_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    kind: row.kind,
    dueAt: row.due_at,
    assignedPersonId: row.assigned_person_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    linkPath: row.link_path,
    visibility: row.visibility,
    dedupeKey: row.dedupe_key,
    metadata: row.metadata,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    completedByUserId: row.completed_by,
    completedAt: row.completed_at,
    dismissedAt: row.dismissed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignedPerson: assignedPerson
      ? {
          id: assignedPerson.id,
          displayName: assignedPerson.display_name,
          isActive: assignedPerson.is_active,
          isAssignable: assignedPerson.is_assignable,
          membershipUserId: assignedPerson.membership_user_id
        }
      : null,
    createdByPerson: null,
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          companyName: customer.company_name
        }
      : null,
    project: project
      ? {
          id: project.id,
          name: project.name,
          status: project.status
        }
      : null
  };
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function mapWorkItemPersonRelation(
  row: WorkItemPersonRelation
): WorkItemListItem["createdByPerson"] {
  return {
    id: row.id,
    displayName: row.display_name,
    isActive: row.is_active,
    isAssignable: row.is_assignable,
    membershipUserId: row.membership_user_id
  };
}

async function hydrateWorkItemRequesterPeople(
  organizationId: string,
  workItems: WorkItemListItem[]
) {
  const requesterUserIds = Array.from(
    new Set(
      workItems
        .map((workItem) => workItem.createdByUserId)
        .filter((value): value is ProfileId => Boolean(value))
    )
  );

  if (requesterUserIds.length === 0) {
    return workItems;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, display_name, is_active, is_assignable, membership_user_id")
    .eq("company_id", organizationId)
    .in("membership_user_id", requesterUserIds);

  if (response.error) {
    throw new Error(
      `Unable to load work item requesters: ${response.error.message}`
    );
  }

  const peopleByUserId = new Map(
    ((response.data ?? []) as WorkItemPersonRelation[])
      .filter((person) => person.membership_user_id)
      .map((person) => [
        person.membership_user_id as ProfileId,
        mapWorkItemPersonRelation(person)
      ])
  );

  return workItems.map((workItem) => ({
    ...workItem,
    createdByPerson: workItem.createdByUserId
      ? (peopleByUserId.get(workItem.createdByUserId) ?? null)
      : null
  }));
}

async function assertRecordBelongsToCompany(input: {
  table: SourceTable;
  organizationColumn: "company_id" | "organization_id";
  recordId: string;
  organizationId: string;
  label: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from(input.table)
    .select("id")
    .eq(input.organizationColumn, input.organizationId)
    .eq("id", input.recordId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to validate ${input.label}: ${response.error.message}`
    );
  }

  if (!response.data) {
    throw new Error(`${input.label} must belong to the active organization.`);
  }
}

async function assertScopedActiveAssignablePerson(
  organizationId: string,
  personId: string | null
) {
  if (!personId) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, is_active, is_assignable")
    .eq("company_id", organizationId)
    .eq("id", personId)
    .maybeSingle();
  const person = response.data as {
    id?: string;
    is_active?: boolean;
    is_assignable?: boolean;
  } | null;

  if (response.error) {
    throw new Error(
      `Unable to validate the assigned person: ${response.error.message}`
    );
  }

  if (!person?.id) {
    throw new Error("Assigned person must belong to the active organization.");
  }

  if (!person.is_active || !person.is_assignable) {
    throw new Error("Assigned person must be active and assignable.");
  }
}

async function validateCommonLinks(input: {
  organizationId: string;
  assignedPersonId: string | null;
  customerId: string | null;
  projectId: string | null;
}) {
  await Promise.all([
    assertScopedActiveAssignablePerson(
      input.organizationId,
      input.assignedPersonId
    ),
    input.customerId
      ? assertRecordBelongsToCompany({
          table: "customers",
          organizationColumn: "company_id",
          recordId: input.customerId,
          organizationId: input.organizationId,
          label: "Customer"
        })
      : Promise.resolve(),
    input.projectId
      ? assertRecordBelongsToCompany({
          table: "projects",
          organizationColumn: "company_id",
          recordId: input.projectId,
          organizationId: input.organizationId,
          label: "Project"
        })
      : Promise.resolve()
  ]);
}

async function validateSourceLink(input: {
  organizationId: string;
  sourceType: WorkItemSourceType | null;
  sourceId: string | null;
}) {
  if (!input.sourceType && !input.sourceId) {
    return null;
  }

  if (!input.sourceType || !input.sourceId) {
    throw new Error("Source type and source id must be provided together.");
  }

  const config = sourceConfigs[input.sourceType];

  await assertRecordBelongsToCompany({
    table: config.table,
    organizationColumn: config.organizationColumn,
    recordId: input.sourceId,
    organizationId: input.organizationId,
    label: "Source record"
  });

  return {
    linkPath: config.linkPath(input.sourceId)
  };
}

async function getScopedWorkItem(workItemId: string, scope: WorkItemScope) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .select(workItemSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", workItemId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load work item: ${response.error.message}`);
  }

  return response.data ? mapWorkItem(response.data as WorkItemRow) : null;
}

function mapCurrentUserPerson(
  row: WorkItemPersonRelation
): CurrentUserWorkItemPerson {
  return {
    id: row.id,
    displayName: row.display_name,
    isActive: row.is_active,
    isAssignable: row.is_assignable,
    membershipUserId: row.membership_user_id
  };
}

export async function getCurrentUserWorkItemPerson(
  next = "/field/work-items"
): Promise<CurrentUserWorkItemPerson | null> {
  const scope = await requireWorkItemScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, display_name, is_active, is_assignable, membership_user_id")
    .eq("company_id", scope.organizationId)
    .eq("membership_user_id", scope.userId)
    .eq("is_active", true)
    .eq("is_assignable", true)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to load your linked people record: ${response.error.message}`
    );
  }

  return response.data
    ? mapCurrentUserPerson(response.data as WorkItemPersonRelation)
    : null;
}

export const listWorkItems = cache(
  async (input?: {
    status?: WorkItemStatus;
    assignedPersonId?: string | null;
    limit?: number;
  }) => {
    const scope = await requireWorkItemScope("/dashboard");
    const supabase = await getSupabaseServerClient();
    let query = supabase
      .from("work_items")
      .select(workItemSelect)
      .eq("company_id", scope.organizationId)
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (input?.status) {
      query = query.eq("status", input.status);
    }

    if (input?.assignedPersonId) {
      query = query.eq("assigned_person_id", input.assignedPersonId);
    }

    if (input?.limit) {
      query = query.limit(input.limit);
    }

    const response = await query;

    if (response.error) {
      throw new Error(`Unable to load work items: ${response.error.message}`);
    }

    return sortWorkItemsForQueue(
      await hydrateWorkItemRequesterPeople(
        scope.organizationId,
        ((response.data ?? []) as WorkItemRow[]).map(mapWorkItem)
      )
    );
  }
);

export async function listDashboardWorkItems(input?: {
  assignedPersonId?: string | null;
  limit?: number;
}) {
  const workItems = await listWorkItems({ status: "open" });

  return filterDashboardWorkItems({
    workItems,
    assignedPersonId: input?.assignedPersonId,
    limit: input?.limit ?? 6
  });
}

export async function listAssignedWorkItemsForCurrentUser(
  next = "/field/work-items"
) {
  const scope = await requireWorkItemScope(next);
  const currentPerson = await getCurrentUserWorkItemPerson(next);

  if (!currentPerson) {
    return {
      currentPerson: null,
      workItems: []
    };
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .select(workItemSelect)
    .eq("company_id", scope.organizationId)
    .eq("assigned_person_id", currentPerson.id)
    .in("status", ["open", "completed"])
    .order("status", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load assigned work items: ${response.error.message}`
    );
  }

  return {
    currentPerson,
    workItems: await hydrateWorkItemRequesterPeople(
      scope.organizationId,
      ((response.data ?? []) as WorkItemRow[]).map(mapWorkItem)
    )
  };
}

export async function getAssignedWorkItemForCurrentUser(
  workItemId: string,
  next = "/field/work-items"
) {
  const scope = await requireWorkItemScope(next);
  const currentPerson = await getCurrentUserWorkItemPerson(next);
  const workItem = await getScopedWorkItem(workItemId, scope);

  if (!workItem) {
    return {
      currentPerson,
      workItem: null,
      canAct: false
    };
  }

  const canAct = canActOnAssignedWorkItem({
    workItem,
    currentPersonId: currentPerson?.id ?? null,
    membershipRole: scope.membershipRole
  });

  return {
    currentPerson,
    workItem,
    canAct
  };
}

export async function listWorkItemsForSource(input: {
  sourceType: WorkItemSourceType;
  sourceId: string;
}) {
  const scope = await requireWorkItemScope("/dashboard");
  const source = await validateSourceLink({
    organizationId: scope.organizationId,
    sourceType: input.sourceType,
    sourceId: input.sourceId
  });

  if (!source) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .select(workItemSelect)
    .eq("company_id", scope.organizationId)
    .eq("source_type", input.sourceType)
    .eq("source_id", input.sourceId)
    .order("status", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load linked work items: ${response.error.message}`
    );
  }

  return hydrateWorkItemRequesterPeople(
    scope.organizationId,
    ((response.data ?? []) as WorkItemRow[]).map(mapWorkItem)
  );
}

export async function listWorkItemsForProject(
  projectId: string,
  next = "/dashboard"
) {
  const scope = await requireWorkItemScope(next);

  await assertRecordBelongsToCompany({
    table: "projects",
    organizationColumn: "company_id",
    recordId: projectId,
    organizationId: scope.organizationId,
    label: "Project"
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .select(workItemSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .order("status", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load project work items: ${response.error.message}`
    );
  }

  return hydrateWorkItemRequesterPeople(
    scope.organizationId,
    ((response.data ?? []) as WorkItemRow[]).map(mapWorkItem)
  );
}

export async function listWorkItemsForJob(jobId: string, next = "/dashboard") {
  const scope = await requireWorkItemScope(next);
  const source = await validateSourceLink({
    organizationId: scope.organizationId,
    sourceType: "job",
    sourceId: jobId
  });

  if (!source) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .select(workItemSelect)
    .eq("company_id", scope.organizationId)
    .eq("source_type", "job")
    .eq("source_id", jobId)
    .order("status", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load job work items: ${response.error.message}`);
  }

  return hydrateWorkItemRequesterPeople(
    scope.organizationId,
    ((response.data ?? []) as WorkItemRow[]).map(mapWorkItem)
  );
}

export async function createWorkItem(input: WorkItemCreateInput) {
  const scope = await requireWorkItemScope("/dashboard");
  const source = await validateSourceLink({
    organizationId: scope.organizationId,
    sourceType: input.sourceType,
    sourceId: input.sourceId
  });

  await validateCommonLinks({
    organizationId: scope.organizationId,
    assignedPersonId: input.assignedPersonId,
    customerId: input.customerId,
    projectId: input.projectId
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .insert({
      company_id: scope.organizationId,
      title: input.title,
      description: input.description,
      status: "open",
      priority: input.priority,
      kind: input.kind,
      due_at: input.dueAt,
      assigned_person_id: input.assignedPersonId,
      source_type: input.sourceType,
      source_id: input.sourceId,
      customer_id: input.customerId,
      project_id: input.projectId,
      link_path: input.linkPath ?? source?.linkPath ?? null,
      visibility: "internal",
      dedupe_key: input.dedupeKey,
      metadata: input.metadata,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(workItemSelect)
    .single();

  if (response.error) {
    if (response.error.code === "23505" && input.dedupeKey) {
      throw new Error("A work item already exists for this cue.");
    }

    throw new Error(`Unable to create work item: ${response.error.message}`);
  }

  return mapWorkItem(response.data as WorkItemRow);
}

export async function updateWorkItem(input: WorkItemUpdateInput) {
  const scope = await requireWorkItemScope("/dashboard");
  const existing = await getScopedWorkItem(input.workItemId, scope);

  if (!existing) {
    throw new Error("Work item was not found.");
  }

  if (existing.status !== "open") {
    throw new Error(
      "Completed or dismissed work items cannot be edited in V1."
    );
  }

  await validateCommonLinks({
    organizationId: scope.organizationId,
    assignedPersonId: input.assignedPersonId,
    customerId: input.customerId,
    projectId: input.projectId
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .update({
      title: input.title,
      description: input.description,
      priority: input.priority,
      kind: input.kind,
      due_at: input.dueAt,
      assigned_person_id: input.assignedPersonId,
      customer_id: input.customerId,
      project_id: input.projectId,
      link_path: input.linkPath,
      visibility: "internal",
      metadata: input.metadata,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.workItemId)
    .eq("status", "open")
    .select(workItemSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to update work item: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error("Work item was not found or is no longer open.");
  }

  return mapWorkItem(response.data as WorkItemRow);
}

export async function updateWorkItemAssignment(
  input: WorkItemAssignmentInput & { next?: string }
) {
  const scope = await requireWorkItemScope(input.next ?? "/dashboard");
  const currentPerson = await getCurrentUserWorkItemPerson(
    input.next ?? "/dashboard"
  );
  const existing = await getScopedWorkItem(input.workItemId, scope);

  if (!existing) {
    throw new Error("Work item was not found.");
  }

  if (existing.status !== "open") {
    throw new Error("Only open work items can be reassigned.");
  }

  if (
    !canActOnAssignedWorkItem({
      workItem: existing,
      currentPersonId: currentPerson?.id ?? null,
      membershipRole: scope.membershipRole
    })
  ) {
    throw new Error(
      "Only the current assignee or a manager can reassign this work item."
    );
  }

  await assertScopedActiveAssignablePerson(
    scope.organizationId,
    input.assignedPersonId
  );

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .update({
      assigned_person_id: input.assignedPersonId,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.workItemId)
    .eq("status", "open")
    .select(workItemSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to reassign work item: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error("Work item was not found or is no longer open.");
  }

  return mapWorkItem(response.data as WorkItemRow);
}

export async function completeWorkItem(workItemId: string) {
  const scope = await requireWorkItemScope("/dashboard");
  const existing = await getScopedWorkItem(workItemId, scope);

  if (!existing) {
    throw new Error("Work item was not found.");
  }

  if (existing.status !== "open") {
    throw new Error("Only open work items can be completed.");
  }

  const nowIso = new Date().toISOString();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .update({
      status: "completed",
      completed_at: nowIso,
      completed_by: scope.userId,
      dismissed_at: null,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", workItemId)
    .eq("status", "open")
    .select(workItemSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to complete work item: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error("Work item was not found or is no longer open.");
  }

  return mapWorkItem(response.data as WorkItemRow);
}

function buildFieldStateMetadata(input: {
  existing: Record<string, unknown>;
  fieldState: Exclude<WorkItemFieldState, "completed">;
  blockerReason?: string | null;
}) {
  const metadata = { ...input.existing };

  if (input.fieldState === "blocked") {
    metadata.fieldState = "blocked";
    metadata.blocked = true;

    if (input.blockerReason) {
      metadata.blockerReason = input.blockerReason;
    }

    return metadata;
  }

  metadata.fieldState = input.fieldState;
  delete metadata.blocked;
  delete metadata.blockerReason;

  return metadata;
}

async function requireAssignedWorkItemActionScope(input: {
  workItemId: string;
  next?: string;
}) {
  const scope = await requireWorkItemScope(input.next ?? "/field/work-items");
  const currentPerson = await getCurrentUserWorkItemPerson(
    input.next ?? "/field/work-items"
  );
  const existing = await getScopedWorkItem(input.workItemId, scope);

  if (!existing) {
    throw new Error("Work item was not found.");
  }

  if (
    !canActOnAssignedWorkItem({
      workItem: existing,
      currentPersonId: currentPerson?.id ?? null,
      membershipRole: scope.membershipRole
    })
  ) {
    throw new Error(
      "Only the assignee or a manager can update this work item."
    );
  }

  if (existing.status !== "open") {
    throw new Error("Only open work items can be updated from the field view.");
  }

  return {
    scope,
    existing
  };
}

export async function updateAssignedWorkItemFieldState(input: {
  workItemId: string;
  fieldState: Exclude<WorkItemFieldState, "completed">;
  blockerReason?: string | null;
  next?: string;
}) {
  const { scope, existing } = await requireAssignedWorkItemActionScope({
    workItemId: input.workItemId,
    next: input.next
  });
  const metadata = buildFieldStateMetadata({
    existing: existing.metadata,
    fieldState: input.fieldState,
    blockerReason: input.blockerReason?.trim() || null
  });
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .update({
      metadata,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.workItemId)
    .eq("status", "open")
    .select(workItemSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to update work item field status: ${response.error.message}`
    );
  }

  if (!response.data) {
    throw new Error("Work item was not found or is no longer open.");
  }

  return mapWorkItem(response.data as WorkItemRow);
}

export async function completeAssignedWorkItem(input: {
  workItemId: string;
  completionNote?: string | null;
  next?: string;
}) {
  const { scope, existing } = await requireAssignedWorkItemActionScope({
    workItemId: input.workItemId,
    next: input.next
  });
  const completionNote = input.completionNote?.trim() || null;
  const metadata = {
    ...existing.metadata,
    fieldState: "completed",
    ...(completionNote ? { completionNote } : {})
  };
  const nowIso = new Date().toISOString();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .update({
      status: "completed",
      completed_at: nowIso,
      completed_by: scope.userId,
      dismissed_at: null,
      metadata,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", input.workItemId)
    .eq("status", "open")
    .select(workItemSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to complete assigned work item: ${response.error.message}`
    );
  }

  if (!response.data) {
    throw new Error("Work item was not found or is no longer open.");
  }

  return mapWorkItem(response.data as WorkItemRow);
}

export async function dismissWorkItem(workItemId: string) {
  const scope = await requireWorkItemScope("/dashboard");
  const existing = await getScopedWorkItem(workItemId, scope);

  if (!existing) {
    throw new Error("Work item was not found.");
  }

  if (existing.status !== "open") {
    throw new Error("Only open work items can be dismissed.");
  }

  const nowIso = new Date().toISOString();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("work_items")
    .update({
      status: "dismissed",
      completed_at: null,
      completed_by: null,
      dismissed_at: nowIso,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", workItemId)
    .eq("status", "open")
    .select(workItemSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to dismiss work item: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error("Work item was not found or is no longer open.");
  }

  return mapWorkItem(response.data as WorkItemRow);
}
