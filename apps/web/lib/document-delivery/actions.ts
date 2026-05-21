"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DocumentDeliverySubjectType } from "@floorconnector/types";

import { appendDocumentDeliveryEvent } from "./data";
import { documentDeliveryEventInputSchema } from "./schemas";

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

function getSubjectPath(
  subjectType: DocumentDeliverySubjectType,
  subjectId: string
) {
  switch (subjectType) {
    case "estimate":
      return `/estimates/${subjectId}`;
    case "invoice":
      return `/invoices/${subjectId}`;
    case "contract":
      return `/contracts/${subjectId}`;
    case "warranty_document":
      return `/warranty-documents/${subjectId}`;
    default:
      return "/dashboard";
  }
}

export async function recordDocumentDeliveryEventAction(formData: FormData) {
  const result = documentDeliveryEventInputSchema.safeParse({
    subjectType: getFieldValue(formData, "subjectType"),
    subjectId: getFieldValue(formData, "subjectId"),
    eventType: getFieldValue(formData, "eventType"),
    recipientName: getFieldValue(formData, "recipientName"),
    recipientEmail: getFieldValue(formData, "recipientEmail"),
    recipientRole: getFieldValue(formData, "recipientRole"),
    channel: getFieldValue(formData, "channel"),
    eventNote: getFieldValue(formData, "eventNote")
  });
  const fallbackSubjectType = getFieldValue(formData, "subjectType");
  const fallbackSubjectId = getFieldValue(formData, "subjectId");
  const fallbackPath =
    fallbackSubjectType === "estimate" ||
    fallbackSubjectType === "invoice" ||
    fallbackSubjectType === "contract" ||
    fallbackSubjectType === "warranty_document"
      ? getSubjectPath(fallbackSubjectType, fallbackSubjectId)
      : "/dashboard";

  if (!result.success) {
    redirect(
      buildRedirect(fallbackPath, {
        error:
          result.error.issues[0]?.message ??
          "Unable to record delivery evidence."
      })
    );
  }

  try {
    await appendDocumentDeliveryEvent(result.data);
  } catch (error) {
    redirect(
      buildRedirect(
        getSubjectPath(result.data.subjectType, result.data.subjectId),
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to record delivery evidence."
        }
      )
    );
  }

  const subjectPath = getSubjectPath(
    result.data.subjectType,
    result.data.subjectId
  );
  revalidatePath(subjectPath);

  if (result.data.subjectType === "estimate") {
    revalidatePath(`/estimates/${result.data.subjectId}/pdf`);
  }

  if (result.data.subjectType === "invoice") {
    revalidatePath(`/invoices/${result.data.subjectId}/pdf`);
  }

  if (result.data.subjectType === "contract") {
    revalidatePath(`/contracts/${result.data.subjectId}/pdf`);
  }

  if (result.data.subjectType === "warranty_document") {
    revalidatePath(`/warranty-documents/${result.data.subjectId}/print`);
  }

  redirect(
    buildRedirect(subjectPath, {
      message: "Delivery evidence was recorded. No customer email was sent."
    })
  );
}
