import type { DocumentSignerStatus } from "@floorconnector/types";

type BuildWarrantyDocumentReviewEmailContentInput = {
  recipientName: string | null;
  organizationName: string;
  warrantyTitle: string;
  customerName: string | null;
  projectName: string | null;
  reviewUrl: string;
};

export type WarrantyDocumentReviewEmailContent = {
  subject: string;
  htmlBody: string;
  textBody: string;
};

export type WarrantyDocumentEmailSignerEligibilityInput = {
  signerRole: "customer" | "contractor";
  signerStatus: DocumentSignerStatus;
  signerEmail: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function isWarrantyDocumentEmailSignerEligible(
  input: WarrantyDocumentEmailSignerEligibilityInput
) {
  return (
    input.signerRole === "customer" &&
    Boolean(input.signerEmail?.trim()) &&
    (input.signerStatus === "requested" || input.signerStatus === "viewed")
  );
}

export function buildWarrantyDocumentReviewEmailContent(
  input: BuildWarrantyDocumentReviewEmailContentInput
): WarrantyDocumentReviewEmailContent {
  const recipientName = input.recipientName?.trim() || "there";
  const organizationName = input.organizationName.trim() || "your contractor";
  const warrantyTitle = input.warrantyTitle.trim() || "Warranty document";
  const contextLines = [
    input.customerName?.trim()
      ? `Customer: ${input.customerName.trim()}`
      : null,
    input.projectName?.trim() ? `Project: ${input.projectName.trim()}` : null
  ].filter((value): value is string => Boolean(value));

  return {
    subject: `${organizationName} shared warranty document ${warrantyTitle}`,
    htmlBody: [
      `<p>Hi ${escapeHtml(recipientName)},</p>`,
      `<p>${escapeHtml(organizationName)} has shared <strong>${escapeHtml(
        warrantyTitle
      )}</strong> with you in the FloorConnector customer portal.</p>`,
      ...contextLines.map((line) => `<p>${escapeHtml(line)}</p>`),
      `<p><a href="${escapeHtml(input.reviewUrl)}">Review and sign the warranty document</a></p>`,
      `<p>You will need to sign in with this email address before you can sign or decline the warranty document.</p>`,
      `<p>If you were not expecting this, contact ${escapeHtml(organizationName)}.</p>`
    ].join(""),
    textBody: [
      `Hi ${recipientName},`,
      "",
      `${organizationName} has shared ${warrantyTitle} with you in the FloorConnector customer portal.`,
      ...contextLines,
      "",
      "Review and sign the warranty document here:",
      input.reviewUrl,
      "",
      "You will need to sign in with this email address before you can sign or decline the warranty document.",
      "",
      `If you were not expecting this, contact ${organizationName}.`
    ].join("\n")
  };
}
