"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  customerDeclinePortalWarrantyDocument,
  customerSignPortalWarrantyDocument
} from "@/lib/portal/data";
import {
  addWarrantyDocumentSigner,
  appendWarrantyDocumentDeliveryEvent,
  createWarrantyDocumentFromServiceTicket,
  requestWarrantyDocumentSignature,
  sendWarrantyDocumentReviewEmail,
  updateWarrantyDocumentDraft,
  updateWarrantyDocumentSigner,
  voidWarrantyDocumentSigner,
  updateWarrantyDocumentStatus
} from "./data";
import {
  createWarrantyDocumentFromServiceTicketSchema,
  warrantyDocumentSignerActionSchema,
  warrantyDocumentSignerInputSchema,
  warrantyDocumentDeliveryEventInputSchema,
  warrantyDocumentEmailSendInputSchema,
  warrantyDocumentDraftInputSchema,
  warrantyDocumentStatusInputSchema
} from "./schemas";
import { getRequestOrigin } from "@/lib/auth/urls";

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

function revalidateWarrantyDocumentRoutes(input: {
  warrantyDocumentId?: string;
  serviceTicketId?: string | null;
  customerId?: string | null;
  projectId?: string | null;
  jobId?: string | null;
}) {
  if (input.warrantyDocumentId) {
    revalidatePath(`/warranty-documents/${input.warrantyDocumentId}`);
    revalidatePath(`/warranty-documents/${input.warrantyDocumentId}/print`);
  }

  if (input.serviceTicketId) {
    revalidatePath(`/service-tickets/${input.serviceTicketId}`);
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

export async function createWarrantyDocumentFromServiceTicketAction(
  formData: FormData
) {
  const result = createWarrantyDocumentFromServiceTicketSchema.safeParse({
    serviceTicketId: getFieldValue(formData, "serviceTicketId"),
    documentTemplateId: getFieldValue(formData, "documentTemplateId")
  });

  if (!result.success) {
    redirect(
      buildRedirect(
        `/service-tickets/${getFieldValue(formData, "serviceTicketId")}`,
        {
          error:
            result.error.issues[0]?.message ??
            "Unable to create warranty document."
        }
      )
    );
  }

  let document;

  try {
    document = await createWarrantyDocumentFromServiceTicket(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/service-tickets/${result.data.serviceTicketId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create warranty document."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: document.id,
    serviceTicketId: document.serviceTicketId,
    customerId: document.customerId,
    projectId: document.projectId,
    jobId: document.jobId
  });

  redirect(
    buildRedirect(`/warranty-documents/${document.id}`, {
      message: "Warranty document draft was created."
    })
  );
}

export async function updateWarrantyDocumentDraftAction(formData: FormData) {
  const result = warrantyDocumentDraftInputSchema.safeParse({
    warrantyDocumentId: getFieldValue(formData, "warrantyDocumentId"),
    title: getFieldValue(formData, "title"),
    warrantyStartDate: getFieldValue(formData, "warrantyStartDate"),
    warrantyEndDate: getFieldValue(formData, "warrantyEndDate"),
    warrantyBasis: getFieldValue(formData, "warrantyBasis")
  });
  const fallbackId = getFieldValue(formData, "warrantyDocumentId");

  if (!result.success) {
    redirect(
      buildRedirect(`/warranty-documents/${fallbackId}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to update warranty document."
      })
    );
  }

  let document;

  try {
    document = await updateWarrantyDocumentDraft(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update warranty document."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: document.id,
    serviceTicketId: document.serviceTicketId,
    customerId: document.customerId,
    projectId: document.projectId,
    jobId: document.jobId
  });

  redirect(
    buildRedirect(`/warranty-documents/${document.id}`, {
      message: "Warranty document draft was updated."
    })
  );
}

export async function updateWarrantyDocumentStatusAction(formData: FormData) {
  const result = warrantyDocumentStatusInputSchema.safeParse({
    warrantyDocumentId: getFieldValue(formData, "warrantyDocumentId"),
    status: getFieldValue(formData, "status")
  });
  const fallbackId = getFieldValue(formData, "warrantyDocumentId");

  if (!result.success) {
    redirect(
      buildRedirect(`/warranty-documents/${fallbackId}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to update warranty document status."
      })
    );
  }

  let document;

  try {
    document = await updateWarrantyDocumentStatus(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update warranty document status."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: document.id,
    serviceTicketId: document.serviceTicketId,
    customerId: document.customerId,
    projectId: document.projectId,
    jobId: document.jobId
  });

  redirect(
    buildRedirect(`/warranty-documents/${document.id}`, {
      message: `Warranty document moved to ${document.status}.`
    })
  );
}

export async function addWarrantyDocumentSignerAction(formData: FormData) {
  const result = warrantyDocumentSignerInputSchema.safeParse({
    warrantyDocumentId: getFieldValue(formData, "warrantyDocumentId"),
    signerRole: getFieldValue(formData, "signerRole"),
    signerName: getFieldValue(formData, "signerName"),
    signerEmail: getFieldValue(formData, "signerEmail")
  });
  const fallbackId = getFieldValue(formData, "warrantyDocumentId");

  if (!result.success) {
    redirect(
      buildRedirect(`/warranty-documents/${fallbackId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to add warranty signer."
      })
    );
  }

  try {
    await addWarrantyDocumentSigner(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add warranty signer."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: result.data.warrantyDocumentId
  });

  redirect(
    buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
      message: "Warranty signer was added."
    })
  );
}

export async function updateWarrantyDocumentSignerAction(formData: FormData) {
  const result = warrantyDocumentSignerInputSchema.safeParse({
    warrantyDocumentId: getFieldValue(formData, "warrantyDocumentId"),
    signerId: getFieldValue(formData, "signerId"),
    signerRole: getFieldValue(formData, "signerRole"),
    signerName: getFieldValue(formData, "signerName"),
    signerEmail: getFieldValue(formData, "signerEmail")
  });
  const fallbackId = getFieldValue(formData, "warrantyDocumentId");

  if (!result.success) {
    redirect(
      buildRedirect(`/warranty-documents/${fallbackId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to update warranty signer."
      })
    );
  }

  try {
    await updateWarrantyDocumentSigner(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update warranty signer."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: result.data.warrantyDocumentId
  });

  redirect(
    buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
      message: "Warranty signer was updated."
    })
  );
}

export async function voidWarrantyDocumentSignerAction(formData: FormData) {
  const result = warrantyDocumentSignerActionSchema.safeParse({
    warrantyDocumentId: getFieldValue(formData, "warrantyDocumentId"),
    signerId: getFieldValue(formData, "signerId")
  });
  const fallbackId = getFieldValue(formData, "warrantyDocumentId");

  if (!result.success) {
    redirect(
      buildRedirect(`/warranty-documents/${fallbackId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to void warranty signer."
      })
    );
  }

  try {
    await voidWarrantyDocumentSigner(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to void warranty signer."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: result.data.warrantyDocumentId
  });

  redirect(
    buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
      message: "Warranty signer routing was voided."
    })
  );
}

export async function requestWarrantyDocumentSignatureAction(
  formData: FormData
) {
  const result = warrantyDocumentSignerActionSchema.safeParse({
    warrantyDocumentId: getFieldValue(formData, "warrantyDocumentId"),
    signerId: getFieldValue(formData, "signerId")
  });
  const fallbackId = getFieldValue(formData, "warrantyDocumentId");

  if (!result.success) {
    redirect(
      buildRedirect(`/warranty-documents/${fallbackId}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to request warranty signature."
      })
    );
  }

  try {
    await requestWarrantyDocumentSignature(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to request warranty signature."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: result.data.warrantyDocumentId
  });

  redirect(
    buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
      message:
        "Signature request audit was recorded. No customer email or portal link was sent."
    })
  );
}

export async function recordWarrantyDocumentDeliveryEventAction(
  formData: FormData
) {
  const result = warrantyDocumentDeliveryEventInputSchema.safeParse({
    warrantyDocumentId: getFieldValue(formData, "warrantyDocumentId"),
    eventType: getFieldValue(formData, "eventType"),
    recipientName: getFieldValue(formData, "recipientName"),
    recipientEmail: getFieldValue(formData, "recipientEmail"),
    recipientRole: getFieldValue(formData, "recipientRole"),
    channel: getFieldValue(formData, "channel"),
    eventNote: getFieldValue(formData, "eventNote")
  });
  const fallbackId = getFieldValue(formData, "warrantyDocumentId");

  if (!result.success) {
    redirect(
      buildRedirect(`/warranty-documents/${fallbackId}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to record warranty delivery evidence."
      })
    );
  }

  try {
    await appendWarrantyDocumentDeliveryEvent(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record warranty delivery evidence."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: result.data.warrantyDocumentId
  });

  redirect(
    buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
      message: "Delivery evidence was recorded. No customer email was sent."
    })
  );
}

export async function sendWarrantyDocumentReviewEmailAction(
  formData: FormData
) {
  const result = warrantyDocumentEmailSendInputSchema.safeParse({
    warrantyDocumentId: getFieldValue(formData, "warrantyDocumentId"),
    signerId: getFieldValue(formData, "signerId")
  });
  const fallbackId = getFieldValue(formData, "warrantyDocumentId");

  if (!result.success) {
    redirect(
      buildRedirect(`/warranty-documents/${fallbackId}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to send warranty document email."
      })
    );
  }

  let sendResult;

  try {
    const requestHeaders = await headers();
    sendResult = await sendWarrantyDocumentReviewEmail({
      ...result.data,
      origin: getRequestOrigin(requestHeaders)
    });
  } catch (error) {
    redirect(
      buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send warranty document email."
      })
    );
  }

  revalidateWarrantyDocumentRoutes({
    warrantyDocumentId: result.data.warrantyDocumentId
  });

  redirect(
    buildRedirect(`/warranty-documents/${result.data.warrantyDocumentId}`, {
      message: sendResult.message
    })
  );
}

export async function customerSignWarrantyDocumentAction(formData: FormData) {
  const warrantyDocumentId = getFieldValue(formData, "warrantyDocumentId");

  if (!warrantyDocumentId) {
    redirect(
      buildRedirect("/portal", {
        error: "Unable to sign warranty document."
      })
    );
  }

  try {
    await customerSignPortalWarrantyDocument(
      warrantyDocumentId,
      `/portal/warranty-documents/${warrantyDocumentId}`
    );
  } catch (error) {
    redirect(
      buildRedirect(`/portal/warranty-documents/${warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to sign warranty document."
      })
    );
  }

  revalidatePath(`/portal/warranty-documents/${warrantyDocumentId}`);
  revalidatePath(`/portal/warranty-documents/${warrantyDocumentId}/print`);

  redirect(
    buildRedirect(`/portal/warranty-documents/${warrantyDocumentId}`, {
      message: "Warranty signature was recorded."
    })
  );
}

export async function customerDeclineWarrantyDocumentAction(
  formData: FormData
) {
  const warrantyDocumentId = getFieldValue(formData, "warrantyDocumentId");
  const declineReason = getFieldValue(formData, "declineReason").slice(0, 500);

  if (!warrantyDocumentId) {
    redirect(
      buildRedirect("/portal", {
        error: "Unable to decline warranty document."
      })
    );
  }

  try {
    await customerDeclinePortalWarrantyDocument(
      {
        warrantyDocumentId,
        declineReason
      },
      `/portal/warranty-documents/${warrantyDocumentId}`
    );
  } catch (error) {
    redirect(
      buildRedirect(`/portal/warranty-documents/${warrantyDocumentId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to decline warranty document."
      })
    );
  }

  revalidatePath(`/portal/warranty-documents/${warrantyDocumentId}`);
  revalidatePath(`/portal/warranty-documents/${warrantyDocumentId}/print`);

  redirect(
    buildRedirect(`/portal/warranty-documents/${warrantyDocumentId}`, {
      message: "Warranty decline was recorded for contractor follow-up."
    })
  );
}
