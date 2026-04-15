"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canTransitionContractStatus } from "@floorconnector/domain";
import type { ContractStatus } from "@floorconnector/types";

import {
  createContractFromEstimate,
  updateContractDraft,
  updateContractStatus
} from "./data";
import {
  createContractFromEstimateInputSchema,
  updateContractDraftInputSchema
} from "./schemas";

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

function getStatusActionLabel(status: ContractStatus) {
  switch (status) {
    case "sent":
      return "marked as sent";
    case "viewed":
      return "marked as viewed";
    case "signed":
      return "marked as signed";
    case "void":
      return "voided";
    default:
      return "updated";
  }
}

export async function createContractFromEstimateAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const templateId = getFieldValue(formData, "templateId");
  const result = createContractFromEstimateInputSchema.safeParse({
    estimateId,
    templateId
  });

  if (!result.success) {
    redirect(
      buildRedirect("/contracts", {
        estimateId,
        error: result.error.issues[0]?.message ?? "Unable to generate contract."
      })
    );
  }

  let contract;

  try {
    contract = await createContractFromEstimate(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/contracts", {
        estimateId,
        error:
          error instanceof Error ? error.message : "Unable to generate contract."
      })
    );
  }

  revalidatePath("/contracts");
  revalidatePath(`/contracts/${contract.id}`);
  revalidatePath(`/contracts/${contract.id}/edit`);
  if (contract.estimateId) {
    revalidatePath(`/estimates/${contract.estimateId}`);
  }
  revalidatePath(`/projects/${contract.projectId}`);

  redirect(
    buildRedirect(`/contracts/${contract.id}`, {
      message: `${contract.title} was generated successfully.`
    })
  );
}

export async function updateContractDraftAction(formData: FormData) {
  const contractId = getFieldValue(formData, "contractId");
  const result = updateContractDraftInputSchema.safeParse({
    contractId,
    title: getFieldValue(formData, "title"),
    renderedSubject: getFieldValue(formData, "renderedSubject"),
    renderedContent: getFieldValue(formData, "renderedContent"),
    editSummary: getFieldValue(formData, "editSummary")
  });

  if (!contractId) {
    redirect(
      buildRedirect("/contracts", {
        error: "Contract id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/contracts/${contractId}/edit`, {
        error: result.error.issues[0]?.message ?? "Unable to update contract."
      })
    );
  }

  let contract;

  try {
    contract = await updateContractDraft(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/contracts/${contractId}/edit`, {
        error: error instanceof Error ? error.message : "Unable to update contract."
      })
    );
  }

  revalidatePath("/contracts");
  revalidatePath(`/contracts/${contract.id}`);
  revalidatePath(`/contracts/${contract.id}/edit`);
  if (contract.estimateId) {
    revalidatePath(`/estimates/${contract.estimateId}`);
  }
  revalidatePath(`/projects/${contract.projectId}`);

  redirect(
    buildRedirect(`/contracts/${contract.id}`, {
      message: `${contract.title} was updated successfully.`
    })
  );
}

export async function updateContractStatusAction(formData: FormData) {
  const contractId = getFieldValue(formData, "contractId");
  const currentStatus = getFieldValue(formData, "currentStatus");
  const nextStatus = getFieldValue(formData, "nextStatus");

  if (!contractId) {
    redirect(
      buildRedirect("/contracts", {
        error: "Contract id is required for status updates."
      })
    );
  }

  if (
    !["draft", "sent", "viewed", "signed", "void"].includes(currentStatus) ||
    !["draft", "sent", "viewed", "signed", "void"].includes(nextStatus)
  ) {
    redirect(
      buildRedirect(`/contracts/${contractId}`, {
        error: "Invalid contract status transition."
      })
    );
  }

  if (
    !canTransitionContractStatus(
      currentStatus as ContractStatus,
      nextStatus as ContractStatus
    )
  ) {
    redirect(
      buildRedirect(`/contracts/${contractId}`, {
        error: `Contract cannot move from ${currentStatus} to ${nextStatus}.`
      })
    );
  }

  let contract;

  try {
    contract = await updateContractStatus(contractId, nextStatus as ContractStatus);
  } catch (error) {
    redirect(
      buildRedirect(`/contracts/${contractId}`, {
        error:
          error instanceof Error ? error.message : "Unable to update contract status."
      })
    );
  }

  revalidatePath("/contracts");
  revalidatePath(`/contracts/${contract.id}`);
  revalidatePath(`/contracts/${contract.id}/edit`);
  if (contract.estimateId) {
    revalidatePath(`/estimates/${contract.estimateId}`);
  }
  revalidatePath(`/projects/${contract.projectId}`);

  redirect(
    buildRedirect(`/contracts/${contract.id}`, {
      message: `${contract.title} was ${getStatusActionLabel(contract.status)}.`
    })
  );
}
