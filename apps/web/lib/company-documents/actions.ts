"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  archiveCompanyDocument,
  createCompanyDocumentFromStarter,
  unarchiveCompanyDocument,
  upsertCompanyDocument
} from "./data";
import {
  buildCompanyDocumentStarterDraft,
  getCompanyDocumentStarter
} from "./starter-documents";
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

const saveCompanyDocumentErrorMessage =
  "Unable to save company document. Check the fields and try again.";
const archiveCompanyDocumentErrorMessage =
  "Unable to archive company document. Try again or ask an owner, admin, or manager for access.";
const restoreCompanyDocumentErrorMessage =
  "Unable to restore company document. Try again or ask an owner, admin, or manager for access.";
const adoptCompanyDocumentStarterErrorMessage =
  "Unable to adopt starter document. Try again or ask an owner, admin, or manager for access.";

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
  } catch {
    redirect(
      buildRedirect("/settings/company-documents", {
        documentId: result.data.documentId ?? undefined,
        error: saveCompanyDocumentErrorMessage
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
  } catch {
    redirect(
      buildRedirect("/settings/company-documents", {
        documentId: result.data.documentId,
        error: archiveCompanyDocumentErrorMessage
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
  } catch {
    redirect(
      buildRedirect("/settings/company-documents", {
        documentId: result.data.documentId,
        error: restoreCompanyDocumentErrorMessage
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

export async function adoptCompanyDocumentStarterAction(formData: FormData) {
  const starterId = getFieldValue(formData, "starterId");
  const starter = getCompanyDocumentStarter(starterId);

  if (!starter) {
    redirect(
      buildRedirect("/settings/company-documents", {
        error: "Select a valid Starter Document."
      })
    );
  }

  let document;

  try {
    document = await createCompanyDocumentFromStarter(
      buildCompanyDocumentStarterDraft(starter)
    );
  } catch {
    redirect(
      buildRedirect("/settings/company-documents", {
        error: adoptCompanyDocumentStarterErrorMessage
      })
    );
  }

  revalidateCompanyDocuments();

  redirect(
    buildRedirect("/settings/company-documents", {
      documentId: document.id,
      message: `${document.title} was added as a draft copy.`
    })
  );
}
