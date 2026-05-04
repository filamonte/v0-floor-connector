import { z } from "zod";

const contractStatuses = ["draft", "sent", "viewed", "signed", "void"] as const;
const contractSignerRoles = ["customer", "contractor"] as const;

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
export const contractSignerRoleSchema = z.enum(contractSignerRoles);

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

export const contractSignerInputSchema = z
  .object({
    signerRole: contractSignerRoleSchema,
    customerId: optionalUuidField("Select a valid customer signer."),
    portalUserId: optionalUuidField("Select a valid portal user."),
    organizationUserId: optionalUuidField("Select a valid organization user."),
    displayName: z.string().trim().min(1, "Signer display name is required.").max(160),
    email: z.string().trim().email("Signer email must be valid.").max(320),
    signerOrder: z.coerce
      .number()
      .int("Signer order must be a whole number.")
      .min(1, "Signer order must be at least 1.")
      .max(25, "Signer order cannot exceed 25.")
  })
  .superRefine((value, context) => {
    if (value.signerRole === "customer" && !value.portalUserId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer signers must be linked to an active portal user.",
        path: ["portalUserId"]
      });
    }

    if (value.signerRole === "contractor" && !value.organizationUserId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contractor signers must be linked to an organization user.",
        path: ["organizationUserId"]
      });
    }
  });

export const sendContractForSignatureInputSchema = z
  .object({
    contractId: z.string().uuid("Contract id is required."),
    signers: z.array(contractSignerInputSchema).max(10).optional().default([])
  })
  .superRefine((value, context) => {
    const uniqueKeys = new Set<string>();
    let customerSignerCount = 0;
    let contractorSignerCount = 0;

    for (const signer of value.signers) {
      const uniqueKey = `${signer.signerRole}:${signer.signerOrder}`;

      if (uniqueKeys.has(uniqueKey)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Signer role and order combinations must be unique.",
          path: ["signers"]
        });
      } else {
        uniqueKeys.add(uniqueKey);
      }

      if (signer.signerRole === "customer") {
        customerSignerCount += 1;
      }

      if (signer.signerRole === "contractor") {
        contractorSignerCount += 1;
      }
    }

    if (contractorSignerCount > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only one contractor countersigner is supported in this pass.",
        path: ["signers"]
      });
    }

    if (value.signers.length > 0 && customerSignerCount === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one customer signer is required when explicit signers are provided.",
        path: ["signers"]
      });
    }
  });

export const contractSendSignatureActionInputSchema = z.object({
  contractId: z.string().uuid("Contract id is required."),
  customerPortalUserId: z.string().uuid("Select a valid customer portal signer."),
  contractorSignerUserId: optionalUuidField("Select a valid contractor countersigner.")
});

export const contractPortalSignatureActionInputSchema = z.object({
  contractId: z.string().uuid("Contract id is required."),
  declineReason: optionalTrimmedString(500)
});

export const contractOnsiteSignatureActionInputSchema = z.object({
  contractId: z.string().uuid("Contract id is required."),
  signerId: z.string().uuid("Signer id is required."),
  signatureImage: z
    .string()
    .trim()
    .min(1, "Signature image is required.")
    .max(2_000_000, "Signature image is too large.")
    .refine((value) => value.startsWith("data:image/png;base64,"), {
      message: "Signature image must be a base64 PNG."
    })
});

export const contractCountersignInputSchema = z.object({
  contractId: z.string().uuid("Contract id is required.")
});

export const voidContractSignatureInputSchema = z.object({
  contractId: z.string().uuid("Contract id is required.")
});

export type CreateContractFromEstimateInput = z.infer<
  typeof createContractFromEstimateInputSchema
>;
export type UpdateContractDraftInput = z.infer<typeof updateContractDraftInputSchema>;
export type ContractSignerInput = z.infer<typeof contractSignerInputSchema>;
export type SendContractForSignatureInput = z.infer<
  typeof sendContractForSignatureInputSchema
>;
export type ContractSendSignatureActionInput = z.infer<
  typeof contractSendSignatureActionInputSchema
>;
export type ContractPortalSignatureActionInput = z.infer<
  typeof contractPortalSignatureActionInputSchema
>;
export type ContractOnsiteSignatureActionInput = z.infer<
  typeof contractOnsiteSignatureActionInputSchema
>;
export type ContractCountersignInput = z.infer<typeof contractCountersignInputSchema>;
export type VoidContractSignatureInput = z.infer<
  typeof voidContractSignatureInputSchema
>;
export const contractStatusesList = contractStatuses;
