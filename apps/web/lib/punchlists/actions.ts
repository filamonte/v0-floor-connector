"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPunchlistItem, updatePunchlistItem } from "./data";
import {
  punchlistItemInputSchema,
  punchlistQuickCreateInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getRedirectTarget(formData: FormData, fallback: string) {
  const redirectTo = getFieldValue(formData, "redirectTo");

  return redirectTo || fallback;
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

function revalidatePunchlistRoutes(item: {
  id: string;
  projectId: string;
  jobId: string | null;
}) {
  revalidatePath("/punchlists");
  revalidatePath(`/punchlists/${item.id}`);
  revalidatePath(`/projects/${item.projectId}`);
  revalidatePath("/dashboard");

  if (item.jobId) {
    revalidatePath(`/jobs/${item.jobId}`);
    revalidatePath("/schedule");
  }
}

function parsePunchlistItemInput(formData: FormData) {
  return punchlistItemInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    jobId: getFieldValue(formData, "jobId"),
    assigneePersonId: getFieldValue(formData, "assigneePersonId"),
    title: getFieldValue(formData, "title"),
    details: getFieldValue(formData, "details"),
    dueDate: getFieldValue(formData, "dueDate"),
    status: getFieldValue(formData, "status")
  });
}

function parsePunchlistQuickCreateInput(formData: FormData) {
  return punchlistQuickCreateInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    jobId: getFieldValue(formData, "jobId"),
    title: getFieldValue(formData, "title")
  });
}

export async function createPunchlistItemAction(formData: FormData) {
  const result = parsePunchlistItemInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/punchlists", {
        error:
          result.error.issues[0]?.message ?? "Unable to create the punchlist item."
      })
    );
  }

  let item;

  try {
    item = await createPunchlistItem(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/punchlists", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the punchlist item."
      })
    );
  }

  revalidatePunchlistRoutes(item);

  redirect(
    buildRedirect(`/punchlists/${item.id}`, {
      message: "Punchlist item created successfully."
    })
  );
}

export async function quickCreatePunchlistItemAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const jobId = getFieldValue(formData, "jobId");
  const result = parsePunchlistQuickCreateInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/punchlists", {
        compose: "1",
        projectId,
        jobId,
        error:
          result.error.issues[0]?.message ?? "Unable to create the punchlist item."
      })
    );
  }

  let item;

  try {
    item = await createPunchlistItem({
      projectId: result.data.projectId,
      jobId: result.data.jobId,
      assigneePersonId: null,
      title: result.data.title,
      details: null,
      dueDate: null,
      status: "open"
    });
  } catch (error) {
    redirect(
      buildRedirect("/punchlists", {
        compose: "1",
        projectId,
        jobId,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the punchlist item."
      })
    );
  }

  revalidatePunchlistRoutes(item);

  redirect(
    buildRedirect(`/punchlists/${item.id}`, {
      message:
        "Punchlist item created. Finish responsibility, details, and closeout state in this workspace."
    })
  );
}

export async function updatePunchlistItemAction(formData: FormData) {
  const punchlistItemId = getFieldValue(formData, "punchlistItemId");
  const fallbackRedirect = punchlistItemId ? `/punchlists/${punchlistItemId}` : "/punchlists";
  const redirectTarget = getRedirectTarget(formData, fallbackRedirect);
  const result = parsePunchlistItemInput(formData);

  if (!punchlistItemId) {
    redirect(
      buildRedirect("/punchlists", {
        error: "Punchlist item id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          result.error.issues[0]?.message ?? "Unable to update the punchlist item."
      })
    );
  }

  let item;

  try {
    item = await updatePunchlistItem(punchlistItemId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the punchlist item."
      })
    );
  }

  revalidatePunchlistRoutes(item);

  redirect(
    buildRedirect(redirectTarget, {
      message: "Punchlist item updated successfully."
    })
  );
}
