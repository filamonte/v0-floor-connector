"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  adoptPlatformCatalogItemSeedForOrganization,
  upsertOrganizationCatalogItem
} from "@/lib/catalogs/data";
import {
  upsertOrganizationFeatureOverride
} from "@/lib/organizations/module-settings";
import {
  listOrganizationMembers,
  requireOrganizationAdminScope,
  updateOrganizationMembershipRole,
  updateOrganizationProfile
} from "@/lib/organizations/admin";
import {
  upsertOrganizationFinancialSettings
} from "@/lib/organizations/financial-settings";
import {
  upsertOrganizationWorkflowSettings
} from "@/lib/organizations/workflow-settings";
import {
  adoptPlatformTemplateSeedForOrganization,
  getDocumentTemplateById,
  updateDocumentTemplateForOrganization
} from "@/lib/templates/data";

import {
  catalogItemSettingsInputSchema,
  documentTemplateSettingsInputSchema,
  organizationFeatureOverrideInputSchema,
  organizationFinancialSettingsInputSchema,
  organizationMembershipRoleInputSchema,
  organizationProfileInputSchema,
  organizationWorkflowSettingsInputSchema
} from "./schemas";

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

async function requireSettingsScope() {
  return requireOrganizationAdminScope("/settings");
}

function revalidateSettingsSlice() {
  revalidatePath("/settings");
  revalidatePath("/settings/organization");
  revalidatePath("/settings/templates");
  revalidatePath("/settings/catalogs");
  revalidatePath("/settings/financial");
  revalidatePath("/settings/workflows");
  revalidatePath("/settings/admin");
  revalidatePath("/settings/modules");
  revalidatePath("/contracts");
  revalidatePath("/estimates");
  revalidatePath("/invoices");
  revalidatePath("/customers");
  revalidatePath("/leads");
}

export async function updateDocumentTemplateSettingsAction(formData: FormData) {
  const result = documentTemplateSettingsInputSchema.safeParse({
    templateId: getFieldValue(formData, "templateId"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    subjectTemplate: getFieldValue(formData, "subjectTemplate"),
    bodyTemplate: getFieldValue(formData, "bodyTemplate"),
    status: getFieldValue(formData, "status"),
    isDefault: getCheckboxValue(formData, "isDefault")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/templates", {
        error: result.error.issues[0]?.message ?? "Unable to update document template."
      })
    );
  }

  let template;

  try {
    template = await updateDocumentTemplateForOrganization({
      ...result.data,
      next: "/settings/templates"
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/templates", {
        error:
          error instanceof Error ? error.message : "Unable to update document template."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/templates", {
      message: `${template.name} was updated successfully.`
    })
  );
}

export async function adoptPlatformTemplateSeedAction(formData: FormData) {
  const seedId = getFieldValue(formData, "seedId");

  if (!seedId) {
    redirect(
      buildRedirect("/settings/templates", {
        error: "Platform template seed id is required."
      })
    );
  }

  let template;

  try {
    template = await adoptPlatformTemplateSeedForOrganization(
      seedId,
      "/settings/templates"
    );
  } catch (error) {
    redirect(
      buildRedirect("/settings/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to adopt platform template seed."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/templates", {
      message: `${template.name} was adopted for this organization.`
    })
  );
}

export async function updateOrganizationProfileAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const result = organizationProfileInputSchema.safeParse({
    legalName: getFieldValue(formData, "legalName"),
    displayName: getFieldValue(formData, "displayName"),
    logoUrl: getFieldValue(formData, "logoUrl"),
    slug: getFieldValue(formData, "slug")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/organization", {
        error:
          result.error.issues[0]?.message ?? "Unable to update organization profile."
      })
    );
  }

  try {
    await updateOrganizationProfile({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/organization", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update organization profile."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/organization", {
      message: "Organization profile was updated."
    })
  );
}

export async function updateOrganizationFinancialSettingsAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const result = organizationFinancialSettingsInputSchema.safeParse({
    defaultTaxBehavior: getFieldValue(formData, "defaultTaxBehavior"),
    defaultTaxRate: getFieldValue(formData, "defaultTaxRate"),
    defaultRetainagePercentage: getFieldValue(formData, "defaultRetainagePercentage")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/financial", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update organization financial settings."
      })
    );
  }

  try {
    await upsertOrganizationFinancialSettings({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/financial", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update organization financial settings."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/financial", {
      message: `Financial defaults for this organization were updated.`
    })
  );
}

export async function updateOrganizationWorkflowSettingsAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const result = organizationWorkflowSettingsInputSchema.safeParse({
    approvedEstimateContractTemplateId: getFieldValue(
      formData,
      "approvedEstimateContractTemplateId"
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
    nextEstimateNumber: getFieldValue(formData, "nextEstimateNumber"),
    nextInvoiceNumber: getFieldValue(formData, "nextInvoiceNumber")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/workflows", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update organization workflow settings."
      })
    );
  }

  if (result.data.approvedEstimateContractTemplateId) {
    const template = await getDocumentTemplateById(
      result.data.approvedEstimateContractTemplateId,
      "/settings/workflows"
    );

    if (!template || template.templateType !== "contract" || template.status !== "active") {
      redirect(
        buildRedirect("/settings/workflows", {
          error: "Approved-estimate contract workflow must use an active contract template."
        })
      );
    }
  }

  try {
    await upsertOrganizationWorkflowSettings({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/workflows", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update organization workflow settings."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/workflows", {
      message: "Contract workflow defaults were updated."
    })
  );
}

export async function updateOrganizationCatalogItemAction(formData: FormData) {
  await requireSettingsScope();
  const result = catalogItemSettingsInputSchema.safeParse({
    itemId: getFieldValue(formData, "itemId"),
    itemType: getFieldValue(formData, "itemType"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    unit: getFieldValue(formData, "unit"),
    defaultUnitPrice: getFieldValue(formData, "defaultUnitPrice"),
    status: getFieldValue(formData, "status"),
    isDefault: getCheckboxValue(formData, "isDefault")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/catalogs", {
        error:
          result.error.issues[0]?.message ?? "Unable to update reusable catalog item."
      })
    );
  }

  let item;

  try {
    item = await upsertOrganizationCatalogItem(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/settings/catalogs", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update reusable catalog item."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/catalogs", {
      message: `${item.name} was saved successfully.`
    })
  );
}

export async function adoptPlatformCatalogItemSeedAction(formData: FormData) {
  await requireSettingsScope();
  const seedId = getFieldValue(formData, "seedId");

  if (!seedId) {
    redirect(
      buildRedirect("/settings/catalogs", {
        error: "Platform catalog seed id is required."
      })
    );
  }

  let item;

  try {
    item = await adoptPlatformCatalogItemSeedForOrganization(seedId);
  } catch (error) {
    redirect(
      buildRedirect("/settings/catalogs", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to adopt platform catalog seed."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/catalogs", {
      message: `${item.name} was adopted for this organization.`
    })
  );
}

export async function updateOrganizationFeatureOverrideAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const result = organizationFeatureOverrideInputSchema.safeParse({
    key: getFieldValue(formData, "key"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    moduleKey: getFieldValue(formData, "moduleKey"),
    surface: getFieldValue(formData, "surface"),
    enabled: getCheckboxValue(formData, "enabled")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/modules", {
        error:
          result.error.issues[0]?.message ?? "Unable to update module override."
      })
    );
  }

  try {
    await upsertOrganizationFeatureOverride({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/modules", {
        error:
          error instanceof Error ? error.message : "Unable to update module override."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/modules", {
      message: "Organization module override was updated."
    })
  );
}

export async function updateOrganizationMembershipRoleAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const result = organizationMembershipRoleInputSchema.safeParse({
    membershipId: getFieldValue(formData, "membershipId"),
    nextRole: getFieldValue(formData, "nextRole")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/admin", {
        error:
          result.error.issues[0]?.message ?? "Unable to update member role."
      })
    );
  }

  const members = await listOrganizationMembers(scope.organizationId);
  const membership = members.find((member) => member.id === result.data.membershipId);

  if (!membership) {
    redirect(
      buildRedirect("/settings/admin", {
        error: "Organization member was not found."
      })
    );
  }

  if (membership.user_id === scope.userId && result.data.nextRole !== membership.membership_role) {
    redirect(
      buildRedirect("/settings/admin", {
        error: "Change your own organization role from another admin account."
      })
    );
  }

  if (
    membership.membership_role === "owner" &&
    result.data.nextRole !== "owner"
  ) {
    const ownerCount = members.filter(
      (member) => member.membership_role === "owner"
    ).length;

    if (ownerCount <= 1) {
      redirect(
        buildRedirect("/settings/admin", {
          error: "This organization must keep at least one owner."
        })
      );
    }
  }

  try {
    await updateOrganizationMembershipRole({
      organizationId: scope.organizationId,
      membershipId: result.data.membershipId,
      nextRole: result.data.nextRole,
      actingUserId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/admin", {
        error: error instanceof Error ? error.message : "Unable to update member role."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/admin", {
      message: "Organization member role was updated."
    })
  );
}
