"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createInvoice, recordInvoicePayment, updateInvoice } from "./data";
import { invoiceInputSchema, invoicePaymentInputSchema } from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFieldValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => (typeof value === "string" ? value : ""));
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

function parseInvoiceInput(formData: FormData) {
  const lineItemNames = getFieldValues(formData, "lineItemName");
  const lineItemDescriptions = getFieldValues(formData, "lineItemDescription");
  const lineItemQuantities = getFieldValues(formData, "lineItemQuantity");
  const lineItemUnits = getFieldValues(formData, "lineItemUnit");
  const lineItemUnitPrices = getFieldValues(formData, "lineItemUnitPrice");

  return invoiceInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    estimateId: getFieldValue(formData, "estimateId"),
    jobId: getFieldValue(formData, "jobId"),
    workflowRole: getFieldValue(formData, "workflowRole"),
    status: getFieldValue(formData, "status"),
    issueDate: getFieldValue(formData, "issueDate"),
    dueDate: getFieldValue(formData, "dueDate"),
    discountAmount: getFieldValue(formData, "discountAmount"),
    lineItems: lineItemNames.map((name, index) => ({
      name,
      description: lineItemDescriptions[index] ?? "",
      quantity: lineItemQuantities[index] ?? "",
      unit: lineItemUnits[index] ?? "",
      unitPrice: lineItemUnitPrices[index] ?? ""
    })),
    notes: getFieldValue(formData, "notes")
  });
}

export async function createInvoiceAction(formData: FormData) {
  const result = parseInvoiceInput(formData);
  const projectId = getFieldValue(formData, "projectId");
  const estimateId = getFieldValue(formData, "estimateId");
  const jobId = getFieldValue(formData, "jobId");
  const workflowRole = getFieldValue(formData, "workflowRole");

  if (!result.success) {
    redirect(
      buildRedirect("/invoices", {
        projectId,
        estimateId,
        jobId,
        workflowRole,
        error: result.error.issues[0]?.message ?? "Unable to create invoice."
      })
    );
  }

  let invoice;

  try {
    invoice = await createInvoice(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/invoices", {
        projectId,
        estimateId,
        jobId,
        workflowRole,
        error: error instanceof Error ? error.message : "Unable to create invoice."
      })
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);
  if (invoice.estimateId) {
    revalidatePath(`/estimates/${invoice.estimateId}`);
  }
  if (invoice.jobId) {
    revalidatePath(`/jobs/${invoice.jobId}`);
  }

  redirect(
    buildRedirect("/invoices", {
      message: `${invoice.referenceNumber} was created successfully.`
    })
  );
}

export async function updateInvoiceAction(formData: FormData) {
  const invoiceId = getFieldValue(formData, "invoiceId");
  const result = parseInvoiceInput(formData);

  if (!invoiceId) {
    redirect(
      buildRedirect("/invoices", {
        error: "Invoice id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/invoices/${invoiceId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update invoice."
      })
    );
  }

  let invoice;

  try {
    invoice = await updateInvoice(invoiceId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/invoices/${invoiceId}`, {
        error: error instanceof Error ? error.message : "Unable to update invoice."
      })
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);
  if (invoice.estimateId) {
    revalidatePath(`/estimates/${invoice.estimateId}`);
  }
  if (invoice.jobId) {
    revalidatePath(`/jobs/${invoice.jobId}`);
  }

  redirect(
    buildRedirect(`/invoices/${invoice.id}`, {
      message: `${invoice.referenceNumber} was updated successfully.`
    })
  );
}

export async function recordInvoicePaymentAction(formData: FormData) {
  const result = invoicePaymentInputSchema.safeParse({
    invoiceId: getFieldValue(formData, "invoiceId"),
    amount: getFieldValue(formData, "amount"),
    paymentDate: getFieldValue(formData, "paymentDate"),
    paymentMethod: getFieldValue(formData, "paymentMethod"),
    reference: getFieldValue(formData, "reference"),
    notes: getFieldValue(formData, "notes")
  });
  const invoiceId = getFieldValue(formData, "invoiceId");

  if (!invoiceId) {
    redirect(
      buildRedirect("/invoices", {
        error: "Invoice id is required for payments."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/invoices/${invoiceId}`, {
        error: result.error.issues[0]?.message ?? "Unable to record payment."
      })
    );
  }

  let invoice;

  try {
    invoice = await recordInvoicePayment(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/invoices/${invoiceId}`, {
        error: error instanceof Error ? error.message : "Unable to record payment."
      })
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);
  if (invoice.estimateId) {
    revalidatePath(`/estimates/${invoice.estimateId}`);
  }
  if (invoice.jobId) {
    revalidatePath(`/jobs/${invoice.jobId}`);
  }

  redirect(
    buildRedirect(`/invoices/${invoice.id}`, {
      message: `Payment recorded on ${invoice.referenceNumber}.`
    })
  );
}
