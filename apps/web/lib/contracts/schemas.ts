import { z } from "zod";

const contractStatuses = ["draft", "sent", "viewed", "signed", "void"] as const;

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

export const contractStatusSchema = z.enum(contractStatuses);

export const createContractFromEstimateInputSchema = z.object({
  estimateId: z.string().uuid("Select a valid approved estimate."),
  templateId: optionalUuidField("Select a valid contract template.")
});

export const updateContractDraftInputSchema = z.object({
  contractId: z.string().uuid("Contract id is required."),
  title: z.string().trim().min(1, "Title is required.").max(200),
  renderedSubject: optionalTrimmedString(255),
  renderedContent: z.string().trim().min(1, "Contract content is required.").max(50000),
  editSummary: optionalTrimmedString(255)
});

export type CreateContractFromEstimateInput = z.infer<
  typeof createContractFromEstimateInputSchema
>;
export type UpdateContractDraftInput = z.infer<typeof updateContractDraftInputSchema>;
export const contractStatusesList = contractStatuses;
