import "server-only";

import {
  defaultAuthenticatedPath,
  getSafeInternalRedirectPath
} from "@/lib/auth/paths";
import {
  getPlatformRoleForUser,
  PLATFORM_ADMIN_ROLE_KEY
} from "@/lib/platform-admin/roles";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasCompanyProfileFields } from "@/lib/organizations/setup-status";

const setupCompanyPath = "/setup/company";
const superAdminPath = "/super-admin";

type PostLoginRedirectInput = {
  userId: string;
  requestedNext?: string | null;
};

type MembershipSetupRow = {
  companies:
    | Array<{
        logo_url: string | null;
        phone: string | null;
        website_url: string | null;
        primary_trade: string | null;
        brand_accent_color: string | null;
        time_zone: string | null;
      }>
    | {
        logo_url: string | null;
        phone: string | null;
        website_url: string | null;
        primary_trade: string | null;
        brand_accent_color: string | null;
        time_zone: string | null;
      }
    | null;
};

function isSuperAdminPath(pathname: string) {
  return (
    pathname === superAdminPath ||
    pathname.startsWith(`${superAdminPath}/`) ||
    pathname.startsWith(`${superAdminPath}?`)
  );
}

function resolveCompany(row: MembershipSetupRow | null) {
  const company = row?.companies;

  return Array.isArray(company) ? (company[0] ?? null) : company;
}

async function hasCompletedContractorSetup(userId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("company_memberships")
    .select(
      `
        companies (
          logo_url,
          phone,
          website_url,
          primary_trade,
          brand_accent_color,
          time_zone
        )
      `
    )
    .eq("user_id", userId)
    .eq("membership_status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to resolve contractor setup state: ${response.error.message}`
    );
  }

  const company = resolveCompany(response.data as MembershipSetupRow | null);

  if (!company) {
    return false;
  }

  return hasCompanyProfileFields({
    logoUrl: company.logo_url,
    phone: company.phone,
    websiteUrl: company.website_url,
    primaryTrade: company.primary_trade,
    brandAccentColor: company.brand_accent_color,
    timeZone: company.time_zone
  });
}

export async function resolvePostLoginRedirect({
  userId,
  requestedNext
}: PostLoginRedirectInput) {
  const safeNext = getSafeInternalRedirectPath(requestedNext);
  const platformRole = await getPlatformRoleForUser(userId);
  const isPlatformAdmin = platformRole === PLATFORM_ADMIN_ROLE_KEY;

  if (safeNext && (!isSuperAdminPath(safeNext) || isPlatformAdmin)) {
    return safeNext;
  }

  if (isPlatformAdmin) {
    return superAdminPath;
  }

  if (await hasCompletedContractorSetup(userId)) {
    return defaultAuthenticatedPath;
  }

  return setupCompanyPath;
}
