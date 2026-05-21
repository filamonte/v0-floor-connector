import { z } from "zod";

const complianceSubjectTypes = ["person", "vendor"] as const;
const complianceRecordTypes = [
  "license",
  "insurance",
  "certification",
  "training",
  "background_check",
  "other"
] as const;
const complianceStatuses = [
  "valid",
  "expiring",
  "expired",
  "missing_information"
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

function optionalUuidField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
      message
    })
    .transform((value) => value ?? null);
}

function optionalDateField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === null ||
        /^\d{4}-\d{2}-\d{2}$/.test(value),
      {
        message
      }
    )
    .transform((value) => value ?? null);
}

export const complianceSubjectTypeSchema = z.enum(complianceSubjectTypes);
export const complianceRecordTypeSchema = z.enum(complianceRecordTypes);
export const complianceStatusSchema = z.enum(complianceStatuses);

export const complianceRecordInputSchema = z
  .object({
    subjectType: complianceSubjectTypeSchema,
    subjectId: z.string().trim().uuid("Select a valid compliance subject."),
    recordType: complianceRecordTypeSchema,
    name: z.string().trim().min(1, "Record name is required.").max(160),
    issuingAuthority: optionalTrimmedString(160),
    referenceNumber: optionalTrimmedString(120),
    issuedOn: optionalDateField("Issued date must use YYYY-MM-DD."),
    expiresOn: optionalDateField("Expiration date must use YYYY-MM-DD."),
    status: complianceStatusSchema.default("missing_information"),
    documentFileId: optionalUuidField("Select a valid document file."),
    notes: optionalTrimmedString(4000)
  })
  .superRefine((value, ctx) => {
    if (value.issuedOn && value.expiresOn && value.expiresOn < value.issuedOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresOn"],
        message: "Expiration date must be on or after the issued date."
      });
    }
  });

export type ComplianceRecordInput = z.infer<typeof complianceRecordInputSchema>;
export const complianceSubjectTypesList = complianceSubjectTypes;
export const complianceRecordTypesList = complianceRecordTypes;
export const complianceStatusesList = complianceStatuses;
