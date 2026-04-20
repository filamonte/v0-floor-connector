"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCustomer, updateCustomer } from "./data";
import { customerInputSchema, customerQuickCreateInputSchema } from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
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

function parseCustomerInput(formData: FormData) {
  return customerInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    companyName: getFieldValue(formData, "companyName"),
    phone: getFieldValue(formData, "phone"),
    email: getFieldValue(formData, "email"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode"),
    countryCode: getFieldValue(formData, "countryCode"),
    isTaxExempt: getCheckboxValue(formData, "isTaxExempt"),
    taxExemptionReason: getFieldValue(formData, "taxExemptionReason"),
    taxExemptionReference: getFieldValue(formData, "taxExemptionReference"),
    taxExemptionExpiresOn: getFieldValue(formData, "taxExemptionExpiresOn"),
    retainagePercentageDefault: getFieldValue(formData, "retainagePercentageDefault"),
    notes: getFieldValue(formData, "notes")
  });
}

function parseCustomerQuickCreateInput(formData: FormData) {
  return customerQuickCreateInputSchema.safeParse({
    name: getFieldValue(formData, "name")
  });
}

export async function createCustomerAction(formData: FormData) {
  const result = parseCustomerInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/customers", {
        error: result.error.issues[0]?.message ?? "Unable to create customer."
      })
    );
  }

  let customer;

  try {
    customer = await createCustomer(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/customers", {
        error:
          error instanceof Error ? error.message : "Unable to create customer."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customer.id}`);

  redirect(
    buildRedirect("/customers", {
      message: `${customer.name} was created successfully.`
    })
  );
}

export async function quickCreateCustomerAction(formData: FormData) {
  const name = getFieldValue(formData, "name");
  const retainagePercentageDefault = getFieldValue(
    formData,
    "retainagePercentageDefault"
  );
  const result = parseCustomerQuickCreateInput(formData);
  const retainageResult =
    customerInputSchema.shape.retainagePercentageDefault.safeParse(
      retainagePercentageDefault || "0.00"
    );

  if (!result.success) {
    redirect(
      buildRedirect("/customers", {
        compose: "1",
        error: result.error.issues[0]?.message ?? "Unable to create customer."
      })
    );
  }

  if (!retainageResult.success) {
    redirect(
      buildRedirect("/customers", {
        compose: "1",
        error:
          retainageResult.error.issues[0]?.message ??
          "Unable to create customer."
      })
    );
  }

  let customer;

  try {
    customer = await createCustomer({
      name: result.data.name,
      companyName: null,
      phone: null,
      email: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      stateRegion: null,
      postalCode: null,
      countryCode: null,
      isTaxExempt: false,
      taxExemptionReason: null,
      taxExemptionReference: null,
      taxExemptionExpiresOn: null,
      retainagePercentageDefault: retainageResult.data,
      notes: null
    });
  } catch (error) {
    redirect(
      buildRedirect("/customers", {
        compose: "1",
        error:
          error instanceof Error ? error.message : "Unable to create customer."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customer.id}`);

  redirect(
    buildRedirect(`/customers/${customer.id}`, {
      message: `${name || customer.name} was created. Finish the full customer setup in this workspace.`
    })
  );
}

export async function updateCustomerAction(formData: FormData) {
  const customerId = getFieldValue(formData, "customerId");
  const result = parseCustomerInput(formData);

  if (!customerId) {
    redirect(
      buildRedirect("/customers", {
        error: "Customer id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/customers/${customerId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update customer."
      })
    );
  }

  let customer;

  try {
    customer = await updateCustomer(customerId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/customers/${customerId}`, {
        error:
          error instanceof Error ? error.message : "Unable to update customer."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customer.id}`);

  redirect(
    buildRedirect(`/customers/${customer.id}`, {
      message: `${customer.name} was updated successfully.`
    })
  );
}
