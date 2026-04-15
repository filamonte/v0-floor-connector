import { z } from "zod";

const opportunityStatuses = [
  "new",
  "contacted",
  "qualified",
  "site_assessment_scheduled",
  "site_assessment_complete",
  "estimating",
  "proposal_sent",
  "won",
  "lost",
  "converted"
] as const;

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

export const opportunityStatusSchema = z.enum(opportunityStatuses);

export const opportunityInputSchema = z.object({
  title: z.string().trim().min(1, "Lead title is required.").max(160),
  status: opportunityStatusSchema,
  source: optionalTrimmedString(120),
  serviceType: optionalTrimmedString(120),
  prospectName: z.string().trim().min(1, "Prospect name is required.").max(120),
  prospectCompanyName: optionalTrimmedString(120),
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
  phone: optionalTrimmedString(40),
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

export type OpportunityInput = z.infer<typeof opportunityInputSchema>;
export const opportunityStatusesList = opportunityStatuses;
