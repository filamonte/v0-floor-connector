import "server-only";

import { cache } from "react";
import type { EstimateContentBlock } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type EstimateContentBlockRow = {
  id: string;
  company_id: string;
  block_type: "scope" | "inclusion" | "exclusion" | "terms";
  title: string;
  content_html: string;
  status: "active" | "archived";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type EstimateContentBlockScope = {
  userId: string;
  organizationId: string;
};

function mapEstimateContentBlock(
  row: EstimateContentBlockRow
): EstimateContentBlock {
  return {
    id: row.id,
    organizationId: row.company_id,
    blockType: row.block_type,
    title: row.title,
    contentHtml: row.content_html,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getEstimateContentBlockScope(
  next = "/materials"
): Promise<EstimateContentBlockScope | null> {
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

export async function requireEstimateContentBlockScope(next = "/materials") {
  const scope = await getEstimateContentBlockScope(next);

  if (!scope) {
    throw new Error("No active organization is available for content blocks yet.");
  }

  return scope;
}

export const listEstimateContentBlocks = cache(
  async (): Promise<EstimateContentBlock[]> => {
    const scope = await requireEstimateContentBlockScope();
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("estimate_content_blocks")
      .select("*")
      .eq("company_id", scope.organizationId)
      .order("block_type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (response.error) {
      throw new Error(
        `Unable to load estimate content blocks: ${response.error.message}`
      );
    }

    const rows = Array.isArray(response.data)
      ? (response.data as EstimateContentBlockRow[])
      : [];

    return rows.map(mapEstimateContentBlock);
  }
);

export async function upsertEstimateContentBlock(input: {
  blockId?: string | null;
  blockType: "scope" | "inclusion" | "exclusion" | "terms";
  title: string;
  contentHtml: string;
  status: "active" | "archived";
  sortOrder?: number | null;
}) {
  const scope = await requireEstimateContentBlockScope();
  const supabase = await getSupabaseServerClient();
  const payload = {
    company_id: scope.organizationId,
    block_type: input.blockType,
    title: input.title,
    content_html: input.contentHtml,
    status: input.status,
    sort_order: input.sortOrder ?? 0,
    created_by: scope.userId,
    updated_by: scope.userId
  };

  const response = input.blockId
    ? await supabase
        .from("estimate_content_blocks")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.blockId)
        .select("*")
        .single()
    : await supabase
        .from("estimate_content_blocks")
        .insert(payload)
        .select("*")
        .single();

  if (response.error) {
    throw new Error(
      `Unable to save estimate content block: ${response.error.message}`
    );
  }

  return mapEstimateContentBlock(response.data as EstimateContentBlockRow);
}
