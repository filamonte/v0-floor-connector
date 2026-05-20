"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addWarrantyDocumentSigner,
  createWarrantyDocumentFromServiceTicket,
  requestWarrantyDocumentSignature,
  updateWarrantyDocumentDraft,
  updateWarrantyDocumentSigner,
  voidWarrantyDocumentSigner,
  updateWarrantyDocumentStatus
} from "./data";
import {
  createWarrantyDocumentFromServiceTicketSchema,
  warrantyDocumentSignerActionSchema,
  warrantyDocumentSignerInputSchema,
  warrantyDocumentDraftInputSchema,
  warrantyDocumentStatusInputSchema
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
