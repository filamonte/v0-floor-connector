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

function optionalDateField(label: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: `${label} must be a valid date.`
    })
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
  siteAssessmentScheduledOn: optionalDateField("Site assessment scheduled date"),
  siteAssessmentCompletedOn: optionalDateField("Site assessment completed date"),
  requirementsSummary: optionalTrimmedString(4000),
  notes: optionalTrimmedString(4000)
}).superRefine((value, ctx) => {
  if (
    value.siteAssessmentScheduledOn &&
    value.siteAssessmentCompletedOn &&
    value.siteAssessmentCompletedOn < value.siteAssessmentScheduledOn
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Site assessment completion cannot be before the scheduled date.",
      path: ["siteAssessmentCompletedOn"]
    });
  }
});

export type OpportunityInput = z.infer<typeof opportunityInputSchema>;
export const opportunityStatusesList = opportunityStatuses;
