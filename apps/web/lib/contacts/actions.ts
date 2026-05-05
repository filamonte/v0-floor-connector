"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCustomerContactForCustomer,
  markCustomerContactAsPrimary,
  updateCustomerContactForCustomer
} from "./data";
import {
  customerContactInputSchema,
  makePrimaryCustomerContactInputSchema,
  updateCustomerContactInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
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

function getCustomerPath(customerId: string) {
  return `/customers/${customerId}`;
}

function getManagementPath(formData: FormData, customerId: string) {
  const returnTo = getFieldValue(formData, "returnTo");

  if (returnTo.startsWith("/people") || returnTo === getCustomerPath(customerId)) {
    return returnTo;
  }

  return getCustomerPath(customerId);
}

export async function createCustomerContactAction(formData: FormData) {
  const customerId = getFieldValue(formData, "customerId");
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";
  const result = customerContactInputSchema.safeParse({
    customerId,
    displayName: getFieldValue(formData, "displayName"),
    companyName: getFieldValue(formData, "companyName"),
    email: getFieldValue(formData, "email"),
    phone: getFieldValue(formData, "phone"),
    relationshipLabel: getFieldValue(formData, "relationshipLabel"),
    notes: getFieldValue(formData, "notes"),
    setAsMainContact: getCheckboxValue(formData, "setAsMainContact")
  });

  if (!result.success) {
    redirect(
      buildRedirect(getCustomerPath(customerId || ""), {
        error:
          result.error.issues[0]?.message ?? "Unable to add the customer contact."
      })
    );
  }

  try {
    await createCustomerContactForCustomer({
      customerId: result.data.customerId,
      contact: {
        displayName: result.data.displayName,
        companyName: result.data.companyName,
        email: result.data.email,
        phone: result.data.phone,
        contactKind: "customer_contact",
        notes: result.data.notes
      },
      relationshipLabel: result.data.relationshipLabel,
      isPrimary: result.data.setAsMainContact
    });
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(result.data.customerId), {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add the customer contact."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(result.data.customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/directory");

  redirect(
    buildRedirect(managementPath, {
      message: "Customer contact added successfully."
    })
  );
}

export async function updateCustomerContactAction(formData: FormData) {
  const customerId = getFieldValue(formData, "customerId");
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";
  const result = updateCustomerContactInputSchema.safeParse({
    customerId,
    customerContactId: getFieldValue(formData, "customerContactId"),
    displayName: getFieldValue(formData, "displayName"),
    companyName: getFieldValue(formData, "companyName"),
    email: getFieldValue(formData, "email"),
    phone: getFieldValue(formData, "phone"),
    relationshipLabel: getFieldValue(formData, "relationshipLabel"),
    notes: getFieldValue(formData, "notes"),
    setAsMainContact: false
  });

  if (!result.success) {
    redirect(
      buildRedirect(getCustomerPath(customerId || ""), {
        error:
          result.error.issues[0]?.message ?? "Unable to update the customer contact."
      })
    );
  }

  try {
    await updateCustomerContactForCustomer({
      customerId: result.data.customerId,
      customerContactId: result.data.customerContactId,
      contact: {
        displayName: result.data.displayName,
        companyName: result.data.companyName,
        email: result.data.email,
        phone: result.data.phone,
        contactKind: "customer_contact",
        notes: result.data.notes
      },
      relationshipLabel: result.data.relationshipLabel
    });
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(result.data.customerId), {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the customer contact."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(result.data.customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/directory");

  redirect(
    buildRedirect(managementPath, {
      message: "Customer contact updated successfully."
    })
  );
}

export async function makeCustomerContactPrimaryAction(formData: FormData) {
  const customerId = getFieldValue(formData, "customerId");
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";
  const result = makePrimaryCustomerContactInputSchema.safeParse({
    customerId,
    customerContactId: getFieldValue(formData, "customerContactId")
  });

  if (!result.success) {
    redirect(
      buildRedirect(getCustomerPath(customerId || ""), {
        error:
          result.error.issues[0]?.message ??
          "Unable to designate the main contact."
      })
    );
  }

  try {
    await markCustomerContactAsPrimary(result.data);
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(result.data.customerId), {
        error:
          error instanceof Error
            ? error.message
            : "Unable to designate the main contact."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(result.data.customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/directory");

  redirect(
    buildRedirect(managementPath, {
      message: "Main customer contact updated."
    })
  );
}
