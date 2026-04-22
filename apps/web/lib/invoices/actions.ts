"use server";

import { getPublicEnv } from "@floorconnector/config";
import { getPaymentGatewayAdapter } from "@floorconnector/integrations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/session";

import {
  createInvoice,
  ensurePendingPortalInvoicePayment,
  recordInvoicePayment,
  requestInvoicePayment,
  startInvoiceCheckout,
  updateInvoice
} from "./data";
import {
  invoiceCheckoutStartInputSchema,
  invoiceCustomerPaymentRequestInputSchema,
  invoiceInputSchema,
  invoicePaymentInputSchema,
  invoiceQuickCreateInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFieldValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => (typeof value === "string" ? value : ""));
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
  const lineItemNames = getFieldValues(formData, "lineItemName");
  const lineItemDescriptions = getFieldValues(formData, "lineItemDescription");
  const lineItemQuantities = getFieldValues(formData, "lineItemQuantity");
  const lineItemUnits = getFieldValues(formData, "lineItemUnit");
  const lineItemUnitPrices = getFieldValues(formData, "lineItemUnitPrice");

  const lineItems = lineItemNames
    .map((name, index) => ({
      name,
      description: lineItemDescriptions[index] ?? "",
      quantity: lineItemQuantities[index] ?? "",
      unit: lineItemUnits[index] ?? "",
      unitPrice: lineItemUnitPrices[index] ?? ""
    }))
    .filter((lineItem) =>
      Object.values(lineItem).some((value) => value.trim().length > 0)
    );

  return invoiceInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    estimateId: getFieldValue(formData, "estimateId"),
    jobId: getFieldValue(formData, "jobId"),
    workflowRole: getFieldValue(formData, "workflowRole"),
    status: getFieldValue(formData, "status"),
    issueDate: getFieldValue(formData, "issueDate"),
    dueDate: getFieldValue(formData, "dueDate"),
    discountAmount: getFieldValue(formData, "discountAmount"),
    lineItems,
    notes: getFieldValue(formData, "notes")
  });
}

function parseInvoiceQuickCreateInput(formData: FormData) {
  return invoiceQuickCreateInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    estimateId: getFieldValue(formData, "estimateId"),
    jobId: getFieldValue(formData, "jobId"),
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
        error: error instanceof Error ? error.message : "Unable to create invoice."
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
  const workflowRole = getFieldValue(formData, "workflowRole");
  const result = parseInvoiceQuickCreateInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/invoices", {
        compose: "1",
        projectId,
        estimateId,
        jobId,
        workflowRole,
        error: result.error.issues[0]?.message ?? "Unable to create invoice."
      })
    );
  }

  const issueDate = new Date();
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + 30);

  let invoice;

  try {
    invoice = await createInvoice({
      projectId: result.data.projectId,
      estimateId: result.data.estimateId,
      jobId: result.data.workflowRole === "deposit" ? null : result.data.jobId,
      workflowRole: result.data.workflowRole,
      status: "draft",
      issueDate: issueDate.toISOString().slice(0, 10),
      dueDate: dueDate.toISOString().slice(0, 10),
      discountAmount: "0.00",
      lineItems: [
        {
          name:
            result.data.workflowRole === "deposit"
              ? "Deposit line item"
              : "New invoice item",
          description: null,
          quantity: "1.00",
          unit: "each",
          unitPrice: "0.00"
        }
      ],
      notes: null
    });
  } catch (error) {
    redirect(
      buildRedirect("/invoices", {
        compose: "1",
        projectId,
        estimateId,
        jobId,
        workflowRole,
        error: error instanceof Error ? error.message : "Unable to create invoice."
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
    invoice = await updateInvoice(invoiceId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/invoices/${invoiceId}`, {
        error: error instanceof Error ? error.message : "Unable to update invoice."
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
        error: error instanceof Error ? error.message : "Unable to record payment."
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
        error: result.error.issues[0]?.message ?? "Unable to start payment for this invoice."
      })
    );
  }

  let invoice;
  let checkoutUrl = nextPath;

  try {
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
        message: "Checkout was not completed, so the invoice still needs payment."
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
          error instanceof Error ? error.message : "Unable to start payment for this invoice."
      })
    );
  }

  revalidatePath(`/portal/invoices/${invoice.id}`);
  revalidatePath(`/portal/projects/${invoice.projectId}`);
  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath(`/projects/${invoice.projectId}`);

  redirect(checkoutUrl);
}
