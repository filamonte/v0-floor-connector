import { z } from "zod";

import {
  automationNotificationPreferenceCategories,
  automationNotificationPreferenceRoles
} from "@/lib/automation/preferences";

const templateStatuses = ["active", "archived"] as const;
const taxBehaviors = ["exclusive", "inclusive", "none"] as const;
const automationNotificationPreferenceCategoryOptions =
  automationNotificationPreferenceCategories as unknown as [
    (typeof automationNotificationPreferenceCategories)[number],
    ...(typeof automationNotificationPreferenceCategories)[number][]
  ];
const automationNotificationPreferenceRoleOptions =
  automationNotificationPreferenceRoles as unknown as [
    (typeof automationNotificationPreferenceRoles)[number],
    ...(typeof automationNotificationPreferenceRoles)[number][]
  ];

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

function optionalEmailField() {
  return trimmedNullableString(254).refine(
    (value) => value === null || z.string().email().safeParse(value).success,
    {
      message: "Enter a valid company email."
    }
  );
}

function optionalHttpUrlField(label: string) {
  return trimmedNullableString(2000).refine((value) => {
    if (value === null) {
      return true;
    }

    const parsed = z.string().url().safeParse(value);

    if (!parsed.success) {
      return false;
    }

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, {
    message: `${label} must be a valid http or https URL.`
  });
}

function optionalBrandAccentColorField() {
  return trimmedNullableString(7)
    .refine((value) => value === null || /^#[0-9a-fA-F]{6}$/.test(value), {
      message: "Brand accent color must be a hex color like #d8731f."
    })
    .transform((value) => value?.toLowerCase() ?? null);
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

function optionalCurrencyField(label: string) {
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
  requireContractSignatureBeforeJobScheduling: z.boolean(),
  requireDepositBeforeJobScheduling: z.boolean(),
  requireFinancingApprovalBeforeJobScheduling: z.boolean(),
  defaultDepositPercentage: percentStringField("Default deposit percentage"),
  defaultEstimateTermsHtml: trimmedNullableString(50000),
  defaultEstimateInclusionsHtml: trimmedNullableString(50000),
  defaultEstimateExclusionsHtml: trimmedNullableString(50000),
  defaultEstimateScopeSummaryHtml: trimmedNullableString(50000),
  nextEstimateNumber: positiveIntegerField("Next estimate number"),
  nextInvoiceNumber: positiveIntegerField("Next invoice number"),
  nextChangeOrderNumber: positiveIntegerField("Next change order number"),
  nextContractNumber: positiveIntegerField("Next contract number")
});

export const automationNotificationPreferencesInputSchema = z.object({
  preferences: z
    .array(
      z.object({
        category: z.enum(automationNotificationPreferenceCategoryOptions),
        enabledForFutureExecution: z.boolean(),
        notifyRoles: z
          .array(z.enum(automationNotificationPreferenceRoleOptions))
          .transform((value) => Array.from(new Set(value)))
      })
    )
    .length(
      automationNotificationPreferenceCategories.length,
      "Every automation category needs a preference row."
    )
    .superRefine((value, context) => {
      const seen = new Set<string>();

      for (const preference of value) {
        if (seen.has(preference.category)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate automation preference category: ${preference.category}.`
          });
        }

        seen.add(preference.category);
      }
    })
});

export const organizationProfileInputSchema = z.object({
  legalName: z.string().trim().min(1, "Legal name is required.").max(160),
  displayName: z.string().trim().min(1, "Display name is required.").max(160),
  logoUrl: z
    .string()
    .trim()
    .max(2000, "Logo URL must be 2000 characters or fewer.")
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .refine((value) => value === null || z.string().url().safeParse(value).success, {
      message: "Logo URL must be a valid absolute URL."
    }),
  phone: trimmedNullableString(40),
  email: optionalEmailField(),
  websiteUrl: optionalHttpUrlField("Website URL"),
  primaryTrade: trimmedNullableString(120),
  brandAccentColor: optionalBrandAccentColorField(),
  timeZone: trimmedNullableString(120),
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
    inventoryItemId: optionalUuidField("Select a valid inventory record."),
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
    name: z.string().trim().min(1, "Catalog item name is required.").max(120),
    description: trimmedNullableString(255),
    internalNotes: trimmedNullableString(2000),
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
    defaultUnitPrice: optionalCurrencyField("Default unit price"),
    markupPercent: percentStringField("Markup percentage"),
    hiddenMarkupPercent: percentStringField("Hidden markup percentage"),
    taxable: z.boolean(),
    taxCodeId: optionalUuidField("Select a valid tax code."),
    vendorId: optionalUuidField("Select a valid vendor."),
    category: trimmedNullableString(120),
    costCode: trimmedNullableString(120),
    sku: trimmedNullableString(120),
    photoStoragePath: trimmedNullableString(2000),
    status: z.enum(templateStatuses),
    isDefault: z.boolean(),
    trackInventory: z.boolean(),
    inventoryLocation: z
      .string()
      .trim()
      .max(120)
      .transform((value) => (value.length > 0 ? value : "default")),
    inventoryReorderPoint: z
      .string()
      .trim()
      .transform((value) => (value.length > 0 ? value : "0"))
      .refine((value) => !Number.isNaN(Number(value)), {
        message: "Inventory reorder point must be a valid number."
      })
      .transform((value) => Number(value))
      .refine((value) => value >= 0, {
        message: "Inventory reorder point must be zero or greater."
      })
      .transform((value) => value.toFixed(4)),
    inventoryAdjustmentQuantity: z
      .string()
      .trim()
      .transform((value) => (value.length > 0 ? value : null))
      .nullable()
      .refine((value) => value == null || !Number.isNaN(Number(value)), {
        message: "Inventory adjustment must be a valid number."
      })
      .transform((value) => (value == null ? null : Number(value)))
      .refine((value) => value == null || value !== 0, {
        message: "Inventory adjustment cannot be zero."
      })
      .transform((value) => (value == null ? null : value.toFixed(4))),
    inventoryAdjustmentNote: trimmedNullableString(500),
    submitMode: z.enum(["save", "adjust"]).default("save")
  })
  .refine((value) => !(value.status === "archived" && value.isDefault), {
    message: "Archived catalog items cannot be the default.",
    path: ["status"]
  });

export const taxCodeSettingsInputSchema = z.object({
  taxCodeId: optionalUuidField("Select a valid tax code."),
  name: z.string().trim().min(1, "Tax code name is required.").max(120),
  rate: taxRatePercentField("Tax rate"),
  jurisdiction: trimmedNullableString(120),
  active: z.boolean()
});

export const inventoryItemSettingsInputSchema = z.object({
  inventoryItemId: optionalUuidField("Select a valid inventory item."),
  name: z.string().trim().min(1, "Inventory item name is required.").max(120),
  sku: trimmedNullableString(120),
  description: trimmedNullableString(255),
  category: trimmedNullableString(120),
  unitOfMeasure: z.string().trim().min(1, "Unit of measure is required.").max(40),
  reorderPoint: z
    .string()
    .trim()
    .min(1, "Reorder point is required.")
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Reorder point must be a valid number."
    })
    .transform((value) => Number(value))
    .refine((value) => value >= 0, {
      message: "Reorder point must be zero or greater."
    })
    .transform((value) => value.toFixed(4)),
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
  taxable: z.boolean(),
  status: z.enum(templateStatuses)
});

export const inventoryTransactionSettingsInputSchema = z.object({
  transactionId: optionalUuidField("Select a valid inventory transaction."),
  inventoryItemId: z.string().uuid("Select a valid inventory item."),
  transactionType: z.enum(
    ["purchase", "adjustment", "job_usage", "return", "waste", "transfer"] as const
  ),
  quantityChange: z
    .string()
    .trim()
    .min(1, "Quantity change is required.")
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "Quantity change must be a valid number."
    })
    .transform((value) => Number(value))
    .refine((value) => value !== 0, {
      message: "Quantity change cannot be zero."
    })
    .transform((value) => value.toFixed(4)),
  unitCost: optionalCurrencyField("Unit cost"),
  referenceType: trimmedNullableString(120),
  referenceId: trimmedNullableString(120),
  notes: trimmedNullableString(500)
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
export type AutomationNotificationPreferencesInput = z.infer<
  typeof automationNotificationPreferencesInputSchema
>;
export type OrganizationProfileInput = z.infer<
  typeof organizationProfileInputSchema
>;
export type CatalogItemSettingsInput = z.infer<
  typeof catalogItemSettingsInputSchema
>;
