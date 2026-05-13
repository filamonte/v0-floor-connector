type BuildPortalInviteEmailContentInput = {
  contractorCompanyName: string;
  contactName: string | null;
  customerName: string | null;
  projectName: string | null;
  inviteUrl: string;
};

export type PortalInviteEmailContent = {
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

export function buildPortalInviteEmailContent(
  input: BuildPortalInviteEmailContentInput
): PortalInviteEmailContent {
  const contactName = input.contactName?.trim() || "there";
  const contractorCompanyName = input.contractorCompanyName.trim() || "your contractor";
  const customerName = input.customerName?.trim() || "your customer account";
  const projectName = input.projectName?.trim() || "your project";

  return {
    subject: "You've been invited to view your project",
    htmlBody: [
      `<p>Hi ${escapeHtml(contactName)},</p>`,
      `<p>${escapeHtml(
        contractorCompanyName
      )} invited you to the FloorConnector customer portal for <strong>${escapeHtml(
        projectName
      )}</strong>.</p>`,
      `<p>This invite is connected to ${escapeHtml(
        customerName
      )}. You can create an account or sign in to review shared projects, contracts, invoices, and payments.</p>`,
      `<p><a href="${escapeHtml(input.inviteUrl)}">Open your portal invite</a></p>`,
      `<p>Use this invite with the email address it was sent to. Portal access is limited to the projects shared by ${escapeHtml(
        contractorCompanyName
      )}.</p>`,
      `<p>If you were not expecting this, contact the contractor.</p>`
    ].join(""),
    textBody: [
      `Hi ${contactName},`,
      "",
      `${contractorCompanyName} invited you to the FloorConnector customer portal for ${projectName}.`,
      "",
      `This invite is connected to ${customerName}. You can create an account or sign in to review shared projects, contracts, invoices, and payments.`,
      "",
      "Open your portal invite:",
      input.inviteUrl,
      "",
      "Use this invite with the email address it was sent to. Portal access is limited to the projects shared by the contractor.",
      "",
      "If you were not expecting this, contact the contractor."
    ].join("\n")
  };
}
