"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canTransitionContractInternalApprovalStatus,
  canTransitionContractStatus
} from "@floorconnector/domain";
import type {
  ContractInternalApprovalStatus,
  ContractStatus
} from "@floorconnector/types";

import {
  countersignContract,
  createContractFromEstimate,
  getContractSignatureActionOptions,
  recordCustomerDeclinedContract,
  recordCustomerSignedContract,
  sendContractForSignature,
  updateContractInternalApprovalStatus,
  updateContractDraft,
  updateContractStatus
} from "./data";
import {
  contractCountersignInputSchema,
  contractPortalSignatureActionInputSchema,
  contractSendSignatureActionInputSchema,
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
      return "sent for signature";
    case "void":
      return "voided";
    default:
      return "updated";
  }
}

function getInternalApprovalActionLabel(status: ContractInternalApprovalStatus) {
  switch (status) {
    case "approved":
      return "approved for send";
    case "rejected":
      return "marked as needing revision";
    case "pending":
      return "reset to pending review";
    default:
      return "updated";
  }
}

function revalidateContractPaths(contract: {
  id: string;
  estimateId: string | null;
  projectId: string;
}) {
  revalidatePath("/contracts");
  revalidatePath(`/contracts/${contract.id}`);
  revalidatePath(`/contracts/${contract.id}/edit`);
  revalidatePath(`/portal/contracts/${contract.id}`);
  revalidatePath(`/projects/${contract.projectId}`);
  revalidatePath(`/portal/projects/${contract.projectId}`);

  if (contract.estimateId) {
    revalidatePath(`/estimates/${contract.estimateId}`);
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

  revalidateContractPaths(contract);

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

  revalidateContractPaths(contract);

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

  revalidateContractPaths(contract);

  redirect(
    buildRedirect(`/contracts/${contract.id}`, {
      message: `${contract.title} was ${getStatusActionLabel(contract.status)}.`
    })
  );
}

export async function updateContractInternalApprovalStatusAction(formData: FormData) {
  const contractId = getFieldValue(formData, "contractId");
  const currentStatus = getFieldValue(formData, "currentInternalApprovalStatus");
  const nextStatus = getFieldValue(formData, "nextInternalApprovalStatus");

  if (!contractId) {
    redirect(
      buildRedirect("/contracts", {
        error: "Contract id is required for internal approval updates."
      })
    );
  }

  if (
    !["not_required", "pending", "approved", "rejected"].includes(currentStatus) ||
    !["not_required", "pending", "approved", "rejected"].includes(nextStatus)
  ) {
    redirect(
      buildRedirect(`/contracts/${contractId}`, {
        error: "Invalid internal approval transition."
      })
    );
  }

  if (
    !canTransitionContractInternalApprovalStatus(
      currentStatus as ContractInternalApprovalStatus,
      nextStatus as ContractInternalApprovalStatus
    )
  ) {
    redirect(
      buildRedirect(`/contracts/${contractId}`, {
        error: `Internal approval cannot move from ${currentStatus} to ${nextStatus}.`
      })
    );
  }

  let contract;

  try {
    contract = await updateContractInternalApprovalStatus(
      contractId,
      nextStatus as ContractInternalApprovalStatus
    );
  } catch (error) {
    redirect(
      buildRedirect(`/contracts/${contractId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update contract internal approval."
      })
    );
  }

  revalidateContractPaths(contract);

  redirect(
    buildRedirect(`/contracts/${contract.id}`, {
      message: `${contract.title} was ${getInternalApprovalActionLabel(
        contract.internalApprovalStatus
      )}.`
    })
  );
}

export async function sendContractForSignatureAction(formData: FormData) {
  const contractId = getFieldValue(formData, "contractId");
  const result = contractSendSignatureActionInputSchema.safeParse({
    contractId,
    customerPortalUserId: getFieldValue(formData, "customerPortalUserId"),
    contractorSignerUserId: getFieldValue(formData, "contractorSignerUserId")
  });

  if (!contractId) {
    redirect(
      buildRedirect("/contracts", {
        error: "Contract id is required for signature send."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/contracts/${contractId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to prepare contract signature send."
      })
    );
  }

  const options = await getContractSignatureActionOptions(
    result.data.contractId,
    `/contracts/${result.data.contractId}`
  );

  if (!options) {
    redirect(
      buildRedirect(`/contracts/${result.data.contractId}`, {
        error: "Contract not found for this organization."
      })
    );
  }

  const customerSigner = options.customerPortalSignerOptions.find(
    (option) => option.userId === result.data.customerPortalUserId
  );

  if (!customerSigner) {
    redirect(
      buildRedirect(`/contracts/${result.data.contractId}`, {
        error:
          "Select an active portal user who has access to this customer project before sending."
      })
    );
  }

  const contractorSigner = result.data.contractorSignerUserId
    ? options.contractorSignerOptions.find(
        (option) => option.userId === result.data.contractorSignerUserId
      )
    : null;

  if (result.data.contractorSignerUserId && !contractorSigner) {
    redirect(
      buildRedirect(`/contracts/${result.data.contractId}`, {
        error: "Select a valid contractor countersigner from this organization."
      })
    );
  }

  let contract;

  try {
    contract = await sendContractForSignature({
      contractId: result.data.contractId,
      signers: [
        {
          signerRole: "customer",
          customerId: options.customerId,
          portalUserId: customerSigner.userId,
          organizationUserId: null,
          displayName: customerSigner.displayName,
          email: customerSigner.email,
          signerOrder: 1
        },
        ...(contractorSigner
          ? [
              {
                signerRole: "contractor" as const,
                customerId: null,
                portalUserId: null,
                organizationUserId: contractorSigner.userId,
                displayName: contractorSigner.displayName,
                email: contractorSigner.email,
                signerOrder: 2
              }
            ]
          : [])
      ]
    });
  } catch (error) {
    redirect(
      buildRedirect(`/contracts/${result.data.contractId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send the contract for signature."
      })
    );
  }

  revalidateContractPaths(contract);

  redirect(
    buildRedirect(`/contracts/${contract.id}`, {
      message: `${contract.title} was sent for signature.`
    })
  );
}

export async function countersignContractAction(formData: FormData) {
  const contractId = getFieldValue(formData, "contractId");
  const result = contractCountersignInputSchema.safeParse({ contractId });

  if (!contractId) {
    redirect(
      buildRedirect("/contracts", {
        error: "Contract id is required for countersign."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/contracts/${contractId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to complete contractor countersign."
      })
    );
  }

  let contract;

  try {
    contract = await countersignContract(result.data.contractId);
  } catch (error) {
    redirect(
      buildRedirect(`/contracts/${result.data.contractId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete contractor countersign."
      })
    );
  }

  revalidateContractPaths(contract);

  redirect(
    buildRedirect(`/contracts/${contract.id}`, {
      message: `${contract.title} was countersigned.`
    })
  );
}

export async function customerSignContractAction(formData: FormData) {
  const contractId = getFieldValue(formData, "contractId");
  const result = contractPortalSignatureActionInputSchema.safeParse({
    contractId,
    declineReason: null
  });

  if (!contractId) {
    redirect(
      buildRedirect("/portal", {
        error: "Contract id is required for customer signature."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/portal/contracts/${contractId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to complete customer signature."
      })
    );
  }

  let contract;

  try {
    contract = await recordCustomerSignedContract(result.data, `/portal/contracts/${contractId}`);
  } catch (error) {
    redirect(
      buildRedirect(`/portal/contracts/${contractId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete customer signature."
      })
    );
  }

  revalidateContractPaths(contract);

  redirect(
    buildRedirect(`/portal/contracts/${contract.id}`, {
      message: `${contract.title} was signed.`
    })
  );
}

export async function customerDeclineContractAction(formData: FormData) {
  const contractId = getFieldValue(formData, "contractId");
  const result = contractPortalSignatureActionInputSchema.safeParse({
    contractId,
    declineReason: getFieldValue(formData, "declineReason")
  });

  if (!contractId) {
    redirect(
      buildRedirect("/portal", {
        error: "Contract id is required for customer decline."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/portal/contracts/${contractId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to decline the contract."
      })
    );
  }

  let contract;

  try {
    contract = await recordCustomerDeclinedContract(
      result.data,
      `/portal/contracts/${contractId}`
    );
  } catch (error) {
    redirect(
      buildRedirect(`/portal/contracts/${contractId}`, {
        error:
          error instanceof Error ? error.message : "Unable to decline the contract."
      })
    );
  }

  revalidateContractPaths(contract);

  redirect(
    buildRedirect(`/portal/contracts/${contract.id}`, {
      message: `${contract.title} was declined.`
    })
  );
}
