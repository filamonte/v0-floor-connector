import { z } from "zod";

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

function percentStringField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => Number(value))
    .refine((value) => value >= 0 && value <= 100, {
      message: `${label} must be between 0 and 100.`
    })
    .transform((value) => value.toFixed(2));
}

function taxRatePercentField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => Number(value))
    .refine((value) => value >= 0 && value <= 100, {
      message: `${label} must be between 0 and 100.`
    })
    .transform((value) => (value / 100).toFixed(6));
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

function positiveIntegerField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`
    })
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: `${label} must be a whole number greater than zero.`
    });
}

export const platformFinancialDefaultsInputSchema = z.object({
  defaultTaxBehavior: z.enum(["exclusive", "inclusive", "none"] as const),
  defaultTaxRate: taxRatePercentField("Default tax rate"),
  defaultRetainagePercentage: percentStringField("Default retainage percentage")
});

export const platformWorkflowDefaultsInputSchema = z.object({
  approvedEstimateContractSeedId: optionalUuidField(
    "Select a valid contract starter template."
  ),
  requireContractInternalApproval: z.boolean(),
  requireContractSignatureBeforeJobScheduling: z.boolean(),
  requireDepositBeforeJobScheduling: z.boolean(),
  requireFinancingApprovalBeforeJobScheduling: z.boolean(),
  defaultDepositPercentage: percentStringField("Default deposit percentage"),
  defaultEstimateTermsHtml: trimmedNullableString(50000),
  defaultEstimateInclusionsHtml: trimmedNullableString(50000),
  defaultEstimateExclusionsHtml: trimmedNullableString(50000),
  defaultEstimateScopeSummaryHtml: trimmedNullableString(50000),
  defaultEstimateStartNumber: positiveIntegerField("Default estimate start number"),
  defaultInvoiceStartNumber: positiveIntegerField("Default invoice start number"),
  defaultChangeOrderStartNumber: positiveIntegerField(
    "Default change order start number"
  ),
  defaultContractStartNumber: positiveIntegerField("Default contract start number")
});

export const platformTemplateSeedInputSchema = z.object({
  seedId: z.string().uuid("Template seed id is required."),
  name: z.string().trim().min(1, "Template name is required.").max(120),
  description: trimmedNullableString(255),
  subjectTemplate: trimmedNullableString(255),
  bodyTemplate: z.string().trim().min(1, "Template body is required.").max(50000),
  isDefault: z.boolean(),
  isActive: z.boolean()
});

export const platformCatalogSeedInputSchema = z.object({
  seedId: optionalUuidField("Select a valid catalog seed."),
  itemType: z.enum(
    [
      "material",
      "labor",
      "service",
      "equipment",
      "subcontractor",
      "other",
      "system"
    ] as const
  ),
  seedKey: z
    .string()
    .trim()
    .min(1, "Seed key is required.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Seed key must use lowercase letters, numbers, and hyphens only."
    }),
  name: z.string().trim().min(1, "Catalog seed name is required.").max(120),
  description: trimmedNullableString(255),
  unit: z.string().trim().min(1, "Unit is required.").max(40),
  defaultUnitCost: z
    .string()
    .trim()
    .min(1, "Default unit cost is required.")
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Default unit cost must be a valid number."
    })
    .transform((value) => Number(value))
    .refine((value) => value >= 0, {
      message: "Default unit cost must be zero or greater."
    })
    .transform((value) => value.toFixed(2)),
  defaultUnitPrice: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value == null || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: "Default unit price must be a valid non-negative number."
    })
    .transform((value) => (value == null ? null : Number(value).toFixed(2))),
  markupPercent: percentStringField("Markup percentage"),
  hiddenMarkupPercent: percentStringField("Hidden markup percentage"),
  taxable: z.boolean(),
  vendorId: optionalUuidField("Select a valid vendor."),
  category: trimmedNullableString(120),
  sku: trimmedNullableString(120),
  internalNotes: trimmedNullableString(2000),
  photoStoragePath: trimmedNullableString(2000),
  isDefault: z.boolean(),
  isActive: z.boolean()
});

export const platformFeaturePolicyInputSchema = z.object({
  key: z.string().trim().min(1, "Feature key is required.").max(120),
  name: z.string().trim().min(1, "Feature name is required.").max(120),
  description: trimmedNullableString(255),
  moduleKey: trimmedNullableString(80),
  surface: trimmedNullableString(80),
  enabled: z.boolean()
});

export const platformAdminAssignmentInputSchema = z.object({
  email: z.string().trim().email("Enter a valid user email.")
});

export const platformTenantStatusInputSchema = z.object({
  companyId: z.string().uuid("Company id is required."),
  tenantStatus: z.enum(
    ["trialing", "active", "suspended", "locked", "archived", "deleted"] as const
  ),
  lifecycleState: z.enum(
    [
      "trial",
      "active",
      "grace_period",
      "locked",
      "retained",
      "scheduled_for_deletion",
      "deleted",
      "restorable"
    ] as const
  )
});

export const platformTenantWorkflowNumberingInputSchema = z.object({
  companyId: z.string().uuid("Company id is required."),
  nextEstimateNumber: positiveIntegerField("Next estimate number"),
  nextInvoiceNumber: positiveIntegerField("Next invoice number"),
  nextChangeOrderNumber: positiveIntegerField("Next change order number"),
  nextContractNumber: positiveIntegerField("Next contract number")
});
