import "server-only";

import type {
  AutomationNotificationPreferenceCategory,
  AutomationNotificationPreferenceRole,
  CanonicalRecordSubjectType,
  NotificationEventCategory,
  NotificationEventSeverity,
  OrganizationWorkflowSettings
} from "@floorconnector/types";

import {
  getAutomationEventEligibility,
  type AutomationEligibilityContext
} from "@/lib/automation/eligibility";
import { automationNotificationTemplateDefinitionsByCategory } from "@/lib/automation/templates";
import { createNotificationEvent } from "@/lib/notifications/system";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const AUTOMATION_TEMPLATE_VERSION = 1;
const AUTOMATION_RUN_LIMIT_PER_TRIGGER = 25;

export type AutomationRunStatus = "skipped" | "executed" | "blocked" | "failed";

type FirstAutomationTriggerCategory =
  | "customer_message_received"
  | "estimate_awaiting_approval"
  | "contract_awaiting_signature"
  | "invoice_overdue";

export type AutomationRunLogItem = {
  id: string;
  category: AutomationNotificationPreferenceCategory;
  status: AutomationRunStatus;
  reason: string | null;
  subjectType: CanonicalRecordSubjectType | null;
  subjectId: string | null;
  notificationEventId: string | null;
  createdAt: string;
};

export type AutomationRunHistorySummary = {
  totalCount: number;
  recentRuns: AutomationRunLogItem[];
};

export type ManualAutomationRunResult = {
  evaluatedCount: number;
  executedCount: number;
  blockedCount: number;
  skippedCount: number;
  failedCount: number;
};

type Candidate = {
  category: FirstAutomationTriggerCategory;
  triggerType: string;
  sourceTable: string;
  sourceRecordId: string;
  sourceEventId?: string | null;
  subjectType: CanonicalRecordSubjectType;
  subjectId: string;
  customerId: string | null;
  projectId: string | null;
  stateMarker: string;
  title: string;
  message: string;
  linkPath: string;
  notificationCategory: NotificationEventCategory;
  severity: NotificationEventSeverity;
  groupKey: string;
  occurredAt?: string | null;
  payload: Record<string, unknown>;
  eligibilityContext: AutomationEligibilityContext<FirstAutomationTriggerCategory>;
};

type AutomationRunRow = {
  id: string;
  company_id: string;
  category: AutomationNotificationPreferenceCategory;
  status: AutomationRunStatus;
  reason: string | null;
  subject_type: CanonicalRecordSubjectType | null;
  subject_id: string | null;
  notification_event_id: string | null;
  created_at: string;
};

type ReservationResult =
  | {
      reserved: true;
      runId: string;
    }
  | {
      reserved: false;
      existingStatus?: AutomationRunStatus;
    };

function getPreference(
  workflowSettings: Pick<OrganizationWorkflowSettings, "automationNotificationPreferences">,
  category: AutomationNotificationPreferenceCategory
) {
  return workflowSettings.automationNotificationPreferences.find(
    (preference) => preference.category === category
  );
}

function hashRecipients(recipientUserIds: string[]) {
  return recipientUserIds.length > 0 ? recipientUserIds.sort().join(".") : "none";
}

function buildIdempotencyKey(input: {
  organizationId: string;
  category: AutomationNotificationPreferenceCategory;
  sourceTable: string;
  sourceRecordId: string;
  stateMarker: string;
  recipientUserIds: string[];
}) {
  return [
    "automation",
    "v1",
    input.category,
    input.organizationId,
    input.sourceTable,
    input.sourceRecordId,
    input.stateMarker,
    `template:${AUTOMATION_TEMPLATE_VERSION}`,
    `recipients:${hashRecipients(input.recipientUserIds)}`
  ].join(":");
}

function mapAutomationRunRow(row: AutomationRunRow): AutomationRunLogItem {
  return {
    id: row.id,
    category: row.category,
    status: row.status,
    reason: row.reason,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    notificationEventId: row.notification_event_id,
    createdAt: row.created_at
  };
}

async function listRecipientUserIds(input: {
  organizationId: string;
  roles: AutomationNotificationPreferenceRole[];
}) {
  if (input.roles.length === 0) {
    return [];
  }

  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("company_memberships")
    .select("user_id")
    .eq("company_id", input.organizationId)
    .eq("membership_status", "active")
    .in("membership_role", input.roles);

  if (response.error) {
    throw new Error(`Unable to resolve automation recipients: ${response.error.message}`);
  }

  return Array.from(
    new Set(
      ((response.data as Array<{ user_id?: string | null }> | null) ?? [])
        .map((row) => row.user_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  );
}

async function reserveAutomationRun(input: {
  organizationId: string;
  candidate: Candidate;
  idempotencyKey: string;
  status: AutomationRunStatus;
  reason: string;
  blockers: string[];
  recipientUserIds: string[];
  userId: string;
}): Promise<ReservationResult> {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("automation_runs")
    .insert({
      company_id: input.organizationId,
      category: input.candidate.category,
      trigger_type: input.candidate.triggerType,
      source_table: input.candidate.sourceTable,
      source_record_id: input.candidate.sourceRecordId,
      source_event_id: input.candidate.sourceEventId ?? null,
      subject_type: input.candidate.subjectType,
      subject_id: input.candidate.subjectId,
      customer_id: input.candidate.customerId,
      project_id: input.candidate.projectId,
      idempotency_key: input.idempotencyKey,
      status: input.status,
      reason: input.reason,
      blockers: input.blockers,
      recipient_user_ids: input.recipientUserIds,
      template_version: AUTOMATION_TEMPLATE_VERSION,
      payload: input.candidate.payload,
      executed_at: input.status === "executed" ? new Date().toISOString() : null,
      created_by_user_id: input.userId
    })
    .select("id")
    .single();

  if (response.error) {
    if (response.error.code === "23505") {
      return { reserved: false };
    }

    throw new Error(`Unable to reserve automation run: ${response.error.message}`);
  }

  const row = response.data as { id?: string } | null;

  if (!row?.id) {
    throw new Error("Unable to reserve automation run: insert returned no id.");
  }

  return {
    reserved: true,
    runId: row.id
  };
}

async function updateAutomationRunAfterNotification(input: {
  organizationId: string;
  runId: string;
  notificationEventId: string;
}) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("automation_runs")
    .update({
      notification_event_id: input.notificationEventId,
      executed_at: new Date().toISOString()
    })
    .eq("company_id", input.organizationId)
    .eq("id", input.runId);

  if (response.error) {
    throw new Error(`Unable to link automation run to notification: ${response.error.message}`);
  }
}

async function markAutomationRunFailed(input: {
  organizationId: string;
  runId: string;
  message: string;
}) {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("automation_runs")
    .update({
      status: "failed",
      reason: input.message,
      blockers: [input.message]
    })
    .eq("company_id", input.organizationId)
    .eq("id", input.runId);

  if (response.error) {
    throw new Error(`Unable to mark automation run failed: ${response.error.message}`);
  }
}

async function listCustomerMessageCandidates(organizationId: string): Promise<Candidate[]> {
  const admin = getSupabaseAdminClient();
  const messagesResponse = await admin
    .from("communication_messages")
    .select("id, thread_id, customer_id, project_id, body, created_at")
    .eq("company_id", organizationId)
    .eq("sender_type", "portal_user")
    .order("created_at", { ascending: false })
    .limit(AUTOMATION_RUN_LIMIT_PER_TRIGGER);

  if (messagesResponse.error) {
    throw new Error(`Unable to load customer message automation candidates: ${messagesResponse.error.message}`);
  }

  const messages =
    (messagesResponse.data as Array<{
      id: string;
      thread_id: string;
      customer_id: string;
      project_id: string;
      body: string;
      created_at: string;
    }> | null) ?? [];
  const threadIds = [...new Set(messages.map((message) => message.thread_id))];

  if (threadIds.length === 0) {
    return [];
  }

  const threadsResponse = await admin
    .from("communication_threads")
    .select("id, subject_type, subject_id")
    .eq("company_id", organizationId)
    .in("id", threadIds);

  if (threadsResponse.error) {
    throw new Error(`Unable to load customer message threads: ${threadsResponse.error.message}`);
  }

  const threadsById = new Map(
    ((threadsResponse.data as Array<{
      id: string;
      subject_type: CanonicalRecordSubjectType;
      subject_id: string;
    }> | null) ?? []).map((thread) => [thread.id, thread])
  );

  return messages
    .map((message): Candidate | null => {
      const thread = threadsById.get(message.thread_id);

      if (!thread) {
        return null;
      }

      const preview = message.body.length > 140 ? `${message.body.slice(0, 137)}...` : message.body;

      return {
        category: "customer_message_received",
        triggerType: "manual_check",
        sourceTable: "communication_messages",
        sourceRecordId: message.id,
        subjectType: thread.subject_type,
        subjectId: thread.subject_id,
        customerId: message.customer_id,
        projectId: message.project_id,
        stateMarker: `message:${message.id}`,
        title: "Customer message needs review",
        message: preview || "A customer message was posted on a canonical communication thread.",
        linkPath: `/communications?threadId=${message.thread_id}`,
        notificationCategory: "communication",
        severity: "warning",
        groupKey: `automation:customer_message_received:${message.thread_id}`,
        occurredAt: message.created_at,
        payload: {
          automationCategory: "customer_message_received",
          threadId: message.thread_id,
          messageId: message.id,
          templateVersion: AUTOMATION_TEMPLATE_VERSION
        },
        eligibilityContext: {
          organizationId,
          threadId: message.thread_id,
          lastMessageAt: message.created_at
        }
      };
    })
    .filter((candidate): candidate is Candidate => candidate !== null);
}

async function listEstimateAwaitingApprovalCandidates(
  organizationId: string
): Promise<Candidate[]> {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("estimates")
    .select("id, reference_number, customer_id, project_id, status, sent_at")
    .eq("company_id", organizationId)
    .eq("status", "sent")
    .order("sent_at", { ascending: true, nullsFirst: false })
    .limit(AUTOMATION_RUN_LIMIT_PER_TRIGGER);

  if (response.error) {
    throw new Error(`Unable to load estimate automation candidates: ${response.error.message}`);
  }

  return ((response.data as Array<{
    id: string;
    reference_number: string;
    customer_id: string;
    project_id: string;
    status: string;
    sent_at: string | null;
  }> | null) ?? []).map((estimate) => ({
    category: "estimate_awaiting_approval",
    triggerType: "manual_check",
    sourceTable: "estimates",
    sourceRecordId: estimate.id,
    subjectType: "estimate",
    subjectId: estimate.id,
    customerId: estimate.customer_id,
    projectId: estimate.project_id,
    stateMarker: `sent:${estimate.id}:${estimate.sent_at ?? "unknown"}`,
    title: `Estimate ${estimate.reference_number} is awaiting approval`,
    message:
      "A sent estimate is still awaiting customer approval. Review the estimate and follow up manually.",
    linkPath: `/estimates/${estimate.id}`,
    notificationCategory: "estimates",
    severity: "warning",
    groupKey: `automation:estimate_awaiting_approval:${estimate.id}`,
    occurredAt: estimate.sent_at,
    payload: {
      automationCategory: "estimate_awaiting_approval",
      estimateId: estimate.id,
      referenceNumber: estimate.reference_number,
      sentAt: estimate.sent_at,
      templateVersion: AUTOMATION_TEMPLATE_VERSION
    },
    eligibilityContext: {
      organizationId,
      estimateId: estimate.id,
      status: estimate.status,
      sentAt: estimate.sent_at
    }
  }));
}

async function listContractAwaitingSignatureCandidates(
  organizationId: string
): Promise<Candidate[]> {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("contracts")
    .select("id, reference_number, title, customer_id, project_id, status, sent_at, signature_started_at, signed_at")
    .eq("company_id", organizationId)
    .in("status", ["sent", "viewed"])
    .is("signed_at", null)
    .is("signature_declined_at", null)
    .is("signature_voided_at", null)
    .order("sent_at", { ascending: true, nullsFirst: false })
    .limit(AUTOMATION_RUN_LIMIT_PER_TRIGGER);

  if (response.error) {
    throw new Error(`Unable to load contract automation candidates: ${response.error.message}`);
  }

  return ((response.data as Array<{
    id: string;
    reference_number: string;
    title: string;
    customer_id: string;
    project_id: string;
    status: string;
    sent_at: string | null;
    signature_started_at: string | null;
    signed_at: string | null;
  }> | null) ?? []).map((contract) => {
    const sentMarker = contract.signature_started_at ?? contract.sent_at ?? "unknown";

    return {
      category: "contract_awaiting_signature",
      triggerType: "manual_check",
      sourceTable: "contracts",
      sourceRecordId: contract.id,
      subjectType: "contract",
      subjectId: contract.id,
      customerId: contract.customer_id,
      projectId: contract.project_id,
      stateMarker: `signature:${contract.id}:${sentMarker}`,
      title: `Contract ${contract.reference_number} is awaiting signature`,
      message:
        "A sent contract is still awaiting signature completion. Review signer status and follow up manually.",
      linkPath: `/contracts/${contract.id}`,
      notificationCategory: "contracts",
      severity: "warning",
      groupKey: `automation:contract_awaiting_signature:${contract.id}`,
      occurredAt: contract.signature_started_at ?? contract.sent_at,
      payload: {
        automationCategory: "contract_awaiting_signature",
        contractId: contract.id,
        referenceNumber: contract.reference_number,
        title: contract.title,
        sentAt: contract.sent_at,
        signatureStartedAt: contract.signature_started_at,
        templateVersion: AUTOMATION_TEMPLATE_VERSION
      },
      eligibilityContext: {
        organizationId,
        contractId: contract.id,
        status: contract.status,
        sentAt: contract.sent_at,
        signedAt: contract.signed_at
      }
    };
  });
}

async function listInvoiceOverdueCandidates(organizationId: string): Promise<Candidate[]> {
  const admin = getSupabaseAdminClient();
  const todayIso = new Date().toISOString().slice(0, 10);
  const response = await admin
    .from("invoices")
    .select("id, reference_number, customer_id, project_id, status, due_date, balance_due_amount")
    .eq("company_id", organizationId)
    .not("due_date", "is", null)
    .not("status", "in", '("paid","void")')
    .lt("due_date", todayIso)
    .gt("balance_due_amount", "0")
    .order("due_date", { ascending: true })
    .limit(AUTOMATION_RUN_LIMIT_PER_TRIGGER);

  if (response.error) {
    throw new Error(`Unable to load invoice overdue automation candidates: ${response.error.message}`);
  }

  return ((response.data as Array<{
    id: string;
    reference_number: string;
    customer_id: string;
    project_id: string;
    status: string;
    due_date: string | null;
    balance_due_amount: string | number | null;
  }> | null) ?? []).map((invoice) => ({
    category: "invoice_overdue",
    triggerType: "manual_check",
    sourceTable: "invoices",
    sourceRecordId: invoice.id,
    subjectType: "invoice",
    subjectId: invoice.id,
    customerId: invoice.customer_id,
    projectId: invoice.project_id,
    stateMarker: `due:${invoice.id}:${invoice.due_date ?? "unknown"}:${todayIso}`,
    title: `Invoice ${invoice.reference_number} is overdue`,
    message:
      "An invoice is overdue with an open balance. Review collections follow-through manually.",
    linkPath: `/invoices/${invoice.id}`,
    notificationCategory: "payments",
    severity: "critical",
    groupKey: `automation:invoice_overdue:${invoice.id}`,
    occurredAt: new Date().toISOString(),
    payload: {
      automationCategory: "invoice_overdue",
      invoiceId: invoice.id,
      referenceNumber: invoice.reference_number,
      dueDate: invoice.due_date,
      balanceDueAmount: invoice.balance_due_amount,
      templateVersion: AUTOMATION_TEMPLATE_VERSION
    },
    eligibilityContext: {
      organizationId,
      invoiceId: invoice.id,
      status: invoice.status,
      dueDate: invoice.due_date,
      balanceDueAmount: invoice.balance_due_amount
    }
  }));
}

async function listManualAutomationCandidates(organizationId: string) {
  const [messages, estimates, contracts, invoices] = await Promise.all([
    listCustomerMessageCandidates(organizationId),
    listEstimateAwaitingApprovalCandidates(organizationId),
    listContractAwaitingSignatureCandidates(organizationId),
    listInvoiceOverdueCandidates(organizationId)
  ]);

  return [...messages, ...estimates, ...contracts, ...invoices];
}

async function executeCandidate(input: {
  organizationId: string;
  workflowSettings: OrganizationWorkflowSettings;
  candidate: Candidate;
  userId: string;
}): Promise<AutomationRunStatus> {
  const preference = getPreference(input.workflowSettings, input.candidate.category);
  const selectedRoles = preference?.notifyRoles ?? [];
  const recipientUserIds = await listRecipientUserIds({
    organizationId: input.organizationId,
    roles: selectedRoles
  });
  const eligibility = getAutomationEventEligibility({
    workflowSettings: input.workflowSettings,
    category: input.candidate.category,
    context: input.candidate.eligibilityContext
  });
  const blockers = [...eligibility.blockers];

  if (recipientUserIds.length === 0) {
    blockers.push("No active organization members matched the selected automation recipient roles.");
  }

  const shouldExecute = blockers.length === 0;
  const idempotencyStateMarker = shouldExecute
    ? input.candidate.stateMarker
    : `${input.candidate.stateMarker}:blocked:${new Date().toISOString().slice(0, 10)}`;
  const idempotencyKey = buildIdempotencyKey({
    organizationId: input.organizationId,
    category: input.candidate.category,
    sourceTable: input.candidate.sourceTable,
    sourceRecordId: input.candidate.sourceRecordId,
    stateMarker: idempotencyStateMarker,
    recipientUserIds
  });
  const reservation = await reserveAutomationRun({
    organizationId: input.organizationId,
    candidate: input.candidate,
    idempotencyKey,
    status: shouldExecute ? "executed" : "blocked",
    reason: shouldExecute
      ? "Manual notification-only automation created an in-app notification event."
      : "Manual notification-only automation did not execute because one or more blockers were present.",
    blockers,
    recipientUserIds,
    userId: input.userId
  });

  if (!reservation.reserved) {
    return "skipped";
  }

  if (!shouldExecute) {
    return "blocked";
  }

  try {
    const template =
      automationNotificationTemplateDefinitionsByCategory[input.candidate.category];
    const notificationEvent = await createNotificationEvent({
      organizationId: input.organizationId,
      category: input.candidate.notificationCategory,
      severity: input.candidate.severity,
      eventType: `automation.${input.candidate.category}`,
      subjectType: input.candidate.subjectType,
      subjectId: input.candidate.subjectId,
      customerId: input.candidate.customerId,
      projectId: input.candidate.projectId,
      actorType: "system",
      title: input.candidate.title,
      message: input.candidate.message,
      linkPath: input.candidate.linkPath,
      groupKey: input.candidate.groupKey,
      payload: {
        ...input.candidate.payload,
        idempotencyKey,
        templateName: template.displayName
      },
      occurredAt: input.candidate.occurredAt ?? new Date().toISOString(),
      recipientUserIds
    });

    await updateAutomationRunAfterNotification({
      organizationId: input.organizationId,
      runId: reservation.runId,
      notificationEventId: notificationEvent.id
    });

    return "executed";
  } catch (error) {
    await markAutomationRunFailed({
      organizationId: input.organizationId,
      runId: reservation.runId,
      message: error instanceof Error ? error.message : "Unknown automation notification failure."
    });

    return "failed";
  }
}

export async function executeManualNotificationAutomation(input: {
  organizationId: string;
  userId: string;
}): Promise<ManualAutomationRunResult> {
  const workflowSettings = await getOrganizationWorkflowSettings(input.organizationId);
  const candidates = await listManualAutomationCandidates(input.organizationId);
  const result: ManualAutomationRunResult = {
    evaluatedCount: candidates.length,
    executedCount: 0,
    blockedCount: 0,
    skippedCount: 0,
    failedCount: 0
  };

  for (const candidate of candidates) {
    const status = await executeCandidate({
      organizationId: input.organizationId,
      workflowSettings,
      candidate,
      userId: input.userId
    });

    if (status === "executed") {
      result.executedCount += 1;
    } else if (status === "blocked") {
      result.blockedCount += 1;
    } else if (status === "skipped") {
      result.skippedCount += 1;
    } else {
      result.failedCount += 1;
    }
  }

  return result;
}

export async function getAutomationRunHistory(
  organizationId: string
): Promise<AutomationRunHistorySummary> {
  const admin = getSupabaseAdminClient();
  const response = await admin
    .from("automation_runs")
    .select(
      `
        id,
        company_id,
        category,
        status,
        reason,
        subject_type,
        subject_id,
        notification_event_id,
        created_at
      `,
      { count: "exact" }
    )
    .eq("company_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (response.error) {
    throw new Error(`Unable to load automation run history: ${response.error.message}`);
  }

  return {
    totalCount: response.count ?? 0,
    recentRuns: ((response.data as AutomationRunRow[] | null) ?? []).map(
      mapAutomationRunRow
    )
  };
}
