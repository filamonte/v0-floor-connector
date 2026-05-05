import { z } from "zod";

import {
  selectedSystemAreaTypes,
  selectedSystemSources,
  selectedSystemSpecCompletenessStatuses,
  selectedSystemStatuses
} from "./constants";

function trimmedNullableString(maxLength: number) {
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

function quantityField(label: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => (value == null ? null : Number(value)))
    .refine((value) => value == null || value >= 0, {
      message: `${label} must be zero or greater.`
    })
    .transform((value) => (value == null ? null : value.toFixed(2)));
}

export const selectedSystemInputSchema = z
  .object({
    selectedSystemId: optionalUuidField("Select a valid selected system."),
    floorSystemTemplateId: optionalUuidField("Select a valid floor system template."),
    finishProductId: optionalUuidField("Select a valid finish product."),
    opportunityId: optionalUuidField("Select a valid opportunity."),
    customerId: optionalUuidField("Select a valid customer."),
    projectId: optionalUuidField("Select a valid project."),
    estimateId: optionalUuidField("Select a valid estimate."),
    contractId: optionalUuidField("Select a valid contract."),
    jobId: optionalUuidField("Select a valid job."),
    source: z.enum(selectedSystemSources),
    status: z.enum(selectedSystemStatuses),
    isPrimary: z.boolean(),
    areaLabel: trimmedNullableString(160),
    areaType: z.enum(selectedSystemAreaTypes),
    phaseLabel: trimmedNullableString(160),
    optionLabel: trimmedNullableString(160),
    estimatedAreaSqft: quantityField("Estimated area"),
    estimatedLinearFt: quantityField("Estimated linear feet"),
    quantityNotes: trimmedNullableString(2000),
    customerFacingDescription: trimmedNullableString(4000),
    internalNotes: trimmedNullableString(4000),
    specCompletenessStatus: z.enum(selectedSystemSpecCompletenessStatuses)
  })
  .refine(
    (value) =>
      Boolean(
        value.opportunityId ||
          value.customerId ||
          value.projectId ||
          value.estimateId ||
          value.contractId ||
          value.jobId
      ),
    {
      message: "Selected systems require at least one real workflow anchor."
    }
  )
  .refine((value) => !value.isPrimary || Boolean(value.projectId), {
    message: "Primary selected systems must be linked to a project."
  });

export type SelectedSystemInput = z.infer<typeof selectedSystemInputSchema>;
