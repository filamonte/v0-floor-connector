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
  notes: optionalTrimmedString(4000)
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
