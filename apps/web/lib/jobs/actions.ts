"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createJob, updateJob } from "./data";
import { jobInputSchema } from "./schemas";

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

function parseJobInput(formData: FormData) {
  return jobInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    estimateId: getFieldValue(formData, "estimateId"),
    status: getFieldValue(formData, "status"),
    scheduledDate: getFieldValue(formData, "scheduledDate"),
    notes: getFieldValue(formData, "notes")
  });
}

export async function createJobAction(formData: FormData) {
  const result = parseJobInput(formData);
  const projectId = getFieldValue(formData, "projectId");
  const estimateId = getFieldValue(formData, "estimateId");

  if (!result.success) {
    redirect(
      buildRedirect("/jobs", {
        projectId,
        estimateId,
        error: result.error.issues[0]?.message ?? "Unable to create job."
      })
    );
  }

  let job;

  try {
    job = await createJob(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/jobs", {
        projectId,
        estimateId,
        error: error instanceof Error ? error.message : "Unable to create job."
      })
    );
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${job.id}`);
  revalidatePath(`/projects/${job.projectId}`);
  if (job.estimateId) {
    revalidatePath(`/estimates/${job.estimateId}`);
  }

  redirect(
    buildRedirect("/jobs", {
      message: "Job was created successfully."
    })
  );
}

export async function updateJobAction(formData: FormData) {
  const jobId = getFieldValue(formData, "jobId");
  const result = parseJobInput(formData);

  if (!jobId) {
    redirect(
      buildRedirect("/jobs", {
        error: "Job id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/jobs/${jobId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update job."
      })
    );
  }

  let job;

  try {
    job = await updateJob(jobId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/jobs/${jobId}`, {
        error: error instanceof Error ? error.message : "Unable to update job."
      })
    );
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${job.id}`);
  revalidatePath(`/projects/${job.projectId}`);
  if (job.estimateId) {
    revalidatePath(`/estimates/${job.estimateId}`);
  }

  redirect(
    buildRedirect(`/jobs/${job.id}`, {
      message: "Job was updated successfully."
    })
  );
}
