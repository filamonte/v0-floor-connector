"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAppointment, updateAppointment } from "./data";
import {
  appointmentInputSchema,
  appointmentQuickCreateInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getRedirectTarget(formData: FormData, fallback: string) {
  const redirectTo = getFieldValue(formData, "redirectTo");

  return redirectTo || fallback;
}

function buildRedirect(pathname: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function revalidateAppointmentRoutes(appointment: {
  id: string;
  opportunityId: string | null;
  customerId: string | null;
  projectId: string | null;
}) {
  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointment.id}`);
  revalidatePath("/dashboard");

  if (appointment.opportunityId) {
    revalidatePath(`/leads/${appointment.opportunityId}`);
  }

  if (appointment.customerId) {
    revalidatePath(`/customers/${appointment.customerId}`);
  }

  if (appointment.projectId) {
    revalidatePath(`/projects/${appointment.projectId}`);
  }
}

function parseAppointmentInput(formData: FormData) {
  return appointmentInputSchema.safeParse({
    opportunityId: getFieldValue(formData, "opportunityId"),
    customerId: getFieldValue(formData, "customerId"),
    projectId: getFieldValue(formData, "projectId"),
    assignedPersonId: getFieldValue(formData, "assignedPersonId"),
    title: getFieldValue(formData, "title"),
    appointmentType: getFieldValue(formData, "appointmentType"),
    startsAt: getFieldValue(formData, "startsAt"),
    endsAt: getFieldValue(formData, "endsAt"),
    location: getFieldValue(formData, "location"),
    notes: getFieldValue(formData, "notes"),
    status: getFieldValue(formData, "status")
  });
}

function parseAppointmentQuickCreateInput(formData: FormData) {
  return appointmentQuickCreateInputSchema.safeParse({
    opportunityId: getFieldValue(formData, "opportunityId"),
    customerId: getFieldValue(formData, "customerId"),
    projectId: getFieldValue(formData, "projectId"),
    assignedPersonId: getFieldValue(formData, "assignedPersonId"),
    title: getFieldValue(formData, "title"),
    appointmentType: getFieldValue(formData, "appointmentType"),
    startsAt: getFieldValue(formData, "startsAt")
  });
}

export async function createAppointmentAction(formData: FormData) {
  const result = parseAppointmentInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/appointments", {
        error: result.error.issues[0]?.message ?? "Unable to create the appointment."
      })
    );
  }

  let appointment;

  try {
    appointment = await createAppointment(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/appointments", {
        error:
          error instanceof Error ? error.message : "Unable to create the appointment."
      })
    );
  }

  revalidateAppointmentRoutes(appointment);

  redirect(
    buildRedirect(`/appointments/${appointment.id}`, {
      message: "Appointment created successfully."
    })
  );
}

export async function quickCreateAppointmentAction(formData: FormData) {
  const opportunityId = getFieldValue(formData, "opportunityId");
  const customerId = getFieldValue(formData, "customerId");
  const projectId = getFieldValue(formData, "projectId");
  const result = parseAppointmentQuickCreateInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/appointments", {
        compose: "1",
        opportunityId,
        customerId,
        projectId,
        error: result.error.issues[0]?.message ?? "Unable to create the appointment."
      })
    );
  }

  let appointment;

  try {
    appointment = await createAppointment({
      ...result.data,
      endsAt: null,
      location: null,
      notes: null,
      status: "scheduled"
    });
  } catch (error) {
    redirect(
      buildRedirect("/appointments", {
        compose: "1",
        opportunityId,
        customerId,
        projectId,
        error:
          error instanceof Error ? error.message : "Unable to create the appointment."
      })
    );
  }

  revalidateAppointmentRoutes(appointment);

  redirect(
    buildRedirect(`/appointments/${appointment.id}`, {
      message:
        "Appointment created. Finish the timing, status, and linked record details in this workspace."
    })
  );
}

export async function updateAppointmentAction(formData: FormData) {
  const appointmentId = getFieldValue(formData, "appointmentId");
  const fallbackRedirect = appointmentId
    ? `/appointments/${appointmentId}`
    : "/appointments";
  const redirectTarget = getRedirectTarget(formData, fallbackRedirect);
  const result = parseAppointmentInput(formData);

  if (!appointmentId) {
    redirect(
      buildRedirect("/appointments", {
        error: "Appointment id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error: result.error.issues[0]?.message ?? "Unable to update the appointment."
      })
    );
  }

  let appointment;

  try {
    appointment = await updateAppointment(appointmentId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          error instanceof Error ? error.message : "Unable to update the appointment."
      })
    );
  }

  revalidateAppointmentRoutes(appointment);

  redirect(
    buildRedirect(redirectTarget, {
      message: "Appointment updated successfully."
    })
  );
}
