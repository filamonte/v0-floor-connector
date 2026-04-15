import "server-only";

import { cache } from "react";
import type {
  DocumentTemplate,
  PlatformTemplateSeed,
  TemplateType
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type TemplateScope = {
  userId: string;
  organizationId: string;
};

type DocumentTemplateRow = {
  id: string;
  company_id: string;
  template_type: TemplateType;
  source_seed_id: string | null;
  source_seed_key: string | null;
  name: string;
  description: string | null;
  subject_template: string | null;
  body_template: string;
  schema_version: number;
  status: "active" | "archived";
  is_default: boolean;
  merge_field_manifest: unknown;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type PlatformTemplateSeedRow = {
  id: string;
  template_type: TemplateType;
  seed_key: string;
  name: string;
  description: string | null;
  subject_template: string | null;
  body_template: string;
  schema_version: number;
  is_default: boolean;
  is_active: boolean;
  merge_field_manifest: unknown;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

const documentTemplateSelect = `
  id,
  company_id,
  template_type,
  source_seed_id,
  source_seed_key,
  name,
  description,
  subject_template,
  body_template,
  schema_version,
  status,
  is_default,
  merge_field_manifest,
  metadata,
  created_at,
  updated_at
`;

const platformTemplateSeedSelect = `
  id,
  template_type,
  seed_key,
  name,
  description,
  subject_template,
  body_template,
  schema_version,
  is_default,
  is_active,
  merge_field_manifest,
  metadata,
  created_at,
  updated_at
`;

function normalizeMergeFieldManifest(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function isDocumentTemplateRow(value: unknown): value is DocumentTemplateRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<DocumentTemplateRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.template_type === "string" &&
    (row.source_seed_id === null || typeof row.source_seed_id === "string") &&
    (row.source_seed_key === null || typeof row.source_seed_key === "string") &&
    typeof row.name === "string" &&
    (row.description === null || typeof row.description === "string") &&
    (row.subject_template === null || typeof row.subject_template === "string") &&
    typeof row.body_template === "string" &&
    typeof row.schema_version === "number" &&
    typeof row.status === "string" &&
    typeof row.is_default === "boolean" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isDocumentTemplateRowArray(value: unknown): value is DocumentTemplateRow[] {
  return Array.isArray(value) && value.every((row) => isDocumentTemplateRow(row));
}

function isPlatformTemplateSeedRow(value: unknown): value is PlatformTemplateSeedRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PlatformTemplateSeedRow>;

  return (
    typeof row.id === "string" &&
    typeof row.template_type === "string" &&
    typeof row.seed_key === "string" &&
    typeof row.name === "string" &&
    (row.description === null || typeof row.description === "string") &&
    (row.subject_template === null || typeof row.subject_template === "string") &&
    typeof row.body_template === "string" &&
    typeof row.schema_version === "number" &&
    typeof row.is_default === "boolean" &&
    typeof row.is_active === "boolean" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPlatformTemplateSeedRowArray(
  value: unknown
): value is PlatformTemplateSeedRow[] {
  return Array.isArray(value) && value.every((row) => isPlatformTemplateSeedRow(row));
}

function mapDocumentTemplate(row: DocumentTemplateRow): DocumentTemplate {
  return {
    id: row.id,
    organizationId: row.company_id,
    templateType: row.template_type,
    sourceSeedId: row.source_seed_id,
    sourceSeedKey: row.source_seed_key,
    name: row.name,
    description: row.description,
    subjectTemplate: row.subject_template,
    bodyTemplate: row.body_template,
    schemaVersion: row.schema_version,
    status: row.status,
    isDefault: row.is_default,
    mergeFieldManifest: normalizeMergeFieldManifest(row.merge_field_manifest),
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPlatformTemplateSeed(row: PlatformTemplateSeedRow): PlatformTemplateSeed {
  return {
    id: row.id,
    templateType: row.template_type,
    seedKey: row.seed_key,
    name: row.name,
    description: row.description,
    subjectTemplate: row.subject_template,
    bodyTemplate: row.body_template,
    schemaVersion: row.schema_version,
    isDefault: row.is_default,
    isActive: row.is_active,
    mergeFieldManifest: normalizeMergeFieldManifest(row.merge_field_manifest),
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getTemplateScope(next = "/dashboard"): Promise<TemplateScope | null> {
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

export async function requireTemplateScope(next = "/dashboard") {
  const scope = await getTemplateScope(next);

  if (!scope) {
    throw new Error("No active organization is available for document templates yet.");
  }

  return scope;
}

export const listDocumentTemplates = cache(
  async (templateType?: TemplateType): Promise<DocumentTemplate[]> => {
    const scope = await requireTemplateScope("/dashboard");
    const supabase = await getSupabaseServerClient();
    let query = supabase
      .from("document_templates")
      .select(documentTemplateSelect)
      .eq("company_id", scope.organizationId)
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });

    if (templateType) {
      query = query.eq("template_type", templateType);
    }

    const response = await query;
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(`Unable to load document templates: ${response.error.message}`);
    }

    if (!isDocumentTemplateRowArray(data)) {
      return [];
    }

    return data.map((row) => mapDocumentTemplate(row));
  }
);

export const listPlatformTemplateSeeds = cache(
  async (templateType?: TemplateType): Promise<PlatformTemplateSeed[]> => {
    const supabase = await getSupabaseServerClient();
    let query = supabase
      .from("platform_template_seeds")
      .select(platformTemplateSeedSelect)
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });

    if (templateType) {
      query = query.eq("template_type", templateType);
    }

    const response = await query;
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load platform template seeds: ${response.error.message}`
      );
    }

    if (!isPlatformTemplateSeedRowArray(data)) {
      return [];
    }

    return data.map((row) => mapPlatformTemplateSeed(row));
  }
);

export async function getDocumentTemplateById(
  templateId: string,
  next = "/dashboard"
): Promise<DocumentTemplate | null> {
  const scope = await requireTemplateScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("document_templates")
    .select(documentTemplateSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", templateId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the document template: ${response.error.message}`);
  }

  return isDocumentTemplateRow(data) ? mapDocumentTemplate(data) : null;
}

export async function ensureDefaultDocumentTemplateForType(
  templateType: TemplateType,
  next = "/dashboard"
): Promise<DocumentTemplate | null> {
  const scope = await requireTemplateScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("ensure_default_document_template", {
    target_company_id: scope.organizationId,
    target_template_type: templateType,
    acting_user_id: scope.userId
  });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to ensure a default ${templateType} template: ${response.error.message}`
    );
  }

  if (typeof data !== "string") {
    return null;
  }

  return getDocumentTemplateById(data, next);
}

export async function resolveDocumentTemplateReference(options: {
  templateType: TemplateType;
  templateId?: string | null;
  next?: string;
}) {
  const next = options.next ?? "/dashboard";

  if (options.templateId) {
    const selectedTemplate = await getDocumentTemplateById(options.templateId, next);

    if (!selectedTemplate) {
      throw new Error("Selected document template was not found for this organization.");
    }

    if (selectedTemplate.templateType !== options.templateType) {
      throw new Error(
        `Selected template must be an ${options.templateType} template.`
      );
    }

    return selectedTemplate;
  }

  const scopedTemplates = await listDocumentTemplates(options.templateType);
  const defaultTemplate = scopedTemplates.find(
    (template) => template.isDefault && template.status === "active"
  );

  if (defaultTemplate) {
    return defaultTemplate;
  }

  return ensureDefaultDocumentTemplateForType(options.templateType, next);
}
