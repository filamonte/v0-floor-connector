"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePlatformAdminUser } from "@/lib/platform-admin/access";
import {
  addCatalogSeedToStarterPack,
  addTemplateSeedToStarterPack,
  approveStarterPackProvisioningDraftRun,
  archiveContractorGroup,
  assignPlatformAdminByEmail,
  assignOrganizationToContractorGroup,
  createStarterPackProvisioningDraft,
  executeApprovedStarterPackProvisioningRun,
  getStarterPackProvisioningRunDetail,
  recordStarterPackProvisioningExecutionAttempt,
  removeStarterPackAssignment,
  removeStarterPackItem,
  removeOrganizationFromContractorGroup,
  resetEarlyAccessTenantOnboardingState,
  updateCompanyTenantStatus,
  updatePlatformTemplateSeed,
  upsertTenantWorkflowNumberingByPlatformAdmin,
  upsertPlatformCatalogItemSeed,
  upsertPlatformFeaturePolicy,
  upsertPlatformFinancialDefaults,
  upsertPlatformStarterPack,
  upsertPlatformWorkflowDefaults,
  upsertStarterPackAssignment,
  upsertContractorGroup
} from "@/lib/platform-admin/data";

import {
  contractorGroupArchiveInputSchema,
  contractorGroupInputSchema,
  contractorGroupMembershipInputSchema,
  contractorGroupMembershipRemoveInputSchema,
  platformAdminAssignmentInputSchema,
  platformCatalogSeedInputSchema,
  platformFeaturePolicyInputSchema,
  platformFinancialDefaultsInputSchema,
  platformStarterPackCatalogItemInputSchema,
  platformStarterPackAssignmentInputSchema,
  platformStarterPackAssignmentRemoveInputSchema,
  platformStarterPackProvisioningApprovalInputSchema,
  platformStarterPackProvisioningDraftInputSchema,
  platformStarterPackProvisioningExecutionInputSchema,
  platformStarterPackInputSchema,
  platformStarterPackRemoveItemInputSchema,
  platformStarterPackTemplateItemInputSchema,
  platformTenantActivationInputSchema,
  platformTemplateSeedInputSchema,
  platformTenantWorkflowNumberingInputSchema,
  platformTenantStatusInputSchema,
  platformTenantResetInputSchema,
  platformWorkflowDefaultsInputSchema
} from "./schemas";
import { describeProvisioningExecutionAttemptForSchemaFailure } from "./starter-pack-provisioning-attempts-core";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function buildRedirect(pathname: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function validUuidOrNull(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
    ? value
    : null;
}

function revalidatePlatformAdminSlice() {
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/platform");
  revalidatePath("/super-admin/templates");
  revalidatePath("/super-admin/catalogs");
  revalidatePath("/super-admin/modules");
  revalidatePath("/super-admin/groups");
  revalidatePath("/super-admin/admin");
  revalidatePath("/super-admin/early-access");
}

export async function updatePlatformFinancialDefaultsAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/platform");
  const result = platformFinancialDefaultsInputSchema.safeParse({
    defaultTaxBehavior: getFieldValue(formData, "defaultTaxBehavior"),
    defaultTaxRate: getFieldValue(formData, "defaultTaxRate"),
    defaultRetainagePercentage: getFieldValue(formData, "defaultRetainagePercentage")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/platform", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update platform financial defaults."
      })
    );
  }

  try {
    await upsertPlatformFinancialDefaults({
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/platform", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update platform financial defaults."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/platform", {
      message: "Platform financial defaults were updated."
    })
  );
}

export async function updatePlatformWorkflowDefaultsAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/platform");
  const result = platformWorkflowDefaultsInputSchema.safeParse({
    approvedEstimateContractSeedId: getFieldValue(
      formData,
      "approvedEstimateContractSeedId"
    ),
    requireContractInternalApproval: getCheckboxValue(
      formData,
      "requireContractInternalApproval"
    ),
    requireContractSignatureBeforeJobScheduling: getCheckboxValue(
      formData,
      "requireContractSignatureBeforeJobScheduling"
    ),
    requireDepositBeforeJobScheduling: getCheckboxValue(
      formData,
      "requireDepositBeforeJobScheduling"
    ),
    requireFinancingApprovalBeforeJobScheduling: getCheckboxValue(
      formData,
      "requireFinancingApprovalBeforeJobScheduling"
    ),
    defaultDepositPercentage: getFieldValue(formData, "defaultDepositPercentage"),
    defaultEstimateTermsHtml: getFieldValue(formData, "defaultEstimateTermsHtml"),
    defaultEstimateInclusionsHtml: getFieldValue(
      formData,
      "defaultEstimateInclusionsHtml"
    ),
    defaultEstimateExclusionsHtml: getFieldValue(
      formData,
      "defaultEstimateExclusionsHtml"
    ),
    defaultEstimateScopeSummaryHtml: getFieldValue(
      formData,
      "defaultEstimateScopeSummaryHtml"
    ),
    defaultEstimateStartNumber: getFieldValue(formData, "defaultEstimateStartNumber"),
    defaultInvoiceStartNumber: getFieldValue(formData, "defaultInvoiceStartNumber"),
    defaultChangeOrderStartNumber: getFieldValue(
      formData,
      "defaultChangeOrderStartNumber"
    ),
    defaultContractStartNumber: getFieldValue(formData, "defaultContractStartNumber")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/platform", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update platform workflow defaults."
      })
    );
  }

  try {
    await upsertPlatformWorkflowDefaults({
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/platform", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update platform workflow defaults."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/platform", {
      message: "Platform workflow defaults were updated."
    })
  );
}

export async function updatePlatformTemplateSeedAction(formData: FormData) {
  await requirePlatformAdminUser("/super-admin/templates");
  const result = platformTemplateSeedInputSchema.safeParse({
    seedId: getFieldValue(formData, "seedId"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    subjectTemplate: getFieldValue(formData, "subjectTemplate"),
    bodyTemplate: getFieldValue(formData, "bodyTemplate"),
    isDefault: getCheckboxValue(formData, "isDefault"),
    isActive: getCheckboxValue(formData, "isActive")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update platform template seed."
      })
    );
  }

  try {
    await updatePlatformTemplateSeed(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update platform template seed."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/templates", {
      message: "Platform starter template was updated."
    })
  );
}

export async function upsertPlatformCatalogSeedAction(formData: FormData) {
  await requirePlatformAdminUser("/super-admin/catalogs");
  const result = platformCatalogSeedInputSchema.safeParse({
    seedId: getFieldValue(formData, "seedId"),
    itemType: getFieldValue(formData, "itemType"),
    seedKey: getFieldValue(formData, "seedKey"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    internalNotes: getFieldValue(formData, "internalNotes"),
    unit: getFieldValue(formData, "unit"),
    defaultUnitCost: getFieldValue(formData, "defaultUnitCost"),
    defaultUnitPrice: getFieldValue(formData, "defaultUnitPrice"),
    markupPercent: getFieldValue(formData, "markupPercent"),
    hiddenMarkupPercent: getFieldValue(formData, "hiddenMarkupPercent"),
    taxable: getCheckboxValue(formData, "taxable"),
    vendorId: getFieldValue(formData, "vendorId"),
    category: getFieldValue(formData, "category"),
    costCode: getFieldValue(formData, "costCode"),
    sku: getFieldValue(formData, "sku"),
    photoStoragePath: getFieldValue(formData, "photoStoragePath"),
    isDefault: getCheckboxValue(formData, "isDefault"),
    isActive: getCheckboxValue(formData, "isActive")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/catalogs", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update platform catalog seed."
      })
    );
  }

  try {
    await upsertPlatformCatalogItemSeed(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/catalogs", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update platform catalog seed."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/catalogs", {
      message: "Platform starter catalog item was saved."
    })
  );
}

export async function upsertContractorGroupAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/groups");
  const result = contractorGroupInputSchema.safeParse({
    contractorGroupId: getFieldValue(formData, "contractorGroupId"),
    key: getFieldValue(formData, "key"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    status: getFieldValue(formData, "status"),
    groupType: getFieldValue(formData, "groupType")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/groups", {
        error:
          result.error.issues[0]?.message ?? "Unable to save contractor group."
      })
    );
  }

  try {
    await upsertContractorGroup({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/groups", {
        error:
          error instanceof Error ? error.message : "Unable to save contractor group."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/groups", {
      message: "Contractor group was saved."
    })
  );
}

export async function archiveContractorGroupAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/groups");
  const result = contractorGroupArchiveInputSchema.safeParse({
    contractorGroupId: getFieldValue(formData, "contractorGroupId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/groups", {
        error:
          result.error.issues[0]?.message ?? "Unable to archive contractor group."
      })
    );
  }

  try {
    await archiveContractorGroup({
      contractorGroupId: result.data.contractorGroupId,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/groups", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to archive contractor group."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/groups", {
      message: "Contractor group was archived."
    })
  );
}

export async function assignContractorGroupMembershipAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/groups");
  const result = contractorGroupMembershipInputSchema.safeParse({
    contractorGroupId: getFieldValue(formData, "contractorGroupId"),
    organizationId: getFieldValue(formData, "organizationId"),
    assignmentSource: getFieldValue(formData, "assignmentSource") || "manual",
    notes: getFieldValue(formData, "notes")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/groups", {
        error:
          result.error.issues[0]?.message ??
          "Unable to assign organization to contractor group."
      })
    );
  }

  try {
    await assignOrganizationToContractorGroup({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/groups", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to assign organization to contractor group."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/groups", {
      message: "Organization assignment was saved."
    })
  );
}

export async function removeContractorGroupMembershipAction(formData: FormData) {
  await requirePlatformAdminUser("/super-admin/groups");
  const result = contractorGroupMembershipRemoveInputSchema.safeParse({
    membershipId: getFieldValue(formData, "membershipId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/groups", {
        error:
          result.error.issues[0]?.message ??
          "Unable to remove organization assignment."
      })
    );
  }

  try {
    await removeOrganizationFromContractorGroup(result.data.membershipId);
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/groups", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove organization assignment."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/groups", {
      message: "Organization assignment was removed."
    })
  );
}

export async function upsertPlatformStarterPackAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/templates");
  const result = platformStarterPackInputSchema.safeParse({
    packId: getFieldValue(formData, "packId"),
    packKey: getFieldValue(formData, "packKey"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    status: getFieldValue(formData, "status"),
    segmentKey: getFieldValue(formData, "segmentKey")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          result.error.issues[0]?.message ??
          "Unable to save platform starter pack."
      })
    );
  }

  try {
    await upsertPlatformStarterPack({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save platform starter pack."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/templates", {
      message: "Platform starter pack was saved."
    })
  );
}

export async function addTemplateSeedToStarterPackAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/templates");
  const result = platformStarterPackTemplateItemInputSchema.safeParse({
    starterPackId: getFieldValue(formData, "starterPackId"),
    templateSeedId: getFieldValue(formData, "templateSeedId"),
    isRequired: getCheckboxValue(formData, "isRequired")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          result.error.issues[0]?.message ??
          "Unable to add template seed to starter pack."
      })
    );
  }

  try {
    await addTemplateSeedToStarterPack({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add template seed to starter pack."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/templates", {
      message: "Template seed was added to the starter pack."
    })
  );
}

export async function addCatalogSeedToStarterPackAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/templates");
  const result = platformStarterPackCatalogItemInputSchema.safeParse({
    starterPackId: getFieldValue(formData, "starterPackId"),
    catalogSeedId: getFieldValue(formData, "catalogSeedId"),
    isRequired: getCheckboxValue(formData, "isRequired")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          result.error.issues[0]?.message ??
          "Unable to add catalog seed to starter pack."
      })
    );
  }

  try {
    await addCatalogSeedToStarterPack({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add catalog seed to starter pack."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/templates", {
      message: "Catalog seed was added to the starter pack."
    })
  );
}

export async function removeStarterPackItemAction(formData: FormData) {
  await requirePlatformAdminUser("/super-admin/templates");
  const result = platformStarterPackRemoveItemInputSchema.safeParse({
    itemId: getFieldValue(formData, "itemId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          result.error.issues[0]?.message ??
          "Unable to remove starter pack item."
      })
    );
  }

  try {
    await removeStarterPackItem(result.data.itemId);
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove starter pack item."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/templates", {
      message: "Starter pack item was removed."
    })
  );
}

export async function upsertStarterPackAssignmentAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/templates");
  const result = platformStarterPackAssignmentInputSchema.safeParse({
    assignmentId: getFieldValue(formData, "assignmentId"),
    starterPackId: getFieldValue(formData, "starterPackId"),
    assignmentType: getFieldValue(formData, "assignmentType"),
    organizationId: getFieldValue(formData, "organizationId"),
    assignmentKey: getFieldValue(formData, "assignmentKey"),
    label: getFieldValue(formData, "label"),
    status: getFieldValue(formData, "status"),
    notes: getFieldValue(formData, "notes")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          result.error.issues[0]?.message ??
          "Unable to save starter pack assignment intent."
      })
    );
  }

  try {
    await upsertStarterPackAssignment({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save starter pack assignment intent."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/templates", {
      message: "Starter pack assignment intent was saved."
    })
  );
}

export async function removeStarterPackAssignmentAction(formData: FormData) {
  await requirePlatformAdminUser("/super-admin/templates");
  const result = platformStarterPackAssignmentRemoveInputSchema.safeParse({
    assignmentId: getFieldValue(formData, "assignmentId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          result.error.issues[0]?.message ??
          "Unable to remove starter pack assignment intent."
      })
    );
  }

  try {
    await removeStarterPackAssignment(result.data.assignmentId);
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove starter pack assignment intent."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/templates", {
      message: "Starter pack assignment intent was removed."
    })
  );
}

export async function createStarterPackProvisioningDraftAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/templates");
  const result = platformStarterPackProvisioningDraftInputSchema.safeParse({
    organizationId: getFieldValue(formData, "organizationId"),
    starterPackId: getFieldValue(formData, "starterPackId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/templates", {
        error:
          result.error.issues[0]?.message ??
          "Unable to create starter-pack approval draft."
      })
    );
  }

  let draft: Awaited<ReturnType<typeof createStarterPackProvisioningDraft>>;

  try {
    draft = await createStarterPackProvisioningDraft({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      `${buildRedirect("/super-admin/templates", {
        dryRunOrganizationId: result.data.organizationId,
        dryRunStarterPackId: result.data.starterPackId,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create starter-pack approval draft."
      })}#starter-pack-provisioning-dry-run`
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    `${buildRedirect("/super-admin/templates", {
      dryRunOrganizationId: result.data.organizationId,
      dryRunStarterPackId: result.data.starterPackId,
      draftRunId: draft.run.id,
      message: draft.reusedExistingDraft
        ? `Existing approval draft ${draft.run.id} is ready for review.`
        : `Approval draft ${draft.run.id} was created with ${draft.run.itemCount} audit items.`
    })}#starter-pack-provisioning-dry-run`
  );
}

export async function approveStarterPackProvisioningDraftAction(
  formData: FormData
) {
  const scope = await requirePlatformAdminUser("/super-admin/templates");
  const result = platformStarterPackProvisioningApprovalInputSchema.safeParse({
    runId: getFieldValue(formData, "runId"),
    confirmationText: getFieldValue(formData, "confirmationText")
  });
  const fallbackRunId = getFieldValue(formData, "runId");

  if (!result.success) {
    redirect(
      `${buildRedirect("/super-admin/templates", {
        reviewRunId: fallbackRunId,
        error:
          result.error.issues[0]?.message ??
          "Unable to approve provisioning audit draft."
      })}#starter-pack-provisioning-dry-run`
    );
  }

  try {
    await approveStarterPackProvisioningDraftRun({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      `${buildRedirect("/super-admin/templates", {
        reviewRunId: result.data.runId,
        error:
          error instanceof Error
            ? error.message
            : "Unable to approve provisioning audit draft."
      })}#starter-pack-provisioning-dry-run`
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    `${buildRedirect("/super-admin/templates", {
      reviewRunId: result.data.runId,
      message: `Provisioning audit draft ${result.data.runId} was approved for future execution only. No contractor-owned records were created.`
    })}#starter-pack-provisioning-dry-run`
  );
}

export async function executeStarterPackProvisioningRunAction(
  formData: FormData
) {
  const scope = await requirePlatformAdminUser("/super-admin/templates");
  const fallbackRunId = getFieldValue(formData, "runId");
  const fallbackConfirmationText = getFieldValue(formData, "confirmationText");
  const result = platformStarterPackProvisioningExecutionInputSchema.safeParse({
    runId: fallbackRunId,
    confirmationText: fallbackConfirmationText
  });

  if (!result.success) {
    const validFallbackRunId = validUuidOrNull(fallbackRunId);
    const fallbackRun = validFallbackRunId
      ? await getStarterPackProvisioningRunDetail(validFallbackRunId)
      : null;

    await recordStarterPackProvisioningExecutionAttempt({
      descriptor: describeProvisioningExecutionAttemptForSchemaFailure({
        runId: fallbackRunId,
        confirmationText: fallbackConfirmationText
      }),
      userId: scope.userId,
      runId: validFallbackRunId,
      starterPackId: fallbackRun?.starterPackId ?? null,
      organizationId: fallbackRun?.organizationId ?? null,
      runStatus: fallbackRun?.status ?? null,
      metadata: {
        stage: "schema_validation",
        hasRunContext: Boolean(fallbackRun)
      }
    });

    redirect(
      `${buildRedirect("/super-admin/templates", {
        reviewRunId: fallbackRunId,
        error:
          result.error.issues[0]?.message ??
          "Unable to execute approved provisioning run."
      })}#starter-pack-provisioning-dry-run`
    );
  }

  let execution: Awaited<ReturnType<typeof executeApprovedStarterPackProvisioningRun>>;

  try {
    execution = await executeApprovedStarterPackProvisioningRun({
      ...result.data,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      `${buildRedirect("/super-admin/templates", {
        reviewRunId: result.data.runId,
        error:
          error instanceof Error
            ? error.message
            : "Unable to execute approved provisioning run."
      })}#starter-pack-provisioning-dry-run`
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    `${buildRedirect("/super-admin/templates", {
      reviewRunId: result.data.runId,
      message: `${execution.result.message} Created ${execution.result.createdTemplateCount} template copy/copies and ${execution.result.createdCatalogItemCount} catalog item copy/copies; skipped ${execution.result.skippedCount}.`
    })}#starter-pack-provisioning-dry-run`
  );
}

export async function updatePlatformFeaturePolicyAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/modules");
  const result = platformFeaturePolicyInputSchema.safeParse({
    key: getFieldValue(formData, "key"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    moduleKey: getFieldValue(formData, "moduleKey"),
    surface: getFieldValue(formData, "surface"),
    enabled: getCheckboxValue(formData, "enabled")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/modules", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update platform feature policy."
      })
    );
  }

  try {
    await upsertPlatformFeaturePolicy({
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/modules", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update platform feature policy."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/modules", {
      message: "Platform feature policy was updated."
    })
  );
}

export async function assignPlatformAdminAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/admin");
  const result = platformAdminAssignmentInputSchema.safeParse({
    email: getFieldValue(formData, "email")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/admin", {
        error:
          result.error.issues[0]?.message ??
          "Unable to assign platform admin access."
      })
    );
  }

  try {
    await assignPlatformAdminByEmail({
      email: result.data.email,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/admin", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to assign platform admin access."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/admin", {
      message: "Platform admin access was assigned."
    })
  );
}

export async function updateTenantPlatformStatusAction(formData: FormData) {
  await requirePlatformAdminUser("/super-admin/admin");
  const result = platformTenantStatusInputSchema.safeParse({
    companyId: getFieldValue(formData, "companyId"),
    tenantStatus: getFieldValue(formData, "tenantStatus"),
    lifecycleState: getFieldValue(formData, "lifecycleState")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/admin", {
        error:
          result.error.issues[0]?.message ?? "Unable to update tenant status."
      })
    );
  }

  try {
    await updateCompanyTenantStatus(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/admin", {
        error:
          error instanceof Error ? error.message : "Unable to update tenant status."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/admin", {
      message: "Tenant lifecycle was updated."
    })
  );
}

export async function markEarlyAccessTenantActiveAction(formData: FormData) {
  await requirePlatformAdminUser("/super-admin/early-access");
  const result = platformTenantActivationInputSchema.safeParse({
    companyId: getFieldValue(formData, "companyId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/early-access", {
        error:
          result.error.issues[0]?.message ?? "Unable to activate this company."
      })
    );
  }

  try {
    await updateCompanyTenantStatus({
      companyId: result.data.companyId,
      tenantStatus: "active",
      lifecycleState: "active"
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/early-access", {
        error:
          error instanceof Error ? error.message : "Unable to activate this company."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/early-access", {
      message:
        "Company activated. Guarded production actions are unlocked; billing or subscription setup still requires separate operator action unless already implemented."
    })
  );
}

export async function resetEarlyAccessTenantOnboardingStateAction(formData: FormData) {
  await requirePlatformAdminUser("/super-admin/early-access");

  if (process.env.NODE_ENV === "production") {
    redirect(
      buildRedirect("/super-admin/early-access", {
        error: "Onboarding reset is available only in development."
      })
    );
  }

  const result = platformTenantResetInputSchema.safeParse({
    companyId: getFieldValue(formData, "companyId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/early-access", {
        error:
          result.error.issues[0]?.message ?? "Unable to reset onboarding state."
      })
    );
  }

  let reset: Awaited<ReturnType<typeof resetEarlyAccessTenantOnboardingState>>;

  try {
    reset = await resetEarlyAccessTenantOnboardingState({
      companyId: result.data.companyId
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/early-access", {
        error:
          error instanceof Error
            ? error.message
            : "Reset did not finish. Check the selected company and try again."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/early-access", {
      message: `DEV / TEST ONLY reset complete: cleared ${reset.projectCount} projects, ${reset.estimateCount} estimates, ${reset.contractCount} contracts, and ${reset.invoiceCount} invoices.`
    })
  );
}

export async function updateTenantWorkflowNumberingAction(formData: FormData) {
  const scope = await requirePlatformAdminUser("/super-admin/admin");
  const result = platformTenantWorkflowNumberingInputSchema.safeParse({
    companyId: getFieldValue(formData, "companyId"),
    nextEstimateNumber: getFieldValue(formData, "nextEstimateNumber"),
    nextInvoiceNumber: getFieldValue(formData, "nextInvoiceNumber"),
    nextChangeOrderNumber: getFieldValue(formData, "nextChangeOrderNumber"),
    nextContractNumber: getFieldValue(formData, "nextContractNumber")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/super-admin/admin", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update tenant workflow numbering."
      })
    );
  }

  try {
    await upsertTenantWorkflowNumberingByPlatformAdmin({
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/super-admin/admin", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update tenant workflow numbering."
      })
    );
  }

  revalidatePlatformAdminSlice();

  redirect(
    buildRedirect("/super-admin/admin", {
      message: "Tenant numbering defaults were updated."
    })
  );
}
