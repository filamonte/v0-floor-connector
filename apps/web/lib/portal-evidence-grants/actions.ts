"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  acknowledgePortalSharedEvidence,
  revokeExecutionAttachmentPortalShare,
  shareExecutionAttachmentToPortal
} from "./data";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function buildRedirect(
  path: string,
  params: Record<string, string | undefined>
) {
  const url = new URL(path, "http://floorconnector.local");

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return `${url.pathname}${url.search}`;
}

function appendHash(path: string, hash: string) {
  return `${path}#${hash}`;
}

export async function shareExecutionAttachmentToPortalAction(
  formData: FormData
) {
  const projectId = getFieldValue(formData, "projectId");
  const attachmentId = getFieldValue(formData, "attachmentId");
  const titleOverride = getFieldValue(formData, "titleOverride");
  const customerNote = getFieldValue(formData, "customerNote");
  const next = `/projects/${projectId}`;

  try {
    await shareExecutionAttachmentToPortal({
      projectId,
      attachmentId,
      titleOverride,
      customerNote,
      next
    });
  } catch (error) {
    redirect(
      appendHash(
        buildRedirect(next, {
          error:
            error instanceof Error
              ? error.message
              : "Unable to share the evidence to the portal."
        }),
        "portal-evidence-sharing"
      )
    );
  }

  revalidatePath(next);
  revalidatePath(`/portal/projects/${projectId}`);

  redirect(
    appendHash(
      buildRedirect(next, {
        message:
          "Evidence shared to the customer portal. Internal notes and unshared proof remain hidden."
      }),
      "portal-evidence-sharing"
    )
  );
}

export async function revokeExecutionAttachmentPortalShareAction(
  formData: FormData
) {
  const projectId = getFieldValue(formData, "projectId");
  const attachmentId = getFieldValue(formData, "attachmentId");
  const next = `/projects/${projectId}`;

  try {
    await revokeExecutionAttachmentPortalShare({
      projectId,
      attachmentId,
      next
    });
  } catch (error) {
    redirect(
      appendHash(
        buildRedirect(next, {
          error:
            error instanceof Error
              ? error.message
              : "Unable to revoke the portal evidence share."
        }),
        "portal-evidence-sharing"
      )
    );
  }

  revalidatePath(next);
  revalidatePath(`/portal/projects/${projectId}`);

  redirect(
    appendHash(
      buildRedirect(next, {
        message: "Evidence sharing revoked. The item is hidden from the portal."
      }),
      "portal-evidence-sharing"
    )
  );
}

export async function acknowledgePortalSharedEvidenceAction(
  formData: FormData
) {
  const projectId = getFieldValue(formData, "projectId");
  const grantId = getFieldValue(formData, "grantId");
  const next = `/portal/projects/${projectId}`;

  try {
    await acknowledgePortalSharedEvidence({
      projectId,
      grantId,
      next
    });
  } catch (error) {
    redirect(
      appendHash(
        buildRedirect(next, {
          error:
            error instanceof Error
              ? error.message
              : "Unable to acknowledge the shared evidence."
        }),
        "shared-project-evidence"
      )
    );
  }

  revalidatePath(next);
  revalidatePath(`/projects/${projectId}`);

  redirect(
    appendHash(
      buildRedirect(next, {
        message: "Shared evidence receipt acknowledged."
      }),
      "shared-project-evidence"
    )
  );
}
