"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAssessmentPackageForOpportunity,
  createAssessmentPackageForProject,
  updateAssessmentPackage,
  updateAssessmentPackageStatus
} from "./assessment-package-data";
import {
  assessmentPackageCreateInputSchema,
  assessmentPackageInputSchema,
  assessmentPackageStatusInputSchema
} from "./assessment-package-schemas";

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

function parseAssessmentPackageInput(formData: FormData) {
  return assessmentPackageInputSchema.safeParse({
    title: getFieldValue(formData, "title"),
    assessmentDate: getFieldValue(formData, "assessmentDate"),
    siteContactName: getFieldValue(formData, "siteContactName"),
    siteContactPhone: getFieldValue(formData, "siteContactPhone"),
    accessNotes: getFieldValue(formData, "accessNotes"),
    parkingNotes: getFieldValue(formData, "parkingNotes"),
    siteNotes: getFieldValue(formData, "siteNotes"),
    customerGoals: getFieldValue(formData, "customerGoals"),
    currentConditionsSummary: getFieldValue(
      formData,
      "currentConditionsSummary"
    ),
    recommendedSystemSummary: getFieldValue(
      formData,
      "recommendedSystemSummary"
    ),
    riskSummary: getFieldValue(formData, "riskSummary"),
    estimateHandoffSummary: getFieldValue(formData, "estimateHandoffSummary")
  });
}

function revalidateAssessmentPackageRoutes(input: {
  projectId: string;
  assessmentPackageId?: string;
}) {
  revalidatePath(`/projects/${input.projectId}`);

  if (input.assessmentPackageId) {
    revalidatePath(
      `/projects/${input.projectId}/assessment-packages/${input.assessmentPackageId}`
    );
  }
}

export async function createAssessmentPackageAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const result = assessmentPackageCreateInputSchema.safeParse({
    title: getFieldValue(formData, "title"),
    assessmentDate: getFieldValue(formData, "assessmentDate")
  });

  if (!projectId) {
    redirect(
      buildRedirect("/projects", {
        error: "Project id is required for assessment package creation."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/projects/${projectId}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to create assessment package."
      })
    );
  }

  let assessmentPackage;

  try {
    assessmentPackage = await createAssessmentPackageForProject(
      projectId,
      result.data
    );
  } catch (error) {
    redirect(
      buildRedirect(`/projects/${projectId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create assessment package."
      })
    );
  }

  revalidateAssessmentPackageRoutes({
    projectId,
    assessmentPackageId: assessmentPackage.id
  });

  redirect(
    buildRedirect(
      `/projects/${projectId}/assessment-packages/${assessmentPackage.id}`,
      {
        message: "Assessment package was created."
      }
    )
  );
}

export async function createOpportunityAssessmentPackageAction(
  formData: FormData
) {
  const opportunityId = getFieldValue(formData, "opportunityId");
  const result = assessmentPackageCreateInputSchema.safeParse({
    title: getFieldValue(formData, "title"),
    assessmentDate: getFieldValue(formData, "assessmentDate")
  });

  if (!opportunityId) {
    redirect(
      buildRedirect("/leads", {
        error: "Opportunity id is required for assessment package creation."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/leads/${opportunityId}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to create assessment package."
      })
    );
  }

  try {
    await createAssessmentPackageForOpportunity(opportunityId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/leads/${opportunityId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create assessment package."
      })
    );
  }

  revalidatePath(`/leads/${opportunityId}`);

  redirect(
    buildRedirect(`/leads/${opportunityId}`, {
      message: "Assessment package was created."
    })
  );
}

export async function updateAssessmentPackageAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const assessmentPackageId = getFieldValue(formData, "assessmentPackageId");
  const result = parseAssessmentPackageInput(formData);

  if (!projectId || !assessmentPackageId) {
    redirect(
      buildRedirect("/projects", {
        error: "Project and assessment package ids are required."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(
        `/projects/${projectId}/assessment-packages/${assessmentPackageId}`,
        {
          error:
            result.error.issues[0]?.message ??
            "Unable to update assessment package."
        }
      )
    );
  }

  try {
    await updateAssessmentPackage(projectId, assessmentPackageId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(
        `/projects/${projectId}/assessment-packages/${assessmentPackageId}`,
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to update assessment package."
        }
      )
    );
  }

  revalidateAssessmentPackageRoutes({ projectId, assessmentPackageId });

  redirect(
    buildRedirect(
      `/projects/${projectId}/assessment-packages/${assessmentPackageId}`,
      {
        message: "Assessment package was updated."
      }
    )
  );
}

export async function updateAssessmentPackageStatusAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const assessmentPackageId = getFieldValue(formData, "assessmentPackageId");
  const result = assessmentPackageStatusInputSchema.safeParse({
    status: getFieldValue(formData, "status")
  });

  if (!projectId || !assessmentPackageId) {
    redirect(
      buildRedirect("/projects", {
        error: "Project and assessment package ids are required."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(
        `/projects/${projectId}/assessment-packages/${assessmentPackageId}`,
        {
          error:
            result.error.issues[0]?.message ??
            "Unable to update assessment package status."
        }
      )
    );
  }

  try {
    await updateAssessmentPackageStatus(
      projectId,
      assessmentPackageId,
      result.data
    );
  } catch (error) {
    redirect(
      buildRedirect(
        `/projects/${projectId}/assessment-packages/${assessmentPackageId}`,
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to update assessment package status."
        }
      )
    );
  }

  revalidateAssessmentPackageRoutes({ projectId, assessmentPackageId });

  redirect(
    buildRedirect(
      `/projects/${projectId}/assessment-packages/${assessmentPackageId}`,
      {
        message: `Assessment package moved to ${result.data.status.replaceAll(
          "_",
          " "
        )}.`
      }
    )
  );
}
