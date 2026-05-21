import type {
  AutomationNotificationPreference,
  AutomationNotificationPreferenceCategory,
  OrganizationWorkflowSettings
} from "@floorconnector/types";

import { buildDefaultAutomationNotificationPreferences } from "@/lib/automation/preferences";

type BaseAutomationEligibilityContext = {
  organizationId?: string | null;
};

export type AutomationEligibilityContextByCategory = {
  customer_message_received: BaseAutomationEligibilityContext & {
    threadId?: string | null;
    lastMessageAt?: string | null;
  };
  estimate_awaiting_approval: BaseAutomationEligibilityContext & {
    estimateId?: string | null;
    sentAt?: string | null;
    status?: string | null;
  };
  contract_awaiting_signature: BaseAutomationEligibilityContext & {
    contractId?: string | null;
    sentAt?: string | null;
    status?: string | null;
    signedAt?: string | null;
  };
  contract_signed: BaseAutomationEligibilityContext & {
    contractId?: string | null;
    signedAt?: string | null;
  };
  deposit_paid_ready_to_schedule: BaseAutomationEligibilityContext & {
    projectId?: string | null;
    readyToScheduleAt?: string | null;
  };
  payment_failed: BaseAutomationEligibilityContext & {
    invoiceId?: string | null;
    paymentEventType?: string | null;
    occurredAt?: string | null;
  };
  invoice_overdue: BaseAutomationEligibilityContext & {
    invoiceId?: string | null;
    dueDate?: string | null;
    status?: string | null;
    balanceDueAmount?: string | number | null;
  };
  change_order_approved: BaseAutomationEligibilityContext & {
    changeOrderId?: string | null;
    approvedAt?: string | null;
  };
  schedule_reminder: BaseAutomationEligibilityContext & {
    jobId?: string | null;
    scheduledDate?: string | null;
  };
  crew_assignment_reminder: BaseAutomationEligibilityContext & {
    jobId?: string | null;
    scheduledDate?: string | null;
    crewVendorId?: string | null;
  };
};

export type AutomationEligibilityContext<
  TCategory extends AutomationNotificationPreferenceCategory
> = AutomationEligibilityContextByCategory[TCategory];

export type AutomationEventEligibilityResult<
  TCategory extends AutomationNotificationPreferenceCategory
> = {
  category: TCategory;
  isConfigured: boolean;
  isEnabledForFutureExecution: boolean;
  notifyRoles: AutomationNotificationPreference["notifyRoles"];
  executionAvailable: boolean;
  wouldBeEligible: boolean;
  reason: string;
  blockers: string[];
};

const manuallyExecutableCategories = new Set<AutomationNotificationPreferenceCategory>([
  "customer_message_received",
  "estimate_awaiting_approval",
  "contract_awaiting_signature",
  "invoice_overdue"
]);

function getAutomationNotificationPreference(
  workflowSettings: Pick<OrganizationWorkflowSettings, "automationNotificationPreferences">,
  category: AutomationNotificationPreferenceCategory
): AutomationNotificationPreference {
  return (
    workflowSettings.automationNotificationPreferences.find(
      (preference) => preference.category === category
    ) ??
    buildDefaultAutomationNotificationPreferences().find(
      (preference) => preference.category === category
    )!
  );
}

function hasOpenBalance(value: string | number | null | undefined) {
  if (value == null) {
    return false;
  }

  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) && amount > 0;
}

function getCategoryBlockers(
  category: AutomationNotificationPreferenceCategory,
  context: AutomationEligibilityContext<AutomationNotificationPreferenceCategory>
) {
  switch (category) {
    case "customer_message_received": {
      const messageContext =
        context as AutomationEligibilityContext<"customer_message_received">;
      return messageContext.threadId && messageContext.lastMessageAt
        ? []
        : ["No canonical communication thread activity is present in the current context."];
    }
    case "estimate_awaiting_approval": {
      const estimateContext =
        context as AutomationEligibilityContext<"estimate_awaiting_approval">;
      return estimateContext.estimateId && estimateContext.status === "sent"
        ? []
        : ["No sent canonical estimate awaiting customer approval is present in the current context."];
    }
    case "contract_awaiting_signature": {
      const contractContext =
        context as AutomationEligibilityContext<"contract_awaiting_signature">;
      return contractContext.contractId &&
        (contractContext.status === "sent" || contractContext.status === "viewed") &&
        !contractContext.signedAt
        ? []
        : ["No sent or viewed canonical contract awaiting signature is present in the current context."];
    }
    case "contract_signed": {
      const contractContext =
        context as AutomationEligibilityContext<"contract_signed">;
      return contractContext.contractId && contractContext.signedAt
        ? []
        : ["No signed canonical contract is present in the current context."];
    }
    case "deposit_paid_ready_to_schedule": {
      const readyContext =
        context as AutomationEligibilityContext<"deposit_paid_ready_to_schedule">;
      return readyContext.projectId && readyContext.readyToScheduleAt
        ? []
        : ["No canonical project is currently marked ready to schedule in the current context."];
    }
    case "payment_failed": {
      const paymentContext =
        context as AutomationEligibilityContext<"payment_failed">;
      return (
        paymentContext.invoiceId &&
        paymentContext.paymentEventType === "payment_failed"
      )
        ? []
        : ["No canonical failed payment event is present in the current context."];
    }
    case "invoice_overdue": {
      const invoiceContext =
        context as AutomationEligibilityContext<"invoice_overdue">;
      return invoiceContext.invoiceId &&
        Boolean(invoiceContext.dueDate) &&
        invoiceContext.status !== "paid" &&
        invoiceContext.status !== "void" &&
        hasOpenBalance(invoiceContext.balanceDueAmount)
        ? []
        : ["No canonical overdue invoice with an open balance is present in the current context."];
    }
    case "change_order_approved": {
      const changeOrderContext =
        context as AutomationEligibilityContext<"change_order_approved">;
      return changeOrderContext.changeOrderId && changeOrderContext.approvedAt
        ? []
        : ["No approved canonical change order is present in the current context."];
    }
    case "schedule_reminder": {
      const scheduleContext =
        context as AutomationEligibilityContext<"schedule_reminder">;
      return scheduleContext.jobId && scheduleContext.scheduledDate
        ? []
        : ["No scheduled canonical job is present in the current context."];
    }
    case "crew_assignment_reminder": {
      const crewContext =
        context as AutomationEligibilityContext<"crew_assignment_reminder">;
      if (!crewContext.jobId || !crewContext.scheduledDate) {
        return ["No scheduled canonical job is present in the current context."];
      }

      return crewContext.crewVendorId
        ? ["The current canonical job already has a crew vendor assigned."]
        : [];
    }
    default:
      return ["No canonical context is available for this category."];
  }
}

export function getAutomationEventEligibility<
  TCategory extends AutomationNotificationPreferenceCategory
>(input: {
  workflowSettings: Pick<OrganizationWorkflowSettings, "automationNotificationPreferences">;
  category: TCategory;
  context: AutomationEligibilityContext<TCategory>;
}): AutomationEventEligibilityResult<TCategory> {
  const preference = getAutomationNotificationPreference(
    input.workflowSettings,
    input.category
  );
  const blockers: string[] = [];
  const isConfigured =
    preference.enabledForFutureExecution || preference.notifyRoles.length > 0;

  if (!isConfigured) {
    blockers.push(
      "No saved future notification preference has been configured for this category yet."
    );
  }

  if (!preference.enabledForFutureExecution) {
    blockers.push("Saved preference keeps future execution intent turned off.");
  }

  if (preference.notifyRoles.length === 0) {
    blockers.push("No contractor roles are selected for future notification routing.");
  }

  blockers.push(...getCategoryBlockers(input.category, input.context));

  const wouldBeEligible = blockers.length === 0;
  const executionAvailable = manuallyExecutableCategories.has(input.category);

  return {
    category: input.category,
    isConfigured,
    isEnabledForFutureExecution: preference.enabledForFutureExecution,
    notifyRoles: preference.notifyRoles,
    executionAvailable,
    wouldBeEligible,
    reason: wouldBeEligible
      ? executionAvailable
        ? "Saved preferences and current canonical context qualify for the manual notification-only runner."
        : "Saved preferences and current canonical context would qualify for future notification-only automation once an execution layer exists."
      : executionAvailable
        ? "One or more saved-preference or canonical-context blockers prevent the manual notification-only runner from creating notifications."
        : "This remains a read-only preview. One or more saved-preference or canonical-context blockers prevent future execution eligibility.",
    blockers,
  };
}
