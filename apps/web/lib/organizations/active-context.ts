import "server-only";

import { cache } from "react";
import type { MembershipRole, MembershipStatus } from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type MembershipRow = {
  id: string;
  company_id: string;
  membership_role: MembershipRole;
  membership_status: MembershipStatus;
  created_at: string;
  last_active_at: string | null;
  companies:
    | {
        id: string;
        slug: string;
        legal_name: string;
        display_name: string;
        tenant_status: string;
        lifecycle_state: string;
        created_at: string;
        updated_at: string;
      }
    | null;
};

type CompanyRow = NonNullable<MembershipRow["companies"]>;

export type ActiveOrganizationContext = {
  membership: {
    id: string;
    organizationId: string;
    role: MembershipRole;
    status: MembershipStatus;
    createdAt: string;
    lastActiveAt: string | null;
  };
  organization: {
    id: string;
    slug: string;
    legalName: string;
    displayName: string;
    tenantStatus: string;
    lifecycleState: string;
    createdAt: string;
    updatedAt: string;
  };
};

function isMembershipRow(value: unknown): value is MembershipRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<MembershipRow>;

  if (
    typeof row.id !== "string" ||
    typeof row.company_id !== "string" ||
    typeof row.membership_role !== "string" ||
    typeof row.membership_status !== "string" ||
    typeof row.created_at !== "string"
  ) {
    return false;
  }

  if (row.last_active_at !== null && typeof row.last_active_at !== "string") {
    return false;
  }

  if (!row.companies || typeof row.companies !== "object") {
    return false;
  }

  const company = row.companies as Partial<CompanyRow>;

  return (
    typeof company.id === "string" &&
    typeof company.slug === "string" &&
    typeof company.legal_name === "string" &&
    typeof company.display_name === "string" &&
    typeof company.tenant_status === "string" &&
    typeof company.lifecycle_state === "string" &&
    typeof company.created_at === "string" &&
    typeof company.updated_at === "string"
  );
}

export const getActiveOrganizationContext = cache(
  async (userId: string): Promise<ActiveOrganizationContext | null> => {
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("company_memberships")
      .select(
        `
          id,
          company_id,
          membership_role,
          membership_status,
          created_at,
          last_active_at,
          companies (
            id,
            slug,
            legal_name,
            display_name,
            tenant_status,
            lifecycle_state,
            created_at,
            updated_at
          )
        `
      )
      .eq("user_id", userId)
      .eq("membership_status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const data: unknown = response.data;
    const error = response.error;

    if (error) {
      throw new Error(
        `Unable to load the active organization context: ${error.message}`
      );
    }

    if (!isMembershipRow(data)) {
      return null;
    }

    if (data.companies === null) {
      return null;
    }

    const company: CompanyRow = data.companies;

    return {
      membership: {
        id: data.id,
        organizationId: data.company_id,
        role: data.membership_role,
        status: data.membership_status,
        createdAt: data.created_at,
        lastActiveAt: data.last_active_at
      },
      organization: {
        id: company.id,
        slug: company.slug,
        legalName: company.legal_name,
        displayName: company.display_name,
        tenantStatus: company.tenant_status,
        lifecycleState: company.lifecycle_state,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      }
    };
  }
);
