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

const opportunityMeasurementTypes = ["area", "linear", "count"] as const;
const opportunityMeasurementUnits = ["sqft", "lf", "ea"] as const;
const opportunityObservationSeverities = [
  "low",
  "medium",
  "high",
  "critical"
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

const requiredStateCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .min(1, "State is required.")
      .length(2, "State must be a 2-letter code, like MA.")
      .regex(/^[A-Z]{2}$/, "State must be a 2-letter code, like MA.")
  );

const optionalCountryCodeSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value.toUpperCase() : null))
  .nullable()
  .optional()
  .refine((value) => value === null || value === undefined || /^[A-Z]{2}$/.test(value), {
    message: "Country must be a 2-letter code, like US."
  })
  .transform((value) => value ?? null);

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
  measurementType: z.enum(opportunityMeasurementTypes, {
    required_error: "Measurement type is required.",
    invalid_type_error: "Measurement type is required."
  }),
  valueNumeric: optionalNumberStringField("Measurement value").refine(
    (value) => value !== null,
    {
      message: "Measurement value is required."
    }
  ),
  unit: z.enum(opportunityMeasurementUnits, {
    required_error: "Measurement unit is required.",
    invalid_type_error: "Measurement unit is required."
  }),
  quantity: optionalIntegerField("Measurement quantity"),
  captureMethod: optionalTrimmedString(40),
  notes: optionalTrimmedString(400)
}).superRefine((value, ctx) => {
  const expectedUnits: Record<(typeof opportunityMeasurementTypes)[number], (typeof opportunityMeasurementUnits)[number]> = {
    area: "sqft",
    linear: "lf",
    count: "ea"
  };

  if (value.unit !== expectedUnits[value.measurementType]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Measurement unit must match the selected measurement type.",
      path: ["unit"]
    });
  }
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
  severity: z
    .enum(opportunityObservationSeverities)
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" || value == null ? null : value))
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
  addressLine1: z.string().trim().min(1, "Address line 1 is required.").max(160),
  addressLine2: optionalTrimmedString(160),
  city: z.string().trim().min(1, "City is required.").max(120),
  stateRegion: requiredStateCodeSchema,
  postalCode: z.string().trim().min(1, "ZIP/postal code is required.").max(40),
  countryCode: optionalCountryCodeSchema.transform((value) => value ?? "US"),
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
