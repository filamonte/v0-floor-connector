type BuildContractPortalEmailContentInput = {
  recipientName: string | null;
  organizationName: string;
  contractReferenceNumber: string;
  contractTitle: string | null;
  projectName: string | null;
  portalUrl: string;
};

type ContractPortalEmailContent = {
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

export function buildContractPortalEmailContent(
  input: BuildContractPortalEmailContentInput
): ContractPortalEmailContent {
  const recipientName = input.recipientName?.trim() || "there";
  const organizationName = input.organizationName.trim() || "your contractor";
  const contractReferenceNumber =
    input.contractReferenceNumber.trim() || "Contract";
  const contractLabel = input.contractTitle?.trim() || contractReferenceNumber;
  const projectLine = input.projectName?.trim()
    ? `Project: ${input.projectName.trim()}`
    : null;

  return {
    subject: `${organizationName} shared contract ${contractReferenceNumber}`,
    htmlBody: [
      `<p>Hi ${escapeHtml(recipientName)},</p>`,
      `<p>${escapeHtml(organizationName)} has shared contract <strong>${escapeHtml(
        contractLabel
      )}</strong> with you in the FloorConnector customer portal.</p>`,
      projectLine ? `<p>${escapeHtml(projectLine)}</p>` : null,
      `<p><a href="${escapeHtml(input.portalUrl)}">Review and sign the contract</a></p>`,
      `<p>You will need to sign in with this email address before you can review, sign, or decline the contract.</p>`,
      `<p>If you were not expecting this, contact ${escapeHtml(organizationName)}.</p>`
    ]
      .filter(Boolean)
      .join(""),
    textBody: [
      `Hi ${recipientName},`,
      "",
      `${organizationName} has shared contract ${contractLabel} with you in the FloorConnector customer portal.`,
      projectLine,
      "",
      "Review and sign the contract here:",
      input.portalUrl,
      "",
      "You will need to sign in with this email address before you can review, sign, or decline the contract.",
      "",
      `If you were not expecting this, contact ${organizationName}.`
    ]
      .filter(Boolean)
      .join("\n")
  };
}
