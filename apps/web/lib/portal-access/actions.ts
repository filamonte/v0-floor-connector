"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createPortalAccessGrant,
  createPortalProjectAccess,
  findPortalUserByEmail,
  updatePortalAccessGrant,
  updatePortalProjectAccess
} from "./data";

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

function getPortalGrantStatus(formData: FormData) {
  const status = getFieldValue(formData, "status");

  return status === "active" || status === "revoked" ? status : "invited";
}

function getPortalProjectStatus(formData: FormData) {
  const status = getFieldValue(formData, "status");

  return status === "revoked" ? "revoked" : "active";
}

export async function createPortalAccessGrantAction(formData: FormData) {
  const customerId = getFieldValue(formData, "customerId");
  const portalUserEmail = getFieldValue(formData, "portalUserEmail").trim().toLowerCase();
  const status = getPortalGrantStatus(formData);

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

  let portalUser;

  try {
    portalUser = await findPortalUserByEmail(portalUserEmail);
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          error instanceof Error
            ? error.message
            : "Unable to resolve the portal user email."
      })
    );
  }

  if (!portalUser) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          "That email does not belong to an authenticated FloorConnector user yet. Have them sign in first, then grant portal access."
      })
    );
  }

  try {
    await createPortalAccessGrant({
      customerId,
      userId: portalUser.id,
      invitedEmail: portalUserEmail,
      status
    });
  } catch (error) {
    redirect(
      buildRedirect(getCustomerPath(customerId), {
        error:
          error instanceof Error ? error.message : "Unable to create portal access."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(getCustomerPath(customerId));
  revalidatePath("/portal");

  redirect(
    buildRedirect(getCustomerPath(customerId), {
      message: `Portal access for ${portalUserEmail} was created successfully.`
    })
  );
}

export async function updatePortalAccessGrantStatusAction(formData: FormData) {
  const portalAccessGrantId = getFieldValue(formData, "portalAccessGrantId");
  const customerId = getFieldValue(formData, "customerId");
  const userId = getFieldValue(formData, "userId");
  const invitedEmail = getFieldValue(formData, "invitedEmail").trim().toLowerCase();
  const status = getPortalGrantStatus(formData);

  if (!portalAccessGrantId || !customerId || !userId) {
    redirect(
      buildRedirect("/customers", {
        error: "Portal access update is missing required identifiers."
      })
    );
  }

  try {
    await updatePortalAccessGrant(portalAccessGrantId, {
      customerId,
      userId,
      invitedEmail,
      status
    });
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
  revalidatePath("/portal");

  redirect(
    buildRedirect(getCustomerPath(customerId), {
      message:
        status === "revoked"
          ? "Portal access was revoked."
          : "Portal access was updated."
    })
  );
}

export async function createPortalProjectAccessAction(formData: FormData) {
  const customerId = getFieldValue(formData, "customerId");
  const portalAccessGrantId = getFieldValue(formData, "portalAccessGrantId");
  const projectId = getFieldValue(formData, "projectId");

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
  revalidatePath("/portal");

  redirect(
    buildRedirect(getCustomerPath(customerId), {
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
  revalidatePath("/portal");

  redirect(
    buildRedirect(getCustomerPath(customerId), {
      message:
        status === "revoked"
          ? "Project portal visibility was revoked."
          : "Project portal visibility was reactivated."
    })
  );
}
