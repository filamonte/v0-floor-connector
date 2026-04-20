import { z } from "zod";

function optionalTrimmedString(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

function percentageField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => Number(value))
    .refine((value) => value >= 0 && value <= 100, {
      message: `${label} must be between 0 and 100.`
    })
    .transform((value) => value.toFixed(2));
}

export const customerInputSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required.").max(120),
  companyName: optionalTrimmedString(120),
  phone: optionalTrimmedString(40),
  email: z
    .string()
    .trim()
    .max(255)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address."
    })
    .transform((value) => value ?? null),
  addressLine1: optionalTrimmedString(160),
  addressLine2: optionalTrimmedString(160),
  city: optionalTrimmedString(120),
  stateRegion: optionalTrimmedString(120),
  postalCode: optionalTrimmedString(40),
  countryCode: optionalTrimmedString(2).transform((value) =>
    value ? value.toUpperCase() : null
  ),
  isTaxExempt: z.boolean().default(false),
  taxExemptionReason: optionalTrimmedString(255),
  taxExemptionReference: optionalTrimmedString(160),
  taxExemptionExpiresOn: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Tax exemption expiration must be a valid date."
    })
    .transform((value) => value ?? null),
  retainagePercentageDefault: percentageField("Default retainage percentage"),
  notes: optionalTrimmedString(4000)
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
export const customerQuickCreateInputSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required.").max(120)
});

export type CustomerQuickCreateInput = z.infer<typeof customerQuickCreateInputSchema>;
