import { z } from "zod";

import { STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION } from "./starter-pack-provisioning-draft-review-core";
import { STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION } from "./starter-pack-provisioning-execution-core";
import { CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION } from "./contractor-group-proposal-apply-core";

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
  costCode: trimmedNullableString(120),
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

export const platformStarterPackInputSchema = z.object({
  packId: optionalUuidField("Select a valid starter pack."),
  packKey: z
    .string()
    .trim()
    .min(1, "Starter pack key is required.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Starter pack key must use lowercase letters, numbers, and hyphens only."
    }),
  name: z.string().trim().min(1, "Starter pack name is required.").max(120),
  description: trimmedNullableString(500),
  status: z.enum(["draft", "published", "archived"] as const),
  segmentKey: trimmedNullableString(120)
});

export const contractorGroupInputSchema = z.object({
  contractorGroupId: optionalUuidField("Select a valid contractor group."),
  key: z
    .string()
    .trim()
    .min(1, "Contractor group key is required.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Contractor group key must use lowercase letters, numbers, and hyphens only."
    }),
  name: z.string().trim().min(1, "Contractor group name is required.").max(120),
  description: trimmedNullableString(500),
  status: z.enum(["active", "inactive", "archived"] as const),
  groupType: z.enum(
    [
      "trade_segment",
      "onboarding",
      "beta",
      "internal",
      "future_plan",
      "future_entitlement",
      "regional",
      "custom"
    ] as const
  )
});

export const contractorGroupArchiveInputSchema = z.object({
  contractorGroupId: z.string().uuid("Contractor group id is required.")
});

export const contractorGroupMembershipInputSchema = z.object({
  contractorGroupId: z.string().uuid("Contractor group id is required."),
  organizationId: z.string().uuid("Select a valid contractor organization."),
  assignmentSource: z.enum(
    ["manual", "targeting_preview", "future_auto_assignment"] as const
  ),
  notes: trimmedNullableString(1000)
});

export const contractorGroupMembershipRemoveInputSchema = z.object({
  membershipId: z.string().uuid("Contractor group membership id is required.")
});

const contractorGroupProposalSubmittedFingerprintSchema = z
  .object({
    proposalId: z.string().trim().nullable().optional(),
    organizationId: z.string().uuid().nullable().optional(),
    contractorGroupId: z.string().uuid().nullable().optional(),
    contractorGroupKey: z.string().trim().nullable().optional(),
    contractorGroupType: z
      .enum(
        [
          "trade_segment",
          "onboarding",
          "beta",
          "internal",
          "future_plan",
          "future_entitlement",
          "regional",
          "custom"
        ] as const
      )
      .nullable()
      .optional(),
    contractorGroupStatus: z.enum(["active", "inactive", "archived"] as const).nullable().optional(),
    status: z
      .enum(["proposed", "already_assigned", "not_applicable", "unavailable"] as const)
      .nullable()
      .optional(),
    confidence: z
      .enum(["high", "medium", "low", "unavailable"] as const)
      .nullable()
      .optional(),
    source: z
      .enum(
        [
          "exact_region_match",
          "exact_trade_match",
          "onboarding_label_match",
          "beta_label_match",
          "existing_membership",
          "insufficient_data",
          "future_only"
        ] as const
      )
      .nullable()
      .optional(),
    reasonCode: z
      .enum(
        [
          "exact_region_match",
          "exact_trade_match",
          "onboarding_label_match",
          "beta_label_match",
          "missing_region_metadata",
          "missing_trade_metadata",
          "future_entitlement_blocked",
          "future_plan_blocked",
          "archived_group_blocked",
          "inactive_group_not_recommended",
          "existing_membership",
          "not_applicable"
        ] as const
      )
      .nullable()
      .optional(),
    manualReviewReadiness: z
      .enum(
        [
          "ready_for_review",
          "already_assigned",
          "blocked",
          "needs_metadata",
          "future_only",
          "not_recommended"
        ] as const
      )
      .nullable()
      .optional()
  })
  .strict();

export const contractorGroupProposalManualApplyInputSchema = z.object({
  contractorGroupId: z.string().uuid("Contractor group id is required."),
  organizationId: z.string().uuid("Select a valid contractor organization."),
  submittedProposal: contractorGroupProposalSubmittedFingerprintSchema,
  operatorReason: z
    .string()
    .trim()
    .min(1, "Enter an operator reason before assigning this proposal.")
    .max(1000, "Operator reason must be 1000 characters or fewer."),
  confirmationPhrase: z.literal(
    CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION,
    {
      errorMap: () => ({
        message: `Type ${CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION} to assign this proposal.`
      })
    }
  )
});

export const platformStarterPackTemplateItemInputSchema = z.object({
  starterPackId: z.string().uuid("Starter pack id is required."),
  templateSeedId: z.string().uuid("Select a valid template seed."),
  isRequired: z.boolean()
});

export const platformStarterPackCatalogItemInputSchema = z.object({
  starterPackId: z.string().uuid("Starter pack id is required."),
  catalogSeedId: z.string().uuid("Select a valid catalog seed."),
  isRequired: z.boolean()
});

export const platformStarterPackRemoveItemInputSchema = z.object({
  itemId: z.string().uuid("Starter pack item id is required.")
});

export const platformStarterPackAssignmentInputSchema = z
  .object({
    assignmentId: optionalUuidField("Select a valid starter pack assignment."),
    starterPackId: z.string().uuid("Starter pack id is required."),
    assignmentType: z.enum(
      [
        "all_organizations",
        "organization",
        "onboarding_profile",
        "region",
        "trade_segment",
        "plan_tier",
        "future_contractor_group"
      ] as const
    ),
    organizationId: optionalUuidField("Select a valid organization."),
    assignmentKey: trimmedNullableString(120),
    label: trimmedNullableString(160),
    status: z.enum(["draft", "active", "inactive"] as const),
    notes: trimmedNullableString(2000)
  })
  .superRefine((value, context) => {
    if (value.assignmentType === "all_organizations") {
      return;
    }

    if (value.assignmentType === "organization") {
      if (!value.organizationId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select an organization for organization assignment intent.",
          path: ["organizationId"]
        });
      }

      return;
    }

    if (!value.assignmentKey) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a target key for this assignment intent.",
        path: ["assignmentKey"]
      });
    }
  });

export const platformStarterPackAssignmentRemoveInputSchema = z.object({
  assignmentId: z.string().uuid("Starter pack assignment id is required.")
});

export const platformStarterPackProvisioningDraftInputSchema = z.object({
  organizationId: z.string().uuid("Select a valid contractor organization."),
  starterPackId: z.string().uuid("Select a valid starter pack.")
});

export const platformStarterPackProvisioningApprovalInputSchema = z.object({
  runId: z.string().uuid("Select a valid provisioning audit run."),
  confirmationText: z
    .string()
    .trim()
    .refine(
      (value) => value === STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION,
      {
        message: `Type ${STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION} exactly to approve this audit draft.`
      }
    )
});

export const platformStarterPackProvisioningExecutionInputSchema = z.object({
  runId: z.string().uuid("Select a valid approved provisioning run."),
  confirmationText: z
    .string()
    .trim()
    .refine(
      (value) => value === STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION,
      {
        message: `Type ${STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION} exactly to execute this starter pack.`
      }
    )
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

export const platformTenantActivationInputSchema = z.object({
  companyId: z.string().uuid("Company id is required.")
});

export const platformTenantResetInputSchema = z.object({
  companyId: z.string().uuid("Company id is required.")
});

export const platformTenantWorkflowNumberingInputSchema = z.object({
  companyId: z.string().uuid("Company id is required."),
  nextEstimateNumber: positiveIntegerField("Next estimate number"),
  nextInvoiceNumber: positiveIntegerField("Next invoice number"),
  nextChangeOrderNumber: positiveIntegerField("Next change order number"),
  nextContractNumber: positiveIntegerField("Next contract number")
});
