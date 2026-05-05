"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  acceptPortalInvite,
  createPortalInvite,
  updateCustomerContactPortalPermission,
  createPortalProjectAccess,
  updatePortalAccessGrant,
  updatePortalAccessGrantStatus,
  updatePortalProjectAccess
} from "./data";
import {
  customerContactPortalPermissionInputSchema,
  portalInviteInputSchema
} from "./schemas";
import { getRequestOrigin } from "@/lib/auth/urls";

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

function getCustomerPath(customerId: string) {
  return `/customers/${customerId}`;
}

function getManagementPath(formData: FormData, customerId: string) {
  const returnTo = getFieldValue(formData, "returnTo");

  if (returnTo.startsWith("/people") || returnTo === getCustomerPath(customerId)) {
    return returnTo;
  }

  return getCustomerPath(customerId);
}

function getPortalGrantStatus(formData: FormData) {
  const status = getFieldValue(formData, "status");

  return status === "active" || status === "revoked" ? status : "invited";
}

function getOptionalCustomerContactId(formData: FormData) {
  const value = getFieldValue(formData, "customerContactId").trim();

  return value.length > 0 ? value : null;
}

function getPortalProjectStatus(formData: FormData) {
  const status = getFieldValue(formData, "status");

  return status === "revoked" ? "revoked" : "active";
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export async function createPortalAccessGrantAction(formData: FormData) {
  const customerId = getFieldValue(formData, "customerId");
  const customerContactId = getOptionalCustomerContactId(formData);
  const portalUserEmail = getFieldValue(formData, "portalUserEmail").trim().toLowerCase();
  const projectId = getFieldValue(formData, "projectId");
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";

  if (!customerId) {
    redirect(
      buildRedirect("/customers", {
        error: "Customer id is required for portal access management."
      })
    );
  }

  if (!portalUserEmail) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error: "Portal user email is required."
      })
    );
  }

  const parsedInvite = portalInviteInputSchema.safeParse({
    customerId,
    customerContactId,
    projectId,
    invitedEmail: portalUserEmail
  });

  if (!parsedInvite.success) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error: parsedInvite.error.issues[0]?.message ?? "Unable to create portal invite."
      })
    );
  }

  let inviteResult;
  try {
    inviteResult = await createPortalInvite(parsedInvite.data);
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          error instanceof Error ? error.message : "Unable to create portal invite."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/portal");

  const requestHeaders = await headers();
  const origin = getRequestOrigin(requestHeaders);
  const inviteUrl = inviteResult.inviteToken
    ? `${origin}/portal/invite?token=${encodeURIComponent(inviteResult.inviteToken)}`
    : undefined;

  redirect(
    buildRedirect(managementPath, {
      message: inviteResult.reusedExistingGrant
        ? inviteResult.activatedImmediately
          ? `Sent to ${portalUserEmail}. Portal access already active and scoped to the selected project.`
          : `A pending portal invite already exists for ${portalUserEmail}. Revoke it and create a fresh invite if the original link is no longer available.`
        : inviteResult.activatedImmediately
          ? `Sent to ${portalUserEmail}. Portal access granted for the selected project.`
          : `Sent to ${portalUserEmail}. Portal invite was created; copy the invite link from this page.`,
      inviteUrl,
      inviteEmail: inviteResult.invitedEmail
    })
  );
}

export async function updatePortalAccessGrantStatusAction(formData: FormData) {
  const portalAccessGrantId = getFieldValue(formData, "portalAccessGrantId");
  const customerId = getFieldValue(formData, "customerId");
  const customerContactId = getOptionalCustomerContactId(formData);
  const userId = getFieldValue(formData, "userId");
  const invitedEmail = getFieldValue(formData, "invitedEmail").trim().toLowerCase();
  const status = getPortalGrantStatus(formData);
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";

  if (!portalAccessGrantId || !customerId) {
    redirect(
      buildRedirect("/customers", {
        error: "Portal access update is missing required identifiers."
      })
    );
  }

  try {
    if (userId) {
      await updatePortalAccessGrant(portalAccessGrantId, {
        customerId,
        customerContactId,
        userId,
        invitedEmail,
        status
      });
    } else {
      if (status === "active") {
        throw new Error(
          "Pending invites cannot be activated by a contractor. The invited customer must accept the portal invite."
        );
      }

      await updatePortalAccessGrantStatus(portalAccessGrantId, status);
    }
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          error instanceof Error ? error.message : "Unable to update portal access."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/portal");

  redirect(
    buildRedirect(managementPath, {
      message:
        status === "revoked"
          ? "Portal access was revoked."
          : "Portal access was updated."
    })
  );
}

export async function updatePortalAccessGrantLinkAction(formData: FormData) {
  const portalAccessGrantId = getFieldValue(formData, "portalAccessGrantId");
  const customerId = getFieldValue(formData, "customerId");
  const customerContactId = getOptionalCustomerContactId(formData);
  const userId = getFieldValue(formData, "userId");
  const invitedEmail = getFieldValue(formData, "invitedEmail").trim().toLowerCase();
  const status = getPortalGrantStatus(formData);
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";

  if (!portalAccessGrantId || !customerId || !userId) {
    redirect(
      buildRedirect("/customers", {
        error: "Portal access link update is missing required identifiers."
      })
    );
  }

  try {
    await updatePortalAccessGrant(portalAccessGrantId, {
      customerId,
      customerContactId,
      userId,
      invitedEmail,
      status
    });
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the related customer contact for portal access."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/directory");
  revalidatePath("/portal");

  redirect(
    buildRedirect(managementPath, {
      message: customerContactId
        ? "Portal access was linked to the selected customer contact."
        : "Portal access now remains a customer-level grant."
    })
  );
}

export async function createPortalProjectAccessAction(formData: FormData) {
  const customerId = getFieldValue(formData, "customerId");
  const portalAccessGrantId = getFieldValue(formData, "portalAccessGrantId");
  const projectId = getFieldValue(formData, "projectId");
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";

  if (!customerId || !portalAccessGrantId || !projectId) {
    redirect(
      buildRedirect("/customers", {
        error: "Portal project visibility is missing required identifiers."
      })
    );
  }

  try {
    await createPortalProjectAccess({
      portalAccessGrantId,
      projectId,
      status: "active"
    });
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          error instanceof Error
            ? error.message
            : "Unable to assign project portal visibility."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/portal");

  redirect(
    buildRedirect(managementPath, {
      message: "Project portal visibility was added."
    })
  );
}

export async function updatePortalProjectAccessStatusAction(formData: FormData) {
  const portalProjectAccessId = getFieldValue(formData, "portalProjectAccessId");
  const customerId = getFieldValue(formData, "customerId");
  const portalAccessGrantId = getFieldValue(formData, "portalAccessGrantId");
  const projectId = getFieldValue(formData, "projectId");
  const status = getPortalProjectStatus(formData);
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";

  if (!portalProjectAccessId || !customerId || !portalAccessGrantId || !projectId) {
    redirect(
      buildRedirect("/customers", {
        error: "Portal project visibility update is missing required identifiers."
      })
    );
  }

  try {
    await updatePortalProjectAccess(portalProjectAccessId, {
      portalAccessGrantId,
      projectId,
      status
    });
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update project portal visibility."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/portal");

  redirect(
    buildRedirect(managementPath, {
      message:
        status === "revoked"
          ? "Project portal visibility was revoked."
          : "Project portal visibility was reactivated."
    })
  );
}

export async function updateCustomerContactPortalPermissionAction(formData: FormData) {
  const portalAccessGrantId = getFieldValue(formData, "portalAccessGrantId");
  const customerId = getFieldValue(formData, "customerId");
  const customerContactId = getFieldValue(formData, "customerContactId");
  const managementPath = customerId ? getManagementPath(formData, customerId) : "/customers";

  const result = customerContactPortalPermissionInputSchema.safeParse({
    portalAccessGrantId,
    customerContactId,
    canViewEstimates: getCheckboxValue(formData, "canViewEstimates"),
    canApproveEstimates: getCheckboxValue(formData, "canApproveEstimates"),
    canSignContracts: getCheckboxValue(formData, "canSignContracts"),
    canApproveChangeOrders: getCheckboxValue(formData, "canApproveChangeOrders"),
    canViewPayInvoices: getCheckboxValue(formData, "canViewPayInvoices"),
    canRequestQuotes: getCheckboxValue(formData, "canRequestQuotes")
  });

  if (!result.success) {
    redirect(
      buildRedirect(getCustomerPath(customerId || ""), {
        error:
          result.error.issues[0]?.message ??
          "Unable to update stored portal permissions."
      })
    );
  }

  try {
    await updateCustomerContactPortalPermission(result.data);
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update stored portal permissions."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(customerId));
  revalidatePath(managementPath);
  revalidatePath("/people");
  revalidatePath("/directory");
  revalidatePath("/portal");

  redirect(
    buildRedirect(managementPath, {
      message: "Stored portal permissions were updated."
    })
  );
}

export async function acceptPortalInviteAction(formData: FormData) {
  const token = getFieldValue(formData, "token");

  if (!token) {
    redirect(
      buildRedirect("/portal/invite", {
        error: "Portal invite token is missing."
      })
    );
  }

  let result;

  try {
    result = await acceptPortalInvite(token);
  } catch (error) {
    redirect(
      buildRedirect(`/portal/invite`, {
        token,
        error:
          error instanceof Error ? error.message : "Unable to accept portal invite."
      })
    );
  }

  revalidatePath("/portal");

  if (!result.accepted || !result.projectId) {
    redirect(
      buildRedirect(`/portal/invite`, {
        token,
        error: result.message
      })
    );
  }

  redirect(
    buildRedirect(`/portal/projects/${result.projectId}`, {
      message: result.message
    })
  );
}
