import "server-only";

import {
  computeContractSignatureWorkflowSummary,
  computeInvoicePaymentWorkflowGate
} from "@floorconnector/domain";
import type {
  ContractSignerRole,
  ContractSignerStatus,
  ContractStatus,
  EstimateStatus,
  InvoiceStatus,
  PaymentEventActorType,
  PaymentEventType,
  PortalRecordViewSubjectType,
  ProjectStatus
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listPortalAccessGrantsForCurrentUser } from "@/lib/portal-access/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PortalProjectRow = {
  id: string;
  company_id: string;
  customer_id: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        email: string | null;
        phone: string | null;
      }
    | null;
};

type PortalEstimateRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  reference_number: string;
  status: EstimateStatus;
  subtotal_amount: string | number;
  tax_amount: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  notes: string | null;
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

type PortalEstimateLineItemRow = {
  id: string;
  estimate_id: string;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  line_total: string | number;
  sort_order: number;
};

type PortalContractRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  status: ContractStatus;
  title: string;
  rendered_subject: string | null;
  rendered_content: string;
  internal_approval_status: string;
  signature_readiness_status: string;
  customer_viewed_at: string | null;
  customer_signed_at: string | null;
  contractor_countersigned_at: string | null;
  signature_declined_at: string | null;
  signature_voided_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
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
  estimates?:
    | {
        id: string;
        reference_number: string;
        status: string;
      }
    | null;
};

type PortalContractSignerRow = {
  id: string;
  contract_id: string;
  signer_role: ContractSignerRole;
  signer_status: ContractSignerStatus;
  display_name: string;
  email: string;
  signer_order: number;
  portal_user_id: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
};

type PortalInvoiceRow = {
  id: string;
  company_id: string;
  customer_id: string;
  project_id: string;
  estimate_id: string | null;
  job_id: string | null;
  reference_number: string;
  workflow_role: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal_amount: string | number;
  tax_amount: string | number;
  discount_amount: string | number;
  retainage_held_amount: string | number;
  total_amount: string | number;
  balance_due_amount: string | number;
  notes: string | null;
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

type PortalInvoiceLineItemRow = {
  id: string;
  invoice_id: string;
  name: string;
  description: string | null;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  line_total: string | number;
  sort_order: number;
};

type PortalPaymentRow = {
  id: string;
  invoice_id: string;
  amount: string | number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  status: string;
};

type PortalPaymentEventRow = {
  id: string;
  invoice_id: string;
  payment_id: string | null;
  event_type: PaymentEventType;
  actor_type: PaymentEventActorType;
  occurred_at: string;
  payload: Record<string, unknown> | null;
};

type ProjectStatusRow = {
  project_id: string;
  status: string;
  updated_at: string;
};

export type PortalAccessibleProjectListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  locationSummary: string | null;
  latestEstimateStatus: string | null;
  latestContractStatus: string | null;
  latestInvoiceStatus: string | null;
  latestInvoiceReferenceNumber: string | null;
  latestInvoiceWorkflowRole: string | null;
  latestInvoiceBalanceDueAmount: string | null;
  latestInvoicePaymentEventType: PaymentEventType | null;
  latestInvoicePaymentEventAt: string | null;
  updatedAt: string;
};

export type PortalProjectDetailSummary = {
  id: string;
  organizationId: string;
  customerId: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  location: {
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    stateRegion: string | null;
    postalCode: string | null;
    countryCode: string | null;
  };
  visibleEstimateCount: number;
  visibleContractCount: number;
  visibleInvoiceCount: number;
  latestEstimateStatus: string | null;
  latestContractStatus: string | null;
  latestInvoiceStatus: string | null;
  latestInvoiceReferenceNumber: string | null;
  latestInvoiceWorkflowRole: string | null;
  latestInvoiceBalanceDueAmount: string | null;
  latestInvoicePaymentEventType: PaymentEventType | null;
  latestInvoicePaymentEventAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectEstimateListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  status: EstimateStatus;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectContractListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  status: ContractStatus;
  title: string;
  renderedSubject: string | null;
  customerViewedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectInvoiceListItem = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  jobId: string | null;
  referenceNumber: string;
  workflowRole: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  totalAmount: string;
  balanceDueAmount: string;
  latestPaymentEventType: PaymentEventType | null;
  latestPaymentEventAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PortalProjectLatestInvoiceRow = {
  id: string;
  project_id: string;
  reference_number: string;
  workflow_role: string;
  status: InvoiceStatus;
  balance_due_amount: string | number;
  updated_at: string;
};

type PortalProjectLatestInvoiceSummary = {
  referenceNumber: string;
  workflowRole: string;
  status: InvoiceStatus;
  balanceDueAmount: string;
  latestPaymentEventType: PaymentEventType | null;
  latestPaymentEventAt: string | null;
};

export type PortalEstimateReviewDetail = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  referenceNumber: string;
  status: EstimateStatus;
  subtotalAmount: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  notes: string | null;
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
  lineItems: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: string;
    unit: string;
    unitPrice: string;
    lineTotal: string;
    sortOrder: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type PortalContractReviewDetail = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  status: ContractStatus;
  title: string;
  renderedSubject: string | null;
  renderedContent: string;
  internalApprovalStatus: string;
  signatureReadinessStatus: string;
  customerViewedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  signatureDeclinedAt: string | null;
  signatureVoidedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  signers: Array<{
    id: string;
    signerRole: ContractSignerRole;
    signerStatus: ContractSignerStatus;
    displayName: string;
    email: string;
    signerOrder: number;
    viewedAt: string | null;
    signedAt: string | null;
    declinedAt: string | null;
    declineReason: string | null;
  }>;
  signatureSummary: {
    customerSignerCount: number;
    contractorSignerCount: number;
    signedCustomerSignerCount: number;
    signedContractorSignerCount: number;
    viewedCustomerSignerCount: number;
    declinedSignerCount: number;
    requiresCountersign: boolean;
    allCustomerSignersSigned: boolean;
    allRequiredSignersSigned: boolean;
    canCustomerAct: boolean;
    canContractorCountersign: boolean;
    isDeclined: boolean;
    isVoided: boolean;
    isCompleted: boolean;
    anyCustomerInteraction: boolean;
  };
  currentUserSignerStatus: ContractSignerStatus | null;
  currentUserCanSign: boolean;
  currentUserCanDecline: boolean;
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
  estimate: {
    id: string;
    referenceNumber: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type PortalInvoiceReviewDetail = {
  id: string;
  organizationId: string;
  customerId: string;
  projectId: string;
  estimateId: string | null;
  jobId: string | null;
  referenceNumber: string;
  workflowRole: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  subtotalAmount: string;
  taxAmount: string;
  discountAmount: string;
  retainageHeldAmount: string;
  totalAmount: string;
  balanceDueAmount: string;
  paidAmount: string;
  notes: string | null;
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
  lineItems: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: string;
    unit: string;
    unitPrice: string;
    lineTotal: string;
    sortOrder: number;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentDate: string;
    paymentMethod: string;
    reference: string | null;
    status: string;
  }>;
  paymentEvents: Array<{
    id: string;
    paymentId: string | null;
    eventType: PaymentEventType;
    actorType: PaymentEventActorType;
    occurredAt: string;
    payload: Record<string, unknown> | null;
  }>;
  paymentWorkflow: {
    canRequestPayment: boolean;
    canStartCheckout: boolean;
    canRecordSuccess: boolean;
    hasBalanceDue: boolean;
    isSettled: boolean;
    requestBlockers: string[];
  };
  createdAt: string;
  updatedAt: string;
};

type PortalScope = {
  userId: string;
  activeCustomerIds: string[];
  accessibleProjectIds: string[];
};

const portalProjectSelect = `
  id,
  company_id,
  customer_id,
  name,
  status,
  description,
  address_line_1,
  address_line_2,
  city,
  state_region,
  postal_code,
  country_code,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    email,
    phone
  )
`;

const portalEstimateSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  reference_number,
  status,
  subtotal_amount,
  tax_amount,
  discount_amount,
  total_amount,
  notes,
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

const portalContractSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  estimate_id,
  status,
  title,
  rendered_subject,
  rendered_content,
  internal_approval_status,
  signature_readiness_status,
  customer_viewed_at,
  customer_signed_at,
  contractor_countersigned_at,
  signature_declined_at,
  signature_voided_at,
  sent_at,
  viewed_at,
  signed_at,
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
  ),
  estimates (
    id,
    reference_number,
    status
  )
`;

const portalInvoiceSelect = `
  id,
  company_id,
  customer_id,
  project_id,
  estimate_id,
  job_id,
  reference_number,
  workflow_role,
  status,
  issue_date,
  due_date,
  subtotal_amount,
  tax_amount,
  discount_amount,
  retainage_held_amount,
  total_amount,
  balance_due_amount,
  notes,
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

function formatMoney(value: string | number) {
  return Number(value).toFixed(2);
}

function formatQuantity(value: string | number) {
  return Number(value).toFixed(2);
}

function formatLocationSummary(project: PortalProjectRow) {
  const parts = [
    project.address_line_1,
    project.city,
    project.state_region,
    project.postal_code
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

function mapPortalContractSigner(row: PortalContractSignerRow) {
  return {
    id: row.id,
    signerRole: row.signer_role,
    signerStatus: row.signer_status,
    displayName: row.display_name,
    email: row.email,
    signerOrder: row.signer_order,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    declinedAt: row.declined_at,
    declineReason: row.decline_reason
  };
}

function mapPortalPaymentEvent(row: PortalPaymentEventRow) {
  return {
    id: row.id,
    paymentId: row.payment_id,
    eventType: row.event_type,
    actorType: row.actor_type,
    occurredAt: row.occurred_at,
    payload: row.payload
  };
}

async function getPortalScope(next = "/portal"): Promise<PortalScope> {
  const user = await requireAuthenticatedUser(next);
  const activeGrants = (await listPortalAccessGrantsForCurrentUser(next)).filter(
    (grant) => grant.status === "active"
  );

  const activeCustomerIds = [...new Set(activeGrants.map((grant) => grant.customerId))];

  if (activeGrants.length === 0) {
    return {
      userId: user.id,
      activeCustomerIds,
      accessibleProjectIds: []
    };
  }

  const supabase = await getSupabaseServerClient();
  const projectAccessResponse = await supabase
    .from("portal_project_access")
    .select("project_id")
    .in(
      "portal_access_grant_id",
      activeGrants.map((grant) => grant.id)
    )
    .eq("status", "active");
  const projectAccessRows = (projectAccessResponse.data as
    | Array<{ project_id?: string }>
    | null) ?? [];

  if (projectAccessResponse.error) {
    throw new Error(
      `Unable to load portal-scoped project visibility: ${projectAccessResponse.error.message}`
    );
  }

  return {
    userId: user.id,
    activeCustomerIds,
    accessibleProjectIds: [
      ...new Set(
        projectAccessRows
          .map((row) => row.project_id)
          .filter((value): value is string => typeof value === "string")
      )
    ]
  };
}

async function createPortalRecordView(
  input: {
    companyId: string;
    customerId: string;
    projectId: string;
    subjectType: PortalRecordViewSubjectType;
    subjectId: string;
  },
  next = "/portal"
) {
  const user = await requireAuthenticatedUser(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase.from("portal_record_views").insert({
    company_id: input.companyId,
    portal_user_id: user.id,
    customer_id: input.customerId,
    project_id: input.projectId,
    subject_type: input.subjectType,
    subject_id: input.subjectId
  });

  if (response.error) {
    throw new Error(`Unable to record the portal view event: ${response.error.message}`);
  }
}

async function getLatestStatusesByProjectIds(projectIds: string[]) {
  if (projectIds.length === 0) {
    return {
      estimates: new Map<string, string>(),
      contracts: new Map<string, string>()
    };
  }

  const supabase = await getSupabaseServerClient();
  const [estimatesResponse, contractsResponse] = await Promise.all([
    supabase
      .from("estimates")
      .select("project_id, status, updated_at")
      .in("project_id", projectIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("contracts")
      .select("project_id, status, updated_at")
      .in("project_id", projectIds)
      .order("updated_at", { ascending: false })
  ]);

  if (estimatesResponse.error) {
    throw new Error(
      `Unable to load latest portal estimate statuses: ${estimatesResponse.error.message}`
    );
  }

  if (contractsResponse.error) {
    throw new Error(
      `Unable to load latest portal contract statuses: ${contractsResponse.error.message}`
    );
  }

  const estimateRows = (estimatesResponse.data as ProjectStatusRow[] | null) ?? [];
  const contractRows = (contractsResponse.data as ProjectStatusRow[] | null) ?? [];

  const estimateMap = new Map<string, string>();
  const contractMap = new Map<string, string>();

  for (const row of estimateRows) {
    if (!estimateMap.has(row.project_id)) {
      estimateMap.set(row.project_id, row.status);
    }
  }

  for (const row of contractRows) {
    if (!contractMap.has(row.project_id)) {
      contractMap.set(row.project_id, row.status);
    }
  }

  return {
    estimates: estimateMap,
    contracts: contractMap
  };
}

function isCustomerActiveInvoiceStatus(status: InvoiceStatus) {
  return status !== "paid" && status !== "void";
}

async function getLatestPaymentEventsByInvoiceIds(invoiceIds: string[]) {
  if (invoiceIds.length === 0) {
    return new Map<string, PortalPaymentEventRow>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("payment_events")
    .select(
      `
        id,
        invoice_id,
        payment_id,
        event_type,
        actor_type,
        occurred_at,
        payload
      `
    )
    .in("invoice_id", invoiceIds)
    .order("occurred_at", { ascending: false });
  const rows = (response.data as PortalPaymentEventRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal invoice payment activity: ${response.error.message}`
    );
  }

  const latestEvents = new Map<string, PortalPaymentEventRow>();

  for (const row of rows) {
    if (!latestEvents.has(row.invoice_id)) {
      latestEvents.set(row.invoice_id, row);
    }
  }

  return latestEvents;
}

async function getLatestInvoiceSummariesByProjectIds(projectIds: string[]) {
  if (projectIds.length === 0) {
    return new Map<string, PortalProjectLatestInvoiceSummary>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(
      `
        id,
        project_id,
        reference_number,
        workflow_role,
        status,
        balance_due_amount,
        updated_at
      `
    )
    .in("project_id", projectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalProjectLatestInvoiceRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load latest portal invoice summaries: ${response.error.message}`
    );
  }

  const latestInvoicesByProject = new Map<string, PortalProjectLatestInvoiceRow>();

  for (const row of rows) {
    const current = latestInvoicesByProject.get(row.project_id);

    if (!current) {
      latestInvoicesByProject.set(row.project_id, row);
      continue;
    }

    if (!isCustomerActiveInvoiceStatus(current.status) && isCustomerActiveInvoiceStatus(row.status)) {
      latestInvoicesByProject.set(row.project_id, row);
    }
  }

  const latestPaymentEventsByInvoiceId = await getLatestPaymentEventsByInvoiceIds(
    [...latestInvoicesByProject.values()].map((row) => row.id)
  );

  return new Map(
    [...latestInvoicesByProject.entries()].map(([projectId, row]) => {
      const latestEvent = latestPaymentEventsByInvoiceId.get(row.id) ?? null;

      return [
        projectId,
        {
          referenceNumber: row.reference_number,
          workflowRole: row.workflow_role,
          status: row.status,
          balanceDueAmount: formatMoney(row.balance_due_amount),
          latestPaymentEventType: latestEvent?.event_type ?? null,
          latestPaymentEventAt: latestEvent?.occurred_at ?? null
        }
      ];
    })
  );
}

export async function listPortalAccessibleProjects(
  next = "/portal"
): Promise<PortalAccessibleProjectListItem[]> {
  const scope = await getPortalScope(next);

  if (scope.accessibleProjectIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select(portalProjectSelect)
    .in("id", scope.accessibleProjectIds)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalProjectRow[] | null) ?? [];

  if (response.error) {
    throw new Error(`Unable to load portal projects: ${response.error.message}`);
  }

  const latestStatuses = await getLatestStatusesByProjectIds(scope.accessibleProjectIds);
  const latestInvoiceSummaries = await getLatestInvoiceSummariesByProjectIds(
    scope.accessibleProjectIds
  );

  return rows.map((row) => {
    const latestInvoiceSummary = latestInvoiceSummaries.get(row.id) ?? null;

    return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    name: row.name,
    status: row.status,
    description: row.description,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name,
          email: row.customers.email,
          phone: row.customers.phone
        }
      : null,
    locationSummary: formatLocationSummary(row),
    latestEstimateStatus: latestStatuses.estimates.get(row.id) ?? null,
    latestContractStatus: latestStatuses.contracts.get(row.id) ?? null,
    latestInvoiceStatus: latestInvoiceSummary?.status ?? null,
    latestInvoiceReferenceNumber: latestInvoiceSummary?.referenceNumber ?? null,
    latestInvoiceWorkflowRole: latestInvoiceSummary?.workflowRole ?? null,
    latestInvoiceBalanceDueAmount: latestInvoiceSummary?.balanceDueAmount ?? null,
    latestInvoicePaymentEventType: latestInvoiceSummary?.latestPaymentEventType ?? null,
    latestInvoicePaymentEventAt: latestInvoiceSummary?.latestPaymentEventAt ?? null,
    updatedAt: row.updated_at
    };
  });
}

export async function getPortalProjectDetailSummary(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectDetailSummary | null> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const projectResponse = await supabase
    .from("projects")
    .select(portalProjectSelect)
    .eq("id", projectId)
    .maybeSingle();
  const row = projectResponse.data as PortalProjectRow | null;

  if (projectResponse.error) {
    throw new Error(
      `Unable to load the portal project summary: ${projectResponse.error.message}`
    );
  }

  if (!row) {
    return null;
  }

  const [
    estimateCountResponse,
    contractCountResponse,
    invoiceCountResponse,
    latestStatuses,
    latestInvoiceSummaries
  ] =
    await Promise.all([
      supabase.from("estimates").select("id", { count: "exact", head: true }).eq("project_id", projectId),
      supabase.from("contracts").select("id", { count: "exact", head: true }).eq("project_id", projectId),
      supabase.from("invoices").select("id", { count: "exact", head: true }).eq("project_id", projectId),
      getLatestStatusesByProjectIds([projectId]),
      getLatestInvoiceSummariesByProjectIds([projectId])
    ]);

  if (estimateCountResponse.error) {
    throw new Error(
      `Unable to load portal estimate counts for the project: ${estimateCountResponse.error.message}`
    );
  }

  if (contractCountResponse.error) {
    throw new Error(
      `Unable to load portal contract counts for the project: ${contractCountResponse.error.message}`
    );
  }

  if (invoiceCountResponse.error) {
    throw new Error(
      `Unable to load portal invoice counts for the project: ${invoiceCountResponse.error.message}`
    );
  }

  await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.id,
      subjectType: "project",
      subjectId: row.id
    },
    next
  );

  const latestInvoiceSummary = latestInvoiceSummaries.get(projectId) ?? null;

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    name: row.name,
    status: row.status,
    description: row.description,
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name,
          email: row.customers.email,
          phone: row.customers.phone
        }
      : null,
    location: {
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2,
      city: row.city,
      stateRegion: row.state_region,
      postalCode: row.postal_code,
      countryCode: row.country_code
    },
    visibleEstimateCount: estimateCountResponse.count ?? 0,
    visibleContractCount: contractCountResponse.count ?? 0,
    visibleInvoiceCount: invoiceCountResponse.count ?? 0,
    latestEstimateStatus: latestStatuses.estimates.get(projectId) ?? null,
    latestContractStatus: latestStatuses.contracts.get(projectId) ?? null,
    latestInvoiceStatus: latestInvoiceSummary?.status ?? null,
    latestInvoiceReferenceNumber: latestInvoiceSummary?.referenceNumber ?? null,
    latestInvoiceWorkflowRole: latestInvoiceSummary?.workflowRole ?? null,
    latestInvoiceBalanceDueAmount: latestInvoiceSummary?.balanceDueAmount ?? null,
    latestInvoicePaymentEventType: latestInvoiceSummary?.latestPaymentEventType ?? null,
    latestInvoicePaymentEventAt: latestInvoiceSummary?.latestPaymentEventAt ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listPortalProjectEstimates(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectEstimateListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("estimates")
    .select(portalEstimateSelect)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalEstimateRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal estimates for the project: ${response.error.message}`
    );
  }

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    status: row.status,
    totalAmount: formatMoney(row.total_amount),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function listPortalProjectContracts(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectContractListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("contracts")
    .select(portalContractSelect)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalContractRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal contracts for the project: ${response.error.message}`
    );
  }

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    status: row.status,
    title: row.title,
    renderedSubject: row.rendered_subject,
    customerViewedAt: row.customer_viewed_at,
    customerSignedAt: row.customer_signed_at,
    contractorCountersignedAt: row.contractor_countersigned_at,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function listPortalProjectInvoices(
  projectId: string,
  next = "/portal"
): Promise<PortalProjectInvoiceListItem[]> {
  const scope = await getPortalScope(next);

  if (!scope.accessibleProjectIds.includes(projectId)) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("invoices")
    .select(portalInvoiceSelect)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  const rows = (response.data as PortalInvoiceRow[] | null) ?? [];

  if (response.error) {
    throw new Error(
      `Unable to load portal invoices for the project: ${response.error.message}`
    );
  }

  const latestPaymentEventsByInvoiceId = await getLatestPaymentEventsByInvoiceIds(
    rows.map((row) => row.id)
  );

  return rows.map((row) => {
    const latestPaymentEvent = latestPaymentEventsByInvoiceId.get(row.id) ?? null;

    return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    jobId: row.job_id,
    referenceNumber: row.reference_number,
    workflowRole: row.workflow_role,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    totalAmount: formatMoney(row.total_amount),
    balanceDueAmount: formatMoney(row.balance_due_amount),
    latestPaymentEventType: latestPaymentEvent?.event_type ?? null,
    latestPaymentEventAt: latestPaymentEvent?.occurred_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
    };
  });
}

export async function getPortalEstimateReviewData(
  estimateId: string,
  next = "/portal"
): Promise<PortalEstimateReviewDetail | null> {
  const scope = await getPortalScope(next);
  const supabase = await getSupabaseServerClient();
  const estimateResponse = await supabase
    .from("estimates")
    .select(portalEstimateSelect)
    .eq("id", estimateId)
    .maybeSingle();
  const row = estimateResponse.data as PortalEstimateRow | null;

  if (estimateResponse.error) {
    throw new Error(
      `Unable to load the portal estimate review data: ${estimateResponse.error.message}`
    );
  }

  if (!row || !scope.accessibleProjectIds.includes(row.project_id)) {
    return null;
  }

  const lineItemsResponse = await supabase
    .from("estimate_line_items")
    .select(
      `
        id,
        estimate_id,
        name,
        description,
        quantity,
        unit,
        unit_price,
        line_total,
        sort_order
      `
    )
    .eq("estimate_id", estimateId)
    .order("sort_order", { ascending: true });
  const lineItemRows =
    (lineItemsResponse.data as PortalEstimateLineItemRow[] | null) ?? [];

  if (lineItemsResponse.error) {
    throw new Error(
      `Unable to load portal estimate line items: ${lineItemsResponse.error.message}`
    );
  }

  await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.project_id,
      subjectType: "estimate",
      subjectId: row.id
    },
    next
  );

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    referenceNumber: row.reference_number,
    status: row.status,
    subtotalAmount: formatMoney(row.subtotal_amount),
    taxAmount: formatMoney(row.tax_amount),
    discountAmount: formatMoney(row.discount_amount),
    totalAmount: formatMoney(row.total_amount),
    notes: row.notes,
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
      : null,
    lineItems: lineItemRows.map((lineItem) => ({
      id: lineItem.id,
      name: lineItem.name,
      description: lineItem.description,
      quantity: formatQuantity(lineItem.quantity),
      unit: lineItem.unit,
      unitPrice: formatMoney(lineItem.unit_price),
      lineTotal: formatMoney(lineItem.line_total),
      sortOrder: lineItem.sort_order
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getPortalContractReviewData(
  contractId: string,
  next = "/portal"
): Promise<PortalContractReviewDetail | null> {
  const scope = await getPortalScope(next);
  const supabase = await getSupabaseServerClient();
  const contractResponse = await supabase
    .from("contracts")
    .select(portalContractSelect)
    .eq("id", contractId)
    .maybeSingle();
  const row = contractResponse.data as PortalContractRow | null;

  if (contractResponse.error) {
    throw new Error(
      `Unable to load the portal contract review data: ${contractResponse.error.message}`
    );
  }

  if (!row || !scope.accessibleProjectIds.includes(row.project_id)) {
    return null;
  }

  const contractSignerResponse = await supabase
    .from("contract_signers")
    .select(
      `
        id,
        contract_id,
        signer_role,
        signer_status,
        display_name,
        email,
        signer_order,
        portal_user_id,
        viewed_at,
        signed_at,
        declined_at,
        decline_reason
      `
    )
    .eq("contract_id", contractId)
    .order("signer_order", { ascending: true })
    .order("created_at", { ascending: true });
  const signerRows =
    (contractSignerResponse.data as PortalContractSignerRow[] | null) ?? [];

  if (contractSignerResponse.error) {
    throw new Error(
      `Unable to load portal contract signer routing: ${contractSignerResponse.error.message}`
    );
  }

  await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.project_id,
      subjectType: "contract",
      subjectId: row.id
    },
    next
  );

  const signatureSummary = computeContractSignatureWorkflowSummary({
    status: row.status,
    signatureReadinessStatus: row.signature_readiness_status as
      | "draft"
      | "ready_to_send"
      | "out_for_signature"
      | "signed",
    signatureStartedAt: row.sent_at,
    customerSignedAt: row.customer_signed_at,
    contractorCountersignedAt: row.contractor_countersigned_at,
    signatureDeclinedAt: row.signature_declined_at,
    signatureVoidedAt: row.signature_voided_at,
    signers: signerRows.map((signer) => ({
      signerRole: signer.signer_role,
      signerStatus: signer.signer_status
    }))
  });
  const currentUserSignerRows = signerRows.filter(
    (signer) => signer.signer_role === "customer" && signer.portal_user_id === scope.userId
  );
  const currentUserSignerStatus =
    currentUserSignerRows.length > 0
      ? currentUserSignerRows.some((signer) => signer.signer_status === "declined")
        ? "declined"
        : currentUserSignerRows.some((signer) => signer.signer_status === "signed")
          ? "signed"
          : currentUserSignerRows.some((signer) => signer.signer_status === "viewed")
            ? "viewed"
            : "pending"
      : null;

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    status: row.status,
    title: row.title,
    renderedSubject: row.rendered_subject,
    renderedContent: row.rendered_content,
    internalApprovalStatus: row.internal_approval_status,
    signatureReadinessStatus: row.signature_readiness_status,
    customerViewedAt: row.customer_viewed_at,
    customerSignedAt: row.customer_signed_at,
    contractorCountersignedAt: row.contractor_countersigned_at,
    signatureDeclinedAt: row.signature_declined_at,
    signatureVoidedAt: row.signature_voided_at,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    signers: signerRows.map(mapPortalContractSigner),
    signatureSummary,
    currentUserSignerStatus,
    currentUserCanSign:
      signatureSummary.canCustomerAct &&
      currentUserSignerRows.some(
        (signer) => signer.signer_status === "pending" || signer.signer_status === "viewed"
      ),
    currentUserCanDecline:
      signatureSummary.canCustomerAct &&
      currentUserSignerRows.some(
        (signer) => signer.signer_status === "pending" || signer.signer_status === "viewed"
      ),
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
      : null,
    estimate: row.estimates
      ? {
          id: row.estimates.id,
          referenceNumber: row.estimates.reference_number,
          status: row.estimates.status
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getPortalInvoiceReviewData(
  invoiceId: string,
  next = "/portal"
): Promise<PortalInvoiceReviewDetail | null> {
  const scope = await getPortalScope(next);
  const supabase = await getSupabaseServerClient();
  const invoiceResponse = await supabase
    .from("invoices")
    .select(portalInvoiceSelect)
    .eq("id", invoiceId)
    .maybeSingle();
  const row = invoiceResponse.data as PortalInvoiceRow | null;

  if (invoiceResponse.error) {
    throw new Error(
      `Unable to load the portal invoice review data: ${invoiceResponse.error.message}`
    );
  }

  if (!row || !scope.accessibleProjectIds.includes(row.project_id)) {
    return null;
  }

  const [lineItemsResponse, paymentsResponse, paymentEventsResponse] = await Promise.all([
    supabase
      .from("invoice_line_items")
      .select(
        `
          id,
          invoice_id,
          name,
          description,
          quantity,
          unit,
          unit_price,
          line_total,
          sort_order
        `
      )
      .eq("invoice_id", invoiceId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("payments")
      .select(
        `
          id,
          invoice_id,
          amount,
          payment_date,
          payment_method,
          reference,
          status
        `
      )
      .eq("invoice_id", invoiceId)
      .eq("status", "recorded")
      .order("payment_date", { ascending: false }),
    supabase
      .from("payment_events")
      .select(
        `
          id,
          invoice_id,
          payment_id,
          event_type,
          actor_type,
          occurred_at,
          payload
        `
      )
      .eq("invoice_id", invoiceId)
      .order("occurred_at", { ascending: false })
      .limit(6)
  ]);

  const lineItemRows =
    (lineItemsResponse.data as PortalInvoiceLineItemRow[] | null) ?? [];
  const paymentRows = (paymentsResponse.data as PortalPaymentRow[] | null) ?? [];
  const paymentEventRows =
    (paymentEventsResponse.data as PortalPaymentEventRow[] | null) ?? [];

  if (lineItemsResponse.error) {
    throw new Error(
      `Unable to load portal invoice line items: ${lineItemsResponse.error.message}`
    );
  }

  if (paymentsResponse.error) {
    throw new Error(
      `Unable to load portal invoice payments: ${paymentsResponse.error.message}`
    );
  }

  if (paymentEventsResponse.error) {
    throw new Error(
      `Unable to load portal invoice payment activity: ${paymentEventsResponse.error.message}`
    );
  }

  await createPortalRecordView(
    {
      companyId: row.company_id,
      customerId: row.customer_id,
      projectId: row.project_id,
      subjectType: "invoice",
      subjectId: row.id
    },
    next
  );

  const paidAmount = paymentRows.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const paymentWorkflow = computeInvoicePaymentWorkflowGate({
    invoiceStatus: row.status,
    balanceDueAmount: formatMoney(row.balance_due_amount)
  });

  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    projectId: row.project_id,
    estimateId: row.estimate_id,
    jobId: row.job_id,
    referenceNumber: row.reference_number,
    workflowRole: row.workflow_role,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    subtotalAmount: formatMoney(row.subtotal_amount),
    taxAmount: formatMoney(row.tax_amount),
    discountAmount: formatMoney(row.discount_amount),
    retainageHeldAmount: formatMoney(row.retainage_held_amount),
    totalAmount: formatMoney(row.total_amount),
    balanceDueAmount: formatMoney(row.balance_due_amount),
    paidAmount: paidAmount.toFixed(2),
    notes: row.notes,
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
      : null,
    lineItems: lineItemRows.map((lineItem) => ({
      id: lineItem.id,
      name: lineItem.name,
      description: lineItem.description,
      quantity: formatQuantity(lineItem.quantity),
      unit: lineItem.unit,
      unitPrice: formatMoney(lineItem.unit_price),
      lineTotal: formatMoney(lineItem.line_total),
      sortOrder: lineItem.sort_order
    })),
    payments: paymentRows.map((payment) => ({
      id: payment.id,
      amount: formatMoney(payment.amount),
      paymentDate: payment.payment_date,
      paymentMethod: payment.payment_method,
      reference: payment.reference,
      status: payment.status
    })),
    paymentEvents: paymentEventRows.map(mapPortalPaymentEvent),
    paymentWorkflow,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
