import { z } from "zod";

import {
  componentRoleOptions,
  finishFamilyOptions,
  quantityBasisOptions,
  serviceFamilyOptions,
  systemLayerStatuses
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
    .transform((value) => (value == null ? null : value.toFixed(4)));
}

function sortOrderField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : "0"))
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Sort order must be a valid number."
    })
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value >= 0, {
      message: "Sort order must be a whole number zero or greater."
    });
}

function formulaMetadataField() {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : "{}"))
    .transform((value, context) => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Formula metadata must be valid JSON."
        });
        return z.NEVER;
      }
    })
    .refine(
      (value) =>
        typeof value === "object" && value !== null && !Array.isArray(value),
      {
        message: "Formula metadata must be a JSON object."
      }
    )
    .transform((value) => value as Record<string, unknown>);
}

export const finishProductInputSchema = z.object({
  finishProductId: optionalUuidField("Select a valid finish product."),
  manufacturerName: z
    .string()
    .trim()
    .min(1, "Manufacturer name is required.")
    .max(160),
  productLine: trimmedNullableString(160),
  productCode: trimmedNullableString(120),
  sku: trimmedNullableString(120),
  productName: z.string().trim().min(1, "Product name is required.").max(160),
  serviceFamily: z
    .enum(serviceFamilyOptions)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null))
    .transform((value) => value ?? null),
  finishFamily: z
    .enum(finishFamilyOptions)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null))
    .transform((value) => value ?? null),
  displayColorName: trimmedNullableString(160),
  customerFacingDescription: trimmedNullableString(2000),
  technicalNotes: trimmedNullableString(4000),
  status: z.enum(systemLayerStatuses)
});

export const floorSystemTemplateInputSchema = z.object({
  templateId: optionalUuidField("Select a valid floor system template."),
  name: z.string().trim().min(1, "Template name is required.").max(160),
  serviceFamily: z.enum(serviceFamilyOptions),
  finishFamily: z
    .enum(finishFamilyOptions)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null))
    .transform((value) => value ?? null),
  customerFacingDescription: trimmedNullableString(2000),
  internalNotes: trimmedNullableString(4000),
  prepRequirements: trimmedNullableString(4000),
  technicalNotes: trimmedNullableString(4000),
  status: z.enum(systemLayerStatuses)
});

export const floorSystemComponentInputSchema = z.object({
  templateId: z.string().uuid("A floor system template is required."),
  catalogItemId: z.string().uuid("A catalog item is required."),
  finishProductId: optionalUuidField("Select a valid finish product."),
  componentRole: z.enum(componentRoleOptions),
  quantityBasis: z.enum(quantityBasisOptions),
  defaultQuantity: quantityField("Default quantity"),
  formulaMetadata: formulaMetadataField(),
  customerFacingLabel: trimmedNullableString(160),
  internalNotes: trimmedNullableString(2000),
  isOptional: z.boolean()
});

export const floorSystemComponentsReplaceSchema = z.object({
  templateId: z.string().uuid("A floor system template is required."),
  components: z.array(
    z.object({
      componentId: z.string().uuid("A component id is required."),
      catalogItemId: z.string().uuid("A catalog item is required."),
      finishProductId: optionalUuidField("Select a valid finish product."),
      componentRole: z.enum(componentRoleOptions),
      quantityBasis: z.enum(quantityBasisOptions),
      defaultQuantity: quantityField("Default quantity"),
      formulaMetadata: formulaMetadataField(),
      customerFacingLabel: trimmedNullableString(160),
      internalNotes: trimmedNullableString(2000),
      isOptional: z.boolean(),
      sortOrder: sortOrderField(),
      remove: z.boolean()
    })
  )
});

export type FinishProductInput = z.infer<typeof finishProductInputSchema>;
export type FloorSystemTemplateInput = z.infer<
  typeof floorSystemTemplateInputSchema
>;
export type FloorSystemComponentInput = z.infer<
  typeof floorSystemComponentInputSchema
>;
export type FloorSystemComponentsReplaceInput = z.infer<
  typeof floorSystemComponentsReplaceSchema
>;
