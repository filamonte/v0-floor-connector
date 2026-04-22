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

function optionalNumberStringField(label: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => value ?? null);
}

function optionalIntegerField(label: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || Number.isInteger(Number(value)), {
      message: `${label} must be a whole number.`
    })
    .transform((value) => value ?? null);
}

export const opportunityStatusSchema = z.enum(opportunityStatuses);

export const opportunityMeasurementInputSchema = z.object({
  areaLabel: optionalTrimmedString(120),
  measurementType: z.string().trim().min(1, "Measurement type is required.").max(80),
  valueNumeric: optionalNumberStringField("Measurement value").refine(
    (value) => value !== null,
    {
      message: "Measurement value is required."
    }
  ),
  unit: z.string().trim().min(1, "Measurement unit is required.").max(40),
  quantity: optionalIntegerField("Measurement quantity"),
  captureMethod: optionalTrimmedString(40),
  notes: optionalTrimmedString(400)
});

export const opportunityAttachmentInputSchema = z.object({
  attachmentType: z.enum(["photo", "file"]),
  storagePath: z.string().trim().min(1, "Attachment path is required.").max(500),
  fileName: z.string().trim().min(1, "Attachment file name is required.").max(255),
  mimeType: z.string().trim().min(1, "Attachment mime type is required.").max(120),
  caption: optionalTrimmedString(200),
  tag: optionalTrimmedString(120)
});

export const opportunityObservationInputSchema = z.object({
  observationType: z.string().trim().min(1, "Observation type is required.").max(80),
  title: z.string().trim().min(1, "Observation title is required.").max(160),
  body: optionalTrimmedString(4000),
  severity: optionalTrimmedString(16)
});

export const opportunityInputSchema = z.object({
  title: optionalTrimmedString(160),
  status: opportunityStatusSchema,
  source: optionalTrimmedString(120),
  sourceDetail: optionalTrimmedString(160),
  serviceType: optionalTrimmedString(120),
  jobType: z.string().trim().min(1, "Job type is required.").max(120),
  siteName: z.string().trim().min(1, "Site or location is required.").max(160),
  contactName: z.string().trim().min(1, "Primary contact name is required.").max(120),
  contactCompanyName: optionalTrimmedString(120),
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
  contactPhone: optionalTrimmedString(40),
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
  notes: optionalTrimmedString(4000),
  measurements: z.array(opportunityMeasurementInputSchema).default([]),
  observations: z.array(opportunityObservationInputSchema).default([]),
  attachments: z.array(opportunityAttachmentInputSchema).default([])
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
export const opportunityQuickCreateInputSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  address: z.string().trim().min(1, "Address is required.").max(160),
  phoneNumber: z.string().trim().min(1, "Phone number is required.").max(40),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(255)
    .refine((value) => z.string().email().safeParse(value).success, {
      message: "Enter a valid email address."
    }),
  cellPhone: z.string().trim().min(1, "Cell phone is required.").max(40),
  leadStage: opportunityStatusSchema,
  companyName: optionalTrimmedString(120)
});

export type OpportunityQuickCreateInput = z.infer<typeof opportunityQuickCreateInputSchema>;
export const opportunityStatusesList = opportunityStatuses;
