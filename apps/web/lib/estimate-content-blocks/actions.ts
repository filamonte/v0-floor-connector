"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { upsertEstimateContentBlock } from "@/lib/estimate-content-blocks/data";
import { estimateContentBlockInputSchema } from "@/lib/estimate-content-blocks/schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
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

export async function upsertEstimateContentBlockAction(formData: FormData) {
  const returnTo =
    getFieldValue(formData, "returnTo") || "/cost-items-database/items";
  const result = estimateContentBlockInputSchema.safeParse({
    blockId: getFieldValue(formData, "blockId"),
    blockType: getFieldValue(formData, "blockType"),
    title: getFieldValue(formData, "title"),
    contentHtml: getFieldValue(formData, "contentHtml"),
    status: getFieldValue(formData, "status"),
    sortOrder: getFieldValue(formData, "sortOrder")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ?? "Unable to save estimate content block."
      })
    );
  }

  let block;

  try {
    block = await upsertEstimateContentBlock(result.data);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save estimate content block."
      })
    );
  }

  revalidatePath("/cost-items-database");
  revalidatePath("/cost-items-database/items");
  revalidatePath("/materials");
  revalidatePath("/settings/catalogs");
  revalidatePath("/estimates");

  redirect(
    buildRedirect(returnTo, {
      message: `${block.title} was saved successfully.`
    })
  );
}
