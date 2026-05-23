import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { MembershipRole } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import type {
  CompanyDocument,
  CompanyDocumentAudience,
  CompanyDocumentCategory,
  CompanyDocumentStatus,
  CompanyDocumentUpsertInput
} from "./types";

type CompanyDocumentScope = {
  userId: string;
  organizationId: string;
  role: MembershipRole;
};

type CompanyDocumentRow = {
  id: string;
  company_id: string;
  title: string;
  category: CompanyDocumentCategory;
  document_kind: string;
  status: CompanyDocumentStatus;
  audience: CompanyDocumentAudience;
  description: string | null;
  body: string | null;
  effective_date: string | null;
  expires_at: string | null;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

const mutationRoles = new Set<MembershipRole>(["owner", "admin", "manager"]);

const companyDocumentSelect = `
  id,
  company_id,
  title,
  category,
  document_kind,
  status,
  audience,
  description,
  body,
  effective_date,
  expires_at,
  archived_at,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

function isCompanyDocumentRow(value: unknown): value is CompanyDocumentRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<CompanyDocumentRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.title === "string" &&
    typeof row.category === "string" &&
    typeof row.document_kind === "string" &&
    typeof row.status === "string" &&
    typeof row.audience === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isCompanyDocumentRowArray(
  value: unknown
): value is CompanyDocumentRow[] {
  return Array.isArray(value) && value.every(isCompanyDocumentRow);
}

function mapCompanyDocument(row: CompanyDocumentRow): CompanyDocument {
  return {
    id: row.id,
    organizationId: row.company_id,
    title: row.title,
    category: row.category,
    documentKind: row.document_kind,
    status: row.status,
    audience: row.audience,
    description: row.description,
    body: row.body,
    effectiveDate: row.effective_date,
    expiresAt: row.expires_at,
    archivedAt: row.archived_at,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getCompanyDocumentScope(next = "/settings/company-documents") {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    redirect("/dashboard?error=No+active+organization+is+available.");
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    role: organizationContext.membership.role
  } satisfies CompanyDocumentScope;
}

function assertCanManage(scope: CompanyDocumentScope) {
  if (!mutationRoles.has(scope.role)) {
    throw new Error("Company Documents management access is required.");
  }
}

export const listCompanyDocuments = cache(
  async (next = "/settings/company-documents") => {
    const scope = await getCompanyDocumentScope(next);
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("company_documents")
      .select(companyDocumentSelect)
      .eq("company_id", scope.organizationId)
      .order("status", { ascending: true })
      .order("updated_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load company documents: ${response.error.message}`
      );
    }

    return isCompanyDocumentRowArray(data) ? data.map(mapCompanyDocument) : [];
  }
);

export async function getCompanyDocumentAccess(
  next = "/settings/company-documents"
) {
  const scope = await getCompanyDocumentScope(next);

  return {
    role: scope.role,
    canManage: mutationRoles.has(scope.role)
  };
}

export async function getCompanyDocumentById(
  documentId: string,
  next = "/settings/company-documents"
) {
  const scope = await getCompanyDocumentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("company_documents")
    .select(companyDocumentSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", documentId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load company document: ${response.error.message}`
    );
  }

  return isCompanyDocumentRow(data) ? mapCompanyDocument(data) : null;
}

export async function upsertCompanyDocument(input: CompanyDocumentUpsertInput) {
  const scope = await getCompanyDocumentScope("/settings/company-documents");
  assertCanManage(scope);
  const supabase = await getSupabaseServerClient();
  const archivedAt =
    input.status === "archived" ? new Date().toISOString() : null;
  const payload = {
    title: input.title,
    category: input.category,
    document_kind: input.documentKind,
    status: input.status,
    audience: input.audience,
    description: input.description,
    body: input.body,
    effective_date: input.effectiveDate,
    expires_at: input.expiresAt,
    archived_at: archivedAt,
    updated_by: scope.userId
  };

  const response = input.documentId
    ? await supabase
        .from("company_documents")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.documentId)
        .select(companyDocumentSelect)
        .single()
    : await supabase
        .from("company_documents")
        .insert({
          company_id: scope.organizationId,
          ...payload,
          created_by: scope.userId
        })
        .select(companyDocumentSelect)
        .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to save company document: ${response.error.message}`
    );
  }

  if (!isCompanyDocumentRow(data)) {
    throw new Error("Unexpected company document response after save.");
  }

  return mapCompanyDocument(data);
}

export async function archiveCompanyDocument(documentId: string) {
  const scope = await getCompanyDocumentScope("/settings/company-documents");
  assertCanManage(scope);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("company_documents")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", documentId)
    .select(companyDocumentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to archive company document: ${response.error.message}`
    );
  }

  if (!isCompanyDocumentRow(data)) {
    throw new Error("Unexpected company document response after archive.");
  }

  return mapCompanyDocument(data);
}

export async function unarchiveCompanyDocument(documentId: string) {
  const scope = await getCompanyDocumentScope("/settings/company-documents");
  assertCanManage(scope);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("company_documents")
    .update({
      status: "draft",
      archived_at: null,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", documentId)
    .select(companyDocumentSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to restore company document: ${response.error.message}`
    );
  }

  if (!isCompanyDocumentRow(data)) {
    throw new Error("Unexpected company document response after restore.");
  }

  return mapCompanyDocument(data);
}
