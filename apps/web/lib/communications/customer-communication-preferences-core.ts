import type {
  CommunicationPreference,
  CommunicationPreferenceStatus
} from "@floorconnector/types";

export type CustomerPreferenceSummaryContact = {
  id: string;
  displayName: string;
  email: string | null;
  relationshipLabel: string | null;
  isPrimary: boolean;
};

export type CustomerPreferenceSummaryCustomer = {
  id: string;
  name: string;
  email: string | null;
};

export type CustomerAppointmentReminderPreferenceDisplayStatus =
  | CommunicationPreferenceStatus
  | "allowed_by_default";

export type CustomerAppointmentReminderPreferenceSummaryRow = {
  subjectType: "customer" | "customer_contact";
  subjectId: string;
  label: string;
  email: string | null;
  relationshipLabel: string | null;
  isPrimary: boolean;
  status: CustomerAppointmentReminderPreferenceDisplayStatus;
  reason: string | null;
  preferenceId: string | null;
};

function findReminderPreference(input: {
  preferences: CommunicationPreference[];
  subjectType: "customer" | "customer_contact";
  subjectId: string;
}) {
  return (
    input.preferences.find(
      (preference) =>
        preference.subjectType === input.subjectType &&
        preference.subjectId === input.subjectId &&
        preference.channel === "email" &&
        preference.messageCategory === "appointment_reminder"
    ) ?? null
  );
}

function toDisplayStatus(
  preference: CommunicationPreference | null
): CustomerAppointmentReminderPreferenceDisplayStatus {
  return preference?.status ?? "allowed_by_default";
}

export function buildCustomerAppointmentReminderPreferenceSummary(input: {
  customer: CustomerPreferenceSummaryCustomer;
  contacts: CustomerPreferenceSummaryContact[];
  preferences: CommunicationPreference[];
}): CustomerAppointmentReminderPreferenceSummaryRow[] {
  const customerPreference = findReminderPreference({
    preferences: input.preferences,
    subjectType: "customer",
    subjectId: input.customer.id
  });

  return [
    {
      subjectType: "customer",
      subjectId: input.customer.id,
      label: input.customer.name,
      email: input.customer.email,
      relationshipLabel: "Account default",
      isPrimary: false,
      status: toDisplayStatus(customerPreference),
      reason: customerPreference?.reason ?? null,
      preferenceId: customerPreference?.id ?? null
    },
    ...input.contacts.map((contact) => {
      const preference = findReminderPreference({
        preferences: input.preferences,
        subjectType: "customer_contact",
        subjectId: contact.id
      });

      return {
        subjectType: "customer_contact" as const,
        subjectId: contact.id,
        label: contact.displayName,
        email: contact.email,
        relationshipLabel: contact.relationshipLabel,
        isPrimary: contact.isPrimary,
        status: toDisplayStatus(preference),
        reason: preference?.reason ?? null,
        preferenceId: preference?.id ?? null
      };
    })
  ];
}
