import "server-only";

import type { DocumentTemplate } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getDocumentTemplateById } from "@/lib/templates/data";
import {
  validatePreferredEstimateTemplateSelection
} from "./estimate-template-preference-core";

export {
  resolvePreferredEstimateTemplateForCreate,
  validatePreferredEstimateTemplateSelection
} from "./estimate-template-preference-core";

type PreferenceScope = {
  userId: string;
  organizationId: string;
};

type UserEstimateTemplatePreferenceRow = {
  organization_id: string;
  user_id: string;
  preferred_estimate_template_id: string;
  created_at: string;
  updated_at: string;
};

export type UserEstimateTemplatePreference = {
  organizationId: string;
  userId: string;
  preferredEstimateTemplateId: string;
  createdAt: string;
  updatedAt: string;
  template: DocumentTemplate | null;
};

function isPreferenceRow(
  value: unknown
): value is UserEstimateTemplatePreferenceRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<UserEstimateTemplatePreferenceRow>;

  return (
    typeof row.organization_id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.preferred_estimate_template_id === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

async function requirePreferenceScope(next = "/settings/profile"): Promise<PreferenceScope> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error("No active organization is available for user preferences.");
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

async function getScopedPreferenceRow(scope: PreferenceScope) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("user_estimate_template_preferences")
    .select(
      "organization_id, user_id, preferred_estimate_template_id, created_at, updated_at"
    )
    .eq("organization_id", scope.organizationId)
    .eq("user_id", scope.userId)
    .maybeSingle();

  if (response.error) {
    throw new Error("Unable to load your estimate template preference.");
  }

  return isPreferenceRow(response.data) ? response.data : null;
}

export async function getCurrentUserPreferredEstimateTemplate(next = "/settings/profile") {
  const scope = await requirePreferenceScope(next);
  const row = await getScopedPreferenceRow(scope);

  if (!row) {
    return null;
  }

  const template = await getDocumentTemplateById(
    row.preferred_estimate_template_id,
    next
  );

  return {
    organizationId: row.organization_id,
    userId: row.user_id,
    preferredEstimateTemplateId: row.preferred_estimate_template_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    template:
      template?.templateType === "estimate" && template.status === "active"
        ? template
        : null
  } satisfies UserEstimateTemplatePreference;
}

export async function setCurrentUserPreferredEstimateTemplate(
  preferredEstimateTemplateId: string,
  next = "/settings/profile"
) {
  const scope = await requirePreferenceScope(next);
  const template = await getDocumentTemplateById(preferredEstimateTemplateId, next);
  const validatedTemplate = validatePreferredEstimateTemplateSelection({
    organizationId: scope.organizationId,
    template
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("user_estimate_template_preferences")
    .upsert(
      {
        organization_id: scope.organizationId,
        user_id: scope.userId,
        preferred_estimate_template_id: validatedTemplate.id,
        created_by: scope.userId,
        updated_by: scope.userId
      },
      { onConflict: "organization_id,user_id" }
    )
    .select(
      "organization_id, user_id, preferred_estimate_template_id, created_at, updated_at"
    )
    .single();

  if (response.error || !isPreferenceRow(response.data)) {
    throw new Error("Unable to save your estimate template preference.");
  }

  return {
    organizationId: response.data.organization_id,
    userId: response.data.user_id,
    preferredEstimateTemplateId: response.data.preferred_estimate_template_id,
    createdAt: response.data.created_at,
    updatedAt: response.data.updated_at,
    template: validatedTemplate
  } satisfies UserEstimateTemplatePreference;
}

export async function clearCurrentUserPreferredEstimateTemplate(
  next = "/settings/profile"
) {
  const scope = await requirePreferenceScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("user_estimate_template_preferences")
    .delete()
    .eq("organization_id", scope.organizationId)
    .eq("user_id", scope.userId);

  if (response.error) {
    throw new Error("Unable to reset your estimate template preference.");
  }
}
