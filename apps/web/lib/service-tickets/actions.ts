"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createServiceTicket,
  updateServiceTicket,
  updateServiceTicketStatus
} from "./data";
import {
  serviceTicketInputSchema,
  serviceTicketStatusInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function buildRedirect(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function parseServiceTicketInput(formData: FormData) {
  return serviceTicketInputSchema.safeParse({
    customerId: getFieldValue(formData, "customerId"),
    projectId: getFieldValue(formData, "projectId"),
    jobId: getFieldValue(formData, "jobId"),
    sourceType: getFieldValue(formData, "sourceType") || "internal",
    ticketType: getFieldValue(formData, "ticketType") || "warranty",
    status: getFieldValue(formData, "status") || "open",
    priority: getFieldValue(formData, "priority") || "normal",
    title: getFieldValue(formData, "title"),
    description: getFieldValue(formData, "description"),
    reportedOn:
      getFieldValue(formData, "reportedOn") ||
      new Date().toISOString().slice(0, 10),
    warrantyStartDate: getFieldValue(formData, "warrantyStartDate"),
    warrantyEndDate: getFieldValue(formData, "warrantyEndDate"),
    warrantyBasis: getFieldValue(formData, "warrantyBasis"),
    resolutionSummary: getFieldValue(formData, "resolutionSummary")
  });
}

function parseServiceTicketStatusInput(formData: FormData) {
  return serviceTicketStatusInputSchema.safeParse({
    status: getFieldValue(formData, "status"),
    resolutionSummary: getFieldValue(formData, "resolutionSummary")
  });
}

function revalidateServiceTicketRoutes(input: {
  ticketId?: string;
  customerId?: string | null;
  projectId?: string | null;
  jobId?: string | null;
}) {
  revalidatePath("/service-tickets");

  if (input.ticketId) {
    revalidatePath(`/service-tickets/${input.ticketId}`);
  }

  if (input.customerId) {
    revalidatePath(`/customers/${input.customerId}`);
  }

  if (input.projectId) {
    revalidatePath(`/projects/${input.projectId}`);
  }

  if (input.jobId) {
    revalidatePath(`/jobs/${input.jobId}`);
  }
}

export async function createServiceTicketAction(formData: FormData) {
  const result = parseServiceTicketInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/service-tickets", {
        compose: "1",
        error:
          result.error.issues[0]?.message ?? "Unable to create service ticket."
      })
    );
  }

  let ticket;

  try {
    ticket = await createServiceTicket(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/service-tickets", {
        compose: "1",
        error:
          error instanceof Error
            ? error.message
            : "Unable to create service ticket."
      })
    );
  }

  revalidateServiceTicketRoutes({
    ticketId: ticket.id,
    customerId: ticket.customerId,
    projectId: ticket.projectId,
    jobId: ticket.jobId
  });

  redirect(
    buildRedirect(`/service-tickets/${ticket.id}`, {
      message: "Service/warranty ticket was created."
    })
  );
}

export async function updateServiceTicketAction(formData: FormData) {
  const ticketId = getFieldValue(formData, "ticketId");
  const result = parseServiceTicketInput(formData);

  if (!ticketId) {
    redirect(
      buildRedirect("/service-tickets", {
        error: "Service ticket id is required."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/service-tickets/${ticketId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to update service ticket."
      })
    );
  }

  let ticket;

  try {
    ticket = await updateServiceTicket(ticketId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/service-tickets/${ticketId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update service ticket."
      })
    );
  }

  revalidateServiceTicketRoutes({
    ticketId: ticket.id,
    customerId: ticket.customerId,
    projectId: ticket.projectId,
    jobId: ticket.jobId
  });

  redirect(
    buildRedirect(`/service-tickets/${ticket.id}`, {
      message: "Service/warranty ticket was updated."
    })
  );
}

export async function updateServiceTicketStatusAction(formData: FormData) {
  const ticketId = getFieldValue(formData, "ticketId");
  const result = parseServiceTicketStatusInput(formData);

  if (!ticketId) {
    redirect(
      buildRedirect("/service-tickets", {
        error: "Service ticket id is required."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/service-tickets/${ticketId}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to update service ticket status."
      })
    );
  }

  let ticket;

  try {
    ticket = await updateServiceTicketStatus(ticketId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/service-tickets/${ticketId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update service ticket status."
      })
    );
  }

  revalidateServiceTicketRoutes({
    ticketId: ticket.id,
    customerId: ticket.customerId,
    projectId: ticket.projectId,
    jobId: ticket.jobId
  });

  redirect(
    buildRedirect(`/service-tickets/${ticket.id}`, {
      message: `Service/warranty ticket moved to ${ticket.status.replaceAll("_", " ")}.`
    })
  );
}
