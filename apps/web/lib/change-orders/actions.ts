"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canTransitionChangeOrderStatus } from "@floorconnector/domain";
import type { ChangeOrderStatus } from "@floorconnector/types";

import {
  addApprovedChangeOrderToScheduleOfValues,
  approveChangeOrderFromPortal,
  createChangeOrder,
  getChangeOrderById,
  invoiceApprovedChangeOrderDirectly,
  recordPortalViewedChangeOrder,
  rejectChangeOrderFromPortal,
  updateChangeOrder,
  updateChangeOrderStatus
} from "./data";
import {
  changeOrderInputSchema,
  changeOrderPortalDecisionInputSchema,
  changeOrderQuickCreateInputSchema
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

function revalidateChangeOrderPaths(changeOrder: {
  id: string;
  projectId: string;
  contractId: string | null;
  invoiceId: string | null;
}) {
  revalidatePath("/change-orders");
  revalidatePath(`/change-orders/${changeOrder.id}`);
  revalidatePath(`/projects/${changeOrder.projectId}`);
  revalidatePath(`/portal/projects/${changeOrder.projectId}`);
  revalidatePath(`/portal/change-orders/${changeOrder.id}`);

  if (changeOrder.contractId) {
    revalidatePath(`/contracts/${changeOrder.contractId}`);
  }

  if (changeOrder.invoiceId) {
    revalidatePath(`/invoices/${changeOrder.invoiceId}`);
    revalidatePath(`/portal/invoices/${changeOrder.invoiceId}`);
  }
}

export async function quickCreateChangeOrderAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const contractId = getFieldValue(formData, "contractId");
  const invoiceId = getFieldValue(formData, "invoiceId");
  const result = changeOrderQuickCreateInputSchema.safeParse({
    projectId,
    contractId,
    invoiceId,
    title: getFieldValue(formData, "title"),
    priceAdjustment: getFieldValue(formData, "priceAdjustment")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/change-orders", {
        compose: "1",
        projectId,
        contractId,
        invoiceId,
        error: result.error.issues[0]?.message ?? "Unable to create the change order."
      })
    );
  }

  let changeOrder;

  try {
    changeOrder = await createChangeOrder(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/change-orders", {
        compose: "1",
        projectId,
        contractId,
        invoiceId,
        error:
          error instanceof Error ? error.message : "Unable to create the change order."
      })
    );
  }

  revalidateChangeOrderPaths(changeOrder);

  redirect(
    buildRedirect(`/change-orders/${changeOrder.id}`, {
      message:
        "Change order created. Finish the scope review and customer decision workflow in this workspace."
    })
  );
}

export async function updateChangeOrderAction(formData: FormData) {
  const changeOrderId = getFieldValue(formData, "changeOrderId");
  const result = changeOrderInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    contractId: getFieldValue(formData, "contractId"),
    invoiceId: getFieldValue(formData, "invoiceId"),
    title: getFieldValue(formData, "title"),
    description: getFieldValue(formData, "description"),
    scopeChangeNotes: getFieldValue(formData, "scopeChangeNotes"),
    priceAdjustment: getFieldValue(formData, "priceAdjustment")
  });

  if (!changeOrderId) {
    redirect(buildRedirect("/change-orders", { error: "Change order id is required." }));
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update the change order."
      })
    );
  }

  let changeOrder;

  try {
    changeOrder = await updateChangeOrder(changeOrderId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        error:
          error instanceof Error ? error.message : "Unable to update the change order."
      })
    );
  }

  revalidateChangeOrderPaths(changeOrder);

  redirect(
    buildRedirect(`/change-orders/${changeOrder.id}`, {
      message: "Change order updated successfully."
    })
  );
}

export async function sendChangeOrderAction(formData: FormData) {
  const changeOrderId = getFieldValue(formData, "changeOrderId");
  const currentStatus = getFieldValue(formData, "currentStatus");

  if (!changeOrderId) {
    redirect(buildRedirect("/change-orders", { error: "Change order id is required." }));
  }

  if (!["draft", "sent", "approved", "rejected"].includes(currentStatus)) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        error: "Invalid current change order status."
      })
    );
  }

  if (!canTransitionChangeOrderStatus(currentStatus as ChangeOrderStatus, "sent")) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        error: `Change order cannot move from ${currentStatus} to sent.`
      })
    );
  }

  let changeOrder;

  try {
    changeOrder = await updateChangeOrderStatus(changeOrderId, "sent");
  } catch (error) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        error:
          error instanceof Error ? error.message : "Unable to send the change order."
      })
    );
  }

  revalidateChangeOrderPaths(changeOrder);

  redirect(
    buildRedirect(`/change-orders/${changeOrder.id}`, {
      message: "Change order sent for customer review."
    })
  );
}

export async function resetRejectedChangeOrderAction(formData: FormData) {
  const changeOrderId = getFieldValue(formData, "changeOrderId");
  const currentStatus = getFieldValue(formData, "currentStatus");

  if (!changeOrderId) {
    redirect(buildRedirect("/change-orders", { error: "Change order id is required." }));
  }

  if (!["draft", "sent", "approved", "rejected"].includes(currentStatus)) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        error: "Invalid current change order status."
      })
    );
  }

  if (!canTransitionChangeOrderStatus(currentStatus as ChangeOrderStatus, "draft")) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        error: `Change order cannot move from ${currentStatus} back to draft.`
      })
    );
  }

  let changeOrder;

  try {
    changeOrder = await updateChangeOrderStatus(changeOrderId, "draft");
  } catch (error) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reset the change order to draft."
      })
    );
  }

  revalidateChangeOrderPaths(changeOrder);

  redirect(
    buildRedirect(`/change-orders/${changeOrder.id}`, {
      message: "Change order returned to draft."
    })
  );
}

export async function customerApproveChangeOrderAction(formData: FormData) {
  const changeOrderId = getFieldValue(formData, "changeOrderId");
  const result = changeOrderPortalDecisionInputSchema.safeParse({
    changeOrderId,
    decisionNote: getFieldValue(formData, "decisionNote")
  });

  if (!changeOrderId) {
    redirect(buildRedirect("/portal", { error: "Change order id is required." }));
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/portal/change-orders/${changeOrderId}`, {
        error: result.error.issues[0]?.message ?? "Unable to approve the change order."
      })
    );
  }

  let changeOrder;

  try {
    changeOrder = await approveChangeOrderFromPortal(
      result.data,
      `/portal/change-orders/${changeOrderId}`
    );
  } catch (error) {
    redirect(
      buildRedirect(`/portal/change-orders/${changeOrderId}`, {
        error:
          error instanceof Error ? error.message : "Unable to approve the change order."
      })
    );
  }

  revalidateChangeOrderPaths(changeOrder);

  redirect(
    buildRedirect(`/portal/change-orders/${changeOrder.id}`, {
      message: "Change order approved successfully."
    })
  );
}

export async function customerRejectChangeOrderAction(formData: FormData) {
  const changeOrderId = getFieldValue(formData, "changeOrderId");
  const result = changeOrderPortalDecisionInputSchema.safeParse({
    changeOrderId,
    decisionNote: getFieldValue(formData, "decisionNote")
  });

  if (!changeOrderId) {
    redirect(buildRedirect("/portal", { error: "Change order id is required." }));
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/portal/change-orders/${changeOrderId}`, {
        error: result.error.issues[0]?.message ?? "Unable to reject the change order."
      })
    );
  }

  let changeOrder;

  try {
    changeOrder = await rejectChangeOrderFromPortal(
      result.data,
      `/portal/change-orders/${changeOrderId}`
    );
  } catch (error) {
    redirect(
      buildRedirect(`/portal/change-orders/${changeOrderId}`, {
        error:
          error instanceof Error ? error.message : "Unable to reject the change order."
      })
    );
  }

  revalidateChangeOrderPaths(changeOrder);

  redirect(
    buildRedirect(`/portal/change-orders/${changeOrder.id}`, {
      message: "Change order rejected."
    })
  );
}

export async function invoiceApprovedChangeOrderDirectlyAction(formData: FormData) {
  const changeOrderId = getFieldValue(formData, "changeOrderId");

  if (!changeOrderId) {
    redirect(buildRedirect("/change-orders", { error: "Change order id is required." }));
  }

  let changeOrder;

  try {
    changeOrder = await invoiceApprovedChangeOrderDirectly(changeOrderId);
  } catch (error) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        showNextSteps: "1",
        error:
          error instanceof Error
            ? error.message
            : "Unable to invoice the approved change order directly."
      })
    );
  }

  revalidateChangeOrderPaths(changeOrder);
  revalidatePath(`/invoices/${changeOrder.invoiceId}`);
  revalidatePath(`/invoices/${changeOrder.invoiceId}/edit`);

  redirect(
    buildRedirect(`/change-orders/${changeOrder.id}`, {
      message: "Approved change order billed directly on the canonical invoice chain."
    })
  );
}

export async function addApprovedChangeOrderToSovAction(formData: FormData) {
  const changeOrderId = getFieldValue(formData, "changeOrderId");
  const scheduleOfValuesId = getFieldValue(formData, "scheduleOfValuesId");

  if (!changeOrderId) {
    redirect(buildRedirect("/change-orders", { error: "Change order id is required." }));
  }

  let result;

  try {
    result = await addApprovedChangeOrderToScheduleOfValues({
      changeOrderId,
      scheduleOfValuesId: scheduleOfValuesId || null
    });
  } catch (error) {
    redirect(
      buildRedirect(`/change-orders/${changeOrderId}`, {
        showNextSteps: "1",
        error:
          error instanceof Error
            ? error.message
            : "Unable to append the approved change order to the schedule of values."
      })
    );
  }

  revalidateChangeOrderPaths(result.changeOrder);
  revalidatePath("/progress-billing");
  revalidatePath(`/progress-billing/${result.scheduleOfValuesId}`);

  redirect(
    buildRedirect(`/change-orders/${result.changeOrder.id}`, {
      message: "Approved change order appended to the schedule of values as additive snapshot-backed rows."
    })
  );
}

export async function ensurePortalChangeOrderViewed(changeOrderId: string) {
  const changeOrder = await getChangeOrderById(
    changeOrderId,
    `/portal/change-orders/${changeOrderId}`
  );

  if (changeOrder?.customerViewedAt) {
    return changeOrder;
  }

  return recordPortalViewedChangeOrder(
    changeOrderId,
    `/portal/change-orders/${changeOrderId}`
  );
}
