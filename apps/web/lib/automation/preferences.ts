import type {
  AutomationNotificationPreference,
  AutomationNotificationPreferenceCategory,
  AutomationNotificationPreferenceRole
} from "@floorconnector/types";

export const automationNotificationPreferenceCategories: readonly AutomationNotificationPreferenceCategory[] =
  [
    "customer_message_received",
    "estimate_awaiting_approval",
    "contract_awaiting_signature",
    "contract_signed",
    "deposit_paid_ready_to_schedule",
    "payment_failed",
    "invoice_overdue",
    "change_order_approved",
    "schedule_reminder",
    "crew_assignment_reminder"
  ] as const;

export const automationNotificationPreferenceRoles: readonly AutomationNotificationPreferenceRole[] =
  ["owner", "admin", "manager", "member"] as const;

export const automationNotificationPreferenceRoleOptions: readonly {
  role: AutomationNotificationPreferenceRole;
  label: string;
  description: string;
}[] = [
  {
    role: "owner",
    label: "Owners",
    description: "Organization owners who oversee the full workflow."
  },
  {
    role: "admin",
    label: "Admins",
    description: "Operational admins coordinating day-to-day execution."
  },
  {
    role: "manager",
    label: "Managers",
    description: "Managers responsible for queues, crews, and follow-through."
  },
  {
    role: "member",
    label: "Members",
    description: "General team members who should see future notifications."
  }
] as const;

export const automationNotificationPreferenceContent: Record<
  AutomationNotificationPreferenceCategory,
  {
    label: string;
    description: string;
  }
> = {
  customer_message_received: {
    label: "Customer message received",
    description:
      "Prepare which contractor roles should see future internal alerts when customers post into canonical communication threads."
  },
  estimate_awaiting_approval: {
    label: "Estimate awaiting approval",
    description:
      "Prepare internal routing for sent estimates that are still waiting on customer approval."
  },
  contract_awaiting_signature: {
    label: "Contract awaiting signature",
    description:
      "Prepare internal routing for sent or viewed contracts that are still waiting on signature completion."
  },
  contract_signed: {
    label: "Contract signed",
    description:
      "Prepare internal routing for future visibility when a canonical contract reaches signed status."
  },
  deposit_paid_ready_to_schedule: {
    label: "Deposit paid / ready to schedule",
    description:
      "Prepare who should be nudged when payment and workflow readiness indicate work is ready for scheduling review."
  },
  payment_failed: {
    label: "Payment failed",
    description:
      "Prepare exception-routing preferences for future failed-payment notifications without changing invoice or payment state."
  },
  invoice_overdue: {
    label: "Invoice overdue",
    description:
      "Prepare collections visibility preferences for future overdue alerts on the canonical invoice chain."
  },
  change_order_approved: {
    label: "Change order approved",
    description:
      "Prepare downstream review routing for future approved change-order notifications."
  },
  schedule_reminder: {
    label: "Schedule reminder",
    description:
      "Prepare pre-work reminder routing for future internal schedule notifications only."
  },
  crew_assignment_reminder: {
    label: "Crew assignment reminder",
    description:
      "Prepare attention-routing for future crew-gap reminders on scheduled canonical jobs."
  }
};

export function buildDefaultAutomationNotificationPreferences(): AutomationNotificationPreference[] {
  return automationNotificationPreferenceCategories.map((category) => ({
    category,
    enabledForFutureExecution: false,
    notifyRoles: []
  }));
}

export function normalizeAutomationNotificationPreferences(
  value: unknown
): AutomationNotificationPreference[] {
  const defaults = buildDefaultAutomationNotificationPreferences();

  if (!Array.isArray(value)) {
    return defaults;
  }

  const byCategory = new Map<
    AutomationNotificationPreferenceCategory,
    AutomationNotificationPreference
  >();

  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidate = entry as Partial<{
      category: string;
      enabledForFutureExecution: boolean;
      notifyRoles: unknown;
    }>;

    if (
      typeof candidate.category !== "string" ||
      !automationNotificationPreferenceCategories.includes(
        candidate.category as AutomationNotificationPreferenceCategory
      )
    ) {
      continue;
    }

    const category = candidate.category as AutomationNotificationPreferenceCategory;
    const notifyRoles = Array.isArray(candidate.notifyRoles)
      ? Array.from(
          new Set(
            candidate.notifyRoles.filter((role): role is AutomationNotificationPreferenceRole =>
              automationNotificationPreferenceRoleOptions.some(
                (option) => option.role === role
              )
            )
          )
        )
      : [];

    byCategory.set(category, {
      category,
      enabledForFutureExecution: candidate.enabledForFutureExecution === true,
      notifyRoles
    });
  }

  return defaults.map(
    (preference) => byCategory.get(preference.category) ?? preference
  );
}
