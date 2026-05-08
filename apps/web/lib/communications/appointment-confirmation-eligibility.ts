export type AppointmentConfirmationEligibilityInput = {
  customerVisible: boolean;
  customerId: string | null;
  projectId: string | null;
  startsAt: string | null;
  title: string | null;
};

export type AppointmentConfirmationEligibility = {
  eligible: boolean;
  blockers: string[];
};

export function getAppointmentConfirmationEligibility(
  input: AppointmentConfirmationEligibilityInput
): AppointmentConfirmationEligibility {
  const blockers: string[] = [];

  if (!input.customerVisible) {
    blockers.push("Mark this appointment customer-visible.");
  }

  if (!input.customerId) {
    blockers.push("Link a customer to this appointment.");
  }

  if (!input.projectId) {
    blockers.push("Link a project to this appointment.");
  }

  if (!input.startsAt) {
    blockers.push("Set a scheduled start time.");
  }

  if (!input.title?.trim()) {
    blockers.push("Add an appointment title.");
  }

  return {
    eligible: blockers.length === 0,
    blockers
  };
}
