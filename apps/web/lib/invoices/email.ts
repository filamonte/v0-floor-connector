type BuildInvoicePortalEmailInput = {
  recipientName: string | null;
  organizationName: string;
  invoiceReferenceNumber: string;
  projectName: string | null;
  amountDue: string;
  portalUrl: string;
};

type InvoicePortalEmailContent = {
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

export function buildInvoicePortalEmailContent(
  input: BuildInvoicePortalEmailInput
): InvoicePortalEmailContent {
  const recipientName = input.recipientName?.trim() || "there";
  const organizationName = input.organizationName.trim() || "your contractor";
  const invoiceReferenceNumber =
    input.invoiceReferenceNumber.trim() || "Invoice";
  const projectLine = input.projectName?.trim()
    ? `Project: ${input.projectName.trim()}`
    : null;

  return {
    subject: `${organizationName} shared invoice ${invoiceReferenceNumber}`,
    htmlBody: [
      `<p>Hi ${escapeHtml(recipientName)},</p>`,
      `<p>${escapeHtml(organizationName)} has shared invoice <strong>${escapeHtml(
        invoiceReferenceNumber
      )}</strong> with you in the FloorConnector customer portal.</p>`,
      projectLine ? `<p>${escapeHtml(projectLine)}</p>` : null,
      `<p>Amount due: ${escapeHtml(input.amountDue)}</p>`,
      `<p><a href="${escapeHtml(input.portalUrl)}">Review and pay the invoice</a></p>`,
      `<p>You will need to sign in before you can review the invoice or start secure checkout.</p>`
    ]
      .filter(Boolean)
      .join(""),
    textBody: [
      `Hi ${recipientName},`,
      "",
      `${organizationName} has shared invoice ${invoiceReferenceNumber} with you in the FloorConnector customer portal.`,
      projectLine,
      `Amount due: ${input.amountDue}`,
      "",
      "Review and pay the invoice here:",
      input.portalUrl,
      "",
      "You will need to sign in before you can review the invoice or start secure checkout."
    ]
      .filter(Boolean)
      .join("\n")
  };
}
