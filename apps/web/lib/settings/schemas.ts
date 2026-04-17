import { z } from "zod";

const templateStatuses = ["active", "archived"] as const;
const taxBehaviors = ["exclusive", "inclusive", "none"] as const;

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

export const documentTemplateSettingsInputSchema = z
  .object({
    templateId: z.string().uuid("Template id is required."),
    name: z.string().trim().min(1, "Template name is required.").max(120),
    description: trimmedNullableString(255),
    subjectTemplate: trimmedNullableString(255),
    bodyTemplate: z
      .string()
      .trim()
      .min(1, "Template body is required.")
      .max(50000),
    status: z.enum(templateStatuses),
    isDefault: z.boolean()
  })
  .refine((value) => !(value.status === "archived" && value.isDefault), {
    message: "Archived templates cannot be the organization default.",
    path: ["status"]
  });

export const organizationFinancialSettingsInputSchema = z.object({
  defaultTaxBehavior: z.enum(taxBehaviors),
  defaultTaxRate: taxRatePercentField("Default tax rate"),
  defaultRetainagePercentage: percentStringField("Default retainage percentage")
});

export const organizationWorkflowSettingsInputSchema = z.object({
  approvedEstimateContractTemplateId: optionalUuidField(
    "Select a valid contract template."
  ),
  requireContractInternalApproval: z.boolean(),
  requireDepositBeforeJobScheduling: z.boolean(),
  defaultDepositPercentage: percentStringField("Default deposit percentage")
});

export const organizationProfileInputSchema = z.object({
  legalName: z.string().trim().min(1, "Legal name is required.").max(160),
  displayName: z.string().trim().min(1, "Display name is required.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must use lowercase letters, numbers, and hyphens only."
    })
});

export const catalogItemSettingsInputSchema = z
  .object({
    itemId: optionalUuidField("Select a valid catalog item."),
    itemType: z.enum(["material", "service", "system"] as const),
    name: z.string().trim().min(1, "Catalog item name is required.").max(120),
    description: trimmedNullableString(255),
    unit: z.string().trim().min(1, "Unit is required.").max(40),
    defaultUnitPrice: z
      .string()
      .trim()
      .min(1, "Default unit price is required.")
      .refine((value) => !Number.isNaN(Number(value)), {
        message: "Default unit price must be a valid number."
      })
      .transform((value) => Number(value))
      .refine((value) => value >= 0, {
        message: "Default unit price must be zero or greater."
      })
      .transform((value) => value.toFixed(2)),
    status: z.enum(templateStatuses),
    isDefault: z.boolean()
  })
  .refine((value) => !(value.status === "archived" && value.isDefault), {
    message: "Archived catalog items cannot be the default.",
    path: ["status"]
  });

export const organizationFeatureOverrideInputSchema = z.object({
  key: z.string().trim().min(1, "Feature key is required.").max(120),
  name: z.string().trim().min(1, "Feature name is required.").max(120),
  description: trimmedNullableString(255),
  moduleKey: trimmedNullableString(80),
  surface: trimmedNullableString(80),
  enabled: z.boolean()
});

export const organizationMembershipRoleInputSchema = z.object({
  membershipId: z.string().uuid("Membership id is required."),
  nextRole: z.enum(["owner", "admin", "manager", "member"] as const)
});

export type DocumentTemplateSettingsInput = z.infer<
  typeof documentTemplateSettingsInputSchema
>;
export type OrganizationFinancialSettingsInput = z.infer<
  typeof organizationFinancialSettingsInputSchema
>;
export type OrganizationWorkflowSettingsInput = z.infer<
  typeof organizationWorkflowSettingsInputSchema
>;
export type OrganizationProfileInput = z.infer<
  typeof organizationProfileInputSchema
>;
export type CatalogItemSettingsInput = z.infer<
  typeof catalogItemSettingsInputSchema
>;
