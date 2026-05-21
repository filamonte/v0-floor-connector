import type {
  AppointmentStatus,
  CommunicationPreferenceStatus,
  NotificationDeliveryStatus
} from "@floorconnector/types";

import type { AppointmentConfirmationEmailRecipient } from "./appointment-confirmation-email-core";

export type AppointmentReminderPreferenceSnapshot = {
  subjectType: "customer" | "customer_contact" | "contact";
  subjectId: string;
  status: CommunicationPreferenceStatus;
};

export type AppointmentReminderReadinessInput = {
  customerVisible: boolean;
  customerId: string | null;
  projectId: string | null;
  startsAt: string | null;
  status: AppointmentStatus;
  eligibleRecipientCount: number;
};

const suppressedAppointmentStatuses = new Set<AppointmentStatus>([
  "canceled",
  "completed",
  "no_show"
]);

function findPreference(input: {
  preferences: AppointmentReminderPreferenceSnapshot[];
  subjectType: AppointmentReminderPreferenceSnapshot["subjectType"];
  subjectId: string | null | undefined;
}) {
  if (!input.subjectId) {
    return null;
  }

  return (
    input.preferences.find(
      (preference) =>
        preference.subjectType === input.subjectType &&
        preference.subjectId === input.subjectId
    ) ?? null
  );
}

function isBlockedPreference(status: CommunicationPreferenceStatus | null | undefined) {
  return status === "opted_out" || status === "suppressed";
}

export function filterAppointmentReminderEmailRecipientsByPreference(input: {
  customerId: string;
  recipients: AppointmentConfirmationEmailRecipient[];
  preferences: AppointmentReminderPreferenceSnapshot[];
}) {
  return input.recipients.filter((recipient) => {
    const customerPreference = findPreference({
      preferences: input.preferences,
      subjectType: "customer",
      subjectId: input.customerId
    });

    if (isBlockedPreference(customerPreference?.status)) {
      return false;
    }

    const customerContactPreference = findPreference({
      preferences: input.preferences,
      subjectType: "customer_contact",
      subjectId: recipient.customerContactId
    });

    if (isBlockedPreference(customerContactPreference?.status)) {
      return false;
    }

    if (customerContactPreference?.status === "allowed") {
      return true;
    }

    return true;
  });
}

export function getAppointmentReminderReadinessBlockers(
  input: AppointmentReminderReadinessInput
) {
  const blockers: string[] = [];

  if (!input.customerVisible) {
    blockers.push("Appointment must be marked customer-visible before reminders are prepared.");
  }

  if (!input.customerId || !input.projectId) {
    blockers.push("Appointment reminders require linked customer and project context.");
  }

  if (!input.startsAt || Number.isNaN(Date.parse(input.startsAt))) {
    blockers.push("Appointment reminders require a valid start time.");
  }

  if (suppressedAppointmentStatuses.has(input.status)) {
    blockers.push("Canceled, no-show, and completed appointments are suppressed for reminders.");
  }

  if (input.eligibleRecipientCount === 0) {
    blockers.push("No eligible email recipients are available for appointment reminders.");
  }

  return blockers;
}

export function isSuccessfulAppointmentReminderDeliveryStatus(
  status: NotificationDeliveryStatus
) {
  return status === "sent" || status === "delivered" || status === "opened" || status === "clicked";
}
