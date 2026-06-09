import { z } from "zod";

import { assessmentSpaceTypes } from "./assessment-space";

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

function optionalMeasurementField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || Number(value) >= 0, {
      message: "Measurements must be zero or greater."
    })
    .transform((value) => value ?? null);
}

function optionalIntegerField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? Number(value) : 0))
    .refine((value) => Number.isInteger(value) && value >= 0, {
      message: "Sort order must be zero or greater."
    });
}

export const assessmentSpaceInputSchema = z.object({
  name: z.string().trim().min(1, "Area or space name is required.").max(180),
  spaceType: z.enum(assessmentSpaceTypes).default("area"),
  floorLevel: optionalTrimmedString(120),
  lengthFeet: optionalMeasurementField(),
  widthFeet: optionalMeasurementField(),
  squareFeet: optionalMeasurementField(),
  perimeterFeet: optionalMeasurementField(),
  substrate: optionalTrimmedString(180),
  currentFlooring: optionalTrimmedString(180),
  conditionSummary: optionalTrimmedString(2000),
  prepNotes: optionalTrimmedString(2000),
  moistureNotes: optionalTrimmedString(2000),
  accessNotes: optionalTrimmedString(2000),
  sortOrder: optionalIntegerField()
});

export type AssessmentSpaceInput = z.infer<typeof assessmentSpaceInputSchema>;
