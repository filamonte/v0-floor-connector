"use server";

import { getPublicEnv } from "@floorconnector/config";
import { getPaymentGatewayAdapter } from "@floorconnector/integrations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  getChangeOrderById,
  invoiceApprovedChangeOrderDirectly
} from "@/lib/change-orders/data";
import { getEstimateById } from "@/lib/estimates/data";
import { getJobById } from "@/lib/jobs/data";
import { assertInvoiceOrganizationCanPerformProductionAction } from "@/lib/organizations/activation-guard";

import {
  createInvoice,
  ensurePendingPortalInvoicePayment,
  recordInvoicePayment,
  requestInvoicePayment,
  sendInvoiceReviewEmail,
  startInvoiceCheckout,
  updateInvoice
} from "./data";
import {
  invoiceCheckoutStartInputSchema,
  invoiceCustomerPaymentRequestInputSchema,
  invoiceEmailSendInputSchema,
  invoiceInputSchema,
  invoicePaymentInputSchema,
  invoiceQuickCreateInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getSourceConfigurationValue(formData: FormData) {
  const rawValue = getFieldValue(formData, "sourceConfiguration");

  if (!rawValue.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    return "__invalid_json__";
  }
}

const forbiddenInvoiceLineItemFields = [
  "lineItemCatalogItemId",
  "lineItemName",
  "lineItemDescription",
  "lineItemQuantity",
  "lineItemUnit",
  "lineItemUnitPrice",
  "lineItemTaxable",
  "lineItemBaseUnitCost",
  "lineItemBaseUnitPrice",
  "lineItemMarkupPercent",
  "lineItemHiddenMarkupPercent",
  "lineItemUnitPriceBeforeHiddenMarkup",
  "lineItemVisibleMarkupAmount",
  "lineItemHiddenMarkupAmount",
  "lineItemCostCode"
] as const;

function hasForbiddenInvoiceLineItemFields(formData: FormData) {
  return forbiddenInvoiceLineItemFields.some((key) => formData.has(key));
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

function buildAbsoluteAppUrl(
  pathname: string,
  params: Record<string, string | undefined> = {}
) {
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be configured before customer checkout can start."
    );
  }

  const url = new URL(pathname, appUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

function parseInvoiceInput(formData: FormData) {
  if (hasForbiddenInvoiceLineItemFields(formData)) {
    return {
      success: false as const,
      error: {
        issues: [
          {
            message:
              "Invoice pricing snapshots are server-owned. Client line item pricing fields are not accepted."
          }
        ]
      }
    };
  }

  return invoiceInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    estimateId: getFieldValue(formData, "estimateId"),
    jobId: getFieldValue(formData, "jobId"),
    workflowRole: getFieldValue(formData, "workflowRole"),
    status: getFieldValue(formData, "status"),
    issueDate: getFieldValue(formData, "issueDate"),
    dueDate: getFieldValue(formData, "dueDate"),
    discountAmount: getFieldValue(formData, "discountAmount"),
    notes: getFieldValue(formData, "notes"),
    sourceConfiguration: getSourceConfigurationValue(formData)
  });
}

function parseInvoiceQuickCreateInput(formData: FormData) {
  return invoiceQuickCreateInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    estimateId: getFieldValue(formData, "estimateId"),
    jobId: getFieldValue(formData, "jobId"),
    changeOrderId: getFieldValue(formData, "changeOrderId"),
    workflowRole: getFieldValue(formData, "workflowRole")
  });
}

export async function createInvoiceAction(formData: FormData) {
  const result = parseInvoiceInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/invoices", {
        error: result.error.issues[0]?.message ?? "Unable to create invoice."
      })
    );
  }

  let invoice;

  try {
    invoice = await createInvoice(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/invoices", {
        error:
          error instanceof Error ? error.message : "Unable to create invoice."
      })
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);
  revalidatePath(`/portal/projects/${invoice.projectId}`);

  redirect(
    buildRedirect("/invoices", {
      message: `${invoice.referenceNumber} was created successfully.`
    })
  );
}

export async function quickCreateInvoiceAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const estimateId = getFieldValue(formData, "estimateId");
  const jobId = getFieldValue(formData, "jobId");
  const changeOrderId = getFieldValue(formData, "changeOrderId");
  const workflowRole = getFieldValue(formData, "workflowRole");
  const result = parseInvoiceQuickCreateInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/invoices", {
        compose: "1",
        projectId,
        estimateId,
        jobId,
        changeOrderId,
        workflowRole,
        error: result.error.issues[0]?.message ?? "Unable to create invoice."
      })
    );
  }

  const issueDate = new Date();
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + 30);
  const estimate =
    result.success && result.data.estimateId
      ? await getEstimateById(result.data.estimateId, "/invoices")
      : null;
  if (result.success && result.data.jobId) {
    await getJobById(result.data.jobId, "/invoices");
  }

  let invoice;

  try {
    if (result.data.changeOrderId) {
      const changeOrderSource = await getChangeOrderById(
        result.data.changeOrderId,
        "/invoices"
      );

      if (
        !changeOrderSource ||
        changeOrderSource.projectId !== result.data.projectId
      ) {
        throw new Error(
          "Select an approved change order that belongs to the selected project."
        );
      }

      const changeOrder = await invoiceApprovedChangeOrderDirectly(
        result.data.changeOrderId
      );

      if (!changeOrder.invoiceId) {
        throw new Error(
          "The approved change order did not produce an invoice."
        );
      }

      invoice = {
        id: changeOrder.invoiceId,
        projectId: changeOrder.projectId,
        referenceNumber: changeOrder.invoice?.referenceNumber ?? "Invoice"
      };
    } else {
      invoice = await createInvoice({
        projectId: result.data.projectId,
        estimateId: result.data.estimateId,
        jobId:
          result.data.workflowRole === "deposit" ? null : result.data.jobId,
        workflowRole: result.data.workflowRole,
        status: "draft",
        issueDate: issueDate.toISOString().slice(0, 10),
        dueDate: dueDate.toISOString().slice(0, 10),
        discountAmount: estimate?.discountAmount ?? "0.00",
        notes: null,
        sourceConfiguration: null
      });
    }
  } catch (error) {
    redirect(
      buildRedirect("/invoices", {
        compose: "1",
        projectId,
        estimateId,
        jobId,
        changeOrderId,
        workflowRole,
        error:
          error instanceof Error ? error.message : "Unable to create invoice."
      })
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);
  revalidatePath(`/portal/projects/${invoice.projectId}`);

  redirect(
    buildRedirect(`/invoices/${invoice.id}/edit`, {
      message: `${invoice.referenceNumber} was created. Finish billing details in this workspace.`
    })
  );
}

export async function updateInvoiceAction(formData: FormData) {
  const invoiceId = getFieldValue(formData, "invoiceId");
  const result = parseInvoiceInput(formData);

  if (!invoiceId) {
    redirect(
      buildRedirect("/invoices", {
        error: "Invoice id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/invoices/${invoiceId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update invoice."
      })
    );
  }

  let invoice;

  try {
    // Invoice "send" is currently the canonical invoice status transition. Recipient
    // identity stays in People/portal access; this action must not manage portal access.
    invoice = await updateInvoice(invoiceId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/invoices/${invoiceId}`, {
        error:
          error instanceof Error ? error.message : "Unable to update invoice."
      })
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);
  revalidatePath(`/portal/projects/${invoice.projectId}`);

  redirect(
    buildRedirect(`/invoices/${invoice.id}/edit`, {
      message: `${invoice.referenceNumber} was updated successfully.`
    })
  );
}

export async function recordInvoicePaymentAction(formData: FormData) {
  const result = invoicePaymentInputSchema.safeParse({
    invoiceId: getFieldValue(formData, "invoiceId"),
    amount: getFieldValue(formData, "amount"),
    paymentDate: getFieldValue(formData, "paymentDate"),
    paymentMethod: getFieldValue(formData, "paymentMethod"),
    reference: getFieldValue(formData, "reference"),
    notes: getFieldValue(formData, "notes")
  });
  const invoiceId = getFieldValue(formData, "invoiceId");

  if (!result.success) {
    redirect(
      buildRedirect(`/invoices/${invoiceId || ""}`, {
        error: result.error.issues[0]?.message ?? "Unable to record payment."
      })
    );
  }

  let invoice;

  try {
    invoice = await recordInvoicePayment(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/invoices/${result.data.invoiceId}`, {
        error:
          error instanceof Error ? error.message : "Unable to record payment."
      })
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);
  revalidatePath(`/portal/projects/${invoice.projectId}`);

  redirect(
    buildRedirect(`/invoices/${invoice.id}`, {
      message: `${invoice.referenceNumber} payment was recorded successfully.`
    })
  );
}

export async function sendInvoiceReviewEmailAction(formData: FormData) {
  const invoiceId = getFieldValue(formData, "invoiceId");
  const result = invoiceEmailSendInputSchema.safeParse({
    invoiceId,
    portalUserId: getFieldValue(formData, "portalUserId")
  });

  if (!result.success) {
    redirect(
      buildRedirect(`/invoices/${invoiceId || ""}`, {
        error:
          result.error.issues[0]?.message ??
          "Unable to send invoice review/payment link."
      })
    );
  }

  let response;

  try {
    response = await sendInvoiceReviewEmail(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/invoices/${result.data.invoiceId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send invoice review/payment link."
      })
    );
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${response.invoice.id}`);
  revalidatePath(`/projects/${response.invoice.projectId}`);
  revalidatePath(`/portal/projects/${response.invoice.projectId}`);
  revalidatePath(`/portal/invoices/${response.invoice.id}`);

  redirect(
    buildRedirect(`/invoices/${response.invoice.id}`, {
      message: response.message
    })
  );
}

export async function requestPortalInvoicePaymentAction(formData: FormData) {
  const invoiceId = getFieldValue(formData, "invoiceId");
  const amount = getFieldValue(formData, "amount");
  const notes = getFieldValue(formData, "notes");

  if (!invoiceId) {
    redirect(
      buildRedirect("/portal", {
        error: "Invoice id is required to start payment."
      })
    );
  }

  const nextPath = `/portal/invoices/${invoiceId}`;
  const user = await requireAuthenticatedUser(nextPath);
  const result = invoiceCustomerPaymentRequestInputSchema.safeParse({
    actorType: "portal_user",
    actorUserId: null,
    portalUserId: user.id,
    invoiceId,
    amount,
    payerEmail: user.email ?? null,
    notes,
    occurredAt: new Date().toISOString(),
    payload: null
  });

  if (!result.success) {
    redirect(
      buildRedirect(nextPath, {
        error:
          result.error.issues[0]?.message ??
          "Unable to start payment for this invoice."
      })
    );
  }

  let invoice;
  let checkoutUrl = nextPath;

  try {
    await assertInvoiceOrganizationCanPerformProductionAction(
      result.data.invoiceId
    );
    invoice = await requestInvoicePayment(result.data, nextPath);
    const gateway = getPaymentGatewayAdapter();
    const pendingPayment = await ensurePendingPortalInvoicePayment(
      {
        actorType: "portal_user",
        actorUserId: null,
        portalUserId: user.id,
        invoiceId: invoice.id,
        amount: result.data.amount,
        gatewayProvider: gateway.provider,
        payerEmail: user.email ?? null,
        notes,
        occurredAt: result.data.occurredAt
      },
      nextPath
    );
    const checkoutSession = await gateway.createCheckoutSession({
      organizationId: invoice.organizationId,
      invoiceId: invoice.id,
      paymentId: pendingPayment.payment.id,
      referenceNumber: invoice.referenceNumber,
      workflowRole: invoice.workflowRole,
      amount: result.data.amount,
      currency: "usd",
      payerEmail: user.email ?? null,
      successUrl: buildAbsoluteAppUrl(nextPath, {
        message:
          "Checkout was submitted. Payment status will update here after provider confirmation."
      }),
      cancelUrl: buildAbsoluteAppUrl(nextPath, {
        message:
          "Checkout was not completed, so the invoice still needs payment."
      })
    });
    const checkoutStartResult = invoiceCheckoutStartInputSchema.safeParse({
      actorType: "portal_user",
      actorUserId: null,
      portalUserId: user.id,
      paymentId: pendingPayment.payment.id,
      invoiceId: invoice.id,
      amount: result.data.amount,
      gatewayProvider: checkoutSession.gatewayProvider,
      gatewayCheckoutSessionReference:
        checkoutSession.gatewayCheckoutSessionReference,
      gatewayPaymentIntentReference:
        checkoutSession.gatewayPaymentIntentReference,
      gatewayStatus: checkoutSession.gatewayStatus,
      payerEmail: user.email ?? null,
      occurredAt: result.data.occurredAt,
      payload: checkoutSession.payload
    });

    if (!checkoutStartResult.success) {
      throw new Error(
        checkoutStartResult.error.issues[0]?.message ??
          "Unable to attach the checkout session to the canonical payment."
      );
    }

    invoice = await startInvoiceCheckout(checkoutStartResult.data, nextPath);
    checkoutUrl = checkoutSession.checkoutUrl;
  } catch (error) {
    redirect(
      buildRedirect(nextPath, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start payment for this invoice."
      })
    );
  }

  revalidatePath(`/portal/invoices/${invoice.id}`);
  revalidatePath(`/portal/projects/${invoice.projectId}`);
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);

  redirect(checkoutUrl);
}
