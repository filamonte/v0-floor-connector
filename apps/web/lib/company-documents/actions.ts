"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  archiveCompanyDocument,
  unarchiveCompanyDocument,
  upsertCompanyDocument
} from "./data";
import {
  companyDocumentActionInputSchema,
  companyDocumentUpsertInputSchema
} from "./types";

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

function revalidateCompanyDocuments() {
  revalidatePath("/settings");
  revalidatePath("/settings/company-documents");
}

export async function saveCompanyDocumentAction(formData: FormData) {
  const result = companyDocumentUpsertInputSchema.safeParse({
    documentId: getFieldValue(formData, "documentId"),
    title: getFieldValue(formData, "title"),
    category: getFieldValue(formData, "category"),
    documentKind: getFieldValue(formData, "documentKind"),
    status: getFieldValue(formData, "status"),
    audience: getFieldValue(formData, "audience"),
    description: getFieldValue(formData, "description"),
    body: getFieldValue(formData, "body"),
    effectiveDate: getFieldValue(formData, "effectiveDate"),
    expiresAt: getFieldValue(formData, "expiresAt")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/company-documents", {
        documentId: getFieldValue(formData, "documentId"),
        error:
          result.error.issues[0]?.message ?? "Unable to save company document."
      })
    );
  }

  let document;

  try {
    document = await upsertCompanyDocument(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/settings/company-documents", {
        documentId: result.data.documentId ?? undefined,
        error:
          error instanceof Error
            ? error.message
            : "Unable to save company document."
      })
    );
  }

  revalidateCompanyDocuments();

  redirect(
    buildRedirect("/settings/company-documents", {
      documentId: document.id,
      message: `${document.title} was saved.`
    })
  );
}

export async function archiveCompanyDocumentAction(formData: FormData) {
  const result = companyDocumentActionInputSchema.safeParse({
    documentId: getFieldValue(formData, "documentId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/company-documents", {
        error:
          result.error.issues[0]?.message ??
          "Unable to archive company document."
      })
    );
  }

  let document;

  try {
    document = await archiveCompanyDocument(result.data.documentId);
  } catch (error) {
    redirect(
      buildRedirect("/settings/company-documents", {
        documentId: result.data.documentId,
        error:
          error instanceof Error
            ? error.message
            : "Unable to archive company document."
      })
    );
  }

  revalidateCompanyDocuments();

  redirect(
    buildRedirect("/settings/company-documents", {
      documentId: document.id,
      message: `${document.title} was archived.`
    })
  );
}

export async function unarchiveCompanyDocumentAction(formData: FormData) {
  const result = companyDocumentActionInputSchema.safeParse({
    documentId: getFieldValue(formData, "documentId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/company-documents", {
        error:
          result.error.issues[0]?.message ??
          "Unable to restore company document."
      })
    );
  }

  let document;

  try {
    document = await unarchiveCompanyDocument(result.data.documentId);
  } catch (error) {
    redirect(
      buildRedirect("/settings/company-documents", {
        documentId: result.data.documentId,
        error:
          error instanceof Error
            ? error.message
            : "Unable to restore company document."
      })
    );
  }

  revalidateCompanyDocuments();

  redirect(
    buildRedirect("/settings/company-documents", {
      documentId: document.id,
      message: `${document.title} was restored to draft.`
    })
  );
}
