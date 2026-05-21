type BuildEstimatePortalEmailInput = {
  recipientName: string | null;
  organizationName: string;
  estimateReferenceNumber: string;
  estimateTitle: string | null;
  projectName: string | null;
  trackedPortalLink: string;
  trackedOpenPixelUrl: string;
};

type EstimatePortalEmailContent = {
  subject: string;
  htmlBody: string;
  textBody: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildEstimatePortalEmailContent(
  input: BuildEstimatePortalEmailInput
): EstimatePortalEmailContent {
  const estimateLabel =
    input.estimateTitle?.trim() || input.estimateReferenceNumber;
  const customerName = input.recipientName?.trim() || "there";
  const projectLine = input.projectName?.trim()
    ? `Project: ${escapeHtml(input.projectName.trim())}`
    : null;

  return {
    subject: `${input.organizationName} shared estimate ${input.estimateReferenceNumber}`,
    htmlBody: [
      `<p>Hi ${escapeHtml(customerName)},</p>`,
      `<p>${escapeHtml(input.organizationName)} has shared estimate <strong>${escapeHtml(
        estimateLabel
      )}</strong> with you in the FloorConnector customer portal.</p>`,
      projectLine ? `<p>${projectLine}</p>` : null,
      `<p><a href="${input.trackedPortalLink}">Review the estimate in the customer portal</a></p>`,
      `<p>You will need to sign in before you can approve, reject, or comment on the estimate.</p>`,
      `<img src="${input.trackedOpenPixelUrl}" alt="" width="1" height="1" style="display:block;border:0;outline:none;text-decoration:none;" />`
    ]
      .filter(Boolean)
      .join(""),
    textBody: [
      `Hi ${customerName},`,
      "",
      `${input.organizationName} has shared estimate ${estimateLabel} with you in the FloorConnector customer portal.`,
      input.projectName?.trim() ? `Project: ${input.projectName.trim()}` : null,
      "",
      "Review the estimate here:",
      input.trackedPortalLink,
      "",
      "You will need to sign in before you can approve, reject, or comment on the estimate."
    ]
      .filter(Boolean)
      .join("\n")
  };
}
