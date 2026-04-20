"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createOpportunity,
  ensureOpportunityEstimateFlow,
  updateOpportunity
} from "./data";
import { opportunityInputSchema, opportunityQuickCreateInputSchema } from "./schemas";

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

function parseOpportunityInput(formData: FormData) {
  return opportunityInputSchema.safeParse({
    title: getFieldValue(formData, "title"),
    status: getFieldValue(formData, "status"),
    source: getFieldValue(formData, "source"),
    serviceType: getFieldValue(formData, "serviceType"),
    prospectName: getFieldValue(formData, "prospectName"),
    prospectCompanyName: getFieldValue(formData, "prospectCompanyName"),
    email: getFieldValue(formData, "email"),
    phone: getFieldValue(formData, "phone"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode"),
    countryCode: getFieldValue(formData, "countryCode"),
    siteAssessmentScheduledOn: getFieldValue(formData, "siteAssessmentScheduledOn"),
    siteAssessmentCompletedOn: getFieldValue(formData, "siteAssessmentCompletedOn"),
    requirementsSummary: getFieldValue(formData, "requirementsSummary"),
    notes: getFieldValue(formData, "notes")
  });
}

function parseOpportunityQuickCreateInput(formData: FormData) {
  return opportunityQuickCreateInputSchema.safeParse({
    title: getFieldValue(formData, "title"),
    prospectName: getFieldValue(formData, "prospectName")
  });
}

export async function createOpportunityAction(formData: FormData) {
  const result = parseOpportunityInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/leads", {
        error: result.error.issues[0]?.message ?? "Unable to create lead."
      })
    );
  }

  let opportunity;

  try {
    opportunity = await createOpportunity(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/leads", {
        error: error instanceof Error ? error.message : "Unable to create lead."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${opportunity.id}`);

  redirect(
    buildRedirect("/leads", {
      message: `${opportunity.title} was created successfully.`
    })
  );
}

export async function quickCreateOpportunityAction(formData: FormData) {
  const title = getFieldValue(formData, "title");
  const result = parseOpportunityQuickCreateInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/leads", {
        compose: "1",
        error: result.error.issues[0]?.message ?? "Unable to create lead."
      })
    );
  }

  let opportunity;

  try {
    opportunity = await createOpportunity({
      title: result.data.title,
      status: "new",
      source: null,
      serviceType: null,
      prospectName: result.data.prospectName,
      prospectCompanyName: null,
      email: null,
      phone: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      stateRegion: null,
      postalCode: null,
      countryCode: null,
      siteAssessmentScheduledOn: null,
      siteAssessmentCompletedOn: null,
      requirementsSummary: null,
      notes: null
    });
  } catch (error) {
    redirect(
      buildRedirect("/leads", {
        compose: "1",
        error: error instanceof Error ? error.message : "Unable to create lead."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${opportunity.id}`);

  redirect(
    buildRedirect(`/leads/${opportunity.id}`, {
      message: `${title || opportunity.title} was created. Finish qualification and capture in this workspace.`
    })
  );
}

export async function updateOpportunityAction(formData: FormData) {
  const opportunityId = getFieldValue(formData, "opportunityId");
  const result = parseOpportunityInput(formData);

  if (!opportunityId) {
    redirect(
      buildRedirect("/leads", {
        error: "Lead id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/leads/${opportunityId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update lead."
      })
    );
  }

  let opportunity;

  try {
    opportunity = await updateOpportunity(opportunityId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/leads/${opportunityId}`, {
        error: error instanceof Error ? error.message : "Unable to update lead."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${opportunity.id}`);

  redirect(
    buildRedirect(`/leads/${opportunity.id}`, {
      message: `${opportunity.title} was updated successfully.`
    })
  );
}

export async function startEstimateFromOpportunityAction(formData: FormData) {
  const opportunityId = getFieldValue(formData, "opportunityId");

  if (!opportunityId) {
    redirect(
      buildRedirect("/leads", {
        error: "Lead id is required to start the estimate flow."
      })
    );
  }

  let result;

  try {
    result = await ensureOpportunityEstimateFlow(opportunityId);
  } catch (error) {
    redirect(
      buildRedirect(`/leads/${opportunityId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start the estimate flow."
      })
    );
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${result.opportunityId}`);
  revalidatePath("/customers");
  revalidatePath(`/customers/${result.customerId}`);
  revalidatePath("/projects");
  revalidatePath(`/projects/${result.projectId}`);

  redirect(
    buildRedirect("/estimates", {
      projectId: result.projectId,
      message: "Lead moved into the live estimate flow."
    })
  );
}
