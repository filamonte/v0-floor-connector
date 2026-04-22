"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildProgressBillingInvoice } from "@/lib/progress-billing/data";
import { progressBillingInvoiceInputSchema } from "@/lib/progress-billing/schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getFieldValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => (typeof value === "string" ? value : ""));
}

function parseProgressBillingInvoiceInput(formData: FormData) {
  const itemIds = getFieldValues(formData, "itemId");
  const percentCompletes = getFieldValues(formData, "percentComplete");

  return progressBillingInvoiceInputSchema.safeParse({
    scheduleOfValuesId: getFieldValue(formData, "scheduleOfValuesId"),
    issueDate: getFieldValue(formData, "issueDate"),
    dueDate: getFieldValue(formData, "dueDate"),
    notes: getFieldValue(formData, "notes"),
    items: itemIds.map((id, index) => ({
      id,
      percentComplete: percentCompletes[index] ?? ""
    }))
  });
}

export async function buildProgressBillingInvoiceAction(formData: FormData) {
  const result = parseProgressBillingInvoiceInput(formData);
  const scheduleOfValuesId = getFieldValue(formData, "scheduleOfValuesId");

  if (!result.success) {
    redirect(
      `/progress-billing/${scheduleOfValuesId}?error=${encodeURIComponent(
        result.error.issues[0]?.message ?? "Unable to build the progress invoice."
      )}`
    );
  }

  let redirectTo: string;

  try {
    const response = await buildProgressBillingInvoice(result.data);
    redirectTo = response.redirectTo;
  } catch (error) {
    redirect(
      `/progress-billing/${scheduleOfValuesId}?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Unable to build the progress invoice."
      )}`
    );
  }

  revalidatePath("/progress-billing");
  revalidatePath(`/progress-billing/${scheduleOfValuesId}`);
  revalidatePath("/dashboard");

  redirect(redirectTo);
}
