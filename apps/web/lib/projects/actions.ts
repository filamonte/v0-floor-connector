"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createProject, updateProject } from "./data";
import { projectInputSchema } from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function buildRedirect(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function parseProjectInput(formData: FormData) {
  return projectInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    customerId: getFieldValue(formData, "customerId"),
    status: getFieldValue(formData, "status"),
    description: getFieldValue(formData, "description"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode"),
    countryCode: getFieldValue(formData, "countryCode")
  });
}

export async function createProjectAction(formData: FormData) {
  const result = parseProjectInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/projects", {
        error: result.error.issues[0]?.message ?? "Unable to create project."
      })
    );
  }

  let project;

  try {
    project = await createProject(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/projects", {
        error:
          error instanceof Error ? error.message : "Unable to create project."
      })
    );
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.id}`);

  redirect(
    buildRedirect("/projects", {
      message: `${project.name} was created successfully.`
    })
  );
}

export async function updateProjectAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const result = parseProjectInput(formData);

  if (!projectId) {
    redirect(
      buildRedirect("/projects", {
        error: "Project id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/projects/${projectId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update project."
      })
    );
  }

  let project;

  try {
    project = await updateProject(projectId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/projects/${projectId}`, {
        error:
          error instanceof Error ? error.message : "Unable to update project."
      })
    );
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.id}`);

  redirect(
    buildRedirect(`/projects/${project.id}`, {
      message: `${project.name} was updated successfully.`
    })
  );
}
