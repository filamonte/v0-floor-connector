"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePlatformAdminUser } from "@/lib/platform-admin/access";
import {
  assignPlatformAdminByEmail,
  updateCompanyTenantStatus,
  updatePlatformTemplateSeed,
  upsertPlatformCatalogItemSeed,
  upsertPlatformFeaturePolicy,
  upsertPlatformFinancialDefaults,
  upsertPlatformWorkflowDefaults
} from "@/lib/platform-admin/data";

import {
  platformAdminAssignmentInputSchema,
  platformCatalogSeedInputSchema,
  platformFeaturePolicyInputSchema,
  platformFinancialDefaultsInputSchema,
  platformTemplateSeedInputSchema,
  platformTenantStatusInputSchema,
  platformWorkflowDefaultsInputSchema
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

function revalidatePlatformAdminSlice() {
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/platform");
  revalidatePath("/super-admin/templates");
  revalidatePath("/super-admin/catalogs");
  revalidatePath("/super-admin/modules");
  revalidatePath("/super-admin/admin");
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
    requireDepositBeforeJobScheduling: getCheckboxValue(
      formData,
      "requireDepositBeforeJobScheduling"
    ),
    defaultDepositPercentage: getFieldValue(formData, "defaultDepositPercentage")
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
    unit: getFieldValue(formData, "unit"),
    defaultUnitPrice: getFieldValue(formData, "defaultUnitPrice"),
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
