import { z } from "zod";

const vendorTypes = ["subcontractor", "supplier", "other"] as const;

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

function optionalEmailField() {
  return z
    .string()
    .trim()
    .max(255)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address."
    })
    .transform((value) => value ?? null);
}

function optionalLastFourField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || /^[0-9]{4}$/.test(value), {
      message: "Tax identifier must use the last four digits only."
    })
    .transform((value) => value ?? null);
}

export const vendorTypeSchema = z.enum(vendorTypes);

export const vendorInputSchema = z.object({
  name: z.string().trim().min(1, "Vendor name is required.").max(160),
  vendorType: vendorTypeSchema,
  isLaborProvider: z.boolean().default(false),
  primaryContactName: optionalTrimmedString(120),
  email: optionalEmailField(),
  phone: optionalTrimmedString(40),
  addressLine1: optionalTrimmedString(160),
  addressLine2: optionalTrimmedString(160),
  city: optionalTrimmedString(120),
  stateRegion: optionalTrimmedString(120),
  postalCode: optionalTrimmedString(40),
  countryCode: optionalTrimmedString(2).transform((value) =>
    value ? value.toUpperCase() : null
  ),
  taxIdentifierLast4: optionalLastFourField(),
  notes: optionalTrimmedString(4000),
  isActive: z.boolean().default(true)
});

export type VendorInput = z.infer<typeof vendorInputSchema>;
export const vendorTypesList = vendorTypes;
