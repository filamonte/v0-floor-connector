"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createVendor, updateVendor } from "./data";
import { vendorInputSchema } from "./schemas";

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

function parseVendorInput(formData: FormData) {
  return vendorInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    vendorType: getFieldValue(formData, "vendorType"),
    isLaborProvider: getCheckboxValue(formData, "isLaborProvider"),
    primaryContactName: getFieldValue(formData, "primaryContactName"),
    email: getFieldValue(formData, "email"),
    phone: getFieldValue(formData, "phone"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode"),
    countryCode: getFieldValue(formData, "countryCode"),
    taxIdentifierLast4: getFieldValue(formData, "taxIdentifierLast4"),
    notes: getFieldValue(formData, "notes"),
    isActive: getCheckboxValue(formData, "isActive")
  });
}

export async function createVendorAction(formData: FormData) {
  const result = parseVendorInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/vendors", {
        error: result.error.issues[0]?.message ?? "Unable to create vendor."
      })
    );
  }

  let vendor;

  try {
    vendor = await createVendor(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/vendors", {
        error: error instanceof Error ? error.message : "Unable to create vendor."
      })
    );
  }

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${vendor.id}`);
  revalidatePath("/people");

  redirect(
    buildRedirect("/vendors", {
      message: `${vendor.name} was created successfully.`
    })
  );
}

export async function updateVendorAction(formData: FormData) {
  const vendorId = getFieldValue(formData, "vendorId");
  const result = parseVendorInput(formData);

  if (!vendorId) {
    redirect(
      buildRedirect("/vendors", {
        error: "Vendor id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/vendors/${vendorId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update vendor."
      })
    );
  }

  let vendor;

  try {
    vendor = await updateVendor(vendorId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/vendors/${vendorId}`, {
        error: error instanceof Error ? error.message : "Unable to update vendor."
      })
    );
  }

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${vendor.id}`);
  revalidatePath("/people");

  redirect(
    buildRedirect(`/vendors/${vendor.id}`, {
      message: `${vendor.name} was updated successfully.`
    })
  );
}
