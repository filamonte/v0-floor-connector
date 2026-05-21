import { z } from "zod";

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

export const estimateContentBlockInputSchema = z.object({
  blockId: optionalUuidField("Select a valid content block."),
  blockType: z.enum(["scope", "inclusion", "exclusion", "terms"] as const),
  title: z.string().trim().min(1, "Content block title is required.").max(160),
  contentHtml: z.string().trim().min(1, "Content block body is required.").max(50000),
  status: z.enum(["active", "archived"] as const),
  sortOrder: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : "0"))
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Sort order must be a valid number."
    })
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value >= 0, {
      message: "Sort order must be zero or greater."
    })
});

export type EstimateContentBlockInput = z.infer<
  typeof estimateContentBlockInputSchema
>;
