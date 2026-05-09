import "server-only";

import {
  getAutomationEventEligibility,
  type AutomationEligibilityContext,
  type AutomationEventEligibilityResult
} from "@/lib/automation/eligibility";
import { buildAutomationPlanningSummaries } from "@/lib/automation/readiness-plan";
import { automationNotificationTemplateDefinitions } from "@/lib/automation/templates";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AutomationNotificationPreferenceCategory,
  AutomationPlanningSummary
} from "@floorconnector/types";

export type AutomationPlanningStatus = "implemented" | "foundation" | "planned";

export type AutomationPlanningCategory = {
  key:
    | "contract_signed"
    | "deposit_paid_ready_to_schedule"
    | "schedule_reminder"
    | "crew_assignment_reminder"
    | "customer_message_received"
    | "estimate_awaiting_approval"
    | "contract_awaiting_signature"
    | "invoice_overdue"
    | "payment_failed"
    | "change_order_approved";
  label: string;
  status: AutomationPlanningStatus;
  source: string;
  triggerSource: string;
  intendedAction: string;
  missingDependency: string;
  notificationsState: string;
  messagesState: string;
  executionState: string;
  dependencyState: string;
  recentSamples: string[];
};

export type AutomationPlanningData = {
  workflowSettings: Awaited<ReturnType<typeof getOrganizationWorkflowSettings>>;
  summary: {
    implementedCount: number;
    foundationCount: number;
    plannedCount: number;
    executionEnabledCount: number;
  };
  readiness: {
    automationExecution: {
      available: boolean;
      label: string;
      detail: string;
    };
    notificationFoundation: {
      available: boolean;
      label: string;
      detail: string;
    };
    communicationFoundation: {
      available: boolean;
      label: string;
      detail: string;
    };
    schedulingFoundation: {
      available: boolean;
      label: string;
      detail: string;
    };
    paymentFoundation: {
      available: boolean;
      label: string;
      detail: string;
    };
  };
  recommendations: Array<{
    title: string;
    detail: string;
  }>;
  counts: {
    communicationThreads: number;
    communicationMessages: number;
    communicationNotificationEvents: number;
    signedContracts: number;
    signedContractNotificationEvents: number;
    readyProjects: number;
    paidPaymentEvents: number;
    scheduledJobs: number;
    scheduledJobsWithoutCrewVendor: number;
    communicationThreadsNeedingResponse: number;
    overdueInvoices: number;
    failedPaymentEvents: number;
    failedPaymentNotificationEvents: number;
    approvedChangeOrders: number;
    approvedChangeOrderNotificationEvents: number;
    estimatesAwaitingApproval: number;
    contractsAwaitingSignature: number;
  };
  eligibilityPreviews: Array<{
    category: AutomationNotificationPreferenceCategory;
    sampleLabel: string;
    result: AutomationEventEligibilityResult<AutomationNotificationPreferenceCategory>;
  }>;
  readinessPlan: AutomationPlanningSummary[];
  categories: AutomationPlanningCategory[];
};

type SampleRecord = {
  id: string;
  label: string;
  href: string;
  meta?: string | null;
};

function formatPlural(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatBooleanLabel(enabled: boolean, trueLabel: string, falseLabel: string) {
  return enabled ? trueLabel : falseLabel;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function mapSamples(records: SampleRecord[]) {
  return records.map((record) =>
    record.meta ? `${record.label} - ${record.meta}` : record.label
  );
}

function deriveJobDisplayLabel(record: {
  id: string;
  dispatch_status: string;
  scheduled_date: string | null;
  customers?: { name: string; company_name: string | null } | null;
  projects?: { name: string } | null;
  estimates?: { reference_number: string | null } | null;
}) {
  if (record.projects?.name) {
    return record.projects.name;
  }

  if (record.customers?.name) {
    return `${record.customers.name} job`;
  }

  if (record.customers?.company_name) {
    return `${record.customers.company_name} job`;
  }

  if (record.estimates?.reference_number) {
    return `Job from estimate ${record.estimates.reference_number}`;
  }

  if (record.scheduled_date) {
    return `Scheduled job ${formatDate(record.scheduled_date)}`;
  }

  return `${record.dispatch_status.replaceAll("_", " ")} job ${record.id.slice(0, 8)}`;
}

function buildEligibilityPreview<
  TCategory extends AutomationNotificationPreferenceCategory
>(input: {
  workflowSettings: Awaited<ReturnType<typeof getOrganizationWorkflowSettings>>;
  category: TCategory;
  sampleLabel: string;
  context: AutomationEligibilityContext<TCategory>;
}) {
  return {
    category: input.category,
    sampleLabel: input.sampleLabel,
    result: getAutomationEventEligibility({
      workflowSettings: input.workflowSettings,
      category: input.category,
      context: input.context
    })
  };
}

export async function getAutomationPlanningData(
  organizationId: string
): Promise<AutomationPlanningData> {
  const supabase = await getSupabaseServerClient();
  const workflowSettings = await getOrganizationWorkflowSettings(organizationId);
  const todayIso = new Date().toISOString().slice(0, 10);

  const [
    communicationThreadsResponse,
    communicationMessagesResponse,
    communicationNotificationEventsResponse,
    signedContractsResponse,
    signedContractNotificationEventsResponse,
    readyProjectsResponse,
    paidPaymentEventsResponse,
    scheduledJobsResponse,
    scheduledJobsWithoutCrewVendorResponse,
    communicationThreadsNeedingResponseResponse,
    overdueInvoicesResponse,
    failedPaymentEventsResponse,
    failedPaymentNotificationEventsResponse,
    approvedChangeOrdersResponse,
    approvedChangeOrderNotificationEventsResponse,
    estimatesAwaitingApprovalResponse,
    contractsAwaitingSignatureResponse,
    recentSignedContractsResponse,
    recentEstimatesAwaitingApprovalResponse,
    recentContractsAwaitingSignatureResponse,
    recentReadyProjectsResponse,
    recentScheduledJobsResponse,
    recentCommunicationThreadsResponse,
    recentOverdueInvoicesResponse,
    recentFailedPaymentEventsResponse,
    recentApprovedChangeOrdersResponse
  ] = await Promise.all([
    supabase
      .from("communication_threads")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId),
    supabase
      .from("communication_messages")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId),
    supabase
      .from("notification_events")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("category", "communication")
      .eq("event_type", "communication.message_posted"),
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("status", "signed"),
    supabase
      .from("notification_events")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("category", "contracts")
      .eq("event_type", "contract.signed"),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .not("ready_to_schedule_at", "is", null),
    supabase
      .from("payment_events")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("event_type", "payment_succeeded"),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .not("scheduled_date", "is", null),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .not("scheduled_date", "is", null)
      .is("crew_vendor_id", null),
    supabase
      .from("communication_threads")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .not("last_message_at", "is", null),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .not("due_date", "is", null)
      .not("status", "in", '("paid","void")')
      .lt("due_date", todayIso),
    supabase
      .from("payment_events")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("event_type", "payment_failed"),
    supabase
      .from("notification_events")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("category", "payments")
      .eq("event_type", "invoice.failed"),
    supabase
      .from("change_orders")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("status", "approved"),
    supabase
      .from("notification_events")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("category", "change_orders")
      .eq("event_type", "change_order.approved"),
    supabase
      .from("estimates")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .eq("status", "sent"),
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("company_id", organizationId)
      .in("status", ["sent", "viewed"])
      .is("signed_at", null)
      .is("signature_declined_at", null)
      .is("signature_voided_at", null),
    supabase
      .from("contracts")
      .select("id, reference_number, signed_at")
      .eq("company_id", organizationId)
      .eq("status", "signed")
      .order("signed_at", { ascending: false, nullsFirst: false })
      .limit(3),
    supabase
      .from("estimates")
      .select("id, reference_number, sent_at, status")
      .eq("company_id", organizationId)
      .eq("status", "sent")
      .order("sent_at", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("contracts")
      .select("id, reference_number, sent_at, status, signed_at")
      .eq("company_id", organizationId)
      .in("status", ["sent", "viewed"])
      .is("signed_at", null)
      .is("signature_declined_at", null)
      .is("signature_voided_at", null)
      .order("sent_at", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("projects")
      .select("id, name, ready_to_schedule_at")
      .eq("company_id", organizationId)
      .not("ready_to_schedule_at", "is", null)
      .order("ready_to_schedule_at", { ascending: false })
      .limit(3),
    supabase
      .from("jobs")
      .select(
        "id, dispatch_status, scheduled_date, crew_vendor_id, customers(name, company_name), projects(name), estimates(reference_number)"
      )
      .eq("company_id", organizationId)
      .not("scheduled_date", "is", null)
      .order("scheduled_date", { ascending: true })
      .limit(3),
    supabase
      .from("communication_threads")
      .select("id, subject_type, subject_id, updated_at")
      .eq("company_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("invoices")
      .select("id, reference_number, due_date, balance_due_amount, status")
      .eq("company_id", organizationId)
      .not("due_date", "is", null)
      .not("status", "in", '("paid","void")')
      .lt("due_date", todayIso)
      .order("due_date", { ascending: true })
      .limit(3),
    supabase
      .from("payment_events")
      .select("id, invoice_id, occurred_at, event_type")
      .eq("company_id", organizationId)
      .eq("event_type", "payment_failed")
      .order("occurred_at", { ascending: false })
      .limit(3),
    supabase
      .from("change_orders")
      .select("id, reference_number, approved_at")
      .eq("company_id", organizationId)
      .eq("status", "approved")
      .order("approved_at", { ascending: false, nullsFirst: false })
      .limit(3)
  ]);

  const responses = [
    communicationThreadsResponse,
    communicationMessagesResponse,
    communicationNotificationEventsResponse,
    signedContractsResponse,
    signedContractNotificationEventsResponse,
    readyProjectsResponse,
    paidPaymentEventsResponse,
    scheduledJobsResponse,
    scheduledJobsWithoutCrewVendorResponse,
    communicationThreadsNeedingResponseResponse,
    overdueInvoicesResponse,
    failedPaymentEventsResponse,
    failedPaymentNotificationEventsResponse,
    approvedChangeOrdersResponse,
    approvedChangeOrderNotificationEventsResponse,
    estimatesAwaitingApprovalResponse,
    contractsAwaitingSignatureResponse,
    recentSignedContractsResponse,
    recentEstimatesAwaitingApprovalResponse,
    recentContractsAwaitingSignatureResponse,
    recentReadyProjectsResponse,
    recentScheduledJobsResponse,
    recentCommunicationThreadsResponse,
    recentOverdueInvoicesResponse,
    recentFailedPaymentEventsResponse,
    recentApprovedChangeOrdersResponse
  ];

  for (const response of responses) {
    if (response.error) {
      throw new Error(`Unable to load automation planning data: ${response.error.message}`);
    }
  }

  const counts = {
    communicationThreads: communicationThreadsResponse.count ?? 0,
    communicationMessages: communicationMessagesResponse.count ?? 0,
    communicationNotificationEvents: communicationNotificationEventsResponse.count ?? 0,
    signedContracts: signedContractsResponse.count ?? 0,
    signedContractNotificationEvents: signedContractNotificationEventsResponse.count ?? 0,
    readyProjects: readyProjectsResponse.count ?? 0,
    paidPaymentEvents: paidPaymentEventsResponse.count ?? 0,
    scheduledJobs: scheduledJobsResponse.count ?? 0,
    scheduledJobsWithoutCrewVendor: scheduledJobsWithoutCrewVendorResponse.count ?? 0,
    communicationThreadsNeedingResponse:
      communicationThreadsNeedingResponseResponse.count ?? 0,
    overdueInvoices: overdueInvoicesResponse.count ?? 0,
    failedPaymentEvents: failedPaymentEventsResponse.count ?? 0,
    failedPaymentNotificationEvents:
      failedPaymentNotificationEventsResponse.count ?? 0,
    approvedChangeOrders: approvedChangeOrdersResponse.count ?? 0,
    approvedChangeOrderNotificationEvents:
      approvedChangeOrderNotificationEventsResponse.count ?? 0,
    estimatesAwaitingApproval: estimatesAwaitingApprovalResponse.count ?? 0,
    contractsAwaitingSignature: contractsAwaitingSignatureResponse.count ?? 0
  };

  const signedContractRecords =
    ((recentSignedContractsResponse.data as Array<{
      id: string;
      reference_number: string;
      signed_at: string | null;
    }> | null) ?? []);
  const readyProjectRecords =
    ((recentReadyProjectsResponse.data as Array<{
      id: string;
      name: string;
      ready_to_schedule_at: string | null;
    }> | null) ?? []);
  const estimateAwaitingApprovalRecords =
    ((recentEstimatesAwaitingApprovalResponse.data as Array<{
      id: string;
      reference_number: string;
      sent_at: string | null;
      status: string;
    }> | null) ?? []);
  const contractAwaitingSignatureRecords =
    ((recentContractsAwaitingSignatureResponse.data as Array<{
      id: string;
      reference_number: string;
      sent_at: string | null;
      status: string;
      signed_at: string | null;
    }> | null) ?? []);
  const scheduledJobRecords =
    ((recentScheduledJobsResponse.data as Array<{
      id: string;
      dispatch_status: string;
      scheduled_date: string | null;
      crew_vendor_id: string | null;
      customers?: {
        name: string;
        company_name: string | null;
      } | null;
      projects?: {
        name: string;
      } | null;
      estimates?: {
        reference_number: string | null;
      } | null;
    }> | null) ?? []);
  const communicationThreadRecords =
    ((recentCommunicationThreadsResponse.data as Array<{
      id: string;
      subject_type: string;
      subject_id: string;
      updated_at: string;
    }> | null) ?? []);
  const overdueInvoiceRecords =
    ((recentOverdueInvoicesResponse.data as Array<{
      id: string;
      reference_number: string;
      due_date: string | null;
      balance_due_amount: string;
      status: string;
    }> | null) ?? []);
  const failedPaymentEventRecords =
    ((recentFailedPaymentEventsResponse.data as Array<{
      id: string;
      invoice_id: string;
      occurred_at: string;
      event_type: string;
    }> | null) ?? []);
  const approvedChangeOrderRecords =
    ((recentApprovedChangeOrdersResponse.data as Array<{
      id: string;
      reference_number: string;
      approved_at: string | null;
    }> | null) ?? []);

  const recentSignedContracts = mapSamples(
    signedContractRecords.map((record) => ({
      id: record.id,
      label: `Contract ${record.reference_number}`,
      href: `/contracts/${record.id}`,
      meta: record.signed_at ? `signed ${formatDateTime(record.signed_at)}` : null
    }))
  );
  const recentReadyProjects = mapSamples(
    readyProjectRecords.map((record) => ({
      id: record.id,
      label: record.name,
      href: `/projects/${record.id}`,
      meta: record.ready_to_schedule_at
        ? `ready ${formatDateTime(record.ready_to_schedule_at)}`
        : null
    }))
  );
  const recentEstimatesAwaitingApproval = mapSamples(
    estimateAwaitingApprovalRecords.map((record) => ({
      id: record.id,
      label: `Estimate ${record.reference_number}`,
      href: `/estimates/${record.id}`,
      meta: record.sent_at ? `sent ${formatDateTime(record.sent_at)}` : "sent"
    }))
  );
  const recentContractsAwaitingSignature = mapSamples(
    contractAwaitingSignatureRecords.map((record) => ({
      id: record.id,
      label: `Contract ${record.reference_number}`,
      href: `/contracts/${record.id}`,
      meta: record.sent_at ? `sent ${formatDateTime(record.sent_at)}` : record.status
    }))
  );
  const recentScheduledJobs = mapSamples(
    scheduledJobRecords.map((record) => ({
      id: record.id,
      label: deriveJobDisplayLabel(record),
      href: `/jobs/${record.id}`,
      meta: [
        record.scheduled_date ? `scheduled ${formatDate(record.scheduled_date)}` : null,
        record.crew_vendor_id ? "crew attached" : "crew still missing"
      ]
        .filter(Boolean)
        .join(" | ")
    }))
  );
  const recentCommunicationThreads = mapSamples(
    communicationThreadRecords.map((record) => ({
      id: record.id,
      label: `${record.subject_type.replaceAll("_", " ")} thread`,
      href: `/communications?threadId=${record.id}`,
      meta: `active ${formatDateTime(record.updated_at)}`
    }))
  );
  const recentOverdueInvoices = mapSamples(
    overdueInvoiceRecords.map((record) => ({
      id: record.id,
      label: `Invoice ${record.reference_number}`,
      href: `/invoices/${record.id}`,
      meta: [
        record.due_date ? `due ${formatDate(record.due_date)}` : null,
        `${Number(record.balance_due_amount).toLocaleString("en-US", {
          style: "currency",
          currency: "USD"
        })} open`
      ]
        .filter(Boolean)
        .join(" | ")
    }))
  );
  const recentFailedPaymentEvents = mapSamples(
    failedPaymentEventRecords.map((record) => ({
      id: record.id,
      label: `Invoice payment failure`,
      href: `/invoices/${record.invoice_id}`,
      meta: formatDateTime(record.occurred_at)
    }))
  );
  const recentApprovedChangeOrders = mapSamples(
    approvedChangeOrderRecords.map((record) => ({
      id: record.id,
      label: `Change order ${record.reference_number}`,
      href: `/change-orders/${record.id}`,
      meta: record.approved_at ? `approved ${formatDateTime(record.approved_at)}` : null
    }))
  );

  const latestSignedContract = signedContractRecords[0];
  const latestReadyProject = readyProjectRecords[0];
  const latestEstimateAwaitingApproval = estimateAwaitingApprovalRecords[0];
  const latestContractAwaitingSignature = contractAwaitingSignatureRecords[0];
  const latestScheduledJob = scheduledJobRecords[0];
  const latestCommunicationThread = communicationThreadRecords[0];
  const latestOverdueInvoice = overdueInvoiceRecords[0];
  const latestFailedPaymentEvent = failedPaymentEventRecords[0];
  const latestApprovedChangeOrder = approvedChangeOrderRecords[0];

  const eligibilityPreviews = [
    buildEligibilityPreview({
      workflowSettings,
      category: "customer_message_received",
      sampleLabel: latestCommunicationThread
        ? `${latestCommunicationThread.subject_type.replaceAll("_", " ")} thread`
        : "No recent communication thread sample",
      context: latestCommunicationThread
        ? {
            organizationId,
            threadId: latestCommunicationThread.id,
            lastMessageAt: latestCommunicationThread.updated_at
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "estimate_awaiting_approval",
      sampleLabel: latestEstimateAwaitingApproval
        ? `Estimate ${latestEstimateAwaitingApproval.reference_number}`
        : "No sent estimate awaiting approval sample",
      context: latestEstimateAwaitingApproval
        ? {
            organizationId,
            estimateId: latestEstimateAwaitingApproval.id,
            status: latestEstimateAwaitingApproval.status,
            sentAt: latestEstimateAwaitingApproval.sent_at
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "contract_awaiting_signature",
      sampleLabel: latestContractAwaitingSignature
        ? `Contract ${latestContractAwaitingSignature.reference_number}`
        : "No contract awaiting signature sample",
      context: latestContractAwaitingSignature
        ? {
            organizationId,
            contractId: latestContractAwaitingSignature.id,
            status: latestContractAwaitingSignature.status,
            sentAt: latestContractAwaitingSignature.sent_at,
            signedAt: latestContractAwaitingSignature.signed_at
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "contract_signed",
      sampleLabel: latestSignedContract
        ? `Contract ${latestSignedContract.reference_number}`
        : "No recent signed contract sample",
      context: latestSignedContract
        ? {
            organizationId,
            contractId: latestSignedContract.id,
            signedAt: latestSignedContract.signed_at
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "deposit_paid_ready_to_schedule",
      sampleLabel: latestReadyProject
        ? latestReadyProject.name
        : "No ready-to-schedule project sample",
      context: latestReadyProject
        ? {
            organizationId,
            projectId: latestReadyProject.id,
            readyToScheduleAt: latestReadyProject.ready_to_schedule_at
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "payment_failed",
      sampleLabel: latestFailedPaymentEvent
        ? `Invoice ${latestFailedPaymentEvent.invoice_id}`
        : "No failed payment sample",
      context: latestFailedPaymentEvent
        ? {
            organizationId,
            invoiceId: latestFailedPaymentEvent.invoice_id,
            paymentEventType: latestFailedPaymentEvent.event_type,
            occurredAt: latestFailedPaymentEvent.occurred_at
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "invoice_overdue",
      sampleLabel: latestOverdueInvoice
        ? `Invoice ${latestOverdueInvoice.reference_number}`
        : "No overdue invoice sample",
      context: latestOverdueInvoice
        ? {
            organizationId,
            invoiceId: latestOverdueInvoice.id,
            dueDate: latestOverdueInvoice.due_date,
            status: latestOverdueInvoice.status,
            balanceDueAmount: latestOverdueInvoice.balance_due_amount
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "change_order_approved",
      sampleLabel: latestApprovedChangeOrder
        ? `Change order ${latestApprovedChangeOrder.reference_number}`
        : "No approved change order sample",
      context: latestApprovedChangeOrder
        ? {
            organizationId,
            changeOrderId: latestApprovedChangeOrder.id,
            approvedAt: latestApprovedChangeOrder.approved_at
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "schedule_reminder",
      sampleLabel: latestScheduledJob
        ? deriveJobDisplayLabel(latestScheduledJob)
        : "No scheduled job sample",
      context: latestScheduledJob
        ? {
            organizationId,
            jobId: latestScheduledJob.id,
            scheduledDate: latestScheduledJob.scheduled_date
          }
        : {
            organizationId
          }
    }),
    buildEligibilityPreview({
      workflowSettings,
      category: "crew_assignment_reminder",
      sampleLabel: latestScheduledJob
        ? deriveJobDisplayLabel(latestScheduledJob)
        : "No scheduled job sample",
      context: latestScheduledJob
        ? {
            organizationId,
            jobId: latestScheduledJob.id,
            scheduledDate: latestScheduledJob.scheduled_date,
            crewVendorId: latestScheduledJob.crew_vendor_id
          }
        : {
            organizationId
          }
    })
  ];

  const categories: AutomationPlanningCategory[] = [
    {
      key: "estimate_awaiting_approval",
      label: "Estimate awaiting approval",
      status: "implemented",
      source: "Canonical estimates with sent status",
      triggerSource:
        "Manual notification-only runner finds sent estimates that have not been approved or rejected.",
      intendedAction:
        "Notify configured contractor roles to review the estimate and decide manual customer follow-up.",
      missingDependency:
        "No scheduler or customer-facing send path exists; execution is manual and in-app only.",
      notificationsState:
        "Manual automation can create canonical notification_events for configured recipient roles.",
      messagesState: "No customer message automation path exists for estimate follow-up.",
      executionState:
        "Manual notification-only execution is available from /settings/automation.",
      dependencyState: `${formatPlural(counts.estimatesAwaitingApproval, "sent estimate")} currently await approval.`,
      recentSamples:
        recentEstimatesAwaitingApproval.length > 0
          ? recentEstimatesAwaitingApproval
          : ["No sent estimates awaiting approval are available yet."]
    },
    {
      key: "contract_awaiting_signature",
      label: "Contract awaiting signature",
      status: "implemented",
      source: "Canonical contracts with sent or viewed status and incomplete signature state",
      triggerSource:
        "Manual notification-only runner finds sent/viewed contracts that have not been signed, declined, or voided.",
      intendedAction:
        "Notify configured contractor roles to review signer state and decide manual signature follow-up.",
      missingDependency:
        "No scheduler, e-sign provider integration, or customer-facing send path exists; execution is manual and in-app only.",
      notificationsState:
        "Manual automation can create canonical notification_events for configured recipient roles.",
      messagesState: "No customer message automation path exists for signature follow-up.",
      executionState:
        "Manual notification-only execution is available from /settings/automation.",
      dependencyState: `${formatPlural(counts.contractsAwaitingSignature, "contract")} currently await signature.`,
      recentSamples:
        recentContractsAwaitingSignature.length > 0
          ? recentContractsAwaitingSignature
          : ["No contracts awaiting signature are available yet."]
    },
    {
      key: "contract_signed",
      label: "Contract signed follow-up",
      status: "foundation",
      source: "Canonical contracts, contract signature lifecycle, and contract notification events",
      triggerSource: "Contract reaches canonical signed state or contract.signed notification event.",
      intendedAction:
        "Route contractor staff back into project readiness for deposit, financing, and downstream handoff review after signature completion.",
      missingDependency:
        "Missing execution layer and automation-specific delivery preferences or templates.",
      notificationsState:
        counts.signedContractNotificationEvents > 0
          ? `${formatPlural(counts.signedContractNotificationEvents, "contract-signed notification event")} recorded.`
          : "Contract-signed notification event foundation exists, but no signed notification has been recorded yet.",
      messagesState: "No message automation path exists; follow-up remains human-driven.",
      executionState: "No manual runner is enabled for this category yet.",
      dependencyState: `${formatPlural(counts.signedContracts, "signed contract")} on the canonical chain. ${formatBooleanLabel(
        workflowSettings.requireContractSignatureBeforeJobScheduling,
        "Signed contract is already a workflow readiness dependency.",
        "Signed contract is tracked, but scheduling does not require it in workflow defaults."
      )}`,
      recentSamples:
        recentSignedContracts.length > 0
          ? recentSignedContracts
          : ["No recent signed contracts are available yet."]
    },
    {
      key: "deposit_paid_ready_to_schedule",
      label: "Deposit paid / ready-to-schedule",
      status: "foundation",
      source: "Canonical payments, payment events, project commercial readiness, and organization workflow settings",
      triggerSource:
        "Payment succeeds on the canonical payment-event stream and project readiness clears deposit-related gates.",
      intendedAction:
        "Flag when payment and workflow gates indicate a project can move into operational scheduling review.",
      missingDependency:
        "Missing dedicated readiness-trigger event, execution layer, and delivery preferences.",
      notificationsState:
        counts.paidPaymentEvents > 0
          ? `${formatPlural(counts.paidPaymentEvents, "paid payment event")} recorded, but no dedicated ready-to-schedule automation event exists.`
          : "Payment event foundation exists, but no paid payment event has been recorded yet.",
      messagesState: "No message automation path exists for deposit or readiness handoff.",
      executionState: "No manual runner is enabled for this category yet.",
      dependencyState: `${formatPlural(counts.readyProjects, "project")} currently marked ready to schedule. ${formatBooleanLabel(
        workflowSettings.requireDepositBeforeJobScheduling,
        "Deposit is required before scheduling in organization workflow defaults.",
        "Deposit is not required before scheduling in organization workflow defaults."
      )}`,
      recentSamples:
        recentReadyProjects.length > 0
          ? recentReadyProjects
          : ["No recently ready-to-schedule projects are available yet."]
    },
    {
      key: "schedule_reminder",
      label: "Schedule reminder",
      status: "planned",
      source: "Canonical jobs with scheduled dates",
      triggerSource: "Scheduled date approaches on the canonical job record.",
      intendedAction:
        "Send pre-work reminders or internal preparation prompts ahead of scheduled service dates.",
      missingDependency:
        "Missing reminder event layer, delivery preferences, templates, and execution scheduler.",
      notificationsState: "No date-driven schedule reminder notification event exists yet.",
      messagesState: "No reminder message workflow exists yet.",
      executionState: "No manual runner is enabled for this category yet.",
      dependencyState: `${formatPlural(counts.scheduledJobs, "scheduled job")} currently exist on the canonical job chain.`,
      recentSamples:
        recentScheduledJobs.length > 0
          ? recentScheduledJobs
          : ["No scheduled jobs are available yet."]
    },
    {
      key: "crew_assignment_reminder",
      label: "Crew assignment reminder",
      status: "foundation",
      source: "Canonical jobs and job assignments",
      triggerSource:
        "Scheduled work remains on the canonical job chain without crew assignment coverage.",
      intendedAction:
        "Draw attention to scheduled work that still lacks labor assignment before the day starts.",
      missingDependency:
        "Missing crew-gap notification event, delivery preferences, and execution scheduler.",
      notificationsState: "No crew-assignment reminder notification event exists yet.",
      messagesState: "No crew reminder message workflow exists yet.",
      executionState: "No manual runner is enabled for this category yet.",
      dependencyState: `${formatPlural(
        counts.scheduledJobsWithoutCrewVendor,
        "scheduled job"
      )} currently have no crew vendor on the canonical job record.`,
      recentSamples:
        recentScheduledJobs.length > 0
          ? recentScheduledJobs
          : ["No scheduled jobs are available yet."]
    },
    {
      key: "customer_message_received",
      label: "Customer message received",
      status: "implemented",
      source: "Canonical communication threads, communication messages, notification events, and per-user notifications",
      triggerSource:
        "Manual notification-only runner finds customer-authored messages on existing canonical threads.",
      intendedAction:
        "Show message pressure to contractor users so they can review, triage, and reply from the same canonical thread.",
      missingDependency:
        "No scheduler, background worker, or provider sending exists; execution is manual and in-app only.",
      notificationsState:
        counts.communicationNotificationEvents > 0
          ? `${formatPlural(counts.communicationNotificationEvents, "communication notification event")} recorded and triage is live on /communications.`
          : "Communication notification foundation exists, but no message-posted notification has been recorded yet.",
      messagesState:
        counts.communicationMessages > 0
          ? `${formatPlural(counts.communicationMessages, "communication message")} stored on canonical threads.`
          : "Canonical thread and message foundation exists, but no messages are stored yet.",
      executionState:
        "Manual notification-only execution is available from /settings/automation.",
      dependencyState: `${formatPlural(
        counts.communicationThreadsNeedingResponse,
        "active communication thread"
      )} currently carry stored thread activity.`,
      recentSamples:
        recentCommunicationThreads.length > 0
          ? recentCommunicationThreads
          : ["No recent communication thread activity is available yet."]
    },
    {
      key: "invoice_overdue",
      label: "Invoice overdue",
      status: "implemented",
      source: "Canonical invoices, due dates, balances, and the contractor payments queue",
      triggerSource:
        "Manual notification-only runner finds canonical invoices past due with open balances.",
      intendedAction:
        "Surface collections pressure when invoices move past due without creating a second receivables engine.",
      missingDependency:
        "No scheduler, customer-facing collections send, or payment retry path exists; execution is manual and in-app only.",
      notificationsState:
        "Manual automation can create canonical notification_events for configured recipient roles.",
      messagesState: "No collections message automation path exists yet.",
      executionState:
        "Manual notification-only execution is available from /settings/automation.",
      dependencyState: `${formatPlural(counts.overdueInvoices, "overdue invoice")} currently exist on the canonical billing chain.`,
      recentSamples:
        recentOverdueInvoices.length > 0
          ? recentOverdueInvoices
          : ["No overdue invoices are available yet."]
    },
    {
      key: "payment_failed",
      label: "Payment failed",
      status: "implemented",
      source: "Canonical payment events, invoice notification events, and the contractor payments exception queue",
      triggerSource:
        "payment_failed event is written on the canonical payment-event stream and mirrored into notifications.",
      intendedAction:
        "Route failed payment outcomes back into manual collections follow-through on the invoice chain.",
      missingDependency:
        "No missing dependency for visibility; customer-facing automation still lacks templates and preferences.",
      notificationsState:
        counts.failedPaymentNotificationEvents > 0
          ? `${formatPlural(counts.failedPaymentNotificationEvents, "failed-payment notification event")} recorded through canonical notifications.`
          : "Failed payment notification foundation exists, but no failed-payment notification has been recorded yet.",
      messagesState: "No customer message automation path exists for failed payment follow-up.",
      executionState:
        "No manual runner is enabled for this category yet; implemented behavior is exception visibility on canonical payment and invoice surfaces.",
      dependencyState: `${formatPlural(counts.failedPaymentEvents, "failed payment event")} recorded on the canonical payment-event stream.`,
      recentSamples:
        recentFailedPaymentEvents.length > 0
          ? recentFailedPaymentEvents
          : ["No recent failed payment events are available yet."]
    },
    {
      key: "change_order_approved",
      label: "Change order approved",
      status: "foundation",
      source: "Canonical change orders, immutable approved snapshots, and change-order notification events",
      triggerSource:
        "Change order reaches approved state on the canonical record or change_order.approved notification event.",
      intendedAction:
        "Prompt downstream billing or schedule-of-values review after customer approval lands on the same shared change-order chain.",
      missingDependency:
        "Missing downstream follow-up delivery preferences, templates, and execution layer.",
      notificationsState:
        counts.approvedChangeOrderNotificationEvents > 0
          ? `${formatPlural(counts.approvedChangeOrderNotificationEvents, "approved change-order notification event")} recorded.`
          : "Approved change-order notification foundation exists, but no approval notification has been recorded yet.",
      messagesState: "No message automation path exists for approved scope-change follow-up.",
      executionState: "No manual runner is enabled for this category yet.",
      dependencyState: `${formatPlural(counts.approvedChangeOrders, "approved change order")} currently exist on the canonical workflow chain.`,
      recentSamples:
        recentApprovedChangeOrders.length > 0
          ? recentApprovedChangeOrders
          : ["No recently approved change orders are available yet."]
    }
  ];

  const readinessPlan = buildAutomationPlanningSummaries({
    preferences: workflowSettings.automationNotificationPreferences,
    eligibilityPreviews,
    templateDefinitions: automationNotificationTemplateDefinitions
  });
  const manualExecutionCategoryCount = categories.filter((item) =>
    [
      "customer_message_received",
      "estimate_awaiting_approval",
      "contract_awaiting_signature",
      "invoice_overdue"
    ].includes(item.key)
  ).length;

  return {
    workflowSettings,
    summary: {
      implementedCount: categories.filter((item) => item.status === "implemented").length,
      foundationCount: categories.filter((item) => item.status === "foundation").length,
      plannedCount: categories.filter((item) => item.status === "planned").length,
      executionEnabledCount: manualExecutionCategoryCount
    },
    readiness: {
      automationExecution: {
        available: true,
        label: "Manual only",
        detail:
          "Manual tenant-scoped notification-only execution is available from /settings/automation; no cron, queue, background job, email, SMS, or provider sending exists."
      },
      notificationFoundation: {
        available: counts.communicationNotificationEvents > 0 || counts.signedContractNotificationEvents > 0 || counts.failedPaymentNotificationEvents > 0 || counts.approvedChangeOrderNotificationEvents > 0,
        label:
          counts.communicationNotificationEvents > 0 || counts.signedContractNotificationEvents > 0 || counts.failedPaymentNotificationEvents > 0 || counts.approvedChangeOrderNotificationEvents > 0
            ? "Available"
            : "Foundation only",
        detail:
          "Canonical notification_events and per-user notifications exist for workflow visibility and triage."
      },
      communicationFoundation: {
        available: counts.communicationThreads > 0 || counts.communicationMessages > 0,
        label:
          counts.communicationThreads > 0 || counts.communicationMessages > 0
            ? "Available"
            : "Foundation only",
        detail:
          "Canonical communication threads and immutable messages exist, with contractor-side review, triage, and reply already live."
      },
      schedulingFoundation: {
        available: counts.scheduledJobs > 0,
        label: counts.scheduledJobs > 0 ? "Available" : "Foundation only",
        detail:
          "Canonical jobs, scheduled dates, and crew assignment rows exist, but no scheduling automation execution exists."
      },
      paymentFoundation: {
        available: counts.paidPaymentEvents > 0 || counts.failedPaymentEvents > 0,
        label:
          counts.paidPaymentEvents > 0 || counts.failedPaymentEvents > 0
            ? "Available"
            : "Foundation only",
        detail:
          "Canonical payment_events and payment-related notifications exist for visibility and exception review."
      }
    },
    recommendations: [
      {
        title: "Build notification-only automations first",
        detail:
          "Manual internal visibility now creates canonical notification_events and per-user notifications before any outbound or state-changing workflow is attempted."
      },
      {
        title: "Do not automate customer messages yet",
        detail:
          "Customer-facing send behavior should wait until shared templates, delivery preferences, and explicit organization-level communication rules exist."
      },
      {
        title: "Keep financial automations read-only",
        detail:
          "Do not auto-update invoices, payments, deposits, or receivable state; use payment and overdue events only for visibility and routing."
      },
      {
        title: "Keep scheduling automations read-only",
        detail:
          "Do not auto-create jobs, auto-assign crew, or auto-reschedule work; use scheduled jobs and crew gaps only to surface internal attention."
      }
    ],
    counts,
    eligibilityPreviews,
    readinessPlan,
    categories
  };
}
