"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { saveCompanySetup } from "@/lib/onboarding/company-setup";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
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

function trimmedNullableString(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length > 0 ? value : null));
}

function optionalHttpUrlField(label: string) {
  return trimmedNullableString(2000).refine((value) => {
    if (value === null) {
      return true;
    }

    const parsed = z.string().url().safeParse(value);

    if (!parsed.success) {
      return false;
    }

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, {
    message: `${label} must be a valid http or https URL.`
  });
}

function optionalBrandAccentColorField() {
  return trimmedNullableString(7)
    .refine((value) => value === null || /^#[0-9a-fA-F]{6}$/.test(value), {
      message: "Brand accent color must be a hex color like #d8731f."
    })
    .transform((value) => value?.toLowerCase() ?? null);
}

const companySetupInputSchema = z.object({
  legalName: z.string().trim().min(1, "Company legal name is required.").max(160),
  displayName: z.string().trim().min(1, "Company display name is required.").max(160),
  logoUrl: z
    .string()
    .trim()
    .max(2000, "Logo URL must be 2000 characters or fewer.")
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .refine((value) => value === null || z.string().url().safeParse(value).success, {
      message: "Logo URL must be a valid absolute URL."
    }),
  phone: trimmedNullableString(40),
  email: trimmedNullableString(254).refine(
    (value) => value === null || z.string().email().safeParse(value).success,
    {
      message: "Enter a valid company email."
    }
  ),
  websiteUrl: optionalHttpUrlField("Website URL"),
  primaryTrade: trimmedNullableString(120),
  brandAccentColor: optionalBrandAccentColorField(),
  timeZone: trimmedNullableString(120),
  addressLine1: z.string().trim().min(1, "Street address is required.").max(160),
  addressLine2: z
    .string()
    .trim()
    .max(160)
    .transform((value) => (value.length > 0 ? value : null)),
  city: z.string().trim().min(1, "City is required.").max(120),
  stateRegion: z.string().trim().min(1, "State is required.").max(80),
  postalCode: z.string().trim().min(1, "Postal code is required.").max(20)
});

export async function saveCompanySetupAction(formData: FormData) {
  const scope = await requireOrganizationAdminScope("/setup/company");
  const result = companySetupInputSchema.safeParse({
    legalName: getFieldValue(formData, "legalName"),
    displayName: getFieldValue(formData, "displayName"),
    logoUrl: getFieldValue(formData, "logoUrl"),
    phone: getFieldValue(formData, "phone"),
    email: getFieldValue(formData, "email"),
    websiteUrl: getFieldValue(formData, "websiteUrl"),
    primaryTrade: getFieldValue(formData, "primaryTrade"),
    brandAccentColor: getFieldValue(formData, "brandAccentColor"),
    timeZone: getFieldValue(formData, "timeZone"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/setup/company", {
        error: result.error.issues[0]?.message ?? "Unable to save company setup."
      })
    );
  }

  try {
    await saveCompanySetup({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch {
    redirect(
      buildRedirect("/setup/company", {
        error:
          "We could not save company setup right now. Check the required fields and try again."
      })
    );
  }

  revalidatePath("/setup/company");
  revalidatePath("/settings/organization");
  revalidatePath("/dashboard");

  redirect("/setup/billing");
}
