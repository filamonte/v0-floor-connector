import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { ComplianceRecord } from "@floorconnector/types";

import type { ComplianceRecordInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ComplianceRecordRow = {
  id: string;
  company_id: string;
  subject_type: ComplianceRecord["subjectType"];
  subject_id: string;
  record_type: ComplianceRecord["recordType"];
  name: string;
  issuing_authority: string | null;
  reference_number: string | null;
  issued_on: string | null;
  expires_on: string | null;
  status: ComplianceRecord["status"];
  document_file_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ComplianceScope = {
  userId: string;
  organizationId: string;
};

const complianceRecordSelect = `
  id,
  company_id,
  subject_type,
  subject_id,
  record_type,
  name,
  issuing_authority,
  reference_number,
  issued_on,
  expires_on,
  status,
  document_file_id,
  notes,
  created_at,
  updated_at
`;

function isComplianceRecordRow(value: unknown): value is ComplianceRecordRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ComplianceRecordRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.subject_type === "string" &&
    typeof row.subject_id === "string" &&
    typeof row.record_type === "string" &&
    typeof row.name === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isComplianceRecordRowArray(
  value: unknown
): value is ComplianceRecordRow[] {
  return Array.isArray(value) && value.every((row) => isComplianceRecordRow(row));
}

function mapComplianceRecord(row: ComplianceRecordRow): ComplianceRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    recordType: row.record_type,
    name: row.name,
    issuingAuthority: row.issuing_authority,
    referenceNumber: row.reference_number,
    issuedOn: row.issued_on,
    expiresOn: row.expires_on,
    status: row.status,
    documentFileId: row.document_file_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getComplianceScope(
  next = "/settings/workforce"
): Promise<ComplianceScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

export async function requireComplianceScope(next = "/settings/workforce") {
  const scope = await getComplianceScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for compliance records yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function ensureScopedComplianceSubject(
  organizationId: string,
  subjectType: ComplianceRecord["subjectType"],
  subjectId: string
) {
  const supabase = await getSupabaseServerClient();

  if (subjectType === "person") {
    const response = await supabase
      .from("people")
      .select("id")
      .eq("company_id", organizationId)
      .eq("id", subjectId)
      .maybeSingle();
    const data = response.data as { id?: string } | null;

    if (response.error) {
      throw new Error(
        `Unable to validate the linked workforce person: ${response.error.message}`
      );
    }

    if (!data?.id) {
      throw new Error("Workforce person not found for this organization.");
    }

    return data;
  }

  const response = await supabase
    .from("vendors")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", subjectId)
    .maybeSingle();
  const data = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(`Unable to validate the linked vendor: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Vendor not found for this organization.");
  }

  return data;
}

export const listComplianceRecords = cache(async () => {
  const scope = await requireComplianceScope("/settings/workforce");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("compliance_records")
    .select(complianceRecordSelect)
    .eq("company_id", scope.organizationId)
    .order("expires_on", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load compliance records: ${response.error.message}`
    );
  }

  if (!isComplianceRecordRowArray(data)) {
    return [];
  }

  return data.map(mapComplianceRecord);
});

export async function listComplianceRecordsBySubject(
  subjectType: ComplianceRecord["subjectType"],
  subjectId: string,
  next = "/settings/workforce"
) {
  const scope = await requireComplianceScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("compliance_records")
    .select(complianceRecordSelect)
    .eq("company_id", scope.organizationId)
    .eq("subject_type", subjectType)
    .eq("subject_id", subjectId)
    .order("expires_on", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load subject compliance records: ${response.error.message}`
    );
  }

  if (!isComplianceRecordRowArray(data)) {
    return [];
  }

  return data.map(mapComplianceRecord);
}

export async function getComplianceRecordById(
  complianceRecordId: string,
  next = "/settings/workforce"
) {
  const scope = await requireComplianceScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("compliance_records")
    .select(complianceRecordSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", complianceRecordId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load the compliance record: ${response.error.message}`
    );
  }

  if (!isComplianceRecordRow(data)) {
    return null;
  }

  return mapComplianceRecord(data);
}

export async function createComplianceRecord(input: ComplianceRecordInput) {
  const scope = await requireComplianceScope("/settings/workforce");

  await ensureScopedComplianceSubject(
    scope.organizationId,
    input.subjectType,
    input.subjectId
  );

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("compliance_records")
    .insert({
      company_id: scope.organizationId,
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      record_type: input.recordType,
      name: input.name,
      issuing_authority: input.issuingAuthority,
      reference_number: input.referenceNumber,
      issued_on: input.issuedOn,
      expires_on: input.expiresOn,
      status: input.status,
      document_file_id: input.documentFileId,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(complianceRecordSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to create the compliance record: ${response.error.message}`
    );
  }

  if (!isComplianceRecordRow(data)) {
    throw new Error("Unexpected compliance record response after create.");
  }

  return mapComplianceRecord(data);
}

export async function updateComplianceRecord(
  complianceRecordId: string,
  input: ComplianceRecordInput
) {
  const scope = await requireComplianceScope(
    `/settings/workforce/compliance/${complianceRecordId}`
  );

  await ensureScopedComplianceSubject(
    scope.organizationId,
    input.subjectType,
    input.subjectId
  );

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("compliance_records")
    .update({
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      record_type: input.recordType,
      name: input.name,
      issuing_authority: input.issuingAuthority,
      reference_number: input.referenceNumber,
      issued_on: input.issuedOn,
      expires_on: input.expiresOn,
      status: input.status,
      document_file_id: input.documentFileId,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", complianceRecordId)
    .select(complianceRecordSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update the compliance record: ${response.error.message}`
    );
  }

  if (!isComplianceRecordRow(data)) {
    throw new Error("Compliance record not found for this organization.");
  }

  return mapComplianceRecord(data);
}
