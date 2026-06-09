import { z } from "zod";

import { assessmentPackageStatuses } from "./assessment-package";

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

function optionalDateField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

export const assessmentPackageInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(180),
  assessmentDate: optionalDateField(),
  siteContactName: optionalTrimmedString(180),
  siteContactPhone: optionalTrimmedString(80),
  accessNotes: optionalTrimmedString(2000),
  parkingNotes: optionalTrimmedString(2000),
  siteNotes: optionalTrimmedString(4000),
  customerGoals: optionalTrimmedString(4000),
  currentConditionsSummary: optionalTrimmedString(4000),
  recommendedSystemSummary: optionalTrimmedString(4000),
  riskSummary: optionalTrimmedString(4000),
  estimateHandoffSummary: optionalTrimmedString(4000)
});

export const assessmentPackageCreateInputSchema =
  assessmentPackageInputSchema.pick({
    title: true,
    assessmentDate: true
  });

export const assessmentPackageStatusInputSchema = z.object({
  status: z.enum(assessmentPackageStatuses)
});

export type AssessmentPackageInput = z.infer<
  typeof assessmentPackageInputSchema
>;
export type AssessmentPackageCreateInput = z.infer<
  typeof assessmentPackageCreateInputSchema
>;
export type AssessmentPackageStatusInput = z.infer<
  typeof assessmentPackageStatusInputSchema
>;
